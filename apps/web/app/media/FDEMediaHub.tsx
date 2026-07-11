'use client'

import { useState } from 'react'
import { BriefcaseBusiness, Newspaper, Sparkles, UserRoundSearch, type LucideIcon } from 'lucide-react'

type MediaArticle = {
  title: string
  kicker: string
  summary: string
  keyword: string
  body: string
  points: [string, string, string]
}

type MediaCategory = {
  id: string
  tab: string
  label: string
  title: string
  lead: string
  heroTitle: string
  heroSubtitle: string
  color: string
  Icon: LucideIcon
  articles: [MediaArticle]
}

const categories = [
  {
    id: 'cases',
    tab: 'FDEの事例',
    label: 'CASE STUDY',
    title: '現場密着型AI実装の事例を追う',
    lead: 'Palantir型の導入、AIスタートアップの実装支援、個別開発がプロダクト化される流れを整理します。',
    heroTitle: 'FDEの事例まとめ',
    heroSubtitle: 'AI時代の現場密着型エンジニアリング',
    color: '#c8b9ff',
    Icon: Sparkles,
    articles: [
      {
        title: 'AI導入がPoCで止まる会社と、現場で動き出す会社の差',
        kicker: 'FDEの事例 / 特集',
        summary: 'FDE型の実装では、AIを納品物として渡すのではなく、現場の業務フローに入り込みながら成果の出る使い方へ調整していきます。',
        body: '営業現場でAIを導入しても、最初に起きるのは「便利そうだが、誰がいつ使うのかが曖昧」という停滞です。FDE型の事例では、ここでエンジニアが商談準備、議事録、CRM入力、失注分析といった日々の作業に入り、AIが実際に使われる導線まで設計します。',
        keyword: 'FDE 事例',
        points: ['業務フローの中にAIを置く', '現場の反応を見ながら短い周期で改善する', '個社対応で得た知見をプロダクトへ戻す'],
      },
    ],
  },
  {
    id: 'news',
    tab: 'FDEニュース',
    label: 'WEEKLY NEWS',
    title: 'AI実装・企業導入ニュースを週次で読む',
    lead: 'FDE、AIエージェント、エンタープライズAI、採用市場の変化を、週次の経済番組のように整理します。',
    heroTitle: 'FDEニュース週次解説',
    heroSubtitle: 'AI導入トレンドと企業実装の論点',
    color: '#ffcf4a',
    Icon: Newspaper,
    articles: [
      {
        title: 'AIエージェント導入ニュースで見る、企業が次に詰まる場所',
        kicker: 'FDEニュース / 週次解説',
        summary: 'AIエージェントの発表が増える一方で、実運用ではデータ連携、権限設計、現場定着がボトルネックになります。',
        body: '今週のAIニュースをFDE視点で読むと、注目すべきは新機能そのものよりも「誰が現場に実装するのか」です。AIエージェントはデモでは賢く見えますが、CRM、SFA、メール、商談メモ、社内ルールをまたいだ瞬間に、導入プロジェクトへ変わります。',
        keyword: 'FDE ニュース',
        points: ['AIニュースを導入実務の論点に翻訳する', 'デモと本番運用の差分を見る', '営業AIエージェントをFDEの隣接テーマとして扱う'],
      },
    ],
  },
  {
    id: 'hiring',
    tab: 'FDE採用',
    label: 'HIRING WATCH',
    title: 'FDE求人・採用動向を追う',
    lead: 'Forward Deployed Engineerの採用、必要スキル、求人傾向、キャリアパスを継続的にまとめます。',
    heroTitle: 'FDE採用ウォッチ',
    heroSubtitle: '求人・スキル・キャリアパスの読み解き',
    color: '#8dffc9',
    Icon: UserRoundSearch,
    articles: [
      {
        title: 'FDE求人で求められるのは、コードを書けるコンサルなのか',
        kicker: 'FDE採用 / 求人分析',
        summary: 'FDE採用では、単なる開発経験だけでなく、顧客業務を理解し、曖昧な要件を動く仕組みに変える力が問われます。',
        body: 'FDEの求人票を読むと、エンジニア、コンサルタント、CS、PdMの境界線が重なって見えます。ただし本質は「何でも屋」ではありません。現場の課題を構造化し、データやAIを業務に接続し、再利用可能な形へ落とし込む職能として捉える方が近いでしょう。',
        keyword: 'FDE 採用',
        points: ['技術力だけでなく顧客理解が必要', '要件定義よりも現場での仮説検証が重要', 'CSやPdMとの違いを採用文脈で整理する'],
      },
    ],
  },
  {
    id: 'palantir',
    tab: 'パランティアモデル',
    label: 'PALANTIR MODEL',
    title: 'パランティアモデルをAI実装の文脈で読む',
    lead: 'Palantir、AIP、現場密着型導入を、FDE型AI実装の代表例としてわかりやすく整理します。',
    heroTitle: 'パランティアモデル解説',
    heroSubtitle: 'FDE型AI導入の代表事例として読む',
    color: '#ff8dcf',
    Icon: BriefcaseBusiness,
    articles: [
      {
        title: 'パランティアモデルとは、AIを売るモデルではなく実装するモデルである',
        kicker: 'パランティアモデル / 解説',
        summary: 'パランティアモデルの面白さは、ソフトウェアを提供して終わるのではなく、現場に入り、業務とデータを接続しながら価値を作る点にあります。',
        body: 'パランティアモデルをFDE文脈で見ると、中心にあるのは「プロダクト」と「導入支援」の分離ではありません。顧客の現場で得た課題をソフトウェアに反映し、ソフトウェアの思想を現場の運用に落とし込む往復運動です。',
        keyword: 'パランティアモデル',
        points: ['現場導入とプロダクト改善が分離していない', 'Ontologyのような業務表現がAI活用の土台になる', '日本企業では営業・CS・PdM連携の型として応用できる'],
      },
    ],
  },
] satisfies [MediaCategory, ...MediaCategory[]]

