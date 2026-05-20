import { prisma } from '@bgm/db'

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
  const normalizedEmail = email.trim().toLowerCase()
  const existing = await prisma.user.findFirst({ where: { email: normalizedEmail } })
  if (existing) {
    if (googleUserId && existing.googleUserId !== googleUserId) {
      await prisma.user.update({
        where: { id: existing.id },
        data: { googleUserId },
      })
    }
    return existing.id
  }

  const orgId =
    process.env.DEFAULT_ORG_ID ??
    (await prisma.organization.findFirst({ orderBy: { createdAt: 'asc' } }))?.id

  if (!orgId) {
    const org = await prisma.organization.create({
      data: { name: 'Default', slug: 'default' },
    })
    const user = await prisma.user.create({
      data: {
        orgId: org.id,
        email: normalizedEmail,
        name,
        role: 'ADMIN',
        googleUserId,
      },
    })
    return user.id
  }

  const user = await prisma.user.create({
    data: {
      orgId,
      email: normalizedEmail,
      name,
      role: 'REP',
      googleUserId,
    },
  })
  return user.id
}
