import { NextResponse } from 'next/server'
import { CallResult, prisma } from '@bgm/db'
import { getDefaultMasterOrgId } from '@/lib/app-context'
import { getCalendarClient, getGoogleOAuthClient } from '@/lib/google/oauth'
import { verifyAiCallToolSecret } from '@/lib/ai-calls/tool-auth'
import type { AiCallMetadata } from '@/lib/ai-calls/types'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type BookPayload = {
  startAt?: string
  endAt?: string
  contactName?: string
  contactEmail?: string
  companyName?: string
  phone?: string
  callId?: string
  externalCallId?: string
  hearing?: {
    background?: string
    nextStep?: string
    agenda?: string
    temperature?: string
    notes?: string
  }
}

export async function POST(req: Request) {
  if (!verifyAiCallToolSecret(req)) {
    return NextResponse.json({ error: 'invalid_secret' }, { status: 401 })
  }

  const body = (await req.json().catch(() => ({}))) as BookPayload
  const startAt = body.startAt ? new Date(body.startAt) : null
  const endAt = body.endAt ? new Date(body.endAt) : null
  if (!startAt || !endAt || Number.isNaN(startAt.getTime()) || Number.isNaN(endAt.getTime()) || endAt <= startAt) {
    return NextResponse.json({ error: 'invalid_time' }, { status: 400 })
  }
  if (!body.contactEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.contactEmail)) {
    return NextResponse.json({ error: 'contact_email_required' }, { status: 400 })
  }

  const orgId = await getDefaultMasterOrgId()
  if (!orgId) return NextResponse.json({ error: 'org_missing' }, { status: 404 })

  const owner = await resolveBookingUser(orgId)
  if (!owner) return NextResponse.json({ error: 'calendar_owner_missing' }, { status: 404 })

  const company = await resolveCompany(orgId, owner.id, body.companyName)
  const contact = await resolveContact({
    orgId,
    ownerId: owner.id,
    companyId: company?.id ?? null,
    name: body.contactName,
    email: body.contactEmail,
    phone: body.phone,
  })
  const description = buildDescription(body)

  const auth = await getGoogleOAuthClient(owner.id)
  const calendar = getCalendarClient(auth)
  const event = await calendar.events.insert({
    calendarId: 'primary',
    sendUpdates: 'all',
    conferenceDataVersion: 1,
    requestBody: {
      summary: `FDE CRM相談: ${body.companyName || body.contactName || body.contactEmail}`,
      description,
      start: { dateTime: startAt.toISOString(), timeZone: 'Asia/Tokyo' },
      end: { dateTime: endAt.toISOString(), timeZone: 'Asia/Tokyo' },
      attendees: [{ email: body.contactEmail, displayName: body.contactName }],
      conferenceData: {
        createRequest: {
          requestId: `call-native-${Date.now()}`,
          conferenceSolutionKey: { type: 'hangoutsMeet' },
        },
      },
    },
  })

  if (event.data.id) {
    await prisma.meetingEvent
      .upsert({
        where: { userId_calendarEventId: { userId: owner.id, calendarEventId: event.data.id } },
        update: {
          title: event.data.summary ?? 'FDE CRM相談',
          description,
          startsAt: startAt,
          endsAt: endAt,
          meetUrl: event.data.hangoutLink ?? null,
          attendeeEmails: [body.contactEmail],
          primaryContactId: contact?.id ?? null,
          contactIds: contact?.id ? [contact.id] : [],
          companyId: company?.id ?? contact?.companyId ?? null,
          status: 'SCHEDULED',
          meetingType: 'FIRST',
        },
        create: {
          orgId,
          userId: owner.id,
          calendarEventId: event.data.id,
          iCalUID: event.data.iCalUID ?? null,
          title: event.data.summary ?? 'FDE CRM相談',
          description,
          startsAt: startAt,
          endsAt: endAt,
          meetUrl: event.data.hangoutLink ?? null,
          attendeeEmails: [body.contactEmail],
          organizerEmail: owner.email,
          primaryContactId: contact?.id ?? null,
          contactIds: contact?.id ? [contact.id] : [],
          companyId: company?.id ?? contact?.companyId ?? null,
          status: 'SCHEDULED',
          meetingType: 'FIRST',
        },
      })
      .catch((error) => console.warn('[ai-call-book] meeting event save failed', error))
  }

  await updateCallActivity({
    orgId,
    ownerId: owner.id,
    contactId: contact?.id ?? null,
    companyId: company?.id ?? contact?.companyId ?? null,
    callId: body.callId,
    externalCallId: body.externalCallId,
    calendarEventId: event.data.id ?? null,
    meetUrl: event.data.hangoutLink ?? null,
    hearing: body.hearing,
    startAt,
    endAt,
  })

  return NextResponse.json({
    ok: true,
    calendarEventId: event.data.id,
    meetUrl: event.data.hangoutLink,
    htmlLink: event.data.htmlLink,
    startAt: startAt.toISOString(),
    endAt: endAt.toISOString(),
  })
}

async function resolveBookingUser(orgId: string) {
  const configuredEmail = process.env.AI_CALL_BOOKING_USER_EMAIL ?? process.env.CONTACT_INBOX
  const where = configuredEmail ? { orgId, email: configuredEmail } : { orgId }
  return prisma.user.findFirst({
    where: {
      ...where,
      googleAccount: {
        is: {
          calendarEnabled: true,
          refreshToken: { not: null },
        },
      },
    },
    orderBy: { createdAt: 'asc' },
    select: { id: true, name: true, email: true },
  })
}

