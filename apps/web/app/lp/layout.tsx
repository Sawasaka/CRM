import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import {
  googleSiteVerification,
  publicSiteDescription,
  publicSiteKeywords,
  publicSiteTitle,
  publicSiteUrl,
  serviceName,
} from '@/lib/public-site'

export const metadata: Metadata = {
  metadataBase: new URL(publicSiteUrl),
  title: publicSiteTitle,
  description: publicSiteDescription,
  keywords: publicSiteKeywords,
  openGraph: {
    title: publicSiteTitle,
    description: publicSiteDescription,
    url: '/',
    siteName: serviceName,
    type: 'website',
    locale: 'ja_JP',
  },
  twitter: {
    card: 'summary',
    title: publicSiteTitle,
    description: publicSiteDescription,
  },
  alternates: {
    canonical: '/',
  },
  robots: {
    index: true,
    follow: true,
  },
  verification: googleSiteVerification
    ? {
        google: googleSiteVerification,
      }
    : undefined,
}

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="bg-obsidian text-[#e7e5ea] min-h-screen">
      {children}
    </div>
  )
}
