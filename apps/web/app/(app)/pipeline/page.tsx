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
import { ObsPageShell } from '@/components/obsidian'
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

// ─── Mock Data ────────────────────────────────────────────────────────────────

const INITIAL_DEALS: Deal[] = [
  { id: 'd1',  code: 'RKS-0842', name: 'グローバルERP統合計画',       company: '株式会社テクノリード',    contact: '田中 誠',    amount: 12_500_000, intent: 'Hot',    owner: '田中太郎', stage: 'IS',              order: 0, probability: 35, dueDate: '14 Oct', createdAt: '2026-04-02', emailCount: 2,  meetingCount: 0, status: 'アポ獲得待ち', nextAction: '初回コール', nextActionDate: '4/22', sourceCategory: 'web', source: 'HP' },
  { id: 'd2',  code: 'RKS-1209', name: 'マーケティングHub連携',       company: '合同会社ビジョン',        contact: '加藤 雄介',  amount: 2_100_000,  intent: 'Low',    owner: '佐藤次郎', stage: 'IS',              order: 1, probability: 15, dueDate: '21 Oct', createdAt: '2026-04-08', emailCount: 1,  meetingCount: 0, status: '期日超過(2日)', nextAction: '資料送付', nextActionDate: '4/20', sourceCategory: 'web', source: 'HP' },
  { id: 'd4',  code: 'RKS-1104', name: 'SFA刷新案件 - A社',          company: '有限会社サクセス',        contact: '小林 健太',  amount: 5_200_000,  intent: 'Middle', owner: '鈴木花子', stage: 'MEETING_PLANNED', order: 0, probability: 52, dueDate: '28 Oct', createdAt: '2026-03-22', emailCount: 4,  meetingCount: 0, status: '初回商談前', nextAction: '商談実施', nextActionDate: '4/28', sourceCategory: 'referral', source: '名和さん紹介' },
  { id: 'd5',  code: 'RKS-1066', name: '物流最適化システム提案',      company: '株式会社イノベーション',  contact: '佐々木 拓也', amount: 3_600_000,  intent: 'Middle', owner: '田中太郎', stage: 'MEETING_DONE',    order: 0, probability: 60, createdAt: '2026-03-10', emailCount: 8,  meetingCount: 1, status: '提案書レビュー待ち(先方CTO)', nextAction: '提案書レビュー', nextActionDate: '4/23', sourceCategory: 'event', source: 'IT・情シス DXPO' },
  { id: 'd6',  code: 'RKS-1122', name: '基幹システムクラウド移行',    company: '株式会社グロース',        contact: '中村 理恵',  amount: 18_500_000, intent: 'Hot',    owner: '田中太郎', stage: 'PROJECT_PLANNED', order: 0, probability: 92, priorityPhase: 'PRIORITY Q4', createdAt: '2026-02-18', emailCount: 22, meetingCount: 3, status: '決裁者MTG調整中', nextAction: '決裁者MTG', nextActionDate: '4/25', sourceCategory: 'partner', source: '株式会社アシスト' },
  { id: 'd7',  code: 'RKS-0901', name: 'AI解析エンジン検証',          company: '株式会社ネクスト',        contact: '鈴木 美香',  amount: 6_800_000,  intent: 'Hot',    owner: '田中太郎', stage: 'POC',             order: 0, probability: 70, priorityPhase: 'Phase: Model Validation', createdAt: '2026-02-01', emailCount: 35, meetingCount: 5, status: 'PoC進行中 (週次定例)', nextAction: 'POC中間報告', nextActionDate: '4/26', sourceCategory: 'web', source: 'HP' },
  { id: 'd8',  code: 'RKS-0718', name: 'エンタープライズ契約（2期）', company: '株式会社テクノリード',    contact: '田中 誠',    amount: 48_000_000, intent: 'Hot',    owner: '田中太郎', stage: 'CLOSED_WON',      order: 0, probability: 100, createdAt: '2025-12-12', emailCount: 58, meetingCount: 12, status: '契約完了 / オンボ開始', nextAction: 'オンボーディング', nextActionDate: '5/1', sourceCategory: 'event', source: 'Startup JAPAN EXPO' },
  { id: 'd10', code: 'RKS-0821', name: 'データ分析基盤構築',         company: '株式会社アルファ',        contact: '渡辺 健二',  amount: 1_500_000,  intent: 'Middle', owner: '鈴木花子', stage: 'LOST_DEAL',       order: 0, createdAt: '2026-01-20', emailCount: 11, meetingCount: 2, sourceCategory: 'media', source: 'アイスマイリー',       status: 'POC後に競合決定 (機能差で失注)', nextAction: '失注理由ヒアリング',   nextActionDate: '1/30' },
  { id: 'd11', code: 'RKS-0633', name: 'カスタマーサクセス契約',     company: '合同会社ベータ',          contact: '佐藤 良子',  amount: 960_000,    intent: 'Middle', owner: '田中太郎', stage: 'CHURN',           order: 0, createdAt: '2025-10-05', emailCount: 40, meetingCount: 4, sourceCategory: 'partner', source: '後藤さん紹介',          status: 'Q4更新で解約 (社内体制変更)',     nextAction: 'Win-back提案準備',     nextActionDate: '11/1' },
  { id: 'd12', code: 'RKS-0299', name: 'AI活用コンサルティング',     company: '株式会社デルタ',          contact: '木村 隆',    amount: 2_100_000,  intent: 'Hot',    owner: '佐藤次郎', stage: 'LOST',            order: 0, createdAt: '2026-01-08', emailCount: 14, meetingCount: 2, sourceCategory: 'event', source: 'デジタル化・DX推進展', status: '追客終了 (3ヶ月接触なし)',        nextAction: '対応終了',             nextActionDate: '—' },
]

// ─── Stages ────────────────────────────────────────────────────────────────────

// 色は Liquid Obsidian デザインシステムのパレット (primary / low / middle / hot / text系) のみで構成
// アクセントは控えめ。ヘッダーやドットは subtle に光らせる程度。
type StageColor = { accent: string; bg: string; glow: string; text: string }

