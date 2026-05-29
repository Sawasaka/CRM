import { NextRequest, NextResponse } from 'next/server'
import { getBillingOrg } from '@/lib/stripe/auth'
import { ensureStripeBillingAccount } from '@/lib/stripe/billing'
import { getAppUrl, stripeRequest, type StripeCheckoutSession } from '@/lib/stripe/config'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const CREDIT_UNIT = 1000
const CREDIT_UNIT_AMOUNT_YEN = 5000
const MAX_CREDIT_PURCHASE = 100000

type CreditCheckoutPayload = {
  credits?: number
}

export async function POST(req: NextRequest) {
  const billingOrg = await getBillingOrg()
  if (!billingOrg) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const payload = (await req.json().catch(() => ({}))) as CreditCheckoutPayload
  const credits = Number(payload.credits)

  if (
    !Number.isInteger(credits) ||
    credits < CREDIT_UNIT ||
    credits > MAX_CREDIT_PURCHASE ||
    credits % CREDIT_UNIT !== 0
  ) {
    return NextResponse.json({ error: 'invalid_credit_amount' }, { status: 400 })
  }

  try {
    const account = await ensureStripeBillingAccount({
      orgId: billingOrg.org.id,
      orgName: billingOrg.org.name,
      email: billingOrg.userEmail,
    })
    if (!account.stripeCustomerId) {
      throw new Error('Stripe customer was not created')
    }

    const units = credits / CREDIT_UNIT
    const appUrl = getAppUrl()
    const body = new URLSearchParams()
    body.set('mode', 'payment')
    body.set('customer', account.stripeCustomerId)
    body.set('client_reference_id', billingOrg.org.id)
    body.set('line_items[0][price_data][currency]', 'jpy')
    body.set('line_items[0][price_data][unit_amount]', String(CREDIT_UNIT_AMOUNT_YEN))
    body.set('line_items[0][price_data][product_data][name]', `追加クレジット ${CREDIT_UNIT.toLocaleString()}cr`)
    body.set(
      'line_items[0][price_data][product_data][description]',
      `${CREDIT_UNIT.toLocaleString()}cr = ¥${CREDIT_UNIT_AMOUNT_YEN.toLocaleString()}`,
    )
    body.set('line_items[0][quantity]', String(units))
    body.set('success_url', `${appUrl}/subscription?credit_checkout=success`)
    body.set('cancel_url', `${appUrl}/subscription?credit_checkout=cancelled`)
    body.set('metadata[kind]', 'credit_purchase')
    body.set('metadata[orgId]', billingOrg.org.id)
    body.set('metadata[credits]', String(credits))
    body.set('metadata[unitCredits]', String(CREDIT_UNIT))
    body.set('metadata[unitAmountYen]', String(CREDIT_UNIT_AMOUNT_YEN))
    body.set('payment_intent_data[metadata][kind]', 'credit_purchase')
    body.set('payment_intent_data[metadata][orgId]', billingOrg.org.id)
    body.set('payment_intent_data[metadata][credits]', String(credits))

    const session = await stripeRequest<StripeCheckoutSession>('/v1/checkout/sessions', {
      method: 'POST',
      body,
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('[stripe.credits.checkout]', error)
    const message = error instanceof Error ? error.message : 'credit_checkout_failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
