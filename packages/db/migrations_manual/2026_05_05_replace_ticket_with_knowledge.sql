-- ============================================================
-- ナレッジ機能リニューアル
--   * Ticket テーブル削除（チケット機能廃止）
--   * PersonalNote 追加（担当者別ナレッジ）
--   * FaqEntry 追加（チーム公式FAQ）
--   * DriveFolderConnection 追加（Drive 連携先設定）
-- 作成日: 2026-05-05
-- 適用先: Supabase (PostgreSQL)
-- 前提: pgvector 拡張インストール済み
-- ============================================================

BEGIN;

-- 1) Ticket 関連の削除
DROP TABLE IF EXISTS "Ticket" CASCADE;
DROP TYPE  IF EXISTS "TicketStatus";

-- 2) PersonalNote
CREATE TABLE "PersonalNote" (
  "id"        text PRIMARY KEY,
  "orgId"    text NOT NULL,
  "authorId" text NOT NULL,
  "title"    text NOT NULL,
  "body"     text NOT NULL,
  "isPinned" boolean NOT NULL DEFAULT false,
  "createdAt" timestamptz NOT NULL DEFAULT now(),
  "updatedAt" timestamptz NOT NULL,
  CONSTRAINT "PersonalNote_orgId_fkey"    FOREIGN KEY ("orgId")    REFERENCES "Organization"("id") ON DELETE CASCADE,
  CONSTRAINT "PersonalNote_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id")         ON DELETE CASCADE
);
CREATE INDEX "PersonalNote_orgId_authorId_updatedAt_idx" ON "PersonalNote"("orgId", "authorId", "updatedAt" DESC);
CREATE INDEX "PersonalNote_orgId_updatedAt_idx"          ON "PersonalNote"("orgId", "updatedAt" DESC);

-- 3) FAQ Enum
CREATE TYPE "FaqStatus" AS ENUM ('CANDIDATE', 'PUBLISHED', 'ARCHIVED', 'REJECTED');
CREATE TYPE "FaqSourceType" AS ENUM ('MANUAL', 'SLACK', 'GOOGLE_CHAT', 'DRIVE', 'PERSONAL_NOTE');

-- 4) FaqEntry
CREATE TABLE "FaqEntry" (
  "id"           text PRIMARY KEY,
  "orgId"        text NOT NULL,
  "title"        text NOT NULL,
  "body"         text NOT NULL,
  "category"     text,
  "status"       "FaqStatus"     NOT NULL DEFAULT 'CANDIDATE',
  "sourceType"   "FaqSourceType" NOT NULL DEFAULT 'MANUAL',
  "sourceUrl"    text,
  "sourceMeta"   jsonb,
  "hits"         integer NOT NULL DEFAULT 0,
  "approvedById" text,
  "approvedAt"   timestamptz,
  "embedding"    vector(1536),
  "createdAt"    timestamptz NOT NULL DEFAULT now(),
  "updatedAt"    timestamptz NOT NULL,
  CONSTRAINT "FaqEntry_orgId_fkey"        FOREIGN KEY ("orgId")        REFERENCES "Organization"("id") ON DELETE CASCADE,
  CONSTRAINT "FaqEntry_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "User"("id")         ON DELETE SET NULL
);
CREATE INDEX "FaqEntry_orgId_status_updatedAt_idx" ON "FaqEntry"("orgId", "status", "updatedAt" DESC);
CREATE INDEX "FaqEntry_orgId_category_idx"         ON "FaqEntry"("orgId", "category");
CREATE INDEX "FaqEntry_orgId_sourceType_idx"       ON "FaqEntry"("orgId", "sourceType");
-- ベクター検索用 IVFFlat（後続でデータが溜まってから ANALYZE→REINDEX 推奨）
CREATE INDEX "FaqEntry_embedding_ivfflat_idx" ON "FaqEntry"
  USING ivfflat ("embedding" vector_cosine_ops) WITH (lists = 100);

-- 5) DriveFolderConnection
CREATE TABLE "DriveFolderConnection" (
  "id"           text PRIMARY KEY,
  "orgId"        text NOT NULL,
  "folderId"     text NOT NULL,
  "folderName"   text NOT NULL,
  "folderUrl"    text,
  "enabled"      boolean NOT NULL DEFAULT true,
  "lastSyncAt"   timestamptz,
  "lastSyncStat" jsonb,
  "createdAt"    timestamptz NOT NULL DEFAULT now(),
  "updatedAt"    timestamptz NOT NULL,
  CONSTRAINT "DriveFolderConnection_orgId_folderId_key" UNIQUE ("orgId", "folderId"),
  CONSTRAINT "DriveFolderConnection_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE CASCADE
);
CREATE INDEX "DriveFolderConnection_orgId_enabled_idx" ON "DriveFolderConnection"("orgId", "enabled");

COMMIT;

-- 動作確認:
--   SELECT 'PersonalNote'           AS tbl, COUNT(*) FROM "PersonalNote"
--   UNION ALL SELECT 'FaqEntry',           COUNT(*) FROM "FaqEntry"
--   UNION ALL SELECT 'DriveFolderConnection', COUNT(*) FROM "DriveFolderConnection";
