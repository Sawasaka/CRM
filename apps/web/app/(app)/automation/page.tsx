'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Plus, Mail, Clock, GitBranch, CheckSquare, Play, X, Users, MailOpen } from 'lucide-react'
import type { Sequence, SequenceStatus } from '@/types/crm'
import {
  ObsButton,
  ObsCard,
  ObsChip,
  ObsHero,
  ObsInput,
  ObsPageShell,
} from '@/components/obsidian'

type ChipTone = 'neutral' | 'hot' | 'middle' | 'low' | 'primary'

// ─── Mock Data ───────────────────────────────────────────────────────────────

const MOCK_SEQUENCES: Sequence[] = []

// ─── Trigger options ─────────────────────────────────────────────────────────

type TriggerType = 'approach' | 'phase' | 'pipeline' | 'manual'
const TRIGGER_OPTIONS: { key: TriggerType; label: string; description: string }[] = [
  { key: 'approach', label: 'アプローチステータス変更', description: 'IS側のコール結果に応じて発動' },
  { key: 'phase',    label: 'フェーズ変更',             description: 'コンタクトのフェーズ変更時に発動' },
  { key: 'pipeline', label: 'パイプラインステージ変更', description: '取引のステージ変更時に発動' },
  { key: 'manual',   label: '手動登録',                 description: 'コンタクトを手動で登録' },
]

const APPROACH_OPTIONS = ['未着手', '不通', '不在', '接続済み', 'コール不可', 'アポ獲得', 'その他']
const PHASE_OPTIONS = ['リード', '商談中', '顧客', '休眠', '失注']
const PIPELINE_OPTIONS = ['IS', '商談済み', 'PJ化予定あり', 'POC実施中', '決裁者合意済み', '受注', '失注', 'チャーン', 'ロスト']

// ステータス → ObsChip tone へのマッピング
const STATUS_TONE: Record<SequenceStatus, { tone: ChipTone; label: string }> = {
  active:  { tone: 'low',     label: 'アクティブ' }, // 緑系 → neutralな低強度の low
  paused:  { tone: 'middle',  label: '一時停止' },
  draft:   { tone: 'neutral', label: '下書き' },
}

const STEP_ICONS: Record<string, React.ElementType> = { wait: Clock, email: Mail, condition: GitBranch, task: CheckSquare }

// ─── Page ────────────────────────────────────────────────────────────────────

