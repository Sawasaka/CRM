import { ArrowRight, BrainCircuit, RefreshCcw, Rows3, Target } from 'lucide-react'

const comparisons = [
  {
    label: '意思決定',
    before: '経験と月次レポートで判断',
    after: '確率と実測データで判断',
  },
  {
    label: '施策検証',
    before: '1案ずつ順番に試す',
    after: '複数案を並行して比較',
  },
  {
    label: '予算配分',
    before: '期初に決めた配分を維持',
    after: '結果に応じて段階的に更新',
  },
  {
    label: '学習資産',
    before: '担当者の経験に残る',
    after: '次の実験モデルへ引き継ぐ',
  },
]

const outcomes = [
  {
    icon: Target,
    label: 'Attribution',
    title: '何が受注につながったか',
    body: 'キーワード・広告・商談・受注を同じIDで追跡。',
    color: '#72b5ff',
  },
  {
    icon: Rows3,
    label: 'Experiment',
    title: 'どの仮説を残すべきか',
    body: '複数施策を同時に比較し、継続・停止を判断。',
    color: '#c8b9ff',
  },
  {
    icon: BrainCircuit,
    label: 'Allocation',
    title: 'どこへ資源を寄せるか',
    body: '期待値に応じて予算・流入・営業工数を再配分。',
    color: '#67dfb0',
  },
]

export const ROISection = () => (
  <section className="relative border-b border-white/[0.08] bg-[#0b0f15]">
    <div className="mx-auto max-w-7xl px-5 py-20 sm:px-6 md:py-28">
      <div className="grid gap-8 lg:grid-cols-[0.82fr_1.18fr] lg:items-end">
        <div>
          <div className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[#ffcf5a]">
            Why now
          </div>
          <h2 className="mt-4 font-display text-[2.15rem] font-bold leading-[1.08] text-white md:text-[3rem]">
            作る速さではなく、
            <br />
            <span className="text-[#ffcf5a]">学ぶ速さを競争力に。</span>
          </h2>
        </div>
        <p className="max-w-[40rem] text-sm leading-7 text-[#aeb6c2] lg:ml-auto">
          AIで施策やソフトウェアを作りやすくなった今、差がつくのは「何を試し、何を残すか」です。
          ルキスマLABは、改善を単発で終わらせず、会社の学習サイクルとして実装します。
        </p>
      </div>

      <div className="mt-10 grid gap-4 md:grid-cols-3">
        {outcomes.map((outcome) => {
          const Icon = outcome.icon
          return (
            <div
              key={outcome.label}
              className="rounded-lg border border-white/[0.09] bg-white/[0.025] p-5"
            >
              <div className="flex items-center justify-between">
                <Icon className="h-5 w-5" style={{ color: outcome.color }} aria-hidden="true" />
                <span className="text-[0.55rem] font-bold uppercase tracking-[0.14em] text-[#737d8c]">
                  {outcome.label}
                </span>
              </div>
              <h3 className="mt-5 text-sm font-bold text-white">{outcome.title}</h3>
              <p className="mt-2 text-[0.68rem] leading-5 text-[#909aa9]">{outcome.body}</p>
            </div>
          )
        })}
      </div>

      <div className="mt-6 overflow-hidden rounded-lg border border-white/[0.1] bg-[#0f141c]">
        <div className="hidden grid-cols-[0.72fr_1fr_40px_1fr] border-b border-white/[0.08] bg-white/[0.025] px-5 py-3 text-[0.6rem] font-semibold uppercase tracking-[0.14em] text-[#758091] md:grid">
          <span>比較項目</span>
          <span>従来の改善運用</span>
          <span />
          <span className="text-[#8dffd1]">実験インフラ導入後</span>
        </div>
        {comparisons.map((row) => (
          <div
            key={row.label}
            className="grid gap-2 border-t border-white/[0.07] px-5 py-4 first:border-t-0 md:grid-cols-[0.72fr_1fr_40px_1fr] md:items-center"
          >
            <div className="text-[0.68rem] font-bold text-white">{row.label}</div>
            <div className="text-[0.68rem] text-[#8d96a4]">{row.before}</div>
            <ArrowRight className="hidden h-4 w-4 text-[#4f5b6c] md:block" aria-hidden="true" />
            <div className="text-[0.7rem] font-semibold text-[#bdf5dd]">{row.after}</div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex items-start gap-3 rounded-lg border border-[#72b5ff]/20 bg-[#72b5ff]/[0.04] px-5 py-4">
        <RefreshCcw className="mt-0.5 h-4 w-4 shrink-0 text-[#72b5ff]" aria-hidden="true" />
        <p className="text-[0.7rem] leading-6 text-[#adb6c3]">
          結果は次の仮説へ戻します。実験を重ねるほど、御社固有の「売れる条件」がデータとして明確になります。
        </p>
      </div>
    </div>
  </section>
)
