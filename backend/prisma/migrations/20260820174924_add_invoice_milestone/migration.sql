-- AlterTable
ALTER TABLE "invoices" ADD COLUMN     "milestoneId" TEXT;

-- CreateIndex
CREATE INDEX "invoices_milestoneId_idx" ON "invoices"("milestoneId");

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_milestoneId_fkey" FOREIGN KEY ("milestoneId") REFERENCES "milestones"("id") ON DELETE SET NULL ON UPDATE CASCADE;