export default function AutomationPage() {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<SequenceStatus | 'all'>('all')
  const [showCreate, setShowCreate] = useState(false)
  const [sequences, setSequences] = useState(MOCK_SEQUENCES)

  const filtered = useMemo(() => {
    let list = sequences
    if (search.trim()) { const q = search.toLowerCase(); list = list.filter(s => s.name.toLowerCase().includes(q)) }
    if (statusFilter !== 'all') list = list.filter(s => s.status === statusFilter)
    return list
  }, [sequences, search, statusFilter])

  const activeCount = sequences.filter(s => s.status === 'active').length
  const totalEnrolled = sequences.reduce((s, seq) => s + seq.enrolledCount, 0)
  const totalSent = sequences.reduce((s, seq) => s + seq.emailsSent, 0)
  const avgOpen = sequences.length > 0 ? Math.round(sequences.reduce((s, seq) => s + seq.openRate, 0) / sequences.length) : 0

  function handleCreateSequence(name: string, description: string, triggerLabel: string) {
    const newSeq: Sequence = {
      id: `seq-${Date.now()}`, name, description, status: 'draft', triggerLabel,
      steps: [], enrolledCount: 0, completedCount: 0, emailsSent: 0,
      openRate: 0, clickRate: 0, replyRate: 0,
      createdAt: '2026-03-28', updatedAt: '2026-03-28', createdBy: '田中太郎',
    }
    setSequences(prev => [newSeq, ...prev])
    setShowCreate(false)
    router.push(`/automation/${newSeq.id}`)
  }

  const kpis: Array<{ label: string; value: string | number; icon: React.ElementType; tone: ChipTone }> = [
    { label: 'アクティブ',       value: activeCount,     icon: Play,     tone: 'low' },
    { label: '登録中コンタクト', value: totalEnrolled,   icon: Users,    tone: 'primary' },
    { label: 'メール送信数',     value: totalSent,       icon: Mail,     tone: 'primary' },
    { label: '平均開封率',       value: `${avgOpen}%`,   icon: MailOpen, tone: 'middle' },
  ]

  return (
    <ObsPageShell>
      <div className="w-full px-8 xl:px-12 2xl:px-16 pb-16">

        {/* ── Hero ── */}
        <ObsHero
          eyebrow="Automation"
          title="オートメーション"
          caption="シーケンスによるメール自動配信・タスク自動生成でアプローチを効率化。"
          action={
            <ObsButton variant="primary" size="md" onClick={() => setShowCreate(true)}>
              <Plus size={14} className="mr-1.5 inline" strokeWidth={2.5} />
              新規シーケンス
            </ObsButton>
          }
        />

        {/* KPI */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {kpis.map((kpi, i) => (
            <motion.div
              key={kpi.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.28, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
            >
              <ObsCard depth="high" padding="lg" radius="xl">
                <div className="flex items-center gap-2 mb-3">
                  <kpi.icon size={13} style={{ color: 'var(--color-obs-text-subtle)' }} />
                  <span
                    className="text-[11px] font-medium uppercase tracking-[0.1em]"
                    style={{ color: 'var(--color-obs-text-subtle)' }}
                  >
                    {kpi.label}
                  </span>
                </div>
                <p
                  className="font-[family-name:var(--font-display)] text-[32px] font-semibold tracking-[-0.035em] tabular-nums leading-none"
                  style={{ color: 'var(--color-obs-text)' }}
                >
                  {kpi.value}
                </p>
              </ObsCard>
            </motion.div>
          ))}
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-2 mb-6 flex-wrap">
          <div className="relative flex-1 max-w-[320px] min-w-[240px]">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: 'var(--color-obs-text-subtle)' }}
            />
            <ObsInput
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="シーケンス名で検索..."
              className="pl-9"
            />
          </div>
          <div className="flex items-center gap-1.5">
            {[
              { key: 'all' as const, label: '全て' },
              { key: 'active' as const, label: 'アクティブ' },
              { key: 'paused' as const, label: '一時停止' },
              { key: 'draft' as const, label: '下書き' },
            ].map(f => {
              const active = statusFilter === f.key
              return (
                <ObsButton
                  key={f.key}
                  variant={active ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => setStatusFilter(f.key)}
                >
                  {f.label}
                </ObsButton>
              )
            })}
          </div>
        </div>

        {/* Sequence cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
          {filtered.map((seq, i) => {
            const st = STATUS_TONE[seq.status]
            return (
              <motion.div
                key={seq.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.28, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
              >
                <ObsCard
                  depth="high"
                  padding="lg"
                  radius="xl"
                  onClick={() => router.push(`/automation/${seq.id}`)}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4 gap-3">
                    <div className="flex-1 min-w-0">
                      <h3
                        className="font-[family-name:var(--font-display)] text-[16px] font-semibold truncate tracking-[-0.02em]"
                        style={{ color: 'var(--color-obs-text)' }}
                      >
                        {seq.name}
                      </h3>
                      <p className="text-[12px] mt-1 line-clamp-2" style={{ color: 'var(--color-obs-text-muted)' }}>
                        {seq.description}
                      </p>
                    </div>
                    <ObsChip tone={st.tone} className="shrink-0">
                      {st.label}
                    </ObsChip>
                  </div>

                  {/* Trigger */}
                  <div className="flex items-center gap-2 mb-4">
                    <span
                      className="text-[11px] font-medium uppercase tracking-[0.08em]"
                      style={{ color: 'var(--color-obs-text-subtle)' }}
                    >
                      トリガー
                    </span>
                    <ObsChip tone="primary">{seq.triggerLabel}</ObsChip>
                  </div>

                  {/* Steps preview — monotone editorial */}
                  <div className="flex items-center gap-1.5 mb-5 flex-wrap">
                    {seq.steps.map((step, si) => {
                      const StepIcon = STEP_ICONS[step.type] || Clock
                      // email だけ primary 微アクセント、残りは muted
                      const isEmail = step.type === 'email'
                      return (
                        <div key={si} className="flex items-center gap-1.5">
                          {si > 0 && (
                            <div
                              className="w-2 h-px"
                              style={{ backgroundColor: 'var(--color-obs-outline-variant)', opacity: 0.4 }}
                            />
                          )}
                          <div
                            className="w-[26px] h-[26px] rounded-[var(--radius-obs-sm)] flex items-center justify-center"
                            style={{ backgroundColor: 'var(--color-obs-surface-highest)' }}
                          >
                            <StepIcon
                              size={12}
                              style={{
                                color: isEmail
                                  ? 'var(--color-obs-primary-dim)'
                                  : 'var(--color-obs-text-subtle)',
                              }}
                            />
                          </div>
                        </div>
                      )
                    })}
                    <span className="text-[11px] ml-1.5 font-medium" style={{ color: 'var(--color-obs-text-subtle)' }}>
                      {seq.steps.length}ステップ
                    </span>
                  </div>

                  {/* Stats — tonal only, no color jump */}
                  <div className="grid grid-cols-4 gap-4 pt-5 mt-1" style={{ boxShadow: 'inset 0 1px 0 0 var(--color-obs-surface-lowest)' }}>
                    {[
                      { label: '登録', value: `${seq.enrolledCount}`, suffix: '名' },
                      { label: '開封', value: `${seq.openRate}`, suffix: '%' },
                      { label: 'クリック', value: `${seq.clickRate}`, suffix: '%' },
                      { label: '返信', value: `${seq.replyRate}`, suffix: '%' },
                    ].map((s) => (
                      <div key={s.label} className="flex flex-col gap-1">
                        <span
                          className="text-[10px] uppercase tracking-[0.08em] font-medium"
                          style={{ color: 'var(--color-obs-text-subtle)' }}
                        >
                          {s.label}
                        </span>
                        <span
                          className="font-[family-name:var(--font-display)] text-[17px] font-semibold tracking-[-0.02em] tabular-nums"
                          style={{ color: 'var(--color-obs-text)' }}
                        >
                          {s.value}
                          <span className="text-[11px] font-medium ml-0.5" style={{ color: 'var(--color-obs-text-subtle)' }}>
                            {s.suffix}
                          </span>
                        </span>
                      </div>
                    ))}
                  </div>
                </ObsCard>
              </motion.div>
            )
          })}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <p className="text-[14px]" style={{ color: 'var(--color-obs-text-muted)' }}>
              シーケンスが見つかりません
            </p>
          </div>
        )}

        {/* Create Sequence Modal */}
        <CreateSequenceModal open={showCreate} onClose={() => setShowCreate(false)} onCreate={handleCreateSequence} />
      </div>
    </ObsPageShell>
  )
}

