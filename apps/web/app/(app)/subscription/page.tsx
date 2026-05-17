'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { CreditCard, Zap, Plus, Minus, Check, Star, Crown, X, Wrench, Send, ChevronRight, Users, Mail, Shield, UserPlus, MessageCircle, Trash2, Sparkles, Database, TrendingUp } from 'lucide-react'
import {
  ObsButton,
  ObsCard,
  ObsHero,
  ObsPageShell,
  ObsSectionHeader,
} from '@/components/obsidian'

// ─── プラン定義 ─────────────────────────────────────────

interface Plan {
  id: string
  name: string
  tagline: string
  priceMonthly: number
  priceAnnual: number
  credits: number
  minSeats: number
  maxSeats?: number           // 上限シート数(Freeプラン用)
  baseLabel?: string          // 下位プラン全機能ラベル (例: "Standard全機能")
  additions: string[]         // このプランで追加される機能
  icon: React.ElementType
  popular?: boolean
  isFree?: boolean            // Freeプラン判定
}

const PLANS: Plan[] = [
  {
    id: 'lite',
    name: 'Lite',
    tagline: '営業1-3名の小規模チームに最適',
    priceMonthly: 4300,
    priceAnnual: 3000,
    credits: 300,
    minSeats: 1,
    additions: [
      'AIモデル: Gemini 2.5 Flash Lite / シンキングモード 標準',
      'CRM全機能 (企業・コンタクト・取引・パイプライン)',
      'Google Workspace・Microsoft 365 連携 + 議事録自動取得 (BANT自動入力)',
      'メール配信 + 1stパーティ計測・効果測定',
      '企業DB(290万社) + 求人インテント',
      '開発優先度分析 (ニーズ・課題の一次情報抽出 → 集計 → 優先順位づけ)',
      '500クレジットで ワンクリック通話 + コール議事録自動作成',
      '担当者へのチャット相談 (10シート以上で付帯)',
    ],
    icon: Zap,
  },
  {
    id: 'standard',
    name: 'Standard',
    tagline: 'AI品質と通話機能で営業を本格運用',
    priceMonthly: 8300,
    priceAnnual: 5800,
    credits: 1000,
    minSeats: 1,
    baseLabel: 'Lite全機能',
    additions: [
      'AIモデル: GPT-4o mini にアップグレード (品質・精度向上)',
      'シンキングモード: 拡張',
      '外部リサーチ (ウェブ検索)',
      '担当者へのチャット相談 (5シート以上で付帯)',
    ],
    icon: TrendingUp,
  },
  {
    id: 'pro',
    name: 'PRO',
    tagline: 'エージェントとブラウザ操作で営業を自動化',
    priceMonthly: 13000,
    priceAnnual: 9000,
    credits: 2000,
    minSeats: 1,
    baseLabel: 'Standard全機能',
    additions: [
      'AIモデル: GPT-4o mini / GPT-4o を選択可',
      'シンキングモード: 標準 / 拡張 を選択可',
      '外部リサーチ (ウェブ検索)',
      'エージェントモード (チャットからブラウザ自動操作・データ入力)',
      '担当者へのチャット相談 (1シートから付帯)',
    ],
    icon: Star,
    popular: true,
  },
]

// ─── 開発依頼サンプル ─────────────────────────────────────────

// ステータス: submitted(依頼中) / approved(承認済) / in_progress(開発中) / completed(完了) / rejected(却下)
type DevRequestStatus = 'submitted' | 'approved' | 'in_progress' | 'completed' | 'rejected'

// AI見積もり (3軸: 工数 / 検証 / メンテ + 30%バッファ)
interface AiEstimation {
  workHours: number       // 工数 (時間)
  verifyHours: number     // 検証 (時間)
  maintenanceHours: number // メンテ (時間)
  baseAmount: number      // 基準金額 (時間×¥10,000)
  bufferAmount: number    // 30% バッファ
  finalAmount: number     // 最終金額 (1万円単位丸め)
  confidence: 'low' | 'medium' | 'high'
  rationale: string       // AI判断の根拠
}

// 修正依頼の履歴 (1チケットあたり最大3回まで)
interface RevisionEntry {
  id: string
  message: string      // 修正内容
  requestedAt: string
  resolvedAt?: string  // 修正対応完了日時
}

interface DevRequest {
  id: string
  title: string
  description: string
  amount: number
  status: DevRequestStatus
  estimation?: AiEstimation
  progress?: number
  createdAt: string
  expectedDelivery?: string
  // 修正履歴 (3回まで)
  revisions?: RevisionEntry[]
  // 決済情報 (Stripe)
  stripePaymentIntentId?: string
  stripeReceiptUrl?: string
}

// 1チケットあたりの修正可能回数
const REVISION_LIMIT = 3

// AI算出関数 (現状はモック・実装時はLLM呼び出しに差し替え)
function estimateFeatureRequest(title: string, description: string): AiEstimation {
  const totalLength = title.length + description.length

  // 簡易ヒューリスティック (実装時はGPT-4o miniで構造化出力)
  const baseHours = Math.max(2, Math.floor(totalLength / 30))
  const workHours = baseHours
  const verifyHours = Math.max(1, Math.floor(baseHours * 0.4))
  const maintenanceHours = Math.max(0, Math.floor(baseHours * 0.2))

  const totalHours = workHours + verifyHours + maintenanceHours
  const baseAmount = totalHours * 10000
  const bufferAmount = Math.round(baseAmount * 0.3)
  const finalAmount = Math.ceil((baseAmount + bufferAmount) / 10000) * 10000

  const confidence: 'low' | 'medium' | 'high' =
    totalLength < 50 ? 'low' : totalLength < 200 ? 'medium' : 'high'

  const rationale =
    description.length < 100
      ? '入力情報が少ないため概算です。詳細を追記すると精度が向上します。'
      : description.length < 300
        ? '入力内容を分析した中規模の見積もりです。30%の不確実性プレミアムを含みます。'
        : '十分な情報を元に算出した見積もりです。実装にはバッファ込みで対応可能です。'

  return { workHours, verifyHours, maintenanceHours, baseAmount, bufferAmount, finalAmount, confidence, rationale }
}

