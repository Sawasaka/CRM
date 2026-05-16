// 外部Web検索でリサーチコンテキストを補強
// 用途：直近ニュース、プレスリリース、キーパーソン、競合言及など
// プリセットによってクエリを切り替え
// バックエンド：Serper を優先、Tavilyを fallback

export type WebSearchResult = {
  title: string
  url: string
  snippet: string
}

async function searchSerper(query: string, maxResults = 5): Promise<WebSearchResult[]> {
  const apiKey = process.env.SERPER_API_KEY
  if (!apiKey) return []
  try {
    const res = await fetch('https://google.serper.dev/search', {
      method: 'POST',
      headers: { 'X-API-KEY': apiKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({ q: query, gl: 'jp', hl: 'ja', num: maxResults }),
      signal: AbortSignal.timeout(12000),
    })
    if (!res.ok) return []
    const data = (await res.json()) as { organic?: Array<{ title: string; link: string; snippet?: string }> }
    return (data.organic ?? []).map((r) => ({
      title: r.title,
      url: r.link,
      snippet: (r.snippet ?? '').slice(0, 400),
    }))
  } catch {
    return []
  }
}

async function searchTavily(query: string, maxResults = 5): Promise<WebSearchResult[]> {
  const apiKey = process.env.TAVILY_API_KEY
  if (!apiKey) return []
  try {
    const res = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: apiKey,
        query,
        max_results: maxResults,
        search_depth: 'basic',
        include_answer: false,
      }),
      signal: AbortSignal.timeout(15000),
    })
    if (!res.ok) return []
    const data = (await res.json()) as { results?: Array<{ title: string; url: string; content?: string }> }
    return (data.results ?? []).map((r) => ({
      title: r.title,
      url: r.url,
      snippet: (r.content ?? '').slice(0, 400),
    }))
  } catch {
    return []
  }
}

export async function searchWeb(query: string, maxResults = 5): Promise<WebSearchResult[]> {
  // Serper優先、空ならTavily
  const r = await searchSerper(query, maxResults)
  if (r.length > 0) return r
  return searchTavily(query, maxResults)
}

/**
 * プリセットID + 企業名から、適切な検索クエリ群を生成して並列実行
 * 結果をシステムプロンプト用にフォーマット済みテキストで返す
 */
export async function buildWebContext(
  presetId: string | undefined,
  companyName: string,
): Promise<string | null> {
  // Web検索を有効にするプリセットIDのみ
  const queriesByPreset: Record<string, string[]> = {
    company_intel: [
      `${companyName} プレスリリース 2025 OR 2026`,
      `${companyName} 新サービス OR 新規事業 2025 OR 2026`,
      `${companyName} 社長メッセージ 経営方針`,
      `${companyName} 中期経営計画 OR 中期計画`,
      `${companyName} 役員 取締役`,
      `${companyName} 採用 責任者 OR 人事`,
      `${companyName} 課題 OR 経営課題`,
    ],
    service_research: [
      `${companyName} 採用 求人 SaaS 利用`,
      `${companyName} 導入事例`,
      `${companyName} 利用ツール OR 業務システム`,
    ],
    pre_pitch_research: [
      `${companyName} プレスリリース 2025 OR 2026`,
      `${companyName} 課題 OR 経営課題`,
      `${companyName} 中期経営計画 OR 中期計画`,
    ],
    // 「すべて」— 3プリセットの検索クエリを合算
    all_in_one: [
      `${companyName} プレスリリース 2025 OR 2026`,
      `${companyName} 新サービス OR 新規事業 2025 OR 2026`,
      `${companyName} 社長メッセージ 経営方針`,
      `${companyName} 中期経営計画 OR 中期計画`,
      `${companyName} 役員 取締役`,
      `${companyName} 採用 責任者 OR 人事`,
      `${companyName} 課題 OR 経営課題`,
      `${companyName} 採用 求人 SaaS 利用`,
      `${companyName} 導入事例`,
    ],
  }
  if (!presetId || !queriesByPreset[presetId]) return null

  const queries = queriesByPreset[presetId]
  const results = await Promise.all(queries.map((q) => searchWeb(q, 4)))
  const flat: WebSearchResult[] = []
  const seenUrls = new Set<string>()
  for (const arr of results) {
    for (const r of arr) {
      if (seenUrls.has(r.url)) continue
      seenUrls.add(r.url)
      flat.push(r)
      if (flat.length >= 12) break
    }
    if (flat.length >= 12) break
  }
  if (flat.length === 0) return null

  const lines: string[] = []
  lines.push('\n## 外部Web検索結果（Tavily）')
  for (const r of flat) {
    lines.push(`- [${r.title}](${r.url})`)
    if (r.snippet) lines.push(`  ${r.snippet.replace(/\s+/g, ' ').slice(0, 300)}`)
  }
  return lines.join('\n')
}
