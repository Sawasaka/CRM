import { prisma } from '@bgm/db'
import { ensureAuthUserColumns } from '@/lib/auth-schema'

const SIGNUP_TENANT_COOKIE = 'bgm_signup_tenant'

// User がなければ作成。orgId は環境変数 DEFAULT_ORG_ID か、最初の Organization を使う。
export async function ensureUser({
  email,
  name,
  googleUserId,
}: {
  email: string
  name: string
  googleUserId?: string
}): Promise<string> {
  await ensureAuthUserColumns()
  const normalizedEmail = email.trim().toLowerCase()
  const signupOrgId = await resolveSignupOrgId()
  const existing = signupOrgId
    ? await prisma.$queryRaw<Array<{ id: string; googleUserId: string | null }>>`
        SELECT "id", "googleUserId" FROM "User"
        WHERE "email" = ${normalizedEmail}
          AND "orgId" = ${signupOrgId}
        LIMIT 1
      `
    : await prisma.$queryRaw<Array<{ id: string; googleUserId: string | null }>>`
        SELECT "id", "googleUserId" FROM "User" WHERE "email" = ${normalizedEmail} LIMIT 1
      `
  if (existing[0]) {
    if (googleUserId && existing[0].googleUserId !== googleUserId) {
      await prisma.$executeRaw`
        UPDATE "User" SET "googleUserId" = ${googleUserId} WHERE "id" = ${existing[0].id}
      `
    }
    return existing[0].id
  }

  const orgId =
    signupOrgId ??
    process.env.DEFAULT_ORG_ID ??
    (
      await prisma.$queryRaw<Array<{ id: string }>>`
        SELECT "id" FROM "Organization" ORDER BY "createdAt" ASC LIMIT 1
      `
    )[0]?.id

  if (!orgId) {
    const newOrgId = crypto.randomUUID()
    await prisma.$executeRaw`
      INSERT INTO "Organization" ("id", "name", "slug", "createdAt", "updatedAt")
      VALUES (${newOrgId}, 'Default', 'default', NOW(), NOW())
      ON CONFLICT ("slug") DO NOTHING
    `
    const org = await prisma.$queryRaw<Array<{ id: string }>>`
      SELECT "id" FROM "Organization" WHERE "slug" = 'default' LIMIT 1
    `
    const userId = crypto.randomUUID()
    await prisma.$executeRaw`
      INSERT INTO "User" ("id", "orgId", "email", "name", "role", "googleUserId", "createdAt")
      VALUES (${userId}, ${org[0]?.id ?? newOrgId}, ${normalizedEmail}, ${name}, 'ADMIN'::"UserRole", ${googleUserId ?? null}, NOW())
    `
    return userId
  }

  const userId = crypto.randomUUID()
  await prisma.$executeRaw`
    INSERT INTO "User" ("id", "orgId", "email", "name", "role", "googleUserId", "createdAt")
    VALUES (${userId}, ${orgId}, ${normalizedEmail}, ${name}, 'REP'::"UserRole", ${googleUserId ?? null}, NOW())
  `
  return userId
}

async function resolveSignupOrgId(): Promise<string | null> {
  try {
    const { cookies } = await import('next/headers')
    const cookieStore = await cookies()
    const slug = cookieStore.get(SIGNUP_TENANT_COOKIE)?.value?.trim().toLowerCase()
    if (!slug || !/^[a-z0-9-]+$/.test(slug)) return null
    const org = await prisma.organization.findFirst({
      where: {
        slug,
        lifecycleStatus: 'ACTIVE',
      },
      select: { id: true },
    })
    return org?.id ?? null
  } catch {
    return null
  }
}
