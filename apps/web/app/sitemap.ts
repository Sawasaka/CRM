import type { MetadataRoute } from 'next'
import { publicSiteUrl } from '@/lib/public-site'
import { publicLegalDocuments } from './legal/_content'

export default function sitemap(): MetadataRoute.Sitemap {
  const legalPages = publicLegalDocuments.map((document) => ({
    url: `${publicSiteUrl}/legal/${document.slug}`,
    lastModified: document.updatedAt,
    changeFrequency: 'monthly' as const,
    priority: 0.4,
  }))
  return [
    {
      url: publicSiteUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${publicSiteUrl}/services`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.95,
    },
    {
      url: `${publicSiteUrl}/hiroki-sawasaka`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${publicSiteUrl}/legal`,
      lastModified: new Date('2026-05-17'),
      changeFrequency: 'monthly',
      priority: 0.4,
    },
    ...legalPages,
  ]
}
