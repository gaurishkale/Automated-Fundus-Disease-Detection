import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  PieChart, Pie, Cell, Tooltip as ReTooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  LineChart, Line, Area, AreaChart,
} from "recharts";
import {
  Activity, BarChart3, Brain, Building2, Eye,
  TrendingUp, TrendingDown, ShieldAlert, Sparkles, MapPin,
} from "lucide-react";
import Navbar from "./components/Navbar";

const SCAN_HISTORY_KEY = "scan_history";

// ── Mock / supplemental data ──────────────────────────────────────────────────

const MOCK_DISEASE_DISTRIBUTION = [
  { name: "Healthy", value: 40, color: "#10b981" },
  { name: "Diabetic Retinopathy", value: 25, color: "#ef4444" },
  { name: "Glaucoma", value: 15, color: "#f59e0b" },
  { name: "AMD", value: 10, color: "#6366f1" },
  { name: "Others", value: 10, color: "#94a3b8" },
];

const MOCK_CITY_DATA = [
  { city: "Mumbai", scans: 120 },
  { city: "Pune", scans: 80 },
  { city: "Delhi", scans: 100 },
  { city: "Bangalore", scans: 90 },
  { city: "Hyderabad", scans: 70 },
];

const MOCK_MONTHLY_DATA = [
  { month: "Jan", scans: 42 },
  { month: "Feb", scans: 55 },
  { month: "Mar", scans: 68 },
  { month: "Apr", scans: 74 },
  { month: "May", scans: 91 },
  { month: "Jun", scans: 110 },
  { month: "Jul", scans: 125 },
  { month: "Aug", scans: 138 },
  { month: "Sep", scans: 152 },
  { month: "Oct", scans: 170 },
  { month: "Nov", scans: 189 },
  { month: "Dec", scans: 210 },
];

const INSIGHTS = [
  { text: "Screening adoption increased 12% this quarter.", icon: TrendingUp },
  { text: "Most common condition detected: Diabetic Retinopathy.", icon: Eye },
  { text: "Highest usage city: Mumbai.", icon: MapPin },
  { text: "Risk levels trending downward across all regions.", icon: ShieldAlert },
  { text: "AI confidence averaging above 90% on recent scans.", icon: Brain },
];

const PERIOD_OPTIONS = ["Weekly", "Monthly", "Yearly"];

// ── Helpers ───────────────────────────────────────────────────────────────────

function getRiskScore(disease, confidence) {
  const name = (disease || "").toLowerCase();
  if (name === "normal" || name === "healthy") return Math.max(5, 25 - confidence * 0.2);
  if (confidence >= 85) return 75 + Math.random() * 15;
  if (confidence >= 60) return 50 + Math.random() * 20;
  return 30 + Math.random() * 15;
}

function computeStats(history) {
  const totalScans = Math.max(history.length, 460);
  const diseases = new Set(history.map((h) => h.disease).filter(Boolean));
  const diseaseCount = Math.max(diseases.size, 7);

  let avgRisk = 42;
  if (history.length > 0) {
    const sum = history.reduce((acc, h) => acc + getRiskScore(h.disease, h.confidence), 0);
    avgRisk = Math.round(sum / history.length);
  }

  return {
    totalScans,
    diseaseCount,
    avgRisk,
    activeCities: 5,
    growthRate: 12.4,
  };
}

// ── Animated number ───────────────────────────────────────────────────────────

function AnimatedNumber({ value, decimals = 0, suffix = "" }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const duration = 1200;
    const start = performance.now();
    function tick(now) {
      const ratio = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - ratio, 3);
      setDisplay(eased * value);
      if (ratio < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }, [value]);

  return (
    <span>
      {decimals > 0 ? display.toFixed(decimals) : Math.round(display)}
      {suffix}
    </span>
  );
}

// ── Custom pie label ──────────────────────────────────────────────────────────

