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
          現在リリース準備中。営業相談からお気軽にご連絡ください。
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <a
            href="https://app.spirinc.com/t/3u_FXTG5abaFIZ-D7as8v/as/u1BDbJ3xnywQYp2rDZYxE/confirm"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg px-7 py-3.5 text-sm font-medium text-[#0a0a0c]"
            style={{ background: 'linear-gradient(135deg, #abc7ff, #0071e3)' }}
          >
            CRM構築を相談する
          </a>
        </div>
      </div>
    </div>
  </Section>
)
