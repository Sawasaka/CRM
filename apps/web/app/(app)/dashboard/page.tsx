'use client'

import { useMemo, useState } from 'react'
import {
  Mail,
  PhoneCall,
} from 'lucide-react'
import {
  ObsCard,
  ObsHero,
  ObsPageShell,
  ObsSectionHeader,
} from '@/components/obsidian'

// ─── Period filter ────────────────────────────────────────────────────────────
type Period = 'this_month' | 'last_month' | 'this_quarter' | 'last_quarter'

const PERIOD_OPTIONS: { value: Period; label: string }[] = [
  { value: 'this_month',   label: '今月' },
  { value: 'last_month',   label: '先月' },
  { value: 'this_quarter', label: '今四半期' },
  { value: 'last_quarter', label: '前四半期' },
]

// ─── Mock data: 担当者別パフォーマンス ────────────────────────────────────────
type OwnerRow = {
  name: string
  callCount: number
  mailSent: number
  appointments: number
  deals: number
  callTrend: number  // 前期比 %
  mailTrend: number
}

const MOCK_OWNER_ROWS: Record<Period, OwnerRow[]> = {
  this_month: [],
  last_month: [],
  this_quarter: [],
  last_quarter: [],
}

// ─── Mock data: マーケティング指標 ───────────────────────────────────────────
type MarketingStats = {
  mailSent: number
  mailDelivered: number
  mailOpened: number
  mailClicked: number
  docOpened: number
  docDownloaded: number
}

const MOCK_MARKETING: Record<Period, MarketingStats> = {
  this_month: { mailSent: 0, mailDelivered: 0, mailOpened: 0, mailClicked: 0, docOpened: 0, docDownloaded: 0 },
  last_month: { mailSent: 0, mailDelivered: 0, mailOpened: 0, mailClicked: 0, docOpened: 0, docDownloaded: 0 },
  this_quarter: { mailSent: 0, mailDelivered: 0, mailOpened: 0, mailClicked: 0, docOpened: 0, docDownloaded: 0 },
  last_quarter: { mailSent: 0, mailDelivered: 0, mailOpened: 0, mailClicked: 0, docOpened: 0, docDownloaded: 0 },
}

const DASH_PANEL_SURFACE =
  'linear-gradient(145deg, rgba(27,28,32,0.66) 0%, rgba(19,20,24,0.84) 50%, rgba(12,13,16,0.94) 100%)'
const DASH_PANEL_RING =
  'inset 0 0 0 1px rgba(171,199,255,0.105), inset 1px 1px 0 rgba(255,255,255,0.035), 0 18px 48px rgba(0,0,0,0.30)'
const DASH_HEADER_SURFACE =
  'linear-gradient(90deg, rgba(171,199,255,0.050), rgba(255,255,255,0.018), rgba(255,255,255,0.004))'
const DASH_ROW_SURFACE =
  'linear-gradient(90deg, rgba(255,255,255,0.010), rgba(171,199,255,0.012), rgba(255,255,255,0))'
const DASH_ROW_ALT_SURFACE =
  'linear-gradient(90deg, rgba(171,199,255,0.020), rgba(255,255,255,0.010), rgba(255,255,255,0))'
const DASH_DIVIDER = 'rgba(171,199,255,0.075)'

function pct(part: number, total: number): number {
  if (!total) return 0
  return Math.round((part / total) * 1000) / 10
}

