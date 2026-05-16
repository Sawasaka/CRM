import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@bgm/db'
import { getOurBusiness, setOurBusiness, type OurBusiness } from '@/lib/our-business'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

async function resolveOrgId(): Promise<string | null> {
  const session = await auth()
  const userId = (session as unknown as { userId?: string })?.userId
  if (!userId) return null
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { orgId: true } })
  return user?.orgId ?? null
}

export async function GET() {
  const orgId = await resolveOrgId()
  if (!orgId) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 })
  const data = await getOurBusiness(orgId)
  return NextResponse.json(data)
}

export async function PUT(req: NextRequest) {
  const orgId = await resolveOrgId()
  if (!orgId) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 })
  const body = (await req.json().catch(() => ({}))) as Partial<OurBusiness>
  const cleaned: OurBusiness = {
    serviceName: (body.serviceName ?? '').slice(0, 200),
    industry: (body.industry ?? '').slice(0, 200),
    strengths: Array.isArray(body.strengths) ? body.strengths.slice(0, 20).map((s) => String(s).slice(0, 500)) : [],
    targetCustomer: (body.targetCustomer ?? '').slice(0, 1000),
    successCases: Array.isArray(body.successCases) ? body.successCases.slice(0, 20).map((s) => String(s).slice(0, 500)) : [],
    description: body.description ? String(body.description).slice(0, 2000) : undefined,
  }
  await setOurBusiness(orgId, cleaned)
  return NextResponse.json({ ok: true, data: cleaned })
}
