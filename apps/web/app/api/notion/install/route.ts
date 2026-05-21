import { NextResponse } from 'next/server'
import { getAppBaseUrl } from '@/lib/app-url'
import { resolveGoogleIntegrationUserId } from '@/lib/google/current-user'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  const userId = await resolveGoogleIntegrationUserId()
  if (!userId) {
    return NextResponse.redirect(new URL('/login?callbackUrl=/settings/integrations', req.url))
  }

  if (process.env.NOTION_TOKEN || process.env.NOTION_API_KEY) {
    return NextResponse.redirect(new URL('/settings/integrations?notion=connected', req.url))
  }

  const clientId = process.env.NOTION_CLIENT_ID
  const clientSecret = process.env.NOTION_CLIENT_SECRET
  if (!clientId || !clientSecret) {
    return NextResponse.redirect(
      new URL('/settings/integrations?notion_error=not_configured', req.url)
    )
  }

  const redirectUri = `${getAppBaseUrl()}/api/notion/oauth-callback`
  const state = crypto.randomUUID()
  const authUrl = new URL(process.env.NOTION_AUTH_URL ?? 'https://api.notion.com/v1/oauth/authorize')
  authUrl.searchParams.set('owner', 'user')
  authUrl.searchParams.set('client_id', clientId)
  authUrl.searchParams.set('redirect_uri', redirectUri)
  authUrl.searchParams.set('response_type', 'code')
  authUrl.searchParams.set('state', state)

  const res = NextResponse.redirect(authUrl.toString())
  res.cookies.set('notion_install_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 600,
    path: '/',
  })
  return res
}
