import { prisma } from '@bgm/db'

export type NotionAccountSnapshot = {
  userId: string
  workspaceId: string | null
  workspaceName: string | null
  botId: string | null
  accessToken: string
  refreshToken: string | null
  enabled: boolean
  lastSyncAt: Date | null
}

export async function ensureNotionAccountTable(): Promise<void> {
  await prisma.$executeRaw`
    CREATE TABLE IF NOT EXISTS "UserNotionAccount" (
      "id" TEXT PRIMARY KEY,
      "userId" TEXT NOT NULL UNIQUE,
      "workspaceId" TEXT,
      "workspaceName" TEXT,
      "botId" TEXT,
      "accessToken" TEXT NOT NULL,
      "refreshToken" TEXT,
      "owner" JSONB,
      "enabled" BOOLEAN NOT NULL DEFAULT TRUE,
      "lastSyncAt" TIMESTAMP(3),
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `
}

export async function getNotionAccountSnapshot(
  userId: string
): Promise<NotionAccountSnapshot | null> {
  const envToken = process.env.NOTION_TOKEN ?? process.env.NOTION_API_KEY
  if (envToken) {
    return {
      userId,
      workspaceId: process.env.NOTION_WORKSPACE_ID ?? null,
      workspaceName: process.env.NOTION_WORKSPACE_NAME ?? 'Environment token',
      botId: null,
      accessToken: envToken,
      refreshToken: null,
      enabled: true,
      lastSyncAt: null,
    }
  }

  await ensureNotionAccountTable()
  const rows = await prisma.$queryRaw<NotionAccountSnapshot[]>`
    SELECT
      "userId",
      "workspaceId",
      "workspaceName",
      "botId",
      "accessToken",
      "refreshToken",
      "enabled",
      "lastSyncAt"
    FROM "UserNotionAccount"
    WHERE "userId" = ${userId}
    LIMIT 1
  `
  return rows[0] ?? null
}

export async function upsertNotionAccount({
  userId,
  workspaceId,
  workspaceName,
  botId,
  accessToken,
  refreshToken,
  owner,
}: {
  userId: string
  workspaceId: string | null
  workspaceName: string | null
  botId: string | null
  accessToken: string
  refreshToken: string | null
  owner: unknown
}): Promise<void> {
  await ensureNotionAccountTable()
  const id = crypto.randomUUID()
  await prisma.$executeRaw`
    INSERT INTO "UserNotionAccount" (
      "id",
      "userId",
      "workspaceId",
      "workspaceName",
      "botId",
      "accessToken",
      "refreshToken",
      "owner",
      "enabled",
      "createdAt",
      "updatedAt"
    )
    VALUES (
      ${id},
      ${userId},
      ${workspaceId},
      ${workspaceName},
      ${botId},
      ${accessToken},
      ${refreshToken},
      ${JSON.stringify(owner)}::jsonb,
      TRUE,
      NOW(),
      NOW()
    )
    ON CONFLICT ("userId") DO UPDATE SET
      "workspaceId" = EXCLUDED."workspaceId",
      "workspaceName" = EXCLUDED."workspaceName",
      "botId" = EXCLUDED."botId",
      "accessToken" = EXCLUDED."accessToken",
      "refreshToken" = COALESCE(EXCLUDED."refreshToken", "UserNotionAccount"."refreshToken"),
      "owner" = EXCLUDED."owner",
      "enabled" = TRUE,
      "updatedAt" = NOW()
  `
}

export async function markNotionSynced(userId: string): Promise<void> {
  await ensureNotionAccountTable()
  await prisma.$executeRaw`
    UPDATE "UserNotionAccount"
    SET "lastSyncAt" = NOW(), "updatedAt" = NOW()
    WHERE "userId" = ${userId}
  `
}

export async function disconnectNotionAccount(userId: string): Promise<void> {
  await ensureNotionAccountTable()
  await prisma.$executeRaw`
    DELETE FROM "UserNotionAccount" WHERE "userId" = ${userId}
  `
}
