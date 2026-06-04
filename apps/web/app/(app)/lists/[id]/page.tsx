'use client'

import { useState, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ChevronLeft,
  Search,
  ArrowUpDown,
  ChevronUp,
  ChevronDown,
  Phone,
  Mail,
  FileEdit,
  Megaphone,
  Share2,
  Calendar,
  UserCheck,
  PhoneOutgoing,
  Send,
  Handshake,
  Globe,
  HelpCircle,
} from 'lucide-react'
import type { ApproachStatus, CallList, CallListItem } from '@/types/crm'
import { ObsPageShell } from '@/components/obsidian'
import { MOCK_CONTACTS_BY_ID, type LeadSourceType } from '@/lib/mock-data/contacts'

// ─── Mock Data ─────────────────────────────────────────────────────────────────

const MOCK_LISTS: Record<string, CallList & { accent: string }> = {}

type CallListItemEx = CallListItem & { leadSource: LeadSourceType }

// リストへの割当データ。コンタクトの実値はここでは持たず、表示時に MOCK_CONTACTS から引く。
// 「リード経由元 / ステータス / コール / メール」 等は contacts と完全連動。
const LIST_ASSIGNMENTS: Record<string, { contactId: string; priority: number }[]> = {
  'list-1': [
    { contactId: '1', priority: 1 },
    { contactId: '2', priority: 2 },
    { contactId: '3', priority: 3 },
    { contactId: '4', priority: 4 },
    { contactId: '5', priority: 5 },
    { contactId: '6', priority: 6 },
    { contactId: '7', priority: 7 },
    { contactId: '8', priority: 8 },
  ],
  'list-2': [
    { contactId: '4', priority: 1 },
    { contactId: '5', priority: 2 },
  ],
  'list-3': [
    { contactId: '1', priority: 1 },
  ],
  'list-4': [
    { contactId: '6', priority: 1 },
    { contactId: '7', priority: 2 },
    { contactId: '9', priority: 3 },
  ],
}

function buildCallListItem(
  listId: string,
  contactId: string,
  priority: number,
): CallListItemEx | null {
  const c = MOCK_CONTACTS_BY_ID[contactId]
  if (!c) return null
  return {
    id: `li-${listId}-${contactId}`,
    listId,
    contactId,
    contactName: c.name,
    contactTitle: c.title,
    companyId: c.companyId,
    companyName: c.company,
    rank: c.rank,
    status: c.status,
    callAttempts: c.callAttempts,
    emailsSent: c.emailsSent,
    lastCallAt: c.lastCallAt,
    nextActionAt: c.nextActionAt,
    priority,
    leadSource: c.leadSource.type,
  }
}

function getListItems(listId: string): CallListItemEx[] {
  const assignments = LIST_ASSIGNMENTS[listId] ?? []
  return assignments
    .map((a) => buildCallListItem(listId, a.contactId, a.priority))
    .filter((i): i is CallListItemEx => i !== null)
}

// ─── Filter / Sort types ─────────────────────────────────────────────────────

type FilterKey = 'all' | '未着手' | '不通' | '不在' | '接続済み' | 'コール不可' | 'アポ獲得' | 'その他'
type SortKey = 'priority' | 'name' | 'rank'
type SortDir = 'asc' | 'desc'

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'all', label: '全て' },
  { key: '未着手', label: '未着手' },
  { key: '不通', label: '不通' },
  { key: '不在', label: '不在' },
  { key: '接続済み', label: '接続済み' },
  { key: 'コール不可', label: 'コール不可' },
  { key: 'アポ獲得', label: 'アポ獲得' },
  { key: 'その他', label: 'その他' },
]

// コール / メール件数の絞り込み
type CountRange = '' | '0' | '1' | '3' | '5'

// ─── 色定義（Liquid Obsidian: 薄い同色背景 + ●ドット + 同色文字） ───────────

type ObsChipStyle = { core: string; bg: string }

