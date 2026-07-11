import fs from 'node:fs'
import path from 'node:path'
import { getConversationRelayVoiceProfile } from '../lib/ai-calls/voice-profiles.js'

loadEnvFile(path.resolve(process.cwd(), '.env.local'))

const mode = process.argv.includes('--realtime')
  ? 'realtime'
  : process.argv.includes('--amazon-connect')
    ? 'amazon-connect'
    : 'twilio'

if (mode === 'realtime') {
  const realtimeRows = [
    ['OPENAI_API_KEY', Boolean(process.env.OPENAI_API_KEY), 'OpenAI API key'],
    ['OPENAI_REALTIME_MODEL', Boolean(process.env.OPENAI_REALTIME_MODEL), 'optional; defaults to gpt-realtime-2'],
    ['OPENAI_REALTIME_VOICE', Boolean(process.env.OPENAI_REALTIME_VOICE), 'optional; defaults to marin'],
  ]

  console.log('Realtime model test readiness')
  console.log('=============================')
  for (const [key, ok, expected] of realtimeRows) {
    const value = (process.env[key] || '').trim()
    const required = key === 'OPENAI_API_KEY'
    console.log(`${ok ? 'OK ' : required ? 'NG ' : '-- '} ${key}: ${value ? 'set' : 'empty'} (${expected})`)
  }

  if (!process.env.OPENAI_API_KEY) {
    console.log('')
    console.log('Not ready: OPENAI_API_KEY')
    process.exit(1)
  }

  console.log('')
  console.log('Ready for browser Realtime model test.')
  process.exit(0)
}

if (mode === 'amazon-connect') {
  const checks = [
    ['AI_CALL_PROVIDER', (value) => value === 'amazon_connect_openai', 'amazon_connect_openai'],
    ['CONTACT_AI_CALL_ENABLED', (value) => value === 'true', 'true'],
    ['OPENAI_API_KEY', Boolean, 'OpenAI API key'],
    ['AWS_REGION', Boolean, 'AWS region, e.g. ap-northeast-1'],
    ['AWS_ACCESS_KEY_ID', Boolean, 'AWS access key with connect:StartOutboundVoiceContact'],
    ['AWS_SECRET_ACCESS_KEY', Boolean, 'AWS secret access key'],
    ['AMAZON_CONNECT_INSTANCE_ID', Boolean, 'Amazon Connect instance id'],
    ['AMAZON_CONNECT_CONTACT_FLOW_ID', Boolean, 'Contact Flow id for AI call entrypoint'],
    ['AMAZON_CONNECT_SOURCE_PHONE_NUMBER', (value) => /^\+\d{8,15}$/.test(value), 'approved +8150... source number'],
  ]

  console.log('Amazon Connect 050 Call AI readiness')
  console.log('=====================================')
  const rows = checks.map(([key, validate, expected]) => {
    const value = (process.env[key] || '').trim()
    const ok = validate(value)
    console.log(`${ok ? 'OK ' : 'NG '} ${key}: ${value ? 'set' : 'empty'} (${expected})`)
    return { key, ok }
  })
  const optionalRows = [
    ['AWS_SESSION_TOKEN', Boolean(process.env.AWS_SESSION_TOKEN), 'only when using temporary credentials'],
    ['AMAZON_CONNECT_AI_STACK', Boolean(process.env.AMAZON_CONNECT_AI_STACK), 'defaults to openai-realtime-google-chirp3'],
    ['GOOGLE_CLOUD_TTS_VOICE', Boolean(process.env.GOOGLE_CLOUD_TTS_VOICE), 'defaults in contact-flow/Lambda layer'],
    ['ELEVENLABS_JA_MALE_VOICE_ID', Boolean(process.env.ELEVENLABS_JA_MALE_VOICE_ID), 'premium voice fallback'],
  ]
  console.log('')
  console.log('Optional')
  console.log('--------')
  for (const [key, ok, expected] of optionalRows) {
    const value = (process.env[key] || '').trim()
    console.log(`${ok ? 'OK ' : '-- '} ${key}: ${value ? 'set' : 'empty'} (${expected})`)
  }

  const missing = rows.filter((row) => !row.ok)
  if (missing.length > 0) {
    console.log('')
    console.log(`Not ready: ${missing.map((row) => row.key).join(', ')}`)
    process.exit(1)
  }

  console.log('')
  console.log('Ready for Amazon Connect 050 outbound call.')
  process.exit(0)
}

