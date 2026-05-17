'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowUpDown,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Filter,
  List,
  Plus,
  Search,
  Square,
  CheckSquare,
  X,
} from 'lucide-react'
import {
  ObsButton,
  ObsCard,
  ObsChip,
  ObsHero,
  ObsInput,
  ObsPageShell,
} from '@/components/obsidian'
import { SignalBadge, type Signal as FirstPartySignal } from '@/components/crm/SignalBadge'
import { getCompanyFirstPartySignal } from '@/lib/mock-data/firstPartySignals'

type Signal = 'Hot' | 'Middle' | 'Low' | 'None'
type IntentLevel = 'hot' | 'middle' | 'low'
type DepartmentType =
  | 'SALES'
  | 'MARKETING'
  | 'ENGINEERING'
  | 'IT'
  | 'HR'
  | 'FINANCE'
  | 'LEGAL'
  | 'OPERATIONS'
  | 'MANAGEMENT'
  | 'RD'
  | 'CS'
  | 'OTHER'
const DEPT_LABEL: Record<DepartmentType, string> = {
  HR: '人事',
  SALES: '営業',
  MARKETING: 'マーケ',
  ENGINEERING: 'エンジニア',
  IT: 'IT',
  FINANCE: '経理/財務',
  LEGAL: '法務',
  OPERATIONS: '運用',
  MANAGEMENT: '経営',
  RD: '研究開発',
  CS: 'CS',
  OTHER: 'その他',
}

const DEPT_CHOICES: { key: DepartmentType; label: string }[] = [
  { key: 'HR', label: '人事' },
  { key: 'SALES', label: '営業' },
  { key: 'MARKETING', label: 'マーケ' },
  { key: 'ENGINEERING', label: 'エンジニア' },
  { key: 'IT', label: 'IT' },
  { key: 'MANAGEMENT', label: '経営' },
  { key: 'RD', label: '研究開発' },
  { key: 'OTHER', label: 'その他' },
]

interface IntentEntry {
  departmentType: DepartmentType
  intentLevel: 'HOT' | 'MIDDLE' | 'LOW' | 'NONE'
  latestSignalAt: string | null
  signalCount: number
}

interface CompanyRow {
  id: string
  name: string
  domain: string
  industry: string
  prefecture: string
  city: string | null
  employeeCount: string | null
  revenue: string | null
  representative: string | null
  corporateType: string
  corporateNumber: string
  officeCount: number
  serviceTags: string[]
  intents: IntentEntry[]
  enrichmentStatus: string  // 'COMPLETED' | 'PENDING' | etc
}

interface ApiResponse {
  data: Array<{
    id: string
    corporateNumber: string
    name: string
    nameKana: string | null
    websiteUrl: string | null
    prefecture: string
    city: string | null
    address: string | null
    corporateType: string
    employeeCount: string | null
    revenue: string | null
    representative: string | null
    representativePhone: string | null
    representativeEmail: string | null
    serviceSummary: string | null
    enrichmentStatus: string
    lastCrawledAt: string | null
    lastEnrichedAt: string | null
    industry: { id: string; name: string } | null
    serviceTags: Array<{ tag: { id: string; name: string } }>
    _count: { offices: number; departments: number; intentSignals: number }
    companyIntents: Array<{
      departmentType: DepartmentType
      intentLevel: 'HOT' | 'MIDDLE' | 'LOW' | 'NONE'
      latestSignalAt: string | null
      signalCount: number
    }>
  }>
  total: number
}

const PAGE_SIZE = 100

// 従業員数レンジ
const EMP_BUCKETS = [
  { key: '1-50', label: '〜50名', min: 1, max: 50 },
  { key: '51-100', label: '51〜100名', min: 51, max: 100 },
  { key: '101-300', label: '101〜300名', min: 101, max: 300 },
  { key: '301-1000', label: '301〜1,000名', min: 301, max: 1000 },
  { key: '1001-5000', label: '1,001〜5,000名', min: 1001, max: 5000 },
  { key: '5001+', label: '5,001名以上', min: 5001, max: Infinity },
] as const
type EmpBucketKey = (typeof EMP_BUCKETS)[number]['key'] | 'all'

function parseEmployeeCount(raw: string | null): number | null {
  if (!raw) return null
  const m = raw.replace(/,/g, '').match(/\d+/)
  return m ? parseInt(m[0], 10) : null
}

function bucketOfEmployee(n: number | null): Exclude<EmpBucketKey, 'all'> | null {
  if (n === null) return null
  for (const b of EMP_BUCKETS) {
    if (n >= b.min && n <= b.max) return b.key
  }
  return null
}

// 売上フィルタ（単位: 億円） — 各バケットは閾値フィルタ。
// 「以下」「以上」のため範囲は重なる（500億の会社は「10億以上」「100億以上」両方にマッチ）。
const REV_BUCKETS = [
  { key: 'lte-1b', label: '1億以下', min: 0, max: 1 },
  { key: 'gte-10b', label: '10億以上', min: 10, max: Infinity },
  { key: 'gte-100b', label: '100億以上', min: 100, max: Infinity },
  { key: 'gte-1000b', label: '1,000億以上', min: 1000, max: Infinity },
] as const
type RevBucketKey = (typeof REV_BUCKETS)[number]['key'] | 'all'

// "約1,000億円" / "1兆円" → 億円単位の数値
function parseRevenueOku(raw: string | null): number | null {
  if (!raw) return null
  const s = raw.replace(/[約,\s]/g, '')
  const choM = s.match(/(\d+(?:\.\d+)?)兆/)
  const okuM = s.match(/(\d+(?:\.\d+)?)億/)
  let oku = 0
  if (choM) oku += parseFloat(choM[1]) * 10000
  if (okuM) oku += parseFloat(okuM[1])
  return oku > 0 ? oku : null
}

// 1社の売上が、選択された売上フィルタのいずれかにマッチするかを判定。
// 「1億以下」「10億以上」など重なるバケットを許容するため、配列に対する some() で評価。
function revenueMatchesAnyBucket(
  oku: number | null,
  keys: ReadonlyArray<Exclude<RevBucketKey, 'all'>>,
): boolean {
  if (oku === null || keys.length === 0) return false
  return keys.some((k) => {
    const b = REV_BUCKETS.find((x) => x.key === k)
    if (!b) return false
    return oku >= b.min && oku <= b.max
  })
}

// 拠点数レンジ
const OFFICE_BUCKETS = [
  { key: '1', label: '1拠点', min: 1, max: 1 },
  { key: '2-10', label: '2〜10拠点', min: 2, max: 10 },
  { key: '11+', label: '11拠点以上', min: 11, max: Infinity },
] as const
type OfficeBucketKey = (typeof OFFICE_BUCKETS)[number]['key'] | 'all'

function bucketOfOffice(n: number): Exclude<OfficeBucketKey, 'all'> | null {
  if (n <= 0) return null
  for (const b of OFFICE_BUCKETS) {
    if (n >= b.min && n <= b.max) return b.key
  }
  return null
}

// "約3,000名" 形式に統一
function formatEmployeeCount(raw: string | null): string {
  if (!raw) return '—'
  const n = parseEmployeeCount(raw)
  if (n === null) return raw
  return `約${n.toLocaleString()}名`
}

// "約1,000億円" 形式に統一（数値が取れなければ先頭に約を付けるだけ）
function formatRevenue(raw: string | null): string {
  if (!raw) return '—'
  const trimmed = raw.trim()
  if (trimmed.startsWith('約')) return trimmed
  return `約${trimmed}`
}

function mapSignal(level: string | undefined): Signal {
  if (level === 'HOT') return 'Hot'
  if (level === 'MIDDLE') return 'Middle'
  if (level === 'LOW') return 'Low'
  return 'None'
}

const INTENT_PRIORITY: Record<string, number> = { HOT: 4, MIDDLE: 3, LOW: 2, NONE: 1 }

type SortKey = 'name' | 'intent' | 'employee' | 'revenue' | 'office'
type SortDir = 'asc' | 'desc'

// 配列 state のトグル: すでに入ってれば外し、なければ追加する
function toggleInArray<T>(arr: T[], v: T): T[] {
  return arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]
}

// (旧 levelByAge は サーバ提供の intentLevel を信頼する方式に切替えたため削除)

// レベル見た目トークン
const LEVEL_STYLE: Record<
  Signal,
  { label: string; color: string; bg: string; border: string }
> = {
  Hot: {
    label: 'HOT',
    color: 'var(--color-obs-hot)',
    bg: 'rgba(255,107,107,0.14)',
    border: 'rgba(255,107,107,0.40)',
  },
  Middle: {
    label: 'MID',
    color: '#4ad98a',
    bg: 'rgba(74,217,138,0.14)',
    border: 'rgba(74,217,138,0.40)',
  },
  Low: {
    label: 'LOW',
    color: 'var(--color-obs-low)',
    bg: 'rgba(126,198,255,0.14)',
    border: 'rgba(126,198,255,0.40)',
  },
  None: {
    label: '—',
    color: 'var(--color-obs-text-subtle)',
    bg: 'transparent',
    border: 'transparent',
  },
}

