'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { Building2, Check, Copy, ExternalLink, Link2, Pencil, Plus, Trash2, X } from 'lucide-react'
import { ObsCard, ObsHero, ObsPageShell } from '@/components/obsidian'
import type {
  ContractItem,
  CustomerOpsMetrics,
  TenantRow,
  TenantStatus,
} from '@/lib/admin/customer-ops-types'
import { getPaidJoinUrl, getTenantEnvironmentUrl } from '@/lib/public-url'

// 開発者用テナント一覧 (最小機能版 / 精緻UI)
// - 行クリックで該当テナントの本環境を新規タブで開く
//   (詳細ページへの遷移は廃止。確認はこのタブで完結)

export function CustomerOpsClient({
  tenants: initialTenants,
}: {
  tenants: TenantRow[]
  metrics: CustomerOpsMetrics
}) {
  const router = useRouter()
  const [tenants, setTenants] = useState<TenantRow[]>(() => sortTenantsDefaultFirst(initialTenants))
  const [editingTenant, setEditingTenant] = useState<TenantRow | null>(null)
  const masterTenants = tenants.filter(isMasterTenantRow)
  const productionTenants = tenants.filter((tenant) => !isMasterTenantRow(tenant))

  useEffect(() => {
    setTenants(sortTenantsDefaultFirst(initialTenants))
  }, [initialTenants])

  useEffect(() => {
    const refresh = () => router.refresh()
    const intervalId = window.setInterval(refresh, 10_000)
    window.addEventListener('focus', refresh)
    document.addEventListener('visibilitychange', refresh)
    return () => {
      window.clearInterval(intervalId)
      window.removeEventListener('focus', refresh)
      document.removeEventListener('visibilitychange', refresh)
    }
  }, [router])

  const handleCreateNew = () => {
    setEditingTenant(buildEmptyTenant())
  }

  // 保存時に一覧へ反映 (新規 = 追加、編集 = 置換)
  const handleSaved = (saved: TenantRow) => {
    setTenants((prev) => {
      const exists = prev.some((t) => t.id === saved.id)
      if (exists) {
        return sortTenantsDefaultFirst(prev.map((t) => (t.id === saved.id ? saved : t)))
      }
      return sortTenantsDefaultFirst([saved, ...prev])
    })
    setEditingTenant(null)
  }

  const handleDeleted = (id: string) => {
    setTenants((prev) => prev.filter((tenant) => tenant.id !== id))
    setEditingTenant(null)
  }

  return (
    <ObsPageShell>
      <div className="w-full px-8 xl:px-12 2xl:px-16 pb-16">
        <ObsHero
          eyebrow="Admin"
          title="開発者ページ"
          caption="本番テナントの一覧と環境アクセスができます。"
        />

        {/* ── 開発者専用バッジ + 新規テナント (一覧の直上に独立した行として配置) ── */}
        <div className="flex items-center justify-end gap-2.5 mb-4">
          <span
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold uppercase tracking-[0.08em]"
            style={{
              background: 'rgba(255,193,7,0.10)',
              color: '#FFC107',
              boxShadow: 'inset 0 0 0 1px rgba(255,193,7,0.30)',
            }}
          >
            開発者専用
          </span>
          <button
            type="button"
            onClick={handleCreateNew}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-[var(--radius-obs-md)] text-[12.5px] font-semibold transition-transform"
            style={{
              background:
                'linear-gradient(135deg, var(--color-obs-primary) 0%, var(--color-obs-primary-container) 100%)',
              color: 'var(--color-obs-on-primary)',
              boxShadow:
                '0 6px 16px -4px rgba(171,199,255,0.40), inset 1px 1px 0 rgba(255,255,255,0.20)',
            }}
          >
            <Plus size={14} strokeWidth={2.6} />
            新規テナント
          </button>
        </div>

        {/* ── テナント一覧 ── */}
        {tenants.length === 0 ? (
          <ObsCard depth="high" padding="lg" radius="xl">
            <div
              className="px-4 py-12 text-center text-[13px] space-y-3"
              style={{ color: 'var(--color-obs-text-muted)' }}
            >
              <p>テナントがまだ登録されていません。</p>
              <button
                type="button"
                onClick={handleCreateNew}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-[var(--radius-obs-md)] text-[12.5px] font-semibold transition-transform"
                style={{
                  background:
                    'linear-gradient(135deg, var(--color-obs-primary) 0%, var(--color-obs-primary-container) 100%)',
                  color: 'var(--color-obs-on-primary)',
                  boxShadow:
                    '0 6px 16px -4px rgba(171,199,255,0.40), inset 1px 1px 0 rgba(255,255,255,0.20)',
                }}
              >
                <Plus size={14} strokeWidth={2.6} />
                最初のテナントを作成
              </button>
            </div>
          </ObsCard>
        ) : (
          <div className="space-y-8">
            <TenantSection
              title="Default / マスター環境"
              caption="開発・機能修正の基準になる環境です。本番環境とは分けて管理します。"
              tenants={masterTenants}
              emptyText="マスター環境はまだありません。"
              onEdit={setEditingTenant}
            />
            <TenantSection
              title="本番環境 / 顧客テナント"
              caption="顧客が使う実データ環境です。"
              tenants={productionTenants}
              emptyText="本番顧客テナントはまだありません。"
              onEdit={setEditingTenant}
            />
          </div>
        )}
      </div>

      {/* 編集 / 新規モーダル (中央モーダル・画面遷移なし) */}
      <TenantEditDrawer
        tenant={editingTenant}
        onClose={() => setEditingTenant(null)}
        onSaved={handleSaved}
        onDeleted={handleDeleted}
      />
    </ObsPageShell>
  )
}

