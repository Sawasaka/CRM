'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, Mail, Clock, GitBranch, CheckSquare, Plus, MailOpen, MousePointerClick, Reply, Play, Pause, Trash2, Edit3 } from 'lucide-react'
import type { Sequence, SequenceStep, SequenceEnrollment, StepType } from '@/types/crm'

// ─── Mock Data ───────────────────────────────────────────────────────────────

const MOCK_SEQUENCES: Record<string, Sequence> = {
  'seq-1': { id: 'seq-1', name: '未着手 → 初回接触', description: '未着手のコンタクトに3日後自動メール＋コールタスク', status: 'active', triggerLabel: 'アプローチ = 未着手', steps: [{ type: 'wait', label: '3日待機', detail: '3日後に次ステップ' }, { type: 'email', label: 'ご挨拶メール', detail: '件名: {{company_name}}様 — ご紹介のご挨拶' }, { type: 'wait', label: '2日待機', detail: '2日後にコールタスク' }, { type: 'task', label: 'コールタスク作成', detail: '初回フォローコール' }], enrolledCount: 12, completedCount: 5, emailsSent: 18, openRate: 42, clickRate: 12, replyRate: 8, createdAt: '2026-03-10', updatedAt: '2026-03-26', createdBy: '田中太郎' },
  'seq-2': { id: 'seq-2', name: '不通/不在 → フォロー', description: '不通・不在のコンタクトへの段階的フォローアップ', status: 'active', triggerLabel: 'アプローチ = 不通 / 不在', steps: [{ type: 'wait', label: '1日待機', detail: '' }, { type: 'email', label: 'フォローメール①', detail: '件名: ご不在でしたので改めて...' }, { type: 'wait', label: '3日待機', detail: '' }, { type: 'email', label: 'フォローメール②', detail: '件名: その後いかがでしょうか' }, { type: 'wait', label: '5日待機', detail: '' }, { type: 'task', label: 'コールタスク', detail: '最終フォローコール' }], enrolledCount: 8, completedCount: 3, emailsSent: 22, openRate: 35, clickRate: 8, replyRate: 5, createdAt: '2026-03-12', updatedAt: '2026-03-25', createdBy: '田中太郎' },
  'seq-5': { id: 'seq-5', name: '失注ナーチャリング', description: '失注コンタクトへの長期ナーチャリングシーケンス', status: 'active', triggerLabel: 'フェーズ = 失注', steps: [{ type: 'wait', label: '7日待機', detail: '' }, { type: 'email', label: 'お役立ちコンテンツ', detail: '件名: {{industry}}業界の最新トレンドをお届け' }, { type: 'wait', label: '30日待機', detail: '' }, { type: 'email', label: '事例紹介', detail: '件名: 同業他社の成功事例のご紹介' }, { type: 'wait', label: '60日待機', detail: '' }, { type: 'email', label: '新機能案内', detail: '件名: 新機能リリースのお知らせ' }, { type: 'wait', label: '90日待機', detail: '' }, { type: 'task', label: 'コールタスク', detail: '再アプローチコール' }], enrolledCount: 15, completedCount: 2, emailsSent: 35, openRate: 28, clickRate: 6, replyRate: 3, createdAt: '2026-03-05', updatedAt: '2026-03-26', createdBy: '田中太郎' },
}