interface DeptBreakdown {
  departmentType: DepartmentType
  level: Signal
  latestAt: string | null
  signalCount: number
}

interface ComputedIntent {
  level: Signal
  latestAt: string | null
  signalCount: number
  activeDepts: DepartmentType[]
  breakdown: DeptBreakdown[]
}

// サーバ提供の intentLevel ('HOT' / 'MIDDLE' / 'LOW' / 'NONE') を Signal 型へ変換。
// クライアント側で Date.now() ベースに再計算するとブラウザ時刻のズレで全社 None になる
// バグが発生するため、サーバの権威的な分類を信頼する。
function serverLevelToSignal(level: 'HOT' | 'MIDDLE' | 'LOW' | 'NONE' | string): Signal {
  if (level === 'HOT') return 'Hot'
  if (level === 'MIDDLE') return 'Middle'
  if (level === 'LOW') return 'Low'
  return 'None'
}

// 部門フィルタに応じて行のインテントを算出（サーバ分類を採用）
// deptFilter が空配列なら全部門対象
function computeIntent(intents: IntentEntry[], deptFilter: DepartmentType[]): ComputedIntent {
  const pool =
    deptFilter.length === 0 ? intents : intents.filter((i) => deptFilter.includes(i.departmentType))

  // 同じ departmentType (IT など) が複数回現れる可能性があるためマージ
  // (API 側で 25 細分 → トップレベル 'IT' / 'SALES' 等に集約しているため)
  const merged = new Map<DepartmentType, DeptBreakdown>()
  for (const p of pool) {
    const lvl = serverLevelToSignal(p.intentLevel)
    const existing = merged.get(p.departmentType)
    if (!existing) {
      merged.set(p.departmentType, {
        departmentType: p.departmentType,
        level: lvl,
        latestAt: p.latestSignalAt,
        signalCount: p.signalCount ?? 0,
      })
    } else {
      const curPriority = INTENT_PRIORITY[levelKey(existing.level)] ?? 0
      const newPriority = INTENT_PRIORITY[levelKey(lvl)] ?? 0
      if (newPriority > curPriority) existing.level = lvl
      if (p.latestSignalAt && (!existing.latestAt || p.latestSignalAt > existing.latestAt)) {
        existing.latestAt = p.latestSignalAt
      }
      existing.signalCount += p.signalCount ?? 0
    }
  }

  // 部門別ブレイクダウン（新しい順）
  const breakdown: DeptBreakdown[] = Array.from(merged.values())
    .sort((a, b) => {
      const ap = INTENT_PRIORITY[levelKey(a.level)] ?? 0
      const bp = INTENT_PRIORITY[levelKey(b.level)] ?? 0
      if (ap !== bp) return bp - ap
      const at = a.latestAt ? new Date(a.latestAt).getTime() : 0
      const bt = b.latestAt ? new Date(b.latestAt).getTime() : 0
      return bt - at
    })
  let topLevel: Signal = 'None'
  let latestAt: string | null = null
  let signalCount = 0
  for (const b of breakdown) {
    if ((INTENT_PRIORITY[levelKey(b.level)] ?? 0) > (INTENT_PRIORITY[levelKey(topLevel)] ?? 0)) {
      topLevel = b.level
    }
    signalCount += b.signalCount
    if (b.latestAt && (!latestAt || new Date(b.latestAt) > new Date(latestAt))) {
      latestAt = b.latestAt
    }
  }
  return {
    level: topLevel,
    latestAt,
    signalCount,
    activeDepts: breakdown.filter((b) => b.level !== 'None').map((b) => b.departmentType),
    breakdown,
  }
}

function extractDomain(url: string | null): string {
  if (!url) return ''
  try {
    const u = new URL(url.startsWith('http') ? url : `https://${url}`)
    return u.hostname.replace(/^www\./, '')
  } catch {
    return url
  }
}

function formatRelative(iso: string | null): string {
  if (!iso) return '—'
  const d = new Date(iso)
  const diff = Date.now() - d.getTime()
  const day = 24 * 60 * 60 * 1000
  if (diff < day) return '今日'
  if (diff < 7 * day) return `${Math.floor(diff / day)}日前`
  if (diff < 30 * day) return `${Math.floor(diff / (7 * day))}週間前`
  if (diff < 365 * day) return `${Math.floor(diff / (30 * day))}ヶ月前`
  return `${Math.floor(diff / (365 * day))}年前`
}

function getInitial(name: string): string {
  const clean = name.replace(/^(株式会社|有限会社|合同会社|合資会社|合名会社|一般社団法人|一般財団法人)/, '').trim()
  if (/^[\x00-\x7F]+$/.test(clean)) {
    const parts = clean.split(/\s+/).slice(0, 2)
    return parts.map((p) => p[0]?.toUpperCase() ?? '').join('')
  }
  return clean.slice(0, 1)
}

function getAvatarColor(name: string): string {
  let h = 0
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0
  const hue = h % 360
  return `hsl(${hue}, 35%, 22%)`
}

// グリッドテンプレート — チェックボックス / 企業 / 求人インテント / 1stシグナル / 都道府県 / 業種 / 従業員数 / 売上 / 拠点
// 求人インテントは「HOT 3部門」程度のチップで十分なため 130px に絞り、隣の 1st シグナルとの距離を縮める
// 都道府県・業種は固定幅にして従業員数の左に寄せる（余ったスペースは企業列が吸収）
const GRID_TEMPLATE =
  'grid-cols-[28px_minmax(280px,2fr)_130px_140px_88px_140px_112px_128px_72px]'

