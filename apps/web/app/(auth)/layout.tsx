import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
  icons: {
    icon: [
      { url: '/service-icon.svg', type: 'image/svg+xml' },
      { url: '/service-favicon.ico', sizes: '32x32' },
    ],
    shortcut: '/service-icon.svg',
    apple: '/service-icon.svg',
  },
}

export default function AuthLayout({ children }: { children: ReactNode }) {
  return children
}