async function resolveCompany(orgId: string, ownerId: string, name?: string) {
  const companyName = name?.trim()
  if (!companyName) return null
  return (
    (await prisma.company.findFirst({ where: { orgId, name: companyName }, select: { id: true } })) ??
    (await prisma.company.create({
      data: {
        orgId,
        name: companyName,
        ownerId,
        leadSource: 'HP_INQUIRY',
        leadScore: 50,
        leadRank: 'S',
      },
      select: { id: true },
    }))
  )
}

async function resolveContact({
  orgId,
  ownerId,
  companyId,
  name,
  email,
  phone,
}: {
  orgId: string
  ownerId: string
  companyId: string | null
  name?: string
  email: string
  phone?: string
}) {
  if (!companyId) return null
  const existing = await prisma.contact.findFirst({
    where: { orgId, companyId, email },
    select: { id: true, companyId: true },
  })
  if (existing) {
    await prisma.contact.updateMany({
      where: { id: existing.id, orgId },
      data: {
        name: name?.trim() || undefined,
        phone: phone?.trim() || undefined,
        approachStatus: 'APPOINTMENT_SET',
        lastCallResult: 'MEETING_BOOKED',
        lastCallAt: new Date(),
      },
    })
    return existing
  }
  return prisma.contact.create({
    data: {
      orgId,
      companyId,
      name: name?.trim() || email,
      email,
      phone: phone?.trim() || null,
      isOwnerId: ownerId,
      approachStatus: 'APPOINTMENT_SET',
      lastCallResult: 'MEETING_BOOKED',
      lastCallAt: new Date(),
    },
    select: { id: true, companyId: true },
  })
}

async function updateCallActivity(input: {
  orgId: string
  ownerId: string
  contactId: string | null
  companyId: string | null
  callId?: string
  externalCallId?: string
  calendarEventId: string | null
  meetUrl: string | null
  hearing?: BookPayload['hearing']
  startAt: Date
  endAt: Date
}) {
  const existing = await findExistingAiCallActivity(input.callId, input.externalCallId)
  const metadataPatch = {
    outcome: 'meeting_booked',
    status: 'completed',
    calendarEventId: input.calendarEventId,
    meetUrl: input.meetUrl,
    hearing: input.hearing ?? null,
    bookedAt: new Date().toISOString(),
    meetingStartAt: input.startAt.toISOString(),
    meetingEndAt: input.endAt.toISOString(),
  }
  const content = buildActivityContent(input.hearing, input.startAt, input.endAt)

  if (existing) {
    const current = existing.metadata && typeof existing.metadata === 'object'
      ? (existing.metadata as Partial<AiCallMetadata>)
      : {}
    await prisma.activity.update({
      where: { id: existing.id },
      data: {
        title: 'AIコールで日程確定',
        content,
        resultCode: CallResult.MEETING_BOOKED,
        metadata: {
          ...current,
          ...metadataPatch,
          aiCall: true,
          callId: input.callId ?? current.callId ?? null,
          externalCallId: input.externalCallId ?? current.externalCallId ?? null,
          updatedAt: new Date().toISOString(),
        },
      },
    })
    return
  }

  await prisma.activity.create({
    data: {
      orgId: input.orgId,
      userId: input.ownerId,
      contactId: input.contactId,
      companyId: input.companyId,
      type: 'CALL',
      title: 'AIコールで日程確定',
      content,
      resultCode: 'MEETING_BOOKED',
      metadata: {
        aiCall: true,
        callId: input.callId ?? null,
        externalCallId: input.externalCallId ?? null,
        provider: 'external',
        ...metadataPatch,
      },
      occurredAt: new Date(),
    },
  })
}

async function findExistingAiCallActivity(callId?: string, externalCallId?: string) {
  if (!callId && !externalCallId) return null
  const activities = await prisma.activity.findMany({
    where: { type: 'CALL' },
    orderBy: { createdAt: 'desc' },
    take: 200,
    select: { id: true, metadata: true },
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

function buildDescription(body: BookPayload) {
  const hearing = body.hearing ?? {}
  return [
    '事前ヒアリング情報',
    '',
    `お問い合わせの背景: ${hearing.background || '未確認'}`,
    `今後のステップ: ${hearing.nextStep || '未確認'}`,
    `次回商談の議題: ${hearing.agenda || '未確認'}`,
    `温度感: ${hearing.temperature || '未確認'}`,
    `補足メモ: ${hearing.notes || 'なし'}`,
    '',
    `氏名: ${body.contactName || '未確認'}`,
    `メール: ${body.contactEmail || '未確認'}`,
    `会社名: ${body.companyName || '未確認'}`,
    `電話番号: ${body.phone || '未確認'}`,
    '',
    'この予定はAIコールによって電話口で日程確定されました。',
  ].join('\n')
}

function buildActivityContent(hearing: BookPayload['hearing'], startAt: Date, endAt: Date) {
  return [
    `AIコールで商談日程を確定しました: ${startAt.toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' })} - ${endAt.toLocaleTimeString('ja-JP', { timeZone: 'Asia/Tokyo' })}`,
    '',
    `背景: ${hearing?.background || '未確認'}`,
    `今後のステップ: ${hearing?.nextStep || '未確認'}`,
    `商談議題: ${hearing?.agenda || '未確認'}`,
  ].join('\n')
}