function TenantSection({
  title,
  caption,
  tenants,
  emptyText,
  onEdit,
}: {
  title: string
  caption: string
  tenants: TenantRow[]
  emptyText: string
  onEdit: (tenant: TenantRow) => void
}) {
  return (
    <section className="space-y-3">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2
            className="font-[family-name:var(--font-display)] text-[18px] font-semibold tracking-normal"
            style={{ color: 'var(--color-obs-text)' }}
          >
            {title}
          </h2>
          <p
            className="mt-1 max-w-2xl text-[12.5px] leading-relaxed"
            style={{ color: 'var(--color-obs-text-muted)' }}
          >
            {caption}
          </p>
        </div>
        <span
          className="shrink-0 rounded-full px-3 py-1.5 text-[11px] font-semibold"
          style={{
            color: 'var(--color-obs-text-subtle)',
            background: 'rgba(255,255,255,0.04)',
            boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.07)',
          }}
        >
          {tenants.length} 件
        </span>
      </div>

      {tenants.length > 0 ? (
        <div className="space-y-3">
          {tenants.map((tenant) => (
            <TenantRowItem key={tenant.id} tenant={tenant} onEdit={() => onEdit(tenant)} />
          ))}
        </div>
      ) : (
        <div
          className="rounded-[18px] px-5 py-5 text-[12.5px]"
          style={{
            color: 'var(--color-obs-text-muted)',
            background: 'rgba(255,255,255,0.025)',
            boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.05)',
          }}
        >
          {emptyText}
        </div>
      )}
    </section>
  )
}

// 新規作成用の空テナント (id === '' を新規モード判定に使う)
function buildEmptyTenant(): TenantRow {
  return {
    id: '',
    name: '',
    slug: '',
    plan: 'Standard',
    status: 'active',
    userCount: 0,
    activeUsers30d: 0,
    companyCount: 0,
    contactCount: 0,
    dealCount: 0,
    ticketCount: 0,
    knowledgeCount: 0,
    activityCount: 0,
    activityCount30d: 0,
    integrations: { google: false, slack: false, microsoft: false },
    createdAt: new Date().toISOString(),
    lastActivityAt: null,
    demoExpiresAt: null,
    primaryContact: null,
    contractInfo: [],
    memo: '',
  }
}

function isMasterTenantRow(tenant: TenantRow) {
  return tenant.slug === 'default'
}

function sortTenantsDefaultFirst(tenants: TenantRow[]) {
  return [...tenants].sort((a, b) => {
    if (a.slug === 'default' && b.slug !== 'default') return -1
    if (b.slug === 'default' && a.slug !== 'default') return 1
    const aTime = a.lastActivityAt ?? a.createdAt
    const bTime = b.lastActivityAt ?? b.createdAt
    return bTime.localeCompare(aTime)
  })
}

// ─── Tenant row (グラデ枠 + ambient glow + 精緻チップ) ───────────────────────

