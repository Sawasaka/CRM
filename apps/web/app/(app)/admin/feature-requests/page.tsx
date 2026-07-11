'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Sparkles,
  Check,
  X,
  Edit3,
  MessageCircle,
  Filter,
  ChevronDown,
  Building2,
  Clock,
  ShieldAlert,
} from 'lucide-react'
import {
  ObsButton,
  ObsCard,
  ObsHero,
  ObsPageShell,
} from '@/components/obsidian'

// ─── 型定義 ──────────────────────────────────────────────────────────────

type RequestStatus = 'submitted' | 'approved' | 'in_progress' | 'completed' | 'rejected'

interface AiEstimation {
  workHours: number
  verifyHours: number
  maintenanceHours: number
  baseAmount: number
  bufferAmount: number
  finalAmount: number
  confidence: 'low' | 'medium' | 'high'
  rationale: string
}

interface AdminFeatureRequest {
  id: string
  tenantId: string
  tenantName: string
  tenantPlan: 'Free' | 'Standard' | 'PRO'
  requesterName: string
  requesterEmail: string
  title: string
  description: string
  status: RequestStatus
  estimation: AiEstimation
  amount: number          // 確定金額(調整後はこれ)
  adjustedAmount?: number  // 管理者が調整した金額
  createdAt: string
  reviewedAt?: string
}

// ─── サンプルデータ ─────────────────────────────────────────────────────

const SAMPLE_ADMIN_REQUESTS: AdminFeatureRequest[] = []

const STATUS_META: Record<RequestStatus, { label: string; bg: string; fg: string }> = {
  submitted: { label: '依頼中', bg: 'rgba(255,193,7,0.14)', fg: '#FFC107' },
  approved: { label: '承認済', bg: 'rgba(171,199,255,0.14)', fg: 'var(--color-obs-primary)' },
  in_progress: { label: '開発中', bg: 'rgba(80,200,255,0.14)', fg: '#50C8FF' },
  completed: { label: '完了', bg: 'rgba(75,200,140,0.14)', fg: '#4BC88C' },
  rejected: { label: '却下', bg: 'rgba(255,90,90,0.14)', fg: '#FF5A5A' },
}

// ─── BGMテナント判定 (本番では環境変数 + auth context で判定) ─────────────

// 開発時: NEXT_PUBLIC_BGM_TENANT_ID と現在のテナントIDを比較
// MVPではモックで常時 true としておく
function useIsBGMTenant(): boolean {
  // const currentTenantId = useCurrentTenantId() // auth context
  // return currentTenantId === process.env.NEXT_PUBLIC_BGM_TENANT_ID
  return true // MVP: モック
}

// ─── ページコンポーネント ───────────────────────────────────────────────

