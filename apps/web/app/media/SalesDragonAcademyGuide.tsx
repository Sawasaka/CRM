'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'
import {
  ArrowRight,
  BookOpenCheck,
  Compass,
  GraduationCap,
  ScrollText,
  Sparkles,
  Swords,
  Target,
  UsersRound,
  X,
} from 'lucide-react'

const academyCardGridClass = 'mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3'
const academyPrepGridClass = 'mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4'
const academyCardClass =
  'group relative block aspect-[407/235] overflow-hidden rounded-lg border border-[#d7ad59]/28 bg-[#061727] text-left shadow-[0_16px_38px_-34px_rgba(6,23,39,0.9)] transition-transform hover:-translate-y-0.5'
const academyCardImageSizes = '(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw'

const featureCards = [
  {
    title: '育成ルール設計',
    label: '準備01',
    tag: '自走の観測',
    theme: '自走の竜を育てる',
    copy: '2〜5個のルールで動ける人材を育てる。',
    detailTitle: 'シンプルルールで人材育成',
    bullets: [
      'マニュアルを増やしすぎると指示待ちが増える',
      '間違ってはいけない手順だけをマニュアル化する',
      '2〜5個の具体ルールで自走の余白を残す',
      '上司が大事にしていることを自動で伝わる仕組みにする',
    ],
    icon: UsersRound,
    image: '/media/school/sales-dragon-academy-curriculum.png',
    modalImage: '/media/school/prep-self-running-dragon-modal.png',
  },
  {
    title: '半構造ルール設計',
    label: '準備02',
    tag: '竜舎の設計',
    theme: '竜舎の型を作る',
    copy: '放任と管理の間に、動ける型を置く。',
    detailTitle: '少数精鋭のルールで組織を動かす',
    bullets: [
      '境界・優先・停止・手順・調整・タイミングを設計する',
      '仕事のボトルネックごとに2〜5個のルールを置く',
      '状況ごとのif-thenで判断をショートカットする',
      '細かい規則ではなく行動に結びつく大枠を作る',
    ],
    icon: BookOpenCheck,
    image: '/media/school/prep-semi-structure-dragon-modal.png',
    imagePosition: 'object-[center_20%]',
    modalImage: '/media/school/prep-semi-structure-dragon-modal.png',
  },
  {
    title: '判断・停止・強調',
    label: '準備03',
    tag: '手綱の設計',
    theme: '手綱の合図を渡す',
    copy: '迷う場面ほど、判断と停止を明確にする。',
    detailTitle: '部下を自律させる3つの育成ルール',
    bullets: [
      '判断ルールで自己判断してよい範囲を決める',
      '停止ルールで完璧主義による遅延を止める',
      '報告は結論・次の24時間・助けが必要な点に絞る',
      '全員同じではなくボトルネックに合わせて適用する',
    ],
    icon: Compass,
    image: '/media/psychology/situation-internal-approval.png',
    modalImage: '/media/school/prep-reins-signal-dragon-modal.png',
  },
  {
    title: '違和感の結晶化',
    label: '準備04',
    tag: '錬金の観測',
    theme: '違和感を武器にする',
    copy: '現場の失敗から、次のルールを鍛える。',
    detailTitle: 'ルールを作り、試し、更新する',
    bullets: [
      '迷った瞬間・失敗した瞬間・うまくいった瞬間を集める',
      '共通する分岐点を言語化してif-thenにする',
      '関連性・因果・正当性を確認して定着させる',
      '3〜6ヶ月ごとに継続・改定・廃止で棚卸しする',
    ],
    icon: Swords,
    image: '/media/psychology/situation-price-objection.png',
    modalImage: '/media/school/prep-insight-forge-dragon-modal.png',
  },
]

