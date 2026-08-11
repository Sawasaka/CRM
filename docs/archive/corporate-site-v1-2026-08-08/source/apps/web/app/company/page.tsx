import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Building2, Check, MapPin, UserRound } from 'lucide-react'
import {
  Container,
  CorporateShell,
  FinalCallToAction,
  SectionHeading,
} from '@/components/corporate/CorporateShell'
import { Breadcrumbs } from '@/components/corporate/ServiceBlocks'
import {
  companyName,
  companyProfilePath,
  companyProfileUrl,
  operatorName,
  operatorPersonId,
  operatorProfilePath,
  publicSiteUrl,
  serviceSearchName,
} from '@/lib/public-site'

const title = `${companyName}｜会社概要`
const description = `${companyName}は、中学硬式野球メディア「コーシキベース」と、Go-to-Market設計・マーケティング基盤設計を提供する会社です。`

export const metadata: Metadata = {
  metadataBase: new URL(publicSiteUrl),
  title,
  description,
  alternates: { canonical: companyProfilePath },
  openGraph: {
    title,
    description,
    url: companyProfilePath,
    siteName: companyName,
    type: 'website',
    locale: 'ja_JP',
    images: [{ url: '/corporate-og.svg', width: 1200, height: 630, alt: companyName }],
  },
  robots: { index: true, follow: true },
}

const companyFacts = [
  { icon: Building2, label: '会社名', value: companyName },
  { icon: UserRound, label: '代表', value: operatorName },
  { icon: MapPin, label: '所在地', value: '東京都中央区' },
  {
    icon: Check,
    label: '事業領域',
    value: '野球メディア / Go-to-Market設計 / マーケティング基盤設計',
  },
] as const

const companyJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': `${publicSiteUrl}/#organization`,
  name: companyName,
  legalName: companyName,
  alternateName: ['Rookie Smart Japan Inc.', 'ルーキースマートジャパン'],
  url: publicSiteUrl,
  mainEntityOfPage: companyProfileUrl,
  founder: { '@id': operatorPersonId },
  employee: { '@id': operatorPersonId },
  brand: [
    { '@type': 'Brand', name: 'コーシキベース', url: 'https://koshikibase.jp' },
    { '@type': 'Brand', name: serviceSearchName, url: `${publicSiteUrl}/services` },
  ],
}

