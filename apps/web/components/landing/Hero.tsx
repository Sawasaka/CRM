'use client'

/**
 * Hero — ルキスマCRM ライブチャットデモ
 * チャット入力 + 5体のサジェストチップで RAG 風の回答を擬似ストリーミング表示。
 */

import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react'
import { Sparkles, Send, Check, Copy, Paperclip, ChevronDown, Mic, Layers, User, Globe } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from 'recharts'
import { AGENTS, type AgentKey, Eyebrow, NebulaBG, Orb, ParticleField, Section } from './atoms'
import { HeroSidebar } from './HeroSidebar'
import { HeroDemoView, type HeroDemoKey } from './hero-demos'

const PLACEHOLDERS = [
  'ルキスマCRM について、ここで何でも聞いてください',
  '料金プランや 5社限定パートナーシップの詳細を知りたい',
  '導入までの流れ・どんな相談ができるか教えて',
  '今週アプローチすべき HOT 企業を教えて',
  '先週の議事録から要望機能を集計して',
]

const LP_DEMO_DAILY_CREDIT_LIMIT = 10
const LP_DEMO_USAGE_STORAGE_KEY = 'rukisuma-crm-lp-demo-usage'

type DemoUsage = {
  dateKey: string
  credits: number
}

function getJstDateKey(date = new Date()) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Tokyo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date)
}

interface Suggestion {
  id: keyof typeof RESPONSES
  label: string
  agent: AgentKey
}

const SUGGESTIONS: Suggestion[] = [
  { id: 'hot',    label: '今週アプローチすべきHOT企業を教えて',   agent: 'sales' },
  { id: 'pdm',    label: '先週の議事録から要望機能を集計して',     agent: 'pdm' },
  { id: 'ticket', label: '未対応チケットを担当者ごとに集計して',   agent: 'support' },
  { id: 'intent', label: '採用インテントが伸びてる企業 TOP10',      agent: 'marketing' },
  { id: 'tmpl',   label: 'ベテランの提案テンプレートを教えて',     agent: 'helpdesk' },
]

// ---------- Realtime signal badge (Hot / Mid / Low) ----------
type SignalLevel = 'Hot' | 'Mid' | 'Low'
const SIGNAL_STYLE: Record<SignalLevel, { bg: string; fg: string; pulse: boolean }> = {
  Hot: { bg: 'rgba(255,107,107,0.15)', fg: '#ff6b6b', pulse: true },
  Mid: { bg: 'rgba(255,207,74,0.14)',  fg: '#ffcf4a', pulse: false },
  Low: { bg: 'rgba(155,153,160,0.10)', fg: '#9b99a0', pulse: false },
}
const SignalBadge = ({ level }: { level: SignalLevel }) => {
  const s = SIGNAL_STYLE[level]
  return (
    <span
      className="inline-flex items-center gap-1 text-[9px] font-mono px-1.5 py-0.5 rounded uppercase tracking-wider"
      style={{ background: s.bg, color: s.fg }}
    >
      <span
        className={`w-1 h-1 rounded-full ${s.pulse ? 'animate-pulse' : ''}`}
        style={{ background: s.fg, boxShadow: s.pulse ? `0 0 6px ${s.fg}` : 'none' }}
      />
      {level}
    </span>
  )
}

// ---------- Rich content blocks ----------
const HotCompaniesTable = () => {
  const rows: Array<{
    c: string; i: string;
    jobs: string; jobsLv: SignalLevel;
    dept: string; rev: string; emp: string;
    sig: string; sigLv: SignalLevel;
  }> = [
    { c: 'アクトラス株式会社',   i: 'SaaS',    jobs: '+12', jobsLv: 'Hot', dept: '営業 / CS',   rev: '¥18.4B', emp: '120名',   sig: '資料DL ×3',    sigLv: 'Hot' },
    { c: '株式会社メリディアン', i: '製造',    jobs: '+8',  jobsLv: 'Mid', dept: '生産 / 技術', rev: '¥124B',  emp: '850名',   sig: 'IR訪問 ×2',    sigLv: 'Mid' },
    { c: 'PoltCraft Inc.',       i: 'FinTech', jobs: '+5',  jobsLv: 'Mid', dept: 'プロダクト',  rev: '¥4.2B',  emp: '240名',   sig: 'ウェビナー',   sigLv: 'Mid' },
    { c: 'セレナーデ商事',       i: '商社',    jobs: '+9',  jobsLv: 'Hot', dept: '営業 / IT',   rev: '¥220B',  emp: '1,200名', sig: '問合せ / DL',  sigLv: 'Hot' },
    { c: 'ベルガモット工業',     i: '化学',    jobs: '+6',  jobsLv: 'Mid', dept: 'R&D / IT',    rev: '¥58B',   emp: '560名',   sig: '採用滞在',     sigLv: 'Low' },
  ]
  return (
    <div className="mt-3 rounded-xl bg-pitch/80 p-4 fo-glass-rim overflow-x-auto fo-thin-scroll">
      {/* live indicator */}
      <div className="flex items-center justify-between mb-2 min-w-[680px]">
        <span className="text-[0.62rem] uppercase tracking-[0.14em] text-[#7e7c83]">HOT 企業 TOP5</span>
        <span className="inline-flex items-center gap-1.5 text-[9px] font-mono text-[#8dffc9]">
          <span className="w-1.5 h-1.5 rounded-full bg-mint animate-pulse" style={{ boxShadow: '0 0 6px #8dffc9' }} />
          LIVE · 60秒前更新
        </span>
      </div>
      <div className="grid grid-cols-[2fr_0.9fr_1.4fr_1.2fr_1fr_0.9fr_1.6fr] gap-x-3 text-[0.62rem] uppercase tracking-[0.14em] text-[#9b99a0] pb-2 min-w-[680px]">
        <div>会社名</div>
        <div>業界</div>
        <div>求人インテント</div>
        <div>部門</div>
        <div className="text-right">売上</div>
        <div className="text-right">従業員</div>
        <div>1stパーティ・シグナル</div>
      </div>
      {rows.map((r, i) => (
        <div
          key={i}
          className="grid grid-cols-[2fr_0.9fr_1.4fr_1.2fr_1fr_0.9fr_1.6fr] gap-x-3 items-center text-[12.5px] py-2 min-w-[680px]"
          style={{ borderTop: i === 0 ? 'none' : '1px solid rgba(171,199,255,0.06)' }}
        >
          <div className="text-[#e7e5ea] truncate">{r.c}</div>
          <div className="text-[#9b99a0] truncate">{r.i}</div>
          <div className="flex items-center gap-1.5">
            <SignalBadge level={r.jobsLv} />
            <span className="font-mono text-amber text-xs">{r.jobs}</span>
          </div>
          <div className="text-[#c7c5c9] truncate text-xs">{r.dept}</div>
          <div className="text-right font-mono text-[#e7e5ea] text-xs">{r.rev}</div>
          <div className="text-right text-[#9b99a0] text-xs">{r.emp}</div>
          <div className="flex items-center gap-1.5 min-w-0">
            <SignalBadge level={r.sigLv} />
            <span className="text-[#c7c5c9] truncate text-xs">{r.sig}</span>
          </div>
        </div>
      ))}
    </div>
  )
}

