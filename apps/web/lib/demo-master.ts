import { auth } from '@/lib/auth'
import { prisma } from '@bgm/db'

type DemoOrg = {
  id: string
  slug: string
  lifecycleStatus: string
  demoExpiresAt: Date | null
}

type CurrentAppContext = {
  userId: string
  userOrgId: string
  appOrgId: string
  isDemo: boolean
  role?: string
  org: DemoOrg
}

function isActiveDemoOrg(org: DemoOrg) {
  const isDemo = org.slug.startsWith('demo-') || org.lifecycleStatus === 'DEMO'
  return isDemo && (!org.demoExpiresAt || org.demoExpiresAt > new Date())
}

async function resolveUserId(allowDevFallback: boolean) {
  const session = await auth()
  let userId = (session as unknown as { userId?: string })?.userId ?? null

  if (!userId && allowDevFallback && process.env.NODE_ENV !== 'production') {
    const firstUser = await prisma.user.findFirst({
      orderBy: { createdAt: 'asc' },
      select: { id: true },
    })
    userId = firstUser?.id ?? null
  }

  return userId
}

export async function getDefaultMasterOrgId() {
  const configured = process.env.BGM_TENANT_ID ?? process.env.NEXT_PUBLIC_BGM_TENANT_ID
  if (configured) {
    const org = await prisma.organization.findUnique({
      where: { id: configured },
      select: { id: true },
    })
    if (org) return org.id
  }

  const defaultOrg = await prisma.organization.findFirst({
    where: { slug: 'default' },
    select: { id: true },
  })
  if (defaultOrg) return defaultOrg.id

  const firstOrg = await prisma.organization.findFirst({
    orderBy: { createdAt: 'asc' },
    select: { id: true },
  })
  return firstOrg?.id ?? null
}

export async function getCurrentAppContext(options?: {
  allowDevFallback?: boolean
}): Promise<CurrentAppContext | null> {
  const userId = await resolveUserId(Boolean(options?.allowDevFallback))
  if (!userId) return null

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      orgId: true,
      role: true,
      org: {
        select: {
          id: true,
          slug: true,
          lifecycleStatus: true,
          demoExpiresAt: true,
        },
      },
    },
  })
  if (!user) return null

  const isDemo = isActiveDemoOrg(user.org)
  const defaultMasterOrgId = isDemo ? await getDefaultMasterOrgId() : null

  return {
    userId: user.id,
    userOrgId: user.orgId,
    appOrgId: defaultMasterOrgId ?? user.orgId,
    isDemo,
    role: user.role,
    org: user.org,
  }
}
