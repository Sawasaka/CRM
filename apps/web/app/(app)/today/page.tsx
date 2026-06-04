'use client'

import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Phone, Mail, Briefcase, ChevronRight, User, Building2, Pencil, X, Check, RotateCcw, Calendar, CalendarClock, CheckSquare } from 'lucide-react'
import {
  ObsPageShell,
  ObsHero,
  ObsCard,
  ObsChip,
  ObsButton,
  ObsInput,
} from '@/components/obsidian'

// ─── Data ───────────────────────────────────────────────────────────────────

const REPS = [
  { id: 'u1', name: '田中太郎', color: 'var(--color-obs-primary)' },
  { id: 'u2', name: '鈴木花子', color: 'var(--color-obs-middle)' },
  { id: 'u3', name: '佐藤次郎', color: 'var(--color-obs-low)' },
]

type TaskCategory = 'contact' | 'deal'

interface Task {
  id: string
  type: string
  company: string
  person: string
  rank: string
  urgent: boolean
  owner: string
  ownerName: string
  category: TaskCategory
  linkTo: string
  memo: string
  dueAt: string
  remindAt: string
  completed: boolean
}

const INITIAL_TASKS: Task[] = []

// ランク → ObsChip の tone マッピング（A=hot, B=middle, C=low）
function rankToTone(rank: string): 'hot' | 'middle' | 'low' | 'neutral' {
  if (rank === 'A') return 'hot'
  if (rank === 'B') return 'middle'
  if (rank === 'C') return 'low'
  return 'neutral'
}

// コンタクトのNext Actionと完全連動した5種類
const TYPE_OPTIONS: { key: string; label: string }[] = [
  { key: 'email',    label: 'メール' },
  { key: 'call',     label: 'コール' },
  { key: 'meeting',  label: '商談' },
  { key: 'wait',     label: '連絡待ち' },
  { key: 'followup', label: 'フォロー' },
]

// タスク種別 → アイコン（色は Obsidian のトーンに抑える）
const TASK_TYPE_ICON: Record<string, React.ElementType> = {
  call: Phone,
  email: Mail,
  meeting: Briefcase,
  wait: Briefcase,
  followup: Briefcase,
  other: Briefcase,
}

function formatDueDate(d: string): string {
  if (!d) return ''
  const [, m, day] = d.split('-')
  return `${parseInt(m ?? '0', 10)}/${parseInt(day ?? '0', 10)}`
}

// ─── Task Row ────────────────────────────────────────────────────────────────

