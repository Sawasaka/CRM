import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@bgm/db'
import { auth } from '@/lib/auth'
import { syncCalendarForUser } from '@/lib/google/calendar-sync'
import { syncMeetForUser } from '@/lib/google/meet-sync'
import { GoogleAccountNotConnectedError } from '@/lib/google/oauth'
import { availabilityFromScope } from '@/lib/google/scopes'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

type BrowserAction = {
  type: 'open_url'
  url: string
  label: string
  autoOpen: boolean
}

type BrowserActionResponse = {
  handled: boolean
  content?: string
  action?: BrowserAction
}

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as { prompt?: string }
  const prompt = body.prompt ?? ''

  if (!isGoogleMeetMinutesRequest(prompt)) {
    return NextResponse.json({ handled: false } satisfies BrowserActionResponse)
  }

  const session = await auth()
  const sessionUserId = (session as unknown as { userId?: string })?.userId ?? null
  const userId = sessionUserId ?? (await resolveLocalDevUserId())

  if (!userId) {
    return NextResponse.json({
      handled: true,
      content: 'Google Meet と議事録連携を始めるにはログインが必要です。ログイン画面を開きます。',
      action: {
        type: 'open_url',
        url: '/login?callbackUrl=/settings/integrations',
        label: 'ログインする',
        autoOpen: true,
      },
    } satisfies BrowserActionResponse)
  }

  const account = await prisma.userGoogleAccount.findUnique({
    where: { userId },
    select: {
      scope: true,
      email: true,
      calendarEnabled: true,
      meetEnabled: true,
    },
  })

  const availability = availabilityFromScope(account?.scope)
  const readyForMeetMinutes = Boolean(account && availability.calendar && availability.meet)

  if (!readyForMeetMinutes) {
    return NextResponse.json({
      handled: true,
      content:
        'Google Meet と議事録の連携を開始します。Google の認可画面を開くので、Calendar / Meet の権限を許可してください。認可後にもう一度「Meet議事録を同期して」と送ると取り込みまで実行します。',
      action: {
        type: 'open_url',
        url: '/api/google/install?service=calendar,meet',
        label: 'Google 認可を開く',
        autoOpen: true,
      },
    } satisfies BrowserActionResponse)
  }

  try {
    await prisma.userGoogleAccount.update({
      where: { userId },
      data: {
        calendarEnabled: true,
        meetEnabled: true,
      },
    })

    const calendar = await syncCalendarForUser(userId)
    const meet = await syncMeetForUser(userId)

    return NextResponse.json({
      handled: true,
      content: [
        'Google Meet と議事録連携を同期しました。',
        `- Calendar予定: ${calendar.upserted}/${calendar.fetched}件を反映`,
        `- Meet会議: ${meet.conferenceRecords}件を確認`,
        `- 議事録: ${meet.transcriptsImported}件を取り込み`,
        `- 商談進行: ${meet.dealsAdvanced}件を更新`,
      ].join('\n'),
    } satisfies BrowserActionResponse)
  } catch (e) {
    if (e instanceof GoogleAccountNotConnectedError) {
      return NextResponse.json({
        handled: true,
        content: 'Googleアカウントの再認可が必要です。Google の認可画面を開きます。',
        action: {
          type: 'open_url',
          url: '/api/google/install?service=calendar,meet',
          label: 'Google 認可を開く',
          autoOpen: true,
        },
      } satisfies BrowserActionResponse)
    }

    return NextResponse.json(
      {
        handled: true,
        content: `Google Meet / 議事録同期でエラーが発生しました: ${
          e instanceof Error ? e.message : String(e)
        }`,
      } satisfies BrowserActionResponse,
      { status: 200 }
    )
  }
}

async function resolveLocalDevUserId(): Promise<string | null> {
  if (process.env.NODE_ENV === 'production') return null
  const user = await prisma.user.findFirst({
    orderBy: { createdAt: 'asc' },
    select: { id: true },
  })
  return user?.id ?? null
}

function isGoogleMeetMinutesRequest(prompt: string): boolean {
  const text = prompt.toLowerCase()
  const mentionsGoogle = /google|グーグル|gws|workspace/.test(text)
  const mentionsMeetOrMinutes = /meet|ミート|会議|議事録|文字起こし|transcript|minutes/.test(text)
  const wantsAction = /連携|接続|同期|取り込|取込|設定|つな|繋|して|やって/.test(text)
  return mentionsGoogle && mentionsMeetOrMinutes && wantsAction
}
