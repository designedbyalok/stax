import { NextRequest, NextResponse } from "next/server";
import { requireUserId } from "@/lib/api";
import pdfParse from "pdf-parse";

const MODEL = "gemini-2.5-flash";
const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

export async function POST(req: NextRequest) {
  const auth = await requireUserId();
  if (!auth.ok) return auth.response;

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json({ error: "Only PDF files are supported" }, { status: 400 });
    }

    // Extract text from PDF
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    let text = "";
    try {
      const pdfData = await pdfParse(buffer);
      text = pdfData.text.trim();
    } catch (e) {
      console.error("PDF Parsing error", e);
      return NextResponse.json({ error: "Failed to parse PDF file" }, { status: 400 });
    }

    if (!text || text.length < 50) {
      return NextResponse.json({ error: "Could not extract sufficient text from PDF" }, { status: 400 });
    }

    const apiKey = process.env.GOOGLE_AI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "AI is not configured" }, { status: 503 });
    }

    const PROMPT = `Extract the resume data from the following text and output it exactly matching the requested JSON schema.
Ensure dates are strings in formats like "Jan 2020", "2018", or "Present". Do not output nulls; use empty strings instead.

Resume Text:
${text.slice(0, 15000)}`;

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 60000);

    const payload = {
      contents: [
        {
          role: "user",
          parts: [{ text: PROMPT }],
        },
      ],
      generationConfig: {
        temperature: 0.1,
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            basics: {
              type: "object",
              properties: {
                name: { type: "string" },
                email: { type: "string" },
                phone: { type: "string" },
                location: { type: "string" },
                headline: { type: "string" },
                summary: { type: "string" },
              },
              required: ["name", "email", "phone", "location", "headline", "summary"]
            },
            work: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: { type: "string" },
                  company: { type: "string" },
                  position: { type: "string" },
                  startDate: { type: "string" },
                  endDate: { type: "string" },
                  summary: { type: "string" }
                },
                required: ["id", "company", "position", "startDate", "endDate", "summary"]
              }
            },
            education: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: { type: "string" },
                  institution: { type: "string" },
                  studyType: { type: "string" },
                  area: { type: "string" },
                  startDate: { type: "string" },
                  endDate: { type: "string" }
                },
                required: ["id", "institution", "studyType", "area", "startDate", "endDate"]
              }
            },
            skills: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: { type: "string" },
                  name: { type: "string" },
                  level: { type: "string" }
                },
                required: ["id", "name", "level"]
              }
            }
          },
          required: ["basics", "work", "education", "skills"]
        }
      }
    };

    let res: Response | null = null;
    let fetchError: unknown = null;

    try {
      const primaryResponse = await fetch(`${ENDPOINT}?key=${apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify(payload),
      });
      if (primaryResponse.ok) {
        res = primaryResponse;
      } else if (primaryResponse.status !== 503) {
        const err = await primaryResponse.text();
        console.error("Gemini API Error:", err);
        return NextResponse.json({ error: "Failed to process resume with AI" }, { status: 500 });
      }
    } catch (err: unknown) {
      const name = err instanceof Error ? err.name : "Error";
      console.log("Fetch failed or timed out:", name);
      fetchError = err;
    }
    
    clearTimeout(timer);

    if (!res) {
      console.log("Gemini 2.5 Flash failed or is busy, falling back to Gemini 2.5 Pro");
      const fallbackController = new AbortController();
      const fallbackTimer = setTimeout(() => fallbackController.abort(), 60000);
      const FALLBACK_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent`;
      
      try {
        const fallbackResponse = await fetch(`${FALLBACK_ENDPOINT}?key=${apiKey}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: fallbackController.signal,
          body: JSON.stringify(payload),
        });
        if (!fallbackResponse.ok) {
          const err = await fallbackResponse.text();
          console.error("Gemini fallback API Error:", err);
          return NextResponse.json({ error: "Failed to process resume with AI" }, { status: 500 });
        }
        res = fallbackResponse;
      } catch (err: unknown) {
        console.error("Fallback fetch failed:", err);
        return NextResponse.json({ error: "Failed to process resume with AI" }, { status: 500 });
      } finally {
        clearTimeout(fallbackTimer);
      }
    }

    if (!res?.ok) {
      const err = res ? await res.text() : "Unknown network error";
      console.error("Gemini API Error:", err);
      return NextResponse.json({ error: "Failed to process resume with AI" }, { status: 500 });
    }

    const data = await res.json();
    const parsedText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!parsedText) {
      return NextResponse.json({ error: "AI returned empty response" }, { status: 500 });
    }

    let json;
    try {
      // Strip markdown code block wrapping if present
      const cleanedText = parsedText.replace(/^```(json)?|```$/gm, "").trim();
      json = JSON.parse(cleanedText);
    } catch (parseError) {
      console.error("Failed to parse Gemini output:", parsedText);
      return NextResponse.json({ error: "AI returned invalid JSON" }, { status: 500 });
    }

    // Provide random UUIDs if the AI forgot or made weird ones
    json.work = (json.work || []).map((w: any) => ({ ...w, id: crypto.randomUUID() }));
    json.education = (json.education || []).map((e: any) => ({ ...e, id: crypto.randomUUID() }));
    json.skills = (json.skills || []).map((s: any) => ({ ...s, id: crypto.randomUUID() }));
    
    // Inject default design settings
    json.design = {
      template: "classic",
      themeColor: "#0f172a",
      fontFamily: "sans",
      spacing: 1,
    };

    return NextResponse.json({ data: json });
  } catch (error) {
    console.error("Import error:", error);
    return NextResponse.json({ error: "Failed to import resume" }, { status: 500 });
  }
}
