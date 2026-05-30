'use client'

import React, { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  Plus,
  Phone,
  Mail,
  ArrowUpDown,
  ChevronUp,
  ChevronDown,
  User,
  X,
  FileEdit,
  Search as SearchIcon,
  Megaphone,
  Share2,
  Calendar,
  UserCheck,
  PhoneOutgoing,
  Send,
  Handshake,
  Inbox,
  HelpCircle,
  Filter,
  List,
  CheckSquare,
  Square,
} from 'lucide-react'
import {
  ObsButton,
  ObsChip,
  ObsInput,
  ObsPageShell,
} from '@/components/obsidian'

import {
  MOCK_CONTACTS,
  type Contact,
  type ContactStatus,
  type LeadSource,
  type LeadSourceType,
  type NextAction,
  type PersonRole,
  type Rank,
} from '@/lib/mock-data/contacts'
import type { ApproachStatus } from '@/types/crm'
import { SignalBadge } from '@/components/crm/SignalBadge'
import { getCompanyFirstPartySignal } from '@/lib/mock-data/firstPartySignals'

// ─── 求人インテント(モック)── 会社名キーで紐付け ─────────────────────────────
type IntentLevel = 'HOT' | 'MID' | 'LOW' | 'NONE'
interface CompanyIntent { level: IntentLevel; deptCount: number }

const COMPANY_INTENT_MAP: Record<string, CompanyIntent> = {
  '株式会社テクノリード':    { level: 'HOT', deptCount: 3 },
  '合同会社フューチャー':    { level: 'MID', deptCount: 2 },
  '株式会社イノベーション':  { level: 'HOT', deptCount: 5 },
  '株式会社グロース':        { level: 'MID', deptCount: 2 },
  '有限会社サクセス':        { level: 'LOW', deptCount: 1 },
  '株式会社ネクスト':        { level: 'HOT', deptCount: 4 },
  '株式会社デジタルフォース': { level: 'HOT', deptCount: 6 },
}

function getCompanyIntent(companyName: string): CompanyIntent {
  return COMPANY_INTENT_MAP[companyName] ?? { level: 'NONE', deptCount: 0 }
}

// ISリスト作成モーダルの「IS担当者」プルダウン候補。
// ワークスペースのメンバー機能ができたら差し替える。
const LIST_MEMBERS = [
  '開発 太郎',
  '営業 花子',
  'マーケ 次郎',
  'IS 三郎',
  'CS 四郎',
] as const

const INTENT_TONE: Record<IntentLevel, { fg: string; bg: string; bgStrong: string; ring: string; glow: string }> = {
  HOT: {
    fg: '#ff6b7a',
    bg: 'rgba(255,107,122,0.075)',
    bgStrong: 'linear-gradient(145deg, rgba(255,107,122,0.12) 0%, rgba(36,36,38,0.78) 34%, rgba(24,25,29,0.88) 100%)',
    ring: 'rgba(255,107,122,0.26)',
    glow: 'rgba(255,107,122,0.10)',
  },
  MID: {
    fg: '#6ee7a1',
    bg: 'rgba(110,231,161,0.07)',
    bgStrong: 'linear-gradient(145deg, rgba(110,231,161,0.11) 0%, rgba(36,36,38,0.78) 34%, rgba(24,25,29,0.88) 100%)',
    ring: 'rgba(110,231,161,0.24)',
    glow: 'rgba(110,231,161,0.09)',
  },
  LOW: {
    fg: 'var(--color-obs-primary)',
    bg: 'rgba(171,199,255,0.075)',
    bgStrong: 'linear-gradient(145deg, rgba(171,199,255,0.12) 0%, rgba(36,36,38,0.78) 34%, rgba(24,25,29,0.88) 100%)',
    ring: 'rgba(171,199,255,0.24)',
    glow: 'rgba(171,199,255,0.06)',
  },
  NONE: { fg: 'var(--color-obs-text-subtle)', bg: 'transparent', bgStrong: 'transparent', ring: 'transparent', glow: 'transparent' },
}

const SERVICE_PAGE_BACKGROUND =
  'radial-gradient(circle at 50% 20%, rgba(171,199,255,0.06) 0%, transparent 45%), radial-gradient(circle at 20% 80%, rgba(0,113,227,0.04) 0%, transparent 50%)'
const GLASS_TABLE_BG =
  'linear-gradient(145deg, rgba(36,36,38,0.70) 0%, rgba(25,26,31,0.86) 46%, rgba(13,14,18,0.94) 100%)'
const GLASS_TABLE_SHADOW =
  'inset 0 0 0 1px rgba(171,199,255,0.12), inset 1px 1px 0 rgba(255,255,255,0.055), inset -1px -1px 0 rgba(0,0,0,0.26), 0 20px 52px rgba(0,0,0,0.30)'
const PRIMARY_BUTTON_BG = 'linear-gradient(135deg, #abc7ff 0%, #5aa0ff 45%, #0071e3 100%)'
const FILTER_IDLE_BG =
  'linear-gradient(145deg, rgba(36,36,38,0.58) 0%, rgba(20,21,25,0.76) 100%)'
const FILTER_ACTIVE_BG =
  'linear-gradient(140deg, rgba(171,199,255,0.18) 0%, rgba(0,113,227,0.24) 100%)'
const FILTER_IDLE_SHADOW =
  'inset 0 0 0 1px rgba(171,199,255,0.085), inset 1px 1px 0 rgba(255,255,255,0.035)'
const FILTER_ACTIVE_SHADOW =
  'inset 1px 1px 0 rgba(255,255,255,0.12), inset 0 0 0 1px rgba(171,199,255,0.26), 0 0 16px rgba(171,199,255,0.13)'
const MENU_SURFACE =
  'linear-gradient(145deg, rgba(36,36,38,0.96) 0%, rgba(20,21,25,0.98) 100%)'
const MENU_SHADOW =
  '0 24px 60px rgba(0,0,0,0.52), inset 0 0 0 1px rgba(171,199,255,0.12), inset 1px 1px 0 rgba(255,255,255,0.050), inset -1px -1px 0 rgba(0,0,0,0.25)'
const TABLE_HEADER_TEXT_COLOR = 'rgba(217,226,255,0.44)'
const TABLE_HEADER_TEXT_HOVER = 'rgba(217,226,255,0.62)'

function filterControlStyle(active: boolean): React.CSSProperties {
  return {
    background: active ? FILTER_ACTIVE_BG : FILTER_IDLE_BG,
    color: active ? 'var(--color-obs-on-primary)' : 'var(--color-obs-text-muted)',
    boxShadow: active ? FILTER_ACTIVE_SHADOW : FILTER_IDLE_SHADOW,
    backdropFilter: 'blur(10px) saturate(130%)',
    WebkitBackdropFilter: 'blur(10px) saturate(130%)',
  }
}

function menuSurfaceStyle(): React.CSSProperties {
  return {
    background: MENU_SURFACE,
    boxShadow: MENU_SHADOW,
    backdropFilter: 'blur(22px) saturate(135%)',
    WebkitBackdropFilter: 'blur(22px) saturate(135%)',
  }
}

function IntentChip({ companyName }: { companyName: string }) {
  const intent = getCompanyIntent(companyName)
  if (intent.level === 'NONE') {
    return <span className="text-[12px]" style={{ color: 'var(--color-obs-text-subtle)', opacity: 0.55 }}>—</span>
  }
  const c = INTENT_TONE[intent.level]
  return (
    <span
      className="inline-flex items-center gap-1 h-7 px-2.5 rounded-[var(--radius-obs-md)] text-[10.5px] font-bold whitespace-nowrap"
      style={{
        background: c.bgStrong,
        color: c.fg,
        boxShadow: `inset 2px 0 0 ${c.fg}, inset 0 0 0 1px ${c.ring}, inset 1px 1px 0 rgba(255,255,255,0.055), 0 0 12px ${c.glow}`,
      }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: c.fg, boxShadow: `0 0 6px ${c.fg}` }} />
      {intent.level}
      <span className="ml-0.5 font-semibold" style={{ color: 'var(--color-obs-text-muted)' }}>{intent.deptCount}部門</span>
    </span>
  )
}

function FirstPartySignalCell({ companyName }: { companyName: string }) {
  const signal = getCompanyFirstPartySignal(companyName)
  if (!signal) {
    return <span className="text-[12px]" style={{ color: 'var(--color-obs-text-subtle)', opacity: 0.55 }}>—</span>
  }
  return <SignalBadge signal={signal} />
}

// 290万社DBの IntentFilterChip と完全に同じデザイン
function ContactsIntentFilterChip({
  active,
  tone,
  label,
  count,
  onClick,
}: {
  active: boolean
  tone: 'hot' | 'middle' | 'low'
  label: string
  count: number
  onClick: () => void
}) {
  const palette = {
    hot:    INTENT_TONE.HOT,
    middle: INTENT_TONE.MID,
    low:    INTENT_TONE.LOW,
  }[tone]
  const idleBg = `linear-gradient(145deg, ${palette.bg} 0%, rgba(36,36,38,0.68) 38%, rgba(24,25,29,0.78) 100%)`
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 h-7 px-2.5 rounded-[var(--radius-obs-md)] text-[10.5px] font-bold transition-all"
      style={{
        background: active ? palette.bgStrong : idleBg,
        color: palette.fg,
        boxShadow: active
          ? `inset 2px 0 0 ${palette.fg}, inset 0 0 0 1px ${palette.ring}, inset 1px 1px 0 rgba(255,255,255,0.055), 0 0 12px ${palette.glow}`
          : `inset 2px 0 0 ${palette.fg}, inset 0 0 0 1px rgba(255,255,255,0.055)`,
      }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: palette.fg, boxShadow: `0 0 6px ${palette.fg}` }} />
      {label}
      <span className="tabular-nums" style={{ color: active ? 'var(--color-obs-text)' : 'var(--color-obs-text-muted)' }}>{count}</span>
    </button>
  )
}

