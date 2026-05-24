import { NextResponse } from 'next/server'
import { getCustomerOpsAdminAccess } from '@/lib/admin/customer-ops'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  const access = await getCustomerOpsAdminAccess()
  return NextResponse.json({ allowed: access.authorized })
}
