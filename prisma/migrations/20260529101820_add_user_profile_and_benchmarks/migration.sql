-- CreateTable
CREATE TABLE "UserProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "jobRole" TEXT,
    "jobFamily" TEXT,
    "city" TEXT,
    "country" TEXT,
    "yearsExperience" INTEGER,
    "currentSalary" INTEGER,
    "salaryCurrency" TEXT DEFAULT 'USD',
    "photoUrl" TEXT,
    "bio" TEXT,
    "onboardingStep" INTEGER NOT NULL DEFAULT 0,
    "onboardingCompletedAt" TIMESTAMP(3),
    "onboardingSkippedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SalaryBenchmark" (
    "id" TEXT NOT NULL,
    "jobRole" TEXT NOT NULL,
    "city" TEXT,
    "country" TEXT NOT NULL,
    "experienceBracket" TEXT NOT NULL,
    "p25" INTEGER NOT NULL,
    "p50" INTEGER NOT NULL,
    "p75" INTEGER NOT NULL,
    "p90" INTEGER NOT NULL,
    "sampleSize" INTEGER NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'benchmark',
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SalaryBenchmark_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserProfile_userId_key" ON "UserProfile"("userId");

-- CreateIndex
CREATE INDEX "UserProfile_jobRole_city_idx" ON "UserProfile"("jobRole", "city");

-- CreateIndex
CREATE INDEX "UserProfile_country_idx" ON "UserProfile"("country");

-- CreateIndex
CREATE INDEX "SalaryBenchmark_jobRole_city_country_experienceBracket_idx" ON "SalaryBenchmark"("jobRole", "city", "country", "experienceBracket");

-- CreateIndex
CREATE UNIQUE INDEX "SalaryBenchmark_jobRole_city_country_experienceBracket_sourc_key" ON "SalaryBenchmark"("jobRole", "city", "country", "experienceBracket", "source");

-- AddForeignKey
ALTER TABLE "UserProfile" ADD CONSTRAINT "UserProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
