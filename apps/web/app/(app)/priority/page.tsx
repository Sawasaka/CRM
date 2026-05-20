'use client'

/**
 * 開発優先度 (Development Priority)
 *
 * 議事録 (Google Meet 自動生成) から AI が抽出した「要望機能 / ニーズ / 課題」を
 * 言及企業数 (ユニーク) で並べる、事実ベースの優先度ボード。
 *
 * - 工数・インパクト・スコアは扱わない (現場で主観評価できないため撤去)
 * - 並び替え基準は "言及企業数の降順" のみ
 * - 各クラスターを展開すると、エビデンス (企業名 / 商談日 / 引用 / 議事録Docsリンク) が見られる
 */

import { useMemo, useState } from 'react'
import Link from 'next/link'
import {
  ChevronDown,
  Sparkles,
  Lightbulb,
  AlertTriangle,
  FileText,
  Building2,
  CalendarDays,
  Check,
  RotateCcw,
  LifeBuoy,
  Ticket,
} from 'lucide-react'
import {
  ObsPageShell,
  ObsHero,
  ObsCard,
} from '@/components/obsidian'

// ─── Types ────────────────────────────────────────────────────────────────────

export type PriorityCategory = '要望機能' | 'ニーズ' | '課題' | '問題'

export interface PriorityEvidence {
  companyId: string
  companyName: string
  /** ISO date (YYYY-MM-DD) */
  meetingDate: string
  /** 議事録 / 問い合わせチケットから AI が拾った引用テキスト */
  quote: string
  /** 議事録ドキュメント (Google Docs) または 問い合わせチケットへのリンク */
  meetingDocUrl: string
  /** 'meeting' = 議事録 / 'ticket' = 問い合わせチケット (リンクラベル切替に使用) */
  sourceType?: 'meeting' | 'ticket'
}

export interface PriorityItem {
  id: string
  category: PriorityCategory
  /** AI がまとめた見出し (例: "カスタムレポートの柔軟性") */
  title: string
  evidence: PriorityEvidence[]
}

// ─── Category Meta ────────────────────────────────────────────────────────────

