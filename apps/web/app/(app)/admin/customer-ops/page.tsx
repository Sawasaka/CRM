import { ShieldAlert } from 'lucide-react'
import { ObsPageShell } from '@/components/obsidian'
import { getCustomerOpsOverview } from '@/lib/admin/customer-ops'
import { CustomerOpsClient } from './CustomerOpsClient'

export const dynamic = 'force-dynamic'

export default async function CustomerOpsPage() {
  const result = await getCustomerOpsOverview()

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
          <p className="text-[13px]" style={{ color: 'var(--color-obs-text-muted)' }}>
            このページは FDE CRM 開発者テナント専用です。
          </p>
        </div>
      </ObsPageShell>
    )
  }

  return <CustomerOpsClient tenants={result.tenants} metrics={result.metrics} />
}
