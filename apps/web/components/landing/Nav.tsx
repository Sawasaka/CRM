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
        <div className="mx-auto max-w-7xl px-3 sm:px-5 pt-3 pb-1">
          <div
            className={`relative rounded-2xl px-2.5 py-2 transition-all duration-300 fo-glass-rim sm:px-3 lg:min-h-14 lg:py-0 lg:pl-5 lg:pr-3 lg:grid lg:grid-cols-[minmax(140px,1fr)_auto_minmax(140px,1fr)] lg:items-center lg:gap-3 ${
              scrolled ? 'fo-glass-strong' : 'fo-glass'
            }`}
            style={{ background: scrolled ? 'rgba(19,19,21,0.78)' : 'rgba(53,52,55,0.40)' }}
          >
            {/* Row 1 (mobile/tablet) / Col 1 (desktop): ロゴ + リリース準備中 + (mobile/tablet only: ボタン群) — 全部1行で中央寄せ */}
            <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 lg:flex-nowrap lg:justify-start lg:gap-2.5 lg:min-w-0">
              <Link
                href="/lp"
                className="font-display font-bold text-[1rem] sm:text-[1.05rem] fo-gradient-text whitespace-nowrap"
                aria-label="ルキスマCRM ホーム"
              >
                ルキスマCRM
              </Link>
              <span
                className="inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 h-6 text-[10.5px] font-medium tracking-[0.02em] cursor-default whitespace-nowrap"
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

              {/* Mobile/Tablet only: お問い合わせ icon + 無料デモ compact */}
              <button
                type="button"
                onClick={scrollToContact}
                aria-label="お問い合わせ"
                className="lg:hidden inline-flex shrink-0 items-center justify-center rounded-lg h-7 w-7 text-[#cfdcff] transition-all duration-200"
                style={{
                  background: 'rgba(171,199,255,0.08)',
                  boxShadow: 'inset 0 0 0 1px rgba(171,199,255,0.24)',
                }}
              >
                <Mail size={12} strokeWidth={2} style={{ color: '#abc7ff' }} />
              </button>
              <button
                type="button"
                onClick={() => setDemoOpen(true)}
                className="lg:hidden inline-flex shrink-0 items-center gap-1 rounded-lg h-7 px-2.5 text-[11px] font-semibold text-[#0a0a0c] transition-all duration-200 whitespace-nowrap"
                style={{
                  background: 'linear-gradient(135deg, #8fb0e8, #1e6fcc)',
                  boxShadow:
                    'inset 0 1px 0 rgba(255,255,255,0.22), 0 0 0 1px rgba(171,199,255,0.16), 0 4px 14px -4px rgba(0,113,227,0.30)',
                }}
              >
                <Sparkles size={11} strokeWidth={2.2} />
                無料デモ
              </button>
            </div>

            {centerSlot ? (
              <div className="mt-2 flex min-w-0 max-w-full justify-center overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:mt-0">
                {centerSlot}
              </div>
            ) : null}

            {/* Desktop only (lg+): お問い合わせ + 無料デモ */}
            <div className="hidden lg:flex items-center gap-2 lg:justify-end">
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
