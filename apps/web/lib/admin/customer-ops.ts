import { auth } from '@/lib/auth'
import { prisma, type Plan } from '@bgm/db'
import type {
  ContractItem,
  CustomerOpsMetrics,
  PlanTier,
  RecentTenantActivity,
  TenantDetail,
  TenantRow,
  TenantUserRow,
} from './customer-ops-types'

// 契約項目の配列を安全に整形する
function normalizeContractItems(raw: unknown): ContractItem[] {
  if (!Array.isArray(raw)) return []
  return raw
    .map((item) => {
      if (!item || typeof item !== 'object') return null
      const rec = item as Record<string, unknown>
      const label = typeof rec.label === 'string' ? rec.label : ''
      const value = typeof rec.value === 'string' ? rec.value : ''
      if (!label && !value) return null
      return { label, value }
    })
    .filter((item): item is ContractItem => item !== null)
}

// DB の Json (unknown) を { memo, items } へ安全に変換する。
// 後方互換: 旧データは配列 (= 契約項目のみ) なので、その場合 memo は空とする。
function parseTenantMeta(raw: unknown): { memo: string; items: ContractItem[] } {
  if (Array.isArray(raw)) {
    return { memo: '', items: normalizeContractItems(raw) }
  }
  if (raw && typeof raw === 'object') {
    const rec = raw as Record<string, unknown>
    const memo = typeof rec.memo === 'string' ? rec.memo : ''
    return { memo, items: normalizeContractItems(rec.items) }
  }
  return { memo: '', items: [] }
}

type AdminAccess =
  | { authorized: true; orgId: string; userId: string }
  | { authorized: false; reason: AdminAccessDeniedReason }

type AdminAccessDeniedReason = 'unauthorized' | 'forbidden'

type OrgBase = Awaited<ReturnType<typeof fetchOrganizations>>[number]

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000
const DEFAULT_CUSTOMER_OPS_ADMIN_EMAILS = ['h.sawasaka@rookiesmart.jp']
const DEFAULT_LOCAL_DEV_USER_EMAIL = 'h.sawasaka@rookiesmart.jp'

const PLAN_LABELS: Record<Plan, PlanTier> = {
  FREE: 'Free',
  STARTER: 'Lite',
  GROWTH: 'Standard',
  ENTERPRISE: 'PRO',
}

export async function getCustomerOpsOverview(): Promise<
  | { authorized: false; reason: AdminAccessDeniedReason }
  | { authorized: true; tenants: TenantRow[]; metrics: CustomerOpsMetrics }
> {
  const access = await getCustomerOpsAdminAccess()
  if (!access.authorized) return access

  await markExpiredDemoTenantsInactive()
  const tenants = sortTenantRows(await buildTenantRows())
  return { authorized: true, tenants, metrics: buildMetrics(tenants) }
}

export async function getCustomerOpsTenantDetail(
  id: string
): Promise<
  | { authorized: false; reason: AdminAccessDeniedReason }
  | { authorized: true; tenant: TenantDetail | null }
> {
  const access = await getCustomerOpsAdminAccess()
  if (!access.authorized) return access

  const rows = await buildTenantRows(id)
  const tenant = rows[0]
  if (!tenant) return { authorized: true, tenant: null }

  const users = await prisma.user.findMany({
    where: { orgId: id },
    orderBy: { createdAt: 'asc' },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      googleAccount: { select: { id: true } },
    },
  })
  const recentActivities = await prisma.activity.findMany({
    where: { orgId: id },
    orderBy: { occurredAt: 'desc' },
    take: 12,
    select: {
      id: true,
      type: true,
      title: true,
      occurredAt: true,
      user: { select: { name: true, email: true } },
    },
  })

  return {
    authorized: true,
    tenant: {
      ...tenant,
      users: users.map<TenantUserRow>((user) => ({
        id: user.id,
        name: user.name || user.email,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt.toISOString(),
        googleConnected: Boolean(user.googleAccount),
      })),
      recentActivities: recentActivities.map<RecentTenantActivity>((activity) => ({
        id: activity.id,
        type: activity.type,
        title: activity.title,
        occurredAt: activity.occurredAt.toISOString(),
        userName: activity.user.name || activity.user.email,
      })),
    },
  }
}

