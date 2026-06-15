import { useEffect, useState } from "react";
import { AlertCircle, ShieldCheck, ChevronDown, MessageCircle } from "lucide-react";

const DISEASE_INFO = {
  "Age-related Macular Degeneration (AMD)": {
    symptoms: [
      "Blurred or distorted central vision",
      "Dark or empty areas in central vision",
      "Difficulty recognizing faces",
      "Reduced color perception",
      "Straight lines appearing wavy",
    ],
    prevention: [
      "Regular comprehensive eye exams",
      "Quit smoking immediately",
      "Eat leafy green vegetables and fish",
      "Wear UV-protective sunglasses",
      "Manage blood pressure and cholesterol",
    ],
  },
  Cataract: {
    symptoms: [
      "Cloudy or blurred vision",
      "Increased sensitivity to glare",
      "Fading or yellowing of colors",
      "Difficulty seeing at night",
      "Frequent prescription changes",
    ],
    prevention: [
      "Wear sunglasses with UV protection",
      "Quit smoking and limit alcohol",
      "Eat antioxidant-rich fruits and vegetables",
      "Manage diabetes and blood sugar levels",
      "Get regular eye examinations",
    ],
  },
  "Diabetic Retinopathy": {
    symptoms: [
      "Floaters or dark spots in vision",
      "Blurred or fluctuating vision",
      "Dark or empty areas in visual field",
      "Difficulty with color perception",
      "Progressive vision loss",
    ],
    prevention: [
      "Control blood sugar levels strictly",
      "Monitor blood pressure regularly",
      "Get annual dilated eye exams",
      "Maintain a healthy diet and exercise",
      "Take prescribed medications consistently",
    ],
  },
  Glaucoma: {
    symptoms: [
      "Gradual loss of peripheral vision",
      "Tunnel vision in advanced stages",
      "Severe eye pain and headaches",
      "Nausea and vomiting with eye pain",
      "Halos around lights",
    ],
    prevention: [
      "Get regular eye pressure checks",
      "Exercise regularly to reduce eye pressure",
      "Use prescribed eye drops consistently",
      "Protect eyes from injury",
      "Know your family history of glaucoma",
    ],
  },
  Hypertension: {
    symptoms: [
      "Blurred or reduced vision",
      "Swelling of the optic nerve",
      "Blood vessel narrowing in retina",
      "Headaches with vision changes",
      "Double vision episodes",
    ],
    prevention: [
      "Maintain healthy blood pressure levels",
      "Reduce sodium intake in diet",
      "Exercise regularly (150 min/week)",
      "Take blood pressure medications as prescribed",
      "Monitor blood pressure at home",
    ],
  },
  Myopia: {
    symptoms: [
      "Difficulty seeing distant objects clearly",
      "Squinting to see clearly",
      "Eye strain and headaches",
      "Fatigue when driving or playing sports",
      "Need to sit closer to screens",
    ],
    prevention: [
      "Spend more time outdoors (2+ hours daily)",
      "Follow the 20-20-20 screen rule",
      "Ensure proper lighting when reading",
      "Get regular eye examinations",
      "Limit prolonged close-up work",
    ],
  },
  Normal: {
    symptoms: [
      "No significant abnormalities detected",
      "Retinal structure appears healthy",
      "Optic nerve head looks normal",
      "Blood vessels show normal pattern",
    ],
    prevention: [
      "Continue regular eye check-ups annually",
      "Maintain a balanced, nutrient-rich diet",
      "Wear sunglasses outdoors",
      "Take screen breaks frequently",
      "Stay hydrated for tear film health",
    ],
  },
};

function BulletItem({ text, delayMs, isVisible }) {
  return (
    <li
      className={`flex items-start gap-2.5 text-sm leading-relaxed text-slate-600 transition-all duration-300 ${
        isVisible ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
      }`}
      style={{ transitionDelay: `${delayMs}ms` }}
    >
      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />
      {text}
    </li>
  );
}

