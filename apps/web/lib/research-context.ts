// リサーチチャットのコンテキスト構築
// entityType (company/deal/contact) + entityId から、
//   1. 対象企業（companies テーブル / ABM Supabase）or CompanyMaster（Prisma）
//   2. 関連 offices, intent_signals, company_intents
//   3. 関連 deal/contact 情報（Prisma側）
// を集めてシステムプロンプトに使うテキストを構築する。
import { prisma } from '@bgm/db'
import {
  getAbmCompanyDetail,
  getAbmCompanyIdByCorporateNumber,
  type AbmCompanyDetail,
  isAbmUuid,
} from './abm-supabase'

const DEPT_LABELS: Record<string, string> = {
  sales_is: '営業 IS', sales_fs: '営業 FS', sales_ae: '営業 AE', sales_bdr: '営業 BDR',
  sales_legal: '営業 法人/エンプラ', sales: '営業',
  it_corp: 'IT コーポレート', it_engineer: 'IT エンジニア', it_security: 'IT セキュリティ',
  it_dx: 'IT DX', it_data: 'IT データ', it_dev: 'IT 開発', it: 'IT',
  hr_recruit: '人事 採用', hr_lnd: '人事 教育研修', hr_labor: '人事 労務',
  hr_planning: '人事 企画', hr: '人事',
  fin_acct: '経理', fin_treasury: '財務', fin_audit: '監査', fin_tax: '税務', finance: '財務全般',
  mkt_digital: 'マーケ デジタル', mkt_pr: '広報', mkt_brand: 'ブランド', marketing: 'マーケ',
  cs_success: 'CS Success', cs_support: 'CS Support', pdm: 'PdM', cs: 'CS',
  legal: '法務', management: '経営', rd: 'R&D', operations: '運用', engineering: '技術',
}

export type EntityType = 'company' | 'deal' | 'contact'

export type ResearchContext = {
  entityType: EntityType
  entityId: string
  abm: AbmCompanyDetail | null
  // dealやcontactから来た場合の補足
  relatedDeal?: { id: string; title: string; stage: string; amount: number | null } | null
  relatedContact?: { id: string; name: string; email: string | null; title: string | null } | null
}

/**
 * 法人番号 → companies.id（uuid）→ AbmCompanyDetail の取得を共通化
 */
async function fetchAbmByCorporateNumber(corporateNumber: string | null | undefined): Promise<AbmCompanyDetail | null> {
  if (!corporateNumber) return null
  const uuid = await getAbmCompanyIdByCorporateNumber(corporateNumber).catch(() => null)
  if (!uuid) return null
  return getAbmCompanyDetail(uuid).catch(() => null)
}

export async function buildResearchContext(entityType: EntityType, entityId: string): Promise<ResearchContext> {
  const ctx: ResearchContext = { entityType, entityId, abm: null }

  // company: id が UUID なら ABM Supabase を直接、それ以外（cuid: bgm の Company）は法人番号経由で
  if (entityType === 'company') {
    if (isAbmUuid(entityId)) {
      ctx.abm = await getAbmCompanyDetail(entityId).catch(() => null)
      return ctx
    }
    const company = await prisma.company.findUnique({
      where: { id: entityId },
      select: { corporateNumber: true },
    }).catch(() => null)
    ctx.abm = await fetchAbmByCorporateNumber(company?.corporateNumber)
    return ctx
  }

  // deal: Deal → Company.corporateNumber → companies(uuid)
  if (entityType === 'deal') {
    const deal = await prisma.deal.findUnique({
      where: { id: entityId },
      select: {
        id: true,
        name: true,
        stage: true,
        amount: true,
        company: { select: { corporateNumber: true } },
      },
    }).catch(() => null)
    if (deal) {
      ctx.relatedDeal = { id: deal.id, title: deal.name, stage: deal.stage, amount: deal.amount }
      ctx.abm = await fetchAbmByCorporateNumber(deal.company?.corporateNumber)
    }
    return ctx
  }

  // contact: Contact → Company.corporateNumber → companies(uuid)
  if (entityType === 'contact') {
    const contact = await prisma.contact.findUnique({
      where: { id: entityId },
      select: {
        id: true,
        name: true,
        email: true,
        title: true,
        company: { select: { corporateNumber: true } },
      },
    }).catch(() => null)
    if (contact) {
      ctx.relatedContact = {
        id: contact.id,
        name: contact.name,
        email: contact.email,
        title: contact.title,
      }
      ctx.abm = await fetchAbmByCorporateNumber(contact.company?.corporateNumber)
    }
    return ctx
  }

  return ctx
}

