'use client'
import { ResearchChatPanel } from '@/components/research/ResearchChatPanel'

import React, { useState, useMemo, useEffect, useRef } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronLeft,
  ChevronDown,
  Phone,
  Mail,
  Building2,
  PhoneCall,
  Star,
  CalendarClock,
  Pencil,
  X,
  CheckCircle2,
  Search,
  Megaphone,
  Calendar,
  Inbox,
  Globe,
  Plus,
  Trash2,
  Tag,
  Paperclip,
  Video,
  BookOpen,
  FileText,
} from 'lucide-react'
import type { ApproachStatus } from '@/types/crm'

// ─── Liquid Obsidian Status Chip ───────────────────────────────────────────────
// 全ステータスバッジは「薄い同色背景 + ●ドット + 同色文字」の統一フォーマット。
// グラデや glow / borderColor / textShadow は使わない。

interface ObsChipStyle {
  bg: string
  fg: string
}

const STATUS_OBS_STYLES: Record<ApproachStatus, ObsChipStyle> = {
  '未着手':     { bg: 'rgba(143,140,144,0.14)', fg: 'var(--color-obs-text-muted)' },
  '不通':       { bg: 'rgba(255,107,107,0.14)', fg: 'var(--color-obs-hot)' },
  '不在':       { bg: 'rgba(255,184,107,0.14)', fg: 'var(--color-obs-middle)' },
  '接続済み':   { bg: 'rgba(126,198,255,0.14)', fg: 'var(--color-obs-low)' },
  'コール不可': { bg: 'rgba(255,107,107,0.14)', fg: 'var(--color-obs-hot)' },
  'アポ獲得':   { bg: 'rgba(74,217,138,0.14)',  fg: '#4ad98a' },
  'その他':     { bg: 'rgba(143,140,144,0.14)', fg: 'var(--color-obs-text-muted)' },
}

