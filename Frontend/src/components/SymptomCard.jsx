import { useState } from "react";

function SymptomCard({ icon: Icon, title, description, tags, isVisible, delayMs }) {
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
            : "bg-blue-50 text-blue-600 group-hover:bg-blue-100"
        }`}
      >
        <Icon className="h-5 w-5" />
      </div>

      <h3 className="mb-1.5 text-base font-semibold text-slate-900">{title}</h3>
      <p className="mb-4 text-sm leading-relaxed text-slate-500">{description}</p>

      <div className="flex flex-wrap gap-1.5">
        {tags.map((tag) => (
          <span
            key={tag}
            className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-medium text-slate-600 transition-all duration-200 group-hover:-translate-y-px group-hover:bg-blue-50 group-hover:text-blue-700"
          >
            {tag}
          </span>
        ))}
      </div>

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

export default SymptomCard;
