import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Eye,
  ShieldCheck,
  AlertTriangle,
  Activity,
  Stethoscope,
  Brain,
} from "lucide-react";

const DISEASE_INFO = {
  "Diabetic Retinopathy": {
    findings: "Microvascular abnormalities detected in the macular and vascular region. Small red lesions (microaneurysms) near macula, localised retinal haemorrhages, and abnormal blood vessel branching patterns observed.",
    symptoms: [
      "Floaters or dark spots in vision",
      "Blurred or fluctuating vision",
      "Dark or empty areas in visual field",
      "Difficulty with color perception",
    ],
    prevention: [
      "Control blood sugar levels strictly",
      "Monitor blood pressure regularly",
      "Get annual dilated eye exams",
      "Maintain a healthy diet and exercise",
    ],
    recommendation: "Schedule detailed retinal examination immediately. Monitor blood glucose and HbA1c levels. Begin or review anti-VEGF treatment plan. Consult ophthalmologist within 1 week.",
  },
  Glaucoma: {
    findings: "Optic nerve structural changes detected in the optic disc area. Enlarged cup-to-disc ratio, nerve fibre layer thinning at superior pole, and peripapillary retinal atrophy signs noted.",
    symptoms: [
      "Gradual loss of peripheral vision",
      "Tunnel vision in advanced stages",
      "Severe eye pain and headaches",
      "Halos around lights",
    ],
    prevention: [
      "Get regular eye pressure checks",
      "Exercise regularly to reduce eye pressure",
      "Use prescribed eye drops consistently",
      "Know your family history of glaucoma",
    ],
    recommendation: "Initiate intraocular pressure-lowering therapy. Schedule visual field testing within 4 weeks. Get regular IOP measurements every 3 months.",
  },
  "Age-related Macular Degeneration (AMD)": {
    findings: "Macular degeneration patterns detected in central macula. Drusen deposits identified, retinal pigment epithelium irregularities, and subretinal fluid indicators present.",
    symptoms: [
      "Blurred or distorted central vision",
      "Dark or empty areas in central vision",
      "Difficulty recognizing faces",
      "Straight lines appearing wavy",
    ],
    prevention: [
      "Regular comprehensive eye exams",
      "Quit smoking immediately",
      "Eat leafy green vegetables and fish",
      "Wear UV-protective sunglasses",
    ],
    recommendation: "Refer to retinal specialist urgently. Consider AREDS2 nutritional supplements. Monitor central vision with Amsler grid daily.",
  },
  Cataract: {
    findings: "Lens opacity patterns identified in the crystalline lens region. Nuclear sclerosis patterns, reduced light transmission, and posterior subcapsular opacity markers detected.",
    symptoms: [
      "Cloudy or blurred vision",
      "Increased sensitivity to glare",
      "Fading or yellowing of colors",
      "Difficulty seeing at night",
    ],
    prevention: [
      "Wear sunglasses with UV protection",
      "Quit smoking and limit alcohol",
      "Eat antioxidant-rich fruits and vegetables",
      "Manage diabetes and blood sugar levels",
    ],
    recommendation: "Consult ophthalmologist for surgical evaluation. Assess visual acuity impact on daily activities. Schedule cataract surgery if vision is significantly impaired.",
  },
  Hypertension: {
    findings: "Hypertensive retinopathy signs detected in the retinal vasculature. Arteriovenous nicking at vessel crossings, generalised arteriolar narrowing, and flame-shaped haemorrhages near disc.",
    symptoms: [
      "Blurred or reduced vision",
      "Swelling of the optic nerve",
      "Blood vessel narrowing in retina",
      "Headaches with vision changes",
    ],
    prevention: [
      "Maintain healthy blood pressure levels",
      "Reduce sodium intake in diet",
      "Exercise regularly (150 min/week)",
      "Take blood pressure medications as prescribed",
    ],
    recommendation: "Urgently manage systemic blood pressure. Reduce sodium intake and adopt DASH diet. Schedule cardiology and nephrology follow-up.",
  },
  Myopia: {
    findings: "Axial length and peripheral changes detected. Temporal disc crescent indicative of high myopia, peripheral retinal thinning, and lattice degeneration risk markers present.",
    symptoms: [
      "Difficulty seeing distant objects clearly",
      "Squinting to see clearly",
      "Eye strain and headaches",
      "Fatigue when driving or playing sports",
    ],
    prevention: [
      "Spend more time outdoors (2+ hours daily)",
      "Follow the 20-20-20 screen rule",
      "Ensure proper lighting when reading",
      "Limit prolonged close-up work",
    ],
    recommendation: "Get updated refraction and lens prescription. Spend 2+ hours outdoors daily. Consider orthokeratology or atropine therapy.",
  },
  Normal: {
    findings: "Healthy retinal architecture confirmed across full retinal field. Optic disc margins clear, blood vessel calibre normal, no drusen or exudates detected, and foveal reflex present.",
    symptoms: [
      "No significant abnormalities detected",
      "Retinal structure appears healthy",
      "Optic nerve head looks normal",
      "Blood vessels show normal pattern",
    ],
    prevention: [
      "Continue regular eye check-ups annually",
      "Maintain a balanced, nutrient-rich diet",
      "Wear sunglasses outdoors",
      "Take screen breaks frequently",
    ],
    recommendation: "Continue annual comprehensive eye examinations. Maintain a diet rich in omega-3 and leafy greens. Wear UV-protective sunglasses outdoors.",
  },
};

