import { auth } from '@/lib/auth'
import { prisma, type Plan } from '@bgm/db'
import type {
  CustomerOpsMetrics,
  PlanTier,
  RecentTenantActivity,
  TenantDetail,
  TenantRow,
  TenantUserRow,
} from './customer-ops-types'

type AdminAccess =
  | { authorized: true; orgId: string; userId: string }
  | { authorized: false; reason: AdminAccessDeniedReason }

type AdminAccessDeniedReason = 'unauthorized' | 'forbidden'

type OrgBase = Awaited<ReturnType<typeof fetchOrganizations>>[number]

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000

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

  const tenants = await buildTenantRows()
  return { authorized: true, tenants, metrics: buildMetrics(tenants) }
}

export async function getCustomerOpsTenantDetail(id: string): Promise<
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
  let userId = (session as unknown as { userId?: string })?.userId ?? null
  let usedDevFallback = false

  if (!userId && process.env.NEXT_PUBLIC_DEV_MODE === 'true') {
    const firstUser = await prisma.user.findFirst({
      orderBy: { createdAt: 'asc' },
      select: { id: true },
    })
    userId = firstUser?.id ?? null
    usedDevFallback = Boolean(userId)
  }

  if (!userId) return { authorized: false, reason: 'unauthorized' }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, orgId: true, role: true },
  })
  if (!user) return { authorized: false, reason: 'unauthorized' }

  if (process.env.NEXT_PUBLIC_DEV_MODE === 'true' && process.env.NODE_ENV !== 'production') {
    return { authorized: true, orgId: user.orgId, userId: user.id }
  }

  const developerTenantId = process.env.BGM_TENANT_ID ?? process.env.NEXT_PUBLIC_BGM_TENANT_ID
  if (developerTenantId) {
    return user.orgId === developerTenantId
      ? { authorized: true, orgId: user.orgId, userId: user.id }
      : { authorized: false, reason: 'forbidden' }
  }

  if (usedDevFallback) {
    return { authorized: true, orgId: user.orgId, userId: user.id }
  }

  if (process.env.NODE_ENV !== 'production' && user.role === 'ADMIN') {
    return { authorized: true, orgId: user.orgId, userId: user.id }
  }

  return { authorized: false, reason: 'forbidden' }
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
  const latestActivityByOrg = new Map(latestActivities.map((row) => [row.orgId, row._max.occurredAt]))
  const latestDealByOrg = new Map(latestDeals.map((row) => [row.orgId, row._max.updatedAt]))
  const latestTicketByOrg = new Map(latestTickets.map((row) => [row.orgId, row._max.updatedAt]))
  const latestCompanyByOrg = new Map(latestCompanies.map((row) => [row.orgId, row._max.updatedAt]))
  const latestContactByOrg = new Map(latestContacts.map((row) => [row.orgId, row._max.updatedAt]))
  const slackOrgIds = new Set(slackConnections.map((row) => row.orgId))

  return orgs.map((org) =>
    toTenantRow({
      org,
      since,
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
    }),
  )
}

function toTenantRow({
  org,
  since,
  activityCount,
  activityCount30d,
  activeUsers30d,
  latestActivityAt,
  slackConnected,
}: {
  org: OrgBase
  since: Date
  activityCount: number
  activityCount30d: number
  activeUsers30d: number
  latestActivityAt: Date | null
  slackConnected: boolean
}): TenantRow {
  const primaryUser =
    org.users.find((user) => user.role === 'ADMIN') ?? org.users[0] ?? null
  const googleConnected = org.users.some((user) => Boolean(user.googleAccount))
  return {
    id: org.id,
    name: org.name,
    slug: org.slug,
    plan: PLAN_LABELS[org.plan],
    status: latestActivityAt && latestActivityAt >= since ? 'active' : 'dormant',
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
  }
}

function buildMetrics(tenants: TenantRow[]): CustomerOpsMetrics {
  const planCounts: Record<PlanTier, number> = { Free: 0, Lite: 0, Standard: 0, PRO: 0 }
  for (const tenant of tenants) {
    planCounts[tenant.plan] += 1
  }

  return {
    totalTenants: tenants.length,
    activeTenantCount: tenants.filter((tenant) => tenant.status === 'active').length,
    totalUsers: tenants.reduce((sum, tenant) => sum + tenant.userCount, 0),
    activeUsers30d: tenants.reduce((sum, tenant) => sum + tenant.activeUsers30d, 0),
    totalCompanies: tenants.reduce((sum, tenant) => sum + tenant.companyCount, 0),
    totalDeals: tenants.reduce((sum, tenant) => sum + tenant.dealCount, 0),
    totalTickets: tenants.reduce((sum, tenant) => sum + tenant.ticketCount, 0),
    totalActivities30d: tenants.reduce((sum, tenant) => sum + tenant.activityCount30d, 0),
    planCounts,
  }
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