const dragonTypes = [
  {
    title: '会議増殖の竜',
    tag: '委員会召喚',
    copy: '何でも会議に回し、時間を溶かす。',
    detailTitle: '何でも会議・委員会に回し、長く話す',
    bullets: [
      'すぐ決めず「検討委員会に回しましょう」とする',
      '委員会はできるだけ大人数にする',
      '重要な仕事があるタイミングで会議を開く',
      '長話・脱線・逸話で実行時間を削る',
    ],
    solution: '目的・決定者・終了条件を先に決め、会議を召喚しすぎない。',
    image: '/media/school/sales-dragon-academy-curriculum.png',
    modalImage: '/media/school/sabotage-meeting-dragon-modal.png',
  },
  {
    title: '稟議迷宮の竜',
    tag: '正式ルートの鎖',
    copy: '近道を封じ、承認の迷路へ送る。',
    detailTitle: '手続き・稟議・ルートを厳格に守らせる',
    bullets: [
      '例外対応や近道を認めない',
      'すべて正式な稟議ルートで進めさせる',
      '「上層部の判断が必要では」と止める',
      '責任と権限の所在確認で進行を遅らせる',
    ],
    solution: '例外条件と承認者を先に決め、正式ルートを速く通す。',
    image: '/media/school-v2/hero-night-academy.png',
    modalImage: '/media/school/sabotage-approval-maze-dragon-modal.png',
  },
  {
    title: '言葉尻の竜',
    tag: '細部修正の沼',
    copy: '本筋より、表現の鱗を磨き続ける。',
    detailTitle: '些細な言葉尻や文書表現にこだわる',
    bullets: [
      '議事録や文書の表現を細かく修正し続ける',
      '言葉のニュアンスや句読点にこだわる',
      '決議文の表現修正で会議を延長する',
      '本筋より文章の鱗を磨き続ける',
    ],
    solution: '文言修正は期限と担当を切り、先に意思決定の骨を決める。',
    image: '/media/psychology/situation-internal-approval.png',
    modalImage: '/media/school/sabotage-wording-dragon-modal.png',
  },
  {
    title: '蒸し返しの竜',
    tag: '再議論の霧',
    copy: '決まったことを戻し、前進を巻き戻す。',
    detailTitle: '過去に決まったことを蒸し返す',
    bullets: [
      '過去の決定を何度も再確認する',
      '重要な意思決定の場で枝葉の話を出す',
      '議論の入口へ戻して実行フェーズを遅らせる',
      '慎重に検討した結果、手遅れにする',
    ],
    solution: '再議論は新情報が出た時だけ。戻る条件を先に決める。',
    image: '/media/psychology/situation-no-decision.png',
    modalImage: '/media/school/sabotage-reopen-dragon-modal.png',
  },
  {
    title: '枝葉脱線の竜',
    tag: '本筋隠しの煙',
    copy: '重要な場面で、関係ない話を噴く。',
    detailTitle: '本筋と関係ない論点を持ち出す',
    bullets: [
      '重要な意思決定の場で枝葉の話を出す',
      '無関係な例外や昔話で論点をぼかす',
      '議論の熱量を本筋から外す',
      '決める会議を雑談の森に変える',
    ],
    solution: '論点・決定事項・保留箱を分け、本筋から外れない。',
    image: '/media/psychology/situation-price-objection.png',
    modalImage: '/media/school/sabotage-tangent-dragon-modal.png',
  },
  {
    title: '配置崩しの竜',
    tag: '逆采配の呪い',
    copy: '重要な仕事ほど、噛み合わない人に渡す。',
    detailTitle: '重要な仕事を非効率な人・設備に任せる',
    bullets: [
      '重要業務を能力不足の人に割り振る',
      '重要な設備や仕組みを非効率なまま使わせる',
      '優秀な人には重要でない仕事を振る',
      '誰も悪く見えないまま成果だけが落ちる',
    ],
    solution: '重要任務ほど、能力・経験・支援の3点で配置する。',
    image: '/media/psychology/situation-first-meeting.png',
    modalImage: '/media/school/sabotage-misassignment-dragon-modal.png',
  },
  {
    title: '過剰品質の竜',
    tag: '小物完璧主義',
    copy: '些細な仕事だけ、やたら完璧を求める。',
    detailTitle: '重要でない仕事だけ完璧を求める',
    bullets: [
      '重要でない成果物だけ細かくチェックする',
      '小さなミスの修正に大きな時間を使う',
      '重大な問題より見た目の整いを優先する',
      '完璧主義の顔で優先順位を壊す',
    ],
    solution: '品質基準を成果影響で分け、急所に時間を戻す。',
    image: '/media/school-v2/hero-night-academy.png',
    modalImage: '/media/school/sabotage-overquality-dragon-modal.png',
  },
  {
    title: '士気吸いの竜',
    tag: '逆評価の霧',
    copy: '優秀層を冷やし、非効率を褒める。',
    detailTitle: '優秀な人を冷遇し、非効率な人を優遇する',
    bullets: [
      '生産性の高い人に不当な批判をする',
      '非効率な人を褒めたり昇進させたりする',
      '頑張る人ほど報われない空気を作る',
      'チーム全体の士気をじわじわ下げる',
    ],
    solution: '評価は気分でなく貢献ログで見る。強い人を冷やさない。',
    image: '/media/psychology/situation-first-meeting.png',
    modalImage: '/media/school/sabotage-morale-drain-dragon-modal.png',
  },
  {
    title: '責任ぼやけの竜',
    tag: '権限確認の呪文',
    copy: '誰が決めるかを問い続け、速度を奪う。',
    detailTitle: '責任や権限の所在にこだわる',
    bullets: [
      '責任者や承認者の確認で進行を止める',
      '誰も決めていないのに全員確認済みになる',
      '権限外を理由にボールを戻す',
      '会議過多・承認過多・責任回避を連鎖させる',
    ],
    solution: '始める前に、決定者・相談先・期限を一枚に刻む。',
    image: '/media/school/sales-dragon-academy-curriculum.png',
    modalImage: '/media/school/sabotage-blurred-responsibility-dragon-modal.png',
  },
]

