'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Nav } from './landing/Nav'

// ──────────────────────────────────────────────────────────────
// HOME(FDE CRM) / 営業ドラゴン図鑑 を
// 「1ページ内の state 切替」で行き来するハブ。
// 営業武器庫 / 営業竜学園 は営業ドラゴン図鑑内の子コンテンツとして導線化する。
//
// 上部 chrome は全ビュー共通で固定:
//   ブランドバー (ロゴ + 切替タブ + 日程調整) … Nav
// その下の中身だけが切り替わる。
// URL は履歴APIで /lp ↔ SEO用の /media/* に裏同期。
// 旧 /media?view=... も共有URLとして引き続き読み取る。
//
// 各ビューは server component のまま props で受け取る(LP本体をクライアント化しない)。
// 固定 chrome はNav内で完結させ、ページ背景と一体化したまま切替だけを担う。
// ──────────────────────────────────────────────────────────────

type View = 'home' | 'dragon' | 'psychology' | 'school'

const TABS: { key: View; label: string; shortLabel: string; accent: string }[] = [
  { key: 'home',       label: 'FDE CRM',          shortLabel: 'CRM',     accent: '#abc7ff' },
  { key: 'dragon',     label: '営業ドラゴン図鑑',  shortLabel: '図鑑',    accent: '#d7ad59' },
  { key: 'psychology', label: '営業武器庫',        shortLabel: '武器庫',  accent: '#d7ad59' },
  { key: 'school',     label: '営業竜学園',        shortLabel: '竜学園',  accent: '#d7ad59' },
]

const URL_FOR: Record<View, string> = {
  home: '/lp',
  dragon: '/media/sales-type-diagnosis',
  psychology: '/media/sales-weapon',
  school: '/media/sales-dragon-academy',
}

export default function AppHub({
  initialView,
  home,
  dragon,
  psychology,
  school,
}: {
  initialView: View
  home: ReactNode
  dragon: ReactNode
  psychology: ReactNode
  school: ReactNode
}) {
  const [view, setView] = useState<View>(initialView)
  const activeTabRef = useRef<HTMLButtonElement | null>(null)

  // ブラウザの戻る/進むで URL → ビューを同期
  useEffect(() => {
    const sync = () => {
      const path = window.location.pathname
      const sp = new URLSearchParams(window.location.search)
      if (path.startsWith('/media/sales-weapon')) {
        setView('psychology')
      } else if (path.startsWith('/media/sales-dragon-academy')) {
        setView('school')
      } else if (path.startsWith('/media/sales-type-diagnosis')) {
        setView('dragon')
      } else if (path.startsWith('/media')) {
        const nextView = sp.get('view')
        setView(nextView === 'psychology' ? 'psychology' : nextView === 'school' ? 'school' : 'dragon')
      } else if (path.startsWith('/lp')) {
        setView('home')
      }
    }
    sync()
    window.addEventListener('popstate', sync)
    return () => window.removeEventListener('popstate', sync)
  }, [])

  const go = (next: View) => {
    if (next === view) return
    setView(next)
    // ページ遷移せず URL だけ書き換え (履歴・共有・SEOのため)
    window.history.pushState(null, '', URL_FOR[next])
    window.scrollTo({ top: 0 })
  }

  useEffect(() => {
    activeTabRef.current?.scrollIntoView({ block: 'nearest', inline: 'center' })
  }, [view])

  const tabs = (
    <div
      className="inline-flex w-max max-w-full items-center gap-1 rounded-full p-1"
      style={{
        // クリーム背景(図鑑)でも黒背景(LP)でも沈まないニュートラルなコンテナ
        background:
          'linear-gradient(135deg, rgba(20,22,32,0.55), rgba(20,22,32,0.32))',
        boxShadow:
          'inset 0 0 0 1px rgba(215,173,89,0.22), 0 8px 24px -16px rgba(0,0,0,0.55)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
      }}
      role="tablist"
      aria-label="コンテンツ切替"
    >
      {TABS.map((tab) => {
        const isActive = tab.key === view
        return (
          <button
            key={tab.key}
            type="button"
            role="tab"
            ref={isActive ? activeTabRef : null}
            aria-selected={isActive}
            onClick={() => go(tab.key)}
            className="inline-flex h-8 shrink-0 items-center justify-center whitespace-nowrap rounded-full px-3 text-[11px] font-black transition-all duration-200 sm:h-9 sm:px-3 sm:text-[12px] lg:px-4 xl:px-5 xl:text-[13px]"
            style={
              isActive
                ? {
                    // アクティブ: 黒地に金グラデで強調。ブランドのobsidian+goldで統一感
                    background: `linear-gradient(135deg, #1a1f2c 0%, #2a2415 55%, ${tab.accent} 100%)`,
                    color: '#fff8e6',
                    boxShadow: `inset 0 1px 0 rgba(255,255,255,0.18), 0 0 0 1px ${tab.accent}66, 0 10px 22px -10px ${tab.accent}80`,
                  }
                : { color: 'rgba(245,238,220,0.82)', background: 'transparent' }
            }
          >
            <span className="sm:hidden">{tab.shortLabel}</span>
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        )
      })}
    </div>
  )

  return (
    <div className="relative">
      {/* 固定 chrome (全ビュー共通): ブランドバー内にタブを内包
          背景は持たせず透過にして、ページ背景と一体化させる(独立した帯を作らない)。
          スクロール時の可読性のため backdrop-blur のみ残す。 */}
      <div
        className="sticky top-0 z-[60] backdrop-blur-xl"
        style={{ background: 'transparent' }}
      >
        <Nav centerSlot={TABS.length > 1 ? tabs : undefined} />
      </div>

      {/* 中身: key で再マウントしフェード (opacityのみ。transformは使わない) */}
      <div key={view} className="fo-fade-swap">
        {view === 'home' ? home : view === 'dragon' ? dragon : view === 'psychology' ? psychology : school}
      </div>
    </div>
  )
}
