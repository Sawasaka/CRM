import { createHash, createHmac } from 'node:crypto'
import { generateGeminiChat } from '@/lib/gemini-chat'
import { getConversationRelayVoiceProfile } from './voice-profiles'
import type {
  AiCallMetadata,
  AiCallOutcome,
  AiCallProvider,
  AiCallStatus,
  AiCallTarget,
  JsonValue,
} from './types'

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
  if (configured === 'twilio_openai' || configured === 'amazon_connect_openai' || configured === 'external') {
    return configured
  }
  return 'mock'
}

export function getAiCallProviderReadiness(providerOverride?: AiCallProvider) {
  const provider = providerOverride ?? getAiCallProvider()
  const hasTwilio =
    Boolean(process.env.TWILIO_ACCOUNT_SID) &&
    Boolean(process.env.TWILIO_AUTH_TOKEN) &&
    Boolean(process.env.TWILIO_FROM_NUMBER) &&
    Boolean(process.env.AI_CALL_RELAY_WS_URL)
  const hasOpenAi = Boolean(process.env.OPENAI_API_KEY)
  const hasAmazonConnect =
    Boolean(process.env.AWS_ACCESS_KEY_ID) &&
    Boolean(process.env.AWS_SECRET_ACCESS_KEY) &&
    Boolean(process.env.AWS_REGION) &&
    Boolean(process.env.AMAZON_CONNECT_INSTANCE_ID) &&
    Boolean(process.env.AMAZON_CONNECT_CONTACT_FLOW_ID) &&
    Boolean(process.env.AMAZON_CONNECT_SOURCE_PHONE_NUMBER)
  const ready =
    provider === 'mock' ||
    (provider === 'twilio_openai' && hasTwilio && hasOpenAi) ||
    (provider === 'amazon_connect_openai' && hasAmazonConnect && hasOpenAi) ||
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
            !process.env.AI_CALL_RELAY_WS_URL ? 'AI_CALL_RELAY_WS_URL' : null,
            !process.env.OPENAI_API_KEY ? 'OPENAI_API_KEY' : null,
          ].filter(Boolean)
        : provider === 'amazon_connect_openai'
          ? [
              !process.env.AWS_ACCESS_KEY_ID ? 'AWS_ACCESS_KEY_ID' : null,
              !process.env.AWS_SECRET_ACCESS_KEY ? 'AWS_SECRET_ACCESS_KEY' : null,
              !process.env.AWS_REGION ? 'AWS_REGION' : null,
              !process.env.AMAZON_CONNECT_INSTANCE_ID ? 'AMAZON_CONNECT_INSTANCE_ID' : null,
              !process.env.AMAZON_CONNECT_CONTACT_FLOW_ID ? 'AMAZON_CONNECT_CONTACT_FLOW_ID' : null,
              !process.env.AMAZON_CONNECT_SOURCE_PHONE_NUMBER ? 'AMAZON_CONNECT_SOURCE_PHONE_NUMBER' : null,
              !process.env.OPENAI_API_KEY ? 'OPENAI_API_KEY' : null,
            ].filter(Boolean)
        : provider === 'external' && !process.env.AI_CALL_WEBHOOK_SECRET
          ? ['AI_CALL_WEBHOOK_SECRET']
          : [],
  }
}

export function getAiCallProviderReadinessMatrix() {
  const providers: AiCallProvider[] = ['mock', 'amazon_connect_openai', 'twilio_openai', 'external']
  return Object.fromEntries(providers.map((provider) => [provider, getAiCallProviderReadiness(provider)])) as Record<
    AiCallProvider,
    ReturnType<typeof getAiCallProviderReadiness>
  >
}

export function createAiCallId() {
  return `aicall_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`
}

