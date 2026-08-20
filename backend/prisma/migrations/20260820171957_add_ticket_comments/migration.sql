-- CreateEnum
CREATE TYPE "TicketCategory" AS ENUM ('TECHNICAL', 'BILLING', 'GENERAL', 'FEATURE_REQUEST', 'BUG');

-- AlterTable
ALTER TABLE "tickets" ADD COLUMN     "category" "TicketCategory" NOT NULL DEFAULT 'GENERAL';

-- CreateTable
CREATE TABLE "ticket_comments" (
    "id" TEXT NOT NULL,
    "ticketId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "isInternal" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "ticket_comments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ticket_comments_ticketId_idx" ON "ticket_comments"("ticketId");

-- CreateIndex
CREATE INDEX "ticket_comments_userId_idx" ON "ticket_comments"("userId");

-- CreateIndex
CREATE INDEX "ticket_comments_isInternal_idx" ON "ticket_comments"("isInternal");

-- CreateIndex
CREATE INDEX "ticket_comments_createdAt_idx" ON "ticket_comments"("createdAt");

-- CreateIndex
CREATE INDEX "ticket_comments_deletedAt_idx" ON "ticket_comments"("deletedAt");

-- CreateIndex
CREATE INDEX "tickets_category_idx" ON "tickets"("category");

-- AddForeignKey
ALTER TABLE "ticket_comments" ADD CONSTRAINT "ticket_comments_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "tickets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticket_comments" ADD CONSTRAINT "ticket_comments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
