/*
  Warnings:

  - A unique constraint covering the columns `[accountId]` on the table `tbl_academies` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `accountId` to the `tbl_academies` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "tbl_academies" ADD COLUMN     "accountId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "tbl_academies_accountId_key" ON "tbl_academies"("accountId");

-- AddForeignKey
ALTER TABLE "tbl_academies" ADD CONSTRAINT "tbl_academies_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "tbl_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
