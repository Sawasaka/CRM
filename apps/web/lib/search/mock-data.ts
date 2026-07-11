/**
 * グローバル検索のモックデータ
 *
 * Phase 1: 静的なモック。
 * 将来的には tRPC 経由で DB を叩いて、企業・コンタクト・取引を横断検索する。
 */

export type SearchKind = 'company' | 'contact' | 'deal'

export type SearchItem = {
  id: string
  kind: SearchKind
  /** 一覧表示用の名前 */
  title: string
  /** サブタイトル（例：会社名 / フェーズ など） */
  subtitle?: string
  /** クリック時の遷移先 */
  href: string
}

const COMPANIES: SearchItem[] = []
const CONTACTS: SearchItem[] = []
const DEALS: SearchItem[] = []

export const SEARCH_INDEX: SearchItem[] = [...COMPANIES, ...CONTACTS, ...DEALS]

export const KIND_LABEL: Record<SearchKind, string> = {
  company: '企業',
  contact: 'コンタクト',
  deal:    '取引',
}

/** 大文字小文字・全半角を緩めに正規化した部分一致検索 */
export function searchAll(query: string, limitPerKind = 5): Record<SearchKind, SearchItem[]> {
  const q = query.trim().toLowerCase()
  const empty: Record<SearchKind, SearchItem[]> = { company: [], contact: [], deal: [] }
  if (!q) return empty

  const buckets: Record<SearchKind, SearchItem[]> = { company: [], contact: [], deal: [] }
  for (const item of SEARCH_INDEX) {
    const haystack = `${item.title} ${item.subtitle ?? ''}`.toLowerCase()
    if (haystack.includes(q)) buckets[item.kind].push(item)
  }

  ;(['company', 'contact', 'deal'] as SearchKind[]).forEach((k) => {
    buckets[k] = buckets[k].slice(0, limitPerKind)
  })
  return buckets
}
