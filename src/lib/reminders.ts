import prisma from "./db";

const APPLIED_STALE_DAYS = 7;
const INTERVIEW_STALE_DAYS = 5;

/**
 * Idempotent scan: creates Reminder rows for stale cards and overdue next-actions
 * for the given user. Won't create a duplicate reminder if one is already pending
 * or snoozed for the same application + type.
 */
export async function detectRemindersForUser(userId: string): Promise<{
  created: number;
}> {
  const now = new Date();

  const settings = await prisma.userSettings.findUnique({
    where: { userId },
    select: { staleDaysApplied: true, staleDaysInterview: true },
  });
  const staleDaysApplied = settings?.staleDaysApplied ?? APPLIED_STALE_DAYS;
  const staleDaysInterview = settings?.staleDaysInterview ?? INTERVIEW_STALE_DAYS;

  const appliedCutoff = new Date(now.getTime() - staleDaysApplied * 86_400_000);
  const interviewCutoff = new Date(now.getTime() - staleDaysInterview * 86_400_000);

  const columns = await prisma.column.findMany({
    where: { userId, isArchive: false },
    select: { id: true, name: true },
  });

  const appliedColumn = columns.find((c) => c.name.toLowerCase() === "applied");
  const phoneScreenColumn = columns.find(
    (c) => c.name.toLowerCase() === "phone screen"
  );
  const interviewColumn = columns.find((c) => c.name.toLowerCase() === "interview");

  let created = 0;

  // Stale "Applied" cards
  if (appliedColumn) {
    const stale = await prisma.application.findMany({
      where: {
        userId,
        deletedAt: null,
        columnId: appliedColumn.id,
        updatedAt: { lt: appliedCutoff },
      },
      select: { id: true, roleTitle: true, companyName: true },
    });
    created += await createIfMissing(userId, stale, "AUTO_FOLLOWUP", now);
  }

  // Stale Phone Screen / Interview cards
  const interviewColumnIds = [
    phoneScreenColumn?.id,
    interviewColumn?.id,
  ].filter(Boolean) as string[];

  if (interviewColumnIds.length > 0) {
    const stale = await prisma.application.findMany({
      where: {
        userId,
        deletedAt: null,
        columnId: { in: interviewColumnIds },
        updatedAt: { lt: interviewCutoff },
      },
      select: { id: true, roleTitle: true, companyName: true },
    });
    created += await createIfMissing(userId, stale, "AUTO_FOLLOWUP", now);
  }

  // Due / overdue next-actions
  const dueActions = await prisma.application.findMany({
    where: {
      userId,
      deletedAt: null,
      nextActionDate: { lte: now },
    },
    select: { id: true, roleTitle: true, companyName: true, nextActionDate: true },
  });
  created += await createIfMissing(
    userId,
    dueActions.map((a) => ({
      id: a.id,
      roleTitle: a.roleTitle,
      companyName: a.companyName,
      dueAt: a.nextActionDate ?? now,
    })),
    "NEXT_ACTION_DUE",
    now
  );

  return { created };
}

async function createIfMissing(
  userId: string,
  applications: { id: string; roleTitle: string; companyName: string; dueAt?: Date }[],
  type: "AUTO_FOLLOWUP" | "NEXT_ACTION_DUE",
  now: Date
): Promise<number> {
  if (applications.length === 0) return 0;

  const existing = await prisma.reminder.findMany({
    where: {
      userId,
      applicationId: { in: applications.map((a) => a.id) },
      type,
      status: { in: ["PENDING", "SNOOZED"] },
    },
    select: { applicationId: true, snoozedUntil: true, status: true },
  });

  const blocked = new Set<string>();
  for (const r of existing) {
    if (
      r.status === "PENDING" ||
      (r.status === "SNOOZED" && r.snoozedUntil && r.snoozedUntil > now)
    ) {
      blocked.add(r.applicationId);
    }
  }

  const toCreate = applications.filter((a) => !blocked.has(a.id));
  if (toCreate.length === 0) return 0;

  await prisma.reminder.createMany({
    data: toCreate.map((a) => ({
      userId,
      applicationId: a.id,
      type,
      status: "PENDING" as const,
      dueAt: a.dueAt ?? now,
    })),
  });

  return toCreate.length;
}
