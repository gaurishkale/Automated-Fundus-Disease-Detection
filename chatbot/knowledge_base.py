"""
RAG Knowledge Base for eye disease information.
Provides structured medical knowledge retrieval with caching for the chatbot.
"""

from __future__ import annotations

import re

DISEASES: list[dict] = [
    {
        "name": "Cataract",
        "keywords": [
            "cataract", "cloudy lens", "lens opacity", "foggy vision",
            "motiyabind", "मोतियाबिंद", "मोतीबिंदू",
        ],
        "symptoms": [
            "Cloudy, blurry, or dim vision",
            "Increasing difficulty with night vision",
            "Sensitivity to light and glare",
            "Seeing halos around lights",
            "Fading or yellowing of colors",
            "Frequent changes in eyeglass prescription",
        ],
        "causes": [
            "Aging — proteins in the lens break down over time",
            "Diabetes",
            "Prolonged exposure to UV sunlight",
            "Smoking and excessive alcohol use",
            "Eye injury or previous eye surgery",
            "Long-term use of corticosteroid medications",
        ],
        "prevention": [
            "Wear sunglasses that block UV rays",
            "Manage diabetes and other health conditions",
            "Avoid smoking and limit alcohol",
            "Eat a diet rich in antioxidants (fruits and vegetables)",
            "Get regular eye examinations",
        ],
        "treatment_advice": [
            "Early cataracts may be managed with updated glasses and brighter lighting",
            "Surgery is the only effective treatment for advanced cataracts",
            "Cataract surgery is safe and highly successful",
            "An artificial intraocular lens (IOL) replaces the cloudy lens",
            "Consult an ophthalmologist when cataracts interfere with daily activities",
        ],
    },
    {
        "name": "Glaucoma",
        "keywords": [
            "glaucoma", "eye pressure", "optic nerve", "intraocular pressure",
            "tunnel vision", "काचबिंदू", "ग्लूकोमा", "आंखों का दबाव",
        ],
        "symptoms": [
            "Gradual loss of peripheral (side) vision",
            "Tunnel vision in advanced stages",
            "Eye pain or redness (in acute cases)",
            "Halos around lights",
            "Often no early symptoms (silent thief of sight)",
        ],
        "causes": [
            "Increased intraocular pressure damaging the optic nerve",
            "Poor drainage of fluid (aqueous humor) in the eye",
            "Family history of glaucoma",
            "Age over 60",
            "Conditions like diabetes, heart disease, or high blood pressure",
        ],
        "prevention": [
            "Regular comprehensive eye exams, especially after age 40",
            "Know your family eye health history",
            "Exercise regularly to reduce eye pressure",
            "Protect eyes from injury",
            "Use prescribed eye drops consistently",
        ],
        "treatment_advice": [
            "Prescription eye drops to lower eye pressure",
            "Laser therapy (trabeculoplasty) to improve drainage",
            "Surgery (trabeculectomy) if other treatments fail",
            "Damage from glaucoma cannot be reversed — early detection is critical",
            "Consult an ophthalmologist for regular monitoring",
        ],
    },
    {
        "name": "Diabetic Retinopathy",
        "keywords": [
            "diabetic retinopathy", "diabetic", "retinopathy", "diabetes eye",
            "blood vessel", "retina damage", "sugar", "डायबिटिक रेटिनोपैथी",
            "मधुमेह", "डायबिटीज", "डायबिटिक रेटिनोपॅथी",
        ],
        "symptoms": [
            "Blurred or fluctuating vision",
            "Dark spots or floaters in vision",
            "Difficulty seeing at night",
            "Faded or washed-out colors",
            "Vision loss in advanced stages",
        ],
        "causes": [
            "High blood sugar damaging retinal blood vessels",
            "Long-duration diabetes (Type 1 or Type 2)",
            "Poorly controlled blood glucose levels",
            "High blood pressure alongside diabetes",
        ],
        "prevention": [
            "Control blood sugar levels regularly",
            "Monitor and manage blood pressure",
            "Get annual dilated eye exams",
            "Maintain a healthy diet and exercise routine",
            "Avoid smoking",
        ],
        "treatment_advice": [
            "Early stages may only require monitoring and blood sugar control",
            "Laser treatment (photocoagulation) can slow leakage",
            "Anti-VEGF injections help reduce swelling",
            "Vitrectomy surgery for advanced cases",
            "Consult an ophthalmologist for a personalized treatment plan",
        ],
    },
    {
        "name": "Macular Degeneration",
        "keywords": [
            "macular degeneration", "amd", "age-related macular",
            "macula", "central vision", "मैक्युलर डिजनरेशन",
            "मॅक्युलर डिजनरेशन",
        ],
        "symptoms": [
            "Blurred or reduced central vision",
            "Distorted vision (straight lines appear wavy)",
            "Difficulty recognizing faces",
            "Need for brighter lighting while reading",
            "A dark or empty area in center of vision",
        ],
        "causes": [
            "Aging — most common in people over 50",
            "Genetic predisposition and family history",
            "Smoking significantly increases risk",
            "Obesity and poor cardiovascular health",
            "Prolonged UV light exposure",
        ],
        "prevention": [
            "Eat a diet rich in leafy greens, fish, and nuts",
            "Avoid smoking",
            "Wear sunglasses with UV protection",
            "Exercise regularly and maintain healthy weight",
            "Get regular eye exams after age 50",
        ],
        "treatment_advice": [
            "Dry AMD: nutritional supplements (AREDS formula) may slow progression",
            "Wet AMD: anti-VEGF injections to stop abnormal blood vessel growth",
            "Low vision aids and rehabilitation",
            "No cure exists, but treatment can slow vision loss",
            "Consult an ophthalmologist promptly if you notice vision changes",
        ],
    },
    {
        "name": "Retinal Detachment",
        "keywords": [
            "retinal detachment", "detached retina", "retina separation",
            "flashes of light", "रेटिनल डिटैचमेंट", "रेटिना अलग",
            "रेटिनल डिटॅचमेंट",
        ],
        "symptoms": [
            "Sudden appearance of many floaters",
            "Flashes of light in one or both eyes",
            "A shadow or curtain over part of your visual field",
            "Sudden blurred vision",
            "This is a medical emergency — seek help immediately",
        ],
        "causes": [
            "Aging — vitreous gel shrinks and pulls on the retina",
            "Severe myopia (nearsightedness)",
            "Previous eye surgery (e.g., cataract removal)",
            "Eye trauma or injury",
            "Family history of retinal detachment",
        ],
        "prevention": [
            "Wear protective eyewear during sports and activities",
            "Get regular eye exams, especially if highly myopic",
            "Seek immediate care if you notice sudden floaters or flashes",
            "Manage conditions like diabetes that affect the retina",
        ],
        "treatment_advice": [
            "Laser surgery (photocoagulation) or cryotherapy for small tears",
            "Scleral buckle surgery to push the wall of the eye against the retina",
            "Vitrectomy to remove vitreous gel and reattach retina",
            "Pneumatic retinopexy (gas bubble injection)",
            "Time-sensitive: early treatment dramatically improves outcomes",
            "Consult an ophthalmologist immediately if symptoms appear",
        ],
    },
    {
        "name": "Dry Eye Syndrome",
        "keywords": [
            "dry eye", "dry eyes", "dry eye syndrome", "tear deficiency",
            "eye dryness", "burning eyes", "gritty eyes", "watery eyes",
            "सूखी आंखें", "आंखों में सूखापन", "कोरडे डोळे",
            "डोळे कोरडे", "ड्राय आय",
        ],
        "symptoms": [
            "Persistent dryness and discomfort in the eyes",
            "Burning or stinging sensation",
            "Gritty or sandy feeling in the eyes",
            "Redness and irritation",
            "Excessive tearing (reflex response to dryness)",
            "Blurred vision that improves with blinking",
            "Eye fatigue, especially after reading or screen use",
            "Sensitivity to light",
        ],
        "causes": [
            "Reduced tear production due to aging",
            "Hormonal changes (especially in women post-menopause)",
            "Prolonged screen time reducing blink rate",
            "Dry or windy environmental conditions",
            "Contact lens wear",
            "Certain medications (antihistamines, antidepressants, decongestants)",
            "Autoimmune conditions like Sjogren's syndrome",
            "LASIK or other refractive eye surgery",
        ],
        "prevention": [
            "Follow the 20-20-20 rule to reduce screen-related dryness",
            "Use a humidifier in dry environments",
            "Stay hydrated — drink adequate water daily",
            "Wear wraparound sunglasses in windy conditions",
            "Blink consciously and frequently during screen use",
            "Avoid direct air from fans or AC blowing into the eyes",
            "Include omega-3 fatty acids in your diet (fish, flaxseed)",
        ],
        "treatment_advice": [
            "Artificial tears (lubricating eye drops) for mild cases",
            "Prescription anti-inflammatory drops (cyclosporine, lifitegrast)",
            "Warm compresses to improve oil gland function in eyelids",
            "Punctal plugs to reduce tear drainage and keep eyes moist",
            "Avoid over-the-counter drops with preservatives for long-term use",
            "Consult an ophthalmologist if symptoms persist or worsen",
        ],
    },
    {
        "name": "Hypertensive Retinopathy",
        "keywords": [
            "hypertensive retinopathy", "hypertension eye", "high blood pressure eye",
            "blood pressure retina", "हाइपरटेंसिव रेटिनोपैथी", "रक्तदाब",
        ],
        "symptoms": [
            "Often no early symptoms",
            "Blurred or reduced vision in advanced stages",
            "Headaches accompanied by vision changes",
            "Double vision",
            "Swelling of the optic nerve (papilledema)",
        ],
        "causes": [
            "Chronic high blood pressure damaging retinal blood vessels",
            "Uncontrolled hypertension over long periods",
            "Associated with heart disease and stroke risk",
        ],
        "prevention": [
            "Monitor and control blood pressure regularly",
            "Follow a low-sodium, heart-healthy diet",
            "Exercise regularly",
            "Take prescribed blood pressure medications consistently",
            "Get regular eye exams",
        ],
        "treatment_advice": [
            "Primary treatment is controlling blood pressure",
            "Medications to manage hypertension as prescribed by a doctor",
            "Retinal damage from hypertension may be irreversible",
            "Regular monitoring by both a cardiologist and ophthalmologist",
            "Consult an ophthalmologist if you notice any vision changes",
        ],
    },
    {
        "name": "Myopia",
        "keywords": [
            "myopia", "nearsightedness", "short sight", "near sighted",
            "minus power", "निकट दृष्टि दोष", "मायोपिया",
        ],
        "symptoms": [
            "Difficulty seeing distant objects clearly",
            "Squinting to see faraway things",
            "Eye strain and headaches",
            "Difficulty seeing while driving, especially at night",
            "Need to sit closer to screens or boards",
        ],
        "causes": [
            "Elongated eyeball shape",
            "Genetic factors — family history of myopia",
            "Excessive close-up work (reading, screens)",
            "Lack of outdoor activity during childhood",
        ],
        "prevention": [
            "Spend more time outdoors, especially during childhood",
            "Follow the 20-20-20 rule (every 20 min, look 20 feet away for 20 sec)",
            "Ensure proper lighting while reading",
            "Limit prolonged screen time",
            "Get regular eye check-ups",
        ],
        "treatment_advice": [
            "Corrective glasses or contact lenses",
            "Orthokeratology (special contact lenses worn at night)",
            "Atropine eye drops may slow progression in children",
            "LASIK or PRK surgery for eligible adults",
            "Consult an ophthalmologist for the best correction method",
        ],
    },
]

