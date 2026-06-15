import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import CtaSection from "./components/CtaSection";
import Footer from "./components/Footer";
import Navbar from "./components/Navbar";
import PatientInfoModal, { getStoredPatientInfo } from "./components/PatientInfoModal";
import DiseaseCard from "./components/DiseaseCard";
import FeatureCard from "./components/FeatureCard";
import StepCard from "./components/StepCard";
import retinaImage from "../image_1.png";

const steps = [
  {
    stepNumber: "01",
    title: "Upload Image",
    description:
      "Simply upload a retinal photograph or fundus image from any compatible device or imaging system.",
  },
  {
    stepNumber: "02",
    title: "AI Analysis",
    description:
      "Our advanced neural network analyzes the image, detecting subtle patterns invisible to the human eye.",
  },
  {
    stepNumber: "03",
    title: "Get Report",
    description:
      "Receive a comprehensive diagnostic report with risk scores, visualizations, and recommendations.",
  },
  {
    stepNumber: "04",
    title: "Take Action",
    description:
      "Share results with healthcare providers and get personalized treatment pathway suggestions.",
  },
];

const diseases = [
  {
    title: "Diabetic Retinopathy",
    accuracy: "99.1%",
    description: "Detect early signs of diabetes-related retinal damage before vision loss occurs.",
  },
  {
    title: "Glaucoma",
    accuracy: "98.7%",
    description: "Identify optic nerve damage patterns indicative of glaucoma progression.",
  },
  {
    title: "Age-related Macular Degeneration (AMD)",
    accuracy: "98.9%",
    description: "Spot age-related changes in the macula that affect central vision.",
  },
  {
    title: "Cataracts",
    accuracy: "97.8%",
    description: "Assess lens opacity levels and track cataract progression over time.",
  },
  {
    title: "Retinal Detachment",
    accuracy: "96.5%",
    description: "Detect warning signs of retinal tears and detachment risks.",
  },
  {
    title: "Hypertensive Retinopathy",
    accuracy: "97.2%",
    description: "Monitor blood pressure effects on retinal blood vessels.",
  },
];

const features = [
  {
    title: "Advanced AI Models",
    description:
      "Deep learning algorithms trained on 5M+ retinal images from leading medical institutions worldwide.",
  },
  {
    title: "Real-Time Results",
    description:
      "Get comprehensive analysis results in under 30 seconds with our optimized inference engine.",
  },
  {
    title: "Enterprise Security",
    description:
      "End-to-end encryption, HIPAA compliance, and SOC 2 certification for complete data protection.",
  },
  {
    title: "Detailed Analytics",
    description:
      "Track patient progress with longitudinal analysis, trend visualization, and comparison reports.",
  },
  {
    title: "Global Accessibility",
    description:
      "Available in 40+ countries with support for multiple imaging devices and file formats.",
  },
  {
    title: "Clinical Integration",
    description:
      "Seamlessly integrate with EHR systems, PACS, and existing clinical workflows via our API.",
  },
];

