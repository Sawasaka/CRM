import type { MetadataRoute } from 'next'
import { publicSiteDescription, publicSiteUrl, serviceName } from '@/lib/public-site'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${serviceName} - 株式会社ルーキースマートジャパン`,
    short_name: serviceName,
    description: publicSiteDescription,
    start_url: publicSiteUrl,
    scope: publicSiteUrl,
    display: 'standalone',
    background_color: '#0e0e10',
    theme_color: '#0e0e10',
    lang: 'ja',
    icons: [
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'maskable',
      },
    ],
  }
}