function StatusObsBadge({ status, size = 'md' }: { status: ApproachStatus; size?: 'sm' | 'md' }) {
  const s = STATUS_OBS_STYLES[status] ?? STATUS_OBS_STYLES['未着手']
  const fontSize = size === 'sm' ? 'text-[10px]' : 'text-[11px]'
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 h-5 rounded-full font-medium tracking-[-0.005em] whitespace-nowrap ${fontSize}`}
      style={{ backgroundColor: s.bg, color: s.fg }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: s.fg }} />
      {status}
    </span>
  )
}

// ─── Types ─────────────────────────────────────────────────────────────────────

// 取引詳細のタスクモーダルを再利用 (タスク作成 UI を統一)
import { DealTaskModal, DEAL_TASK_TYPE_STYLES, type DealTask } from '@/app/(app)/deals/[id]/page'

type NextActionValue = string | null
type PersonRole = '決裁者' | '推進者' | '一般'

// 角度 — A / B / C / プラス / 設定なし
type ContactRank = 'A' | 'B' | 'C' | 'プラス' | null

// リード経由元: 大分類（category）＋ サブカテゴリ（sub）の2段構成
// 大分類: 組み込み3種（ホームページ/イベント/広告）＋ ユーザーがカスタム追加可能
// サブ: ホームページのみ既定2項目（資料請求/問い合わせ・編集削除不可）。
//        他カテゴリはカスタム追加のみ。
// カスタムは localStorage に永続化。

interface LeadSource {
  category: string  // 組み込み id ('homepage' | 'event' | 'ad') または 'custom_xxx'
  sub: string
}

interface ContactDetail {
  id: string
  name: string
  title: string
  department: string
  company: string
  companyId: string
  email: string
  phone: string
  rank: ContactRank
  status: ApproachStatus
  statusMemo: string
  nextAction: NextActionValue
  nextActionMemo: string
  callAttempts: number
  mailCount: number
  lastCallAt: string | null
  nextActionAt: string | null
  personRole: PersonRole
  leadSource: LeadSource
  owner: string  // IS担当者
  handoverNote: string  // 後続担当への申し送り事項
}

// IS担当者リスト (タスク一覧の REPS と整合)
const IS_OWNERS = [
  { name: '田中太郎', color: 'var(--color-obs-primary)' },
  { name: '鈴木花子', color: 'var(--color-obs-middle)' },
  { name: '佐藤次郎', color: 'var(--color-obs-low)' },
] as const

// ─── Lead Source Style ─────────────────────────────────────────────────────────
// 全タイプ共通: surface-high 相当の薄い neutral 下地 + アイコン色だけ大分類を表す
const LEAD_SOURCE_CHIP_BG = 'rgba(143,140,144,0.10)'
const LEAD_SOURCE_FG = 'var(--color-obs-text-muted)'

// 組み込み大分類 — 削除不可
const BUILTIN_CATEGORY_IDS = ['homepage', 'event', 'webinar', 'media', 'ad'] as const
type BuiltinCategoryId = typeof BUILTIN_CATEGORY_IDS[number]

const BUILTIN_CATEGORY_META: Record<BuiltinCategoryId, {
  label: string
  Icon: React.ElementType
  iconFg: string
  defaultSubs: readonly string[]
}> = {
  homepage: {
    label: 'ホームページ', Icon: Globe, iconFg: 'var(--color-obs-primary)',
    // 編集・削除不可のデフォルト
    defaultSubs: ['資料請求', '問い合わせ'],
  },
  event: {
    label: 'イベント・展示会', Icon: Calendar, iconFg: 'var(--color-obs-middle)',
    defaultSubs: [],
  },
  webinar: {
    label: 'ウェビナー・セミナー', Icon: Video, iconFg: 'var(--color-obs-low)',
    defaultSubs: [],
  },
  media: {
    label: '掲載媒体', Icon: BookOpen, iconFg: '#4ad98a',
    defaultSubs: [],
  },
  ad: {
    label: '広告', Icon: Megaphone, iconFg: 'var(--color-obs-primary-dim)',
    defaultSubs: [],
  },
}

// カスタム大分類のメタ（label のみ。アイコンは共通の Tag で表示）
interface CustomCategoryDef {
  id: string
  label: string
}

const CUSTOM_CATEGORIES_KEY = 'fo.contacts.lead_source_custom_categories.v1'
const CUSTOM_SUBS_KEY      = 'fo.contacts.lead_source_custom_subs.v1'

// モック表示で使う「展示会」「検索広告」をシードしてあげる（初回のみ）

function isBuiltinCategory(id: string): id is BuiltinCategoryId {
  return (BUILTIN_CATEGORY_IDS as readonly string[]).includes(id)
}

// ─── Mock Data ─────────────────────────────────────────────────────────────────

const MOCK_CONTACTS: Record<string, ContactDetail> = {
  '1': {
    id: '1', name: '田中 誠', title: '営業部長', department: '営業部',
    company: '株式会社テクノリード', companyId: '1',
    email: 'tanaka@techno-lead.co.jp', phone: '03-1234-5678',
    rank: 'A', status: 'アポ獲得', statusMemo: '3/28 14:00 商談設定済み。Google Meet URL送付済み。',
    nextAction: null, nextActionMemo: '',
    callAttempts: 3, mailCount: 12, lastCallAt: '2026-03-20', nextActionAt: '2026-03-28',
    personRole: '決裁者',
    leadSource: { category: 'homepage', sub: 'Webフォーム' },
    owner: '田中太郎',
    handoverNote: '営業部長として最終決裁権を持つ。比較表は既に送付済み。次は鈴木様(CTO)を巻き込んでクロージングフェーズへ。',
  },
  '2': {
    id: '2', name: '山本 佳子', title: 'マネージャー', department: '購買部',
    company: '合同会社フューチャー', companyId: '2',
    email: 'yamamoto@future-llc.jp', phone: '06-2345-6789',
    rank: 'A', status: '接続済み', statusMemo: '初回コンタクト完了。提案資料の希望あり。',
    nextAction: null, nextActionMemo: '',
    callAttempts: 5, mailCount: 8, lastCallAt: '2026-03-19', nextActionAt: '2026-03-22',
    personRole: '推進者',
    leadSource: { category: 'event', sub: '展示会' },
    owner: '鈴木花子',
    handoverNote: '展示会で名刺交換した本人。提案資料を希望されており、温度感は中。次回MTGで予算感をヒアリング予定。',
  },
  '3': {
    id: '3', name: '佐々木 拓也', title: '事業企画 部長', department: '経営企画部',
    company: '株式会社ノヴァソリューションズ', companyId: '3',
    email: 'sasaki@nova-solutions.jp', phone: '03-3456-7890',
    rank: 'B', status: '未着手', statusMemo: '紹介元(株式会社グロース)から「決裁ライン直結」と聞いている。',
    nextAction: 'コール', nextActionMemo: '',
    callAttempts: 0, mailCount: 0, lastCallAt: null, nextActionAt: '2026-04-25',
    personRole: '決裁者',
    leadSource: { category: 'homepage', sub: '問い合わせ' },
    owner: '田中太郎',
    handoverNote: '紹介経由・決裁ライン直結。初回コール未実施。先方の都合は平日午前優先(秘書経由で予約推奨)。',
  },
  '4': {
    id: '4', name: '中村 理恵', title: 'マーケティング マネージャー', department: 'マーケティング部',
    company: '株式会社ブライトワークス', companyId: '4',
    email: 'nakamura@brightworks.co.jp', phone: '03-4567-8901',
    rank: 'A', status: '接続済み', statusMemo: 'SFA切り替え検討中。現行はSalesforce、Q2中の比較検討と明言。',
    nextAction: 'メール', nextActionMemo: '比較資料(機能差分 + 料金)を送付予定',
    callAttempts: 2, mailCount: 6, lastCallAt: '2026-04-18', nextActionAt: '2026-04-23',
    personRole: '推進者',
    leadSource: { category: 'ad', sub: '検索広告' },
    owner: '佐藤次郎',
    handoverNote: 'Salesforce → 自社プロダクト切替を検討中。比較資料(機能差分・料金)送付済み。Q2中の比較検討と明言あり。',
  },
}

// 紐付け候補となる企業リスト(Phase 1: モック / 実装時は企業マスタから取得)
// domains はメールアドレスのドメインから推測する際のキー(複数許容)
type CompanyOption = { id: string; name: string; domains: string[] }
const COMPANY_OPTIONS: CompanyOption[] = [
  { id: '1',  name: '株式会社テクノリード',           domains: ['techno-lead.co.jp', 'technolead.jp'] },
  { id: '2',  name: '合同会社フューチャー',           domains: ['future-llc.jp', 'future-llc.co.jp'] },
  { id: '3',  name: '株式会社ノヴァソリューションズ', domains: ['nova-solutions.jp', 'nova-sol.com'] },
  { id: '4',  name: '株式会社ブライトワークス',       domains: ['brightworks.co.jp'] },
  { id: '5',  name: '株式会社イノベーション',         domains: ['innovation.co.jp'] },
  { id: '6',  name: '株式会社グロース',               domains: ['growth-inc.jp', 'growth.co.jp'] },
  { id: '7',  name: '有限会社サクセス',               domains: ['success-ltd.jp'] },
  { id: '8',  name: '株式会社ネクスト',               domains: ['next-co.jp'] },
  { id: '9',  name: '合同会社ビジョン',               domains: ['vision-llc.jp'] },
  { id: '10', name: '株式会社スタート',               domains: ['start-inc.jp'] },
]

// メールアドレスからドメインを抽出 (例: foo@bar.co.jp → 'bar.co.jp')
function extractDomain(email: string): string | null {
  const at = email.lastIndexOf('@')
  if (at < 0) return null
  const d = email.slice(at + 1).trim().toLowerCase()
  return d.length > 0 ? d : null
}

// ドメイン一致による企業推測。完全一致を優先、無ければサブドメイン一致 (e.g. mail.bar.co.jp ⊃ bar.co.jp)
function inferCompaniesFromEmail(email: string): CompanyOption[] {
  const d = extractDomain(email)
  if (!d) return []
  const exact = COMPANY_OPTIONS.filter((c) => c.domains.includes(d))
  if (exact.length > 0) return exact
  return COMPANY_OPTIONS.filter((c) => c.domains.some((cd) => d.endsWith('.' + cd)))
}

// ─── Person Role Style (Liquid Obsidian flat chip) ────────────────────────────

const PERSON_ROLE_STYLES: Record<PersonRole, ObsChipStyle> = {
  '決裁者': { bg: 'rgba(255,184,107,0.14)', fg: 'var(--color-obs-middle)' },
  '推進者': { bg: 'rgba(171,199,255,0.14)', fg: 'var(--color-obs-primary)' },
  '一般':   { bg: 'rgba(143,140,144,0.14)', fg: 'var(--color-obs-text-muted)' },
}

const ALL_PERSON_ROLES: PersonRole[] = ['決裁者', '推進者', '一般']

// ─── Style Constants (Liquid Obsidian) ─────────────────────────────────────────

const CARD_STYLE: React.CSSProperties = {
  background: 'var(--color-obs-surface-high)',
  boxShadow: 'inset 0 0 0 1px rgba(109,106,111,0.12), 0 2px 12px rgba(0,0,0,0.35)',
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

function formatDuration(sec: number): string {
  if (sec === 0) return '—'
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return m > 0 ? `${m}分${s}秒` : `${s}秒`
}

// ─── Inline Selectors (クリックでドロップダウン編集) ──────────────────────────

const STATUS_OPTIONS: ApproachStatus[] = ['未着手', '不通', '不在', '接続済み', 'コール不可', 'アポ獲得', 'その他']

function StatusSelector({ value, onChange }: {
  value: ApproachStatus
  onChange: (v: ApproachStatus) => void
}) {
  const [open, setOpen] = useState(false)
  const [hover, setHover] = useState(false)
  const active = hover || open

  return (
    <div className="relative">
      <button
        onClick={e => { e.stopPropagation(); setOpen(v => !v) }}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        className="inline-flex items-center gap-1 px-1.5 py-1 -mx-1.5 -my-1 rounded-[8px] transition-all cursor-pointer"
        style={{
          background: active ? 'rgba(171,199,255,0.10)' : 'var(--color-obs-surface-high)',
          boxShadow: active ? 'inset 0 0 0 1px var(--color-obs-primary)' : 'none',
        }}
        title="クリックして変更"
      >
        <StatusObsBadge status={value} />
        <ChevronDown
          size={13}
          className="transition-transform"
          style={{
            color: active ? 'var(--color-obs-primary)' : 'var(--color-obs-text-muted)',
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
          }}
        />
      </button>
      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -4, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.97 }}
              transition={{ duration: 0.15 }}
              className="absolute top-full right-0 mt-1.5 z-40 rounded-[10px] py-1.5 min-w-[160px]"
              style={{
                background: 'var(--color-obs-surface-highest)',
                boxShadow: '0 12px 32px rgba(0,0,0,0.4), inset 0 0 0 1px rgba(109,106,111,0.18)',
              }}
            >
              {STATUS_OPTIONS.map(s => {
                const style = STATUS_OBS_STYLES[s]
                const selected = s === value
                return (
                  <button
                    key={s}
                    onClick={e => { e.stopPropagation(); onChange(s); setOpen(false) }}
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-[12px] text-left hover:bg-[rgba(171,199,255,0.08)] transition-colors"
                    style={{ color: 'var(--color-obs-text)', fontWeight: selected ? 600 : 500 }}
                  >
                    <span
                      className="rounded-full shrink-0"
                      style={{ width: 6, height: 6, backgroundColor: style.fg }}
                    />
                    {s}
                    {selected && <span className="ml-auto" style={{ color: 'var(--color-obs-primary)' }}>✓</span>}
                  </button>
                )
              })}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── IS担当者 セレクタ ─────────────────────────────────────────────────────
function OwnerSelector({ value, onChange }: {
  value: string
  onChange: (v: string) => void
}) {
  const [open, setOpen] = useState(false)
  const [hover, setHover] = useState(false)
  const active = hover || open
  const current = IS_OWNERS.find(o => o.name === value)
  const ownerColor = current?.color ?? 'var(--color-obs-text-subtle)'
  const initial = value ? value[0] : '?'

  return (
    <div className="relative">
      <button
        onClick={e => { e.stopPropagation(); setOpen(v => !v) }}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        className="inline-flex items-center gap-1.5 px-1.5 py-1 -mx-1.5 -my-1 rounded-[8px] transition-all cursor-pointer"
        style={{
          background: active ? 'rgba(171,199,255,0.10)' : 'var(--color-obs-surface-high)',
          boxShadow: active ? 'inset 0 0 0 1px var(--color-obs-primary)' : 'none',
        }}
        title="クリックして担当者を変更"
      >
        <span
          className="inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold shrink-0"
          style={{ backgroundColor: ownerColor, color: 'var(--color-obs-on-primary)' }}
        >
          {initial}
        </span>
        <span className="text-[12.5px] font-medium" style={{ color: 'var(--color-obs-text)' }}>
          {value || '未割当'}
        </span>
        <ChevronDown
          size={13}
          className="transition-transform"
          style={{
            color: active ? 'var(--color-obs-primary)' : 'var(--color-obs-text-muted)',
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
          }}
        />
      </button>
      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -4, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.97 }}
              transition={{ duration: 0.15 }}
              className="absolute top-full left-0 mt-1.5 z-40 rounded-[10px] py-1.5 min-w-[160px]"
              style={{
                background: 'var(--color-obs-surface-highest)',
                boxShadow: '0 12px 32px rgba(0,0,0,0.4), inset 0 0 0 1px rgba(109,106,111,0.18)',
              }}
            >
              {IS_OWNERS.map(o => {
                const selected = o.name === value
                return (
                  <button
                    key={o.name}
                    onClick={e => { e.stopPropagation(); onChange(o.name); setOpen(false) }}
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-[12px] text-left hover:bg-[rgba(171,199,255,0.08)] transition-colors"
                    style={{ color: 'var(--color-obs-text)', fontWeight: selected ? 600 : 500 }}
                  >
                    <span
                      className="inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold shrink-0"
                      style={{ backgroundColor: o.color, color: 'var(--color-obs-on-primary)' }}
                    >
                      {o.name[0]}
                    </span>
                    {o.name}
                    {selected && <span className="ml-auto" style={{ color: 'var(--color-obs-primary)' }}>✓</span>}
                  </button>
                )
              })}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── CompanyPicker (紐付け企業: ドメイン推測 + 検索) ──────────────────────────
function CompanyPicker({
  companyId,
  companyName,
  email,
  onSelect,
}: {
  companyId: string
  companyName: string
  email: string
  onSelect: (id: string, name: string) => void
}) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const wrapRef = useRef<HTMLDivElement | null>(null)
  const searchRef = useRef<HTMLInputElement | null>(null)

  // メールから推測した企業
  const suggested = useMemo(() => inferCompaniesFromEmail(email), [email])
  const suggestedIds = useMemo(() => new Set(suggested.map((s) => s.id)), [suggested])

  // 検索結果(推測候補は除外して重複表示を避ける)
  const searchResults = useMemo(() => {
    const q = query.trim().toLowerCase()
    return COMPANY_OPTIONS.filter((o) => !suggestedIds.has(o.id)).filter((o) =>
      q ? o.name.toLowerCase().includes(q) || o.domains.some((d) => d.includes(q)) : true,
    )
  }, [query, suggestedIds])

  // 外側クリック / Esc で閉じる
  useEffect(() => {
    if (!open) return
    const onDoc = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    document.addEventListener('keydown', onKey)
    // 開いたら検索欄にフォーカス
    const t = window.setTimeout(() => searchRef.current?.focus(), 30)
    return () => {
      document.removeEventListener('mousedown', onDoc)
      document.removeEventListener('keydown', onKey)
      window.clearTimeout(t)
    }
  }, [open])

  const handlePick = (o: CompanyOption) => {
    onSelect(o.id, o.name)
    setOpen(false)
    setQuery('')
  }

  const inferredDomain = extractDomain(email)

  return (
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="w-full h-[36px] px-3 pr-8 text-left text-[13px] rounded-[8px] outline-none transition-colors duration-150 inline-flex items-center gap-2"
        style={{
          background: 'var(--color-obs-surface-low)',
          color: 'var(--color-obs-text)',
          boxShadow: open
            ? 'inset 0 0 0 1px rgba(171,199,255,0.4)'
            : 'inset 0 0 0 1px rgba(109,106,111,0.18)',
        }}
      >
        <Building2 size={13} style={{ color: 'var(--color-obs-text-muted)', flexShrink: 0 }} />
        <span className="truncate flex-1">
          {companyName || '企業を選択…'}
        </span>
        <ChevronDown
          size={13}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none transition-transform duration-150"
          style={{
            color: 'var(--color-obs-text-muted)',
            transform: open ? 'translateY(-50%) rotate(180deg)' : 'translateY(-50%)',
          }}
        />
      </button>

      {open && (
        <div
          className="absolute z-50 left-0 right-0 mt-1.5 rounded-[10px] overflow-hidden"
          style={{
            background: 'var(--color-obs-surface-highest)',
            boxShadow: '0 16px 40px rgba(0,0,0,0.55), inset 0 0 0 1px rgba(109,106,111,0.22)',
          }}
        >
          {/* 検索ボックス */}
          <div
            className="flex items-center gap-2 px-3 h-9"
            style={{ borderBottom: '1px solid rgba(109,106,111,0.16)' }}
          >
            <Search size={12} style={{ color: 'var(--color-obs-text-muted)' }} />
            <input
              ref={searchRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="企業名・ドメインで検索"
              className="flex-1 bg-transparent outline-none text-[12.5px]"
              style={{ color: 'var(--color-obs-text)' }}
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                aria-label="クリア"
                className="w-4 h-4 rounded-full flex items-center justify-center"
                style={{ color: 'var(--color-obs-text-muted)' }}
              >
                <X size={10} />
              </button>
            )}
          </div>

          <div className="max-h-[260px] overflow-y-auto py-1">
            {/* 推測候補(検索クエリが空のときのみ表示) */}
            {!query && suggested.length > 0 && (
              <>
                <div
                  className="px-3 pt-2 pb-1 flex items-center gap-1.5 text-[10px] font-semibold tracking-[0.08em] uppercase"
                  style={{ color: 'var(--color-obs-primary)' }}
                >
                  メールから推測
                  {inferredDomain && (
                    <span
                      className="font-normal normal-case tracking-normal text-[10.5px]"
                      style={{ color: 'var(--color-obs-text-subtle)' }}
                    >
                      @{inferredDomain}
                    </span>
                  )}
                </div>
                {suggested.map((o) => (
                  <CompanyRow
                    key={`s-${o.id}`}
                    option={o}
                    selected={o.id === companyId}
                    suggested
                    onPick={() => handlePick(o)}
                  />
                ))}
                <div
                  className="my-1 mx-3 h-px"
                  style={{ backgroundColor: 'rgba(109,106,111,0.16)' }}
                />
              </>
            )}

            {/* 推測候補が空 + 検索クエリも空のとき、ヒントを出す */}
            {!query && suggested.length === 0 && email && (
              <div
                className="px-3 py-2 text-[11px]"
                style={{ color: 'var(--color-obs-text-subtle)' }}
              >
                メール「{email}」から該当企業を推測できませんでした。下記から検索して選択してください。
              </div>
            )}

            {/* 検索結果 / 全件 */}
            {searchResults.length === 0 ? (
              <div
                className="px-3 py-3 text-[11.5px] text-center"
                style={{ color: 'var(--color-obs-text-subtle)' }}
              >
                該当する企業がありません
              </div>
            ) : (
              <>
                {!query && (
                  <div
                    className="px-3 pt-2 pb-1 text-[10px] font-semibold tracking-[0.08em] uppercase"
                    style={{ color: 'var(--color-obs-text-subtle)' }}
                  >
                    すべての企業
                  </div>
                )}
                {searchResults.map((o) => (
                  <CompanyRow
                    key={o.id}
                    option={o}
                    selected={o.id === companyId}
                    onPick={() => handlePick(o)}
                  />
                ))}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function CompanyRow({
  option,
  selected,
  suggested,
  onPick,
}: {
  option: CompanyOption
  selected: boolean
  suggested?: boolean
  onPick: () => void
}) {
  const [hover, setHover] = useState(false)
  return (
    <button
      type="button"
      onClick={onPick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      role="option"
      aria-selected={selected}
      className="w-full px-3 py-2 flex items-center gap-2 text-left transition-colors duration-100"
      style={{
        backgroundColor: hover ? 'rgba(171,199,255,0.08)' : 'transparent',
      }}
    >
      <Building2
        size={12}
        style={{
          color: suggested ? 'var(--color-obs-primary)' : 'var(--color-obs-text-muted)',
          flexShrink: 0,
        }}
      />
      <div className="flex-1 min-w-0">
        <div
          className="text-[12.5px] truncate"
          style={{
            color: 'var(--color-obs-text)',
            fontWeight: selected ? 600 : 500,
          }}
        >
          {option.name}
        </div>
        <div
          className="text-[10.5px] truncate mt-0.5"
          style={{ color: 'var(--color-obs-text-subtle)' }}
        >
          {option.domains.join(' / ')}
        </div>
      </div>
      {selected && (
        <CheckCircle2
          size={13}
          style={{ color: 'var(--color-obs-primary)', flexShrink: 0 }}
        />
      )}
      {suggested && !selected && (
        <span
          className="text-[9.5px] font-semibold tracking-[0.06em] uppercase px-1.5 py-0.5 rounded"
          style={{
            backgroundColor: 'rgba(171,199,255,0.14)',
            color: 'var(--color-obs-primary)',
          }}
        >
          推測
        </span>
      )}
    </button>
  )
}

// ─── ContactHistoryTimeline (コール / メール / 会議 履歴 ─ Phase 1: モック) ───
// 実装時は GoogleTimeline / 連携APIに差し替える前提
type HistoryKind = 'call' | 'email' | 'meeting'

type CallResult = '通話' | '不在' | '不通' | 'その他'
const CALL_RESULTS: CallResult[] = ['通話', '不在', '不通', 'その他']

export type HistoryEntry = {
  id: string
  kind: HistoryKind
  occurredAt: string // ISO
  title: string
  detail?: string
  // call 用
  direction?: 'inbound' | 'outbound'
  durationSec?: number
  result?: CallResult
  callSummary?: string[]      // 展開時: コール要約サマリ(箇条書き)
  callTranscript?: string     // 展開時: 文字起こしハイライト
  // email 用
  from?: string
  to?: string
  emailSubject?: string       // 展開時: 件名
  emailBody?: string          // 展開時: 本文(プレーンテキスト)
  emailAttachments?: { name: string; size: string }[]
  // meeting 用
  attendees?: string[]
  meetUrl?: string
  // Google Meet で自動生成された議事録ドキュメント (Google Docs) へのリンク
  minutesDocUrl?: string
  meetingSummary?: string[]   // 展開時: 要約サマリー(箇条書き)
}

const MOCK_CONTACT_HISTORY: HistoryEntry[] = [
  {
    id: 'h1',
    kind: 'meeting',
    occurredAt: '2026-03-28T14:00:00',
    title: '初回オンライン商談',
    detail: 'プロダクトデモ + 課題ヒアリング。次回までに比較表を送付予定。',
    attendees: ['田中 誠 (株式会社テクノリード)', '開発 太郎', '佐藤 翔'],
    meetUrl: 'https://meet.google.com/abc-defg-hij',
    minutesDocUrl: 'https://docs.google.com/document/d/1abc-techno-lead-2026-03-28-minutes/edit',
    durationSec: 50 * 60,
    meetingSummary: [
      '営業部 12名の SFA 利用率は約 4 割で、データ精度が課題。Salesforce はコスト面から Q2 中に切替判断を予定。',
      '評価軸はモバイル入力体験 / Slack・Google Workspace 連携 / 6 週間以内での本格稼働。',
      'NEXT STEP: 4/3 までに機能差分 + 料金の比較表を送付、4/10 週で 2 回目商談(現場SR 2 名同席)、CTO 川崎様の同席可否を田中様から確認。',
    ],
  },
  {
    id: 'h2',
    kind: 'email',
    occurredAt: '2026-03-21T09:12:00',
    title: '【ご案内】3/28 14:00 商談のリマインドと事前資料',
    detail: '事前資料のPDFと、当日のアジェンダ案を添付してお送りしました。',
    from: '開発 太郎 <taro@frontoffice.jp>',
    to: 'tanaka@techno-lead.co.jp',
    emailSubject: '【ご案内】3/28 (金) 14:00 商談のリマインドと事前資料',
    emailBody: `田中様

お世話になっております、Front Office の開発です。

3/28 (金) 14:00 〜 のオンライン商談のリマインドをさせていただきます。
当日の Google Meet URL は別途、開始 30 分前にもお送りいたします。

事前共有として、以下の 2 点を添付いたしました。
お手すきの際にご確認いただけますと幸いです。

  1. プロダクト概要資料 (PDF, 18 ページ)
  2. 当日のアジェンダ案

当日は田中様の現行業務フロー、特に SFA の利用状況をうかがいながら、
弊社プロダクトでの解決余地をご提案できればと考えております。

何かご不明点がございましたら、本メールへのご返信にてお気軽にお知らせください。

どうぞよろしくお願いいたします。
--
開発 太郎 / Front Office
taro@frontoffice.jp`,
    emailAttachments: [
      { name: 'FrontOffice_プロダクト概要_v2.pdf', size: '2.4 MB' },
      { name: '20260328_商談アジェンダ.pdf',     size: '180 KB' },
    ],
  },
  {
    id: 'h3',
    kind: 'call',
    occurredAt: '2026-03-20T14:32:00',
    title: '商談日程の確定コール',
    detail: '3/28 14:00 で確定。Google Meet URL を当日午前中に送付する旨を共有。',
    direction: 'outbound',
    durationSec: 8 * 60 + 24,
    result: '通話',
    callSummary: [
      '3/28 (金) 14:00 〜 で商談確定',
      '田中様側からは現場 SR の 1 名(佐藤様) も同席予定',
      'Google Meet URL は当日午前中までに送付することで合意',
      '事前資料は 1 週間前を目処に送付して欲しいとの要望あり',
    ],
    callTranscript:
      '「では 3/28 の 14 時で確定でお願いできればと。当日は弊社からもう一名、現場の佐藤も同席しますので、現場視点での質問が多くなるかと思います。事前の資料を 1 週間ぐらい前にいただけると、こちらでも論点整理してお返しできますので、ぜひお願いいたします。」',
  },
  {
    id: 'h4',
    kind: 'email',
    occurredAt: '2026-03-17T09:00:00',
    title: '会社紹介資料の送付',
    detail: '会社紹介資料(PDF, 18ページ)を添付、追って商談日程の調整連絡をする旨を伝達。',
    from: '開発 太郎 <taro@frontoffice.jp>',
    to: 'tanaka@techno-lead.co.jp',
    emailSubject: 'Front Office 会社紹介資料のご送付',
    emailBody: `田中様

お世話になっております、Front Office の開発と申します。
先日はお問い合わせをいただき、誠にありがとうございました。

弊社の会社紹介資料を添付いたしましたので、
お手すきの際にご一読いただけますと幸いです。

加えて、田中様のご状況や課題感を 30 分ほどお伺いできればと考えております。
別途、商談日程の候補をいくつかお送りいたします。

どうぞよろしくお願いいたします。
--
開発 太郎 / Front Office`,
    emailAttachments: [
      { name: 'FrontOffice_会社紹介_v3.pdf', size: '3.1 MB' },
    ],
  },
  {
    id: 'h5',
    kind: 'call',
    occurredAt: '2026-03-18T11:15:00',
    title: '受付経由コール',
    detail: '受付応答。本人不在のため折返し依頼を残す。',
    direction: 'outbound',
    durationSec: 1 * 60 + 20,
    result: '不在',
    callSummary: [
      '受付経由で取り次ぎ依頼',
      '田中様は外出中とのこと(13 時帰社予定)',
      '折返し依頼を伝言で残す',
      '念のため翌営業日午前中に再架電予定',
    ],
  },
  {
    id: 'h6',
    kind: 'call',
    occurredAt: '2026-03-15T10:00:00',
    title: '初回コール(着信なし)',
    direction: 'outbound',
    durationSec: 0,
    result: '不通',
    callSummary: [
      '記載番号に発信するも応答なし',
      '留守番電話メッセージは設定なし',
      '一旦メールでアプローチに切り替え予定',
    ],
  },
]

const HISTORY_KIND_META: Record<HistoryKind | 'all', { label: string; Icon: React.ElementType; tone: string }> = {
  all:     { label: 'すべて', Icon: Inbox,     tone: 'var(--color-obs-text-muted)' },
  call:    { label: 'コール', Icon: PhoneCall, tone: 'var(--color-obs-low)' },
  email:   { label: 'メール', Icon: Mail,      tone: 'var(--color-obs-primary)' },
  meeting: { label: '会議',   Icon: Calendar,  tone: 'var(--color-obs-middle)' },
}

const RESULT_TONE: Record<NonNullable<HistoryEntry['result']>, { bg: string; fg: string }> = {
  '通話':       { bg: 'rgba(110,231,161,0.14)', fg: '#6ee7a1' },
  '不在':       { bg: 'rgba(255,184,107,0.14)', fg: 'var(--color-obs-middle)' },
  '不通':       { bg: 'rgba(255,107,107,0.14)', fg: 'var(--color-obs-hot)' },
  'その他':     { bg: 'rgba(143,140,144,0.14)', fg: 'var(--color-obs-text-muted)' },
}

function formatHistoryDateTime(iso: string): { date: string; time: string } {
  const d = new Date(iso)
  const date = `${d.getMonth() + 1}/${d.getDate()}`
  const time = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
  return { date, time }
}

// コンタクト・取引両方で使えるアクティビティタイムライン
// entries 省略時は MOCK_CONTACT_HISTORY を表示する (主にコンタクト詳細用)
export function ContactHistoryTimeline({ entries }: { entries?: HistoryEntry[] } = {}) {
  const [filter, setFilter] = useState<HistoryKind | 'all'>('all')
  const source = entries ?? MOCK_CONTACT_HISTORY

  const filtered = useMemo(() => {
    const arr = filter === 'all' ? source : source.filter((e) => e.kind === filter)
    return [...arr].sort((a, b) => (a.occurredAt < b.occurredAt ? 1 : -1))
  }, [filter, source])

  const counts = useMemo(() => {
    const acc = { all: source.length, call: 0, email: 0, meeting: 0 }
    for (const e of source) acc[e.kind] += 1
    return acc
  }, [source])

  // タブ切替で高さがガクつかないよう、すべて表示時のおおよその高さを min-height として確保する
  // (1行あたり折り畳み時 約76px + 行間ギャップ込み)
  const ROW_HEIGHT = 76
  const minBodyHeight = source.length > 0 ? source.length * ROW_HEIGHT : 0

  return (
    <div>
      {/* タブ */}
      <div className="flex items-center gap-1.5 mb-4 flex-wrap">
        {(['all', 'call', 'email', 'meeting'] as const).map((k) => {
          const meta = HISTORY_KIND_META[k]
          const active = filter === k
          const count = counts[k]
          const Icon = meta.Icon
          return (
            <button
              key={k}
              type="button"
              onClick={() => setFilter(k)}
              className="inline-flex items-center gap-1.5 h-7 pl-2.5 pr-2 rounded-full text-[11.5px] font-medium transition-colors duration-150"
              style={{
                backgroundColor: active
                  ? 'var(--color-obs-primary-container)'
                  : 'var(--color-obs-surface-low)',
                color: active ? 'var(--color-obs-on-primary)' : 'var(--color-obs-text-muted)',
                boxShadow: active ? 'none' : 'inset 0 0 0 1px rgba(109,106,111,0.18)',
              }}
            >
              <Icon size={11} strokeWidth={2} />
              {meta.label}
              <span
                className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[10px] tabular-nums"
                style={{
                  backgroundColor: active
                    ? 'rgba(255,255,255,0.18)'
                    : 'rgba(109,106,111,0.18)',
                  color: active ? 'inherit' : 'var(--color-obs-text-subtle)',
                }}
              >
                {count}
              </span>
            </button>
          )
        })}
      </div>

      {/* タイムライン (タブ切替時に高さがジャンプしないよう min-height を確保) */}
      <div
        style={{ minHeight: minBodyHeight ? `${minBodyHeight}px` : undefined }}
      >
        {filtered.length === 0 ? (
          <div
            className="px-3 py-8 text-center text-[12px] rounded-[10px]"
            style={{
              color: 'var(--color-obs-text-subtle)',
              background: 'var(--color-obs-surface-low)',
            }}
          >
            履歴がありません
          </div>
        ) : (
          <div className="relative">
            <div
              className="absolute left-[15px] top-2 bottom-2 w-px"
              style={{ background: 'rgba(109,106,111,0.22)' }}
            />
            <div className="space-y-3">
              {filtered.map((e) => (
                <HistoryRow key={e.id} entry={e} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function HistoryRow({ entry }: { entry: HistoryEntry }) {
  const [expanded, setExpanded] = useState(false)
  // コール結果のローカル上書き(プルダウンで変更可能)
  const [callResult, setCallResult] = useState<CallResult | undefined>(entry.result)
  const [resultOpen, setResultOpen] = useState(false)
  const resultRef = useRef<HTMLDivElement | null>(null)

  // 結果プルダウンの外側クリック / Esc で閉じる
  useEffect(() => {
    if (!resultOpen) return
    const onDoc = (e: MouseEvent) => {
      if (resultRef.current && !resultRef.current.contains(e.target as Node)) {
        setResultOpen(false)
      }
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setResultOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDoc)
      document.removeEventListener('keydown', onKey)
    }
  }, [resultOpen])

  const meta = HISTORY_KIND_META[entry.kind]
  const Icon = meta.Icon
  const dt = formatHistoryDateTime(entry.occurredAt)

  return (
    <div className="relative pl-10">
      {/* タイムラインドット */}
      <div
        className="absolute left-0 top-1.5 w-8 h-8 rounded-full flex items-center justify-center"
        style={{
          background: 'var(--color-obs-surface-low)',
          boxShadow: 'inset 0 0 0 1px rgba(109,106,111,0.22)',
          color: meta.tone,
        }}
      >
        <Icon size={13} strokeWidth={2} />
      </div>

      {/* 本体カード(クリックで展開) */}
      <div
        className="rounded-[10px] overflow-hidden transition-shadow duration-200"
        style={{
          background: 'var(--color-obs-surface-low)',
          boxShadow: expanded
            ? 'inset 0 0 0 1px rgba(171,199,255,0.25), 0 4px 16px rgba(0,0,0,0.25)'
            : 'inset 0 0 0 1px rgba(109,106,111,0.16)',
        }}
      >
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          className="w-full text-left px-3.5 py-2.5 transition-colors duration-150"
          onMouseOver={(e) => {
            ;(e.currentTarget as HTMLButtonElement).style.backgroundColor =
              'rgba(171,199,255,0.04)'
          }}
          onMouseOut={(e) => {
            ;(e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent'
          }}
        >
          <div className="flex items-start gap-3">
            <div className="min-w-0 flex-1">
              <div
                className="text-[12.5px] font-semibold leading-snug"
                style={{ color: 'var(--color-obs-text)' }}
              >
                {entry.title}
              </div>
              {entry.detail && (
                <div
                  className="text-[11.5px] mt-1 leading-snug"
                  style={{ color: 'var(--color-obs-text-muted)' }}
                >
                  {entry.detail}
                </div>
              )}
            </div>
            <div className="flex flex-col items-end gap-1 shrink-0">
              <div
                className="text-[10.5px] tabular-nums text-right leading-tight"
                style={{ color: 'var(--color-obs-text-subtle)' }}
              >
                <div>{dt.date}</div>
                <div>{dt.time}</div>
              </div>
              <ChevronDown
                size={13}
                strokeWidth={2}
                style={{
                  color: 'var(--color-obs-text-subtle)',
                  transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 150ms var(--ease-liquid)',
                }}
              />
            </div>
          </div>

          {/* メタ情報行 */}
          <div className="mt-2 flex items-center gap-2 flex-wrap text-[10.5px]">
            {entry.kind === 'call' && (
              <>
                <span
                  className="inline-flex items-center gap-1 px-1.5 h-5 rounded-[5px] font-medium"
                  style={{
                    background: 'rgba(126,198,255,0.10)',
                    color: 'var(--color-obs-low)',
                  }}
                >
                  {entry.direction === 'outbound' ? '発信' : '着信'}
                </span>
                {callResult && (
                  <span
                    className="inline-flex items-center px-1.5 h-5 rounded-[5px] font-medium"
                    style={{
                      background: RESULT_TONE[callResult].bg,
                      color: RESULT_TONE[callResult].fg,
                    }}
                  >
                    {callResult}
                  </span>
                )}
                <span style={{ color: 'var(--color-obs-text-subtle)' }}>
                  通話時間 {formatDuration(entry.durationSec ?? 0)}
                </span>
              </>
            )}

            {entry.kind === 'email' && (
              <>
                {entry.from && (
                  <span
                    className="truncate max-w-[200px]"
                    style={{ color: 'var(--color-obs-text-subtle)' }}
                    title={entry.from}
                  >
                    From: <span style={{ color: 'var(--color-obs-text-muted)' }}>{entry.from}</span>
                  </span>
                )}
                {entry.to && (
                  <span
                    className="truncate max-w-[200px]"
                    style={{ color: 'var(--color-obs-text-subtle)' }}
                    title={entry.to}
                  >
                    To: <span style={{ color: 'var(--color-obs-text-muted)' }}>{entry.to}</span>
                  </span>
                )}
              </>
            )}

            {entry.kind === 'meeting' && (
              <>
                {entry.attendees && entry.attendees.length > 0 && (
                  <span
                    className="truncate max-w-[260px]"
                    style={{ color: 'var(--color-obs-text-subtle)' }}
                  >
                    参加者:{' '}
                    <span style={{ color: 'var(--color-obs-text-muted)' }}>
                      {entry.attendees.length}名
                    </span>
                  </span>
                )}
                {entry.durationSec && (
                  <span style={{ color: 'var(--color-obs-text-subtle)' }}>
                    {formatDuration(entry.durationSec ?? 0)}
                  </span>
                )}
              </>
            )}
          </div>
        </button>

        {/* ── 展開エリア ── */}
        {expanded && (
          <div
            className="px-3.5 pt-3 pb-3.5"
            style={{ borderTop: '1px solid rgba(109,106,111,0.14)' }}
          >
            {entry.kind === 'call' && (
              <CallExpanded
                entry={entry}
                result={callResult}
                onResultChange={(r) => {
                  setCallResult(r)
                  setResultOpen(false)
                }}
                resultOpen={resultOpen}
                setResultOpen={setResultOpen}
                resultRef={resultRef}
              />
            )}
            {entry.kind === 'email' && <EmailExpanded entry={entry} />}
            {entry.kind === 'meeting' && <MeetingExpanded entry={entry} />}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Call: 展開ビュー(要約サマリ + 結果プルダウン + 文字起こし) ──────────────
function CallExpanded({
  entry,
  result,
  onResultChange,
  resultOpen,
  setResultOpen,
  resultRef,
}: {
  entry: HistoryEntry
  result: CallResult | undefined
  onResultChange: (r: CallResult) => void
  resultOpen: boolean
  setResultOpen: (v: boolean) => void
  resultRef: React.RefObject<HTMLDivElement | null>
}) {
  return (
    <div className="space-y-3">
      {/* コール結果プルダウン */}
      <div className="flex items-center gap-2">
        <span className="text-[10.5px] tracking-[0.06em] uppercase" style={{ color: 'var(--color-obs-text-subtle)' }}>
          コール結果
        </span>
        <div ref={resultRef} className="relative">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              setResultOpen(!resultOpen)
            }}
            className="inline-flex items-center gap-1.5 h-7 pl-2.5 pr-2 rounded-[6px] text-[11.5px] font-medium transition-colors"
            style={{
              background: result ? RESULT_TONE[result].bg : 'var(--color-obs-surface-highest)',
              color: result ? RESULT_TONE[result].fg : 'var(--color-obs-text-muted)',
              boxShadow: 'inset 0 0 0 1px rgba(109,106,111,0.18)',
            }}
            aria-haspopup="listbox"
            aria-expanded={resultOpen}
          >
            {result ?? '未設定'}
            <ChevronDown
              size={11}
              strokeWidth={2}
              style={{
                transform: resultOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 150ms var(--ease-liquid)',
              }}
            />
          </button>
          {resultOpen && (
            <div
              className="absolute left-0 top-full mt-1 z-50 min-w-[140px] py-1 rounded-[8px]"
              style={{
                background: 'var(--color-obs-surface-highest)',
                boxShadow: '0 12px 32px rgba(0,0,0,0.5), inset 0 0 0 1px rgba(109,106,111,0.22)',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {CALL_RESULTS.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    onResultChange(r)
                  }}
                  className="w-full text-left px-3 py-1.5 text-[12px] flex items-center gap-2 transition-colors"
                  style={{
                    color: r === result ? RESULT_TONE[r].fg : 'var(--color-obs-text)',
                    fontWeight: r === result ? 600 : 500,
                  }}
                  onMouseOver={(e) => {
                    ;(e.currentTarget as HTMLButtonElement).style.backgroundColor =
                      'rgba(171,199,255,0.06)'
                  }}
                  onMouseOut={(e) => {
                    ;(e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent'
                  }}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ background: RESULT_TONE[r].fg }}
                  />
                  {r}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 要約サマリ(箇条書き) */}
      {entry.callSummary && entry.callSummary.length > 0 && (
        <div>
          <div
            className="text-[10.5px] tracking-[0.06em] uppercase mb-1"
            style={{ color: 'var(--color-obs-text-subtle)' }}
          >
            要約サマリ
          </div>
          <ul className="space-y-1">
            {entry.callSummary.map((line, i) => (
              <li
                key={i}
                className="text-[12px] leading-relaxed pl-3 relative"
                style={{ color: 'var(--color-obs-text)' }}
              >
                <span
                  className="absolute left-0 top-[8px] w-1 h-1 rounded-full"
                  style={{ background: 'var(--color-obs-low)' }}
                />
                {line}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 文字起こしハイライト(引用) */}
      {entry.callTranscript && (
        <div>
          <div
            className="text-[10.5px] tracking-[0.06em] uppercase mb-1"
            style={{ color: 'var(--color-obs-text-subtle)' }}
          >
            文字起こしハイライト
          </div>
          <blockquote
            className="text-[11.5px] leading-relaxed pl-3 italic"
            style={{
              color: 'var(--color-obs-text-muted)',
              borderLeft: '2px solid rgba(126,198,255,0.4)',
            }}
          >
            {entry.callTranscript}
          </blockquote>
        </div>
      )}
    </div>
  )
}

// ─── Email: 展開ビュー(件名 + 本文 + 添付) ───────────────────────────────────
function EmailExpanded({ entry }: { entry: HistoryEntry }) {
  return (
    <div className="space-y-3">
      {/* 件名 */}
      {entry.emailSubject && (
        <div>
          <div
            className="text-[10.5px] tracking-[0.06em] uppercase mb-0.5"
            style={{ color: 'var(--color-obs-text-subtle)' }}
          >
            件名
          </div>
          <div
            className="text-[13px] font-semibold leading-snug"
            style={{ color: 'var(--color-obs-text)' }}
          >
            {entry.emailSubject}
          </div>
        </div>
      )}

      {/* From/To 詳細 */}
      <div className="grid grid-cols-[60px_1fr] gap-x-3 gap-y-0.5 text-[11.5px]">
        {entry.from && (
          <>
            <span style={{ color: 'var(--color-obs-text-subtle)' }}>From</span>
            <span style={{ color: 'var(--color-obs-text-muted)' }}>{entry.from}</span>
          </>
        )}
        {entry.to && (
          <>
            <span style={{ color: 'var(--color-obs-text-subtle)' }}>To</span>
            <span style={{ color: 'var(--color-obs-text-muted)' }}>{entry.to}</span>
          </>
        )}
      </div>

      {/* 本文 */}
      {entry.emailBody && (
        <div
          className="rounded-[8px] px-3.5 py-3 text-[12px] leading-relaxed whitespace-pre-wrap"
          style={{
            background: 'var(--color-obs-surface-highest)',
            color: 'var(--color-obs-text)',
            boxShadow: 'inset 0 0 0 1px rgba(109,106,111,0.16)',
          }}
        >
          {entry.emailBody}
        </div>
      )}

      {/* 添付ファイル */}
      {entry.emailAttachments && entry.emailAttachments.length > 0 && (
        <div>
          <div
            className="text-[10.5px] tracking-[0.06em] uppercase mb-1.5"
            style={{ color: 'var(--color-obs-text-subtle)' }}
          >
            添付ファイル
          </div>
          <div className="flex flex-col gap-1.5">
            {entry.emailAttachments.map((a, i) => (
              <div
                key={i}
                className="flex items-center gap-2 px-2.5 h-7 rounded-[6px] text-[11.5px]"
                style={{
                  background: 'var(--color-obs-surface-highest)',
                  boxShadow: 'inset 0 0 0 1px rgba(109,106,111,0.16)',
                }}
              >
                <Paperclip size={11} style={{ color: 'var(--color-obs-text-muted)' }} />
                <span className="flex-1 truncate" style={{ color: 'var(--color-obs-text)' }}>
                  {a.name}
                </span>
                <span className="tabular-nums" style={{ color: 'var(--color-obs-text-subtle)' }}>
                  {a.size}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Meeting: 展開ビュー(参加者 + 要約サマリー + 議事録Docsリンク) ─────────
function MeetingExpanded({ entry }: { entry: HistoryEntry }) {
  return (
    <div className="space-y-3">
      {/* 参加者(全員) */}
      {entry.attendees && entry.attendees.length > 0 && (
        <div>
          <div
            className="text-[10.5px] tracking-[0.06em] uppercase mb-1"
            style={{ color: 'var(--color-obs-text-subtle)' }}
          >
            参加者
          </div>
          <div className="flex flex-wrap gap-1.5">
            {entry.attendees.map((a, i) => (
              <span
                key={i}
                className="inline-flex items-center px-2 h-6 rounded-full text-[11px]"
                style={{
                  background: 'var(--color-obs-surface-highest)',
                  color: 'var(--color-obs-text)',
                  boxShadow: 'inset 0 0 0 1px rgba(109,106,111,0.16)',
                }}
              >
                {a}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 要約サマリー */}
      {entry.meetingSummary && entry.meetingSummary.length > 0 && (
        <div>
          <div
            className="text-[10.5px] tracking-[0.06em] uppercase mb-1.5"
            style={{ color: 'var(--color-obs-text-subtle)' }}
          >
            要約サマリー
          </div>
          <ul className="space-y-1.5">
            {entry.meetingSummary.map((line, i) => (
              <li
                key={i}
                className="text-[12px] leading-relaxed pl-3 relative"
                style={{ color: 'var(--color-obs-text)' }}
              >
                <span
                  className="absolute left-0 top-[8px] w-1 h-1 rounded-full"
                  style={{ background: 'var(--color-obs-middle)' }}
                />
                {line}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 議事録ドキュメント (Google Docs) へのリンク */}
      {entry.minutesDocUrl && (
        <a
          href={entry.minutesDocUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 h-7 px-3 rounded-[6px] text-[11.5px] font-medium transition-colors hover:opacity-90"
          style={{
            background: 'rgba(171,199,255,0.14)',
            color: 'var(--color-obs-primary)',
          }}
          onClick={(e) => e.stopPropagation()}
          title="Google Meet で自動生成された議事録 (Google Docs) を開く"
        >
          <FileText size={11} />
          議事録を Docs で開く
        </a>
      )}
    </div>
  )
}

// ─── LeadSourceSelector (リード経由元) ────────────────────────────────────────
// 大分類（ホームページ / イベント / 広告）+ サブカテゴリの2段構成。
// サブカテゴリはデフォルト + ユーザーがカスタム追加可能（localStorage 永続化）。

interface ResolvedCategory {
  id: string
  label: string
  Icon: React.ElementType
  iconFg: string
  builtin: boolean
  defaultSubs: readonly string[]
}

function resolveCategory(id: string, customLabel?: string): ResolvedCategory {
  if (isBuiltinCategory(id)) {
    const m = BUILTIN_CATEGORY_META[id]
    return { id, label: m.label, Icon: m.Icon, iconFg: m.iconFg, builtin: true, defaultSubs: m.defaultSubs }
  }
  return {
    id,
    label: customLabel ?? '(カスタム)',
    Icon: Tag,
    iconFg: 'var(--color-obs-text-muted)',
    builtin: false,
    defaultSubs: [],
  }
}

function LeadSourceTypeChip({
  value,
  customCategoryLabel,
}: {
  value: LeadSource
  customCategoryLabel?: string
}) {
  const cat = resolveCategory(value.category, customCategoryLabel)
  const Icon = cat.Icon
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2 h-5 rounded-full text-[11px] font-medium tracking-[-0.005em] whitespace-nowrap"
      style={{
        backgroundColor: LEAD_SOURCE_CHIP_BG,
        color: LEAD_SOURCE_FG,
      }}
    >
      <Icon size={11} strokeWidth={2.2} style={{ color: cat.iconFg }} />
      <span style={{ color: 'var(--color-obs-text-subtle)' }}>{cat.label}</span>
      <span style={{ color: 'var(--color-obs-text-muted)' }}>·</span>
      <span style={{ color: 'var(--color-obs-text)' }}>{value.sub}</span>
    </span>
  )
}

// ─── localStorage 永続化ユーティリティ ──────────────────────────────────────

type CustomSubsMap = Record<string, string[]>

function loadCustomCategories(): CustomCategoryDef[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(CUSTOM_CATEGORIES_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter((c): c is CustomCategoryDef =>
      c && typeof c.id === 'string' && typeof c.label === 'string',
    )
  } catch {
    return []
  }
}

function saveCustomCategories(cats: CustomCategoryDef[]) {
  if (typeof window === 'undefined') return
  try { localStorage.setItem(CUSTOM_CATEGORIES_KEY, JSON.stringify(cats)) } catch { /* ignore */ }
}

function loadCustomSubs(): CustomSubsMap {
  if (typeof window === 'undefined') return {}
  try {
    const raw = localStorage.getItem(CUSTOM_SUBS_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') return {}
    const out: CustomSubsMap = {}
    for (const k of Object.keys(parsed)) {
      const v = (parsed as Record<string, unknown>)[k]
      if (Array.isArray(v)) out[k] = v.filter((x): x is string => typeof x === 'string')
    }
    return out
  } catch {
    return {}
  }
}

function saveCustomSubs(subs: CustomSubsMap) {
  if (typeof window === 'undefined') return
  try { localStorage.setItem(CUSTOM_SUBS_KEY, JSON.stringify(subs)) } catch { /* ignore */ }
}

// 過去に seed された「展示会」「検索広告」を除去する
// (デフォルトでは出さない方針に変更したが、すでにローカルストレージに残っているユーザー向けの後始末)
function cleanupSeededDemoIfNeeded() {
  if (typeof window === 'undefined') return
  const existing = loadCustomSubs()
  const eventHas = (existing.event ?? []).includes('展示会')
  const adHas    = (existing.ad ?? []).includes('検索広告')
  if (!eventHas && !adHas) return
  saveCustomSubs({
    ...existing,
    event: (existing.event ?? []).filter((s) => s !== '展示会'),
    ad:    (existing.ad ?? []).filter((s) => s !== '検索広告'),
  })
}

function LeadSourceSelector({ value, onChange }: {
  value: LeadSource
  onChange: (v: LeadSource) => void
}) {
  const [open, setOpen] = useState(false)
  const [hover, setHover] = useState(false)
  const [customCategories, setCustomCategories] = useState<CustomCategoryDef[]>([])
  const [customSubs, setCustomSubs] = useState<CustomSubsMap>({})
  const [addingSubFor, setAddingSubFor] = useState<string | null>(null)
  const [subDraft, setSubDraft] = useState('')
  const [addingCategory, setAddingCategory] = useState(false)
  const [categoryDraft, setCategoryDraft] = useState('')

  useEffect(() => {
    if (!open) return
    cleanupSeededDemoIfNeeded()
    setCustomCategories(loadCustomCategories())
    setCustomSubs(loadCustomSubs())
  }, [open])

  const active = hover || open

  const orderedCategories: ResolvedCategory[] = [
    ...BUILTIN_CATEGORY_IDS.map((id) => resolveCategory(id)),
    ...customCategories.map((c) => resolveCategory(c.id, c.label)),
  ]

  const currentCustomLabel = customCategories.find((c) => c.id === value.category)?.label

  const allSubsOf = (catId: string, defaultSubs: readonly string[]): { label: string; custom: boolean }[] => {
    const customs = customSubs[catId] ?? []
    return [
      ...defaultSubs.map((s) => ({ label: s, custom: false })),
      ...customs.map((s) => ({ label: s, custom: true })),
    ]
  }

  const commitAddSub = (catId: string) => {
    const label = subDraft.trim()
    if (!label) { setAddingSubFor(null); return }
    const cat = orderedCategories.find((c) => c.id === catId)
    const exists =
      (cat?.defaultSubs.includes(label) ?? false) ||
      (customSubs[catId] ?? []).includes(label)
    let next = customSubs
    if (!exists) {
      next = { ...customSubs, [catId]: [...(customSubs[catId] ?? []), label] }
      setCustomSubs(next)
      saveCustomSubs(next)
    }
    onChange({ category: catId, sub: label })
    setAddingSubFor(null)
    setSubDraft('')
    setOpen(false)
  }

  const removeCustomSub = (catId: string, label: string) => {
    const next = { ...customSubs, [catId]: (customSubs[catId] ?? []).filter((s) => s !== label) }
    setCustomSubs(next)
    saveCustomSubs(next)
    if (value.category === catId && value.sub === label) {
      const cat = orderedCategories.find((c) => c.id === catId)
      const fallback = cat?.defaultSubs[0] ?? next[catId]?.[0] ?? ''
      onChange({ category: catId, sub: fallback })
    }
  }

  const commitAddCategory = () => {
    const label = categoryDraft.trim()
    if (!label) { setAddingCategory(false); return }
    const id = `custom_${Date.now().toString(36)}_${Math.floor(Math.random() * 1000)}`
    const next = [...customCategories, { id, label }]
    setCustomCategories(next)
    saveCustomCategories(next)
    setAddingCategory(false)
    setCategoryDraft('')
  }

  const removeCustomCategory = (catId: string) => {
    const nextCats = customCategories.filter((c) => c.id !== catId)
    setCustomCategories(nextCats)
    saveCustomCategories(nextCats)
    const nextSubs = { ...customSubs }
    delete nextSubs[catId]
    setCustomSubs(nextSubs)
    saveCustomSubs(nextSubs)
    if (value.category === catId) {
      onChange({ category: 'homepage', sub: BUILTIN_CATEGORY_META.homepage.defaultSubs[0]! })
    }
  }

  return (
    <div className="flex items-start max-w-full">
      <div className="relative">
        <button
          onClick={e => { e.stopPropagation(); setOpen(v => !v) }}
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
          className="inline-flex items-center gap-1 px-1.5 py-1 -mx-1.5 -my-1 rounded-[8px] transition-all cursor-pointer"
          style={{
            background: active ? 'rgba(171,199,255,0.10)' : 'transparent',
            boxShadow: active ? 'inset 0 0 0 1px var(--color-obs-primary)' : 'none',
          }}
          title="クリックして経由元を変更"
        >
          <LeadSourceTypeChip value={value} customCategoryLabel={currentCustomLabel} />
          <ChevronDown
            size={12}
            className="transition-transform"
            style={{
              color: active ? 'var(--color-obs-primary)' : 'var(--color-obs-text-muted)',
              transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
            }}
          />
        </button>
        <AnimatePresence>
          {open && (
            <>
              <div
                className="fixed inset-0 z-30"
                onClick={() => {
                  setOpen(false)
                  setAddingSubFor(null)
                  setAddingCategory(false)
                }}
              />
              <motion.div
                initial={{ opacity: 0, y: -4, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -4, scale: 0.97 }}
                transition={{ duration: 0.15 }}
                className="absolute top-full left-0 mt-1.5 z-40 rounded-[10px] py-1 min-w-[280px] max-h-[440px] overflow-y-auto"
                style={{
                  background: 'var(--color-obs-surface-highest)',
                  boxShadow: '0 12px 32px rgba(0,0,0,0.4), inset 0 0 0 1px rgba(109,106,111,0.18)',
                }}
              >
                {orderedCategories.map((cat) => {
                  const Icon = cat.Icon
                  const subs = allSubsOf(cat.id, cat.defaultSubs)
                  return (
                    <div key={cat.id} className="py-1.5">
                      <div
                        className="px-3 py-1 flex items-center gap-1.5 group"
                        style={{ color: 'var(--color-obs-text-subtle)' }}
                      >
                        <Icon size={11} strokeWidth={2.2} style={{ color: cat.iconFg }} />
                        <span className="text-[10.5px] font-bold tracking-[0.06em] uppercase flex-1">
                          {cat.label}
                        </span>
                        {!cat.builtin && (
                          <button
                            onClick={(e) => { e.stopPropagation(); removeCustomCategory(cat.id) }}
                            className="opacity-0 group-hover:opacity-100 transition-opacity px-1.5 py-0.5 rounded-[5px] hover:bg-[rgba(255,107,107,0.12)]"
                            title="このカテゴリを削除"
                          >
                            <Trash2 size={10} style={{ color: 'var(--color-obs-text-muted)' }} />
                          </button>
                        )}
                      </div>

                      {subs.map(({ label, custom }) => {
                        const selected = value.category === cat.id && value.sub === label
                        return (
                          <div key={label} className="flex items-center group">
                            <button
                              onClick={e => {
                                e.stopPropagation()
                                onChange({ category: cat.id, sub: label })
                                setOpen(false)
                              }}
                              className="flex-1 flex items-center gap-2 px-3 py-1.5 text-[12.5px] text-left hover:bg-[rgba(171,199,255,0.08)] transition-colors"
                              style={{ color: 'var(--color-obs-text)', fontWeight: selected ? 600 : 500 }}
                            >
                              <span>{label}</span>
                              {selected && <span className="ml-auto" style={{ color: 'var(--color-obs-primary)' }}>✓</span>}
                            </button>
                            {custom && (
                              <button
                                onClick={e => { e.stopPropagation(); removeCustomSub(cat.id, label) }}
                                className="opacity-0 group-hover:opacity-100 transition-opacity px-2 py-1 mr-1 rounded-[5px] hover:bg-[rgba(255,107,107,0.12)]"
                                title="このカスタム項目を削除"
                              >
                                <Trash2 size={11} style={{ color: 'var(--color-obs-text-muted)' }} />
                              </button>
                            )}
                          </div>
                        )
                      })}

                      {addingSubFor === cat.id ? (
                        <div className="flex items-center gap-1 px-3 py-1.5">
                          <input
                            autoFocus
                            value={subDraft}
                            onChange={(e) => setSubDraft(e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            onKeyDown={(e) => {
                              e.stopPropagation()
                              if (e.key === 'Enter') { e.preventDefault(); commitAddSub(cat.id) }
                              else if (e.key === 'Escape') { e.preventDefault(); setAddingSubFor(null) }
                            }}
                            placeholder="例: BOXIL / アイスマイリー"
                            className="flex-1 bg-transparent outline-none text-[12.5px] px-2 py-1 rounded-[5px]"
                            style={{
                              color: 'var(--color-obs-text)',
                              boxShadow: 'inset 0 0 0 1px var(--color-obs-primary)',
                            }}
                          />
                          <button
                            onClick={(e) => { e.stopPropagation(); commitAddSub(cat.id) }}
                            className="text-[11px] px-2 py-1 rounded-[5px]"
                            style={{
                              background: 'var(--color-obs-primary-container)',
                              color: 'var(--color-obs-on-primary)',
                            }}
                          >
                            追加
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setAddingSubFor(cat.id)
                            setSubDraft('')
                          }}
                          className="w-full flex items-center gap-2 px-3 py-1.5 text-[12px] text-left hover:bg-[rgba(171,199,255,0.08)] transition-colors"
                          style={{ color: 'var(--color-obs-text-subtle)' }}
                        >
                          <Plus size={11} strokeWidth={2.2} />
                          カスタム追加
                        </button>
                      )}
                    </div>
                  )
                })}

                {/* 大分類のカスタム追加 */}
                <div
                  className="mt-1 pt-1.5 px-1"
                  style={{ borderTop: '1px solid rgba(109,106,111,0.18)' }}
                >
                  {addingCategory ? (
                    <div className="flex items-center gap-1 px-2 py-1.5">
                      <input
                        autoFocus
                        value={categoryDraft}
                        onChange={(e) => setCategoryDraft(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        onKeyDown={(e) => {
                          e.stopPropagation()
                          if (e.key === 'Enter') { e.preventDefault(); commitAddCategory() }
                          else if (e.key === 'Escape') { e.preventDefault(); setAddingCategory(false) }
                        }}
                        placeholder="新しいカテゴリ名（例: パートナー）"
                        className="flex-1 bg-transparent outline-none text-[12.5px] px-2 py-1 rounded-[5px]"
                        style={{
                          color: 'var(--color-obs-text)',
                          boxShadow: 'inset 0 0 0 1px var(--color-obs-primary)',
                        }}
                      />
                      <button
                        onClick={(e) => { e.stopPropagation(); commitAddCategory() }}
                        className="text-[11px] px-2 py-1 rounded-[5px]"
                        style={{
                          background: 'var(--color-obs-primary-container)',
                          color: 'var(--color-obs-on-primary)',
                        }}
                      >
                        追加
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={(e) => { e.stopPropagation(); setAddingCategory(true); setCategoryDraft('') }}
                      className="w-full flex items-center gap-2 px-3 py-1.5 text-[12px] text-left hover:bg-[rgba(171,199,255,0.08)] transition-colors rounded-[5px]"
                      style={{ color: 'var(--color-obs-primary)', fontWeight: 600 }}
                    >
                      <Plus size={11} strokeWidth={2.2} />
                      カテゴリを追加
                    </button>
                  )}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

// ─── PersonRoleSelector (職位) ────────────────────────────────────────────

function PersonRoleSelector({ value, onChange }: {
  value: PersonRole
  onChange: (v: PersonRole) => void
}) {
  const [open, setOpen] = useState(false)
  const [hover, setHover] = useState(false)
  const s = PERSON_ROLE_STYLES[value]
  const active = hover || open

  return (
    <div className="relative inline-block">
      <button
        onClick={e => { e.stopPropagation(); setOpen(v => !v) }}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        className="inline-flex items-center gap-1 px-2 h-5 rounded-full text-[11px] font-medium tracking-[-0.005em] whitespace-nowrap transition-all cursor-pointer"
        style={{
          backgroundColor: s.bg,
          color: s.fg,
          boxShadow: active ? 'inset 0 0 0 1px rgba(109,106,111,0.18)' : 'none',
        }}
        title="クリックして変更"
      >
        <Star size={10} style={{ color: s.fg, opacity: 0.85 }} fill="currentColor" />
        {value}
        <ChevronDown size={11} style={{ color: s.fg, opacity: 0.7 }} />
      </button>
      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -4, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.97 }}
              transition={{ duration: 0.15 }}
              className="absolute top-full left-0 mt-1.5 z-40 rounded-[10px] py-1.5 min-w-[140px]"
              style={{
                background: 'var(--color-obs-surface-highest)',
                boxShadow: '0 12px 32px rgba(0,0,0,0.4), inset 0 0 0 1px rgba(109,106,111,0.18)',
              }}
            >
              {ALL_PERSON_ROLES.map(r => {
                const selected = r === value
                const rs = PERSON_ROLE_STYLES[r]
                return (
                  <button
                    key={r}
                    onClick={e => { e.stopPropagation(); onChange(r); setOpen(false) }}
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-[12px] text-left hover:bg-[rgba(171,199,255,0.08)] transition-colors"
                    style={{ color: 'var(--color-obs-text)', fontWeight: selected ? 600 : 500 }}
                  >
                    <Star size={11} style={{ color: rs.fg, opacity: 0.85 }} fill="currentColor" />
                    {r}
                    {selected && <span className="ml-auto" style={{ color: 'var(--color-obs-primary)' }}>✓</span>}
                  </button>
                )
              })}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Edit Contact Modal ───────────────────────────────────────────────────────

function EditContactModal({ contact, onClose, onSave }: {
  contact: ContactDetail
  onClose: () => void
  onSave: (updated: ContactDetail) => void
}) {
  const [form, setForm] = useState<ContactDetail>(contact)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) return
    onSave({
      ...form,
      name: form.name.trim(),
      title: form.title.trim(),
      department: form.department.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
    })
    onClose()
  }

  const inputBaseStyle: React.CSSProperties = {
    background: 'var(--color-obs-surface-low)',
    boxShadow: 'inset 0 0 0 1px rgba(109,106,111,0.12)',
  }

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        className="relative w-full max-w-[480px] rounded-[14px] overflow-hidden"
        style={{
          background: 'var(--color-obs-surface-highest)',
          boxShadow: '0 24px 64px rgba(0,0,0,0.55), inset 0 0 0 1px rgba(109,106,111,0.18)',
        }}
        initial={{ opacity: 0, scale: 0.96, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 8 }}
        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{ boxShadow: 'inset 0 -1px 0 rgba(109,106,111,0.12)' }}
        >
          <h2 className="text-[16px] font-semibold" style={{ color: 'var(--color-obs-text)' }}>コンタクト編集</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full transition-colors hover:bg-[rgba(171,199,255,0.08)]"
          >
            <X size={16} style={{ color: 'var(--color-obs-text-muted)' }} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="px-5 py-4 space-y-4 max-h-[70vh] overflow-y-auto">
            {/* 氏名 */}
            <div>
              <label
                className="text-[11px] font-semibold uppercase tracking-[0.06em] mb-1.5 block"
                style={{ color: 'var(--color-obs-primary)' }}
              >
                氏名 <span style={{ color: 'var(--color-obs-hot)' }}>*</span>
              </label>
              <input
                type="text"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                required
                className="w-full h-[36px] px-3 text-[14px] rounded-[8px] outline-none transition-all"
                style={{ ...inputBaseStyle, color: 'var(--color-obs-text)' }}
              />
            </div>

            {/* 紐付け企業 */}
            <div>
              <label
                className="text-[11px] font-semibold uppercase tracking-[0.06em] mb-1.5 block"
                style={{ color: 'var(--color-obs-primary)' }}
              >
                紐付け企業
              </label>
              <CompanyPicker
                companyId={form.companyId}
                companyName={form.company}
                email={form.email}
                onSelect={(id, name) =>
                  setForm((f) => ({ ...f, companyId: id, company: name }))
                }
              />
              <p
                className="mt-1.5 text-[10.5px] leading-snug"
                style={{ color: 'var(--color-obs-text-subtle)' }}
              >
                メールアドレスのドメインから推測候補を提示します。検索でも紐付け可能です。
              </p>
            </div>

            {/* 部署 + 役職 */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label
                  className="text-[11px] font-semibold uppercase tracking-[0.06em] mb-1.5 block"
                  style={{ color: 'var(--color-obs-primary)' }}
                >
                  部署
                </label>
                <input
                  type="text"
                  value={form.department}
                  onChange={e => setForm(f => ({ ...f, department: e.target.value }))}
                  className="w-full h-[36px] px-3 text-[14px] rounded-[8px] outline-none"
                  style={{ ...inputBaseStyle, color: 'var(--color-obs-text)' }}
                />
              </div>
              <div>
                <label
                  className="text-[11px] font-semibold uppercase tracking-[0.06em] mb-1.5 block"
                  style={{ color: 'var(--color-obs-primary)' }}
                >
                  役職
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  className="w-full h-[36px] px-3 text-[14px] rounded-[8px] outline-none"
                  style={{ ...inputBaseStyle, color: 'var(--color-obs-text)' }}
                />
              </div>
            </div>

            {/* メール */}
            <div>
              <label
                className="text-[11px] font-semibold uppercase tracking-[0.06em] mb-1.5 block"
                style={{ color: 'var(--color-obs-primary)' }}
              >
                メールアドレス
              </label>
              <input
                type="email"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                className="w-full h-[36px] px-3 text-[14px] rounded-[8px] outline-none"
                style={{ ...inputBaseStyle, color: 'var(--color-obs-text)' }}
              />
            </div>

            {/* 電話 */}
            <div>
              <label
                className="text-[11px] font-semibold uppercase tracking-[0.06em] mb-1.5 block"
                style={{ color: 'var(--color-obs-primary)' }}
              >
                電話番号
              </label>
              <input
                type="tel"
                value={form.phone}
                onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                className="w-full h-[36px] px-3 text-[14px] rounded-[8px] outline-none"
                style={{ ...inputBaseStyle, color: 'var(--color-obs-text)' }}
              />
            </div>

            {/* ステータス */}
            <div>
              <label
                className="text-[11px] font-semibold uppercase tracking-[0.06em] mb-1.5 block"
                style={{ color: 'var(--color-obs-primary)' }}
              >
                ステータス
              </label>
              <div className="relative">
                <select
                  value={form.status}
                  onChange={e => setForm(f => ({ ...f, status: e.target.value as ApproachStatus }))}
                  className="w-full h-[36px] px-3 pr-8 text-[13px] rounded-[8px] appearance-none cursor-pointer outline-none"
                  style={{ ...inputBaseStyle, color: 'var(--color-obs-text)' }}
                >
                  {STATUS_OPTIONS.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                <ChevronDown
                  size={13}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
                  style={{ color: 'var(--color-obs-text-muted)' }}
                />
              </div>
            </div>

            {/* 職位 */}
            <div>
              <label
                className="text-[11px] font-semibold uppercase tracking-[0.06em] mb-1.5 block"
                style={{ color: 'var(--color-obs-primary)' }}
              >
                職位
              </label>
              <div className="flex gap-1.5">
                {ALL_PERSON_ROLES.map(r => {
                  const style = PERSON_ROLE_STYLES[r]
                  const active = form.personRole === r
                  return (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setForm(f => ({ ...f, personRole: r }))}
                      className="flex-1 inline-flex items-center justify-center gap-1 h-[36px] rounded-[8px] text-[12px] font-medium transition-all"
                      style={active ? {
                        backgroundColor: style.bg,
                        color: style.fg,
                        boxShadow: 'inset 0 0 0 1px rgba(109,106,111,0.12)',
                      } : {
                        background: 'var(--color-obs-surface-low)',
                        boxShadow: 'inset 0 0 0 1px rgba(109,106,111,0.12)',
                        color: 'var(--color-obs-text-muted)',
                      }}
                    >
                      <Star size={11} style={{ color: active ? style.fg : 'currentColor', opacity: active ? 0.85 : 0.6 }} fill={active ? 'currentColor' : 'none'} />
                      {r}
                    </button>
                  )
                })}
              </div>
            </div>

          </div>

          {/* Footer */}
          <div
            className="flex justify-end gap-2 px-5 py-4"
            style={{ boxShadow: 'inset 0 1px 0 rgba(109,106,111,0.12)' }}
          >
            <button
              type="button"
              onClick={onClose}
              className="h-[36px] px-4 text-[13px] font-medium rounded-[8px] transition-colors hover:bg-[var(--color-obs-surface-high)]"
              style={{ color: 'var(--color-obs-text-muted)' }}
            >
              キャンセル
            </button>
            <button
              type="submit"
              className="h-[36px] px-5 text-[13px] font-semibold rounded-[8px] transition-all hover:brightness-106"
              style={{
                background: 'var(--color-obs-primary-container)',
                color: 'var(--color-obs-on-primary)',
                boxShadow: '0 8px 24px rgba(0,113,227,0.20)',
              }}
            >
              保存
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function ContactDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params)

  const initialContact = MOCK_CONTACTS[id] ?? MOCK_CONTACTS['1']!
  const [contact, setContact] = useState<ContactDetail>(initialContact)
  const [showEditModal, setShowEditModal] = useState(false)
  // 独立したタスクカード用 state(モック) — 取引詳細と同じ DealTask 型 + DealTaskModal を使用
  const [tasks, setTasks] = useState<DealTask[]>([])
  const [taskModal, setTaskModal] = useState<{ task: DealTask | null } | null>(null)
  // タスク詳細(タイトル+メモ)を展開するための state
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null)
  const openCreateTaskModal = () => setTaskModal({ task: null })
  const saveTask = (task: DealTask) => {
    setTasks((prev) => {
      const exists = prev.some((t) => t.id === task.id)
      return exists ? prev.map((t) => (t.id === task.id ? task : t)) : [...prev, task]
    })
  }
  const toggleTaskDone = (id: string) =>
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)))
  const deleteTask = (id: string) =>
    setTasks((prev) => prev.filter((t) => t.id !== id))

  const nestedInputStyle: React.CSSProperties = {
    background: 'var(--color-obs-surface-low)',
    boxShadow: 'inset 0 0 0 1px rgba(109,106,111,0.12)',
  }

  return (
    <div className="space-y-4">

      {/* ── Page Header ── */}
      <div className="flex items-center justify-between">
        <Link
          href="/contacts"
          className="flex items-center gap-1 text-sm transition-colors"
          style={{ color: 'var(--color-obs-text-muted)' }}
        >
          <ChevronLeft size={15} />
          コンタクト一覧
        </Link>

      </div>

      {/* ── Main Layout ── */}
      <div className="flex gap-5 items-start">

        {/* ── Left Column ── */}
        <div className="flex-1 min-w-0 space-y-4">

          {/* Contact Info Card */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="rounded-[12px] p-5"
            style={CARD_STYLE}
          >
            <div className="flex items-center gap-4">
              {/* Avatar — primary→primary_container グラデ1種のみ、シャドウ・グロウなし */}
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center shrink-0"
                style={{
                  background: 'linear-gradient(135deg, var(--color-obs-primary) 0%, var(--color-obs-primary-container) 100%)',
                }}
              >
                <span className="text-[17px] font-semibold" style={{ color: 'var(--color-obs-on-primary)' }}>{contact.name[0]}</span>
              </div>

              <div className="flex-1 min-w-0 flex flex-col gap-1.5">
                {/* 1行目: 氏名 + 職位チップ */}
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1
                    className="text-[20px] font-semibold tracking-[-0.02em] leading-none"
                    style={{ color: 'var(--color-obs-text)' }}
                  >
                    {contact.name}
                  </h1>
                  <PersonRoleSelector
                    value={contact.personRole}
                    onChange={v => setContact(c => ({ ...c, personRole: v }))}
                  />
                </div>

                {/* 2行目: 会社 → 部門 → 役職（軽い区切りで横整列） */}
                <div className="flex items-center gap-2 flex-wrap text-[12.5px]">
                  <Link
                    href={`/companies/${contact.companyId}`}
                    className="inline-flex items-center gap-1.5 font-medium transition-colors hover:!text-[color:var(--color-obs-primary)]"
                    style={{ color: 'var(--color-obs-text)' }}
                  >
                    <Building2 size={12} style={{ color: 'var(--color-obs-text-subtle)' }} />
                    {contact.company}
                  </Link>
                  {(contact.department || contact.title) && (
                    <span style={{ color: 'var(--color-obs-text-subtle)', opacity: 0.6 }}>·</span>
                  )}
                  {contact.department && (
                    <span style={{ color: 'var(--color-obs-text-muted)' }}>{contact.department}</span>
                  )}
                  {contact.department && contact.title && (
                    <span style={{ color: 'var(--color-obs-text-subtle)', opacity: 0.5 }}>/</span>
                  )}
                  {contact.title && (
                    <span style={{ color: 'var(--color-obs-text-muted)' }}>{contact.title}</span>
                  )}
                </div>
              </div>

              {/* 編集ボタン (Ghost) */}
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowEditModal(true)}
                className="flex items-center gap-1.5 px-3 py-2 text-[12px] font-medium rounded-[8px] shrink-0 transition-colors hover:bg-[var(--color-obs-surface-high)]"
                style={{
                  background: 'transparent',
                  color: 'var(--color-obs-text-muted)',
                }}
                title="コンタクトを編集"
              >
                <Pencil size={12} strokeWidth={2.2} />
                編集
              </motion.button>
            </div>

            {/* Contact Details */}
            <div
              className="flex items-center gap-4 mt-4 pt-4"
              style={{ boxShadow: 'inset 0 1px 0 rgba(109,106,111,0.15)' }}
            >
              <a
                href={`mailto:${contact.email}`}
                className="flex items-center gap-1.5 text-sm transition-colors hover:!text-[color:var(--color-obs-primary)]"
                style={{ color: 'var(--color-obs-text-muted)' }}
              >
                <Mail size={13} />
                {contact.email}
              </a>
              <span className="w-px h-3" style={{ background: 'rgba(109,106,111,0.25)' }} />
              <a
                href={`tel:${contact.phone}`}
                className="flex items-center gap-1.5 text-sm transition-colors hover:!text-[color:var(--color-obs-primary)]"
                style={{ color: 'var(--color-obs-text-muted)' }}
              >
                <Phone size={13} />
                {contact.phone}
              </a>
            </div>
          </motion.div>

          {/* Activity Timeline (コール / メール / 会議 / ノートを統合) */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
            className="rounded-[12px] overflow-hidden"
            style={CARD_STYLE}
          >
            <div
              className="px-5 pt-4 pb-2"
              style={{ boxShadow: 'inset 0 -1px 0 rgba(109,106,111,0.15)' }}
            >
              <h2
                className="text-[15px] font-bold tracking-[-0.01em]"
                style={{ color: 'var(--color-obs-text)' }}
              >
                アクティビティ
              </h2>
              <p
                className="mt-0.5 text-[11px] leading-snug"
                style={{ color: 'var(--color-obs-text-subtle)' }}
              >
                コール・メール・会議の履歴を時系列で表示します(会議はカレンダーで作成された商談のうち本人が参加するもの)
              </p>
            </div>
            <div className="px-5 py-4">
              <ContactHistoryTimeline />
            </div>
          </motion.div>
        </div>

        {/* ── Right Sidebar ── */}
        <div className="w-[300px] shrink-0 space-y-4">

          {/* リサーチ */}
          <ResearchChatPanel entityType="contact" entityId={id} />

          {/* ネクストアクション統合カード = タスクと連動 (ステータスを上部に統合) */}
          <motion.div
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="rounded-[12px] p-5"
            style={CARD_STYLE}
          >
            <div className="flex items-center justify-between mb-4">
              <h3
                className="text-[13px] font-bold tracking-[-0.01em] flex items-center gap-1.5"
                style={{ color: 'var(--color-obs-text)' }}
              >
                <CalendarClock size={13} style={{ color: 'var(--color-obs-primary)' }} />
                次の対応
              </h3>
              <span
                className="inline-flex items-center gap-1 px-2 py-[2px] rounded-full text-[9px] font-semibold whitespace-nowrap"
                style={{
                  background: 'rgba(171,199,255,0.12)',
                  color: 'var(--color-obs-primary)',
                  boxShadow: 'inset 0 0 0 1px rgba(171,199,255,0.3)',
                }}
                title="ここで設定した内容は自動的にタスクとして登録されます"
              >
                <CheckCircle2 size={9} />
                タスク連動
              </span>
            </div>

            {/* IS担当者 + 申し送り + リード経由元 (一番上に配置) */}
            <div
              className="mb-4 pb-4 space-y-3.5"
              style={{ boxShadow: 'inset 0 -1px 0 rgba(109,106,111,0.15)' }}
            >
              <div>
                <label
                  className="text-[10px] font-semibold uppercase tracking-[0.04em] mb-1.5 flex items-center gap-1"
                  style={{ color: 'var(--color-obs-primary)' }}
                >
                  IS担当者
                  <Pencil size={9} style={{ color: 'var(--color-obs-primary)', opacity: 0.7 }} />
                </label>
                <OwnerSelector
                  value={contact.owner}
                  onChange={v => setContact(c => ({ ...c, owner: v }))}
                />
                {/* 後続担当への申し送り事項 */}
                <textarea
                  value={contact.handoverNote}
                  onChange={e => setContact(c => ({ ...c, handoverNote: e.target.value }))}
                  placeholder="後続担当への申し送り事項を入力(キーパーソン情報・温度感・連絡時の留意点など)"
                  rows={3}
                  className="w-full mt-2 px-3 py-2 text-[12px] outline-none rounded-[8px] resize-none transition-all leading-relaxed"
                  style={{ ...nestedInputStyle, color: 'var(--color-obs-text)' }}
                  onFocus={e => {
                    e.currentTarget.style.boxShadow = 'inset 0 0 0 1px var(--color-obs-primary)'
                  }}
                  onBlur={e => {
                    e.currentTarget.style.boxShadow = 'inset 0 0 0 1px rgba(109,106,111,0.12)'
                  }}
                />
              </div>
              <div>
                <label
                  className="text-[10px] font-semibold uppercase tracking-[0.04em] mb-1.5 flex items-center gap-1"
                  style={{ color: 'var(--color-obs-primary)' }}
                >
                  リード経由元
                  <Pencil size={9} style={{ color: 'var(--color-obs-primary)', opacity: 0.7 }} />
                </label>
                <LeadSourceSelector
                  value={contact.leadSource}
                  onChange={v => setContact(c => ({ ...c, leadSource: v }))}
                />
              </div>
            </div>

            {/* ステータス */}
            <div className="mb-3">
              <label
                className="text-[10px] font-semibold uppercase tracking-[0.04em] mb-1.5 flex items-center gap-1"
                style={{ color: 'var(--color-obs-primary)' }}
              >
                ステータス
                <Pencil size={9} style={{ color: 'var(--color-obs-primary)', opacity: 0.7 }} />
              </label>
              <StatusSelector
                value={contact.status}
                onChange={v => setContact(c => ({ ...c, status: v }))}
              />
            </div>

            {/* Next Action 内容 (フリーテキスト) */}
            <div className="mb-3">
              <label
                className="text-[10px] font-semibold uppercase tracking-[0.04em] mb-1.5 flex items-center gap-1"
                style={{ color: 'var(--color-obs-primary)' }}
              >
                Next Action
                <Pencil size={9} style={{ color: 'var(--color-obs-primary)', opacity: 0.7 }} />
              </label>
              <div
                className="relative rounded-[8px] transition-all"
                style={nestedInputStyle}
              >
                <input
                  type="text"
                  value={contact.nextAction ?? ''}
                  onChange={e => setContact(c => ({ ...c, nextAction: e.target.value || null }))}
                  placeholder="例: 比較表のフォローコール"
                  className="w-full h-[36px] px-3 text-[13px] font-medium outline-none bg-transparent"
                  style={{ color: 'var(--color-obs-text)' }}
                  onFocus={e => {
                    e.currentTarget.parentElement!.style.boxShadow = 'inset 0 0 0 1px var(--color-obs-primary)'
                  }}
                  onBlur={e => {
                    e.currentTarget.parentElement!.style.boxShadow = 'inset 0 0 0 1px rgba(109,106,111,0.12)'
                  }}
                />
              </div>
            </div>

            {/* 実施予定日 */}
            <div>
              <label
                className="text-[10px] font-semibold uppercase tracking-[0.04em] mb-1.5 flex items-center justify-between"
                style={{ color: 'var(--color-obs-primary)' }}
              >
                <span className="flex items-center gap-1">
                  実施予定日
                  <Pencil size={9} style={{ color: 'var(--color-obs-primary)', opacity: 0.7 }} />
                </span>
                {contact.nextActionAt && (
                  <button
                    type="button"
                    onClick={() => setContact(c => ({ ...c, nextActionAt: null }))}
                    className="inline-flex items-center gap-0.5 text-[10px] font-semibold transition-colors normal-case tracking-normal hover:!text-[color:var(--color-obs-hot)]"
                    style={{ color: 'var(--color-obs-text-muted)' }}
                    title="日付をクリア"
                  >
                    <X size={10} />
                    クリア
                  </button>
                )}
              </label>
              <div
                className="relative rounded-[8px] transition-all"
                style={nestedInputStyle}
              >
                <input
                  type="date"
                  value={contact.nextActionAt ?? ''}
                  onChange={e => setContact(c => ({ ...c, nextActionAt: e.target.value || null }))}
                  className="w-full h-[36px] px-3 pr-9 text-[13px] font-medium outline-none bg-transparent cursor-pointer"
                  style={{ colorScheme: 'dark', color: 'var(--color-obs-text)' }}
                  onFocus={e => {
                    e.currentTarget.parentElement!.style.boxShadow = 'inset 0 0 0 1px var(--color-obs-primary)'
                  }}
                  onBlur={e => {
                    e.currentTarget.parentElement!.style.boxShadow = 'inset 0 0 0 1px rgba(109,106,111,0.12)'
                  }}
                />
                <Pencil
                  size={11}
                  className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
                  style={{ color: 'var(--color-obs-text-muted)' }}
                />
              </div>
            </div>

            {/* メモ */}
            <div
              className="mt-3 pt-3"
              style={{ boxShadow: 'inset 0 1px 0 rgba(109,106,111,0.15)' }}
            >
              <label
                className="text-[10px] font-semibold uppercase tracking-[0.04em] mb-1.5 flex items-center gap-1"
                style={{ color: 'var(--color-obs-primary)' }}
              >
                メモ
                <Pencil size={9} style={{ color: 'var(--color-obs-primary)', opacity: 0.7 }} />
              </label>
              <textarea
                value={contact.nextActionMemo}
                onChange={e => setContact(c => ({ ...c, nextActionMemo: e.target.value }))}
                placeholder="次回アクションに関するメモを入力..."
                rows={3}
                className="w-full px-3 py-2 text-[12px] outline-none rounded-[8px] resize-none transition-all"
                style={{ ...nestedInputStyle, color: 'var(--color-obs-text)' }}
                onFocus={e => {
                  e.currentTarget.style.boxShadow = 'inset 0 0 0 1px var(--color-obs-primary)'
                }}
                onBlur={e => {
                  e.currentTarget.style.boxShadow = 'inset 0 0 0 1px rgba(109,106,111,0.12)'
                }}
              />
            </div>

          </motion.div>

          {/* ── タスクカード(独立) ─────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.14, ease: [0.16, 1, 0.3, 1] }}
            className="rounded-[12px] overflow-hidden"
            style={CARD_STYLE}
          >
            {/* Header */}
            <div
              className="px-5 pt-4 pb-3 flex items-center gap-2"
              style={{ boxShadow: 'inset 0 -1px 0 rgba(109,106,111,0.15)' }}
            >
              <CheckCircle2 size={13} style={{ color: 'var(--color-obs-primary)' }} />
              <h3
                className="flex-1 text-xs font-semibold uppercase tracking-[0.06em]"
                style={{ color: 'var(--color-obs-text-muted)' }}
              >
                タスク
              </h3>
              <span
                className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[10px] font-bold tabular-nums"
                style={{
                  background: 'rgba(171,199,255,0.12)',
                  color: 'var(--color-obs-primary)',
                }}
              >
                {tasks.length}
              </span>
              <button
                type="button"
                onClick={openCreateTaskModal}
                className="inline-flex items-center gap-1 px-2.5 h-[26px] rounded-[7px] text-[10.5px] font-semibold transition-all hover:brightness-110"
                style={{
                  background: 'var(--color-obs-primary-container)',
                  color: 'var(--color-obs-on-primary)',
                }}
              >
                <Plus size={10} strokeWidth={2.4} />
                作成
              </button>
            </div>

            {/* Body */}
            {tasks.length === 0 ? (
              <div className="px-4 py-6 text-center">
                <p className="text-[11.5px]" style={{ color: 'var(--color-obs-text-muted)' }}>
                  タスクが登録されていません
                </p>
                <button
                  type="button"
                  onClick={openCreateTaskModal}
                  className="mt-2 inline-flex items-center gap-1 text-[10.5px] font-bold transition-colors hover:text-[var(--color-obs-text)]"
                  style={{ color: 'var(--color-obs-primary)' }}
                >
                  <Plus size={10} strokeWidth={2.5} />
                  最初のタスクを作成
                </button>
              </div>
            ) : (
              <div>
                {tasks.map((task, i) => {
                  const cfg = DEAL_TASK_TYPE_STYLES[task.type]
                  const TypeIcon = cfg.Icon
                  const dueDate = task.dueAt ? new Date(task.dueAt) : null
                  const isOverdue =
                    dueDate && !task.done && dueDate < new Date(new Date().toDateString())
                  const dueLabel = dueDate
                    ? `${dueDate.getMonth() + 1}/${dueDate.getDate()}`
                    : null
                  const isExpanded = expandedTaskId === task.id
                  return (
                    <div
                      key={task.id}
                      style={
                        i < tasks.length - 1
                          ? { boxShadow: 'inset 0 -1px 0 rgba(109,106,111,0.10)' }
                          : undefined
                      }
                    >
                      <div
                        className="flex items-center gap-2 px-3.5 py-2.5 transition-colors hover:bg-[rgba(171,199,255,0.04)] group cursor-pointer"
                        onClick={() => {
                          setExpandedTaskId(isExpanded ? null : task.id)
                        }}
                      >
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleTaskDone(task.id)
                          }}
                          className="w-4 h-4 rounded-[4px] flex items-center justify-center shrink-0 transition-all"
                          style={{
                            backgroundColor: task.done
                              ? 'var(--color-obs-primary-container)'
                              : 'var(--color-obs-surface-lowest)',
                            boxShadow: task.done
                              ? 'none'
                              : 'inset 0 0 0 1px rgba(109,106,111,0.25)',
                          }}
                          aria-label={task.done ? '未完了に戻す' : '完了にする'}
                        >
                          {task.done && (
                            <CheckCircle2
                              size={10}
                              strokeWidth={2.5}
                              style={{ color: 'var(--color-obs-on-primary)' }}
                            />
                          )}
                        </button>

                        {/* タイプアイコン (取引詳細のタスクUIと統一) */}
                        <div
                          className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
                          style={{
                            backgroundColor: cfg.bg,
                            opacity: task.done ? 0.5 : 1,
                          }}
                        >
                          <TypeIcon size={12} style={{ color: cfg.iconColor }} strokeWidth={2} />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <p
                              className="text-[12px] font-medium truncate"
                              style={{
                                color: task.done
                                  ? 'var(--color-obs-text-subtle)'
                                  : 'var(--color-obs-text)',
                                textDecoration: task.done ? 'line-through' : 'none',
                              }}
                            >
                              {task.title}
                            </p>
                          </div>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            {dueLabel && (
                              <span
                                className="inline-flex items-center gap-1 px-1.5 py-[1px] rounded-[4px] text-[9.5px] font-bold tabular-nums whitespace-nowrap shrink-0"
                                style={{
                                  background: isOverdue
                                    ? 'rgba(255,107,107,0.14)'
                                    : 'rgba(171,199,255,0.10)',
                                  color: isOverdue
                                    ? 'var(--color-obs-hot)'
                                    : 'var(--color-obs-primary)',
                                }}
                              >
                                <Calendar size={8} strokeWidth={2.5} />
                                {dueLabel}
                              </span>
                            )}
                            {task.memo && (
                              <p
                                className="text-[10.5px] truncate"
                                style={{ color: 'var(--color-obs-text-muted)' }}
                              >
                                {task.memo}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-0.5 shrink-0">
                          {/* 展開トグル — クリックでタイトル/メモのインライン編集を表示 */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              setExpandedTaskId(isExpanded ? null : task.id)
                            }}
                            className="w-6 h-6 flex items-center justify-center rounded-[5px] transition-colors hover:bg-[var(--color-obs-surface-high)]"
                            aria-label={isExpanded ? '詳細を閉じる' : '詳細を編集'}
                            aria-expanded={isExpanded}
                            title={isExpanded ? '詳細を閉じる' : 'タイトル・メモを編集'}
                          >
                            <ChevronDown
                              size={11}
                              strokeWidth={2.2}
                              style={{
                                color: 'var(--color-obs-text-muted)',
                                transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                                transition: 'transform 150ms var(--ease-liquid)',
                              }}
                            />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              deleteTask(task.id)
                            }}
                            className="w-6 h-6 flex items-center justify-center rounded-[5px] transition-colors opacity-0 group-hover:opacity-100 hover:bg-[rgba(255,107,107,0.12)]"
                            title="削除"
                          >
                            <Trash2 size={10} style={{ color: 'var(--color-obs-hot)' }} />
                          </button>
                        </div>
                      </div>

                      {/* 展開エリア — タイトル + メモをインライン編集 (blur時に自動保存) */}
                      <AnimatePresence initial={false}>
                        {isExpanded && (
                          <motion.div
                            key={`detail-${task.id}`}
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                            className="overflow-hidden"
                          >
                            <div
                              className="mx-3.5 mb-2.5 px-3 py-2.5 rounded-[8px] space-y-2.5"
                              style={{
                                backgroundColor: 'var(--color-obs-surface-low)',
                                boxShadow: 'inset 0 0 0 1px rgba(109,106,111,0.12)',
                              }}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <div>
                                <p
                                  className="text-[9px] font-bold uppercase tracking-[0.06em] mb-1 inline-flex items-center gap-1"
                                  style={{ color: 'var(--color-obs-text-subtle)' }}
                                >
                                  <CheckCircle2 size={9} />
                                  タイトル
                                </p>
                                <input
                                  type="text"
                                  defaultValue={task.title}
                                  onBlur={(e) => {
                                    const newTitle = e.target.value
                                    if (newTitle !== task.title) {
                                      saveTask({ ...task, title: newTitle })
                                    }
                                  }}
                                  placeholder="タイトルを入力..."
                                  className="w-full px-2 py-1.5 text-[12px] font-medium leading-snug outline-none rounded-[6px] transition-all"
                                  style={{
                                    background: 'var(--color-obs-surface-lowest)',
                                    color: 'var(--color-obs-text)',
                                    boxShadow: 'inset 0 0 0 1px rgba(109,106,111,0.10)',
                                  }}
                                  onFocus={(e) => {
                                    e.currentTarget.style.boxShadow = 'inset 0 0 0 1px var(--color-obs-primary)'
                                  }}
                                  onBlurCapture={(e) => {
                                    e.currentTarget.style.boxShadow = 'inset 0 0 0 1px rgba(109,106,111,0.10)'
                                  }}
                                />
                              </div>
                              <div>
                                <p
                                  className="text-[9px] font-bold uppercase tracking-[0.06em] mb-1 inline-flex items-center gap-1"
                                  style={{ color: 'var(--color-obs-text-subtle)' }}
                                >
                                  <FileText size={9} />
                                  メモ
                                </p>
                                <textarea
                                  defaultValue={task.memo}
                                  onBlur={(e) => {
                                    const newMemo = e.target.value
                                    if (newMemo !== task.memo) {
                                      saveTask({ ...task, memo: newMemo })
                                    }
                                  }}
                                  placeholder="メモを入力..."
                                  rows={3}
                                  className="w-full px-2 py-1.5 text-[11.5px] leading-relaxed outline-none rounded-[6px] resize-none transition-all"
                                  style={{
                                    background: 'var(--color-obs-surface-lowest)',
                                    color: 'var(--color-obs-text-muted)',
                                    boxShadow: 'inset 0 0 0 1px rgba(109,106,111,0.10)',
                                  }}
                                  onFocus={(e) => {
                                    e.currentTarget.style.boxShadow = 'inset 0 0 0 1px var(--color-obs-primary)'
                                  }}
                                  onBlurCapture={(e) => {
                                    e.currentTarget.style.boxShadow = 'inset 0 0 0 1px rgba(109,106,111,0.10)'
                                  }}
                                />
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )
                })}
              </div>
            )}
          </motion.div>

        </div>
      </div>

      {/* ── Edit Modal ── */}
      <AnimatePresence>
        {showEditModal && (
          <EditContactModal
            contact={contact}
            onClose={() => setShowEditModal(false)}
            onSave={updated => setContact(updated)}
          />
        )}
      </AnimatePresence>

      {/* ── Task Modal (取引詳細と同じ仕様: コール / メール / その他) ── */}
      <AnimatePresence>
        {taskModal && (
          <DealTaskModal
            task={taskModal.task}
            onClose={() => setTaskModal(null)}
            onSave={saveTask}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
