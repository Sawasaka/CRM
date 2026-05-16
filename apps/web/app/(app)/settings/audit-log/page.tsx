'use client'

import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Coins,
  CreditCard,
  Database,
  Download,
  FileText,
  Filter,
  LogIn,
  LogOut,
  Plug,
  Search,
  Shield,
  ShieldAlert,
  Sparkles,
  Trash2,
  UserPlus,
  Users,
  X,
} from 'lucide-react'
import {
  ObsCard,
  ObsHero,
  ObsPageShell,
} from '@/components/obsidian'

// ─── 型定義 ──────────────────────────────────────────────────────────────

type AuditAction =
  | 'create'          // データ作成
  | 'update'          // データ更新
  | 'delete'          // データ削除
  | 'role_change'     // 権限変更
  | 'member_invite'   // メンバー招待
  | 'member_remove'   // メンバー削除
  | 'integration_add' // 連携設定追加
  | 'integration_remove' // 連携設定解除
  | 'login_success'   // ログイン成功
  | 'login_failed'    // ログイン失敗
  | 'logout'          // ログアウト
  | 'plan_change'     // プラン変更
  | 'credit_purchase' // クレジット購入
  | 'support_option_add' // サポートオプション追加
  | 'support_option_remove' // サポートオプション解除
  | 'migration_request'  // 初期費用オプション申込
  | 'feature_request'    // 機能リクエスト送信

type AuditCategory = 'data' | 'permission' | 'login' | 'purchase'

interface AuditLog {
  id: string
  who: { id: string; name: string; email: string }
  when: string // ISO timestamp
  action: AuditAction
  category: AuditCategory
  resource?: string  // 例: companies/12345
  details: string    // 人間可読な説明
  diff?: { before?: string; after?: string }
  ipAddress: string
}

// ─── サンプルデータ ─────────────────────────────────────────────────────

