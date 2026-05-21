import { NextResponse } from 'next/server'
import { resolveGoogleIntegrationUserId } from '@/lib/google/current-user'
import { NotionNotConnectedError, syncNotionTranscriptsForUser } from '@/lib/notion/sync'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  const userId = await resolveGoogleIntegrationUserId()
  if (!userId) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const body = (await req.json().catch(() => ({}))) as {
    query?: string
    dealId?: string
    maxPages?: number
  }

  try {
    const result = await syncNotionTranscriptsForUser(userId, body)
    return NextResponse.json({ ok: true, ...result })
  } catch (error) {
    if (error instanceof NotionNotConnectedError) {
      return NextResponse.json(
        {
          error: 'notion_not_connected',
          installUrl: '/api/notion/install',
          message: 'Notion連携が必要です。',
        },
        { status: 412 }
      )
    }
    console.error('[notion/sync]', error)
    return NextResponse.json(
      { error: 'notion_sync_failed', message: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
