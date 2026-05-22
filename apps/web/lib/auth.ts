import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import Google from 'next-auth/providers/google'
import { prisma } from '@bgm/db'
import { verifyPassword } from '@/lib/password'
import { ensureUser } from '@/lib/user-provisioning'
import { ensureAuthUserColumns } from '@/lib/auth-schema'
import { getGoogleAccountSnapshot, upsertGoogleAccountSnapshot } from '@/lib/google/account-store'

const providers = [
  Credentials({
    credentials: {
      email: { label: 'Email', type: 'email' },
      password: { label: 'Password', type: 'password' },
    },
    async authorize(credentials) {
      const email = String(credentials.email ?? '')
        .trim()
        .toLowerCase()
      const password = String(credentials.password ?? '')
      if (!email || !password) return null

      await ensureAuthUserColumns()
      const rows = await prisma.$queryRaw<
        Array<{ id: string; email: string; name: string; passwordHash: string | null }>
      >`
        SELECT "id", "email", "name", "passwordHash"
        FROM "User"
        WHERE "email" = ${email}
        LIMIT 1
      `
      const user = rows[0]
      if (!user?.passwordHash) return null

      const ok = await verifyPassword(password, user.passwordHash)
      if (!ok) return null

      return { id: user.id, email: user.email, name: user.name }
    },
  }),
  ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
    ? [
        Google({
          clientId: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          authorization: {
            params: {
              // Google Cloud 側に登録済みの NextAuth callback で、まず Gmail 連携を実用化する。
              // Drive / Calendar / Meet は /api/google/install の incremental authorization で追加取得する。
              scope: [
                'openid',
                'email',
                'profile',
                'https://www.googleapis.com/auth/gmail.modify',
              ].join(' '),
              access_type: 'offline',
              prompt: 'consent',
            },
          },
        }),
      ]
    : []),
]

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers,
  callbacks: {
    async jwt({ token, account, profile, user }) {
      if (user?.id) {
        token.userId = user.id
        token.email = user.email
      }

      // 初回ログイン時に Google account を DB へ保存
      if (account && profile && account.provider === 'google') {
        token.accessToken = account.access_token
        token.refreshToken = account.refresh_token
        token.googleSub = account.providerAccountId
        token.email = profile.email

        const userId = await ensureUser({
          email: profile.email as string,
          name: (profile.name as string) ?? (profile.email as string),
          googleUserId: account.providerAccountId,
        })
        token.userId = userId

        if (account.refresh_token) {
          const existing = await getGoogleAccountSnapshot(userId)
          await upsertGoogleAccountSnapshot({
            userId,
            googleSub: account.providerAccountId,
            email: profile.email as string,
            accessToken: account.access_token ?? null,
            refreshToken: account.refresh_token ?? existing?.refreshToken ?? null,
            expiresAt: account.expires_at ? new Date(account.expires_at * 1000) : null,
            scope: mergeScopes(existing?.scope ?? null, (account.scope as string) ?? ''),
          })
        }
      }

      return token
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken as string
      ;(session as unknown as { userId?: string }).userId = token.userId as string | undefined
      if (session.user && typeof token.userId === 'string') {
        session.user.id = token.userId
      }
      return session
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
})

function mergeScopes(existing: string | null, incoming: string): string {
  const set = new Set<string>()
  if (existing) for (const s of existing.split(/\s+/)) if (s) set.add(s)
  for (const s of incoming.split(/\s+/)) if (s) set.add(s)
  return Array.from(set).join(' ')
}
