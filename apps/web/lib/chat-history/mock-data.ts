/**
 * ルキスマCRM Intelligence Hub — チャット履歴モック
 *
 * Codex 風サイドバーで時系列グルーピング表示するための過去会話データ。
 * 実装フェーズではモック。将来的には userId × workspace 単位で永続化想定。
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

// ─── モックデータ ────────────────────────────────────────────────────────
// 今日の日付は 2026-04-30
export const MOCK_CHAT_HISTORY: ChatHistoryItem[] = [
  // 今日
  {
    id: 'c1',
    title: '今週アプローチすべき HOT 企業',
    updatedAt: '2026-04-30T09:42:00',
    preview: 'インテントスコア80以上 + 直近30日コール未着手で抽出',
  },
  {
    id: 'c2',
    title: 'テクノリードの最新議事録から要点',
    updatedAt: '2026-04-30T08:15:00',
    preview: 'CTO同席最終デモの論点、最終見積回答待ち',
  },
  {
    id: 'c3',
    title: 'パイプラインで停滞中の案件',
    updatedAt: '2026-04-30T07:01:00',
  },

  // 昨日
  {
    id: 'c4',
    title: 'IT部門の採用インテント TOP10',
    updatedAt: '2026-04-29T18:23:00',
  },
  {
    id: 'c5',
    title: 'フューチャー社の比較表案を作成',
    updatedAt: '2026-04-29T14:08:00',
    preview: 'Zoho CRM との機能比較',
  },

  // 過去7日間
  {
    id: 'c6',
    title: '直近の議事録から共通課題を抽出',
    updatedAt: '2026-04-27T11:30:00',
  },
  {
    id: 'c7',
    title: '物流業界の HOT 企業リスト',
    updatedAt: '2026-04-26T16:55:00',
  },
  {
    id: 'c8',
    title: '今月のチャーン候補とリスク要因',
    updatedAt: '2026-04-25T10:12:00',
  },

  // 過去30日間
  {
    id: 'c9',
    title: 'グロース社の稟議プロセスをまとめ',
    updatedAt: '2026-04-18T13:40:00',
  },
  {
    id: 'c10',
    title: '4月度の受注予測 vs 実績',
    updatedAt: '2026-04-12T17:22:00',
  },
  {
    id: 'c11',
    title: 'Salesforce 比較質問への回答案',
    updatedAt: '2026-04-08T09:30:00',
  },

  // それ以前
  {
    id: 'c12',
    title: 'Q1 振り返り:勝ちパターン分析',
    updatedAt: '2026-03-29T15:00:00',
  },
]

// ─── グルーピング ─────────────────────────────────────────────────────────
function diffDays(targetIso: string, base: Date): number {
  const ms = 1000 * 60 * 60 * 24
  const t = new Date(targetIso.slice(0, 10) + 'T00:00:00').getTime()
  const b = new Date(
    `${base.getFullYear()}-${String(base.getMonth() + 1).padStart(2, '0')}-${String(base.getDate()).padStart(2, '0')}T00:00:00`,
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