const FeatureRequestsList = () => {
  const items = [
    { t: 'Salesforce 双方向連携の双方向フィールドマッピング', n: 14, src: 'B2B SaaS / 製造 / 商社' },
    { t: '議事録の話者分離と発言サマリー要約レベル設定',       n: 11, src: 'BPO / 金融 / SaaS' },
    { t: 'PDM ダッシュボードの要望機能スコア閾値カスタム',     n: 9,  src: 'ProductOps / PdM' },
    { t: 'Marketo / HubSpot 双方向シーケンス起動',           n: 8,  src: 'マーケ / セールス' },
    { t: '監査ログ CSV エクスポート (90日 → 24ヶ月)',        n: 7,  src: 'セキュリティ / 法務' },
  ]
  return (
    <div className="mt-3 rounded-xl bg-pitch/80 p-4 fo-glass-rim space-y-2.5">
      {items.map((it, i) => (
        <div key={i} className="flex items-center gap-3">
          <div className="font-mono text-mint text-xs w-6">#{i + 1}</div>
          <div className="flex-1 text-sm text-[#e7e5ea]">{it.t}</div>
          <span
            className="rounded-full px-2 py-0.5 text-xs font-mono"
            style={{ background: 'rgba(141,255,201,0.10)', color: '#8dffc9' }}
          >
            ×{it.n}
          </span>
          <span className="text-xs text-[#9b99a0] hidden md:block">{it.src}</span>
        </div>
      ))}
    </div>
  )
}

