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

const TABS: { key: 'OPEN' | 'PENDING' | 'DONE' | 'ALL'; label: string }[] = [
  { key: 'ALL', label: 'すべて' },
  { key: 'OPEN', label: '未確認' },
  { key: 'PENDING', label: '対応中' },
  { key: 'DONE', label: '解決済み' },
]

const DONE_STATUSES: TicketStatus[] = ['SOLVED', 'CLOSED']

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
    try {
      const res = await fetch('/api/tickets', { cache: 'no-store' })
      if (res.ok) {
        const json = (await res.json()) as { tickets: TicketListItem[] }
        // 実データが無ければUI確認用のダミーをフォールバック表示
        setTickets(json.tickets.length > 0 ? json.tickets : MOCK_TICKETS)
      } else {
        setTickets(MOCK_TICKETS)
      }
    } catch {
      setTickets(MOCK_TICKETS)
    } finally {
      setLoading(false)
    }
  }

  // 行のステータスを更新 (ローカル即時反映 + APIに保存。モックIDは保存スキップ)
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
        eyebrow="チケット"
        title="チケット一覧"
        caption="取引(Deal)に紐づくチケットを管理します。"
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
              className="h-8 px-3 text-[12px] font-medium rounded-full transition-colors duration-150 inline-flex items-center gap-1.5"
              style={{
                backgroundColor: active
                  ? 'var(--color-obs-primary-container)'
                  : 'var(--color-obs-surface-high)',
                color: active ? 'var(--color-obs-on-primary)' : 'var(--color-obs-text-muted)',
              }}
            >
              {t.label}
              <span
                className="text-[10.5px] tabular-nums px-1.5 rounded-full"
                style={{
                  backgroundColor: active
                    ? 'rgba(255,255,255,0.18)'
                    : 'var(--color-obs-surface-highest)',
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
      <ObsCard depth="low" padding="none" radius="xl">
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
                    color: 'var(--color-obs-text-subtle)',
                    backgroundColor: 'var(--color-obs-surface-low)',
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
                {filtered.map((t) => {
                  const expanded = expandedId === t.id
                  const detail = detailsCache[t.id]
                  return (
                  <Fragment key={t.id}>
                  <tr
                    onClick={() => router.push(`/tickets/${t.id}`)}
                    className="border-t transition-colors cursor-pointer"
                    style={{
                      borderColor: 'var(--color-obs-surface-low)',
                      backgroundColor: expanded ? 'var(--color-obs-surface-high)' : 'transparent',
                    }}
                    onMouseOver={(e) => {
                      if (!expanded)
                        (e.currentTarget as HTMLTableRowElement).style.backgroundColor =
                          'var(--color-obs-surface-high)'
                    }}
                    onMouseOut={(e) => {
                      if (!expanded)
                        (e.currentTarget as HTMLTableRowElement).style.backgroundColor = 'transparent'
                    }}
                  >
                    <td className="px-4 py-3 font-mono text-[12px]" style={{ color: 'var(--color-obs-text-muted)' }}>
                      T-{String(t.ticketNumber).padStart(4, '0')}
                    </td>
                    <td className="px-4 py-3" style={{ color: 'var(--color-obs-text)' }}>
                      <div className="inline-flex items-center gap-1.5 group/subject">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleExpand(t.id)
                          }}
                          aria-label={expanded ? '詳細を閉じる' : '詳細を表示'}
                          className="w-5 h-5 rounded flex items-center justify-center shrink-0 transition-colors"
                          style={{ color: 'var(--color-obs-text-subtle)' }}
                          onMouseOver={(e) =>
                            ((e.currentTarget as HTMLButtonElement).style.backgroundColor =
                              'var(--color-obs-surface-highest)')
                          }
                          onMouseOut={(e) =>
                            ((e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent')
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
                          style={{ color: 'var(--color-obs-primary)' }}
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
                        backgroundColor: 'var(--color-obs-surface-low)',
                        borderColor: 'var(--color-obs-surface-low)',
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
        backgroundColor: copied ? 'var(--color-obs-surface-highest)' : 'transparent',
      }}
      onMouseOver={(e) => {
        if (!copied)
          (e.currentTarget as HTMLButtonElement).style.backgroundColor =
            'var(--color-obs-surface-highest)'
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
          backgroundColor: 'var(--color-obs-surface-high)',
          color: 'var(--color-obs-text-muted)',
          boxShadow: 'inset 0 0 0 1px var(--color-obs-surface-highest)',
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
          'linear-gradient(140deg, var(--color-obs-primary) 0%, var(--color-obs-primary-container) 100%)',
        color: 'var(--color-obs-on-primary)',
      }}
      title="このチケットを完了にする"
    >
      <Check size={11} strokeWidth={2.4} />
      完了
    </button>
  )
}
