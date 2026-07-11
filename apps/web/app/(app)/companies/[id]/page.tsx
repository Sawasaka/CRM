import { prisma } from '@bgm/db'
import CompanyDetailClient from './CompanyDetailClient'
import { getAbmCompanyDetail, isAbmUuid } from '@/lib/abm-supabase'

// SSR：id 形式で分岐
//  - UUID（companies テーブル / 290万社・v2エンリッチ済）→ ABM Supabase 直読み
//  - cuid（CompanyMaster / Prisma 管理）→ 従来の Prisma クエリ
export default async function CompanyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}) {
  const { id } = await params

  if (isAbmUuid(id)) {
    const abm = await getAbmCompanyDetail(id).catch(() => null)
    if (abm) {
      const raw = toRawFromAbm(abm)
      // 法人番号で Prisma 側の取引・コンタクトを引っ張る
      let withCrm: (typeof raw & { deals?: Array<unknown>; contacts?: Array<unknown> }) | null = raw
      if (abm.company.corporate_number) {
        const linked = await getCrmLinkedByCorporateNumber(abm.company.corporate_number)
        withCrm = { ...raw, deals: linked.deals, contacts: linked.contacts }
      }
      return (
        <CompanyDetailClient
          id={id}
          initialData={withCrm as never}
        />
      )
    }
  }

  // モックID（1,2,3等）の場合は fetch しない
  const looksLikeUuidOrCuid = id.length >= 20
  const masterRaw = looksLikeUuidOrCuid
    ? await prisma.companyMaster
        .findUnique({
          where: { id },
          include: {
            industry: true,
            serviceTags: { include: { tag: true } },
            offices: { orderBy: [{ isPrimary: 'desc' }, { createdAt: 'asc' }] },
            departments: {
              where: { parentDepartmentId: null },
              orderBy: { createdAt: 'asc' },
              include: {
                childDepartments: {
                  orderBy: { createdAt: 'asc' },
                  include: { childDepartments: true },
                },
              },
            },
            companyIntents: { orderBy: { latestSignalAt: 'desc' } },
            intentSignals: {
              orderBy: { publishedAt: 'desc' },
              take: 50,
              select: {
                id: true,
                departmentType: true,
                signalType: true,
                source: true,
                sourceUrl: true,
                title: true,
                publishedAt: true,
                createdAt: true,
              },
            },
            _count: { select: { offices: true, departments: true, intentSignals: true } },
          },
        })
        .then((c) =>
          c
            ? JSON.parse(
                JSON.stringify(c, (_k, v) => (v instanceof Date ? v.toISOString() : v)),
              )
            : null,
        )
        .catch(() => null)
    : null

  // CompanyMasterで見つかった企業に紐づくCRM情報（Deal/Contact）を法人番号経由で取得
  let initialData = masterRaw
  if (initialData?.corporateNumber) {
    const linked = await getCrmLinkedByCorporateNumber(initialData.corporateNumber)
    initialData = { ...initialData, deals: linked.deals, contacts: linked.contacts }
  }

  return <CompanyDetailClient id={id} initialData={initialData} />
}

// 法人番号 → Prisma の Company に紐づく Deal / Contact を取得
async function getCrmLinkedByCorporateNumber(corporateNumber: string) {
  try {
    const companies = await prisma.company.findMany({
      where: { corporateNumber },
      select: {
        id: true,
        deals: {
          orderBy: { updatedAt: 'desc' },
          take: 20,
          select: {
            id: true,
            name: true,
            stage: true,
            amount: true,
            probability: true,
            expectedCloseAt: true,
            createdAt: true,
            updatedAt: true,
            owner: { select: { name: true } },
          },
        },
        contacts: {
          orderBy: [{ isDecisionMaker: 'desc' }, { updatedAt: 'desc' }],
          take: 20,
          select: {
            id: true,
            name: true,
            title: true,
            department: true,
            email: true,
            phone: true,
            isDecisionMaker: true,
          },
        },
      },
    })
    const deals = companies.flatMap((c) =>
      c.deals.map((d) => ({
        id: d.id,
        name: d.name,
        stage: String(d.stage),
        amount: d.amount,
        probability: d.probability,
        expectedCloseAt: d.expectedCloseAt ? d.expectedCloseAt.toISOString() : null,
        createdAt: d.createdAt ? d.createdAt.toISOString() : null,
        updatedAt: d.updatedAt ? d.updatedAt.toISOString() : null,
        ownerName: d.owner?.name ?? null,
      })),
    )
    const contacts = companies.flatMap((c) =>
      c.contacts.map((p) => ({
        id: p.id,
        name: p.name,
        title: p.title,
        department: p.department,
        email: p.email,
        phone: p.phone,
        isDecisionMaker: p.isDecisionMaker,
      })),
    )
    return { deals, contacts }
  } catch {
    return { deals: [], contacts: [] }
  }
}