const SAMPLE_LOGS: AuditLog[] = [
  {
    id: 'log_001',
    who: { id: 'u1', name: '開発 太郎', email: 'h.sawasaka@rookiesmart.jp' },
    when: '2026-05-06T09:42:18',
    action: 'plan_change',
    category: 'purchase',
    resource: 'tenant/plan',
    details: 'プランを Standard から PRO に変更しました',
    diff: { before: 'Standard (¥6,000/seat)', after: 'PRO (¥9,000/seat)' },
    ipAddress: '192.168.1.42',
  },
  {
    id: 'log_002',
    who: { id: 'u2', name: '田中 花子', email: 'tanaka@rookiesmart.jp' },
    when: '2026-05-06T09:15:02',
    action: 'delete',
    category: 'data',
    resource: 'companies/c-2034',
    details: '企業「株式会社レガシーシステム」を削除しました',
    ipAddress: '203.0.113.18',
  },
  {
    id: 'log_003',
    who: { id: 'u1', name: '開発 太郎', email: 'h.sawasaka@rookiesmart.jp' },
    when: '2026-05-06T08:55:31',
    action: 'role_change',
    category: 'permission',
    resource: 'members/u3',
    details: '鈴木 一郎の権限を「メンバー」から「管理者」に変更しました',
    diff: { before: 'メンバー', after: '管理者' },
    ipAddress: '192.168.1.42',
  },
  {
    id: 'log_004',
    who: { id: 'u3', name: '鈴木 一郎', email: 'suzuki@rookiesmart.jp' },
    when: '2026-05-06T08:30:00',
    action: 'login_success',
    category: 'login',
    details: 'ログインしました (パスワード認証)',
    ipAddress: '198.51.100.7',
  },
  {
    id: 'log_005',
    who: { id: 'u1', name: '開発 太郎', email: 'h.sawasaka@rookiesmart.jp' },
    when: '2026-05-05T18:20:15',
    action: 'credit_purchase',
    category: 'purchase',
    details: '追加クレジット 1,000cr を購入しました (¥10,000・税抜)',
    ipAddress: '192.168.1.42',
  },
  {
    id: 'log_006',
    who: { id: 'u2', name: '田中 花子', email: 'tanaka@rookiesmart.jp' },
    when: '2026-05-05T16:45:00',
    action: 'update',
    category: 'data',
    resource: 'deals/d-887',
    details: '取引「フューチャー社_新規導入」のステージを更新しました',
    diff: { before: 'PROPOSAL', after: 'CONTRACT' },
    ipAddress: '203.0.113.18',
  },
  {
    id: 'log_007',
    who: { id: 'u1', name: '開発 太郎', email: 'h.sawasaka@rookiesmart.jp' },
    when: '2026-05-05T14:10:42',
    action: 'integration_add',
    category: 'permission',
    resource: 'integrations/google',
    details: 'Google Workspace 連携を追加しました (Gmail / Calendar / Meet)',
    ipAddress: '192.168.1.42',
  },
  {
    id: 'log_008',
    who: { id: 'u4', name: '佐藤 次郎', email: 'sato@rookiesmart.jp' },
    when: '2026-05-05T10:02:33',
    action: 'create',
    category: 'data',
    resource: 'contacts/cn-5511',
    details: 'コンタクト「鈴木 太一(株式会社サンプル)」を作成しました',
    ipAddress: '203.0.113.55',
  },
  {
    id: 'log_009',
    who: { id: 'u1', name: '開発 太郎', email: 'h.sawasaka@rookiesmart.jp' },
    when: '2026-05-05T09:30:00',
    action: 'feature_request',
    category: 'purchase',
    details: '機能リクエスト「売上レポート改修」を送信しました (AI算出: ¥130,000)',
    ipAddress: '192.168.1.42',
  },
  {
    id: 'log_010',
    who: { id: 'u5', name: '高橋 三郎', email: 'takahashi@rookiesmart.jp' },
    when: '2026-05-05T08:12:00',
    action: 'login_failed',
    category: 'login',
    details: 'ログイン失敗 (パスワード不一致・3回目)',
    ipAddress: '198.51.100.92',
  },
  {
    id: 'log_011',
    who: { id: 'u1', name: '開発 太郎', email: 'h.sawasaka@rookiesmart.jp' },
    when: '2026-05-04T17:20:18',
    action: 'support_option_add',
    category: 'purchase',
    details: '企業担当付きサポートを追加しました (¥100,000/月・税抜)',
    ipAddress: '192.168.1.42',
  },
  {
    id: 'log_012',
    who: { id: 'u2', name: '田中 花子', email: 'tanaka@rookiesmart.jp' },
    when: '2026-05-04T15:33:00',
    action: 'member_invite',
    category: 'permission',
    resource: 'members/u-new',
    details: 'メンバーを招待しました: 山田 太一 (yamada@rookiesmart.jp)',
    ipAddress: '203.0.113.18',
  },
  {
    id: 'log_013',
    who: { id: 'u1', name: '開発 太郎', email: 'h.sawasaka@rookiesmart.jp' },
    when: '2026-05-04T11:00:00',
    action: 'migration_request',
    category: 'purchase',
    details: 'データ移行サポートを申込みました (¥100,000・初回のみ・税抜)',
    ipAddress: '192.168.1.42',
  },
  {
    id: 'log_014',
    who: { id: 'u3', name: '鈴木 一郎', email: 'suzuki@rookiesmart.jp' },
    when: '2026-05-04T09:00:11',
    action: 'logout',
    category: 'login',
    details: 'ログアウトしました',
    ipAddress: '198.51.100.7',
  },
]

// ─── アクションメタ情報 ──────────────────────────────────────────────────

const ACTION_META: Record<
  AuditAction,
  { label: string; icon: React.ElementType; color: string; category: AuditCategory }
> = {
  create:           { label: '作成',           icon: FileText,    color: '#4BC88C', category: 'data' },
  update:           { label: '更新',           icon: FileText,    color: '#50C8FF', category: 'data' },
  delete:           { label: '削除',           icon: Trash2,      color: '#FF5A5A', category: 'data' },
  role_change:      { label: '権限変更',       icon: Shield,      color: '#FFC107', category: 'permission' },
  member_invite:    { label: 'メンバー招待',   icon: UserPlus,    color: 'var(--color-obs-primary)', category: 'permission' },
  member_remove:    { label: 'メンバー削除',   icon: Users,       color: '#FF5A5A', category: 'permission' },
  integration_add:  { label: '連携追加',       icon: Plug,        color: '#4BC88C', category: 'permission' },
  integration_remove:{label: '連携解除',       icon: Plug,        color: '#FF5A5A', category: 'permission' },
  login_success:    { label: 'ログイン',       icon: LogIn,       color: 'var(--color-obs-text-muted)', category: 'login' },
  login_failed:     { label: 'ログイン失敗',   icon: ShieldAlert, color: '#FFC107', category: 'login' },
  logout:           { label: 'ログアウト',     icon: LogOut,      color: 'var(--color-obs-text-muted)', category: 'login' },
  plan_change:      { label: 'プラン変更',     icon: Sparkles,    color: 'var(--color-obs-primary)', category: 'purchase' },
  credit_purchase:  { label: 'クレジット購入', icon: Coins,       color: '#FFC107', category: 'purchase' },
  support_option_add:{label: 'サポート追加',   icon: CreditCard,  color: '#4BC88C', category: 'purchase' },
  support_option_remove:{label:'サポート解除', icon: CreditCard,  color: '#FF5A5A', category: 'purchase' },
  migration_request:{ label: '初期費用申込',   icon: Database,    color: '#50C8FF', category: 'purchase' },
  feature_request:  { label: '機能リクエスト', icon: Sparkles,    color: 'var(--color-obs-primary)', category: 'purchase' },
}

