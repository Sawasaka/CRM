import { NextRequest, NextResponse } from 'next/server'
import { prisma, TicketStatus } from '@bgm/db'
import { getCurrentAppContext } from '@/lib/demo-master'
import { getDemoTicketDetail } from '@/lib/demo-crm-data'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const VALID_STATUS = ['OPEN', 'PENDING', 'SOLVED', 'CLOSED'] as const

const ticketInclude = {
  deal: { select: { id: true, name: true } },
  company: { select: { id: true, name: true } },
  contact: { select: { id: true, name: true } },
  assignee: { select: { id: true, name: true } },
} as const

const ticketDetailSelect = {
  id: true,
  orgId: true,
  ticketNumber: true,
  subject: true,
  description: true,
  cause: true,
  resolution: true,
  memo: true,
  status: true,
  dealId: true,
  companyId: true,
  contactId: true,
  assigneeUserId: true,
  estimatedCompletionAt: true,
  resolvedAt: true,
  closedAt: true,
  createdAt: true,
  updatedAt: true,
  ...ticketInclude,
} as const

const ticketDetailSelectWithoutEstimate = {
  id: true,
  orgId: true,
  ticketNumber: true,
  subject: true,
  description: true,
  cause: true,
  resolution: true,
  memo: true,
  status: true,
  companyId: true,
  contactId: true,
  assigneeUserId: true,
  resolvedAt: true,
  closedAt: true,
  createdAt: true,
  updatedAt: true,
  company: ticketInclude.company,
  contact: ticketInclude.contact,
  assignee: ticketInclude.assignee,
} as const

function isMissingColumn(error: unknown) {
  return (error as { code?: string }).code === 'P2022'
}

function isMissingEstimatedCompletionAt(error: unknown) {
  const e = error as { code?: string; meta?: { column?: string } }
  return e.code === 'P2022' && e.meta?.column === 'Ticket.estimatedCompletionAt'
}

function canUseDevSchemaFallback(error: unknown) {
  return process.env.NEXT_PUBLIC_DEV_MODE === 'true' && isMissingColumn(error)
}

export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const context = await getCurrentAppContext({ allowDevFallback: true })
  if (!context) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const { id } = await ctx.params

  let ticket
  try {
    ticket = await prisma.ticket.findFirst({
      where: { id, orgId: context.appOrgId },
      select: ticketDetailSelect,
    })
  } catch (error) {
    if (canUseDevSchemaFallback(error) && !isMissingEstimatedCompletionAt(error)) {
      return NextResponse.json({ error: 'not found' }, { status: 404 })
    }
    if (!isMissingEstimatedCompletionAt(error)) throw error
    try {
      const fallbackTicket = await prisma.ticket.findFirst({
        where: { id, orgId: context.appOrgId },
        select: ticketDetailSelectWithoutEstimate,
      })
      ticket = fallbackTicket ? { ...fallbackTicket, dealId: null, deal: null, estimatedCompletionAt: null } : null
    } catch (fallbackError) {
      if (canUseDevSchemaFallback(fallbackError)) {
        return NextResponse.json({ error: 'not found' }, { status: 404 })
      }
      throw fallbackError
    }
  }
  if (!ticket && context.isDemo) {
    const demoTicket = getDemoTicketDetail(id)
    if (demoTicket) return NextResponse.json({ ticket: demoTicket })
  }
  if (!ticket) return NextResponse.json({ error: 'not found' }, { status: 404 })
  return NextResponse.json({ ticket })
}

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const context = await getCurrentAppContext({ allowDevFallback: true })
  if (!context) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const { id } = await ctx.params

  const existing = await prisma.ticket.findFirst({
    where: { id, orgId: context.userOrgId },
    select: { id: true, status: true },
  })
  if (!existing) return NextResponse.json({ error: 'not found' }, { status: 404 })

  const body = await req.json().catch(() => null)
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'invalid body' }, { status: 400 })
  }

  const data: Record<string, unknown> = {}

  if (typeof body.subject === 'string') {
    if (!body.subject.trim()) {
      return NextResponse.json({ error: 'subject cannot be empty' }, { status: 400 })
    }
    data.subject = body.subject.trim()
  }
  if ('description' in body) data.description = body.description ? String(body.description) : null
  if ('cause' in body) data.cause = body.cause ? String(body.cause) : null
  if ('resolution' in body) data.resolution = body.resolution ? String(body.resolution) : null
  if ('memo' in body) data.memo = body.memo ? String(body.memo) : null
  if ('dealId' in body) {
    const newDealId = body.dealId ? String(body.dealId) : null
    data.dealId = newDealId
    if (newDealId) {
      const deal = await prisma.deal.findFirst({
        where: { id: newDealId, orgId: context.userOrgId },
        select: { companyId: true, contactId: true },
      })
      if (deal) {
        if (!('companyId' in body)) data.companyId = deal.companyId
        if (!('contactId' in body)) data.contactId = deal.contactId ?? null
      }
    }
  }
  if ('companyId' in body) data.companyId = body.companyId ? String(body.companyId) : null
  if ('contactId' in body) data.contactId = body.contactId ? String(body.contactId) : null
  if ('assigneeUserId' in body)
    data.assigneeUserId = body.assigneeUserId ? String(body.assigneeUserId) : null
  if ('estimatedCompletionAt' in body)
    data.estimatedCompletionAt = body.estimatedCompletionAt
      ? new Date(String(body.estimatedCompletionAt))
      : null

  if (typeof body.status === 'string' && (VALID_STATUS as readonly string[]).includes(body.status)) {
    const next = body.status as TicketStatus
    data.status = next
    // ステータス遷移に応じて resolvedAt / closedAt を自動セット
    const now = new Date()
    if (next === 'SOLVED' && existing.status !== 'SOLVED') {
      data.resolvedAt = now
    }
    if (next === 'CLOSED' && existing.status !== 'CLOSED') {
      data.closedAt = now
      // 直接 CLOSED にされた場合に resolvedAt が空ならセット
      data.resolvedAt = data.resolvedAt ?? now
    }
    // OPEN/PENDING に戻されたら解決日時はクリア
    if ((next === 'OPEN' || next === 'PENDING') && existing.status !== next) {
      data.resolvedAt = null
      data.closedAt = null
    }
  }

  const ticket = await prisma.ticket.update({
    where: { id },
    data,
    include: ticketInclude,
  })

  return NextResponse.json({ ticket })
}
