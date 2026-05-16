import { NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * Slack OAuth フロー開始: Slack の認可ページにリダイレクト。
 * GET /api/slack/install
 */
export async function GET() {
  const clientId = process.env.SLACK_CLIENT_ID
  if (!clientId) {
    return NextResponse.json(
      { error: 'slack_not_configured', message: 'SLACK_CLIENT_ID が未設定です。' },
      { status: 500 },
    )
  }
  const baseUrl =
    process.env.AUTH_URL ?? process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3002'
  const redirectUri = `${baseUrl}/api/slack/oauth-callback`

  // Bot scope
  // - チャンネル一覧 + 履歴 + メッセージ permalink + ユーザー情報
  // - app_mentions:read: メンションBot応答 (/api/slack/events)
  // - reactions:read: ✅リアクションでFAQ昇格候補化
  const scopes = [
    'app_mentions:read',
    'reactions:read',
    'channels:history',
    'channels:read',
    'groups:history',
    'groups:read',
    'im:history',
    'im:read',
    'mpim:history',
    'mpim:read',
    'users:read',
    'users:read.email',
    'chat:write',
  ].join(',')
  // User scope は今回は不要

  const state = crypto.randomUUID()
  const url = new URL('https://slack.com/oauth/v2/authorize')
  url.searchParams.set('client_id', clientId)
  url.searchParams.set('scope', scopes)
  url.searchParams.set('redirect_uri', redirectUri)
  url.searchParams.set('state', state)

  const res = NextResponse.redirect(url.toString())
  // CSRF 対策で state を Cookie に保存
  res.cookies.set('slack_oauth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 600,
    path: '/',
  })
  return res
}
