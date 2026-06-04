'use client'

import { Suspense, type FormEvent, useEffect, useState } from 'react'
import Image from 'next/image'
import { useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CreditCard,
  Zap,
  Plus,
  Minus,
  Check,
  Crown,
  X,
  ChevronRight,
  Users,
  Mail,
  Calendar,
  Shield,
  UserPlus,
  Trash2,
  Star,
  Plug,
  Link2,
  Loader2,
  KeyRound,
  Hash,
} from 'lucide-react'
import { ObsButton, ObsCard, ObsHero, ObsPageShell, ObsSectionHeader } from '@/components/obsidian'

// ─── プラン定義 ─────────────────────────────────────────

interface Plan {
  id: string
  name: string
  tagline: string
  priceMonthly: number
  priceAnnual: number
  credits: number
  minSeats: number
  maxSeats?: number // 上限シート数(Freeプラン用)
  baseLabel?: string // 下位プラン全機能ラベル (例: "Standard全機能")
  additions: string[] // このプランで追加される機能
  seatNote?: string // 「○シートから購入可能」直下に表示する補足
  icon: React.ElementType
  popular?: boolean
  // 実行支援モデル用フィールド
  isTenantPrice?: boolean // true: 価格はテナント単位 (/月) / false or undef: /seat /月
  slotsTotal?: number // 総受付枠数 (例: 5社限定)
  slotsRemaining?: number // 残り枠数
  contractTerm?: string // 例: "3ヶ月契約・3ヶ月ごとに更新"
}

// セルフサーブ CRM 単独プラン。
// HP の Pricing セクション (components/landing/sections/Pricing.tsx) と完全同期。
// 変更時は両方を必ず揃える。
const PLANS: Plan[] = [
  {
    id: 'standard',
    name: 'Standard',
    tagline: 'まず実運用を始めるための標準プラン',
    priceMonthly: 41000,
    priceAnnual: 29000,
    credits: 10000,
    minSeats: 1,
    additions: [
      '月10,000クレジット込み (チーム合計)',
      'Gmail / Google Meet / Notion 議事録連携',
      '企業・コンタクト・取引・チケット管理',
      'Slack チャットサポート',
    ],
    icon: Star,
    popular: true,
  },
  {
    id: 'pro',
    name: 'Plus',
    tagline: 'AI利用量が多いチーム向けの上位プラン',
    priceMonthly: 78000,
    priceAnnual: 55000,
    credits: 30000,
    minSeats: 1,
    baseLabel: 'Standard全機能',
    additions: [
      '月30,000クレジット込み (チーム合計)',
      '高頻度なAIリサーチ・議事録活用',
      'Slack チャットサポート',
    ],
    icon: Zap,
  },
]

// ─── メンバー定義 ─────────────────────────────────────────

// super_admin: テナント開設者(オーナー)。プラン・クレジット・機能リクエスト等のお金回り + データ削除 + 連携設定を管理
// admin: お金回り以外の編集権限(メンバー管理等)
// member: 通常権限(閲覧と利用)
type MemberRole = 'super_admin' | 'admin' | 'member'
type GoogleServiceKey = 'gmail' | 'calendar' | 'meet'

interface Member {
  id: string
  name: string
  email: string
  role: MemberRole
  initial: string
}

interface IntegrationServiceState {
  available: boolean
  enabled: boolean
  lastSyncAt: string | null
}

interface GoogleIntegrationStatus {
  connected: boolean
  configured?: boolean
  email?: string
  services?: Partial<Record<GoogleServiceKey | 'drive' | 'chat', IntegrationServiceState>>
}

interface NotionIntegrationStatus {
  connected: boolean
  configured: boolean
  workspaceName: string | null
  enabled: boolean
  lastSyncAt: string | null
}

const MONTHLY_TEAM_CREDIT_LIMIT = 10000
const INTEGRATION_ACTION_CLASS =
  'inline-flex h-9 min-w-[154px] items-center justify-center gap-1.5 whitespace-nowrap rounded-[var(--radius-obs-md)] px-3 text-[12px] font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60'
const INTEGRATION_ACTION_STYLE = {
  background:
    'linear-gradient(135deg, var(--color-obs-primary) 0%, var(--color-obs-primary-container) 100%)',
  color: 'var(--color-obs-on-primary)',
}

function toMemberRole(role: string): MemberRole {
  if (role === 'ADMIN') return 'super_admin'
  if (role === 'MANAGER') return 'admin'
  return 'member'
}

function initialForMember(name: string, email: string) {
  return (name || email || '?').trim().charAt(0) || '?'
}

export default function SubscriptionPage() {
  return (
    <Suspense fallback={null}>
      <SubscriptionPageContent />
    </Suspense>
  )
}

