'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, FileText, Eye, Users, Copy, Upload, X, Link2 } from 'lucide-react'
import type { ManagedDocument } from '@/types/crm'
import {
  ObsPageShell,
  ObsHero,
  ObsCard,
  ObsChip,
  ObsButton,
  ObsInput,
} from '@/components/obsidian'

// ─── Mock Data ───────────────────────────────────────────────────────────────

const MOCK_DOCS: ManagedDocument[] = []

const TYPE_LABELS: Record<string, string> = {
  proposal: '提案書', service_intro: 'サービス紹介', case_study: '事例集', pricing: '料金表', other: 'その他',
}

function formatSize(bytes: number) {
  if (bytes >= 1000000) return `${(bytes / 1000000).toFixed(1)}MB`
  return `${Math.round(bytes / 1000)}KB`
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function DocumentsPage() {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [showUpload, setShowUpload] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)

  const filtered = useMemo(() => {
    let list = MOCK_DOCS
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(d => d.name.toLowerCase().includes(q) || d.tags.some(t => t.toLowerCase().includes(q)))
    }
    if (typeFilter !== 'all') list = list.filter(d => d.type === typeFilter)
    return list
  }, [search, typeFilter])

  const totalViews = MOCK_DOCS.reduce((s, d) => s + d.totalViews, 0)
  const totalUnique = MOCK_DOCS.reduce((s, d) => s + d.uniqueViewers, 0)

  const handleCopy = (url: string, id: string) => {
    navigator.clipboard.writeText(url)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <ObsPageShell>
      <div className="w-full px-8 xl:px-12 2xl:px-16 pb-16">
        {/* ── Hero ── */}
        <ObsHero
          eyebrow="Documents"
          title="リンク資料"
          caption="営業資料のアップロード・リンク生成・閲覧分析をシームレスに。"
          action={
            <ObsButton variant="primary" size="md" onClick={() => setShowUpload(true)}>
              <span className="inline-flex items-center gap-1.5">
                <Upload size={13} />
                資料アップロード
              </span>
            </ObsButton>
          }
        />

        {/* ── KPI ── */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            { label: '総資料数', value: MOCK_DOCS.length },
            { label: '総閲覧数', value: totalViews },
            { label: 'ユニーク閲覧者', value: totalUnique },
            { label: '公開中', value: MOCK_DOCS.filter(d => d.isPublished).length },
          ].map((kpi, i) => (
            <motion.div
              key={kpi.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.28, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
            >
              <ObsCard depth="high" padding="md" radius="lg">
                <p
                  className="text-[11px] font-medium uppercase tracking-[0.1em]"
                  style={{ color: 'var(--color-obs-text-subtle)' }}
                >
                  {kpi.label}
                </p>
                <p
                  className="text-[26px] font-bold tracking-[-0.03em] mt-1.5 tabular-nums"
                  style={{ color: 'var(--color-obs-text)' }}
                >
                  {kpi.value}
                </p>
              </ObsCard>
            </motion.div>
          ))}
        </div>

        {/* ── Toolbar ── */}
        <div className="flex items-center gap-3 mb-6 flex-wrap">
          <div className="relative flex-1 min-w-[280px] max-w-md">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none z-10"
              style={{ color: 'var(--color-obs-text-subtle)' }}
            />
            <ObsInput
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="資料名・タグで検索..."
              className="pl-10"
            />
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            {[{ key: 'all', label: '全て' }, ...Object.entries(TYPE_LABELS).map(([k, v]) => ({ key: k, label: v }))].map(f => {
              const active = typeFilter === f.key
              return (
                <button
                  key={f.key}
                  onClick={() => setTypeFilter(f.key)}
                  className="h-8 px-3 text-[12px] font-medium rounded-full transition-colors duration-150"
                  style={{
                    backgroundColor: active ? 'var(--color-obs-primary-container)' : 'var(--color-obs-surface-high)',
                    color: active ? 'var(--color-obs-on-primary)' : 'var(--color-obs-text-muted)',
                  }}
                >
                  {f.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* ── Document cards ── */}
        <div className="grid grid-cols-3 gap-4">
          {filtered.map((doc, i) => (
            <motion.div
              key={doc.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.28, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
            >
              <ObsCard
                depth="high"
                padding="md"
                radius="xl"
                onClick={() => router.push(`/documents/${doc.id}`)}
                className="group"
              >
                <div className="flex items-start gap-3 mb-4">
                  <div
                    className="w-10 h-10 rounded-[var(--radius-obs-md)] flex items-center justify-center shrink-0"
                    style={{ backgroundColor: 'var(--color-obs-surface-highest)' }}
                  >
                    <FileText size={18} style={{ color: 'var(--color-obs-primary)' }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-[14px] font-semibold truncate leading-tight"
                      style={{ color: 'var(--color-obs-text)' }}
                    >
                      {doc.name}
                    </p>
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      <ObsChip tone="primary">{TYPE_LABELS[doc.type]}</ObsChip>
                      <span className="text-[11px]" style={{ color: 'var(--color-obs-text-subtle)' }}>
                        {doc.totalPages}ページ
                      </span>
                      <span className="text-[11px]" style={{ color: 'var(--color-obs-text-subtle)' }}>
                        {formatSize(doc.fileSize)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-1.5">
                    <Eye size={12} style={{ color: 'var(--color-obs-text-muted)' }} />
                    <span
                      className="text-[12px] font-semibold tabular-nums"
                      style={{ color: 'var(--color-obs-text)' }}
                    >
                      {doc.totalViews}
                    </span>
                    <span className="text-[11px]" style={{ color: 'var(--color-obs-text-subtle)' }}>
                      閲覧
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Users size={12} style={{ color: 'var(--color-obs-text-muted)' }} />
                    <span
                      className="text-[12px] font-semibold tabular-nums"
                      style={{ color: 'var(--color-obs-text)' }}
                    >
                      {doc.uniqueViewers}
                    </span>
                    <span className="text-[11px]" style={{ color: 'var(--color-obs-text-subtle)' }}>
                      ユニーク
                    </span>
                  </div>
                  {!doc.isPublished && <ObsChip tone="neutral">非公開</ObsChip>}
                </div>

                <button
                  onClick={e => {
                    e.stopPropagation()
                    handleCopy(doc.trackingUrl, doc.id)
                  }}
                  className="w-full h-9 flex items-center justify-center gap-1.5 text-[12px] font-medium rounded-[var(--radius-obs-md)] transition-colors duration-150"
                  style={{
                    backgroundColor: copied === doc.id
                      ? 'rgba(126,198,255,0.14)'
                      : 'var(--color-obs-surface-highest)',
                    color: copied === doc.id ? 'var(--color-obs-low)' : 'var(--color-obs-text-muted)',
                  }}
                >
                  {copied === doc.id ? (
                    <>
                      <Link2 size={12} />
                      コピー済み
                    </>
                  ) : (
                    <>
                      <Copy size={12} />
                      URLコピー
                    </>
                  )}
                </button>
              </ObsCard>
            </motion.div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <p className="text-[14px]" style={{ color: 'var(--color-obs-text-muted)' }}>
              資料が見つかりません
            </p>
          </div>
        )}

        {/* ── Upload Modal ── */}
        <AnimatePresence>
          {showUpload && (
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div
                className="absolute inset-0"
                style={{ backgroundColor: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(8px)' }}
                onClick={() => setShowUpload(false)}
              />
              <motion.div
                className="relative w-[480px]"
                initial={{ opacity: 0, scale: 0.96, y: 8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: 8 }}
                transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              >
                <ObsCard depth="highest" padding="lg" radius="2xl">
                  <div className="flex items-center justify-between mb-5">
                    <h2
                      className="text-[17px] font-semibold tracking-[-0.02em]"
                      style={{ color: 'var(--color-obs-text)' }}
                    >
                      資料アップロード
                    </h2>
                    <button
                      onClick={() => setShowUpload(false)}
                      className="p-1.5 rounded-full transition-colors hover:bg-[var(--color-obs-surface-high)]"
                    >
                      <X size={16} style={{ color: 'var(--color-obs-text-muted)' }} />
                    </button>
                  </div>

                  <div
                    className="rounded-[var(--radius-obs-lg)] p-8 text-center mb-4 transition-colors"
                    style={{ backgroundColor: 'var(--color-obs-surface-low)' }}
                  >
                    <Upload size={32} style={{ color: 'var(--color-obs-text-muted)' }} className="mx-auto mb-3" />
                    <p className="text-[14px] font-medium" style={{ color: 'var(--color-obs-text)' }}>
                      ファイルをドラッグ&ドロップ
                    </p>
                    <p className="text-[12px] mt-1" style={{ color: 'var(--color-obs-text-subtle)' }}>
                      PDF, PPTX, DOCX (最大50MB)
                    </p>
                    <div className="mt-3">
                      <ObsButton variant="tertiary" size="sm">
                        ファイルを選択
                      </ObsButton>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label
                        className="text-[11px] font-medium uppercase tracking-[0.1em]"
                        style={{ color: 'var(--color-obs-text-subtle)' }}
                      >
                        資料名
                      </label>
                      <div className="mt-1.5">
                        <ObsInput placeholder="例: サービス紹介資料 v2.1" />
                      </div>
                    </div>
                    <div>
                      <label
                        className="text-[11px] font-medium uppercase tracking-[0.1em]"
                        style={{ color: 'var(--color-obs-text-subtle)' }}
                      >
                        種別
                      </label>
                      <select
                        className="mt-1.5 w-full h-10 px-4 text-[14px] rounded-[var(--radius-obs-md)] outline-none transition-all duration-150 focus:ring-2 focus:ring-[var(--color-obs-primary)]/40"
                        style={{
                          backgroundColor: 'var(--color-obs-surface-lowest)',
                          color: 'var(--color-obs-text)',
                          boxShadow: 'inset 0 0 0 1px rgba(109,106,111,0.12)',
                        }}
                      >
                        {Object.entries(TYPE_LABELS).map(([k, v]) => (
                          <option key={k} value={k}>
                            {v}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 mt-6">
                    <ObsButton variant="ghost" size="md" onClick={() => setShowUpload(false)}>
                      キャンセル
                    </ObsButton>
                    <ObsButton variant="primary" size="md" onClick={() => setShowUpload(false)}>
                      アップロード
                    </ObsButton>
                  </div>
                </ObsCard>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ObsPageShell>
  )
}
