"""
Ollama LLM integration using phi3:mini exclusively.
Optimised for sub-3-second response times with keyword extraction,
response caching, and ultra-short prompts.
"""

from __future__ import annotations

import hashlib
import logging
import re
import time
from collections import OrderedDict
from typing import Any

import httpx

logger = logging.getLogger("chatbot.llm")

OLLAMA_BASE_URL = "http://localhost:11434"
OLLAMA_GENERATE = f"{OLLAMA_BASE_URL}/api/generate"
OLLAMA_TAGS = f"{OLLAMA_BASE_URL}/api/tags"

MODEL_NAME = "phi3:mini"

_client: httpx.AsyncClient | None = None

_ollama_available: bool | None = None
_ollama_check_ts: float = 0.0
_OLLAMA_CHECK_TTL = 30.0

LLM_READ_TIMEOUT = 6.0

SYSTEM_PROMPT = (
    "You are a helpful ophthalmology assistant. Answer briefly in 2 sentences max. "
    "Use simple language. Never prescribe medication. Recommend consulting an ophthalmologist."
)

DISCLAIMER = {
    "en": "\n\n_This AI assistant provides educational information and does not replace professional medical consultation._",
    "hi": "\n\n_यह AI सहायक केवल शैक्षिक जानकारी प्रदान करता है और पेशेवर चिकित्सा परामर्श का विकल्प नहीं है।_",
    "mr": "\n\n_हा AI सहाय्यक केवळ शैक्षणिक माहिती प्रदान करतो आणि व्यावसायिक वैद्यकीय सल्ल्याची जागा घेत नाही._",
}

# ---------------------------------------------------------------------------
# Keyword extraction
# ---------------------------------------------------------------------------

_STOP_WORDS = frozenset({
    "i", "me", "my", "am", "is", "are", "was", "were", "be", "been",
    "being", "have", "has", "had", "do", "does", "did", "will", "would",
    "shall", "should", "may", "might", "can", "could", "a", "an", "the",
    "and", "but", "or", "nor", "not", "so", "yet", "to", "of", "in",
    "for", "on", "with", "at", "by", "from", "as", "into", "about",
    "between", "through", "during", "before", "after", "above", "below",
    "up", "down", "out", "off", "over", "under", "again", "then", "once",
    "here", "there", "when", "where", "why", "how", "all", "each", "every",
    "both", "few", "more", "most", "other", "some", "such", "no", "only",
    "own", "same", "than", "too", "very", "just", "because", "if", "while",
    "that", "this", "these", "those", "it", "its", "he", "she", "we", "they",
    "them", "their", "what", "which", "who", "whom", "her", "him", "his",
    "you", "your", "our", "also", "tell", "please", "want", "know", "like",
    "get", "got", "going", "go", "really", "much", "many", "make", "think",
    "help", "need", "take", "give", "let", "something", "anything", "thing",
    "recently", "already", "still", "quite", "left", "right",
})

_MEDICAL_BOOST = frozenset({
    "glaucoma", "cataract", "retinopathy", "diabetic", "macular",
    "degeneration", "myopia", "hypertension", "hypertensive", "retinal",
    "detachment", "dry", "eye", "eyes", "vision", "sight", "blind",
    "blindness", "optic", "nerve", "cornea", "lens", "retina", "macula",
    "floaters", "flashes", "blurry", "blur", "pain", "redness",
    "itching", "burning", "watery", "swelling", "pressure",
    "symptom", "symptoms", "treatment", "surgery", "laser", "drops",
    "prevention", "cause", "causes", "cure", "diagnosis", "risk",
    "screening", "fundus", "pupil", "iris", "sclera",
})


def extract_keywords(message: str) -> str:
    """
    Extract medically-relevant keywords from the user message.
    Removes stop words, keeps disease names and medical terms.
    """
    cleaned = re.sub(r"[^\w\s\u0900-\u097F]", " ", message.lower())
    words = cleaned.split()

    keywords: list[str] = []
    for w in words:
        if w in _STOP_WORDS:
            continue
        if w in _MEDICAL_BOOST or len(w) > 3:
            keywords.append(w)

    result = " ".join(keywords) if keywords else message.strip()
    logger.info("Keywords: %s", result)
    return result


# ---------------------------------------------------------------------------
# Response cache (in-memory LRU)
# ---------------------------------------------------------------------------

