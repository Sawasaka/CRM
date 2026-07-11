'use client'

import { SessionProvider } from 'next-auth/react'
import { usePathname } from 'next/navigation'
import { ViewTransitionProvider } from '@/components/view-transitions'
import { TRPCProvider } from '@/lib/trpc/provider'

const sessionRequiredPrefixes = ['/knowledge']

export function AppProviders({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const needsSession = sessionRequiredPrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  )

  const app = (
    <TRPCProvider>
      <ViewTransitionProvider>{children}</ViewTransitionProvider>
    </TRPCProvider>
  )

  return needsSession ? <SessionProvider>{app}</SessionProvider> : app
}
