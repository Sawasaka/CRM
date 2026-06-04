import { NextResponse } from 'next/server'
import { resolveGoogleIntegrationUserId } from '@/lib/google/current-user'
import { syncGmailForUser } from '@/lib/google/gmail-sync'
import { syncCalendarForUser } from '@/lib/google/calendar-sync'
import { syncMeetForUser } from '@/lib/google/meet-sync'
import { syncChatForUser } from '@/lib/google/chat-sync'
import { GoogleAccountNotConnectedError } from '@/lib/google/oauth'
import { getGoogleAccountSnapshot } from '@/lib/google/account-store'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * Google 連携の手動同期エンドポイント。
 * POST /api/google/sync?scope=gmail|calendar|meet|chat|all
 */
export async function POST(req: Request) {
  const userId = await resolveGoogleIntegrationUserId()
  if (!userId) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const url = new URL(req.url)
  const scope = (url.searchParams.get('scope') ?? 'all') as
    | 'gmail'
    | 'calendar'
    | 'meet'
    | 'chat'
    | 'all'

  try {
    const account = await getGoogleAccountSnapshot(userId)
    if (!account) throw new GoogleAccountNotConnectedError(userId)

    const shouldRun = (s: 'gmail' | 'calendar' | 'meet' | 'chat') => {
      if (scope !== 'all' && scope !== s) return false
      if (scope === 'all') {
        const scopes = account.scope ?? ''
        if (s === 'gmail') return scopes.includes('gmail')
        if (s === 'calendar') return scopes.includes('calendar')
        if (s === 'meet') return scopes.includes('meetings.space')
        return false
      }
      return true // 個別呼び出しは明示なので enabled に関係なく実行
    }

    const out: Record<string, unknown> = {}
    if (shouldRun('gmail')) out.gmail = await syncGmailForUser(userId)
    if (shouldRun('calendar')) out.calendar = await syncCalendarForUser(userId)
    if (shouldRun('meet')) out.meet = await syncMeetForUser(userId)
    if (shouldRun('chat')) out.chat = await syncChatForUser(userId)
    return NextResponse.json({ ok: true, ...out })
  } catch (e) {
    if (e instanceof GoogleAccountNotConnectedError) {
      return NextResponse.json({ error: 'google_not_connected' }, { status: 412 })
    }
    console.error('[google/sync]', e)
    return NextResponse.json(
      { error: 'sync_failed', message: e instanceof Error ? e.message : String(e) },
      { status: 500 }
    )
  }
}
