import { NextResponse } from 'next/server'
import { randomBytes } from 'node:crypto'
import { prisma, type Prisma } from '@bgm/db'
import { ensureAuthUserColumns } from '@/lib/auth-schema'
import { buildDemoToken, DEMO_CREDITS_DEFAULT } from '@/lib/demo-token'
import { hashPassword } from '@/lib/password'
import { getDemoOpenUrl, getTenantEnvironmentUrl } from '@/lib/public-url'

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
const IP_RATE_LIMIT_MAX = 5
const IP_RATE_LIMIT_WINDOW_SECONDS = 60 * 60
const EMAIL_RATE_LIMIT_MAX = 1
const EMAIL_RATE_LIMIT_WINDOW_SECONDS = 24 * 60 * 60
const DEMO_DISPLAY_USER_NAME = 'デモユーザー'

// Fallback only. Serverless deployments do not share this across instances.
const memoryRateLimit = new Map<string, { count: number; resetAt: number }>()

const DISPOSABLE_EMAIL_DOMAINS = new Set([
  '10minutemail.com',
  'anonaddy.com',
  'disposablemail.com',
  'guerrillamail.com',
  'mailinator.com',
  'maildrop.cc',
  'mintemail.com',
  'moakt.com',
  'sharklasers.com',
  'tempmail.com',
  'temp-mail.org',
  'throwawaymail.com',
  'trashmail.com',
  'yopmail.com',
])

interface DemoPayload {
  tenant?: string
  company: string
  name: string
  email: string
  turnstileToken?: string
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
  demoExpiresAt: Date | null
  isNew?: boolean
}

// 使い捨てデモのひな形となる「デモ・マスター」テナントの slug。
// 新規デモ作成時に、このテナントのダミーデータ(企業/コンタクト/取引)を複製する。
const DEMO_MASTER_SLUG = 'demo-master'

type DemoLogin = {
  email: string
  password: string
  tenant: string
}

type DbClient = Prisma.TransactionClient | typeof prisma
type RateLimitResult = { ok: true } | { ok: false; reason: string }

function getProductionReadinessIssue(): string | null {
  if (process.env.NODE_ENV !== 'production') return null
  if (process.env.DEMO_ACCESS_ALLOW_INSECURE === 'true') return null

  const missing: string[] = []
  if (!isPublicUrl(process.env.NEXT_PUBLIC_APP_URL)) missing.push('NEXT_PUBLIC_APP_URL')
  if (!process.env.DEMO_ACCESS_SECRET) missing.push('DEMO_ACCESS_SECRET')
  if (!process.env.RESEND_API_KEY) missing.push('RESEND_API_KEY')
  if (!process.env.BGM_TENANT_ID && !process.env.NEXT_PUBLIC_BGM_TENANT_ID) {
    missing.push('BGM_TENANT_ID')
  }
  if (process.env.DEMO_ACCESS_REQUIRE_ABUSE_PROTECTION === 'true') {
    if (!process.env.TURNSTILE_SECRET_KEY) missing.push('TURNSTILE_SECRET_KEY')
    if (!hasSharedRateLimitStore()) missing.push('UPSTASH_REDIS_REST_URL/TOKEN or KV_REST_API_URL/TOKEN')
  }

  return missing.length > 0 ? `missing production demo config: ${missing.join(', ')}` : null
}

function isPublicUrl(value: string | undefined): boolean {
  if (!value) return false
  const trimmed = value.trim()
  return /^https:\/\//.test(trimmed) && !isLocalUrl(trimmed)
}

function isLocalUrl(value: string): boolean {
  return value.includes('localhost') || value.includes('127.0.0.1') || value.includes('[::1]')
}

function hasSharedRateLimitStore(): boolean {
  return Boolean(
    (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) ||
      (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN)
  )
}

