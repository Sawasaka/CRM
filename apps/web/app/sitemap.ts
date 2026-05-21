import type { MetadataRoute } from 'next'
import { legalDocuments } from './legal/_content'

const siteUrl =
  process.env.AUTH_URL ??
  process.env.NEXTAUTH_URL ??
  process.env.NEXT_PUBLIC_APP_URL ??
  'https://www.rookiesmart-jp.com'

const baseUrl = siteUrl.replace(/\/+$/, '')

export default function sitemap(): MetadataRoute.Sitemap {
  const legalPages = legalDocuments.map((document) => ({
    url: `${baseUrl}/legal/${document.slug}`,
    lastModified: document.updatedAt,
    changeFrequency: 'monthly' as const,
    priority: 0.4,
  }))

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${baseUrl}/legal`,
      lastModified: new Date('2026-05-17'),
      changeFrequency: 'monthly',
      priority: 0.4,
    },
    ...legalPages,
  ]
}
