"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

// Deterministic, pleasant background color for the initials monogram so a
// given name always renders the same hue.
function hueFromString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 360;
  return h;
}

function initialsFromName(name?: string | null): string {
  const parts = (name ?? "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

/**
 * Circular avatar (photo, else a colored initials monogram) wrapped by an
 * animated SVG completion ring. Accessible + reduced-motion friendly.
 */
export function ProfileAvatarRing({
  name,
  photoUrl,
  percent,
  size = 32,
  strokeWidth = 2.5,
  gap = 2,
  className,
}: {
  name?: string | null;
  photoUrl?: string | null;
  percent: number;
  size?: number;
  strokeWidth?: number;
  gap?: number;
  className?: string;
}) {
  const pct = Math.max(0, Math.min(100, Math.round(percent)));
  const r = (size - strokeWidth) / 2;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - pct / 100);
  // Inner avatar diameter leaves room for ring + a small gap.
  const inner = size - strokeWidth * 2 - gap * 2;
  const initials = initialsFromName(name);
  const hue = hueFromString(name || "stax");
  const firstName = (name ?? "").trim().split(/\s+/)[0] || "your";

  return (
    <span
      className={cn("relative inline-grid place-items-center shrink-0", className)}
      style={{ width: size, height: size }}
      role="img"
      aria-label={`${firstName}'s profile is ${pct}% complete`}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="absolute inset-0 -rotate-90"
        aria-hidden
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="currentColor"
          className="text-border"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="currentColor"
          className="text-primary motion-safe:transition-[stroke-dashoffset] motion-safe:duration-700 motion-safe:ease-out"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
        />
      </svg>

      <span
        className="rounded-full overflow-hidden grid place-items-center"
        style={{ width: inner, height: inner }}
      >
        {photoUrl ? (
          <Image
            src={photoUrl}
            alt=""
            width={inner}
            height={inner}
            unoptimized
            className="h-full w-full object-cover"
          />
        ) : (
          <span
            className="h-full w-full grid place-items-center font-semibold text-white select-none"
            style={{
              backgroundColor: `hsl(${hue} 55% 45%)`,
              fontSize: Math.max(10, inner * 0.42),
            }}
          >
            {initials}
          </span>
        )}
      </span>
    </span>
  );
}