function IntegrationServiceCard({
  icon,
  title,
  status,
  description,
  connectHref,
  connectLabel,
  syncLabel,
  busy,
  onSync,
}: {
  icon: React.ReactNode
  title: string
  status?: IntegrationServiceState
  description: string
  connectHref: string
  connectLabel: string
  syncLabel: string
  busy: boolean
  onSync: () => void
}) {
  const connected = !!status?.available
  return (
    <ObsCard depth="high" padding="lg" radius="xl" className="h-full">
      <div className="flex h-full items-start gap-3">
          {icon}
        <div className="min-w-0 flex-1 self-stretch flex flex-col">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-[15px] font-semibold" style={{ color: 'var(--color-obs-text)' }}>
              {title}
            </h3>
            <IntegrationStatusPill connected={connected} />
          </div>
          <p className="text-[12.5px] mt-1.5 leading-relaxed" style={{ color: 'var(--color-obs-text-muted)' }}>
            {description}
          </p>
          {connected && (
            <p className="text-[11.5px] mt-2" style={{ color: 'var(--color-obs-text-subtle)' }}>
              最終同期: {status?.lastSyncAt ? new Date(status.lastSyncAt).toLocaleString('ja-JP') : '未同期'}
            </p>
          )}
          <div className="mt-auto pt-4 flex flex-wrap gap-2">
            {!connected ? (
              <a
                href={connectHref}
                className={INTEGRATION_ACTION_CLASS}
                style={INTEGRATION_ACTION_STYLE}
              >
                <Link2 size={12} />
                {connectLabel}
              </a>
            ) : (
              <button
                type="button"
                className={INTEGRATION_ACTION_CLASS}
                style={INTEGRATION_ACTION_STYLE}
                onClick={onSync}
                disabled={busy}
              >
                {busy ? (
                  <span className="inline-flex items-center gap-1.5">
                    <Loader2 size={13} className="animate-spin" />
                    同期中
                  </span>
                ) : (
                  syncLabel
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </ObsCard>
  )
}

function OfficialIntegrationIcon({ src, alt }: { src: string; alt: string }) {
  return (
    <div
      className="shrink-0 w-11 h-11 rounded-[var(--radius-obs-md)] flex items-center justify-center"
      style={{
        backgroundColor: '#fff',
        boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.08)',
      }}
    >
      <Image src={src} alt={alt} width={26} height={26} className="h-[26px] w-[26px] object-contain" />
    </div>
  )
}

function NotionIntegrationCard({
  status,
  busy,
  showTokenForm,
  token,
  message,
  onToggleForm,
  onTokenChange,
  onTokenSubmit,
  onSync,
  onCancel,
}: {
  status: NotionIntegrationStatus | null
  busy: boolean
  showTokenForm: boolean
  token: string
  message: string | null
  onToggleForm: () => void
  onTokenChange: (value: string) => void
  onTokenSubmit: (event: FormEvent<HTMLFormElement>) => void
  onSync: () => void
  onCancel: () => void
}) {
  const connected = !!status?.connected
  return (
    <ObsCard depth="high" padding="lg" radius="xl" className="h-full">
      <div className="flex h-full items-start gap-3">
        <div
          className="shrink-0 w-11 h-11 rounded-[var(--radius-obs-md)] flex items-center justify-center"
          style={{ backgroundColor: '#fff', color: '#111' }}
        >
          <Hash size={20} strokeWidth={2.6} />
        </div>
        <div className="min-w-0 flex-1 self-stretch flex flex-col">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-[15px] font-semibold" style={{ color: 'var(--color-obs-text)' }}>
              Notion 議事録
            </h3>
            <IntegrationStatusPill connected={connected} />
          </div>
          <p className="text-[12.5px] mt-1.5 leading-relaxed" style={{ color: 'var(--color-obs-text-muted)' }}>
            Notionで共有された議事録ページを読み取り、取引・企業・コンタクトに紐付けます。
          </p>
          {connected && (
            <p className="text-[11.5px] mt-2" style={{ color: 'var(--color-obs-text-subtle)' }}>
              {status?.workspaceName ? `${status.workspaceName} / ` : ''}
              最終同期: {status?.lastSyncAt ? new Date(status.lastSyncAt).toLocaleString('ja-JP') : '未同期'}
            </p>
          )}
          {message && (
            <p
              className="text-[11.5px] mt-2"
              style={{
                color: message.includes('失敗') ? 'var(--color-obs-hot)' : 'var(--color-obs-text-subtle)',
              }}
            >
              {message}
            </p>
          )}
          <div className="mt-auto pt-4 flex flex-wrap gap-2">
            {!connected && (
              <button type="button" className={INTEGRATION_ACTION_CLASS} style={INTEGRATION_ACTION_STYLE} onClick={onToggleForm}>
                <KeyRound size={13} />
                APIトークンで連携
              </button>
            )}
            {connected && (
              <button
                type="button"
                className={INTEGRATION_ACTION_CLASS}
                style={INTEGRATION_ACTION_STYLE}
                onClick={onSync}
                disabled={busy}
              >
                {busy ? (
                  <span className="inline-flex items-center gap-1.5">
                    <Loader2 size={13} className="animate-spin" />
                    同期中
                  </span>
                ) : (
                  'Notion議事録を同期'
                )}
              </button>
            )}
          </div>
          {showTokenForm && !connected && (
            <form onSubmit={onTokenSubmit} className="mt-4 space-y-3">
              <input
                type="password"
                value={token}
                onChange={(e) => onTokenChange(e.target.value)}
                placeholder="secret_... または ntn_..."
                className="h-10 w-full rounded-[var(--radius-obs-md)] px-3 text-[13px] outline-none"
                style={{
                  backgroundColor: 'var(--color-obs-surface)',
                  color: 'var(--color-obs-text)',
                  boxShadow: 'inset 0 0 0 1px var(--color-obs-surface-highest)',
                }}
              />
              <div className="flex gap-2">
                <ObsButton type="submit" size="sm" variant="primary" disabled={busy || !token.trim()}>
                  {busy ? '保存中' : '保存して連携'}
                </ObsButton>
                <ObsButton type="button" size="sm" variant="ghost" onClick={onCancel} disabled={busy}>
                  キャンセル
                </ObsButton>
              </div>
            </form>
          )}
        </div>
      </div>
    </ObsCard>
  )
}

function IntegrationStatusPill({ connected }: { connected: boolean }) {
  return (
    <span
      className="text-[10px] font-semibold uppercase tracking-[0.08em] px-1.5 py-0.5 rounded-full"
      style={{
        color: connected ? '#4ad98a' : 'var(--color-obs-text-subtle)',
        backgroundColor: connected ? 'rgba(74,217,138,0.14)' : 'var(--color-obs-surface-high)',
      }}
    >
      {connected ? '連携済み' : '未連携'}
    </span>
  )
}

function SubscriptionPageContent() {
  const searchParams = useSearchParams()
  const initialTab = (() => {
    const t = searchParams?.get('tab')
    if (t === 'integrations') return 'integrations'
    return 'team'
  })()
  const [tab, setTab] = useState<'team' | 'integrations'>(initialTab)

  useEffect(() => {
    const next = searchParams?.get('tab')
    if (next === 'integrations') setTab('integrations')
    else setTab('team')
  }, [searchParams])

  useEffect(() => {
    if (tab !== 'integrations') return
    void refreshIntegrations()
  }, [tab])

  const [currentPlan, setCurrentPlan] = useState('standard')
  const [confirmDialog, setConfirmDialog] = useState<{
    title: string
    message: string
    confirmLabel: string
    variant: 'primary' | 'danger'
    onConfirm: () => void | Promise<void>
  } | null>(null)
  const [seats, setSeats] = useState(1)
  // テナント単位の1プール構成。サブスク分(月次失効)と購入分(永久有効・解約時失効)を別管理
  const [subscriptionCredit, setSubscriptionCredit] = useState({
    limitCredits: MONTHLY_TEAM_CREDIT_LIMIT,
    usedCredits: 0,
    remainingCredits: MONTHLY_TEAM_CREDIT_LIMIT,
  })
  const [purchasedRemaining, setPurchasedRemaining] = useState(0) // 購入残(永久有効)
  // 個人クレジットは「今月の自分の消費量」可視化のみ。実際の消費はテナントプールから引かれる
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual')
  const [showBuyCredits, setShowBuyCredits] = useState(false)
  const [creditCheckoutLoading, setCreditCheckoutLoading] = useState(false)
  const [showInviteMember, setShowInviteMember] = useState(false)
  const [showAddSeats, setShowAddSeats] = useState(false)
  const [pendingSeats, setPendingSeats] = useState(seats)
  const [creditsTab, setCreditsTab] = useState<'team' | 'purchased'>('team')
  const [purchaseAmount, setPurchaseAmount] = useState(1000) // 1,000単位
  const [members, setMembers] = useState<Member[]>([])
  const [openRoleMenuId, setOpenRoleMenuId] = useState<string | null>(null)
  const [inviteRole, setInviteRole] = useState<MemberRole>('member')
  const [currentUserEmail, setCurrentUserEmail] = useState('h.sawasaka@rookiesmart.jp')
  const [googleStatus, setGoogleStatus] = useState<GoogleIntegrationStatus | null>(null)
  const [notionStatus, setNotionStatus] = useState<NotionIntegrationStatus | null>(null)
  const [integrationBusy, setIntegrationBusy] = useState<'gmail' | 'meet' | 'notion' | null>(null)
  const [showNotionTokenForm, setShowNotionTokenForm] = useState(false)
  const [notionToken, setNotionToken] = useState('')
  const [notionMessage, setNotionMessage] = useState<string | null>(null)

  const refreshIntegrations = async () => {
    const [google, notion] = await Promise.all([
      fetch('/api/google/status'),
      fetch('/api/notion/status'),
    ])
    if (google.ok) setGoogleStatus(await google.json())
    if (notion.ok) setNotionStatus(await notion.json())
  }

  const syncGoogle = async (scope: 'gmail' | 'calendar' | 'meet') => {
    await fetch(`/api/google/sync?scope=${scope}`, { method: 'POST' })
  }

  const syncMeetBundle = async () => {
    setIntegrationBusy('meet')
    try {
      await syncGoogle('calendar')
      await syncGoogle('meet')
      await refreshIntegrations()
    } finally {
      setIntegrationBusy(null)
    }
  }

  const syncGmail = async () => {
    setIntegrationBusy('gmail')
    try {
      await syncGoogle('gmail')
      await refreshIntegrations()
    } finally {
      setIntegrationBusy(null)
    }
  }

  const syncNotion = async () => {
    setIntegrationBusy('notion')
    try {
      await fetch('/api/notion/sync', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ query: '議事録', maxPages: 20 }),
      })
      await refreshIntegrations()
    } finally {
      setIntegrationBusy(null)
    }
  }

  const connectNotionToken = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIntegrationBusy('notion')
    setNotionMessage(null)
    try {
      const res = await fetch('/api/notion/connect-token', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ token: notionToken }),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) {
        setNotionMessage(json.message ?? 'Notion APIトークンの保存に失敗しました。')
        return
      }
      setNotionToken('')
      setShowNotionTokenForm(false)
      setNotionMessage('Notion連携を保存しました。')
      await refreshIntegrations()
    } finally {
      setIntegrationBusy(null)
    }
  }

  const updateRole = (id: string, newRole: MemberRole) => {
    setMembers((prev) => prev.map((m) => (m.id === id ? { ...m, role: newRole } : m)))
    setOpenRoleMenuId(null)
  }

  const deleteMember = (id: string) => {
    setMembers((prev) => prev.filter((m) => m.id !== id))
  }
  // 現在のユーザー権限(本番では auth コンテキストから自動取得)
  const [currentRole] = useState<MemberRole>('super_admin')
  const isSuperAdmin = currentRole === 'super_admin'
  // isAdmin: 特権管理者 もしくは 管理者 を含む(管理操作可能な権限の総称)
  const isAdmin = currentRole === 'super_admin' || currentRole === 'admin'

  useEffect(() => {
    if (tab !== 'team') return
    let cancelled = false
    async function loadSubscription() {
      try {
        const res = await fetch('/api/stripe/subscription')
        if (!res.ok) return
        const data = (await res.json()) as {
          planId?: string
          billingCycle?: 'monthly' | 'annual'
          seats?: number
          credits?: {
            limitCredits?: number
            usedCredits?: number
            remainingCredits?: number
            subscriptionRemainingCredits?: number
            purchasedRemainingCredits?: number
          }
          userEmail?: string
          members?: Array<{
            id: string
            email: string
            name: string
            role: string
          }>
        }
        if (cancelled) return
        if (data.userEmail) setCurrentUserEmail(data.userEmail)
        if (data.planId && PLANS.some((p) => p.id === data.planId)) setCurrentPlan(data.planId)
        if (data.billingCycle) setBillingCycle(data.billingCycle)
        if (typeof data.seats === 'number') setSeats(data.seats)
        if (data.members) {
          setMembers(
            data.members.map((m) => ({
              id: m.id,
              name: m.name,
              email: m.email,
              role: toMemberRole(m.role),
              initial: initialForMember(m.name, m.email),
            })),
          )
        }
        if (data.credits) {
          setSubscriptionCredit({
            limitCredits: data.credits.limitCredits ?? MONTHLY_TEAM_CREDIT_LIMIT,
            usedCredits: data.credits.usedCredits ?? 0,
            remainingCredits:
              data.credits.subscriptionRemainingCredits ??
              data.credits.remainingCredits ??
              Math.max(0, MONTHLY_TEAM_CREDIT_LIMIT - (data.credits.usedCredits ?? 0)),
          })
          if (typeof data.credits.purchasedRemainingCredits === 'number') {
            setPurchasedRemaining(data.credits.purchasedRemainingCredits)
          }
        }
      } catch {
        // APIが失敗した場合も、本番画面ではダミーメンバーを出さない。
      }
    }
    void loadSubscription()
    return () => {
      cancelled = true
    }
  }, [tab])

  const currentPlanData = PLANS.find((p) => p.id === currentPlan)
  const subscriptionTotal = subscriptionCredit.limitCredits // 今月のサブスク付与量
  const subscriptionRemaining = subscriptionCredit.remainingCredits
  const subscriptionUsagePct =
    subscriptionTotal > 0 ? (subscriptionRemaining / subscriptionTotal) * 100 : 0

  const CREDIT_UNIT_PRICE = 5 // ¥5 per credit (¥5,000 / 1,000cr)
  const CREDIT_STEP = 1000 // 1,000-unit step

  const startCreditCheckout = async () => {
    setCreditCheckoutLoading(true)
    try {
      const res = await fetch('/api/stripe/credits/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credits: purchaseAmount }),
      })
      const data = (await res.json()) as { url?: string; error?: string }
      if (!res.ok || !data.url) {
        throw new Error(data.error ?? 'Stripe Checkoutの作成に失敗しました。')
      }
      window.location.href = data.url
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Stripe Checkoutの作成に失敗しました。'
      alert(message)
      setCreditCheckoutLoading(false)
    }
  }

  return (
    <ObsPageShell>
      <div className="w-full px-8 xl:px-12 2xl:px-16 pb-16">
        <ObsHero
          eyebrow="Subscription"
          title="設定"
          caption="クレジット・メンバー・外部サービス連携をまとめて管理"
          action={
            isSuperAdmin && tab === 'team' ? (
              <ObsButton variant="primary" size="md" onClick={() => setShowBuyCredits(true)}>
                <Plus size={14} className="inline mr-1.5" />
                クレジット追加
              </ObsButton>
            ) : null
          }
        />

        {/* ── タブナビ ── */}
        <div
          className="inline-flex items-center p-1 rounded-[var(--radius-obs-md)] mb-6 gap-1"
          style={{ backgroundColor: 'var(--color-obs-surface-high)' }}
        >
          {(
            [
              { key: 'team', label: 'チーム', icon: Users },
              { key: 'integrations', label: '連携', icon: Plug },
            ] as const
          ).map((t) => {
            const active = tab === t.key
            const Icon = t.icon
            return (
              <button
                key={t.key}
                type="button"
                onClick={() => setTab(t.key)}
                className="inline-flex items-center gap-1.5 h-9 px-4 rounded-[calc(var(--radius-obs-md)-2px)] text-[13px] font-medium transition-colors"
                style={{
                  backgroundColor: active ? 'var(--color-obs-primary-container)' : 'transparent',
                  color: active ? 'var(--color-obs-on-primary)' : 'var(--color-obs-text-muted)',
                }}
              >
                <Icon size={14} />
                {t.label}
              </button>
            )
          })}
        </div>

        {/* ── Credit usage card (管理者のみ) ── */}
        {tab === 'team' && isAdmin && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <ObsCard depth="high" padding="lg" radius="xl" className="relative overflow-hidden">
              <div
                style={{
                  position: 'absolute',
                  top: '-20%',
                  right: '-10%',
                  width: '300px',
                  height: '300px',
                  background: 'radial-gradient(circle, rgba(171,199,255,0.10) 0%, transparent 70%)',
                  pointerEvents: 'none',
                }}
              />
              <div className="flex items-start justify-between gap-6 relative mb-4">
                {/* タブ + 残高(左・メイン) */}
                <div className="flex-1">
                  {/* タブ: チーム / 個人 / 追加クレジット */}
                  <div
                    className="inline-flex p-1 rounded-[var(--radius-obs-md)] mb-3"
                    style={{ backgroundColor: 'var(--color-obs-surface-high)' }}
                  >
                    {(
                      [
                        { id: 'team', label: 'チーム' },
                        { id: 'purchased', label: '追加クレジット' },
                      ] as const
                    ).map((t) => (
                      <button
                        key={t.id}
                        onClick={() => setCreditsTab(t.id)}
                        className="px-4 py-1.5 rounded-[var(--radius-obs-sm)] text-[12px] font-medium transition-colors"
                        style={{
                          backgroundColor:
                            creditsTab === t.id
                              ? 'var(--color-obs-surface-highest)'
                              : 'transparent',
                          color:
                            creditsTab === t.id
                              ? 'var(--color-obs-text)'
                              : 'var(--color-obs-text-muted)',
                        }}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>

                  <p
                    className="text-[11px] font-medium uppercase tracking-[0.1em] mb-1.5"
                    style={{ color: 'var(--color-obs-text-subtle)' }}
                  >
                    {creditsTab === 'team'
                      ? 'チームのクレジット残高'
                      : '追加クレジット残高 (永久繰越)'}
                  </p>
                  <div className="flex items-baseline gap-2">
                    <span
                      className="font-[family-name:var(--font-display)] text-[44px] font-bold tabular-nums tracking-[-0.03em]"
                      style={{ color: 'var(--color-obs-text)' }}
                    >
                      {creditsTab === 'team'
                        ? subscriptionRemaining.toLocaleString()
                        : purchasedRemaining.toLocaleString()}
                    </span>
                    <span
                      className="text-[15px] font-medium"
                      style={{ color: 'var(--color-obs-text-muted)' }}
                    >
                      {creditsTab === 'team' ? `/ ${subscriptionTotal.toLocaleString()} cr` : 'cr'}
                    </span>
                  </div>

                  {/* タブ別の補足情報 */}
                  {creditsTab === 'purchased' && (
                    <p
                      className="text-[11.5px] mt-2"
                      style={{ color: 'var(--color-obs-text-muted)' }}
                    >
                      サブスク残が無くなった時から消費されます。有効期限なし(解約時に失効)。
                    </p>
                  )}
                  {creditsTab === 'team' && (
                    <p
                      className="text-[11.5px] mt-2"
                      style={{ color: 'var(--color-obs-text-muted)' }}
                    >
                      今月分のサブスククレジット。未使用分は翌月へ繰り越されません。
                    </p>
                  )}
                </div>

                {/* 現行プラン + シート数(右) */}
                <div className="flex items-stretch gap-3 pt-12">
                  <div
                    className="rounded-[var(--radius-obs-md)] px-4 py-2.5 flex flex-col items-start justify-center min-w-[140px]"
                    style={{ backgroundColor: 'var(--color-obs-surface-high)' }}
                  >
                    <p
                      className="text-[10px] font-medium uppercase tracking-[0.1em] mb-1"
                      style={{ color: 'var(--color-obs-text-subtle)' }}
                    >
                      現行プラン
                    </p>
                    <div className="flex items-center gap-1.5">
                      {currentPlanData && (
                        <currentPlanData.icon
                          size={15}
                          style={{ color: 'var(--color-obs-primary)' }}
                        />
                      )}
                      <span
                        className="text-[15px] font-semibold"
                        style={{ color: 'var(--color-obs-text)' }}
                      >
                        {currentPlanData?.name ?? '—'}
                      </span>
                    </div>
                  </div>

                  <div
                    className="rounded-[var(--radius-obs-md)] px-4 py-2.5 flex flex-col items-start justify-center min-w-[120px]"
                    style={{ backgroundColor: 'var(--color-obs-surface-high)' }}
                  >
                    <p
                      className="text-[10px] font-medium uppercase tracking-[0.1em] mb-1"
                      style={{ color: 'var(--color-obs-text-subtle)' }}
                    >
                      シート数
                    </p>
                    <div className="flex items-baseline gap-1">
                      <span
                        className="text-[20px] font-bold tabular-nums tracking-[-0.02em]"
                        style={{ color: 'var(--color-obs-text)' }}
                      >
                        {seats}
                      </span>
                      <span
                        className="text-[12px]"
                        style={{ color: 'var(--color-obs-text-muted)' }}
                      >
                        シート契約中
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Progress bar (サブスクタブのみ表示) */}
              {creditsTab !== 'purchased' && (
                <div className="mt-2">
                  <div
                    className="h-3 rounded-full overflow-hidden"
                    style={{ backgroundColor: 'var(--color-obs-surface-lowest)' }}
                  >
                    <motion.div
                      key={creditsTab}
                      initial={{ width: 0 }}
                      animate={{ width: `${subscriptionUsagePct}%` }}
                      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                      className="h-full rounded-full"
                      style={{
                        background:
                          'linear-gradient(90deg, var(--color-obs-primary) 0%, var(--color-obs-primary-container) 100%)',
                      }}
                    />
                  </div>
                  <div className="flex justify-between mt-2">
                    <span className="text-[11px]" style={{ color: 'var(--color-obs-text-subtle)' }}>
                      今月使用: {(subscriptionTotal - subscriptionRemaining).toLocaleString()} cr
                    </span>
                    <span className="text-[11px]" style={{ color: 'var(--color-obs-text-subtle)' }}>
                      残り: {subscriptionRemaining.toLocaleString()} cr
                    </span>
                  </div>
                </div>
              )}
            </ObsCard>
          </motion.div>
        )}

        {/* ── Credit usage card (メンバー用・読み取り専用シンプル版) ── */}
        {tab === 'team' && !isAdmin && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <ObsCard depth="high" padding="lg" radius="xl" className="relative overflow-hidden">
              <div
                style={{
                  position: 'absolute',
                  top: '-20%',
                  right: '-10%',
                  width: '300px',
                  height: '300px',
                  background: 'radial-gradient(circle, rgba(171,199,255,0.10) 0%, transparent 70%)',
                  pointerEvents: 'none',
                }}
              />
              <div className="relative">
                {/* タブ: チーム / 個人 / 追加クレジット */}
                <div
                  className="inline-flex p-1 rounded-[var(--radius-obs-md)] mb-3"
                  style={{ backgroundColor: 'var(--color-obs-surface-high)' }}
                >
                  {(
                    [
                      { id: 'team', label: 'チーム' },
                      { id: 'purchased', label: '追加クレジット' },
                    ] as const
                  ).map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setCreditsTab(t.id)}
                      className="px-4 py-1.5 rounded-[var(--radius-obs-sm)] text-[12px] font-medium transition-colors"
                      style={{
                        backgroundColor:
                          creditsTab === t.id ? 'var(--color-obs-surface-highest)' : 'transparent',
                        color:
                          creditsTab === t.id
                            ? 'var(--color-obs-text)'
                            : 'var(--color-obs-text-muted)',
                      }}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>

                <p
                  className="text-[11px] font-medium uppercase tracking-[0.1em] mb-1.5"
                  style={{ color: 'var(--color-obs-text-subtle)' }}
                >
                  {creditsTab === 'team'
                    ? 'チームのクレジット残高'
                    : '追加クレジット残高 (永久繰越)'}
                </p>
                <div className="flex items-baseline gap-2">
                  <span
                    className="font-[family-name:var(--font-display)] text-[44px] font-bold tabular-nums tracking-[-0.03em]"
                    style={{ color: 'var(--color-obs-text)' }}
                  >
                    {creditsTab === 'team'
                      ? subscriptionRemaining.toLocaleString()
                      : purchasedRemaining.toLocaleString()}
                  </span>
                  <span
                    className="text-[15px] font-medium"
                    style={{ color: 'var(--color-obs-text-muted)' }}
                  >
                    {creditsTab === 'team' ? `/ ${subscriptionTotal.toLocaleString()} cr` : 'cr'}
                  </span>
                </div>

                {/* タブ別の補足情報 */}
                {creditsTab === 'purchased' && (
                  <p
                    className="text-[11.5px] mt-2"
                    style={{ color: 'var(--color-obs-text-muted)' }}
                  >
                    サブスク残が無くなった時から消費されます。有効期限なし(解約時に失効)。
                  </p>
                )}
                {creditsTab === 'team' && (
                  <p
                    className="text-[11.5px] mt-2"
                    style={{ color: 'var(--color-obs-text-muted)' }}
                  >
                    今月分のサブスククレジット。未使用分は翌月へ繰り越されません。
                  </p>
                )}
              </div>

              {/* Progress bar (サブスクタブのみ) */}
              {creditsTab !== 'purchased' && (
                <div className="mt-5">
                  <div
                    className="h-3 rounded-full overflow-hidden"
                    style={{ backgroundColor: 'var(--color-obs-surface-lowest)' }}
                  >
                    <motion.div
                      key={creditsTab}
                      initial={{ width: 0 }}
                      animate={{ width: `${subscriptionUsagePct}%` }}
                      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                      className="h-full rounded-full"
                      style={{
                        background:
                          'linear-gradient(90deg, var(--color-obs-primary) 0%, var(--color-obs-primary-container) 100%)',
                      }}
                    />
                  </div>
                  <div className="flex justify-between mt-2">
                    <span className="text-[11px]" style={{ color: 'var(--color-obs-text-subtle)' }}>
                      今月使用: {(subscriptionTotal - subscriptionRemaining).toLocaleString()} cr
                    </span>
                    <span className="text-[11px]" style={{ color: 'var(--color-obs-text-subtle)' }}>
                      残り: {subscriptionRemaining.toLocaleString()} cr
                    </span>
                  </div>
                </div>
              )}

              <div
                className="mt-5 pt-4 border-t flex items-center gap-2"
                style={{ borderColor: 'rgba(255,255,255,0.06)' }}
              >
                <Shield size={12} style={{ color: 'var(--color-obs-text-subtle)' }} />
                <p className="text-[11.5px]" style={{ color: 'var(--color-obs-text-subtle)' }}>
                  クレジット追加・プラン変更は管理者のみ可能です
                </p>
              </div>
            </ObsCard>
          </motion.div>
        )}

        {/* ── Members (管理者のみ) ── */}
        {tab === 'team' && isAdmin && (
          <div className="mt-12">
            <ObsSectionHeader
              title="メンバー"
              caption="管理者以上がメンバーの招待・削除・権限変更を行えます。クレジット追加など費用が発生する操作は特権管理者のみ可能です"
            />

            <ObsCard depth="high" padding="lg" radius="xl">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-4">
                  <div
                    className="w-11 h-11 rounded-[var(--radius-obs-md)] flex items-center justify-center"
                    style={{
                      background:
                        'linear-gradient(135deg, var(--color-obs-primary) 0%, var(--color-obs-primary-container) 100%)',
                    }}
                  >
                    <Users size={20} style={{ color: 'var(--color-obs-on-primary)' }} />
                  </div>
                  <div>
                    <p
                      className="text-[11px] font-medium uppercase tracking-[0.1em] mb-0.5"
                      style={{ color: 'var(--color-obs-text-subtle)' }}
                    >
                      チームメンバー
                    </p>
                    <p
                      className="text-[15px] font-semibold"
                      style={{ color: 'var(--color-obs-text)' }}
                    >
                      {members.length} 名 / {seats} シート
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {isAdmin && (
                    <ObsButton
                      variant="ghost"
                      size="md"
                      onClick={() => {
                        setPendingSeats(currentPlanData?.minSeats ?? 1)
                        setShowAddSeats(true)
                      }}
                    >
                      <Plus size={14} className="inline mr-1.5" />
                      シート追加
                    </ObsButton>
                  )}
                  <ObsButton variant="primary" size="md" onClick={() => setShowInviteMember(true)}>
                    <UserPlus size={14} className="inline mr-1.5" />
                    メンバーを招待
                  </ObsButton>
                </div>
              </div>

              <div className="space-y-2">
                {members.map((m) => {
                  // 自分自身は削除不可。特権管理者(オーナー)も削除/権限変更不可
                  const isSelf = m.email === currentUserEmail
                  const isOwner = m.role === 'super_admin'
                  // 削除可能: 管理操作権限あり かつ 自分自身でない かつ オーナーでない
                  const canDelete = isAdmin && !isSelf && !isOwner
                  // ロール編集可能: 管理操作権限あり かつ オーナーでない (オーナー権限の移譲は別フロー)
                  const canEditRole = isAdmin && !isOwner
                  return (
                    <div
                      key={m.id}
                      className="rounded-[var(--radius-obs-md)] p-3.5 flex items-center justify-between gap-4"
                      style={{ backgroundColor: 'var(--color-obs-surface-high)' }}
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div
                          className="w-9 h-9 rounded-full flex items-center justify-center text-[13px] font-semibold shrink-0"
                          style={{
                            backgroundColor: 'var(--color-obs-surface-highest)',
                            color: 'var(--color-obs-text)',
                          }}
                        >
                          {m.initial}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p
                            className="text-[13px] font-semibold truncate flex items-center gap-2"
                            style={{ color: 'var(--color-obs-text)' }}
                          >
                            {m.name}
                            {isSelf && (
                              <span
                                className="text-[9.5px] font-semibold px-1.5 py-[1px] rounded uppercase tracking-[0.08em]"
                                style={{
                                  backgroundColor: 'var(--color-obs-surface-highest)',
                                  color: 'var(--color-obs-text-subtle)',
                                }}
                              >
                                自分
                              </span>
                            )}
                          </p>
                          <p
                            className="text-[11.5px] truncate"
                            style={{ color: 'var(--color-obs-text-subtle)' }}
                          >
                            {m.email}
                          </p>
                        </div>
                      </div>

                      {/* 権限バッジ + 切替ドロップダウン(オーナー以外編集可) */}
                      <div className="flex items-center gap-2 shrink-0">
                        <div className="relative">
                          <button
                            onClick={() => {
                              if (!canEditRole) return
                              setOpenRoleMenuId(openRoleMenuId === m.id ? null : m.id)
                            }}
                            disabled={!canEditRole}
                            className="text-[10px] font-semibold px-2.5 py-1 rounded-full uppercase tracking-[0.08em] whitespace-nowrap flex items-center gap-1 transition-all disabled:cursor-default"
                            style={{
                              backgroundColor:
                                m.role === 'super_admin'
                                  ? 'rgba(255,193,7,0.14)'
                                  : m.role === 'admin'
                                    ? 'rgba(171,199,255,0.14)'
                                    : 'var(--color-obs-surface-highest)',
                              color:
                                m.role === 'super_admin'
                                  ? '#FFC107'
                                  : m.role === 'admin'
                                    ? 'var(--color-obs-primary)'
                                    : 'var(--color-obs-text-muted)',
                              boxShadow: canEditRole
                                ? 'inset 0 0 0 1px rgba(255,255,255,0.06)'
                                : 'none',
                            }}
                          >
                            {m.role === 'super_admin' ? (
                              <>
                                <Crown size={10} />
                                特権管理者
                              </>
                            ) : m.role === 'admin' ? (
                              <>
                                <Shield size={10} />
                                管理者
                              </>
                            ) : (
                              'メンバー'
                            )}
                            {canEditRole && (
                              <ChevronRight
                                size={10}
                                style={{
                                  transform: 'rotate(90deg)',
                                }}
                              />
                            )}
                          </button>

                          {/* ドロップダウンメニュー (オーナー以外のみ表示) */}
                          {openRoleMenuId === m.id && canEditRole && (
                            <>
                              <div
                                className="fixed inset-0 z-10"
                                onClick={() => setOpenRoleMenuId(null)}
                              />
                              <div
                                className="absolute right-0 top-full mt-1.5 z-20 min-w-[260px] rounded-[var(--radius-obs-md)] overflow-hidden"
                                style={{
                                  backgroundColor: 'var(--color-obs-surface-highest)',
                                  boxShadow: '0 12px 32px rgba(0,0,0,0.45)',
                                }}
                              >
                                {/* ① 特権管理者 — 特権管理者のみが昇格可能 */}
                                {isSuperAdmin ? (
                                  <button
                                    onClick={() => updateRole(m.id, 'super_admin')}
                                    className="w-full px-3 py-2.5 flex items-start gap-2 text-left transition-colors hover:bg-[rgba(255,193,7,0.10)]"
                                    style={{ backgroundColor: 'rgba(255,193,7,0.06)' }}
                                    title="この役割に昇格"
                                  >
                                    <Crown
                                      size={13}
                                      className="mt-0.5 shrink-0"
                                      style={{ color: '#FFC107' }}
                                    />
                                    <div className="flex-1">
                                      <p
                                        className="text-[12px] font-semibold flex items-center gap-1.5"
                                        style={{ color: '#FFC107' }}
                                      >
                                        特権管理者
                                        {m.role === 'super_admin' && (
                                          <Check size={11} style={{ color: '#FFC107' }} />
                                        )}
                                      </p>
                                      <p
                                        className="text-[10.5px] mt-0.5 leading-snug"
                                        style={{ color: 'var(--color-obs-text-subtle)' }}
                                      >
                                        プラン編集・クレジット購入・権限移譲を含む、すべての管理操作が可能。
                                      </p>
                                    </div>
                                  </button>
                                ) : (
                                  <div
                                    className="px-3 py-2.5 flex items-start gap-2 cursor-not-allowed"
                                    style={{
                                      backgroundColor: 'rgba(255,193,7,0.04)',
                                      opacity: 0.6,
                                    }}
                                    title="特権管理者のみがこの役割に変更できます"
                                  >
                                    <Crown
                                      size={13}
                                      className="mt-0.5 shrink-0"
                                      style={{ color: '#FFC107' }}
                                    />
                                    <div className="flex-1">
                                      <p
                                        className="text-[12px] font-semibold flex items-center gap-1.5"
                                        style={{ color: '#FFC107' }}
                                      >
                                        特権管理者
                                      </p>
                                      <p
                                        className="text-[10.5px] mt-0.5 leading-snug"
                                        style={{ color: 'var(--color-obs-text-subtle)' }}
                                      >
                                        プラン編集・クレジット購入・権限移譲を含む、すべての管理操作が可能。
                                      </p>
                                      <p
                                        className="text-[10px] mt-1 leading-snug font-semibold"
                                        style={{ color: '#FFC107' }}
                                      >
                                        ⛔ 特権管理者のみが昇格できます
                                      </p>
                                    </div>
                                  </div>
                                )}

                                <div
                                  className="border-t"
                                  style={{ borderColor: 'rgba(255,255,255,0.04)' }}
                                />

                                {/* ② 管理者 */}
                                <button
                                  onClick={() => updateRole(m.id, 'admin')}
                                  className="w-full px-3 py-2.5 flex items-start gap-2 text-left transition-colors hover:bg-[var(--color-obs-surface-high)]"
                                  title="この役割に変更"
                                >
                                  <Shield
                                    size={13}
                                    className="mt-0.5 shrink-0"
                                    style={{ color: 'var(--color-obs-primary)' }}
                                  />
                                  <div className="flex-1">
                                    <p
                                      className="text-[12px] font-semibold flex items-center gap-1.5"
                                      style={{ color: 'var(--color-obs-text)' }}
                                    >
                                      管理者
                                      {m.role === 'admin' && (
                                        <Check
                                          size={11}
                                          style={{ color: 'var(--color-obs-primary)' }}
                                        />
                                      )}
                                    </p>
                                    <p
                                      className="text-[10.5px] mt-0.5 leading-snug"
                                      style={{ color: 'var(--color-obs-text-subtle)' }}
                                    >
                                      メンバー招待・データ削除・管理者までの権限変更が可能。
                                    </p>
                                    <p
                                      className="text-[10px] mt-1 leading-snug"
                                      style={{ color: 'var(--color-obs-hot)' }}
                                    >
                                      ⛔ 不可: プラン編集 / 特権管理者の権限付与
                                    </p>
                                  </div>
                                </button>

                                <div
                                  className="border-t"
                                  style={{ borderColor: 'rgba(255,255,255,0.04)' }}
                                />

                                {/* ③ メンバー */}
                                <button
                                  onClick={() => updateRole(m.id, 'member')}
                                  className="w-full px-3 py-2.5 flex items-start gap-2 text-left transition-colors hover:bg-[var(--color-obs-surface-high)]"
                                  title="この役割に変更"
                                >
                                  <Users
                                    size={13}
                                    className="mt-0.5 shrink-0"
                                    style={{ color: 'var(--color-obs-text-muted)' }}
                                  />
                                  <div className="flex-1">
                                    <p
                                      className="text-[12px] font-semibold flex items-center gap-1.5"
                                      style={{ color: 'var(--color-obs-text)' }}
                                    >
                                      メンバー
                                      {m.role === 'member' && (
                                        <Check
                                          size={11}
                                          style={{ color: 'var(--color-obs-primary)' }}
                                        />
                                      )}
                                    </p>
                                    <p
                                      className="text-[10.5px] mt-0.5 leading-snug"
                                      style={{ color: 'var(--color-obs-text-subtle)' }}
                                    >
                                      データの閲覧・追加・編集・利用が可能。
                                    </p>
                                    <p
                                      className="text-[10px] mt-1 leading-snug"
                                      style={{ color: 'var(--color-obs-hot)' }}
                                    >
                                      ⛔ 不可: メンバー管理 / データ削除 / プラン編集 / 権限変更
                                    </p>
                                  </div>
                                </button>
                              </div>
                            </>
                          )}
                        </div>

                        {/* 削除ボタン (管理者のみ・自分自身/最後の管理者は不可) */}
                        {isAdmin && (
                          <button
                            onClick={() => {
                              if (!canDelete) return
                              setConfirmDialog({
                                title: 'メンバーを削除',
                                message: `${m.name} (${m.email}) をチームから削除します。このメンバーのアカウントは無効化され、ダッシュボードへアクセスできなくなります。この操作は取り消せません。`,
                                confirmLabel: '削除する',
                                variant: 'danger',
                                onConfirm: () => deleteMember(m.id),
                              })
                            }}
                            disabled={!canDelete}
                            title={
                              isSelf
                                ? '自分自身は削除できません'
                                : isOwner
                                  ? '特権管理者(オーナー)は削除できません'
                                  : 'このメンバーを削除'
                            }
                            className="w-8 h-8 rounded-[var(--radius-obs-sm)] flex items-center justify-center transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                            style={{
                              backgroundColor: 'transparent',
                              color: canDelete
                                ? 'var(--color-obs-text-muted)'
                                : 'var(--color-obs-text-subtle)',
                            }}
                            onMouseEnter={(e) => {
                              if (!canDelete) return
                              e.currentTarget.style.backgroundColor = 'rgba(255,90,90,0.10)'
                              e.currentTarget.style.color = '#FF5A5A'
                            }}
                            onMouseLeave={(e) => {
                              if (!canDelete) return
                              e.currentTarget.style.backgroundColor = 'transparent'
                              e.currentTarget.style.color = 'var(--color-obs-text-muted)'
                            }}
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </ObsCard>
          </div>
        )}

        {/* ── Integrations ── */}
        {tab === 'integrations' && (
          <div className="mt-12">
            <ObsSectionHeader
              title="連携設定"
              caption="管理者の一括設定と、メンバー本人が許可する個別連携を分けて管理します"
            />

            <div className="mt-6 space-y-6">
              {/* ── 個別設定 ── */}
              <div>
                <div className="mb-3 flex items-end justify-between gap-3">
                  <div>
                    <h3
                      className="font-[family-name:var(--font-display)] text-lg font-semibold tracking-[-0.02em]"
                      style={{ color: 'var(--color-obs-text)' }}
                    >
                      個別の連携設定
                    </h3>
                    <p className="text-[12.5px] mt-1" style={{ color: 'var(--color-obs-text-muted)' }}>
                      GmailとMeet議事録は、メールボックス・予定・議事録Docが本人アカウントに紐づくため、各メンバーが自分で連携します。
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                  <IntegrationServiceCard
                    icon={<OfficialIntegrationIcon src="/icons/gmail.png" alt="Gmail" />}
                    title="Gmail"
                    status={googleStatus?.services?.gmail}
                    description="送受信メールを企業・コンタクト・取引のアクティビティに取り込みます。"
                    connectHref="/api/google/install?service=gmail&returnTo=/subscription?tab=integrations"
                    connectLabel="Gmailを連携"
                    syncLabel="Gmailを同期"
                    busy={integrationBusy === 'gmail'}
                    onSync={syncGmail}
                  />
                  <IntegrationServiceCard
                    icon={<OfficialIntegrationIcon src="/icons/google-meet.png" alt="Google Meet" />}
                    title="Google Meet 議事録"
                    status={{
                      available:
                        !!googleStatus?.services?.calendar?.available &&
                        !!googleStatus?.services?.meet?.available,
                      enabled:
                        googleStatus?.services?.calendar?.enabled !== false &&
                        googleStatus?.services?.meet?.enabled !== false,
                      lastSyncAt:
                        googleStatus?.services?.meet?.lastSyncAt ??
                        googleStatus?.services?.calendar?.lastSyncAt ??
                        null,
                    }}
                    description="カレンダー予定・Meet文字起こし・議事録Docを使って、商談と議事録を自動紐付けします。"
                    connectHref="/api/google/install?service=calendar,meet&returnTo=/subscription?tab=integrations"
                    connectLabel="Meet議事録を連携"
                    syncLabel="Meet議事録を同期"
                    busy={integrationBusy === 'meet'}
                    onSync={syncMeetBundle}
                  />
                </div>
              </div>

              {/* ── 管理者設定 ── */}
              {isAdmin && (
                <div>
                  <div className="mb-3 flex items-end justify-between gap-3">
                    <div>
                      <h3
                        className="font-[family-name:var(--font-display)] text-lg font-semibold tracking-[-0.02em]"
                        style={{ color: 'var(--color-obs-text)' }}
                      >
                        管理者の連携設定
                      </h3>
                      <p className="text-[12.5px] mt-1" style={{ color: 'var(--color-obs-text-muted)' }}>
                        テナント共通で使う設定です。Notion議事録は管理者が連携すれば、共有済みDB/ページをチームで同期できます。
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                    <ObsCard depth="high" padding="lg" radius="xl" className="h-full">
                      <div className="flex h-full items-start gap-3">
                        <OfficialIntegrationIcon src="/icons/google-workspace.png" alt="Google Workspace" />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-[15px] font-semibold" style={{ color: 'var(--color-obs-text)' }}>
                              Google Workspace
                            </h3>
                            <span
                              className="text-[10px] font-semibold uppercase tracking-[0.08em] px-1.5 py-0.5 rounded-full"
                              style={{
                                color: 'var(--color-obs-text-subtle)',
                                backgroundColor: 'var(--color-obs-surface-high)',
                              }}
                            >
                              管理者設定
                            </span>
                          </div>
                          <p className="text-[12.5px] mt-1.5 leading-relaxed" style={{ color: 'var(--color-obs-text-muted)' }}>
                            管理者がGoogle連携を許可します。
                          </p>
                          <div className="mt-3 grid gap-1.5 text-[12px]" style={{ color: 'var(--color-obs-text-muted)' }}>
                            <div className="flex items-start gap-2">
                              <Check size={13} className="mt-0.5 shrink-0" style={{ color: '#4ad98a' }} />
                              <span>管理者: Google連携を許可</span>
                            </div>
                            <div className="flex items-start gap-2">
                              <Check size={13} className="mt-0.5 shrink-0" style={{ color: '#4ad98a' }} />
                              <span>メンバー: Gmail / Meetを個別に連携</span>
                            </div>
                          </div>
                          <div className="mt-3 flex flex-wrap gap-2">
                            <a
                              href="/api/google/install?service=gmail,calendar,meet&returnTo=/subscription?tab=integrations"
                              className={INTEGRATION_ACTION_CLASS}
                              style={INTEGRATION_ACTION_STYLE}
                            >
                              <Link2 size={12} />
                              Googleを許可
                            </a>
                          </div>
                        </div>
                      </div>
                    </ObsCard>

                    <NotionIntegrationCard
                      status={notionStatus}
                      busy={integrationBusy === 'notion'}
                      showTokenForm={showNotionTokenForm}
                      token={notionToken}
                      message={notionMessage}
                      onToggleForm={() => setShowNotionTokenForm((v) => !v)}
                      onTokenChange={setNotionToken}
                      onTokenSubmit={connectNotionToken}
                      onSync={syncNotion}
                      onCancel={() => setShowNotionTokenForm(false)}
                    />
                  </div>
                </div>
              )}

              {/* ── メンバー別 連携状況 ── */}
              {isAdmin && (
                <ObsCard depth="high" padding="lg" radius="xl">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3
                      className="font-[family-name:var(--font-display)] text-lg font-semibold tracking-[-0.02em]"
                      style={{ color: 'var(--color-obs-text)' }}
                    >
                      メンバー別 連携状況
                    </h3>
                    <p className="text-[12.5px] mt-1" style={{ color: 'var(--color-obs-text-muted)' }}>
                      メンバーごとの Gmail・Meet 議事録の連携状況を確認できます。Notion議事録は管理者設定を全メンバーで利用します。
                    </p>
                  </div>
                  <span
                    className="text-[11px] font-medium uppercase tracking-[0.1em] px-2.5 py-1 rounded-full"
                    style={{
                      backgroundColor: 'rgba(171,199,255,0.10)',
                      color: 'var(--color-obs-primary)',
                      boxShadow: 'inset 0 0 0 1px rgba(171,199,255,0.22)',
                    }}
                  >
                    {members.length} 名
                  </span>
                </div>

                {/* ヘッダ行 */}
                <div
                  className="hidden md:grid grid-cols-[1.4fr_repeat(2,minmax(0,1fr))_auto] gap-3 px-3 py-2 text-[11px] font-medium uppercase tracking-[0.08em]"
                  style={{ color: 'var(--color-obs-text-subtle)' }}
                >
                  <div>メンバー</div>
                  <div className="text-center">Gmail</div>
                  <div className="text-center">Meet 議事録</div>
                  <div className="w-[120px] text-right">アクション</div>
                </div>

                <div className="space-y-2">
                  {members.length === 0 ? (
                    <div
                      className="rounded-[var(--radius-obs-md)] px-4 py-6 text-center text-[12.5px]"
                      style={{
                        backgroundColor: 'var(--color-obs-surface-high)',
                        color: 'var(--color-obs-text-muted)',
                      }}
                    >
                      メンバーがまだ招待されていません。
                    </div>
                  ) : (
                    members.map((m) => (
                      <div
                        key={m.id}
                        className="grid grid-cols-[1.4fr_repeat(2,minmax(0,1fr))_auto] gap-3 px-3 py-3 items-center rounded-[var(--radius-obs-md)]"
                        style={{ backgroundColor: 'var(--color-obs-surface-high)' }}
                      >
                        {/* メンバー名 */}
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div
                            className="w-7 h-7 rounded-full flex items-center justify-center text-[11.5px] font-semibold shrink-0"
                            style={{
                              backgroundColor: 'var(--color-obs-surface-highest)',
                              color: 'var(--color-obs-text)',
                            }}
                          >
                            {m.initial}
                          </div>
                          <div className="min-w-0">
                            <div
                              className="text-[13px] font-medium truncate"
                              style={{ color: 'var(--color-obs-text)' }}
                            >
                              {m.name}
                            </div>
                            <div
                              className="text-[11px] truncate"
                              style={{ color: 'var(--color-obs-text-subtle)' }}
                            >
                              {m.email}
                            </div>
                          </div>
                        </div>

                        {/* Gmail / Meet 状態ピル */}
                        {[
                          { key: 'gmail', connected: false },
                          { key: 'meet', connected: false },
                        ].map((s) => (
                          <div key={s.key} className="flex justify-center">
                            <span
                              className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded-full"
                              style={{
                                backgroundColor: s.connected
                                  ? 'rgba(75,200,140,0.14)'
                                  : 'rgba(255,255,255,0.06)',
                                color: s.connected ? '#4BC88C' : 'var(--color-obs-text-subtle)',
                                boxShadow: `inset 0 0 0 1px ${
                                  s.connected
                                    ? 'rgba(75,200,140,0.28)'
                                    : 'rgba(255,255,255,0.08)'
                                }`,
                              }}
                            >
                              {s.connected ? (
                                <>
                                  <Check size={10} strokeWidth={3} /> 連携済み
                                </>
                              ) : (
                                '未連携'
                              )}
                            </span>
                          </div>
                        ))}

                        {/* アクション: リマインド送信 (今はモック) */}
                        <div className="flex justify-end">
                          <button
                            type="button"
                            className="text-[11.5px] font-medium px-3 py-1.5 rounded-[var(--radius-obs-md)] transition-colors"
                            style={{
                              backgroundColor: 'transparent',
                              color: 'var(--color-obs-text-muted)',
                              boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.08)',
                            }}
                            onMouseOver={(e) => {
                              ;(e.currentTarget as HTMLButtonElement).style.backgroundColor =
                                'rgba(171,199,255,0.10)'
                            }}
                            onMouseOut={(e) => {
                              ;(e.currentTarget as HTMLButtonElement).style.backgroundColor =
                                'transparent'
                            }}
                          >
                            <Mail size={11} className="inline mr-1" />
                            リマインド
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                </ObsCard>
              )}

              <ObsCard depth="low" padding="md" radius="xl">
                <div className="flex items-start gap-3">
                  <Calendar size={16} className="mt-0.5" style={{ color: 'var(--color-obs-primary)' }} />
                  <p className="text-[12.5px] leading-relaxed" style={{ color: 'var(--color-obs-text-muted)' }}>
                    Googleカレンダーは単独機能として前面に出さず、Meet議事録連携の中に含めています。
                    商談日時・参加者メール・Meet URLを取得し、議事録を取引やコンタクトへ紐付けるために必要です。
                  </p>
                </div>
              </ObsCard>
            </div>
          </div>
        )}

        {/* ── Confirm dialog (汎用確認モーダル) ── */}
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
                style={{ backgroundColor: 'rgba(14,14,16,0.72)' }}
                onClick={() => setConfirmDialog(null)}
              />
              <motion.div
                className="relative w-full max-w-[460px] rounded-[var(--radius-obs-xl)] overflow-hidden"
                style={{
                  backgroundColor: 'var(--color-obs-surface-highest)',
                  boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
                }}
                initial={{ opacity: 0, scale: 0.95, y: 12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 12 }}
              >
                <div className="px-6 pt-6 pb-2">
                  <h2
                    className="font-[family-name:var(--font-display)] text-lg font-semibold tracking-[-0.02em] mb-2"
                    style={{ color: 'var(--color-obs-text)' }}
                  >
                    {confirmDialog.title}
                  </h2>
                  <p
                    className="text-[13px] leading-relaxed whitespace-pre-wrap"
                    style={{ color: 'var(--color-obs-text-muted)' }}
                  >
                    {confirmDialog.message}
                  </p>
                </div>

                <div className="px-6 pb-6 pt-4 flex items-center gap-2">
                  <button
                    onClick={() => setConfirmDialog(null)}
                    className="flex-1 h-10 rounded-[var(--radius-obs-md)] text-[13px] font-medium transition-colors"
                    style={{
                      backgroundColor: 'transparent',
                      color: 'var(--color-obs-text-muted)',
                      boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.08)',
                    }}
                  >
                    キャンセル
                  </button>
                  <button
                    onClick={async () => {
                      await confirmDialog.onConfirm()
                      setConfirmDialog(null)
                    }}
                    className="flex-1 h-10 rounded-[var(--radius-obs-md)] text-[13px] font-semibold transition-colors"
                    style={
                      confirmDialog.variant === 'danger'
                        ? {
                            backgroundColor: 'rgba(255,90,90,0.16)',
                            color: '#FF7A7A',
                            boxShadow: 'inset 0 0 0 1px rgba(255,90,90,0.32)',
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
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Add seats modal ── */}
        <AnimatePresence>
          {showAddSeats && (
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div
                className="absolute inset-0 backdrop-blur-sm"
                style={{ backgroundColor: 'rgba(14,14,16,0.72)' }}
                onClick={() => setShowAddSeats(false)}
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
                <div className="flex items-center justify-between px-6 py-4">
                  <div className="flex items-center gap-2">
                    <Users size={16} style={{ color: 'var(--color-obs-primary)' }} />
                    <h2
                      className="font-[family-name:var(--font-display)] text-base font-semibold tracking-[-0.01em]"
                      style={{ color: 'var(--color-obs-text)' }}
                    >
                      シート数を変更
                    </h2>
                  </div>
                  <button
                    onClick={() => setShowAddSeats(false)}
                    className="p-1.5 rounded-full transition-colors hover:bg-[var(--color-obs-surface-high)]"
                  >
                    <X size={16} style={{ color: 'var(--color-obs-text-muted)' }} />
                  </button>
                </div>

                <div className="px-6 pb-6 space-y-4">
                  {/* 現在の契約情報 */}
                  <div
                    className="rounded-[var(--radius-obs-md)] p-3.5 grid grid-cols-2 gap-3"
                    style={{ backgroundColor: 'var(--color-obs-surface-high)' }}
                  >
                    <div>
                      <p
                        className="text-[10px] font-medium uppercase tracking-[0.1em] mb-1"
                        style={{ color: 'var(--color-obs-text-subtle)' }}
                      >
                        現在のプラン
                      </p>
                      <p
                        className="text-[14px] font-semibold"
                        style={{ color: 'var(--color-obs-text)' }}
                      >
                        {currentPlanData?.name ?? '—'}
                      </p>
                    </div>
                    <div>
                      <p
                        className="text-[10px] font-medium uppercase tracking-[0.1em] mb-1"
                        style={{ color: 'var(--color-obs-text-subtle)' }}
                      >
                        現在のシート数
                      </p>
                      <p
                        className="text-[14px] font-semibold tabular-nums"
                        style={{ color: 'var(--color-obs-text)' }}
                      >
                        {seats} シート
                      </p>
                    </div>
                  </div>

                  {/* シート数調整 */}
                  <div>
                    <label
                      className="text-[11px] font-medium uppercase tracking-[0.1em] mb-2 block"
                      style={{ color: 'var(--color-obs-text-subtle)' }}
                    >
                      シート数の調整
                    </label>
                    <div
                      className="rounded-[var(--radius-obs-md)] p-4"
                      style={{ backgroundColor: 'var(--color-obs-surface-high)' }}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <button
                          onClick={() =>
                            setPendingSeats((p) => Math.max(currentPlanData?.minSeats ?? 1, p - 1))
                          }
                          disabled={pendingSeats <= (currentPlanData?.minSeats ?? 1)}
                          className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-105 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
                          style={{ backgroundColor: 'var(--color-obs-surface-highest)' }}
                          aria-label="シート減らす"
                        >
                          <Minus size={16} style={{ color: 'var(--color-obs-text)' }} />
                        </button>

                        <div className="flex-1 text-center">
                          <p
                            className="font-[family-name:var(--font-display)] text-[34px] font-bold tabular-nums tracking-[-0.03em]"
                            style={{ color: 'var(--color-obs-text)' }}
                          >
                            {pendingSeats}
                          </p>
                          <p
                            className="text-[11px] mt-0.5"
                            style={{ color: 'var(--color-obs-text-subtle)' }}
                          >
                            現在の合計シート数
                          </p>
                        </div>

                        <button
                          onClick={() => {
                            const max = currentPlanData?.maxSeats
                            setPendingSeats((p) => (max ? Math.min(max, p + 1) : p + 1))
                          }}
                          disabled={
                            currentPlanData?.maxSeats !== undefined &&
                            pendingSeats >= currentPlanData.maxSeats
                          }
                          className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-105 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
                          style={{ backgroundColor: 'var(--color-obs-surface-highest)' }}
                          aria-label="シート増やす"
                        >
                          <Plus size={16} style={{ color: 'var(--color-obs-text)' }} />
                        </button>
                      </div>
                    </div>

                    {/* メンバー数を下回る場合の警告 */}
                    {pendingSeats < members.length && (
                      <div
                        className="mt-3 rounded-[var(--radius-obs-sm)] p-3 flex items-start gap-2"
                        style={{
                          backgroundColor: 'rgba(255,193,7,0.10)',
                          color: '#FFC107',
                        }}
                      >
                        <span className="text-[14px] leading-none mt-0.5">⚠</span>
                        <p className="text-[11.5px] leading-relaxed">
                          現在 {members.length} 名のメンバーが在籍中です。シート数を {pendingSeats}{' '}
                          に減らすと、超過分のメンバー({members.length - pendingSeats}{' '}
                          名)はアクセスできなくなります。事前にメンバーを削除してください。
                        </p>
                      </div>
                    )}
                  </div>

                  {/* 料金プレビュー */}
                  {(() => {
                    const pricePerSeat =
                      billingCycle === 'annual'
                        ? (currentPlanData?.priceAnnual ?? 0)
                        : (currentPlanData?.priceMonthly ?? 0)
                    const currentTotal = pricePerSeat * seats
                    const newTotal = pricePerSeat * pendingSeats
                    const diff = newTotal - currentTotal
                    return (
                      <div
                        className="rounded-[var(--radius-obs-md)] p-3.5"
                        style={{
                          backgroundColor: 'rgba(171,199,255,0.06)',
                          boxShadow: 'inset 0 0 0 1px rgba(171,199,255,0.12)',
                        }}
                      >
                        <div className="flex justify-between text-[12px] mb-2">
                          <span style={{ color: 'var(--color-obs-text-muted)' }}>
                            現在の月額(税抜)
                          </span>
                          <span className="tabular-nums" style={{ color: 'var(--color-obs-text)' }}>
                            ¥{currentTotal.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between text-[12px] mb-2">
                          <span style={{ color: 'var(--color-obs-text-muted)' }}>
                            変更後の月額(税抜)
                          </span>
                          <span
                            className="tabular-nums font-semibold"
                            style={{ color: 'var(--color-obs-text)' }}
                          >
                            ¥{newTotal.toLocaleString()}
                          </span>
                        </div>
                        <div
                          className="flex justify-between text-[13px] pt-2 border-t"
                          style={{ borderColor: 'rgba(171,199,255,0.16)' }}
                        >
                          <span
                            className="font-semibold"
                            style={{ color: 'var(--color-obs-text)' }}
                          >
                            差額(月額)
                          </span>
                          <span
                            className="tabular-nums font-bold"
                            style={{
                              color: diff >= 0 ? 'var(--color-obs-primary)' : '#4BC88C',
                            }}
                          >
                            {diff >= 0 ? '+' : ''}¥{diff.toLocaleString()}
                          </span>
                        </div>
                        {diff > 0 && (
                          <p
                            className="text-[10.5px] mt-2 leading-relaxed"
                            style={{ color: 'var(--color-obs-text-subtle)' }}
                          >
                            ※ 日割り計算で初回請求に追加されます。次月以降は新シート数で課金。
                          </p>
                        )}
                      </div>
                    )
                  })()}

                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowAddSeats(false)}
                      className="flex-1 h-10 rounded-[var(--radius-obs-md)] text-[13px] font-medium transition-colors"
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
                      disabled={pendingSeats < members.length || pendingSeats === seats}
                      onClick={() => {
                        setSeats(pendingSeats)
                        setShowAddSeats(false)
                      }}
                    >
                      変更を確定
                    </ObsButton>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Member invite modal ── */}
        <AnimatePresence>
          {showInviteMember && (
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div
                className="absolute inset-0 backdrop-blur-sm"
                style={{ backgroundColor: 'rgba(14,14,16,0.72)' }}
                onClick={() => setShowInviteMember(false)}
              />
              <motion.div
                className="relative w-full max-w-[480px] rounded-[var(--radius-obs-xl)] overflow-hidden"
                style={{
                  backgroundColor: 'var(--color-obs-surface-highest)',
                  boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
                }}
                initial={{ opacity: 0, scale: 0.95, y: 12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 12 }}
              >
                <div className="flex items-center justify-between px-6 py-4">
                  <div className="flex items-center gap-2">
                    <UserPlus size={16} style={{ color: 'var(--color-obs-primary)' }} />
                    <h2
                      className="font-[family-name:var(--font-display)] text-base font-semibold tracking-[-0.01em]"
                      style={{ color: 'var(--color-obs-text)' }}
                    >
                      メンバーを招待
                    </h2>
                  </div>
                  <button
                    onClick={() => setShowInviteMember(false)}
                    className="p-1.5 rounded-full transition-colors hover:bg-[var(--color-obs-surface-high)]"
                  >
                    <X size={16} style={{ color: 'var(--color-obs-text-muted)' }} />
                  </button>
                </div>

                <div className="px-6 pb-6 space-y-4">
                  {/* シート空き状況(1行・分かりやすく) */}
                  <div
                    className="rounded-[var(--radius-obs-md)] px-3.5 py-2.5 flex items-center justify-between gap-3"
                    style={{
                      backgroundColor:
                        members.length >= seats
                          ? 'rgba(255,193,7,0.08)'
                          : 'var(--color-obs-surface-high)',
                      boxShadow:
                        members.length >= seats ? 'inset 0 0 0 1px rgba(255,193,7,0.25)' : 'none',
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <Users
                        size={14}
                        style={{
                          color:
                            members.length >= seats ? '#FFC107' : 'var(--color-obs-text-muted)',
                        }}
                      />
                      <p
                        className="text-[12.5px] tabular-nums"
                        style={{ color: 'var(--color-obs-text)' }}
                      >
                        シート使用:{' '}
                        <span className="font-semibold">
                          {members.length} / {seats}
                        </span>{' '}
                        <span style={{ color: 'var(--color-obs-text-muted)' }}>
                          {members.length >= seats
                            ? '(満員・空きなし)'
                            : `(残り ${seats - members.length} シート)`}
                        </span>
                      </p>
                    </div>
                    {members.length >= seats && isAdmin && (
                      <button
                        onClick={() => {
                          setShowInviteMember(false)
                          setPendingSeats(currentPlanData?.minSeats ?? 1)
                          setShowAddSeats(true)
                        }}
                        className="text-[11.5px] font-semibold whitespace-nowrap px-3 py-1.5 rounded-[var(--radius-obs-sm)] transition-colors"
                        style={{
                          backgroundColor: '#FFC107',
                          color: '#1a1a1a',
                        }}
                      >
                        + シート追加
                      </button>
                    )}
                  </div>

                  <div>
                    <label
                      className="text-[11px] font-medium uppercase tracking-[0.1em] mb-1.5 block"
                      style={{ color: 'var(--color-obs-text-subtle)' }}
                    >
                      メールアドレス *
                    </label>
                    <div className="relative">
                      <Mail
                        size={14}
                        className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                        style={{ color: 'var(--color-obs-text-subtle)' }}
                      />
                      <input
                        type="email"
                        placeholder="taro@example.com"
                        disabled={members.length >= seats}
                        className="w-full pl-9 pr-3 py-2.5 rounded-[var(--radius-obs-md)] text-[13px] outline-none border-0 disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{
                          backgroundColor: 'var(--color-obs-surface-high)',
                          color: 'var(--color-obs-text)',
                        }}
                      />
                    </div>
                    <p
                      className="text-[11px] mt-1.5"
                      style={{ color: 'var(--color-obs-text-subtle)' }}
                    >
                      複数招待時はカンマ区切りで入力
                    </p>
                  </div>

                  <div>
                    <label
                      className="text-[11px] font-medium uppercase tracking-[0.1em] mb-1.5 block"
                      style={{ color: 'var(--color-obs-text-subtle)' }}
                    >
                      権限
                    </label>
                    <div
                      className="inline-flex p-1 rounded-[var(--radius-obs-md)] w-full"
                      style={{ backgroundColor: 'var(--color-obs-surface-high)' }}
                    >
                      <button
                        onClick={() => setInviteRole('member')}
                        className="flex-1 px-4 py-2 rounded-[var(--radius-obs-sm)] text-[12.5px] font-semibold transition-colors"
                        style={{
                          backgroundColor:
                            inviteRole === 'member'
                              ? 'var(--color-obs-surface-highest)'
                              : 'transparent',
                          color:
                            inviteRole === 'member'
                              ? 'var(--color-obs-text)'
                              : 'var(--color-obs-text-muted)',
                        }}
                      >
                        メンバー
                      </button>
                      <button
                        onClick={() => isAdmin && setInviteRole('admin')}
                        disabled={!isAdmin}
                        className="flex-1 px-4 py-2 rounded-[var(--radius-obs-sm)] text-[12.5px] font-semibold transition-colors flex items-center justify-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
                        style={{
                          backgroundColor:
                            inviteRole === 'admin' ? 'rgba(171,199,255,0.16)' : 'transparent',
                          color:
                            inviteRole === 'admin'
                              ? 'var(--color-obs-primary)'
                              : 'var(--color-obs-text-muted)',
                        }}
                      >
                        <Shield size={12} />
                        管理者
                      </button>
                    </div>
                    <p
                      className="text-[10.5px] mt-1.5"
                      style={{ color: 'var(--color-obs-text-subtle)' }}
                    >
                      {!isAdmin
                        ? '管理者権限の付与は管理者以上のみ可能です'
                        : inviteRole === 'admin'
                          ? 'メンバー管理・通常運用の管理が可能 (お金回りは特権管理者のみ)'
                          : '閲覧と利用のみ・管理操作は不可'}
                    </p>
                  </div>

                  <div
                    className="p-3 rounded-[var(--radius-obs-md)] text-[11.5px] leading-relaxed"
                    style={{
                      backgroundColor: 'rgba(171,199,255,0.06)',
                      color: 'var(--color-obs-text-muted)',
                    }}
                  >
                    💡 招待メールが送信され、相手が承諾するとチームに参加します。
                  </div>

                  {members.length >= seats ? (
                    <button
                      disabled
                      className="w-full h-12 rounded-[var(--radius-obs-md)] text-[13px] font-semibold cursor-not-allowed opacity-50"
                      style={{
                        backgroundColor: 'var(--color-obs-surface-high)',
                        color: 'var(--color-obs-text-muted)',
                      }}
                    >
                      シートが足りません
                    </button>
                  ) : (
                    <ObsButton variant="primary" size="lg" className="w-full">
                      招待を送信
                    </ObsButton>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Credit purchase modal ── */}
        <AnimatePresence>
          {showBuyCredits && (
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div
                className="absolute inset-0 backdrop-blur-sm"
                style={{ backgroundColor: 'rgba(14,14,16,0.72)' }}
                onClick={() => setShowBuyCredits(false)}
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
                <div className="flex items-center justify-between px-6 py-4">
                  <div className="flex items-center gap-2">
                    <CreditCard size={16} style={{ color: 'var(--color-obs-primary)' }} />
                    <h2
                      className="font-[family-name:var(--font-display)] text-base font-semibold tracking-[-0.01em]"
                      style={{ color: 'var(--color-obs-text)' }}
                    >
                      クレジット追加購入
                    </h2>
                  </div>
                  <button
                    onClick={() => setShowBuyCredits(false)}
                    className="p-1.5 rounded-full transition-colors hover:bg-[var(--color-obs-surface-high)]"
                  >
                    <X size={16} style={{ color: 'var(--color-obs-text-muted)' }} />
                  </button>
                </div>

                <div className="px-6 pb-6 space-y-4">
                  <div
                    className="rounded-[var(--radius-obs-md)] p-3 space-y-1.5"
                    style={{ backgroundColor: 'var(--color-obs-surface-high)' }}
                  >
                    <div className="flex items-center justify-between text-[12.5px]">
                      <span
                        className="flex items-center gap-1.5"
                        style={{ color: 'var(--color-obs-text-muted)' }}
                      >
                        <span
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ backgroundColor: 'var(--color-obs-primary)' }}
                        />
                        サブスク残 (翌月繰越なし)
                      </span>
                      <span
                        className="font-semibold tabular-nums"
                        style={{ color: 'var(--color-obs-text)' }}
                      >
                        {subscriptionRemaining.toLocaleString()} cr
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[12.5px]">
                      <span
                        className="flex items-center gap-1.5"
                        style={{ color: 'var(--color-obs-text-muted)' }}
                      >
                        <span
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ backgroundColor: '#4BC88C' }}
                        />
                        購入残 (永久繰越)
                      </span>
                      <span
                        className="font-semibold tabular-nums"
                        style={{ color: 'var(--color-obs-text)' }}
                      >
                        {purchasedRemaining.toLocaleString()} cr
                      </span>
                    </div>
                  </div>

                  {/* クレジット数ステッパー(1,000単位) */}
                  <div>
                    <label
                      className="text-[11px] font-medium uppercase tracking-[0.1em] mb-2 block"
                      style={{ color: 'var(--color-obs-text-subtle)' }}
                    >
                      追加するクレジット数 (1,000cr単位)
                    </label>
                    <div
                      className="rounded-[var(--radius-obs-md)] p-4"
                      style={{ backgroundColor: 'var(--color-obs-surface-high)' }}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <button
                          onClick={() =>
                            setPurchaseAmount((p) => Math.max(CREDIT_STEP, p - CREDIT_STEP))
                          }
                          disabled={purchaseAmount <= CREDIT_STEP}
                          className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-105 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
                          style={{ backgroundColor: 'var(--color-obs-surface-highest)' }}
                          aria-label="クレジット減らす"
                        >
                          <Minus size={16} style={{ color: 'var(--color-obs-text)' }} />
                        </button>

                        <div className="flex-1 text-center">
                          <p
                            className="font-[family-name:var(--font-display)] text-[34px] font-bold tabular-nums tracking-[-0.03em]"
                            style={{ color: 'var(--color-obs-text)' }}
                          >
                            {purchaseAmount.toLocaleString()}
                          </p>
                          <p
                            className="text-[11px] mt-0.5"
                            style={{ color: 'var(--color-obs-text-subtle)' }}
                          >
                            クレジット
                          </p>
                        </div>

                        <button
                          onClick={() => setPurchaseAmount((p) => p + CREDIT_STEP)}
                          className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-105 active:scale-95"
                          style={{ backgroundColor: 'var(--color-obs-surface-highest)' }}
                          aria-label="クレジット増やす"
                        >
                          <Plus size={16} style={{ color: 'var(--color-obs-text)' }} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* 料金プレビュー */}
                  <div
                    className="rounded-[var(--radius-obs-md)] p-3.5"
                    style={{
                      backgroundColor: 'rgba(171,199,255,0.06)',
                      boxShadow: 'inset 0 0 0 1px rgba(171,199,255,0.12)',
                    }}
                  >
                    <div className="flex justify-between text-[12px] mb-1.5">
                      <span style={{ color: 'var(--color-obs-text-muted)' }}>単価</span>
                      <span className="tabular-nums" style={{ color: 'var(--color-obs-text)' }}>
                        ¥{(CREDIT_UNIT_PRICE * CREDIT_STEP).toLocaleString()} / 1,000cr
                      </span>
                    </div>
                    <div className="flex justify-between text-[12px] mb-1.5">
                      <span style={{ color: 'var(--color-obs-text-muted)' }}>追加クレジット</span>
                      <span
                        className="tabular-nums font-semibold"
                        style={{ color: 'var(--color-obs-text)' }}
                      >
                        +{purchaseAmount.toLocaleString()} cr
                      </span>
                    </div>
                    <div
                      className="flex justify-between text-[14px] pt-2 border-t"
                      style={{ borderColor: 'rgba(171,199,255,0.16)' }}
                    >
                      <span className="font-semibold" style={{ color: 'var(--color-obs-text)' }}>
                        合計(税抜)
                      </span>
                      <span
                        className="tabular-nums font-bold"
                        style={{ color: 'var(--color-obs-primary)' }}
                      >
                        ¥{(purchaseAmount * CREDIT_UNIT_PRICE).toLocaleString()}
                      </span>
                    </div>
                    <p
                      className="text-[11px] mt-2 leading-relaxed"
                      style={{ color: 'var(--color-obs-text-subtle)' }}
                    >
                      購入後、即時にチーム残高(購入分)に反映されます。サブスク分から先に消費され、購入分は永久繰越となります。
                    </p>
                  </div>

                  <ObsButton
                    variant="primary"
                    size="lg"
                    className="w-full"
                    onClick={startCreditCheckout}
                    disabled={creditCheckoutLoading}
                  >
                    {creditCheckoutLoading
                      ? 'Stripeへ接続中...'
                      : `¥${(purchaseAmount * CREDIT_UNIT_PRICE).toLocaleString()} で購入する`}
                  </ObsButton>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ObsPageShell>
  )
}
