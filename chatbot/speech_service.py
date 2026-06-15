"""
Speech services: faster-whisper STT, edge-tts TTS, microphone recording,
and complete voice pipeline for the EyeDetect chatbot.

Hardened with async timeouts and graceful fallbacks so TTS failures
never block the response pipeline.
"""

from __future__ import annotations

import asyncio
import io
import logging
import os
import ssl
import tempfile
import time
from typing import Any

ssl._create_default_https_context = ssl._create_unverified_context

logger = logging.getLogger("chatbot.speech")

VOICE_MAP = {
    "en": "en-IN-PrabhatNeural",
    "hi": "hi-IN-MadhurNeural",
    "mr": "mr-IN-AarohiNeural",
}

SAMPLE_RATE = 16000
RECORD_DURATION = 5
CHANNELS = 1

TTS_TIMEOUT_SECONDS = 8.0

_whisper_model = None
_whisper_lock = asyncio.Lock() if hasattr(asyncio, "Lock") else None


def _get_whisper_model():
    """Lazy-load faster-whisper model (base) on first use — loaded once for performance."""
    global _whisper_model
    if _whisper_model is None:
        try:
            from faster_whisper import WhisperModel

            logger.info("Loading faster-whisper 'base' model (this may take a moment)...")
            _whisper_model = WhisperModel("base", compute_type="int8")
            logger.info("Faster-whisper model loaded successfully.")
        except ImportError:
            logger.error(
                "faster-whisper is not installed. "
                "Install it with: pip install faster-whisper"
            )
            raise
        except Exception as exc:
            logger.exception("Failed to load Whisper model: %s", exc)
            raise
    return _whisper_model


def record_audio() -> str:
    """
    Record audio from the microphone for RECORD_DURATION seconds.
    Returns the path to the saved temporary WAV file.
    """
    try:
        import sounddevice as sd
        import numpy as np
        from scipy.io import wavfile
    except ImportError as exc:
        raise RuntimeError(
            f"Recording dependencies not installed: {exc}. "
            "Install with: pip install sounddevice numpy scipy"
        ) from exc

    try:
        input_device = sd.query_devices(kind="input")
        if input_device is None:
            raise RuntimeError("No input audio device (microphone) detected.")
        logger.info("Recording from device: %s", input_device.get("name", "Unknown"))
    except Exception as exc:
        raise RuntimeError(f"Microphone not detected or unavailable: {exc}") from exc

    try:
        logger.info("Recording audio for %d seconds at %d Hz...", RECORD_DURATION, SAMPLE_RATE)
        audio_data = sd.rec(
            int(RECORD_DURATION * SAMPLE_RATE),
            samplerate=SAMPLE_RATE,
            channels=CHANNELS,
            dtype="int16",
        )
        sd.wait()
        logger.info("Recording complete. Shape: %s", audio_data.shape)
    except Exception as exc:
        raise RuntimeError(f"Audio recording failed: {exc}") from exc

    if audio_data is None or np.max(np.abs(audio_data)) == 0:
        raise RuntimeError("Recording captured only silence — check your microphone.")

    try:
        tmp = tempfile.NamedTemporaryFile(suffix=".wav", delete=False)
        tmp_path = tmp.name
        tmp.close()
        wavfile.write(tmp_path, SAMPLE_RATE, audio_data)
        logger.info("Audio saved to: %s", tmp_path)
        return tmp_path
    except Exception as exc:
        raise RuntimeError(f"Failed to save recorded audio: {exc}") from exc


def speech_to_text(audio_file: str) -> dict[str, str]:
    """
    Transcribe an audio file using faster-whisper.
    Returns {"text": str, "language": str}.
    """
    model = _get_whisper_model()

    try:
        segments, info = model.transcribe(audio_file, beam_size=5)

        full_text = ""
        for segment in segments:
            full_text += segment.text

        full_text = full_text.strip()

        detected_lang = getattr(info, "language", "en") or "en"
        lang_code = "en"
        if detected_lang in ("hi", "hin", "hindi"):
            lang_code = "hi"
        elif detected_lang in ("mr", "mar", "marathi"):
            lang_code = "mr"

        logger.info(
            "STT complete — detected_lang=%s, mapped=%s, text_length=%d",
            detected_lang, lang_code, len(full_text),
        )
        return {"text": full_text, "language": lang_code}

    except Exception as exc:
        logger.exception("Speech-to-text transcription failed: %s", exc)
        raise RuntimeError(f"Transcription failed: {exc}") from exc


