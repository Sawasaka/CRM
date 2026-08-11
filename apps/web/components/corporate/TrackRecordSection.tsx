import type { ComponentType, SVGProps } from 'react'
import {
  ChartNoAxesCombined,
  Database,
  ExternalLink,
  Globe2,
  MonitorCog,
  Rocket,
  ShieldCheck,
  ShoppingCart,
  UsersRound,
} from 'lucide-react'
import { DocumentRequestButton } from './DocumentRequestButton'

type GrowthStageKey = 'launch' | 'growth' | 'infrastructure'

type ProjectIcon = ComponentType<SVGProps<SVGSVGElement> & { size?: number; strokeWidth?: number }>

function BaseballIcon({ size = 24, strokeWidth = 1.75, ...props }: SVGProps<SVGSVGElement> & { size?: number; strokeWidth?: number }) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M8 4.8c2.1 2 2.1 12.4 0 14.4M16 4.8c-2.1 2-2.1 12.4 0 14.4" />
      <path d="m7.2 7.1 2.1-.8M7 10.4l2.3-.4M7 13.6l2.3.4M7.2 16.9l2.1.8M16.8 7.1l-2.1-.8M17 10.4l-2.3-.4M17 13.6l-2.3.4M16.8 16.9l-2.1.8" />
    </svg>
  )
}

type TrackRecord = {
  number: string
  stage: GrowthStageKey
  sector: string
  role: string
  result: string
  description: string
  icon: ProjectIcon
  href?: string
}

const trackRecords: readonly TrackRecord[] = [
  {
    number: '01',
    stage: 'launch',
    sector: '外資系SaaS・日本法人立ち上げ',
    role: 'Sales Executive／正社員1人目',
    result: '約6カ月でARR約500万円',
    description: '日本市場の事業設計から、セキュリティ領域の営業開拓まで担当。',
    icon: Globe2,
  },
  {
    number: '02',
    stage: 'launch',
    sector: 'ITスタートアップ・創業期',
    role: '執行役員 CRO／正社員1人目',
    result: '月間登録者50名超',
    description: '営業・マーケティング基盤を0→1で構築し、登録上限まで成長。',
    icon: Rocket,
  },
  {
    number: '04',
    stage: 'infrastructure',
    sector: 'セキュリティ領域スタートアップ',
    role: 'マーケティング統括責任者',
    result: 'マーケティング基盤を一気通貫で構築',
    description: '戦略・ABM・IS・広告・SEO・HubSpotを横断設計。',
    icon: ShieldCheck,
  },
  {
    number: '07',
    stage: 'growth',
    sector: '売上2億円規模のマーケティング事業会社',
    role: '広告事業責任者',
    result: '広告設計から商談獲得までを統括',
    description: 'ペルソナ設計から広告・リード獲得・営業まで担当。',
    icon: ChartNoAxesCombined,
  },
  {
    number: '05',
    stage: 'infrastructure',
    sector: '人事コンサルティング企業',
    role: 'SEOディレクター',
    result: '複数キーワードで検索上位を獲得',
    description: '検索機会の分析と記事リライト施策を設計・推進。',
    icon: UsersRound,
  },
  {
    number: '06',
    stage: 'infrastructure',
    sector: '自社データベース型メディア',
    role: 'SEO／メディア運営',
    result: '公開14日以内に検索1位・5キーワード',
    description: '競合・検索意図・DB構造を設計し、コーシキベースを運営。',
    icon: Database,
    href: 'https://koshikibase.jp/',
  },
  {
    number: '08',
    stage: 'growth',
    sector: '情シス資産管理SaaS',
    role: 'フィールドセールス／カスタマーサクセス',
    result: '24社の業務DXコンサルティングを推進',
    description: '提案から検証導入、継続利用に向けた顧客支援までを担当。',
    icon: MonitorCog,
  },
  {
    number: '09',
    stage: 'growth',
    sector: 'ECコンサルティング企業',
    role: '事業推進',
    result: '参画初月に新規サービス受注を実現',
    description: '事業理解から営業活動、提案、受注までを短期間で推進。',
    icon: ShoppingCart,
  },
  {
    number: '03',
    stage: 'launch',
    sector: '中学野球クラブ',
    role: '統括責任者',
    result: '年商1,000万円超の運営規模へ',
    description: 'デジタルマーケティング戦略を導入し、集客・運営基盤を構築。',
    icon: BaseballIcon,
  },
] as const

