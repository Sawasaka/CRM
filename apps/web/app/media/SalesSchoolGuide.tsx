'use client'

import Image from 'next/image'
import Link from 'next/link'
import type { ReactNode } from 'react'
import {
  ArrowRight,
  Award,
  BookOpen,
  BrainCircuit,
  MessageCircle,
  ScrollText,
  ShieldCheck,
  Sparkles,
  Swords,
  Target,
  Trophy,
  UsersRound,
} from 'lucide-react'

const navLinks = [
  { label: '講義室', href: '#school-classroom', icon: BookOpen },
  { label: '人気講義', href: '#school-lectures', icon: Sparkles },
  { label: '今週の課題', href: '#school-assignments', icon: Target },
  { label: '図書館', href: '#school-notes', icon: ScrollText },
  { label: '認定ノート', href: '#school-status', icon: ShieldCheck },
  { label: 'はぐれ博士', href: '#school-professor', icon: BrainCircuit },
]

const lectures = [
  {
    title: '法人営業あるある',
    label: '講義 01',
    copy: '現場で起きる謎の習慣を、博士が黒板で分解する。',
    image: '/media/cards/series-aruaru.png',
    accent: '#7dd9b5',
  },
  {
    title: '失注大学',
    label: '講義 02',
    copy: '負け筋の奥にある構造を、言い訳ごと解剖する。',
    image: '/media/cards/series-lost-univ.png',
    accent: '#d89f4a',
  },
  {
    title: '新卒営業サバイバル',
    label: '講義 03',
    copy: '最初につまずく壁を、責めずに生存技術へ変える。',
    image: '/media/cards/series-rookie.png',
    accent: '#8eb7ff',
  },
  {
    title: '成約馴れ初め予備校',
    label: '講義 04',
    copy: '成約までの会話と空気を、物語として読み解く。',
    image: '/media/cards/series-nare-some.png',
    accent: '#f0c36a',
  },
]

const assignments = [
  {
    title: '価格抵抗',
    theme: '「高い」の正体を4つに分ける',
    copy: '予算、不安、優先度、社内説明。ひとつの反論に見えるものを魔法陣のように分解する。',
    icon: Target,
    accent: '#d89f4a',
  },
  {
    title: '稟議停滞',
    theme: '止まった案件の摩擦を探す',
    copy: '担当者が社内で説明できない理由を、決裁者だけでなく関係者の地図から観測する。',
    icon: UsersRound,
    accent: '#7dd9b5',
  },
  {
    title: '商談会議',
    theme: '会議で増えるノイズを減らす',
    copy: '事実、仮説、感想を分けるだけで、次に打つ一手が見えやすくなる。',
    icon: MessageCircle,
    accent: '#8eb7ff',
  },
  {
    title: 'CRM入力されない問題',
    theme: '入力不足を根性論で片付けない',
    copy: '営業が入力したくない理由を、設計と心理の両方から見直す。',
    icon: BrainCircuit,
    accent: '#e8b35f',
  },
]

const notes = [
  {
    title: '法人営業とは？',
    source: '入門講義',
    copy: '成果を出す人の思考回路を、現場の言葉で整理する。',
    image: '/media/cards/article-sales.png',
  },
  {
    title: 'CRMが入力されない理由',
    source: '観察ノート',
    copy: '「時間がない」以外に潜む、営業現場の本当の摩擦を読む。',
    image: '/media/cards/article-crm.png',
  },
  {
    title: '失注理由が価格になる会社',
    source: '失注講義',
    copy: '価格を理由にしてしまう組織の共通パターンを見抜く。',
    image: '/media/cards/article-price.png',
  },
]

const professorChecks = ['違和感を教材化', '失注メモを分解', '商談ログを読解', '明日の一手へ翻訳']
const earnedBadges = ['観察眼', '仮説力', '商談設計']
const academySteps = ['観察', '分解', '仮説', '一手']

