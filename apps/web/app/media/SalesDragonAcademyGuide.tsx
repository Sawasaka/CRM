'use client'

import Image from 'next/image'
import {
  ArrowRight,
  BookOpenCheck,
  Compass,
  GraduationCap,
  Lightbulb,
  ScrollText,
  ShieldCheck,
  Sparkles,
  Swords,
  Target,
  UsersRound,
} from 'lucide-react'

const academyCardGridClass = 'mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3'
const academyPrepGridClass = 'mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4'
const academyCardClass =
  'group relative block aspect-[407/235] overflow-hidden rounded-lg border border-[#d7ad59]/28 bg-[#061727] text-left shadow-[0_16px_38px_-34px_rgba(6,23,39,0.9)] transition-transform hover:-translate-y-0.5'
const academyCardImageSizes = '(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw'

const featureCards = [
  {
    title: '組織分析',
    label: '隊列01',
    theme: '竜の隊列を組む',
    copy: '前衛・支援・斥候の陣形を整える。',
    icon: UsersRound,
    image: '/media/school/sales-dragon-academy-curriculum.png',
  },
  {
    title: 'サービス分析',
    label: '武器02',
    theme: '武器の癖を読む',
    copy: '誰に刺さる剣か、強みと重さを読む。',
    icon: BookOpenCheck,
    image: '/media/psychology/weapon-framing.png',
  },
  {
    title: '市場分析',
    label: '世界03',
    theme: 'フィールドを読む',
    copy: '営業竜が飛べる谷を探す。',
    icon: Compass,
    image: '/media/psychology/situation-internal-approval.png',
  },
  {
    title: '競合分析',
    label: '敵影04',
    theme: '敵影を見破る',
    copy: '相手の鎧・盾・弱点を読む。',
    icon: Swords,
    image: '/media/psychology/situation-price-objection.png',
  },
]

const dragonTypes = [
  {
    title: '属人化の竜',
    tag: '技能封印の霧',
    copy: '型を渡さず、ズレた情報だけ増える。',
    image: '/media/school/sales-dragon-academy-curriculum.png',
  },
  {
    title: '詰め文化の竜',
    tag: '過剰確認の圧',
    copy: '報告が厚くなり、挑戦が防御に変わる。',
    image: '/media/school-v2/hero-night-academy.png',
  },
  {
    title: '稟議停滞の竜',
    tag: '慎重検討の迷宮',
    copy: '慎重な確認ほど、商機が干上がる。',
    image: '/media/psychology/situation-internal-approval.png',
  },
  {
    title: '会議増殖の竜',
    tag: '検討会議の群れ',
    copy: '会議が増え、次の一手だけ消える。',
    image: '/media/psychology/situation-no-decision.png',
  },
  {
    title: '新人放置の竜',
    tag: '不完全指示の沼',
    copy: '基準を渡さず、迷宮へ放流する。',
    image: '/media/psychology/situation-first-meeting.png',
  },
  {
    title: '責任ぼやけの竜',
    tag: '決定遅延の呪文',
    copy: '誰も決めず、速度だけ溶けていく。',
    image: '/media/school/sales-dragon-academy-curriculum.png',
  },
]

