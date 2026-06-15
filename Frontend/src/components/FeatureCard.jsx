function iconForFeature(title) {
  if (title === "Advanced AI Models") {
    return (
      <svg viewBox="0 0 24 24" className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor">
        <rect x="4" y="4" width="16" height="16" rx="2.5" strokeWidth="1.8" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M9 9h6v6H9z" />
      </svg>
    );
  }
  if (title === "Real-Time Results") {
    return (
      <svg viewBox="0 0 24 24" className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor">
        <circle cx="12" cy="12" r="8" strokeWidth="1.8" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 8v4l3 2" />
      </svg>
    );
  }
  if (title === "Enterprise Security") {
    return (
      <svg viewBox="0 0 24 24" className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M6.5 10.5V8A5.5 5.5 0 0112 2.5 5.5 5.5 0 0117.5 8v2.5" />
        <rect x="5" y="10.5" width="14" height="11" rx="2.5" strokeWidth="1.8" />
      </svg>
    );
  }
  if (title === "Detailed Analytics") {
    return (
      <svg viewBox="0 0 24 24" className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M4 19.5h16" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M7 16V9m5 7V6m5 10v-4" />
      </svg>
    );
  }
  if (title === "Global Accessibility") {
    return (
      <svg viewBox="0 0 24 24" className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor">
        <circle cx="12" cy="12" r="8" strokeWidth="1.8" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M4 12h16M12 4c2.5 2.2 2.5 13.8 0 16M12 4c-2.5 2.2-2.5 13.8 0 16" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M4.5 7.5h15v9h-15z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M8 12h8" />
    </svg>
  );
}

function FeatureCard({ title, description, isActive, onClick, isVisible, delayMs }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full rounded-xl border bg-white p-6 text-left shadow-md transition-all duration-300 ${
        isVisible ? "translate-y-0 opacity-100" : "translate-y-5 opacity-0"
      } ${isActive ? "scale-105 border-blue-500 shadow-lg" : "border-slate-200 hover:-translate-y-0.5 hover:shadow-lg"}`}
      style={{ transitionDelay: `${delayMs}ms` }}
    >
      <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-lg bg-blue-50">
        {iconForFeature(title)}
      </div>
      <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-slate-600">{description}</p>
    </button>
  );
}

export default FeatureCard;
