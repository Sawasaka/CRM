import type { Metadata } from 'next'
import { DM_Sans, Inter, Plus_Jakarta_Sans } from 'next/font/google'
import { GoogleAnalytics } from '@/components/analytics/GoogleAnalytics'
import { AppProviders } from '@/components/app-providers'
import {
  googleSiteVerification,
  companyName,
  publicSiteDescription,
  publicSiteKeywords,
  publicSiteTitle,
  publicSiteUrl,
} from '@/lib/public-site'
import './globals.css'

// Legacy（既存UI互換）
const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-sans-legacy',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700'],
})

// Liquid Obsidian — body/UI
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
})

// Liquid Obsidian — display/headline
const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
  weight: ['500', '600', '700', '800'],
})

export const metadata: Metadata = {
  metadataBase: new URL(publicSiteUrl),
  title: publicSiteTitle,
  description: publicSiteDescription,
  keywords: publicSiteKeywords,
  alternates: {
    canonical: '/',
  },
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
  verification: googleSiteVerification
    ? {
        google: googleSiteVerification,
      }
    : undefined,
  icons: {
    icon: [
      {
        url: '/brand/rookie-smart-japan/rsj-favicon-premium-01-white-card-r.svg',
        type: 'image/svg+xml',
      },
      {
        url: '/brand/rookie-smart-japan/rsj-favicon-premium-01-white-card-r-32.png',
        sizes: '32x32',
        type: 'image/png',
      },
    ],
    shortcut: '/brand/rookie-smart-japan/rsj-favicon-premium-01-white-card-r.svg',
    apple: '/brand/rookie-smart-japan/rsj-favicon-premium-01-white-card-r-180.png',
  },
  manifest: '/manifest.webmanifest',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body className={`${dmSans.variable} ${inter.variable} ${plusJakarta.variable}`}>
        <AppProviders>{children}</AppProviders>
        <GoogleAnalytics />
      </body>
    </html>
  )
}
