'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronLeft, ExternalLink, MapPin, Phone, Mail, Building2, Copy, Check } from 'lucide-react'
import {
  ObsCard,
  ObsChip,
  ObsDefList,
  ObsHero,
  ObsPageShell,
  ObsSectionHeader,
} from '@/components/obsidian'

// 型：API レスポンスの構造（ゆるめ）
type Raw = {
  id: string
  name: string
  nameKana?: string | null
  corporateNumber?: string | null
  corporateType?: string | null
  websiteUrl?: string | null
  prefecture?: string | null
  city?: string | null
  address?: string | null
  employeeCount?: string | null
  revenue?: string | null
  representative?: string | null
  representativePhone?: string | null
  representativeEmail?: string | null
  serviceSummary?: string | null
  companyFeatures?: string | null
  enrichmentStatus?: string | null
  lastCrawledAt?: string | null
  lastEnrichedAt?: string | null
  createdAt?: string | null
  updatedAt?: string | null
  industry?: { name: string; category?: string | null } | null
  serviceTags?: Array<{ tag: { name: string } }>
  // v2 追加（companies テーブル直）
  hqPhone?: string | null
  twitterUrl?: string | null
  linkedinUrl?: string | null
  facebookUrl?: string | null
  youtubeUrl?: string | null
  instagramUrl?: string | null
  githubUrl?: string | null
  noteUrl?: string | null
  // gBizINFO 由来
  establishedAt?: string | null
  capitalStock?: number | null
  representativeName?: string | null
  gbizIndustryCode?: string | null
  businessItems?: string | null
  isAbmSource?: boolean
  offices?: Array<{
    id: string
    name: string
    officeType: string
    prefecture: string | null
    city: string | null
    address: string | null
    phone: string | null
    deptPhones?: Record<string, string> | null
    isPrimary: boolean
  }>
  departments?: Array<{
    id: string
    name: string
    departmentType: string | null
    phone: string | null
    email: string | null
    contactPersonName: string | null
    contactPersonTitle: string | null
    headcount: string | null
    parentDepartmentId?: string | null
    hierarchyLevel?: number | null
    sourceUrl?: string | null
    officeId?: string | null
  }>
  companyIntents?: Array<{
    intentLevel: 'HOT' | 'MIDDLE' | 'LOW' | 'NONE'
    departmentType: string
    signalCount: number
    latestSignalAt: string | null
  }>
  intentSignals?: Array<{
    id: string
    title: string
    signalType: string
    source: string
    sourceUrl: string
    publishedAt: string | null
    departmentType: string | null
  }>
  // CRM 連携：この企業に紐づく取引・コンタクト
  deals?: Array<{
    id: string
    name: string
    stage: string
    amount: number | null
    probability: number | null
    expectedCloseAt: string | null
    createdAt: string | null
    updatedAt: string | null
    ownerName: string | null
  }>
  contacts?: Array<{
    id: string
    name: string
    title: string | null
    department: string | null
    email: string | null
    phone: string | null
    isDecisionMaker: boolean
  }>
}

// 25部門細分化ラベル
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
  legal: '法務', management: '経営', rd: 'R&D', operations: '運用', engineering: '技術', other: 'その他',
}
function deptLabel(t: string | null | undefined): string {
  if (!t) return '—'
  return DEPT_LABELS[t] ?? t
}

function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleDateString('ja-JP', { year: 'numeric', month: 'short', day: 'numeric' })
  } catch {
    return '—'
  }
}

function extractDomain(url: string | null | undefined): string {
  if (!url) return ''
  try {
    const u = new URL(url.startsWith('http') ? url : `https://${url}`)
    return u.hostname.replace(/^www\./, '')
  } catch {
    return url
  }
}

// クロール／エンリッチ過程で保存された "UNKNOWN_xxxx" や AI 由来のメタ説明文（"推定に基づく〜"等）は
// 実体がない値なので画面では `—` に正規化する。
function clean(value: string | null | undefined): string {
  if (!value) return '—'
  const v = value.trim()
  if (!v) return '—'
  if (/^UNKNOWN[_\-:]/i.test(v)) return '—'
  if (v.startsWith('推定に基づく')) return '—'
  if (v.includes('記載なし') && v.length > 20) return '—'
  return v
}

// 住所は prefecture/city/address を結合するが、メタ文（推定に基づく〜・記載なしを含む長文）は除外
function buildAddress(
  prefecture: string | null | undefined,
  city: string | null | undefined,
  address: string | null | undefined,
): string {
  const prf = clean(prefecture)
  const cty = clean(city)
  const adr = clean(address)
  return [prf, cty, adr].filter((s) => s !== '—').join('')
}

