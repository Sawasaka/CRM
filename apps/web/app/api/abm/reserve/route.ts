import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { auth } from '@/lib/auth'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

let _client: ReturnType<typeof createClient> | null = null
function sb() {
  if (_client) return _client
  const url = process.env.ABM_SUPABASE_URL
  const key = process.env.ABM_SUPABASE_SERVICE_KEY
  if (!url || !key) throw new Error('ABM_SUPABASE_URL/ABM_SUPABASE_SERVICE_KEY missing')
  _client = createClient(url, key, { auth: { persistSession: false } })
  return _client
}

/**
 * POST /api/abm/reserve
 * Body: { ids: string[], priority?: 'high' | 'normal' }
 * companies.enrichment_priority と reserved_at を更新
 */
export async function POST(req: NextRequest) {
  const session = await auth()
  const userId = (session as unknown as { userId?: string })?.userId
  if (!userId) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 })

  const body = (await req.json().catch(() => ({}))) as { ids?: string[]; priority?: 'high' | 'normal' }
  const ids = Array.isArray(body.ids) ? body.ids.filter((s) => typeof s === 'string') : []
  const priority = body.priority === 'normal' ? 'normal' : 'high'

  if (ids.length === 0) return NextResponse.json({ error: 'ids が空です' }, { status: 400 })
  if (ids.length > 1000) return NextResponse.json({ error: '一度に予約できるのは1000社まで' }, { status: 400 })

  const supabase = sb()
  const updatePayload = {
    enrichment_priority: priority,
    reserved_at: new Date().toISOString(),
  } as unknown as Parameters<typeof supabase.from extends never ? never : never>[0]
  // Supabase の型推論が動的スキーマに弱いので、any 経由で update
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error, count } = await (supabase.from('companies') as any)
    .update(updatePayload, { count: 'exact' })
    .in('id', ids)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true, reserved: count ?? 0, priority })
}

/**
 * GET /api/abm/reserve - 現在の予約状況サマリ
 */
export async function GET() {
  const session = await auth()
  const userId = (session as unknown as { userId?: string })?.userId
  if (!userId) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 })

  const supabase = sb()
  const { count: highCount } = await supabase
    .from('companies')
    .select('*', { count: 'exact', head: true })
    .eq('enrichment_priority', 'high')
  return NextResponse.json({ highPriority: highCount ?? 0 })
}
