import { NextResponse } from 'next/server'

/**
 * LP のお問い合わせフォーム送信先。
 *
 * - 入力は { company, name, email, message } を期待
 * - 送信先: h.sawasaka@rookiesmart.jp (CONTACT_INBOX で上書き可能)
 * - 実際の送信は Resend を使用。
 */

const CONTACT_INBOX = process.env.CONTACT_INBOX ?? 'h.sawasaka@rookiesmart.jp'
const FROM_ADDRESS = process.env.CONTACT_FROM

interface ContactPayload {
  company: string
  name: string
  email: string
  message: string
}

interface RequestContext {
  submittedAt: string
  referer: string
  userAgent: string
  ipAddress: string
}

function validate(body: unknown): ContactPayload | null {
  if (!body || typeof body !== 'object') return null
  const b = body as Record<string, unknown>
  const company = typeof b.company === 'string' ? b.company.trim().slice(0, 120) : ''
  const name = typeof b.name === 'string' ? b.name.trim().slice(0, 80) : ''
  const email = typeof b.email === 'string' ? b.email.trim().slice(0, 160) : ''
  const message = typeof b.message === 'string' ? b.message.trim().slice(0, 4000) : ''
  if (!company || !name || !email) return null
  // ざっくりメール形式チェック
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return null
  return { company, name, email, message }
}

function buildContext(req: Request): RequestContext {
  const forwardedFor = req.headers.get('x-forwarded-for') ?? ''
  return {
    submittedAt: new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' }),
    referer: req.headers.get('referer') ?? 'unknown',
    userAgent: req.headers.get('user-agent') ?? 'unknown',
    ipAddress: forwardedFor.split(',')[0]?.trim() || 'unknown',
  }
}

function buildEmail(p: ContactPayload, context: RequestContext) {
  const subject = `【ルキスマCRM】お問い合わせ — ${p.company} / ${p.name}`
  const text = [
    'ルキスマCRM LP のお問い合わせフォームから連絡がありました。',
    '',
    `■ 会社名: ${p.company}`,
    `■ 氏名:   ${p.name}`,
    `■ メール: ${p.email}`,
    `■ 送信日時: ${context.submittedAt}`,
    `■ 送信ページ: ${context.referer}`,
    `■ IP: ${context.ipAddress}`,
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
        <tr><td style="padding:4px 12px 4px 0;color:#7e7c83;">メール</td><td><a href="mailto:${escapeHtml(p.email)}">${escapeHtml(p.email)}</a></td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#7e7c83;">送信日時</td><td>${escapeHtml(context.submittedAt)}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#7e7c83;">送信ページ</td><td>${escapeHtml(context.referer)}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#7e7c83;">IP</td><td>${escapeHtml(context.ipAddress)}</td></tr>
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

  const context = buildContext(req)
  const { subject, text, html } = buildEmail(payload, context)
  const apiKey = process.env.RESEND_API_KEY

  if (!apiKey || !FROM_ADDRESS) {
    console.warn('[contact] mail env missing. Inquiry was not delivered.', {
      hasApiKey: Boolean(apiKey),
      hasFrom: Boolean(FROM_ADDRESS),
      payload,
      context,
    })
    if (process.env.NODE_ENV !== 'production') {
      return NextResponse.json({ ok: true, delivered: false })
    }
    return NextResponse.json(
      { error: '送信設定が未完了です。時間を置いて再度お試しください。' },
      { status: 503 }
    )
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
