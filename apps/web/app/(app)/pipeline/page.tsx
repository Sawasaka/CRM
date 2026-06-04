'use client'

import { useMemo, useState, useRef, useEffect, DragEvent } from 'react'
import Link from 'next/link'
import {
  Calendar,
  X,
  Check,
  HelpCircle,
  ArrowRight,
  ArrowLeft,
  ChevronDown,
  Clock,
} from 'lucide-react'
import { OBS_HERO_CLASS, OBS_HERO_STYLE, OBS_PRODUCT_SURFACE, ObsPageShell } from '@/components/obsidian'
import { SignalBadge } from '@/components/crm/SignalBadge'

// ─── Types ────────────────────────────────────────────────────────────────────

type IntentSignal = 'Hot' | 'Middle' | 'Low'
type StageKey =
  | 'IS'
  | 'MEETING_PLANNED'
  | 'MEETING_DONE'
  | 'PROJECT_PLANNED'
  | 'MULTI_MEETING'
  | 'POC'
  | 'LOST_DEAL'
  | 'CLOSED_WON'
  | 'CHURN'
  | 'LOST'

interface Deal {
  id: string
  code: string
  name: string
  company: string
  contact: string
  amount: number
  intent: IntentSignal
  owner: string
  stage: StageKey
  order: number
  probability?: number
  dueDate?: string
  lastContact?: string
  priorityPhase?: string
  createdAt: string         // YYYY-MM-DD
  emailCount: number        // 相手とのメール往復数（受信返信含む）
  meetingCount: number      // 実施済み商談回数
  nextAction?: string       // Next Step: 次の一手（取引先マスタでフリーテキスト入力）
  nextActionDate?: string   // Next Step 実施予定日
  status?: string           // Status: 現在の進行状態（取引先マスタでフリーテキスト入力）
  // 経由元（POC移行率テーブルへの自動集計に使用）
  sourceCategory?: SourceCategory
  source?: string           // 個別の経由元名 (例: HP, IT・情シス DXPO 等)
}

// 経由元カテゴリ：POC移行率テーブルの行と一致
type SourceCategory = 'web' | 'referral' | 'partner' | 'event' | 'media'

const INITIAL_DEALS: Deal[] = []

type ApiDeal = {
  id: string
  name: string
  stage: string
  amount: number | null
  probability: number | null
  expectedCloseAt: string | null
  createdAt: string
  updatedAt: string
  nextActionUs: string | null
  desiredService: string | null
  timeline: string | null
  company: { id: string; name: string }
  contact: { id: string; name: string } | null
  owner: { id: string; name: string }
  _count: { emailMessages: number; meetingEvents: number }
}

function toStageKey(stage: string): StageKey {
  const map: Record<string, StageKey> = {
    NEW_LEAD: 'IS',
    QUALIFIED: 'MEETING_PLANNED',
    FIRST_MEETING: 'MEETING_DONE',
    SOLUTION_FIT: 'PROJECT_PLANNED',
    PROPOSAL: 'MULTI_MEETING',
    NEGOTIATION: 'POC',
    VERBAL_COMMIT: 'POC',
    CLOSED_WON: 'CLOSED_WON',
    CLOSED_LOST: 'LOST_DEAL',
  }
  return map[stage] ?? 'IS'
}

function formatShortDate(value: string | null) {
  if (!value) return undefined
  const d = new Date(value)
  return `${d.getMonth() + 1}/${d.getDate()}`
}

function toPipelineDeal(item: ApiDeal, index: number): Deal {
  const createdAt = item.createdAt.slice(0, 10)
  return {
    id: item.id,
    code: item.id.slice(0, 8),
    name: item.name,
    company: item.company.name,
    contact: item.contact?.name ?? '',
    amount: item.amount ?? 0,
    intent: 'Low',
    owner: item.owner.name,
    stage: toStageKey(item.stage),
    order: index,
    probability: item.probability ?? undefined,
    dueDate: formatShortDate(item.expectedCloseAt),
    createdAt,
    emailCount: item._count.emailMessages,
    meetingCount: item._count.meetingEvents,
    status: item.desiredService ?? item.timeline ?? undefined,
    nextAction: item.nextActionUs ?? undefined,
    nextActionDate: formatShortDate(item.expectedCloseAt),
  }
}

// ─── Stages ────────────────────────────────────────────────────────────────────

type StageColor = { accent: string; bg: string; glow: string; text: string }

const STAGE_BLUE_CORE: StageColor = {
  accent: '#abc7ff',
  bg: 'rgba(171,199,255,0.075)',
  glow: 'rgba(171,199,255,0.13)',
  text: '#d5e2ff',
}

const STAGE_BLUE_SKY: StageColor = {
  accent: '#7ec6ff',
  bg: 'rgba(126,198,255,0.072)',
  glow: 'rgba(126,198,255,0.12)',
  text: '#c6e7ff',
}

const STAGE_BLUE_ICE: StageColor = {
  accent: '#8eb7ff',
  bg: 'rgba(142,183,255,0.070)',
  glow: 'rgba(142,183,255,0.12)',
  text: '#d2e0ff',
}

const STAGE_WON_RED: StageColor = {
  accent: '#ff6b7a',
  bg: 'rgba(255,107,122,0.070)',
  glow: 'rgba(255,107,122,0.12)',
  text: '#ffc7cf',
}

const STAGE_AFTER_GREEN: StageColor = {
  accent: '#8dffc9',
  bg: 'rgba(141,255,201,0.070)',
  glow: 'rgba(141,255,201,0.12)',
  text: '#c8ffe6',
}

const STAGES: { key: StageKey; label: string; desc: string; color: StageColor }[] = [
  { key: 'IS',               label: 'IS',             desc: '未商談の企業へアプローチ',
    color: STAGE_BLUE_CORE },
  { key: 'MEETING_PLANNED',  label: '商談予定',       desc: '初回商談がスケジュール済み',
    color: STAGE_BLUE_SKY },
  { key: 'MEETING_DONE',     label: '商談済み',       desc: '初回商談が完了した案件',
    color: STAGE_BLUE_ICE },
  { key: 'PROJECT_PLANNED',  label: 'PJ化予定あり',   desc: '具体的なプロジェクト化が見込める',
    color: STAGE_BLUE_ICE },
  { key: 'MULTI_MEETING',    label: '複数商談済み',   desc: '2回以上の商談を実施済み',
    color: STAGE_BLUE_ICE },
  { key: 'POC',              label: 'POC',            desc: '検証・トライアルを実施中',
    color: STAGE_BLUE_ICE },
  { key: 'CLOSED_WON',       label: '受注',           desc: '契約締結が完了した案件',
    color: STAGE_WON_RED },
  { key: 'LOST_DEAL',        label: '失注',           desc: 'POC後に受注に至らなかった案件',
    color: STAGE_AFTER_GREEN },
  { key: 'CHURN',            label: 'チャーン',       desc: '契約後に解約となった案件',
    color: STAGE_AFTER_GREEN },
  { key: 'LOST',             label: 'ロスト',         desc: '追客を完全に終了した案件',
    color: STAGE_AFTER_GREEN },
]

const SERVICE_PAGE_BACKGROUND = OBS_PRODUCT_SURFACE.pageBackground


// ─── Page ─────────────────────────────────────────────────────────────────────

type ViewMode = 'kanban' | 'funnel'