function PieLabel({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }) {
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  if (percent < 0.08) return null;
  return (
    <text x={x} y={y} fill="#fff" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={600}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
}

// ── Metric card ───────────────────────────────────────────────────────────────

function MetricCard({ icon: Icon, label, value, decimals, suffix, trend, trendUp, delay, visible }) {
  return (
    <div
      className={`group relative overflow-hidden rounded-xl border border-slate-200 bg-white p-5 shadow-md transition-all duration-500 hover:-translate-y-1 hover:shadow-lg ${
        visible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div className="absolute -right-4 -top-4 h-20 w-20 rounded-full bg-blue-50/60 transition-transform duration-500 group-hover:scale-125" />
      <div className="relative flex items-start gap-4">
        <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-50 to-teal-50 text-blue-600">
          <Icon className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400">{label}</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">
            <AnimatedNumber value={value} decimals={decimals} suffix={suffix} />
          </p>
          {trend && (
            <span
              className={`mt-1 inline-flex items-center gap-1 text-xs font-semibold ${
                trendUp ? "text-emerald-600" : "text-red-500"
              }`}
            >
              {trendUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {trend}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Section wrapper ───────────────────────────────────────────────────────────

function Section({ title, subtitle, children, delay, visible }) {
  return (
    <div
      className={`rounded-2xl border border-slate-200 bg-white p-6 shadow-lg transition-all duration-500 ${
        visible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {title && (
        <div className="mb-5">
          <h3 className="text-base font-bold text-slate-900">{title}</h3>
          {subtitle && <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>}
        </div>
      )}
      {children}
    </div>
  );
}

// ── Custom chart tooltip ──────────────────────────────────────────────────────

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-lg">
      <p className="text-xs font-semibold text-slate-700">{label || payload[0].name}</p>
      <p className="text-sm font-bold text-blue-600">{payload[0].value} scans</p>
    </div>
  );
}

function PieTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-lg">
      <p className="text-xs font-semibold text-slate-700">{payload[0].name}</p>
      <p className="text-sm font-bold" style={{ color: payload[0].payload.color }}>{payload[0].value}%</p>
    </div>
  );
}

// ── Risk bar ──────────────────────────────────────────────────────────────────

function RiskBar({ score, visible }) {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    if (visible) {
      const t = window.setTimeout(() => setWidth(score), 300);
      return () => window.clearTimeout(t);
    }
  }, [score, visible]);

  const color = score >= 70 ? "#ef4444" : score >= 45 ? "#f59e0b" : "#10b981";
  const label = score >= 70 ? "High Risk" : score >= 45 ? "Moderate Risk" : "Low Risk";
  const badgeClass = score >= 70 ? "bg-red-100 text-red-700" : score >= 45 ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700";

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm font-medium text-slate-600">Average Risk Score</span>
        <div className="flex items-center gap-3">
          <span className="text-2xl font-bold text-slate-900">{score}</span>
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${badgeClass}`}>{label}</span>
        </div>
      </div>
      <div className="h-4 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full transition-all duration-1000 ease-out"
          style={{
            width: `${width}%`,
            background: `linear-gradient(90deg, #10b981 0%, #f59e0b 50%, ${color} 100%)`,
          }}
        />
      </div>
      <div className="mt-2 flex justify-between text-[10px] font-medium text-slate-400">
        <span>Low</span>
        <span>Moderate</span>
        <span>High</span>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

