import { createHash, randomBytes } from "crypto";

/**
 * Generates a cryptographically random 32-byte token, returns:
 *   - the raw URL-safe base64 token to email to the user
 *   - the SHA-256 hash to persist in DB
 *
 * We never store the raw token, so a DB compromise can't be used to reset
 * accounts. Reset windows are 1 hour and single-use.
 */
export function generateResetToken(): { token: string; tokenHash: string } {
  const buf = randomBytes(32);
  const token = buf.toString("base64url");
  const tokenHash = createHash("sha256").update(token).digest("hex");
  return { token, tokenHash };
}

export function hashResetToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export const PASSWORD_RESET_TTL_MS = 60 * 60 * 1000; // 1 hour
