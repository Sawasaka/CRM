/**
 * /demo-app — デモのトップ。チャット型の体験デモを表示する。
 * ロジック・データは _components/DemoApp.tsx に切り出し(クライアント側)。
 */

import Link from 'next/link'
import { ArrowRight, ShieldAlert, Sparkles } from 'lucide-react'
import { prisma } from '@bgm/db'
import { verifyDemoToken } from '@/lib/demo-token'
import { DemoApp } from './_components/DemoApp'
import { DemoShell } from './_components/DemoShell'

export default async function DemoAppPage({
  searchParams,
}: {
  searchParams: Promise<{ t?: string }>
}) {
  const { t } = await searchParams
  const claims = await verifyDemoToken(t)
  if (!claims) return <ExpiredPage />
  if (claims.tenantSlug) {
    const org = await prisma.organization.findUnique({
      where: { slug: claims.tenantSlug },
      select: { lifecycleStatus: true, demoExpiresAt: true },
    })
    if (!org || org.lifecycleStatus === 'INACTIVE') return <ExpiredPage />
    if (org.lifecycleStatus === 'DEMO' && org.demoExpiresAt && org.demoExpiresAt <= new Date()) {
      await prisma.organization.updateMany({
        where: { slug: claims.tenantSlug, lifecycleStatus: 'DEMO' },
        data: { lifecycleStatus: 'INACTIVE' },
      })
      return <ExpiredPage />
    }
  }
  return (
    <DemoShell claims={claims}>
      <DemoApp claims={claims} />
    </DemoShell>
  )
}

function ExpiredPage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-6 bg-[#0a0a0c] text-[#e7e5ea]">
      <div className="text-center max-w-[480px]">
        <div
          className="mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-8"
          style={{
            background: 'rgba(255,107,107,0.10)',
            boxShadow: '0 0 0 1px rgba(255,107,107,0.24)',
          }}
        >
          <ShieldAlert size={28} color="#ff8d8d" strokeWidth={2} />
        </div>
        <h1 className="font-display font-bold text-[1.6rem] tracking-[-0.015em]">
          デモリンクの期限が切れています
        </h1>
        <p className="mt-3 text-[13px] text-[#9b99a0] leading-relaxed">
          デモアクセスURLは発行から15分間のみ有効です。
          <br />
          お手数ですが、トップページから再度発行してください。
        </p>
        <Link
          href="/lp"
          className="inline-flex items-center gap-1.5 mt-8 px-5 h-11 rounded-[10px] text-[13px] font-semibold"
          style={{
            background:
              'linear-gradient(140deg, var(--color-obs-primary) 0%, var(--color-obs-primary-container) 100%)',
            color: 'var(--color-obs-on-primary)',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.18)',
          }}
        >
          <Sparkles size={13} strokeWidth={2.2} />
          デモを再発行する
          <ArrowRight size={13} />
        </Link>
      </div>
    </main>
  )
}
