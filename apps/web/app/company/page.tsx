import type { Metadata } from 'next'
import Link from 'next/link'
import {
  companyName,
  companyProfilePath,
  companyProfileUrl,
  operatorName,
  operatorPersonId,
  operatorProfilePath,
  publicSiteUrl,
  serviceAlternateNames,
  serviceName,
  serviceSearchName,
} from '@/lib/public-site'

const title = `${companyName}｜${serviceSearchName}公式`
const description = `${companyName}は、${serviceSearchName}を提供するAI/DX設計・実装支援会社です。代表は${operatorName}。${serviceName}として営業・マーケティングの業務基盤を構築します。`

export const metadata: Metadata = {
  metadataBase: new URL(publicSiteUrl),
  title,
  description,
  keywords: [
    companyName,
    'ルーキースマートジャパン',
    'RookieSmart Japan',
    serviceSearchName,
    ...serviceAlternateNames,
    'FDE',
    'Forward Deployed CRM',
    operatorName,
    `${companyName} 公式`,
    `${companyName} 代表`,
    '営業実行',
    'FDE開発',
    'CRM構築',
    'Call AI',
    '企業データベース',
  ],
  alternates: {
    canonical: companyProfilePath,
  },
  openGraph: {
    title,
    description,
    url: companyProfilePath,
    siteName: serviceName,
    type: 'website',
    locale: 'ja_JP',
  },
  twitter: {
    card: 'summary',
    title,
    description,
  },
  robots: {
    index: true,
    follow: true,
  },
}

const companyJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': `${publicSiteUrl}/#organization`,
  name: companyName,
  legalName: companyName,
  alternateName: ['ルーキースマートジャパン', 'RookieSmart Japan', 'RookieSmart', serviceSearchName],
  url: companyProfileUrl,
  logo: `${publicSiteUrl}/icon.svg`,
  description,
  founder: {
    '@id': operatorPersonId,
  },
  employee: {
    '@id': operatorPersonId,
  },
  brand: {
    '@type': 'SoftwareApplication',
    '@id': `${publicSiteUrl}/#software`,
    name: serviceSearchName,
    alternateName: serviceAlternateNames,
    applicationCategory: 'BusinessApplication',
    applicationSubCategory: 'CRM',
    url: publicSiteUrl,
  },
  mainEntityOfPage: companyProfileUrl,
}

const aboutPageJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'AboutPage',
  '@id': `${companyProfileUrl}#about-page`,
  name: title,
  url: companyProfileUrl,
  description,
  inLanguage: 'ja-JP',
  isPartOf: {
    '@id': `${publicSiteUrl}/#website`,
  },
  about: {
    '@id': `${publicSiteUrl}/#organization`,
  },
  mainEntity: {
    '@id': `${publicSiteUrl}/#organization`,
  },
  breadcrumb: {
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: serviceName,
        item: publicSiteUrl,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: companyName,
        item: companyProfileUrl,
      },
    ],
  },
}

const companyFacts = [
  ['会社名', companyName],
  ['提供サービス', serviceName],
  ['代表', operatorName],
  ['所在地', '東京都 中央区'],
  ['事業領域', '営業実行 / FDE開発 / CRM構築 / Call AI / 企業データベース'],
]

export default function CompanyPage() {
  return (
    <main className="min-h-screen bg-obsidian text-[#e7e5ea]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify([companyJsonLd, aboutPageJsonLd]) }}
      />

      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(circle at 18% 16%, rgba(171,199,255,0.17), transparent 34%), radial-gradient(circle at 84% 8%, rgba(0,113,227,0.12), transparent 28%)',
          }}
        />
        <div className="relative mx-auto max-w-5xl px-6 py-16 md:py-24">
          <Link
            href="/"
            className="inline-flex text-xs font-semibold tracking-[0.12em] text-aurora/80 hover:text-aurora"
          >
            FDE CRM 公式HPへ
          </Link>

          <div className="mt-10 max-w-3xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#9b99a0]">
              Official Company Profile
            </p>
            <h1 className="mt-4 font-display text-[2.6rem] font-bold leading-tight tracking-[-0.02em] md:text-[4.2rem]">
              株式会社ルーキースマートジャパン
            </h1>
            <p className="mt-5 text-base leading-8 text-[#c7c5c9] md:text-lg">
              株式会社ルーキースマートジャパンは、FDE CRMを提供する営業実行・FDE開発支援会社です。
              代表の沢坂弘樹が、CRM・Call AI・企業データベース・部署直通番号を組み合わせた営業活動を支援します。
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 pb-20">
        <div className="grid gap-4 md:grid-cols-2">
          {companyFacts.map(([label, value]) => (
            <div key={label} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <p className="text-[10px] uppercase tracking-[0.14em] text-[#7e7c83]">{label}</p>
              <p className="mt-2 text-sm font-semibold leading-7 text-[#e7e5ea]">{value}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 rounded-3xl border border-white/10 bg-[#121216] p-6 md:p-8">
          <h2 className="font-display text-2xl font-bold tracking-[-0.01em]">
            {companyName}が提供する{serviceName}
          </h2>
          <p className="mt-4 text-sm leading-8 text-[#c7c5c9]">
            {serviceName}は、CRM・Call AI・企業データベースを統合し、営業実行とFDE開発を同時に進めるAI CRMです。
            営業データ、商談、メール、議事録、企業DBを横断し、次の営業アクションを引き出します。
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/"
              className="inline-flex rounded-full bg-aurora px-5 py-2 text-sm font-semibold text-[#07101f] transition-transform hover:-translate-y-0.5"
            >
              FDE CRMを見る
            </Link>
            <Link
              href={operatorProfilePath}
              className="inline-flex rounded-full border border-white/15 px-5 py-2 text-sm font-semibold text-[#e7e5ea] transition-colors hover:border-aurora/60 hover:text-aurora"
            >
              代表プロフィールを見る
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