GENERAL_EYE_HEALTH = {
    "keywords": [
        "eye health", "eye care", "healthy eyes", "vision care",
        "screening", "checkup", "test result", "after screening",
        "prevention", "protect eyes", "eye tips",
        "आंखों की देखभाल", "डोळ्यांची काळजी",
    ],
    "advice": [
        "Get comprehensive eye exams regularly, at least once a year",
        "Eat a balanced diet rich in omega-3 fatty acids, vitamins C and E, and zinc",
        "Wear sunglasses with 100% UV protection",
        "Follow the 20-20-20 rule to reduce digital eye strain",
        "Avoid smoking — it increases risk of cataracts and macular degeneration",
        "Maintain a healthy weight to reduce risk of diabetes-related eye diseases",
        "Know your family's eye health history",
        "Always consult a qualified ophthalmologist for medical advice",
    ],
}

_ALL_SECTIONS = ("symptoms", "causes", "prevention", "treatment_advice")

_context_cache: dict[str, str] = {}
_CACHE_MAX = 500


def _format_disease(
    d: dict,
    sections: list[str] | None = None,
) -> str:
    """
    Format a single disease into a compact context block.
    When `sections` is provided, only those fields are included — keeps chunks small.
    """
    use = sections or list(_ALL_SECTIONS)
    parts = [f"Disease: {d['name']}"]
    for sec in use:
        if sec in d:
            label = sec.replace("_", " ").title()
            parts.append(f"{label}: {'; '.join(d[sec][:4])}")
    return "\n".join(parts)


