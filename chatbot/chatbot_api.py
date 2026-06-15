"""
FastAPI router for the AI chatbot endpoints.
Fully isolated — does not touch any existing prediction logic.
Optimised pipeline: intent → keywords → minimal prompt → cached LLM → TTS.
"""

from __future__ import annotations

import base64
import logging
import time
import uuid
from collections import OrderedDict
from typing import Any

from fastapi import APIRouter, File, HTTPException, UploadFile
from pydantic import BaseModel, Field

from .knowledge_base import retrieve_context
from .language_detection import detect_language
from .llm_service import (
    check_ollama_status,
    extract_keywords,
    generate_response,
    shutdown_client,
)
from .speech_service import text_to_speech, transcribe_audio

logger = logging.getLogger("chatbot.api")

# ---------------------------------------------------------------------------
# Intent detection — routes messages before they ever reach the LLM
# ---------------------------------------------------------------------------

_GREETING_WORDS = {
    "hi", "hello", "hey", "hii", "hiii", "helo",
    "good morning", "good afternoon", "good evening", "good night",
    "namaste", "namaskar", "नमस्ते", "नमस्कार",
}
_THANKS_WORDS = {"thanks", "thank you", "thankyou", "ty", "धन्यवाद"}
_FAREWELL_WORDS = {"bye", "goodbye", "good bye", "see you", "ok", "okay", "alright"}

_DISEASE_WORDS = {
    "glaucoma", "cataract", "retinopathy", "macular", "myopia",
    "retinal detachment", "dry eye", "hypertensive",
    "मोतियाबिंद", "मोतीबिंदू", "काचबिंदू", "ग्लूकोमा",
    "डायबिटिक", "मैक्युलर", "मायोपिया", "रेटिनल",
}
_SYMPTOM_WORDS = {
    "symptom", "symptoms", "sign", "signs", "blurry", "blur",
    "pain", "redness", "floaters", "flashes", "vision loss",
    "itching", "burning", "dry", "watery", "swelling",
    "लक्षण", "दर्द", "धुंधला", "लक्षणे",
}
_PREVENTION_WORDS = {
    "prevent", "prevention", "avoid", "protect", "care", "tips",
    "diet", "exercise", "रोकथाम", "बचाव", "प्रतिबंध", "काळजी",
}
_TREATMENT_WORDS = {
    "treatment", "treat", "cure", "surgery", "medicine", "drops",
    "laser", "operation", "इलाज", "उपचार", "दवा", "औषध",
}


def detect_intent(message: str) -> str:
    """
    Classify user message into one of:
      greeting, thanks, farewell,
      disease_question, symptom_question, prevention_question,
      treatment_question, general_question
    """
    norm = message.lower().strip().rstrip("!.,?")

    if norm in _GREETING_WORDS:
        return "greeting"
    if norm in _THANKS_WORDS:
        return "thanks"
    if norm in _FAREWELL_WORDS:
        return "farewell"

    words = set(norm.split())

    if words & _TREATMENT_WORDS:
        return "treatment_question"
    if words & _SYMPTOM_WORDS:
        return "symptom_question"
    if words & _PREVENTION_WORDS:
        return "prevention_question"
    if words & _DISEASE_WORDS or any(dw in norm for dw in _DISEASE_WORDS):
        return "disease_question"

    return "general_question"


_INSTANT_RESPONSES: dict[str, dict[str, str]] = {
    "greeting": {
        "en": "Hello! I'm your AI Eye Health Assistant. How can I help you today?",
        "hi": "नमस्ते! मैं आपका AI नेत्र स्वास्थ्य सहायक हूँ। आज मैं आपकी कैसे मदद कर सकता हूँ?",
        "mr": "नमस्कार! मी तुमचा AI नेत्र आरोग्य सहाय्यक आहे. आज मी तुम्हाला कशी मदत करू शकतो?",
    },
    "thanks": {
        "en": (
            "You're welcome! Feel free to ask more about your eye health.\n\n"
            "Remember to consult a qualified ophthalmologist for professional advice."
        ),
        "hi": (
            "आपका स्वागत है! आँखों के स्वास्थ्य के बारे में और पूछें।\n\n"
            "कृपया पेशेवर सलाह के लिए नेत्र रोग विशेषज्ञ से मिलें।"
        ),
        "mr": (
            "तुमचे स्वागत आहे! डोळ्यांच्या आरोग्याबद्दल आणखी विचारा.\n\n"
            "कृपया व्यावसायिक सल्ल्यासाठी नेत्रतज्ञांचा सल्ला घ्या."
        ),
    },
    "farewell": {
        "en": "Goodbye! Take care of your eyes. Consult an ophthalmologist if you have concerns.",
        "hi": "अलविदा! अपनी आँखों का ख्याल रखें। किसी भी चिंता के लिए नेत्र रोग विशेषज्ञ से मिलें।",
        "mr": "निरोप! तुमच्या डोळ्यांची काळजी घ्या. कोणत्याही चिंतेसाठी नेत्रतज्ञांना भेटा.",
    },
}

