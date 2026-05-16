import { Check } from 'lucide-react'
import { Eyebrow, Section } from '../atoms'

export const Pricing = () => {
  const tiers = [
    {
      eyebrow: 'Starter', scale: '〜30名', price: 'お問い合わせ', featured: false, color: '#abc7ff',
      feats: ['CRM ✓', 'MA 1部門', 'Helpdesk Agent ✓', 'コアエージェント 3体', '標準サポート'],
    },
    {
      eyebrow: 'Growth', scale: '〜300名', price: 'お問い合わせ', featured: true, color: '#abc7ff',
      feats: ['全機能 ✓', '全エージェント 5体 ✓', 'インテント全4部門', 'gBizINFO 連携', '99.9% SLA'],
    },
    {
      eyebrow: 'Enterprise', scale: '1,000名+', price: 'お問い合わせ', featured: false, color: '#abc7ff',
      feats: ['全機能フル', 'カスタムエージェント', 'SOC2 / ISO27001', '専任CS', 'セキュリティWP'],
    },
  ]
  return (
    <Section tone="pitch" screenLabel="17 Pricing">
      <div className="relative mx-auto max-w-6xl px-6 py-32 md:py-40">
        <div className="max-w-3xl">
          <Eyebrow color="#abc7ff">PRICING</Eyebrow>
          <h2 className="font-display font-bold tracking-[-0.025em] text-[2.2rem] md:text-[3rem] leading-[1.06] mt-5">
            あなたのチームの<span className="fo-gradient-text-soft">ちょうど良いプラン。</span>
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-5 mt-14 items-stretch">
          {tiers.map((t, i) => {
            const featured = t.featured
            return (
              <div
                key={i}
                className="rounded-3xl p-[1px] h-full flex"
                style={{
                  background: featured
                    ? 'linear-gradient(135deg, rgba(171,199,255,0.6), rgba(0,113,227,0.4), transparent 70%)'
                    : 'linear-gradient(135deg, rgba(171,199,255,0.18), rgba(171,199,255,0.04) 60%, transparent 100%)',
                }}
              >
                <div className="rounded-3xl p-7 fo-glass-rim flex flex-col w-full bg-dusk relative overflow-hidden">
                  {featured && (
                    <div
                      className="absolute -top-20 -right-20 w-56 h-56 rounded-full pointer-events-none"
                      style={{ background: 'radial-gradient(circle, rgba(171,199,255,0.18), transparent 60%)', filter: 'blur(40px)' }}
                    />
                  )}

                  {/* Eyebrow + badge */}
                  <div
                    className="font-semibold uppercase tracking-[0.14em] text-[0.72rem] relative flex items-center gap-2"
                    style={{ color: t.color }}
                  >
                    <span>{t.eyebrow}</span>
                    {featured && (
                      <span className="text-[9px] tracking-[0.14em] px-1.5 py-0.5 rounded-full" style={{ background: 'rgba(171,199,255,0.12)', color: '#abc7ff' }}>
                        ★ MOST CHOSEN
                      </span>
                    )}
                  </div>

                  {/* Scale */}
                  <div className={`font-display font-bold text-[1.6rem] mt-3 relative ${featured ? 'fo-gradient-text' : 'text-[#e7e5ea]'}`}>
                    {t.scale}
                  </div>
                  <div className="mt-3 font-mono text-[#9b99a0] text-sm relative">{t.price}</div>

                  {/* Features (flex-1 で高さを揃える) */}
                  <div className="mt-6 space-y-2.5 relative flex-1">
                    {t.feats.map((f) => (
                      <div key={f} className="flex items-center gap-2 text-sm text-[#c7c5c9]">
                        <Check size={14} color={t.color} /> {f}
                      </div>
                    ))}
                  </div>

                  {/* CTA — featured のみグラデ、他は ghost */}
                  <button
                    className={`mt-7 w-full rounded-lg py-3 text-sm font-medium relative transition-colors ${
                      featured
                        ? 'text-[#0a0a0c]'
                        : 'text-aurora bg-shimmer/30 hover:bg-shimmer/60'
                    }`}
                    style={featured ? { background: 'linear-gradient(135deg, #abc7ff, #0071e3)' } : undefined}
                  >
                    お問い合わせ
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </Section>
  )
}
