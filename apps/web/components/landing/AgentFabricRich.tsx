'use client'

/**
 * Agent Fabric Rich — 5体エージェントの縦スクロール紹介セクション
 * 各エージェントごとにフルスクリーンの "scene" を持ち、左60% に説明、右40% に
 * tilted glass UI mock を配置。Picker チップで現在の active シーンに同期する。
 */

import { useEffect, useRef, useState } from 'react'
import { ArrowRight } from 'lucide-react'
import { AGENTS, Orb, Section, type AgentKey } from './atoms'

type AgentId = 'sales' | 'marketing' | 'support' | 'helpdesk' | 'pdm'
type MockType = 'deal-detail' | 'automation-flow' | 'ticket-inbox' | 'helpdesk-chat' | 'issue-board'

interface FeatureItem { glyph: string; title: string; body: string }
interface AgentEntry {
  id: AgentId
  name: string
  accent: string
  index: string
  tagline: string
  role: string
  features: FeatureItem[]
  connects: string[]
  docHref: string
  mockType: MockType
}

const AGENTS_DATA: AgentEntry[] = [
  {
    id: 'sales',
    name: 'Sales Agent',
    accent: '#abc7ff',
    index: '01',
    tagline: '商談を、勝つ準備が整っている状態にする。',
    role: '議事録・メール・コールから情報を自動抽出。商談前ブリーフィング、フィールド自動入力、Next Action提案までを担う、営業の右腕。',
    features: [
      { glyph: '🗒', title: '商談前ブリーフィング自動生成', body: '業界トレンド・過去取引・決裁者情報をAIが事前に集約し、商談開始時点でブリーフが手元にある。' },
      { glyph: '📝', title: '議事録から構造化フィールド抽出', body: '予算・課題・キーパーソン・希望サービス・ヒアリング項目を、商談終了直後にCRMへ自動投入。' },
      { glyph: '🎯', title: 'Next Action 3案を提示', body: '商談の文脈から、次に取るべきアクションを根拠付きで3案提示。承認するだけでタスク化される。' },
    ],
    connects: ['CRM', 'Google Meet', 'Gmail', 'Call録音', 'Calendar'],
    docHref: '/agents/sales',
    mockType: 'deal-detail',
  },
  {
    id: 'marketing',
    name: 'Marketing Agent',
    accent: '#ffcf4a',
    index: '02',
    tagline: '追わない営業を、つくる。',
    role: '自社サイト・メール・資料DLなど、1stパーティデータからインテント生成。閾値超えで自動でナーチャリング・シーケンスを起動するマーケの相棒。',
    features: [
      { glyph: '📡', title: '1stパーティ・インテント検知', body: '自社で取得したデータのみで動く。3rdパーティクッキー廃止後の世界でも安定して機能する。' },
      { glyph: '⚡', title: 'シーケンス自動起動', body: 'スコア閾値超えのリードに、適切なナーチャリング・シーケンスを自動選択して起動。担当者の手作業ゼロ。' },
      { glyph: '🧪', title: 'キャンペーン継続最適化', body: '配信タイミング・件名・コンテンツのA/Bを継続的に学習し、勝ちパターンを蓄積。' },
    ],
    connects: ['Web Analytics', 'Email', '資料DL', 'CRM', 'Calendar'],
    docHref: '/agents/marketing',
    mockType: 'automation-flow',
  },
  {
    id: 'support',
    name: 'Customer Agent',
    accent: '#ff8dcf',
    index: '03',
    tagline: '1次回答は、AI。難しいときは、人。',
    role: '顧客からのチケットを自動で1次回答。SLAを管理し、必要に応じて文脈サマリ付きで有人にエスカレーションする、CSの最前線。',
    features: [
      { glyph: '🏷', title: '緊急度・カテゴリ自動振り分け', body: 'チケット受信と同時に、内容から緊急度・カテゴリ・担当者を判定。仕分けの手間が消える。' },
      { glyph: '💬', title: '類似ケース＋ナレッジから1次回答', body: '過去の解決事例とナレッジベースを参照し、信頼度スコア付きで回答案を提示。' },
      { glyph: '🚨', title: 'SLAアラート・有人エスカレーション', body: '解決困難な案件は、これまでの対応履歴・文脈をサマリ化して有人にバトン。' },
    ],
    connects: ['Email', 'チャット', '電話', 'Knowledge Base', 'CRM'],
    docHref: '/agents/support',
    mockType: 'ticket-inbox',
  },
  {
    id: 'helpdesk',
    name: 'Knowledge Agent',
    accent: '#c8b9ff',
    index: '04',
    tagline: 'ベテランの知恵を、新人にも。',
    role: '社内チャットで質問された内容を即答。1度回答した内容は自動でナレッジ化され、2度目以降は即答。事前のFAQ設計が不要な、組織知の自動成長エンジン。',
    features: [
      { glyph: '💡', title: '社内Q&AをRAGで即答', body: '過去の社内文書・ベテラン回答からRAGで瞬時に応答。引用元も提示するので信頼できる。' },
      { glyph: '📚', title: 'ナレッジ自動蓄積（事前設計不要）', body: '良質な回答だと評価されたものは自動でナレッジに昇格。FAQ整備の作業がそのまま消える。' },
      { glyph: '🎚', title: '評価フィードバックで継続チューニング', body: 'チケット結果や👍/👎評価でAI精度が継続改善。組織知が時間とともに濃くなる。' },
    ],
    connects: ['Slack', 'Teams', 'Google Drive', 'Notion', '社内ドキュメント'],
    docHref: '/agents/helpdesk',
    mockType: 'helpdesk-chat',
  },
  {
    id: 'pdm',
    name: 'Product Agent',
    accent: '#8dffc9',
    index: '05',
    tagline: '顧客の声から、次の機能が立ち上がる。',
    role: '商談・サポート議事録から「課題」「要望機能」「ニーズ」を自動抽出。企業数 × 重要度でスコアリングし、開発優先度・ロードマップに直結する、PdMの右腕。',
    features: [
      { glyph: '🔍', title: '議事録から課題・要望を自動抽出', body: 'すべての商談・サポート議事録をスキャンし、「これがあれば」「ここが困る」を構造化。' },
      { glyph: '📊', title: '重複検知＋企業数で集計', body: '表現が違っても同じ要望は統合。何社から、どの規模で要望が来ているかが見える。' },
      { glyph: '🎯', title: '受注影響でスコア化、ロードマップ反映', body: '企業数×重要度×受注影響でスコアリングし、開発優先度ボードに自動反映。' },
    ],
    connects: ['商談議事録', 'サポート議事録', '開発ロードマップ', 'Slack', 'Linear・Jira'],
    docHref: '/agents/pdm',
    mockType: 'issue-board',
  },
]

