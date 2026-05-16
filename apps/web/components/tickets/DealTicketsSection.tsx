'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, LifeBuoy } from 'lucide-react'
import { ObsButton, ObsCard } from '@/components/obsidian'
import { CreateTicketModal } from '@/app/(app)/tickets/_components/CreateTicketModal'
import { StatusBadge } from '@/app/(app)/tickets/_components/StatusBadge'
import type { TicketListItem } from '@/app/(app)/tickets/_types'

function fmtDate(iso?: string | null) {
  if (!iso) return '—'
  const d = new Date(iso)
  return `${d.getMonth() + 1}/${d.getDate()}`
}

type Props = {
  dealId: string
  dealLabel: string // "取引名 — 会社名" 等の表示用ラベル
}

export function DealTicketsSection({ dealId, dealLabel }: Props) {
  const router = useRouter()
  const [tickets, setTickets] = useState<TicketListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)

  async function load() {
    setLoading(true)
    try {
      const res = await fetch(`/api/tickets?dealId=${encodeURIComponent(dealId)}`, {
        cache: 'no-store',
      })
      if (res.ok) {
        const json = (await res.json()) as { tickets: TicketListItem[] }
        setTickets(json.tickets)
      } else {
        setTickets([])
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dealId])

  const open = tickets.filter((t) => t.status === 'OPEN' || t.status === 'PENDING').length
  const done = tickets.length - open

  return (
    <section className="mt-8">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <LifeBuoy size={14} style={{ color: 'var(--color-obs-primary)' }} />
          <h2
            className="text-[14px] font-semibold tracking-[-0.01em]"
            style={{ color: 'var(--color-obs-text)' }}
          >
            問い合わせ
          </h2>
          <span
            className="text-[11.5px] tabular-nums px-2 py-0.5 rounded-full"
            style={{
              backgroundColor: 'var(--color-obs-surface-high)',
              color: 'var(--color-obs-text-muted)',
            }}
          >
            未対応 {open} · 解決 {done}
          </span>
        </div>
        <ObsButton size="sm" onClick={() => setShowCreate(true)}>
          <span className="inline-flex items-center gap-1.5">
            <Plus size={11} />
            新規
          </span>
        </ObsButton>
      </div>

      <ObsCard depth="low" padding="none" radius="lg">
        {loading ? (
          <div className="text-center py-8 text-[12px]" style={{ color: 'var(--color-obs-text-muted)' }}>
            読み込み中...
          </div>
        ) : tickets.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-[12.5px]" style={{ color: 'var(--color-obs-text-muted)' }}>
              この取引にはまだ問い合わせがありません
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[12.5px]">
              <thead>
                <tr
                  className="text-left"
                  style={{
                    color: 'var(--color-obs-text-subtle)',
                    backgroundColor: 'var(--color-obs-surface-low)',
                  }}
                >
                  <th className="px-4 py-2 font-medium text-[10.5px] tracking-wider">番号</th>
                  <th className="px-4 py-2 font-medium text-[10.5px] tracking-wider">件名</th>
                  <th className="px-4 py-2 font-medium text-[10.5px] tracking-wider">担当</th>
                  <th className="px-4 py-2 font-medium text-[10.5px] tracking-wider">ステータス</th>
                  <th className="px-4 py-2 font-medium text-[10.5px] tracking-wider">作成</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map((t) => (
                  <tr
                    key={t.id}
                    onClick={() => router.push(`/tickets/${t.id}`)}
                    className="border-t cursor-pointer transition-colors"
                    style={{ borderColor: 'var(--color-obs-surface-low)' }}
                    onMouseOver={(e) =>
                      ((e.currentTarget as HTMLTableRowElement).style.backgroundColor =
                        'var(--color-obs-surface-high)')
                    }
                    onMouseOut={(e) =>
                      ((e.currentTarget as HTMLTableRowElement).style.backgroundColor = 'transparent')
                    }
                  >
                    <td className="px-4 py-2 font-mono text-[11.5px]" style={{ color: 'var(--color-obs-text-muted)' }}>
                      T-{String(t.ticketNumber).padStart(4, '0')}
                    </td>
                    <td className="px-4 py-2" style={{ color: 'var(--color-obs-text)' }}>
                      {t.subject}
                    </td>
                    <td className="px-4 py-2" style={{ color: 'var(--color-obs-text-muted)' }}>
                      {t.assignee?.name ?? '—'}
                    </td>
                    <td className="px-4 py-2">
                      <StatusBadge status={t.status} />
                    </td>
                    <td className="px-4 py-2 tabular-nums" style={{ color: 'var(--color-obs-text-subtle)' }}>
                      {fmtDate(t.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </ObsCard>

      {showCreate && (
        <CreateTicketModal
          presetDealId={dealId}
          presetDealLabel={dealLabel}
          onClose={() => setShowCreate(false)}
          onCreated={() => {
            setShowCreate(false)
            load()
          }}
        />
      )}
    </section>
  )
}
