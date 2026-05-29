'use client'

import { Suspense, useEffect, useState } from 'react'
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
  Shield,
  UserPlus,
  Trash2,
  Star,
  Plug,
  ExternalLink,
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

// SALES × CRM パートナーシッププラン (CxO / 営業責任者 / IS 設計)
// HP の Pricing セクション (components/landing/sections/Pricing.tsx) と完全同期。
// 変更時は両方を必ず揃える。
// 戦略: 5社限定 (1 + 1 + 3 = 5枠) で、営業実行 + CRM 構築をセット提供。
const PLANS: Plan[] = [
  {
    id: 'cxo',
    name: 'CxO',
    tagline: '事業設計 / IS 設計 / FS・CS の営業実装',
    priceMonthly: 500000,
    priceAnnual: 500000,
    credits: 5000,
    minSeats: 1,
    isTenantPrice: true,
    slotsTotal: 1,
    slotsRemaining: 1,
    contractTerm: '3ヶ月契約・3ヶ月ごとに更新',
    additions: [
      '【営業範囲】事業設計',
      '【営業範囲】IS 設計',
      '【営業範囲】FS / CS の営業実装',
      '【CRM 提供】CRM 構築',
      '【CRM 提供】CRM 全機能',
      '【CRM 提供】月5,000クレジット 込み (チーム合計)',
      '【稼働条件】1日2商談まで',
      '【稼働条件】平日 日中稼働',
    ],
    icon: Crown,
  },
  {
    id: 'sales-director',
    name: '営業責任者',
    tagline: 'IS 設計 / FS・CS の営業実装 / 分析レポーティング',
    priceMonthly: 300000,
    priceAnnual: 300000,
    credits: 5000,
    minSeats: 1,
    isTenantPrice: true,
    slotsTotal: 1,
    slotsRemaining: 1,
    contractTerm: '3ヶ月契約・3ヶ月ごとに更新',
    additions: [
      '【営業範囲】IS 設計',
      '【営業範囲】FS / CS の営業実装',
      '【営業範囲】分析レポーティング',
      '【CRM 提供】CRM 構築',
      '【CRM 提供】CRM 全機能',
      '【CRM 提供】月5,000クレジット 込み (チーム合計)',
      '【稼働条件】1日1商談まで',
      '【稼働条件】平日 日中稼働',
    ],
    icon: Star,
    popular: true,
  },
  {
    id: 'is-design',
    name: 'IS 設計',
    tagline: 'IS チーム組成 / IS 設計 / IS マネジメント',
    priceMonthly: 200000,
    priceAnnual: 200000,
    credits: 5000,
    minSeats: 1,
    isTenantPrice: true,
    slotsTotal: 3,
    slotsRemaining: 3,
    contractTerm: '3ヶ月契約・3ヶ月ごとに更新',
    additions: [
      '【営業範囲】IS チーム組成',
      '【営業範囲】IS 設計',
      '【営業範囲】IS マネジメント',
      '【CRM 提供】CRM 構築',
      '【CRM 提供】CRM 全機能',
      '【CRM 提供】月5,000クレジット 込み (チーム合計)',
      '【稼働条件】週1回の社内MTG',
      '【稼働条件】平日 日中稼働',
    ],
    icon: Zap,
  },
]

// ─── メンバー定義 ─────────────────────────────────────────

// super_admin: テナント開設者(オーナー)。プラン・クレジット・機能リクエスト等のお金回り + データ削除 + 連携設定を管理
// admin: お金回り以外の編集権限(メンバー管理等)
// member: 通常権限(閲覧と利用)
type MemberRole = 'super_admin' | 'admin' | 'member'

interface Member {
  id: string
  name: string
  email: string
  role: MemberRole
  initial: string
}

const SAMPLE_MEMBERS: Member[] = [
  {
    id: 'u1',
    name: '開発 太郎',
    email: 'h.sawasaka@rookiesmart.jp',
    role: 'super_admin',
    initial: 'N',
  },
  { id: 'u2', name: '田中 花子', email: 'tanaka@rookiesmart.jp', role: 'member', initial: '田' },
  { id: 'u3', name: '鈴木 一郎', email: 'suzuki@rookiesmart.jp', role: 'member', initial: '鈴' },
  { id: 'u4', name: '佐藤 次郎', email: 'sato@rookiesmart.jp', role: 'member', initial: '佐' },
  { id: 'u5', name: '高橋 三郎', email: 'takahashi@rookiesmart.jp', role: 'member', initial: '高' },
]

