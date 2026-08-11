'use client'

import type { AnchorHTMLAttributes, MouseEventHandler, ReactNode } from 'react'

type TrackingValue = string | number | boolean

type TrackedLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  children: ReactNode
  eventName: string
  eventParams?: Record<string, TrackingValue>
}

export function TrackedLink({
  children,
  eventName,
  eventParams,
  onClick,
  ...props
}: TrackedLinkProps) {
  const handleClick: MouseEventHandler<HTMLAnchorElement> = (event) => {
    onClick?.(event)

    const analyticsWindow = window as typeof window & {
      gtag?: (command: 'event', name: string, params?: Record<string, TrackingValue>) => void
    }

    analyticsWindow.gtag?.('event', eventName, eventParams)
  }

  return (
    <a {...props} onClick={handleClick}>
      {children}
    </a>
  )
}
