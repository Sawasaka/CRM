DO $$ BEGIN
  CREATE TYPE "BillingSubscriptionStatus" AS ENUM (
    'INCOMPLETE',
    'INCOMPLETE_EXPIRED',
    'TRIALING',
    'ACTIVE',
    'PAST_DUE',
    'CANCELED',
    'UNPAID',
    'PAUSED'
  );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE "BillingInterval" AS ENUM ('MONTHLY', 'ANNUAL');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE "BillingPaymentKind" AS ENUM (
    'PLAN',
    'CREDIT_PURCHASE',
    'FEATURE_REQUEST',
    'MIGRATION',
    'SUPPORT_OPTION'
  );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE "BillingPaymentStatus" AS ENUM (
    'SUCCEEDED',
    'REFUNDED',
    'PARTIAL_REFUND',
    'PENDING',
    'FAILED'
  );
EXCEPTION WHEN duplicate_object THEN null; END $$;

CREATE TABLE IF NOT EXISTS "BillingAccount" (
  "id" TEXT NOT NULL,
  "orgId" TEXT NOT NULL,
  "stripeCustomerId" TEXT,
  "billingEmail" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "BillingAccount_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "BillingAccount_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "BillingSubscription" (
  "id" TEXT NOT NULL,
  "orgId" TEXT NOT NULL,
  "billingAccountId" TEXT NOT NULL,
  "stripeSubscriptionId" TEXT NOT NULL,
  "stripePriceId" TEXT NOT NULL,
  "stripeProductId" TEXT,
  "plan" "Plan" NOT NULL,
  "status" "BillingSubscriptionStatus" NOT NULL,
  "interval" "BillingInterval" NOT NULL,
  "seats" INTEGER NOT NULL DEFAULT 1,
  "currentPeriodStart" TIMESTAMP(3),
  "currentPeriodEnd" TIMESTAMP(3),
  "cancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false,
  "canceledAt" TIMESTAMP(3),
  "trialEnd" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "BillingSubscription_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "BillingSubscription_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "BillingSubscription_billingAccountId_fkey" FOREIGN KEY ("billingAccountId") REFERENCES "BillingAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "BillingPayment" (
  "id" TEXT NOT NULL,
  "orgId" TEXT NOT NULL,
  "billingAccountId" TEXT,
  "kind" "BillingPaymentKind" NOT NULL,
  "status" "BillingPaymentStatus" NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "amount" INTEGER NOT NULL,
  "refundedAmount" INTEGER NOT NULL DEFAULT 0,
  "currency" TEXT NOT NULL DEFAULT 'jpy',
  "paidAt" TIMESTAMP(3),
  "refundedAt" TIMESTAMP(3),
  "stripeInvoiceId" TEXT,
  "stripePaymentIntentId" TEXT,
  "stripeReceiptUrl" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "BillingPayment_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "BillingPayment_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "BillingPayment_billingAccountId_fkey" FOREIGN KEY ("billingAccountId") REFERENCES "BillingAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "BillingAccount_orgId_key" ON "BillingAccount"("orgId");
CREATE UNIQUE INDEX IF NOT EXISTS "BillingAccount_stripeCustomerId_key" ON "BillingAccount"("stripeCustomerId");
CREATE INDEX IF NOT EXISTS "BillingAccount_stripeCustomerId_idx" ON "BillingAccount"("stripeCustomerId");

CREATE UNIQUE INDEX IF NOT EXISTS "BillingSubscription_stripeSubscriptionId_key" ON "BillingSubscription"("stripeSubscriptionId");
CREATE INDEX IF NOT EXISTS "BillingSubscription_orgId_idx" ON "BillingSubscription"("orgId");
CREATE INDEX IF NOT EXISTS "BillingSubscription_billingAccountId_idx" ON "BillingSubscription"("billingAccountId");
CREATE INDEX IF NOT EXISTS "BillingSubscription_status_idx" ON "BillingSubscription"("status");

CREATE UNIQUE INDEX IF NOT EXISTS "BillingPayment_stripeInvoiceId_key" ON "BillingPayment"("stripeInvoiceId");
CREATE UNIQUE INDEX IF NOT EXISTS "BillingPayment_stripePaymentIntentId_key" ON "BillingPayment"("stripePaymentIntentId");
CREATE INDEX IF NOT EXISTS "BillingPayment_orgId_paidAt_idx" ON "BillingPayment"("orgId", "paidAt" DESC);
CREATE INDEX IF NOT EXISTS "BillingPayment_billingAccountId_idx" ON "BillingPayment"("billingAccountId");
CREATE INDEX IF NOT EXISTS "BillingPayment_kind_idx" ON "BillingPayment"("kind");
CREATE INDEX IF NOT EXISTS "BillingPayment_status_idx" ON "BillingPayment"("status");
