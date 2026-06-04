'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Search, Tag, Building2 } from 'lucide-react'
import {
  ObsPageShell,
  ObsHero,
  ObsCard,
  ObsChip,
  ObsInput,
} from '@/components/obsidian'

// ─── Types ──────────────────────────────────────────────────────────────────

type Category = 'UX/UI' | 'インテグレーション' | 'パフォーマンス' | 'セキュリティ' | '機能要望' | 'サポート'
type SourceType = '新規' | '既存'

interface Issue {
  id: string
  title: string
  category: Category
  occurrences: number
  newCount: number
  existingCount: number
  companies: string[]
  relatedMeetings: string[]
}

// ─── Mock Data ──────────────────────────────────────────────────────────────

const MOCK_ISSUES: Issue[] = []

const ALL_CATEGORIES: Category[] = ['UX/UI', 'インテグレーション', 'パフォーマンス', 'セキュリティ', '機能要望', 'サポート']

// ─── Page ───────────────────────────────────────────────────────────────────

export default function IssuesPage() {
  const [search, setSearch] = useState('')
  const [filterCategory, setFilterCategory] = useState<Category | ''>('')
  const [filterSource, setFilterSource] = useState<SourceType | ''>('')

  const filtered = useMemo(() => {
    let list = MOCK_ISSUES
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(i => i.title.toLowerCase().includes(q) || i.companies.some(c => c.toLowerCase().includes(q)))
    }
    if (filterCategory) list = list.filter(i => i.category === filterCategory)
    if (filterSource === '新規') list = list.filter(i => i.newCount > 0)
    if (filterSource === '既存') list = list.filter(i => i.existingCount > 0)
    return list.sort((a, b) => b.occurrences - a.occurrences)
  }, [search, filterCategory, filterSource])

  const maxOccurrences = Math.max(...MOCK_ISSUES.map(i => i.occurrences))
  const relatedCompanies = new Set(MOCK_ISSUES.flatMap(i => i.companies)).size

  return (
    <ObsPageShell>
      <div className="w-full px-8 xl:px-12 2xl:px-16 pb-16">
        {/* ── Hero ── */}
        <ObsHero
          eyebrow="Issue Board"
          title="課題ボード"
          caption="顧客から抽出された課題・ニーズを一元管理。出現頻度と新規／既存比率で全体像を把握。"
          action={
            <div className="flex items-center gap-4 text-[13px]">
              <div className="flex flex-col items-end">
                <span
                  className="text-[10px] font-medium uppercase tracking-[0.1em]"
                  style={{ color: 'var(--color-obs-text-subtle)' }}
                >
                  課題数
                </span>
                <span
                  className="text-[20px] font-bold tabular-nums"
                  style={{ color: 'var(--color-obs-text)' }}
                >
                  {MOCK_ISSUES.length}
                </span>
              </div>
              <div className="flex flex-col items-end">
                <span
                  className="text-[10px] font-medium uppercase tracking-[0.1em]"
                  style={{ color: 'var(--color-obs-text-subtle)' }}
                >
                  関連企業
                </span>
                <span
                  className="text-[20px] font-bold tabular-nums"
                  style={{ color: 'var(--color-obs-primary)' }}
                >
                  {relatedCompanies}
                </span>
              </div>
            </div>
          }
        />

        {/* ── Filters ── */}
        <div className="flex items-center gap-3 mb-6 flex-wrap">
          <div className="relative flex-1 min-w-[240px] max-w-sm">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none z-10"
              style={{ color: 'var(--color-obs-text-subtle)' }}
            />
            <ObsInput
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="課題・企業名を検索..."
              className="pl-10"
            />
          </div>

          {/* Category filter */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => setFilterCategory('')}
              className="h-8 px-3 text-[12px] font-medium rounded-full transition-colors duration-150"
              style={{
                backgroundColor: !filterCategory ? 'var(--color-obs-primary-container)' : 'var(--color-obs-surface-high)',
                color: !filterCategory ? 'var(--color-obs-on-primary)' : 'var(--color-obs-text-muted)',
              }}
            >
              全カテゴリ
            </button>
            {ALL_CATEGORIES.map(cat => {
              const active = filterCategory === cat
              return (
                <button
                  key={cat}
                  onClick={() => setFilterCategory(prev => prev === cat ? '' : cat)}
                  className="h-8 px-3 text-[12px] font-medium rounded-full transition-colors duration-150"
                  style={{
                    backgroundColor: active ? 'var(--color-obs-primary-container)' : 'var(--color-obs-surface-high)',
                    color: active ? 'var(--color-obs-on-primary)' : 'var(--color-obs-text-muted)',
                  }}
                >
                  {cat}
                </button>
              )
            })}
          </div>

          {/* Source filter */}
          <div className="flex items-center gap-1.5 ml-auto">
            {(['', '新規', '既存'] as (SourceType | '')[]).map(s => {
              const active = filterSource === s
              return (
                <button
                  key={s || 'all'}
                  onClick={() => setFilterSource(s)}
                  className="h-8 px-3 text-[12px] font-medium rounded-full transition-colors duration-150"
                  style={{
                    backgroundColor: active ? 'var(--color-obs-primary-container)' : 'var(--color-obs-surface-high)',
                    color: active ? 'var(--color-obs-on-primary)' : 'var(--color-obs-text-muted)',
                  }}
                >
                  {s || '全て'}
                </button>
              )
            })}
          </div>
        </div>

        {/* ── Issues Table ── */}
        <ObsCard depth="low" padding="none" radius="xl">
          {/* Header */}
          <div
            className="grid items-center px-6 py-4 text-[11px] font-medium tracking-[0.1em] uppercase"
            style={{
              gridTemplateColumns: '1fr 120px 160px 140px',
              color: 'var(--color-obs-text-subtle)',
            }}
          >
            <span>課題</span>
            <span>出現数</span>
            <span>新規 / 既存</span>
            <span>カテゴリ</span>
          </div>

          {/* Rows */}
          {filtered.map((issue, i) => {
            const barWidth = (issue.occurrences / maxOccurrences) * 100
            return (
              <motion.div
                key={issue.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: i * 0.03 }}
                className="grid items-center px-6 py-4 cursor-pointer transition-colors duration-150"
                style={{ gridTemplateColumns: '1fr 120px 160px 140px' }}
                onMouseOver={(e) => {
                  ;(e.currentTarget as HTMLDivElement).style.backgroundColor = 'var(--color-obs-surface-high)'
                }}
                onMouseOut={(e) => {
                  ;(e.currentTarget as HTMLDivElement).style.backgroundColor = 'transparent'
                }}
              >
                {/* 課題名 + 企業 */}
                <div className="min-w-0 pr-4">
                  <p
                    className="text-[13.5px] font-medium truncate"
                    style={{ color: 'var(--color-obs-text)' }}
                  >
                    {issue.title}
                  </p>
                  <p
                    className="text-[11px] mt-1 truncate flex items-center gap-1.5"
                    style={{ color: 'var(--color-obs-text-subtle)' }}
                  >
                    <Building2 size={10} />
                    {issue.companies.join('、')}
                  </p>
                </div>

                {/* 出現数バー */}
                <div className="flex items-center gap-2 pr-4">
                  <div
                    className="flex-1 h-[5px] rounded-full overflow-hidden"
                    style={{ backgroundColor: 'var(--color-obs-surface-high)' }}
                  >
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${barWidth}%`, backgroundColor: 'var(--color-obs-primary)' }}
                    />
                  </div>
                  <span
                    className="text-[13px] font-semibold tabular-nums w-5 text-right"
                    style={{ color: 'var(--color-obs-text)' }}
                  >
                    {issue.occurrences}
                  </span>
                </div>

                {/* 新規/既存 内訳 */}
                <div className="flex items-center gap-2 pr-4">
                  <div
                    className="flex-1 h-[5px] rounded-full overflow-hidden flex"
                    style={{ backgroundColor: 'var(--color-obs-surface-high)' }}
                  >
                    {issue.newCount > 0 && (
                      <div
                        className="h-full"
                        style={{
                          width: `${(issue.newCount / issue.occurrences) * 100}%`,
                          backgroundColor: 'var(--color-obs-primary)',
                        }}
                      />
                    )}
                    {issue.existingCount > 0 && (
                      <div
                        className="h-full"
                        style={{
                          width: `${(issue.existingCount / issue.occurrences) * 100}%`,
                          backgroundColor: 'var(--color-obs-low)',
                        }}
                      />
                    )}
                  </div>
                  <span
                    className="text-[11px] tabular-nums shrink-0"
                    style={{ color: 'var(--color-obs-text-muted)' }}
                  >
                    {issue.newCount} / {issue.existingCount}
                  </span>
                </div>

                {/* カテゴリ */}
                <div>
                  <ObsChip tone="primary">
                    <Tag size={10} />
                    {issue.category}
                  </ObsChip>
                </div>
              </motion.div>
            )
          })}
        </ObsCard>

        {/* Legend */}
        <div
          className="flex items-center gap-5 mt-4 text-[11px]"
          style={{ color: 'var(--color-obs-text-subtle)' }}
        >
          <span className="flex items-center gap-1.5">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: 'var(--color-obs-primary)' }}
            />
            新規顧客
          </span>
          <span className="flex items-center gap-1.5">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: 'var(--color-obs-low)' }}
            />
            既存顧客
          </span>
        </div>
      </div>
    </ObsPageShell>
  )
}
