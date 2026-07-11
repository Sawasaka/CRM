import { NextResponse } from 'next/server'
import { prisma } from '@bgm/db'
import { getGoogleOAuthClient, getCalendarClient } from '@/lib/google/oauth'
import { getDefaultMasterOrgId } from '@/lib/app-context'
import { verifyAiCallToolSecret } from '@/lib/ai-calls/tool-auth'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type BusyBlock = {
  start?: string | null
  end?: string | null
}

export async function POST(req: Request) {
  if (!verifyAiCallToolSecret(req)) {
    return NextResponse.json({ error: 'invalid_secret' }, { status: 401 })
  }

  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>
  const orgId = await getDefaultMasterOrgId()
  if (!orgId) return NextResponse.json({ error: 'org_missing' }, { status: 404 })

  const bookingUser = await resolveBookingUser(orgId)
  if (!bookingUser) return NextResponse.json({ error: 'calendar_owner_missing' }, { status: 404 })

  const durationMinutes = numberInRange(body.durationMinutes, 15, 120, 30)
  const days = numberInRange(body.days, 1, 30, 10)
  const timezone = typeof body.timezone === 'string' ? body.timezone : 'Asia/Tokyo'
  const now = new Date()
  const timeMin = new Date(now.getTime() + 60 * 60 * 1000)
  const timeMax = new Date(now.getTime() + days * 24 * 60 * 60 * 1000)

  const auth = await getGoogleOAuthClient(bookingUser.id)
  const calendar = getCalendarClient(auth)
  const freebusy = await calendar.freebusy.query({
    requestBody: {
      timeMin: timeMin.toISOString(),
      timeMax: timeMax.toISOString(),
      timeZone: timezone,
      items: [{ id: 'primary' }],
    },
  })
  const busy = freebusy.data.calendars?.primary?.busy ?? []
  const slots = buildSlots({
    timeMin,
    timeMax,
    busy,
    durationMinutes,
    timezone,
  }).slice(0, 8)

  return NextResponse.json({
    ok: true,
    owner: { id: bookingUser.id, name: bookingUser.name, email: bookingUser.email },
    durationMinutes,
    timezone,
    slots,
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

function buildSlots({
  timeMin,
  timeMax,
  busy,
  durationMinutes,
  timezone,
}: {
  timeMin: Date
  timeMax: Date
  busy: BusyBlock[]
  durationMinutes: number
  timezone: string
}) {
  const slots: Array<{ startAt: string; endAt: string; label: string }> = []
  const stepMs = 30 * 60 * 1000
  const durationMs = durationMinutes * 60 * 1000
  const cursor = new Date(Math.ceil(timeMin.getTime() / stepMs) * stepMs)

  while (cursor < timeMax && slots.length < 12) {
    const end = new Date(cursor.getTime() + durationMs)
    if (isBusinessSlot(cursor, end, timezone) && !overlapsBusy(cursor, end, busy)) {
      slots.push({
        startAt: cursor.toISOString(),
        endAt: end.toISOString(),
        label: formatSlotLabel(cursor, end, timezone),
      })
    }
    cursor.setTime(cursor.getTime() + stepMs)
  }

  return slots
}

function isBusinessSlot(start: Date, end: Date, timezone: string) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    weekday: 'short',
    hour: 'numeric',
    minute: 'numeric',
    hour12: false,
  }).formatToParts(start)
  const weekday = parts.find((p) => p.type === 'weekday')?.value
  const hour = Number(parts.find((p) => p.type === 'hour')?.value ?? 0)
  const minute = Number(parts.find((p) => p.type === 'minute')?.value ?? 0)
  const endHour = Number(
    new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      hour: 'numeric',
      hour12: false,
    }).format(end),
  )
  if (weekday === 'Sat' || weekday === 'Sun') return false
  if (hour < 10 || hour > 17) return false
  if (hour === 17 && minute > 30) return false
  return endHour <= 18
}

function overlapsBusy(start: Date, end: Date, busy: BusyBlock[]) {
  return busy.some((block) => {
    if (!block.start || !block.end) return false
    const busyStart = new Date(block.start)
    const busyEnd = new Date(block.end)
    return start < busyEnd && end > busyStart
  })
}

function formatSlotLabel(start: Date, end: Date, timezone: string) {
  const date = new Intl.DateTimeFormat('ja-JP', {
    timeZone: timezone,
    month: 'numeric',
    day: 'numeric',
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(start)
  const endTime = new Intl.DateTimeFormat('ja-JP', {
    timeZone: timezone,
    hour: '2-digit',
    minute: '2-digit',
  }).format(end)
  return `${date}-${endTime}`
}

function numberInRange(value: unknown, min: number, max: number, fallback: number) {
  const n = typeof value === 'number' ? value : Number(value)
  if (!Number.isFinite(n)) return fallback
  return Math.min(max, Math.max(min, Math.round(n)))
}
