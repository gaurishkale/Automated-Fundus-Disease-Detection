function iconForDisease(title) {
  if (title === "Diabetic Retinopathy") {
    return (
      <svg viewBox="0 0 24 24" className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M3 12s3.75-6 9-6 9 6 9 6-3.75 6-9 6-9-6-9-6z" />
        <circle cx="12" cy="12" r="2.5" strokeWidth="1.8" />
      </svg>
    );
  }
  if (title === "Glaucoma") {
    return (
      <svg viewBox="0 0 24 24" className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor">
        <circle cx="12" cy="12" r="8" strokeWidth="1.8" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 8v4l2 2" />
      </svg>
    );
  }
  if (title === "Age-related Macular Degeneration (AMD)") {
    return (
      <svg viewBox="0 0 24 24" className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M4.5 12h15M12 4.5v15" />
        <circle cx="12" cy="12" r="6" strokeWidth="1.8" />
      </svg>
    );
  }
  if (title === "Cataracts") {
    return (
      <svg viewBox="0 0 24 24" className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor">
        <circle cx="12" cy="12" r="8" strokeWidth="1.8" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M6.5 6.5l11 11" />
      </svg>
    );
  }
  if (title === "Retinal Detachment") {
    return (
      <svg viewBox="0 0 24 24" className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M4 12h8m0 0l-3-3m3 3l-3 3" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M14 7h6v10h-6z" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M6 9h12M6 12h9M6 15h7" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M4.5 6.5h15v11h-15z" />
    </svg>
  );
}

function DiseaseCard({ title, accuracy, description, isActive, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative w-full rounded-xl border bg-white p-6 text-left shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg ${
        isActive ? "scale-105 border-blue-500 shadow-lg" : "border-slate-200"
      }`}
    >
      <span className="absolute right-4 top-4 rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
        {accuracy}
      </span>
      <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-lg bg-blue-50">
        {iconForDisease(title)}
      </div>
      <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-slate-600">{description}</p>
    </button>
  );
}

export default DiseaseCard;
