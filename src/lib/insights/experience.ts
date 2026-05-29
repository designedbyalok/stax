export type ExperienceBracket = "0-2" | "3-5" | "6-9" | "10+";

export const EXPERIENCE_BRACKETS: ExperienceBracket[] = ["0-2", "3-5", "6-9", "10+"];

/** Maps a raw years-of-experience number to one of the four benchmark brackets. */
export function toExperienceBracket(years: number): ExperienceBracket {
  if (years <= 2) return "0-2";
  if (years <= 5) return "3-5";
  if (years <= 9) return "6-9";
  return "10+";
}
