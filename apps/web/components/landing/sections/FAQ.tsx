'use client'

import { useState } from 'react'
import { Plus, Minus } from 'lucide-react'
import { Eyebrow, Section } from '../atoms'

const ITEMS: Array<[string, string]> = [
  ['ルキスマCRMとは何ですか？', '株式会社ルーキースマートジャパンが提供する、営業データ・商談・メール・議事録・企業DBを横断して回答するチャット型AI CRMです。'],
  ['株式会社ルーキースマートジャパンはどのサービスを提供していますか？', '営業データから次の営業アクションを引き出す、ルーキースマートCRM（ルキスマCRM）を提供しています。'],
  ['既存のCRM（Salesforce等）と併用できますか？', 'はい、双方向連携可能です。差分検知 + マージルールで二重入力を避けます。'],
  ['エージェントは勝手に動くのですか？', 'すべてのエージェント実行は人間が承認・上書き可能です。承認モードと自動実行モードを項目単位で選べます。'],
  ['データは他社に見られませんか？', 'PostgreSQL Row-Level Security でDBレベルから物理遮断。テナント間は同一クエリでも結果が混ざりません。'],
  ['ファイルはどう守られていますか？', 'テナントごとprefix分離 + 5分失効 Signed URL。生のファイルパスはユーザーには露出しません。'],
  ['4ツールを契約するより本当に安いですか？', '30名規模で月¥6Mが¥90Kに。約97%削減です。詳細はROIセクションをご覧ください。'],
  ['社内で内製しても良いのでは？', '同等機能の内製は3年TCO約1.05億円。ルキスマCRMは約1,080万円（約90%削減）です。'],
  ['解約はいつでも可能ですか？', '月単位で解約可能。データはCSV/JSONで30日間ダウンロード可能です。'],
]

export const FAQ = () => {
  const [open, setOpen] = useState<number>(0)
  return (
    <Section tone="obsidian" screenLabel="18 FAQ">
      <div className="relative mx-auto max-w-4xl px-6 py-32 md:py-40">
        <div className="text-center mb-14">
          <Eyebrow color="#abc7ff" className="justify-center">FAQ</Eyebrow>
          <h2 className="font-display font-bold tracking-[-0.025em] text-[2.2rem] md:text-[3rem] leading-[1.06] mt-5">
            よくある<span className="fo-gradient-text-soft">質問。</span>
          </h2>
        </div>
        <div className="space-y-2">
          {ITEMS.map(([q, a], i) => {
            const isOpen = open === i
            return (
              <div
                key={i}
                className="rounded-2xl px-6 py-5"
                style={{ background: '#1f1f21', boxShadow: 'inset 0 0 0 1px rgba(65,71,83,0.18)' }}
              >
                <button
                  onClick={() => setOpen(isOpen ? -1 : i)}
                  className="w-full flex items-start justify-between gap-4 text-left"
                >
                  <span className="text-[#e7e5ea] text-[1rem]">
                    <span className="text-aurora font-mono mr-3">Q.</span>{q}
                  </span>
                  <span className="shrink-0 mt-1 text-aurora">
                    {isOpen ? <Minus size={16} color="#abc7ff" /> : <Plus size={16} color="#abc7ff" />}
                  </span>
                </button>
                {isOpen && (
                  <div className="mt-4 text-[#c7c5c9] text-sm leading-relaxed pl-7">
                    <span className="text-mint font-mono mr-3">A.</span>{a}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </Section>
  )
}
