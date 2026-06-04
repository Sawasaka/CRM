'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { createPortal } from 'react-dom'
import { ArrowRight, BrainCircuit, Microscope, Sparkles, Target, X } from 'lucide-react'

type PsychologyCard = {
  title: string
  label: string
  copy: string
  image: string
  accent: string
}

type DragonActivation = {
  cardName: string
  species: string
  name: string
  type: string
  image: string
  accent: string
  trait: string
  effect: string
  caution: string
  memo: string
}

const weapons = [
  {
    title: '価格交渉',
    label: '値引きの設計',
    copy: '値引き応酬ではなく、双方が納得できる着地点を一手で作る。',
    image: '/media/psychology/weapon-reciprocity.png',
    accent: '#d7ad59',
  },
  {
    title: 'クロージング',
    label: '決断の設計',
    copy: '迷いを置き去りにせず、相手が自分から動く最後の一文を渡す。',
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

const dragonActivations: Record<string, DragonActivation> = {
  初回商談: {
    cardName: '傾聴カード',
    species: '水竜',
    name: 'ヒアリング',
    type: '信頼形成型',
    image: '/media/dragon-types/water-hearing-card.png',
    accent: '#6bc6d9',
    trait: '警戒解除・共感・問い・沈黙耐性',
    effect: '相手の警戒心をほどき、話したくなる土台を作る。初回商談でいきなり売り込む営業を、博士が水槽に沈めるカード。',
    caution: '聞くだけで満足すると、ただの優しい人で終わる。最後は次の論点を一つだけ浮かび上がらせる。',
    memo: '質問は釣り針ではない。相手が安心して泳げる水温を作れ。',
  },
  価格抵抗: {
    cardName: '価値分解カード',
    species: '岩竜',
    name: 'バリューガード',
    type: '納得設計型',
    image: '/media/dragon-types/rock-guardian-card.png',
    accent: '#d7ad59',
    trait: '予算・不安・優先度・社内説明',
    effect: '「高い」をひとまとめにせず、4つの摩擦に分けて攻略ルートを作る。',
    caution: '値引きで殴ると、価値まで一緒に削れる。',
    memo: '価格は敵ではない。説明不足の鎧を着た不安だ。',
  },
  稟議停滞: {
    cardName: '社内迷宮カード',
    species: '岩竜',
    name: 'ルートメーカー',
    type: '摩擦可視化型',
    image: '/media/dragon-types/rock-guardian-card.png',
    accent: '#d7ad59',
    trait: '社内説明・合意形成・摩擦地図',
    effect: '止まった稟議を、担当者の怠慢ではなく社内説明の迷路として読み直す。',
    caution: '決裁者の名前だけ聞いても迷路は抜けられない。通路と罠を聞け。',
    memo: '稟議はドラゴンではない。だいたい通路が暗いだけだ。',
  },
  決裁者不在: {
    cardName: '決裁者探索カード',
    species: '雷竜',
    name: 'キーマンレーダー',
    type: '評価軸探索型',
    image: '/media/dragon-types/thunder-driver-card.png',
    accent: '#91a1b8',
    trait: '影響者・評価軸・不在リスク',
    effect: '会えていない人の不安と判断軸を、目の前の担当者の言葉から逆算する。',
    caution: '「決裁者に会えますか」だけでは芸がない。会う理由を先に作れ。',
    memo: '空席の王座にも、だいたい座り心地の好みがある。',
  },
  価格交渉: {
    cardName: '均衡交渉カード',
    species: '岩竜',
    name: 'バランサー',
    type: '着地設計型',
    image: '/media/dragon-types/rock-guardian-card.png',
    accent: '#d7ad59',
    trait: '条件・譲歩・合意・着地点',
    effect: '値引き合戦を避け、条件交換で双方が納得できる着地点を作る。',
    caution: '最初に値段を下げると、博士のメガネも少し曇る。',
    memo: '譲歩は投げ銭ではない。交換条件を連れてこい。',
  },
  クロージング: {
    cardName: '決断点火カード',
    species: '炎竜',
    name: 'ラストワード',
    type: '前進支援型',
    image: '/media/dragon-types/fire-closer-card.png',
    accent: '#d85b31',
    trait: '不安整理・期限・次の一歩',
    effect: '迷いを置き去りにせず、相手が自分で前へ進む最後の一文を渡す。',
    caution: '詰めすぎると、炎ではなく焦げ臭さだけが残る。',
    memo: 'クロージングは扉を蹴る技ではない。鍵穴を照らす技だ。',
  },
  信頼形成: {
    cardName: '信頼蓄積カード',
    species: '水竜',
    name: 'トラストレイク',
    type: '信用設計型',
    image: '/media/dragon-types/water-hearing-card.png',
    accent: '#6bc6d9',
    trait: '一貫性・根拠・安心材料',
    effect: '好感だけに頼らず、相手がリスクを預けてもいい根拠を積み上げる。',
    caution: 'いい人カードだけでは稟議を突破できない。',
    memo: '信頼は気合いではない。小さい約束の積立投資だ。',
  },
  動機づけ: {
    cardName: '理由点火カード',
    species: '雷竜',
    name: 'イグナイター',
    type: '行動理由設計型',
    image: '/media/dragon-types/thunder-driver-card.png',
    accent: '#c98c4a',
    trait: '目的・危機感・理想状態',
    effect: '顧客と営業が前へ進みやすい理由を、ふわっとした温度感から言葉へ固定する。',
    caution: '熱量だけを足すと、議事録がポエムになる。',
    memo: '動く理由がない案件は、だいたい椅子から立たない。',
  },
}

const fallbackActivation: DragonActivation = {
  cardName: '営業心理カード',
  species: '観測竜',
  name: 'オブザーバー',
  type: '仮説観測型',
  image: '/media/dragon-types/water-hearing-card.png',
  accent: '#d7ad59',
  trait: '観察・仮説・現場変換',
  effect: '商談の違和感を観察し、次に使える問いへ変換する。',
  caution: '決めつけると、心理学ではなく思い込みになる。',
  memo: '博士いわく、観察は強い。ただし雑な観察はただの感想だ。',
}

function getDragonActivation(card: PsychologyCard) {
  return dragonActivations[card.title] ?? fallbackActivation
}

export default function SalesPsychologyGuide() {
  const [selectedCard, setSelectedCard] = useState<PsychologyCard | null>(null)

  useEffect(() => {
    if (!selectedCard) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSelectedCard(null)
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [selectedCard])

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
                <PsychologyImageCard key={card.title} card={card} onOpen={() => setSelectedCard(card)} />
              ))}
              {weapons.map((card) => (
                <PsychologyImageCard key={card.title} card={card} onOpen={() => setSelectedCard(card)} />
              ))}
            </div>
          </div>
        </section>

      </div>
      {selectedCard && typeof document !== 'undefined'
        ? createPortal(
            <PsychologyStrategyModal card={selectedCard} onClose={() => setSelectedCard(null)} />,
            document.body,
          )
        : null}
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
  onOpen,
  dark = false,
}: {
  card: PsychologyCard
  onOpen: () => void
  dark?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={`${card.title}の攻略カードを見る`}
      className={`group relative block w-full cursor-zoom-in overflow-hidden rounded-lg border text-left shadow-[0_16px_38px_-34px_rgba(6,23,39,0.9)] transition-transform hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f5d486] ${
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
    </button>
  )
}

function PsychologyStrategyModal({
  card,
  onClose,
}: {
  card: PsychologyCard
  onClose: () => void
}) {
  const activation = getDragonActivation(card)

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-[#02070d]/86 px-4 py-6 text-[#fff3d8] backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-labelledby="psychology-strategy-card-title"
      onClick={onClose}
    >
      <div
        className="relative my-auto w-full max-w-[980px] overflow-hidden rounded-xl border border-[#d7ad59]/55 bg-[#061727] shadow-[0_34px_120px_-48px_rgba(0,0,0,1),0_0_0_1px_rgba(245,212,134,0.12)]"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="攻略カードを閉じる"
          className="absolute right-4 top-4 z-20 grid h-10 w-10 place-items-center rounded-full border border-[#d7ad59]/40 bg-[#061727]/92 text-[#fff3d8] shadow-[0_12px_30px_-20px_rgba(0,0,0,0.9)] transition-colors hover:bg-[#102334] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f5d486]"
        >
          <X size={20} />
        </button>

        <div className="relative overflow-hidden">
          <Image
            src={activation.image}
            alt={`${activation.species} ${activation.name}のドラゴンカード背景`}
            fill
            sizes="(min-width: 1024px) 920px, 100vw"
            className="object-cover opacity-18"
            priority
          />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_28%,rgba(107,198,217,0.16),transparent_18%),radial-gradient(circle_at_28%_76%,rgba(215,173,89,0.18),transparent_20%),linear-gradient(115deg,rgba(2,10,16,0.98),rgba(6,23,39,0.95)_54%,rgba(3,12,19,0.98))]" />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(245,212,134,0.055)_1px,transparent_1px),linear-gradient(rgba(245,212,134,0.045)_1px,transparent_1px)] bg-[length:42px_42px]" />

          <div className="relative z-10 grid gap-0 lg:grid-cols-[0.92fr_1.08fr]">
            <div className="flex flex-col justify-between p-6 pr-16 sm:p-9 sm:pr-20 lg:pr-9">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-[#d7ad59]/45 bg-[#061727]/78 px-3 py-1.5 text-[12px] font-black text-[#f5d486]">
                  <Sparkles size={14} />
                  はぐれ博士の営業武器庫
                </div>
                <div className="mt-4 inline-flex rounded-full px-3 py-1.5 text-[12px] font-black text-[#04111d]" style={{ background: activation.accent }}>
                  {card.title}で発動
                </div>
              </div>

              <div className="mt-10 max-w-[520px]">
                <div className="mb-5 h-1.5 w-16 rounded-full" style={{ background: activation.accent }} />
                <div className="text-[13px] font-black text-[#f5d486]">
                  DRAGON CARD ACTIVATED
                </div>
                <h2 id="psychology-strategy-card-title" className="mt-3 font-display text-[2.85rem] font-black leading-none text-[#fffaf0] drop-shadow-[0_12px_34px_rgba(0,0,0,0.72)] sm:text-[4.6rem]">
                  {activation.cardName}
                </h2>
                <div className="mt-4 text-2xl font-black text-[#f2cb77]">
                  {activation.species} {activation.name}
                </div>
                <p className="mt-5 text-base font-black leading-8 text-[#fff3d8] drop-shadow-[0_8px_22px_rgba(0,0,0,0.7)] sm:text-lg">
                  {activation.effect}
                </p>
              </div>

              <div className="mt-7 grid gap-3">
                <div className="rounded-lg border border-[#d7ad59]/35 bg-[#061727]/82 p-4 backdrop-blur-sm">
                  <div className="text-[11px] font-black text-[#f5d486]">博士のツッコミ</div>
                  <p className="mt-2 text-[13px] font-bold leading-6 text-[#fff3d8]/88">
                    {activation.memo}
                  </p>
                </div>
                <div className="rounded-lg border border-[#d7ad59]/35 bg-[#061727]/82 p-4 backdrop-blur-sm">
                  <div className="text-[11px] font-black text-[#f5d486]">発動条件</div>
                  <p className="mt-2 text-[13px] font-bold leading-6 text-[#fff3d8]/88">
                    {activation.caution}
                  </p>
                </div>
              </div>
            </div>

            <div className="relative min-h-[520px] border-t border-[#d7ad59]/25 bg-[#020a10]/42 p-5 sm:p-8 lg:border-l lg:border-t-0">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_28%,rgba(245,212,134,0.18),transparent_20%)]" />
              <div className="relative mx-auto flex h-full max-w-[420px] flex-col items-center justify-center">
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#d7ad59]/45 bg-[#061727]/85 px-3 py-1.5 text-[12px] font-black text-[#f5d486]">
                  <span className="text-base">竜</span>
                  {activation.type}
                </div>
                <div className="relative w-full max-w-[322px] overflow-hidden rounded-lg border border-[#d7ad59]/55 bg-[#061727] p-2 shadow-[0_26px_80px_-38px_rgba(0,0,0,1)]">
                  <Image
                    src={activation.image}
                    alt={`${activation.species} ${activation.name}カード`}
                    width={392}
                    height={622}
                    priority
                    className="h-auto max-h-[58vh] w-full rounded-md object-contain"
                  />
                </div>
                <div className="mt-4 w-full max-w-[322px] rounded-lg border border-[#d7ad59]/35 bg-[#061727]/88 p-4">
                  <div className="text-[11px] font-black text-[#f5d486]">属性</div>
                  <div className="mt-2 text-sm font-black leading-6 text-[#fff3d8]">{activation.trait}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
