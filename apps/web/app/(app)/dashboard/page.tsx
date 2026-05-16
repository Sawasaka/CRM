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
  this_month: [
    { name: '田中 太郎', callCount: 142, mailSent: 318, appointments: 18, deals: 6, callTrend: 12,  mailTrend:  8 },
    { name: '鈴木 花子', callCount: 124, mailSent: 286, appointments: 15, deals: 4, callTrend:  4,  mailTrend: 16 },
    { name: '佐藤 次郎', callCount:  98, mailSent: 211, appointments: 11, deals: 3, callTrend: -6,  mailTrend: -3 },
    { name: '開発 太郎', callCount:  76, mailSent: 168, appointments:  8, deals: 2, callTrend: 22,  mailTrend: 18 },
  ],
  last_month: [
    { name: '田中 太郎', callCount: 127, mailSent: 295, appointments: 14, deals: 5, callTrend:  3, mailTrend: -2 },
    { name: '鈴木 花子', callCount: 119, mailSent: 247, appointments: 12, deals: 4, callTrend: -8, mailTrend:  4 },
    { name: '佐藤 次郎', callCount: 104, mailSent: 218, appointments: 10, deals: 3, callTrend:  1, mailTrend:  6 },
    { name: '開発 太郎', callCount:  62, mailSent: 142, appointments:  6, deals: 2, callTrend:  0, mailTrend:  9 },
  ],
  this_quarter: [
    { name: '田中 太郎', callCount: 412, mailSent: 921, appointments: 47, deals: 17, callTrend:  9, mailTrend: 11 },
    { name: '鈴木 花子', callCount: 358, mailSent: 802, appointments: 41, deals: 12, callTrend:  2, mailTrend:  8 },
    { name: '佐藤 次郎', callCount: 296, mailSent: 644, appointments: 32, deals:  9, callTrend: -2, mailTrend:  3 },
    { name: '開発 太郎', callCount: 196, mailSent: 422, appointments: 21, deals:  7, callTrend: 18, mailTrend: 14 },
  ],
  last_quarter: [
    { name: '田中 太郎', callCount: 378, mailSent: 829, appointments: 42, deals: 14, callTrend: 4, mailTrend:  3 },
    { name: '鈴木 花子', callCount: 351, mailSent: 742, appointments: 39, deals: 11, callTrend: 6, mailTrend:  5 },
    { name: '佐藤 次郎', callCount: 302, mailSent: 626, appointments: 31, deals: 10, callTrend: -4, mailTrend: -1 },
    { name: '開発 太郎', callCount: 166, mailSent: 371, appointments: 18, deals:  5, callTrend: 11, mailTrend:  8 },
  ],
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
  this_month:   { mailSent: 12480, mailDelivered: 12206, mailOpened: 4682, mailClicked:  712, docOpened: 1820, docDownloaded:  264 },
  last_month:   { mailSent: 11630, mailDelivered: 11402, mailOpened: 4150, mailClicked:  611, docOpened: 1612, docDownloaded:  238 },
  this_quarter: { mailSent: 35780, mailDelivered: 34988, mailOpened: 13260, mailClicked: 1948, docOpened: 5210, docDownloaded:  742 },
  last_quarter: { mailSent: 31220, mailDelivered: 30620, mailOpened: 11104, mailClicked: 1612, docOpened: 4380, docDownloaded:  610 },
}

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
          caption="チーム・担当者・マーケ施策のパフォーマンスを一望"
          action={
            <div
              className="inline-flex items-center gap-1 p-1 rounded-[var(--radius-obs-md)] fo-glass-rim"
              style={{
                backgroundColor: 'rgba(36,36,38,0.6)',
                backdropFilter: 'blur(8px)',
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
                      backgroundColor: active ? 'var(--color-obs-surface-highest)' : 'transparent',
                      color: active ? 'var(--color-obs-text)' : 'var(--color-obs-text-muted)',
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
          <ObsCard depth="high" padding="none" radius="xl" className="mt-3 overflow-hidden">
            <div
              className="grid items-center px-5 py-3 text-[10.5px] font-medium tracking-[0.1em] uppercase"
              style={{
                gridTemplateColumns: '1.3fr 1.4fr 1.4fr 0.8fr',
                color: 'var(--color-obs-text-subtle)',
                backgroundColor: 'var(--color-obs-surface-low)',
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
                  borderTop: i === 0 ? 'none' : '1px solid rgba(65,71,83,0.12)',
                }}
              >
                {/* 担当者 */}
                <div className="flex items-center gap-2 min-w-0">
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0"
                    style={{
                      background: 'linear-gradient(140deg, var(--color-obs-primary) 0%, var(--color-obs-primary-container) 100%)',
                      color: 'var(--color-obs-on-primary)',
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
                background: 'rgba(171,199,255,0.04)',
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
          <ObsCard depth="high" padding="lg" radius="xl" className="fo-glass-rim fo-lift">
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
          <ObsCard depth="high" padding="lg" radius="xl" className="fo-glass-rim fo-lift">
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
          <ObsCard depth="high" padding="lg" radius="xl" className="fo-glass-rim fo-lift">
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
