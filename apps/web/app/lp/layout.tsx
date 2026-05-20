import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
  title: 'ルキスマCRM｜営業データから、何でも答えるチャットCRM',
  description:
    '営業データから、何でも答えるチャットCRM。商談・メール・議事録・求人インテント・290万社DBを横断し、あなたの会社のデータを踏まえて答えます。',
  keywords: [
    'ルキスマCRM', 'RookieSmart', 'CRM',
    'マーケティングオートメーション', 'MA', 'カスタマーサポート',
    'ヘルプデスク', 'ナレッジ', 'インテントデータ', '議事録AI', 'RAG',
    '営業DX', 'PDM', 'AIエージェント', 'Agentic',
  ],
  openGraph: {
    title: 'ルキスマCRM｜営業データから、何でも答えるチャットCRM',
    description:
      '商談・メール・議事録・求人インテント・290万社DBを横断し、営業データから次の答えを返すチャットCRM。',
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
