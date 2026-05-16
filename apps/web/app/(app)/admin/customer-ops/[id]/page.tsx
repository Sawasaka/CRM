'use client'

import { use, useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  Coins,
  Crown,
  Database,
  MessageCircle,
  Plug,
  ShieldAlert,
  TrendingUp,
  Users,
  Wrench,
} from 'lucide-react'
import {
  ObsCard,
  ObsHero,
  ObsPageShell,
} from '@/components/obsidian'

// ─── 型定義 ──────────────────────────────────────────────────────────────

type PlanTier = 'Free' | 'Standard' | 'PRO'

type PurchaseKind =
  | 'plan_change'        // プラン変更
  | 'credit_purchase'    // 追加クレジット購入
  | 'feature_request'    // 機能リクエスト
  | 'migration'          // 初期費用 (データ移行サポート等)
  | 'support_option'     // サポートオプション継続課金

interface PurchaseRow {
  id: string
  kind: PurchaseKind
  title: string
  description?: string
  amount: number
  status: 'completed' | 'in_progress' | 'pending' | 'rejected' | 'recurring'
  occurredAt: string
}

interface TenantDetail {
  id: string
  name: string
  plan: PlanTier
  seatsCommitted: number
  seatsActive: number
  mrr: number
  activeUsers30d: number
  creditsUsed: number
  creditsRemaining: number
  contractStartedAt: string
  lastLoginAt: string
  status: 'active' | 'dormant' | 'churned'
  primaryContact: { name: string; email: string }
  integrations: { google: boolean; slack: boolean; microsoft: boolean }
  purchases: PurchaseRow[]
  // 集計
  totalAddonRevenue: number
  hasSupportOption: boolean
  hasMigrationSupport: boolean
}

// ─── サンプルデータ ─────────────────────────────────────────────────────

