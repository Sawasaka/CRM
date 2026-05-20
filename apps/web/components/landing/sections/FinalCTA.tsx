import { Eyebrow, NebulaBG, ParticleField, Section } from '../atoms'

export const FinalCTA = () => (
  <Section id="cta" tone="obsidian" screenLabel="20 CTA">
    <div className="relative mx-auto max-w-6xl px-6 py-40 md:py-56 text-center">
      <NebulaBG intensity={1.4} />
      <ParticleField count={36} seed={42} />
      <div className="relative">
        <div className="flex justify-center">
          <Eyebrow color="#abc7ff">ルキスマCRM</Eyebrow>
        </div>
        <h2 className="font-display font-bold tracking-[-0.025em] text-[2.8rem] sm:text-[3.6rem] md:text-[5rem] leading-[1.04] mt-6 fo-gradient-text">
          ルキスマCRM を、
          <br />
          あなたのチームへ。
        </h2>
        <p className="mt-6 text-[#c7c5c9] text-[1.05rem]">
          現在リリース準備中。先行予約にご登録いただいた企業から順次ご案内します。
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <a
            href="#waitlist"
            className="rounded-lg px-7 py-3.5 text-sm font-medium text-[#0a0a0c]"
            style={{ background: 'linear-gradient(135deg, #abc7ff, #0071e3)' }}
          >
            先行予約に登録
          </a>
          <a href="#contact" className="rounded-lg px-7 py-3.5 text-sm text-aurora hover:bg-dusk transition-colors">
            導入相談 →
          </a>
        </div>
      </div>
    </div>
  </Section>
)
