import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@bgm/db'
import { syncGmailForUser } from '@/lib/google/gmail-sync'
import { syncDriveForUser } from '@/lib/google/drive-sync'
import { syncCalendarForUser } from '@/lib/google/calendar-sync'
import { syncMeetForUser } from '@/lib/google/meet-sync'
import { syncChatForUser } from '@/lib/google/chat-sync'
import { GoogleAccountNotConnectedError } from '@/lib/google/oauth'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * Google 連携の手動同期エンドポイント。
 * POST /api/google/sync?scope=gmail|drive|calendar|meet|chat|all
 */
export async function POST(req: Request) {
  const session = await auth()
  const userId = (session as unknown as { userId?: string })?.userId
  if (!userId) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const url = new URL(req.url)
  const scope = (url.searchParams.get('scope') ?? 'all') as
    | 'gmail'
    | 'drive'
    | 'calendar'
    | 'meet'
    | 'chat'
    | 'all'

  try {
    // 機能別の有効化フラグを取得
    const account = await prisma.userGoogleAccount.findUnique({
      where: { userId },
      select: {
        gmailEnabled: true,
        driveEnabled: true,
        calendarEnabled: true,
        meetEnabled: true,
        chatEnabled: true,
      },
    })
    if (!account) throw new GoogleAccountNotConnectedError(userId)

    const shouldRun = (s: 'gmail' | 'drive' | 'calendar' | 'meet' | 'chat') => {
      if (scope !== 'all' && scope !== s) return false
      if (scope === 'all') {
        // all のときは enabled なものだけ実行
        return account[`${s}Enabled` as const]
      }
      return true // 個別呼び出しは明示なので enabled に関係なく実行
    }

    const out: Record<string, unknown> = {}
    if (shouldRun('gmail')) out.gmail = await syncGmailForUser(userId)
    if (shouldRun('drive')) out.drive = await syncDriveForUser(userId)
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
      { status: 500 },
    )
  }
}
