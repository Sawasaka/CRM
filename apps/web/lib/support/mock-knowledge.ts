// 問い合わせチャットの仮ナレッジ。実装時は RAG エンドポイントへ差し替える前提。
export type KnowledgeAnswer = {
  text: string
  // 出典を表示する場合に使う(任意)
  sources?: { title: string; href?: string }[]
}

type Rule = {
  match: (q: string) => boolean
  answer: KnowledgeAnswer
}

const RULES: Rule[] = []

const FALLBACK: KnowledgeAnswer = {
  text:
    'ご質問の内容に対するナレッジはまだ登録されていません。「担当者に相談する」から開発チームへ直接お繋ぎください。',
}

// シンプルな同期マッチング。実運用では fetch('/api/support/ask') に置換する想定。
export function answerForQuestion(question: string): KnowledgeAnswer {
  const q = question.trim()
  if (!q) return FALLBACK
  for (const rule of RULES) {
    if (rule.match(q)) return rule.answer
  }
  return FALLBACK
}
