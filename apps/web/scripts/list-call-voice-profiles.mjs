import fs from 'node:fs'
import path from 'node:path'
import {
  CONVERSATION_RELAY_VOICE_PROFILES,
  DEFAULT_CONVERSATION_RELAY_VOICE_PROFILE,
  getConversationRelayVoiceProfile,
} from '../lib/ai-calls/voice-profiles.js'

loadEnvFile(path.resolve(process.cwd(), '.env.local'))

const active = getConversationRelayVoiceProfile(process.env)

console.log('Call AI voice profiles')
console.log('======================')
console.log(`Default: ${DEFAULT_CONVERSATION_RELAY_VOICE_PROFILE}`)
console.log(`Active:  ${active.id}`)
console.log(`Resolved ttsProvider: ${active.ttsProvider}`)
console.log(`Resolved voice: ${active.voice}`)
console.log('')

for (const [id, profile] of Object.entries(CONVERSATION_RELAY_VOICE_PROFILES)) {
  const marker = id === active.id ? '*' : ' '
  console.log(`${marker} ${id}`)
  console.log(`  label: ${profile.label}`)
  console.log(`  ttsProvider: ${profile.ttsProvider}`)
  console.log(`  transcriptionProvider: ${profile.transcriptionProvider}`)
  console.log(`  voice: ${profile.voice}`)
  console.log(`  speechTimeoutMs: ${profile.speechTimeoutMs}`)
  console.log(`  notes: ${profile.notes}`)
  console.log('')
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