// ─── Types (共有モジュールから再利用) ────────────────────────────────────────

interface LeadSourceStyle {
  Icon: React.ElementType
  label: string
  iconFg: string
}

const LEAD_SOURCE_STYLES: Record<LeadSourceType, LeadSourceStyle> = {
  web_form:       { Icon: FileEdit,      label: 'Webフォーム', iconFg: 'var(--color-obs-text-subtle)' },
  organic_search: { Icon: SearchIcon,    label: '自然検索',    iconFg: 'var(--color-obs-text-subtle)' },
  paid_ads:       { Icon: Megaphone,     label: '広告',        iconFg: 'var(--color-obs-primary)'    },
  sns:            { Icon: Share2,        label: 'SNS',         iconFg: 'var(--color-obs-text-subtle)' },
  event:          { Icon: Calendar,      label: '展示会・イベント', iconFg: 'var(--color-obs-middle)' },
  referral:       { Icon: UserCheck,     label: '紹介',        iconFg: '#4ad98a' },
  cold_call:      { Icon: PhoneOutgoing, label: '新規コール',   iconFg: 'var(--color-obs-text-subtle)' },
  cold_mail:      { Icon: Send,          label: '新規メール',   iconFg: 'var(--color-obs-text-subtle)' },
  partner:        { Icon: Handshake,     label: 'パートナー',   iconFg: 'var(--color-obs-text-subtle)' },
  inbound:        { Icon: Inbox,         label: '問い合わせ',   iconFg: 'var(--color-obs-low)' },
  other:          { Icon: HelpCircle,    label: 'その他',       iconFg: 'var(--color-obs-text-subtle)' },
}

type ChipTone = 'neutral' | 'hot' | 'middle' | 'low' | 'primary'

type SortKey = 'name' | 'callAttempts' | 'emailsSent' | 'lastCallAt' | 'nextActionAt' | 'status' | 'contactStatus' | 'owner'
type SortDir = 'asc' | 'desc'

const ALL_STATUSES: ApproachStatus[] = ['未着手', '不通', '不在', '接続済み', 'コール不可', 'アポ獲得', 'その他']
const ALL_CONTACT_STATUSES: ContactStatus[] = ['リード', '商談中', '顧客', '休眠', '失注']
const ALL_RANKS: Rank[] = ['A', 'B', 'C']

// ─── Tone Maps（Obsidian 準拠） ───────────────────────────────────────────────

function rankToTone(rank: Rank): ChipTone {
  if (rank === 'A') return 'hot'
  if (rank === 'B') return 'middle'
  return 'low'
}

function statusToTone(s: ApproachStatus): ChipTone {
  // アポ獲得/接続済み → low (neutral の青)
  // 不在 → middle
  // 不通/コール不可 → hot
  // 未着手 → neutral
  if (s === 'アポ獲得' || s === '接続済み') return 'low'
  if (s === '不在') return 'middle'
  if (s === '不通' || s === 'コール不可') return 'hot'
  return 'neutral'
}

function contactStatusToTone(s: ContactStatus): ChipTone {
  if (s === '商談中') return 'primary'
  if (s === '顧客') return 'low'
  if (s === 'リード') return 'low'
  if (s === '休眠') return 'neutral'
  return 'hot' // 失注
}

function MetaText({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="text-[12px] font-medium tracking-[-0.005em] whitespace-nowrap"
      style={{ color: 'var(--color-obs-text-muted)' }}
    >
      {children}
    </span>
  )
}

function getContactAvatarHue(name: string): number {
  let h = 0
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0
  return h % 360
}

function getContactAvatarColor(name: string): string {
  return `hsl(${getContactAvatarHue(name)}, 18%, 34%)`
}

function getContactAvatarBackground(name: string): string {
  const color = getContactAvatarColor(name)
  return `linear-gradient(145deg, color-mix(in srgb, ${color} 18%, #353437) 0%, rgba(27,27,29,0.96) 100%)`
}

function getContactAvatarGlow(name: string): string {
  const color = getContactAvatarColor(name)
  return `inset 0 0 0 1px color-mix(in srgb, ${color} 18%, rgba(171,199,255,0.12)), inset 1px 1px 0 rgba(255,255,255,0.055), inset -1px -1px 0 rgba(0,0,0,0.24), 0 8px 18px rgba(0,0,0,0.22)`
}

const ALL_NEXT_ACTIONS: Exclude<NextAction, null>[] = ['メールアプローチ', 'コール', '連絡待ち']
const ALL_PERSON_ROLES: PersonRole[] = ['決裁者', '推進者', '一般']

// リード経由(LeadSourceType)を日本語ラベルに変換
const LEAD_SOURCE_LABEL: Record<LeadSourceType, string> = {
  web_form: '問い合わせ',
  organic_search: '自然検索',
  paid_ads: '広告',
  sns: 'SNS',
  event: '展示会・イベント',
  referral: '紹介',
  cold_call: '新規コール',
  cold_mail: '新規メール',
  partner: 'パートナー',
  inbound: '問い合わせ',
  other: 'その他',
}
const ALL_LEAD_SOURCE_TYPES: LeadSourceType[] = [
  'inbound', 'web_form', 'organic_search', 'paid_ads', 'sns',
  'event', 'referral', 'cold_call', 'cold_mail', 'partner', 'other',
]
const ALL_SIGNALS: ('Hot' | 'Middle' | 'Low')[] = ['Hot', 'Middle', 'Low']
const SIGNAL_LABEL: Record<'Hot' | 'Middle' | 'Low', string> = {
  Hot: '強',
  Middle: '中',
  Low: '弱',
}

// ─── Sub-components ────────────────────────────────────────────────────────────

// 担当者ごとのアバター色 (タスク一覧の REPS と整合)
const OWNER_COLORS: Record<string, string> = {
  '田中太郎': '#abc7ff',
  '鈴木花子': '#c8b9ff',
  '佐藤次郎': '#8fc6ee',
}

function OwnerCell({ name }: { name: string }) {
  const color = OWNER_COLORS[name] ?? 'var(--color-obs-text-subtle)'
  const initial = name ? name[0] : '?'
  return (
    <div className="min-w-0 flex items-center gap-1.5" title={name}>
      <span
        className="inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold shrink-0"
        style={{
          background: `linear-gradient(145deg, color-mix(in srgb, ${color} 18%, var(--color-obs-surface-high)) 0%, var(--color-obs-surface-low) 100%)`,
          color: 'var(--color-obs-text)',
          boxShadow: `inset 1px 1px 0 rgba(255,255,255,0.08), inset -1px -1px 0 rgba(0,0,0,0.22), inset 0 0 0 1px color-mix(in srgb, ${color} 28%, transparent)`,
        }}
      >
        {initial}
      </span>
      <span className="text-[12px] truncate" style={{ color: 'var(--color-obs-text-muted)' }}>
        {name || '—'}
      </span>
    </div>
  )
}

function LeadSourceCell({ source }: { source: LeadSource }) {
  const s = LEAD_SOURCE_STYLES[source.type]
  const Icon = s.Icon
  return (
    <div className="min-w-0 flex items-center">
      <span
        className="inline-flex items-center gap-1.5 text-[12px] font-medium tracking-[-0.005em] whitespace-nowrap w-fit"
        style={{ color: 'var(--color-obs-text-muted)' }}
        title={source.detail}
      >
        <Icon size={11} strokeWidth={2.2} style={{ color: 'var(--color-obs-text-subtle)' }} />
        {s.label}
      </span>
    </div>
  )
}

