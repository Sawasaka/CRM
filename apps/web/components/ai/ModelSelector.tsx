'use client'

/**
 * ModelSelector — チャット入力欄に置く「モデル + 思考の深さ」統合セレクタ
 *
 *   - ドロップダウン上段: LLM モデル一覧
 *   - 区切り線
 *   - ドロップダウン下段: 思考の深さ (標準 / 拡張)
 *
 * 外側のピルは選択中モデル名のみ表示し、拡張思考時はアイコンで軽く示す。
 */

import { useEffect, useRef, useState } from 'react'
import { Cpu, ChevronDown, Check, Hourglass, Sparkles } from 'lucide-react'

export type ModelKind = 'gemini-3-flash-preview' | 'gpt-5.5'
export type ThinkingDepth = 'standard' | 'extended'

export const MODEL_OPTIONS: { value: ModelKind; label: string; description: string }[] = [
  { value: 'gemini-3-flash-preview', label: 'Gemini 3 Flash Preview', description: '高速・標準利用' },
  { value: 'gpt-5.5',                label: 'GPT-5.5',                description: '高精度・推奨' },
]

export const DEFAULT_MODEL: ModelKind = 'gemini-3-flash-preview'

export const THINKING_DEPTH_OPTIONS: {
  value: ThinkingDepth
  label: string
  description: string
}[] = [
  { value: 'standard', label: '標準', description: '素早い回答' },
  { value: 'extended', label: '拡張', description: 'より深く考える' },
]

export function ModelSelector({
  model,
  thinking,
  onModelChange,
  onThinkingChange,
}: {
  model?: ModelKind
  thinking?: ThinkingDepth
  onModelChange?: (v: ModelKind) => void
  onThinkingChange?: (v: ThinkingDepth) => void
}) {
  const [internalModel, setInternalModel] = useState<ModelKind>(DEFAULT_MODEL)
  const [internalThinking, setInternalThinking] = useState<ThinkingDepth>('standard')

  const currentModel: ModelKind = model ?? internalModel
  const currentThinking: ThinkingDepth = thinking ?? internalThinking

  const setModel = (v: ModelKind) => {
    if (onModelChange) onModelChange(v)
    else setInternalModel(v)
  }
  const setThinking = (v: ThinkingDepth) => {
    if (onThinkingChange) onThinkingChange(v)
    else setInternalThinking(v)
  }

  const [open, setOpen] = useState(false)
  const wrapRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!open) return
    const onClickOutside = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onClickOutside)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  const currentModelOpt = MODEL_OPTIONS.find((o) => o.value === currentModel)!

  return (
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="inline-flex items-center gap-1.5 h-8 pl-3 pr-2 rounded-full text-[12px] font-medium transition-colors duration-150"
        style={{
          backgroundColor: 'var(--color-obs-surface-highest)',
          color: 'var(--color-obs-text)',
        }}
        title="モデル / 思考の深さ"
      >
        <Cpu size={12} style={{ color: 'var(--color-obs-primary)' }} />
        {currentModelOpt.label}
        {currentThinking === 'extended' && (
          <Sparkles size={11} style={{ color: 'var(--color-obs-primary)' }} aria-label="拡張思考" />
        )}
        <ChevronDown
          size={12}
          style={{
            color: 'var(--color-obs-text-muted)',
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 150ms var(--ease-liquid)',
          }}
        />
      </button>

      {open && (
        <div
          role="listbox"
          aria-label="モデルと思考の深さ"
          className="absolute bottom-full left-0 mb-2 min-w-[260px] py-2 rounded-[var(--radius-obs-lg)] z-50"
          style={{
            backgroundColor: 'var(--color-obs-surface-high)',
            border: '1px solid var(--color-obs-border)',
            boxShadow: '0 10px 30px rgba(0,0,0,0.4)',
          }}
        >
          {/* ── モデル一覧 ── */}
          <div
            className="px-3 pb-1.5 text-[10px] font-medium tracking-[0.1em] uppercase"
            style={{ color: 'var(--color-obs-text-muted)' }}
          >
            モデル
          </div>
          {MODEL_OPTIONS.map((opt) => {
            const selected = opt.value === currentModel
            return (
              <button
                key={opt.value}
                type="button"
                role="option"
                aria-selected={selected}
                onClick={() => {
                  setModel(opt.value)
                  setOpen(false)
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-left transition-colors duration-150"
                style={{ color: 'var(--color-obs-text)' }}
                onMouseOver={(e) => {
                  ;(e.currentTarget as HTMLButtonElement).style.backgroundColor =
                    'var(--color-obs-surface-highest)'
                }}
                onMouseOut={(e) => {
                  ;(e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent'
                }}
              >
                <Cpu
                  size={13}
                  style={{
                    color: selected ? 'var(--color-obs-primary)' : 'var(--color-obs-text-muted)',
                  }}
                />
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-medium leading-tight">{opt.label}</div>
                  <div
                    className="text-[11.5px] leading-tight mt-0.5"
                    style={{ color: 'var(--color-obs-text-muted)' }}
                  >
                    {opt.description}
                  </div>
                </div>
                {selected && <Check size={14} style={{ color: 'var(--color-obs-primary)' }} />}
              </button>
            )
          })}

          {/* ── 区切り線 ── */}
          <div
            className="my-1.5 mx-3 h-px"
            style={{ backgroundColor: 'var(--color-obs-border)' }}
          />

          {/* ── 思考の深さ ── */}
          <div
            className="px-3 pb-1.5 text-[10px] font-medium tracking-[0.1em] uppercase"
            style={{ color: 'var(--color-obs-text-muted)' }}
          >
            思考の深さ
          </div>
          {THINKING_DEPTH_OPTIONS.map((opt) => {
            const selected = opt.value === currentThinking
            return (
              <button
                key={opt.value}
                type="button"
                role="option"
                aria-selected={selected}
                onClick={() => {
                  setThinking(opt.value)
                  setOpen(false)
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-left transition-colors duration-150"
                style={{ color: 'var(--color-obs-text)' }}
                onMouseOver={(e) => {
                  ;(e.currentTarget as HTMLButtonElement).style.backgroundColor =
                    'var(--color-obs-surface-highest)'
                }}
                onMouseOut={(e) => {
                  ;(e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent'
                }}
              >
                <Hourglass
                  size={13}
                  style={{
                    color: selected ? 'var(--color-obs-primary)' : 'var(--color-obs-text-muted)',
                  }}
                />
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-medium leading-tight">{opt.label}</div>
                  <div
                    className="text-[11.5px] leading-tight mt-0.5"
                    style={{ color: 'var(--color-obs-text-muted)' }}
                  >
                    {opt.description}
                  </div>
                </div>
                {selected && <Check size={14} style={{ color: 'var(--color-obs-primary)' }} />}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
