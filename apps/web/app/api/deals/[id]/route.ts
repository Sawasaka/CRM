import { NextResponse } from 'next/server'
import { prisma } from '@bgm/db'
import { getCurrentAppContext } from '@/lib/app-context'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const context = await getCurrentAppContext()
  if (!context) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const { id } = await ctx.params
  const deal = await prisma.deal.findFirst({
    where: { id, orgId: context.appOrgId },
    select: {
      id: true,
      name: true,
      stage: true,
      amount: true,
      probability: true,
      expectedCloseAt: true,
      updatedAt: true,
      nextActionUs: true,
      timeline: true,
      desiredService: true,
      company: { select: { id: true, name: true } },
      contact: { select: { id: true, name: true, email: true, phone: true } },
      owner: { select: { name: true } },
    },
  })
  if (!deal) return NextResponse.json({ error: 'not_found' }, { status: 404 })

  const activities = await prisma.activity.findMany({
    where: { orgId: context.appOrgId, dealId: id },
    orderBy: { occurredAt: 'desc' },
    take: 50,
    select: {
      id: true,
      type: true,
      title: true,
      content: true,
      occurredAt: true,
      metadata: true,
    },
  })

  return NextResponse.json({ deal, activities })
}
