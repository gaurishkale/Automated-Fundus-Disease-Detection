import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Eye,
  AlertCircle,
  Shield,
  Sun,
  Monitor,
  Heart,
  Droplets,
  CigaretteOff,
  EyeOff,
  Palette,
  Search as SearchIcon,
  Salad,
} from "lucide-react";
import Navbar from "./Navbar";
import SymptomCard from "./SymptomCard";
import PreventionCard from "./PreventionCard";
import Footer from "./Footer";

const symptoms = [
  {
    icon: Eye,
    title: "Blurred Vision",
    description: "Difficulty focusing on objects at any distance",
    tags: ["Diabetic Retinopathy", "Cataracts", "Macular Degeneration"],
  },
  {
    icon: AlertCircle,
    title: "Floaters & Flashes",
    description: "Seeing spots, strings, or flashes of light",
    tags: ["Retinal Detachment", "Vitreous Detachment"],
  },
  {
    icon: Shield,
    title: "Eye Pain & Redness",
    description: "Persistent discomfort or inflammation",
    tags: ["Glaucoma", "Uveitis", "Corneal Ulcer"],
  },
  {
    icon: EyeOff,
    title: "Night Vision Problems",
    description: "Difficulty seeing in low light conditions",
    tags: ["Retinitis Pigmentosa", "Vitamin A Deficiency"],
  },
  {
    icon: SearchIcon,
    title: "Peripheral Vision Loss",
    description: "Tunnel vision or side vision reduction",
    tags: ["Glaucoma", "Retinitis Pigmentosa"],
  },
  {
    icon: Palette,
    title: "Color Vision Changes",
    description: "Difficulty distinguishing colors",
    tags: ["Macular Degeneration", "Optic Neuritis"],
  },
];

const preventions = [
  {
    icon: Eye,
    title: "Regular Eye Exams",
    description: "Get comprehensive eye exams every 1-2 years",
    tips: [
      "Schedule annual dilated eye exams",
      "Track vision changes",
      "Update prescriptions regularly",
    ],
  },
  {
    icon: Sun,
    title: "UV Protection",
    description: "Protect eyes from harmful UV radiation",
    tips: [
      "Wear UV-blocking sunglasses",
      "Use wide-brimmed hats",
      "Avoid peak sun hours",
    ],
  },
  {
    icon: Monitor,
    title: "Screen Time Management",
    description: "Follow the 20-20-20 rule for digital wellness",
    tips: [
      "Take breaks every 20 minutes",
      "Look at something 20 feet away",
      "Blink frequently",
    ],
  },
  {
    icon: Salad,
    title: "Healthy Diet",
    description: "Consume nutrients that support eye health",
    tips: [
      "Eat leafy greens",
      "Include fatty fish weekly",
      "Add colorful vegetables",
    ],
  },
  {
    icon: Droplets,
    title: "Stay Hydrated",
    description: "Proper hydration improves tear film quality",
    tips: [],
  },
  {
    icon: CigaretteOff,
    title: "Avoid Smoking",
    description: "Smoking increases risk of eye diseases",
    tips: [],
  },
];

function Prevention() {
  const navigate = useNavigate();
  const [showHeader, setShowHeader] = useState(false);
  const [showSymptoms, setShowSymptoms] = useState(false);
  const [showPreventions, setShowPreventions] = useState(false);
  const symptomRef = useRef(null);
  const preventionRef = useRef(null);

  useEffect(() => {
    const timer = window.setTimeout(() => setShowHeader(true), 40);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShowSymptoms(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    if (symptomRef.current) observer.observe(symptomRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShowPreventions(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    if (preventionRef.current) observer.observe(preventionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Navbar onStartAnalysis={() => navigate("/analyze")} />

      <div className="h-1 bg-gradient-to-r from-blue-500 to-teal-400" />

      <section
        className={`bg-gradient-to-b from-slate-50 to-white px-4 pb-6 pt-14 text-center transition-all duration-700 ${
          showHeader ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
        }`}
      >
        <div className="mx-auto max-w-3xl">
          <span className="inline-flex rounded-full bg-blue-50 px-4 py-1.5 text-sm font-semibold text-blue-700">
            Eye Health Guide
          </span>
          <h1 className="mt-5 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Symptoms &amp; Prevention
          </h1>
          <p className="mt-4 text-base leading-relaxed text-slate-600 sm:text-lg">
            Learn about common eye disease symptoms and effective prevention strategies to maintain
            optimal eye health throughout your life.
          </p>
        </div>
      </section>

      <section ref={symptomRef} className="relative bg-slate-50/60 px-4 py-16 backdrop-blur-sm sm:px-6">
        <div className="mx-auto w-full max-w-7xl">
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {symptoms.map((symptom, index) => (
              <SymptomCard
                key={symptom.title}
                icon={symptom.icon}
                title={symptom.title}
                description={symptom.description}
                tags={symptom.tags}
                isVisible={showSymptoms}
                delayMs={index * 100}
              />
            ))}
          </div>
        </div>
      </section>

      <section ref={preventionRef} className="relative px-4 py-16 sm:px-6">
        <div className="mx-auto w-full max-w-7xl">
          <div className="mb-10 text-center">
            <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">
              Prevention Strategies
            </h2>
            <p className="mt-3 text-sm text-slate-500">
              Proactive habits that protect and strengthen your vision
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            {preventions.map((item, index) => (
              <PreventionCard
                key={item.title}
                icon={item.icon}
                title={item.title}
                description={item.description}
                tips={item.tips}
                isVisible={showPreventions}
                delayMs={index * 100}
              />
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default Prevention;
