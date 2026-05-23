import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { requireUserId } from "@/lib/api";

export async function GET() {
  const authResult = await requireUserId();
  if (!authResult.ok) return authResult.response;
  const userId = authResult.userId;

  const now = new Date();
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
  const oneWeekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  // Load the user's columns to do name-based grouping (column names are user-renameable).
  const columns = await prisma.column.findMany({
    where: { userId },
    select: { id: true, name: true, isArchive: true },
  });

  const findColumn = (name: string) =>
    columns.find(
      (c) => c.name.toLowerCase() === name.toLowerCase() && !c.isArchive
    );

  const appliedColumn = findColumn("Applied");
  const phoneScreenColumn = findColumn("Phone Screen");
  const interviewColumn = findColumn("Interview");
  const rejectedColumn = findColumn("Rejected");

  const excludedColumnIds = [
    rejectedColumn?.id,
    ...columns.filter((c) => c.isArchive).map((c) => c.id),
  ].filter(Boolean) as string[];

  const [totalActive, appliedThisWeek, awaitingResponse, upcomingInterviews] =
    await Promise.all([
      // Total active: everything except Rejected/Archived, not soft-deleted.
      prisma.application.count({
        where: {
          userId,
          deletedAt: null,
          columnId: { notIn: excludedColumnIds },
        },
      }),
      // Applied this week: card moved into the "Applied" column in last 7 days
      // (we approximate via appliedAt which is auto-stamped on move).
      appliedColumn
        ? prisma.application.count({
            where: {
              userId,
              deletedAt: null,
              appliedAt: { gte: oneWeekAgo },
            },
          })
        : 0,
      // Awaiting response: in Applied for 3+ days.
      appliedColumn
        ? prisma.application.count({
            where: {
              userId,
              deletedAt: null,
              columnId: appliedColumn.id,
              OR: [
                { appliedAt: { lt: threeDaysAgo } },
                { appliedAt: null, updatedAt: { lt: threeDaysAgo } },
              ],
            },
          })
        : 0,
      // Upcoming interviews: in Phone Screen/Interview with a next-action in the next 7 days.
      prisma.application.count({
        where: {
          userId,
          deletedAt: null,
          columnId: {
            in: [phoneScreenColumn?.id, interviewColumn?.id].filter(Boolean) as string[],
          },
          nextActionDate: { gte: now, lte: oneWeekFromNow },
        },
      }),
    ]);

  return NextResponse.json({
    totalActive,
    appliedThisWeek,
    awaitingResponse,
    upcomingInterviews,
  });
}
