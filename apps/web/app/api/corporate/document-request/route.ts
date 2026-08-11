import { NextResponse } from 'next/server'
import { CORPORATE_CONSULTATION_BOOKING_URL } from '@/lib/consultation-calendar'

const CONTACT_INBOX = process.env.CONTACT_INBOX ?? 'h.sawasaka@rookiesmart.jp'
const FROM_ADDRESS = process.env.CONTACT_FROM
const DOCUMENTS = {
  gtm: {
    label: 'Sales-led GTM × Wedgeモデル',
    url: '/downloads/sales-led-gtm-wedge-model.pdf',
  },
  marketing: {
    label: 'ベイズ × バンディット戦略',
    url: '/downloads/bayesian-bandit-strategy-framework.pdf',
  },
} as const

type DocumentType = keyof typeof DOCUMENTS

type DocumentRequest = {
  company: string
  name: string
  email: string
  website: string
  documentType: DocumentType
}

function validate(body: unknown): DocumentRequest | null {
  if (!body || typeof body !== 'object') return null
  const value = body as Record<string, unknown>
  const company = typeof value.company === 'string' ? value.company.trim().slice(0, 120) : ''
  const name = typeof value.name === 'string' ? value.name.trim().slice(0, 80) : ''
  const email = typeof value.email === 'string' ? value.email.trim().slice(0, 160) : ''
  const website = typeof value.website === 'string' ? value.website.trim().slice(0, 200) : ''
  const documentType = value.documentType === 'gtm' || value.documentType === 'marketing'
    ? value.documentType
    : null

  if (!company || !name || !email || !documentType) return null
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return null
  return { company, name, email, website, documentType }
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: '入力内容を確認してください。' }, { status: 400 })
  }

  const payload = validate(body)
  if (!payload) {
    return NextResponse.json({ error: 'すべての項目を入力してください。' }, { status: 400 })
  }
  const selectedDocument = DOCUMENTS[payload.documentType]

  if (payload.website) {
    return NextResponse.json({
      ok: true,
      delivered: false,
      downloadUrl: selectedDocument.url,
      redirectTo: CORPORATE_CONSULTATION_BOOKING_URL,
    })
  }

  const submittedAt = new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' })
  const referer = request.headers.get('referer') ?? 'unknown'
  const subject = `【ルーキースマートジャパン】資料ダウンロード — ${payload.company} / ${payload.name}`
  const text = [
    'コーポレートサイトから資料ダウンロードがありました。',
    '',
    `■ 資料: ${selectedDocument.label}`,
    `■ 会社名: ${payload.company}`,
    `■ 氏名: ${payload.name}`,
    `■ メールアドレス: ${payload.email}`,
    `■ 送信日時: ${submittedAt}`,
    `■ 送信ページ: ${referer}`,
  ].join('\n')
  const html = `
    <div style="font-family:-apple-system,BlinkMacSystemFont,'Helvetica Neue',sans-serif;font-size:14px;line-height:1.7;color:#19384d;">
      <h2 style="font-size:18px;color:#0d3551;">資料ダウンロードを受け付けました</h2>
      <p>コーポレートサイトから「${escapeHtml(selectedDocument.label)}」の資料ダウンロードがありました。</p>
      <table style="border-collapse:collapse;margin-top:16px;">
        <tr><td style="padding:5px 16px 5px 0;color:#6b8797;">会社名</td><td>${escapeHtml(payload.company)}</td></tr>
        <tr><td style="padding:5px 16px 5px 0;color:#6b8797;">氏名</td><td>${escapeHtml(payload.name)}</td></tr>
        <tr><td style="padding:5px 16px 5px 0;color:#6b8797;">メール</td><td><a href="mailto:${escapeHtml(payload.email)}">${escapeHtml(payload.email)}</a></td></tr>
        <tr><td style="padding:5px 16px 5px 0;color:#6b8797;">送信日時</td><td>${escapeHtml(submittedAt)}</td></tr>
        <tr><td style="padding:5px 16px 5px 0;color:#6b8797;">送信ページ</td><td>${escapeHtml(referer)}</td></tr>
      </table>
    </div>
  `

  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey || !FROM_ADDRESS) {
    console.warn('[corporate-document-request] mail env missing', {
      hasApiKey: Boolean(apiKey),
      hasFrom: Boolean(FROM_ADDRESS),
      company: payload.company,
      name: payload.name,
    })
    if (process.env.NODE_ENV !== 'production') {
      return NextResponse.json({
        ok: true,
        delivered: false,
        downloadUrl: selectedDocument.url,
        redirectTo: CORPORATE_CONSULTATION_BOOKING_URL,
      })
    }
    return NextResponse.json(
      { error: '送信設定が未完了です。時間を置いて再度お試しください。' },
      { status: 503 }
    )
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
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

    if (!response.ok) {
      const detail = await response.text().catch(() => '')
      console.error('[corporate-document-request] Resend error', response.status, detail)
      return NextResponse.json({ error: '送信に失敗しました。' }, { status: 502 })
    }

    return NextResponse.json({
      ok: true,
      delivered: true,
      downloadUrl: selectedDocument.url,
      redirectTo: CORPORATE_CONSULTATION_BOOKING_URL,
    })
  } catch (error) {
    console.error('[corporate-document-request] send exception', error)
    return NextResponse.json({ error: '送信に失敗しました。' }, { status: 502 })
  }
}
