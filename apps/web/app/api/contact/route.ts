import { NextResponse } from 'next/server'
import { prisma } from '@bgm/db'
import { createAiCallMetadata } from '@/lib/ai-calls/provider'
import { buildInquiryCallScript, getInquiryCallScenario } from '@/lib/ai-calls/call-scenario'
import { getDefaultMasterOrgId } from '@/lib/app-context'

/**
 * LP のお問い合わせフォーム送信先。
 *
 * - 入力は { company, name, phone, email, message } を期待
 * - 送信先: h.sawasaka@rookiesmart.jp (CONTACT_INBOX で上書き可能)
 * - 実際の送信は Resend を使用。
 */

const CONTACT_INBOX = process.env.CONTACT_INBOX ?? 'h.sawasaka@rookiesmart.jp'
const FROM_ADDRESS = process.env.CONTACT_FROM
const DEFAULT_BOOKING_URL = 'https://calendar.app.google/ynf4EmUoZEEKjuja8'

interface ContactPayload {
  company: string
  name: string
  email: string
  phone: string
  message: string
  consentToAiCall?: boolean
  source?: string
  redirectTo?: string
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
  const phone = typeof b.phone === 'string' ? b.phone.trim().slice(0, 40) : ''
  const message = typeof b.message === 'string' ? b.message.trim().slice(0, 4000) : ''
  const consentToAiCall = b.consentToAiCall === true
  const source = typeof b.source === 'string' ? b.source.trim().slice(0, 120) : undefined
  const redirectTo =
    typeof b.redirectTo === 'string' ? b.redirectTo.trim().slice(0, 500) : undefined
  if (!company || !name || !phone || !email) return null
  // ざっくりメール形式チェック
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return null
  if ((source || redirectTo) && (!phone || !consentToAiCall)) return null
  return {
    company,
    name,
    email,
    phone,
    message,
    consentToAiCall,
    source,
    redirectTo,
  }
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
  const subject = `【FDE CRM】お問い合わせ — ${p.company} / ${p.name}`
  const text = [
    'FDE CRM LP のお問い合わせフォームから連絡がありました。',
    '',
    `■ 会社名: ${p.company}`,
    `■ 氏名:   ${p.name}`,
    `■ メール: ${p.email}`,
    `■ 電話:   ${p.phone || '（未入力）'}`,
    `■ 送信元: ${p.source || 'LPフォーム'}`,
    `■ AI架電同意: ${p.consentToAiCall ? 'あり' : 'なし'}`,
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
      <p>FDE CRM LP のお問い合わせフォームから連絡がありました。</p>
      <table style="border-collapse:collapse;margin-top:12px;">
        <tr><td style="padding:4px 12px 4px 0;color:#7e7c83;">会社名</td><td>${escapeHtml(p.company)}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#7e7c83;">氏名</td><td>${escapeHtml(p.name)}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#7e7c83;">メール</td><td><a href="mailto:${escapeHtml(p.email)}">${escapeHtml(p.email)}</a></td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#7e7c83;">電話</td><td>${escapeHtml(p.phone || '（未入力）')}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#7e7c83;">送信元</td><td>${escapeHtml(p.source || 'LPフォーム')}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#7e7c83;">AI架電同意</td><td>${p.consentToAiCall ? 'あり' : 'なし'}</td></tr>
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
  const aiCall = await maybeStartContactAiCall(payload)
  const redirectTo = safeRedirectUrl(payload.redirectTo) ?? DEFAULT_BOOKING_URL

  if (!apiKey || !FROM_ADDRESS) {
    console.warn('[contact] mail env missing. Inquiry was not delivered.', {
      hasApiKey: Boolean(apiKey),
      hasFrom: Boolean(FROM_ADDRESS),
      payload,
      context,
    })
    if (process.env.NODE_ENV !== 'production') {
      return NextResponse.json({ ok: true, delivered: false, aiCall, redirectTo })
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
    return NextResponse.json({ ok: true, delivered: true, aiCall, redirectTo })
  } catch (e) {
    console.error('[contact] send exception:', e)
    return NextResponse.json({ error: 'send failed' }, { status: 502 })
  }
}

async function maybeStartContactAiCall(payload: ContactPayload) {
  if (
    process.env.CONTACT_AI_CALL_ENABLED !== 'true' ||
    !payload.phone ||
    !payload.consentToAiCall
  ) {
    return {
      started: false,
      reason: !payload.phone
        ? 'phone_missing'
        : !payload.consentToAiCall
          ? 'consent_missing'
          : 'disabled',
    }
  }

  try {
    const orgId = await getDefaultMasterOrgId()
    if (!orgId) return { started: false, reason: 'org_missing' }

    const user = await prisma.user.findFirst({
      where: { orgId },
      orderBy: { createdAt: 'asc' },
      select: { id: true },
    })
    if (!user) return { started: false, reason: 'user_missing' }

    const company =
      (await prisma.company.findFirst({
        where: { orgId, name: payload.company },
        select: { id: true },
      })) ??
      (await prisma.company.create({
        data: {
          orgId,
          name: payload.company,
          ownerId: user.id,
          leadSource: 'HP_INQUIRY',
          leadScore: 50,
          leadRank: 'S',
        },
        select: { id: true },
      }))

    const contact =
      (await prisma.contact.findFirst({
        where: { orgId, companyId: company.id, email: payload.email },
        select: { id: true },
      })) ??
      (await prisma.contact.create({
        data: {
          orgId,
          companyId: company.id,
          name: payload.name,
          email: payload.email,
          phone: payload.phone,
          isOwnerId: user.id,
        },
        select: { id: true },
      }))

    const scenario = await getInquiryCallScenario(orgId)
    const metadata = await createAiCallMetadata({
      target: {
        contactId: contact.id,
        companyId: company.id,
        contactName: payload.name,
        companyName: payload.company,
        phone: payload.phone,
      },
      purpose: 'HP問い合わせ後の即時フォロー',
      script: [
        buildInquiryCallScript(scenario),
        '',
        '問い合わせフォーム入力:',
        `- 氏名: ${payload.name}`,
        `- メール: ${payload.email}`,
        `- 会社名: ${payload.company}`,
        `- 電話番号: ${payload.phone}`,
        `- 相談内容: ${payload.message || '未入力'}`,
      ].join('\n'),
    })

    await prisma.activity.create({
      data: {
        orgId,
        contactId: contact.id,
        companyId: company.id,
        userId: user.id,
        type: 'CALL',
        title: metadata.status === 'failed' ? 'AIコール開始エラー' : 'AIコール発信開始',
        content: metadata.summary,
        metadata,
      },
    })

    return {
      started: metadata.status !== 'failed',
      status: metadata.status,
      provider: metadata.provider,
      callId: metadata.callId,
      externalCallId: metadata.externalCallId,
    }
  } catch (error) {
    console.error('[contact] ai call exception:', error)
    return { started: false, reason: 'exception' }
  }
}

function safeRedirectUrl(value?: string) {
  if (!value) return null
  try {
    const url = new URL(value)
    if (url.protocol !== 'https:') return null
    if (!['calendar.app.google', 'calendar.google.com'].includes(url.hostname)) return null
    return url.toString()
  } catch {
    return null
  }
}
