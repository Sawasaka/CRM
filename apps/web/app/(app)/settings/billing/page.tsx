'use client'

import { useMemo, useState } from 'react'
import {
  ArrowUpRight,
  Coins,
  CreditCard,
  Crown,
  Database,
  Download,
  ExternalLink,
  Filter,
  MessageCircle,
  Receipt,
  Search,
  ShieldAlert,
  TrendingUp,
  Wrench,
  X,
} from 'lucide-react'
import {
  ObsCard,
  ObsHero,
  ObsPageShell,
} from '@/components/obsidian'

// ─── 型定義 ──────────────────────────────────────────────────────────────

type PaymentKind =
  | 'plan'              // プラン課金 (月額・年額)
  | 'credit_purchase'   // 追加クレジット購入
  | 'feature_request'   // 機能リクエスト
  | 'migration'         // 初期費用 (データ移行サポート等)
  | 'support_option'    // サポートオプション (継続課金)

type PaymentStatus = 'succeeded' | 'refunded' | 'partial_refund' | 'pending' | 'failed'

interface Payment {
  id: string
  kind: PaymentKind
  title: string
  description?: string
  amount: number
  refundedAmount?: number  // 返金額
  status: PaymentStatus
  paidAt: string
  refundedAt?: string
  // Stripe 連携情報
  stripePaymentIntentId: string
  stripeReceiptUrl: string  // Stripe Hosted Receipt URL
  stripeCustomerId?: string
}

// ─── サンプルデータ ─────────────────────────────────────────────────────

const SAMPLE_PAYMENTS: Payment[] = [
  {
    id: 'pay_001',
    kind: 'plan',
    title: 'PROプラン (12シート)',
    description: '2026年5月分・月次自動課金',
    amount: 108000,
    status: 'succeeded',
    paidAt: '2026-05-01T00:00:05',
    stripePaymentIntentId: 'pi_3ABCdefGHIjklMNop1234',
    stripeReceiptUrl: 'https://pay.stripe.com/receipts/example/r_001',
    stripeCustomerId: 'cus_ABCdefGHIjklMNop',
  },
  {
    id: 'pay_002',
    kind: 'support_option',
    title: '企業担当付きサポート',
    description: '2026年5月分・月次自動課金',
    amount: 100000,
    status: 'succeeded',
    paidAt: '2026-05-01T00:00:08',
    stripePaymentIntentId: 'pi_3ABCdefGHIjklMNop2345',
    stripeReceiptUrl: 'https://pay.stripe.com/receipts/example/r_002',
  },
  {
    id: 'pay_003',
    kind: 'feature_request',
    title: '機能リクエスト「売上レポート改修」',
    description: 'AI算出 ¥130,000・部署別フィルター追加',
    amount: 130000,
    status: 'succeeded',
    paidAt: '2026-04-25T11:00:00',
    stripePaymentIntentId: 'pi_3ABCdefGHIjklMNop3456',
    stripeReceiptUrl: 'https://pay.stripe.com/receipts/example/r_003',
  },
  {
    id: 'pay_004',
    kind: 'credit_purchase',
    title: '追加クレジット 5,000cr',
    description: '¥50,000・即時付与',
    amount: 50000,
    status: 'succeeded',
    paidAt: '2026-04-12T16:20:00',
    stripePaymentIntentId: 'pi_3ABCdefGHIjklMNop4567',
    stripeReceiptUrl: 'https://pay.stripe.com/receipts/example/r_004',
  },
  {
    id: 'pay_005',
    kind: 'plan',
    title: 'PROプラン (12シート)',
    description: '2026年4月分・月次自動課金',
    amount: 108000,
    status: 'succeeded',
    paidAt: '2026-04-01T00:00:04',
    stripePaymentIntentId: 'pi_3ABCdefGHIjklMNop5678',
    stripeReceiptUrl: 'https://pay.stripe.com/receipts/example/r_005',
  },
  {
    id: 'pay_006',
    kind: 'feature_request',
    title: '機能リクエスト「KPIダッシュボード追加」',
    description: 'AI算出 ¥80,000・却下されたため返金',
    amount: 80000,
    refundedAmount: 80000,
    status: 'refunded',
    paidAt: '2026-03-15T14:00:00',
    refundedAt: '2026-03-16T10:30:00',
    stripePaymentIntentId: 'pi_3ABCdefGHIjklMNop6789',
    stripeReceiptUrl: 'https://pay.stripe.com/receipts/example/r_006',
  },
  {
    id: 'pay_007',
    kind: 'migration',
    title: 'データ移行サポート (初期費用)',
    description: 'CSV取込・項目マッピング・1時間オンボーディングMTG',
    amount: 100000,
    status: 'succeeded',
    paidAt: '2026-01-20T09:00:00',
    stripePaymentIntentId: 'pi_3ABCdefGHIjklMNop7890',
    stripeReceiptUrl: 'https://pay.stripe.com/receipts/example/r_007',
  },
  {
    id: 'pay_008',
    kind: 'plan',
    title: 'Standardプラン (5シート)',
    description: '2026年1月分・月次自動課金 (PROにアップグレード前)',
    amount: 30000,
    status: 'succeeded',
    paidAt: '2026-01-15T00:00:02',
    stripePaymentIntentId: 'pi_3ABCdefGHIjklMNop8901',
    stripeReceiptUrl: 'https://pay.stripe.com/receipts/example/r_008',
  },
]

