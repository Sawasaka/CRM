import type { Metadata } from 'next'
import Link from 'next/link'
import { legalDocuments } from './_content'

export const metadata: Metadata = {
  title: 'Legal | ルキスマCRM',
  description: 'ルキスマCRM の利用規約、プライバシーポリシー、AI利用ポリシー等です。',
}

export default function LegalIndexPage() {
  return (
    <main className="min-h-screen bg-[#0e0e10] text-[#e4e2e4]">
      <div className="mx-auto max-w-5xl px-6 py-16 md:py-24">
        <Link href="/lp" className="text-sm text-[#abc7ff] hover:text-white">
          ルキスマCRM
        </Link>
        <div className="mt-8 max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7e7c83]">Legal</p>
          <h1 className="mt-3 font-display text-4xl font-bold md:text-5xl">法務ドキュメント</h1>
          <p className="mt-5 text-sm leading-7 text-[#aaa7ad]">
            ルキスマCRM
            の利用条件、個人情報、AI機能、Cookie、特定商取引法に基づく表記をまとめています。
            正式公開前のドラフトであり、公開時には法人情報・料金・委託先を最終反映します。
          </p>
        </div>

        <div className="mt-12 grid gap-4 md:grid-cols-2">
          {legalDocuments.map((document) => (
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
      </div>
    </main>
  )
}
