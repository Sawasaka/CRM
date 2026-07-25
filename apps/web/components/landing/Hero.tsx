import Link from 'next/link'
import {
  ArrowDown,
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Database,
  FlaskConical,
  Gauge,
  LineChart,
  Network,
} from 'lucide-react'

const experimentSteps = [
  { label: '探索', icon: Network, color: '#72b5ff' },
  { label: '試行', icon: FlaskConical, color: '#ffcf5a' },
  { label: '計測', icon: Database, color: '#67dfb0' },
  { label: '検証', icon: LineChart, color: '#c8b9ff' },
  { label: '配分', icon: Gauge, color: '#ff8e8e' },
]

const signals = [
  { label: '広告・検索', value: '流入の起点' },
  { label: 'CRM・商談', value: '受注までの導線' },
  { label: '売上・継続', value: 'LTVの結果' },
]

export const Hero = () => (
  <section className="relative overflow-hidden border-b border-white/[0.08] bg-[#0c1017]">
    <div className="pointer-events-none absolute inset-0 opacity-70">
      <div className="absolute inset-x-0 top-0 h-px bg-[#72b5ff]/40" />
      <div className="absolute left-[8%] top-24 h-48 w-px bg-[#72b5ff]/10" />
      <div className="absolute right-[12%] top-48 h-64 w-px bg-[#67dfb0]/10" />
    </div>

    <div className="relative mx-auto max-w-7xl px-5 pb-14 pt-14 sm:px-6 md:pb-20 md:pt-20">
      <div className="grid items-center gap-12 lg:grid-cols-[0.78fr_1.22fr] lg:gap-14">
        <div className="max-w-xl">
          <div className="flex items-center gap-2 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[#8fbfff]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#67dfb0] shadow-[0_0_10px_#67dfb0]" />
            Revenue Experiment Infrastructure
          </div>

          <h1 className="mt-6 font-display text-[2.75rem] font-bold leading-[1.04] text-white sm:text-[3.45rem] lg:text-[4.25rem]">
            売上を、勘ではなく
            <br />
            <span className="text-[#72b5ff]">実験で伸ばす。</span>
          </h1>

          <p className="mt-6 max-w-[34rem] text-[0.95rem] leading-8 text-[#b9c0cc] md:text-base">
            広告・Web・CRM・商談・受注をひとつのデータ導線へ。
            仮説を小さく試し、正しく測り、勝ち筋へ予算と営業工数を配分できる仕組みを設計します。
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="#services"
              className="inline-flex h-11 items-center gap-2 rounded-lg bg-[#72b5ff] px-5 text-sm font-bold text-[#07111f] transition-colors hover:bg-[#9acbff]"
            >
              5つの設計を見る
              <ArrowDown className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link
              href="#contact"
              className="inline-flex h-11 items-center gap-2 rounded-lg border border-white/15 px-5 text-sm font-semibold text-white transition-colors hover:border-[#67dfb0]/60 hover:text-[#8dffd1]"
            >
              実験テーマを相談する
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>

          <div className="mt-9 grid grid-cols-3 border-y border-white/[0.08]">
            {signals.map((signal) => (
              <div
                key={signal.label}
                className="min-w-0 border-l border-white/[0.08] px-3 py-4 first:border-l-0 first:pl-0"
              >
                <div className="text-[0.62rem] font-semibold text-[#7f8999]">{signal.label}</div>
                <div className="mt-1 text-[0.68rem] font-bold text-[#e8edf5]">{signal.value}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="min-w-0 rounded-lg border border-white/[0.12] bg-[#10151e] shadow-[0_24px_70px_rgba(0,0,0,0.34)]">
          <div className="flex min-h-12 items-center justify-between border-b border-white/[0.08] px-4 sm:px-5">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-[#72b5ff]" aria-hidden="true" />
              <span className="text-[0.72rem] font-bold text-white">
                Revenue Experiment Console
              </span>
            </div>
            <span className="rounded bg-[#67dfb0]/10 px-2 py-1 text-[0.56rem] font-bold tracking-[0.12em] text-[#8dffd1]">
              SAMPLE MODEL
            </span>
          </div>

          <div className="grid gap-0 md:grid-cols-[1fr_0.84fr]">
            <div className="border-b border-white/[0.08] p-4 sm:p-5 md:border-b-0 md:border-r">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="text-[0.58rem] font-semibold uppercase tracking-[0.14em] text-[#7f8999]">
                    Current hypothesis
                  </div>
                  <div className="mt-1.5 text-sm font-bold text-white">
                    検索キーワード別にLPを出し分ける
                  </div>
                </div>
                <CheckCircle2 className="h-5 w-5 shrink-0 text-[#67dfb0]" aria-hidden="true" />
              </div>

              <div className="mt-5 grid grid-cols-3 gap-2">
                {[
                  ['A', '課題訴求', '43%'],
                  ['B', '費用訴求', '31%'],
                  ['C', '事例訴求', '26%'],
                ].map(([name, label, value], index) => (
                  <div
                    key={name}
                    className={`rounded-lg border p-3 ${
                      index === 0
                        ? 'border-[#72b5ff]/45 bg-[#72b5ff]/[0.08]'
                        : 'border-white/[0.08] bg-white/[0.02]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[0.6rem] font-bold text-[#8fbfff]">{name}</span>
                      <span className="text-[0.58rem] text-[#7f8999]">{value}</span>
                    </div>
                    <div className="mt-3 text-[0.66rem] font-semibold text-[#dfe5ee]">{label}</div>
                  </div>
                ))}
              </div>

              <div className="mt-5 space-y-3">
                {[
                  ['受注確率', 72, '#72b5ff'],
                  ['データ信頼度', 86, '#67dfb0'],
                  ['探索余地', 34, '#ffcf5a'],
                ].map(([label, value, color]) => (
                  <div key={String(label)}>
                    <div className="mb-1.5 flex items-center justify-between text-[0.62rem]">
                      <span className="text-[#9da6b4]">{label}</span>
                      <span className="font-bold text-white">{value}%</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded bg-white/[0.06]">
                      <div
                        className="h-full rounded"
                        style={{ width: `${value}%`, backgroundColor: String(color) }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 sm:p-5">
              <div className="text-[0.58rem] font-semibold uppercase tracking-[0.14em] text-[#7f8999]">
                Next allocation
              </div>
              <div className="mt-4 space-y-3">
                {[
                  ['勝ち筋へ配分', '60%', '#72b5ff'],
                  ['次点を継続', '25%', '#c8b9ff'],
                  ['探索を残す', '15%', '#ffcf5a'],
                ].map(([label, value, color]) => (
                  <div key={String(label)} className="flex items-center gap-3">
                    <span
                      className="h-2.5 w-2.5 rounded-sm"
                      style={{ backgroundColor: String(color) }}
                    />
                    <span className="min-w-0 flex-1 text-[0.66rem] text-[#b8c0cc]">{label}</span>
                    <span className="text-xs font-bold text-white">{value}</span>
                  </div>
                ))}
              </div>
              <div className="mt-5 border-t border-white/[0.08] pt-4">
                <div className="text-[0.58rem] uppercase tracking-[0.12em] text-[#7f8999]">
                  Decision
                </div>
                <p className="mt-2 text-[0.7rem] leading-5 text-[#c7ced8]">
                  A案への配分を増やしながら、15%は新しい仮説の探索に残します。
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-5 border-t border-white/[0.08]">
            {experimentSteps.map((step, index) => {
              const Icon = step.icon
              return (
                <div
                  key={step.label}
                  className="relative flex min-h-[70px] flex-col items-center justify-center gap-1.5 border-l border-white/[0.07] first:border-l-0"
                >
                  <Icon className="h-4 w-4" style={{ color: step.color }} aria-hidden="true" />
                  <span className="text-[0.58rem] font-semibold text-[#aab2bf]">
                    {index + 1}. {step.label}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  </section>
)
