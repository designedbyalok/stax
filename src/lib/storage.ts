import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export { supabase, isSupabaseConfigured };

/** Resolves the configured Supabase Storage bucket (defaults to "documents"). */
export function getStorageBucket(): string {
  return process.env.SUPABASE_STORAGE_BUCKET || "documents";
}

/**
 * Uploads a file's bytes to Supabase Storage under `storageKey`.
 *
 * In Next 15 / Node 20+, passing a `File` object directly to Supabase upload
 * can cause a "fetch failed" error due to Undici — so we read the file into an
 * ArrayBuffer first. This helper is shared by document uploads and profile
 * photo uploads to keep behaviour identical.
 */
export async function uploadToStorage(
  storageKey: string,
  file: File,
  opts?: { upsert?: boolean }
): Promise<{ error: { message: string } | null }> {
  const bucket = getStorageBucket();
  const fileBuffer = await file.arrayBuffer();
  const { error } = await supabase.storage.from(bucket).upload(storageKey, fileBuffer, {
    contentType: file.type,
    upsert: opts?.upsert ?? false,
  });
  return { error: error ? { message: error.message } : null };
}

/** Returns the public URL for an object already uploaded to the bucket. */
export function getPublicUrl(storageKey: string): string {
  const bucket = getStorageBucket();
  const { data } = supabase.storage.from(bucket).getPublicUrl(storageKey);
  return data.publicUrl;
}