export default function DashboardPage() {
  const [period, setPeriod] = useState<Period>('this_month')

  const ownerRows = MOCK_OWNER_ROWS[period]
  const marketing = MOCK_MARKETING[period]

  const totals = useMemo(() => {
    return ownerRows.reduce(
      (acc, r) => {
        acc.callCount += r.callCount
        acc.mailSent += r.mailSent
        acc.appointments += r.appointments
        return acc
      },
      { callCount: 0, mailSent: 0, appointments: 0 },
    )
  }, [ownerRows])

  const openRate = pct(marketing.mailOpened, marketing.mailDelivered)
  const docOpenRate = pct(marketing.docOpened, marketing.mailDelivered)

  // 担当者別の最大値（バーの正規化用）
  const maxCall = Math.max(...ownerRows.map((r) => r.callCount), 1)
  const maxMail = Math.max(...ownerRows.map((r) => r.mailSent), 1)

  return (
    <ObsPageShell>
      <div className="w-full px-8 xl:px-12 2xl:px-16 pb-24">
        {/* ── Hero ── */}
        <ObsHero
          eyebrow="Action Board"
          title="アクションボード"
          titleAccent="ボード"
          caption="チーム・担当者・マーケ施策の実績を、期間別に一望。"
          action={
            <div
              className="inline-flex items-center gap-1 p-1 rounded-[var(--radius-obs-md)] fo-glass-rim"
              style={{
                background:
                  'linear-gradient(145deg, rgba(41,43,50,0.78), rgba(18,19,23,0.70))',
                backdropFilter: 'blur(10px)',
                boxShadow:
                  'inset 0 0 0 1px rgba(171,199,255,0.12), inset 0 1px 0 rgba(255,255,255,0.055), 0 14px 34px rgba(0,0,0,0.22)',
              }}
            >
              {PERIOD_OPTIONS.map((opt) => {
                const active = period === opt.value
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setPeriod(opt.value)}
                    className="h-7 px-3 rounded-[var(--radius-obs-sm)] text-[12px] font-medium transition-colors"
                    style={{
                      background: active
                        ? 'linear-gradient(140deg, rgba(171,199,255,0.28), rgba(0,113,227,0.44))'
                        : 'transparent',
                      color: active ? 'var(--color-obs-on-primary)' : 'var(--color-obs-text-muted)',
                      boxShadow: active
                        ? 'inset 0 1px 0 rgba(255,255,255,0.24), 0 0 18px rgba(0,113,227,0.22)'
                        : 'none',
                    }}
                  >
                    {opt.label}
                  </button>
                )
              })}
            </div>
          }
        />

        {/* ── 担当者別パフォーマンス ── */}
        <div className="mt-8">
          <ObsSectionHeader
            title="担当者別パフォーマンス"
            caption={`期間合計: コール ${totals.callCount.toLocaleString()}件 / メール ${totals.mailSent.toLocaleString()}通`}
          />
          <ObsCard
            depth="high"
            padding="none"
            radius="xl"
            className="mt-3 overflow-hidden"
            style={{
              background: DASH_PANEL_SURFACE,
              boxShadow: DASH_PANEL_RING,
            }}
          >
            <div
              className="grid items-center px-5 py-3 text-[10.5px] font-medium tracking-[0.1em] uppercase"
              style={{
                gridTemplateColumns: '1.3fr 1.4fr 1.4fr 0.8fr',
                color: 'rgba(216,224,240,0.62)',
                background: DASH_HEADER_SURFACE,
                boxShadow: `inset 0 -1px 0 0 ${DASH_DIVIDER}`,
              }}
            >
              <span>担当者</span>
              <span>コール数</span>
              <span>メール送信数</span>
              <span className="text-right">商談実施</span>
            </div>

            {ownerRows.map((row, i) => (
              <div
                key={row.name}
                className="grid items-center px-5 py-3.5"
                style={{
                  gridTemplateColumns: '1.3fr 1.4fr 1.4fr 0.8fr',
                  borderTop: i === 0 ? 'none' : `1px solid ${DASH_DIVIDER}`,
                  background: i % 2 === 0 ? DASH_ROW_SURFACE : DASH_ROW_ALT_SURFACE,
                }}
              >
                {/* 担当者 */}
                <div className="flex items-center gap-2 min-w-0">
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0"
                    style={{
                      background:
                        'radial-gradient(circle at 32% 28%, rgba(255,255,255,0.95), var(--color-obs-primary) 44%, rgba(171,199,255,0.24) 100%)',
                      color: '#07111f',
                      boxShadow:
                        'inset 0 0 0 1px rgba(255,255,255,0.24), 0 0 18px rgba(0,113,227,0.22)',
                    }}
                  >
                    {row.name[0]}
                  </div>
                  <span className="text-[13px] font-medium truncate" style={{ color: 'var(--color-obs-text)' }}>
                    {row.name}
                  </span>
                </div>

                {/* コール数 */}
                <MetricBar
                  icon={PhoneCall}
                  value={row.callCount}
                  max={maxCall}
                  tint="primary"
                />

                {/* メール送信数 */}
                <MetricBar
                  icon={Mail}
                  value={row.mailSent}
                  max={maxMail}
                  tint="low"
                />

                {/* アポ */}
                <span className="text-[13px] tabular-nums text-right" style={{ color: 'var(--color-obs-text)' }}>
                  {row.appointments}
                </span>
              </div>
            ))}

            {/* 全体(合計)行 — 直前の行と十分な余白を確保 */}
            <div
              className="grid items-center px-5 py-5 mt-2"
              style={{
                gridTemplateColumns: '1.3fr 1.4fr 1.4fr 0.8fr',
                borderTop: '1px solid rgba(171,199,255,0.18)',
                background:
                  'linear-gradient(90deg, rgba(171,199,255,0.12), rgba(0,113,227,0.055), rgba(255,255,255,0.016))',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.035)',
              }}
            >
              {/* 担当者欄: "全体" ラベル */}
              <div className="flex items-center gap-2 min-w-0">
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0"
                  style={{
                    background: 'rgba(171,199,255,0.16)',
                    color: 'var(--color-obs-primary)',
                    boxShadow: 'inset 0 0 0 1px rgba(171,199,255,0.32)',
                  }}
                >
                  Σ
                </div>
                <span
                  className="text-[13px] font-bold tracking-[0.02em]"
                  style={{ color: 'var(--color-obs-primary)' }}
                >
                  全体
                </span>
              </div>

              {/* コール合計 */}
              <MetricBar
                icon={PhoneCall}
                value={totals.callCount}
                max={totals.callCount}
                tint="primary"
              />

              {/* メール合計 */}
              <MetricBar
                icon={Mail}
                value={totals.mailSent}
                max={totals.mailSent}
                tint="low"
              />

              {/* アポ合計 */}
              <span
                className="text-[14px] tabular-nums text-right font-bold"
                style={{ color: 'var(--color-obs-primary)' }}
              >
                {totals.appointments}
              </span>
            </div>
          </ObsCard>
        </div>

        {/* ── メール配信 (マーケ施策) ── */}
        <div className="mt-8">
          <ObsSectionHeader title="メール配信" caption="マーケ施策のパフォーマンス" />
          <div className="mt-3 grid grid-cols-1 lg:grid-cols-3 gap-3">
          {/* メール配信全体 */}
          <ObsCard
            depth="high"
            padding="lg"
            radius="xl"
            className="fo-glass-rim fo-lift"
            style={{
              background: DASH_PANEL_SURFACE,
              boxShadow: DASH_PANEL_RING,
            }}
          >
            <ObsSectionHeader title="メール送信" caption="送信通数" />
            <div className="mt-3 flex items-baseline gap-2">
              <span
                className="font-[family-name:var(--font-display)] text-[34px] font-bold tabular-nums tracking-[-0.03em]"
                style={{ color: 'var(--color-obs-text)' }}
              >
                {marketing.mailSent.toLocaleString()}
              </span>
              <span className="text-[13px]" style={{ color: 'var(--color-obs-text-muted)' }}>通</span>
            </div>
          </ObsCard>

          {/* メール開封率 */}
          <ObsCard
            depth="high"
            padding="lg"
            radius="xl"
            className="fo-glass-rim fo-lift"
            style={{
              background:
                'linear-gradient(145deg, rgba(30,39,52,0.80), rgba(23,25,30,0.92))',
              boxShadow:
                'inset 0 0 0 1px rgba(171,199,255,0.14), inset 0 1px 0 rgba(255,255,255,0.055), 0 20px 44px rgba(0,113,227,0.10)',
            }}
          >
            <ObsSectionHeader title="メール開封率" caption={`開封 ${marketing.mailOpened.toLocaleString()}`} />
            <div className="mt-3 flex items-baseline gap-2">
              <span
                className="font-[family-name:var(--font-display)] text-[34px] font-bold tabular-nums tracking-[-0.03em]"
                style={{ color: 'var(--color-obs-primary)' }}
              >
                {openRate}
              </span>
              <span className="text-[13px]" style={{ color: 'var(--color-obs-text-muted)' }}>%</span>
            </div>
            <div className="mt-3 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--color-obs-surface-lowest)' }}>
              <div
                className="h-full rounded-full"
                style={{
                  width: `${Math.min(openRate, 100)}%`,
                  background: 'linear-gradient(90deg, var(--color-obs-primary) 0%, var(--color-obs-primary-container) 100%)',
                }}
              />
            </div>
          </ObsCard>

          {/* 資料開封率 */}
          <ObsCard
            depth="high"
            padding="lg"
            radius="xl"
            className="fo-glass-rim fo-lift"
            style={{
              background:
                'linear-gradient(145deg, rgba(48,41,31,0.70), rgba(24,25,29,0.92))',
              boxShadow:
                'inset 0 0 0 1px rgba(255,190,96,0.14), inset 0 1px 0 rgba(255,255,255,0.055), 0 20px 44px rgba(255,177,72,0.08)',
            }}
          >
            <ObsSectionHeader title="資料開封率" caption={`開封 ${marketing.docOpened.toLocaleString()}`} />
            <div className="mt-3 flex items-baseline gap-2">
              <span
                className="font-[family-name:var(--font-display)] text-[34px] font-bold tabular-nums tracking-[-0.03em]"
                style={{ color: 'var(--color-obs-middle)' }}
              >
                {docOpenRate}
              </span>
              <span className="text-[13px]" style={{ color: 'var(--color-obs-text-muted)' }}>%</span>
            </div>
            <div className="mt-3 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--color-obs-surface-lowest)' }}>
              <div
                className="h-full rounded-full"
                style={{
                  width: `${Math.min(docOpenRate, 100)}%`,
                  background: 'linear-gradient(90deg, var(--color-obs-middle) 0%, #ffd07a 100%)',
                }}
              />
            </div>
          </ObsCard>
          </div>
        </div>
      </div>
    </ObsPageShell>
  )
}

