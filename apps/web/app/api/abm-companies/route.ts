import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

const INTENT_PRIORITY: Record<string, number> = { HOT: 4, MIDDLE: 3, LOW: 2, NONE: 1 }

// 表記揺れバリエーション生成（半角/全角/カタカナ/ひらがな）
function toFullWidth(s: string): string {
  return s.replace(/[!-~]/g, c => String.fromCharCode(c.charCodeAt(0) + 0xFEE0))
}
function toHalfWidth(s: string): string {
  return s.replace(/[！-～]/g, c => String.fromCharCode(c.charCodeAt(0) - 0xFEE0))
}
function kataToHira(s: string): string {
  return s.replace(/[ァ-ヶ]/g, c => String.fromCharCode(c.charCodeAt(0) - 0x60))
}
function hiraToKata(s: string): string {
  return s.replace(/[ぁ-ゖ]/g, c => String.fromCharCode(c.charCodeAt(0) + 0x60))
}
function expandSearchVariants(s: string): string[] {
  const set = new Set<string>()
  for (const c of [s, toFullWidth(s), toHalfWidth(s)]) {
    set.add(c)
    set.add(kataToHira(c))
    set.add(hiraToKata(c))
  }
  return Array.from(set).filter(Boolean).slice(0, 8)
}

let _client: ReturnType<typeof createClient> | null = null
function sb() {
  if (_client) return _client
  const url = process.env.ABM_SUPABASE_URL
  const key = process.env.ABM_SUPABASE_SERVICE_KEY
  if (!url || !key) throw new Error('ABM_SUPABASE_URL/ABM_SUPABASE_SERVICE_KEY missing')
  _client = createClient(url, key, { auth: { persistSession: false } })
  return _client
}

