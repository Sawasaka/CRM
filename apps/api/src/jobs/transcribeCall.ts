import { Worker } from 'bullmq'
import { redis, JOB_NAMES } from '@bgm/queue'
import { prisma } from '@bgm/db'
import { transcribeFromUrl } from '@bgm/ai'
import { getRecordingUrl } from '@bgm/integrations-twilio'

export const transcribeCallWorker = new Worker(
  'critical',
  async (job) => {
    if (job.name !== JOB_NAMES.TRANSCRIBE_CALL) return

    const { callSid, contactId, orgId } = job.data as {
      callSid: string
      contactId: string
      orgId: string
    }

    // 1. 録音URLを取得
    const recordingUrl = await getRecordingUrl(callSid)
    if (!recordingUrl) {
      console.log(`No recording found for callSid: ${callSid}`)
      return
    }

    // 2. Whisper で文字起こし
    const fullText = await transcribeFromUrl(recordingUrl)

    // 3. Transcript レコード保存
    const transcript = await prisma.transcript.create({
      data: {
        orgId,
        contactId,
        type: 'CALL',
        fullText,
        audioUrl: recordingUrl,
      },
    })

    console.log(`Call transcript saved: ${transcript.id}`)
  },
  { connection: redis, concurrency: 10 }
)
