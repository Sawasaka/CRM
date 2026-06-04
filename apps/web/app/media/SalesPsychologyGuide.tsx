'use client'

import Image from 'next/image'
import { ArrowRight, BrainCircuit, Microscope, Sparkles, Target } from 'lucide-react'

const weapons = [
  {
    title: '返報性',
    label: 'GIVE型の設計',
    copy: '先に渡す価値を、押し売りではなく信頼の入口に変える。',
    image: '/media/psychology/weapon-reciprocity.png',
    accent: '#d7ad59',
  },
  {
    title: 'フレーミング',
    label: '見え方の設計',
    copy: '同じ提案でも、相手の判断軸に合わせて意味を変える。',
    image: '/media/psychology/weapon-framing.png',
    accent: '#6bc6d9',
  },
  {
    title: '信頼形成',
    label: '信用の設計図',
    copy: '好感ではなく、リスクを預けてもいい根拠を積み上げる。',
    image: '/media/psychology/weapon-trust.png',
    accent: '#d7ad59',
  },
  {
    title: '動機づけ',
    label: '動く理由の整理',
    copy: '顧客と営業が前へ進みやすい理由を、言葉にして固定する。',
    image: '/media/psychology/weapon-motivation.png',
    accent: '#c98c4a',
  },
]

const situations = [
  {
    title: '初回商談',
    label: '最初の3分',
    copy: '警戒心をほどき、相手が話したくなる観察順序を作る。',
    image: '/media/psychology/situation-first-meeting.png',
    accent: '#6bc6d9',
  },
  {
    title: '価格抵抗',
    label: '高いの分解',
    copy: '「高い」を、予算・不安・優先度・社内説明の4系統に分解する。',
    image: '/media/psychology/situation-price-objection.png',
    accent: '#d7ad59',
  },
  {
    title: '稟議停滞',
    label: '社内迷宮',
    copy: '稟議が止まる背景を、意思決定者だけでなく摩擦の地図で見る。',
    image: '/media/psychology/situation-internal-approval.png',
    accent: '#d7ad59',
  },
  {
    title: '決裁者不在',
    label: '空席の王座',
    copy: '会えていない人の不安と評価軸を、目の前の担当者から逆算する。',
    image: '/media/psychology/situation-no-decision.png',
    accent: '#91a1b8',
  },
]

const professorChecks = ['論文を営業語に翻訳', '商談の感情ログを観測', '失注の心理パターンを整理', '現場で使える一言に変換']