function TenantRowItem({ tenant, onEdit }: { tenant: TenantRow; onEdit: () => void }) {
  const [hover, setHover] = useState(false)
  const tenantUrl = getTenantEnvironmentUrl(tenant.slug)
  const canOpenTenant = tenant.status !== 'inactive'
  return (
    <div
      className="block rounded-[20px] p-[1px] transition-all duration-200"
      style={{
        background: hover
          ? 'linear-gradient(135deg, rgba(171,199,255,0.45) 0%, rgba(0,113,227,0.22) 50%, rgba(171,199,255,0.06) 100%)'
          : 'linear-gradient(135deg, rgba(171,199,255,0.18) 0%, rgba(171,199,255,0.05) 60%, transparent 100%)',
        boxShadow: hover
          ? '0 12px 36px -16px rgba(171,199,255,0.30), 0 0 0 1px rgba(171,199,255,0.10)'
          : '0 6px 24px -14px rgba(0,0,0,0.45), 0 0 0 1px rgba(255,255,255,0.02)',
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div
        className="rounded-[19px] px-5 py-4 relative overflow-hidden fo-glass-rim"
        style={{
          background: 'linear-gradient(180deg, rgba(18,18,22,0.94) 0%, rgba(12,12,16,0.96) 100%)',
        }}
      >
        {/* hover時の ambient glow */}
        {hover && (
          <div
            className="absolute -top-16 -right-12 w-48 h-48 rounded-full pointer-events-none"
            style={{
              background: 'radial-gradient(circle, rgba(171,199,255,0.16), transparent 60%)',
              filter: 'blur(36px)',
            }}
          />
        )}

        <div className="flex items-center gap-4 relative">
          {/* アイコンチップ (グラデ + 内側ring + 外側ソフト影) */}
          <div
            className="shrink-0 w-12 h-12 rounded-[14px] flex items-center justify-center"
            style={{
              background:
                'linear-gradient(135deg, rgba(171,199,255,0.30) 0%, rgba(0,113,227,0.18) 100%)',
              boxShadow:
                'inset 0 0 0 1px rgba(171,199,255,0.40), inset 1px 1px 0 rgba(255,255,255,0.10), 0 8px 18px -8px rgba(171,199,255,0.30)',
            }}
          >
            <Building2
              size={20}
              strokeWidth={2}
              style={{
                color: 'var(--color-obs-primary)',
                filter: 'drop-shadow(0 0 6px rgba(171,199,255,0.35))',
              }}
            />
          </div>

          {/* 名前 + プラン + 状態 */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className="font-[family-name:var(--font-display)] text-[16px] font-semibold tracking-[-0.015em] truncate"
                style={{ color: 'var(--color-obs-text)' }}
              >
                {tenant.name}
              </span>
              <StatusChip status={tenant.status} />
            </div>
            <div
              className="text-[12px] mt-1 truncate"
              style={{ color: 'var(--color-obs-text-subtle)' }}
            >
              <span>会社名 {tenant.name}</span>
              <span className="mx-1.5" style={{ color: 'var(--color-obs-text-muted)' }}>
                ・
              </span>
              最終活動 {tenant.lastActivityAt ? formatDate(tenant.lastActivityAt) : '—'}
              <span className="mx-1.5" style={{ color: 'var(--color-obs-text-muted)' }}>
                ・
              </span>
              作成 {formatDate(tenant.createdAt)}
            </div>
          </div>

          {/* アクション (編集 + 環境に入る) */}
          <div className="flex items-center gap-2 shrink-0">
            {/* 編集 (右からスライドするサイドパネル) */}
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                onEdit()
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-[var(--radius-obs-md)] text-[12.5px] font-semibold transition-colors"
              style={{
                color: 'var(--color-obs-text-muted)',
                background: 'rgba(255,255,255,0.04)',
                boxShadow: 'inset 0 0 0 1px var(--color-obs-border)',
              }}
              onMouseOver={(e) => {
                ;(e.currentTarget as HTMLButtonElement).style.color = 'var(--color-obs-text)'
                ;(e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.07)'
              }}
              onMouseOut={(e) => {
                ;(e.currentTarget as HTMLButtonElement).style.color = 'var(--color-obs-text-muted)'
                ;(e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.04)'
              }}
            >
              <Pencil size={13} strokeWidth={2.2} />
              編集
            </button>

            {/* 環境に入る (本環境を新規タブで開く) */}
            {canOpenTenant ? (
              <a
                href={tenantUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-[var(--radius-obs-md)] text-[12.5px] font-semibold transition-transform"
                style={{
                  background: hover
                    ? 'linear-gradient(135deg, #c7d8ff 0%, #8db4ff 100%)'
                    : 'linear-gradient(135deg, var(--color-obs-primary) 0%, var(--color-obs-primary-container) 100%)',
                  color: 'var(--color-obs-on-primary)',
                  boxShadow: hover
                    ? '0 10px 22px -8px rgba(171,199,255,0.55), inset 1px 1px 0 rgba(255,255,255,0.25)'
                    : '0 4px 14px -4px rgba(171,199,255,0.40), inset 1px 1px 0 rgba(255,255,255,0.18)',
                  transform: hover ? 'translateY(-1px)' : 'translateY(0)',
                }}
              >
                環境に入る <ExternalLink size={13} strokeWidth={2.4} />
              </a>
            ) : (
              <span
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-[var(--radius-obs-md)] text-[12.5px] font-semibold"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  color: 'var(--color-obs-text-muted)',
                  boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.08)',
                }}
              >
                停止中
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Status chip ─────────────────────────────────────────────────────────────

type ContractStatus = TenantStatus

const STATUS_META: Record<TenantStatus, { label: string; color: string; bg: string }> = {
  active: { label: '本番', color: '#5CDEA6', bg: 'rgba(75,200,140,0.12)' },
  inactive: { label: 'Inactive', color: '#9b99a0', bg: 'rgba(255,255,255,0.05)' },
}

function StatusChip({ status }: { status: TenantStatus }) {
  const meta = STATUS_META[status]
  const isInactive = status === 'inactive'
  return (
    <span
      className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.08em] px-2 py-[3px] rounded-full shrink-0"
      style={{
        background: meta.bg,
        color: meta.color,
        boxShadow: `inset 0 0 0 1px ${isInactive ? 'rgba(255,255,255,0.08)' : `${meta.color}52`}`,
      }}
    >
      <span
        className="inline-block w-1.5 h-1.5 rounded-full"
        style={{
          backgroundColor: meta.color,
          boxShadow: isInactive ? 'none' : `0 0 6px ${meta.color}`,
        }}
      />
      {meta.label}
    </span>
  )
}

function formatDate(iso: string): string {
  try {
    const d = new Date(iso)
    return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`
  } catch {
    return iso
  }
}

// ─── Tenant edit modal (中央モーダル・画面遷移なし) ─────────────────────────

type TenantDraft = {
  name: string
  slug: string
  status: ContractStatus
  memo: string
  contractInfo: ContractItem[]
}

function TenantEditDrawer({
  tenant,
  onClose,
  onSaved,
  onDeleted,
}: {
  tenant: TenantRow | null
  onClose: () => void
  onSaved: (saved: TenantRow) => void
  onDeleted: (id: string) => void
}) {
  const isNew = tenant?.id === ''
  const isDefaultTenant = tenant?.slug === 'default'
  const statusOptions = [{ value: 'active', label: '本番' }]
  const [draft, setDraft] = useState<TenantDraft>({
    name: '',
    slug: '',
    status: 'active',
    memo: '',
    contractInfo: [],
  })
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleteArmed, setDeleteArmed] = useState(false)
  const [copiedKey, setCopiedKey] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const isPaidStatus = draft.status === 'active'
  const paidJoinUrl = draft.slug && isPaidStatus ? getPaidJoinUrl(draft.slug) : ''

  // 開く度に draft を tenant の値で初期化
  useEffect(() => {
    if (tenant) {
      // 本番 (active) かつ契約情報が空の場合は、入力欄を1行デフォルト表示する
      const initialContract = tenant.contractInfo ?? []
      const seededContract =
        tenant.status === 'active' && initialContract.length === 0
          ? [{ label: '有料', value: '' }]
          : initialContract
      setDraft({
        name: tenant.name,
        slug: tenant.slug,
        status: tenant.status,
        memo: tenant.memo ?? '',
        contractInfo: seededContract,
      })
      setCopiedKey(null)
      setDeleteArmed(false)
      setError(null)
    }
  }, [tenant])

  // 状態を「本番」に切り替えた瞬間にも、契約情報が空なら1行デフォルト表示する
  useEffect(() => {
    if (draft.status === 'active' && draft.contractInfo.length === 0) {
      setDraft((d) => ({ ...d, contractInfo: [{ label: '有料', value: '' }] }))
    }
  }, [draft.status, draft.contractInfo.length])

  // Esc で閉じる
  useEffect(() => {
    if (!tenant) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [tenant, onClose])

  // 契約情報の自由項目を編集 (追加 / 更新 / 削除)
  const addContractItem = () => {
    setDraft((d) => ({ ...d, contractInfo: [...d.contractInfo, { label: '', value: '' }] }))
  }
  const updateContractItem = (index: number, patch: Partial<ContractItem>) => {
    setDraft((d) => ({
      ...d,
      contractInfo: d.contractInfo.map((item, i) => (i === index ? { ...item, ...patch } : item)),
    }))
  }
  const removeContractItem = (index: number) => {
    setDraft((d) => ({ ...d, contractInfo: d.contractInfo.filter((_, i) => i !== index) }))
  }

  const handleSave = async () => {
    if (!tenant) return
    if (isNew && (!draft.name.trim() || !draft.slug.trim())) return
    setSaving(true)
    setError(null)
    try {
      // 空行 (項目名・内容の両方が空) は除外して送信
      const cleanedContract = draft.contractInfo
        .map((item) => ({ label: item.label.trim(), value: item.value.trim() }))
        .filter((item) => item.label !== '' || item.value !== '')
      const payload = {
        id: tenant.id || undefined,
        name: draft.name.trim(),
        slug: draft.slug.trim(),
        status: draft.status,
        contractInfo: cleanedContract,
        memo: draft.memo.trim(),
      }
      const res = await fetch('/api/admin/tenants', {
        method: isNew ? 'POST' : 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) {
        const message =
          json.error === 'slug_already_exists'
            ? 'このslugはすでに使われています。'
            : json.error === 'default_tenant_is_readonly'
              ? 'Defaultテナントはマスター環境のため編集できません。'
              : '保存に失敗しました。'
        throw new Error(message)
      }
      const saved: TenantRow = {
        ...tenant,
        id: tenant.id || String(json.id ?? ''),
        name: payload.name,
        slug: payload.slug,
        status: payload.status,
        demoExpiresAt: (json.demoExpiresAt as string | null | undefined) ?? null,
        createdAt: tenant.id ? tenant.createdAt : new Date().toISOString(),
        contractInfo: (json.contractInfo as ContractItem[] | undefined) ?? cleanedContract,
        memo: (json.memo as string | undefined) ?? payload.memo,
      }
      onSaved(saved)
    } catch (err) {
      setError(err instanceof Error ? err.message : '保存に失敗しました。')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!tenant || isNew || isDefaultTenant) return
    if (!deleteArmed) {
      setDeleteArmed(true)
      setError('削除する場合は、もう一度「削除を確定」を押してください。')
      return
    }
    setDeleting(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/tenants?id=${encodeURIComponent(tenant.id)}`, {
        method: 'DELETE',
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) {
        const message =
          json.error === 'default_tenant_is_readonly'
            ? 'Defaultテナントはマスター環境のため削除できません。'
            : '削除に失敗しました。'
        throw new Error(message)
      }
      onDeleted(tenant.id)
    } catch (err) {
      setError(err instanceof Error ? err.message : '削除に失敗しました。')
    } finally {
      setDeleting(false)
    }
  }

  const handleCopy = async (url: string, key: string) => {
    if (!url) return
    try {
      await navigator.clipboard.writeText(url)
      setCopiedKey(key)
      setTimeout(() => setCopiedKey(null), 2000)
    } catch {
      // クリップボード書き込み失敗時のフォールバック
      const ta = document.createElement('textarea')
      ta.value = url
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
      setCopiedKey(key)
      setTimeout(() => setCopiedKey(null), 2000)
    }
  }

  return (
    <AnimatePresence>
      {tenant && (
        <motion.div
          key="modal-root"
          className="fixed inset-0 z-[60] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          {/* オーバーレイ */}
          <div
            className="absolute inset-0"
            onClick={onClose}
            style={{
              backgroundColor: 'rgba(0,0,0,0.55)',
              backdropFilter: 'blur(4px)',
              WebkitBackdropFilter: 'blur(4px)',
            }}
          />

          {/* モーダル本体 */}
          <motion.div
            className="relative w-full max-w-[560px] flex flex-col rounded-[20px] overflow-hidden"
            initial={{ scale: 0.96, y: 8, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.97, y: 4, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            style={{
              background:
                'linear-gradient(180deg, rgba(18,18,22,0.98) 0%, rgba(12,12,16,0.99) 100%)',
              boxShadow:
                '0 32px 80px -20px rgba(0,0,0,0.65), 0 0 0 1px rgba(171,199,255,0.12), inset 1px 1px 0 rgba(255,255,255,0.04)',
              maxHeight: 'calc(100vh - 32px)',
            }}
          >
            {/* ヘッダー */}
            <div
              className="flex items-center justify-between px-6 py-4 relative overflow-hidden shrink-0"
              style={{
                boxShadow: 'inset 0 -1px 0 rgba(255,255,255,0.05)',
              }}
            >
              <div
                className="absolute -top-20 -right-12 w-56 h-56 rounded-full pointer-events-none"
                style={{
                  background: 'radial-gradient(circle, rgba(171,199,255,0.14), transparent 60%)',
                  filter: 'blur(40px)',
                }}
              />

              <div className="flex items-center gap-3 relative">
                <div
                  className="w-10 h-10 rounded-[12px] flex items-center justify-center"
                  style={{
                    background:
                      'linear-gradient(135deg, rgba(171,199,255,0.30) 0%, rgba(0,113,227,0.18) 100%)',
                    boxShadow:
                      'inset 0 0 0 1px rgba(171,199,255,0.40), inset 1px 1px 0 rgba(255,255,255,0.10)',
                  }}
                >
                  {isNew ? (
                    <Plus size={17} style={{ color: 'var(--color-obs-primary)' }} />
                  ) : (
                    <Building2 size={17} style={{ color: 'var(--color-obs-primary)' }} />
                  )}
                </div>
                <div>
                  <div
                    className="text-[10.5px] font-semibold uppercase tracking-[0.12em]"
                    style={{ color: 'var(--color-obs-text-subtle)' }}
                  >
                    {isNew ? 'テナント新規作成' : 'テナント編集'}
                  </div>
                  <div
                    className="font-[family-name:var(--font-display)] text-[15px] font-semibold tracking-[-0.015em]"
                    style={{ color: 'var(--color-obs-text)' }}
                  >
                    {isNew ? draft.name || '新規テナント' : tenant.name}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                aria-label="閉じる"
                className="w-8 h-8 rounded-[10px] flex items-center justify-center transition-colors relative"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  color: 'var(--color-obs-text-muted)',
                  boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.06)',
                }}
                onMouseOver={(e) => {
                  ;(e.currentTarget as HTMLButtonElement).style.background =
                    'rgba(255,255,255,0.08)'
                  ;(e.currentTarget as HTMLButtonElement).style.color = 'var(--color-obs-text)'
                }}
                onMouseOut={(e) => {
                  ;(e.currentTarget as HTMLButtonElement).style.background =
                    'rgba(255,255,255,0.04)'
                  ;(e.currentTarget as HTMLButtonElement).style.color =
                    'var(--color-obs-text-muted)'
                }}
              >
                <X size={15} strokeWidth={2.2} />
              </button>
            </div>

            {/* 本体 */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Field label="テナント名">
                  <TextInput value={draft.name} onChange={(v) => setDraft({ ...draft, name: v })} />
                </Field>

                <Field label="slug" hint={isNew ? 'URL に使われます (例: acme-corp)' : '変更不可'}>
                {isNew ? (
                  <TextInput
                    value={draft.slug}
                    onChange={(v) =>
                      setDraft({
                        ...draft,
                        slug: v
                          .toLowerCase()
                          .replace(/[^a-z0-9-]/g, '-')
                          .replace(/-+/g, '-')
                          .slice(0, 40),
                      })
                    }
                  />
                ) : (
                  <div
                    className="px-3.5 py-2.5 rounded-[var(--radius-obs-md)] text-[13px] font-mono"
                    style={{
                      background: 'rgba(255,255,255,0.03)',
                      color: 'var(--color-obs-text-subtle)',
                      boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.05)',
                    }}
                  >
                    {tenant.slug}
                  </div>
                )}
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-4 items-start">
                <Field label="状態" hint={isNew ? '作成時のみ選択可' : '登録後は変更不可'}>
                  {isNew ? (
                    <SegmentSelect
                      options={statusOptions}
                      value={draft.status}
                      onChange={(v) => setDraft({ ...draft, status: v as ContractStatus })}
                    />
                  ) : (
                    // 既存テナントは状態を変更できない（読み取り専用表示）
                    <div className="flex items-center gap-2 h-9">
                      <StatusChip status={draft.status} />
                    </div>
                  )}
                </Field>

                <Field label="メモ" hint="社内メモ">
                  <textarea
                    value={draft.memo}
                    onChange={(e) => setDraft({ ...draft, memo: e.target.value })}
                    rows={2}
                    placeholder="このテナントに関するメモ..."
                    className="w-full px-3.5 py-2.5 rounded-[var(--radius-obs-md)] text-[13px] bg-transparent border-0 outline-none resize-none"
                    style={{
                      color: 'var(--color-obs-text)',
                      background: 'rgba(255,255,255,0.03)',
                      boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.06)',
                    }}
                  />
                </Field>
              </div>

              {/* 契約情報 (企業ごとに自由な項目を追加できる) */}
              <ContractEditor
                items={draft.contractInfo}
                onAdd={addContractItem}
                onUpdate={updateContractItem}
                onRemove={removeContractItem}
              />

              {error && (
                <div
                  className="text-[12px] px-3 py-2 rounded-[8px]"
                  style={{
                    color: '#ff8d8d',
                    background: 'rgba(255,107,107,0.08)',
                    boxShadow: 'inset 0 0 0 1px rgba(255,107,107,0.24)',
                  }}
                >
                  {error}
                </div>
              )}

              {/* テナント情報 + 主担当 (read-only / 新規時は非表示) — 左右2カラムで縦を圧縮 */}
              {!isNew && (
                <div className="grid grid-cols-2 gap-4 items-start">
                  {/* テナント情報 */}
                  <div className="space-y-2">
                    <div
                      className="text-[10.5px] font-semibold uppercase tracking-[0.12em]"
                      style={{ color: 'var(--color-obs-text-subtle)' }}
                    >
                      テナント情報
                    </div>
                    <div
                      className="rounded-[var(--radius-obs-md)] px-4 py-3 space-y-2"
                      style={{
                        background: 'rgba(255,255,255,0.02)',
                        boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.05)',
                      }}
                    >
                      <MetaRow label="登録メンバー数" value={`${tenant.userCount} 名`} />
                      <MetaRow label="状態" value={STATUS_META[tenant.status].label} />
                      <MetaRow
                        label="最終活動日"
                        value={tenant.lastActivityAt ? formatDate(tenant.lastActivityAt) : '—'}
                      />
                      <MetaRow label="作成日" value={formatDate(tenant.createdAt)} />
                    </div>
                  </div>

                  {/* 主担当 */}
                  <div className="space-y-2">
                    <div className="flex items-baseline justify-between">
                      <div
                        className="text-[10.5px] font-semibold uppercase tracking-[0.12em]"
                        style={{ color: 'var(--color-obs-text-subtle)' }}
                      >
                        登録情報
                      </div>
                      <span
                        className="text-[10px]"
                        style={{ color: 'var(--color-obs-text-muted)' }}
                      >
                        登録済みユーザー
                      </span>
                    </div>
                    {tenant.primaryContact ? (
                      <div
                        className="rounded-[var(--radius-obs-md)] px-4 py-3 space-y-2"
                        style={{
                          background: 'rgba(255,255,255,0.02)',
                          boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.05)',
                        }}
                      >
                        <MetaRow label="会社名" value={tenant.name} />
                        <MetaRow
                          label="氏名"
                          value={isDefaultTenant ? 'デフォルト' : tenant.primaryContact.name}
                        />
                        <MetaRow label="メール" value={tenant.primaryContact.email} />
                      </div>
                    ) : (
                      <div
                        className="rounded-[var(--radius-obs-md)] px-4 py-4 text-[12px] text-center leading-relaxed"
                        style={{
                          background: 'rgba(255,255,255,0.02)',
                          color: 'var(--color-obs-text-muted)',
                          boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.05)',
                        }}
                      >
                        まだ登録されていません。
                      </div>
                    )}
                  </div>
                </div>
              )}

              {isPaidStatus && (
                <div>
                  <LinkCopyBox
                    title="ログイン共有リンク"
                    caption="Google登録用"
                    url={paidJoinUrl}
                    copied={copiedKey === 'paid'}
                    onCopy={() => handleCopy(paidJoinUrl, 'paid')}
                  />
                  <p
                    className="text-[11px] mt-2 leading-relaxed"
                    style={{ color: 'var(--color-obs-text-muted)' }}
                  >
                    ログイン共有リンクです。相手はGoogle登録から本番環境へ入ります。
                  </p>
                </div>
              )}
            </div>

            {/* フッター */}
            <div
              className="flex items-center justify-between gap-2 px-6 py-4 shrink-0"
              style={{ boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)' }}
            >
              <div>
                {!isNew && !isDefaultTenant && (
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={deleting || saving}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-[var(--radius-obs-md)] text-[12.5px] font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      background: 'rgba(255,107,107,0.08)',
                      color: '#ff8d8d',
                      boxShadow: 'inset 0 0 0 1px rgba(255,107,107,0.24)',
                    }}
                  >
                    <Trash2 size={13} strokeWidth={2.4} />
                    {deleting ? '削除中...' : deleteArmed ? '削除を確定' : '削除'}
                  </button>
                )}
              </div>
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-[var(--radius-obs-md)] text-[12.5px] font-semibold transition-colors"
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    color: 'var(--color-obs-text-muted)',
                    boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.06)',
                  }}
                >
                  キャンセル
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={
                    saving || deleting || (isNew && (!draft.name.trim() || !draft.slug.trim()))
                  }
                  className="px-5 py-2.5 rounded-[var(--radius-obs-md)] text-[12.5px] font-semibold transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    background:
                      'linear-gradient(135deg, var(--color-obs-primary) 0%, var(--color-obs-primary-container) 100%)',
                    color: 'var(--color-obs-on-primary)',
                    boxShadow:
                      '0 6px 16px -4px rgba(171,199,255,0.40), inset 1px 1px 0 rgba(255,255,255,0.20)',
                  }}
                >
                  {saving
                    ? isNew
                      ? '作成中...'
                      : '保存中...'
                    : isNew
                      ? 'テナントを作成'
                      : '保存する'}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ─── Drawer 内部 helpers ─────────────────────────────────────────────────────