const CATEGORY_META: Record<AuditCategory, { label: string; color: string }> = {
  data:       { label: 'データ操作',     color: 'var(--color-obs-primary)' },
  permission: { label: '権限・設定',     color: '#FFC107' },
  login:      { label: 'ログイン',       color: 'var(--color-obs-text-muted)' },
  purchase:   { label: '購入・お金',     color: '#FF8A65' },
}

// ─── 権限判定 (本番では auth context から取得) ──────────────────────────

function useIsSuperAdmin(): boolean {
  return true // MVP: モック (本番では currentUser.role === 'super_admin')
}

// ─── CSVエクスポート ─────────────────────────────────────────────────────

// CSV用にフィールドをエスケープ (,/"/改行 を含む場合は "" で囲み・"" を ""エスケープ)
function escapeCsv(value: string | undefined | null): string {
  if (value === undefined || value === null) return ''
  const s = String(value)
  if (/[",\r\n]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`
  }
  return s
}

function exportLogsToCsv(logs: AuditLog[]) {
  const headers = [
    '日時',
    '操作カテゴリ',
    '操作種別',
    '実行者',
    'メールアドレス',
    'ユーザーID',
    '対象リソース',
    '内容',
    '変更前',
    '変更後',
    'IPアドレス',
    'ログID',
  ]

  const rows = logs.map((l) => [
    new Date(l.when).toISOString(),
    CATEGORY_META[l.category].label,
    ACTION_META[l.action].label,
    l.who.name,
    l.who.email,
    l.who.id,
    l.resource ?? '',
    l.details,
    l.diff?.before ?? '',
    l.diff?.after ?? '',
    l.ipAddress,
    l.id,
  ])

  // BOM 付き UTF-8 (Excel で文字化けしない)
  const BOM = '﻿'
  const csv =
    BOM +
    [headers, ...rows]
      .map((row) => row.map(escapeCsv).join(','))
      .join('\r\n')

  const ts = new Date()
    .toISOString()
    .replace(/[:.]/g, '-')
    .slice(0, 19) // 2026-05-10T12-34-56
  const filename = `audit-log_${ts}.csv`

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// ─── ページ ──────────────────────────────────────────────────────────────

export default function AuditLogPage() {
  const isSuperAdmin = useIsSuperAdmin()
  const [keyword, setKeyword] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<AuditCategory | 'all'>('all')
  const [periodFilter, setPeriodFilter] = useState<'24h' | '7d' | '30d' | '1y' | 'all'>('30d')
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null)

  // 特権管理者以外はアクセス不可
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
            監査ログは特権管理者(オーナー)のみが閲覧できます。
          </p>
        </div>
      </ObsPageShell>
    )
  }

  const filteredLogs = useMemo(() => {
    const now = new Date()
    const periodDays: Record<typeof periodFilter, number> = {
      '24h': 1,
      '7d': 7,
      '30d': 30,
      '1y': 365,
      all: 9999,
    }
    const cutoff = new Date(now.getTime() - periodDays[periodFilter] * 24 * 60 * 60 * 1000)

    return SAMPLE_LOGS.filter((l) => {
      if (categoryFilter !== 'all' && l.category !== categoryFilter) return false
      if (new Date(l.when) < cutoff) return false
      if (keyword.trim()) {
        const k = keyword.trim().toLowerCase()
        if (
          !l.details.toLowerCase().includes(k) &&
          !l.who.name.toLowerCase().includes(k) &&
          !l.who.email.toLowerCase().includes(k) &&
          !l.ipAddress.includes(k)
        ) {
          return false
        }
      }
      return true
    }).sort((a, b) => b.when.localeCompare(a.when))
  }, [keyword, categoryFilter, periodFilter])

  // カテゴリ別集計
  const categoryCounts = useMemo(() => {
    const counts: Record<AuditCategory | 'all', number> = {
      all: SAMPLE_LOGS.length,
      data: 0,
      permission: 0,
      login: 0,
      purchase: 0,
    }
    SAMPLE_LOGS.forEach((l) => {
      counts[l.category] += 1
    })
    return counts
  }, [])

  return (
    <ObsPageShell>
      <div className="w-full px-8 xl:px-12 2xl:px-16 pb-16">
        <ObsHero
          eyebrow="Settings"
          title="監査ログ"
          caption="このテナントで行われたすべての操作履歴(データ操作・権限変更・ログイン・購入履歴)を1年間保管・閲覧できます。"
          action={
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => exportLogsToCsv(filteredLogs)}
                disabled={filteredLogs.length === 0}
                title={
                  filteredLogs.length === 0
                    ? 'エクスポート対象のログがありません'
                    : `現在の絞り込み (${filteredLogs.length}件) をCSVで書き出し`
                }
                className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-[var(--radius-obs-md)] text-[12.5px] font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: 'var(--color-obs-surface-high)',
                  color: 'var(--color-obs-text)',
                  boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.06)',
                }}
              >
                <Download size={13} />
                CSVエクスポート
                {filteredLogs.length > 0 && (
                  <span
                    className="text-[10px] font-semibold px-1.5 py-[1px] rounded-full"
                    style={{
                      backgroundColor: 'var(--color-obs-surface-highest)',
                      color: 'var(--color-obs-text-subtle)',
                    }}
                  >
                    {filteredLogs.length}件
                  </span>
                )}
              </button>
              <span
                className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full uppercase tracking-[0.08em]"
                style={{
                  color: '#FFC107',
                  backgroundColor: 'rgba(255,193,7,0.14)',
                }}
              >
                <Shield size={11} />
                特権管理者のみ
              </span>
            </div>
          }
        />

        {/* カテゴリフィルタ + 件数 */}
        <div className="mb-4 flex items-center gap-2 flex-wrap">
          <Filter size={14} style={{ color: 'var(--color-obs-text-subtle)' }} />
          <CategoryTab
            label="すべて"
            count={categoryCounts.all}
            active={categoryFilter === 'all'}
            onClick={() => setCategoryFilter('all')}
            color="var(--color-obs-text-muted)"
          />
          {(['data', 'permission', 'login', 'purchase'] as const).map((cat) => (
            <CategoryTab
              key={cat}
              label={CATEGORY_META[cat].label}
              count={categoryCounts[cat]}
              active={categoryFilter === cat}
              onClick={() => setCategoryFilter(cat)}
              color={CATEGORY_META[cat].color}
            />
          ))}
        </div>

        {/* 検索 + 期間フィルタ */}
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
              placeholder="ユーザー名・操作内容・IPアドレスで検索"
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
                { value: '24h', label: '24時間' },
                { value: '7d', label: '7日' },
                { value: '30d', label: '30日' },
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

        {/* ログ一覧 */}
        {filteredLogs.length === 0 ? (
          <ObsCard depth="high" padding="lg" radius="xl">
            <p
              className="text-[13px] text-center py-8"
              style={{ color: 'var(--color-obs-text-muted)' }}
            >
              該当するログが見つかりません。検索条件を変更してください。
            </p>
          </ObsCard>
        ) : (
          <ObsCard depth="high" padding="none" radius="xl" className="overflow-hidden">
            {filteredLogs.map((log, i) => (
              <LogRow
                key={log.id}
                log={log}
                divider={i > 0}
                onClick={() => setSelectedLog(log)}
              />
            ))}
          </ObsCard>
        )}

        {/* フッター: 仕様説明 */}
        <ObsCard depth="low" padding="md" radius="xl" className="mt-4">
          <div
            className="text-[11.5px] font-medium uppercase tracking-[0.1em] mb-2"
            style={{ color: 'var(--color-obs-text-subtle)' }}
          >
            監査ログについて
          </div>
          <ul className="text-[12.5px] space-y-1.5" style={{ color: 'var(--color-obs-text-muted)' }}>
            <li>・記録対象: データ操作(作成/更新/削除)・権限変更・ログイン/ログアウト・購入履歴</li>
            <li>・保管期間: 1年間 (利用規約 第8条/第17条参照)</li>
            <li>・記録項目: 実行者・日時・操作種別・対象リソース・変更内容・IPアドレス</li>
            <li>・閲覧権限: 特権管理者(オーナー)のみ</li>
            <li>・CSVエクスポート: 現在の絞り込み結果をUTF-8(BOM付き) CSV形式でダウンロードできます (Excel対応)</li>
          </ul>
        </ObsCard>
      </div>

      {/* ログ詳細モーダル */}
      {selectedLog && (
        <LogDetailModal log={selectedLog} onClose={() => setSelectedLog(null)} />
      )}
    </ObsPageShell>
  )
}

