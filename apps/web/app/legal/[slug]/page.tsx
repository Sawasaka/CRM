import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getLegalDocument, legalDocuments } from '../_content'

type LegalPageProps = {
  params: Promise<{
    slug: string
  }>
}

export const dynamicParams = false

export const generateStaticParams = () =>
  legalDocuments.map((document) => ({ slug: document.slug }))

export const generateMetadata = async ({ params }: LegalPageProps): Promise<Metadata> => {
  const { slug } = await params
  const document = getLegalDocument(slug)

  if (!document) {
    return {
      title: 'Legal | ルキスマCRM',
    }
  }

  return {
    title: `${document.title} | ルキスマCRM`,
    description: document.description,
  }
}

export default async function LegalDocumentPage({ params }: LegalPageProps) {
  const { slug } = await params
  const document = getLegalDocument(slug)

  if (!document) {
    notFound()
  }

  return (
    <main className="min-h-screen bg-[#0e0e10] text-[#e4e2e4]">
      <article className="mx-auto max-w-3xl px-6 py-16 md:py-24">
        <nav className="flex items-center gap-3 text-sm text-[#8f8c90]">
          <Link href="/lp" className="text-[#abc7ff] hover:text-white">
            ルキスマCRM
          </Link>
          <span>/</span>
          <Link href="/legal" className="hover:text-white">
            Legal
          </Link>
        </nav>

        <header className="mt-8 border-b border-white/10 pb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7e7c83]">
            Legal Document
          </p>
          <h1 className="mt-3 font-display text-4xl font-bold md:text-5xl">{document.title}</h1>
          <p className="mt-5 text-sm leading-7 text-[#aaa7ad]">{document.description}</p>
          <dl className="mt-6 grid gap-3 text-xs text-[#8f8c90] sm:grid-cols-2">
            <div>
              <dt className="font-semibold text-[#c7c5c9]">最終更新</dt>
              <dd className="mt-1">{document.updatedAt}</dd>
            </div>
            <div>
              <dt className="font-semibold text-[#c7c5c9]">運営</dt>
              <dd className="mt-1">株式会社ルーキースマートジャパン</dd>
            </div>
          </dl>
        </header>

        <div className="mt-10 space-y-10">
          {document.sections.map((section) => (
            <section key={section.heading}>
              <h2 className="font-display text-2xl font-semibold text-white">{section.heading}</h2>
              <div className="mt-4 space-y-4 text-sm leading-7 text-[#c7c5c9]">
                {section.body.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </section>
          ))}
        </div>

        <footer className="mt-14 border-t border-white/10 pt-6 text-sm text-[#8f8c90]">
          <Link href="/legal" className="text-[#abc7ff] hover:text-white">
            法務ドキュメント一覧へ戻る
          </Link>
        </footer>
      </article>
    </main>
  )
}
