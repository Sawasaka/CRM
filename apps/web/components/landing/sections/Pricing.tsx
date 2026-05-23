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
  scope: string[] // 営業範囲
  crm: string[] // CRM 提供内容
  cadenceItems: string[] // 稼働条件 (商談数 / 営業日 / 契約期間)
  icon: typeof Crown
  featured?: boolean
  accentHex: string // アクセントカラー (HEX)
  accentRgb: string // アクセントカラー (RGB)
}

const partnershipTiers: PartnershipTier[] = [
  {
    id: 'cxo',
    name: 'CxO',
    price: 500000,
    slotsTotal: 1,
    slotsRemaining: 1,
    icon: Crown,
    accentHex: '#E5E7EB',
    accentRgb: '229, 231, 235',
    scope: [
      '事業設計',
      'IS 設計',
      'FS / CS の営業実装',
    ],
    crm: [
      'CRM 構築',
      'CRM 全機能',
      '月30,000クレジット 込み',
    ],
    cadenceItems: [
      '1日2商談まで',
      '平日 日中稼働',
      '3ヶ月契約・3ヶ月ごとに更新',
    ],
  },
  {
    id: 'sales-director',
    name: '営業責任者',
    price: 300000,
    slotsTotal: 1,
    slotsRemaining: 1,
    icon: Star,
    featured: true,
    accentHex: '#FFC107',
    accentRgb: '255, 193, 7',
    scope: [
      'IS 設計',
      'FS / CS の営業実装',
      '分析レポーティング',
    ],
    crm: [
      'CRM 構築',
      'CRM 全機能',
      '月20,000クレジット 込み',
    ],
    cadenceItems: [
      '1日1商談まで',
      '平日 日中稼働',
      '3ヶ月契約・3ヶ月ごとに更新',
    ],
  },
  {
    id: 'is-design',
    name: 'IS 設計',
    price: 200000,
    slotsTotal: 3,
    slotsRemaining: 3,
    icon: Zap,
    accentHex: '#34D399',
    accentRgb: '52, 211, 153',
    scope: [
      'IS チーム組成',
      'IS 設計',
      'IS マネジメント',
    ],
    crm: [
      'CRM 構築',
      'CRM 全機能',
      '月10,000クレジット 込み',
    ],
    cadenceItems: [
      '週1回の社内MTG',
      '平日 日中稼働',
      '3ヶ月契約・3ヶ月ごとに更新',
    ],
  },
]

