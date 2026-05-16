-- ============================================================
-- 問い合わせチケット機能 — Ticket テーブル追加
-- 作成日: 2026-05-04
-- 適用先: Supabase (PostgreSQL)
--
-- 注意:
--   - このSQLは新規テーブル/Enumの追加のみで、既存テーブルには一切触れません
--   - Company/Contact/Organization/User テーブルは既に存在している前提
--   - 同一名のオブジェクトが既に存在するとエラーになるため、初回のみ実行可
-- ============================================================

-- 1) Enum 型の追加
CREATE TYPE "TicketStatus" AS ENUM ('OPEN', 'PENDING', 'SOLVED', 'CLOSED');

-- 2) Ticket テーブル本体
CREATE TABLE "Ticket" (
  "id"             text PRIMARY KEY,
  "orgId"          text NOT NULL,
  "ticketNumber"   integer NOT NULL,
  "subject"        text NOT NULL,
  "description"    text,
  "cause"          text,
  "resolution"     text,
  "status"         "TicketStatus" NOT NULL DEFAULT 'OPEN',
  "companyId"      text,
  "contactId"      text,
  "assigneeUserId" text,
  "resolvedAt"     timestamptz,
  "closedAt"       timestamptz,
  "createdAt"      timestamptz NOT NULL DEFAULT now(),
  "updatedAt"      timestamptz NOT NULL,
  CONSTRAINT "Ticket_orgId_ticketNumber_key" UNIQUE ("orgId", "ticketNumber"),
  CONSTRAINT "Ticket_orgId_fkey"
    FOREIGN KEY ("orgId")          REFERENCES "Organization"("id") ON DELETE CASCADE,
  CONSTRAINT "Ticket_companyId_fkey"
    FOREIGN KEY ("companyId")      REFERENCES "Company"("id")      ON DELETE SET NULL,
  CONSTRAINT "Ticket_contactId_fkey"
    FOREIGN KEY ("contactId")      REFERENCES "Contact"("id")      ON DELETE SET NULL,
  CONSTRAINT "Ticket_assigneeUserId_fkey"
    FOREIGN KEY ("assigneeUserId") REFERENCES "User"("id")         ON DELETE SET NULL
);

-- 3) インデックス
CREATE INDEX "Ticket_orgId_status_idx"    ON "Ticket"("orgId", "status");
CREATE INDEX "Ticket_orgId_companyId_idx" ON "Ticket"("orgId", "companyId");
CREATE INDEX "Ticket_orgId_updatedAt_idx" ON "Ticket"("orgId", "updatedAt" DESC);

-- 4) 動作確認用クエリ(任意で実行)
-- SELECT 'Ticket table created' AS status, COUNT(*) AS row_count FROM "Ticket";
