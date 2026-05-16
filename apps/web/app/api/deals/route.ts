import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@bgm/db'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

async function getOrgId() {
  const session = await auth()
  const userId = (session as unknown as { userId?: string })?.userId
  if (!userId) return null
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { orgId: true },
  })
  return user?.orgId ?? null
}

export async function GET(req: NextRequest) {
  const orgId = await getOrgId()
  if (!orgId) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const sp = req.nextUrl.searchParams
  const q = sp.get('q')?.trim() ?? ''
  const companyId = sp.get('companyId') ?? undefined
  const take = Math.min(parseInt(sp.get('take') ?? '20', 10), 100)

  const where: Record<string, unknown> = { orgId }
  if (companyId) where.companyId = companyId
  if (q) {
    where.name = { contains: q, mode: 'insensitive' }
  }

  const deals = await prisma.deal.findMany({
    where,
    take,
    orderBy: { updatedAt: 'desc' },
    select: {
      id: true,
      name: true,
      stage: true,
      company: { select: { id: true, name: true } },
    },
  })

  return NextResponse.json({ deals })
}