function getRisk(disease, confidence) {
  const name = (disease || "").toLowerCase();
  if (name === "normal" || name === "healthy")
    return { label: "Healthy", color: "emerald", pct: Math.min(confidence, 100) };
  if (confidence < 60)
    return { label: "Low Risk", color: "emerald", pct: Math.min(confidence, 100) };
  if (confidence < 85)
    return { label: "Moderate Risk", color: "amber", pct: Math.min(confidence, 100) };
  return { label: "High Risk", color: "red", pct: Math.min(confidence, 100) };
}

const overlay = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

const panel = {
  hidden: { opacity: 0, scale: 0.93, y: 24 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: "spring", damping: 28, stiffness: 340 },
  },
  exit: { opacity: 0, scale: 0.93, y: 24, transition: { duration: 0.18 } },
};

const BAR_COLORS = {
  emerald: "from-emerald-400 to-emerald-600",
  amber: "from-amber-400 to-amber-600",
  red: "from-red-400 to-red-600",
};

const BADGE_COLORS = {
  emerald: "bg-emerald-100 text-emerald-700",
  amber: "bg-amber-100 text-amber-700",
  red: "bg-red-100 text-red-700",
};

function ReportPreviewModal({ scan, onClose }) {
  if (!scan) return null;

  const info = DISEASE_INFO[scan.disease] || DISEASE_INFO.Normal;
  const risk = getRisk(scan.disease, scan.confidence);
  const scanDate = new Date(scan.date);

  return (
    <AnimatePresence>
      <motion.div
        key="overlay"
        variants={overlay}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/45 px-4 py-8 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          key="panel"
          variants={panel}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="relative w-full max-w-2xl rounded-2xl bg-white shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Gradient top bar */}
          <div className="h-1.5 rounded-t-2xl bg-gradient-to-r from-blue-600 via-teal-500 to-blue-600" />

          <button
            onClick={onClose}
            type="button"
            className="absolute right-4 top-4 z-10 rounded-full p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="p-6 sm:p-8">
            {/* Header */}
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-teal-500 text-white shadow-md">
                <Eye className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Diagnostic Report Preview
                </h2>
                <p className="text-xs text-slate-500">
                  Scan ID: ED-{String(scan.id).slice(-6)} &middot;{" "}
                  {scanDate.toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}{" "}
                  at{" "}
                  {scanDate.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>

            {/* Diagnosis + Confidence + Risk */}
            <div className="mb-6 rounded-xl border border-slate-200 bg-slate-50/70 p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    AI Diagnosis
                  </p>
                  <p className="mt-1 text-xl font-bold text-slate-900">
                    {scan.disease}
                  </p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-bold ${BADGE_COLORS[risk.color]}`}
                >
                  {risk.label}
                </span>
              </div>

              <div className="mt-4">
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-500">
                    Confidence Score
                  </span>
                  <span className="font-bold text-slate-800">
                    {scan.confidence}%
                  </span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-slate-200">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${risk.pct}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className={`h-full rounded-full bg-gradient-to-r ${BAR_COLORS[risk.color]}`}
                  />
                </div>
              </div>
            </div>

            {/* AI Findings */}
            <Section
              icon={<Brain className="h-4 w-4" />}
              iconBg="bg-blue-100 text-blue-600"
              title="AI Explanation"
            >
              <p className="text-sm leading-relaxed text-slate-600">
                {info.findings}
              </p>
            </Section>

            {/* Symptoms */}
            <Section
              icon={<Activity className="h-4 w-4" />}
              iconBg="bg-orange-100 text-orange-600"
              title="Symptoms Information"
            >
              <ul className="space-y-2">
                {info.symptoms.map((s) => (
                  <li
                    key={s}
                    className="flex items-start gap-2 text-sm text-slate-600"
                  >
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-orange-400" />
                    {s}
                  </li>
                ))}
              </ul>
            </Section>

            {/* Prevention */}
            <Section
              icon={<ShieldCheck className="h-4 w-4" />}
              iconBg="bg-teal-100 text-teal-600"
              title="Prevention Tips"
            >
              <ul className="space-y-2">
                {info.prevention.map((p) => (
                  <li
                    key={p}
                    className="flex items-start gap-2 text-sm text-slate-600"
                  >
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-teal-400" />
                    {p}
                  </li>
                ))}
              </ul>
            </Section>

            {/* Doctor Recommendation */}
            <Section
              icon={<Stethoscope className="h-4 w-4" />}
              iconBg="bg-purple-100 text-purple-600"
              title="Doctor Recommendation"
            >
              <p className="text-sm leading-relaxed text-slate-600">
                {info.recommendation}
              </p>
            </Section>

            {/* Disclaimer */}
            <div className="mt-6 flex items-start gap-2 rounded-lg bg-amber-50 px-4 py-3 text-xs text-amber-700">
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <span>
                This AI-generated report is for preliminary screening only and
                does not replace professional medical consultation.
              </span>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function Section({ icon, iconBg, title, children }) {
  return (
    <div className="mb-5">
      <div className="mb-2.5 flex items-center gap-2">
        <span
          className={`inline-flex h-7 w-7 items-center justify-center rounded-lg ${iconBg}`}
        >
          {icon}
        </span>
        <h3 className="text-sm font-bold text-slate-800">{title}</h3>
      </div>
      {children}
    </div>
  );
}

export default ReportPreviewModal;
