'use client'

import { useState, type ElementType, type FormEvent } from 'react'
import { motion } from 'framer-motion'
import { BookOpen, Briefcase, CheckCircle2, Mail, Phone, TrendingUp, X } from 'lucide-react'

export type DealTaskType = 'call' | 'email' | 'meeting' | 'proposal' | 'followup' | 'other'

export interface DealTask {
  id: string
  type: DealTaskType
  title: string
  dueAt: string | null
  memo: string
  done: boolean
}

interface DealTaskTypeStyle {
  Icon: ElementType
  label: string
  bg: string
  iconColor: string
}

export const DEAL_TASK_TYPE_STYLES: Record<DealTaskType, DealTaskTypeStyle> = {
  call: { Icon: Phone, label: 'コール', bg: 'rgba(126,198,255,0.14)', iconColor: 'var(--color-obs-low)' },
  email: { Icon: Mail, label: 'メール', bg: 'rgba(171,199,255,0.14)', iconColor: 'var(--color-obs-primary)' },
  meeting: { Icon: Briefcase, label: '商談', bg: 'rgba(74,217,138,0.14)', iconColor: '#4ad98a' },
  proposal: { Icon: BookOpen, label: '提案書', bg: 'rgba(255,184,107,0.14)', iconColor: 'var(--color-obs-middle)' },
  followup: { Icon: TrendingUp, label: 'フォロー', bg: 'rgba(171,199,255,0.10)', iconColor: 'var(--color-obs-primary)' },
  other: { Icon: CheckCircle2, label: 'その他', bg: 'rgba(143,140,144,0.14)', iconColor: 'var(--color-obs-text-muted)' },
}

const ALL_DEAL_TASK_TYPES: DealTaskType[] = ['call', 'email', 'other']
const OBS_CARD_DIVIDER = { boxShadow: 'inset 0 -1px 0 rgba(109,106,111,0.16)' }

