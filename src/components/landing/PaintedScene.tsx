// Painted atmospheric hero scene using layered SVG silhouettes + gradients.
// Server-rendered — pure visual, no interactivity.

const PAINT_PALETTE = {
  sky: ["#f5dba8", "#f0b079", "#d97a55"],
  sun: "#fde6b5",
  sunCore: "#ffd07a",
  far: "#b85e48",
  mid: "#7a3a35",
  near: "#3a2722",
  water: "#e89867",
  birds: "#3a2722",
};

export function PaintedScene() {
  const p = PAINT_PALETTE;

  return (
    <svg
      className="scene-svg"
      viewBox="0 0 1200 720"
      preserveAspectRatio="xMidYMid slice"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="landing-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={p.sky[0]} />
          <stop offset="55%" stopColor={p.sky[1]} />
          <stop offset="100%" stopColor={p.sky[2]} />
        </linearGradient>
        <radialGradient id="landing-sunGlow" cx="0.62" cy="0.62" r="0.45">
          <stop offset="0%" stopColor={p.sunCore} stopOpacity="0.9" />
          <stop offset="40%" stopColor={p.sun} stopOpacity="0.45" />
          <stop offset="100%" stopColor={p.sun} stopOpacity="0" />
        </radialGradient>
        <linearGradient id="landing-far" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={p.far} />
          <stop offset="100%" stopColor={p.mid} />
        </linearGradient>
        <linearGradient id="landing-water" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={p.water} stopOpacity="0.5" />
          <stop offset="100%" stopColor={p.water} stopOpacity="0.9" />
        </linearGradient>
        <filter id="landing-grain" x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={2} seed={3} />
          <feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.06 0" />
          <feComposite in2="SourceGraphic" operator="in" />
        </filter>
      </defs>

      <rect x="0" y="0" width="1200" height="720" fill="url(#landing-sky)" />
      <rect x="0" y="0" width="1200" height="720" fill="url(#landing-sunGlow)" />
      <circle cx="744" cy="445" r="58" fill={p.sunCore} opacity="0.85" />

      <path
        d="M0,520 L100,475 L200,495 L300,460 L420,485 L520,450 L640,475 L760,440 L880,470 L1000,445 L1120,480 L1200,460 L1200,720 L0,720 Z"
        fill="url(#landing-far)"
        opacity="0.55"
      />
      <path
        d="M0,560 L80,540 L180,548 L280,518 L380,535 L480,510 L580,532 L700,500 L820,525 L940,505 L1080,530 L1200,515 L1200,720 L0,720 Z"
        fill={p.mid}
        opacity="0.85"
      />
      <path
        d="M0,615 L120,595 L240,610 L360,585 L500,602 L640,578 L800,598 L940,582 L1080,602 L1200,588 L1200,720 L0,720 Z"
        fill={p.near}
      />
      <rect x="0" y="608" width="1200" height="12" fill="url(#landing-water)" opacity="0.5" />

      <g
        className="birds"
        fill="none"
        stroke={p.birds}
        strokeWidth="1.6"
        strokeLinecap="round"
        opacity="0.55"
      >
        <path d="M820,360 q6,-6 12,0 q6,-6 12,0" />
        <path d="M860,345 q5,-4 10,0 q5,-4 10,0" />
        <path d="M895,375 q4,-3 8,0 q4,-3 8,0" />
      </g>

      <rect x="0" y="0" width="1200" height="720" filter="url(#landing-grain)" />
    </svg>
  );
}
