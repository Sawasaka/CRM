'use client'

import { useState } from 'react'
import { Check, Sparkles, Crown, Zap, FileSpreadsheet, ArrowRight } from 'lucide-react'
import { AGENTS, type AgentKey, Eyebrow, Orb, Section } from '../atoms'
import { ConsultationCallButton } from '../ConsultationCallModal'

const SHOW_SELF_SERVE_BLOCK = false

// サービス本体 (/subscription) の PLANS と完全同期する。
// 価格・クレジット・機能項目は app/(app)/subscription/page.tsx の PLANS が
// 単一の真実。変更時は両方を必ず揃える。
//
// LP戦略: 主軸は「営業・マーケ領域のAI/DXインフラ設計」。
// Obsidian / Notion / Google Workspace / Microsoft / Zoom などを、個社ごとのAIインフラに組み込む。

interface PartnershipTier {
  id: string
  name: string
  price: number
  slotsRemaining: number
  scope: string[] // 営業範囲
  crm: string[] // 不通時フォロー
  cadenceItems: string[] // 稼働条件 (商談数 / 営業日 / 契約期間)
  icon: typeof Crown
  featured?: boolean
  accentHex: string // アクセントカラー (HEX)
  accentRgb: string // アクセントカラー (RGB)
}

// ── Revenue AI/DX 設計支援 ────────
const salesDesignTiers: PartnershipTier[] = [
  {
    id: 'sales-director',
    name: 'Revenue Architect',
    price: 300000,
    slotsRemaining: 1,
    icon: Crown,
    accentHex: '#E5E7EB',
    accentRgb: '229, 231, 235',
    scope: [
      '営業インフラ設計',
      'マーケ導線設計',
      'CRM / CS の運用設計',
    ],
    crm: [
      'Obsidian / Notion 基盤設計',
      'Google Workspace / Microsoft 連携',
      'Zoom議事録・問い合わせ導線設計',
    ],
    cadenceItems: [
      '1日1商談',
      '平日 日中稼働',
      '3ヶ月契約・3ヶ月ごとに更新',
    ],
  },
  {
    id: 'is-manager',
    name: 'AI/DX Implement',
    price: 200000,
    slotsRemaining: 3,
    icon: Zap,
    featured: true,
    accentHex: '#FFC107',
    accentRgb: '255, 193, 7',
    scope: [
      'AIツール導入',
      'DXオペレーション設計',
      '現場定着の運用改善',
    ],
    crm: [
      '社内ポータル / AIナレッジ設計',
      'Notion / Google Workspace 活用',
      '業務フロー・自動化設計',
    ],
    cadenceItems: [
      '週1回の社内MTG',
      '平日 日中稼働',
      '3ヶ月契約・3ヶ月ごとに更新',
    ],
  },
  {
    id: 'is-design-plan',
    name: 'Starter Design',
    price: 150000,
    slotsRemaining: 3,
    icon: Sparkles,
    accentHex: '#10B981',
    accentRgb: '16, 185, 129',
    scope: [
      '現状ヒアリング',
      '営業・マーケ課題整理',
      '導入ロードマップ作成',
    ],
    crm: [
      '既存ツール棚卸し',
      'AI活用ロードマップ',
      'オウンドメディア / FAQ導線案',
    ],
    cadenceItems: [
      '週1回の社内MTG',
      '平日 日中稼働',
      '3ヶ月契約・3ヶ月ごとに更新',
    ],
  },
]

// 5 エージェント × 機能（両プラン共通）
const agentFeats: { key: AgentKey; items: string[] }[] = [
  {
    key: 'sales',
    items: ['議事録 → 自動登録', '企業リサーチのプリセット', 'チャット内から何でも質問'],
  },
  {
    key: 'marketing',
    items: ['採用インテント検知', 'メール配信', '1st パーティ計測'],
  },
  {
    key: 'support',
    items: ['問い合わせ → チケット登録', 'ステータス管理', '過去履歴 参照'],
  },
  {
    key: 'helpdesk',
    items: ['議事録 → FAQ 自動作成', '自動タグ付け', 'ナレッジ絞り込み'],
  },
  {
    key: 'pdm',
    items: ['議事録 → 課題集計', '議事録 → ニーズ集計', '優先度スコアリング'],
  },
]

// セルフサーブ CRM 単独プラン
// 年間プランは月額から約38%OFF。表示は月額換算。
interface SelfServePlan {
  id: 'lite' | 'standard'
  name: string
  credits: number // 月間クレジット (チーム合計)
  dbRecords: number | null // 月間のAIナレッジ接続目安
  monthly: number // 月額プラン: 月額
  annualMonthly: number // 年間プラン: 月額換算
  priceUnit: string
  creditUnitLabel: string
  dbLabel: string
  maxSeats: number // 最大シート数
  featured?: boolean
  perks: string[] // 戦略MTG / サポート など
}

