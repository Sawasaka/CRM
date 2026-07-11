/**
 * FDE CRM Intelligence Hub — チャット履歴
 *
 * 実利用環境では初期表示のダミー会話を出さない。
 * 将来的には userId × workspace 単位で永続化する。
 */

export type ChatHistoryItem = {
  id: string
  title: string
  /** ISO 8601 形式の作成/最終更新日時 */
  updatedAt: string
  preview?: string
}

export type ChatGroupKey = '今日' | '昨日' | '過去7日間' | '過去30日間' | 'それ以前'

export type ChatGroup = {
  key: ChatGroupKey
  items: ChatHistoryItem[]
}

export const MOCK_CHAT_HISTORY: ChatHistoryItem[] = []

// ─── グルーピング ─────────────────────────────────────────────────────────
function diffDays(targetIso: string, base: Date): number {
  const ms = 1000 * 60 * 60 * 24
  const t = new Date(targetIso.slice(0, 10) + 'T00:00:00').getTime()
  const b = new Date(
    `${base.getFullYear()}-${String(base.getMonth() + 1).padStart(2, '0')}-${String(base.getDate()).padStart(2, '0')}T00:00:00`
  ).getTime()
  return Math.round((b - t) / ms)
}

export function groupChats(items: ChatHistoryItem[], today = new Date()): ChatGroup[] {
  const buckets: Record<ChatGroupKey, ChatHistoryItem[]> = {
    今日: [],
    昨日: [],
    過去7日間: [],
    過去30日間: [],
    それ以前: [],
  }

  for (const item of items) {
    const diff = diffDays(item.updatedAt, today)
    if (diff <= 0) buckets.今日.push(item)
    else if (diff === 1) buckets.昨日.push(item)
    else if (diff <= 7) buckets.過去7日間.push(item)
    else if (diff <= 30) buckets.過去30日間.push(item)
    else buckets.それ以前.push(item)
  }

  const order: ChatGroupKey[] = ['今日', '昨日', '過去7日間', '過去30日間', 'それ以前']
  return order
    .map((key) => ({
      key,
      items: buckets[key].sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1)),
    }))
    .filter((g) => g.items.length > 0)
}

// ─── 相対時間表示 ────────────────────────────────────────────────────────
export function relativeLabel(targetIso: string, now = new Date()): string {
  const ms = 1000
  const target = new Date(targetIso).getTime()
  const diffSec = Math.max(0, Math.round((now.getTime() - target) / ms))
  if (diffSec < 60) return 'たった今'
  const diffMin = Math.round(diffSec / 60)
  if (diffMin < 60) return `${diffMin}分`
  const diffHour = Math.round(diffMin / 60)
  if (diffHour < 24) return `${diffHour}時間`
  const diffDay = Math.round(diffHour / 24)
  if (diffDay < 7) return `${diffDay}日`
  const diffWeek = Math.round(diffDay / 7)
  if (diffWeek < 5) return `${diffWeek}週`
  const diffMonth = Math.round(diffDay / 30)
  if (diffMonth < 12) return `${diffMonth}ヶ月`
  return `${Math.round(diffDay / 365)}年`
}
