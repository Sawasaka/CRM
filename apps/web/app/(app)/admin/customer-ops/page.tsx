'use client'

import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  Building2,
  ChevronRight,
  Search,
  ShieldAlert,
  TrendingUp,
  Users,
  Coins,
  Sparkles,
  Crown,
} from 'lucide-react'
import {
  ObsCard,
  ObsHero,
  ObsPageShell,
} from '@/components/obsidian'

// ─── 型定義 ──────────────────────────────────────────────────────────────

type PlanTier = 'Free' | 'Standard' | 'PRO'
type TenantStatus = 'active' | 'dormant' | 'churned'

interface TenantRow {
  id: string
  name: string
  plan: PlanTier
  seatsCommitted: number
  seatsActive: number
  mrr: number
  activeUsers30d: number
  creditsUsed: number
  creditsRemaining: number
  integrations: { google: boolean; slack: boolean; microsoft: boolean }
  contractStartedAt: string
  lastLoginAt: string
  status: TenantStatus
  // 追加機能・オプション (集計用)
  totalAddonRevenue: number  // 追加クレジット + 機能リクエスト + 初期費用 + サポートオプション の累計
  hasSupportOption: boolean
  hasMigrationSupport: boolean
}

// ─── サンプルデータ ─────────────────────────────────────────────────────

const SAMPLE_TENANTS: TenantRow[] = [
  {
    id: 'tenant_001',
    name: '株式会社サンプル',
    plan: 'PRO',
    seatsCommitted: 12,
    seatsActive: 11,
    mrr: 108000,
    activeUsers30d: 9,
    creditsUsed: 18400,
    creditsRemaining: 5600,
    integrations: { google: true, slack: true, microsoft: false },
    contractStartedAt: '2026-01-15',
    lastLoginAt: '2026-05-05T14:23:00',
    status: 'active',
    totalAddonRevenue: 280000,
    hasSupportOption: true,
    hasMigrationSupport: true,
  },
  {
    id: 'tenant_002',
    name: '合同会社グロース',
    plan: 'Standard',
    seatsCommitted: 5,
    seatsActive: 5,
    mrr: 30000,
    activeUsers30d: 4,
    creditsUsed: 3200,
    creditsRemaining: 1800,
    integrations: { google: true, slack: false, microsoft: false },
    contractStartedAt: '2026-03-02',
    lastLoginAt: '2026-05-05T11:08:00',
    status: 'active',
    totalAddonRevenue: 50000,
    hasSupportOption: false,
    hasMigrationSupport: false,
  },
  {
    id: 'tenant_003',
    name: 'フューチャーテック株式会社',
    plan: 'PRO',
    seatsCommitted: 25,
    seatsActive: 22,
    mrr: 225000,
    activeUsers30d: 20,
    creditsUsed: 42000,
    creditsRemaining: 8000,
    integrations: { google: true, slack: true, microsoft: true },
    contractStartedAt: '2025-11-10',
    lastLoginAt: '2026-05-05T09:45:00',
    status: 'active',
    totalAddonRevenue: 720000,
    hasSupportOption: true,
    hasMigrationSupport: true,
  },
  {
    id: 'tenant_004',
    name: 'スタートアップABC',
    plan: 'Free',
    seatsCommitted: 3,
    seatsActive: 2,
    mrr: 0,
    activeUsers30d: 2,
    creditsUsed: 250,
    creditsRemaining: 50,
    integrations: { google: true, slack: false, microsoft: false },
    contractStartedAt: '2026-04-22',
    lastLoginAt: '2026-05-04T18:30:00',
    status: 'active',
    totalAddonRevenue: 0,
    hasSupportOption: false,
    hasMigrationSupport: false,
  },
  {
    id: 'tenant_005',
    name: '株式会社レガシー',
    plan: 'Standard',
    seatsCommitted: 8,
    seatsActive: 1,
    mrr: 48000,
    activeUsers30d: 1,
    creditsUsed: 120,
    creditsRemaining: 4880,
    integrations: { google: false, slack: false, microsoft: false },
    contractStartedAt: '2026-02-01',
    lastLoginAt: '2026-04-08T10:00:00',
    status: 'dormant',
    totalAddonRevenue: 0,
    hasSupportOption: false,
    hasMigrationSupport: false,
  },
]

