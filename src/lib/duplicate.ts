import prisma from "./db";

export type DuplicateMatch = {
  id: string;
  roleTitle: string;
  companyName: string;
  columnId: string;
  createdAt: Date;
};

/**
 * Duplicate detection per BUILD_SPEC §16:
 *   - case-insensitive contains on company
 *   - exact (case-insensitive) match on role title
 */
export async function findDuplicate(
  userId: string,
  roleTitle: string,
  companyName: string
): Promise<DuplicateMatch | null> {
  const match = await prisma.application.findFirst({
    where: {
      userId,
      deletedAt: null,
      companyName: { contains: companyName, mode: "insensitive" },
      roleTitle: { equals: roleTitle, mode: "insensitive" },
    },
    select: {
      id: true,
      roleTitle: true,
      companyName: true,
      columnId: true,
      createdAt: true,
    },
  });
  return match;
}