// ステータス
const STATUS_STYLES: Record<string, ObsChipStyle> = {
  '未着手':      { core: 'var(--color-obs-text-muted)', bg: 'rgba(143,140,144,0.14)' },
  '不通':        { core: 'var(--color-obs-hot)',        bg: 'rgba(255,107,107,0.14)' },
  '不在':        { core: 'var(--color-obs-middle)',     bg: 'rgba(255,184,107,0.14)' },
  '接続済み':    { core: 'var(--color-obs-low)',        bg: 'rgba(126,198,255,0.14)' },
  'コール不可':  { core: 'var(--color-obs-hot)',        bg: 'rgba(255,107,107,0.14)' },
  'アポ獲得':    { core: '#4ad98a',                     bg: 'rgba(74,217,138,0.14)' },
  'その他':      { core: 'var(--color-obs-text-muted)', bg: 'rgba(143,140,144,0.14)' },
}
const DEFAULT_STATUS_STYLE: ObsChipStyle = { core: 'var(--color-obs-text-muted)', bg: 'rgba(143,140,144,0.14)' }

// ─── リード経由元（チャネル種別 — 共有モジュール `LeadSourceType` を使用) ──

const LEAD_SOURCE_STYLES: Record<LeadSourceType, { Icon: React.ElementType; label: string; chipBg: string; chipRing: string; fg: string }> = {
  web_form:       { Icon: FileEdit,      label: 'Webフォーム',     chipBg: 'rgba(171,199,255,0.10)', chipRing: 'inset 0 0 0 1px rgba(171,199,255,0.32)', fg: 'var(--color-obs-primary)' },
  organic_search: { Icon: Search,        label: '自然検索',         chipBg: 'rgba(171,199,255,0.08)', chipRing: 'inset 0 0 0 1px rgba(171,199,255,0.28)', fg: 'var(--color-obs-primary)' },
  paid_ads:       { Icon: Megaphone,     label: '広告経由',         chipBg: 'rgba(171,199,255,0.14)', chipRing: 'inset 0 0 0 1px rgba(171,199,255,0.40)', fg: 'var(--color-obs-primary)' },
  sns:            { Icon: Share2,        label: 'SNS',              chipBg: 'rgba(171,199,255,0.10)', chipRing: 'inset 0 0 0 1px rgba(171,199,255,0.32)', fg: 'var(--color-obs-primary)' },
  event:          { Icon: Calendar,      label: '展示会・イベント', chipBg: 'rgba(255,204,102,0.12)', chipRing: 'inset 0 0 0 1px rgba(255,204,102,0.35)', fg: '#FFCC66' },
  referral:       { Icon: UserCheck,     label: '紹介',             chipBg: 'rgba(110,231,183,0.12)', chipRing: 'inset 0 0 0 1px rgba(110,231,183,0.35)', fg: '#6EE7B7' },
  cold_call:      { Icon: PhoneOutgoing, label: '新規コール',       chipBg: 'rgba(171,199,255,0.10)', chipRing: 'inset 0 0 0 1px rgba(171,199,255,0.32)', fg: 'var(--color-obs-primary)' },
  cold_mail:      { Icon: Send,          label: '新規メール',       chipBg: 'rgba(171,199,255,0.10)', chipRing: 'inset 0 0 0 1px rgba(171,199,255,0.32)', fg: 'var(--color-obs-primary)' },
  partner:        { Icon: Handshake,     label: 'パートナー',       chipBg: 'rgba(192,124,255,0.12)', chipRing: 'inset 0 0 0 1px rgba(192,124,255,0.35)', fg: '#C07CFF' },
  inbound:        { Icon: Globe,         label: 'インバウンド',     chipBg: 'rgba(110,231,183,0.10)', chipRing: 'inset 0 0 0 1px rgba(110,231,183,0.30)', fg: '#6EE7B7' },
  other:          { Icon: HelpCircle,    label: 'その他',           chipBg: 'rgba(143,140,144,0.12)', chipRing: 'inset 0 0 0 1px rgba(143,140,144,0.35)', fg: 'var(--color-obs-text-muted)' },
}

