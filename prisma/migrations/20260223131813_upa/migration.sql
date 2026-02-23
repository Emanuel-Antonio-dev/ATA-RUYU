-- DropForeignKey
ALTER TABLE "tbl_academies" DROP CONSTRAINT "tbl_academies_approvedById_fkey";

-- DropForeignKey
ALTER TABLE "tbl_athletes" DROP CONSTRAINT "tbl_athletes_academyId_fkey";

-- DropForeignKey
ALTER TABLE "tbl_attendances" DROP CONSTRAINT "tbl_attendances_athleteId_fkey";

-- DropForeignKey
ALTER TABLE "tbl_audit_logs" DROP CONSTRAINT "tbl_audit_logs_userId_fkey";

-- DropForeignKey
ALTER TABLE "tbl_championships" DROP CONSTRAINT "tbl_championships_academyId_fkey";

-- DropForeignKey
ALTER TABLE "tbl_download_keys" DROP CONSTRAINT "tbl_download_keys_academyId_fkey";

-- DropForeignKey
ALTER TABLE "tbl_graduation_reviews" DROP CONSTRAINT "tbl_graduation_reviews_graduationId_fkey";

-- DropForeignKey
ALTER TABLE "tbl_graduation_reviews" DROP CONSTRAINT "tbl_graduation_reviews_reviewedById_fkey";

-- DropForeignKey
ALTER TABLE "tbl_graduations" DROP CONSTRAINT "tbl_graduations_athleteId_fkey";

-- DropForeignKey
ALTER TABLE "tbl_payments" DROP CONSTRAINT "tbl_payments_athleteId_fkey";

-- DropForeignKey
ALTER TABLE "tbl_subscription_payments" DROP CONSTRAINT "tbl_subscription_payments_subscriptionId_fkey";

-- DropForeignKey
ALTER TABLE "tbl_subscriptions" DROP CONSTRAINT "tbl_subscriptions_academyId_fkey";

-- DropForeignKey
ALTER TABLE "tbl_users" DROP CONSTRAINT "tbl_users_academyId_fkey";

-- AddForeignKey
ALTER TABLE "tbl_academies" ADD CONSTRAINT "tbl_academies_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "tbl_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbl_users" ADD CONSTRAINT "tbl_users_academyId_fkey" FOREIGN KEY ("academyId") REFERENCES "tbl_academies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbl_subscriptions" ADD CONSTRAINT "tbl_subscriptions_academyId_fkey" FOREIGN KEY ("academyId") REFERENCES "tbl_academies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbl_subscription_payments" ADD CONSTRAINT "tbl_subscription_payments_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "tbl_subscriptions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbl_download_keys" ADD CONSTRAINT "tbl_download_keys_academyId_fkey" FOREIGN KEY ("academyId") REFERENCES "tbl_academies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbl_athletes" ADD CONSTRAINT "tbl_athletes_academyId_fkey" FOREIGN KEY ("academyId") REFERENCES "tbl_academies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbl_payments" ADD CONSTRAINT "tbl_payments_athleteId_fkey" FOREIGN KEY ("athleteId") REFERENCES "tbl_athletes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbl_attendances" ADD CONSTRAINT "tbl_attendances_athleteId_fkey" FOREIGN KEY ("athleteId") REFERENCES "tbl_athletes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbl_graduations" ADD CONSTRAINT "tbl_graduations_athleteId_fkey" FOREIGN KEY ("athleteId") REFERENCES "tbl_athletes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbl_graduation_reviews" ADD CONSTRAINT "tbl_graduation_reviews_graduationId_fkey" FOREIGN KEY ("graduationId") REFERENCES "tbl_graduations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbl_graduation_reviews" ADD CONSTRAINT "tbl_graduation_reviews_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "tbl_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbl_championships" ADD CONSTRAINT "tbl_championships_academyId_fkey" FOREIGN KEY ("academyId") REFERENCES "tbl_academies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbl_audit_logs" ADD CONSTRAINT "tbl_audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "tbl_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