// ---------- Mock UI Scenes ----------
const SalesMock = ({ accent }: { accent: string }) => (
  <div className="rounded-2xl bg-[#0d0d0f] p-5 fo-glass-rim relative overflow-hidden h-full">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold text-[#0a0a0c]" style={{ background: accent }}>SR</div>
        <div>
          <div className="text-[13px] text-[#e7e5ea] leading-tight">三和リアルテック</div>
          <div className="text-[10px] text-[#7e7c83] mt-0.5">SaaS / 1,840名</div>
        </div>
      </div>
      <div className="flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-mono" style={{ background: `${accent}1f`, color: accent }}>
        <span className="w-1.5 h-1.5 rounded-full" style={{ background: accent, boxShadow: `0 0 6px ${accent}` }} />
        AI ENRICHED
      </div>
    </div>
    <div className="mt-4 space-y-1.5">
      {[
        { l: '予算',         v: '1,200万 / 年' },
        { l: '課題',         v: 'リスト作成に20h/週' },
        { l: 'キーパーソン', v: '常務 / 田中様' },
        { l: '希望サービス', v: 'Growth + 紙DM' },
        { l: 'タイミング',   v: 'Q2 導入希望' },
      ].map((f, i) => (
        <div
          key={i}
          className="rounded-lg px-3 py-2 flex items-center justify-between text-[11px]"
          style={{ background: `${accent}0d`, boxShadow: `inset 0 0 0 1px ${accent}22` }}
        >
          <span className="text-[#9b99a0]">{f.l}</span>
          <span className="flex items-center gap-2">
            <span className="text-[#e7e5ea]">{f.v}</span>
            <span className="px-1.5 py-0.5 rounded text-[9px] font-mono" style={{ background: `${accent}24`, color: accent }}>抽出</span>
          </span>
        </div>
      ))}
    </div>
    <div className="mt-4 rounded-xl p-3" style={{ background: `linear-gradient(135deg, ${accent}10, transparent 60%)`, boxShadow: `inset 0 0 0 1px ${accent}30` }}>
      <div className="text-[10px] uppercase tracking-[0.14em] mb-2" style={{ color: accent }}>NEXT ACTIONS · 3案</div>
      {['常務向け1Pサマリ送付', 'Q2導入想定で見積もり提示', '同業導入事例の共有'].map((t, i) => (
        <div key={i} className="flex items-center justify-between py-1.5 text-[11px]">
          <span className="text-[#c7c5c9]">{i + 1}. {t}</span>
          <button className="px-2 py-0.5 rounded text-[10px] font-semibold text-[#0a0a0c]" style={{ background: accent }}>承認</button>
        </div>
      ))}
    </div>
  </div>
)

const MarketingMock = ({ accent }: { accent: string }) => (
  <div className="rounded-2xl bg-[#0d0d0f] p-5 fo-glass-rim relative overflow-hidden h-full">
    <div className="flex items-center justify-between">
      <div className="text-[10px] font-mono uppercase tracking-[0.14em] text-[#7e7c83]">AUTOMATION FLOW</div>
      <div className="text-[10px] font-mono px-2 py-0.5 rounded-full" style={{ background: `${accent}1f`, color: accent }}>LIVE</div>
    </div>
    <svg viewBox="0 0 360 260" className="w-full h-[210px] mt-3">
      <defs>
        <linearGradient id="aflow" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={accent} stopOpacity="0" />
          <stop offset="50%" stopColor={accent} stopOpacity="0.7" />
          <stop offset="100%" stopColor={accent} stopOpacity="0" />
        </linearGradient>
      </defs>
      <g>
        <circle cx="60" cy="130" r="28" fill={`${accent}22`} stroke={accent} strokeWidth="1.5" className="fo-line-pulse" />
        <text x="60" y="128" textAnchor="middle" fill={accent} fontSize="9" fontFamily="JetBrains Mono">SCORE</text>
        <text x="60" y="140" textAnchor="middle" fill={accent} fontSize="11" fontWeight="700">≥ 70</text>
      </g>
      <g>
        <rect x="148" y="105" width="80" height="50" rx="10" fill={`${accent}33`} stroke={accent} strokeWidth="1.2" />
        <text x="188" y="125" textAnchor="middle" fill="#0a0a0c" fontSize="9" fontWeight="700">TRIGGERED</text>
        <text x="188" y="140" textAnchor="middle" fill="#0a0a0c" fontSize="8">Marketing Agent</text>
      </g>
      {[
        { y: 50, label: 'EMAIL' },
        { y: 130, label: 'DM' },
        { y: 210, label: '営業エスカレ' },
      ].map((b, i) => (
        <g key={i}>
          <path d={`M228,130 C 270,130 270,${b.y} 300,${b.y}`} stroke="url(#aflow)" strokeWidth="1.4" fill="none" />
          <rect x="298" y={b.y - 12} width="58" height="24" rx="6" fill="#1b1b1d" stroke={accent} strokeOpacity="0.3" strokeWidth="1" />
          <text x="327" y={b.y + 3} textAnchor="middle" fill="#c7c5c9" fontSize="9">{b.label}</text>
        </g>
      ))}
      <path d="M88,130 L148,130" stroke={accent} strokeWidth="1.4" fill="none" />
    </svg>
    <div className="mt-2 grid grid-cols-3 gap-2 text-[10px]">
      {['Open率 +12%', 'CTR +8%', 'MQL +24%'].map((t, i) => (
        <div key={i} className="rounded-lg bg-[#1b1b1d] px-2 py-1.5 text-center text-[#9b99a0]" style={{ boxShadow: `inset 0 0 0 1px ${accent}1c` }}>
          {t}
        </div>
      ))}
    </div>
  </div>
)

const SupportMock = ({ accent }: { accent: string }) => {
  const tickets = [
    { co: 'A社', sub: 'ログインできない',     status: 'AI回答中', sla: '2:14', color: accent },
    { co: 'B社', sub: '請求書の宛名修正',     status: 'NEW',      sla: '8:00', color: '#abc7ff' },
    { co: 'C社', sub: 'API レート上限を超過', status: '有人',     sla: '0:42', color: '#ffcf4a' },
    { co: 'D社', sub: 'パスワードリセット',   status: '解決',     sla: '—',    color: '#8dffc9' },
  ]
  return (
    <div className="rounded-2xl bg-[#0d0d0f] p-5 fo-glass-rim relative overflow-hidden h-full">
      <div className="flex items-center justify-between">
        <div className="text-[10px] font-mono uppercase tracking-[0.14em] text-[#7e7c83]">TICKET INBOX</div>
        <div className="text-[10px] font-mono px-2 py-0.5 rounded-full" style={{ background: `${accent}1f`, color: accent }}>4 OPEN</div>
      </div>
      <div className="mt-3 space-y-1.5">
        {tickets.map((t, i) => (
          <div
            key={i}
            className="rounded-lg px-3 py-2 flex items-center justify-between text-[11px] bg-[#1b1b1d]"
            style={{ boxShadow: i === 0 ? `inset 0 0 0 1px ${accent}40` : 'inset 0 0 0 1px rgba(255,255,255,0.04)' }}
          >
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono" style={{ background: `${t.color}24`, color: t.color }}>{t.status}</span>
              <span className="text-[#e7e5ea] truncate">{t.co} ／ {t.sub}</span>
            </div>
            <span className="text-[9px] font-mono text-[#7e7c83] ml-2">SLA {t.sla}</span>
          </div>
        ))}
      </div>
      <div className="mt-3 rounded-xl p-3" style={{ background: `${accent}10`, boxShadow: `inset 0 0 0 1px ${accent}30` }}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] uppercase tracking-[0.14em]" style={{ color: accent }}>SUGGESTED REPLY</span>
          <span className="text-[10px] font-mono" style={{ color: accent }}>conf · 92%</span>
        </div>
        <div className="text-[11px] text-[#c7c5c9] leading-relaxed">
          ご不便をおかけしております。まず以下をお試しください: ① ブラウザキャッシュ削除 ② シークレットモード ③ 2FA再設定...
        </div>
      </div>
    </div>
  )
}