// ─── 部品: カテゴリタブ ──────────────────────────────────────────────

function CategoryTab({
  label,
  count,
  active,
  onClick,
  color,
}: {
  label: string
  count: number
  active: boolean
  onClick: () => void
  color: string
}) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-[var(--radius-obs-md)] text-[12.5px] font-medium transition-colors"
      style={{
        backgroundColor: active
          ? `color-mix(in srgb, ${color} 14%, transparent)`
          : 'var(--color-obs-surface-high)',
        color: active ? color : 'var(--color-obs-text-muted)',
      }}
    >
      {label}
      <span
        className="text-[10px] font-semibold px-1.5 py-[1px] rounded-full"
        style={{
          backgroundColor: active
            ? `color-mix(in srgb, ${color} 22%, transparent)`
            : 'var(--color-obs-surface-highest)',
          color: active ? color : 'var(--color-obs-text-subtle)',
        }}
      >
        {count}
      </span>
    </button>
  )
}

// ─── 部品: ログ行 ────────────────────────────────────────────────────

function LogRow({
  log,
  divider,
  onClick,
}: {
  log: AuditLog
  divider: boolean
  onClick: () => void
}) {
  const meta = ACTION_META[log.action]
  const Icon = meta.icon
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full grid grid-cols-[auto_1fr_auto] gap-3 px-5 py-3.5 text-left transition-colors hover:bg-[var(--color-obs-surface-high)]"
      style={{
        borderTop: divider ? '1px solid rgba(255,255,255,0.04)' : 'none',
      }}
    >
      <div
        className="w-9 h-9 rounded-[var(--radius-obs-md)] flex items-center justify-center shrink-0"
        style={{ backgroundColor: `color-mix(in srgb, ${meta.color} 14%, transparent)` }}
      >
        <Icon size={14} style={{ color: meta.color }} />
      </div>
      <div className="min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-0.5">
          <span
            className="text-[10px] font-semibold uppercase tracking-[0.08em]"
            style={{ color: meta.color }}
          >
            {meta.label}
          </span>
          {log.resource && (
            <span
              className="text-[10px] font-mono px-1.5 py-[1px] rounded"
              style={{
                backgroundColor: 'var(--color-obs-surface-highest)',
                color: 'var(--color-obs-text-subtle)',
              }}
            >
              {log.resource}
            </span>
          )}
        </div>
        <p className="text-[13px] font-semibold truncate" style={{ color: 'var(--color-obs-text)' }}>
          {log.details}
        </p>
        <p
          className="text-[11px] mt-0.5 truncate"
          style={{ color: 'var(--color-obs-text-subtle)' }}
        >
          {log.who.name} ({log.who.email}) ・ IP: {log.ipAddress}
        </p>
      </div>
      <p
        className="text-[10.5px] whitespace-nowrap pt-1.5"
        style={{ color: 'var(--color-obs-text-subtle)' }}
      >
        {new Date(log.when).toLocaleString('ja-JP', {
          month: 'numeric',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })}
      </p>
    </button>
  )
}

