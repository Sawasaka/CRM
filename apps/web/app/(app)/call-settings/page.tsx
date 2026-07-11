'use client'

import { useEffect, useMemo, useState } from 'react'
import type React from 'react'
import Link from 'next/link'
import { Bot, FileText, Loader2, PhoneCall, Plus, Radio, Save, Trash2, Upload } from 'lucide-react'
import { ObsButton, ObsCard, ObsHero, ObsPageShell } from '@/components/obsidian'

type Scenario = {
  key: string
  name: string
  objective: string
  openingTalk: string
  requiredQuestions: string[]
  optionalQuestions: string[]
  ngResponses: string[]
  schedulingPolicy: string
  handoffConditions: string[]
  completionCriteria: string
  ragSources: string[]
  enabled: boolean
}

const EMPTY_SCENARIO: Scenario = {
  key: 'inquiry-default',
  name: '',
  objective: '',
  openingTalk: '',
  requiredQuestions: [],
  optionalQuestions: [],
  ngResponses: [],
  schedulingPolicy: '',
  handoffConditions: [],
  completionCriteria: '',
  ragSources: [],
  enabled: true,
}

const SCENARIO_LABELS: Record<string, { title: string; caption: string; badge: string }> = {
  'inquiry-default': {
    title: 'HP未予約フォロー',
    caption: '資料請求・問い合わせ後、約3分未予約なら架電',
    badge: '3分後',
  },
  'bdr-outbound': {
    title: 'BDRアウトバウンド',
    caption: '受付突破・担当接続・15分商談化',
    badge: 'BDR',
  },
}