/**
 * リサーチコンテキスト → システムプロンプト用のテキスト
 */
export function formatContextForPrompt(ctx: ResearchContext): string {
  const lines: string[] = []
  lines.push('# リサーチ対象')
  lines.push(`エンティティ種別: ${ctx.entityType}`)
  if (ctx.relatedDeal) {
    lines.push(`関連取引: ${ctx.relatedDeal.title}（ステージ: ${ctx.relatedDeal.stage}${ctx.relatedDeal.amount ? `、金額: ${ctx.relatedDeal.amount.toLocaleString()}` : ''}）`)
  }
  if (ctx.relatedContact) {
    lines.push(`関連コンタクト: ${ctx.relatedContact.name}${ctx.relatedContact.title ? `（${ctx.relatedContact.title}）` : ''}`)
  }

  if (!ctx.abm) {
    lines.push('\n（社内DBに対象企業の詳細データなし。一般知識・公開情報で回答してください）')
    return lines.join('\n')
  }

  const c = ctx.abm.company
  lines.push('\n## 企業基本情報')
  lines.push(`- 企業名: ${c.name}`)
  if (c.name_kana) lines.push(`- カナ: ${c.name_kana}`)
  if (c.corporate_number) lines.push(`- 法人番号: ${c.corporate_number}`)
  if (c.website_url) lines.push(`- 公式サイト: ${c.website_url}`)
  if (c.prefecture || c.city || c.address) lines.push(`- 所在地: ${[c.prefecture, c.city, c.address].filter(Boolean).join('')}`)
  if (c.employee_count) lines.push(`- 従業員数: ${c.employee_count}`)
  if (c.revenue) lines.push(`- 売上: ${c.revenue}`)
  if (ctx.abm.industry) lines.push(`- 業種: ${ctx.abm.industry.name}`)
  if (c.service_summary) lines.push(`- 事業内容: ${c.service_summary}`)
  if (c.hq_phone) lines.push(`- 本社代表電話: ${c.hq_phone}`)

  // SNS
  const sns: [string, string | null][] = [
    ['Twitter/X', c.twitter_url],
    ['LinkedIn', c.linkedin_url],
    ['Facebook', c.facebook_url],
    ['YouTube', c.youtube_url],
    ['Instagram', c.instagram_url],
    ['GitHub', c.github_url],
    ['note', c.note_url],
  ]
  const snsLines = sns.filter(([, url]) => !!url).map(([n, url]) => `  - ${n}: ${url}`)
  if (snsLines.length > 0) {
    lines.push('\n## 公式SNSアカウント')
    lines.push(...snsLines)
  }

  // 拠点
  if (ctx.abm.offices.length > 0) {
    lines.push('\n## 拠点')
    for (const o of ctx.abm.offices) {
      const loc = [o.prefecture, o.city, o.address].filter(Boolean).join('')
      lines.push(`- ${o.name}（${o.is_primary ? '本社' : o.office_type ?? '拠点'}）${loc ? ` / ${loc}` : ''}${o.phone ? ` / TEL ${o.phone}` : ''}`)
      if (o.dept_phones && Object.keys(o.dept_phones).length > 0) {
        for (const [dept, phone] of Object.entries(o.dept_phones)) {
          lines.push(`  - 部署別電話: ${dept}: ${phone}`)
        }
      }
    }
  }

  // 部門別インテント（求人）
  if (ctx.abm.companyIntents.length > 0) {
    lines.push('\n## 求人インテント（採用シグナル集約）')
    for (const ci of ctx.abm.companyIntents) {
      const label = DEPT_LABELS[ci.department_type] ?? ci.department_type
      lines.push(`- ${label}: ${ci.intent_level.toUpperCase()}（${ci.signal_count ?? 0}件、最新 ${ci.latest_signal_date ?? '-'}）`)
    }
  }

  // 直近の求人タイトル（最大20）
  if (ctx.abm.intentSignals.length > 0) {
    lines.push('\n## 直近の採用シグナル（求人タイトル）')
    for (const s of ctx.abm.intentSignals.slice(0, 20)) {
      const label = s.department_type ? (DEPT_LABELS[s.department_type] ?? s.department_type) : '-'
      lines.push(`- [${label}] ${s.title}${s.posted_date ? `（${s.posted_date}）` : ''}`)
    }
  }

  return lines.join('\n')
}
