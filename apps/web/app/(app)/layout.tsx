import type { Metadata } from 'next'
import { Suspense, type ReactNode } from 'react'
import { Sidebar } from '@/components/layout/sidebar'
import { Header } from '@/components/layout/header'
import { ActiveCallWidget } from '@/components/calls/ActiveCallWidget'
import { CallResultModal } from '@/components/calls/CallResultModal'
import { PRODUCT_BACKGROUND_COLOR, PRODUCT_BACKGROUND_IMAGE } from '@/lib/product-background'

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

const DEV_USER = {
  name: '開発 太郎',
  email: 'dev@bgm.app',
  image: null,
}

async function getSessionUser() {
  const { auth } = await import('@/lib/auth')
  const { redirect } = await import('next/navigation')
  const session = await auth()
  const user = session?.user
  if (!user && process.env.NEXT_PUBLIC_DEV_MODE === 'true') {
    return DEV_USER
  }
  if (!user) {
    redirect('/login?callbackUrl=/')
    return DEV_USER
  }
  await ensureTenantAccess(user.id)
  return user
}

async function ensureTenantAccess(userId?: string) {
  if (!userId) return
  const { prisma } = await import('@bgm/db')
  const { redirect } = await import('next/navigation')
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      org: {
        select: {
          id: true,
          slug: true,
          lifecycleStatus: true,
          demoExpiresAt: true,
        },
      },
    },
  })
  const org = user?.org
  if (!org) {
    redirect('/login?error=TenantNotFound')
    return
  }
  if (org.lifecycleStatus === 'INACTIVE') {
    redirect('/demo/expired')
  }
  if (org.lifecycleStatus === 'DEMO' && org.demoExpiresAt && org.demoExpiresAt <= new Date()) {
    await prisma.organization.updateMany({
      where: { id: org.id, lifecycleStatus: 'DEMO' },
      data: { lifecycleStatus: 'INACTIVE' },
    })
    redirect('/demo/expired')
  }
}

export default async function AppLayout({ children }: { children: ReactNode }) {
  // 認証リダイレクトの副作用を発火させるために呼び出すのみ
  await getSessionUser()

  return (
    <div
      className="min-h-screen relative"
      style={{
        backgroundColor: PRODUCT_BACKGROUND_COLOR,
        backgroundImage: PRODUCT_BACKGROUND_IMAGE,
        color: 'var(--color-obs-text)',
      }}
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
