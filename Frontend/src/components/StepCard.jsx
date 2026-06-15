function iconFor(stepNumber) {
  if (stepNumber === "01") {
    return (
      <svg viewBox="0 0 24 24" className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M3 15.75V8.25A2.25 2.25 0 015.25 6h13.5A2.25 2.25 0 0121 8.25v7.5A2.25 2.25 0 0118.75 18H5.25A2.25 2.25 0 013 15.75z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M7.5 10.5h9m-9 3h6" />
      </svg>
    );
  }
  if (stepNumber === "02") {
    return (
      <svg viewBox="0 0 24 24" className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor">
        <circle cx="12" cy="12" r="8" strokeWidth="1.8" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M9.5 12.5l1.7 1.7L14.8 10" />
      </svg>
    );
  }
  if (stepNumber === "03") {
    return (
      <svg viewBox="0 0 24 24" className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M7.5 4.5h9A1.5 1.5 0 0118 6v12a1.5 1.5 0 01-1.5 1.5h-9A1.5 1.5 0 016 18V6a1.5 1.5 0 011.5-1.5z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M9 9h6m-6 3h6m-6 3h4" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M4.5 12h15" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 4.5L19.5 12 12 19.5" />
    </svg>
  );
}

function StepCard({ stepNumber, title, description, isVisible, delayMs }) {
  return (
    <article
      className={`relative rounded-xl border border-slate-200 bg-white p-6 shadow-md transition-all duration-500 ${
        isVisible ? "translate-y-0 opacity-100" : "translate-y-5 opacity-0"
      }`}
      style={{ transitionDelay: `${delayMs}ms` }}
    >
      <span className="absolute right-4 top-4 rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
        {stepNumber}
      </span>
      <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-lg bg-blue-50">
        {iconFor(stepNumber)}
      </div>
      <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-slate-600">{description}</p>
    </article>
  );
}

export default StepCard;