function ThumbnailBoard({ category }: { category: MediaCategory }) {
  const Icon = category.Icon
  const article = category.articles[0]
  return (
    <div
      className="relative min-h-[330px] overflow-hidden rounded-2xl border border-white/[0.08] p-6 fo-glass-rim md:p-8"
      style={{
        background:
          `linear-gradient(135deg, ${category.color}24 0%, rgba(18,18,22,0.94) 46%, rgba(5,6,10,0.98) 100%)`,
      }}
    >
      <div
        className="absolute -right-12 -top-12 h-48 w-48 rounded-full opacity-20 blur-3xl"
        style={{ background: category.color }}
      />
      <div className="absolute inset-x-8 top-8 h-px bg-white/15" />
      <div className="absolute bottom-8 right-8 hidden w-40 gap-2 opacity-80 md:grid">
        {article.points.map((point, index) => (
          <div key={point} className="rounded-xl border border-white/[0.10] bg-black/20 px-3 py-2">
            <span className="text-[10px] font-bold" style={{ color: category.color }}>
              0{index + 1}
            </span>
            <p className="mt-1 line-clamp-2 text-[10px] leading-4 text-white/55">{point}</p>
          </div>
        ))}
      </div>
      <div className="relative flex h-full min-h-[270px] max-w-[28rem] flex-col justify-between">
        <div className="flex items-center justify-between gap-3">
          <span className="text-[10px] font-semibold uppercase tracking-[0.18em]" style={{ color: category.color }}>
            {category.label}
          </span>
          <span
            className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold tracking-[0.10em]"
            style={{ background: `${category.color}18`, color: category.color }}
          >
            特集記事
          </span>
        </div>
        <div>
          <span
            className="mb-5 flex h-12 w-12 items-center justify-center rounded-[14px]"
            style={{
              background: `${category.color}18`,
              color: category.color,
              boxShadow: `inset 0 0 0 1px ${category.color}38`,
            }}
          >
            <Icon size={24} strokeWidth={1.8} />
          </span>
          <h2 className="font-display text-[2rem] font-bold leading-tight tracking-[-0.02em] text-[#f4f3f7] md:text-[2.55rem]">
            {category.heroTitle}
          </h2>
          <p className="mt-3 text-sm font-semibold leading-7 text-[#d7d4dd] md:text-base">{category.heroSubtitle}</p>
          <p className="mt-5 line-clamp-2 text-[12.5px] leading-6 text-[#a7a4ad]">{article.title}</p>
        </div>
      </div>
    </div>
  )
}

