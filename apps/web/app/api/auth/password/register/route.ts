import { NextResponse } from 'next/server'
import { prisma } from '@bgm/db'
import { ensureUser } from '@/lib/user-provisioning'
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

  const existing = await prisma.user.findFirst({ where: { email } })
  if (existing?.passwordHash) {
    return NextResponse.json({ error: 'password_already_set' }, { status: 409 })
  }

  const userId = existing?.id ?? (await ensureUser({ email, name: name || email }))
  await prisma.user.update({
    where: { id: userId },
    data: {
      name: name || existing?.name || email,
      passwordHash: await hashPassword(password),
      passwordUpdatedAt: new Date(),
      passwordResetTokenHash: null,
      passwordResetExpiresAt: null,
      passwordResetRequestedAt: null,
    },
  })

  return NextResponse.json({ ok: true })
}
