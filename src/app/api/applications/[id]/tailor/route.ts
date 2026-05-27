import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { requireUserId } from "@/lib/api";
import { extractDocumentText } from "@/lib/documents/extract-text";
import { scoreResumeMatch } from "@/lib/ai/match-score";

type Params = { params: Promise<{ id: string }> };

// POST /api/applications/:id/tailor
// Scores the application's attached resume against its job description
// using Gemini, persists matchScore + matchDetails, and returns them.
export async function POST(_req: Request, { params }: Params) {
  const auth = await requireUserId();
  if (!auth.ok) return auth.response;
  const { id } = await params;

  const application = await prisma.application.findFirst({
    where: { id, userId: auth.userId, deletedAt: null },
    include: { resume: true },
  });

  if (!application) {
    return NextResponse.json({ error: "Application not found" }, { status: 404 });
  }
  if (!application.resume) {
    return NextResponse.json(
      { error: "Attach a resume before running the tailor." },
      { status: 400 }
    );
  }
  if (!application.jobDescription || application.jobDescription.trim().length < 80) {
    return NextResponse.json(
      { error: "This job has no description to compare against." },
      { status: 400 }
    );
  }

  const resumeText = await extractDocumentText({
    storageKey: application.resume.storageKey,
    mimeType: application.resume.mimeType,
    filename: application.resume.filename,
  });

  if (!resumeText || resumeText.length < 80) {
    return NextResponse.json(
      { error: "Couldn't read text from the resume file." },
      { status: 422 }
    );
  }

  const match = await scoreResumeMatch(resumeText, application.jobDescription);
  if (!match) {
    return NextResponse.json(
      { error: "The AI analysis failed. Try again in a moment." },
      { status: 502 }
    );
  }

  const matchDetails = { ...match, generatedAt: new Date().toISOString() };

  const updated = await prisma.application.update({
    where: { id: application.id },
    data: {
      matchScore: match.score,
      matchDetails,
      activities: {
        create: {
          type: "USER_EVENT",
          description: `Ran AI Tailor — ${match.score}% match`,
        },
      },
    },
  });

  return NextResponse.json({
    matchScore: updated.matchScore,
    matchDetails,
  });
}