export default function PipelinePage() {
  const [deals, setDeals] = useState<Deal[]>(INITIAL_DEALS)
  const [loading, setLoading] = useState(true)
  const [ownerFilter, setOwnerFilter] = useState('全員')
  const [dragOverStage, setDragOverStage] = useState<StageKey | null>(null)
  const [view, setView] = useState<ViewMode>('kanban')
  const dragDealId = useRef<string | null>(null)

  const filtered = useMemo(() => {
    if (ownerFilter === '全員') return deals
    return deals.filter((d) => d.owner === ownerFilter)
  }, [deals, ownerFilter])

  const ownerOptions = useMemo(() => {
    return ['全員', ...Array.from(new Set(deals.map((d) => d.owner).filter(Boolean)))]
  }, [deals])

  useEffect(() => {
    let aborted = false
    setLoading(true)
    fetch('/api/deals?take=100', { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : { deals: [] }))
      .then((data: { deals?: ApiDeal[] }) => {
        if (aborted) return
        setDeals((data.deals ?? []).map(toPipelineDeal))
      })
      .catch(() => {
        if (!aborted) setDeals([])
      })
      .finally(() => {
        if (!aborted) setLoading(false)
      })
    return () => {
      aborted = true
    }
  }, [])

  const dealsByStage = useMemo(() => {
    const map = {} as Record<StageKey, Deal[]>
    for (const s of STAGES) map[s.key] = []
    for (const d of filtered) map[d.stage]?.push(d)
    for (const s of STAGES) map[s.key].sort((a, b) => a.order - b.order)
    return map
  }, [filtered])

  function onCardDragStart(e: DragEvent<HTMLDivElement>, dealId: string) {
    dragDealId.current = dealId
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', dealId)
    requestAnimationFrame(() => {
      ;(e.target as HTMLElement).style.opacity = '0.4'
    })
  }
  function onCardDragEnd(e: DragEvent<HTMLDivElement>) {
    ;(e.target as HTMLElement).style.opacity = '1'
    dragDealId.current = null
    setDragOverStage(null)
  }
  function onColumnDragOver(e: DragEvent<HTMLDivElement>, stageKey: StageKey) {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverStage(stageKey)
  }
  function onColumnDragLeave() {
    setDragOverStage(null)
  }
  function onDrop(e: DragEvent<HTMLDivElement>, targetStage: StageKey) {
    e.preventDefault()
    const dealId = dragDealId.current || e.dataTransfer.getData('text/plain')
    if (!dealId) return
    setDeals((prev) => {
      const moving = prev.find((d) => d.id === dealId)
      if (!moving || moving.stage === targetStage) return prev
      const destCount = prev.filter((d) => d.stage === targetStage).length
      return prev.map((d) => (d.id === dealId ? { ...d, stage: targetStage, order: destCount } : d))
    })
    dragDealId.current = null
    setDragOverStage(null)
  }

  return (
    <ObsPageShell>
      <div
        className="w-full min-h-[calc(100vh-56px)] pb-16 relative overflow-hidden"
        style={{
          backgroundColor: 'var(--color-obs-surface)',
          backgroundImage: SERVICE_PAGE_BACKGROUND,
        }}
      >
        <div className="relative w-full px-8 xl:px-12 2xl:px-16 pt-10">
          {/* ── Hero (§15 Section Composition + §12 Service タイポスケール) ── */}
          <div className={`${OBS_HERO_CLASS.body} mb-8`}>
            {/* Eyebrow — §17 Pattern Snippet */}
            <div
              className={OBS_HERO_CLASS.eyebrow}
              style={OBS_HERO_STYLE.eyebrow}
            >
              <span
                className="block w-1.5 h-1.5 rounded-full"
                style={OBS_HERO_STYLE.dot}
              />
              Pipeline
            </div>
            {/* Page Title */}
            <h1
              className={OBS_HERO_CLASS.title}
            >
              <span style={OBS_HERO_STYLE.titleBase}>パイプ</span>
              <span className="fo-gradient-text" style={{ WebkitTextFillColor: 'transparent' }}>ライン</span>
            </h1>
            <p className={OBS_HERO_CLASS.caption} style={OBS_HERO_STYLE.caption}>
              商談フェーズごとの案件を、金額・シグナル・次アクションで管理。
            </p>
          </div>

          {/* ── View Tabs（Segmented Control） ── */}
          <div
            className="inline-flex items-center p-1 rounded-full mb-6 fo-glass-rim"
            style={{
              background: 'rgba(171,199,255,0.04)',
            }}
          >
            {[
              { k: 'kanban' as const, label: 'ステージ', badge: deals.length },
              { k: 'funnel' as const, label: 'レポート' },
            ].map((t) => {
              const active = view === t.k
              return (
                <button
                  key={t.k}
                  onClick={() => setView(t.k)}
                  className="relative z-[1] h-8 px-4 rounded-full text-[12.5px] font-semibold transition-all duration-200 flex items-center gap-2"
                  style={{
                    color: active
                      ? 'var(--color-obs-on-primary)'
                      : 'var(--color-obs-text-muted)',
                    background: active
                      ? 'linear-gradient(140deg, var(--color-obs-primary) 0%, var(--color-obs-primary-container) 100%)'
                      : 'transparent',
                    boxShadow: active
                      ? 'inset 0 1px 0 rgba(255,255,255,0.18), 0 0 0 1px rgba(171,199,255,0.20)'
                      : 'none',
                    transitionTimingFunction: 'var(--ease-liquid)',
                  }}
                >
                  {t.label}
                  {t.badge != null && (
                    <span
                      className="rounded-full px-2 py-0.5 text-[10px] font-semibold tabular-nums leading-none inline-flex items-center"
                      style={{
                        background: active ? 'rgba(255,255,255,0.18)' : 'rgba(171,199,255,0.10)',
                        color: active ? 'var(--color-obs-on-primary)' : 'var(--color-obs-text-subtle)',
                      }}
                    >
                      {t.badge}
                    </span>
                  )}
                </button>
              )
            })}
          </div>

          {view === 'kanban' && (
            <>
              {/* ── Owner Filter — §17 Pill / Chip パターン ── */}
              <div className="flex items-center gap-2 mb-6 flex-wrap">
                {ownerOptions.map((o) => {
                  const active = ownerFilter === o
                  return (
                    <button
                      key={o}
                      onClick={() => setOwnerFilter(o)}
                      className="h-8 px-3.5 rounded-full text-[11.5px] font-semibold transition-all duration-150"
                      style={
                        active
                          ? {
                              background:
                                'linear-gradient(140deg, var(--color-obs-primary) 0%, var(--color-obs-primary-container) 100%)',
                              color: 'var(--color-obs-on-primary)',
                              boxShadow:
                                'inset 0 1px 0 rgba(255,255,255,0.18), 0 0 0 1px rgba(171,199,255,0.20)',
                              transitionTimingFunction: 'var(--ease-liquid)',
                            }
                          : {
                              background: 'rgba(171,199,255,0.06)',
                              color: 'var(--color-obs-text-muted)',
                              boxShadow: 'inset 0 0 0 1px rgba(171,199,255,0.18)',
                              transitionTimingFunction: 'var(--ease-liquid)',
                            }
                      }
                    >
                      {o}
                    </button>
                  )
                })}
                <span
                  className="ml-auto text-[10.5px] uppercase tracking-[0.16em] tabular-nums"
                  style={{ color: 'var(--color-obs-text-subtle)' }}
                >
                  {loading ? '読込中' : `${filtered.length} 件`}
                </span>
              </div>

              {/* ── Kanban — §18 翻訳ガイドで Kanban 全体を覆う背景 gradient は撤去 ── */}
              <div
                className="flex gap-5 overflow-x-auto pb-8 fo-thin-scroll select-none"
              >
            {STAGES.map((stage) => {
              const stageDeals = dealsByStage[stage.key]
              const isOver = dragOverStage === stage.key
              return (
                <div
                  key={stage.key}
                  className="flex-none w-[320px]"
                  onDragOver={(e) => onColumnDragOver(e, stage.key)}
                  onDragLeave={onColumnDragLeave}
                  onDrop={(e) => onDrop(e, stage.key)}
                >
                  {/* Column header — §13 Recipe C (Flat Subtle Container) + stage 色は左 edge のみ */}
                  <div className="mb-3">
                    <div
                      className="rounded-2xl px-3.5 py-3 mb-1.5 relative overflow-hidden"
                      style={{
                        background: 'rgba(171,199,255,0.04)',
                        boxShadow: `inset 2px 0 0 ${stage.color.accent}, inset 0 0 0 1px rgba(171,199,255,0.10)`,
                      }}
                    >
                      <div className="relative flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2 min-w-0">
                          {/* Orb dot (§14 Agent Color Tokens 同パターン) */}
                          <span
                            className="w-2 h-2 rounded-full shrink-0"
                            style={{
                              background: `radial-gradient(circle at 30% 30%, #ffffff 0%, ${stage.color.accent} 48%, ${stage.color.accent}75 85%)`,
                              boxShadow: `0 0 6px ${stage.color.accent}aa, 0 0 14px ${stage.color.accent}55`,
                            }}
                          />
                          <h3
                            className="font-[family-name:var(--font-display)] text-[13px] font-semibold tracking-[-0.005em] leading-none"
                            style={{ color: 'var(--color-obs-text)' }}
                          >
                            {stage.label}
                          </h3>
                          {/* 件数バッジ — §17 Pill / Chip */}
                          <span
                            className="text-[10px] font-bold tabular-nums rounded-full px-2 h-[18px] inline-flex items-center leading-none"
                            style={{
                              background: `${stage.color.accent}1a`,
                              color: stage.color.text,
                              boxShadow: `inset 0 0 0 1px ${stage.color.accent}30`,
                            }}
                          >
                            {stageDeals.length}
                          </span>
                        </div>
                        {stageDeals.length > 0 && (
                          <span
                            className="font-mono text-[11px] font-bold tabular-nums"
                            style={{ color: stage.color.text }}
                          >
                            {formatJpy(stageDeals.reduce((s, d) => s + d.amount, 0))}
                          </span>
                        )}
                      </div>
                      <p
                        className="relative text-[10.5px] leading-tight"
                        style={{ color: 'var(--color-obs-text-subtle)' }}
                      >
                        {stage.desc}
                      </p>
                    </div>
                  </div>

                  {/* Cards container — drop highlight も §13 Recipe C トーン */}
                  <div
                    className="flex flex-col gap-3 min-h-[120px] rounded-2xl p-2 transition-colors duration-200"
                    style={{
                      background: isOver
                        ? 'rgba(171,199,255,0.06)'
                        : 'transparent',
                      boxShadow: isOver
                        ? 'inset 0 0 0 1px rgba(171,199,255,0.20)'
                        : 'none',
                      transitionTimingFunction: 'var(--ease-liquid)',
                    }}
                  >
                    {stageDeals.map((deal) => (
                      <DealCard
                        key={deal.id}
                        deal={deal}
                        onDragStart={(e) => onCardDragStart(e, deal.id)}
                        onDragEnd={onCardDragEnd}
                      />
                    ))}
                  </div>
                </div>
              )
            })}
              </div>
            </>
          )}

          {view === 'funnel' && (
            /* ── 商談パイプライン ファネルレポート ── */
            <FunnelReport deals={deals} />
          )}
        </div>

      </div>
    </ObsPageShell>
  )
}

// ─── FunnelReport ─────────────────────────────────────────────────────────────
// 商談パイプラインのコンバージョンファネル
// 有効商談 → PJ化予定 → PJ可能 → PJ進行中 + 失注 / 契約

// ═══════════════════════════════════════════════════════════════════════════════
// FunnelReport — Liquid Obsidian 準拠（サービス内のレポートタブ）
//   ・データ：親から渡される deals（パイプラインの実データ）から自動集計
//   ・フィルタ：期間（全期間/3月/4月）× 担当者（全体/各担当）
//   ・エグゼクティブサマリー：結論選択＋テキスト編集＋localStorage保存
//   ・ファネル：4段（有効商談 → PJ化予定あり → PJ可能案件 → PJ進行）
//   ・失注 / 契約 カード
//   ・有効商談一覧テーブル
// ═══════════════════════════════════════════════════════════════════════════════

type ReportPeriod = 'all' | '2026-03' | '2026-04'
type Conclusion = '順調' | '要注意' | '危険'

interface SummaryState {
  conclusion: Conclusion
  next: string
  help: string
}

const SUMMARY_KEY = 'bgm.pipeline.report.summary.v1'

const DEFAULT_SUMMARY: SummaryState = {
  conclusion: '要注意',
  next: 'トライアル期間の週次MTG\n1週目：動作確認\n2週目：運用確認\n3週目：最終調整\n4週目：意向確認',
  help: '機能アップデート\n4月：担当者の割り当て通知\n5月：チケットからのFAQ自動作成（Gドライブ・シェアポイント）\n\n※Must Have',
}

const CONCLUSION_STYLE: Record<Conclusion, { color: string; bg: string; ring: string }> = {
  '順調':   { color: '#8dffc9', bg: 'rgba(141,255,201,0.13)', ring: 'rgba(141,255,201,0.38)' },
  '要注意': { color: '#ffb45f', bg: 'rgba(255,180,95,0.14)', ring: 'rgba(255,180,95,0.40)' },
  '危険':   { color: '#ff6b7a', bg: 'rgba(255,107,122,0.14)', ring: 'rgba(255,107,122,0.40)' },
}

// stage → レポート上の分類（ファネル＆バッジ共通）
type ReportBucket = 'PJ進行' | 'PJ可能' | '有効商談' | '検証' | '失注' | '契約' | 'ロスト' | 'その他'

function bucketOf(stage: StageKey): ReportBucket {
  if (stage === 'CLOSED_WON') return '契約'
  if (stage === 'LOST_DEAL') return '失注'
  if (stage === 'LOST' || stage === 'CHURN') return 'ロスト'
  if (stage === 'POC') return '検証'
  if (stage === 'MULTI_MEETING') return 'PJ進行'
  if (stage === 'PROJECT_PLANNED') return 'PJ可能'
  if (
    stage === 'IS' ||
    stage === 'MEETING_PLANNED' ||
    stage === 'MEETING_DONE'
  ) {
    return '有効商談'
  }
  return 'その他'
}