const SAMPLE_TENANTS: Record<string, TenantDetail> = {
  tenant_001: {
    id: 'tenant_001',
    name: '株式会社サンプル',
    plan: 'PRO',
    seatsCommitted: 12,
    seatsActive: 11,
    mrr: 108000,
    activeUsers30d: 9,
    creditsUsed: 18400,
    creditsRemaining: 5600,
    contractStartedAt: '2026-01-15',
    lastLoginAt: '2026-05-05T14:23:00',
    status: 'active',
    primaryContact: { name: '田中 健太', email: 'tanaka@sample.co.jp' },
    integrations: { google: true, slack: true, microsoft: false },
    totalAddonRevenue: 280000,
    hasSupportOption: true,
    hasMigrationSupport: true,
    purchases: [
      {
        id: 'p1',
        kind: 'plan_change',
        title: 'PROプランに変更 (Standardから昇格)',
        amount: 0,
        status: 'completed',
        occurredAt: '2026-02-12T10:30:00',
      },
      {
        id: 'p2',
        kind: 'migration',
        title: 'データ移行サポート申込',
        description: 'CSVから企業3,200件・コンタクト8,500件を移行',
        amount: 100000,
        status: 'completed',
        occurredAt: '2026-01-20T09:00:00',
      },
      {
        id: 'p3',
        kind: 'feature_request',
        title: '売上レポート改修',
        description: '部署別フィルター + 部門別マージン率の集計',
        amount: 130000,
        status: 'in_progress',
        occurredAt: '2026-04-25T11:00:00',
      },
      {
        id: 'p4',
        kind: 'credit_purchase',
        title: '追加クレジット 5,000cr',
        amount: 50000,
        status: 'completed',
        occurredAt: '2026-04-12T16:20:00',
      },
      {
        id: 'p5',
        kind: 'support_option',
        title: '企業担当付きサポート (継続中)',
        description: '月次定例MTG + 専属担当チャット相談',
        amount: 100000,
        status: 'recurring',
        occurredAt: '2026-03-01T00:00:00',
      },
    ],
  },
  tenant_002: {
    id: 'tenant_002',
    name: '合同会社グロース',
    plan: 'Standard',
    seatsCommitted: 5,
    seatsActive: 5,
    mrr: 30000,
    activeUsers30d: 4,
    creditsUsed: 3200,
    creditsRemaining: 1800,
    contractStartedAt: '2026-03-02',
    lastLoginAt: '2026-05-05T11:08:00',
    status: 'active',
    primaryContact: { name: '鈴木 美咲', email: 'suzuki@growth.jp' },
    integrations: { google: true, slack: false, microsoft: false },
    totalAddonRevenue: 50000,
    hasSupportOption: false,
    hasMigrationSupport: false,
    purchases: [
      {
        id: 'p1',
        kind: 'feature_request',
        title: 'Slack通知の自動送信',
        description: '商談ステージ変更時の自動通知',
        amount: 50000,
        status: 'pending',
        occurredAt: '2026-05-04T14:15:00',
      },
    ],
  },
  tenant_003: {
    id: 'tenant_003',
    name: 'フューチャーテック株式会社',
    plan: 'PRO',
    seatsCommitted: 25,
    seatsActive: 22,
    mrr: 225000,
    activeUsers30d: 20,
    creditsUsed: 42000,
    creditsRemaining: 8000,
    contractStartedAt: '2025-11-10',
    lastLoginAt: '2026-05-05T09:45:00',
    status: 'active',
    primaryContact: { name: '佐藤 大輔', email: 'sato@futuretech.co.jp' },
    integrations: { google: true, slack: true, microsoft: true },
    totalAddonRevenue: 720000,
    hasSupportOption: true,
    hasMigrationSupport: true,
    purchases: [
      {
        id: 'p1',
        kind: 'migration',
        title: 'データ移行サポート申込 (HubSpot からの移行)',
        amount: 100000,
        status: 'completed',
        occurredAt: '2025-11-12T10:00:00',
      },
      {
        id: 'p2',
        kind: 'feature_request',
        title: 'AI議事録の感情分析機能',
        amount: 250000,
        status: 'in_progress',
        occurredAt: '2026-04-28T11:00:00',
      },
      {
        id: 'p3',
        kind: 'feature_request',
        title: 'パイプラインKPIダッシュボード',
        amount: 160000,
        status: 'completed',
        occurredAt: '2026-04-15T08:20:00',
      },
      {
        id: 'p4',
        kind: 'credit_purchase',
        title: '追加クレジット 10,000cr',
        amount: 100000,
        status: 'completed',
        occurredAt: '2026-03-20T13:00:00',
      },
      {
        id: 'p5',
        kind: 'support_option',
        title: '企業担当付きサポート (継続中)',
        amount: 100000,
        status: 'recurring',
        occurredAt: '2025-12-01T00:00:00',
      },
    ],
  },
  tenant_004: {
    id: 'tenant_004',
    name: 'スタートアップABC',
    plan: 'Free',
    seatsCommitted: 3,
    seatsActive: 2,
    mrr: 0,
    activeUsers30d: 2,
    creditsUsed: 250,
    creditsRemaining: 50,
    contractStartedAt: '2026-04-22',
    lastLoginAt: '2026-05-04T18:30:00',
    status: 'active',
    primaryContact: { name: '高橋 理恵', email: 'takahashi@abc-startup.com' },
    integrations: { google: true, slack: false, microsoft: false },
    totalAddonRevenue: 0,
    hasSupportOption: false,
    hasMigrationSupport: false,
    purchases: [],
  },
  tenant_005: {
    id: 'tenant_005',
    name: '株式会社レガシー',
    plan: 'Standard',
    seatsCommitted: 8,
    seatsActive: 1,
    mrr: 48000,
    activeUsers30d: 1,
    creditsUsed: 120,
    creditsRemaining: 4880,
    contractStartedAt: '2026-02-01',
    lastLoginAt: '2026-04-08T10:00:00',
    status: 'dormant',
    primaryContact: { name: '伊藤 雅彦', email: 'ito@legacy-co.jp' },
    integrations: { google: false, slack: false, microsoft: false },
    totalAddonRevenue: 0,
    hasSupportOption: false,
    hasMigrationSupport: false,
    purchases: [],
  },
}

// ─── BGMテナント判定 ─────────────────────────────────────────────────────

function useIsBGMTenant(): boolean {
  return true // MVP: モック
}

// ─── ページ ──────────────────────────────────────────────────────────────

