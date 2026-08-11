import Image from 'next/image'
import Link from 'next/link'
import { ArrowUpRight, BarChart3, Check, Route } from 'lucide-react'
import { businessServices, type BusinessService } from '@/lib/corporate-site'
import { TrackedLink } from './TrackedLink'

function CardVisual({ service }: { service: BusinessService }) {
  if (service.id === 'koshikibase') {
    return (
      <div className="relative h-48 overflow-hidden border-b border-[#dcecf7] bg-[#eef7fc]">
        <Image
          src="/koshikibase-site-preview.png"
          alt="コーシキベースの実際のトップページ"
          fill
          sizes="(max-width: 1024px) 100vw, 33vw"
          className="object-cover object-top transition duration-500 group-hover:scale-[1.02]"
        />
        <span className="absolute right-3 top-3 rounded-full border border-white/80 bg-white/92 px-3 py-1 text-[10px] font-black text-[#0b3155] shadow-sm">
          LIVE MEDIA
        </span>
      </div>
    )
  }

  if (service.id === 'gtm') {
    const labels = ['MARKET', 'PRODUCT', 'SALES', 'CS']
    return (
      <div className="relative flex h-48 items-center overflow-hidden border-b border-[#dcecf7] bg-[linear-gradient(135deg,#edf7fd_0%,#ffffff_52%,#e8f4fb_100%)] px-5">
        <div className="absolute -right-8 -top-12 h-40 w-40 rounded-full bg-[#64b5e7]/20 blur-2xl" />
        <div className="relative w-full">
          <div className="mb-5 flex items-center gap-2 text-[10px] font-black tracking-[0.16em] text-[#147dcc]">
            <Route size={15} />
            GO-TO-MARKET SYSTEM
          </div>
          <div className="grid grid-cols-4 gap-2">
            {labels.map((label, index) => (
              <div key={label} className="relative min-w-0 text-center">
                {index < labels.length - 1 ? (
                  <span className="absolute left-[58%] top-4 h-px w-[84%] bg-[#8bc7ea]" aria-hidden="true" />
                ) : null}
                <span className="relative mx-auto flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#8bc7ea] bg-white text-[10px] font-black text-[#0b3155] shadow-sm">
                  {index + 1}
                </span>
                <span className="mt-2 block truncate text-[8px] font-black tracking-[0.08em] text-[#59768b]">
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative flex h-48 items-center overflow-hidden border-b border-[#dcecf7] bg-[linear-gradient(135deg,#f6fbfe_0%,#e9f6fc_100%)] px-5">
      <div className="absolute -left-8 -top-12 h-44 w-44 rounded-full bg-[#5bb3e8]/20 blur-2xl" />
      <div className="relative w-full">
        <div className="mb-3 flex items-center gap-2 text-[10px] font-black tracking-[0.16em] text-[#147dcc]">
          <BarChart3 size={15} />
          LEARNING INFRASTRUCTURE
        </div>
        <div className="space-y-2">
          {[
            ['OWNED MEDIA', 'bg-[#dff1fb] text-[#0b5f91]'],
            ['MEASUREMENT', 'bg-[#cce8f8] text-[#0b527c]'],
            ['BAYES / BANDIT', 'bg-[#0b3155] text-white'],
          ].map(([label, className]) => (
            <div key={label} className={`rounded-lg px-4 py-2 text-[9px] font-black tracking-[0.16em] ${className}`}>
              {label}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function CardBody({ service }: { service: BusinessService }) {
  return (
    <>
      <CardVisual service={service} />
      <div className="flex flex-1 flex-col p-6 sm:p-7">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-black tracking-[0.18em] text-[#147dcc]">
              {service.number} / {service.audience}
            </p>
            <h3 className="mt-3 text-xl font-black tracking-[-0.025em] text-[#0b3155] sm:text-2xl">
              {service.title}
            </h3>
            <p className="mt-1 text-[9px] font-bold tracking-[0.13em] text-[#7891a3]">
              {service.englishTitle}
            </p>
          </div>
          {service.external ? <ArrowUpRight className="shrink-0 text-[#147dcc]" size={20} /> : null}
        </div>
        <p className="mt-5 text-sm leading-7 text-[#597488]">{service.description}</p>
        <ul className="mt-5 space-y-2">
          {service.points.map((point) => (
            <li key={point} className="flex items-start gap-2 text-xs font-semibold leading-6 text-[#365b75]">
              <Check className="mt-1 shrink-0 text-[#147dcc]" size={14} />
              {point}
            </li>
          ))}
        </ul>
        <span className="mt-auto flex items-center gap-2 pt-7 text-sm font-black text-[#147dcc]">
          {service.cta}
          {service.external ? <ArrowUpRight size={16} /> : <span aria-hidden="true">→</span>}
        </span>
      </div>
    </>
  )
}

export function BusinessCards() {
  return (
    <div className="grid items-stretch gap-5 lg:grid-cols-3">
      {businessServices.map((service) => {
        const className =
          'group flex h-full min-h-[35rem] flex-col overflow-hidden rounded-[1.5rem] border border-[#d9eaf5] bg-white shadow-[0_18px_55px_rgba(11,49,85,0.08)] transition hover:-translate-y-1 hover:border-[#8bc7ea] hover:shadow-[0_24px_70px_rgba(11,49,85,0.14)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#147dcc]'

        if (service.external) {
          return (
            <TrackedLink
              key={service.id}
              href={service.href}
              target="_blank"
              rel="noopener noreferrer"
              eventName="corporate_service_click"
              eventParams={{ service: service.id, placement: 'business_grid' }}
              className={className}
            >
              <CardBody service={service} />
            </TrackedLink>
          )
        }

        return (
          <Link key={service.id} href={service.href} className={className}>
            <CardBody service={service} />
          </Link>
        )
      })}
    </div>
  )
}
