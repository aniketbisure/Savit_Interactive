-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "Audit" (
    "id" TEXT NOT NULL,
    "primaryUrl" TEXT NOT NULL,
    "competitorUrl1" TEXT,
    "competitorUrl2" TEXT,
    "industry" TEXT,
    "targetAudience" TEXT,
    "serviceProduct" TEXT,
    "auditObjective" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "errorMessage" TEXT,
    "overallScore" INTEGER,
    "seoScore" INTEGER,
    "uxScore" INTEGER,
    "extractedData" JSONB,
    "seoFindings" JSONB,
    "uxFindings" JSONB,
    "competitorData" JSONB,
    "aiReport" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Audit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Audit_createdAt_idx" ON "Audit"("createdAt");

-- CreateIndex
CREATE INDEX "Audit_primaryUrl_idx" ON "Audit"("primaryUrl");

-- CreateIndex
CREATE INDEX "Audit_status_idx" ON "Audit"("status");
