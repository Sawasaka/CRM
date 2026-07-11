import { NextRequest, NextResponse } from 'next/server'
import { CallResult, prisma } from '@bgm/db'
import { z } from 'zod'
import { getCurrentAppContext } from '@/lib/app-context'
import { createAiCallId, statusFromOutcome } from '@/lib/ai-calls/provider'
import type { AiCallMetadata, AiCallOutcome, AiCallProvider, JsonValue } from '@/lib/ai-calls/types'

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
  recordingUrl: z.string().optional(),
  rawProviderPayload: z.unknown().optional(),
})

export async function POST(req: NextRequest) {
  const secret = process.env.AI_CALL_WEBHOOK_SECRET
  const providedSecret = req.headers.get('x-ai-call-secret') ?? req.nextUrl.searchParams.get('secret')
  if (secret && providedSecret !== secret) {
    return NextResponse.json({ error: 'invalid_secret' }, { status: 401 })
  }

  const rawBody = await req.json().catch(() => ({}))
  const normalizedBody = normalizeWebhookBody(rawBody)
  const parsed = webhookSchema.safeParse(normalizedBody)
  if (!parsed.success) {
    return NextResponse.json({ error: 'invalid_request', detail: parsed.error.flatten() }, { status: 400 })
  }

  const body = parsed.data
  const existingActivity = await findExistingAiCallActivity(body.callId, body.externalCallId)
  const context = existingActivity ? null : await getCurrentAppContext({ allowDevFallback: true })
  if (!context && !existingActivity) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const [deal, contact] = await Promise.all([
    context && body.dealId
      ? prisma.deal.findFirst({
          where: { id: body.dealId, orgId: context.appOrgId },
          select: { id: true, orgId: true, companyId: true, contactId: true },
        })
      : null,
    context && body.contactId
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
    rawProviderPayload: toJsonValue(body.rawProviderPayload),
    updatedAt: new Date().toISOString(),
  }
  const activityOrgId = existingActivity?.orgId ?? deal?.orgId ?? contact?.orgId ?? context!.userOrgId
  const activityUserId = existingActivity?.userId ?? context!.userId
  const contactId = contact?.id ?? deal?.contactId ?? body.contactId ?? existingActivity?.contactId ?? null
  const dealId = deal?.id ?? body.dealId ?? existingActivity?.dealId ?? null
  const companyId =
    deal?.companyId ?? contact?.companyId ?? body.companyId ?? existingActivity?.companyId ?? null
  const resultCode = resultCodeFromOutcome(outcome)

  if (contactId) {
    await prisma.contact.updateMany({
      where: { id: contactId, orgId: activityOrgId },
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

  const activity = existingActivity
    ? await prisma.activity.update({
        where: { id: existingActivity.id },
        data: {
          title: 'AIコール結果を受信',
          content: body.summary ?? body.nextAction ?? 'AIコールの結果を受信しました。',
          resultCode,
          metadata: mergeAiCallMetadata(existingActivity.metadata, metadata),
        },
      })
    : await prisma.activity.create({
        data: {
          orgId: activityOrgId,
          dealId,
          contactId,
          companyId,
          userId: activityUserId,
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

async function findExistingAiCallActivity(callId?: string, externalCallId?: string) {
  if (!callId && !externalCallId) return null
  const activities = await prisma.activity.findMany({
    where: { type: 'CALL' },
    orderBy: { createdAt: 'desc' },
    take: 200,
    select: {
      id: true,
      orgId: true,
      userId: true,
      dealId: true,
      contactId: true,
      companyId: true,
      metadata: true,
    },
  })
  return (
    activities.find((activity) => {
      const metadata = activity.metadata as Partial<AiCallMetadata> | null
      return Boolean(
        metadata?.aiCall &&
          ((callId && metadata.callId === callId) ||
            (externalCallId && metadata.externalCallId === externalCallId)),
      )
    }) ?? null
  )
}

function mergeAiCallMetadata(current: unknown, next: AiCallMetadata): AiCallMetadata {
  const existing =
    current && typeof current === 'object' ? (current as Partial<AiCallMetadata>) : {}
  return {
    ...existing,
    ...next,
    aiCall: true,
    callId: next.callId || existing.callId || createAiCallId(),
    externalCallId: next.externalCallId ?? existing.externalCallId ?? null,
    provider: next.provider ?? existing.provider ?? 'external',
  } as AiCallMetadata
}

function normalizeWebhookBody(raw: unknown): Record<string, unknown> {
  if (!raw || typeof raw !== 'object') return {}
  const body = raw as Record<string, unknown>
  const call = objectFrom(body.call) ?? objectFrom(body.data) ?? body
  const metadata = objectFrom(call.metadata) ?? objectFrom(body.metadata) ?? {}
  const analysis =
    objectFrom(call.call_analysis) ??
    objectFrom(call.callAnalysis) ??
    objectFrom(call.post_call_analysis) ??
    objectFrom(call.postCallAnalysis) ??
    {}

  const externalCallId = stringFrom(call.call_id) ?? stringFrom(call.callId) ?? stringFrom(call.id)
  const callId =
    stringFrom(metadata.internal_call_id) ??
    stringFrom(metadata.callId) ??
    stringFrom(body.callId)
  const transcript =
    stringFrom(call.transcript) ??
    stringifyTranscript(call.transcript_object) ??
    stringifyTranscript(call.transcriptObject)
  const summary =
    stringFrom(analysis.call_summary) ??
    stringFrom(analysis.callSummary) ??
    stringFrom(analysis.summary) ??
    stringFrom(call.summary)
  const status = stringFrom(call.call_status) ?? stringFrom(call.status) ?? stringFrom(body.event)

  return {
    callId,
    externalCallId,
    provider: stringFrom(body.provider) ?? 'external',
    contactId: stringFrom(metadata.contact_id) ?? stringFrom(body.contactId),
    dealId: stringFrom(metadata.deal_id) ?? stringFrom(body.dealId),
    companyId: stringFrom(metadata.company_id) ?? stringFrom(body.companyId),
    phone: stringFrom(call.to_number) ?? stringFrom(call.toNumber) ?? stringFrom(body.phone),
    outcome: outcomeFromProviderPayload({ status, analysis, call }),
    transcript,
    summary,
    nextAction:
      stringFrom(analysis.next_action) ??
      stringFrom(analysis.nextAction) ??
      stringFrom(call.next_action),
    recordingUrl:
      stringFrom(call.recording_url) ??
      stringFrom(call.recordingUrl) ??
      stringFrom(call.public_log_url),
    rawProviderPayload: raw,
  }
}

function outcomeFromProviderPayload(input: {
  status: string | null
  analysis: Record<string, unknown>
  call: Record<string, unknown>
}): AiCallOutcome {
  const haystack = JSON.stringify({ status: input.status, analysis: input.analysis, call: input.call })
    .toLowerCase()
  if (haystack.includes('do_not_call') || haystack.includes('do not call')) return 'do_not_call'
  if (haystack.includes('meeting_booked') || haystack.includes('appointment')) return 'meeting_booked'
  if (haystack.includes('callback')) return 'callback_requested'
  if (haystack.includes('not_interested') || haystack.includes('not interested')) return 'not_interested'
  if (
    haystack.includes('no_answer') ||
    haystack.includes('no answer') ||
    haystack.includes('voicemail') ||
    haystack.includes('not connected')
  ) {
    return 'no_answer'
  }
  if (haystack.includes('failed') || haystack.includes('error')) return 'needs_human'
  return 'connected'
}

function objectFrom(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null
}

function stringFrom(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value.trim() : null
}

function stringifyTranscript(value: unknown): string | null {
  if (!Array.isArray(value)) return null
  const lines = value
    .map((item) => {
      if (!item || typeof item !== 'object') return null
      const row = item as Record<string, unknown>
      const role = stringFrom(row.role) ?? stringFrom(row.speaker) ?? 'speaker'
      const content = stringFrom(row.content) ?? stringFrom(row.text) ?? stringFrom(row.transcript)
      return content ? `${role}: ${content}` : null
    })
    .filter(Boolean)
  return lines.length > 0 ? lines.join('\n') : null
}

function toJsonValue(value: unknown): JsonValue {
  if (
    value === null ||
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean'
  ) {
    return value
  }
  if (Array.isArray(value)) return value.map(toJsonValue)
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, item]) => [key, toJsonValue(item)]),
    )
  }
  return null
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
