import { Eyebrow, NebulaBG, Section } from './atoms'

/**
 * ROI / Double Cost Comparison
 *
 * 30名規模の月額で、本当の競合 2 パターンと並べて比較する。
 *
 *   A. 他社 CRM 4ツール契約 (HubSpot + Gong + Sales Marker + Glean) = ¥6,000,000/月
 *   B. 自社で内製する場合 (インフラ + 企業DB運用 + AI原価 + 人件費)   = ¥4,780,000/月
 *
 * vs KikuCRM Standard 年払い 30名 = 30 × ¥6,000 = ¥180,000/月
 *
 * 自社内製の数値は docs/total_cost_breakdown.md (2026-04-19) を根拠とする。
 *  - インフラ ¥6,020/月 → 切上げ ¥20,000
 *  - 企業DB運用 ¥13,500/月 (180万社想定) → 切上げ ¥14,000
 *  - AI原価 (議事録/通話/RAG/メール 等) ¥43,630 + APIスキル ¥2,000 → ¥46,000
 *  - 人件費: PM ¥1.2M + Eng×3 ¥3M + Designer×0.5 ¥500K = ¥4,700,000
 */

type Row = { t: string; s: string; v: string }

const others: Row[] = [
  { t: 'HubSpot Sales Pro', s: 'CRM',     v: '¥450,000' },
  { t: 'Gong',              s: '議事録AI', v: '¥4,500,000' },
  { t: 'Sales Marker',      s: 'ABM',     v: '¥600,000' },
  { t: 'Glean',             s: 'ナレッジ', v: '¥450,000' },
]

const inhouse: Row[] = [
  { t: 'インフラ',     s: 'Neon / R2 / Vercel ほか',          v: '¥20,000' },
  { t: '企業DB運用',   s: '180万社想定 (国税庁 + gBizINFO)',  v: '¥14,000' },
  { t: 'AI 原価',      s: '議事録 / 通話 / RAG / 配信 等',     v: '¥46,000' },
  { t: '開発者人件費', s: 'PM + Eng×3 + Designer×0.5',       v: '¥4,700,000' },
]

const KIKU_PRICE = '¥180,000'
const KIKU_NOTE = 'Standard プラン 年払い ／ 30 seats'

const ComparisonCard = ({
  eyebrow,
  rows,
  totalLabel,
  totalValue,
  reductionLabel,
  note,
}: {
  eyebrow: string
  rows: Row[]
  totalLabel: string
  totalValue: string
  reductionLabel: string
  note: string
}) => (
  <div className="rounded-3xl bg-dusk p-7 fo-glass-rim relative overflow-hidden flex flex-col">
    <div className="font-semibold uppercase tracking-[0.14em] text-[0.7rem] text-aurora">{eyebrow}</div>
    <div className="text-[0.62rem] uppercase tracking-[0.16em] text-[#7e7c83] mt-1">30名利用想定 ／ 月額</div>

    <div className="mt-5 space-y-2 flex-1">
      {rows.map((r, i) => (
        <div
          key={i}
          className="flex items-start justify-between py-1.5"
          style={{ borderTop: i === 0 ? 'none' : '1px solid rgba(171,199,255,0.06)' }}
        >
          <div className="min-w-0 pr-3">
            <div className="text-[0.92rem] text-[#e7e5ea]">{r.t}</div>
            <div className="text-[11px] text-[#7e7c83] mt-0.5">{r.s}</div>
          </div>
          <div className="font-mono text-[#c7c5c9] text-sm whitespace-nowrap">{r.v}</div>
        </div>
      ))}
      <div
        className="flex items-center justify-between py-3 border-t"
        style={{ borderColor: 'rgba(171,199,255,0.16)' }}
      >
        <div className="text-[#e7e5ea] font-medium">{totalLabel}</div>
        <div className="font-mono font-display font-bold text-coral text-[1.15rem]">{totalValue}</div>
      </div>
    </div>

    {/* KikuCRM line */}
    <div
      className="rounded-xl p-4 mt-3"
      style={{
        background: 'linear-gradient(135deg, rgba(171,199,255,0.10), rgba(0,113,227,0.06))',
        boxShadow: 'inset 0 0 0 1px rgba(171,199,255,0.20)',
      }}
    >
      <div className="flex items-center justify-between">
        <div className="text-[#e7e5ea] font-medium">
          KikuCRM
          <span className="ml-2 text-[10px] text-[#9b99a0] font-normal">{KIKU_NOTE}</span>
        </div>
        <div className="font-mono font-display font-bold text-aurora text-[1.3rem]">{KIKU_PRICE}</div>
      </div>
    </div>

    {/* reduction banner */}
    <div
      className="rounded-2xl mt-4 p-[1px]"
      style={{ background: 'linear-gradient(135deg, rgba(171,199,255,0.5), rgba(0,113,227,0.3), transparent 70%)' }}
    >
      <div className="rounded-2xl bg-pitch px-5 py-4 text-center fo-glass-rim">
        <div className="font-display font-bold text-[1.9rem] md:text-[2.2rem] leading-none fo-gradient-text">
          {reductionLabel}
        </div>
      </div>
    </div>

    <div className="mt-4 text-[10px] text-[#7e7c83] leading-relaxed">{note}</div>
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
      {/* Full-width nebula + faint gradient backdrop */}
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
          <Eyebrow color="#abc7ff">ROI ／ DOUBLE COST COMPARISON</Eyebrow>
          <h2 className="font-display font-bold tracking-[-0.025em] text-[2.4rem] md:text-[3.2rem] leading-[1.04] mt-5">
            <span className="fo-gradient-text">KikuCRM は、</span>
            <br />
            <span className="fo-gradient-text-soft">使った分だけ</span>で。
          </h2>
        </div>

        {/* Two comparison cards */}
        <div className="grid md:grid-cols-2 gap-6 mt-12 items-stretch">
          <ComparisonCard
            eyebrow="VS 他社 CRM 4ツール契約"
            rows={others}
            totalLabel="4社合算"
            totalValue="¥6,000,000"
            reductionLabel="−約 97% 削減"
            note="※ 各ツールは2026年4月時点の30名規模での標準プラン参考価格。実際の費用は要件・契約により変動します。"
          />
          <ComparisonCard
            eyebrow="VS 自社で内製する場合"
            rows={inhouse}
            totalLabel="自社合計"
            totalValue="¥4,780,000"
            reductionLabel="−約 96% 削減"
            note="※ 技術・インフラ原価は社内コスト総括 (2026-04) 、人件費は東京相場の参考値。詳細は下部 BUILD VS BUY セクションへ。"
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
