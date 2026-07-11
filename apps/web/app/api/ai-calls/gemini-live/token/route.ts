import { GoogleGenAI } from '@google/genai'
import { NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const DEFAULT_MODEL = 'gemini-3.1-flash-live-preview'
const DEFAULT_VOICE = 'Charon'

export async function POST(req: Request) {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY
  if (!apiKey) {
    return NextResponse.json(
      {
        error: 'GEMINI_API_KEY is not set.',
        missing: ['GEMINI_API_KEY'],
      },
      { status: 400 },
    )
  }

  const body = await req.json().catch(() => ({}))
  const model = stringOr(body.model, process.env.GEMINI_LIVE_MODEL || DEFAULT_MODEL)
  const voice = stringOr(body.voice, process.env.GEMINI_LIVE_VOICE || DEFAULT_VOICE)
  const scenario = stringOr(body.scenario, '')
  const knowledge = stringOr(body.knowledge, '')
  const systemInstruction = [
    'あなたは株式会社ルーキースマートジャパンの日本語コールAIです。',
    '日本語の電話として自然に、短く、落ち着いて話します。',
    'AIであることは隠さず、人間本人だと誤解させてはいけません。',
    '一度に質問は1つだけです。',
    '相手が話し始めたら途中でも止まり、相手の発話を優先します。',
    '返答は原則1文から2文です。ただし、ユーザーが発話時間や長さを明示した場合は指定を優先します。',
    '確認する項目は、お問い合わせ背景、今後のステップ、次回商談で話すべき議題、温度感です。',
    scenario ? `\n現在のテストシナリオ:\n${scenario}` : '',
    knowledge ? `\n参照情報:\n${knowledge}` : '',
  ].join('\n')

  try {
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: { apiVersion: 'v1alpha' },
    })
    const now = Date.now()
    const token = await ai.authTokens.create({
      config: {
        uses: 1,
        newSessionExpireTime: new Date(now + 5 * 60 * 1000).toISOString(),
        expireTime: new Date(now + 30 * 60 * 1000).toISOString(),
        liveConnectConstraints: {
          model,
          config: {
            responseModalities: ['AUDIO' as any],
            systemInstruction,
            speechConfig: {
              languageCode: 'ja-JP',
              voiceConfig: {
                prebuiltVoiceConfig: {
                  voiceName: voice,
                },
              },
            },
            inputAudioTranscription: {},
            outputAudioTranscription: {},
            enableAffectiveDialog: true,
          },
        },
      },
    })

    if (!token.name) throw new Error('Gemini ephemeral token was not returned.')

    return NextResponse.json({
      token: token.name,
      model,
      voice,
      systemInstruction,
    })
  } catch (err) {
    return NextResponse.json(
      {
        error: 'Failed to create Gemini Live token.',
        detail: err instanceof Error ? err.message : String(err),
      },
      { status: 500 },
    )
  }
}

function stringOr(value: unknown, fallback: string) {
  return typeof value === 'string' && value.trim() ? value.trim() : fallback
}
