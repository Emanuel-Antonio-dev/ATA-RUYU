/*
  Warnings:

  - You are about to drop the column `academyId` on the `tbl_championships` table. All the data in the column will be lost.
  - Added the required column `athleteId` to the `tbl_championships` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "tbl_championships" DROP CONSTRAINT "tbl_championships_academyId_fkey";

-- DropIndex
DROP INDEX "tbl_championships_academyId_idx";

-- AlterTable
ALTER TABLE "tbl_championships" DROP COLUMN "academyId",
ADD COLUMN     "athleteId" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "tbl_championships_athleteId_idx" ON "tbl_championships"("athleteId");

-- AddForeignKey
ALTER TABLE "tbl_championships" ADD CONSTRAINT "tbl_championships_athleteId_fkey" FOREIGN KEY ("athleteId") REFERENCES "tbl_athletes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
