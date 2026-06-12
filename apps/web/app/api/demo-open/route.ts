import { NextResponse } from 'next/server'
import { randomBytes } from 'node:crypto'
import { prisma } from '@bgm/db'
import { ensureAuthUserColumns } from '@/lib/auth-schema'
import { hashPassword } from '@/lib/password'
import { getTenantEnvironmentUrl } from '@/lib/public-url'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function validateTenantSlug(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const slug = value.trim().toLowerCase().slice(0, 80)
  return /^[a-z0-9-]+$/.test(slug) ? slug : null
}

function isExpired(expiresAt: Date | null): boolean {
  return !expiresAt || expiresAt <= new Date()
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as { tenant?: unknown } | null
  const slug = validateTenantSlug(body?.tenant)
  if (!slug || slug === 'default') {
    return NextResponse.json({ error: 'invalid_demo_link' }, { status: 400 })
  }

  const org = await prisma.organization.findUnique({
    where: { slug },
    select: {
      id: true,
      slug: true,
      lifecycleStatus: true,
      demoExpiresAt: true,
    },
  })
  if (!org) {
    return NextResponse.json({ error: 'invalid_demo_link' }, { status: 404 })
  }
  const expiresAt = org.demoExpiresAt
  if (expiresAt && isExpired(expiresAt)) {
    await prisma.organization.updateMany({
      where: { id: org.id },
      data: { lifecycleStatus: 'INACTIVE' },
    })
    return NextResponse.json({ error: 'demo_expired' }, { status: 410 })
  }
  if (org.lifecycleStatus !== 'DEMO' || !expiresAt) {
    return NextResponse.json({ error: 'invalid_demo_link' }, { status: 404 })
  }

  await ensureAuthUserColumns()
  const email = `demo-${org.slug}@rookiesmart.local`
  const name = 'デモユーザー'
  const temporaryPassword = randomBytes(24).toString('base64url')
  const passwordHash = await hashPassword(temporaryPassword)
  const existingUser = await prisma.user.findFirst({
    where: { orgId: org.id, email },
    select: { id: true },
  })
  if (existingUser) {
    await prisma.user.update({
      where: { id: existingUser.id },
      data: {
        name,
        role: 'ADMIN',
        passwordHash,
        passwordUpdatedAt: new Date(),
      },
    })
  } else {
    await prisma.user.create({
      data: {
        orgId: org.id,
        email,
        name,
        role: 'ADMIN',
        passwordHash,
        passwordUpdatedAt: new Date(),
      },
    })
  }

  const url = new URL(getTenantEnvironmentUrl(org.slug))
  url.searchParams.set('demo', '1')
  url.searchParams.set('demoSession', '1')

  return NextResponse.json({
    ok: true,
    url: url.toString(),
    auth: {
      email,
      password: temporaryPassword,
      tenant: org.slug,
    },
    expiresAt: expiresAt.getTime(),
  })
}
