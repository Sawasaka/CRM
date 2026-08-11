import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { Container, CorporateShell } from '@/components/corporate/CorporateShell'
import { Breadcrumbs } from '@/components/corporate/ServiceBlocks'
import { companyName, publicSiteUrl } from '@/lib/public-site'
import { getLegalDocument, legalDocuments } from '../_content'

type LegalPageProps = {
  params: Promise<{ slug: string }>
}

export const dynamicParams = false

export const generateStaticParams = () =>
  legalDocuments.map((document) => ({ slug: document.slug }))

export const generateMetadata = async ({ params }: LegalPageProps): Promise<Metadata> => {
  const { slug } = await params
  const document = getLegalDocument(slug)

  if (!document) return { title: `法務ドキュメント｜${companyName}` }

  return {
    metadataBase: new URL(publicSiteUrl),
    title: `${document.title}｜${companyName}`,
    description: document.description,
    alternates: { canonical: `/legal/${document.slug}` },
  }
}

export default async function LegalDocumentPage({ params }: LegalPageProps) {
  const { slug } = await params
  const document = getLegalDocument(slug)

  if (!document) notFound()

  return (
    <CorporateShell>
      <main>
        <section className="border-b border-[#dcecf7] bg-[#f7fbfe] py-10 sm:py-14">
          <Container className="max-w-5xl">
            <Breadcrumbs
              items={[
                { label: 'ホーム', href: '/' },
                { label: '法務ドキュメント', href: '/legal' },
                { label: document.title },
              ]}
            />
            <header className="mt-9 max-w-4xl">
              <p className="text-[10px] font-black tracking-[0.18em] text-[#147dcc]">LEGAL DOCUMENT</p>
              <h1 className="mt-4 text-[2rem] font-black leading-[1.2] tracking-[-0.035em] text-[#0b3155] sm:text-[3rem]">
                {document.title}
              </h1>
              <p className="mt-5 text-sm leading-7 text-[#5b7588] sm:text-base">{document.description}</p>
              <dl className="mt-6 grid gap-3 text-xs text-[#6d8799] sm:grid-cols-2">
                <div><dt className="font-black text-[#0b3155]">最終更新</dt><dd className="mt-1">{document.updatedAt}</dd></div>
                <div><dt className="font-black text-[#0b3155]">運営</dt><dd className="mt-1">{companyName}</dd></div>
              </dl>
            </header>
          </Container>
        </section>

        <article className="py-14 sm:py-20">
          <Container className="max-w-5xl">
            <div className="max-w-3xl space-y-10">
              {document.sections.map((section) => (
                <section key={section.heading}>
                  <h2 className="text-xl font-black leading-8 text-[#0b3155] sm:text-2xl">{section.heading}</h2>
                  <div className="mt-4 space-y-4 text-sm leading-8 text-[#4f6d82]">
                    {section.body.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                  </div>
                </section>
              ))}
            </div>

            <div className="mt-14 border-t border-[#d9eaf5] pt-7">
              <Link href="/legal" className="inline-flex items-center gap-2 text-sm font-black text-[#147dcc] hover:text-[#0b6da8]">
                <ArrowLeft size={16} /> 法務ドキュメント一覧へ戻る
              </Link>
            </div>
          </Container>
        </article>
      </main>
    </CorporateShell>
  )
}
