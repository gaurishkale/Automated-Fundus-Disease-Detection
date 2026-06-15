import { useEffect, useState } from "react";
import { ShieldAlert } from "lucide-react";

const RISK_CONFIG = {
  green: { badge: "bg-emerald-100 text-emerald-700", bar: "bg-emerald-500", glow: "" },
  orange: { badge: "bg-orange-100 text-orange-700", bar: "bg-orange-500", glow: "" },
  red: { badge: "bg-red-100 text-red-700", bar: "bg-red-500", glow: "animate-[riskPulse_2s_ease-in-out_infinite]" },
};

function AnimatedPercent({ value }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const duration = 1000;
    const start = performance.now();

    function tick(now) {
      const ratio = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - ratio, 3);
      setDisplay(Math.round(eased * value * 10) / 10);
      if (ratio < 1) requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
  }, [value]);

  return (
    <span className="text-lg font-bold text-slate-800">
      {display.toFixed(1)}
      <span className="text-sm font-semibold text-slate-500">%</span>
    </span>
  );
}

function RiskAssessment({ confidence, riskData }) {
  const [visible, setVisible] = useState(false);
  const [barWidth, setBarWidth] = useState(0);

  const config = RISK_CONFIG[riskData?.color] || RISK_CONFIG.orange;

  useEffect(() => {
    const t1 = window.setTimeout(() => setVisible(true), 60);
    const t2 = window.setTimeout(() => setBarWidth(confidence), 200);
    return () => { window.clearTimeout(t1); window.clearTimeout(t2); };
  }, [confidence]);

  return (
    <div
      className={`mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-lg transition-all duration-500 hover:shadow-xl ${config.glow} ${
        visible ? "translate-y-0 opacity-100" : "translate-y-5 opacity-0"
      }`}
    >
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
            <ShieldAlert className="h-5 w-5" />
          </span>
          <h3 className="text-base font-semibold text-slate-900">Risk Level Assessment</h3>
        </div>
        <span className={`rounded-full px-4 py-1.5 text-sm font-semibold ${config.badge}`}>
          {riskData?.label}
        </span>
      </div>

      <div className="flex items-center gap-4">
        <div className="min-w-0 flex-1">
          <div className="h-4 overflow-hidden rounded-full bg-gray-200">
            <div
              className={`h-full rounded-full transition-all duration-1000 ease-out ${config.bar}`}
              style={{ width: `${barWidth}%` }}
            />
          </div>
        </div>
        <AnimatedPercent value={confidence} />
      </div>

      <div className="mt-4 flex flex-wrap gap-4 border-t border-slate-100 pt-4 text-xs font-medium text-slate-500">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> Low Risk
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-orange-500" /> Moderate Risk
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-red-500" /> High Risk
        </span>
      </div>

      <style>
        {`@keyframes riskPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(239,68,68,0); }
          50% { box-shadow: 0 0 18px 2px rgba(239,68,68,0.18); }
        }`}
      </style>
    </div>
  );
}

export default RiskAssessment;