_INTENT_TO_SECTIONS: dict[str, list[str]] = {
    "symptom_question": ["symptoms"],
    "prevention_question": ["prevention"],
    "treatment_question": ["treatment_advice"],
    "disease_question": ["symptoms", "causes", "treatment_advice"],
    "general_question": ["symptoms", "treatment_advice"],
}

router = APIRouter(prefix="/chatbot", tags=["chatbot"])

# ---- In-memory session store (bounded LRU) ----
MAX_SESSIONS = 200
MAX_HISTORY_PER_SESSION = 20

_sessions: OrderedDict[str, list[dict]] = OrderedDict()
_patient_info: dict[str, dict] = {}


def _get_history(session_id: str) -> list[dict]:
    if session_id in _sessions:
        _sessions.move_to_end(session_id)
        return _sessions[session_id]
    return []


def _append_turn(session_id: str, role: str, text: str, language: str) -> None:
    if session_id not in _sessions:
        if len(_sessions) >= MAX_SESSIONS:
            oldest = _sessions.popitem(last=False)
            _patient_info.pop(oldest[0], None)
        _sessions[session_id] = []
    _sessions.move_to_end(session_id)
    history = _sessions[session_id]
    history.append({"role": role, "text": text, "language": language})
    if len(history) > MAX_HISTORY_PER_SESSION:
        _sessions[session_id] = history[-MAX_HISTORY_PER_SESSION:]


# ---- Request / Response schemas ----

class StartSessionRequest(BaseModel):
    patient_name: str = Field(..., min_length=1, max_length=100)
    age: int = Field(..., ge=0, le=150)
    symptoms: str = Field(default="", max_length=1000)


class ChatRequest(BaseModel):
    message: str
    language: str | None = None
    session_id: str | None = None


class TTSRequest(BaseModel):
    text: str
    language: str = "en"


# ---- Endpoints ----

@router.post("/start_session")
async def start_session(req: StartSessionRequest) -> dict[str, Any]:
    """
    Start a new chatbot session with patient details.
    Returns a greeting and a session_id for subsequent requests.
    """
    session_id = str(uuid.uuid4())

    _patient_info[session_id] = {
        "patient_name": req.patient_name.strip(),
        "age": req.age,
        "symptoms": req.symptoms.strip() if req.symptoms else "",
    }

    if len(_sessions) >= MAX_SESSIONS:
        oldest = _sessions.popitem(last=False)
        _patient_info.pop(oldest[0], None)
    _sessions[session_id] = []

    greeting = (
        f"Hello {req.patient_name.strip()}, I am your AI Eye Health Assistant.\n"
        "How can I help you understand your eye condition today?"
    )

    _append_turn(session_id, "assistant", greeting, "en")

    logger.info(
        "New session started: session_id=%s, patient=%s, age=%d",
        session_id, req.patient_name.strip(), req.age,
    )

    return {
        "status": "success",
        "session_id": session_id,
        "greeting": greeting,
        "patient_name": req.patient_name.strip(),
    }


