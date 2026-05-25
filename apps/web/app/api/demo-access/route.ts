import { NextResponse } from 'next/server'
import { buildDemoToken, DEMO_CREDITS_DEFAULT } from '@/lib/demo-token'

/**
 * 無料デモアクセスのリンク発行API。
 *
 * 入力: { company, name, email }
 * 動作:
 *   1) 入力をバリデート
 *   2) 30分後 expiresAt を埋め込んだ署名付きトークンを生成 (lib/demo-token)
 *   3) /demo-app?t=<token> URL を返却(クライアントで window.open する)
 *   4) 同時にリード情報をログ + 可能なら h.sawasaka@rookiesmart.jp に通知メール送信
 */

const NOTIFY_INBOX = 'h.sawasaka@rookiesmart.jp'
const FROM_ADDRESS = process.env.CONTACT_FROM ?? 'noreply@rookiesmart.jp'

interface DemoPayload {
  company: string
  name: string
  email: string
}

function validate(body: unknown): DemoPayload | null {
  if (!body || typeof body !== 'object') return null
  const b = body as Record<string, unknown>
  const company = typeof b.company === 'string' ? b.company.trim() : ''
  const name = typeof b.name === 'string' ? b.name.trim() : ''
  const email = typeof b.email === 'string' ? b.email.trim() : ''
  if (!company || !name || !email) return null
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return null
  return { company, name, email }
}

async function notifyOwner(p: DemoPayload, sessionId: string, expiresAt: number) {
  const apiKey = process.env.RESEND_API_KEY
  const subject = `【ルキスマCRM】無料デモ発行: ${p.company} / ${p.name}`
  const lines = [
    'ルキスマCRM LP のヘッダから無料デモが発行されました。',
    '',
    `■ 会社名: ${p.company}`,
    `■ 氏名:   ${p.name}`,
    `■ メール: ${p.email}`,
    `■ セッションID: ${sessionId}`,
    `■ クレジット: ${DEMO_CREDITS_DEFAULT}`,
    `■ 有効期限: ${new Date(expiresAt).toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' })} (30分)`,
  ]
  if (!apiKey) {
    console.warn('[demo-access] RESEND_API_KEY 未設定。リードをログのみ記録します。')
    console.log('[demo-access] lead:', { ...p, sessionId, expiresAt })
    return
  }
  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM_ADDRESS,
        to: [NOTIFY_INBOX],
        reply_to: p.email,
        subject,
        text: lines.join('\n'),
      }),
    })
  } catch (e) {
    console.error('[demo-access] notify exception:', e)
  }
}

export async function POST(req: Request) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'invalid json' }, { status: 400 })
  }
  const payload = validate(body)
  if (!payload) {
    return NextResponse.json({ error: '必須項目を入力してください' }, { status: 400 })
  }

  const { token, claims } = await buildDemoToken(payload)
  notifyOwner(payload, claims.sessionId, claims.expiresAt).catch((e) =>
    console.error('[demo-access] notifyOwner unhandled:', e),
  )

  // 発行 URL は /demo-app に直接飛ばす(welcome /demo は廃止)
  const demoUrl = `/demo-app?t=${encodeURIComponent(token)}`
  return NextResponse.json({
    ok: true,
    url: demoUrl,
    sessionId: claims.sessionId,
    credits: claims.credits,
    expiresAt: claims.expiresAt,
  })
}