// 既存SaaSとAIナレッジ活用の参考プラン。
const selfServePlans: SelfServePlan[] = [
  {
    id: 'lite',
    name: 'Standard',
    credits: 300,
    dbRecords: null,
    monthly: 3000,
    annualMonthly: 3000,
    priceUnit: '/ 人・月',
    creditUnitLabel: 'クレジット / 人・月',
    dbLabel: '外部ナレッジ接続なし',
    maxSeats: 30,
    perks: ['Slack チャットサポート'],
  },
  {
    id: 'standard',
    name: 'Growth',
    credits: 30000,
    dbRecords: 1500,
    monthly: 158000,
    annualMonthly: 98000,
    priceUnit: '/ 月',
    creditUnitLabel: 'チームクレジット / 月',
    dbLabel: 'AIナレッジ接続枠 / 月',
    maxSeats: 100,
    featured: true,
    perks: ['Slack チャットサポート', '専属サクセス担当'],
  },
]

const formatPrice = (n: number) => `¥${n.toLocaleString()}`

type CallRoiRow = {
  label: string
  sub: string
  value: string
  isTotal?: boolean
}

const humanCallRows: CallRoiRow[] = [
  { label: '架電工数', sub: '3,000コール ÷ 15件/時 = 200時間', value: '400,000円' },
  { label: 'コール環境', sub: 'かけ放題プラン等', value: '10,000円' },
  { label: '合計', sub: '3,000コール・300接続を人が作る場合', value: '410,000円', isTotal: true },
]

const aiCallRows: CallRoiRow[] = [
  { label: 'AI接続プラン', sub: '300接続パッケージ', value: '158,000円' },
  { label: '1接続あたり', sub: '158,000円 ÷ 300接続', value: '527円' },
  { label: '削減額', sub: '人手運用との差額', value: '252,000円' },
  { label: '自動化範囲', sub: '即時架電・不通時フォロー込み', value: '24時間対応', isTotal: true },
]

type CallRoiAssumption = {
  label: string
  value: string
}

const humanCallAssumptions: CallRoiAssumption[] = [
  { label: '人件費', value: '2,000円 / 時間' },
  { label: '架電ペース', value: '15コール / 時間' },
  { label: '担当者接続', value: '10コールに1件' },
  { label: '1アポ必要担当者接続数', value: '15件' },
  { label: '1アポ必要コール数', value: '150コール' },
  { label: '1アポイント単価', value: '20,000円' },
]

const aiCallAssumptions: CallRoiAssumption[] = [
  { label: '即時架電', value: 'HP / 資料請求' },
  { label: '不通時フォロー', value: 'SMS・留守電・追加電話' },
  { label: '稼働時間', value: '24時間対応' },
  { label: '接続上限', value: '100件' },
]