const growthStages = [
  {
    key: 'launch',
    number: '01',
    label: 'GO-TO-MARKET',
    title: ['事業を', '立ち上げる'],
    description: undefined,
    approach: {
      model: 'Sales-led GTM × Wedgeモデル',
      purpose: 'グロースシグナル獲得戦略に採用',
    },
    tone: 'blue',
  },
  {
    key: 'infrastructure',
    number: '02',
    label: 'INFRASTRUCTURE',
    title: ['成長基盤を', 'つくる'],
    description: undefined,
    approach: {
      model: 'ベイズ × バンディット戦略',
      purpose: '施策ウェイトの最適化モデルとして採用',
    },
    tone: 'sage',
  },
  {
    key: 'growth',
    number: '03',
    label: 'GROWTH',
    title: ['売上を、', '仕組みで再現する。'],
    description: undefined,
    approach: {
      model: '識学 × 自己決定理論',
      purpose: '売上再現型・組織運営方式として採用',
    },
    tone: 'navy',
  },
] as const satisfies readonly {
  key: GrowthStageKey
  number: string
  label: string
  title: readonly string[]
  description?: string
  approach?: {
    model: string
    purpose: string
  }
  tone: 'blue' | 'sage' | 'navy'
}[]

const stageStyles = {
  blue: {
    shell: 'border-[#c9dfe9] bg-white',
    intro: 'border-[#c9dfe9] bg-[#f2f8fb]',
    eyebrow: 'text-[#0b6fb7]',
    number: 'text-[#0b6fb7]/[0.07]',
    title: 'text-[#123b59]',
    body: 'text-[#587383]',
    divider: 'divide-[#dceaf1]',
    project: 'text-[#0b6fb7]',
    icon: 'border-[#b9d8e8] bg-white text-[#0b6fb7]',
    role: 'text-[#638194]',
    result: 'text-[#123b59]',
    link: 'text-[#0b6fb7] hover:text-[#07588f]',
    separator: 'border-[#c9dfe9]',
    approach: 'border-[#8fc5df] text-[#0b5f99]',
    approachLabel: 'text-[#0b6fb7]',
  },
  sage: {
    shell: 'border-[#cfe0d9] bg-[#fbfdfc]',
    intro: 'border-[#cfe0d9] bg-[#edf5f1]',
    eyebrow: 'text-[#2f7f71]',
    number: 'text-[#2f7f71]/[0.08]',
    title: 'text-[#123b59]',
    body: 'text-[#587383]',
    divider: 'divide-[#d7e5df]',
    project: 'text-[#2f7f71]',
    icon: 'border-[#b9d4ca] bg-white text-[#2f7f71]',
    role: 'text-[#56756d]',
    result: 'text-[#123b59]',
    link: 'text-[#2f7f71] hover:text-[#1f5d53]',
    separator: 'border-[#cfe0d9]',
    approach: 'border-[#8dbbad] text-[#225f55]',
    approachLabel: 'text-[#2f7f71]',
  },
  navy: {
    shell: 'border-[#123b59] bg-[#123b59]',
    intro: 'border-white/15 bg-[#0d3551]',
    eyebrow: 'text-[#8dc8ea]',
    number: 'text-white/[0.05]',
    title: 'text-white',
    body: 'text-[#c8dce8]',
    divider: 'divide-white/15',
    project: 'text-[#8dc8ea]',
    icon: 'border-white/20 bg-white/[0.04] text-[#8dc8ea]',
    role: 'text-[#a9c8d9]',
    result: 'text-white',
    link: 'text-[#8dc8ea] hover:text-white',
    separator: 'border-white/20',
    approach: 'border-[#8dc8ea] text-white',
    approachLabel: 'text-[#8dc8ea]',
  },
} as const

