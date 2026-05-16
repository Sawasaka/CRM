'use client'

import { useEffect, useRef, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  Plus,
  ArrowUpDown,
  ChevronDown,
  ChevronUp,
  Briefcase,
  X,
  Activity,
  Zap,
  Radio,
  HelpCircle,
  Mail,
  Users,
  Calendar,
} from 'lucide-react'
import {
  ObsButton,
  ObsCard,
  ObsChip,
  ObsHero,
  ObsInput,
  ObsPageShell,
} from '@/components/obsidian'

// ─── Types ─────────────────────────────────────────────────────────────────────

type Rank = 'A' | 'B' | 'C'
// パイプライン(/pipeline)のステージと完全連動
type DealStage =
  | 'IS' | 'NURTURING' | 'MEETING_PLANNED' | 'MEETING_DONE'
  | 'PROJECT_PLANNED' | 'MULTI_MEETING' | 'POC'
  | 'LOST_DEAL' | 'CLOSED_WON' | 'CHURN' | 'LOST'

import { SignalBadge, type Signal } from '@/components/crm/SignalBadge'
import { getCompanyFirstPartySignal } from '@/lib/mock-data/firstPartySignals'

type ChipTone = 'neutral' | 'hot' | 'middle' | 'low' | 'primary'

// 取引詳細(deals/[id])のタスク種別と完全に連動
type NextActionType = 'call' | 'email' | 'meeting' | 'proposal' | 'followup' | 'other' | null
type SortKey = 'name' | 'stage' | 'updatedAt' | 'probability' | 'taskDueAt'
type SortDir = 'asc' | 'desc'

interface Deal {
  id: string
  name: string
  company: string
  contact: string
  owner: string
  rank: Rank
  stage: DealStage
  signal: Signal
  amount: number
  probability: number
  expectedCloseAt: string | null
  updatedAt: string
  nextAction: NextActionType
  taskDueAt: string | null
  progressStatus: string
  nextActionText: string
  emailCount: number
  meetingCount: number
  createdAt: string // YYYY-MM-DD
}

// ─── Mock Data ─────────────────────────────────────────────────────────────────
// 各取引の signal は社名キーで firstPartySignals.ts と連動させる(290万社DBの 1stシグナル列と同じソース)

