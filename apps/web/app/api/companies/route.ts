import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@bgm/db'
import { getCurrentAppContext } from '@/lib/app-context'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const context = await getCurrentAppContext()
  if (!context) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const sp = req.nextUrl.searchParams
  const q = sp.get('q')?.trim() ?? ''
  const take = Math.min(parseInt(sp.get('take') ?? '20', 10), 100)

  const where: Record<string, unknown> = { orgId: context.appOrgId }
  if (q) where.name = { contains: q, mode: 'insensitive' }

  const companies = await prisma.company.findMany({
    where,
    take,
    orderBy: { name: 'asc' },
    select: { id: true, name: true },
  })

  return NextResponse.json({ companies })
}