const HelpdeskMock = ({ accent }: { accent: string }) => (
  <div className="rounded-2xl bg-[#0d0d0f] p-5 fo-glass-rim relative overflow-hidden h-full">
    <div className="flex items-center justify-between">
      <div className="text-[10px] font-mono uppercase tracking-[0.14em] text-[#7e7c83]">#help · SLACK</div>
      <div className="text-[10px] font-mono px-2 py-0.5 rounded-full" style={{ background: `${accent}1f`, color: accent }}>RAG</div>
    </div>
    <div className="mt-3 space-y-2.5">
      <div className="flex gap-2 items-start">
        <div className="w-6 h-6 rounded-full bg-[#1b1b1d] flex items-center justify-center text-[9px] text-[#9b99a0]">N</div>
        <div className="flex-1">
          <div className="text-[10px] text-[#7e7c83]">新人 · 田中</div>
          <div className="text-[11px] text-[#e7e5ea] mt-0.5">経費精算の上限額って、出張先で違いましたっけ？</div>
        </div>
      </div>
      <div className="flex gap-2 items-start">
        <div className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold text-[#0a0a0c]" style={{ background: accent }}>H</div>
        <div className="flex-1">
          <div className="text-[10px]" style={{ color: accent }}>Knowledge Agent</div>
          <div className="text-[11px] text-[#e7e5ea] mt-0.5 leading-relaxed">
            国内出張は宿泊8,000円/日、海外は地域A〜Cで上限が異なります。詳細は経費規程をご確認ください。
          </div>
          <div className="flex flex-wrap gap-1 mt-2">
            {['経費規程 v3.2', '海外出張ガイド', '#経理アーカイブ'].map((c, i) => (
              <span key={i} className="text-[9px] px-1.5 py-0.5 rounded" style={{ background: `${accent}1a`, color: accent }}>📎 {c}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
    <div className="mt-3 rounded-lg px-3 py-2 flex items-center justify-between" style={{ background: `${accent}10`, boxShadow: `inset 0 0 0 1px ${accent}30` }}>
      <span className="text-[10px]" style={{ color: accent }}>→ ナレッジに自動保存</span>
      <span className="text-[9px] font-mono text-[#7e7c83]">kb_4582</span>
    </div>
    <div className="mt-2 rounded-lg p-2.5 bg-[#1b1b1d]" style={{ boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.04)' }}>
      <div className="text-[9px] uppercase tracking-[0.14em] text-[#7e7c83]">KNOWLEDGE</div>
      <div className="text-[11px] text-[#e7e5ea] mt-1">出張経費上限・地域別早見表</div>
      <div className="text-[9px] text-[#7e7c83] mt-0.5">参照3件 · 最終更新: 自動 · 2分前</div>
    </div>
  </div>
)

const PDMMock = ({ accent }: { accent: string }) => {
  const issues = [
    { t: 'CSVエクスポート列カスタム', cnt: 7, prio: 92, src: 'm1, m3, m5' },
    { t: 'Slack通知の閾値設定',       cnt: 4, prio: 78, src: 'm2, m4' },
    { t: '監査ログのCSV保存',         cnt: 3, prio: 64, src: 'm6, m9' },
  ]
  return (
    <div className="rounded-2xl bg-[#0d0d0f] p-5 fo-glass-rim relative overflow-hidden h-full">
      <div className="flex items-center justify-between">
        <div className="text-[10px] font-mono uppercase tracking-[0.14em] text-[#7e7c83]">ISSUE BOARD</div>
        <div className="text-[10px] font-mono px-2 py-0.5 rounded-full" style={{ background: `${accent}1f`, color: accent }}>ROADMAP反映済</div>
      </div>
      <div className="mt-3 space-y-2">
        {issues.map((it, i) => (
          <div key={i} className="rounded-xl p-3 bg-[#1b1b1d]" style={{ boxShadow: `inset 0 0 0 1px ${accent}1f` }}>
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-[#e7e5ea]">{it.t}</span>
              <span className="text-[10px] font-mono" style={{ color: accent }}>{it.cnt}社</span>
            </div>
            <div className="mt-2 flex items-center gap-2">
              <div className="flex-1 h-1.5 rounded-full bg-[#0d0d0f] overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${it.prio}%`,
                    background: `linear-gradient(90deg, ${accent}55, ${accent})`,
                    boxShadow: `0 0 6px ${accent}80`,
                  }}
                />
              </div>
              <span className="text-[9px] font-mono text-[#9b99a0]">P{it.prio}</span>
            </div>
            <div className="mt-1.5 text-[9px] font-mono text-[#7e7c83]">from: {it.src}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

const MockByType = ({ type, accent }: { type: MockType; accent: string }) => {
  switch (type) {
    case 'deal-detail':     return <SalesMock accent={accent} />
    case 'automation-flow': return <MarketingMock accent={accent} />
    case 'ticket-inbox':    return <SupportMock accent={accent} />
    case 'helpdesk-chat':   return <HelpdeskMock accent={accent} />
    case 'issue-board':     return <PDMMock accent={accent} />
  }
}

// ---------- Single agent scene ----------
const AgentScene = ({ agent, isActive }: { agent: AgentEntry; isActive: boolean }) => {
  const sceneRef = useRef<HTMLElement | null>(null)
  const [revealed, setRevealed] = useState(false)
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') {
      const t = setTimeout(() => setRevealed(true), 50)
      return () => clearTimeout(t)
    }
    let done = false
    const reveal = () => {
      if (!done) {
        done = true
        setRevealed(true)
      }
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            reveal()
            io.disconnect()
          }
        })
      },
      { threshold: 0.05, rootMargin: '0px 0px -10% 0px' }
    )
    if (sceneRef.current) io.observe(sceneRef.current)
    const t = setTimeout(reveal, 400)
    return () => {
      io.disconnect()
      clearTimeout(t)
    }
  }, [])

  const a = agent
  return (
    <section
      id={`agent-${a.id}`}
      ref={sceneRef}
      data-screen-label={`07.${a.index} ${a.name}`}
      className="relative min-h-[80vh] flex items-center py-24 md:py-32"
    >
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute top-1/4 -left-40 w-[60vw] h-[60vw] rounded-full transition-opacity duration-1000"
          style={{
            background: `radial-gradient(circle, ${a.accent}22 0%, transparent 60%)`,
            filter: 'blur(80px)',
            opacity: isActive ? 1 : 0.45,
          }}
        />
      </div>

      <div className="relative mx-auto max-w-6xl px-6 w-full">
        <div className="grid md:grid-cols-12 gap-10 items-center">
          {/* LEFT 60% */}
          <div className="md:col-span-7">
            <div
              className="inline-flex items-center gap-2 font-semibold uppercase tracking-[0.14em] text-[0.72rem] px-2.5 py-1 rounded-full"
              style={{ background: `${a.accent}14`, color: a.accent, boxShadow: `inset 0 0 0 1px ${a.accent}30` }}
            >
              <span className="block w-1.5 h-1.5 rounded-full" style={{ background: a.accent, boxShadow: `0 0 8px ${a.accent}` }} />
              AGENT FABRIC ／ {a.index} / 05 ／ {a.name}
            </div>

            <div className="mt-8 mb-7 relative" style={{ width: 120, height: 120 }}>
              <div
                className="absolute inset-0 rounded-full fo-orb-drift"
                style={{
                  background: `radial-gradient(circle at 30% 30%, #ffffff 0%, ${a.accent} 40%, ${a.accent}80 75%)`,
                  boxShadow: `0 0 30px ${a.accent}cc, 0 0 80px ${a.accent}66, inset 0 0 30px ${a.accent}aa`,
                  animationDuration: isActive ? '3s' : '7s',
                }}
              />
              <div className="absolute inset-0 rounded-full overflow-hidden" style={{ opacity: isActive ? 1 : 0.5, transition: 'opacity 600ms' }}>
                <div
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: `conic-gradient(from 0deg, transparent 0%, ${a.accent}40 25%, transparent 50%)`,
                    animation: isActive ? 'fo-spin-sheen 6s linear infinite' : 'none',
                    mixBlendMode: 'screen',
                  }}
                />
              </div>
            </div>

            <h3 className="font-display font-bold tracking-[-0.025em] text-[2.2rem] md:text-[3.2rem] leading-[1.05]">{a.tagline}</h3>
            <p className="mt-5 text-[#c7c5c9] text-[1.05rem] leading-relaxed max-w-2xl">{a.role}</p>

            <div className="mt-9">
              <div className="font-semibold uppercase tracking-[0.14em] text-[0.72rem] text-[#7e7c83] mb-4">
                特徴 ／ DISTINGUISHING FEATURES
              </div>
              <div className="space-y-3">
                {a.features.map((f, i) => (
                  <div
                    key={i}
                    className="rounded-2xl p-4 fo-lift fo-glass-rim flex gap-4 items-start"
                    style={{ background: `linear-gradient(135deg, ${a.accent}0c, transparent 60%), #1b1b1d` }}
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-[18px] flex-shrink-0"
                      style={{ background: `${a.accent}1a`, boxShadow: `inset 0 0 0 1px ${a.accent}30` }}
                    >
                      {f.glyph}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[0.95rem] text-[#e7e5ea] font-medium leading-snug">{f.title}</div>
                      <div className="text-[0.85rem] text-[#9b99a0] mt-1 leading-relaxed">{f.body}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <a
              href={a.docHref}
              className="inline-flex items-center gap-2 mt-9 text-[0.95rem] hover:translate-x-0.5 transition-transform"
              style={{ color: a.accent }}
            >
              詳しく見る
              <ArrowRight size={16} color={a.accent} />
            </a>
          </div>

          {/* RIGHT 40% */}
          <div className="md:col-span-5">
            <div
              className="transition-all duration-700"
              style={{
                transform: revealed
                  ? 'perspective(1400px) rotateX(6deg) rotateY(-5deg) translateZ(0)'
                  : 'perspective(1400px) rotateX(6deg) rotateY(-5deg) translateZ(-200px)',
                opacity: revealed ? 1 : 0,
              }}
            >
              <div
                className="relative rounded-3xl p-[1px]"
                style={{ background: `linear-gradient(135deg, ${a.accent}55, ${a.accent}10 50%, transparent 100%)` }}
              >
                <div
                  className="rounded-3xl bg-pitch p-2 fo-glass-rim"
                  style={{ boxShadow: `0 30px 80px -10px ${a.accent}26, inset 0 0 0 1px ${a.accent}1a` }}
                >
                  <MockByType type={a.mockType} accent={a.accent} />
                </div>
              </div>
            </div>
            <div className="mt-5 flex flex-wrap items-center gap-1.5">
              <span className="text-[10px] uppercase tracking-[0.14em] text-[#7e7c83] mr-1">CONNECTS WITH</span>
              {a.connects.map((t, i) => (
                <span
                  key={i}
                  className="text-[10px] font-mono px-2 py-0.5 rounded-full"
                  style={{ background: `${a.accent}10`, color: a.accent, boxShadow: `inset 0 0 0 1px ${a.accent}24` }}
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ---------- Picker chips ----------
// ---------- Hero orb cluster (5 オーブ + データストリーム) ----------
// AgenticEra から移植。ヘッダ直下に「5 体が連携している」イメージを概観表示する。
const AgentOrbCluster = () => {
  // 各オーブの中央に頭文字を重ねる
  // 並び: Sales → Marketing → Support(C) → PDM → Knowledge(K=ナレッジ)
  // Support は「カスタマーサポート」の C、Knowledge は ナレッジ の K を採用
  const agents: { agent: AgentKey; x: string; initial: string }[] = [
    { agent: 'sales',     x: '14%', initial: 'S' },
    { agent: 'marketing', x: '32%', initial: 'M' },
    { agent: 'support',   x: '50%', initial: 'C' },
    { agent: 'pdm',       x: '68%', initial: 'P' },
    { agent: 'helpdesk',  x: '86%', initial: 'K' },
  ]
  return (
    <div className="relative mt-0 mx-auto max-w-4xl h-[140px] md:h-[160px]">
      <svg viewBox="0 0 1000 320" className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
        <defs>
          <linearGradient id="agentClusterStream" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%"   stopColor="#abc7ff" stopOpacity="0" />
            <stop offset="50%"  stopColor="#abc7ff" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#0071e3" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path
          d="M140,160 C 280,40 380,260 500,160 S 720,40 860,160"
          stroke="url(#agentClusterStream)" strokeWidth="1.4" fill="none" className="fo-line-pulse"
        />
        <path
          d="M140,160 C 300,260 400,80 500,160 S 740,240 860,160"
          stroke="url(#agentClusterStream)" strokeWidth="1.0" fill="none" className="fo-line-pulse"
          style={{ animationDelay: '-2s' }}
        />
      </svg>
      {agents.map((o, i) => (
        <div key={o.agent} className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2" style={{ left: o.x }}>
          <div className="fo-orb-drift relative" style={{ animationDelay: `-${i * 1.2}s` }}>
            <Orb color={AGENTS[o.agent].color} size={48} glow={1.4} />
            {/* 頭文字をオーブ中央に重ねる */}
            <span
              className="absolute inset-0 flex items-center justify-center font-display font-bold text-[14px] tracking-[-0.02em] pointer-events-none"
              style={{
                color: '#0a0a0c',
                textShadow: `0 0 8px ${AGENTS[o.agent].color}`,
              }}
            >
              {o.initial}
            </span>
          </div>
          <div
            className="text-[11px] mt-3 text-center uppercase tracking-[0.14em]"
            style={{ color: AGENTS[o.agent].color }}
          >
            {AGENTS[o.agent].name.replace(' Agent', '')}
          </div>
        </div>
      ))}
    </div>
  )
}


// ---------- Main ----------
export const AgentFabricRich = () => {
  const [activeId, setActiveId] = useState<AgentId>('sales')
  const showAgentDetails = false

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting && e.intersectionRatio > 0.3) {
            const id = e.target.id.replace('agent-', '') as AgentId
            setActiveId(id)
          }
        })
      },
      { threshold: [0.3, 0.6], rootMargin: '-30% 0px -30% 0px' }
    )
    AGENTS_DATA.forEach((a) => {
      const el = document.getElementById(`agent-${a.id}`)
      if (el) io.observe(el)
    })
    return () => io.disconnect()
  }, [])

  return (
    <Section tone="pitch" screenLabel="07 Agent Fabric">
      <div className="relative mx-auto max-w-6xl px-6 pt-0 pb-12 md:pt-0 md:pb-16 text-center">
        {/* 5 オーブ + データストリームのみ表示 (heading / subtitle / picker は撤去) */}
        <AgentOrbCluster />
      </div>

      {showAgentDetails && AGENTS_DATA.map((a) => (
        <AgentScene key={a.id} agent={a} isActive={activeId === a.id} />
      ))}

    </Section>
  )
}
