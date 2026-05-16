// プラン × モデル × Thinking の組み合わせ制御
// 既存 ModelSelector に合わせる：
//   ModelKind: 'gpt-4o' | 'gpt-4o-mini'
//   ThinkingDepth: 'standard' | 'extended'
// 仕様:
//   - スタンダード（STARTER, GROWTH）: gpt-4o-mini のみ、Thinking standard 固定
//   - プロ（ENTERPRISE）: gpt-4o / gpt-4o-mini 選択可、Thinking standard / extended 選択可
//   - FREE: 利用不可
import type { Plan } from '@bgm/db'

export type ModelKind = 'gpt-4o' | 'gpt-4o-mini'
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
  requested: { model?: ModelKind; thinking?: ThinkingDepth },
): ResolvedResearchModel {
  // FREE は呼ばれない前提だが、保険で mini standard
  if (plan === 'FREE') {
    return { model: 'gpt-4o-mini', thinking: 'standard' }
  }

  const isPro = plan === 'ENTERPRISE'
  // スタンダードは強制的に mini + standard
  if (!isPro) {
    return { model: 'gpt-4o-mini', thinking: 'standard' }
  }

  // プロは選択を尊重（未指定は推奨デフォルト）
  const model: ModelKind = requested.model ?? 'gpt-4o-mini'
  const thinking: ThinkingDepth = requested.thinking ?? 'standard'

  const reasoningSystemSuffix =
    thinking === 'extended'
      ? '\n\n[REASONING_MODE]\n回答前に内部的に段階的に推論してください。最終回答は簡潔・構造化し、根拠を明示してください。'
      : undefined

  return { model, thinking, reasoningSystemSuffix }
}
