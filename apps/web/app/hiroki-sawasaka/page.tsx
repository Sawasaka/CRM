import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import {
  companyName,
  companyProfilePath,
  operatorName,
  operatorNameWithSpace,
  operatorPersonId,
  operatorProfilePath,
  operatorProfileUrl,
  operatorRomanName,
  publicSiteUrl,
  serviceName,
} from '@/lib/public-site'

const title = `${operatorName}｜${serviceName}・${companyName}代表`
const description = `${operatorName}の公式プロフィール。${companyName}代表として、${serviceName}の営業実行とCRM構築を支援しています。外資SaaS日本法人立ち上げ、ITスタートアップCROを経験。`

export const metadata: Metadata = {
  metadataBase: new URL(publicSiteUrl),
  title,
  description,
  keywords: [
    operatorName,
    operatorNameWithSpace,
    operatorRomanName,
    companyName,
    serviceName,
    '株式会社ルーキースマートジャパン 代表',
    'ルキスマCRM 代表',
    `${operatorName} ${serviceName}`,
    `${operatorName} ${companyName}`,
    '営業実行',
    'CRM構築',
  ],
  alternates: {
    canonical: operatorProfilePath,
  },
  openGraph: {
    title,
    description,
    url: operatorProfilePath,
    siteName: serviceName,
    type: 'profile',
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

const profileJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  '@id': operatorPersonId,
  name: operatorName,
  alternateName: [operatorNameWithSpace, operatorRomanName],
  url: operatorProfileUrl,
  image: `${publicSiteUrl}/founder-icon.png`,
  jobTitle: `${companyName}代表 / ${serviceName} 営業実行・CRM構築支援`,
  description,
  identifier: operatorProfileUrl,
  sameAs: [operatorProfileUrl],
  mainEntityOfPage: operatorProfileUrl,
  worksFor: {
    '@type': 'Organization',
    '@id': `${publicSiteUrl}/#organization`,
    name: companyName,
    url: publicSiteUrl,
  },
  affiliation: {
    '@type': 'Organization',
    '@id': `${publicSiteUrl}/#organization`,
    name: companyName,
    url: publicSiteUrl,
  },
  subjectOf: {
    '@id': `${operatorProfileUrl}#profile-page`,
  },
  knowsAbout: ['営業実行', 'CRM構築', 'チャットCRM', '企業データベース', '部署直通番号'],
}

const profilePageJsonLd = {
  '@context': 'https://schema.org',
  '@type': ['ProfilePage', 'AboutPage'],
  '@id': `${operatorProfileUrl}#profile-page`,
  name: title,
  headline: `${operatorName}の公式プロフィール`,
  url: operatorProfileUrl,
  description,
  keywords: [operatorName, companyName, serviceName, '沢坂弘樹 代表', '沢坂弘樹 ルキスマCRM'],
  inLanguage: 'ja-JP',
  isPartOf: {
    '@id': `${publicSiteUrl}/#website`,
  },
  about: {
    '@id': operatorPersonId,
  },
  mainEntity: {
    '@id': operatorPersonId,
  },
  primaryImageOfPage: `${publicSiteUrl}/founder-icon.png`,
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
        name: operatorName,
        item: operatorProfileUrl,
      },
    ],
  },
}

const careerItems = [
  ['Sales Executive', '外資 SaaS 日本法人 立ち上げ (正社員 1 人目)'],
  ['執行役員 CRO', 'IT スタートアップ 立ち上げ (正社員 1 人目)'],
  ['キャリア', 'エンジニア → IT 法人営業 → DX / AIX 業務コンサルティング'],
]

export default function HirokiSawasakaPage() {
  return (
    <main className="min-h-screen bg-obsidian text-[#e7e5ea]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify([profileJsonLd, profilePageJsonLd]) }}
      />

      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(circle at 20% 20%, rgba(171,199,255,0.16), transparent 34%), radial-gradient(circle at 80% 10%, rgba(0,113,227,0.12), transparent 30%)',
          }}
        />
        <div className="relative mx-auto max-w-5xl px-6 py-16 md:py-24">
          <Link
            href="/"
            className="inline-flex text-xs font-semibold tracking-[0.12em] text-aurora/80 hover:text-aurora"
          >
            ルキスマCRM 公式HPへ
          </Link>

          <div className="mt-10 grid gap-10 md:grid-cols-[1fr_220px] md:items-end">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#9b99a0]">
                Founder Profile
              </p>
              <h1 className="mt-4 font-display text-[3rem] font-bold leading-none tracking-[-0.02em] md:text-[4.5rem]">
                沢坂弘樹
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-8 text-[#c7c5c9] md:text-lg">
                株式会社ルーキースマートジャパン代表。ルキスマCRMの営業実行とCRM構築を同時に支援します。
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href={companyProfilePath}
                  className="inline-flex rounded-full border border-white/15 px-5 py-2 text-sm font-semibold text-[#e7e5ea] transition-colors hover:border-aurora/60 hover:text-aurora"
                >
                  株式会社ルーキースマートジャパンを見る
                </Link>
                <Link
                  href="/"
                  className="inline-flex rounded-full bg-aurora px-5 py-2 text-sm font-semibold text-[#07101f] transition-transform hover:-translate-y-0.5"
                >
                  ルキスマCRMを見る
                </Link>
              </div>
            </div>

            <Image
              src="/founder-icon.png"
              alt="沢坂弘樹"
              width={220}
              height={220}
              priority
              className="h-40 w-40 rounded-full border border-white/10 object-cover shadow-[0_22px_70px_rgba(0,0,0,0.38)] md:h-52 md:w-52"
            />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 pb-20">
        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <p className="text-[10px] uppercase tracking-[0.14em] text-[#7e7c83]">会社</p>
            <Link href={companyProfilePath} className="mt-2 block text-sm font-semibold hover:text-aurora">
              {companyName}
            </Link>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <p className="text-[10px] uppercase tracking-[0.14em] text-[#7e7c83]">サービス</p>
            <p className="mt-2 text-sm font-semibold">{serviceName}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <p className="text-[10px] uppercase tracking-[0.14em] text-[#7e7c83]">領域</p>
            <p className="mt-2 text-sm font-semibold">営業実行 / CRM構築</p>
          </div>
        </div>

        <div className="mt-10 rounded-3xl border border-white/10 bg-[#121216] p-6 md:p-8">
          <h2 className="font-display text-2xl font-bold tracking-[-0.01em]">プロフィール</h2>
          <dl className="mt-6 space-y-4">
            {careerItems.map(([label, value]) => (
              <div key={label} className="grid gap-1 border-t border-white/10 pt-4 md:grid-cols-[150px_1fr]">
                <dt className="text-[10px] uppercase tracking-[0.12em] text-[#7e7c83]">{label}</dt>
                <dd className="text-sm leading-7 text-[#c7c5c9]">{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>
    </main>
  )
}