export async function getCustomerOpsAdminAccess(): Promise<AdminAccess> {
  const session = await auth()
  const userId = (session as unknown as { userId?: string })?.userId ?? null
  const sessionEmail = session?.user?.email ?? null
  const isLocalRequest = await isLocalhostRequest()

  if (!userId) {
    return isLocalRequest && isCustomerOpsAdminEmail(getLocalDevUserEmail())
      ? await getLocalDeveloperAccess()
      : { authorized: false, reason: 'unauthorized' }
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      orgId: true,
      org: { select: { slug: true, lifecycleStatus: true } },
    },
  })
  if (!user) return { authorized: false, reason: 'unauthorized' }
  if (isIssuedDemoTenant(user.org.slug)) {
    return { authorized: false, reason: 'forbidden' }
  }
  if (isCustomerOpsAdminEmail(user.email) || isCustomerOpsAdminEmail(sessionEmail)) {
    return { authorized: true, orgId: user.orgId, userId: user.id }
  }
  if (isLocalRequest && isCustomerOpsAdminEmail(getLocalDevUserEmail())) {
    return { authorized: true, orgId: user.orgId, userId: user.id }
  }

  const developerTenantId = process.env.BGM_TENANT_ID ?? process.env.NEXT_PUBLIC_BGM_TENANT_ID
  if (developerTenantId) {
    return user.orgId === developerTenantId
      ? { authorized: true, orgId: user.orgId, userId: user.id }
      : { authorized: false, reason: 'forbidden' }
  }

  if (isLocalRequest && user.org.slug !== 'default') {
    return { authorized: false, reason: 'forbidden' }
  }

  if (user.org.slug === 'default') {
    return { authorized: true, orgId: user.orgId, userId: user.id }
  }

  return { authorized: false, reason: 'forbidden' }
}

async function getLocalDeveloperAccess(): Promise<AdminAccess> {
  const user = await prisma.user.findFirst({
    where: { org: { slug: 'default' } },
    orderBy: { createdAt: 'asc' },
    select: { id: true, orgId: true },
  })
  if (user) return { authorized: true, orgId: user.orgId, userId: user.id }

  const fallback = await prisma.user.findFirst({
    orderBy: { createdAt: 'asc' },
    select: { id: true, orgId: true },
  })
  return fallback
    ? { authorized: true, orgId: fallback.orgId, userId: fallback.id }
    : { authorized: false, reason: 'unauthorized' }
}

function isCustomerOpsAdminEmail(email: string | null | undefined) {
  if (!email) return false
  const configured = process.env.CUSTOMER_OPS_ADMIN_EMAILS ?? process.env.CUSTOMER_OPS_ADMIN_EMAIL
  const emails = configured
    ? configured.split(',').map((value) => value.trim().toLowerCase()).filter(Boolean)
    : DEFAULT_CUSTOMER_OPS_ADMIN_EMAILS
  return emails.includes(email.trim().toLowerCase())
}

function getLocalDevUserEmail() {
  return process.env.LOCAL_DEV_USER_EMAIL ?? DEFAULT_LOCAL_DEV_USER_EMAIL
}

function isIssuedDemoTenant(slug: string) {
  return slug.startsWith('demo-')
}

async function isLocalhostRequest() {
  try {
    const { headers } = await import('next/headers')
    const store = await headers()
    const host = (store.get('x-forwarded-host') ?? store.get('host') ?? '').toLowerCase()
    return (
      host.startsWith('localhost:') ||
      host === 'localhost' ||
      host.startsWith('127.0.0.1:') ||
      host === '127.0.0.1' ||
      host.startsWith('[::1]:') ||
      host === '[::1]'
    )
  } catch {
    return false
  }
}

async function fetchOrganizations(orgId?: string) {
  return prisma.organization.findMany({
    where: orgId ? { id: orgId } : undefined,
    orderBy: { createdAt: 'asc' },
    select: {
      id: true,
      name: true,
      slug: true,
      plan: true,
      lifecycleStatus: true,
      demoExpiresAt: true,
      contractInfo: true,
      createdAt: true,
      updatedAt: true,
      users: {
        orderBy: { createdAt: 'asc' },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
          googleAccount: { select: { id: true, updatedAt: true } },
        },
      },
      _count: {
        select: {
          users: true,
          companies: true,
          contacts: true,
          deals: true,
          activities: true,
          tickets: true,
          knowledgeDocs: true,
        },
      },
    },
  })
}

