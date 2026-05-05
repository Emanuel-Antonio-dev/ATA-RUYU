-- AlterEnum
ALTER TYPE "GraduationStatus" ADD VALUE 'PENDING';

-- AlterTable
ALTER TABLE "tbl_graduations" ALTER COLUMN "status" SET DEFAULT 'PENDING';
