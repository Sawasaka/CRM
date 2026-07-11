export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue }

export type AiCallProvider = 'mock' | 'twilio_openai' | 'amazon_connect_openai' | 'external'

export type AiCallStatus =
  | 'queued'
  | 'calling'
  | 'completed'
  | 'failed'
  | 'no_answer'
  | 'needs_human'

export type AiCallOutcome =
  | 'connected'
  | 'no_answer'
  | 'callback_requested'
  | 'meeting_booked'
  | 'not_interested'
  | 'do_not_call'
  | 'needs_human'

export type AiCallMetadata = {
  aiCall: true
  callId: string
  provider: AiCallProvider
  status: AiCallStatus
  outcome: AiCallOutcome
  phone?: string | null
  companyName?: string | null
  contactName?: string | null
  script?: string | null
  transcript?: string | null
  summary?: string | null
  nextAction?: string | null
  recordingUrl?: string | null
  model?: string | null
  costHint?: string | null
  externalCallId?: string | null
  rawProviderPayload?: JsonValue
  updatedAt: string
}

export type AiCallTarget = {
  contactId?: string | null
  dealId?: string | null
  companyId?: string | null
  contactName?: string | null
  companyName?: string | null
  phone?: string | null
}
