'use client'

import { useState } from 'react'
import { Sparkles, Calendar, Mail } from 'lucide-react'
import { Eyebrow, Section } from '../atoms'
import { DemoModal } from '../DemoModal'

// Spir 予約 URL (Nav / Pricing と統一)
const SPIR_BOOKING_URL =
  'https://app.spirinc.com/t/3u_FXTG5abaFIZ-D7as8v/as/5j4iMsFHgutg6an7CRg9o/confirm'

/**
 * PARTNER PROGRAM — 販売パートナー募集セクション。
 * Nav と同じ DemoModal を再利用して「無料デモ」を起動する。
 */
export const CustomerVoice = () => {
  const [demoOpen, setDemoOpen] = useState(false)

  return (
    <Section id="waitlist" tone="obsidian" screenLabel="14 Partner Program">
      <div className="relative mx-auto max-w-6xl px-6 py-28 md:py-36">
        <Eyebrow color="#abc7ff">PARTNERSHIP</Eyebrow>

        <div
          className="mt-10 rounded-3xl p-[1px]"
          style={{
            background:
              'linear-gradient(135deg, rgba(171,199,255,0.5), rgba(0,113,227,0.3), transparent 70%)',
          }}
        >
          <div className="rounded-3xl bg-dusk px-8 py-16 md:py-20 fo-glass-rim relative overflow-hidden text-center">
            {/* ambient halo */}
            <div
              className="absolute -top-24 left-1/2 -translate-x-1/2 w-[420px] h-[420px] rounded-full pointer-events-none"
              style={{
                background:
                  'radial-gradient(circle, rgba(171,199,255,0.16), transparent 60%)',
                filter: 'blur(50px)',
              }}
            />

            <div className="relative">
              <div
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-semibold tracking-[0.14em] uppercase"
                style={{
                  background: 'rgba(171,199,255,0.10)',
                  color: '#abc7ff',
                  boxShadow: 'inset 0 0 0 1px rgba(171,199,255,0.28)',
                }}
              >
                <Calendar size={12} />
                リリース準備中
              </div>

              <h3 className="font-display font-bold tracking-[-0.02em] text-[1.8rem] md:text-[2.4rem] leading-[1.15] mt-6 fo-gradient-text">
                販売パートナー様、まずはご相談から。
              </h3>

              <p className="mt-5 text-[#c7c5c9] text-[1rem] md:text-[1.05rem] leading-relaxed max-w-3xl mx-auto">
                販売パートナー様には{' '}
                <span className="text-[#e7e5ea] font-medium">レベニューシェア 50 : 50</span>{' '}
                でご提供可能です。
              </p>

              <div className="mt-8 flex items-center justify-center gap-3 flex-wrap">
                <a
                  href={SPIR_BOOKING_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-lg text-sm font-semibold text-[#0a0a0c] transition-all duration-200 hover:-translate-y-0.5"
                  style={{
                    background: 'linear-gradient(135deg, #8fb0e8, #1e6fcc)',
                    boxShadow:
                      'inset 0 1px 0 rgba(255,255,255,0.22), 0 0 0 1px rgba(171,199,255,0.16), 0 6px 20px -6px rgba(0,113,227,0.30)',
                  }}
                >
                  <Mail size={14} strokeWidth={2.2} />
                  導入相談
                </a>
                <button
                  type="button"
                  onClick={() => setDemoOpen(true)}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-lg text-sm font-medium text-[#cfdcff] transition-all duration-200 hover:-translate-y-0.5 hover:text-[#e7e5ea]"
                  style={{
                    background: 'rgba(171,199,255,0.08)',
                    boxShadow: 'inset 0 0 0 1px rgba(171,199,255,0.28)',
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
                  <Sparkles size={14} strokeWidth={2.2} style={{ color: '#abc7ff' }} />
                  無料デモ
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <DemoModal open={demoOpen} onClose={() => setDemoOpen(false)} />
    </Section>
  )
}
