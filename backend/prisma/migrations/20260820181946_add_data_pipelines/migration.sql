-- CreateEnum
CREATE TYPE "PipelineStatus" AS ENUM ('ACTIVE', 'SYNCING', 'STOPPED', 'COMPLETED', 'FAILED');

-- CreateTable
CREATE TABLE "data_pipelines" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "status" "PipelineStatus" NOT NULL DEFAULT 'ACTIVE',
    "source" TEXT NOT NULL DEFAULT 'Kafka Ingestion Engine',
    "target" TEXT NOT NULL DEFAULT 'Snowflake Core DW',
    "volume" TEXT NOT NULL DEFAULT '1.2M req/hr',
    "progress" INTEGER NOT NULL DEFAULT 0,
    "lastRunAt" TIMESTAMP(3),
    "nextRunAt" TIMESTAMP(3),
    "errorMessage" TEXT,
    "clientId" TEXT,
    "projectId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "data_pipelines_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "data_pipelines_clientId_idx" ON "data_pipelines"("clientId");

-- CreateIndex
CREATE INDEX "data_pipelines_projectId_idx" ON "data_pipelines"("projectId");

-- CreateIndex
CREATE INDEX "data_pipelines_status_idx" ON "data_pipelines"("status");

-- CreateIndex
CREATE INDEX "data_pipelines_deletedAt_idx" ON "data_pipelines"("deletedAt");

-- AddForeignKey
ALTER TABLE "data_pipelines" ADD CONSTRAINT "data_pipelines_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "data_pipelines" ADD CONSTRAINT "data_pipelines_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;
