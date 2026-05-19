import { Check } from 'lucide-react'
import { Eyebrow, Section } from '../atoms'

export const Pricing = () => {
  // サービス本体 (/subscription) の PLANS と完全同期する。
  // 価格・クレジット・機能項目は app/(app)/subscription/page.tsx の PLANS が
  // 単一の真実。変更時は両方を必ず揃える。
  const tiers = [
    {
      eyebrow: 'Lite',
      tagline: '営業 1-3名の小規模チームに最適',
      scale: '¥3,000',
      price: '/ 月・seat (年払い) ／ 月払 ¥4,300',
      credits: '500 クレジット / seat',
      seatNote: '担当者へのチャット相談 (10シート以上で付帯)',
      featured: false,
      color: '#abc7ff',
      feats: [
        'AIモデル: Gemini 2.5 Flash Lite / シンキングモード 標準',
        'CRM全機能 (企業・コンタクト・取引・パイプライン・チケット管理)',
        'Google Workspace・Microsoft 365 連携 + 議事録自動取得 (BANT)',
        'ナレッジ自動生成 (FAQ) + 開発優先度分析',
        'メール配信 + 1stパーティ計測・効果測定',
        '企業DB (290万社) + 求人インテント',
        '外部リサーチ (ウェブ検索)',
        '500クレジットで ワンクリック通話 + コール議事録自動作成',
      ],
    },
    {
      eyebrow: 'Standard',
      tagline: 'AI 品質と通話機能で営業を本格運用',
      scale: '¥5,800',
      price: '/ 月・seat (年払い) ／ 月払 ¥8,300',
      credits: '1,000 クレジット / seat',
      seatNote: '担当者へのチャット相談 (5シート以上で付帯)',
      featured: false,
      color: '#abc7ff',
      feats: [
        'Lite 全機能',
        'AIモデル: GPT-4o mini にアップグレード (品質・精度向上)',
        'シンキングモード: 拡張',
      ],
    },
    {
      eyebrow: 'PRO',
      tagline: 'エージェントとブラウザ操作で営業を自動化',
      scale: '¥9,000',
      price: '/ 月・seat (年払い) ／ 月払 ¥13,000',
      credits: '2,000 クレジット / seat',
      seatNote: '担当者へのチャット相談 (1シートから付帯)',
      featured: true,
      color: '#abc7ff',
      feats: [
        'Standard 全機能',
        'AIモデル: GPT-4o mini / GPT-4o を選択可',
        'シンキングモード: 標準 / 拡張 を選択可',
        'エージェントモード (チャットからブラウザ自動操作・データ入力)',
      ],
    },
  ]
  return (
    <Section tone="obsidian" screenLabel="17 Pricing" className="relative overflow-hidden">
      {/* top divider — MetricsBand との境界線 */}
      <div
        className="h-px w-full"
        style={{
          background:
            'linear-gradient(90deg, transparent 0%, rgba(171,199,255,0.08) 20%, rgba(171,199,255,0.20) 50%, rgba(171,199,255,0.08) 80%, transparent 100%)',
        }}
      />
      {/* ambient radial — obsidian の単調さを和らげる */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at 50% 0%, rgba(171,199,255,0.05) 0%, transparent 55%), radial-gradient(ellipse at 80% 100%, rgba(0,113,227,0.04) 0%, transparent 50%)',
        }}
      />
      <div className="relative mx-auto max-w-6xl px-6 py-20 md:py-28">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex">
            <Eyebrow color="#abc7ff">PRICING</Eyebrow>
          </div>
          <h2 className="font-display font-bold tracking-[-0.025em] text-[2.2rem] md:text-[3rem] leading-[1.06] mt-5">
            <span className="fo-gradient-text">ルキスマCRM は、</span>
            <br />
            <span className="fo-gradient-text-soft">使う分だけ。</span>
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-5 mt-10 items-stretch">
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
                <div className="rounded-3xl p-6 fo-glass-rim flex flex-col w-full bg-dusk relative overflow-hidden">
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

                  {/* Tagline */}
                  {t.tagline && (
                    <div className="mt-2 text-[12.5px] text-[#9b99a0] relative leading-relaxed">
                      {t.tagline}
                    </div>
                  )}

                  {/* Scale */}
                  <div className={`font-display font-bold text-[1.6rem] mt-4 relative ${featured ? 'fo-gradient-text' : 'text-[#e7e5ea]'}`}>
                    {t.scale}
                  </div>
                  <div className="mt-3 font-mono text-[#9b99a0] text-sm relative">{t.price}</div>
                  {t.credits && (
                    <div className="mt-2 text-[12.5px] font-medium tabular-nums text-aurora relative">
                      月間 {t.credits} 込
                    </div>
                  )}
                  {t.seatNote && (
                    <div className="mt-1 text-[11.5px] text-aurora relative opacity-80">
                      {t.seatNote}
                    </div>
                  )}

                  {/* Features (flex-1 で高さを揃える) */}
                  <div className="mt-5 space-y-2 relative flex-1">
                    {t.feats.map((f) => (
                      <div key={f} className="flex items-center gap-2 text-sm text-[#c7c5c9]">
                        <Check size={14} color={t.color} /> {f}
                      </div>
                    ))}
                  </div>

                  {/* CTA — featured のみグラデ、他は ghost。リリース前のため先行予約に統一。 */}
                  <a
                    href="#waitlist"
                    className={`mt-6 block text-center w-full rounded-lg py-2.5 text-sm font-medium relative transition-colors ${
                      featured
                        ? 'text-[#0a0a0c]'
                        : 'text-aurora bg-shimmer/30 hover:bg-shimmer/60'
                    }`}
                    style={featured ? { background: 'linear-gradient(135deg, #abc7ff, #0071e3)' } : undefined}
                  >
                    先行予約に登録
                  </a>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </Section>
  )
}
