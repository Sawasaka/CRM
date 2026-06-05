import { NextResponse } from 'next/server'
import { randomBytes } from 'node:crypto'
import { prisma, type Prisma } from '@bgm/db'
import { getAppBaseUrl } from '@/lib/app-url'
import { ensureAuthUserColumns } from '@/lib/auth-schema'
import { buildDemoToken, DEMO_CREDITS_DEFAULT } from '@/lib/demo-token'
import { hashPassword } from '@/lib/password'

/**
 * 無料デモアクセスのリンク発行API。
 *
 * 入力: { company, name, email }
 * 動作:
 *   1) 入力をバリデート
 *   2) 15分後 expiresAt を埋め込んだ署名付きトークンを生成 (lib/demo-token)
 *   3) 通常CRMへログインするための一時認証情報を返却
 *   4) 同時にリード情報をログ + 可能なら h.sawasaka@rookiesmart.jp に通知メール送信
 */

// デモ登録通知は「沢坂のアドレスのみ」に固定送信する (環境変数で別宛先へ逸れないようにする)
const NOTIFY_INBOX = 'h.sawasaka@rookiesmart.jp'
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

type DemoOrg = {
  id: string
  name: string
  slug: string
}

type DemoLogin = {
  email: string
  password: string
  tenant: string
}

type DbClient = Prisma.TransactionClient | typeof prisma

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

function isExpiredDemo(expiresAt: Date | null): boolean {
  return Boolean(expiresAt && expiresAt <= new Date())
}

async function buildUniqueDemoSlug(db: DbClient) {
  for (let i = 0; i < 5; i += 1) {
    const slug = `demo-${Date.now().toString(36)}-${randomBytes(3).toString('hex')}`
    const exists = await db.organization.findUnique({
      where: { slug },
      select: { id: true },
    })
    if (!exists) return slug
  }
  throw new Error('demo slug generation failed')
}

async function resolveDemoOrg(db: DbClient, payload: DemoPayload): Promise<DemoOrg | null> {
  if (payload.tenant) {
    const org = await db.organization.findUnique({
      where: { slug: payload.tenant },
      select: {
        id: true,
        name: true,
        slug: true,
        lifecycleStatus: true,
        demoExpiresAt: true,
      },
    })
    if (!org || org.slug === 'default') return null
    if (org.lifecycleStatus !== 'DEMO') return null
    if (isExpiredDemo(org.demoExpiresAt)) {
      await db.organization.update({
        where: { id: org.id },
        data: { lifecycleStatus: 'INACTIVE' },
      })
      return null
    }
    return { id: org.id, name: org.name, slug: org.slug }
  }

  const reusableOrg = await findReusableDemoOrg(db, payload)
  if (reusableOrg) return reusableOrg

  const slug = await buildUniqueDemoSlug(db)
  return db.organization.create({
    data: {
      name: payload.company,
      slug,
      plan: 'FREE',
      lifecycleStatus: 'DEMO',
      demoExpiresAt: null,
    },
    select: { id: true, name: true, slug: true },
  })
}

async function findReusableDemoOrg(db: DbClient, payload: DemoPayload): Promise<DemoOrg | null> {
  const org = await db.organization.findFirst({
    where: {
      slug: { startsWith: 'demo-' },
      name: payload.company,
      lifecycleStatus: { in: ['DEMO', 'INACTIVE'] },
      users: {
        some: { email: payload.email },
      },
    },
    orderBy: { updatedAt: 'desc' },
    select: {
      id: true,
      name: true,
      slug: true,
    },
  })
  return org
}

async function upsertDemoLead(
  db: DbClient,
  orgId: string,
  tenantSlug: string,
  payload: DemoPayload
): Promise<DemoLogin> {
  const temporaryPassword = randomBytes(24).toString('base64url')
  const passwordHash = await hashPassword(temporaryPassword)
  const existing = await db.user.findFirst({
    where: {
        orgId,
        email: payload.email,
    },
    select: { id: true },
  })
  if (existing) {
    await db.user.update({
      where: { id: existing.id },
      data: {
        name: payload.name,
        role: 'ADMIN',
        passwordHash,
        passwordUpdatedAt: new Date(),
      },
    })
  } else {
    await db.user.create({
      data: {
        orgId,
        email: payload.email,
        name: payload.name,
        role: 'ADMIN',
        passwordHash,
        passwordUpdatedAt: new Date(),
      },
    })
  }
  return { email: payload.email, password: temporaryPassword, tenant: tenantSlug }
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
    `■ 有効期限: ${expiresAtText} (15分)`,
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
        <tr><td style="padding:4px 12px 4px 0;color:#7e7c83;">有効期限</td><td>${escapeHtml(expiresAtText)} (15分)</td></tr>
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

  let claims: Awaited<ReturnType<typeof buildDemoToken>>['claims']
  let demoOrg: DemoOrg
  let login: DemoLogin
  try {
    await ensureAuthUserColumns()
    ;({ demoOrg, login, claims } = await prisma.$transaction(async (tx) => {
      const resolvedOrg = await resolveDemoOrg(tx, payload)
      if (!resolvedOrg) {
        throw new Error('invalid_demo_link')
      }
      const issued = await buildDemoToken({
        tenantSlug: resolvedOrg.slug,
        company: resolvedOrg.name,
        name: payload.name,
        email: payload.email,
      })
      await tx.organization.update({
        where: { id: resolvedOrg.id },
        data: {
          lifecycleStatus: 'DEMO',
          demoExpiresAt: new Date(issued.claims.expiresAt),
        },
      })
      const demoLogin = await upsertDemoLead(tx, resolvedOrg.id, resolvedOrg.slug, payload)
      return { demoOrg: resolvedOrg, login: demoLogin, claims: issued.claims }
    }))
  } catch (e) {
    if (e instanceof Error && e.message === 'invalid_demo_link') {
      return NextResponse.json({ error: 'デモリンクが無効です' }, { status: 404 })
    }
    console.error('[demo-access] issue failed:', e)
    return NextResponse.json({ error: 'デモURLの発行に失敗しました' }, { status: 500 })
  }

  const context = buildContext(req)
  const issuedPayload = { ...payload, tenant: demoOrg.slug, company: demoOrg.name }
  const demoUrl = `/?tenant=${encodeURIComponent(demoOrg.slug)}&demo=1`
  const absoluteDemoUrl = getAbsoluteDemoUrl(req, demoUrl)
  const notificationDelivered = await notifyOwner(
    issuedPayload,
    context,
    claims.sessionId,
    claims.expiresAt,
    absoluteDemoUrl
  )

  return NextResponse.json({
    ok: true,
    url: demoUrl,
    auth: login,
    notificationDelivered,
    sessionId: claims.sessionId,
    credits: claims.credits,
    expiresAt: claims.expiresAt,
  })
}
