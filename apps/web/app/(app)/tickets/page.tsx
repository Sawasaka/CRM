'use client'

import { Fragment, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Check, ChevronDown, ChevronRight, Link2, Plus, RotateCcw, Search } from 'lucide-react'
import {
  ObsPageShell,
  ObsHero,
  ObsCard,
  ObsButton,
  ObsInput,
} from '@/components/obsidian'
import { CreateTicketModal } from './_components/CreateTicketModal'
import { StatusDropdown } from './_components/StatusDropdown'
import { getMockTicketDetail, MOCK_TICKETS } from './_lib/mock'
import type { TicketDetail, TicketListItem, TicketStatus } from './_types'
import { isDemoUrlSearch } from '@/lib/demo-company-data'

const TABS: { key: 'OPEN' | 'PENDING' | 'DONE' | 'ALL'; label: string }[] = [
  { key: 'ALL', label: 'すべて' },
  { key: 'OPEN', label: '未確認' },
  { key: 'PENDING', label: '対応中' },
  { key: 'DONE', label: '解決済み' },
]

const DONE_STATUSES: TicketStatus[] = ['SOLVED', 'CLOSED']

const TICKET_PANEL_SURFACE =
  'linear-gradient(145deg, rgba(27,28,32,0.66) 0%, rgba(19,20,24,0.84) 52%, rgba(12,13,16,0.94) 100%)'
const TICKET_PANEL_RING =
  'inset 0 0 0 1px rgba(171,199,255,0.105), inset 1px 1px 0 rgba(255,255,255,0.035), 0 18px 48px rgba(0,0,0,0.30)'
const TICKET_HEADER_SURFACE =
  'linear-gradient(90deg, rgba(171,199,255,0.050), rgba(255,255,255,0.018), rgba(255,255,255,0.004))'
const TICKET_ROW_SURFACE =
  'linear-gradient(90deg, rgba(255,255,255,0.010), rgba(171,199,255,0.012), rgba(255,255,255,0))'
const TICKET_ROW_ALT_SURFACE =
  'linear-gradient(90deg, rgba(171,199,255,0.020), rgba(255,255,255,0.010), rgba(255,255,255,0))'
const TICKET_ROW_HOVER =
  'linear-gradient(90deg, rgba(171,199,255,0.052), rgba(255,255,255,0.022), rgba(255,255,255,0.004))'
const TICKET_DIVIDER = 'rgba(171,199,255,0.075)'

