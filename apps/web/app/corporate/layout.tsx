import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import {
  companyName,
  publicSiteDescription,
  publicSiteKeywords,
  publicSiteTitle,
  publicSiteUrl,
} from '@/lib/public-site'

export const metadata: Metadata = {
  metadataBase: new URL(publicSiteUrl),
  title: publicSiteTitle,
  description: publicSiteDescription,
  keywords: publicSiteKeywords,
  alternates: { canonical: '/' },
  openGraph: {
    title: publicSiteTitle,
    description: publicSiteDescription,
    url: '/',
    siteName: companyName,
    type: 'website',
    locale: 'ja_JP',
    images: [{ url: '/corporate-og.svg', width: 1200, height: 630, alt: companyName }],
  },
  twitter: {
    card: 'summary_large_image',
    title: publicSiteTitle,
    description: publicSiteDescription,
    images: ['/corporate-og.svg'],
  },
  robots: { index: true, follow: true },
}

export default function CorporateLayout({ children }: { children: ReactNode }) {
  return children
}