const MOCK_ENROLLMENTS: Record<string, SequenceEnrollment[]> = {
  'seq-1': [
    { id: 'enr-1', sequenceId: 'seq-1', contactName: '鈴木 美香', companyName: '株式会社ネクスト', currentStepIndex: 0, status: 'active', enrolledAt: '2026-03-24', lastActionAt: null },
    { id: 'enr-2', sequenceId: 'seq-1', contactName: '加藤 雄介', companyName: '合同会社ビジョン', currentStepIndex: 1, status: 'active', enrolledAt: '2026-03-22', lastActionAt: '2026-03-25' },
    { id: 'enr-3', sequenceId: 'seq-1', contactName: '高橋 健一', companyName: '株式会社デジタルフォース', currentStepIndex: 3, status: 'completed', enrolledAt: '2026-03-18', lastActionAt: '2026-03-25' },
  ],
  'seq-2': [
    { id: 'enr-4', sequenceId: 'seq-2', contactName: '中村 理恵', companyName: '株式会社グロース', currentStepIndex: 2, status: 'active', enrolledAt: '2026-03-20', lastActionAt: '2026-03-24' },
    { id: 'enr-5', sequenceId: 'seq-2', contactName: '小林 健太', companyName: '有限会社サクセス', currentStepIndex: 4, status: 'active', enrolledAt: '2026-03-18', lastActionAt: '2026-03-26' },
  ],
  'seq-5': [
    { id: 'enr-6', sequenceId: 'seq-5', contactName: '吉田 千春', companyName: '株式会社スタート', currentStepIndex: 1, status: 'active', enrolledAt: '2026-03-10', lastActionAt: '2026-03-17' },
    { id: 'enr-7', sequenceId: 'seq-5', contactName: '渡辺 健二', companyName: '株式会社アルファ', currentStepIndex: 3, status: 'active', enrolledAt: '2026-03-01', lastActionAt: '2026-03-20' },
    { id: 'enr-8', sequenceId: 'seq-5', contactName: '佐藤 良子', companyName: '合同会社ベータ', currentStepIndex: 7, status: 'completed', enrolledAt: '2026-01-15', lastActionAt: '2026-03-15' },
  ],
}

const STEP_ICONS: Record<string, React.ElementType> = { wait: Clock, email: Mail, condition: GitBranch, task: CheckSquare }
const STEP_COLORS: Record<string, { bg: string; color: string }> = {
  wait: { bg: 'rgba(0,0,0,0.04)', color: '#CCDDF0' },
  email: { bg: 'rgba(94,92,230,0.1)', color: '#5E5CE6' },
  condition: { bg: 'rgba(255,159,10,0.1)', color: '#FF9F0A' },
  task: { bg: 'rgba(52,199,89,0.1)', color: '#34C759' },
}
const DEFAULT_STEP_COLOR = { bg: 'rgba(0,0,0,0.04)', color: '#CCDDF0' }
const ENROLL_STATUS: Record<string, { bg: string; text: string }> = {
  active: { bg: 'rgba(0,113,227,0.1)', text: '#0071E3' },
  completed: { bg: 'rgba(52,199,89,0.1)', text: '#1A7A35' },
  paused: { bg: 'rgba(255,159,10,0.1)', text: '#C07000' },
  exited: { bg: 'rgba(255,59,48,0.1)', text: '#CF3131' },
}
const DEFAULT_ENROLL_STATUS = { bg: 'rgba(0,113,227,0.1)', text: '#0071E3' }
const CARD_SHADOW = '0 0 0 1px rgba(0,0,0,0.05), 0 2px 8px rgba(0,0,0,0.07), 0 8px 28px rgba(0,0,0,0.05)'

type Tab = 'builder' | 'monitor' | 'performance'

// ─── Page ────────────────────────────────────────────────────────────────────

const STEP_TYPE_OPTIONS: { key: StepType; label: string; icon: React.ElementType; color: string; bg: string }[] = [
  { key: 'wait',      label: '待機',     icon: Clock,       color: '#CCDDF0', bg: 'rgba(0,0,0,0.04)' },
  { key: 'email',     label: 'メール',   icon: Mail,        color: '#5E5CE6', bg: 'rgba(94,92,230,0.1)' },
  { key: 'condition', label: '条件分岐', icon: GitBranch,   color: '#FF9F0A', bg: 'rgba(255,159,10,0.1)' },
  { key: 'task',      label: 'タスク',   icon: CheckSquare, color: '#34C759', bg: 'rgba(52,199,89,0.1)' },
]

