CREATE TABLE "collaborator_reports" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "htmlContent" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "collaborator_reports_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "collaborator_reports_type_createdAt_idx" ON "collaborator_reports"("type", "createdAt");
