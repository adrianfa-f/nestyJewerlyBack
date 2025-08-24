-- AlterTable
ALTER TABLE "public"."User" ALTER COLUMN "role" SET DEFAULT 'customer';

-- CreateTable
CREATE TABLE "public"."Order" (
    "id" SERIAL NOT NULL,
    "orderId" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "status" TEXT NOT NULL DEFAULT 'pending',
    "paymentId" TEXT,
    "errorMessage" TEXT,
    "metadata" JSONB,
    "paidAt" TIMESTAMP(3),
    "refundedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Order_orderId_key" ON "public"."Order"("orderId");

-- CreateIndex
CREATE INDEX "Order_userId_idx" ON "public"."Order"("userId");

-- CreateIndex
CREATE INDEX "Order_orderId_idx" ON "public"."Order"("orderId");

-- CreateIndex
CREATE INDEX "Order_status_idx" ON "public"."Order"("status");

-- CreateIndex
CREATE INDEX "Order_createdAt_idx" ON "public"."Order"("createdAt");

-- AddForeignKey
ALTER TABLE "public"."Order" ADD CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
