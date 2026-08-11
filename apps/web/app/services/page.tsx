import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, BarChart3, Check, Route } from 'lucide-react'
import { Container, CorporateShell, FinalCallToAction, SectionHeading } from '@/components/corporate/CorporateShell'
import { Breadcrumbs } from '@/components/corporate/ServiceBlocks'
import { companyName, publicSiteUrl, serviceSearchName } from '@/lib/public-site'

export const metadata: Metadata = {
  title: '法人向けサービス',
  description: 'ルキスマLABのGo-to-Market設計とマーケティング基盤設計。市場・プロダクト・営業・CSと、オウンドメディア・計測・広告実験を体系化します。',
  alternates: { canonical: '/services' },
}

const services = [
  {
    icon: Route,
    number: '01',
    label: 'GO-TO-MARKET DESIGN',
    title: 'Go-to-Market設計',
    description: '市場、ポジショニング、プロダクト、集客、営業、CS、学習を一つの成長構造として設計します。',
    href: '/#gtm-download',
    points: ['ICP・ポジショニング', '営業・CSプロセス', '90日実行ロードマップ'],
  },
  {
    icon: BarChart3,
    number: '02',
    label: 'MARKETING INFRASTRUCTURE',
    title: 'マーケティング基盤設計',
    description: 'オウンドメディアを主軸に、流入から受注までの計測と、ベイズ・バンディットによる広告実験を設計します。',
    href: '/#marketing-download',
    points: ['競合・検索機会調査', '計測・CRM接続', 'ベイズ・バンディット配分'],
  },
] as const

const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'OfferCatalog',
  name: `${serviceSearchName} 法人向けサービス`,
  url: `${publicSiteUrl}/services`,
  provider: { '@id': `${publicSiteUrl}/#organization`, name: companyName },
  itemListElement: services.map((service) => ({ '@type': 'Offer', itemOffered: { '@type': 'Service', name: service.title, description: service.description, url: `${publicSiteUrl}${service.href}`, areaServed: { '@type': 'Country', name: 'Japan' } } })),
}

export default function ServicesPage() {
  return (
    <CorporateShell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <main>
        <section className="relative overflow-hidden border-b border-[#d8e8f0] bg-[#edf7fc] py-12 sm:py-18 lg:py-24">
          <div className="absolute -right-20 -top-32 h-96 w-96 rounded-full border-[64px] border-white/60" aria-hidden="true" />
          <Container className="relative">
            <Breadcrumbs items={[{ label: 'ホーム', href: '/' }, { label: '法人向けサービス' }]} />
            <div className="mt-10 max-w-4xl">
              <p className="flex items-center gap-4 text-[10px] font-bold tracking-[0.22em] text-[#0b6fb7]"><span className="h-px w-10 bg-[#0b6fb7]" />{serviceSearchName.toUpperCase()}</p>
              <h1 className="mt-6 [font-family:'Yu_Mincho','Hiragino_Mincho_ProN',serif] text-[2.7rem] font-semibold leading-[1.4] tracking-[-0.045em] text-[#123b59] sm:text-[4rem] lg:text-[4.8rem]">事業の実行を、<span className="block text-[#0b6fb7]">学習し続ける仕組みへ。</span></h1>
              <p className="mt-6 max-w-3xl text-base leading-8 text-[#506d7e] sm:text-lg sm:leading-9">ルキスマLABは、売れる構造を組み立てるGo-to-Market設計と、集客・計測・配分を継続改善するマーケティング基盤設計を提供します。</p>
            </div>
          </Container>
        </section>

        <section className="py-16 sm:py-24 lg:py-28">
          <Container>
            <div className="grid border-l border-t border-[#cfe0e9] lg:grid-cols-2">
              {services.map(({ icon: Icon, number, label, title, description, href, points }) => (
                <Link key={href} href={href} className="group flex min-h-[34rem] flex-col border-b border-r border-[#cfe0e9] bg-white p-7 transition hover:bg-[#f7fbfd] sm:p-10">
                  <div className="flex items-start justify-between gap-6"><span className="grid h-14 w-14 place-items-center border border-[#a9cfe4] text-[#0b6fb7]"><Icon size={24} /></span><span className="text-4xl font-light text-[#c8dce7]">{number}</span></div>
                  <p className="mt-9 text-[9px] font-bold tracking-[0.2em] text-[#0b6fb7]">{label}</p>
                  <h2 className="mt-3 [font-family:'Yu_Mincho','Hiragino_Mincho_ProN',serif] text-2xl font-semibold leading-[1.5] text-[#123b59] sm:text-3xl">{title}</h2>
                  <p className="mt-5 text-sm leading-8 text-[#5a7484] sm:text-base">{description}</p>
                  <ul className="mt-7 grid gap-3">{points.map((point) => <li key={point} className="flex items-start gap-3 text-sm font-bold text-[#3f6074]"><Check size={15} className="mt-1 shrink-0 text-[#0b6fb7]" />{point}</li>)}</ul>
                  <span className="mt-auto flex items-center gap-3 pt-9 text-sm font-bold text-[#0b6fb7]">資料ダウンロード <ArrowRight size={15} className="transition group-hover:translate-x-1" /></span>
                </Link>
              ))}
            </div>
          </Container>
        </section>

        <section className="bg-[#edf7fc] py-16 sm:py-24">
          <Container>
            <SectionHeading eyebrow="ONE OPERATING SYSTEM" title={<>GTMとマーケティングを、分断させない。</>} description={<p>市場と商品の定義から、集客、営業、CS、データ計測までを同じKPIと学習サイクルでつなぎます。</p>} />
            <div className="mt-12 grid border-l border-t border-[#bed7e5] sm:grid-cols-2 lg:grid-cols-4">
              {['市場と顧客を定義', '実行プロセスを設計', '結果を正しく計測', '学習を次の配分へ'].map((item, index) => <div key={item} className="min-h-40 border-b border-r border-[#bed7e5] bg-white p-6"><span className="text-[10px] font-bold text-[#0b6fb7]">0{index + 1}</span><p className="mt-5 [font-family:'Yu_Mincho','Hiragino_Mincho_ProN',serif] text-lg font-semibold leading-8 text-[#123b59]">{item}</p></div>)}
            </div>
          </Container>
        </section>

        <FinalCallToAction placement="services_final" />
      </main>
    </CorporateShell>
  )
}
