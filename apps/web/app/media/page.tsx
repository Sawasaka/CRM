import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { companyName, operatorName, publicSiteUrl, serviceName } from '@/lib/public-site'
import { FDEMediaHub } from './FDEMediaHub'

const mediaPath = '/media'
const mediaUrl = `${publicSiteUrl}${mediaPath}`
const title = 'FDE AI Lab｜FDE・AI実装・パランティアモデルを読み解く'
const description =
  'FDE AI Labは、FDE / Forward Deployed Engineer、FDEの事例、FDEニュース、FDE採用、パランティアモデルを扱う専門メディアです。'

const mediaTopics = [
  'FDE',
  'FDEとは',
  'Forward Deployed Engineer',
  'Forward Deployed Engineerとは',
  'FDE 事例',
  'FDE ニュース',
  'FDE 採用',
  'FDE 求人',
  'パランティアモデル',
  'Palantir',
  'AI実装',
  'AI導入',
  '営業AIエージェント',
  'AI CRM',
]

export const metadata: Metadata = {
  metadataBase: new URL(publicSiteUrl),
  title,
  description,
  keywords: [...mediaTopics, serviceName, companyName, operatorName],
  alternates: {
    canonical: mediaPath,
  },
  openGraph: {
    title,
    description,
    url: mediaUrl,
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

const collectionJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  '@id': `${mediaUrl}#collection`,
  name: title,
  url: mediaUrl,
  description,
  inLanguage: 'ja-JP',
  isPartOf: {
    '@id': `${publicSiteUrl}/#website`,
  },
  publisher: {
    '@id': `${publicSiteUrl}/#organization`,
  },
  about: mediaTopics,
  mainEntity: {
    '@type': 'ItemList',
    itemListElement: ['FDEの事例', 'FDEニュース', 'FDE採用', 'パランティアモデル'].map((name, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name,
      url: `${mediaUrl}#${index + 1}`,
    })),
  },
}

const breadcrumbJsonLd = {
  '@context': 'https://schema.org',
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
      name: 'FDE AI Lab',
      item: mediaUrl,
    },
  ],
}

export default function MediaHubPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-obsidian text-[#e7e5ea]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify([collectionJsonLd, breadcrumbJsonLd]) }}
      />

      <section className="relative">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'linear-gradient(180deg, rgba(171,199,255,0.12) 0%, transparent 42%), linear-gradient(90deg, rgba(200,185,255,0.10), transparent 36%, rgba(255,141,207,0.07))',
          }}
        />
        <div className="relative mx-auto max-w-6xl px-6 py-16 md:py-24">
          <Link
            href="/lp"
            className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.12em] text-aurora/80 transition-colors hover:text-aurora"
          >
            <ArrowRight size={14} className="rotate-180" />
            FDE CRM 公式HPへ
          </Link>

          <div className="mt-10 max-w-4xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#c8b9ff]">
              FDE MEDIA / ECONOMIC BOARD
            </p>
            <h1 className="mt-5 font-display text-[2.7rem] font-bold leading-[1.02] tracking-[-0.03em] md:text-[5rem]">
              FDE AI Lab
            </h1>
            <p className="mt-5 text-lg font-semibold leading-8 text-[#e7e5ea] md:text-2xl">
              FDE・AI実装・パランティアモデルを読み解く
            </p>
            <p className="mt-5 max-w-3xl text-sm leading-8 text-[#c7c5c9] md:text-base">
              FDE / Forward Deployed Engineerという新しい概念を、日本語でわかりやすく整理する専門メディアです。
              FDEの事例、ニュース、採用、パランティアモデルを、クリック前から内容が見える番組ボードのように扱います。
            </p>
          </div>
        </div>
      </section>

      <FDEMediaHub />
    </main>
  )
}