function TaskRow({ task, isLast, onComplete, onRestore, onEdit }: {
  task: Task; isLast: boolean
  onComplete: (id: string) => void
  onRestore: (id: string) => void
  onEdit: (task: Task) => void
}) {
  const router = useRouter()
  const TypeIcon = TASK_TYPE_ICON[task.type] ?? Briefcase

  return (
    <div
      onClick={() => !task.completed && router.push(task.linkTo)}
      className={`flex items-center gap-3 px-5 py-3 transition-colors ${task.completed ? '' : 'cursor-pointer'}`}
      style={{
        backgroundColor: 'transparent',
        transitionTimingFunction: 'var(--ease-liquid)',
        ...(isLast ? {} : { boxShadow: 'inset 0 -1px 0 0 var(--color-obs-surface-low)' }),
      }}
      onMouseOver={(e) => {
        if (!task.completed) (e.currentTarget as HTMLDivElement).style.backgroundColor = 'var(--color-obs-surface-high)'
      }}
      onMouseOut={(e) => {
        (e.currentTarget as HTMLDivElement).style.backgroundColor = 'transparent'
      }}
    >
      <div
        className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
        style={{
          backgroundColor: task.completed ? 'var(--color-obs-surface-high)' : 'var(--color-obs-surface-highest)',
          opacity: task.completed ? 0.55 : 1,
        }}
      >
        {task.completed ? (
          <Check size={15} style={{ color: 'var(--color-obs-text-muted)' }} strokeWidth={2.5} />
        ) : (
          <TypeIcon size={15} style={{ color: 'var(--color-obs-primary)' }} strokeWidth={2.2} />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          {task.completed && (
            <ObsChip tone="low" className="shrink-0">
              <Check size={9} strokeWidth={3} />完了
            </ObsChip>
          )}
          <span
            className="text-[13px] font-medium truncate"
            style={{
              color: task.completed ? 'var(--color-obs-text-subtle)' : 'var(--color-obs-text)',
              textDecoration: task.completed ? 'line-through' : 'none',
            }}
          >
            {task.person || task.company}
          </span>
          {!task.completed && (
            <ObsChip tone={rankToTone(task.rank)} className="shrink-0">
              {task.rank}
            </ObsChip>
          )}
        </div>
        <p className="text-[12px] mt-0.5" style={{ color: task.completed ? 'var(--color-obs-text-subtle)' : 'var(--color-obs-text-muted)' }}>
          {task.company}
          {task.memo && <span className="ml-1.5" style={{ color: 'var(--color-obs-text-muted)' }}>· {task.memo}</span>}
        </p>
      </div>

      {/* 期日バッジ（右寄り） */}
      {!task.completed && task.dueAt && (
        <ObsChip tone="primary" className="shrink-0 tabular-nums">
          <Calendar size={10} strokeWidth={2.5} />
          {formatDueDate(task.dueAt)}
        </ObsChip>
      )}

      {task.completed ? (
        <ObsButton
          variant="ghost"
          size="sm"
          onClick={() => onRestore(task.id)}
          className="shrink-0"
        >
          <RotateCcw size={11} className="mr-1 inline" />
          戻す
        </ObsButton>
      ) : (
        <div className="flex items-center gap-2 shrink-0">
          <ObsButton
            variant="ghost"
            size="sm"
            onClick={() => onEdit(task)}
          >
            <Pencil size={11} className="mr-1 inline" />
            編集
          </ObsButton>
          <ObsButton
            variant="primary"
            size="sm"
            onClick={() => onComplete(task.id)}
          >
            完了
          </ObsButton>
        </div>
      )}
    </div>
  )
}

// ─── Edit Task Modal ─────────────────────────────────────────────────────────
// コンタクトのNext Actionと完全に連動した編集UI

function EditTaskModal({ task, onClose, onSave }: {
  task: Task; onClose: () => void; onSave: (updated: Task) => void
}) {
  const [type, setType] = useState(task.type)
  const [memo, setMemo] = useState(task.memo)
  const [dueAt, setDueAt] = useState(task.dueAt)

  const isContactLinked = task.category === 'contact'

  function handleSave() {
    onSave({ ...task, type, memo, dueAt })
    onClose()
  }

  return (
    <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        className="relative w-full max-w-[460px] rounded-[var(--radius-obs-xl)] overflow-hidden"
        style={{
          backgroundColor: 'var(--color-obs-surface-highest)',
          boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
        }}
        initial={{ opacity: 0, scale: 0.96, y: 8 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: 8 }}
        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
        onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{ boxShadow: 'inset 0 -1px 0 0 var(--color-obs-surface-low)' }}
        >
          <div className="flex items-center gap-2">
            <CalendarClock size={14} style={{ color: 'var(--color-obs-primary)' }} />
            <h2 className="text-[16px] font-bold" style={{ color: 'var(--color-obs-text)' }}>
              {isContactLinked ? 'ネクストアクション編集' : 'タスク編集'}
            </h2>
            {isContactLinked && (
              <ObsChip tone="primary">
                <CheckSquare size={9} />
                コンタクト連動
              </ObsChip>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full transition-colors hover:bg-[var(--color-obs-surface-high)]"
          >
            <X size={16} style={{ color: 'var(--color-obs-text-muted)' }} />
          </button>
        </div>

        <div className="px-5 py-4 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* 紐付け先 */}
          <ObsCard depth="low" padding="sm" radius="md">
            <div className="flex items-center gap-2">
              <User size={12} style={{ color: 'var(--color-obs-primary)' }} className="shrink-0" />
              <div className="flex-1 min-w-0">
                <p
                  className="text-[10px] font-bold uppercase tracking-[0.08em]"
                  style={{ color: 'var(--color-obs-text-subtle)' }}
                >
                  紐付け先
                </p>
                <p className="text-[12px] font-medium truncate" style={{ color: 'var(--color-obs-text)' }}>
                  {task.person ? `${task.person} · ` : ''}{task.company}
                </p>
              </div>
            </div>
          </ObsCard>

          {/* 種別 */}
          <div>
            <label
              className="text-[11px] font-bold uppercase tracking-[0.08em] mb-2 flex items-center gap-1"
              style={{ color: 'var(--color-obs-text-subtle)' }}
            >
              種別
            </label>
            <div className="flex flex-wrap gap-1.5">
              {TYPE_OPTIONS.map(opt => {
                const active = type === opt.key
                return (
                  <ObsButton
                    key={opt.key}
                    variant={active ? 'primary' : 'ghost'}
                    size="sm"
                    onClick={() => setType(opt.key)}
                  >
                    {opt.label}
                  </ObsButton>
                )
              })}
            </div>
          </div>

          {/* 実施予定日 */}
          <div>
            <label
              className="text-[11px] font-bold uppercase tracking-[0.08em] mb-2 flex items-center justify-between"
              style={{ color: 'var(--color-obs-text-subtle)' }}
            >
              <span>実施予定日</span>
              {dueAt && (
                <button
                  type="button"
                  onClick={() => setDueAt('')}
                  className="inline-flex items-center gap-0.5 text-[10px] font-bold normal-case tracking-normal transition-colors"
                  style={{ color: 'var(--color-obs-text-muted)' }}
                  title="日付をクリア"
                >
                  <X size={10} />
                  クリア
                </button>
              )}
            </label>
            <ObsInput
              type="date"
              value={dueAt}
              onChange={e => setDueAt(e.target.value)}
              style={{ colorScheme: 'dark' }}
            />
          </div>

          {/* メモ */}
          <div>
            <label
              className="text-[11px] font-bold uppercase tracking-[0.08em] mb-2 flex items-center gap-1"
              style={{ color: 'var(--color-obs-text-subtle)' }}
            >
              メモ
            </label>
            <textarea
              value={memo}
              onChange={e => setMemo(e.target.value)}
              placeholder="次回アクションに関するメモを入力..."
              rows={3}
              className="w-full px-4 py-2 text-[13px] outline-none rounded-[var(--radius-obs-md)] resize-none transition-all focus:ring-2 focus:ring-[var(--color-obs-primary)]/40"
              style={{
                backgroundColor: 'var(--color-obs-surface-lowest)',
                color: 'var(--color-obs-text)',
                boxShadow: 'inset 0 0 0 1px rgba(109,106,111,0.12)',
              }}
            />
          </div>
        </div>

        {/* Footer */}
        <div
          className="flex justify-end gap-2 px-5 py-4"
          style={{ boxShadow: 'inset 0 1px 0 0 var(--color-obs-surface-low)' }}
        >
          <ObsButton variant="ghost" onClick={onClose}>キャンセル</ObsButton>
          <ObsButton variant="primary" onClick={handleSave}>保存</ObsButton>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ─── Category Group ──────────────────────────────────────────────────────────

function CategoryGroup({ label, icon: Icon, tasks, onComplete, onRestore, onEdit }: {
  label: string; icon: React.ElementType; tasks: Task[]
  onComplete: (id: string) => void; onRestore: (id: string) => void; onEdit: (task: Task) => void
}) {
  if (tasks.length === 0) return null
  return (
    <div>
      <div className="flex items-center gap-1.5 px-5 pt-3 pb-1.5">
        <Icon size={11} style={{ color: 'var(--color-obs-text-subtle)' }} />
        <span
          className="text-[10px] font-semibold uppercase tracking-[0.08em]"
          style={{ color: 'var(--color-obs-text-subtle)' }}
        >
          {label}
        </span>
        <span className="text-[10px]" style={{ color: 'var(--color-obs-text-subtle)' }}>{tasks.length}</span>
      </div>
      {tasks.map((task, i) => (
        <TaskRow key={task.id} task={task} isLast={i === tasks.length - 1} onComplete={onComplete} onRestore={onRestore} onEdit={onEdit} />
      ))}
    </div>
  )
}

// ─── Rep Section ─────────────────────────────────────────────────────────────

function RepSection({ rep, tasks, completedTasks, index, onComplete, onRestore, onEdit }: {
  rep: typeof REPS[0]; tasks: Task[]; completedTasks: Task[]; index: number
  onComplete: (id: string) => void; onRestore: (id: string) => void; onEdit: (task: Task) => void
}) {
  const [open, setOpen] = useState(false)
  const [completedOpen, setCompletedOpen] = useState(false)
  const contactTasks = tasks.filter(t => t.category === 'contact')
  const dealTasks = tasks.filter(t => t.category === 'deal')

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] }}
    >
      <ObsCard depth="low" padding="none" radius="xl">
        <button
          onClick={() => setOpen(!open)}
          className="w-full flex items-center gap-3 px-5 py-3.5 transition-colors"
          style={{
            transitionTimingFunction: 'var(--ease-liquid)',
            ...(open ? { boxShadow: 'inset 0 -1px 0 0 var(--color-obs-surface)' } : {}),
          }}
          onMouseOver={(e) => {
            (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--color-obs-surface-high)'
          }}
          onMouseOut={(e) => {
            (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent'
          }}
        >
          <div
            className="w-[28px] h-[28px] rounded-full flex items-center justify-center text-[11px] font-bold shrink-0"
            style={{ backgroundColor: rep.color, color: 'var(--color-obs-on-primary)' }}
          >
            {rep.name[0]}
          </div>
          <span className="text-[14px] font-semibold" style={{ color: 'var(--color-obs-text)' }}>{rep.name}</span>
          <span className="text-[12px] tabular-nums font-medium" style={{ color: 'var(--color-obs-text-muted)' }}>
            {tasks.length + completedTasks.length}件
          </span>
          {completedTasks.length > 0 && (
            <ObsChip tone="low">完了 {completedTasks.length}</ObsChip>
          )}
          <motion.div className="ml-auto" animate={{ rotate: open ? 90 : 0 }} transition={{ duration: 0.15 }}>
            <ChevronRight size={14} style={{ color: 'var(--color-obs-text-subtle)' }} />
          </motion.div>
        </button>

        <AnimatePresence>
          {open && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }} className="overflow-hidden">
              <CategoryGroup label="コンタクト" icon={User} tasks={contactTasks} onComplete={onComplete} onRestore={onRestore} onEdit={onEdit} />
              {contactTasks.length > 0 && dealTasks.length > 0 && (
                <div className="mx-5 h-px" style={{ backgroundColor: 'var(--color-obs-surface)' }} />
              )}
              <CategoryGroup label="取引" icon={Building2} tasks={dealTasks} onComplete={onComplete} onRestore={onRestore} onEdit={onEdit} />

              {/* Completed within this rep */}
              {completedTasks.length > 0 && (
                <>
                  <div className="mx-5 h-px mt-1" style={{ backgroundColor: 'var(--color-obs-surface)' }} />
                  <button
                    onClick={e => { e.stopPropagation(); setCompletedOpen(!completedOpen) }}
                    className="w-full flex items-center gap-2 px-5 py-3 transition-colors"
                    onMouseOver={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--color-obs-surface-high)'
                    }}
                    onMouseOut={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent'
                    }}
                  >
                    <Check size={12} style={{ color: 'var(--color-obs-low)' }} />
                    <span className="text-[12px] font-medium" style={{ color: 'var(--color-obs-text-muted)' }}>完了一覧</span>
                    <span className="text-[11px] tabular-nums" style={{ color: 'var(--color-obs-text-subtle)' }}>{completedTasks.length}</span>
                    <motion.div className="ml-auto" animate={{ rotate: completedOpen ? 90 : 0 }} transition={{ duration: 0.12 }}>
                      <ChevronRight size={11} style={{ color: 'var(--color-obs-text-subtle)' }} />
                    </motion.div>
                  </button>
                  <AnimatePresence>
                    {completedOpen && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }} className="overflow-hidden">
                        {completedTasks.map((task, i) => (
                          <TaskRow key={task.id} task={task} isLast={i === completedTasks.length - 1}
                            onComplete={onComplete} onRestore={onRestore} onEdit={onEdit} />
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </ObsCard>
    </motion.div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function HomePage() {
  const [tasks, setTasks] = useState(INITIAL_TASKS)
  const [loading, setLoading] = useState(true)
  const [editingTask, setEditingTask] = useState<Task | null>(null)

  const activeTasks = tasks.filter(t => !t.completed)
  const completedTasks = tasks.filter(t => t.completed)
  const reps = useMemo(() => {
    const seen = new Map<string, { id: string; name: string; color: string }>()
    for (const task of tasks) {
      if (!seen.has(task.owner)) {
        seen.set(task.owner, {
          id: task.owner,
          name: task.ownerName,
          color: REPS[seen.size % REPS.length]?.color ?? 'var(--color-obs-primary)',
        })
      }
    }
    return Array.from(seen.values())
  }, [tasks])

  useEffect(() => {
    let aborted = false
    setLoading(true)
    fetch('/api/tasks?scope=today', { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : { tasks: [] }))
      .then((data: { tasks?: Task[] }) => {
        if (!aborted) setTasks(data.tasks ?? [])
      })
      .catch(() => {
        if (!aborted) setTasks([])
      })
      .finally(() => {
        if (!aborted) setLoading(false)
      })
    return () => {
      aborted = true
    }
  }, [])

  function handleComplete(id: string) {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: true } : t))
  }
  function handleRestore(id: string) {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: false } : t))
  }
  function handleSave(updated: Task) {
    setTasks(prev => prev.map(t => t.id === updated.id ? updated : t))
  }

  return (
    <ObsPageShell>
      <div className="w-full px-8 xl:px-12 2xl:px-16 pb-16">
        <ObsHero
          eyebrow="Today"
          title="今日のタスク"
          caption={`アクティブ ${activeTasks.length} 件・完了 ${completedTasks.length} 件。担当者ごとにまとめて確認できます。`}
          action={
            <div className="flex items-center gap-2">
              {activeTasks.length > 0 && <ObsChip tone="primary">アクティブ {activeTasks.length}</ObsChip>}
              {completedTasks.length > 0 && <ObsChip tone="low">完了 {completedTasks.length}</ObsChip>}
            </div>
          }
        />

        <div className="space-y-4">
          {reps.map((rep, i) => {
            const repActive = activeTasks.filter(t => t.owner === rep.id)
            const repCompleted = completedTasks.filter(t => t.owner === rep.id)
            if (repActive.length === 0 && repCompleted.length === 0) return null
            return (
              <RepSection
                key={rep.id}
                rep={rep}
                tasks={repActive}
                completedTasks={repCompleted}
                index={i}
                onComplete={handleComplete}
                onRestore={handleRestore}
                onEdit={setEditingTask}
              />
            )
          })}

          {!loading && activeTasks.length === 0 && completedTasks.length === 0 && (
            <ObsCard depth="low" padding="lg">
              <p className="text-[14px]" style={{ color: 'var(--color-obs-text-muted)' }}>
                本日のタスクはありません
              </p>
            </ObsCard>
          )}
        </div>

        {/* Edit Modal */}
        <AnimatePresence>
          {editingTask && <EditTaskModal task={editingTask} onClose={() => setEditingTask(null)} onSave={handleSave} />}
        </AnimatePresence>
      </div>
    </ObsPageShell>
  )
}
