-- ============================================================
-- Ticket に追加カラム
-- 作成日: 2026-05-04 (改訂)
--   - estimatedCompletionAt : 完了見込み
--   - memo                  : 内部メモ
-- 既存レコードへの影響なし(NULL のまま)
-- ============================================================

ALTER TABLE "Ticket"
  ADD COLUMN "estimatedCompletionAt" timestamptz,
  ADD COLUMN "memo"                  text;

-- 確認
-- SELECT column_name, data_type FROM information_schema.columns
-- WHERE table_name = 'Ticket' AND column_name IN ('estimatedCompletionAt', 'memo');
