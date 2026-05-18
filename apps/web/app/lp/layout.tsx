import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
  title: 'ルキスマCRM｜営業データから、何でも答えるチャットCRM',
  description:
    '営業もマーケも開発もサポートも、すべての情報をチャットで呼び出せる。CRM／マーケティングオートメーション／ヘルプデスク／カスタマーサポート／PDMを統合し、議事録・メール・コールから自動でデータが溜まり続けるチャットCRM。290万社の企業データと4部門インテントを標準搭載。',
  keywords: [
    'ルキスマCRM', 'RookieSmart', 'CRM',
    'マーケティングオートメーション', 'MA', 'カスタマーサポート',
    'ヘルプデスク', 'ナレッジ', 'インテントデータ', '議事録AI', 'RAG',
    '営業DX', 'PDM', 'AIエージェント', 'Agentic',
  ],
  openGraph: {
    title: 'ルキスマCRM｜営業データから、何でも答えるチャットCRM',
    description:
      'CRM・MA・ヘルプデスク・カスタマーサポート・PDMを統合し、5体のAIエージェントが稼働するチャットCRM。',
    type: 'website',
  },
}

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="bg-obsidian text-[#e7e5ea] min-h-screen">
      {children}
    </div>
  )
}
