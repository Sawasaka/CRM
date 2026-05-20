import { Check, Sparkles, Crown, Star, Zap, FileSpreadsheet, ArrowRight } from 'lucide-react'
import { Eyebrow, Section } from '../atoms'

// サービス本体 (/subscription) の PLANS と完全同期する。
// 価格・クレジット・機能項目は app/(app)/subscription/page.tsx の PLANS が
// 単一の真実。変更時は両方を必ず揃える。

const freeFeats = [
  'AIモデル: Gemini 2.5 Flash Lite (シンキングモード 標準)',
  'CRM 全機能 (企業・コンタクト・取引・パイプライン・チケット)',
  'Google Workspace / Microsoft 365 連携',
  '議事録自動取得 + BANT 自動入力',
  'ナレッジ自動生成 (FAQ)',
  'メール配信 + 1stパーティ計測・効果測定',
  '企業DB (290万社) + 求人インテント',
  '開発優先度分析',
  '外部リサーチ (ウェブ検索)',
  '500クレジットで ワンクリック通話 + コール議事録自動作成',
]

interface PartnershipTier {
  id: string
  name: string
  tagline: string
  price: number
  slotsTotal: number
  slotsRemaining: number
  cadence: string
  icon: typeof Crown
  featured?: boolean
  feats: string[]
}

const partnershipTiers: PartnershipTier[] = [
  {
    id: 'platinum',
    name: 'プラチナム',
    tagline: '1社専任・最高密度',
    price: 500000,
    slotsTotal: 1,
    slotsRemaining: 1,
    cadence: '1日2商談まで・平日全営業日',
    icon: Crown,
    feats: [
      '専任体制・最優先対応',
      'CRM PRO (5,000クレジット/月) バンドル',
      'GPT-4o 優先利用 + エージェントモード',
      '機能リクエスト 優先開発',
      'カスタムフィールド・API/Webhook',
    ],
  },
  {
    id: 'premium',
    name: 'プレミアム',
    tagline: '平日フル稼働',
    price: 300000,
    slotsTotal: 2,
    slotsRemaining: 2,
    cadence: '1日1商談まで・平日全営業日',
    icon: Star,
    featured: true,
    feats: [
      'CRM PRO (5,000クレジット/月) バンドル',
      'GPT-4o mini / GPT-4o 選択可',
      'エージェントモード フル機能',
      '優先レスポンス (Slack 即応)',
      '議事録BANT + 企業DB(290万社)',
    ],
  },
  {
    id: 'standard',
    name: 'スタンダード',
    tagline: '週4稼働で始める',
    price: 200000,
    slotsTotal: 2,
    slotsRemaining: 2,
    cadence: '1日1商談まで・月曜休み',
    icon: Zap,
    feats: [
      'CRM PRO (5,000クレジット/月) バンドル',
      'GPT-4o mini / GPT-4o 選択可',
      'エージェントモード',
      '議事録BANT + 企業DB(290万社)',
      'Google Workspace / M365 連携',
    ],
  },
]

const formatPrice = (n: number) => `¥${n.toLocaleString()}`