// テーブル行のステータスバッジ — ファネル3カード + 結果4カードと連動
//   有効商談 → 商談済み (青)
//   PJ可能   → プロジェクト化予定あり (シアン)
//   PJ進行   → プロジェクト進行中 (グリーン)
//   検証     → 検証中 (アンバー)
//   契約     → 契約済み (グリーン)
//   失注/ロスト → 失注（ロスト） (赤系 / グレー系で残しつつラベルは統合)
const BADGE_STYLE: Record<ReportBucket, { label: string; color: string; bg: string } | null> = {
  '有効商談': { label: '商談済み',              color: '#abc7ff', bg: 'rgba(171,199,255,0.14)' },
  'PJ可能':   { label: 'プロジェクト化予定あり', color: '#ffb45f', bg: 'rgba(255,180,95,0.14)' },
  'PJ進行':   { label: 'プロジェクト進行中',     color: '#8dffc9', bg: 'rgba(141,255,201,0.14)' },
  '検証':     { label: '検証中',                color: '#c8b9ff', bg: 'rgba(200,185,255,0.14)' },
  '失注':     { label: '失注（ロスト）',         color: '#ff6b7a', bg: 'rgba(255,107,122,0.14)' },
  '契約':     { label: '契約済み',              color: '#8dffc9', bg: 'rgba(141,255,201,0.14)' },
  'ロスト':   { label: '失注（ロスト）',         color: '#9b99a0', bg: 'rgba(155,153,160,0.16)' },
  'その他':   null,
}

