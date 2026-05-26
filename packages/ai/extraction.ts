import { openai } from './openai'

export interface ExtractedMeetingFields {
  painPoints?: string
  budget?: string
  desiredService?: string
  timeline?: string
  decisionMaker?: string
  competitors?: string
  blockers?: string
  currentSolution?: string
  nextActionUs?: string
  nextActionCust?: string
  suggestedStage?: string
  confidence: Record<string, number>
}

const EXTRACTION_PROMPT = `
あなたは優秀な営業マネージャーのアシスタントです。
以下の商談議事録から、CRMに登録すべき情報を正確に抽出してください。

抽出項目:
- painPoints: 顧客の課題・ペイン
- budget: 予算感（金額や範囲）
- desiredService: 希望サービス・機能
- timeline: 導入時期・スケジュール
- decisionMaker: 決裁者情報
- competitors: 競合・比較検討状況
- blockers: 懸念点・ブロッカー
- currentSolution: 現在の解決方法
- nextActionUs: 我々の次のアクション
- nextActionCust: 顧客の次のアクション
- suggestedStage: 推奨パイプラインステージ（NEW_LEAD/QUALIFIED/FIRST_MEETING/SOLUTION_FIT/PROPOSAL/NEGOTIATION/VERBAL_COMMIT）

各フィールドの信頼度（0.0〜1.0）も返してください。
情報がない場合はnullを返してください。
必ずJSON形式で返してください。
`

export async function extractMeetingFields(
  transcript: string
): Promise<ExtractedMeetingFields> {
  const response = await openai.chat.completions.create({
    model: 'gpt-5.5',
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: EXTRACTION_PROMPT },
      { role: 'user', content: `議事録:\n${transcript}` },
    ],
    temperature: 0.1,
  })

  const content = response.choices[0]?.message.content
  if (!content) throw new Error('No response from GPT-5.5')

  return JSON.parse(content) as ExtractedMeetingFields
}