export default function SalesDragonAcademyGuide() {
  const [activePrep, setActivePrep] = useState<(typeof featureCards)[number] | null>(null)
  const [activeDragon, setActiveDragon] = useState<(typeof dragonTypes)[number] | null>(null)

  useEffect(() => {
    if (!activePrep && !activeDragon) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      setActivePrep(null)
      setActiveDragon(null)
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [activePrep, activeDragon])

  return (
    <main className="min-h-screen bg-[#061727] text-[#fff8e8]">
      <div className="relative mx-auto max-w-[1500px] overflow-hidden bg-[#061727] shadow-[0_0_0_1px_rgba(215,173,89,0.16)]">
        <section className="relative min-h-[auto] overflow-hidden border-b border-[#d7ad59]/25 lg:min-h-[660px]">
          <Image
            src="/media/school/sales-dragon-academy-hero.png"
            alt="はぐれ博士の営業竜学園"
            fill
            priority
            sizes="100vw"
            className="object-cover object-center opacity-80"
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(4,14,22,0.98)_0%,rgba(6,23,39,0.88)_33%,rgba(6,23,39,0.44)_66%,rgba(3,12,19,0.82)_100%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_24%,rgba(215,173,89,0.22),transparent_24%),radial-gradient(circle_at_80%_18%,rgba(107,198,217,0.18),transparent_18%)]" />

          <div className="relative z-10 grid min-h-[auto] gap-6 px-4 pb-8 pt-6 sm:px-8 sm:pb-10 sm:pt-8 lg:min-h-[660px] lg:grid-cols-[0.9fr_1.1fr] lg:px-12">
            <div className="flex flex-col justify-center">
              <div className="mb-5 inline-flex w-fit max-w-full items-center gap-3 rounded-md border border-[#d7ad59]/35 bg-[#07111a]/78 px-3 py-2 text-[12px] font-black leading-5 text-[#fff3d8] shadow-[0_14px_28px_-26px_rgba(0,0,0,0.9)] backdrop-blur-sm sm:mb-7 sm:px-4 sm:text-[13px]">
                <span className="h-1.5 w-7 shrink-0 rounded-full bg-[#d7ad59] sm:w-9" />
                営業組織のモヤモヤを、学園カリキュラムに変換する。
              </div>

              <h1 className="font-display text-[2.45rem] font-black leading-[1.05] text-[#fffaf0] drop-shadow-[0_16px_34px_rgba(0,0,0,0.8)] min-[390px]:text-[2.75rem] sm:text-[4rem] lg:text-[4.55rem]">
                <span className="block">はぐれ博士の</span>
                <span className="block text-[#f2cb77]">営業竜学園</span>
              </h1>

              <p className="mt-4 max-w-[690px] text-sm font-black leading-7 text-[#fff3d8] drop-shadow-[0_8px_22px_rgba(0,0,0,0.72)] sm:mt-5 sm:text-lg sm:leading-8 lg:whitespace-nowrap">
                営業組織に潜む竜を見抜き、向き合い方を学ぶ。
              </p>

              <div className="mt-6 grid gap-3 sm:mt-8 sm:grid-cols-2">
                <a
                  href="#academy-diagnosis"
                  className="inline-flex h-14 items-center justify-center gap-3 rounded-lg border-2 border-[#d7ad59] bg-[#061727] px-5 text-sm font-black text-[#f5d486] shadow-[0_18px_40px_-26px_rgba(6,23,39,0.8)] transition-transform hover:-translate-y-0.5 sm:h-16 sm:px-7 sm:text-base"
                >
                  <GraduationCap size={22} />
                  標準準備を見る
                  <ArrowRight size={20} />
                </a>
                <a
                  href="#academy-diagnosis"
                  className="inline-flex h-14 items-center justify-center gap-3 rounded-lg border-2 border-[#d7ad59]/45 bg-[#07111a]/82 px-5 text-sm font-black text-[#fff3d8] shadow-[0_18px_40px_-30px_rgba(0,0,0,0.9)] transition-colors hover:bg-[#102334] sm:h-16 sm:px-7 sm:text-base"
                >
                  <Target size={22} />
                  竜タイプ診断を見る
                  <ArrowRight size={18} />
                </a>
              </div>

              <div className="mt-6 max-w-[610px] rounded-lg border border-[#d7ad59]/38 bg-[#061727]/82 p-4 shadow-[0_20px_48px_-34px_rgba(0,0,0,0.95)] backdrop-blur-sm">
                <div className="flex items-center gap-2 text-lg font-black text-[#f5d486]">
                  <ScrollText size={20} />
                  はぐれ博士の入学案内
                </div>
                <p className="mt-3 text-[13px] font-bold leading-7 text-[#fff3d8]">
                  ここでは営業組織の問題を、むずかしい理論ではなく「竜」として観測し、扱い方を考える。
                </p>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {['診断する', '性質を読む', '処方を考える', '必修科目に残す'].map((item) => (
                    <div key={item} className="flex items-center gap-2 text-[13px] font-black text-[#ffe8ec]">
                      <Sparkles size={15} className="text-[#d7ad59]" />
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="hidden lg:block" aria-hidden="true" />
          </div>
        </section>

        <section id="academy-diagnosis" className="relative border-b border-[#d7ad59]/20 px-4 py-10 sm:px-8 lg:px-12">
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(245,212,134,0.04)_1px,transparent_1px),linear-gradient(rgba(245,212,134,0.035)_1px,transparent_1px)] bg-[length:44px_44px]" />
          <div className="relative mx-auto max-w-[1370px]">
            <SectionTitle eyebrow="出陣前の標準準備" title="営業竜が飛び立つ前に、育成ルール・半構造・手綱・更新を整える" />
            <div className={academyPrepGridClass}>
              {featureCards.map((card) => (
                <AcademyPrepCard
                  key={card.title}
                  card={card}
                  onSelect={() => setActivePrep(card)}
                />
              ))}
            </div>

            <div className="mt-8 border-t border-[#d7ad59]/22 pt-5">
              <SectionTitle eyebrow="無自覚サボタージュ竜" title="組織崩壊の前兆として現れる、営業組織あるある竜を見つける" />
              <div className={academyCardGridClass}>
                {dragonTypes.map((dragon) => (
                  <OrgProblemDragonCard
                    key={dragon.title}
                    dragon={dragon}
                    onSelect={() => setActiveDragon(dragon)}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

      </div>
      {activePrep ? <AcademyPrepModal card={activePrep} onClose={() => setActivePrep(null)} /> : null}
      {activeDragon ? <SabotageDragonModal dragon={activeDragon} onClose={() => setActiveDragon(null)} /> : null}
    </main>
  )
}

function SectionTitle({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="flex min-w-0 flex-col gap-1 sm:flex-row sm:items-baseline sm:gap-3">
      <div className="text-xl font-black text-[#fff3d8]">› {eyebrow}</div>
      <div className="min-w-0 text-[13px] font-bold text-[#f5d486]/75">{title}</div>
    </div>
  )
}

function AcademyPrepCard({
  card,
  onSelect,
}: {
  card: {
    title: string
    label: string
    tag: string
    theme: string
    copy: string
    image: string
    imagePosition?: string
    icon: typeof UsersRound
  }
  onSelect: () => void
}) {
  const Icon = card.icon

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`${academyCardClass} focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f5d486]`}
    >
      <Image
        src={card.image}
        alt={`${card.title}の標準装備カード`}
        fill
        sizes={academyCardImageSizes}
        className={`object-cover opacity-88 transition-transform duration-300 group-hover:scale-[1.025] ${card.imagePosition ?? 'object-center'}`}
      />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(5,17,27,0.14),rgba(5,17,27,0.34)_36%,rgba(5,17,27,0.90))]" />
      <div className="absolute left-3 top-3 inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[#d7ad59]/45 bg-[#061727]/86 text-[#f5d486] backdrop-blur-sm">
        <Icon size={19} />
      </div>
      <div className="absolute right-3 top-3 rounded-full bg-[#d7ad59] px-2.5 py-1 text-[11px] font-black text-[#07111a]">
        {card.label}
      </div>
      <div className="absolute inset-x-0 bottom-0 p-4 text-right">
        <div className="ml-auto w-fit rounded-full border border-[#6bc6d9]/35 bg-[#6bc6d9]/12 px-2.5 py-1 text-[11px] font-black text-[#bfefff]">
          {card.tag}
        </div>
        <h2 className="mt-2 font-display text-2xl font-black leading-tight text-white">{card.theme}</h2>
        <p className="ml-auto mt-1 max-w-[250px] truncate whitespace-nowrap text-[12px] font-bold leading-5 text-[#fff3f5]">
          {card.copy}
        </p>
      </div>
    </button>
  )
}

