-- CreateEnum
CREATE TYPE "MilestoneReviewStatus" AS ENUM ('NOT_SUBMITTED', 'SUBMITTED', 'APPROVED', 'REVISION_REQUESTED');

-- AlterTable
ALTER TABLE "milestones" ADD COLUMN     "approvedAt" TIMESTAMP(3),
ADD COLUMN     "approvedById" TEXT,
ADD COLUMN     "reviewStatus" "MilestoneReviewStatus" NOT NULL DEFAULT 'NOT_SUBMITTED',
ADD COLUMN     "revisionNotes" TEXT,
ADD COLUMN     "submittedById" TEXT,
ADD COLUMN     "submittedForReviewAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "milestones_reviewStatus_idx" ON "milestones"("reviewStatus");

-- AddForeignKey
ALTER TABLE "milestones" ADD CONSTRAINT "milestones_submittedById_fkey" FOREIGN KEY ("submittedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "milestones" ADD CONSTRAINT "milestones_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
