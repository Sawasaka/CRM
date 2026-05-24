import { Eyebrow, NebulaBG, Section } from './atoms'

/**
 * ROI / Double Cost Comparison
 *
 * 30名規模の月額で、本当の競合 2 パターンと並べて比較する。
 * 合計や削減%は出さず、「対して、ルキスマCRM は使ったクレジット分だけ」を
 * 訴求するレイアウトに刷新。
 *
 *   A. 他社 SaaS 3ツール契約 (30名)
 *       - HubSpot Starter Plan (CRM)          90,000円
 *       - Salesforce Sales Cloud Pro (営業)   450,000円
 *       - SalesNow (企業DB)                   150,000円
 *
 *   B. 自社で内製する場合 (30名・最低限の運用)
 *       - AWS S3 + 周辺インフラ                30,000円
 *       - AI API (Gemini 2.5 Flash Lite / GPT-4o mini)                            90,000円
 *       - 開発者人件費 (1人 × 0.5人月、月額 300,000円 相当)                         150,000円
 *
 * vs ルキスマCRM は cost-plus モデルでクレジット課金のみ。固定費・シート
 * 単価を持たないため、上記いずれと比べても「使った分だけ」が成立する。
 */

type Row = { t: string; s: string; v: string; isTotal?: boolean }

const others: Row[] = [
  { t: 'HubSpot / Salesforce', s: 'CRM ／ 3,000円 × 30名',          v: '90,000円' },
  { t: 'SalesNow',             s: '企業DB ／ 月額固定費',             v: '150,000円' },
  { t: '合計',                  s: '',                                v: '240,000円', isTotal: true },
]

const inhouse: Row[] = [
  { t: 'インフラ・API', s: 'AWS S3 ／ 企業DB ／ LLM (Gemini / GPT)', v: '100,000円' },
  { t: '開発費',        s: '開発者 1 名 × 1 人月',                  v: '500,000円' },
  { t: '合計',          s: '',                                    v: '600,000円', isTotal: true },
]

const ComparisonCard = ({
  eyebrow,
  rows,
  pitch,
}: {
  eyebrow: string
  rows: Row[]
  /** バナー本文 (1 行・カード別) */
  pitch: string
}) => (
  <div className="rounded-3xl bg-dusk p-7 fo-glass-rim relative overflow-hidden flex flex-col">
    <div className="flex items-baseline justify-between gap-3">
      <div className="font-semibold uppercase tracking-[0.14em] text-[0.7rem] text-aurora">{eyebrow}</div>
      <div className="text-[0.62rem] uppercase tracking-[0.14em] text-[#7e7c83] whitespace-nowrap">
        30名 ／ 月額
      </div>
    </div>

    {/* 競合項目 + 合計 */}
    <div className="mt-6 space-y-1 flex-1">
      {rows.map((r, i) => (
        <div
          key={i}
          className="flex items-center justify-between"
          style={
            r.isTotal
              ? {
                  marginTop: '8px',
                  paddingTop: '14px',
                  paddingBottom: '4px',
                  borderTop: '1px solid rgba(171,199,255,0.22)',
                }
              : {
                  paddingTop: '10px',
                  paddingBottom: '10px',
                  borderTop: i === 0 ? 'none' : '1px solid rgba(171,199,255,0.06)',
                }
          }
        >
          <div className="min-w-0 pr-3">
            <div
              className={
                r.isTotal
                  ? 'text-[0.78rem] uppercase tracking-[0.14em] text-[#9b99a0]'
                  : 'text-[0.95rem] text-[#e7e5ea] font-medium tracking-[-0.01em]'
              }
            >
              {r.t}
            </div>
            {r.s && (
              <div className="text-[11px] text-[#7e7c83] mt-1 leading-relaxed">{r.s}</div>
            )}
          </div>
          <div
            className={
              r.isTotal
                ? 'font-display font-bold text-[1.25rem] whitespace-nowrap tabular-nums fo-gradient-text'
                : 'font-mono text-[#c7c5c9] text-[0.95rem] whitespace-nowrap tabular-nums'
            }
          >
            {r.v}
          </div>
        </div>
      ))}
    </div>

    {/* ルキスマCRM の差別化バナー — 1 行の core pitch (カード別に微差) */}
    <div
      className="rounded-2xl mt-6 p-[1px]"
      style={{ background: 'linear-gradient(135deg, rgba(171,199,255,0.6), rgba(0,113,227,0.32), transparent 70%)' }}
    >
      <div className="rounded-2xl bg-pitch px-6 py-6 text-center fo-glass-rim relative overflow-hidden">
        <div
          className="absolute -top-16 -right-16 w-48 h-48 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(171,199,255,0.18), transparent 60%)', filter: 'blur(40px)' }}
        />
        <div className="relative text-[10px] uppercase tracking-[0.18em] text-aurora opacity-80">
          対して、ルキスマCRM
        </div>
        <div className="relative mt-3 font-display font-bold text-[1.6rem] md:text-[2rem] leading-[1.15] tracking-[-0.01em] fo-gradient-text">
          {pitch}
        </div>
      </div>
    </div>
  </div>
)

export const ROISection = () => {
  return (
    <Section tone="pitch" screenLabel="13 ROI / Double Comparison" className="relative overflow-hidden">
      {/* top divider */}
      <div
        className="h-px w-full"
        style={{
          background:
            'linear-gradient(90deg, transparent 0%, rgba(171,199,255,0.08) 20%, rgba(171,199,255,0.20) 50%, rgba(171,199,255,0.08) 80%, transparent 100%)',
        }}
      />
      <NebulaBG intensity={0.6} />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at 50% 0%, rgba(171,199,255,0.06) 0%, transparent 60%), linear-gradient(180deg, rgba(0,113,227,0.04) 0%, transparent 30%, transparent 70%, rgba(171,199,255,0.03) 100%)',
        }}
      />

      <div className="relative mx-auto max-w-6xl px-6 py-28 md:py-36">
        {/* Header */}
        <div className="max-w-3xl">
          <Eyebrow color="#abc7ff">ROI</Eyebrow>
          <h2 className="font-display font-bold tracking-[-0.025em] text-[2.4rem] md:text-[3.2rem] leading-[1.04] mt-5">
            <span className="fo-gradient-text">ルキスマCRM は、</span>
            <br />
            <span className="fo-gradient-text-soft">こんなにお得</span>。
          </h2>
        </div>

        {/* Two comparison cards */}
        <div className="grid md:grid-cols-2 gap-6 mt-12 items-stretch">
          <ComparisonCard
            eyebrow="VS 他社 CRM"
            rows={others}
            pitch="使うクレジット分だけ。"
          />
          <ComparisonCard
            eyebrow="VS 自社開発"
            rows={inhouse}
            pitch="使うクレジット分だけ。"
          />
        </div>
      </div>

      {/* bottom divider */}
      <div
        className="relative h-px w-full"
        style={{
          background:
            'linear-gradient(90deg, transparent 0%, rgba(171,199,255,0.06) 20%, rgba(171,199,255,0.15) 50%, rgba(171,199,255,0.06) 80%, transparent 100%)',
        }}
      />
    </Section>
  )
}
