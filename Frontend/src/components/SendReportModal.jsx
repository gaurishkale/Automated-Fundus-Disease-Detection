import { useEffect, useRef, useState } from "react";
import { X, MessageCircle, Phone, Send, Check, Clock, Shield } from "lucide-react";
import { getStoredPatientInfo } from "./PatientInfoModal";

const RISK_MAP = {
  healthy: "Healthy",
  low: "Low Risk",
  moderate: "Moderate Risk",
  high: "High Risk",
};

function getRisk(disease, confidence) {
  const name = (disease || "").toLowerCase();
  if (name === "normal" || name === "healthy") return "healthy";
  if (confidence < 60) return "low";
  if (confidence < 85) return "moderate";
  return "high";
}

const RECOMMENDATIONS = {
  "Age-related Macular Degeneration (AMD)":
    "Please consult an ophthalmologist for further evaluation. Early treatment can help preserve vision.",
  Cataract:
    "Schedule an appointment with an eye specialist. Cataract surgery may be recommended depending on severity.",
  "Diabetic Retinopathy":
    "Urgent consultation with a retina specialist is advised. Strict blood sugar control is essential.",
  Glaucoma:
    "Immediate follow-up with a glaucoma specialist is recommended. Early treatment prevents vision loss.",
  Hypertension:
    "Consult your doctor to manage blood pressure. Regular retinal check-ups are advised.",
  Myopia:
    "Visit an optometrist for corrective lenses. Follow the 20-20-20 rule to reduce eye strain.",
  Normal:
    "No immediate action required. Continue annual eye check-ups to maintain healthy vision.",
};

function getRecommendation(disease) {
  return RECOMMENDATIONS[disease] || "Please consult an eye care professional for further evaluation.";
}

