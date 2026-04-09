-- CreateEnum
CREATE TYPE "EstimateStatus" AS ENUM ('QORALAMA', 'YUBORILGAN', 'TASDIQLANGAN', 'BEKOR');

-- CreateTable
CREATE TABLE "estimates" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "projectId" TEXT,
    "clientName" TEXT NOT NULL,
    "clientPhone" TEXT,
    "clientAddress" TEXT,
    "notes" TEXT,
    "status" "EstimateStatus" NOT NULL DEFAULT 'QORALAMA',
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "estimates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "estimate_items" (
    "id" TEXT NOT NULL,
    "estimateId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "quantity" DECIMAL(18,2) NOT NULL,
    "unit" TEXT NOT NULL,
    "unitPrice" DECIMAL(18,4) NOT NULL,
    "currency" "Currency" NOT NULL DEFAULT 'USD',
    "wattPerUnit" DECIMAL(18,2),
    "pricePerWatt" DECIMAL(18,4),
    "totalAmount" DECIMAL(18,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "estimate_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "estimate_payments" (
    "id" TEXT NOT NULL,
    "estimateId" TEXT NOT NULL,
    "amount" DECIMAL(18,2) NOT NULL,
    "currency" "Currency" NOT NULL DEFAULT 'UZS',
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "estimate_payments_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "estimates" ADD CONSTRAINT "estimates_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "estimates" ADD CONSTRAINT "estimates_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "estimate_items" ADD CONSTRAINT "estimate_items_estimateId_fkey" FOREIGN KEY ("estimateId") REFERENCES "estimates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "estimate_payments" ADD CONSTRAINT "estimate_payments_estimateId_fkey" FOREIGN KEY ("estimateId") REFERENCES "estimates"("id") ON DELETE CASCADE ON UPDATE CASCADE;