export default function CompaniesPage() {
  const router = useRouter()
  const [rows, setRows] = useState<CompanyRow[]>([])
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [query, setQuery] = useState('')
  // 表示モード: 'enriched' = エンリッチ済 6,967社 (デフォルト) / 'all' = 290万社全件
  const [scopeMode, setScopeMode] = useState<'enriched' | 'all'>('enriched')
  const [sort, setSort] = useState<{ key: SortKey; dir: SortDir }>({ key: 'intent', dir: 'desc' })
  const toggleSort = (key: SortKey) =>
    setSort((s) => (s.key === key ? { key, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'desc' }))
  // 企業追加モーダル
  const [addOpen, setAddOpen] = useState(false)
  // 企業選択 (将来の一括操作用に残置)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  // 複数選択可能なインテントフィルタ。デフォルトは HOT のみ。空配列 = 全件表示。
  const [intentFilter, setIntentFilter] = useState<IntentLevel[]>(['hot'])
  const toggleIntent = (lvl: IntentLevel) =>
    setIntentFilter((prev) => (prev.includes(lvl) ? prev.filter((x) => x !== lvl) : [...prev, lvl]))
  // 以下のフィルタは「選択された値のリスト」。空配列=指定なし（全件）。
  const [deptFilter, setDeptFilter] = useState<DepartmentType[]>([])
  const [industryFilter, setIndustryFilter] = useState<string[]>([])
  const [prefectureFilter, setPrefectureFilter] = useState<string[]>([])
  const [empFilter, setEmpFilter] = useState<Exclude<EmpBucketKey, 'all'>[]>([])
  const [revFilter, setRevFilter] = useState<Exclude<RevBucketKey, 'all'>[]>([])
  const [officeFilter, setOfficeFilter] = useState<Exclude<OfficeBucketKey, 'all'>[]>([])
  // 1stパーティーシグナル絞り込み: 'hot' / 'middle' / 'low' / 'none'(シグナルなし)
  const [signalFilter, setSignalFilter] = useState<Array<'hot' | 'middle' | 'low' | 'none'>>([])
  const [openMenu, setOpenMenu] = useState<
    'industry' | 'prefecture' | 'employee' | 'department' | 'revenue' | 'office' | 'signal' | null
  >(null)
  const [page, setPage] = useState(1)
  const menuRef = useRef<HTMLDivElement | null>(null)
  const searchRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    let cancelled = false
    setIsLoading(true)
    ;(async () => {
      try {
        // エンリッチ済モード: onlyEnriched=true (デフォルト) / 全件モード: onlyEnriched=false
        const onlyEnriched = scopeMode === 'enriched'
        const res = await fetch(`/api/abm-companies?take=5000&onlyEnriched=${onlyEnriched}`)
        if (!res.ok) {
          if (!cancelled) setIsLoading(false)
          return
        }
        const json = (await res.json()) as ApiResponse
        if (cancelled) return
        const mapped: CompanyRow[] = json.data.map((c) => ({
          id: c.id,
          name: c.name,
          domain: extractDomain(c.websiteUrl),
          industry: c.industry?.name ?? 'その他',
          prefecture: c.prefecture || '—',
          city: c.city,
          employeeCount: c.employeeCount,
          revenue: c.revenue,
          representative: c.representative,
          corporateType: c.corporateType,
          corporateNumber: c.corporateNumber,
          officeCount: c._count?.offices ?? 0,
          serviceTags: c.serviceTags.map((t) => t.tag.name),
          intents: c.companyIntents,
          enrichmentStatus: c.enrichmentStatus,
        }))
        setRows(mapped)
        setTotal(json.total)
        setIsLoading(false)
      } catch {
        if (!cancelled) setIsLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [scopeMode])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        searchRef.current?.focus()
      }
      if (e.key === 'Escape') setOpenMenu(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!menuRef.current) return
      if (!menuRef.current.contains(e.target as Node)) setOpenMenu(null)
    }
    if (openMenu) window.addEventListener('mousedown', onClick)
    return () => window.removeEventListener('mousedown', onClick)
  }, [openMenu])

  // 選択部門でインテント集計した仮想行（計算結果をキャッシュ）
  const resolvedRows = useMemo(
    () =>
      rows.map((r) => {
        const intent = computeIntent(r.intents, deptFilter)
        return { row: r, intent }
      }),
    [rows, deptFilter],
  )

  const intentCounts = useMemo(() => {
    const c = { Hot: 0, Middle: 0, Low: 0 }
    for (const { intent } of resolvedRows) {
      if (intent.level === 'Hot') c.Hot++
      else if (intent.level === 'Middle') c.Middle++
      else if (intent.level === 'Low') c.Low++
    }
    return c
  }, [resolvedRows])

  const industries = useMemo(() => {
    const s = new Set<string>()
    for (const r of rows) s.add(r.industry)
    return Array.from(s).sort((a, b) => a.localeCompare(b, 'ja'))
  }, [rows])

  // 47都道府県を地域順に並べる(関東→関西→東海→北海道東北→北陸甲信越→中国→四国→九州沖縄)
  const prefectures = useMemo(() => {
    return [
      // 関東
      '東京都', '神奈川県', '埼玉県', '千葉県', '茨城県', '栃木県', '群馬県',
      // 関西(近畿)
      '大阪府', '京都府', '兵庫県', '奈良県', '滋賀県', '和歌山県',
      // 東海(名古屋エリア)
      '愛知県', '静岡県', '岐阜県', '三重県',
      // 北海道・東北
      '北海道', '宮城県', '福島県', '青森県', '岩手県', '秋田県', '山形県',
      // 北陸・甲信越
      '新潟県', '長野県', '石川県', '富山県', '福井県', '山梨県',
      // 中国
      '広島県', '岡山県', '山口県', '島根県', '鳥取県',
      // 四国
      '香川県', '愛媛県', '徳島県', '高知県',
      // 九州・沖縄
      '福岡県', '熊本県', '鹿児島県', '長崎県', '大分県', '宮崎県', '佐賀県', '沖縄県',
    ]
  }, [])

  const filtered = useMemo(() => {
    let list = resolvedRows
    if (intentFilter.length > 0) {
      // 複数選択時は OR 条件 (HOT も MID もどちらかにマッチで通す)
      const targetLevels = new Set<Signal>(
        intentFilter.map((f) => (f === 'hot' ? 'Hot' : f === 'middle' ? 'Middle' : 'Low')),
      )
      list = list.filter(({ intent }) => targetLevels.has(intent.level))
    }
    if (industryFilter.length > 0)
      list = list.filter(({ row }) => industryFilter.includes(row.industry))
    if (prefectureFilter.length > 0)
      list = list.filter(({ row }) => prefectureFilter.includes(row.prefecture))
    if (empFilter.length > 0) {
      list = list.filter(({ row }) => {
        const b = bucketOfEmployee(parseEmployeeCount(row.employeeCount))
        return b !== null && empFilter.includes(b)
      })
    }
    if (revFilter.length > 0) {
      list = list.filter(({ row }) =>
        revenueMatchesAnyBucket(parseRevenueOku(row.revenue), revFilter),
      )
    }
    if (officeFilter.length > 0) {
      list = list.filter(({ row }) => {
        const b = bucketOfOffice(row.officeCount)
        return b !== null && officeFilter.includes(b)
      })
    }
    if (signalFilter.length > 0) {
      // 1st パーティーシグナル：行のシグナル(または無し)が選択集合に含まれるかで絞り込む
      list = list.filter(({ row }) => {
        const sig = getCompanyFirstPartySignal(row.name)
        const key: 'hot' | 'middle' | 'low' | 'none' =
          sig === 'Hot' ? 'hot' : sig === 'Middle' ? 'middle' : sig === 'Low' ? 'low' : 'none'
        return signalFilter.includes(key)
      })
    }
    if (query.trim()) {
      const q = query.trim().toLowerCase()
      list = list.filter(
        ({ row }) =>
          row.name.toLowerCase().includes(q) ||
          row.domain.toLowerCase().includes(q) ||
          row.industry.toLowerCase().includes(q) ||
          row.prefecture.toLowerCase().includes(q) ||
          (row.city ?? '').toLowerCase().includes(q),
      )
    }
    const mult = sort.dir === 'asc' ? 1 : -1
    const cmpNullable = (an: number | null, bn: number | null) => {
      if (an === null && bn === null) return 0
      if (an === null) return 1 // null は常に末尾
      if (bn === null) return -1
      return (an - bn) * mult
    }
    list = [...list].sort((a, b) => {
      switch (sort.key) {
        case 'name':
          return a.row.name.localeCompare(b.row.name, 'ja') * mult
        case 'employee':
          return cmpNullable(
            parseEmployeeCount(a.row.employeeCount),
            parseEmployeeCount(b.row.employeeCount),
          )
        case 'revenue':
          return cmpNullable(parseRevenueOku(a.row.revenue), parseRevenueOku(b.row.revenue))
        case 'office':
          return (a.row.officeCount - b.row.officeCount) * mult
        case 'intent':
        default: {
          const ap = INTENT_PRIORITY[levelKey(a.intent.level)] ?? 0
          const bp = INTENT_PRIORITY[levelKey(b.intent.level)] ?? 0
          if (ap !== bp) return (ap - bp) * mult
          if (a.intent.signalCount !== b.intent.signalCount)
            return (a.intent.signalCount - b.intent.signalCount) * mult
          return a.row.name.localeCompare(b.row.name, 'ja')
        }
      }
    })
    return list
  }, [
    resolvedRows,
    query,
    sort,
    intentFilter,
    industryFilter,
    prefectureFilter,
    empFilter,
    revFilter,
    officeFilter,
    signalFilter,
  ])

  const hasActiveFilter =
    intentFilter.length > 0 ||
    deptFilter.length > 0 ||
    industryFilter.length > 0 ||
    prefectureFilter.length > 0 ||
    empFilter.length > 0 ||
    revFilter.length > 0 ||
    officeFilter.length > 0 ||
    signalFilter.length > 0 ||
    query.trim() !== ''
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  useEffect(
    () => setPage(1),
    [
      query,
      sort,
      intentFilter,
      deptFilter,
      industryFilter,
      prefectureFilter,
      empFilter,
      revFilter,
      officeFilter,
      signalFilter,
    ],
  )
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const clearFilters = () => {
    setIntentFilter([])
    setDeptFilter([])
    setIndustryFilter([])
    setPrefectureFilter([])
    setEmpFilter([])
    setRevFilter([])
    setOfficeFilter([])
    setSignalFilter([])
    setQuery('')
  }

  // 1stシグナルの選択肢
  const SIGNAL_CHOICES: Array<{ key: 'hot' | 'middle' | 'low' | 'none'; label: string }> = [
    { key: 'hot',    label: '強' },
    { key: 'middle', label: '中' },
    { key: 'low',    label: '弱' },
    { key: 'none',   label: 'シグナルなし' },
  ]
  const signalSelectedLabels: string[] = signalFilter.flatMap((k) => {
    const found = SIGNAL_CHOICES.find((c) => c.key === k)
    return found ? [found.label] : []
  })

  // トリガーボタンのラベル: 選択なしは baseLabel / 1件は label / 2件以上は "先頭 +N"
  function summarizeSelection(selectedLabels: string[], baseLabel: string): string {
    if (selectedLabels.length === 0) return baseLabel
    const first = selectedLabels[0] ?? baseLabel
    if (selectedLabels.length === 1) return first
    return `${first} +${selectedLabels.length - 1}`
  }

  const deptTriggerLabel = summarizeSelection(
    deptFilter.map((d) => DEPT_LABEL[d] ?? String(d)),
    '全部門',
  )
  const empSelectedLabels: string[] = empFilter.flatMap((k) => {
    const found = EMP_BUCKETS.find((b) => b.key === k)
    return found ? [found.label] : []
  })
  const revSelectedLabels: string[] = revFilter.flatMap((k) => {
    const found = REV_BUCKETS.find((b) => b.key === k)
    return found ? [found.label] : []
  })
  const officeSelectedLabels: string[] = officeFilter.flatMap((k) => {
    const found = OFFICE_BUCKETS.find((b) => b.key === k)
    return found ? [found.label] : []
  })

  return (
    <ObsPageShell>
      <div className="w-full px-8 xl:px-12 2xl:px-16 pb-16">
        <ObsHero
          eyebrow="Company Master"
          title="290万社DB"
          caption={
            scopeMode === 'enriched' ? (
              <>
                エンリッチ済 {total.toLocaleString()} 社 ／ 対象条件: 従業員30人以上
                <br />
                取得項目: 求人インテント(25部門) ・ 業種 ・ 売上 ・ 拠点
              </>
            ) : (
              <>
                登記台帳 290万社全件 ／ 対象条件: 国税庁法人番号DB + 経産省 gBizINFO
                <br />
                取得項目: 社名 ・ 所在地 ・ 法人番号 ・ 設立日 ・ 資本金。リッチデータが必要な企業はカード右の「エンリッチ予約」で取り込み
              </>
            )
          }
          action={
            <div className="flex items-center gap-3">
              {/* 表示スコープ トグル */}
              <div
                className="inline-flex items-center rounded-full p-0.5 fo-glass-rim"
                style={{
                  backgroundColor: 'rgba(36,36,38,0.6)',
                  backdropFilter: 'blur(8px)',
                }}
              >
                <button
                  type="button"
                  onClick={() => setScopeMode('enriched')}
                  className="px-3 h-7 rounded-full text-[11.5px] font-semibold transition-all"
                  style={{
                    background: scopeMode === 'enriched' ? 'var(--color-obs-primary-container)' : 'transparent',
                    color: scopeMode === 'enriched' ? 'var(--color-obs-on-primary)' : 'var(--color-obs-text-muted)',
                  }}
                >
                  エンリッチ済
                </button>
                <button
                  type="button"
                  onClick={() => setScopeMode('all')}
                  className="px-3 h-7 rounded-full text-[11.5px] font-semibold transition-all"
                  style={{
                    background: scopeMode === 'all' ? 'var(--color-obs-primary-container)' : 'transparent',
                    color: scopeMode === 'all' ? 'var(--color-obs-on-primary)' : 'var(--color-obs-text-muted)',
                  }}
                  title="290万社の登記台帳全件 (未エンリッチ含む)"
                >
                  290万社全件
                </button>
              </div>
              <div
                className="inline-flex items-center gap-1.5 px-2 py-1.5 rounded-full fo-glass-rim"
                style={{
                  backgroundColor: 'rgba(36,36,38,0.6)',
                  backdropFilter: 'blur(8px)',
                }}
                title="クリックでインテント別に絞り込み"
              >
                <Filter
                  size={11}
                  strokeWidth={2.2}
                  style={{ color: 'var(--color-obs-text-subtle)' }}
                  className="ml-1"
                />
                <IntentFilterChip
                  active={intentFilter.includes('hot')}
                  tone="hot"
                  label="HOT"
                  count={intentCounts.Hot}
                  onClick={() => toggleIntent('hot')}
                />
                <IntentFilterChip
                  active={intentFilter.includes('middle')}
                  tone="middle"
                  label="MID"
                  count={intentCounts.Middle}
                  onClick={() => toggleIntent('middle')}
                />
                <IntentFilterChip
                  active={intentFilter.includes('low')}
                  tone="low"
                  label="LOW"
                  count={intentCounts.Low}
                  onClick={() => toggleIntent('low')}
                />
                {intentFilter.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setIntentFilter([])}
                    className="inline-flex items-center justify-center w-5 h-5 rounded-full transition-colors hover:bg-[var(--color-obs-surface-highest)]"
                    title="フィルタをクリア(全件表示)"
                    style={{ color: 'var(--color-obs-text-muted)' }}
                  >
                    <X size={10} strokeWidth={2.4} />
                  </button>
                )}
              </div>
              <ObsButton variant="primary" size="md" onClick={() => setAddOpen(true)}>
                <Plus size={14} className="mr-1.5 inline" strokeWidth={2.5} />
                企業を追加
              </ObsButton>
            </div>
          }
        />

        {/* ── Toolbar ── */}
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <div className="relative flex-1 min-w-[260px] max-w-md">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: 'var(--color-obs-text-subtle)' }}
            />
            <ObsInput
              ref={searchRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="企業名・ドメイン・業種・地域・タグで検索..."
              className="pl-10 pr-16"
            />
            <span
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono px-1.5 py-0.5 rounded hidden sm:inline-block pointer-events-none fo-glass-rim"
              style={{
                color: 'var(--color-obs-text-subtle)',
                backgroundColor: 'rgba(36,36,38,0.6)',
                backdropFilter: 'blur(6px)',
              }}
            >
              ⌘K
            </span>
          </div>

          <div className="relative" ref={menuRef}>
            <div className="flex items-center gap-2 flex-wrap">
              <FilterTrigger
                icon="intent"
                active={deptFilter.length > 0}
                label={`求人インテント: ${deptTriggerLabel}`}
                count={deptFilter.length}
                onClick={() => setOpenMenu((m) => (m === 'department' ? null : 'department'))}
              />
              <FilterTrigger
                active={signalFilter.length > 0}
                label={summarizeSelection(signalSelectedLabels, '1st シグナル')}
                count={signalFilter.length}
                onClick={() => setOpenMenu((m) => (m === 'signal' ? null : 'signal'))}
              />
              <FilterTrigger
                active={industryFilter.length > 0}
                label={summarizeSelection(industryFilter, '業種')}
                count={industryFilter.length}
                onClick={() => setOpenMenu((m) => (m === 'industry' ? null : 'industry'))}
              />
              <FilterTrigger
                active={prefectureFilter.length > 0}
                label={summarizeSelection(prefectureFilter, '都道府県')}
                count={prefectureFilter.length}
                onClick={() => setOpenMenu((m) => (m === 'prefecture' ? null : 'prefecture'))}
              />
              <FilterTrigger
                active={empFilter.length > 0}
                label={summarizeSelection(empSelectedLabels, '従業員数')}
                count={empFilter.length}
                onClick={() => setOpenMenu((m) => (m === 'employee' ? null : 'employee'))}
              />
              <FilterTrigger
                active={revFilter.length > 0}
                label={summarizeSelection(revSelectedLabels, '売上')}
                count={revFilter.length}
                onClick={() => setOpenMenu((m) => (m === 'revenue' ? null : 'revenue'))}
              />
              <FilterTrigger
                active={officeFilter.length > 0}
                label={summarizeSelection(officeSelectedLabels, '拠点数')}
                count={officeFilter.length}
                onClick={() => setOpenMenu((m) => (m === 'office' ? null : 'office'))}
              />
            </div>

            {openMenu === 'department' && (
              <MultiSelectDropdown
                items={DEPT_CHOICES.map((d) => ({ key: d.key, label: d.label }))}
                selected={deptFilter}
                onToggle={(key) => setDeptFilter((arr) => toggleInArray(arr, key))}
                onClear={() => setDeptFilter([])}
                allLabel="全部門"
              />
            )}
            {openMenu === 'industry' && (
              <MultiSelectDropdown
                items={industries.map((name) => ({ key: name, label: name }))}
                selected={industryFilter}
                onToggle={(key) => setIndustryFilter((arr) => toggleInArray(arr, key))}
                onClear={() => setIndustryFilter([])}
                allLabel="すべての業種"
              />
            )}
            {openMenu === 'prefecture' && (
              <MultiSelectDropdown
                items={prefectures.map((name) => ({ key: name, label: name }))}
                selected={prefectureFilter}
                onToggle={(key) => setPrefectureFilter((arr) => toggleInArray(arr, key))}
                onClear={() => setPrefectureFilter([])}
                allLabel="すべての都道府県"
              />
            )}
            {openMenu === 'employee' && (
              <MultiSelectDropdown
                items={EMP_BUCKETS.map((b) => ({ key: b.key, label: b.label }))}
                selected={empFilter}
                onToggle={(key) => setEmpFilter((arr) => toggleInArray(arr, key))}
                onClear={() => setEmpFilter([])}
                allLabel="すべての規模"
              />
            )}
            {openMenu === 'revenue' && (
              <MultiSelectDropdown
                items={REV_BUCKETS.map((b) => ({ key: b.key, label: b.label }))}
                selected={revFilter}
                onToggle={(key) => setRevFilter((arr) => toggleInArray(arr, key))}
                onClear={() => setRevFilter([])}
                allLabel="すべての売上"
              />
            )}
            {openMenu === 'office' && (
              <MultiSelectDropdown
                items={OFFICE_BUCKETS.map((b) => ({ key: b.key, label: b.label }))}
                selected={officeFilter}
                onToggle={(key) => setOfficeFilter((arr) => toggleInArray(arr, key))}
                onClear={() => setOfficeFilter([])}
                allLabel="すべての拠点数"
              />
            )}
            {openMenu === 'signal' && (
              <MultiSelectDropdown
                items={SIGNAL_CHOICES}
                selected={signalFilter}
                onToggle={(key) => setSignalFilter((arr) => toggleInArray(arr, key))}
                onClear={() => setSignalFilter([])}
                allLabel="すべての1stシグナル"
              />
            )}
          </div>

          {hasActiveFilter && (
            <button
              onClick={clearFilters}
              className="inline-flex items-center gap-1.5 h-8 px-3 rounded-[var(--radius-obs-md)] text-xs font-medium transition-colors"
              style={{ color: 'var(--color-obs-text-muted)' }}
              onMouseOver={(e) => {
                ;(e.currentTarget as HTMLButtonElement).style.backgroundColor =
                  'var(--color-obs-surface-high)'
              }}
              onMouseOut={(e) => {
                ;(e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent'
              }}
            >
              <X size={13} />
              クリア
            </button>
          )}
        </div>

        {!isLoading && (
          <div className="mb-3 flex items-center gap-3 text-[12px] flex-wrap" style={{ color: 'var(--color-obs-text-subtle)' }}>
            {/* 一括選択アクション（左端に固定） */}
            <div className="flex items-center gap-2">
              {selected.size > 0 && (
                <button
                  type="button"
                  onClick={() => setSelected(new Set())}
                  className="inline-flex items-center gap-1 px-2 h-6 rounded-full text-[11px] font-semibold tabular-nums transition-colors"
                  style={{
                    background: 'rgba(171,199,255,0.14)',
                    color: 'var(--color-obs-primary)',
                    boxShadow: 'inset 0 0 0 1px rgba(171,199,255,0.42)',
                  }}
                  onMouseOver={(e) => {
                    ;(e.currentTarget as HTMLButtonElement).style.background =
                      'rgba(171,199,255,0.22)'
                    ;(e.currentTarget as HTMLButtonElement).style.boxShadow =
                      'inset 0 0 0 1px rgba(171,199,255,0.55)'
                  }}
                  onMouseOut={(e) => {
                    ;(e.currentTarget as HTMLButtonElement).style.background =
                      'rgba(171,199,255,0.14)'
                    ;(e.currentTarget as HTMLButtonElement).style.boxShadow =
                      'inset 0 0 0 1px rgba(171,199,255,0.42)'
                  }}
                  title="クリックで選択をすべて解除"
                >
                  <CheckSquare size={11} strokeWidth={2.4} />
                  <span>{selected.size.toLocaleString()}社選択中</span>
                </button>
              )}
              {/* 全選択（既に全件選択済みなら非表示） */}
              {selected.size < filtered.length && (
                <button
                  type="button"
                  onClick={() => setSelected(new Set(filtered.map((p) => p.row.id)))}
                  className="inline-flex items-center gap-1 px-2.5 h-6 rounded-full text-[11px] font-medium transition-colors"
                  style={{
                    color: 'var(--color-obs-text-muted)',
                    background: 'transparent',
                    boxShadow: 'inset 0 0 0 1px rgba(109,106,111,0.22)',
                  }}
                  onMouseOver={(e) => {
                    ;(e.currentTarget as HTMLButtonElement).style.background =
                      'var(--color-obs-surface-high)'
                    ;(e.currentTarget as HTMLButtonElement).style.color =
                      'var(--color-obs-text)'
                  }}
                  onMouseOut={(e) => {
                    ;(e.currentTarget as HTMLButtonElement).style.background = 'transparent'
                    ;(e.currentTarget as HTMLButtonElement).style.color =
                      'var(--color-obs-text-muted)'
                  }}
                  title={`絞り込み結果 ${filtered.length.toLocaleString()}社をすべて選択`}
                >
                  {selected.size > 0 ? (
                    <CheckSquare size={11} strokeWidth={2.2} />
                  ) : (
                    <Square size={11} strokeWidth={2.2} />
                  )}
                  {selected.size > 0
                    ? `残り${(filtered.length - selected.size).toLocaleString()}社も選択`
                    : `${filtered.length.toLocaleString()}社すべて選択`}
                </button>
              )}
            </div>

            {/* 件数（全選択ボタンの右側に表示） */}
            <span>
              {hasActiveFilter ? (
                <>
                  <span style={{ color: 'var(--color-obs-text)' }} className="font-medium tabular-nums">
                    {filtered.length.toLocaleString()}
                  </span>
                  件 <span className="opacity-60">/ 全{rows.length.toLocaleString()}件</span>
                </>
              ) : (
                <>
                  <span style={{ color: 'var(--color-obs-text)' }} className="font-medium tabular-nums">
                    {rows.length.toLocaleString()}
                  </span>
                  件を表示中
                </>
              )}
            </span>

            <span className="opacity-60">
              ・インテント=求人(部門別): <span style={{ color: LEVEL_STYLE.Hot.color }}>●</span>3ヶ月以内{' '}
              <span style={{ color: LEVEL_STYLE.Middle.color }}>●</span>6ヶ月以内{' '}
              <span style={{ color: LEVEL_STYLE.Low.color }}>●</span>1年以内
            </span>
          </div>
        )}

        <ObsCard depth="low" padding="none" radius="xl">
          <div className="stitch-scroll overflow-x-auto">
            <div className="min-w-[1400px]">
              <div
                className={`grid ${GRID_TEMPLATE} gap-4 px-6 py-4 text-[11px] font-medium tracking-[0.1em] uppercase sticky top-0 z-[1]`}
                style={{
                  color: 'var(--color-obs-text-subtle)',
                  backgroundColor: 'rgba(27,27,29,0.72)',
                  backdropFilter: 'blur(16px) saturate(140%)',
                  boxShadow: 'inset 0 -1px 0 rgba(171,199,255,0.10)',
                }}
              >
                {/* 全選択 (現ページ100件) ヘッダ */}
                <button
                  type="button"
                  onClick={() => {
                    const ids = paged.map((p) => p.row.id)
                    const allSelected = ids.every((id) => selected.has(id))
                    setSelected((prev) => {
                      const next = new Set(prev)
                      if (allSelected) ids.forEach((id) => next.delete(id))
                      else ids.forEach((id) => next.add(id))
                      return next
                    })
                  }}
                  className="inline-flex items-center justify-center w-5 h-5 rounded transition-colors hover:bg-[var(--color-obs-surface-high)]"
                  title="このページの全件を選択 / 解除"
                >
                  {paged.length > 0 && paged.every((p) => selected.has(p.row.id)) ? (
                    <CheckSquare size={13} style={{ color: 'var(--color-obs-primary)' }} />
                  ) : (
                    <Square size={13} style={{ color: 'var(--color-obs-text-subtle)' }} />
                  )}
                </button>
                <SortHeader label="企業" k="name" sort={sort} onSort={toggleSort} />
                <SortHeader label="求人インテント" k="intent" sort={sort} onSort={toggleSort} />
                <span className="text-[11px] font-medium tracking-[0.1em] uppercase" style={{ color: 'var(--color-obs-text-subtle)' }}>1st シグナル</span>
                <span>都道府県</span>
                <span>業種</span>
                <SortHeader label="従業員数" k="employee" sort={sort} onSort={toggleSort} />
                <SortHeader label="売上" k="revenue" sort={sort} onSort={toggleSort} />
                <SortHeader label="拠点" k="office" sort={sort} onSort={toggleSort} align="right" />
              </div>

              {isLoading ? (
                <LoadingSkeleton />
              ) : paged.length === 0 ? (
                <EmptyState hasFilter={hasActiveFilter} onClear={clearFilters} />
              ) : (
                paged.map(({ row, intent }) => (
                  <CompanyRowItem
                    key={row.id}
                    row={row}
                    isSelected={selected.has(row.id)}
                    onToggleSelect={() => {
                      setSelected((prev) => {
                        const next = new Set(prev)
                        if (next.has(row.id)) next.delete(row.id)
                        else next.add(row.id)
                        return next
                      })
                    }}
                    intent={intent}
                    onClick={() => router.push(`/companies/${row.id}`)}
                    onHover={() => router.prefetch(`/companies/${row.id}`)}
                  />
                ))
              )}
            </div>
          </div>
        </ObsCard>

        {!isLoading && filtered.length > PAGE_SIZE && (
          <div className="flex items-center justify-between mt-6 px-2">
            <span className="text-[12px]" style={{ color: 'var(--color-obs-text-subtle)' }}>
              {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)}件 /{' '}
              {filtered.length.toLocaleString()}件
            </span>
            <Pagination
              page={page}
              totalPages={totalPages}
              onChange={(p) => {
                setPage(p)
                // ページ切替時は即座に最上部へ（スムースなし）
                if (typeof window !== 'undefined') {
                  window.scrollTo({ top: 0, behavior: 'auto' })
                }
              }}
            />
          </div>
        )}
      </div>

      {/* 企業を追加モーダル */}
      {addOpen && (
        <AddCompanyModal
          onClose={() => setAddOpen(false)}
          onAdded={(c) => {
            setRows((prev) => [c, ...prev])
            setAddOpen(false)
          }}
        />
      )}
    </ObsPageShell>
  )
}

