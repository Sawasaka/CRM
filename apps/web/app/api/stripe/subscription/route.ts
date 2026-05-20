import { NextResponse } from 'next/server'
import { prisma, type BillingInterval, type Plan } from '@bgm/db'
import { getBillingOrg } from '@/lib/stripe/auth'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function toPlanId(plan: Plan) {
  switch (plan) {
    case 'STARTER':
      return 'lite'
    case 'GROWTH':
      return 'standard'
    case 'ENTERPRISE':
      return 'pro'
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

  return NextResponse.json({
    planId: subscription ? toPlanId(subscription.plan) : toPlanId(billingOrg.org.plan),
    billingCycle: subscription ? toBillingCycle(subscription.interval) : 'annual',
    seats: subscription?.seats ?? 1,
    status: subscription?.status ?? null,
    currentPeriodEnd: subscription?.currentPeriodEnd?.toISOString() ?? null,
    cancelAtPeriodEnd: subscription?.cancelAtPeriodEnd ?? false,
  })
}
