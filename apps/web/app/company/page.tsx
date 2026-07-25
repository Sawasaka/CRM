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
const description = `${companyName}は、営業・マーケティング領域の売上実験インフラを設計・実装する会社です。代表の${operatorName}が、データ収集、確率モデル、ベイズ統計、実験配分までを支援します。`

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
    operatorName,
    'レベニューインフラ設計',
    'マーケティング分析',
    'データ収集基盤',
    'ベイズ統計',
    'バンディットアルゴリズム',
    'FDE',
  ],
  alternates: { canonical: companyProfilePath },
  openGraph: {
    title,
    description,
    url: companyProfilePath,
    siteName: serviceSearchName,
    type: 'website',
    locale: 'ja_JP',
  },
  twitter: { card: 'summary', title, description },
  robots: { index: true, follow: true },
}

const companyJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': `${publicSiteUrl}/#organization`,
  name: companyName,
  legalName: companyName,
  alternateName: ['ルーキースマートジャパン', 'RookieSmart Japan', serviceSearchName],
  url: companyProfileUrl,
  logo: `${publicSiteUrl}/icon.svg`,
  description,
  founder: { '@id': operatorPersonId },
  brand: { '@id': `${publicSiteUrl}/#service` },
  mainEntityOfPage: companyProfileUrl,
}

const companyFacts = [
  ['会社名', companyName],
  ['サービス', serviceName],
  ['代表', operatorName],
  ['所在地', '東京都 中央区'],
  ['事業領域', '売上実験インフラ / データ収集 / 統計分析 / FDE実装'],
]

const serviceSteps = [
  'レベニューインフラ設計',
  '確率モデル設計',
  'データ収集インフラ設計',
  'ベイズ統計モデル設計',
  'バンディット配分エンジン設計',
]

export default function CompanyPage() {
  return (
    <main className="min-h-screen bg-[#0b0f15] text-[#e7ecf3]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(companyJsonLd) }}
      />

      <section className="border-b border-white/[0.08]">
        <div className="mx-auto max-w-5xl px-6 py-16 md:py-24">
          <Link
            href="/"
            className="text-xs font-semibold tracking-[0.12em] text-[#72b5ff] hover:text-white"
          >
            ルキスマLABへ戻る
          </Link>
          <p className="mt-12 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[#67dfb0]">
            Official company profile
          </p>
          <h1 className="mt-4 max-w-4xl font-display text-[2.45rem] font-bold leading-tight md:text-[4rem]">
            株式会社ルーキースマートジャパン
          </h1>
          <p className="mt-6 max-w-3xl text-base leading-8 text-[#b7c0cc]">
            営業・マーケティングの現場とデータをつなぎ、仮説を試し、正しく測り、
            勝ち筋へ資源を配分できるRevenue Experiment Infrastructureを設計・実装します。
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-16">
        <div className="grid gap-3 md:grid-cols-2">
          {companyFacts.map(([label, value]) => (
            <div key={label} className="rounded-lg border border-white/[0.09] bg-white/[0.025] p-5">
              <p className="text-[0.58rem] uppercase tracking-[0.14em] text-[#737d8c]">{label}</p>
              <p className="mt-2 text-sm font-semibold leading-7">{value}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 rounded-lg border border-white/[0.1] bg-[#0f141c] p-6 md:p-8">
          <p className="text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-[#72b5ff]">
            What we build
          </p>
          <h2 className="mt-3 font-display text-2xl font-bold">{serviceName}</h2>
          <p className="mt-4 max-w-3xl text-sm leading-8 text-[#aeb7c4]">
            広告、Web解析、CRM、商談、受注・継続データを一つの意思決定サイクルへ接続します。
            レポート作成で終わらず、次の実験と配分変更まで運用できる状態を目指します。
          </p>
          <div className="mt-7 grid gap-2 sm:grid-cols-5">
            {serviceSteps.map((step, index) => (
              <div key={step} className="rounded-lg border border-white/[0.08] p-3">
                <span className="text-[0.56rem] font-bold text-[#67dfb0]">0{index + 1}</span>
                <p className="mt-2 text-[0.66rem] font-semibold leading-5">{step}</p>
              </div>
            ))}
          </div>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              href="/"
              className="rounded-lg bg-[#72b5ff] px-5 py-2.5 text-sm font-bold text-[#07111f]"
            >
              サービスを見る
            </Link>
            <Link
              href={operatorProfilePath}
              className="rounded-lg border border-white/15 px-5 py-2.5 text-sm font-semibold"
            >
              代表プロフィールを見る
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
