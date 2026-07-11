import { NextRequest, NextResponse } from 'next/server'
import { getConversationRelayVoiceProfile } from '@/lib/ai-calls/voice-profiles'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  return responseFor(req)
}

export async function GET(req: NextRequest) {
  return responseFor(req)
}

function responseFor(req: NextRequest) {
  const relayUrl = process.env.AI_CALL_RELAY_WS_URL
  if (!relayUrl) {
    return new NextResponse('<Response><Say language="ja-JP">AI通話設定が未完了です。</Say></Response>', {
      status: 200,
      headers: { 'Content-Type': 'text/xml; charset=utf-8' },
    })
  }

  const callId = req.nextUrl.searchParams.get('callId') ?? `twilio_${Date.now()}`
  const url = appendWsParams(relayUrl, { callId })
  const voiceProfile = getConversationRelayVoiceProfile(process.env)
  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<Response>',
    '<Connect>',
    `<ConversationRelay url="${escapeXml(url)}" welcomeGreeting="${escapeXml(voiceProfile.welcome)}" welcomeGreetingInterruptible="speech" language="${escapeXml(voiceProfile.language)}" ttsProvider="${escapeXml(voiceProfile.ttsProvider)}" transcriptionProvider="${escapeXml(voiceProfile.transcriptionProvider)}" voice="${escapeXml(voiceProfile.voice)}" interruptible="speech" interruptSensitivity="${escapeXml(voiceProfile.interruptSensitivity)}" reportInputDuringAgentSpeech="${escapeXml(voiceProfile.reportInputDuringAgentSpeech)}" speechTimeout="${escapeXml(voiceProfile.speechTimeoutMs)}">`,
    `<Parameter name="callId" value="${escapeXml(callId)}" />`,
    '</ConversationRelay>',
    '</Connect>',
    '</Response>',
  ].join('')

  return new NextResponse(xml, {
    status: 200,
    headers: { 'Content-Type': 'text/xml; charset=utf-8' },
  })
}

function appendWsParams(url: string, params: Record<string, string>) {
  const parsed = new URL(url)
  for (const [key, value] of Object.entries(params)) parsed.searchParams.set(key, value)
  return parsed.toString()
}

function escapeXml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}
