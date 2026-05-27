import { NextResponse, after } from "next/server";
import { z } from "zod";
import prisma from "@/lib/db";
import { requireUserId } from "@/lib/api";
import { nextPositionAfter } from "@/lib/positions";
import { getAverageColor } from "fast-average-color-node";
import { generateJobTldr } from "@/lib/ai/tldr";
import { APPLICATION_LIST_SELECT } from "@/lib/application-select";

export async function GET() {
  const authResult = await requireUserId();
  if (!authResult.ok) return authResult.response;
  const applications = await prisma.application.findMany({
    where: { userId: authResult.userId, deletedAt: null },
    orderBy: [{ columnId: "asc" }, { position: "asc" }],
    select: APPLICATION_LIST_SELECT,
  });

  return NextResponse.json({ applications });
}

const SOURCE_PLATFORMS = [
  "LINKEDIN",
  "GREENHOUSE",
  "LEVER",
  "WORKDAY",
  "INDEED",
  "OTHER",
  "MANUAL",
] as const;

const JOB_TYPES = ["FULL_TIME", "CONTRACT", "INTERNSHIP", "PART_TIME", "OTHER"] as const;

const createSchema = z.object({
  roleTitle: z.string().trim().min(1).max(200),
  companyName: z.string().trim().min(1).max(200),
  location: z.string().trim().max(200).optional().nullable(),
  salaryRange: z.string().trim().max(200).optional().nullable(),
  jobType: z.enum(JOB_TYPES).optional().nullable(),
  originalUrl: z.string().url().max(2000).optional().nullable(),
  jobDescription: z.string().trim().max(50_000).optional().nullable(),
  companyLogoUrl: z.string().url().max(2000).optional().nullable(),
  sourcePlatform: z.enum(SOURCE_PLATFORMS).optional().nullable(),
  columnId: z.string().optional(),
});

export async function POST(request: Request) {
  const authResult = await requireUserId();
  if (!authResult.ok) return authResult.response;
  const userId = authResult.userId;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  // Resolve target column — default to "Saved" (lowest non-archive position).
  let columnId = parsed.data.columnId;
  if (columnId) {
    const owned = await prisma.column.findFirst({
      where: { id: columnId, userId },
      select: { id: true },
    });
    if (!owned) {
      return NextResponse.json({ error: "Column not found" }, { status: 404 });
    }
  } else {
    const defaultColumn = await prisma.column.findFirst({
      where: { userId, isArchive: false },
      orderBy: { position: "asc" },
      select: { id: true },
    });
    if (!defaultColumn) {
      return NextResponse.json({ error: "No columns found. Try refreshing." }, { status: 500 });
    }
    columnId = defaultColumn.id;
  }

  const last = await prisma.application.findFirst({
    where: { userId, columnId, deletedAt: null },
    orderBy: { position: "desc" },
    select: { position: true },
  });

  // Average-color from the logo is cheap + drives the card tint, so
  // we keep it inline. (Resolves to null on failure.)
  const logoColor = parsed.data.companyLogoUrl
    ? await getAverageColor(parsed.data.companyLogoUrl)
        .then((c) => c.hex)
        .catch((e) => {
          console.error("Failed to get average color for logo:", e);
          return null;
        })
    : null;

  // The card is created immediately with empty AI fields — we do NOT
  // block the response on Gemini (it can take several seconds). The
  // TL;DR is generated in the background via after() and the row is
  // updated when it resolves; the client picks it up on its next
  // ["applications"] refetch / when the card detail is opened.
  const application = await prisma.application.create({
    data: {
      userId,
      columnId,
      position: nextPositionAfter(last?.position ?? null),
      roleTitle: parsed.data.roleTitle,
      companyName: parsed.data.companyName,
      location: parsed.data.location || null,
      salaryRange: parsed.data.salaryRange || null,
      jobType: parsed.data.jobType || null,
      originalUrl: parsed.data.originalUrl || null,
      jobDescription: parsed.data.jobDescription || null,
      companyLogoUrl: parsed.data.companyLogoUrl || null,
      logoColor,
      sourcePlatform: parsed.data.sourcePlatform || "MANUAL",
      activities: {
        create: {
          type: "CREATED",
          description: `Created card for ${parsed.data.roleTitle} at ${parsed.data.companyName}`,
        },
      },
    },
  });

  // Background TL;DR generation — runs after the response is sent.
  if (parsed.data.jobDescription) {
    const appId = application.id;
    const jd = parsed.data.jobDescription;
    after(async () => {
      try {
        const tldr = await generateJobTldr(jd);
        if (!tldr) return;
        await prisma.application.update({
          where: { id: appId },
          data: {
            tldrHeadline: tldr.headline,
            tldrBullets: tldr.bullets,
            responsibilities: tldr.responsibilities,
            qualifications: tldr.qualifications,
            keywords: tldr.keywords,
          },
        });
      } catch (e) {
        console.error("Async TL;DR generation failed:", e);
      }
    });
  }

  return NextResponse.json({ application }, { status: 201 });
}