function levelKey(s: Signal): string {
  if (s === 'Hot') return 'HOT'
  if (s === 'Middle') return 'MIDDLE'
  if (s === 'Low') return 'LOW'
  return 'NONE'
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function IntentFilterChip({
  active,
  tone,
  label,
  count,
  onClick,
}: {
  active: boolean
  tone: 'hot' | 'middle' | 'low'
  label: string
  count: number
  onClick: () => void
}) {
  const toneColor =
    tone === 'hot' ? 'var(--color-obs-hot)' : tone === 'middle' ? 'var(--color-obs-middle)' : 'var(--color-obs-low)'
  const toneBg =
    tone === 'hot'
      ? 'rgba(255,107,107,0.14)'
      : tone === 'middle'
        ? 'rgba(255,184,107,0.14)'
        : 'rgba(126,198,255,0.14)'
  const toneBgActive =
    tone === 'hot'
      ? 'rgba(255,107,107,0.22)'
      : tone === 'middle'
        ? 'rgba(255,184,107,0.22)'
        : 'rgba(126,198,255,0.22)'

  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={(e) => {
        if (!active) (e.currentTarget as HTMLButtonElement).style.backgroundColor = toneBgActive
      }}
      onMouseLeave={(e) => {
        if (!active) (e.currentTarget as HTMLButtonElement).style.backgroundColor = toneBg
      }}
      className="inline-flex items-center gap-1.5 px-2.5 h-7 rounded-full text-[11px] font-medium tracking-[-0.005em] transition-all duration-150 cursor-pointer"
      style={{
        backgroundColor: active ? toneBgActive : toneBg,
        color: toneColor,
        boxShadow: active
          ? `inset 0 0 0 1.5px ${toneColor}, 0 0 0 2px ${toneColor}26`
          : `inset 0 0 0 1px ${toneColor}30`,
      }}
      title={active ? `${label} フィルタを解除` : `${label} で絞り込む`}
      aria-pressed={active}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: toneColor }} />
      <span className="font-semibold">{label}</span>
      <span
        className="tabular-nums px-1 rounded-full text-[10px]"
        style={{
          color: toneColor,
          backgroundColor: active ? `${toneColor}26` : 'transparent',
        }}
      >
        {count.toLocaleString()}
      </span>
      {active && (
        <span className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full ml-0.5"
          style={{ backgroundColor: toneColor, color: 'white' }}>
          <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </span>
      )}
    </button>
  )
}

