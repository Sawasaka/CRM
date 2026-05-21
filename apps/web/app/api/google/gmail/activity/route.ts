import { NextResponse } from 'next/server'
import { prisma } from '@bgm/db'
import { resolveGoogleIntegrationUserId } from '@/lib/google/current-user'
import { GoogleAccountNotConnectedError } from '@/lib/google/oauth'
import { syncGmailForUser } from '@/lib/google/gmail-sync'
import { getGoogleAccountSnapshot } from '@/lib/google/account-store'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type RequestBody = {
  company?: string
  domain?: string
  sinceDays?: number
  maxMessages?: number
  sync?: boolean
}

export async function POST(req: Request) {
  const userId = await resolveGoogleIntegrationUserId()
  if (!userId) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const body = (await req.json().catch(() => ({}))) as RequestBody
  const company = body.company?.trim()
  if (!company) return NextResponse.json({ error: 'company_required' }, { status: 400 })

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { orgId: true },
  })
  if (!user) return NextResponse.json({ error: 'user_not_found' }, { status: 404 })

  const account = await getGoogleAccountSnapshot(userId)
  if (!account || !account.scope?.includes('gmail')) {
    return NextResponse.json(
      {
        error: 'gmail_not_connected',
        installUrl: '/api/google/install?service=gmail',
        message: 'Gmail連携が必要です。',
      },
      { status: 412 }
    )
  }

  const sinceDays = clampInt(body.sinceDays, 1, 3650, 365)
  const maxMessages = clampInt(body.maxMessages, 1, 100, 30)
  const context = await resolveCompanyContext(user.orgId, company, body.domain)
  const query = buildGmailActivityQuery(context.terms, sinceDays)

  try {
    const syncResult =
      body.sync === false
        ? null
        : await syncGmailForUser(userId, {
            sinceDays,
            maxMessages,
            searchQuery: query,
            includeMessages: true,
          })

    const storedMessages = await findStoredMessages({
      orgId: user.orgId,
      userId,
      terms: context.terms,
      domains: context.domains,
      take: maxMessages,
    })

    const messages = mergeMessages(syncResult?.messages ?? [], storedMessages).slice(0, maxMessages)

    return NextResponse.json({
      ok: true,
      company: context.companyName,
      query,
      terms: context.terms,
      domains: context.domains,
      synced: syncResult
        ? {
            fetched: syncResult.fetched,
            inserted: syncResult.inserted,
            matched: syncResult.matched,
            skipped: syncResult.skipped,
          }
        : null,
      count: messages.length,
      messages,
    })
  } catch (e) {
    if (e instanceof GoogleAccountNotConnectedError) {
      return NextResponse.json(
        {
          error: 'gmail_not_connected',
          installUrl: '/api/google/install?service=gmail',
          message: 'Gmail連携が必要です。',
        },
        { status: 412 }
      )
    }
    console.error('[google/gmail/activity]', e)
    return NextResponse.json(
      { error: 'gmail_activity_failed', message: e instanceof Error ? e.message : String(e) },
      { status: 500 }
    )
  }
}

async function resolveCompanyContext(orgId: string, inputCompany: string, inputDomain?: string) {
  const normalizedName = normalizeCompanyName(inputCompany)
  const [company, master] = await Promise.all([
    prisma.company.findFirst({
      where: {
        orgId,
        OR: [
          { name: { contains: inputCompany, mode: 'insensitive' } },
          { name: { contains: normalizedName, mode: 'insensitive' } },
        ],
      },
      select: { name: true, domain: true },
    }),
    prisma.companyMaster.findFirst({
      where: {
        OR: [
          { name: { contains: inputCompany, mode: 'insensitive' } },
          { name: { contains: normalizedName, mode: 'insensitive' } },
        ],
      },
      select: { name: true, websiteUrl: true, representativeEmail: true },
    }),
  ])

  const domains = uniqueStrings([
    normalizeDomain(inputDomain),
    normalizeDomain(company?.domain),
    domainFromUrl(master?.websiteUrl),
    domainFromEmail(master?.representativeEmail),
  ])

  const terms = uniqueStrings([
    inputCompany,
    normalizedName,
    company?.name,
    master?.name,
    ...domains,
  ]).filter((term) => term.length >= 2)

  return {
    companyName: company?.name ?? master?.name ?? inputCompany,
    terms: terms.length ? terms : [inputCompany],
    domains,
  }
}

function buildGmailActivityQuery(terms: string[], sinceDays: number): string {
  const clauses = terms.slice(0, 8).flatMap((term) => {
    if (term.includes('.')) return [`from:${term}`, `to:${term}`, `cc:${term}`]
    return [`"${term.replace(/"/g, '')}"`]
  })
  return `newer_than:${sinceDays}d -in:chats (${clauses.join(' OR ')})`
}

async function findStoredMessages({
  orgId,
  userId,
  terms,
  domains,
  take,
}: {
  orgId: string
  userId: string
  terms: string[]
  domains: string[]
  take: number
}) {
  const textOr = terms.flatMap((term) => [
    { subject: { contains: term, mode: 'insensitive' as const } },
    { snippet: { contains: term, mode: 'insensitive' as const } },
    { bodyText: { contains: term, mode: 'insensitive' as const } },
    { fromAddress: { contains: term, mode: 'insensitive' as const } },
  ])
  const domainOr = domains.map((domain) => ({
    fromAddress: { contains: domain, mode: 'insensitive' as const },
  }))

  const rows = await prisma.emailMessage.findMany({
    where: {
      orgId,
      userId,
      OR: [...textOr, ...domainOr],
    },
    orderBy: { sentAt: 'desc' },
    take,
    select: {
      id: true,
      subject: true,
      snippet: true,
      fromAddress: true,
      fromName: true,
      toAddresses: true,
      ccAddresses: true,
      sentAt: true,
      direction: true,
      contactId: true,
      companyId: true,
      dealId: true,
      matchedBy: true,
    },
  })
  return rows
}

function mergeMessages<T extends { id: string; sentAt: Date }>(a: T[], b: T[]): T[] {
  const map = new Map<string, T>()
  for (const item of [...a, ...b]) map.set(item.id, item)
  return Array.from(map.values()).sort(
    (left, right) => new Date(right.sentAt).getTime() - new Date(left.sentAt).getTime()
  )
}

function normalizeCompanyName(value: string): string {
  return value
    .replace(/株式会社|合同会社|有限会社|Inc\.?|Co\.?,?\s*Ltd\.?/gi, '')
    .replace(/[「」『』]/g, '')
    .trim()
}

function normalizeDomain(value?: string | null): string | null {
  if (!value) return null
  const domain = value
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .split('/')[0]
    ?.split(':')[0]
    ?.toLowerCase()
    .trim()
  return domain || null
}

function domainFromUrl(value?: string | null): string | null {
  return normalizeDomain(value)
}

function domainFromEmail(value?: string | null): string | null {
  if (!value || !value.includes('@')) return null
  return normalizeDomain(value.split('@')[1])
}

function uniqueStrings(values: Array<string | null | undefined>): string[] {
  return Array.from(new Set(values.map((v) => v?.trim()).filter((v): v is string => !!v)))
}

function clampInt(value: number | undefined, min: number, max: number, fallback: number): number {
  if (!Number.isFinite(value)) return fallback
  return Math.min(Math.max(Math.trunc(value as number), min), max)
}
