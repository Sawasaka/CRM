import { openai } from './openai'

export interface ResearchBriefData {
  businessSummary: string
  industry: string
  employeeCount: string
  foundedYear: string
  fundingStatus: string
  ceoName: string
  ceoBackground: string
  challenges: Array<{ text: string; confidence: number }>
  salesOrgHypothesis: string
  toolsUsed: string[]
  recommendedApproach: string
  questionsToAsk: string[]
  confidence: Record<string, number>
}

const RESEARCH_PROMPT = `
あなたは優秀なBtoB営業リサーチャーです。
提供された企業情報を元に、初回商談前のResearch Briefを作成してください。

以下の項目を含むJSONを返してください:
- businessSummary: 事業概要（3文以内）
- industry: 業種
- employeeCount: 従業員数（推定）
- foundedYear: 設立年
- fundingStatus: 資金調達状況
- ceoName: 代表者名
- ceoBackground: 代表者の経歴・特徴
- challenges: 推定課題リスト（各項目にtext・confidenceを含む）
- salesOrgHypothesis: 営業組織の仮説
- toolsUsed: 使用中ツール・システム（推定）
- recommendedApproach: 推奨アプローチ戦略
- questionsToAsk: 初回商談で聞くべき質問リスト（5〜7個）
- confidence: 各フィールドの信頼度（0.0〜1.0）

必ずJSON形式で返してください。
`

export async function synthesizeResearchBrief(
  searchResults: string,
  companyName: string,
  industry?: string
): Promise<ResearchBriefData> {
  const response = await openai.chat.completions.create({
    model: 'gpt-5.5',
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: RESEARCH_PROMPT },
      {
        role: 'user',
        content: `企業名: ${companyName}\n業種ヒント: ${industry ?? '不明'}\n\n検索結果:\n${searchResults}`,
      },
    ],
    temperature: 0.2,
  })

  const content = response.choices[0]?.message.content
  if (!content) throw new Error('No response from GPT-5.5')

  return JSON.parse(content) as ResearchBriefData
}