// 取引ステージのラベル / トーン（/pipeline ページの STAGES と完全に揃える）
const DEAL_STAGE_META: Record<string, { label: string; tone: 'hot' | 'middle' | 'low' | 'neutral' | 'primary' }> = {
  IS:               { label: 'IS',             tone: 'neutral' },
  NURTURING:        { label: 'ナーチャリング', tone: 'primary' },
  MEETING_PLANNED:  { label: '商談予定',       tone: 'primary' },
  MEETING_DONE:     { label: '商談済み',       tone: 'primary' },
  PROJECT_PLANNED:  { label: 'PJ化予定あり',   tone: 'low' },
  MULTI_MEETING:    { label: '複数商談済み',   tone: 'middle' },
  POC:              { label: 'POC',            tone: 'middle' },
  CLOSED_WON:       { label: '受注',           tone: 'low' },
  LOST_DEAL:        { label: '失注',           tone: 'hot' },
  CHURN:            { label: 'チャーン',       tone: 'hot' },
  LOST:             { label: 'ロスト',         tone: 'neutral' },
  // Prisma の DealStage enum 由来のキーが入っても落ちないようフォールバックを用意
  NEW_LEAD:         { label: 'IS',             tone: 'neutral' },
  QUALIFIED:        { label: '商談予定',       tone: 'primary' },
  FIRST_MEETING:    { label: '商談予定',       tone: 'primary' },
  SOLUTION_FIT:     { label: 'PJ化予定あり',   tone: 'low' },
  PROPOSAL:         { label: '複数商談済み',   tone: 'middle' },
  NEGOTIATION:      { label: 'POC',            tone: 'middle' },
  VERBAL_COMMIT:    { label: 'POC',            tone: 'middle' },
  CLOSED_LOST:      { label: '失注',           tone: 'hot' },
}
function dealStageMeta(stage: string | null | undefined) {
  if (!stage) return { label: '—', tone: 'neutral' as const }
  return DEAL_STAGE_META[stage] ?? { label: stage, tone: 'neutral' as const }
}

const INTENT_LABEL: Record<string, { tone: 'hot' | 'middle' | 'low' | 'neutral'; text: string }> = {
  HOT: { tone: 'hot', text: '● HOT' },
  MIDDLE: { tone: 'middle', text: '● MIDDLE' },
  LOW: { tone: 'low', text: '● LOW' },
  NONE: { tone: 'neutral', text: '—' },
}

const EMPTY_DEALS: NonNullable<Raw['deals']> = []
const EMPTY_CONTACTS: NonNullable<Raw['contacts']> = []

