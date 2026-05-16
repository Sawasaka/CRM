/**
 * 部署直通電話エンリッチメント (Step 1+2)
 *
 * 既存のエンリッチ済 6,967 社を対象に、各社のWebサイトから
 * 「採用 / 営業 / IR・広報 / 経理・総務 / カスタマーサクセス」など
 * 部門別の直通電話を抽出する。
 *
 * 抽出経路:
 *   1. 既存 intent_signals.source_url (求人URL) → 採用部門電話を最優先抽出
 *   2. companies.website_url から /contact, /company, /recruit, /ir パスを巡回
 *   3. Jina で本文抽出 → Claude Haiku で部門別電話番号を JSON 抽出
 *   4. offices.dept_phones (JSONB Record<string,string>) に書き戻す
 *      対象オフィス: is_primary=true の本社レコード
 *
 * 使い方:
 *   pnpm enrich:dept-phones                    # デフォルト 50 社
 *   pnpm enrich:dept-phones --limit=200        # 200社処理
 *   pnpm enrich:dept-phones --priority=hot     # HOT インテントを優先
 *   pnpm enrich:dept-phones --dry-run          # DB 書き込みなし
 *   pnpm enrich:dept-phones --company=<uuid>   # 特定企業のみ
 *
 * 環境変数:
 *   ABM_SUPABASE_URL, ABM_SUPABASE_SERVICE_KEY  … companies/offices DB
 *   ANTHROPIC_API_KEY                           … Claude Haiku 4.5
 *   JINA_API_KEY (任意)                          … 本文抽出 (無料枠あり)
 */

import { createClient } from '@supabase/supabase-js'

const ABM_URL = process.env.ABM_SUPABASE_URL
const ABM_KEY = process.env.ABM_SUPABASE_SERVICE_KEY
const GEMINI_API_KEY = process.env.GEMINI_API_KEY
const JINA_API_KEY = process.env.JINA_API_KEY
// Gemini 2.5 Flash-Lite はコストが低く、抽出タスクには十分な精度
const MODEL = process.env.DEPT_PHONE_MODEL ?? 'gemini-2.5-flash-lite'

if (!ABM_URL || !ABM_KEY) {
  console.error('❌ ABM_SUPABASE_URL / ABM_SUPABASE_SERVICE_KEY が未設定です')
  process.exit(1)
}
if (!GEMINI_API_KEY) {
  console.error('❌ GEMINI_API_KEY が未設定です')
  process.exit(1)
}

const sb = createClient(ABM_URL, ABM_KEY, { auth: { persistSession: false } })

// ─── CLI args ───────────────────────────────────────────────
function parseArgs() {
  const args = process.argv.slice(2)
  const get = (key: string) => args.find((a) => a.startsWith(`--${key}=`))?.split('=')[1]
  return {
    limit: parseInt(get('limit') ?? '50', 10),
    priority: (get('priority') ?? 'all') as 'hot' | 'all',
    company: get('company') ?? null,
    industryIds: (get('industry-ids') ?? '').split(',').filter(Boolean),
    minEmp: parseInt(get('min-emp') ?? '300', 10),
    maxEmp: parseInt(get('max-emp') ?? '3000', 10),
    dryRun: args.includes('--dry-run'),
    debug: args.includes('--debug'),
    // 並列度。Jina の 429 を避けるため 3-5 程度推奨
    concurrency: parseInt(get('concurrency') ?? '3', 10),
    // 早期終了モード (採用 + 1部門で打ち切り)
    fastExit: !args.includes('--no-fast-exit'),
  }
}

let DEBUG = false
function dlog(...a: unknown[]) {
  if (DEBUG) console.log('   [debug]', ...a)
}

// ─── 候補ページパス (浅い順から深い順)
// 採用 → 問い合わせ → IR → 会社情報 → トップ
const CANDIDATE_PATHS = [
  // 採用関連 (深いパスも含む)
  '/recruit/contact',
  '/recruit/contact/',
  '/careers/contact',
  '/careers/contact/',
  '/recruit',
  '/recruit/',
  '/careers',
  '/careers/',
  '/saiyo',
  '/saiyo/',
  '/jobs',
  // 問い合わせ系
  '/contact',
  '/contact/',
  '/contacts',
  '/inquiry',
  '/inquiry/',
  '/ja/contact',
  '/ja/contact/',
  // IR/広報 (上場企業向け)
  '/ir/contact',
  '/ir/contact/',
  '/ir',
  '/press',
  '/news/contact',
  // 会社情報
  '/company/contact',
  '/company',
  '/company/',
  '/about',
  '/about/contact',
  // トップ・フッタ確認
  '',
  '/',
]

