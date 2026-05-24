'use client'

import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  Activity,
  Building2,
  ChevronRight,
  Crown,
  Database,
  Search,
  ShieldAlert,
  Sparkles,
  Ticket,
  TrendingUp,
  Users,
} from 'lucide-react'
import { ObsCard, ObsHero, ObsPageShell } from '@/components/obsidian'
import type {
  CustomerOpsMetrics,
  PlanTier,
  TenantRow,
  TenantStatus,
} from '@/lib/admin/customer-ops-types'

type StatusFilter = TenantStatus | 'all'
type PlanFilter = PlanTier | 'all'

export function CustomerOpsClient({
  tenants,
  metrics,
}: {
  tenants: TenantRow[]
  metrics: CustomerOpsMetrics
}) {
  const [keyword, setKeyword] = useState('')
  const [planFilter, setPlanFilter] = useState<PlanFilter>('all')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')

  const filteredTenants = useMemo(() => {
    const q = keyword.trim().toLowerCase()
    return tenants.filter((tenant) => {
      if (planFilter !== 'all' && tenant.plan !== planFilter) return false
      if (statusFilter !== 'all' && tenant.status !== statusFilter) return false
      if (q && !`${tenant.name} ${tenant.slug}`.toLowerCase().includes(q)) return false
      return true
    })
  }, [keyword, planFilter, statusFilter, tenants])

  return (
    <ObsPageShell>
      <div className="w-full px-8 xl:px-12 2xl:px-16 pb-16">
        <ObsHero
          eyebrow="Admin"
          title="Customer Operations"
          caption="本番DBのOrganizationをもとに、実在するテナント・ユーザー・商談・問い合わせ・活動量を集計します。"
          action={
            <span
              className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full uppercase tracking-[0.08em]"
              style={{
                color: '#FFC107',
                backgroundColor: 'rgba(255,193,7,0.14)',
              }}
            >
              <ShieldAlert size={11} />
              開発者専用
            </span>
          }
        />

        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
          <MetricCard
            label="総テナント"
            value={metrics.totalTenants.toLocaleString()}
            sub={`アクティブ ${metrics.activeTenantCount}`}
            icon={Building2}
            accent="var(--color-obs-primary)"
          />
          <MetricCard
            label="ユーザー"
            value={metrics.totalUsers.toLocaleString()}
            sub={`30日Active ${metrics.activeUsers30d}`}
            icon={Users}
            accent="#50C8FF"
          />
          <MetricCard
            label="企業データ"
            value={metrics.totalCompanies.toLocaleString()}
            sub="全テナント合計"
            icon={Database}
            accent="#4BC88C"
          />
          <MetricCard
            label="商談 / チケット"
            value={`${metrics.totalDeals.toLocaleString()} / ${metrics.totalTickets.toLocaleString()}`}
            sub="Deal / Ticket"
            icon={Ticket}
            accent="#FFC107"
          />
          <MetricCard
            label="30日活動"
            value={metrics.totalActivities30d.toLocaleString()}
            sub={`F:${metrics.planCounts.Free} L:${metrics.planCounts.Lite} S:${metrics.planCounts.Standard} P:${metrics.planCounts.PRO}`}
            icon={Activity}
            accent="#FF8A65"
          />
        </div>

        <div className="mb-4 flex flex-wrap items-center gap-2">
          <div
            className="flex-1 min-w-[260px] flex items-center gap-2 px-3 h-10 rounded-[var(--radius-obs-md)]"
            style={{ backgroundColor: 'var(--color-obs-surface-high)' }}
          >
            <Search size={14} style={{ color: 'var(--color-obs-text-subtle)' }} />
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="テナント名・slugで検索"
              className="flex-1 bg-transparent border-0 outline-none text-[13px]"
              style={{ color: 'var(--color-obs-text)' }}
            />
          </div>

          <SegmentedControl<PlanFilter>
            options={[
              { value: 'all', label: 'すべて' },
              { value: 'Free', label: 'Free' },
              { value: 'Lite', label: 'Lite' },
              { value: 'Standard', label: 'Standard' },
              { value: 'PRO', label: 'PRO' },
            ]}
            value={planFilter}
            onChange={setPlanFilter}
          />

          <SegmentedControl<StatusFilter>
            options={[
              { value: 'all', label: '全状態' },
              { value: 'active', label: 'アクティブ' },
              { value: 'dormant', label: '休眠' },
            ]}
            value={statusFilter}
            onChange={setStatusFilter}
          />
        </div>

        {filteredTenants.length === 0 ? (
          <ObsCard depth="high" padding="lg" radius="xl">
            <p className="text-[13px] text-center py-8" style={{ color: 'var(--color-obs-text-muted)' }}>
              該当するテナントが見つかりません。本番DBにOrganizationが1件だけなら、この画面も1件だけ表示されます。
            </p>
          </ObsCard>
        ) : (
          <ObsCard depth="high" padding="none" radius="xl" className="overflow-hidden">
            <div
              className="grid grid-cols-[2fr_0.9fr_1fr_1fr_1fr_1fr_0.4fr] gap-3 px-5 py-3 text-[11px] font-medium uppercase tracking-[0.08em]"
              style={{
                color: 'var(--color-obs-text-subtle)',
                backgroundColor: 'var(--color-obs-surface-high)',
              }}
            >
              <span>テナント</span>
              <span>プラン</span>
              <span>ユーザー</span>
              <span>企業 / 商談</span>
              <span>問い合わせ</span>
              <span>連携</span>
              <span></span>
            </div>

            {filteredTenants.map((tenant, i) => (
              <Link
                key={tenant.id}
                href={`/admin/customer-ops/${tenant.id}`}
                className="block transition-colors"
              >
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="grid grid-cols-[2fr_0.9fr_1fr_1fr_1fr_1fr_0.4fr] gap-3 px-5 py-4 hover:bg-[var(--color-obs-surface-high)] cursor-pointer"
                  style={{
                    borderTop: i === 0 ? 'none' : '1px solid rgba(255,255,255,0.04)',
                  }}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className="w-9 h-9 rounded-[var(--radius-obs-md)] flex items-center justify-center shrink-0"
                      style={{
                        background:
                          tenant.status === 'active'
                            ? 'linear-gradient(135deg, var(--color-obs-primary) 0%, var(--color-obs-primary-container) 100%)'
                            : 'var(--color-obs-surface-highest)',
                      }}
                    >
                      <Building2
                        size={14}
                        style={{
                          color:
                            tenant.status === 'active'
                              ? 'var(--color-obs-on-primary)'
                              : 'var(--color-obs-text-subtle)',
                        }}
                      />
                    </div>
                    <div className="min-w-0">
                      <p
                        className="text-[13px] font-semibold truncate"
                        style={{ color: 'var(--color-obs-text)' }}
                      >
                        {tenant.name}
                      </p>
                      <p className="text-[11px] truncate" style={{ color: 'var(--color-obs-text-subtle)' }}>
                        <StatusBadge status={tenant.status} />
                        <span className="ml-2">
                          最終活動: {formatDateShort(tenant.lastActivityAt)}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <PlanBadge plan={tenant.plan} />
                  </div>

                  <div className="flex flex-col justify-center text-[12px]">
                    <span className="tabular-nums" style={{ color: 'var(--color-obs-text)' }}>
                      {tenant.userCount.toLocaleString()} 名
                    </span>
                    <span className="text-[10.5px]" style={{ color: 'var(--color-obs-text-subtle)' }}>
                      30日Active: {tenant.activeUsers30d.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex flex-col justify-center text-[12px]">
                    <span className="tabular-nums" style={{ color: 'var(--color-obs-text)' }}>
                      {tenant.companyCount.toLocaleString()} 社
                    </span>
                    <span className="text-[10.5px]" style={{ color: 'var(--color-obs-text-subtle)' }}>
                      商談 {tenant.dealCount.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex flex-col justify-center text-[12px]">
                    <span className="tabular-nums" style={{ color: 'var(--color-obs-text)' }}>
                      {tenant.ticketCount.toLocaleString()} 件
                    </span>
                    <span className="text-[10.5px]" style={{ color: 'var(--color-obs-text-subtle)' }}>
                      活動 {tenant.activityCount30d.toLocaleString()} / 30日
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-[11px]" style={{ color: 'var(--color-obs-text-muted)' }}>
                    <IntegrationDot label="G" active={tenant.integrations.google} />
                    <IntegrationDot label="S" active={tenant.integrations.slack} />
                    <IntegrationDot label="M" active={tenant.integrations.microsoft} />
                  </div>

                  <div className="flex items-center justify-end">
                    <ChevronRight size={16} style={{ color: 'var(--color-obs-text-subtle)' }} />
                  </div>
                </motion.div>
              </Link>
            ))}
          </ObsCard>
        )}

        <ObsCard depth="low" padding="md" radius="xl" className="mt-4">
          <div
            className="text-[11.5px] font-medium uppercase tracking-[0.1em] mb-2"
            style={{ color: 'var(--color-obs-text-subtle)' }}
          >
            このページについて
          </div>
          <ul className="text-[12.5px] space-y-1.5" style={{ color: 'var(--color-obs-text-muted)' }}>
            <li>・表示対象は本番DBに存在する Organization のみです。サンプルテナントは表示しません。</li>
            <li>・30日ActiveはActivityを作成したユーザー数で集計します。</li>
            <li>・アクセスは開発者テナントに限定します。`BGM_TENANT_ID` を本番環境に設定してください。</li>
          </ul>
        </ObsCard>
      </div>
    </ObsPageShell>
  )
}

function MetricCard({
  label,
  value,
  sub,
  icon: Icon,
  accent,
}: {
  label: string
  value: string
  sub?: string
  icon: React.ElementType
  accent: string
}) {
  return (
    <ObsCard depth="high" padding="md" radius="xl">
      <div className="flex items-start justify-between mb-2">
        <p
          className="text-[10.5px] font-medium uppercase tracking-[0.1em]"
          style={{ color: 'var(--color-obs-text-subtle)' }}
        >
          {label}
        </p>
        <div
          className="w-7 h-7 rounded-[var(--radius-obs-sm)] flex items-center justify-center"
          style={{ backgroundColor: `color-mix(in srgb, ${accent} 14%, transparent)` }}
        >
          <Icon size={13} style={{ color: accent }} />
        </div>
      </div>
      <p
        className="font-[family-name:var(--font-display)] text-[20px] font-bold tabular-nums tracking-[-0.02em]"
        style={{ color: 'var(--color-obs-text)' }}
      >
        {value}
      </p>
      {sub && (
        <p className="text-[11px] mt-0.5" style={{ color: 'var(--color-obs-text-subtle)' }}>
          {sub}
        </p>
      )}
    </ObsCard>
  )
}

function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[]
  value: T
  onChange: (v: T) => void
}) {
  return (
    <div
      className="inline-flex p-1 rounded-[var(--radius-obs-md)] gap-0.5"
      style={{ backgroundColor: 'var(--color-obs-surface-high)' }}
    >
      {options.map((opt) => {
        const active = value === opt.value
        return (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className="px-3 h-8 rounded-[calc(var(--radius-obs-md)-2px)] text-[12px] font-medium transition-colors"
            style={{
              backgroundColor: active ? 'var(--color-obs-surface-highest)' : 'transparent',
              color: active ? 'var(--color-obs-text)' : 'var(--color-obs-text-muted)',
            }}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}

function StatusBadge({ status }: { status: TenantStatus }) {
  const config: Record<TenantStatus, { label: string; bg: string; fg: string }> = {
    active: { label: 'Active', bg: 'rgba(75,200,140,0.14)', fg: '#4BC88C' },
    dormant: { label: 'Dormant', bg: 'rgba(255,193,7,0.14)', fg: '#FFC107' },
  }
  const c = config[status]
  return (
    <span
      className="inline-block px-1.5 py-[1px] rounded text-[9.5px] font-semibold uppercase tracking-[0.06em]"
      style={{ backgroundColor: c.bg, color: c.fg }}
    >
      {c.label}
    </span>
  )
}

function PlanBadge({ plan }: { plan: PlanTier }) {
  const config: Record<PlanTier, { Icon: React.ElementType; bg: string; fg: string }> = {
    Free: { Icon: Sparkles, bg: 'var(--color-obs-surface-highest)', fg: 'var(--color-obs-text-muted)' },
    Lite: { Icon: TrendingUp, bg: 'rgba(80,200,255,0.14)', fg: '#50C8FF' },
    Standard: { Icon: TrendingUp, bg: 'rgba(80,200,255,0.14)', fg: '#50C8FF' },
    PRO: { Icon: Crown, bg: 'rgba(255,193,7,0.14)', fg: '#FFC107' },
  }
  const c = config[plan]
  const Icon = c.Icon
  return (
    <span
      className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full"
      style={{ backgroundColor: c.bg, color: c.fg }}
    >
      <Icon size={10} />
      {plan}
    </span>
  )
}

function IntegrationDot({ label, active }: { label: string; active: boolean }) {
  return (
    <span
      className="inline-flex w-6 h-6 items-center justify-center rounded-full text-[10px] font-semibold"
      style={{
        backgroundColor: active ? 'rgba(75,200,140,0.14)' : 'var(--color-obs-surface-highest)',
        color: active ? '#4BC88C' : 'var(--color-obs-text-subtle)',
      }}
      title={`${label}: ${active ? '連携済み' : '未連携'}`}
    >
      {label}
    </span>
  )
}

function formatDateShort(value: string | null) {
  if (!value) return '-'
  return new Date(value).toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric' })
}
