import type { Metadata } from 'next'
import { DM_Sans, Inter, Plus_Jakarta_Sans } from 'next/font/google'
import { SessionProvider } from 'next-auth/react'
import { GoogleAnalytics } from '@/components/analytics/GoogleAnalytics'
import {
  googleSiteVerification,
  publicSiteDescription,
  publicSiteKeywords,
  publicSiteTitle,
  publicSiteUrl,
  serviceName,
} from '@/lib/public-site'
import { TRPCProvider } from '@/lib/trpc/provider'
import { ViewTransitionProvider } from '@/components/view-transitions'
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
    siteName: serviceName,
    type: 'website',
    locale: 'ja_JP',
  },
  twitter: {
    card: 'summary',
    title: publicSiteTitle,
    description: publicSiteDescription,
  },
  verification: googleSiteVerification
    ? {
        google: googleSiteVerification,
      }
    : undefined,
  icons: {
    icon: [
      { url: '/icon.svg?v=hp-black-1-20260531-final', type: 'image/svg+xml' },
      { url: '/favicon.ico?v=hp-black-1-20260531-final', sizes: '32x32' },
    ],
    shortcut: '/icon.svg?v=hp-black-1-20260531-final',
    apple: '/icon.svg?v=hp-black-1-20260531-final',
  },
  manifest: '/manifest.webmanifest',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body className={`${dmSans.variable} ${inter.variable} ${plusJakarta.variable}`}>
        <SessionProvider>
          <TRPCProvider>
            <ViewTransitionProvider>{children}</ViewTransitionProvider>
          </TRPCProvider>
        </SessionProvider>
        <GoogleAnalytics />
      </body>
    </html>
  )
}