// ─── Jina で本文取得 (上限 8KB) ───────────────────────────────
async function jinaFetch(url: string): Promise<string> {
  try {
    const jinaUrl = `https://r.jina.ai/${url}`
    const res = await fetch(jinaUrl, {
      headers: JINA_API_KEY ? { Authorization: `Bearer ${JINA_API_KEY}` } : {},
    })
    if (!res.ok) {
      dlog(`  jina ${res.status}: ${url}`)
      return ''
    }
    const body = (await res.text()).slice(0, 8000)
    dlog(`  jina ok ${body.length}B: ${url}`)
    return body
  } catch (e) {
    dlog(`  jina ERR ${(e as Error).message}: ${url}`)
    return ''
  }
}

// ─── Claude Haiku で部門別電話を抽出 ───────────────────────────
type DeptPhones = {
  recruit?: string | null   // 採用 (Step 1)
  sales?: string | null     // 営業
  ir?: string | null        // IR
  pr?: string | null        // 広報
  hr?: string | null        // 人事 (採用以外)
  finance?: string | null   // 経理
  general?: string | null   // 総務
  cs?: string | null        // カスタマーサクセス/サポート
}

async function extractDeptPhones(
  companyName: string,
  bodyText: string,
): Promise<DeptPhones> {
  if (!bodyText.trim()) return {}

  const system = `あなたは企業情報抽出の専門家です。
与えられた企業のWebページ本文から、各部門ごとの問い合わせ電話番号を JSON 形式で抽出してください。

ルール:
- 必ず JSON のみを返してください (前後に説明文を付けない)
- 該当部門の番号が見つからない場合は null を返してください
- 部門が文脈から推定できる電話番号を採用してください。例:
  ・「採用に関するお問い合わせ: 03-XXXX-XXXX」 → recruit
  ・「採用窓口」「人事採用係」 → recruit
  ・「お客様お問い合わせ」「カスタマーサポート」 → cs
  ・「IR担当」「投資家向けお問い合わせ」 → ir
  ・「広報部」「報道関係お問い合わせ」 → pr
  ・「営業」「法人問い合わせ」 → sales
  ・「総務部」「経理部」 → general/finance
- 部門の文脈が無い「TEL: 03-XXXX-XXXX」等の単一代表番号は無視してください
- 日本国内電話番号 (03-1234-5678 / 0120-XX-XXXX / 080-XXXX-XXXX 形式) のみ
- URL・メールアドレス・郵便番号・住所は決して含めないでください
- ハイフン区切りの数字以外は null
- ページに記載がない部門は null`

  const user = `企業名: ${companyName}

ページ本文 (抜粋):
${bodyText.slice(0, 6000)}

JSON スキーマ:
{
  "recruit":  string | null,  // 採用窓口の直通
  "sales":    string | null,  // 営業/法人問い合わせ直通
  "ir":       string | null,  // IR 直通
  "pr":       string | null,  // 広報 直通
  "hr":       string | null,  // 人事 (採用以外) 直通
  "finance":  string | null,  // 経理 直通
  "general":  string | null,  // 総務 直通
  "cs":       string | null   // カスタマーサクセス・サポート直通
}`

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${GEMINI_API_KEY}`
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: system }] },
        contents: [{ role: 'user', parts: [{ text: user }] }],
        generationConfig: { temperature: 0.1, maxOutputTokens: 512, responseMimeType: 'application/json' },
      }),
    })
    if (!res.ok) return {}
    const json: { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> } = await res.json()
    const text = json.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
    const match = text.match(/\{[\s\S]*\}/)
    if (!match) return {}
    return JSON.parse(match[0]) as DeptPhones
  } catch {
    return {}
  }
}

// ─── 企業ごとの処理 ───────────────────────────────────────────
type Target = {
  id: string
  name: string
  website_url: string | null
  hq_phone: string | null
  intent_signal_url?: string | null
}

async function processCompany(
  target: Target,
  dryRun: boolean,
  fastExit: boolean,
): Promise<{ found: number; depts: DeptPhones }> {
  const collected: DeptPhones = {}
  const visitedUrls = new Set<string>()
  let consecutive429 = 0

  // 1. 採用シグナルの URL があれば最優先 (Step 1)
  if (target.intent_signal_url && /^https?:/i.test(target.intent_signal_url)) {
    visitedUrls.add(target.intent_signal_url)
    const body = await jinaFetch(target.intent_signal_url)
    if (body) {
      const r = await extractDeptPhones(target.name, body)
      Object.assign(collected, filterByHqPhone(r, target.hq_phone))
    }
  }

  // 2. 公式サイトのパスを巡回
  if (target.website_url && /^https?:/i.test(target.website_url)) {
    const base = target.website_url.replace(/\/+$/, '')
    for (const path of CANDIDATE_PATHS) {
      const url = base + path
      if (visitedUrls.has(url)) continue
      visitedUrls.add(url)

      // 早期終了:
      // - fastExit ON で 2部門以上取れれば次の社へ (1つだと不安)
      // - 4部門以上取れていれば必ず打ち切り
      const filledKeys = Object.keys(collected).filter((k) => collected[k as keyof DeptPhones])
      if (filledKeys.length >= 4) break
      if (fastExit && filledKeys.length >= 2) break

      // 連続 429 が出たらこの社はスキップ
      if (consecutive429 >= 3) {
        dlog(`  429 連続のためスキップ: ${target.name}`)
        break
      }

      const body = await jinaFetch(url)
      if (!body) {
        // 直近 fetch が 429 だったかは jinaFetch 内ログから判断できないので、
        // 連続失敗カウントは「空が連続した時」に増やす
        consecutive429++
        continue
      }
      consecutive429 = 0

      const r = await extractDeptPhones(target.name, body)
      // 既に取得済みの key は上書きしない (最初に見つけた採用ページの番号を優先)
      for (const [k, v] of Object.entries(r)) {
        const key = k as keyof DeptPhones
        if (!collected[key] && v) collected[key] = v
      }
    }
  }

  // 代表電話と一致する番号は除外 (部門直通として意味がない)
  const final = filterByHqPhone(collected, target.hq_phone)
  const found = Object.values(final).filter(Boolean).length

  if (found > 0 && !dryRun) {
    // 本社オフィス (is_primary=true) を取得して dept_phones を更新
    const { data: hqOffice } = await sb
      .from('offices')
      .select('id, dept_phones')
      .eq('company_id', target.id)
      .eq('is_primary', true)
      .maybeSingle()

    if (hqOffice) {
      const merged = { ...(hqOffice.dept_phones ?? {}), ...stripNulls(final) }
      const { error } = await sb
        .from('offices')
        .update({ dept_phones: merged, updated_at: new Date().toISOString() })
        .eq('id', hqOffice.id)
      if (error) console.error(`  ⚠️ DB更新失敗: ${error.message}`)
    } else {
      console.warn(`  ⚠️ 本社オフィスが見つかりません: ${target.name}`)
    }
  }

  return { found, depts: final }
}

// 日本国内の電話番号フォーマット (固定+携帯+フリーダイヤル)
const PHONE_RE = /^(?:0\d{1,4}-\d{1,4}-\d{3,4}|0120-?\d{2,4}-?\d{2,4}|0\d{9,10})$/

function isValidPhone(v: string | null | undefined): boolean {
  if (!v) return false
  // 余計な空白除去 + 全角ハイフンを半角に統一
  const cleaned = v.trim().replace(/[‐–—-]/g, '-').replace(/[()()]/g, '')
  return PHONE_RE.test(cleaned)
}

function filterByHqPhone(d: DeptPhones, hqPhone: string | null): DeptPhones {
  const norm = (s: string | null | undefined) => (s ?? '').replace(/[-\s()]/g, '')
  const hq = hqPhone ? norm(hqPhone) : ''
  const out: DeptPhones = {}
  for (const [k, v] of Object.entries(d)) {
    if (!v) continue
    // 電話番号フォーマット必須 (URL や住所などのゴミを排除)
    if (!isValidPhone(v)) continue
    // 代表電話と同じものは部署直通として無価値
    if (hq && norm(v) === hq) continue
    out[k as keyof DeptPhones] = v
  }
  return out
}

function stripNulls(d: DeptPhones): Record<string, string> {
  const out: Record<string, string> = {}
  for (const [k, v] of Object.entries(d)) if (v) out[k] = v
  return out
}

// ─── 抽出対象企業のロード ─────────────────────────────────────
async function loadTargets(opts: ReturnType<typeof parseArgs>): Promise<Target[]> {
  if (opts.company) {
    const { data } = await sb
      .from('companies')
      .select('id, name, website_url, hq_phone')
      .eq('id', opts.company)
      .maybeSingle()
    if (!data) return []
    return [data as Target]
  }

  // HOT 企業優先 (company_intents から company_id を取得)
  let targetIds: string[] | null = null
  if (opts.priority === 'hot') {
    const { data: hotIntents } = await sb
      .from('company_intents')
      .select('company_id')
      .eq('intent_level', 'hot')
      .limit(1000)
    targetIds = Array.from(new Set((hotIntents ?? []).map((r) => r.company_id))) as string[]
  }

  let q = sb
    .from('companies')
    .select('id, name, website_url, hq_phone')
    .eq('enrichment_status', 'completed')
    .not('website_url', 'is', null)
    .gte('employee_count_num', opts.minEmp)
    .lte('employee_count_num', opts.maxEmp)
    .order('employee_count_num', { ascending: false, nullsFirst: false })
    .limit(opts.limit)

  // 業種フィルタ
  if (opts.industryIds.length > 0) q = q.in('industry_id', opts.industryIds)
  if (targetIds) q = q.in('id', targetIds.slice(0, opts.limit))

  const { data } = await q
  const baseTargets = (data ?? []) as Target[]

  // 採用シグナルURLを併せて取得して各社に付与
  const ids = baseTargets.map((t) => t.id)
  const { data: signals } = await sb
    .from('intent_signals')
    .select('company_id, source_url, raw_data')
    .in('company_id', ids)
    .eq('signal_type', 'job_posting')
    .order('discovered_at', { ascending: false, nullsFirst: false })
    .limit(2000)

  const sigByCompany = new Map<string, string>()
  for (const s of (signals ?? []) as Array<{
    company_id: string
    source_url: string | null
    raw_data: Record<string, unknown> | null
  }>) {
    if (sigByCompany.has(s.company_id)) continue
    const original = (s.raw_data?.original_url as string | undefined) ?? null
    const url = original && /^https?:/i.test(original)
      ? original
      : (s.source_url && /^https?:/i.test(s.source_url) ? s.source_url : null)
    if (url) sigByCompany.set(s.company_id, url)
  }
  for (const t of baseTargets) {
    t.intent_signal_url = sigByCompany.get(t.id) ?? null
  }
  return baseTargets
}

// ─── main ───────────────────────────────────────────────────
async function main() {
  const opts = parseArgs()
  DEBUG = opts.debug
  console.log('=== 部署直通電話エンリッチメント ===')
  console.log(`モデル: ${MODEL}`)
  console.log(`limit=${opts.limit} priority=${opts.priority} dryRun=${opts.dryRun} concurrency=${opts.concurrency}${opts.fastExit ? ' fastExit=ON' : ''}${opts.debug ? ' debug=true' : ''}`)
  if (opts.company) console.log(`単発実行: ${opts.company}`)

  const targets = await loadTargets(opts)
  console.log(`対象社数: ${targets.length}\n`)

  let totalFound = 0
  let totalProcessed = 0
  const stats: Record<string, number> = {}
  const startedAt = Date.now()

  // ─── 並列ワーカープール (concurrency 同時実行) ───────────────
  let cursor = 0
  async function worker(workerId: number) {
    while (cursor < targets.length) {
      const i = cursor++
      const t = targets[i]
      if (!t) break
      const idx = i + 1
      const tag = `[${idx}/${targets.length}] (w${workerId}) ${t.name}`
      try {
        const { found, depts } = await processCompany(t, opts.dryRun, opts.fastExit)
        totalProcessed++
        if (found > 0) totalFound++
        for (const k of Object.keys(depts)) {
          if (depts[k as keyof DeptPhones]) stats[k] = (stats[k] ?? 0) + 1
        }
        const summary = Object.entries(depts)
          .filter(([, v]) => v)
          .map(([k, v]) => `${k}=${v}`)
          .join(', ')
        console.log(found > 0 ? `${tag} ✓ ${found}件 (${summary})` : `${tag} —`)
      } catch (e) {
        totalProcessed++
        console.log(`${tag} ✗ ${(e as Error).message}`)
      }
    }
  }

  await Promise.all(
    Array.from({ length: Math.max(1, opts.concurrency) }, (_, i) => worker(i + 1)),
  )

  const elapsed = ((Date.now() - startedAt) / 1000).toFixed(1)
  console.log('\n=== 集計 ===')
  console.log(`所要時間: ${elapsed}s (${(targets.length / Number(elapsed)).toFixed(1)}社/秒)`)
  console.log(`部門電話を1つ以上取得できた社数: ${totalFound}/${totalProcessed} (${((totalFound / Math.max(1, totalProcessed)) * 100).toFixed(1)}%)`)
  console.log('部門別 内訳:')
  for (const [k, v] of Object.entries(stats).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${k.padEnd(10)} ${v}件`)
  }
  if (opts.dryRun) console.log('\n⚠️ DRY-RUN のためDBには書き込みませんでした')
}

main().catch((e) => {
  console.error('Fatal:', e)
  process.exit(1)
})
