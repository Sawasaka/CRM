export type DummyFaqStatus = 'CANDIDATE' | 'PUBLISHED' | 'ARCHIVED' | 'REJECTED'
export type DummyFaqSourceType = 'MEETING' | 'MANUAL' | 'SLACK' | 'GOOGLE_CHAT' | 'DRIVE'

export interface DummyAttribution {
  questioner?: string
  responder?: string
  owner?: string
  meetingTitle?: string
  meetingDate?: string
}

export interface DummyFaq {
  id: string
  title: string
  body: string
  department: string | null
  category: string | null
  tags: string[]
  status: DummyFaqStatus
  sourceType: DummyFaqSourceType
  sourceUrl: string | null
  attribution?: DummyAttribution
  hits: number
  createdAt: Date
  updatedAt: Date
}

export const EMPTY_FAQS: DummyFaq[] = []

export const DUMMY_FAQ_COUNTS: Record<DummyFaqStatus, number> = {
  CANDIDATE: 0,
  PUBLISHED: 0,
  ARCHIVED: 0,
  REJECTED: 0,
}