function OrgProblemDragonCard({
  dragon,
  onSelect,
}: {
  dragon: {
    title: string
    tag: string
    copy: string
    image: string
  }
  onSelect: () => void
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`${academyCardClass} focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f5d486]`}
    >
      <Image
        src={dragon.image}
        alt={`${dragon.title}のあるあるカード`}
        fill
        sizes={academyCardImageSizes}
        className="object-cover opacity-86 transition-transform duration-300 group-hover:scale-[1.025]"
      />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(5,17,27,0.10),rgba(5,17,27,0.34)_32%,rgba(5,17,27,0.90))]" />
      <div className="absolute right-3 top-3 rounded-full border border-[#6bc6d9]/45 bg-[#6bc6d9]/16 px-2.5 py-1 text-[11px] font-black text-[#bfefff] backdrop-blur-sm">
        {dragon.tag}
      </div>
      <div className="absolute inset-x-0 bottom-0 p-4 text-right">
        <h3 className="font-display text-2xl font-black leading-tight text-white">{dragon.title}</h3>
        <p className="ml-auto mt-1 max-w-[280px] truncate whitespace-nowrap text-[12px] font-bold leading-5 text-[#fff3f5]">
          {dragon.copy}
        </p>
      </div>
    </button>
  )
}

function AcademyPrepModal({ card, onClose }: { card: (typeof featureCards)[number]; onClose: () => void }) {
  const modalImage = 'modalImage' in card ? card.modalImage : undefined
  const imageSrc = modalImage ?? card.image

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-[#020a10]/78 px-4 py-5 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="academy-prep-modal-title"
      onClick={onClose}
    >
      <div
        className="relative grid max-h-[92vh] w-full max-w-5xl overflow-y-auto overflow-x-hidden rounded-lg border border-[#d7ad59]/45 bg-[#061727] shadow-[0_32px_90px_-34px_rgba(0,0,0,0.95)] md:grid-cols-[0.82fr_1.18fr]"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 z-20 inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#d7ad59]/35 bg-[#061727]/82 text-[#fff3d8] backdrop-blur-sm transition-colors hover:bg-[#102334]"
          aria-label="閉じる"
        >
          <X size={18} />
        </button>
        <div className="relative flex min-h-[420px] flex-col justify-between bg-[#030b12] sm:min-h-[460px] md:min-h-[520px]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_45%_34%,rgba(107,198,217,0.18),transparent_35%),linear-gradient(180deg,rgba(5,17,27,0.96),rgba(5,17,27,0.72))]" />
          <Image
            src={imageSrc}
            alt={`${card.title}の詳細カード`}
            fill
            sizes="(min-width: 768px) 40vw, 100vw"
            className="object-cover object-center opacity-95"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,17,27,0.04),rgba(5,17,27,0.16)_42%,rgba(5,17,27,0.96))]" />
          <div className="relative mt-auto p-5">
            <div className="w-fit rounded-full bg-[#d7ad59] px-3 py-1 text-[11px] font-black text-[#07111a]">{card.label}</div>
            <h2 className="mt-3 font-display text-4xl font-black leading-tight text-white drop-shadow-[0_10px_26px_rgba(0,0,0,0.9)]">
              {card.theme}
            </h2>
            <p className="mt-2 text-[13px] font-black text-[#fff3d8]">{card.copy}</p>
          </div>
        </div>
        <div className="relative flex items-center p-5 sm:p-7">
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(245,212,134,0.04)_1px,transparent_1px),linear-gradient(rgba(245,212,134,0.035)_1px,transparent_1px)] bg-[length:34px_34px]" />
          <div className="relative w-full">
            <div className="w-fit rounded-full border border-[#6bc6d9]/45 bg-[#6bc6d9]/14 px-3 py-1 text-[11px] font-black text-[#bfefff]">
              はぐれ博士の出陣カード / {card.tag}
            </div>
            <h3 id="academy-prep-modal-title" className="mt-4 font-display text-3xl font-black leading-tight text-[#fff3d8] sm:text-4xl">
              {card.detailTitle}
            </h3>
            <div className="mt-7 grid gap-3">
              {card.bullets.map((bullet, index) => (
                <div key={bullet} className="flex items-start gap-3 rounded-md border border-[#d7ad59]/20 bg-[#07111a]/76 px-3 py-3">
                  <span className="mt-0.5 rounded-full bg-[#d7ad59] px-2.5 py-0.5 text-[10px] font-black text-[#07111a]">
                    ポイント{index + 1}
                  </span>
                  <span className="text-[13px] font-bold leading-6 text-[#fff3f5]">{bullet}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function SabotageDragonModal({ dragon, onClose }: { dragon: (typeof dragonTypes)[number]; onClose: () => void }) {
  const imageSrc = dragon.modalImage ?? dragon.image

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-[#020a10]/78 px-4 py-5 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="sabotage-modal-title"
      onClick={onClose}
    >
      <div
        className="relative grid max-h-[92vh] w-full max-w-5xl overflow-y-auto overflow-x-hidden rounded-lg border border-[#d7ad59]/45 bg-[#061727] shadow-[0_32px_90px_-34px_rgba(0,0,0,0.95)] md:grid-cols-[0.9fr_1.1fr]"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 z-20 inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#d7ad59]/35 bg-[#061727]/82 text-[#fff3d8] backdrop-blur-sm transition-colors hover:bg-[#102334]"
          aria-label="閉じる"
        >
          <X size={18} />
        </button>
        <div className="relative flex min-h-[420px] flex-col justify-between bg-[#030b12] sm:min-h-[460px] md:min-h-[520px]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_48%_28%,rgba(215,173,89,0.18),transparent_34%),linear-gradient(180deg,rgba(5,17,27,0.96),rgba(5,17,27,0.74))]" />
          <div className="absolute left-4 top-4 z-10 rounded-full border border-[#6bc6d9]/45 bg-[#6bc6d9]/16 px-3 py-1 text-[11px] font-black text-[#bfefff] backdrop-blur-sm">
            {dragon.tag}
          </div>
          <Image
            src={imageSrc}
            alt={`${dragon.title}の詳細カード`}
            fill
            sizes="(min-width: 768px) 42vw, 100vw"
            className="object-cover object-center opacity-95"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,17,27,0.10),rgba(5,17,27,0.20)_42%,rgba(5,17,27,0.96))]" />
          <div className="relative mt-auto p-5 text-right">
            <p className="text-[12px] font-black text-[#f5d486]">大企業病を召喚する古文書の竜</p>
            <h2 className="mt-2 font-display text-4xl font-black leading-tight text-white drop-shadow-[0_10px_26px_rgba(0,0,0,0.9)]">
              {dragon.title}
            </h2>
            <p className="mt-2 text-[13px] font-black text-[#fff3d8]">{dragon.copy}</p>
          </div>
        </div>
        <div className="relative flex items-center p-5 sm:p-7">
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(245,212,134,0.04)_1px,transparent_1px),linear-gradient(rgba(245,212,134,0.035)_1px,transparent_1px)] bg-[length:34px_34px]" />
          <div className="relative w-full">
            <div className="w-fit rounded-full bg-[#d7ad59] px-3 py-1 text-[11px] font-black text-[#07111a]">
              Simple Sabotage Field Manual 由来
            </div>
            <h3 id="sabotage-modal-title" className="mt-4 font-display text-3xl font-black leading-tight text-[#fff3d8] sm:text-4xl">
              {dragon.detailTitle}
            </h3>
            <div className="mt-7 grid gap-3">
              {dragon.bullets.map((bullet, index) => (
                <div key={bullet} className="flex items-start gap-3 rounded-md border border-[#d7ad59]/20 bg-[#07111a]/76 px-3 py-3">
                  <span className="mt-0.5 rounded-full bg-[#d7ad59] px-2.5 py-0.5 text-[10px] font-black text-[#07111a]">
                    要注意{index + 1}
                  </span>
                  <span className="text-[13px] font-bold leading-6 text-[#fff3f5]">{bullet}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 flex min-w-0 items-center rounded-md border border-[#d7ad59]/24 bg-[#d7ad59]/10 px-3 py-2.5 text-[11px] font-black leading-5 text-[#f5d486]">
              <span className="mr-2 inline-flex shrink-0 rounded-full bg-[#d7ad59] px-2.5 py-0.5 text-[10px] font-black leading-5 text-[#07111a]">
                解決策
              </span>
              <span className="min-w-0 whitespace-nowrap">{dragon.solution}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