export async function createAiCallMetadata(input: AiCallDraftInput): Promise<AiCallMetadata> {
  const callId = createAiCallId()
  const provider = getAiCallProvider()
  const readiness = getAiCallProviderReadiness()

  if (provider === 'twilio_openai') {
    return createTwilioOpenAiCallMetadata({ ...input, callId, readiness })
  }
  if (provider === 'amazon_connect_openai') {
    return createAmazonConnectOpenAiCallMetadata({ ...input, callId, readiness })
  }

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

async function createAmazonConnectOpenAiCallMetadata(input: AiCallDraftInput & {
  callId: string
  readiness: ReturnType<typeof getAiCallProviderReadiness>
}): Promise<AiCallMetadata> {
  const now = new Date().toISOString()
  const baseMetadata: AiCallMetadata = {
    aiCall: true,
    callId: input.callId,
    provider: 'amazon_connect_openai',
    status: input.readiness.ready ? 'queued' : 'failed',
    outcome: 'needs_human',
    phone: input.target.phone ?? null,
    companyName: input.target.companyName ?? null,
    contactName: input.target.contactName ?? null,
    script: input.script ?? null,
    transcript: input.readiness.ready
      ? null
      : `Amazon Connect/OpenAI連携の環境変数が未設定のため、発信は行われていません。未設定: ${input.readiness.missing.join(', ')}`,
    summary: input.readiness.ready
      ? 'Amazon Connectから日本050番号でアウトバウンド発信を開始します。Contact FlowでAI会話へ接続します。'
      : 'Amazon Connect/OpenAIコールの実行に必要な環境変数が未設定です。設定後に再実行してください。',
    nextAction: input.readiness.ready ? 'Amazon ConnectのContact Flowと通話イベントを確認する' : 'Amazon Connect/OpenAI環境変数を設定する',
    recordingUrl: null,
    model: process.env.OPENAI_CALL_MODEL ?? 'gpt-4.1-mini',
    costHint: input.readiness.ready
      ? 'Amazon Connect通話料、電話番号利用料、OpenAI API利用料が発生します。'
      : '発信していないため実通話費用は発生していません。',
    updatedAt: now,
  }

  if (!input.readiness.ready) return baseMetadata

  try {
    const connectContact = await startAmazonConnectOutboundVoiceContact(input)
    return {
      ...baseMetadata,
      externalCallId: connectContact.contactId,
      status: 'queued',
      transcript: null,
      summary: 'Amazon Connectへアウトバウンド発信を開始しました。',
      nextAction: 'Contact FlowでOpenAI/Google/ElevenLabs連携へ接続し、通話終了後にCRM活動履歴を更新する',
      rawProviderPayload: toJsonValue(connectContact.raw),
      updatedAt: new Date().toISOString(),
    }
  } catch (error) {
    return {
      ...baseMetadata,
      status: 'failed',
      transcript: error instanceof Error ? error.message : String(error),
      summary: 'Amazon Connectへの発信リクエストに失敗しました。',
      nextAction: 'AWS認証情報、Amazon Connect Instance ID、Contact Flow ID、050発信元番号、電話番号形式を確認する',
      updatedAt: new Date().toISOString(),
    }
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
      `スクリプト: ${input.script ?? 'FDE CRMの概要説明と課題確認を行う'}`,
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
      'AI: FDE CRMでGmail・Meet議事録・問い合わせを活動履歴に集約できる旨を説明。',
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

async function createTwilioOpenAiCallMetadata(input: AiCallDraftInput & {
  callId: string
  readiness: ReturnType<typeof getAiCallProviderReadiness>
}): Promise<AiCallMetadata> {
  const now = new Date().toISOString()
  const baseMetadata: AiCallMetadata = {
    aiCall: true,
    callId: input.callId,
    provider: 'twilio_openai',
    status: input.readiness.ready ? 'queued' : 'failed',
    outcome: 'needs_human',
    phone: input.target.phone ?? null,
    companyName: input.target.companyName ?? null,
    contactName: input.target.contactName ?? null,
    script: input.script ?? null,
    transcript: input.readiness.ready
      ? null
      : `Twilio/OpenAI連携の環境変数が未設定のため、発信は行われていません。未設定: ${input.readiness.missing.join(', ')}`,
    summary: input.readiness.ready
      ? 'Twilioからアウトバウンド発信をキューしました。Conversation RelayでAI会話へ接続します。'
      : 'Twilio/OpenAIコールの実行に必要な環境変数が未設定です。設定後に再実行してください。',
    nextAction: input.readiness.ready ? 'Twilioの通話ステータスWebhookを待つ' : 'Twilio/OpenAI環境変数を設定する',
    recordingUrl: null,
    model: process.env.OPENAI_CALL_MODEL ?? 'gpt-4.1-mini',
    costHint: input.readiness.ready
      ? 'Twilio通話料、Conversation Relay利用料、OpenAI API利用料が発生します。'
      : '発信していないため実通話費用は発生していません。',
    updatedAt: now,
  }

  if (!input.readiness.ready) return baseMetadata

  try {
    const twilioCall = await createTwilioOpenAiPhoneCall(input)
    return {
      ...baseMetadata,
      externalCallId: twilioCall.externalCallId,
      status: 'queued',
      transcript: null,
      summary: 'Twilioへアウトバウンド発信を開始しました。',
      nextAction: 'Conversation Relayの通話終了後、Twilio status callbackでCRM活動履歴を更新する',
      rawProviderPayload: toJsonValue(twilioCall.raw),
      updatedAt: new Date().toISOString(),
    }
  } catch (error) {
    return {
      ...baseMetadata,
      status: 'failed',
      transcript: error instanceof Error ? error.message : String(error),
      summary: 'Twilioへの発信リクエストに失敗しました。',
      nextAction: 'Twilioの認証情報、発信元番号、日本宛のDialing Permission、公開Webhook/Relay URLを確認する',
      updatedAt: new Date().toISOString(),
    }
  }
}

async function createTwilioOpenAiPhoneCall(input: AiCallDraftInput & { callId: string }) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID
  const authToken = process.env.TWILIO_AUTH_TOKEN
  const fromNumber = process.env.TWILIO_FROM_NUMBER
  const relayUrl = process.env.AI_CALL_RELAY_WS_URL
  if (!accountSid || !authToken || !fromNumber || !relayUrl) {
    throw new Error('TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM_NUMBER and AI_CALL_RELAY_WS_URL are required')
  }

  const toNumber = normalizePhoneNumber(input.target.phone ?? '')
  if (!toNumber) throw new Error('電話番号が空です')

  const twiml = buildConversationRelayTwiml(input)
  const params = new URLSearchParams({
    To: toNumber,
    From: normalizePhoneNumber(fromNumber),
    Twiml: twiml,
    Method: 'POST',
    Record: process.env.TWILIO_RECORD_CALLS === 'true' ? 'true' : 'false',
  })

  const statusCallbackUrl = buildPublicUrl('/api/ai-calls/twilio/status')
  if (statusCallbackUrl.startsWith('http')) {
    params.set('StatusCallback', statusCallbackUrl)
    params.set('StatusCallbackMethod', 'POST')
    params.append('StatusCallbackEvent', 'initiated')
    params.append('StatusCallbackEvent', 'ringing')
    params.append('StatusCallbackEvent', 'answered')
    params.append('StatusCallbackEvent', 'completed')
  }

  const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Calls.json`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params,
  })
  const raw = (await res.json().catch(async () => ({ error: await res.text().catch(() => '') }))) as
    | Record<string, unknown>
    | null

  if (!res.ok) {
    throw new Error(`Twilio create call failed (${res.status}): ${JSON.stringify(raw)}`)
  }

  return {
    externalCallId: stringFrom(raw?.sid) ?? null,
    raw,
  }
}

async function startAmazonConnectOutboundVoiceContact(input: AiCallDraftInput & { callId: string }) {
  const region = process.env.AWS_REGION
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY
  const sessionToken = process.env.AWS_SESSION_TOKEN
  const instanceId = process.env.AMAZON_CONNECT_INSTANCE_ID
  const contactFlowId = process.env.AMAZON_CONNECT_CONTACT_FLOW_ID
  const sourcePhoneNumber = process.env.AMAZON_CONNECT_SOURCE_PHONE_NUMBER

  if (!region || !accessKeyId || !secretAccessKey || !instanceId || !contactFlowId || !sourcePhoneNumber) {
    throw new Error(
      'AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AMAZON_CONNECT_INSTANCE_ID, AMAZON_CONNECT_CONTACT_FLOW_ID and AMAZON_CONNECT_SOURCE_PHONE_NUMBER are required',
    )
  }

  const destinationPhoneNumber = normalizePhoneNumber(input.target.phone ?? '')
  if (!destinationPhoneNumber) throw new Error('電話番号が空です')

  const body = {
    InstanceId: instanceId,
    ContactFlowId: contactFlowId,
    DestinationPhoneNumber: destinationPhoneNumber,
    SourcePhoneNumber: normalizePhoneNumber(sourcePhoneNumber),
    Attributes: {
      callId: input.callId,
      contactId: input.target.contactId ?? '',
      dealId: input.target.dealId ?? '',
      companyId: input.target.companyId ?? '',
      contactName: input.target.contactName ?? '',
      companyName: input.target.companyName ?? '',
      purpose: input.purpose ?? 'HP問い合わせ後の即時フォロー',
      script: truncateAttribute(input.script ?? '', 8000),
      aiStack: process.env.AMAZON_CONNECT_AI_STACK || 'openai-realtime-google-chirp3',
    },
  }
  const payload = JSON.stringify(body)
  const host = `connect.${region}.amazonaws.com`
  const path = '/contact/outbound-voice'
  const headers = signAwsRequest({
    accessKeyId,
    secretAccessKey,
    sessionToken,
    region,
    service: 'connect',
    method: 'PUT',
    host,
    path,
    payload,
  })

  const res = await fetch(`https://${host}${path}`, {
    method: 'PUT',
    headers,
    body: payload,
  })
  const raw = (await res.json().catch(async () => ({ error: await res.text().catch(() => '') }))) as
    | Record<string, unknown>
    | null

  if (!res.ok) {
    throw new Error(`Amazon Connect StartOutboundVoiceContact failed (${res.status}): ${JSON.stringify(raw)}`)
  }

  return {
    contactId: stringFrom(raw?.ContactId) ?? stringFrom(raw?.contactId) ?? null,
    raw,
  }
}

