import { NextResponse } from 'next/server'
import { prisma } from '@bgm/db'
import { ensureAuthUserColumns } from '@/lib/auth-schema'
import { hashPassword, hashResetToken, isStrongEnoughPassword } from '@/lib/password'

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as {
    token?: string
    password?: string
  } | null
  const token = body?.token?.trim()
  const password = body?.password ?? ''

  if (!token || !password) {
    return NextResponse.json({ error: 'token_and_password_required' }, { status: 400 })
  }

  if (!isStrongEnoughPassword(password)) {
    return NextResponse.json({ error: 'weak_password' }, { status: 400 })
  }

  const tokenHash = hashResetToken(token)
  await ensureAuthUserColumns()
  const rows = await prisma.$queryRaw<Array<{ id: string }>>`
    SELECT "id"
    FROM "User"
    WHERE "passwordResetTokenHash" = ${tokenHash}
      AND "passwordResetExpiresAt" > NOW()
    LIMIT 1
  `
  const user = rows[0]

  if (!user) {
    return NextResponse.json({ error: 'invalid_or_expired_token' }, { status: 400 })
  }

  await prisma.$executeRaw`
    UPDATE "User"
    SET
      "passwordHash" = ${await hashPassword(password)},
      "passwordUpdatedAt" = NOW(),
      "passwordResetTokenHash" = NULL,
      "passwordResetExpiresAt" = NULL,
      "passwordResetRequestedAt" = NULL
    WHERE "id" = ${user.id}
  `

  return NextResponse.json({ ok: true })
}
