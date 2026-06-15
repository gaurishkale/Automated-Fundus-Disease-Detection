import { useNavigate } from "react-router-dom";

function Navbar({ onStartAnalysis, onHistory, onFindDoctors, onPrevention, onProgress }) {
  const navigate = useNavigate();
  const handleAnalyze = () => {
    if (onStartAnalysis) {
      onStartAnalysis();
      return;
    }
    navigate("/analyze");
  };

  const handleHistory = () => {
    if (onHistory) {
      onHistory();
      return;
    }
    navigate("/history");
  };

  const handleFindDoctors = () => {
    if (onFindDoctors) {
      onFindDoctors();
      return;
    }
    navigate("/find-doctors");
  };

  const handlePrevention = () => {
    if (onPrevention) {
      onPrevention();
      return;
    }
    navigate("/prevention");
  };

  return (
    <header className="sticky top-0 z-20 border-b border-slate-100 bg-white/95 backdrop-blur">
      <nav className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <button
          className="inline-flex items-center gap-3 text-xl font-semibold tracking-tight text-medical-700"
          onClick={() => navigate("/")}
          type="button"
        >
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-700 text-white shadow-md">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.8"
                d="M2.25 12s3.75-6.75 9.75-6.75S21.75 12 21.75 12 18 18.75 12 18.75 2.25 12 2.25 12z"
              />
              <circle cx="12" cy="12" r="2.5" strokeWidth="1.8" />
            </svg>
          </span>
          <span><span className="text-slate-900">Eye</span><span className="bg-gradient-to-r from-blue-500 to-teal-500 bg-clip-text text-transparent">Detect</span></span>
        </button>
        <ul className="hidden items-center gap-8 text-sm font-medium text-slate-600 lg:flex">
          <li className="cursor-pointer transition hover:text-medical-700" onClick={handleAnalyze}>
            Analyze
          </li>
          <li className="cursor-pointer transition hover:text-medical-700" onClick={handleHistory}>
            History
          </li>
          <li className="cursor-pointer transition hover:text-medical-700" onClick={handlePrevention}>Prevention</li>
          <li className="cursor-pointer transition hover:text-medical-700" onClick={handleFindDoctors}>Find Doctors</li>
          <li className="cursor-pointer transition hover:text-medical-700" onClick={() => { if (onProgress) { onProgress(); return; } navigate("/progress"); }}>Progress</li>
        </ul>
        <button
          className="rounded-xl bg-medical-600 px-4 py-2 text-sm font-semibold text-white shadow-soft transition hover:bg-medical-700"
          onClick={handleAnalyze}
        >
          Start Analysis
        </button>
      </nav>
    </header>
  );
}

export default Navbar;
