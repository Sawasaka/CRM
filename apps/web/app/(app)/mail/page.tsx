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

const MAIL_TAB_SHELL =
  'linear-gradient(145deg, rgba(22,23,27,0.58) 0%, rgba(14,15,18,0.86) 100%)'
const MAIL_TAB_ACTIVE =
  'linear-gradient(140deg, #9fc3ff 0%, #2f8cff 62%, #0071e3 100%)'
const MAIL_TAB_INACTIVE = 'linear-gradient(145deg, rgba(255,255,255,0.018), rgba(255,255,255,0.006))'

export default function MailPage() {
  const [tab, setTab] = useState<Tab>('send')

  return (
    <ObsPageShell>
      <div className="w-full px-8 xl:px-12 2xl:px-16 pb-16">
        <ObsHero
          eyebrow="Marketing"
          title="メール配信"
          titleAccent="配信"
          caption="ISリスト配信から資料クリック・返信計測までを1画面で管理。"
        />

        {/* Tab nav */}
        <div
          className="inline-flex items-center p-1 rounded-[var(--radius-obs-md)] mb-6 gap-1"
          style={{
            background: MAIL_TAB_SHELL,
            boxShadow: 'inset 0 0 0 1px rgba(171,199,255,0.085), inset 1px 1px 0 rgba(255,255,255,0.025), 0 14px 36px rgba(0,0,0,0.24)',
          }}
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
                  background: active ? MAIL_TAB_ACTIVE : MAIL_TAB_INACTIVE,
                  color: active ? 'var(--color-obs-on-primary)' : 'var(--color-obs-text-muted)',
                  boxShadow: active
                    ? 'inset 0 1px 0 rgba(255,255,255,0.26), 0 0 22px rgba(47,140,255,0.32)'
                    : 'inset 0 0 0 1px rgba(171,199,255,0.05)',
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