function FilterTrigger({
  active,
  label,
  onClick,
  icon,
  count,
}: {
  active: boolean
  label: string
  onClick: () => void
  icon?: 'intent'
  count?: number
}) {
  return (
    <button
      onClick={onClick}
      className={`h-10 px-4 inline-flex items-center gap-2 rounded-[var(--radius-obs-md)] text-sm font-medium transition-colors duration-150 ${active ? '' : 'fo-glass-rim'}`}
      style={{
        backgroundColor: active ? 'var(--color-obs-primary-container)' : 'rgba(36,36,38,0.6)',
        backdropFilter: active ? undefined : 'blur(8px)',
        color: active ? 'var(--color-obs-on-primary)' : 'var(--color-obs-text-muted)',
      }}
    >
      {icon === 'intent' ? (
        <span
          className="inline-block w-1.5 h-1.5 rounded-full"
          style={{
            backgroundColor: active ? 'var(--color-obs-on-primary)' : 'var(--color-obs-primary)',
          }}
        />
      ) : (
        <Filter size={14} />
      )}
      <span className="truncate max-w-[180px]">{label}</span>
      {count !== undefined && count > 1 && (
        <span
          className="text-[10px] font-semibold tabular-nums px-1.5 py-0.5 rounded-full shrink-0"
          style={{
            backgroundColor: active ? 'rgba(255,255,255,0.2)' : 'var(--color-obs-surface-highest)',
            color: active ? 'var(--color-obs-on-primary)' : 'var(--color-obs-text)',
          }}
        >
          {count}
        </span>
      )}
    </button>
  )
}

