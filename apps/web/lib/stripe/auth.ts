import { auth } from '@/lib/auth'
import { prisma } from '@bgm/db'

export async function getBillingOrg() {
  const session = await auth()
  const userId = (session as unknown as { userId?: string })?.userId
  if (!userId) return null

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      email: true,
      org: {
        select: {
          id: true,
          name: true,
          slug: true,
          plan: true,
        },
      },
    },
  })

  if (!user?.org) return null
  return {
    userEmail: session?.user?.email ?? user.email,
    org: user.org,
  }
}