async function buildTenantRows(orgId?: string): Promise<TenantRow[]> {
  const since = new Date(Date.now() - THIRTY_DAYS_MS)
  const [
    orgs,
    activityTotals,
    activity30Totals,
    activeUserPairs,
    latestActivities,
    latestDeals,
    latestTickets,
    latestCompanies,
    latestContacts,
    slackConnections,
  ] = await Promise.all([
    fetchOrganizations(orgId),
    prisma.activity.groupBy({ by: ['orgId'], _count: { _all: true } }),
    prisma.activity.groupBy({
      by: ['orgId'],
      where: { occurredAt: { gte: since } },
      _count: { _all: true },
    }),
    prisma.activity.findMany({
      where: { occurredAt: { gte: since } },
      distinct: ['orgId', 'userId'],
      select: { orgId: true, userId: true },
    }),
    prisma.activity.groupBy({ by: ['orgId'], _max: { occurredAt: true } }),
    prisma.deal.groupBy({ by: ['orgId'], _max: { updatedAt: true } }),
    prisma.ticket.groupBy({ by: ['orgId'], _max: { updatedAt: true } }),
    prisma.company.groupBy({ by: ['orgId'], _max: { updatedAt: true } }),
    prisma.contact.groupBy({ by: ['orgId'], _max: { updatedAt: true } }),
    fetchSlackConnections(),
  ])

  const activityTotalByOrg = new Map(activityTotals.map((row) => [row.orgId, row._count._all]))
  const activity30ByOrg = new Map(activity30Totals.map((row) => [row.orgId, row._count._all]))
  const activeUsersByOrg = countActiveUsersByOrg(activeUserPairs)
  const latestActivityByOrg = new Map(
    latestActivities.map((row) => [row.orgId, row._max.occurredAt])
  )
  const latestDealByOrg = new Map(latestDeals.map((row) => [row.orgId, row._max.updatedAt]))
  const latestTicketByOrg = new Map(latestTickets.map((row) => [row.orgId, row._max.updatedAt]))
  const latestCompanyByOrg = new Map(latestCompanies.map((row) => [row.orgId, row._max.updatedAt]))
  const latestContactByOrg = new Map(latestContacts.map((row) => [row.orgId, row._max.updatedAt]))
  const slackOrgIds = new Set(slackConnections.map((row) => row.orgId))

  return orgs.map((org) =>
    toTenantRow({
      org,
      activityCount: activityTotalByOrg.get(org.id) ?? org._count.activities,
      activityCount30d: activity30ByOrg.get(org.id) ?? 0,
      activeUsers30d: activeUsersByOrg.get(org.id) ?? 0,
      latestActivityAt: maxDate([
        org.updatedAt,
        latestActivityByOrg.get(org.id),
        latestDealByOrg.get(org.id),
        latestTicketByOrg.get(org.id),
        latestCompanyByOrg.get(org.id),
        latestContactByOrg.get(org.id),
        ...org.users.map((user) => user.googleAccount?.updatedAt ?? user.createdAt),
      ]),
      slackConnected: slackOrgIds.has(org.id),
    })
  )
}

function toTenantRow({
  org,
  activityCount,
  activityCount30d,
  activeUsers30d,
  latestActivityAt,
  slackConnected,
}: {
  org: OrgBase
  activityCount: number
  activityCount30d: number
  activeUsers30d: number
  latestActivityAt: Date | null
  slackConnected: boolean
}): TenantRow {
  const primaryUser = org.users.find((user) => user.role === 'ADMIN') ?? org.users[0] ?? null
  const googleConnected = org.users.some((user) => Boolean(user.googleAccount))
  const status = resolveTenantStatus(org)
  const meta = parseTenantMeta(org.contractInfo)
  return {
    id: org.id,
    name: org.name,
    slug: org.slug,
    plan: PLAN_LABELS[org.plan],
    status,
    demoExpiresAt: org.demoExpiresAt?.toISOString() ?? null,
    userCount: org._count.users,
    activeUsers30d,
    companyCount: org._count.companies,
    contactCount: org._count.contacts,
    dealCount: org._count.deals,
    ticketCount: org._count.tickets,
    knowledgeCount: org._count.knowledgeDocs,
    activityCount,
    activityCount30d,
    integrations: { google: googleConnected, slack: slackConnected, microsoft: false },
    createdAt: org.createdAt.toISOString(),
    lastActivityAt: latestActivityAt?.toISOString() ?? null,
    primaryContact: primaryUser
      ? { name: primaryUser.name || primaryUser.email, email: primaryUser.email }
      : null,
    contractInfo: meta.items,
    memo: meta.memo,
  }
}

