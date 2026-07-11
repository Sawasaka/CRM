import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
import { WebSocketServer } from 'ws'

loadEnvFile(path.resolve(process.cwd(), '.env.local'))

const port = Number(process.env.TWILIO_RELAY_PORT || 8787)
const openaiApiKey = process.env.OPENAI_API_KEY
const openaiModel = process.env.OPENAI_CALL_MODEL || 'gpt-4.1-mini'

if (!openaiApiKey) {
  console.error('OPENAI_API_KEY is required')
  process.exit(1)
}

const systemPrompt = [
  'あなたは株式会社ルーキースマートジャパンの日本語コールAIです。',
  '日本人の自然な電話応対として、短く、落ち着いて、電話らしい間で話します。',
  'AIであることを隠したり、人間の担当者本人だと誤解させたりしてはいけません。',
  '一度に質問は1つだけです。',
  '質問は1行に1つだけです。',
  '1ターンは原則として1文、18文字から40文字程度にします。',
  '相手が話したり質問したら、予定していた説明を止め、その内容にだけ短く返します。',
  '聞き取れない時は推測せず、短く聞き返します。',
  '復唱は必要最低限にし、相手の言葉をそのまま長く繰り返しません。',
  '長い説明、複数質問、まとめて3点確認は禁止です。',
  '相手が終了したいと言ったら、短くお礼を言って終了します。',
  '契約、料金決済、正式な日程確定は行いません。',
  process.env.AI_CALL_SYSTEM_PROMPT_EXTRA || '',
].join('\n')

const server = http.createServer((req, res) => {
  if (req.url === '/healthz') {
    res.writeHead(200, { 'content-type': 'application/json' })
    res.end(JSON.stringify({ ok: true }))
    return
  }
  res.writeHead(404)
  res.end('not found')
})

const wss = new WebSocketServer({ server, path: '/twilio/conversation-relay' })

wss.on('connection', (socket, request) => {
  const url = new URL(request.url || '/', `http://${request.headers.host || 'localhost'}`)
  const session = {
    callId: url.searchParams.get('callId') || `relay_${Date.now()}`,
    callSid: null,
    history: [],
    abortController: null,
    customParameters: {},
    finalized: false,
  }

  socket.on('message', async (data) => {
    const message = parseMessage(data)
    if (!message) return

    if (message.type === 'setup') {
      session.callSid = stringFrom(message.callSid)
      session.customParameters = message.customParameters || {}
      session.callId = stringFrom(session.customParameters.callId) || session.callId
      console.log(JSON.stringify({ event: 'setup', callId: session.callId, callSid: session.callSid }))
      return
    }

    if (message.type === 'interrupt') {
      session.abortController?.abort()
      session.abortController = null
      console.log(JSON.stringify({ event: 'interrupt', callId: session.callId }))
      return
    }

    if (message.type === 'prompt') {
      if (message.last === false) return
      const userText = typeof message.voicePrompt === 'string' ? message.voicePrompt.trim() : ''
      if (!userText) return
      session.history.push({ role: 'user', content: userText })
      await answer(socket, session)
      return
    }

    if (message.type === 'error') {
      console.error(JSON.stringify({ event: 'twilio_error', callId: session.callId, description: message.description }))
    }
  })

  socket.on('close', async () => {
    session.abortController?.abort()
    console.log(JSON.stringify({ event: 'closed', callId: session.callId }))
    await finalizeSession(session)
  })
})

server.listen(port, () => {
  console.log(`Twilio Conversation Relay server listening on :${port}`)
  console.log(`WebSocket path: /twilio/conversation-relay`)
})

async function answer(socket, session) {
  session.abortController?.abort()
  const abortController = new AbortController()
  session.abortController = abortController

  try {
    const content = await createResponse(session.history, abortController.signal)
    if (abortController.signal.aborted) return
    const reply = compactReply(content)
    session.history.push({ role: 'assistant', content: reply })
    sendText(socket, reply, true)
  } catch (error) {
    if (abortController.signal.aborted) return
    console.error(JSON.stringify({ event: 'openai_error', callId: session.callId, message: String(error?.message || error) }))
    sendText(socket, 'すみません、少し聞き取れませんでした。', true)
  } finally {
    if (session.abortController === abortController) session.abortController = null
  }
}

