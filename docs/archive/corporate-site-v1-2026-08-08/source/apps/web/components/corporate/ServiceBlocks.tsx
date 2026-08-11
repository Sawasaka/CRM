import Link from 'next/link'
import { ArrowRight, Check, ChevronRight, Database, Search, Target } from 'lucide-react'
import type { ReactNode } from 'react'
import type { ProofMetric, ServicePhase } from '@/lib/corporate-site'
import { BookingLink, Container } from './CorporateShell'

export function Breadcrumbs({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <nav className="flex flex-wrap items-center gap-2 text-xs font-semibold text-[#6d8799]" aria-label="パンくず">
      {items.map((item, index) => (
        <span key={`${item.label}-${index}`} className="flex items-center gap-2">
          {index > 0 ? <ChevronRight size={13} className="text-[#9bb5c6]" /> : null}
          {item.href ? (
            <Link href={item.href} className="hover:text-[#147dcc]">
              {item.label}
            </Link>
          ) : (
            <span className="text-[#36566e]">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  )
}

export function ServicePageHero({
  eyebrow,
  title,
  description,
  tags,
  children,
  placement,
}: {
  eyebrow: string
  title: ReactNode
  description: string
  tags: string[]
  children: ReactNode
  placement: string
}) {
  return (
    <section className="relative overflow-hidden bg-[linear-gradient(180deg,#f7fbfe_0%,#eef7fc_60%,#ffffff_100%)] py-10 sm:py-14 lg:py-20">
      <div className="pointer-events-none absolute left-[7%] top-2 h-56 w-56 rounded-full bg-[#8bcdf4]/20 blur-3xl" />
      <Container className="relative">
        <Breadcrumbs items={[{ label: 'ホーム', href: '/' }, { label: '法人向けサービス', href: '/services' }, { label: eyebrow }]} />
        <div className="mt-10 grid gap-10 lg:grid-cols-[1.02fr_0.98fr] lg:items-center lg:gap-14">
          <div>
            <p className="text-[11px] font-black tracking-[0.2em] text-[#147dcc]">{eyebrow}</p>
            <h1 className="mt-5 text-[2.55rem] font-black leading-[1.12] tracking-[-0.045em] text-[#0b3155] sm:text-[3.6rem] lg:text-[4.4rem]">
              {title}
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-[#4d6c82] sm:text-lg sm:leading-9">{description}</p>
            <div className="mt-6 flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span key={tag} className="rounded-full border border-[#c8e0ef] bg-white px-3 py-1.5 text-[11px] font-bold text-[#365e78]">
                  {tag}
                </span>
              ))}
            </div>
            <div className="mt-8">
              <BookingLink placement={placement} />
            </div>
          </div>
          {children}
        </div>
      </Container>
    </section>
  )
}

export function PhaseGrid({ phases, columns = 3 }: { phases: ServicePhase[]; columns?: 3 | 4 }) {
  const gridClass = columns === 4 ? 'lg:grid-cols-4' : 'lg:grid-cols-3'

  return (
    <div className={`grid gap-4 sm:grid-cols-2 ${gridClass}`}>
      {phases.map((phase) => (
        <article key={phase.number} className="flex min-h-52 flex-col rounded-2xl border border-[#d9eaf5] bg-white p-5 shadow-[0_12px_35px_rgba(11,49,85,0.055)] sm:p-6">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#e4f3fb] text-[11px] font-black text-[#147dcc]">
            {phase.number}
          </span>
          <h3 className="mt-5 text-lg font-black leading-7 tracking-[-0.02em] text-[#0b3155]">{phase.title}</h3>
          <p className="mt-3 text-sm leading-7 text-[#5c7689]">{phase.description}</p>
        </article>
      ))}
    </div>
  )
}

export function DeliverablesGrid({ items }: { items: readonly string[] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item) => (
        <div key={item} className="flex min-h-20 items-center gap-3 rounded-2xl border border-[#d9eaf5] bg-white px-4 py-4 shadow-[0_8px_24px_rgba(11,49,85,0.045)]">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#e4f3fb] text-[#147dcc]">
            <Check size={14} strokeWidth={3} />
          </span>
          <span className="text-sm font-bold leading-6 text-[#284d68]">{item}</span>
        </div>
      ))}
    </div>
  )
}

export function ProofMetrics({ metrics }: { metrics: ProofMetric[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
      {metrics.map((metric) => (
        <div key={metric.label} className="rounded-2xl border border-[#cfe4f3] bg-white p-4 sm:p-5">
          <p className="text-2xl font-black tracking-[-0.03em] text-[#0b3155] sm:text-3xl">{metric.value}</p>
          <p className="mt-2 text-xs font-bold leading-5 text-[#4f6d82]">{metric.label}</p>
          {metric.note ? <p className="mt-2 text-[9px] font-semibold leading-4 text-[#8098a9]">{metric.note}</p> : null}
        </div>
      ))}
    </div>
  )
}

export function GtmLifecycleVisual() {
  const nodes = [
    ['01', '市場'],
    ['02', '価値'],
    ['03', '商品'],
    ['04', '集客'],
    ['05', '営業'],
    ['06', 'CS'],
    ['07', '学習'],
  ]

  return (
    <div className="relative rounded-[1.75rem] border border-[#cfe4f3] bg-white p-5 shadow-[0_24px_70px_rgba(11,49,85,0.12)] sm:p-7">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-[9px] font-black tracking-[0.18em] text-[#147dcc]">GTM BLUEPRINT</p>
          <p className="mt-2 text-lg font-black text-[#0b3155]">市場から学習までをつなぐ</p>
        </div>
        <Target className="text-[#147dcc]" size={26} />
      </div>
      <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
        {nodes.map(([number, label], index) => (
          <div key={number} className={`relative rounded-xl border p-3 ${index === nodes.length - 1 ? 'border-[#147dcc] bg-[#0b3155] text-white' : 'border-[#d9eaf5] bg-[#f7fbfe] text-[#0b3155]'}`}>
            <p className={`text-[9px] font-black ${index === nodes.length - 1 ? 'text-[#8bcdf4]' : 'text-[#147dcc]'}`}>{number}</p>
            <p className="mt-2 text-sm font-black">{label}</p>
          </div>
        ))}
      </div>
      <div className="mt-6 rounded-xl bg-[#eef7fc] px-4 py-3 text-xs font-bold leading-6 text-[#365e78]">
        顧客の声と実績データを、次のプロダクト・戦略・営業プロセスへ戻します。
      </div>
    </div>
  )
}

export function MarketingStackVisual() {
  const layers = [
    { icon: Search, label: 'OWNED MEDIA', title: '検索意図と独自データ', tone: 'bg-[#e5f4fc] border-[#b9dced]' },
    { icon: Database, label: 'MEASUREMENT', title: '流入・商談・受注の接続', tone: 'bg-[#cfeafa] border-[#9fcde8]' },
    { icon: Target, label: 'EXPERIMENT', title: 'ベイズ判断とバンディット配分', tone: 'bg-[#0b3155] border-[#0b3155] text-white' },
  ]

  return (
    <div className="rounded-[1.75rem] border border-[#cfe4f3] bg-white p-5 shadow-[0_24px_70px_rgba(11,49,85,0.12)] sm:p-7">
      <p className="text-[9px] font-black tracking-[0.18em] text-[#147dcc]">MARKETING INFRASTRUCTURE</p>
      <p className="mt-2 text-lg font-black text-[#0b3155]">集客を、学習できる3層構造へ</p>
      <div className="mt-7 space-y-3">
        {layers.map(({ icon: Icon, label, title, tone }, index) => (
          <div key={label} className={`flex items-center gap-4 rounded-2xl border p-4 ${tone}`}>
            <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${index === layers.length - 1 ? 'bg-white/12 text-white' : 'bg-white text-[#147dcc]'}`}>
              <Icon size={18} />
            </span>
            <div>
              <p className={`text-[8px] font-black tracking-[0.15em] ${index === layers.length - 1 ? 'text-[#8bcdf4]' : 'text-[#147dcc]'}`}>{label}</p>
              <p className="mt-1 text-sm font-black leading-6">{title}</p>
            </div>
          </div>
        ))}
      </div>
      <p className="mt-5 text-xs font-semibold leading-6 text-[#627c8e]">
        クリック数で終わらせず、商談・受注・粗利までの学習を次の配分に反映します。
      </p>
    </div>
  )
}

export function InlineTextLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className="inline-flex items-center gap-2 text-sm font-black text-[#147dcc] hover:text-[#0b6da8]">
      {children}
      <ArrowRight size={15} />
    </Link>
  )
}
