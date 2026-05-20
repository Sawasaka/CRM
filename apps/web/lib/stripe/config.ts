import { createHmac, timingSafeEqual } from 'node:crypto'
import type { BillingInterval, Plan } from '@bgm/db'

export type BillingPlanId = 'lite' | 'standard' | 'pro'
export type BillingCycle = 'monthly' | 'annual'

type CheckoutPlanConfig = {
  id: BillingPlanId
  name: string
  prismaPlan: Plan
  minSeats: number
  monthlyPriceEnv: string
  annualPriceEnv: string
}

export const CHECKOUT_PLANS: Record<BillingPlanId, CheckoutPlanConfig> = {
  lite: {
    id: 'lite',
    name: 'Lite',
    prismaPlan: 'STARTER',
    minSeats: 1,
    monthlyPriceEnv: 'STRIPE_PRICE_LITE_MONTHLY',
    annualPriceEnv: 'STRIPE_PRICE_LITE_ANNUAL',
  },
  standard: {
    id: 'standard',
    name: 'Standard',
    prismaPlan: 'GROWTH',
    minSeats: 1,
    monthlyPriceEnv: 'STRIPE_PRICE_STANDARD_MONTHLY',
    annualPriceEnv: 'STRIPE_PRICE_STANDARD_ANNUAL',
  },
  pro: {
    id: 'pro',
    name: 'PRO',
    prismaPlan: 'ENTERPRISE',
    minSeats: 1,
    monthlyPriceEnv: 'STRIPE_PRICE_PRO_MONTHLY',
    annualPriceEnv: 'STRIPE_PRICE_PRO_ANNUAL',
  },
}

export type StripeIdObject = { id: string }

export type StripePrice = {
  id: string
  product?: string | StripeIdObject | null
  recurring?: { interval?: 'day' | 'week' | 'month' | 'year' | null } | null
}

export type StripeSubscription = {
  id: string
  customer?: string | StripeIdObject | null
  status:
    | 'incomplete'
    | 'incomplete_expired'
    | 'trialing'
    | 'active'
    | 'past_due'
    | 'canceled'
    | 'unpaid'
    | 'paused'
  metadata: Record<string, string | undefined>
  items: { data: Array<{ quantity?: number | null; price: StripePrice }> }
  current_period_start?: number | null
  current_period_end?: number | null
  cancel_at_period_end: boolean
  canceled_at?: number | null
  trial_end?: number | null
}

export type StripeInvoice = {
  id?: string
  customer?: string | StripeIdObject | null
  subscription?: string | StripeIdObject | null
  status?: 'draft' | 'open' | 'paid' | 'uncollectible' | 'void' | null
  status_transitions?: { paid_at?: number | null } | null
  created: number
  amount_paid: number
  amount_due: number
  currency: string
  description?: string | null
  hosted_invoice_url?: string | null
  payment_intent?: string | StripeIdObject | null
}

export type StripeCheckoutSession = {
  id: string
  url: string | null
  subscription?: string | StripeIdObject | null
}

export type StripeWebhookEvent = {
  id: string
  type: string
  data: { object: unknown }
}

export async function stripeRequest<T>(
  path: string,
  init: { method?: 'GET' | 'POST'; body?: URLSearchParams } = {},
): Promise<T> {
  const secretKey = process.env.STRIPE_SECRET_KEY
  if (!secretKey) {
    throw new Error('STRIPE_SECRET_KEY is not configured')
  }

  const res = await fetch(`https://api.stripe.com${path}`, {
    method: init.method ?? 'GET',
    headers: {
      Authorization: `Bearer ${secretKey}`,
      ...(init.body ? { 'Content-Type': 'application/x-www-form-urlencoded' } : {}),
    },
    body: init.body,
  })

  const data = (await res.json()) as T & { error?: { message?: string } }
  if (!res.ok) {
    throw new Error(data.error?.message ?? `Stripe API error: ${res.status}`)
  }
  return data
}

export function getAppUrl() {
  return process.env.NEXT_PUBLIC_APP_URL ?? process.env.AUTH_URL ?? 'http://localhost:3002'
}

export function getCheckoutPlan(planId: string): CheckoutPlanConfig | null {
  if (planId === 'lite' || planId === 'standard' || planId === 'pro') {
    return CHECKOUT_PLANS[planId]
  }
  return null
}

export function getPriceId(plan: CheckoutPlanConfig, cycle: BillingCycle) {
  const envName = cycle === 'annual' ? plan.annualPriceEnv : plan.monthlyPriceEnv
  const priceId = process.env[envName]
  if (!priceId) {
    throw new Error(`${envName} is not configured`)
  }
  return priceId
}

export function toBillingInterval(cycle: BillingCycle): BillingInterval {
  return cycle === 'annual' ? 'ANNUAL' : 'MONTHLY'
}

export function getPlanFromPriceId(priceId: string): CheckoutPlanConfig | null {
  for (const plan of Object.values(CHECKOUT_PLANS)) {
    if (
      process.env[plan.monthlyPriceEnv] === priceId ||
      process.env[plan.annualPriceEnv] === priceId
    ) {
      return plan
    }
  }
  return null
}

export function verifyStripeWebhookSignature({
  payload,
  signatureHeader,
  secret,
}: {
  payload: string
  signatureHeader: string
  secret: string
}) {
  const parts: Record<string, string> = {}
  for (const part of signatureHeader.split(',')) {
    const [key, value] = part.split('=')
    if (key && value) parts[key] = value
  }
  const timestamp = parts.t
  const expectedSignature = parts.v1
  if (!timestamp || !expectedSignature) return false
  const timestampSeconds = Number(timestamp)
  if (!Number.isFinite(timestampSeconds)) return false
  if (Math.abs(Date.now() / 1000 - timestampSeconds) > 300) return false

  const signedPayload = `${timestamp}.${payload}`
  const computed = createHmac('sha256', secret).update(signedPayload, 'utf8').digest('hex')
  const expectedBuffer = Buffer.from(expectedSignature, 'hex')
  const computedBuffer = Buffer.from(computed, 'hex')
  if (expectedBuffer.length !== computedBuffer.length) return false
  return timingSafeEqual(expectedBuffer, computedBuffer)
}
