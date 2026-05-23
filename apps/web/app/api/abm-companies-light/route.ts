import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

// 290万社の登記台帳から軽量検索（社名・住所・法人番号のみ）
// インデックスが効く前提：name (部分一致だが先頭一致なら高速)、prefecture、corporate_number

// 表記揺れバリエーションを生成（半角/全角/カナ/ひらがな）
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
  const candidates = [s, toFullWidth(s), toHalfWidth(s)]
  for (const c of candidates) {
    set.add(c)
    set.add(kataToHira(c))
    set.add(hiraToKata(c))
  }
  return Array.from(set).filter(Boolean).slice(0, 8) // 最大8バリエーションで安全に
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

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams
  const search = sp.get('search')?.trim()
  const prefecture = sp.get('prefecture')?.trim()
  const minEmp = sp.get('minEmployees') ? parseInt(sp.get('minEmployees')!, 10) : undefined
  const minCapital = sp.get('minCapital') ? parseInt(sp.get('minCapital')!, 10) : undefined
  const establishedAfter = sp.get('establishedAfter')?.trim() // YYYY-MM-DD
  const establishedBefore = sp.get('establishedBefore')?.trim()
  const enrichmentStatus = sp.get('enrichmentStatus')?.trim() // 'completed' | 'pending'
  const take = Math.min(parseInt(sp.get('take') ?? '50', 10), 200)
  const cursor = sp.get('cursor') ?? '' // corporate_number ベースのcursor

  const supabase = sb()
  let q = supabase
    .from('companies')
    .select(
      'id, corporate_number, name, prefecture, city, address, employee_count_num, enrichment_status, gbiz_industry_code, established_at, capital_stock, website_url',
    )
    .order('corporate_number', { ascending: true })
    .limit(take)

  if (search) {
    // 法人番号13桁ぴったり → 完全一致
    if (/^\d{13}$/.test(search)) {
      q = q.eq('corporate_number', search)
    } else {
      // 表記揺れ展開: 半角/全角/カナ/ひらがな すべてのバリアントで OR 検索
      const variants = expandSearchVariants(search)
      const orClause = variants
        .map(v => `name.ilike.%${v.replace(/,/g, '\\,').replace(/\(/g, '\\(').replace(/\)/g, '\\)')}%`)
        .join(',')
      q = q.or(orClause)
    }
  }
  if (prefecture) q = q.eq('prefecture', prefecture)
  if (minEmp) q = q.gte('employee_count_num', minEmp)
  if (minCapital) q = q.gte('capital_stock', minCapital)
  if (establishedAfter) q = q.gte('established_at', establishedAfter)
  if (establishedBefore) q = q.lte('established_at', establishedBefore)
  if (enrichmentStatus) q = q.eq('enrichment_status', enrichmentStatus)
  if (cursor) q = q.gt('corporate_number', cursor)

  const { data, error } = await q
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json(
    {
      data: data ?? [],
      nextCursor: (data && data.length === take)
        ? ((data[data.length - 1] as unknown as { corporate_number: string })?.corporate_number ?? null)
        : null,
    },
    {
      headers: { 'Cache-Control': 'public, max-age=60, stale-while-revalidate=300' },
    },
  )
}