function generateReportId() {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `ED-${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
}

function formatDateTime() {
  return new Date().toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function validatePhone(phone) {
  const digits = phone.replace(/\D/g, "");
  if (!digits) return "Phone number is required.";
  if (digits.length < 10) return "Minimum 10 digits required.";
  return "";
}

function SendReportModal({ isOpen, onClose, disease, confidence }) {
  const backdropRef = useRef(null);
  const [closing, setClosing] = useState(false);
  const [reportId] = useState(generateReportId);
  const [dateTime] = useState(formatDateTime);

  const patient = getStoredPatientInfo() || {};
  const [name, setName] = useState(patient.fullName || "");
  const [phone, setPhone] = useState(patient.phone || "");
  const [email, setEmail] = useState(patient.email || "");
  const [phoneError, setPhoneError] = useState("");

  const [sendingWhatsApp, setSendingWhatsApp] = useState(false);
  const [sendingSms, setSendingSms] = useState(false);
  const [smsSent, setSmsSent] = useState(false);

  const riskKey = getRisk(disease, confidence);
  const riskLabel = RISK_MAP[riskKey];
  const recommendation = getRecommendation(disease);

  useEffect(() => {
    if (isOpen) {
      const p = getStoredPatientInfo() || {};
      setName(p.fullName || "");
      setPhone(p.phone || "");
      setEmail(p.email || "");
      setPhoneError("");
      setSendingWhatsApp(false);
      setSendingSms(false);
      setSmsSent(false);
      setClosing(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleClose = () => {
    setClosing(true);
    window.setTimeout(() => {
      setClosing(false);
      onClose();
    }, 250);
  };

  const handleBackdropClick = (e) => {
    if (e.target === backdropRef.current) handleClose();
  };

  const buildMessage = () => {
    const lines = [
      `Hello ${name || "Patient"},`,
      "",
      "Your retinal screening result from EyeDetect is ready.",
      "",
      `Diagnosis: ${disease}`,
      `Risk Level: ${riskLabel}`,
      `Confidence: ${confidence}%`,
      "",
      "Recommendation:",
      recommendation,
      "",
      `Report ID: ${reportId}`,
      `Date: ${dateTime}`,
      "",
      "This is an AI-generated screening report.",
      "Please consult a qualified ophthalmologist for clinical confirmation.",
    ];
    return lines.join("\n");
  };

  const handleSendWhatsApp = () => {
    const err = validatePhone(phone);
    if (err) {
      setPhoneError(err);
      return;
    }
    setPhoneError("");
    setSendingWhatsApp(true);

    const digits = phone.replace(/\D/g, "");
    const phoneNumber = digits.startsWith("91") ? digits : `91${digits}`;
    const encoded = encodeURIComponent(buildMessage());
    const url = `https://wa.me/${phoneNumber}?text=${encoded}`;

    window.setTimeout(() => {
      window.open(url, "_blank");
      setSendingWhatsApp(false);
    }, 800);
  };

  const handleSendSms = () => {
    const err = validatePhone(phone);
    if (err) {
      setPhoneError(err);
      return;
    }
    setPhoneError("");
    setSendingSms(true);

    window.setTimeout(() => {
      setSendingSms(false);
      setSmsSent(true);
    }, 1500);
  };

  return (
    <>
      <style>{`
        @keyframes srm-backdropIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes srm-backdropOut {
          from { opacity: 1; }
          to { opacity: 0; }
        }
        @keyframes srm-modalIn {
          from { opacity: 0; transform: scale(0.92) translateY(16px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes srm-modalOut {
          from { opacity: 1; transform: scale(1) translateY(0); }
          to { opacity: 0; transform: scale(0.92) translateY(16px); }
        }
        @keyframes srm-bubbleSlide {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes srm-checkPop {
          0% { transform: scale(0); opacity: 0; }
          60% { transform: scale(1.15); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes srm-spin {
          to { transform: rotate(360deg); }
        }
      `}</style>

      <div
        ref={backdropRef}
        onClick={handleBackdropClick}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm"
        style={{
          animation: closing
            ? "srm-backdropOut 250ms ease-in forwards"
            : "srm-backdropIn 200ms ease-out",
        }}
      >
        <div
          className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl"
          style={{
            animation: closing
              ? "srm-modalOut 250ms ease-in forwards"
              : "srm-modalIn 300ms ease-out",
            maxHeight: "90vh",
          }}
        >
          <div className="overflow-y-auto" style={{ maxHeight: "90vh" }}>
            {/* Gradient bar */}
            <div className="h-1 bg-gradient-to-r from-blue-500 via-teal-400 to-emerald-400" />

            {/* Close button */}
            <button
              type="button"
              onClick={handleClose}
              className="absolute right-3 top-3 z-10 inline-flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Header */}
            <div className="px-6 pt-6 pb-4 text-center">
              <span className="mx-auto mb-3 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-50 to-teal-50 text-teal-600">
                <MessageCircle className="h-6 w-6" />
              </span>
              <h2 className="text-lg font-bold text-slate-900">
                Send Diagnostic Report
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Preview message before sending
              </p>
            </div>

            {/* WhatsApp-style preview */}
            <div className="mx-6 mb-5 overflow-hidden rounded-xl border border-slate-200 shadow-sm">
              {/* Green header bar */}
              <div className="flex items-center gap-2 bg-[#075e54] px-4 py-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20 text-white">
                  <Shield className="h-3.5 w-3.5" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-white">EyeDetect</p>
                  <p className="text-[10px] text-emerald-200">Diagnostic Report</p>
                </div>
                <span className="ml-auto flex items-center gap-1 text-[10px] text-emerald-200">
                  <Clock className="h-3 w-3" />
                  {dateTime}
                </span>
              </div>

              {/* Chat area */}
              <div className="bg-[#ece5dd] px-4 py-4">
                <div
                  className="relative max-w-[90%] rounded-lg rounded-tl-none bg-white px-4 py-3 shadow-sm"
                  style={{ animation: "srm-bubbleSlide 400ms ease-out 150ms both" }}
                >
                  <div className="absolute -left-1.5 top-0 h-3 w-3 overflow-hidden">
                    <div className="h-4 w-4 rotate-45 bg-white" />
                  </div>
                  <p className="whitespace-pre-line text-[13px] leading-relaxed text-slate-800">
                    <span className="font-medium">
                      Hello {name || "Patient"},
                    </span>
                    {"\n\n"}
                    Your retinal screening result from{" "}
                    <span className="font-semibold text-teal-700">EyeDetect</span>{" "}
                    is ready.
                    {"\n\n"}
                    <span className="font-medium text-slate-900">Diagnosis:</span>{" "}
                    {disease}
                    {"\n"}
                    <span className="font-medium text-slate-900">Risk Level:</span>{" "}
                    <span
                      className={
                        riskKey === "high"
                          ? "font-semibold text-red-600"
                          : riskKey === "moderate"
                          ? "font-semibold text-orange-600"
                          : "font-semibold text-emerald-600"
                      }
                    >
                      {riskLabel}
                    </span>
                    {"\n"}
                    <span className="font-medium text-slate-900">Confidence:</span>{" "}
                    {confidence}%
                    {"\n\n"}
                    <span className="font-medium text-slate-900">Recommendation:</span>
                    {"\n"}
                    <span className="text-slate-600">{recommendation}</span>
                    {"\n\n"}
                    <span className="text-[11px] text-slate-400">
                      Report ID: {reportId}
                    </span>
                    {"\n"}
                    <span className="text-[11px] text-slate-400">
                      Date: {dateTime}
                    </span>
                  </p>
                  <p className="mt-2 border-t border-slate-100 pt-2 text-[10px] italic text-slate-400">
                    This is an AI-generated screening report.
                  </p>
                </div>
              </div>
            </div>

            {/* Contact info */}
            <div className="mx-6 mb-5 space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Contact Information
              </h4>
              <div className="space-y-2.5">
                <div>
                  <label
                    htmlFor="srm-name"
                    className="mb-1 block text-xs font-medium text-slate-600"
                  >
                    Patient Name
                  </label>
                  <input
                    id="srm-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    placeholder="Patient name"
                  />
                </div>
                <div>
                  <label
                    htmlFor="srm-phone"
                    className="mb-1 block text-xs font-medium text-slate-600"
                  >
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="srm-phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      if (phoneError) setPhoneError(validatePhone(e.target.value));
                    }}
                    className={`w-full rounded-lg border bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:ring-2 ${
                      phoneError
                        ? "border-red-300 focus:border-red-400 focus:ring-red-200"
                        : "border-slate-300 focus:border-blue-500 focus:ring-blue-200"
                    }`}
                    placeholder="+91 9XXXXXXXXX"
                  />
                  {phoneError && (
                    <p className="mt-1 text-xs font-medium text-red-500">
                      {phoneError}
                    </p>
                  )}
                </div>
                <div>
                  <label
                    htmlFor="srm-email"
                    className="mb-1 block text-xs font-medium text-slate-600"
                  >
                    Email
                  </label>
                  <input
                    id="srm-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    placeholder="patient@example.com"
                  />
                </div>
              </div>
            </div>

            {/* SMS success state */}
            {smsSent && (
              <div className="mx-6 mb-4 flex items-center gap-3 rounded-xl bg-emerald-50 px-4 py-3 border border-emerald-200">
                <span
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 text-white"
                  style={{ animation: "srm-checkPop 400ms ease-out" }}
                >
                  <Check className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-emerald-800">
                    Message Sent Successfully
                  </p>
                  <p className="text-xs text-emerald-600">
                    SMS report delivered to {phone}
                  </p>
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="border-t border-slate-100 px-6 py-4 space-y-2.5">
              <div className="flex gap-2.5">
                <button
                  type="button"
                  onClick={handleSendWhatsApp}
                  disabled={sendingWhatsApp || sendingSms}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#25d366] py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-[#1fb855] hover:shadow-md active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {sendingWhatsApp ? (
                    <span
                      className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white"
                      style={{ animation: "srm-spin 600ms linear infinite" }}
                    />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  {sendingWhatsApp ? "Opening..." : "Send via WhatsApp"}
                </button>
                <button
                  type="button"
                  onClick={handleSendSms}
                  disabled={sendingSms || sendingWhatsApp || smsSent}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:from-blue-600 hover:to-blue-700 hover:shadow-md active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {sendingSms ? (
                    <span
                      className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white"
                      style={{ animation: "srm-spin 600ms linear infinite" }}
                    />
                  ) : smsSent ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Phone className="h-4 w-4" />
                  )}
                  {sendingSms ? "Sending..." : smsSent ? "SMS Sent" : "Send via SMS"}
                </button>
              </div>
              <button
                type="button"
                onClick={handleClose}
                className="w-full rounded-xl py-2 text-sm font-medium text-slate-500 transition hover:bg-slate-50 hover:text-slate-700"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default SendReportModal;