function LinkCopyBox({
  title,
  caption,
  url,
  copied,
  onCopy,
}: {
  title: string
  caption: string
  url: string
  copied: boolean
  onCopy: () => void
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between mb-1.5">
        <label
          className="text-[10.5px] font-semibold uppercase tracking-[0.12em] inline-flex items-center gap-1.5"
          style={{ color: 'var(--color-obs-text-subtle)' }}
        >
          <Link2 size={11} />
          {title}
        </label>
        <span className="text-[10px]" style={{ color: 'var(--color-obs-text-muted)' }}>
          {caption}
        </span>
      </div>

      <div
        className="rounded-[var(--radius-obs-md)] p-[1px] relative"
        style={{
          background:
            'linear-gradient(135deg, rgba(171,199,255,0.35) 0%, rgba(0,113,227,0.18) 50%, rgba(171,199,255,0.06) 100%)',
        }}
      >
        <div
          className="rounded-[calc(var(--radius-obs-md)-1px)] p-3 flex items-center gap-2.5"
          style={{
            background:
              'linear-gradient(180deg, rgba(18,18,22,0.96) 0%, rgba(14,14,18,0.98) 100%)',
          }}
        >
          <div
            className="flex-1 min-w-0 text-[12px] font-mono truncate"
            style={{ color: 'var(--color-obs-text)' }}
            title={url}
          >
            {url || 'slug を入力するとリンクが生成されます'}
          </div>
          <button
            type="button"
            onClick={onCopy}
            disabled={!url}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-[var(--radius-obs-md)] text-[12px] font-semibold shrink-0 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: copied
                ? 'linear-gradient(135deg, rgba(75,200,140,0.30) 0%, rgba(75,200,140,0.12) 100%)'
                : 'linear-gradient(135deg, var(--color-obs-primary) 0%, var(--color-obs-primary-container) 100%)',
              color: copied ? '#5CDEA6' : 'var(--color-obs-on-primary)',
              boxShadow: copied
                ? 'inset 0 0 0 1px rgba(75,200,140,0.40)'
                : '0 4px 12px -4px rgba(171,199,255,0.42), inset 1px 1px 0 rgba(255,255,255,0.18)',
            }}
          >
            {copied ? (
              <>
                <Check size={12} strokeWidth={2.6} />
                コピー済み
              </>
            ) : (
              <>
                <Copy size={12} strokeWidth={2.4} />
                コピー
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

function Field({
  label,
  hint,
  children,
}: {
  label: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between mb-1.5">
        <label
          className="text-[10.5px] font-semibold uppercase tracking-[0.12em]"
          style={{ color: 'var(--color-obs-text-subtle)' }}
        >
          {label}
        </label>
        {hint && (
          <span className="text-[10px]" style={{ color: 'var(--color-obs-text-muted)' }}>
            {hint}
          </span>
        )}
      </div>
      {children}
    </div>
  )
}

function TextInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [focused, setFocused] = useState(false)
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      className="w-full px-3.5 py-2.5 rounded-[var(--radius-obs-md)] text-[13px] bg-transparent border-0 outline-none transition-all"
      style={{
        color: 'var(--color-obs-text)',
        background: 'rgba(255,255,255,0.03)',
        boxShadow: focused
          ? 'inset 0 0 0 1px rgba(171,199,255,0.40), 0 0 0 3px rgba(171,199,255,0.10)'
          : 'inset 0 0 0 1px rgba(255,255,255,0.06)',
      }}
    />
  )
}

