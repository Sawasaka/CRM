import { NextResponse } from 'next/server'
import { prisma } from '@bgm/db'
import { getAppBaseUrl } from '@/lib/app-url'
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

const NOTIFY_INBOX =
  process.env.DEMO_NOTIFY_INBOX ?? process.env.CONTACT_INBOX ?? 'h.sawasaka@rookiesmart.jp'
const FROM_ADDRESS = process.env.CONTACT_FROM ?? 'ルキスマCRM <noreply@rookiesmart-jp.com>'

interface DemoPayload {
  tenant?: string
  company: string
  name: string
  email: string
}

interface RequestContext {
  issuedAt: string
  referer: string
  ipAddress: string
}

function validate(body: unknown): DemoPayload | null {
  if (!body || typeof body !== 'object') return null
  const b = body as Record<string, unknown>
  const company = typeof b.company === 'string' ? b.company.trim().slice(0, 120) : ''
  const name = typeof b.name === 'string' ? b.name.trim().slice(0, 80) : ''
  const email = typeof b.email === 'string' ? b.email.trim().slice(0, 160) : ''
  const tenant = typeof b.tenant === 'string' ? b.tenant.trim().toLowerCase().slice(0, 80) : ''
  if (!company || !name || !email) return null
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return null
  if (tenant && !/^[a-z0-9-]+$/.test(tenant)) return null
  return { tenant: tenant || undefined, company, name, email }
}

function buildContext(req: Request): RequestContext {
  const forwardedFor = req.headers.get('x-forwarded-for') ?? ''
  return {
    issuedAt: new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' }),
    referer: req.headers.get('referer') ?? 'unknown',
    ipAddress: forwardedFor.split(',')[0]?.trim() || 'unknown',
  }
}

function getAbsoluteDemoUrl(req: Request, demoPath: string) {
  const origin = req.headers.get('origin')
  const baseUrl = origin && /^https?:\/\//.test(origin) ? origin : getAppBaseUrl()
  return new URL(demoPath, baseUrl).toString()
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function buildEmail(
  p: DemoPayload,
  context: RequestContext,
  sessionId: string,
  expiresAt: number,
  demoUrl: string
) {
  const expiresAtText = new Date(expiresAt).toLocaleString('ja-JP', {
    timeZone: 'Asia/Tokyo',
  })
  const subject = `【ルキスマCRM】無料デモ発行: ${p.company} / ${p.name}`
  const text = [
    'ルキスマCRM LP から無料デモURLが発行されました。',
    '',
    `■ 会社名: ${p.company}`,
    p.tenant ? `■ テナント: ${p.tenant}` : null,
    `■ 氏名:   ${p.name}`,
    `■ メール: ${p.email}`,
    `■ 発行日時: ${context.issuedAt}`,
    `■ 有効期限: ${expiresAtText} (30分)`,
    `■ セッションID: ${sessionId}`,
    `■ クレジット: ${DEMO_CREDITS_DEFAULT}`,
    `■ 発行URL: ${demoUrl}`,
    `■ 発行ページ: ${context.referer}`,
    `■ IP: ${context.ipAddress}`,
  ]
    .filter(Boolean)
    .join('\n')
  const html = `
    <div style="font-family:-apple-system,BlinkMacSystemFont,'Helvetica Neue',sans-serif;font-size:14px;line-height:1.7;color:#1a1a1c;">
      <p>ルキスマCRM LP から無料デモURLが発行されました。</p>
      <table style="border-collapse:collapse;margin-top:12px;">
        <tr><td style="padding:4px 12px 4px 0;color:#7e7c83;">会社名</td><td>${escapeHtml(p.company)}</td></tr>
        ${
          p.tenant
            ? `<tr><td style="padding:4px 12px 4px 0;color:#7e7c83;">テナント</td><td>${escapeHtml(p.tenant)}</td></tr>`
            : ''
        }
        <tr><td style="padding:4px 12px 4px 0;color:#7e7c83;">氏名</td><td>${escapeHtml(p.name)}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#7e7c83;">メール</td><td><a href="mailto:${escapeHtml(p.email)}">${escapeHtml(p.email)}</a></td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#7e7c83;">発行日時</td><td>${escapeHtml(context.issuedAt)}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#7e7c83;">有効期限</td><td>${escapeHtml(expiresAtText)} (30分)</td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#7e7c83;">セッションID</td><td>${escapeHtml(sessionId)}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#7e7c83;">クレジット</td><td>${DEMO_CREDITS_DEFAULT}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#7e7c83;">発行ページ</td><td>${escapeHtml(context.referer)}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#7e7c83;">IP</td><td>${escapeHtml(context.ipAddress)}</td></tr>
      </table>
      <p style="margin-top:18px;">
        <a href="${escapeHtml(demoUrl)}" style="display:inline-block;background:#0f6fff;color:#fff;text-decoration:none;padding:10px 14px;border-radius:8px;font-weight:700;">発行されたデモを開く</a>
      </p>
      <p style="font-size:12px;color:#7e7c83;word-break:break-all;">${escapeHtml(demoUrl)}</p>
    </div>
  `
  return { subject, text, html }
}

async function notifyOwner(
  p: DemoPayload,
  context: RequestContext,
  sessionId: string,
  expiresAt: number,
  demoUrl: string
) {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    console.warn('[demo-access] RESEND_API_KEY 未設定。リードをログのみ記録します。')
    console.log('[demo-access] lead:', { ...p, sessionId, expiresAt, demoUrl })
    return false
  }
  try {
    const { subject, text, html } = buildEmail(p, context, sessionId, expiresAt, demoUrl)
    const res = await fetch('https://api.resend.com/emails', {
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
        text,
        html,
      }),
    })
    if (!res.ok) {
      const detail = await res.text().catch(() => '')
      console.error('[demo-access] Resend error', res.status, detail)
      return false
    }
    return true
  } catch (e) {
    console.error('[demo-access] notify exception:', e)
    return false
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

  if (payload.tenant) {
    const org = await prisma.organization.findUnique({
      where: { slug: payload.tenant },
      select: { id: true, name: true, slug: true, plan: true },
    })
    if (!org || org.slug === 'default' || org.plan !== 'FREE') {
      return NextResponse.json({ error: 'デモリンクが無効です' }, { status: 404 })
    }
  }

  let token: string
  let claims: Awaited<ReturnType<typeof buildDemoToken>>['claims']
  try {
    const issued = await buildDemoToken({
      tenantSlug: payload.tenant,
      company: payload.company,
      name: payload.name,
      email: payload.email,
    })
    token = issued.token
    claims = issued.claims
  } catch (e) {
    console.error('[demo-access] token issue failed:', e)
    return NextResponse.json({ error: 'デモURLの発行に失敗しました' }, { status: 500 })
  }

  const context = buildContext(req)
  const demoUrl = `/demo-app?t=${encodeURIComponent(token)}`
  const absoluteDemoUrl = getAbsoluteDemoUrl(req, demoUrl)
  const notificationDelivered = await notifyOwner(
    payload,
    context,
    claims.sessionId,
    claims.expiresAt,
    absoluteDemoUrl
  )

  return NextResponse.json({
    ok: true,
    url: demoUrl,
    notificationDelivered,
    sessionId: claims.sessionId,
    credits: claims.credits,
    expiresAt: claims.expiresAt,
  })
}
