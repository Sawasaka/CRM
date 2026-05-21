import { NextResponse } from 'next/server'
import { getAppBaseUrl } from '@/lib/app-url'
import { prisma } from '@bgm/db'
import { resolveGoogleIntegrationUserId } from '@/lib/google/current-user'
import type { GoogleService } from '@/lib/google/scopes'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * Google OAuth コールバック（incremental authorization 後）。
 * GET /api/google/oauth-callback?code=...&state=...
 *
 * UserGoogleAccount にトークンと取得済みスコープを保存。
 * 機能別の有効化フラグも要求された service に基づいて ON にする。
 */
export async function GET(req: Request) {
  const userId = await resolveGoogleIntegrationUserId()
  if (!userId) return NextResponse.redirect(new URL('/login', req.url))

  const url = new URL(req.url)
  const code = url.searchParams.get('code')
  const state = url.searchParams.get('state')
  const cookies = parseCookies(req.headers.get('cookie'))
  if (!code || !state || state !== cookies['google_install_state']) {
    return NextResponse.redirect(
      new URL('/settings/integrations?google_error=invalid_state', req.url)
    )
  }

  const services = (cookies['google_install_services'] ?? '')
    .split(',')
    .filter(Boolean) as GoogleService[]

  const clientId = process.env.GOOGLE_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET
  if (!clientId || !clientSecret) {
    return NextResponse.redirect(
      new URL('/settings/integrations?google_error=not_configured', req.url)
    )
  }

  const redirectUri = `${getAppBaseUrl()}/api/google/oauth-callback`

  // code を access_token / refresh_token / id_token に交換
  const tokenResp = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    }),
  })
  const tokenJson = (await tokenResp.json()) as {
    access_token?: string
    refresh_token?: string
    id_token?: string
    expires_in?: number
    scope?: string
    error?: string
  }
  if (!tokenJson.access_token) {
    console.error('[google oauth callback] token exchange failed', tokenJson)
    return NextResponse.redirect(
      new URL('/settings/integrations?google_error=token_exchange_failed', req.url)
    )
  }

  // id_token から sub と email を抽出
  const profile = decodeIdToken(tokenJson.id_token)

  // 既存レコードのスコープを保持しつつ追記
  const existing = await prisma.userGoogleAccount.findUnique({ where: { userId } })
  const mergedScopes = mergeScopes(existing?.scope ?? null, tokenJson.scope ?? '')

  const enableFlags: Record<string, boolean> = {}
  for (const s of services) {
    enableFlags[`${s}Enabled`] = true
  }

  if (existing) {
    await prisma.userGoogleAccount.update({
      where: { userId },
      data: {
        // refresh_token は再認可で発行されないことがあるため、existing を優先
        accessToken: tokenJson.access_token,
        refreshToken: tokenJson.refresh_token ?? existing.refreshToken,
        expiresAt: tokenJson.expires_in ? new Date(Date.now() + tokenJson.expires_in * 1000) : null,
        scope: mergedScopes,
        ...enableFlags,
      },
    })
  } else {
    if (!tokenJson.refresh_token) {
      // 初回連携で refresh_token が出ないと致命的
      return NextResponse.redirect(
        new URL('/settings/integrations?google_error=no_refresh_token', req.url)
      )
    }
    await prisma.userGoogleAccount.create({
      data: {
        userId,
        googleSub: profile?.sub ?? '',
        email: profile?.email ?? '',
        accessToken: tokenJson.access_token,
        refreshToken: tokenJson.refresh_token,
        expiresAt: tokenJson.expires_in ? new Date(Date.now() + tokenJson.expires_in * 1000) : null,
        scope: mergedScopes,
        gmailEnabled: services.includes('gmail'),
        driveEnabled: services.includes('drive'),
        calendarEnabled: services.includes('calendar'),
        meetEnabled: services.includes('meet'),
        chatEnabled: services.includes('chat'),
      },
    })
  }

  // クッキーを掃除
  const res = NextResponse.redirect(
    new URL(`/settings/integrations?google_connected=${services.join(',') || 'all'}`, req.url)
  )
  res.cookies.delete('google_install_state')
  res.cookies.delete('google_install_services')
  return res
}

function parseCookies(header: string | null): Record<string, string> {
  const out: Record<string, string> = {}
  if (!header) return out
  for (const part of header.split('; ')) {
    const idx = part.indexOf('=')
    if (idx < 0) continue
    out[part.slice(0, idx)] = decodeURIComponent(part.slice(idx + 1))
  }
  return out
}

function mergeScopes(existing: string | null, incoming: string): string {
  const set = new Set<string>()
  if (existing) for (const s of existing.split(/\s+/)) if (s) set.add(s)
  for (const s of incoming.split(/\s+/)) if (s) set.add(s)
  return Array.from(set).join(' ')
}

function decodeIdToken(idToken: string | undefined): { sub?: string; email?: string } | null {
  if (!idToken) return null
  const parts = idToken.split('.')
  if (parts.length < 2) return null
  try {
    const payload = parts[1] ?? ''
    const padded = payload + '='.repeat((4 - (payload.length % 4)) % 4)
    const json = JSON.parse(
      Buffer.from(padded.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8')
    ) as { sub?: string; email?: string }
    return json
  } catch {
    return null
  }
}
