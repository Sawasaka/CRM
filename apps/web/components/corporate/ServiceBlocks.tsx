import Link from 'next/link'
import { ArrowRight, Check, ChevronRight, Database, Search, Target } from 'lucide-react'
import type { ReactNode } from 'react'
import type { ProofMetric, ServicePhase } from '@/lib/corporate-site'
import { BookingLink, Container } from './CorporateShell'

export function Breadcrumbs({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <nav className="flex flex-wrap items-center gap-2 text-[11px] font-semibold text-[#718a99]" aria-label="パンくず">
      {items.map((item, index) => (
        <span key={`${item.label}-${index}`} className="flex items-center gap-2">
          {index > 0 ? <ChevronRight size={12} className="text-[#9eb5c2]" /> : null}
          {item.href ? <Link href={item.href} className="hover:text-[#0b6fb7]">{item.label}</Link> : <span className="text-[#36576b]">{item.label}</span>}
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
    <section className="relative overflow-hidden border-b border-[#d8e8f0] bg-[#edf7fc] py-10 sm:py-14 lg:py-20">
      <div className="absolute right-[-8rem] top-[-10rem] h-[30rem] w-[30rem] rounded-full border-[70px] border-white/60" aria-hidden="true" />
      <Container className="relative">
        <Breadcrumbs items={[{ label: 'ホーム', href: '/' }, { label: '法人向けサービス', href: '/services' }, { label: eyebrow }]} />
        <div className="mt-10 grid gap-12 lg:grid-cols-[1.02fr_0.98fr] lg:items-center lg:gap-16">
          <div>
            <p className="flex items-center gap-4 text-[10px] font-bold tracking-[0.22em] text-[#0b6fb7]"><span className="h-px w-10 bg-[#0b6fb7]" />{eyebrow}</p>
            <h1 className="mt-6 [font-family:'Yu_Mincho','Hiragino_Mincho_ProN',serif] text-[2.6rem] font-semibold leading-[1.4] tracking-[-0.045em] text-[#123b59] sm:text-[3.7rem] lg:text-[4.45rem]">{title}</h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-[#506d7e] sm:text-lg sm:leading-9">{description}</p>
            <div className="mt-6 flex flex-wrap gap-2">
              {tags.map((tag) => <span key={tag} className="border border-[#b8d6e6] bg-white px-3 py-2 text-[10px] font-bold text-[#365e75]">{tag}</span>)}
            </div>
            <div className="mt-8"><BookingLink placement={placement} /></div>
          </div>
          {children}
        </div>
      </Container>
    </section>
  )
}

export function PhaseGrid({ phases, columns = 3 }: { phases: ServicePhase[]; columns?: 3 | 4 }) {
  return (
    <div className={`grid border-l border-t border-[#cfe0e9] sm:grid-cols-2 ${columns === 4 ? 'lg:grid-cols-4' : 'lg:grid-cols-3'}`}>
      {phases.map((phase) => (
        <article key={phase.number} className="min-h-56 border-b border-r border-[#cfe0e9] bg-white p-6 sm:p-7">
          <span className="text-[11px] font-bold tracking-[0.16em] text-[#0b6fb7]">{phase.number}</span>
          <h3 className="mt-5 [font-family:'Yu_Mincho','Hiragino_Mincho_ProN',serif] text-lg font-semibold leading-8 text-[#123b59]">{phase.title}</h3>
          <p className="mt-3 text-sm leading-7 text-[#5b7686]">{phase.description}</p>
        </article>
      ))}
    </div>
  )
}

export function DeliverablesGrid({ items }: { items: readonly string[] }) {
  return (
    <div className="grid border-l border-t border-[#cfe0e9] sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item) => (
        <div key={item} className="flex min-h-24 items-center gap-3 border-b border-r border-[#cfe0e9] bg-white px-5 py-5">
          <Check size={15} strokeWidth={2.5} className="shrink-0 text-[#0b6fb7]" />
          <span className="text-sm font-bold leading-6 text-[#365a70]">{item}</span>
        </div>
      ))}
    </div>
  )
}

export function ProofMetrics({ metrics }: { metrics: ProofMetric[] }) {
  return (
    <div className="grid grid-cols-2 border-l border-t border-[#cfe0e9] lg:grid-cols-5">
      {metrics.map((metric) => (
        <div key={metric.label} className="border-b border-r border-[#cfe0e9] bg-white p-5 sm:p-6">
          <p className="text-3xl font-semibold tracking-[-0.04em] text-[#123b59] sm:text-4xl">{metric.value}</p>
          <p className="mt-3 text-xs font-bold leading-5 text-[#4d6a7c]">{metric.label}</p>
          {metric.note ? <p className="mt-2 text-[9px] font-semibold leading-4 text-[#8198a6]">{metric.note}</p> : null}
        </div>
      ))}
    </div>
  )
}

export function GtmLifecycleVisual() {
  const nodes = ['市場', '価値', '商品', '集客', '営業', 'CS', '学習']
  return (
    <div className="border border-[#bcd6e5] bg-white p-6 shadow-[0_22px_60px_rgba(18,59,89,0.10)] sm:p-8">
      <div className="flex items-center justify-between gap-4">
        <div><p className="text-[9px] font-bold tracking-[0.2em] text-[#0b6fb7]">GTM BLUEPRINT</p><p className="mt-2 text-lg font-bold text-[#123b59]">市場から学習までをつなぐ</p></div>
        <Target size={27} className="text-[#0b6fb7]" />
      </div>
      <div className="mt-7 grid grid-cols-2 border-l border-t border-[#cfe0e9] sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
        {nodes.map((label, index) => (
          <div key={label} className={`border-b border-r border-[#cfe0e9] p-4 ${index === nodes.length - 1 ? 'bg-[#0d3551] text-white' : 'bg-[#f7fbfd] text-[#123b59]'}`}>
            <p className={`text-[9px] font-bold ${index === nodes.length - 1 ? 'text-[#8dc8ea]' : 'text-[#0b6fb7]'}`}>0{index + 1}</p>
            <p className="mt-2 text-sm font-bold">{label}</p>
          </div>
        ))}
      </div>
      <p className="mt-5 border-l-2 border-[#0b6fb7] pl-4 text-xs font-semibold leading-6 text-[#486a7d]">顧客の声と実績データを、次のプロダクト・戦略・営業プロセスへ戻します。</p>
    </div>
  )
}

export function MarketingStackVisual() {
  const layers = [
    { icon: Search, label: 'OWNED MEDIA', title: '検索意図と独自データ' },
    { icon: Database, label: 'MEASUREMENT', title: '流入・商談・受注の接続' },
    { icon: Target, label: 'EXPERIMENT', title: 'ベイズ判断とバンディット配分' },
  ]
  return (
    <div className="border border-[#bcd6e5] bg-white p-6 shadow-[0_22px_60px_rgba(18,59,89,0.10)] sm:p-8">
      <p className="text-[9px] font-bold tracking-[0.2em] text-[#0b6fb7]">MARKETING INFRASTRUCTURE</p>
      <p className="mt-2 text-lg font-bold text-[#123b59]">集客を、学習できる3層構造へ</p>
      <div className="mt-7 grid border-l border-t border-[#cfe0e9]">
        {layers.map(({ icon: Icon, label, title }, index) => (
          <div key={label} className={`flex items-center gap-4 border-b border-r border-[#cfe0e9] p-4 ${index === 2 ? 'bg-[#0d3551] text-white' : index === 1 ? 'bg-[#dff0f9]' : 'bg-[#f4fafd]'}`}>
            <Icon size={19} className={index === 2 ? 'text-[#8dc8ea]' : 'text-[#0b6fb7]'} />
            <div><p className={`text-[8px] font-bold tracking-[0.16em] ${index === 2 ? 'text-[#8dc8ea]' : 'text-[#0b6fb7]'}`}>{label}</p><p className="mt-1 text-sm font-bold leading-6">{title}</p></div>
          </div>
        ))}
      </div>
      <p className="mt-5 text-xs font-semibold leading-6 text-[#5e7887]">クリック数で終わらせず、商談・受注・粗利までの学習を次の配分に反映します。</p>
    </div>
  )
}

export function InlineTextLink({ href, children }: { href: string; children: ReactNode }) {
  return <Link href={href} className="inline-flex items-center gap-2 text-sm font-bold text-[#0b6fb7] hover:text-[#07588f]">{children}<ArrowRight size={15} /></Link>
}
