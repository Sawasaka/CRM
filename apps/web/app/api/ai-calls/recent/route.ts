import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@bgm/db'
import { getCurrentAppContext } from '@/lib/app-context'
import { getAiCallProviderReadiness } from '@/lib/ai-calls/provider'
import type { AiCallMetadata } from '@/lib/ai-calls/types'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const context = await getCurrentAppContext({ allowDevFallback: true })
  if (!context) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const limit = Math.min(Number(req.nextUrl.searchParams.get('limit') ?? 20) || 20, 50)
  const orgIds = Array.from(new Set([context.appOrgId, context.userOrgId]))
  const activities = await prisma.activity.findMany({
    where: { orgId: { in: orgIds }, type: 'CALL' },
    orderBy: { occurredAt: 'desc' },
    take: 100,
    select: {
      id: true,
      title: true,
      content: true,
      resultCode: true,
      occurredAt: true,
      metadata: true,
      contact: { select: { id: true, name: true, phone: true } },
      company: { select: { id: true, name: true } },
      deal: { select: { id: true, name: true } },
    },
  })

  const calls = activities
    .filter((activity) => isAiCallMetadata(activity.metadata))
    .slice(0, limit)
    .map((activity) => {
      const metadata = activity.metadata as AiCallMetadata
      return {
        id: activity.id,
        callId: metadata.callId,
        title: activity.title,
        summary: activity.content,
        resultCode: activity.resultCode,
        occurredAt: activity.occurredAt,
        companyName: activity.company?.name ?? metadata.companyName ?? null,
        contactName: activity.contact?.name ?? metadata.contactName ?? null,
        contact: activity.contact,
        company: activity.company,
        deal: activity.deal,
        metadata,
      }
    })

  return NextResponse.json({ calls, readiness: getAiCallProviderReadiness() })
}

function isAiCallMetadata(value: unknown): value is AiCallMetadata {
  return Boolean(
    value &&
      typeof value === 'object' &&
      'aiCall' in value &&
      (value as { aiCall?: unknown }).aiCall === true,
  )
}
