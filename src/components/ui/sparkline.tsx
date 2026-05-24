// Mini SVG line chart used inside StatCards. Draws a smooth path
// across the given values, normalized to the [0..1] range with a
// small vertical padding so the line never touches the edges.
//
// Kept dependency-free and deliberately tiny.
export function Sparkline({
  values,
  width = 58,
  height = 20,
  color = "currentColor",
  strokeWidth = 1.3,
  className,
}: {
  values: number[];
  width?: number;
  height?: number;
  color?: string;
  strokeWidth?: number;
  className?: string;
}) {
  if (!values || values.length < 2) {
    return (
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className={className}
        aria-hidden
      >
        <line
          x1={0}
          x2={width}
          y1={height / 2}
          y2={height / 2}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          opacity={0.4}
        />
      </svg>
    );
  }

  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const padY = height * 0.15;
  const inner = height - padY * 2;
  const stepX = values.length === 1 ? 0 : width / (values.length - 1);

  const d = values
    .map((v, i) => {
      const x = i * stepX;
      const y = height - padY - ((v - min) / range) * inner;
      return `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={className}
      preserveAspectRatio="none"
      aria-hidden
    >
      <path
        d={d}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