function fmtDate(iso?: string | null) {
  if (!iso) return '—'
  const d = new Date(iso)
  return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(
    d.getMinutes(),
  ).padStart(2, '0')}`
}

export default function TicketsPage() {
  const router = useRouter()
  const [tickets, setTickets] = useState<TicketListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'OPEN' | 'PENDING' | 'DONE' | 'ALL'>('ALL')
  const [query, setQuery] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [detailsCache, setDetailsCache] = useState<Record<string, TicketDetail>>({})

  async function toggleExpand(id: string) {
    if (expandedId === id) {
      setExpandedId(null)
      return
    }
    setExpandedId(id)
    if (detailsCache[id]) return
    if (id.startsWith('mock-')) {
      const d = getMockTicketDetail(id)
      if (d) setDetailsCache((p) => ({ ...p, [id]: d }))
      return
    }
    try {
      const res = await fetch(`/api/tickets/${id}`, { cache: 'no-store' })
      if (res.ok) {
        const json = (await res.json()) as { ticket: TicketDetail }
        setDetailsCache((p) => ({ ...p, [id]: json.ticket }))
      }
    } catch {
      // ignore
    }
  }

  async function load() {
    setLoading(true)
    const demoView = isDemoUrlSearch(window.location.search)
    const params = new URLSearchParams(window.location.search)
    try {
      const res = await fetch(`/api/tickets?${params.toString()}`, { cache: 'no-store' })
      if (res.ok) {
        const json = (await res.json()) as { tickets: TicketListItem[] }
        setTickets(demoView && json.tickets.length === 0 ? MOCK_TICKETS : json.tickets)
      } else {
        setTickets(demoView ? MOCK_TICKETS : [])
      }
    } catch {
      setTickets(demoView ? MOCK_TICKETS : [])
    } finally {
      setLoading(false)
    }
  }

  // 行のステータスを更新 (ローカル即時反映 + APIに保存)
  async function updateStatus(id: string, status: TicketStatus) {
    setTickets((prev) =>
      prev.map((t) =>
        t.id === id
          ? {
              ...t,
              status,
              resolvedAt: status === 'SOLVED' || status === 'CLOSED' ? new Date().toISOString() : null,
            }
          : t,
      ),
    )
    if (id.startsWith('mock-')) return
    try {
      await fetch(`/api/tickets/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
    } catch {
      // 失敗時もUIは更新済み(必要なら再fetchでロールバック可能)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const filtered = useMemo(() => {
    let list = tickets
    if (tab !== 'ALL') {
      if (tab === 'DONE') {
        list = list.filter((t) => DONE_STATUSES.includes(t.status))
      } else {
        list = list.filter((t) => t.status === tab)
      }
    }
    if (query.trim()) {
      const q = query.trim().toLowerCase()
      list = list.filter(
        (t) =>
          t.subject.toLowerCase().includes(q) ||
          (t.deal?.name ?? '').toLowerCase().includes(q),
      )
    }
    return list
  }, [tickets, tab, query])

  const counts = useMemo(() => {
    const c = { OPEN: 0, PENDING: 0, DONE: 0, ALL: tickets.length }
    for (const t of tickets) {
      if (t.status === 'OPEN') c.OPEN++
      else if (t.status === 'PENDING') c.PENDING++
      else c.DONE++
    }
    return c
  }, [tickets])

  return (
    <ObsPageShell>
      <div className="w-full px-8 xl:px-12 2xl:px-16 pb-16">
      <ObsHero
        eyebrow="TICKETS"
        title="問い合わせチケット"
        titleAccent="チケット"
        caption="取引に紐づく問い合わせを、ステータス・期限・対応者で管理。"
      />

      {/* タブ */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        {TABS.map((t) => {
          const active = tab === t.key
          const count = counts[t.key]
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className="h-8 px-3 text-[12px] font-medium rounded-full transition-all duration-150 inline-flex items-center gap-1.5"
              style={{
                background: active
                  ? 'linear-gradient(140deg, #9fc3ff 0%, #2f8cff 64%, #0071e3 100%)'
                  : 'linear-gradient(145deg, rgba(41,43,50,0.72), rgba(22,23,27,0.76))',
                color: active ? 'var(--color-obs-on-primary)' : 'var(--color-obs-text-muted)',
                boxShadow: active
                  ? 'inset 0 1px 0 rgba(255,255,255,0.26), 0 8px 22px rgba(0,113,227,0.25)'
                  : 'inset 0 0 0 1px rgba(171,199,255,0.08)',
              }}
            >
              {t.label}
              <span
                className="text-[10.5px] tabular-nums px-1.5 rounded-full"
                style={{
                  backgroundColor: active ? 'rgba(255,255,255,0.18)' : 'rgba(171,199,255,0.10)',
                  color: active ? 'var(--color-obs-on-primary)' : 'var(--color-obs-text-subtle)',
                }}
              >
                {count}
              </span>
            </button>
          )
        })}
      </div>

      {/* 検索 + 新規ボタン */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="relative w-full max-w-md">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none z-10"
            style={{ color: 'var(--color-obs-text-subtle)' }}
          />
          <ObsInput
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="件名・取引名で検索..."
            className="pl-10"
          />
        </div>
        <ObsButton onClick={() => setShowCreate(true)}>
          <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
            <Plus size={13} />
            新規チケット
          </span>
        </ObsButton>
      </div>

      {/* テーブル */}
      <ObsCard
        depth="low"
        padding="none"
        radius="xl"
        style={{
          background: TICKET_PANEL_SURFACE,
          boxShadow: TICKET_PANEL_RING,
        }}
      >
        {loading ? (
          <div className="text-center py-16">
            <p className="text-[13px]" style={{ color: 'var(--color-obs-text-muted)' }}>
              読み込み中...
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-[14px]" style={{ color: 'var(--color-obs-text-muted)' }}>
              該当するチケットがありません
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr
                  className="text-left"
                  style={{
                    color: 'rgba(216,224,240,0.62)',
                    background: TICKET_HEADER_SURFACE,
                    boxShadow: `inset 0 -1px 0 0 ${TICKET_DIVIDER}`,
                  }}
                >
                  <th className="px-4 py-3 font-medium text-[11.5px] tracking-wider">番号</th>
                  <th className="px-4 py-3 font-medium text-[11.5px] tracking-wider">件名</th>
                  <th className="px-4 py-3 font-medium text-[11.5px] tracking-wider">取引</th>
                  <th className="px-4 py-3 font-medium text-[11.5px] tracking-wider">対応者</th>
                  <th className="px-4 py-3 font-medium text-[11.5px] tracking-wider">ステータス</th>
                  <th className="px-4 py-3 font-medium text-[11.5px] tracking-wider">作成日</th>
                  <th className="px-4 py-3 font-medium text-[11.5px] tracking-wider">完了見込み</th>
                  <th className="px-4 py-3 font-medium text-[11.5px] tracking-wider w-[1%]">操作</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((t, index) => {
                  const expanded = expandedId === t.id
                  const detail = detailsCache[t.id]
                  const rowBackground = index % 2 === 0 ? TICKET_ROW_SURFACE : TICKET_ROW_ALT_SURFACE
                  return (
                  <Fragment key={t.id}>
                  <tr
                    onClick={() => router.push(`/tickets/${t.id}`)}
                    className="border-t transition-colors cursor-pointer"
                    style={{
                      borderColor: TICKET_DIVIDER,
                      background: expanded ? TICKET_ROW_HOVER : rowBackground,
                    }}
                    onMouseOver={(e) => {
                      if (!expanded)
                        (e.currentTarget as HTMLTableRowElement).style.background = TICKET_ROW_HOVER
                    }}
                    onMouseOut={(e) => {
                      if (!expanded)
                        (e.currentTarget as HTMLTableRowElement).style.background = rowBackground
                    }}
                  >
                    <td className="px-4 py-3 font-mono text-[12px]" style={{ color: 'var(--color-obs-text-muted)' }}>
                      T-{String(t.ticketNumber).padStart(4, '0')}
                    </td>
                    <td className="px-4 py-3" style={{ color: '#f1f5ff' }}>
                      <div className="inline-flex items-center gap-1.5 group/subject">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleExpand(t.id)
                          }}
                          aria-label={expanded ? '詳細を閉じる' : '詳細を表示'}
                          className="w-5 h-5 rounded flex items-center justify-center shrink-0 transition-colors"
                          style={{
                            color: expanded ? 'var(--color-obs-primary)' : 'var(--color-obs-text-subtle)',
                            backgroundColor: expanded ? 'rgba(171,199,255,0.10)' : 'transparent',
                          }}
                          onMouseOver={(e) =>
                            ((e.currentTarget as HTMLButtonElement).style.backgroundColor =
                              'rgba(171,199,255,0.12)')
                          }
                          onMouseOut={(e) =>
                            ((e.currentTarget as HTMLButtonElement).style.backgroundColor = expanded
                              ? 'rgba(171,199,255,0.10)'
                              : 'transparent')
                          }
                        >
                          {expanded ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
                        </button>
                        <span>{t.subject}</span>
                        <RowCopyLinkButton ticketId={t.id} />
                      </div>
                    </td>
                    <td className="px-4 py-3" style={{ color: 'var(--color-obs-text-muted)' }}>
                      {t.deal ? (
                        <Link
                          href={`/deals/${t.deal.id}`}
                          onClick={(e) => e.stopPropagation()}
                          className="hover:underline"
                          style={{ color: '#b9d2ff' }}
                        >
                          {t.deal.name}
                        </Link>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="px-4 py-3" style={{ color: 'var(--color-obs-text-muted)' }}>
                      {t.assignee?.name ?? '—'}
                    </td>
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <StatusDropdown
                        value={t.status}
                        onChange={(s) => updateStatus(t.id, s)}
                        compact
                        stopPropagation
                      />
                    </td>
                    <td className="px-4 py-3 tabular-nums whitespace-nowrap" style={{ color: 'var(--color-obs-text-subtle)' }}>
                      {fmtDate(t.createdAt)}
                    </td>
                    <td className="px-4 py-3 tabular-nums whitespace-nowrap" style={{ color: 'var(--color-obs-text-subtle)' }}>
                      {fmtDate(t.estimatedCompletionAt)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <RowCompleteButton
                        status={t.status}
                        onSolve={() => updateStatus(t.id, 'SOLVED')}
                        onReopen={() => updateStatus(t.id, 'OPEN')}
                      />
                    </td>
                  </tr>
                  {expanded && (
                    <tr
                      style={{
                        background:
                          'linear-gradient(145deg, rgba(13,14,18,0.66), rgba(31,33,39,0.74))',
                        borderColor: TICKET_DIVIDER,
                      }}
                      className="border-t"
                    >
                      <td></td>
                      <td colSpan={7} className="px-4 py-4">
                        {detail ? (
                          <ExpandedDetail detail={detail} />
                        ) : (
                          <span className="text-[12px]" style={{ color: 'var(--color-obs-text-muted)' }}>
                            読み込み中...
                          </span>
                        )}
                      </td>
                    </tr>
                  )}
                  </Fragment>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </ObsCard>

      {showCreate && (
        <CreateTicketModal
          onClose={() => setShowCreate(false)}
          onCreated={() => {
            setShowCreate(false)
            load()
          }}
        />
      )}
      </div>
    </ObsPageShell>
  )
}

function RowCopyLinkButton({ ticketId }: { ticketId: string }) {
  const [copied, setCopied] = useState(false)
  async function copy(e: React.MouseEvent) {
    e.stopPropagation()
    if (typeof window === 'undefined') return
    const url = `${window.location.origin}/tickets/${ticketId}`
    try {
      await navigator.clipboard.writeText(url)
    } catch {
      const ta = document.createElement('textarea')
      ta.value = url
      document.body.appendChild(ta)
      ta.select()
      try {
        document.execCommand('copy')
      } catch {
        // ignore
      }
      document.body.removeChild(ta)
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }
  return (
    <button
      type="button"
      onClick={copy}
      title="リンクをコピー"
      className="inline-flex items-center gap-1 h-6 px-2 rounded shrink-0 text-[10.5px] font-medium transition-colors"
      style={{
        color: copied ? 'var(--color-obs-primary)' : 'var(--color-obs-text-subtle)',
        backgroundColor: copied ? 'rgba(171,199,255,0.12)' : 'transparent',
      }}
      onMouseOver={(e) => {
        if (!copied)
          (e.currentTarget as HTMLButtonElement).style.backgroundColor =
            'rgba(171,199,255,0.10)'
      }}
      onMouseOut={(e) => {
        if (!copied) (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent'
      }}
    >
      {copied ? (
        <>
          <Check size={11} />
          コピー済み
        </>
      ) : (
        <>
          <Link2 size={11} />
          リンクをコピー
        </>
      )}
    </button>
  )
}

function ExpandedDetail({ detail }: { detail: TicketDetail }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 text-[12.5px] leading-relaxed">
      <DetailField label="チケット内容" value={detail.description} />
      <DetailField label="原因" value={detail.cause} />
      <DetailField label="対応方針" value={detail.resolution} />
      <DetailField label="メモ" value={detail.memo} />
    </div>
  )
}

function DetailField({ label, value }: { label: string; value: string | null }) {
  return (
    <div>
      <div
        className="text-[10.5px] font-medium tracking-wide mb-1"
        style={{ color: 'var(--color-obs-text-subtle)' }}
      >
        {label}
      </div>
      {value ? (
        <p style={{ color: 'var(--color-obs-text)', whiteSpace: 'pre-wrap' }}>{value}</p>
      ) : (
        <p style={{ color: 'var(--color-obs-text-subtle)' }}>—</p>
      )}
    </div>
  )
}

function RowCompleteButton({
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
        className="inline-flex items-center gap-1 h-7 px-2.5 rounded-full text-[11px] font-medium whitespace-nowrap transition-colors"
        style={{
          background: 'linear-gradient(145deg, rgba(41,43,50,0.72), rgba(22,23,27,0.76))',
          color: 'var(--color-obs-text-muted)',
          boxShadow: 'inset 0 0 0 1px rgba(171,199,255,0.10)',
        }}
        title="未対応に戻す"
      >
        <RotateCcw size={11} />
        再開
      </button>
    )
  }
  return (
    <button
      onClick={onSolve}
      className="inline-flex items-center gap-1 h-7 px-2.5 rounded-full text-[11px] font-semibold whitespace-nowrap transition-all duration-150 hover:opacity-90 active:opacity-80"
      style={{
        background:
          'linear-gradient(140deg, #9fc3ff 0%, #2f8cff 64%, #0071e3 100%)',
        color: 'var(--color-obs-on-primary)',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.26), 0 8px 22px rgba(0,113,227,0.24)',
      }}
      title="このチケットを完了にする"
    >
      <Check size={11} strokeWidth={2.4} />
      完了
    </button>
  )
}
