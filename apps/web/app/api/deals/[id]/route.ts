import { NextResponse } from 'next/server'
import { prisma } from '@bgm/db'
import { getCurrentAppContext } from '@/lib/demo-master'
import { getDemoDealsForApi } from '@/lib/demo-crm-data'

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
  if (!deal && context.isDemo) {
    const demoDeal = getDemoDealsForApi().find((item) => item.id === id)
    if (demoDeal) {
      return NextResponse.json({
        deal: {
          id: demoDeal.id,
          name: demoDeal.name,
          stage: demoDeal.stage,
          amount: demoDeal.amount,
          probability: demoDeal.probability,
          expectedCloseAt: demoDeal.expectedCloseAt,
          updatedAt: demoDeal.updatedAt,
          nextActionUs: demoDeal.nextActionUs,
          timeline: demoDeal.timeline,
          desiredService: demoDeal.desiredService,
          company: demoDeal.company,
          contact: demoDeal.contact,
          owner: { name: demoDeal.owner.name },
        },
        activities: [
          {
            id: `${demoDeal.id}-activity-1`,
            type: 'MEETING',
            title: '初回商談メモ',
            content: '課題、利用部門、導入時期を確認。次回は部署別のサンプルリストを提示する。',
            occurredAt: demoDeal.updatedAt,
            metadata: null,
          },
          {
            id: `${demoDeal.id}-activity-2`,
            type: 'EMAIL',
            title: '提案資料を送付',
            content: '採用インテント、部署番号、採用予算の見方をまとめたデモ資料を送付。',
            occurredAt: demoDeal.createdAt,
            metadata: null,
          },
        ],
      })
    }
  }
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
