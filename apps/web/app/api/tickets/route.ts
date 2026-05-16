import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma, TicketStatus } from '@bgm/db'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

async function getSessionContext() {
  const session = await auth()
  const userId = (session as unknown as { userId?: string })?.userId
  if (!userId) return null
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, orgId: true, role: true },
  })
  return user
}

const VALID_STATUS = ['OPEN', 'PENDING', 'SOLVED', 'CLOSED'] as const

export async function GET(req: NextRequest) {
  const me = await getSessionContext()
  if (!me) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const sp = req.nextUrl.searchParams
  const statusParam = sp.get('status') ?? undefined
  const companyId = sp.get('companyId') ?? undefined
  const dealId = sp.get('dealId') ?? undefined
  const assigneeUserId = sp.get('assigneeUserId') ?? undefined
  const q = sp.get('q')?.trim() ?? ''

  const where: Record<string, unknown> = { orgId: me.orgId }
  if (statusParam && (VALID_STATUS as readonly string[]).includes(statusParam)) {
    where.status = statusParam as TicketStatus
  }
  if (companyId) where.companyId = companyId
  if (dealId) where.dealId = dealId
  if (assigneeUserId) where.assigneeUserId = assigneeUserId
  if (q) {
    where.OR = [
      { subject: { contains: q, mode: 'insensitive' } },
      { description: { contains: q, mode: 'insensitive' } },
    ]
  }

  const tickets = await prisma.ticket.findMany({
    where,
    orderBy: { updatedAt: 'desc' },
    select: {
      id: true,
      ticketNumber: true,
      subject: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      resolvedAt: true,
      estimatedCompletionAt: true,
      deal: { select: { id: true, name: true } },
      company: { select: { id: true, name: true } },
      assignee: { select: { id: true, name: true } },
    },
  })

  return NextResponse.json({ tickets })
}

export async function POST(req: NextRequest) {
  const me = await getSessionContext()
  if (!me) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const body = await req.json().catch(() => null)
  if (!body || typeof body.subject !== 'string' || !body.subject.trim()) {
    return NextResponse.json({ error: 'subject is required' }, { status: 400 })
  }

  const status: TicketStatus =
    typeof body.status === 'string' && (VALID_STATUS as readonly string[]).includes(body.status)
      ? (body.status as TicketStatus)
      : 'OPEN'

  // 採番: 組織内で最大の ticketNumber + 1
  const ticket = await prisma.$transaction(async (tx) => {
    const last = await tx.ticket.findFirst({
      where: { orgId: me.orgId },
      orderBy: { ticketNumber: 'desc' },
      select: { ticketNumber: true },
    })
    const nextNumber = (last?.ticketNumber ?? 0) + 1

    // dealIdが渡されたら、そのDealから companyId/contactId を補完する
    let dealId: string | null = body.dealId ? String(body.dealId) : null
    let companyId: string | null = body.companyId ? String(body.companyId) : null
    let contactId: string | null = body.contactId ? String(body.contactId) : null
    if (dealId) {
      const deal = await tx.deal.findFirst({
        where: { id: dealId, orgId: me.orgId },
        select: { id: true, companyId: true, contactId: true },
      })
      if (!deal) {
        dealId = null
      } else {
        companyId = companyId ?? deal.companyId
        contactId = contactId ?? deal.contactId ?? null
      }
    }

    return tx.ticket.create({
      data: {
        orgId: me.orgId,
        ticketNumber: nextNumber,
        subject: String(body.subject).trim(),
        description: body.description ? String(body.description) : null,
        cause: body.cause ? String(body.cause) : null,
        resolution: body.resolution ? String(body.resolution) : null,
        status,
        dealId,
        companyId,
        contactId,
        assigneeUserId: body.assigneeUserId ? String(body.assigneeUserId) : me.id,
        estimatedCompletionAt: body.estimatedCompletionAt
          ? new Date(String(body.estimatedCompletionAt))
          : null,
      },
      include: {
        deal: { select: { id: true, name: true } },
        company: { select: { id: true, name: true } },
        assignee: { select: { id: true, name: true } },
      },
    })
  })

  return NextResponse.json({ ticket }, { status: 201 })
}