// ─── 部品: ログ詳細モーダル ──────────────────────────────────────────

function LogDetailModal({ log, onClose }: { log: AuditLog; onClose: () => void }) {
  const meta = ACTION_META[log.action]
  const Icon = meta.icon
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div
        className="absolute inset-0 backdrop-blur-sm"
        style={{ backgroundColor: 'rgba(14,14,16,0.78)' }}
        onClick={onClose}
      />
      <motion.div
        className="relative w-full max-w-[520px] rounded-[var(--radius-obs-xl)] overflow-hidden"
        style={{
          backgroundColor: 'var(--color-obs-surface-highest)',
          boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
        }}
        initial={{ opacity: 0, scale: 0.95, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 12 }}
      >
        {/* ヘッダー */}
        <div
          className="flex items-center justify-between px-6 py-4"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
        >
          <div className="flex items-center gap-2.5">
            <div
              className="w-9 h-9 rounded-[var(--radius-obs-md)] flex items-center justify-center"
              style={{ backgroundColor: `color-mix(in srgb, ${meta.color} 14%, transparent)` }}
            >
              <Icon size={15} style={{ color: meta.color }} />
            </div>
            <div>
              <h2
                className="font-[family-name:var(--font-display)] text-base font-semibold tracking-[-0.01em]"
                style={{ color: 'var(--color-obs-text)' }}
              >
                {meta.label}
              </h2>
              <p className="text-[11px]" style={{ color: 'var(--color-obs-text-subtle)' }}>
                {CATEGORY_META[log.category].label}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full transition-colors hover:bg-[var(--color-obs-surface-high)]"
          >
            <X size={16} style={{ color: 'var(--color-obs-text-muted)' }} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          {/* 詳細 */}
          <div>
            <p
              className="text-[10.5px] font-medium uppercase tracking-[0.1em] mb-1"
              style={{ color: 'var(--color-obs-text-subtle)' }}
            >
              内容
            </p>
            <p className="text-[14px] font-semibold" style={{ color: 'var(--color-obs-text)' }}>
              {log.details}
            </p>
          </div>

          {/* メタ情報 */}
          <dl className="grid grid-cols-[120px_1fr] gap-y-2.5 gap-x-3 text-[12.5px]">
            <DetailRow label="実行者">
              <span style={{ color: 'var(--color-obs-text)' }}>{log.who.name}</span>
              <br />
              <span className="text-[11px]" style={{ color: 'var(--color-obs-text-subtle)' }}>
                {log.who.email}
              </span>
            </DetailRow>
            <DetailRow label="日時">
              {new Date(log.when).toLocaleString('ja-JP', {
                year: 'numeric',
                month: 'numeric',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
              })}
            </DetailRow>
            <DetailRow label="操作種別">{meta.label}</DetailRow>
            {log.resource && (
              <DetailRow label="対象">
                <span
                  className="font-mono text-[11.5px] px-1.5 py-[2px] rounded"
                  style={{
                    backgroundColor: 'var(--color-obs-surface-high)',
                    color: 'var(--color-obs-text-muted)',
                  }}
                >
                  {log.resource}
                </span>
              </DetailRow>
            )}
            <DetailRow label="IPアドレス">
              <span className="font-mono text-[11.5px]">{log.ipAddress}</span>
            </DetailRow>
          </dl>

          {/* 変更前後 */}
          {log.diff && (
            <div>
              <p
                className="text-[10.5px] font-medium uppercase tracking-[0.1em] mb-2"
                style={{ color: 'var(--color-obs-text-subtle)' }}
              >
                変更前後
              </p>
              <div
                className="rounded-[var(--radius-obs-md)] p-3 space-y-2"
                style={{ backgroundColor: 'var(--color-obs-surface-high)' }}
              >
                {log.diff.before && (
                  <div className="flex gap-3">
                    <span
                      className="text-[11px] font-medium px-1.5 py-0.5 rounded shrink-0 h-fit"
                      style={{
                        backgroundColor: 'rgba(255,90,90,0.12)',
                        color: '#FF5A5A',
                      }}
                    >
                      Before
                    </span>
                    <p className="text-[12.5px]" style={{ color: 'var(--color-obs-text-muted)' }}>
                      {log.diff.before}
                    </p>
                  </div>
                )}
                {log.diff.after && (
                  <div className="flex gap-3">
                    <span
                      className="text-[11px] font-medium px-1.5 py-0.5 rounded shrink-0 h-fit"
                      style={{
                        backgroundColor: 'rgba(75,200,140,0.14)',
                        color: '#4BC88C',
                      }}
                    >
                      After
                    </span>
                    <p className="text-[12.5px]" style={{ color: 'var(--color-obs-text-muted)' }}>
                      {log.diff.after}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          <p
            className="text-[10.5px] pt-2 border-t"
            style={{
              color: 'var(--color-obs-text-subtle)',
              borderColor: 'rgba(255,255,255,0.05)',
            }}
          >
            ログID: <span className="font-mono">{log.id}</span>
          </p>
        </div>
      </motion.div>
    </motion.div>
  )
}

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <>
      <dt style={{ color: 'var(--color-obs-text-subtle)' }}>{label}</dt>
      <dd style={{ color: 'var(--color-obs-text)' }}>{children}</dd>
    </>
  )
}
