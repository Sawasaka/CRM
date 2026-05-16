'use client'

import { useEffect, useRef, useState } from 'react'
import { Check, ChevronDown } from 'lucide-react'
import { StatusBadge } from './StatusBadge'
import type { TicketStatus } from '../_types'

// プルダウンで直接選択できるステータス。
// SOLVED(解決済み)は「対応完了」ボタンから設定するためここでは表示しない。
const STATUS_OPTIONS: TicketStatus[] = ['OPEN', 'PENDING', 'CLOSED']

export function StatusDropdown({
  value,
  onChange,
  compact,
  stopPropagation,
}: {
  value: TicketStatus
  onChange: (s: TicketStatus) => void
  compact?: boolean
  stopPropagation?: boolean
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement | null>(null)
  useEffect(() => {
    if (!open) return
    const onDocClick = (e: MouseEvent) => {
      if (!ref.current) return
      if (!ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [open])

  return (
    <div
      ref={ref}
      className="relative"
      onClick={(e) => {
        if (stopPropagation) e.stopPropagation()
      }}
    >
      <button
        type="button"
        onClick={(e) => {
          if (stopPropagation) e.stopPropagation()
          setOpen((v) => !v)
        }}
        className={`inline-flex items-center gap-1.5 rounded-[var(--radius-obs-md)] cursor-pointer transition-colors ${
          compact ? 'px-1.5 py-0.5' : 'w-full h-8 px-2 justify-between'
        }`}
        style={{
          backgroundColor: compact ? 'transparent' : 'var(--color-obs-surface-high)',
          boxShadow: compact ? 'none' : 'inset 0 0 0 1px var(--color-obs-surface-highest)',
        }}
        onMouseOver={(e) => {
          if (compact)
            (e.currentTarget as HTMLButtonElement).style.backgroundColor =
              'var(--color-obs-surface-high)'
        }}
        onMouseOut={(e) => {
          if (compact) (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent'
        }}
      >
        <StatusBadge status={value} />
        <ChevronDown
          size={11}
          style={{
            color: 'var(--color-obs-text-muted)',
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.15s ease',
          }}
        />
      </button>
      {open && (
        <div
          className={`absolute top-full mt-1 rounded-[var(--radius-obs-md)] py-1 z-30 ${
            compact ? 'left-0 min-w-[140px]' : 'left-0 right-0'
          }`}
          style={{
            backgroundColor: 'var(--color-obs-surface-highest)',
            boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
          }}
        >
          {STATUS_OPTIONS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={(e) => {
                if (stopPropagation) e.stopPropagation()
                onChange(s)
                setOpen(false)
              }}
              className="w-full text-left px-3 py-1.5 inline-flex items-center justify-between gap-2 transition-colors"
              onMouseOver={(e) =>
                ((e.currentTarget as HTMLButtonElement).style.backgroundColor =
                  'var(--color-obs-surface-high)')
              }
              onMouseOut={(e) =>
                ((e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent')
              }
            >
              <StatusBadge status={s} />
              {s === value && (
                <Check size={11} style={{ color: 'var(--color-obs-primary)' }} />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