// 25部門細分化 → 既存UI用のトップレベルに丸める変換
const TOPLEVEL: Record<string, string> = {
  sales_is: 'SALES', sales_fs: 'SALES', sales_ae: 'SALES', sales_bdr: 'SALES',
  sales_legal: 'SALES', sales: 'SALES',
  it_corp: 'IT', it_engineer: 'IT', it_security: 'IT', it_dx: 'IT',
  it_data: 'IT', it_dev: 'IT', it: 'IT',
  hr_recruit: 'HR', hr_lnd: 'HR', hr_labor: 'HR', hr_planning: 'HR', hr: 'HR',
  fin_acct: 'FINANCE', fin_treasury: 'FINANCE', fin_audit: 'FINANCE',
  fin_tax: 'FINANCE', finance: 'FINANCE',
  mkt_digital: 'MARKETING', mkt_pr: 'MARKETING', mkt_brand: 'MARKETING', marketing: 'MARKETING',
  cs_success: 'CS', cs_support: 'CS', pdm: 'CS', cs: 'CS',
  legal: 'LEGAL', management: 'MANAGEMENT', rd: 'RD',
  operations: 'OPERATIONS', engineering: 'ENGINEERING', other: 'OTHER',
}

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams
  const search = sp.get('search') ?? undefined
  const intentLevel = sp.get('intentLevel') ?? undefined
  const industryId = sp.get('industryId') ?? undefined
  const minEmployees = sp.get('minEmployees') ? parseInt(sp.get('minEmployees')!, 10) : undefined
  const take = Math.min(parseInt(sp.get('take') ?? '5000', 10), 10000)
  const skip = parseInt(sp.get('skip') ?? '0', 10)
  const onlyEnriched = sp.get('onlyEnriched') !== 'false' // デフォルトは completed のみ

  const supabase = sb()

  // 290万社全件 + name部分一致 で count: 'exact' を取ると statement timeout になるため、
  // search 指定時は count を取らない。それ以外（エンリッチ済モード）は exact count を取得
  const countMode = (search || !onlyEnriched) ? undefined : ('exact' as const)
  let q = supabase
    .from('companies')
    .select(
      'id, corporate_number, name, name_kana, website_url, prefecture, city, address, corporate_type, employee_count, employee_count_num, revenue, hq_phone, service_summary, company_features, enrichment_status, industry_id, created_at, updated_at',
      countMode ? { count: countMode } : undefined,
    )

  if (onlyEnriched) q = q.eq('enrichment_status', 'completed')
  if (industryId) q = q.eq('industry_id', industryId)
  if (minEmployees) q = q.gte('employee_count_num', minEmployees)
  if (search) {
    // 13桁の数字なら法人番号 完全一致
    if (/^\d{13}$/.test(search.trim())) {
      q = q.eq('corporate_number', search.trim())
    } else {
      // 表記揺れ展開: 半角/全角/カナ/ひらがな で name 部分一致（pg_trgm GIN index 利用）
      const variants = expandSearchVariants(search)
      const escape = (v: string) => v.replace(/,/g, '\\,').replace(/\(/g, '\\(').replace(/\)/g, '\\)')
      const nameClause = variants.map(v => `name.ilike.%${escape(v)}%`).join(',')
      q = q.or(nameClause)
    }
  }

  // search 時は employee_count_num の全件ソートが重いので corporate_number 順（B-tree 効く）
  if (search) {
    q = q.order('corporate_number', { ascending: true })
  } else {
    q = q.order('employee_count_num', { ascending: false, nullsFirst: false })
  }
  // search 時は take を小さめに（最大200件）
  const effectiveTake = search ? Math.min(take, 200) : take
  q = q.range(skip, skip + effectiveTake - 1).limit(effectiveTake)
  const { data: rows, error, count } = await q
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const ids = (rows ?? []).map((r: { id: string }) => r.id)

  // 業種マスタ + インテント集約 + 拠点 + サービスタグ をまとめて取得
  // PostgREST のデフォルト上限が 1000 行のため、company_id を 200 件単位で分割して取得
  const CHUNK = 200
  const idChunks: string[][] = []
  for (let i = 0; i < ids.length; i += CHUNK) idChunks.push(ids.slice(i, i + CHUNK))

  const intentsRequests = idChunks.map((chunk) =>
    supabase
      .from('company_intents')
      .select('company_id, department_type, intent_level, latest_signal_date, signal_count')
      .in('company_id', chunk)
      .in('intent_level', ['hot', 'middle', 'low']),
  )

  // 拠点数(offices テーブル)・サービスタグ(company_tags + service_tags)
  const officesRequests = idChunks.map((chunk) =>
    supabase.from('offices').select('id, company_id').in('company_id', chunk),
  )
  const tagLinksRequests = idChunks.map((chunk) =>
    supabase.from('company_tags').select('company_id, tag_id').in('company_id', chunk),
  )

  const [industriesR, allTagsR, ...combinedResults] = await Promise.all([
    supabase.from('industries').select('id, name'),
    supabase.from('service_tags').select('id, name'),
    ...intentsRequests,
    ...officesRequests,
    ...tagLinksRequests,
  ])

  const numChunks = idChunks.length
  const intentsResults = combinedResults.slice(0, numChunks)
  const officesResults = combinedResults.slice(numChunks, numChunks * 2)
  const tagLinksResults = combinedResults.slice(numChunks * 2, numChunks * 3)

  const intentsR = {
    data: intentsResults.flatMap((r) => (r as { data?: Array<Record<string, unknown>> | null }).data ?? []),
  }

  // 拠点数を company_id ごとにカウント
  const officeCountMap = new Map<string, number>()
  for (const r of officesResults) {
    const data = (r as { data?: Array<{ company_id: string }> | null }).data ?? []
    for (const o of data) {
      officeCountMap.set(o.company_id, (officeCountMap.get(o.company_id) ?? 0) + 1)
    }
  }

  // サービスタグ: tag_id → name のマップ作成
  const tagNameMap = new Map<string, string>()
  for (const t of (allTagsR.data ?? []) as Array<{ id: string; name: string }>) {
    tagNameMap.set(t.id, t.name)
  }
  // company_id → タグ名配列
  const tagsByCompany = new Map<string, Array<{ tag: { id: string; name: string } }>>()
  for (const r of tagLinksResults) {
    const data = (r as { data?: Array<{ company_id: string; tag_id: string }> | null }).data ?? []
    for (const ct of data) {
      const name = tagNameMap.get(ct.tag_id)
      if (!name) continue
      const arr = tagsByCompany.get(ct.company_id) ?? []
      arr.push({ tag: { id: ct.tag_id, name } })
      tagsByCompany.set(ct.company_id, arr)
    }
  }

  const industryMap = new Map<string, string>()
  for (const i of (industriesR.data ?? []) as Array<{ id: string; name: string }>) {
    industryMap.set(i.id, i.name)
  }

  // company_id → トップレベル部門に集約したインテント配列
  type IntentItem = { departmentType: string; intentLevel: string; latestSignalAt: string | null; signalCount: number }
  const intentMap = new Map<string, IntentItem[]>()
  for (const ix of (intentsR.data ?? []) as Array<{ company_id: string; department_type: string; intent_level: string; latest_signal_date: string | null; signal_count: number | null }>) {
    const top = TOPLEVEL[ix.department_type] ?? 'OTHER'
    const arr = intentMap.get(ix.company_id) ?? []
    arr.push({
      departmentType: top,
      intentLevel: ix.intent_level.toUpperCase(),
      latestSignalAt: ix.latest_signal_date,
      signalCount: ix.signal_count ?? 0,
    })
    intentMap.set(ix.company_id, arr)
  }

  // intentLevel フィルタ
  let filteredRows = rows ?? []
  if (intentLevel) {
    filteredRows = filteredRows.filter((r: { id: string }) => {
      const ints = intentMap.get(r.id) ?? []
      return ints.some((i) => i.intentLevel === intentLevel.toUpperCase())
    })
  }

  type Row = {
    id: string
    corporate_number: string | null
    name: string
    name_kana: string | null
    website_url: string | null
    prefecture: string | null
    city: string | null
    address: string | null
    corporate_type: string | null
    employee_count: string | null
    revenue: string | null
    hq_phone: string | null
    service_summary: string | null
    company_features: string | null
    enrichment_status: string | null
    industry_id: string | null
    created_at: string | null
    updated_at: string | null
  }

  const data = (filteredRows as Row[]).map((r) => ({
    id: r.id,
    corporateNumber: r.corporate_number ?? '',
    name: r.name,
    nameKana: r.name_kana,
    websiteUrl: r.website_url,
    prefecture: r.prefecture ?? '',
    city: r.city,
    address: r.address,
    corporateType: r.corporate_type ?? '株式会社',
    employeeCount: r.employee_count,
    revenue: r.revenue,
    representative: null,
    representativePhone: r.hq_phone,
    representativeEmail: null,
    serviceSummary: r.service_summary,
    enrichmentStatus: r.enrichment_status?.toUpperCase() ?? 'COMPLETED',
    lastCrawledAt: r.updated_at,
    lastEnrichedAt: r.updated_at,
    industry: r.industry_id
      ? { id: r.industry_id, name: industryMap.get(r.industry_id) ?? '' }
      : null,
    serviceTags: tagsByCompany.get(r.id) ?? [],
    _count: {
      offices: officeCountMap.get(r.id) ?? 0,
      departments: 0,
      intentSignals: 0,
    },
    companyIntents: intentMap.get(r.id) ?? [],
  }))

  // 最高インテントで並び替え (HOT→MIDDLE→LOW→なし)
  // 同レベル内では「3rdパーティ シグナル件数の合計」が多い企業を上位に
  // (例: HOT 同士なら、求人シグナルの累計が多い企業が先頭)
  // さらに同件数なら最新シグナルが新しい企業 → 最後に社名順
  data.sort((a, b) => {
    const aTop = a.companyIntents.reduce((m, ci) => Math.max(m, INTENT_PRIORITY[ci.intentLevel] ?? 0), 0)
    const bTop = b.companyIntents.reduce((m, ci) => Math.max(m, INTENT_PRIORITY[ci.intentLevel] ?? 0), 0)
    if (aTop !== bTop) return bTop - aTop

    const aSignals = a.companyIntents.reduce((s, ci) => s + (ci.signalCount ?? 0), 0)
    const bSignals = b.companyIntents.reduce((s, ci) => s + (ci.signalCount ?? 0), 0)
    if (aSignals !== bSignals) return bSignals - aSignals

    const aLatest = a.companyIntents.reduce((m, ci) => (ci.latestSignalAt && ci.latestSignalAt > m ? ci.latestSignalAt : m), '')
    const bLatest = b.companyIntents.reduce((m, ci) => (ci.latestSignalAt && ci.latestSignalAt > m ? ci.latestSignalAt : m), '')
    if (aLatest !== bLatest) return bLatest.localeCompare(aLatest)

    return a.name.localeCompare(b.name, 'ja')
  })

  return NextResponse.json(
    { data, total: count ?? data.length, take, skip },
    {
      headers: {
        'Cache-Control': 'public, max-age=60, stale-while-revalidate=300',
      },
    },
  )
}
