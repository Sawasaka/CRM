import { NextResponse } from 'next/server'
import { prisma } from '@bgm/db'
import { createPasswordResetToken } from '@/lib/password'

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as { email?: string } | null
  const email = body?.email?.trim().toLowerCase()

  if (!email) {
    return NextResponse.json({ error: 'email_required' }, { status: 400 })
  }

  const user = await prisma.user.findFirst({ where: { email } })
  let resetUrl: string | undefined

  if (user) {
    const reset = createPasswordResetToken()
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetTokenHash: reset.tokenHash,
        passwordResetExpiresAt: reset.expiresAt,
        passwordResetRequestedAt: new Date(),
      },
    })

    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL ??
      process.env.NEXTAUTH_URL ??
      new URL(req.url).origin
    resetUrl = `${baseUrl.replace(/\/$/, '')}/reset-password?token=${reset.token}`
    console.info('[auth/password-reset]', { email, resetUrl })
  }

  return NextResponse.json({
    ok: true,
    resetUrl:
      process.env.NODE_ENV !== 'production' || process.env.PASSWORD_RESET_DEBUG_URLS === 'true'
        ? resetUrl
        : undefined,
  })
}
