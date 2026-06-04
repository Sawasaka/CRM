-- ============================================================
-- Ticket schema drift safe additions
-- 作成日: 2026-06-03
--
-- 目的:
--   本番/ローカルDBで不足している可能性がある Ticket カラムを
--   追加のみで Prisma schema に寄せる。
--
-- 安全方針:
--   - 既存データの DELETE / TRUNCATE / reset は行わない
--   - 既存レコードへの値更新は行わない
--   - カラム/インデックス/外部キーは存在しない場合だけ追加する
-- ============================================================

BEGIN;

ALTER TABLE "Ticket"
  ADD COLUMN IF NOT EXISTS "dealId" text,
  ADD COLUMN IF NOT EXISTS "estimatedCompletionAt" timestamptz;

CREATE INDEX IF NOT EXISTS "Ticket_orgId_dealId_idx"
  ON "Ticket"("orgId", "dealId");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'Ticket_dealId_fkey'
  ) THEN
    ALTER TABLE "Ticket"
      ADD CONSTRAINT "Ticket_dealId_fkey"
      FOREIGN KEY ("dealId") REFERENCES "Deal"("id")
      ON DELETE SET NULL
      ON UPDATE CASCADE;
  END IF;
END $$;

COMMIT;

-- 適用前後の確認:
-- SELECT column_name, data_type
-- FROM information_schema.columns
-- WHERE table_name = 'Ticket'
--   AND column_name IN ('dealId', 'estimatedCompletionAt')
-- ORDER BY column_name;
--
-- SELECT conname
-- FROM pg_constraint
-- WHERE conname = 'Ticket_dealId_fkey';
