import fs from 'node:fs'
import path from 'node:path'

const envPath = path.resolve(process.cwd(), 'apps/web/.env.local')
loadEnvFile(envPath)

const outputPath =
  process.argv[2] ||
  'apps/web/public/media/fde-ai-dx/realtime-sales-assist-demo-audio.wav'
const apiKey = process.env.GEMINI_API_KEY
const model = process.env.CALL_AI_DEMO_TTS_MODEL || 'gemini-2.5-flash-preview-tts'
const voiceName = process.env.CALL_AI_DEMO_TTS_VOICE || 'Charon'

if (!apiKey) {
  throw new Error('GEMINI_API_KEY is required in apps/web/.env.local')
}

const script = [
  '落ち着いた日本語のデモナレーションとして、8秒以内で自然に読み上げてください。',
  '商談中の質問を検知。文字起こしからObsidianを検索し、回答候補と参照元をすぐ表示します。',
].join('\n')

const response = await fetch(
  `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`,
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: script }] }],
      generationConfig: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName },
          },
        },
      },
    }),
  },
)

if (!response.ok) {
  const body = await response.text()
  throw new Error(`Gemini TTS failed: ${response.status} ${body}`)
}

const json = await response.json()
const inlineData = json?.candidates?.[0]?.content?.parts?.find((part) => part.inlineData)?.inlineData
if (!inlineData?.data) {
  throw new Error('Gemini TTS response did not include audio inlineData.')
}

const audio = Buffer.from(inlineData.data, 'base64')
const mimeType = inlineData.mimeType || ''
const output = mimeType.includes('wav') ? audio : wrapPcmAsWav(audio, parseRate(mimeType) || 24000)

fs.mkdirSync(path.dirname(outputPath), { recursive: true })
fs.writeFileSync(outputPath, output)
console.log(`Wrote ${outputPath}`)
console.log(`Voice: ${voiceName}`)
console.log(`Model: ${model}`)
console.log(`Mime: ${mimeType || 'unknown'}`)

function parseRate(mimeType) {
  const match = mimeType.match(/rate=(\d+)/)
  return match ? Number(match[1]) : null
}

function wrapPcmAsWav(pcm, sampleRate) {
  const channels = 1
  const bitsPerSample = 16
  const byteRate = sampleRate * channels * (bitsPerSample / 8)
  const blockAlign = channels * (bitsPerSample / 8)
  const header = Buffer.alloc(44)

  header.write('RIFF', 0)
  header.writeUInt32LE(36 + pcm.length, 4)
  header.write('WAVE', 8)
  header.write('fmt ', 12)
  header.writeUInt32LE(16, 16)
  header.writeUInt16LE(1, 20)
  header.writeUInt16LE(channels, 22)
  header.writeUInt32LE(sampleRate, 24)
  header.writeUInt32LE(byteRate, 28)
  header.writeUInt16LE(blockAlign, 32)
  header.writeUInt16LE(bitsPerSample, 34)
  header.write('data', 36)
  header.writeUInt32LE(pcm.length, 40)
  return Buffer.concat([header, pcm])
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
