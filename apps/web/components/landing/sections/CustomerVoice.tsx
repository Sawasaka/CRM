import { Eyebrow, Section } from '../atoms'

export const CustomerVoice = () => (
  <Section tone="obsidian" screenLabel="14 Voice">
    <div className="relative mx-auto max-w-6xl px-6 py-28 md:py-36">
      <Eyebrow color="#abc7ff">CUSTOMER VOICE</Eyebrow>
      <div className="grid md:grid-cols-2 gap-6 mt-10">
        {[
          { q: 'ツールを5個解約して、ルキスマCRMだけにした。それでも仕事は速くなった。', who: '中堅SaaS企業 COO',     c: '#abc7ff' },
          { q: 'PDM Agentが議事録から要望機能を自動集計してくれるので、PdMの会議が半減しました。', who: 'B2Bプロダクト責任者', c: '#8dffc9' },
        ].map((v, i) => (
          <div key={i} className="rounded-3xl bg-dusk p-8 fo-lift fo-glass-rim relative overflow-hidden">
            <div
              className="absolute -top-10 -right-10 w-40 h-40 rounded-full"
              style={{ background: `radial-gradient(circle, ${v.c}26, transparent 60%)`, filter: 'blur(40px)' }}
            />
            <div className="font-display font-bold text-[5rem] leading-none -mt-2" style={{ color: `${v.c}40` }}>“</div>
            <p className="font-display font-bold text-[1.25rem] md:text-[1.5rem] leading-[1.35] -mt-8 relative">{v.q}</p>
            <div className="mt-6 text-xs text-[#9b99a0] relative">— {v.who}</div>
          </div>
        ))}
      </div>
    </div>
  </Section>
)
