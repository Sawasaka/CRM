import { prisma, MeetingStatus } from '@bgm/db'
import { getDriveClient, getGoogleOAuthClient, getMeetClient } from './oauth'
import { advanceDealOnMeetingCompleted } from './deal-rules'

interface SyncResult {
  conferenceRecords: number
  transcriptsImported: number
  dealsAdvanced: number
}

/**
 * Meet API v2 の conferenceRecords を走査し、紐付くトランスクリプトを取得して
 * MeetingEvent / Transcript に保存。
 *
 * 紐付け順:
 *   1. conferenceRecord.space.meetingCode → MeetingEvent.meetCode で完全一致
 *   2. (フォールバック) 開催時刻が近い MeetingEvent
 */
export async function syncMeetForUser(userId: string): Promise<SyncResult> {
  const auth = await getGoogleOAuthClient(userId)
  const meet = getMeetClient(auth)
  const drive = getDriveClient(auth)
  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) throw new Error(`User not found: ${userId}`)

  // 直近 30 日の conferenceRecord
  const thirtyDaysAgoIso = new Date(Date.now() - 30 * 86_400_000).toISOString()
  const records = await meet.conferenceRecords.list({
    filter: `start_time>="${thirtyDaysAgoIso}"`,
    pageSize: 50,
  })

  const items = records.data.conferenceRecords ?? []
  let transcriptsImported = 0
  let dealsAdvanced = 0

  for (const rec of items) {
    if (!rec.name) continue

    // 既に取り込み済みかチェック
    const existing = await prisma.transcript.findUnique({
      where: { conferenceRecordId: rec.name },
    })
    if (existing) continue

    // space を取得して meetingCode を引く
    let meetingCode: string | null = null
    if (rec.space) {
      try {
        const space = await meet.spaces.get({ name: rec.space })
        meetingCode = space.data.meetingCode ?? null
      } catch {
        // spaces.get は権限不足だと弾かれる場合がある
      }
    }

    // MeetingEvent を特定
    let meetingEvent = meetingCode
      ? await prisma.meetingEvent.findFirst({
          where: { userId, meetCode: meetingCode },
        })
      : null

    if (!meetingEvent && rec.startTime) {
      // フォールバック: ±30分で紐付け
      const start = new Date(rec.startTime)
      meetingEvent = await prisma.meetingEvent.findFirst({
        where: {
          userId,
          startsAt: {
            gte: new Date(start.getTime() - 30 * 60_000),
            lte: new Date(start.getTime() + 30 * 60_000),
          },
        },
      })
    }

    if (!meetingEvent) continue

    // トランスクリプト本文取得
    const trList = await meet.conferenceRecords.transcripts.list({ parent: rec.name })
    const transcript = (trList.data.transcripts ?? [])[0]
    if (!transcript?.name) continue

    let fullText = ''
    let googleDocId: string | null = null
    let googleDocUrl: string | null = null

    // Drive 上の議事録 Doc のリンクが docsDestination にある
    if (transcript.docsDestination?.document) {
      googleDocId = normalizeGoogleDocId(transcript.docsDestination.document)
      googleDocUrl = transcript.docsDestination.exportUri ?? null
      // Doc 本文を export で取得
      try {
        const exp = await drive.files.export({
          fileId: googleDocId,
          mimeType: 'text/plain',
        })
        if (typeof exp.data === 'string') fullText = exp.data
      } catch {
        // 権限なしならスキップ
      }
    }

    // entries 経由で発言一覧を結合（Doc が取れない場合のフォールバック）
    if (!fullText) {
      const entries = await meet.conferenceRecords.transcripts.entries.list({
        parent: transcript.name,
      })
      fullText = (entries.data.transcriptEntries ?? [])
        .map((e) => `${e.participant ?? '?'}: ${e.text ?? ''}`)
        .join('\n')
    }

    if (!fullText) continue

    await prisma.transcript.create({
      data: {
        orgId: user.orgId,
        dealId: meetingEvent.dealId,
        companyId: meetingEvent.companyId,
        contactId: meetingEvent.primaryContactId,
        type: 'MEETING',
        fullText,
        meetingEventId: meetingEvent.id,
        conferenceRecordId: rec.name,
        googleDocId,
        googleDocUrl,
        source: 'GOOGLE_MEET',
        durationSec:
          rec.startTime && rec.endTime
            ? Math.round(
                (new Date(rec.endTime).getTime() - new Date(rec.startTime).getTime()) / 1000,
              )
            : null,
      },
    })
    transcriptsImported++

    // MeetingEvent ステータス遷移 + 商談回数算出
    const advanced = await advanceMeetingAndDeal(meetingEvent.id, user.id)
    if (advanced) dealsAdvanced++
  }

  await prisma.userGoogleAccount.update({
    where: { userId },
    data: { lastMeetSyncAt: new Date() },
  })

  return {
    conferenceRecords: items.length,
    transcriptsImported,
    dealsAdvanced,
  }
}

/**
 * MeetingEvent を COMPLETED にし、occurrenceIndex（n回目商談）を確定。
 * Deal 側のステージ遷移は deal-rules に委譲。
 */
async function advanceMeetingAndDeal(meetingEventId: string, userId: string): Promise<boolean> {
  const ev = await prisma.meetingEvent.findUnique({
    where: { id: meetingEventId },
    include: { deal: true },
  })
  if (!ev) return false

  // 取引内で COMPLETED の同 deal の n 回目を計算
  let occurrenceIndex: number | null = null
  if (ev.dealId) {
    const completed = await prisma.meetingEvent.count({
      where: {
        dealId: ev.dealId,
        status: MeetingStatus.COMPLETED,
        startsAt: { lte: ev.startsAt },
      },
    })
    occurrenceIndex = completed + 1
  }

  await prisma.meetingEvent.update({
    where: { id: meetingEventId },
    data: {
      status: MeetingStatus.COMPLETED,
      occurrenceIndex,
      meetingType: occurrenceIndex === 1 ? 'FIRST' : occurrenceIndex && occurrenceIndex > 1 ? 'FOLLOW_UP' : null,
    },
  })

  // Activity に記録（タイムライン用）
  await prisma.activity.create({
    data: {
      orgId: ev.orgId,
      dealId: ev.dealId,
      contactId: ev.primaryContactId,
      companyId: ev.companyId,
      userId,
      type: 'MEETING',
      title: `${occurrenceIndex ? `${occurrenceIndex}回目商談: ` : ''}${ev.title}`,
      content: 'Meet 議事録を取り込みました',
      occurredAt: ev.startsAt,
      metadata: { meetingEventId, occurrenceIndex },
    },
  })

  // Deal ステージ遷移
  if (ev.dealId) {
    await advanceDealOnMeetingCompleted(ev.dealId, userId, occurrenceIndex ?? 1)
    return true
  }
  return false
}

function normalizeGoogleDocId(documentRef: string): string {
  const parts = documentRef.split('/')
  return parts[parts.length - 1] || documentRef
}
