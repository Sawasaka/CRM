import { ArrowRight } from 'lucide-react'
import { Eyebrow, Section } from '../atoms'

export const HowToStart = () => {
  const steps = [
    { n: '01', t: 'ログイン',    d: 'メールアドレスのみ。クレカ不要。' },
    { n: '02', t: 'データ連携',  d: 'Google Workspace / Slack / 既存CRM。' },
    { n: '03', t: '利用開始',    d: '標準テンプレートで即起動。' },
  ]
  return (
    <Section tone="obsidian" screenLabel="16 HowToStart">
      <div className="relative mx-auto max-w-6xl px-6 py-32 md:py-40">
        <div className="max-w-3xl">
          <Eyebrow color="#abc7ff">HOW TO START</Eyebrow>
          <h2 className="font-display font-bold tracking-[-0.025em] text-[2.2rem] md:text-[3rem] leading-[1.06] mt-5">
            <span className="fo-gradient-text">2週間</span>で、本番稼働。
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-4 mt-14">
          {steps.map((s, i) => (
            <div key={i} className="rounded-3xl bg-dusk p-6 fo-lift fo-glass-rim relative">
              <div className="font-mono text-[0.72rem] text-[#7e7c83]">{s.n}</div>
              <div className="font-display font-bold text-[1.2rem] mt-3">{s.t}</div>
              <div className="text-xs text-[#9b99a0] mt-2 leading-relaxed">{s.d}</div>
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute top-1/2 -right-3 -translate-y-1/2 text-aurora/40">
                  <ArrowRight size={20} color="#abc7ff" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </Section>
  )
}
