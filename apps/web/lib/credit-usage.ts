export const AI_CHAT_CREDITS_PER_REQUEST = 1

const DEFAULT_DAILY_AI_CHAT_CREDIT_LIMIT = 100
const JST_OFFSET_MS = 9 * 60 * 60 * 1000

type CreditGateOk = {
  ok: true
  usedCredits: number
  limitCredits: number
  yenLimit: number
  windowEnd: Date
  resetLabel: string
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
  const limitCredits = resolveDailyLimit()
  const usedCredits = 0
  const requestedCredits = opts.credits ?? AI_CHAT_CREDITS_PER_REQUEST
  const windowEnd = getNextJstMidnight()

  return {
    ok: usedCredits + requestedCredits <= limitCredits,
    usedCredits,
    limitCredits,
    yenLimit: limitCredits,
    windowEnd,
    resetLabel: '00:00',
  }
}

export async function recordAiChatCreditUsage(opts: {
  orgId: string
  userId: string
  model: string
  elapsedMs: number
  contextSize: number
}) {
  console.info('[ai-chat-credit]', {
    orgId: opts.orgId,
    userId: opts.userId,
    model: opts.model,
    elapsedMs: opts.elapsedMs,
    contextSize: opts.contextSize,
    credits: AI_CHAT_CREDITS_PER_REQUEST,
  })
}

function resolveDailyLimit() {
  const raw = process.env.AI_CHAT_DAILY_CREDIT_LIMIT
  const parsed = raw ? Number.parseInt(raw, 10) : DEFAULT_DAILY_AI_CHAT_CREDIT_LIMIT
  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_DAILY_AI_CHAT_CREDIT_LIMIT
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
