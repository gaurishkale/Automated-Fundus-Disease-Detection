import { useMemo } from "react";

function createPoints() {
  const count = Math.floor(Math.random() * 5) + 8; // 8-12 points
  return Array.from({ length: count }, () => ({
    x: Math.random() * 80 + 10, // Keep away from edges
    y: Math.random() * 70 + 15,
  }));
}

function lineStyle(from, to) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const length = Math.sqrt(dx * dx + dy * dy);
  const angle = (Math.atan2(dy, dx) * 180) / Math.PI;

  return {
    left: `${from.x}%`,
    top: `${from.y}%`,
    width: `${length}%`,
    transform: `rotate(${angle}deg)`,
    transformOrigin: "0 50%",
  };
}

function AiScanOverlay({ isScanning }) {
  const points = useMemo(() => createPoints(), []);

  return (
    <>
      <style>
        {`
          @keyframes ai-scan-line {
            0% { transform: translateY(-15%); opacity: 0.2; }
            12% { opacity: 0.85; }
            50% { opacity: 0.95; }
            88% { opacity: 0.85; }
            100% { transform: translateY(115%); opacity: 0.2; }
          }
          @keyframes ai-dot-pulse {
            0%, 100% { transform: scale(0.9); opacity: 0.45; }
            50% { transform: scale(1.2); opacity: 1; }
          }
          @keyframes ai-line-pulse {
            0%, 100% { opacity: 0.2; }
            50% { opacity: 0.6; }
          }
          @keyframes ai-text-dots {
            0% { content: ""; }
            33% { content: "."; }
            66% { content: ".."; }
            100% { content: "..."; }
          }
        `}
      </style>

      <div
        className={`pointer-events-none absolute inset-0 rounded-xl bg-black/30 transition-opacity duration-500 ${
          isScanning ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="absolute inset-0 overflow-hidden rounded-xl">
          <div
            className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-300 to-transparent shadow-[0_0_14px_rgba(56,189,248,0.9)]"
            style={{ animation: "ai-scan-line 1.7s linear infinite" }}
          />

          {points.map((point, index) => (
            <span
              key={`dot-${index}`}
              className="absolute h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_10px_rgba(103,232,249,0.95)]"
              style={{
                left: `${point.x}%`,
                top: `${point.y}%`,
                animation: `ai-dot-pulse ${1.2 + (index % 3) * 0.35}s ease-in-out infinite`,
              }}
            />
          ))}

          {points.slice(0, -1).map((point, index) => (
            <span
              key={`line-${index}`}
              className="absolute h-[1px] bg-cyan-200/70"
              style={{
                ...lineStyle(point, points[index + 1]),
                animation: `ai-line-pulse ${1.4 + (index % 3) * 0.25}s ease-in-out infinite`,
              }}
            />
          ))}
        </div>

        <div className="absolute top-3 left-1/2 -translate-x-1/2 rounded-full bg-slate-900/55 px-4 py-1.5 text-xs font-medium text-cyan-100">
          Analyzing Retinal Patterns
          <span
            className="inline-block w-4 text-left align-baseline"
            style={{ animation: "ai-dot-pulse 1.1s ease-in-out infinite" }}
          >
            ...
          </span>
        </div>
      </div>
    </>
  );
}

export default AiScanOverlay;
