'use client'

import { useEffect, useState } from 'react'
import { ChevronDown } from 'lucide-react'

export const Nav = () => {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  return (
    <header className="fixed top-0 inset-x-0 z-50 transition-all duration-300">
      <div className="mx-auto max-w-7xl px-5 mt-3">
        <div
          className={`rounded-2xl px-4 md:px-5 h-14 flex items-center justify-between transition-all duration-300 fo-glass-rim ${scrolled ? 'fo-glass-strong' : 'fo-glass'}`}
          style={{ background: scrolled ? 'rgba(19,19,21,0.78)' : 'rgba(53,52,55,0.40)' }}
        >
          <a href="#" className="font-display font-bold text-[1.05rem] fo-gradient-text">KikuCRM</a>
          <nav className="hidden md:flex items-center gap-6 text-[0.82rem] text-[#c7c5c9]">
            <a href="#" className="hover:text-aurora flex items-center gap-1">
              プロダクト <ChevronDown size={12} />
            </a>
            <a href="#" className="hover:text-aurora">Agentic</a>
            <a href="#" className="hover:text-aurora">Security</a>
            <a href="#" className="hover:text-aurora">ROI</a>
            <a href="#" className="hover:text-aurora">価格</a>
            <a href="#" className="hover:text-aurora">導入事例</a>
            <a href="#" className="hover:text-aurora">Docs</a>
          </nav>
          <div className="flex items-center gap-2">
            <a
              href="/login"
              className="hidden sm:inline-block rounded-lg px-3 py-1.5 text-xs text-[#c7c5c9] hover:bg-shimmer/60"
            >
              ログイン
            </a>
            <a
              href="#cta"
              className="rounded-lg px-3.5 py-1.5 text-xs font-medium text-[#0a0a0c]"
              style={{ background: 'linear-gradient(135deg, #abc7ff, #0071e3)' }}
            >
              無料で始める
            </a>
          </div>
        </div>
      </div>
    </header>
  )
}