@router.post("/chat")
async def chat(req: ChatRequest) -> dict[str, Any]:
    """Intent-routed chat: fast-path for greetings, optimised keyword+RAG+LLM for questions."""
    request_start = time.perf_counter()

    if not req.message or not req.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty.")

    user_message = req.message.strip()
    session_id = req.session_id or str(uuid.uuid4())
    language = req.language or detect_language(user_message)

    intent = detect_intent(user_message)
    logger.info("Intent: %s | Language: %s", intent, language)

    _append_turn(session_id, "user", user_message, language)

    # --- Fast-path: instant response for greetings / thanks / farewell ---
    if intent in _INSTANT_RESPONSES:
        reply = _INSTANT_RESPONSES[intent].get(language, _INSTANT_RESPONSES[intent]["en"])
        _append_turn(session_id, "assistant", reply, language)
        elapsed = round((time.perf_counter() - request_start) * 1000, 1)
        logger.info("Fast-path (%s) responded in %.1f ms", intent, elapsed)
        return {
            "status": "success",
            "response": reply,
            "language": language,
            "session_id": session_id,
        }

    # --- Full pipeline: keywords → filtered RAG → compressed Ollama LLM ---
    keywords = extract_keywords(user_message)
    sections = _INTENT_TO_SECTIONS.get(intent, ["symptoms", "treatment_advice"])
    context = retrieve_context(user_message, top_k=2, sections=sections)
    history = _get_history(session_id)
    patient_info = _patient_info.get(session_id)

    llm_start = time.perf_counter()
    try:
        response_text = await generate_response(
            user_message, context, language, history, patient_info
        )
    except Exception as exc:
        logger.exception("LLM generation failed: %s", exc)
        response_text = (
            "I'm sorry, something went wrong while generating a response. "
            "Please try again.\n\n"
            "_This AI assistant provides educational information and does not "
            "replace professional medical consultation._"
        )
    llm_elapsed = round((time.perf_counter() - llm_start) * 1000, 1)

    _append_turn(session_id, "assistant", response_text, language)

    total_elapsed = round((time.perf_counter() - request_start) * 1000, 1)
    logger.info(
        "Chat pipeline | keywords=%s | LLM=%.1fms | total=%.1fms",
        keywords[:60], llm_elapsed, total_elapsed,
    )

    return {
        "status": "success",
        "response": response_text,
        "language": language,
        "session_id": session_id,
    }


@router.post("/speech-to-text")
async def speech_to_text_endpoint(file: UploadFile = File(...)) -> dict[str, Any]:
    """Transcribe audio to text using faster-whisper."""
    content_type = file.content_type or ""
    valid_types = ("audio", "webm", "ogg", "wav", "mp3", "mpeg", "mp4", "x-wav")
    if not any(t in content_type for t in valid_types):
        raise HTTPException(status_code=400, detail="Only audio files are accepted.")

    audio_bytes = await file.read()
    if not audio_bytes:
        raise HTTPException(status_code=400, detail="Audio file is empty.")
    if len(audio_bytes) > 25 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="Audio file exceeds 25 MB limit.")

    stt_start = time.perf_counter()
    try:
        result = await transcribe_audio(audio_bytes)
        stt_elapsed = round((time.perf_counter() - stt_start) * 1000, 1)
        logger.info("STT response time: %.1f ms", stt_elapsed)
        return {
            "status": "success",
            "text": result["text"],
            "language": result["language"],
        }
    except Exception as exc:
        logger.exception("Speech-to-text failed: %s", exc)
        raise HTTPException(status_code=500, detail="Speech recognition failed.")


@router.post("/text-to-speech")
async def tts(req: TTSRequest) -> dict[str, Any]:
    """Convert text to speech, return base64-encoded MP3. Never crashes — returns text-only on failure."""
    if not req.text or not req.text.strip():
        raise HTTPException(status_code=400, detail="Text cannot be empty.")

    tts_start = time.perf_counter()
    try:
        audio_bytes = await text_to_speech(req.text.strip(), req.language)
        tts_elapsed = round((time.perf_counter() - tts_start) * 1000, 1)
        logger.info("TTS response time: %.1f ms", tts_elapsed)
        return {
            "status": "success",
            "audio": base64.b64encode(audio_bytes).decode("utf-8"),
            "content_type": "audio/mpeg",
        }
    except Exception as exc:
        tts_elapsed = round((time.perf_counter() - tts_start) * 1000, 1)
        logger.error("TTS failed after %.1f ms: %s — returning text-only response", tts_elapsed, exc)
        return {
            "status": "success",
            "audio": None,
            "content_type": None,
            "tts_failed": True,
            "message": "Voice generation unavailable. Text response delivered successfully.",
        }


@router.get("/health")
async def chatbot_health() -> dict[str, Any]:
    """Chatbot module health check — includes Ollama connectivity."""
    ollama = await check_ollama_status()
    return {
        "status": "ok" if ollama["ollama_reachable"] else "degraded",
        "module": "chatbot",
        "active_sessions": len(_sessions),
        "ollama": ollama,
    }
