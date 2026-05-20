import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@bgm/db'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * Google 連携状態の取得。
 * 機能別の有効化フラグと最終同期時刻を返す。
 */
export async function GET() {
  const session = await auth()
  const userId = (session as unknown as { userId?: string })?.userId
  if (!userId) return NextResponse.json({ connected: false }, { status: 200 })

  const account = await prisma.userGoogleAccount.findUnique({
    where: { userId },
    select: {
      email: true,
      scope: true,
      gmailEnabled: true,
      driveEnabled: true,
      calendarEnabled: true,
      meetEnabled: true,
      chatEnabled: true,
      lastGmailSyncAt: true,
      lastDriveSyncAt: true,
      lastCalendarSyncAt: true,
      lastMeetSyncAt: true,
      lastChatSyncAt: true,
    },
  })

  if (!account) return NextResponse.json({ connected: false })

  // 取得済みスコープから利用可能性を判定
  const scope = account.scope ?? ''
  const has = (s: string) => scope.includes(s)
  const services = {
    gmail: {
      available: has('gmail.modify'),
      enabled: account.gmailEnabled,
      lastSyncAt: account.lastGmailSyncAt,
    },
    drive: {
      available: has('drive.readonly'),
      enabled: account.driveEnabled,
      lastSyncAt: account.lastDriveSyncAt,
    },
    calendar: {
      available: has('calendar'),
      enabled: account.calendarEnabled,
      lastSyncAt: account.lastCalendarSyncAt,
    },
    meet: {
      available: has('meetings.space'),
      enabled: account.meetEnabled,
      lastSyncAt: account.lastMeetSyncAt,
    },
    chat: {
      available: has('chat.spaces') || has('chat.messages'),
      enabled: account.chatEnabled,
      lastSyncAt: account.lastChatSyncAt,
    },
  }

  return NextResponse.json({
    connected: true,
    email: account.email,
    services,
  })
}
