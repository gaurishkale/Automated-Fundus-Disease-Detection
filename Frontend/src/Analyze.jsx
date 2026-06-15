import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Upload, Cpu, FileCheck, Shield, Lock, Database } from "lucide-react";
import ClinicalInsights from "./components/ClinicalInsights";
import { getStoredPatientInfo } from "./components/PatientInfoModal";
import Navbar from "./components/Navbar";
import PatientExplanation from "./components/PatientExplanation";
import ResultCard from "./components/ResultCard";
import ScanModal from "./components/ScanModal";
import SendReportModal from "./components/SendReportModal";
import UploadCard from "./components/UploadCard";
import XAIExplanation from "./components/XAIExplanation";
import generateReport from "./services/generateReport";

const API_BASE = "http://localhost:8000";
const ENDPOINT = "/predict";
const SCAN_HISTORY_KEY = "scan_history";
const SCAN_ANIMATION_MS = 5000;
const MODAL_CLOSE_MS = 320;

const getRiskLevel = (confidence) => {
  if (confidence < 50) return { label: "Low Risk", color: "green" };
  if (confidence >= 50 && confidence < 75) return { label: "Moderate Risk", color: "orange" };
  return { label: "High Risk", color: "red" };
};

const STEPS = [
  { key: "upload", label: "Upload Image", icon: Upload },
  { key: "scanning", label: "AI Scanning", icon: Cpu },
  { key: "result", label: "Result", icon: FileCheck },
];

