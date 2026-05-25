'use client'

import { useEffect, useState } from 'react'
import { Mail, Sparkles } from 'lucide-react'
import { DemoModal } from './DemoModal'

export const Nav = () => {
  const [scrolled, setScrolled] = useState(false)
  const [demoOpen, setDemoOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const scrollToContact = () => {
    const target = document.getElementById('contact')
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' })
    } else {
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })
    }
  }

  return (
    <>
      <header className="fixed top-0 inset-x-0 z-50 transition-all duration-300">
        <div className="mx-auto max-w-7xl px-5 mt-3">
          <div
            className={`relative rounded-2xl pl-4 pr-2 md:pl-5 md:pr-3 h-14 flex items-center justify-between transition-all duration-300 fo-glass-rim ${
              scrolled ? 'fo-glass-strong' : 'fo-glass'
            }`}
            style={{ background: scrolled ? 'rgba(19,19,21,0.78)' : 'rgba(53,52,55,0.40)' }}
          >
            {/* 左: ロゴ */}
            <a
              href="#"
              className="font-display font-bold text-[1.05rem] fo-gradient-text tracking-[-0.01em]"
            >
              ルキスマCRM
            </a>

            {/* 中央: リリース準備中バッジ (絶対配置で完全中央) */}
            <span
              className="hidden sm:inline-flex items-center gap-2 rounded-full px-3.5 h-8 text-[11px] font-medium tracking-[0.02em] cursor-default absolute left-1/2 -translate-x-1/2 backdrop-blur-md"
              style={{
                background:
                  'linear-gradient(135deg, rgba(171,199,255,0.10), rgba(171,199,255,0.03))',
                color: '#cfdcff',
                boxShadow: 'inset 0 0 0 1px rgba(171,199,255,0.22)',
              }}
              title="現在リリース準備中です"
            >
              <span className="relative inline-flex w-1.5 h-1.5">
                <span
                  className="absolute inline-flex w-full h-full rounded-full animate-ping opacity-70"
                  style={{ backgroundColor: '#abc7ff' }}
                />
                <span
                  className="relative inline-flex w-1.5 h-1.5 rounded-full"
                  style={{
                    backgroundColor: '#abc7ff',
                    boxShadow: '0 0 8px rgba(171,199,255,0.6)',
                  }}
                />
              </span>
              リリース準備中
            </span>

            {/* 右: お問い合わせ + 無料デモ (統一リズム: h-9, gap-2) */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={scrollToContact}
                className="inline-flex items-center gap-1.5 rounded-lg h-9 px-3.5 text-[12px] font-medium text-[#cfdcff] transition-all duration-200 hover:text-[#e7e5ea] hover:-translate-y-[1px]"
                style={{
                  background: 'rgba(171,199,255,0.08)',
                  boxShadow: 'inset 0 0 0 1px rgba(171,199,255,0.24)',
                }}
                onMouseOver={(e) => {
                  ;(e.currentTarget as HTMLButtonElement).style.background =
                    'rgba(171,199,255,0.14)'
                }}
                onMouseOut={(e) => {
                  ;(e.currentTarget as HTMLButtonElement).style.background =
                    'rgba(171,199,255,0.08)'
                }}
              >
                <Mail size={13} strokeWidth={2} style={{ color: '#abc7ff' }} />
                お問い合わせ
              </button>

              <button
                type="button"
                onClick={() => setDemoOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-lg h-9 px-4 text-[12px] font-semibold text-[#0a0a0c] transition-all duration-200 hover:-translate-y-[1px]"
                style={{
                  background: 'linear-gradient(135deg, #8fb0e8, #1e6fcc)',
                  boxShadow:
                    'inset 0 1px 0 rgba(255,255,255,0.22), 0 0 0 1px rgba(171,199,255,0.16), 0 4px 14px -4px rgba(0,113,227,0.30)',
                }}
              >
                <Sparkles size={13} strokeWidth={2.2} />
                無料デモ
              </button>
            </div>
          </div>
        </div>
      </header>

      <DemoModal open={demoOpen} onClose={() => setDemoOpen(false)} />
    </>
  )
}
