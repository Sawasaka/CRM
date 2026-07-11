'use client'

import type { ReactNode } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Mail } from 'lucide-react'
import { ConsultationCallButton } from './ConsultationCallModal'

// ブランドバー(ロゴ + コンテンツ切替 + お問い合わせ)。
// 固定は AppHub 側の sticky chrome が担うので、ここは通常フロー要素。
export const Nav = ({ centerSlot }: { centerSlot?: ReactNode }) => {
  return (
    <>
      <header className="relative z-50">
        <div className="mx-auto max-w-7xl px-3 sm:px-5 pt-3 pb-1">
          <div
            className="relative rounded-2xl px-2.5 py-2 fo-glass-rim fo-glass sm:px-3 xl:min-h-14 xl:py-0 xl:pl-5 xl:pr-3 xl:grid xl:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] xl:items-center xl:gap-3"
            style={{ background: 'rgba(53,52,55,0.40)' }}
          >
            {/* Row 1 (mobile/tablet) / Col 1 (desktop): ロゴ左 + お問い合わせボタン右 */}
            <div className="flex items-center justify-between gap-2 xl:col-start-1 xl:justify-start xl:gap-2.5 xl:min-w-0">
              <Link
                href="/lp"
                className="group inline-flex min-w-0 items-center gap-2.5 rounded-xl px-1.5 py-1 transition-colors hover:bg-white/[0.04]"
                aria-label="ルキスマLAB ホーム"
              >
                <Image
                  src="/icon.svg"
                  alt=""
                  width={32}
                  height={32}
                  className="h-8 w-8 shrink-0 rounded-[10px] shadow-[0_0_24px_rgba(171,199,255,0.16)]"
                  aria-hidden="true"
                />
                <span className="grid min-w-0">
                  <span className="font-display text-[0.96rem] font-bold leading-none tracking-[-0.01em] text-[#f2f6ff] whitespace-nowrap">
                    ルキスマLAB
                  </span>
                </span>
              </Link>

              {/* Mobile/Tablet only: お問い合わせ — 右端配置 / ContactForm 送信ボタンと同デザイン */}
              <ConsultationCallButton
                className="xl:hidden inline-flex shrink-0 items-center justify-center gap-1.5 rounded-[10px] h-8 px-3 text-[11.5px] font-semibold whitespace-nowrap transition-all duration-200 hover:-translate-y-[1px]"
                style={{
                  background: 'linear-gradient(135deg, #8fb0e8 0%, #1e6fcc 100%)',
                  color: '#ffffff',
                  boxShadow:
                    'inset 0 1px 0 rgba(255,255,255,0.22), 0 0 0 1px rgba(171,199,255,0.18), 0 4px 14px -6px rgba(30,111,204,0.35)',
                }}
                source="landing_nav_mobile"
              >
                <Mail size={12} strokeWidth={2.4} />
                お問い合わせ
              </ConsultationCallButton>
            </div>

            {centerSlot ? (
              <div className="mx-auto mt-2 flex w-full min-w-0 max-w-full justify-start overflow-x-auto px-0.5 [-ms-overflow-style:none] [scrollbar-width:none] sm:justify-center xl:mt-0 xl:w-auto xl:px-0">
                {centerSlot}
              </div>
            ) : null}

            {/* Desktop only (xl+): お問い合わせ — 明示的に Col 3 へ配置 / ContactForm 送信ボタンと同デザイン */}
            <div className="hidden xl:col-start-3 xl:flex items-center gap-2 xl:justify-end">
              <ConsultationCallButton
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-[10px] h-9 px-4 text-[12.5px] font-semibold whitespace-nowrap transition-all duration-200 hover:-translate-y-[1px]"
                style={{
                  background: 'linear-gradient(135deg, #8fb0e8 0%, #1e6fcc 100%)',
                  color: '#ffffff',
                  boxShadow:
                    'inset 0 1px 0 rgba(255,255,255,0.22), 0 0 0 1px rgba(171,199,255,0.18), 0 4px 14px -6px rgba(30,111,204,0.35)',
                }}
                source="landing_nav_desktop"
              >
                <Mail size={13} strokeWidth={2.4} />
                お問い合わせ
              </ConsultationCallButton>
            </div>
          </div>
        </div>
      </header>
    </>
  )
}
