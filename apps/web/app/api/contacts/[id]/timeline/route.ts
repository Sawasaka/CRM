import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@bgm/db'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await auth()
  const userId = (session as unknown as { userId?: string })?.userId
  if (!userId) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const { id: contactId } = await ctx.params

  const [emails, meetings, calls] = await Promise.all([
    prisma.emailMessage.findMany({
      where: { contactId },
      orderBy: { sentAt: 'desc' },
      take: 50,
      select: {
        id: true,
        subject: true,
        snippet: true,
        fromAddress: true,
        fromName: true,
        toAddresses: true,
        sentAt: true,
        direction: true,
      },
    }),
    prisma.meetingEvent.findMany({
      where: { OR: [{ primaryContactId: contactId }, { contactIds: { has: contactId } }] },
      orderBy: { startsAt: 'desc' },
      take: 50,
      select: {
        id: true,
        title: true,
        startsAt: true,
        endsAt: true,
        meetUrl: true,
        status: true,
        occurrenceIndex: true,
        meetingType: true,
        attendeeEmails: true,
      },
    }),
    prisma.activity.findMany({
      where: { contactId, type: 'CALL' },
      orderBy: { occurredAt: 'desc' },
      take: 50,
      select: {
        id: true,
        title: true,
        content: true,
        resultCode: true,
        occurredAt: true,
        metadata: true,
      },
    }),
  ])

  return NextResponse.json({ emails, meetings, calls })
}
