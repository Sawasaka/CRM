export const DEFAULT_GEMINI_CHAT_MODEL =
  process.env.GEMINI_CHAT_MODEL ?? process.env.DEPT_PHONE_MODEL ?? 'gemini-3-flash-preview'

export type GeminiChatMessage = {
  role: 'system' | 'user' | 'assistant'
  content: string
}

type GeminiResponse = {
  candidates?: Array<{
    content?: {
      parts?: Array<{ text?: string }>
    }
  }>
  usageMetadata?: unknown
  error?: {
    message?: string
  }
}

// Gemini が "high demand" などで 503/429 を返した時の指数バックオフ付き再試行。
// 1回目: 約 600ms 待機、2回目: 約 1.5s、3回目: 約 3s。
async function fetchGeminiWithRetry(
  url: string,
  init: RequestInit,
  maxRetries = 3,
): Promise<Response> {
  let lastRes: Response | null = null
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const res = await fetch(url, init)
    if (res.status !== 503 && res.status !== 429) return res
    lastRes = res
    if (attempt === maxRetries) break
    const waitMs = Math.round(600 * Math.pow(2.2, attempt) + Math.random() * 200)
    await new Promise((r) => setTimeout(r, waitMs))
  }
  return lastRes ?? (await fetch(url, init))
}

export async function generateGeminiChat({
  messages,
  model = DEFAULT_GEMINI_CHAT_MODEL,
  temperature = 0.4,
}: {
  messages: GeminiChatMessage[]
  model?: string
  temperature?: number
}): Promise<{ content: string; model: string; usageMetadata?: unknown }> {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY が未設定です')
  }

  const systemText = messages
    .filter((m) => m.role === 'system')
    .map((m) => m.content)
    .join('\n\n')

  const contents = messages
    .filter((m) => m.role !== 'system')
    .map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }))

  const res = await fetchGeminiWithRetry(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents,
        systemInstruction: systemText ? { parts: [{ text: systemText }] } : undefined,
        generationConfig: { temperature },
      }),
    }
  )

  const json = (await res.json().catch(() => ({}))) as GeminiResponse
  if (!res.ok) {
    // 高負荷時 (503) は UI 側で対処しやすい文言にする。
    if (res.status === 503) {
      throw new Error(
        `Gemini ${model} が混雑しています。少し時間を置くか、モデルセレクターから別モデルに切り替えてください。`,
      )
    }
    throw new Error(json.error?.message || `Gemini API HTTP ${res.status}`)
  }

  const content =
    json.candidates?.[0]?.content?.parts
      ?.map((part) => part.text ?? '')
      .join('')
      .trim() ?? ''

  if (!content) {
    throw new Error('Gemini API から空の回答が返りました')
  }

  return { content, model, usageMetadata: json.usageMetadata }
}