function GrowthStage({ stage }: { stage: (typeof growthStages)[number] }) {
  const styles = stageStyles[stage.tone]
  const projects = trackRecords.filter((item) => item.stage === stage.key)

  return (
    <section className={`overflow-hidden border ${styles.shell}`} aria-labelledby={`growth-stage-${stage.number}`}>
      <div className="grid lg:grid-cols-[0.43fr_1fr]">
        <div className={`relative overflow-hidden border-b p-7 sm:p-9 lg:border-b-0 lg:border-r lg:p-10 ${styles.intro}`}>
          <span className={`pointer-events-none absolute -bottom-9 -right-1 [font-family:'Yu_Mincho','Hiragino_Mincho_ProN',serif] text-[9rem] font-semibold leading-none ${styles.number}`} aria-hidden="true">
            {stage.number}
          </span>
          <p className={`relative z-[1] text-[9px] font-bold tracking-[0.24em] ${styles.eyebrow}`}>STAGE {stage.number} / {stage.label}</p>
          <h3 id={`growth-stage-${stage.number}`} className={`relative z-[1] mt-6 [font-family:'Yu_Mincho','Hiragino_Mincho_ProN',serif] text-[1.8rem] font-semibold leading-[1.5] tracking-[-0.03em] sm:text-[2.15rem] lg:text-[1.875rem] ${styles.title}`}>
            {stage.title.map((line) => (
              <span key={line} className="block whitespace-nowrap">{line}</span>
            ))}
          </h3>
          {stage.description ? <p className={`relative z-[1] mt-5 max-w-sm text-sm leading-7 ${styles.body}`}>{stage.description}</p> : null}
          {stage.approach ? (
            <div className={`relative z-[1] mt-7 border-t pt-5 ${styles.approach}`}>
              <p className={`text-[8px] font-bold tracking-[0.24em] ${styles.approachLabel}`}>STRATEGIC MODEL</p>
              <p className="mt-3 text-[13px] font-bold leading-6 tracking-[0.01em] sm:text-sm">「{stage.approach.model}」</p>
              <p className={`mt-2 text-[11px] font-semibold leading-5 ${styles.body}`}>{stage.approach.purpose}</p>
            </div>
          ) : null}
          {stage.key === 'growth' ? (
            <div className="relative z-[1] mt-6 max-w-[220px]">
              <DocumentRequestButton documentType="gtm" variant="navy" />
            </div>
          ) : null}
        </div>

        <div className={`divide-y ${styles.divider}`}>
          {projects.map((project) => {
            const ProjectIcon = project.icon

            return (
              <article key={project.number} className="grid gap-5 px-6 py-7 sm:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] sm:items-center sm:px-8 sm:py-8 lg:grid-cols-[minmax(0,0.72fr)_minmax(0,1.28fr)] lg:px-10">
                <div className="flex items-start gap-4">
                  <span className={`grid h-10 w-10 shrink-0 place-items-center border ${styles.icon}`}>
                    <ProjectIcon aria-hidden="true" size={22} strokeWidth={1.65} />
                  </span>
                  <div className="min-w-0">
                    <p className={`text-[9px] font-bold tracking-[0.2em] ${styles.project}`}>PROJECT {project.number}</p>
                    <p className={`mt-2 text-[11px] font-bold leading-5 lg:whitespace-nowrap ${styles.title}`}>{project.sector}</p>
                    <p className={`mt-1 text-[10px] font-semibold leading-5 tracking-[0.04em] ${styles.role}`}>{project.role}</p>
                  </div>
                </div>
                <div className={`sm:border-l sm:pl-7 ${styles.separator}`}>
                  <h4 className={`[font-family:'Yu_Mincho','Hiragino_Mincho_ProN',serif] text-[1.3rem] font-semibold leading-[1.55] tracking-[-0.025em] sm:text-[1.5rem] lg:whitespace-nowrap lg:text-[1.25rem] ${styles.result}`}>
                    {project.result}
                  </h4>
                  <p className={`mt-3 text-xs leading-6 sm:text-[13px] lg:whitespace-nowrap lg:text-xs ${styles.body}`}>{project.description}</p>
                  {project.href ? (
                    <a href={project.href} target="_blank" rel="noopener noreferrer" className={`mt-4 inline-flex items-center gap-2 text-[11px] font-bold transition-colors ${styles.link}`}>
                      コーシキベースを見る
                      <ExternalLink size={13} />
                    </a>
                  ) : null}
                </div>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export function TrackRecordSection() {
  return (
    <section id="track-record" className="mt-5 scroll-mt-24 overflow-hidden border-y border-[#dfe9e4] bg-[#f8faf9] py-16 sm:mt-8 sm:py-24 lg:mt-10 lg:py-28">
      <div className="mx-auto w-full max-w-[1240px] px-5 sm:px-8 lg:px-10">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-end lg:gap-20">
          <div>
            <div className="flex items-center gap-4 text-[10px] font-bold tracking-[0.24em] text-[#2f7f71]">
              <span className="h-px w-10 bg-[#67aa9a]" />
              PROJECT TRACK RECORD
            </div>
            <h2 className="mt-7 [font-family:'Yu_Mincho','Hiragino_Mincho_ProN',serif] text-[clamp(1.35rem,6.75vw,2.15rem)] font-semibold leading-[1.45] tracking-[-0.03em] text-[#123b59] sm:text-5xl sm:leading-[1.4]">
              事業成長を、<br />3ステージで再現する。
            </h2>
          </div>
          <p className="max-w-2xl text-sm leading-8 text-[#587383] sm:text-[15px]">
            データの収集設計と仕組み化で、事業成長を再現するインフラを構築。<br className="hidden lg:block" />
            立ち上げ・成長基盤・売上創出の実績を、3ステージで紹介します。
          </p>
        </div>

        <div className="mt-12 space-y-5 sm:mt-14 sm:space-y-6">
          {growthStages.map((stage) => <GrowthStage key={stage.key} stage={stage} />)}
        </div>

        <p className="mt-6 border-t border-[#dbe6e0] pt-6 text-[10px] leading-6 tracking-[0.06em] text-[#7893a2]">
          ※ 守秘義務に配慮し、企業名を非公開としたうえで、実際に担当した役割と成果を掲載しています。
        </p>
      </div>
    </section>
  )
}
