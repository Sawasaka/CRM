import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@bgm/db'
import { GoogleService, SCOPES_BY_SERVICE } from '@/lib/google/scopes'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const ALL: GoogleService[] = ['gmail', 'calendar', 'meet', 'chat']

/**
 * 機能別または全体の切断。
 * POST /api/google/disconnect?service=gmail|calendar|meet|chat|all
 *
 * - 個別: その機能のスコープを scope 文字列から削除し、enabled フラグを false に
 * - all: UserGoogleAccount を完全に削除
 *
 * 注意: Google 側の権限取消（revoke）も行うことで、再認可時にリフレッシュトークンが再発行される。
 */
export async function POST(req: Request) {
  const session = await auth()
  const userId = (session as unknown as { userId?: string })?.userId
  if (!userId) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const url = new URL(req.url)
  const service = url.searchParams.get('service') ?? 'all'

  const account = await prisma.userGoogleAccount.findUnique({ where: { userId } })
  if (!account) return NextResponse.json({ ok: true, alreadyDisconnected: true })

  if (service === 'all') {
    // refresh_token を revoke してから削除
    if (account.refreshToken) {
      try {
        await fetch(
          `https://oauth2.googleapis.com/revoke?token=${encodeURIComponent(account.refreshToken)}`,
          { method: 'POST' },
        )
      } catch {
        // 失敗しても DB 削除は進める
      }
    }
    await prisma.userGoogleAccount.delete({ where: { userId } })
    return NextResponse.json({ ok: true, disconnected: 'all' })
  }

  if (!ALL.includes(service as GoogleService)) {
    return NextResponse.json({ error: 'invalid_service' }, { status: 400 })
  }

  // 個別: scope から該当機能のスコープだけ除去
  const removed = new Set(SCOPES_BY_SERVICE[service as GoogleService] as readonly string[])
  const remaining = (account.scope ?? '')
    .split(/\s+/)
    .filter((s) => s && !removed.has(s))
    .join(' ')

  const updateData: Record<string, unknown> = {
    scope: remaining,
  }
  updateData[`${service}Enabled`] = false

  await prisma.userGoogleAccount.update({
    where: { userId },
    data: updateData,
  })
  return NextResponse.json({ ok: true, disconnected: service })
}
