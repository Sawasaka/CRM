import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Menu } from 'lucide-react'
import type { ReactNode } from 'react'
import { CORPORATE_CONSULTATION_BOOKING_URL } from '@/lib/consultation-calendar'
import { corporateNavigation, type LinkTarget } from '@/lib/corporate-site'
import {
  companyBaseLocation,
  companyCorporateNumber,
  companyEmail,
  companyEstablishedAt,
  companyName,
  operatorName,
} from '@/lib/public-site'
import { TrackedLink } from './TrackedLink'

const primaryButton =
  'inline-flex min-h-12 items-center justify-center gap-3 bg-[#0b6fb7] px-6 py-3 text-sm font-bold tracking-[0.02em] text-white transition hover:bg-[#07588f] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0b6fb7]'

const secondaryButton =
  'inline-flex min-h-12 items-center justify-center gap-3 border border-[#9fc7df] bg-white px-6 py-3 text-sm font-bold tracking-[0.02em] text-[#123b59] transition hover:border-[#0b6fb7] hover:text-[#0b6fb7] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0b6fb7]'

const serifHeading =
  "[font-family:'Yu_Mincho','Hiragino_Mincho_ProN','Noto_Serif_JP',serif]"

export function CorporateLink({
  target,
  children,
  className,
  ariaLabel,
}: {
  target: LinkTarget
  children: ReactNode
  className?: string
  ariaLabel?: string
}) {
  if (target.kind === 'external') {
    return (
      <a
        href={target.href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
        aria-label={ariaLabel}
      >
        {children}
      </a>
    )
  }

  return (
    <Link href={target.href} className={className} aria-label={ariaLabel}>
      {children}
    </Link>
  )
}

export function CorporateLogo({ inverted = false }: { inverted?: boolean }) {
  return (
    <Link href="/" className="inline-flex min-w-0 items-center gap-3" aria-label={`${companyName} ホーム`}>
      <span className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden">
        <Image
          src="/brand/rookie-smart-japan/rsj-corporate-cat-reading-transparent.png"
          alt=""
          width={64}
          height={64}
          className="h-full w-full object-contain"
          priority
          unoptimized
        />
      </span>
      <span className="min-w-0 leading-none">
        <span className={`block text-[9px] font-bold tracking-[0.22em] ${inverted ? 'text-[#b9d9ec]' : 'text-[#0b6fb7]'}`}>
          ROOKIE SMART JAPAN
        </span>
        <span className={`mt-2 block truncate text-xs font-bold sm:text-sm ${inverted ? 'text-white' : 'text-[#163a53]'}`}>
          株式会社ルーキースマートジャパン
        </span>
      </span>
    </Link>
  )
}

export function CorporateHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-[#dceaf2] bg-white/96 backdrop-blur-xl">
      <div className="mx-auto flex min-h-[76px] max-w-[1240px] items-center justify-between gap-5 px-5 sm:px-8">
        <CorporateLogo />

        <div className="hidden lg:block">
          <BookingLink placement="header" />
        </div>

        <details className="group relative lg:hidden">
          <summary className="grid h-11 w-11 cursor-pointer list-none place-items-center border border-[#b9d8e9] bg-white text-[#153a54] marker:content-none">
            <Menu size={20} />
            <span className="sr-only">メニューを開く</span>
          </summary>
          <div className="absolute right-0 top-[calc(100%+12px)] w-[min(21rem,calc(100vw-2rem))] border border-[#cfe1eb] bg-white p-4 shadow-[0_24px_65px_rgba(18,59,89,0.16)]">
            <nav className="grid" aria-label="モバイルナビゲーション">
              {corporateNavigation.map((item) => (
                <CorporateLink
                  key={item.target.href}
                  target={item.target}
                  className="border-b border-[#e6eff4] px-2 py-3.5 text-sm font-bold text-[#34566d] last:border-0 hover:text-[#0b6fb7]"
                >
                  {item.label}
                </CorporateLink>
              ))}
            </nav>
            <BookingLink placement="mobile_menu" className="mt-4 w-full" />
          </div>
        </details>
      </div>
    </header>
  )
}

