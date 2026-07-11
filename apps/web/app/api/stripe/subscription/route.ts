import { NextResponse } from 'next/server'
import { prisma, type BillingInterval, type Plan } from '@bgm/db'
import { getBillingOrg } from '@/lib/stripe/auth'
import { getMonthlyAiCreditStatus } from '@/lib/credit-usage'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function toPlanId(plan: Plan) {
  switch (plan) {
    case 'STARTER':
      return 'lite'
    case 'GROWTH':
      return 'standard'
    case 'ENTERPRISE':
      return 'standard'
    case 'FREE':
      return 'free'
  }
}

function toBillingCycle(interval: BillingInterval) {
  return interval === 'ANNUAL' ? 'annual' : 'monthly'
}

export async function GET() {
  const billingOrg = await getBillingOrg()
  if (!billingOrg) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const subscription = await prisma.billingSubscription.findFirst({
    where: { orgId: billingOrg.org.id },
    orderBy: { updatedAt: 'desc' },
  })
  const [credits, members] = await Promise.all([
    getMonthlyAiCreditStatus({ orgId: billingOrg.org.id }),
    prisma.user.findMany({
      where: { orgId: billingOrg.org.id },
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    }),
  ])

  return NextResponse.json({
    userEmail: billingOrg.userEmail,
    planId: subscription ? toPlanId(subscription.plan) : toPlanId(billingOrg.org.plan),
    billingCycle: subscription ? toBillingCycle(subscription.interval) : 'annual',
    seats: Math.max(subscription?.seats ?? 1, members.length),
    status: subscription?.status ?? null,
    currentPeriodEnd: subscription?.currentPeriodEnd?.toISOString() ?? null,
    cancelAtPeriodEnd: subscription?.cancelAtPeriodEnd ?? false,
    credits,
    members: members.map((member) => ({
      id: member.id,
      email: member.email,
      name: member.name,
      role: member.role,
    })),
  })
}