// ─── メタ情報 ──────────────────────────────────────────────────────────

const KIND_META: Record<
  PaymentKind,
  { label: string; icon: React.ElementType; color: string }
> = {
  plan:            { label: 'プラン課金',       icon: Crown,         color: 'var(--color-obs-primary)' },
  credit_purchase: { label: 'クレジット',       icon: Coins,         color: '#FFC107' },
  feature_request: { label: '機能リクエスト',   icon: Wrench,        color: 'var(--color-obs-primary)' },
  migration:       { label: '初期費用',         icon: Database,      color: '#50C8FF' },
  support_option:  { label: 'サポート',         icon: MessageCircle, color: '#4BC88C' },
}

const STATUS_META: Record<
  PaymentStatus,
  { label: string; bg: string; fg: string }
> = {
  succeeded:      { label: '完了',     bg: 'rgba(75,200,140,0.14)', fg: '#4BC88C' },
  refunded:       { label: '全額返金', bg: 'rgba(255,140,90,0.14)', fg: '#FF8A65' },
  partial_refund: { label: '一部返金', bg: 'rgba(255,193,7,0.14)',  fg: '#FFC107' },
  pending:        { label: '処理中',   bg: 'rgba(171,199,255,0.14)',fg: 'var(--color-obs-primary)' },
  failed:         { label: '失敗',     bg: 'rgba(255,90,90,0.14)',  fg: '#FF5A5A' },
}

// ─── 権限判定 ───────────────────────────────────────────────────────

function useIsSuperAdmin(): boolean {
  return true // MVP: モック
}

// ─── CSVエクスポート ────────────────────────────────────────────────

