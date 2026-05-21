import { Check, Sparkles, Crown, Star, Zap, FileSpreadsheet, ArrowRight } from 'lucide-react'
import { Eyebrow, Section } from '../atoms'

// サービス本体 (/subscription) の PLANS と完全同期する。
// 価格・クレジット・機能項目は app/(app)/subscription/page.tsx の PLANS が
// 単一の真実。変更時は両方を必ず揃える。
//
// LP戦略: 主軸は「営業実行支援パートナーシップ (5社限定・案件獲得)」。
// CRM 無償は「まず試したい層への入口」としてセクション後段に置く。

const SPIR_BOOKING_URL =
  'https://app.spirinc.com/t/3u_FXTG5abaFIZ-D7as8v/as/5j4iMsFHgutg6an7CRg9o/confirm'

interface PartnershipTier {
  id: string
  name: string
  price: number
  slotsTotal: number
  slotsRemaining: number
  cadenceItems: string[] // 3項目 (商談数 / 営業日 / 契約期間)
  icon: typeof Crown
  featured?: boolean
  feats: string[]
}

const partnershipTiers: PartnershipTier[] = [
  {
    id: 'cxo',
    name: 'CxO',
    price: 500000,
    slotsTotal: 1,
    slotsRemaining: 1,
    cadenceItems: [
      '1日2商談まで',
      '平日 日中稼働',
      '3ヶ月契約・3ヶ月ごとに更新',
    ],
    icon: Crown,
    feats: [
      '事業設計全域',
      'マネジメント',
      'IS / FS / CS の営業実装',
      'CRM 構築による営業基盤の構築',
      'CRM 全機能',
      '月10,000クレジット 込み',
    ],
  },
  {
    id: 'playing-manager',
    name: 'プレイングマネージャー',
    price: 300000,
    slotsTotal: 1,
    slotsRemaining: 1,
    cadenceItems: [
      '1日1商談まで',
      '平日 日中稼働',
      '3ヶ月契約・3ヶ月ごとに更新',
    ],
    icon: Star,
    featured: true,
    feats: [
      'マネジメント',
      'IS / FS / CS の営業実装',
      '戦略支援',
      'CRM 構築による営業基盤の構築',
      'CRM 全機能',
      '月10,000クレジット 込み',
    ],
  },
  {
    id: 'player',
    name: 'プレーヤー',
    price: 200000,
    slotsTotal: 3,
    slotsRemaining: 3,
    cadenceItems: [
      '1日1商談まで',
      '平日 日中稼働',
      '3ヶ月契約・3ヶ月ごとに更新',
    ],
    icon: Zap,
    feats: [
      'IS / FS / CS の営業実装',
      '戦略支援',
      'CRM 構築による営業基盤の構築',
      'CRM 全機能',
      '月10,000クレジット 込み',
    ],
  },
]

