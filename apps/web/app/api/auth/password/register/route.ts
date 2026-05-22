import { NextResponse } from 'next/server'
import { prisma } from '@bgm/db'
import { ensureUser } from '@/lib/user-provisioning'
import { ensureAuthUserColumns } from '@/lib/auth-schema'
import { hashPassword, isStrongEnoughPassword } from '@/lib/password'

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as {
    email?: string
    password?: string
    name?: string
  } | null
  const email = body?.email?.trim().toLowerCase()
  const password = body?.password ?? ''
  const name = body?.name?.trim()

  if (!email || !password) {
    return NextResponse.json({ error: 'email_and_password_required' }, { status: 400 })
  }

  if (!isStrongEnoughPassword(password)) {
    return NextResponse.json({ error: 'weak_password' }, { status: 400 })
  }

  await ensureAuthUserColumns()
  const rows = await prisma.$queryRaw<
    Array<{ id: string; name: string | null; passwordHash: string | null }>
  >`
    SELECT "id", "name", "passwordHash"
    FROM "User"
    WHERE "email" = ${email}
    LIMIT 1
  `
  const existing = rows[0]
  if (existing?.passwordHash) {
    return NextResponse.json({ error: 'password_already_set' }, { status: 409 })
  }

  const userId = existing?.id ?? (await ensureUser({ email, name: name || email }))
  await prisma.$executeRaw`
    UPDATE "User"
    SET
      "name" = ${name || existing?.name || email},
      "passwordHash" = ${await hashPassword(password)},
      "passwordUpdatedAt" = NOW(),
      "passwordResetTokenHash" = NULL,
      "passwordResetExpiresAt" = NULL,
      "passwordResetRequestedAt" = NULL
    WHERE "id" = ${userId}
  `

  return NextResponse.json({ ok: true })
}