const SAMPLE_REQUESTS: DevRequest[] = [
  {
    id: 'r1',
    title: '売上レポート改修',
    description: '部署別フィルター追加と新KPI(部門別マージン率)の集計ロジック実装。Excelエクスポートも対応希望。',
    amount: 130000,
    status: 'in_progress',
    progress: 60,
    createdAt: '2026-04-25',
    expectedDelivery: '2026-05-09',
    estimation: {
      workHours: 6, verifyHours: 3, maintenanceHours: 1,
      baseAmount: 100000, bufferAmount: 30000, finalAmount: 130000,
      confidence: 'medium',
      rationale: '既存レポート画面の拡張。中規模の改修・標準的な実装で対応可能。',
    },
    revisions: [
      {
        id: 'rev1',
        message: 'Excelエクスポート時にカラム順序を「部署 → 売上 → マージン率」に変更してほしい',
        requestedAt: '2026-05-02T14:30:00',
        resolvedAt: '2026-05-04T11:00:00',
      },
    ],
    stripePaymentIntentId: 'pi_3ABCdefGHIjklMNop1234',
    stripeReceiptUrl: 'https://pay.stripe.com/receipts/example/r_001',
  },
  {
    id: 'r2',
    title: 'Slack通知追加',
    description: '商談ステージが「PROPOSAL」「CONTRACT」に遷移した際、Slackの#sales-alertsチャンネルに自動通知。担当者・金額・次アクションを含めること。',
    amount: 50000,
    status: 'submitted',
    createdAt: '2026-04-28',
    estimation: {
      workHours: 3, verifyHours: 1, maintenanceHours: 0,
      baseAmount: 40000, bufferAmount: 12000, finalAmount: 50000,
      confidence: 'high',
      rationale: '既存のSlack連携への通知トリガー追加。シンプルな実装で対応可能。',
    },
    revisions: [],
    stripePaymentIntentId: 'pi_3ABCdefGHIjklMNop5678',
    stripeReceiptUrl: 'https://pay.stripe.com/receipts/example/r_002',
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
  { id: 'u1', name: '開発 太郎', email: 'h.sawasaka@rookiesmart.jp', role: 'super_admin', initial: 'N' },
  { id: 'u2', name: '田中 花子', email: 'tanaka@rookiesmart.jp', role: 'member', initial: '田' },
  { id: 'u3', name: '鈴木 一郎', email: 'suzuki@rookiesmart.jp', role: 'member', initial: '鈴' },
  { id: 'u4', name: '佐藤 次郎', email: 'sato@rookiesmart.jp', role: 'member', initial: '佐' },
  { id: 'u5', name: '高橋 三郎', email: 'takahashi@rookiesmart.jp', role: 'member', initial: '高' },
]

export default function SubscriptionPage() {
  // タブ: subscription(プラン・クレジット) / members(メンバー管理) / requests(機能リクエスト)
  const searchParams = useSearchParams()
  const initialTab = (() => {
    const t = searchParams?.get('tab')
    if (t === 'members') return 'members'
    if (t === 'requests') return 'requests'
    return 'subscription'
  })()
  const [tab, setTab] = useState<'subscription' | 'members' | 'requests'>(initialTab)

  // URL ?tab=members / ?tab=requests を反映 (例: メニューから直接遷移した場合)
  useEffect(() => {
    const next = searchParams?.get('tab')
    if (next === 'members') setTab('members')
    else if (next === 'requests') setTab('requests')
    else if (next === 'subscription' || next === null) setTab('subscription')
  }, [searchParams])
  const [currentPlan, setCurrentPlan] = useState('pro')
  // サポートティア: none(なし) / chat(担当者へのチャット相談 ¥50,000) / premium(企業担当付きサポート ¥100,000)
  const [supportTier, setSupportTier] = useState<'none' | 'chat' | 'premium'>('none')
  // データ移行サポート: not_requested(未申込) / requested(申込済) / in_progress(移行中) / completed(完了)
  const [migrationStatus, setMigrationStatus] = useState<'not_requested' | 'requested' | 'in_progress' | 'completed'>('not_requested')
  const [confirmDialog, setConfirmDialog] = useState<{
    title: string
    message: string
    confirmLabel: string
    variant: 'primary' | 'danger'
    onConfirm: () => void
  } | null>(null)
  const [seats, setSeats] = useState(5)
  // テナント単位の1プール構成。サブスク分(月次失効)と購入分(永久有効・解約時失効)を別管理
  const [subscriptionRemaining] = useState(1620) // サブスク残 (5シート × 1000c = 5000c中)
  const [purchasedRemaining] = useState(1500) // 購入残(永久有効)
  // 個人クレジットは「今月の自分の消費量」可視化のみ。実際の消費はテナントプールから引かれる
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual')
  const [showBuyCredits, setShowBuyCredits] = useState(false)
  const [showNewRequest, setShowNewRequest] = useState(false)
  const [showInviteMember, setShowInviteMember] = useState(false)
  const [showAddSeats, setShowAddSeats] = useState(false)
  const [pendingSeats, setPendingSeats] = useState(seats)
  const [creditsTab, setCreditsTab] = useState<'team' | 'purchased'>('team')
  const [purchaseAmount, setPurchaseAmount] = useState(500) // 500単位
  // 機能リクエスト関連
  const [requestTitle, setRequestTitle] = useState('')
  const [requestDescription, setRequestDescription] = useState('')
  const [aiEstimation, setAiEstimation] = useState<AiEstimation | null>(null)
  const [isEstimating, setIsEstimating] = useState(false)
  // 1テナント・1日10回までのAI算出制限 (本番ではDBで管理)
  const [aiEstimateCount, setAiEstimateCount] = useState(0)
  const AI_ESTIMATE_DAILY_LIMIT = 10
  const [requests, setRequests] = useState<DevRequest[]>(SAMPLE_REQUESTS)
  const [selectedRequest, setSelectedRequest] = useState<DevRequest | null>(null)
  // 修正依頼モーダル
  const [revisionTarget, setRevisionTarget] = useState<DevRequest | null>(null)
  const [revisionMessage, setRevisionMessage] = useState('')
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

  // AI見積もりを実行 (現状はモック・本番ではAPI呼出 → LLM)
  const runAiEstimation = async () => {
    if (!requestTitle.trim() || !requestDescription.trim()) return
    if (aiEstimateCount >= AI_ESTIMATE_DAILY_LIMIT) return
    setIsEstimating(true)
    setAiEstimation(null)
    // ローディングを見せるための擬似遅延 (本番では実APIの応答時間でOK)
    await new Promise((r) => setTimeout(r, 1200))
    const result = estimateFeatureRequest(requestTitle, requestDescription)
    setAiEstimation(result)
    setAiEstimateCount((c) => c + 1)
    setIsEstimating(false)
  }

  // モーダル閉じるときにstateをリセット
  const closeNewRequest = () => {
    setShowNewRequest(false)
    setRequestTitle('')
    setRequestDescription('')
    setAiEstimation(null)
    setIsEstimating(false)
  }

  // 修正依頼を送信
  const submitRevision = () => {
    if (!revisionTarget || !revisionMessage.trim()) return
    const newRevision: RevisionEntry = {
      id: `rev-${Date.now()}`,
      message: revisionMessage.trim(),
      requestedAt: new Date().toISOString(),
    }
    setRequests((prev) =>
      prev.map((r) =>
        r.id === revisionTarget.id
          ? { ...r, revisions: [...(r.revisions ?? []), newRevision] }
          : r,
      ),
    )
    // 詳細モーダルが開いていれば反映
    setSelectedRequest((prev) =>
      prev && prev.id === revisionTarget.id
        ? { ...prev, revisions: [...(prev.revisions ?? []), newRevision] }
        : prev,
    )
    setRevisionTarget(null)
    setRevisionMessage('')
  }

  const STATUS_META: Record<DevRequestStatus, { label: string; bg: string; fg: string }> = {
    submitted: { label: '依頼中', bg: 'rgba(255,193,7,0.14)', fg: '#FFC107' },
    approved: { label: '承認済', bg: 'rgba(171,199,255,0.14)', fg: 'var(--color-obs-primary)' },
    in_progress: { label: '開発中', bg: 'rgba(80,200,255,0.14)', fg: '#50C8FF' },
    completed: { label: '完了', bg: 'rgba(75,200,140,0.14)', fg: '#4BC88C' },
    rejected: { label: '却下', bg: 'rgba(255,90,90,0.14)', fg: '#FF5A5A' },
  }


  const currentPlanData = PLANS.find((p) => p.id === currentPlan)
  const subscriptionTotal = (currentPlanData?.credits ?? 0) * seats // 今月のサブスク付与量
  const subscriptionUsagePct = subscriptionTotal > 0 ? (subscriptionRemaining / subscriptionTotal) * 100 : 0

  const formatPrice = (n: number) => `¥${n.toLocaleString()}`
  const CREDIT_UNIT_PRICE = 10 // ¥10 per credit (¥5,000 / 500c)
  const CREDIT_STEP = 500 // 500-unit step

  return (
    <ObsPageShell>
      <div className="w-full px-8 xl:px-12 2xl:px-16 pb-16">
        <ObsHero
          eyebrow="Subscription"
          title="プラン・クレジット"
          caption="クレジット利用状況とプラン管理。必要な量だけチャージして利用。"
          action={
            isSuperAdmin && tab === 'subscription' ? (
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
              { key: 'subscription', label: 'プラン・クレジット', icon: CreditCard },
              { key: 'members',      label: 'メンバー管理',       icon: Users },
              { key: 'requests',     label: '機能リクエスト',     icon: Wrench },
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
        {tab === 'subscription' && isAdmin && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <ObsCard depth="high" padding="lg" radius="xl" className="relative overflow-hidden">
            <div
              style={{
                position: 'absolute', top: '-20%', right: '-10%', width: '300px', height: '300px',
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
                  {([
                    { id: 'team', label: 'チーム' },
                    { id: 'purchased', label: '追加クレジット' },
                  ] as const).map((t) => (
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
                    {creditsTab === 'team'
                      ? `/ ${subscriptionTotal.toLocaleString()} cr`
                      : 'cr'}
                  </span>
                </div>

                {/* タブ別の補足情報 */}
                {creditsTab === 'purchased' && (
                  <p className="text-[11.5px] mt-2" style={{ color: 'var(--color-obs-text-muted)' }}>
                    サブスク残が無くなった時から消費されます。有効期限なし(解約時に失効)。
                  </p>
                )}
                {creditsTab === 'team' && (
                  <p className="text-[11.5px] mt-2" style={{ color: 'var(--color-obs-text-muted)' }}>
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
                    <span className="text-[12px]" style={{ color: 'var(--color-obs-text-muted)' }}>
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
                    今月使用:{' '}
                    {(subscriptionTotal - subscriptionRemaining).toLocaleString()} cr
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
        {tab === 'subscription' && !isAdmin && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <ObsCard depth="high" padding="lg" radius="xl" className="relative overflow-hidden">
              <div
                style={{
                  position: 'absolute', top: '-20%', right: '-10%', width: '300px', height: '300px',
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
                  {([
                    { id: 'team', label: 'チーム' },
                    { id: 'purchased', label: '追加クレジット' },
                  ] as const).map((t) => (
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
                    {creditsTab === 'team'
                      ? `/ ${subscriptionTotal.toLocaleString()} cr`
                      : 'cr'}
                  </span>
                </div>

                {/* タブ別の補足情報 */}
                {creditsTab === 'purchased' && (
                  <p className="text-[11.5px] mt-2" style={{ color: 'var(--color-obs-text-muted)' }}>
                    サブスク残が無くなった時から消費されます。有効期限なし(解約時に失効)。
                  </p>
                )}
                {creditsTab === 'team' && (
                  <p className="text-[11.5px] mt-2" style={{ color: 'var(--color-obs-text-muted)' }}>
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

        {/* ── Plans (特権管理者のみ・お金回り) ── */}
        {tab === 'subscription' && isSuperAdmin && (
        <div className="mt-8">
          <div className="flex items-end justify-between mb-5">
            <div>
              <ObsSectionHeader
                title="プランを選択"
                caption="シート単位の課金。年間契約で約30%お得になります"
              />
            </div>
            {/* Billing cycle toggle */}
            <div
              className="inline-flex p-1 rounded-[var(--radius-obs-md)]"
              style={{ backgroundColor: 'var(--color-obs-surface-high)' }}
            >
              <button
                onClick={() => setBillingCycle('monthly')}
                className="px-4 py-1.5 rounded-[var(--radius-obs-sm)] text-[12px] font-medium transition-colors"
                style={{
                  backgroundColor:
                    billingCycle === 'monthly' ? 'var(--color-obs-surface-highest)' : 'transparent',
                  color:
                    billingCycle === 'monthly'
                      ? 'var(--color-obs-text)'
                      : 'var(--color-obs-text-muted)',
                }}
              >
                月間
              </button>
              <button
                onClick={() => setBillingCycle('annual')}
                className="px-4 py-1.5 rounded-[var(--radius-obs-sm)] text-[12px] font-medium transition-colors flex items-center gap-1.5"
                style={{
                  backgroundColor:
                    billingCycle === 'annual' ? 'var(--color-obs-surface-highest)' : 'transparent',
                  color:
                    billingCycle === 'annual'
                      ? 'var(--color-obs-text)'
                      : 'var(--color-obs-text-muted)',
                }}
              >
                年間
                <span
                  className="text-[9px] font-semibold px-1.5 py-[1px] rounded-full"
                  style={{
                    backgroundColor: 'rgba(171,199,255,0.18)',
                    color: 'var(--color-obs-primary)',
                  }}
                >
                  約30%お得
                </span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {PLANS.map((plan, i) => {
              const Icon = plan.icon
              const isCurrent = currentPlan === plan.id
              const price = billingCycle === 'annual' ? plan.priceAnnual : plan.priceMonthly
              return (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.08, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                >
                  <ObsCard
                    depth={isCurrent ? 'highest' : 'high'}
                    padding="lg"
                    radius="xl"
                    className="relative h-full flex flex-col"
                  >
                    <div
                      className="w-11 h-11 rounded-[var(--radius-obs-md)] flex items-center justify-center mb-4"
                      style={{
                        background:
                          'linear-gradient(135deg, var(--color-obs-primary) 0%, var(--color-obs-primary-container) 100%)',
                      }}
                    >
                      <Icon size={20} style={{ color: 'var(--color-obs-on-primary)' }} />
                    </div>

                    <h3
                      className="font-[family-name:var(--font-display)] text-lg font-semibold tracking-[-0.02em] mb-1"
                      style={{ color: 'var(--color-obs-text)' }}
                    >
                      {plan.name}
                    </h3>
                    <p
                      className="text-[11.5px] mb-3"
                      style={{ color: 'var(--color-obs-text-subtle)' }}
                    >
                      {plan.tagline}
                    </p>
                    <div className="flex items-baseline gap-1 mb-1">
                      {plan.isFree ? (
                        <span
                          className="font-[family-name:var(--font-display)] text-[30px] font-bold tracking-[-0.03em]"
                          style={{ color: 'var(--color-obs-text)' }}
                        >
                          ¥0
                        </span>
                      ) : (
                        <>
                          <span
                            className="font-[family-name:var(--font-display)] text-[30px] font-bold tracking-[-0.03em]"
                            style={{ color: 'var(--color-obs-text)' }}
                          >
                            {formatPrice(price)}
                          </span>
                          <span className="text-[13px]" style={{ color: 'var(--color-obs-text-muted)' }}>
                            /seat /月
                          </span>
                        </>
                      )}
                    </div>
                    <p
                      className="text-[12px] font-medium tabular-nums mb-1"
                      style={{ color: 'var(--color-obs-primary)' }}
                    >
                      月間 {plan.credits.toLocaleString()} クレジット{plan.isFree ? ' (テナント全体)' : '込 / seat'}
                    </p>
                    <p
                      className="text-[11px] mb-4"
                      style={{ color: 'var(--color-obs-text-subtle)' }}
                    >
                      {plan.maxSeats
                        ? `最大${plan.maxSeats}シートまで`
                        : `${plan.minSeats}シートから購入可能`}
                    </p>


                    <div
                      className={
                        plan.isFree
                          ? 'mb-6 flex-1 flex flex-col justify-center'
                          : 'space-y-2 mb-6 flex-1'
                      }
                    >
                      {/* 下位プラン継承 */}
                      {plan.baseLabel && (
                        <>
                          <div className="flex items-start gap-2">
                            <Check
                              size={13}
                              className="shrink-0 mt-0.5"
                              strokeWidth={2.5}
                              style={{ color: 'var(--color-obs-low)' }}
                            />
                            <span
                              className="text-[12.5px] leading-relaxed font-medium"
                              style={{ color: 'var(--color-obs-text)' }}
                            >
                              {plan.baseLabel}
                            </span>
                          </div>

                          {/* + 区切り */}
                          <div className="flex items-center gap-2 pl-[3px] py-1">
                            <Plus
                              size={12}
                              strokeWidth={3}
                              style={{ color: 'var(--color-obs-primary)' }}
                            />
                            <div
                              className="flex-1 h-px"
                              style={{ backgroundColor: 'rgba(171,199,255,0.18)' }}
                            />
                          </div>
                        </>
                      )}

                      {/* 追加機能 */}
                      {plan.additions.map((f, j) => (
                        <div
                          key={j}
                          className={
                            plan.isFree
                              ? 'flex items-center justify-center gap-2'
                              : 'flex items-start gap-2'
                          }
                        >
                          <Check
                            size={13}
                            className={plan.isFree ? 'shrink-0' : 'shrink-0 mt-0.5'}
                            strokeWidth={2.5}
                            style={{ color: 'var(--color-obs-low)' }}
                          />
                          <span
                            className="text-[12.5px] leading-relaxed"
                            style={{ color: 'var(--color-obs-text-muted)' }}
                          >
                            {f}
                          </span>
                        </div>
                      ))}
                    </div>

                    {isCurrent ? (
                      <div className="w-full flex flex-col" style={{ minHeight: isAdmin ? 88 : 40 }}>
                        {isAdmin && (
                          <button
                            onClick={() => {
                              setPendingSeats(Math.max(seats, plan.minSeats))
                              setShowAddSeats(true)
                            }}
                            className="w-full mb-2 h-10 rounded-[var(--radius-obs-md)] flex items-center justify-center gap-2 text-[13px] font-semibold transition-colors"
                            style={{
                              backgroundColor: 'var(--color-obs-surface-highest)',
                              color: 'var(--color-obs-text)',
                              boxShadow: 'inset 0 0 0 1px rgba(171,199,255,0.20)',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = 'rgba(171,199,255,0.10)'
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = 'var(--color-obs-surface-highest)'
                            }}
                          >
                            <Users size={14} style={{ color: 'var(--color-obs-primary)' }} />
                            シート数を変更
                            <span
                              className="text-[11.5px] font-medium px-2 py-[2px] rounded-full ml-0.5"
                              style={{
                                backgroundColor: 'rgba(171,199,255,0.16)',
                                color: 'var(--color-obs-primary)',
                              }}
                            >
                              現在 {Math.max(seats, plan.minSeats)} 名
                            </span>
                          </button>
                        )}
                        <div
                          className="w-full h-10 rounded-[var(--radius-obs-md)] flex items-center justify-center text-[13px] font-semibold"
                          style={{
                            background:
                              'linear-gradient(135deg, var(--color-obs-primary) 0%, var(--color-obs-primary-container) 100%)',
                            color: 'var(--color-obs-on-primary)',
                          }}
                        >
                          現在のプラン
                        </div>
                      </div>
                    ) : isAdmin ? (
                      (() => {
                        const PLAN_RANK: Record<string, number> = { free: 0, lite: 1, standard: 2, pro: 3 }
                        const isDowngrade =
                          (PLAN_RANK[plan.id] ?? 0) < (PLAN_RANK[currentPlan] ?? 0)
                        const isFreePlan = plan.id === 'free'
                        return (
                          <div className="w-full flex flex-col justify-end" style={{ minHeight: 88 }}>
                          <button
                            onClick={() => {
                              const targetPrice =
                                billingCycle === 'annual' ? plan.priceAnnual : plan.priceMonthly
                              const priceMessage = isFreePlan
                                ? '無料プランへ切り替えます。'
                                : `変更後の料金は ¥${targetPrice.toLocaleString()}/seat/月 になります。`
                              setConfirmDialog({
                                title: isDowngrade
                                  ? `${plan.name} プランへダウングレード`
                                  : `${plan.name} プランへ変更`,
                                message: `${priceMessage}${
                                  isDowngrade
                                    ? isFreePlan
                                      ? '\n\nFreeプランの制約: 最大3シート / 月300クレジットのみ。クレジット切れ時は全機能停止します。一部機能(求人インテント / GPT-4o / 外部リサーチなど)は利用できなくなります。'
                                      : '\n\n一部機能(GPT-4o / 外部リサーチなど)は利用できなくなります。'
                                    : ''
                                }`,
                                confirmLabel: isDowngrade ? 'ダウングレードする' : '変更する',
                                variant: isDowngrade ? 'danger' : 'primary',
                                onConfirm: () => setCurrentPlan(plan.id),
                              })
                            }}
                            className="w-full h-10 rounded-[var(--radius-obs-md)] text-[13px] font-medium transition-colors"
                            style={
                              isDowngrade
                                ? {
                                    backgroundColor: 'transparent',
                                    color: 'var(--color-obs-text-muted)',
                                    boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.08)',
                                  }
                                : {
                                    background:
                                      'linear-gradient(135deg, var(--color-obs-primary) 0%, var(--color-obs-primary-container) 100%)',
                                    color: 'var(--color-obs-on-primary)',
                                    fontWeight: 600,
                                  }
                            }
                          >
                            {isDowngrade
                              ? 'ダウングレード'
                              : isFreePlan
                                ? '無料で始める'
                                : 'プランを変更'}
                          </button>
                          </div>
                        )
                      })()
                    ) : (
                      <div className="w-full flex flex-col justify-end" style={{ minHeight: 88 }}>
                        <div
                          className="w-full h-10 rounded-[var(--radius-obs-md)] flex items-center justify-center text-[12px]"
                          style={{
                            backgroundColor: 'transparent',
                            color: 'var(--color-obs-text-subtle)',
                            boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.06)',
                          }}
                        >
                          管理者のみ変更可
                        </div>
                      </div>
                    )}
                  </ObsCard>
                </motion.div>
              )
            })}
          </div>

        </div>
        )}

        {/* ── サポートオプション (特権管理者のみ・お金回り) ── */}
        {tab === 'subscription' && isSuperAdmin && (
        <div className="mt-12">
          <ObsSectionHeader
            title="サポートオプション"
            caption="運用の伴走レベルに応じて2つのプランから選択。テナント単位の追加オプション"
          />

          <div className="grid gap-4 md:grid-cols-2">
            {/* チャット相談プラン (¥50,000) */}
            <ObsCard
              depth="high"
              padding="lg"
              radius="xl"
              className={
                supportTier === 'chat'
                  ? 'relative overflow-hidden h-full flex flex-col ring-2 ring-[var(--color-obs-primary)]'
                  : 'relative overflow-hidden h-full flex flex-col'
              }
            >
              <div
                style={{
                  position: 'absolute', top: '-30%', right: '-10%', width: '320px', height: '320px',
                  background: supportTier === 'chat'
                    ? 'radial-gradient(circle, rgba(75,200,140,0.10) 0%, transparent 70%)'
                    : 'radial-gradient(circle, rgba(171,199,255,0.08) 0%, transparent 70%)',
                  pointerEvents: 'none',
                }}
              />
              <div className="relative flex flex-col flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="w-11 h-11 rounded-[var(--radius-obs-md)] flex items-center justify-center"
                    style={{
                      background:
                        'linear-gradient(135deg, var(--color-obs-surface-highest) 0%, var(--color-obs-surface-high) 100%)',
                      boxShadow: 'inset 0 0 0 1px rgba(171,199,255,0.20)',
                    }}
                  >
                    <MessageCircle size={20} style={{ color: 'var(--color-obs-primary)' }} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3
                        className="font-[family-name:var(--font-display)] text-lg font-semibold tracking-[-0.02em]"
                        style={{ color: 'var(--color-obs-text)' }}
                      >
                        担当者へのチャット相談
                      </h3>
                      {supportTier === 'chat' && (
                        <span
                          className="text-[10px] font-semibold px-2 py-[3px] rounded-full uppercase tracking-[0.08em] flex items-center gap-1"
                          style={{
                            backgroundColor: 'rgba(75,200,140,0.14)',
                            color: '#4BC88C',
                          }}
                        >
                          <Check size={10} strokeWidth={3} />
                          利用中
                        </span>
                      )}
                    </div>
                    <p
                      className="text-[12px] mt-0.5"
                      style={{ color: 'var(--color-obs-text-subtle)' }}
                    >
                      お困りごとを気軽にチャットで相談
                    </p>
                  </div>
                </div>

                <div className="space-y-2 mb-5">
                  {[
                    '担当者へのチャット相談 (専属対応)',
                  ].map((f, j) => (
                    <div key={j} className="flex items-start gap-2">
                      <Check
                        size={13}
                        className="shrink-0 mt-0.5"
                        strokeWidth={2.5}
                        style={{ color: 'var(--color-obs-low)' }}
                      />
                      <span
                        className="text-[12.5px] leading-relaxed"
                        style={{ color: 'var(--color-obs-text-muted)' }}
                      >
                        {f}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="flex items-end justify-between pt-4 border-t mt-auto" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                  <div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-[13px]" style={{ color: 'var(--color-obs-text-muted)' }}>+</span>
                      <span
                        className="font-[family-name:var(--font-display)] text-[28px] font-bold tabular-nums tracking-[-0.03em]"
                        style={{ color: 'var(--color-obs-text)' }}
                      >
                        ¥50,000
                      </span>
                    </div>
                    <p className="text-[11px]" style={{ color: 'var(--color-obs-text-subtle)' }}>
                      /月 (テナント単位)
                    </p>
                  </div>
                  {supportTier === 'chat' ? (
                    <button
                      onClick={() =>
                        setConfirmDialog({
                          title: '担当者へのチャット相談 を解除',
                          message:
                            '解除すると、専属担当者へのチャット相談が利用できなくなります。次回請求から ¥50,000/月 が差し引かれます。',
                          confirmLabel: '解除する',
                          variant: 'danger',
                          onConfirm: () => setSupportTier('none'),
                        })
                      }
                      className="px-4 py-2 rounded-[var(--radius-obs-md)] text-[13px] font-medium transition-colors"
                      style={{
                        backgroundColor: 'transparent',
                        color: 'var(--color-obs-text-muted)',
                        boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.08)',
                      }}
                    >
                      解除する
                    </button>
                  ) : (
                    <ObsButton
                      variant={supportTier === 'premium' ? 'ghost' : 'primary'}
                      size="md"
                      onClick={() =>
                        setConfirmDialog({
                          title:
                            supportTier === 'premium'
                              ? '担当者へのチャット相談 へ変更'
                              : '担当者へのチャット相談 を追加',
                          message:
                            supportTier === 'premium'
                              ? '企業担当付きサポート (¥100,000/月) を解除し、担当者へのチャット相談 (¥50,000/月) に切り替えます。次回請求から差額が反映されます。'
                              : '担当者への専属チャット相談がご利用いただけます。月額 ¥50,000(テナント単位) が請求に追加されます。',
                          confirmLabel: supportTier === 'premium' ? '変更する' : '追加する',
                          variant: 'primary',
                          onConfirm: () => setSupportTier('chat'),
                        })
                      }
                    >
                      {supportTier === 'premium' ? 'このプランへ変更' : '追加する'}
                    </ObsButton>
                  )}
                </div>
              </div>
            </ObsCard>

            {/* 企業担当付きサポート (¥100,000) */}
            <ObsCard
              depth="high"
              padding="lg"
              radius="xl"
              className={
                supportTier === 'premium'
                  ? 'relative overflow-hidden h-full flex flex-col ring-2 ring-[var(--color-obs-primary)]'
                  : 'relative overflow-hidden h-full flex flex-col'
              }
            >
              <div
                style={{
                  position: 'absolute', top: '-30%', right: '-10%', width: '320px', height: '320px',
                  background: supportTier === 'premium'
                    ? 'radial-gradient(circle, rgba(75,200,140,0.10) 0%, transparent 70%)'
                    : 'radial-gradient(circle, rgba(171,199,255,0.10) 0%, transparent 70%)',
                  pointerEvents: 'none',
                }}
              />
              <div className="relative flex flex-col flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="w-11 h-11 rounded-[var(--radius-obs-md)] flex items-center justify-center"
                    style={{
                      background:
                        'linear-gradient(135deg, var(--color-obs-primary) 0%, var(--color-obs-primary-container) 100%)',
                    }}
                  >
                    <Crown size={20} style={{ color: 'var(--color-obs-on-primary)' }} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3
                        className="font-[family-name:var(--font-display)] text-lg font-semibold tracking-[-0.02em]"
                        style={{ color: 'var(--color-obs-text)' }}
                      >
                        企業担当付きサポート
                      </h3>
                      {supportTier === 'premium' && (
                        <span
                          className="text-[10px] font-semibold px-2 py-[3px] rounded-full uppercase tracking-[0.08em] flex items-center gap-1"
                          style={{
                            backgroundColor: 'rgba(75,200,140,0.14)',
                            color: '#4BC88C',
                          }}
                        >
                          <Check size={10} strokeWidth={3} />
                          利用中
                        </span>
                      )}
                    </div>
                    <p
                      className="text-[12px] mt-0.5"
                      style={{ color: 'var(--color-obs-text-subtle)' }}
                    >
                      ご導入から運用までの伴走サポート
                    </p>
                  </div>
                </div>

                <div className="space-y-2 mb-5">
                  {/* 下位プラン継承: 担当者へのチャット相談全機能 */}
                  <div className="flex items-start gap-2">
                    <Check
                      size={13}
                      className="shrink-0 mt-0.5"
                      strokeWidth={2.5}
                      style={{ color: 'var(--color-obs-low)' }}
                    />
                    <span
                      className="text-[12.5px] leading-relaxed font-medium"
                      style={{ color: 'var(--color-obs-text)' }}
                    >
                      担当者へのチャット相談 全機能
                    </span>
                  </div>

                  {/* + 区切り */}
                  <div className="flex items-center gap-2 pl-[3px] py-1">
                    <Plus
                      size={12}
                      strokeWidth={3}
                      style={{ color: 'var(--color-obs-primary)' }}
                    />
                    <div
                      className="flex-1 h-px"
                      style={{ backgroundColor: 'rgba(171,199,255,0.18)' }}
                    />
                  </div>

                  {/* 追加: 定例ミーティング + 内訳 */}
                  <div className="flex items-start gap-2">
                    <Check
                      size={13}
                      className="shrink-0 mt-0.5"
                      strokeWidth={2.5}
                      style={{ color: 'var(--color-obs-low)' }}
                    />
                    <div className="flex-1">
                      <p
                        className="text-[12.5px] leading-relaxed"
                        style={{ color: 'var(--color-obs-text-muted)' }}
                      >
                        月1回 1時間 定例ミーティング
                      </p>
                      <ul className="mt-1.5 space-y-1 pl-3">
                        {['設計レビュー', 'カスタム提案', 'ビジネスサポート'].map((sub, k) => (
                          <li
                            key={k}
                            className="text-[11.5px] leading-relaxed flex items-center gap-1.5"
                            style={{ color: 'var(--color-obs-text-subtle)' }}
                          >
                            <span
                              className="w-1 h-1 rounded-full shrink-0"
                              style={{ backgroundColor: 'var(--color-obs-text-subtle)' }}
                            />
                            {sub}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="flex items-end justify-between pt-4 border-t mt-auto" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                  <div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-[13px]" style={{ color: 'var(--color-obs-text-muted)' }}>+</span>
                      <span
                        className="font-[family-name:var(--font-display)] text-[28px] font-bold tabular-nums tracking-[-0.03em]"
                        style={{ color: 'var(--color-obs-text)' }}
                      >
                        ¥100,000
                      </span>
                    </div>
                    <p className="text-[11px]" style={{ color: 'var(--color-obs-text-subtle)' }}>
                      /月 (テナント単位)
                    </p>
                  </div>
                  {supportTier === 'premium' ? (
                    <button
                      onClick={() =>
                        setConfirmDialog({
                          title: '企業担当付きサポート を解除',
                          message:
                            '解除すると、専属担当者によるサポート・月次定例ミーティングが利用できなくなります。次回請求から ¥100,000/月 が差し引かれます。',
                          confirmLabel: '解除する',
                          variant: 'danger',
                          onConfirm: () => setSupportTier('none'),
                        })
                      }
                      className="px-4 py-2 rounded-[var(--radius-obs-md)] text-[13px] font-medium transition-colors"
                      style={{
                        backgroundColor: 'transparent',
                        color: 'var(--color-obs-text-muted)',
                        boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.08)',
                      }}
                    >
                      解除する
                    </button>
                  ) : (
                    <ObsButton
                      variant="primary"
                      size="md"
                      onClick={() =>
                        setConfirmDialog({
                          title:
                            supportTier === 'chat'
                              ? '企業担当付きサポート へ変更'
                              : '企業担当付きサポート を追加',
                          message:
                            supportTier === 'chat'
                              ? '担当者へのチャット相談 (¥50,000/月) を解除し、企業担当付きサポート (¥100,000/月) に切り替えます。次回請求から差額が反映されます。'
                              : '専属担当者によるサポート・月次定例ミーティングがご利用いただけます。月額 ¥100,000(テナント単位) が請求に追加されます。',
                          confirmLabel: supportTier === 'chat' ? '変更する' : '追加する',
                          variant: 'primary',
                          onConfirm: () => setSupportTier('premium'),
                        })
                      }
                    >
                      {supportTier === 'chat' ? 'このプランへ変更' : '追加する'}
                    </ObsButton>
                  )}
                </div>
              </div>
            </ObsCard>
          </div>
        </div>
        )}

        {/* ── 初期費用オプション (特権管理者のみ・お金回り) ── */}
        {tab === 'subscription' && isSuperAdmin && (
        <div className="mt-12">
          <ObsCard
            depth="high"
            padding="lg"
            radius="xl"
            className={
              migrationStatus !== 'not_requested'
                ? 'relative overflow-hidden ring-2 ring-[var(--color-obs-primary)]'
                : 'relative overflow-hidden'
            }
          >
            <div
              style={{
                position: 'absolute', top: '-30%', right: '-10%', width: '400px', height: '400px',
                background: migrationStatus !== 'not_requested'
                  ? 'radial-gradient(circle, rgba(75,200,140,0.10) 0%, transparent 70%)'
                  : 'radial-gradient(circle, rgba(171,199,255,0.10) 0%, transparent 70%)',
                pointerEvents: 'none',
              }}
            />
            <div className="relative grid grid-cols-[1fr_auto] gap-8 items-center">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="w-11 h-11 rounded-[var(--radius-obs-md)] flex items-center justify-center"
                    style={{
                      background:
                        'linear-gradient(135deg, var(--color-obs-primary) 0%, var(--color-obs-primary-container) 100%)',
                    }}
                  >
                    <Database size={20} style={{ color: 'var(--color-obs-on-primary)' }} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3
                        className="font-[family-name:var(--font-display)] text-lg font-semibold tracking-[-0.02em]"
                        style={{ color: 'var(--color-obs-text)' }}
                      >
                        データ移行サポート
                      </h3>
                      {migrationStatus === 'requested' && (
                        <span
                          className="text-[10px] font-semibold px-2 py-[3px] rounded-full uppercase tracking-[0.08em] flex items-center gap-1"
                          style={{
                            backgroundColor: 'rgba(255,193,7,0.14)',
                            color: '#FFC107',
                          }}
                        >
                          申込済
                        </span>
                      )}
                      {migrationStatus === 'in_progress' && (
                        <span
                          className="text-[10px] font-semibold px-2 py-[3px] rounded-full uppercase tracking-[0.08em] flex items-center gap-1"
                          style={{
                            backgroundColor: 'rgba(171,199,255,0.14)',
                            color: 'var(--color-obs-primary)',
                          }}
                        >
                          移行中
                        </span>
                      )}
                      {migrationStatus === 'completed' && (
                        <span
                          className="text-[10px] font-semibold px-2 py-[3px] rounded-full uppercase tracking-[0.08em] flex items-center gap-1"
                          style={{
                            backgroundColor: 'rgba(75,200,140,0.14)',
                            color: '#4BC88C',
                          }}
                        >
                          <Check size={10} strokeWidth={3} />
                          完了
                        </span>
                      )}
                    </div>
                    <p
                      className="text-[12px]"
                      style={{ color: 'var(--color-obs-text-subtle)' }}
                    >
                      既存データを当方で取り込み・項目マッピングまで対応
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-x-6 gap-y-2 mt-4">
                  {[
                    '1時間オンボーディングMTG',
                    'CSV / Excel / スプレッドシート 取込',
                    '項目マッピング・データクレンジング',
                  ].map((f, j) => (
                    <div key={j} className="flex items-start gap-2">
                      <Check
                        size={13}
                        className="shrink-0 mt-0.5"
                        strokeWidth={2.5}
                        style={{ color: 'var(--color-obs-low)' }}
                      />
                      <span
                        className="text-[12.5px] leading-relaxed"
                        style={{ color: 'var(--color-obs-text-muted)' }}
                      >
                        {f}
                      </span>
                    </div>
                  ))}
                </div>

                <p
                  className="text-[11px] mt-4 leading-relaxed"
                  style={{ color: 'var(--color-obs-text-subtle)' }}
                >
                  ※ 取込件数の上限なし。HubSpot / Salesforce からの移行は、各サービスのCSVエクスポート機能でデータをご用意ください。
                </p>
              </div>

              <div className="text-right">
                <p
                  className="text-[10px] font-medium uppercase tracking-[0.1em] mb-1"
                  style={{ color: 'var(--color-obs-text-subtle)' }}
                >
                  初回のみ (買い切り)
                </p>
                <div className="flex items-baseline gap-1 justify-end mb-1">
                  <span className="text-[14px]" style={{ color: 'var(--color-obs-text-muted)' }}>
                    +
                  </span>
                  <span
                    className="font-[family-name:var(--font-display)] text-[34px] font-bold tabular-nums tracking-[-0.03em]"
                    style={{ color: 'var(--color-obs-text)' }}
                  >
                    ¥100,000
                  </span>
                </div>
                <p
                  className="text-[11.5px] mb-4"
                  style={{ color: 'var(--color-obs-text-subtle)' }}
                >
                  一括 (税抜)
                </p>
                {migrationStatus === 'not_requested' ? (
                  <ObsButton
                    variant="primary"
                    size="md"
                    onClick={() =>
                      setConfirmDialog({
                        title: 'データ移行サポートを申込む',
                        message:
                          '初期費用 ¥100,000 (税抜) でデータ移行サポートを申込みます。お申込後、担当者よりCSV/Excel/スプレッドシートのアップロード手順とオンボーディングMTGの日程調整をご案内します。料金は次回請求に追加されます。',
                        confirmLabel: '申込む',
                        variant: 'primary',
                        onConfirm: () => setMigrationStatus('requested'),
                      })
                    }
                  >
                    申込む
                  </ObsButton>
                ) : (
                  <button
                    onClick={() =>
                      setConfirmDialog({
                        title: '申込状況の詳細',
                        message:
                          migrationStatus === 'requested'
                            ? '担当者からのご連絡をお待ちください。3営業日以内にCSVアップロード手順とオンボーディングMTGの日程調整をご案内します。'
                            : migrationStatus === 'in_progress'
                              ? '現在、データ移行作業を進めております。完了次第、担当者よりご連絡いたします。'
                              : 'データ移行が完了しました。お困りのことがあれば担当者までご連絡ください。',
                        confirmLabel: 'OK',
                        variant: 'primary',
                        onConfirm: () => {},
                      })
                    }
                    className="px-4 py-2 rounded-[var(--radius-obs-md)] text-[13px] font-medium transition-colors"
                    style={{
                      backgroundColor: 'transparent',
                      color: 'var(--color-obs-text-muted)',
                      boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.08)',
                    }}
                  >
                    詳細を見る
                  </button>
                )}
              </div>
            </div>
          </ObsCard>
        </div>
        )}

        {/* ── Members (管理者のみ) ── */}
        {tab === 'members' && isAdmin && (
        <div className="mt-12">
          <ObsSectionHeader
            title="メンバー"
            caption="管理者以上がメンバーの招待・削除・権限変更を行えます。プラン編集・クレジット追加・機能リクエストなどお金回りは特権管理者のみ可能です"
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
                              <Crown size={13} className="mt-0.5 shrink-0" style={{ color: '#FFC107' }} />
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
                              style={{ backgroundColor: 'rgba(255,193,7,0.04)', opacity: 0.6 }}
                              title="特権管理者のみがこの役割に変更できます"
                            >
                              <Crown size={13} className="mt-0.5 shrink-0" style={{ color: '#FFC107' }} />
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
                        color: canDelete ? 'var(--color-obs-text-muted)' : 'var(--color-obs-text-subtle)',
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

        {/* ── Custom Dev Requests (機能リクエストタブ・特権管理者のみ) ── */}
        {tab === 'requests' && isSuperAdmin && (
        <div className="mt-12">
          <ObsSectionHeader
            title="機能リクエスト"
            caption="追加機能を1万円単位の希望額で開発依頼。承認時のみ課金され、スキルもしくは全体機能としてサービスに追加されます"
          />

          <ObsCard depth="high" padding="lg" radius="xl">
            {/* Header: Title + Send button */}
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-4">
                <div
                  className="w-11 h-11 rounded-[var(--radius-obs-md)] flex items-center justify-center"
                  style={{
                    background:
                      'linear-gradient(135deg, var(--color-obs-primary) 0%, var(--color-obs-primary-container) 100%)',
                  }}
                >
                  <Wrench size={20} style={{ color: 'var(--color-obs-on-primary)' }} />
                </div>
                <div>
                  <p
                    className="text-[11px] font-medium uppercase tracking-[0.1em] mb-0.5"
                    style={{ color: 'var(--color-obs-text-subtle)' }}
                  >
                    依頼一覧
                  </p>
                  <p
                    className="text-[15px] font-semibold"
                    style={{ color: 'var(--color-obs-text)' }}
                  >
                    {requests.length} 件
                  </p>
                </div>
              </div>
              <ObsButton variant="primary" size="md" onClick={() => setShowNewRequest(true)}>
                <Send size={14} className="inline mr-1.5" />
                機能リクエストを送信
              </ObsButton>
            </div>

            {/* Request list */}
            {requests.length === 0 ? (
              <div
                className="rounded-[var(--radius-obs-md)] p-8 text-center"
                style={{ backgroundColor: 'var(--color-obs-surface-high)' }}
              >
                <p className="text-[13px]" style={{ color: 'var(--color-obs-text-muted)' }}>
                  まだリクエストはありません。「機能リクエストを送信」から最初の提案を作成してください。
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {requests.map((req) => {
                  const meta = STATUS_META[req.status]
                  return (
                    <motion.button
                      key={req.id}
                      whileHover={{ y: -1 }}
                      whileTap={{ scale: 0.995 }}
                      onClick={() => setSelectedRequest(req)}
                      className="group w-full rounded-[var(--radius-obs-md)] p-4 text-left transition-all cursor-pointer"
                      style={{ backgroundColor: 'var(--color-obs-surface-high)' }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--color-obs-surface-highest)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--color-obs-surface-high)'
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1.5">
                            <p
                              className="text-[14px] font-semibold truncate transition-colors"
                              style={{ color: 'var(--color-obs-text)' }}
                            >
                              {req.title}
                            </p>
                            <span
                              className="text-[10px] font-semibold px-2 py-[3px] rounded-full uppercase tracking-[0.08em] whitespace-nowrap"
                              style={{ backgroundColor: meta.bg, color: meta.fg }}
                            >
                              {meta.label}
                            </span>
                          </div>
                          <div
                            className="flex items-center gap-3 text-[11.5px]"
                            style={{ color: 'var(--color-obs-text-subtle)' }}
                          >
                            <span className="font-semibold tabular-nums" style={{ color: 'var(--color-obs-text)' }}>
                              ¥{req.amount.toLocaleString()}
                            </span>
                            <span>依頼日 {req.createdAt}</span>
                          </div>
                        </div>

                        {/* 詳細表示の手がかり */}
                        <div
                          className="flex items-center gap-1 shrink-0 text-[11.5px] font-medium opacity-60 group-hover:opacity-100 transition-opacity"
                          style={{ color: 'var(--color-obs-text-muted)' }}
                        >
                          <span>詳細</span>
                          <ChevronRight
                            size={16}
                            className="transition-transform group-hover:translate-x-0.5"
                          />
                        </div>
                      </div>
                    </motion.button>
                  )
                })}
              </div>
            )}
          </ObsCard>
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
                    onClick={() => {
                      confirmDialog.onConfirm()
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
                      <p className="text-[14px] font-semibold" style={{ color: 'var(--color-obs-text)' }}>
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
                            setPendingSeats((p) =>
                              Math.max(currentPlanData?.minSeats ?? 1, p - 1),
                            )
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
                          現在 {members.length} 名のメンバーが在籍中です。シート数を {pendingSeats} に減らすと、超過分のメンバー({members.length - pendingSeats} 名)はアクセスできなくなります。事前にメンバーを削除してください。
                        </p>
                      </div>
                    )}
                  </div>

                  {/* 料金プレビュー */}
                  {(() => {
                    const pricePerSeat =
                      billingCycle === 'annual'
                        ? currentPlanData?.priceAnnual ?? 0
                        : currentPlanData?.priceMonthly ?? 0
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
                        <div className="flex justify-between text-[13px] pt-2 border-t" style={{ borderColor: 'rgba(171,199,255,0.16)' }}>
                          <span className="font-semibold" style={{ color: 'var(--color-obs-text)' }}>
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
                        members.length >= seats
                          ? 'inset 0 0 0 1px rgba(255,193,7,0.25)'
                          : 'none',
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <Users
                        size={14}
                        style={{
                          color:
                            members.length >= seats
                              ? '#FFC107'
                              : 'var(--color-obs-text-muted)',
                        }}
                      />
                      <p className="text-[12.5px] tabular-nums" style={{ color: 'var(--color-obs-text)' }}>
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
                            inviteRole === 'admin'
                              ? 'rgba(171,199,255,0.16)'
                              : 'transparent',
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
                      <span className="flex items-center gap-1.5" style={{ color: 'var(--color-obs-text-muted)' }}>
                        <span
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ backgroundColor: 'var(--color-obs-primary)' }}
                        />
                        サブスク残 (翌月繰越なし)
                      </span>
                      <span className="font-semibold tabular-nums" style={{ color: 'var(--color-obs-text)' }}>
                        {subscriptionRemaining.toLocaleString()} cr
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[12.5px]">
                      <span className="flex items-center gap-1.5" style={{ color: 'var(--color-obs-text-muted)' }}>
                        <span
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ backgroundColor: '#4BC88C' }}
                        />
                        購入残 (永久繰越)
                      </span>
                      <span className="font-semibold tabular-nums" style={{ color: 'var(--color-obs-text)' }}>
                        {purchasedRemaining.toLocaleString()} cr
                      </span>
                    </div>
                  </div>

                  {/* クレジット数ステッパー(500単位) */}
                  <div>
                    <label
                      className="text-[11px] font-medium uppercase tracking-[0.1em] mb-2 block"
                      style={{ color: 'var(--color-obs-text-subtle)' }}
                    >
                      追加するクレジット数 (500単位)
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
                        ¥{(CREDIT_UNIT_PRICE * 500).toLocaleString()} / 500クレジット
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

                  <ObsButton variant="primary" size="lg" className="w-full">
                    ¥{(purchaseAmount * CREDIT_UNIT_PRICE).toLocaleString()} で購入する
                  </ObsButton>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Request detail modal ── */}
        <AnimatePresence>
          {selectedRequest && (
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div
                className="absolute inset-0 backdrop-blur-sm"
                style={{ backgroundColor: 'rgba(14,14,16,0.72)' }}
                onClick={() => setSelectedRequest(null)}
              />
              <motion.div
                className="relative w-full max-w-[560px] rounded-[var(--radius-obs-xl)] overflow-hidden"
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
                    <Wrench size={16} style={{ color: 'var(--color-obs-primary)' }} />
                    <h2
                      className="font-[family-name:var(--font-display)] text-base font-semibold tracking-[-0.01em]"
                      style={{ color: 'var(--color-obs-text)' }}
                    >
                      依頼詳細
                    </h2>
                  </div>
                  <button
                    onClick={() => setSelectedRequest(null)}
                    className="p-1.5 rounded-full transition-colors hover:bg-[var(--color-obs-surface-high)]"
                  >
                    <X size={16} style={{ color: 'var(--color-obs-text-muted)' }} />
                  </button>
                </div>

                <div className="px-6 pb-6 space-y-5 max-h-[70vh] overflow-y-auto">
                  {/* Status badge */}
                  <div className="flex items-center gap-2">
                    <span
                      className="text-[10px] font-semibold px-2 py-[3px] rounded-full uppercase tracking-[0.08em]"
                      style={{
                        backgroundColor: STATUS_META[selectedRequest.status].bg,
                        color: STATUS_META[selectedRequest.status].fg,
                      }}
                    >
                      {STATUS_META[selectedRequest.status].label}
                    </span>
                    <span className="text-[11.5px]" style={{ color: 'var(--color-obs-text-subtle)' }}>
                      ID: {selectedRequest.id}
                    </span>
                  </div>

                  {/* Title */}
                  <div>
                    <p
                      className="text-[10px] font-medium uppercase tracking-[0.1em] mb-1"
                      style={{ color: 'var(--color-obs-text-subtle)' }}
                    >
                      タイトル
                    </p>
                    <p
                      className="text-[18px] font-semibold leading-tight"
                      style={{ color: 'var(--color-obs-text)' }}
                    >
                      {selectedRequest.title}
                    </p>
                  </div>

                  {/* Amount */}
                  <div>
                    <p
                      className="text-[10px] font-medium uppercase tracking-[0.1em] mb-1"
                      style={{ color: 'var(--color-obs-text-subtle)' }}
                    >
                      希望支払額
                    </p>
                    <p
                      className="font-[family-name:var(--font-display)] text-[28px] font-bold tabular-nums tracking-[-0.03em]"
                      style={{ color: 'var(--color-obs-text)' }}
                    >
                      ¥{selectedRequest.amount.toLocaleString()}
                    </p>
                  </div>

                  {/* Description */}
                  <div>
                    <p
                      className="text-[10px] font-medium uppercase tracking-[0.1em] mb-1.5"
                      style={{ color: 'var(--color-obs-text-subtle)' }}
                    >
                      詳細・要件
                    </p>
                    <div
                      className="rounded-[var(--radius-obs-md)] p-3.5 text-[13px] leading-relaxed whitespace-pre-wrap"
                      style={{
                        backgroundColor: 'var(--color-obs-surface-high)',
                        color: 'var(--color-obs-text-muted)',
                      }}
                    >
                      {selectedRequest.description}
                    </div>
                  </div>

                  {/* Meta + 領収書 */}
                  <div className="grid grid-cols-2 gap-3">
                    <div
                      className="rounded-[var(--radius-obs-md)] p-3.5"
                      style={{ backgroundColor: 'var(--color-obs-surface-high)' }}
                    >
                      <p
                        className="text-[10px] font-medium uppercase tracking-[0.1em] mb-1"
                        style={{ color: 'var(--color-obs-text-subtle)' }}
                      >
                        依頼日
                      </p>
                      <p className="text-[12.5px] tabular-nums" style={{ color: 'var(--color-obs-text)' }}>
                        {selectedRequest.createdAt}
                      </p>
                    </div>
                    {selectedRequest.stripeReceiptUrl && (
                      <a
                        href={selectedRequest.stripeReceiptUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-[var(--radius-obs-md)] p-3.5 transition-colors"
                        style={{ backgroundColor: 'var(--color-obs-surface-high)' }}
                      >
                        <p
                          className="text-[10px] font-medium uppercase tracking-[0.1em] mb-1 flex items-center gap-1"
                          style={{ color: 'var(--color-obs-text-subtle)' }}
                        >
                          <CreditCard size={10} />
                          Stripe領収書
                        </p>
                        <p
                          className="text-[12.5px] flex items-center gap-1"
                          style={{ color: 'var(--color-obs-primary)' }}
                        >
                          領収書を表示 →
                        </p>
                      </a>
                    )}
                  </div>

                  {/* 修正履歴・修正依頼 */}
                  {(selectedRequest.status === 'in_progress' ||
                    selectedRequest.status === 'completed' ||
                    (selectedRequest.revisions && selectedRequest.revisions.length > 0)) && (
                    <div
                      className="rounded-[var(--radius-obs-md)] p-3.5"
                      style={{
                        backgroundColor: 'rgba(171,199,255,0.06)',
                        boxShadow: 'inset 0 0 0 1px rgba(171,199,255,0.16)',
                      }}
                    >
                      {(() => {
                        const used = selectedRequest.revisions?.length ?? 0
                        const remaining = REVISION_LIMIT - used
                        return (
                          <>
                            <div className="flex items-center justify-between mb-2.5">
                              <p
                                className="text-[10.5px] font-medium uppercase tracking-[0.1em] flex items-center gap-1"
                                style={{ color: 'var(--color-obs-primary)' }}
                              >
                                <Wrench size={11} />
                                修正依頼 ({used}/{REVISION_LIMIT}回 使用)
                              </p>
                              <span
                                className="text-[10.5px] font-semibold px-2 py-[2px] rounded-full"
                                style={{
                                  backgroundColor:
                                    remaining > 0
                                      ? 'var(--color-obs-surface-highest)'
                                      : 'rgba(255,90,90,0.14)',
                                  color: remaining > 0 ? 'var(--color-obs-text-muted)' : '#FF5A5A',
                                }}
                              >
                                残り {remaining}/{REVISION_LIMIT}
                              </span>
                            </div>

                            {/* 修正履歴リスト */}
                            {used > 0 && (
                              <div className="space-y-2 mb-3">
                                {selectedRequest.revisions!.map((rev, i) => (
                                  <div
                                    key={rev.id}
                                    className="rounded-[var(--radius-obs-sm)] p-2.5"
                                    style={{
                                      backgroundColor: 'var(--color-obs-surface-highest)',
                                    }}
                                  >
                                    <div className="flex items-center gap-2 mb-1">
                                      <span
                                        className="text-[10px] font-semibold px-1.5 py-[1px] rounded"
                                        style={{
                                          backgroundColor: 'rgba(171,199,255,0.16)',
                                          color: 'var(--color-obs-primary)',
                                        }}
                                      >
                                        #{i + 1}
                                      </span>
                                      <span
                                        className="text-[10.5px] tabular-nums"
                                        style={{ color: 'var(--color-obs-text-subtle)' }}
                                      >
                                        {new Date(rev.requestedAt).toLocaleString('ja-JP', {
                                          month: 'numeric',
                                          day: 'numeric',
                                          hour: '2-digit',
                                          minute: '2-digit',
                                        })}
                                      </span>
                                      {rev.resolvedAt && (
                                        <span
                                          className="text-[10px] font-semibold px-1.5 py-[1px] rounded-full"
                                          style={{
                                            backgroundColor: 'rgba(75,200,140,0.14)',
                                            color: '#4BC88C',
                                          }}
                                        >
                                          ✓ 対応済
                                        </span>
                                      )}
                                    </div>
                                    <p
                                      className="text-[12px] leading-relaxed whitespace-pre-wrap"
                                      style={{ color: 'var(--color-obs-text-muted)' }}
                                    >
                                      {rev.message}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* 修正依頼ボタン */}
                            {remaining > 0 ? (
                              <button
                                onClick={() => {
                                  setRevisionTarget(selectedRequest)
                                  setRevisionMessage('')
                                }}
                                className="w-full h-10 rounded-[var(--radius-obs-md)] text-[12.5px] font-semibold transition-colors flex items-center justify-center gap-1.5"
                                style={{
                                  backgroundColor: 'var(--color-obs-surface-highest)',
                                  color: 'var(--color-obs-text)',
                                  boxShadow: 'inset 0 0 0 1px rgba(171,199,255,0.20)',
                                }}
                              >
                                <Wrench size={13} />
                                修正を依頼する (残り {remaining} 回)
                              </button>
                            ) : (
                              <div
                                className="rounded-[var(--radius-obs-md)] p-3 text-[11.5px] leading-relaxed"
                                style={{
                                  backgroundColor: 'rgba(255,193,7,0.10)',
                                  color: '#FFC107',
                                }}
                              >
                                ⚠ 修正回数の上限({REVISION_LIMIT}回)に達しました。追加の修正は新規リクエストとして送信してください(別途見積もり)。
                              </div>
                            )}
                          </>
                        )
                      })()}
                    </div>
                  )}

                  {/* Action buttons */}
                  <div className="pt-2">
                    <ObsButton variant="primary" size="md" className="w-full" onClick={() => setSelectedRequest(null)}>
                      閉じる
                    </ObsButton>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Revision request modal ── */}
        <AnimatePresence>
          {revisionTarget && (
            <motion.div
              className="fixed inset-0 z-[55] flex items-center justify-center p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div
                className="absolute inset-0 backdrop-blur-sm"
                style={{ backgroundColor: 'rgba(14,14,16,0.78)' }}
                onClick={() => {
                  setRevisionTarget(null)
                  setRevisionMessage('')
                }}
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
                    <Wrench size={16} style={{ color: 'var(--color-obs-primary)' }} />
                    <h2
                      className="font-[family-name:var(--font-display)] text-base font-semibold tracking-[-0.01em]"
                      style={{ color: 'var(--color-obs-text)' }}
                    >
                      修正を依頼
                    </h2>
                  </div>
                  <button
                    onClick={() => {
                      setRevisionTarget(null)
                      setRevisionMessage('')
                    }}
                    className="p-1.5 rounded-full transition-colors hover:bg-[var(--color-obs-surface-high)]"
                  >
                    <X size={16} style={{ color: 'var(--color-obs-text-muted)' }} />
                  </button>
                </div>

                <div className="px-6 pb-6 space-y-4">
                  {/* 対象チケット情報 */}
                  <div
                    className="rounded-[var(--radius-obs-md)] p-3"
                    style={{ backgroundColor: 'var(--color-obs-surface-high)' }}
                  >
                    <p
                      className="text-[10px] font-medium uppercase tracking-[0.1em] mb-1"
                      style={{ color: 'var(--color-obs-text-subtle)' }}
                    >
                      対象チケット
                    </p>
                    <p
                      className="text-[13px] font-semibold"
                      style={{ color: 'var(--color-obs-text)' }}
                    >
                      {revisionTarget.title}
                    </p>
                    <p className="text-[11px] mt-1" style={{ color: 'var(--color-obs-text-subtle)' }}>
                      残り修正回数:{' '}
                      <span
                        className="font-semibold"
                        style={{ color: 'var(--color-obs-text)' }}
                      >
                        {REVISION_LIMIT - (revisionTarget.revisions?.length ?? 0)} / {REVISION_LIMIT}
                      </span>
                    </p>
                  </div>

                  {/* 修正内容入力 */}
                  <div>
                    <label
                      className="text-[11px] font-medium uppercase tracking-[0.1em] mb-1.5 block"
                      style={{ color: 'var(--color-obs-text-subtle)' }}
                    >
                      修正内容 *
                    </label>
                    <textarea
                      rows={5}
                      value={revisionMessage}
                      onChange={(e) => setRevisionMessage(e.target.value)}
                      placeholder="修正してほしい点を具体的に記載してください。例: フィルター項目の順序を入れ替えてほしい / グラフの色を青系に変更してほしい / 等"
                      className="w-full px-3 py-2.5 rounded-[var(--radius-obs-md)] text-[13px] outline-none border-0 resize-none"
                      style={{
                        backgroundColor: 'var(--color-obs-surface-high)',
                        color: 'var(--color-obs-text)',
                      }}
                    />
                  </div>

                  {/* 注意書き */}
                  <div
                    className="p-3 rounded-[var(--radius-obs-md)] text-[11.5px] leading-relaxed space-y-1.5"
                    style={{
                      backgroundColor: 'rgba(255,193,7,0.08)',
                      color: 'var(--color-obs-text-muted)',
                    }}
                  >
                    <p>
                      💡 修正は <strong style={{ color: '#FFC107' }}>元の仕様の範囲内</strong> での対応となります。
                    </p>
                    <p>
                      新機能の追加や仕様変更を伴う内容は、別途新規リクエストとして送信していただく必要があります(別料金が発生します)。
                    </p>
                  </div>

                  {/* アクションボタン */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setRevisionTarget(null)
                        setRevisionMessage('')
                      }}
                      className="flex-1 h-11 rounded-[var(--radius-obs-md)] text-[13px] font-medium transition-colors"
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
                      size="lg"
                      className="flex-1"
                      disabled={!revisionMessage.trim()}
                      onClick={submitRevision}
                    >
                      修正を依頼する
                    </ObsButton>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── New dev request modal ── */}
        <AnimatePresence>
          {showNewRequest && (
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div
                className="absolute inset-0 backdrop-blur-sm"
                style={{ backgroundColor: 'rgba(14,14,16,0.72)' }}
                onClick={closeNewRequest}
              />
              <motion.div
                className="relative w-full max-w-[560px] rounded-[var(--radius-obs-xl)] overflow-hidden"
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
                    <Send size={16} style={{ color: 'var(--color-obs-primary)' }} />
                    <h2
                      className="font-[family-name:var(--font-display)] text-base font-semibold tracking-[-0.01em]"
                      style={{ color: 'var(--color-obs-text)' }}
                    >
                      機能リクエストを送信
                    </h2>
                  </div>
                  <button
                    onClick={closeNewRequest}
                    className="p-1.5 rounded-full transition-colors hover:bg-[var(--color-obs-surface-high)]"
                  >
                    <X size={16} style={{ color: 'var(--color-obs-text-muted)' }} />
                  </button>
                </div>

                <div className="px-6 pb-6 space-y-4 max-h-[80vh] overflow-y-auto">
                  {/* タイトル入力 */}
                  <div>
                    <label
                      className="text-[11px] font-medium uppercase tracking-[0.1em] mb-1.5 block"
                      style={{ color: 'var(--color-obs-text-subtle)' }}
                    >
                      タイトル *
                    </label>
                    <input
                      type="text"
                      value={requestTitle}
                      onChange={(e) => {
                        setRequestTitle(e.target.value)
                        setAiEstimation(null)
                      }}
                      placeholder="例: 売上レポートに部署別フィルター追加"
                      className="w-full px-3 py-2.5 rounded-[var(--radius-obs-md)] text-[13px] outline-none border-0"
                      style={{
                        backgroundColor: 'var(--color-obs-surface-high)',
                        color: 'var(--color-obs-text)',
                      }}
                    />
                  </div>

                  {/* 詳細入力 */}
                  <div>
                    <label
                      className="text-[11px] font-medium uppercase tracking-[0.1em] mb-1.5 block"
                      style={{ color: 'var(--color-obs-text-subtle)' }}
                    >
                      詳細・要件 *
                    </label>
                    <textarea
                      rows={4}
                      value={requestDescription}
                      onChange={(e) => {
                        setRequestDescription(e.target.value)
                        setAiEstimation(null)
                      }}
                      placeholder="期待する成果物・必要な機能・参考画面など。詳しく書くほど見積もり精度が上がります。"
                      className="w-full px-3 py-2.5 rounded-[var(--radius-obs-md)] text-[13px] outline-none border-0 resize-none"
                      style={{
                        backgroundColor: 'var(--color-obs-surface-high)',
                        color: 'var(--color-obs-text)',
                      }}
                    />
                  </div>

                  {/* AI算出セクション */}
                  {!aiEstimation && !isEstimating && (
                    <div>
                      <button
                        onClick={runAiEstimation}
                        disabled={
                          !requestTitle.trim() ||
                          !requestDescription.trim() ||
                          aiEstimateCount >= AI_ESTIMATE_DAILY_LIMIT
                        }
                        className="w-full h-12 rounded-[var(--radius-obs-md)] text-[13.5px] font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                        style={{
                          background:
                            'linear-gradient(135deg, var(--color-obs-primary) 0%, var(--color-obs-primary-container) 100%)',
                          color: 'var(--color-obs-on-primary)',
                        }}
                      >
                        <Sparkles size={15} />
                        AIに見積もりを依頼
                      </button>
                      <p
                        className="text-[11px] mt-2 text-center"
                        style={{ color: 'var(--color-obs-text-subtle)' }}
                      >
                        本日の残り算出回数:{' '}
                        <span style={{ color: 'var(--color-obs-text-muted)' }}>
                          {Math.max(0, AI_ESTIMATE_DAILY_LIMIT - aiEstimateCount)} / {AI_ESTIMATE_DAILY_LIMIT}
                        </span>
                      </p>
                    </div>
                  )}

                  {/* AI算出中 */}
                  {isEstimating && (
                    <div
                      className="rounded-[var(--radius-obs-md)] p-6 flex flex-col items-center gap-3"
                      style={{ backgroundColor: 'var(--color-obs-surface-high)' }}
                    >
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                      >
                        <Sparkles size={24} style={{ color: 'var(--color-obs-primary)' }} />
                      </motion.div>
                      <p className="text-[12.5px] font-medium" style={{ color: 'var(--color-obs-text)' }}>
                        AIが内容を分析しています…
                      </p>
                      <p className="text-[11px]" style={{ color: 'var(--color-obs-text-subtle)' }}>
                        工数 / 検証 / メンテ を算出中
                      </p>
                    </div>
                  )}

                  {/* AI算出結果 */}
                  {aiEstimation && (
                    <div
                      className="rounded-[var(--radius-obs-md)] overflow-hidden"
                      style={{
                        background:
                          'linear-gradient(180deg, rgba(171,199,255,0.10) 0%, rgba(171,199,255,0.04) 100%)',
                        boxShadow: 'inset 0 0 0 1px rgba(171,199,255,0.20)',
                      }}
                    >
                      {/* メイン金額 */}
                      <div className="px-4 pt-4 pb-3">
                        <div className="flex items-center justify-between mb-1.5">
                          <span
                            className="text-[10.5px] font-medium uppercase tracking-[0.1em] flex items-center gap-1"
                            style={{ color: 'var(--color-obs-primary)' }}
                          >
                            <Sparkles size={10} />
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
                            {aiEstimation.confidence === 'high'
                              ? '★★★'
                              : aiEstimation.confidence === 'medium'
                                ? '★★☆'
                                : '★☆☆'}
                          </span>
                        </div>
                        <p
                          className="font-[family-name:var(--font-display)] text-[36px] font-bold tabular-nums tracking-[-0.03em]"
                          style={{ color: 'var(--color-obs-text)' }}
                        >
                          ¥{aiEstimation.finalAmount.toLocaleString()}
                          <span
                            className="text-[14px] font-medium ml-2"
                            style={{ color: 'var(--color-obs-text-subtle)' }}
                          >
                            (税抜)
                          </span>
                        </p>
                      </div>

                      {/* 内訳 (ざっくり) */}
                      <div
                        className="px-4 py-3"
                        style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
                      >
                        <p
                          className="text-[10.5px] font-medium uppercase tracking-[0.1em] mb-2"
                          style={{ color: 'var(--color-obs-text-subtle)' }}
                        >
                          ざっくり内訳
                        </p>
                        <div className="space-y-1.5">
                          {[
                            { label: '工数', hours: aiEstimation.workHours },
                            { label: '検証', hours: aiEstimation.verifyHours },
                            { label: 'メンテ', hours: aiEstimation.maintenanceHours },
                          ].map((item) => (
                            <div
                              key={item.label}
                              className="flex items-center justify-between text-[12px]"
                            >
                              <span style={{ color: 'var(--color-obs-text-muted)' }}>
                                {item.label}
                              </span>
                              <span
                                className="tabular-nums"
                                style={{ color: 'var(--color-obs-text)' }}
                              >
                                約{item.hours}h ・ ¥{(item.hours * 10000).toLocaleString()}
                              </span>
                            </div>
                          ))}
                        </div>
                        <div
                          className="mt-2.5 pt-2.5 space-y-1 text-[11.5px]"
                          style={{ borderTop: '1px dashed rgba(255,255,255,0.08)' }}
                        >
                          <div className="flex items-center justify-between">
                            <span style={{ color: 'var(--color-obs-text-subtle)' }}>
                              基準金額
                            </span>
                            <span
                              className="tabular-nums"
                              style={{ color: 'var(--color-obs-text-muted)' }}
                            >
                              ¥{aiEstimation.baseAmount.toLocaleString()}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span style={{ color: 'var(--color-obs-text-subtle)' }}>
                              不確実性プレミアム (+30%)
                            </span>
                            <span
                              className="tabular-nums"
                              style={{ color: 'var(--color-obs-text-muted)' }}
                            >
                              ¥{aiEstimation.bufferAmount.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* AI判断 */}
                      <div
                        className="px-4 py-3 flex gap-2"
                        style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
                      >
                        <span className="text-[14px] leading-none">💡</span>
                        <p
                          className="text-[11.5px] leading-relaxed"
                          style={{ color: 'var(--color-obs-text-muted)' }}
                        >
                          {aiEstimation.rationale}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* 補足説明 */}
                  <div className="space-y-2">
                    <div
                      className="p-3 rounded-[var(--radius-obs-md)] space-y-1.5"
                      style={{ backgroundColor: 'var(--color-obs-surface-high)' }}
                    >
                      <p
                        className="text-[11.5px] leading-relaxed flex items-start gap-1.5"
                        style={{ color: 'var(--color-obs-text-muted)' }}
                      >
                        <CreditCard size={12} className="shrink-0 mt-0.5" />
                        <span>
                          <strong style={{ color: 'var(--color-obs-text)' }}>決済タイミング:</strong>{' '}
                          「依頼する」を押すとStripeのカード決済画面に進みます。決済完了後に担当者が確認し、
                          却下時は全額返金されます。
                        </span>
                      </p>
                      <p
                        className="text-[11.5px] leading-relaxed flex items-start gap-1.5"
                        style={{ color: 'var(--color-obs-text-muted)' }}
                      >
                        <Wrench size={12} className="shrink-0 mt-0.5" />
                        <span>
                          <strong style={{ color: 'var(--color-obs-text)' }}>修正対応:</strong> 1チケットあたり{REVISION_LIMIT}回まで修正を含みます。
                          ({REVISION_LIMIT}回を超える修正・元仕様外の追加は新規リクエスト扱いとなります)
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* アクションボタン */}
                  {aiEstimation && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => setAiEstimation(null)}
                        className="flex-1 h-11 rounded-[var(--radius-obs-md)] text-[13px] font-medium transition-colors"
                        style={{
                          backgroundColor: 'transparent',
                          color: 'var(--color-obs-text-muted)',
                          boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.08)',
                        }}
                      >
                        詳細を追記して再算出
                      </button>
                      <ObsButton
                        variant="primary"
                        size="lg"
                        className="flex-1"
                        onClick={() => {
                          // TODO: 実装時は Stripe Checkout / PaymentIntent を起動
                          // const intent = await stripe.paymentIntents.create({...})
                          // 決済成功後にチケットを作成する
                          closeNewRequest()
                        }}
                      >
                        <CreditCard size={14} className="inline mr-1.5" />
                        この金額で依頼する
                      </ObsButton>
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ObsPageShell>
  )
}
