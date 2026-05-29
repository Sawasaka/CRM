import { prisma } from '@bgm/db'

export const AI_CHAT_CREDITS_PER_REQUEST = 1

const DEFAULT_MONTHLY_AI_CHAT_CREDIT_LIMIT = 5000
const JST_OFFSET_MS = 9 * 60 * 60 * 1000

type CreditGateOk = {
  ok: true
  usedCredits: number
  limitCredits: number
  remainingCredits: number
  yenLimit: number
  windowEnd: Date
  resetLabel: string
  monthKey: string
}

type CreditGateNg = Omit<CreditGateOk, 'ok'> & {
  ok: false
}

type CreditGateResult = CreditGateOk | CreditGateNg

export async function assertDailyAiChatCreditAvailable(opts: {
  orgId: string
  userId: string
  credits?: number
}): Promise<CreditGateResult> {
  const status = await getMonthlyAiCreditStatus({ orgId: opts.orgId })
  const requestedCredits = opts.credits ?? AI_CHAT_CREDITS_PER_REQUEST

  return {
    ...status,
    ok: status.remainingCredits >= requestedCredits,
  }
}

export async function recordAiChatCreditUsage(opts: {
  orgId: string
  userId: string
  model: string
  elapsedMs: number
  contextSize: number
  credits?: number
}) {
  const credits = opts.credits ?? AI_CHAT_CREDITS_PER_REQUEST
  await prisma.aiCreditUsage.create({
    data: {
      orgId: opts.orgId,
      userId: opts.userId,
      model: opts.model,
      credits,
      monthKey: getCurrentJstMonthKey(),
      metadata: {
        elapsedMs: opts.elapsedMs,
        contextSize: opts.contextSize,
      },
    },
  })

  return getMonthlyAiCreditStatus({ orgId: opts.orgId })
}

export async function getMonthlyAiCreditStatus(opts: { orgId: string }) {
  const monthKey = getCurrentJstMonthKey()
  const limitCredits = resolveMonthlyLimit()
  const aggregate = await prisma.aiCreditUsage.aggregate({
    where: { orgId: opts.orgId, monthKey },
    _sum: { credits: true },
  })
  const usedCredits = aggregate._sum.credits ?? 0
  const purchasedAggregate = await prisma.billingPayment.aggregate({
    where: {
      orgId: opts.orgId,
      kind: 'CREDIT_PURCHASE',
      status: 'SUCCEEDED',
    },
    _sum: { credits: true },
  })
  const purchasedCredits = purchasedAggregate._sum.credits ?? 0
  const subscriptionRemainingCredits = Math.max(0, limitCredits - usedCredits)
  const purchasedUsedCredits = Math.max(0, usedCredits - limitCredits)
  const purchasedRemainingCredits = Math.max(0, purchasedCredits - purchasedUsedCredits)
  const remainingCredits = subscriptionRemainingCredits + purchasedRemainingCredits

  return {
    ok: true as const,
    usedCredits,
    limitCredits,
    remainingCredits,
    subscriptionRemainingCredits,
    purchasedCredits,
    purchasedUsedCredits,
    purchasedRemainingCredits,
    yenLimit: limitCredits,
    windowEnd: getNextJstMonthStart(),
    resetLabel: '翌月1日 00:00',
    monthKey,
  }
}

function resolveMonthlyLimit() {
  const raw = process.env.AI_CHAT_MONTHLY_CREDIT_LIMIT
  const parsed = raw ? Number.parseInt(raw, 10) : DEFAULT_MONTHLY_AI_CHAT_CREDIT_LIMIT
  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_MONTHLY_AI_CHAT_CREDIT_LIMIT
}

function getCurrentJstMonthKey() {
  const now = new Date(Date.now() + JST_OFFSET_MS)
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}`
}

function getNextJstMonthStart() {
  const now = new Date(Date.now() + JST_OFFSET_MS)
  const nextMonthStartUtcMs = Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1, 0, 0, 0, 0)
  return new Date(nextMonthStartUtcMs - JST_OFFSET_MS)
}

function getNextJstMidnight() {
  const now = new Date()
  const jstNow = new Date(now.getTime() + JST_OFFSET_MS)
  const nextMidnightUtcMs = Date.UTC(
    jstNow.getUTCFullYear(),
    jstNow.getUTCMonth(),
    jstNow.getUTCDate() + 1,
    0,
    0,
    0,
    0
  )
  return new Date(nextMidnightUtcMs - JST_OFFSET_MS)
}

export async function assertMonthlyAiChatCreditAvailable(opts: {
  orgId: string
  userId: string
  credits?: number
}) {
  return assertDailyAiChatCreditAvailable(opts)
}

export function getMonthlyAiChatCreditLimit() {
  return resolveMonthlyLimit()
}

export function getDailyAiChatCreditReset() {
  return {
    windowEnd: getNextJstMidnight(),
    resetLabel: '00:00',
  }
}
