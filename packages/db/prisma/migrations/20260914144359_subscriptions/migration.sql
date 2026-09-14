-- CreateEnum
CREATE TYPE "PlanPaymentMethod" AS ENUM ('CASH', 'CARD', 'TRANSFER', 'OTHER');

-- AlterTable
ALTER TABLE "Store" ADD COLUMN     "isTrial" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "planExpiresAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "PlanPayment" (
    "id" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "plan" "StorePlan" NOT NULL,
    "amount" INTEGER NOT NULL,
    "method" "PlanPaymentMethod" NOT NULL DEFAULT 'TRANSFER',
    "months" INTEGER NOT NULL DEFAULT 1,
    "paidAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "note" TEXT,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PlanPayment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PlanPayment_storeId_paidAt_idx" ON "PlanPayment"("storeId", "paidAt");

-- CreateIndex
CREATE INDEX "PlanPayment_paidAt_idx" ON "PlanPayment"("paidAt");

-- AddForeignKey
ALTER TABLE "PlanPayment" ADD CONSTRAINT "PlanPayment_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlanPayment" ADD CONSTRAINT "PlanPayment_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