// フェーズの進行感は色相で表現（中立→primary→middle→success→hot/muted）
const STAGES: { key: StageKey; label: string; desc: string; color: StageColor }[] = [
  // 出発点 — outline / muted
  { key: 'IS',               label: 'IS',             desc: '未商談の企業へアプローチ',
    color: { accent: '#8f8c90', bg: 'rgba(143,140,144,0.10)', glow: 'rgba(143,140,144,0.20)', text: '#c7c5c9' } },
  // 商談 — primary blue
  { key: 'MEETING_PLANNED',  label: '商談予定',       desc: '初回商談がスケジュール済み',
    color: { accent: '#abc7ff', bg: 'rgba(171,199,255,0.10)', glow: 'rgba(171,199,255,0.20)', text: '#c7d6ff' } },
  { key: 'MEETING_DONE',     label: '商談済み',       desc: '初回商談が完了した案件',
    color: { accent: '#abc7ff', bg: 'rgba(171,199,255,0.12)', glow: 'rgba(171,199,255,0.22)', text: '#c7d6ff' } },
  // PJ化 — low (cyan-blue)
  { key: 'PROJECT_PLANNED',  label: 'PJ化予定あり',   desc: '具体的なプロジェクト化が見込める',
    color: { accent: '#7ec6ff', bg: 'rgba(126,198,255,0.12)', glow: 'rgba(126,198,255,0.22)', text: '#a8d6ff' } },
  // PJ進行 / 検証 — middle (orange)
  { key: 'MULTI_MEETING',    label: '複数商談済み',   desc: '2回以上の商談を実施済み',
    color: { accent: '#ffb86b', bg: 'rgba(255,184,107,0.10)', glow: 'rgba(255,184,107,0.20)', text: '#ffce99' } },
  { key: 'POC',              label: 'POC',            desc: '検証・トライアルを実施中',
    color: { accent: '#ffb86b', bg: 'rgba(255,184,107,0.12)', glow: 'rgba(255,184,107,0.22)', text: '#ffce99' } },
  // 受注 — emerald (success の唯一の例外色。緑で成功を伝える)
  { key: 'CLOSED_WON',       label: '受注',           desc: '契約締結が完了した案件',
    color: { accent: '#6ee7a1', bg: 'rgba(110,231,161,0.12)', glow: 'rgba(110,231,161,0.22)', text: '#9af0c0' } },
  // 失注・チャーン — hot
  { key: 'LOST_DEAL',        label: '失注',           desc: 'POC後に受注に至らなかった案件',
    color: { accent: '#ff6b6b', bg: 'rgba(255,107,107,0.10)', glow: 'rgba(255,107,107,0.20)', text: '#ff8a8a' } },
  { key: 'CHURN',            label: 'チャーン',       desc: '契約後に解約となった案件',
    color: { accent: '#ff6b6b', bg: 'rgba(255,107,107,0.10)', glow: 'rgba(255,107,107,0.20)', text: '#ff8a8a' } },
  { key: 'LOST',             label: 'ロスト',         desc: '追客を完全に終了した案件',
    color: { accent: '#6d6a6f', bg: 'rgba(109,106,111,0.12)', glow: 'rgba(109,106,111,0.18)', text: '#8f8c90' } },
]

const OWNERS = ['全員', '田中太郎', '鈴木花子', '佐藤次郎']


// ─── Page ─────────────────────────────────────────────────────────────────────

type ViewMode = 'kanban' | 'funnel'

