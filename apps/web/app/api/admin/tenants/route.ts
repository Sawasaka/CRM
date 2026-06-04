import { NextRequest, NextResponse } from 'next/server'
import { prisma, type Plan } from '@bgm/db'
import { getCustomerOpsAdminAccess } from '@/lib/admin/customer-ops'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type Payload = {
  name?: string
  slug?: string
  status?: 'active' | 'free'
}

function cleanPayload(body: Payload) {
  const name = typeof body.name === 'string' ? body.name.trim().slice(0, 120) : ''
  const slug = typeof body.slug === 'string' ? body.slug.trim().toLowerCase().slice(0, 80) : ''
  const status = body.status === 'free' ? 'free' : 'active'
  if (!name || !slug) return null
  if (!/^[a-z0-9-]+$/.test(slug)) return null
  const plan: Plan = status === 'free' ? 'FREE' : 'GROWTH'
  return { name, slug, plan }
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
    },
    select: { id: true },
  })

  return NextResponse.json({ id: org.id }, { status: 201 })
}
