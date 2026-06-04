'use client'

import { useState } from 'react'
import { ViewTransitionLink } from '@/components/view-transitions'
import DragonGuide from './DragonGuide'
import SalesPsychologyGuide from './SalesPsychologyGuide'
import SalesSchoolGuide from './SalesSchoolGuide'

type TabKey = 'dragon' | 'psychology' | 'school'

const TABS: { key: TabKey; label: string; accent: string }[] = [
  { key: 'dragon', label: '営業ドラゴン図鑑', accent: '#d7ad59' },
  { key: 'psychology', label: '営業武器庫', accent: '#d7ad59' },
  { key: 'school', label: '営業スクール', accent: '#7dd9b5' },
]

export default function SalesMediaHub({ initialTab = 'dragon' }: { initialTab?: TabKey }) {
  const [active, setActive] = useState<TabKey>(initialTab)

  return (
    <div className="bg-[#071a28]">
      {/* スイッチ型タブ (ページ遷移なし・state切替) */}
      <div className="sticky top-0 z-[60] flex justify-start overflow-x-auto border-b border-[#d7ad59]/15 bg-[#071a28]/94 px-4 py-2.5 backdrop-blur-xl sm:justify-center">
        <div
          className="inline-flex min-w-max items-center gap-1 rounded-full p-1"
          style={{
            background: 'rgba(6, 23, 39, 0.78)',
            boxShadow: 'inset 0 0 0 1px rgba(215, 173, 89, 0.18), 0 12px 28px -22px rgba(0,0,0,0.9)',
          }}
          role="tablist"
          aria-label="メディアカテゴリ"
        >
          {/* HOME(ルキスマCRM): LPへ戻るリンク。クロスフェードで遷移 */}
          <ViewTransitionLink
            href="/lp"
            className="inline-flex h-9 items-center whitespace-nowrap rounded-full px-3 text-[12px] font-black text-[#fff3d8]/65 transition-colors duration-200 hover:bg-[#d7ad59]/12 hover:text-[#f2cb77] sm:px-5 sm:text-[13px]"
          >
            ルキスマCRM
          </ViewTransitionLink>
          {TABS.map((tab) => {
            const isActive = tab.key === active
            return (
              <button
                key={tab.key}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setActive(tab.key)}
                className="inline-flex h-9 items-center whitespace-nowrap rounded-full px-3 text-[12px] font-black transition-all duration-200 sm:px-5 sm:text-[13px]"
                style={
                  isActive
                    ? {
                        background: `linear-gradient(135deg, ${tab.accent}, ${tab.accent}cc)`,
                        color: '#04141d',
                        boxShadow: `inset 0 1px 0 rgba(255,255,255,0.45), 0 6px 18px -8px ${tab.accent}aa`,
                      }
                    : { color: 'rgba(255, 243, 216, 0.64)', background: 'transparent' }
                }
              >
                {tab.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* コンテンツ (タブ切替でフェード). key で再マウントしアニメを再生 */}
      <div key={active} className="fo-word-in">
        {active === 'dragon' ? <DragonGuide /> : active === 'psychology' ? <SalesPsychologyGuide /> : <SalesSchoolGuide />}
      </div>
    </div>
  )
}