async def transcribe_audio(audio_bytes: bytes) -> dict[str, str]:
    """
    Async wrapper: transcribe audio bytes (from uploaded file) using faster-whisper.
    Writes bytes to a temp file, runs STT in a thread pool, then cleans up.
    """
    loop = asyncio.get_event_loop()

    def _do_transcribe():
        with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp:
            tmp.write(audio_bytes)
            tmp_path = tmp.name

        try:
            return speech_to_text(tmp_path)
        finally:
            try:
                os.unlink(tmp_path)
            except OSError:
                pass

    return await loop.run_in_executor(None, _do_transcribe)


async def _run_edge_tts_stream(text: str, voice: str) -> bytes:
    """Core edge-tts streaming logic, isolated for timeout wrapping."""
    import edge_tts

    communicate = edge_tts.Communicate(text, voice)
    audio_buffer = io.BytesIO()
    async for chunk in communicate.stream():
        if chunk["type"] == "audio":
            audio_buffer.write(chunk["data"])

    audio_buffer.seek(0)
    audio_data = audio_buffer.read()

    if not audio_data:
        raise RuntimeError("TTS produced empty audio output")

    return audio_data


async def speak_text(text: str, language: str = "en") -> str | None:
    """
    Convert text to speech using edge-tts.
    Saves audio as response.mp3 in a temp directory.
    Returns the file path to the generated MP3, or None if TTS fails.
    """
    try:
        import edge_tts
    except ImportError:
        logger.error("edge-tts is not installed — skipping voice generation")
        return None

    voice = VOICE_MAP.get(language, VOICE_MAP["en"])
    output_path = os.path.join(tempfile.gettempdir(), "response.mp3")
    t0 = time.perf_counter()

    try:
        communicate = edge_tts.Communicate(text, voice)
        await asyncio.wait_for(communicate.save(output_path), timeout=TTS_TIMEOUT_SECONDS)
        elapsed = round((time.perf_counter() - t0) * 1000, 1)
        logger.info("TTS audio saved to: %s (voice=%s, elapsed=%.1fms)", output_path, voice, elapsed)
        return output_path
    except asyncio.TimeoutError:
        logger.error("TTS timed out after %.1fs (voice=%s)", TTS_TIMEOUT_SECONDS, voice)
        return None
    except ssl.SSLError as exc:
        logger.error("TTS SSL error (voice=%s): %s", voice, exc)
        return None
    except Exception as exc:
        elapsed = round((time.perf_counter() - t0) * 1000, 1)
        logger.error("TTS voice generation failed after %.1fms (voice=%s): %s", elapsed, voice, exc)
        return None


async def text_to_speech(text: str, language: str = "en") -> bytes:
    """
    Convert text to speech using edge-tts with async timeout protection.
    Returns MP3 audio bytes (used by the /text-to-speech API endpoint).
    """
    try:
        import edge_tts  # noqa: F401
    except ImportError:
        raise RuntimeError("edge-tts is not installed. Install with: pip install edge-tts")

    voice = VOICE_MAP.get(language, VOICE_MAP["en"])
    t0 = time.perf_counter()

    try:
        audio_data = await asyncio.wait_for(
            _run_edge_tts_stream(text, voice),
            timeout=TTS_TIMEOUT_SECONDS,
        )
        elapsed = round((time.perf_counter() - t0) * 1000, 1)
        logger.info("TTS bytes generated: %d bytes (voice=%s, elapsed=%.1fms)", len(audio_data), voice, elapsed)
        return audio_data

    except asyncio.TimeoutError:
        elapsed = round((time.perf_counter() - t0) * 1000, 1)
        logger.error("TTS stream timed out after %.1fms (voice=%s)", elapsed, voice)
        raise RuntimeError(f"TTS timed out after {TTS_TIMEOUT_SECONDS}s")
    except ssl.SSLError as exc:
        logger.error("TTS SSL certificate error (voice=%s): %s", voice, exc)
        raise RuntimeError(f"TTS SSL error: {exc}") from exc
    except ConnectionError as exc:
        logger.error("TTS network connection failed (voice=%s): %s", voice, exc)
        raise RuntimeError(f"TTS connection error: {exc}") from exc
    except Exception as exc:
        elapsed = round((time.perf_counter() - t0) * 1000, 1)
        logger.error("TTS generation failed after %.1fms (voice=%s): %s", elapsed, voice, exc)
        raise RuntimeError(f"TTS failed: {exc}") from exc