export default function CallSettingsPage() {
  const [scenario, setScenario] = useState<Scenario>(EMPTY_SCENARIO)
  const [scenarios, setScenarios] = useState<Scenario[]>([])
  const [activeScenarioKey, setActiveScenarioKey] = useState(EMPTY_SCENARIO.key)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [lastSavedSnapshot, setLastSavedSnapshot] = useState('')

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch('/api/call-settings/scenario', { cache: 'no-store' })
        const json = await res.json().catch(() => ({}))
        if (!res.ok) throw new Error(json.error || '読み込みに失敗しました。')
        if (!cancelled) {
          const loadedScenarios = Array.isArray(json.scenarios)
            ? json.scenarios.map((item: Scenario) => ({ ...EMPTY_SCENARIO, ...item }))
            : [{ ...EMPTY_SCENARIO, ...json.scenario }]
          const loadedScenario = loadedScenarios[0] ?? { ...EMPTY_SCENARIO, ...json.scenario }
          setScenarios(loadedScenarios)
          setActiveScenarioKey(loadedScenario.key)
          setScenario(loadedScenario)
          setLastSavedSnapshot(scenarioSnapshot(loadedScenario))
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : '読み込みに失敗しました。')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  const hasChanges = useMemo(
    () => Boolean(lastSavedSnapshot) && scenarioSnapshot(scenario) !== lastSavedSnapshot,
    [lastSavedSnapshot, scenario],
  )

  const save = async () => {
    if (!hasChanges || saving) return
    setSaving(true)
    setMessage(null)
    setError(null)
    try {
      const res = await fetch('/api/call-settings/scenario', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(scenario),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json.error || '保存に失敗しました。')
      const savedScenario = { ...EMPTY_SCENARIO, ...json.scenario }
      const savedScenarios = Array.isArray(json.scenarios)
        ? json.scenarios.map((item: Scenario) => ({ ...EMPTY_SCENARIO, ...item }))
        : scenarios.map((item) => (item.key === savedScenario.key ? savedScenario : item))
      setScenarios(savedScenarios)
      setActiveScenarioKey(savedScenario.key)
      setScenario(savedScenario)
      setLastSavedSnapshot(scenarioSnapshot(savedScenario))
      setMessage('コールシナリオを保存しました。次回のAIコールから反映されます。')
    } catch (err) {
      setError(err instanceof Error ? err.message : '保存に失敗しました。')
    } finally {
      setSaving(false)
    }
  }

  const update = (key: keyof Scenario, value: string | boolean | string[]) => {
    setScenario((current) => ({ ...current, [key]: value }))
  }

  const selectScenario = (key: string) => {
    const next = scenarios.find((item) => item.key === key)
    if (!next) return
    setActiveScenarioKey(key)
    setScenario(next)
    setLastSavedSnapshot(scenarioSnapshot(next))
    setMessage(null)
    setError(null)
  }

  const updateRagText = (value: string) => {
    setScenario((current) => ({
      ...current,
      ragSources: mergeRagSources(value, getRagPdfFiles(current.ragSources)),
    }))
  }

  const updateRagPdfFiles = (files: string[]) => {
    setScenario((current) => ({
      ...current,
      ragSources: mergeRagSources(getRagText(current.ragSources), files),
    }))
  }

  return (
    <ObsPageShell>
      <div className="w-full px-8 xl:px-12 2xl:px-16 pb-16">
        <ObsHero
          eyebrow="Call Native CRM"
          title="コール設定"
          caption="問い合わせ直後のAI架電、日程調整、事前ヒアリングのシナリオを管理。"
          action={
            <div className="flex items-center gap-2">
              <Link
                href="/call-settings/model-test"
                className="inline-flex h-9 items-center gap-2 rounded-[var(--radius-obs-md)] px-4 text-sm font-medium tracking-[-0.01em]"
                style={{
                  color: '#cfdcff',
                  background: 'rgba(171,199,255,0.08)',
                  boxShadow: 'inset 0 0 0 1px rgba(171,199,255,0.18)',
                }}
              >
                <Radio size={14} />
                AIモデルを試す
              </Link>
              <ObsButton onClick={save} disabled={!hasChanges || saving}>
                <span className="inline-flex items-center gap-2">
                  {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                  保存
                </span>
              </ObsButton>
            </div>
          }
        />

        {loading ? (
          <div className="flex items-center gap-2 text-[13px] text-[#9b99a0]">
            <Loader2 size={15} className="animate-spin" />
            読み込み中
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.8fr)]">
            <div className="xl:col-span-2">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {scenarios.map((item) => {
                  const meta = SCENARIO_LABELS[item.key] ?? {
                    title: item.name,
                    caption: item.objective,
                    badge: 'シナリオ',
                  }
                  const active = item.key === activeScenarioKey
                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => selectScenario(item.key)}
                      className="group min-h-[108px] rounded-[var(--radius-obs-lg)] px-5 py-4 text-left transition-colors"
                      style={{
                        background: active ? 'rgba(46,123,255,0.13)' : 'rgba(255,255,255,0.035)',
                        boxShadow: active
                          ? 'inset 0 0 0 1px rgba(171,199,255,0.40), 0 16px 40px rgba(0,0,0,0.20)'
                          : 'inset 0 0 0 1px rgba(171,199,255,0.13)',
                      }}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="text-[15px] font-semibold text-[#e7e5ea]">{meta.title}</div>
                          <div className="mt-2 line-clamp-2 text-[12.5px] leading-relaxed text-[#9b99a0]">
                            {meta.caption}
                          </div>
                        </div>
                        <span
                          className="shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold text-[#cfdcff]"
                          style={{ background: 'rgba(171,199,255,0.10)' }}
                        >
                          {meta.badge}
                        </span>
                      </div>
                      <div className="mt-3 text-[11.5px] font-medium text-[#abc7ff]">
                        {active ? '編集中' : 'クリックして編集'}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
            <div className="space-y-5">
              <ObsCard depth="high" padding="lg" radius="xl">
                <ScenarioNameTitle
                  value={scenario.name}
                  onChange={(value) => update('name', value)}
                />
                <div className="mt-5 grid grid-cols-1 gap-4">
                  <TextField label="目的" value={scenario.objective} onChange={(v) => update('objective', v)} />
                  <TextArea label="冒頭トーク" value={scenario.openingTalk} onChange={(v) => update('openingTalk', v)} rows={3} />
                  <TextArea label="カレンダー調整条件" value={scenario.schedulingPolicy} onChange={(v) => update('schedulingPolicy', v)} rows={4} />
                  <TextArea label="完了時アクション" value={scenario.completionCriteria} onChange={(v) => update('completionCriteria', v)} rows={3} />
                </div>
              </ObsCard>

              <ObsCard depth="high" padding="lg" radius="xl">
                <SectionTitle icon={<Bot size={17} />} title="質問・制約" />
                <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
                  <ListEditor
                    label="必須質問"
                    items={scenario.requiredQuestions}
                    onChange={(items) => update('requiredQuestions', items)}
                    placeholder="お問い合わせの背景"
                  />
                  <ListEditor
                    label="任意質問"
                    items={scenario.optionalQuestions}
                    onChange={(items) => update('optionalQuestions', items)}
                    placeholder="現在利用中のCRM"
                  />
                  <ListEditor
                    label="NG回答"
                    items={scenario.ngResponses}
                    onChange={(items) => update('ngResponses', items)}
                    placeholder="確定していない成果を断定しない"
                  />
                  <ListEditor
                    label="人間引継ぎ条件"
                    items={scenario.handoffConditions}
                    onChange={(items) => update('handoffConditions', items)}
                    placeholder="料金交渉や個別条件を求められた"
                  />
                </div>
              </ObsCard>
            </div>

            <div className="space-y-5">
              <ObsCard depth="high" padding="lg" radius="xl">
                <SectionTitle icon={<FileText size={17} />} title="事前学習データ" />
                <div className="mt-5 space-y-4">
                  <TextArea
                    label="テキスト"
                    value={getRagText(scenario.ragSources)}
                    onChange={updateRagText}
                    rows={7}
                  />
                  <PdfInput
                    files={getRagPdfFiles(scenario.ragSources)}
                    onChange={updateRagPdfFiles}
                  />
                </div>
              </ObsCard>

              <ObsCard depth="low" padding="lg" radius="xl">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-[15px] font-semibold text-[#e7e5ea]">シナリオ状態</h3>
                    <p className="mt-1 text-[12px] leading-relaxed text-[#9b99a0]">
                      有効にすると、この条件で起動するAIコールにこのトークスクリプトが使われます。
                    </p>
                  </div>
                  <label className="inline-flex items-center gap-2 text-[12px] text-[#c7c5c9]">
                    <input
                      type="checkbox"
                      checked={scenario.enabled}
                      onChange={(e) => update('enabled', e.target.checked)}
                      className="h-4 w-4 accent-[#abc7ff]"
                    />
                    有効
                  </label>
                </div>
              </ObsCard>

              {(message || error) && (
                <div
                  className="rounded-[10px] px-4 py-3 text-[12.5px]"
                  style={{
                    color: error ? '#ff8d8d' : '#9ee8bd',
                    background: error ? 'rgba(255,107,107,0.08)' : 'rgba(91,221,139,0.08)',
                    boxShadow: error
                      ? 'inset 0 0 0 1px rgba(255,107,107,0.20)'
                      : 'inset 0 0 0 1px rgba(91,221,139,0.20)',
                  }}
                >
                  {error ?? message}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </ObsPageShell>
  )
}

function SectionTitle({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-2 text-[#e7e5ea]">
      <span className="text-[#abc7ff]">{icon}</span>
      <h2 className="text-[15px] font-semibold">{title}</h2>
    </div>
  )
}

function ScenarioNameTitle({
  value,
  onChange,
}: {
  value: string
  onChange: (value: string) => void
}) {
  return (
    <div className="flex items-center gap-2">
      <PhoneCall size={17} color="#abc7ff" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label="シナリオ名"
        className="min-w-0 flex-1 bg-transparent text-[15px] font-semibold text-[#e7e5ea] outline-none placeholder:text-[#7e7c83]"
        placeholder="シナリオ名"
      />
    </div>
  )
}

function TextField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="block">
      <span className={LABEL_CLASS}>{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={INPUT_CLASS}
        style={INPUT_STYLE}
      />
    </label>
  )
}

function TextArea({
  label,
  value,
  onChange,
  rows,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  rows: number
}) {
  return (
    <label className="block">
      <span className={LABEL_CLASS}>{label}</span>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        className={`${INPUT_CLASS} h-auto resize-y py-2.5 leading-relaxed`}
        style={INPUT_STYLE}
      />
    </label>
  )
}

function ListEditor({
  label,
  items,
  onChange,
  placeholder,
}: {
  label: string
  items: string[]
  onChange: (items: string[]) => void
  placeholder: string
}) {
  const update = (index: number, value: string) => {
    onChange(items.map((item, i) => (i === index ? value : item)))
  }

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className={LABEL_CLASS}>{label}</span>
        <button
          type="button"
          onClick={() => onChange([...items, ''])}
          className="inline-flex h-7 items-center gap-1.5 rounded-[8px] px-2.5 text-[11.5px] text-[#cfdcff]"
          style={{
            background: 'rgba(171,199,255,0.08)',
            boxShadow: 'inset 0 0 0 1px rgba(171,199,255,0.18)',
          }}
        >
          <Plus size={12} />
          追加
        </button>
      </div>
      <div className="space-y-2">
        {items.map((item, index) => (
          <div key={`${label}-${index}`} className="flex items-center gap-2">
            <input
              value={item}
              onChange={(e) => update(index, e.target.value)}
              placeholder={placeholder}
              className={INPUT_CLASS}
              style={INPUT_STYLE}
            />
            <button
              type="button"
              onClick={() => onChange(items.filter((_, i) => i !== index))}
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-[9px] text-[#9b99a0] hover:text-[#ff8d8d]"
              style={{ background: 'rgba(255,255,255,0.04)' }}
              aria-label="削除"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
        {items.length === 0 && (
          <p className="rounded-[10px] px-3 py-3 text-[12px] text-[#7e7c83]" style={{ background: 'rgba(255,255,255,0.035)' }}>
            未設定
          </p>
        )}
      </div>
    </div>
  )
}

function PdfInput({
  files,
  onChange,
}: {
  files: string[]
  onChange: (files: string[]) => void
}) {
  return (
    <div>
      <span className={LABEL_CLASS}>PDF</span>
      <label
        className="mt-1.5 flex cursor-pointer flex-col items-center justify-center rounded-[12px] px-4 py-6 text-center transition-colors"
        style={{
          background: 'rgba(255,255,255,0.04)',
          boxShadow: 'inset 0 0 0 1px rgba(171,199,255,0.18)',
        }}
      >
        <Upload size={20} color="#abc7ff" />
        <span className="mt-2 text-[13px] font-medium text-[#e7e5ea]">
          PDFファイルを選択
        </span>
        <span className="mt-1 text-[11.5px] text-[#7e7c83]">
          複数選択できます。MVPではファイル名をシナリオに保存します。
        </span>
        <input
          type="file"
          accept="application/pdf,.pdf"
          multiple
          className="hidden"
          onChange={(e) => {
            const selected = Array.from(e.target.files ?? [])
              .filter((file) => file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf'))
              .map((file) => file.name)
            onChange(Array.from(new Set([...files, ...selected])))
            e.target.value = ''
          }}
        />
      </label>
      <div className="mt-3 space-y-2">
        {files.map((file) => (
          <div
            key={file}
            className="flex items-center justify-between gap-2 rounded-[10px] px-3 py-2"
            style={{
              background: 'rgba(171,199,255,0.055)',
              boxShadow: 'inset 0 0 0 1px rgba(171,199,255,0.13)',
            }}
          >
            <span className="truncate text-[12.5px] text-[#c7c5c9]">{file}</span>
            <button
              type="button"
              onClick={() => onChange(files.filter((item) => item !== file))}
              className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-[8px] text-[#9b99a0] hover:text-[#ff8d8d]"
              style={{ background: 'rgba(255,255,255,0.04)' }}
              aria-label={`${file}を削除`}
            >
              <Trash2 size={13} />
            </button>
          </div>
        ))}
        {files.length === 0 && (
          <p className="rounded-[10px] px-3 py-3 text-[12px] text-[#7e7c83]" style={{ background: 'rgba(255,255,255,0.035)' }}>
            PDFはまだ選択されていません。
          </p>
        )}
      </div>
    </div>
  )
}

function getRagText(sources: string[]) {
  return sources
    .find((source) => source.startsWith('text:'))
    ?.slice('text:'.length) ?? ''
}

function getRagPdfFiles(sources: string[]) {
  return sources
    .filter((source) => source.startsWith('pdf:'))
    .map((source) => source.slice('pdf:'.length))
    .filter(Boolean)
}

function mergeRagSources(text: string, pdfFiles: string[]) {
  const next: string[] = []
  const trimmed = text.trim()
  if (trimmed) next.push(`text:${trimmed}`)
  for (const file of pdfFiles) {
    const name = file.trim()
    if (name) next.push(`pdf:${name}`)
  }
  return next
}

function scenarioSnapshot(scenario: Scenario) {
  return JSON.stringify({
    key: scenario.key,
    name: scenario.name,
    objective: scenario.objective,
    openingTalk: scenario.openingTalk,
    requiredQuestions: scenario.requiredQuestions,
    optionalQuestions: scenario.optionalQuestions,
    ngResponses: scenario.ngResponses,
    schedulingPolicy: scenario.schedulingPolicy,
    handoffConditions: scenario.handoffConditions,
    completionCriteria: scenario.completionCriteria,
    ragSources: scenario.ragSources,
    enabled: scenario.enabled,
  })
}

const LABEL_CLASS = 'text-[10.5px] font-semibold uppercase tracking-[0.08em] text-[#9b99a0]'
const INPUT_CLASS = 'mt-1.5 h-10 w-full rounded-[10px] px-3 text-[13px] outline-none transition-colors'
const INPUT_STYLE: React.CSSProperties = {
  background: 'rgba(255,255,255,0.04)',
  color: '#e7e5ea',
  boxShadow: 'inset 0 0 0 1px rgba(171,199,255,0.18)',
}
