// ヘッダーのベルアイコンから開く通知パネルの仮データ。
// 運営(開発者)からユーザーへ届くお知らせを想定。
export type NotificationKind = 'release' | 'maintenance' | 'tip' | 'alert'

export type NotificationItem = {
  id: string
  kind: NotificationKind
  title: string
  body: string
  createdAt: string // ISO
  read: boolean
  ctaLabel?: string
  ctaHref?: string
}

export const KIND_META: Record<NotificationKind, { label: string; tone: 'primary' | 'middle' | 'low' | 'hot' }> = {
  release:     { label: 'リリース', tone: 'primary' },
  tip:         { label: 'Tips',    tone: 'low'     },
  maintenance: { label: 'メンテ',  tone: 'middle'  },
  alert:       { label: '重要',    tone: 'hot'     },
}

export const NOTIFICATIONS: NotificationItem[] = []

// 相対時刻の簡易フォーマッタ(「3分前 / 2時間前 / 4日前」)。
export function formatRelative(iso: string, nowMs = Date.now()): string {
  const t = new Date(iso).getTime()
  const diff = Math.max(0, nowMs - t)
  const mins = Math.floor(diff / 60_000)
  if (mins < 1) return 'たった今'
  if (mins < 60) return `${mins}分前`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}時間前`
  const days = Math.floor(hrs / 24)
  if (days < 7) return `${days}日前`
  const weeks = Math.floor(days / 7)
  if (weeks < 5) return `${weeks}週間前`
  const months = Math.floor(days / 30)
  return `${months}か月前`
}