const MOCK_DEALS: Deal[] = (
  [
    { id: 'd1', name: '株式会社テクノリード - 2026/01/15', company: '株式会社テクノリード', contact: '田中 誠', owner: '田中太郎', rank: 'A', stage: 'CLOSED_WON',     amount: 4800000, probability: 80, expectedCloseAt: '2026-03-31', updatedAt: '2026-03-22', nextAction: 'proposal', taskDueAt: '2026-03-28', progressStatus: '提案フェーズ / 最終見積回答待ち。社内稟議のタイミングに合わせて4/1までに最終見積を回答予定で、CTO鈴木氏の承認を待つフェーズ。', nextActionText: '決裁者(CTO鈴木氏)同席の最終デモ — 4/25 14:00〜 オンサイト。導入後3ヶ月のロードマップとサポート体制も合わせて提示する。', emailCount: 18, meetingCount: 4, createdAt: '2026-01-15' },
    { id: 'd2', name: '株式会社イノベーション - 大型案件',  company: '株式会社イノベーション', contact: '佐々木 拓也', owner: '田中太郎', rank: 'A', stage: 'POC',             amount: 6000000, probability: 90, expectedCloseAt: '2026-03-28', updatedAt: '2026-03-21', nextAction: 'meeting', taskDueAt: '2026-03-26', progressStatus: '口頭合意済 / 契約書ドラフト確認中。法務レビュー通常3営業日。', nextActionText: '契約書の最終レビュー結果を法務から受け取り、押印手配 (クラウドサイン経由)。', emailCount: 24, meetingCount: 6, createdAt: '2026-02-03' },
    { id: 'd3', name: '合同会社フューチャー - 2026/02/01', company: '合同会社フューチャー', contact: '山本 佳子', owner: '鈴木花子', rank: 'A', stage: 'MEETING_PLANNED', amount: 2400000, probability: 40, expectedCloseAt: '2026-04-15', updatedAt: '2026-03-19', nextAction: 'call', taskDueAt: '2026-03-25', progressStatus: 'ヒアリング継続 / 予算確認中。山本氏は決裁権限なしで決裁者の特定が必要。', nextActionText: '2回目商談で要件整理。Zoho CRM との比較軸を当社から提示し優位性を訴求。', emailCount: 6, meetingCount: 1, createdAt: '2026-02-01' },
    { id: 'd4', name: '株式会社グロース - HR導入',        company: '株式会社グロース',    contact: '中村 理恵', owner: '佐藤次郎', rank: 'B', stage: 'MEETING_DONE',    amount: 900000,  probability: 30, expectedCloseAt: '2026-04-30', updatedAt: '2026-03-10', nextAction: 'email', taskDueAt: '2026-03-24', progressStatus: '初期ヒアリング完了 / 費用感共有待ち。予算と優先度の両面で社内調整が必要。', nextActionText: '比較資料を送付後フォローコール。人事部長を巻き込むタイミングを見極めたい。', emailCount: 11, meetingCount: 2, createdAt: '2026-02-12' },
    { id: 'd5', name: '株式会社イノベーション - 初回',    company: '株式会社イノベーション', contact: '佐々木 拓也', owner: '田中太郎', rank: 'A', stage: 'PROJECT_PLANNED', amount: 3600000, probability: 50, expectedCloseAt: '2026-04-20', updatedAt: '2026-03-18', nextAction: 'followup', taskDueAt: '2026-03-30', progressStatus: 'PJ化方針共有済み / 要件定義の優先順位調整中。', nextActionText: '次回キックオフに向けた要件整理ドキュメントを送付し、合意を取る。', emailCount: 27, meetingCount: 7, createdAt: '2026-01-08' },
    { id: 'd6', name: '有限会社サクセス - PoC',          company: '有限会社サクセス',    contact: '小林 健太', owner: '鈴木花子', rank: 'B', stage: 'MULTI_MEETING',  amount: 1800000, probability: 60, expectedCloseAt: '2026-04-10', updatedAt: '2026-03-05', nextAction: 'meeting', taskDueAt: '2026-04-02', progressStatus: '複数回の商談済 / PoC評価フェーズ。現場責任者の評価は良好。', nextActionText: 'PoC終了報告会を設定。経営層を含めた最終ジャッジに繋げる。', emailCount: 14, meetingCount: 5, createdAt: '2026-01-20' },
    { id: 'd7', name: '株式会社ネクスト - 不動産向け',   company: '株式会社ネクスト',    contact: '鈴木 美香', owner: '田中太郎', rank: 'C', stage: 'NURTURING',       amount: 720000,  probability: 35, expectedCloseAt: '2026-04-25', updatedAt: '2026-03-17', nextAction: 'proposal', taskDueAt: '2026-04-05', progressStatus: 'ナーチャリング中 / 不動産業界向けユースケース資料の準備。', nextActionText: '業界事例 + 機能フィット資料を送付し再アプローチのきっかけを作る。', emailCount: 4, meetingCount: 0, createdAt: '2026-03-01' },
    { id: 'd8', name: '株式会社テクノリード - 新規',     company: '株式会社テクノリード', contact: '田中 誠',   owner: '田中太郎', rank: 'A', stage: 'IS',              amount: 1200000, probability: 20, expectedCloseAt: '2026-05-15', updatedAt: '2026-03-23', nextAction: 'call', taskDueAt: null, progressStatus: 'IS段階 / 別事業部からの新規問い合わせ。既存契約とは別案件として進行。', nextActionText: '初回コールで課題ヒアリング。既存契約との関連性を確認し、提案範囲を仮置きする。', emailCount: 2, meetingCount: 0, createdAt: '2026-03-10' },
  ] as Omit<Deal, 'signal'>[]
).map((d) => ({ ...d, signal: (getCompanyFirstPartySignal(d.company) ?? 'Low') as Signal }))

// ─── Stage Config ───────────────────────────────────────────────────────────────

interface StageConfig {
  label: string
  tone: ChipTone
}

