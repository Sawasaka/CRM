import type { ReactNode } from 'react'
import { Sidebar } from '@/components/layout/sidebar'
import { Header } from '@/components/layout/header'
import { ActiveCallWidget } from '@/components/calls/ActiveCallWidget'
import { CallResultModal } from '@/components/calls/CallResultModal'
import { BillingGate } from '@/components/billing/BillingGate'

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
    redirect('/login?callbackUrl=/subscription?checkout=required')
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
      <Sidebar />
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
      <BillingGate />
    </div>
  )
}
