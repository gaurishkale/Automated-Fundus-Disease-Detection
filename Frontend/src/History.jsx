import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Eye,
  ScanLine,
  CalendarDays,
  AlertCircle,
  HeartPulse,
  ShieldAlert,
  Search,
  FileText,
  Download,
  Share2,
  ClipboardCheck,
  List,
  Clock,
  ScanEye,
  TrendingUp,
} from "lucide-react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ReportPreviewModal from "./components/ReportPreviewModal";
import generateReport from "./services/generateReport";
import { getStoredPatientInfo } from "./components/PatientInfoModal";

const SCAN_HISTORY_KEY = "scan_history";

function getRisk(disease, confidence) {
  const name = (disease || "").toLowerCase();
  if (name === "normal" || name === "healthy")
    return { label: "Healthy", color: "emerald" };
  if (confidence < 60) return { label: "Low Risk", color: "emerald" };
  if (confidence < 85) return { label: "Moderate Risk", color: "amber" };
  return { label: "High Risk", color: "red" };
}

const BADGE_CLASSES = {
  emerald: "bg-emerald-100 text-emerald-700",
  amber: "bg-amber-100 text-amber-700",
  red: "bg-red-100 text-red-700",
};

const DOT_CLASSES = {
  emerald: "bg-emerald-500",
  amber: "bg-amber-500",
  red: "bg-red-500",
};

const DISEASE_OPTIONS = [
  "All",
  "Diabetic Retinopathy",
  "Glaucoma",
  "Cataract",
  "Age-related Macular Degeneration (AMD)",
  "Hypertension",
  "Myopia",
  "Normal",
];

const RISK_OPTIONS = ["All", "Healthy", "Low Risk", "Moderate Risk", "High Risk"];

