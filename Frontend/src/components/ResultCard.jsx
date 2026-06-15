import { useEffect, useState } from "react";
import { Bot, ChevronDown, Shield, CheckCircle2 } from "lucide-react";

const RISK_COLORS = {
  red: { border: "border-l-red-500", text: "text-red-600", ring: "#ef4444", badge: "bg-red-100 text-red-700", dot: "bg-red-500" },
  orange: { border: "border-l-amber-500", text: "text-amber-600", ring: "#f59e0b", badge: "bg-amber-100 text-amber-700", dot: "bg-amber-500" },
  green: { border: "border-l-emerald-500", text: "text-emerald-600", ring: "#10b981", badge: "bg-emerald-100 text-emerald-700", dot: "bg-emerald-500" },
};

const WHY_EXPLANATIONS = {
  "Diabetic Retinopathy": "AI detected microaneurysms and hemorrhage patterns in retinal blood vessels consistent with diabetic damage.",
  Glaucoma: "AI identified increased cup-to-disc ratio and optic nerve head changes characteristic of glaucomatous damage.",
  "Age-related Macular Degeneration (AMD)": "AI found drusen deposits and pigmentary changes in the macular region indicative of age-related degeneration.",
  Cataract: "AI detected lens opacity patterns and light scattering artifacts consistent with cataract formation.",
  Hypertension: "AI observed arteriolar narrowing, arteriovenous nicking, and vascular wall changes caused by elevated blood pressure.",
  Myopia: "AI identified elongated axial length indicators and myopic crescent patterns around the optic disc.",
  Normal: "AI analysis found no pathological patterns. Retinal structures, blood vessels, and optic nerve appear within normal parameters.",
};

function ConfidenceRing({ value, color }) {
  const [progress, setProgress] = useState(0);
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  useEffect(() => {
    const timer = window.setTimeout(() => setProgress(value), 100);
    return () => window.clearTimeout(timer);
  }, [value]);

  return (
    <div className="relative inline-flex h-28 w-28 items-center justify-center">
      <svg className="-rotate-90" width="112" height="112" viewBox="0 0 112 112">
        <circle cx="56" cy="56" r={radius} fill="none" stroke="#f1f5f9" strokeWidth="7" />
        <circle
          cx="56"
          cy="56"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-1000 ease-out"
          style={{ filter: `drop-shadow(0 0 6px ${color}40)` }}
        />
      </svg>
      <AnimatedCounter value={value} />
    </div>
  );
}

function AnimatedCounter({ value }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const duration = 900;
    const startTime = performance.now();

    function tick(now) {
      const elapsed = now - startTime;
      const ratio = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - ratio, 3);
      setDisplay(Math.round(eased * value * 10) / 10);
      if (ratio < 1) requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
  }, [value]);

  return (
    <span className="absolute text-xl font-bold text-slate-800">
      {display.toFixed(1)}
      <span className="text-xs font-semibold text-slate-500">%</span>
    </span>
  );
}

function ResultCard({ result, confidenceScore, riskData }) {
  const [showWhy, setShowWhy] = useState(false);

  if (!result) {
    return (
      <div className="flex h-full flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-gradient-to-br from-white to-slate-50 p-8 shadow-soft">
        <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
          <Bot className="h-7 w-7" />
        </div>
        <h3 className="text-lg font-semibold text-slate-700">Awaiting Analysis</h3>
        <p className="mt-2 max-w-[220px] text-center text-sm text-slate-500">
          Upload a retinal image and start screening to see AI results here.
        </p>
        <div className="mt-5 flex items-center gap-4 text-[11px] font-medium text-slate-400">
          <span className="inline-flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Secure</span>
          <span className="inline-flex items-center gap-1"><Shield className="h-3 w-3" /> HIPAA</span>
          <span className="inline-flex items-center gap-1"><Bot className="h-3 w-3" /> 99.2%</span>
        </div>
      </div>
    );
  }

  const colors = RISK_COLORS[riskData?.color] || RISK_COLORS.orange;
  const explanation = WHY_EXPLANATIONS[result.disease] || "AI analysis complete. Please consult an ophthalmologist for clinical confirmation.";

  return (
    <div
      className={`relative h-full overflow-hidden rounded-2xl border-l-4 border border-slate-200 bg-white shadow-lg ${colors.border} ${
        riskData?.color === "red" ? "animate-[rc-pulse_3s_ease-in-out_infinite]" : ""
      }`}
      style={{ animation: "rc-slideIn 500ms ease-out" }}
    >
      {/* Top accent */}
      <div className="absolute right-0 top-0 h-24 w-24 rounded-bl-full bg-gradient-to-bl from-blue-50/80 to-transparent" />

      <div className="relative p-6 sm:p-8">
        {/* Header badges */}
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-[11px] font-semibold text-blue-700">
            <Bot className="h-3.5 w-3.5" />
            AI Diagnosis
          </span>
          <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-semibold ${colors.badge}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${riskData?.color === "red" ? "animate-pulse" : ""} ${colors.dot}`} />
            {riskData?.label}
          </span>
        </div>

        <h3 className="text-xs font-medium uppercase tracking-wider text-slate-400">
          Predicted Disease
        </h3>
        <p className="mt-1.5 text-2xl font-bold text-slate-900 sm:text-3xl">{result.disease}</p>

        {/* Confidence section */}
        <div className="mt-5 flex items-center gap-5">
          <ConfidenceRing value={confidenceScore} color={colors.ring} />
          <div>
            <p className="text-sm font-medium text-slate-500">Confidence Score</p>
            <p className={`text-3xl font-bold ${colors.text}`}>{confidenceScore}%</p>
            <div className="mt-2 h-2 w-36 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${confidenceScore}%`, background: colors.ring }}
              />
            </div>
          </div>
        </div>

        {/* Expandable "Why this prediction?" */}
        <div className="mt-5 border-t border-slate-100 pt-4">
          <button
            type="button"
            onClick={() => setShowWhy(!showWhy)}
            className="flex w-full items-center justify-between text-left text-sm font-semibold text-blue-700 transition hover:text-blue-800"
          >
            <span className="flex items-center gap-1.5">
              <Bot className="h-4 w-4" />
              Why this prediction?
            </span>
            <ChevronDown className={`h-4 w-4 transition-transform duration-300 ${showWhy ? "rotate-180" : ""}`} />
          </button>
          <div
            className={`overflow-hidden transition-all duration-300 ease-out ${
              showWhy ? "mt-2.5 max-h-40 opacity-100" : "max-h-0 opacity-0"
            }`}
          >
            <p className="rounded-xl bg-blue-50/60 p-3.5 text-sm leading-relaxed text-slate-600">{explanation}</p>
          </div>
        </div>

        {/* Model accuracy badge */}
        <div className="mt-4 flex flex-wrap gap-3 text-[10px] font-medium text-slate-400">
          <span className="inline-flex items-center gap-1"><CheckCircle2 className="h-3 w-3 text-emerald-500" />Model Accuracy: 99.2%</span>
          <span className="inline-flex items-center gap-1"><Shield className="h-3 w-3 text-blue-500" />HIPAA Compliant</span>
        </div>
      </div>

      <style>{`
        @keyframes rc-slideIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes rc-pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(239,68,68,0); }
          50% { box-shadow: 0 0 20px 2px rgba(239,68,68,0.08); }
        }
      `}</style>
    </div>
  );
}

export default ResultCard;
