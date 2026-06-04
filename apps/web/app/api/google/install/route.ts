import { NextResponse } from 'next/server'
import { GoogleService, scopesForServices } from '@/lib/google/scopes'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const ALL_SERVICES: GoogleService[] = ['gmail', 'calendar', 'meet', 'chat']

/**
 * 機能別の Google OAuth フロー開始。
 * GET /api/google/install?service=gmail|calendar|meet|chat|all
 *
 * 既存の NextAuth Google provider 経由で追加スコープを要求することで、
 * Google Cloud 側の redirect URI をログイン導線と一致させる。
 */
export async function GET(req: Request) {
  const url = new URL(req.url)
  const returnTo = safeReturnTo(url.searchParams.get('returnTo')) ?? '/subscription?tab=integrations'
  const service = url.searchParams.get('service') ?? 'all'

  const services: GoogleService[] =
    service === 'all'
      ? ALL_SERVICES
      : Array.from(
          new Set(
            service
              .split(',')
              .map((s) => s.trim())
              .filter((s): s is GoogleService => ALL_SERVICES.includes(s as GoogleService))
          )
        )

  if (services.length === 0) {
    return NextResponse.json({ error: 'invalid_service' }, { status: 400 })
  }

  const clientId = process.env.GOOGLE_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET
  if (!clientId || !clientSecret) {
    return NextResponse.redirect(
      new URL(withQuery(returnTo, 'google_error', 'not_configured'), req.url)
    )
  }

  const scope = ['openid', 'email', 'profile', ...scopesForServices(services)].join(' ')
  const signInUrl = new URL('/login', req.url)
  signInUrl.searchParams.set(
    'callbackUrl',
    withQuery(returnTo, 'google_connected', services.join(',') || 'all')
  )
  signInUrl.searchParams.set('google', '1')
  signInUrl.searchParams.set('googleScope', scope)
  return NextResponse.redirect(signInUrl)
}

function safeReturnTo(value: string | null): string | null {
  if (!value || !value.startsWith('/')) return null
  if (value.startsWith('//')) return null
  return value
}

function withQuery(path: string, key: string, value: string): string {
  const url = new URL(path, 'http://local')
  url.searchParams.set(key, value)
  return `${url.pathname}${url.search}`
}