export default function PipelinePage() {
  const [deals, setDeals] = useState<Deal[]>(INITIAL_DEALS)
  const [ownerFilter, setOwnerFilter] = useState('全員')
  const [dragOverStage, setDragOverStage] = useState<StageKey | null>(null)
  const [view, setView] = useState<ViewMode>('kanban')
  const dragDealId = useRef<string | null>(null)

  const filtered = useMemo(() => {
    if (ownerFilter === '全員') return deals
    return deals.filter((d) => d.owner === ownerFilter)
  }, [deals, ownerFilter])

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
        className="w-full min-h-[calc(100vh-56px)] pb-16 stitch-dots"
        style={{ backgroundColor: 'var(--color-obs-surface)' }}
      >
        <div className="w-full px-8 xl:px-12 2xl:px-16 pt-10">
          {/* ── Hero ── */}
          <div className="mb-10 max-w-5xl">
            <span
              className="inline-block text-[11px] font-medium tracking-[0.14em] uppercase mb-3"
              style={{ color: 'var(--color-obs-text-subtle)' }}
            >
              Pipeline
            </span>
            <h1
              className="font-[family-name:var(--font-display)] text-[clamp(2rem,4vw,3.25rem)] font-semibold leading-[1.05] tracking-[-0.03em] mb-3 stitch-title-gradient"
            >
              パイプライン
            </h1>
          </div>

          {/* ── View Tabs（Segmented Control） ── */}
          <div
            className="inline-flex items-center p-1 rounded-[var(--radius-obs-lg)] mb-6 relative"
            style={{
              backgroundColor: 'var(--color-obs-surface-low)',
              boxShadow: 'inset 0 0 0 1px rgba(65,71,83,0.3)',
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
                  className="relative z-[1] h-9 px-5 rounded-[calc(var(--radius-obs-lg)-0.25rem)] text-[13px] font-medium transition-all duration-200 flex items-center gap-2"
                  style={{
                    color: active ? 'var(--color-obs-on-primary)' : 'var(--color-obs-text-muted)',
                    background: active
                      ? 'linear-gradient(140deg, var(--color-obs-primary) 0%, var(--color-obs-primary-container) 100%)'
                      : 'transparent',
                    boxShadow: active
                      ? 'inset 0 1px 0 rgba(255,255,255,0.18), 0 4px 16px rgba(0,113,227,0.28)'
                      : 'none',
                    transitionTimingFunction: 'var(--ease-liquid)',
                  }}
                >
                  {t.label}
                  {t.badge != null && (
                    <span
                      className="min-w-[20px] h-[20px] px-1.5 rounded-full text-[10px] font-semibold tabular-nums flex items-center justify-center leading-none"
                      style={{
                        backgroundColor: active ? 'rgba(255,255,255,0.18)' : 'var(--color-obs-surface-high)',
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
              {/* ── Owner Filter ── */}
              <div className="flex items-center gap-2 mb-6 flex-wrap">
                {OWNERS.map((o) => {
                  const active = ownerFilter === o
                  return (
                    <button
                      key={o}
                      onClick={() => setOwnerFilter(o)}
                      className="h-8 px-3.5 rounded-full text-[11px] font-medium transition-colors duration-150"
                      style={{
                        backgroundColor: active ? 'rgba(0,113,227,0.14)' : 'rgba(65,71,83,0.15)',
                        color: active ? 'var(--color-obs-primary)' : 'var(--color-obs-text-muted)',
                        boxShadow: active ? 'inset 0 0 0 1px rgba(171,199,255,0.22)' : 'none',
                        transitionTimingFunction: 'var(--ease-liquid)',
                      }}
                    >
                      {o}
                    </button>
                  )
                })}
                <span className="ml-auto text-[11px] tracking-[0.08em] uppercase" style={{ color: 'var(--color-obs-text-subtle)' }}>
                  {filtered.length}件
                </span>
              </div>

              {/* ── Kanban ── */}
              <div className="flex gap-6 overflow-x-auto pb-8 stitch-scroll select-none">
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
                  {/* Column header — Liquid Obsidian トーン (subtle・フラット) */}
                  <div className="mb-4">
                    <div
                      className="rounded-[var(--radius-obs-md)] px-3 py-2.5 mb-1.5 relative overflow-hidden"
                      style={{
                        backgroundColor: 'var(--color-obs-surface-high)',
                        boxShadow: `inset 0 0 0 1px ${stage.color.accent}1f`,
                      }}
                    >
                      {/* 左端のカラーバー — グロー削除、フラットなアクセント */}
                      <span
                        className="absolute left-0 top-0 bottom-0 w-[2px]"
                        style={{
                          backgroundColor: stage.color.accent,
                          opacity: 0.7,
                        }}
                      />

                      <div className="flex items-center justify-between mb-1 pl-1">
                        <div className="flex items-center gap-2 min-w-0">
                          <span
                            className="w-1.5 h-1.5 rounded-full shrink-0"
                            style={{ backgroundColor: stage.color.accent }}
                          />
                          <h3
                            className="font-[family-name:var(--font-display)] text-[13px] font-semibold tracking-[-0.005em] leading-none"
                            style={{ color: 'var(--color-obs-text)' }}
                          >
                            {stage.label}
                          </h3>
                          <span
                            className="text-[10px] font-medium tabular-nums px-1.5 h-4 rounded-sm inline-flex items-center leading-none"
                            style={{
                              backgroundColor: `${stage.color.accent}1f`,
                              color: stage.color.accent,
                            }}
                          >
                            {stageDeals.length}
                          </span>
                        </div>
                        {stageDeals.length > 0 && (
                          <span
                            className="text-[11px] font-semibold tabular-nums"
                            style={{ color: 'var(--color-obs-text-muted)' }}
                          >
                            {formatJpy(stageDeals.reduce((s, d) => s + d.amount, 0))}
                          </span>
                        )}
                      </div>
                      <p
                        className="text-[10px] leading-tight pl-1"
                        style={{ color: 'var(--color-obs-text-subtle)' }}
                      >
                        {stage.desc}
                      </p>
                    </div>
                  </div>

                  {/* Cards container */}
                  <div
                    className="flex flex-col gap-4 min-h-[120px] rounded-[var(--radius-obs-lg)] transition-colors duration-200"
                    style={{
                      backgroundColor: isOver ? 'rgba(0,113,227,0.06)' : 'transparent',
                      padding: isOver ? '0.5rem' : 0,
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
  '順調':   { color: '#6ee7a1',                       bg: 'rgba(110,231,161,0.12)', ring: 'rgba(110,231,161,0.35)' },
  '要注意': { color: 'var(--color-obs-middle)',       bg: 'rgba(255,184,107,0.12)', ring: 'rgba(255,184,107,0.35)' },
  '危険':   { color: 'var(--color-obs-hot)',          bg: 'rgba(255,107,107,0.12)', ring: 'rgba(255,107,107,0.35)' },
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
  '有効商談': { label: '商談済み',              color: 'var(--color-obs-primary)',   bg: 'rgba(171,199,255,0.12)' },
  'PJ可能':   { label: 'プロジェクト化予定あり', color: 'var(--color-obs-low)',       bg: 'rgba(126,198,255,0.14)' },
  'PJ進行':   { label: 'プロジェクト進行中',     color: '#6ee7a1',                    bg: 'rgba(110,231,161,0.14)' },
  '検証':     { label: '検証中',                color: '#c9a94b',                    bg: 'rgba(201,169,75,0.14)' },
  '失注':     { label: '失注（ロスト）',         color: 'var(--color-obs-hot)',       bg: 'rgba(255,107,107,0.14)' },
  '契約':     { label: '契約済み',              color: '#6ee7a1',                    bg: 'rgba(110,231,161,0.14)' },
  'ロスト':   { label: '失注（ロスト）',         color: 'var(--color-obs-text-muted)', bg: 'rgba(143,140,144,0.16)' },
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
        <div className="flex items-center gap-1">
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
                className="h-9 px-4 text-[12px] font-medium transition-colors duration-150 relative"
                style={{
                  color: active ? 'var(--color-obs-primary)' : 'var(--color-obs-text-muted)',
                  transitionTimingFunction: 'var(--ease-liquid)',
                }}
              >
                {t.label}
                {active && (
                  <span
                    className="absolute bottom-0 left-2 right-2 h-[2px] rounded-full"
                    style={{
                      background: 'linear-gradient(90deg, var(--color-obs-primary), var(--color-obs-primary-container))',
                      boxShadow: '0 0 8px rgba(0,113,227,0.5)',
                    }}
                  />
                )}
              </button>
            )
          })}
        </div>

        <span className="h-6 w-px" style={{ backgroundColor: 'var(--color-obs-outline-variant)' }} />

        <div className="flex items-center gap-1.5 flex-wrap">
          {OWNER_LIST.map((o) => {
            const active = owner === o
            const label = o === '全員' ? '全体' : o
            return (
              <button
                key={o}
                onClick={() => setOwner(o)}
                className="h-7 px-3 rounded-full text-[11px] font-medium transition-colors duration-150"
                style={{
                  backgroundColor: active ? 'rgba(0,113,227,0.14)' : 'transparent',
                  color: active ? 'var(--color-obs-primary)' : 'var(--color-obs-text-muted)',
                  boxShadow: active ? 'inset 0 0 0 1px rgba(171,199,255,0.22)' : 'none',
                  transitionTimingFunction: 'var(--ease-liquid)',
                }}
              >
                {label}
              </button>
            )
          })}
        </div>

      </div>

      {/* ─── エグゼクティブサマリー（常時編集可能・自動保存） ─── */}
      <div
        className="stitch-glass stitch-glow-border rounded-[var(--radius-obs-xl)] p-6 relative"
      >
        <div className="flex items-center gap-3 mb-5">
          <span className="w-6 h-px" style={{ backgroundColor: 'var(--color-obs-outline-variant)' }} />
          <span className="text-[11px] font-medium tracking-[0.1em] uppercase" style={{ color: 'var(--color-obs-text-muted)' }}>
            エグゼクティブサマリー
          </span>
          <span className="text-[10px]" style={{ color: 'var(--color-obs-text-subtle)' }}>
            自動保存
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[220px_1fr_1fr] gap-8">
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
              className="mt-3 w-full rounded-[var(--radius-obs-md)] p-3 text-[12.5px] leading-[1.8] resize-y font-[family-name:var(--font-body)]"
              style={{
                backgroundColor: 'var(--color-obs-surface-low)',
                color: 'var(--color-obs-text)',
                boxShadow: 'inset 0 0 0 1px rgba(65,71,83,0.4)',
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
              className="mt-3 w-full rounded-[var(--radius-obs-md)] p-3 text-[12.5px] leading-[1.8] resize-y font-[family-name:var(--font-body)]"
              style={{
                backgroundColor: 'var(--color-obs-surface-low)',
                color: 'var(--color-obs-text)',
                boxShadow: 'inset 0 0 0 1px rgba(65,71,83,0.4)',
                minHeight: 150,
              }}
            />
          </div>
        </div>
      </div>

      {/* ─── セクションラベル ─── */}
      <div className="flex items-center gap-3">
        <span className="w-6 h-px" style={{ backgroundColor: 'var(--color-obs-outline-variant)' }} />
        <span className="text-[11px] font-medium tracking-[0.1em] uppercase" style={{ color: 'var(--color-obs-text-muted)' }}>
          商談パイプライン
        </span>
        <span className="text-[11px]" style={{ color: 'var(--color-obs-text-subtle)' }}>
          — {ownerLabel} / {periodLabel}
        </span>
        <button
          className="inline-flex items-center gap-1 h-6 px-2 rounded-full text-[10px] font-medium ml-2"
          style={{ backgroundColor: 'rgba(65,71,83,0.2)', color: 'var(--color-obs-text-subtle)' }}
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
          color="var(--color-obs-primary)"
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
          color="var(--color-obs-low)"
          condition={'プロジェクト化予定あり'}
          rateLabel="移行率"
          rate={counts.possibleRate}
          rateColor="#6ee7a1"
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
          color="#6ee7a1"
          condition={'複数商談済み・POC'}
          rateLabel="移行率"
          rate={counts.runningRate}
          rateColor="#6ee7a1"
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
          <span className="w-6 h-px" style={{ backgroundColor: 'var(--color-obs-outline-variant)' }} />
          <span className="text-[11px] font-medium tracking-[0.1em] uppercase" style={{ color: 'var(--color-obs-text-muted)' }}>
            商談一覧
          </span>
          <span className="text-[11px]" style={{ color: 'var(--color-obs-text-subtle)' }}>
            — {activeDeals.length}件
          </span>
        </div>

        <div
          className="rounded-[var(--radius-obs-xl)] overflow-hidden"
          style={{
            backgroundColor: 'var(--color-obs-surface-high)',
            boxShadow: 'inset 0 0 0 1px rgba(65,71,83,0.2)',
          }}
        >
          <div
            className="grid items-center px-5 py-3 text-[10.5px] font-medium tracking-[0.12em] uppercase"
            style={{
              gridTemplateColumns: '40px 1.3fr 0.7fr 1.4fr',
              color: 'var(--color-obs-text-subtle)',
              backgroundColor: 'var(--color-obs-surface-low)',
            }}
          >
            <span>#</span>
            <span>企業名 / 担当</span>
            <span>ステータス</span>
            <span>Status / Next</span>
          </div>

          {activeDeals.length === 0 ? (
            <div className="px-5 py-10 text-center text-[12px]" style={{ color: 'var(--color-obs-text-subtle)' }}>
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
                  borderTop: i === 0 ? 'none' : '1px solid rgba(65,71,83,0.12)',
                }}
                onMouseOver={(e) => (e.currentTarget.style.backgroundColor = 'rgba(65,71,83,0.12)')}
                onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <span className="text-[12px] tabular-nums" style={{ color: 'var(--color-obs-text-subtle)' }}>
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div className="min-w-0">
                  <div className="text-[13px] font-semibold truncate" style={{ color: 'var(--color-obs-text)' }}>
                    {d.company}
                  </div>
                  <div className="text-[11px] mt-0.5" style={{ color: 'var(--color-obs-text-muted)' }}>
                    {d.owner}
                  </div>
                </div>
                <div>
                  {badge && (
                    <span
                      className="inline-flex items-center gap-1.5 px-2.5 h-6 rounded-full text-[11px] font-medium"
                      style={{ backgroundColor: badge.bg, color: badge.color }}
                    >
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: badge.color }} />
                      {badge.label}
                    </span>
                  )}
                </div>
                <div className="text-[11.5px] leading-[1.6] min-w-0" style={{ color: 'var(--color-obs-text-muted)' }}>
                  {d.status && (
                    <div>
                      <span style={{ color: 'var(--color-obs-text-subtle)' }}>Status：</span>
                      <span style={{ color: 'var(--color-obs-text)' }}>{d.status}</span>
                    </div>
                  )}
                  {d.nextAction && (
                    <div>
                      <span style={{ color: 'var(--color-obs-text-subtle)' }}>Next：</span>
                      <span>{d.nextAction}</span>
                      {d.nextActionDate && (
                        <span className="ml-1.5" style={{ color: 'var(--color-obs-primary-dim)' }}>
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
        className="w-full flex items-center justify-between h-10 px-4 rounded-[var(--radius-obs-md)] text-[14px] font-semibold"
        style={{ backgroundColor: cur.bg, color: cur.color, boxShadow: `inset 0 0 0 1px ${cur.ring}` }}
      >
        <span className="inline-flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cur.color }} />
          {value}
        </span>
        <ChevronDown size={14} />
      </button>
      {open && (
        <div
          className="absolute z-10 mt-1 w-full rounded-[var(--radius-obs-md)] overflow-hidden"
          style={{
            backgroundColor: 'var(--color-obs-surface-highest)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4), inset 0 0 0 1px rgba(65,71,83,0.4)',
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
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
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
    <span className="text-[10px] font-medium tracking-[0.14em] uppercase" style={{ color: 'var(--color-obs-text-subtle)' }}>
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
const RATE_COLOR_GOLD = '#c9a94b'
const RATE_COLOR_DIM = 'var(--color-obs-text-subtle)'

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
        <span className="w-6 h-px" style={{ backgroundColor: RATE_COLOR_GOLD, opacity: 0.5 }} />
        <span
          className="text-[11px] font-medium tracking-[0.1em] uppercase"
          style={{ color: RATE_COLOR_GOLD }}
        >
          POC移行率
        </span>
      </div>

      {/* テーブル */}
      <div
        className="rounded-[var(--radius-obs-xl)] overflow-hidden"
        style={{
          backgroundColor: 'var(--color-obs-surface-high)',
          boxShadow: 'inset 0 0 0 1px rgba(65,71,83,0.2)',
        }}
      >
        {/* ヘッダ */}
        <div
          className="grid items-center px-5 py-3 text-[10.5px] font-medium tracking-[0.12em] uppercase gap-4"
          style={{
            gridTemplateColumns: '1.6fr 0.6fr 0.8fr 0.6fr',
            color: 'var(--color-obs-text-subtle)',
            backgroundColor: 'var(--color-obs-surface-low)',
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
            style={{ color: 'var(--color-obs-text-subtle)' }}
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
                borderTop: i === 0 ? 'none' : '1px solid rgba(65,71,83,0.12)',
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
                    'rgba(65,71,83,0.12)'
                }}
                onMouseOut={(e) => {
                  ;(e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent'
                }}
                aria-expanded={isOpen}
              >
                <div className="min-w-0">
                  <div
                    className="text-[13px] font-semibold leading-tight"
                    style={{ color: 'var(--color-obs-text)' }}
                  >
                    {c.category}
                  </div>
                  <div
                    className="text-[11px] mt-1 leading-snug truncate"
                    style={{ color: 'var(--color-obs-text-subtle)' }}
                    title={c.sources.join(' / ')}
                  >
                    {c.sources.join(' / ')}
                  </div>
                  <ChevronDown
                    size={13}
                    strokeWidth={2}
                    className="mt-1.5"
                    style={{
                      color: 'var(--color-obs-text-subtle)',
                      transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 150ms var(--ease-liquid)',
                    }}
                  />
                </div>
                <div className="text-right tabular-nums">
                  <span
                    className="text-[18px] font-[family-name:var(--font-display)] font-bold"
                    style={{ color: 'var(--color-obs-text)' }}
                  >
                    {c.acquired}
                  </span>
                  <span
                    className="ml-0.5 text-[11px]"
                    style={{ color: 'var(--color-obs-text-subtle)' }}
                  >
                    社
                  </span>
                </div>
                <div className="text-right tabular-nums">
                  <span
                    className="text-[18px] font-[family-name:var(--font-display)] font-bold"
                    style={{ color: c.trials > 0 ? 'var(--color-obs-text)' : 'var(--color-obs-text-subtle)' }}
                  >
                    {c.trials}
                  </span>
                  <span
                    className="ml-0.5 text-[11px]"
                    style={{ color: 'var(--color-obs-text-subtle)' }}
                  >
                    社
                  </span>
                </div>
                <div className="text-right tabular-nums">
                  <span
                    className="text-[20px] font-[family-name:var(--font-display)] font-bold"
                    style={{ color: rColor }}
                  >
                    {rate}%
                  </span>
                </div>
              </button>

              {/* 展開時の内訳 */}
              {isOpen && c.details.length > 0 && (
                <div
                  className="px-5 pb-4 pt-1"
                  style={{ backgroundColor: 'rgba(65,71,83,0.06)' }}
                >
                  <div
                    className="grid items-center px-3 py-2 text-[10px] font-medium tracking-[0.1em] uppercase gap-4"
                    style={{
                      gridTemplateColumns: '1.6fr 0.6fr 0.8fr 0.6fr',
                      color: 'var(--color-obs-text-subtle)',
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
                          borderTop: '1px solid rgba(65,71,83,0.1)',
                        }}
                      >
                        <span
                          className="text-[12px] truncate"
                          style={{ color: 'var(--color-obs-text-muted)' }}
                          title={d.source}
                        >
                          {d.source}
                        </span>
                        <span
                          className="text-right text-[12px] tabular-nums"
                          style={{ color: 'var(--color-obs-text)' }}
                        >
                          {d.acquired}社
                        </span>
                        <span
                          className="text-right text-[12px] tabular-nums"
                          style={{
                            color: d.trials > 0
                              ? 'var(--color-obs-text)'
                              : 'var(--color-obs-text-subtle)',
                          }}
                        >
                          {d.trials}社
                        </span>
                        <span
                          className="text-right text-[13px] font-bold tabular-nums"
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

        {/* 合計 */}
        <div
          className="grid items-center px-5 py-4 gap-4"
          style={{
            gridTemplateColumns: '1.6fr 0.6fr 0.8fr 0.6fr',
            backgroundColor: 'rgba(201,169,75,0.06)',
            borderTop: '1px solid rgba(201,169,75,0.18)',
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
              className="text-[20px] font-[family-name:var(--font-display)] font-bold"
              style={{ color: RATE_COLOR_GOLD }}
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
      className="relative stitch-glass stitch-glow-border rounded-[var(--radius-obs-xl)] p-5 flex flex-col transition-all duration-200"
      style={{
        ...(accent ? { boxShadow: '0 0 20px rgba(110,231,161,0.15), inset 0 0 0 1.5px rgba(110,231,161,0.3)' } : {}),
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
      <p className="text-[11px] font-bold tracking-[0.1em] uppercase mb-2" style={{ color }}>
        {label}
      </p>
      <div className="flex items-baseline gap-1 mb-4">
        <span
          className="font-[family-name:var(--font-display)] text-[44px] font-extrabold leading-none tabular-nums tracking-[-0.04em]"
          style={{ color: 'var(--color-obs-text)' }}
        >
          {value}
        </span>
        <span className="text-[12px] font-medium" style={{ color: 'var(--color-obs-text-muted)' }}>社</span>
      </div>
      <p className="text-[9px] font-medium tracking-[0.08em] uppercase mb-1" style={{ color: 'var(--color-obs-text-subtle)' }}>
        認定条件
      </p>
      <p className="text-[11px] leading-[1.6] whitespace-pre-line flex-1" style={{ color: 'var(--color-obs-text-muted)' }}>
        {condition}
      </p>

      {/* 移行率ボックス（ホバーで累計内訳＋過去案件ポップオーバー）
          rateLabel/rate が指定された時のみ表示（商談数カードでは非表示） */}
      {rateLabel !== undefined && rate !== undefined && (
        <div
          className="relative flex items-center justify-between mt-4 pt-3 -mx-2 px-2 rounded-[var(--radius-obs-sm)] cursor-help transition-colors duration-150"
          style={{
            boxShadow: 'inset 0 1px 0 0 var(--color-obs-outline-variant)',
            backgroundColor: hover === 'rate' ? 'rgba(0,113,227,0.06)' : 'transparent',
          }}
          onMouseEnter={() => setHover('rate')}
          onMouseLeave={() => setHover('card')}
        >
          <span className="text-[10px] font-medium tracking-[0.05em] uppercase inline-flex items-center gap-1" style={{ color: 'var(--color-obs-text-subtle)' }}>
            {rateLabel}
            <HelpCircle size={9} style={{ opacity: 0.6 }} />
          </span>
          <span className="font-[family-name:var(--font-display)] text-[15px] font-bold tabular-nums" style={{ color: rateColor }}>
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
      className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-[min(340px,calc(100vw-48px))] z-30 rounded-[var(--radius-obs-lg)] overflow-hidden animate-[fadeIn_0.18s_ease-out]"
      style={{
        backgroundColor: 'var(--color-obs-surface-highest)',
        boxShadow: '0 12px 40px rgba(0,0,0,0.5), inset 0 0 0 1px rgba(65,71,83,0.4)',
      }}
    >
      <span
        className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rotate-45"
        style={{
          backgroundColor: 'var(--color-obs-surface-highest)',
          boxShadow: 'inset 0 0 0 1px rgba(65,71,83,0.4)',
        }}
      />
      {/* ── 計算式ヘッダー ── */}
      <div className="px-4 py-3" style={{ backgroundColor: 'var(--color-obs-surface-low)' }}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10.5px] font-bold tracking-[0.1em] uppercase" style={{ color: rateColor }}>
            累計ベースの移行率
          </span>
          <span className="font-[family-name:var(--font-display)] text-[18px] font-bold tabular-nums" style={{ color: rateColor }}>
            {rate}%
          </span>
        </div>
        <div className="flex items-baseline gap-3 text-[11px] tabular-nums" style={{ color: 'var(--color-obs-text-muted)' }}>
          <span>
            <span style={{ color: 'var(--color-obs-text-subtle)' }}>{numeratorLabel}：</span>
            <span className="font-semibold" style={{ color: 'var(--color-obs-text)' }}>{numerator}</span>
            <span className="ml-0.5" style={{ color: 'var(--color-obs-text-subtle)' }}>社</span>
          </span>
          <span style={{ color: 'var(--color-obs-text-subtle)' }}>/</span>
          <span>
            <span style={{ color: 'var(--color-obs-text-subtle)' }}>{denominatorLabel}：</span>
            <span className="font-semibold" style={{ color: 'var(--color-obs-text)' }}>{denominator}</span>
            <span className="ml-0.5" style={{ color: 'var(--color-obs-text-subtle)' }}>社</span>
          </span>
        </div>
      </div>

      {/* ── 過去案件一覧 ── */}
      <div className="px-4 py-2.5 flex items-center justify-between">
        <span className="text-[10.5px] font-bold tracking-[0.1em] uppercase" style={{ color: 'var(--color-obs-text-muted)' }}>
          過去案件（失注・契約）
        </span>
        <span className="text-[10.5px] font-medium tabular-nums" style={{ color: 'var(--color-obs-text-subtle)' }}>
          {pastDeals.length} 件
        </span>
      </div>
      {pastDeals.length === 0 ? (
        <div className="px-4 py-5 text-center text-[11.5px]" style={{ color: 'var(--color-obs-text-subtle)' }}>
          過去案件はありません
        </div>
      ) : (
        <div className="max-h-[240px] overflow-y-auto stitch-scroll">
          {pastDeals.map((d, i) => {
            const b = bucketOf(d.stage)
            const isLost = b === '失注'
            const tone = isLost ? 'var(--color-obs-hot)' : '#6ee7a1'
            const toneBg = isLost ? 'rgba(255,107,107,0.14)' : 'rgba(110,231,161,0.14)'
            return (
              <div
                key={d.id}
                className="px-4 py-2.5 flex items-start gap-3"
                style={{ borderTop: i === 0 ? '1px solid rgba(65,71,83,0.15)' : '1px solid rgba(65,71,83,0.08)' }}
              >
                <span className="text-[10.5px] tabular-nums mt-0.5 shrink-0" style={{ color: 'var(--color-obs-text-subtle)' }}>
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[12px] font-semibold truncate" style={{ color: 'var(--color-obs-text)' }}>
                      {d.company}
                    </span>
                    <span
                      className="inline-flex items-center shrink-0 text-[9.5px] font-medium h-[18px] px-1.5 rounded-full"
                      style={{ backgroundColor: toneBg, color: tone }}
                    >
                      {isLost ? '失注' : '契約'}
                    </span>
                  </div>
                  <div className="text-[10.5px] mt-0.5" style={{ color: 'var(--color-obs-text-muted)' }}>
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
      <span className="text-[10px] font-medium tracking-[0.1em] uppercase" style={{ color: 'var(--color-obs-text-subtle)' }}>
        {label}
      </span>
      <ArrowRight size={18} strokeWidth={1.5} style={{ color: 'var(--color-obs-primary-dim)' }} />
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
    hot:     { color: 'var(--color-obs-hot)',         bg: 'rgba(255,107,107,0.14)' },
    success: { color: '#6ee7a1',                      bg: 'rgba(110,231,161,0.14)' },
    warning: { color: '#c9a94b',                      bg: 'rgba(201,169,75,0.16)' },
    muted:   { color: 'var(--color-obs-text-muted)',  bg: 'rgba(143,140,144,0.16)' },
  }
  const { color, bg } = TONE_STYLE[tone]
  return (
    <div
      className="relative stitch-glass stitch-glow-border rounded-[var(--radius-obs-xl)] p-5 flex items-center gap-5 transition-all duration-200"
      style={{
        transform: hover ? 'translateY(-2px)' : 'translateY(0)',
        transitionTimingFunction: 'var(--ease-liquid)',
        cursor: 'default',
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
        style={{ backgroundColor: bg, color }}
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-bold tracking-[0.1em] uppercase mb-1" style={{ color }}>
          {label}
        </p>
        <div className="flex items-baseline gap-1">
          <span
            className="font-[family-name:var(--font-display)] text-[32px] font-extrabold leading-none tabular-nums tracking-[-0.04em]"
            style={{ color: 'var(--color-obs-text)' }}
          >
            {value}
          </span>
          <span className="text-[11px]" style={{ color: 'var(--color-obs-text-muted)' }}>社</span>
        </div>
        {desc && (
          <p
            className="text-[10.5px] mt-1.5 leading-snug"
            style={{ color: 'var(--color-obs-text-muted)' }}
          >
            {desc}
          </p>
        )}
      </div>
      {typeof rate === 'number' && (
        <div className="text-right">
          <p className="text-[10px] font-medium tracking-[0.08em] uppercase mb-0.5" style={{ color: 'var(--color-obs-text-subtle)' }}>
            PJ進行中比
          </p>
          <span className="font-[family-name:var(--font-display)] text-[15px] font-bold tabular-nums" style={{ color }}>
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
      className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-[min(320px,calc(100vw-48px))] z-50 rounded-[var(--radius-obs-lg)] overflow-hidden animate-[fadeIn_0.18s_ease-out]"
      style={{
        backgroundColor: 'rgba(20,20,26,0.98)',
        backdropFilter: 'blur(12px) saturate(140%)',
        WebkitBackdropFilter: 'blur(12px) saturate(140%)',
        boxShadow:
          '0 24px 64px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.1), inset 0 0 0 1px rgba(255,255,255,0.04)',
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* 矢印 */}
      <span
        className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rotate-45"
        style={{
          backgroundColor: 'rgba(20,20,26,0.98)',
          boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.1)',
        }}
      />
      <div className="px-4 py-2.5 flex items-center justify-between" style={{ backgroundColor: 'rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <span className="text-[10.5px] font-bold tracking-[0.1em] uppercase" style={{ color: accent }}>
          {title}
        </span>
        <span className="text-[10.5px] font-medium tabular-nums" style={{ color: 'var(--color-obs-text-subtle)' }}>
          {deals.length} 件
        </span>
      </div>
      {deals.length === 0 ? (
        <div className="px-4 py-6 text-center text-[11.5px]" style={{ color: 'var(--color-obs-text-subtle)' }}>
          該当する案件はありません
        </div>
      ) : (
        <div className="max-h-[280px] overflow-y-auto stitch-scroll">
          {deals.map((d, i) => (
            <div
              key={d.id}
              className="px-4 py-2 flex items-center gap-3"
              style={{ borderTop: i === 0 ? 'none' : '1px solid rgba(255,255,255,0.06)' }}
            >
              <span
                className="text-[10.5px] tabular-nums shrink-0"
                style={{ color: 'var(--color-obs-text-subtle)' }}
              >
                {String(i + 1).padStart(2, '0')}
              </span>
              <div
                className="text-[12.5px] font-semibold truncate flex-1 min-w-0"
                style={{ color: 'var(--color-obs-text)' }}
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

// RPG風 5段階レアリティ（Common → Mythic）
// 両ゲージ共通。グラデーション（暗い端→明るい中央）＋レイアウト別発光
type Tier = {
  name: string
  core: string         // 基本色（ラベル・ベース）
  grad: string         // グラデーション用 CSS
  glow: string         // outer glow color
}

const TIERS: Tier[] = [
  // Lv1: Common（シルバーブルー）
  {
    name: 'COMMON',
    core: '#7e90b0',
    grad: 'linear-gradient(180deg, #5d6d89 0%, #9fb0cc 50%, #6b7c99 100%)',
    glow: 'rgba(150, 170, 200, 0.4)',
  },
  // Lv2: Rare（エメラルドグリーン）
  {
    name: 'RARE',
    core: '#4ad98a',
    grad: 'linear-gradient(180deg, #0c8a4a 0%, #6ef7a5 45%, #1fb868 100%)',
    glow: 'rgba(74, 217, 138, 0.55)',
  },
  // Lv3: Epic（ブリリアントブルー）
  {
    name: 'EPIC',
    core: '#4a9eff',
    grad: 'linear-gradient(180deg, #0054c2 0%, #8dc0ff 40%, #1a7aff 100%)',
    glow: 'rgba(74, 158, 255, 0.65)',
  },
  // Lv4: Legendary（ネオンパープル）
  {
    name: 'LEGENDARY',
    core: '#c07cff',
    grad: 'linear-gradient(180deg, #6a1eb8 0%, #e0b0ff 40%, #8e3bff 100%)',
    glow: 'rgba(192, 124, 255, 0.7)',
  },
  // Lv5: Mythic（フレイムゴールド／赤）
  {
    name: 'MYTHIC',
    core: '#ffb347',
    grad: 'linear-gradient(180deg, #c2410c 0%, #ffeaa0 35%, #ff7a00 70%, #ff4e1a 100%)',
    glow: 'rgba(255, 140, 60, 0.85)',
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
      {/* バー */}
      <div className="flex gap-[3px]">
        {[0, 1, 2, 3, 4].map((i) => {
          const filled = i < level
          const tier = TIERS[i]
          // 満たされた部分は、そのセグメントの tier 色で描画
          return (
            <div
              key={i}
              className="relative h-[8px] flex-1 rounded-[2px] overflow-hidden transition-all duration-300"
              style={{
                background: filled ? tier.grad : 'linear-gradient(180deg, #0a0a0c 0%, #1c1c1f 50%, #0a0a0c 100%)',
                boxShadow: filled
                  ? `0 0 10px ${tier.glow}, inset 0 1px 0 rgba(255,255,255,0.35), inset 0 -1px 0 rgba(0,0,0,0.35)`
                  : 'inset 0 0 0 1px rgba(65,71,83,0.3)',
                transitionTimingFunction: 'var(--ease-liquid)',
              }}
            >
              {/* Lv5 だけシマー効果 */}
              {filled && i === 4 && (
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      'linear-gradient(115deg, transparent 30%, rgba(255,255,255,0.55) 50%, transparent 70%)',
                    animation: 'gauge-shimmer 2.2s ease-in-out infinite',
                  }}
                />
              )}
            </div>
          )
        })}
      </div>
      {/* 目安の数字 */}
      <div className="flex items-center gap-[3px] mt-1">
        {labels.map((lab, i) => {
          const tier = TIERS[i]
          return (
            <span
              key={i}
              className="flex-1 text-[8.5px] font-bold text-center tabular-nums"
              style={{
                color: i < level ? tier.core : 'rgba(93,90,95,0.5)',
                textShadow: i < level ? `0 0 6px ${tier.glow}` : 'none',
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
  const isPOC = deal.stage === 'POC'
  const isPriority = deal.stage === 'PROJECT_PLANNED'
  const eLv = emailLevel(deal.emailCount)
  const mLv = meetingLevel(deal.meetingCount)

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      className="stitch-glass stitch-glow-border rounded-[var(--radius-obs-xl)] p-4 cursor-grab active:cursor-grabbing transition-colors duration-200 group"
      style={{
        transitionTimingFunction: 'var(--ease-liquid)',
        ...(isPriority
          ? { borderLeft: '4px solid var(--color-obs-primary)' }
          : {}),
        ...(isPOC
          ? { boxShadow: '0 0 15px rgba(0,113,227,0.15), inset 0 0 0 1.5px rgba(171,199,255,0.3)' }
          : {}),
      }}
      onMouseOver={(e) => {
        ;(e.currentTarget as HTMLDivElement).style.backgroundColor = 'rgba(67, 66, 71, 0.65)'
      }}
      onMouseOut={(e) => {
        ;(e.currentTarget as HTMLDivElement).style.backgroundColor = 'rgba(53, 52, 55, 0.6)'
      }}
    >
      {/* Header: 1stパーティ シグナル + createdAt */}
      <div className="flex justify-between items-start mb-2.5">
        <SignalBadge signal={deal.intent} />
        <span
          className="inline-flex items-center gap-1 text-[9.5px] tabular-nums"
          style={{ color: 'rgba(143,140,144,0.65)' }}
        >
          <Calendar size={10} />
          {formatCreatedAt(deal.createdAt)}
        </span>
      </div>

      {/* Title (取引先名 = 企業名) — クリックで取引詳細へ。drag は親カードに任せる */}
      <h4
        className="text-sm font-semibold mb-1 leading-snug tracking-[-0.01em]"
        style={{ color: 'var(--color-obs-text)' }}
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

      {/* Activity Gauges — メール + 商談（RPGレアリティ風） */}
      <div className="mt-4 space-y-3">
        <div className="flex items-start gap-2.5">
          <span
            className="w-10 shrink-0 text-[9px] font-bold tracking-[0.08em] uppercase leading-[8px]"
            style={{ color: 'var(--color-obs-text-subtle)' }}
          >
            メール
          </span>
          <SegmentedGauge level={eLv} labels={EMAIL_THRESHOLDS} />
          <span
            className="text-[11px] font-black tabular-nums w-8 text-right shrink-0 leading-[8px]"
            style={{
              color: eLv > 0 ? TIERS[eLv - 1].core : 'var(--color-obs-text-subtle)',
              textShadow: eLv > 0 ? `0 0 6px ${TIERS[eLv - 1].glow}` : 'none',
            }}
          >
            {deal.emailCount}
          </span>
        </div>
        <div className="flex items-start gap-2.5">
          <span
            className="w-10 shrink-0 text-[9px] font-bold tracking-[0.08em] uppercase leading-[8px]"
            style={{ color: 'var(--color-obs-text-subtle)' }}
          >
            商談
          </span>
          <SegmentedGauge level={mLv} labels={MEETING_THRESHOLDS} />
          <span
            className="text-[11px] font-black tabular-nums w-8 text-right shrink-0 leading-[8px]"
            style={{
              color: mLv > 0 ? TIERS[mLv - 1].core : 'var(--color-obs-text-subtle)',
              textShadow: mLv > 0 ? `0 0 6px ${TIERS[mLv - 1].glow}` : 'none',
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
          style={{ boxShadow: 'inset 0 1px 0 0 rgba(65,71,83,0.25)' }}
        >
          {deal.status && (
            <div className="flex items-center gap-2 min-w-0">
              <span
                className="px-1.5 h-4 rounded-sm text-[9px] font-bold tracking-[0.08em] uppercase inline-flex items-center shrink-0"
                style={{
                  backgroundColor: 'rgba(109,106,111,0.22)',
                  color: 'var(--color-obs-text-muted)',
                }}
              >
                Status
              </span>
              <span
                className="text-[11px] font-medium truncate flex-1"
                style={{ color: 'var(--color-obs-text-muted)' }}
                title={deal.status}
              >
                {deal.status}
              </span>
            </div>
          )}
          {deal.nextAction && (
            <div className="flex items-center gap-2 min-w-0">
              <span
                className="px-1.5 h-4 rounded-sm text-[9px] font-bold tracking-[0.08em] uppercase inline-flex items-center shrink-0"
                style={{
                  backgroundColor: 'rgba(0,113,227,0.18)',
                  color: 'var(--color-obs-primary)',
                }}
              >
                Next
              </span>
              <span
                className="text-[11px] font-medium truncate flex-1"
                style={{ color: 'var(--color-obs-text)' }}
                title={deal.nextAction}
              >
                {deal.nextAction}
              </span>
              {deal.nextActionDate && (
                <span
                  className="text-[10px] tabular-nums shrink-0"
                  style={{ color: 'var(--color-obs-text-muted)' }}
                >
                  {deal.nextActionDate}
                </span>
              )}
            </div>
          )}
        </div>
      )}

      {/* Footer: owner + amount */}
      <div className="flex items-center justify-between mt-3 pt-3" style={{ boxShadow: 'inset 0 1px 0 0 rgba(65,71,83,0.25)' }}>
        <div className="flex items-center gap-1.5 min-w-0">
          <div
            className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
            style={{
              background:
                'linear-gradient(140deg, var(--color-obs-primary) 0%, var(--color-obs-primary-container) 100%)',
            }}
          >
            <span
              className="text-[9px] font-bold leading-none"
              style={{ color: 'var(--color-obs-on-primary)' }}
            >
              {deal.owner[0]}
            </span>
          </div>
          <span
            className="text-[11px] font-medium truncate"
            style={{ color: 'var(--color-obs-text-muted)' }}
          >
            {deal.owner}
          </span>
        </div>
        {deal.amount > 0 && (
          <span
            className="text-[12px] font-bold tabular-nums shrink-0"
            style={{ color: 'var(--color-obs-text)' }}
          >
            {formatJpy(deal.amount)}
          </span>
        )}
      </div>
    </div>
  )
}