export default function CompanyDetailClient({
  id,
  initialData,
}: {
  id: string
  initialData: Raw | null
}) {
  void id
  const c = initialData
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null)

  async function copyEmail(email: string) {
    try {
      await navigator.clipboard.writeText(email)
      setCopiedEmail(email)
      setTimeout(() => setCopiedEmail((cur) => (cur === email ? null : cur)), 1500)
    } catch (err) {
      console.error('failed to copy email', err)
    }
  }

  // 初期データが無い（モックIDなど）場合
  if (!c) {
    return (
      <ObsPageShell>
        <div className="w-full px-8 xl:px-12 2xl:px-16 py-20 text-center">
          <p className="text-sm" style={{ color: 'var(--color-obs-text-muted)' }}>
            企業が見つかりません
          </p>
          <div className="mt-6">
            <Link href="/companies" className="text-sm underline" style={{ color: 'var(--color-obs-primary)' }}>
              企業一覧に戻る
            </Link>
          </div>
        </div>
      </ObsPageShell>
    )
  }

  const addrParts = buildAddress(c.prefecture, c.city, c.address)
  const domain = extractDomain(c.websiteUrl)

  return (
    <ObsPageShell>
      <div className="w-full px-8 xl:px-12 2xl:px-16 pb-24">
        {/* ── Back link ── */}
        <div className="pt-6 pb-2">
          <Link
            href="/companies"
            className="inline-flex items-center gap-1.5 text-sm transition-colors duration-150"
            style={{ color: 'var(--color-obs-text-subtle)' }}
          >
            <ChevronLeft size={14} />
            企業一覧
          </Link>
        </div>

        {/* ── Hero ── */}
        <ObsHero
          eyebrow={c.industry?.name ?? 'Company Master'}
          title={c.name}
          caption={c.updatedAt ? `データ更新日 ${formatDate(c.updatedAt)}` : ''}
        />

        {/* ── 3-col grid ── */}
        <div className="grid grid-cols-12 gap-6 mt-6">
          {/* メインカラム */}
          <div className="col-span-12 lg:col-span-8 flex flex-col gap-6">
            {/* 事業内容・特徴 */}
            {(c.serviceSummary || c.companyFeatures) && (
              <ObsCard depth="high" padding="lg">
                <ObsSectionHeader title="About" caption="事業内容と特徴" />
                {c.serviceSummary && (
                  <p className="text-[15px] leading-relaxed mb-4" style={{ color: 'var(--color-obs-text)' }}>
                    {c.serviceSummary}
                  </p>
                )}
                {c.companyFeatures && (
                  <p className="text-[13px] leading-relaxed" style={{ color: 'var(--color-obs-text-muted)' }}>
                    {c.companyFeatures}
                  </p>
                )}
              </ObsCard>
            )}

            {/* 基本情報 */}
            <ObsCard depth="high" padding="lg">
              <ObsSectionHeader title="基本情報" />
              <ObsDefList
                columns={2}
                items={[
                  { label: '正式名称', value: clean(c.name) },
                  { label: '法人番号', value: clean(c.corporateNumber) },
                  {
                    label: '公式サイト',
                    value: c.websiteUrl ? (
                      <a
                        href={c.websiteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 transition-colors"
                        style={{ color: 'var(--color-obs-primary)' }}
                      >
                        {domain || c.websiteUrl}
                        <ExternalLink size={12} />
                      </a>
                    ) : (
                      '—'
                    ),
                  },
                  {
                    label: '住所',
                    value: addrParts ? (
                      <span className="inline-flex items-start gap-1.5">
                        <MapPin size={13} className="mt-[3px] shrink-0" style={{ color: 'var(--color-obs-text-subtle)' }} />
                        {addrParts}
                      </span>
                    ) : (
                      '—'
                    ),
                  },
                  { label: '従業員数', value: clean(c.employeeCount) },
                  { label: '売上', value: clean(c.revenue) },
                  ...(c.isAbmSource
                    ? [
                        {
                          label: '本社代表電話',
                          value: c.hqPhone ? (
                            <span className="inline-flex items-center gap-1.5">
                              <Phone size={13} style={{ color: 'var(--color-obs-text-subtle)' }} />
                              {c.hqPhone}
                            </span>
                          ) : (
                            '—'
                          ),
                        },
                        {
                          label: '設立日',
                          value: c.establishedAt
                            ? new Date(c.establishedAt).toLocaleDateString('ja-JP', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                              })
                            : '—',
                        },
                      ]
                    : [
                        {
                          label: '代表電話',
                          value: c.representativePhone ? (
                            <span className="inline-flex items-center gap-1.5">
                              <Phone size={13} style={{ color: 'var(--color-obs-text-subtle)' }} />
                              {c.representativePhone}
                            </span>
                          ) : (
                            '—'
                          ),
                        },
                        {
                          label: '代表メール',
                          value: c.representativeEmail ? (
                            <span className="inline-flex items-center gap-1.5">
                              <Mail size={13} style={{ color: 'var(--color-obs-text-subtle)' }} />
                              {c.representativeEmail}
                            </span>
                          ) : (
                            '—'
                          ),
                        },
                      ]),
                ]}
              />
            </ObsCard>

            {/* 拠点一覧 */}
            <ObsCard depth="high" padding="lg">
              <ObsSectionHeader title="拠点" caption={`${c.offices?.length ?? 0}件`} />
              {!c.offices || c.offices.length === 0 ? (
                <p className="text-sm" style={{ color: 'var(--color-obs-text-subtle)' }}>
                  拠点データなし
                </p>
              ) : (
                <div className="flex flex-col gap-2">
                  {c.offices.map((o) => (
                    <ObsCard key={o.id} depth="low" padding="md" radius="md">
                      <div className="flex items-start gap-4">
                        <div
                          className="w-10 h-10 rounded-[var(--radius-obs-md)] flex items-center justify-center shrink-0"
                          style={{ backgroundColor: 'var(--color-obs-surface-highest)' }}
                        >
                          <Building2 size={18} style={{ color: 'var(--color-obs-text-muted)' }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium" style={{ color: 'var(--color-obs-text)' }}>
                              {o.name}
                            </span>
                            {o.isPrimary && <ObsChip tone="primary">本社</ObsChip>}
                            <ObsChip tone="neutral">{o.officeType}</ObsChip>
                          </div>
                          <p className="text-xs" style={{ color: 'var(--color-obs-text-muted)' }}>
                            {[o.prefecture, o.city, o.address].filter(Boolean).join(' ')}
                          </p>
                          {o.phone && (
                            <p className="text-xs mt-1 inline-flex items-center gap-1" style={{ color: 'var(--color-obs-text-subtle)' }}>
                              <Phone size={11} /> {o.phone}
                            </p>
                          )}
                          {o.deptPhones && Object.keys(o.deptPhones).length > 0 && (
                            <div className="mt-2 flex flex-col gap-1">
                              {Object.entries(o.deptPhones).map(([dept, phone]) => (
                                <p key={dept} className="text-xs inline-flex items-center gap-1" style={{ color: 'var(--color-obs-text-muted)' }}>
                                  <Phone size={10} style={{ color: 'var(--color-obs-text-subtle)' }} />
                                  <span style={{ color: 'var(--color-obs-text-subtle)' }}>{dept}：</span>
                                  {phone}
                                </p>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </ObsCard>
                  ))}
                </div>
              )}
            </ObsCard>


            {/* インテントシグナル履歴 */}
            {c.intentSignals && c.intentSignals.length > 0 && (
              <ObsCard depth="high" padding="lg">
                <ObsSectionHeader title="採用シグナル履歴" caption={`最新 ${c.intentSignals.length}件`} />
                <div className="flex flex-col">
                  {c.intentSignals.map((s, i) => {
                    // sourceUrl はサーバー側（page.tsx）で raw_data.original_url を
                    // 優先採用済み。ここでは http(s) の実URLのみリンク化する。
                    const hasUrl = !!s.sourceUrl && /^https?:\/\//i.test(s.sourceUrl)
                    const Wrapper = hasUrl ? 'a' : 'div'
                    const wrapperProps = hasUrl
                      ? {
                          href: s.sourceUrl,
                          target: '_blank',
                          rel: 'noopener noreferrer',
                        }
                      : {}
                    return (
                      <Wrapper
                        key={s.id}
                        {...wrapperProps}
                        className={`flex items-center gap-3 px-2 py-2.5 rounded-[8px] transition-colors duration-150 group ${
                          hasUrl ? 'cursor-pointer' : ''
                        }`}
                        style={{
                          borderTop: i === 0 ? 'none' : undefined,
                          transitionTimingFunction: 'var(--ease-liquid)',
                        }}
                        onMouseOver={(e) => {
                          if (hasUrl) {
                            (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--color-obs-surface-highest)'
                          }
                        }}
                        onMouseOut={(e) => {
                          (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'
                        }}
                        title={hasUrl ? `${s.sourceUrl} を新しいタブで開く` : 'リンク情報なし'}
                      >
                        <ObsChip tone="neutral">{s.signalType}</ObsChip>
                        <span
                          className="flex-1 text-sm truncate"
                          style={{
                            color: hasUrl ? 'var(--color-obs-text)' : 'var(--color-obs-text-muted)',
                          }}
                        >
                          {s.title}
                        </span>
                        {hasUrl && (
                          <ExternalLink
                            size={11}
                            className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                            style={{ color: 'var(--color-obs-primary)' }}
                          />
                        )}
                        <span className="text-xs shrink-0 whitespace-nowrap" style={{ color: 'var(--color-obs-text-subtle)' }}>
                          {deptLabel(s.departmentType)}
                        </span>
                        <span
                          className="text-xs shrink-0 tabular-nums whitespace-nowrap"
                          style={{ color: 'var(--color-obs-text-subtle)' }}
                        >
                          {formatDate(s.publishedAt)}
                        </span>
                      </Wrapper>
                    )
                  })}
                </div>
              </ObsCard>
            )}
          </div>

          {/* サイドカラム */}
          <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
            {/* 取引（紐づくDeal） — 最上部 */}
            {(() => {
              const realDeals = c.deals && c.deals.length > 0 ? c.deals : null
              const dealsToShow = realDeals ?? EMPTY_DEALS
              return (
                <ObsCard depth="high" padding="lg">
                  <ObsSectionHeader
                    title="取引"
                    caption={`${dealsToShow.length}件`}
                  />
                  <div className="flex flex-col gap-2">
                    {dealsToShow.map((d) => {
                      const meta = dealStageMeta(d.stage)
                      return (
                        <Link
                          key={d.id}
                          href={`/deals/${d.id}`}
                          className="group flex flex-col gap-1 rounded-[var(--radius-obs-md)] px-3 py-2 transition-colors"
                          style={{ backgroundColor: 'var(--color-obs-surface-low)' }}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span
                              className="flex-1 text-sm truncate group-hover:underline"
                              style={{ color: 'var(--color-obs-text)', textUnderlineOffset: '3px' }}
                              title={d.name}
                            >
                              {d.name}
                            </span>
                            <ObsChip tone={meta.tone}>{meta.label}</ObsChip>
                          </div>
                          <div
                            className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px]"
                            style={{ color: 'var(--color-obs-text-subtle)' }}
                          >
                            <span className="tabular-nums">作成 {formatDate(d.createdAt)}</span>
                            <span>·</span>
                            <span>{d.ownerName ?? '—'}</span>
                          </div>
                        </Link>
                      )
                    })}
                  </div>
                </ObsCard>
              )
            })()}

            {/* コンタクト（紐づくContact） — 取引の直下 */}
            {(() => {
              const realContacts = c.contacts && c.contacts.length > 0 ? c.contacts : null
              const contactsToShow = realContacts ?? EMPTY_CONTACTS
              return (
                <ObsCard depth="high" padding="lg">
                  <ObsSectionHeader
                    title="コンタクト"
                    caption={`${contactsToShow.length}名`}
                  />
                  <div className="flex flex-col gap-2">
                    {contactsToShow.map((p) => (
                      <div
                        key={p.id}
                        className="group flex items-start gap-3 rounded-[var(--radius-obs-md)] px-3 py-2 transition-colors"
                        style={{ backgroundColor: 'var(--color-obs-surface-low)' }}
                      >
                        <Link
                          href={`/contacts/${p.id}`}
                          className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-semibold shrink-0 hover:opacity-80 transition-opacity"
                          style={{
                            backgroundColor: 'var(--color-obs-primary-container)',
                            color: 'var(--color-obs-on-primary)',
                          }}
                        >
                          {p.name.slice(0, 1)}
                        </Link>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <Link
                              href={`/contacts/${p.id}`}
                              className="text-sm truncate hover:underline"
                              style={{ color: 'var(--color-obs-text)', textUnderlineOffset: '3px' }}
                            >
                              {p.name}
                            </Link>
                            {p.isDecisionMaker && <ObsChip tone="hot">決裁</ObsChip>}
                          </div>
                          <div
                            className="text-[11px] truncate"
                            style={{ color: 'var(--color-obs-text-subtle)' }}
                          >
                            {[p.department, p.title].filter(Boolean).join(' · ') || '—'}
                          </div>
                          {p.email && (
                            <div
                              className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] mt-1"
                              style={{ color: 'var(--color-obs-text-subtle)' }}
                            >
                              <button
                                type="button"
                                onClick={() => copyEmail(p.email!)}
                                title={
                                  copiedEmail === p.email
                                    ? 'コピーしました'
                                    : 'メールアドレスをコピー'
                                }
                                className="inline-flex items-center gap-1 max-w-full px-1.5 py-0.5 -mx-1.5 -my-0.5 rounded-[6px] hover:bg-[var(--color-obs-surface)] hover:text-[var(--color-obs-text)] transition-colors"
                              >
                                <Mail size={10} className="shrink-0" />
                                <span className="truncate">{p.email}</span>
                                {copiedEmail === p.email ? (
                                  <Check
                                    size={10}
                                    className="shrink-0"
                                    style={{ color: 'var(--color-obs-low)' }}
                                  />
                                ) : (
                                  <Copy
                                    size={10}
                                    className="shrink-0 opacity-50 group-hover:opacity-100 transition-opacity"
                                  />
                                )}
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </ObsCard>
              )
            })()}

            {/* インテント集約 */}
            <ObsCard depth="high" padding="lg">
              <ObsSectionHeader title="インテント" caption="部門別の採用動向" />
              {!c.companyIntents || c.companyIntents.length === 0 ? (
                <p className="text-sm" style={{ color: 'var(--color-obs-text-subtle)' }}>
                  インテントデータなし
                </p>
              ) : (
                <div className="flex flex-col gap-3">
                  {c.companyIntents.map((ci, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <ObsChip tone={INTENT_LABEL[ci.intentLevel]?.tone ?? 'neutral'}>
                        {ci.intentLevel}
                      </ObsChip>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm" style={{ color: 'var(--color-obs-text)' }}>
                          {deptLabel(ci.departmentType)}
                        </div>
                        <div className="text-[11px]" style={{ color: 'var(--color-obs-text-subtle)' }}>
                          {ci.signalCount}シグナル · {ci.latestSignalAt ? formatDate(ci.latestSignalAt) : '—'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ObsCard>

          </div>
        </div>
      </div>
    </ObsPageShell>
  )
}
