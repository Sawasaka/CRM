import { NextRequest, NextResponse } from 'next/server'
import { prisma, type Plan, type TenantLifecycleStatus } from '@bgm/db'
import { getCustomerOpsAdminAccess } from '@/lib/admin/customer-ops'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type ContractItemInput = { label?: unknown; value?: unknown }

type Payload = {
  name?: string
  slug?: string
  status?: 'active' | 'demo' | 'inactive'
  contractInfo?: unknown
  memo?: unknown
}

type CleanStatus = NonNullable<Payload['status']>

// 契約情報の自由項目を最大30件・各文字数制限でサニタイズ (空行は除外)
function cleanContractInfo(raw: unknown): { label: string; value: string }[] {
  if (!Array.isArray(raw)) return []
  return raw
    .slice(0, 30)
    .map((item) => {
      const rec = (item ?? {}) as ContractItemInput
      const label = typeof rec.label === 'string' ? rec.label.trim().slice(0, 60) : ''
      const value = typeof rec.value === 'string' ? rec.value.trim().slice(0, 500) : ''
      return { label, value }
    })
    .filter((item) => item.label !== '' || item.value !== '')
}

function cleanMemo(raw: unknown): string {
  return typeof raw === 'string' ? raw.trim().slice(0, 2000) : ''
}

function cleanPayload(body: Payload) {
  const name = typeof body.name === 'string' ? body.name.trim().slice(0, 120) : ''
  const slug = typeof body.slug === 'string' ? body.slug.trim().toLowerCase().slice(0, 80) : ''
  const status = cleanStatus(body.status)
  const contractInfo = cleanContractInfo(body.contractInfo)
  const memo = cleanMemo(body.memo)
  if (!name || !slug) return null
  if (!/^[a-z0-9-]+$/.test(slug)) return null
  return { name, slug, status, contractInfo, memo, ...statusToCreateData(status) }
}

function cleanStatus(status: Payload['status']): CleanStatus {
  if (status === 'demo' || status === 'inactive') return status
  return 'active'
}

function statusToCreateData(status: CleanStatus): {
  plan: Plan
  lifecycleStatus: TenantLifecycleStatus
} {
  if (status === 'active') return { plan: 'GROWTH', lifecycleStatus: 'ACTIVE' }
  if (status === 'demo') return { plan: 'FREE', lifecycleStatus: 'DEMO' }
  return { plan: 'GROWTH', lifecycleStatus: 'INACTIVE' }
}

export async function POST(req: NextRequest) {
  const access = await getCustomerOpsAdminAccess()
  if (!access.authorized) return NextResponse.json({ error: 'forbidden' }, { status: 403 })

  const body = (await req.json().catch(() => null)) as Payload | null
  const payload = body ? cleanPayload(body) : null
  if (!payload) return NextResponse.json({ error: 'invalid_payload' }, { status: 400 })

  const exists = await prisma.organization.findUnique({
    where: { slug: payload.slug },
    select: { id: true },
  })
  if (exists) return NextResponse.json({ error: 'slug_already_exists' }, { status: 409 })

  const org = await prisma.organization.create({
    data: {
      name: payload.name,
      slug: payload.slug,
      plan: payload.plan,
      lifecycleStatus: payload.lifecycleStatus,
      demoExpiresAt: null,
      // メモと契約項目を同じJSONカラムにまとめて保存する
      contractInfo: { memo: payload.memo, items: payload.contractInfo },
    },
    select: { id: true, demoExpiresAt: true },
  })

  return NextResponse.json(
    {
      id: org.id,
      demoExpiresAt: org.demoExpiresAt?.toISOString() ?? null,
      contractInfo: payload.contractInfo,
      memo: payload.memo,
    },
    { status: 201 }
  )
}
