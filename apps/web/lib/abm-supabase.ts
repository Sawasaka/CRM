import { createClient, type SupabaseClient } from '@supabase/supabase-js'

let _client: SupabaseClient | null = null

function getClient(): SupabaseClient {
  if (_client) return _client
  const url = process.env.ABM_SUPABASE_URL
  const key = process.env.ABM_SUPABASE_SERVICE_KEY
  if (!url || !key) throw new Error('ABM_SUPABASE_URL/ABM_SUPABASE_SERVICE_KEY missing')
  _client = createClient(url, key, { auth: { persistSession: false } })
  return _client
}

export type AbmCompanyRow = {
  id: string
  corporate_number: string | null
  name: string
  name_kana: string | null
  corporate_type: string | null
  website_url: string | null
  prefecture: string | null
  city: string | null
  address: string | null
  industry_id: string | null
  service_summary: string | null
  company_features: string | null
  employee_count: string | null
  employee_count_num: number | null
  employee_count_basis: string | null
  revenue: string | null
  revenue_num: number | null
  enrichment_status: string | null
  hq_phone: string | null
  twitter_url: string | null
  linkedin_url: string | null
  facebook_url: string | null
  youtube_url: string | null
  instagram_url: string | null
  github_url: string | null
  note_url: string | null
  established_at: string | null
  capital_stock: number | null
  representative_name: string | null
  gbiz_industry_code: string | null
  business_items: string | null
  created_at: string | null
  updated_at: string | null
}

export type AbmOfficeRow = {
  id: string
  name: string
  office_type: string | null
  prefecture: string | null
  city: string | null
  address: string | null
  phone: string | null
  dept_phones: Record<string, string> | null
  is_primary: boolean | null
  website_url: string | null
}

export type AbmIntentSignalRow = {
  id: string
  title: string
  signal_type: string | null
  source_name: string | null
  source_url: string | null
  posted_date: string | null
  department_type: string | null
  created_at: string | null
  discovered_at: string | null
  raw_data: Record<string, unknown> | null
}

export type AbmCompanyIntentRow = {
  id: string
  department_type: string
  intent_level: string
  signal_count: number | null
  latest_signal_date: string | null
}

export type AbmIndustryRow = {
  id: string
  name: string
  category: string | null
}

export type AbmServiceTagRow = {
  id: string
  name: string
}

export type AbmDepartmentRow = {
  id: string
  office_id: string | null
  name: string
  department_type: string | null
  parent_department_id: string | null
  hierarchy_level: number | null
  headcount: number | null
  description: string | null
  source_url: string | null
  created_at: string | null
}

export type AbmCompanyDetail = {
  company: AbmCompanyRow
  industry: AbmIndustryRow | null
  offices: AbmOfficeRow[]
  intentSignals: AbmIntentSignalRow[]
  companyIntents: AbmCompanyIntentRow[]
  serviceTags: AbmServiceTagRow[]
  departments: AbmDepartmentRow[]
}

export async function getAbmCompanyDetail(id: string): Promise<AbmCompanyDetail | null> {
  const sb = getClient()
  const { data: company, error } = await sb.from('companies').select('*').eq('id', id).maybeSingle()
  if (error || !company) return null

  const [industryR, officesR, signalsR, intentsR, tagLinksR, departmentsR] = await Promise.all([
    company.industry_id
      ? sb.from('industries').select('id, name, category').eq('id', company.industry_id).maybeSingle()
      : Promise.resolve({ data: null }),
    sb
      .from('offices')
      .select('id, name, office_type, prefecture, city, address, phone, dept_phones, is_primary, website_url')
      .eq('company_id', id)
      .order('is_primary', { ascending: false })
      .order('created_at', { ascending: true }),
    sb
      .from('intent_signals')
      .select('id, title, signal_type, source_name, source_url, posted_date, department_type, created_at, discovered_at, raw_data')
      .eq('company_id', id)
      .order('discovered_at', { ascending: false, nullsFirst: false })
      .limit(50),
    sb
      .from('company_intents')
      .select('id, department_type, intent_level, signal_count, latest_signal_date')
      .eq('company_id', id)
      .order('latest_signal_date', { ascending: false, nullsFirst: false }),
    sb.from('company_tags').select('tag_id').eq('company_id', id),
    sb
      .from('departments')
      .select('id, office_id, name, department_type, parent_department_id, hierarchy_level, headcount, description, source_url, created_at')
      .eq('company_id', id)
      // hierarchy_level の小さい(=ルート)順 → 同レベル内は created_at 順
      .order('hierarchy_level', { ascending: true, nullsFirst: false })
      .order('created_at', { ascending: true })
      .limit(200),
  ])

  // サービスタグ名を解決
  const tagIds = ((tagLinksR.data as Array<{ tag_id: string }>) ?? []).map((t) => t.tag_id)
  let serviceTags: AbmServiceTagRow[] = []
  if (tagIds.length > 0) {
    const { data: tagsR } = await sb.from('service_tags').select('id, name').in('id', tagIds)
    serviceTags = (tagsR as AbmServiceTagRow[]) ?? []
  }

  return {
    company: company as AbmCompanyRow,
    industry: (industryR.data as AbmIndustryRow | null) ?? null,
    offices: ((officesR.data as AbmOfficeRow[]) ?? []),
    intentSignals: ((signalsR.data as AbmIntentSignalRow[]) ?? []),
    companyIntents: ((intentsR.data as AbmCompanyIntentRow[]) ?? []),
    serviceTags,
    departments: ((departmentsR.data as AbmDepartmentRow[]) ?? []),
  }
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
export function isAbmUuid(id: string): boolean {
  return UUID_RE.test(id)
}

// 法人番号 (13桁) から companies.id を引く
export async function getAbmCompanyIdByCorporateNumber(corporateNumber: string): Promise<string | null> {
  if (!/^\d{13}$/.test(corporateNumber)) return null
  // ここでは getClient() を内部で参照する代わりに createClient を直接呼ぶ
  const url = process.env.ABM_SUPABASE_URL
  const key = process.env.ABM_SUPABASE_SERVICE_KEY
  if (!url || !key) return null
  const { createClient } = await import('@supabase/supabase-js')
  const sb = createClient(url, key, { auth: { persistSession: false } })
  const { data, error } = await sb
    .from('companies')
    .select('id')
    .eq('corporate_number', corporateNumber)
    .maybeSingle()
  if (error || !data) return null
  return (data as { id: string }).id
}
