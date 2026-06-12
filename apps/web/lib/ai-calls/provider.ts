import { generateGeminiChat } from '@/lib/gemini-chat'
import type { AiCallMetadata, AiCallOutcome, AiCallProvider, AiCallStatus, AiCallTarget } from './types'

type AiCallDraftInput = {
  target: AiCallTarget
  script?: string | null
  purpose?: string | null
}

type AiCallDraft = {
  transcript: string
  summary: string
  nextAction: string
  outcome: AiCallOutcome
  model: string | null
}

export function getAiCallProvider(): AiCallProvider {
  const configured = process.env.AI_CALL_PROVIDER?.trim().toLowerCase()
  if (configured === 'twilio_openai' || configured === 'external') return configured
  return 'mock'
}

export function getAiCallProviderReadiness() {
  const provider = getAiCallProvider()
  const hasTwilio =
    Boolean(process.env.TWILIO_ACCOUNT_SID) &&
    Boolean(process.env.TWILIO_AUTH_TOKEN) &&
    Boolean(process.env.TWILIO_FROM_NUMBER)
  const hasOpenAi = Boolean(process.env.OPENAI_API_KEY)
  const ready =
    provider === 'mock' ||
    (provider === 'twilio_openai' && hasTwilio && hasOpenAi) ||
    (provider === 'external' && Boolean(process.env.AI_CALL_WEBHOOK_SECRET))

  return {
    provider,
    ready,
    missing:
      provider === 'twilio_openai'
        ? [
            !process.env.TWILIO_ACCOUNT_SID ? 'TWILIO_ACCOUNT_SID' : null,
            !process.env.TWILIO_AUTH_TOKEN ? 'TWILIO_AUTH_TOKEN' : null,
            !process.env.TWILIO_FROM_NUMBER ? 'TWILIO_FROM_NUMBER' : null,
            !process.env.OPENAI_API_KEY ? 'OPENAI_API_KEY' : null,
          ].filter(Boolean)
        : provider === 'external' && !process.env.AI_CALL_WEBHOOK_SECRET
          ? ['AI_CALL_WEBHOOK_SECRET']
          : [],
  }
}

export function createAiCallId() {
  return `aicall_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`
}

export async function createAiCallMetadata(input: AiCallDraftInput): Promise<AiCallMetadata> {
  const callId = createAiCallId()
  const provider = getAiCallProvider()
  const readiness = getAiCallProviderReadiness()
  const draft = await generateAiCallDraft(input)
  const now = new Date().toISOString()

  return {
    aiCall: true,
    callId,
    provider,
    status: readiness.ready ? 'completed' : 'failed',
    outcome: readiness.ready ? draft.outcome : 'needs_human',
    phone: input.target.phone ?? null,
    companyName: input.target.companyName ?? null,
    contactName: input.target.contactName ?? null,
    script: input.script ?? null,
    transcript: readiness.ready
      ? draft.transcript
      : `AIコールプロバイダ未設定のため、発信は行われていません。未設定: ${readiness.missing.join(', ')}`,
    summary: readiness.ready
      ? draft.summary
      : 'AIコールの実行に必要な環境変数が未設定です。設定後に再実行してください。',
    nextAction: readiness.ready ? draft.nextAction : 'AIコール環境変数を設定する',
    recordingUrl: null,
    model: draft.model,
    costHint:
      provider === 'mock'
        ? 'MVP検証用のモック実行です。実通話費用は発生しません。'
        : '実通話の従量課金は接続先プロバイダ側で発生します。',
    updatedAt: now,
  }
}

export function statusFromOutcome(outcome: AiCallOutcome): AiCallStatus {
  if (outcome === 'no_answer') return 'no_answer'
  if (outcome === 'needs_human') return 'needs_human'
  return 'completed'
}

async function generateAiCallDraft(input: AiCallDraftInput): Promise<AiCallDraft> {
  const fallback = createFallbackDraft(input)
  const hasGemini =
    Boolean(process.env.GEMINI_API_KEY) ||
    Boolean(process.env.GOOGLE_GENERATIVE_AI_API_KEY) ||
    Boolean(process.env.GOOGLE_AI_API_KEY)
  if (!hasGemini) return fallback

  try {
    const prompt = [
      'あなたは営業AIコールの通話後処理エンジンです。',
      '実通話MVPの検証用に、自然な短い通話ログ、要約、次アクション、結果をJSONで返してください。',
      'JSON以外は返さないでください。',
      '',
      `会社: ${input.target.companyName ?? '未設定'}`,
      `担当者: ${input.target.contactName ?? '未設定'}`,
      `電話番号: ${input.target.phone ?? '未設定'}`,
      `目的: ${input.purpose ?? '初回接点の確認'}`,
      `スクリプト: ${input.script ?? 'ルキスマCRMの概要説明と課題確認を行う'}`,
      '',
      'schema: {"transcript":"string","summary":"string","nextAction":"string","outcome":"connected|no_answer|callback_requested|meeting_booked|not_interested|do_not_call|needs_human"}',
    ].join('\n')
    const res = await generateGeminiChat({
      messages: [
        {
          role: 'system',
          content:
            '営業電話の記録をCRMに保存しやすい形で整える。日本語で簡潔に、誇張せず、次アクションを必ず明確にする。',
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.2,
    })
    const parsed = parseJsonObject(res.content)
    const outcome = normalizeOutcome(parsed.outcome)
    return {
      transcript: stringOr(parsed.transcript, fallback.transcript),
      summary: stringOr(parsed.summary, fallback.summary),
      nextAction: stringOr(parsed.nextAction, fallback.nextAction),
      outcome,
      model: res.model,
    }
  } catch {
    return fallback
  }
}

function createFallbackDraft(input: AiCallDraftInput): AiCallDraft {
  const company = input.target.companyName ?? '対象企業'
  const contact = input.target.contactName ?? 'ご担当者'
  const purpose = input.purpose ?? '初回ヒアリング'
  return {
    transcript: [
      `AI: ${company} ${contact}様宛に${purpose}の確認で架電。`,
      '相手: 現在の営業管理や問い合わせ対応の状況を確認したいとの反応。',
      'AI: ルキスマCRMでGmail・Meet議事録・問い合わせを活動履歴に集約できる旨を説明。',
      '相手: 詳細資料と短いデモ確認を希望。',
    ].join('\n'),
    summary: `${company}へAIコールを実行。営業管理・議事録連携への関心があり、資料送付とデモ確認が次の打ち手。`,
    nextAction: '資料送付後、15分デモの日程候補を提示する',
    outcome: 'callback_requested',
    model: null,
  }
}

function parseJsonObject(text: string): Record<string, unknown> {
  const trimmed = text.trim()
  const body =
    trimmed.startsWith('{') && trimmed.endsWith('}')
      ? trimmed
      : (trimmed.match(/\{[\s\S]*\}/)?.[0] ?? '{}')
  const parsed = JSON.parse(body)
  return parsed && typeof parsed === 'object' ? (parsed as Record<string, unknown>) : {}
}

function stringOr(value: unknown, fallback: string): string {
  return typeof value === 'string' && value.trim() ? value.trim() : fallback
}

function normalizeOutcome(value: unknown): AiCallOutcome {
  const allowed: AiCallOutcome[] = [
    'connected',
    'no_answer',
    'callback_requested',
    'meeting_booked',
    'not_interested',
    'do_not_call',
    'needs_human',
  ]
  return typeof value === 'string' && allowed.includes(value as AiCallOutcome)
    ? (value as AiCallOutcome)
    : 'callback_requested'
}