function CallRoiCard({
  eyebrow,
  rows,
  accent,
  assumptions,
}: {
  eyebrow: string
  rows: CallRoiRow[]
  accent: string
  assumptions?: CallRoiAssumption[]
}) {
  return (
    <div className="rounded-3xl bg-dusk p-6 md:p-7 fo-glass-rim relative overflow-hidden flex flex-col">
      <div
        className="absolute -top-24 -right-20 w-56 h-56 rounded-full pointer-events-none"
        style={{ background: `radial-gradient(circle, ${accent}2e, transparent 62%)`, filter: 'blur(46px)' }}
      />
      <div className="relative flex items-baseline justify-between gap-3">
        <div className="font-semibold uppercase tracking-[0.14em] text-[0.7rem]" style={{ color: accent }}>
          {eyebrow}
        </div>
        <div
          className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold tracking-[0.10em] whitespace-nowrap"
          style={{
            background: `${accent}14`,
            color: accent,
            boxShadow: `inset 0 0 0 1px ${accent}40`,
          }}
        >
          3,000コール・300接続
        </div>
      </div>

      {assumptions && (
        <div
          className="relative mt-4 grid grid-cols-1 gap-2 rounded-2xl p-3 sm:grid-cols-2"
          style={{
            background: 'rgba(171,199,255,0.045)',
            boxShadow: 'inset 0 0 0 1px rgba(171,199,255,0.10)',
          }}
        >
          {assumptions.map((item) => (
            <div
              key={`${item.label}-${item.value}`}
              className="flex min-w-0 items-center justify-between gap-3 rounded-xl px-2.5 py-2 text-[10.5px] leading-tight"
              style={{
                background: 'rgba(10,10,12,0.18)',
                boxShadow: 'inset 0 0 0 1px rgba(171,199,255,0.06)',
              }}
            >
              <div className="flex min-w-0 items-center gap-2 text-[#9b99a0]">
                <span
                  className="h-1.5 w-1.5 shrink-0 rounded-full"
                  style={{ backgroundColor: accent, boxShadow: `0 0 10px ${accent}` }}
                />
                <span className="whitespace-nowrap">{item.label}</span>
              </div>
              <span
                className="min-w-0 whitespace-nowrap text-right font-semibold text-[#e7e5ea]"
              >
                {item.value}
              </span>
            </div>
          ))}
        </div>
      )}

      <div className="relative mt-5 space-y-1 flex-1">
        {rows.map((row, index) => (
          <div
            key={row.label}
            className="flex items-center justify-between gap-4"
            style={
              row.isTotal
                ? {
                    marginTop: '8px',
                    paddingTop: '14px',
                    paddingBottom: '4px',
                    borderTop: '1px solid rgba(171,199,255,0.22)',
                  }
                : {
                    paddingTop: '9px',
                    paddingBottom: '9px',
                    borderTop: index === 0 ? 'none' : '1px solid rgba(171,199,255,0.06)',
                  }
            }
          >
            <div className="min-w-0">
              <div
                className={
                  row.isTotal
                    ? 'text-[0.78rem] uppercase tracking-[0.14em] text-[#9b99a0]'
                    : 'text-[0.92rem] text-[#e7e5ea] font-medium'
                }
              >
                {row.label}
              </div>
              <div className="text-[11px] text-[#7e7c83] mt-1 leading-relaxed">{row.sub}</div>
            </div>
            <div
              className={
                row.isTotal
                  ? 'font-display font-bold text-[1.25rem] whitespace-nowrap tabular-nums fo-gradient-text'
                  : 'font-mono text-[#c7c5c9] text-[0.95rem] whitespace-nowrap tabular-nums'
              }
            >
              {row.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function CallROIBlock() {
  return (
    <div className="rounded-[28px] bg-dusk/70 fo-glass-rim p-6 md:p-8 relative overflow-hidden flex flex-col">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at 18% 0%, rgba(171,199,255,0.10), transparent 52%), radial-gradient(ellipse at 82% 100%, rgba(16,185,129,0.08), transparent 54%)',
        }}
      />
      <div className="relative max-w-3xl">
        <Eyebrow color="#abc7ff">CALL ROI</Eyebrow>
        <h3 className="font-display font-bold tracking-[-0.025em] text-[1.7rem] md:text-[2.4rem] leading-[1.15] mt-4">
          <span className="fo-gradient-text">人が3,000コール・300接続を作ると、</span>
          <br />
          <span className="fo-gradient-text-soft whitespace-nowrap">約41万円。</span>
        </h3>
        <p className="mt-4 text-[#9b99a0] text-[13.5px] leading-relaxed max-w-2xl">
          代表番号への架電は、担当者接続までの空振り工数が大きくなります。
        </p>
      </div>

      <div className="relative grid gap-5 mt-8 items-stretch">
        <CallRoiCard
          eyebrow="人間が架電"
          rows={humanCallRows}
          accent="#abc7ff"
          assumptions={humanCallAssumptions}
        />
        <CallRoiCard
          eyebrow="AI接続プラン"
          rows={aiCallRows}
          accent="#10B981"
          assumptions={aiCallAssumptions}
        />
      </div>

      <div
        className="relative mt-6 rounded-2xl px-5 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3"
        style={{
          background: 'linear-gradient(135deg, rgba(171,199,255,0.10), rgba(16,185,129,0.08))',
          boxShadow: 'inset 0 0 0 1px rgba(171,199,255,0.16)',
        }}
      >
        <div className="text-[12.5px] text-[#c7c5c9] leading-relaxed">
          人手運用と比べて月252,000円を削減。即時架電、不通時フォロー、24時間対応まで含めて自動化できます。
        </div>
        <div className="font-display font-bold text-[1.35rem] fo-gradient-text-soft whitespace-nowrap">
          月252,000円削減
        </div>
      </div>
    </div>
  )
}

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
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex">
          <Eyebrow color="#FFC107">Revenue Infrastructure Design</Eyebrow>
          </div>
          <h2 className="mx-auto mt-5 max-w-3xl font-display text-[1.95rem] font-bold leading-[1.08] tracking-[-0.02em] md:text-[2.45rem]">
            <span className="fo-gradient-text">AI/DXインフラを、</span>
            <br />
            <span className="fo-gradient-text-soft">月額で構築。</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-[0.9rem] leading-7 text-[#9b99a0]">
            既存ツールを活かし、営業・マーケのAI基盤を小さく設計・実装します。
          </p>
        </div>

        {/* ── ① IS 設計支援 パートナーシップ (HERO) ──────────────────── */}
        <div className="mt-11 grid items-stretch gap-5 md:grid-cols-3">
          {salesDesignTiers.map((t) => {
            const Icon = t.icon
            const accent = t.accentHex
            const rgb = t.accentRgb
            const isSoldOut = t.slotsRemaining <= 0
            return (
              <div
                key={t.id}
                className="rounded-3xl p-[1.5px] h-full flex transition-transform duration-300"
                style={{
                  // 3 プラン共通の "fade-to-transparent" グラデーション。
                  // featured(gold)のトンマナを基準に、accent 色だけ差し替えて統一感を出す
                  background: `linear-gradient(135deg, rgba(${rgb},0.80), rgba(${rgb},0.30) 45%, rgba(${rgb},0.06) 75%, transparent 100%)`,
                  boxShadow: `0 24px 60px -20px rgba(${rgb},0.32), 0 0 0 1px rgba(${rgb},0.10)`,
                }}
              >
                <div className="rounded-[22px] p-7 fo-glass-rim flex flex-col w-full bg-dusk relative overflow-hidden">
                  {/* ambient glow — 全カード共通の柔らかい diffuse glow */}
                  <div
                    className="absolute -top-24 -right-20 w-60 h-60 rounded-full pointer-events-none"
                    style={{
                      background: `radial-gradient(circle, rgba(${rgb},0.24), transparent 60%)`,
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

                  {/* Top row: icon + slot badge */}
                  <div className="relative flex items-start justify-between">
                    <div
                      className="w-11 h-11 rounded-[14px] flex items-center justify-center"
                      style={{
                        background: `linear-gradient(135deg, rgba(${rgb},0.32), rgba(${rgb},0.06))`,
                        boxShadow: `inset 0 0 0 1px rgba(${rgb},0.40), 0 6px 16px -6px rgba(${rgb},0.26)`,
                      }}
                    >
                      <Icon size={19} strokeWidth={2.2} style={{ color: accent }} />
                    </div>
                    <div
                      className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold tracking-[0.10em] whitespace-nowrap"
                      style={{
                        background: `rgba(${rgb},0.12)`,
                        color: accent,
                        boxShadow: `inset 0 0 0 1px rgba(${rgb},0.40)`,
                      }}
                    >
                      {t.slotsRemaining} 枠
                    </div>
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
                      { label: '設計範囲', items: t.scope },
                      { label: 'AI/DX 基盤', items: t.crm },
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
                          {group.items.map((item) => {
                            return (
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
                            )
                          })}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Price (CTA直前)
                      薄いaccent(例: #abc7ff)のときtext-clipだと全体が淡すぎて読めないため、
                      白→accentでコントラストを確保する。 */}
                  <div className="mt-5 flex items-baseline gap-1.5 relative">
                    <span
                      className="font-display font-bold tracking-[-0.03em] text-[2.3rem] leading-none"
                      style={{
                        background: `linear-gradient(135deg, #ffffff 0%, #f5f3f7 45%, ${accent} 100%)`,
                        WebkitBackgroundClip: 'text',
                        backgroundClip: 'text',
                        color: 'transparent',
                        textShadow: `0 0 24px rgba(${rgb},0.20)`,
                      }}
                    >
                      {formatPrice(t.price)}
                    </span>
                    <span className="text-[12.5px] text-[#9b99a0]">/ 月</span>
                    <span className="text-[10.5px] text-[#7e7c83]">税抜</span>
                  </div>

                  {/* CTA */}
                  <ConsultationCallButton
                    className="mt-6 block text-center w-full rounded-xl py-3 text-[13px] font-semibold relative transition-all duration-300 hover:-translate-y-0.5"
                    style={
                      t.featured
                        ? {
                            background: `linear-gradient(135deg, ${accent}, rgba(${rgb},0.78))`,
                            color: '#0a0a0c',
                            boxShadow: `0 10px 28px -10px rgba(${rgb},0.50)`,
                          }
                        : {
                            background: `rgba(${rgb},0.22)`,
                            color: accent,
                            boxShadow: `inset 0 0 0 1px rgba(${rgb},0.55)`,
                          }
                    }
                    source={`landing_pricing_sales_design_${t.id}`}
                    message={`${t.name}プランについて相談したいです。`}
                  >
                    {isSoldOut ? 'キャンセル待ちに登録' : '面談を予約する'}
                  </ConsultationCallButton>
                </div>
              </div>
            )
          })}
        </div>

        {/* ── Divider: CRM standalone plans ──────────── */}
        <div className="mt-14 md:mt-16 mb-10 flex items-center gap-5">
          <div
            className="flex-1 h-px"
            style={{
              background:
                'linear-gradient(90deg, transparent, rgba(171,199,255,0.18), transparent)',
            }}
          />
          <span className="text-[11.5px] uppercase tracking-[0.22em] text-[#9b99a0] whitespace-nowrap">
            CRM / AIツール単独利用の参考プラン
          </span>
          <div
            className="flex-1 h-px"
            style={{
              background:
                'linear-gradient(90deg, transparent, rgba(171,199,255,0.18), transparent)',
            }}
          />
        </div>

        {/* AI/DXツール単独プランはLPでは一旦非表示 */}
        {SHOW_SELF_SERVE_BLOCK && <SelfServeBlock />}
      </div>
    </Section>
  )
}

// ── セルフサーブ CRM 単独 2プラン (年間 / 月額タブ) ──────────────────────────────
function SelfServeBlock() {
  const [billing, setBilling] = useState<'annual' | 'monthly'>('annual')
  const [standardSeats, setStandardSeats] = useState(1)
  const standardCredits = standardSeats * 300
  const standardDbRecords = Math.floor(standardCredits / 20)

  return (
    <div>
      {/* Header row: title + tab */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-5">
        <div className="flex items-center gap-2 flex-wrap">
          <Sparkles size={14} style={{ color: '#abc7ff' }} />
          <span
            className="font-semibold tracking-[0.02em] text-[13px]"
            style={{ color: '#abc7ff' }}
          >
            AI/DXツール単独プラン
          </span>
          <span
            className="inline-flex items-center gap-1.5 text-[10.5px] font-medium px-2 py-0.5 rounded-full ml-1"
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
            CRM 単独提供
          </span>
        </div>

        {/* Billing toggle (年間 / 月額) */}
        <div
          className="inline-flex items-center gap-1 rounded-full p-1 self-start sm:self-auto"
          style={{
            background: 'rgba(171,199,255,0.06)',
            boxShadow: 'inset 0 0 0 1px rgba(171,199,255,0.18)',
          }}
        >
          {(['annual', 'monthly'] as const).map((b) => {
            const active = billing === b
            return (
              <button
                key={b}
                type="button"
                onClick={() => setBilling(b)}
                className="relative inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[11.5px] font-medium transition-colors"
                style={{
                  background: active ? 'linear-gradient(135deg, #abc7ff, #0071e3)' : 'transparent',
                  color: active ? '#0a0a0c' : '#9b99a0',
                }}
              >
                {b === 'annual' ? '年間' : '月額'}
                {b === 'annual' && (
                  <span
                    className="text-[9.5px] font-mono uppercase tracking-[0.10em] px-1.5 py-0.5 rounded-full"
                    style={{
                      background: active ? 'rgba(10,10,12,0.18)' : 'rgba(141,255,201,0.16)',
                      color: active ? '#0a0a0c' : '#8dffc9',
                    }}
                  >
                    約 38% OFF
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Plan cards */}
      <div className="grid md:grid-cols-2 gap-5 w-full">
        {selfServePlans.map((p) => {
          const isSeatPlan = p.id === 'lite'
          const planCredits = isSeatPlan ? standardCredits : p.credits
          const planDbRecords = isSeatPlan ? standardDbRecords : p.dbRecords
          const displayPrice = isSeatPlan
            ? standardSeats * p.monthly
            : billing === 'annual'
              ? p.annualMonthly
              : p.monthly
          return (
            <div
              key={p.id}
              className="rounded-[24px] p-[1px] relative flex"
              style={{
                background: p.featured
                  ? 'linear-gradient(135deg, rgba(171,199,255,0.55) 0%, rgba(0,113,227,0.22) 45%, rgba(171,199,255,0.06) 75%, transparent 100%)'
                  : 'linear-gradient(135deg, rgba(171,199,255,0.25) 0%, rgba(171,199,255,0.05) 60%, transparent 100%)',
                boxShadow: p.featured
                  ? '0 24px 60px -20px rgba(171,199,255,0.32), 0 0 0 1px rgba(171,199,255,0.10)'
                  : '0 10px 30px -15px rgba(0,0,0,0.5), 0 0 0 1px rgba(171,199,255,0.04)',
              }}
            >
              <div className="rounded-[23px] bg-dusk fo-glass-rim relative overflow-hidden p-6 md:p-8 flex flex-col w-full min-h-[270px]">
                <div
                  className="absolute -top-24 -right-20 w-56 h-56 rounded-full pointer-events-none"
                  style={{
                    background: p.featured
                      ? 'radial-gradient(circle, rgba(171,199,255,0.22), transparent 60%)'
                      : 'radial-gradient(circle, rgba(171,199,255,0.10), transparent 60%)',
                    filter: 'blur(45px)',
                  }}
                />

                {isSeatPlan ? (
                  <div
                    className="absolute top-6 right-6 md:top-8 md:right-8 rounded-xl px-3 py-2.5 flex items-center gap-2 shrink-0 min-w-[154px] justify-end z-10"
                    style={{
                      background: 'rgba(171,199,255,0.05)',
                      boxShadow: 'inset 0 0 0 1px rgba(171,199,255,0.14)',
                    }}
                  >
                    <div className="text-right min-w-0">
                      <div className="text-[10.5px] font-semibold text-[#e7e5ea] whitespace-nowrap">シート数</div>
                      <div className="text-[9.5px] text-[#7e7c83] mt-0.5">¥3,000 / 人</div>
                    </div>
                    <input
                      type="number"
                      min={1}
                      max={99}
                      value={standardSeats}
                      onChange={(e) => {
                        const next = Number.parseInt(e.target.value, 10)
                        if (Number.isNaN(next)) {
                          setStandardSeats(1)
                          return
                        }
                        setStandardSeats(Math.min(99, Math.max(1, next)))
                      }}
                      className="w-16 rounded-lg px-2.5 py-2 text-right text-[14px] font-semibold tabular-nums outline-none"
                      style={{
                        background: 'rgba(10,10,12,0.48)',
                        color: '#e7e5ea',
                        boxShadow: 'inset 0 0 0 1px rgba(171,199,255,0.20)',
                      }}
                    />
                    <span className="text-[11px] text-[#9b99a0]">人</span>
                  </div>
                ) : null}


                {/* Plan name */}
                <div className="relative">
                  <h4 className="font-display font-semibold text-[1.05rem] text-[#e7e5ea]">
                    {p.name}
                  </h4>
                </div>

                {/* Price + seat input */}
                <div className="mt-4 grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4 relative">
                  <div className="flex items-baseline gap-2 flex-wrap min-w-0">
                    <span className="font-display font-bold tracking-[-0.03em] text-[2rem] md:text-[2.4rem] leading-[0.95] fo-gradient-text">
                      {formatPrice(displayPrice)}
                    </span>
                    <span className="text-[#9b99a0] text-[12.5px] mb-0.5">
                      {isSeatPlan ? '/ 月' : p.priceUnit}
                    </span>
                    <span className="text-[10.5px] text-[#7e7c83] mb-0.5">税抜</span>
                    {!isSeatPlan && billing === 'annual' && p.monthly !== displayPrice && (
                      <span className="text-[11px] text-[#7e7c83] line-through mb-0.5 ml-1 tabular-nums">
                        {formatPrice(p.monthly)}
                      </span>
                    )}
                  </div>

                </div>

                {/* Agents + Credits — 2 行スタックでカード幅に依存しない構成 */}
                <div className="mt-4 space-y-2">
                  {/* Row 1: 5 エージェント */}
                  <div
                    className="inline-flex items-center gap-2 rounded-full pl-2 pr-3 py-1 transition-all duration-200"
                    style={
                      p.featured
                        ? {
                            background:
                              'linear-gradient(135deg, rgba(171,199,255,0.22), rgba(171,199,255,0.10))',
                            boxShadow:
                              'inset 0 0 0 1px rgba(171,199,255,0.50), 0 4px 14px -8px rgba(171,199,255,0.30)',
                          }
                        : {
                            background: 'rgba(171,199,255,0.06)',
                            boxShadow: 'inset 0 0 0 1px rgba(171,199,255,0.18)',
                          }
                    }
                  >
                    <span className="inline-flex items-center -space-x-1.5">
                      {(Object.keys(AGENTS) as AgentKey[]).map((k) => (
                        <Orb key={k} color={AGENTS[k].color} size={10} glow={0.6} />
                      ))}
                    </span>
                    <span
                      className="text-[11.5px] font-semibold leading-none whitespace-nowrap"
                      style={{ color: p.featured ? '#e7e5ea' : '#c7c5c9' }}
                    >
                      5 エージェント
                    </span>
                  </div>

                  {/* Row 2: クレジット (大きい数字 + 単位) */}
                  <div className="flex items-baseline gap-2">
                    <span className="font-display text-[20px] font-bold tabular-nums fo-gradient-text-soft leading-none">
                      {planCredits.toLocaleString()}
                    </span>
                    <span
                      className="text-[11px] leading-none whitespace-nowrap"
                      style={{ color: p.featured ? '#cfdcff' : '#9b99a0' }}
                    >
                      {p.creditUnitLabel}
                    </span>
                  </div>

                  {/* Row 3: AIナレッジ接続枠(Standard プランは取得不可のため数値を非表示) */}
                  <div className="flex items-baseline gap-2">
                    {!isSeatPlan && planDbRecords !== null && (
                      <span className="font-display text-[18px] font-bold tabular-nums fo-gradient-text-soft leading-none">
                        {planDbRecords.toLocaleString()}
                      </span>
                    )}
                    <span
                      className="text-[11px] leading-none whitespace-nowrap"
                      style={{ color: p.featured ? '#cfdcff' : '#9b99a0' }}
                    >
                      {p.dbLabel}
                    </span>
                  </div>
                </div>

                {/* CTA */}
                <ConsultationCallButton
                  className="mt-4 inline-flex items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-[13px] font-semibold transition-all duration-200 hover:-translate-y-0.5 w-full"
                  style={{
                    background: 'linear-gradient(135deg, #8fb0e8, #1e6fcc)',
                    color: '#0a0a0c',
                    boxShadow: '0 6px 18px -10px rgba(171,199,255,0.32)',
                  }}
                  source={`landing_pricing_crm_${p.id}`}
                  message={`${p.name}プランについて相談したいです。`}
                >
                  無料相談 <ArrowRight size={13} />
                </ConsultationCallButton>
              </div>
            </div>
          )
        })}
      </div>

      {/* ── 統合ボックス: 5エージェント全機能 + クレジット消費の目安 ── */}
      <div
        className="mt-6 rounded-2xl px-5 py-6 md:px-6 md:py-7"
        style={{
          background: 'rgba(171,199,255,0.04)',
          boxShadow: 'inset 0 0 0 1px rgba(171,199,255,0.10)',
        }}
      >
        {/* ─ 1. 両プラン共通 · 5 エージェント全機能 ─ */}
        <div className="text-[12px] mb-5">
          <span className="text-[#e7e5ea] font-semibold">両プラン共通</span>
          <span className="mx-2 text-[#7e7c83]">·</span>
          <span className="text-[#9b99a0]">5 エージェント全機能</span>
        </div>

        {/* Agents grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {agentFeats.map(({ key, items }) => {
            const a = AGENTS[key]
            return (
              <div
                key={key}
                className="rounded-xl px-3.5 py-3.5"
                style={{
                  background: `linear-gradient(180deg, ${a.color}10, transparent 70%)`,
                  boxShadow: `inset 0 0 0 1px ${a.color}24`,
                }}
              >
                <div className="flex items-center gap-2 mb-2.5">
                  <Orb color={a.color} size={11} glow={0.7} />
                  <span
                    className="text-[12.5px] font-semibold tracking-[0.01em]"
                    style={{ color: a.color }}
                  >
                    {a.name.replace(' Agent', '')}
                  </span>
                </div>
                <ul className="space-y-1.5">
                  {items.map((f) => (
                    <li
                      key={f}
                      className="flex items-start gap-1.5 text-[11.5px] leading-[1.45] text-[#c7c5c9]"
                    >
                      <Check
                        size={10}
                        strokeWidth={3}
                        className="shrink-0 mt-[3px]"
                        style={{ color: a.color, opacity: 0.85 }}
                      />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}
        </div>

        {/* 外部連携 */}
        <div className="mt-5 flex items-center gap-2.5 flex-wrap">
          <span className="text-[12px] font-semibold text-[#e7e5ea] shrink-0">
            外部連携
          </span>
          {['Gmail', 'Google Calendar', 'Notion 議事録'].map((s) => (
            <span
              key={s}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] text-[#c7c5c9]"
              style={{
                background: 'rgba(171,199,255,0.06)',
                boxShadow: 'inset 0 0 0 1px rgba(171,199,255,0.18)',
              }}
            >
              <span
                className="inline-block w-1.5 h-1.5 rounded-full"
                style={{ background: '#8dffc9', boxShadow: '0 0 6px #8dffc9aa' }}
              />
              {s}
            </span>
          ))}
          <span className="text-[10.5px] text-[#7e7c83]">
            その他カスタム連携は都度ご相談で対応可能
          </span>
        </div>

        {/* ─ section divider ─ */}
        <div
          className="my-7 h-px"
          style={{ background: 'rgba(171,199,255,0.10)' }}
        />

        {/* ─ 2. クレジット消費の目安 ─ */}
        {/* プラットフォーム機能行 (上) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-3 mb-5">
          <div className="flex items-baseline gap-2 text-[12px] min-w-0">
            <div className="min-w-0">
              <span className="text-[#e7e5ea] font-semibold">AIナレッジ基盤</span>
              <span className="mx-2 text-[#7e7c83]">·</span>
              <span className="text-[#9b99a0]">Obsidian・Notion・Driveを横断</span>
            </div>
          </div>
          <div className="flex items-baseline gap-2 text-[12px] min-w-0">
            <div className="min-w-0">
              <span className="text-[#e7e5ea] font-semibold">AI モデル選択</span>
              <span className="mx-2 text-[#7e7c83]">·</span>
              <span className="text-[#9b99a0]">Gemini 3 Flash Preview / GPT-5.5</span>
            </div>
          </div>
        </div>

        {/* ヘッダー (eyebrow行) — プラットフォーム機能とデータの中間に配置 / 2カラム対応 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-1 mb-3">
          <div className="flex items-baseline gap-2">
            <span className="text-[10.5px] uppercase tracking-[0.16em] text-[#9b99a0]">
              ナレッジ接続 目安
            </span>
            <span className="text-[10px] text-[#7e7c83]">
              ／ ドキュメント単位
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-[10.5px] uppercase tracking-[0.16em] text-[#9b99a0]">
              クレジット消費の目安
            </span>
            <span className="text-[10px] text-[#7e7c83]">
              ／ Gemini 換算
            </span>
          </div>
        </div>

        {/* データ行 (下) — 左: プラン別取得目安 / 右: 単価 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
          {/* LEFT: プラン別 月間取得目安 */}
          <div className="space-y-2">
            {[
              {
                name: 'Standard',
                cr: `${standardCredits.toLocaleString()} cr / 月`,
                estimate: '外部ナレッジ接続なし',
                accent: '#abc7ff',
              },
              { name: 'Growth', cr: '30,000 cr / 月', estimate: '議事録・資料・FAQを接続', accent: '#FFC107' },
            ].map((p) => (
              <div
                key={p.name}
                className="flex items-baseline justify-between gap-3 text-[12px]"
              >
                <span className="flex items-baseline gap-2 min-w-0">
                  <span
                    className="inline-block w-1.5 h-1.5 rounded-full shrink-0"
                    style={{
                      backgroundColor: p.accent,
                      boxShadow: `0 0 8px ${p.accent}88`,
                    }}
                  />
                  <span className="text-[#e7e5ea] font-semibold">{p.name}</span>
                  <span className="text-[10.5px] text-[#7e7c83] tabular-nums">
                    {p.cr}
                  </span>
                </span>
                <span className="font-mono text-aurora text-[11.5px] shrink-0">
                  {p.estimate}
                </span>
              </div>
            ))}
          </div>

          {/* RIGHT: 単価 */}
          <div className="space-y-2">
            {[
              { label: 'チャット 1 回答', cr: '1〜3 cr', sub: '' },
              { label: '議事録 1 件取込', cr: '5 cr', sub: '' },
            ].map((u) => (
              <div
                key={u.label}
                className="flex items-baseline justify-between gap-3 text-[12px]"
              >
                <span className="min-w-0">
                  <span className="text-[#e7e5ea] font-semibold">{u.label}</span>
                  <span className="ml-2 text-[10.5px] text-[#7e7c83]">{u.sub}</span>
                </span>
                <span className="font-display text-[14px] font-bold tabular-nums fo-gradient-text-soft shrink-0">
                  {u.cr}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 追加クレジット (1,000 cr 単位で指定購入) */}
        <div
          className="h-px mt-6 mb-3"
          style={{
            background:
              'linear-gradient(90deg, transparent 0%, rgba(171,199,255,0.18) 50%, transparent 100%)',
          }}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-2">
          <div className="flex items-baseline justify-between gap-3 text-[11.5px] opacity-90">
            <span className="flex items-baseline gap-2 min-w-0">
              <span className="font-bold text-aurora shrink-0 leading-none">+</span>
              <span className="text-[#c7c5c9]">追加クレジット</span>
              <span className="text-[10px] text-[#7e7c83]">1,000 cr 単位 ／ 指定購入</span>
            </span>
            <span className="font-mono text-aurora text-[11px] shrink-0 tabular-nums">
              1,000 cr ={' '}
              <span className="font-display text-[13px] font-bold fo-gradient-text-soft">
                ¥10,000
              </span>
            </span>
          </div>
        </div>

        {/* ─ 3. 既存ツールからの移行 ─ */}
        <div
          className="mt-5 pt-5 flex items-center gap-3.5"
          style={{ borderTop: '1px solid rgba(255,193,7,0.14)' }}
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
              </span>
              などからのデータ移行に対応。
              <span className="text-[#9b99a0]">
                データ構造整理 + 初期セットアップを承ります。
              </span>
            </p>
          </div>
          <ConsultationCallButton
            className="hidden md:inline-flex shrink-0 items-center gap-1.5 self-center rounded-lg px-3.5 py-1.5 text-[11.5px] font-medium whitespace-nowrap transition-colors"
            style={{
              background: 'linear-gradient(135deg, #FFD54F, #FFA000)',
              color: '#0a0a0c',
            }}
            source="landing_pricing_migration"
            message="CRMやスプレッドシートからのデータ移行について相談したいです。"
          >
            相談する <ArrowRight size={12} />
          </ConsultationCallButton>
        </div>

      </div>
    </div>
  )
}
