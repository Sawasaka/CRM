export const DEFAULT_GEMINI_CHAT_MODEL =
  process.env.GEMINI_CHAT_MODEL ?? process.env.DEPT_PHONE_MODEL ?? 'gemini-2.5-flash-lite'

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

  const res = await fetch(
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
