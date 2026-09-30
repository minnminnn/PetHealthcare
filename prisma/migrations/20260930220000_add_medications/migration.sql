-- CreateTable
CREATE TABLE "medications" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "tier" TEXT NOT NULL,
    "primaryUseCase" TEXT NOT NULL,
    "estimatedPriceVND" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "medications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "medications_name_type_key" ON "medications"("name", "type");

-- CreateIndex
CREATE INDEX "medications_type_idx" ON "medications"("type");

-- CreateIndex
CREATE INDEX "medications_tier_idx" ON "medications"("tier");
