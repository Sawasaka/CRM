'use client'

import type { ReactNode } from 'react'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Mail, Sparkles } from 'lucide-react'
import { DemoModal } from './DemoModal'

// ブランドバー(ロゴ + コンテンツ切替 + お問い合わせ/無料デモ)。
// 固定は AppHub 側の sticky chrome が担うので、ここは通常フロー要素。
export const Nav = ({ centerSlot }: { centerSlot?: ReactNode }) => {
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
      <header className="relative z-50 transition-all duration-300">
        <div className="mx-auto max-w-7xl px-5 pt-3 pb-1">
          <div
            className={`relative grid min-h-14 grid-cols-[minmax(0,1fr)] items-center gap-3 rounded-2xl px-3 py-2 transition-all duration-300 fo-glass-rim md:grid-cols-[minmax(140px,1fr)_auto_minmax(140px,1fr)] md:py-0 md:pl-5 md:pr-3 ${
              scrolled ? 'fo-glass-strong' : 'fo-glass'
            }`}
            style={{ background: scrolled ? 'rgba(19,19,21,0.78)' : 'rgba(53,52,55,0.40)' }}
          >
            {/* 左: ロゴ + リリース準備中ラベル */}
            <div className="flex min-w-0 items-center gap-2.5">
              <Link
                href="/lp"
                className="font-display font-bold text-[1.05rem] fo-gradient-text"
                aria-label="ルキスマCRM ホーム"
              >
                ルキスマCRM
              </Link>
              <span
                className="hidden md:inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 h-6 text-[10.5px] font-medium tracking-[0.02em] cursor-default whitespace-nowrap"
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
            </div>

            {centerSlot ? (
              <div className="flex min-w-0 max-w-full justify-start overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:justify-center">
                {centerSlot}
              </div>
            ) : null}

            {/* 右: お問い合わせ + 無料デモ (統一リズム: h-9, gap-2) */}
            <div className="flex items-center gap-2 md:justify-end">
              <button
                type="button"
                onClick={scrollToContact}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-lg h-9 px-3.5 text-[12px] font-medium text-[#cfdcff] transition-all duration-200 hover:text-[#e7e5ea] hover:-translate-y-[1px] whitespace-nowrap"
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
                className="inline-flex shrink-0 items-center gap-1.5 rounded-lg h-9 px-4 text-[12px] font-semibold text-[#0a0a0c] transition-all duration-200 hover:-translate-y-[1px] whitespace-nowrap"
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
