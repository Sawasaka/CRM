'use client'

import { useEffect } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

const BILLING_FREE_PATHS = ['/subscription', '/settings/billing']
const ACTIVE_STATUSES = new Set(['ACTIVE', 'TRIALING'])

export function BillingGate() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    if (!pathname) return
    if (BILLING_FREE_PATHS.some((path) => pathname.startsWith(path))) return

    let cancelled = false
    async function checkBilling() {
      try {
        const res = await fetch('/api/stripe/subscription', { credentials: 'include' })
        if (!res.ok) return
        const data = (await res.json()) as { planId?: string; status?: string | null }
        if (cancelled) return
        const hasActiveSubscription = data.status ? ACTIVE_STATUSES.has(data.status) : false
        if (!hasActiveSubscription) {
          const next = `${pathname}${searchParams?.toString() ? `?${searchParams.toString()}` : ''}`
          router.replace(`/subscription?checkout=required&next=${encodeURIComponent(next)}`)
        }
      } catch {
        // Billing API が一時的に落ちた場合は、ログイン後の画面表示を優先する。
      }
    }

    void checkBilling()
    return () => {
      cancelled = true
    }
  }, [pathname, router, searchParams])

  return null
}