_RESPONSE_CACHE_MAX = 256
_response_cache: OrderedDict[str, str] = OrderedDict()


def _cache_key(message: str, language: str) -> str:
    """Hash the normalised message + language into a compact cache key."""
    norm = re.sub(r"\s+", " ", message.lower().strip())
    raw = f"{norm}|{language}"
    return hashlib.md5(raw.encode()).hexdigest()


def _cache_get(key: str) -> str | None:
    if key in _response_cache:
        _response_cache.move_to_end(key)
        return _response_cache[key]
    return None


def _cache_put(key: str, value: str) -> None:
    if len(_response_cache) >= _RESPONSE_CACHE_MAX:
        _response_cache.popitem(last=False)
    _response_cache[key] = value


# ---------------------------------------------------------------------------
# HTTP client
# ---------------------------------------------------------------------------

async def _get_client() -> httpx.AsyncClient:
    global _client
    if _client is None or _client.is_closed:
        _client = httpx.AsyncClient(
            timeout=httpx.Timeout(connect=2.0, read=LLM_READ_TIMEOUT, write=3.0, pool=2.0),
            limits=httpx.Limits(max_connections=10, max_keepalive_connections=4),
        )
    return _client


async def shutdown_client() -> None:
    """Call during app shutdown to cleanly close the HTTP pool."""
    global _client
    if _client and not _client.is_closed:
        await _client.aclose()
        _client = None


async def _is_ollama_reachable() -> bool:
    """Cached connectivity probe — avoids hammering Ollama on every request."""
    global _ollama_available, _ollama_check_ts

    now = time.monotonic()
    if _ollama_available is not None and (now - _ollama_check_ts) < _OLLAMA_CHECK_TTL:
        return _ollama_available

    try:
        client = await _get_client()
        resp = await client.get(OLLAMA_BASE_URL, timeout=3.0)
        _ollama_available = resp.status_code == 200
    except Exception:
        _ollama_available = False

    _ollama_check_ts = now
    return _ollama_available


async def check_ollama_status() -> dict[str, Any]:
    """Return a dict describing Ollama connectivity and model availability."""
    try:
        client = await _get_client()
        resp = await client.get(OLLAMA_TAGS, timeout=3.0)
        if resp.status_code == 200:
            models = [m["name"] for m in resp.json().get("models", [])]
            phi3_available = any("phi3" in m for m in models)
            return {
                "ollama_reachable": True,
                "models_installed": models,
                "active_model": MODEL_NAME if phi3_available else None,
                "phi3_ready": phi3_available,
            }
    except Exception as exc:
        logger.warning("Ollama health check failed: %s", exc)

    return {
        "ollama_reachable": False,
        "models_installed": [],
        "active_model": None,
        "phi3_ready": False,
    }


# ---------------------------------------------------------------------------
# Prompt builder
# ---------------------------------------------------------------------------

MAX_HISTORY_TURNS = 2


def _build_prompt(
    keywords: str,
    context: str,
    language: str,
    history: list[dict] | None = None,
) -> str:
    """
    Assemble a minimal prompt optimised for phi3:mini speed.
    Target: < 600 characters for typical queries.
    """
    parts = [SYSTEM_PROMPT]

    if language == "hi":
        parts.append("Respond in Hindi.")
    elif language == "mr":
        parts.append("Respond in Marathi.")

    if context:
        trimmed = context[:400]
        parts.append(f"Context: {trimmed}")

    if history:
        recent = history[-MAX_HISTORY_TURNS:]
        for turn in recent:
            role = "Q" if turn["role"] == "user" else "A"
            text = turn["text"][:80]
            parts.append(f"{role}: {text}")

    parts.append(f"Question: {keywords}")

    prompt = "\n".join(parts)
    logger.info("Prompt size: %d chars", len(prompt))
    return prompt


# ---------------------------------------------------------------------------
# Main generation
# ---------------------------------------------------------------------------