function signAwsRequest(input: {
  accessKeyId: string
  secretAccessKey: string
  sessionToken?: string
  region: string
  service: string
  method: string
  host: string
  path: string
  payload: string
}) {
  const now = new Date()
  const amzDate = toAmzDate(now)
  const dateStamp = amzDate.slice(0, 8)
  const payloadHash = sha256Hex(input.payload)
  const baseHeaders: Record<string, string> = {
    'content-type': 'application/json',
    host: input.host,
    'x-amz-content-sha256': payloadHash,
    'x-amz-date': amzDate,
  }
  if (input.sessionToken) baseHeaders['x-amz-security-token'] = input.sessionToken

  const signedHeaders = Object.keys(baseHeaders).sort().join(';')
  const canonicalHeaders = Object.keys(baseHeaders)
    .sort()
    .map((key) => `${key}:${baseHeaders[key]!.trim()}\n`)
    .join('')
  const canonicalRequest = [
    input.method,
    input.path,
    '',
    canonicalHeaders,
    signedHeaders,
    payloadHash,
  ].join('\n')
  const credentialScope = `${dateStamp}/${input.region}/${input.service}/aws4_request`
  const stringToSign = [
    'AWS4-HMAC-SHA256',
    amzDate,
    credentialScope,
    sha256Hex(canonicalRequest),
  ].join('\n')
  const signingKey = getAwsSigningKey(input.secretAccessKey, dateStamp, input.region, input.service)
  const signature = hmacHex(signingKey, stringToSign)

  return {
    ...baseHeaders,
    authorization:
      `AWS4-HMAC-SHA256 Credential=${input.accessKeyId}/${credentialScope}, ` +
      `SignedHeaders=${signedHeaders}, Signature=${signature}`,
  }
}

