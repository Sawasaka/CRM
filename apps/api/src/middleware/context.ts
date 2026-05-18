import { prisma } from '@bgm/db'
import type { inferAsyncReturnType } from '@trpc/server'
import type { FastifyRequest } from 'fastify'

export async function createContext({ req }: { req: FastifyRequest }) {
  // Web 側の NextAuth session.userId を安全に DB 照合して利用する。
  // 旧実装の Authorization token も互換のため残す。
  const userIdHeader = req.headers['x-bgm-user-id']
  const headerUserId = Array.isArray(userIdHeader) ? userIdHeader[0] : userIdHeader
  if (headerUserId) {
    const user = await prisma.user.findUnique({
      where: { id: headerUserId },
      select: { id: true, orgId: true },
    })
    if (user) {
      return {
        prisma,
        userId: user.id,
        orgId: user.orgId,
      }
    }
  }

  // JWT からユーザー情報を取得（NextAuth セッション検証）
  const authHeader = req.headers.authorization
  const token = authHeader?.replace('Bearer ', '') ?? null

  return {
    prisma,
    userId: token ? await validateToken(token) : null,
    orgId: token ? await getOrgFromToken(token) : null,
  }
}

// NextAuth の JWT を検証してユーザーIDを返す（簡略版）
async function validateToken(token: string): Promise<string | null> {
  try {
    const user = await prisma.user.findFirst({
      where: { googleUserId: token },
      select: { id: true },
    })
    return user?.id ?? null
  } catch {
    return null
  }
}

async function getOrgFromToken(token: string): Promise<string | null> {
  try {
    const user = await prisma.user.findFirst({
      where: { googleUserId: token },
      select: { orgId: true },
    })
    return user?.orgId ?? null
  } catch {
    return null
  }
}

export type Context = inferAsyncReturnType<typeof createContext>