// ─── BGMテナント判定 ─────────────────────────────────────────────────────

function useIsBGMTenant(): boolean {
  // const currentTenantId = useCurrentTenantId()
  // return currentTenantId === process.env.NEXT_PUBLIC_BGM_TENANT_ID
  return true // MVP: モック
}

// ─── ページコンポーネント ───────────────────────────────────────────────

export default function CustomerOpsPage() {
  const isBGMTenant = useIsBGMTenant()
  const [keyword, setKeyword] = useState('')
  const [planFilter, setPlanFilter] = useState<PlanTier | 'all'>('all')
  const [statusFilter, setStatusFilter] = useState<TenantStatus | 'all'>('all')

  // BGMテナント以外はアクセス不可
  if (!isBGMTenant) {
    return (
      <ObsPageShell>
        <div className="w-full px-8 py-16 flex flex-col items-center justify-center gap-3">
          <ShieldAlert size={48} style={{ color: '#FFC107' }} />
          <h2
            className="font-[family-name:var(--font-display)] text-xl font-semibold"
            style={{ color: 'var(--color-obs-text)' }}
          >
            アクセス権限がありません
          </h2>
          <p className="text-[13px]" style={{ color: 'var(--color-obs-text-muted)' }}>
            このページは Front Office 開発者専用です。
          </p>
        </div>
      </ObsPageShell>
    )
  }

  // フィルタリング
  const filteredTenants = SAMPLE_TENANTS.filter((t) => {
    if (planFilter !== 'all' && t.plan !== planFilter) return false
    if (statusFilter !== 'all' && t.status !== statusFilter) return false
    if (keyword.trim() && !t.name.toLowerCase().includes(keyword.trim().toLowerCase())) return false
    return true
  })

  // 集計メトリクス
  const metrics = useMemo(() => {
    const totalMrr = SAMPLE_TENANTS.reduce((sum, t) => sum + t.mrr, 0)
    const totalAddon = SAMPLE_TENANTS.reduce((sum, t) => sum + t.totalAddonRevenue, 0)
    const activeTenantCount = SAMPLE_TENANTS.filter((t) => t.status === 'active').length
    const totalSeats = SAMPLE_TENANTS.reduce((sum, t) => sum + t.seatsCommitted, 0)
    const totalActive30d = SAMPLE_TENANTS.reduce((sum, t) => sum + t.activeUsers30d, 0)
    const planCounts: Record<PlanTier, number> = { Free: 0, Standard: 0, PRO: 0 }
    SAMPLE_TENANTS.forEach((t) => {
      planCounts[t.plan] += 1
    })
    return {
      totalMrr,
      totalAddon,
      activeTenantCount,
      totalSeats,
      totalActive30d,
      planCounts,
      arr: totalMrr * 12,
    }
  }, [])

  return (
    <ObsPageShell>
      <div className="w-full px-8 xl:px-12 2xl:px-16 pb-16">
        <ObsHero
          eyebrow="Admin"
          title="Customer Operations"
          caption="全テナントの契約状況・メトリクス・追加オプション購入履歴を一元管理。5分おきに集計が更新されます。"
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

        {/* ── サマリーメトリクス ── */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
          <MetricCard
            label="MRR (月次経常収益)"
            value={`¥${metrics.totalMrr.toLocaleString()}`}
            sub={`ARR ¥${metrics.arr.toLocaleString()}`}
            icon={TrendingUp}
            accent="#4BC88C"
          />
          <MetricCard
            label="アクティブテナント"
            value={`${metrics.activeTenantCount}`}
            sub={`/ 全 ${SAMPLE_TENANTS.length} テナント`}
            icon={Building2}
            accent="var(--color-obs-primary)"
          />
          <MetricCard
            label="契約シート数"
            value={metrics.totalSeats.toLocaleString()}
            sub={`30日アクティブ ${metrics.totalActive30d} 名`}
            icon={Users}
            accent="#50C8FF"
          />
          <MetricCard
            label="プラン構成"
            value={`F:${metrics.planCounts.Free} / S:${metrics.planCounts.Standard} / P:${metrics.planCounts.PRO}`}
            sub="Free / Standard / PRO"
            icon={Crown}
            accent="#FFC107"
          />
          <MetricCard
            label="追加オプション 売上"
            value={`¥${metrics.totalAddon.toLocaleString()}`}
            sub="累計 (機能R+クレ+初期+サポート)"
            icon={Coins}
            accent="#FF8A65"
          />
        </div>

        {/* ── 検索 & フィルタ ── */}
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
              placeholder="テナント名で検索"
              className="flex-1 bg-transparent border-0 outline-none text-[13px]"
              style={{ color: 'var(--color-obs-text)' }}
            />
          </div>

          <SegmentedControl<PlanTier | 'all'>
            options={[
              { value: 'all', label: 'すべて' },
              { value: 'Free', label: 'Free' },
              { value: 'Standard', label: 'Standard' },
              { value: 'PRO', label: 'PRO' },
            ]}
            value={planFilter}
            onChange={setPlanFilter}
          />

          <SegmentedControl<TenantStatus | 'all'>
            options={[
              { value: 'all', label: '全状態' },
              { value: 'active', label: 'アクティブ' },
              { value: 'dormant', label: '休眠' },
              { value: 'churned', label: '解約' },
            ]}
            value={statusFilter}
            onChange={setStatusFilter}
          />
        </div>

        {/* ── テナント一覧 ── */}
        {filteredTenants.length === 0 ? (
          <ObsCard depth="high" padding="lg" radius="xl">
            <p className="text-[13px] text-center py-8" style={{ color: 'var(--color-obs-text-muted)' }}>
              該当するテナントが見つかりません。検索条件を変更してください。
            </p>
          </ObsCard>
        ) : (
          <ObsCard depth="high" padding="none" radius="xl" className="overflow-hidden">
            {/* テーブルヘッダ */}
            <div
              className="grid grid-cols-[2fr_1fr_1fr_1.2fr_1.2fr_1fr_0.5fr] gap-3 px-5 py-3 text-[11px] font-medium uppercase tracking-[0.08em]"
              style={{
                color: 'var(--color-obs-text-subtle)',
                backgroundColor: 'var(--color-obs-surface-high)',
              }}
            >
              <span>テナント</span>
              <span>プラン</span>
              <span>シート</span>
              <span>MRR</span>
              <span>クレジット</span>
              <span>追加オプション</span>
              <span></span>
            </div>

            {/* 行 */}
            {filteredTenants.map((t, i) => (
              <Link
                key={t.id}
                href={`/admin/customer-ops/${t.id}`}
                className="block transition-colors"
              >
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="grid grid-cols-[2fr_1fr_1fr_1.2fr_1.2fr_1fr_0.5fr] gap-3 px-5 py-4 hover:bg-[var(--color-obs-surface-high)] cursor-pointer"
                  style={{
                    borderTop:
                      i === 0 ? 'none' : '1px solid rgba(255,255,255,0.04)',
                  }}
                >
                  {/* テナント名 + ステータス */}
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className="w-9 h-9 rounded-[var(--radius-obs-md)] flex items-center justify-center shrink-0"
                      style={{
                        background:
                          t.status === 'active'
                            ? 'linear-gradient(135deg, var(--color-obs-primary) 0%, var(--color-obs-primary-container) 100%)'
                            : 'var(--color-obs-surface-highest)',
                      }}
                    >
                      <Building2
                        size={14}
                        style={{
                          color:
                            t.status === 'active'
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
                        {t.name}
                      </p>
                      <p className="text-[11px] truncate" style={{ color: 'var(--color-obs-text-subtle)' }}>
                        <StatusBadge status={t.status} />
                        <span className="ml-2">
                          最終ログイン:{' '}
                          {new Date(t.lastLoginAt).toLocaleDateString('ja-JP', {
                            month: 'numeric',
                            day: 'numeric',
                          })}
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* プラン */}
                  <div className="flex items-center">
                    <PlanBadge plan={t.plan} />
                  </div>

                  {/* シート */}
                  <div className="flex flex-col justify-center text-[12px]">
                    <span className="tabular-nums" style={{ color: 'var(--color-obs-text)' }}>
                      {t.seatsCommitted}
                      <span className="text-[10.5px] ml-1" style={{ color: 'var(--color-obs-text-subtle)' }}>
                        ({t.seatsActive}名利用)
                      </span>
                    </span>
                    <span className="text-[10.5px]" style={{ color: 'var(--color-obs-text-subtle)' }}>
                      30日Active: {t.activeUsers30d}
                    </span>
                  </div>

                  {/* MRR */}
                  <div className="flex flex-col justify-center text-[12.5px]">
                    <span
                      className="font-semibold tabular-nums"
                      style={{ color: 'var(--color-obs-text)' }}
                    >
                      ¥{t.mrr.toLocaleString()}
                    </span>
                    <span className="text-[10.5px]" style={{ color: 'var(--color-obs-text-subtle)' }}>
                      ARR ¥{(t.mrr * 12).toLocaleString()}
                    </span>
                  </div>

                  {/* クレジット */}
                  <div className="flex flex-col justify-center text-[12px]">
                    <span className="tabular-nums" style={{ color: 'var(--color-obs-text)' }}>
                      残 {t.creditsRemaining.toLocaleString()} cr
                    </span>
                    <span className="text-[10.5px]" style={{ color: 'var(--color-obs-text-subtle)' }}>
                      消費 {t.creditsUsed.toLocaleString()} cr
                    </span>
                  </div>

                  {/* 追加オプション売上 */}
                  <div className="flex flex-col justify-center text-[12px]">
                    {t.totalAddonRevenue > 0 ? (
                      <>
                        <span
                          className="font-semibold tabular-nums"
                          style={{ color: '#FF8A65' }}
                        >
                          ¥{t.totalAddonRevenue.toLocaleString()}
                        </span>
                        <span
                          className="text-[10.5px] flex items-center gap-1"
                          style={{ color: 'var(--color-obs-text-subtle)' }}
                        >
                          {t.hasSupportOption && '🛡'}
                          {t.hasMigrationSupport && '📦'}
                          詳細→
                        </span>
                      </>
                    ) : (
                      <span style={{ color: 'var(--color-obs-text-subtle)' }}>−</span>
                    )}
                  </div>

                  {/* 矢印 */}
                  <div className="flex items-center justify-end">
                    <ChevronRight size={16} style={{ color: 'var(--color-obs-text-subtle)' }} />
                  </div>
                </motion.div>
              </Link>
            ))}
          </ObsCard>
        )}

        {/* ── 凡例・補足 ── */}
        <ObsCard depth="low" padding="md" radius="xl" className="mt-4">
          <div
            className="text-[11.5px] font-medium uppercase tracking-[0.1em] mb-2"
            style={{ color: 'var(--color-obs-text-subtle)' }}
          >
            このページについて
          </div>
          <ul className="text-[12.5px] space-y-1.5" style={{ color: 'var(--color-obs-text-muted)' }}>
            <li>・テナント数・MRR・クレジット消費は5分おきに集計更新されます。</li>
            <li>・テナント詳細ページで購入履歴・機能リクエスト・サポート利用状況を確認できます。</li>
            <li>・アクセスは BGM 開発者専用です。閲覧操作はすべて監査ログに記録されます。</li>
          </ul>
        </ObsCard>
      </div>
    </ObsPageShell>
  )
}

// ─── 部品: メトリクスカード ────────────────────────────────────────────

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

// ─── 部品: セグメントコントロール ────────────────────────────────────

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

// ─── 部品: ステータスバッジ ──────────────────────────────────────────

function StatusBadge({ status }: { status: TenantStatus }) {
  const config: Record<TenantStatus, { label: string; bg: string; fg: string }> = {
    active: { label: 'Active', bg: 'rgba(75,200,140,0.14)', fg: '#4BC88C' },
    dormant: { label: 'Dormant', bg: 'rgba(255,193,7,0.14)', fg: '#FFC107' },
    churned: { label: 'Churned', bg: 'rgba(255,90,90,0.14)', fg: '#FF5A5A' },
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

// ─── 部品: プランバッジ ──────────────────────────────────────────────

function PlanBadge({ plan }: { plan: PlanTier }) {
  const config: Record<PlanTier, { Icon: React.ElementType; bg: string; fg: string }> = {
    Free: { Icon: Sparkles, bg: 'var(--color-obs-surface-highest)', fg: 'var(--color-obs-text-muted)' },
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
