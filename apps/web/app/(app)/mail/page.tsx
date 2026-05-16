'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Activity, FileStack } from 'lucide-react'
import { ObsPageShell, ObsHero } from '@/components/obsidian'
import { CampaignsView } from '@/components/marketing/CampaignsView'
import { LinkDocsView } from '@/components/marketing/LinkDocsView'
import { FirstPartyView } from '@/components/marketing/FirstPartyView'

type Tab = 'send' | 'docs' | 'firstparty'

const TABS: { key: Tab; label: string; icon: React.ElementType }[] = [
  { key: 'send',       label: '配信',           icon: Send },
  { key: 'docs',       label: '資料リンク化',   icon: FileStack },
  { key: 'firstparty', label: '1stパーティ設定', icon: Activity },
]

export default function MailPage() {
  const [tab, setTab] = useState<Tab>('send')

  return (
    <ObsPageShell>
      <div className="w-full px-8 xl:px-12 2xl:px-16 pb-16">
        <ObsHero
          eyebrow="Marketing"
          title="メール配信"
          caption="リスト一斉配信からファーストパーティ計測、資料リンク配布までを1画面で。"
        />

        {/* Tab nav */}
        <div
          className="inline-flex items-center p-1 rounded-[var(--radius-obs-md)] mb-6 gap-1"
          style={{ backgroundColor: 'var(--color-obs-surface-high)' }}
        >
          {TABS.map((t) => {
            const active = tab === t.key
            const Icon = t.icon
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className="inline-flex items-center gap-1.5 h-9 px-4 rounded-[calc(var(--radius-obs-md)-2px)] text-[13px] font-medium transition-colors"
                style={{
                  backgroundColor: active ? 'var(--color-obs-primary-container)' : 'transparent',
                  color: active ? 'var(--color-obs-on-primary)' : 'var(--color-obs-text-muted)',
                }}
              >
                <Icon size={14} />
                {t.label}
              </button>
            )
          })}
        </div>

        {/* Tab content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
          >
            {tab === 'send' && <CampaignsView />}
            {tab === 'docs' && <LinkDocsView />}
            {tab === 'firstparty' && <FirstPartyView />}
          </motion.div>
        </AnimatePresence>
      </div>
    </ObsPageShell>
  )
}
