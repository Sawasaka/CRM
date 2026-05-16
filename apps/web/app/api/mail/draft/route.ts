import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { createDraftMail } from '@/lib/google/gmail-send'
import { GoogleAccountNotConnectedError } from '@/lib/google/oauth'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * Gmail 下書きを作成し、Gmail Web UI で開ける URL を返す。
 * 配信モーダル「Gmailで本文を確認」ボタンから呼ばれる想定。
 *
 * Body: { subject, body, attachmentLinks?[], testRecipient? }
 */
export async function POST(req: Request) {
  const session = await auth()
  const userId = (session as unknown as { userId?: string })?.userId
  if (!userId) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  try {
    const body = (await req.json()) as {
      subject?: string
      body?: string
      links?: { kind: 'homepage' | 'schedule' | 'doc' | 'other'; label: string; trackingUrl: string }[]
      testRecipient?: string
      fromName?: string
    }
    if (!body.subject || !body.body) {
      return NextResponse.json({ error: 'subject and body are required' }, { status: 400 })
    }
    const result = await createDraftMail(userId, {
      to: body.testRecipient ?? '',
      subject: body.subject,
      body: body.body,
      links: body.links,
      testRecipient: body.testRecipient,
      fromName: body.fromName,
    })
    return NextResponse.json({ ok: true, draftId: result.id, webUrl: result.webUrl })
  } catch (e) {
    if (e instanceof GoogleAccountNotConnectedError) {
      return NextResponse.json({ error: 'google_not_connected' }, { status: 412 })
    }
    console.error('[mail/draft]', e)
    return NextResponse.json(
      { error: 'draft_failed', message: e instanceof Error ? e.message : String(e) },
      { status: 500 },
    )
  }
}
