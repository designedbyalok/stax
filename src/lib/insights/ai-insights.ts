// Gemini-powered salary insight generator.
//
// Estimates a salary distribution + comparable-pool size for a role × city ×
// country × experience bracket, when we don't have curated or community data
// for that slice. Mirrors the defensive pattern in `ai/tldr.ts`: any failure
// (missing key, HTTP error, timeout, bad JSON) resolves to null so insights
// degrade gracefully. Results are cached by the caller, so this runs at most
// once per slice (until a manual refresh).

import type { ExperienceBracket } from "./experience";

const MODEL = "gemini-2.5-flash";
const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;
const TIMEOUT_MS = 12_000;

export type AiSalaryEstimate = {
  p25: number;
  p50: number;
  p75: number;
  p90: number;
  currency: string;
  /** Rough number of comparable professionals in this role × location. */
  comparableCount: number;
};

export type AiInsightQuery = {
  jobRole: string;
  city: string | null; // null = country-level
  country: string;
  bracket: ExperienceBracket;
  currency: string;
};

const BRACKET_LABEL: Record<ExperienceBracket, string> = {
  "0-2": "0 to 2 years",
  "3-5": "3 to 5 years",
  "6-9": "6 to 9 years",
  "10+": "10 or more years",
};

function isEstimate(v: unknown): v is AiSalaryEstimate {
  if (!v || typeof v !== "object") return false;
  const o = v as Record<string, unknown>;
  return (
    typeof o.p25 === "number" &&
    typeof o.p50 === "number" &&
    typeof o.p75 === "number" &&
    typeof o.p90 === "number" &&
    typeof o.currency === "string" &&
    typeof o.comparableCount === "number"
  );
}

export async function generateSalaryEstimate(
  q: AiInsightQuery
): Promise<AiSalaryEstimate | null> {
  const apiKey = process.env.GOOGLE_AI_API_KEY;
  if (!apiKey) {
    console.warn("GOOGLE_AI_API_KEY missing — skipping AI salary estimate");
    return null;
  }

  const place = q.city ? `${q.city}, ${q.country}` : `${q.country} (nationwide)`;
  const prompt = `You are a compensation analyst. Estimate the current annual gross BASE salary distribution for this role, in the local currency. Output JSON only.

Role: ${q.jobRole}
Location: ${place}
Experience: ${BRACKET_LABEL[q.bracket]}
Currency: ${q.currency} (return all salary numbers as integers in this currency)

Return:
- p25, p50, p75, p90: salary percentiles (integers, p25 < p50 < p75 < p90)
- currency: the 3-letter code (${q.currency})
- comparableCount: a rough estimate of how many professionals hold this role at this experience level in this location (integer)

Base figures on typical market rates. Be realistic, not aspirational.`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(`${ENDPOINT}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.2,
          responseMimeType: "application/json",
          responseSchema: {
            type: "object",
            properties: {
              p25: { type: "integer" },
              p50: { type: "integer" },
              p75: { type: "integer" },
              p90: { type: "integer" },
              currency: { type: "string" },
              comparableCount: { type: "integer" },
            },
            required: ["p25", "p50", "p75", "p90", "currency", "comparableCount"],
          },
        },
      }),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.warn(`Gemini salary HTTP ${res.status}: ${text.slice(0, 200)}`);
      return null;
    }

    const payload = (await res.json()) as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    };
    const raw = payload.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!raw) return null;

    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      return null;
    }
    if (!isEstimate(parsed)) return null;

    // Sanity: enforce ordering + non-negative, clamp comparableCount.
    const nums = [parsed.p25, parsed.p50, parsed.p75, parsed.p90].map((n) => Math.max(0, Math.round(n)));
    nums.sort((a, b) => a - b);
    if (nums[0] === 0 && nums[3] === 0) return null;

    return {
      p25: nums[0],
      p50: nums[1],
      p75: nums[2],
      p90: nums[3],
      currency: (parsed.currency || q.currency).slice(0, 3).toUpperCase(),
      comparableCount: Math.max(1, Math.round(parsed.comparableCount)),
    };
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      console.warn("Gemini salary estimate timed out");
    } else {
      console.warn("Gemini salary estimate error:", err);
    }
    return null;
  } finally {
    clearTimeout(timer);
  }
}