function MultiSelectDropdown<K extends string>({
  items,
  selected,
  onToggle,
  onClear,
  allLabel,
}: {
  items: { key: K; label: string }[]
  selected: K[]
  onToggle: (key: K) => void
  onClear: () => void
  allLabel: string
}) {
  const selectedCount = selected.length
  return (
    <div
      className="absolute z-20 mt-2 w-64 max-h-80 overflow-y-auto rounded-[var(--radius-obs-lg)] py-2 shadow-2xl fo-glass-strong fo-glass-rim fo-thin-scroll"
      style={{
        boxShadow: '0 24px 60px rgba(0,0,0,0.5), inset 1px 1px 0 rgba(171,199,255,0.10), inset -1px -1px 0 rgba(0,0,0,0.25)',
      }}
    >
      <button
        onClick={onClear}
        className="w-full text-left px-4 py-2 text-sm transition-colors hover:bg-[var(--color-obs-surface-high)] flex items-center justify-between"
        style={{
          color: selectedCount === 0 ? 'var(--color-obs-primary)' : 'var(--color-obs-text)',
        }}
      >
        <span>{allLabel}</span>
        {selectedCount > 0 && (
          <span
            className="text-[10px] uppercase tracking-[0.08em]"
            style={{ color: 'var(--color-obs-text-subtle)' }}
          >
            クリア
          </span>
        )}
      </button>
      <div className="h-px my-1" style={{ backgroundColor: 'var(--color-obs-surface-low)' }} />
      {items.map((it) => {
        const isSelected = selected.includes(it.key)
        return (
          <button
            key={it.key}
            onClick={() => onToggle(it.key)}
            className="w-full text-left px-4 py-2 text-sm transition-colors hover:bg-[var(--color-obs-surface-high)] flex items-center gap-2"
            style={{
              color: isSelected ? 'var(--color-obs-primary)' : 'var(--color-obs-text)',
            }}
          >
            <span
              className="w-4 h-4 rounded-[4px] shrink-0 flex items-center justify-center"
              style={{
                backgroundColor: isSelected ? 'var(--color-obs-primary)' : 'transparent',
                boxShadow: isSelected
                  ? 'none'
                  : 'inset 0 0 0 1.5px var(--color-obs-text-subtle)',
              }}
            >
              {isSelected && (
                <Check size={11} strokeWidth={3} style={{ color: 'var(--color-obs-on-primary)' }} />
              )}
            </span>
            <span className="flex-1 truncate">{it.label}</span>
          </button>
        )
      })}
    </div>
  )
}

function CompanyRowItem({
  row,
  intent,
  onClick,
  onHover,
  isSelected,
  onToggleSelect,
}: {
  row: CompanyRow
  intent: { level: Signal; latestAt: string | null; signalCount: number; activeDepts: DepartmentType[] }
  onClick: () => void
  onHover: () => void
  isSelected: boolean
  onToggleSelect: () => void
}) {
  const isEnriched = row.enrichmentStatus === 'COMPLETED' || row.enrichmentStatus === 'completed'
  const [reserving, setReserving] = useState(false)
  const [reserved, setReserved] = useState(false)
  const firstPartySignal: FirstPartySignal | null = getCompanyFirstPartySignal(row.name)

  async function handleReserve(e: React.MouseEvent) {
    e.stopPropagation()
    if (reserving || reserved) return
    setReserving(true)
    try {
      const res = await fetch('/api/abm/reserve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: [row.id], priority: 'high' }),
      })
      if (res.ok) setReserved(true)
    } catch {
      // 静かに失敗
    } finally {
      setReserving(false)
    }
  }

  return (
    <div
      onClick={onClick}
      onMouseEnter={onHover}
      className={`grid ${GRID_TEMPLATE} gap-4 px-6 py-4 items-center cursor-pointer transition-colors duration-150 group`}
      style={{
        transitionTimingFunction: 'var(--ease-liquid)',
        opacity: isEnriched ? 1 : 0.72,
        boxShadow: 'inset 0 -1px 0 0 rgba(171,199,255,0.04)',
      }}
      onMouseOver={(e) => {
        ;(e.currentTarget as HTMLDivElement).style.backgroundColor = 'rgba(171,199,255,0.04)'
      }}
      onMouseOut={(e) => {
        ;(e.currentTarget as HTMLDivElement).style.backgroundColor = 'transparent'
      }}
    >
      {/* チェックボックス (行クリックで遷移しないよう stopPropagation) */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          onToggleSelect()
        }}
        className="inline-flex items-center justify-center w-5 h-5 rounded transition-colors hover:bg-[var(--color-obs-surface-highest)]"
        title={isSelected ? '選択を解除' : '選択'}
      >
        {isSelected ? (
          <CheckSquare size={14} style={{ color: 'var(--color-obs-primary)' }} />
        ) : (
          <Square size={14} style={{ color: 'var(--color-obs-text-subtle)' }} />
        )}
      </button>

      {/* 企業 */}
      <div className="flex items-center gap-3 min-w-0">
        <div
          className="shrink-0 w-9 h-9 rounded-[var(--radius-obs-md)] flex items-center justify-center text-[12px] font-semibold"
          style={{
            backgroundColor: getAvatarColor(row.name),
            color: 'var(--color-obs-text)',
          }}
        >
          {getInitial(row.name)}
        </div>
        <div className="flex flex-col gap-0.5 min-w-0">
          <div className="flex items-center gap-1.5 min-w-0">
            <span
              className="font-medium text-[14.5px] tracking-[-0.01em] truncate"
              style={{ color: 'var(--color-obs-text)' }}
            >
              {row.name}
            </span>
            {!isEnriched && (
              <span
                className="inline-flex items-center gap-0.5 px-1.5 h-[18px] rounded-full text-[9.5px] font-bold whitespace-nowrap shrink-0"
                style={{
                  background: 'rgba(143,140,144,0.14)',
                  color: 'var(--color-obs-text-muted)',
                  boxShadow: 'inset 0 0 0 1px rgba(143,140,144,0.32)',
                }}
                title="登記台帳データのみ。詳細項目は未取得"
              >
                登記台帳のみ
              </span>
            )}
          </div>
          {row.domain ? (
            <span
              className="text-[12px] truncate"
              style={{ color: 'var(--color-obs-text-subtle)' }}
            >
              {row.domain}
            </span>
          ) : (
            <span
              className="text-[11px] tabular-nums"
              style={{ color: 'var(--color-obs-text-subtle)', opacity: 0.7 }}
            >
              法人番号 {row.corporateNumber}
            </span>
          )}
        </div>
      </div>

      {/* インテント (求人) — プルダウン (未エンリッチは予約ボタン) */}
      {isEnriched ? (
        <IntentCell intent={intent} />
      ) : (
        <button
          type="button"
          onClick={handleReserve}
          disabled={reserving || reserved}
          className="inline-flex items-center gap-1 h-7 px-2.5 rounded-full text-[11px] font-semibold transition-all whitespace-nowrap w-fit"
          style={{
            background: reserved
              ? 'rgba(74,217,138,0.14)'
              : 'rgba(171,199,255,0.10)',
            color: reserved ? '#4ad98a' : 'var(--color-obs-primary)',
            boxShadow: reserved
              ? 'inset 0 0 0 1px rgba(74,217,138,0.32)'
              : 'inset 0 0 0 1px rgba(171,199,255,0.32)',
            cursor: reserving || reserved ? 'default' : 'pointer',
          }}
          title="この企業をエンリッチ対象として予約"
        >
          {reserved ? '✓ 予約済み' : reserving ? '予約中...' : '★ エンリッチ予約'}
        </button>
      )}

      {/* 1st パーティーシグナル — 取引(/deals)に紐づく企業のみ表示 */}
      <div onClick={(e) => e.stopPropagation()}>
        {firstPartySignal ? (
          <SignalBadge signal={firstPartySignal} />
        ) : (
          <span className="text-[12px]" style={{ color: 'var(--color-obs-text-subtle)', opacity: 0.55 }}>—</span>
        )}
      </div>

      {/* 都道府県 */}
      <span className="text-[12.5px] truncate" style={{ color: 'var(--color-obs-text-muted)' }}>
        {row.prefecture}
      </span>

      {/* 業種 */}
      <span className="text-[13px] truncate" style={{ color: 'var(--color-obs-text-muted)' }}>
        {row.industry}
      </span>

      {/* 従業員数 */}
      <span className="text-[12.5px] truncate tabular-nums" style={{ color: 'var(--color-obs-text-muted)' }}>
        {formatEmployeeCount(row.employeeCount)}
      </span>

      {/* 売上 */}
      <span className="text-[12.5px] truncate tabular-nums" style={{ color: 'var(--color-obs-text-muted)' }}>
        {formatRevenue(row.revenue)}
      </span>

      {/* 拠点数 */}
      <span
        className="text-[12.5px] text-right tabular-nums"
        style={{ color: 'var(--color-obs-text-muted)' }}
      >
        {row.officeCount > 0 ? `${row.officeCount}拠点` : '—'}
      </span>
    </div>
  )
}

