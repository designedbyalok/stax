import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { requireUserId } from "@/lib/api";

function escapeCsv(value: string | null | undefined): string {
  if (value == null) return "";
  const str = String(value);
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

const CSV_HEADERS = [
  "Company",
  "Role",
  "Status",
  "Location",
  "Salary",
  "Source",
  "URL",
  "Applied At",
  "Next Action",
  "Next Action Date",
  "Notes",
  "Created At",
];

export async function GET() {
  const authResult = await requireUserId();
  if (!authResult.ok) return authResult.response;

  const apps = await prisma.application.findMany({
    where: { userId: authResult.userId, deletedAt: null },
    include: { column: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });

  const rows = apps.map((a) =>
    [
      a.companyName,
      a.roleTitle,
      a.column.name,
      a.location,
      a.salaryRange,
      a.sourcePlatform,
      a.originalUrl,
      a.appliedAt?.toISOString().slice(0, 10),
      a.nextAction,
      a.nextActionDate?.toISOString().slice(0, 10),
      a.notes,
      a.createdAt.toISOString().slice(0, 10),
    ]
      .map(escapeCsv)
      .join(",")
  );

  const body = [CSV_HEADERS.map(escapeCsv).join(","), ...rows].join("\n");
  const filename = `stax-export-${new Date().toISOString().slice(0, 10)}.csv`;

  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
