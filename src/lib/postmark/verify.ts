import crypto from "crypto";

/**
 * Verify a Postmark inbound webhook signature using HMAC-SHA256.
 * The payload MUST be the exact raw body string, not parsed JSON.
 */
export function verifyPostmarkSignature(
  rawBody: string,
  signatureHeader: string | null,
  secret: string
): boolean {
  if (!signatureHeader || !secret) return false;

  const hmac = crypto.createHmac("sha256", secret);
  hmac.update(rawBody, "utf8");
  const expectedSignature = hmac.digest("base64");

  // Use timing-safe equal to prevent timing attacks
  try {
    const a = Buffer.from(signatureHeader, "base64");
    const b = Buffer.from(expectedSignature, "base64");
    if (a.length !== b.length) return false;
    return crypto.timingSafeEqual(a, b);
  } catch (e) {
    return false;
  }
}
