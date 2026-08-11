import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import {
  Container,
  CorporateShell,
} from '@/components/corporate/CorporateShell'
import { Breadcrumbs } from '@/components/corporate/ServiceBlocks'
import { companyName, publicSiteUrl } from '@/lib/public-site'
import { primaryLegalDocuments, supplementalLegalDocuments } from './_content'

export const metadata: Metadata = {
  metadataBase: new URL(publicSiteUrl),
  title: `法務ドキュメント｜${companyName}`,
  description: `${companyName}の利用規約、プライバシーポリシー、特定商取引法に基づく表記です。`,
  alternates: { canonical: '/legal' },
}

export default function LegalIndexPage() {
  return (
    <CorporateShell>
      <main>
        <section className="bg-[linear-gradient(180deg,#f7fbfe_0%,#edf7fc_100%)] py-12 sm:py-16 lg:py-20">
          <Container>
            <Breadcrumbs items={[{ label: 'ホーム', href: '/' }, { label: '法務ドキュメント' }]} />
            <div className="mt-9 max-w-3xl">
              <p className="text-[11px] font-black tracking-[0.2em] text-[#147dcc]">LEGAL</p>
              <h1 className="mt-4 text-[2.4rem] font-black leading-[1.2] tracking-[-0.035em] text-[#0b3155] sm:text-[3.2rem]">
                法務ドキュメント
              </h1>
              <p className="mt-5 text-sm leading-7 text-[#547086] sm:text-base sm:leading-8">
                サービスの利用条件、個人情報の取り扱い、販売条件をまとめています。
              </p>
            </div>
          </Container>
        </section>

        <section className="py-16 sm:py-20">
          <Container>
            <div className="grid items-stretch gap-4 md:grid-cols-3">
              {primaryLegalDocuments.map((document) => (
                <Link
                  key={document.slug}
                  href={`/legal/${document.slug}`}
                  className="group flex min-h-64 flex-col rounded-2xl border border-[#d9eaf5] bg-white p-6 shadow-[0_12px_35px_rgba(11,49,85,0.05)] transition hover:-translate-y-1 hover:border-[#8bc7ea]"
                >
                  <div className="flex items-start justify-between gap-4">
                    <h2 className="text-xl font-black leading-8 text-[#0b3155]">{document.title}</h2>
                    <span className="shrink-0 text-[10px] font-bold text-[#7891a3]">{document.updatedAt}</span>
                  </div>
                  <p className="mt-4 text-sm leading-7 text-[#5b7588]">{document.description}</p>
                  <span className="mt-auto flex items-center gap-2 pt-6 text-sm font-black text-[#147dcc]">
                    内容を確認する <ArrowRight size={15} />
                  </span>
                </Link>
              ))}
            </div>

            <section className="mt-14 border-t border-[#d9eaf5] pt-10">
              <p className="text-[10px] font-black tracking-[0.18em] text-[#147dcc]">SUPPLEMENTAL</p>
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                {supplementalLegalDocuments.map((document) => (
                  <Link
                    key={document.slug}
                    href={`/legal/${document.slug}`}
                    className="rounded-2xl border border-[#d9eaf5] bg-[#f8fbfd] p-6 transition hover:border-[#8bc7ea] hover:bg-white"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <h3 className="text-lg font-black text-[#0b3155]">{document.title}</h3>
                      <span className="shrink-0 text-[10px] font-bold text-[#7891a3]">{document.updatedAt}</span>
                    </div>
                    <p className="mt-3 text-sm leading-7 text-[#5b7588]">{document.description}</p>
                  </Link>
                ))}
              </div>
            </section>
          </Container>
        </section>
      </main>
    </CorporateShell>
  )
}
