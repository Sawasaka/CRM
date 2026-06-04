'use client'

import { useMemo, useState, type ElementType } from 'react'
import { Calendar, Inbox, Mail, PhoneCall } from 'lucide-react'

type HistoryKind = 'call' | 'email' | 'meeting'

export interface HistoryEntry {
  id: string
  kind: HistoryKind
  occurredAt: string
  title: string
  detail?: string
  result?: string
  durationSec?: number
  attendees?: string[]
}

const MOCK_CONTACT_HISTORY: HistoryEntry[] = []

const HISTORY_KIND_META: Record<HistoryKind | 'all', { label: string; Icon: ElementType; tone: string }> = {
  all: { label: 'すべて', Icon: Inbox, tone: 'var(--color-obs-text-muted)' },
  call: { label: 'コール', Icon: PhoneCall, tone: 'var(--color-obs-low)' },
  email: { label: 'メール', Icon: Mail, tone: 'var(--color-obs-primary)' },
  meeting: { label: '会議', Icon: Calendar, tone: 'var(--color-obs-middle)' },
}

function formatHistoryDateTime(iso: string): { date: string; time: string } {
  const d = new Date(iso)
  return {
    date: `${d.getMonth() + 1}/${d.getDate()}`,
    time: `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`,
  }
}

function formatDuration(sec?: number): string {
  if (!sec) return '0分'
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return s ? `${m}分${s}秒` : `${m}分`
}

export function ContactHistoryTimeline({ entries }: { entries?: HistoryEntry[] } = {}) {
  const [filter, setFilter] = useState<HistoryKind | 'all'>('all')
  const source = entries ?? MOCK_CONTACT_HISTORY

  const filtered = useMemo(() => {
    const arr = filter === 'all' ? source : source.filter((entry) => entry.kind === filter)
    return [...arr].sort((a, b) => (a.occurredAt < b.occurredAt ? 1 : -1))
  }, [filter, source])

  const counts = useMemo(() => {
    const acc = { all: source.length, call: 0, email: 0, meeting: 0 }
    for (const entry of source) acc[entry.kind] += 1
    return acc
  }, [source])

  return (
    <div>
      <div className="flex items-center gap-1.5 mb-4 flex-wrap">
        {(['all', 'call', 'email', 'meeting'] as const).map((kind) => {
          const meta = HISTORY_KIND_META[kind]
          const active = filter === kind
          const Icon = meta.Icon
          return (
            <button
              key={kind}
              type="button"
              onClick={() => setFilter(kind)}
              className="inline-flex items-center gap-1.5 h-7 pl-2.5 pr-2 rounded-full text-[11.5px] font-medium transition-colors duration-150"
              style={{
                backgroundColor: active ? 'var(--color-obs-primary-container)' : 'var(--color-obs-surface-low)',
                color: active ? 'var(--color-obs-on-primary)' : 'var(--color-obs-text-muted)',
                boxShadow: active ? 'none' : 'inset 0 0 0 1px rgba(109,106,111,0.18)',
              }}
            >
              <Icon size={11} strokeWidth={2} />
              {meta.label}
              <span
                className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[10px] tabular-nums"
                style={{
                  backgroundColor: active ? 'rgba(255,255,255,0.18)' : 'rgba(109,106,111,0.18)',
                  color: active ? 'inherit' : 'var(--color-obs-text-subtle)',
                }}
              >
                {counts[kind]}
              </span>
            </button>
          )
        })}
      </div>

      {filtered.length === 0 ? (
        <div
          className="px-3 py-8 text-center text-[12px] rounded-[10px]"
          style={{ color: 'var(--color-obs-text-subtle)', background: 'var(--color-obs-surface-low)' }}
        >
          履歴がありません
        </div>
      ) : (
        <div className="relative">
          <div className="absolute left-[15px] top-2 bottom-2 w-px" style={{ background: 'rgba(109,106,111,0.22)' }} />
          <div className="space-y-3">
            {filtered.map((entry) => {
              const meta = HISTORY_KIND_META[entry.kind]
              const Icon = meta.Icon
              const dt = formatHistoryDateTime(entry.occurredAt)
              return (
                <div key={entry.id} className="relative pl-10">
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
                  <div
                    className="rounded-[10px] px-3.5 py-2.5"
                    style={{
                      background: 'var(--color-obs-surface-low)',
                      boxShadow: 'inset 0 0 0 1px rgba(109,106,111,0.16)',
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="text-[12.5px] font-semibold leading-snug" style={{ color: 'var(--color-obs-text)' }}>
                          {entry.title}
                        </div>
                        {entry.detail ? (
                          <div className="text-[11.5px] mt-1 leading-snug" style={{ color: 'var(--color-obs-text-muted)' }}>
                            {entry.detail}
                          </div>
                        ) : null}
                      </div>
                      <div className="text-[10.5px] tabular-nums text-right leading-tight shrink-0" style={{ color: 'var(--color-obs-text-subtle)' }}>
                        <div>{dt.date}</div>
                        <div>{dt.time}</div>
                      </div>
                    </div>
                    <div className="mt-2 flex items-center gap-2 flex-wrap text-[10.5px]" style={{ color: 'var(--color-obs-text-subtle)' }}>
                      {entry.result ? <span>{entry.result}</span> : null}
                      {entry.durationSec ? <span>{formatDuration(entry.durationSec)}</span> : null}
                      {entry.attendees ? <span>参加者 {entry.attendees.length}名</span> : null}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
