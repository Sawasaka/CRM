import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import {
  companyName,
  companyProfilePath,
  operatorName,
  operatorNameHiragana,
  operatorNameWithSpace,
  operatorExternalProfiles,
  operatorPersonId,
  operatorProfilePath,
  operatorProfileUrl,
  operatorRomanName,
  operatorSubjectUrls,
  publicSiteUrl,
  serviceAlternateNames,
  serviceName,
  serviceSearchName,
} from '@/lib/public-site'

const title = `${operatorName}｜${serviceSearchName}・${companyName}代表`
const description = `${operatorName}の公式プロフィール。元・香川オリーブガイナーズ内野手。現在は${companyName}代表として、${serviceSearchName}の売上実験インフラを設計・実装しています。`

export const metadata: Metadata = {
  metadataBase: new URL(publicSiteUrl),
  title,
  description,
  keywords: [
    operatorName,
    operatorNameWithSpace,
    operatorRomanName,
    operatorNameHiragana,
    'さわさかひろき',
    companyName,
    serviceSearchName,
    ...serviceAlternateNames,
    'FDE',
    'Revenue Experiment Infrastructure',
    '株式会社ルーキースマートジャパン 代表',
    'Revenue Experiment Architect',
    '香川オリーブガイナーズ 沢坂弘樹',
    '沢坂弘樹 野球',
    `${operatorName} ${serviceName}`,
    `${operatorName} ${companyName}`,
    'レベニューインフラ設計',
    '確率モデル',
    'ベイズ統計',
    'バンディット配分',
  ],
  alternates: {
    canonical: operatorProfilePath,
  },
  openGraph: {
    title,
    description,
    url: operatorProfilePath,
    siteName: serviceSearchName,
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
  alternateName: [operatorNameWithSpace, operatorRomanName, operatorNameHiragana, 'さわさかひろき'],
  url: operatorProfileUrl,
  image: `${publicSiteUrl}/founder-icon.png`,
  jobTitle: `${companyName}代表 / Revenue Experiment Architect`,
  description,
  identifier: `${companyName}代表:${operatorName}`,
  sameAs: operatorExternalProfiles,
  mainEntityOfPage: operatorProfileUrl,
  disambiguatingDescription: `${companyName}代表。元・香川オリーブガイナーズ内野手の沢坂弘樹。現在は${serviceSearchName}の売上実験インフラを設計・実装しています。`,
  alumniOf: {
    '@type': 'CollegeOrUniversity',
    name: '亜細亜大学',
  },
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
  subjectOf: [
    {
      '@id': `${operatorProfileUrl}#profile-page`,
    },
    ...operatorSubjectUrls.map((url) => ({
      '@type': 'Article',
      url,
    })),
  ],
  knowsAbout: [
    serviceSearchName,
    serviceName,
    'レベニューインフラ設計',
    '確率モデル',
    'データ収集インフラ',
    'ベイズ統計',
    'バンディットアルゴリズム',
    'FDE',
  ],
}

const profileFaqItems = [
  {
    question: '沢坂弘樹は誰ですか？',
    answer: `沢坂弘樹は、${companyName}の代表です。${serviceName}を通じて、営業・マーケティング領域の売上実験インフラを設計しています。`,
  },
  {
    question: '沢坂弘樹はどのような支援をしていますか？',
    answer:
      '売上導線の可視化、確率モデルによる試算、計測基盤、ベイズ統計による並行検証、バンディット配分の実装を支援しています。',
  },
  {
    question: '沢坂弘樹とルキスマLABの関係は何ですか？',
    answer: `沢坂弘樹は、${companyName}代表として${serviceName}を提供し、データに基づく仮説検証と資源配分を支援しています。`,
  },
]

const profilePageJsonLd = {
  '@context': 'https://schema.org',
  '@type': ['ProfilePage', 'AboutPage'],
  '@id': `${operatorProfileUrl}#profile-page`,
  name: title,
  headline: `${operatorName}の公式プロフィール`,
  url: operatorProfileUrl,
  description,
  keywords: [
    operatorName,
    companyName,
    serviceSearchName,
    serviceName,
    'FDE',
    '沢坂弘樹 代表',
    `沢坂弘樹 ${serviceSearchName}`,
  ],
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

const profileFaqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: profileFaqItems.map((item) => ({
    '@type': 'Question',
    name: item.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: item.answer,
    },
  })),
}