// ABM Supabase（snake_case）→ CompanyDetailClient が期待する Raw（camelCase）形に変換
function toRawFromAbm(abm: NonNullable<Awaited<ReturnType<typeof getAbmCompanyDetail>>>) {
  const c = abm.company
  return {
    id: c.id,
    name: c.name,
    nameKana: c.name_kana,
    corporateNumber: c.corporate_number,
    corporateType: c.corporate_type,
    websiteUrl: c.website_url,
    prefecture: c.prefecture,
    city: c.city,
    address: c.address,
    employeeCount: c.employee_count,
    revenue: c.revenue,
    serviceSummary: c.service_summary,
    companyFeatures: c.company_features,
    enrichmentStatus: c.enrichment_status,
    createdAt: c.created_at,
    updatedAt: c.updated_at,
    industry: abm.industry,
    serviceTags: abm.serviceTags.map((t) => ({ tag: { id: t.id, name: t.name } })),
    // v2 直接フィールド
    hqPhone: c.hq_phone,
    twitterUrl: c.twitter_url,
    linkedinUrl: c.linkedin_url,
    facebookUrl: c.facebook_url,
    youtubeUrl: c.youtube_url,
    instagramUrl: c.instagram_url,
    githubUrl: c.github_url,
    noteUrl: c.note_url,
    // gBizINFO 由来
    establishedAt: c.established_at,
    capitalStock: c.capital_stock,
    representativeName: c.representative_name,
    gbizIndustryCode: c.gbiz_industry_code,
    businessItems: c.business_items,
    offices: abm.offices.map((o) => ({
      id: o.id,
      name: o.name,
      officeType: o.office_type ?? '',
      prefecture: o.prefecture,
      city: o.city,
      address: o.address,
      phone: o.phone,
      deptPhones: o.dept_phones,
      isPrimary: !!o.is_primary,
    })),
    departments: abm.departments.map((d) => ({
      id: d.id,
      name: d.name,
      departmentType: d.department_type,
      parentDepartmentId: d.parent_department_id,
      hierarchyLevel: d.hierarchy_level,
      headcount: d.headcount != null ? String(d.headcount) : null,
      sourceUrl: d.source_url,
      officeId: d.office_id,
      // Prisma 専用フィールドは ABM スキーマには存在しないため null
      phone: null,
      email: null,
      contactPersonName: null,
      contactPersonTitle: null,
    })),
    companyIntents: abm.companyIntents.map((ci) => ({
      intentLevel: (ci.intent_level?.toUpperCase() ?? 'NONE') as 'HOT' | 'MIDDLE' | 'LOW' | 'NONE',
      departmentType: ci.department_type,
      signalCount: ci.signal_count ?? 0,
      latestSignalAt: ci.latest_signal_date,
    })),
    intentSignals: abm.intentSignals.map((s) => {
      // source_url は重複防止用の `kyujinbox://` 合成キーが入ることが多いため、
      // raw_data.original_url を優先して実URLを採用する。
      // ただし求人ボックスの /rd/ は外部（dodaやIndeed等）へ302で飛んでしまうため、
      // 求人ボックス内検索ページに置換して「求人ボックスの該当求人」に着地させる。
      const rd = (s.raw_data ?? {}) as Record<string, unknown>
      const originalUrl = typeof rd.original_url === 'string' ? rd.original_url : null
      const isHttp = (u: string | null) => !!u && /^https?:\/\//i.test(u)
      const KBOX_HOST = 'xn--pckua2a7gp15o89zb.com' // = 求人ボックス.com
      const isKboxRedirect =
        !!originalUrl && new RegExp(`${KBOX_HOST}/rd/`, 'i').test(originalUrl)
      const isKboxDetail =
        !!originalUrl && new RegExp(`${KBOX_HOST}/(jb|jbn)/`, 'i').test(originalUrl)
      const kboxSearchUrl = (kw: string) =>
        `https://${KBOX_HOST}/?q=${encodeURIComponent(kw)}`

      let realUrl = ''
      if (isKboxDetail) {
        realUrl = originalUrl!
      } else if (isKboxRedirect) {
        // 外部へ飛ばさず、求人ボックスのキーワード検索結果に誘導
        realUrl = kboxSearchUrl(s.title ?? '')
      } else if (isHttp(originalUrl)) {
        realUrl = originalUrl!
      } else if (isHttp(s.source_url)) {
        realUrl = s.source_url!
      }
      return {
        id: s.id,
        title: s.title,
        signalType: s.signal_type ?? 'job_posting',
        source: s.source_name ?? '',
        sourceUrl: realUrl,
        // posted_date が無い行も多いため discovered_at / created_at にフォールバック
        publishedAt: s.posted_date ?? s.discovered_at ?? s.created_at,
        departmentType: s.department_type,
      }
    }),
    isAbmSource: true,
  }
}