export default function AdminFeatureRequestsPage() {
  const isBGMTenant = useIsBGMTenant()
  const [filter, setFilter] = useState<RequestStatus | 'all'>('all')
  const [requests, setRequests] = useState<AdminFeatureRequest[]>(SAMPLE_ADMIN_REQUESTS)
  const [confirmDialog, setConfirmDialog] = useState<{
    title: string
    message: string
    confirmLabel: string
    variant: 'primary' | 'danger'
    onConfirm: () => void
  } | null>(null)
  const [adjustModal, setAdjustModal] = useState<{ requestId: string; currentAmount: number } | null>(null)
  const [adjustValue, setAdjustValue] = useState<number>(0)

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
            このページは FDE CRM 開発者専用です。
          </p>
        </div>
      </ObsPageShell>
    )
  }

  const filteredRequests = filter === 'all' ? requests : requests.filter((r) => r.status === filter)

  // ステータスごとの件数
  const counts: Record<RequestStatus | 'all', number> = {
    all: requests.length,
    submitted: requests.filter((r) => r.status === 'submitted').length,
    approved: requests.filter((r) => r.status === 'approved').length,
    in_progress: requests.filter((r) => r.status === 'in_progress').length,
    completed: requests.filter((r) => r.status === 'completed').length,
    rejected: requests.filter((r) => r.status === 'rejected').length,
  }

  const updateRequestStatus = (id: string, status: RequestStatus, newAmount?: number) => {
    setRequests((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              status,
              amount: newAmount ?? r.amount,
              adjustedAmount: newAmount !== undefined && newAmount !== r.estimation.finalAmount ? newAmount : r.adjustedAmount,
              reviewedAt: new Date().toISOString(),
            }
          : r,
      ),
    )
  }

  const filterTabs: Array<{ key: RequestStatus | 'all'; label: string }> = [
    { key: 'all', label: 'すべて' },
    { key: 'submitted', label: '依頼中' },
    { key: 'approved', label: '承認済' },
    { key: 'in_progress', label: '開発中' },
    { key: 'completed', label: '完了' },
    { key: 'rejected', label: '却下' },
  ]

  return (
    <ObsPageShell>
      <div className="w-full px-8 xl:px-12 2xl:px-16 pb-16">
        <ObsHero
          eyebrow="Admin"
          title="機能リクエスト管理"
          caption="全テナントから届いた機能リクエストを一元管理。AI算出された見積もりを承認・調整・却下できます。"
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

        {/* フィルタタブ */}
        <div className="mb-6 flex items-center gap-2 flex-wrap">
          <Filter size={14} style={{ color: 'var(--color-obs-text-subtle)' }} />
          {filterTabs.map((t) => {
            const active = filter === t.key
            const count = counts[t.key]
            return (
              <button
                key={t.key}
                onClick={() => setFilter(t.key)}
                className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-[var(--radius-obs-md)] text-[12.5px] font-medium transition-colors"
                style={{
                  backgroundColor: active
                    ? 'var(--color-obs-primary-container)'
                    : 'var(--color-obs-surface-high)',
                  color: active ? 'var(--color-obs-on-primary)' : 'var(--color-obs-text-muted)',
                }}
              >
                {t.label}
                <span
                  className="text-[10px] font-semibold px-1.5 py-[1px] rounded-full"
                  style={{
                    backgroundColor: active
                      ? 'rgba(255,255,255,0.18)'
                      : 'var(--color-obs-surface-highest)',
                    color: active ? 'var(--color-obs-on-primary)' : 'var(--color-obs-text-subtle)',
                  }}
                >
                  {count}
                </span>
              </button>
            )
          })}
        </div>

        {/* リクエスト一覧 */}
        {filteredRequests.length === 0 ? (
          <ObsCard depth="high" padding="lg" radius="xl">
            <p className="text-[13px] text-center py-8" style={{ color: 'var(--color-obs-text-muted)' }}>
              該当する機能リクエストはありません。
            </p>
          </ObsCard>
        ) : (
          <div className="space-y-3">
            {filteredRequests.map((req) => {
              const meta = STATUS_META[req.status]
              return (
                <RequestCard
                  key={req.id}
                  request={req}
                  meta={meta}
                  onApprove={() =>
                    setConfirmDialog({
                      title: 'リクエストを承認',
                      message: `${req.tenantName} 様の「${req.title}」を AI算出金額 ¥${req.amount.toLocaleString()} で承認します。承認すると顧客のクレジットから引き落としが発生します。`,
                      confirmLabel: '承認する',
                      variant: 'primary',
                      onConfirm: () => updateRequestStatus(req.id, 'approved'),
                    })
                  }
                  onAdjust={() => {
                    setAdjustValue(req.amount)
                    setAdjustModal({ requestId: req.id, currentAmount: req.amount })
                  }}
                  onReject={() =>
                    setConfirmDialog({
                      title: 'リクエストを却下',
                      message: `${req.tenantName} 様の「${req.title}」を却下します。クレジットの引き落としは発生せず、顧客に却下通知が送られます。`,
                      confirmLabel: '却下する',
                      variant: 'danger',
                      onConfirm: () => updateRequestStatus(req.id, 'rejected'),
                    })
                  }
                  onMoveToDev={() =>
                    setConfirmDialog({
                      title: '開発中ステータスに移行',
                      message: `${req.tenantName} 様の「${req.title}」を開発中ステータスに変更します。`,
                      confirmLabel: '開発開始',
                      variant: 'primary',
                      onConfirm: () => updateRequestStatus(req.id, 'in_progress'),
                    })
                  }
                  onComplete={() =>
                    setConfirmDialog({
                      title: '開発完了',
                      message: `${req.tenantName} 様の「${req.title}」を完了ステータスに変更し、顧客に通知します。`,
                      confirmLabel: '完了する',
                      variant: 'primary',
                      onConfirm: () => updateRequestStatus(req.id, 'completed'),
                    })
                  }
                />
              )
            })}
          </div>
        )}
      </div>

      {/* 確認ダイアログ */}
      <AnimatePresence>
        {confirmDialog && (
          <motion.div
            className="fixed inset-0 z-[60] flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div
              className="absolute inset-0 backdrop-blur-sm"
              style={{ backgroundColor: 'rgba(14,14,16,0.78)' }}
              onClick={() => setConfirmDialog(null)}
            />
            <motion.div
              className="relative w-full max-w-[440px] rounded-[var(--radius-obs-xl)] overflow-hidden"
              style={{
                backgroundColor: 'var(--color-obs-surface-highest)',
                boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
              }}
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
            >
              <div className="p-6">
                <h3
                  className="font-[family-name:var(--font-display)] text-base font-semibold mb-2"
                  style={{ color: 'var(--color-obs-text)' }}
                >
                  {confirmDialog.title}
                </h3>
                <p
                  className="text-[13px] leading-relaxed mb-5"
                  style={{ color: 'var(--color-obs-text-muted)' }}
                >
                  {confirmDialog.message}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setConfirmDialog(null)}
                    className="flex-1 h-10 rounded-[var(--radius-obs-md)] text-[13px] font-medium"
                    style={{
                      backgroundColor: 'transparent',
                      color: 'var(--color-obs-text-muted)',
                      boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.08)',
                    }}
                  >
                    キャンセル
                  </button>
                  <button
                    onClick={() => {
                      confirmDialog.onConfirm()
                      setConfirmDialog(null)
                    }}
                    className="flex-1 h-10 rounded-[var(--radius-obs-md)] text-[13px] font-semibold"
                    style={
                      confirmDialog.variant === 'danger'
                        ? {
                            backgroundColor: 'rgba(255,90,90,0.14)',
                            color: '#FF5A5A',
                            boxShadow: 'inset 0 0 0 1px rgba(255,90,90,0.30)',
                          }
                        : {
                            background:
                              'linear-gradient(135deg, var(--color-obs-primary) 0%, var(--color-obs-primary-container) 100%)',
                            color: 'var(--color-obs-on-primary)',
                          }
                    }
                  >
                    {confirmDialog.confirmLabel}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 金額調整モーダル */}
      <AnimatePresence>
        {adjustModal && (
          <motion.div
            className="fixed inset-0 z-[60] flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div
              className="absolute inset-0 backdrop-blur-sm"
              style={{ backgroundColor: 'rgba(14,14,16,0.78)' }}
              onClick={() => setAdjustModal(null)}
            />
            <motion.div
              className="relative w-full max-w-[440px] rounded-[var(--radius-obs-xl)] overflow-hidden"
              style={{
                backgroundColor: 'var(--color-obs-surface-highest)',
                boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
              }}
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
            >
              <div className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <Edit3 size={16} style={{ color: 'var(--color-obs-primary)' }} />
                  <h3
                    className="font-[family-name:var(--font-display)] text-base font-semibold"
                    style={{ color: 'var(--color-obs-text)' }}
                  >
                    金額を調整
                  </h3>
                </div>
                <p
                  className="text-[12.5px] mb-4"
                  style={{ color: 'var(--color-obs-text-muted)' }}
                >
                  現在のAI算出: ¥{adjustModal.currentAmount.toLocaleString()} (1万円単位で調整できます)
                </p>
                <div
                  className="rounded-[var(--radius-obs-md)] p-4 mb-4"
                  style={{ backgroundColor: 'var(--color-obs-surface-high)' }}
                >
                  <div className="flex items-center justify-between gap-3">
                    <button
                      onClick={() => setAdjustValue((v) => Math.max(10000, v - 10000))}
                      disabled={adjustValue <= 10000}
                      className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-105 disabled:opacity-30"
                      style={{ backgroundColor: 'var(--color-obs-surface-highest)' }}
                    >
                      −
                    </button>
                    <p
                      className="text-[28px] font-bold tabular-nums"
                      style={{ color: 'var(--color-obs-text)' }}
                    >
                      ¥{adjustValue.toLocaleString()}
                    </p>
                    <button
                      onClick={() => setAdjustValue((v) => v + 10000)}
                      className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-105"
                      style={{ backgroundColor: 'var(--color-obs-surface-highest)' }}
                    >
                      +
                    </button>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setAdjustModal(null)}
                    className="flex-1 h-10 rounded-[var(--radius-obs-md)] text-[13px] font-medium"
                    style={{
                      backgroundColor: 'transparent',
                      color: 'var(--color-obs-text-muted)',
                      boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.08)',
                    }}
                  >
                    キャンセル
                  </button>
                  <ObsButton
                    variant="primary"
                    size="md"
                    className="flex-1"
                    onClick={() => {
                      updateRequestStatus(adjustModal.requestId, 'approved', adjustValue)
                      setAdjustModal(null)
                    }}
                  >
                    調整して承認
                  </ObsButton>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </ObsPageShell>
  )
}