const STAGE_CONFIG: Record<DealStage, StageConfig> = {
  IS:              { label: 'IS',             tone: 'low' },
  NURTURING:       { label: 'ナーチャリング', tone: 'primary' },
  MEETING_PLANNED: { label: '商談予定',        tone: 'low' },
  MEETING_DONE:    { label: '商談済み',        tone: 'primary' },
  PROJECT_PLANNED: { label: 'PJ化予定あり',    tone: 'primary' },
  MULTI_MEETING:   { label: '複数商談済み',    tone: 'primary' },
  POC:             { label: 'POC',             tone: 'primary' },
  LOST_DEAL:       { label: '失注',           tone: 'hot' },
  CLOSED_WON:      { label: '受注',           tone: 'low' },
  CHURN:           { label: 'チャーン',       tone: 'hot' },
  LOST:            { label: 'ロスト',         tone: 'neutral' },
}

// パイプラインのSTAGESと同じ並び順
const STAGE_ORDER: DealStage[] = [
  'IS', 'NURTURING', 'MEETING_PLANNED', 'MEETING_DONE',
  'PROJECT_PLANNED', 'MULTI_MEETING', 'POC',
  'LOST_DEAL', 'CLOSED_WON', 'CHURN', 'LOST',
]

const ALL_STAGES = Object.keys(STAGE_CONFIG) as DealStage[]

// ─── Helpers ───────────────────────────────────────────────────────────────────

// YYYY-MM-DD → M/D（短縮表示）
function formatShortDate(iso: string): string {
  if (!iso) return '—'
  const parts = iso.split('-')
  if (parts.length !== 3) return iso
  return `${Number(parts[1])}/${Number(parts[2])}`
}

function SortIcon({ col, sortKey, sortDir }: { col: SortKey; sortKey: SortKey; sortDir: SortDir }) {
  if (col !== sortKey) return <ArrowUpDown size={12} className="ml-1 inline" style={{ color: 'var(--color-obs-text-subtle)' }} />
  return sortDir === 'asc'
    ? <ChevronUp size={12} className="ml-1 inline" style={{ color: 'var(--color-obs-primary)' }} />
    : <ChevronDown size={12} className="ml-1 inline" style={{ color: 'var(--color-obs-primary)' }} />
}

