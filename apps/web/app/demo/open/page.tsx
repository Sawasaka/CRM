import { DemoOpenClient } from './DemoOpenClient'

export const dynamic = 'force-dynamic'

export default async function DemoOpenPage({
  searchParams,
}: {
  searchParams: Promise<{ tenant?: string }>
}) {
  const { tenant } = await searchParams
  const tenantSlug = typeof tenant === 'string' ? tenant.trim().toLowerCase() : ''
  return <DemoOpenClient tenantSlug={tenantSlug} />
}