export const Pricing = () => {
  return (
    <Section tone="obsidian" screenLabel="17 Pricing" className="relative overflow-hidden">
      {/* top divider */}
      <div
        className="h-px w-full"
        style={{
          background:
            'linear-gradient(90deg, transparent 0%, rgba(171,199,255,0.08) 20%, rgba(171,199,255,0.20) 50%, rgba(171,199,255,0.08) 80%, transparent 100%)',
        }}
      />
      {/* ambient radial */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at 50% 0%, rgba(171,199,255,0.06) 0%, transparent 55%), radial-gradient(ellipse at 80% 100%, rgba(0,113,227,0.04) 0%, transparent 50%)',
        }}
      />

      <div className="relative mx-auto max-w-6xl px-6 py-20 md:py-28">
        {/* ── Header ─────────────────────────────────────── */}
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex">
            <Eyebrow color="#FFC107">PARTNERSHIP · 5社限定</Eyebrow>
          </div>
          <h2 className="font-display font-bold tracking-[-0.025em] text-[2.2rem] md:text-[3rem] leading-[1.06] mt-5">
            <span className="fo-gradient-text">営業実行を、</span>
            <br />
            <span className="fo-gradient-text-soft">まるごと任せる。</span>
          </h2>
          <p className="mt-6 text-[14.5px] md:text-[15px] text-[#9b99a0] leading-[1.75] max-w-xl mx-auto">
            ハブスポットや Salesforce では届かない領域。
            <br className="hidden md:block" />
            <span className="text-[#e7e5ea] font-semibold">人 × CRM × AI を1パッケージ</span>{' '}
            にして、営業を伸ばしきる体制を 5社限定で組みます。
          </p>
        </div>

        {/* ── ① FREE card (hero) ──────────────────────────── */}
        <div className="mt-14">
          <div
            className="rounded-[32px] p-[1.5px] relative"
            style={{
              background:
                'linear-gradient(135deg, rgba(171,199,255,0.55) 0%, rgba(0,113,227,0.35) 35%, rgba(171,199,255,0.10) 70%, transparent 100%)',
            }}
          >
            <div className="rounded-[31px] bg-dusk fo-glass-rim relative overflow-hidden p-8 md:p-12">
              {/* glow */}
              <div
                className="absolute -top-32 -left-32 w-96 h-96 rounded-full pointer-events-none"
                style={{
                  background:
                    'radial-gradient(circle, rgba(171,199,255,0.22), transparent 60%)',
                  filter: 'blur(50px)',
                }}
              />
              <div
                className="absolute -bottom-40 -right-32 w-96 h-96 rounded-full pointer-events-none"
                style={{
                  background:
                    'radial-gradient(circle, rgba(0,113,227,0.18), transparent 60%)',
                  filter: 'blur(60px)',
                }}
              />

              <div className="relative grid md:grid-cols-[1fr,1.25fr] gap-10 items-start">
                {/* Left: price + CTA */}
                <div>
                  <div className="flex items-center gap-2 mb-5">
                    <Sparkles size={14} style={{ color: '#abc7ff' }} />
                    <span
                      className="font-semibold uppercase tracking-[0.18em] text-[0.7rem]"
                      style={{ color: '#abc7ff' }}
                    >
                      Free Forever · CRM
                    </span>
                  </div>

                  <div className="flex items-baseline gap-3">
                    <span className="font-display font-bold tracking-[-0.04em] text-[5rem] md:text-[6rem] leading-[0.9] fo-gradient-text">
                      ¥0
                    </span>
                    <span className="text-[#9b99a0] text-base mb-2">/ 月</span>
                  </div>

                  <div
                    className="mt-4 inline-flex items-center gap-2.5 rounded-full px-4 py-2"
                    style={{
                      background: 'rgba(171,199,255,0.10)',
                      boxShadow: 'inset 0 0 0 1px rgba(171,199,255,0.22)',
                    }}
                  >
                    <span className="text-[11px] uppercase tracking-[0.14em] text-[#9b99a0]">
                      月間
                    </span>
                    <span className="font-display text-[20px] font-bold tabular-nums fo-gradient-text-soft">
                      10,000
                    </span>
                    <span className="text-[12.5px] text-[#c7c5c9]">クレジット 付与</span>
                  </div>

                  <p className="mt-5 text-[13px] text-[#9b99a0] leading-[1.7]">
                    シート無制限・チーム全員で。
                    <br />
                    クレジットを使い切ったら、
                    <span className="text-[#e7e5ea] font-semibold">使う分だけ追加できます。</span>
                  </p>

                  <a
                    href="https://app.spirinc.com/t/3u_FXTG5abaFIZ-D7as8v/as/5j4iMsFHgutg6an7CRg9o/confirm"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-7 inline-flex items-center gap-2 rounded-xl px-7 py-3.5 text-[14px] font-semibold transition-transform hover:scale-[1.02]"
                    style={{
                      background: 'linear-gradient(135deg, #abc7ff, #0071e3)',
                      color: '#0a0a0c',
                    }}
                  >
                    営業相談を予約する
                    <ArrowRight size={16} />
                  </a>
                </div>

                {/* Right: feature list (10 items, 2-col grid) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-2.5">
                  {freeFeats.map((f) => (
                    <div key={f} className="flex items-start gap-2.5">
                      <div
                        className="shrink-0 mt-0.5 w-[18px] h-[18px] rounded-full flex items-center justify-center"
                        style={{
                          background: 'rgba(171,199,255,0.16)',
                          boxShadow: 'inset 0 0 0 1px rgba(171,199,255,0.30)',
                        }}
                      >
                        <Check size={11} strokeWidth={3} style={{ color: '#abc7ff' }} />
                      </div>
                      <span className="text-[12.5px] leading-[1.5] text-[#c7c5c9]">{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Divider ──────────────────────────────────────── */}
        <div className="mt-20 md:mt-24 mb-10 flex items-center gap-5">
          <div
            className="flex-1 h-px"
            style={{
              background:
                'linear-gradient(90deg, transparent, rgba(171,199,255,0.18), transparent)',
            }}
          />
          <span className="text-[11.5px] uppercase tracking-[0.22em] text-[#9b99a0] whitespace-nowrap">
            営業実行も、任せたい方へ
          </span>
          <div
            className="flex-1 h-px"
            style={{
              background:
                'linear-gradient(90deg, transparent, rgba(171,199,255,0.18), transparent)',
            }}
          />
        </div>

        {/* ── ② Partnership tiers ─────────────────────────── */}
        <div className="text-center">
          <div className="inline-flex">
            <Eyebrow color="#FFC107">PARTNERSHIP · 5社限定</Eyebrow>
          </div>
          <h3 className="font-display font-bold tracking-[-0.022em] text-[1.8rem] md:text-[2.3rem] leading-[1.1] mt-4">
            <span className="fo-gradient-text">属人性を、極める。</span>
          </h3>
          <p className="mt-4 text-[13.5px] md:text-[14px] text-[#9b99a0] leading-[1.7] max-w-xl mx-auto">
            ハブスポットや Salesforce には勝てない領域がある。
            <br />
            人 × CRM × AI を1パッケージで、営業実行ごと任せられる体制を組みます。
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-5 mt-12 items-stretch">
          {partnershipTiers.map((t) => {
            const Icon = t.icon
            const accent = t.featured ? '#FFC107' : '#abc7ff'
            const isSoldOut = t.slotsRemaining <= 0
            return (
              <div
                key={t.id}
                className="rounded-3xl p-[1px] h-full flex"
                style={{
                  background: t.featured
                    ? 'linear-gradient(135deg, rgba(255,193,7,0.55), rgba(255,193,7,0.18) 50%, transparent 100%)'
                    : 'linear-gradient(135deg, rgba(171,199,255,0.22), rgba(171,199,255,0.04) 60%, transparent 100%)',
                }}
              >
                <div className="rounded-3xl p-6 fo-glass-rim flex flex-col w-full bg-dusk relative overflow-hidden">
                  {t.featured && (
                    <div
                      className="absolute -top-20 -right-20 w-56 h-56 rounded-full pointer-events-none"
                      style={{
                        background:
                          'radial-gradient(circle, rgba(255,193,7,0.16), transparent 60%)',
                        filter: 'blur(40px)',
                      }}
                    />
                  )}

                  {/* Top row: icon + slots badge */}
                  <div className="flex items-center justify-between relative">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center"
                      style={{
                        background: t.featured
                          ? 'linear-gradient(135deg, rgba(255,193,7,0.25), rgba(255,193,7,0.06))'
                          : 'linear-gradient(135deg, rgba(171,199,255,0.22), rgba(171,199,255,0.05))',
                        boxShadow: `inset 0 0 0 1px ${t.featured ? 'rgba(255,193,7,0.35)' : 'rgba(171,199,255,0.30)'}`,
                      }}
                    >
                      <Icon size={16} style={{ color: accent }} />
                    </div>
                    <span
                      className="text-[10px] font-semibold uppercase tracking-[0.10em] px-2 py-1 rounded-full tabular-nums"
                      style={{
                        background: isSoldOut
                          ? 'rgba(255,90,90,0.12)'
                          : t.featured
                            ? 'rgba(255,193,7,0.14)'
                            : 'rgba(171,199,255,0.12)',
                        color: isSoldOut ? '#FF5A5A' : accent,
                        boxShadow: `inset 0 0 0 1px ${
                          isSoldOut
                            ? 'rgba(255,90,90,0.25)'
                            : t.featured
                              ? 'rgba(255,193,7,0.30)'
                              : 'rgba(171,199,255,0.22)'
                        }`,
                      }}
                    >
                      {isSoldOut
                        ? '満枠'
                        : `残 ${t.slotsRemaining} / ${t.slotsTotal} 社`}
                    </span>
                  </div>

                  {/* Name + tagline */}
                  <div className="mt-4 relative">
                    <div className="flex items-baseline gap-2">
                      <h4
                        className="font-display font-bold tracking-[-0.015em] text-[1.35rem]"
                        style={{ color: '#e7e5ea' }}
                      >
                        {t.name}
                      </h4>
                      {t.featured && (
                        <span
                          className="text-[9px] tracking-[0.14em] px-1.5 py-0.5 rounded-full font-semibold"
                          style={{
                            background: 'rgba(255,193,7,0.14)',
                            color: '#FFC107',
                          }}
                        >
                          ★ POPULAR
                        </span>
                      )}
                    </div>
                    <div className="mt-1 text-[12px] text-[#9b99a0]">{t.tagline}</div>
                  </div>

                  {/* Price */}
                  <div className="mt-5 flex items-baseline gap-1.5 relative">
                    <span
                      className={`font-display font-bold tracking-[-0.03em] text-[2.2rem] ${
                        t.featured ? 'fo-gradient-text' : 'text-[#e7e5ea]'
                      }`}
                    >
                      {formatPrice(t.price)}
                    </span>
                    <span className="text-[12.5px] text-[#9b99a0]">/ 月</span>
                  </div>

                  {/* Cadence + contract */}
                  <div
                    className="mt-3 rounded-lg px-3 py-2 text-[11.5px] leading-[1.5] relative"
                    style={{
                      background: 'rgba(171,199,255,0.05)',
                      boxShadow: 'inset 0 0 0 1px rgba(171,199,255,0.10)',
                      color: '#c7c5c9',
                    }}
                  >
                    <div>{t.cadence}</div>
                    <div className="text-[#9b99a0] mt-0.5">3ヶ月契約・3ヶ月ごとに更新</div>
                  </div>

                  {/* Features */}
                  <div className="mt-5 space-y-2 relative flex-1">
                    {t.feats.map((f) => (
                      <div
                        key={f}
                        className="flex items-start gap-2 text-[12.5px] text-[#c7c5c9] leading-[1.55]"
                      >
                        <Check size={13} strokeWidth={2.5} style={{ color: accent }} className="shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>

                  {/* CTA — Spir 商談予約リンクへ遷移 (リリース準備中のため #waitlist は使わない) */}
                  <a
                    href="https://app.spirinc.com/t/3u_FXTG5abaFIZ-D7as8v/as/5j4iMsFHgutg6an7CRg9o/confirm"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`mt-6 block text-center w-full rounded-lg py-2.5 text-sm font-medium relative transition-colors ${
                      t.featured
                        ? 'text-[#0a0a0c]'
                        : 'text-aurora bg-shimmer/30 hover:bg-shimmer/60'
                    }`}
                    style={
                      t.featured
                        ? { background: 'linear-gradient(135deg, #FFD54F, #FFA000)' }
                        : undefined
                    }
                  >
                    {isSoldOut ? 'キャンセル待ちに登録' : '面談を予約する'}
                  </a>
                </div>
              </div>
            )
          })}
        </div>

        {/* ── ③ Excel migration setup note ────────────────── */}
        <div className="mt-12">
          <div
            className="rounded-2xl p-[1px]"
            style={{
              background:
                'linear-gradient(135deg, rgba(171,199,255,0.18), rgba(171,199,255,0.04) 60%, transparent 100%)',
            }}
          >
            <div className="rounded-2xl bg-dusk fo-glass-rim px-6 py-5 md:px-8 md:py-6 flex items-start gap-4">
              <div
                className="shrink-0 w-11 h-11 rounded-xl flex items-center justify-center mt-1"
                style={{
                  background: 'linear-gradient(135deg, rgba(171,199,255,0.20), rgba(171,199,255,0.04))',
                  boxShadow: 'inset 0 0 0 1px rgba(171,199,255,0.28)',
                }}
              >
                <FileSpreadsheet size={18} style={{ color: '#abc7ff' }} />
              </div>
              <div className="flex-1">
                <div
                  className="font-semibold uppercase tracking-[0.14em] text-[0.68rem]"
                  style={{ color: '#abc7ff' }}
                >
                  SETUP · エクセル管理からの脱却
                </div>
                <h4 className="mt-1.5 font-display font-bold tracking-[-0.015em] text-[1.1rem] text-[#e7e5ea]">
                  まだ Excel・スプレッドシートで管理している企業へ。
                </h4>
                <p className="mt-2 text-[13px] text-[#9b99a0] leading-[1.7]">
                  既存データの構造整理、CRM 初期セットアップ、運用フロー設計、営業実行支援まで{' '}
                  <span className="text-[#e7e5ea] font-medium">セットで設計</span>{' '}
                  します。パートナーシップ契約に組み込み可能。まずは無料の面談で現状を診断します。
                </p>
              </div>
              <a
                href="https://app.spirinc.com/t/3u_FXTG5abaFIZ-D7as8v/as/5j4iMsFHgutg6an7CRg9o/confirm"
                target="_blank"
                rel="noopener noreferrer"
                className="hidden md:inline-flex items-center gap-1.5 self-center rounded-lg px-4 py-2 text-[12.5px] font-medium text-aurora bg-shimmer/30 hover:bg-shimmer/60 transition-colors whitespace-nowrap"
              >
                セットアップ相談 <ArrowRight size={13} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </Section>
  )
}