// 行内のテキストセル: 1行に切り詰め、横の展開ボタンで全文ポップオーバー表示
// テキスト本体は行クリック(=取引詳細遷移)を阻害しない
function TruncatableCell({ text, label }: { text: string; label: string }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!open) return
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDoc)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  if (!text) {
    return (
      <span className="text-sm" style={{ color: 'var(--color-obs-text-subtle)' }}>
        —
      </span>
    )
  }

  return (
    <div ref={ref} className="relative min-w-0 flex items-center gap-1.5">
      <span
        className="block flex-1 min-w-0 text-sm truncate transition-colors duration-150"
        style={{ color: 'var(--color-obs-text-muted)' }}
        title={text}
      >
        {text}
      </span>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          setOpen((v) => !v)
        }}
        aria-label={`${label}の詳細を表示`}
        title={open ? '閉じる' : '全文を表示'}
        className="shrink-0 w-7 h-7 rounded-[8px] flex items-center justify-center transition-colors"
        style={{
          backgroundColor: open ? 'var(--color-obs-primary-container)' : 'var(--color-obs-surface-high)',
          color: open ? 'var(--color-obs-on-primary)' : 'var(--color-obs-text-muted)',
        }}
        onMouseOver={(e) => {
          if (open) return
          ;(e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--color-obs-surface-highest)'
          ;(e.currentTarget as HTMLButtonElement).style.color = 'var(--color-obs-text)'
        }}
        onMouseOut={(e) => {
          if (open) return
          ;(e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--color-obs-surface-high)'
          ;(e.currentTarget as HTMLButtonElement).style.color = 'var(--color-obs-text-muted)'
        }}
      >
        <ChevronDown
          size={15}
          strokeWidth={2.2}
          style={{
            transform: open ? 'rotate(180deg)' : 'rotate(0)',
            transition: 'transform 0.15s ease',
          }}
        />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
            className="absolute z-50 top-full right-0 mt-2 w-[360px] max-w-[80vw] p-3.5 rounded-[var(--radius-obs-md)]"
            style={{
              background: 'var(--color-obs-surface-highest)',
              boxShadow: '0 16px 36px rgba(0,0,0,0.45)',
              border: '1px solid var(--color-obs-border)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="text-[10.5px] font-bold tracking-[0.06em] mb-1.5 uppercase"
              style={{ color: 'var(--color-obs-primary)' }}
            >
              {label}
            </div>
            <p
              className="text-[12.5px] leading-relaxed whitespace-pre-wrap"
              style={{ color: 'var(--color-obs-text)' }}
            >
              {text}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function DealsPage() {
  const router = useRouter()
  const [deals, setDeals]               = useState<Deal[]>(MOCK_DEALS)
  const [search, setSearch]             = useState('')
  const [filterStage, setFilterStage]   = useState<DealStage | ''>('')
  const [filterOwner, setFilterOwner]   = useState('')
  const [sortKey, setSortKey]           = useState<SortKey>('updatedAt')
  const [sortDir, setSortDir]           = useState<SortDir>('desc')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [createForm, setCreateForm] = useState({
    name: '', company: '', contact: '', stage: 'IS' as DealStage,
    amount: '', probability: '20', expectedCloseAt: '',
  })

  function handleCreateSubmit() {
    if (!createForm.name.trim() || !createForm.company.trim()) return
    const today = new Date('2026-03-23')
    const newDeal: Deal = {
      id: `d-${Date.now()}`, name: createForm.name.trim(),
      company: createForm.company.trim(), contact: createForm.contact,
      owner: '田中太郎', rank: 'C', stage: createForm.stage, signal: 'Low',
      amount: parseInt(createForm.amount) || 0,
      probability: parseInt(createForm.probability) || 20,
      expectedCloseAt: createForm.expectedCloseAt || null,
      updatedAt: `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`,
      nextAction: null,
      taskDueAt: null,
      progressStatus: '',
      nextActionText: '',
      emailCount: 0,
      meetingCount: 0,
      createdAt: `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`,
    }
    setDeals(prev => [newDeal, ...prev])
    setShowCreateModal(false)
    setCreateForm({ name: '', company: '', contact: '', stage: 'IS', amount: '', probability: '20', expectedCloseAt: '' })
  }

  const ALL_OWNERS = Array.from(new Set(deals.map(d => d.owner)))

  const filtered = useMemo(() => {
    let list = deals
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(d =>
        d.name.toLowerCase().includes(q) ||
        d.company.toLowerCase().includes(q) ||
        d.contact.toLowerCase().includes(q)
      )
    }
    if (filterStage)   list = list.filter(d => d.stage === filterStage)
    if (filterOwner)   list = list.filter(d => d.owner === filterOwner)
    list = [...list].sort((a, b) => {
      let cmp = 0
      if (sortKey === 'name')        cmp = a.name.localeCompare(b.name, 'ja')
      if (sortKey === 'probability') cmp = a.probability - b.probability
      if (sortKey === 'stage')       cmp = STAGE_ORDER.indexOf(a.stage) - STAGE_ORDER.indexOf(b.stage)
      if (sortKey === 'updatedAt')   cmp = a.updatedAt.localeCompare(b.updatedAt)
      if (sortKey === 'taskDueAt')   cmp = (a.taskDueAt ?? '9999').localeCompare(b.taskDueAt ?? '9999')
      return sortDir === 'desc' ? -cmp : cmp
    })
    return list
  }, [deals, search, filterStage, filterOwner, sortKey, sortDir])

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('desc') }
  }

  const hasFilters = !!filterStage || !!filterOwner

  return (
    <ObsPageShell>
      <div className="w-full px-8 xl:px-12 2xl:px-16 pb-16">

        {/* ── Hero ── */}
        <ObsHero
          eyebrow="Deals"
          title="取引"
          caption={`全 ${deals.length.toLocaleString()} 件。ステージと担当者ごとに進捗を管理。`}
          action={
            <ObsButton variant="primary" size="md" onClick={() => setShowCreateModal(true)}>
              <Plus size={14} className="mr-1.5 inline" strokeWidth={2.5} />
              取引を追加
            </ObsButton>
          }
        />

        {/* ── Toolbar ── */}
        <div className="flex items-center gap-2 mb-6 flex-wrap">
          {/* Search */}
          <div className="relative flex-1 min-w-[240px] max-w-md">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: 'var(--color-obs-text-subtle)' }}
            />
            <ObsInput
              type="text"
              placeholder="取引名・会社名・コンタクトで検索..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Stage filter */}
          <select
            value={filterStage}
            onChange={e => setFilterStage(e.target.value as DealStage | '')}
            className="h-8 px-3 text-xs font-medium rounded-[var(--radius-obs-md)] appearance-none cursor-pointer transition-colors outline-none"
            style={{
              backgroundColor: filterStage ? 'var(--color-obs-primary-container)' : 'var(--color-obs-surface-high)',
              color: filterStage ? 'var(--color-obs-on-primary)' : 'var(--color-obs-text-muted)',
            }}
          >
            <option value="">ステージ</option>
            {ALL_STAGES.map(s => (
              <option key={s} value={s}>{STAGE_CONFIG[s].label}</option>
            ))}
          </select>

          {/* Owner filter */}
          <select
            value={filterOwner}
            onChange={e => setFilterOwner(e.target.value)}
            className="h-8 px-3 text-xs font-medium rounded-[var(--radius-obs-md)] appearance-none cursor-pointer transition-colors outline-none"
            style={{
              backgroundColor: filterOwner ? 'var(--color-obs-primary-container)' : 'var(--color-obs-surface-high)',
              color: filterOwner ? 'var(--color-obs-on-primary)' : 'var(--color-obs-text-muted)',
            }}
          >
            <option value="">担当者：全員</option>
            {ALL_OWNERS.map(o => <option key={o} value={o}>{o}</option>)}
          </select>

          <AnimatePresence>
            {hasFilters && (
              <motion.button
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.15 }}
                onClick={() => { setFilterStage(''); setFilterOwner('') }}
                className="inline-flex items-center gap-1 h-8 px-3 rounded-[var(--radius-obs-md)] text-xs font-medium whitespace-nowrap overflow-hidden transition-colors"
                style={{ color: 'var(--color-obs-text-muted)' }}
                onMouseOver={(e) => {
                  ;(e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--color-obs-surface-high)'
                }}
                onMouseOut={(e) => {
                  ;(e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent'
                }}
              >
                <X size={12} />クリア
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {/* ── Stats ── */}
        <div className="flex items-center gap-4 mb-4 flex-wrap">
          <span className="text-xs" style={{ color: 'var(--color-obs-text-subtle)' }}>
            {filtered.length}件表示
          </span>
        </div>

        {/* ── Table ── */}
        <ObsCard depth="low" padding="none" radius="xl">
          {/* Header */}
          <div
            className="grid grid-cols-[220px_72px_1fr_1fr_64px_64px_84px_104px_98px] gap-x-3 px-5 py-3 text-[11px] font-medium tracking-[0.08em] uppercase"
            style={{ color: 'var(--color-obs-text-subtle)' }}
          >
            {[
              { label: '取引名',         key: 'name' as SortKey,       sortable: true,  signal: false },
              { label: '1st シグナル',   key: null,                    sortable: false, signal: true  },
              { label: '進捗',           key: null,                    sortable: false, signal: false },
              { label: 'ネクスト',       key: null,                    sortable: false, signal: false },
              { label: 'メール',         key: null,                    sortable: false, signal: false },
              { label: '商談',           key: null,                    sortable: false, signal: false },
              { label: '作成日',         key: null,                    sortable: false, signal: false },
              { label: '担当者',         key: null,                    sortable: false, signal: false },
              { label: 'ステージ',       key: 'stage' as SortKey,      sortable: true,  signal: false },
            ].map((col, i) => (
              <div
                key={i}
                className={`leading-none flex items-center ${
                  col.sortable ? 'cursor-pointer select-none transition-colors' : ''
                }`}
                onClick={col.key ? () => toggleSort(col.key as SortKey) : undefined}
                onMouseOver={col.sortable ? (e) => {
                  ;(e.currentTarget as HTMLDivElement).style.color = 'var(--color-obs-text-muted)'
                } : undefined}
                onMouseOut={col.sortable ? (e) => {
                  ;(e.currentTarget as HTMLDivElement).style.color = 'var(--color-obs-text-subtle)'
                } : undefined}
              >
                {col.signal ? (
                  <SignalHeader label={col.label} />
                ) : (
                  <>
                    {col.label}
                    {col.sortable && col.key && <SortIcon col={col.key} sortKey={sortKey} sortDir={sortDir} />}
                  </>
                )}
              </div>
            ))}
          </div>

          {/* Rows */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.04 } } }}
          >
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: 'var(--color-obs-surface-high)' }}
                >
                  <Briefcase size={22} style={{ color: 'var(--color-obs-text-subtle)' }} />
                </div>
                <p className="text-sm" style={{ color: 'var(--color-obs-text-muted)' }}>
                  条件に一致する取引が見つかりません
                </p>
              </div>
            ) : (
              filtered.map(deal => {
                const stage = STAGE_CONFIG[deal.stage]

                return (
                  <motion.div
                    key={deal.id}
                    variants={{
                      hidden: { opacity: 0, y: 8 },
                      visible: { opacity: 1, y: 0, transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1] } },
                    }}
                    onClick={() => router.push(`/deals/${deal.id}`)}
                    className="grid grid-cols-[220px_72px_1fr_1fr_64px_64px_84px_104px_98px] gap-x-3 items-center px-5 py-3.5 transition-colors duration-150 group cursor-pointer"
                    style={{
                      transitionTimingFunction: 'var(--ease-liquid)',
                      boxShadow: 'inset 0 -1px 0 0 var(--color-obs-surface)',
                    }}
                    onMouseOver={(e) => {
                      ;(e.currentTarget as HTMLDivElement).style.backgroundColor = 'var(--color-obs-surface-high)'
                    }}
                    onMouseOut={(e) => {
                      ;(e.currentTarget as HTMLDivElement).style.backgroundColor = 'transparent'
                    }}
                  >
                    {/* 取引名 */}
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className="w-7 h-7 rounded-[var(--radius-obs-sm)] flex items-center justify-center shrink-0"
                        style={{ backgroundColor: 'var(--color-obs-surface-highest)' }}
                      >
                        <Briefcase size={13} style={{ color: 'var(--color-obs-text-muted)' }} />
                      </div>
                      <p className="text-sm font-medium truncate min-w-0" style={{ color: 'var(--color-obs-text)' }}>
                        {deal.company}
                      </p>
                    </div>

                    {/* シグナル（1stパーティーデータ） */}
                    <div>
                      <SignalBadge signal={deal.signal} />
                    </div>

                    {/* 進捗（クリックで全文表示） */}
                    <TruncatableCell text={deal.progressStatus} label="進捗" />

                    {/* ネクスト（クリックで全文表示） */}
                    <TruncatableCell text={deal.nextActionText} label="ネクスト" />

                    {/* メール回数 */}
                    <div
                      className="flex items-center gap-1 text-[12.5px] tabular-nums"
                      style={{ color: 'var(--color-obs-text-muted)' }}
                      title={`メール ${deal.emailCount}件`}
                    >
                      <Mail size={11} strokeWidth={2} style={{ color: 'var(--color-obs-text-subtle)' }} />
                      {deal.emailCount}
                    </div>

                    {/* 商談数 */}
                    <div
                      className="flex items-center gap-1 text-[12.5px] tabular-nums"
                      style={{ color: 'var(--color-obs-text-muted)' }}
                      title={`商談 ${deal.meetingCount}件`}
                    >
                      <Users size={11} strokeWidth={2} style={{ color: 'var(--color-obs-text-subtle)' }} />
                      {deal.meetingCount}
                    </div>

                    {/* 作成日 */}
                    <div
                      className="flex items-center gap-1 text-[12px] tabular-nums whitespace-nowrap"
                      style={{ color: 'var(--color-obs-text-muted)' }}
                      title={deal.createdAt}
                    >
                      <Calendar size={11} strokeWidth={2} style={{ color: 'var(--color-obs-text-subtle)' }} />
                      {formatShortDate(deal.createdAt)}
                    </div>

                    {/* 担当者 */}
                    <div className="flex items-center gap-1.5">
                      <div
                        className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-[9px] font-semibold"
                        style={{
                          backgroundColor: 'var(--color-obs-surface-highest)',
                          color: 'var(--color-obs-text)',
                        }}
                      >
                        {deal.owner[0]}
                      </div>
                      <span className="text-sm truncate" style={{ color: 'var(--color-obs-text)' }}>
                        {deal.owner}
                      </span>
                    </div>

                    {/* ステージ */}
                    <div>
                      <ObsChip tone={stage.tone}>
                        {stage.label}
                      </ObsChip>
                    </div>
                  </motion.div>
                )
              })
            )}
          </motion.div>
        </ObsCard>

        {/* ── Create Deal Modal ── */}
        <AnimatePresence>
          {showCreateModal && (
            <>
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
                onClick={() => setShowCreateModal(false)}
              />
              <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none p-4">
                <motion.div
                  initial={{ opacity: 0, scale: 0.96, y: 8 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96, y: 8 }}
                  transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                  className="w-full max-w-[480px] rounded-[var(--radius-obs-xl)] overflow-hidden pointer-events-auto"
                  style={{
                    backgroundColor: 'var(--color-obs-surface-highest)',
                    boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
                  }}
                >
                  <div
                    className="flex items-center justify-between px-6 py-4"
                    style={{ boxShadow: 'inset 0 -1px 0 0 var(--color-obs-surface-low)' }}
                  >
                    <h2 className="text-[16px] font-bold" style={{ color: 'var(--color-obs-text)' }}>
                      取引を追加
                    </h2>
                    <button
                      onClick={() => setShowCreateModal(false)}
                      className="w-7 h-7 rounded-full flex items-center justify-center transition-colors"
                      onMouseOver={(e) => {
                        ;(e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--color-obs-surface-high)'
                      }}
                      onMouseOut={(e) => {
                        ;(e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent'
                      }}
                    >
                      <X size={15} style={{ color: 'var(--color-obs-text-muted)' }} />
                    </button>
                  </div>

                  <div className="px-6 py-4 space-y-3">
                    <div>
                      <label
                        className="text-[11px] font-medium uppercase tracking-[0.05em] block mb-1.5"
                        style={{ color: 'var(--color-obs-text-subtle)' }}
                      >
                        取引名 <span style={{ color: 'var(--color-obs-hot)' }}>*</span>
                      </label>
                      <ObsInput
                        type="text"
                        placeholder="株式会社テクノリード - 2026/03/23"
                        value={createForm.name}
                        onChange={e => setCreateForm(f => ({ ...f, name: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label
                        className="text-[11px] font-medium uppercase tracking-[0.05em] block mb-1.5"
                        style={{ color: 'var(--color-obs-text-subtle)' }}
                      >
                        会社名 <span style={{ color: 'var(--color-obs-hot)' }}>*</span>
                      </label>
                      <ObsInput
                        type="text"
                        placeholder="株式会社テクノリード"
                        value={createForm.company}
                        onChange={e => setCreateForm(f => ({ ...f, company: e.target.value }))}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label
                          className="text-[11px] font-medium uppercase tracking-[0.05em] block mb-1.5"
                          style={{ color: 'var(--color-obs-text-subtle)' }}
                        >
                          コンタクト
                        </label>
                        <ObsInput
                          type="text"
                          placeholder="田中 誠"
                          value={createForm.contact}
                          onChange={e => setCreateForm(f => ({ ...f, contact: e.target.value }))}
                        />
                      </div>
                      <div>
                        <label
                          className="text-[11px] font-medium uppercase tracking-[0.05em] block mb-1.5"
                          style={{ color: 'var(--color-obs-text-subtle)' }}
                        >
                          ステージ
                        </label>
                        <select
                          value={createForm.stage}
                          onChange={e => setCreateForm(f => ({ ...f, stage: e.target.value as DealStage }))}
                          className="w-full h-10 px-4 rounded-[var(--radius-obs-md)] text-sm outline-none"
                          style={{
                            backgroundColor: 'var(--color-obs-surface-lowest)',
                            color: 'var(--color-obs-text)',
                            boxShadow: 'inset 0 0 0 1px rgba(109,106,111,0.12)',
                          }}
                        >
                          {STAGE_ORDER.filter(s => !['CLOSED_WON','LOST_DEAL','CHURN','LOST'].includes(s)).map(s => (
                            <option key={s} value={s}>{STAGE_CONFIG[s].label}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label
                        className="text-[11px] font-medium uppercase tracking-[0.05em] block mb-1.5"
                        style={{ color: 'var(--color-obs-text-subtle)' }}
                      >
                        想定クローズ日
                      </label>
                      <ObsInput
                        type="date"
                        value={createForm.expectedCloseAt}
                        onChange={e => setCreateForm(f => ({ ...f, expectedCloseAt: e.target.value }))}
                        style={{ colorScheme: 'dark' }}
                      />
                    </div>
                  </div>
                  <div
                    className="flex items-center justify-end gap-2 px-6 py-4"
                    style={{ boxShadow: 'inset 0 1px 0 0 var(--color-obs-surface-low)' }}
                  >
                    <ObsButton variant="ghost" onClick={() => setShowCreateModal(false)}>
                      キャンセル
                    </ObsButton>
                    <ObsButton
                      variant="primary"
                      onClick={handleCreateSubmit}
                      disabled={!createForm.name.trim() || !createForm.company.trim()}
                    >
                      追加する
                    </ObsButton>
                  </div>
                </motion.div>
              </div>
            </>
          )}
        </AnimatePresence>
      </div>
    </ObsPageShell>
  )
}

// ─── Signal Header（列見出し：First Party Signal + ?） ────────────────────────
// ヘッダーホバーで「強/中/弱」の判定ロジック（過去7日 × 3チャネル）を端的に説明
function SignalHeader({ label }: { label: string }) {
  const [hover, setHover] = useState(false)
  return (
    <div
      className="relative inline-flex items-center gap-1"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <span>{label}</span>
      <HelpCircle size={11} className="cursor-help" style={{ color: 'var(--color-obs-text-subtle)', opacity: 0.8 }} />
      {hover && (
        <div
          className="absolute left-0 bottom-full mb-1.5 z-30 w-[280px] rounded-[var(--radius-obs-md)] overflow-hidden animate-[fadeIn_0.18s_ease-out] normal-case tracking-normal"
          style={{
            backgroundColor: 'var(--color-obs-surface-highest)',
            boxShadow: '0 -12px 40px rgba(0,0,0,0.5), inset 0 0 0 1px rgba(65,71,83,0.4)',
          }}
        >
          <div
            className="px-3 py-2 flex items-center justify-between"
            style={{ backgroundColor: 'var(--color-obs-surface-low)' }}
          >
            <span className="inline-flex items-center gap-1.5 text-[10.5px] font-bold tracking-[0.1em] uppercase" style={{ color: 'var(--color-obs-primary)' }}>
              <Activity size={11} />
              判定ロジック
            </span>
            <span className="text-[10.5px]" style={{ color: 'var(--color-obs-text-subtle)' }}>
              過去7日
            </span>
          </div>
          <div className="px-3 py-2.5 space-y-2 text-[11.5px]" style={{ color: 'var(--color-obs-text-muted)' }}>
            <p style={{ color: 'var(--color-obs-text-subtle)' }}>
              3チャネル（メール開封 / 資料DL / サイト訪問）の充足度で算出
            </p>
            <div className="flex items-start gap-2">
              <span className="inline-flex items-center gap-1 shrink-0 w-10 h-5 rounded-full justify-center text-[10px] font-bold" style={{ backgroundColor: 'rgba(255,107,107,0.14)', color: 'var(--color-obs-hot)' }}>
                <Zap size={9} strokeWidth={2.4} />強
              </span>
              <span>3つすべて達成</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="inline-flex items-center gap-1 shrink-0 w-10 h-5 rounded-full justify-center text-[10px] font-bold" style={{ backgroundColor: 'rgba(255,184,107,0.14)', color: 'var(--color-obs-middle)' }}>
                <Activity size={9} strokeWidth={2.4} />中
              </span>
              <span>2つ達成、または 資料DL / サイト訪問 のいずれか単独</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="inline-flex items-center gap-1 shrink-0 w-10 h-5 rounded-full justify-center text-[10px] font-bold" style={{ backgroundColor: 'rgba(126,198,255,0.14)', color: 'var(--color-obs-low)' }}>
                <Radio size={9} strokeWidth={2.4} />弱
              </span>
              <span>メール開封のみ</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

