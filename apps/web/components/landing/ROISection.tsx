import { Eyebrow, NebulaBG, Section } from './atoms'

type CostRow = {
  label: string
  detail: string
  consulting: string
  fde: string
  fdeBadge?: string
  fdeSub?: string
}

const costRows: CostRow[] = [
  {
    label: '初期診断',
    detail: '現状調査・課題整理・構想策定',
    consulting: '100万〜300万円',
    fde: '無料相談で整理',
    fdeBadge: '無償',
    fdeSub: '現状と課題をヒアリング',
  },
  {
    label: '要件定義',
    detail: '業務フロー・システム構成・運用ルール',
    consulting: '300万〜800万円',
    fde: '初期方針まで無料',
    fdeBadge: '無償',
    fdeSub: '構築範囲を一緒に整理',
  },
  {
    label: '実装支援',
    detail: 'CRM / Notion / Workspace / Zoom / AI連携',
    consulting: '月300万〜1,000万円',
    fde: 'ご提案内容をもとに協議',
    fdeBadge: 'オファー制',
    fdeSub: '業務範囲・期間・期待成果をご提示ください',
  },
  {
    label: '現場定着',
    detail: '運用改善・社内浸透・改善サイクル',
    consulting: '別途PM/運用費',
    fde: 'ご希望の体制をもとに協議',
    fdeBadge: 'オファー制',
    fdeSub: '役割・稼働条件を確認して伴走範囲を設計',
  },
]

export const ROISection = () => {
  return (
    <Section
      tone="pitch"
      screenLabel="13 ROI / Consulting Cost Comparison"
      className="relative overflow-hidden"
    >
      <div
        className="h-px w-full"
        style={{
          background:
            'linear-gradient(90deg, transparent 0%, rgba(171,199,255,0.08) 20%, rgba(171,199,255,0.20) 50%, rgba(171,199,255,0.08) 80%, transparent 100%)',
        }}
      />
      <NebulaBG intensity={0.58} />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at 50% 0%, rgba(171,199,255,0.08) 0%, transparent 58%), radial-gradient(circle at 82% 28%, rgba(0,113,227,0.08), transparent 34%)',
        }}
      />

      <div className="relative mx-auto max-w-6xl px-6 py-20 md:py-26">
        <div className="grid gap-8 lg:grid-cols-[0.88fr_1.12fr] lg:items-end">
          <div>
            <Eyebrow color="#abc7ff">ROI</Eyebrow>
            <h2 className="mt-4 max-w-[33rem] font-display text-[1.95rem] font-bold leading-[1.08] tracking-[-0.02em] md:text-[2.45rem]">
              <span className="fo-gradient-text">大手コンサルと、</span>
              <br />
              <span className="fo-gradient-text-soft">AI/DX導入費用</span>を比べる。
            </h2>
          </div>
          <p className="max-w-[31rem] pb-1 text-[0.88rem] leading-7 text-[#b7b4bd] lg:ml-auto">
            大手コンサルでは診断や要件定義だけで費用が大きくなりがちです。 FDE
            AI/DXは必要な構成に絞り、月15万円から設計と実装を小さく速く進めます。
          </p>
        </div>

        <div className="mt-8 overflow-hidden rounded-[1.5rem] border border-[rgba(171,199,255,0.18)] bg-[rgba(10,12,18,0.78)] shadow-[0_24px_90px_rgba(0,0,0,0.35)] backdrop-blur-xl">
          <div className="hidden grid-cols-[1.08fr_0.92fr_1fr] border-b border-white/8 bg-white/[0.035] text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[#9fb9ee] md:grid">
            <div className="flex min-h-12 items-center px-7">検討項目</div>
            <div className="flex min-h-12 items-center px-7 text-[#c3c0c8]">大手コンサルに依頼</div>
            <div className="flex min-h-12 items-center px-7 text-aurora">FDE AI/DX</div>
          </div>

          {costRows.map((row) => (
            <div
              key={row.label}
              className="grid border-b border-white/[0.055] last:border-b-0 md:min-h-[7rem] md:grid-cols-[1.08fr_0.92fr_1fr]"
            >
              <div className="flex flex-col justify-center px-5 pb-2 pt-5 md:px-7 md:py-5">
                <div className="text-[0.95rem] font-bold text-white">{row.label}</div>
                <div className="mt-1 text-xs leading-6 text-[#85828b]">{row.detail}</div>
              </div>
              <div className="flex items-center justify-between gap-4 px-5 py-3 text-[0.96rem] font-semibold text-[#d7d5dc] md:flex md:justify-start md:px-7 md:py-5">
                <span className="text-[0.62rem] uppercase tracking-[0.16em] text-[#77737d] md:hidden">
                  大手コンサル
                </span>
                {row.consulting}
              </div>
              <div className="flex items-center justify-between gap-4 px-5 pb-5 pt-3 text-[0.96rem] font-semibold text-[#dce9ff] md:flex md:justify-start md:px-7 md:py-5">
                <span className="text-[0.62rem] uppercase tracking-[0.16em] text-aurora md:hidden">
                  FDE AI/DX
                </span>
                {row.fdeBadge ? (
                  <div className="grid max-w-[18rem] gap-1.5">
                    <span className="w-fit rounded-full bg-[#8cbcff]/12 px-2 py-0.5 text-[0.58rem] font-bold tracking-[0.12em] text-[#abc7ff]">
                      {row.fdeBadge}
                    </span>
                    <span>{row.fde}</span>
                    <span className="text-[0.68rem] font-semibold leading-5 text-[#8f9db8]">
                      {row.fdeSub}
                    </span>
                  </div>
                ) : (
                  row.fde
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

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