export default function SalesPsychologyGuide() {
  return (
    <main className="min-h-screen bg-[#061727] text-[#07111a]">
      <div className="relative mx-auto max-w-[1500px] bg-[#061727] shadow-[0_0_0_1px_rgba(215,173,89,0.16)]">
        <aside className="absolute bottom-0 left-0 top-0 hidden w-[60px] bg-[#07111a] md:block">
          <div className="absolute inset-0 opacity-25 [background-image:linear-gradient(135deg,rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:12px_12px]" />
          <div className="sticky top-[94px] mx-auto mt-9 flex h-[356px] w-10 flex-col items-center gap-3 rounded-lg border border-[#d7ad59]/45 bg-[#102334] px-2 py-4 text-[#f5d486]">
            <span className="text-2xl font-black leading-none">心</span>
            <span className="text-[12px] font-black leading-5" style={{ writingMode: 'vertical-rl' }}>
              顧客の沈黙には、だいたい手がかりがある。
            </span>
          </div>
        </aside>

        <section id="psychology-lab" className="relative overflow-hidden border-b border-[#d7ad59]/25 pl-0 md:pl-[60px]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_34%_30%,rgba(215,173,89,0.18),transparent_20%),radial-gradient(circle_at_70%_26%,rgba(107,198,217,0.16),transparent_18%),linear-gradient(115deg,rgba(2,10,16,0.72),rgba(6,23,39,0.94)_48%,rgba(3,12,19,0.98)),linear-gradient(90deg,rgba(245,212,134,0.05)_1px,transparent_1px),linear-gradient(rgba(245,212,134,0.04)_1px,transparent_1px)] bg-[length:auto,auto,auto,44px_44px,44px_44px]" />
          <div className="absolute inset-0 bg-[url('/media/psychology/weapon-trust.png')] bg-cover bg-center opacity-[0.18] mix-blend-screen" />
          <div className="absolute left-[32%] top-8 hidden text-[16rem] font-black leading-none text-[#f5d486]/[0.055] lg:block">
            心
          </div>

          <div className="relative grid min-h-[560px] gap-6 px-4 pb-0 pt-8 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:px-12 lg:pt-9">
            <div className="relative z-10 flex flex-col justify-center pb-8 lg:pb-10">
              <div className="mb-7 inline-flex w-fit items-center gap-3 rounded-md border border-[#d7ad59]/35 bg-[#07111a]/78 px-4 py-2 text-[13px] font-black text-[#fff3d8] shadow-[0_14px_28px_-26px_rgba(0,0,0,0.9)] backdrop-blur-sm">
                <span className="h-1.5 w-9 rounded-full bg-[#d7ad59]" />
                論文と本の知見を、博士が現場の攻略カードに変換する。
              </div>

              <h1 className="font-display text-[2.8rem] font-black leading-[1.04] text-[#fffaf0] drop-shadow-[0_12px_34px_rgba(0,0,0,0.75)] sm:text-[4rem] lg:text-[4.2rem] xl:text-[4.7rem]">
                <span className="sm:whitespace-nowrap">はぐれ博士の</span>
                <span className="block text-[#f2cb77] sm:whitespace-nowrap">営業武器庫</span>
              </h1>

              <p className="mt-5 max-w-[700px] text-base font-black leading-8 text-[#fff3d8] drop-shadow-[0_8px_22px_rgba(0,0,0,0.7)] sm:text-lg">
                アダム・グラント系の本や行動科学の知見を、商談・失注・稟議・信頼形成で使える攻略カードに変える営業エンタメメディア。
              </p>

              <div className="mt-6 flex flex-col gap-4 sm:flex-row">
                <a
                  href="#psychology-weapons"
                  className="inline-flex h-16 items-center justify-center gap-3 rounded-lg border-2 border-[#d7ad59] bg-[#061727] px-7 text-base font-black text-[#f5d486] shadow-[0_18px_40px_-26px_rgba(6,23,39,0.8)] transition-transform hover:-translate-y-0.5"
                >
                  <BrainCircuit size={22} />
                  心理の武器庫を開く
                  <ArrowRight size={20} />
                </a>
                <a
                  href="#psychology-situations"
                  className="inline-flex h-16 items-center justify-center gap-3 rounded-lg border-2 border-[#d7ad59]/45 bg-[#07111a]/80 px-7 text-base font-black text-[#fff3d8] shadow-[0_18px_40px_-30px_rgba(0,0,0,0.9)] transition-colors hover:bg-[#102334]"
                >
                  <Target size={22} />
                  状況別攻略を見る
                  <ArrowRight size={18} />
                </a>
              </div>
            </div>

            <div id="psychology-professor" className="relative z-10 min-h-[520px] lg:min-h-[540px]">
              <div className="absolute bottom-0 left-[8%] right-[6%] top-8 rounded-lg border border-[#d7ad59]/30 bg-[#071a28] shadow-[0_24px_70px_-44px_rgba(6,23,39,0.9)]" />
              <div className="absolute bottom-0 left-[5%] right-[12%] top-6 overflow-hidden rounded-lg border border-[#d7ad59]/25 bg-[#071a28]">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_22%,rgba(215,173,89,0.16),transparent_18%),linear-gradient(90deg,rgba(245,212,134,0.05)_1px,transparent_1px),linear-gradient(rgba(245,212,134,0.04)_1px,transparent_1px)] bg-[length:auto,42px_42px,42px_42px]" />
                <Image
                  src="/media/psychology/weapon-reciprocity.png"
                  alt="営業心理学ラボで研究するはぐれ博士"
                  fill
                  priority
                  sizes="(min-width: 1024px) 520px, 100vw"
                  className="object-cover opacity-88"
                />
                <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(6,23,39,0.1),rgba(6,23,39,0.22)_42%,rgba(6,23,39,0.58))]" />
                <div className="absolute right-7 top-8 hidden h-44 w-44 rounded-full border border-[#d7ad59]/30 bg-[#061727]/85 shadow-[0_0_54px_-24px_rgba(215,173,89,0.95)] sm:block">
                  <div className="absolute left-1/2 top-1/2 h-[1px] w-[120%] -translate-x-1/2 bg-[#d7ad59]/40" />
                  <div className="absolute left-1/2 top-1/2 h-[120%] w-[1px] -translate-y-1/2 bg-[#6bc6d9]/40" />
                  <div className="absolute inset-8 rounded-full border border-[#d7ad59]/35" />
                </div>
              </div>

              <div className="absolute right-0 top-[112px] w-[292px] rounded-lg border border-[#d7ad59]/45 bg-[#061727]/95 p-5 text-[#fff3d8] shadow-[0_20px_50px_-32px_rgba(0,0,0,0.9)] backdrop-blur-sm max-sm:left-4 max-sm:right-4 max-sm:top-auto max-sm:bottom-5 max-sm:w-auto">
                <div className="flex items-center gap-2 text-lg font-black text-[#f5d486]">
                  <Microscope size={20} />
                  はぐれ博士の研究室
                </div>
                <p className="mt-4 text-[13px] font-bold leading-7">
                  論文を丸写しせず、現場で使える観察メモに翻訳するはぐれ系研究者。
                </p>
                <div className="my-4 h-px bg-[#d7ad59]/35" />
                <ul className="space-y-2">
                  {professorChecks.map((check) => (
                    <li key={check} className="flex items-center gap-2 text-[13px] font-bold text-[#ffe8ec]">
                      <Sparkles size={15} className="text-[#d7ad59]" />
                      {check}
                    </li>
                  ))}
                </ul>
                <div className="mt-5 rounded-lg border border-[#d7ad59]/35 bg-[#07111a] p-4">
                  <div className="text-[11px] font-black text-[#f5d486]">今日の観察メモ</div>
                  <p className="mt-2 text-[13px] font-black leading-6">
                    「検討します」は、感情の棚卸し不足かもしれない。
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="psychology-situations" className="relative bg-[#061727] px-4 py-5 sm:px-8 md:pl-[92px] lg:px-12 lg:pl-[92px]">
          <div className="mx-auto max-w-[1370px]">
            <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <SectionTitle eyebrow="状況別攻略" title="商談で詰まる場面を、心理の構造から読み解く" />
              <span className="text-sm font-black text-[#f5d486]">博士のフィールドノート</span>
            </div>
            <div className="grid gap-3 lg:grid-cols-4">
              {situations.map((card) => (
                <PsychologyImageCard key={card.title} card={card} />
              ))}
              {weapons.map((card) => (
                <PsychologyImageCard key={card.title} card={card} />
              ))}
            </div>
          </div>
        </section>

      </div>
    </main>
  )
}

