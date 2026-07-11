'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Bot,
  Globe2,
  Headphones,
  LayoutDashboard,
  Network,
  Radio,
  Sparkles,
  type LucideIcon,
} from 'lucide-react'
import { Eyebrow, Section } from '../atoms'

export type FeaturedAINews = {
  slug: string
  genre: string
  title: string
  description: string
  newsPublishedAt: string
  sourceName: string
  accent: string
  image: string
}

const formatNewsDate = (date: string) => `${date.replaceAll('-', '.')} 公開`

type PortfolioShellProps = {
  index: string
  eyebrow: string
  title: string
  body: string
  accent: string
  icon: LucideIcon
  tools: string[]
  children: React.ReactNode
}

const crmWorkspaces = [
  {
    initial: 'C',
    label: '企業',
    color: '#abc7ff',
    recent: ['株式会社A 提案準備', '株式会社B 資料DL', '株式会社C 返信待ち'],
    question: '今週フォローすべき企業と、次アクションを整理して',
    answer:
      '優先度が高いのは、資料DL後に未架電の2社です。既存CRMの接点履歴と議事録から、次は「課題確認」と「日程調整」を同時に進めるのが自然です。',
    inputPlaceholder: '企業名、業界、接点履歴から次アクションを聞く',
    prompts: ['今週フォローすべき企業は？', '資料DL後の優先度は？', '未対応企業を整理して'],
    cards: [
      ['A社', '資料DL後 未架電', '#abc7ff'],
      ['B社', '商談後 要返信', '#8dffc9'],
      ['C社', '見積条件 確認', '#ffcf4a'],
    ],
  },
  {
    initial: 'D',
    label: '取引',
    color: '#abc7ff',
    recent: ['SaaS導入案件', 'AI FAQ構築', '既存CRM移行'],
    question: '止まっている取引と、失注リスクを確認して',
    answer:
      '14日以上動きがない取引が2件あります。決裁者確認が未完了のため、導入目的と稟議条件を確認する短いメールを送るのが優先です。',
    inputPlaceholder: '取引状況、停滞理由、次の打ち手を聞く',
    prompts: ['失注しそうな取引は？', '止まっている案件は？', '次に送るメールは？'],
    cards: [
      ['D社', '14日停滞', '#ffcf4a'],
      ['E社', '決裁者未確認', '#abc7ff'],
      ['F社', '返信待ち', '#8dffc9'],
    ],
  },
  {
    initial: 'M',
    label: '商談',
    color: '#8dffc9',
    recent: ['明日10時 商談', '導入相談メモ', '議事録 要約'],
    question: '次の商談前に確認すべき情報をまとめて',
    answer:
      '直近の議事録では、先方は「社内ナレッジの整理」と「問い合わせ後の初動」に課題があります。CRM上では、Call AIとObsidian連携を中心に提案すると流れが作れます。',
    inputPlaceholder: '商談前に確認すべき論点を聞く',
    prompts: ['商談前に何を見る？', '先方の課題を要約して', '提案の切り口は？'],
    cards: [
      ['課題', '初動対応', '#abc7ff'],
      ['関心', 'ナレッジAI', '#d3a5ff'],
      ['提案', 'Call AI連携', '#8dffc9'],
    ],
  },
  {
    initial: 'T',
    label: 'タスク',
    color: '#ffcf4a',
    recent: ['日程調整', '見積条件確認', '議事録反映'],
    question: '今日中に処理すべきタスクを優先度順に並べて',
    answer:
      '優先すべきタスクは、商談後の議事録反映、見積条件の確認、日程調整の3つです。売上に近い順に処理すると、見込み顧客の温度感を落とさず進められます。',
    inputPlaceholder: '今日のタスク、期限、担当者を聞く',
    prompts: ['今日やるべきことは？', '期限が近いタスクは？', '担当者ごとに整理して'],
    cards: [
      ['議事録', '商談後 反映待ち', '#8dffc9'],
      ['見積', '条件確認', '#ffcf4a'],
      ['日程', '候補送付', '#abc7ff'],
    ],
  },
  {
    initial: 'K',
    label: 'ナレッジ',
    color: '#d3a5ff',
    recent: ['料金FAQ', '導入手順', 'Obsidian連携'],
    question: '顧客から料金を聞かれた時の回答候補を出して',
    answer:
      '料金は構築範囲と既存ツールの状態によって変わるため、まずは現状のCRM、Notion、Google Workspace、Zoomの利用状況を確認し、必要な構成だけを見積もる流れが自然です。',
    inputPlaceholder: 'FAQ、提案資料、社内メモから回答を探す',
    prompts: ['料金回答を出して', '導入手順を教えて', '関連資料はどこ？'],
    cards: [
      ['FAQ', '料金プラン', '#d3a5ff'],
      ['資料', '導入ロードマップ', '#abc7ff'],
      ['メモ', '既存SaaS整理', '#8dffc9'],
    ],
  },
  {
    initial: 'A',
    label: 'AIアシスト',
    color: '#7ec6ff',
    recent: ['次アクション生成', 'メール文面', '商談要約'],
    question: 'この商談の次アクションとメール文面を作って',
    answer:
      '次アクションは、課題確認、既存ツールの棚卸し、15分相談の日程確定です。メールでは「現状のツールを活かして小さく始める」方針を短く伝えると返信につながりやすいです。',
    inputPlaceholder: 'メール文面、次アクション、要約を依頼する',
    prompts: ['メール文面を作って', '次アクションは？', '商談を要約して'],
    cards: [
      ['メール', '返信文案', '#7ec6ff'],
      ['Action', '15分相談', '#8dffc9'],
      ['要約', '課題整理', '#d3a5ff'],
    ],
  },
] as const

