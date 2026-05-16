'use client'

/**
 * Photon Drift プリミティブのサービス側エクスポート口。
 *
 * 設計意図:
 * - LP (/lp 配下) の `components/landing/atoms.tsx` には Photon Drift の
 *   共通プリミティブ（Eyebrow / Pill / Orb / NebulaBG / Section / MiniBar /
 *   GlassCard / ParticleField / AGENTS メタ）が定義されている。
 * - サービス本体 (app/(app) 配下) も同じデザイントーンへ寄せていくため、
 *   その入口としてこの adapter を経由して import する。
 * - 直接 `@/components/landing/...` から取り込まず、この層を挟むことで
 *   後で「サービス／LP で実装を分離する」「LP に依存しない汎用版へ差し替える」
 *   といった選択肢を残せる。
 *
 * 当面は re-export のみ。サービス側固有の派生バリエーションが必要になったら
 * このファイルにラップ実装を追加していく。
 */

export {
  Eyebrow,
  Pill,
  Orb,
  ParticleField,
  NebulaBG,
  Section,
  MiniBar,
  GlassCard,
  AGENTS,
} from '@/components/landing/atoms'

export type { AgentKey, AgentMeta } from '@/components/landing/atoms'
