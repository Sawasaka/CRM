// 自社サービス情報（リサーチチャットのシステムプロンプトに常時挿入）
// MVP段階: ファイル保存（apps/web/.our-business-{orgId}.json）でorg別保存をエミュレート
// 後で Organization テーブルに our_business JSONB カラム追加を推奨
import { promises as fs } from 'fs'
import { join } from 'path'

export type OurBusiness = {
  serviceName: string
  industry: string
  strengths: string[]
  targetCustomer: string
  successCases: string[]
  description?: string
}

const DEFAULT_OUR_BUSINESS: OurBusiness = {
  serviceName: 'BGM（営業ターゲティングDB+CRM）',
  industry: 'B2B SaaS / 営業支援',
  strengths: [
    '日本の株式会社290万社の登記台帳をベースにした網羅性',
    '採用シグナル（求人インテント）を25部門に細分化して動的に把握',
    '本社電話・SNS・拠点・組織図まで深掘りエンリッチした営業対象6,000社以上',
  ],
  targetCustomer: '日本国内のB2Bセールス組織。特にエンタープライズ営業・ABM運用を行うチーム。',
  successCases: [],
  description:
    '営業ターゲット選定からアプローチまで、企業データとインテント情報を一元化して提供する。Front Office領域のカテゴリキングを目指す。',
}

function storePathFor(orgId?: string): string {
  const dir = process.cwd()
  const safeOrg = orgId ? orgId.replace(/[^a-zA-Z0-9_-]/g, '_') : 'default'
  return join(dir, `.our-business-${safeOrg}.json`)
}

export async function getOurBusiness(orgId?: string): Promise<OurBusiness> {
  try {
    const path = storePathFor(orgId)
    const content = await fs.readFile(path, 'utf-8')
    const parsed = JSON.parse(content) as Partial<OurBusiness>
    return {
      serviceName: parsed.serviceName ?? DEFAULT_OUR_BUSINESS.serviceName,
      industry: parsed.industry ?? DEFAULT_OUR_BUSINESS.industry,
      strengths: parsed.strengths ?? DEFAULT_OUR_BUSINESS.strengths,
      targetCustomer: parsed.targetCustomer ?? DEFAULT_OUR_BUSINESS.targetCustomer,
      successCases: parsed.successCases ?? [],
      description: parsed.description,
    }
  } catch {
    return DEFAULT_OUR_BUSINESS
  }
}

export async function setOurBusiness(orgId: string | undefined, data: OurBusiness): Promise<void> {
  const path = storePathFor(orgId)
  await fs.writeFile(path, JSON.stringify(data, null, 2), 'utf-8')
}

/** システムプロンプト用に整形 */
export function formatOurBusinessPrompt(b: OurBusiness): string {
  const lines: string[] = []
  lines.push('# 当社サービス')
  lines.push(`- サービス名: ${b.serviceName}`)
  lines.push(`- 業界: ${b.industry}`)
  if (b.description) lines.push(`- 概要: ${b.description}`)
  if (b.strengths.length > 0) {
    lines.push('- 強み・差別化ポイント:')
    for (const s of b.strengths) lines.push(`  - ${s}`)
  }
  lines.push(`- 想定顧客: ${b.targetCustomer}`)
  if (b.successCases.length > 0) {
    lines.push('- 過去の成功事例:')
    for (const c of b.successCases) lines.push(`  - ${c}`)
  }
  return lines.join('\n')
}
