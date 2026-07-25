import type { ComponentType, CSSProperties } from 'react'
import {
  ArrowRight,
  BarChart3,
  Binary,
  Database,
  FlaskConical,
  Gauge,
  Network,
  Route,
} from 'lucide-react'

type Service = {
  number: string
  action: string
  name: string
  description: string
  points: string[]
  color: string
  icon: ComponentType<{
    className?: string
    style?: CSSProperties
    'aria-hidden'?: boolean
  }>
}

const services: Service[] = [
  {
    number: '01',
    action: '探索する',
    name: 'レベニューインフラ設計',
    description: '売上導線を可視化し、改善・実験すべきポイントを見つける。',
    points: ['流入から受注まで接続', 'ボトルネックを発見', '実験テーマを定義'],
    color: '#72b5ff',
    icon: Network,
  },
  {
    number: '02',
    action: '小さく試す',
    name: '確率モデル設計',
    description: '複数の仮説を事前に試算し、低コストで試す施策を絞り込む。',
    points: ['CVR・CAC・LTVを仮定', 'シナリオを反復試算', '小さな実験へ接続'],
    color: '#ffcf5a',
    icon: FlaskConical,
  },
  {
    number: '03',
    action: '正しく測る',
    name: 'データ収集インフラ設計',
    description: 'キーワードから商談・受注まで、施策の成果を正しく追跡する。',
    points: ['計測指標を定義', 'ID・イベントを統一', '欠損と重複を防止'],
    color: '#67dfb0',
    icon: Database,
  },
  {
    number: '04',
    action: '並行して検証する',
    name: 'ベイズ統計モデル設計',
    description: '複数の仮説を同時に比較し、データが増えるたび成功確率を更新する。',
    points: ['複数案を同時比較', '成功確率を更新', '継続・停止を判断'],
    color: '#c8b9ff',
    icon: Binary,
  },
  {
    number: '05',
    action: '勝ち筋へ配分する',
    name: 'バンディット配分エンジン設計',
    description: '成果が期待できる施策へ、予算と営業工数を段階的に寄せる。',
    points: ['配分ルールを設計', '探索枠を維持', '次の実験へ学習を継承'],
    color: '#ff8e8e',
    icon: Gauge,
  },
]

const FlowVisual = () => (
  <div className="grid grid-cols-5 gap-1.5">
    {['広告', 'Web', 'CRM', '商談', '受注'].map((label, index) => (
      <div key={label} className="relative">
        <div className="flex h-20 flex-col items-center justify-center rounded-lg border border-white/[0.09] bg-white/[0.025]">
          <span className="text-[0.56rem] font-bold text-[#72b5ff]">0{index + 1}</span>
          <span className="mt-2 text-[0.65rem] font-semibold text-white">{label}</span>
        </div>
        {index < 4 ? (
          <ArrowRight
            className="absolute -right-2.5 top-1/2 z-10 h-3.5 w-3.5 -translate-y-1/2 text-[#526174]"
            aria-hidden="true"
          />
        ) : null}
      </div>
    ))}
  </div>
)

const SimulationVisual = () => (
  <div className="grid gap-4 sm:grid-cols-[0.8fr_1.2fr]">
    <div className="rounded-lg border border-white/[0.09] bg-white/[0.025] p-4">
      <div className="text-[0.58rem] font-semibold uppercase tracking-[0.12em] text-[#7f8999]">
        Inputs
      </div>
      <div className="mt-3 space-y-2">
        {['CVR 1.8–2.6%', '商談化率 12–20%', '受注率 15–24%'].map((item) => (
          <div
            key={item}
            className="rounded border border-white/[0.07] px-2.5 py-2 text-[0.62rem] text-[#c6cdd8]"
          >
            {item}
          </div>
        ))}
      </div>
    </div>
    <div className="rounded-lg border border-[#ffcf5a]/20 bg-[#ffcf5a]/[0.035] p-4">
      <div className="flex items-center justify-between">
        <div className="text-[0.58rem] font-semibold uppercase tracking-[0.12em] text-[#ffcf5a]">
          Scenario range
        </div>
        <BarChart3 className="h-4 w-4 text-[#ffcf5a]" aria-hidden="true" />
      </div>
      <div className="mt-5 flex h-24 items-end gap-1.5">
        {[24, 38, 56, 74, 88, 79, 61, 42, 28].map((height, index) => (
          <span
            key={index}
            className="flex-1 rounded-t-sm bg-[#ffcf5a]/70"
            style={{ height: `${height}%`, opacity: 0.42 + index * 0.045 }}
          />
        ))}
      </div>
      <div className="mt-2 flex justify-between text-[0.54rem] text-[#7f8999]">
        <span>慎重</span>
        <span>基準</span>
        <span>成長</span>
      </div>
    </div>
  </div>
)