function LeadSourceBadge({ type }: { type: LeadSourceType }) {
  const s = LEAD_SOURCE_STYLES[type] ?? LEAD_SOURCE_STYLES.other
  const Icon = s.Icon
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2 h-6 rounded-full text-[10.5px] font-semibold whitespace-nowrap"
      style={{ backgroundColor: s.chipBg, color: s.fg, boxShadow: s.chipRing }}
    >
      <Icon size={11} strokeWidth={2} />
      {s.label}
    </span>
  )
}

// ─── Components ──────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_STYLES[status] ?? DEFAULT_STATUS_STYLE
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2 h-5 rounded-full text-[11px] font-medium tracking-[-0.005em] whitespace-nowrap"
      style={{ backgroundColor: s.bg, color: s.core }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: s.core }} />
      {status}
    </span>
  )
}

function SortHeader({
  label,
  sortKey,
  currentSort,
  currentDir,
  onSort,
}: {
  label: string
  sortKey: SortKey
  currentSort: SortKey
  currentDir: SortDir
  onSort: (k: SortKey) => void
}) {
  const active = currentSort === sortKey
  return (
    <button
      className="flex items-center gap-1 text-[11px] uppercase tracking-[0.08em] font-medium"
      style={{ color: active ? 'var(--color-obs-primary)' : 'var(--color-obs-text-subtle)' }}
      onClick={() => onSort(sortKey)}
    >
      {label}
      {active ? (
        currentDir === 'asc' ? <ChevronUp size={11} /> : <ChevronDown size={11} />
      ) : (
        <ArrowUpDown size={11} />
      )}
    </button>
  )
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function ListDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const list = MOCK_LISTS[id]
  const [items] = useState<CallListItemEx[]>(() => getListItems(id))
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<FilterKey>('all')
  const [filterCallRange, setFilterCallRange] = useState<CountRange>('')
  const [filterEmailRange, setFilterEmailRange] = useState<CountRange>('')
  const [sortKey, setSortKey] = useState<SortKey>('priority')
  const [sortDir, setSortDir] = useState<SortDir>('asc')

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  const filtered = useMemo(() => {
    let result = [...items]
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(
        (i) => i.contactName.toLowerCase().includes(q) || i.companyName.toLowerCase().includes(q),
      )
    }
    if (filter !== 'all') result = result.filter((i) => i.status === filter)
    if (filterCallRange === '0') result = result.filter((i) => i.callAttempts === 0)
    else if (filterCallRange) result = result.filter((i) => i.callAttempts >= Number(filterCallRange))
    if (filterEmailRange === '0') result = result.filter((i) => i.emailsSent === 0)
    else if (filterEmailRange) result = result.filter((i) => i.emailsSent >= Number(filterEmailRange))
    result.sort((a, b) => {
      let cmp = 0
      switch (sortKey) {
        case 'priority': cmp = a.priority - b.priority; break
        case 'name':     cmp = a.contactName.localeCompare(b.contactName); break
        case 'rank':     cmp = a.rank.localeCompare(b.rank); break
      }
      return sortDir === 'asc' ? cmp : -cmp
    })
    return result
  }, [items, search, filter, filterCallRange, filterEmailRange, sortKey, sortDir])

  if (!list) {
    return (
      <ObsPageShell>
        <div className="w-full px-8 xl:px-12 2xl:px-16 py-20 text-center">
          <p className="text-sm" style={{ color: 'var(--color-obs-text-muted)' }}>
            リストが見つかりません
          </p>
        </div>
      </ObsPageShell>
    )
  }

  const appointmentCount = items.filter((i) => i.status === 'アポ獲得').length
  const totalCalls = items.reduce((s, i) => s + i.callAttempts, 0)
  const totalEmails = items.reduce((s, i) => s + i.emailsSent, 0)

  return (
    <ObsPageShell>
      <div className="w-full px-8 xl:px-12 2xl:px-16 pb-16">
        {/* Back link */}
        <div className="pt-6 pb-2">
          <Link
            href="/lists"
            className="inline-flex items-center gap-1.5 text-sm transition-colors duration-150"
            style={{ color: 'var(--color-obs-text-subtle)' }}
          >
            <ChevronLeft size={14} />
            リスト一覧
          </Link>
        </div>

        {/* Hero */}
        <div className="mb-6 mt-2 max-w-5xl">
          <div className="flex items-center gap-3 mb-2">
            <span
              className="w-3 h-3 rounded-full shrink-0"
              style={{
                backgroundColor: list.accent,
                boxShadow: `0 0 12px ${list.accent}80, 0 0 3px ${list.accent}`,
              }}
            />
            <h1
              className="font-[family-name:var(--font-display)] text-[clamp(1.75rem,3vw,2.5rem)] font-semibold tracking-[-0.025em] leading-[1.1]"
              style={{ color: 'var(--color-obs-text)' }}
            >
              {list.name}
            </h1>
          </div>
          {list.description && (
            <p className="text-sm ml-6" style={{ color: 'var(--color-obs-text-muted)' }}>
              {list.description}
            </p>
          )}
        </div>

        {/* Stats bar */}
        <div className="flex items-center gap-5 mb-8 ml-6 flex-wrap">
          <StatPill label="合計" value={`${items.length}件`} />
          <div className="w-px h-4" style={{ backgroundColor: 'var(--color-obs-outline-variant)' }} />
          <StatPill label="アポ獲得" value={`${appointmentCount}件`} accent="#6ef7a5" />
          <div className="w-px h-4" style={{ backgroundColor: 'var(--color-obs-outline-variant)' }} />
          <StatPill label="コール合計" value={totalCalls} icon={<Phone size={11} />} accent="#4a9eff" />
          <div className="w-px h-4" style={{ backgroundColor: 'var(--color-obs-outline-variant)' }} />
          <StatPill label="メール合計" value={totalEmails} icon={<Mail size={11} />} accent="#abc7ff" />
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-3 mb-5">
          {/* ステータス */}
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className="text-[10px] font-bold uppercase tracking-[0.12em] w-[88px] shrink-0"
              style={{ color: 'var(--color-obs-text-subtle)' }}
            >
              ステータス
            </span>
            {FILTERS.map((f) => (
              <FilterPill
                key={f.key}
                active={filter === f.key}
                onClick={() => setFilter(f.key)}
                style={f.key !== 'all' ? STATUS_STYLES[f.label] : undefined}
              >
                {f.label}
              </FilterPill>
            ))}
          </div>

          {/* 活動量(コール / メール件数) */}
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className="text-[10px] font-bold uppercase tracking-[0.12em] w-[88px] shrink-0"
              style={{ color: 'var(--color-obs-text-subtle)' }}
            >
              活動量
            </span>

            {/* コール数 */}
            <select
              value={filterCallRange}
              onChange={(e) => setFilterCallRange(e.target.value as CountRange)}
              className="h-8 px-3 text-[12px] font-medium rounded-[var(--radius-obs-md)] appearance-none cursor-pointer outline-none"
              style={{
                backgroundColor: filterCallRange
                  ? 'var(--color-obs-primary-container)'
                  : 'var(--color-obs-surface-lowest)',
                color: filterCallRange
                  ? 'var(--color-obs-on-primary)'
                  : 'var(--color-obs-text-muted)',
                boxShadow: 'inset 0 0 0 1px rgba(109,106,111,0.18)',
              }}
            >
              <option value="">コール数</option>
              <option value="0">0件のみ</option>
              <option value="1">1件以上</option>
              <option value="3">3件以上</option>
              <option value="5">5件以上</option>
            </select>

            {/* メール数 */}
            <select
              value={filterEmailRange}
              onChange={(e) => setFilterEmailRange(e.target.value as CountRange)}
              className="h-8 px-3 text-[12px] font-medium rounded-[var(--radius-obs-md)] appearance-none cursor-pointer outline-none"
              style={{
                backgroundColor: filterEmailRange
                  ? 'var(--color-obs-primary-container)'
                  : 'var(--color-obs-surface-lowest)',
                color: filterEmailRange
                  ? 'var(--color-obs-on-primary)'
                  : 'var(--color-obs-text-muted)',
                boxShadow: 'inset 0 0 0 1px rgba(109,106,111,0.18)',
              }}
            >
              <option value="">メール数</option>
              <option value="0">0件のみ</option>
              <option value="1">1件以上</option>
              <option value="3">3件以上</option>
              <option value="5">5件以上</option>
            </select>

            {/* Search (右寄せ) */}
            <div className="ml-auto relative">
              <Search
                size={13}
                className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                style={{ color: 'var(--color-obs-text-subtle)' }}
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="検索..."
                className="h-8 w-[200px] pl-8 pr-3 text-[12px] rounded-[var(--radius-obs-md)] outline-none transition-shadow focus:ring-2 focus:ring-[var(--color-obs-primary)]/40"
                style={{
                  backgroundColor: 'var(--color-obs-surface-lowest)',
                  color: 'var(--color-obs-text)',
                  boxShadow: 'inset 0 0 0 1px rgba(109,106,111,0.18)',
                }}
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <div
          className="rounded-[var(--radius-obs-xl)] overflow-hidden"
          style={{ backgroundColor: 'var(--color-obs-surface-low)' }}
        >
          {/* Header */}
          <div
            className="grid items-center gap-x-3 px-5 py-3"
            style={{ gridTemplateColumns: '40px 1fr 150px 140px 80px 80px' }}
          >
            <span className="text-[10px] font-medium uppercase tracking-[0.1em]" style={{ color: 'var(--color-obs-text-subtle)' }}>#</span>
            <SortHeader label="氏名" sortKey="name" currentSort={sortKey} currentDir={sortDir} onSort={handleSort} />
            <span className="text-[10px] font-medium uppercase tracking-[0.1em]" style={{ color: 'var(--color-obs-text-subtle)' }}>リード経由元</span>
            <span className="text-[10px] font-medium uppercase tracking-[0.1em]" style={{ color: 'var(--color-obs-text-subtle)' }}>ステータス</span>
            <span className="text-[10px] font-medium uppercase tracking-[0.1em] text-right" style={{ color: 'var(--color-obs-text-subtle)' }}>コール</span>
            <span className="text-[10px] font-medium uppercase tracking-[0.1em] text-right" style={{ color: 'var(--color-obs-text-subtle)' }}>メール</span>
          </div>

          {/* Rows */}
          {filtered.map((item, i) => (
            <div
              key={item.id}
              onClick={() => router.push(`/contacts/${item.contactId}`)}
              className="grid items-center gap-x-3 px-5 py-3 cursor-pointer transition-colors duration-150"
              style={{
                gridTemplateColumns: '40px 1fr 150px 140px 80px 80px',
                boxShadow: i < filtered.length - 1 ? 'inset 0 -1px 0 0 rgba(65,71,83,0.2)' : 'none',
                transitionTimingFunction: 'var(--ease-liquid)',
              }}
              onMouseOver={(e) => {
                ;(e.currentTarget as HTMLDivElement).style.backgroundColor = 'rgba(67,66,71,0.3)'
              }}
              onMouseOut={(e) => {
                ;(e.currentTarget as HTMLDivElement).style.backgroundColor = 'transparent'
              }}
            >
              <span className="text-[12px] tabular-nums" style={{ color: 'var(--color-obs-text-subtle)' }}>
                {item.priority}
              </span>

              {/* 氏名 + 会社名 */}
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-[11px] font-bold"
                  style={{
                    background: 'linear-gradient(140deg, var(--color-obs-primary) 0%, var(--color-obs-primary-container) 100%)',
                    color: 'var(--color-obs-on-primary)',
                    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.18)',
                  }}
                >
                  {item.contactName[0]}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-medium truncate tracking-[-0.01em]" style={{ color: 'var(--color-obs-text)' }}>
                    {item.contactName}
                  </p>
                  <p className="text-[11px] truncate" style={{ color: 'var(--color-obs-text-subtle)' }}>
                    {item.companyName}
                  </p>
                </div>
              </div>

              {/* リード経由元 */}
              <div><LeadSourceBadge type={item.leadSource} /></div>

              {/* ステータス */}
              <div><StatusBadge status={item.status as ApproachStatus} /></div>

              {/* コール数 */}
              <div className="flex items-center justify-end gap-1.5">
                <Phone size={11} style={{ color: 'var(--color-obs-text-subtle)' }} />
                <span
                  className="text-[13px] font-semibold tabular-nums"
                  style={{ color: item.callAttempts > 0 ? 'var(--color-obs-text)' : 'var(--color-obs-text-subtle)' }}
                >
                  {item.callAttempts}
                </span>
              </div>

              {/* メール数 */}
              <div className="flex items-center justify-end gap-1.5">
                <Mail size={11} style={{ color: 'var(--color-obs-text-subtle)' }} />
                <span
                  className="text-[13px] font-semibold tabular-nums"
                  style={{ color: item.emailsSent > 0 ? 'var(--color-obs-text)' : 'var(--color-obs-text-subtle)' }}
                >
                  {item.emailsSent}
                </span>
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="py-12 text-center">
              <p className="text-sm" style={{ color: 'var(--color-obs-text-subtle)' }}>
                該当するコンタクトがありません
              </p>
            </div>
          )}
        </div>
      </div>
    </ObsPageShell>
  )
}

