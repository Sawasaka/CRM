import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
  icons: {
    icon: [
      { url: '/service-icon.svg?v=service-black-2-20260531-final', type: 'image/svg+xml' },
      { url: '/service-favicon.ico?v=service-black-2-20260531-final', sizes: '32x32' },
    ],
    shortcut: '/service-icon.svg?v=service-black-2-20260531-final',
    apple: '/service-icon.svg?v=service-black-2-20260531-final',
  },
}

export default function AuthLayout({ children }: { children: ReactNode }) {
  return children
}
