import fs from 'node:fs'
import http from 'node:http'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { WebSocketServer, WebSocket } from 'ws'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(__dirname, '../../..')
loadEnv(path.join(repoRoot, '.env.local'))
loadEnv(path.join(repoRoot, 'apps/web/.env.local'))

const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY
const port = Number(process.env.GEMINI_LIVE_RELAY_PORT || 8787)
const defaultModel = process.env.GEMINI_LIVE_MODEL || 'gemini-3.1-flash-live-preview'
const defaultVoice = process.env.GEMINI_LIVE_VOICE || 'Charon'

if (!apiKey) {
  console.error('GEMINI_API_KEY or GOOGLE_API_KEY is required.')
  process.exit(1)
}

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify({ ok: true, path: '/gemini-live' }))
})

const wss = new WebSocketServer({ server, path: '/gemini-live' })

wss.on('connection', (client) => {
  let google = null
  let ready = false
  const pending = []

  const sendClient = (payload) => {
    if (client.readyState === WebSocket.OPEN) client.send(JSON.stringify(payload))
  }

  const sendGoogle = (payload) => {
    if (!google || google.readyState !== WebSocket.OPEN || !ready) {
      pending.push(payload)
      return
    }
    google.send(JSON.stringify(payload))
  }

  const flushPending = () => {
    while (pending.length > 0 && google?.readyState === WebSocket.OPEN && ready) {
      google.send(JSON.stringify(pending.shift()))
    }
  }

  client.on('message', (raw) => {
    let message
    try {
      message = JSON.parse(String(raw))
    } catch {
      sendClient({ type: 'error', message: 'Invalid JSON from browser.' })
      return
    }

    if (message.type === 'start') {
      const model = stringOr(message.model, defaultModel)
      const voice = stringOr(message.voice, defaultVoice)
      const systemInstruction = stringOr(message.systemInstruction, '日本語で短く自然に返答してください。')
      const url = `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent?key=${encodeURIComponent(apiKey)}`

      google = new WebSocket(url)
      google.on('open', () => {
        google.send(
          JSON.stringify({
            setup: {
              model: model.startsWith('models/') ? model : `models/${model}`,
              generationConfig: {
                responseModalities: ['AUDIO'],
                speechConfig: {
                  languageCode: 'ja-JP',
                  voiceConfig: {
                    prebuiltVoiceConfig: { voiceName: voice },
                  },
                },
              },
              realtimeInputConfig: {
                automaticActivityDetection: {
                  disabled: true,
                },
                activityHandling: 'START_OF_ACTIVITY_INTERRUPTS',
                turnCoverage: 'TURN_INCLUDES_ONLY_ACTIVITY',
              },
              systemInstruction: {
                parts: [{ text: systemInstruction }],
              },
            },
          }),
        )
      })
      google.on('message', (event) => {
        const parsed = parseGoogleEvent(event)
        if (parsed?.setupComplete) {
          ready = true
          flushPending()
        }
        sendClient({ type: 'google_event', event: parsed })
      })
      google.on('error', (event) => {
        sendClient({ type: 'error', message: event?.message || 'Gemini relay upstream error.' })
      })
      google.on('close', (code, reason) => {
        ready = false
        sendClient({
          type: 'closed',
          code,
          reason: Buffer.isBuffer(reason) ? reason.toString('utf8') : String(reason || ''),
        })
      })
      return
    }

    if (message.type === 'audio') {
      sendGoogle({
        realtimeInput: {
          audio: {
            data: message.data,
            mimeType: stringOr(message.mimeType, 'audio/pcm;rate=16000'),
          },
        },
      })
      return
    }

    if (message.type === 'activity_start') {
      sendGoogle({
        realtimeInput: {
          activityStart: {},
        },
      })
      return
    }

    if (message.type === 'activity_end') {
      sendGoogle({
        realtimeInput: {
          activityEnd: {},
        },
      })
      return
    }

    if (message.type === 'client_content') {
      sendGoogle({
        clientContent: {
          turns: [{ role: 'user', parts: [{ text: stringOr(message.text, '') }] }],
          turnComplete: true,
        },
      })
      return
    }

    if (message.type === 'audio_stream_end') {
      sendGoogle({ realtimeInput: { audioStreamEnd: true } })
    }
  })

  client.on('close', () => {
    if (google?.readyState === WebSocket.OPEN) google.close()
  })
})

server.listen(port, '127.0.0.1', () => {
  console.log(`Gemini Live relay listening on ws://127.0.0.1:${port}/gemini-live`)
})

function parseGoogleEvent(event) {
  const text = Buffer.isBuffer(event) ? event.toString('utf8') : String(event)
  try {
    return JSON.parse(text)
  } catch {
    return { raw: text }
  }
}

function stringOr(value, fallback) {
  return typeof value === 'string' && value.trim() ? value.trim() : fallback
}

function loadEnv(filePath) {
  if (!fs.existsSync(filePath)) return
  const lines = fs.readFileSync(filePath, 'utf8').split(/\n/)
  for (const line of lines) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/)
    if (!match || process.env[match[1]]) continue
    process.env[match[1]] = match[2].replace(/^['"]|['"]$/g, '')
  }
}