const DataVisual = () => (
  <div className="overflow-hidden rounded-lg border border-white/[0.09]">
    <div className="grid grid-cols-[1.1fr_repeat(3,0.72fr)] bg-white/[0.035] px-3 py-2 text-[0.55rem] font-semibold text-[#7f8999]">
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
        className="grid grid-cols-[1.1fr_repeat(3,0.72fr)] border-t border-white/[0.07] px-3 py-3 text-[0.6rem]"
      >
        <span className="font-semibold text-white">{row[0]}</span>
        <span className="text-[#aeb6c2]">{row[1]}</span>
        <span className="text-[#aeb6c2]">{row[2]}</span>
        <span className={row[3] === 'OK' ? 'text-[#67dfb0]' : 'text-[#ffcf5a]'}>{row[3]}</span>
      </div>
    ))}
  </div>
)

const BayesianVisual = () => (
  <div className="space-y-4 rounded-lg border border-white/[0.09] bg-white/[0.025] p-4">
    {[
      ['A 課題訴求', 72, '#c8b9ff'],
      ['B 費用訴求', 51, '#72b5ff'],
      ['C 事例訴求', 34, '#67dfb0'],
    ].map(([label, value, color]) => (
      <div key={String(label)} className="grid grid-cols-[88px_1fr_38px] items-center gap-3">
        <span className="text-[0.62rem] font-semibold text-[#c6cdd8]">{label}</span>
        <span className="h-2 overflow-hidden rounded bg-white/[0.06]">
          <span
            className="block h-full rounded"
            style={{ width: `${value}%`, backgroundColor: String(color) }}
          />
        </span>
        <span className="text-right text-[0.62rem] font-bold text-white">{value}%</span>
      </div>
    ))}
    <div className="border-t border-white/[0.07] pt-3 text-[0.56rem] text-[#7f8999]">
      データ追加のたびに成功確率を更新
    </div>
  </div>
)

const AllocationVisual = () => (
  <div className="rounded-lg border border-white/[0.09] bg-white/[0.025] p-4">
    <div className="flex h-9 overflow-hidden rounded">
      <span className="flex w-[60%] items-center justify-center bg-[#72b5ff] text-[0.6rem] font-bold text-[#07111f]">
        勝ち筋 60%
      </span>
      <span className="flex w-[25%] items-center justify-center bg-[#c8b9ff] text-[0.6rem] font-bold text-[#171125]">
        継続 25%
      </span>
      <span className="flex w-[15%] items-center justify-center bg-[#ffcf5a] text-[0.6rem] font-bold text-[#211900]">
        探索
      </span>
    </div>
    <div className="mt-5 grid grid-cols-3 gap-2 text-center">
      {['広告予算', 'LP流入', '営業工数'].map((item) => (
        <div
          key={item}
          className="rounded border border-white/[0.07] py-2.5 text-[0.6rem] font-semibold text-[#bfc7d2]"
        >
          {item}
        </div>
      ))}
    </div>
  </div>
)

const visuals = [FlowVisual, SimulationVisual, DataVisual, BayesianVisual, AllocationVisual]