function Progress() {
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState("Monthly");

  useEffect(() => {
    const t = window.setTimeout(() => setVisible(true), 60);
    return () => window.clearTimeout(t);
  }, []);

  const scanHistory = useMemo(() => {
    try {
      const raw = JSON.parse(localStorage.getItem(SCAN_HISTORY_KEY) || "[]");
      return Array.isArray(raw) ? raw : [];
    } catch {
      return [];
    }
  }, []);

  const stats = useMemo(() => computeStats(scanHistory), [scanHistory]);

  const diseaseDistribution = useMemo(() => {
    if (scanHistory.length < 5) return MOCK_DISEASE_DISTRIBUTION;
    const counts = {};
    scanHistory.forEach((s) => {
      const d = s.disease || "Unknown";
      counts[d] = (counts[d] || 0) + 1;
    });
    const total = scanHistory.length;
    const COLORS = ["#10b981", "#ef4444", "#f59e0b", "#6366f1", "#06b6d4", "#ec4899", "#94a3b8"];
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([name, count], i) => ({
        name,
        value: Math.round((count / total) * 100),
        color: COLORS[i % COLORS.length],
      }));
  }, [scanHistory]);

  const metricCards = [
    { icon: Activity, label: "Total Scans", value: stats.totalScans, trend: "+8.2% this month", trendUp: true },
    { icon: Eye, label: "Diseases Tracked", value: stats.diseaseCount, trend: "+2 new", trendUp: true },
    { icon: ShieldAlert, label: "Avg Risk Score", value: stats.avgRisk, suffix: "/100", trend: "-3.1%", trendUp: false },
    { icon: Building2, label: "Active Cities", value: stats.activeCities, trend: "+1 city", trendUp: true },
    { icon: TrendingUp, label: "Growth Rate", value: stats.growthRate, decimals: 1, suffix: "%", trend: "+2.4%", trendUp: true },
  ];

  return (
    <div className="min-h-screen bg-slate-50/40">
      <Navbar onStartAnalysis={() => navigate("/analyze")} />

      <section className="mx-auto w-full max-w-7xl px-4 pb-20 pt-10 sm:px-6 lg:px-8">
        {/* Page header */}
        <div
          className={`mb-8 transition-all duration-500 ${visible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Analytics Dashboard</h1>
              <p className="mt-2 text-slate-500">AI-powered screening insights and performance metrics</p>
            </div>
            <div className="inline-flex rounded-full border border-slate-200 bg-white p-1 shadow-sm">
              {PERIOD_OPTIONS.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setSelectedPeriod(p)}
                  className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-200 ${
                    selectedPeriod === p
                      ? "bg-blue-600 text-white shadow-sm"
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── 1. Metric cards ────────────────────────────────────────────── */}
        <div className="mb-6 grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-5">
          {metricCards.map((card, i) => (
            <MetricCard key={card.label} {...card} delay={i * 80} visible={visible} />
          ))}
        </div>

        {/* ── 2 + 3. Disease distribution + Risk score ───────────────────── */}
        <div className="mb-6 grid gap-6 lg:grid-cols-2">
          <Section title="Disease Distribution" subtitle="Breakdown of diagnosed conditions" delay={500} visible={visible}>
            <div className="flex flex-col items-center gap-4 sm:flex-row">
              <div className="h-56 w-56 shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={diseaseDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={85}
                      paddingAngle={3}
                      dataKey="value"
                      labelLine={false}
                      label={PieLabel}
                      animationBegin={600}
                      animationDuration={1000}
                    >
                      {diseaseDistribution.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} strokeWidth={0} />
                      ))}
                    </Pie>
                    <ReTooltip content={<PieTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-col gap-2.5">
                {diseaseDistribution.map((d) => (
                  <div key={d.name} className="flex items-center gap-2.5">
                    <span className="h-3 w-3 shrink-0 rounded-full" style={{ background: d.color }} />
                    <span className="text-sm text-slate-600">{d.name}</span>
                    <span className="ml-auto text-sm font-bold text-slate-800">{d.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </Section>

          <Section title="Risk Level Assessment" subtitle="Average risk across all screenings" delay={600} visible={visible}>
            <RiskBar score={stats.avgRisk} visible={visible} />
            <div className="mt-6 grid grid-cols-3 gap-3">
              {[
                { label: "Low Risk", pct: "58%", cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
                { label: "Moderate", pct: "28%", cls: "bg-amber-50 text-amber-700 border-amber-200" },
                { label: "High Risk", pct: "14%", cls: "bg-red-50 text-red-700 border-red-200" },
              ].map((r) => (
                <div key={r.label} className={`rounded-xl border p-3 text-center ${r.cls}`}>
                  <p className="text-lg font-bold">{r.pct}</p>
                  <p className="text-[11px] font-medium">{r.label}</p>
                </div>
              ))}
            </div>
          </Section>
        </div>

        {/* ── 4 + 5. City-wise usage + Monthly growth ────────────────────── */}
        <div className="mb-6 grid gap-6 lg:grid-cols-2">
          <Section title="City-wise Usage" subtitle="Screening adoption across major cities" delay={700} visible={visible}>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={MOCK_CITY_DATA} barSize={32}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="city" tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} />
                  <ReTooltip content={<ChartTooltip />} cursor={{ fill: "rgba(59,130,246,0.06)" }} />
                  <defs>
                    <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" />
                      <stop offset="100%" stopColor="#06b6d4" />
                    </linearGradient>
                  </defs>
                  <Bar dataKey="scans" fill="url(#barGrad)" radius={[6, 6, 0, 0]} animationDuration={1200} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Section>

          <Section title="Monthly Growth" subtitle="Screening volume trend over 12 months" delay={800} visible={visible}>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={MOCK_MONTHLY_DATA}>
                  <defs>
                    <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.2} />
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} />
                  <ReTooltip content={<ChartTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="scans"
                    stroke="#3b82f6"
                    strokeWidth={2.5}
                    fill="url(#areaGrad)"
                    dot={{ r: 3, fill: "#3b82f6", strokeWidth: 0 }}
                    activeDot={{ r: 5, fill: "#3b82f6", stroke: "#fff", strokeWidth: 2 }}
                    animationDuration={1500}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Section>
        </div>

        {/* ── 6. AI Insights panel ───────────────────────────────────────── */}
        <div
          className={`rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50/80 to-teal-50/60 p-6 shadow-lg transition-all duration-500 ${
            visible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          }`}
          style={{ transitionDelay: "900ms" }}
        >
          <div className="mb-5 flex items-center gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
              <Sparkles className="h-5 w-5" />
            </span>
            <div>
              <h3 className="text-base font-bold text-slate-900">AI-Powered Insights</h3>
              <p className="text-xs text-slate-500">Automated analysis of screening trends</p>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {INSIGHTS.map((insight, i) => {
              const IIcon = insight.icon;
              return (
                <div
                  key={i}
                  className={`flex items-start gap-3 rounded-xl border border-white/80 bg-white/70 p-4 shadow-sm backdrop-blur transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md ${
                    visible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
                  }`}
                  style={{ transitionDelay: `${950 + i * 100}ms` }}
                >
                  <span className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                    <IIcon className="h-4 w-4" />
                  </span>
                  <p className="text-sm leading-relaxed text-slate-700">{insight.text}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}

export default Progress;