// ─── Sub components ──────────────────────────────────────────────────────────

function StatPill({
  label,
  value,
  icon,
  accent,
}: {
  label: string
  value: string | number
  icon?: React.ReactNode
  accent?: string
}) {
  return (
    <div className="inline-flex items-center gap-1.5">
      {icon && (
        <span
          className="inline-flex"
          style={{
            color: accent ?? 'var(--color-obs-text-subtle)',
            filter: accent ? `drop-shadow(0 0 4px ${accent}80)` : 'none',
          }}
        >
          {icon}
        </span>
      )}
      <span className="text-[12px]" style={{ color: 'var(--color-obs-text-muted)' }}>
        {label}
      </span>
      <span
        className="text-[13px] font-bold tabular-nums"
        style={{
          color: accent ?? 'var(--color-obs-text)',
          textShadow: accent ? `0 0 6px ${accent}55` : 'none',
        }}
      >
        {value}
      </span>
    </div>
  )
}

function FilterPill({
  children,
  active,
  onClick,
  style,
}: {
  children: React.ReactNode
  active: boolean
  onClick: () => void
  style?: ObsChipStyle
}) {
  const useCustom = active && style
  return (
    <button
      onClick={onClick}
      className="h-7 px-3 text-[11px] font-medium rounded-full transition-all duration-150"
      style={{
        backgroundColor: useCustom
          ? style.bg
          : active
            ? 'rgba(171,199,255,0.14)'
            : 'rgba(65,71,83,0.15)',
        color: useCustom
          ? style.core
          : active
            ? 'var(--color-obs-primary)'
            : 'var(--color-obs-text-muted)',
        boxShadow: 'none',
        transitionTimingFunction: 'var(--ease-liquid)',
      }}
    >
      {children}
    </button>
  )
}
