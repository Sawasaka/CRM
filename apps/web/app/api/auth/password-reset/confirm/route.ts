import { NextResponse } from 'next/server'
import { prisma } from '@bgm/db'
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
  const user = await prisma.user.findFirst({
    where: {
      passwordResetTokenHash: tokenHash,
      passwordResetExpiresAt: { gt: new Date() },
    },
  })

  if (!user) {
    return NextResponse.json({ error: 'invalid_or_expired_token' }, { status: 400 })
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordHash: await hashPassword(password),
      passwordUpdatedAt: new Date(),
      passwordResetTokenHash: null,
      passwordResetExpiresAt: null,
      passwordResetRequestedAt: null,
    },
  })

  return NextResponse.json({ ok: true })
}
