"use client";

import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import { cn } from "@/lib/utils";

export type { IconSvgElement };

interface IconProps {
  /** A HugeIcons icon imported from `@hugeicons/core-free-icons`. */
  icon: IconSvgElement;
  /** Pixel size of the square glyph. Defaults to 18 — the app's base UI size. */
  size?: number;
  /** Stroke weight for the linear (default) rendering. */
  strokeWidth?: number;
  /**
   * Render the glyph filled instead of stroked. Used sparingly for emphasis —
   * active navigation, status, brand moments — so the UI reads as a
   * deliberate mix of filled + linear icons rather than all-outline.
   */
  solid?: boolean;
  className?: string;
  "aria-label"?: string;
  "aria-hidden"?: boolean;
}

/**
 * App-wide icon. Wraps HugeIcons with Linear-tuned defaults: a thin 1.8
 * stroke for the linear set, and a `solid` fill mode for the filled set.
 * Color follows `currentColor`, so callers style with text-color utilities.
 */
export function Icon({
  icon,
  size = 18,
  strokeWidth = 1.8,
  solid = false,
  className,
  ...rest
}: IconProps) {
  return (
    <HugeiconsIcon
      icon={icon}
      size={size}
      strokeWidth={strokeWidth}
      className={cn(
        "shrink-0",
        // Filled glyphs: paint the enclosed paths and drop the outline.
        solid && "[&_*]:fill-current [&_*]:stroke-[0]",
        className
      )}
      {...rest}
    />
  );
}