const CATEGORY_META: Record<PriorityCategory, {
  Icon: React.ElementType
  iconColor: string
  /** グラフバー専用のダークトーン色 (落ち着いた印象に) */
  barColor: string
  bg: string
  ring: string
  label: string
  caption: string
}> = {
  要望機能: {
    Icon: Sparkles,
    iconColor: '#abc7ff',
    barColor: '#3a5378',
    bg: 'rgba(171,199,255,0.10)',
    ring: 'rgba(171,199,255,0.28)',
    label: '要望機能',
    caption: '「こういう機能がほしい」と直接言われたもの',
  },
  ニーズ: {
    Icon: Lightbulb,
    iconColor: '#ffb86b',
    barColor: '#7a5530',
    bg: 'rgba(255,184,107,0.10)',
    ring: 'rgba(255,184,107,0.28)',
    label: 'ニーズ',
    caption: '「こうなったら嬉しい / こうしたい」という潜在的な期待',
  },
  課題: {
    Icon: AlertTriangle,
    iconColor: '#ff6b6b',
    barColor: '#7a3838',
    bg: 'rgba(255,107,107,0.10)',
    ring: 'rgba(255,107,107,0.28)',
    label: '課題',
    caption: '「今これが困っている」と語られた現場の痛み',
  },
  問題: {
    Icon: LifeBuoy,
    iconColor: '#c8b9ff',
    barColor: '#544781',
    bg: 'rgba(200,185,255,0.10)',
    ring: 'rgba(200,185,255,0.28)',
    label: '問題',
    caption: '問い合わせチケットから集計したインシデント・障害の傾向',
  },
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

export const MOCK_PRIORITY_ITEMS: PriorityItem[] = [
  // ── 要望機能 ────────────────────────────────────────────────────────────────
  {
    id: 'f-1',
    category: '要望機能',
    title: 'カスタムレポートの柔軟性',
    evidence: [
      {
        companyId: 'c-1',
        companyName: '株式会社テクノリード',
        meetingDate: '2026-03-28',
        quote: '現場の SR が自由にレポートを組めないと、結局 Excel に書き出すことになる。レイアウトを保存できる形がほしい。',
        meetingDocUrl: 'https://docs.google.com/document/d/mtg-techno-lead-2026-03-28',
      },
      {
        companyId: 'c-4',
        companyName: '株式会社グロース',
        meetingDate: '2026-04-02',
        quote: '週次の数値報告に毎回 30 分かかっている。経営会議用の独自レイアウトをそのまま吐き出したい。',
        meetingDocUrl: 'https://docs.google.com/document/d/mtg-growth-2026-04-02',
      },
      {
        companyId: 'c-2',
        companyName: '合同会社フューチャー',
        meetingDate: '2026-03-30',
        quote: '事業部ごとに見たい指標が違う。役員報告と現場ダッシュボードは別のテンプレートで管理したい。',
        meetingDocUrl: 'https://docs.google.com/document/d/mtg-future-2026-03-30',
      },
    ],
  },
  {
    id: 'f-2',
    category: '要望機能',
    title: '既存ツールとのデータ連携',
    evidence: [
      {
        companyId: 'c-1',
        companyName: '株式会社テクノリード',
        meetingDate: '2026-03-28',
        quote: 'Salesforce からの移行を考えているが、過去案件のステータス履歴を一括で取り込めるかが懸念。',
        meetingDocUrl: 'https://docs.google.com/document/d/mtg-techno-lead-2026-03-28',
      },
      {
        companyId: 'c-3',
        companyName: '株式会社イノベーション',
        meetingDate: '2026-03-19',
        quote: 'Slack に商談更新が流れてこないと、現場が見に来ない。双方向連携を前提にしたい。',
        meetingDocUrl: 'https://docs.google.com/document/d/mtg-innov-2026-03-19',
      },
      {
        companyId: 'c-4',
        companyName: '株式会社グロース',
        meetingDate: '2026-04-02',
        quote: 'Google Workspace との同期が必須。カレンダー連動で商談を自動取り込みしてほしい。',
        meetingDocUrl: 'https://docs.google.com/document/d/mtg-growth-2026-04-02',
      },
      {
        companyId: 'c-5',
        companyName: '有限会社サクセス',
        meetingDate: '2026-04-08',
        quote: '請求まわりの freee 連携がないと、結局二重入力になる。',
        meetingDocUrl: 'https://docs.google.com/document/d/mtg-success-2026-04-08',
      },
    ],
  },
  {
    id: 'f-3',
    category: '要望機能',
    title: 'モバイルでの入力体験',
    evidence: [
      {
        companyId: 'c-1',
        companyName: '株式会社テクノリード',
        meetingDate: '2026-03-28',
        quote: '営業は外出が多いので、商談直後にスマホからメモをサッと入れられないと続かない。',
        meetingDocUrl: 'https://docs.google.com/document/d/mtg-techno-lead-2026-03-28',
      },
      {
        companyId: 'c-2',
        companyName: '合同会社フューチャー',
        meetingDate: '2026-03-30',
        quote: 'iPad での入力が遅いとのフィードバックを社内から多数受けている。',
        meetingDocUrl: 'https://docs.google.com/document/d/mtg-future-2026-03-30',
      },
    ],
  },
  {
    id: 'f-4',
    category: '要望機能',
    title: '権限管理 (SSO / SAML)',
    evidence: [
      {
        companyId: 'c-4',
        companyName: '株式会社グロース',
        meetingDate: '2026-04-02',
        quote: '情シスの要件で SAML 必須。Okta 連携が前提条件。',
        meetingDocUrl: 'https://docs.google.com/document/d/mtg-growth-2026-04-02',
      },
      {
        companyId: 'c-3',
        companyName: '株式会社イノベーション',
        meetingDate: '2026-03-19',
        quote: 'Azure AD でのシングルサインオンが組織標準。これがないと全社展開できない。',
        meetingDocUrl: 'https://docs.google.com/document/d/mtg-innov-2026-03-19',
      },
    ],
  },

  // ── ニーズ ──────────────────────────────────────────────────────────────────
  {
    id: 'n-1',
    category: 'ニーズ',
    title: '商談直後の振り返りを自動化したい',
    evidence: [
      {
        companyId: 'c-1',
        companyName: '株式会社テクノリード',
        meetingDate: '2026-03-28',
        quote: '商談が終わってから議事録を書く時間がない。録画から自動で要点だけ抜けたら助かる。',
        meetingDocUrl: 'https://docs.google.com/document/d/mtg-techno-lead-2026-03-28',
      },
      {
        companyId: 'c-2',
        companyName: '合同会社フューチャー',
        meetingDate: '2026-03-30',
        quote: '若手の議事録の質がバラつくので、AI で一定品質に揃えたい。',
        meetingDocUrl: 'https://docs.google.com/document/d/mtg-future-2026-03-30',
      },
      {
        companyId: 'c-5',
        companyName: '有限会社サクセス',
        meetingDate: '2026-04-08',
        quote: '次のアクションだけ自動で抽出できれば、CRM に手で書き戻さなくて済む。',
        meetingDocUrl: 'https://docs.google.com/document/d/mtg-success-2026-04-08',
      },
    ],
  },
  {
    id: 'n-2',
    category: 'ニーズ',
    title: 'KPI を経営会議でそのまま使える形にしたい',
    evidence: [
      {
        companyId: 'c-4',
        companyName: '株式会社グロース',
        meetingDate: '2026-04-02',
        quote: '取締役会の前日に毎回スライドに貼り直している。CRM の数字をそのままレポートに出したい。',
        meetingDocUrl: 'https://docs.google.com/document/d/mtg-growth-2026-04-02',
      },
      {
        companyId: 'c-2',
        companyName: '合同会社フューチャー',
        meetingDate: '2026-03-30',
        quote: '事業部別の MRR と継続率を一画面で経営層に見せたい。',
        meetingDocUrl: 'https://docs.google.com/document/d/mtg-future-2026-03-30',
      },
    ],
  },
  {
    id: 'n-3',
    category: 'ニーズ',
    title: 'インテントスコアで優先順位を判断したい',
    evidence: [
      {
        companyId: 'c-3',
        companyName: '株式会社イノベーション',
        meetingDate: '2026-03-19',
        quote: '架電リストを Hot/Cold で振り分けたい。今は鈴木の勘でやっている。',
        meetingDocUrl: 'https://docs.google.com/document/d/mtg-innov-2026-03-19',
      },
      {
        companyId: 'c-1',
        companyName: '株式会社テクノリード',
        meetingDate: '2026-03-28',
        quote: '採用シグナルとサイト来訪を組み合わせて、攻める順番を決められると効率が変わる。',
        meetingDocUrl: 'https://docs.google.com/document/d/mtg-techno-lead-2026-03-28',
      },
    ],
  },

  // ── 課題 ────────────────────────────────────────────────────────────────────
  {
    id: 'p-1',
    category: '課題',
    title: 'データ入力が手動でつらい',
    evidence: [
      {
        companyId: 'c-1',
        companyName: '株式会社テクノリード',
        meetingDate: '2026-03-28',
        quote: '営業が CRM を触らない最大の理由は入力工数。3 分以上かかると確実に書かなくなる。',
        meetingDocUrl: 'https://docs.google.com/document/d/mtg-techno-lead-2026-03-28',
      },
      {
        companyId: 'c-3',
        companyName: '株式会社イノベーション',
        meetingDate: '2026-03-19',
        quote: '商談 1 件あたり 5 〜 10 分の手入力。月末の数字合わせに毎回 1 日かかる。',
        meetingDocUrl: 'https://docs.google.com/document/d/mtg-innov-2026-03-19',
      },
      {
        companyId: 'c-5',
        companyName: '有限会社サクセス',
        meetingDate: '2026-04-08',
        quote: 'Excel ・スプレッドシート・CRM の三重管理になっており、どれが正なのか分からない。',
        meetingDocUrl: 'https://docs.google.com/document/d/mtg-success-2026-04-08',
      },
      {
        companyId: 'c-4',
        companyName: '株式会社グロース',
        meetingDate: '2026-04-02',
        quote: 'メールに記載された次回日程を、また CRM に書き写すのが二度手間。',
        meetingDocUrl: 'https://docs.google.com/document/d/mtg-growth-2026-04-02',
      },
    ],
  },
  {
    id: 'p-2',
    category: '課題',
    title: 'パイプラインの停滞案件に気づけない',
    evidence: [
      {
        companyId: 'c-2',
        companyName: '合同会社フューチャー',
        meetingDate: '2026-03-30',
        quote: '2 週間動いていない案件があとから発覚することが多い。アラートが欲しい。',
        meetingDocUrl: 'https://docs.google.com/document/d/mtg-future-2026-03-30',
      },
      {
        companyId: 'c-4',
        companyName: '株式会社グロース',
        meetingDate: '2026-04-02',
        quote: '定例で確認しないと放置される案件がある。仕組みで拾いたい。',
        meetingDocUrl: 'https://docs.google.com/document/d/mtg-growth-2026-04-02',
      },
      {
        companyId: 'c-1',
        companyName: '株式会社テクノリード',
        meetingDate: '2026-03-28',
        quote: '担当者が休みのとき、その人の案件が進まないまま温度が下がる。',
        meetingDocUrl: 'https://docs.google.com/document/d/mtg-techno-lead-2026-03-28',
      },
    ],
  },
  {
    id: 'p-3',
    category: '課題',
    title: '導入後のオンボーディングで脱落する',
    evidence: [
      {
        companyId: 'c-5',
        companyName: '有限会社サクセス',
        meetingDate: '2026-04-08',
        quote: '前回の SaaS は導入したのに半年で誰も使わなくなった。乗り換え判断がしんどい。',
        meetingDocUrl: 'https://docs.google.com/document/d/mtg-success-2026-04-08',
      },
      {
        companyId: 'c-3',
        companyName: '株式会社イノベーション',
        meetingDate: '2026-03-19',
        quote: '初期設定がベンダー任せになっていて、社内に運用ノウハウが残らない。',
        meetingDocUrl: 'https://docs.google.com/document/d/mtg-innov-2026-03-19',
      },
    ],
  },

  // ── 問題 (問い合わせチケットからの集計) ───────────────────────────────────
  {
    id: 'i-1',
    category: '問題',
    title: 'メール送信時にエラーが発生する',
    evidence: [
      {
        companyId: 'c-1',
        companyName: '株式会社テクノリード',
        meetingDate: '2026-04-22',
        quote: 'ステップメール配信のジョブが 3 回連続で失敗。SMTP のレート制限に引っかかった様子。',
        meetingDocUrl: '/tickets/t-1',
        sourceType: 'ticket',
      },
      {
        companyId: 'c-4',
        companyName: '株式会社グロース',
        meetingDate: '2026-04-18',
        quote: '一括配信を実行したら半分のメールが配信されず、再送ボタンも反応しなくなった。',
        meetingDocUrl: '/tickets/t-2',
        sourceType: 'ticket',
      },
      {
        companyId: 'c-3',
        companyName: '株式会社イノベーション',
        meetingDate: '2026-04-12',
        quote: '差し込み変数 (会社名) が空欄のままお客様に送信されてしまった。',
        meetingDocUrl: '/tickets/t-3',
        sourceType: 'ticket',
      },
    ],
  },
  {
    id: 'i-2',
    category: '問題',
    title: 'ダッシュボードの読み込みが遅い',
    evidence: [
      {
        companyId: 'c-4',
        companyName: '株式会社グロース',
        meetingDate: '2026-04-25',
        quote: '朝イチで開くと 30 秒以上待たされる。データ量が多い顧客で顕著らしい。',
        meetingDocUrl: '/tickets/t-4',
        sourceType: 'ticket',
      },
      {
        companyId: 'c-2',
        companyName: '合同会社フューチャー',
        meetingDate: '2026-04-15',
        quote: 'パイプラインのカンバンを開くと 10 秒ほど真っ白。タイムアウトも時々起きる。',
        meetingDocUrl: '/tickets/t-5',
        sourceType: 'ticket',
      },
    ],
  },
  {
    id: 'i-3',
    category: '問題',
    title: 'Slack 通知が届かない',
    evidence: [
      {
        companyId: 'c-1',
        companyName: '株式会社テクノリード',
        meetingDate: '2026-04-20',
        quote: '商談ステージ更新時の Slack 通知が、特定チャンネルだけ届かない。',
        meetingDocUrl: '/tickets/t-6',
        sourceType: 'ticket',
      },
      {
        companyId: 'c-5',
        companyName: '有限会社サクセス',
        meetingDate: '2026-04-10',
        quote: '担当者アサイン時のメンション通知が翌日にまとめて届く。',
        meetingDocUrl: '/tickets/t-7',
        sourceType: 'ticket',
      },
    ],
  },
  {
    id: 'i-4',
    category: '問題',
    title: 'CSV インポート時に文字化け',
    evidence: [
      {
        companyId: 'c-3',
        companyName: '株式会社イノベーション',
        meetingDate: '2026-04-05',
        quote: 'Shift-JIS で書き出した CSV を取り込むと半角カナだけ文字化けする。',
        meetingDocUrl: '/tickets/t-8',
        sourceType: 'ticket',
      },
    ],
  },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function uniqueCompanyCount(item: PriorityItem): number {
  return new Set(item.evidence.map((e) => e.companyId)).size
}

function formatMeetingDate(iso: string): string {
  const d = new Date(iso)
  return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`
}

const ALL_CATEGORIES: PriorityCategory[] = ['要望機能', 'ニーズ', '課題', '問題']

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DevelopmentPriorityPage() {
  // 項目ごとの完了状態 (id -> true で「対応済み」)
  const [completed, setCompleted] = useState<Record<string, boolean>>({})
  const toggleCompleted = (id: string) =>
    setCompleted((prev) => ({ ...prev, [id]: !prev[id] }))

  // 詳細を展開している項目 ID のセット (グラフのバークリック / 行の▼両方から制御)
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())
  const toggleExpanded = (id: string) =>
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  // バークリック時: 展開 + 該当行へスムーススクロール
  const handleBarClick = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      next.add(id)
      return next
    })
    // 次の paint で row が展開されてからスクロール
    requestAnimationFrame(() => {
      const el = document.getElementById(`priority-row-${id}`)
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    })
  }

  // カテゴリごとに「言及企業数 降順」でソート
  const itemsByCategory = useMemo(() => {
    const out: Record<PriorityCategory, PriorityItem[]> = {
      要望機能: [],
      ニーズ: [],
      課題: [],
      問題: [],
    }
    for (const it of MOCK_PRIORITY_ITEMS) out[it.category].push(it)
    for (const cat of ALL_CATEGORIES) {
      out[cat].sort((a, b) => uniqueCompanyCount(b) - uniqueCompanyCount(a))
    }
    return out
  }, [])

  // 議事録総数 / 言及企業総数
  const overall = useMemo(() => {
    const docs = new Set<string>()
    const companies = new Set<string>()
    for (const it of MOCK_PRIORITY_ITEMS) {
      for (const ev of it.evidence) {
        docs.add(ev.meetingDocUrl)
        companies.add(ev.companyId)
      }
    }
    return {
      totalDocs: docs.size,
      totalCompanies: companies.size,
    }
  }, [])

  return (
    <ObsPageShell>
      <div className="w-full px-8 xl:px-12 2xl:px-16 pb-24">
        <ObsHero
          eyebrow="Development Priority"
          title="開発優先度"
          caption={`議事録 ${overall.totalDocs} 件 / ${overall.totalCompanies} 社の発言から自動抽出。クリックで議事録の引用とリンクが見られます。`}
        />

        {/* ── 3カテゴリ並列セクション (タブ無し・全件まとめて閲覧) ──────── */}
        <div className="mt-8 space-y-10">
          {ALL_CATEGORIES.map((cat) => {
            const meta = CATEGORY_META[cat]
            const Icon = meta.Icon
            const allItems = itemsByCategory[cat]
            const activeItems = allItems.filter((it) => !completed[it.id])
            const doneItems = allItems.filter((it) => completed[it.id])
            // バー長の正規化用: カテゴリ全体での最大言及社数
            const maxCount = Math.max(
              1,
              ...allItems.map((it) => uniqueCompanyCount(it)),
            )
            return (
              <section key={cat}>
                {/* セクション見出し */}
                <div className="flex items-center gap-2.5 mb-3">
                  <span
                    className="inline-flex items-center justify-center w-7 h-7 rounded-full"
                    style={{
                      backgroundColor: meta.bg,
                      boxShadow: `inset 0 0 0 1px ${meta.ring}`,
                    }}
                  >
                    <Icon size={13} style={{ color: meta.iconColor }} />
                  </span>
                  <h2
                    className="text-[16px] font-semibold tracking-[-0.01em]"
                    style={{ color: 'var(--color-obs-text)' }}
                  >
                    {meta.label}
                  </h2>
                  <span
                    className="inline-flex items-center justify-center min-w-[22px] h-[20px] px-1.5 rounded-full text-[11px] font-semibold tabular-nums"
                    style={{
                      backgroundColor: meta.bg,
                      color: meta.iconColor,
                      boxShadow: `inset 0 0 0 1px ${meta.ring}`,
                    }}
                  >
                    {activeItems.length}
                  </span>
                  {doneItems.length > 0 && (
                    <span
                      className="inline-flex items-center gap-1 h-5 px-1.5 rounded-full text-[10.5px] font-semibold tabular-nums"
                      style={{
                        backgroundColor: 'rgba(110,231,161,0.12)',
                        color: '#6ee7a1',
                        boxShadow: 'inset 0 0 0 1px rgba(110,231,161,0.28)',
                      }}
                      title="完了済み"
                    >
                      <Check size={9} strokeWidth={3} />
                      {doneItems.length}
                    </span>
                  )}
                  <p
                    className="ml-2 text-[11.5px]"
                    style={{ color: 'var(--color-obs-text-subtle)' }}
                  >
                    {meta.caption}
                  </p>
                </div>

                {/* 縦棒グラフ — 言及社数の比較。バークリックで該当行を展開＋スクロール */}
                {activeItems.length > 0 && (
                  <div className="mb-4">
                    <CategoryBarChart
                      items={activeItems}
                      maxCount={maxCount}
                      iconColor={meta.iconColor}
                      barColor={meta.barColor}
                      ring={meta.ring}
                      onBarClick={handleBarClick}
                    />
                  </div>
                )}

                {/* 対応中リスト */}
                <ObsCard depth="high" padding="none" radius="xl">
                  {/* テーブルヘッダー */}
                  <div
                    className="grid items-center px-5 py-3 text-[10.5px] font-medium tracking-[0.12em] uppercase gap-3"
                    style={{
                      gridTemplateColumns: '36px 1fr 90px 80px 32px',
                      color: 'var(--color-obs-text-subtle)',
                      backgroundColor: 'var(--color-obs-surface-low)',
                    }}
                  >
                    <span>#</span>
                    <span>{meta.label}</span>
                    <span className="text-right">言及社数</span>
                    <span className="text-right">アクション</span>
                    <span></span>
                  </div>

                  {activeItems.length === 0 ? (
                    <div
                      className="px-5 py-12 text-center text-[13px]"
                      style={{ color: 'var(--color-obs-text-subtle)' }}
                    >
                      対応中の{meta.label}はありません
                    </div>
                  ) : (
                    activeItems.map((item, i) => (
                      <PriorityRow
                        key={item.id}
                        item={item}
                        rank={i + 1}
                        completed={false}
                        onToggleComplete={() => toggleCompleted(item.id)}
                        isOpen={expandedIds.has(item.id)}
                        onToggleOpen={() => toggleExpanded(item.id)}
                      />
                    ))
                  )}
                </ObsCard>

                {/* 完了済みリスト (折りたたみセクション) */}
                {doneItems.length > 0 && (
                  <CompletedSection
                    items={doneItems}
                    onRestore={(id) => toggleCompleted(id)}
                  />
                )}
              </section>
            )
          })}
        </div>
      </div>
    </ObsPageShell>
  )
}

// ─── 縦棒グラフ ────────────────────────────────────────────────────────────────
//
// 各カテゴリ内の項目を縦棒グラフで可視化。
// 横並びで「どれが多くて、どれが少ないか」を一目で比較できる。

function CategoryBarChart({
  items,
  maxCount,
  iconColor,
  barColor,
  ring,
  onBarClick,
}: {
  items: PriorityItem[]
  maxCount: number
  iconColor: string
  barColor: string
  ring: string
  onBarClick?: (id: string) => void
}) {
  // Y 軸の目盛り (0 から maxCount まで等間隔で整数本)
  const yTicks = useMemo(() => {
    const ticks: number[] = []
    const top = Math.max(1, maxCount)
    for (let i = top; i >= 0; i--) ticks.push(i)
    return ticks
  }, [maxCount])

  // バー領域とラベル領域を完全に分離するため、固定px で配分
  const PLOT_HEIGHT = 180 // バーが伸びる領域
  const LABEL_HEIGHT = 36 // X軸ラベル領域

  return (
    <ObsCard depth="high" padding="lg" radius="xl">
      <div className="flex gap-3">
        {/* Y 軸 (社数の目盛り) — プロット領域とぴったり同じ高さで配置 */}
        <div
          className="flex flex-col justify-between text-[10px] tabular-nums shrink-0 pr-1 text-right"
          style={{
            color: 'var(--color-obs-text-subtle)',
            height: PLOT_HEIGHT,
            minWidth: 18,
          }}
        >
          {yTicks.map((v) => (
            <span key={v} className="leading-none">
              {v}
            </span>
          ))}
        </div>

        {/* グラフ本体 (プロット + ラベル) */}
        <div className="relative flex-1">
          {/* プロット領域 (バー + グリッド) */}
          <div className="relative" style={{ height: PLOT_HEIGHT }}>
            {/* Y 軸グリッド線 */}
            <div className="absolute inset-0 pointer-events-none">
              {yTicks.map((_, i) => {
                const top = (i / (yTicks.length - 1)) * 100
                const isBaseline = i === yTicks.length - 1
                return (
                  <span
                    key={i}
                    className="absolute left-0 right-0 h-px"
                    style={{
                      top: `${top}%`,
                      backgroundColor: isBaseline
                        ? 'rgba(255,255,255,0.10)'
                        : 'rgba(255,255,255,0.05)',
                    }}
                  />
                )
              })}
            </div>

            {/* バー (item ごと) */}
            <div className="relative flex items-end justify-around gap-2 h-full">
              {items.map((it) => (
                <ChartBar
                  key={it.id}
                  item={it}
                  maxCount={maxCount}
                  iconColor={iconColor}
                  barColor={barColor}
                  ring={ring}
                  plotHeight={PLOT_HEIGHT}
                  onClick={onBarClick ? () => onBarClick(it.id) : undefined}
                />
              ))}
            </div>
          </div>

          {/* X 軸ラベル領域 — プロット領域と完全に分離してテキスト被り解消 */}
          <div
            className="flex justify-around gap-2 pt-2"
            style={{ height: LABEL_HEIGHT }}
          >
            {items.map((it) => (
              <div
                key={it.id}
                className="flex-1 min-w-0 text-center px-0.5"
              >
                <p
                  className="text-[11px] leading-snug font-medium line-clamp-2"
                  style={{ color: 'var(--color-obs-text-muted)' }}
                  title={it.title}
                >
                  {it.title}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ObsCard>
  )
}

// 1 本の縦棒 + ホバーで言及企業一覧をポップオーバー表示
// クリックで該当行を展開＋スクロールする (onClick が指定された場合)
function ChartBar({
  item,
  maxCount,
  iconColor,
  barColor,
  ring,
  plotHeight,
  onClick,
}: {
  item: PriorityItem
  maxCount: number
  iconColor: string
  barColor: string
  ring: string
  plotHeight: number
  onClick?: () => void
}) {
  const [hover, setHover] = useState(false)
  const c = uniqueCompanyCount(item)
  const heightPercent = (c / Math.max(1, maxCount)) * 100
  // バー高さ = プロット領域に対する割合 - 数値ラベルの高さ余白
  const NUM_LABEL_HEIGHT = 18
  const barHeightPx = Math.max(
    2,
    ((plotHeight - NUM_LABEL_HEIGHT) * heightPercent) / 100,
  )
  // ユニークな企業名リスト (出現順を維持)
  const companies = useMemo(() => {
    const seen = new Set<string>()
    const list: string[] = []
    for (const e of item.evidence) {
      if (!seen.has(e.companyId)) {
        seen.add(e.companyId)
        list.push(e.companyName)
      }
    }
    return list
  }, [item.evidence])

  return (
    <div
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : -1}
      onClick={onClick}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onClick()
              }
            }
          : undefined
      }
      aria-label={onClick ? `${item.title} の詳細を見る` : undefined}
      title={onClick ? 'クリックで詳細を表示' : undefined}
      className={`relative flex-1 flex flex-col items-center justify-end min-w-0 h-full ${
        onClick ? 'cursor-pointer' : ''
      }`}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {/* 数値 (バー上に表示) — hover時に矢印を添えて「クリックで詳細」を示唆 */}
      <span
        className="inline-flex items-center gap-0.5 text-[11.5px] font-bold tabular-nums mb-1 transition-transform duration-150"
        style={{
          color: iconColor,
          transform: hover ? 'translateY(-2px)' : 'translateY(0)',
        }}
      >
        {c}
        {onClick && (
          <ChevronDown
            size={10}
            strokeWidth={2.6}
            style={{
              opacity: hover ? 1 : 0,
              transform: hover ? 'translateY(0)' : 'translateY(-2px)',
              transition: 'opacity 150ms var(--ease-liquid), transform 150ms var(--ease-liquid)',
              marginLeft: 1,
            }}
            aria-hidden
          />
        )}
      </span>
      {/* バー — ダークトーンで落ち着いた印象 / hover時にリングが出てクリック可能感を強める */}
      <div className="relative w-full flex justify-center">
        <div
          className="w-full max-w-[48px] rounded-t-[5px] transition-all duration-300"
          style={{
            height: `${barHeightPx}px`,
            // 上を少し明るく / 下に向かって暗く落とすダークグラデーション
            background: `linear-gradient(180deg, ${barColor} 0%, ${barColor}cc 100%)`,
            boxShadow: hover
              ? `inset 0 1px 0 rgba(255,255,255,0.18), 0 0 0 2px ${ring}`
              : `inset 0 1px 0 rgba(255,255,255,0.10)`,
            filter: hover ? 'brightness(1.25)' : 'brightness(1)',
          }}
        />
      </div>

      {/* ホバーポップオーバー: 項目タイトル + 言及企業一覧 */}
      {hover && (
        <div
          className="absolute left-1/2 -translate-x-1/2 z-50 animate-[fadeIn_0.16s_ease-out] pointer-events-none"
          style={{ bottom: 'calc(100% + 4px)' }}
        >
          <div
            className="rounded-[var(--radius-obs-md)] px-3 py-2.5 min-w-[200px] max-w-[260px]"
            style={{
              backgroundColor: 'var(--color-obs-surface-highest)',
              boxShadow: `0 12px 32px rgba(0,0,0,0.5), inset 0 0 0 1px ${ring}`,
            }}
          >
            <p
              className="text-[12px] font-semibold leading-snug mb-2"
              style={{ color: 'var(--color-obs-text)' }}
            >
              {item.title}
            </p>
            <ul className="space-y-1">
              {companies.map((name) => (
                <li
                  key={name}
                  className="text-[11.5px] leading-snug flex items-start gap-1.5"
                  style={{ color: 'var(--color-obs-text-muted)' }}
                >
                  <span className="mt-1" style={{ color: iconColor }}>
                    •
                  </span>
                  <span className="flex-1 min-w-0 break-words">{name}</span>
                </li>
              ))}
            </ul>
          </div>
          {/* 矢印 */}
          <span
            className="absolute left-1/2 -translate-x-1/2 w-2.5 h-2.5 rotate-45"
            style={{
              bottom: '-4px',
              backgroundColor: 'var(--color-obs-surface-highest)',
              boxShadow: `2px 2px 0 0 ${ring}`,
            }}
          />
        </div>
      )}
    </div>
  )
}

// ─── Row ──────────────────────────────────────────────────────────────────────

function PriorityRow({
  item,
  rank,
  completed,
  onToggleComplete,
  isOpen,
  onToggleOpen,
}: {
  item: PriorityItem
  rank: number
  completed: boolean
  onToggleComplete: () => void
  // 詳細展開を外部 state でも制御できる (グラフのバークリック連動用)
  isOpen?: boolean
  onToggleOpen?: () => void
}) {
  const [localOpen, setLocalOpen] = useState(false)
  const open = isOpen !== undefined ? isOpen : localOpen
  const handleToggle = () => {
    if (onToggleOpen) onToggleOpen()
    else setLocalOpen((v) => !v)
  }
  const meta = CATEGORY_META[item.category]
  const count = uniqueCompanyCount(item)

  return (
    <div
      id={`priority-row-${item.id}`}
      style={{
        borderTop: '1px solid rgba(65,71,83,0.12)',
        scrollMarginTop: 80,
      }}
    >
      <div
        role="button"
        tabIndex={0}
        onClick={handleToggle}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            handleToggle()
          }
        }}
        aria-expanded={open}
        aria-label={`${item.title} の詳細を${open ? '閉じる' : '開く'}`}
        className="grid items-center px-5 py-4 transition-colors duration-150 gap-3 cursor-pointer"
        style={{
          gridTemplateColumns: '36px 1fr 90px 80px 32px',
          backgroundColor: 'transparent',
          opacity: completed ? 0.55 : 1,
        }}
        onMouseOver={(e) => {
          ;(e.currentTarget as HTMLDivElement).style.backgroundColor = 'rgba(65,71,83,0.08)'
        }}
        onMouseOut={(e) => {
          ;(e.currentTarget as HTMLDivElement).style.backgroundColor = 'transparent'
        }}
      >
        {/* 順位 */}
        <span
          className="text-[12px] font-semibold tabular-nums self-start pt-1"
          style={{ color: 'var(--color-obs-text-subtle)' }}
        >
          {String(rank).padStart(2, '0')}
        </span>

        {/* タイトル + 言及企業 (グラフは上部に縦棒で配置・行はシンプルに) */}
        <div className="min-w-0 pr-3">
          <p
            className="text-[14px] font-semibold tracking-[-0.005em] truncate"
            style={{
              color: 'var(--color-obs-text)',
              textDecoration: completed ? 'line-through' : 'none',
            }}
          >
            {item.title}
          </p>
          <p
            className="text-[11px] mt-1 truncate"
            style={{ color: 'var(--color-obs-text-subtle)' }}
          >
            {item.evidence
              .map((e) => e.companyName)
              .filter((v, i, arr) => arr.indexOf(v) === i)
              .join(' / ')}
          </p>
        </div>

        {/* 言及社数バッジ */}
        <div className="flex justify-end">
          <span
            className="inline-flex items-center justify-center gap-1 h-7 px-2.5 rounded-full text-[12px] font-bold tabular-nums"
            style={{
              backgroundColor: meta.bg,
              color: meta.iconColor,
              boxShadow: `inset 0 0 0 1px ${meta.ring}`,
            }}
          >
            {count}
            <span className="text-[10.5px] font-medium opacity-80">社</span>
          </span>
        </div>

        {/* 完了ボタン */}
        <div className="flex justify-end">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onToggleComplete()
            }}
            className="inline-flex items-center gap-1 h-7 px-2.5 rounded-full text-[11px] font-semibold transition-all whitespace-nowrap"
            style={
              completed
                ? {
                    backgroundColor: 'var(--color-obs-surface-low)',
                    color: 'var(--color-obs-text-muted)',
                    boxShadow: 'inset 0 0 0 1px rgba(109,106,111,0.22)',
                  }
                : {
                    backgroundColor: 'rgba(110,231,161,0.10)',
                    color: '#6ee7a1',
                    boxShadow: 'inset 0 0 0 1px rgba(110,231,161,0.32)',
                  }
            }
            title={completed ? '対応中に戻す' : '完了にする (機能開発済み)'}
          >
            {completed ? (
              <>
                <RotateCcw size={10} strokeWidth={2.4} />
                戻す
              </>
            ) : (
              <>
                <Check size={11} strokeWidth={2.6} />
                完了
              </>
            )}
          </button>
        </div>

        {/* 詳細展開トグル — 親 (行) のクリックでも開けるが、ボタン自体のキーボード操作も維持 */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            handleToggle()
          }}
          aria-expanded={open}
          className="flex items-center justify-center w-7 h-7 rounded-full transition-colors"
          style={{ color: 'var(--color-obs-text-muted)' }}
          onMouseOver={(e) => {
            ;(e.currentTarget as HTMLButtonElement).style.backgroundColor =
              'var(--color-obs-surface-highest)'
            ;(e.currentTarget as HTMLButtonElement).style.color = 'var(--color-obs-text)'
          }}
          onMouseOut={(e) => {
            ;(e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent'
            ;(e.currentTarget as HTMLButtonElement).style.color = 'var(--color-obs-text-muted)'
          }}
          aria-label={open ? '詳細を閉じる' : '詳細を開く'}
        >
          <ChevronDown
            size={14}
            strokeWidth={2.2}
            style={{
              transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 150ms var(--ease-liquid)',
            }}
          />
        </button>
      </div>

      {/* 展開: エビデンス一覧 */}
      {open && (
        <div
          className="px-5 pb-5"
          style={{ backgroundColor: 'rgba(65,71,83,0.06)' }}
        >
          <div className="pt-3 space-y-2">
            {item.evidence.map((ev, idx) => {
              const isTicket = ev.sourceType === 'ticket'
              const dateLabel = isTicket ? '問い合わせ' : '商談'
              const linkLabel = isTicket ? 'チケットを開く' : '議事録を開く'
              const linkTitle = isTicket
                ? '問い合わせチケットを開く'
                : '議事録 (Google Docs) を開く'
              const LinkIcon = isTicket ? Ticket : FileText
              return (
                <div
                  key={`${ev.companyId}-${idx}`}
                  className="rounded-[var(--radius-obs-md)] p-3.5"
                  style={{
                    backgroundColor: 'var(--color-obs-surface-low)',
                    boxShadow: 'inset 0 0 0 1px rgba(109,106,111,0.14)',
                  }}
                >
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <span
                      className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold"
                      style={{ color: 'var(--color-obs-text)' }}
                    >
                      <Building2 size={11} style={{ color: 'var(--color-obs-text-muted)' }} />
                      {ev.companyName}
                    </span>
                    <span
                      className="inline-flex items-center gap-1 text-[11px] tabular-nums"
                      style={{ color: 'var(--color-obs-text-subtle)' }}
                    >
                      <CalendarDays size={10} />
                      {formatMeetingDate(ev.meetingDate)} {dateLabel}
                    </span>
                    <Link
                      href={ev.meetingDocUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="ml-auto inline-flex items-center gap-1 h-6 px-2.5 rounded-full text-[10.5px] font-semibold transition-colors hover:opacity-90"
                      style={{
                        backgroundColor: 'rgba(171,199,255,0.14)',
                        color: 'var(--color-obs-primary)',
                      }}
                      title={linkTitle}
                    >
                      <LinkIcon size={10} />
                      {linkLabel}
                    </Link>
                  </div>
                  <p
                    className="text-[12.5px] leading-relaxed"
                    style={{ color: 'var(--color-obs-text-muted)' }}
                  >
                    「{ev.quote}」
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── 完了済みセクション ──────────────────────────────────────────────────────

function CompletedSection({
  items,
  onRestore,
}: {
  items: PriorityItem[]
  onRestore: (id: string) => void
}) {
  const [open, setOpen] = useState(false)
  return (
    <div className="mt-3">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="inline-flex items-center gap-1.5 h-7 px-3 rounded-full text-[11.5px] font-medium transition-colors"
        style={{
          backgroundColor: 'rgba(110,231,161,0.10)',
          color: '#6ee7a1',
          boxShadow: 'inset 0 0 0 1px rgba(110,231,161,0.28)',
        }}
      >
        <Check size={11} strokeWidth={2.6} />
        完了済み {items.length} 件
        <ChevronDown
          size={12}
          strokeWidth={2.2}
          style={{
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 150ms var(--ease-liquid)',
          }}
        />
      </button>

      {open && (
        <div className="mt-3">
          <ObsCard depth="high" padding="none" radius="xl">
            <div
              className="grid items-center px-5 py-3 text-[10.5px] font-medium tracking-[0.12em] uppercase gap-3"
              style={{
                gridTemplateColumns: '36px 1fr 90px 80px 32px',
                color: 'var(--color-obs-text-subtle)',
                backgroundColor: 'var(--color-obs-surface-low)',
              }}
            >
              <span>#</span>
              <span>完了済み項目</span>
              <span className="text-right">言及社数</span>
              <span className="text-right">アクション</span>
              <span></span>
            </div>
            {items.map((item, i) => (
              <PriorityRow
                key={item.id}
                item={item}
                rank={i + 1}
                completed
                onToggleComplete={() => onRestore(item.id)}
              />
            ))}
          </ObsCard>
        </div>
      )}
    </div>
  )
}
