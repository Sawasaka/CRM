import { auth } from '@/lib/auth'
import { prisma } from '@bgm/db'

export async function resolveGoogleIntegrationUserId(): Promise<string | null> {
  const session = await auth()
  const sessionUserId = (session as unknown as { userId?: string })?.userId
  if (sessionUserId) return sessionUserId

  if (process.env.NODE_ENV === 'production') return null

  const user = await prisma.user.findFirst({
    orderBy: { createdAt: 'asc' },
    select: { id: true },
  })
  if (user?.id) return user.id

  return ensureLocalDevUser()
}

async function ensureLocalDevUser(): Promise<string> {
  const email = process.env.LOCAL_DEV_USER_EMAIL ?? 'local-dev@rookiesmart.local'
  const existing = await prisma.$queryRaw<Array<{ id: string }>>`
    SELECT "id" FROM "User" WHERE "email" = ${email} LIMIT 1
  `
  if (existing[0]?.id) return existing[0].id

  let orgId = process.env.DEFAULT_ORG_ID ?? null
  if (!orgId) {
    const org = await prisma.$queryRaw<Array<{ id: string }>>`
      SELECT "id" FROM "Organization" ORDER BY "createdAt" ASC LIMIT 1
    `
    orgId = org[0]?.id ?? null
  }

  if (!orgId) {
    orgId = crypto.randomUUID()
    await prisma.$executeRaw`
      INSERT INTO "Organization" ("id", "name", "slug", "createdAt", "updatedAt")
      VALUES (${orgId}, 'Default', 'default', NOW(), NOW())
      ON CONFLICT ("slug") DO NOTHING
    `
    const org = await prisma.$queryRaw<Array<{ id: string }>>`
      SELECT "id" FROM "Organization" WHERE "slug" = 'default' LIMIT 1
    `
    orgId = org[0]?.id ?? orgId
  }

  const userId = crypto.randomUUID()
  await prisma.$executeRaw`
    INSERT INTO "User" ("id", "orgId", "email", "name", "role", "createdAt")
    VALUES (${userId}, ${orgId}, ${email}, 'Local Dev User', 'ADMIN'::"UserRole", NOW())
  `
  return userId
}