function validate(body: unknown): DemoPayload | null {
  if (!body || typeof body !== 'object') return null
  const b = body as Record<string, unknown>
  const company = typeof b.company === 'string' ? b.company.trim().slice(0, 120) : ''
  const name = typeof b.name === 'string' ? b.name.trim().slice(0, 80) : ''
  const email = typeof b.email === 'string' ? b.email.trim().slice(0, 160) : ''
  const tenant = typeof b.tenant === 'string' ? b.tenant.trim().toLowerCase().slice(0, 80) : ''
  const turnstileToken =
    typeof b.turnstileToken === 'string' ? b.turnstileToken.trim().slice(0, 4096) : ''
  const website = typeof b.website === 'string' ? b.website.trim() : ''
  if (website) return null
  if (!company || !name || !email) return null
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return null
  if (tenant && !/^[a-z0-9-]+$/.test(tenant)) return null
  return { tenant: tenant || undefined, company, name, email, turnstileToken: turnstileToken || undefined }
}

function buildContext(req: Request): RequestContext {
  const forwardedFor = req.headers.get('x-forwarded-for') ?? ''
  return {
    issuedAt: new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' }),
    referer: req.headers.get('referer') ?? 'unknown',
    ipAddress: forwardedFor.split(',')[0]?.trim() || 'unknown',
  }
}

function isExpiredDemo(expiresAt: Date | null): boolean {
  return Boolean(expiresAt && expiresAt <= new Date())
}

function getEmailDomain(email: string): string {
  return email.split('@')[1]?.trim().toLowerCase() ?? ''
}

function isDisposableEmail(email: string): boolean {
  return DISPOSABLE_EMAIL_DOMAINS.has(getEmailDomain(email))
}

async function verifyTurnstile(token: string | undefined, ipAddress: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY
  if (!secret) return true
  if (!token) return false

  try {
    const form = new FormData()
    form.set('secret', secret)
    form.set('response', token)
    if (ipAddress !== 'unknown') form.set('remoteip', ipAddress)
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: form,
    })
    const json = (await res.json().catch(() => null)) as { success?: boolean } | null
    if (!json?.success) console.warn('[demo-access] Turnstile verification failed')
    return Boolean(json?.success)
  } catch (e) {
    console.error('[demo-access] Turnstile verification exception:', e)
    return false
  }
}

async function enforceDemoRateLimit(ipAddress: string, email: string): Promise<RateLimitResult> {
  const ipResult = await hitRateLimit(`demo:ip:${ipAddress}`, IP_RATE_LIMIT_WINDOW_SECONDS)
  if (ipResult.count > IP_RATE_LIMIT_MAX) {
    return { ok: false, reason: 'IPからのデモ発行回数が上限に達しました。時間をおいて再度お試しください。' }
  }

  const emailResult = await hitRateLimit(
    `demo:email:${email.toLowerCase()}`,
    EMAIL_RATE_LIMIT_WINDOW_SECONDS
  )
  if (emailResult.count > EMAIL_RATE_LIMIT_MAX) {
    return { ok: false, reason: 'このメールアドレスでは本日のデモ発行上限に達しました。' }
  }

  return { ok: true }
}

async function hitRateLimit(key: string, windowSeconds: number): Promise<{ count: number }> {
  const upstashUrl = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL
  const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN
  if (upstashUrl && upstashToken) {
    try {
      const count = await upstashCommand<number>(upstashUrl, upstashToken, ['INCR', key])
      if (count === 1) {
        await upstashCommand<number>(upstashUrl, upstashToken, ['EXPIRE', key, String(windowSeconds)])
      }
      return { count }
    } catch (e) {
      console.error('[demo-access] rate limit store error, falling back to memory:', e)
    }
  }

  const now = Date.now()
  const existing = memoryRateLimit.get(key)
  if (!existing || existing.resetAt <= now) {
    memoryRateLimit.set(key, { count: 1, resetAt: now + windowSeconds * 1000 })
    return { count: 1 }
  }
  existing.count += 1
  memoryRateLimit.set(key, existing)
  return { count: existing.count }
}

