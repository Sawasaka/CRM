'use client'

import Script from 'next/script'
import { useEffect, useRef, useState } from 'react'

type TurnstileWidget = {
  render: (
    target: HTMLElement,
    options: {
      sitekey: string
      theme?: 'light' | 'dark' | 'auto'
      callback?: (token: string) => void
      'expired-callback'?: () => void
      'error-callback'?: () => void
    }
  ) => string
  remove: (widgetId: string) => void
}

declare global {
  interface Window {
    turnstile?: TurnstileWidget
  }
}

export function TurnstileField({
  onTokenChange,
}: {
  onTokenChange: (token: string) => void
}) {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY
  const containerRef = useRef<HTMLDivElement | null>(null)
  const widgetIdRef = useRef<string | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    onTokenChange('')
  }, [onTokenChange])

  useEffect(() => {
    if (!siteKey || !ready || !containerRef.current || widgetIdRef.current) return
    if (!window.turnstile) return

    widgetIdRef.current = window.turnstile.render(containerRef.current, {
      sitekey: siteKey,
      theme: 'dark',
      callback: (token) => onTokenChange(token),
      'expired-callback': () => onTokenChange(''),
      'error-callback': () => onTokenChange(''),
    })

    return () => {
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current)
        widgetIdRef.current = null
      }
      onTokenChange('')
    }
  }, [onTokenChange, ready, siteKey])

  if (!siteKey) return null

  return (
    <>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
        strategy="afterInteractive"
        onLoad={() => setReady(true)}
      />
      <div ref={containerRef} className="min-h-[65px]" />
    </>
  )
}
