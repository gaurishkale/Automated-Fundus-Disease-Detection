"""
Lightweight language detection for English, Hindi, and Marathi.
Uses Unicode Devanagari script ranges and word-level heuristics.

Rules:
  - Hindi detected  → respond in Hindi
  - Marathi detected → respond in Marathi
  - Otherwise        → English
"""

from __future__ import annotations

import re

HINDI_MARKERS = {
    "है", "हैं", "का", "की", "के", "में", "और", "को", "से", "पर",
    "ने", "यह", "वह", "क्या", "कैसे", "क्यों", "कब", "कहाँ", "मुझे",
    "मैं", "हम", "आप", "तुम", "कृपया", "बताइए", "बताओ", "नमस्ते",
    "धन्यवाद", "कौन", "कहां", "अच्छा", "ठीक", "जी", "हाँ", "नहीं",
    "कैसा", "कैसी", "कितना", "कितनी", "बहुत", "थोड़ा", "सब",
    "आंख", "आंखें", "आँख", "आँखें", "नेत्र", "दृष्टि", "रोशनी",
    "इलाज", "दवा", "डॉक्टर", "अस्पताल", "लक्षण", "कारण", "उपाय",
    "बीमारी", "रोग", "समस्या", "तकलीफ", "परेशानी",
}

MARATHI_MARKERS = {
    "आहे", "आहेत", "काय", "कसे", "कसा", "माझे", "माझा", "माझी",
    "तुमचे", "तुमचा", "तुम्ही", "मला", "ला", "चा", "ची", "चे",
    "हे", "ते", "ही", "या", "त्या", "कृपया", "सांगा", "नमस्कार",
    "धन्यवाद", "कोण", "कुठे", "केव्हा", "झाले", "होते", "असते",
    "डोळे", "डोळ्यांची", "रोग", "उपचार", "लक्षणे",
    "नाही", "होय", "बरोबर", "चांगले", "वाईट",
    "कसं", "काही", "सगळे", "आपले", "आपला", "आपली",
    "दृष्टी", "नेत्र", "आजार", "औषध", "दवाखाना",
}

HINDI_ONLY_MARKERS = {
    "है", "हैं", "मैं", "हम", "तुम", "आप", "यह", "वह",
    "मुझे", "बताइए", "बताओ", "नमस्ते", "कहां", "कहाँ",
    "आंख", "आंखें", "आँख", "आँखें", "बीमारी", "तकलीफ", "परेशानी",
    "इलाज", "दवा", "अस्पताल",
}

MARATHI_ONLY_MARKERS = {
    "आहे", "आहेत", "माझे", "माझा", "माझी", "तुमचे", "तुमचा",
    "तुम्ही", "मला", "सांगा", "नमस्कार", "झाले", "होते", "असते",
    "डोळे", "डोळ्यांची", "कसं", "आपले", "आपला", "आपली",
    "दवाखाना", "आजार",
}

DEVANAGARI_RANGE = re.compile(r"[\u0900-\u097F]")


def detect_language(text: str) -> str:
    """
    Detect whether text is English, Hindi, or Marathi.
    Returns one of: 'en', 'hi', 'mr'
    """
    if not text or not text.strip():
        return "en"

    devanagari_chars = len(DEVANAGARI_RANGE.findall(text))

    if devanagari_chars < 2:
        return "en"

    words = set(text.split())

    marathi_exclusive = len(words & MARATHI_ONLY_MARKERS)
    hindi_exclusive = len(words & HINDI_ONLY_MARKERS)

    if marathi_exclusive > hindi_exclusive:
        return "mr"
    if hindi_exclusive > marathi_exclusive:
        return "hi"

    marathi_score = len(words & MARATHI_MARKERS)
    hindi_score = len(words & HINDI_MARKERS)

    if marathi_score > hindi_score:
        return "mr"
    if hindi_score > 0:
        return "hi"

    return "hi"
