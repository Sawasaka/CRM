ALTER TABLE "BillingPayment"
  ADD COLUMN IF NOT EXISTS "credits" INTEGER;

ALTER TABLE "BillingPayment"
  ADD COLUMN IF NOT EXISTS "stripeCheckoutSessionId" TEXT;

CREATE INDEX IF NOT EXISTS "BillingPayment_orgId_kind_status_idx"
  ON "BillingPayment"("orgId", "kind", "status");

CREATE UNIQUE INDEX IF NOT EXISTS "BillingPayment_stripeCheckoutSessionId_key"
  ON "BillingPayment"("stripeCheckoutSessionId");
