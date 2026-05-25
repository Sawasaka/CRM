/**
 * ルキスマCRM LP — お問い合わせ送信後の Thanks ページ
 * 営業日程調整 (Spir) への導線を中心に表示する。
 */

import Link from 'next/link'
import { ArrowRight, CalendarCheck, Check } from 'lucide-react'

const SPIR_BOOKING_URL =
  'https://app.spirinc.com/t/3u_FXTG5abaFIZ-D7as8v/as/5j4iMsFHgutg6an7CRg9o/confirm'

export const metadata = {
  title: 'お問い合わせを受け付けました｜ルキスマCRM',
  description:
    'お問い合わせを受け付けました。続けて日程調整のご予約も可能です。',
}

export default function ThanksPage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-20 bg-[#0a0a0c] text-[#e7e5ea]">
      <div className="w-full max-w-[640px] text-center">
        {/* チェックマーク */}
        <div
          className="mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-8"
          style={{
            background:
              'linear-gradient(135deg, rgba(171,199,255,0.20) 0%, rgba(0,113,227,0.10) 100%)',
            boxShadow: '0 0 0 1px rgba(171,199,255,0.32), 0 0 32px rgba(171,199,255,0.18)',
          }}
        >
          <Check size={28} strokeWidth={2.4} color="#abc7ff" />
        </div>

        <div className="text-[10px] uppercase tracking-[0.22em] text-[#9b99a0] mb-4">
          ROOKIE SMART
        </div>

        <h1 className="font-display font-bold tracking-[-0.025em] text-[2rem] md:text-[2.6rem] leading-[1.15]">
          <span className="fo-gradient-text">お問い合わせを受け付けました。</span>
        </h1>

        <p className="mt-5 text-[14px] leading-relaxed text-[#9b99a0]">
          ご記入のメールアドレス宛に、1営業日以内に代表 沢坂よりご連絡いたします。
          <br />
          お急ぎの方や、直接お話を伺いたい方は、下記からそのまま日程調整いただけます。
        </p>

        {/* 日程調整 CTA */}
        <a
          href={SPIR_BOOKING_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="group inline-flex items-center gap-2 mt-10 px-6 h-12 rounded-[14px] text-[14px] font-semibold transition-all"
          style={{
            background:
              'linear-gradient(140deg, var(--color-obs-primary) 0%, var(--color-obs-primary-container) 100%)',
            color: 'var(--color-obs-on-primary)',
            boxShadow:
              'inset 0 1px 0 rgba(255,255,255,0.18), 0 0 0 1px rgba(171,199,255,0.20), 0 8px 24px rgba(0,113,227,0.18)',
          }}
        >
          <CalendarCheck size={16} strokeWidth={2.2} />
          そのまま日程を予約する
          <ArrowRight size={14} strokeWidth={2.4} className="transition-transform group-hover:translate-x-0.5" />
        </a>

        <div className="mt-12 text-[12px] text-[#7e7c83]">
          <Link href="/lp" className="hover:text-aurora transition-colors">
            ← トップに戻る
          </Link>
        </div>
      </div>
    </main>
  )
}