// ─── リクエストカード ────────────────────────────────────────────────────

function RequestCard({
  request: r,
  meta,
  onApprove,
  onAdjust,
  onReject,
  onMoveToDev,
  onComplete,
}: {
  request: AdminFeatureRequest
  meta: { label: string; bg: string; fg: string }
  onApprove: () => void
  onAdjust: () => void
  onReject: () => void
  onMoveToDev: () => void
  onComplete: () => void
}) {
  const [expanded, setExpanded] = useState(r.status === 'submitted')

  return (
    <ObsCard depth="high" padding="lg" radius="xl">
      {/* ヘッダー: テナント情報 + ステータス */}
      <div className="flex items-start justify-between mb-3 gap-3">
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <div
            className="w-9 h-9 rounded-[var(--radius-obs-md)] flex items-center justify-center shrink-0"
            style={{
              background:
                'linear-gradient(135deg, var(--color-obs-primary) 0%, var(--color-obs-primary-container) 100%)',
            }}
          >
            <Building2 size={15} style={{ color: 'var(--color-obs-on-primary)' }} />
          </div>
          <div className="min-w-0">
            <p
              className="text-[13.5px] font-semibold truncate"
              style={{ color: 'var(--color-obs-text)' }}
            >
              {r.tenantName}
            </p>
            <p className="text-[11px] truncate" style={{ color: 'var(--color-obs-text-subtle)' }}>
              <span
                className="inline-block px-1.5 py-[1px] rounded mr-1.5"
                style={{
                  backgroundColor: 'var(--color-obs-surface-highest)',
                  color: 'var(--color-obs-text-muted)',
                }}
              >
                {r.tenantPlan}
              </span>
              {r.requesterName} ・ {r.requesterEmail}
            </p>
          </div>
        </div>
        <span
          className="text-[11px] font-semibold px-2.5 py-1 rounded-full uppercase tracking-[0.08em] shrink-0"
          style={{ backgroundColor: meta.bg, color: meta.fg }}
        >
          {meta.label}
        </span>
      </div>

      {/* タイトル */}
      <h3
        className="font-[family-name:var(--font-display)] text-base font-semibold mb-2"
        style={{ color: 'var(--color-obs-text)' }}
      >
        {r.title}
      </h3>

      {/* 概要 (折り畳み可) */}
      <p
        className={
          expanded
            ? 'text-[12.5px] leading-relaxed mb-4 whitespace-pre-line'
            : 'text-[12.5px] leading-relaxed mb-4 line-clamp-2'
        }
        style={{ color: 'var(--color-obs-text-muted)' }}
      >
        {r.description}
      </p>

      {/* AI算出ブロック */}
      <div
        className="rounded-[var(--radius-obs-md)] mb-4 overflow-hidden"
        style={{
          background: 'rgba(171,199,255,0.06)',
          boxShadow: 'inset 0 0 0 1px rgba(171,199,255,0.16)',
        }}
      >
        <div className="px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Sparkles size={13} style={{ color: 'var(--color-obs-primary)' }} />
            <span
              className="text-[10.5px] font-medium uppercase tracking-[0.1em]"
              style={{ color: 'var(--color-obs-primary)' }}
            >
              AI算出
            </span>
            <span
              className="text-[10px] font-medium px-1.5 py-[1px] rounded-full"
              style={{
                backgroundColor: 'var(--color-obs-surface-highest)',
                color: 'var(--color-obs-text-subtle)',
              }}
            >
              自信度:{' '}
              {r.estimation.confidence === 'high'
                ? '★★★'
                : r.estimation.confidence === 'medium'
                  ? '★★☆'
                  : '★☆☆'}
            </span>
          </div>
          <p
            className="font-[family-name:var(--font-display)] text-[22px] font-bold tabular-nums"
            style={{ color: 'var(--color-obs-text)' }}
          >
            ¥{r.amount.toLocaleString()}
            {r.adjustedAmount && r.adjustedAmount !== r.estimation.finalAmount && (
              <span
                className="text-[11px] font-medium ml-1.5 line-through"
                style={{ color: 'var(--color-obs-text-subtle)' }}
              >
                ¥{r.estimation.finalAmount.toLocaleString()}
              </span>
            )}
          </p>
        </div>

        {expanded && (
          <div
            className="px-4 py-3 grid grid-cols-3 gap-3 text-[11.5px]"
            style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
          >
            <div>
              <p style={{ color: 'var(--color-obs-text-subtle)' }}>工数</p>
              <p
                className="font-semibold tabular-nums mt-0.5"
                style={{ color: 'var(--color-obs-text)' }}
              >
                {r.estimation.workHours}h
              </p>
            </div>
            <div>
              <p style={{ color: 'var(--color-obs-text-subtle)' }}>検証</p>
              <p
                className="font-semibold tabular-nums mt-0.5"
                style={{ color: 'var(--color-obs-text)' }}
              >
                {r.estimation.verifyHours}h
              </p>
            </div>
            <div>
              <p style={{ color: 'var(--color-obs-text-subtle)' }}>メンテ</p>
              <p
                className="font-semibold tabular-nums mt-0.5"
                style={{ color: 'var(--color-obs-text)' }}
              >
                {r.estimation.maintenanceHours}h
              </p>
            </div>
          </div>
        )}

        {expanded && (
          <div
            className="px-4 py-3 flex gap-2"
            style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
          >
            <span className="text-[14px] leading-none">💡</span>
            <p
              className="text-[11.5px] leading-relaxed"
              style={{ color: 'var(--color-obs-text-muted)' }}
            >
              {r.estimation.rationale}
            </p>
          </div>
        )}
      </div>

      {/* メタ情報 + 折り畳みトグル */}
      <div className="flex items-center justify-between mb-4">
        <div
          className="flex items-center gap-3 text-[11px]"
          style={{ color: 'var(--color-obs-text-subtle)' }}
        >
          <span className="flex items-center gap-1">
            <Clock size={11} />
            {new Date(r.createdAt).toLocaleString('ja-JP', {
              month: 'numeric',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}{' '}
            申込
          </span>
          {r.reviewedAt && (
            <span className="flex items-center gap-1">
              <Check size={11} />
              {new Date(r.reviewedAt).toLocaleString('ja-JP', {
                month: 'numeric',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}{' '}
              確認
            </span>
          )}
        </div>
        <button
          onClick={() => setExpanded((v) => !v)}
          className="text-[11.5px] font-medium flex items-center gap-1"
          style={{ color: 'var(--color-obs-text-muted)' }}
        >
          {expanded ? '折りたたむ' : '詳細を見る'}
          <ChevronDown
            size={12}
            style={{
              transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s',
            }}
          />
        </button>
      </div>

      {/* アクションボタン (ステータス別) */}
      {r.status === 'submitted' && (
        <div className="flex gap-2 flex-wrap">
          <ObsButton variant="primary" size="md" onClick={onApprove}>
            <Check size={14} className="inline mr-1" />
            AI算出で承認
          </ObsButton>
          <button
            onClick={onAdjust}
            className="h-10 px-4 rounded-[var(--radius-obs-md)] text-[13px] font-medium transition-colors"
            style={{
              backgroundColor: 'transparent',
              color: 'var(--color-obs-text-muted)',
              boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.08)',
            }}
          >
            <Edit3 size={13} className="inline mr-1" />
            金額調整
          </button>
          <button
            onClick={onReject}
            className="h-10 px-4 rounded-[var(--radius-obs-md)] text-[13px] font-medium transition-colors"
            style={{
              backgroundColor: 'transparent',
              color: '#FF5A5A',
              boxShadow: 'inset 0 0 0 1px rgba(255,90,90,0.20)',
            }}
          >
            <X size={13} className="inline mr-1" />
            却下
          </button>
          <button
            disabled
            title="次フェーズで実装"
            className="h-10 px-4 rounded-[var(--radius-obs-md)] text-[13px] font-medium opacity-50 cursor-not-allowed"
            style={{
              backgroundColor: 'transparent',
              color: 'var(--color-obs-text-subtle)',
              boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.08)',
            }}
          >
            <MessageCircle size={13} className="inline mr-1" />
            質問
          </button>
        </div>
      )}

      {r.status === 'approved' && (
        <ObsButton variant="primary" size="md" onClick={onMoveToDev}>
          開発開始(開発中ステータスへ)
        </ObsButton>
      )}

      {r.status === 'in_progress' && (
        <ObsButton variant="primary" size="md" onClick={onComplete}>
          開発完了として確定
        </ObsButton>
      )}

      {(r.status === 'completed' || r.status === 'rejected') && (
        <p className="text-[11.5px]" style={{ color: 'var(--color-obs-text-subtle)' }}>
          このリクエストは確定済みです。再操作はできません。
        </p>
      )}
    </ObsCard>
  )
}
