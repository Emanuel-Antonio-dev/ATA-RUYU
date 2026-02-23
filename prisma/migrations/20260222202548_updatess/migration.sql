/*
  Warnings:

  - You are about to drop the column `email` on the `tbl_academies` table. All the data in the column will be lost.
  - You are about to drop the column `phone` on the `tbl_academies` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "tbl_academies_email_key";

-- AlterTable
ALTER TABLE "tbl_academies" DROP COLUMN "email",
DROP COLUMN "phone";
