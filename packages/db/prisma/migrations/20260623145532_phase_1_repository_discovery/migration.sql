-- AlterTable
ALTER TABLE "Repository" ADD COLUMN     "githubUpdatedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Run" ADD COLUMN     "error" TEXT;

-- CreateIndex
CREATE INDEX "Finding_severity_idx" ON "Finding"("severity");

-- CreateIndex
CREATE INDEX "HealthScore_computedAt_idx" ON "HealthScore"("computedAt");

-- CreateIndex
CREATE INDEX "Repository_owner_idx" ON "Repository"("owner");

-- CreateIndex
CREATE INDEX "Repository_pushedAt_idx" ON "Repository"("pushedAt");

-- CreateIndex
CREATE INDEX "Repository_lastScannedAt_idx" ON "Repository"("lastScannedAt");

-- CreateIndex
CREATE INDEX "Run_type_idx" ON "Run"("type");

-- CreateIndex
CREATE INDEX "Run_status_idx" ON "Run"("status");

-- CreateIndex
CREATE INDEX "Run_startedAt_idx" ON "Run"("startedAt");
