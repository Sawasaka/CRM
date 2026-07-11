import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, ExternalLink, Sparkles } from 'lucide-react'
import { aiTipsColumns, getAITipsColumn } from '@/lib/ai-tips-columns'
import { companyName, publicSiteUrl, serviceName } from '@/lib/public-site'

type PageProps = {
  params: Promise<{
    slug: string
  }>
}

export function generateStaticParams() {
  return aiTipsColumns.map((column) => ({
    slug: column.slug,
  }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const column = getAITipsColumn(slug)
  if (!column) return {}

  const path = `/columns/${column.slug}`
  const url = `${publicSiteUrl}${path}`
  const imageUrl = `${publicSiteUrl}${column.image}`

  return {
    metadataBase: new URL(publicSiteUrl),
    title: `${column.shortTitle}｜実務コラム`,
    description: column.description,
    keywords: [...column.keywords, 'AI Tips', serviceName, companyName],
    alternates: {
      canonical: path,
    },
    openGraph: {
      title: column.title,
      description: column.description,
      url,
      siteName: serviceName,
      type: 'article',
      locale: 'ja_JP',
      images: [
        {
          url: imageUrl,
          width: 960,
          height: 540,
          alt: `${column.title} のサムネイル`,
        },
      ],
      publishedTime: column.publishedAt,
      modifiedTime: column.updatedAt,
    },
    twitter: {
      card: 'summary_large_image',
      title: column.title,
      description: column.description,
      images: [imageUrl],
    },
  }
}

export default async function ColumnDetailPage({ params }: PageProps) {
  const { slug } = await params
  const column = getAITipsColumn(slug)
  if (!column) notFound()

  const columnUrl = `${publicSiteUrl}/columns/${column.slug}`
  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    '@id': `${columnUrl}#article`,
    headline: column.title,
    description: column.description,
    image: `${publicSiteUrl}${column.image}`,
    datePublished: column.publishedAt,
    dateModified: column.updatedAt,
    inLanguage: 'ja-JP',
    author: {
      '@type': 'Organization',
      name: serviceName,
      url: publicSiteUrl,
    },
    publisher: {
      '@id': `${publicSiteUrl}/#organization`,
    },
    mainEntityOfPage: columnUrl,
    keywords: column.keywords,
  }

  return (
    <main className="min-h-screen overflow-hidden bg-obsidian text-[#e7e5ea]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />

      <article>
        <section className="relative">
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background: `radial-gradient(circle at 30% 18%, ${column.accent}24, transparent 34%), linear-gradient(180deg, ${column.accent}10, transparent 48%)`,
            }}
          />
          <div className="relative mx-auto max-w-5xl px-6 py-14 md:py-20">
            <Link
              href="/columns"
              className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.12em] text-aurora/80 transition-colors hover:text-aurora"
            >
              <ArrowLeft size={14} />
              AI Tips コラム一覧へ戻る
            </Link>

            <div className="mt-10">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className="rounded-full px-3 py-1.5 text-[11px] font-semibold tracking-[0.12em]"
                  style={{ background: `${column.accent}18`, color: column.accent }}
                >
                  {column.category}
                </span>
                <span className="rounded-full bg-white/[0.06] px-3 py-1.5 text-[11px] font-semibold text-[#c7c5c9]">
                  {column.label}
                </span>
                <span className="rounded-full bg-white/[0.06] px-3 py-1.5 text-[11px] font-semibold text-[#c7c5c9]">
                  {column.genre}
                </span>
                <time className="text-[11px] font-semibold text-[#7e7c83]" dateTime={column.newsPublishedAt}>
                  News {column.newsPublishedAt}
                </time>
              </div>

              <h1 className="mt-5 max-w-4xl font-display text-[2.05rem] font-bold leading-tight tracking-[-0.03em] md:text-[4rem]">
                {column.title}
              </h1>
              <p className="mt-6 max-w-3xl text-base font-semibold leading-8 text-[#d7d4dd] md:text-xl">
                {column.description}
              </p>
            </div>

            <div className="relative mt-10 aspect-video overflow-hidden rounded-2xl border border-white/[0.08] fo-glass-rim">
              <Image
                src={column.image}
                alt={`${column.title} のサムネイル`}
                fill
                priority
                sizes="(min-width: 1024px) 960px, 100vw"
                className="object-cover"
              />
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-5xl gap-8 px-6 pb-20 lg:grid-cols-[0.68fr_0.32fr]">
          <div className="space-y-8">
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.035] p-6 fo-glass-rim md:p-8">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em]" style={{ color: column.accent }}>
                Summary / 実務での要点
              </p>
              <p className="mt-4 text-base font-semibold leading-8 text-[#e7e5ea]">{column.lead}</p>
            </div>

            {column.sections.map((section, index) => (
              <section
                key={section.heading}
                id={`section-${index + 1}`}
                className="rounded-2xl border border-white/[0.08] bg-[#111216] p-6 md:p-8"
              >
                <h2 className="font-display text-[1.45rem] font-bold leading-tight text-[#f4f3f7] md:text-[1.85rem]">
                  {section.heading}
                </h2>
                <div className="mt-5 space-y-4">
                  {section.body.map((paragraph) => (
                    <p key={paragraph} className="text-sm leading-8 text-[#c7c5c9] md:text-base">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </section>
            ))}
          </div>

          <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.035] p-5 fo-glass-rim">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em]" style={{ color: column.accent }}>
                AI Tips
              </p>
              <div className="mt-4 space-y-3">
                {column.tips.map((tip) => (
                  <div key={tip} className="flex gap-3 rounded-xl bg-black/24 p-3 text-[12px] leading-6 text-[#d7d4dd]">
                    <Sparkles size={14} className="mt-1 shrink-0" color={column.accent} />
                    {tip}
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.035] p-5 fo-glass-rim">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em]" style={{ color: column.accent }}>
                Article Data
              </p>
              <div className="mt-4 space-y-2 text-[12px] leading-6 text-[#c7c5c9]">
                <p>ニュース公開日: {column.newsPublishedAt}</p>
                <p>コラム追加日: {column.publishedAt}</p>
                <p>参照元: {column.sourceName}</p>
              </div>
            </div>

            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.035] p-5 fo-glass-rim">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em]" style={{ color: column.accent }}>
                実務参照
              </p>
              <div className="mt-4 space-y-3">
                {column.sourceUrls.map((source) => (
                  <a
                    key={source.url}
                    href={source.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex gap-2 text-[12px] font-semibold leading-5 text-[#c7c5c9] transition-colors hover:text-white"
                  >
                    <ExternalLink size={14} className="mt-0.5 shrink-0" />
                    {source.label}
                  </a>
                ))}
              </div>
            </div>
          </aside>
        </section>
      </article>
    </main>
  )
}
