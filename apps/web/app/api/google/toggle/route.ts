import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@bgm/db'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * 機能別の有効化フラグを切り替える。
 * POST /api/google/toggle  body: { service: 'gmail'|'calendar'|'meet'|'chat', enabled: boolean }
 */
export async function POST(req: Request) {
  const session = await auth()
  const userId = (session as unknown as { userId?: string })?.userId
  if (!userId) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const body = (await req.json().catch(() => null)) as {
    service?: string
    enabled?: boolean
  } | null
  if (!body?.service || typeof body.enabled !== 'boolean') {
    return NextResponse.json({ error: 'invalid_body' }, { status: 400 })
  }

  const fieldMap: Record<string, 'gmailEnabled' | 'calendarEnabled' | 'meetEnabled' | 'chatEnabled'> = {
    gmail: 'gmailEnabled',
    calendar: 'calendarEnabled',
    meet: 'meetEnabled',
    chat: 'chatEnabled',
  }
  const field = fieldMap[body.service]
  if (!field) return NextResponse.json({ error: 'unknown_service' }, { status: 400 })

  await prisma.userGoogleAccount.update({
    where: { userId },
    data: { [field]: body.enabled },
  })
  return NextResponse.json({ ok: true })
}