function escapeCsv(value: string | undefined | null): string {
  if (value === undefined || value === null) return ''
  const s = String(value)
  if (/[",\r\n]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`
  }
  return s
}

function exportPaymentsToCsv(payments: Payment[]) {
  const headers = [
    '日時',
    '種別',
    'タイトル',
    '内容',
    '金額(税抜)',
    '返金額',
    'ステータス',
    'Stripe PaymentIntent ID',
    'Stripe領収書URL',
  ]
  const rows = payments.map((p) => [
    new Date(p.paidAt).toISOString(),
    KIND_META[p.kind].label,
    p.title,
    p.description ?? '',
    String(p.amount),
    p.refundedAmount ? String(p.refundedAmount) : '',
    STATUS_META[p.status].label,
    p.stripePaymentIntentId,
    p.stripeReceiptUrl,
  ])
  const BOM = '﻿'
  const csv =
    BOM +
    [headers, ...rows].map((row) => row.map(escapeCsv).join(',')).join('\r\n')
  const ts = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `billing-history_${ts}.csv`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// ─── ページ ──────────────────────────────────────────────────────────

export default function BillingHistoryPage() {
  const isSuperAdmin = useIsSuperAdmin()
  const [keyword, setKeyword] = useState('')
  const [kindFilter, setKindFilter] = useState<PaymentKind | 'all'>('all')
  const [periodFilter, setPeriodFilter] = useState<'30d' | '6m' | '1y' | 'all'>('all')

  if (!isSuperAdmin) {
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
            支払い履歴は特権管理者(オーナー)のみが閲覧できます。
          </p>
        </div>
      </ObsPageShell>
    )
  }

  // フィルタリング
  const filteredPayments = useMemo(() => {
    const now = new Date()
    const periodDays: Record<typeof periodFilter, number> = {
      '30d': 30,
      '6m': 180,
      '1y': 365,
      all: 9999,
    }
    const cutoff = new Date(now.getTime() - periodDays[periodFilter] * 24 * 60 * 60 * 1000)

    return SAMPLE_PAYMENTS.filter((p) => {
      if (kindFilter !== 'all' && p.kind !== kindFilter) return false
      if (new Date(p.paidAt) < cutoff) return false
      if (keyword.trim()) {
        const k = keyword.trim().toLowerCase()
        if (
          !p.title.toLowerCase().includes(k) &&
          !(p.description ?? '').toLowerCase().includes(k) &&
          !p.stripePaymentIntentId.toLowerCase().includes(k)
        ) {
          return false
        }
      }
      return true
    }).sort((a, b) => b.paidAt.localeCompare(a.paidAt))
  }, [keyword, kindFilter, periodFilter])

  // 集計
  const totals = useMemo(() => {
    const totalPaid = SAMPLE_PAYMENTS.filter((p) => p.status === 'succeeded').reduce(
      (s, p) => s + p.amount,
      0,
    )
    const totalRefunded = SAMPLE_PAYMENTS.reduce((s, p) => s + (p.refundedAmount ?? 0), 0)
    const thisMonth = SAMPLE_PAYMENTS.filter((p) => {
      const d = new Date(p.paidAt)
      const now = new Date()
      return (
        d.getFullYear() === now.getFullYear() &&
        d.getMonth() === now.getMonth() &&
        p.status === 'succeeded'
      )
    }).reduce((s, p) => s + p.amount, 0)
    return { totalPaid, totalRefunded, thisMonth, count: SAMPLE_PAYMENTS.length }
  }, [])

  // Stripe Customer Portal URL (本番: stripe.billingPortal.sessions.create で生成)
  const handleOpenStripePortal = () => {
    // TODO: 本番では POST /api/stripe/portal を叩いてセッションURLを取得 → リダイレクト
    alert(
      '【MVP モック】Stripe Customer Portal を開きます。\n本番では stripe.billingPortal.sessions.create() でセッションを生成し、Stripe ホストの管理画面にリダイレクトします。',
    )
  }

  const filterTabs: Array<{ key: PaymentKind | 'all'; label: string }> = [
    { key: 'all', label: 'すべて' },
    { key: 'plan', label: 'プラン' },
    { key: 'credit_purchase', label: 'クレジット' },
    { key: 'feature_request', label: '機能リクエスト' },
    { key: 'migration', label: '初期費用' },
    { key: 'support_option', label: 'サポート' },
  ]

  return (
    <ObsPageShell>
      <div className="w-full px-8 xl:px-12 2xl:px-16 pb-16">
        <ObsHero
          eyebrow="Settings"
          title="支払い履歴"
          caption="プラン課金・追加クレジット・機能リクエスト・初期費用など、すべての支払い履歴をStripeの領収書付きで一覧できます。"
          action={
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => exportPaymentsToCsv(filteredPayments)}
                disabled={filteredPayments.length === 0}
                className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-[var(--radius-obs-md)] text-[12.5px] font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: 'var(--color-obs-surface-high)',
                  color: 'var(--color-obs-text)',
                  boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.06)',
                }}
              >
                <Download size={13} />
                CSVエクスポート
              </button>
              <button
                type="button"
                onClick={handleOpenStripePortal}
                className="inline-flex items-center gap-1.5 h-9 px-4 rounded-[var(--radius-obs-md)] text-[12.5px] font-semibold transition-colors"
                style={{
                  background:
                    'linear-gradient(135deg, var(--color-obs-primary) 0%, var(--color-obs-primary-container) 100%)',
                  color: 'var(--color-obs-on-primary)',
                }}
              >
                <CreditCard size={13} />
                Stripe管理画面で詳細を見る
                <ExternalLink size={11} />
              </button>
            </div>
          }
        />

        {/* サマリーカード */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          <SummaryCard
            label="累計支払額"
            value={`¥${totals.totalPaid.toLocaleString()}`}
            sub={`${totals.count}件の取引`}
            icon={TrendingUp}
            accent="var(--color-obs-primary)"
          />
          <SummaryCard
            label="今月の支払額"
            value={`¥${totals.thisMonth.toLocaleString()}`}
            sub="(税抜)"
            icon={CreditCard}
            accent="#4BC88C"
          />
          <SummaryCard
            label="返金累計"
            value={`¥${totals.totalRefunded.toLocaleString()}`}
            sub={totals.totalRefunded > 0 ? '却下時の返金' : 'なし'}
            icon={ArrowUpRight}
            accent="#FF8A65"
          />
          <SummaryCard
            label="領収書"
            value="Stripe発行"
            sub="各取引から閲覧可能"
            icon={Receipt}
            accent="#FFC107"
          />
        </div>

        {/* 種別フィルタ */}
        <div className="mb-3 flex items-center gap-2 flex-wrap">
          <Filter size={14} style={{ color: 'var(--color-obs-text-subtle)' }} />
          {filterTabs.map((t) => {
            const active = kindFilter === t.key
            return (
              <button
                key={t.key}
                onClick={() => setKindFilter(t.key)}
                className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-[var(--radius-obs-md)] text-[12.5px] font-medium transition-colors"
                style={{
                  backgroundColor: active
                    ? 'var(--color-obs-primary-container)'
                    : 'var(--color-obs-surface-high)',
                  color: active ? 'var(--color-obs-on-primary)' : 'var(--color-obs-text-muted)',
                }}
              >
                {t.label}
              </button>
            )
          })}
        </div>

        {/* 検索 + 期間 */}
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
              placeholder="タイトル・PaymentIntent IDで検索"
              className="flex-1 bg-transparent border-0 outline-none text-[13px]"
              style={{ color: 'var(--color-obs-text)' }}
            />
            {keyword && (
              <button onClick={() => setKeyword('')}>
                <X size={14} style={{ color: 'var(--color-obs-text-subtle)' }} />
              </button>
            )}
          </div>
          <div
            className="inline-flex p-1 rounded-[var(--radius-obs-md)] gap-0.5"
            style={{ backgroundColor: 'var(--color-obs-surface-high)' }}
          >
            {(
              [
                { value: '30d', label: '30日' },
                { value: '6m', label: '6ヶ月' },
                { value: '1y', label: '1年' },
                { value: 'all', label: 'すべて' },
              ] as const
            ).map((p) => (
              <button
                key={p.value}
                onClick={() => setPeriodFilter(p.value)}
                className="px-3 h-8 rounded-[calc(var(--radius-obs-md)-2px)] text-[12px] font-medium transition-colors"
                style={{
                  backgroundColor:
                    periodFilter === p.value ? 'var(--color-obs-surface-highest)' : 'transparent',
                  color:
                    periodFilter === p.value
                      ? 'var(--color-obs-text)'
                      : 'var(--color-obs-text-muted)',
                }}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* 支払い履歴一覧 */}
        {filteredPayments.length === 0 ? (
          <ObsCard depth="high" padding="lg" radius="xl">
            <p
              className="text-[13px] text-center py-8"
              style={{ color: 'var(--color-obs-text-muted)' }}
            >
              該当する支払い履歴がありません。
            </p>
          </ObsCard>
        ) : (
          <ObsCard depth="high" padding="none" radius="xl" className="overflow-hidden">
            {filteredPayments.map((p, i) => (
              <PaymentRow key={p.id} payment={p} divider={i > 0} />
            ))}
          </ObsCard>
        )}

        {/* フッター: 仕様 */}
        <ObsCard depth="low" padding="md" radius="xl" className="mt-4">
          <div
            className="text-[11.5px] font-medium uppercase tracking-[0.1em] mb-2"
            style={{ color: 'var(--color-obs-text-subtle)' }}
          >
            支払い履歴について
          </div>
          <ul className="text-[12.5px] space-y-1.5" style={{ color: 'var(--color-obs-text-muted)' }}>
            <li>・領収書(税法上の扱い)は Stripe が発行・保管します。各取引行の「領収書を表示」から閲覧できます。</li>
            <li>・カード変更・自動課金停止などは「Stripe管理画面で詳細を見る」から操作してください。</li>
            <li>・却下された機能リクエストは自動的に全額返金されます (Stripe Refund)。</li>
            <li>・閲覧権限: 特権管理者(オーナー)のみ ・ 監査ログにも記録されます。</li>
          </ul>
        </ObsCard>
      </div>
    </ObsPageShell>
  )
}

// ─── 部品: サマリーカード ───────────────────────────────────────────

function SummaryCard({
  label,
  value,
  sub,
  icon: Icon,
  accent,
}: {
  label: string
  value: string
  sub: string
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
      <p className="text-[11px] mt-0.5" style={{ color: 'var(--color-obs-text-subtle)' }}>
        {sub}
      </p>
    </ObsCard>
  )
}

// ─── 部品: 支払い行 ────────────────────────────────────────────────

function PaymentRow({ payment: p, divider }: { payment: Payment; divider: boolean }) {
  const km = KIND_META[p.kind]
  const sm = STATUS_META[p.status]
  const Icon = km.icon
  return (
    <div
      className="grid grid-cols-[auto_1fr_auto_auto] gap-3 px-5 py-3.5 items-center"
      style={{
        borderTop: divider ? '1px solid rgba(255,255,255,0.04)' : 'none',
      }}
    >
      <div
        className="w-9 h-9 rounded-[var(--radius-obs-md)] flex items-center justify-center shrink-0"
        style={{ backgroundColor: `color-mix(in srgb, ${km.color} 14%, transparent)` }}
      >
        <Icon size={14} style={{ color: km.color }} />
      </div>
      <div className="min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-0.5">
          <span
            className="text-[10.5px] font-semibold uppercase tracking-[0.08em]"
            style={{ color: km.color }}
          >
            {km.label}
          </span>
          <span
            className="text-[10px] font-semibold px-1.5 py-[1px] rounded-full uppercase tracking-[0.06em]"
            style={{ backgroundColor: sm.bg, color: sm.fg }}
          >
            {sm.label}
          </span>
        </div>
        <p
          className="text-[13px] font-semibold truncate"
          style={{ color: 'var(--color-obs-text)' }}
        >
          {p.title}
        </p>
        {p.description && (
          <p
            className="text-[11.5px] truncate mt-0.5"
            style={{ color: 'var(--color-obs-text-subtle)' }}
          >
            {p.description}
          </p>
        )}
        <p
          className="text-[10.5px] font-mono mt-1 truncate"
          style={{ color: 'var(--color-obs-text-subtle)' }}
        >
          {p.stripePaymentIntentId}
        </p>
      </div>
      <div className="text-right whitespace-nowrap">
        <p
          className="font-[family-name:var(--font-display)] text-[16px] font-bold tabular-nums"
          style={{
            color: p.status === 'refunded' ? 'var(--color-obs-text-subtle)' : 'var(--color-obs-text)',
            textDecoration: p.status === 'refunded' ? 'line-through' : 'none',
          }}
        >
          ¥{p.amount.toLocaleString()}
        </p>
        {p.refundedAmount && (
          <p className="text-[10.5px] mt-0.5" style={{ color: '#FF8A65' }}>
            ↩ ¥{p.refundedAmount.toLocaleString()} 返金済
          </p>
        )}
        <p className="text-[10.5px] mt-0.5" style={{ color: 'var(--color-obs-text-subtle)' }}>
          {new Date(p.paidAt).toLocaleString('ja-JP', {
            year: 'numeric',
            month: 'numeric',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </p>
      </div>
      <a
        href={p.stripeReceiptUrl}
        target="_blank"
        rel="noopener noreferrer"
        title="Stripe領収書を別タブで開く"
        className="inline-flex items-center gap-1 h-9 px-3 rounded-[var(--radius-obs-md)] text-[11.5px] font-medium transition-colors whitespace-nowrap"
        style={{
          backgroundColor: 'var(--color-obs-surface-high)',
          color: 'var(--color-obs-text-muted)',
          boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.06)',
        }}
      >
        <Receipt size={12} />
        領収書
        <ExternalLink size={10} />
      </a>
    </div>
  )
}
