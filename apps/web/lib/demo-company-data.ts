type IntentLike = {
  departmentType: string | null
  intentLevel?: string | null
  signalCount?: number | null
}

type HireBudget = {
  departmentType: string
  monthlyMin: number
  monthlyMax: number
}

type DemoDeal = {
  id: string
  name: string
  stage: string
  amount: number | null
  probability: number | null
  expectedCloseAt: string | null
  createdAt: string | null
  updatedAt: string | null
  ownerName: string | null
}

type DemoContact = {
  id: string
  name: string
  title: string | null
  department: string | null
  email: string | null
  phone: string | null
  isDecisionMaker: boolean
}

const TOPLEVEL_DEPT: Record<string, string> = {
  sales_is: 'SALES',
  sales_fs: 'SALES',
  sales_ae: 'SALES',
  sales_bdr: 'SALES',
  sales_legal: 'SALES',
  sales: 'SALES',
  it_corp: 'IT',
  it_engineer: 'IT',
  it_security: 'IT',
  it_dx: 'IT',
  it_data: 'IT',
  it_dev: 'IT',
  it: 'IT',
  hr_recruit: 'HR',
  hr_lnd: 'HR',
  hr_labor: 'HR',
  hr_planning: 'HR',
  hr: 'HR',
  fin_acct: 'FINANCE',
  fin_treasury: 'FINANCE',
  fin_audit: 'FINANCE',
  fin_tax: 'FINANCE',
  finance: 'FINANCE',
  mkt_digital: 'MARKETING',
  mkt_pr: 'MARKETING',
  mkt_brand: 'MARKETING',
  marketing: 'MARKETING',
  cs_success: 'CS',
  cs_support: 'CS',
  pdm: 'CS',
  cs: 'CS',
  legal: 'LEGAL',
  management: 'MANAGEMENT',
  rd: 'RD',
  operations: 'OPERATIONS',
  engineering: 'ENGINEERING',
  other: 'OTHER',
}

const DEPT_LABELS: Record<string, string> = {
  SALES: '営業部',
  MARKETING: 'マーケティング部',
  ENGINEERING: '開発部',
  IT: '情報システム部',
  HR: '人事部',
  FINANCE: '経理財務部',
  LEGAL: '法務部',
  OPERATIONS: '事業推進部',
  MANAGEMENT: '経営企画部',
  RD: '研究開発部',
  CS: 'カスタマーサクセス部',
  OTHER: '担当部門',
}

const CONTACT_NAMES = [
  ['佐藤 亮', '部長'],
  ['田中 美咲', 'マネージャー'],
  ['鈴木 健太', '課長'],
  ['高橋 直子', '責任者'],
  ['伊藤 拓也', 'リーダー'],
] as const

function hashString(value: string) {
  let hash = 0
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0
  }
  return hash
}

function normalizeDept(departmentType: string | null | undefined) {
  if (!departmentType) return 'SALES'
  const key = departmentType.toLowerCase()
  return TOPLEVEL_DEPT[key] ?? departmentType.toUpperCase()
}

export function isDemoUrlSearch(search: string | URLSearchParams) {
  const sp = typeof search === 'string' ? new URLSearchParams(search) : search
  return (
    sp.get('demo') === '1' ||
    sp.get('demoSession') === '1' ||
    (sp.get('tenant') ?? '').startsWith('demo-')
  )
}

export function buildDemoHireBudgets(seed: string, intents: IntentLike[] = []): HireBudget[] {
  const seen = new Set<string>()
  const depts = intents
    .map((intent) => normalizeDept(intent.departmentType))
    .filter((dept) => {
      if (seen.has(dept)) return false
      seen.add(dept)
      return true
    })
    .slice(0, 4)

  if (!depts.includes('HR')) depts.push('HR')
  if (!depts.includes('SALES')) depts.push('SALES')

  const hash = hashString(seed)
  return depts.slice(0, 4).map((departmentType, index) => {
    const base = 340000 + ((hash + index * 73000) % 180000)
    const premium =
      departmentType === 'IT' || departmentType === 'ENGINEERING'
        ? 260000
        : departmentType === 'MANAGEMENT' || departmentType === 'RD'
          ? 220000
          : departmentType === 'SALES' || departmentType === 'MARKETING'
            ? 170000
            : 130000
    const monthlyMin = Math.round(base / 10000) * 10000
    const monthlyMax = Math.round((base + premium + ((hash >> index) % 90000)) / 10000) * 10000
    return { departmentType, monthlyMin, monthlyMax }
  })
}

export function buildDemoDeptPhoneCount(seed: string, intents: IntentLike[] = [], officeCount = 0) {
  const activeIntentCount = intents.filter((intent) => (intent.signalCount ?? 0) > 0).length
  return Math.max(2, Math.min(12, activeIntentCount + Math.max(officeCount, 1) + (hashString(seed) % 4)))
}

export function buildDemoDeptPhones(seed: string, intents: IntentLike[] = []) {
  const budgets = buildDemoHireBudgets(seed, intents)
  const hash = hashString(seed)
  return Object.fromEntries(
    budgets.slice(0, 3).map((budget, index) => {
      const suffix = String(1000 + ((hash + index * 137) % 8000)).padStart(4, '0')
      return [DEPT_LABELS[budget.departmentType] ?? '担当部門', `03-${String(5000 + index * 111).padStart(4, '0')}-${suffix}`]
    }),
  )
}

export function buildDemoDeals(seed: string, companyName: string): DemoDeal[] {
  const hash = hashString(seed)
  const today = new Date()
  const iso = (days: number) => {
    const date = new Date(today)
    date.setDate(date.getDate() + days)
    return date.toISOString()
  }

  return [
    {
      id: `demo-deal-${hash}-1`,
      name: `${companyName} / 部署番号活用提案`,
      stage: 'MEETING_PLANNED',
      amount: 1800000 + (hash % 5) * 300000,
      probability: 45,
      expectedCloseAt: iso(21),
      createdAt: iso(-9),
      updatedAt: iso(-1),
      ownerName: 'デモ担当',
    },
    {
      id: `demo-deal-${hash}-2`,
      name: `${companyName} / 採用インテント分析`,
      stage: 'NURTURING',
      amount: 900000 + (hash % 4) * 200000,
      probability: 30,
      expectedCloseAt: iso(45),
      createdAt: iso(-18),
      updatedAt: iso(-3),
      ownerName: 'デモ担当',
    },
  ]
}

export function buildDemoContacts(seed: string, companyName: string, intents: IntentLike[] = []): DemoContact[] {
  const hash = hashString(seed)
  const domainSeed =
    companyName
      .replace(/株式会社|合同会社|有限会社|ホールディングス/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 16) || `company-${hash % 100000}`
  const budgets = buildDemoHireBudgets(seed, intents)

  return budgets.slice(0, 3).map((budget, index) => {
    const [name, title] = CONTACT_NAMES[(hash + index) % CONTACT_NAMES.length]!
    return {
      id: `demo-contact-${hash}-${index + 1}`,
      name,
      title,
      department: DEPT_LABELS[budget.departmentType] ?? '担当部門',
      email: `demo${index + 1}@${domainSeed}.example`,
      phone: `03-${String(6200 + index * 143).padStart(4, '0')}-${String(1000 + ((hash + index * 211) % 8000)).padStart(4, '0')}`,
      isDecisionMaker: index === 0,
    }
  })
}
