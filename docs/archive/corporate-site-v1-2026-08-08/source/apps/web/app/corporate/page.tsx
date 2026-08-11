import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, BarChart3, Check, Database, ExternalLink, Route, Trophy } from 'lucide-react'
import { BusinessCards } from '@/components/corporate/BusinessCards'
import {
  BookingLink,
  Container,
  CorporateShell,
  FinalCallToAction,
  SectionHeading,
  SecondaryLink,
} from '@/components/corporate/CorporateShell'
import { referenceSummaries } from '@/lib/corporate-site'
import {
  companyName,
  operatorPersonId,
  operatorProfileUrl,
  publicSiteDescription,
  publicSiteTitle,
  publicSiteUrl,
} from '@/lib/public-site'

const structuredData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': `${publicSiteUrl}/#organization`,
      name: companyName,
      legalName: companyName,
      url: publicSiteUrl,
      logo: `${publicSiteUrl}/brand/rookie-smart-japan/rsj-favicon-premium-01-white-card-r.svg`,
      founder: { '@id': operatorPersonId },
      sameAs: [publicSiteUrl, 'https://koshikibase.jp'],
    },
    {
      '@type': 'WebSite',
      '@id': `${publicSiteUrl}/#website`,
      name: publicSiteTitle,
      url: publicSiteUrl,
      inLanguage: 'ja-JP',
      publisher: { '@id': `${publicSiteUrl}/#organization` },
    },
    {
      '@type': 'WebPage',
      '@id': `${publicSiteUrl}/#webpage`,
      name: publicSiteTitle,
      description: publicSiteDescription,
      url: publicSiteUrl,
      inLanguage: 'ja-JP',
      isPartOf: { '@id': `${publicSiteUrl}/#website` },
      about: { '@id': `${publicSiteUrl}/#organization` },
    },
    {
      '@type': 'Person',
      '@id': operatorPersonId,
      name: '沢坂弘樹',
      url: operatorProfileUrl,
      jobTitle: `${companyName} 代表`,
      worksFor: { '@id': `${publicSiteUrl}/#organization` },
    },
  ],
}

const operatingSteps = [
  {
    number: '01',
    title: '現場を理解する',
    description: '目の前の数値だけでなく、顧客、営業、運用の現場にある課題を整理します。',
  },
  {
    number: '02',
    title: '小さく仕組み化する',
    description: '大きな変革から始めず、優先度の高い一つの導線と判断基準から作ります。',
  },
  {
    number: '03',
    title: 'データで学習する',
    description: '実行結果を計測し、継続・停止・次の実験を判断できる運用に変えます。',
  },
]