function SortHeader({
  label,
  k,
  sort,
  onSort,
  align,
}: {
  label: string
  k: SortKey
  sort: { key: SortKey; dir: SortDir }
  onSort: (k: SortKey) => void
  align?: 'right'
}) {
  const active = sort.key === k
  const Icon = active ? (sort.dir === 'asc' ? ChevronUp : ChevronDown) : ArrowUpDown
  return (
    <button
      onClick={() => onSort(k)}
      className={`inline-flex items-center gap-1 text-[11px] font-medium tracking-[0.1em] uppercase transition-colors ${
        align === 'right' ? 'justify-end' : 'justify-start'
      }`}
      style={{
        color: active ? 'var(--color-obs-primary)' : 'var(--color-obs-text-subtle)',
      }}
      onMouseOver={(e) => {
        if (!active) (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-obs-text)'
      }}
      onMouseOut={(e) => {
        if (!active) (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-obs-text-subtle)'
      }}
    >
      <span>{label}</span>
      <Icon size={10} className={active ? '' : 'opacity-50'} />
    </button>
  )
}

function IntentCell({ intent }: { intent: ComputedIntent }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!open) return
    const onClick = (e: MouseEvent) => {
      if (!ref.current) return
      if (!ref.current.contains(e.target as Node)) setOpen(false)
    }
    window.addEventListener('mousedown', onClick)
    return () => window.removeEventListener('mousedown', onClick)
  }, [open])

  // 募集ありの部門だけをレベル別に独立チップ化
  const activeBreakdown = intent.breakdown.filter((b) => b.level !== 'None')
  const hasData = activeBreakdown.length > 0

  if (!hasData) {
    return (
      <span className="text-[11px]" style={{ color: 'var(--color-obs-text-subtle)' }}>
        —
      </span>
    )
  }

  // 最高レベルだけのチップを1つ表示。クリックで全部門の内訳をポップオーバーで開く。
  const topLevel = intent.level
  const topStyle = LEVEL_STYLE[topLevel]
  const totalDepts = activeBreakdown.length

  return (
    <div className="relative min-w-0" ref={ref} onClick={(e) => e.stopPropagation()}>
      <button
        onClick={(e) => {
          e.stopPropagation()
          setOpen((v) => !v)
        }}
        className="w-full flex items-center gap-1.5 text-left"
        title={`${topStyle.label} / ${totalDepts}部門で求人 — クリックで内訳`}
      >
        <span
          className="inline-flex items-center gap-1.5 h-7 px-2.5 rounded-full text-[11px] font-medium tracking-[-0.005em]"
          style={{
            backgroundColor: topStyle.bg,
            color: topStyle.color,
            boxShadow: `inset 0 0 0 1px ${topStyle.border}`,
          }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full shrink-0"
            style={{ backgroundColor: topStyle.color }}
          />
          <span className="shrink-0 font-semibold">{topStyle.label}</span>
          <span
            className="text-[10.5px] tabular-nums opacity-80"
            style={{ color: topStyle.color }}
          >
            {totalDepts}部門
          </span>
        </span>
        <ChevronDown size={12} className="shrink-0 opacity-60" />
      </button>

      {open && (
        <div
          className="absolute z-30 left-0 top-[calc(100%+6px)] min-w-[240px] rounded-[var(--radius-obs-lg)] py-2 shadow-2xl fo-glass-strong fo-glass-rim"
          style={{
            boxShadow: '0 24px 60px rgba(0,0,0,0.5), inset 1px 1px 0 rgba(171,199,255,0.10), inset -1px -1px 0 rgba(0,0,0,0.25)',
          }}
        >
          <div
            className="px-3 pb-2 text-[10px] font-medium tracking-[0.1em] uppercase"
            style={{ color: 'var(--color-obs-text-subtle)' }}
          >
            求人を出している部門
          </div>
          <div className="flex flex-col">
            {intent.breakdown.map((b) => {
              const s = LEVEL_STYLE[b.level]
              return (
                <div
                  key={b.departmentType}
                  className="px-3 py-1.5 flex items-center gap-2"
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full shrink-0"
                    style={{
                      backgroundColor: b.level === 'None' ? 'var(--color-obs-surface-high)' : s.color,
                    }}
                  />
                  <span
                    className="text-[12.5px] font-medium flex-1 truncate"
                    style={{ color: 'var(--color-obs-text)' }}
                  >
                    {DEPT_LABEL[b.departmentType]}
                  </span>
                  {b.level !== 'None' && (
                    <span
                      className="text-[10px] font-medium px-1.5 py-0.5 rounded-full tabular-nums"
                      style={{ color: s.color, backgroundColor: s.bg }}
                    >
                      {s.label}
                    </span>
                  )}
                  <span
                    className="text-[11px] tabular-nums shrink-0"
                    style={{ color: 'var(--color-obs-text-subtle)' }}
                  >
                    {formatRelative(b.latestAt)}
                  </span>
                </div>
              )
            })}
          </div>
          <div
            className="mt-2 pt-2 px-3 text-[10px] leading-relaxed"
            style={{
              color: 'var(--color-obs-text-subtle)',
              borderTop: '1px solid var(--color-obs-surface-low)',
            }}
          >
            色分け: <span style={{ color: LEVEL_STYLE.Hot.color }}>●</span>3ヶ月以内 /{' '}
            <span style={{ color: LEVEL_STYLE.Middle.color }}>●</span>6ヶ月以内 /{' '}
            <span style={{ color: LEVEL_STYLE.Low.color }}>●</span>1年以内
          </div>
        </div>
      )}
    </div>
  )
}

