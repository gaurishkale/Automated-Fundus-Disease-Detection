import { useState } from "react";
import { CheckCircle } from "lucide-react";

function PreventionCard({ icon: Icon, title, description, tips, isVisible, delayMs }) {
  const [isActive, setIsActive] = useState(false);

  return (
    <article
      onClick={() => setIsActive((prev) => !prev)}
      className={`group relative cursor-pointer overflow-hidden rounded-xl border bg-white p-6 shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl ${
        isActive
          ? "border-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.15)]"
          : "border-slate-200"
      } ${
        isVisible ? "translate-y-0 opacity-100" : "translate-y-7 opacity-0"
      }`}
      style={{ transitionDelay: `${delayMs}ms` }}
    >
      {isActive && (
        <span className="pointer-events-none absolute inset-0 animate-[cardPulse_1.2s_ease-out]" />
      )}

      <div
        className={`mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl transition-all duration-300 ${
          isActive
            ? "bg-gradient-to-br from-blue-500 to-teal-500 text-white shadow-md"
            : "bg-teal-50 text-teal-600 group-hover:bg-teal-100"
        }`}
      >
        <Icon className="h-5 w-5" />
      </div>

      <h3 className="mb-1.5 text-base font-semibold text-slate-900">{title}</h3>
      <p className="mb-4 text-sm leading-relaxed text-slate-500">{description}</p>

      {tips && tips.length > 0 && (
        <ul className="space-y-2">
          {tips.map((tip) => (
            <li key={tip} className="flex items-start gap-2 text-sm text-slate-600">
              <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-teal-500" />
              <span className="leading-relaxed">{tip}</span>
            </li>
          ))}
        </ul>
      )}

      <style>
        {`@keyframes cardPulse {
          0% { background: rgba(59,130,246,0.08); }
          50% { background: rgba(59,130,246,0.04); }
          100% { background: transparent; }
        }`}
      </style>
    </article>
  );
}

export default PreventionCard;