const selfServeFeats = [
  'CRM 全機能 (企業・コンタクト・取引・パイプライン・チケット)',
  'AIモデル: Gemini 2.5 Flash Lite / GPT-4o mini / GPT-4o 選択可',
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
            <Eyebrow color="#FFC107">SALES × CRM</Eyebrow>
          </div>
          <h2 className="font-display font-bold tracking-[-0.025em] text-[2.2rem] md:text-[3rem] leading-[1.06] mt-5">
            <span className="fo-gradient-text">CRMは、無償。</span>
            <br />
            <span className="fo-gradient-text-soft">営業実行とCRM構築。</span>
          </h2>
        </div>

        {/* ── ① Partnership tiers (HERO) ──────────────────── */}
        <div className="grid md:grid-cols-3 gap-5 mt-14 items-stretch">
          {partnershipTiers.map((t) => {
            const Icon = t.icon
            const accent = t.accentHex
            const rgb = t.accentRgb
            const isSoldOut = t.slotsRemaining <= 0
            return (
              <div
                key={t.id}
                className="rounded-3xl p-[1.5px] h-full flex transition-transform duration-300"
                style={{
                  background: t.featured
                    ? `linear-gradient(135deg, rgba(${rgb},0.80), rgba(${rgb},0.30) 45%, rgba(${rgb},0.06) 75%, transparent 100%)`
                    : `linear-gradient(135deg, rgba(${rgb},0.35), rgba(${rgb},0.06) 60%, transparent 100%)`,
                  boxShadow: t.featured
                    ? `0 24px 60px -20px rgba(${rgb},0.32), 0 0 0 1px rgba(${rgb},0.10)`
                    : `0 10px 30px -15px rgba(0,0,0,0.5), 0 0 0 1px rgba(${rgb},0.04)`,
                }}
              >
                <div className="rounded-[22px] p-7 fo-glass-rim flex flex-col w-full bg-dusk relative overflow-hidden">
                  {/* ambient glow */}
                  <div
                    className="absolute -top-24 -right-20 w-60 h-60 rounded-full pointer-events-none"
                    style={{
                      background: t.featured
                        ? `radial-gradient(circle, rgba(${rgb},0.24), transparent 60%)`
                        : `radial-gradient(circle, rgba(${rgb},0.12), transparent 60%)`,
                      filter: 'blur(50px)',
                    }}
                  />
                  <div
                    className="absolute -bottom-24 -left-20 w-52 h-52 rounded-full pointer-events-none"
                    style={{
                      background: `radial-gradient(circle, rgba(${rgb},0.08), transparent 60%)`,
                      filter: 'blur(50px)',
                    }}
                  />

                  {/* Top row: icon + slots badge */}
                  <div className="flex items-start justify-between relative">
                    <div
                      className="w-11 h-11 rounded-[14px] flex items-center justify-center"
                      style={{
                        background: `linear-gradient(135deg, rgba(${rgb},0.32), rgba(${rgb},0.06))`,
                        boxShadow: `inset 0 0 0 1px rgba(${rgb},0.40), 0 6px 16px -6px rgba(${rgb},0.26)`,
                      }}
                    >
                      <Icon size={19} strokeWidth={2.2} style={{ color: accent }} />
                    </div>
                    <span
                      className="text-[10px] font-semibold uppercase tracking-[0.10em] px-2.5 py-1 rounded-full tabular-nums"
                      style={{
                        background: isSoldOut
                          ? 'rgba(255,90,90,0.12)'
                          : `rgba(${rgb},0.16)`,
                        color: isSoldOut ? '#FF5A5A' : accent,
                        boxShadow: `inset 0 0 0 1px ${
                          isSoldOut ? 'rgba(255,90,90,0.25)' : `rgba(${rgb},0.34)`
                        }`,
                      }}
                    >
                      {isSoldOut ? '満枠' : `${t.slotsTotal} 枠`}
                    </span>
                  </div>

                  {/* Name */}
                  <div className="mt-5 relative">
                    <h4
                      className="font-display font-bold tracking-[-0.02em] text-[1.55rem] leading-[1.1]"
                      style={{ color: '#f0eef2' }}
                    >
                      {t.name}
                    </h4>
                  </div>

                  {/* Hair-line divider */}
                  <div
                    className="mt-4 h-px"
                    style={{
                      background: `linear-gradient(90deg, rgba(${rgb},0.30) 0%, rgba(${rgb},0.08) 50%, transparent 100%)`,
                    }}
                  />

                  {/* 3グループ (営業範囲 / CRM 提供内容 / 稼働条件) */}
                  <div className="mt-5 flex-1 relative space-y-5">
                    {[
                      { label: '営業範囲', items: t.scope },
                      { label: 'CRM 提供内容', items: t.crm },
                      { label: '稼働条件', items: t.cadenceItems },
                    ].map((group) => (
                      <div key={group.label}>
                        <div
                          className="font-semibold uppercase tracking-[0.16em] text-[10px] mb-2"
                          style={{ color: accent, opacity: 0.85 }}
                        >
                          {group.label}
                        </div>
                        <div className="space-y-2">
                          {group.items.map((item) => (
                            <div key={item} className="flex items-start gap-2.5">
                              <div
                                className="shrink-0 mt-0.5 w-[17px] h-[17px] rounded-full flex items-center justify-center"
                                style={{
                                  background: `rgba(${rgb},0.14)`,
                                  boxShadow: `inset 0 0 0 1px rgba(${rgb},0.30)`,
                                }}
                              >
                                <Check size={10} strokeWidth={3} style={{ color: accent }} />
                              </div>
                              <span className="text-[12.5px] leading-[1.55] text-[#d7d5d9]">
                                {item}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Price (CTA直前) */}
                  <div className="mt-5 flex items-baseline gap-1.5 relative">
                    <span
                      className="font-display font-bold tracking-[-0.03em] text-[2.3rem] leading-none"
                      style={{
                        background: `linear-gradient(135deg, ${accent}, #f0eef2)`,
                        WebkitBackgroundClip: 'text',
                        backgroundClip: 'text',
                        color: 'transparent',
                      }}
                    >
                      {formatPrice(t.price)}
                    </span>
                    <span className="text-[12.5px] text-[#9b99a0]">/ 月</span>
                  </div>

                  {/* CTA */}
                  <a
                    href={SPIR_BOOKING_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-6 block text-center w-full rounded-xl py-3 text-[13px] font-semibold relative transition-all duration-300 hover:-translate-y-0.5"
                    style={
                      t.featured
                        ? {
                            background: `linear-gradient(135deg, ${accent}, rgba(${rgb},0.78))`,
                            color: '#0a0a0c',
                            boxShadow: `0 10px 28px -10px rgba(${rgb},0.50)`,
                          }
                        : {
                            background: `rgba(${rgb},0.10)`,
                            color: accent,
                            boxShadow: `inset 0 0 0 1px rgba(${rgb},0.28)`,
                          }
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
            CRM 単独移行のプランはこちら
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
                    className="mt-3 flex flex-wrap gap-2"
                  >
                    <span
                      className="inline-flex items-center gap-2 rounded-full px-3.5 py-1.5"
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
                    </span>
                  </div>

                  <p className="mt-4 text-[12.5px] text-[#9b99a0] leading-[1.7]">
                    <span className="text-[#e7e5ea] font-semibold">100名まで無料</span>
                    でチーム全員に。CRM 全機能 + クレジット込み。
                    <br />
                    1ユーザーあたり <span className="text-[#e7e5ea] font-medium">1日10cr（約100円相当）</span> まで利用可能。
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
                    className="font-semibold tracking-[0.04em] text-[0.78rem]"
                    style={{ color: '#FFC107' }}
                  >
                    既存ツールからの移行
                  </div>
                  <p className="mt-0.5 text-[12px] text-[#c7c5c9] leading-[1.55]">
                    <span className="text-[#e7e5ea] font-medium">
                      Excel / Spreadsheet / HubSpot / Salesforce
                    </span>{' '}
                    からのデータ移行に対応。
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
