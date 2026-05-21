const NOTION_VERSION = '2026-03-11'

type NotionRequestOptions = {
  method?: 'GET' | 'POST'
  body?: unknown
}

export type NotionSearchResult = {
  object: string
  id: string
  url?: string
  created_time?: string
  last_edited_time?: string
  properties?: Record<string, unknown>
}

type NotionListResponse<T> = {
  results: T[]
  has_more: boolean
  next_cursor: string | null
}

type NotionBlock = {
  id: string
  type: string
  has_children?: boolean
  [key: string]: unknown
}

export async function notionRequest<T>(
  accessToken: string,
  path: string,
  options: NotionRequestOptions = {}
): Promise<T> {
  const response = await fetch(`https://api.notion.com/v1${path}`, {
    method: options.method ?? 'GET',
    headers: {
      authorization: `Bearer ${accessToken}`,
      'content-type': 'application/json',
      'notion-version': NOTION_VERSION,
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  })

  const json = (await response.json().catch(() => ({}))) as T & { message?: string; code?: string }
  if (!response.ok) {
    throw new Error(json.message ?? json.code ?? `Notion API failed: ${response.status}`)
  }
  return json
}

export async function searchNotionPages(accessToken: string, query: string, pageSize = 20) {
  const out: NotionSearchResult[] = []
  let start_cursor: string | undefined

  do {
    const body: Record<string, unknown> = {
      query,
      page_size: pageSize,
      filter: { property: 'object', value: 'page' },
      sort: { direction: 'descending', timestamp: 'last_edited_time' },
    }
    if (start_cursor) body.start_cursor = start_cursor

    const result = await notionRequest<NotionListResponse<NotionSearchResult>>(
      accessToken,
      '/search',
      { method: 'POST', body }
    )
    out.push(...result.results)
    start_cursor = result.next_cursor ?? undefined
    if (!result.has_more || out.length >= 50) break
  } while (start_cursor)

  return out
}

export async function getNotionPageText(accessToken: string, pageId: string): Promise<string> {
  const lines: string[] = []

  async function visit(blockId: string, depth: number) {
    if (depth > 3) return
    let start_cursor: string | undefined
    do {
      const params = new URLSearchParams({ page_size: '100' })
      if (start_cursor) params.set('start_cursor', start_cursor)
      const result = await notionRequest<NotionListResponse<NotionBlock>>(
        accessToken,
        `/blocks/${blockId}/children?${params.toString()}`
      )

      for (const block of result.results) {
        const text = blockToText(block)
        if (text) lines.push(text)
        if (block.has_children) await visit(block.id, depth + 1)
      }
      start_cursor = result.next_cursor ?? undefined
      if (!result.has_more) break
    } while (start_cursor)
  }

  await visit(pageId, 0)
  return lines.join('\n').trim()
}

export function getNotionPageTitle(page: NotionSearchResult): string {
  const properties = page.properties ?? {}
  for (const value of Object.values(properties)) {
    if (isRecord(value) && value.type === 'title' && Array.isArray(value.title)) {
      const title = richTextToPlain(value.title)
      if (title) return title
    }
  }
  return 'Notion page'
}

function blockToText(block: NotionBlock): string {
  const value = block[block.type]
  if (!isRecord(value)) return ''
  if ('rich_text' in value && Array.isArray(value.rich_text)) {
    return richTextToPlain(value.rich_text)
  }
  if (block.type === 'child_page' && typeof value.title === 'string') return value.title
  if (block.type === 'table_row' && Array.isArray(value.cells)) {
    return value.cells.map((cell) => (Array.isArray(cell) ? richTextToPlain(cell) : '')).join(' | ')
  }
  return ''
}

function richTextToPlain(items: unknown[]): string {
  return items
    .map((item) => (isRecord(item) && typeof item.plain_text === 'string' ? item.plain_text : ''))
    .join('')
    .trim()
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value)
}
