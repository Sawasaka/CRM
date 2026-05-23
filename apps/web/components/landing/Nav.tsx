'use client'

import { useEffect, useState } from 'react'
import { CalendarCheck } from 'lucide-react'

const SPIR_URL =
  'https://app.spirinc.com/t/3u_FXTG5abaFIZ-D7as8v/as/5j4iMsFHgutg6an7CRg9o/confirm'

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
          <a href="#" className="font-display font-bold text-[1.05rem] fo-gradient-text">
            ルキスマCRM
          </a>

          <div className="flex items-center gap-2 md:gap-3">
            {/* ステータス: リリース準備中 */}
            <span
              className="hidden sm:inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] text-[#9b99a0] cursor-default"
              style={{
                background: 'rgba(171,199,255,0.06)',
                boxShadow: 'inset 0 0 0 1px rgba(171,199,255,0.12)',
              }}
              title="現在リリース準備中です"
            >
              <span
                className="inline-block w-1.5 h-1.5 rounded-full animate-pulse"
                style={{ backgroundColor: '#abc7ff' }}
              />
              リリース準備中
            </span>

            {/* CTA: 事前予約 */}
            <a
              href={SPIR_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-semibold text-[#0a0a0c] transition-transform hover:-translate-y-[1px]"
              style={{ background: 'linear-gradient(135deg, #abc7ff, #0071e3)' }}
            >
              <CalendarCheck size={13} strokeWidth={2.2} />
              事前予約
            </a>
          </div>
        </div>
      </div>
    </header>
  )
}
