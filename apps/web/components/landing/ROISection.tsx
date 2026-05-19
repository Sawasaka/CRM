import { Eyebrow, NebulaBG, Section } from './atoms'

/**
 * ROI / Double Cost Comparison
 *
 * 10名規模の月額で、本当の競合 2 パターンと並べて比較する。
 * 合計や削減%は出さず、「対して、ルキスマCRM は使ったクレジット分だけ」を
 * 訴求するレイアウトに刷新。
 *
 *   A. 他社 SaaS 3ツール契約 (10名)
 *       - HubSpot Sales Hub Starter (CRM)     ¥30,000
 *       - MiiTel (通話)                        ¥60,000
 *       - SalesNow (企業DB)                    ¥50,000
 *
 *   B. 自社で内製する場合 (10名・最低限の運用)
 *       - AWS S3 + 周辺インフラ (DB / ホスティング / メール送信)  ¥15,000
 *       - AI API (Gemini 2.5 Flash Lite / GPT-4o mini)            ¥30,000
 *       - 開発者人件費 (1人 × 0.3人月、月額 ¥300K 相当)             ¥100,000
 *
 * vs ルキスマCRM は cost-plus モデルでクレジット課金のみ。固定費・シート
 * 単価を持たないため、上記いずれと比べても「使った分だけ」が成立する。
 */

type Row = { t: string; s: string; v: string }

const others: Row[] = [
  { t: 'HubSpot Sales Hub Starter', s: 'CRM',   v: '¥30,000' },
  { t: 'MiiTel',                    s: '通話',  v: '¥60,000' },
  { t: 'SalesNow',                  s: '企業DB', v: '¥50,000' },
]

const inhouse: Row[] = [
  { t: 'AWS S3 + 周辺インフラ', s: 'ストレージ / DB / ホスティング / メール送信',   v: '¥15,000' },
  { t: 'AI API',               s: 'Gemini 2.5 Flash Lite / GPT-4o mini など',     v: '¥30,000' },
  { t: '開発者人件費',          s: '1人 × 0.3人月 (月額 ¥300,000 相当)',          v: '¥100,000' },
]

const ComparisonCard = ({
  eyebrow,
  rows,
  note,
}: {
  eyebrow: string
  rows: Row[]
  note: string
}) => (
  <div className="rounded-3xl bg-dusk p-7 fo-glass-rim relative overflow-hidden flex flex-col">
    <div className="font-semibold uppercase tracking-[0.14em] text-[0.7rem] text-aurora">{eyebrow}</div>
    <div className="text-[0.62rem] uppercase tracking-[0.16em] text-[#7e7c83] mt-1">10名利用想定 ／ 月額</div>

    {/* 競合項目 (合計行は削除 — 「使った分だけ」訴求にフォーカスするため) */}
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
    </div>

    {/* ルキスマCRM の差別化バナー — 削減%ではなく「クレジット分だけ」のブランド訴求に変更 */}
    <div
      className="rounded-2xl mt-5 p-[1px]"
      style={{ background: 'linear-gradient(135deg, rgba(171,199,255,0.5), rgba(0,113,227,0.3), transparent 70%)' }}
    >
      <div className="rounded-2xl bg-pitch px-5 py-5 text-center fo-glass-rim">
        <div className="text-[10px] uppercase tracking-[0.18em] text-aurora opacity-80">
          対して、ルキスマCRM
        </div>
        <div className="mt-2 font-display font-bold text-[1.6rem] md:text-[1.9rem] leading-tight fo-gradient-text">
          使ったクレジット分だけ。
        </div>
        <div className="mt-2 text-[11px] text-[#9b99a0] tracking-[0.04em]">
          シート固定費なし ／ クレジット課金のみ
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
            <span className="fo-gradient-text-soft">使った分だけ</span>。
          </h2>
        </div>

        {/* Two comparison cards */}
        <div className="grid md:grid-cols-2 gap-6 mt-12 items-stretch">
          <ComparisonCard
            eyebrow="VS 他社 SaaS 3ツール契約"
            rows={others}
            note="※ HubSpot は 10名規模での Sales Hub Starter 目安、MiiTel は通話プランの推定値、SalesNow は中小規模目安。実際の費用は要件・契約により変動します。"
          />
          <ComparisonCard
            eyebrow="VS 自社で内製する場合"
            rows={inhouse}
            note="※ AWS S3 + DB + ホスティング + メール送信を合算した実費感、AI API は Gemini / GPT-4o mini を組み合わせた月間トークン消費試算、人件費は月額 ¥300,000 人材を 0.3 人月で運用想定。"
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