function NextActionSelect({ value, onChange }: { value: NextAction; onChange: (v: NextAction) => void }) {
  const [open, setOpen] = useState(false)

  if (!value) {
    return (
      <div className="relative">
        <button
          onClick={() => setOpen(v => !v)}
          className="text-[12px] font-medium tracking-[-0.005em] transition-colors"
          style={{ color: 'var(--color-obs-text-muted)' }}
          onMouseOver={(e) => {
            ;(e.currentTarget as HTMLButtonElement).style.color = 'var(--color-obs-text)'
          }}
          onMouseOut={(e) => {
            ;(e.currentTarget as HTMLButtonElement).style.color = 'var(--color-obs-text-muted)'
          }}
        >
          + 設定
        </button>
        {open && (
          <>
            <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
            <div
              className="absolute top-full left-0 mt-1 z-40 py-1 min-w-[140px] rounded-[var(--radius-obs-md)]"
              style={menuSurfaceStyle()}
            >
              {ALL_NEXT_ACTIONS.map(a => (
                <button
                  key={a}
                  onClick={() => { onChange(a); setOpen(false) }}
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-[12px] text-left transition-colors"
                  style={{ color: 'var(--color-obs-text)' }}
                  onMouseOver={(e) => {
                    ;(e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--color-obs-surface-high)'
                  }}
                  onMouseOut={(e) => {
                    ;(e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent'
                  }}
                >
                  {a}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    )
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        className="inline-flex items-center text-[12px] font-medium tracking-[-0.005em] transition-colors"
        style={{ color: 'var(--color-obs-text-muted)' }}
        onMouseOver={(e) => {
          ;(e.currentTarget as HTMLButtonElement).style.color = 'var(--color-obs-text)'
        }}
        onMouseOut={(e) => {
          ;(e.currentTarget as HTMLButtonElement).style.color = 'var(--color-obs-text-muted)'
        }}
      >
        {value}
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div
            className="absolute top-full left-0 mt-1 z-40 py-1 min-w-[140px] rounded-[var(--radius-obs-md)]"
            style={menuSurfaceStyle()}
          >
            {ALL_NEXT_ACTIONS.map(a => {
              const selected = a === value
              return (
                <button
                  key={a}
                  onClick={() => { onChange(a); setOpen(false) }}
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-[12px] text-left transition-colors"
                  style={{ color: 'var(--color-obs-text)', fontWeight: selected ? 700 : 400 }}
                  onMouseOver={(e) => {
                    ;(e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--color-obs-surface-high)'
                  }}
                  onMouseOut={(e) => {
                    ;(e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent'
                  }}
                >
                  {a}
                </button>
              )
            })}
            <button
              onClick={() => { onChange(null); setOpen(false) }}
              className="w-full flex items-center gap-2 px-3 py-1.5 text-[12px] text-left transition-colors"
              style={{ color: 'var(--color-obs-text-muted)' }}
              onMouseOver={(e) => {
                ;(e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--color-obs-surface-high)'
              }}
              onMouseOut={(e) => {
                ;(e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent'
              }}
            >
              クリア
            </button>
          </div>
        </>
      )}
    </div>
  )
}

function SortIcon({ col, sortKey, sortDir }: { col: SortKey; sortKey: SortKey; sortDir: SortDir }) {
  if (col !== sortKey) return <ArrowUpDown size={11} className="ml-1 inline" style={{ color: 'var(--color-obs-text-subtle)' }} />
  return sortDir === 'asc'
    ? <ChevronUp size={11} className="ml-1 inline" style={{ color: 'var(--color-obs-primary)' }} />
    : <ChevronDown size={11} className="ml-1 inline" style={{ color: 'var(--color-obs-primary)' }} />
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function ContactsPage() {
  const router = useRouter()
  const [contacts, setContacts]           = useState<Contact[]>(MOCK_CONTACTS)
  const [search, setSearch]               = useState('')
  const [filterStatuses, setFilterStatuses] = useState<ApproachStatus[]>([])
  const [filterRanks, setFilterRanks]     = useState<Rank[]>([])
  const [filterDepartment, setFilterDepartment] = useState('')
  const [filterPersonRole, setFilterPersonRole] = useState<PersonRole | ''>('')
  // コール/メールの活動量フィルタ。'' = 全件、'0' = 0件のみ、それ以外は「N件以上」
  const [filterCallRange, setFilterCallRange] = useState<'' | '0' | '1' | '3' | '5'>('')
  const [filterEmailRange, setFilterEmailRange] = useState<'' | '0' | '1' | '3' | '5'>('')
  // 追加フィルタ: リード経由 / 1stシグナル / NEXT ACTION / 担当者
  const [filterLeadSource, setFilterLeadSource] = useState<LeadSourceType | ''>('')
  const [filterSignal, setFilterSignal] = useState<'Hot' | 'Middle' | 'Low' | ''>('')
  const [filterNextAction, setFilterNextAction] = useState<Exclude<NextAction, null> | ''>('')
  const [filterOwner, setFilterOwner] = useState<string>('')
  const [sortKey, setSortKey]             = useState<SortKey>('status')
  const [sortDir, setSortDir]             = useState<SortDir>('asc')
  const [filterContactStatuses, setFilterContactStatuses] = useState<ContactStatus[]>([])
  const [showStatusFilter, setShowStatusFilter] = useState(false)
  const [showRankFilter, setShowRankFilter]     = useState(false)
  const [showContactStatusFilter, setShowContactStatusFilter] = useState(false)

  // 求人インテントフィルタ(290万社DBと同じUI)— 紐付く企業のintent levelで絞り込み
  type IntentFilterKey = 'hot' | 'mid' | 'low'
  const [intentFilter, setIntentFilter] = useState<IntentFilterKey[]>([])
  const toggleIntentFilter = (k: IntentFilterKey) =>
    setIntentFilter((prev) => (prev.includes(k) ? prev.filter((x) => x !== k) : [...prev, k]))
  const intentCounts = useMemo(() => {
    const c = { hot: 0, mid: 0, low: 0, none: 0 }
    contacts.forEach((ct) => {
      const lv = getCompanyIntent(ct.company).level
      if (lv === 'HOT') c.hot++
      else if (lv === 'MID') c.mid++
      else if (lv === 'LOW') c.low++
      else c.none++
    })
    return c
  }, [contacts])

  // 部門のユニーク値
  const ALL_DEPARTMENTS = useMemo(() => Array.from(new Set(contacts.map(c => c.department).filter(Boolean))), [contacts])
  // 担当者のユニーク値
  const ALL_OWNERS = useMemo(() => Array.from(new Set(contacts.map(c => c.owner).filter(Boolean))), [contacts])
  const [showCreateModal, setShowCreateModal]   = useState(false)
  // ISリスト作成モーダル
  const [createListOpen, setCreateListOpen] = useState(false)
  // 一括選択（ISリスト作成の対象）
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [newListName, setNewListName] = useState('')
  const [newListAssignee, setNewListAssignee] = useState<string>('IS 三郎')
  const [creatingList, setCreatingList] = useState(false)
  const [createListMessage, setCreateListMessage] = useState<string | null>(null)
  const [createForm, setCreateForm] = useState({
    name: '', company: '', title: '', email: '', phone: '',
    rank: 'B' as Rank, contactStatus: 'リード' as ContactStatus, isDecisionMaker: false,
  })

  function handleCreateSubmit() {
    if (!createForm.name.trim() || !createForm.company.trim()) return
    const newContact: Contact = {
      id: `c-${Date.now()}`, name: createForm.name.trim(),
      title: createForm.title, department: '', personRole: '一般', company: createForm.company.trim(),
      companyId: `new-${Date.now()}`, rank: createForm.rank,
      status: '未着手', contactStatus: createForm.contactStatus, leadSource: { type: 'other', detail: '手動追加' }, callAttempts: 0, emailsSent: 0, lastCallAt: null, nextActionAt: null, nextAction: null,
      owner: '田中太郎',
    }
    setContacts(prev => [newContact, ...prev])
    setShowCreateModal(false)
    setCreateForm({ name: '', company: '', title: '', email: '', phone: '', rank: 'B', contactStatus: 'リード', isDecisionMaker: false })
  }

  // ── Filter + Sort ────────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let list = contacts

    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(c =>
        c.name.toLowerCase().includes(q) ||
        c.company.toLowerCase().includes(q) ||
        c.title.toLowerCase().includes(q)
      )
    }
    if (filterStatuses.length > 0) list = list.filter(c => filterStatuses.includes(c.status))
    if (filterContactStatuses.length > 0) list = list.filter(c => filterContactStatuses.includes(c.contactStatus))
    if (filterRanks.length > 0)    list = list.filter(c => filterRanks.includes(c.rank))
    if (filterDepartment)          list = list.filter(c => c.department === filterDepartment)
    if (filterPersonRole)          list = list.filter(c => c.personRole === filterPersonRole)
    if (filterCallRange === '0')   list = list.filter(c => c.callAttempts === 0)
    else if (filterCallRange)      list = list.filter(c => c.callAttempts >= Number(filterCallRange))
    if (filterEmailRange === '0')  list = list.filter(c => c.emailsSent === 0)
    else if (filterEmailRange)     list = list.filter(c => c.emailsSent >= Number(filterEmailRange))
    if (filterLeadSource)          list = list.filter(c => c.leadSource.type === filterLeadSource)
    if (filterSignal)              list = list.filter(c => getCompanyFirstPartySignal(c.company) === filterSignal)
    if (filterNextAction)          list = list.filter(c => c.nextAction === filterNextAction)
    if (filterOwner)               list = list.filter(c => c.owner === filterOwner)
    if (intentFilter.length > 0) {
      list = list.filter((c) => {
        const lv = getCompanyIntent(c.company).level
        if (lv === 'HOT' && intentFilter.includes('hot')) return true
        if (lv === 'MID' && intentFilter.includes('mid')) return true
        if (lv === 'LOW' && intentFilter.includes('low')) return true
        return false
      })
    }

    const STATUS_ORDER: Record<ApproachStatus, number> = {
      'アポ獲得': 0, '接続済み': 1,
      '不在': 2, '不通': 3, '未着手': 4, 'コール不可': 5, 'その他': 6,
    }

    list = [...list].sort((a, b) => {
      let cmp = 0
      if (sortKey === 'contactStatus') cmp = a.contactStatus.localeCompare(b.contactStatus, 'ja')
      if (sortKey === 'status')      cmp = STATUS_ORDER[a.status] - STATUS_ORDER[b.status]
      if (sortKey === 'name')        cmp = a.name.localeCompare(b.name, 'ja')
      if (sortKey === 'callAttempts') cmp = a.callAttempts - b.callAttempts
      if (sortKey === 'emailsSent') cmp = a.emailsSent - b.emailsSent
      if (sortKey === 'lastCallAt')  cmp = (a.lastCallAt ?? '').localeCompare(b.lastCallAt ?? '')
      if (sortKey === 'nextActionAt') cmp = (a.nextActionAt ?? '9999').localeCompare(b.nextActionAt ?? '9999')
      if (sortKey === 'owner')        cmp = a.owner.localeCompare(b.owner, 'ja')
      return sortDir === 'desc' ? -cmp : cmp
    })

    return list
  }, [contacts, search, filterStatuses, filterContactStatuses, filterRanks, filterDepartment, filterPersonRole, filterCallRange, filterEmailRange, filterLeadSource, filterSignal, filterNextAction, filterOwner, intentFilter, sortKey, sortDir])

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('asc') }
  }

  function toggleStatus(s: ApproachStatus) {
    setFilterStatuses(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])
  }
  function toggleRank(r: Rank) {
    setFilterRanks(prev => prev.includes(r) ? prev.filter(x => x !== r) : [...prev, r])
  }
  function toggleContactStatus(s: ContactStatus) {
    setFilterContactStatuses(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])
  }

  const hasFilters =
    filterStatuses.length > 0 ||
    filterRanks.length > 0 ||
    filterContactStatuses.length > 0 ||
    !!filterDepartment ||
    !!filterPersonRole ||
    !!filterCallRange ||
    !!filterEmailRange ||
    !!filterLeadSource ||
    !!filterSignal ||
    !!filterNextAction ||
    !!filterOwner

  return (
    <ObsPageShell>
      <div
        className="w-full min-h-[calc(100vh-56px)] px-8 xl:px-12 2xl:px-16 pb-16 pt-10"
        style={{
          backgroundColor: 'var(--color-obs-surface)',
          backgroundImage: SERVICE_PAGE_BACKGROUND,
        }}
        onClick={() => { setShowStatusFilter(false); setShowRankFilter(false); setShowContactStatusFilter(false) }}
      >
        {/* ── Hero ── */}
        <div className="mb-7 flex items-end justify-between gap-8">
          <div className="max-w-3xl">
            <span
              className="inline-flex items-center gap-2 text-[11px] font-semibold tracking-[0.16em] uppercase mb-3"
              style={{ color: 'var(--color-aurora)' }}
            >
              <span
                className="block w-1.5 h-1.5 rounded-full"
                style={{ background: 'var(--color-aurora)', boxShadow: '0 0 10px var(--color-aurora)' }}
              />
              Contacts
            </span>
            <h1
              className="font-[family-name:var(--font-display)] text-[2rem] sm:text-[2.75rem] md:text-[3.55rem] font-bold leading-[1.08] tracking-[-0.025em] mb-3 whitespace-nowrap"
            >
              <span style={{ color: '#e7e5ea' }}>コンタ</span>
              <span className="fo-gradient-text" style={{ WebkitTextFillColor: 'transparent' }}>クト</span>
            </h1>
            <p className="text-[14px] leading-relaxed max-w-none md:whitespace-nowrap" style={{ color: 'var(--color-obs-text-muted)' }}>
              {contacts.length.toLocaleString()}件のコンタクトを、求人インテント・1stシグナル・ステータス・次アクションで優先管理。
            </p>
          </div>
          <div className="shrink-0">
            <div className="flex items-center gap-3">
              {/* HOT/MID/LOW インテントフィルタ — 290万社DBと同じ */}
              <div
                className="inline-flex items-center gap-1.5 px-2 py-1.5 rounded-[var(--radius-obs-lg)] fo-glass-rim"
                style={{
                  background:
                    'linear-gradient(140deg, rgba(36,36,38,0.74) 0%, rgba(28,29,34,0.82) 100%)',
                  backdropFilter: 'blur(14px) saturate(130%)',
                  WebkitBackdropFilter: 'blur(14px) saturate(130%)',
                  boxShadow:
                    'inset 1px 1px 0 rgba(255,255,255,0.055), inset -1px -1px 0 rgba(0,0,0,0.24), 0 10px 26px rgba(0,0,0,0.18)',
                }}
                title="クリックでインテント別に絞り込み"
              >
                <span
                  className="hidden xl:inline-flex items-center gap-1.5 pl-1 pr-1.5 text-[10px] font-semibold tracking-[0.08em] uppercase"
                  style={{ color: 'var(--color-obs-text-subtle)' }}
                >
                  <Filter size={11} strokeWidth={2.2} />
                  Intent
                </span>
                <ContactsIntentFilterChip
                  active={intentFilter.includes('hot')}
                  tone="hot"
                  label="HOT"
                  count={intentCounts.hot}
                  onClick={() => toggleIntentFilter('hot')}
                />
                <ContactsIntentFilterChip
                  active={intentFilter.includes('mid')}
                  tone="middle"
                  label="MID"
                  count={intentCounts.mid}
                  onClick={() => toggleIntentFilter('mid')}
                />
                <ContactsIntentFilterChip
                  active={intentFilter.includes('low')}
                  tone="low"
                  label="LOW"
                  count={intentCounts.low}
                  onClick={() => toggleIntentFilter('low')}
                />
                {intentFilter.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setIntentFilter([])}
                    className="inline-flex items-center justify-center w-5 h-5 rounded-full transition-colors hover:bg-[var(--color-obs-surface-highest)]"
                    title="フィルタをクリア"
                    style={{ color: 'var(--color-obs-text-muted)' }}
                  >
                    <X size={10} strokeWidth={2.4} />
                  </button>
                )}
              </div>

              {/* ISリスト作成 — 選択中のコンタクトをリスト化（未選択時は disabled） */}
              <button
                type="button"
                onClick={() => { if (selectedIds.size > 0) setCreateListOpen(true) }}
                disabled={selectedIds.size === 0}
                title={
                  selectedIds.size === 0
                    ? '一覧から対象コンタクトを選択するとISリストを作成できます'
                    : `選択中の ${selectedIds.size} 名でISリストを作成`
                }
                className="h-9 px-4 text-sm rounded-[var(--radius-obs-md)] font-medium tracking-[-0.01em] inline-flex items-center transition-all duration-200 disabled:cursor-not-allowed"
                style={{
                  background: selectedIds.size === 0
                    ? FILTER_IDLE_BG
                    : FILTER_ACTIVE_BG,
                  color: selectedIds.size === 0 ? 'var(--color-obs-text-subtle)' : 'var(--color-obs-on-primary)',
                  boxShadow: selectedIds.size === 0
                    ? FILTER_IDLE_SHADOW
                    : FILTER_ACTIVE_SHADOW,
                  backdropFilter: 'blur(10px) saturate(130%)',
                  WebkitBackdropFilter: 'blur(10px) saturate(130%)',
                }}
                onMouseOver={(e) => {
                  if (selectedIds.size > 0) {
                    ;(e.currentTarget as HTMLButtonElement).style.filter = 'brightness(1.08)'
                  }
                }}
                onMouseOut={(e) => {
                  if (selectedIds.size > 0) {
                    ;(e.currentTarget as HTMLButtonElement).style.filter = 'none'
                  }
                }}
              >
                <List size={14} className="mr-1.5 inline" strokeWidth={2.5} />
                ISリスト作成
                {selectedIds.size > 0 && (
                  <span
                    className="ml-1.5 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1.5 rounded-full text-[10.5px] font-bold tabular-nums"
                    style={{
                      backgroundColor: 'rgba(255,255,255,0.16)',
                      color: 'var(--color-obs-on-primary)',
                    }}
                  >
                    {selectedIds.size}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setShowCreateModal(true)}
                className="h-9 px-4 rounded-[var(--radius-obs-md)] text-sm font-medium inline-flex items-center transition-colors duration-200"
                style={{
                  background: PRIMARY_BUTTON_BG,
                  color: '#05070a',
                  boxShadow:
                    'inset 0 1px 0 rgba(255,255,255,0.34), 0 0 0 1px rgba(171,199,255,0.22), 0 10px 26px -10px rgba(0,113,227,0.70), 0 0 28px rgba(171,199,255,0.18)',
                  transitionTimingFunction: 'var(--ease-liquid)',
                }}
              >
                <Plus size={14} className="mr-1.5 inline" strokeWidth={2.5} />
                コンタクトを追加
              </button>
            </div>
          </div>
        </div>

        {/* ── Toolbar ── */}
        <div className="flex items-center gap-2 mb-6 flex-wrap" onClick={e => e.stopPropagation()}>
          {/* Search */}
          <div className="relative flex-1 min-w-[280px] max-w-md">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: 'var(--color-obs-text-subtle)' }}
            />
            <ObsInput
              type="text"
              placeholder="氏名・会社名・役職で検索..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Status filter */}
          <div className="relative" onClick={e => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => { setShowStatusFilter(v => !v); setShowRankFilter(false); setShowContactStatusFilter(false) }}
              className="h-8 pl-3 pr-7 text-xs font-medium rounded-[var(--radius-obs-md)] inline-flex items-center transition-colors outline-none relative"
              style={filterControlStyle(filterStatuses.length > 0)}
            >
              ステータス
              {filterStatuses.length > 0 && (
                <span
                  className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full text-[10px] font-bold tabular-nums"
                  style={{ backgroundColor: 'rgba(255,255,255,0.20)', color: 'var(--color-obs-on-primary)' }}
                >
                  {filterStatuses.length}
                </span>
              )}
              <ChevronDown size={11} strokeWidth={2.2} className="absolute right-2 top-1/2 -translate-y-1/2" style={{ color: filterStatuses.length > 0 ? 'var(--color-obs-on-primary)' : 'var(--color-obs-text-subtle)' }} />
            </button>

            <AnimatePresence>
              {showStatusFilter && (
                <motion.div
                  initial={{ opacity: 0, y: -6, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.97 }}
                  transition={{ duration: 0.12 }}
                  className="absolute top-full mt-1.5 left-0 z-20 p-2 min-w-[160px] flex flex-col gap-0.5 rounded-[var(--radius-obs-md)]"
                  style={menuSurfaceStyle()}
                >
                  {ALL_STATUSES.map(s => {
                    const active = filterStatuses.includes(s)
                    return (
                      <button
                        key={s}
                        onClick={() => toggleStatus(s)}
                        className="flex items-center gap-2 px-2.5 py-1.5 rounded-[var(--radius-obs-sm)] text-[12px] text-left transition-colors"
                        style={{
                          backgroundColor: active ? 'var(--color-obs-surface-high)' : 'transparent',
                          color: 'var(--color-obs-text)',
                        }}
                        onMouseOver={(e) => {
                          if (!active) (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--color-obs-surface-high)'
                        }}
                        onMouseOut={(e) => {
                          if (!active) (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent'
                        }}
                      >
                        <ObsChip tone={statusToTone(s)}>{s}</ObsChip>
                      </button>
                    )
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Rank filter */}
          <div className="relative" onClick={e => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => { setShowRankFilter(v => !v); setShowStatusFilter(false); setShowContactStatusFilter(false) }}
              className="h-8 pl-3 pr-7 text-xs font-medium rounded-[var(--radius-obs-md)] inline-flex items-center transition-colors outline-none relative"
              style={filterControlStyle(filterRanks.length > 0)}
            >
              角度
              {filterRanks.length > 0 && (
                <span
                  className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full text-[10px] font-bold tabular-nums"
                  style={{ backgroundColor: 'rgba(255,255,255,0.20)', color: 'var(--color-obs-on-primary)' }}
                >
                  {filterRanks.length}
                </span>
              )}
              <ChevronDown size={11} strokeWidth={2.2} className="absolute right-2 top-1/2 -translate-y-1/2" style={{ color: filterRanks.length > 0 ? 'var(--color-obs-on-primary)' : 'var(--color-obs-text-subtle)' }} />
            </button>

            <AnimatePresence>
              {showRankFilter && (
                <motion.div
                  initial={{ opacity: 0, y: -6, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.97 }}
                  transition={{ duration: 0.12 }}
                  className="absolute top-full mt-1.5 left-0 z-20 p-2 flex gap-1 rounded-[var(--radius-obs-md)]"
                  style={menuSurfaceStyle()}
                >
                  {ALL_RANKS.map(r => {
                    const active = filterRanks.includes(r)
                    return (
                      <button
                        key={r}
                        onClick={() => toggleRank(r)}
                        className="inline-flex"
                      >
                        <ObsChip tone={active ? rankToTone(r) : 'neutral'} className="w-8 justify-center">
                          {r}
                        </ObsChip>
                      </button>
                    )
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Contact status filter */}
          <div className="relative" onClick={e => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => { setShowContactStatusFilter(v => !v); setShowStatusFilter(false); setShowRankFilter(false) }}
              className="h-8 pl-3 pr-7 text-xs font-medium rounded-[var(--radius-obs-md)] inline-flex items-center transition-colors outline-none relative"
              style={filterControlStyle(filterContactStatuses.length > 0)}
            >
              フェーズ
              {filterContactStatuses.length > 0 && (
                <span
                  className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full text-[10px] font-bold tabular-nums"
                  style={{ backgroundColor: 'rgba(255,255,255,0.20)', color: 'var(--color-obs-on-primary)' }}
                >
                  {filterContactStatuses.length}
                </span>
              )}
              <ChevronDown size={11} strokeWidth={2.2} className="absolute right-2 top-1/2 -translate-y-1/2" style={{ color: filterContactStatuses.length > 0 ? 'var(--color-obs-on-primary)' : 'var(--color-obs-text-subtle)' }} />
            </button>

            <AnimatePresence>
              {showContactStatusFilter && (
                <motion.div
                  initial={{ opacity: 0, y: -6, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.97 }}
                  transition={{ duration: 0.12 }}
                  className="absolute top-full mt-1.5 left-0 z-20 p-2 min-w-[140px] flex flex-col gap-0.5 rounded-[var(--radius-obs-md)]"
                  style={menuSurfaceStyle()}
                >
                  {ALL_CONTACT_STATUSES.map(s => {
                    const active = filterContactStatuses.includes(s)
                    return (
                      <button
                        key={s}
                        onClick={() => toggleContactStatus(s)}
                        className="flex items-center gap-2 px-2.5 py-1.5 rounded-[var(--radius-obs-sm)] text-[12px] text-left transition-colors"
                        style={{
                          backgroundColor: active ? 'var(--color-obs-surface-high)' : 'transparent',
                        }}
                        onMouseOver={(e) => {
                          if (!active) (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--color-obs-surface-high)'
                        }}
                        onMouseOut={(e) => {
                          if (!active) (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent'
                        }}
                      >
                        <ObsChip tone={contactStatusToTone(s)}>{s}</ObsChip>
                      </button>
                    )
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* 部門フィルター */}
          <div className="relative inline-flex items-center" onClick={e => e.stopPropagation()}>
            <select
            value={filterDepartment}
            onChange={e => setFilterDepartment(e.target.value)}
            onClick={e => e.stopPropagation()}
            className="h-8 pl-3 pr-7 text-xs font-medium rounded-[var(--radius-obs-md)] appearance-none cursor-pointer transition-colors outline-none"
            style={filterControlStyle(Boolean(filterDepartment))}
          >
            <option value="">部門</option>
            {ALL_DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
            <ChevronDown size={11} strokeWidth={2.2} className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2" style={{ color: filterDepartment ? 'var(--color-obs-on-primary)' : 'var(--color-obs-text-subtle)' }} />
          </div>

          {/* 役職フィルター */}
          <div className="relative inline-flex items-center" onClick={e => e.stopPropagation()}>
            <select
            value={filterPersonRole}
            onChange={e => setFilterPersonRole(e.target.value as PersonRole | '')}
            onClick={e => e.stopPropagation()}
            className="h-8 pl-3 pr-7 text-xs font-medium rounded-[var(--radius-obs-md)] appearance-none cursor-pointer transition-colors outline-none"
            style={filterControlStyle(Boolean(filterPersonRole))}
          >
            <option value="">役職</option>
            {ALL_PERSON_ROLES.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
            <ChevronDown size={11} strokeWidth={2.2} className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2" style={{ color: filterPersonRole ? 'var(--color-obs-on-primary)' : 'var(--color-obs-text-subtle)' }} />
          </div>

          {/* コール数フィルター */}
          <div className="relative inline-flex items-center" onClick={e => e.stopPropagation()}>
            <select
            value={filterCallRange}
            onChange={e => setFilterCallRange(e.target.value as '' | '0' | '1' | '3' | '5')}
            onClick={e => e.stopPropagation()}
            className="h-8 pl-3 pr-7 text-xs font-medium rounded-[var(--radius-obs-md)] appearance-none cursor-pointer transition-colors outline-none"
            style={filterControlStyle(Boolean(filterCallRange))}
          >
            <option value="">コール数</option>
            <option value="0">0件のみ</option>
            <option value="1">1件以上</option>
            <option value="3">3件以上</option>
            <option value="5">5件以上</option>
          </select>
            <ChevronDown size={11} strokeWidth={2.2} className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2" style={{ color: filterCallRange ? 'var(--color-obs-on-primary)' : 'var(--color-obs-text-subtle)' }} />
          </div>

          {/* メール数フィルター */}
          <div className="relative inline-flex items-center" onClick={e => e.stopPropagation()}>
            <select
            value={filterEmailRange}
            onChange={e => setFilterEmailRange(e.target.value as '' | '0' | '1' | '3' | '5')}
            onClick={e => e.stopPropagation()}
            className="h-8 pl-3 pr-7 text-xs font-medium rounded-[var(--radius-obs-md)] appearance-none cursor-pointer transition-colors outline-none"
            style={filterControlStyle(Boolean(filterEmailRange))}
          >
            <option value="">メール数</option>
            <option value="0">0件のみ</option>
            <option value="1">1件以上</option>
            <option value="3">3件以上</option>
            <option value="5">5件以上</option>
          </select>
            <ChevronDown size={11} strokeWidth={2.2} className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2" style={{ color: filterEmailRange ? 'var(--color-obs-on-primary)' : 'var(--color-obs-text-subtle)' }} />
          </div>

          {/* リード経由フィルター */}
          <div className="relative inline-flex items-center" onClick={e => e.stopPropagation()}>
            <select
            value={filterLeadSource}
            onChange={e => setFilterLeadSource(e.target.value as LeadSourceType | '')}
            onClick={e => e.stopPropagation()}
            className="h-8 pl-3 pr-7 text-xs font-medium rounded-[var(--radius-obs-md)] appearance-none cursor-pointer transition-colors outline-none"
            style={filterControlStyle(Boolean(filterLeadSource))}
          >
            <option value="">リード経由</option>
            {ALL_LEAD_SOURCE_TYPES.map(t => (
              <option key={t} value={t}>{LEAD_SOURCE_LABEL[t]}</option>
            ))}
          </select>
            <ChevronDown size={11} strokeWidth={2.2} className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2" style={{ color: filterLeadSource ? 'var(--color-obs-on-primary)' : 'var(--color-obs-text-subtle)' }} />
          </div>

          {/* 1stシグナルフィルター */}
          <div className="relative inline-flex items-center" onClick={e => e.stopPropagation()}>
            <select
            value={filterSignal}
            onChange={e => setFilterSignal(e.target.value as 'Hot' | 'Middle' | 'Low' | '')}
            onClick={e => e.stopPropagation()}
            className="h-8 pl-3 pr-7 text-xs font-medium rounded-[var(--radius-obs-md)] appearance-none cursor-pointer transition-colors outline-none"
            style={filterControlStyle(Boolean(filterSignal))}
          >
            <option value="">1stシグナル</option>
            {ALL_SIGNALS.map(s => (
              <option key={s} value={s}>{SIGNAL_LABEL[s]}</option>
            ))}
          </select>
            <ChevronDown size={11} strokeWidth={2.2} className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2" style={{ color: filterSignal ? 'var(--color-obs-on-primary)' : 'var(--color-obs-text-subtle)' }} />
          </div>

          {/* NEXT ACTION フィルター */}
          <div className="relative inline-flex items-center" onClick={e => e.stopPropagation()}>
            <select
            value={filterNextAction}
            onChange={e => setFilterNextAction(e.target.value as Exclude<NextAction, null> | '')}
            onClick={e => e.stopPropagation()}
            className="h-8 pl-3 pr-7 text-xs font-medium rounded-[var(--radius-obs-md)] appearance-none cursor-pointer transition-colors outline-none"
            style={filterControlStyle(Boolean(filterNextAction))}
          >
            <option value="">ネクスト</option>
            {ALL_NEXT_ACTIONS.map(a => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
            <ChevronDown size={11} strokeWidth={2.2} className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2" style={{ color: filterNextAction ? 'var(--color-obs-on-primary)' : 'var(--color-obs-text-subtle)' }} />
          </div>

          {/* 担当者フィルター */}
          <div className="relative inline-flex items-center" onClick={e => e.stopPropagation()}>
            <select
            value={filterOwner}
            onChange={e => setFilterOwner(e.target.value)}
            onClick={e => e.stopPropagation()}
            className="h-8 pl-3 pr-7 text-xs font-medium rounded-[var(--radius-obs-md)] appearance-none cursor-pointer transition-colors outline-none"
            style={filterControlStyle(Boolean(filterOwner))}
          >
            <option value="">担当者</option>
            {ALL_OWNERS.map(o => (
              <option key={o} value={o}>{o}</option>
            ))}
          </select>
            <ChevronDown size={11} strokeWidth={2.2} className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2" style={{ color: filterOwner ? 'var(--color-obs-on-primary)' : 'var(--color-obs-text-subtle)' }} />
          </div>

          {/* Clear filters */}
          <AnimatePresence>
            {hasFilters && (
              <motion.button
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.15 }}
                onClick={() => {
                  setFilterStatuses([])
                  setFilterContactStatuses([])
                  setFilterRanks([])
                  setFilterDepartment('')
                  setFilterPersonRole('')
                  setFilterCallRange('')
                  setFilterEmailRange('')
                  setFilterLeadSource('')
                  setFilterSignal('')
                  setFilterNextAction('')
                  setFilterOwner('')
                }}
                className="inline-flex items-center gap-1 h-8 px-3 rounded-[var(--radius-obs-md)] text-xs font-medium transition-colors whitespace-nowrap overflow-hidden"
                style={{ color: 'var(--color-obs-text-muted)' }}
                onMouseOver={(e) => {
                  ;(e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--color-obs-surface-high)'
                }}
                onMouseOut={(e) => {
                  ;(e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent'
                }}
              >
                <X size={12} />
                クリア
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {/* ── Result counter (一括選択アクション含む) ── */}
        <div className="mb-3 flex items-center gap-3 text-[12px] flex-wrap" style={{ color: 'var(--color-obs-text-subtle)' }}>
          {/* 一括選択アクション */}
          <div className="flex items-center gap-2">
            {selectedIds.size > 0 && (
              <button
                type="button"
                onClick={() => setSelectedIds(new Set())}
                className="inline-flex items-center gap-1 px-2 h-6 rounded-full text-[11px] font-semibold tabular-nums transition-colors"
                style={{
                  background: 'rgba(171,199,255,0.14)',
                  color: 'var(--color-obs-primary)',
                  boxShadow: 'inset 0 0 0 1px rgba(171,199,255,0.42)',
                }}
                onMouseOver={(e) => {
                  ;(e.currentTarget as HTMLButtonElement).style.background = 'rgba(171,199,255,0.22)'
                  ;(e.currentTarget as HTMLButtonElement).style.boxShadow = 'inset 0 0 0 1px rgba(171,199,255,0.55)'
                }}
                onMouseOut={(e) => {
                  ;(e.currentTarget as HTMLButtonElement).style.background = 'rgba(171,199,255,0.14)'
                  ;(e.currentTarget as HTMLButtonElement).style.boxShadow = 'inset 0 0 0 1px rgba(171,199,255,0.42)'
                }}
                title="クリックで選択をすべて解除"
              >
                <CheckSquare size={11} strokeWidth={2.4} />
                <span>{selectedIds.size.toLocaleString()}名選択中</span>
              </button>
            )}
            {/* 全選択（既に全件選択済みなら非表示） */}
            {selectedIds.size < filtered.length && (
              <button
                type="button"
                onClick={() => setSelectedIds(new Set(filtered.map((c) => c.id)))}
                className="inline-flex items-center gap-1 px-2.5 h-6 rounded-full text-[11px] font-medium transition-colors"
                style={{
                  color: 'var(--color-obs-text-muted)',
                  background: 'transparent',
                  boxShadow: 'inset 0 0 0 1px rgba(109,106,111,0.22)',
                }}
                onMouseOver={(e) => {
                  ;(e.currentTarget as HTMLButtonElement).style.background = 'var(--color-obs-surface-high)'
                  ;(e.currentTarget as HTMLButtonElement).style.color = 'var(--color-obs-text)'
                }}
                onMouseOut={(e) => {
                  ;(e.currentTarget as HTMLButtonElement).style.background = 'transparent'
                  ;(e.currentTarget as HTMLButtonElement).style.color = 'var(--color-obs-text-muted)'
                }}
                title={`絞り込み結果 ${filtered.length.toLocaleString()}名をすべて選択`}
              >
                {selectedIds.size > 0 ? (
                  <CheckSquare size={11} strokeWidth={2.2} />
                ) : (
                  <Square size={11} strokeWidth={2.2} />
                )}
                {selectedIds.size > 0
                  ? `残り${(filtered.length - selectedIds.size).toLocaleString()}名も選択`
                  : `${filtered.length.toLocaleString()}名すべて選択`}
              </button>
            )}
          </div>

          {/* 件数（companies/page.tsx と統一: フィルタ有無で表記切替） */}
          <span>
            {hasFilters ? (
              <>
                <span style={{ color: 'var(--color-obs-text)' }} className="font-medium tabular-nums">
                  {filtered.length.toLocaleString()}
                </span>
                件 <span className="opacity-60">/ 全{contacts.length.toLocaleString()}件</span>
              </>
            ) : (
              <>
                <span style={{ color: 'var(--color-obs-text)' }} className="font-medium tabular-nums">
                  {contacts.length.toLocaleString()}
                </span>
                件を表示中
              </>
            )}
          </span>
        </div>

        {/* ── Table ── */}
        <div
          className="rounded-[var(--radius-obs-xl)] overflow-hidden relative"
          style={{
            background: GLASS_TABLE_BG,
            backdropFilter: 'blur(22px) saturate(135%)',
            WebkitBackdropFilter: 'blur(22px) saturate(135%)',
            boxShadow: GLASS_TABLE_SHADOW,
          }}
        >
          <span
            aria-hidden
            className="pointer-events-none absolute left-6 right-6 top-0 h-px z-[2]"
            style={{
              background:
                'linear-gradient(90deg, transparent 0%, rgba(171,199,255,0.30) 50%, transparent 100%)',
            }}
          />
          <div className="w-full overflow-x-auto">
            <div className="min-w-[1400px]">
              {/* Header */}
              <div
                className="grid grid-cols-[32px_240px_minmax(160px,1fr)_110px_84px_96px_104px_124px_124px_112px_56px_56px] gap-x-3 px-5 py-3 text-[11px] font-medium tracking-[0.1em] uppercase"
                style={{
                  color: TABLE_HEADER_TEXT_COLOR,
                  background:
                    'linear-gradient(90deg, rgba(171,199,255,0.055) 0%, rgba(171,199,255,0.014) 100%), rgba(14,15,19,0.88)',
                  backdropFilter: 'blur(18px) saturate(130%)',
                  WebkitBackdropFilter: 'blur(18px) saturate(130%)',
                  boxShadow: 'inset 0 -1px 0 rgba(171,199,255,0.08)',
                }}
              >
                {/* 全選択チェックボックス */}
                <button
                  type="button"
                  onClick={() => {
                    const ids = filtered.map((c) => c.id)
                    const allSelected = ids.length > 0 && ids.every((id) => selectedIds.has(id))
                    setSelectedIds((prev) => {
                      const next = new Set(prev)
                      if (allSelected) ids.forEach((id) => next.delete(id))
                      else ids.forEach((id) => next.add(id))
                      return next
                    })
                  }}
                  className="inline-flex items-center justify-center w-5 h-5 rounded transition-colors hover:bg-[var(--color-obs-surface-high)]"
                  title="一覧の全件を選択 / 解除"
                >
                  {filtered.length > 0 && filtered.every((c) => selectedIds.has(c.id)) ? (
                    <CheckSquare size={13} style={{ color: 'var(--color-obs-primary)' }} />
                  ) : (
                    <Square size={13} style={{ color: 'var(--color-obs-text-subtle)' }} />
                  )}
                </button>
                {[
                  { label: '氏名',          key: 'name' as SortKey,         sortable: true },
                  { label: 'リード経由',     key: null,                       sortable: false },
                  { label: '求人インテント', key: null,                       sortable: false },
                  { label: '1st シグナル',   key: null,                       sortable: false },
                  { label: '部門',          key: null,                       sortable: false },
                  { label: '役職',          key: null,                       sortable: false },
                  { label: 'ステータス',     key: 'status' as SortKey,       sortable: true },
                  { label: 'Next Action',  key: null,                       sortable: false },
                  { label: '担当者',        key: 'owner' as SortKey,        sortable: true },
                  { label: 'コール',        key: 'callAttempts' as SortKey, sortable: true },
                  { label: 'メール',        key: 'emailsSent' as SortKey,   sortable: true },
                ].map((col, i) => (
                  <div
                    key={i}
                    className={`leading-none flex items-center ${
                      col.sortable ? 'cursor-pointer select-none transition-colors' : ''
                    }`}
                    style={{ color: TABLE_HEADER_TEXT_COLOR }}
                    onClick={col.key ? () => toggleSort(col.key as SortKey) : undefined}
                    onMouseOver={col.sortable ? (e) => {
                      ;(e.currentTarget as HTMLDivElement).style.color = TABLE_HEADER_TEXT_HOVER
                    } : undefined}
                    onMouseOut={col.sortable ? (e) => {
                      ;(e.currentTarget as HTMLDivElement).style.color = TABLE_HEADER_TEXT_COLOR
                    } : undefined}
                  >
                    {col.label}
                    {col.sortable && col.key && <SortIcon col={col.key} sortKey={sortKey} sortDir={sortDir} />}
                  </div>
                ))}
              </div>

              {/* Rows */}
              <motion.div
                initial="hidden"
                animate="visible"
                variants={{ visible: { transition: { staggerChildren: 0.04 } } }}
              >
                {filtered.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 gap-3">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: 'var(--color-obs-surface-high)' }}
                    >
                      <User size={22} style={{ color: 'var(--color-obs-text-subtle)' }} />
                    </div>
                    <p className="text-sm" style={{ color: 'var(--color-obs-text-muted)' }}>
                      条件に一致するコンタクトが見つかりません
                    </p>
                  </div>
                ) : (
                  filtered.map((contact) => {
                    const dnc = contact.status === 'コール不可'
                    const isSelected = selectedIds.has(contact.id)

                    return (
                      <motion.div
                        key={contact.id}
                        variants={{
                          hidden: { opacity: 0, y: 8 },
                          visible: { opacity: 1, y: 0, transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1] } },
                        }}
                        onClick={() => router.push(`/contacts/${contact.id}`)}
                        className={`grid grid-cols-[32px_240px_minmax(160px,1fr)_110px_84px_96px_104px_124px_124px_112px_56px_56px] gap-x-3 items-center px-5 py-3.5 transition-colors duration-150 group cursor-pointer ${dnc ? 'opacity-35' : ''}`}
                        style={{
                          transitionTimingFunction: 'var(--ease-liquid)',
                          boxShadow: isSelected
                            ? 'inset 2px 0 0 rgba(171,199,255,0.82), inset 0 -1px 0 rgba(171,199,255,0.08)'
                            : 'inset 0 -1px 0 0 rgba(171,199,255,0.055)',
                          background: isSelected
                            ? 'linear-gradient(90deg, rgba(171,199,255,0.070) 0%, rgba(0,113,227,0.035) 100%)'
                            : 'transparent',
                        }}
                        onMouseOver={(e) => {
                          if (!dnc) (e.currentTarget as HTMLDivElement).style.background =
                            'linear-gradient(90deg, rgba(171,199,255,0.050) 0%, rgba(255,255,255,0.012) 100%)'
                        }}
                        onMouseOut={(e) => {
                          ;(e.currentTarget as HTMLDivElement).style.background = isSelected
                            ? 'linear-gradient(90deg, rgba(171,199,255,0.070) 0%, rgba(0,113,227,0.035) 100%)'
                            : 'transparent'
                        }}
                      >
                        {/* 行選択チェックボックス */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedIds((prev) => {
                              const next = new Set(prev)
                              if (next.has(contact.id)) next.delete(contact.id)
                              else next.add(contact.id)
                              return next
                            })
                          }}
                          className="inline-flex items-center justify-center w-5 h-5 rounded transition-colors hover:bg-[var(--color-obs-surface-highest)]"
                          title={isSelected ? '選択を解除' : '選択'}
                        >
                          {isSelected ? (
                            <CheckSquare size={13} style={{ color: 'var(--color-obs-primary)' }} />
                          ) : (
                            <Square size={13} style={{ color: 'var(--color-obs-text-subtle)' }} />
                          )}
                        </button>

                        {/* 氏名 + 会社名(下) */}
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div
                            className="w-7 h-7 rounded-[var(--radius-obs-md)] flex items-center justify-center shrink-0 text-[11px] font-semibold"
                            style={{
                              background: getContactAvatarBackground(contact.name),
                              color: '#e7e5ea',
                              boxShadow: getContactAvatarGlow(contact.name),
                            }}
                          >
                            {contact.name[0]}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-[13.5px] font-medium truncate leading-tight tracking-[-0.01em]" style={{ color: 'var(--color-obs-text)' }}>
                              {contact.name}
                            </p>
                            <p className="text-[11.5px] truncate" style={{ color: 'var(--color-obs-text-subtle)' }}>
                              {contact.company}
                            </p>
                          </div>
                        </div>

                        {/* リード経由 */}
                        <LeadSourceCell source={contact.leadSource} />

                        {/* 求人インテント */}
                        <div onClick={(e) => e.stopPropagation()}>
                          <IntentChip companyName={contact.company} />
                        </div>

                        {/* 1st パーティーシグナル */}
                        <div onClick={(e) => e.stopPropagation()}>
                          <FirstPartySignalCell companyName={contact.company} />
                        </div>

                        {/* 部門 */}
                        <span className="text-[12px] truncate" style={{ color: 'var(--color-obs-text-muted)' }}>
                          {contact.department || '—'}
                        </span>

                        {/* 役職 */}
                        <div>
                          <MetaText>{contact.personRole}</MetaText>
                        </div>

                        {/* アプローチ */}
                        <div>
                          <MetaText>{contact.status}</MetaText>
                        </div>

                        {/* Next Action */}
                        <div onClick={e => e.stopPropagation()}>
                          <NextActionSelect
                            value={contact.nextAction}
                            onChange={val => setContacts(prev => prev.map(c => c.id === contact.id ? { ...c, nextAction: val } : c))}
                          />
                        </div>

                        {/* 担当者 */}
                        <OwnerCell name={contact.owner} />

                        {/* コール数 */}
                        <div className="flex items-center gap-1">
                          <Phone size={11} className="shrink-0" style={{ color: 'var(--color-obs-text-subtle)' }} />
                          <span
                            className="text-[13px] font-semibold tabular-nums"
                            style={{ color: 'rgba(231,229,234,0.70)' }}
                          >
                            {contact.callAttempts}
                          </span>
                        </div>

                        {/* メール送信数 */}
                        <div className="flex items-center gap-1">
                          <Mail size={11} className="shrink-0" style={{ color: 'var(--color-obs-text-subtle)' }} />
                          <span
                            className="text-[13px] font-semibold tabular-nums"
                            style={{ color: 'rgba(231,229,234,0.70)' }}
                          >
                            {contact.emailsSent}
                          </span>
                        </div>
                      </motion.div>
                    )
                  })
                )}
              </motion.div>
            </div>
          </div>
        </div>

        {/* ── Create Contact Modal ── */}
        <AnimatePresence>
          {showCreateModal && (
            <>
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
                onClick={() => setShowCreateModal(false)}
              />
              <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none p-4">
                <motion.div
                  initial={{ opacity: 0, scale: 0.96, y: 8 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96, y: 8 }}
                  transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                  className="w-full max-w-[480px] rounded-[var(--radius-obs-xl)] overflow-hidden pointer-events-auto"
                  style={{
                    background: MENU_SURFACE,
                    backdropFilter: 'blur(22px) saturate(135%)',
                    WebkitBackdropFilter: 'blur(22px) saturate(135%)',
                    boxShadow: MENU_SHADOW,
                  }}
                >
                  {/* Header */}
                  <div
                    className="flex items-center justify-between px-6 py-4"
                    style={{ boxShadow: 'inset 0 -1px 0 0 var(--color-obs-surface-low)' }}
                  >
                    <h2 className="text-[16px] font-bold" style={{ color: 'var(--color-obs-text)' }}>
                      コンタクトを追加
                    </h2>
                    <button
                      onClick={() => setShowCreateModal(false)}
                      className="w-7 h-7 rounded-full flex items-center justify-center transition-colors"
                      onMouseOver={(e) => {
                        ;(e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--color-obs-surface-high)'
                      }}
                      onMouseOut={(e) => {
                        ;(e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent'
                      }}
                    >
                      <X size={15} style={{ color: 'var(--color-obs-text-muted)' }} />
                    </button>
                  </div>

                  {/* Body */}
                  <div className="px-6 py-4 space-y-3">
                    {/* 名前 */}
                    <div>
                      <label
                        className="text-[11px] font-medium uppercase tracking-[0.05em] block mb-1.5"
                        style={{ color: 'var(--color-obs-text-subtle)' }}
                      >
                        氏名 <span style={{ color: 'var(--color-obs-hot)' }}>*</span>
                      </label>
                      <ObsInput
                        type="text"
                        placeholder="田中 誠"
                        value={createForm.name}
                        onChange={e => setCreateForm(f => ({ ...f, name: e.target.value }))}
                      />
                    </div>
                    {/* 会社 */}
                    <div>
                      <label
                        className="text-[11px] font-medium uppercase tracking-[0.05em] block mb-1.5"
                        style={{ color: 'var(--color-obs-text-subtle)' }}
                      >
                        会社名 <span style={{ color: 'var(--color-obs-hot)' }}>*</span>
                      </label>
                      <ObsInput
                        type="text"
                        placeholder="株式会社テクノリード"
                        value={createForm.company}
                        onChange={e => setCreateForm(f => ({ ...f, company: e.target.value }))}
                      />
                    </div>
                    {/* 役職 + 角度 */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label
                          className="text-[11px] font-medium uppercase tracking-[0.05em] block mb-1.5"
                          style={{ color: 'var(--color-obs-text-subtle)' }}
                        >
                          役職
                        </label>
                        <ObsInput
                          type="text"
                          placeholder="営業部長"
                          value={createForm.title}
                          onChange={e => setCreateForm(f => ({ ...f, title: e.target.value }))}
                        />
                      </div>
                      <div>
                        <label
                          className="text-[11px] font-medium uppercase tracking-[0.05em] block mb-1.5"
                          style={{ color: 'var(--color-obs-text-subtle)' }}
                        >
                          角度
                        </label>
                        <select
                          value={createForm.rank}
                          onChange={e => setCreateForm(f => ({ ...f, rank: e.target.value as Rank }))}
                          className="w-full h-10 px-4 rounded-[var(--radius-obs-md)] text-sm outline-none"
                          style={{
                            backgroundColor: 'var(--color-obs-surface-lowest)',
                            color: 'var(--color-obs-text)',
                            boxShadow: 'inset 0 0 0 1px rgba(109,106,111,0.12)',
                          }}
                        >
                          {ALL_RANKS.map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                      </div>
                    </div>
                    {/* 電話 + メール */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label
                          className="text-[11px] font-medium uppercase tracking-[0.05em] block mb-1.5"
                          style={{ color: 'var(--color-obs-text-subtle)' }}
                        >
                          電話番号
                        </label>
                        <ObsInput
                          type="tel"
                          placeholder="03-1234-5678"
                          value={createForm.phone}
                          onChange={e => setCreateForm(f => ({ ...f, phone: e.target.value }))}
                        />
                      </div>
                      <div>
                        <label
                          className="text-[11px] font-medium uppercase tracking-[0.05em] block mb-1.5"
                          style={{ color: 'var(--color-obs-text-subtle)' }}
                        >
                          メールアドレス
                        </label>
                        <ObsInput
                          type="email"
                          placeholder="tanaka@example.com"
                          value={createForm.email}
                          onChange={e => setCreateForm(f => ({ ...f, email: e.target.value }))}
                        />
                      </div>
                    </div>
                    {/* 決裁者 */}
                    <label className="flex items-center gap-2.5 cursor-pointer py-1">
                      <input
                        type="checkbox"
                        checked={createForm.isDecisionMaker}
                        onChange={e => setCreateForm(f => ({ ...f, isDecisionMaker: e.target.checked }))}
                        className="w-4 h-4 rounded accent-[var(--color-obs-primary-container)]"
                      />
                      <span className="text-sm" style={{ color: 'var(--color-obs-text)' }}>決裁者</span>
                    </label>
                  </div>

                  {/* Footer */}
                  <div
                    className="flex items-center justify-end gap-2 px-6 py-4"
                    style={{ boxShadow: 'inset 0 1px 0 0 var(--color-obs-surface-low)' }}
                  >
                    <ObsButton variant="ghost" onClick={() => setShowCreateModal(false)}>
                      キャンセル
                    </ObsButton>
                    <ObsButton
                      variant="primary"
                      onClick={handleCreateSubmit}
                      disabled={!createForm.name.trim() || !createForm.company.trim()}
                    >
                      追加する
                    </ObsButton>
                  </div>
                </motion.div>
              </div>
            </>
          )}
        </AnimatePresence>

        {/* ── ISリスト作成モーダル ─────────────────────────── */}
        {createListOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={() => !creatingList && setCreateListOpen(false)}
          >
            <div
              className="absolute inset-0"
              style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
            />
            <div
              className="relative w-full max-w-[460px] rounded-[var(--radius-obs-xl)] overflow-hidden"
              style={{
                background: MENU_SURFACE,
                backdropFilter: 'blur(22px) saturate(135%)',
                WebkitBackdropFilter: 'blur(22px) saturate(135%)',
                boxShadow: MENU_SHADOW,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div
                className="px-5 py-4"
                style={{ boxShadow: 'inset 0 -1px 0 var(--color-obs-surface-low)' }}
              >
                <h2 className="text-[16px] font-bold" style={{ color: 'var(--color-obs-text)' }}>
                  ISリストを作成
                </h2>
                <p className="text-[13px] mt-2 inline-flex items-center gap-1.5" style={{ color: 'var(--color-obs-text)' }}>
                  選択中の
                  <span
                    className="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-[12.5px] font-bold tabular-nums"
                    style={{
                      background: 'rgba(171,199,255,0.16)',
                      color: 'var(--color-obs-primary)',
                      boxShadow: 'inset 0 0 0 1px rgba(171,199,255,0.42)',
                    }}
                  >
                    {selectedIds.size.toLocaleString()} 名
                  </span>
                  のコンタクトを ISリストとして保存します
                </p>
              </div>
              <div className="px-5 py-4 space-y-3">
                <label className="block">
                  <span
                    className="text-[11px] font-bold uppercase tracking-[0.06em]"
                    style={{ color: 'var(--color-obs-text-subtle)' }}
                  >
                    リスト名
                  </span>
                  <input
                    type="text"
                    autoFocus
                    value={newListName}
                    onChange={(e) => setNewListName(e.target.value)}
                    placeholder="例: HOT 2026Q2 アプローチ対象"
                    className="mt-1.5 w-full px-3 py-2 rounded-[8px] text-[13px] outline-none"
                    style={{
                      background: 'var(--color-obs-surface-lowest)',
                      color: 'var(--color-obs-text)',
                      boxShadow: 'inset 0 0 0 1px rgba(109,106,111,0.18)',
                    }}
                  />
                </label>

                <label className="block">
                  <span
                    className="text-[11px] font-bold uppercase tracking-[0.06em]"
                    style={{ color: 'var(--color-obs-text-subtle)' }}
                  >
                    IS担当者
                  </span>
                  <select
                    value={newListAssignee}
                    onChange={(e) => setNewListAssignee(e.target.value)}
                    className="mt-1.5 w-full px-3 py-2 rounded-[8px] text-[13px] outline-none cursor-pointer"
                    style={{
                      background: 'var(--color-obs-surface-lowest)',
                      color: 'var(--color-obs-text)',
                      boxShadow: 'inset 0 0 0 1px rgba(109,106,111,0.18)',
                    }}
                  >
                    {LIST_MEMBERS.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </label>

                {createListMessage && (
                  <p
                    className="text-[12px]"
                    style={{ color: 'var(--color-obs-text-muted)' }}
                  >
                    {createListMessage}
                  </p>
                )}
              </div>
              <div
                className="flex justify-end gap-2 px-5 py-4"
                style={{ boxShadow: 'inset 0 1px 0 var(--color-obs-surface-low)' }}
              >
                <ObsButton
                  variant="ghost"
                  onClick={() => setCreateListOpen(false)}
                  disabled={creatingList}
                >
                  キャンセル
                </ObsButton>
                <ObsButton
                  variant="primary"
                  disabled={!newListName.trim() || creatingList}
                  onClick={() => {
                    setCreatingList(true)
                    setCreateListMessage(null)
                    try {
                      const ids = Array.from(selectedIds)
                      // モック: localStorage に保存（後で /api/lists エンドポイントに置き換え可能）
                      const key = 'fo.contacts.is_lists.v1'
                      const existing = JSON.parse(
                        localStorage.getItem(key) ?? '[]',
                      ) as Array<{
                        id: string
                        name: string
                        contactIds: string[]
                        createdAt: string
                        assignee?: string
                      }>
                      existing.unshift({
                        id: `list-${Date.now()}`,
                        name: newListName.trim(),
                        contactIds: ids,
                        createdAt: new Date().toISOString(),
                        assignee: newListAssignee,
                      })
                      localStorage.setItem(key, JSON.stringify(existing))
                      setCreateListMessage(
                        `✓ ${ids.length} 名のリスト「${newListName.trim()}」を作成しました`,
                      )
                      setNewListName('')
                      setSelectedIds(new Set())
                      setTimeout(() => {
                        setCreateListOpen(false)
                        setCreateListMessage(null)
                      }, 1200)
                    } catch (e) {
                      setCreateListMessage(`✗ エラー: ${(e as Error).message}`)
                    } finally {
                      setCreatingList(false)
                    }
                  }}
                >
                  {creatingList ? '作成中...' : 'リスト作成'}
                </ObsButton>
              </div>
            </div>
          </div>
        )}
      </div>
    </ObsPageShell>
  )
}
