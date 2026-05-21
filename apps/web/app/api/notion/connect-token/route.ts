import { NextResponse } from 'next/server'
import { resolveGoogleIntegrationUserId } from '@/lib/google/current-user'
import { upsertNotionAccount } from '@/lib/notion/account-store'
import { notionRequest } from '@/lib/notion/client'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type NotionMeResponse = {
  id?: string
  bot?: {
    workspace_id?: string
    workspace_name?: string
  }
}

export async function POST(req: Request) {
  const userId = await resolveGoogleIntegrationUserId()
  if (!userId) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const body = (await req.json().catch(() => ({}))) as {
    token?: string
    workspaceName?: string
    workspaceId?: string
  }
  const token = body.token?.trim()
  if (!token) {
    return NextResponse.json(
      { error: 'missing_token', message: 'Notion APIトークンを入力してください。' },
      { status: 400 }
    )
  }

  try {
    const me = await notionRequest<NotionMeResponse>(token, '/users/me')
    const workspaceName =
      body.workspaceName?.trim() || me.bot?.workspace_name || 'Notion workspace'
    const workspaceId = body.workspaceId?.trim() || me.bot?.workspace_id || null

    await upsertNotionAccount({
      userId,
      workspaceId,
      workspaceName,
      botId: me.id ?? null,
      accessToken: token,
      refreshToken: null,
      owner: { type: 'manual_token' },
    })

    return NextResponse.json({ connected: true, workspaceName, workspaceId })
  } catch (error) {
    return NextResponse.json(
      {
        error: 'notion_token_invalid',
        message:
          error instanceof Error
            ? error.message
            : 'Notion APIトークンの確認に失敗しました。',
      },
      { status: 400 }
    )
  }
}
