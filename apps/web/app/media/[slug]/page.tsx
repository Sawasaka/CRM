import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, ExternalLink } from 'lucide-react'
import { fdeAIArticles, getFDEAIArticle } from '@/lib/fde-ai-lab'
import { companyName, operatorName, publicSiteUrl, serviceName } from '@/lib/public-site'

type PageProps = {
  params: Promise<{
    slug: string
  }>
}

export function generateStaticParams() {
  return fdeAIArticles.map((article) => ({
    slug: article.slug,
  }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const article = getFDEAIArticle(slug)
  if (!article) return {}

  const path = `/media/${article.slug}`
  const url = `${publicSiteUrl}${path}`
  const title = `${article.shortTitle}｜FDEの事例｜FDE AI Lab`
  const imageUrl = `${publicSiteUrl}${article.image}`

  return {
    metadataBase: new URL(publicSiteUrl),
    title,
    description: article.description,
    keywords: [...article.keywords, 'FDE AI Lab', serviceName, companyName, operatorName],
    alternates: {
      canonical: path,
    },
    openGraph: {
      title,
      description: article.description,
      url,
      siteName: serviceName,
      type: 'article',
      locale: 'ja_JP',
      images: [
        {
          url: imageUrl,
          width: 960,
          height: 540,
          alt: `${article.title} のサムネイル`,
        },
      ],
      publishedTime: article.publishedAt,
      modifiedTime: article.updatedAt,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: article.description,
      images: [imageUrl],
    },
    robots: {
      index: true,
      follow: true,
    },
  }
}

export default async function FDEAIArticlePage({ params }: PageProps) {
  const { slug } = await params
  const article = getFDEAIArticle(slug)
  if (!article) notFound()

  const articleUrl = `${publicSiteUrl}/media/${article.slug}`
  const imageUrl = `${publicSiteUrl}${article.image}`
  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    '@id': `${articleUrl}#article`,
    headline: article.title,
    description: article.description,
    image: imageUrl,
    datePublished: article.publishedAt,
    dateModified: article.updatedAt,
    inLanguage: 'ja-JP',
    author: {
      '@type': 'Organization',
      name: 'FDE AI Lab',
      url: `${publicSiteUrl}/media`,
    },
    publisher: {
      '@id': `${publicSiteUrl}/#organization`,
    },
    mainEntityOfPage: articleUrl,
    keywords: article.keywords,
    about: ['FDE', 'Forward Deployed Engineer', 'FDEの事例', 'AI実装', 'パランティアモデル'],
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
        item: `${publicSiteUrl}/media`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: article.shortTitle,
        item: articleUrl,
      },
    ],
  }

  return (
    <main className="min-h-screen overflow-hidden bg-obsidian text-[#e7e5ea]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify([articleJsonLd, breadcrumbJsonLd]) }}
      />

      <article>
        <section className="relative">
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                `linear-gradient(180deg, ${article.color}18 0%, transparent 42%), linear-gradient(90deg, ${article.color}12, transparent 36%, rgba(255,255,255,0.03))`,
            }}
          />
          <div className="relative mx-auto max-w-5xl px-6 py-14 md:py-20">
            <Link
              href="/media"
              className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.12em] text-aurora/80 transition-colors hover:text-aurora"
            >
              <ArrowLeft size={14} />
              FDE AI Labへ戻る
            </Link>

            <div className="mt-10">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className="rounded-full px-3 py-1.5 text-[11px] font-semibold tracking-[0.12em]"
                  style={{ background: `${article.color}18`, color: article.color }}
                >
                  FDEの事例
                </span>
                <time className="text-[11px] font-semibold text-[#7e7c83]" dateTime={article.publishedAt}>
                  {article.publishedAt}
                </time>
              </div>

              <h1 className="mt-5 max-w-4xl font-display text-[2.15rem] font-bold leading-tight tracking-[-0.03em] md:text-[4.3rem]">
                {article.title}
              </h1>
              <p className="mt-6 max-w-3xl text-base font-semibold leading-8 text-[#d7d4dd] md:text-xl">
                {article.description}
              </p>
            </div>

            <div className="relative mt-10 aspect-video overflow-hidden rounded-2xl border border-white/[0.08] fo-glass-rim">
              <Image
                src={article.image}
                alt={`${article.title} のサムネイル`}
                fill
                priority
                sizes="(min-width: 1024px) 960px, 100vw"
                className="object-cover"
              />
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-5xl gap-8 px-6 pb-20 lg:grid-cols-[0.72fr_0.28fr]">
          <div className="space-y-8">
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.035] p-6 fo-glass-rim md:p-8">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em]" style={{ color: article.color }}>
                FDE視点
              </p>
              <p className="mt-4 text-base font-semibold leading-8 text-[#e7e5ea]">{article.fdeView}</p>
            </div>

            {article.sections.map((section) => (
              <section key={section.heading} className="rounded-2xl border border-white/[0.08] bg-[#111216] p-6 md:p-8">
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
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em]" style={{ color: article.color }}>
                キーワード
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {article.keywords.map((keyword) => (
                  <span key={keyword} className="rounded-full border border-white/[0.08] bg-black/20 px-2.5 py-1 text-[11px] text-[#c7c5c9]">
                    {keyword}
                  </span>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.035] p-5 fo-glass-rim">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em]" style={{ color: article.color }}>
                参照情報
              </p>
              <div className="mt-4 space-y-3">
                {article.sourceUrls.map((source) => (
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
