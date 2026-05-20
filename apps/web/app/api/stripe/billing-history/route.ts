import { NextResponse } from 'next/server'
import { prisma, type BillingPaymentKind, type BillingPaymentStatus } from '@bgm/db'
import { getBillingOrg } from '@/lib/stripe/auth'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function toPaymentKind(kind: BillingPaymentKind) {
  switch (kind) {
    case 'CREDIT_PURCHASE':
      return 'credit_purchase'
    case 'FEATURE_REQUEST':
      return 'feature_request'
    case 'MIGRATION':
      return 'migration'
    case 'SUPPORT_OPTION':
      return 'support_option'
    case 'PLAN':
      return 'plan'
  }
}

function toPaymentStatus(status: BillingPaymentStatus) {
  switch (status) {
    case 'SUCCEEDED':
      return 'succeeded'
    case 'REFUNDED':
      return 'refunded'
    case 'PARTIAL_REFUND':
      return 'partial_refund'
    case 'PENDING':
      return 'pending'
    case 'FAILED':
      return 'failed'
  }
}

export async function GET() {
  const billingOrg = await getBillingOrg()
  if (!billingOrg) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const payments = await prisma.billingPayment.findMany({
    where: { orgId: billingOrg.org.id },
    orderBy: [{ paidAt: 'desc' }, { createdAt: 'desc' }],
    take: 100,
  })

  return NextResponse.json({
    payments: payments.map((payment) => ({
      id: payment.id,
      kind: toPaymentKind(payment.kind),
      title: payment.title,
      description: payment.description,
      amount: payment.amount,
      refundedAmount: payment.refundedAmount,
      status: toPaymentStatus(payment.status),
      paidAt: (payment.paidAt ?? payment.createdAt).toISOString(),
      refundedAt: payment.refundedAt?.toISOString(),
      stripePaymentIntentId: payment.stripePaymentIntentId ?? '',
      stripeReceiptUrl: payment.stripeReceiptUrl ?? '',
    })),
  })
}
