import { Sparkles, ArrowRight, Calendar } from 'lucide-react'
import { Eyebrow, Section } from '../atoms'

// Spir 予約 URL (Nav / Pricing と統一)
const SPIR_BOOKING_URL =
  'https://app.spirinc.com/t/3u_FXTG5abaFIZ-D7as8v/as/5j4iMsFHgutg6an7CRg9o/confirm'

/**
 * CUSTOMER VOICE — 現在リリース前のため「先行予約受付中」プレースホルダーを表示。
 * 導入実績が貯まったら従来の声カードに差し替える想定。
 */
export const CustomerVoice = () => (
  <Section id="waitlist" tone="obsidian" screenLabel="14 Voice">
    <div className="relative mx-auto max-w-6xl px-6 py-28 md:py-36">
      <Eyebrow color="#abc7ff">CUSTOMER VOICE</Eyebrow>

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
              先行予約 受付中
            </div>

            <h3 className="font-display font-bold tracking-[-0.02em] text-[1.8rem] md:text-[2.4rem] leading-[1.15] mt-6 fo-gradient-text">
              ルキスマCRM はリリース準備中です。
            </h3>

            <p className="mt-5 text-[#c7c5c9] text-[1rem] md:text-[1.05rem] leading-relaxed max-w-3xl mx-auto">
              先行予約にご登録いただいた企業様から、順次ご案内・先行アクセスをご提供します。現場で使いながら一緒にプロダクトを磨いていただける企業様を募集中です。
            </p>

            <div className="mt-8 flex items-center justify-center gap-3 flex-wrap">
              <a
                href={SPIR_BOOKING_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-lg text-sm font-semibold text-[#0a0a0c] transition-transform hover:-translate-y-0.5"
                style={{
                  background: 'linear-gradient(135deg, #abc7ff, #0071e3)',
                }}
              >
                <Sparkles size={14} />
                先行予約に登録
                <ArrowRight size={14} strokeWidth={2.5} />
              </a>
              <a
                href={SPIR_BOOKING_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-lg text-sm font-medium text-aurora bg-shimmer/30 hover:bg-shimmer/60 transition-colors"
              >
                導入相談 →
              </a>
            </div>

          </div>
        </div>
      </div>
    </div>
  </Section>
)
