/*
  Warnings:

  - You are about to drop the `tbl_payments` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "tbl_payments" DROP CONSTRAINT "tbl_payments_athleteId_fkey";

-- DropTable
DROP TABLE "tbl_payments";

-- CreateTable
CREATE TABLE "tbl_athele_payments" (
    "id" TEXT NOT NULL,
    "athleteId" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "referenceMonth" TIMESTAMP(3) NOT NULL,
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tbl_athele_payments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "tbl_athele_payments_status_idx" ON "tbl_athele_payments"("status");

-- CreateIndex
CREATE INDEX "tbl_athele_payments_athleteId_referenceMonth_idx" ON "tbl_athele_payments"("athleteId", "referenceMonth");

-- AddForeignKey
ALTER TABLE "tbl_athele_payments" ADD CONSTRAINT "tbl_athele_payments_athleteId_fkey" FOREIGN KEY ("athleteId") REFERENCES "tbl_athletes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
