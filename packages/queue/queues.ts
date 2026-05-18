import { Queue, type QueueOptions } from 'bullmq'

const REDIS_URL = process.env.REDIS_URL ?? 'redis://localhost:6379'
const QUEUE_ENABLED = Boolean(process.env.REDIS_URL) || process.env.NODE_ENV !== 'production'

export const redis = { url: REDIS_URL }

type QueueLike = Pick<Queue, 'add'>

function createQueue(
  name: string,
  defaultJobOptions: QueueOptions['defaultJobOptions']
): QueueLike {
  if (!QUEUE_ENABLED) {
    return {
      async add(jobName: string) {
        console.warn(`[queue:${name}] skipped "${jobName}" because REDIS_URL is not configured`)
        return null as never
      },
    }
  }

  return new Queue(name, {
    connection: redis,
    defaultJobOptions,
  })
}

// 4本のキュー
export const criticalQueue = createQueue('critical', {
  attempts: 3,
  backoff: { type: 'exponential', delay: 1000 },
})

export const standardQueue = createQueue('standard', {
  attempts: 3,
  backoff: { type: 'exponential', delay: 2000 },
})

export const backgroundQueue = createQueue('background', {
  attempts: 2,
  backoff: { type: 'exponential', delay: 5000 },
})

export const scheduledQueue = createQueue('scheduled', {
  attempts: 3,
  backoff: { type: 'exponential', delay: 3000 },
})

// ジョブ名定数
export const JOB_NAMES = {
  TRANSCRIBE_CALL: 'transcribe_call',
  TRANSCRIBE_MEETING: 'transcribe_meeting',
  GENERATE_RESEARCH_BRIEF: 'generate_research_brief',
  INDEX_KNOWLEDGE_DOC: 'index_knowledge_doc',
  SEND_SEQUENCE_EMAIL: 'send_sequence_email',
  CHECK_STALLED_DEALS: 'check_stalled_deals',
  RECALCULATE_SCORES: 'recalculate_scores',
  SEND_TASK_REMINDER: 'send_task_reminder',
  PROCESS_APPOINTMENT: 'process_appointment',
} as const