const curriculum = [
  {
    title: '役割迷子の竜',
    subtitle: '誰が何を守るか、竜舎の境界線を引く。',
    badge: '竜舎',
    icon: UsersRound,
    image: '/media/school/sales-dragon-academy-curriculum.png',
    lessons: ['役割の巣を分ける', '支援ラインを見える化する', '暗黙知の卵を回収する'],
    memo: '博士メモ: 巣が曖昧だと責任も支援も煙になる。',
  },
  {
    title: '戦場迷子の竜',
    subtitle: 'どの谷で戦うか、市場と顧客の地形を読む。',
    badge: '地図',
    icon: Compass,
    image: '/media/psychology/situation-internal-approval.png',
    lessons: ['ターゲットの羅針盤を読む', '勝てる谷を見分ける', '価格抵抗の火種を消す'],
    memo: '博士メモ: 強い竜でも飛ぶ谷を間違えると勝てない。',
  },
  {
    title: '初回商談で暴れる竜',
    subtitle: '最初の乗り方を間違えると商談は暴れる。',
    badge: '騎乗',
    icon: Sparkles,
    image: '/media/school/sales-ryu-gakuen-classroom.png',
    lessons: ['入口の作法を整える', 'ヒアリング沼から抜ける', '追客の風向きを読む'],
    memo: '博士メモ: 最初の一言で竜は味方にも乱気流にもなる。',
  },
  {
    title: '詰めても動かない竜',
    subtitle: '強く引くほど止まる。摩擦の熱源を読む。',
    badge: '調教',
    icon: ShieldCheck,
    image: '/media/school-v2/hero-night-academy.png',
    lessons: ['詰め圧を鎮める', '会議迷宮に出口を作る', '新人竜の孵化を見守る'],
    memo: '博士メモ: 手綱を引く前に竜が止まる理由を見る。',
  },
  {
    title: '失注を灰にする竜',
    subtitle: '負けた理由を捨てると次の武器まで燃える。',
    badge: '錬金',
    icon: Lightbulb,
    image: '/media/school/sales-dragon-academy-hero.png',
    lessons: ['顧客の声を結晶にする', '失注ログから武器を作る', 'プロダクトの鱗を磨く'],
    memo: '博士メモ: 失注の灰は次の武器の素材になる。',
  },
]

