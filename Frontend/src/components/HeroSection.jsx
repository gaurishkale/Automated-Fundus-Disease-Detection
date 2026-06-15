import retinaImage from "../../image_1.png";

function HeroSection({ onStartAnalysis }) {
  return (
    <section className="mx-auto grid w-full max-w-7xl gap-10 px-4 pb-16 pt-12 sm:px-6 lg:grid-cols-2 lg:items-center lg:px-8">
      <div>
        <h1 className="max-w-xl text-4xl font-bold leading-tight tracking-tight text-slate-900 sm:text-5xl">
          Detect Eye Diseases Early &amp; Accurately
        </h1>
        <p className="mt-5 max-w-lg text-lg leading-relaxed text-slate-600">
          Advanced AI technology that analyzes retinal images with clinical-grade precision.
        </p>
        <div className="mt-8 flex flex-wrap gap-4">
          <button
            className="rounded-xl bg-medical-600 px-6 py-3 text-sm font-semibold text-white shadow-soft hover:bg-medical-700"
            onClick={onStartAnalysis}
          >
            Start Free Screening
          </button>
          <button className="rounded-xl border border-medical-200 px-6 py-3 text-sm font-semibold text-medical-700 hover:bg-medical-50">
            Watch Demo
          </button>
        </div>
      </div>

      <div className="relative">
        <span className="absolute right-4 top-4 z-10 rounded-full bg-medical-teal px-3 py-1 text-xs font-semibold text-white shadow">
          AI Powered
        </span>
        <div className="overflow-hidden rounded-3xl border border-medical-100 bg-white p-3 shadow-soft">
          <img
            src={retinaImage}
            alt="Retinal screening preview"
            className="aspect-[4/3] w-full rounded-2xl object-cover shadow-sm"
          />
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
