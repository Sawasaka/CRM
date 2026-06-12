import { NextRequest, NextResponse } from 'next/server'
import { getOurBusiness, setOurBusiness, type OurBusiness } from '@/lib/our-business'
import { getCurrentAppContext } from '@/lib/demo-master'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET() {
  const context = await getCurrentAppContext()
  if (!context) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 })
  const data = await getOurBusiness(context.appOrgId)
  return NextResponse.json(data)
}

export async function PUT(req: NextRequest) {
  const context = await getCurrentAppContext()
  if (!context) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 })
  if (context.isDemo) {
    return NextResponse.json({ error: 'demo_read_only' }, { status: 403 })
  }
  const body = (await req.json().catch(() => ({}))) as Partial<OurBusiness>
  const cleaned: OurBusiness = {
    serviceName: (body.serviceName ?? '').slice(0, 200),
    industry: (body.industry ?? '').slice(0, 200),
    strengths: Array.isArray(body.strengths) ? body.strengths.slice(0, 20).map((s) => String(s).slice(0, 500)) : [],
    targetCustomer: (body.targetCustomer ?? '').slice(0, 1000),
    successCases: Array.isArray(body.successCases) ? body.successCases.slice(0, 20).map((s) => String(s).slice(0, 500)) : [],
    description: body.description ? String(body.description).slice(0, 2000) : undefined,
  }
  await setOurBusiness(context.userOrgId, cleaned)
  return NextResponse.json({ ok: true, data: cleaned })
}
