// Gemini-powered job-description summarizer.
//
// Intentionally NOT marked with `server-only` so the backfill script
// can import it directly. The API key is read from a non-NEXT_PUBLIC
// env var, so an accidental client import would just resolve to null
// (no key, function returns early) — no key leak risk.
//
// We hit the v1beta REST endpoint directly to avoid pulling in the
// @google/generative-ai SDK for what amounts to one structured-output
// call. Uses Gemini 2.5 Flash for cost + speed (~$0.0001 per call,
// usually well under 2 seconds).
//
// The function is *defensive*: any failure — missing key, HTTP error,
// timeout, malformed JSON — resolves to null. Job creation should
// never block on Gemini being available.

const MODEL = "gemini-2.5-flash";
const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

// Hard limit so we don't blow latency on huge JD pastes.
const TIMEOUT_MS = 10_000;
// Gemini Flash has a generous context window, but more text = more cost
// + slower response. ~12k chars is plenty for a typical posting.
const MAX_INPUT_CHARS = 12_000;

export type JobTldr = {
  headline: string;
  bullets: string[];
  responsibilities: string[];
  qualifications: string[];
  keywords: string[];
};

const PROMPT_PREFIX = `You are a job-application analyzer. Read the job description below and produce a structured TL;DR and analysis for someone deciding whether to apply.

Requirements:
- "headline": one short, declarative line (max 90 chars) capturing the most distinctive thing about this role. Avoid generic phrases like "Exciting opportunity". Lead with the role's actual focus.
- "bullets": 3-4 short bullets, each at most 14 words. Cover core focus, must-haves, compensation, and notable terms.
- "responsibilities": 3-5 succinct points on what the candidate will actually do day-to-day.
- "qualifications": 3-5 succinct points on the core requirements (e.g. "3+ years React", "B.S. Computer Science").
- "keywords": an array of 5-10 specific technologies, tools, or domain skills (e.g. "React", "TypeScript", "Product Design", "Figma").

Job description:
`;

export async function generateJobTldr(
  description: string
): Promise<JobTldr | null> {
  const apiKey = process.env.GOOGLE_AI_API_KEY;
  if (!apiKey) {
    console.warn("GOOGLE_AI_API_KEY missing — skipping TL;DR generation");
    return null;
  }

  const trimmed = description.trim();
  if (trimmed.length < 60) {
    return null;
  }

  const input =
    trimmed.length > MAX_INPUT_CHARS
      ? trimmed.slice(0, MAX_INPUT_CHARS) + "\n…[truncated]"
      : trimmed;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(`${ENDPOINT}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: PROMPT_PREFIX + input }],
          },
        ],
        generationConfig: {
          temperature: 0.2,
          responseMimeType: "application/json",
          responseSchema: {
            type: "object",
            properties: {
              headline: { type: "string" },
              bullets: {
                type: "array",
                items: { type: "string" },
                minItems: 3,
                maxItems: 4,
              },
              responsibilities: {
                type: "array",
                items: { type: "string" },
                minItems: 3,
                maxItems: 5,
              },
              qualifications: {
                type: "array",
                items: { type: "string" },
                minItems: 3,
                maxItems: 5,
              },
              keywords: {
                type: "array",
                items: { type: "string" },
                minItems: 5,
                maxItems: 10,
              }
            },
            required: ["headline", "bullets", "responsibilities", "qualifications", "keywords"],
          },
        },
      }),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.warn(`Gemini TL;DR HTTP ${res.status}: ${text.slice(0, 200)}`);
      return null;
    }

    const payload = (await res.json()) as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    };
    const raw = payload.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!raw) {
      console.warn("Gemini TL;DR returned no candidate text");
      return null;
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      console.warn("Gemini returned non-JSON:", raw.slice(0, 200));
      return null;
    }

    if (!isJobTldr(parsed)) {
      console.warn("Gemini returned unexpected shape:", raw.slice(0, 200));
      return null;
    }

    return {
      headline: parsed.headline.slice(0, 140),
      bullets: parsed.bullets.slice(0, 4).map((b) => b.slice(0, 200)),
      responsibilities: parsed.responsibilities.slice(0, 5),
      qualifications: parsed.qualifications.slice(0, 5),
      keywords: parsed.keywords.slice(0, 10),
    };
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      console.warn("Gemini TL;DR timed out after", TIMEOUT_MS, "ms");
    } else {
      console.warn("Gemini TL;DR error:", err);
    }
    return null;
  } finally {
    clearTimeout(timer);
  }
}

function isJobTldr(x: unknown): x is JobTldr {
  if (!x || typeof x !== "object") return false;
  const o = x as Record<string, unknown>;
  return (
    typeof o.headline === "string" &&
    Array.isArray(o.bullets) &&
    Array.isArray(o.responsibilities) &&
    Array.isArray(o.qualifications) &&
    Array.isArray(o.keywords)
  );
}
