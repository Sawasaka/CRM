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
  evidence: string
  subheading?: string
  example?: string
  conclusion?: string
  technicalTerm?: string
  technicalMeaning?: string
  fieldLine?: string
  finisherName?: string
  methodSteps?: {
    label: string
    title: string
    copy: string
  }[]
  references?: {
    label: string
    source: string
    university: string
    researchers: string
    content: string
    evidenceLevel?: 'メタ分析' | 'RCT'
  }[]
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
    cardName: '温感メソッドカード',
    species: '水竜',
    name: 'ウォームヒアリング',
    type: '温かみ発動型',
    image: '/media/dragon-types/water-hearing-card.png',
    accent: '#6bc6d9',
    trait: '温かみ・有能さ・深層演技・傾聴',
    effect: '初回商談の最初の3分だけ、水竜の聞き役を召喚する。警戒心の水門をゆるめ、専門性で押す前に「この人には話しても大丈夫かも」を発生させるカード。',
    evidence: 'Fiske・Cuddy・GlickのSCMでは、対人評価の主要軸は温かみと有能さ。Hülsheger & Scheweのメタ分析では、表層演技より深層演技が接客成果と相性よし。',
    subheading: '初回3分は、売り込む前に「安心して話せる人」を演じきる。',
    example: '「いきなり提案ではなく、まず状況の地図を描かせてください。最近いちばん詰まりやすい商談は、どこで止まりますか？」',
    conclusion: '温かみで警戒水位を下げ、有能さは要約と問いの精度でチラ見せする。',
    technicalTerm: 'SCM（温かみ・有能さ） / 印象形成 / 深層演技',
    technicalMeaning: 'SCMは人を温かみと有能さで評価する枠組み。Deep Actingは表情だけでなく、内側の感情から役に入る感情労働の用語。',
    fieldLine: '売る前に、相手の警戒ゲージを下げる。水竜の仕事は「話してもいい場」を作ること。',
    finisherName: '安心地図オープン',
    methodSteps: [
      {
        label: '01',
        title: '温かい人に変身',
        copy: '声量・表情・相づちを半段やわらかく。表層スマイルではなく、聞く姿勢から入る。',
      },
      {
        label: '02',
        title: '状況の地図を描く',
        copy: '課題を詰問せず、商談が止まる地点を聞く。相手の頭の中に一緒に潜る。',
      },
      {
        label: '03',
        title: '要約で牙を見せる',
        copy: '最後に感情と論点を短く返す。温かいだけで終わらず、有能さをチラ見せする。',
      },
    ],
    references: [
      {
        label: '社会認知モデル',
        source: 'Universal dimensions of social cognition: warmth and competence',
        university: 'Princeton University',
        researchers: 'Susan T. Fiske / Amy J.C. Cuddy / Peter Glick',
        content: '人は相手をまず温かみ、次に有能さで評価しやすいという社会認知の主要軸を整理。',
      },
      {
        label: '信頼形成と影響力',
        source: 'Connect, Then Lead',
        university: 'Harvard Business School',
        researchers: 'Amy J.C. Cuddy / Matthew Kohut / John Neffinger',
        content: '影響力を出すには、能力を見せる前に温かみで信頼の土台を作るという実務向け整理。',
      },
      {
        label: '感情労働メタ分析',
        source: 'On the costs and benefits of emotional labor',
        university: 'Maastricht University / Bielefeld University',
        researchers: 'Ute R. Hülsheger / Anna F. Schewe',
        content: '感情労働研究を統合し、表層演技より深層演技が接客成果と相性がよいことを示す。',
        evidenceLevel: 'メタ分析',
      },
    ],
    caution: 'ニコニコするだけの表層演技だと、相手の警戒センサーに秒で見破られる。温かみを出しつつ、有能さのチラ見せを忘れるな。',
    memo: '博士いわく、初手から賢さで殴るな。まず水温を上げろ。そのあと剣を抜け。',
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
    evidence: '価格反応は金額そのものだけでなく、損失回避・参照価格・社内説明コストの影響を受けやすい。',
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
    evidence: '組織内の意思決定は、個人の納得だけでなく、関係者の評価軸と説明責任に左右される。',
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
    evidence: 'B2B購買では複数関係者の評価軸が絡むため、目の前の担当者だけを見ても意思決定の全体像は見えにくい。',
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
    evidence: '交渉では一方的な譲歩より、条件交換と相互利益の設計が合意の質を上げやすい。',
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
    evidence: '意思決定は合理性だけでなく、不安の整理と次の行動の明確さに左右される。',
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
    evidence: '信頼は温かみだけでなく、能力・一貫性・誠実さの手がかりから形成される。',
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
    evidence: '人は外から押されるだけでなく、自分の目的や意味づけと接続した時に動きやすい。',
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
  evidence: '観察と仮説化を分けると、商談後の振り返りが再現可能な学習に変わりやすい。',
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
                  href="#psychology-situations"
                  className="inline-flex h-16 items-center justify-center gap-3 rounded-lg border-2 border-[#d7ad59] bg-[#061727] px-7 text-base font-black text-[#f5d486] shadow-[0_18px_40px_-26px_rgba(6,23,39,0.8)] transition-transform hover:-translate-y-0.5"
                >
                  <Target size={22} />
                  状況別攻略を見る
                  <ArrowRight size={20} />
                </a>
                <a
                  href="/media#dragons"
                  className="inline-flex h-16 items-center justify-center gap-3 rounded-lg border-2 border-[#d7ad59]/45 bg-[#07111a]/80 px-7 text-base font-black text-[#fff3d8] shadow-[0_18px_40px_-30px_rgba(0,0,0,0.9)] transition-colors hover:bg-[#102334]"
                >
                  <span className="text-2xl">竜</span>
                  ドラゴン図鑑を見る
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
        className="relative my-auto max-h-[88vh] w-full max-w-[1040px] overflow-y-auto overflow-x-hidden rounded-xl border border-[#d7ad59]/55 bg-[#061727] shadow-[0_34px_120px_-48px_rgba(0,0,0,1),0_0_0_1px_rgba(245,212,134,0.12)] lg:max-h-[87vh] lg:overflow-hidden"
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

          <div className="relative z-10 grid gap-0 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="flex flex-col p-5 pr-16 sm:p-6 sm:pr-20 lg:p-5 lg:pr-6">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-[#d7ad59]/45 bg-[#061727]/78 px-3 py-1.5 text-[12px] font-black text-[#f5d486]">
                  <Sparkles size={14} />
                  はぐれ博士の営業武器庫
                </div>
                <div className="ml-0 mt-3 inline-flex rounded-full px-3 py-1.5 text-[12px] font-black text-[#04111d] sm:ml-2 sm:mt-0" style={{ background: activation.accent }}>
                  {card.title}で発動
                </div>
              </div>

              <div className="mt-4 max-w-[520px] lg:mt-5">
                <div className="mb-3 h-1.5 w-16 rounded-full" style={{ background: activation.accent }} />
                <h2 id="psychology-strategy-card-title" className="flex flex-wrap items-end gap-2 font-display text-[2.35rem] font-black leading-none text-[#fffaf0] drop-shadow-[0_12px_34px_rgba(0,0,0,0.72)] sm:text-[2.85rem]">
                  <span>{card.title}</span>
                  <span className="mb-1 rounded-full border border-[#d7ad59]/45 bg-[#d7ad59] px-2.5 py-1 text-[12px] font-black leading-none text-[#04111d]">
                    {activation.cardName}
                  </span>
                </h2>
                <div className="mt-2 truncate text-[11px] font-black text-[#f2cb77]">
                  {activation.technicalTerm ?? activation.trait}
                </div>
                <p className="mt-2 text-[13px] font-black leading-6 text-[#fff3d8] drop-shadow-[0_8px_22px_rgba(0,0,0,0.7)]">
                  {activation.subheading ?? activation.effect}
                </p>
              </div>

              <div className="mt-3 rounded-lg border border-[#d7ad59]/35 bg-[#020a10]/72 p-2.5 backdrop-blur-sm">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-[11px] font-black text-[#f5d486]">3連コンボ</div>
                  <div className="text-[10px] font-black text-[#fff3d8]/55">初回3分</div>
                </div>
                <div className="mt-2 grid gap-1.5 sm:grid-cols-3">
                  {(activation.methodSteps ?? [
                    { label: '01', title: '観察', copy: activation.effect },
                    { label: '02', title: '変換', copy: activation.memo },
                    { label: '03', title: '発動', copy: activation.caution },
                  ]).map((step) => (
                    <div key={step.label} className="flex min-w-0 items-center gap-1.5 rounded-md border border-[#d7ad59]/18 bg-[#061727]/78 px-2 py-2">
                      <span className="shrink-0 rounded-full bg-[#d7ad59] px-1.5 py-0.5 text-[9px] font-black leading-none text-[#04111d]">
                        {step.label}
                      </span>
                      <span className="truncate text-[10px] font-black text-[#fffaf0]">{step.title}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-2 rounded-lg border border-[#d7ad59]/40 bg-[#061727]/86 p-2.5 backdrop-blur-sm">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-[11px] font-black text-[#f5d486]">
                    <BrainCircuit size={14} />
                    決め技
                  </div>
                  <div className="rounded-full bg-[#d7ad59] px-2 py-1 text-[10px] font-black text-[#04111d]">
                    {activation.finisherName ?? '最終一言'}
                  </div>
                </div>
                <p className="mt-2 line-clamp-2 text-[12px] font-black leading-5 text-[#fff3d8]">
                  {activation.example ?? activation.memo}
                </p>
              </div>

              <div className="mt-2 rounded-lg border border-[#d7ad59]/35 bg-[#061727]/82 p-2.5 backdrop-blur-sm">
                <div className="flex items-start gap-2.5">
                  <div className="grid h-7 w-7 shrink-0 place-items-center rounded-md border border-[#6bc6d9]/45 bg-[#6bc6d9]/16 text-[#8cecff]">
                    <Target size={14} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[11px] font-black text-[#f5d486]">効果</div>
                    <p className="mt-1 line-clamp-2 text-[12px] font-black leading-5 text-[#fff3d8]">
                      {activation.fieldLine ?? activation.effect}
                    </p>
                  </div>
                </div>
              </div>
              {activation.references?.length ? (
                <div className="mt-2 rounded-lg border border-[#d7ad59]/35 bg-[#020a10]/76 p-2.5 backdrop-blur-sm">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="text-[11px] font-black text-[#f5d486]">参照文献・研究根拠</div>
                      <div className="mt-0.5 text-[10px] font-bold text-[#fff3d8]/62">温かみ・有能さ・深層演技を営業場面へ応用</div>
                    </div>
                    <div className="rounded-full border border-[#d7ad59]/35 px-2 py-1 text-[10px] font-black text-[#f5d486]">
                      論文ベース
                    </div>
                  </div>
                  <div className="mt-2 grid gap-1.5 sm:grid-cols-3">
                    {activation.references.map((reference) => (
                      <div key={reference.source} className="min-w-0 rounded-md border border-[#d7ad59]/20 bg-[#061727]/78 p-2">
                        <div className="flex min-h-5 items-start justify-between gap-1.5">
                          <div className="line-clamp-1 text-[10px] font-black leading-4 text-[#f5d486]">{reference.label}</div>
                          {reference.evidenceLevel ? (
                            <div className="shrink-0 rounded-full bg-[#d7ad59] px-1.5 py-0.5 text-[8px] font-black leading-3 text-[#04111d]">
                              {reference.evidenceLevel}
                            </div>
                          ) : null}
                        </div>
                        <div className="mt-1 line-clamp-1 text-[8px] font-black leading-3 text-[#fffaf0]">{reference.source}</div>
                        <div className="mt-1 line-clamp-1 text-[8px] font-bold leading-3 text-[#fff3d8]/72">
                          機関: {reference.university}
                        </div>
                        <div className="line-clamp-1 text-[8px] font-bold leading-3 text-[#fff3d8]/72">
                          研究者: {reference.researchers}
                        </div>
                        <div className="mt-1 line-clamp-2 text-[8px] font-bold leading-3 text-[#fff3d8]/78">
                          要旨: {reference.content}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>

            <div className="relative min-h-[450px] border-t border-[#d7ad59]/25 bg-[#020a10]/42 p-5 sm:p-6 lg:min-h-0 lg:border-l lg:border-t-0 lg:p-5">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_28%,rgba(245,212,134,0.18),transparent_20%)]" />
              <div className="relative mx-auto flex h-full max-w-[430px] flex-col items-center justify-center">
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#d7ad59]/45 bg-[#061727]/85 px-3 py-1.5 text-[12px] font-black text-[#f5d486]">
                  <span className="text-base">{activation.species.includes('竜') ? '竜' : '伴'}</span>
                  {activation.type}
                </div>
                <div className="relative w-full max-w-[334px] overflow-hidden rounded-lg border border-[#d7ad59]/55 bg-[#061727] p-2 shadow-[0_26px_80px_-38px_rgba(0,0,0,1)]">
                  <Image
                    src={activation.image}
                    alt={`${activation.species} ${activation.name}カード`}
                    width={392}
                    height={622}
                    priority
                    className="h-auto max-h-[56vh] w-full rounded-md object-contain"
                  />
                </div>
                <div className="mt-3 w-full max-w-[322px] rounded-lg border border-[#d7ad59]/35 bg-[#061727]/88 p-3">
                  <div className="text-[11px] font-black text-[#f5d486]">属性</div>
                  <div className="mt-1.5 text-[13px] font-black leading-5 text-[#fff3d8]">{activation.trait}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
