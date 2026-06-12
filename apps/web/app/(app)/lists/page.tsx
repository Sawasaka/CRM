'use client'

import { useEffect, useState, useMemo } from 'react'
import type { ReactNode } from 'react'
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
  ObsHero,
  ObsInput,
  ObsPageShell,
} from '@/components/obsidian'
import { isDemoUrlSearch } from '@/lib/demo-company-data'
import { DEMO_LISTS } from '@/lib/demo-crm-data'

// ─── Mock Data ─────────────────────────────────────────────────────────────────

const MOCK_LISTS: LocalList[] = []

// ─── Color accents ───────────────────────────────────────────────────────────

type ListAccent = {
  color: string
  soft: string
  glow: string
  surface: string
  surfaceStrong: string
}

const COLOR_ACCENT: Record<string, ListAccent> = {
  '#0071E3': {
    color: '#abc7ff',
    soft: 'rgba(171,199,255,0.16)',
    glow: 'rgba(171,199,255,0.22)',
    surface: 'rgba(171,199,255,0.055)',
    surfaceStrong: 'rgba(171,199,255,0.12)',
  },
  '#FF9F0A': {
    color: '#ffd37a',
    soft: 'rgba(255,211,122,0.16)',
    glow: 'rgba(255,211,122,0.18)',
    surface: 'rgba(255,211,122,0.050)',
    surfaceStrong: 'rgba(255,211,122,0.11)',
  },
  '#34C759': {
    color: '#8dffc9',
    soft: 'rgba(141,255,201,0.15)',
    glow: 'rgba(141,255,201,0.18)',
    surface: 'rgba(141,255,201,0.050)',
    surfaceStrong: 'rgba(141,255,201,0.11)',
  },
  '#FF3B30': {
    color: '#ff8ca0',
    soft: 'rgba(255,140,160,0.15)',
    glow: 'rgba(255,140,160,0.18)',
    surface: 'rgba(255,140,160,0.050)',
    surfaceStrong: 'rgba(255,140,160,0.11)',
  },
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
  const accent = COLOR_ACCENT[list.color] ?? COLOR_ACCENT['#0071E3']!
  const ratio = Math.min(100, Math.max(10, (list.appointmentCount / Math.max(1, list.contactCount)) * 100))

  return (
    <motion.div
      custom={index}
      variants={cardVariant}
      initial="hidden"
      animate="visible"
      onClick={() => router.push(`/lists/${list.id}`)}
      className="cursor-pointer"
    >
      <div
        className="group relative min-h-[186px] overflow-hidden rounded-[22px] p-5 transition-all duration-200"
        style={{
          background:
            `linear-gradient(145deg, rgba(27,28,32,0.72) 0%, rgba(19,20,24,0.84) 48%, rgba(12,13,16,0.94) 100%), radial-gradient(circle at 8% 0%, ${accent.surfaceStrong} 0%, transparent 42%), radial-gradient(circle at 96% 92%, rgba(171,199,255,0.040) 0%, transparent 46%)`,
          boxShadow: `inset 0 0 0 1px rgba(171,199,255,0.105), inset 1px 1px 0 rgba(255,255,255,0.035), 0 18px 48px rgba(0,0,0,0.30), 0 0 18px ${accent.glow}`,
          transitionTimingFunction: 'var(--ease-liquid)',
        }}
        onMouseOver={(e) => {
          ;(e.currentTarget as HTMLDivElement).style.boxShadow = `inset 0 0 0 1px ${accent.soft}, inset 1px 1px 0 rgba(255,255,255,0.055), 0 22px 54px rgba(0,0,0,0.34), 0 0 28px ${accent.glow}`
          ;(e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)'
        }}
        onMouseOut={(e) => {
          ;(e.currentTarget as HTMLDivElement).style.boxShadow = `inset 0 0 0 1px rgba(171,199,255,0.105), inset 1px 1px 0 rgba(255,255,255,0.035), 0 18px 48px rgba(0,0,0,0.30), 0 0 18px ${accent.glow}`
          ;(e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'
        }}
      >
        <div
          className="pointer-events-none absolute inset-x-4 top-0 h-px"
          style={{
            background: `linear-gradient(90deg, transparent, ${accent.color}88 12%, rgba(255,255,255,0.10) 46%, transparent)`,
          }}
        />
        <div
          className="pointer-events-none absolute -left-14 -top-14 h-40 w-40 rounded-full opacity-90 blur-2xl transition-opacity duration-200 group-hover:opacity-100"
          style={{ background: accent.glow }}
        />
        <div
          className="pointer-events-none absolute inset-0 opacity-55"
          style={{
            background: 'linear-gradient(180deg, rgba(255,255,255,0.045) 0%, transparent 54%)',
          }}
        />
        <div
          className="pointer-events-none absolute bottom-0 left-0 h-[2px] rounded-full"
          style={{
            width: `${ratio}%`,
            background: `linear-gradient(90deg, ${accent.color}, rgba(255,255,255,0.22))`,
            boxShadow: `0 0 12px ${accent.glow}`,
          }}
        />

        <div className="relative flex min-h-full flex-col">
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 flex-1 items-center gap-2.5">
              <span
                className="relative inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full"
                style={{
                  background: `linear-gradient(145deg, ${accent.soft}, rgba(255,255,255,0.035))`,
                  boxShadow: `inset 0 0 0 1px ${accent.soft}, 0 0 14px ${accent.glow}`,
                }}
              >
                <span
                  className="h-2 w-2 rounded-full"
                  style={{
                    background: `radial-gradient(circle at 30% 30%, #ffffff 0%, ${accent.color} 48%, ${accent.color}88 88%)`,
                    boxShadow: `0 0 10px ${accent.color}`,
                  }}
                />
              </span>
              <div className="min-w-0">
                <h3
                  className="font-[family-name:var(--font-display)] text-[15px] font-bold leading-tight tracking-[-0.015em] truncate"
                  style={{ color: '#f7f6fb' }}
                >
                  {list.name}
                </h3>
                {list.description && (
                  <p className="mt-1 text-[12px] leading-relaxed text-[#b2afb7]">
                    {list.description}
                  </p>
                )}
              </div>
            </div>
            <span
              className="inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[10.5px]"
              style={{
                background: 'rgba(171,199,255,0.065)',
                color: '#cfdcf7',
                boxShadow: 'inset 0 0 0 1px rgba(171,199,255,0.105)',
              }}
            >
              <Users size={10} strokeWidth={2.4} />
              {list.ownerName}
            </span>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <MetricRow icon={<Users size={11} strokeWidth={2} />} label="件数" value={list.contactCount} />
            <MetricRow
              icon={<CalendarCheck size={11} strokeWidth={2} />}
              label="アポ"
              value={list.appointmentCount}
              valueColor={accent.color}
            />
          </div>
        </div>
      </div>
    </motion.div>
  )
}

function MetricRow({
  icon,
  label,
  value,
  valueColor,
}: {
  icon: ReactNode
  label: string
  value: number
  valueColor?: string
}) {
  return (
    <div
      className="rounded-[14px] px-3.5 py-3"
      style={{
        background: 'linear-gradient(145deg, rgba(13,14,17,0.78), rgba(20,21,25,0.58))',
        boxShadow: 'inset 0 0 0 1px rgba(171,199,255,0.085), inset 1px 1px 0 rgba(255,255,255,0.025)',
      }}
    >
      <span className="inline-flex items-center gap-1.5 text-[11px] text-[#9d9aa2]">
        <span style={{ color: '#9d9aa2' }}>
          {icon}
        </span>
        {label}
      </span>
      <span
        className="mt-1.5 block font-[family-name:var(--font-display)] text-[20px] font-bold leading-none tabular-nums"
        style={{ color: valueColor ?? '#e7e5ea' }}
      >
        {value}
      </span>
    </div>
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
  const [lists, setLists] = useState<LocalList[]>(MOCK_LISTS)

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (isDemoUrlSearch(window.location.search) && lists.length === 0) {
      setLists(DEMO_LISTS.map((list) => ({ ...list })) as LocalList[])
    }
  }, [lists.length])

  const filtered = useMemo(() => {
    let base = lists.filter((l) => l.kind === 'is')
    if (search.trim()) {
      const q = search.toLowerCase()
      base = base.filter(
        (l) => l.name.toLowerCase().includes(q) || l.ownerName.toLowerCase().includes(q),
      )
    }
    return base
  }, [lists, search])

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
        <div className="mb-6 flex items-center gap-3">
          <div className="relative flex-1 max-w-[520px]">
            <div
              className="pointer-events-none absolute -inset-px rounded-[var(--radius-obs-md)] opacity-60"
              style={{
                background: 'linear-gradient(90deg, rgba(171,199,255,0.14), rgba(0,113,227,0.05), transparent)',
                filter: 'blur(10px)',
              }}
            />
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none z-[1]"
              style={{ color: 'var(--color-obs-text-subtle)' }}
            />
            <ObsInput
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="リスト名で検索..."
              className="relative pl-10"
            />
          </div>
        </div>

        {/* Cards Grid */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[repeat(3,minmax(300px,420px))]">
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
