import { Eyebrow, Section } from '../atoms'

export const MetricsBand = () => {
  const stats = [
    { k: 'CRM AI', l: '現場と数字を整理', c: '#ffcf4a' },
    { k: 'ナレッジ AI', l: '社内知見を活用', c: '#d3a5ff' },
    { k: 'CALL AI', l: '電話から日程調整', c: '#8dffc9' },
    { k: 'アシスタント AI', l: '商談中に即回答', c: '#ff8dcf' },
    { k: 'SEO AI', l: '記事から相談導線へ', c: '#7ec6ff' },
  ]
  return (
    <Section tone="pitch" screenLabel="11 Metrics">
      {/* top divider */}
      <div
        className="h-px w-full"
        style={{
          background:
            'linear-gradient(90deg, transparent 0%, rgba(171,199,255,0.10) 20%, rgba(171,199,255,0.22) 50%, rgba(171,199,255,0.10) 80%, transparent 100%)',
        }}
      />

      <div className="relative mx-auto max-w-6xl px-6 pt-20 md:pt-24 pb-8 md:pb-10">
        {/* faint nebula glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(circle at 50% 0%, rgba(171,199,255,0.07) 0%, transparent 60%)',
          }}
        />

        {/* Heading */}
        <div className="relative text-center mb-10">
          <div className="flex justify-center">
            <Eyebrow color="#abc7ff">REVENUE AI/DX INFRASTRUCTURE</Eyebrow>
          </div>
          <h2 className="mx-auto mt-5 max-w-3xl font-display text-[1.7rem] font-bold leading-[1.08] tracking-[-0.02em] md:text-[2.35rem]">
            <span className="text-[#d7d5dc]">売上インフラを、</span>
            <span className="fo-gradient-text">AIで育てる。</span>
          </h2>
        </div>

        {/* Service map */}
        <div className="relative mx-auto max-w-5xl rounded-[30px] bg-[#111217]/70 p-2 shadow-2xl shadow-black/25 fo-glass-rim">
          <div
            className="pointer-events-none absolute inset-x-8 top-0 h-px"
            style={{
              background:
                'linear-gradient(90deg, transparent, rgba(171,199,255,0.34), rgba(255,255,255,0.20), transparent)',
            }}
          />
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-5">
          {stats.map((s, i) => (
            <div
              key={i}
              className="group relative min-h-[126px] overflow-hidden rounded-[22px] bg-[#0c0e13]/82 p-5 transition duration-300 hover:-translate-y-0.5 hover:bg-[#11151d]"
              style={{ boxShadow: `inset 0 0 0 1px rgba(255,255,255,0.055), inset 0 18px 46px ${s.c}08` }}
            >
              <div
                className="absolute inset-x-5 top-0 h-px opacity-80"
                style={{ background: `linear-gradient(90deg, transparent, ${s.c}90, transparent)` }}
              />
              <div
                className="absolute -right-12 -top-12 h-32 w-32 rounded-full opacity-60 transition duration-300 group-hover:opacity-90"
                style={{ background: `radial-gradient(circle, ${s.c}20, transparent 68%)`, filter: 'blur(12px)' }}
              />
              <div className="relative mb-5 flex items-center justify-between">
                <span className="font-mono text-[10px] tracking-[0.08em] text-[#5d5a5f]">{String(i + 1).padStart(2, '0')}</span>
                <span
                  className="h-2 w-2 rounded-full shadow-[0_0_18px_currentColor]"
                  style={{ color: s.c, background: s.c }}
                />
              </div>
              <div className="relative font-display font-bold leading-none">
                <span className="block whitespace-nowrap text-[1.18rem] tracking-normal md:text-[1.30rem]" style={{ color: s.c }}>
                  {s.k}
                </span>
              </div>
              <div className="relative mt-3 text-[11px] leading-relaxed text-[#8f8c94]">
                {s.l}
              </div>
            </div>
          ))}
          </div>
        </div>
      </div>

      {/* bottom divider は撤回 — 直下の AgentFabric (5 オーブ) と連続表示するため */}
    </Section>
  )
}
