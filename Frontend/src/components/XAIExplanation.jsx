import { useEffect, useState } from "react";
import { Info, ScanEye } from "lucide-react";

const XAI_DATA = {
  "Diabetic Retinopathy": {
    title: "Microvascular Abnormalities Detected",
    region: "Macular & Vascular Region",
    focusPosition: { x: "48%", y: "52%" },
    focusColor: "rgba(239,68,68,0.55)",
    findings: [
      "Small red lesions (microaneurysms) detected near macula",
      "Localised retinal haemorrhages observed",
      "Abnormal blood vessel branching patterns",
      "Hard exudates near the foveal region",
    ],
    recommendations: [
      "Schedule detailed retinal examination immediately",
      "Monitor blood glucose and HbA1c levels",
      "Begin or review anti-VEGF treatment plan",
      "Consult ophthalmologist within 1 week",
    ],
  },
  Glaucoma: {
    title: "Optic Nerve Structural Changes",
    region: "Optic Disc Area",
    focusPosition: { x: "35%", y: "48%" },
    focusColor: "rgba(234,179,8,0.55)",
    findings: [
      "Enlarged optic disc cup-to-disc ratio",
      "Nerve fibre layer thinning at superior pole",
      "Peripapillary retinal atrophy signs",
      "Asymmetric disc appearance noted",
    ],
    recommendations: [
      "Initiate intraocular pressure-lowering therapy",
      "Schedule visual field testing within 4 weeks",
      "Get regular IOP measurements every 3 months",
      "Advise family members to undergo screening",
    ],
  },
  "Age-related Macular Degeneration (AMD)": {
    title: "Macular Degeneration Patterns",
    region: "Central Macula",
    focusPosition: { x: "50%", y: "50%" },
    focusColor: "rgba(249,115,22,0.55)",
    findings: [
      "Drusen deposits identified in central macula",
      "Retinal pigment epithelium irregularities",
      "Central retinal thinning detected",
      "Subretinal fluid indicators present",
    ],
    recommendations: [
      "Refer to retinal specialist urgently",
      "Consider AREDS2 nutritional supplements",
      "Monitor central vision with Amsler grid daily",
      "Evaluate eligibility for anti-VEGF therapy",
    ],
  },
  Cataract: {
    title: "Lens Opacity Patterns Identified",
    region: "Crystalline Lens Region",
    focusPosition: { x: "50%", y: "48%" },
    focusColor: "rgba(148,163,184,0.6)",
    findings: [
      "Nuclear sclerosis patterns in lens centre",
      "Reduced light transmission detected",
      "Posterior subcapsular opacity markers",
      "Cortical spoke-like opacities visible",
    ],
    recommendations: [
      "Consult ophthalmologist for surgical evaluation",
      "Assess visual acuity impact on daily activities",
      "Wear UV-blocking sunglasses consistently",
      "Schedule cataract surgery if vision significantly impaired",
    ],
  },
  Hypertension: {
    title: "Hypertensive Retinopathy Signs",
    region: "Retinal Vasculature",
    focusPosition: { x: "45%", y: "45%" },
    focusColor: "rgba(168,85,247,0.5)",
    findings: [
      "Arteriovenous nicking at vessel crossings",
      "Generalised arteriolar narrowing",
      "Focal arteriolar constriction detected",
      "Flame-shaped haemorrhages near disc",
    ],
    recommendations: [
      "Urgently manage systemic blood pressure",
      "Reduce sodium intake and adopt DASH diet",
      "Take antihypertensive medications consistently",
      "Schedule cardiology and nephrology follow-up",
    ],
  },
  Myopia: {
    title: "Axial Length & Peripheral Changes",
    region: "Peripheral Retina & Disc",
    focusPosition: { x: "38%", y: "50%" },
    focusColor: "rgba(59,130,246,0.45)",
    findings: [
      "Temporal disc crescent indicative of high myopia",
      "Peripheral retinal thinning observed",
      "Posterior staphyloma features noted",
      "Lattice degeneration risk markers present",
    ],
    recommendations: [
      "Get updated refraction and lens prescription",
      "Spend 2+ hours outdoors daily to slow progression",
      "Follow the 20-20-20 screen-break rule",
      "Consider orthokeratology or atropine therapy",
    ],
  },
  Normal: {
    title: "Healthy Retinal Architecture Confirmed",
    region: "Full Retinal Field",
    focusPosition: { x: "50%", y: "50%" },
    focusColor: "rgba(16,185,129,0.35)",
    findings: [
      "Optic disc margins appear clear and distinct",
      "Blood vessel calibre within normal range",
      "No drusen or exudates detected",
      "Foveal reflex present and uniform",
    ],
    recommendations: [
      "Continue annual comprehensive eye examinations",
      "Maintain a diet rich in omega-3 and leafy greens",
      "Wear UV-protective sunglasses outdoors",
      "Follow screen-break discipline (20-20-20 rule)",
    ],
  },
};

function BulletRow({ text, index, visible }) {
  return (
    <li
      className={`flex items-start gap-2.5 text-sm leading-relaxed text-slate-600 transition-all duration-300 ${
        visible ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
      }`}
      style={{ transitionDelay: `${index * 90}ms` }}
    >
      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />
      {text}
    </li>
  );
}

function Tooltip({ text }) {
  const [show, setShow] = useState(false);
  return (
    <span className="relative inline-block">
      <button
        type="button"
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-slate-200 text-slate-500 transition hover:bg-blue-100 hover:text-blue-600"
      >
        <Info className="h-3 w-3" />
      </button>
      {show && (
        <span className="absolute bottom-6 left-1/2 z-20 w-64 -translate-x-1/2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs leading-relaxed text-slate-600 shadow-xl">
          {text}
        </span>
      )}
    </span>
  );
}

