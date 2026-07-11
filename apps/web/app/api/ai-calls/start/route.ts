import { NextRequest, NextResponse } from 'next/server'
import { ApproachStatus, CallResult, prisma } from '@bgm/db'
import { z } from 'zod'
import { getCurrentAppContext } from '@/lib/app-context'
import { buildInquiryCallScript, getCallScenario } from '@/lib/ai-calls/call-scenario'
import { createAiCallMetadata } from '@/lib/ai-calls/provider'
import type { AiCallStatus } from '@/lib/ai-calls/types'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const startSchema = z.object({
  contactId: z.string().optional(),
  dealId: z.string().optional(),
  companyId: z.string().optional(),
  contactName: z.string().optional(),
  companyName: z.string().optional(),
  phone: z.string().optional(),
  purpose: z.string().optional(),
  script: z.string().optional(),
  scenarioKey: z.string().optional(),
})

export async function POST(req: NextRequest) {
  const context = await getCurrentAppContext({ allowDevFallback: true })
  if (!context) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const parsed = startSchema.safeParse(await req.json().catch(() => ({})))
  if (!parsed.success) {
    return NextResponse.json({ error: 'invalid_request', detail: parsed.error.flatten() }, { status: 400 })
  }

  const body = parsed.data
  const [deal, contact] = await Promise.all([
    body.dealId
      ? prisma.deal.findFirst({
          where: { id: body.dealId, orgId: context.appOrgId },
          select: {
            id: true,
            orgId: true,
            companyId: true,
            contactId: true,
            name: true,
            company: { select: { id: true, name: true, phone: true } },
            contact: { select: { id: true, name: true, phone: true, companyId: true } },
          },
        })
      : null,
    body.contactId
      ? prisma.contact.findFirst({
          where: { id: body.contactId, orgId: context.appOrgId },
          select: {
            id: true,
            orgId: true,
            companyId: true,
            name: true,
            phone: true,
            company: { select: { id: true, name: true, phone: true } },
          },
        })
      : null,
  ])

  const resolvedContact = contact ?? deal?.contact ?? null
  const target = {
    contactId: resolvedContact?.id ?? body.contactId ?? deal?.contactId ?? null,
    dealId: deal?.id ?? body.dealId ?? null,
    companyId:
      deal?.companyId ?? contact?.companyId ?? body.companyId ?? null,
    contactName: resolvedContact?.name ?? body.contactName ?? null,
    companyName: deal?.company.name ?? contact?.company.name ?? body.companyName ?? null,
    phone:
      body.phone ??
      resolvedContact?.phone ??
      deal?.contact?.phone ??
      deal?.company.phone ??
      contact?.company.phone ??
      null,
  }

  if (!target.phone) {
    return NextResponse.json({ error: 'phone_required', message: '電話番号を指定してください' }, { status: 400 })
  }

  const scenario = body.script ? null : await getCallScenario(context.appOrgId, body.scenarioKey)
  const metadata = await createAiCallMetadata({
    target,
    purpose: body.purpose ?? scenario?.name,
    script: body.script ?? (scenario ? buildInquiryCallScript(scenario) : undefined),
  })
  const activityOrgId = deal?.orgId ?? contact?.orgId ?? context.userOrgId
  const terminal = isTerminalStatus(metadata.status)
  const mapped = terminal ? mapOutcome(metadata.outcome) : null

  if (target.contactId && !context.isDemo) {
    await prisma.contact.updateMany({
      where: { id: target.contactId, orgId: activityOrgId },
      data: {
        callAttempts: { increment: 1 },
        lastCallAt: new Date(),
        ...(mapped
          ? {
              approachStatus: mapped.approachStatus,
              lastCallResult: mapped.resultCode,
            }
          : {}),
        ...(metadata.outcome === 'do_not_call' ? { doNotContact: true } : {}),
      },
    })
  }

  const activity = await prisma.activity.create({
    data: {
      orgId: activityOrgId,
      dealId: target.dealId,
      contactId: target.contactId,
      companyId: target.companyId,
      userId: context.userId,
      type: 'CALL',
      title: titleFromStatus(metadata.status),
      content: metadata.summary,
      resultCode: mapped?.resultCode ?? null,
      metadata,
      occurredAt: new Date(),
    },
  })

  return NextResponse.json({
    call: {
      id: activity.id,
      callId: metadata.callId,
      status: metadata.status,
      outcome: metadata.outcome,
      summary: metadata.summary,
      transcript: metadata.transcript,
      nextAction: metadata.nextAction,
      provider: metadata.provider,
      costHint: metadata.costHint,
      externalCallId: metadata.externalCallId,
    },
  })
}

function isTerminalStatus(status: AiCallStatus) {
  return status === 'completed' || status === 'failed' || status === 'no_answer' || status === 'needs_human'
}

function titleFromStatus(status: AiCallStatus) {
  if (status === 'completed') return 'AIコール完了'
  if (status === 'failed') return 'AIコール開始エラー'
  if (status === 'no_answer') return 'AIコール不通'
  if (status === 'needs_human') return 'AIコール要確認'
  return 'AIコール発信開始'
}

function mapOutcome(outcome: string): { approachStatus: ApproachStatus; resultCode: CallResult } {
  switch (outcome) {
    case 'no_answer':
      return { approachStatus: 'NO_ANSWER', resultCode: 'NO_ANSWER' }
    case 'meeting_booked':
      return { approachStatus: 'APPOINTMENT_SET', resultCode: 'MEETING_BOOKED' }
    case 'not_interested':
      return { approachStatus: 'CONNECTED', resultCode: 'CONNECTED_NO_INTEREST' }
    case 'do_not_call':
      return { approachStatus: 'DO_NOT_CALL', resultCode: 'DO_NOT_CALL' }
    case 'callback_requested':
      return { approachStatus: 'NEXT_ACTION', resultCode: 'CALLBACK_REQUESTED' }
    case 'connected':
      return { approachStatus: 'CONNECTED', resultCode: 'CONNECTED_INTERESTED' }
    default:
      return { approachStatus: 'NEXT_ACTION', resultCode: 'CONNECTED_FOLLOWUP_REQUESTED' }
  }
}