function Home() {
  const navigate = useNavigate();
  const [showHero, setShowHero] = useState(false);
  const [showSteps, setShowSteps] = useState(false);
  const [activeCard, setActiveCard] = useState(null);
  const [showFeatures, setShowFeatures] = useState(false);
  const [activeFeature, setActiveFeature] = useState(null);
  const [isPatientModalOpen, setIsPatientModalOpen] = useState(false);
  const stepsSectionRef = useRef(null);
  const featuresSectionRef = useRef(null);

  useEffect(() => {
    const timer = window.setTimeout(() => setShowHero(true), 40);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          setShowSteps(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );

    if (stepsSectionRef.current) {
      observer.observe(stepsSectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          setShowFeatures(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );

    if (featuresSectionRef.current) {
      observer.observe(featuresSectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleStartAnalysis = () => {
    if (getStoredPatientInfo()) {
      navigate("/analyze");
    } else {
      setIsPatientModalOpen(true);
    }
  };

  const handlePatientSave = () => {
    setIsPatientModalOpen(false);
    navigate("/analyze");
  };

  const handleWatchDemo = () => {
    window.open("https://youtu.be/h2SN0teZJwE?si=XwRFmnxMsqO04ltL", "_blank", "noopener,noreferrer");
  };

  return (
    <div className="min-h-screen bg-white">
      <style>
        {`
          @keyframes hero-float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-8px); }
          }
        `}
      </style>
      <Navbar onStartAnalysis={handleStartAnalysis} />
      <section className="relative overflow-hidden bg-gradient-to-b from-[#eef6fb] via-[#edf5fb] to-[#e9f2f8]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(59,130,246,0.12),transparent_40%)]" />
        <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 pb-14 pt-12 sm:px-6 lg:grid-cols-2 lg:items-center lg:px-8">
          <div
            className={`relative z-10 transition-all duration-700 ${
              showHero ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
            }`}
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/90 px-4 py-1.5 text-xs font-semibold text-slate-600 shadow-sm">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              AI-Powered Eye Health Analysis
            </div>

            <h1 className="mt-6 text-2xl font-extrabold leading-tight tracking-tight text-[#0f172a] sm:text-3xl lg:text-5xl">
              <span className="block">Detect Eye Diseases</span>
              <span className="block bg-gradient-to-r from-blue-700 to-sky-500 bg-clip-text text-transparent">
                Early &amp; Accurately
              </span>
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-600">
              Advanced AI technology that analyzes retinal images to detect conditions like diabetic retinopathy,
              glaucoma, and macular degeneration with clinical-grade precision.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <button
                type="button"
                onClick={handleStartAnalysis}
                className="rounded-full bg-gradient-to-r from-blue-700 to-cyan-500 px-7 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition-all duration-300 hover:scale-[1.02] hover:brightness-110"
              >
                Start Free Screening →
              </button>
              <button
                type="button"
                onClick={handleWatchDemo}
                className="rounded-xl border border-blue-500 bg-white px-7 py-3 text-sm font-semibold text-blue-700 transition-all duration-300 hover:scale-[1.01] hover:bg-blue-50"
              >
                Watch Demo
              </button>
            </div>

            <div className="mt-8 flex flex-wrap gap-5 text-sm font-medium text-slate-500">
              <div className="inline-flex items-center gap-2">
                <svg viewBox="0 0 24 24" className="h-4 w-4 text-cyan-600" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 3l7 4v5c0 5-3.3 8.7-7 10-3.7-1.3-7-5-7-10V7l7-4z" />
                </svg>
                HIPAA Compliant
              </div>
              <div className="inline-flex items-center gap-2">
                <svg viewBox="0 0 24 24" className="h-4 w-4 text-cyan-600" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 8v4l3 2" />
                  <circle cx="12" cy="12" r="8" strokeWidth="1.8" />
                </svg>
                Results in 30 Seconds
              </div>
              <div className="inline-flex items-center gap-2">
                <svg viewBox="0 0 24 24" className="h-4 w-4 text-cyan-600" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M4 12h16M12 4v16" />
                </svg>
                99.2% Accuracy
              </div>
            </div>
          </div>

          <div
            className={`relative transition-all duration-700 ${
              showHero ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
            }`}
            style={{ animation: "hero-float 5.5s ease-in-out infinite" }}
          >
            <div className="relative overflow-hidden rounded-2xl shadow-2xl shadow-sky-900/15">
              <img
                src={retinaImage}
                alt="AI retina screening"
                className="aspect-[16/10] w-full object-cover"
              />
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_25%,rgba(34,211,238,0.2),transparent_45%)]" />
            </div>

            <div
              className={`absolute right-4 top-4 rounded-xl bg-white/95 px-4 py-2 text-sm font-semibold text-slate-700 shadow-md transition-all duration-500 ${
                showHero ? "translate-y-0 opacity-100" : "-translate-y-2 opacity-0"
              }`}
              style={{ transitionDelay: "180ms" }}
            >
              FDA Cleared
            </div>

            <div
              className={`absolute -bottom-4 left-4 rounded-xl bg-white px-4 py-3 shadow-lg transition-all duration-500 ${
                showHero ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
              }`}
              style={{ transitionDelay: "320ms" }}
            >
              <div className="flex items-center gap-3">
                <span className="rounded-lg bg-blue-600 px-2 py-1 text-lg font-bold text-white">2M+</span>
                <p className="text-sm font-semibold leading-tight text-slate-700">
                  Eyes Scanned
                  <br />
                  This Year
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section ref={stepsSectionRef} className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex rounded-full bg-blue-50 px-4 py-1.5 text-sm font-semibold text-blue-700">
            Simple Process
          </span>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">How It Works</h2>
          <p className="mt-4 text-base leading-relaxed text-slate-600">
            Get accurate eye disease detection in just four simple steps. Our AI-powered platform makes early
            diagnosis accessible to everyone.
          </p>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {steps.map((step, index) => (
            <StepCard
              key={step.stepNumber}
              stepNumber={step.stepNumber}
              title={step.title}
              description={step.description}
              isVisible={showSteps}
              delayMs={index * 100}
            />
          ))}
        </div>
      </section>

      <section className="bg-slate-50/50 py-16">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex rounded-full bg-blue-50 px-4 py-1.5 text-sm font-semibold text-blue-700">
              Comprehensive Detection
            </span>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Diseases We Detect
            </h2>
            <p className="mt-4 text-base leading-relaxed text-slate-600">
              Our AI model is trained on millions of retinal images to detect multiple eye conditions with exceptional
              accuracy.
            </p>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {diseases.map((disease) => (
              <DiseaseCard
                key={disease.title}
                title={disease.title}
                accuracy={disease.accuracy}
                description={disease.description}
                isActive={activeCard === disease.title}
                onClick={() => setActiveCard((prev) => (prev === disease.title ? null : disease.title))}
              />
            ))}
          </div>
        </div>
      </section>

      <section ref={featuresSectionRef} className="py-16">
        <div
          className={`mx-auto grid w-full max-w-7xl gap-10 px-4 transition-all duration-500 sm:px-6 lg:grid-cols-2 lg:px-8 ${
            showFeatures ? "translate-y-0 opacity-100" : "translate-y-5 opacity-0"
          }`}
        >
          <div>
            <span className="inline-flex rounded-full bg-blue-50 px-4 py-1.5 text-sm font-semibold text-blue-700">
              Why Choose Us
            </span>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Built for Healthcare Professionals
            </h2>
            <p className="mt-4 text-base leading-relaxed text-slate-600">
              Our platform combines cutting-edge AI technology with clinical expertise to deliver reliable, actionable
              insights that support better patient outcomes.
            </p>

            <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-3">
              <div>
                <p className="text-4xl font-bold text-blue-600">99.2%</p>
                <p className="mt-1 text-sm font-medium text-slate-600">Accuracy Rate</p>
              </div>
              <div>
                <p className="text-4xl font-bold text-blue-600">500+</p>
                <p className="mt-1 text-sm font-medium text-slate-600">Medical Partners</p>
              </div>
              <div>
                <p className="text-4xl font-bold text-blue-600">40+</p>
                <p className="mt-1 text-sm font-medium text-slate-600">Countries</p>
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {features.map((feature, index) => (
              <FeatureCard
                key={feature.title}
                title={feature.title}
                description={feature.description}
                isVisible={showFeatures}
                delayMs={index * 100}
                isActive={activeFeature === feature.title}
                onClick={() => setActiveFeature((prev) => (prev === feature.title ? null : feature.title))}
              />
            ))}
          </div>
        </div>
      </section>

      <CtaSection onGetStarted={handleStartAnalysis} />
      <Footer />

      <PatientInfoModal
        isOpen={isPatientModalOpen}
        onClose={() => setIsPatientModalOpen(false)}
        onSave={handlePatientSave}
      />
    </div>
  );
}

export default Home;
