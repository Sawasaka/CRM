import type { MetadataRoute } from 'next'
import { aiTipsColumns } from '@/lib/ai-tips-columns'
import { fdeAIArticles } from '@/lib/fde-ai-lab'
import { companyProfileUrl, operatorProfileUrl, publicSiteUrl } from '@/lib/public-site'
import { legalDocuments } from './legal/_content'

export default function sitemap(): MetadataRoute.Sitemap {
  const legalPages = legalDocuments.map((document) => ({
    url: `${publicSiteUrl}/legal/${document.slug}`,
    lastModified: document.updatedAt,
    changeFrequency: 'monthly' as const,
    priority: 0.4,
  }))
  const fdeAIArticlePages = fdeAIArticles.map((article) => ({
    url: `${publicSiteUrl}/media/${article.slug}`,
    lastModified: new Date(article.updatedAt),
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }))
  const aiTipsColumnPages = aiTipsColumns.map((column) => ({
    url: `${publicSiteUrl}/columns/${column.slug}`,
    lastModified: new Date(column.updatedAt),
    changeFrequency: 'monthly' as const,
    priority: 0.78,
  }))

  return [
    {
      url: publicSiteUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: operatorProfileUrl,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.95,
    },
    {
      url: companyProfileUrl,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${publicSiteUrl}/media`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.85,
    },
    ...fdeAIArticlePages,
    {
      url: `${publicSiteUrl}/columns`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.82,
    },
    ...aiTipsColumnPages,
    {
      url: `${publicSiteUrl}/legal`,
      lastModified: new Date('2026-05-17'),
      changeFrequency: 'monthly',
      priority: 0.4,
    },
    ...legalPages,
  ]
}