const checks = [
  ['AI_CALL_PROVIDER', (value) => value === 'twilio_openai', 'twilio_openai'],
  ['CONTACT_AI_CALL_ENABLED', (value) => value === 'true', 'true'],
  ['OPENAI_API_KEY', Boolean, 'OpenAI API key'],
  ['TWILIO_ACCOUNT_SID', (value) => /^AC[a-zA-Z0-9]{32}$/.test(value), 'Twilio Account SID starting with AC'],
  ['TWILIO_AUTH_TOKEN', Boolean, 'Twilio Auth Token'],
  ['TWILIO_FROM_NUMBER', (value) => /^\+\d{8,15}$/.test(value), 'E.164 number, e.g. +813... or +8150...'],
  ['AI_CALL_RELAY_WS_URL', (value) => /^wss:\/\/.+\/twilio\/conversation-relay/.test(value), 'public wss relay URL'],
  [
    'AI_CALL_RESULT_WEBHOOK_URL',
    (value) =>
      /^https:\/\/.+\/api\/ai-calls\/webhook/.test(value) ||
      /^http:\/\/(localhost|127\.0\.0\.1):\d+\/api\/ai-calls\/webhook/.test(value),
    'public https CRM webhook URL, or local http://localhost:<port>/api/ai-calls/webhook for dev',
  ],
]

const rows = checks.map(([key, validate, expected]) => {
  const value = (process.env[key] || '').trim()
  return {
    key,
    ok: validate(value),
    expected,
    state: value ? 'set' : 'empty',
  }
})

const optionalRows = [
  ['TWILIO_TEST_TO_NUMBER', /^\+\d{8,15}$/.test(process.env.TWILIO_TEST_TO_NUMBER || ''), 'optional test destination'],
  ['AI_CALL_WEBHOOK_SECRET', Boolean(process.env.AI_CALL_WEBHOOK_SECRET), 'recommended for CRM result webhook'],
  ['AI_CALL_VOICE_PROFILE', Boolean(process.env.AI_CALL_VOICE_PROFILE), 'defaults to jp-google-neural2-b'],
  ['TWILIO_CONVERSATION_VOICE', Boolean(process.env.TWILIO_CONVERSATION_VOICE), 'overrides selected voice profile'],
]

console.log('Call AI readiness')
console.log('=================')
for (const row of rows) {
  console.log(`${row.ok ? 'OK ' : 'NG '} ${row.key}: ${row.state} (${row.expected})`)
}
console.log('')
console.log('Optional')
console.log('--------')
for (const [key, ok, expected] of optionalRows) {
  const value = (process.env[key] || '').trim()
  console.log(`${ok ? 'OK ' : '-- '} ${key}: ${value ? 'set' : 'empty'} (${expected})`)
}

console.log('')
const voiceProfile = getConversationRelayVoiceProfile(process.env)
console.log('Voice profile')
console.log('-------------')
console.log(`id: ${voiceProfile.id}`)
console.log(`ttsProvider: ${voiceProfile.ttsProvider}`)
console.log(`transcriptionProvider: ${voiceProfile.transcriptionProvider}`)
console.log(`voice: ${voiceProfile.voice}`)
console.log(`speechTimeoutMs: ${voiceProfile.speechTimeoutMs}`)

const missing = rows.filter((row) => !row.ok)
if (missing.length > 0) {
  console.log('')
  console.log(`Not ready: ${missing.map((row) => row.key).join(', ')}`)
  process.exit(1)
}

console.log('')
console.log('Ready for Twilio/OpenAI test call.')

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
