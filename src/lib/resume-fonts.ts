// Curated set of Google Fonts offered in the resume builder's design
// panel. Loading the entire Google Fonts catalogue (1500+ families) is
// impractical, so this is a hand-picked spread of popular, resume-friendly
// faces across the three broad categories. Each entry's `name` is the exact
// Google Fonts family name; `stack` adds a sensible local fallback.

export type FontCategory = "Sans Serif" | "Serif" | "Monospace";

export interface ResumeFont {
  name: string;
  category: FontCategory;
  stack: string;
}

export const RESUME_FONTS: ResumeFont[] = [
  // Sans Serif
  { name: "Inter", category: "Sans Serif", stack: "system-ui, sans-serif" },
  { name: "Roboto", category: "Sans Serif", stack: "system-ui, sans-serif" },
  { name: "Open Sans", category: "Sans Serif", stack: "system-ui, sans-serif" },
  { name: "Lato", category: "Sans Serif", stack: "system-ui, sans-serif" },
  { name: "Montserrat", category: "Sans Serif", stack: "system-ui, sans-serif" },
  { name: "Poppins", category: "Sans Serif", stack: "system-ui, sans-serif" },
  { name: "Raleway", category: "Sans Serif", stack: "system-ui, sans-serif" },
  { name: "Nunito", category: "Sans Serif", stack: "system-ui, sans-serif" },
  { name: "Work Sans", category: "Sans Serif", stack: "system-ui, sans-serif" },
  { name: "Source Sans 3", category: "Sans Serif", stack: "system-ui, sans-serif" },
  { name: "Mulish", category: "Sans Serif", stack: "system-ui, sans-serif" },
  { name: "Rubik", category: "Sans Serif", stack: "system-ui, sans-serif" },
  { name: "DM Sans", category: "Sans Serif", stack: "system-ui, sans-serif" },
  // Serif
  { name: "Lora", category: "Serif", stack: "Georgia, serif" },
  { name: "Merriweather", category: "Serif", stack: "Georgia, serif" },
  { name: "Playfair Display", category: "Serif", stack: "Georgia, serif" },
  { name: "PT Serif", category: "Serif", stack: "Georgia, serif" },
  { name: "Source Serif 4", category: "Serif", stack: "Georgia, serif" },
  { name: "EB Garamond", category: "Serif", stack: "Garamond, serif" },
  { name: "Cormorant Garamond", category: "Serif", stack: "Garamond, serif" },
  { name: "Libre Baskerville", category: "Serif", stack: "Georgia, serif" },
  // Monospace
  { name: "JetBrains Mono", category: "Monospace", stack: "ui-monospace, monospace" },
  { name: "Roboto Mono", category: "Monospace", stack: "ui-monospace, monospace" },
  { name: "IBM Plex Mono", category: "Monospace", stack: "ui-monospace, monospace" },
  { name: "Space Mono", category: "Monospace", stack: "ui-monospace, monospace" },
];

// Legacy `fontFamily` values predate the named-font picker. Map them onto a
// concrete family so existing resumes keep rendering sensibly.
const LEGACY_FONTS: Record<string, string> = {
  sans: "Inter",
  serif: "Lora",
  mono: "JetBrains Mono",
};

export const DEFAULT_FONT = "Inter";

/** Resolve a stored `design.fontFamily` value to a known font + CSS value. */
export function resolveFont(value?: string): { font: ResumeFont; cssFamily: string } {
  const name = (value && LEGACY_FONTS[value]) || value || DEFAULT_FONT;
  const font =
    RESUME_FONTS.find((f) => f.name === name) ??
    RESUME_FONTS.find((f) => f.name === DEFAULT_FONT)!;
  return { font, cssFamily: `"${font.name}", ${font.stack}` };
}

/** Build a Google Fonts CSS2 stylesheet href for the given families. */
export function googleFontsHref(families: string[]): string {
  const unique = Array.from(new Set(families)).filter(Boolean);
  if (unique.length === 0) return "";
  const params = unique
    .map((name) => `family=${encodeURIComponent(name).replace(/%20/g, "+")}:wght@400;500;600;700`)
    .join("&");
  return `https://fonts.googleapis.com/css2?${params}&display=swap`;
}

// Single href that pulls in every curated family — used by the design panel
// so each option can preview in its own typeface.
export const ALL_FONTS_HREF = googleFontsHref(RESUME_FONTS.map((f) => f.name));
