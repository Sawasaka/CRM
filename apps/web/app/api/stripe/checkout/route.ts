import { NextRequest, NextResponse } from 'next/server'
import { getBillingOrg } from '@/lib/stripe/auth'
import { ensureStripeBillingAccount } from '@/lib/stripe/billing'
import {
  getAppUrl,
  getCheckoutPlan,
  getPriceId,
  stripeRequest,
  type StripeCheckoutSession,
  type BillingCycle,
} from '@/lib/stripe/config'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type CheckoutPayload = {
  planId?: string
  billingCycle?: BillingCycle
  seats?: number
}

export async function POST(req: NextRequest) {
  const billingOrg = await getBillingOrg()
  if (!billingOrg) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const payload = (await req.json().catch(() => ({}))) as CheckoutPayload
  const plan = getCheckoutPlan(payload.planId ?? '')
  if (!plan) {
    return NextResponse.json({ error: 'invalid_plan' }, { status: 400 })
  }

  const billingCycle = payload.billingCycle === 'monthly' ? 'monthly' : 'annual'
  const seats = Math.max(plan.minSeats, Number(payload.seats ?? plan.minSeats))

  try {
    const priceId = getPriceId(plan, billingCycle)
    const account = await ensureStripeBillingAccount({
      orgId: billingOrg.org.id,
      orgName: billingOrg.org.name,
      email: billingOrg.userEmail,
    })
    if (!account.stripeCustomerId) {
      throw new Error('Stripe customer was not created')
    }
    const appUrl = getAppUrl()
    const body = new URLSearchParams()
    body.set('mode', 'subscription')
    body.set('customer', account.stripeCustomerId)
    body.set('client_reference_id', billingOrg.org.id)
    body.set('line_items[0][price]', priceId)
    body.set('line_items[0][quantity]', String(seats))
    body.set('allow_promotion_codes', 'true')
    body.set(
      'success_url',
      `${appUrl}/subscription?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
    )
    body.set('cancel_url', `${appUrl}/subscription?checkout=cancelled`)
    body.set('metadata[orgId]', billingOrg.org.id)
    body.set('metadata[planId]', plan.id)
    body.set('metadata[billingCycle]', billingCycle)
    body.set('metadata[seats]', String(seats))
    body.set('subscription_data[metadata][orgId]', billingOrg.org.id)
    body.set('subscription_data[metadata][planId]', plan.id)
    body.set('subscription_data[metadata][billingCycle]', billingCycle)
    body.set('subscription_data[metadata][seats]', String(seats))

    const session = await stripeRequest<StripeCheckoutSession>('/v1/checkout/sessions', {
      method: 'POST',
      body,
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('[stripe.checkout]', error)
    const message = error instanceof Error ? error.message : 'checkout_failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
