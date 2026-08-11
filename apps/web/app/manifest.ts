import type { MetadataRoute } from 'next'
import { companyName, publicSiteDescription, publicSiteUrl } from '@/lib/public-site'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: companyName,
    short_name: 'ROOKIE SMART',
    description: publicSiteDescription,
    start_url: publicSiteUrl,
    scope: publicSiteUrl,
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#0b3155',
    lang: 'ja',
    icons: [
      {
        src: '/brand/rookie-smart-japan/rsj-corporate-cat-favicon-512.png?v=20260811-max-zoom',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
    ],
  }
}
