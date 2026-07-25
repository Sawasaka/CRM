'use client'

/**
 * Hero — Revenue Experiment Infrastructure ライブデモ
 * チャット入力 + 5体のサジェストチップで RAG 風の回答を擬似ストリーミング表示。
 */

import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react'
import { Sparkles, Send, Check, Copy } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from 'recharts'
import { AGENTS, type AgentKey, Eyebrow, Orb, ParticleField, Section } from './atoms'
import { ConsultationCallButton } from './ConsultationCallModal'
import { HeroSidebar } from './HeroSidebar'
import { HeroDemoView, type HeroDemoKey } from './hero-demos'

const PLACEHOLDERS = [
  'どの施策から実験すべきですか？',
  'CVR・CAC・LTVをどう測りますか？',
  '既存のHubSpotやGA4は使えますか？',
  '確率モデルでは何を試算しますか？',
  '勝ち施策へどう配分しますか？',
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
  { id: 'hot', label: '売上実験インフラとは？', agent: 'sales' },
  { id: 'pdm', label: '最初に何を設計しますか？', agent: 'pdm' },
  { id: 'ticket', label: 'どの指標を測りますか？', agent: 'support' },
  { id: 'intent', label: 'ベイズ統計はどう使いますか？', agent: 'marketing' },
  { id: 'tmpl', label: '予算配分まで自動化できますか？', agent: 'helpdesk' },
]

const DEMO_AGENT_LABELS: Record<AgentKey, string> = {
  sales: 'Experiment Model',
  marketing: 'Bayesian Model',
  support: 'Measurement',
  pdm: 'Infrastructure',
  helpdesk: 'Allocation',
}

