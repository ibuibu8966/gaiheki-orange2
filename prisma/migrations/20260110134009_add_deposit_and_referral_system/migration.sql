-- CreateEnum for deposit transaction types
CREATE TYPE "DepositTransactionType" AS ENUM ('DEPOSIT', 'DEDUCTION');

-- CreateEnum for deposit request status
CREATE TYPE "DepositRequestStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterEnum: Add new construction types
ALTER TYPE "ConstructionType" ADD VALUE 'SCAFFOLDING_WORK';
ALTER TYPE "ConstructionType" ADD VALUE 'LARGE_SCALE_WORK';
ALTER TYPE "ConstructionType" ADD VALUE 'INTERIOR_WORK';
ALTER TYPE "ConstructionType" ADD VALUE 'EXTERIOR_WORK';
ALTER TYPE "ConstructionType" ADD VALUE 'OTHER';

-- AlterTable: Add deposit and leads fields to partners table
ALTER TABLE "partners" ADD COLUMN "deposit_balance" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "partners" ADD COLUMN "monthly_desired_leads" INTEGER;
ALTER TABLE "partners" ADD COLUMN "monthly_leads_count" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "partners" ADD COLUMN "last_leads_reset" TIMESTAMP(3);

-- AlterTable: Add hearing and referral fields to diagnosis_requests table
ALTER TABLE "diagnosis_requests" ADD COLUMN "customer_enthusiasm" SMALLINT;
ALTER TABLE "diagnosis_requests" ADD COLUMN "desired_partner_count" INTEGER DEFAULT 3;
ALTER TABLE "diagnosis_requests" ADD COLUMN "referral_fee" INTEGER NOT NULL DEFAULT 30000;
ALTER TABLE "diagnosis_requests" ADD COLUMN "admin_note" TEXT;
ALTER TABLE "diagnosis_requests" ADD COLUMN "customer_address" VARCHAR(500);
ALTER TABLE "diagnosis_requests" ADD COLUMN "customer_phone_verified" VARCHAR(20);

-- CreateTable: DepositHistory
CREATE TABLE "deposit_history" (
    "id" TEXT NOT NULL,
    "partner_id" INTEGER NOT NULL,
    "amount" INTEGER NOT NULL,
    "type" "DepositTransactionType" NOT NULL,
    "balance" INTEGER NOT NULL,
    "description" TEXT,
    "diagnosis_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "deposit_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable: DepositRequest
CREATE TABLE "deposit_requests" (
    "id" TEXT NOT NULL,
    "partner_id" INTEGER NOT NULL,
    "requested_amount" INTEGER NOT NULL,
    "approved_amount" INTEGER,
    "status" "DepositRequestStatus" NOT NULL DEFAULT 'PENDING',
    "partner_note" TEXT,
    "admin_note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approved_at" TIMESTAMP(3),
    "approved_by" INTEGER,

    CONSTRAINT "deposit_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable: Referral
CREATE TABLE "referrals" (
    "id" TEXT NOT NULL,
    "diagnosis_id" INTEGER NOT NULL,
    "partner_id" INTEGER NOT NULL,
    "referral_fee" INTEGER NOT NULL,
    "email_sent" BOOLEAN NOT NULL DEFAULT false,
    "email_sent_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "referrals_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "deposit_history_partner_id_idx" ON "deposit_history"("partner_id");
CREATE INDEX "deposit_history_diagnosis_id_idx" ON "deposit_history"("diagnosis_id");

CREATE INDEX "deposit_requests_partner_id_idx" ON "deposit_requests"("partner_id");
CREATE INDEX "deposit_requests_status_idx" ON "deposit_requests"("status");

CREATE INDEX "referrals_diagnosis_id_idx" ON "referrals"("diagnosis_id");
CREATE INDEX "referrals_partner_id_idx" ON "referrals"("partner_id");
CREATE UNIQUE INDEX "referrals_diagnosis_id_partner_id_key" ON "referrals"("diagnosis_id", "partner_id");

-- AddForeignKey
ALTER TABLE "deposit_history" ADD CONSTRAINT "deposit_history_partner_id_fkey" FOREIGN KEY ("partner_id") REFERENCES "partners"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "deposit_history" ADD CONSTRAINT "deposit_history_diagnosis_id_fkey" FOREIGN KEY ("diagnosis_id") REFERENCES "diagnosis_requests"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "deposit_requests" ADD CONSTRAINT "deposit_requests_partner_id_fkey" FOREIGN KEY ("partner_id") REFERENCES "partners"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "deposit_requests" ADD CONSTRAINT "deposit_requests_approved_by_fkey" FOREIGN KEY ("approved_by") REFERENCES "admins"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "referrals" ADD CONSTRAINT "referrals_diagnosis_id_fkey" FOREIGN KEY ("diagnosis_id") REFERENCES "diagnosis_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "referrals" ADD CONSTRAINT "referrals_partner_id_fkey" FOREIGN KEY ("partner_id") REFERENCES "partners"("id") ON DELETE CASCADE ON UPDATE CASCADE;