const PortfolioShell = ({
  index,
  eyebrow,
  title,
  body,
  accent,
  icon: Icon,
  tools,
  children,
}: PortfolioShellProps) => (
  <article className="overflow-hidden rounded-[30px] bg-pitch p-[1px] fo-glass-rim">
    <div className="relative overflow-hidden rounded-[29px] bg-[#0b0d13]">
      <div
        className="absolute right-8 top-8 h-52 w-52 rounded-full opacity-70 blur-3xl"
        style={{ background: `radial-gradient(circle, ${accent}24, transparent 64%)` }}
      />
      <div className="relative grid gap-6 p-5 md:p-6 xl:grid-cols-[0.52fr_1fr]">
        <div className="flex min-w-0 flex-col justify-between gap-6">
          <div className="flex items-start gap-4">
            <div
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl"
              style={{ background: `${accent}16`, boxShadow: `inset 0 0 0 1px ${accent}44` }}
            >
              <Icon size={21} color={accent} />
            </div>
            <div className="min-w-0">
              <div
                className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em]"
                style={{ color: accent }}
              >
                <span className="font-mono">{index}</span>
                <span>{eyebrow}</span>
              </div>
              <h3 className="mt-2 font-display text-[1.45rem] font-bold leading-tight tracking-[-0.01em] text-[#e7e5ea] md:text-[1.75rem]">
                {title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-[#9b99a0]">{body}</p>
            </div>
          </div>

          <div className="grid gap-2 text-[12px] text-[#c7c5c9] sm:grid-cols-2 xl:grid-cols-1">
            {tools.map((label, stepIndex) => (
              <div
                key={label}
                className="flex items-center gap-3 rounded-2xl bg-black/30 px-3 py-2 fo-glass-rim"
              >
                <span className="font-mono text-[10px]" style={{ color: accent }}>
                  {String(stepIndex + 1).padStart(2, '0')}
                </span>
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="min-w-0">{children}</div>
      </div>
    </div>
  </article>
)

const CrmVisual = () => {
  const [activeWorkspaceIndex, setActiveWorkspaceIndex] = useState(0)
  const active = crmWorkspaces[activeWorkspaceIndex] ?? crmWorkspaces[0]!

  const selectWorkspace = (index: number) => {
    setActiveWorkspaceIndex(index)
  }

  return (
    <div className="relative overflow-hidden rounded-3xl bg-[#05070d] p-4 shadow-2xl shadow-black/50 fo-glass-rim">
      <div
        className="absolute inset-0 opacity-90"
        style={{
          background:
            'radial-gradient(circle at 52% 44%, rgba(171,199,255,0.22), transparent 34%), radial-gradient(circle at 20% 18%, rgba(141,255,201,0.12), transparent 27%), radial-gradient(circle at 82% 70%, rgba(200,185,255,0.12), transparent 32%)',
        }}
      />
      <div className="relative flex h-[450px] min-h-[450px] overflow-hidden rounded-[24px] border border-[rgba(171,199,255,0.12)] bg-[#080b12]/90">
        <aside className="hidden h-full w-[168px] shrink-0 border-r border-white/[0.06] bg-[#090a0d]/92 p-3 md:flex md:flex-col">
          <div className="mb-3 flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br from-[#abc7ff] to-[#0071e3]">
              <span className="text-[10px] font-bold text-[#080a10]">R</span>
            </div>
            <div className="text-[12px] font-semibold text-[#e7e5ea]">FDE AI/DX</div>
          </div>

          <nav className="space-y-1">
            {crmWorkspaces.map((workspace, index) => {
              const isActive = activeWorkspaceIndex === index
              return (
                <button
                  key={workspace.label}
                  type="button"
                  onClick={() => selectWorkspace(index)}
                  className="flex h-8 w-full items-center gap-2 rounded-lg px-2 text-left text-[11.5px] transition"
                  style={{
                    background: isActive ? `${workspace.color}1f` : 'transparent',
                    color: isActive ? workspace.color : '#9b99a0',
                  }}
                >
                  <span
                    className="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[4px] text-[9px] font-bold"
                    style={{
                      background: `${workspace.color}16`,
                      color: workspace.color,
                      boxShadow: `inset 0 0 0 1px ${workspace.color}35`,
                    }}
                  >
                    {workspace.initial}
                  </span>
                  <span>{workspace.label}</span>
                </button>
              )
            })}
          </nav>

          <div className="my-3 h-px bg-white/[0.06]" />
          <div className="flex h-8 items-center truncate rounded-lg bg-white/[0.045] px-2.5 text-[11px] text-[#c7c5c9]">
            <span className="truncate">+ 新しい{active.label}メモ</span>
          </div>
          <div className="mt-3 text-[9px] uppercase tracking-[0.16em] text-[#5d5a5f]">Recent</div>
          <div className="mt-2 h-[58px] space-y-2 overflow-hidden text-[10.5px] leading-snug text-[#7e7c83]">
            {active.recent.map((item) => (
              <div key={item} className="truncate">
                {item}
              </div>
            ))}
          </div>
        </aside>

        <div className="relative flex min-w-0 flex-1 flex-col p-4">
          <div
            className="absolute inset-0 opacity-45"
            style={{
              background:
                'radial-gradient(circle at 28% 18%, rgba(171,199,255,0.16), transparent 28%), radial-gradient(circle at 76% 74%, rgba(141,255,201,0.11), transparent 32%)',
            }}
          />
          <div className="relative mb-3 flex h-[44px] shrink-0 items-center justify-between rounded-2xl bg-white/[0.035] px-4">
            <div className="flex items-center gap-2 text-[12px] text-[#c7c5c9]">
              <LayoutDashboard size={15} color={active.color} />
              Revenue CRM
              <span className="hidden text-[#6f6c75] sm:inline">/ {active.label} workspace</span>
            </div>
            <span className="rounded-full bg-[#8dffc9]/10 px-3 py-1 text-[10px] font-semibold text-[#8dffc9]">
              LIVE OPS
            </span>
          </div>

          <div className="relative flex min-h-0 flex-1 flex-col gap-3 rounded-3xl bg-[#11151d]/78 p-3 fo-glass-rim">
            <div className="min-h-0 flex-1 space-y-3 overflow-hidden">
              <div className="flex h-[48px] justify-end">
                <div className="flex max-h-[48px] max-w-[76%] items-center overflow-hidden rounded-2xl rounded-tr-md bg-[#253044] px-4 py-2 text-[12px] leading-relaxed text-[#e7e5ea]">
                  {active.question}
                </div>
              </div>

              <div className="flex min-h-0 flex-1 gap-3">
                <div
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-bold shadow-[0_0_22px_rgba(171,199,255,0.24)]"
                  style={{ background: `${active.color}18`, color: active.color }}
                >
                  AI
                </div>
                <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-3xl rounded-tl-md bg-[#181d28] p-4 shadow-[0_16px_42px_rgba(0,0,0,0.28)] fo-glass-rim">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-[#8dffc9]/10 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.14em] text-[#8dffc9]">
                      CRM Answer
                    </span>
                    <span className="text-[10px] text-[#7e7c83]">
                      {active.label}・タスク・ナレッジを横断
                    </span>
                  </div>
                  <p className="h-[58px] overflow-hidden text-[13px] leading-relaxed text-[#e7e5ea]">
                    {active.answer}
                  </p>

                  <div className="mt-auto grid gap-2 pt-3 md:grid-cols-3">
                    {active.cards.map(([title, status, color]) => (
                      <div key={title} className="h-[54px] overflow-hidden rounded-2xl bg-black/25 px-3 py-2.5">
                        <div className="truncate text-[12px] font-bold text-[#f2f0f5]">{title}</div>
                        <div className="mt-1 truncate text-[10px]" style={{ color }}>
                          {status}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex h-[50px] shrink-0 items-center gap-2 rounded-2xl bg-black/55 px-3 fo-glass-rim">
              <Sparkles size={14} color={active.color} />
              <input
                aria-label="CRMチャット入力"
                className="min-w-0 flex-1 bg-transparent text-[12px] text-[#e7e5ea] outline-none placeholder:text-[#6f6c75]"
                placeholder={active.inputPlaceholder}
              />
              <button
                type="button"
                className="rounded-xl px-3 py-2 text-[11px] font-semibold text-white"
                style={{ background: `linear-gradient(135deg, ${active.color}, #2687ff)` }}
              >
                送信
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const KnowledgeVisual = () => (
  <div className="rounded-3xl bg-[#080a10] p-4 shadow-2xl shadow-black/50 fo-glass-rim">
    <img
      src="/media/fde-ai-dx/obsidian-knowledge-infra.png"
      alt="Obsidian風の社内ナレッジ基盤イメージ"
      className="aspect-video w-full rounded-2xl object-cover object-center"
      loading="lazy"
    />
    <div className="mt-3 flex items-center gap-2 text-[11px] text-[#7e7c83]">
      <Network size={13} color="#d3a5ff" />
      議事録、FAQ、提案資料、顧客メモをつなぎ、AIが参照できる知識構造へ。
    </div>
  </div>
)

const CallAiVisual = () => (
  <div className="flex h-full min-h-[360px] flex-col justify-center rounded-3xl bg-[#070910] p-3 shadow-2xl shadow-black/50 fo-glass-rim">
    <div className="overflow-hidden rounded-[24px] bg-black shadow-inner shadow-black/40 fo-glass-rim">
      <video
        controls
        playsInline
        preload="metadata"
        poster="/media/fde-ai-dx/call-ai-demo-poster-v2.svg"
        className="aspect-video w-full bg-black object-cover object-center"
        aria-label="Call AIが電話でアポイント日程を調整する音声デモ"
      >
        <source src="/media/fde-ai-dx/call-ai-appointment-demo-v2.mp4" type="video/mp4" />
        お使いのブラウザでは動画を再生できません。
      </video>
    </div>
    <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_auto]">
      <div className="flex min-w-0 items-center gap-2 rounded-2xl bg-black/42 px-4 py-3 fo-glass-rim">
        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-xl bg-[#8dffc9]/10 text-[#8dffc9]">
          <Sparkles size={13} />
        </span>
        <div className="min-w-0">
          <div className="truncate text-[11px] font-semibold tracking-[0.12em] text-[#e7e5ea]">
            CALL AI AUDIO DEMO
          </div>
          <div className="mt-0.5 truncate text-[10px] text-[#7e7c83]">
            AI受付と顧客のやり取りを、音声付きで確認できます。
          </div>
        </div>
      </div>
      <div className="flex items-center justify-center rounded-2xl bg-black/42 px-4 py-3 text-[10px] font-semibold text-[#8dffc9] fo-glass-rim">
        音声あり・約27秒
      </div>
    </div>
  </div>
)

const RealtimeAssistVisual = () => (
  <div className="relative overflow-hidden rounded-3xl bg-[#080a10] p-3 shadow-2xl shadow-black/50 fo-glass-rim">
    <video
      controls
      playsInline
      preload="metadata"
      poster="/media/fde-ai-dx/realtime-sales-assist-poster.svg"
      className="aspect-video w-full rounded-2xl bg-[#05070d] object-cover fo-glass-rim"
      aria-label="リアルタイム商談アシストの動作イメージ動画"
    >
      <source src="/media/fde-ai-dx/realtime-sales-assist-demo.mp4" type="video/mp4" />
      お使いのブラウザでは動画を再生できません。
    </video>
    <div className="mt-3 flex items-center gap-2 text-[11px] text-[#7e7c83]">
      <Radio size={13} color="#8dffc9" />
      商談中の文字起こしから、Obsidianのナレッジ参照が自動で走る流れを確認できます。
    </div>
  </div>
)

const MediaVisual = ({ articles }: { articles: FeaturedAINews[] }) => (
  <div className="rounded-3xl bg-[#080a10] p-4 shadow-2xl shadow-black/50 fo-glass-rim">
    <div className="mb-4 flex items-center justify-between rounded-2xl bg-white/[0.035] px-4 py-3">
      <div className="flex items-center gap-2 text-[12px] text-[#c7c5c9]">
        <Globe2 size={15} color="#ffcf4a" />
        身近なAIニュース
      </div>
      <span className="rounded-full bg-[#ffcf4a]/10 px-3 py-1 text-[10px] font-semibold text-[#ffcf4a]">
        Daily AI
      </span>
    </div>

    <div className="grid gap-3 lg:grid-cols-2">
      {articles.map((article, index) => (
        <Link
          key={article.title}
          href={`/columns/${article.slug}`}
          className="group overflow-hidden rounded-2xl bg-[#11151d] fo-glass-rim"
        >
          <div className="relative aspect-video overflow-hidden bg-[#06080d]">
            <img
              src={article.image}
              alt={`${article.genre}の身近なAIニュース記事サムネイル`}
              className="h-full w-full object-cover object-center opacity-100 transition duration-500 group-hover:scale-[1.025]"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0b0d13]/42 via-transparent to-transparent" />
            <div
              className="absolute inset-0 opacity-45"
              style={{
                background:
                  index === 0
                    ? 'radial-gradient(circle at 76% 34%, rgba(171,199,255,0.10), transparent 30%)'
                    : 'radial-gradient(circle at 76% 34%, rgba(141,255,201,0.10), transparent 32%)',
              }}
            />
            <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10 blur-2xl transition group-hover:scale-125" />
          </div>
          <div className="p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <span
                className="rounded-full px-2.5 py-1 text-[10px] font-semibold"
                style={{ background: `${article.accent}18`, color: article.accent }}
              >
                {article.genre}
              </span>
              <span className="text-right font-mono text-[10px] text-[#7e7c83]">
                {formatNewsDate(article.newsPublishedAt)}
              </span>
            </div>
            <h4 className="text-[14px] font-bold leading-relaxed text-[#f2f0f5]">
              {article.title}
            </h4>
            <p className="mt-3 text-[11.5px] leading-relaxed text-[#9b99a0]">{article.description}</p>
            <p className="mt-3 text-[10px] font-semibold text-[#c7c5c9]">
              参照元: {article.sourceName}
            </p>
            <div className="mt-4 flex items-center justify-between border-t border-white/[0.06] pt-3">
              <span className="text-[10px] text-[#7e7c83]">今日から使えるポイントを見る</span>
              <span className="text-[10px] font-semibold" style={{ color: article.accent }}>
                コラムを読む
              </span>
            </div>
          </div>
        </Link>
      ))}
    </div>

    <Link
      href="/columns"
      className="mt-3 flex items-center justify-between rounded-2xl border border-white/[0.08] bg-white/[0.035] px-4 py-3 text-[11px] font-semibold text-[#d7d4dd] transition hover:border-[#ffcf4a]/30 hover:text-white"
    >
      <span>ジャンル別のAIコラム一覧を見る</span>
      <span className="text-[#ffcf4a]">一覧へ</span>
    </Link>
  </div>
)

export const PortfolioDemos = ({ featuredAINews }: { featuredAINews: FeaturedAINews[] }) => (
  <Section tone="pitch" screenLabel="02 Portfolio Demos" className="overflow-hidden">
    <div className="relative mx-auto max-w-6xl px-6 py-24 md:py-32">
      <div
        className="absolute left-1/2 top-10 h-72 w-[60vw] -translate-x-1/2 rounded-full opacity-70 blur-3xl"
        style={{ background: 'radial-gradient(circle, rgba(171,199,255,0.13), transparent 64%)' }}
      />

      <div className="relative mb-12 max-w-3xl">
        <Eyebrow color="#abc7ff">AI/DX Portfolio Demo</Eyebrow>
        <h2 className="mt-4 font-display text-[2rem] font-bold leading-[1.08] tracking-[-0.025em] text-[#e7e5ea] md:text-[2.55rem] lg:text-[3rem]">
          5つのAI/DXサービスを、
          <br />
          <span className="fo-gradient-text">ポートフォリオとして。</span>
        </h2>
        <p className="mt-5 max-w-xl text-sm leading-relaxed text-[#9b99a0]">
          CRM、社内ナレッジ、Call
          AI、リアルタイム商談アシスト、AIオウンドメディア。売上に関わるインフラを、1つのAI/DX基盤として接続していきます。
        </p>
      </div>

      <div className="relative space-y-6">
        <PortfolioShell
          index="01"
          eyebrow="Revenue CRM"
          title="顧客・商談・タスクを、AIで管理。"
          body="接点履歴をCRMに集約し、次アクションまで自動で整理します。"
          accent="#abc7ff"
          icon={LayoutDashboard}
          tools={['HubSpot', 'Salesforce', 'Google Sheets', 'FDE CRM']}
        >
          <CrmVisual />
        </PortfolioShell>

        <PortfolioShell
          index="02"
          eyebrow="Obsidian Knowledge"
          title="社内ナレッジを、AIが使える形で蓄積"
          body="議事録・FAQ・提案資料をつなぎ、AIが参照できる知識基盤へ。"
          accent="#d3a5ff"
          icon={Network}
          tools={['Notion', 'Obsidian', 'Slack', 'Google Drive']}
        >
          <KnowledgeVisual />
        </PortfolioShell>

        <PortfolioShell
          index="03"
          eyebrow="Call AI"
          title="電話で確認し、アポイント獲得・日程調整まで。"
          body="問い合わせ後の確認から日程確定まで、AIが自然な会話で進めます。"
          accent="#8dffc9"
          icon={Headphones}
          tools={['BDR', 'SDR', '資料請求', '問い合わせ']}
        >
          <CallAiVisual />
        </PortfolioShell>

        <PortfolioShell
          index="04"
          eyebrow="Realtime Sales Assist"
          title="商談中の質問に、Obsidianから即回答。"
          body="商談の文字起こしから、社内ナレッジを参照して回答候補を表示します。"
          accent="#7ec6ff"
          icon={Bot}
          tools={['Zoom', 'Google Meet', 'Microsoft Teams', 'Obsidian']}
        >
          <RealtimeAssistVisual />
        </PortfolioShell>

        <PortfolioShell
          index="05"
          eyebrow="AI Owned Media"
          title="AIでSEO対策・AIO対策を自動化。"
          body="AI活用ニュースを実務コラム化し、検索・AI回答経由の相談導線を作ります。"
          accent="#ffcf4a"
          icon={Globe2}
          tools={['microCMS', 'SE Ranking', 'キーワードプランナー', 'Google Search Console']}
        >
          <MediaVisual articles={featuredAINews} />
        </PortfolioShell>
      </div>
    </div>
  </Section>
)
