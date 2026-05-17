import { Check } from 'lucide-react'
import { Eyebrow, Section } from '../atoms'

export const Pricing = () => {
  // サービス本体 (/subscription) の PLANS と完全同期する。
  // 価格・クレジット・機能項目は app/(app)/subscription/page.tsx の PLANS が
  // 単一の真実。変更時は両方を必ず揃える。
  const tiers = [
    {
      eyebrow: 'Free',
      scale: '¥0',
      price: '〜3名 ／ テナント全体 300クレジット / 月',
      featured: false,
      color: '#abc7ff',
      feats: [
        'PRO と同等の全機能を利用可能',
        '最大 3 シートまで',
        'テナント全体 300 クレジット / 月',
        '500クレジットで ワンクリック通話 + コール議事録自動作成',
      ],
    },
    {
      eyebrow: 'Standard',
      scale: '¥6,000',
      price: '/ 月・seat (年払い) ／ 月払 ¥8,500',
      featured: false,
      color: '#abc7ff',
      feats: [
        'CRM全機能 (企業・コンタクト・取引・パイプライン)',
        '議事録自動取得 + BANT 等の自動入力',
        '企業DB (290万社) 閲覧',
        'Slack / Gmail 自動連携',
        '求人インテント・自動エンリッチメント',
        'シンキングモード: 拡張',
        '外部リサーチ (ウェブ検索)',
        '1,000 クレジット / seat',
      ],
    },
    {
      eyebrow: 'PRO',
      scale: '¥9,000',
      price: '/ 月・seat (年払い) ／ 月払 ¥13,000',
      featured: true,
      color: '#abc7ff',
      feats: [
        'Standard 全機能',
        'AIモデル: GPT-4o mini / GPT-4o を選択可',
        'シンキングモード: 標準 / 拡張 を選択可',
        '外部リサーチ (ウェブ検索)',
        '2,000 クレジット / seat',
      ],
    },
  ]
  return (
    <Section tone="pitch" screenLabel="17 Pricing">
      <div className="relative mx-auto max-w-6xl px-6 py-32 md:py-40">
        <div className="max-w-3xl">
          <Eyebrow color="#abc7ff">PRICING</Eyebrow>
          <h2 className="font-display font-bold tracking-[-0.025em] text-[2.2rem] md:text-[3rem] leading-[1.06] mt-5">
            <span className="fo-gradient-text">KikuCRM は、</span>
            <br />
            <span className="fo-gradient-text-soft">使った分だけ。</span>
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
                    無料で始める
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