function StepIndicator({ currentStep }) {
  const stepIndex = STEPS.findIndex((s) => s.key === currentStep);

  return (
    <div className="mb-8 flex items-center justify-center gap-0">
      {STEPS.map((step, i) => {
        const Icon = step.icon;
        const isActive = i <= stepIndex;
        const isCurrent = i === stepIndex;
        return (
          <div key={step.key} className="flex items-center">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={`inline-flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-500 ${
                  isCurrent
                    ? "border-blue-500 bg-blue-500 text-white shadow-md shadow-blue-500/30"
                    : isActive
                    ? "border-emerald-500 bg-emerald-500 text-white"
                    : "border-slate-200 bg-white text-slate-400"
                }`}
              >
                <Icon className="h-4.5 w-4.5" />
              </div>
              <span
                className={`text-xs font-semibold transition-colors duration-300 ${
                  isCurrent ? "text-blue-700" : isActive ? "text-emerald-600" : "text-slate-400"
                }`}
              >
                {step.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className="mx-3 mb-5 h-[2px] w-12 sm:w-20 overflow-hidden rounded-full bg-slate-200">
                <div
                  className={`h-full rounded-full bg-gradient-to-r from-emerald-500 to-blue-500 transition-all duration-500 ${
                    i < stepIndex ? "w-full" : "w-0"
                  }`}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function Analyze() {
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [isScanModalOpen, setIsScanModalOpen] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSendReportOpen, setIsSendReportOpen] = useState(false);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const currentStep = result ? "result" : loading ? "scanning" : "upload";
  const confidenceScore = Number(result?.confidence || 0);
  const riskData = getRiskLevel(confidenceScore);

  const handleSelectFile = (file) => {
    if (!file) return;

    const validTypes = ["image/jpeg", "image/png"];
    if (!validTypes.includes(file.type)) {
      setError("Please upload a JPG or PNG fundus image.");
      setSelectedFile(null);
      setPreviewUrl("");
      setResult(null);
      return;
    }

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setError("");
    setResult(null);
  };

  const handleStartScreening = async () => {
    if (!selectedFile) {
      setError("Please select an image before starting analysis.");
      return;
    }

    setLoading(true);
    setIsScanning(true);
    setIsScanModalOpen(true);
    setError("");
    setResult(null);

    const formData = new FormData();
    formData.append("file", selectedFile);

    let bufferedResult = null;
    let bufferedError = "";
    const waitForScanAnimation = new Promise((resolve) => {
      window.setTimeout(resolve, SCAN_ANIMATION_MS);
    });

    try {
      const response = await fetch(`${API_BASE}${ENDPOINT}`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to analyze image.");
      }

      bufferedResult = {
        disease: data.prediction,
        confidence: data.confidence,
      };

      const scanStatus =
        data.prediction && ["healthy", "normal"].includes(String(data.prediction).toLowerCase())
          ? "Healthy"
          : "Issue Found";
      const scanRecord = {
        id: Date.now(),
        disease: data.prediction,
        confidence: data.confidence,
        date: new Date().toISOString(),
        status: scanStatus,
      };
      const existingHistory = JSON.parse(localStorage.getItem(SCAN_HISTORY_KEY) || "[]");
      localStorage.setItem(SCAN_HISTORY_KEY, JSON.stringify([scanRecord, ...existingHistory]));
    } catch (requestError) {
      bufferedError = requestError.message || "Unable to connect to backend.";
    }

    await waitForScanAnimation;
    setIsScanning(false);

    window.setTimeout(() => {
      setIsScanModalOpen(false);
      if (bufferedResult) {
        setResult(bufferedResult);
      }
      if (bufferedError) {
        setError(bufferedError);
      }
      setLoading(false);
    }, MODAL_CLOSE_MS);
  };

  const handleDownloadReport = () => {
    if (!result) return;
    setIsDownloading(true);

    const buildAndSave = (imageDataUrl) => {
      try {
        const patient = getStoredPatientInfo() || {};
        generateReport({
          disease: result.disease,
          confidence: result.confidence,
          patient,
          imageDataUrl,
        });
      } catch (err) {
        console.error("PDF generation failed:", err);
      } finally {
        setIsDownloading(false);
      }
    };

    if (selectedFile) {
      const reader = new FileReader();
      reader.onloadend = () => buildAndSave(reader.result);
      reader.onerror = () => buildAndSave(null);
      reader.readAsDataURL(selectedFile);
    } else {
      window.setTimeout(() => buildAndSave(null), 300);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-slate-50/40 to-white">
      <Navbar onStartAnalysis={() => navigate("/analyze")} />
      <section className="mx-auto w-full max-w-7xl px-4 pb-20 pt-10 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-slate-100 bg-white/80 p-6 shadow-lg shadow-slate-200/40 backdrop-blur sm:p-8">
          {/* Header */}
          <div className="relative mb-2 text-center">
            <div className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-40 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-200/20 blur-3xl" />
            <div
              className="inline-flex items-center gap-1.5 rounded-full border border-blue-200/60 bg-blue-50/80 px-3.5 py-1 shadow-[0_0_12px_rgba(59,130,246,0.08)]"
              style={{ animation: "ah-fadeIn 600ms ease-out both" }}
            >
              <Cpu className="h-3 w-3 text-blue-600" />
              <span className="text-[11px] font-semibold tracking-wide text-blue-700">AI Diagnostic Engine</span>
            </div>
            <h2
              className="mt-4 bg-gradient-to-r from-blue-600 to-teal-500 bg-clip-text text-3xl font-extrabold tracking-tight text-transparent sm:text-4xl"
              style={{ animation: "ah-slideUp 500ms ease-out both" }}
            >
              Upload &amp; Analyze
            </h2>
            <p
              className="mx-auto mt-3 max-w-md text-sm tracking-wide text-slate-500"
              style={{ animation: "ah-fadeIn 500ms ease-out 300ms both" }}
            >
              AI-powered retinal screening with clinical-grade precision
            </p>
            <style>{`
              @keyframes ah-slideUp {
                from { opacity: 0; transform: translateY(10px) scale(0.98); }
                to { opacity: 1; transform: translateY(0) scale(1); }
              }
              @keyframes ah-fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
              }
            `}</style>
          </div>

          {/* Step indicator */}
          <StepIndicator currentStep={currentStep} />

          {/* Upload + Result grid */}
          <div className="grid gap-6 lg:grid-cols-2">
            <UploadCard
              previewUrl={previewUrl}
              selectedFile={selectedFile}
              loading={loading}
              onSelectFile={handleSelectFile}
              onClearFile={() => {
                if (previewUrl) URL.revokeObjectURL(previewUrl);
                setSelectedFile(null);
                setPreviewUrl("");
                setResult(null);
                setError("");
              }}
              onStartScreening={handleStartScreening}
              error={error}
            />
            <ResultCard result={result} confidenceScore={confidenceScore} riskData={riskData} />
          </div>

          {/* Trust indicators */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-6 text-xs font-medium text-slate-400">
            <span className="inline-flex items-center gap-1.5">
              <Shield className="h-3.5 w-3.5 text-emerald-500" />
              HIPAA Compliant
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Lock className="h-3.5 w-3.5 text-blue-500" />
              Secure AI Model
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Database className="h-3.5 w-3.5 text-slate-400" />
              No Data Stored
            </span>
          </div>

          {result && <XAIExplanation disease={result.disease} imageSrc={previewUrl} />}
          {result && (
            <ClinicalInsights
              disease={result.disease}
              onDownloadReport={handleDownloadReport}
              isDownloading={isDownloading}
              onSendReport={() => setIsSendReportOpen(true)}
            />
          )}
          {result && <PatientExplanation disease={result.disease} />}
        </div>
        <div className="mt-5 flex justify-start">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
          >
            <svg viewBox="0 0 20 20" className="h-4 w-4" fill="currentColor">
              <path fillRule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z" clipRule="evenodd" />
            </svg>
            Back to Home
          </button>
        </div>
      </section>
      <ScanModal isOpen={isScanModalOpen} isScanning={isScanning} imageSrc={previewUrl} />
      {result && (
        <SendReportModal
          isOpen={isSendReportOpen}
          onClose={() => setIsSendReportOpen(false)}
          disease={result.disease}
          confidence={result.confidence}
        />
      )}
    </div>
  );
}

export default Analyze;
