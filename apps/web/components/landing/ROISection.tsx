import { Eyebrow, NebulaBG, Section } from './atoms'

export const ROISection = () => {
  const stack = [
    { t: 'HubSpot Sales Pro', s: 'CRM',     v: '¥450,000' },
    { t: 'Gong',              s: '議事録AI', v: '¥4,500,000' },
    { t: 'Sales Marker',      s: 'ABM',     v: '¥600,000' },
    { t: 'Glean',             s: 'ナレッジ', v: '¥450,000' },
  ]
  return (
    <Section tone="pitch" screenLabel="13 ROI / Stack" className="relative overflow-hidden">
      {/* top divider */}
      <div
        className="h-px w-full"
        style={{
          background:
            'linear-gradient(90deg, transparent 0%, rgba(171,199,255,0.08) 20%, rgba(171,199,255,0.20) 50%, rgba(171,199,255,0.08) 80%, transparent 100%)',
        }}
      />
      {/* Full-width nebula + faint gradient backdrop */}
      <NebulaBG intensity={0.6} />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at 50% 0%, rgba(171,199,255,0.06) 0%, transparent 60%), linear-gradient(180deg, rgba(0,113,227,0.04) 0%, transparent 30%, transparent 70%, rgba(171,199,255,0.03) 100%)',
        }}
      />

      <div className="relative mx-auto max-w-6xl px-6 py-28 md:py-36">
        <div className="grid md:grid-cols-12 gap-10 lg:gap-14 items-start">
          {/* Left: heading + 削減バナー (sticky on desktop) */}
          <div className="md:col-span-6 md:sticky md:top-28 self-start">
            <Eyebrow color="#abc7ff">ROI ／ STACK COMPARISON</Eyebrow>
            <h2 className="font-display font-bold tracking-[-0.025em] text-[2.4rem] md:text-[3.2rem] leading-[1.04] mt-5">
              <span className="fo-gradient-text">KikuCRM は、</span>
              <br />
              いちばん安い、いちばん速い。
            </h2>
            <p className="mt-6 text-[#c7c5c9] text-[1.05rem] leading-relaxed">
              本当の競合は<span className="fo-gradient-text-soft">「CRM + 議事録AI + ABM + ナレッジ」の4ツール契約</span>。
              <br />
              30名規模で比較すると、結果は一目瞭然です。
            </p>
            <div className="mt-8 hidden md:block">
              <div
                className="rounded-2xl p-[1px]"
                style={{ background: 'linear-gradient(135deg, rgba(171,199,255,0.5), rgba(0,113,227,0.3), transparent 70%)' }}
              >
                <div className="rounded-2xl bg-pitch px-6 py-7 text-center fo-glass-rim">
                  <div className="font-display font-bold text-[2.4rem] md:text-[3.4rem] leading-none fo-gradient-text">−約 97% 削減</div>
                  <div className="text-xs text-[#7e7c83] mt-3">
                    ※「自分たちで作る場合」の試算は下部の <span className="text-aurora">BUILD VS BUY</span> セクションへ。
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: pricing table */}
          <div className="md:col-span-6">
            <div className="rounded-3xl bg-dusk p-7 fo-glass-rim">
              <div className="text-[0.68rem] uppercase tracking-[0.16em] text-[#9b99a0]">30名利用想定 ／ 月額</div>
              <div className="mt-4 space-y-3">
                {stack.map((r, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between py-2"
                    style={{ borderTop: i === 0 ? 'none' : '1px solid rgba(171,199,255,0.06)' }}
                  >
                    <div>
                      <div className="text-[0.95rem] text-[#e7e5ea]">{r.t}</div>
                      <div className="text-xs text-[#7e7c83]">{r.s}</div>
                    </div>
                    <div className="font-mono text-[#c7c5c9]">{r.v}</div>
                  </div>
                ))}
                <div
                  className="flex items-center justify-between py-3 border-t"
                  style={{ borderColor: 'rgba(171,199,255,0.16)' }}
                >
                  <div className="text-[#e7e5ea] font-medium">4社合算</div>
                  <div className="font-mono font-display font-bold text-coral text-[1.2rem]">¥6,000,000</div>
                </div>
                <div
                  className="rounded-xl p-4 mt-2"
                  style={{
                    background: 'linear-gradient(135deg, rgba(171,199,255,0.10), rgba(0,113,227,0.06))',
                    boxShadow: 'inset 0 0 0 1px rgba(171,199,255,0.20)',
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="text-[#e7e5ea] font-medium">KikuCRM</div>
                    <div className="font-mono font-display font-bold text-aurora text-[1.4rem]">¥90,000</div>
                  </div>
                </div>
              </div>

              <div className="mt-5 text-[10px] text-[#7e7c83] leading-relaxed">
                ※ 各ツールは2026年4月時点の30名規模での標準プラン参考価格。実際の費用は要件・契約により変動します。
              </div>
            </div>

            {/* mobile-only 削減バナー */}
            <div className="mt-6 md:hidden">
              <div
                className="rounded-2xl p-[1px]"
                style={{ background: 'linear-gradient(135deg, rgba(171,199,255,0.5), rgba(0,113,227,0.3), transparent 70%)' }}
              >
                <div className="rounded-2xl bg-pitch px-6 py-7 text-center fo-glass-rim">
                  <div className="font-display font-bold text-[2.6rem] leading-none fo-gradient-text">−約 97% 削減</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* bottom divider */}
      <div
        className="relative h-px w-full"
        style={{
          background:
            'linear-gradient(90deg, transparent 0%, rgba(171,199,255,0.06) 20%, rgba(171,199,255,0.15) 50%, rgba(171,199,255,0.06) 80%, transparent 100%)',
        }}
      />
    </Section>
  )
}
