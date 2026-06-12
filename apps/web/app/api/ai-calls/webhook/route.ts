import { NextRequest, NextResponse } from 'next/server'
import { CallResult, prisma } from '@bgm/db'
import { z } from 'zod'
import { getCurrentAppContext } from '@/lib/demo-master'
import { createAiCallId, statusFromOutcome } from '@/lib/ai-calls/provider'
import type { AiCallMetadata, AiCallOutcome, AiCallProvider } from '@/lib/ai-calls/types'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const webhookSchema = z.object({
  callId: z.string().optional(),
  externalCallId: z.string().optional(),
  provider: z.enum(['mock', 'twilio_openai', 'external']).optional(),
  contactId: z.string().optional(),
  dealId: z.string().optional(),
  companyId: z.string().optional(),
  phone: z.string().optional(),
  outcome: z
    .enum([
      'connected',
      'no_answer',
      'callback_requested',
      'meeting_booked',
      'not_interested',
      'do_not_call',
      'needs_human',
    ])
    .optional(),
  transcript: z.string().optional(),
  summary: z.string().optional(),
  nextAction: z.string().optional(),
  recordingUrl: z.string().url().optional(),
})

export async function POST(req: NextRequest) {
  const secret = process.env.AI_CALL_WEBHOOK_SECRET
  if (secret && req.headers.get('x-ai-call-secret') !== secret) {
    return NextResponse.json({ error: 'invalid_secret' }, { status: 401 })
  }

  const context = await getCurrentAppContext({ allowDevFallback: true })
  if (!context) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const parsed = webhookSchema.safeParse(await req.json().catch(() => ({})))
  if (!parsed.success) {
    return NextResponse.json({ error: 'invalid_request', detail: parsed.error.flatten() }, { status: 400 })
  }

  const body = parsed.data
  const [deal, contact] = await Promise.all([
    body.dealId
      ? prisma.deal.findFirst({
          where: { id: body.dealId, orgId: context.appOrgId },
          select: { id: true, orgId: true, companyId: true, contactId: true },
        })
      : null,
    body.contactId
      ? prisma.contact.findFirst({
          where: { id: body.contactId, orgId: context.appOrgId },
          select: { id: true, orgId: true, companyId: true },
        })
      : null,
  ])

  const outcome = body.outcome ?? 'connected'
  const metadata: AiCallMetadata = {
    aiCall: true,
    callId: body.callId ?? createAiCallId(),
    externalCallId: body.externalCallId ?? null,
    provider: (body.provider ?? 'external') as AiCallProvider,
    status: statusFromOutcome(outcome),
    outcome,
    phone: body.phone ?? null,
    transcript: body.transcript ?? null,
    summary: body.summary ?? null,
    nextAction: body.nextAction ?? null,
    recordingUrl: body.recordingUrl ?? null,
    model: null,
    updatedAt: new Date().toISOString(),
  }
  const activityOrgId = deal?.orgId ?? contact?.orgId ?? context.userOrgId
  const resultCode = resultCodeFromOutcome(outcome)

  if ((contact?.id ?? deal?.contactId) && !context.isDemo) {
    await prisma.contact.updateMany({
      where: { id: contact?.id ?? deal?.contactId ?? undefined, orgId: activityOrgId },
      data: {
        approachStatus:
          outcome === 'no_answer'
            ? 'NO_ANSWER'
            : outcome === 'meeting_booked'
              ? 'APPOINTMENT_SET'
              : outcome === 'do_not_call'
                ? 'DO_NOT_CALL'
                : 'CONNECTED',
        lastCallResult: resultCode,
        callAttempts: { increment: 1 },
        lastCallAt: new Date(),
        ...(outcome === 'do_not_call' ? { doNotContact: true } : {}),
      },
    })
  }

  const activity = await prisma.activity.create({
    data: {
      orgId: activityOrgId,
      dealId: deal?.id ?? body.dealId ?? null,
      contactId: contact?.id ?? deal?.contactId ?? body.contactId ?? null,
      companyId: deal?.companyId ?? contact?.companyId ?? body.companyId ?? null,
      userId: context.userId,
      type: 'CALL',
      title: 'AIコール結果を受信',
      content: body.summary ?? body.nextAction ?? 'AIコールの結果を受信しました。',
      resultCode,
      metadata,
      occurredAt: new Date(),
    },
  })

  return NextResponse.json({ ok: true, activityId: activity.id, callId: metadata.callId })
}

function resultCodeFromOutcome(outcome: AiCallOutcome): CallResult {
  switch (outcome) {
    case 'no_answer':
      return 'NO_ANSWER'
    case 'meeting_booked':
      return 'MEETING_BOOKED'
    case 'not_interested':
      return 'CONNECTED_NO_INTEREST'
    case 'do_not_call':
      return 'DO_NOT_CALL'
    case 'callback_requested':
      return 'CALLBACK_REQUESTED'
    case 'connected':
      return 'CONNECTED_INTERESTED'
    default:
      return 'CONNECTED_FOLLOWUP_REQUESTED'
  }
}

