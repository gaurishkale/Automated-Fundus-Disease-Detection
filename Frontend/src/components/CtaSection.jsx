import { useEffect, useRef, useState } from "react";
import { CheckCircle } from "lucide-react";

const ctaFeatures = [
  "Free initial screening",
  "No credit card required",
  "HIPAA compliant platform",
  "24/7 expert support",
];

function CtaSection({ onGetStarted }) {
  const [showCta, setShowCta] = useState(false);
  const [activeFeature, setActiveFeature] = useState(null);
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          setShowCta(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="pb-20 pt-4">
      <div
        className={`mx-auto w-full max-w-6xl rounded-3xl bg-gradient-to-r from-blue-600 to-teal-500 px-8 py-16 text-white shadow-xl transition-all duration-[600ms] ${
          showCta ? "translate-y-0 opacity-100" : "translate-y-5 opacity-0"
        }`}
      >
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Start Protecting Your Vision Today</h2>
          <p className="mx-auto mt-4 max-w-3xl text-base leading-relaxed text-blue-50/95 sm:text-lg">
            Join thousands of healthcare providers who trust EyeDetect for early disease detection and better patient
            outcomes.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            {ctaFeatures.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setActiveFeature((prev) => (prev === item ? null : item))}
                className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all duration-300 ${
                  activeFeature === item
                    ? "scale-105 border-white/90 bg-white/15 shadow-[0_0_14px_rgba(255,255,255,0.35)]"
                    : "border-white/35 bg-white/5"
                }`}
              >
                <CheckCircle className="h-4 w-4 text-white" />
                <span>{item}</span>
              </button>
            ))}
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <button
              type="button"
              onClick={onGetStarted}
              className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-blue-700 shadow-lg transition-all duration-300 hover:scale-[1.03] hover:shadow-xl"
            >
              Get Started Free →
            </button>
            <button
              type="button"
              className="rounded-full border border-white px-6 py-3 text-sm font-semibold text-white transition-all duration-300 hover:scale-[1.02] hover:bg-white/10"
            >
              Schedule Demo
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default CtaSection;
