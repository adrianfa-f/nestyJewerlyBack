-- AlterTable
ALTER TABLE "public"."Product" ADD COLUMN     "hoverImage" TEXT,
ADD COLUMN     "mainImage" TEXT,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'active';
