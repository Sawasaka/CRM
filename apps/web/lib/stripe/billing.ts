import {
  prisma,
  type BillingInterval,
  type BillingPaymentKind,
  type BillingPaymentStatus,
  type BillingSubscriptionStatus,
  type Plan,
} from '@bgm/db'
import {
  getPlanFromPriceId,
  stripeRequest,
  toBillingInterval,
  type BillingCycle,
  type BillingPlanId,
  type StripeIdObject,
  type StripeInvoice,
  type StripeSubscription,
} from './config'

function stripeObjectId(value: string | StripeIdObject | null | undefined): string | null {
  if (!value) return null
  return typeof value === 'string' ? value : value.id
}

function fromUnix(value: number | null | undefined) {
  return value ? new Date(value * 1000) : null
}

function toSubscriptionStatus(status: StripeSubscription['status']): BillingSubscriptionStatus {
  switch (status) {
    case 'incomplete':
      return 'INCOMPLETE'
    case 'incomplete_expired':
      return 'INCOMPLETE_EXPIRED'
    case 'trialing':
      return 'TRIALING'
    case 'active':
      return 'ACTIVE'
    case 'past_due':
      return 'PAST_DUE'
    case 'canceled':
      return 'CANCELED'
    case 'unpaid':
      return 'UNPAID'
    case 'paused':
      return 'PAUSED'
  }
}

function toPaymentStatus(invoice: StripeInvoice): BillingPaymentStatus {
  switch (invoice.status) {
    case 'paid':
      return 'SUCCEEDED'
    case 'uncollectible':
    case 'void':
      return 'FAILED'
    case 'draft':
    case 'open':
      return 'PENDING'
    default:
      return 'PENDING'
  }
}

function orgPlanForSubscription(status: BillingSubscriptionStatus, plan: Plan): Plan {
  if (status === 'CANCELED' || status === 'UNPAID' || status === 'INCOMPLETE_EXPIRED') {
    return 'FREE'
  }
  return plan
}

export async function ensureStripeBillingAccount({
  orgId,
  orgName,
  email,
}: {
  orgId: string
  orgName: string
  email?: string | null
}) {
  const existing = await prisma.billingAccount.findUnique({ where: { orgId } })
  if (existing?.stripeCustomerId) return existing

  const body = new URLSearchParams()
  body.set('name', orgName)
  body.set('metadata[orgId]', orgId)
  if (email) body.set('email', email)
  const customer = await stripeRequest<{ id: string }>('/v1/customers', {
    method: 'POST',
    body,
  })

  return prisma.billingAccount.upsert({
    where: { orgId },
    create: {
      orgId,
      stripeCustomerId: customer.id,
      billingEmail: email ?? null,
    },
    update: {
      stripeCustomerId: customer.id,
      billingEmail: email ?? existing?.billingEmail ?? null,
    },
  })
}

export async function syncStripeSubscription(subscription: StripeSubscription) {
  const customerId = stripeObjectId(subscription.customer)
  const item = subscription.items.data[0]
  const priceId = item?.price.id
  const resolvedPlan = priceId ? getPlanFromPriceId(priceId) : null
  const metadataPlan = getMetadataPlan(subscription.metadata.planId)
  const plan = resolvedPlan?.prismaPlan ?? metadataPlan ?? 'STARTER'
  const metadataCycle = getMetadataCycle(subscription.metadata.billingCycle)
  const interval = resolvedPlan
    ? inferIntervalFromPriceEnv(resolvedPlan.id, priceId ?? '')
    : metadataCycle ?? inferIntervalFromPrice(item?.price.recurring?.interval)
  const orgId = subscription.metadata.orgId

  if (!orgId || !customerId || !priceId) {
    throw new Error(`Cannot sync subscription ${subscription.id}: missing org/customer/price metadata`)
  }

  const billingAccount = await prisma.billingAccount.upsert({
    where: { orgId },
    create: { orgId, stripeCustomerId: customerId },
    update: { stripeCustomerId: customerId },
  })

  const status = toSubscriptionStatus(subscription.status)
  await prisma.billingSubscription.upsert({
    where: { stripeSubscriptionId: subscription.id },
    create: {
      orgId,
      billingAccountId: billingAccount.id,
      stripeSubscriptionId: subscription.id,
      stripePriceId: priceId,
      stripeProductId: stripeObjectId(item?.price.product),
      plan,
      status,
      interval,
      seats: item?.quantity ?? Number(subscription.metadata.seats ?? 1),
      currentPeriodStart: fromUnix(subscription.current_period_start),
      currentPeriodEnd: fromUnix(subscription.current_period_end),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      canceledAt: fromUnix(subscription.canceled_at),
      trialEnd: fromUnix(subscription.trial_end),
    },
    update: {
      billingAccountId: billingAccount.id,
      stripePriceId: priceId,
      stripeProductId: stripeObjectId(item?.price.product),
      plan,
      status,
      interval,
      seats: item?.quantity ?? Number(subscription.metadata.seats ?? 1),
      currentPeriodStart: fromUnix(subscription.current_period_start),
      currentPeriodEnd: fromUnix(subscription.current_period_end),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      canceledAt: fromUnix(subscription.canceled_at),
      trialEnd: fromUnix(subscription.trial_end),
    },
  })

  await prisma.organization.update({
    where: { id: orgId },
    data: { plan: orgPlanForSubscription(status, plan) },
  })
}

