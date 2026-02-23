-- CreateEnum
CREATE TYPE "AcademyType" AS ENUM ('CENTRAL', 'AFFILIATE');

-- CreateEnum
CREATE TYPE "AcademyStatus" AS ENUM ('PENDING', 'ACTIVE', 'SUSPENDED', 'REJECTED');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('CENTRAL', 'ADMIN_DEV', 'AFFILIATE_ADMIN', 'MASTER', 'INSTRUCTOR', 'ATHLETE');

-- CreateEnum
CREATE TYPE "BeltColor" AS ENUM ('WHITE', 'GREY', 'YELLOW', 'ORANGE', 'GREEN', 'BLUE', 'PURPLE', 'BROWN', 'BLACK');

-- CreateEnum
CREATE TYPE "BeltDegree" AS ENUM ('NONE', 'FIRST', 'SECOND', 'THIRD', 'FOURTH');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PAID', 'OVERDUE', 'CANCELLED');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE', 'PAST_DUE', 'SUSPENDED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "SubscriptionPaymentStatus" AS ENUM ('PENDING', 'PAID', 'OVERDUE');

-- CreateEnum
CREATE TYPE "GraduationStatus" AS ENUM ('ELIGIBLE', 'NOT_ELIGIBLE', 'APPROVED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "DownloadKeyStatus" AS ENUM ('ACTIVE', 'USED', 'EXPIRED', 'REVOKED');

-- CreateEnum
CREATE TYPE "AuthenticationsTypes" AS ENUM ('by_token', 'by_two_factor');

-- CreateEnum
CREATE TYPE "TokenTypes" AS ENUM ('ACCESS', 'REFRESH', 'PASSWORD_RESET');

-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('BI', 'PASSPORT');

-- CreateTable
CREATE TABLE "tbl_academies" (
    "id" TEXT NOT NULL,
    "type" "AcademyType" NOT NULL,
    "status" "AcademyStatus" NOT NULL DEFAULT 'PENDING',
    "name" TEXT NOT NULL,
    "affiliateNumber" TEXT,
    "address" TEXT,
    "province" TEXT,
    "city" TEXT,
    "logoUrl" TEXT,
    "approvedById" TEXT,
    "approvedAt" TIMESTAMP(3),
    "rejectedReason" TEXT,
    "accountId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tbl_academies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tbl_accounts" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "passwordHash" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tbl_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tbl_users" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "academyId" TEXT,
    "role" "UserRole" NOT NULL,
    "fullName" TEXT NOT NULL,
    "photoUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tbl_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tbl_authentications" (
    "id" TEXT NOT NULL,
    "type" "AuthenticationsTypes" NOT NULL DEFAULT 'by_token',
    "expireIn" TIMESTAMP(3) NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "temp_email" TEXT,
    "temp_phone" TEXT,
    "accountId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tbl_authentications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tbl_tokens" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "tokenType" "TokenTypes" NOT NULL,
    "authenticationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tbl_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tbl_two_factor_auth" (
    "id" TEXT NOT NULL,
    "authenticationId" TEXT NOT NULL,
    "otpCodeHash" TEXT NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "maxAttempts" INTEGER NOT NULL DEFAULT 5,
    "locked" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tbl_two_factor_auth_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tbl_subscriptions" (
    "id" TEXT NOT NULL,
    "academyId" TEXT NOT NULL,
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'ACTIVE',
    "amount" DECIMAL(12,2) NOT NULL DEFAULT 35500,
    "currency" TEXT NOT NULL DEFAULT 'AOA',
    "currentPeriodStart" TIMESTAMP(3) NOT NULL,
    "currentPeriodEnd" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tbl_subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tbl_subscription_payments" (
    "id" TEXT NOT NULL,
    "subscriptionId" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'AOA',
    "status" "SubscriptionPaymentStatus" NOT NULL DEFAULT 'PENDING',
    "referenceMonth" TIMESTAMP(3) NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tbl_subscription_payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tbl_download_keys" (
    "id" TEXT NOT NULL,
    "academyId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "status" "DownloadKeyStatus" NOT NULL DEFAULT 'ACTIVE',
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "usedByIp" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tbl_download_keys_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tbl_athletes" (
    "id" TEXT NOT NULL,
    "academyId" TEXT NOT NULL,
    "affiliateCode" TEXT NOT NULL,
    "documentType" "DocumentType" NOT NULL DEFAULT 'BI',
    "documentNumber" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "birthDate" TIMESTAMP(3) NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "emergencyPhone" TEXT,
    "photoUrl" TEXT,
    "currentBelt" "BeltColor" NOT NULL DEFAULT 'WHITE',
    "currentDegree" "BeltDegree" NOT NULL DEFAULT 'NONE',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "enrolledAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tbl_athletes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tbl_payments" (
    "id" TEXT NOT NULL,
    "athleteId" TEXT NOT NULL,
    "academyId" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'AOA',
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "referenceMonth" TIMESTAMP(3) NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tbl_payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tbl_attendances" (
    "id" TEXT NOT NULL,
    "athleteId" TEXT NOT NULL,
    "academyId" TEXT NOT NULL,
    "classDate" DATE NOT NULL,
    "present" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tbl_attendances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tbl_graduations" (
    "id" TEXT NOT NULL,
    "athleteId" TEXT NOT NULL,
    "academyId" TEXT NOT NULL,
    "fromBelt" "BeltColor" NOT NULL,
    "fromDegree" "BeltDegree" NOT NULL,
    "toBelt" "BeltColor" NOT NULL,
    "toDegree" "BeltDegree" NOT NULL,
    "status" "GraduationStatus" NOT NULL DEFAULT 'NOT_ELIGIBLE',
    "totalClasses" INTEGER NOT NULL,
    "attendedClasses" INTEGER NOT NULL,
    "graduatedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tbl_graduations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tbl_graduation_reviews" (
    "id" TEXT NOT NULL,
    "graduationId" TEXT NOT NULL,
    "reviewedById" TEXT NOT NULL,
    "technicalScore" INTEGER,
    "behaviorScore" INTEGER,
    "comment" TEXT NOT NULL,
    "recommendation" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tbl_graduation_reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tbl_championships" (
    "id" TEXT NOT NULL,
    "academyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tbl_championships_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tbl_audit_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "academyId" TEXT,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" TEXT,
    "before" JSONB,
    "after" JSONB,
    "ipAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tbl_audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tbl_academies_affiliateNumber_key" ON "tbl_academies"("affiliateNumber");

-- CreateIndex
CREATE UNIQUE INDEX "tbl_academies_accountId_key" ON "tbl_academies"("accountId");

-- CreateIndex
CREATE UNIQUE INDEX "tbl_accounts_email_key" ON "tbl_accounts"("email");

-- CreateIndex
CREATE UNIQUE INDEX "tbl_accounts_phone_key" ON "tbl_accounts"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "tbl_users_accountId_key" ON "tbl_users"("accountId");

-- CreateIndex
CREATE INDEX "tbl_users_academyId_idx" ON "tbl_users"("academyId");

-- CreateIndex
CREATE INDEX "tbl_authentications_accountId_idx" ON "tbl_authentications"("accountId");

-- CreateIndex
CREATE INDEX "tbl_authentications_expireIn_idx" ON "tbl_authentications"("expireIn");

-- CreateIndex
CREATE INDEX "tbl_authentications_used_idx" ON "tbl_authentications"("used");

-- CreateIndex
CREATE INDEX "tbl_authentications_type_idx" ON "tbl_authentications"("type");

-- CreateIndex
CREATE UNIQUE INDEX "tbl_tokens_token_key" ON "tbl_tokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "tbl_tokens_authenticationId_key" ON "tbl_tokens"("authenticationId");

-- CreateIndex
CREATE INDEX "tbl_tokens_tokenType_idx" ON "tbl_tokens"("tokenType");

-- CreateIndex
CREATE INDEX "tbl_tokens_createdAt_idx" ON "tbl_tokens"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "tbl_two_factor_auth_authenticationId_key" ON "tbl_two_factor_auth"("authenticationId");

-- CreateIndex
CREATE UNIQUE INDEX "tbl_two_factor_auth_otpCodeHash_key" ON "tbl_two_factor_auth"("otpCodeHash");

-- CreateIndex
CREATE INDEX "tbl_two_factor_auth_locked_idx" ON "tbl_two_factor_auth"("locked");

-- CreateIndex
CREATE UNIQUE INDEX "tbl_subscriptions_academyId_key" ON "tbl_subscriptions"("academyId");

-- CreateIndex
CREATE INDEX "tbl_subscriptions_status_idx" ON "tbl_subscriptions"("status");

-- CreateIndex
CREATE INDEX "tbl_subscriptions_currentPeriodEnd_idx" ON "tbl_subscriptions"("currentPeriodEnd");

-- CreateIndex
CREATE INDEX "tbl_subscription_payments_subscriptionId_status_idx" ON "tbl_subscription_payments"("subscriptionId", "status");

-- CreateIndex
CREATE INDEX "tbl_subscription_payments_dueDate_idx" ON "tbl_subscription_payments"("dueDate");

-- CreateIndex
CREATE UNIQUE INDEX "tbl_download_keys_key_key" ON "tbl_download_keys"("key");

-- CreateIndex
CREATE INDEX "tbl_download_keys_academyId_idx" ON "tbl_download_keys"("academyId");

-- CreateIndex
CREATE INDEX "tbl_download_keys_status_idx" ON "tbl_download_keys"("status");

-- CreateIndex
CREATE UNIQUE INDEX "tbl_athletes_affiliateCode_key" ON "tbl_athletes"("affiliateCode");

-- CreateIndex
CREATE INDEX "tbl_athletes_academyId_idx" ON "tbl_athletes"("academyId");

-- CreateIndex
CREATE INDEX "tbl_athletes_affiliateCode_idx" ON "tbl_athletes"("affiliateCode");

-- CreateIndex
CREATE INDEX "tbl_payments_academyId_status_idx" ON "tbl_payments"("academyId", "status");

-- CreateIndex
CREATE INDEX "tbl_payments_athleteId_referenceMonth_idx" ON "tbl_payments"("athleteId", "referenceMonth");

-- CreateIndex
CREATE INDEX "tbl_attendances_academyId_classDate_idx" ON "tbl_attendances"("academyId", "classDate");

-- CreateIndex
CREATE UNIQUE INDEX "tbl_attendances_athleteId_classDate_key" ON "tbl_attendances"("athleteId", "classDate");

-- CreateIndex
CREATE INDEX "tbl_graduations_academyId_idx" ON "tbl_graduations"("academyId");

-- CreateIndex
CREATE INDEX "tbl_graduations_athleteId_idx" ON "tbl_graduations"("athleteId");

-- CreateIndex
CREATE INDEX "tbl_graduation_reviews_graduationId_idx" ON "tbl_graduation_reviews"("graduationId");

-- CreateIndex
CREATE INDEX "tbl_championships_academyId_idx" ON "tbl_championships"("academyId");

-- CreateIndex
CREATE INDEX "tbl_audit_logs_academyId_createdAt_idx" ON "tbl_audit_logs"("academyId", "createdAt");

-- CreateIndex
CREATE INDEX "tbl_audit_logs_entity_entityId_idx" ON "tbl_audit_logs"("entity", "entityId");

-- AddForeignKey
ALTER TABLE "tbl_academies" ADD CONSTRAINT "tbl_academies_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "tbl_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbl_academies" ADD CONSTRAINT "tbl_academies_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "tbl_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbl_users" ADD CONSTRAINT "tbl_users_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "tbl_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbl_users" ADD CONSTRAINT "tbl_users_academyId_fkey" FOREIGN KEY ("academyId") REFERENCES "tbl_academies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbl_authentications" ADD CONSTRAINT "tbl_authentications_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "tbl_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbl_tokens" ADD CONSTRAINT "tbl_tokens_authenticationId_fkey" FOREIGN KEY ("authenticationId") REFERENCES "tbl_authentications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbl_two_factor_auth" ADD CONSTRAINT "tbl_two_factor_auth_authenticationId_fkey" FOREIGN KEY ("authenticationId") REFERENCES "tbl_authentications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

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
