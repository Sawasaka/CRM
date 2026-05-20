import { NextRequest, NextResponse } from 'next/server'
import {
  stripeRequest,
  verifyStripeWebhookSignature,
  type StripeCheckoutSession,
  type StripeInvoice,
  type StripeSubscription,
  type StripeWebhookEvent,
} from '@/lib/stripe/config'
import { syncStripeInvoice, syncStripeSubscription } from '@/lib/stripe/billing'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const signature = req.headers.get('stripe-signature')
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  if (!signature || !webhookSecret) {
    return NextResponse.json({ error: 'stripe_webhook_not_configured' }, { status: 400 })
  }

  const payload = await req.text()

  if (!verifyStripeWebhookSignature({ payload, signatureHeader: signature, secret: webhookSecret })) {
    console.error('[stripe.webhook.signature] invalid_signature')
    return NextResponse.json({ error: 'invalid_signature' }, { status: 400 })
  }

  let event: StripeWebhookEvent
  try {
    event = JSON.parse(payload) as StripeWebhookEvent
  } catch {
    return NextResponse.json({ error: 'invalid_payload' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as StripeCheckoutSession
        const subscriptionId =
          typeof session.subscription === 'string' ? session.subscription : session.subscription?.id
        if (subscriptionId) {
          const subscription = await stripeRequest<StripeSubscription>(
            `/v1/subscriptions/${subscriptionId}`,
          )
          await syncStripeSubscription(subscription)
        }
        break
      }
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        await syncStripeSubscription(event.data.object as StripeSubscription)
        break
      case 'invoice.payment_succeeded':
      case 'invoice.payment_failed':
      case 'invoice.finalized':
      case 'invoice.voided':
        await syncStripeInvoice(event.data.object as StripeInvoice)
        break
      default:
        break
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('[stripe.webhook]', event.type, error)
    const message = error instanceof Error ? error.message : 'webhook_failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
