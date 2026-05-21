import type { MetadataRoute } from 'next'

const siteUrl =
  process.env.AUTH_URL ??
  process.env.NEXTAUTH_URL ??
  process.env.NEXT_PUBLIC_APP_URL ??
  'https://www.rookiesmart-jp.com'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/api/',
        '/dashboard',
        '/settings',
        '/admin',
      ],
    },
    sitemap: `${siteUrl.replace(/\/+$/, '')}/sitemap.xml`,
    host: siteUrl.replace(/\/+$/, ''),
  }
}
