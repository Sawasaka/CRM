import { prisma } from '@bgm/db'

let authColumnsPromise: Promise<void> | null = null

export function ensureAuthUserColumns(): Promise<void> {
  authColumnsPromise ??= prisma.$executeRaw`
    ALTER TABLE "User"
      ADD COLUMN IF NOT EXISTS "passwordHash" TEXT,
      ADD COLUMN IF NOT EXISTS "passwordResetTokenHash" TEXT,
      ADD COLUMN IF NOT EXISTS "passwordResetExpiresAt" TIMESTAMP(3),
      ADD COLUMN IF NOT EXISTS "passwordResetRequestedAt" TIMESTAMP(3),
      ADD COLUMN IF NOT EXISTS "passwordUpdatedAt" TIMESTAMP(3),
      ADD COLUMN IF NOT EXISTS "googleUserId" TEXT
  `.then(() => undefined)
  return authColumnsPromise
}
