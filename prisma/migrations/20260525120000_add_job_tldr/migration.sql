-- AlterTable
ALTER TABLE "Application"
  ADD COLUMN "tldrHeadline" TEXT,
  ADD COLUMN "tldrBullets" JSONB;
