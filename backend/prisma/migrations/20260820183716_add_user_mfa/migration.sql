-- AlterTable
ALTER TABLE "user_preferences" ADD COLUMN     "totpEnabledAt" TIMESTAMP(3),
ADD COLUMN     "totpSecret" TEXT,
ADD COLUMN     "totpTempSecret" TEXT;
