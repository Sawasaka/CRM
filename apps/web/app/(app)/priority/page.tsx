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

import { useEffect, useMemo, useRef, useState } from 'react'
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
  CircleSlash,
  Clock,
  LifeBuoy,
  Ticket,
} from 'lucide-react'
import {
  ObsPageShell,
  ObsHero,
  ObsCard,
} from '@/components/obsidian'
import {
  MOCK_PRIORITY_ITEMS,
  type PriorityCategory,
  type PriorityItem,
} from '@/lib/mock-data/priority'

// ─── Types ────────────────────────────────────────────────────────────────────


// ─── Category Meta ────────────────────────────────────────────────────────────

const CATEGORY_META: Record<PriorityCategory, {
  Icon: React.ElementType
  iconColor: string
  bg: string
  ring: string
  label: string
  caption: string
}> = {
  要望機能: {
    Icon: Sparkles,
    iconColor: '#abc7ff',
    bg: 'rgba(171,199,255,0.10)',
    ring: 'rgba(171,199,255,0.28)',
    label: '要望機能',
    caption: '「こういう機能がほしい」と直接言われたもの',
  },
  ニーズ: {
    Icon: Lightbulb,
    iconColor: '#ffb86b',
    bg: 'rgba(255,184,107,0.10)',
    ring: 'rgba(255,184,107,0.28)',
    label: 'ニーズ',
    caption: '「こうなったら嬉しい / こうしたい」という潜在的な期待',
  },
  課題: {
    Icon: AlertTriangle,
    iconColor: '#ff6b6b',
    bg: 'rgba(255,107,107,0.10)',
    ring: 'rgba(255,107,107,0.28)',
    label: '課題',
    caption: '「今これが困っている」と語られた現場の痛み',
  },
  問題: {
    Icon: LifeBuoy,
    iconColor: '#c8b9ff',
    bg: 'rgba(200,185,255,0.10)',
    ring: 'rgba(200,185,255,0.28)',
    label: '問題',
    caption: '問い合わせチケットから集計したインシデント・障害の傾向',
  },
}

// ─── Mock Data ────────────────────────────────────────────────────────────────


// ─── Helpers ──────────────────────────────────────────────────────────────────

function uniqueCompanyCount(item: PriorityItem): number {
  return new Set(item.evidence.map((e) => e.companyId)).size
}

