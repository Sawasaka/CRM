import { Eyebrow, Section } from '../atoms'

export const MetricsBand = () => {
  const stats = [
    { k: '1',     suf: 'つで',  l: '5領域 統合',                       c: '#abc7ff' },
    { k: '5',     suf: '体',    l: 'ドメイン特化エージェント',           c: '#d3a5ff' },
    { k: '0.1',   suf: '入力',  l: '議事録・メール・コール 自動取込',     c: '#8dffc9' },
    { k: '290万', suf: '社',    l: '企業データ × 求人インテント',         c: '#ffcf4a' },
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
            <Eyebrow color="#abc7ff">BY THE NUMBERS ／ ルキスマCRM を、数字で。</Eyebrow>
          </div>
          <h2 className="font-display font-bold tracking-[-0.025em] text-[1.8rem] md:text-[2.6rem] leading-[1.06] mt-5">
            <span className="text-[#9b99a0]">統合された5領域</span>
            <span className="mx-3 text-[#414753]">／</span>
            <span className="fo-gradient-text">数字で見る ルキスマCRM</span>
          </h2>
        </div>

        {/* Stats grid */}
        <div className="relative grid grid-cols-2 md:grid-cols-4 gap-px rounded-3xl overflow-hidden bg-[#1f1f21] fo-glass-rim">
          {stats.map((s, i) => (
            <div key={i} className="bg-pitch p-8 md:p-10 relative overflow-hidden">
              <div
                className="absolute -top-8 -right-8 w-24 h-24 rounded-full"
                style={{ background: `radial-gradient(circle, ${s.c}14, transparent 70%)`, filter: 'blur(10px)' }}
              />
              <div
                className="relative font-display font-bold text-[2.6rem] md:text-[3.4rem] leading-none"
                style={{ color: s.c }}
              >
                {s.k}
                <span className="text-[1.2rem] ml-1 text-[#9b99a0]">{s.suf}</span>
              </div>
              <div className="relative text-xs text-[#9b99a0] mt-3 leading-relaxed">{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* bottom divider は撤回 — 直下の AgentFabric (5 オーブ) と連続表示するため */}
    </Section>
  )
}