async function upstashCommand<T>(url: string, token: string, command: string[]): Promise<T> {
  const res = await fetch(url.replace(/\/+$/, ''), {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(command),
  })
  if (!res.ok) throw new Error(`Upstash HTTP ${res.status}`)
  const json = (await res.json()) as { result: T }
  return json.result
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
    return { id: org.id, name: org.name, slug: org.slug, demoExpiresAt: org.demoExpiresAt }
  }

  const reusableOrg = await findReusableDemoOrg(db, payload)
  if (reusableOrg) return reusableOrg

  const slug = await buildUniqueDemoSlug(db)
  const created = await db.organization.create({
    data: {
      name: payload.company,
      slug,
      plan: 'FREE',
      lifecycleStatus: 'DEMO',
      demoExpiresAt: null,
    },
    select: { id: true, name: true, slug: true, demoExpiresAt: true },
  })
  // 新規作成したデモには、後段で demo-master のダミーデータを複製する
  return { ...created, isNew: true }
}

// demo-master のダミーデータ(企業/コンタクト/取引)を新規デモテナントへ複製する。
// owner は新しいデモユーザーに付け替える。既にデータがあれば何もしない(冪等)。
async function cloneDemoMasterData(db: DbClient, targetOrgId: string, ownerEmail: string) {
  const master = await db.organization.findUnique({
    where: { slug: DEMO_MASTER_SLUG },
    select: { id: true },
  })
  if (!master || master.id === targetOrgId) return

  const owner = await db.user.findFirst({
    where: { orgId: targetOrgId, email: ownerEmail },
    select: { id: true },
  })
  if (!owner) return

  const alreadySeeded = await db.company.count({ where: { orgId: targetOrgId } })
  if (alreadySeeded > 0) return

  const companies = await db.company.findMany({
    where: { orgId: master.id },
    select: {
      name: true,
      domain: true,
      phone: true,
      industry: true,
      prefecture: true,
      employeeRange: true,
      revenueRange: true,
      contacts: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          title: true,
          department: true,
          isDecisionMaker: true,
        },
      },
      deals: {
        select: {
          name: true,
          stage: true,
          amount: true,
          expectedCloseAt: true,
          probability: true,
          painPoints: true,
          budget: true,
          desiredService: true,
          timeline: true,
          contactId: true,
        },
      },
    },
  })

  for (const company of companies) {
    const newCompany = await db.company.create({
      data: {
        orgId: targetOrgId,
        ownerId: owner.id,
        name: company.name,
        domain: company.domain,
        phone: company.phone,
        industry: company.industry,
        prefecture: company.prefecture,
        employeeRange: company.employeeRange,
        revenueRange: company.revenueRange,
      },
      select: { id: true },
    })

    const contactIdMap = new Map<string, string>()
    for (const contact of company.contacts) {
      const newContact = await db.contact.create({
        data: {
          orgId: targetOrgId,
          companyId: newCompany.id,
          name: contact.name,
          email: contact.email,
          phone: contact.phone,
          title: contact.title,
          department: contact.department,
          isDecisionMaker: contact.isDecisionMaker,
        },
        select: { id: true },
      })
      contactIdMap.set(contact.id, newContact.id)
    }

    for (const deal of company.deals) {
      await db.deal.create({
        data: {
          orgId: targetOrgId,
          companyId: newCompany.id,
          contactId: deal.contactId ? (contactIdMap.get(deal.contactId) ?? null) : null,
          ownerId: owner.id,
          name: deal.name,
          stage: deal.stage,
          amount: deal.amount,
          expectedCloseAt: deal.expectedCloseAt,
          probability: deal.probability,
          painPoints: deal.painPoints,
          budget: deal.budget,
          desiredService: deal.desiredService,
          timeline: deal.timeline,
        },
      })
    }
  }
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
      demoExpiresAt: true,
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
        name: DEMO_DISPLAY_USER_NAME,
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
        name: DEMO_DISPLAY_USER_NAME,
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
  const durationMinutes = Math.max(1, Math.round((expiresAt - Date.now()) / 60_000))
  const durationText = `${durationMinutes}分`
  const subject = `【ルキスマCRM】無料デモ発行: ${p.company} / ${p.name}`
  const text = [
    'ルキスマCRM LP から無料デモURLが発行されました。',
    '',
    `■ 会社名: ${p.company}`,
    p.tenant ? `■ テナント: ${p.tenant}` : null,
    `■ 氏名:   ${p.name}`,
    `■ メール: ${p.email}`,
    `■ 発行日時: ${context.issuedAt}`,
    `■ 有効期限: ${expiresAtText} (${durationText})`,
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
        <tr><td style="padding:4px 12px 4px 0;color:#7e7c83;">有効期限</td><td>${escapeHtml(expiresAtText)} (${escapeHtml(durationText)})</td></tr>
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

async function createInternalLead(payload: DemoPayload, context: RequestContext, demoOrg: DemoOrg) {
  const orgId = process.env.BGM_TENANT_ID ?? process.env.NEXT_PUBLIC_BGM_TENANT_ID
  if (!orgId) {
    console.warn('[demo-access] BGM_TENANT_ID 未設定。CRMリード化をスキップします。')
    return false
  }

  try {
    const owner = await prisma.user.findFirst({
      where: { orgId },
      orderBy: { createdAt: 'asc' },
      select: { id: true },
    })
    if (!owner) {
      console.warn('[demo-access] BGM_TENANT_ID にユーザーがいないためCRMリード化をスキップします。', { orgId })
      return false
    }

    const company = await prisma.company.findFirst({
      where: { orgId, name: payload.company },
      orderBy: { updatedAt: 'desc' },
      select: { id: true },
    })
    const savedCompany = company
      ? await prisma.company.update({
          where: { id: company.id },
          data: { leadSource: 'HP_INQUIRY', ownerId: owner.id },
          select: { id: true },
        })
      : await prisma.company.create({
          data: {
            orgId,
            name: payload.company,
            leadSource: 'HP_INQUIRY',
            leadRank: 'C',
            leadScore: 30,
            ownerId: owner.id,
          },
          select: { id: true },
        })

    const contact = await prisma.contact.findFirst({
      where: { orgId, email: payload.email },
      orderBy: { updatedAt: 'desc' },
      select: { id: true },
    })
    const savedContact = contact
      ? await prisma.contact.update({
          where: { id: contact.id },
          data: {
            companyId: savedCompany.id,
            name: payload.name,
            isOwnerId: owner.id,
            approachStatus: 'NOT_STARTED',
          },
          select: { id: true },
        })
      : await prisma.contact.create({
          data: {
            orgId,
            companyId: savedCompany.id,
            name: payload.name,
            email: payload.email,
            isOwnerId: owner.id,
          },
          select: { id: true },
        })

    let deal = await prisma.deal.findFirst({
      where: {
        orgId,
        companyId: savedCompany.id,
        contactId: savedContact.id,
        stage: { notIn: ['CLOSED_WON', 'CLOSED_LOST'] },
        name: { contains: '無料デモ' },
      },
      orderBy: { updatedAt: 'desc' },
      select: { id: true },
    })
    if (!deal) {
      deal = await prisma.deal.create({
        data: {
          orgId,
          companyId: savedCompany.id,
          contactId: savedContact.id,
          ownerId: owner.id,
          name: `${payload.company} 無料デモ`,
          stage: 'NEW_LEAD',
          probability: 10,
          fieldMeta: {
            source: 'demo_access',
            referer: context.referer,
            ipAddress: context.ipAddress,
            demoTenant: demoOrg.slug,
          },
        },
        select: { id: true },
      })
    }

    await prisma.activity.create({
      data: {
        orgId,
        companyId: savedCompany.id,
        contactId: savedContact.id,
        dealId: deal.id,
        userId: owner.id,
        type: 'NOTE',
        title: '無料デモ登録',
        content: `${payload.name} (${payload.email}) が無料デモを登録しました。`,
        metadata: {
          source: 'demo_access',
          referer: context.referer,
          ipAddress: context.ipAddress,
          demoTenant: demoOrg.slug,
        },
      },
    })

    return true
  } catch (e) {
    console.error('[demo-access] CRM lead upsert failed:', e)
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
  const readinessIssue = getProductionReadinessIssue()
  if (readinessIssue) {
    console.error('[demo-access] production readiness failed:', readinessIssue)
    return NextResponse.json(
      { error: '無料デモの本番設定が未完了です。管理者にお問い合わせください。' },
      { status: 503 }
    )
  }
  const context = buildContext(req)

  if (isDisposableEmail(payload.email)) {
    return NextResponse.json(
      { error: '使い捨てメールアドレスではデモを発行できません。' },
      { status: 400 }
    )
  }

  const turnstileOk = await verifyTurnstile(payload.turnstileToken, context.ipAddress)
  if (!turnstileOk) {
    return NextResponse.json(
      { error: '認証に失敗しました。ページを再読み込みして再度お試しください。' },
      { status: 400 }
    )
  }

  const rateLimit = await enforceDemoRateLimit(context.ipAddress, payload.email)
  if (!rateLimit.ok) {
    return NextResponse.json({ error: rateLimit.reason }, { status: 429 })
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
      const configuredExpiresAt =
        resolvedOrg.demoExpiresAt && resolvedOrg.demoExpiresAt > new Date()
          ? resolvedOrg.demoExpiresAt.getTime()
          : undefined
      const issued = await buildDemoToken({
        tenantSlug: resolvedOrg.slug,
        company: resolvedOrg.name,
        name: payload.name,
        email: payload.email,
        expiresAt: configuredExpiresAt,
      })
      await tx.organization.update({
        where: { id: resolvedOrg.id },
        data: {
          lifecycleStatus: 'DEMO',
          demoExpiresAt: new Date(issued.claims.expiresAt),
        },
      })
      const demoLogin = await upsertDemoLead(tx, resolvedOrg.id, resolvedOrg.slug, payload)
      // 新規発行のデモには demo-master のダミーデータを複製し、空のCRMにならないようにする
      if (resolvedOrg.isNew) {
        await cloneDemoMasterData(tx, resolvedOrg.id, payload.email)
      }
      return { demoOrg: resolvedOrg, login: demoLogin, claims: issued.claims }
    }))
  } catch (e) {
    if (e instanceof Error && e.message === 'invalid_demo_link') {
      return NextResponse.json({ error: 'デモリンクが無効です' }, { status: 404 })
    }
    console.error('[demo-access] issue failed:', e)
    return NextResponse.json({ error: 'デモURLの発行に失敗しました' }, { status: 500 })
  }

  const issuedPayload: DemoPayload = {
    tenant: demoOrg.slug,
    company: demoOrg.name,
    name: payload.name,
    email: payload.email,
  }
  const immediateUrl = new URL(getTenantEnvironmentUrl(demoOrg.slug))
  immediateUrl.searchParams.set('demo', '1')
  immediateUrl.searchParams.set('demoSession', '1')
  const shareUrl = getDemoOpenUrl(demoOrg.slug)
  const notificationDelivered = await notifyOwner(
    issuedPayload,
    context,
    claims.sessionId,
    claims.expiresAt,
    shareUrl
  )
  const leadSynced = await createInternalLead(issuedPayload, context, demoOrg)

  return NextResponse.json({
    ok: true,
    url: immediateUrl.toString(),
    shareUrl,
    auth: login,
    notificationDelivered,
    leadSynced,
    sessionId: claims.sessionId,
    credits: claims.credits,
    expiresAt: claims.expiresAt,
  })
}