export default function TenantDetailPage(props: { params: Promise<{ id: string }> }) {
  const { id } = use(props.params)
  const isBGMTenant = useIsBGMTenant()
  const [tab, setTab] = useState<'overview' | 'purchases' | 'usage'>('overview')

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
        </div>
      </ObsPageShell>
    )
  }

  const t = SAMPLE_TENANTS[id]
  if (!t) {
    return (
      <ObsPageShell>
        <div className="w-full px-8 py-16">
          <Link
            href="/admin/customer-ops"
            className="inline-flex items-center gap-1.5 text-[12.5px] mb-4"
            style={{ color: 'var(--color-obs-text-muted)' }}
          >
            <ArrowLeft size={14} />
            一覧に戻る
          </Link>
          <p style={{ color: 'var(--color-obs-text)' }}>該当するテナントが見つかりません。</p>
        </div>
      </ObsPageShell>
    )
  }

  return (
    <ObsPageShell>
      <div className="w-full px-8 xl:px-12 2xl:px-16 pb-16">
        {/* 戻るリンク */}
        <Link
          href="/admin/customer-ops"
          className="inline-flex items-center gap-1.5 text-[12.5px] mb-3 transition-colors"
          style={{ color: 'var(--color-obs-text-muted)' }}
        >
          <ArrowLeft size={14} />
          Customer Operations 一覧に戻る
        </Link>

        <ObsHero
          eyebrow={`Tenant ${t.id}`}
          title={t.name}
          caption={`担当者: ${t.primaryContact.name} (${t.primaryContact.email}) ・ 契約開始 ${t.contractStartedAt}`}
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

        {/* タブ */}
        <div
          className="inline-flex p-1 rounded-[var(--radius-obs-md)] mb-6 gap-0.5"
          style={{ backgroundColor: 'var(--color-obs-surface-high)' }}
        >
          {(
            [
              { key: 'overview', label: '概要' },
              { key: 'purchases', label: '購入履歴・追加オプション' },
              { key: 'usage', label: '利用状況' },
            ] as const
          ).map((opt) => (
            <button
              key={opt.key}
              onClick={() => setTab(opt.key)}
              className="px-4 h-9 rounded-[calc(var(--radius-obs-md)-2px)] text-[12.5px] font-medium transition-colors"
              style={{
                backgroundColor: tab === opt.key ? 'var(--color-obs-surface-highest)' : 'transparent',
                color: tab === opt.key ? 'var(--color-obs-text)' : 'var(--color-obs-text-muted)',
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {tab === 'overview' && <OverviewTab tenant={t} />}
        {tab === 'purchases' && <PurchasesTab tenant={t} />}
        {tab === 'usage' && <UsageTab tenant={t} />}
      </div>
    </ObsPageShell>
  )
}

// ─── 概要タブ ───────────────────────────────────────────────────────────

function OverviewTab({ tenant: t }: { tenant: TenantDetail }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <InfoStat label="プラン" value={t.plan} icon={Crown} />
        <InfoStat label="MRR" value={`¥${t.mrr.toLocaleString()}`} icon={TrendingUp} accent="#4BC88C" />
        <InfoStat
          label="シート"
          value={`${t.seatsCommitted}`}
          sub={`(${t.seatsActive}名利用)`}
          icon={Users}
          accent="#50C8FF"
        />
        <InfoStat
          label="クレジット残高"
          value={t.creditsRemaining.toLocaleString()}
          sub={`消費 ${t.creditsUsed.toLocaleString()} cr`}
          icon={Coins}
          accent="#FFC107"
        />
      </div>

      <ObsCard depth="high" padding="lg" radius="xl">
        <h3
          className="font-[family-name:var(--font-display)] text-base font-semibold mb-4"
          style={{ color: 'var(--color-obs-text)' }}
        >
          基本情報
        </h3>
        <dl className="grid grid-cols-2 gap-x-8 gap-y-3 text-[12.5px]">
          <DefRow label="契約開始日" value={t.contractStartedAt} />
          <DefRow
            label="最終ログイン"
            value={new Date(t.lastLoginAt).toLocaleString('ja-JP')}
          />
          <DefRow label="主担当者" value={`${t.primaryContact.name} (${t.primaryContact.email})`} />
          <DefRow label="ステータス" value={t.status === 'active' ? 'アクティブ' : t.status === 'dormant' ? '休眠' : '解約済'} />
          <DefRow label="サポートオプション" value={t.hasSupportOption ? '加入中' : '未加入'} />
          <DefRow label="データ移行サポート" value={t.hasMigrationSupport ? '利用済' : '未利用'} />
        </dl>
      </ObsCard>

      <ObsCard depth="high" padding="lg" radius="xl">
        <h3
          className="font-[family-name:var(--font-display)] text-base font-semibold mb-4"
          style={{ color: 'var(--color-obs-text)' }}
        >
          連携状況
        </h3>
        <div className="grid grid-cols-3 gap-3">
          <IntegrationStat label="Google Workspace" connected={t.integrations.google} />
          <IntegrationStat label="Slack" connected={t.integrations.slack} />
          <IntegrationStat label="Microsoft 365" connected={t.integrations.microsoft} />
        </div>
      </ObsCard>
    </div>
  )
}

// ─── 購入履歴タブ ───────────────────────────────────────────────────────

function PurchasesTab({ tenant: t }: { tenant: TenantDetail }) {
  // 種別ごとの集計
  const byKind: Record<PurchaseKind, { count: number; amount: number }> = {
    plan_change: { count: 0, amount: 0 },
    credit_purchase: { count: 0, amount: 0 },
    feature_request: { count: 0, amount: 0 },
    migration: { count: 0, amount: 0 },
    support_option: { count: 0, amount: 0 },
  }
  t.purchases.forEach((p) => {
    byKind[p.kind].count += 1
    byKind[p.kind].amount += p.amount
  })

  return (
    <div className="space-y-4">
      {/* 集計カード */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KindCard
          icon={Wrench}
          label="機能リクエスト"
          count={byKind.feature_request.count}
          amount={byKind.feature_request.amount}
          accent="var(--color-obs-primary)"
        />
        <KindCard
          icon={Coins}
          label="追加クレジット"
          count={byKind.credit_purchase.count}
          amount={byKind.credit_purchase.amount}
          accent="#FFC107"
        />
        <KindCard
          icon={Database}
          label="データ移行サポート"
          count={byKind.migration.count}
          amount={byKind.migration.amount}
          accent="#50C8FF"
        />
        <KindCard
          icon={MessageCircle}
          label="サポートオプション"
          count={byKind.support_option.count}
          amount={byKind.support_option.amount}
          accent="#4BC88C"
          isRecurring
        />
      </div>

      {/* 累計 */}
      <ObsCard depth="high" padding="lg" radius="xl">
        <div className="flex items-center justify-between">
          <div>
            <p
              className="text-[10.5px] font-medium uppercase tracking-[0.1em] mb-1"
              style={{ color: 'var(--color-obs-text-subtle)' }}
            >
              追加オプション 累計売上
            </p>
            <p
              className="font-[family-name:var(--font-display)] text-[28px] font-bold tabular-nums"
              style={{ color: 'var(--color-obs-text)' }}
            >
              ¥{t.totalAddonRevenue.toLocaleString()}
            </p>
            <p className="text-[11.5px] mt-0.5" style={{ color: 'var(--color-obs-text-subtle)' }}>
              機能リクエスト + 追加クレジット + 初期費用 + サポートオプション (税抜)
            </p>
          </div>
          <div
            className="px-4 py-2 rounded-[var(--radius-obs-md)]"
            style={{ backgroundColor: 'var(--color-obs-surface-high)' }}
          >
            <p
              className="text-[10px] font-medium uppercase tracking-[0.1em] mb-0.5"
              style={{ color: 'var(--color-obs-text-subtle)' }}
            >
              プラン MRR
            </p>
            <p
              className="text-[18px] font-bold tabular-nums"
              style={{ color: 'var(--color-obs-text)' }}
            >
              ¥{t.mrr.toLocaleString()}
              <span className="text-[11px] ml-1" style={{ color: 'var(--color-obs-text-muted)' }}>
                /月
              </span>
            </p>
          </div>
        </div>
      </ObsCard>

      {/* 履歴一覧 */}
      <ObsCard depth="high" padding="none" radius="xl" className="overflow-hidden">
        <div
          className="px-5 py-3"
          style={{ backgroundColor: 'var(--color-obs-surface-high)' }}
        >
          <p
            className="text-[12px] font-semibold"
            style={{ color: 'var(--color-obs-text)' }}
          >
            履歴 ({t.purchases.length}件)
          </p>
        </div>
        {t.purchases.length === 0 ? (
          <p
            className="text-[12.5px] text-center py-8 px-5"
            style={{ color: 'var(--color-obs-text-muted)' }}
          >
            まだ購入履歴がありません。
          </p>
        ) : (
          [...t.purchases]
            .sort((a, b) => b.occurredAt.localeCompare(a.occurredAt))
            .map((p, i) => <PurchaseRowCard key={p.id} purchase={p} divider={i > 0} />)
        )}
      </ObsCard>
    </div>
  )
}

function PurchaseRowCard({
  purchase: p,
  divider,
}: {
  purchase: PurchaseRow
  divider: boolean
}) {
  const kindMeta: Record<PurchaseKind, { Icon: React.ElementType; label: string; color: string }> = {
    plan_change: { Icon: Crown, label: 'プラン変更', color: '#FFC107' },
    credit_purchase: { Icon: Coins, label: 'クレジット購入', color: '#FFC107' },
    feature_request: { Icon: Wrench, label: '機能リクエスト', color: 'var(--color-obs-primary)' },
    migration: { Icon: Database, label: '初期費用 (移行)', color: '#50C8FF' },
    support_option: { Icon: MessageCircle, label: 'サポートオプション', color: '#4BC88C' },
  }
  const statusMeta: Record<PurchaseRow['status'], { label: string; bg: string; fg: string }> = {
    completed: { label: '完了', bg: 'rgba(75,200,140,0.14)', fg: '#4BC88C' },
    in_progress: { label: '開発中', bg: 'rgba(80,200,255,0.14)', fg: '#50C8FF' },
    pending: { label: '依頼中', bg: 'rgba(255,193,7,0.14)', fg: '#FFC107' },
    rejected: { label: '却下', bg: 'rgba(255,90,90,0.14)', fg: '#FF5A5A' },
    recurring: { label: '継続中', bg: 'rgba(171,199,255,0.14)', fg: 'var(--color-obs-primary)' },
  }
  const km = kindMeta[p.kind]
  const sm = statusMeta[p.status]
  const Icon = km.Icon
  return (
    <div
      className="px-5 py-3.5 grid grid-cols-[auto_1fr_auto_auto] gap-3 items-start"
      style={{ borderTop: divider ? '1px solid rgba(255,255,255,0.04)' : 'none' }}
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
            className="text-[10px] font-medium uppercase tracking-[0.08em]"
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
          className="text-[13px] font-semibold"
          style={{ color: 'var(--color-obs-text)' }}
        >
          {p.title}
        </p>
        {p.description && (
          <p
            className="text-[11.5px] mt-0.5"
            style={{ color: 'var(--color-obs-text-muted)' }}
          >
            {p.description}
          </p>
        )}
      </div>
      <div className="text-right whitespace-nowrap">
        <p
          className="text-[14px] font-bold tabular-nums"
          style={{ color: 'var(--color-obs-text)' }}
        >
          {p.amount > 0 ? `¥${p.amount.toLocaleString()}` : '−'}
        </p>
        {p.kind === 'support_option' && p.amount > 0 && (
          <p className="text-[10.5px]" style={{ color: 'var(--color-obs-text-subtle)' }}>
            /月
          </p>
        )}
      </div>
      <p
        className="text-[10.5px] whitespace-nowrap pt-1"
        style={{ color: 'var(--color-obs-text-subtle)' }}
      >
        {new Date(p.occurredAt).toLocaleString('ja-JP', {
          month: 'numeric',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })}
      </p>
    </div>
  )
}

// ─── 利用状況タブ (Phase 1 は簡易表示) ───────────────────────────────────

function UsageTab({ tenant: t }: { tenant: TenantDetail }) {
  return (
    <div className="space-y-4">
      <ObsCard depth="high" padding="lg" radius="xl">
        <h3
          className="font-[family-name:var(--font-display)] text-base font-semibold mb-4"
          style={{ color: 'var(--color-obs-text)' }}
        >
          直近30日のアクティビティ
        </h3>
        <div className="grid grid-cols-3 gap-3">
          <div
            className="p-4 rounded-[var(--radius-obs-md)]"
            style={{ backgroundColor: 'var(--color-obs-surface-high)' }}
          >
            <p
              className="text-[10.5px] font-medium uppercase tracking-[0.1em] mb-1"
              style={{ color: 'var(--color-obs-text-subtle)' }}
            >
              アクティブユーザー
            </p>
            <p
              className="text-[24px] font-bold tabular-nums"
              style={{ color: 'var(--color-obs-text)' }}
            >
              {t.activeUsers30d}
              <span className="text-[12px] ml-1" style={{ color: 'var(--color-obs-text-muted)' }}>
                / {t.seatsActive}名
              </span>
            </p>
          </div>
          <div
            className="p-4 rounded-[var(--radius-obs-md)]"
            style={{ backgroundColor: 'var(--color-obs-surface-high)' }}
          >
            <p
              className="text-[10.5px] font-medium uppercase tracking-[0.1em] mb-1"
              style={{ color: 'var(--color-obs-text-subtle)' }}
            >
              クレジット消費
            </p>
            <p
              className="text-[24px] font-bold tabular-nums"
              style={{ color: 'var(--color-obs-text)' }}
            >
              {t.creditsUsed.toLocaleString()}
            </p>
          </div>
          <div
            className="p-4 rounded-[var(--radius-obs-md)]"
            style={{ backgroundColor: 'var(--color-obs-surface-high)' }}
          >
            <p
              className="text-[10.5px] font-medium uppercase tracking-[0.1em] mb-1"
              style={{ color: 'var(--color-obs-text-subtle)' }}
            >
              最終ログイン
            </p>
            <p
              className="text-[14px] font-semibold"
              style={{ color: 'var(--color-obs-text)' }}
            >
              {new Date(t.lastLoginAt).toLocaleDateString('ja-JP', {
                year: 'numeric',
                month: 'numeric',
                day: 'numeric',
              })}
            </p>
            <p className="text-[10.5px] mt-0.5" style={{ color: 'var(--color-obs-text-subtle)' }}>
              {new Date(t.lastLoginAt).toLocaleTimeString('ja-JP', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>
        </div>
      </ObsCard>

      <ObsCard depth="low" padding="md" radius="xl">
        <p
          className="text-[12px] leading-relaxed"
          style={{ color: 'var(--color-obs-text-muted)' }}
        >
          📊 詳細な利用ログ・グラフ表示は Phase 2 で実装予定です(API消費・機能別利用率・ユーザー別アクティビティ等)。
        </p>
      </ObsCard>
    </div>
  )
}

// ─── 部品 ────────────────────────────────────────────────────────────────

function InfoStat({
  label,
  value,
  sub,
  icon: Icon,
  accent = 'var(--color-obs-primary)',
}: {
  label: string
  value: string
  sub?: string
  icon: React.ElementType
  accent?: string
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

function DefRow({ label, value }: { label: string; value: string }) {
  return (
    <>
      <dt style={{ color: 'var(--color-obs-text-subtle)' }}>{label}</dt>
      <dd style={{ color: 'var(--color-obs-text)' }}>{value}</dd>
    </>
  )
}

function IntegrationStat({ label, connected }: { label: string; connected: boolean }) {
  return (
    <div
      className="p-3 rounded-[var(--radius-obs-md)] flex items-center gap-2.5"
      style={{ backgroundColor: 'var(--color-obs-surface-high)' }}
    >
      <div
        className="w-8 h-8 rounded-[var(--radius-obs-sm)] flex items-center justify-center"
        style={{
          backgroundColor: connected
            ? 'rgba(75,200,140,0.14)'
            : 'var(--color-obs-surface-highest)',
        }}
      >
        <Plug size={13} style={{ color: connected ? '#4BC88C' : 'var(--color-obs-text-subtle)' }} />
      </div>
      <div>
        <p className="text-[12.5px] font-semibold" style={{ color: 'var(--color-obs-text)' }}>
          {label}
        </p>
        <p
          className="text-[10.5px]"
          style={{ color: connected ? '#4BC88C' : 'var(--color-obs-text-subtle)' }}
        >
          {connected ? '連携済み' : '未連携'}
        </p>
      </div>
    </div>
  )
}

function KindCard({
  icon: Icon,
  label,
  count,
  amount,
  accent,
  isRecurring,
}: {
  icon: React.ElementType
  label: string
  count: number
  amount: number
  accent: string
  isRecurring?: boolean
}) {
  return (
    <ObsCard depth="high" padding="md" radius="xl">
      <div className="flex items-start gap-2.5">
        <div
          className="w-9 h-9 rounded-[var(--radius-obs-md)] flex items-center justify-center shrink-0"
          style={{ backgroundColor: `color-mix(in srgb, ${accent} 14%, transparent)` }}
        >
          <Icon size={14} style={{ color: accent }} />
        </div>
        <div className="min-w-0">
          <p
            className="text-[10.5px] font-medium uppercase tracking-[0.1em]"
            style={{ color: 'var(--color-obs-text-subtle)' }}
          >
            {label}
          </p>
          <p
            className="font-[family-name:var(--font-display)] text-[18px] font-bold tabular-nums"
            style={{ color: 'var(--color-obs-text)' }}
          >
            ¥{amount.toLocaleString()}
            {isRecurring && amount > 0 && (
              <span className="text-[10.5px] font-medium ml-1" style={{ color: 'var(--color-obs-text-muted)' }}>
                /月
              </span>
            )}
          </p>
          <p className="text-[11px]" style={{ color: 'var(--color-obs-text-subtle)' }}>
            {count}件
          </p>
        </div>
      </div>
    </ObsCard>
  )
}
