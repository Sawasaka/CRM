import { NextResponse } from 'next/server'
import { resolveGoogleIntegrationUserId } from '@/lib/google/current-user'
import { getNotionAccountSnapshot } from '@/lib/notion/account-store'
import { getAppBaseUrl } from '@/lib/app-url'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  const userId = await resolveGoogleIntegrationUserId()
  if (!userId) {
    return NextResponse.json({
      connected: false,
      configured: isConfigured(),
      callbackUrl: `${getAppBaseUrl()}/api/notion/oauth-callback`,
    })
  }

  const account = await getNotionAccountSnapshot(userId)
  return NextResponse.json({
    connected: !!account,
    configured: isConfigured(),
    callbackUrl: `${getAppBaseUrl()}/api/notion/oauth-callback`,
    workspaceName: account?.workspaceName ?? null,
    workspaceId: account?.workspaceId ?? null,
    enabled: account?.enabled ?? false,
    lastSyncAt: account?.lastSyncAt ?? null,
    tokenSource: process.env.NOTION_TOKEN || process.env.NOTION_API_KEY ? 'env' : 'oauth',
  })
}

function isConfigured() {
  return !!(
    process.env.NOTION_TOKEN ||
    process.env.NOTION_API_KEY ||
    (process.env.NOTION_CLIENT_ID && process.env.NOTION_CLIENT_SECRET)
  )
}