def play_voice(file_path: str) -> None:
    """Play an audio file using pydub + simpleaudio."""
    if not os.path.isfile(file_path):
        logger.error("Audio file not found for playback: %s", file_path)
        return

    try:
        from pydub import AudioSegment
        from pydub.playback import play as pydub_play

        audio = AudioSegment.from_file(file_path)
        logger.info("Playing audio: %s (duration=%dms)", file_path, len(audio))
        pydub_play(audio)
        logger.info("Audio playback complete.")
    except ImportError:
        logger.warning(
            "pydub/simpleaudio not installed — cannot play audio locally. "
            "Install with: pip install pydub simpleaudio"
        )
    except Exception as exc:
        logger.error("Audio playback failed: %s", exc)


async def process_voice_query(
    knowledge_retriever=None,
    language_detector=None,
    llm_generator=None,
) -> dict[str, Any]:
    """
    Complete voice pipeline:
      record_audio() → speech_to_text() → detect_language() →
      retrieve_context() → ask_llm() → speak_text()
    """
    from .knowledge_base import retrieve_context as _retrieve_context
    from .language_detection import detect_language as _detect_language

    audio_path = None
    try:
        logger.info("Voice pipeline: starting microphone recording...")
        loop = asyncio.get_event_loop()
        audio_path = await loop.run_in_executor(None, record_audio)

        logger.info("Voice pipeline: transcribing audio...")
        stt_result = await loop.run_in_executor(None, speech_to_text, audio_path)
        transcript = stt_result["text"]
        stt_language = stt_result["language"]

        if not transcript:
            return {
                "transcript": "",
                "response_text": "I could not understand the audio. Please try again.",
                "audio_file_path": None,
                "language": "en",
            }

        logger.info("Voice pipeline: detecting language...")
        if language_detector:
            language = language_detector(transcript)
        else:
            language = _detect_language(transcript)

        if stt_language != "en" and language == "en":
            language = stt_language

        logger.info("Voice pipeline: retrieving knowledge context...")
        if knowledge_retriever:
            context = knowledge_retriever(transcript)
        else:
            context = _retrieve_context(transcript)

        logger.info("Voice pipeline: generating LLM response...")
        if llm_generator:
            response_text = await llm_generator(transcript, context, language)
        else:
            from .llm_service import generate_response
            response_text = await generate_response(transcript, context, language)

        logger.info("Voice pipeline: generating voice response...")
        voice_path = await speak_text(response_text, language)
        if voice_path is None:
            logger.warning("Voice pipeline: TTS failed — returning text-only response")

        return {
            "transcript": transcript,
            "response_text": response_text,
            "audio_file_path": voice_path,
            "language": language,
        }

    except RuntimeError as exc:
        logger.error("Voice pipeline error: %s", exc)
        return {
            "transcript": "",
            "response_text": str(exc),
            "audio_file_path": None,
            "language": "en",
        }
    except Exception as exc:
        logger.exception("Unexpected error in voice pipeline: %s", exc)
        return {
            "transcript": "",
            "response_text": "An unexpected error occurred. Please try again.",
            "audio_file_path": None,
            "language": "en",
        }
    finally:
        if audio_path and os.path.isfile(audio_path):
            try:
                os.unlink(audio_path)
            except OSError:
                pass
