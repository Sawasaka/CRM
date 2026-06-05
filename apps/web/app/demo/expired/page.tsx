import Link from 'next/link'
import { Clock3, Mail } from 'lucide-react'

export default function DemoExpiredPage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-6 bg-[#0a0a0c] text-[#e7e5ea]">
      <div className="w-full max-w-[460px] text-center">
        <div
          className="mx-auto mb-7 flex h-16 w-16 items-center justify-center rounded-full"
          style={{
            background: 'rgba(255,193,7,0.10)',
            boxShadow: '0 0 0 1px rgba(255,193,7,0.24)',
          }}
        >
          <Clock3 size={28} color="#ffd45a" strokeWidth={2.2} />
        </div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#7e7c83]">
          RUKISUMA CRM DEMO
        </p>
        <h1 className="mt-3 font-display text-[1.6rem] font-bold tracking-[-0.015em]">
          デモ環境の利用時間が終了しました
        </h1>
        <p className="mt-4 text-[13px] leading-7 text-[#9b99a0]">
          デモ環境は登録から15分間のみ利用できます。
          <br />
          継続利用や本番利用をご希望の場合は、担当者までご相談ください。
        </p>
        <Link
          href="mailto:h.sawasaka@rookiesmart.jp"
          className="mt-8 inline-flex h-11 items-center justify-center gap-2 rounded-[10px] px-5 text-[13px] font-semibold"
          style={{
            background:
              'linear-gradient(140deg, var(--color-obs-primary) 0%, var(--color-obs-primary-container) 100%)',
            color: 'var(--color-obs-on-primary)',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.18)',
          }}
        >
          <Mail size={14} strokeWidth={2.2} />
          代表に相談
        </Link>
      </div>
    </main>
  )
}
