import { NextResponse } from 'next/server'
import { prisma } from '@bgm/db'
import { getBillingOrg } from '@/lib/stripe/auth'
import { getAppUrl, stripeRequest } from '@/lib/stripe/config'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST() {
  const billingOrg = await getBillingOrg()
  if (!billingOrg) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const account = await prisma.billingAccount.findUnique({
    where: { orgId: billingOrg.org.id },
    select: { stripeCustomerId: true },
  })

  if (!account?.stripeCustomerId) {
    return NextResponse.json({ error: 'stripe_customer_not_found' }, { status: 404 })
  }

  try {
    const body = new URLSearchParams()
    body.set('customer', account.stripeCustomerId)
    body.set('return_url', `${getAppUrl()}/settings/billing`)
    const session = await stripeRequest<{ url: string }>('/v1/billing_portal/sessions', {
      method: 'POST',
      body,
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('[stripe.portal]', error)
    const message = error instanceof Error ? error.message : 'portal_failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
