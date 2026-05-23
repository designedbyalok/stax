import { generateKeyBetween } from "fractional-indexing";

/**
 * Application.position is stored as an Int in the DB but we want fractional
 * indexing-style ordering for cheap reorders. We keep the schema as Int by
 * spacing positions by a wide gap (STEP) and renumbering on collision.
 *
 * Note: a cleaner long-term move is to switch `position` to a String column
 * holding the fractional key directly. For V1 the integer gap approach keeps
 * things simple and avoids a migration.
 */
export const POSITION_STEP = 1024;

export function nextPositionAfter(last: number | null): number {
  if (last == null) return POSITION_STEP;
  return last + POSITION_STEP;
}

export function midpoint(a: number | null, b: number | null): number {
  if (a == null && b == null) return POSITION_STEP;
  if (a == null) return (b as number) - POSITION_STEP;
  if (b == null) return a + POSITION_STEP;
  const mid = Math.floor((a + b) / 2);
  return mid === a || mid === b ? a + 1 : mid;
}

// Re-exported for parity in case we move to string keys later.
export { generateKeyBetween };
