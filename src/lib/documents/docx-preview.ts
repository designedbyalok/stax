import mammoth from "mammoth";
import { sanitizeHtml } from "./sanitize-html";

export async function docxToHtml(buffer: Buffer): Promise<string> {
  const result = await mammoth.convertToHtml({ buffer });
  return sanitizeHtml(result.value);
}