function formatMeetingDate(iso: string): string {
  const d = new Date(iso)
  return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`
}

// 表示するカテゴリ (議事録から自動抽出する「ニーズ」と「課題」のみ)
const ALL_CATEGORIES: PriorityCategory[] = ['ニーズ', '課題']

// ─── Item Status ───────────────────────────────────────────────────────────────
type ItemStatus = 'pending' | 'rejected' | 'done'

const ITEM_STATUS_META: Record<ItemStatus, {
  label: string
  Icon: React.ElementType
  color: string
  bg: string
  ring: string
}> = {
  pending: {
    label: '検討中',
    Icon: Clock,
    color: 'var(--color-obs-text-muted)',
    bg: 'rgba(143,140,144,0.14)',
    ring: 'rgba(143,140,144,0.28)',
  },
  rejected: {
    label: '実施しない',
    Icon: CircleSlash,
    color: 'var(--color-obs-text-subtle)',
    bg: 'rgba(109,106,111,0.18)',
    ring: 'rgba(109,106,111,0.32)',
  },
  done: {
    label: '完了',
    Icon: Check,
    color: '#6ee7a1',
    bg: 'rgba(110,231,161,0.12)',
    ring: 'rgba(110,231,161,0.32)',
  },
}

const ALL_STATUSES: ItemStatus[] = ['pending', 'rejected', 'done']

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DevelopmentPriorityPage() {
  // 項目ごとのステータス (id -> 'pending' | 'rejected' | 'done')
  // 未設定の項目は 'pending' (検討中) として扱う
  const [statuses, setStatuses] = useState<Record<string, ItemStatus>>({})
  const getStatus = (id: string): ItemStatus => statuses[id] ?? 'pending'
  const setStatus = (id: string, next: ItemStatus) =>
    setStatuses((prev) => ({ ...prev, [id]: next }))

  // 詳細を展開している項目 ID のセット (グラフのバークリック / 行の▼両方から制御)
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())
  const toggleExpanded = (id: string) =>
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

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
          eyebrow="Voice of Customer"
          title="顧客の声"
          titleAccent="声"
          caption={`議事録${overall.totalDocs}件・${overall.totalCompanies}社の発言から、ニーズと課題を自動抽出。`}
        />

        {/* ── 3カテゴリ並列セクション (タブ無し・全件まとめて閲覧) ──────── */}
        <div className="mt-8 space-y-10">
          {ALL_CATEGORIES.map((cat) => {
            const meta = CATEGORY_META[cat]
            const Icon = meta.Icon
            const allItems = itemsByCategory[cat]
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
                    {allItems.length}
                  </span>
                  <p
                    className="ml-2 text-[11.5px]"
                    style={{ color: 'var(--color-obs-text-subtle)' }}
                  >
                    {meta.caption}
                  </p>
                </div>

                {/* リスト (全ステータス同じテーブル内に表示) */}
                <ObsCard depth="high" padding="none" radius="xl">
                  {/* テーブルヘッダー */}
                  <div
                    className="grid items-center px-5 py-3 text-[10.5px] font-medium tracking-[0.12em] uppercase gap-3"
                    style={{
                      gridTemplateColumns: '36px 1fr 90px 120px 32px',
                      color: 'var(--color-obs-text-subtle)',
                      backgroundColor: 'var(--color-obs-surface-low)',
                    }}
                  >
                    <span>#</span>
                    <span>{meta.label}</span>
                    <span className="text-right">言及社数</span>
                    <span className="text-right">ステータス</span>
                    <span></span>
                  </div>

                  {allItems.length === 0 ? (
                    <div
                      className="px-5 py-12 text-center text-[13px]"
                      style={{ color: 'var(--color-obs-text-subtle)' }}
                    >
                      {meta.label}はまだ抽出されていません
                    </div>
                  ) : (
                    allItems.map((item, i) => (
                      <PriorityRow
                        key={item.id}
                        item={item}
                        rank={i + 1}
                        status={getStatus(item.id)}
                        onChangeStatus={(next) => setStatus(item.id, next)}
                        isOpen={expandedIds.has(item.id)}
                        onToggleOpen={() => toggleExpanded(item.id)}
                      />
                    ))
                  )}
                </ObsCard>
              </section>
            )
          })}
        </div>
      </div>
    </ObsPageShell>
  )
}

// ─── Row ──────────────────────────────────────────────────────────────────────

function PriorityRow({
  item,
  rank,
  status,
  onChangeStatus,
  isOpen,
  onToggleOpen,
}: {
  item: PriorityItem
  rank: number
  status: ItemStatus
  onChangeStatus: (next: ItemStatus) => void
  // 詳細展開を外部 state でも制御できる
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
  // 完了/実施しない の項目は薄く表示して「終わっている」感を出す
  const isDimmed = status === 'done' || status === 'rejected'
  const isStrike = status === 'done' || status === 'rejected'

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
          gridTemplateColumns: '36px 1fr 90px 120px 32px',
          backgroundColor: 'transparent',
          opacity: isDimmed ? 0.6 : 1,
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
              textDecoration: isStrike ? 'line-through' : 'none',
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

        {/* ステータスプルダウン */}
        <div className="flex justify-end">
          <StatusDropdown status={status} onChange={onChangeStatus} />
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

// ─── ステータスプルダウン ─────────────────────────────────────────────────────
// 行内のステータス選択 UI (検討中 / 実施しない / 完了)

function StatusDropdown({
  status,
  onChange,
}: {
  status: ItemStatus
  onChange: (next: ItemStatus) => void
}) {
  const [open, setOpen] = useState(false)
  const wrapRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!open) return
    const onClickOutside = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false)
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onClickOutside)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  const currentMeta = ITEM_STATUS_META[status]
  const CurrentIcon = currentMeta.Icon

  return (
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          setOpen((v) => !v)
        }}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="inline-flex items-center gap-1 h-7 pl-2 pr-1.5 rounded-full text-[11px] font-semibold transition-all whitespace-nowrap"
        style={{
          backgroundColor: currentMeta.bg,
          color: currentMeta.color,
          boxShadow: `inset 0 0 0 1px ${currentMeta.ring}`,
        }}
        title="ステータスを変更"
      >
        <CurrentIcon size={11} strokeWidth={2.4} />
        {currentMeta.label}
        <ChevronDown
          size={11}
          strokeWidth={2.2}
          style={{
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 150ms var(--ease-liquid)',
            opacity: 0.7,
          }}
        />
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute right-0 top-full mt-1.5 min-w-[148px] py-1 rounded-[var(--radius-obs-md)] z-50"
          style={{
            backgroundColor: 'var(--color-obs-surface-highest)',
            boxShadow: '0 10px 30px rgba(0,0,0,0.45), inset 0 0 0 1px rgba(109,106,111,0.18)',
          }}
        >
          {ALL_STATUSES.map((s) => {
            const m = ITEM_STATUS_META[s]
            const Icon = m.Icon
            const selected = s === status
            return (
              <button
                key={s}
                type="button"
                role="option"
                aria-selected={selected}
                onClick={(e) => {
                  e.stopPropagation()
                  onChange(s)
                  setOpen(false)
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-left transition-colors duration-100"
                style={{ color: 'var(--color-obs-text)' }}
                onMouseOver={(e) => {
                  ;(e.currentTarget as HTMLButtonElement).style.backgroundColor =
                    'var(--color-obs-surface-high)'
                }}
                onMouseOut={(e) => {
                  ;(e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent'
                }}
              >
                <Icon size={12} strokeWidth={2.2} style={{ color: m.color }} />
                <span className="text-[12.5px] font-medium flex-1">{m.label}</span>
                {selected && <Check size={12} strokeWidth={2.6} style={{ color: m.color }} />}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
