'use client'

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  type CSSProperties,
  type MouseEvent,
  type ReactNode,
} from 'react'
import { usePathname, useRouter } from 'next/navigation'
import NextLink from 'next/link'

// ──────────────────────────────────────────────────────────────
// ブラウザ標準の View Transitions API を使い、App Router の
// クライアント遷移にクロスフェードをかける軽量実装。
// (Next/React の実験フラグには依存しない。非対応ブラウザは
//  startViewTransition が無いので通常の遷移にフォールバックする)
// ──────────────────────────────────────────────────────────────

type Resolver = (() => void) | null
// 保留中の View Transition を解決するための ref を共有する
const PendingContext = createContext<{ current: Resolver }>({ current: null })

export function ViewTransitionProvider({ children }: { children: ReactNode }) {
  const pending = useRef<Resolver>(null)
  const pathname = usePathname()

  // ルートが切り替わって新ページがコミットされたら、保留中の遷移を完了させる
  useEffect(() => {
    if (pending.current) {
      pending.current()
      pending.current = null
    }
  }, [pathname])

  return <PendingContext.Provider value={pending}>{children}</PendingContext.Provider>
}

type ViewTransitionLinkProps = {
  href: string
  children: ReactNode
  className?: string
  style?: CSSProperties
  title?: string
  'aria-current'?: 'page' | undefined
}

export function ViewTransitionLink({ href, children, ...rest }: ViewTransitionLinkProps) {
  const pending = useContext(PendingContext)
  const router = useRouter()

  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    // 修飾キー・中クリック等はブラウザ標準の挙動に任せる
    if (
      e.defaultPrevented ||
      e.button !== 0 ||
      e.metaKey ||
      e.ctrlKey ||
      e.shiftKey ||
      e.altKey
    ) {
      return
    }

    const doc = document as Document & {
      startViewTransition?: (cb: () => Promise<void> | void) => unknown
    }
    if (typeof doc.startViewTransition !== 'function') {
      return // 非対応ブラウザは NextLink の通常遷移
    }

    e.preventDefault()
    doc.startViewTransition(
      () =>
        new Promise<void>((resolve) => {
          pending.current = resolve
          router.push(href)
          // 保険: pathname が変わらない/コミットが来ない場合でも必ず解決
          window.setTimeout(() => {
            if (pending.current === resolve) {
              pending.current = null
              resolve()
            }
          }, 800)
        }),
    )
  }

  return (
    <NextLink href={href} onClick={handleClick} {...rest}>
      {children}
    </NextLink>
  )
}