const MONTHLY_TEAM_CREDIT_LIMIT = 5000

export default function SubscriptionPage() {
  return (
    <Suspense fallback={null}>
      <SubscriptionPageContent />
    </Suspense>
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
  const [currentPlan, setCurrentPlan] = useState('sales-director')
  const [confirmDialog, setConfirmDialog] = useState<{
    title: string
    message: string
    confirmLabel: string
    variant: 'primary' | 'danger'
    onConfirm: () => void | Promise<void>
  } | null>(null)
  const [seats, setSeats] = useState(5)
  // テナント単位の1プール構成。サブスク分(月次失効)と購入分(永久有効・解約時失効)を別管理
  const [subscriptionCredit, setSubscriptionCredit] = useState({
    limitCredits: MONTHLY_TEAM_CREDIT_LIMIT,
    usedCredits: 0,
    remainingCredits: MONTHLY_TEAM_CREDIT_LIMIT,
  })
  const [purchasedRemaining, setPurchasedRemaining] = useState(1500) // 購入残(永久有効)
  // 個人クレジットは「今月の自分の消費量」可視化のみ。実際の消費はテナントプールから引かれる
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual')
  const [showBuyCredits, setShowBuyCredits] = useState(false)
  const [creditCheckoutLoading, setCreditCheckoutLoading] = useState(false)
  const [showInviteMember, setShowInviteMember] = useState(false)
  const [showAddSeats, setShowAddSeats] = useState(false)
  const [pendingSeats, setPendingSeats] = useState(seats)
  const [creditsTab, setCreditsTab] = useState<'team' | 'purchased'>('team')
  const [purchaseAmount, setPurchaseAmount] = useState(1000) // 1,000単位
  const [members, setMembers] = useState<Member[]>(SAMPLE_MEMBERS)
  const [openRoleMenuId, setOpenRoleMenuId] = useState<string | null>(null)
  const [inviteRole, setInviteRole] = useState<MemberRole>('member')

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
        }
        if (cancelled) return
        if (data.planId && PLANS.some((p) => p.id === data.planId)) setCurrentPlan(data.planId)
        if (data.billingCycle) setBillingCycle(data.billingCycle)
        if (typeof data.seats === 'number') setSeats(data.seats)
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
        // モック表示を維持する
      }
    }
    void loadSubscription()
    return () => {
      cancelled = true
    }
  }, [])

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
                  const isSelf = m.email === 'h.sawasaka@rookiesmart.jp'
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

        {/* ── Integrations (管理者のみ) ── */}
        {tab === 'integrations' && isAdmin && (
          <div className="mt-12">
            <ObsSectionHeader
              title="連携設定"
              caption="Google Workspace / Microsoft 365 / Slack 等の外部サービスとの連携を管理します"
            />
            <div className="mt-6">
              <ObsCard depth="high" padding="lg" radius="xl">
                <div className="flex items-start gap-4">
                  <div
                    className="shrink-0 w-11 h-11 rounded-[var(--radius-obs-md)] flex items-center justify-center"
                    style={{
                      background:
                        'linear-gradient(135deg, var(--color-obs-primary) 0%, var(--color-obs-primary-container) 100%)',
                    }}
                  >
                    <Plug size={18} style={{ color: 'var(--color-obs-on-primary)' }} />
                  </div>
                  <div className="flex-1">
                    <h3
                      className="font-[family-name:var(--font-display)] text-lg font-semibold tracking-[-0.02em]"
                      style={{ color: 'var(--color-obs-text)' }}
                    >
                      外部サービス連携
                    </h3>
                    <p
                      className="text-[13px] mt-1.5 leading-relaxed"
                      style={{ color: 'var(--color-obs-text-muted)' }}
                    >
                      Google Workspace (Gmail / カレンダー / Drive / Meet)・Microsoft 365・Slack・gBizINFO
                      など、外部サービスとの接続・OAuth 認証・同期設定は連携設定画面で管理します。
                    </p>
                    <a
                      href="/settings/integrations"
                      className="mt-5 inline-flex items-center gap-2 rounded-[var(--radius-obs-md)] px-4 py-2.5 text-[13px] font-semibold transition-colors"
                      style={{
                        background:
                          'linear-gradient(135deg, var(--color-obs-primary) 0%, var(--color-obs-primary-container) 100%)',
                        color: 'var(--color-obs-on-primary)',
                      }}
                    >
                      連携設定を開く
                      <ExternalLink size={14} />
                    </a>
                  </div>
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
