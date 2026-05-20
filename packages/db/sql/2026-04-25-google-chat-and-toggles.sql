-- ============================================================================
-- Google Chat 連携 + 機能別 ON/OFF フラグの追加（差分マイグレーション）
--
-- 冪等版: 何度実行しても安全。既存テーブルがあれば不足カラムだけ追加。
-- ============================================================================

-- UserGoogleAccount に Chat 同期時刻と機能別有効化フラグを追加
DO $$ BEGIN ALTER TABLE "UserGoogleAccount" ADD COLUMN IF NOT EXISTS "lastChatSyncAt" TIMESTAMP(3); EXCEPTION WHEN others THEN raise notice 'col lastChatSyncAt already ok'; END $$;
DO $$ BEGIN ALTER TABLE "UserGoogleAccount" ADD COLUMN IF NOT EXISTS "lastDriveSyncAt" TIMESTAMP(3); EXCEPTION WHEN others THEN raise notice 'col lastDriveSyncAt already ok'; END $$;
DO $$ BEGIN ALTER TABLE "UserGoogleAccount" ADD COLUMN IF NOT EXISTS "gmailEnabled" BOOLEAN NOT NULL DEFAULT TRUE; EXCEPTION WHEN others THEN raise notice 'col gmailEnabled already ok'; END $$;
DO $$ BEGIN ALTER TABLE "UserGoogleAccount" ADD COLUMN IF NOT EXISTS "driveEnabled" BOOLEAN NOT NULL DEFAULT TRUE; EXCEPTION WHEN others THEN raise notice 'col driveEnabled already ok'; END $$;
DO $$ BEGIN ALTER TABLE "UserGoogleAccount" ADD COLUMN IF NOT EXISTS "calendarEnabled" BOOLEAN NOT NULL DEFAULT TRUE; EXCEPTION WHEN others THEN raise notice 'col calendarEnabled already ok'; END $$;
DO $$ BEGIN ALTER TABLE "UserGoogleAccount" ADD COLUMN IF NOT EXISTS "meetEnabled" BOOLEAN NOT NULL DEFAULT TRUE; EXCEPTION WHEN others THEN raise notice 'col meetEnabled already ok'; END $$;
DO $$ BEGIN ALTER TABLE "UserGoogleAccount" ADD COLUMN IF NOT EXISTS "chatEnabled" BOOLEAN NOT NULL DEFAULT FALSE; EXCEPTION WHEN others THEN raise notice 'col chatEnabled already ok'; END $$;

-- ChatMessage テーブル
CREATE TABLE IF NOT EXISTS "ChatMessage" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "chatName" TEXT NOT NULL,
    "spaceName" TEXT NOT NULL,
    "spaceDisplayName" TEXT,
    "threadName" TEXT,
    "senderEmail" TEXT,
    "senderDisplayName" TEXT,
    "text" TEXT NOT NULL,
    "createdAtChat" TIMESTAMP(3) NOT NULL,
    "contactId" TEXT,
    "companyId" TEXT,
    "dealId" TEXT,
    "matchedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChatMessage_pkey" PRIMARY KEY ("id")
);

-- Indexes
CREATE UNIQUE INDEX IF NOT EXISTS "ChatMessage_chatName_key" ON "ChatMessage"("chatName");
CREATE INDEX IF NOT EXISTS "ChatMessage_orgId_contactId_idx" ON "ChatMessage"("orgId", "contactId");
CREATE INDEX IF NOT EXISTS "ChatMessage_orgId_dealId_idx" ON "ChatMessage"("orgId", "dealId");
CREATE INDEX IF NOT EXISTS "ChatMessage_spaceName_idx" ON "ChatMessage"("spaceName");
CREATE INDEX IF NOT EXISTS "ChatMessage_orgId_createdAtChat_idx" ON "ChatMessage"("orgId", "createdAtChat" DESC);
