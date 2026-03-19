/*
  Warnings:

  - The values [ELIGIBLE,NOT_ELIGIBLE,COMPLETED] on the enum `GraduationStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "GraduationStatus_new" AS ENUM ('NOT_APPROVED', 'APPROVED');
ALTER TABLE "public"."tbl_graduations" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "tbl_graduations" ALTER COLUMN "status" TYPE "GraduationStatus_new" USING ("status"::text::"GraduationStatus_new");
ALTER TYPE "GraduationStatus" RENAME TO "GraduationStatus_old";
ALTER TYPE "GraduationStatus_new" RENAME TO "GraduationStatus";
DROP TYPE "public"."GraduationStatus_old";
ALTER TABLE "tbl_graduations" ALTER COLUMN "status" SET DEFAULT 'NOT_APPROVED';
COMMIT;

-- AlterTable
ALTER TABLE "tbl_graduations" ALTER COLUMN "status" SET DEFAULT 'NOT_APPROVED';