// 企業を手動追加するモーダル (社名・ドメイン・所在地のみの最低限)
function AddCompanyModal({
  onClose,
  onAdded,
}: {
  onClose: () => void
  onAdded: (c: CompanyRow) => void
}) {
  const [name, setName] = useState('')
  const [domain, setDomain] = useState('')
  const [prefecture, setPrefecture] = useState('')
  const [industry, setIndustry] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const submit = () => {
    if (!name.trim() || submitting) return
    setSubmitting(true)
    const newRow: CompanyRow = {
      id: `manual-${Date.now()}`,
      name: name.trim(),
      domain: domain.trim(),
      industry: industry.trim() || 'その他',
      prefecture: prefecture.trim() || '—',
      city: null,
      employeeCount: null,
      revenue: null,
      representative: null,
      corporateType: '株式会社',
      corporateNumber: '',
      officeCount: 0,
      serviceTags: [],
      intents: [],
      enrichmentStatus: 'PENDING',
    }
    onAdded(newRow)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => !submitting && onClose()}>
      <div className="absolute inset-0" style={{ background: 'rgba(11,11,12,0.65)', backdropFilter: 'blur(10px)' }} />
      <div
        className="relative w-full max-w-[480px] rounded-[var(--radius-obs-xl)] overflow-hidden fo-glass-strong fo-glass-rim"
        style={{
          boxShadow: '0 32px 80px rgba(0,0,0,0.65), inset 1px 1px 0 rgba(171,199,255,0.10), inset -1px -1px 0 rgba(0,0,0,0.25)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 py-4" style={{ boxShadow: 'inset 0 -1px 0 var(--color-obs-surface-low)' }}>
          <h2 className="text-[16px] font-bold" style={{ color: 'var(--color-obs-text)' }}>企業を追加</h2>
          <p className="text-[12px] mt-1" style={{ color: 'var(--color-obs-text-muted)' }}>
            手動で企業を追加します。後でエンリッチ予約すると詳細データが自動取得されます
          </p>
        </div>
        <div className="px-5 py-4 space-y-3">
          <label className="block">
            <span className="text-[11px] font-bold uppercase tracking-[0.06em]" style={{ color: 'var(--color-obs-text-subtle)' }}>
              企業名 <span style={{ color: 'var(--color-obs-hot)' }}>*</span>
            </span>
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="株式会社○○"
              className="mt-1.5 w-full px-3 py-2 rounded-[8px] text-[13px] outline-none"
              style={{
                background: 'var(--color-obs-surface-lowest)',
                color: 'var(--color-obs-text)',
                boxShadow: 'inset 0 0 0 1px rgba(109,106,111,0.18)',
              }}
            />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="text-[11px] font-bold uppercase tracking-[0.06em]" style={{ color: 'var(--color-obs-text-subtle)' }}>
                ドメイン
              </span>
              <input
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                placeholder="example.co.jp"
                className="mt-1.5 w-full px-3 py-2 rounded-[8px] text-[13px] outline-none"
                style={{
                  background: 'var(--color-obs-surface-lowest)',
                  color: 'var(--color-obs-text)',
                  boxShadow: 'inset 0 0 0 1px rgba(109,106,111,0.18)',
                }}
              />
            </label>
            <label className="block">
              <span className="text-[11px] font-bold uppercase tracking-[0.06em]" style={{ color: 'var(--color-obs-text-subtle)' }}>
                都道府県
              </span>
              <input
                value={prefecture}
                onChange={(e) => setPrefecture(e.target.value)}
                placeholder="東京都"
                className="mt-1.5 w-full px-3 py-2 rounded-[8px] text-[13px] outline-none"
                style={{
                  background: 'var(--color-obs-surface-lowest)',
                  color: 'var(--color-obs-text)',
                  boxShadow: 'inset 0 0 0 1px rgba(109,106,111,0.18)',
                }}
              />
            </label>
          </div>
          <label className="block">
            <span className="text-[11px] font-bold uppercase tracking-[0.06em]" style={{ color: 'var(--color-obs-text-subtle)' }}>
              業種
            </span>
            <input
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              placeholder="IT・ソフトウェア"
              className="mt-1.5 w-full px-3 py-2 rounded-[8px] text-[13px] outline-none"
              style={{
                background: 'var(--color-obs-surface-lowest)',
                color: 'var(--color-obs-text)',
                boxShadow: 'inset 0 0 0 1px rgba(109,106,111,0.18)',
              }}
            />
          </label>
        </div>
        <div className="flex justify-end gap-2 px-5 py-4" style={{ boxShadow: 'inset 0 1px 0 var(--color-obs-surface-low)' }}>
          <ObsButton variant="ghost" onClick={onClose} disabled={submitting}>キャンセル</ObsButton>
          <ObsButton variant="primary" onClick={submit} disabled={!name.trim() || submitting}>
            {submitting ? '追加中...' : '追加'}
          </ObsButton>
        </div>
      </div>
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="flex flex-col">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className={`grid ${GRID_TEMPLATE} gap-4 px-6 py-4 items-center`}
          style={{ opacity: 1 - i * 0.08, animationDelay: `${i * 80}ms` }}
        >
          <div className="w-5 h-5 rounded fo-skeleton" />
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-[var(--radius-obs-md)] fo-skeleton" />
            <div className="flex flex-col gap-1.5 flex-1">
              <div className="h-3.5 rounded fo-skeleton" style={{ width: '60%' }} />
              <div className="h-2.5 rounded fo-skeleton" style={{ width: '35%' }} />
            </div>
          </div>
          {Array.from({ length: 6 }).map((_, j) => (
            <div key={j} className="h-3 rounded fo-skeleton" style={{ width: '70%' }} />
          ))}
        </div>
      ))}
    </div>
  )
}

function EmptyState({ hasFilter, onClear }: { hasFilter: boolean; onClear: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-3">
      <div
        className="w-12 h-12 rounded-full flex items-center justify-center fo-glass-rim"
        style={{
          backgroundColor: 'rgba(36,36,38,0.6)',
          backdropFilter: 'blur(10px)',
        }}
      >
        <Search size={20} style={{ color: 'var(--color-obs-text-subtle)' }} />
      </div>
      <p className="text-sm" style={{ color: 'var(--color-obs-text-muted)' }}>
        {hasFilter ? '条件に一致する企業が見つかりません' : '企業データがまだありません'}
      </p>
      {hasFilter && (
        <ObsButton variant="ghost" size="sm" onClick={onClear}>
          絞り込みをクリア
        </ObsButton>
      )}
    </div>
  )
}

function Pagination({
  page,
  totalPages,
  onChange,
}: {
  page: number
  totalPages: number
  onChange: (p: number) => void
}) {
  const items: Array<number | 'ellipsis'> = []
  const siblings = 1
  items.push(1)
  const left = Math.max(2, page - siblings)
  const right = Math.min(totalPages - 1, page + siblings)
  if (left > 2) items.push('ellipsis')
  for (let i = left; i <= right; i++) items.push(i)
  if (right < totalPages - 1) items.push('ellipsis')
  if (totalPages > 1) items.push(totalPages)

  const hoverBg = (el: HTMLButtonElement, on: boolean) => {
    el.style.backgroundColor = on ? 'rgba(171,199,255,0.06)' : 'transparent'
  }

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={() => onChange(Math.max(1, page - 1))}
        disabled={page === 1}
        className="w-9 h-9 rounded-[var(--radius-obs-md)] flex items-center justify-center transition-colors duration-150 disabled:opacity-30"
        style={{ color: 'var(--color-obs-text-muted)' }}
        onMouseOver={(e) => page > 1 && hoverBg(e.currentTarget as HTMLButtonElement, true)}
        onMouseOut={(e) => hoverBg(e.currentTarget as HTMLButtonElement, false)}
      >
        <ChevronLeft size={15} />
      </button>
      {items.map((it, idx) => {
        if (it === 'ellipsis') {
          return (
            <span
              key={`e-${idx}`}
              className="w-9 h-9 flex items-center justify-center text-sm"
              style={{ color: 'var(--color-obs-text-subtle)' }}
            >
              …
            </span>
          )
        }
        const active = it === page
        return (
          <button
            key={it}
            onClick={() => onChange(it)}
            className="w-9 h-9 rounded-[var(--radius-obs-md)] flex items-center justify-center text-sm font-medium transition-colors duration-150 tabular-nums"
            style={{
              backgroundColor: active ? 'var(--color-obs-primary-container)' : 'transparent',
              color: active ? 'var(--color-obs-on-primary)' : 'var(--color-obs-text-muted)',
              boxShadow: active ? '0 0 18px rgba(171,199,255,0.32), inset 0 0 0 1px rgba(171,199,255,0.32)' : undefined,
            }}
            onMouseOver={(e) => !active && hoverBg(e.currentTarget as HTMLButtonElement, true)}
            onMouseOut={(e) => !active && hoverBg(e.currentTarget as HTMLButtonElement, false)}
          >
            {it}
          </button>
        )
      })}
      <button
        onClick={() => onChange(Math.min(totalPages, page + 1))}
        disabled={page === totalPages}
        className="w-9 h-9 rounded-[var(--radius-obs-md)] flex items-center justify-center transition-colors duration-150 disabled:opacity-30"
        style={{ color: 'var(--color-obs-text-muted)' }}
        onMouseOver={(e) => page < totalPages && hoverBg(e.currentTarget as HTMLButtonElement, true)}
        onMouseOut={(e) => hoverBg(e.currentTarget as HTMLButtonElement, false)}
      >
        <ChevronRight size={15} />
      </button>
    </div>
  )
}