def _score_disease(disease: dict, query_lower: str) -> int:
    """Return a relevance score (higher = better match)."""
    score = 0
    for kw in disease["keywords"]:
        if kw.lower() in query_lower:
            score += 10 if " " in kw else 5
    if score == 0:
        name_lower = disease["name"].lower()
        words = re.findall(r"[a-zA-Z\u0900-\u097F]+", query_lower)
        if any(w in name_lower for w in words if len(w) > 3):
            score += 3
    return score


def retrieve_context(
    query: str,
    top_k: int = 2,
    sections: list[str] | None = None,
) -> str:
    """
    Retrieve the top-k most relevant disease knowledge chunks.

    Parameters
    ----------
    query : str
        The user's question.
    top_k : int
        Maximum number of disease blocks to return (default 2).
    sections : list[str] | None
        Which disease fields to include (e.g. ["symptoms", "treatment_advice"]).
        When None, all four sections are returned.
    """
    cache_key = f"{query.strip().lower()}|k={top_k}|s={sections}"
    if cache_key in _context_cache:
        return _context_cache[cache_key]

    query_lower = query.strip().lower()

    scored: list[tuple[int, dict]] = []
    for disease in DISEASES:
        s = _score_disease(disease, query_lower)
        if s > 0:
            scored.append((s, disease))

    scored.sort(key=lambda x: x[0], reverse=True)
    top_matches = [d for _, d in scored[:top_k]]

    context_parts: list[str] = []

    if top_matches:
        for d in top_matches:
            context_parts.append(_format_disease(d, sections))
    else:
        for kw in GENERAL_EYE_HEALTH["keywords"]:
            if kw in query_lower:
                context_parts.append(
                    "General Eye Health Advice:\n"
                    + "\n".join(f"- {a}" for a in GENERAL_EYE_HEALTH["advice"][:5])
                )
                break

    if not context_parts:
        context_parts.append(
            "General Eye Health Advice:\n"
            + "\n".join(f"- {a}" for a in GENERAL_EYE_HEALTH["advice"][:5])
        )

    result = "\n\n".join(context_parts)

    if len(_context_cache) >= _CACHE_MAX:
        oldest_key = next(iter(_context_cache))
        del _context_cache[oldest_key]
    _context_cache[cache_key] = result

    return result