export default function CompanyPage() {
  return (
    <CorporateShell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(companyJsonLd) }} />
      <main>
        <section className="bg-[linear-gradient(180deg,#f7fbfe_0%,#edf7fc_100%)] py-12 sm:py-16 lg:py-24">
          <Container>
            <Breadcrumbs items={[{ label: 'ホーム', href: '/' }, { label: '会社概要' }]} />
            <div className="mt-10 max-w-4xl">
              <p className="text-[11px] font-black tracking-[0.2em] text-[#147dcc]">COMPANY</p>
              <h1 className="mt-5 text-[2.55rem] font-black leading-[1.14] tracking-[-0.045em] text-[#0b3155] sm:text-[4rem] lg:text-[4.8rem]">
                現場の挑戦を、
                <span className="block text-[#147dcc]">継続的な成長に変える会社。</span>
              </h1>
              <p className="mt-6 max-w-3xl text-base leading-8 text-[#4f6d82] sm:text-lg sm:leading-9">
                {companyName}は、野球メディアの運営と、Go-to-Market・マーケティング基盤の設計を通じて、情報と仕組みの両面から挑戦を支えます。
              </p>
            </div>
          </Container>
        </section>

        <section className="py-16 sm:py-20 lg:py-24">
          <Container>
            <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
              <SectionHeading
                eyebrow="MISSION"
                title={<> 可能性を、情報と仕組みで前へ進める。</>}
                description={
                  <p>
                    スポーツでもビジネスでも、情報が届かないこと、判断や実行が個人の経験だけに依存することで、挑戦の可能性が閉じてしまう場面があります。私たちは、現場の知識を整え、誰でも次の一手を判断できる状態をつくります。
                  </p>
                }
              />
              <div className="grid gap-4 sm:grid-cols-2">
                {companyFacts.map(({ icon: Icon, label, value }) => (
                  <div key={label} className="min-h-44 rounded-2xl border border-[#d9eaf5] bg-white p-6 shadow-[0_12px_35px_rgba(11,49,85,0.05)]">
                    <Icon className="text-[#147dcc]" size={20} />
                    <p className="mt-5 text-[9px] font-black tracking-[0.17em] text-[#7891a3]">{label}</p>
                    <p className="mt-2 text-sm font-black leading-7 text-[#0b3155]">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          </Container>
        </section>

        <section className="bg-[#f3f8fc] py-16 sm:py-20 lg:py-24">
          <Container>
            <SectionHeading
              eyebrow="BUSINESS PORTFOLIO"
              title={<> メディアと事業開発を、一つの学習ループに。</>}
              description={<p>自社メディアでの実践を法人向けサービスに反映し、法人支援で得た設計知を自社事業の改善に戻します。</p>}
            />
            <div className="mt-10 grid gap-4 lg:grid-cols-3">
              {[
                { number: '01', title: 'コーシキベース', text: '公式根拠と独自データを整備する、中学硬式野球の検索・比較メディア。', href: 'https://koshikibase.jp', external: true },
                { number: '02', title: 'Go-to-Market設計', text: 'プロダクトからCSまで、顧客に選ばれ続ける構造を設計。', href: '/services/gtm', external: false },
                { number: '03', title: 'マーケティング基盤設計', text: 'オウンドメディア、計測、広告実験を一つの学習システムへ。', href: '/services/marketing-infrastructure', external: false },
              ].map((business) => {
                const body = (
                  <>
                    <p className="text-[10px] font-black tracking-[0.17em] text-[#147dcc]">BUSINESS {business.number}</p>
                    <h3 className="mt-5 text-xl font-black leading-8 text-[#0b3155]">{business.title}</h3>
                    <p className="mt-4 text-sm leading-7 text-[#5b7588]">{business.text}</p>
                    <span className="mt-auto flex items-center gap-2 pt-6 text-sm font-black text-[#147dcc]">詳細を見る <ArrowRight size={15} /></span>
                  </>
                )
                const className = 'flex min-h-72 flex-col rounded-2xl border border-[#d9eaf5] bg-white p-6 transition hover:-translate-y-1 hover:border-[#8bc7ea]'
                return business.external ? (
                  <a key={business.number} href={business.href} target="_blank" rel="noopener noreferrer" className={className}>{body}</a>
                ) : (
                  <Link key={business.number} href={business.href} className={className}>{body}</Link>
                )
              })}
            </div>
          </Container>
        </section>

        <section className="py-16 sm:py-20">
          <Container>
            <div className="flex flex-col justify-between gap-6 rounded-[1.75rem] border border-[#cfe4f3] bg-white p-7 shadow-[0_18px_55px_rgba(11,49,85,0.07)] sm:flex-row sm:items-center sm:p-9">
              <div>
                <p className="text-[10px] font-black tracking-[0.18em] text-[#147dcc]">REPRESENTATIVE</p>
                <p className="mt-3 text-2xl font-black text-[#0b3155]">{operatorName}</p>
                <p className="mt-2 text-sm leading-7 text-[#5b7588]">野球で培った現場感覚と、開発・営業・マーケティングの実務経験を事業設計に活かします。</p>
              </div>
              <Link href={operatorProfilePath} className="inline-flex items-center gap-2 text-sm font-black text-[#147dcc] hover:text-[#0b6da8]">代表ストーリーを読む <ArrowRight size={16} /></Link>
            </div>
          </Container>
        </section>

        <FinalCallToAction placement="company_final" />
      </main>
    </CorporateShell>
  )
}
