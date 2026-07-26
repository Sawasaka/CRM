'use client'

import type { ReactNode } from 'react'
import { Binary, Database, FlaskConical, Gauge, Network, type LucideIcon } from 'lucide-react'
import { Eyebrow, Section } from '../atoms'
import {
  AllocationVault,
  BayesianVault,
  MeasurementVault,
  ProbabilityModelVault,
  RevenueInfrastructureVault,
} from './ObsidianServiceVisuals'

type PortfolioShellProps = {
  index: string
  eyebrow: string
  title: string
  body: string
  accent: string
  icon: LucideIcon
  tools: string[]
  children: ReactNode
}

const PortfolioShell = ({
  index,
  eyebrow,
  title,
  body,
  accent,
  icon: Icon,
  tools,
  children,
}: PortfolioShellProps) => (
  <article className="overflow-hidden rounded-[30px] bg-pitch p-[1px] fo-glass-rim">
    <div className="relative overflow-hidden rounded-[29px] bg-[#0b0d13]">
      <div
        className="absolute right-8 top-8 h-52 w-52 rounded-full opacity-70 blur-3xl"
        style={{ background: `radial-gradient(circle, ${accent}24, transparent 64%)` }}
      />
      <div className="relative grid gap-6 p-5 md:p-6 xl:grid-cols-[0.52fr_1fr]">
        <div className="flex min-w-0 flex-col justify-between gap-6">
          <div className="flex items-start gap-4">
            <div
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl"
              style={{ background: `${accent}16`, boxShadow: `inset 0 0 0 1px ${accent}44` }}
            >
              <Icon size={21} color={accent} />
            </div>
            <div className="min-w-0">
              <div
                className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em]"
                style={{ color: accent }}
              >
                <span className="font-mono">{index}</span>
                <span>{eyebrow}</span>
              </div>
              <h3 className="mt-2 font-display text-[1.45rem] font-bold leading-tight text-[#e7e5ea] md:text-[1.75rem]">
                {title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-[#9b99a0]">{body}</p>
            </div>
          </div>

          <div className="grid gap-2 text-[12px] text-[#c7c5c9] sm:grid-cols-2 xl:grid-cols-1">
            {tools.map((label, stepIndex) => (
              <div
                key={label}
                className="flex min-w-0 items-center gap-3 rounded-2xl bg-black/30 px-3 py-2 fo-glass-rim"
              >
                <span className="shrink-0 font-mono text-[10px]" style={{ color: accent }}>
                  {String(stepIndex + 1).padStart(2, '0')}
                </span>
                <span className="min-w-0">{label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="min-w-0">{children}</div>
      </div>
    </div>
  </article>
)

export const PortfolioDemos = () => (
  <Section tone="pitch" screenLabel="02 Portfolio Demos" className="overflow-hidden">
    <div className="relative mx-auto max-w-6xl px-6 py-24 md:py-32">
      <div
        className="absolute left-1/2 top-10 h-72 w-[60vw] -translate-x-1/2 rounded-full opacity-70 blur-3xl"
        style={{ background: 'radial-gradient(circle, rgba(171,199,255,0.13), transparent 64%)' }}
      />

      <div className="relative mb-12 max-w-3xl">
        <Eyebrow color="#abc7ff">Revenue Experiment Infrastructure</Eyebrow>
        <h2 className="mt-4 font-display text-[2rem] font-bold leading-[1.08] text-[#e7e5ea] md:text-[2.55rem] lg:text-[3rem]">
          売上を伸ばす5つの設計を、
          <br />
          <span className="fo-gradient-text">ひとつの実験サイクルへ。</span>
        </h2>
        <p className="mt-5 max-w-xl text-sm leading-relaxed text-[#9b99a0]">
          探索する、小さく試す、正しく測る、並行して検証する、勝ち筋へ配分する。
          施策を作るだけで終わらず、学習結果を次の実験へつなげます。
        </p>
      </div>

      <div className="relative space-y-6">
        <PortfolioShell
          index="01"
          eyebrow="Explore"
          title="レベニューインフラ設計"
          body="売上導線を可視化し、改善・実験すべきポイントを見つけます。"
          accent="#abc7ff"
          icon={Network}
          tools={['流入から受注まで接続', 'ボトルネックを発見', '実験テーマを定義']}
        >
          <RevenueInfrastructureVault />
        </PortfolioShell>

        <PortfolioShell
          index="02"
          eyebrow="Simulate"
          title="確率モデル設計"
          body="複数の仮説を事前に試算し、低コストで試す施策を絞り込みます。"
          accent="#ffcf4a"
          icon={FlaskConical}
          tools={['CVR・CAC・LTVを仮定', 'シナリオを反復試算', '小さな実験へ接続']}
        >
          <ProbabilityModelVault />
        </PortfolioShell>

        <PortfolioShell
          index="03"
          eyebrow="Measure"
          title="データ収集インフラ設計"
          body="キーワードから商談・受注まで、施策の成果を正しく追跡します。"
          accent="#8dffc9"
          icon={Database}
          tools={['計測指標を定義', 'ID・イベントを統一', '欠損と重複を防止']}
        >
          <MeasurementVault />
        </PortfolioShell>

        <PortfolioShell
          index="04"
          eyebrow="Validate"
          title="ベイズ統計モデル設計"
          body="複数の仮説を同時に比較し、データが増えるたび成功確率を更新します。"
          accent="#c8b9ff"
          icon={Binary}
          tools={['複数案を同時比較', '成功確率を更新', '継続・停止を判断']}
        >
          <BayesianVault />
        </PortfolioShell>

        <PortfolioShell
          index="05"
          eyebrow="Allocate"
          title="バンディット配分エンジン設計"
          body="成果が期待できる施策へ、予算と営業工数を段階的に寄せます。"
          accent="#ff8dcf"
          icon={Gauge}
          tools={['配分ルールを設計', '探索枠を維持', '次の実験へ学習を継承']}
        >
          <AllocationVault />
        </PortfolioShell>
      </div>
    </div>
  </Section>
)