function History() {
  const navigate = useNavigate();
  const [scanHistory, setScanHistory] = useState([]);
  const [ready, setReady] = useState(false);
  const [viewMode, setViewMode] = useState("list");

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [diseaseFilter, setDiseaseFilter] = useState("All");
  const [riskFilter, setRiskFilter] = useState("All");
  const debounceRef = useRef(null);

  // Modal
  const [previewScan, setPreviewScan] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    const loaded = JSON.parse(localStorage.getItem(SCAN_HISTORY_KEY) || "[]");
    setScanHistory(Array.isArray(loaded) ? loaded : []);
    const timer = window.setTimeout(() => setReady(true), 50);
    return () => window.clearTimeout(timer);
  }, []);

  const handleSearch = useCallback((value) => {
    setSearchTerm(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedSearch(value), 300);
  }, []);

  const filtered = useMemo(() => {
    let list = scanHistory;
    if (debouncedSearch.trim()) {
      const q = debouncedSearch.toLowerCase();
      list = list.filter(
        (s) =>
          (s.disease || "").toLowerCase().includes(q) ||
          `ED-${String(s.id).slice(-6)}`.toLowerCase().includes(q) ||
          (s.patientName || "").toLowerCase().includes(q),
      );
    }
    if (diseaseFilter !== "All") {
      list = list.filter((s) => s.disease === diseaseFilter);
    }
    if (riskFilter !== "All") {
      list = list.filter((s) => getRisk(s.disease, s.confidence).label === riskFilter);
    }
    return list;
  }, [scanHistory, debouncedSearch, diseaseFilter, riskFilter]);

  const stats = useMemo(() => {
    const now = new Date();
    const thisMonth = scanHistory.filter((s) => {
      const d = new Date(s.date);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).length;
    const healthy = scanHistory.filter((s) => s.status === "Healthy").length;
    const issuesFound = scanHistory.length - healthy;
    const highRisk = scanHistory.filter(
      (s) => getRisk(s.disease, s.confidence).label === "High Risk",
    ).length;

    const prevMonth = scanHistory.filter((s) => {
      const d = new Date(s.date);
      const pm = now.getMonth() === 0 ? 11 : now.getMonth() - 1;
      const py = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
      return d.getMonth() === pm && d.getFullYear() === py;
    }).length;

    const monthGrowth =
      prevMonth > 0
        ? Math.round(((thisMonth - prevMonth) / prevMonth) * 100)
        : thisMonth > 0
          ? 100
          : 0;

    return { total: scanHistory.length, thisMonth, issuesFound, healthy, highRisk, monthGrowth };
  }, [scanHistory]);

  const handleDownload = useCallback(
    (scan) => {
      const patient = getStoredPatientInfo() || {};
      generateReport({
        disease: scan.disease,
        confidence: scan.confidence,
        patient,
        imageDataUrl: null,
      });
    },
    [],
  );

  const handleShare = useCallback((scan) => {
    const text = `EyeDetect Report — Scan ID: ED-${String(scan.id).slice(-6)} | Diagnosis: ${scan.disease} | Confidence: ${scan.confidence}% | Date: ${new Date(scan.date).toLocaleDateString()}`;
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(scan.id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  }, []);

  const statCards = [
    {
      label: "Total Scans",
      value: stats.total,
      icon: ScanLine,
      iconBg: "bg-blue-100 text-blue-600",
      growth: null,
    },
    {
      label: "Scans This Month",
      value: stats.thisMonth,
      icon: CalendarDays,
      iconBg: "bg-indigo-100 text-indigo-600",
      growth: stats.monthGrowth,
    },
    {
      label: "Issues Detected",
      value: stats.issuesFound,
      icon: AlertCircle,
      iconBg: "bg-orange-100 text-orange-600",
      growth: null,
    },
    {
      label: "Healthy Results",
      value: stats.healthy,
      icon: HeartPulse,
      iconBg: "bg-emerald-100 text-emerald-600",
      growth: null,
    },
    {
      label: "High Risk Cases",
      value: stats.highRisk,
      icon: ShieldAlert,
      iconBg: "bg-red-100 text-red-600",
      growth: null,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50/40">
      <Navbar
        onStartAnalysis={() => navigate("/analyze")}
        onHistory={() => navigate("/history")}
      />

      <section className="mx-auto w-full max-w-7xl px-4 pb-16 pt-10 sm:px-6 lg:px-8">
        {/* ── Header ── */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <h1 className="bg-gradient-to-r from-blue-700 to-teal-500 bg-clip-text text-3xl font-extrabold tracking-tight text-transparent sm:text-4xl">
              Scan History
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              View all previous retinal screenings and patient diagnostic
              reports.
            </p>
          </motion.div>
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            whileHover={{ scale: 1.04, boxShadow: "0 4px 20px rgba(37,99,235,0.25)" }}
            whileTap={{ scale: 0.97 }}
            type="button"
            onClick={() => navigate("/analyze")}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-teal-500 px-6 py-2.5 text-sm font-bold text-white shadow-lg transition-all"
          >
            <ScanEye className="h-4 w-4" />
            New Scan
          </motion.button>
        </div>

        {/* ── Analytics Cards ── */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {statCards.map((card, i) => {
            const Icon = card.icon;
            return (
              <motion.article
                key={card.label}
                initial={{ opacity: 0, y: 20 }}
                animate={ready ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.35, delay: i * 0.07 }}
                whileHover={{ scale: 1.04, y: -2 }}
                className="group rounded-xl border border-slate-200/70 bg-white/80 p-5 shadow-md backdrop-blur transition-shadow hover:shadow-lg"
              >
                <div className="mb-3 flex items-center justify-between">
                  <span
                    className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${card.iconBg} transition-transform group-hover:scale-110`}
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                  {card.growth !== null && card.growth !== 0 && (
                    <span
                      className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        card.growth > 0
                          ? "bg-emerald-50 text-emerald-600"
                          : "bg-red-50 text-red-600"
                      }`}
                    >
                      <TrendingUp
                        className={`h-3 w-3 ${card.growth < 0 ? "rotate-180" : ""}`}
                      />
                      {Math.abs(card.growth)}%
                    </span>
                  )}
                </div>
                <p className="text-xs font-medium text-slate-500">
                  {card.label}
                </p>
                <p className="mt-0.5 text-3xl font-extrabold text-slate-900">
                  {card.value}
                </p>
              </motion.article>
            );
          })}
        </div>

        {/* ── Filters ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={ready ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.3 }}
          className="mb-6 flex flex-col gap-3 rounded-xl border border-slate-200/70 bg-white/80 p-4 shadow-sm backdrop-blur sm:flex-row sm:items-center sm:flex-wrap"
        >
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search patient name or ID..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <select
            value={diseaseFilter}
            onChange={(e) => setDiseaseFilter(e.target.value)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          >
            {DISEASE_OPTIONS.map((d) => (
              <option key={d} value={d}>
                {d === "All" ? "All Diseases" : d}
              </option>
            ))}
          </select>

          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          >
            {RISK_OPTIONS.map((r) => (
              <option key={r} value={r}>
                {r === "All" ? "All Risk Levels" : r}
              </option>
            ))}
          </select>

          <div className="ml-auto flex items-center rounded-lg border border-slate-200 bg-slate-50 p-0.5">
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${
                viewMode === "list"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <List className="mr-1 inline h-3.5 w-3.5" />
              List
            </button>
            <button
              type="button"
              onClick={() => setViewMode("timeline")}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${
                viewMode === "timeline"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <Clock className="mr-1 inline h-3.5 w-3.5" />
              Timeline
            </button>
          </div>
        </motion.div>

        {/* Record count */}
        <div className="mb-4 flex items-center gap-2 text-sm text-slate-500">
          <ClipboardCheck className="h-4 w-4" />
          Showing {filtered.length} scan record{filtered.length !== 1 ? "s" : ""}
        </div>

        {/* ── Scan Records ── */}
        {filtered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center rounded-2xl border border-dashed border-slate-300 bg-white p-14 text-center shadow-sm"
          >
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50">
              <Eye className="h-8 w-8 text-blue-400" />
            </div>
            <p className="text-lg font-semibold text-slate-700">
              No scans available.
            </p>
            <p className="mt-1 text-sm text-slate-400">
              Start your first retinal analysis.
            </p>
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              type="button"
              onClick={() => navigate("/analyze")}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-teal-500 px-6 py-2.5 text-sm font-bold text-white shadow-md"
            >
              <ScanEye className="h-4 w-4" />
              Start New Scan
            </motion.button>
          </motion.div>
        ) : viewMode === "list" ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <AnimatePresence mode="popLayout">
              {filtered.map((scan, i) => (
                <ScanCard
                  key={scan.id}
                  scan={scan}
                  index={i}
                  onPreview={setPreviewScan}
                  onDownload={handleDownload}
                  onShare={handleShare}
                  isCopied={copiedId === scan.id}
                />
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <TimelineView
            scans={filtered}
            onPreview={setPreviewScan}
            onDownload={handleDownload}
            onShare={handleShare}
            copiedId={copiedId}
          />
        )}
      </section>

      {previewScan && (
        <ReportPreviewModal
          scan={previewScan}
          onClose={() => setPreviewScan(null)}
        />
      )}

      <Footer />
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────
   Scan Card
   ────────────────────────────────────────────────────────────── */

function ScanCard({ scan, index, onPreview, onDownload, onShare, isCopied }) {
  const risk = getRisk(scan.disease, scan.confidence);
  const scanDate = new Date(scan.date);
  const patientId = `ED-${String(scan.id).slice(-6)}`;

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      whileHover={{ y: -3, boxShadow: "0 10px 32px rgba(15,101,131,0.10)" }}
      className="group flex flex-col rounded-xl border border-slate-200/80 bg-white shadow-md transition-colors hover:border-blue-200"
    >
      {/* Card body */}
      <div className="flex flex-1 gap-4 p-5">
        {/* Retina icon thumbnail */}
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-50 to-teal-50 transition-transform group-hover:scale-105">
          <Eye className="h-7 w-7 text-blue-500" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-slate-900">
                {scan.disease}
              </p>
              <p className="mt-0.5 text-xs text-slate-400">
                {patientId}
              </p>
            </div>
            <span
              className={`shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${BADGE_CLASSES[risk.color]}`}
            >
              {risk.label}
            </span>
          </div>

          <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
            <span className="inline-flex items-center gap-1">
              <CalendarDays className="h-3 w-3 text-slate-400" />
              {scanDate.toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3 w-3 text-slate-400" />
              {scanDate.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>

          <div className="mt-2 flex items-center gap-2">
            <span className="text-xs font-medium text-slate-500">
              Confidence:
            </span>
            <div className="h-1.5 w-20 overflow-hidden rounded-full bg-slate-200">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  risk.color === "emerald"
                    ? "bg-emerald-500"
                    : risk.color === "amber"
                      ? "bg-amber-500"
                      : "bg-red-500"
                }`}
                style={{ width: `${Math.min(scan.confidence, 100)}%` }}
              />
            </div>
            <span className="text-xs font-bold text-slate-700">
              {scan.confidence}%
            </span>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex border-t border-slate-100 divide-x divide-slate-100">
        <motion.button
          whileHover={{ backgroundColor: "rgb(239 246 255)" }}
          whileTap={{ scale: 0.97 }}
          type="button"
          onClick={() => onPreview(scan)}
          className="flex flex-1 items-center justify-center gap-1.5 py-2.5 text-xs font-semibold text-blue-600 transition"
        >
          <FileText className="h-3.5 w-3.5" />
          Preview
        </motion.button>
        <motion.button
          whileHover={{ backgroundColor: "rgb(240 253 244)" }}
          whileTap={{ scale: 0.97 }}
          type="button"
          onClick={() => onDownload(scan)}
          className="flex flex-1 items-center justify-center gap-1.5 py-2.5 text-xs font-semibold text-emerald-600 transition"
        >
          <Download className="h-3.5 w-3.5" />
          Download
        </motion.button>
        <motion.button
          whileHover={{ backgroundColor: "rgb(245 243 255)" }}
          whileTap={{ scale: 0.97 }}
          type="button"
          onClick={() => onShare(scan)}
          className="flex flex-1 items-center justify-center gap-1.5 py-2.5 text-xs font-semibold text-purple-600 transition"
        >
          <Share2 className="h-3.5 w-3.5" />
          {isCopied ? "Copied!" : "Share"}
        </motion.button>
      </div>
    </motion.article>
  );
}

/* ──────────────────────────────────────────────────────────────
   Timeline View
   ────────────────────────────────────────────────────────────── */

function TimelineView({ scans, onPreview, onDownload, onShare, copiedId }) {
  const groups = useMemo(() => {
    const map = new Map();
    scans.forEach((s) => {
      const d = new Date(s.date);
      const key = d.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(s);
    });
    return [...map.entries()];
  }, [scans]);

  return (
    <div className="relative pl-8">
      <div className="absolute left-3.5 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-400 via-teal-300 to-slate-200" />

      {groups.map(([dateLabel, items]) => (
        <div key={dateLabel} className="mb-8">
          <div className="relative mb-4 flex items-center gap-3">
            <span className="absolute -left-8 flex h-7 w-7 items-center justify-center rounded-full border-2 border-blue-400 bg-white">
              <CalendarDays className="h-3.5 w-3.5 text-blue-500" />
            </span>
            <span className="text-sm font-bold text-slate-700">
              {dateLabel}
            </span>
          </div>

          <div className="space-y-3">
            {items.map((scan) => {
              const risk = getRisk(scan.disease, scan.confidence);
              const scanDate = new Date(scan.date);
              return (
                <motion.div
                  key={scan.id}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="relative flex items-center gap-4 rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm transition-all hover:border-blue-200 hover:shadow-md"
                >
                  <span className="absolute -left-[2.15rem] h-3 w-3 rounded-full border-2 border-white shadow-sm"
                    style={{
                      backgroundColor:
                        risk.color === "emerald"
                          ? "#10b981"
                          : risk.color === "amber"
                            ? "#f59e0b"
                            : "#ef4444",
                    }}
                  />

                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50">
                    <Eye className="h-5 w-5 text-blue-500" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-bold text-slate-900">
                        {scan.disease}
                      </p>
                      <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${BADGE_CLASSES[risk.color]}`}>
                        {risk.label}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-slate-400">
                      {scanDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} &middot; Confidence: {scan.confidence}%
                    </p>
                  </div>

                  <div className="flex shrink-0 gap-1">
                    <button
                      type="button"
                      onClick={() => onPreview(scan)}
                      className="rounded-lg p-2 text-slate-400 transition hover:bg-blue-50 hover:text-blue-600"
                      title="Preview"
                    >
                      <FileText className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDownload(scan)}
                      className="rounded-lg p-2 text-slate-400 transition hover:bg-emerald-50 hover:text-emerald-600"
                      title="Download"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onShare(scan)}
                      className="rounded-lg p-2 text-slate-400 transition hover:bg-purple-50 hover:text-purple-600"
                      title="Share"
                    >
                      {copiedId === scan.id ? (
                        <ClipboardCheck className="h-4 w-4 text-purple-600" />
                      ) : (
                        <Share2 className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

export default History;
