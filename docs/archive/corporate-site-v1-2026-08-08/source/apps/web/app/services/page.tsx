import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, BarChart3, Check, Route } from 'lucide-react'
import {
  Container,
  CorporateShell,
  FinalCallToAction,
  SectionHeading,
} from '@/components/corporate/CorporateShell'
import { Breadcrumbs } from '@/components/corporate/ServiceBlocks'
import { companyName, publicSiteUrl, serviceSearchName } from '@/lib/public-site'

export const metadata: Metadata = {
  title: '法人向けサービス',
  description:
    'ルキスマLABのGo-to-Market設計とマーケティング基盤設計。市場・プロダクト・営業・CSと、オウンドメディア・計測・広告実験を体系化します。',
  alternates: { canonical: '/services' },
}

const services = [
  {
    icon: Route,
    label: 'GO-TO-MARKET DESIGN',
    title: 'Go-to-Market設計',
    description: '市場、ポジショニング、プロダクト、集客、営業、CS、学習を一つの成長構造として設計します。',
    href: '/services/gtm',
    points: ['ICP・ポジショニング', '営業・CSプロセス', '90日実行ロードマップ'],
  },
  {
    icon: BarChart3,
    label: 'MARKETING INFRASTRUCTURE',
    title: 'マーケティング基盤設計',
    description: 'オウンドメディアを主軸に、流入から受注までの計測と、ベイズ・バンディットによる広告実験を設計します。',
    href: '/services/marketing-infrastructure',
    points: ['競合・検索機会調査', '計測・CRM接続', 'ベイズ・バンディット配分'],
  },
]

const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'OfferCatalog',
  name: `${serviceSearchName} 法人向けサービス`,
  url: `${publicSiteUrl}/services`,
  provider: { '@id': `${publicSiteUrl}/#organization`, name: companyName },
  itemListElement: services.map((service) => ({
    '@type': 'Offer',
    itemOffered: {
      '@type': 'Service',
      name: service.title,
      description: service.description,
      url: `${publicSiteUrl}${service.href}`,
      areaServed: { '@type': 'Country', name: 'Japan' },
    },
  })),
}

export default function ServicesPage() {
  return (
    <CorporateShell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <main>
        <section className="bg-[linear-gradient(180deg,#f7fbfe_0%,#edf7fc_100%)] py-12 sm:py-16 lg:py-24">
          <Container>
            <Breadcrumbs items={[{ label: 'ホーム', href: '/' }, { label: '法人向けサービス' }]} />
            <div className="mt-10 max-w-4xl">
              <p className="text-[11px] font-black tracking-[0.2em] text-[#147dcc]">{serviceSearchName.toUpperCase()}</p>
              <h1 className="mt-5 text-[2.7rem] font-black leading-[1.13] tracking-[-0.045em] text-[#0b3155] sm:text-[4rem] lg:text-[4.8rem]">
                事業の実行を、
                <span className="block text-[#147dcc]">学習し続ける仕組みへ。</span>
              </h1>
              <p className="mt-6 max-w-3xl text-base leading-8 text-[#4f6d82] sm:text-lg sm:leading-9">
                ルキスマLABは、売れる構造を組み立てるGo-to-Market設計と、集客・計測・配分を継続改善するマーケティング基盤設計を提供します。
              </p>
            </div>
          </Container>
        </section>

        <section className="py-16 sm:py-20 lg:py-24">
          <Container>
            <div className="grid items-stretch gap-5 lg:grid-cols-2">
              {services.map(({ icon: Icon, label, title, description, href, points }) => (
                <Link
                  key={href}
                  href={href}
                  className="group flex min-h-[30rem] flex-col rounded-[1.75rem] border border-[#d9eaf5] bg-white p-6 shadow-[0_18px_55px_rgba(11,49,85,0.08)] transition hover:-translate-y-1 hover:border-[#8bc7ea] hover:shadow-[0_24px_70px_rgba(11,49,85,0.13)] sm:p-8"
                >
                  <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e5f4fc] text-[#147dcc]">
                    <Icon size={25} />
                  </span>
                  <p className="mt-7 text-[10px] font-black tracking-[0.18em] text-[#147dcc]">{label}</p>
                  <h2 className="mt-3 text-2xl font-black tracking-[-0.03em] text-[#0b3155] sm:text-3xl">{title}</h2>
                  <p className="mt-5 text-sm leading-8 text-[#597488] sm:text-base">{description}</p>
                  <ul className="mt-6 space-y-3">
                    {points.map((point) => (
                      <li key={point} className="flex items-start gap-2 text-sm font-bold text-[#365e78]">
                        <Check size={15} className="mt-0.5 shrink-0 text-[#147dcc]" />
                        {point}
                      </li>
                    ))}
                  </ul>
                  <span className="mt-auto flex items-center gap-2 pt-8 text-sm font-black text-[#147dcc]">
                    詳細を見る
                    <ArrowRight size={16} />
                  </span>
                </Link>
              ))}
            </div>
          </Container>
        </section>

        <section className="bg-[#f3f8fc] py-16 sm:py-20">
          <Container>
            <SectionHeading
              eyebrow="ONE OPERATING SYSTEM"
              title={<>GTMとマーケティングを、分断させない。</>}
              description={<p>市場と商品の定義から、集客、営業、CS、データ計測までを同じKPIと学習サイクルでつなぎます。</p>}
            />
            <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {['市場と顧客を定義', '実行プロセスを設計', '結果を正しく計測', '学習を次の配分へ'].map((item, index) => (
                <div key={item} className="rounded-2xl border border-[#d9eaf5] bg-white p-5">
                  <span className="text-[10px] font-black text-[#147dcc]">0{index + 1}</span>
                  <p className="mt-3 text-sm font-black leading-6 text-[#0b3155]">{item}</p>
                </div>
              ))}
            </div>
          </Container>
        </section>

        <FinalCallToAction placement="services_final" />
      </main>
    </CorporateShell>
  )
}
