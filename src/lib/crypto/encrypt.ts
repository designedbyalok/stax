import crypto from "crypto";

const ALGORITHM = "aes-256-cbc";
const IV_LENGTH = 16;

// 32-byte (256-bit) hex string. MUST be stable across deploys + cold starts —
// otherwise previously-encrypted refresh tokens become permanently unreadable.
// We refuse to silently fall back to an ephemeral key (the previous behavior).
function getEncryptionKey(): Buffer {
  const raw = process.env.ENCRYPTION_KEY;
  if (!raw) {
    throw new Error(
      "ENCRYPTION_KEY env var is required (32-byte hex). Generate with: openssl rand -hex 32"
    );
  }
  const buf = Buffer.from(raw, "hex");
  if (buf.length < 32) {
    throw new Error("ENCRYPTION_KEY must be at least 32 bytes (64 hex chars)");
  }
  return buf.subarray(0, 32);
}

export function encrypt(text: string) {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, getEncryptionKey(), iv);
  
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");

  return {
    encryptedData: encrypted,
    iv: iv.toString("hex"),
  };
}

export function decrypt(encryptedData: string, ivHex: string) {
  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    getEncryptionKey(),
    Buffer.from(ivHex, "hex")
  );
  
  let decrypted = decipher.update(encryptedData, "hex", "utf8");
  decrypted += decipher.final("utf8");
  
  return decrypted;
}
