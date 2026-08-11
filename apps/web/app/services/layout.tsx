import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { companyName, publicSiteUrl, serviceSearchName } from '@/lib/public-site'

export const metadata: Metadata = {
  metadataBase: new URL(publicSiteUrl),
  title: {
    default: `法人向けサービス｜${serviceSearchName}｜${companyName}`,
    template: `%s｜${serviceSearchName}｜${companyName}`,
  },
  description:
    'ルキスマLABは、Go-to-Market設計とマーケティング基盤設計を通じて、事業の実行と学習が続く仕組みを構築します。',
  openGraph: {
    siteName: companyName,
    type: 'website',
    locale: 'ja_JP',
    images: [{ url: '/corporate-og.svg', width: 1200, height: 630, alt: companyName }],
  },
  robots: { index: true, follow: true },
}

export default function ServicesLayout({ children }: { children: ReactNode }) {
  return children
}
