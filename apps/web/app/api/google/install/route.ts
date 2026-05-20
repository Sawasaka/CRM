import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getAppBaseUrl } from '@/lib/app-url'
import { GoogleService, SCOPES_BY_SERVICE, scopesForServices } from '@/lib/google/scopes'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const ALL_SERVICES: GoogleService[] = ['gmail', 'drive', 'calendar', 'meet', 'chat']

/**
 * 機能別の Google OAuth フロー開始。
 * GET /api/google/install?service=gmail|calendar|meet|chat|all
 *
 * incremental authorization: 既存スコープは保持されたまま、追加分だけ要求。
 */
export async function GET(req: Request) {
  const session = await auth()
  const userId = (session as unknown as { userId?: string })?.userId
  if (!userId) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  const url = new URL(req.url)
  const service = url.searchParams.get('service') ?? 'all'

  const services: GoogleService[] =
    service === 'all'
      ? ALL_SERVICES
      : ALL_SERVICES.includes(service as GoogleService)
        ? [service as GoogleService]
        : []

  if (services.length === 0) {
    return NextResponse.json({ error: 'invalid_service' }, { status: 400 })
  }

  const clientId = process.env.GOOGLE_CLIENT_ID
  if (!clientId) {
    return NextResponse.json({ error: 'google_not_configured' }, { status: 500 })
  }

  const redirectUri = `${getAppBaseUrl()}/api/google/oauth-callback`

  const scope = ['openid', 'email', 'profile', ...scopesForServices(services)].join(' ')

  const state = crypto.randomUUID()

  const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth')
  authUrl.searchParams.set('client_id', clientId)
  authUrl.searchParams.set('redirect_uri', redirectUri)
  authUrl.searchParams.set('response_type', 'code')
  authUrl.searchParams.set('scope', scope)
  authUrl.searchParams.set('access_type', 'offline')
  authUrl.searchParams.set('prompt', 'consent')
  // 既に取得済みのスコープを保持し、追加分だけを認可する
  authUrl.searchParams.set('include_granted_scopes', 'true')
  authUrl.searchParams.set('state', state)

  const res = NextResponse.redirect(authUrl.toString())
  // CSRF + 戻り先決定用に state と service リストを cookie に保存
  res.cookies.set('google_install_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 600,
    path: '/',
  })
  res.cookies.set('google_install_services', services.join(','), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 600,
    path: '/',
  })
  return res
}

// for debug / availability ヘルプ
export const _ALL_SERVICES = ALL_SERVICES
export const _SCOPES_BY_SERVICE = SCOPES_BY_SERVICE