function buildConversationRelayTwiml(input: AiCallDraftInput & { callId: string }) {
  const relayUrl = process.env.AI_CALL_RELAY_WS_URL
  if (!relayUrl) throw new Error('AI_CALL_RELAY_WS_URL is required')

  const voiceProfile = getConversationRelayVoiceProfile(process.env)
  const language = voiceProfile.language
  const ttsProvider = voiceProfile.ttsProvider
  const transcriptionProvider = voiceProfile.transcriptionProvider
  const voice = voiceProfile.voice
  const speechTimeout = voiceProfile.speechTimeoutMs
  const interruptSensitivity = voiceProfile.interruptSensitivity
  const reportInputDuringAgentSpeech = voiceProfile.reportInputDuringAgentSpeech
  const welcome = voiceProfile.welcome
  const url = appendWsParams(relayUrl, { callId: input.callId })

  const params = {
    callId: input.callId,
    contactId: input.target.contactId ?? '',
    dealId: input.target.dealId ?? '',
    companyId: input.target.companyId ?? '',
    contactName: input.target.contactName ?? '',
    companyName: input.target.companyName ?? '',
    phone: input.target.phone ?? '',
    purpose: input.purpose ?? '資料請求後の即時フォロー',
    script: input.script ?? '',
  }
  const parameterXml = Object.entries(params)
    .map(([name, value]) => `<Parameter name="${escapeXml(name)}" value="${escapeXml(value)}" />`)
    .join('')

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<Response>',
    '<Connect>',
    `<ConversationRelay url="${escapeXml(url)}" welcomeGreeting="${escapeXml(welcome)}" welcomeGreetingInterruptible="speech" language="${escapeXml(language)}" ttsProvider="${escapeXml(ttsProvider)}" transcriptionProvider="${escapeXml(transcriptionProvider)}" voice="${escapeXml(voice)}" interruptible="speech" interruptSensitivity="${escapeXml(interruptSensitivity)}" reportInputDuringAgentSpeech="${escapeXml(reportInputDuringAgentSpeech)}" speechTimeout="${escapeXml(speechTimeout)}">`,
    parameterXml,
    '</ConversationRelay>',
    '</Connect>',
    '</Response>',
  ].join('')
}

