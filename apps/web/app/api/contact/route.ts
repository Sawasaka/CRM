import { NextResponse } from 'next/server'

/**
 * LP のお問い合わせフォーム送信先。
 *
 * - 入力は { company, name, title, email, message } を期待
 * - 送信先: h.sawasaka@rookiesmart.jp (CONTACT_INBOX)
 * - 実際の送信は Resend を使用。RESEND_API_KEY が未設定の環境では
 *   サーバーログに出力するだけにフォールバックして 200 を返す。
 *   (本番デプロイ前に RESEND_API_KEY + CONTACT_FROM を環境変数に入れる前提)
 */

const CONTACT_INBOX = 'h.sawasaka@rookiesmart.jp'
const FROM_ADDRESS = process.env.CONTACT_FROM ?? 'noreply@rookiesmart.jp'

interface ContactPayload {
  company: string
  name: string
  title: string
  email: string
  message: string
}

function validate(body: unknown): ContactPayload | null {
  if (!body || typeof body !== 'object') return null
  const b = body as Record<string, unknown>
  const company = typeof b.company === 'string' ? b.company.trim() : ''
  const name = typeof b.name === 'string' ? b.name.trim() : ''
  const title = typeof b.title === 'string' ? b.title.trim() : ''
  const email = typeof b.email === 'string' ? b.email.trim() : ''
  const message = typeof b.message === 'string' ? b.message.trim() : ''
  if (!company || !name || !email) return null
  // ざっくりメール形式チェック
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return null
  return { company, name, title, email, message }
}

function buildEmail(p: ContactPayload) {
  const subject = `【ルキスマCRM】お問い合わせ — ${p.company} / ${p.name}`
  const text = [
    'ルキスマCRM LP のお問い合わせフォームから連絡がありました。',
    '',
    `■ 会社名: ${p.company}`,
    `■ 氏名:   ${p.name}`,
    `■ 役職:   ${p.title || '（未記入）'}`,
    `■ メール: ${p.email}`,
    '',
    '── お伝え事項 ──────────────────',
    p.message || '（未記入）',
    '────────────────────────────',
  ].join('\n')
  const html = `
    <div style="font-family:-apple-system,BlinkMacSystemFont,'Helvetica Neue',sans-serif;font-size:14px;line-height:1.7;color:#1a1a1c;">
      <p>ルキスマCRM LP のお問い合わせフォームから連絡がありました。</p>
      <table style="border-collapse:collapse;margin-top:12px;">
        <tr><td style="padding:4px 12px 4px 0;color:#7e7c83;">会社名</td><td>${escapeHtml(p.company)}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#7e7c83;">氏名</td><td>${escapeHtml(p.name)}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#7e7c83;">役職</td><td>${escapeHtml(p.title || '（未記入）')}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#7e7c83;">メール</td><td><a href="mailto:${escapeHtml(p.email)}">${escapeHtml(p.email)}</a></td></tr>
      </table>
      <h4 style="margin:20px 0 6px;font-size:13px;">お伝え事項</h4>
      <pre style="white-space:pre-wrap;font-family:inherit;background:#f4f4f6;padding:12px;border-radius:8px;">${escapeHtml(p.message || '（未記入）')}</pre>
    </div>
  `
  return { subject, text, html }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
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

  const { subject, text, html } = buildEmail(payload)
  const apiKey = process.env.RESEND_API_KEY

  if (!apiKey) {
    // 環境変数未設定: ログだけ残して成功扱い (本番までに wire up)
    console.warn('[contact] RESEND_API_KEY 未設定。問い合わせをログのみで記録します。')
    console.log('[contact] payload:', payload)
    return NextResponse.json({ ok: true, delivered: false })
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM_ADDRESS,
        to: [CONTACT_INBOX],
        reply_to: payload.email,
        subject,
        text,
        html,
      }),
    })
    if (!res.ok) {
      const detail = await res.text().catch(() => '')
      console.error('[contact] Resend error', res.status, detail)
      return NextResponse.json({ error: 'send failed' }, { status: 502 })
    }
    return NextResponse.json({ ok: true, delivered: true })
  } catch (e) {
    console.error('[contact] send exception:', e)
    return NextResponse.json({ error: 'send failed' }, { status: 502 })
  }
}