const TicketChart = () => {
  const data = [
    { name: '佐藤', v: 8 },
    { name: '田中', v: 6 },
    { name: '鈴木', v: 5 },
    { name: '高橋', v: 3 },
    { name: '中村', v: 2 },
  ]
  const tickets = [
    { id: 'T-1042', t: 'ログイン2段階認証が突然要求される', as: '佐藤', age: '3h', sev: 'high' },
    { id: 'T-1041', t: 'CSV出力で文字化け (Shift_JIS要望)', as: '田中', age: '5h', sev: 'med' },
    { id: 'T-1037', t: 'Webhook 再送が実行されない',         as: '鈴木', age: '8h', sev: 'med' },
  ]
  return (
    <div className="mt-3 space-y-3 fo-recharts">
      <div className="rounded-xl bg-pitch/80 p-4 fo-glass-rim">
        <div className="text-[0.68rem] uppercase tracking-[0.14em] text-[#9b99a0] mb-2">担当者別 未対応チケット</div>
        <div style={{ width: '100%', height: 140 }}>
          <ResponsiveContainer>
            <BarChart data={data} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
              <XAxis dataKey="name" tickLine={false} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} />
              <Bar dataKey="v" radius={[6, 6, 0, 0]}>
                {data.map((_, i) => (
                  <Cell key={i} fill="#ff8dcf" />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="rounded-xl bg-pitch/80 p-3 fo-glass-rim space-y-2">
        {tickets.map((t) => (
          <div key={t.id} className="flex items-center gap-3 py-1.5">
            <span className="font-mono text-xs text-coral">{t.id}</span>
            <span className="flex-1 text-sm truncate">{t.t}</span>
            <span className="text-xs text-[#9b99a0]">@{t.as}</span>
            <span className="text-xs font-mono text-[#c7c5c9]">{t.age}</span>
            <span
              className="rounded-full px-2 py-0.5 text-[10px] uppercase tracking-wider"
              style={{
                background: t.sev === 'high' ? 'rgba(255,141,207,0.12)' : 'rgba(255,207,74,0.10)',
                color: t.sev === 'high' ? '#ff8dcf' : '#ffcf4a',
              }}
            >
              {t.sev}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

const IntentTopList = () => {
  const items = [
    'アクトラス株式会社', '株式会社オリオン技研', 'PoltCraft Inc.', 'メリディアン製作所',
    'ベルガモット工業', 'セレナーデ商事', 'ノクターン物流', 'リフラクトラボ', 'ヴィアスポーラ',
    'サフロン株式会社',
  ]
  const deltas = [42, 31, 28, 24, 22, 19, 17, 14, 12, 10]
  return (
    <div className="mt-3 rounded-xl bg-pitch/80 p-4 fo-glass-rim grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
      {items.map((c, i) => (
        <div key={i} className="flex items-center gap-3 py-1">
          <div className="font-mono text-xs text-amber w-6">{String(i + 1).padStart(2, '0')}</div>
          <div className="flex-1 text-sm truncate">{c}</div>
          <span className="text-xs font-mono" style={{ color: '#ffcf4a' }}>↑+{deltas[i]}人</span>
        </div>
      ))}
    </div>
  )
}

const TemplateBlock = () => {
  const tmpl = `[件名] {{company}} 様 — 来期営業支援に向けたご提案
お世話になっております、{{sender}} です。
先日の {{event}} ありがとうございました。

▼ ご提示の課題
- {{issue_1}}
- {{issue_2}}

▼ ご提案
1. {{solution_1}}（効果指標: {{kpi_1}}）
2. {{solution_2}}（効果指標: {{kpi_2}}）

▼ 次のステップ
{{next_step}} まで、{{owner}} よりドラフトを共有いたします。`
  const [copied, setCopied] = useState(false)
  return (
    <div className="mt-3 rounded-xl bg-[#0d0d0f] p-4 fo-glass-rim relative">
      <div className="flex items-center justify-between mb-2">
        <div className="font-semibold uppercase tracking-[0.14em] text-[0.72rem] text-lilac">
          提案テンプレート ／ TOP-1 提案勝率 73%
        </div>
        <button
          onClick={() => {
            navigator.clipboard?.writeText(tmpl)
            setCopied(true)
            setTimeout(() => setCopied(false), 1400)
          }}
          className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs bg-shimmer/60 hover:bg-shimmer text-[#c7c5c9]"
        >
          {copied ? <Check size={14} color="#8dffc9" /> : <Copy size={14} />}
          {copied ? 'コピー済み' : 'コピー'}
        </button>
      </div>
      <pre className="font-mono text-[12.5px] leading-relaxed text-[#c7c5c9] whitespace-pre-wrap">{tmpl}</pre>
    </div>
  )
}

// ---------- Canned response definitions ----------
type RichKind = 'hotTable' | 'featureList' | 'ticketChart' | 'intentList' | 'template' | null

interface CannedResponse {
  agent: AgentKey
  text: string
  rich: RichKind
}

const RESPONSES: Record<'hot' | 'pdm' | 'ticket' | 'intent' | 'tmpl', CannedResponse> = {
  hot: {
    agent: 'sales',
    text: '今週注目すべき HOT 企業 TOP5 を抽出しました。1stパーティのサイト行動と、求人・公式IRから生成した 4 部門インテントを掛け合わせています。最上位の「アクトラス株式会社」は、本日朝に IR ページ + 価格ページを 12 分閲覧しています。今週中の打診を推奨。',
    rich: 'hotTable',
  },
  pdm: {
    agent: 'pdm',
    text: '先週の商談・サポート議事録 134 件を解析し、頻出度・重要度でスコアリングしました。Salesforce 双方向連携の要望が突出しています（14社 / 製造・商社・SaaS 横断）。次回ロードマップで優先度 P0 候補です。',
    rich: 'featureList',
  },
  ticket: {
    agent: 'support',
    text: '現在 24 件の未対応チケットがあります。佐藤さんに 8 件偏重しており、SLA 違反 1 件（T-1042）を検知しました。担当再配分を推奨します。',
    rich: 'ticketChart',
  },
  intent: {
    agent: 'marketing',
    text: '求人公開数 × 新規ハイヤー職種から、過去30日で採用インテントが急上昇している企業 TOP10 です。ICP 一致率 80%以上のみフィルタしました。「アクトラス株式会社」は SaaS 営業職 +42人で、上位パイプライン候補です。',
    rich: 'intentList',
  },
  tmpl: {
    agent: 'helpdesk',
    text: 'ベテラン営業 (勝率 TOP 5%) が直近 90日 で利用した提案テンプレートを抽出しました。共通パターン「課題3点 → 提案2案 → KPI明示 → Next Step期限」をベースにしています。下記をベースに、{{company}} などのプレースホルダを置き換えてご利用ください。',
    rich: 'template',
  },
}

const RichBlock = ({ kind }: { kind: RichKind }) => {
  if (kind === 'hotTable')    return <HotCompaniesTable />
  if (kind === 'featureList') return <FeatureRequestsList />
  if (kind === 'ticketChart') return <TicketChart />
  if (kind === 'intentList')  return <IntentTopList />
  if (kind === 'template')    return <TemplateBlock />
  return null
}

// ---------- ChatMessage ----------
interface ChatMsg {
  id: string
  role: 'user' | 'agent'
  agent?: AgentKey
  text: string
  rich?: RichKind
}

const ChatMessage = ({ m, streaming }: { m: ChatMsg; streaming: boolean }) => {
  if (m.role === 'user') {
    return (
      <div className="flex justify-end">
        <div
          className="max-w-[85%] rounded-2xl rounded-br-md px-4 py-2.5 text-sm"
          style={{
            background: 'rgba(171,199,255,0.10)',
            color: '#e7e5ea',
            boxShadow: 'inset 0 0 0 1px rgba(171,199,255,0.10)',
          }}
        >
          {m.text}
        </div>
      </div>
    )
  }
  const a = AGENTS[m.agent ?? 'sales']
  return (
    <div className="flex gap-3">
      <div className="pt-1 shrink-0">
        <Orb color={a.color} size={22} active={streaming} />
      </div>
      <div className="flex-1 max-w-[88%]">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[0.78rem] font-semibold" style={{ color: a.color }}>{a.name}</span>
          <span className="text-[10px] uppercase tracking-[0.16em] text-[#7e7c83]">RAG demo</span>
        </div>
        <div className="rounded-2xl rounded-tl-md px-4 py-3 bg-shimmer/40 fo-glass-rim">
          <div className="text-[0.95rem] leading-relaxed text-[#e7e5ea] whitespace-pre-wrap">
            {m.text}
            {streaming && <span className="fo-cursor-blink" />}
          </div>
          {m.rich && !streaming && <RichBlock kind={m.rich} />}
          {!streaming && (
            <div className="mt-3 text-[11px] text-[#7e7c83] flex items-center gap-1.5">
              <Sparkles size={12} color="#abc7ff" />
              これは ルキスマCRM のRAGデモです。実データで試すには{' '}
              <a href="/login?mode=register&callbackUrl=/dashboard" className="text-aurora hover:underline ml-1">無料アカウント発行 →</a>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ---------- Hero ----------
// ---------- Dropdown menu primitives ----------
const DropdownMenu = ({ children, wide }: { children: React.ReactNode; wide?: boolean }) => (
  <div
    className={`absolute bottom-full left-0 mb-2 rounded-xl bg-pitch fo-glass-rim py-1 z-50 ${wide ? 'w-[260px]' : 'w-[200px]'}`}
    style={{ boxShadow: '0 10px 30px rgba(0,0,0,0.5), inset 0 0 0 1px rgba(171,199,255,0.15)' }}
    onClick={(e) => e.stopPropagation()}
  >
    {children}
  </div>
)

const DropdownHeader = ({ children }: { children: React.ReactNode }) => (
  <div className="px-3 py-1.5 text-[9px] uppercase tracking-[0.14em] text-[#7e7c83] border-b border-white/[0.04] mb-1">
    {children}
  </div>
)

const DropdownItem = ({
  children,
  selected,
  onClick,
  meta,
}: { children: React.ReactNode; selected?: boolean; onClick: () => void; meta?: string }) => (
  <button
    type="button"
    onClick={onClick}
    className="w-full text-left px-3 py-2 text-[12px] flex items-center justify-between gap-3 rounded-md hover:bg-shimmer/40 transition-colors"
    style={{ color: selected ? '#abc7ff' : '#c7c5c9' }}
  >
    <span className="flex flex-col min-w-0">
      <span className="truncate">{children}</span>
      {meta && <span className="text-[10px] text-[#7e7c83] mt-0.5">{meta}</span>}
    </span>
    {selected && <Check size={12} color="#abc7ff" className="shrink-0" />}
  </button>
)

// ---------- Option chips (model / scope / person / external) ----------
type ModelKey      = 'gemini-2.5-flash-lite' | 'gpt-4o-mini' | 'gpt-4o'
type FeatureAgentId = 'sales' | 'marketing' | 'support' | 'helpdesk' | 'pdm'

// サービス側 AssigneeFilter と整合させる: バッジ色 / イニシャル / 表示名
const FEATURE_AGENTS: { id: FeatureAgentId; name: string; initial: string; color: string }[] = [
  { id: 'sales',     name: 'Sales Agent',     initial: 'S', color: '#abc7ff' },
  { id: 'marketing', name: 'Marketing Agent', initial: 'M', color: '#ffcf4a' },
  { id: 'support',   name: 'Customer Agent',  initial: 'C', color: '#ff8dcf' },
  { id: 'helpdesk',  name: 'Knowledge Agent', initial: 'K', color: '#c8b9ff' },
  { id: 'pdm',       name: 'Product Agent',   initial: 'P', color: '#8dffc9' },
]
const ALL_FEATURE_AGENT_IDS: FeatureAgentId[] = FEATURE_AGENTS.map((a) => a.id)
type PersonScope   = 'all' | 'tanaka' | 'suzuki' | 'sato' | 'takahashi' | 'watanabe'
type ExternalScope = 'off' | 'web'

const MODEL_LABELS: Record<ModelKey, string> = {
  'gemini-2.5-flash-lite': 'Gemini 2.5 Flash Lite',
  'gpt-4o-mini':     'GPT-4o mini',
  'gpt-4o':          'GPT-4o',
}
const PERSON_LABELS: Record<PersonScope, string> = {
  all: '全て',
  tanaka: '田中 太郎',
  suzuki: '鈴木 花子',
  sato: '佐藤 次郎',
  takahashi: '高橋 美咲',
  watanabe: '渡辺 健二',
}
const PERSON_ROLES: Record<PersonScope, string> = {
  all: '',
  tanaka: 'エンタープライズ営業',
  suzuki: 'マーケ／インサイドセールス',
  sato: 'カスタマーサポート',
  takahashi: 'PdM',
  watanabe: 'ヘルプデスク',
}
const EXTERNAL_LABELS: Record<ExternalScope, string> = {
  off: 'OFF',
  web: '外部リサーチ',
}
const EXTERNAL_SHORT: Record<ExternalScope, string> = {
  off: 'OFF',
  web: 'ON',
}
const EXTERNAL_DESC: Record<ExternalScope, string> = {
  off: '内部データのみを参照',
  web: 'Web検索結果も併用',
}

export const Hero = () => {
  const [messages, setMessages] = useState<ChatMsg[]>([
    { id: 'm-init-u', role: 'user', text: '今週アプローチすべきHOT企業を教えて' },
    {
      id: 'm-init-a',
      role: 'agent',
      agent: 'sales',
      text: RESPONSES.hot.text,
      rich: RESPONSES.hot.rich,
    },
  ])
  const [streamingId, setStreamingId] = useState<string | null>(null)
  const [activeAgent, setActiveAgent] = useState<AgentKey | null>(null)
  const [input, setInput] = useState('')
  const [phIdx, setPhIdx] = useState(0)
  const [phShow, setPhShow] = useState(true)
  const [demoView, setDemoView] = useState<HeroDemoKey>('chat')
  const [model, setModel] = useState<ModelKey>('gpt-4o-mini')
  const [featureAgents, setFeatureAgents] = useState<Set<FeatureAgentId>>(
    () => new Set(ALL_FEATURE_AGENT_IDS),
  )
  const allFeaturesOn = featureAgents.size === ALL_FEATURE_AGENT_IDS.length
  const featureChipLabel = allFeaturesOn ? '全て' : `${featureAgents.size}/${ALL_FEATURE_AGENT_IDS.length}`
  const [personScope, setPersonScope] = useState<PersonScope>('all')
  const [externalScope, setExternalScope] = useState<ExternalScope>('web')
  const [openMenu, setOpenMenu] = useState<'model' | 'feature' | 'person' | 'external' | null>(null)
  const [demoUsage, setDemoUsage] = useState<DemoUsage>(() => ({
    dateKey: getJstDateKey(),
    credits: 0,
  }))
  const threadRef = useRef<HTMLDivElement | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const menuRootRef = useRef<HTMLDivElement | null>(null)
  const demoCreditsUsed = demoUsage.dateKey === getJstDateKey() ? demoUsage.credits : 0
  const demoLimitReached = demoCreditsUsed >= LP_DEMO_DAILY_CREDIT_LIMIT

  // Close dropdowns on outside click
  useEffect(() => {
    if (!openMenu) return
    const onDocClick = (e: MouseEvent) => {
      if (menuRootRef.current && !menuRootRef.current.contains(e.target as Node)) {
        setOpenMenu(null)
      }
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [openMenu])

  // Rotate placeholder
  useEffect(() => {
    const t = setInterval(() => {
      setPhShow(false)
      setTimeout(() => {
        setPhIdx((i) => (i + 1) % PLACEHOLDERS.length)
        setPhShow(true)
      }, 600)
    }, 3000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(LP_DEMO_USAGE_STORAGE_KEY)
      if (!raw) return
      const parsed = JSON.parse(raw) as Partial<DemoUsage>
      if (parsed.dateKey === getJstDateKey() && typeof parsed.credits === 'number') {
        setDemoUsage({ dateKey: parsed.dateKey, credits: parsed.credits })
      }
    } catch {
      // Local-only guard. If storage is unavailable, the static demo still does not call paid APIs.
    }
  }, [])

  // Autoscroll
  useEffect(() => {
    if (threadRef.current) {
      threadRef.current.scrollTo({ top: threadRef.current.scrollHeight, behavior: 'smooth' })
    }
  })

  const consumeDemoCredit = useCallback(() => {
    const dateKey = getJstDateKey()
    setDemoUsage((prev) => {
      const currentCredits = prev.dateKey === dateKey ? prev.credits : 0
      const next = { dateKey, credits: Math.min(currentCredits + 1, LP_DEMO_DAILY_CREDIT_LIMIT) }
      try {
        window.localStorage.setItem(LP_DEMO_USAGE_STORAGE_KEY, JSON.stringify(next))
      } catch {
        // Ignore storage failures; this HP demo is currently static and cost-free.
      }
      return next
    })
  }, [])

  const streamResponse = useCallback((agent: AgentKey, baseText: string, rich: RichKind) => {
    const id = 'a' + Date.now()
    const personPrefix = personScope !== 'all'
      ? `${PERSON_LABELS[personScope]}さん（${PERSON_ROLES[personScope]}）の担当データから抽出しました。\n\n`
      : ''
    const externalPrefix = externalScope === 'web'
      ? '※ 外部リサーチ（Web検索）の最新情報も反映しています。\n\n'
      : ''
    const featureScopeLabel = allFeaturesOn
      ? '全て'
      : FEATURE_AGENTS.filter((a) => featureAgents.has(a.id)).map((a) => a.name).join('・') || 'なし'
    const scopeNote = allFeaturesOn && personScope === 'all' && externalScope === 'off'
      ? ''
      : `\n\n（参照スコープ：機能=${featureScopeLabel} ／ 人=${PERSON_LABELS[personScope]} ／ 外部=${EXTERNAL_LABELS[externalScope]}）`
    const modelNote = `\n— Powered by ${MODEL_LABELS[model]}`
    const text = personPrefix + externalPrefix + baseText + scopeNote + modelNote
    setMessages((ms) => [...ms, { id, role: 'agent', agent, text: '', rich }])
    setStreamingId(id)
    setActiveAgent(agent)
    let i = 0
    let timer: ReturnType<typeof setTimeout>
    const step = () => {
      i += 2
      setMessages((ms) => ms.map((m) => (m.id === id ? { ...m, text: text.slice(0, i) } : m)))
      if (i < text.length) {
        timer = setTimeout(step, 28)
      } else {
        setStreamingId(null)
        setActiveAgent(null)
      }
    }
    timer = setTimeout(step, 220)
    return () => clearTimeout(timer)
  }, [model, featureAgents, personScope, externalScope, allFeaturesOn])

  const sendChip = useCallback(
    (sug: Suggestion) => {
      if (streamingId || demoLimitReached) return
      consumeDemoCredit()
      const userMsg: ChatMsg = { id: 'u' + Date.now(), role: 'user', text: sug.label }
      setMessages((ms) => [...ms, userMsg])
      const r = RESPONSES[sug.id]
      setTimeout(() => streamResponse(r.agent, r.text, r.rich), 350)
    },
    [consumeDemoCredit, demoLimitReached, streamingId, streamResponse]
  )

  const sendInput = useCallback(() => {
    const v = input.trim()
    if (!v || streamingId || demoLimitReached) return
    consumeDemoCredit()
    setInput('')
    setMessages((ms) => [...ms, { id: 'u' + Date.now(), role: 'user', text: v }])
    const match = SUGGESTIONS.find((s) => v.includes(s.label.slice(0, 8)) || v === s.label)
    setTimeout(() => {
      if (match) {
        const r = RESPONSES[match.id]
        streamResponse(r.agent, r.text, r.rich)
      } else {
        const fallback =
          'こちらは静的デモ環境のため、自由入力には実データで回答できません。実際にあなたの組織のデータで試すには、リリース後にアカウントを発行いただけるよう先行予約をお願いします → 先行予約に登録'
        streamResponse('sales', `Sales Agent: ${fallback}`, null)
      }
    }, 350)
  }, [consumeDemoCredit, demoLimitReached, input, streamingId, streamResponse])

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendInput()
    }
  }

  const orbs: Array<{ agent: AgentKey; pos: string; size: number }> = [
    { agent: 'sales',     pos: 'top-[8%] left-[6%] hidden md:block',      size: 38 },
    { agent: 'marketing', pos: 'top-[14%] right-[7%] hidden md:block',    size: 44 },
    { agent: 'pdm',       pos: 'bottom-[18%] left-[4%] hidden md:block',  size: 36 },
    { agent: 'support',   pos: 'bottom-[10%] right-[6%] hidden md:block', size: 42 },
    { agent: 'helpdesk',  pos: 'top-[48%] left-[2%] hidden lg:block',     size: 32 },
  ]

  const heroWords = ['営業の', 'すべての', '答えが、']
  const heroLine2 = ['ひとつの', 'チャットに。']

  return (
    <Section id="hero" tone="obsidian" screenLabel="01 Hero">
      <NebulaBG intensity={1.2} />
      <ParticleField count={48} seed={11} />

      {orbs.map((o, i) => (
        <div key={i} className={`absolute ${o.pos} fo-orb-drift`} style={{ animationDelay: `-${i * 1.4}s` }}>
          <Orb color={AGENTS[o.agent].color} size={o.size} active={activeAgent === o.agent} glow={1.4} />
        </div>
      ))}

      <div className="relative mx-auto max-w-6xl px-6 pt-32 md:pt-40 pb-24 md:pb-32 min-h-screen flex flex-col justify-center">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <Eyebrow color="#abc7ff">CHAT CRM ／ 株式会社ルーキースマートジャパン</Eyebrow>
          </div>
          <h1 className="font-display font-bold tracking-[-0.025em] text-[2.6rem] sm:text-[3.4rem] md:text-[4.6rem] leading-[1.04]">
            <span className="block">
              {heroWords.map((w, i) => (
                <span key={i} className="fo-word-in inline-block fo-gradient-text" style={{ animationDelay: `${i * 80}ms` }}>
                  {w}
                </span>
              ))}
            </span>
            <span className="block mt-1">
              {heroLine2.map((w, i) => (
                <span
                  key={i}
                  className="fo-word-in inline-block fo-gradient-text"
                  style={{ animationDelay: `${(i + heroWords.length) * 80}ms` }}
                >
                  {w}
                </span>
              ))}
            </span>
          </h1>
          <p className="mt-6 text-[#c7c5c9] max-w-2xl mx-auto text-[1.05rem] leading-relaxed fo-word-in" style={{ animationDelay: '650ms' }}>
            商談・メール・議事録・求人インテント・290万社DBを横断し、
            <br />
            あなたの会社のデータを踏まえて答えます。
          </p>

          {/* Top trust strip — 数値プルーフ */}
          <div className="mt-8 flex flex-wrap justify-center items-center gap-x-8 sm:gap-x-12 gap-y-3 fo-word-in" style={{ animationDelay: '780ms' }}>
            <div className="flex items-baseline gap-2">
              <span className="font-display font-bold fo-gradient-text text-[1.5rem] sm:text-[1.8rem] leading-none">約6,000</span>
              <span className="text-[10px] uppercase tracking-[0.14em] text-[#9b99a0]">社 累計エンリッチ</span>
            </div>
            <span className="hidden sm:inline-block h-6 w-px bg-white/[0.08]" />
            <div className="flex items-baseline gap-2">
              <span className="font-display font-bold fo-gradient-text text-[1.5rem] sm:text-[1.8rem] leading-none">25</span>
              <span className="text-[10px] uppercase tracking-[0.14em] text-[#9b99a0]">部門 求人インテント</span>
            </div>
            <span className="hidden sm:inline-block h-6 w-px bg-white/[0.08]" />
            <div className="flex items-baseline gap-2">
              <span className="font-display font-bold fo-gradient-text text-[1.5rem] sm:text-[1.8rem] leading-none">2,900,000</span>
              <span className="text-[10px] uppercase tracking-[0.14em] text-[#9b99a0]">社 収録企業</span>
            </div>
          </div>
        </div>

        {/* Chat panel */}
        <div className="relative mt-10 md:mt-14 fo-word-in" style={{ animationDelay: '900ms' } as CSSProperties}>
          <div
            className="absolute -inset-6 rounded-[2.2rem] fo-halo pointer-events-none"
            style={{
              background: 'linear-gradient(120deg, rgba(171,199,255,0.18), rgba(0,113,227,0.20))',
              filter: 'blur(40px)',
            }}
          />
          <div className="relative rounded-[1.8rem] fo-glass-strong fo-glass-rim overflow-hidden fo-tilt-1400" style={{ transformStyle: 'preserve-3d' }}>
            <div className="flex">
              <HeroSidebar active={demoView} onSelect={setDemoView} />
              <div className="flex-1 min-w-0 flex flex-col" style={{ minHeight: 540 }}>
                {demoView !== 'chat' && <HeroDemoView kind={demoView} />}
                {demoView === 'chat' && (<>
            {/* Top bar */}
            <div className="px-5 md:px-7 pt-5 pb-3 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex -space-x-1.5">
                  {(Object.keys(AGENTS) as AgentKey[]).map((k) => (
                    <span key={k} className="rounded-full" style={{ padding: 1, background: '#1b1b1d' }}>
                      <Orb color={AGENTS[k].color} size={14} active={activeAgent === k} />
                    </span>
                  ))}
                </div>
                <span className="text-sm text-[#c7c5c9]">
                  ルキスマCRM <span className="text-[#7e7c83]">／ Live RAG demo</span>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className="rounded-full px-2 py-0.5 text-[10px] uppercase tracking-[0.14em] font-mono"
                  style={{ background: 'rgba(141,255,201,0.10)', color: '#8dffc9' }}
                >
                  ● online
                </span>
                <span className="text-xs text-[#7e7c83] font-mono hidden sm:block">tnt_demo · region:apne1</span>
              </div>
            </div>

            {/* Thread */}
            <div
              ref={threadRef}
              className="px-5 md:px-7 py-4 space-y-5 overflow-y-auto fo-thin-scroll"
              style={{ minHeight: 320, maxHeight: 480 }}
            >
              {messages.map((m) => (
                <ChatMessage key={m.id} m={m} streaming={m.id === streamingId} />
              ))}
            </div>

            {/* Input */}
            <div className="px-5 md:px-7 pb-5 pt-2">
              <div className="relative">
                <div
                  className="absolute -inset-2 rounded-2xl pointer-events-none"
                  style={{
                    background: 'linear-gradient(90deg, rgba(171,199,255,0.18), rgba(0,113,227,0.18))',
                    filter: 'blur(18px)',
                  }}
                />
                <div
                  className="relative rounded-2xl bg-pitch px-4 md:px-5 pt-4 pb-3"
                  style={{ boxShadow: 'inset 0 0 0 1px rgba(65,71,83,0.18)' }}
                  onClick={() => inputRef.current?.focus()}
                >
                  {/* Row 1: input */}
                  <div className="flex items-center gap-3 mb-3">
                    <Sparkles size={18} color="#abc7ff" className="shrink-0" />
                    <div className="flex-1 relative">
                      <input
                        ref={inputRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={onKeyDown}
                        className="w-full bg-transparent outline-none text-[1rem] md:text-[1.05rem] text-[#e7e5ea]"
                        style={{ caretColor: '#abc7ff' }}
                        readOnly={demoLimitReached}
                        aria-label="ask ルキスマCRM"
                      />
                      {!input && (
                        <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none">
                          <span className="fo-cursor-blink shrink-0" />
                          <span
                            className={`ml-2 text-[#7e7c83] text-[1rem] md:text-[1.05rem] transition-all duration-[600ms] ${phShow ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-1'}`}
                          >
                            {demoLimitReached ? '本日のデモ質問上限に達しました' : PLACEHOLDERS[phIdx]}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Row 2: option chips + actions */}
                  <div ref={menuRootRef} className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <button
                        type="button"
                        className="w-8 h-8 rounded-full inline-flex items-center justify-center text-[#9b99a0] hover:bg-shimmer/40 transition-colors"
                        onClick={(e) => e.stopPropagation()}
                        aria-label="添付"
                      >
                        <Paperclip size={14} />
                      </button>

                      <span
                        className={`h-8 px-2.5 rounded-full inline-flex items-center gap-1.5 text-[11.5px] ${
                          demoLimitReached ? 'text-[#ffcf4a]' : 'text-[#c7c5c9]'
                        }`}
                        style={{
                          background: demoLimitReached
                            ? 'rgba(255,207,74,0.12)'
                            : 'rgba(171,199,255,0.08)',
                          boxShadow: `inset 0 0 0 1px ${
                            demoLimitReached ? 'rgba(255,207,74,0.24)' : 'rgba(171,199,255,0.16)'
                          }`,
                        }}
                        title="公開HPデモの上限です。1質問=1cr、1日10cr（約100円）まで。"
                      >
                        デモ
                        <span className="font-mono tabular-nums">
                          {demoCreditsUsed}/{LP_DEMO_DAILY_CREDIT_LIMIT}cr
                        </span>
                      </span>

                      {/* Model dropdown */}
                      <div className="relative">
                        <button
                          type="button"
                          className={`h-8 px-2.5 rounded-full inline-flex items-center gap-1.5 text-[11.5px] text-[#c7c5c9] transition-colors ${openMenu === 'model' ? 'bg-shimmer/70' : 'bg-shimmer/40 hover:bg-shimmer/60'}`}
                          onClick={(e) => { e.stopPropagation(); setOpenMenu(openMenu === 'model' ? null : 'model') }}
                        >
                          <Sparkles size={11} color="#abc7ff" />
                          {MODEL_LABELS[model]}
                          <ChevronDown size={11} color="#7e7c83" />
                        </button>
                        {openMenu === 'model' && (
                          <DropdownMenu>
                            <DropdownHeader>モデル選択</DropdownHeader>
                            {(Object.keys(MODEL_LABELS) as ModelKey[]).map((k) => (
                              <DropdownItem
                                key={k}
                                selected={model === k}
                                onClick={() => { setModel(k); setOpenMenu(null) }}
                              >
                                {MODEL_LABELS[k]}
                              </DropdownItem>
                            ))}
                          </DropdownMenu>
                        )}
                      </div>

                      {/* Feature scope dropdown — サービス側 AssigneeFilter と同UI(エージェント別マルチセレクト) */}
                      <div className="relative">
                        <button
                          type="button"
                          className={`h-8 px-2.5 rounded-full inline-flex items-center gap-1.5 text-[11.5px] text-[#c7c5c9] transition-colors ${openMenu === 'feature' ? 'bg-shimmer/70' : 'bg-shimmer/40 hover:bg-shimmer/60'}`}
                          onClick={(e) => { e.stopPropagation(); setOpenMenu(openMenu === 'feature' ? null : 'feature') }}
                        >
                          <Layers size={11} color="#abc7ff" />
                          機能 <span className="text-[#7e7c83]">{featureChipLabel}</span>
                          <ChevronDown size={11} color="#7e7c83" />
                        </button>
                        {openMenu === 'feature' && (
                          <DropdownMenu wide>
                            <div className="flex items-center justify-between px-3 pt-2 pb-1">
                              <span className="text-[10px] font-semibold tracking-[0.06em] uppercase text-[#9b99a0]">
                                機能
                                <span className="ml-1.5 tabular-nums opacity-70">
                                  {featureAgents.size}/{ALL_FEATURE_AGENT_IDS.length}
                                </span>
                              </span>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setFeatureAgents(
                                    allFeaturesOn ? new Set() : new Set(ALL_FEATURE_AGENT_IDS),
                                  )
                                }}
                                className="text-[10.5px] font-semibold px-1.5 py-0.5 rounded-[4px] transition-colors"
                                style={{
                                  color: allFeaturesOn ? '#abc7ff' : '#9b99a0',
                                  backgroundColor: allFeaturesOn ? 'rgba(171,199,255,0.12)' : 'transparent',
                                }}
                              >
                                {allFeaturesOn ? '全てON' : '全て選択'}
                              </button>
                            </div>
                            {FEATURE_AGENTS.map((a) => {
                              const checked = featureAgents.has(a.id)
                              return (
                                <button
                                  key={a.id}
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setFeatureAgents((prev) => {
                                      const next = new Set(prev)
                                      if (next.has(a.id)) next.delete(a.id)
                                      else next.add(a.id)
                                      return next
                                    })
                                  }}
                                  className="w-full flex items-center gap-2.5 px-3 py-1.5 transition-colors hover:bg-shimmer/40 text-left"
                                >
                                  {/* Orb スタイルのドット — クリックで光が消える */}
                                  <span
                                    className="inline-flex items-center justify-center w-[20px] h-[20px] shrink-0"
                                    aria-hidden
                                  >
                                    <span
                                      className="inline-block rounded-full transition-all duration-200"
                                      style={{
                                        width: 11,
                                        height: 11,
                                        background: checked
                                          ? `radial-gradient(circle at 30% 30%, #ffffff 0%, ${a.color} 35%, ${a.color}80 80%)`
                                          : `radial-gradient(circle at 30% 30%, #2a2a2e 0%, #1a1a1c 60%, ${a.color}30 100%)`,
                                        boxShadow: checked
                                          ? `0 0 8px ${a.color}aa, 0 0 20px ${a.color}55`
                                          : `inset 0 0 0 1px ${a.color}40`,
                                      }}
                                    />
                                  </span>
                                  <span
                                    className="text-[12.5px] transition-colors duration-200"
                                    style={{ color: checked ? '#e7e5ea' : '#7e7c83' }}
                                  >
                                    {a.name}
                                  </span>
                                </button>
                              )
                            })}
                          </DropdownMenu>
                        )}
                      </div>

                      {/* Person scope dropdown */}
                      <div className="relative">
                        <button
                          type="button"
                          className={`h-8 px-2.5 rounded-full inline-flex items-center gap-1.5 text-[11.5px] text-[#c7c5c9] transition-colors ${openMenu === 'person' ? 'bg-shimmer/70' : 'bg-shimmer/40 hover:bg-shimmer/60'}`}
                          onClick={(e) => { e.stopPropagation(); setOpenMenu(openMenu === 'person' ? null : 'person') }}
                        >
                          <User size={11} color="#abc7ff" />
                          人 <span className="text-[#7e7c83]">{PERSON_LABELS[personScope]}</span>
                          <ChevronDown size={11} color="#7e7c83" />
                        </button>
                        {openMenu === 'person' && (
                          <DropdownMenu wide>
                            <DropdownHeader>参照する人</DropdownHeader>
                            {(Object.keys(PERSON_LABELS) as PersonScope[]).map((k) => (
                              <DropdownItem
                                key={k}
                                selected={personScope === k}
                                onClick={() => { setPersonScope(k); setOpenMenu(null) }}
                                meta={PERSON_ROLES[k]}
                              >
                                {PERSON_LABELS[k]}
                              </DropdownItem>
                            ))}
                          </DropdownMenu>
                        )}
                      </div>

                      {/* External data toggle */}
                      <div className="relative">
                        <button
                          type="button"
                          className={`h-8 px-2.5 rounded-full inline-flex items-center gap-1.5 text-[11.5px] text-[#c7c5c9] transition-colors ${openMenu === 'external' ? 'bg-shimmer/70' : 'bg-shimmer/40 hover:bg-shimmer/60'}`}
                          onClick={(e) => { e.stopPropagation(); setOpenMenu(openMenu === 'external' ? null : 'external') }}
                        >
                          <Globe size={11} color={externalScope === 'off' ? '#7e7c83' : '#abc7ff'} />
                          外部 <span className={externalScope === 'off' ? 'text-[#7e7c83]' : 'text-aurora'}>{EXTERNAL_SHORT[externalScope]}</span>
                          <ChevronDown size={11} color="#7e7c83" />
                        </button>
                        {openMenu === 'external' && (
                          <DropdownMenu wide>
                            <DropdownHeader>外部データ連携</DropdownHeader>
                            {(Object.keys(EXTERNAL_LABELS) as ExternalScope[]).map((k) => (
                              <DropdownItem
                                key={k}
                                selected={externalScope === k}
                                onClick={() => { setExternalScope(k); setOpenMenu(null) }}
                                meta={EXTERNAL_DESC[k]}
                              >
                                {EXTERNAL_LABELS[k]}
                              </DropdownItem>
                            ))}
                          </DropdownMenu>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        className="w-8 h-8 rounded-full inline-flex items-center justify-center text-[#9b99a0] hover:bg-shimmer/40 transition-colors"
                        onClick={(e) => e.stopPropagation()}
                        aria-label="音声入力"
                      >
                        <Mic size={14} />
                      </button>
                      <button
                        onClick={sendInput}
                        disabled={!input.trim() || !!streamingId || demoLimitReached}
                        className="rounded-lg px-3.5 h-9 inline-flex items-center gap-1.5 text-[12.5px] font-medium disabled:opacity-40"
                        style={{ background: 'linear-gradient(135deg, #abc7ff, #0071e3)', color: '#0a0a0c' }}
                      >
                        送信 <Send size={13} color="#0a0a0c" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Suggested chips */}
              <div className="mt-4 flex flex-wrap gap-2">
                {SUGGESTIONS.map((s) => {
                  const a = AGENTS[s.agent]
                  return (
                    <button
                      key={s.id}
                      onClick={() => sendChip(s)}
                      disabled={!!streamingId || demoLimitReached}
                      className="group inline-flex items-center gap-2 rounded-full pl-2 pr-3 py-1.5 text-xs bg-dusk hover:bg-shimmer transition-colors disabled:opacity-40 fo-chip-shimmer"
                    >
                      <Orb color={a.color} size={10} />
                      <span className="text-[#e7e5ea]">{s.label}</span>
                      <span className="text-[#7e7c83] hidden sm:inline">→ {a.name}</span>
                    </button>
                  )
                })}
              </div>
            </div>
                </>)}
              </div>
            </div>
          </div>
        </div>

        {/* Below chat */}
        <div className="mt-12 md:mt-16 text-center space-y-7">
          {/* 連携サービス（カテゴリ別） */}
          <div>
            <div className="text-[10px] uppercase tracking-[0.18em] text-[#7e7c83] mb-5">CONNECTS WITH ／ 連携サービス</div>
            <div className="max-w-4xl mx-auto space-y-3">
              {[
                {
                  tag: '標準連携',           tagColor: '#8dffc9', tagBg: 'rgba(141,255,201,0.10)',
                  items: [
                    { l: 'Google Workspace', c: '#abc7ff', sub: 'Gmail / Meet / Calendar' },
                    { l: 'Notion',           c: '#e7e5ea', sub: '議事録' },
                  ],
                },
                {
                  tag: '近日対応予定',        tagColor: '#ffcf4a', tagBg: 'rgba(255,207,74,0.10)',
                  items: [
                    { l: 'Microsoft 365',    c: '#abc7ff', sub: 'Outlook / Teams' },
                    { l: 'Zoom',             c: '#7aa4ff', sub: '議事録' },
                  ],
                },
                {
                  tag: 'CRMデータ移行（CSV）', tagColor: '#abc7ff', tagBg: 'rgba(171,199,255,0.10)',
                  items: [
                    { l: 'Salesforce',       c: '#7ec6ff' },
                    { l: 'HubSpot',          c: '#ff9f6b' },
                    { l: 'その他 CRM',         c: '#9b99a0' },
                  ],
                },
                {
                  tag: 'カスタム連携', tagColor: '#d3a5ff', tagBg: 'rgba(211,165,255,0.10)',
                  items: [
                    { l: 'その他カスタム連携',  c: '#9b99a0', sub: 'お気軽にご相談ください' },
                  ],
                },
              ].map((group) => (
                <div key={group.tag} className="flex flex-wrap items-center justify-center gap-2 md:gap-3">
                  <span
                    className="inline-flex items-center text-[9px] font-mono uppercase tracking-[0.14em] px-2 py-1 rounded-full"
                    style={{ background: group.tagBg, color: group.tagColor, boxShadow: `inset 0 0 0 1px ${group.tagColor}30` }}
                  >
                    {group.tag}
                  </span>
                  {group.items.map((s) => {
                    const sub = 'sub' in s ? s.sub : undefined
                    return (
                      <span
                        key={s.l}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-pitch/60 fo-glass-rim text-[12px] text-[#c7c5c9] hover:text-[#e7e5ea] hover:bg-shimmer/40 transition-colors"
                        title={sub}
                      >
                        <span className="w-1.5 h-1.5 rounded-full" style={{ background: s.c, boxShadow: `0 0 6px ${s.c}` }} />
                        {s.l}
                        {sub && (
                          <span className="text-[10px] text-[#7e7c83] hidden md:inline">／ {sub}</span>
                        )}
                      </span>
                    )
                  })}
                </div>
              ))}
            </div>
          </div>

          <div className="text-[#c7c5c9] text-sm">
            実際にあなたの組織のデータで試すには →{' '}
            <a
              href="https://app.spirinc.com/t/3u_FXTG5abaFIZ-D7as8v/as/5j4iMsFHgutg6an7CRg9o/confirm"
              target="_blank"
              rel="noopener noreferrer"
              className="text-aurora underline-offset-4 hover:underline"
            >
              営業相談を予約
            </a>
          </div>
        </div>
      </div>
    </Section>
  )
}
