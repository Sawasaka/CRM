import Image from 'next/image'
import { Section } from '../atoms'

const executiveHighlights = [
  {
    index: '01',
    label: 'Professional Background',
    title: '外資SaaS 日本法人立ち上げ',
    detail: '日本法人の正社員1人目として、初回商談から導入・CSまで一貫して担当。',
  },
  {
    index: '02',
    label: 'Executive Experience',
    title: 'ITスタートアップ 執行役員CRO',
    detail: '営業・マーケティング・CSを横断し、B2BからB2Cへのピボットと売上導線の設計を推進。',
  },
  {
    index: '03',
    label: 'Track Record',
    title: 'ARR 500万円 / 月間50人以上',
    detail: '外資SaaSで1年間にARR 500万円を創出。toC事業では月間50人以上の登録者獲得を実現。',
  },
]

const companyFacts = [
  { label: 'Company', value: '株式会社ルーキースマートジャパン' },
  { label: 'Brand', value: 'ルキスマLAB' },
  { label: 'Location', value: '東京都 中央区' },
  { label: 'Founded', value: '2025年9月' },
]

export const CorporateHero = () => (
  <Section
    id="hero"
    tone="obsidian"
    screenLabel="01 Corporate Introduction"
    className="overflow-hidden border-b border-white/[0.08] bg-[#0b0f14]"
  >
    <div className="pointer-events-none absolute inset-y-0 left-[calc(50%-1px)] hidden w-px bg-white/[0.035] lg:block" />

    <div className="relative mx-auto max-w-[1240px] px-6 pb-12 pt-16 md:pb-14 md:pt-20">
      <div className="grid gap-12 lg:grid-cols-[minmax(0,1.08fr)_minmax(340px,0.72fr)] lg:items-center lg:gap-20">
        <div className="lg:pb-2">
          <div className="flex items-center gap-3 text-[0.64rem] font-semibold uppercase tracking-[0.18em] text-[#8797aa]">
            <span className="h-px w-7 bg-[#71849a]" />
            Revenue Infrastructure Company / Tokyo
          </div>

          <h1 className="mt-7 max-w-3xl font-display text-[1.8rem] font-semibold leading-tight text-[#f0f2f4] sm:text-[2.1rem] md:text-[2.45rem]">
            株式会社ルーキースマートジャパン
          </h1>
          <p className="mt-7 max-w-3xl font-display text-[2.4rem] font-semibold leading-[1.1] text-[#e6eaee] sm:text-[3.2rem] md:text-[3.8rem]">
            売上の判断基盤を、
            <span className="block text-[#9baabd]">現場から設計する。</span>
          </p>
          <p className="mt-7 max-w-2xl border-l border-[#71849a]/50 pl-5 text-[0.9rem] leading-8 text-[#a5adb6] md:text-[0.96rem]">
            ルキスマLABは、営業・マーケティングの現場を理解した本人が、売上導線の整理からデータ計測、システム実装、運用改善までを一貫して支援するサービスです。
          </p>
        </div>

        <aside className="border-t border-white/[0.1] pt-7 sm:max-w-[440px] lg:max-w-none lg:border-l lg:border-t-0 lg:pl-10 lg:pt-0">
          <div className="relative overflow-hidden border border-white/[0.13] bg-[#111820]">
            <Image
              src="/founder-corporate.jpeg"
              alt="沢坂弘樹"
              width={1600}
              height={1067}
              priority
              unoptimized
              sizes="(max-width: 1023px) 440px, 420px"
              className="aspect-[4/3] w-full object-cover object-[50%_42%] saturate-[0.78] contrast-[1.03] brightness-[0.86] lg:aspect-[5/6]"
            />
            <div className="absolute left-4 top-4 border border-white/[0.18] bg-[#0b0f14]/85 px-3 py-2 text-[0.52rem] font-semibold uppercase tracking-[0.17em] text-[#b2bdc9]">
              Representative
            </div>
          </div>
          <div className="mt-5 grid gap-3 border-b border-white/[0.1] pb-5 sm:grid-cols-[1fr_auto] sm:items-end">
            <div>
              <div className="font-display text-[1.55rem] font-semibold text-[#eef0f2]">
                沢坂弘樹
              </div>
              <div className="mt-1 text-[0.62rem] font-medium uppercase tracking-[0.12em] text-[#8492a1]">
                Founder / Revenue Infrastructure Architect
              </div>
            </div>
            <div className="text-[0.55rem] font-semibold uppercase tracking-[0.16em] text-[#647487]">
              Tokyo, Japan
            </div>
          </div>
        </aside>
      </div>

      <div className="mt-12 grid border-y border-white/[0.1] md:grid-cols-3">
        {executiveHighlights.map((item) => (
          <article
            key={item.index}
            className="border-b border-white/[0.08] py-6 md:border-b-0 md:border-l md:px-7 md:first:border-l-0 md:first:pl-0 md:last:pr-0"
          >
            <div className="flex items-center gap-3">
              <span className="font-mono text-[0.58rem] font-semibold text-[#71849a]">
                {item.index}
              </span>
              <span className="text-[0.54rem] font-semibold uppercase tracking-[0.16em] text-[#697581]">
                {item.label}
              </span>
            </div>
            <h2 className="mt-3 text-[0.86rem] font-semibold leading-6 text-[#dce1e6]">
              {item.title}
            </h2>
            <p className="mt-2 max-w-sm text-[0.65rem] leading-5 text-[#858e98]">{item.detail}</p>
          </article>
        ))}
      </div>

      <dl className="grid border-b border-white/[0.1] sm:grid-cols-2 lg:grid-cols-4">
        {companyFacts.map((item) => (
          <div
            key={item.label}
            className="border-b border-white/[0.08] py-4 sm:px-5 lg:border-b-0 lg:border-l lg:first:border-l-0"
          >
            <dt className="text-[0.54rem] font-semibold uppercase tracking-[0.15em] text-[#626d79]">
              {item.label}
            </dt>
            <dd className="mt-1.5 text-[0.7rem] font-medium text-[#bbc1c7]">{item.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  </Section>
)
