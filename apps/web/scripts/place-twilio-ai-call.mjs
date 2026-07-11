import fs from 'node:fs'
import path from 'node:path'
import { getConversationRelayVoiceProfile } from '../lib/ai-calls/voice-profiles.js'

loadEnvFile(path.resolve(process.cwd(), '.env.local'))

const to = process.argv[2] || process.env.TWILIO_TEST_TO_NUMBER
const accountSid = process.env.TWILIO_ACCOUNT_SID
const authToken = process.env.TWILIO_AUTH_TOKEN
const from = process.env.TWILIO_FROM_NUMBER
const relayUrl = process.env.AI_CALL_RELAY_WS_URL

const missing = [
  !accountSid ? 'TWILIO_ACCOUNT_SID' : null,
  !authToken ? 'TWILIO_AUTH_TOKEN' : null,
  !from ? 'TWILIO_FROM_NUMBER' : null,
  !relayUrl ? 'AI_CALL_RELAY_WS_URL' : null,
  !to ? 'phone argument or TWILIO_TEST_TO_NUMBER' : null,
].filter(Boolean)

if (missing.length > 0) {
  console.error(`Missing required settings: ${missing.join(', ')}`)
  process.exit(1)
}

const callId = `manual_${Date.now()}`
const twiml = buildTwiml({
  callId,
  relayUrl,
  welcome: process.env.TWILIO_CONVERSATION_WELCOME,
})

const params = new URLSearchParams({
  To: normalizePhoneNumber(to),
  From: normalizePhoneNumber(from),
  Twiml: twiml,
  Method: 'POST',
  Record: process.env.TWILIO_RECORD_CALLS === 'true' ? 'true' : 'false',
})

const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Calls.json`, {
  method: 'POST',
  headers: {
    authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString('base64')}`,
    'content-type': 'application/x-www-form-urlencoded',
  },
  body: params,
})

const payload = await response.json().catch(async () => ({ error: await response.text().catch(() => '') }))

if (!response.ok) {
  console.error(`Twilio call failed (${response.status})`)
  console.error(JSON.stringify(redactTwilioPayload(payload), null, 2))
  process.exit(1)
}

console.log(JSON.stringify({
  ok: true,
  callId,
  sid: payload.sid,
  status: payload.status,
  to: maskPhone(normalizePhoneNumber(to)),
  from: maskPhone(normalizePhoneNumber(from)),
}, null, 2))

function buildTwiml(input) {
  const url = appendWsParams(input.relayUrl, { callId: input.callId })
  const voiceProfile = getConversationRelayVoiceProfile(process.env)
  const language = voiceProfile.language
  const ttsProvider = voiceProfile.ttsProvider
  const transcriptionProvider = voiceProfile.transcriptionProvider
  const voice = voiceProfile.voice
  const speechTimeout = voiceProfile.speechTimeoutMs
  const interruptSensitivity = voiceProfile.interruptSensitivity
  const reportInputDuringAgentSpeech = voiceProfile.reportInputDuringAgentSpeech

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<Response>',
    '<Connect>',
    `<ConversationRelay url="${escapeXml(url)}" welcomeGreeting="${escapeXml(input.welcome || voiceProfile.welcome)}" welcomeGreetingInterruptible="speech" language="${escapeXml(language)}" ttsProvider="${escapeXml(ttsProvider)}" transcriptionProvider="${escapeXml(transcriptionProvider)}" voice="${escapeXml(voice)}" interruptible="speech" interruptSensitivity="${escapeXml(interruptSensitivity)}" reportInputDuringAgentSpeech="${escapeXml(reportInputDuringAgentSpeech)}" speechTimeout="${escapeXml(speechTimeout)}">`,
    `<Parameter name="callId" value="${escapeXml(input.callId)}" />`,
    '</ConversationRelay>',
    '</Connect>',
    '</Response>',
  ].join('')
}

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return
  const content = fs.readFileSync(filePath, 'utf8')
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const match = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/)
    if (!match) continue
    const [, key, rawValue] = match
    if (process.env[key] !== undefined) continue
    process.env[key] = unquote(rawValue.trim())
  }
}

function unquote(value) {
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1)
  }
  return value
}

function appendWsParams(url, params) {
  const parsed = new URL(url)
  for (const [key, value] of Object.entries(params)) parsed.searchParams.set(key, value)
  return parsed.toString()
}

function normalizePhoneNumber(value) {
  const trimmed = String(value || '').trim()
  if (!trimmed) return ''
  if (trimmed.startsWith('+')) return `+${trimmed.slice(1).replace(/[^\d]/g, '')}`
  const digits = trimmed.replace(/[^\d]/g, '')
  if (digits.startsWith('0')) return `+81${digits.slice(1)}`
  return digits
}

function escapeXml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function maskPhone(value) {
  const text = String(value || '')
  if (text.length <= 6) return '***'
  return `${text.slice(0, 3)}***${text.slice(-3)}`
}

function redactTwilioPayload(payload) {
  if (!payload || typeof payload !== 'object') return payload
  return Object.fromEntries(
    Object.entries(payload).map(([key, value]) => {
      if (['to', 'from', 'phone_number'].includes(key)) return [key, maskPhone(value)]
      return [key, value]
    }),
  )
}
