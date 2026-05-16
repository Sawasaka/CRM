-- ============================================================
-- KnowledgeRulebook テーブル追加
--   組織ごとの「前提」「ポリシー」を自然言語で保持
--   AI 自動抽出時の system prompt に差し込んでルール設計可能にする
-- 作成日: 2026-05-07
-- 適用先: Supabase (PostgreSQL)
-- ============================================================

BEGIN;

CREATE TABLE IF NOT EXISTS "KnowledgeRulebook" (
  "id"         text PRIMARY KEY,
  "orgId"      text NOT NULL,
  "premises"   text NOT NULL DEFAULT '',
  "policies"   text NOT NULL DEFAULT '',
  "updatedById" text,
  "createdAt"  timestamptz NOT NULL DEFAULT now(),
  "updatedAt"  timestamptz NOT NULL,
  CONSTRAINT "KnowledgeRulebook_orgId_key" UNIQUE ("orgId"),
  CONSTRAINT "KnowledgeRulebook_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE CASCADE
);

COMMIT;

-- 動作確認:
--   SELECT * FROM "KnowledgeRulebook";
