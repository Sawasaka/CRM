-- ============================================================
-- 個人ナレッジ廃止 + Ticket 確実削除
--   * PersonalNote テーブル削除
--   * Ticket テーブル / TicketStatus enum を IF EXISTS で削除
--   * FaqSourceType の PERSONAL_NOTE 値を削除（使用中なら DRIVE/MANUAL に置換）
-- 作成日: 2026-05-06
-- 適用先: Supabase (PostgreSQL)
-- ============================================================

BEGIN;

-- 1) PersonalNote 削除
DROP TABLE IF EXISTS "PersonalNote" CASCADE;

-- 2) Ticket 削除（過去のマイグレーションで残っている可能性あり）
DROP TABLE IF EXISTS "Ticket" CASCADE;
DROP TYPE  IF EXISTS "TicketStatus";

-- 3) FaqSourceType から PERSONAL_NOTE 値を削除
--    (PostgreSQL は enum 値の DROP を直接サポートしないため、
--     旧値を参照しているレコードを更新してから enum を作り直す)

-- 旧 PERSONAL_NOTE は MANUAL に変更
UPDATE "FaqEntry" SET "sourceType" = 'MANUAL' WHERE "sourceType" = 'PERSONAL_NOTE';

-- enum を作り直す（依存カラムは USING で再キャスト）
ALTER TYPE "FaqSourceType" RENAME TO "FaqSourceType_old";
CREATE TYPE "FaqSourceType" AS ENUM ('MANUAL', 'SLACK', 'GOOGLE_CHAT', 'DRIVE');
ALTER TABLE "FaqEntry"
  ALTER COLUMN "sourceType" DROP DEFAULT,
  ALTER COLUMN "sourceType" TYPE "FaqSourceType" USING ("sourceType"::text::"FaqSourceType"),
  ALTER COLUMN "sourceType" SET DEFAULT 'MANUAL';
DROP TYPE "FaqSourceType_old";

COMMIT;

-- 動作確認:
--   SELECT count(*) FROM "FaqEntry" WHERE "sourceType" = 'MANUAL';