export default function SalesDragonAcademyGuide() {
  return (
    <main className="min-h-screen bg-[#061727] text-[#fff8e8]">
      <div className="relative mx-auto max-w-[1500px] overflow-hidden bg-[#061727] shadow-[0_0_0_1px_rgba(215,173,89,0.16)]">
        <section className="relative min-h-[660px] overflow-hidden border-b border-[#d7ad59]/25">
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

          <div className="relative z-10 grid min-h-[660px] gap-8 px-4 pb-10 pt-8 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:px-12">
            <div className="flex flex-col justify-center">
              <div className="mb-7 inline-flex w-fit items-center gap-3 rounded-md border border-[#d7ad59]/35 bg-[#07111a]/78 px-4 py-2 text-[13px] font-black text-[#fff3d8] shadow-[0_14px_28px_-26px_rgba(0,0,0,0.9)] backdrop-blur-sm">
                <span className="h-1.5 w-9 rounded-full bg-[#d7ad59]" />
                営業組織のモヤモヤを、学園カリキュラムに変換する。
              </div>

              <h1 className="font-display text-[2.75rem] font-black leading-[1.04] text-[#fffaf0] drop-shadow-[0_16px_34px_rgba(0,0,0,0.8)] sm:text-[4rem] lg:text-[4.55rem]">
                <span className="block">はぐれ博士の</span>
                <span className="block text-[#f2cb77]">営業竜学園</span>
              </h1>

              <p className="mt-5 max-w-[690px] text-base font-black leading-8 text-[#fff3d8] drop-shadow-[0_8px_22px_rgba(0,0,0,0.72)] sm:text-lg lg:whitespace-nowrap">
                営業組織に潜む竜を見抜き、向き合い方を学ぶ。
              </p>

              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <a
                  href="#academy-curriculum"
                  className="inline-flex h-16 items-center justify-center gap-3 rounded-lg border-2 border-[#d7ad59] bg-[#061727] px-7 text-base font-black text-[#f5d486] shadow-[0_18px_40px_-26px_rgba(6,23,39,0.8)] transition-transform hover:-translate-y-0.5"
                >
                  <GraduationCap size={22} />
                  カリキュラムを見る
                  <ArrowRight size={20} />
                </a>
                <a
                  href="#academy-diagnosis"
                  className="inline-flex h-16 items-center justify-center gap-3 rounded-lg border-2 border-[#d7ad59]/45 bg-[#07111a]/82 px-7 text-base font-black text-[#fff3d8] shadow-[0_18px_40px_-30px_rgba(0,0,0,0.9)] transition-colors hover:bg-[#102334]"
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
            <SectionTitle eyebrow="出陣前の標準装備" title="営業竜が飛び立つ前に、隊列・武器・地形・敵影をそろえる" />
            <div className={academyPrepGridClass}>
              {featureCards.map((card) => (
                <AcademyPrepCard key={card.title} card={card} />
              ))}
            </div>

            <div className="mt-8 border-t border-[#d7ad59]/22 pt-5">
              <SectionTitle eyebrow="無自覚サボタージュ竜" title="組織崩壊の前兆として現れる、営業組織あるある竜を見つける" />
              <div className={academyCardGridClass}>
                {dragonTypes.map((dragon) => (
                  <OrgProblemDragonCard key={dragon.title} dragon={dragon} />
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="academy-curriculum" className="px-4 py-10 sm:px-8 lg:px-12">
          <div className="mx-auto max-w-[1370px]">
            <SectionTitle eyebrow="状況別カリキュラム" title="出てきた竜に合わせて、扱い方を選ぶ" />
            <div className={academyCardGridClass}>
              {curriculum.map((course) => (
                <AcademyCourseCard key={course.title} course={course} />
              ))}
            </div>
          </div>
        </section>
      </div>
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
}: {
  card: {
    title: string
    label: string
    theme: string
    copy: string
    image: string
    icon: typeof UsersRound
  }
}) {
  const Icon = card.icon

  return (
    <article className={academyCardClass}>
      <Image
        src={card.image}
        alt={`${card.title}の標準装備カード`}
        fill
        sizes={academyCardImageSizes}
        className="object-cover opacity-88 transition-transform duration-300 group-hover:scale-[1.025]"
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
          {card.title.replace('分析', 'の観測')}
        </div>
        <h2 className="mt-2 font-display text-2xl font-black leading-tight text-white">{card.theme}</h2>
        <p className="ml-auto mt-1 max-w-[250px] truncate whitespace-nowrap text-[12px] font-bold leading-5 text-[#fff3f5]">
          {card.copy}
        </p>
      </div>
    </article>
  )
}

function OrgProblemDragonCard({
  dragon,
}: {
  dragon: {
    title: string
    tag: string
    copy: string
    image: string
  }
}) {
  return (
    <article className={academyCardClass}>
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
    </article>
  )
}

function AcademyCourseCard({
  course,
}: {
  course: {
    title: string
    subtitle: string
    badge: string
    image: string
    memo: string
    icon: typeof UsersRound
  }
}) {
  const Icon = course.icon

  return (
    <article className={academyCardClass}>
      <Image
        src={course.image}
        alt={`${course.title}の営業竜学園カード`}
        fill
        sizes={academyCardImageSizes}
        className="object-cover opacity-88 transition-transform duration-300 group-hover:scale-[1.025]"
      />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(5,17,27,0.08),rgba(5,17,27,0.36)_36%,rgba(5,17,27,0.92))]" />
      <div className="absolute left-3 top-3 inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[#d7ad59]/45 bg-[#061727]/86 text-[#f5d486] backdrop-blur-sm">
        <Icon size={19} />
      </div>
      <div className="absolute right-3 top-3 rounded-full bg-[#d7ad59] px-2.5 py-1 text-[11px] font-black text-[#07111a]">
        {course.badge}
      </div>
      <div className="absolute inset-x-0 bottom-0 p-4 text-right">
        <h3 className="font-display text-2xl font-black leading-tight text-white">{course.title}</h3>
        <p className="ml-auto mt-1 max-w-[300px] truncate whitespace-nowrap text-[13px] font-black leading-5 text-[#f5d486]">
          {course.subtitle}
        </p>
        <p className="ml-auto mt-3 max-w-[330px] truncate whitespace-nowrap text-[12px] font-bold leading-6 text-[#fff3d8]/82">
          {course.memo}
        </p>
      </div>
    </article>
  )
}
