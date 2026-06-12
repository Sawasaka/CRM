'use client'

import Image from 'next/image'
import type { LucideIcon } from 'lucide-react'
import {
  ArrowRight,
  Bot,
  Braces,
  Code2,
  FileText,
  MessageSquareText,
  PenTool,
  ScanLine,
  Sparkles,
  WandSparkles,
  Zap,
} from 'lucide-react'

type AIWeaponCard = {
  category: 'Claude領域' | 'Codex領域'
  label: string
  title: string
  subtitle: string
  icon: LucideIcon
  image: string
  accent: string
  softAccent: string
  whatHappened: string
  businessEffect: string
  dragonReview: string
  useCases: string[]
}

const aiWeaponCards: AIWeaponCard[] = [
  {
    category: 'Claude領域',
    label: 'THINKING',
    title: '会議メモを提案書に変える竜の羽ペン',
    subtitle: '散らかった会議ログを、次の提案に使える骨子へ変える。',
    icon: PenTool,
    image: '/media/psychology/weapon-trust.png',
    accent: '#8b7cff',
    softAccent: '#17152a',
    whatHappened: '長文の議事録・顧客メモ・社内コメントを、提案書の流れに再構成する使い方が法人現場で定着し始めている。',
    businessEffect: '営業、CS、PdMが同じ顧客理解を持ちやすくなり、提案書・引き継ぎ・優先度整理の速度が上がる。',
    dragonReview: '情報をきれいにするだけではない。顧客の温度まで残せる者が使うと、提案の火力が上がる。',
    useCases: ['商談メモから提案書の章立てを作る', '顧客要望を論点・リスク・次アクションに分ける', '社内共有用の短い要約に変換する'],
  },
  {
    category: 'Codex領域',
    label: 'AUTOMATION',
    title: '面倒な社内作業を小さなアプリにする自動化の火爪',
    subtitle: '手作業で回していた確認・集計・整形を、小さな業務ツールに変える。',
    icon: Code2,
    image: '/media/psychology/weapon-motivation.png',
    accent: '#38bdf8',
    softAccent: '#082033',
    whatHappened: 'コード生成AIを、エンジニアだけでなく業務担当者の小さな自動化やプロトタイプ作成に使う流れが強まっている。',
    businessEffect: 'Excel転記、レポート整形、確認画面、簡易ダッシュボードのような日常業務を、待ち時間の少ない改善対象にできる。',
    dragonReview: '大きなシステムを一撃で作る武器ではない。毎日削られている5分を、静かに焼き切る武器だ。',
    useCases: ['CSV整形ツールを作る', '社内確認フォームの試作品を作る', '営業リストの重複チェックを自動化する'],
  },
]

const domainSummaries = [
  {
    title: 'Claude領域',
    note: '文章・思考・資料の骨子を整える領域',
    icon: MessageSquareText,
    accent: '#8b7cff',
    bullets: ['議事録を提案に変換', '顧客要望を構造化', '長文を社内共有に圧縮'],
  },
  {
    title: 'Codex領域',
    note: '定型作業を小さな業務ツールに変える領域',
    icon: Bot,
    accent: '#38bdf8',
    bullets: ['転記を自動化', '確認画面を試作', 'CRM改善を小さく実装'],
  },
]

