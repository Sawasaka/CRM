'use client'

import { useEffect, useMemo, useState } from 'react'
import { Check, Loader2, Save, ScrollText, Wand2, X } from 'lucide-react'
import type { ChatPolicyPreset, ChatPolicyState } from '@/lib/chat-policy-presets'

type Props = {
  value: ChatPolicyState
  onChange: (next: ChatPolicyState) => void
}

export function ChatPolicySelector({ value, onChange }: Props) {
  const [open, setOpen] = useState(false)
  const [presets, setPresets] = useState<ChatPolicyPreset[]>([])
  const [draft, setDraft] = useState<ChatPolicyState>(value)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    let alive = true
    setLoading(true)
    fetch('/api/chat/policy')
      .then((r) => (r.ok ? r.json() : null))
      .then((json) => {
        if (!alive || !json) return
        setPresets(json.presets ?? [])
        if (json.policy) {
          setDraft(json.policy)
          onChange(json.policy)
        }
      })
      .catch(() => {})
      .finally(() => {
        if (alive) setLoading(false)
      })
    return () => {
      alive = false
    }
  }, [onChange])

  useEffect(() => {
    if (!open) setDraft(value)
  }, [open, value])

  const activePreset = useMemo(
    () => presets.find((preset) => preset.id === value.selectedPresetId),
    [presets, value.selectedPresetId]
  )

  const applyPreset = (preset: ChatPolicyPreset) => {
    const next = {
      selectedPresetId: preset.id,
      premises: preset.premises,
      policies: preset.policies,
    }
    setDraft(next)
    onChange(next)
    setSaved(false)
  }

  const updateDraft = (patch: Partial<ChatPolicyState>) => {
    const next = { ...draft, ...patch }
    setDraft(next)
    onChange(next)
    setSaved(false)
  }

  const save = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/chat/policy', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(draft),
      })
      const json = (await res.json().catch(() => ({}))) as { policy?: ChatPolicyState }
      if (!res.ok) throw new Error('save failed')
      if (json.policy) {
        setDraft(json.policy)
        onChange(json.policy)
      }
      setSaved(true)
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 h-8 px-3 rounded-full text-[12px] font-medium transition-colors duration-150"
        style={{
          backgroundColor: 'var(--color-obs-surface-highest)',
          color: 'var(--color-obs-text)',
        }}
        title="前提・ポリシー"
      >
        <ScrollText size={12} style={{ color: 'var(--color-obs-primary)' }} />
        {activePreset?.label ?? '前提・ポリシー'}
        {loading && <Loader2 size={11} className="animate-spin" />}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center px-4 py-5 sm:items-center">
          <button
            type="button"
            aria-label="閉じる"
            className="absolute inset-0 cursor-default"
            style={{ backgroundColor: 'rgba(0,0,0,0.52)', backdropFilter: 'blur(4px)' }}
            onClick={() => setOpen(false)}
          />
          <div
            className="relative w-full max-w-3xl max-h-[88vh] overflow-y-auto rounded-[var(--radius-obs-lg)]"
            style={{
              backgroundColor: 'var(--color-obs-surface)',
              boxShadow: '0 24px 64px rgba(0,0,0,0.55), inset 0 0 0 1px rgba(109,106,111,0.18)',
            }}
          >
            <div
              className="sticky top-0 z-10 flex items-center justify-between gap-3 px-5 py-4"
              style={{
                backgroundColor: 'var(--color-obs-surface)',
                borderBottom: '1px solid var(--color-obs-border)',
              }}
            >
              <div className="flex items-center gap-2 min-w-0">
                <ScrollText size={16} style={{ color: 'var(--color-obs-primary)' }} />
                <h2
                  className="text-[15px] font-semibold tracking-[-0.01em]"
                  style={{ color: 'var(--color-obs-text)' }}
                >
                  前提・ポリシー
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="w-8 h-8 rounded-full inline-flex items-center justify-center"
                style={{ color: 'var(--color-obs-text-muted)' }}
              >
                <X size={15} />
              </button>
            </div>

            <div className="px-5 py-4 space-y-4">
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className="inline-flex items-center gap-1 text-[11px] font-medium"
                  style={{ color: 'var(--color-obs-text-subtle)' }}
                >
                  <Wand2 size={11} />
                  プリセット
                </span>
                {presets.map((preset) => {
                  const selected = draft.selectedPresetId === preset.id
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => applyPreset(preset)}
                      className="h-8 px-3 rounded-full inline-flex items-center gap-1.5 text-[12px] font-medium"
                      style={{
                        backgroundColor: selected
                          ? 'rgba(171,199,255,0.16)'
                          : 'var(--color-obs-surface-high)',
                        color: selected
                          ? 'var(--color-obs-primary)'
                          : 'var(--color-obs-text-muted)',
                        border: selected
                          ? '1px solid rgba(171,199,255,0.28)'
                          : '1px solid var(--color-obs-border)',
                      }}
                    >
                      {selected && <Check size={12} />}
                      {preset.label}
                    </button>
                  )
                })}
              </div>

              <PolicyField
                label="前提"
                value={draft.premises}
                onChange={(premises) => updateDraft({ premises })}
                placeholder="目的、対象、見るべき情報源、重視する文脈"
                rows={7}
              />
              <PolicyField
                label="ポリシー"
                value={draft.policies}
                onChange={(policies) => updateDraft({ policies })}
                placeholder="出力順、判断基準、根拠/推測の分け方、確認事項"
                rows={9}
              />
            </div>

            <div
              className="sticky bottom-0 flex items-center justify-between gap-3 px-5 py-4"
              style={{
                backgroundColor: 'var(--color-obs-surface)',
                borderTop: '1px solid var(--color-obs-border)',
              }}
            >
              <span className="text-[11px]" style={{ color: 'var(--color-obs-text-subtle)' }}>
                {saved ? '保存しました' : 'この内容を次回以降も使えます'}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="h-9 px-3 rounded-[var(--radius-obs-md)] text-[13px] font-medium"
                  style={{
                    backgroundColor: 'var(--color-obs-surface-high)',
                    color: 'var(--color-obs-text-muted)',
                  }}
                >
                  閉じる
                </button>
                <button
                  type="button"
                  onClick={() => void save()}
                  disabled={saving}
                  className="h-9 px-3 rounded-[var(--radius-obs-md)] inline-flex items-center gap-1.5 text-[13px] font-medium disabled:opacity-60"
                  style={{
                    background:
                      'linear-gradient(140deg, var(--color-obs-primary) 0%, var(--color-obs-primary-container) 100%)',
                    color: 'var(--color-obs-on-primary)',
                  }}
                >
                  {saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
                  保存
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

function PolicyField({
  label,
  value,
  onChange,
  placeholder,
  rows,
}: {
  label: string
  value: string
  onChange: (next: string) => void
  placeholder: string
  rows: number
}) {
  return (
    <label className="block">
      <span
        className="block mb-1.5 text-[12px] font-semibold"
        style={{ color: 'var(--color-obs-text)' }}
      >
        {label}
      </span>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="w-full resize-y rounded-[var(--radius-obs-md)] px-3 py-2 text-[13px] leading-relaxed outline-none"
        style={{
          backgroundColor: 'var(--color-obs-surface-high)',
          color: 'var(--color-obs-text)',
          border: '1px solid var(--color-obs-border)',
        }}
      />
    </label>
  )
}