export function DealTaskModal({
  task,
  onClose,
  onSave,
}: {
  task: DealTask | null
  onClose: () => void
  onSave: (task: DealTask) => void
}) {
  const isEdit = !!task
  const [form, setForm] = useState<DealTask>(
    task ?? {
      id: `t-${Date.now()}`,
      type: 'call',
      title: '',
      dueAt: null,
      memo: '',
      done: false,
    },
  )

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!form.title.trim()) return
    onSave({ ...form, title: form.title.trim(), memo: form.memo.trim() })
    onClose()
  }

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        className="relative w-full max-w-[460px] overflow-hidden"
        style={{
          background: 'var(--color-obs-surface-highest)',
          borderRadius: 'var(--radius-obs-xl)',
          boxShadow: '0 24px 64px rgba(0,0,0,0.6), inset 0 0 0 1px rgba(109,106,111,0.18)',
        }}
        initial={{ opacity: 0, scale: 0.96, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 8 }}
        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4" style={OBS_CARD_DIVIDER}>
          <h2 className="text-[16px] font-bold" style={{ color: 'var(--color-obs-text)' }}>
            {isEdit ? 'タスク編集' : 'タスク作成'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full transition-colors hover:bg-[rgba(171,199,255,0.08)]"
          >
            <X size={16} style={{ color: 'var(--color-obs-text-muted)' }} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="px-5 py-4 space-y-4">
            <div>
              <label className="text-[11px] font-bold uppercase tracking-[0.06em] mb-1.5 block" style={{ color: 'var(--color-obs-text-subtle)' }}>タスク種別</label>
              <div className="flex flex-wrap gap-1.5">
                {ALL_DEAL_TASK_TYPES.map((type) => {
                  const style = DEAL_TASK_TYPE_STYLES[type]
                  const active = form.type === type
                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setForm((current) => ({ ...current, type }))}
                      className="inline-flex items-center gap-1.5 px-3 h-[32px] rounded-[8px] text-[11px] font-medium transition-all"
                      style={
                        active
                          ? {
                              backgroundColor: style.bg,
                              color: style.iconColor,
                              boxShadow: 'inset 0 0 0 1px rgba(109,106,111,0.12)',
                            }
                          : {
                              background: 'var(--color-obs-surface)',
                              color: 'var(--color-obs-text-muted)',
                              boxShadow: 'inset 0 0 0 1px rgba(109,106,111,0.12)',
                            }
                      }
                    >
                      <style.Icon size={11} strokeWidth={2.2} style={{ color: active ? style.iconColor : 'var(--color-obs-text-muted)' }} />
                      {style.label}
                    </button>
                  )
                })}
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold uppercase tracking-[0.06em] mb-1.5 block" style={{ color: 'var(--color-obs-text-subtle)' }}>
                タイトル <span style={{ color: 'var(--color-obs-hot)' }}>*</span>
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
                placeholder="例: デモ商談実施"
                required
                className="w-full h-[36px] px-3 text-[14px] rounded-[8px] outline-none"
                style={{
                  background: 'var(--color-obs-surface-lowest)',
                  color: 'var(--color-obs-text)',
                  boxShadow: 'inset 0 0 0 1px rgba(109,106,111,0.12)',
                }}
              />
            </div>

            <div>
              <label className="text-[11px] font-bold uppercase tracking-[0.06em] mb-1.5 flex items-center justify-between" style={{ color: 'var(--color-obs-text-subtle)' }}>
                <span>期日</span>
                {form.dueAt && (
                  <button
                    type="button"
                    onClick={() => setForm((current) => ({ ...current, dueAt: null }))}
                    className="inline-flex items-center gap-0.5 text-[10px] font-bold transition-colors normal-case tracking-normal"
                    style={{ color: 'var(--color-obs-text-muted)' }}
                  >
                    <X size={10} />
                    クリア
                  </button>
                )}
              </label>
              <input
                type="date"
                value={form.dueAt ?? ''}
                onChange={(event) => setForm((current) => ({ ...current, dueAt: event.target.value || null }))}
                className="w-full h-[36px] px-3 text-[14px] rounded-[8px] outline-none cursor-pointer"
                style={{
                  background: 'var(--color-obs-surface-lowest)',
                  color: 'var(--color-obs-text)',
                  colorScheme: 'dark',
                  boxShadow: 'inset 0 0 0 1px rgba(109,106,111,0.12)',
                }}
              />
            </div>

            <div>
              <label className="text-[11px] font-bold uppercase tracking-[0.06em] mb-1.5 block" style={{ color: 'var(--color-obs-text-subtle)' }}>メモ</label>
              <textarea
                value={form.memo}
                onChange={(event) => setForm((current) => ({ ...current, memo: event.target.value }))}
                placeholder="タスクに関するメモを入力..."
                rows={3}
                className="w-full px-3 py-2 text-[13px] outline-none rounded-[8px] resize-none"
                style={{
                  background: 'var(--color-obs-surface-lowest)',
                  color: 'var(--color-obs-text)',
                  boxShadow: 'inset 0 0 0 1px rgba(109,106,111,0.12)',
                }}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 px-5 py-4" style={OBS_CARD_DIVIDER}>
            <button
              type="button"
              onClick={onClose}
              className="h-[36px] px-4 text-[13px] font-medium rounded-[8px] transition-colors hover:bg-[rgba(171,199,255,0.06)]"
              style={{ color: 'var(--color-obs-text-muted)' }}
            >
              キャンセル
            </button>
            <button
              type="submit"
              className="h-[36px] px-5 text-[13px] font-semibold rounded-[8px] transition-all hover:brightness-106"
              style={{
                background: 'var(--color-obs-primary-container)',
                color: 'var(--color-obs-on-primary)',
                boxShadow: '0 8px 24px rgba(0,113,227,0.20)',
              }}
            >
              {isEdit ? '保存' : '作成'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}
