import type { TicketStatus } from '../_types'

const STATUS_LABEL: Record<TicketStatus, string> = {
  OPEN: '未確認',
  PENDING: '対応中',
  SOLVED: '解決済み',
  CLOSED: 'その他',
}

const STATUS_TONE: Record<TicketStatus, { bg: string; fg: string }> = {
  OPEN: { bg: 'rgba(239, 90, 90, 0.15)', fg: 'var(--color-obs-hot, #ef5a5a)' },
  PENDING: { bg: 'rgba(247, 178, 64, 0.15)', fg: 'var(--color-obs-middle, #f7b240)' },
  SOLVED: { bg: 'rgba(98, 197, 142, 0.15)', fg: 'var(--color-obs-success, #62c58e)' },
  CLOSED: { bg: 'var(--color-obs-surface-highest)', fg: 'var(--color-obs-text-subtle)' },
}

export function StatusBadge({ status }: { status: TicketStatus }) {
  const tone = STATUS_TONE[status]
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium"
      style={{ backgroundColor: tone.bg, color: tone.fg }}
    >
      {STATUS_LABEL[status]}
    </span>
  )
}

export function getStatusLabel(status: TicketStatus) {
  return STATUS_LABEL[status]
}
