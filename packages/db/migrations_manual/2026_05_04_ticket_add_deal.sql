-- ============================================================
-- Ticket に dealId カラムを追加 (取引(Deal)に紐づける)
-- 作成日: 2026-05-04
-- 既存の Ticket レコードは影響を受けない (dealId は NULL のまま)
-- ============================================================

ALTER TABLE "Ticket"
  ADD COLUMN "dealId" text;

ALTER TABLE "Ticket"
  ADD CONSTRAINT "Ticket_dealId_fkey"
  FOREIGN KEY ("dealId") REFERENCES "Deal"("id") ON DELETE SET NULL;

CREATE INDEX "Ticket_orgId_dealId_idx" ON "Ticket"("orgId", "dealId");

-- 確認用
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'Ticket' ORDER BY ordinal_position;
