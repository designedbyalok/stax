import prisma from "./db";

const DEFAULT_COLUMNS = [
  { name: "Saved", color: "#94A3B8", isArchive: false },
  { name: "Applied", color: "#6366F1", isArchive: false },
  { name: "Phone Screen", color: "#F59E0B", isArchive: false },
  { name: "Interview", color: "#8B5CF6", isArchive: false },
  { name: "Offer", color: "#22C55E", isArchive: false },
  { name: "Rejected", color: "#EF4444", isArchive: false },
  { name: "Archived", color: "#64748B", isArchive: true },
];

export async function seedDefaultsForUser(userId: string) {
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