function FunnelReport({ deals }: { deals: Deal[] }) {
  const [period, setPeriod] = useState<ReportPeriod>('all')
  const [owner, setOwner] = useState<string>('全員')

  // Executive Summary（localStorage に自動保存。編集モード/閲覧モードの分離は廃止）
  const [summary, setSummary] = useState<SummaryState>(DEFAULT_SUMMARY)

  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const raw = localStorage.getItem(SUMMARY_KEY)
      if (raw) {
        const parsed = JSON.parse(raw) as SummaryState
        setSummary(parsed)
      }
    } catch { /* ignore */ }
  }, [])

  // 任意フィールドを更新 → 即座に localStorage へ書き込み
  const updateSummary = (patch: Partial<SummaryState>) => {
    setSummary((prev) => {
      const next = { ...prev, ...patch }
      try { localStorage.setItem(SUMMARY_KEY, JSON.stringify(next)) } catch { /* ignore */ }
      return next
    })
  }

  // 担当者一覧は deals から動的生成
  const OWNER_LIST = useMemo(() => {
    const s = new Set<string>()
    deals.forEach((d) => s.add(d.owner))
    return ['全員', ...Array.from(s).sort((a, b) => a.localeCompare(b, 'ja'))]
  }, [deals])

  // 期間 × 担当者でスコープ
  const scoped = useMemo(() => {
    let list = deals
    if (owner !== '全員') list = list.filter((d) => d.owner === owner)
    if (period !== 'all') list = list.filter((d) => d.createdAt.startsWith(period))
    return list
  }, [deals, owner, period])

  // ファネル集計
  // - カード数値：現在その段階で進行中の案件数（現在値）
  // - 移行率 %：累計ベース（検証/契約/失注/ロストを過去実績として加算）
  const { counts, stageGroups } = useMemo(() => {
    const activeValid    = scoped.filter((d) => {
      const b = bucketOf(d.stage)
      return b === '有効商談' || b === 'PJ可能' || b === 'PJ進行'
    })
    const activePossible = scoped.filter((d) => {
      const b = bucketOf(d.stage)
      return b === 'PJ可能' || b === 'PJ進行'
    })
    const activeRunning  = scoped.filter((d) => bucketOf(d.stage) === 'PJ進行')
    const verifyDeals    = scoped.filter((d) => bucketOf(d.stage) === '検証')
    const contractDeals  = scoped.filter((d) => bucketOf(d.stage) === '契約')
    const lostDeals      = scoped.filter((d) => bucketOf(d.stage) === '失注')
    const churnedDeals   = scoped.filter((d) => bucketOf(d.stage) === 'ロスト')

    // 過去案件 = ファネルから抜けた状態（検証/契約/失注/ロスト）
    const past = [...verifyDeals, ...contractDeals, ...lostDeals, ...churnedDeals]

    // 累計（現在進行中 + 過去）
    const totalValid     = activeValid.length    + past.length
    const totalPossible  = activePossible.length + past.length
    const totalRunning   = activeRunning.length  + past.length

    return {
      counts: {
        // カード表示値 = 現在進行中のみ
        valid:      activeValid.length,
        pjPossible: activePossible.length,
        pjRunning:  activeRunning.length,
        verify:     verifyDeals.length,
        contracted: contractDeals.length,
        lost:       lostDeals.length,
        churned:    churnedDeals.length,
        // 累計件数（ホバーで表示）
        totalValid, totalPossible, totalRunning,
        // 移行率は累計ベース
        finalRate:    totalValid > 0 ? Math.round((totalRunning / totalValid) * 100) : 0,
        possibleRate: totalValid > 0 ? Math.round((totalPossible / totalValid) * 100) : 0,
        runningRate:  totalPossible > 0 ? Math.round((totalRunning / totalPossible) * 100) : 0,
      },
      stageGroups: {
        // 現在進行中の案件（カード全体ホバー用）
        valid:      activeValid,
        pjPossible: activePossible,
        pjRunning:  activeRunning,
        verify:     verifyDeals,
        contracted: contractDeals,
        lost:       lostDeals,
        churned:    churnedDeals,
        // 過去案件 = 検証 + 契約 + 失注 + ロスト
        past,
      },
    }
  }, [scoped])

  // テーブル：商談一覧 — ファネル3カード + 結果4カードに対応する6種すべてを表示
  // (商談済み / プロジェクト化予定あり / プロジェクト進行中 / 検証中 / 契約済み / 失注（ロスト）)
  const activeDeals = useMemo(
    () => scoped.filter((d) => bucketOf(d.stage) !== 'その他'),
    [scoped],
  )

  const periodLabel = period === 'all' ? '全期間合算' : period === '2026-03' ? '3月分' : '4月分'
  const ownerLabel = owner === '全員' ? '全体' : owner

  return (
    <div className="mt-4 space-y-8 pb-10">
      {/* ─── フィルタバー：期間タブ ＋ 担当者 ─── */}
      <div className="flex flex-wrap items-center gap-3">
        <div
          className="flex items-center gap-1 rounded-[var(--radius-obs-2xl)] p-1 relative overflow-hidden"
          style={{
            background: 'linear-gradient(145deg, rgba(45,47,54,0.58) 0%, rgba(18,19,23,0.88) 100%)',
            boxShadow:
              'inset 0 0 0 1px rgba(171,199,255,0.16), inset 1px 1px 0 rgba(255,255,255,0.06), 0 14px 36px rgba(0,0,0,0.26)',
          }}
        >
          <span
            className="pointer-events-none absolute inset-x-2 top-0 h-px"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(171,199,255,0.28), transparent)' }}
          />
          {([
            { k: 'all',     label: '全期間' },
            { k: '2026-03', label: '3月' },
            { k: '2026-04', label: '4月' },
          ] as { k: ReportPeriod; label: string }[]).map((t) => {
            const active = period === t.k
            return (
              <button
                key={t.k}
                onClick={() => setPeriod(t.k)}
                className="h-8 px-4 rounded-full text-[12px] font-medium transition-colors duration-150 relative"
                style={{
                  color: active ? '#fcfbff' : '#c7c5c9',
                  background: active
                    ? 'linear-gradient(135deg, rgba(171,199,255,0.35) 0%, rgba(0,113,227,0.36) 100%)'
                    : 'transparent',
                  boxShadow: active
                    ? 'inset 1px 1px 0 rgba(255,255,255,0.20), inset 0 0 0 1px rgba(171,199,255,0.34), 0 0 18px rgba(171,199,255,0.18)'
                    : 'none',
                  transitionTimingFunction: 'var(--ease-liquid)',
                }}
              >
                {t.label}
              </button>
            )
          })}
        </div>

        <span className="h-6 w-px" style={{ backgroundColor: 'rgba(171,199,255,0.18)' }} />

        <div className="flex items-center gap-1.5 flex-wrap">
          {OWNER_LIST.map((o) => {
            const active = owner === o
            const label = o === '全員' ? '全体' : o
            return (
              <button
                key={o}
                onClick={() => setOwner(o)}
                className="h-7 px-3 rounded-full text-[11px] font-medium transition-colors duration-150"
                style={
                  active
                    ? {
                        background: 'linear-gradient(140deg, rgba(171,199,255,0.16) 0%, rgba(0,113,227,0.18) 100%)',
                        color: '#abc7ff',
                        boxShadow: 'inset 0 0 0 1px rgba(171,199,255,0.30), 0 0 14px rgba(171,199,255,0.10)',
                        transitionTimingFunction: 'var(--ease-liquid)',
                      }
                    : {
                        background: 'rgba(36,36,38,0.52)',
                        color: '#c7c5c9',
                        boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.055)',
                        transitionTimingFunction: 'var(--ease-liquid)',
                      }
                }
              >
                {label}
              </button>
            )
          })}
        </div>

      </div>

      {/* ─── エグゼクティブサマリー（常時編集可能・自動保存） ─── */}
      <div
        className="rounded-3xl p-6 relative overflow-hidden"
        style={{
          background:
            'radial-gradient(circle at 12% 18%, rgba(171,199,255,0.115) 0%, transparent 28%), radial-gradient(circle at 92% 0%, rgba(0,113,227,0.070) 0%, transparent 30%), linear-gradient(145deg, rgba(39,40,46,0.82) 0%, rgba(23,24,29,0.94) 48%, rgba(13,14,18,0.98) 100%)',
          backdropFilter: 'blur(22px) saturate(135%)',
          WebkitBackdropFilter: 'blur(22px) saturate(135%)',
          boxShadow:
            'inset 0 0 0 1px rgba(171,199,255,0.18), inset 1px 1px 0 rgba(255,255,255,0.07), inset -1px -1px 0 rgba(0,0,0,0.30), 0 22px 58px rgba(0,0,0,0.32)',
        }}
      >
        <span
          className="pointer-events-none absolute left-6 right-6 top-0 h-px"
          style={{
            background: 'linear-gradient(90deg, transparent 0%, rgba(171,199,255,0.34) 50%, transparent 100%)',
          }}
        />
        {/* ambient orb */}
        <span
          aria-hidden
          className="pointer-events-none absolute -top-24 -right-20 w-60 h-60 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(171,199,255,0.12), transparent 62%)',
            filter: 'blur(54px)',
          }}
        />
        <div className="relative flex items-center gap-3 mb-5">
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#abc7ff', boxShadow: '0 0 10px #abc7ff' }} />
          <span className="text-[11px] font-semibold tracking-[0.14em] uppercase" style={{ color: '#abc7ff' }}>
            エグゼクティブサマリー
          </span>
          <span className="text-[10px]" style={{ color: '#7e7c83' }}>
            自動保存
          </span>
        </div>

        <div className="relative grid grid-cols-1 md:grid-cols-[220px_1fr_1fr] gap-8">
          <div>
            <FieldLabel>結論</FieldLabel>
            <div className="mt-3">
              <ConclusionSelect
                value={summary.conclusion}
                onChange={(v) => updateSummary({ conclusion: v })}
              />
            </div>
          </div>
          <div>
            <FieldLabel>NEXT</FieldLabel>
            <textarea
              value={summary.next}
              onChange={(e) => updateSummary({ next: e.target.value })}
              rows={6}
              placeholder="（未入力）"
              className="mt-3 w-full rounded-xl bg-dusk p-3 text-[12.5px] leading-[1.8] resize-y font-[family-name:var(--font-body)] focus:outline-none transition-colors"
              style={{
                color: '#e7e5ea',
                background:
                  'radial-gradient(circle at 90% 0%, rgba(171,199,255,0.055) 0%, transparent 34%), linear-gradient(180deg, rgba(15,16,20,0.88) 0%, rgba(9,10,13,0.94) 100%)',
                boxShadow:
                  'inset 0 0 0 1px rgba(171,199,255,0.18), inset 1px 1px 0 rgba(255,255,255,0.045), 0 12px 28px rgba(0,0,0,0.16)',
                minHeight: 150,
              }}
            />
          </div>
          <div>
            <FieldLabel>助けが必要な1点</FieldLabel>
            <textarea
              value={summary.help}
              onChange={(e) => updateSummary({ help: e.target.value })}
              rows={6}
              placeholder="（未入力）"
              className="mt-3 w-full rounded-xl bg-dusk p-3 text-[12.5px] leading-[1.8] resize-y font-[family-name:var(--font-body)] focus:outline-none transition-colors"
              style={{
                color: '#e7e5ea',
                background:
                  'radial-gradient(circle at 90% 0%, rgba(171,199,255,0.055) 0%, transparent 34%), linear-gradient(180deg, rgba(15,16,20,0.88) 0%, rgba(9,10,13,0.94) 100%)',
                boxShadow:
                  'inset 0 0 0 1px rgba(171,199,255,0.18), inset 1px 1px 0 rgba(255,255,255,0.045), 0 12px 28px rgba(0,0,0,0.16)',
                minHeight: 150,
              }}
            />
          </div>
        </div>
      </div>

      {/* ─── セクションラベル ─── */}
      <div className="flex items-center gap-3">
        <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#abc7ff', boxShadow: '0 0 10px #abc7ff' }} />
        <span className="text-[11px] font-semibold tracking-[0.14em] uppercase" style={{ color: '#abc7ff' }}>
          商談パイプライン
        </span>
        <span className="text-[11px]" style={{ color: '#7e7c83' }}>
          — {ownerLabel} / {periodLabel}
        </span>
        <button
          className="inline-flex items-center gap-1 h-6 px-2 rounded-full text-[10px] font-medium ml-2 transition-colors"
          style={{
            color: '#c7c5c9',
            background: 'linear-gradient(145deg, rgba(36,36,38,0.62) 0%, rgba(20,21,25,0.80) 100%)',
            boxShadow: 'inset 0 0 0 1px rgba(171,199,255,0.11), 0 0 12px rgba(171,199,255,0.05)',
          }}
        >
          <HelpCircle size={10} />
          認定条件とは？
        </button>
      </div>

      {/* ─── ファネル 3ステージ ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr_auto_1fr] gap-4 items-stretch">
        <FunnelCard
          label="商談数"
          value={counts.valid}
          color="#abc7ff"
          condition={'商談済み'}
          activeDeals={stageGroups.valid}
          activeLabel="現在進行中の案件"
          rateTotal={counts.totalValid}
          rateTotalLabel="商談累計"
          rateNumerator={counts.totalRunning}
          rateNumeratorLabel="PJ進行まで到達"
          pastDeals={stageGroups.past}
        />
        <ArrowStep label="PJ化" />
        <FunnelCard
          label="プロジェクト化予定あり"
          value={counts.pjPossible}
          color="#ffb45f"
          condition={'プロジェクト化予定あり'}
          rateLabel="移行率"
          rate={counts.possibleRate}
          rateColor="#8dffc9"
          activeDeals={stageGroups.pjPossible}
          activeLabel="現在進行中の案件"
          rateTotal={counts.totalValid}
          rateTotalLabel="商談累計"
          rateNumerator={counts.totalPossible}
          rateNumeratorLabel="PJ化予定まで到達"
          pastDeals={stageGroups.past}
        />
        <ArrowStep label="POC" />
        <FunnelCard
          label="プロジェクト進行"
          value={counts.pjRunning}
          color="#8dffc9"
          condition={'複数商談済み・POC'}
          rateLabel="移行率"
          rate={counts.runningRate}
          rateColor="#8dffc9"
          accent
          activeDeals={stageGroups.pjRunning}
          activeLabel="現在進行中の案件"
          rateTotal={counts.totalPossible}
          rateTotalLabel="PJ化予定累計"
          rateNumerator={counts.totalRunning}
          rateNumeratorLabel="PJ進行まで到達"
          pastDeals={stageGroups.past}
        />
      </div>

      {/* ─── 検証 / 契約 / 失注 / ロスト ─── (定義は STAGES.desc から自動引用) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <OutcomeCard
          icon={<Clock size={16} />}
          label="検証"
          value={counts.verify}
          tone="warning"
          deals={stageGroups.verify}
          desc={STAGES.find((s) => s.key === 'POC')?.desc}
        />
        <OutcomeCard
          icon={<Check size={16} />}
          label="契約"
          value={counts.contracted}
          tone="success"
          deals={stageGroups.contracted}
          desc={STAGES.find((s) => s.key === 'CLOSED_WON')?.desc}
        />
        <OutcomeCard
          icon={<X size={16} />}
          label="失注"
          value={counts.lost}
          tone="hot"
          deals={stageGroups.lost}
          desc={STAGES.find((s) => s.key === 'LOST_DEAL')?.desc}
        />
        <OutcomeCard
          icon={<ArrowLeft size={16} />}
          label="ロスト"
          value={counts.churned}
          tone="muted"
          deals={stageGroups.churned}
          desc={STAGES.find((s) => s.key === 'LOST')?.desc}
        />
      </div>

      {/* ─── 有効商談一覧 ─── */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#abc7ff', boxShadow: '0 0 10px #abc7ff' }} />
          <span className="text-[11px] font-semibold tracking-[0.14em] uppercase" style={{ color: '#abc7ff' }}>
            商談一覧
          </span>
          <span className="text-[11px]" style={{ color: '#7e7c83' }}>
            — {activeDeals.length}件
          </span>
        </div>

        <div
          className="rounded-3xl overflow-hidden"
          style={{
            background:
              'linear-gradient(145deg, rgba(33,34,39,0.78) 0%, rgba(22,23,27,0.94) 100%)',
            backdropFilter: 'blur(18px) saturate(135%)',
            WebkitBackdropFilter: 'blur(18px) saturate(135%)',
            boxShadow:
              'inset 0 0 0 1px rgba(171,199,255,0.11), inset 1px 1px 0 rgba(255,255,255,0.045), 0 18px 46px rgba(0,0,0,0.26)',
          }}
        >
          <div
            className="grid items-center px-5 py-3 text-[10.5px] font-semibold tracking-[0.14em] uppercase"
            style={{
              gridTemplateColumns: '40px 1.3fr 0.7fr 1.4fr',
              background:
                'linear-gradient(90deg, rgba(171,199,255,0.060) 0%, rgba(171,199,255,0.020) 100%)',
              color: '#9b99a0',
            }}
          >
            <span>#</span>
            <span>企業名 / 担当</span>
            <span>ステータス</span>
            <span>Status / Next</span>
          </div>

          {activeDeals.length === 0 ? (
            <div className="px-5 py-10 text-center text-[12px]" style={{ color: '#7e7c83' }}>
              該当する商談がありません
            </div>
          ) : activeDeals.map((d, i) => {
            const bucket = bucketOf(d.stage)
            const badge = BADGE_STYLE[bucket]
            return (
              <div
                key={d.id}
                className="grid items-center px-5 py-4 transition-colors duration-150"
                style={{
                  gridTemplateColumns: '40px 1.3fr 0.7fr 1.4fr',
                  borderTop: i === 0 ? 'none' : '1px solid rgba(171,199,255,0.08)',
                }}
                onMouseOver={(e) => (e.currentTarget.style.backgroundColor = 'rgba(171,199,255,0.05)')}
                onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <span className="font-mono text-[12px] tabular-nums" style={{ color: '#7e7c83' }}>
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div className="min-w-0">
                  <div className="text-[13px] font-semibold truncate" style={{ color: '#e7e5ea' }}>
                    {d.company}
                  </div>
                  <div className="text-[11px] mt-0.5" style={{ color: '#c7c5c9' }}>
                    {d.owner}
                  </div>
                </div>
                <div>
                  {badge && (
                    <span
                      className="inline-flex items-center gap-1.5 px-2.5 h-6 rounded-full text-[11px] font-medium"
                      style={{
                        backgroundColor: badge.bg,
                        color: badge.color,
                        boxShadow: `inset 0 0 0 1px ${badge.color}33`,
                      }}
                    >
                      <span
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ backgroundColor: badge.color, boxShadow: `0 0 6px ${badge.color}` }}
                      />
                      {badge.label}
                    </span>
                  )}
                </div>
                <div className="text-[11.5px] leading-[1.6] min-w-0" style={{ color: '#c7c5c9' }}>
                  {d.status && (
                    <div>
                      <span style={{ color: '#7e7c83' }}>Status：</span>
                      <span style={{ color: '#e7e5ea' }}>{d.status}</span>
                    </div>
                  )}
                  {d.nextAction && (
                    <div>
                      <span style={{ color: '#7e7c83' }}>Next：</span>
                      <span>{d.nextAction}</span>
                      {d.nextActionDate && (
                        <span className="ml-1.5" style={{ color: '#abc7ff' }}>
                          ({d.nextActionDate})
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ─── POC移行率 ─── (取引データから経由元別に自動集計) */}
      <TrialConversionTable deals={scoped} />
    </div>
  )
}

// ─── Sub: 結論セレクタ ─────────────────────────────────────────────────────────
function ConclusionSelect({ value, onChange }: { value: Conclusion; onChange: (v: Conclusion) => void }) {
  const [open, setOpen] = useState(false)
  const cur = CONCLUSION_STYLE[value]
  return (
    <div className="relative mt-2">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between h-10 px-4 rounded-xl text-[14px] font-semibold transition-all duration-200"
        style={{
          background: `linear-gradient(145deg, ${cur.bg} 0%, rgba(30,31,36,0.78) 58%, rgba(18,19,23,0.92) 100%)`,
          color: cur.color,
          boxShadow: `inset 0 0 0 1px ${cur.ring}, inset 1px 1px 0 rgba(255,255,255,0.07), 0 0 18px ${cur.ring}`,
          transitionTimingFunction: 'var(--ease-liquid)',
        }}
      >
        <span className="inline-flex items-center gap-2">
          <span
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: cur.color, boxShadow: `0 0 8px ${cur.color}` }}
          />
          {value}
        </span>
        <ChevronDown size={14} />
      </button>
      {open && (
        <div
          className="absolute z-10 mt-1 w-full rounded-xl overflow-hidden"
          style={{
            background: 'linear-gradient(180deg, rgba(29,30,35,0.96) 0%, rgba(14,15,18,0.98) 100%)',
            backdropFilter: 'blur(18px) saturate(140%)',
            WebkitBackdropFilter: 'blur(18px) saturate(140%)',
            boxShadow:
              'inset 0 0 0 1px rgba(171,199,255,0.14), inset 1px 1px 0 rgba(255,255,255,0.05), 0 18px 46px rgba(0,0,0,0.56)',
          }}
        >
          {(['順調', '要注意', '危険'] as Conclusion[]).map((opt) => {
            const s = CONCLUSION_STYLE[opt]
            return (
              <button
                key={opt}
                onClick={() => { onChange(opt); setOpen(false) }}
                className="w-full flex items-center gap-2 text-left px-4 h-9 text-[13px] font-medium transition-colors"
                style={{ color: s.color }}
                onMouseOver={(e) => (e.currentTarget.style.backgroundColor = s.bg)}
                onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: s.color, boxShadow: `0 0 6px ${s.color}` }}
                />
                {opt}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-[10px] font-semibold tracking-[0.14em] uppercase" style={{ color: '#abc7ff' }}>
      {children}
    </span>
  )
}

// ─── POC移行率 ───────────────────────────────────────────────────────────────
// 経由元カテゴリ表示名 (Deal.sourceCategory のキーと対応)
const SOURCE_CATEGORY_LABEL: Record<SourceCategory, string> = {
  web:      'WEB流入',
  referral: '紹介',
  partner:  'パートナー経由',
  event:    'イベント',
  media:    '媒体掲載',
}

// テーブルでの並び順（左から順に表示）
const SOURCE_CATEGORY_ORDER: SourceCategory[] = ['web', 'referral', 'partner', 'event', 'media']

// POC到達と判定するステージ：POC・契約・失注
// （要件：受注／POC／失注のステージにいるお客さんが移行率に反映される）
const POC_REACHED_STAGES: StageKey[] = ['POC', 'CLOSED_WON', 'LOST_DEAL']

type TrialChannel = {
  id: SourceCategory
  category: string
  sources: string[]                                                  // ヘッダ下サブテキスト用
  acquired: number                                                   // カテゴリ内の取得社数 (=取引数)
  trials: number                                                     // POC到達した社数
  details: { source: string; acquired: number; trials: number }[]    // 経由元別内訳
}

const RATE_COLOR_GREEN = '#6ee7a1'
const RATE_COLOR_GOLD = '#ffb86b'
const RATE_COLOR_DIM = '#7e7c83'

function rateColorFor(rate: number): string {
  if (rate <= 0) return RATE_COLOR_DIM
  return RATE_COLOR_GREEN
}

function TrialConversionTable({ deals }: { deals: Deal[] }) {
  const [openIds, setOpenIds] = useState<Set<string>>(new Set())
  const toggle = (id: string) =>
    setOpenIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  // ── 取引データから経由元カテゴリ別に自動集計 ──
  // 取得社数 = カテゴリ内取引数
  // POC = POC / 受注 / 失注 のいずれかにいる取引数
  const channels: TrialChannel[] = useMemo(() => {
    const dealsWithSource = deals.filter((d) => !!d.sourceCategory && !!d.source)
    return SOURCE_CATEGORY_ORDER.map<TrialChannel>((cat) => {
      const inCat = dealsWithSource.filter((d) => d.sourceCategory === cat)
      // 経由元名でグルーピング
      const bySource = new Map<string, { acquired: number; trials: number }>()
      for (const d of inCat) {
        const key = d.source ?? '（未指定）'
        const cur = bySource.get(key) ?? { acquired: 0, trials: 0 }
        cur.acquired += 1
        if (POC_REACHED_STAGES.includes(d.stage)) cur.trials += 1
        bySource.set(key, cur)
      }
      const details = Array.from(bySource.entries()).map(([source, v]) => ({
        source,
        acquired: v.acquired,
        trials: v.trials,
      }))
      return {
        id: cat,
        category: SOURCE_CATEGORY_LABEL[cat],
        sources: details.map((d) => d.source),
        acquired: inCat.length,
        trials: inCat.filter((d) => POC_REACHED_STAGES.includes(d.stage)).length,
        details,
      }
    }).filter((c) => c.acquired > 0) // 取引が無いカテゴリは行を出さない
  }, [deals])

  const totals = channels.reduce(
    (acc, c) => ({ acquired: acc.acquired + c.acquired, trials: acc.trials + c.trials }),
    { acquired: 0, trials: 0 },
  )
  const totalRate = totals.acquired > 0 ? Math.round((totals.trials / totals.acquired) * 100) : 0

  return (
    <div>
      {/* セクション見出し */}
      <div className="flex items-center gap-3 mb-4 mt-2">
        <span
          className="w-1.5 h-1.5 rounded-full"
          style={{ background: RATE_COLOR_GOLD, boxShadow: `0 0 10px ${RATE_COLOR_GOLD}` }}
        />
        <span
          className="text-[11px] font-semibold tracking-[0.14em] uppercase"
          style={{ color: RATE_COLOR_GOLD }}
        >
          POC移行率
        </span>
      </div>

      {/* テーブル */}
      <div
        className="rounded-3xl overflow-hidden"
        style={{
          background:
            'linear-gradient(145deg, rgba(33,34,39,0.78) 0%, rgba(22,23,27,0.94) 100%)',
          backdropFilter: 'blur(18px) saturate(135%)',
          WebkitBackdropFilter: 'blur(18px) saturate(135%)',
          boxShadow:
            'inset 0 0 0 1px rgba(255,184,107,0.13), inset 1px 1px 0 rgba(255,255,255,0.045), 0 18px 46px rgba(0,0,0,0.26)',
        }}
      >
        {/* ヘッダ */}
        <div
          className="grid items-center px-5 py-3 text-[10.5px] font-semibold tracking-[0.14em] uppercase gap-4"
          style={{
            gridTemplateColumns: '1.6fr 0.6fr 0.8fr 0.6fr',
            background:
              'linear-gradient(90deg, rgba(255,184,107,0.075) 0%, rgba(171,199,255,0.025) 100%)',
            color: '#9b99a0',
          }}
        >
          <span>経由元カテゴリ</span>
          <span className="text-right">取得社数</span>
          <span className="text-right">POC到達</span>
          <span className="text-right">移行率</span>
        </div>

        {/* 行 (経由元情報のある取引が無い場合は空状態) */}
        {channels.length === 0 && (
          <div
            className="px-5 py-10 text-center text-[12px]"
            style={{ color: '#7e7c83' }}
          >
            該当期間に経由元情報のある取引がありません
          </div>
        )}
        {channels.map((c, i) => {
          const isOpen = openIds.has(c.id)
          const rate = c.acquired > 0 ? Math.round((c.trials / c.acquired) * 100) : 0
          const rColor = rateColorFor(rate)
          return (
            <div
              key={c.id}
              style={{
                borderTop: i === 0 ? 'none' : '1px solid rgba(171,199,255,0.08)',
              }}
            >
              <button
                type="button"
                onClick={() => toggle(c.id)}
                className="w-full grid items-center px-5 py-4 text-left transition-colors duration-150 gap-4"
                style={{
                  gridTemplateColumns: '1.6fr 0.6fr 0.8fr 0.6fr',
                  backgroundColor: 'transparent',
                }}
                onMouseOver={(e) => {
                  ;(e.currentTarget as HTMLButtonElement).style.backgroundColor =
                    'rgba(171,199,255,0.05)'
                }}
                onMouseOut={(e) => {
                  ;(e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent'
                }}
                aria-expanded={isOpen}
              >
                <div className="min-w-0">
                  <div
                    className="text-[13px] font-semibold leading-tight"
                    style={{ color: '#e7e5ea' }}
                  >
                    {c.category}
                  </div>
                  <div
                    className="text-[11px] mt-1 leading-snug truncate"
                    style={{ color: '#7e7c83' }}
                    title={c.sources.join(' / ')}
                  >
                    {c.sources.join(' / ')}
                  </div>
                  <ChevronDown
                    size={13}
                    strokeWidth={2}
                    className="mt-1.5"
                    style={{
                      color: '#7e7c83',
                      transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 150ms var(--ease-liquid)',
                    }}
                  />
                </div>
                <div className="text-right tabular-nums">
                  <span
                    className="font-mono text-[18px] font-bold"
                    style={{ color: '#e7e5ea' }}
                  >
                    {c.acquired}
                  </span>
                  <span
                    className="ml-0.5 text-[11px]"
                    style={{ color: '#7e7c83' }}
                  >
                    社
                  </span>
                </div>
                <div className="text-right tabular-nums">
                  <span
                    className="font-mono text-[18px] font-bold"
                    style={{ color: c.trials > 0 ? '#e7e5ea' : '#7e7c83' }}
                  >
                    {c.trials}
                  </span>
                  <span
                    className="ml-0.5 text-[11px]"
                    style={{ color: '#7e7c83' }}
                  >
                    社
                  </span>
                </div>
                <div className="text-right tabular-nums">
                  <span
                    className="font-mono text-[20px] font-bold"
                    style={{ color: rColor, textShadow: rate > 0 ? `0 0 12px ${rColor}55` : 'none' }}
                  >
                    {rate}%
                  </span>
                </div>
              </button>

              {/* 展開時の内訳 */}
              {isOpen && c.details.length > 0 && (
                <div
                  className="px-5 pb-4 pt-1"
                  style={{ backgroundColor: 'rgba(171,199,255,0.035)' }}
                >
                  <div
                    className="grid items-center px-3 py-2 text-[10px] font-semibold tracking-[0.14em] uppercase gap-4"
                    style={{
                      gridTemplateColumns: '1.6fr 0.6fr 0.8fr 0.6fr',
                      color: '#7e7c83',
                    }}
                  >
                    <span>経由元</span>
                    <span className="text-right">取得</span>
                    <span className="text-right">申し込み</span>
                    <span className="text-right">移行率</span>
                  </div>
                  {c.details.map((d) => {
                    const dRate = d.acquired > 0 ? Math.round((d.trials / d.acquired) * 100) : 0
                    const dColor = rateColorFor(dRate)
                    return (
                      <div
                        key={d.source}
                        className="grid items-center px-3 py-2 gap-4"
                        style={{
                          gridTemplateColumns: '1.6fr 0.6fr 0.8fr 0.6fr',
                          borderTop: '1px solid rgba(171,199,255,0.06)',
                        }}
                      >
                        <span
                          className="text-[12px] truncate"
                          style={{ color: '#c7c5c9' }}
                          title={d.source}
                        >
                          {d.source}
                        </span>
                        <span
                          className="text-right font-mono text-[12px] tabular-nums"
                          style={{ color: '#e7e5ea' }}
                        >
                          {d.acquired}社
                        </span>
                        <span
                          className="text-right font-mono text-[12px] tabular-nums"
                          style={{
                            color: d.trials > 0 ? '#e7e5ea' : '#7e7c83',
                          }}
                        >
                          {d.trials}社
                        </span>
                        <span
                          className="text-right font-mono text-[13px] font-bold tabular-nums"
                          style={{ color: dColor }}
                        >
                          {dRate}%
                        </span>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}

        {/* 合計 — amber tint */}
        <div
          className="grid items-center px-5 py-4 gap-4"
          style={{
            gridTemplateColumns: '1.6fr 0.6fr 0.8fr 0.6fr',
            background:
              'linear-gradient(90deg, rgba(255,184,107,0.08) 0%, rgba(255,184,107,0.04) 100%)',
            borderTop: '1px solid rgba(255,184,107,0.28)',
            boxShadow: 'inset 0 0 28px rgba(255,184,107,0.06)',
          }}
        >
          <span
            className="text-[13px] font-bold tracking-[0.04em]"
            style={{ color: RATE_COLOR_GOLD }}
          >
            合計
          </span>
          <div className="text-right tabular-nums">
            <span
              className="text-[18px] font-[family-name:var(--font-display)] font-bold"
              style={{ color: RATE_COLOR_GOLD }}
            >
              {totals.acquired}
            </span>
            <span
              className="ml-0.5 text-[11px]"
              style={{ color: RATE_COLOR_GOLD, opacity: 0.7 }}
            >
              社
            </span>
          </div>
          <div className="text-right tabular-nums">
            <span
              className="text-[18px] font-[family-name:var(--font-display)] font-bold"
              style={{ color: RATE_COLOR_GOLD }}
            >
              {totals.trials}
            </span>
            <span
              className="ml-0.5 text-[11px]"
              style={{ color: RATE_COLOR_GOLD, opacity: 0.7 }}
            >
              社
            </span>
          </div>
          <div className="text-right tabular-nums">
            <span
              className="font-mono text-[20px] font-bold"
              style={{ color: RATE_COLOR_GOLD, textShadow: `0 0 14px ${RATE_COLOR_GOLD}66` }}
            >
              {totalRate}%
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Sub: ファネルカード ───────────────────────────────────────────────────────
function FunnelCard({
  label, value, color, condition, rateLabel, rate, rateColor, accent,
  activeDeals, activeLabel,
  rateTotal, rateTotalLabel, rateNumerator, rateNumeratorLabel, pastDeals,
}: {
  label: string
  value: number
  color: string
  condition: string
  // 移行率は省略可能（最終転換率を出さないカードがある）
  rateLabel?: string
  rate?: number
  rateColor?: string
  accent?: boolean
  activeDeals: Deal[]
  activeLabel: string
  // 移行率ホバー用：累計件数の内訳と過去案件
  rateTotal: number
  rateTotalLabel: string
  rateNumerator: number
  rateNumeratorLabel: string
  pastDeals: Deal[]
}) {
  // hover state: 'none' | 'card' | 'rate'
  const [hover, setHover] = useState<'none' | 'card' | 'rate'>('none')

  return (
    <div
      className="relative rounded-3xl p-5 flex flex-col transition-all duration-200 overflow-hidden"
      style={{
        background: `radial-gradient(circle at 10% 0%, ${color}1e 0%, transparent 34%), radial-gradient(circle at 92% 24%, ${color}10 0%, transparent 28%), linear-gradient(155deg, ${color}10 0%, rgba(39,40,45,0.88) 42%, rgba(13,14,18,0.98) 100%)`,
        backdropFilter: 'blur(20px) saturate(140%)',
        WebkitBackdropFilter: 'blur(20px) saturate(140%)',
        boxShadow: accent
          ? `inset 2px 0 0 ${color}, inset 0 0 0 1px ${color}60, inset 1px 1px 0 rgba(255,255,255,0.08), inset -1px -1px 0 rgba(0,0,0,0.30), 0 20px 52px rgba(0,0,0,0.34), 0 0 34px ${color}1e`
          : `inset 2px 0 0 ${color}d8, inset 0 0 0 1px rgba(171,199,255,0.13), inset 1px 1px 0 rgba(255,255,255,0.060), inset -1px -1px 0 rgba(0,0,0,0.30), 0 18px 46px rgba(0,0,0,0.30), 0 0 26px ${color}14`,
        transform: hover !== 'none' ? 'translateY(-2px)' : 'translateY(0)',
        transitionTimingFunction: 'var(--ease-liquid)',
        cursor: 'default',
        // ホバー中はカード自体を最前面に持ち上げて、下段カード(検証/契約/失注/ロスト)に
        // ポップアップが隠れないようにする
        zIndex: hover !== 'none' ? 50 : 'auto',
      }}
      onMouseEnter={() => setHover('card')}
      onMouseLeave={() => setHover('none')}
    >
      <span
        className="pointer-events-none absolute left-5 right-5 top-0 h-px"
        style={{
          background: `linear-gradient(90deg, transparent 0%, ${color}80 48%, rgba(255,255,255,0.18) 62%, transparent 100%)`,
        }}
      />
      <span
        className="pointer-events-none absolute left-0 right-0 bottom-0 h-px"
        style={{ background: `linear-gradient(90deg, transparent 0%, ${color}2e 48%, transparent 100%)` }}
      />
      {/* ambient orb */}
      <span
        aria-hidden
        className="pointer-events-none absolute -top-16 -right-12 w-40 h-40 rounded-full"
        style={{
          background: `radial-gradient(circle, ${color}28, transparent 62%)`,
          filter: 'blur(44px)',
        }}
      />
      <p
        className="relative inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-[0.14em] uppercase mb-2"
        style={{ color }}
      >
        <span
          className="w-1.5 h-1.5 rounded-full"
          style={{ background: color, boxShadow: `0 0 8px ${color}` }}
        />
        {label}
      </p>
      <div className="relative flex items-baseline gap-1 mb-4">
        <span
          className="font-[family-name:var(--font-display)] text-[44px] font-extrabold leading-none tabular-nums tracking-[-0.04em]"
          style={{
            background: `linear-gradient(180deg, #ffffff 0%, #e7e5ea 44%, ${color} 160%)`,
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            color: 'transparent',
            WebkitTextFillColor: 'transparent',
          }}
        >
          {value}
        </span>
        <span className="text-[12px] font-medium" style={{ color: '#c7c5c9' }}>社</span>
      </div>
      <p className="relative text-[9px] font-semibold tracking-[0.14em] uppercase mb-1" style={{ color: '#7e7c83' }}>
        認定条件
      </p>
      <p className="relative text-[11px] leading-[1.6] whitespace-pre-line flex-1" style={{ color: '#c7c5c9' }}>
        {condition}
      </p>

      {/* 移行率ボックス（ホバーで累計内訳＋過去案件ポップオーバー）
          rateLabel/rate が指定された時のみ表示（商談数カードでは非表示） */}
      {rateLabel !== undefined && rate !== undefined && (
        <div
          className="relative flex items-center justify-between mt-4 pt-3 -mx-2 px-2 rounded-lg cursor-help transition-colors duration-150"
          style={{
            boxShadow: 'inset 0 1px 0 0 rgba(171,199,255,0.14)',
            background:
              hover === 'rate'
                ? `linear-gradient(90deg, ${color}10 0%, rgba(171,199,255,0.045) 100%)`
                : 'transparent',
          }}
          onMouseEnter={() => setHover('rate')}
          onMouseLeave={() => setHover('card')}
        >
          <span
            className="text-[10px] font-semibold tracking-[0.14em] uppercase inline-flex items-center gap-1"
            style={{ color: '#9b99a0' }}
          >
            {rateLabel}
            <HelpCircle size={9} style={{ opacity: 0.6 }} />
          </span>
          <span
            className="font-mono text-[15px] font-bold tabular-nums"
            style={{ color: rateColor, textShadow: `0 0 10px ${rateColor}55` }}
          >
            {rate}%
          </span>
        </div>
      )}

      {/* カード全体ホバー：現在進行中の案件 */}
      {hover === 'card' && <DealHoverList deals={activeDeals} title={activeLabel} accent={color} />}

      {/* 移行率ホバー：累計内訳 + 過去案件 */}
      {hover === 'rate' && rate !== undefined && rateColor !== undefined && (
        <RateHoverDetail
          rate={rate}
          rateColor={rateColor}
          numerator={rateNumerator}
          numeratorLabel={rateNumeratorLabel}
          denominator={rateTotal}
          denominatorLabel={rateTotalLabel}
          pastDeals={pastDeals}
        />
      )}
    </div>
  )
}

// ─── Sub: 移行率ホバーの詳細 ───────────────────────────────────────────────────
function RateHoverDetail({
  rate, rateColor, numerator, numeratorLabel, denominator, denominatorLabel, pastDeals,
}: {
  rate: number
  rateColor: string
  numerator: number
  numeratorLabel: string
  denominator: number
  denominatorLabel: string
  pastDeals: Deal[]
}) {
  return (
    <div
      className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-[min(340px,calc(100vw-48px))] z-30 rounded-2xl overflow-hidden animate-[fadeIn_0.18s_ease-out] bg-pitch fo-glass-strong fo-glass-rim"
      style={{
        boxShadow: '0 18px 50px rgba(0,0,0,0.55)',
      }}
    >
      <span
        className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rotate-45 bg-pitch"
        style={{
          boxShadow: 'inset 0 0 0 1px rgba(171,199,255,0.18)',
        }}
      />
      {/* ── 計算式ヘッダー ── */}
      <div className="px-4 py-3 bg-dusk">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10.5px] font-semibold tracking-[0.14em] uppercase" style={{ color: rateColor }}>
            累計ベースの移行率
          </span>
          <span
            className="font-mono text-[18px] font-bold tabular-nums"
            style={{ color: rateColor, textShadow: `0 0 12px ${rateColor}66` }}
          >
            {rate}%
          </span>
        </div>
        <div className="flex items-baseline gap-3 text-[11px] tabular-nums" style={{ color: '#c7c5c9' }}>
          <span>
            <span style={{ color: '#7e7c83' }}>{numeratorLabel}：</span>
            <span className="font-semibold" style={{ color: '#e7e5ea' }}>{numerator}</span>
            <span className="ml-0.5" style={{ color: '#7e7c83' }}>社</span>
          </span>
          <span style={{ color: '#7e7c83' }}>/</span>
          <span>
            <span style={{ color: '#7e7c83' }}>{denominatorLabel}：</span>
            <span className="font-semibold" style={{ color: '#e7e5ea' }}>{denominator}</span>
            <span className="ml-0.5" style={{ color: '#7e7c83' }}>社</span>
          </span>
        </div>
      </div>

      {/* ── 過去案件一覧 ── */}
      <div className="px-4 py-2.5 flex items-center justify-between">
        <span className="text-[10.5px] font-semibold tracking-[0.14em] uppercase" style={{ color: '#abc7ff' }}>
          過去案件（失注・契約）
        </span>
        <span className="text-[10.5px] font-medium tabular-nums" style={{ color: '#7e7c83' }}>
          {pastDeals.length} 件
        </span>
      </div>
      {pastDeals.length === 0 ? (
        <div className="px-4 py-5 text-center text-[11.5px]" style={{ color: '#7e7c83' }}>
          過去案件はありません
        </div>
      ) : (
        <div className="max-h-[240px] overflow-y-auto fo-thin-scroll">
          {pastDeals.map((d, i) => {
            const b = bucketOf(d.stage)
            const isLost = b === '失注'
            const tone = isLost ? '#ff6b6b' : '#6ee7a1'
            const toneBg = isLost ? 'rgba(255,107,107,0.14)' : 'rgba(110,231,161,0.14)'
            return (
              <div
                key={d.id}
                className="px-4 py-2.5 flex items-start gap-3"
                style={{ borderTop: i === 0 ? '1px solid rgba(171,199,255,0.12)' : '1px solid rgba(171,199,255,0.06)' }}
              >
                <span className="font-mono text-[10.5px] tabular-nums mt-0.5 shrink-0" style={{ color: '#7e7c83' }}>
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[12px] font-semibold truncate" style={{ color: '#e7e5ea' }}>
                      {d.company}
                    </span>
                    <span
                      className="inline-flex items-center shrink-0 text-[9.5px] font-semibold h-[18px] px-1.5 rounded-full"
                      style={{ backgroundColor: toneBg, color: tone, boxShadow: `inset 0 0 0 1px ${tone}33` }}
                    >
                      {isLost ? '失注' : '契約'}
                    </span>
                  </div>
                  <div className="text-[10.5px] mt-0.5" style={{ color: '#c7c5c9' }}>
                    {d.owner}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function ArrowStep({ label }: { label: string }) {
  return (
    <div className="hidden lg:flex flex-col items-center justify-center gap-1.5 px-1">
      <span className="text-[10px] font-semibold tracking-[0.14em] uppercase" style={{ color: '#9b99a0' }}>
        {label}
      </span>
      <ArrowRight
        size={18}
        strokeWidth={1.5}
        style={{ color: '#abc7ff', filter: 'drop-shadow(0 0 6px rgba(171,199,255,0.5))' }}
      />
    </div>
  )
}

// ─── Sub: アウトカムカード（検証/契約/失注/ロスト） ─────────────────────────
function OutcomeCard({
  icon, label, value, rate, tone, deals, desc,
}: {
  icon: React.ReactNode
  label: string
  value: number
  rate?: number
  tone: 'hot' | 'success' | 'warning' | 'muted'
  deals: Deal[]
  desc?: string
}) {
  const [hover, setHover] = useState(false)
  const TONE_STYLE: Record<typeof tone, { color: string; bg: string }> = {
    hot:     { color: '#ff6b6b', bg: 'rgba(255,107,107,0.14)' },
    success: { color: '#6ee7a1', bg: 'rgba(110,231,161,0.14)' },
    warning: { color: '#ffb86b', bg: 'rgba(255,184,107,0.14)' },
    muted:   { color: '#abc7ff', bg: 'rgba(171,199,255,0.13)' },
  }
  const { color, bg } = TONE_STYLE[tone]
  return (
    <div
      className="relative rounded-3xl p-5 flex items-center gap-5 transition-all duration-200 overflow-hidden"
      style={{
        background: `linear-gradient(145deg, ${color}10 0%, rgba(36,37,42,0.82) 42%, rgba(17,18,22,0.96) 100%)`,
        backdropFilter: 'blur(18px) saturate(135%)',
        WebkitBackdropFilter: 'blur(18px) saturate(135%)',
        boxShadow: `inset 2px 0 0 ${color}b8, inset 0 0 0 1px rgba(171,199,255,0.10), inset 1px 1px 0 rgba(255,255,255,0.055), inset -1px -1px 0 rgba(0,0,0,0.26), 0 14px 38px rgba(0,0,0,0.25), 0 0 22px ${color}0f`,
        transform: hover ? 'translateY(-2px)' : 'translateY(0)',
        transitionTimingFunction: 'var(--ease-liquid)',
        cursor: 'default',
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <span
        className="pointer-events-none absolute left-5 right-5 top-0 h-px"
        style={{
          background: `linear-gradient(90deg, transparent 0%, ${color}48 50%, transparent 100%)`,
        }}
      />
      {/* ambient orb */}
      <span
        aria-hidden
        className="pointer-events-none absolute -top-12 -right-10 w-32 h-32 rounded-full"
        style={{
          background: `radial-gradient(circle, ${color}1c, transparent 62%)`,
          filter: 'blur(40px)',
        }}
      />
      <div
        className="relative w-10 h-10 rounded-full flex items-center justify-center shrink-0"
        style={{
          backgroundColor: bg,
          color,
          boxShadow: `inset 0 0 0 1px ${color}33, 0 0 14px ${color}33`,
        }}
      >
        {icon}
      </div>
      <div className="relative flex-1 min-w-0">
        <p
          className="inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-[0.14em] uppercase mb-1"
          style={{ color }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: color, boxShadow: `0 0 8px ${color}` }}
          />
          {label}
        </p>
        <div className="flex items-baseline gap-1">
          <span
            className="font-[family-name:var(--font-display)] text-[32px] font-extrabold leading-none tabular-nums tracking-[-0.04em]"
            style={{ color: '#e7e5ea' }}
          >
            {value}
          </span>
          <span className="text-[11px]" style={{ color: '#c7c5c9' }}>社</span>
        </div>
        {desc && (
          <p
            className="text-[10.5px] mt-1.5 leading-snug"
            style={{ color: '#9b99a0' }}
          >
            {desc}
          </p>
        )}
      </div>
      {typeof rate === 'number' && (
        <div className="relative text-right">
          <p className="text-[10px] font-semibold tracking-[0.14em] uppercase mb-0.5" style={{ color: '#7e7c83' }}>
            PJ進行中比
          </p>
          <span
            className="font-mono text-[15px] font-bold tabular-nums"
            style={{ color, textShadow: `0 0 10px ${color}55` }}
          >
            {rate}%
          </span>
        </div>
      )}

      {/* ホバー：該当案件ポップオーバー */}
      {hover && <DealHoverList deals={deals} title={`${label}した案件`} accent={color} />}
    </div>
  )
}

// ─── Sub: ホバーポップオーバー（案件一覧） ─────────────────────────────────────
function DealHoverList({ deals, title, accent }: { deals: Deal[]; title: string; accent: string }) {
  return (
    <div
      className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-[min(320px,calc(100vw-48px))] z-50 rounded-2xl overflow-hidden animate-[fadeIn_0.18s_ease-out] bg-pitch fo-glass-strong fo-glass-rim"
      style={{
        boxShadow: '0 24px 64px rgba(0,0,0,0.7)',
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* 矢印 */}
      <span
        className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rotate-45 bg-pitch"
        style={{
          boxShadow: 'inset 0 0 0 1px rgba(171,199,255,0.18)',
        }}
      />
      <div
        className="px-4 py-2.5 flex items-center justify-between bg-dusk"
        style={{ borderBottom: '1px solid rgba(171,199,255,0.10)' }}
      >
        <span className="text-[10.5px] font-semibold tracking-[0.14em] uppercase" style={{ color: accent }}>
          {title}
        </span>
        <span className="text-[10.5px] font-medium tabular-nums" style={{ color: '#7e7c83' }}>
          {deals.length} 件
        </span>
      </div>
      {deals.length === 0 ? (
        <div className="px-4 py-6 text-center text-[11.5px]" style={{ color: '#7e7c83' }}>
          該当する案件はありません
        </div>
      ) : (
        <div className="max-h-[280px] overflow-y-auto fo-thin-scroll">
          {deals.map((d, i) => (
            <div
              key={d.id}
              className="px-4 py-2 flex items-center gap-3"
              style={{ borderTop: i === 0 ? 'none' : '1px solid rgba(171,199,255,0.06)' }}
            >
              <span
                className="font-mono text-[10.5px] tabular-nums shrink-0"
                style={{ color: '#7e7c83' }}
              >
                {String(i + 1).padStart(2, '0')}
              </span>
              <div
                className="text-[12.5px] font-semibold truncate flex-1 min-w-0"
                style={{ color: '#e7e5ea' }}
              >
                {d.company}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Activity Gauges ───────────────────────────────────────────────────────────
// メール：5段階（3, 5, 7, 10, 12+）
// 商談：5段階（1, 2, 3, 5, 7+）色変化あり

type GaugeLevel = 0 | 1 | 2 | 3 | 4 | 5

function emailLevel(n: number): GaugeLevel {
  if (n <= 0) return 0
  if (n <= 3) return 1
  if (n <= 5) return 2
  if (n <= 7) return 3
  if (n <= 10) return 4
  return 5
}
function meetingLevel(n: number): GaugeLevel {
  if (n <= 0) return 0
  if (n <= 1) return 1
  if (n <= 2) return 2
  if (n <= 3) return 3
  if (n <= 5) return 4
  return 5
}

type Tier = {
  name: string
  core: string         // 基本色（ラベル・ベース）
  grad: string         // グラデーション用 CSS
  glow: string         // outer glow color
}

const TIERS: Tier[] = [
  {
    name: 'COMMON',
    core: '#7aa7ff',
    grad: 'linear-gradient(180deg, #dce7ff 0%, #7aa7ff 36%, #315bd8 100%)',
    glow: 'rgba(122,167,255,0.38)',
  },
  {
    name: 'RARE',
    core: '#26d9ff',
    grad: 'linear-gradient(180deg, #c9f7ff 0%, #26d9ff 38%, #0071e3 100%)',
    glow: 'rgba(38,217,255,0.42)',
  },
  {
    name: 'EPIC',
    core: '#38f5a5',
    grad: 'linear-gradient(180deg, #c8ffe6 0%, #38f5a5 38%, #07995f 100%)',
    glow: 'rgba(56,245,165,0.40)',
  },
  {
    name: 'LEGENDARY',
    core: '#ff9a3d',
    grad: 'linear-gradient(180deg, #ffe0ad 0%, #ff9a3d 36%, #d94a16 100%)',
    glow: 'rgba(255,154,61,0.46)',
  },
  {
    name: 'MYTHIC',
    core: '#ff4d3d',
    grad: 'linear-gradient(180deg, #ffd1aa 0%, #ff6a2f 34%, #ff2d55 72%, #9f1029 100%)',
    glow: 'rgba(255,77,61,0.54)',
  },
]

function SegmentedGauge({
  level,
  labels,
}: {
  level: GaugeLevel
  labels: readonly string[]
}) {
  return (
    <div className="flex-1 min-w-0">
      <div className="flex gap-[3px]">
        {[0, 1, 2, 3, 4].map((i) => {
          const filled = i < level
          const tier = TIERS[i] ?? TIERS[0]!
          return (
            <div
              key={i}
              className="relative h-[8px] flex-1 rounded-[2px] overflow-hidden transition-all duration-300"
              style={{
                background: filled
                  ? tier.grad
                  : 'linear-gradient(180deg, rgba(18,19,23,0.94) 0%, rgba(11,12,15,0.98) 100%)',
                boxShadow: filled
                  ? `0 0 10px ${tier.glow}, 0 0 2px ${tier.core}, inset 0 1px 0 rgba(255,255,255,0.38), inset 0 -1px 0 rgba(0,0,0,0.34)`
                  : 'inset 0 0 0 1px rgba(171,199,255,0.10)',
                transitionTimingFunction: 'var(--ease-liquid)',
              }}
            />
          )
        })}
      </div>
      <div className="flex items-center gap-[3px] mt-1">
        {labels.map((lab, i) => {
          const tier = TIERS[i] ?? TIERS[0]!
          return (
            <span
              key={i}
              className="flex-1 font-mono text-[8.5px] font-bold text-center tabular-nums"
              style={{
                color: i < level ? tier.core : 'rgba(126,136,154,0.38)',
                textShadow: 'none',
              }}
            >
              {lab}
            </span>
          )
        })}
      </div>
    </div>
  )
}

function formatCreatedAt(iso: string): string {
  // 日本語で「MM月DD日作成」
  const d = new Date(iso)
  if (isNaN(d.getTime())) return iso
  const m = d.getMonth() + 1
  const dd = d.getDate()
  const y = d.getFullYear()
  const now = new Date()
  const sameYear = now.getFullYear() === y
  return sameYear ? `${m}月${dd}日 作成` : `${y}年${m}月${dd}日 作成`
}

// 日本円表記（万円単位、1億以上は億併記）
function formatJpy(amount: number): string {
  if (amount < 10_000) return `${amount.toLocaleString()}円`
  const man = Math.round(amount / 10_000)
  if (man < 10_000) return `${man.toLocaleString()}万円`
  const oku = man / 10_000
  return `${oku.toFixed(oku < 10 ? 2 : 1)}億円`
}

// ゲージのレベル目安（表示用）
const EMAIL_THRESHOLDS = ['3', '5', '7', '10', '12+'] as const
const MEETING_THRESHOLDS = ['1', '2', '3', '5', '7+'] as const

// ─── DealCard ─────────────────────────────────────────────────────────────────

function DealCard({
  deal,
  onDragStart,
  onDragEnd,
}: {
  deal: Deal
  onDragStart: (e: DragEvent<HTMLDivElement>) => void
  onDragEnd: (e: DragEvent<HTMLDivElement>) => void
}) {
  const eLv = emailLevel(deal.emailCount)
  const mLv = meetingLevel(deal.meetingCount)
  const emailTier = eLv > 0 ? TIERS[eLv - 1] ?? null : null
  const meetingTier = mLv > 0 ? TIERS[mLv - 1] ?? null : null
  const stageTone = STAGES.find((stage) => stage.key === deal.stage)?.color
  const accentColor = stageTone?.accent ?? '#abc7ff'
  // §13 Recipe A (Standard Glass Card) + §18 翻訳ガイドで Service 強度 -1 段
  // - bg-dusk (#242426) ベースに stage 色は左 edge アクセントのみ
  // - 多重 shadow を fo-glass-rim + 軽量 inset accent に圧縮
  // - hover は §16 Motion で translateY のみ、ambient glow は廃止

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      className="relative overflow-hidden rounded-2xl bg-dusk fo-glass-rim p-4 cursor-grab active:cursor-grabbing transition-all duration-200 group"
      style={{
        boxShadow: `inset 2px 0 0 ${accentColor}, inset 0 0 0 1px rgba(171,199,255,0.10), inset -1px -1px 0 rgba(0,0,0,0.22)`,
        transitionTimingFunction: 'var(--ease-liquid)',
      }}
      onMouseOver={(e) => {
        ;(e.currentTarget as HTMLDivElement).style.boxShadow = `inset 2px 0 0 ${accentColor}, inset 0 0 0 1px ${accentColor}38, inset -1px -1px 0 rgba(0,0,0,0.22)`
        ;(e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)'
      }}
      onMouseOut={(e) => {
        ;(e.currentTarget as HTMLDivElement).style.boxShadow = `inset 2px 0 0 ${accentColor}, inset 0 0 0 1px rgba(171,199,255,0.10), inset -1px -1px 0 rgba(0,0,0,0.22)`
        ;(e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'
      }}
    >
      {/* Header: 1stパーティ シグナル + createdAt */}
      <div className="flex justify-between items-start mb-2.5">
        <SignalBadge signal={deal.intent} />
        <span
          className="inline-flex items-center gap-1 text-[9.5px] tabular-nums"
          style={{ color: '#7e7c83' }}
        >
          <Calendar size={10} />
          {formatCreatedAt(deal.createdAt)}
        </span>
      </div>

      {/* Title (取引先名 = 企業名) — クリックで取引詳細へ。drag は親カードに任せる */}
      <h4
        className="text-sm font-semibold mb-1 leading-snug tracking-[-0.01em]"
        style={{ color: '#e7e5ea' }}
      >
        <Link
          href={`/deals/${deal.id}`}
          className="hover:underline group-hover:text-[color:var(--color-obs-primary)] transition-colors duration-150"
          style={{ color: 'inherit' }}
          onClick={(e) => e.stopPropagation()}
          draggable={false}
          onDragStart={(e) => e.preventDefault()}
        >
          {deal.company}
        </Link>
      </h4>

      {/* Activity Gauges — メール + 商談 */}
      <div className="mt-4 space-y-3">
        <div className="flex items-start gap-2.5">
          <span
            className="w-10 shrink-0 text-[9px] font-semibold tracking-[0.14em] uppercase leading-[8px]"
            style={{ color: 'var(--color-obs-text-subtle)' }}
          >
            メール
          </span>
          <SegmentedGauge level={eLv} labels={EMAIL_THRESHOLDS} />
          <span
            className="font-mono text-[11px] font-black tabular-nums w-8 text-right shrink-0 leading-[8px]"
            style={{
              color: emailTier ? emailTier.core : '#7e7c83',
              textShadow: 'none',
            }}
          >
            {deal.emailCount}
          </span>
        </div>
        <div className="flex items-start gap-2.5">
          <span
            className="w-10 shrink-0 text-[9px] font-semibold tracking-[0.14em] uppercase leading-[8px]"
            style={{ color: 'var(--color-obs-text-subtle)' }}
          >
            商談
          </span>
          <SegmentedGauge level={mLv} labels={MEETING_THRESHOLDS} />
          <span
            className="font-mono text-[11px] font-black tabular-nums w-8 text-right shrink-0 leading-[8px]"
            style={{
              color: meetingTier ? meetingTier.core : '#7e7c83',
              textShadow: 'none',
            }}
          >
            {deal.meetingCount}
          </span>
        </div>
      </div>

      {/* Status + Next Step (2段) */}
      {(deal.status || deal.nextAction) && (
        <div
          className="mt-4 pt-3 flex flex-col gap-1.5"
          style={{ borderTop: '1px solid rgba(171,199,255,0.10)' }}
        >
          {deal.status && (
            <div className="flex items-center gap-2 min-w-0">
              <span
                className="px-1.5 h-4 rounded-sm text-[9px] font-semibold tracking-[0.14em] uppercase inline-flex items-center shrink-0"
                style={{
                  backgroundColor: 'rgba(255,255,255,0.065)',
                  color: 'var(--color-obs-text-muted)',
                  boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.055)',
                }}
              >
                Status
              </span>
              <span
                className="text-[11px] font-medium truncate flex-1"
                style={{ color: '#c7c5c9' }}
                title={deal.status}
              >
                {deal.status}
              </span>
            </div>
          )}
          {deal.nextAction && (
            <div className="flex items-center gap-2 min-w-0">
              <span
                className="px-1.5 h-4 rounded-sm text-[9px] font-semibold tracking-[0.14em] uppercase inline-flex items-center shrink-0"
                style={{
                  backgroundColor: 'rgba(171,199,255,0.13)',
                  color: '#abc7ff',
                  boxShadow: 'inset 0 0 0 1px rgba(171,199,255,0.16)',
                }}
              >
                Next
              </span>
              <span
                className="text-[11px] font-medium truncate flex-1"
                style={{ color: '#e7e5ea' }}
                title={deal.nextAction}
              >
                {deal.nextAction}
              </span>
              {deal.nextActionDate && (
                <span
                  className="font-mono text-[10px] tabular-nums shrink-0"
                  style={{ color: '#abc7ff' }}
                >
                  {deal.nextActionDate}
                </span>
              )}
            </div>
          )}
        </div>
      )}

      {/* Footer: owner + amount */}
      <div
        className="flex items-center justify-between mt-3 pt-3"
        style={{ borderTop: '1px solid rgba(171,199,255,0.10)' }}
      >
        <div className="flex items-center gap-1.5 min-w-0">
          {/* Owner Orb (Photon Drift) */}
          <span
            className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
            style={{
              background:
                'radial-gradient(circle at 30% 30%, #ffffff 0%, #abc7ff 35%, rgba(171,199,255,0.50) 80%)',
              boxShadow: '0 0 10px rgba(171,199,255,0.55), 0 0 22px rgba(171,199,255,0.30)',
            }}
          >
            <span
              className="text-[9px] font-bold leading-none"
              style={{ color: '#0a0a0c' }}
            >
              {deal.owner[0]}
            </span>
          </span>
          <span
            className="text-[11px] font-medium truncate"
            style={{ color: '#c7c5c9' }}
          >
            {deal.owner}
          </span>
        </div>
        {deal.amount > 0 && (
          <span
            className="font-mono text-[12px] font-bold tabular-nums shrink-0"
            style={{ color: '#e7e5ea' }}
          >
            {formatJpy(deal.amount)}
          </span>
        )}
      </div>
    </div>
  )
}
