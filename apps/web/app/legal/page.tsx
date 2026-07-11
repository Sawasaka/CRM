import type { Metadata } from 'next'
import Link from 'next/link'
import { publicSiteUrl } from '@/lib/public-site'
import { primaryLegalDocuments, supplementalLegalDocuments } from './_content'

export const metadata: Metadata = {
  metadataBase: new URL(publicSiteUrl),
  title: '法務ドキュメント | ルキスマLAB | 株式会社ルーキースマートジャパン',
  description: 'ルキスマLABの利用規約、プライバシーポリシー、特定商取引法に基づく表記です。',
  alternates: {
    canonical: '/legal',
  },
}

export default function LegalIndexPage() {
  return (
    <main className="min-h-screen bg-[#0e0e10] text-[#e4e2e4]">
      <div className="mx-auto max-w-5xl px-6 py-16 md:py-24">
        <Link href="/" className="text-sm text-[#abc7ff] hover:text-white">
          ルキスマLAB
        </Link>
        <div className="mt-8 max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7e7c83]">Legal</p>
          <h1 className="mt-3 font-display text-4xl font-bold md:text-5xl">法務ドキュメント</h1>
          <p className="mt-5 text-sm leading-7 text-[#aaa7ad]">
            ルキスマLABの利用条件、個人情報の取扱い、販売条件をまとめています。
            AI機能やCookieに関する補足ポリシーも必要に応じて確認できます。
          </p>
        </div>

        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {primaryLegalDocuments.map((document) => (
            <Link
              key={document.slug}
              href={`/legal/${document.slug}`}
              className="rounded-lg bg-[#1b1b1d] p-5 shadow-[inset_0_0_0_1px_rgba(171,199,255,0.10)] transition hover:bg-[#242426]"
            >
              <div className="flex items-start justify-between gap-4">
                <h2 className="font-display text-xl font-semibold text-white">{document.title}</h2>
                <span className="shrink-0 text-xs text-[#7e7c83]">{document.updatedAt}</span>
              </div>
              <p className="mt-3 text-sm leading-6 text-[#aaa7ad]">{document.description}</p>
            </Link>
          ))}
        </div>

        <section className="mt-14">
          <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7e7c83]">
            Supplemental
          </h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {supplementalLegalDocuments.map((document) => (
              <Link
                key={document.slug}
                href={`/legal/${document.slug}`}
                className="rounded-lg bg-[#151518] p-5 shadow-[inset_0_0_0_1px_rgba(171,199,255,0.08)] transition hover:bg-[#1b1b1d]"
              >
                <div className="flex items-start justify-between gap-4">
                  <h3 className="font-display text-lg font-semibold text-white">
                    {document.title}
                  </h3>
                  <span className="shrink-0 text-xs text-[#7e7c83]">{document.updatedAt}</span>
                </div>
                <p className="mt-3 text-sm leading-6 text-[#aaa7ad]">{document.description}</p>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}
