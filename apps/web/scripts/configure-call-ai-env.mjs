import fs from 'node:fs'
import path from 'node:path'
import readline from 'node:readline/promises'
import { stdin as input, stdout as output } from 'node:process'

const envPath = path.resolve(process.cwd(), '.env.local')
const rl = readline.createInterface({ input, output })

const fields = [
  ['OPENAI_API_KEY', 'OpenAI API key'],
  ['ELEVENLABS_JA_MALE_VOICE_ID', 'ElevenLabs Japanese male voice ID, optional'],
  ['TWILIO_ACCOUNT_SID', 'Twilio Account SID'],
  ['TWILIO_AUTH_TOKEN', 'Twilio Auth Token'],
  ['TWILIO_FROM_NUMBER', 'Twilio from number in E.164, e.g. +813...'],
  ['TWILIO_TEST_TO_NUMBER', 'Test destination number in E.164, e.g. +8190...'],
  ['AI_CALL_RELAY_WS_URL', 'Public relay WebSocket URL, wss://.../twilio/conversation-relay'],
  ['AI_CALL_RESULT_WEBHOOK_URL', 'Public CRM result webhook URL, https://.../api/ai-calls/webhook'],
  ['AI_CALL_WEBHOOK_SECRET', 'Shared webhook secret'],
]

const current = parseEnv(fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8') : '')
const next = { ...current }

next.AI_CALL_PROVIDER = 'twilio_openai'
next.CONTACT_AI_CALL_ENABLED = 'true'
next.OPENAI_CALL_MODEL ||= 'gpt-4.1-mini'
next.OPENAI_REALTIME_MODEL ||= 'gpt-realtime-2'
next.OPENAI_REALTIME_VOICE ||= 'marin'
next.OPENAI_REALTIME_TRANSCRIPTION_MODEL ||= 'gpt-4o-mini-transcribe'
next.AI_CALL_VOICE_PROFILE ||= 'jp-google-neural2-b'
next.TWILIO_CONVERSATION_LANGUAGE ||= 'ja-JP'
next.TWILIO_CONVERSATION_TTS_PROVIDER ||= 'Google'
next.TWILIO_CONVERSATION_TRANSCRIPTION_PROVIDER ||= 'Google'
next.TWILIO_CONVERSATION_VOICE ||= 'ja-JP-Neural2-B'
next.TWILIO_CONVERSATION_SPEECH_TIMEOUT_MS ||= '900'
next.TWILIO_RECORD_CALLS ||= 'false'

for (const [key, label] of fields) {
  const existing = current[key]
  const prompt = existing ? `${label} [keep existing]: ` : `${label}: `
  const value = (await rl.question(prompt)).trim()
  if (value) next[key] = value
}

rl.close()

const original = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8') : ''
fs.writeFileSync(envPath, updateEnv(original, next))

console.log('Call AI environment updated.')
console.log('Run: corepack pnpm --filter @bgm/web call:doctor')

function parseEnv(content) {
  const values = {}
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const match = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/)
    if (!match) continue
    values[match[1]] = unquote(match[2].trim())
  }
  return values
}

function updateEnv(content, values) {
  const lines = content.split(/\r?\n/)
  const seen = new Set()
  const updated = lines.map((line) => {
    const match = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=/)
    if (!match) return line
    const key = match[1]
    if (!(key in values)) return line
    seen.add(key)
    return `${key}=${JSON.stringify(values[key])}`
  })

  const missing = Object.keys(values).filter((key) => !seen.has(key))
  if (missing.length > 0) {
    if (updated.length > 0 && updated.at(-1) !== '') updated.push('')
    updated.push('# Twilio/OpenAI Call AI')
    for (const key of missing) updated.push(`${key}=${JSON.stringify(values[key])}`)
  }
  return `${updated.join('\n').replace(/\n+$/, '')}\n`
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
