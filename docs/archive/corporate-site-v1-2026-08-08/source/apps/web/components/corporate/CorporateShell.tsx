import Link from 'next/link'
import { ArrowRight, CalendarDays, Menu } from 'lucide-react'
import type { ReactNode } from 'react'
import { CONSULTATION_BOOKING_URL } from '@/lib/consultation-calendar'
import { companyName } from '@/lib/public-site'
import { corporateNavigation } from '@/lib/corporate-site'
import { TrackedLink } from './TrackedLink'

const primaryButton =
  'inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#147dcc] px-6 py-3 text-sm font-bold text-white shadow-[0_12px_30px_rgba(20,125,204,0.22)] transition hover:-translate-y-0.5 hover:bg-[#0d6fb8] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#147dcc]'

const secondaryButton =
  'inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-[#b8d9ef] bg-white px-6 py-3 text-sm font-bold text-[#0b3155] transition hover:-translate-y-0.5 hover:border-[#147dcc] hover:text-[#147dcc] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#147dcc]'

export function CorporateLogo({ inverted = false }: { inverted?: boolean }) {
  return (
    <Link href="/" className="inline-flex min-w-0 items-center gap-3" aria-label={`${companyName} ホーム`}>
      <span
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border text-xl font-black shadow-sm ${
          inverted
            ? 'border-white/20 bg-white text-[#0b3155]'
            : 'border-[#cfe4f3] bg-white text-[#0b3155]'
        }`}
        aria-hidden="true"
      >
        R
      </span>
      <span className="min-w-0">
        <span
          className={`block text-[9px] font-black tracking-[0.18em] ${
            inverted ? 'text-[#a8c9e3]' : 'text-[#147dcc]'
          }`}
        >
          ROOKIE SMART JAPAN
        </span>
        <span
          className={`mt-0.5 block truncate text-[13px] font-bold tracking-[-0.02em] sm:text-sm ${
            inverted ? 'text-white' : 'text-[#0b3155]'
          }`}
        >
          株式会社ルーキースマートジャパン
        </span>
      </span>
    </Link>
  )
}

export function CorporateHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-[#dcecf7] bg-white/94 text-[#102a43] backdrop-blur-xl">
      <div className="mx-auto flex min-h-[72px] max-w-7xl items-center justify-between gap-5 px-5 sm:px-6 lg:px-8">
        <CorporateLogo />

        <nav className="hidden items-center gap-6 lg:flex" aria-label="メインナビゲーション">
          {corporateNavigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-xs font-bold text-[#48647a] transition hover:text-[#147dcc]"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden xl:block">
          <TrackedLink
            href={CONSULTATION_BOOKING_URL}
            target="_blank"
            rel="noopener noreferrer"
            eventName="corporate_booking_click"
            eventParams={{ placement: 'header' }}
            className={primaryButton}
          >
            <CalendarDays size={16} />
            面談を予約する
          </TrackedLink>
        </div>

        <details className="group relative lg:hidden">
          <summary className="flex h-11 w-11 cursor-pointer list-none items-center justify-center rounded-full border border-[#cfe4f3] bg-white text-[#0b3155] marker:content-none">
            <Menu size={20} />
            <span className="sr-only">メニューを開く</span>
          </summary>
          <div className="absolute right-0 top-[calc(100%+12px)] w-[min(19rem,calc(100vw-2rem))] rounded-2xl border border-[#dcecf7] bg-white p-3 shadow-[0_24px_70px_rgba(11,49,85,0.18)]">
            <nav className="grid" aria-label="モバイルナビゲーション">
              {corporateNavigation.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-xl px-4 py-3 text-sm font-bold text-[#36566e] hover:bg-[#f3f8fc] hover:text-[#147dcc]"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <TrackedLink
              href={CONSULTATION_BOOKING_URL}
              target="_blank"
              rel="noopener noreferrer"
              eventName="corporate_booking_click"
              eventParams={{ placement: 'mobile_menu' }}
              className={`${primaryButton} mt-2 w-full`}
            >
              <CalendarDays size={16} />
              面談を予約する
            </TrackedLink>
          </div>
        </details>
      </div>
    </header>
  )
}

export function CorporateFooter() {
  return (
    <footer className="bg-[#0b3155] text-white">
      <div className="mx-auto max-w-7xl px-5 py-14 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid gap-10 border-b border-white/15 pb-10 lg:grid-cols-[1.25fr_0.75fr_0.75fr]">
          <div>
            <CorporateLogo inverted />
            <p className="mt-5 max-w-md text-sm leading-7 text-[#c3d9e9]">
              野球メディアの運営と、Go-to-Market・マーケティング基盤の設計を通じて、現場の挑戦を継続的な成長へつなげます。
            </p>
          </div>

          <div>
            <p className="text-[10px] font-black tracking-[0.18em] text-[#8db9d6]">BUSINESS</p>
            <div className="mt-4 grid gap-3 text-sm font-semibold text-[#dcebf5]">
              <a href="https://koshikibase.jp" target="_blank" rel="noopener noreferrer" className="hover:text-white">
                コーシキベース ↗
              </a>
              <Link href="/services/gtm" className="hover:text-white">
                Go-to-Market設計
              </Link>
              <Link href="/services/marketing-infrastructure" className="hover:text-white">
                マーケティング基盤設計
              </Link>
            </div>
          </div>

          <div>
            <p className="text-[10px] font-black tracking-[0.18em] text-[#8db9d6]">COMPANY</p>
            <div className="mt-4 grid gap-3 text-sm font-semibold text-[#dcebf5]">
              <Link href="/company" className="hover:text-white">
                会社概要
              </Link>
              <Link href="/hiroki-sawasaka" className="hover:text-white">
                代表プロフィール
              </Link>
              <Link href="/legal" className="hover:text-white">
                法務ドキュメント
              </Link>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 pt-6 text-xs text-[#94b9d2] sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; {new Date().getFullYear()} Rookie Smart Japan Inc.</p>
          <p>挑戦する人と事業に、前へ進む仕組みを。</p>
        </div>
      </div>
    </footer>
  )
}

export function CorporateShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen overflow-x-clip bg-white text-[#102a43] [font-family:'Inter','Hiragino_Sans','Yu_Gothic_UI',sans-serif]">
      <CorporateHeader />
      {children}
      <CorporateFooter />
    </div>
  )
}

export function Container({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`mx-auto max-w-7xl px-5 sm:px-6 lg:px-8 ${className}`}>{children}</div>
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
      <p className="text-[11px] font-black tracking-[0.2em] text-[#147dcc]">{eyebrow}</p>
      <h2 className="mt-4 text-[2rem] font-black leading-[1.2] tracking-[-0.035em] text-[#0b3155] sm:text-[2.5rem] lg:text-[3rem]">
        {title}
      </h2>
      {description ? (
        <div className="mt-5 text-sm leading-7 text-[#547086] sm:text-base sm:leading-8">{description}</div>
      ) : null}
    </div>
  )
}

export function PrimaryLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className={primaryButton}>
      {children}
      <ArrowRight size={16} />
    </Link>
  )
}

export function SecondaryLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className={secondaryButton}>
      {children}
      <ArrowRight size={16} />
    </Link>
  )
}

export function BookingLink({ placement, className = '' }: { placement: string; className?: string }) {
  return (
    <TrackedLink
      href={CONSULTATION_BOOKING_URL}
      target="_blank"
      rel="noopener noreferrer"
      eventName="corporate_booking_click"
      eventParams={{ placement }}
      className={`${primaryButton} ${className}`}
    >
      <CalendarDays size={17} />
      面談を予約する
    </TrackedLink>
  )
}

export function FinalCallToAction({
  eyebrow = 'CONSULTATION',
  title = 'まずは、今の課題と次の一手を整理します。',
  description = '現在の事業・データ・営業プロセスをうかがい、どこから仕組み化するべきかを一緒に考えます。',
  placement = 'final_cta',
}: {
  eyebrow?: string
  title?: string
  description?: string
  placement?: string
}) {
  return (
    <section className="bg-[#f3f8fc] py-16 sm:py-20">
      <Container>
        <div className="relative overflow-hidden rounded-[2rem] bg-[#0b3155] px-6 py-10 text-white shadow-[0_28px_80px_rgba(11,49,85,0.2)] sm:px-10 sm:py-14 lg:px-14">
          <div className="pointer-events-none absolute -right-20 -top-28 h-72 w-72 rounded-full bg-[#38a9ef]/20 blur-3xl" />
          <div className="relative grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
            <div className="max-w-3xl">
              <p className="text-[10px] font-black tracking-[0.2em] text-[#8bcdf4]">{eyebrow}</p>
              <h2 className="mt-4 text-2xl font-black leading-tight tracking-[-0.025em] sm:text-3xl lg:text-4xl">
                {title}
              </h2>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-[#c7dcea] sm:text-base">{description}</p>
            </div>
            <BookingLink placement={placement} className="w-full bg-white !text-[#0b3155] hover:bg-[#e9f5fc] sm:w-auto" />
          </div>
        </div>
      </Container>
    </section>
  )
}