const selfServeFeats = [
  'CRM 全機能 (企業・コンタクト・取引・パイプライン・チケット)',
  'AIモデル: GPT-4o mini / GPT-4o 選択可',
  'エージェントモード (ブラウザ自動操作)',
  '議事録自動取得 + BANT 自動入力',
  'ナレッジ自動生成 (FAQ) + 開発優先度分析',
  'メール配信 + 1stパーティ計測・効果測定',
  '企業DB (290万社) + 求人インテント + 外部リサーチ',
  'Google Workspace / Microsoft 365 連携',
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
            'radial-gradient(ellipse at 50% 0%, rgba(255,193,7,0.06) 0%, transparent 55%), radial-gradient(ellipse at 80% 100%, rgba(0,113,227,0.04) 0%, transparent 50%)',
        }}
      />

      <div className="relative mx-auto max-w-6xl px-6 py-20 md:py-28">
        {/* ── Header ─────────────────────────────────────── */}
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex">
            <Eyebrow color="#FFC107">PARTNERSHIP · 5社限定</Eyebrow>
          </div>
          <h2 className="font-display font-bold tracking-[-0.025em] text-[2.2rem] md:text-[3rem] leading-[1.06] mt-5">
            <span className="fo-gradient-text">CRMは、無償。</span>
            <br />
            <span className="fo-gradient-text-soft">営業実行は、5社限定で。</span>
          </h2>

          <p className="mt-7 text-[15px] md:text-[16px] text-[#c7c5c9] leading-[1.75] max-w-xl mx-auto">
            <span className="fo-gradient-text-soft font-semibold">営業実行 × CRM</span>{' '}
            で、
            <span className="text-[#e7e5ea] font-semibold">事業成長と売上基盤を 同時につくる。</span>
          </p>
        </div>

        {/* ── ① Partnership tiers (HERO) ──────────────────── */}
        <div className="grid md:grid-cols-3 gap-5 mt-14 items-stretch">
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
                    ? 'linear-gradient(135deg, rgba(255,193,7,0.60), rgba(255,193,7,0.18) 50%, transparent 100%)'
                    : 'linear-gradient(135deg, rgba(171,199,255,0.22), rgba(171,199,255,0.04) 60%, transparent 100%)',
                }}
              >
                <div className="rounded-3xl p-6 fo-glass-rim flex flex-col w-full bg-dusk relative overflow-hidden">
                  {t.featured && (
                    <div
                      className="absolute -top-20 -right-20 w-56 h-56 rounded-full pointer-events-none"
                      style={{
                        background:
                          'radial-gradient(circle, rgba(255,193,7,0.18), transparent 60%)',
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
                      {isSoldOut ? '満枠' : `${t.slotsTotal} 枠`}
                    </span>
                  </div>

                  {/* Name */}
                  <div className="mt-4 relative">
                    <h4
                      className="font-display font-bold tracking-[-0.015em] text-[1.35rem]"
                      style={{ color: '#e7e5ea' }}
                    >
                      {t.name}
                    </h4>
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

                  {/* Features (機能リスト・flex-1 で伸びてCadenceを下端へ押し下げ) */}
                  <div className="mt-5 space-y-2 flex-1 relative">
                    {t.feats.map((f) => (
                      <div key={f} className="flex items-start gap-2">
                        <Check
                          size={13}
                          strokeWidth={2.5}
                          style={{ color: accent }}
                          className="shrink-0 mt-0.5"
                        />
                        <span className="text-[12.5px] leading-[1.55] text-[#c7c5c9]">
                          {f}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Cadence (CTA直前・3項目チェックリスト) */}
                  <div
                    className="mt-5 rounded-lg px-3 py-2.5 relative space-y-1.5"
                    style={{
                      background: 'rgba(171,199,255,0.05)',
                      boxShadow: 'inset 0 0 0 1px rgba(171,199,255,0.10)',
                    }}
                  >
                    {t.cadenceItems.map((item) => (
                      <div key={item} className="flex items-center gap-2">
                        <Check
                          size={11}
                          strokeWidth={3}
                          style={{ color: accent }}
                          className="shrink-0"
                        />
                        <span className="text-[11.5px] leading-[1.4] text-[#c7c5c9]">
                          {item}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* CTA */}
                  <a
                    href={SPIR_BOOKING_URL}
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

        {/* ── Divider: 戦略アドバイザリープラン ──────────── */}
        <div className="mt-20 md:mt-24 mb-10 flex items-center gap-5">
          <div
            className="flex-1 h-px"
            style={{
              background:
                'linear-gradient(90deg, transparent, rgba(171,199,255,0.18), transparent)',
            }}
          />
          <span className="text-[11.5px] uppercase tracking-[0.22em] text-[#9b99a0] whitespace-nowrap">
            自社で運用したい方は CRM のみセルフサーブで
          </span>
          <div
            className="flex-1 h-px"
            style={{
              background:
                'linear-gradient(90deg, transparent, rgba(171,199,255,0.18), transparent)',
            }}
          />
        </div>

        {/* ── ③ SELF-SERVE card (¥29,800 CRM 単独) ────────── */}
        <div>
          <div
            className="rounded-[28px] p-[1px] relative"
            style={{
              background:
                'linear-gradient(135deg, rgba(171,199,255,0.30) 0%, rgba(0,113,227,0.18) 35%, rgba(171,199,255,0.06) 70%, transparent 100%)',
            }}
          >
            <div className="rounded-[27px] bg-dusk fo-glass-rim relative overflow-hidden p-7 md:p-9">
              <div
                className="absolute -top-24 -left-24 w-72 h-72 rounded-full pointer-events-none"
                style={{
                  background: 'radial-gradient(circle, rgba(171,199,255,0.12), transparent 60%)',
                  filter: 'blur(40px)',
                }}
              />

              <div className="relative grid md:grid-cols-[0.85fr,1.4fr] gap-8 items-start">
                {/* Left: price + CTA */}
                <div>
                  <div className="flex items-center gap-2 mb-3 flex-wrap">
                    <Sparkles size={13} style={{ color: '#abc7ff' }} />
                    <span
                      className="font-semibold tracking-[0.02em] text-[12.5px]"
                      style={{ color: '#abc7ff' }}
                    >
                      セルフサーブ · CRM 単独プラン
                    </span>
                  </div>

                  <div className="flex items-baseline gap-2 flex-wrap">
                    <span className="font-display font-bold tracking-[-0.03em] text-[2.4rem] md:text-[2.8rem] leading-[0.95] fo-gradient-text">
                      ¥29,800
                    </span>
                    <span className="text-[#9b99a0] text-[13px] mb-0.5">/ 月</span>
                    {/* CRM リリース準備中バッジ */}
                    <span
                      className="inline-flex items-center gap-1.5 text-[10.5px] font-medium px-2 py-1 rounded-full ml-1 mb-1"
                      style={{
                        background: 'rgba(255,193,7,0.10)',
                        color: '#FFD54F',
                        boxShadow: 'inset 0 0 0 1px rgba(255,193,7,0.28)',
                      }}
                    >
                      <span
                        className="w-1.5 h-1.5 rounded-full animate-pulse"
                        style={{ backgroundColor: '#FFC107' }}
                      />
                      CRM リリース準備中
                    </span>
                  </div>

                  <div
                    className="mt-3 inline-flex items-center gap-2 rounded-full px-3.5 py-1.5"
                    style={{
                      background: 'rgba(171,199,255,0.10)',
                      boxShadow: 'inset 0 0 0 1px rgba(171,199,255,0.22)',
                    }}
                  >
                    <span className="text-[10.5px] uppercase tracking-[0.14em] text-[#9b99a0]">
                      月間
                    </span>
                    <span className="font-display text-[17px] font-bold tabular-nums fo-gradient-text-soft">
                      10,000
                    </span>
                    <span className="text-[11.5px] text-[#c7c5c9]">クレジット (チーム合計)</span>
                  </div>

                  <p className="mt-4 text-[12.5px] text-[#9b99a0] leading-[1.7]">
                    <span className="text-[#e7e5ea] font-semibold">100名まで無料</span>
                    でチーム全員に。CRM 全機能 + クレジット込み。
                    <br />
                    100名超は <span className="text-[#e7e5ea] font-medium">1ライセンス ¥1,000/月</span>{' '}
                    (1,000cr 込み)。追加クレジット 1,000cr ¥1,000。
                  </p>

                  <a
                    href="#waitlist"
                    className="mt-5 inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-[12.5px] font-medium text-aurora bg-shimmer/30 hover:bg-shimmer/60 transition-colors"
                  >
                    先行予約に登録
                    <ArrowRight size={13} />
                  </a>
                </div>

                {/* Right: feature list (8 items, 2-col grid) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-2">
                  {selfServeFeats.map((f) => (
                    <div key={f} className="flex items-start gap-2.5">
                      <div
                        className="shrink-0 mt-0.5 w-[16px] h-[16px] rounded-full flex items-center justify-center"
                        style={{
                          background: 'rgba(171,199,255,0.14)',
                          boxShadow: 'inset 0 0 0 1px rgba(171,199,255,0.26)',
                        }}
                      >
                        <Check size={10} strokeWidth={3} style={{ color: '#abc7ff' }} />
                      </div>
                      <span className="text-[12px] leading-[1.5] text-[#c7c5c9]">{f}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* ── Excel migration helper (戦略カード内に統合) ── */}
              <div
                className="relative mt-6 rounded-2xl px-4 py-3.5 md:px-5 md:py-4 flex items-center gap-3.5"
                style={{
                  background: 'rgba(255,193,7,0.05)',
                  boxShadow: 'inset 0 0 0 1px rgba(255,193,7,0.20)',
                }}
              >
                <div
                  className="shrink-0 w-9 h-9 rounded-lg flex items-center justify-center"
                  style={{
                    background:
                      'linear-gradient(135deg, rgba(255,193,7,0.20), rgba(255,193,7,0.04))',
                    boxShadow: 'inset 0 0 0 1px rgba(255,193,7,0.32)',
                  }}
                >
                  <FileSpreadsheet size={15} style={{ color: '#FFC107' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div
                    className="font-semibold uppercase tracking-[0.12em] text-[0.62rem]"
                    style={{ color: '#FFC107' }}
                  >
                    MIGRATION · 既存ツールからの移行
                  </div>
                  <p className="mt-0.5 text-[12px] text-[#c7c5c9] leading-[1.55]">
                    <span className="text-[#e7e5ea] font-medium">
                      Excel / スプレッドシート / HubSpot / Salesforce
                    </span>{' '}
                    からの CSV 移行に対応。
                    <span className="text-[#9b99a0]">
                      データ構造整理 + 初期セットアップを承ります。
                    </span>
                  </p>
                </div>
                <a
                  href={SPIR_BOOKING_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hidden md:inline-flex shrink-0 items-center gap-1.5 self-center rounded-lg px-3.5 py-1.5 text-[11.5px] font-medium whitespace-nowrap transition-colors"
                  style={{
                    background: 'linear-gradient(135deg, #FFD54F, #FFA000)',
                    color: '#0a0a0c',
                  }}
                >
                  相談する <ArrowRight size={12} />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Section>
  )
}
