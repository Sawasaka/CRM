import type { Metadata } from 'next'
import Image from 'next/image'
import { Check, Code2, Globe2, GraduationCap, HeartPulse, Trophy } from 'lucide-react'
import {
  Container,
  CorporateShell,
  FinalCallToAction,
  SectionHeading,
} from '@/components/corporate/CorporateShell'
import { Breadcrumbs } from '@/components/corporate/ServiceBlocks'
import {
  businessExperience,
  founderTimeline,
  referenceSummaries,
} from '@/lib/corporate-site'
import {
  companyName,
  companyProfilePath,
  operatorExternalProfiles,
  operatorName,
  operatorNameHiragana,
  operatorNameWithSpace,
  operatorPersonId,
  operatorProfilePath,
  operatorProfileUrl,
  operatorRomanName,
  operatorSubjectUrls,
  publicSiteUrl,
} from '@/lib/public-site'

const title = `${operatorName}｜${companyName}代表`
const description = `${operatorName}の公式プロフィール。パナマ・オーストラリアでの野球経験と、開発・営業・マーケティング・CSの経験を、GTMと事業の仕組み化に活かしています。`

export const metadata: Metadata = {
  metadataBase: new URL(publicSiteUrl),
  title,
  description,
  keywords: [operatorName, operatorNameWithSpace, operatorRomanName, operatorNameHiragana, companyName, 'Go-to-Market', 'GTM設計', '亜細亜大学', 'TOEIC 910'],
  alternates: { canonical: operatorProfilePath },
  openGraph: {
    title,
    description,
    url: operatorProfilePath,
    siteName: companyName,
    type: 'profile',
    locale: 'ja_JP',
    images: [{ url: '/founder-corporate.jpeg', width: 1600, height: 1067, alt: operatorName }],
  },
  twitter: { card: 'summary_large_image', title, description, images: ['/founder-corporate.jpeg'] },
  robots: { index: true, follow: true },
}

const profileJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  '@id': operatorPersonId,
  name: operatorName,
  alternateName: [operatorNameWithSpace, operatorRomanName, operatorNameHiragana],
  url: operatorProfileUrl,
  image: `${publicSiteUrl}/founder-corporate.jpeg`,
  jobTitle: `${companyName}代表 / Go-to-Market・マーケティング基盤設計`,
  description,
  sameAs: operatorExternalProfiles,
  worksFor: { '@id': `${publicSiteUrl}/#organization`, name: companyName, url: publicSiteUrl },
  alumniOf: { '@type': 'CollegeOrUniversity', name: '亜細亜大学' },
  subjectOf: operatorSubjectUrls.map((url) => ({ '@type': 'Article', url })),
  knowsAbout: ['Go-to-Market', 'プロダクト開発', '営業戦略', 'マーケティング戦略', 'カスタマーサクセス', 'ベイズ統計', 'バンディット配分'],
}

const highlights = [
  { icon: Trophy, value: '26歳まで', label: '野球選手として挑戦' },
  { icon: Globe2, value: '2カ国', label: 'パナマ・オーストラリア' },
  { icon: GraduationCap, value: 'TOEIC 910', label: '引退後の学び直し' },
  { icon: Code2, value: '7領域', label: '開発からCSまで実務経験' },
] as const