function appendWsParams(url: string, params: Record<string, string>) {
  const parsed = new URL(url)
  for (const [key, value] of Object.entries(params)) {
    parsed.searchParams.set(key, value)
  }
  return parsed.toString()
}

function buildPublicUrl(path: string) {
  const base =
    process.env.NEXT_PUBLIC_APP_URL ??
    process.env.APP_URL ??
    process.env.NEXTAUTH_URL ??
    ''
  return base ? `${base.replace(/\/$/, '')}${path}` : path
}

function escapeXml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function normalizePhoneNumber(value: string) {
  const trimmed = value.trim()
  if (!trimmed) return ''
  if (trimmed.startsWith('+')) return `+${trimmed.slice(1).replace(/[^\d]/g, '')}`
  const digits = trimmed.replace(/[^\d]/g, '')
  if (digits.startsWith('0')) return `+81${digits.slice(1)}`
  return digits
}

function truncateAttribute(value: string, maxLength: number) {
  return value.length > maxLength ? `${value.slice(0, maxLength - 1)}…` : value
}

function toAmzDate(date: Date) {
  return date.toISOString().replace(/[:-]|\.\d{3}/g, '')
}

function sha256Hex(value: string) {
  return createHash('sha256').update(value, 'utf8').digest('hex')
}

function hmac(key: Buffer | string, value: string) {
  return createHmac('sha256', key).update(value, 'utf8').digest()
}

function hmacHex(key: Buffer, value: string) {
  return createHmac('sha256', key).update(value, 'utf8').digest('hex')
}

function getAwsSigningKey(secretAccessKey: string, dateStamp: string, region: string, service: string) {
  const kDate = hmac(`AWS4${secretAccessKey}`, dateStamp)
  const kRegion = hmac(kDate, region)
  const kService = hmac(kRegion, service)
  return hmac(kService, 'aws4_request')
}

function stringFrom(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value.trim() : null
}

function toJsonValue(value: unknown): JsonValue {
  if (
    value === null ||
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean'
  ) {
    return value
  }
  if (Array.isArray(value)) return value.map(toJsonValue)
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, item]) => [key, toJsonValue(item)]),
    )
  }
  return null
}
