-- CreateEnum
CREATE TYPE "DraftStatus" AS ENUM ('OPEN', 'COMPLETED');

-- CreateTable
CREATE TABLE "DraftOrder" (
    "id" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "storeId" TEXT NOT NULL,
    "status" "DraftStatus" NOT NULL DEFAULT 'OPEN',
    "customerName" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "note" TEXT,
    "deliveryFee" INTEGER NOT NULL DEFAULT 0,
    "orderId" TEXT,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DraftOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DraftOrderItem" (
    "id" TEXT NOT NULL,
    "draftId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "variantId" TEXT,
    "name" TEXT NOT NULL,
    "variantName" TEXT,
    "price" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "image" TEXT,

    CONSTRAINT "DraftOrderItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CheckoutSession" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "customerName" TEXT,
    "phone" TEXT NOT NULL,
    "phoneKey" TEXT NOT NULL,
    "address" TEXT,
    "items" JSONB NOT NULL,
    "subtotal" INTEGER NOT NULL,
    "wasAbandoned" BOOLEAN NOT NULL DEFAULT false,
    "recoveryOpenedAt" TIMESTAMP(3),
    "recovered" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" TIMESTAMP(3),
    "orderId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CheckoutSession_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DraftOrder_orderId_key" ON "DraftOrder"("orderId");

-- CreateIndex
CREATE INDEX "DraftOrder_storeId_status_idx" ON "DraftOrder"("storeId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "DraftOrder_storeId_number_key" ON "DraftOrder"("storeId", "number");

-- CreateIndex
CREATE INDEX "DraftOrderItem_draftId_idx" ON "DraftOrderItem"("draftId");

-- CreateIndex
CREATE UNIQUE INDEX "CheckoutSession_token_key" ON "CheckoutSession"("token");

-- CreateIndex
CREATE UNIQUE INDEX "CheckoutSession_orderId_key" ON "CheckoutSession"("orderId");

-- CreateIndex
CREATE INDEX "CheckoutSession_storeId_completedAt_updatedAt_idx" ON "CheckoutSession"("storeId", "completedAt", "updatedAt");

-- CreateIndex
CREATE INDEX "CheckoutSession_storeId_phoneKey_idx" ON "CheckoutSession"("storeId", "phoneKey");

-- AddForeignKey
ALTER TABLE "DraftOrder" ADD CONSTRAINT "DraftOrder_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DraftOrder" ADD CONSTRAINT "DraftOrder_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DraftOrderItem" ADD CONSTRAINT "DraftOrderItem_draftId_fkey" FOREIGN KEY ("draftId") REFERENCES "DraftOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CheckoutSession" ADD CONSTRAINT "CheckoutSession_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CheckoutSession" ADD CONSTRAINT "CheckoutSession_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;
