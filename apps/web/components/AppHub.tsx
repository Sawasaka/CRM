'use client'

import { useEffect, useState, type ReactNode } from 'react'
import { Nav } from './landing/Nav'

// ──────────────────────────────────────────────────────────────
// HOME(ルキスマCRM) / 営業ドラゴン図鑑 / 営業武器庫 を
// 「1ページ内の state 切替」で行き来するハブ。
//
// 上部 chrome は全ビュー共通で固定:
//   ブランドバー (ロゴ + 切替タブ + お問い合わせ/無料デモ) … Nav
// その下の中身だけが切り替わる。
// URL は履歴APIで /lp ↔ /media ↔ /media?view=psychology に裏同期し SEO/共有も維持。
//
// 各ビューは server component のまま props で受け取る(LP本体をクライアント化しない)。
// 固定 chrome はNav内で完結させ、ページ背景と一体化したまま切替だけを担う。
// ──────────────────────────────────────────────────────────────

type View = 'home' | 'dragon' | 'psychology'

const TABS: { key: View; label: string; accent: string }[] = [
  { key: 'home', label: 'ルキスマCRM', accent: '#abc7ff' },
  { key: 'dragon', label: '営業ドラゴン図鑑', accent: '#d7ad59' },
  { key: 'psychology', label: '営業武器庫', accent: '#d7ad59' },
]

const URL_FOR: Record<View, string> = {
  home: '/lp',
  dragon: '/media',
  psychology: '/media?view=psychology',
}

export default function AppHub({
  initialView,
  home,
  dragon,
  psychology,
}: {
  initialView: View
  home: ReactNode
  dragon: ReactNode
  psychology: ReactNode
}) {
  const [view, setView] = useState<View>(initialView)

  // ブラウザの戻る/進むで URL → ビューを同期
  useEffect(() => {
    const sync = () => {
      const path = window.location.pathname
      const sp = new URLSearchParams(window.location.search)
      if (path.startsWith('/media')) {
        const nextView = sp.get('view')
        setView(nextView === 'psychology' ? 'psychology' : 'dragon')
      } else if (path.startsWith('/lp')) {
        setView('home')
      }
    }
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

  const tabs = (
    <div
      className="inline-flex min-w-max items-center gap-1 rounded-full p-1"
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
            aria-selected={isActive}
            onClick={() => go(tab.key)}
            className="inline-flex h-9 shrink-0 items-center justify-center whitespace-nowrap rounded-full px-3 text-[12px] font-black transition-all duration-200 md:px-5 md:text-[13px]"
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
            {tab.label}
          </button>
        )
      })}
    </div>
  )

  return (
    <div className="relative">
      {/* 固定 chrome (全ビュー共通): ブランドバー内にタブを内包
          背景は持たせず透過にして、ページ背景と一体化させる(独立した帯を作らない)。
          スクロール時の可読性のため backdrop-blur のみ残す。
          DemoModal はポータル化済みなので blur があっても fixed は壊れない */}
      <div
        className="sticky top-0 z-[60] backdrop-blur-xl"
        style={{ background: 'transparent' }}
      >
        <Nav centerSlot={tabs} />
      </div>

      {/* 中身: key で再マウントしフェード (opacityのみ。transformは使わない) */}
      <div key={view} className="fo-fade-swap">
        {view === 'home' ? home : view === 'dragon' ? dragon : psychology}
      </div>
    </div>
  )
}
