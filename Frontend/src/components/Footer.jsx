import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Eye,
  Mail,
  Phone,
  MapPin,
  ArrowUp,
  Download,
  ScanEye,
  ClipboardList,
  ShieldCheck,
  Stethoscope,
  Activity,
  Linkedin,
  Github,
  BookOpen,
  Sparkles,
  FileText,
} from "lucide-react";

const PRODUCT_LINKS = [
  { label: "AI Screening", path: "/analyze", icon: ScanEye },
  { label: "Scan History", path: "/history", icon: ClipboardList },
  { label: "Disease Prevention", path: "/prevention", icon: ShieldCheck },
  { label: "Find Doctors", path: "/find-doctors", icon: Stethoscope },
  { label: "Progress Analytics", path: "/progress", icon: Activity },
];

const SOCIAL_LINKS = [
  {
    label: "LinkedIn",
    icon: Linkedin,
    href: "https://www.linkedin.com/",
  },
  {
    label: "GitHub",
    icon: Github,
    href: "https://github.com/",
  },
  {
    label: "ResearchGate",
    icon: BookOpen,
    href: "https://www.researchgate.net/",
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.1, ease: "easeOut" },
  }),
};

function Footer() {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const footerRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.08 },
    );
    if (footerRef.current) observer.observe(footerRef.current);
    return () => observer.disconnect();
  }, []);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <>
      {/* ── AI Research Highlight Strip ── */}
      <section
        ref={footerRef}
        className="relative overflow-hidden border-t border-slate-200/60 bg-gradient-to-br from-slate-900 via-[#0f2540] to-slate-900"
      >
        <div className="pointer-events-none absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
          backgroundSize: "28px 28px",
        }} />

        <motion.div
          initial="hidden"
          animate={isVisible ? "visible" : "hidden"}
          variants={fadeUp}
          className="mx-auto max-w-7xl px-4 py-10 text-center sm:px-6 lg:px-8"
        >
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-blue-400">
            <Sparkles className="h-3.5 w-3.5" />
            AI Research &amp; Innovation
          </div>
          <p className="mx-auto max-w-2xl text-sm leading-relaxed text-slate-400">
            This project demonstrates the application of artificial intelligence
            in ophthalmology for automated retinal disease screening and clinical
            decision support.
          </p>
          <div className="mx-auto mt-5 h-px w-40 bg-gradient-to-r from-transparent via-blue-500 to-transparent" />
        </motion.div>
      </section>

      {/* ── Main Footer ── */}
      <footer className="relative overflow-hidden bg-gradient-to-br from-[#0b1120] via-[#0f172a] to-[#112240] text-gray-300">
        <div className="pointer-events-none absolute inset-0 opacity-[0.025]" style={{
          backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
          backgroundSize: "32px 32px",
        }} />

        <div className="relative mx-auto w-full max-w-7xl px-4 pt-14 pb-6 sm:px-6 lg:px-8">
          {/* ── 4-column grid ── */}
          <div className="grid gap-10 md:grid-cols-2 xl:grid-cols-4">
            {/* Column 1 — Brand */}
            <motion.div
              initial="hidden"
              animate={isVisible ? "visible" : "hidden"}
              custom={0}
              variants={fadeUp}
            >
              <div className="mb-5 inline-flex items-center gap-3">
                <span className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-teal-500 text-white shadow-lg shadow-blue-500/20">
                  <Eye className="h-5 w-5" />
                  <span className="absolute inset-0 animate-ping rounded-xl bg-blue-400 opacity-20" />
                </span>
                <span className="text-xl font-bold tracking-tight">
                  <span className="text-white">Eye</span>
                  <span className="bg-gradient-to-r from-blue-400 to-teal-400 bg-clip-text text-transparent">
                    Detect
                  </span>
                </span>
              </div>
              <p className="max-w-xs text-sm leading-relaxed text-slate-400">
                Advanced AI-powered retinal screening platform designed to
                assist healthcare professionals in early detection of eye
                diseases using deep learning technology.
              </p>
            </motion.div>

            {/* Column 2 — Product Links */}
            <motion.div
              initial="hidden"
              animate={isVisible ? "visible" : "hidden"}
              custom={1}
              variants={fadeUp}
            >
              <h3 className="mb-5 text-sm font-bold uppercase tracking-widest text-slate-300">
                Product
              </h3>
              <ul className="space-y-3">
                {PRODUCT_LINKS.map((link) => {
                  const Icon = link.icon;
                  return (
                    <li key={link.path}>
                      <button
                        type="button"
                        onClick={() => navigate(link.path)}
                        className="group inline-flex items-center gap-2.5 text-sm text-slate-400 transition-colors duration-200 hover:text-white"
                      >
                        <Icon className="h-4 w-4 text-slate-500 transition-colors group-hover:text-blue-400" />
                        <span className="relative">
                          {link.label}
                          <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-blue-400 transition-all duration-300 group-hover:w-full" />
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </motion.div>

            {/* Column 3 — Research */}
            <motion.div
              initial="hidden"
              animate={isVisible ? "visible" : "hidden"}
              custom={2}
              variants={fadeUp}
            >
              <h3 className="mb-5 text-sm font-bold uppercase tracking-widest text-slate-300">
                Research
              </h3>
              <div className="rounded-xl border border-slate-700/50 bg-white/[0.03] p-4 backdrop-blur-sm">
                <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-blue-400">
                  <FileText className="h-3 w-3" />
                  Published Academic Research
                </div>
                <h4 className="text-sm font-bold leading-snug text-white">
                  Automated Fundus Image Screening
                </h4>
                <p className="mt-1 text-xs leading-relaxed text-slate-400">
                  A Deep Learning Approach for Eye Disease Detection
                </p>
                <motion.a
                  whileHover={{ scale: 1.03, boxShadow: "0 0 16px rgba(59,130,246,0.25)" }}
                  whileTap={{ scale: 0.97 }}
                  href="/Automated_Fundus_Image_Screening_A_Deep_Learning_Approach_for_Eye_Disease_Detection.pdf"
                  download
                  className="mt-3 inline-flex items-center gap-2 rounded-lg border border-blue-500/40 bg-blue-500/10 px-4 py-2 text-xs font-bold text-blue-300 transition-colors hover:border-blue-400 hover:text-white"
                >
                  <Download className="h-3.5 w-3.5" />
                  Download Research Paper
                </motion.a>
              </div>
            </motion.div>

            {/* Column 4 — Contact */}
            <motion.div
              initial="hidden"
              animate={isVisible ? "visible" : "hidden"}
              custom={3}
              variants={fadeUp}
            >
              <h3 className="mb-5 text-sm font-bold uppercase tracking-widest text-slate-300">
                Contact
              </h3>
              <ul className="space-y-3.5">
                <li>
                  <a
                    href="mailto:adarshkorade2004@gmail.com"
                    className="group inline-flex items-center gap-2.5 text-sm text-slate-400 transition-colors hover:text-white"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/[0.05] transition-colors group-hover:bg-blue-500/15">
                      <Mail className="h-4 w-4 text-blue-400" />
                    </span>
                    adarshkorade2004@gmail.com
                  </a>
                </li>
                <li>
                  <a
                    href="tel:+919004892091"
                    className="group inline-flex items-center gap-2.5 text-sm text-slate-400 transition-colors hover:text-white"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/[0.05] transition-colors group-hover:bg-emerald-500/15">
                      <Phone className="h-4 w-4 text-emerald-400" />
                    </span>
                    +91 9004892091
                  </a>
                </li>
                <li>
                  <a
                    href="https://maps.google.com/?q=Navi+Mumbai+India"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex items-center gap-2.5 text-sm text-slate-400 transition-colors hover:text-white"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/[0.05] transition-colors group-hover:bg-amber-500/15">
                      <MapPin className="h-4 w-4 text-amber-400" />
                    </span>
                    Navi Mumbai, India
                  </a>
                </li>
              </ul>

              {/* Social Links */}
              <div className="mt-6 flex items-center gap-3">
                {SOCIAL_LINKS.map((s) => {
                  const Icon = s.icon;
                  return (
                    <motion.a
                      key={s.label}
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={s.label}
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.9 }}
                      className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-700/50 bg-white/[0.04] text-slate-400 transition-colors hover:border-blue-500/40 hover:bg-blue-500/10 hover:text-blue-300"
                    >
                      <Icon className="h-4 w-4" />
                    </motion.a>
                  );
                })}
              </div>
            </motion.div>
          </div>

          {/* ── Divider ── */}
          <div className="my-8 h-px bg-gradient-to-r from-transparent via-slate-700/60 to-transparent" />

          {/* ── Bottom Bar ── */}
          <div className="flex flex-col gap-4 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <p className="text-slate-400">
                &copy; 2026 EyeDetect AI Platform. All rights reserved.
              </p>
              <p>
                Student Major Project &middot; Department of Artificial
                Intelligence &amp; Machine Learning
              </p>
              <p>SIES Graduate School of Technology</p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <span className="cursor-pointer transition-colors hover:text-white">
                Privacy Policy
              </span>
              <span className="text-slate-700">|</span>
              <span className="cursor-pointer transition-colors hover:text-white">
                Terms of Service
              </span>
              <span className="text-slate-700">|</span>
              <span className="cursor-pointer transition-colors hover:text-white">
                HIPAA Compliance
              </span>
            </div>
          </div>
        </div>

        {/* ── Back to Top ── */}
        <motion.button
          whileHover={{ scale: 1.1, boxShadow: "0 0 20px rgba(59,130,246,0.35)" }}
          whileTap={{ scale: 0.92 }}
          onClick={scrollToTop}
          type="button"
          className="fixed bottom-6 right-6 z-30 flex h-10 w-10 items-center justify-center rounded-full border border-blue-500/30 bg-slate-900/90 text-blue-400 shadow-lg backdrop-blur transition-colors hover:border-blue-400 hover:text-white"
          title="Back to top"
        >
          <ArrowUp className="h-4.5 w-4.5" />
        </motion.button>
      </footer>
    </>
  );
}

export default Footer;