export default function AIFlameLogGuide() {
  return (
    <main className="min-h-screen bg-[#05070d] text-[#eef6ff]">
      <section className="relative overflow-hidden border-b border-[#1d2a3d] bg-[#05070d]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(56,189,248,0.18),transparent_28%),radial-gradient(circle_at_70%_22%,rgba(139,124,255,0.14),transparent_24%),linear-gradient(90deg,rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(rgba(148,163,184,0.07)_1px,transparent_1px)] bg-[length:auto,auto,34px_34px,34px_34px]" />
        <div className="absolute inset-x-0 top-0 h-3 bg-[linear-gradient(90deg,#4f46e5,#0891b2,#65a30d)]" />
        <div className="relative mx-auto grid min-h-[640px] max-w-[1500px] gap-8 px-4 pb-12 pt-20 sm:px-8 lg:grid-cols-[0.88fr_1.12fr] lg:px-12">
          <div className="flex flex-col justify-center">
            <div className="mb-7 flex w-fit items-center gap-2 rounded-full border border-[#38bdf8]/25 bg-[#0d1523]/82 px-4 py-2 text-[12px] font-black tracking-[0.16em] text-[#c8f3ff] shadow-[0_18px_60px_-48px_rgba(56,189,248,0.45)]">
              <ScanLine size={16} className="text-[#38bdf8]" />
              DRAGON AI SIGNAL
            </div>

            <h1 className="font-display text-[3.1rem] font-black leading-[0.96] tracking-normal text-[#f8fbff] sm:text-[4.6rem] lg:text-[5.05rem] xl:text-[5.35rem]">
              <span className="block">AI竜火録</span>
              <span
                className="block text-transparent"
                style={{
                  backgroundImage: 'linear-gradient(90deg,#8b7cff,#38bdf8 55%,#a3e635)',
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text',
                }}
              >
                SIGNAL LAB
              </span>
            </h1>

            <p className="mt-6 max-w-[720px] text-base font-black leading-8 text-[#c8d7ea] sm:text-lg">
              今日のAI武器を、竜が鑑定する。Claude・Codex領域のアップデートを、法人実務で使えるシグナルカードに変える。
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href="#ai-weapons"
                className="inline-flex h-16 min-h-16 items-center justify-center gap-3 rounded-lg bg-[#e8f4ff] px-7 py-4 text-base font-black text-[#06111f] shadow-[0_24px_70px_-44px_rgba(56,189,248,0.75)] transition-transform hover:-translate-y-0.5"
              >
                <Zap size={21} className="text-[#a3e635]" />
                今日の鑑定を見る
                <ArrowRight size={20} />
              </a>
            </div>
          </div>

          <div className="relative flex min-h-[540px] items-center">
            <div className="relative w-full overflow-hidden rounded-lg border border-[#25445f]/70 bg-[#07101d] shadow-[0_34px_120px_-58px_rgba(56,189,248,0.55)]">
              <div className="grid border-b border-white/10 bg-[#0d1523] px-4 py-3 text-[11px] font-black tracking-[0.16em] text-[#b8c4d6] sm:grid-cols-3">
                <span>SIGNAL CORE</span>
                <span className="hidden text-center text-[#a3e635] sm:block">CLAUDE / CODEX</span>
                <span className="hidden text-right text-[#31d6ff] sm:block">DRAGON JUDGE</span>
              </div>

              <div className="grid gap-0 lg:grid-cols-[minmax(390px,1fr)_292px]">
                <div className="relative min-h-[420px] overflow-hidden bg-[#05070d] p-5">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_48%,rgba(56,189,248,0.20),transparent_28%),radial-gradient(circle_at_32%_24%,rgba(139,124,255,0.18),transparent_22%),linear-gradient(90deg,rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(rgba(148,163,184,0.07)_1px,transparent_1px)] bg-[length:auto,auto,28px_28px,28px_28px]" />

                  <div className="relative grid gap-3 sm:grid-cols-2">
                    {[
                      { title: 'Claude Signal', note: '議事録・提案・要約', icon: MessageSquareText, accent: '#8b7cff' },
                      { title: 'Codex Signal', note: '自動化・小型ツール化', icon: Code2, accent: '#38bdf8' },
                    ].map((signal) => {
                      const SignalIcon = signal.icon
                      return (
                        <div key={signal.title} className="rounded-lg border border-white/10 bg-[#0b1220]/86 p-4 shadow-[0_18px_48px_-36px_rgba(0,0,0,0.9)]">
                          <div className="flex items-center gap-3">
                            <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-[#101827]" style={{ color: signal.accent }}>
                              <SignalIcon size={20} />
                            </span>
                            <div>
                              <div className="text-[12px] font-black tracking-[0.14em]" style={{ color: signal.accent }}>
                                {signal.title}
                              </div>
                              <div className="mt-1 text-[13px] font-black text-[#eef6ff]">{signal.note}</div>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  <div className="relative mt-4 min-h-[250px] overflow-hidden rounded-lg border border-white/10 bg-[#060b14]/90 p-5">
                    <div className="absolute left-1/2 top-1/2 h-52 w-52 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#38bdf8]/22" />
                    <div className="absolute left-1/2 top-1/2 h-36 w-36 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#8b7cff]/28" />
                    <div className="absolute left-1/2 top-1/2 h-20 w-20 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,#a3e635_0%,#38bdf8_48%,rgba(56,189,248,0.10)_70%,transparent_100%)] opacity-80 blur-[1px]" />
                    <div className="absolute left-1/2 top-1/2 h-[1px] w-[80%] -translate-x-1/2 bg-[#38bdf8]/18" />
                    <div className="absolute left-1/2 top-1/2 h-[76%] w-[1px] -translate-y-1/2 bg-[#8b7cff]/18" />

                    <div className="relative max-w-[315px] rounded-lg border border-white/12 bg-[#0b1220]/86 px-4 py-3 text-white shadow-[0_18px_48px_-32px_rgba(0,0,0,0.9)] backdrop-blur-md">
                      <div className="text-[11px] font-black tracking-[0.18em] text-[#a3e635]">DRAGON VERDICT</div>
                      <div className="mt-1 text-2xl font-black">使える火種だけ拾え。</div>
                    </div>

                    <div className="absolute bottom-4 left-4 right-4 grid gap-2 sm:grid-cols-3">
                      {['実務に落ちるか', '明日試せるか', '自動化できるか'].map((item, index) => (
                        <div key={item} className="rounded-lg border border-white/12 bg-[#05070d]/82 p-2.5 text-white backdrop-blur-md">
                          <div className="text-[11px] font-black text-[#31d6ff]">CHECK 0{index + 1}</div>
                          <div className="mt-1 text-[12px] font-black leading-5">{item}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="border-t border-white/10 bg-[#09111f] p-5 text-[#eef6ff] lg:border-l lg:border-t-0">
                  <div className="flex items-center gap-2 text-lg font-black">
                    <WandSparkles size={20} className="text-[#8b7cff]" />
                    竜の鑑定基準
                  </div>
                  <p className="mt-4 text-[13px] font-bold leading-7 text-[#b8c4d6]">
                    新機能そのものより、法人現場で何の摩擦を減らすかを見る。
                  </p>
                  <div className="mt-5 grid gap-2">
                    {['便利そうで終わらない', '業務の詰まりに刺す', '小さく自動化する', '翌日の行動に落とす'].map((item) => (
                      <div key={item} className="flex items-center gap-2 rounded-lg border border-white/10 bg-[#101827] px-3 py-2 text-[13px] font-black">
                        <Sparkles size={14} className="text-[#38bdf8]" />
                        {item}
                      </div>
                    ))}
                  </div>
                  <div className="mt-5 rounded-lg bg-[#04070d] p-4 text-white">
                    <div className="text-[11px] font-black tracking-[0.16em] text-[#a3e635]">TODAY&apos;S SIGNAL</div>
                    <p className="mt-2 text-[13px] font-black leading-6">
                      便利そう、で終わるAIは火種。業務に刺して初めて武器になる。
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="ai-domains" className="border-y border-[#1d2a3d] bg-[#070b13] px-4 py-12 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-[1370px]">
          <SectionHeader
            number="01"
            label="TWO SIGNALS"
            title="二領域の信号塔"
            note="Claude / Codex"
            dark
          />
          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            {domainSummaries.map((domain) => {
              const Icon = domain.icon
              return (
                <article key={domain.title} className="overflow-hidden rounded-lg border border-white/10 bg-[#0b1220] shadow-[0_20px_70px_-58px_rgba(0,0,0,0.85)]">
                  <div className="h-2" style={{ backgroundColor: domain.accent }} />
                  <div className="p-5">
                    <div className="flex items-center gap-3">
                      <span className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-[#111827] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.10)]" style={{ color: domain.accent }}>
                        <Icon size={23} />
                      </span>
                      <div>
                        <h3 className="text-lg font-black text-[#eef6ff]">{domain.title}</h3>
                        <p className="text-[13px] font-bold leading-6 text-[#9fb0c7]">{domain.note}</p>
                      </div>
                    </div>
                    <div className="mt-5 grid gap-2">
                      {domain.bullets.map((bullet) => (
                        <div key={bullet} className="flex items-center gap-2 rounded-lg border border-white/10 bg-[#080d18] px-3 py-2 text-[13px] font-black text-[#e5eefb]">
                          <Braces size={14} style={{ color: domain.accent }} />
                          {bullet}
                        </div>
                      ))}
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        </div>
      </section>

      <section id="ai-weapons" className="bg-[#05070d] px-4 py-12 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-[1370px]">
          <SectionHeader
            number="02"
            label="TODAY'S WEAPONS"
            title="今日のシグナル鑑定カード"
            note="各領域1枚ずつ"
            dark
          />
          <div className="mt-6 grid gap-5 xl:grid-cols-2">
            {aiWeaponCards.map((card) => (
              <AIWeaponArticle key={card.title} card={card} />
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}

function SectionHeader({
  number,
  label,
  title,
  note,
  dark = false,
}: {
  number: string
  label: string
  title: string
  note: string
  dark?: boolean
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <div className="flex items-center gap-2">
          <span className={`rounded-full px-2 py-0.5 text-[11px] font-black ${dark ? 'bg-[#a3e635] text-[#111827]' : 'bg-[#111827] text-white'}`}>
            {number}
          </span>
          <span className={`text-[11px] font-black tracking-[0.16em] ${dark ? 'text-[#a3e635]' : 'text-[#00a7e8]'}`}>
            {label}
          </span>
        </div>
        <h2 className={`mt-2 text-2xl font-black ${dark ? 'text-white' : 'text-[#111827]'}`}>{title}</h2>
      </div>
      <span className={`text-sm font-black ${dark ? 'text-[#d8e1ee]' : 'text-[#526174]'}`}>{note}</span>
    </div>
  )
}

function AIWeaponArticle({ card }: { card: AIWeaponCard }) {
  const Icon = card.icon

  return (
    <article className="overflow-hidden rounded-lg border border-white/10 bg-[#0b1220] shadow-[0_24px_82px_-62px_rgba(0,0,0,0.88)]">
      <div className="relative aspect-[407/235] overflow-hidden bg-[#111827]">
        <Image
          src={card.image}
          alt={`${card.title}のAI鑑定カード`}
          fill
          sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw"
          className="object-cover opacity-[0.76] saturate-[1.2] transition-transform duration-300 hover:scale-[1.025]"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(5,7,13,0.22),rgba(5,7,13,0.42)_42%,rgba(5,7,13,0.90))]" />
        <div className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full border border-white/12 bg-[#05070d]/88 px-3 py-1.5 text-[12px] font-black text-[#eef6ff] shadow-[0_14px_48px_-32px_rgba(0,0,0,0.8)] backdrop-blur-md">
          <Icon size={15} style={{ color: card.accent }} />
          {card.category}
        </div>
        <div className="absolute bottom-4 right-4 rounded-full px-3 py-1 text-[11px] font-black text-white" style={{ backgroundColor: card.accent }}>
          {card.label}
        </div>
      </div>

      <div className="p-5">
        <h3 className="font-display text-2xl font-black leading-tight text-[#f8fbff]">{card.title}</h3>
        <p className="mt-2 text-[13px] font-bold leading-6 text-[#9fb0c7]">{card.subtitle}</p>

        <div className="mt-5 grid gap-3">
          <AIWeaponBlock title="何が起きたか" body={card.whatHappened} accent={card.accent} />
          <AIWeaponBlock title="法人実務で何に効くか" body={card.businessEffect} accent={card.accent} />
          <AIWeaponBlock title="竜の鑑定" body={card.dragonReview} accent={card.accent} strong />
        </div>

        <div className="mt-5 rounded-lg p-4" style={{ backgroundColor: card.softAccent }}>
          <div className="mb-3 flex items-center gap-2 text-[12px] font-black tracking-[0.14em]" style={{ color: card.accent }}>
            <FileText size={15} />
            使いどころ
          </div>
          <div className="grid gap-2">
            {card.useCases.map((useCase) => (
              <div key={useCase} className="flex items-center gap-2 text-[13px] font-bold leading-6 text-[#eef6ff]">
                <Sparkles size={14} style={{ color: card.accent }} />
                {useCase}
              </div>
            ))}
          </div>
        </div>
      </div>
    </article>
  )
}

function AIWeaponBlock({
  title,
  body,
  accent,
  strong = false,
}: {
  title: string
  body: string
  accent: string
  strong?: boolean
}) {
  return (
    <div className="rounded-lg border border-white/10 bg-[#080d18] p-4">
      <div className="text-[11px] font-black tracking-[0.14em]" style={{ color: accent }}>
        {title}
      </div>
      <p className={`mt-2 text-[13px] leading-7 ${strong ? 'font-black text-[#f8fbff]' : 'font-bold text-[#b8c4d6]'}`}>
        {body}
      </p>
    </div>
  )
}
