import Image from 'next/image'
import { ArrowRight } from 'lucide-react'
import { CORPORATE_CONSULTATION_BOOKING_URL } from '@/lib/consultation-calendar'
import { TrackedLink } from './TrackedLink'

export function HeroCarousel() {
  return (
    <section
      className="relative isolate min-h-[690px] overflow-hidden bg-[#dfeef6] sm:min-h-[720px] lg:min-h-[760px]"
      aria-label="ルーキースマートジャパンの事業紹介"
    >
      <div className="absolute inset-0">
        <Image
          src="/corporate-v2/hero-founder-learning-cat.jpg"
          alt="愛猫のそばで本とデータを読み解き、事業の選択肢を考える沢坂弘樹"
          fill
          priority
          sizes="100vw"
          className="object-cover object-[76%_center] sm:object-[68%_center]"
        />
      </div>

      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.99)_0%,rgba(255,255,255,0.94)_32%,rgba(255,255,255,0.44)_59%,rgba(13,53,81,0.08)_100%)] max-sm:bg-[linear-gradient(180deg,rgba(255,255,255,0.96)_0%,rgba(255,255,255,0.84)_55%,rgba(255,255,255,0.50)_100%)]" />
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#0d3551]/20 to-transparent sm:hidden" />

      <div className="relative mx-auto flex min-h-[690px] max-w-[1240px] items-center px-5 py-20 sm:min-h-[720px] sm:px-8 lg:min-h-[760px]">
        <div className="max-w-[720px] pt-4 sm:max-w-[720px] lg:max-w-[800px]">
          <p className="flex items-center gap-4 text-[10px] font-bold tracking-[0.23em] text-[#0b6fb7]">
            <span className="h-px w-11 bg-[#0b6fb7]" />
            REVENUE DESIGN
          </p>
          <h1 className="mt-6 [font-family:'Yu_Mincho','Hiragino_Mincho_ProN','Noto_Serif_JP',serif] text-[clamp(1.35rem,7vw,3.45rem)] font-semibold leading-[1.3] tracking-[-0.045em] text-[#123b59] lg:text-[4rem]">
            <span className="whitespace-nowrap">マーケティングから始まる、</span>
            <span className="block text-[#0b6fb7]">営業UX。</span>
          </h1>
          <p className="mt-7 max-w-2xl text-sm font-medium leading-8 text-[#35586d] sm:text-lg sm:leading-9">
            <span className="block whitespace-nowrap sm:inline">科学とAIで、最少人数・最大成果を目指す</span>
            <span className="block sm:inline">事業インフラを設計します。</span>
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <TrackedLink
              href={CORPORATE_CONSULTATION_BOOKING_URL}
              target="_blank"
              rel="noopener noreferrer"
              eventName="corporate_booking_click"
              eventParams={{ placement: 'hero_v2' }}
              className="inline-flex min-h-12 items-center justify-center gap-3 border border-[#79afd0] bg-white/90 px-6 py-3 text-sm font-bold text-[#123b59] transition hover:border-[#0b6fb7] hover:text-[#0b6fb7]"
            >
                <Image
                  src="/brand/rookie-smart-japan/rsj-corporate-cat-favicon-512.png"
                  alt=""
                  aria-hidden="true"
                  width={24}
                  height={24}
                  className="h-6 w-6 shrink-0 object-contain"
                />
                今すぐ相談する
            </TrackedLink>
            <TrackedLink
              href={CORPORATE_CONSULTATION_BOOKING_URL}
              target="_blank"
              rel="noopener noreferrer"
              eventName="corporate_simulation_click"
              eventParams={{ placement: 'hero_v2' }}
              className="inline-flex min-h-12 items-center justify-center gap-3 bg-[#0b6fb7] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#07588f]"
            >
              マーケ投資を事前試算する
              <ArrowRight size={16} />
            </TrackedLink>
          </div>
        </div>
      </div>
    </section>
  )
}
