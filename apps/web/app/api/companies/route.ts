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
  const take = Math.min(parseInt(sp.get('take') ?? '20', 10), 100)

  const where: Record<string, unknown> = { orgId }
  if (q) where.name = { contains: q, mode: 'insensitive' }

  const companies = await prisma.company.findMany({
    where,
    take,
    orderBy: { name: 'asc' },
    select: { id: true, name: true },
  })

  return NextResponse.json({ companies })
}