// ─── Create Sequence Modal ──────────────────────────────────────────────────

function CreateSequenceModal({ open, onClose, onCreate }: {
  open: boolean; onClose: () => void
  onCreate: (name: string, description: string, triggerLabel: string) => void
}) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [triggerType, setTriggerType] = useState<TriggerType>('approach')
  const [selectedConditions, setSelectedConditions] = useState<string[]>([])

  const conditionOptions = triggerType === 'approach' ? APPROACH_OPTIONS
    : triggerType === 'phase' ? PHASE_OPTIONS
    : triggerType === 'pipeline' ? PIPELINE_OPTIONS
    : []

  function toggleCondition(c: string) {
    setSelectedConditions(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c])
  }

  function handleSubmit() {
    if (!name.trim()) return
    const triggerTypeLabel = TRIGGER_OPTIONS.find(t => t.key === triggerType)?.label || ''
    const condLabel = selectedConditions.length > 0 ? selectedConditions.join(' / ') : '全て'
    const triggerLabel = triggerType === 'manual' ? '手動登録' : `${triggerTypeLabel} = ${condLabel}`
    onCreate(name.trim(), description.trim(), triggerLabel)
    setName(''); setDescription(''); setTriggerType('approach'); setSelectedConditions([])
  }

  if (!open) return null

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            className="relative w-full max-w-[540px] max-h-[85vh] overflow-hidden flex flex-col rounded-[var(--radius-obs-xl)]"
            style={{
              backgroundColor: 'var(--color-obs-surface-highest)',
              boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
            }}
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-6 py-4"
              style={{ boxShadow: 'inset 0 -1px 0 0 var(--color-obs-surface-low)' }}
            >
              <h2 className="text-[16px] font-bold" style={{ color: 'var(--color-obs-text)' }}>
                新規シーケンス作成
              </h2>
              <button
                onClick={onClose}
                className="w-7 h-7 rounded-full flex items-center justify-center transition-colors"
                onMouseOver={(e) => {
                  ;(e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--color-obs-surface-high)'
                }}
                onMouseOut={(e) => {
                  ;(e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent'
                }}
              >
                <X size={15} style={{ color: 'var(--color-obs-text-muted)' }} />
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-5 overflow-y-auto flex-1">
              <div className="space-y-5">
                {/* Name */}
                <div>
                  <label
                    className="text-[11px] font-medium uppercase tracking-[0.08em] block mb-1.5"
                    style={{ color: 'var(--color-obs-text-subtle)' }}
                  >
                    シーケンス名 <span style={{ color: 'var(--color-obs-hot)' }}>*</span>
                  </label>
                  <ObsInput
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="例: 未着手 → 初回接触"
                  />
                </div>

                {/* Description */}
                <div>
                  <label
                    className="text-[11px] font-medium uppercase tracking-[0.08em] block mb-1.5"
                    style={{ color: 'var(--color-obs-text-subtle)' }}
                  >
                    説明
                  </label>
                  <ObsInput
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="このシーケンスの目的を入力"
                  />
                </div>

                {/* Trigger type */}
                <div>
                  <label
                    className="text-[11px] font-medium uppercase tracking-[0.08em] mb-2 block"
                    style={{ color: 'var(--color-obs-text-subtle)' }}
                  >
                    トリガー条件
                  </label>
                  <div className="space-y-2">
                    {TRIGGER_OPTIONS.map(opt => {
                      const active = triggerType === opt.key
                      return (
                        <button
                          key={opt.key}
                          onClick={() => { setTriggerType(opt.key); setSelectedConditions([]) }}
                          className="w-full flex items-start gap-3 p-3 rounded-[var(--radius-obs-md)] text-left transition-colors"
                          style={{
                            backgroundColor: active ? 'var(--color-obs-surface-low)' : 'var(--color-obs-surface-high)',
                          }}
                          onMouseOver={(e) => {
                            if (!active) (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--color-obs-surface-low)'
                          }}
                          onMouseOut={(e) => {
                            if (!active) (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--color-obs-surface-high)'
                          }}
                        >
                          <div
                            className="w-[16px] h-[16px] rounded-full flex items-center justify-center shrink-0 mt-0.5"
                            style={{
                              boxShadow: `inset 0 0 0 2px ${active ? 'var(--color-obs-primary)' : 'var(--color-obs-outline)'}`,
                            }}
                          >
                            {active && (
                              <div
                                className="w-[8px] h-[8px] rounded-full"
                                style={{ backgroundColor: 'var(--color-obs-primary)' }}
                              />
                            )}
                          </div>
                          <div>
                            <p
                              className="text-[13px] font-medium"
                              style={{ color: active ? 'var(--color-obs-primary)' : 'var(--color-obs-text)' }}
                            >
                              {opt.label}
                            </p>
                            <p className="text-[11px] mt-0.5" style={{ color: 'var(--color-obs-text-muted)' }}>
                              {opt.description}
                            </p>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Condition values */}
                {triggerType !== 'manual' && conditionOptions.length > 0 && (
                  <div>
                    <label
                      className="text-[11px] font-medium uppercase tracking-[0.08em] mb-2 block"
                      style={{ color: 'var(--color-obs-text-subtle)' }}
                    >
                      対象ステータス（複数選択可）
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {conditionOptions.map(c => {
                        const selected = selectedConditions.includes(c)
                        return (
                          <ObsButton
                            key={c}
                            variant={selected ? 'primary' : 'ghost'}
                            size="sm"
                            onClick={() => toggleCondition(c)}
                          >
                            {c}
                          </ObsButton>
                        )
                      })}
                    </div>
                    {selectedConditions.length === 0 && (
                      <p className="text-[11px] mt-2" style={{ color: 'var(--color-obs-text-subtle)' }}>
                        選択なしの場合、すべての変更で発動します
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div
              className="flex justify-end gap-2 px-6 py-4"
              style={{ boxShadow: 'inset 0 1px 0 0 var(--color-obs-surface-low)' }}
            >
              <ObsButton variant="ghost" onClick={onClose}>キャンセル</ObsButton>
              <ObsButton variant="primary" onClick={handleSubmit} disabled={!name.trim()}>
                作成してビルダーへ
              </ObsButton>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
