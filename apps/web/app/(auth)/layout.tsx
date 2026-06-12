import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
  icons: {
    icon: [
      { url: '/service-icon.svg?v=unified-service-favicon-20260611', type: 'image/svg+xml' },
      { url: '/service-favicon.ico?v=unified-service-favicon-20260611', sizes: '32x32' },
    ],
    shortcut: '/service-icon.svg?v=unified-service-favicon-20260611',
    apple: '/service-icon.svg?v=unified-service-favicon-20260611',
  },
}

export default function AuthLayout({ children }: { children: ReactNode }) {
  return children
}
