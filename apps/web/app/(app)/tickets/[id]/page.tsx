'use client'

import { use, useEffect, useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  Briefcase,
  CalendarClock,
  Check,
  CheckCircle2,
  LifeBuoy,
  Link2,
  Pencil,
  CircleDot,
  RotateCcw,
  StickyNote,
  User as UserIcon,
} from 'lucide-react'
import { ObsCard, ObsPageShell } from '@/components/obsidian'
import { StatusBadge } from '../_components/StatusBadge'
import { StatusDropdown } from '../_components/StatusDropdown'
import { getMockTicketDetail, MOCK_ORG_USERS } from '../_lib/mock'
import type { OrgUser, TicketDetail, TicketStatus } from '../_types'

function fmt(iso?: string | null) {
  if (!iso) return '—'
  const d = new Date(iso)
  return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(
    2,
    '0',
  )}:${String(d.getMinutes()).padStart(2, '0')}`
}

// ISO→YYYY-MM-DD
function toDateInput(iso?: string | null): string {
  if (!iso) return ''
  const d = new Date(iso)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate(),
  ).padStart(2, '0')}`
}

export default function TicketDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const [ticket, setTicket] = useState<TicketDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [users, setUsers] = useState<OrgUser[]>([])

  // フォーム状態 (blur で保存)
  const [subject, setSubject] = useState('')
  const [description, setDescription] = useState('')
  const [cause, setCause] = useState('')
  const [resolution, setResolution] = useState('')
  const [memo, setMemo] = useState('')
  const [savingField, setSavingField] = useState<string | null>(null)

  useEffect(() => {
    let abort = false
    async function load() {
      // モックID(mock-X)はAPIを叩かずダミーから直接取得
      if (id.startsWith('mock-')) {
        const mock = getMockTicketDetail(id)
        if (abort) return
        if (mock) {
          setTicket(mock)
          setSubject(mock.subject)
          setDescription(mock.description ?? '')
          setCause(mock.cause ?? '')
          setResolution(mock.resolution ?? '')
          setMemo(mock.memo ?? '')
        } else {
          setNotFound(true)
        }
        setLoading(false)
        return
      }

      const res = await fetch(`/api/tickets/${id}`, { cache: 'no-store' })
      if (abort) return
      if (res.status === 404) {
        setNotFound(true)
        setLoading(false)
        return
      }
      if (res.ok) {
        const json = (await res.json()) as { ticket: TicketDetail }
        setTicket(json.ticket)
        setSubject(json.ticket.subject)
        setDescription(json.ticket.description ?? '')
        setCause(json.ticket.cause ?? '')
        setResolution(json.ticket.resolution ?? '')
        setMemo(json.ticket.memo ?? '')
      }
      setLoading(false)
    }
    load()
    return () => {
      abort = true
    }
  }, [id])

  // 担当者select用のorg内ユーザー一覧
  useEffect(() => {
    let abort = false
    async function loadUsers() {
      try {
        const res = await fetch('/api/users', { cache: 'no-store' })
        if (abort) return
        if (res.ok) {
          const json = (await res.json()) as { users: OrgUser[] }
          setUsers(json.users.length > 0 ? json.users : MOCK_ORG_USERS)
        } else {
          setUsers(MOCK_ORG_USERS)
        }
      } catch {
        setUsers(MOCK_ORG_USERS)
      }
    }
    loadUsers()
    return () => {
      abort = true
    }
  }, [])

  async function patch(field: string, body: Record<string, unknown>) {
    // モックは保存をスキップ(ローカルstate更新のみ)
    if (id.startsWith('mock-')) {
      setTicket((prev) => {
        if (!prev) return prev
        const next = { ...prev, ...body } as TicketDetail
        // ステータス遷移に応じて解決日/クローズ日を自動セット
        if ('status' in body) {
          const newStatus = body.status as TicketStatus
          const now = new Date().toISOString()
          if (newStatus === 'SOLVED' && prev.status !== 'SOLVED') {
            next.resolvedAt = now
          } else if (newStatus === 'CLOSED' && prev.status !== 'CLOSED') {
            next.closedAt = now
            if (!next.resolvedAt) next.resolvedAt = now
          } else if (newStatus === 'OPEN' || newStatus === 'PENDING') {
            next.resolvedAt = null
            next.closedAt = null
          }
        }
        return next
      })
      return
    }
    setSavingField(field)
    try {
      const res = await fetch(`/api/tickets/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (res.ok) {
        const json = (await res.json()) as { ticket: TicketDetail }
        setTicket(json.ticket)
      }
    } finally {
      setSavingField(null)
    }
  }

  if (loading) {
    return (
      <ObsPageShell>
        <div className="text-center py-20" style={{ color: 'var(--color-obs-text-muted)' }}>
          読み込み中...
        </div>
      </ObsPageShell>
    )
  }

  if (notFound || !ticket) {
    return (
      <ObsPageShell>
        <div className="text-center py-20">
          <p className="text-[14px]" style={{ color: 'var(--color-obs-text-muted)' }}>
            チケットが見つかりませんでした
          </p>
          <Link href="/tickets" className="text-[12px] mt-3 inline-block" style={{ color: 'var(--color-obs-primary)' }}>
            問い合わせチケットに戻る
          </Link>
        </div>
      </ObsPageShell>
    )
  }

  return (
    <ObsPageShell>
      <div className="w-full px-8 xl:px-12 2xl:px-16 py-8 pb-16">
      {/* 戻る */}
      <Link
        href="/tickets"
        className="inline-flex items-center gap-1.5 text-[12px] mb-4 transition-colors"
        style={{ color: 'var(--color-obs-text-muted)' }}
      >
        <ArrowLeft size={12} />
        問い合わせチケット
      </Link>

      {/* ヘッダ */}
      <div className="mb-6">
        <div
          className="flex items-center gap-2 text-[11.5px] mb-2"
          style={{ color: 'var(--color-obs-text-subtle)' }}
        >
          <LifeBuoy size={11} />
          <span className="font-mono">T-{String(ticket.ticketNumber).padStart(4, '0')}</span>
          <span>·</span>
          <span>作成 {fmt(ticket.createdAt)}</span>
          <StatusBadge status={ticket.status} />
          {ticket.resolvedAt && (
            <>
              <span>·</span>
              <span className="inline-flex items-center gap-1">
                <CheckCircle2 size={11} />
                解決 {fmt(ticket.resolvedAt)}
              </span>
            </>
          )}
        </div>
        <div className="flex items-start gap-3">
          <div className="flex-1 min-w-0">
            <EditableTitle
              value={subject}
              onChange={setSubject}
              onCommit={() => {
                if (subject.trim() && subject !== ticket.subject) {
                  patch('subject', { subject })
                } else if (!subject.trim()) {
                  setSubject(ticket.subject)
                }
              }}
            />
          </div>
          <CopyLinkButton variant="prominent" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* 本文 */}
        <div className="lg:col-span-2 space-y-4">
          <Section
            title="チケット内容"
            saving={savingField === 'description'}
            value={description}
            placeholder="お客様からのチケット内容を記載..."
            onChange={setDescription}
            onSave={() =>
              description !== (ticket.description ?? '') && patch('description', { description })
            }
          />

          <Section
            title="原因"
            saving={savingField === 'cause'}
            value={cause}
            placeholder="調査して判明した原因を記載..."
            onChange={setCause}
            onSave={() => cause !== (ticket.cause ?? '') && patch('cause', { cause })}
          />

          <Section
            title="対応方針"
            saving={savingField === 'resolution'}
            value={resolution}
            placeholder="どう対応するか・どう対応したかを記載..."
            onChange={setResolution}
            onSave={() =>
              resolution !== (ticket.resolution ?? '') && patch('resolution', { resolution })
            }
          />
        </div>

        {/* 右ペイン */}
        <div className="space-y-4">
          {/* 紐付き情報 (読み取り専用) */}
          <ObsCard depth="low" padding="lg" radius="lg">
            <h3
              className="text-[11.5px] font-medium tracking-wide mb-3"
              style={{ color: 'var(--color-obs-text-muted)' }}
            >
              紐付き情報
            </h3>
            <div className="space-y-3 text-[13px]">
              <DefRow label="取引" icon={Briefcase}>
                {ticket.deal ? (
                  <Link
                    href={`/deals/${ticket.deal.id}`}
                    className="hover:underline"
                    style={{ color: 'var(--color-obs-primary)' }}
                  >
                    {ticket.deal.name}
                  </Link>
                ) : (
                  <span style={{ color: 'var(--color-obs-text-subtle)' }}>—</span>
                )}
              </DefRow>
              <DefRow label="作成日">
                <span className="tabular-nums" style={{ color: 'var(--color-obs-text)' }}>
                  {fmt(ticket.createdAt)}
                </span>
              </DefRow>
              <DefRow label="解決日">
                <span className="tabular-nums" style={{ color: 'var(--color-obs-text)' }}>
                  {fmt(ticket.resolvedAt)}
                </span>
              </DefRow>
            </div>
          </ObsCard>

          {/* 対応 (編集可能) */}
          <ObsCard depth="low" padding="lg" radius="lg">
            <div className="flex items-center justify-between mb-3 gap-3">
              <h3
                className="text-[11.5px] font-medium tracking-wide"
                style={{ color: 'var(--color-obs-text-muted)' }}
              >
                対応
              </h3>
              <CompleteButton
                status={ticket.status}
                onSolve={() => patch('status', { status: 'SOLVED' })}
                onReopen={() => patch('status', { status: 'OPEN' })}
              />
            </div>
            <div className="space-y-3">
              <FieldRow label="ステータス" icon={CircleDot}>
                <StatusDropdown
                  value={ticket.status}
                  onChange={(s) => patch('status', { status: s })}
                />
              </FieldRow>
              <FieldRow label="対応者" icon={UserIcon}>
                <UserSelect
                  value={ticket.assignee?.id ?? ''}
                  users={users}
                  onChange={(uid) => patch('assigneeUserId', { assigneeUserId: uid || null })}
                  placeholder="未指定"
                />
              </FieldRow>
              <FieldRow label="完了見込み" icon={CalendarClock}>
                <DateInput
                  value={toDateInput(ticket.estimatedCompletionAt)}
                  onChange={(v) =>
                    patch('estimatedCompletionAt', {
                      estimatedCompletionAt: v ? new Date(v).toISOString() : null,
                    })
                  }
                />
              </FieldRow>
              <FieldRow label="メモ" icon={StickyNote}>
                <MemoInput
                  value={memo}
                  onChange={setMemo}
                  onSave={() => {
                    if (memo !== (ticket.memo ?? '')) patch('memo', { memo })
                  }}
                  placeholder="社内向けの作業メモを残せます..."
                />
              </FieldRow>
            </div>
          </ObsCard>
        </div>
      </div>
      </div>
    </ObsPageShell>
  )
}

function Section({
  title,
  value,
  placeholder,
  onChange,
  onSave,
  saving,
}: {
  title: string
  value: string
  placeholder: string
  onChange: (v: string) => void
  onSave: () => void
  saving: boolean
}) {
  const [focused, setFocused] = useState(false)
  const [hovered, setHovered] = useState(false)
  return (
    <ObsCard depth="low" padding="lg" radius="lg">
      <div className="flex items-center justify-between mb-2">
        <h3
          className="text-[11.5px] font-medium tracking-wide inline-flex items-center gap-1.5"
          style={{ color: 'var(--color-obs-text-muted)' }}
        >
          {title}
          <Pencil
            size={10}
            style={{
              color: 'var(--color-obs-text-subtle)',
              opacity: hovered || focused ? 1 : 0.5,
              transition: 'opacity 0.15s ease',
            }}
          />
        </h3>
        {saving ? (
          <span className="text-[10.5px]" style={{ color: 'var(--color-obs-text-subtle)' }}>
            保存中...
          </span>
        ) : (
          <span
            className="text-[10.5px]"
            style={{
              color: 'var(--color-obs-text-subtle)',
              opacity: hovered || focused ? 1 : 0,
              transition: 'opacity 0.15s ease',
            }}
          >
            クリックで編集
          </span>
        )}
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => {
          setFocused(false)
          onSave()
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        placeholder={placeholder}
        rows={4}
        className="w-full outline-none resize-none text-[13.5px] leading-relaxed rounded-[var(--radius-obs-md)] px-3 py-2 transition-colors duration-150 cursor-text"
        style={{
          color: 'var(--color-obs-text)',
          backgroundColor: focused
            ? 'var(--color-obs-surface)'
            : hovered
              ? 'var(--color-obs-surface-high)'
              : 'transparent',
          boxShadow: focused ? 'inset 0 0 0 1px var(--color-obs-primary)' : 'none',
        }}
      />
    </ObsCard>
  )
}

function CopyLinkButton({ variant = 'subtle' }: { variant?: 'subtle' | 'prominent' }) {
  const [copied, setCopied] = useState(false)
  async function copy() {
    if (typeof window === 'undefined') return
    const url = window.location.href
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      const ta = document.createElement('textarea')
      ta.value = url
      document.body.appendChild(ta)
      ta.select()
      try {
        document.execCommand('copy')
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      } catch {
        // ignore
      }
      document.body.removeChild(ta)
    }
  }
  if (variant === 'prominent') {
    return (
      <button
        type="button"
        onClick={copy}
        title="このチケットのURLをコピー"
        className="inline-flex items-center gap-1.5 h-9 px-3 rounded-[var(--radius-obs-md)] text-[12.5px] font-medium whitespace-nowrap shrink-0 transition-all duration-150"
        style={{
          backgroundColor: copied
            ? 'var(--color-obs-primary-container)'
            : 'var(--color-obs-surface-high)',
          color: copied ? 'var(--color-obs-on-primary)' : 'var(--color-obs-text)',
          boxShadow: 'inset 0 0 0 1px var(--color-obs-surface-highest)',
        }}
        onMouseOver={(e) => {
          if (!copied)
            (e.currentTarget as HTMLButtonElement).style.backgroundColor =
              'var(--color-obs-surface-highest)'
        }}
        onMouseOut={(e) => {
          if (!copied)
            (e.currentTarget as HTMLButtonElement).style.backgroundColor =
              'var(--color-obs-surface-high)'
        }}
      >
        {copied ? (
          <>
            <Check size={13} strokeWidth={2.4} />
            コピーしました
          </>
        ) : (
          <>
            <Link2 size={13} />
            リンクをコピー
          </>
        )}
      </button>
    )
  }
  return (
    <button
      type="button"
      onClick={copy}
      title="このチケットのURLをコピー"
      className="inline-flex items-center gap-1 h-6 px-2 rounded text-[10.5px] font-medium transition-colors"
      style={{
        color: copied ? 'var(--color-obs-primary)' : 'var(--color-obs-text-subtle)',
        backgroundColor: copied ? 'var(--color-obs-surface-high)' : 'transparent',
      }}
      onMouseOver={(e) => {
        if (!copied)
          (e.currentTarget as HTMLButtonElement).style.backgroundColor =
            'var(--color-obs-surface-high)'
      }}
      onMouseOut={(e) => {
        if (!copied) (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent'
      }}
    >
      {copied ? (
        <>
          <Check size={10} />
          コピー済み
        </>
      ) : (
        <>
          <Link2 size={10} />
          リンクをコピー
        </>
      )}
    </button>
  )
}

function CompleteButton({
  status,
  onSolve,
  onReopen,
}: {
  status: TicketStatus
  onSolve: () => void
  onReopen: () => void
}) {
  const isDone = status === 'SOLVED' || status === 'CLOSED'
  if (isDone) {
    return (
      <button
        onClick={onReopen}
        className="inline-flex items-center gap-1 h-7 px-3 rounded-full text-[11.5px] font-medium whitespace-nowrap transition-colors duration-150"
        style={{
          backgroundColor: 'var(--color-obs-surface-high)',
          color: 'var(--color-obs-text-muted)',
          boxShadow: 'inset 0 0 0 1px var(--color-obs-surface-highest)',
        }}
      >
        <RotateCcw size={11} />
        再開
      </button>
    )
  }
  return (
    <button
      onClick={onSolve}
      className="inline-flex items-center gap-1 h-7 px-3 rounded-full text-[11.5px] font-semibold whitespace-nowrap transition-all duration-150 hover:opacity-90 active:opacity-80"
      style={{
        background:
          'linear-gradient(140deg, var(--color-obs-primary) 0%, var(--color-obs-primary-container) 100%)',
        color: 'var(--color-obs-on-primary)',
        boxShadow: '0 2px 8px rgba(0,113,227,0.25)',
      }}
    >
      <Check size={12} strokeWidth={2.4} />
      対応完了
    </button>
  )
}

function MemoInput({
  value,
  onChange,
  onSave,
  placeholder,
}: {
  value: string
  onChange: (v: string) => void
  onSave: () => void
  placeholder: string
}) {
  const [focused, setFocused] = useState(false)
  const [hovered, setHovered] = useState(false)
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onFocus={() => setFocused(true)}
      onBlur={() => {
        setFocused(false)
        onSave()
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      placeholder={placeholder}
      rows={3}
      className="w-full outline-none resize-none text-[12.5px] leading-relaxed rounded-[var(--radius-obs-md)] px-3 py-2 transition-colors duration-150 cursor-text"
      style={{
        color: 'var(--color-obs-text)',
        backgroundColor: hovered
          ? 'var(--color-obs-surface-highest)'
          : 'var(--color-obs-surface-high)',
        boxShadow: focused
          ? 'inset 0 0 0 1px var(--color-obs-primary)'
          : 'inset 0 0 0 1px var(--color-obs-surface-highest)',
      }}
    />
  )
}

function EditableTitle({
  value,
  onChange,
  onCommit,
}: {
  value: string
  onChange: (v: string) => void
  onCommit: () => void
}) {
  const [focused, setFocused] = useState(false)
  const [hovered, setHovered] = useState(false)
  return (
    <div className="flex items-center gap-2 group">
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => {
          setFocused(false)
          onCommit()
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="flex-1 outline-none text-[20px] font-semibold tracking-[-0.015em] rounded-[var(--radius-obs-md)] px-2 py-1 -mx-2 transition-colors duration-150 cursor-text"
        style={{
          color: 'var(--color-obs-text)',
          backgroundColor: focused
            ? 'var(--color-obs-surface)'
            : hovered
              ? 'var(--color-obs-surface-high)'
              : 'transparent',
          boxShadow: focused ? 'inset 0 0 0 1px var(--color-obs-primary)' : 'none',
        }}
      />
      <Pencil
        size={13}
        style={{
          color: 'var(--color-obs-text-subtle)',
          opacity: hovered || focused ? 1 : 0,
          transition: 'opacity 0.15s ease',
        }}
      />
    </div>
  )
}

function DefRow({
  label,
  icon: Icon,
  children,
}: {
  label: string
  icon?: React.ElementType
  children: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span
        className="inline-flex items-center gap-1.5 text-[11.5px]"
        style={{ color: 'var(--color-obs-text-subtle)' }}
      >
        {Icon && <Icon size={11} />}
        {label}
      </span>
      <span className="text-right">{children}</span>
    </div>
  )
}

// 編集可能な行(ラベル上 + コントロール下)
function FieldRow({
  label,
  icon: Icon,
  children,
}: {
  label: string
  icon?: React.ElementType
  children: React.ReactNode
}) {
  return (
    <div>
      <label
        className="inline-flex items-center gap-1.5 text-[11px] font-medium mb-1.5 tracking-wide"
        style={{ color: 'var(--color-obs-text-subtle)' }}
      >
        {Icon && <Icon size={11} />}
        {label}
      </label>
      {children}
    </div>
  )
}

function UserSelect({
  value,
  users,
  onChange,
  placeholder,
}: {
  value: string
  users: OrgUser[]
  onChange: (userId: string) => void
  placeholder?: string
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full h-8 px-2 text-[12.5px] rounded-[var(--radius-obs-md)] outline-none cursor-pointer"
      style={{
        backgroundColor: 'var(--color-obs-surface-high)',
        color: value ? 'var(--color-obs-text)' : 'var(--color-obs-text-subtle)',
        boxShadow: 'inset 0 0 0 1px var(--color-obs-surface-highest)',
      }}
    >
      <option value="">{placeholder ?? '— 選択 —'}</option>
      {users.map((u) => (
        <option key={u.id} value={u.id}>
          {u.name}
        </option>
      ))}
    </select>
  )
}

function DateInput({
  value,
  onChange,
}: {
  value: string
  onChange: (v: string) => void
}) {
  return (
    <input
      type="date"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full h-8 px-2 text-[12.5px] rounded-[var(--radius-obs-md)] outline-none tabular-nums"
      style={{
        backgroundColor: 'var(--color-obs-surface-high)',
        color: value ? 'var(--color-obs-text)' : 'var(--color-obs-text-subtle)',
        boxShadow: 'inset 0 0 0 1px var(--color-obs-surface-highest)',
        colorScheme: 'dark',
      }}
    />
  )
}
