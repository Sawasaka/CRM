import type { Metadata } from 'next'
import localFont from 'next/font/local'
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

// Keep the current typography while making production builds independent
// from Google Fonts network availability.
const dmSans = localFont({
  src: './fonts/DMSans-Latin-Variable.woff2',
  variable: '--font-sans-legacy',
  display: 'swap',
  weight: '300 700',
})

const inter = localFont({
  src: './fonts/Inter-Latin-Variable.woff2',
  variable: '--font-body',
  display: 'swap',
  weight: '400 700',
})

const plusJakarta = localFont({
  src: './fonts/PlusJakartaSans-Latin-Variable.woff2',
  variable: '--font-display',
  display: 'swap',
  weight: '500 800',
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
        url: '/brand/rookie-smart-japan/rsj-corporate-cat-favicon-16.png?v=20260811-max-zoom',
        sizes: '16x16',
        type: 'image/png',
      },
      {
        url: '/brand/rookie-smart-japan/rsj-corporate-cat-favicon-32.png?v=20260811-max-zoom',
        sizes: '32x32',
        type: 'image/png',
      },
      {
        url: '/brand/rookie-smart-japan/rsj-corporate-cat-favicon-48.png?v=20260811-max-zoom',
        sizes: '48x48',
        type: 'image/png',
      },
    ],
    shortcut: '/brand/rookie-smart-japan/rsj-corporate-cat-favicon-32.png?v=20260811-max-zoom',
    apple: '/brand/rookie-smart-japan/rsj-corporate-cat-favicon-180.png?v=20260811-max-zoom',
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
