import { NextResponse } from 'next/server'
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

export async function GET() {
  const orgId = await getOrgId()
  if (!orgId) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const users = await prisma.user.findMany({
    where: { orgId },
    orderBy: { name: 'asc' },
    select: { id: true, name: true, email: true, role: true },
  })

  return NextResponse.json({ users })
}
