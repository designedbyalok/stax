import "server-only";
import pdfParse from "pdf-parse";
import mammoth from "mammoth";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

// Download a stored document and extract its plain text. Used by the
// AI Tailor flow to feed resume content to the model. PDFs go through
// pdf-parse, DOCX through mammoth. Returns null on any failure so
// callers can degrade gracefully.
export async function extractDocumentText(doc: {
  storageKey: string;
  mimeType: string;
  filename: string;
}): Promise<string | null> {
  if (!isSupabaseConfigured) return null;

  const bucket = process.env.SUPABASE_STORAGE_BUCKET || "documents";
  const { data, error } = await supabase.storage
    .from(bucket)
    .download(doc.storageKey);

  if (error || !data) {
    console.error("extractDocumentText: download failed", error);
    return null;
  }

  try {
    const buffer = Buffer.from(await data.arrayBuffer());

    const isDocx =
      doc.mimeType.includes("word") ||
      doc.filename.toLowerCase().endsWith(".docx");

    if (doc.mimeType === "application/pdf") {
      const parsed = await pdfParse(buffer);
      return parsed.text?.trim() || null;
    }

    if (isDocx) {
      const result = await mammoth.extractRawText({ buffer });
      return result.value?.trim() || null;
    }

    // Plain text / unknown — best-effort decode.
    return buffer.toString("utf8").trim() || null;
  } catch (e) {
    console.error("extractDocumentText: parse failed", e);
    return null;
  }
}
