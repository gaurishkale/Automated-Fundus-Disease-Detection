import { useEffect, useMemo, useState } from "react";

function randomPoints(count) {
  return Array.from({ length: count }, () => ({
    x: Math.random() * 70 + 15,
    y: Math.random() * 60 + 20,
    delay: Math.random() * 2,
    size: Math.random() * 3 + 2,
  }));
}

function ScanModal({ isOpen, isScanning, imageSrc }) {
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState("");
  const dots = useMemo(() => randomPoints(14), []);

  useEffect(() => {
    if (!isScanning) {
      setProgress(0);
      setPhase("");
      return;
    }

    const phases = [
      { at: 0, label: "Initializing AI Model" },
      { at: 15, label: "Detecting Retinal Structures" },
      { at: 35, label: "Analyzing Blood Vessels" },
      { at: 55, label: "Scanning Optic Nerve" },
      { at: 75, label: "Evaluating Risk Patterns" },
      { at: 90, label: "Generating Diagnosis" },
    ];

    let frame;
    const start = performance.now();
    const duration = 4800;

    function tick(now) {
      const elapsed = now - start;
      const ratio = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - ratio, 2);
      const pct = Math.round(eased * 100);
      setProgress(pct);

      for (let i = phases.length - 1; i >= 0; i--) {
        if (pct >= phases[i].at) {
          setPhase(phases[i].label);
          break;
        }
      }

      if (ratio < 1) frame = requestAnimationFrame(tick);
    }

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [isScanning]);

  if (!isOpen || !imageSrc) return null;

  return (
    <>
      <style>{`
        @keyframes sm-scanLine {
          0% { top: 0%; opacity: 0.3; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0.3; }
        }
        @keyframes sm-dotPulse {
          0%, 100% { transform: scale(0.8); opacity: 0.3; }
          50% { transform: scale(1.4); opacity: 1; }
        }
        @keyframes sm-gridFade {
          0%, 100% { opacity: 0.04; }
          50% { opacity: 0.1; }
        }
        @keyframes sm-cornerPulse {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
        @keyframes sm-ring {
          0% { transform: translate(-50%, -50%) scale(0.8); opacity: 0.6; }
          100% { transform: translate(-50%, -50%) scale(2.5); opacity: 0; }
        }
      `}</style>

      <div
        className={`fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 px-4 backdrop-blur-md transition-opacity duration-300 ${
          isScanning ? "opacity-100" : "opacity-0"
        }`}
      >
        <div
          className={`relative w-[94vw] max-w-2xl overflow-hidden rounded-2xl border border-white/10 shadow-2xl shadow-cyan-500/10 transition-all duration-300 ${
            isScanning ? "scale-100 opacity-100" : "scale-95 opacity-0"
          }`}
        >
          {/* Retinal image */}
          <img
            src={imageSrc}
            alt="Scanning retinal image"
            className="max-h-[65vh] w-full object-cover"
          />

          {/* Dark overlay */}
          <div className="absolute inset-0 bg-slate-950/40" />

          {/* AI grid pattern */}
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "linear-gradient(rgba(56,189,248,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(56,189,248,0.07) 1px, transparent 1px)",
              backgroundSize: "40px 40px",
              animation: "sm-gridFade 3s ease-in-out infinite",
            }}
          />

          {/* Scanning line */}
          <div className="absolute inset-0 overflow-hidden">
            <div
              className="absolute left-0 right-0 h-[2px]"
              style={{
                background: "linear-gradient(90deg, transparent 0%, #22d3ee 20%, #06b6d4 50%, #22d3ee 80%, transparent 100%)",
                boxShadow: "0 0 20px 4px rgba(34,211,238,0.6), 0 0 60px 8px rgba(34,211,238,0.2)",
                animation: isScanning ? "sm-scanLine 2.4s linear infinite" : "none",
              }}
            />
          </div>

          {/* Pulsing AI analysis dots */}
          {dots.map((dot, i) => (
            <span
              key={i}
              className="absolute rounded-full bg-cyan-400"
              style={{
                left: `${dot.x}%`,
                top: `${dot.y}%`,
                width: `${dot.size}px`,
                height: `${dot.size}px`,
                boxShadow: "0 0 8px 2px rgba(34,211,238,0.7)",
                animation: `sm-dotPulse ${1.2 + (i % 4) * 0.3}s ease-in-out ${dot.delay}s infinite`,
              }}
            />
          ))}

          {/* Center ring pulse */}
          <div className="absolute left-1/2 top-1/2 h-20 w-20">
            <span
              className="absolute left-1/2 top-1/2 rounded-full border border-cyan-400/40"
              style={{ width: 80, height: 80, animation: "sm-ring 2s ease-out infinite" }}
            />
            <span
              className="absolute left-1/2 top-1/2 rounded-full border border-cyan-300/30"
              style={{ width: 80, height: 80, animation: "sm-ring 2s ease-out 0.7s infinite" }}
            />
          </div>

          {/* Corner brackets */}
          {[
            "top-3 left-3 border-t-2 border-l-2",
            "top-3 right-3 border-t-2 border-r-2",
            "bottom-3 left-3 border-b-2 border-l-2",
            "bottom-3 right-3 border-b-2 border-r-2",
          ].map((cls) => (
            <span
              key={cls}
              className={`absolute h-6 w-6 border-cyan-400/60 ${cls}`}
              style={{ animation: "sm-cornerPulse 2s ease-in-out infinite" }}
            />
          ))}

          {/* HUD: top bar */}
          <div className="absolute inset-x-0 top-0 flex items-center justify-between bg-gradient-to-b from-slate-950/80 to-transparent px-5 pb-8 pt-4">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 animate-pulse rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
              <span className="text-xs font-semibold tracking-wider text-cyan-200">AI SCAN ACTIVE</span>
            </div>
            <span className="font-mono text-xs text-cyan-300/70">{progress}%</span>
          </div>

          {/* HUD: bottom bar */}
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/90 to-transparent px-5 pb-4 pt-10">
            <p className="text-center text-sm font-medium text-cyan-100">{phase}</p>
            {/* Progress bar */}
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="mt-2 flex justify-between text-[10px] text-cyan-300/50">
              <span>Detection</span>
              <span>Analysis</span>
              <span>Diagnosis</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default ScanModal;