function SectionTitle({
  eyebrow,
  title,
  compact = false,
}: {
  eyebrow: string
  title: string
  compact?: boolean
}) {
  return (
    <div className="flex min-w-0 items-baseline gap-3">
      <div className="text-xl font-black text-[#fff3d8]">› {eyebrow}</div>
      <div className={`hidden min-w-0 font-bold text-[#f5d486]/75 sm:block ${compact ? 'text-sm' : 'text-[13px]'}`}>
        {title}
      </div>
    </div>
  )
}

function PsychologyImageCard({
  card,
  dark = false,
}: {
  card: {
    title: string
    label: string
    copy: string
    image: string
    accent: string
  }
  dark?: boolean
}) {
  return (
    <a
      href="#psychology-notes"
      className={`group relative block overflow-hidden rounded-lg border text-left shadow-[0_16px_38px_-34px_rgba(6,23,39,0.9)] transition-transform hover:-translate-y-0.5 ${
        dark ? 'border-[#d7ad59]/25 bg-[#071a28]' : 'border-[#061727]/25 bg-[#061727]'
      }`}
      style={{ aspectRatio: '407 / 285' }}
    >
      <Image
        src={card.image}
        alt={`${card.title}の営業心理学カード`}
        fill
        sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
        className="object-cover transition-transform duration-300 group-hover:scale-[1.025]"
      />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(5,17,27,0.18),rgba(5,17,27,0.28)_36%,rgba(5,17,27,0.82))]" />
      <div className="absolute inset-x-0 bottom-0 p-4 text-right">
        <div className="ml-auto inline-flex rounded-full px-2.5 py-1 text-[11px] font-black text-[#04141d]" style={{ background: card.accent }}>
          {card.label}
        </div>
        <h3 className="mt-2 font-display text-2xl font-black leading-tight text-white">{card.title}</h3>
        <p className="ml-auto mt-1 max-w-[230px] text-[12px] font-bold leading-5 text-[#fff3f5]">{card.copy}</p>
      </div>
      <ArrowRight className="absolute right-3 top-3 text-white/88" size={18} />
    </a>
  )
}