function ClinicalInsights({ disease, onDownloadReport, isDownloading, onSendReport }) {
  const [isVisible, setIsVisible] = useState(false);
  const [showItems, setShowItems] = useState(false);
  const [expandedPanel, setExpandedPanel] = useState("both");

  const info = DISEASE_INFO[disease];

  useEffect(() => {
    setIsVisible(false);
    setShowItems(false);
    const t1 = window.setTimeout(() => setIsVisible(true), 80);
    const t2 = window.setTimeout(() => setShowItems(true), 350);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [disease]);

  if (!info) return null;

  const isNormal = disease === "Normal";

  return (
    <div
      className={`mt-8 transition-all duration-600 ease-out ${
        isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
      }`}
    >
      <div className="h-px bg-gradient-to-r from-transparent via-blue-400 to-transparent" />

      <div className="mt-8 mb-6 text-center">
        <div className="relative inline-block">
          <h3 className="text-xl font-bold text-slate-900 sm:text-2xl">
            Clinical Insights
          </h3>
          <span className="absolute -inset-x-4 -inset-y-1 -z-10 animate-[insightPulse_3s_ease-in-out_infinite] rounded-lg bg-blue-50" />
        </div>
        <p className="mt-2 text-sm text-slate-500">
          Symptoms &amp; Prevention for{" "}
          <span className="font-semibold text-blue-700">{disease}</span>
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div
          className={`group overflow-hidden rounded-2xl border bg-white shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl ${
            expandedPanel === "symptoms" || expandedPanel === "both"
              ? "border-blue-200 hover:border-blue-400"
              : "border-slate-200"
          }`}
        >
          <div className="h-1 bg-gradient-to-r from-blue-500 to-blue-400" />
          <button
            type="button"
            className="flex w-full items-center justify-between px-6 pt-5 pb-3 text-left"
            onClick={() =>
              setExpandedPanel((prev) =>
                prev === "symptoms" ? "both" : "symptoms"
              )
            }
          >
            <div className="flex items-center gap-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition-colors group-hover:bg-blue-100">
                <AlertCircle className="h-5 w-5" />
              </span>
              <span className="text-base font-semibold text-slate-900">
                {isNormal ? "Observations" : "Symptoms"}
              </span>
            </div>
            <ChevronDown
              className={`h-4 w-4 text-slate-400 transition-transform duration-300 ${
                expandedPanel === "prevention" ? "rotate-180" : ""
              }`}
            />
          </button>
          <div className="px-6 pb-6">
            <ul className="space-y-3">
              {info.symptoms.map((item, i) => (
                <BulletItem
                  key={item}
                  text={item}
                  delayMs={i * 100}
                  isVisible={showItems}
                />
              ))}
            </ul>
          </div>
        </div>

        <div
          className={`group overflow-hidden rounded-2xl border bg-white shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl ${
            expandedPanel === "prevention" || expandedPanel === "both"
              ? "border-teal-200 hover:border-teal-400"
              : "border-slate-200"
          }`}
        >
          <div className="h-1 bg-gradient-to-r from-teal-500 to-teal-400" />
          <button
            type="button"
            className="flex w-full items-center justify-between px-6 pt-5 pb-3 text-left"
            onClick={() =>
              setExpandedPanel((prev) =>
                prev === "prevention" ? "both" : "prevention"
              )
            }
          >
            <div className="flex items-center gap-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-600 transition-colors group-hover:bg-teal-100">
                <ShieldCheck className="h-5 w-5" />
              </span>
              <span className="text-base font-semibold text-slate-900">
                Prevention
              </span>
            </div>
            <ChevronDown
              className={`h-4 w-4 text-slate-400 transition-transform duration-300 ${
                expandedPanel === "symptoms" ? "rotate-180" : ""
              }`}
            />
          </button>
          <div className="px-6 pb-6">
            <ul className="space-y-3">
              {info.prevention.map((item, i) => (
                <BulletItem
                  key={item}
                  text={item}
                  delayMs={i * 100 + 150}
                  isVisible={showItems}
                />
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={onDownloadReport}
          disabled={isDownloading}
          className="inline-flex items-center gap-2 rounded-xl border border-blue-500 bg-white px-6 py-2.5 text-sm font-semibold text-blue-700 shadow-sm transition-all duration-300 hover:scale-[1.02] hover:bg-blue-50 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isDownloading && (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-blue-200 border-t-blue-600" />
          )}
          {isDownloading ? "Generating..." : "Download Report"}
        </button>
        {onSendReport && (
          <button
            type="button"
            onClick={onSendReport}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-teal-500 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-300 hover:scale-[1.02] hover:from-blue-600 hover:to-teal-600 hover:shadow-md hover:shadow-teal-500/20"
          >
            <MessageCircle className="h-4 w-4" />
            Send Report to Patient
          </button>
        )}
      </div>

      <style>
        {`@keyframes insightPulse {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.03); }
        }`}
      </style>
    </div>
  );
}

export default ClinicalInsights;
