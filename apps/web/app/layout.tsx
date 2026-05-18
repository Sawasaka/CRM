import type { Metadata } from 'next'
import { DM_Sans, Inter, Plus_Jakarta_Sans } from 'next/font/google'
import { SessionProvider } from 'next-auth/react'
import { TRPCProvider } from '@/lib/trpc/provider'
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
  title: 'ルキスマCRM — 営業データから、何でも答えるチャットCRM',
  description: 'PDM視点CRM × 企業マスター — 顧客の声をプロダクトに還元する受注実行基盤',
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: '32x32' },
    ],
    shortcut: '/icon.svg',
    apple: '/icon.svg',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body className={`${dmSans.variable} ${inter.variable} ${plusJakarta.variable}`}>
        <SessionProvider>
          <TRPCProvider>
            {children}
          </TRPCProvider>
        </SessionProvider>
      </body>
    </html>
  )
}
