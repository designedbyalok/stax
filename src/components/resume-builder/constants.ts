export const THEME_COLORS = [
  { name: "Slate", value: "#0f172a" },
  { name: "Blue", value: "#2563eb" },
  { name: "Rose", value: "#e11d48" },
  { name: "Emerald", value: "#059669" },
  { name: "Violet", value: "#7c3aed" },
  { name: "Amber", value: "#d97706" },
];

export const BACKGROUND_COLORS = [
  { name: "White", value: "#ffffff" },
  { name: "Cloud", value: "#f8fafc" },
  { name: "Cream", value: "#fdf6ec" },
  { name: "Mint", value: "#f0fdf4" },
  { name: "Sky", value: "#f0f9ff" },
  { name: "Blush", value: "#fdf2f8" },
];

export const TEXT_COLORS = [
  { name: "Ink", value: "#27272a" },
  { name: "Black", value: "#000000" },
  { name: "Graphite", value: "#3f3f46" },
  { name: "Navy", value: "#1e293b" },
  { name: "Espresso", value: "#3b2f2f" },
];

export const LINK_PREFIXES: Record<string, string> = {
  LinkedIn: "linkedin.com/in/",
  GitHub: "github.com/",
  "X (Twitter)": "x.com/",
  Dribbble: "dribbble.com/",
  Behance: "behance.net/",
  Medium: "medium.com/@",
  "Dev.to": "dev.to/",
  Instagram: "instagram.com/",
};

// Per-platform URL hints shown in the link's address field.
export const LINK_PLACEHOLDERS: Record<string, string> = {
  LinkedIn: "linkedin.com/in/you",
  GitHub: "github.com/you",
  "X (Twitter)": "x.com/you",
  Portfolio: "yoursite.com",
  Website: "yoursite.com",
  Dribbble: "dribbble.com/you",
  Behance: "behance.net/you",
  "Stack Overflow": "stackoverflow.com/users/...",
  Medium: "medium.com/@you",
  "Dev.to": "dev.to/you",
  YouTube: "youtube.com/@you",
  Instagram: "instagram.com/you",
};
