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

export const MOCK_PRIORITY_ITEMS: PriorityItem[] = [
  {
    id: 'demo-priority-need-1',
    category: 'ニーズ',
    title: '求人インテントが出た部署を、営業リストへ自動反映したい',
    evidence: [
      {
        companyId: 'demo-company-td',
        companyName: '株式会社T&Dホールディングス',
        meetingDate: '2026-06-03',
        quote: 'HOTになった部署を毎朝確認して、ISリストに自動で入ると助かります。',
        meetingDocUrl: '#',
        sourceType: 'meeting',
      },
      {
        companyId: 'demo-company-ntt',
        companyName: '株式会社NTT',
        meetingDate: '2026-06-04',
        quote: '部署別の動きがわかれば、担当者の優先順位をもっと明確にできます。',
        meetingDocUrl: '#',
        sourceType: 'meeting',
      },
      {
        companyId: 'demo-company-sms',
        companyName: '株式会社エス・エム・エス',
        meetingDate: '2026-06-06',
        quote: '医療・介護系の採用意欲がある企業だけを抽出して追いたいです。',
        meetingDocUrl: '#',
        sourceType: 'meeting',
      },
    ],
  },
  {
    id: 'demo-priority-need-2',
    category: 'ニーズ',
    title: '配信クリックから商談化までの流れを担当者別に見たい',
    evidence: [
      {
        companyId: 'demo-company-m3',
        companyName: '株式会社エムスリー',
        meetingDate: '2026-06-05',
        quote: 'メール配信のクリックが、どの商談につながったかを一画面で見たいです。',
        meetingDocUrl: '#',
        sourceType: 'meeting',
      },
      {
        companyId: 'demo-company-eneos',
        companyName: '株式会社ENEOSホールディングス',
        meetingDate: '2026-06-07',
        quote: 'マーケ施策と営業活動が分断されているので、同じボードで見たいです。',
        meetingDocUrl: '#',
        sourceType: 'meeting',
      },
    ],
  },
  {
    id: 'demo-priority-issue-1',
    category: '課題',
    title: '部署番号や採用予算の根拠を顧客説明で使える形にしたい',
    evidence: [
      {
        companyId: 'demo-company-td',
        companyName: '株式会社T&Dホールディングス',
        meetingDate: '2026-06-03',
        quote: '営業先に説明する時、なぜこの部署がHOTなのか根拠を出したいです。',
        meetingDocUrl: '#',
        sourceType: 'meeting',
      },
      {
        companyId: 'demo-company-ntt',
        companyName: '株式会社NTT',
        meetingDate: '2026-06-04',
        quote: '採用予算や部署番号の見方を、営業メンバーにも共有しやすくしたいです。',
        meetingDocUrl: '#',
        sourceType: 'meeting',
      },
    ],
  },
  {
    id: 'demo-priority-issue-2',
    category: '課題',
    title: '問い合わせ対応の履歴が商談画面と分かれてしまう',
    evidence: [
      {
        companyId: 'demo-company-eneos',
        companyName: '株式会社ENEOSホールディングス',
        meetingDate: '2026-06-07',
        quote: 'PoC中の問い合わせと商談メモが別々だと、担当者変更時に追いにくいです。',
        meetingDocUrl: '#',
        sourceType: 'ticket',
      },
    ],
  },
]
