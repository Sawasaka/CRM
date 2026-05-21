import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@bgm/db'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await auth()
  const userId = (session as unknown as { userId?: string })?.userId
  if (!userId) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const user = await prisma.user.findUnique({ where: { id: userId }, select: { orgId: true } })
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const { id } = await ctx.params
  const deal = await prisma.deal.findFirst({
    where: { id, orgId: user.orgId },
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
    where: { orgId: user.orgId, dealId: id },
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
