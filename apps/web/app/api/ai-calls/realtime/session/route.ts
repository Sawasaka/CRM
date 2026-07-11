import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

const DEFAULT_MODEL = 'gpt-realtime-2'
const DEFAULT_VOICE = 'marin'

const BASE_INSTRUCTIONS = [
  'あなたは株式会社ルーキースマートジャパンの日本語コールAIです。',
  '目的は、問い合わせ直後の相談内容を短く自然にヒアリングし、次回商談の論点を揃えることです。',
  '日本語の電話として自然に、低めで落ち着いた男性営業担当のようなトーンで、短く話します。',
  '声、間、反応速度は人間の電話応対に近い自然さにします。ただしAIであることは隠しません。',
  '声は明るすぎず、少し低め、穏やか、余裕のある話し方にします。',
  '語尾を伸ばしすぎず、アナウンサー調、ロボット調、過剰に元気な話し方は禁止です。',
  'AIであることを隠したり、人間の担当者本人だと誤解させたりしてはいけません。',
  '一度に質問は1つだけです。',
  '相手が話したら途中でも止まり、相手の発話内容を優先します。',
  '返答は原則1文、18文字から45文字程度にします。長くても2文までです。',
  '「なるほど」「ありがとうございます」などの相づちは短く、毎回同じ言い方にしません。',
  'AIらしい前置き、箇条書き、説明調、過剰な敬語、同じ確認の繰り返しは禁止です。',
  '相手の発話と被ったら、短く謝って黙り、相手の続きに戻します。',
  '質問前には短い受け止めを1つだけ入れ、質問文は1行に1つだけにします。',
  '聞き取れない時は推測せず、短く聞き返します。',
  '長い説明、複数質問、営業資料の読み上げは禁止です。',
  'ただし、ユーザーが「20秒話して」「長めに説明して」など明示的に発話時間や長さを指定した場合は、その指定を優先して自然に話し続けます。',
  '長めに話す場合も、途中で不自然に切らず、最後に短く締めます。',
  '確認する項目は、お問い合わせ背景、今後のステップ、次回商談で話すべき議題、温度感です。',
  '日程確定、契約、料金決済、法的判断は行わず、必要なら人間に引き継ぎます。',
].join('\n')

export async function POST(req: Request) {
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      {
        error: 'OPENAI_API_KEY is not set.',
        missing: ['OPENAI_API_KEY'],
      },
      { status: 400 },
    )
  }

  const body = await req.json().catch(() => ({}))
  const model = stringOr(body.model, process.env.OPENAI_REALTIME_MODEL || DEFAULT_MODEL)
  const voice = stringOr(body.voice, process.env.OPENAI_REALTIME_VOICE || DEFAULT_VOICE)
  const scenario = stringOr(body.scenario, '')
  const knowledge = stringOr(body.knowledge, '')
  const instructions = [
    BASE_INSTRUCTIONS,
    scenario ? `\n現在のテストシナリオ:\n${scenario}` : '',
    knowledge ? `\n参照情報:\n${knowledge}` : '',
    process.env.OPENAI_REALTIME_INSTRUCTIONS_EXTRA
      ? `\n追加指示:\n${process.env.OPENAI_REALTIME_INSTRUCTIONS_EXTRA}`
      : '',
  ].join('\n')

  const response = await fetch('https://api.openai.com/v1/realtime/client_secrets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
      'OpenAI-Safety-Identifier': process.env.OPENAI_SAFETY_IDENTIFIER || 'lukisma-crm-local-test',
    },
    body: JSON.stringify({
      session: {
        type: 'realtime',
        model,
        instructions,
        output_modalities: ['audio'],
        audio: {
          output: {
            voice,
          },
          input: {
            transcription: {
              model: process.env.OPENAI_REALTIME_TRANSCRIPTION_MODEL || 'gpt-4o-mini-transcribe',
              language: 'ja',
            },
            turn_detection: {
              type: 'server_vad',
              threshold: 0.5,
              prefix_padding_ms: 220,
              silence_duration_ms: 360,
              create_response: true,
              interrupt_response: true,
            },
          },
        },
        max_output_tokens: 1200,
      },
    }),
  })

  const payload = await response.json().catch(async () => ({
    error: await response.text().catch(() => ''),
  }))

  if (!response.ok) {
    return NextResponse.json(
      {
        error: 'Failed to create OpenAI Realtime session.',
        detail: payload,
      },
      { status: response.status },
    )
  }

  return NextResponse.json({
    model: payload.session?.model ?? model,
    voice: payload.session?.audio?.output?.voice ?? voice,
    clientSecret: payload.value ?? payload.client_secret?.value ?? payload.client_secret,
    expiresAt: payload.expires_at ?? payload.client_secret?.expires_at ?? null,
  })
}

function stringOr(value: unknown, fallback: string) {
  return typeof value === 'string' && value.trim() ? value.trim() : fallback
}