export function CorporateFooter() {
  return (
    <footer id="company" className="scroll-mt-20 bg-[#0d3551] text-white">
      <div className="mx-auto max-w-[1240px] px-5 py-14 sm:px-8 lg:py-20">
        <div className="grid gap-12 border-b border-white/20 pb-12 lg:grid-cols-[1.05fr_0.65fr_1fr] lg:gap-16">
          <div>
            <CorporateLogo inverted />
            <p className="mt-6 max-w-md text-sm leading-7 text-[#c8dce8]">
              Go-to-Market・マーケティング基盤設計を通じて、事業成長を継続的に支えるマーケティングインフラと、持続的な成果を生み出す営業基盤を構築します。
            </p>
          </div>
          <div>
            <p className="text-[10px] font-bold tracking-[0.2em] text-[#8dc8ea]">BUSINESS / 事業紹介</p>
            <div className="mt-5 grid gap-3.5 text-sm font-semibold text-[#d8e7ef]">
              <a href="https://koshikibase.jp" target="_blank" rel="noopener noreferrer" className="hover:text-white">コーシキベース ↗</a>
              <a href="#gtm-download" className="hover:text-white">Go-to-Market設計</a>
              <a href="#marketing-download" className="hover:text-white">マーケティング基盤設計</a>
            </div>
            <TrackedLink
              href={CORPORATE_CONSULTATION_BOOKING_URL}
              target="_blank"
              rel="noopener noreferrer"
              eventName="corporate_booking_click"
              eventParams={{ placement: 'corporate_footer_marketing_estimate' }}
              className="group mt-6 flex items-center justify-between gap-4 border-l-2 border-[#69b7e7] bg-white/[0.06] px-4 py-4 transition hover:bg-white/[0.1]"
            >
              <span className="min-w-0">
                <span className="block text-[9px] font-bold tracking-[0.18em] text-[#8dc8ea]">INITIAL ESTIMATE</span>
                <span className="mt-2 block whitespace-nowrap text-[13px] font-bold text-white transition group-hover:text-[#8dc8ea]">
                  マーケ投資を事前試算する
                </span>
              </span>
              <span className="grid h-10 w-10 shrink-0 place-items-center border border-white/15 bg-white/[0.05] transition-transform group-hover:translate-x-0.5">
                <Image
                  src="/brand/rookie-smart-japan/rsj-corporate-cat-favicon-512.png"
                  alt=""
                  aria-hidden="true"
                  width={30}
                  height={30}
                  className="h-[30px] w-[30px] object-contain"
                />
              </span>
            </TrackedLink>
          </div>
          <div>
            <p className="text-[10px] font-bold tracking-[0.2em] text-[#8dc8ea]">COMPANY / 会社概要</p>
            <div className="mt-5 text-sm text-[#d8e7ef]">
              <p className="font-bold text-white">{companyName}</p>
              <dl className="mt-4 grid grid-cols-[4.5rem_minmax(0,1fr)] gap-x-3 gap-y-2 text-xs leading-5">
                <dt className="text-[#8fb1c4]">代表</dt>
                <dd className="font-semibold text-white">
                  <Link href="/hiroki-sawasaka" className="hover:text-[#8dc8ea]">{operatorName}</Link>
                </dd>
                <dt className="text-[#8fb1c4]">連絡先</dt>
                <dd className="min-w-0">
                  <a href={`mailto:${companyEmail}`} className="break-all hover:text-white">{companyEmail}</a>
                </dd>
                <dt className="text-[#8fb1c4]">拠点</dt>
                <dd>{companyBaseLocation}</dd>
                <dt className="text-[#8fb1c4]">設立</dt>
                <dd>{companyEstablishedAt}</dd>
                <dt className="text-[#8fb1c4]">法人番号</dt>
                <dd>{companyCorporateNumber}</dd>
              </dl>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-5 pt-7 text-[11px] text-[#9dbbcd] lg:flex-row lg:items-center lg:justify-between">
          <p>&copy; {new Date().getFullYear()} {companyName}</p>
          <nav className="flex flex-wrap gap-x-5 gap-y-2" aria-label="法務・会社情報">
            <Link href="/legal/privacy" className="hover:text-white">プライバシーポリシー</Link>
          </nav>
        </div>
      </div>
    </footer>
  )
}

export function CorporateShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen overflow-x-clip bg-white text-[#19384d] [font-family:'Hiragino_Sans','Yu_Gothic_UI','Noto_Sans_JP',sans-serif]">
      <CorporateHeader />
      {children}
      <CorporateFooter />
    </div>
  )
}