// ---------- Realtime signal badge (Hot / Mid / Low) ----------
type SignalLevel = 'Hot' | 'Mid' | 'Low'
const SIGNAL_STYLE: Record<SignalLevel, { bg: string; fg: string; pulse: boolean }> = {
  Hot: { bg: 'rgba(255,107,107,0.15)', fg: '#ff6b6b', pulse: true },
  Mid: { bg: 'rgba(255,207,74,0.14)', fg: '#ffcf4a', pulse: false },
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
    c: string
    i: string
    jobs: string
    jobsLv: SignalLevel
    dept: string
    rev: string
    emp: string
    sig: string
    sigLv: SignalLevel
  }> = [
    {
      c: 'FDEヒアリング',
      i: 'Discovery',
      jobs: '+12',
      jobsLv: 'Hot',
      dept: '営業 / CS',
      rev: '設計前',
      emp: '現場確認',
      sig: '課題整理',
      sigLv: 'Hot',
    },
    {
      c: 'Notion再設計',
      i: 'Portal',
      jobs: '+8',
      jobsLv: 'Mid',
      dept: '全社ナレッジ',
      rev: '設計中',
      emp: '構造整理',
      sig: '権限確認',
      sigLv: 'Mid',
    },
    {
      c: 'Obsidian AI検索',
      i: 'Knowledge',
      jobs: '+5',
      jobsLv: 'Mid',
      dept: '個人 / チーム',
      rev: 'PoC',
      emp: 'メモ統合',
      sig: '要約',
      sigLv: 'Mid',
    },
    {
      c: 'Workspace連携',
      i: 'Workflow',
      jobs: '+9',
      jobsLv: 'Hot',
      dept: '営業 / 管理',
      rev: '実装中',
      emp: 'Drive',
      sig: 'Docs連携',
      sigLv: 'Hot',
    },
    {
      c: 'Zoom議事録AI',
      i: 'Meeting',
      jobs: '+6',
      jobsLv: 'Mid',
      dept: '商談 / MTG',
      rev: '検証中',
      emp: '録画',
      sig: 'FAQ化',
      sigLv: 'Low',
    },
  ]
  return (
    <div className="mt-3 rounded-xl bg-pitch/80 p-4 fo-glass-rim overflow-x-auto fo-thin-scroll">
      {/* live indicator */}
      <div className="flex items-center justify-between mb-2 min-w-[680px]">
        <span className="text-[0.62rem] uppercase tracking-[0.14em] text-[#7e7c83]">
          AI インフラ設計 TOP5
        </span>
        <span className="inline-flex items-center gap-1.5 text-[9px] font-mono text-[#8dffc9]">
          <span
            className="w-1.5 h-1.5 rounded-full bg-mint animate-pulse"
            style={{ boxShadow: '0 0 6px #8dffc9' }}
          />
          LIVE · 60秒前更新
        </span>
      </div>
      <div className="grid grid-cols-[2fr_0.9fr_1.4fr_1.2fr_1fr_0.9fr_1.6fr] gap-x-3 text-[0.62rem] uppercase tracking-[0.14em] text-[#9b99a0] pb-2 min-w-[680px]">
        <div>設計テーマ</div>
        <div>領域</div>
        <div>優先度</div>
        <div>部門</div>
        <div className="text-right">状態</div>
        <div className="text-right">対象</div>
        <div>次アクション</div>
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
    {
      t: 'Salesforce 双方向連携の双方向フィールドマッピング',
      n: 14,
      src: 'B2B SaaS / 製造 / 商社',
    },
    { t: '議事録の話者分離と発言サマリー要約レベル設定', n: 11, src: 'BPO / 金融 / SaaS' },
    { t: 'PDM ダッシュボードの要望機能スコア閾値カスタム', n: 9, src: 'ProductOps / PdM' },
    { t: 'Marketo / HubSpot 双方向シーケンス起動', n: 8, src: 'マーケ / セールス' },
    { t: '監査ログ CSV エクスポート (90日 → 24ヶ月)', n: 7, src: 'セキュリティ / 法務' },
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
    { id: 'T-1037', t: 'Webhook 再送が実行されない', as: '鈴木', age: '8h', sev: 'med' },
  ]
  return (
    <div className="mt-3 space-y-3 fo-recharts">
      <div className="rounded-xl bg-pitch/80 p-4 fo-glass-rim">
        <div className="text-[0.68rem] uppercase tracking-[0.14em] text-[#9b99a0] mb-2">
          担当者別 未対応チケット
        </div>
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
    'アクトラス株式会社',
    '株式会社オリオン技研',
    'PoltCraft Inc.',
    'メリディアン製作所',
    'ベルガモット工業',
    'セレナーデ商事',
    'ノクターン物流',
    'リフラクトラボ',
    'ヴィアスポーラ',
    'サフロン株式会社',
  ]
  const deltas = [42, 31, 28, 24, 22, 19, 17, 14, 12, 10]
  return (
    <div className="mt-3 rounded-xl bg-pitch/80 p-4 fo-glass-rim grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
      {items.map((c, i) => (
        <div key={i} className="flex items-center gap-3 py-1">
          <div className="font-mono text-xs text-amber w-6">{String(i + 1).padStart(2, '0')}</div>
          <div className="flex-1 text-sm truncate">{c}</div>
          <span className="text-xs font-mono" style={{ color: '#ffcf4a' }}>
            ↑+{deltas[i]}人
          </span>
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
      <pre className="font-mono text-[12.5px] leading-relaxed text-[#c7c5c9] whitespace-pre-wrap">
        {tmpl}
      </pre>
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
    text: 'Revenue Experiment Infrastructureは、広告・Web・CRM・商談・受注をひとつのデータ導線へ接続し、仮説を小さく試して学習を残す仕組みです。分析レポートで終わらず、次に何を試し、どの施策へ予算と営業工数を配分するかまで運用できる状態を設計します。',
    rich: null,
  },
  pdm: {
    agent: 'pdm',
    text: '最初に流入から受注・継続までの売上導線を可視化し、改善余地と実験テーマを特定します。その後、確率モデルで複数シナリオを試算し、低コストで検証できる施策から着手します。',
    rich: null,
  },
  ticket: {
    agent: 'support',
    text: 'CVR、CAC、商談化率、受注率、LTV、継続率などから、意思決定に必要な指標だけを選びます。UTM、Lead ID、Deal ID、Customer IDをそろえ、キーワードや広告から受注まで追跡できるデータ収集インフラを整えます。',
    rich: null,
  },
  intent: {
    agent: 'marketing',
    text: '複数の訴求、キーワード、LP、営業アプローチを並行して比較し、データが増えるたびに各案の成功確率を更新します。固定期間を待つだけでなく、継続・停止・追加検証を判断しやすくします。',
    rich: null,
  },
  tmpl: {
    agent: 'helpdesk',
    text: 'バンディット配分エンジンを使い、成果が期待できる施策へ予算・流入・営業工数を段階的に寄せます。同時に一定の探索枠を残し、短期成果を伸ばしながら次の勝ち筋も探せる配分ルールを設計します。',
    rich: null,
  },
}

const RichBlock = ({ kind }: { kind: RichKind }) => {
  if (kind === 'hotTable') return <HotCompaniesTable />
  if (kind === 'featureList') return <FeatureRequestsList />
  if (kind === 'ticketChart') return <TicketChart />
  if (kind === 'intentList') return <IntentTopList />
  if (kind === 'template') return <TemplateBlock />
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
          <span className="text-[0.78rem] font-semibold" style={{ color: a.color }}>
            {DEMO_AGENT_LABELS[m.agent ?? 'sales']}
          </span>
          <span className="text-[10px] uppercase tracking-[0.16em] text-[#7e7c83]">
            service answer
          </span>
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
              売上実験インフラのサービスデモです。個別の実験設計は{' '}
              <a href="#contact" className="text-aurora hover:underline ml-1">
                お問い合わせへ →
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ---------- Hero ----------

export const Hero = () => {
  const [messages, setMessages] = useState<ChatMsg[]>([
    { id: 'm-init-u', role: 'user', text: '売上実験インフラとは？' },
    {
      id: 'm-init-a',
      role: 'agent',
      agent: 'sales',
      text: RESPONSES.hot.text,
      rich: RESPONSES.hot.rich,
    },
    { id: 'm-init-u-2', role: 'user', text: '最初に何を設計しますか？' },
    {
      id: 'm-init-a-2',
      role: 'agent',
      agent: 'pdm',
      text: RESPONSES.pdm.text,
      rich: RESPONSES.pdm.rich,
    },
  ])
  const [streamingId, setStreamingId] = useState<string | null>(null)
  const [activeAgent, setActiveAgent] = useState<AgentKey | null>(null)
  const [input, setInput] = useState('')
  const [phIdx, setPhIdx] = useState(0)
  const [phShow, setPhShow] = useState(true)
  const [demoView, setDemoView] = useState<HeroDemoKey>('chat')
  const [demoUsage, setDemoUsage] = useState<DemoUsage>(() => ({
    dateKey: getJstDateKey(),
    credits: 0,
  }))
  const threadRef = useRef<HTMLDivElement | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const demoCreditsUsed = demoUsage.dateKey === getJstDateKey() ? demoUsage.credits : 0
  const demoLimitReached = demoCreditsUsed >= LP_DEMO_DAILY_CREDIT_LIMIT

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
    if (threadRef.current && streamingId) {
      threadRef.current.scrollTo({ top: threadRef.current.scrollHeight, behavior: 'smooth' })
    }
  }, [messages, streamingId])

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
    const text = baseText
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
  }, [])

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
          'このデモでは、レベニューインフラ、確率モデル、データ収集、ベイズ統計、バンディット配分について確認できます。広告・Web・CRM・商談・受注をつなぎ、実験から配分改善まで回せる状態を設計します。'
        streamResponse('sales', fallback, null)
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
    { agent: 'sales', pos: 'top-[8%] left-[6%] hidden md:block', size: 38 },
    { agent: 'marketing', pos: 'top-[14%] right-[7%] hidden md:block', size: 44 },
    { agent: 'pdm', pos: 'bottom-[18%] left-[4%] hidden md:block', size: 36 },
    { agent: 'support', pos: 'bottom-[10%] right-[6%] hidden md:block', size: 42 },
    { agent: 'helpdesk', pos: 'top-[48%] left-[2%] hidden lg:block', size: 32 },
  ]

  const heroWords = ['売上を、勘ではなく実験で伸ばす。']
  const heroLine2: string[] = []

  return (
    <Section id="hero" tone="obsidian" screenLabel="01 Hero">
      <ParticleField count={48} seed={11} />

      {orbs.map((o, i) => (
        <div
          key={i}
          className={`absolute ${o.pos} fo-orb-drift`}
          style={{ animationDelay: `-${i * 1.4}s` }}
        >
          <Orb
            color={AGENTS[o.agent].color}
            size={o.size}
            active={activeAgent === o.agent}
            glow={1.4}
          />
        </div>
      ))}

      <div className="relative mx-auto max-w-6xl px-6 pt-10 md:pt-16 pb-24 md:pb-32 min-h-[calc(100vh-72px)] flex flex-col justify-center">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <Eyebrow color="#abc7ff">
              Revenue Experiment Infrastructure ／ 株式会社ルーキースマートジャパン
            </Eyebrow>
          </div>
          <h1 className="font-display font-bold tracking-[-0.02em] text-[2.05rem] sm:text-[2.75rem] md:text-[3.45rem] leading-[1.08]">
            <span className="block sm:whitespace-nowrap">
              {heroWords.map((w, i) => (
                <span
                  key={i}
                  className="fo-word-in inline-block fo-gradient-text"
                  style={{ animationDelay: `${i * 80}ms` }}
                >
                  {w}
                </span>
              ))}
            </span>
            {heroLine2.length > 0 && (
              <span className="block mt-1 sm:whitespace-nowrap">
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
            )}
          </h1>
          <p
            className="mt-5 text-[#c7c5c9] max-w-xl mx-auto text-[0.98rem] leading-relaxed fo-word-in"
            style={{ animationDelay: '650ms' }}
          >
            現場を理解したFDEが、データ収集・統計モデル・実験配分までを一気通貫で設計します。
          </p>

          {/* Top trust strip — コンセプト訴求 */}
          <div
            className="mt-8 flex flex-wrap justify-center items-center gap-x-6 sm:gap-x-10 gap-y-3 fo-word-in"
            style={{ animationDelay: '780ms' }}
          >
            <div className="flex items-baseline gap-2">
              <span className="font-display font-bold fo-gradient-text text-[1.25rem] sm:text-[1.5rem] leading-none">
                探索
              </span>
              <span className="text-[10px] uppercase tracking-[0.14em] text-[#9b99a0]">
                売上導線から実験テーマを発見
              </span>
            </div>
            <span className="hidden sm:inline-block h-6 w-px bg-white/[0.08]" />
            <div className="flex items-baseline gap-2">
              <span className="font-display font-bold fo-gradient-text text-[1.25rem] sm:text-[1.5rem] leading-none">
                計測
              </span>
              <span className="text-[10px] uppercase tracking-[0.14em] text-[#9b99a0]">
                施策から受注まで正しく接続
              </span>
            </div>
            <span className="hidden sm:inline-block h-6 w-px bg-white/[0.08]" />
            <div className="flex items-baseline gap-2">
              <span className="font-display font-bold fo-gradient-text text-[1.25rem] sm:text-[1.5rem] leading-none">
                配分
              </span>
              <span className="text-[10px] uppercase tracking-[0.14em] text-[#9b99a0]">
                勝ち筋へ予算と工数を寄せる
              </span>
            </div>
          </div>
        </div>

        {/* Chat panel */}
        <div
          className="relative mt-10 md:mt-14 fo-word-in"
          style={{ animationDelay: '900ms' } as CSSProperties}
        >
          <div
            className="absolute -inset-2 md:-inset-6 rounded-[2.2rem] fo-halo pointer-events-none"
            style={{
              background: 'linear-gradient(120deg, rgba(171,199,255,0.18), rgba(0,113,227,0.20))',
              filter: 'blur(40px)',
            }}
          />
          <div
            className="relative rounded-[1.2rem] md:rounded-[1.8rem] fo-glass-strong fo-glass-rim overflow-hidden md:fo-tilt-1400"
            style={{ transformStyle: 'preserve-3d' }}
          >
            <div className="flex">
              <HeroSidebar active={demoView} onSelect={setDemoView} />
              <div className="flex-1 min-w-0 flex flex-col min-h-[430px] md:min-h-[500px]">
                {demoView !== 'chat' && <HeroDemoView kind={demoView} />}
                {demoView === 'chat' && (
                  <>
                    {/* Top bar */}
                    <div className="px-3 md:px-7 pt-3 md:pt-4 pb-2 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 md:gap-2.5 min-w-0">
                        <div className="flex -space-x-1.5 shrink-0">
                          {(Object.keys(AGENTS) as AgentKey[]).map((k) => (
                            <span
                              key={k}
                              className="rounded-full"
                              style={{ padding: 1, background: '#1b1b1d' }}
                            >
                              <Orb color={AGENTS[k].color} size={14} active={activeAgent === k} />
                            </span>
                          ))}
                        </div>
                        <span className="text-xs md:text-sm text-[#c7c5c9] truncate">
                          Experiment Console{' '}
                          <span className="text-[#7e7c83] hidden sm:inline">
                            ／ Revenue workspace
                          </span>
                        </span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span
                          className="rounded-full px-2 py-0.5 text-[10px] uppercase tracking-[0.14em] font-mono"
                          style={{ background: 'rgba(141,255,201,0.10)', color: '#8dffc9' }}
                        >
                          ● online
                        </span>
                        <span className="text-xs text-[#7e7c83] font-mono hidden sm:block">
                          experiment_workspace · static demo
                        </span>
                      </div>
                    </div>

                    {/* Thread */}
                    <div
                      ref={threadRef}
                      className="flex-1 px-3 md:px-7 py-3 space-y-4 overflow-y-auto fo-thin-scroll"
                      style={{ minHeight: 300, maxHeight: 410 }}
                    >
                      {messages.map((m) => (
                        <ChatMessage key={m.id} m={m} streaming={m.id === streamingId} />
                      ))}
                    </div>

                    {/* Input */}
                    <div className="mt-auto px-3 md:px-7 pb-4 md:pb-5 pt-5 md:pt-7">
                      <div className="relative">
                        <div
                          className="absolute -inset-2 rounded-2xl pointer-events-none"
                          style={{
                            background:
                              'linear-gradient(90deg, rgba(171,199,255,0.18), rgba(0,113,227,0.18))',
                            filter: 'blur(18px)',
                          }}
                        />
                        <div
                          className="relative rounded-2xl bg-pitch px-3 md:px-5 pt-3 pb-3"
                          style={{ boxShadow: 'inset 0 0 0 1px rgba(65,71,83,0.18)' }}
                          onClick={() => inputRef.current?.focus()}
                        >
                          {/* Row 1: input */}
                          <div className="flex items-center gap-3 mb-3">
                            <Sparkles size={18} color="#abc7ff" className="shrink-0" />
                            <div className="flex-1 relative min-w-0 overflow-hidden">
                              <input
                                ref={inputRef}
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={onKeyDown}
                                className="w-full bg-transparent outline-none text-[1rem] md:text-[1.05rem] text-[#e7e5ea]"
                                style={{ caretColor: '#abc7ff' }}
                                readOnly={demoLimitReached}
                                aria-label="ask about revenue experiment infrastructure"
                              />
                              {!input && (
                                <div className="absolute inset-y-0 left-0 right-0 flex items-center pointer-events-none overflow-hidden">
                                  <span className="fo-cursor-blink shrink-0" />
                                  <span
                                    className={`ml-2 text-[#7e7c83] text-[1rem] md:text-[1.05rem] transition-all duration-[600ms] whitespace-nowrap overflow-hidden text-ellipsis min-w-0 ${phShow ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-1'}`}
                                  >
                                    {demoLimitReached
                                      ? '本日のデモ質問上限に達しました'
                                      : PLACEHOLDERS[phIdx]}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Row 2: action */}
                          <div className="flex justify-end">
                            <button
                              onClick={sendInput}
                              disabled={!input.trim() || !!streamingId || demoLimitReached}
                              className="inline-flex h-9 items-center gap-1.5 rounded-lg px-3.5 text-[12.5px] font-medium whitespace-nowrap disabled:opacity-40"
                              style={{
                                background: 'linear-gradient(135deg, #abc7ff, #0071e3)',
                                color: '#0a0a0c',
                              }}
                            >
                              送信 <Send size={13} color="#0a0a0c" />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Suggested chips */}
                      <div className="mt-3 flex flex-wrap justify-center gap-2">
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
                              <span className="text-[#7e7c83] hidden sm:inline">
                                → {DEMO_AGENT_LABELS[s.agent]}
                              </span>
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Below chat */}
        <div className="mt-12 md:mt-16 text-center space-y-7">
          {/* 連携サービス（カテゴリ別） */}
          <div>
            <div className="text-[10px] uppercase tracking-[0.18em] text-[#7e7c83] mb-5">
              CONNECTS WITH ／ 連携サービス
            </div>
            <div className="max-w-4xl mx-auto space-y-3">
              {[
                {
                  tag: '計測',
                  tagColor: '#8dffc9',
                  tagBg: 'rgba(141,255,201,0.10)',
                  items: [
                    { l: 'GA4', c: '#ffcf4a', sub: '流入 / CVR / イベント' },
                    { l: 'Search Console', c: '#abc7ff', sub: '検索語句 / 表示 / クリック' },
                  ],
                },
                {
                  tag: '広告',
                  tagColor: '#ffcf4a',
                  tagBg: 'rgba(255,207,74,0.10)',
                  items: [
                    { l: 'Google Ads', c: '#7ec6ff', sub: 'キーワード / CAC / 配分' },
                    { l: 'Meta Ads', c: '#abc7ff', sub: '訴求 / クリエイティブ / CV' },
                  ],
                },
                {
                  tag: 'CRM',
                  tagColor: '#7ec6ff',
                  tagBg: 'rgba(126,198,255,0.10)',
                  items: [
                    { l: 'HubSpot', c: '#ff9f6b', sub: 'リード / 商談 / 受注' },
                    { l: 'Salesforce', c: '#7ec6ff', sub: '案件 / 売上 / 顧客' },
                  ],
                },
                {
                  tag: 'データ',
                  tagColor: '#abc7ff',
                  tagBg: 'rgba(171,199,255,0.10)',
                  items: [
                    { l: 'BigQuery', c: '#7aa4ff', sub: '統合 / 集計 / モデル' },
                    { l: 'Google Sheets', c: '#8dffc9', sub: '検証 / 共有 / 運用' },
                  ],
                },
                {
                  tag: 'カスタム連携',
                  tagColor: '#d3a5ff',
                  tagBg: 'rgba(211,165,255,0.10)',
                  items: [{ l: 'その他カスタム連携', c: '#9b99a0', sub: 'お気軽にご相談ください' }],
                },
              ].map((group) => (
                <div
                  key={group.tag}
                  className="flex flex-wrap items-center justify-center gap-2 md:gap-3"
                >
                  <span
                    className="inline-flex items-center rounded-full px-2 py-1 font-mono text-[9px] uppercase tracking-[0.14em]"
                    style={{
                      background: group.tagBg,
                      color: group.tagColor,
                      boxShadow: `inset 0 0 0 1px ${group.tagColor}30`,
                    }}
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
                        <span
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ background: s.c, boxShadow: `0 0 6px ${s.c}` }}
                        />
                        {s.l}
                        {sub && (
                          <span className="text-[10px] text-[#7e7c83] hidden md:inline">
                            ／ {sub}
                          </span>
                        )}
                      </span>
                    )
                  })}
                </div>
              ))}
            </div>
          </div>

          <div className="text-[#c7c5c9] text-sm">
            <ConsultationCallButton
              className="text-aurora underline-offset-4 hover:underline"
              source="landing_hero_text"
            >
              売上実験インフラを相談する →
            </ConsultationCallButton>
          </div>
        </div>
      </div>
    </Section>
  )
}
