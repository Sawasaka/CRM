import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

// 290万社の登記台帳から軽量検索（社名・住所・法人番号のみ）
// インデックスが効く前提：name (部分一致だが先頭一致なら高速)、prefecture、corporate_number
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
    // 社名前方一致 or 法人番号
    if (/^\d{13}$/.test(search)) {
      q = q.eq('corporate_number', search)
    } else {
      q = q.ilike('name', `%${search}%`)
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