export default function CorporateHomePage() {
  return (
    <CorporateShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <main>
        <section className="relative overflow-hidden bg-[linear-gradient(180deg,#ffffff_0%,#f2f8fc_76%,#ffffff_100%)] py-14 sm:py-20 lg:py-28">
          <div className="pointer-events-none absolute -left-24 top-8 h-72 w-72 rounded-full bg-[#85c9ef]/18 blur-3xl" />
          <div className="pointer-events-none absolute right-[-8rem] top-[-5rem] h-[28rem] w-[28rem] rounded-full border-[70px] border-[#dff0fa]/70" />
          <Container className="relative">
            <div className="grid gap-12 lg:grid-cols-[1.02fr_0.98fr] lg:items-center lg:gap-16">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-[#cfe4f3] bg-white/90 px-4 py-2 text-[10px] font-black tracking-[0.18em] text-[#147dcc] shadow-sm">
                  <span className="h-2 w-2 rounded-full bg-[#147dcc]" />
                  ROOKIE SMART JAPAN
                </div>
                <h1 className="mt-7 text-[2.85rem] font-black leading-[1.12] tracking-[-0.05em] text-[#0b3155] sm:text-[4rem] lg:text-[5rem]">
                  挑戦する人と事業に、
                  <span className="mt-1 block text-[#147dcc]">前へ進む仕組みを。</span>
                </h1>
                <p className="mt-7 max-w-2xl text-base leading-8 text-[#4d6c82] sm:text-lg sm:leading-9">
                  野球メディアの運営と、Go-to-Market・マーケティング基盤の設計を通じて、現場の挑戦を継続的に成長できる仕組みへ変えていきます。
                </p>
                <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                  <Link
                    href="#businesses"
                    className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#0b3155] px-6 py-3 text-sm font-bold text-white shadow-[0_12px_30px_rgba(11,49,85,0.18)] transition hover:-translate-y-0.5 hover:bg-[#124873]"
                  >
                    事業を見る
                    <ArrowRight size={16} />
                  </Link>
                  <BookingLink placement="hero" />
                </div>
              </div>

              <div className="relative rounded-[2rem] border border-[#cfe4f3] bg-white p-5 shadow-[0_32px_90px_rgba(11,49,85,0.14)] sm:p-7">
                <div className="flex items-center justify-between border-b border-[#e3eff7] pb-5">
                  <div>
                    <p className="text-[9px] font-black tracking-[0.18em] text-[#147dcc]">OUR BUSINESS</p>
                    <p className="mt-2 text-lg font-black text-[#0b3155]">現場とデータを、成長へつなぐ</p>
                  </div>
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#0b3155] text-xl font-black text-white">R</span>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
                  {[
                    { icon: Trophy, label: 'MEDIA', title: 'コーシキベース', tone: 'bg-[#eef8fd]' },
                    { icon: Route, label: 'GTM', title: '売れる構造の設計', tone: 'bg-[#e7f4fb]' },
                    { icon: BarChart3, label: 'MARKETING', title: '計測と学習の基盤', tone: 'bg-[#0b3155] text-white' },
                  ].map(({ icon: Icon, label, title, tone }, index) => (
                    <div key={label} className={`min-h-36 rounded-2xl p-4 ${tone}`}>
                      <Icon size={19} className={index === 2 ? 'text-[#8bcdf4]' : 'text-[#147dcc]'} />
                      <p className={`mt-5 text-[8px] font-black tracking-[0.15em] ${index === 2 ? 'text-[#8bcdf4]' : 'text-[#147dcc]'}`}>
                        {label}
                      </p>
                      <p className="mt-2 text-sm font-black leading-6">{title}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-5 flex items-center gap-3 rounded-2xl border border-[#dcecf7] bg-[#f8fbfd] px-4 py-3 text-xs font-bold leading-6 text-[#4f6d82]">
                  <Database size={17} className="shrink-0 text-[#147dcc]" />
                  実行して終わらず、結果を次の意思決定へ戻します。
                </div>
              </div>
            </div>
          </Container>
        </section>

        <section id="businesses" className="scroll-mt-24 py-16 sm:py-20 lg:py-28">
          <Container>
            <SectionHeading
              eyebrow="OUR BUSINESS"
              title={<>3つの事業で、挑戦の前進を支える。</>}
              description={
                <p>
                  野球の現場に必要な情報を届けるメディアと、事業が売れ続けるためのGTM・マーケティング基盤を設計します。
                </p>
              }
            />
            <div className="mt-10 lg:mt-14">
              <BusinessCards />
            </div>
          </Container>
        </section>

        <section className="bg-[#f3f8fc] py-16 sm:py-20 lg:py-24">
          <Container>
            <SectionHeading
              eyebrow="HOW WE WORK"
              title={<>成果物だけでなく、次も回せる仕組みを残す。</>}
              description={<p>仮説、計測、判断基準を一つのサイクルとして設計し、学習を次の実行へ引き継ぎます。</p>}
            />
            <div className="mt-10 grid gap-4 md:grid-cols-3">
              {operatingSteps.map((step) => (
                <article key={step.number} className="rounded-2xl border border-[#d9eaf5] bg-white p-6 shadow-[0_12px_35px_rgba(11,49,85,0.055)]">
                  <p className="text-[10px] font-black tracking-[0.16em] text-[#147dcc]">STEP {step.number}</p>
                  <h3 className="mt-4 text-xl font-black tracking-[-0.02em] text-[#0b3155]">{step.title}</h3>
                  <p className="mt-4 text-sm leading-7 text-[#5b7588]">{step.description}</p>
                </article>
              ))}
            </div>
          </Container>
        </section>

        <section className="py-16 sm:py-20 lg:py-28">
          <Container>
            <div className="grid gap-10 lg:grid-cols-[0.82fr_1.18fr] lg:items-center lg:gap-16">
              <div className="relative mx-auto w-full max-w-lg overflow-hidden rounded-[2rem] bg-[#dceffc] shadow-[0_26px_75px_rgba(11,49,85,0.14)]">
                <div className="relative aspect-[4/3]">
                  <Image
                    src="/founder-corporate.jpeg"
                    alt="株式会社ルーキースマートジャパン代表 沢坂弘樹"
                    fill
                    sizes="(max-width: 1024px) 100vw, 42vw"
                    className="object-cover object-center"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#0b3155]/80 to-transparent px-6 pb-5 pt-16 text-white">
                    <p className="text-[9px] font-black tracking-[0.18em] text-[#b6ddf3]">FOUNDER / CEO</p>
                    <p className="mt-1 text-xl font-black">沢坂 弘樹</p>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-[11px] font-black tracking-[0.2em] text-[#147dcc]">FOUNDER STORY</p>
                <h2 className="mt-4 text-[2.25rem] font-black leading-[1.2] tracking-[-0.04em] text-[#0b3155] sm:text-[3.2rem]">
                  26歳まで野球。
                  <span className="block text-[#147dcc]">その先で、事業づくりを始めた。</span>
                </h2>
                <div className="mt-6 space-y-4 text-sm leading-8 text-[#536f83] sm:text-base">
                  <p>
                    亜細亜大学を経て、パナマとオーストラリアで26歳まで野球を続けました。怪我による引退後は、TOEIC 910点の取得とフリーランスエンジニアの経験からビジネスキャリアを始めています。
                  </p>
                  <p>
                    プロダクト・サービス開発、組織設計、営業、マーケティング、カスタマーサクセスの実務を通じて、現場と仕組みの両方から事業を前へ進めます。
                  </p>
                </div>
                <div className="mt-7">
                  <SecondaryLink href="/hiroki-sawasaka">代表ストーリーを読む</SecondaryLink>
                </div>
              </div>
            </div>
          </Container>
        </section>

        <section className="bg-[#f3f8fc] py-16 sm:py-20 lg:py-24">
          <Container>
            <SectionHeading
              eyebrow="REFERENCE"
              title={<> 第三者から見た、仕事の進め方。</>}
              description={<p>元上司・経営者などから寄せられた評価を、実名や原文を使わず要約しています。</p>}
            />
            <div className="mt-10 grid items-stretch gap-4 md:grid-cols-3">
              {referenceSummaries.map((item) => (
                <article key={item.number} className="flex h-full min-h-64 flex-col rounded-2xl border border-[#d8e9f4] bg-white p-6 shadow-[0_12px_35px_rgba(11,49,85,0.055)]">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black tracking-[0.17em] text-[#147dcc]">REFERENCE {item.number}</span>
                    <Check className="text-[#147dcc]" size={18} />
                  </div>
                  <h3 className="mt-6 text-xl font-black leading-8 tracking-[-0.025em] text-[#0b3155]">{item.title}</h3>
                  <p className="mt-4 text-sm leading-7 text-[#5b7588]">{item.description}</p>
                  <p className="mt-auto pt-5 text-[9px] font-bold tracking-[0.1em] text-[#8aa0af]">匿名リファレンス要約</p>
                </article>
              ))}
            </div>
          </Container>
        </section>

        <section className="py-14 sm:py-16">
          <Container>
            <div className="flex flex-col justify-between gap-6 rounded-2xl border border-[#d9eaf5] bg-white p-6 sm:flex-row sm:items-center sm:p-8">
              <div>
                <p className="text-[10px] font-black tracking-[0.18em] text-[#147dcc]">COMPANY</p>
                <p className="mt-2 text-xl font-black text-[#0b3155] sm:text-2xl">{companyName}</p>
                <p className="mt-2 text-sm leading-7 text-[#5b7588]">野球メディア / Go-to-Market設計 / マーケティング基盤設計</p>
              </div>
              <Link href="/company" className="inline-flex items-center gap-2 text-sm font-black text-[#147dcc] hover:text-[#0b6da8]">
                会社概要を見る
                <ExternalLink size={15} />
              </Link>
            </div>
          </Container>
        </section>

        <FinalCallToAction placement="home_final" />
      </main>
    </CorporateShell>
  )
}