async function createResponse(history, signal) {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      authorization: `Bearer ${openaiApiKey}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: openaiModel,
      temperature: 0.2,
      messages: [
        { role: 'system', content: systemPrompt },
        ...history.slice(-10),
      ],
    }),
    signal,
  })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(JSON.stringify(json).slice(0, 800))
  return json.choices?.[0]?.message?.content || ''
}

async function finalizeSession(session) {
  if (session.finalized) return
  session.finalized = true

  const webhookUrl = getResultWebhookUrl()
  if (!webhookUrl) {
    console.log(JSON.stringify({ event: 'result_webhook_skipped', reason: 'missing_url', callId: session.callId }))
    return
  }

  const transcript = transcriptFromHistory(session.history)
  const result =
    session.history.length > 0
      ? await createCallResult(session.history).catch((error) => {
          console.error(JSON.stringify({ event: 'summary_error', callId: session.callId, message: String(error?.message || error) }))
          return {
            outcome: 'connected',
            summary: 'AIコールの会話が終了しました。詳細は通話ログを確認してください。',
            nextAction: '通話内容を確認し、必要に応じてフォローする',
          }
        })
      : {
          outcome: 'no_answer',
          summary: '通話は終了しましたが、会話内容は記録されていません。',
          nextAction: '必要に応じて再架電する',
        }

  const payload = {
    callId: session.callId,
    externalCallId: session.callSid,
    provider: 'twilio_openai',
    contactId: stringFrom(session.customParameters.contactId),
    dealId: stringFrom(session.customParameters.dealId),
    companyId: stringFrom(session.customParameters.companyId),
    phone: stringFrom(session.customParameters.phone),
    outcome: result.outcome,
    transcript,
    summary: result.summary,
    nextAction: result.nextAction,
    rawProviderPayload: {
      customParameters: session.customParameters,
      relayClosedAt: new Date().toISOString(),
    },
  }

  const headers = { 'content-type': 'application/json' }
  if (process.env.AI_CALL_WEBHOOK_SECRET) headers['x-ai-call-secret'] = process.env.AI_CALL_WEBHOOK_SECRET

  const res = await fetch(webhookUrl, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    const body = await res.text().catch(() => '')
    console.error(JSON.stringify({ event: 'result_webhook_failed', callId: session.callId, status: res.status, body: body.slice(0, 500) }))
    return
  }
  console.log(JSON.stringify({ event: 'result_webhook_sent', callId: session.callId }))
}

async function createCallResult(history) {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      authorization: `Bearer ${openaiApiKey}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: openaiModel,
      temperature: 0.1,
      messages: [
        {
          role: 'system',
          content:
            'AI電話の通話結果をCRM保存用JSONにする。JSON以外は返さない。outcomeはconnected,no_answer,callback_requested,meeting_booked,not_interested,do_not_call,needs_humanのいずれか。',
        },
        {
          role: 'user',
          content: JSON.stringify({
            transcript: transcriptFromHistory(history),
            schema: {
              outcome: 'connected|no_answer|callback_requested|meeting_booked|not_interested|do_not_call|needs_human',
              summary: 'string',
              nextAction: 'string',
            },
          }),
        },
      ],
    }),
  })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(JSON.stringify(json).slice(0, 800))
  const parsed = parseJsonObject(json.choices?.[0]?.message?.content || '{}')
  return {
    outcome: normalizeOutcome(parsed.outcome),
    summary: stringFrom(parsed.summary) || 'AIコールが終了しました。',
    nextAction: stringFrom(parsed.nextAction) || '通話結果を確認し、次のアクションを判断する',
  }
}

function sendText(socket, token, last) {
  if (socket.readyState !== socket.OPEN) return
  socket.send(JSON.stringify({
    type: 'text',
    token,
    last,
    lang: 'ja-JP',
    interruptible: true,
    preemptible: true,
  }))
}

function compactReply(value) {
  const text = String(value || '').replace(/\s+/g, ' ').trim()
  if (!text) return 'はい、ありがとうございます。'
  const firstLine = text.split(/\n+/)[0]?.trim() || text
  const firstSentence = firstLine.match(/^.*?[。！？?]/)?.[0] || firstLine
  return firstSentence.length > 70 ? `${firstSentence.slice(0, 67)}…` : firstSentence
}

function parseMessage(data) {
  try {
    return JSON.parse(Buffer.isBuffer(data) ? data.toString('utf8') : String(data))
  } catch {
    return null
  }
}

function getResultWebhookUrl() {
  if (process.env.AI_CALL_RESULT_WEBHOOK_URL) return process.env.AI_CALL_RESULT_WEBHOOK_URL
  const base = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || process.env.NEXTAUTH_URL
  return base ? `${base.replace(/\/$/, '')}/api/ai-calls/webhook` : null
}

function transcriptFromHistory(history) {
  return history
    .map((message) => `${message.role === 'assistant' ? 'AI' : '相手'}: ${message.content}`)
    .join('\n')
}

function parseJsonObject(text) {
  const trimmed = String(text || '').trim()
  const body =
    trimmed.startsWith('{') && trimmed.endsWith('}')
      ? trimmed
      : (trimmed.match(/\{[\s\S]*\}/)?.[0] || '{}')
  const parsed = JSON.parse(body)
  return parsed && typeof parsed === 'object' ? parsed : {}
}

function normalizeOutcome(value) {
  const allowed = [
    'connected',
    'no_answer',
    'callback_requested',
    'meeting_booked',
    'not_interested',
    'do_not_call',
    'needs_human',
  ]
  return typeof value === 'string' && allowed.includes(value) ? value : 'connected'
}

function stringFrom(value) {
  return typeof value === 'string' && value.trim() ? value.trim() : null
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
