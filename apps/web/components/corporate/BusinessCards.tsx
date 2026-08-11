import Image from 'next/image'
import { ArrowRight, ArrowUpRight } from 'lucide-react'
import { businessServices, type BusinessService } from '@/lib/corporate-site'
import { CorporateLink } from './CorporateShell'
import { DocumentRequestButton } from './DocumentRequestButton'

function ServiceVisual({ service, featured = false }: { service: BusinessService; featured?: boolean }) {
  if (service.id === 'koshikibase') {
    return (
      <div className={`relative aspect-[16/10] overflow-hidden bg-[#e8f3f9] ${featured ? 'lg:h-full lg:aspect-auto' : ''}`}>
        <Image
          src="/koshikibase-site-preview.png"
          alt="コーシキベースの実際のサイト画面"
          fill
          sizes="(max-width: 1024px) 100vw, 38vw"
          className="object-cover object-top transition duration-700 group-hover:scale-[1.025]"
        />
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#0d3551]/80 via-[#0d3551]/20 to-transparent px-6 pb-5 pt-16 text-white">
          <p className="text-[9px] font-bold tracking-[0.18em]">SEO DATABASE MEDIA</p>
        </div>
      </div>
    )
  }

  if (service.id === 'gtm') {
    return (
      <div className="relative aspect-[16/10] overflow-hidden bg-[#edf7fc]">
        <Image
          src="/corporate-v2/marketing-service-card-founder.jpg"
          alt="チームとデータを確認しながらGo-to-Market戦略を話し合う代表の沢坂弘樹"
          fill
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-cover transition duration-700 group-hover:scale-[1.025]"
        />
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#0d3551]/85 via-[#0d3551]/35 to-transparent px-6 pb-5 pt-16 text-white">
          <p className="text-[9px] font-bold tracking-[0.18em]">GTM STRATEGY DESIGN</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative aspect-[16/10] overflow-hidden bg-[#0d3551]">
      <Image
        src="/corporate-v2/marketing-service-card-night-strategy-navy.jpg"
        alt="夜の制作スタジオでチームとマーケティング戦略を組み立てる沢坂弘樹"
        fill
        sizes="(max-width: 1024px) 100vw, 50vw"
        className="object-cover transition duration-700 group-hover:scale-[1.025]"
      />
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#0d3551]/90 via-[#0d3551]/35 to-transparent px-6 pb-5 pt-16 text-white">
        <p className="text-[9px] font-bold tracking-[0.18em]">MARKETING LEARNING SYSTEM</p>
      </div>
    </div>
  )
}

function ServiceHighlight({ service, className = '' }: { service: BusinessService; className?: string }) {
  if (!service.highlight) return null

  return (
    <div className={`border-y border-[#b9d9e9] bg-[#f3f9fc] px-5 py-4 ${className}`}>
      <p className="text-[9px] font-bold tracking-[0.18em] text-[#0b6fb7]">{service.highlight.eyebrow}</p>
      <div className="mt-2 flex items-end gap-3 text-[#123b59]">
        <span className="[font-family:'Yu_Mincho','Hiragino_Mincho_ProN',serif] text-5xl font-semibold leading-none text-[#0b6fb7]">{service.highlight.value}</span>
        <strong className="pb-1 text-sm leading-6">{service.highlight.label}</strong>
      </div>
      <p className="mt-2 text-[9px] leading-5 text-[#6b8797]">{service.highlight.note}</p>
    </div>
  )
}

function ServiceAchievements({ service }: { service: BusinessService }) {
  if (!service.achievements) return null

  return (
    <div className="mt-5">
      <div>
        <p className="text-[9px] font-bold tracking-[0.18em] text-[#7c95a4]">{service.achievementLabel ?? '主な実績'}</p>
      </div>
      <div className="mt-3 overflow-hidden border border-[#c9dde8] bg-white">
        {service.achievements.map((achievement, index) => (
          <article key={achievement.title} className="min-h-[112px] border-b border-[#d9e7ee] px-5 py-4 last:border-b-0 lg:min-h-[108px]">
            <div className="grid grid-cols-[2rem_minmax(0,1fr)] items-center gap-x-4 sm:grid-cols-[2rem_minmax(0,1fr)_auto]">
              <span className="flex h-8 w-8 items-center justify-center bg-[#0b6fb7] text-[9px] font-bold tabular-nums text-white">0{index + 1}</span>
              <h4 className="min-w-0 text-[9px] font-bold leading-5 tracking-[0.1em] text-[#6b8797]">{achievement.title}</h4>
              <p className="col-start-2 mt-1 min-w-0 text-sm font-bold leading-6 tracking-[-0.01em] text-[#123b59] [font-variant-numeric:tabular-nums] sm:col-start-3 sm:row-start-1 sm:mt-0 sm:text-right">{achievement.metric}</p>
            </div>
            {achievement.description ? (
              <p className="mt-3 border-l border-[#88bdd8] pl-3 text-[11px] leading-5 text-[#587383] sm:ml-12 sm:mt-2 sm:truncate">
                {achievement.description}
              </p>
            ) : null}
          </article>
        ))}
      </div>
    </div>
  )
}

function ServiceCard({ service, featured = false }: { service: BusinessService; featured?: boolean }) {
  const documentType = service.id === 'gtm'
    ? 'gtm'
    : service.id === 'marketing-infrastructure'
      ? 'marketing'
      : null
  const downloadId = documentType === 'gtm'
    ? 'gtm-download'
    : documentType === 'marketing'
      ? 'marketing-download'
      : undefined
  const baseClassName = `group flex h-full flex-col border border-[#cfe0e9] bg-white ${featured ? 'lg:grid lg:grid-cols-[1.15fr_0.85fr]' : ''}`
  const cardContent = (
    <>
      <ServiceVisual service={service} featured={featured} />
      <div className={`flex flex-1 flex-col p-6 sm:p-8 ${featured ? 'lg:p-5' : ''}`}>
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <p className="text-[9px] font-bold tracking-[0.2em] text-[#0b6fb7]">{service.number} / {service.audience}</p>
            <h3 className="mt-3 [font-family:'Yu_Mincho','Hiragino_Mincho_ProN',serif] text-2xl font-semibold leading-[1.45] text-[#123b59]">{service.title}</h3>
            {service.achievements ? (
              <div className={`mt-2 min-h-11 ${documentType ? 'flex flex-col gap-3' : 'flex items-center'}`}>
                {service.strategy ? (
                  <p className="min-w-0 text-[11px] font-semibold leading-6 tracking-[-0.025em] lg:whitespace-nowrap">
                    <span className="font-bold text-[#0b6fb7]">{service.strategy.label}</span>
                    <span className="ml-1 text-[#587383]">による{service.strategy.description}</span>
                  </p>
                ) : (
                  <ul className={`min-w-0 flex flex-wrap gap-x-3 gap-y-1 text-[10px] font-semibold leading-5 ${service.points.length === 1 ? 'tracking-[0.08em] text-[#0b6fb7]' : 'text-[#5f7b8b]'}`}>
                    {service.points.map((point, index) => (
                      <li key={point} className="flex items-center gap-1.5">
                        {service.points.length > 1 ? <span className="text-[8px] font-bold text-[#0b6fb7]">0{index + 1}</span> : null}
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                )}
                {documentType ? (
                  <div id={downloadId} className="w-full scroll-mt-24 sm:ml-auto sm:w-[164px]">
                    <DocumentRequestButton documentType={documentType} />
                  </div>
                ) : null}
              </div>
            ) : service.englishTitle ? (
              <p className="mt-1 text-[9px] font-bold tracking-[0.14em] text-[#7c95a4]">{service.englishTitle}</p>
            ) : null}
          </div>
          {service.target.kind === 'external' ? (
            <ArrowUpRight size={20} className="shrink-0 text-[#0b6fb7]" />
          ) : null}
        </div>
        {service.achievements ? (
          <ServiceAchievements service={service} />
        ) : (
          <p className={`mt-5 text-sm leading-8 text-[#587383] ${featured ? 'lg:mt-3 lg:leading-6' : ''}`}>{service.description}</p>
        )}
        {!service.achievements ? (
          <>
            {service.pointsLabel ? <p className={`text-[9px] font-bold tracking-[0.18em] text-[#7c95a4] ${featured ? 'mt-3 lg:mt-2' : 'mt-5'}`}>{service.pointsLabel}</p> : null}
            <ul className={`grid gap-2 text-xs font-semibold leading-6 text-[#3f6074] ${service.pointsLabel ? 'mt-2' : 'mt-5'} ${featured ? 'lg:gap-1 lg:leading-5' : ''}`}>
              {service.points.map((point) => <li key={point} className="border-l border-[#88bdd8] pl-3">{point}</li>)}
            </ul>
          </>
        ) : null}
        <ServiceHighlight service={service} className={`mt-6 ${featured ? 'lg:mt-3 lg:py-[10px]' : ''}`} />
        {!service.achievements ? (
          <span className={`mt-auto flex items-center gap-2 pt-7 text-sm font-bold text-[#0b6fb7] ${featured ? 'lg:pt-3' : ''}`}>
            {service.cta}{service.target.kind === 'external' ? <ArrowUpRight size={15} /> : <ArrowRight size={15} />}
          </span>
        ) : null}
      </div>
    </>
  )

  if (documentType) {
    return <div className={baseClassName}>{cardContent}</div>
  }

  return (
    <CorporateLink
      target={service.target}
      ariaLabel={service.target.kind === 'external' ? `${service.title}を新しいタブで開く` : undefined}
      className={`${baseClassName} transition hover:-translate-y-1 hover:border-[#79b6d6] hover:shadow-[0_22px_55px_rgba(18,59,89,0.12)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0b6fb7]`}
    >
      {cardContent}
    </CorporateLink>
  )
}

export function BusinessCards() {
  const mediaService = businessServices[0]!
  const corporateServices = businessServices.slice(1)
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <div className="lg:col-span-2"><ServiceCard service={mediaService} featured /></div>
      {corporateServices.map((service) => <ServiceCard key={service.id} service={service} />)}
    </div>
  )
}
