import type { Metadata } from 'next'
import { Suspense, type ReactNode } from 'react'
import { Sidebar } from '@/components/layout/sidebar'
import { Header } from '@/components/layout/header'
import { ActiveCallWidget } from '@/components/calls/ActiveCallWidget'
import { CallResultModal } from '@/components/calls/CallResultModal'

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

const DEV_USER = {
  name: '開発 太郎',
  email: 'dev@bgm.app',
  image: null,
}

async function getSessionUser() {
  if (process.env.NEXT_PUBLIC_DEV_MODE === 'true') {
    return DEV_USER
  }
  const { auth } = await import('@/lib/auth')
  const { redirect } = await import('next/navigation')
  const session = await auth()
  if (!session?.user) {
    redirect('/login?callbackUrl=/')
  }
  return (session as NonNullable<typeof session>).user
}

export default async function AppLayout({ children }: { children: ReactNode }) {
  // 認証リダイレクトの副作用を発火させるために呼び出すのみ
  await getSessionUser()

  return (
    <div
      className="min-h-screen relative"
      style={{ backgroundColor: 'var(--color-obs-surface)', color: 'var(--color-obs-text)' }}
    >
      <Suspense fallback={null}>
        <Sidebar />
      </Suspense>
      <Header />
      <main
        className="relative pt-[56px] min-h-screen transition-[margin-left] duration-200"
        style={{
          marginLeft: 'var(--bgm-sidebar-w)',
          zIndex: 1,
          transitionTimingFunction: 'var(--ease-liquid)',
        }}
      >
        {children}
      </main>
      <ActiveCallWidget />
      <CallResultModal />
    </div>
  )
}
