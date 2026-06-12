import { NextRequest, NextResponse } from 'next/server'
import { prisma, type Plan, type TenantLifecycleStatus } from '@bgm/db'
import { getCustomerOpsAdminAccess } from '@/lib/admin/customer-ops'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type ContractItemInput = { label?: unknown; value?: unknown }

type Payload = {
  name?: string
  status?: 'active' | 'demo' | 'inactive'
  demoExpiresAt?: unknown
  contractInfo?: unknown
  memo?: unknown
}

type CleanStatus = NonNullable<Payload['status']>
const DEFAULT_DEMO_DURATION_MS = 15 * 60 * 1000

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

function cleanDemoExpiresAt(raw: unknown): Date | null {
  if (raw == null || raw === '') return null
  if (typeof raw !== 'string') return null
  const date = new Date(raw)
  return Number.isNaN(date.getTime()) ? null : date
}

function cleanPayload(body: Payload) {
  const name = typeof body.name === 'string' ? body.name.trim().slice(0, 120) : ''
  const status = cleanStatus(body.status)
  const rawDemoExpiresAt = cleanDemoExpiresAt(body.demoExpiresAt)
  const demoExpiresAt =
    status === 'demo'
      ? rawDemoExpiresAt ?? new Date(Date.now() + DEFAULT_DEMO_DURATION_MS)
      : null
  const contractInfo = cleanContractInfo(body.contractInfo)
  const memo = cleanMemo(body.memo)
  if (!name) return null
  return { name, status, demoExpiresAt, contractInfo, memo }
}

function cleanStatus(status: Payload['status']): CleanStatus {
  if (status === 'demo' || status === 'inactive') return status
  return 'active'
}

function statusToUpdateData(
  status: CleanStatus,
  existingPlan: Plan,
  demoExpiresAt: Date | null
): { plan: Plan; lifecycleStatus: TenantLifecycleStatus; demoExpiresAt: Date | null } {
  if (status === 'active') return { plan: 'GROWTH', lifecycleStatus: 'ACTIVE', demoExpiresAt: null }
  if (status === 'demo') return { plan: 'FREE', lifecycleStatus: 'DEMO', demoExpiresAt }
  return { plan: existingPlan, lifecycleStatus: 'INACTIVE', demoExpiresAt: null }
}

export async function PATCH(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const access = await getCustomerOpsAdminAccess()
  if (!access.authorized) return NextResponse.json({ error: 'forbidden' }, { status: 403 })

  const { id } = await props.params
  if (!id) return NextResponse.json({ error: 'missing_id' }, { status: 400 })

  const existing = await prisma.organization.findUnique({
    where: { id },
    select: { id: true, slug: true, plan: true, lifecycleStatus: true },
  })
  if (!existing) return NextResponse.json({ error: 'not_found' }, { status: 404 })
  if (existing.slug === 'default') {
    return NextResponse.json({ error: 'default_tenant_is_readonly' }, { status: 400 })
  }

  const body = (await req.json().catch(() => null)) as Payload | null
  const payload = body ? cleanPayload(body) : null
  if (!payload) return NextResponse.json({ error: 'invalid_payload' }, { status: 400 })
  if (existing.lifecycleStatus === 'DEMO' && payload.status === 'active') {
    return NextResponse.json({ error: 'demo_tenant_cannot_be_upgraded' }, { status: 400 })
  }

  const statusData = statusToUpdateData(payload.status, existing.plan, payload.demoExpiresAt)
  const updated = await prisma.organization.update({
    where: { id },
    data: {
      name: payload.name,
      // メモと契約項目を同じJSONカラムにまとめて保存する
      contractInfo: { memo: payload.memo, items: payload.contractInfo },
      ...statusData,
    },
    select: { demoExpiresAt: true },
  })

  return NextResponse.json({
    ok: true,
    demoExpiresAt: updated.demoExpiresAt?.toISOString() ?? null,
    contractInfo: payload.contractInfo,
    memo: payload.memo,
  })
}

export async function DELETE(_req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const access = await getCustomerOpsAdminAccess()
  if (!access.authorized) return NextResponse.json({ error: 'forbidden' }, { status: 403 })

  const { id } = await props.params
  if (!id) return NextResponse.json({ error: 'missing_id' }, { status: 400 })

  const existing = await prisma.organization.findUnique({
    where: { id },
    select: { id: true, slug: true },
  })
  if (!existing) return NextResponse.json({ error: 'not_found' }, { status: 404 })
  if (existing.slug === 'default') {
    return NextResponse.json({ error: 'default_tenant_is_readonly' }, { status: 400 })
  }

  await prisma.organization.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