export default function AutomationDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [tab, setTab] = useState<Tab>('builder')

  const seqData = MOCK_SEQUENCES[id]
  const enrollments = MOCK_ENROLLMENTS[id] || []

  const [steps, setSteps] = useState<SequenceStep[]>(seqData?.steps || [])
  const [showAddStep, setShowAddStep] = useState<number | null>(null)
  const [editingStep, setEditingStep] = useState<number | null>(null)
  const [editForm, setEditForm] = useState({ label: '', detail: '' })

  const seq = seqData ? { ...seqData, steps } : null

  if (!seq) return <div className="text-center py-20"><p className="text-[14px] text-[#AEAEB2]">シーケンスが見つかりません</p></div>

  function addStep(index: number, type: StepType) {
    const newStep: SequenceStep = {
      type,
      label: type === 'wait' ? '1日待機' : type === 'email' ? '新規メール' : type === 'condition' ? '条件チェック' : '新規タスク',
      detail: type === 'wait' ? '1日後に次ステップ' : type === 'email' ? '件名を入力...' : type === 'condition' ? '開封した場合' : 'タスク内容を入力',
    }
    setSteps(prev => [...prev.slice(0, index), newStep, ...prev.slice(index)])
    setShowAddStep(null)
    setEditingStep(index)
    setEditForm({ label: newStep.label, detail: newStep.detail })
  }

  function deleteStep(index: number) {
    setSteps(prev => prev.filter((_, i) => i !== index))
    if (editingStep === index) setEditingStep(null)
  }

  function startEdit(index: number) {
    const step = steps[index]
    if (!step) return
    setEditingStep(index)
    setEditForm({ label: step.label, detail: step.detail })
  }

  function saveEdit() {
    if (editingStep === null) return
    setSteps(prev => prev.map((s, i) => i === editingStep ? { ...s, label: editForm.label, detail: editForm.detail } : s))
    setEditingStep(null)
  }

  const TABS: { key: Tab; label: string }[] = [
    { key: 'builder', label: 'ビルダー' },
    { key: 'monitor', label: `モニター (${enrollments.length})` },
    { key: 'performance', label: 'パフォーマンス' },
  ]

  return (
    <div className="space-y-5">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}>
        <button onClick={() => router.push('/automation')} className="flex items-center gap-1 text-[13px] text-[#CCDDF0] hover:text-[#1D1D1F] transition-colors mb-2">
          <ChevronLeft size={14} />オートメーション
        </button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[21px] font-semibold text-[#1D1D1F] tracking-[-0.03em]">{seq.name}</h1>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-[12px] font-medium px-2 py-0.5 rounded-[4px] bg-[rgba(0,85,255,0.08)] text-[#0055FF]">{seq.triggerLabel}</span>
              <span className="text-[12px] text-[#CCDDF0]">{seq.steps.length}ステップ</span>
              <span className="text-[12px] text-[#CCDDF0]">登録{seq.enrolledCount}名</span>
            </div>
          </div>
          <button className="h-[34px] px-4 flex items-center gap-2 text-[13px] font-medium rounded-[8px]"
            style={{ background: seq.status === 'active' ? 'rgba(255,159,10,0.1)' : 'rgba(52,199,89,0.1)', color: seq.status === 'active' ? '#C07000' : '#1A7A35' }}>
            {seq.status === 'active' ? <><Pause size={14} />一時停止</> : <><Play size={14} />開始</>}
          </button>
        </div>
      </motion.div>

      {/* Tab bar */}
      <div className="bg-white rounded-[14px] overflow-hidden" style={{ boxShadow: CARD_SHADOW }}>
        <div className="flex" style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
          {TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`relative px-5 py-3.5 text-[13px] font-medium transition-colors ${tab === t.key ? 'text-[#0071E3]' : 'text-[#CCDDF0] hover:text-[#1D1D1F]'}`}>
              {t.label}
              {tab === t.key && <motion.div layoutId="auto-tab" className="absolute bottom-0 left-0 right-0 h-[2px] rounded-full" style={{ background: '#0071E3' }} />}
            </button>
          ))}
        </div>

        <div className="p-5">
          <AnimatePresence mode="wait">
            {/* Builder tab */}
            {tab === 'builder' && (
              <motion.div key="builder" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.2 }}>
                <div className="max-w-[520px] mx-auto">
                  {/* Add at top */}
                  <div className="flex justify-center mb-2">
                    <AddStepButton index={0} showAddStep={showAddStep} setShowAddStep={setShowAddStep} addStep={addStep} />
                  </div>

                  {steps.map((step, si) => {
                    const StepIcon = STEP_ICONS[step.type] || Clock
                    const sc = STEP_COLORS[step.type] ?? DEFAULT_STEP_COLOR
                    const enrolledHere = enrollments.filter(e => e.currentStepIndex === si && e.status === 'active').length
                    const isEditing = editingStep === si

                    return (
                      <div key={si}>
                        {/* Step card */}
                        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.22, delay: si * 0.04, ease: [0.16, 1, 0.3, 1] }}
                          className="rounded-[12px] p-4 group" style={{ border: isEditing ? '1px solid rgba(0,85,255,0.3)' : '1px solid rgba(0,0,0,0.06)', boxShadow: isEditing ? '0 0 0 3px rgba(0,85,255,0.08)' : 'none' }}>
                          <div className="flex items-start gap-3">
                            <div className="w-[36px] h-[36px] rounded-[9px] flex items-center justify-center shrink-0" style={{ background: sc.bg }}>
                              <StepIcon size={16} style={{ color: sc.color }} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-medium text-[#AEAEB2] uppercase tracking-[0.04em]">Step {si + 1}</span>
                                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-[3px]" style={{ background: sc.bg, color: sc.color }}>
                                  {step.type === 'wait' ? '待機' : step.type === 'email' ? 'メール' : step.type === 'condition' ? '条件分岐' : 'タスク'}
                                </span>
                                {enrolledHere > 0 && (
                                  <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-[3px] bg-[rgba(0,113,227,0.1)] text-[#0071E3]">{enrolledHere}名</span>
                                )}
                              </div>

                              {isEditing ? (
                                <div className="mt-2 space-y-2">
                                  <input value={editForm.label} onChange={e => setEditForm(f => ({ ...f, label: e.target.value }))}
                                    className="w-full h-[34px] px-3 text-[13px] rounded-[8px] text-[#1D1D1F] outline-none font-medium"
                                    style={{ background: 'rgba(0,0,0,0.04)' }} placeholder="ステップ名" />
                                  <input value={editForm.detail} onChange={e => setEditForm(f => ({ ...f, detail: e.target.value }))}
                                    className="w-full h-[34px] px-3 text-[13px] rounded-[8px] text-[#1D1D1F] outline-none"
                                    style={{ background: 'rgba(0,0,0,0.04)' }} placeholder="詳細・件名など" />
                                  <div className="flex gap-2">
                                    <button onClick={saveEdit} className="h-[28px] px-3 text-[12px] font-medium text-white rounded-[6px] bg-[#0071E3]">保存</button>
                                    <button onClick={() => setEditingStep(null)} className="h-[28px] px-3 text-[12px] font-medium text-[#CCDDF0] rounded-[6px] hover:bg-[rgba(0,0,0,0.04)]">キャンセル</button>
                                  </div>
                                </div>
                              ) : (
                                <>
                                  <p className="text-[14px] font-medium text-[#1D1D1F] mt-1">{step.label}</p>
                                  {step.detail && <p className="text-[12px] text-[#CCDDF0] mt-0.5">{step.detail}</p>}
                                </>
                              )}
                            </div>

                            {/* Edit/Delete buttons */}
                            {!isEditing && (
                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                                <button onClick={() => startEdit(si)} className="w-[26px] h-[26px] rounded-[6px] flex items-center justify-center hover:bg-[rgba(0,0,0,0.06)] transition-colors">
                                  <Edit3 size={12} style={{ color: '#CCDDF0' }} />
                                </button>
                                <button onClick={() => deleteStep(si)} className="w-[26px] h-[26px] rounded-[6px] flex items-center justify-center hover:bg-[rgba(255,59,48,0.08)] transition-colors">
                                  <Trash2 size={12} style={{ color: '#FF3B30' }} />
                                </button>
                              </div>
                            )}
                          </div>
                        </motion.div>

                        {/* Connector + add */}
                        <div className="flex justify-center py-1">
                          <AddStepButton index={si + 1} showAddStep={showAddStep} setShowAddStep={setShowAddStep} addStep={addStep} />
                        </div>
                      </div>
                    )
                  })}

                  {steps.length === 0 && (
                    <div className="text-center py-12 rounded-[12px]" style={{ border: '2px dashed rgba(0,0,0,0.08)' }}>
                      <p className="text-[14px] text-[#CCDDF0] mb-3">ステップがまだありません</p>
                      <p className="text-[12px] text-[#AEAEB2]">上の「+」ボタンからステップを追加してください</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Monitor tab */}
            {tab === 'monitor' && (
              <motion.div key="monitor" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.2 }}>
                <div className="rounded-[12px] overflow-hidden" style={{ border: '1px solid rgba(0,0,0,0.06)' }}>
                  <div className="grid grid-cols-[1fr_1fr_100px_80px_90px_90px] items-center px-4 py-2" style={{ borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
                    {['コンタクト', '企業', '現ステップ', 'ステータス', '登録日', '最終アクション'].map(h => (
                      <span key={h} className="text-[11px] font-medium text-[#AEAEB2] uppercase tracking-[0.04em]">{h}</span>
                    ))}
                  </div>
                  {enrollments.map((enr, i) => {
                    const es = ENROLL_STATUS[enr.status] ?? DEFAULT_ENROLL_STATUS
                    return (
                      <motion.div key={enr.id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2, delay: i * 0.04 }}
                        className="grid grid-cols-[1fr_1fr_100px_80px_90px_90px] items-center px-4 py-3"
                        style={{ borderBottom: i < enrollments.length - 1 ? '1px solid rgba(0,0,0,0.04)' : 'none' }}>
                        <span className="text-[13px] font-medium text-[#1D1D1F]">{enr.contactName}</span>
                        <span className="text-[13px] text-[#CCDDF0]">{enr.companyName}</span>
                        <span className="text-[12px] text-[#CCDDF0]">Step {enr.currentStepIndex + 1}/{seq.steps.length}</span>
                        <span className="text-[11px] font-medium px-2 py-0.5 rounded-[4px]" style={{ background: es.bg, color: es.text }}>
                          {enr.status === 'active' ? '進行中' : enr.status === 'completed' ? '完了' : enr.status === 'paused' ? '停止' : '離脱'}
                        </span>
                        <span className="text-[12px] text-[#AEAEB2]">{enr.enrolledAt.slice(5)}</span>
                        <span className="text-[12px] text-[#AEAEB2]">{enr.lastActionAt ? enr.lastActionAt.slice(5) : '—'}</span>
                      </motion.div>
                    )
                  })}
                  {enrollments.length === 0 && <div className="text-center py-10"><p className="text-[13px] text-[#AEAEB2]">登録中のコンタクトはいません</p></div>}
                </div>
              </motion.div>
            )}

            {/* Performance tab */}
            {tab === 'performance' && (
              <motion.div key="performance" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.2 }}>
                {/* KPI */}
                <div className="grid grid-cols-4 gap-3 mb-5">
                  {[
                    { label: 'メール送信', value: seq.emailsSent, color: '#5E5CE6', icon: Mail },
                    { label: '開封率', value: `${seq.openRate}%`, color: '#0071E3', icon: MailOpen },
                    { label: 'クリック率', value: `${seq.clickRate}%`, color: '#FF9F0A', icon: MousePointerClick },
                    { label: '返信率', value: `${seq.replyRate}%`, color: '#34C759', icon: Reply },
                  ].map(kpi => (
                    <div key={kpi.label} className="rounded-[10px] px-4 py-3" style={{ background: `${kpi.color}0A` }}>
                      <div className="flex items-center gap-1.5 mb-1"><kpi.icon size={12} style={{ color: kpi.color }} /><span className="text-[10px] text-[#CCDDF0]">{kpi.label}</span></div>
                      <p className="text-[22px] font-bold tracking-[-0.03em]" style={{ color: kpi.color }}>{kpi.value}</p>
                    </div>
                  ))}
                </div>

                {/* Step performance table */}
                <div className="rounded-[12px] overflow-hidden" style={{ border: '1px solid rgba(0,0,0,0.06)' }}>
                  <div className="px-4 py-2.5" style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                    <h4 className="text-[13px] font-semibold text-[#1D1D1F]">ステップ別パフォーマンス</h4>
                  </div>
                  <div className="grid grid-cols-[40px_1fr_80px_80px] items-center px-4 py-2" style={{ borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
                    {['#', 'ステップ', '通過人数', 'ステータス'].map(h => <span key={h} className="text-[11px] font-medium text-[#AEAEB2] uppercase tracking-[0.04em]">{h}</span>)}
                  </div>
                  {seq.steps.map((step, si) => {
                    const sc = STEP_COLORS[step.type] ?? DEFAULT_STEP_COLOR
                    const passed = enrollments.filter(e => e.currentStepIndex > si || e.status === 'completed').length
                    const here = enrollments.filter(e => e.currentStepIndex === si && e.status === 'active').length
                    return (
                      <div key={si} className="grid grid-cols-[40px_1fr_80px_80px] items-center px-4 py-2.5" style={{ borderBottom: si < seq.steps.length - 1 ? '1px solid rgba(0,0,0,0.04)' : 'none' }}>
                        <span className="text-[12px] text-[#AEAEB2]">{si + 1}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-[3px]" style={{ background: sc.bg, color: sc.color }}>
                            {step.type === 'wait' ? '待機' : step.type === 'email' ? 'メール' : step.type === 'condition' ? '条件' : 'タスク'}
                          </span>
                          <span className="text-[13px] text-[#1D1D1F]">{step.label}</span>
                        </div>
                        <span className="text-[13px] tabular-nums font-semibold text-[#1D1D1F]">{passed}名</span>
                        <span className="text-[12px] text-[#0071E3] font-medium">{here > 0 ? `${here}名 待機中` : '—'}</span>
                      </div>
                    )
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

// ─── Add Step Button ────────────────────────────────────────────────────────

function AddStepButton({ index, showAddStep, setShowAddStep, addStep }: {
  index: number
  showAddStep: number | null
  setShowAddStep: (v: number | null) => void
  addStep: (index: number, type: StepType) => void
}) {
  const isOpen = showAddStep === index

  return (
    <div className="relative flex flex-col items-center">
      <div className="w-px h-3 bg-[rgba(0,0,0,0.08)]" />
      <button onClick={() => setShowAddStep(isOpen ? null : index)}
        className="w-[26px] h-[26px] rounded-full flex items-center justify-center transition-all"
        style={{
          border: isOpen ? '1.5px solid #0071E3' : '1.5px dashed rgba(0,0,0,0.15)',
          background: isOpen ? 'rgba(0,113,227,0.08)' : 'transparent',
        }}>
        <Plus size={11} style={{ color: isOpen ? '#0071E3' : '#AEAEB2' }} />
      </button>
      <div className="w-px h-3 bg-[rgba(0,0,0,0.08)]" />

      {/* Step type picker */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute top-[50%] left-[calc(50%+24px)] -translate-y-1/2 z-20 bg-white rounded-[12px] p-2 flex gap-1.5"
            style={{ boxShadow: '0 0 0 1px rgba(0,0,0,0.06), 0 8px 24px rgba(0,0,0,0.12)' }}>
            {STEP_TYPE_OPTIONS.map(opt => (
              <button key={opt.key} onClick={() => addStep(index, opt.key)}
                className="flex flex-col items-center gap-1 w-[64px] py-2 rounded-[8px] hover:bg-[rgba(0,0,0,0.04)] transition-colors">
                <div className="w-[28px] h-[28px] rounded-[7px] flex items-center justify-center" style={{ background: opt.bg }}>
                  <opt.icon size={14} style={{ color: opt.color }} />
                </div>
                <span className="text-[10px] font-medium text-[#CCDDF0]">{opt.label}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
