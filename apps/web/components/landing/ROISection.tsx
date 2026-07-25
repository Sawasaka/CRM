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
    label: '意思決定',
    detail: '施策を続ける・止める判断',
    consulting: '経験と月次レポートで判断',
    fde: '確率と実測データで更新',
    fdeBadge: '逐次学習',
    fdeSub: 'データが増えるたび成功確率を更新',
  },
  {
    label: '施策検証',
    detail: '訴求・LP・広告・営業アプローチ',
    consulting: '1案ずつ順番に試す',
    fde: '複数案を並行して比較',
    fdeBadge: 'ベイズ統計',
    fdeSub: '継続・停止・追加検証を判断',
  },
  {
    label: 'データ接続',
    detail: 'キーワード・広告・商談・受注・継続',
    consulting: 'ツールごとに分散して集計',
    fde: '同じIDで成果まで追跡',
    fdeBadge: '計測基盤',
    fdeSub: '欠損・重複・定義ずれを防止',
  },
  {
    label: '予算配分',
    detail: '広告予算・流入・営業工数',
    consulting: '期初に決めた配分を維持',
    fde: '期待値に応じて段階的に更新',
    fdeBadge: 'バンディット',
    fdeSub: '探索枠を残しながら勝ち筋へ配分',
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
            <Eyebrow color="#abc7ff">Why now</Eyebrow>
            <h2 className="mt-4 max-w-[33rem] font-display text-[1.95rem] font-bold leading-[1.08] tracking-[-0.02em] md:text-[2.45rem]">
              <span className="fo-gradient-text">作る速さではなく、</span>
              <br />
              <span className="fo-gradient-text-soft">学ぶ速さ</span>を競争力に。
            </h2>
          </div>
          <p className="max-w-[31rem] pb-1 text-[0.88rem] leading-7 text-[#b7b4bd] lg:ml-auto">
            AIで施策を作りやすくなった今、差がつくのは何を試し、何を残すかです。
            ルキスマLABは改善を単発で終わらせず、会社の学習サイクルとして実装します。
          </p>
        </div>

        <div className="mt-8 overflow-hidden rounded-[1.5rem] border border-[rgba(171,199,255,0.18)] bg-[rgba(10,12,18,0.78)] shadow-[0_24px_90px_rgba(0,0,0,0.35)] backdrop-blur-xl">
          <div className="hidden grid-cols-[1.08fr_0.92fr_1fr] border-b border-white/8 bg-white/[0.035] text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[#9fb9ee] md:grid">
            <div className="flex min-h-12 items-center px-7">検討項目</div>
            <div className="flex min-h-12 items-center px-7 text-[#c3c0c8]">一般的な改善支援</div>
            <div className="flex min-h-12 items-center px-7 text-aurora">ルキスマLAB</div>
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
                  一般的な支援
                </span>
                {row.consulting}
              </div>
              <div className="flex items-center justify-between gap-4 px-5 pb-5 pt-3 text-[0.96rem] font-semibold text-[#dce9ff] md:flex md:justify-start md:px-7 md:py-5">
                <span className="text-[0.62rem] uppercase tracking-[0.16em] text-aurora md:hidden">
                  ルキスマLAB
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