const careerItems = [
  ['Sales Executive', '外資 SaaS 日本法人 立ち上げ (正社員 1 人目)'],
  ['執行役員 CRO', 'IT スタートアップ 立ち上げ (正社員 1 人目)'],
  ['キャリア', 'エンジニア → IT 法人営業 → DX / AIX 業務コンサルティング'],
]

const supportItems = [
  '広告・Web・CRM・商談・受注をつなぐ売上導線の設計',
  'CVR、CAC、LTV、商談化率、受注率の計測設計',
  '確率モデル、ベイズ統計、A/Bテストによる仮説検証',
  'バンディットアルゴリズムによる予算・営業工数の配分設計',
]

export default function HirokiSawasakaPage() {
  return (
    <main className="min-h-screen bg-obsidian text-[#e7e5ea]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([profileJsonLd, profilePageJsonLd, profileFaqJsonLd]),
        }}
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
            ルキスマLAB 公式HPへ
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
                株式会社ルーキースマートジャパン代表。売上導線の設計からデータ収集、統計分析、実験配分までを支援します。
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
                  サービスを見る
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
            <Link
              href={companyProfilePath}
              className="mt-2 block text-sm font-semibold hover:text-aurora"
            >
              {companyName}
            </Link>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <p className="text-[10px] uppercase tracking-[0.14em] text-[#7e7c83]">サービス</p>
            <p className="mt-2 text-sm font-semibold">{serviceName}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <p className="text-[10px] uppercase tracking-[0.14em] text-[#7e7c83]">領域</p>
            <p className="mt-2 text-sm font-semibold">売上実験インフラ / 統計モデル / FDE実装</p>
          </div>
        </div>

        <div className="mt-10 rounded-3xl border border-white/10 bg-[#121216] p-6 md:p-8">
          <h2 className="font-display text-2xl font-bold tracking-[-0.01em]">プロフィール</h2>
          <div className="mt-5 space-y-4 text-sm leading-8 text-[#c7c5c9]">
            <p>
              沢坂弘樹は、株式会社ルーキースマートジャパン代表として、ルキスマLABの売上実験インフラを設計しています。
              広告・Web・CRM・商談・受注データをつなぎ、仮説を試し、勝ち筋へ資源を配分できる仕組みづくりを行っています。
            </p>
            <p>
              外資SaaS日本法人の立ち上げ、ITスタートアップでのCRO経験、IT法人営業とDX/AIX業務コンサルティングの経験をもとに、
              事業設計からデータ収集、統計モデル、営業・マーケティング現場の実装までを一気通貫で支援します。
            </p>
          </div>
          <dl className="mt-6 space-y-4">
            {careerItems.map(([label, value]) => (
              <div
                key={label}
                className="grid gap-1 border-t border-white/10 pt-4 md:grid-cols-[150px_1fr]"
              >
                <dt className="text-[10px] uppercase tracking-[0.12em] text-[#7e7c83]">{label}</dt>
                <dd className="text-sm leading-7 text-[#c7c5c9]">{value}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-[1fr_1fr]">
          <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 md:p-8">
            <h2 className="font-display text-2xl font-bold tracking-[-0.01em]">
              沢坂弘樹が支援する領域
            </h2>
            <ul className="mt-5 space-y-3 text-sm leading-7 text-[#c7c5c9]">
              {supportItems.map((item) => (
                <li key={item} className="border-t border-white/10 pt-3">
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 md:p-8">
            <h2 className="font-display text-2xl font-bold tracking-[-0.01em]">
              沢坂弘樹に関するFAQ
            </h2>
            <div className="mt-5 space-y-4">
              {profileFaqItems.map((item) => (
                <div key={item.question} className="border-t border-white/10 pt-4">
                  <h3 className="text-sm font-semibold text-[#e7e5ea]">{item.question}</h3>
                  <p className="mt-2 text-sm leading-7 text-[#c7c5c9]">{item.answer}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </section>
    </main>
  )
}