export const PortfolioDemos = () => (
  <section id="services" className="relative border-b border-white/[0.08] bg-[#0f141c]">
    <div className="mx-auto max-w-7xl px-5 py-20 sm:px-6 md:py-28">
      <div className="grid gap-7 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
        <div>
          <div className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[#67dfb0]">
            Revenue Experiment System
          </div>
          <h2 className="mt-4 font-display text-[2.2rem] font-bold leading-[1.08] text-white md:text-[3.2rem]">
            売上を、実験できる
            <br />
            <span className="text-[#72b5ff]">仕組みに変える。</span>
          </h2>
        </div>
        <p className="max-w-[38rem] text-sm leading-7 text-[#aeb6c2] lg:ml-auto">
          分析レポートを作るだけではなく、次の施策を決め、試し、学習を残せる状態まで設計します。
          5つのサービスは独立したメニューではなく、繰り返し回るひとつの実験サイクルです。
        </p>
      </div>

      <div className="mt-10 grid grid-cols-5 overflow-hidden rounded-lg border border-white/[0.09]">
        {services.map((service) => (
          <a
            key={service.number}
            href={`#service-${service.number}`}
            className="min-w-0 border-l border-white/[0.08] px-2 py-3 text-center first:border-l-0 transition-colors hover:bg-white/[0.035]"
          >
            <span className="block text-[0.54rem] font-bold" style={{ color: service.color }}>
              {service.number}
            </span>
            <span className="mt-1 block text-[0.58rem] font-semibold text-[#c7ced8]">
              {service.action}
            </span>
          </a>
        ))}
      </div>

      <div className="mt-7 space-y-5">
        {services.map((service, index) => {
          const Icon = service.icon
          const Visual = visuals[index] ?? FlowVisual
          return (
            <article
              key={service.number}
              id={`service-${service.number}`}
              className="scroll-mt-24 rounded-lg border border-white/[0.1] bg-[#0b0f16]"
            >
              <div className="grid gap-0 lg:grid-cols-[0.88fr_1.12fr]">
                <div className="border-b border-white/[0.08] p-6 sm:p-8 lg:border-b-0 lg:border-r">
                  <div className="flex items-center gap-3">
                    <span
                      className="flex h-9 w-9 items-center justify-center rounded-lg border"
                      style={{
                        borderColor: `${service.color}55`,
                        backgroundColor: `${service.color}12`,
                      }}
                    >
                      <Icon
                        className="h-4 w-4"
                        aria-hidden={true}
                        style={{ color: service.color }}
                      />
                    </span>
                    <div>
                      <div
                        className="text-[0.58rem] font-bold tracking-[0.14em]"
                        style={{ color: service.color }}
                      >
                        {service.number} / {service.action}
                      </div>
                      <h3 className="mt-1 font-display text-xl font-bold text-white md:text-[1.55rem]">
                        {service.name}
                      </h3>
                    </div>
                  </div>
                  <p className="mt-5 max-w-[32rem] text-sm leading-7 text-[#b6beca]">
                    {service.description}
                  </p>
                  <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2">
                    {service.points.map((point) => (
                      <span
                        key={point}
                        className="inline-flex items-center gap-2 text-[0.65rem] font-semibold text-[#929cab]"
                      >
                        <span
                          className="h-1 w-1 rounded-full"
                          style={{ backgroundColor: service.color }}
                        />
                        {point}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex min-h-[230px] items-center p-5 sm:p-7">
                  <div className="w-full">
                    <Visual />
                  </div>
                </div>
              </div>
            </article>
          )
        })}
      </div>

      <div className="mt-7 flex items-center gap-3 rounded-lg border border-[#67dfb0]/20 bg-[#67dfb0]/[0.04] px-5 py-4">
        <Route className="h-5 w-5 shrink-0 text-[#67dfb0]" aria-hidden="true" />
        <p className="text-[0.72rem] leading-6 text-[#bfc7d2]">
          配分結果は次の仮説へ戻り、実験するほど会社固有の判断データが蓄積されます。
        </p>
      </div>
    </div>
  </section>
)