async def generate_response(
    user_message: str,
    context: str,
    language: str,
    history: list[dict] | None = None,
    patient_info: dict | None = None,
) -> str:
    """
    Generate a chatbot response via Ollama /api/generate using phi3:mini.
    Uses keyword extraction and response caching for performance.
    Returns a fallback message if Ollama is unreachable or the model fails.
    """
    keywords = extract_keywords(user_message)
    ckey = _cache_key(keywords, language)
    cached = _cache_get(ckey)
    if cached:
        logger.info("Cache HIT for key=%s", ckey[:8])
        return cached

    reachable = await _is_ollama_reachable()
    if not reachable:
        logger.error("Ollama is not reachable at %s", OLLAMA_BASE_URL)
        return _fallback_response(language)

    prompt = _build_prompt(keywords, context, language, history)
    client = await _get_client()

    t0 = time.monotonic()
    try:
        resp = await client.post(
            OLLAMA_GENERATE,
            json={
                "model": MODEL_NAME,
                "prompt": prompt,
                "stream": False,
                "options": {
                    "temperature": 0.3,
                    "top_p": 0.85,
                    "num_predict": 120,
                },
            },
        )
        elapsed = round(time.monotonic() - t0, 2)
        logger.info("LLM response time: %.2f seconds", elapsed)

        if resp.status_code == 200:
            text = resp.json().get("response", "").strip()
            if text:
                disclaimer = DISCLAIMER.get(language, DISCLAIMER["en"])
                if (
                    "does not replace" not in text
                    and "विकल्प नहीं" not in text
                    and "जागा घेत नाही" not in text
                ):
                    text += disclaimer
                logger.info(
                    "LLM OK (model=%s, chars=%d, elapsed=%.2fs)",
                    MODEL_NAME, len(text), elapsed,
                )
                _cache_put(ckey, text)
                return text

        logger.warning(
            "Ollama returned status %d for model %s (%.2fs)",
            resp.status_code, MODEL_NAME, elapsed,
        )

    except httpx.TimeoutException:
        elapsed = round(time.monotonic() - t0, 2)
        logger.error(
            "Timeout after %.2fs waiting for phi3:mini — model is busy", elapsed,
        )
        return _timeout_response(language)
    except httpx.ConnectError:
        logger.error("Cannot connect to Ollama at %s — is it running?", OLLAMA_BASE_URL)
        global _ollama_available
        _ollama_available = False
    except Exception as exc:
        logger.exception("Unexpected error during LLM generation: %s", exc)

    return _fallback_response(language)


# ---------------------------------------------------------------------------
# Fallback / timeout responses
# ---------------------------------------------------------------------------

def _timeout_response(language: str) -> str:
    """Returned when Ollama doesn't respond within LLM_READ_TIMEOUT."""
    if language == "hi":
        return (
            "AI मॉडल अभी व्यस्त है। कृपया कुछ क्षणों में पुनः प्रयास करें।\n\n"
            "यह AI सहायक केवल शैक्षिक जानकारी प्रदान करता है और पेशेवर चिकित्सा परामर्श का विकल्प नहीं है।"
        )
    if language == "mr":
        return (
            "AI मॉडेल सध्या व्यस्त आहे. कृपया काही क्षणांत पुन्हा प्रयत्न करा.\n\n"
            "हा AI सहाय्यक केवळ शैक्षणिक माहिती प्रदान करतो आणि व्यावसायिक वैद्यकीय सल्ल्याची जागा घेत नाही."
        )
    return (
        "AI is currently busy. Please ask again.\n\n"
        "_This AI assistant provides educational information and does not replace "
        "professional medical consultation._"
    )


def _fallback_response(language: str) -> str:
    """Returned when Ollama is completely unreachable."""
    if language == "hi":
        return (
            "AI सेवा अस्थायी रूप से अनुपलब्ध है। कृपया Ollama शुरू करें।\n\n"
            "कृपया किसी योग्य नेत्र रोग विशेषज्ञ से परामर्श करें।\n\n"
            "यह AI सहायक केवल शैक्षिक जानकारी प्रदान करता है और पेशेवर चिकित्सा परामर्श का विकल्प नहीं है।"
        )
    if language == "mr":
        return (
            "AI सेवा तात्पुरती अनुपलब्ध आहे. कृपया Ollama सुरू करा.\n\n"
            "कृपया एका पात्र नेत्रतज्ञांचा सल्ला घ्या.\n\n"
            "हा AI सहाय्यक केवळ शैक्षणिक माहिती प्रदान करतो आणि व्यावसायिक वैद्यकीय सल्ल्याची जागा घेत नाही."
        )
    return (
        "AI service temporarily unavailable. Please start Ollama.\n\n"
        "Please consult a qualified ophthalmologist for medical advice.\n\n"
        "_This AI assistant provides educational information and does not replace "
        "professional medical consultation._"
    )
