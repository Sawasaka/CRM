import { NextResponse } from 'next/server'
import { resolveGoogleIntegrationUserId } from '@/lib/google/current-user'
import { disconnectNotionAccount } from '@/lib/notion/account-store'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST() {
  const userId = await resolveGoogleIntegrationUserId()
  if (!userId) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  if (process.env.NOTION_TOKEN || process.env.NOTION_API_KEY) {
    return NextResponse.json(
      { error: 'env_token_configured', message: '環境変数でNotionトークンが設定されています。' },
      { status: 409 }
    )
  }

  await disconnectNotionAccount(userId)
  return NextResponse.json({ ok: true })
}