export async function syncStripeInvoice(invoice: StripeInvoice) {
  const customerId = stripeObjectId(invoice.customer)
  const account = customerId
    ? await prisma.billingAccount.findUnique({ where: { stripeCustomerId: customerId } })
    : null
  const subscriptionId = stripeObjectId(invoice.subscription)
  const subscription = subscriptionId
    ? await prisma.billingSubscription.findUnique({
        where: { stripeSubscriptionId: subscriptionId },
        select: { orgId: true, billingAccountId: true, plan: true },
      })
    : null
  const orgId = subscription?.orgId ?? account?.orgId

  if (!orgId || !invoice.id) return

  const paymentIntentId = stripeObjectId(invoice.payment_intent)
  const paidAt = fromUnix(invoice.status_transitions?.paid_at ?? invoice.created)
  const status = toPaymentStatus(invoice)
  const title = subscription ? `${planLabel(subscription.plan)}プラン` : 'Stripe決済'

  await prisma.billingPayment.upsert({
    where: { stripeInvoiceId: invoice.id },
    create: {
      orgId,
      billingAccountId: subscription?.billingAccountId ?? account?.id,
      kind: 'PLAN',
      status,
      title,
      description: invoice.description,
      amount: invoice.amount_paid || invoice.amount_due,
      currency: invoice.currency,
      paidAt: status === 'SUCCEEDED' ? paidAt : null,
      stripeInvoiceId: invoice.id,
      stripePaymentIntentId: paymentIntentId,
      stripeReceiptUrl: invoice.hosted_invoice_url,
    },
    update: {
      billingAccountId: subscription?.billingAccountId ?? account?.id,
      status,
      title,
      description: invoice.description,
      amount: invoice.amount_paid || invoice.amount_due,
      currency: invoice.currency,
      paidAt: status === 'SUCCEEDED' ? paidAt : null,
      stripePaymentIntentId: paymentIntentId,
      stripeReceiptUrl: invoice.hosted_invoice_url,
    },
  })
}

function inferIntervalFromPrice(
  interval: 'day' | 'week' | 'month' | 'year' | null | undefined,
): BillingInterval {
  return interval === 'year' ? 'ANNUAL' : 'MONTHLY'
}

function inferIntervalFromPriceEnv(planId: BillingPlanId, priceId: string): BillingInterval {
  const monthly = process.env[`STRIPE_PRICE_${planId.toUpperCase()}_MONTHLY`]
  return monthly === priceId ? 'MONTHLY' : 'ANNUAL'
}

function getMetadataPlan(planId: string | undefined): Plan | null {
  switch (planId) {
    case 'lite':
      return 'STARTER'
    case 'standard':
      return 'GROWTH'
    case 'pro':
      return 'ENTERPRISE'
    default:
      return null
  }
}

function getMetadataCycle(cycle: string | undefined): BillingInterval | null {
  if (cycle === 'annual' || cycle === 'monthly') {
    return toBillingInterval(cycle as BillingCycle)
  }
  return null
}

function planLabel(plan: Plan) {
  switch (plan) {
    case 'STARTER':
      return 'Lite'
    case 'GROWTH':
      return 'Standard'
    case 'ENTERPRISE':
      return 'PRO'
    case 'FREE':
      return 'Free'
  }
}

export function toPaymentKind(kind: string | undefined): BillingPaymentKind {
  switch (kind) {
    case 'credit_purchase':
      return 'CREDIT_PURCHASE'
    case 'feature_request':
      return 'FEATURE_REQUEST'
    case 'migration':
      return 'MIGRATION'
    case 'support_option':
      return 'SUPPORT_OPTION'
    default:
      return 'PLAN'
  }
}
