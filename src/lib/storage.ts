import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export { supabase, isSupabaseConfigured };

/** Resolves the configured Supabase Storage bucket (defaults to "documents"). */
export function getStorageBucket(): string {
  return process.env.SUPABASE_STORAGE_BUCKET || "documents";
}

/** Dedicated public bucket for profile photos (defaults to "avatars"). */
export function getAvatarsBucket(): string {
  return process.env.SUPABASE_AVATARS_BUCKET || "avatars";
}

// Buckets we've already confirmed/created this process, so we don't re-check
// on every upload.
const ensuredBuckets = new Set<string>();

/**
 * Makes sure a Storage bucket exists (creating it with the service-role key if
 * needed). Profile photos live in a *public* bucket separate from the private
 * documents bucket, so they can be shown via a plain public URL and aren't
 * constrained by the documents bucket's PDF-only MIME settings.
 */
export async function ensurePublicBucket(
  bucket: string,
  opts?: { fileSizeLimit?: number; allowedMimeTypes?: string[] }
): Promise<{ error: { message: string } | null }> {
  if (ensuredBuckets.has(bucket)) return { error: null };
  const { data, error: getErr } = await supabase.storage.getBucket(bucket);
  if (data) {
    ensuredBuckets.add(bucket);
    return { error: null };
  }
  // getBucket errors when the bucket is missing — try to create it.
  const { error: createErr } = await supabase.storage.createBucket(bucket, {
    public: true,
    fileSizeLimit: opts?.fileSizeLimit,
    allowedMimeTypes: opts?.allowedMimeTypes,
  });
  // A concurrent request may have created it first; treat "already exists" as ok.
  if (createErr && !/already exists/i.test(createErr.message)) {
    return { error: { message: createErr.message || getErr?.message || "bucket error" } };
  }
  ensuredBuckets.add(bucket);
  return { error: null };
}

/**
 * Uploads a file's bytes to Supabase Storage under `storageKey` in the given
 * bucket (defaults to the documents bucket).
 *
 * In Next 15 / Node 20+, passing a `File` object directly to Supabase upload
 * can cause a "fetch failed" error due to Undici — so we read the file into an
 * ArrayBuffer first. This helper is shared by document uploads and profile
 * photo uploads to keep behaviour identical.
 */
export async function uploadToStorage(
  storageKey: string,
  file: File,
  opts?: { upsert?: boolean; bucket?: string }
): Promise<{ error: { message: string } | null }> {
  const bucket = opts?.bucket ?? getStorageBucket();
  const fileBuffer = await file.arrayBuffer();
  const { error } = await supabase.storage.from(bucket).upload(storageKey, fileBuffer, {
    contentType: file.type,
    upsert: opts?.upsert ?? false,
  });
  return { error: error ? { message: error.message } : null };
}

/** Returns the public URL for an object already uploaded to the bucket. */
export function getPublicUrl(storageKey: string, bucket?: string): string {
  const { data } = supabase.storage.from(bucket ?? getStorageBucket()).getPublicUrl(storageKey);
  return data.publicUrl;
}