function XAIExplanation({ disease, imageSrc }) {
  const [visible, setVisible] = useState(false);
  const [itemsVisible, setItemsVisible] = useState(false);

  const data = XAI_DATA[disease];

  useEffect(() => {
    setVisible(false);
    setItemsVisible(false);
    const t1 = window.setTimeout(() => setVisible(true), 80);
    const t2 = window.setTimeout(() => setItemsVisible(true), 420);
    return () => { window.clearTimeout(t1); window.clearTimeout(t2); };
  }, [disease]);

  if (!data) return null;

  return (
    <div
      className={`mt-6 transition-all duration-[600ms] ease-out ${
        visible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
      }`}
    >
      <div className="h-px bg-gradient-to-r from-transparent via-blue-300 to-transparent" />

      <div className="mt-8 mb-5 text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
          <ScanEye className="h-3.5 w-3.5" />
          Explainable AI (XAI)
        </span>
        <h3 className="mt-3 text-xl font-bold text-slate-900 sm:text-2xl">AI Clinical Explanation</h3>
        <p className="mt-1.5 flex items-center justify-center gap-1.5 text-sm text-slate-500">
          Why the model predicted this condition
          <Tooltip text="This visualisation represents the retinal regions the AI model weighted most heavily during its prediction. It is a simulated heatmap for interpretability purposes." />
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* LEFT — Simulated Focus Overlay */}
        <div className="group overflow-hidden rounded-2xl border border-slate-200 bg-slate-900 shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl">
          <div className="h-1 bg-gradient-to-r from-blue-500 to-teal-400" />
          <div className="relative">
            {imageSrc ? (
              <img
                src={imageSrc}
                alt="Retinal scan"
                className="max-h-[300px] w-full object-cover opacity-70"
              />
            ) : (
              <div className="flex h-[260px] w-full items-center justify-center bg-slate-800 text-slate-500 text-sm">
                No image available
              </div>
            )}

            {/* Darkening vignette */}
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_55%_at_50%_50%,transparent_30%,rgba(0,0,0,0.55)_100%)]" />

            {/* AI focus heatmap glow */}
            <div
              className="pointer-events-none absolute"
              style={{
                left: data.focusPosition.x,
                top: data.focusPosition.y,
                transform: "translate(-50%,-50%)",
                width: "46%",
                height: "46%",
                borderRadius: "50%",
                background: `radial-gradient(circle, ${data.focusColor} 0%, transparent 72%)`,
                animation: "xaiFocusPulse 2.2s ease-in-out infinite",
              }}
            />
            {/* Secondary tighter glow ring */}
            <div
              className="pointer-events-none absolute"
              style={{
                left: data.focusPosition.x,
                top: data.focusPosition.y,
                transform: "translate(-50%,-50%)",
                width: "22%",
                height: "22%",
                borderRadius: "50%",
                background: `radial-gradient(circle, ${data.focusColor.replace(/[\d.]+\)$/, "0.85)")} 0%, transparent 80%)`,
                animation: "xaiFocusPulse 2.2s ease-in-out infinite 0.4s",
              }}
            />

            {/* Region badge */}
            <div className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
              <span className="h-2 w-2 rounded-full bg-red-400" />
              AI Focus: {data.region}
            </div>

            <div className="absolute top-3 right-3 inline-flex items-center gap-1.5 rounded-full bg-black/55 px-2.5 py-1 text-[11px] font-semibold text-cyan-300 backdrop-blur-sm">
              <ScanEye className="h-3.5 w-3.5" />
              AI Focus Region
            </div>
          </div>
          <div className="px-5 py-3 text-xs text-slate-400">
            Simulated heatmap — indicates model attention areas
          </div>
        </div>

        {/* RIGHT — Explanation Card */}
        <div className="group overflow-hidden rounded-2xl border-l-4 border border-blue-200 border-l-blue-500 bg-white shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl">
          <div className="h-1 bg-gradient-to-r from-blue-500 to-teal-400" />
          <div className="p-6">
            <h4 className="text-base font-bold text-slate-900">{data.title}</h4>

            <div className="mt-5">
              <p className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-blue-600">
                Detected Findings
              </p>
              <ul className="space-y-2.5">
                {data.findings.map((f, i) => (
                  <BulletRow key={f} text={f} index={i} visible={itemsVisible} />
                ))}
              </ul>
            </div>

            <div className="mt-5">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                Primary Affected Region
              </p>
              <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700">
                {data.region}
              </span>
            </div>

            <div className="mt-5">
              <p className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-teal-600">
                Clinical Recommendations
              </p>
              <ul className="space-y-2.5">
                {data.recommendations.map((r, i) => (
                  <li
                    key={r}
                    className={`flex items-start gap-2.5 text-sm leading-relaxed text-slate-600 transition-all duration-300 ${
                      itemsVisible ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
                    }`}
                    style={{ transitionDelay: `${(data.findings.length + i) * 90}ms` }}
                  >
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-teal-500" />
                    {r}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      <style>
        {`@keyframes xaiFocusPulse {
          0%, 100% { opacity: 0.65; transform: translate(-50%,-50%) scale(1); }
          50% { opacity: 1; transform: translate(-50%,-50%) scale(1.1); }
        }`}
      </style>
    </div>
  );
}

export default XAIExplanation;
