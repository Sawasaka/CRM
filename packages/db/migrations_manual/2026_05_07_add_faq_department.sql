-- ============================================================
-- FaqEntry に department を追加
--   部門 > カテゴリ の2階層に対応
--   department: 営業 / 人事 / 経理 / 法務 / IT / プロダクト / その他
--   category : 部門内の小分類（例: 営業×ヒアリング、経理×請求）
-- 作成日: 2026-05-07
-- 適用先: Supabase (PostgreSQL)
-- ============================================================

BEGIN;

ALTER TABLE "FaqEntry" ADD COLUMN IF NOT EXISTS "department" text;

-- 既存データの移行: いまの category が部門名そのものの場合は department に複製、
-- category は NULL にして「未分類カテゴリ」扱いにする。
UPDATE "FaqEntry"
SET "department" = "category", "category" = NULL
WHERE "department" IS NULL
  AND "category" IN ('営業','人事','経理','経費','法務','IT','プロダクト','その他');

CREATE INDEX IF NOT EXISTS "FaqEntry_orgId_department_category_idx"
  ON "FaqEntry"("orgId", "department", "category");
CREATE INDEX IF NOT EXISTS "FaqEntry_orgId_department_idx"
  ON "FaqEntry"("orgId", "department");

COMMIT;

-- 動作確認:
--   SELECT "department", "category", count(*) FROM "FaqEntry" GROUP BY 1,2 ORDER BY 1,2;