export function Container({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`mx-auto max-w-[1240px] px-5 sm:px-8 ${className}`}>{children}</div>
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'left',
}: {
  eyebrow: string
  title: ReactNode
  description?: ReactNode
  align?: 'left' | 'center'
}) {
  return (
    <div className={align === 'center' ? 'mx-auto max-w-3xl text-center' : 'max-w-3xl'}>
      <div className={`flex items-center gap-4 ${align === 'center' ? 'justify-center' : ''}`}>
        <span className="h-px w-10 bg-[#0b6fb7]" aria-hidden="true" />
        <p className="text-[10px] font-bold tracking-[0.22em] text-[#0b6fb7]">{eyebrow}</p>
      </div>
      <h2 className={`mt-5 text-[2rem] font-semibold leading-[1.45] tracking-[-0.03em] text-[#123b59] sm:text-[2.55rem] lg:text-[3rem] ${serifHeading}`}>
        {title}
      </h2>
      {description ? <div className="mt-5 text-sm leading-8 text-[#5a7484] sm:text-base sm:leading-9">{description}</div> : null}
    </div>
  )
}

export function PrimaryLink({ href, children }: { href: string; children: ReactNode }) {
  return <Link href={href} className={primaryButton}>{children}<ArrowRight size={16} /></Link>
}

export function SecondaryLink({ href, children }: { href: string; children: ReactNode }) {
  return <Link href={href} className={secondaryButton}>{children}<ArrowRight size={16} /></Link>
}

export function BookingLink({
  placement,
  className = '',
  label = '今すぐ相談する',
}: {
  placement: string
  className?: string
  label?: string
}) {
  return (
    <TrackedLink
      href={CORPORATE_CONSULTATION_BOOKING_URL}
      target="_blank"
      rel="noopener noreferrer"
      eventName="corporate_booking_click"
      eventParams={{ placement }}
      className={`${primaryButton} ${className}`}
    >
      <Image
        src="/brand/rookie-smart-japan/rsj-corporate-cat-favicon-512.png"
        alt=""
        aria-hidden="true"
        width={24}
        height={24}
        className="h-6 w-6 shrink-0 object-contain"
      />
      {label}
    </TrackedLink>
  )
}

export function FinalCallToAction({
  eyebrow = 'MARKETING INVESTMENT ESTIMATE',
  title = '投資前に、利益の見込みを試算します。',
  description = '広告費・顧客獲得コスト・利益構造などから、投資回収と施策配分を事前試算します。',
  placement = 'final_cta',
}: {
  eyebrow?: string
  title?: string
  description?: string
  placement?: string
}) {
  return (
    <section className="bg-[#edf7fc] py-16 sm:py-20 lg:py-24">
      <Container>
        <div className="relative overflow-hidden bg-[#0d3551] px-6 py-12 text-white sm:px-10 sm:py-16 lg:px-16">
          <span className="absolute -right-12 -top-24 h-72 w-72 rounded-full border-[54px] border-white/5" aria-hidden="true" />
          <div className="relative grid gap-9 lg:grid-cols-[1fr_auto] lg:items-end">
            <div className="max-w-3xl">
              <p className="text-[10px] font-bold tracking-[0.22em] text-[#8dc8ea]">{eyebrow}</p>
              <h2 className={`mt-5 text-2xl font-semibold leading-[1.5] sm:text-3xl lg:whitespace-nowrap lg:text-4xl ${serifHeading}`}>{title}</h2>
              <p className="mt-4 max-w-2xl text-sm leading-8 text-[#c9dce7] sm:text-base lg:max-w-none lg:whitespace-nowrap">{description}</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row lg:justify-end">
              <BookingLink
                placement={placement}
                label="マーケ投資を事前試算する"
                className="w-full bg-white !text-[#123b59] hover:bg-[#e7f4fb] sm:w-auto"
              />
            </div>
          </div>
        </div>
      </Container>
    </section>
  )
}
