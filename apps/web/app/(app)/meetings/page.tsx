'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { FileText, Users, Clock, Tag, ChevronRight, Search } from 'lucide-react'
import {
  ObsButton,
  ObsCard,
  ObsChip,
  ObsHero,
  ObsInput,
  ObsPageShell,
} from '@/components/obsidian'

// ─── Types ──────────────────────────────────────────────────────────────────

type CustomerType = '新規顧客' | '既存顧客'
type FilterTab = 'all' | '新規顧客' | '既存顧客'

interface Meeting {
  id: string
  title: string
  customerName: string
  customerType: CustomerType
  date: string
  duration: string
  participants: string[]
  issueCount: number
  summary: string
  issues: string[]
}

// ─── Mock Data ──────────────────────────────────────────────────────────────

const MOCK_MEETINGS: Meeting[] = []

// ─── Page ───────────────────────────────────────────────────────────────────

export default function MeetingsPage() {
  const [tab, setTab] = useState<FilterTab>('all')
  const [search, setSearch] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const filtered = useMemo(() => {
    let list = MOCK_MEETINGS
    if (tab !== 'all') list = list.filter(m => m.customerType === tab)
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(m =>
        m.title.toLowerCase().includes(q) ||
        m.customerName.toLowerCase().includes(q) ||
        m.issues.some(i => i.toLowerCase().includes(q))
      )
    }
    return list
  }, [tab, search])

  const newCount = MOCK_MEETINGS.filter(m => m.customerType === '新規顧客').length
  const existingCount = MOCK_MEETINGS.filter(m => m.customerType === '既存顧客').length
  const totalIssues = MOCK_MEETINGS.reduce((s, m) => s + m.issueCount, 0)

  return (
    <ObsPageShell>
      <div className="w-full px-8 xl:px-12 2xl:px-16 pb-16">
        <ObsHero
          eyebrow="Meeting Notes"
          title="議事録"
          caption="顧客ヒアリングから課題・ニーズを抽出し、開発優先度へ反映する。"
          action={
            <div className="flex items-center gap-3">
              <ObsChip tone="primary">合計 {MOCK_MEETINGS.length}</ObsChip>
              <ObsChip tone="hot">課題 {totalIssues}</ObsChip>
            </div>
          }
        />

        {/* Tabs + Search */}
        <div className="flex items-center justify-between gap-3 mb-6 flex-wrap">
          <div className="flex items-center gap-2">
            {([
              { key: 'all' as FilterTab, label: '全て', count: MOCK_MEETINGS.length },
              { key: '新規顧客' as FilterTab, label: '新規顧客', count: newCount },
              { key: '既存顧客' as FilterTab, label: '既存顧客', count: existingCount },
            ]).map(t => (
              <ObsButton
                key={t.key}
                variant={tab === t.key ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setTab(t.key)}
              >
                {t.label}
                <span className="ml-1.5 opacity-70 tabular-nums">{t.count}</span>
              </ObsButton>
            ))}
          </div>
          <div className="relative w-[240px]">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: 'var(--color-obs-text-subtle)' }}
            />
            <ObsInput
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="議事録・課題を検索..."
              className="pl-9"
            />
          </div>
        </div>

        {/* Meeting Cards */}
        <div className="flex flex-col gap-3">
          {filtered.map((meeting, i) => {
            const isExpanded = expandedId === meeting.id
            const typeTone = meeting.customerType === '新規顧客' ? 'primary' : 'low'
            return (
              <motion.div
                key={meeting.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: i * 0.04, ease: [0.16, 1, 0.3, 1] }}
              >
                <ObsCard
                  depth="high"
                  padding="none"
                  radius="lg"
                  className="overflow-hidden cursor-pointer transition-colors duration-150"
                  onClick={() => setExpandedId(isExpanded ? null : meeting.id)}
                >
                  <div className="flex items-center gap-4 px-5 py-4">
                    <div
                      className="w-10 h-10 rounded-[var(--radius-obs-md)] flex items-center justify-center shrink-0"
                      style={{ backgroundColor: 'var(--color-obs-surface-highest)' }}
                    >
                      <FileText size={16} style={{ color: 'var(--color-obs-primary)' }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p
                          className="text-[14px] font-semibold truncate tracking-[-0.01em]"
                          style={{ color: 'var(--color-obs-text)' }}
                        >
                          {meeting.title}
                        </p>
                        <ObsChip tone={typeTone}>{meeting.customerType}</ObsChip>
                      </div>
                      <div
                        className="flex items-center gap-3 text-[12px]"
                        style={{ color: 'var(--color-obs-text-muted)' }}
                      >
                        <span>{meeting.customerName}</span>
                        <span className="flex items-center gap-1"><Clock size={10} />{meeting.date} · {meeting.duration}</span>
                        <span className="flex items-center gap-1"><Users size={10} />{meeting.participants.length}名</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span
                        className="flex items-center gap-1 text-[12px] font-semibold"
                        style={{ color: 'var(--color-obs-hot)' }}
                      >
                        <Tag size={11} />
                        {meeting.issueCount}件
                      </span>
                      <motion.div animate={{ rotate: isExpanded ? 90 : 0 }} transition={{ duration: 0.15 }}>
                        <ChevronRight size={14} style={{ color: 'var(--color-obs-text-subtle)' }} />
                      </motion.div>
                    </div>
                  </div>

                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                      style={{ backgroundColor: 'var(--color-obs-surface-low)' }}
                    >
                      <div className="px-5 py-5">
                        <p
                          className="text-[13px] mb-4 leading-relaxed"
                          style={{ color: 'var(--color-obs-text-muted)' }}
                        >
                          {meeting.summary}
                        </p>
                        <div>
                          <p
                            className="text-[11px] font-medium uppercase tracking-[0.08em] mb-2"
                            style={{ color: 'var(--color-obs-text-subtle)' }}
                          >
                            抽出された課題
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {meeting.issues.map((issue, j) => (
                              <ObsChip key={j} tone="hot">{issue}</ObsChip>
                            ))}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </ObsCard>
              </motion.div>
            )
          })}
        </div>
      </div>
    </ObsPageShell>
  )
}
