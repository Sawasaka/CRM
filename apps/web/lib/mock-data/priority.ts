/**
 * 開発優先度ボードのモックデータ + 型定義
 *
 * Next.js のページファイル (app/(app)/priority/page.tsx) は default export しか
 * 持てないため、再利用するデータ・型はここに切り出している。
 *
 * - priority/page.tsx (画面)
 * - deals/[id]/page.tsx (取引詳細のプロダクトフィールド)
 *
 * からそれぞれ import される。
 */

export type PriorityCategory = '要望機能' | 'ニーズ' | '課題' | '問題'

export interface PriorityEvidence {
  companyId: string
  companyName: string
  /** ISO date (YYYY-MM-DD) */
  meetingDate: string
  /** 議事録 / 問い合わせチケットから AI が拾った引用テキスト */
  quote: string
  /** 議事録ドキュメント (Google Docs) または 問い合わせチケットへのリンク */
  meetingDocUrl: string
  /** 'meeting' = 議事録 / 'ticket' = 問い合わせチケット (リンクラベル切替に使用) */
  sourceType?: 'meeting' | 'ticket'
}

export interface PriorityItem {
  id: string
  category: PriorityCategory
  /** AI がまとめた見出し (例: "カスタムレポートの柔軟性") */
  title: string
  evidence: PriorityEvidence[]
}

export const MOCK_PRIORITY_ITEMS: PriorityItem[] = []
