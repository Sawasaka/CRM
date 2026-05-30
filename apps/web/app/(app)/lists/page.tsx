'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import type { Variants } from 'framer-motion'
import { Search, Plus, Users, CalendarCheck, X, ChevronDown } from 'lucide-react'
import type { CallList } from '@/types/crm'

type ListKind = 'is' | 'company'
type LocalList = CallList & { kind: ListKind }
import {
  ObsButton,
  ObsCard,
  ObsChip,
  ObsHero,
  ObsInput,
  ObsPageShell,
} from '@/components/obsidian'

// ─── Mock Data ─────────────────────────────────────────────────────────────────

const MOCK_LISTS: LocalList[] = [
  // ── ISリスト（コンタクト基点） ─────────────
  {
    id: 'list-1', name: '今週のコール対象', description: '今週中にコールすべきターゲット',
    ownerName: '田中太郎', contactCount: 12, completedCount: 5, appointmentCount: 2,
    color: '#0071E3', createdAt: '2026-03-24', updatedAt: '2026-03-26', kind: 'is',
  },
  {
    id: 'list-2', name: '再フォローリスト', description: '不在/不通で再コールが必要',
    ownerName: '田中太郎', contactCount: 8, completedCount: 1, appointmentCount: 0,
    color: '#FF9F0A', createdAt: '2026-03-20', updatedAt: '2026-03-25', kind: 'is',
  },
  {
    id: 'list-3', name: 'セミナー参加者リスト', description: '3/15セミナー参加者へのフォローアップ',
    ownerName: '鈴木花子', contactCount: 20, completedCount: 14, appointmentCount: 5,
    color: '#34C759', createdAt: '2026-03-16', updatedAt: '2026-03-22', kind: 'is',
  },
  // ── 企業リスト（企業基点） ─────────────────
  {
    id: 'list-4', name: 'Aランク未着手企業', description: 'Aランクでまだ未アプローチの企業',
    ownerName: '田中太郎', contactCount: 6, completedCount: 0, appointmentCount: 0,
    color: '#FF3B30', createdAt: '2026-03-18', updatedAt: '2026-03-26', kind: 'company',
  },
  {
    id: 'list-5', name: 'HOT 2026Q2 アプローチ対象', description: '求人インテントHOTの企業を抽出',
    ownerName: 'IS 三郎', contactCount: 323, completedCount: 42, appointmentCount: 9,
    color: '#FF3B30', createdAt: '2026-04-12', updatedAt: '2026-05-02', kind: 'company',
  },
  {
    id: 'list-6', name: '製造業×従業員500名以上', description: '製造業の中堅以上をまとめたターゲットリスト',
    ownerName: '営業 花子', contactCount: 87, completedCount: 12, appointmentCount: 3,
    color: '#FF9F0A', createdAt: '2026-04-25', updatedAt: '2026-05-08', kind: 'company',
  },
]

// ─── Color accents (listごとにアクセントカラーだけ差す) ────────────────────────

const COLOR_ACCENT: Record<string, string> = {
  '#0071E3': 'var(--color-obs-low)',
  '#FF9F0A': 'var(--color-obs-middle)',
  '#34C759': '#6EE7B7',
  '#FF3B30': 'var(--color-obs-hot)',
}

// ─── Card animation ──────────────────────────────────────────────────────────

const cardVariant: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.28, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] as const },
  }),
}

// ─── ListCard ────────────────────────────────────────────────────────────────

function ListCard({ list, index }: { list: LocalList; index: number }) {
  const router = useRouter()
  const accent = COLOR_ACCENT[list.color] ?? 'var(--color-obs-primary)'

  return (
    <motion.div
      custom={index}
      variants={cardVariant}
      initial="hidden"
      animate="visible"
      whileHover={{ y: -3 }}
      transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
      onClick={() => router.push(`/lists/${list.id}`)}
      className="cursor-pointer"
    >
      <ObsCard depth="high" padding="lg" radius="xl" className="relative overflow-hidden">
        {/* グロー光線 (上端) */}
        <div
          className="absolute top-0 left-0 right-0"
          style={{
            height: '2px',
            background: accent,
            opacity: 0.6,
          }}
        />

        {/* Header */}
        <div className="flex items-start gap-3 mb-5 relative">
          <div
            className="w-[10px] h-[10px] rounded-full mt-1.5 shrink-0"
            style={{ background: accent, boxShadow: `0 0 10px ${accent}` }}
          />
          <div className="flex-1 min-w-0">
            <h3
              className="font-[family-name:var(--font-display)] text-[15px] font-semibold tracking-[-0.02em] truncate"
              style={{ color: 'var(--color-obs-text)' }}
            >
              {list.name}
            </h3>
            {list.description && (
              <p className="text-[12px] mt-0.5 truncate" style={{ color: 'var(--color-obs-text-muted)' }}>
                {list.description}
              </p>
            )}
          </div>

          {/* 担当者バッジ */}
          <ObsChip tone="primary" className="shrink-0">
            <Users size={9} strokeWidth={2.5} />
            {list.ownerName}
          </ObsChip>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-5 relative">
          {/* 件数 */}
          <div className="flex items-center gap-1.5">
            <Users size={12} style={{ color: 'var(--color-obs-text-subtle)' }} />
            <span className="text-[11px]" style={{ color: 'var(--color-obs-text-subtle)' }}>
              件数
            </span>
            <span
              className="text-[14px] font-semibold tabular-nums"
              style={{ color: 'var(--color-obs-text)' }}
            >
              {list.contactCount}
            </span>
          </div>

          <span className="w-px h-3.5" style={{ background: 'var(--color-obs-outline-variant)' }} />

          {/* アポイント獲得数 */}
          <div className="flex items-center gap-1.5">
            <CalendarCheck size={12} style={{ color: '#6EE7B7' }} />
            <span className="text-[11px]" style={{ color: 'var(--color-obs-text-subtle)' }}>
              アポ
            </span>
            <span
              className="text-[14px] font-semibold tabular-nums"
              style={{ color: '#6EE7B7' }}
            >
              {list.appointmentCount}
            </span>
          </div>
        </div>
      </ObsCard>
    </motion.div>
  )
}

