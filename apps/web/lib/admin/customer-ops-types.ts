export type PlanTier = 'Free' | 'Lite' | 'Standard' | 'PRO'
export type TenantStatus = 'active' | 'dormant'

export interface TenantRow {
  id: string
  name: string
  slug: string
  plan: PlanTier
  status: TenantStatus
  userCount: number
  activeUsers30d: number
  companyCount: number
  contactCount: number
  dealCount: number
  ticketCount: number
  knowledgeCount: number
  activityCount: number
  activityCount30d: number
  integrations: { google: boolean; slack: boolean; microsoft: boolean }
  createdAt: string
  lastActivityAt: string | null
  primaryContact: { name: string; email: string } | null
}

export interface CustomerOpsMetrics {
  totalTenants: number
  activeTenantCount: number
  totalUsers: number
  activeUsers30d: number
  totalCompanies: number
  totalDeals: number
  totalTickets: number
  totalActivities30d: number
  planCounts: Record<PlanTier, number>
}

export interface TenantUserRow {
  id: string
  name: string
  email: string
  role: string
  createdAt: string
  googleConnected: boolean
}

export interface RecentTenantActivity {
  id: string
  type: string
  title: string
  occurredAt: string
  userName: string
}

export interface TenantDetail extends TenantRow {
  users: TenantUserRow[]
  recentActivities: RecentTenantActivity[]
}
