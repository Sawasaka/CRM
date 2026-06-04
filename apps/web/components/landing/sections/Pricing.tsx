'use client'

import { useState } from 'react'
import { Check, Sparkles, Crown, Zap, FileSpreadsheet, ArrowRight } from 'lucide-react'
import { AGENTS, type AgentKey, Eyebrow, Orb, Section } from '../atoms'

// サービス本体 (/subscription) の PLANS と完全同期する。
// 価格・クレジット・機能項目は app/(app)/subscription/page.tsx の PLANS が
// 単一の真実。変更時は両方を必ず揃える。
//
// LP戦略: 主軸は「営業実行支援パートナーシップ (5社限定・案件獲得)」。
// CRM 無償は「まず試したい層への入口」としてセクション後段に置く。

const SPIR_BOOKING_URL =
  'https://app.spirinc.com/t/3u_FXTG5abaFIZ-D7as8v/as/u1BDbJ3xnywQYp2rDZYxE/confirm'

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
    id: 'business-director',
    name: '事業責任者',
    price: 350000,
    slotsTotal: 1,
    slotsRemaining: 1,
    icon: Crown,
    // CxO の元カラー (silver / 中立) — featured は中央(IS設計)に譲り、ここは「別格の上位枠」を
    // 落ち着いた銀で表現する
    accentHex: '#E5E7EB',
    accentRgb: '229, 231, 235',
    scope: [
      '事業設計',
      'IS 設計',
      'FS / CS の営業実装',
    ],
    crm: [
      'CRM 構築',
      '部署番号含む 企業DB',
      '月30,000クレジット 込み',
    ],
    cadenceItems: [
      '1日1商談',
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
    featured: true,
    // Vivid gold (#FFC107) — featured 注目枠。事業責任者(銀)から gold を引き継ぐ
    accentHex: '#FFC107',
    accentRgb: '255, 193, 7',
    scope: [
      'IS チーム組成',
      'IS 設計',
      'IS マネジメント',
    ],
    crm: [
      'CRM 構築',
      '部署番号含む 企業DB',
      '月30,000クレジット 込み',
    ],
    cadenceItems: [
      '週1回の社内MTG',
      '平日 日中稼働',
      '3ヶ月契約・3ヶ月ごとに更新',
    ],
  },
  {
    // IS 設計の "もう少し簡単・楽なバージョン" — 営業範囲のみ差分
    // (戦略・設計・分析の knowledge layer 寄せ。組成 / マネジメントの実働は含まない)
    // Vivid emerald (#10B981) — IS 設計から引き継いだ緑系
    id: 'is-strategy',
    name: 'IS 戦略',
    price: 200000,
    slotsTotal: 3,
    slotsRemaining: 3,
    icon: Sparkles,
    accentHex: '#10B981',
    accentRgb: '16, 185, 129',
    scope: [
      'IS 戦略',
      'IS 設計',
      'IS 分析',
    ],
    crm: [
      'CRM 構築',
      '部署番号含む 企業DB',
      '月30,000クレジット 込み',
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
// 年間プランは月額から30%OFF。表示は月額換算。
interface SelfServePlan {
  id: 'standard' | 'plus'
  name: string
  credits: number // 月間クレジット (チーム合計)
  monthly: number // 月額プラン: 月額
  annualMonthly: number // 年間プラン: 月額換算 (= monthly × 0.7)
  maxSeats: number // 最大シート数
  featured?: boolean
  perks: string[] // 戦略MTG / サポート など
}

const selfServePlans: SelfServePlan[] = [
  {
    id: 'standard',
    name: 'Standard',
    credits: 10000,
    monthly: 41000,
    annualMonthly: 29000,
    maxSeats: 30,
    perks: ['Slack チャットサポート'],
  },
  {
    id: 'plus',
    name: 'Plus',
    credits: 30000,
    monthly: 78000, // 55,000 / 0.7 ≈ 78,571 → 78,000 に丸め
    annualMonthly: 55000,
    maxSeats: 100,
    featured: true,
    perks: ['Slack チャットサポート'],
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
            <span className="fo-gradient-text">CRMと部署番号が、無償。</span>
            <br />
            <span className="fo-gradient-text-soft">営業実行 × CRM構築</span>
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
                            background: `rgba(${rgb},0.22)`,
                            color: accent,
                            boxShadow: `inset 0 0 0 1px rgba(${rgb},0.55)`,
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

        {/* ── ③ SELF-SERVE: 2プラン × 年/月タブ ────────── */}
        <SelfServeBlock />
      </div>
    </Section>
  )
}

// ── セルフサーブ CRM 単独 2プラン (年間 / 月額タブ) ──────────────────────────────
function SelfServeBlock() {
  const [billing, setBilling] = useState<'annual' | 'monthly'>('annual')

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
            ルキスマCRM プラン
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
            CRM リリース準備中
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
                    約 30% OFF
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Plan cards */}
      <div className="grid md:grid-cols-2 gap-5">
        {selfServePlans.map((p) => {
          const displayPrice = billing === 'annual' ? p.annualMonthly : p.monthly
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
              <div className="rounded-[23px] bg-dusk fo-glass-rim relative overflow-hidden p-6 md:p-7 flex flex-col w-full">
                <div
                  className="absolute -top-24 -right-20 w-56 h-56 rounded-full pointer-events-none"
                  style={{
                    background: p.featured
                      ? 'radial-gradient(circle, rgba(171,199,255,0.22), transparent 60%)'
                      : 'radial-gradient(circle, rgba(171,199,255,0.10), transparent 60%)',
                    filter: 'blur(45px)',
                  }}
                />


                {/* Plan name */}
                <div className="relative">
                  <h4 className="font-display font-semibold text-[1.05rem] text-[#e7e5ea]">
                    {p.name}
                  </h4>
                </div>

                {/* Price */}
                <div className="mt-4 flex items-baseline gap-2 flex-wrap relative">
                  <span className="font-display font-bold tracking-[-0.03em] text-[2rem] md:text-[2.4rem] leading-[0.95] fo-gradient-text">
                    {formatPrice(displayPrice)}
                  </span>
                  <span className="text-[#9b99a0] text-[12.5px] mb-0.5">/ 月</span>
                  <span className="text-[10.5px] text-[#7e7c83] mb-0.5">税抜</span>
                  {billing === 'annual' && (
                    <span className="text-[11px] text-[#7e7c83] line-through mb-0.5 ml-1 tabular-nums">
                      {formatPrice(p.monthly)}
                    </span>
                  )}
                </div>

                {/* Agents + Credits chip */}
                <div className="mt-5 flex items-center gap-2 flex-wrap">
                  <span
                    className="inline-flex items-center gap-2.5 rounded-full pl-2.5 pr-4 py-1.5 transition-all duration-200 hover:-translate-y-[1px]"
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
                    {/* 5 agent orbs */}
                    <span className="inline-flex items-center -space-x-1.5">
                      {(Object.keys(AGENTS) as AgentKey[]).map((k) => (
                        <Orb key={k} color={AGENTS[k].color} size={11} glow={0.6} />
                      ))}
                    </span>
                    <span
                      className="text-[11.5px] font-semibold leading-none"
                      style={{ color: p.featured ? '#e7e5ea' : '#c7c5c9' }}
                    >
                      5 エージェント
                    </span>
                    <span
                      className="text-[10.5px] leading-none"
                      style={{ color: '#7e7c83' }}
                    >
                      ・
                    </span>
                    <span className="font-display text-[15.5px] font-bold tabular-nums fo-gradient-text-soft leading-none">
                      {p.credits.toLocaleString()}
                    </span>
                    <span
                      className="text-[11px] leading-none"
                      style={{ color: p.featured ? '#cfdcff' : '#9b99a0' }}
                    >
                      チームクレジット
                    </span>
                  </span>
                </div>

                {/* Perks (戦略 MTG / サポート) */}
                <ul className="mt-4 space-y-1.5">
                  {p.perks.map((perk) => (
                    <li
                      key={perk}
                      className="flex items-center gap-2 text-[12px] leading-snug"
                      style={{ color: p.featured ? '#cfdcff' : '#c7c5c9' }}
                    >
                      <Check
                        size={12}
                        strokeWidth={2.6}
                        style={{ color: p.featured ? '#abc7ff' : '#9b99a0' }}
                      />
                      {perk}
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <a
                  href={SPIR_BOOKING_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 inline-flex items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-[13px] font-semibold transition-all duration-200 hover:-translate-y-0.5 w-full"
                  style={{
                    background: 'linear-gradient(135deg, #8fb0e8, #1e6fcc)',
                    color: '#0a0a0c',
                    boxShadow: '0 6px 18px -10px rgba(171,199,255,0.32)',
                  }}
                >
                  無料相談 <ArrowRight size={13} />
                </a>
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
              <span className="text-[#e7e5ea] font-semibold">企業データベース</span>
              <span className="mx-2 text-[#7e7c83]">·</span>
              <span className="text-[#9b99a0]">部署番号 + 採用動向 + 採用予算</span>
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
              企業データ取得 目安
            </span>
            <span className="text-[10px] text-[#7e7c83]">
              ／ 1 件 = 20 cr
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-[10.5px] uppercase tracking-[0.16em] text-[#9b99a0]">
              クレジット消費の目安
            </span>
            <span className="text-[10px] text-[#7e7c83]">
              ／ 1 cr ≈ ¥2.9
            </span>
          </div>
        </div>

        {/* データ行 (下) — 左: プラン別取得目安 / 右: 単価 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
          {/* LEFT: プラン別 月間取得目安 */}
          <div className="space-y-2">
            {[
              { name: 'Standard', cr: '10,000', count: '500', accent: '#abc7ff' },
              { name: 'Plus', cr: '30,000', count: '1,500', accent: '#FFC107' },
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
                    {p.cr} cr / 月
                  </span>
                </span>
                <span className="font-mono text-aurora text-[11.5px] shrink-0">
                  ≒ 企業{' '}
                  <span className="font-display text-[14px] font-bold fo-gradient-text tabular-nums">
                    {p.count}
                  </span>{' '}
                  件
                </span>
              </div>
            ))}

            {/* 追加クレジット (1,000 cr 単位で指定購入) */}
            <div
              className="h-px mt-10 mb-3"
              style={{
                background:
                  'linear-gradient(90deg, transparent 0%, rgba(171,199,255,0.18) 50%, transparent 100%)',
              }}
            />
            <div className="flex items-baseline justify-between gap-3 text-[11.5px] opacity-90">
              <span className="flex items-baseline gap-2 min-w-0">
                <span className="font-bold text-aurora shrink-0 leading-none">+</span>
                <span className="text-[#c7c5c9]">追加クレジット</span>
                <span className="text-[10px] text-[#7e7c83]">1,000 cr 単位 ／ 指定購入</span>
              </span>
              <span className="font-mono text-aurora text-[11px] shrink-0 tabular-nums">
                1,000 cr ={' '}
                <span className="font-display text-[13px] font-bold fo-gradient-text-soft">
                  ¥5,000
                </span>
              </span>
            </div>
          </div>

          {/* RIGHT: 単価 */}
          <div className="space-y-2">
            {[
              { label: '議事録 1 件取込', cr: '5 cr', sub: 'Meet / Notion から' },
              { label: 'チャット 1 回答', cr: '1〜3 cr', sub: '質問の深さで変動' },
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
  )
}
