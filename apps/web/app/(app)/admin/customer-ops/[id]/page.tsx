import Link from 'next/link'
import { ArrowLeft, ShieldAlert } from 'lucide-react'
import { ObsPageShell } from '@/components/obsidian'
import { getCustomerOpsTenantDetail } from '@/lib/admin/customer-ops'
import { TenantDetailClient } from './TenantDetailClient'

export const dynamic = 'force-dynamic'

export default async function TenantDetailPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params
  const result = await getCustomerOpsTenantDetail(id)

  if (!result.authorized) {
    return (
      <ObsPageShell>
        <div className="w-full px-8 py-16 flex flex-col items-center justify-center gap-3">
          <ShieldAlert size={48} style={{ color: '#FFC107' }} />
          <h2
            className="font-[family-name:var(--font-display)] text-xl font-semibold"
            style={{ color: 'var(--color-obs-text)' }}
          >
            アクセス権限がありません
          </h2>
        </div>
      </ObsPageShell>
    )
  }

  if (!result.tenant) {
    return (
      <ObsPageShell>
        <div className="w-full px-8 py-16">
          <Link
            href="/admin/customer-ops"
            className="inline-flex items-center gap-1.5 text-[12.5px] mb-4"
            style={{ color: 'var(--color-obs-text-muted)' }}
          >
            <ArrowLeft size={14} />
            一覧に戻る
          </Link>
          <p style={{ color: 'var(--color-obs-text)' }}>該当するテナントが見つかりません。</p>
        </div>
      </ObsPageShell>
    )
  }

  return <TenantDetailClient tenant={result.tenant} />
}
