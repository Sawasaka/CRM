import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@bgm/db'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const session = await auth()
    const userId = (session as unknown as { userId?: string })?.userId
    if (!userId) return NextResponse.json({ connected: false })

    // passwordHash 等の追加カラムが本番DBで未反映の場合に findUnique が落ちるため
    // orgId だけに絞って取得（schema 不整合に対する安全策）
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { orgId: true },
    })
    if (!user) return NextResponse.json({ connected: false })

    const workspaces = await prisma.slackWorkspace.findMany({
      where: { orgId: user.orgId },
      select: {
        id: true,
        teamId: true,
        teamName: true,
        enabled: true,
        lastSyncAt: true,
      },
    })
    return NextResponse.json({
      connected: workspaces.length > 0,
      workspaces,
    })
  } catch (e) {
    // dev 環境のスキーマズレ等で 500 にしてしまうとサイト全体のクライアントエラーバウンダリが
    // 反応してしまうため、connected=false にフォールバックする
    console.warn('[slack/status] fallback:', (e as Error).message)
    return NextResponse.json({ connected: false })
  }
}
