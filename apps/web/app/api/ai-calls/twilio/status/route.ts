import { NextRequest, NextResponse } from 'next/server'
import { CallResult, prisma } from '@bgm/db'
import type { AiCallMetadata, AiCallOutcome } from '@/lib/ai-calls/types'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const form = await req.formData().catch(() => null)
  if (!form) return NextResponse.json({ error: 'invalid_form' }, { status: 400 })

  const callSid = stringFrom(form.get('CallSid'))
  if (!callSid) return NextResponse.json({ error: 'call_sid_required' }, { status: 400 })

  const callStatus = stringFrom(form.get('CallStatus')) ?? 'unknown'
  const activities = await prisma.activity.findMany({
    where: { type: 'CALL' },
    orderBy: { createdAt: 'desc' },
    take: 200,
    select: { id: true, metadata: true },
  })
  const activity = activities.find((row) => {
    const metadata = row.metadata as Partial<AiCallMetadata> | null
    return metadata?.aiCall && metadata.externalCallId === callSid
  })

  if (!activity) return NextResponse.json({ ok: true, ignored: true })

  const current = activity.metadata as Partial<AiCallMetadata> | null
  const outcome = outcomeFromTwilioStatus(callStatus)
  const resultCode = resultCodeFromOutcome(outcome)
  const nextMetadata: AiCallMetadata = {
    ...(current ?? {}),
    aiCall: true,
    callId: current?.callId ?? callSid,
    externalCallId: callSid,
    provider: 'twilio_openai',
    status: callStatus === 'completed' ? 'completed' : callStatus === 'no-answer' ? 'no_answer' : 'calling',
    outcome,
    summary:
      callStatus === 'completed'
        ? 'Twilio/OpenAIコールが完了しました。Conversation Relayの詳細ログはRelayサーバー側で確認してください。'
        : `Twilio通話ステータス: ${callStatus}`,
    nextAction: callStatus === 'completed' ? '通話ログを確認し、必要に応じて商談メモへ反映する' : current?.nextAction,
    rawProviderPayload: {
      ...(typeof current?.rawProviderPayload === 'object' && current.rawProviderPayload ? current.rawProviderPayload : {}),
      twilioStatusCallback: formDataToRecord(form),
    },
    updatedAt: new Date().toISOString(),
  }

  await prisma.activity.update({
    where: { id: activity.id },
    data: {
      title: callStatus === 'completed' ? 'AIコール完了' : 'AIコール進行中',
      content: nextMetadata.summary ?? 'Twilio status callbackを受信しました。',
      resultCode,
      metadata: nextMetadata,
    },
  })

  return NextResponse.json({ ok: true })
}

function stringFrom(value: FormDataEntryValue | null) {
  return typeof value === 'string' && value.trim() ? value.trim() : null
}

function formDataToRecord(form: FormData) {
  return Object.fromEntries(Array.from(form.entries()).map(([key, value]) => [key, String(value)]))
}

function outcomeFromTwilioStatus(status: string): AiCallOutcome {
  switch (status) {
    case 'no-answer':
    case 'busy':
    case 'failed':
    case 'canceled':
      return 'no_answer'
    case 'completed':
      return 'connected'
    default:
      return 'needs_human'
  }
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