function SegmentSelect({
  options,
  value,
  onChange,
}: {
  options: { value: string; label: string }[]
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div
      className="inline-flex p-1 rounded-[var(--radius-obs-md)] gap-0.5"
      style={{ backgroundColor: 'rgba(255,255,255,0.04)' }}
    >
      {options.map((o) => {
        const active = value === o.value
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            className="px-3 h-8 rounded-[calc(var(--radius-obs-md)-2px)] text-[12px] font-semibold uppercase tracking-[0.06em] transition-colors"
            style={{
              background: active
                ? 'linear-gradient(135deg, var(--color-obs-primary) 0%, var(--color-obs-primary-container) 100%)'
                : 'transparent',
              color: active ? 'var(--color-obs-on-primary)' : 'var(--color-obs-text-muted)',
              boxShadow: active
                ? 'inset 1px 1px 0 rgba(255,255,255,0.18), 0 4px 10px -4px rgba(171,199,255,0.30)'
                : 'none',
            }}
          >
            {o.label}
          </button>
        )
      })}
    </div>
  )
}

// ─── Contract editor (企業ごとに自由な項目を追加できる契約欄) ────────────────

function ContractEditor({
  items,
  onAdd,
  onUpdate,
  onRemove,
}: {
  items: ContractItem[]
  onAdd: () => void
  onUpdate: (index: number, patch: Partial<ContractItem>) => void
  onRemove: (index: number) => void
}) {
  const inputClass =
    'w-full px-3 py-2 rounded-[var(--radius-obs-sm)] text-[13px] bg-transparent border-0 outline-none'
  const inputStyle = {
    color: 'var(--color-obs-text)',
    background: 'rgba(255,255,255,0.03)',
    boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.06)',
  } as const

  return (
    <div>
      <div className="flex items-baseline justify-between mb-1.5">
        <label
          className="text-[10.5px] font-semibold uppercase tracking-[0.12em]"
          style={{ color: 'var(--color-obs-text-subtle)' }}
        >
          契約情報
        </label>
        <span className="text-[10px]" style={{ color: 'var(--color-obs-text-muted)' }}>
          企業ごとに項目を自由に追加
        </span>
      </div>

      <div className="space-y-2">
        {items.length === 0 && (
          <p className="text-[12px]" style={{ color: 'var(--color-obs-text-muted)' }}>
            まだ項目がありません。「項目を追加」から契約内容を入力できます。
          </p>
        )}

        {items.map((item, index) => (
          <div key={index} className="grid grid-cols-[180px_1fr_auto] gap-2 items-center">
            <ContractLabelSegment
              value={item.label}
              onChange={(v) => onUpdate(index, { label: v })}
            />
            <input
              type="text"
              value={item.value}
              onChange={(e) => onUpdate(index, { value: e.target.value })}
              placeholder="内容 (例: ENTERPRISE / 月10万円)"
              className={inputClass}
              style={inputStyle}
            />
            <button
              type="button"
              onClick={() => onRemove(index)}
              aria-label="この項目を削除"
              className="w-8 h-8 rounded-[var(--radius-obs-sm)] flex items-center justify-center shrink-0 transition-colors"
              style={{
                color: 'var(--color-obs-text-muted)',
                background: 'rgba(255,255,255,0.03)',
                boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.06)',
              }}
            >
              <Trash2 size={13} strokeWidth={2.2} />
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={onAdd}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-[var(--radius-obs-md)] text-[12px] font-semibold transition-colors"
          style={{
            color: 'var(--color-obs-primary)',
            background: 'rgba(171,199,255,0.08)',
            boxShadow: 'inset 0 0 0 1px rgba(171,199,255,0.22)',
          }}
        >
          <Plus size={13} strokeWidth={2.6} />
          項目を追加
        </button>
      </div>
    </div>
  )
}

function MetaRow({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return (
    <div className="flex items-center justify-between text-[12px] gap-3">
      <span className="shrink-0" style={{ color: 'var(--color-obs-text-subtle)' }}>
        {label}
      </span>
      <span
        className="tabular-nums font-medium truncate text-right"
        style={{ color: muted ? 'var(--color-obs-text-muted)' : 'var(--color-obs-text)' }}
      >
        {value}
      </span>
    </div>
  )
}

// ─── 契約情報の「項目名」: 有料 / 無料 を選択するセグメント ─────────────────

function ContractLabelSegment({
  value,
  onChange,
}: {
  value: string
  onChange: (v: string) => void
}) {
  const options = [
    { value: '有料', accent: '#FFC107', activeBg: 'rgba(255,193,7,0.18)', activeRing: 'rgba(255,193,7,0.40)' },
    { value: '無料', accent: '#5CDEA6', activeBg: 'rgba(92,222,166,0.18)', activeRing: 'rgba(92,222,166,0.40)' },
  ] as const
  return (
    <div
      className="inline-flex p-[3px] rounded-[var(--radius-obs-md)] gap-[2px] w-fit"
      style={{
        background: 'rgba(255,255,255,0.04)',
        boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.06)',
      }}
    >
      {options.map((o) => {
        const active = value === o.value
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            className="px-3 h-8 rounded-[calc(var(--radius-obs-md)-3px)] text-[12px] font-semibold transition-colors"
            style={{
              background: active ? o.activeBg : 'transparent',
              color: active ? o.accent : 'var(--color-obs-text-muted)',
              boxShadow: active ? `inset 0 0 0 1px ${o.activeRing}` : 'none',
            }}
          >
            {o.value}
          </button>
        )
      })}
    </div>
  )
}
