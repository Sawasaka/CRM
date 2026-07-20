/**
 * Footer — リリース準備中。
 * リンクツリーは廃止し、予約カレンダー + 法務リンクで構成。
 */

import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import {
  CONSULTATION_BOOKING_URL,
  CONSULTATION_CALENDAR_EMBED_URL,
} from '@/lib/consultation-calendar'

export const Footer = () => (
  <footer id="contact" className="relative bg-[#0e0e10] scroll-mt-24 overflow-x-hidden">
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12 sm:py-16">
      <div>
        <div className="mb-5 md:flex md:items-end md:justify-between md:gap-8">
          <div>
            <span className="font-semibold uppercase tracking-[0.14em] text-[0.72rem] text-[#7e7c83]">
              Contact
            </span>
            <h3 className="font-display font-bold tracking-[-0.01em] text-[1.5rem] md:text-[1.7rem] text-[#e7e5ea] mt-1.5 leading-tight">
              無料相談の日程を選ぶ
            </h3>
          </div>
          <div className="mt-3 flex items-center md:mt-0">
            <a
              href={CONSULTATION_BOOKING_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#abc7ff] transition-colors hover:text-white"
            >
              カレンダーを別画面で開く
              <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
            </a>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-white/[0.09] bg-white shadow-[0_20px_60px_rgba(0,0,0,0.28)]">
          <iframe
            src={CONSULTATION_CALENDAR_EMBED_URL}
            title="沢坂弘樹との無料相談予約カレンダー"
            className="block h-[650px] w-full bg-white sm:h-[700px]"
            loading="lazy"
            referrerPolicy="strict-origin-when-cross-origin"
          />
        </div>
      </div>

      <div
        className="mt-14 pt-6 flex flex-col items-start justify-between gap-3 text-xs text-[#7e7c83] md:flex-row md:items-center"
        style={{ borderTop: '1px solid rgba(65,71,83,0.18)' }}
      >
        {/* 左: コピーライト */}
        <div>
          © <span className="fo-gradient-text font-semibold">ルキスマLAB</span>
        </div>

        {/* 右: 法務リンク */}
        <div className="flex flex-wrap gap-x-5 gap-y-2 md:justify-end">
          <Link href="/legal/terms" className="hover:text-aurora transition-colors">
            利用規約
          </Link>
          <Link href="/legal/privacy" className="hover:text-aurora transition-colors">
            プライバシーポリシー
          </Link>
          <Link href="/legal/tokushoho" className="hover:text-aurora transition-colors">
            特定商取引法
          </Link>
        </div>
      </div>
    </div>
  </footer>
)
