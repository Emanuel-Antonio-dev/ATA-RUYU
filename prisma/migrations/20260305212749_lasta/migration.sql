/*
  Warnings:

  - You are about to drop the column `graduationId` on the `tbl_graduation_reviews` table. All the data in the column will be lost.
  - You are about to drop the column `reviewedById` on the `tbl_graduation_reviews` table. All the data in the column will be lost.
  - Added the required column `athleteId` to the `tbl_graduation_reviews` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "tbl_graduation_reviews" DROP CONSTRAINT "tbl_graduation_reviews_graduationId_fkey";

-- DropForeignKey
ALTER TABLE "tbl_graduation_reviews" DROP CONSTRAINT "tbl_graduation_reviews_reviewedById_fkey";

-- DropIndex
DROP INDEX "tbl_graduation_reviews_graduationId_idx";

-- AlterTable
ALTER TABLE "tbl_graduation_reviews" DROP COLUMN "graduationId",
DROP COLUMN "reviewedById",
ADD COLUMN     "athleteId" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "tbl_graduation_reviews_athleteId_idx" ON "tbl_graduation_reviews"("athleteId");

-- AddForeignKey
ALTER TABLE "tbl_graduation_reviews" ADD CONSTRAINT "tbl_graduation_reviews_athleteId_fkey" FOREIGN KEY ("athleteId") REFERENCES "tbl_athletes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
