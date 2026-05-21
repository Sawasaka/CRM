import { NextResponse } from 'next/server'
import { resolveGoogleIntegrationUserId } from '@/lib/google/current-user'
import { getGoogleAccountSnapshot } from '@/lib/google/account-store'
import { getAppBaseUrl } from '@/lib/app-url'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * Google 連携状態の取得。
 * 機能別の有効化フラグと最終同期時刻を返す。
 */
export async function GET() {
  const userId = await resolveGoogleIntegrationUserId()
  const configured = isConfigured()
  const callbackUrl = `${getAppBaseUrl()}/api/google/oauth-callback`
  const nextAuthCallbackUrl = `${getAppBaseUrl()}/api/auth/callback/google`

  if (!userId) {
    return NextResponse.json(
      { connected: false, configured, callbackUrl, nextAuthCallbackUrl },
      { status: 200 }
    )
  }

  const account = await getGoogleAccountSnapshot(userId)

  if (!account) {
    return NextResponse.json({ connected: false, configured, callbackUrl, nextAuthCallbackUrl })
  }

  // 取得済みスコープから利用可能性を判定
  const scope = account.scope ?? ''
  const has = (s: string) => scope.includes(s)
  const services = {
    gmail: {
      available: has('gmail.modify'),
      enabled: true,
      lastSyncAt: null,
    },
    drive: {
      available: has('drive.readonly'),
      enabled: true,
      lastSyncAt: null,
    },
    calendar: {
      available: has('calendar'),
      enabled: true,
      lastSyncAt: null,
    },
    meet: {
      available: has('meetings.space'),
      enabled: true,
      lastSyncAt: null,
    },
    chat: {
      available: has('chat.spaces') || has('chat.messages'),
      enabled: false,
      lastSyncAt: null,
    },
  }

  return NextResponse.json({
    connected: true,
    configured,
    callbackUrl,
    nextAuthCallbackUrl,
    email: account.email,
    services,
  })
}

function isConfigured() {
  return !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET)
}
