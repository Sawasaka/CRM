import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@bgm/db'
import { getCurrentAppContext } from '@/lib/demo-master'
import { getDemoDealsForApi } from '@/lib/demo-crm-data'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const context = await getCurrentAppContext({ allowDevFallback: true })
  if (!context) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const sp = req.nextUrl.searchParams
  const q = sp.get('q')?.trim() ?? ''
  const companyId = sp.get('companyId') ?? undefined
  const take = Math.min(parseInt(sp.get('take') ?? '20', 10), 100)

  if (context.isDemo) {
    const demoDeals = getDemoDealsForApi().filter((deal) => {
      if (companyId && deal.company.id !== companyId) return false
      if (!q) return true
      const needle = q.toLowerCase()
      return (
        deal.name.toLowerCase().includes(needle) ||
        deal.company.name.toLowerCase().includes(needle) ||
        (deal.contact?.name ?? '').toLowerCase().includes(needle)
      )
    })
    return NextResponse.json({ deals: demoDeals.slice(0, take) })
  }

  const where: Record<string, unknown> = { orgId: context.appOrgId }
  if (companyId) where.companyId = companyId
  if (q) {
    where.name = { contains: q, mode: 'insensitive' }
  }

  const deals = await prisma.deal.findMany({
    where,
    take,
    orderBy: { updatedAt: 'desc' },
    select: {
      id: true,
      name: true,
      stage: true,
      amount: true,
      probability: true,
      expectedCloseAt: true,
      createdAt: true,
      updatedAt: true,
      nextActionUs: true,
      desiredService: true,
      timeline: true,
      company: { select: { id: true, name: true } },
      contact: { select: { id: true, name: true } },
      owner: { select: { id: true, name: true } },
      _count: {
        select: {
          emailMessages: true,
          meetingEvents: true,
        },
      },
    },
  })

  return NextResponse.json({ deals })
}
