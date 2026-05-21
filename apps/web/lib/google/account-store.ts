import { prisma } from '@bgm/db'

export type GoogleAccountSnapshot = {
  userId: string
  googleSub: string
  email: string
  accessToken: string | null
  refreshToken: string | null
  expiresAt: Date | null
  scope: string | null
}

export async function getGoogleAccountSnapshot(
  userId: string
): Promise<GoogleAccountSnapshot | null> {
  const rows = await prisma.$queryRaw<GoogleAccountSnapshot[]>`
    SELECT
      "userId",
      "googleSub",
      "email",
      "accessToken",
      "refreshToken",
      "expiresAt",
      "scope"
    FROM "UserGoogleAccount"
    WHERE "userId" = ${userId}
    LIMIT 1
  `
  return rows[0] ?? null
}

export async function upsertGoogleAccountSnapshot({
  userId,
  googleSub,
  email,
  accessToken,
  refreshToken,
  expiresAt,
  scope,
}: GoogleAccountSnapshot): Promise<void> {
  const id = crypto.randomUUID()
  await prisma.$executeRaw`
    INSERT INTO "UserGoogleAccount" (
      "id",
      "userId",
      "googleSub",
      "email",
      "accessToken",
      "refreshToken",
      "expiresAt",
      "scope",
      "createdAt",
      "updatedAt"
    )
    VALUES (
      ${id},
      ${userId},
      ${googleSub},
      ${email},
      ${accessToken},
      ${refreshToken},
      ${expiresAt},
      ${scope},
      NOW(),
      NOW()
    )
    ON CONFLICT ("userId") DO UPDATE SET
      "googleSub" = EXCLUDED."googleSub",
      "email" = EXCLUDED."email",
      "accessToken" = EXCLUDED."accessToken",
      "refreshToken" = COALESCE(EXCLUDED."refreshToken", "UserGoogleAccount"."refreshToken"),
      "expiresAt" = EXCLUDED."expiresAt",
      "scope" = EXCLUDED."scope",
      "updatedAt" = NOW()
  `
}

export async function updateGoogleAccountTokens({
  userId,
  accessToken,
  expiresAt,
  scope,
}: {
  userId: string
  accessToken: string | null
  expiresAt: Date | null
  scope: string | null
}): Promise<void> {
  await prisma.$executeRaw`
    UPDATE "UserGoogleAccount"
    SET
      "accessToken" = ${accessToken},
      "expiresAt" = ${expiresAt},
      "scope" = ${scope},
      "updatedAt" = NOW()
    WHERE "userId" = ${userId}
  `
}

export async function markGoogleAccountSynced(
  userId: string,
  column: 'lastGmailSyncAt' | 'lastDriveSyncAt' | 'lastCalendarSyncAt' | 'lastMeetSyncAt'
): Promise<void> {
  if (column === 'lastGmailSyncAt') {
    await prisma.$executeRaw`
      UPDATE "UserGoogleAccount" SET "lastGmailSyncAt" = NOW(), "updatedAt" = NOW()
      WHERE "userId" = ${userId}
    `
    return
  }
  if (column === 'lastDriveSyncAt') {
    await prisma.$executeRaw`
      UPDATE "UserGoogleAccount" SET "lastDriveSyncAt" = NOW(), "updatedAt" = NOW()
      WHERE "userId" = ${userId}
    `
    return
  }
  if (column === 'lastCalendarSyncAt') {
    await prisma.$executeRaw`
      UPDATE "UserGoogleAccount" SET "lastCalendarSyncAt" = NOW(), "updatedAt" = NOW()
      WHERE "userId" = ${userId}
    `
    return
  }
  await prisma.$executeRaw`
    UPDATE "UserGoogleAccount" SET "lastMeetSyncAt" = NOW(), "updatedAt" = NOW()
    WHERE "userId" = ${userId}
  `
}