export default function SalesSchoolGuide() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-[#07130f] text-[#f3e4c3]">
      <div className="relative mx-auto max-w-[1500px] overflow-hidden bg-[#07130f] shadow-[0_0_0_1px_rgba(216,159,74,0.18)]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_16%,rgba(125,217,181,0.18),transparent_24%),radial-gradient(circle_at_80%_18%,rgba(216,159,74,0.16),transparent_26%),linear-gradient(90deg,rgba(243,228,195,0.045)_1px,transparent_1px),linear-gradient(rgba(243,228,195,0.035)_1px,transparent_1px)] bg-[length:auto,auto,46px_46px,46px_46px]" />

        <aside className="absolute bottom-0 left-0 top-0 hidden w-[60px] bg-[#04100c] md:block">
          <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(135deg,rgba(243,228,195,0.08)_1px,transparent_1px)] [background-size:12px_12px]" />
          <div className="sticky top-[94px] mx-auto mt-9 flex h-[356px] w-10 flex-col items-center gap-3 rounded-lg border border-[#d89f4a]/45 bg-[#10251e] px-2 py-4 text-[#f0c36a]">
            <span className="text-2xl font-black leading-none">学</span>
            <span className="text-[12px] font-black leading-5" style={{ writingMode: 'vertical-rl' }}>
              夜の黒板で、勝ち筋を読む。
            </span>
          </div>
        </aside>

        <section id="school-classroom" className="relative overflow-hidden border-b border-[#d89f4a]/25 pl-0 md:pl-[60px]">
          <div className="absolute inset-0 bg-[linear-gradient(115deg,rgba(7,19,15,0.96),rgba(10,39,31,0.9)_46%,rgba(3,11,9,0.98))]" />
          <div className="absolute inset-y-0 right-0 hidden w-[64%] overflow-hidden opacity-70 lg:block">
            <Image
              src="/media/school-v2/hero-night-academy.png"
              alt="夜の営業魔法学校で講義するはぐれ博士"
              fill
              priority
              sizes="(min-width: 1024px) 64vw, 100vw"
              className="object-cover object-center"
            />
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(7,19,15,0.98),rgba(7,19,15,0.42)_45%,rgba(7,19,15,0.28)),linear-gradient(180deg,rgba(7,19,15,0.1),rgba(7,19,15,0.86))]" />
          </div>
          <div className="absolute left-[34%] top-8 hidden text-[17rem] font-black leading-none text-[#d89f4a]/[0.055] lg:block">
            学
          </div>

          <div className="relative px-4 pb-0 pt-8 sm:px-8 lg:px-12 lg:pt-9">
            <div className="mx-auto mb-5 flex max-w-[1370px] flex-col gap-4 border-b border-[#d89f4a]/25 pb-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex min-w-0 items-center gap-4">
                <div className="grid h-20 w-20 shrink-0 place-items-center rounded-lg border border-[#d89f4a]/55 bg-[#10251e] text-[#f0c36a] shadow-[inset_0_0_0_1px_rgba(243,228,195,0.08),0_18px_40px_-30px_rgba(0,0,0,0.9)]">
                  <span className="text-[2.7rem] font-black leading-none">学</span>
                </div>
                <div className="min-w-0">
                  <div className="font-display text-3xl font-black leading-tight text-[#f0c36a] sm:text-4xl">
                    営業スクール
                  </div>
                  <p className="mt-1 text-[12px] font-black text-[#f3e4c3]/86">
                    売れる営業は、学び続ける冒険者だ。
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] font-black text-[#f3e4c3] sm:grid-cols-3 xl:grid-cols-6">
                {navLinks.map((item) => {
                  const Icon = item.icon
                  return (
                    <a
                      key={item.label}
                      href={item.href}
                      className="inline-flex h-10 min-w-0 items-center justify-center gap-2 rounded-md border border-[#d89f4a]/25 bg-[#0b211a]/74 px-3 hover:border-[#7dd9b5]/60"
                    >
                      <Icon size={15} className="shrink-0 text-[#d89f4a]" />
                      <span className="truncate">{item.label}</span>
                    </a>
                  )
                })}
              </div>
            </div>

            <div className="mx-auto grid min-h-[600px] max-w-[1370px] gap-6 lg:grid-cols-[1.02fr_0.98fr]">
              <div className="relative z-10 flex flex-col justify-center pb-8 lg:pb-10">
                <div className="mb-7 inline-flex max-w-full overflow-hidden rounded-md border border-[#d89f4a]/35 bg-[#04100c]/78 text-[13px] font-black text-[#f3e4c3] shadow-[0_14px_28px_-26px_rgba(0,0,0,0.9)] backdrop-blur-sm">
                  <span className="shrink-0 bg-[#d89f4a] px-4 py-2 text-[#07130f]">はぐれ博士の夜間講義</span>
                  <span className="truncate px-4 py-2">CRMに眠る勝ち筋を、黒板で解読する</span>
                </div>

                <h1 className="font-display text-[2.65rem] font-black leading-[1.04] text-[#fff7df] drop-shadow-[0_12px_34px_rgba(0,0,0,0.75)] sm:text-[4rem] lg:text-[4.25rem] xl:text-[4.8rem]">
                  <span className="sm:whitespace-nowrap">学べ、使え、勝て。</span>
                  <span className="block text-[#f0c36a] sm:whitespace-nowrap">営業スクール開校</span>
                </h1>

                <p className="mt-5 max-w-[720px] text-base font-black leading-8 text-[#f3e4c3] drop-shadow-[0_8px_22px_rgba(0,0,0,0.7)] sm:text-lg">
                  売れる営業は、学び続ける冒険者だ。商談・失注・稟議・会議・CRMのモヤモヤを、明日使える講義ノートに変える。
                </p>

                <div className="mt-6 flex flex-col gap-4 sm:flex-row">
                  <a
                    href="#school-lectures"
                    className="inline-flex h-16 items-center justify-center gap-3 rounded-lg border-2 border-[#d89f4a] bg-[#07130f] px-7 text-base font-black text-[#f0c36a] shadow-[0_18px_40px_-26px_rgba(7,19,15,0.8)] transition-transform hover:-translate-y-0.5"
                  >
                    <BookOpen size={22} />
                    人気講義を見る
                    <ArrowRight size={20} />
                  </a>
                  <a
                    href="#school-assignments"
                    className="inline-flex h-16 items-center justify-center gap-3 rounded-lg border-2 border-[#7dd9b5]/45 bg-[#12382f]/88 px-7 text-base font-black text-[#eafff6] shadow-[0_18px_40px_-30px_rgba(0,0,0,0.9)] transition-colors hover:bg-[#174a3f]"
                  >
                    <Target size={22} />
                    今週の課題を見る
                    <ArrowRight size={18} />
                  </a>
                </div>

                <div className="mt-8 grid gap-4 border-t border-[#d89f4a]/25 pt-6 sm:grid-cols-3">
                  <Feature icon={Trophy} title="体系講義" copy="心理学 × 実務を体系化" />
                  <Feature icon={Swords} title="実戦課題" copy="現場ですぐ使える問い" />
                  <Feature icon={ShieldCheck} title="認定ノート" copy="学びを小さく可視化" />
                </div>
              </div>

              <div id="school-professor" className="relative z-10 min-h-[500px] lg:min-h-[600px]">
                <div className="absolute bottom-0 left-[4%] right-[6%] top-8 overflow-hidden rounded-lg border border-[#d89f4a]/28 bg-[#0b211a] shadow-[0_24px_70px_-44px_rgba(0,0,0,0.9)]">
                  <Image
                    src="/media/school-v2/hero-night-academy.png"
                    alt="黒板の前で営業講義をするはぐれ博士"
                    fill
                    priority
                    sizes="(min-width: 1024px) 620px, 100vw"
                    className="object-cover object-center"
                  />
                  <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(7,19,15,0.04),rgba(7,19,15,0.12)_44%,rgba(7,19,15,0.62)),linear-gradient(180deg,rgba(7,19,15,0.02),rgba(7,19,15,0.7))]" />
                </div>

                <div className="absolute left-0 top-12 hidden max-w-[320px] rounded-lg border border-[#d89f4a]/35 bg-[#07130f]/88 p-4 text-[#f3e4c3] shadow-[0_18px_50px_-36px_rgba(0,0,0,0.9)] backdrop-blur-sm md:block">
                  <div className="text-sm font-black text-[#f0c36a]">勝ち筋の魔法陣</div>
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    {academySteps.map((step, index) => (
                      <span key={step} className="inline-flex items-center gap-2">
                        <span className="rounded-full border border-[#7dd9b5]/45 bg-[#12382f]/82 px-3 py-2 text-[12px] font-black text-[#eafff6]">
                          {step}
                        </span>
                        {index < academySteps.length - 1 ? <ArrowRight size={14} className="text-[#f0c36a]" /> : null}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="absolute right-0 top-[116px] w-[292px] rounded-lg border border-[#d89f4a]/45 bg-[#07130f]/95 p-5 text-[#f3e4c3] shadow-[0_20px_50px_-32px_rgba(0,0,0,0.9)] backdrop-blur-sm max-sm:left-4 max-sm:right-4 max-sm:top-auto max-sm:bottom-5 max-sm:w-auto">
                  <div className="flex items-center gap-2 text-lg font-black text-[#f0c36a]">
                    <BrainCircuit size={20} />
                    はぐれ博士の講義室
                  </div>
                  <p className="mt-4 text-[13px] font-bold leading-7">
                    会社で教えてくれない営業現場の違和感を、無料で読める講義に変えるはぐれ系研究者。
                  </p>
                  <div className="my-4 h-px bg-[#d89f4a]/35" />
                  <ul className="space-y-2">
                    {professorChecks.map((check) => (
                      <li key={check} className="flex items-center gap-2 text-[13px] font-bold text-[#f3e4c3]">
                        <Sparkles size={15} className="text-[#7dd9b5]" />
                        {check}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-5 rounded-lg border border-[#7dd9b5]/35 bg-[#12382f] p-4">
                    <div className="text-[11px] font-black text-[#f0c36a]">今日の板書</div>
                    <p className="mt-2 text-[13px] font-black leading-6">
                      「高い」は価格ではなく、納得の順番が崩れた合図かもしれない。
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div id="school-status" className="relative z-10 mx-auto mb-7 grid max-w-[1370px] gap-4 rounded-lg border border-[#d89f4a]/40 bg-[#04100c]/88 p-4 text-[#f3e4c3] shadow-[0_18px_50px_-34px_rgba(0,0,0,0.9)] backdrop-blur-sm md:grid-cols-[1.05fr_1.45fr_1fr] md:items-center">
              <div className="flex items-center gap-4">
                <div className="grid h-14 w-14 shrink-0 place-items-center rounded-lg border border-[#d89f4a]/45 bg-[#10251e] text-[#f0c36a]">
                  <Award size={28} />
                </div>
                <div className="min-w-0">
                  <div className="text-[12px] font-black text-[#d89f4a]">学園ステータス</div>
                  <div className="mt-1 flex items-end gap-2">
                    <span className="text-[13px] font-black">Lv.</span>
                    <span className="text-3xl font-black text-[#f0c36a]">18</span>
                    <span className="pb-1 text-[11px] font-bold text-[#f3e4c3]/70">次の講義まで 2,340 exp</span>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#d89f4a]/18">
                    <div className="h-full w-[58%] rounded-full bg-[#d89f4a]" />
                  </div>
                </div>
              </div>

              <div className="border-t border-[#d89f4a]/22 pt-4 md:border-l md:border-t-0 md:pl-6 md:pt-0">
                <div className="text-[12px] font-black text-[#d89f4a]">今週のミッション</div>
                <p className="mt-2 text-sm font-black leading-6">「価格が高い」の裏にある心理を1つ解剖する</p>
              </div>

              <div className="border-t border-[#d89f4a]/22 pt-4 md:border-l md:border-t-0 md:pl-6 md:pt-0">
                <div className="text-[12px] font-black text-[#d89f4a]">獲得バッジ</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {earnedBadges.map((badge) => (
                    <span key={badge} className="inline-flex items-center gap-1 rounded-full border border-[#7dd9b5]/35 bg-[#12382f] px-3 py-1 text-[11px] font-black">
                      <Award size={13} className="text-[#f0c36a]" />
                      {badge}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <ContentBand id="school-lectures">
          <SectionTitle eyebrow="人気講義" title="現場の課題を、講義と物語で学ぶ" />
          <div className="mt-4 grid gap-3 lg:grid-cols-4">
            {lectures.map((card, index) => (
              <LectureCard key={card.title} card={card} priority={index === 0} />
            ))}
          </div>
        </ContentBand>

        <ContentBand id="school-assignments" bordered>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <SectionTitle eyebrow="今週の課題" title="営業現場のつまずきを、博士の問いに変える" />
            <span className="text-sm font-black text-[#d89f4a]">提出不要。読んで考えるだけでいい。</span>
          </div>
          <div className="mt-4 grid gap-3 lg:grid-cols-4">
            {assignments.map((assignment) => (
              <AssignmentCard key={assignment.title} assignment={assignment} />
            ))}
          </div>
        </ContentBand>

        <ContentBand id="school-notes" bordered bottom>
          <div className="flex items-end justify-between gap-4">
            <SectionTitle eyebrow="図書館" title="営業の基本も、現場の違和感から読み直す" />
            <span className="hidden text-sm font-black text-[#d89f4a]/80 sm:inline">根拠は丁寧に、見せ方は尖らせる</span>
          </div>
          <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_1fr_1fr_0.85fr]">
            {notes.map((note) => (
              <NoteCard key={note.title} note={note} />
            ))}

            <Link
              href="/lp"
              className="relative flex min-h-[260px] items-center justify-between overflow-hidden rounded-lg border border-[#d89f4a]/25 bg-[#07130f] p-5 text-[#f3e4c3] shadow-[0_16px_38px_-34px_rgba(0,0,0,0.9)]"
            >
              <div>
                <div className="text-[12px] font-black text-[#d89f4a]">POWERED BY ルキスマCRM</div>
                <div className="mt-2 text-xl font-black">現場データも教材にする</div>
                <p className="mt-3 text-[13px] font-bold leading-6 text-[#f3e4c3]/78">
                  講義で見つけた仮説を、CRMの商談ログで検証する。
                </p>
              </div>
              <ArrowRight className="relative z-10 shrink-0 text-[#f0c36a]" size={24} />
              <div className="absolute -bottom-10 -right-8 text-[7rem] font-black leading-none text-[#7dd9b5]/10">
                学
              </div>
            </Link>
          </div>
        </ContentBand>
      </div>
    </main>
  )
}

function Feature({ icon: Icon, title, copy }: { icon: typeof Trophy; title: string; copy: string }) {
  return (
    <div className="border-l border-[#d89f4a]/30 pl-4 text-[#f3e4c3] first:border-l-0 first:pl-0">
      <Icon size={28} className="mb-3 text-[#d89f4a]" />
      <div className="text-base font-black text-[#f0c36a]">{title}</div>
      <div className="mt-1 text-[12px] font-bold text-[#f3e4c3]/82">{copy}</div>
    </div>
  )
}

function ContentBand({
  id,
  children,
  bordered = false,
  bottom = false,
}: {
  id: string
  children: ReactNode
  bordered?: boolean
  bottom?: boolean
}) {
  return (
    <section
      id={id}
      className={`relative bg-[#07130f] px-4 sm:px-8 md:pl-[92px] lg:px-12 lg:pl-[92px] ${
        bordered ? 'border-t border-[#d89f4a]/18' : ''
      } ${bottom ? 'pb-8 pt-5' : 'py-5'}`}
    >
      <div className="mx-auto max-w-[1370px]">{children}</div>
    </section>
  )
}

function SectionTitle({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="flex min-w-0 items-baseline gap-3">
      <div className="text-xl font-black text-[#fff7df]">› {eyebrow}</div>
      <div className="hidden min-w-0 text-[13px] font-bold text-[#d89f4a]/82 sm:block">{title}</div>
    </div>
  )
}

function LectureCard({
  card,
  priority = false,
}: {
  card: {
    title: string
    label: string
    copy: string
    image: string
    accent: string
  }
  priority?: boolean
}) {
  return (
    <a
      href="#school-notes"
      className="group relative block overflow-hidden rounded-lg border border-[#d89f4a]/24 bg-[#10251e] text-left shadow-[0_16px_38px_-34px_rgba(0,0,0,0.9)] transition-transform hover:-translate-y-0.5"
      style={{ aspectRatio: '407 / 285' }}
    >
      <Image
        src={card.image}
        alt={`${card.title}の講義カード`}
        fill
        priority={priority}
        sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
        className="object-cover transition-transform duration-300 group-hover:scale-[1.025]"
      />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(7,19,15,0.24),rgba(7,19,15,0.44)_36%,rgba(7,19,15,0.9)),linear-gradient(180deg,rgba(18,56,47,0.12),rgba(18,56,47,0.42))]" />
      <div className="absolute inset-x-0 bottom-0 p-4 text-right">
        <div
          className="ml-auto inline-flex rounded-full px-2.5 py-1 text-[11px] font-black text-[#07130f]"
          style={{ background: card.accent }}
        >
          {card.label}
        </div>
        <h3 className="mt-2 font-display text-2xl font-black leading-tight text-[#fff7df]">{card.title}</h3>
        <p className="ml-auto mt-1 max-w-[240px] text-[12px] font-bold leading-5 text-[#f3e4c3]">{card.copy}</p>
      </div>
      <ArrowRight className="absolute right-3 top-3 text-[#fff7df]/88" size={18} />
    </a>
  )
}

function AssignmentCard({
  assignment,
}: {
  assignment: {
    title: string
    theme: string
    copy: string
    icon: typeof Target
    accent: string
  }
}) {
  const Icon = assignment.icon

  return (
    <a
      href="#school-notes"
      className="group relative min-h-[252px] overflow-hidden rounded-lg border border-[#d89f4a]/22 bg-[#0b211a] p-5 text-left text-[#f3e4c3] shadow-[0_14px_32px_-30px_rgba(0,0,0,0.85)] transition-transform hover:-translate-y-0.5"
    >
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(125,217,181,0.055)_1px,transparent_1px),linear-gradient(rgba(125,217,181,0.04)_1px,transparent_1px)] bg-[length:28px_28px]" />
      <div className="relative flex h-full flex-col">
        <div className="flex items-center justify-between gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-lg bg-[#07130f] shadow-[0_12px_24px_-18px_rgba(0,0,0,0.8)]">
            <Icon size={21} style={{ color: assignment.accent }} />
          </div>
          <span className="h-1.5 w-14 rounded-full" style={{ background: assignment.accent }} />
        </div>
        <div className="mt-5 text-[12px] font-black text-[#d89f4a]">{assignment.title}</div>
        <h3 className="mt-2 text-xl font-black leading-7 text-[#fff7df]">{assignment.theme}</h3>
        <p className="mt-3 text-[13px] font-bold leading-6 text-[#f3e4c3]/78">{assignment.copy}</p>
        <span className="mt-auto inline-flex items-center gap-2 pt-5 text-[13px] font-black text-[#7dd9b5]">
          講義ノートへ
          <ArrowRight size={15} />
        </span>
      </div>
    </a>
  )
}

function NoteCard({
  note,
}: {
  note: {
    title: string
    source: string
    copy: string
    image: string
  }
}) {
  return (
    <a
      href="#school-notes"
      className="group relative min-h-[260px] overflow-hidden rounded-lg border border-[#d89f4a]/25 bg-[#07130f] text-left shadow-[0_14px_32px_-30px_rgba(0,0,0,0.85)] transition-transform hover:-translate-y-0.5"
    >
      <div className="relative h-[128px] overflow-hidden">
        <Image
          src={note.image}
          alt={`${note.title}の講義ノート画像`}
          fill
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition-transform duration-300 group-hover:scale-[1.025]"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,19,15,0.02),rgba(7,19,15,0.72))]" />
      </div>
      <div className="bg-[#f3e4c3] p-4">
        <div className="inline-flex rounded-full bg-[#12382f] px-2.5 py-1 text-[11px] font-black text-[#f3e4c3]">
          {note.source}
        </div>
        <h3 className="mt-3 text-[16px] font-black leading-6 text-[#07130f]">{note.title}</h3>
        <p className="mt-2 text-[12px] font-bold leading-6 text-[#31413a]">{note.copy}</p>
      </div>
    </a>
  )
}
