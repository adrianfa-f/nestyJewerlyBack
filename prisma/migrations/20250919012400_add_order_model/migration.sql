/*
  Warnings:

  - You are about to drop the column `amount` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `currency` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `errorMessage` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `metadata` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `orderId` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `paidAt` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `paymentId` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `refundedAt` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Order` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[orderNumber]` on the table `Order` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `customerAddress` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `customerCity` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `customerEmail` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `customerName` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `customerPhone` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `customerPostalCode` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `items` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `orderNumber` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `total` to the `Order` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."Order" DROP CONSTRAINT "Order_userId_fkey";

-- DropIndex
DROP INDEX "public"."Order_createdAt_idx";

-- DropIndex
DROP INDEX "public"."Order_orderId_idx";

-- DropIndex
DROP INDEX "public"."Order_orderId_key";

-- DropIndex
DROP INDEX "public"."Order_status_idx";

-- DropIndex
DROP INDEX "public"."Order_userId_idx";

-- AlterTable
ALTER TABLE "public"."Order" DROP COLUMN "amount",
DROP COLUMN "currency",
DROP COLUMN "errorMessage",
DROP COLUMN "metadata",
DROP COLUMN "orderId",
DROP COLUMN "paidAt",
DROP COLUMN "paymentId",
DROP COLUMN "refundedAt",
DROP COLUMN "userId",
ADD COLUMN     "customerAddress" TEXT NOT NULL,
ADD COLUMN     "customerCity" TEXT NOT NULL,
ADD COLUMN     "customerEmail" TEXT NOT NULL,
ADD COLUMN     "customerName" TEXT NOT NULL,
ADD COLUMN     "customerPhone" TEXT NOT NULL,
ADD COLUMN     "customerPostalCode" TEXT NOT NULL,
ADD COLUMN     "items" JSONB NOT NULL,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "orderNumber" TEXT NOT NULL,
ADD COLUMN     "total" DOUBLE PRECISION NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Order_orderNumber_key" ON "public"."Order"("orderNumber");
