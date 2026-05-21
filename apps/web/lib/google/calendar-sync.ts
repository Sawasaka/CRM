import { prisma, MeetingStatus } from '@bgm/db'
import { getCalendarClient, getGoogleOAuthClient } from './oauth'
import type { calendar_v3 } from 'googleapis'

interface SyncOptions {
  /** 取得対象範囲: 過去 N 日 〜 未来 N 日 */
  pastDays?: number
  futureDays?: number
}

interface SyncResult {
  fetched: number
  upserted: number
  matchedToContact: number
  matchedToDeal: number
}

/**
 * Calendar の予定を取得し、参加者メアドをコンタクトとマッチングして MeetingEvent に保存。
 * Meet 会議URLが含まれる予定は meetUrl/meetCode を抽出。
 */
export async function syncCalendarForUser(
  userId: string,
  opts: SyncOptions = {},
): Promise<SyncResult> {
  const pastDays = opts.pastDays ?? 30
  const futureDays = opts.futureDays ?? 30

  const auth = await getGoogleOAuthClient(userId)
  const cal = getCalendarClient(auth)
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { orgId: true } })
  if (!user) throw new Error(`User not found: ${userId}`)

  const timeMin = new Date(Date.now() - pastDays * 86_400_000).toISOString()
  const timeMax = new Date(Date.now() + futureDays * 86_400_000).toISOString()

  const list = await cal.events.list({
    calendarId: 'primary',
    timeMin,
    timeMax,
    singleEvents: true,
    orderBy: 'startTime',
    maxResults: 250,
  })

  const events = list.data.items ?? []

  // コンタクト一覧を一括ロード
  const contacts = await prisma.contact.findMany({
    where: { orgId: user.orgId, email: { not: null } },
    select: { id: true, email: true, companyId: true },
  })
  const contactByEmail = new Map<string, { id: string; companyId: string }>()
  for (const c of contacts) {
    if (c.email) contactByEmail.set(c.email.toLowerCase(), { id: c.id, companyId: c.companyId })
  }

  let upserted = 0
  let matchedToContact = 0
  let matchedToDeal = 0

  for (const ev of events) {
    if (!ev.id || ev.status === 'cancelled') continue
    const parsed = parseCalendarEvent(ev)
    if (!parsed) continue

    // 参加者の中からコンタクト一致する人を抽出
    const matches: { id: string; companyId: string; email: string }[] = []
    for (const att of parsed.attendees) {
      const c = contactByEmail.get(att.toLowerCase())
      if (c) matches.push({ ...c, email: att })
    }

    const primaryContact = matches[0]
    const primaryCompanyId = primaryContact?.companyId ?? null
    const contactIds = Array.from(new Set(matches.map((m) => m.id)))

    // 商談（Deal）を推定: contact が紐付くオープンな Deal 優先
    let dealId: string | null = null
    if (primaryContact) {
      const deal = await prisma.deal.findFirst({
        where: {
          orgId: user.orgId,
          contactId: primaryContact.id,
          stage: { notIn: ['CLOSED_WON', 'CLOSED_LOST'] },
        },
        orderBy: { updatedAt: 'desc' },
      })
      dealId = deal?.id ?? null
    }

    if (matches.length > 0) matchedToContact++
    if (dealId) matchedToDeal++

    // 過去予定で endsAt < now なら HELD ステータス（議事録未取得）
    const now = new Date()
    const computedStatus: MeetingStatus =
      ev.status === 'cancelled'
        ? 'CANCELED'
        : parsed.endsAt < now
          ? 'HELD'
          : 'SCHEDULED'

    const existingMeeting = await prisma.meetingEvent.findUnique({
      where: { userId_calendarEventId: { userId, calendarEventId: ev.id } },
      select: { status: true },
    })
    const status: MeetingStatus =
      existingMeeting?.status === MeetingStatus.COMPLETED
        ? MeetingStatus.COMPLETED
        : computedStatus

    await prisma.meetingEvent.upsert({
      where: { userId_calendarEventId: { userId, calendarEventId: ev.id } },
      create: {
        orgId: user.orgId,
        userId,
        calendarId: 'primary',
        calendarEventId: ev.id,
        iCalUID: ev.iCalUID ?? null,
        title: parsed.title,
        description: parsed.description,
        startsAt: parsed.startsAt,
        endsAt: parsed.endsAt,
        meetUrl: parsed.meetUrl,
        meetCode: parsed.meetCode,
        conferenceId: parsed.conferenceId,
        attendeeEmails: parsed.attendees,
        organizerEmail: parsed.organizerEmail,
        primaryContactId: primaryContact?.id ?? null,
        contactIds,
        companyId: primaryCompanyId,
        dealId,
        status,
      },
      update: {
        title: parsed.title,
        description: parsed.description,
        startsAt: parsed.startsAt,
        endsAt: parsed.endsAt,
        meetUrl: parsed.meetUrl,
        meetCode: parsed.meetCode,
        conferenceId: parsed.conferenceId,
        attendeeEmails: parsed.attendees,
        organizerEmail: parsed.organizerEmail,
        primaryContactId: primaryContact?.id ?? undefined,
        contactIds,
        // 既存の dealId は手動上書きされている可能性があるため、未設定の場合のみ更新
        dealId: dealId ?? undefined,
        // Meet 議事録取得済みの予定は Calendar 再同期で HELD に戻さない
        status,
      },
    })

    upserted++
  }

  await prisma.userGoogleAccount.update({
    where: { userId },
    data: { lastCalendarSyncAt: new Date() },
  })

  return { fetched: events.length, upserted, matchedToContact, matchedToDeal }
}

