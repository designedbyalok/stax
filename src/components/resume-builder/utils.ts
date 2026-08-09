import { ApiResume } from "@/lib/types/resume";

// Snapshot used to detect unsaved edits for autosave.
export function serializeResume(r: ApiResume): string {
  return JSON.stringify({ title: r.title, content: r.content });
}
