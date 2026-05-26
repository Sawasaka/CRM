// プラン × モデル × Thinking の組み合わせ制御
// 既存 ModelSelector に合わせる：
//   ModelKind: 'gemini-3-flash-preview' | 'gpt-5.5'
//   ThinkingDepth: 'standard' | 'extended'
// 仕様:
//   - 現行運用: Gemini 3 Flash Preview / GPT-5.5 を選択可能
//   - FREE: 利用不可
import type { Plan } from '@bgm/db'

export type ModelKind = 'gemini-3-flash-preview' | 'gpt-5.5'
export type ThinkingDepth = 'standard' | 'extended'

export type ResolvedResearchModel = {
  model: ModelKind
  thinking: ThinkingDepth
  // 拡張Thinking時にシステムプロンプトに添える reasoning 指示
  reasoningSystemSuffix?: string
}

export function isResearchAllowed(plan: Plan): boolean {
  return plan !== 'FREE'
}

export function resolveResearchModel(
  plan: Plan,
  requested: { model?: ModelKind; thinking?: ThinkingDepth }
): ResolvedResearchModel {
  const model: ModelKind = requested.model ?? 'gemini-3-flash-preview'

  // FREE は呼ばれない前提だが、保険で Gemini standard
  if (plan === 'FREE') {
    return { model, thinking: 'standard' }
  }

  const isPro = plan === 'ENTERPRISE'
  // スタンダードは強制的に standard
  if (!isPro) {
    return { model, thinking: 'standard' }
  }

  // プロは Thinking 選択を尊重
  const thinking: ThinkingDepth = requested.thinking ?? 'standard'

  const reasoningSystemSuffix =
    thinking === 'extended'
      ? '\n\n[REASONING_MODE]\n回答前に内部的に段階的に推論してください。最終回答は簡潔・構造化し、根拠を明示してください。'
      : undefined

  return { model, thinking, reasoningSystemSuffix }
}