interface ParsedEvent {
  title: string
  description: string | null
  startsAt: Date
  endsAt: Date
  meetUrl: string | null
  meetCode: string | null
  conferenceId: string | null
  attendees: string[]
  organizerEmail: string | null
}

function parseCalendarEvent(ev: calendar_v3.Schema$Event): ParsedEvent | null {
  if (!ev.start?.dateTime && !ev.start?.date) return null
  const startsAt = ev.start?.dateTime
    ? new Date(ev.start.dateTime)
    : new Date(ev.start?.date as string)
  const endsAt = ev.end?.dateTime
    ? new Date(ev.end.dateTime)
    : new Date(ev.end?.date as string)

  const conf = ev.conferenceData
  let meetUrl: string | null = null
  let meetCode: string | null = null
  if (conf?.entryPoints) {
    for (const ep of conf.entryPoints) {
      if (ep.entryPointType === 'video' && ep.uri?.includes('meet.google.com')) {
        meetUrl = ep.uri
        const codeMatch = ep.uri.match(/meet\.google\.com\/([a-z0-9-]+)/i)
        meetCode = codeMatch?.[1] ?? null
        break
      }
    }
  }
  if (!meetUrl && ev.hangoutLink?.includes('meet.google.com')) {
    meetUrl = ev.hangoutLink
    const codeMatch = ev.hangoutLink.match(/meet\.google\.com\/([a-z0-9-]+)/i)
    meetCode = codeMatch?.[1] ?? null
  }
  if (!meetUrl) {
    const haystack = [ev.location, ev.description].filter(Boolean).join('\n')
    const m = haystack.match(/https:\/\/meet\.google\.com\/([a-z0-9-]+)/i)
    if (m?.[0]) {
      meetUrl = m[0]
      meetCode = m[1] ?? null
    }
  }

  const attendees =
    (ev.attendees ?? [])
      .map((a) => a.email?.toLowerCase())
      .filter((a): a is string => !!a) ?? []

  return {
    title: ev.summary ?? '(タイトルなし)',
    description: ev.description ?? null,
    startsAt,
    endsAt,
    meetUrl,
    meetCode,
    conferenceId: conf?.conferenceId ?? null,
    attendees,
    organizerEmail: ev.organizer?.email ?? null,
  }
}