// ─── Sub: 担当者行のメトリクスバー ───────────────────────────────────────────
function MetricBar({
  icon: Icon,
  value,
  max,
  tint,
}: {
  icon: React.ElementType
  value: number
  max: number
  tint: 'primary' | 'low'
}) {
  const TINT: Record<typeof tint, { fg: string; bar: string; bg: string }> = {
    primary: {
      fg:  'var(--color-obs-primary)',
      bar: 'linear-gradient(90deg, var(--color-obs-primary) 0%, var(--color-obs-primary-container) 100%)',
      bg:  'rgba(171,199,255,0.10)',
    },
    low: {
      fg:  'var(--color-obs-low)',
      bar: 'linear-gradient(90deg, var(--color-obs-low) 0%, #56b3ee 100%)',
      bg:  'rgba(126,198,255,0.10)',
    },
  }
  const t = TINT[tint]
  const widthPct = Math.max(4, (value / max) * 100)
  return (
    <div className="flex items-center gap-2.5 pr-3">
      <Icon size={12} strokeWidth={2} style={{ color: t.fg, flexShrink: 0 }} />
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-1.5 mb-1">
          <span className="text-[13px] font-semibold tabular-nums" style={{ color: 'var(--color-obs-text)' }}>
            {value.toLocaleString()}
          </span>
        </div>
        <div
          className="h-1.5 rounded-full overflow-hidden"
          style={{ backgroundColor: t.bg }}
        >
          <div
            className="h-full rounded-full"
            style={{
              width: `${widthPct}%`,
              background: t.bar,
              transition: 'width 0.4s var(--ease-liquid)',
            }}
          />
        </div>
      </div>
    </div>
  )
}
