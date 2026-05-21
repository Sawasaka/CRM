import { NextResponse } from 'next/server'
import { getAppBaseUrl } from '@/lib/app-url'
import { resolveGoogleIntegrationUserId } from '@/lib/google/current-user'
import { upsertNotionAccount } from '@/lib/notion/account-store'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type NotionTokenResponse = {
  access_token?: string
  refresh_token?: string
  bot_id?: string
  workspace_id?: string
  workspace_name?: string
  owner?: unknown
  error?: string
  message?: string
}

export async function GET(req: Request) {
  const userId = await resolveGoogleIntegrationUserId()
  if (!userId) return NextResponse.redirect(new URL('/login', req.url))

  const url = new URL(req.url)
  const error = url.searchParams.get('error')
  if (error) {
    return NextResponse.redirect(new URL(`/settings/integrations?notion_error=${error}`, req.url))
  }

  const code = url.searchParams.get('code')
  const state = url.searchParams.get('state')
  const cookies = parseCookies(req.headers.get('cookie'))
  if (!code || !state || state !== cookies.notion_install_state) {
    return NextResponse.redirect(
      new URL('/settings/integrations?notion_error=invalid_state', req.url)
    )
  }

  const clientId = process.env.NOTION_CLIENT_ID
  const clientSecret = process.env.NOTION_CLIENT_SECRET
  if (!clientId || !clientSecret) {
    return NextResponse.redirect(
      new URL('/settings/integrations?notion_error=not_configured', req.url)
    )
  }

  const redirectUri = `${getAppBaseUrl()}/api/notion/oauth-callback`
  const tokenResp = await fetch('https://api.notion.com/v1/oauth/token', {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
    },
    body: JSON.stringify({
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
    }),
  })
  const token = (await tokenResp.json().catch(() => ({}))) as NotionTokenResponse
  if (!tokenResp.ok || !token.access_token) {
    console.error('[notion oauth callback] token exchange failed', token)
    return NextResponse.redirect(
      new URL('/settings/integrations?notion_error=token_exchange_failed', req.url)
    )
  }

  await upsertNotionAccount({
    userId,
    workspaceId: token.workspace_id ?? null,
    workspaceName: token.workspace_name ?? null,
    botId: token.bot_id ?? null,
    accessToken: token.access_token,
    refreshToken: token.refresh_token ?? null,
    owner: token.owner ?? null,
  })

  const res = NextResponse.redirect(new URL('/settings/integrations?notion=connected', req.url))
  res.cookies.delete('notion_install_state')
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
