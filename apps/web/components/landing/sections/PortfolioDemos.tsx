'use client'

import type { ReactNode } from 'react'
import {
  ArrowRight,
  BarChart3,
  Binary,
  Database,
  FlaskConical,
  Gauge,
  Network,
  type LucideIcon,
} from 'lucide-react'
import { Eyebrow, Section } from '../atoms'

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
              <h3 className="mt-2 font-display text-[1.45rem] font-bold leading-tight tracking-[-0.01em] text-[#e7e5ea] md:text-[1.75rem]">
                {title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-[#9b99a0]">{body}</p>
            </div>
          </div>

          <div className="grid gap-2 text-[12px] text-[#c7c5c9] sm:grid-cols-2 xl:grid-cols-1">
            {tools.map((label, stepIndex) => (
              <div
                key={label}
                className="flex items-center gap-3 rounded-2xl bg-black/30 px-3 py-2 fo-glass-rim"
              >
                <span className="font-mono text-[10px]" style={{ color: accent }}>
                  {String(stepIndex + 1).padStart(2, '0')}
                </span>
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="min-w-0">{children}</div>
      </div>
    </div>
  </article>
)

const VisualFrame = ({
  title,
  label,
  accent,
  children,
}: {
  title: string
  label: string
  accent: string
  children: ReactNode
}) => (
  <div className="relative min-h-[360px] overflow-hidden rounded-3xl bg-[#05070d] p-4 shadow-2xl shadow-black/50 fo-glass-rim">
    <div
      className="absolute inset-0 opacity-90"
      style={{
        background: `radial-gradient(circle at 52% 40%, ${accent}22, transparent 36%), radial-gradient(circle at 82% 78%, rgba(200,185,255,0.10), transparent 30%)`,
      }}
    />
    <div className="relative flex min-h-[328px] flex-col overflow-hidden rounded-[24px] border border-white/[0.07] bg-[#080b12]/92">
      <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-3 md:px-5">
        <div>
          <div className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[#7e7c83]">
            {label}
          </div>
          <div className="mt-1 text-[12px] font-semibold text-[#e7e5ea]">{title}</div>
        </div>
        <span
          className="rounded-full px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.12em]"
          style={{ background: `${accent}14`, color: accent }}
        >
          Live model
        </span>
      </div>
      <div className="flex flex-1 flex-col justify-center p-4 md:p-5">{children}</div>
    </div>
  </div>
)

const InfrastructureVisual = () => (
  <VisualFrame
    title="流入から受注までを、ひとつの実験導線へ"
    label="Revenue infrastructure map"
    accent="#abc7ff"
  >
    <div className="grid grid-cols-5 gap-1.5">
      {['広告', 'Web', 'CRM', '商談', '受注'].map((item, index) => (
        <div key={item} className="relative">
          <div className="flex h-[86px] flex-col items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.035]">
            <span className="font-mono text-[9px] text-[#abc7ff]">0{index + 1}</span>
            <span className="mt-2 text-[11px] font-semibold text-[#e7e5ea]">{item}</span>
          </div>
          {index < 4 && (
            <ArrowRight
              className="absolute -right-2.5 top-1/2 z-10 h-3.5 w-3.5 -translate-y-1/2 text-[#71819a]"
              aria-hidden="true"
            />
          )}
        </div>
      ))}
    </div>
    <div className="mt-4 grid gap-2 sm:grid-cols-3">
      {[
        ['ボトルネック', '商談化率'],
        ['実験テーマ', '訴求 × LP'],
        ['成果地点', '受注・継続'],
      ].map(([label, value]) => (
        <div key={label} className="rounded-xl border border-white/[0.07] bg-black/25 p-3">
          <div className="text-[9px] text-[#7e7c83]">{label}</div>
          <div className="mt-1 text-[11px] font-semibold text-[#c7c5c9]">{value}</div>
        </div>
      ))}
    </div>
  </VisualFrame>
)

const SimulationVisual = () => (
  <VisualFrame
    title="複数の仮説を、実行前に反復シミュレーション"
    label="Probability model"
    accent="#ffcf4a"
  >
    <div className="grid gap-3 sm:grid-cols-[0.72fr_1.28fr]">
      <div className="space-y-2">
        {['CVR 1.8–2.6%', '商談化率 12–20%', '受注率 15–24%', 'LTV ¥420–680K'].map((item) => (
          <div
            key={item}
            className="rounded-xl border border-white/[0.07] bg-black/25 px-3 py-2.5 text-[10px] text-[#c7c5c9]"
          >
            {item}
          </div>
        ))}
      </div>
      <div className="rounded-xl border border-[#ffcf4a]/20 bg-[#ffcf4a]/[0.035] p-4">
        <div className="flex items-center justify-between">
          <span className="text-[9px] font-semibold uppercase tracking-[0.15em] text-[#ffcf4a]">
            Scenario range
          </span>
          <BarChart3 size={15} color="#ffcf4a" />
        </div>
        <div className="mt-5 flex h-[128px] items-end gap-1.5">
          {[22, 34, 49, 68, 88, 79, 61, 43, 27].map((height, index) => (
            <span
              key={index}
              className="flex-1 rounded-t-sm bg-[#ffcf4a]"
              style={{ height: `${height}%`, opacity: 0.36 + index * 0.045 }}
            />
          ))}
        </div>
        <div className="mt-2 flex justify-between text-[9px] text-[#7e7c83]">
          <span>慎重</span>
          <span>基準</span>
          <span>成長</span>
        </div>
      </div>
    </div>
  </VisualFrame>
)

const DataVisual = () => (
  <VisualFrame
    title="キーワードから受注まで、同じIDで追跡"
    label="Measurement infrastructure"
    accent="#8dffc9"
  >
    <div className="overflow-hidden rounded-xl border border-white/[0.08]">
      <div className="grid grid-cols-[1.15fr_repeat(3,0.72fr)] bg-white/[0.04] px-3 py-2 text-[9px] font-semibold text-[#7e7c83]">
        <span>データ</span>
        <span>取得</span>
        <span>接続</span>
        <span>品質</span>
      </div>
      {[
        ['検索キーワード', 'UTM', 'Lead ID', 'OK'],
        ['商談・提案', 'HubSpot', 'Deal ID', 'OK'],
        ['受注・継続', '売上DB', 'Customer ID', 'CHECK'],
      ].map((row) => (
        <div
          key={row[0]}
          className="grid grid-cols-[1.15fr_repeat(3,0.72fr)] border-t border-white/[0.07] px-3 py-4 text-[10px]"
        >
          <span className="font-semibold text-[#e7e5ea]">{row[0]}</span>
          <span className="text-[#9b99a0]">{row[1]}</span>
          <span className="text-[#9b99a0]">{row[2]}</span>
          <span className={row[3] === 'OK' ? 'text-[#8dffc9]' : 'text-[#ffcf4a]'}>{row[3]}</span>
        </div>
      ))}
    </div>
    <div className="mt-4 grid grid-cols-3 gap-2 text-center">
      {['欠損を検知', '重複を除外', '定義を統一'].map((item) => (
        <div key={item} className="rounded-xl bg-white/[0.035] py-2 text-[9px] text-[#9b99a0]">
          {item}
        </div>
      ))}
    </div>
  </VisualFrame>
)

const BayesianVisual = () => (
  <VisualFrame
    title="データが増えるたび、各案の成功確率を更新"
    label="Bayesian experiment board"
    accent="#c8b9ff"
  >
    <div className="space-y-4 rounded-xl border border-white/[0.08] bg-white/[0.025] p-4">
      {[
        ['A 課題訴求', 72, '#c8b9ff'],
        ['B 費用訴求', 51, '#abc7ff'],
        ['C 事例訴求', 34, '#8dffc9'],
      ].map(([label, value, color]) => (
        <div key={String(label)} className="grid grid-cols-[88px_1fr_38px] items-center gap-3">
          <span className="text-[10px] font-semibold text-[#c7c5c9]">{label}</span>
          <span className="h-2 overflow-hidden rounded-full bg-white/[0.06]">
            <span
              className="block h-full rounded-full"
              style={{ width: `${value}%`, background: String(color) }}
            />
          </span>
          <span className="text-right font-mono text-[10px] font-bold text-white">{value}%</span>
        </div>
      ))}
    </div>
    <div className="mt-4 flex items-center justify-between rounded-xl border border-[#c8b9ff]/20 bg-[#c8b9ff]/[0.04] px-4 py-3">
      <span className="text-[10px] text-[#9b99a0]">次の判断</span>
      <span className="text-[10px] font-semibold text-[#c8b9ff]">Aを継続 / Cを停止候補</span>
    </div>
  </VisualFrame>
)

const AllocationVisual = () => (
  <VisualFrame
    title="成果の期待値に応じて、資源配分を更新"
    label="Bandit allocation engine"
    accent="#ff8dcf"
  >
    <div className="rounded-xl border border-white/[0.08] bg-white/[0.025] p-4">
      <div className="flex h-12 overflow-hidden rounded-lg">
        <span className="flex w-[60%] items-center justify-center bg-[#abc7ff] text-[10px] font-bold text-[#07101f]">
          勝ち筋 60%
        </span>
        <span className="flex w-[25%] items-center justify-center bg-[#c8b9ff] text-[10px] font-bold text-[#171125]">
          継続 25%
        </span>
        <span className="flex w-[15%] items-center justify-center bg-[#ffcf4a] text-[10px] font-bold text-[#211900]">
          探索
        </span>
      </div>
      <div className="mt-5 grid grid-cols-3 gap-2">
        {[
          ['広告予算', '+18%'],
          ['LP流入', '+12%'],
          ['営業工数', '+20%'],
        ].map(([item, value]) => (
          <div key={item} className="rounded-xl border border-white/[0.07] bg-black/20 p-3">
            <div className="text-[9px] text-[#7e7c83]">{item}</div>
            <div className="mt-1 font-mono text-[12px] font-semibold text-[#e7e5ea]">{value}</div>
          </div>
        ))}
      </div>
    </div>
    <div className="mt-4 rounded-xl border border-[#8dffc9]/20 bg-[#8dffc9]/[0.04] px-4 py-3 text-[10px] leading-5 text-[#c7c5c9]">
      探索枠を残しながら、学習結果を次の実験へ引き継ぎます。
    </div>
  </VisualFrame>
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
        <h2 className="mt-4 font-display text-[2rem] font-bold leading-[1.08] tracking-[-0.025em] text-[#e7e5ea] md:text-[2.55rem] lg:text-[3rem]">
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
          <InfrastructureVisual />
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
          <SimulationVisual />
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
          <DataVisual />
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
          <BayesianVisual />
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
          <AllocationVisual />
        </PortfolioShell>
      </div>
    </div>
  </Section>
)
