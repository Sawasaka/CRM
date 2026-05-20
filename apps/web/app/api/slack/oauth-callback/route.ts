import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getAppBaseUrl } from '@/lib/app-url'
import { prisma } from '@bgm/db'
import { slack } from '@/lib/slack/client'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * Slack OAuth コールバック。
 * GET /api/slack/oauth-callback?code=...&state=...
 */
export async function GET(req: Request) {
  const session = await auth()
  const userId = (session as unknown as { userId?: string })?.userId
  if (!userId) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  const url = new URL(req.url)
  const code = url.searchParams.get('code')
  const state = url.searchParams.get('state')
  const cookieState = req.headers
    .get('cookie')
    ?.split('; ')
    .find((c) => c.startsWith('slack_oauth_state='))
    ?.split('=')[1]

  if (!code || !state || state !== cookieState) {
    return NextResponse.redirect(
      new URL('/settings/integrations?slack_error=invalid_state', req.url)
    )
  }

  const clientId = process.env.SLACK_CLIENT_ID
  const clientSecret = process.env.SLACK_CLIENT_SECRET
  if (!clientId || !clientSecret) {
    return NextResponse.redirect(
      new URL('/settings/integrations?slack_error=not_configured', req.url)
    )
  }

  const redirectUri = `${getAppBaseUrl()}/api/slack/oauth-callback`

  try {
    const result = await slack.oauthV2Access({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      redirect_uri: redirectUri,
    })

    if (!result.access_token || !result.team?.id) {
      return NextResponse.redirect(
        new URL('/settings/integrations?slack_error=missing_token', req.url)
      )
    }

    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) {
      return NextResponse.redirect(new URL('/login', req.url))
    }

    await prisma.slackWorkspace.upsert({
      where: { orgId_teamId: { orgId: user.orgId, teamId: result.team.id } },
      create: {
        orgId: user.orgId,
        installerUserId: userId,
        teamId: result.team.id,
        teamName: result.team.name ?? '',
        enterpriseId: result.enterprise?.id ?? null,
        botToken: result.access_token,
        botUserId: result.bot_user_id ?? null,
        userToken: result.authed_user?.access_token ?? null,
        scope: result.scope ?? null,
      },
      update: {
        installerUserId: userId,
        teamName: result.team.name ?? '',
        enterpriseId: result.enterprise?.id ?? null,
        botToken: result.access_token,
        botUserId: result.bot_user_id ?? null,
        userToken: result.authed_user?.access_token ?? null,
        scope: result.scope ?? null,
        enabled: true,
      },
    })

    return NextResponse.redirect(new URL('/settings/integrations?slack=connected', req.url))
  } catch (e) {
    console.error('[slack oauth callback]', e)
    return NextResponse.redirect(
      new URL('/settings/integrations?slack_error=exchange_failed', req.url)
    )
  }
}