// ─── CreateListModal ─────────────────────────────────────────────────────────

const OWNERS = ['田中太郎', '鈴木花子', '佐藤次郎']

function CreateListModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [owner, setOwner] = useState(OWNERS[0])

  if (!open) return null

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-black/50" onClick={onClose} />
          <motion.div
            className="relative w-[440px]"
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          >
            <ObsCard depth="highest" padding="lg" radius="2xl">
              <div className="flex items-center justify-between mb-5">
                <h2
                  className="font-[family-name:var(--font-display)] text-[17px] font-semibold tracking-[-0.02em]"
                  style={{ color: 'var(--color-obs-text)' }}
                >
                  新規リスト作成
                </h2>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-full hover:bg-[var(--color-obs-surface-high)] transition-colors"
                  style={{ color: 'var(--color-obs-text-muted)' }}
                >
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label
                    className="text-[11px] font-medium tracking-[0.08em] uppercase block mb-1.5"
                    style={{ color: 'var(--color-obs-text-subtle)' }}
                  >
                    リスト名 *
                  </label>
                  <ObsInput
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="例: 今週のコール対象"
                  />
                </div>
                <div>
                  <label
                    className="text-[11px] font-medium tracking-[0.08em] uppercase block mb-1.5"
                    style={{ color: 'var(--color-obs-text-subtle)' }}
                  >
                    説明
                  </label>
                  <ObsInput
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="リストの目的や対象を入力"
                  />
                </div>
                <div>
                  <label
                    className="text-[11px] font-medium tracking-[0.08em] uppercase block mb-1.5"
                    style={{ color: 'var(--color-obs-text-subtle)' }}
                  >
                    担当者
                  </label>
                  <div className="relative">
                    <select
                      value={owner}
                      onChange={(e) => setOwner(e.target.value)}
                      className="w-full h-10 px-4 pr-9 rounded-[var(--radius-obs-md)] text-sm appearance-none cursor-pointer outline-none"
                      style={{
                        backgroundColor: 'var(--color-obs-surface-lowest)',
                        color: 'var(--color-obs-text)',
                        boxShadow: 'inset 0 0 0 1px rgba(109,106,111,0.12)',
                      }}
                    >
                      {OWNERS.map((o) => (
                        <option key={o} value={o}>
                          {o}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      size={13}
                      className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
                      style={{ color: 'var(--color-obs-text-subtle)' }}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <ObsButton variant="ghost" size="md" onClick={onClose}>
                  キャンセル
                </ObsButton>
                <ObsButton
                  variant="primary"
                  size="md"
                  disabled={!name.trim()}
                  onClick={onClose}
                >
                  作成
                </ObsButton>
              </div>
            </ObsCard>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function ListsPage() {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [showCreate, setShowCreate] = useState(false)

  const filtered = useMemo(() => {
    let base = MOCK_LISTS.filter((l) => l.kind === 'is')
    if (search.trim()) {
      const q = search.toLowerCase()
      base = base.filter(
        (l) => l.name.toLowerCase().includes(q) || l.ownerName.toLowerCase().includes(q),
      )
    }
    return base
  }, [search])

  return (
    <ObsPageShell>
      <div className="w-full px-8 xl:px-12 2xl:px-16 pb-16">
        {/* ── Hero ── */}
        <ObsHero
          eyebrow="LISTS"
          title="ISリスト"
          titleAccent="リスト"
          caption="コール対象リストを、担当者・件数・アポ状況で優先管理。"
          action={
            <ObsButton
              variant="primary"
              size="md"
              onClick={() => router.push('/contacts')}
            >
              <span className="inline-flex items-center gap-1.5">
                <Plus size={14} strokeWidth={2.5} />
                新規リスト
              </span>
            </ObsButton>
          }
        />

        {/* ── Toolbar ── */}
        <div className="flex items-center gap-3 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: 'var(--color-obs-text-subtle)' }}
            />
            <ObsInput
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="リスト名で検索..."
              className="pl-10"
            />
          </div>
        </div>

        {/* Cards Grid */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-3 gap-4">
            {filtered.map((list, i) => (
              <ListCard key={list.id} list={list} index={i} />
            ))}
          </div>
        ) : (
          <ObsCard depth="low" padding="lg" radius="xl">
            <div className="py-16 text-center">
              <p className="text-sm" style={{ color: 'var(--color-obs-text-muted)' }}>
                ISリストがありません。コンタクト一覧から作成してください。
              </p>
            </div>
          </ObsCard>
        )}

        <CreateListModal open={showCreate} onClose={() => setShowCreate(false)} />
      </div>
    </ObsPageShell>
  )
}
