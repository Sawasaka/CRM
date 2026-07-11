import { NextResponse } from 'next/server'
import { getCurrentAppContext } from '@/lib/app-context'
import { getAiCallProviderReadiness, getAiCallProviderReadinessMatrix } from '@/lib/ai-calls/provider'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  const context = await getCurrentAppContext({ allowDevFallback: true })
  if (!context) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  return NextResponse.json({
    current: getAiCallProviderReadiness(),
    matrix: getAiCallProviderReadinessMatrix(),
    recommendedProvider: 'amazon_connect_openai',
    recommendedVoice: process.env.OPENAI_REALTIME_VOICE || 'marin',
    qualityPreset: {
      language: 'ja-JP',
      bargeIn: 'high',
      silenceDurationMs: 240,
      oneQuestionAtATime: true,
      answerStyle: 'short_natural_phone_japanese',
    },
  })
}