export default function HirokiSawasakaPage() {
  return (
    <CorporateShell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(profileJsonLd) }} />
      <main>
        <section className="relative overflow-hidden bg-[linear-gradient(180deg,#f7fbfe_0%,#edf7fc_100%)] py-12 sm:py-16 lg:py-20">
          <div className="pointer-events-none absolute -right-24 top-4 h-72 w-72 rounded-full bg-[#8bcdf4]/20 blur-3xl" />
          <Container className="relative">
            <Breadcrumbs items={[{ label: 'ホーム', href: '/' }, { label: '代表プロフィール' }]} />
            <div className="mt-10 grid gap-10 lg:grid-cols-[1.08fr_0.92fr] lg:items-center lg:gap-16">
              <div>
                <p className="text-[11px] font-black tracking-[0.2em] text-[#147dcc]">FOUNDER STORY</p>
                <h1 className="mt-5 text-[3rem] font-black leading-[1.05] tracking-[-0.05em] text-[#0b3155] sm:text-[4.5rem] lg:text-[5.4rem]">
                  沢坂 弘樹
                </h1>
                <p className="mt-5 text-2xl font-black leading-tight tracking-[-0.03em] text-[#147dcc] sm:text-3xl">
                  26歳まで野球。その先で、事業づくりを始めた。
                </p>
                <p className="mt-6 max-w-2xl text-base leading-8 text-[#4f6d82] sm:text-lg sm:leading-9">
                  厳しい野球環境と海外挑戦、大怪我からの学び直し。エンジニア、営業、マーケティング、カスタマーサクセスを経験し、現在は現場の粘り強さを事業の仕組みに変えています。
                </p>
              </div>
              <div className="relative mx-auto w-full max-w-xl overflow-hidden rounded-[2rem] border border-white bg-[#dceffc] shadow-[0_28px_85px_rgba(11,49,85,0.17)]">
                <div className="relative aspect-[4/3]">
                  <Image src="/founder-corporate.jpeg" alt="沢坂弘樹" fill priority sizes="(max-width: 1024px) 100vw, 45vw" className="object-cover object-center" />
                </div>
              </div>
            </div>
          </Container>
        </section>

        <section className="border-b border-[#e2eff7] bg-white py-8">
          <Container>
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              {highlights.map(({ icon: Icon, value, label }) => (
                <div key={value} className="rounded-2xl border border-[#dcecf7] bg-[#f9fcfe] p-4 sm:p-5">
                  <Icon className="text-[#147dcc]" size={18} />
                  <p className="mt-3 text-lg font-black text-[#0b3155] sm:text-xl">{value}</p>
                  <p className="mt-1 text-[10px] font-bold leading-5 text-[#6a8395]">{label}</p>
                </div>
              ))}
            </div>
          </Container>
        </section>

        <section className="py-16 sm:py-20 lg:py-24">
          <Container>
            <SectionHeading
              eyebrow="STORY"
              title={<> 野球で培った基準を、事業の仕組みに変えるまで。</>}
              description={<p>苦労だけを語るのではなく、その経験が現在のGTM・マーケティング設計にどうつながっているかをまとめました。</p>}
            />
            <div className="relative mt-12 space-y-4 before:absolute before:bottom-6 before:left-[1.15rem] before:top-6 before:w-px before:bg-[#b9dced] sm:before:left-[1.4rem]">
              {founderTimeline.map((item, index) => (
                <article key={item.period} className="relative grid gap-4 pl-14 sm:grid-cols-[10rem_1fr] sm:pl-16">
                  <span className="absolute left-0 top-5 flex h-10 w-10 items-center justify-center rounded-full border-4 border-white bg-[#147dcc] text-[10px] font-black text-white shadow-sm sm:h-12 sm:w-12">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <p className="pt-1 text-[9px] font-black tracking-[0.16em] text-[#147dcc] sm:pt-6">{item.period}</p>
                  <div className="rounded-2xl border border-[#d9eaf5] bg-white p-5 shadow-[0_12px_35px_rgba(11,49,85,0.05)] sm:p-6">
                    <h3 className="text-xl font-black leading-8 tracking-[-0.025em] text-[#0b3155]">{item.title}</h3>
                    <p className="mt-3 text-sm leading-8 text-[#5b7588]">{item.description}</p>
                  </div>
                </article>
              ))}
            </div>
          </Container>
        </section>

        <section className="bg-[#f3f8fc] py-16 sm:py-20 lg:py-24">
          <Container>
            <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
              <SectionHeading
                eyebrow="EXPERIENCE"
                title={<> 事業の端から端まで、実務で理解する。</>}
                description={<p>一つの専門領域だけではなく、顧客に価値が届き、定着し、次の改善につながるまでのプロセスを横断して経験しています。</p>}
              />
              <div className="grid gap-3 sm:grid-cols-2">
                {businessExperience.map((item, index) => (
                  <div key={item} className="flex min-h-20 items-center gap-3 rounded-2xl border border-[#d9eaf5] bg-white px-5 py-4">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#e5f4fc] text-[10px] font-black text-[#147dcc]">0{index + 1}</span>
                    <p className="text-sm font-black text-[#284d68]">{item}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-8 flex items-start gap-3 rounded-2xl border border-[#cfe4f3] bg-white p-5 text-sm leading-7 text-[#4f6d82]">
              <HeartPulse className="mt-0.5 shrink-0 text-[#147dcc]" size={20} />
              <p>スポーツでは、毎日の練習と試合から修正点を見つけます。事業でも同じように、仮説、実行、計測、学習を繰り返せる仕組みをつくります。</p>
            </div>
          </Container>
        </section>

        <section className="py-16 sm:py-20 lg:py-24">
          <Container>
            <SectionHeading
              eyebrow="REFERENCE"
              title={<> 第三者から見た、仕事の進め方。</>}
              description={<p>元上司・経営者などから寄せられた評価の匿名要約です。推薦者名、会社名、原文、連絡先は公開していません。</p>}
            />
            <div className="mt-10 grid gap-4 md:grid-cols-3">
              {referenceSummaries.map((item) => (
                <article key={item.number} className="flex min-h-64 flex-col rounded-2xl border border-[#d9eaf5] bg-white p-6 shadow-[0_12px_35px_rgba(11,49,85,0.05)]">
                  <div className="flex items-center justify-between"><span className="text-[10px] font-black tracking-[0.16em] text-[#147dcc]">REFERENCE {item.number}</span><Check className="text-[#147dcc]" size={17} /></div>
                  <h3 className="mt-6 text-xl font-black leading-8 text-[#0b3155]">{item.title}</h3>
                  <p className="mt-4 text-sm leading-7 text-[#5b7588]">{item.description}</p>
                </article>
              ))}
            </div>
          </Container>
        </section>

        <section className="bg-[#f3f8fc] py-12">
          <Container>
            <a href={companyProfilePath} className="inline-flex items-center gap-2 text-sm font-black text-[#147dcc] hover:text-[#0b6da8]">株式会社ルーキースマートジャパンの会社概要へ →</a>
          </Container>
        </section>

        <FinalCallToAction
          placement="profile_final"
          title="野球で培った粘り強さと、事業の仕組み化をあなたの現場へ。"
          description="GTM、オウンドメディア、営業・マーケティング基盤の課題をうかがい、最初に仕組み化すべきポイントを整理します。"
        />
      </main>
    </CorporateShell>
  )
}
