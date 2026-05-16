import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { sendIndividualMail } from '@/lib/google/gmail-send'
import { GoogleAccountNotConnectedError } from '@/lib/google/oauth'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * リスト一斉配信 (実体は 1 通ずつ個別送信)。
 * To に 1 アドレスのみ入るため、受信者間で他の宛先は見えない。
 *
 * Body: {
 *   subject, body,
 *   recipients: string[],   // 宛先メールアドレス配列
 *   attachmentLinks?: string[],
 *   fromName?: string,
 *   campaignName?: string,  // 監査ログ用
 * }
 */
export async function POST(req: Request) {
  const session = await auth()
  const userId = (session as unknown as { userId?: string })?.userId
  if (!userId) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  try {
    const payload = (await req.json()) as {
      subject?: string
      body?: string
      recipients?: string[]
      links?: { kind: 'homepage' | 'schedule' | 'doc' | 'other'; label: string; trackingUrl: string }[]
      fromName?: string
      campaignName?: string
      listId?: string
    }

    if (!payload.subject || !payload.body) {
      return NextResponse.json({ error: 'subject and body are required' }, { status: 400 })
    }
    const recipients = (payload.recipients ?? []).filter((r) => r && r.includes('@'))
    if (recipients.length === 0) {
      return NextResponse.json({ error: 'no recipients' }, { status: 400 })
    }
    if (recipients.length > 500) {
      return NextResponse.json({ error: 'too_many_recipients', limit: 500 }, { status: 413 })
    }

    const sentIds: string[] = []
    const failed: { to: string; reason: string }[] = []

    // 1 通ずつ個別送信。Gmail のレート制限を考慮し、軽いインターバルを挟む。
    for (const to of recipients) {
      try {
        const r = await sendIndividualMail(userId, {
          to,
          subject: payload.subject,
          body: payload.body,
          links: payload.links,
          fromName: payload.fromName,
        })
        sentIds.push(r.id)
        // 100ms 待機 (1日あたり Workspace 2,000 / 無料 500 通の制限内に収まるよう緩和)
        await new Promise((resolve) => setTimeout(resolve, 100))
      } catch (err) {
        failed.push({ to, reason: err instanceof Error ? err.message : String(err) })
      }
    }

    return NextResponse.json({
      ok: true,
      total: recipients.length,
      sent: sentIds.length,
      failed,
      campaignName: payload.campaignName ?? null,
    })
  } catch (e) {
    if (e instanceof GoogleAccountNotConnectedError) {
      return NextResponse.json({ error: 'google_not_connected' }, { status: 412 })
    }
    console.error('[mail/send-bulk]', e)
    return NextResponse.json(
      { error: 'send_failed', message: e instanceof Error ? e.message : String(e) },
      { status: 500 },
    )
  }
}
