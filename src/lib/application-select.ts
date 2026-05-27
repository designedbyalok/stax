// Shared Prisma `select` for the board + list payloads. Lists only
// the light fields those views render, so the heavy text/JSON
// columns (jobDescription ~50KB, tldrBullets / responsibilities /
// qualifications / keywords / matchDetails / notes) never ship in
// the list payload — they're fetched on demand via the per-
// application detail endpoint when a card is opened.
//
// Used by both /api/applications GET and src/lib/loaders.ts so the
// client payload and the SSR-prefetched cache have an identical shape.
export const APPLICATION_LIST_SELECT = {
  id: true,
  userId: true,
  columnId: true,
  position: true,
  roleTitle: true,
  companyName: true,
  companyLogoUrl: true,
  logoColor: true,
  location: true,
  salaryRange: true,
  jobType: true,
  originalUrl: true,
  sourcePlatform: true,
  tldrHeadline: true,
  matchScore: true,
  resumeId: true,
  coverLetterId: true,
  nextAction: true,
  nextActionDate: true,
  appliedAt: true,
  archivedAt: true,
  deletedAt: true,
  createdAt: true,
  updatedAt: true,
} as const;
