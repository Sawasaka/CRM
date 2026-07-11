import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@bgm/db'
import { getCurrentAppContext } from '@/lib/app-context'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function toUiTaskType(type: string) {
  switch (type) {
    case 'CALL':
      return 'call'
    case 'EMAIL':
      return 'email'
    case 'MEETING_PREP':
      return 'meeting'
    case 'PROPOSAL':
    case 'DOCUMENT':
      return 'followup'
    default:
      return 'other'
  }
}

function toRank(rank?: string | null) {
  if (rank === 'S' || rank === 'A') return 'A'
  if (rank === 'B') return 'B'
  return 'C'
}

export async function GET(req: NextRequest) {
  const context = await getCurrentAppContext({ allowDevFallback: true })
  if (!context) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const sp = req.nextUrl.searchParams
  const scope = sp.get('scope')
  const now = new Date()
  const todayStart = new Date(now)
  todayStart.setHours(0, 0, 0, 0)
  const tomorrowStart = new Date(todayStart)
  tomorrowStart.setDate(tomorrowStart.getDate() + 1)

  const where: Record<string, unknown> = { orgId: context.appOrgId }
  if (scope === 'today') {
    where.dueAt = { gte: todayStart, lt: tomorrowStart }
  } else if (scope === 'overdue') {
    where.dueAt = { lt: todayStart }
    where.completedAt = null
  }

  const tasks = await prisma.task.findMany({
    where,
    orderBy: [{ completedAt: 'asc' }, { dueAt: 'asc' }],
    take: 200,
    select: {
      id: true,
      type: true,
      title: true,
      memo: true,
      dueAt: true,
      completedAt: true,
      owner: { select: { id: true, name: true, email: true } },
      deal: {
        select: {
          id: true,
          name: true,
          company: { select: { id: true, name: true, leadRank: true } },
          contact: { select: { id: true, name: true } },
        },
      },
      contact: {
        select: {
          id: true,
          name: true,
          company: { select: { id: true, name: true, leadRank: true } },
        },
      },
    },
  })

  return NextResponse.json({
    tasks: tasks.map((task) => {
      const company = task.contact?.company ?? task.deal?.company ?? null
      const contact = task.contact ?? task.deal?.contact ?? null
      const category = task.deal ? 'deal' : 'contact'
      return {
        id: task.id,
        type: toUiTaskType(task.type),
        company: company?.name ?? '未設定',
        person: contact?.name ?? '',
        rank: toRank(company?.leadRank),
        urgent: !task.completedAt && task.dueAt.getTime() < tomorrowStart.getTime(),
        owner: task.owner.id,
        ownerName: task.owner.name,
        category,
        linkTo: task.deal ? `/deals/${task.deal.id}` : contact ? `/contacts/${contact.id}` : '/tasks',
        title: task.title,
        memo: task.memo ?? '',
        dueAt: task.dueAt.toISOString().slice(0, 10),
        remindAt: '',
        completed: Boolean(task.completedAt),
      }
    }),
  })
}
