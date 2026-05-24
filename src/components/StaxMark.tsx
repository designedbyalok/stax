import { cn } from "@/lib/utils";

/**
 * The Stax logo mark — three horizontal bars of varying widths.
 * Uses currentColor so it picks up whatever text color the parent sets.
 *
 *   size — square pixel size of the bounding box (default 22)
 *   strokeWidth — bar height in px (default 3)
 *   gap — vertical gap between bars in px (default 2)
 */
export function StaxMark({
  size = 22,
  strokeWidth = 3,
  gap = 2,
  className,
}: {
  size?: number;
  strokeWidth?: number;
  gap?: number;
  className?: string;
}) {
  const padding = Math.max(2, Math.round(size * 0.14));
  return (
    <span
      className={cn("inline-grid content-center", className)}
      style={{
        width: size,
        height: size,
        padding,
        gap,
      }}
      aria-hidden
    >
      <span
        style={{
          display: "block",
          height: strokeWidth,
          width: "70%",
          borderRadius: 1,
          background: "currentColor",
        }}
      />
      <span
        style={{
          display: "block",
          height: strokeWidth,
          width: "100%",
          borderRadius: 1,
          background: "currentColor",
        }}
      />
      <span
        style={{
          display: "block",
          height: strokeWidth,
          width: "50%",
          borderRadius: 1,
          background: "currentColor",
        }}
      />
    </span>
  );
}
