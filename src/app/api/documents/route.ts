import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { requireUserId } from "@/lib/api";

export async function GET(req: NextRequest) {
  const auth = await requireUserId();
  if (!auth.ok) return auth.response;

  const url = new URL(req.url);
  const type = url.searchParams.get("type");

  const documents = await prisma.document.findMany({
    where: {
      userId: auth.userId,
      ...(type ? { type: type as any } : {}),
    },
    orderBy: { createdAt: "desc" },
    include: {
      resumeApplications: {
        select: { id: true, companyName: true, roleTitle: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
      },
      coverLetterApplications: {
        select: { id: true, companyName: true, roleTitle: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
      },
      _count: {
        select: {
          resumeApplications: true,
          coverLetterApplications: true,
        },
      },
    },
  });

  return NextResponse.json({ documents });
}
