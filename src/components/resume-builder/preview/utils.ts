import type { ResumeData } from "@/lib/types/resume";

export function ensureHttp(url: string): string {
  const u = url.trim();
  if (!u) return "#";
  return /^https?:\/\//i.test(u) ? u : `https://${u}`;
}

export function displayUrl(url: string): string {
  return url.trim().replace(/^https?:\/\//i, "").replace(/\/$/, "");
}

export function contactLinks(basics: ResumeData["basics"]) {
  const out: Array<{ id: string; label: string; url: string }> = [];
  if (basics.url?.trim()) {
    out.push({ id: "__site", label: displayUrl(basics.url), url: basics.url });
  }
  for (const l of basics.links ?? []) {
    if (l.url?.trim()) {
      out.push({ id: l.id, label: l.label?.trim() || displayUrl(l.url), url: l.url });
    }
  }
  return out;
}
