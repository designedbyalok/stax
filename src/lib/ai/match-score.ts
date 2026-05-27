// Gemini-powered resume ↔ job-description match scorer. Mirrors the
// defensive structure of tldr.ts: structured JSON output, timeout,
// resolves to null on any failure. Server-only key (no NEXT_PUBLIC).

const MODEL = "gemini-2.5-flash";
const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

const TIMEOUT_MS = 15_000;
const MAX_RESUME_CHARS = 14_000;
const MAX_JD_CHARS = 10_000;

export type ResumeMatch = {
  score: number; // 0-100
  summary: string;
  matchedSkills: string[];
  missingKeywords: string[];
  suggestions: string[];
};

const PROMPT = `You are a technical recruiter. Compare the candidate's RESUME against the JOB DESCRIPTION and return JSON.

- score: integer 0-100. How well the resume matches the role's must-haves. Be honest and calibrated — most real resumes land 40-80.
- summary: one sentence verdict (max 140 chars).
- matchedSkills: 4-8 concrete skills/technologies/domains present in BOTH the resume and the JD.
- missingKeywords: 3-6 important JD requirements that are absent or weak in the resume.
- suggestions: 3-5 specific, actionable resume edits to raise the match (e.g. "Add a bullet quantifying API latency work", not "improve your resume").

Be specific and grounded in the actual texts. Do not invent experience the candidate doesn't have.`;

export async function scoreResumeMatch(
  resumeText: string,
  jobDescription: string
): Promise<ResumeMatch | null> {
  const apiKey = process.env.GOOGLE_AI_API_KEY;
  if (!apiKey) {
    console.warn("GOOGLE_AI_API_KEY missing — skipping match score");
    return null;
  }

  const resume = resumeText.trim().slice(0, MAX_RESUME_CHARS);
  const jd = jobDescription.trim().slice(0, MAX_JD_CHARS);
  if (resume.length < 80 || jd.length < 80) return null;

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
            parts: [
              {
                text: `${PROMPT}\n\n=== RESUME ===\n${resume}\n\n=== JOB DESCRIPTION ===\n${jd}`,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.2,
          responseMimeType: "application/json",
          responseSchema: {
            type: "object",
            properties: {
              score: { type: "integer", minimum: 0, maximum: 100 },
              summary: { type: "string" },
              matchedSkills: {
                type: "array",
                items: { type: "string" },
                minItems: 4,
                maxItems: 8,
              },
              missingKeywords: {
                type: "array",
                items: { type: "string" },
                minItems: 3,
                maxItems: 6,
              },
              suggestions: {
                type: "array",
                items: { type: "string" },
                minItems: 3,
                maxItems: 5,
              },
            },
            required: [
              "score",
              "summary",
              "matchedSkills",
              "missingKeywords",
              "suggestions",
            ],
          },
        },
      }),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.warn(`Match-score HTTP ${res.status}: ${text.slice(0, 200)}`);
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
      console.warn("Match-score: non-JSON response", raw.slice(0, 200));
      return null;
    }

    if (!isResumeMatch(parsed)) {
      console.warn("Match-score: unexpected shape", raw.slice(0, 200));
      return null;
    }

    return {
      score: Math.max(0, Math.min(100, Math.round(parsed.score))),
      summary: parsed.summary.slice(0, 160),
      matchedSkills: parsed.matchedSkills.slice(0, 8),
      missingKeywords: parsed.missingKeywords.slice(0, 6),
      suggestions: parsed.suggestions.slice(0, 5),
    };
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      console.warn("Match-score timed out after", TIMEOUT_MS, "ms");
    } else {
      console.warn("Match-score error:", err);
    }
    return null;
  } finally {
    clearTimeout(timer);
  }
}

function isResumeMatch(x: unknown): x is ResumeMatch {
  if (!x || typeof x !== "object") return false;
  const o = x as Record<string, unknown>;
  return (
    typeof o.score === "number" &&
    typeof o.summary === "string" &&
    Array.isArray(o.matchedSkills) &&
    Array.isArray(o.missingKeywords) &&
    Array.isArray(o.suggestions)
  );
}