export function FDEMediaHub() {
  const [activeId, setActiveId] = useState(categories[0].id)
  const active = categories.find((category) => category.id === activeId) ?? categories[0]
  const article = active.articles[0]

  return (
    <section className="mx-auto max-w-6xl px-6 pb-20">
      <div className="flex gap-2 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none]">
        {categories.map((category) => (
          <button
            key={category.id}
            type="button"
            onClick={() => setActiveId(category.id)}
            className="shrink-0 rounded-full border px-4 py-2 text-[12px] font-semibold transition-colors"
            style={{
              borderColor: active.id === category.id ? `${category.color}66` : 'rgba(255,255,255,0.10)',
              background: active.id === category.id ? `${category.color}18` : 'rgba(255,255,255,0.04)',
              color: active.id === category.id ? category.color : '#c7c5c9',
            }}
          >
            {category.tab}
          </button>
        ))}
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-[1.08fr_0.92fr]">
        <ThumbnailBoard category={active} />

        <div className="rounded-2xl border border-white/[0.08] bg-[#121216] p-6 fo-glass-rim md:p-7">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em]" style={{ color: active.color }}>
            FEATURE BOARD
          </p>
          <h2 className="mt-3 font-display text-[1.6rem] font-bold leading-tight tracking-[-0.02em] text-[#e7e5ea]">
            {active.title}
          </h2>
          <p className="mt-4 text-sm leading-7 text-[#c7c5c9]">{active.lead}</p>
          <div className="mt-6 rounded-xl border border-white/[0.08] bg-white/[0.03] p-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#9b99a0]">
              FDE観点
            </p>
            <p className="mt-2 text-[12.5px] leading-6 text-[#9b99a0]">
              FDE / Forward Deployed Engineerを、AI導入・採用・営業現場の実装論点に接続して読み解きます。
            </p>
          </div>
        </div>
      </div>

      <article className="mt-5 overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.035] fo-glass-rim">
        <div className="grid gap-0 lg:grid-cols-[0.92fr_1.08fr]">
          <div
            className="relative min-h-[280px] overflow-hidden border-b border-white/[0.08] p-6 lg:border-b-0 lg:border-r md:p-7"
            style={{
              background:
                `linear-gradient(135deg, ${active.color}26 0%, rgba(18,18,22,0.94) 48%, rgba(4,5,9,0.98) 100%)`,
            }}
          >
            <div
              className="absolute -left-20 -top-20 h-60 w-60 rounded-full opacity-20 blur-3xl"
              style={{ background: active.color }}
            />
            <div className="absolute inset-x-7 top-7 h-px bg-white/20" />
            <div className="relative flex min-h-[230px] flex-col justify-between">
              <div className="flex items-center justify-between gap-3">
                <span className="text-[10px] font-semibold uppercase tracking-[0.18em]" style={{ color: active.color }}>
                  {article.kicker}
                </span>
                <span
                  className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold tracking-[0.10em]"
                  style={{ background: `${active.color}18`, color: active.color }}
                >
                  特集
                </span>
              </div>
              <div>
                <span
                  className="mb-5 inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold tracking-[0.12em]"
                  style={{ background: `${active.color}16`, color: active.color }}
                >
                  {article.keyword}
                </span>
                <h3 className="font-display text-[1.65rem] font-bold leading-tight tracking-[-0.02em] text-[#f4f3f7] md:text-[2.15rem]">
                  {article.title}
                </h3>
                <div className="mt-6 flex flex-wrap gap-2">
                  {article.points.map((point, index) => (
                    <span
                      key={point}
                      className="rounded-full border border-white/[0.08] bg-black/20 px-3 py-1.5 text-[10px] font-semibold text-white/65"
                    >
                      {index + 1}. {point}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 md:p-7">
            <p className="text-sm font-semibold leading-7 text-[#e7e5ea]">{article.summary}</p>
            <p className="mt-5 text-[13px] leading-7 text-[#b8b5be]">{article.body}</p>
            <div className="mt-6 grid gap-3">
              {article.points.map((point, index) => (
                <div key={point} className="flex gap-3 rounded-xl border border-white/[0.08] bg-black/15 p-3">
                  <span
                    className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold"
                    style={{ background: `${active.color}18`, color: active.color }}
                  >
                    {index + 1}
                  </span>
                  <p className="text-[12.5px] leading-6 text-[#c7c5c9]">{point}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </article>

      <div className="mt-5 grid gap-4 md:grid-cols-4">
        {categories.map((category) => {
          const categoryArticle = category.articles[0]
          return (
            <button
              key={category.id}
              type="button"
              onClick={() => setActiveId(category.id)}
              className="rounded-2xl border border-white/[0.08] bg-white/[0.035] p-4 text-left fo-glass-rim transition-colors hover:bg-white/[0.055]"
            >
              <span
                className="rounded-full px-2.5 py-1 text-[10px] font-semibold tracking-[0.12em]"
                style={{ background: `${category.color}16`, color: category.color }}
              >
                {category.tab}
              </span>
              <h3 className="mt-4 font-display text-[1rem] font-bold leading-snug text-[#e7e5ea]">
                {categoryArticle.title}
              </h3>
              <p className="mt-3 line-clamp-3 text-[12px] leading-6 text-[#9b99a0]">{categoryArticle.summary}</p>
            </button>
          )
        })}
      </div>
    </section>
  )
}