function sortTenantRows(tenants: TenantRow[]) {
  return [...tenants].sort((a, b) => {
    if (a.slug === 'default' && b.slug !== 'default') return -1
    if (b.slug === 'default' && a.slug !== 'default') return 1
    const aTime = a.lastActivityAt ?? a.createdAt
    const bTime = b.lastActivityAt ?? b.createdAt
    return bTime.localeCompare(aTime)
  })
}

function buildMetrics(tenants: TenantRow[]): CustomerOpsMetrics {
  const planCounts: Record<PlanTier, number> = { Free: 0, Lite: 0, Standard: 0, PRO: 0 }
  for (const tenant of tenants) {
    planCounts[tenant.plan] += 1
  }

  return {
    totalTenants: tenants.length,
    activeTenantCount: tenants.filter((tenant) => tenant.status !== 'inactive').length,
    totalUsers: tenants.reduce((sum, tenant) => sum + tenant.userCount, 0),
    activeUsers30d: tenants.reduce((sum, tenant) => sum + tenant.activeUsers30d, 0),
    totalCompanies: tenants.reduce((sum, tenant) => sum + tenant.companyCount, 0),
    totalDeals: tenants.reduce((sum, tenant) => sum + tenant.dealCount, 0),
    totalTickets: tenants.reduce((sum, tenant) => sum + tenant.ticketCount, 0),
    totalActivities30d: tenants.reduce((sum, tenant) => sum + tenant.activityCount30d, 0),
    planCounts,
  }
}

function resolveTenantStatus(
  org: Pick<OrgBase, 'slug' | 'plan' | 'lifecycleStatus' | 'demoExpiresAt'>
) {
  if (org.slug === 'default') return 'active'
  if (org.lifecycleStatus === 'INACTIVE') return 'inactive'
  if (org.lifecycleStatus === 'DEMO') {
    return org.demoExpiresAt && org.demoExpiresAt <= new Date() ? 'inactive' : 'demo'
  }
  if (org.lifecycleStatus === 'FREE') return 'demo'
  return org.plan === 'FREE' ? 'demo' : 'active'
}

async function markExpiredDemoTenantsInactive() {
  await prisma.organization.updateMany({
    where: {
      lifecycleStatus: 'DEMO',
      demoExpiresAt: { lte: new Date() },
    },
    data: { lifecycleStatus: 'INACTIVE' },
  })
}

function countActiveUsersByOrg(rows: Array<{ orgId: string; userId: string }>) {
  const map = new Map<string, Set<string>>()
  for (const row of rows) {
    const set = map.get(row.orgId) ?? new Set<string>()
    set.add(row.userId)
    map.set(row.orgId, set)
  }
  return new Map(Array.from(map.entries()).map(([orgId, users]) => [orgId, users.size]))
}

function maxDate(values: Array<Date | null | undefined>) {
  const timestamps = values
    .filter((value): value is Date => Boolean(value))
    .map((value) => value.getTime())
  if (!timestamps.length) return null
  return new Date(Math.max(...timestamps))
}

async function fetchSlackConnections() {
  if (!(await tableExists('SlackWorkspace'))) return []
  return prisma.slackWorkspace.findMany({
    where: { enabled: true },
    distinct: ['orgId'],
    select: { orgId: true },
  })
}

async function tableExists(tableName: string) {
  const rows = await prisma.$queryRaw<Array<{ exists: boolean }>>`
    SELECT EXISTS (
      SELECT 1
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_name = ${tableName}
    ) AS "exists"
  `
  return Boolean(rows[0]?.exists)
}
