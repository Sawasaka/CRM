import { NextRequest, NextResponse } from 'next/server'
import { prisma, type Plan } from '@bgm/db'
import { getCustomerOpsAdminAccess } from '@/lib/admin/customer-ops'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type Payload = {
  name?: string
  status?: 'active' | 'free'
}

function cleanPayload(body: Payload) {
  const name = typeof body.name === 'string' ? body.name.trim().slice(0, 120) : ''
  const status = body.status === 'free' ? 'free' : 'active'
  if (!name) return null
  const plan: Plan = status === 'free' ? 'FREE' : 'GROWTH'
  return { name, plan }
}

export async function PATCH(req: NextRequest, props: { params: Promise<{ id: string }> }) {
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

  const body = (await req.json().catch(() => null)) as Payload | null
  const payload = body ? cleanPayload(body) : null
  if (!payload) return NextResponse.json({ error: 'invalid_payload' }, { status: 400 })

  await prisma.organization.update({
    where: { id },
    data: {
      name: payload.name,
      plan: payload.plan,
    },
  })

  return NextResponse.json({ ok: true })
}
