import Link from 'next/link'
import { ArrowLeft, ShieldAlert } from 'lucide-react'
import { prisma } from '@bgm/db'
import { DemoAccessForm } from './DemoAccessForm'

export const dynamic = 'force-dynamic'

export default async function DemoAccessPage({
  searchParams,
}: {
  searchParams: Promise<{ tenant?: string }>
}) {
  const { tenant } = await searchParams
  const slug = typeof tenant === 'string' ? tenant.trim().toLowerCase() : ''
  const org = slug
    ? await prisma.organization.findUnique({
        where: { slug },
        select: {
          id: true,
          name: true,
          slug: true,
          lifecycleStatus: true,
          demoExpiresAt: true,
        },
      })
    : null

  if (
    !org ||
    org.slug === 'default' ||
    org.lifecycleStatus !== 'DEMO' ||
    (org.demoExpiresAt && org.demoExpiresAt <= new Date())
  ) {
    return <InvalidDemoLink />
  }

  return (
    <main className="min-h-screen bg-[#0a0a0c] text-[#e7e5ea] px-5 py-10 md:py-14">
      <div className="mx-auto w-full max-w-[520px]">
        <Link
          href="/lp"
          className="inline-flex items-center gap-1.5 text-[12px] text-[#9b99a0] hover:text-[#e7e5ea] transition-colors mb-8"
        >
          <ArrowLeft size={13} />
          ルキスマCRMへ戻る
        </Link>

        <div
          className="rounded-[24px] p-[1px]"
          style={{
            background:
              'linear-gradient(135deg, rgba(171,199,255,0.35), rgba(0,113,227,0.16), rgba(171,199,255,0.06))',
          }}
        >
          <section
            className="rounded-[23px] px-6 py-7 md:px-8 md:py-8"
            style={{
              background:
                'linear-gradient(180deg, rgba(18,18,22,0.98) 0%, rgba(12,12,16,0.99) 100%)',
              boxShadow: '0 24px 70px rgba(0,0,0,0.42), inset 1px 1px 0 rgba(255,255,255,0.04)',
            }}
          >
            <div className="text-[11px] font-semibold uppercase tracking-[0.16em] fo-gradient-text">
              ルキスマCRM 無料デモ
            </div>
            <h1 className="mt-2 font-display text-[1.75rem] md:text-[2rem] font-bold tracking-[-0.025em]">
              {org.name}様 専用デモ登録
            </h1>
            <p className="mt-3 text-[13px] leading-relaxed text-[#9b99a0]">
              下記を入力すると、設定された有効期限まで使えるデモ環境URLを発行します。
              デモ内のデータはサンプルデータです。
            </p>

            <DemoAccessForm tenantSlug={org.slug} companyName={org.name} />
          </section>
        </div>
      </div>
    </main>
  )
}

function InvalidDemoLink() {
  return (
    <main className="min-h-screen flex items-center justify-center px-6 bg-[#0a0a0c] text-[#e7e5ea]">
      <div className="text-center max-w-[460px]">
        <div
          className="mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-8"
          style={{
            background: 'rgba(255,107,107,0.10)',
            boxShadow: '0 0 0 1px rgba(255,107,107,0.24)',
          }}
        >
          <ShieldAlert size={28} color="#ff8d8d" strokeWidth={2} />
        </div>
        <h1 className="font-display font-bold text-[1.45rem] tracking-[-0.015em]">
          デモリンクが無効です
        </h1>
        <p className="mt-3 text-[13px] text-[#9b99a0] leading-relaxed">
          URLをご確認ください。再発行が必要な場合は、担当者から新しいリンクをお送りします。
        </p>
      </div>
    </main>
  )
}
