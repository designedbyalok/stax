import prisma from "./db";

const DEFAULT_COLUMNS = [
  { name: "Saved", color: "#94A3B8", isArchive: false, isInterviewStage: false },
  { name: "Applied", color: "#6366F1", isArchive: false, isInterviewStage: false },
  { name: "Phone Screen", color: "#F59E0B", isArchive: false, isInterviewStage: true },
  { name: "Interview", color: "#8B5CF6", isArchive: false, isInterviewStage: true },
  { name: "Offer", color: "#22C55E", isArchive: false, isInterviewStage: false },
  { name: "Rejected", color: "#EF4444", isArchive: false, isInterviewStage: false },
  { name: "Archived", color: "#64748B", isArchive: true, isInterviewStage: false },
];

export async function seedDefaultsForUser(userId: string) {
  // Belt-and-suspenders: confirm the user actually exists before we try to
  // create rows that reference it. The caller (app layout) already checks
  // this, but we want this helper safe to call from anywhere.
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true },
  });
  if (!user) return;

  const existing = await prisma.column.count({ where: { userId } });
  if (existing > 0) return;

  await prisma.$transaction([
    prisma.column.createMany({
      data: DEFAULT_COLUMNS.map((c, i) => ({ ...c, userId, position: i })),
    }),
    prisma.userSettings.upsert({
      where: { userId },
      update: {},
      create: { userId },
    }),
  ]);
}
