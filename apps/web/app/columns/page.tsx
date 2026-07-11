import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { ColumnsIndexClient } from './ColumnsIndexClient'
import { aiTipsColumns } from '@/lib/ai-tips-columns'
import { companyName, publicSiteUrl, serviceName } from '@/lib/public-site'

const path = '/columns'
const title = 'AI Tips コラム｜実務事例で学ぶAI活用'
const description =
  'Codex、Claude Code、AIエージェント、AI/DXインフラ設計を、営業・CS運用で再現しやすい実務事例として整理したコラムです。'

export const metadata: Metadata = {
  metadataBase: new URL(publicSiteUrl),
  title,
  description,
  keywords: ['Codex', 'OpenAI Codex', 'AI Tips', 'AI/DX', 'AIエージェント', serviceName, companyName],
  alternates: {
    canonical: path,
  },
  openGraph: {
    title,
    description,
    url: `${publicSiteUrl}${path}`,
    siteName: serviceName,
    type: 'website',
    locale: 'ja_JP',
  },
}

export default function ColumnsPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-obsidian text-[#e7e5ea]">
      <section className="relative">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(circle at 24% 18%, rgba(171,199,255,0.18), transparent 32%), radial-gradient(circle at 78% 12%, rgba(141,255,201,0.10), transparent 28%)',
          }}
        />
        <div className="relative mx-auto max-w-6xl px-6 py-14 md:py-20">
          <Link
            href="/lp"
            className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.12em] text-aurora/80 transition-colors hover:text-aurora"
          >
            <ArrowRight size={14} className="rotate-180" />
            FDE AI/DX 公式HPへ
          </Link>

          <div className="mt-10 grid gap-6 border-b border-white/[0.08] pb-10 lg:grid-cols-[minmax(0,1.35fr)_minmax(280px,0.65fr)] lg:items-end lg:gap-14">
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#abc7ff]">
                AI Tips / 実務ケース
              </p>
              <h1 className="mt-5 max-w-[760px] font-display text-[2.35rem] font-bold leading-[1.12] md:text-[3.7rem] lg:text-[4rem]">
                <span className="block">実務で回るAI活用を、</span>
                <span className="fo-gradient-text block">事例ベースで読む。</span>
              </h1>
            </div>
            <p className="max-w-md border-l border-[#abc7ff]/30 pl-5 text-sm leading-7 text-[#c7c5c9] md:text-[15px]">
              ツール紹介ではなく、営業・マーケ・CSの現場で今すぐ使える運用設計に落とせる実例を掲載しています。
            </p>
          </div>

          <ColumnsIndexClient columns={aiTipsColumns} />
        </div>
      </section>
    </main>
  )
}
