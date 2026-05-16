'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowUp,
  Paperclip,
  Mic,
} from 'lucide-react'
import { ObsPageShell } from '@/components/obsidian'
import {
  AssigneeFilter,
  DEFAULT_SCOPE,
  type AssigneeScopeValue,
} from '@/components/ai/AssigneeFilter'
import { ModelSelector } from '@/components/ai/ModelSelector'
import {
  useFileAttachments,
  HiddenFileInput,
  AttachmentChip,
} from '@/components/ai/file-attach'

export default function HomePage() {
  const router = useRouter()
  const [prompt, setPrompt] = useState('')
  const [scope, setScope] = useState<AssigneeScopeValue>(() => ({
    features: new Set(DEFAULT_SCOPE.features),
    persons:  new Set(DEFAULT_SCOPE.persons),
    includeExternal: DEFAULT_SCOPE.includeExternal,
  }))
  const taRef = useRef<HTMLTextAreaElement | null>(null)
  const attach = useFileAttachments()

  const handleSubmit = () => {
    const q = prompt.trim()
    if (!q) return
    const params = new URLSearchParams({ q })
    // 参照スコープ(機能/人/外部情報)をクエリに含める。
    // 既定値(全機能 + 全担当 + 外部OFF)から変更がある場合のみ送る。
    const allFeatures = scope.features.size === DEFAULT_SCOPE.features.size
    const allPersons  = scope.persons.size  === DEFAULT_SCOPE.persons.size
    if (!allFeatures) params.set('features', Array.from(scope.features).join(','))
    if (!allPersons)  params.set('persons',  Array.from(scope.persons).join(','))
    if (scope.includeExternal) params.set('external', '1')
    // TODO: RAG エンドポイントに送信する — いまはナレッジページへ検索クエリとして渡す
    router.push(`/knowledge?${params.toString()}`)
  }

  return (
    <ObsPageShell>
      <div
        className="min-h-[calc(100vh-56px)] flex flex-col items-center justify-center px-8"
        style={{
          backgroundImage:
            'radial-gradient(circle at 50% 20%, rgba(171,199,255,0.06) 0%, transparent 45%), radial-gradient(circle at 20% 80%, rgba(0,113,227,0.04) 0%, transparent 50%)',
        }}
      >
        {/* ── Chat / RAG Input (centered vertically; hero title sits above via absolute) ── */}
        <div className="w-full max-w-[780px] relative">
          {/* ── Hero prompt (大きな見出し: 何を調べますか？) ── */}
          <div className="absolute bottom-full left-0 right-0 mb-10 flex flex-col items-center gap-2">
            <h1
              className="font-[family-name:var(--font-display)] text-center font-semibold tracking-[-0.025em] leading-[1.1]"
              style={{
                fontSize: 'clamp(1.75rem, 3vw, 2.25rem)',
                color: 'var(--color-obs-text)',
              }}
            >
              何を調べますか？
            </h1>
          </div>

        {/* ── Chat input box ── */}
        <div
            className="rounded-[var(--radius-obs-2xl)] p-1.5 transition-shadow duration-300 fo-glass-strong fo-glass-rim"
            style={{
              boxShadow: prompt
                ? '0 0 0 2px rgba(171,199,255,0.22), 0 0 48px rgba(171,199,255,0.18), 0 24px 60px rgba(0,0,0,0.45), inset 1px 1px 0 rgba(171,199,255,0.10), inset -1px -1px 0 rgba(0,0,0,0.25)'
                : '0 16px 40px rgba(0,0,0,0.4), inset 1px 1px 0 rgba(171,199,255,0.10), inset -1px -1px 0 rgba(0,0,0,0.25)',
              transitionTimingFunction: 'var(--ease-liquid)',
            }}
          >
            <textarea
              ref={taRef}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
                  e.preventDefault()
                  handleSubmit()
                }
              }}
              placeholder="BGMに何でも尋ねる — 企業・商談・議事録を横断検索"
              rows={2}
              className="w-full bg-transparent resize-none outline-none px-5 pt-4 pb-2 text-[15px] leading-relaxed"
              style={{
                color: 'var(--color-obs-text)',
              }}
            />

            <HiddenFileInput inputRef={attach.inputRef} onChange={attach.handleChange} />

            {/* 添付ファイルプレビュー (1個以上ある時のみ表示) */}
            {attach.files.length > 0 && (
              <div className="flex flex-wrap gap-1.5 px-3 pb-1">
                {attach.files.map((f, i) => (
                  <AttachmentChip
                    key={`${f.name}-${i}`}
                    file={f}
                    onRemove={() => attach.remove(i)}
                  />
                ))}
              </div>
            )}

            <div className="flex items-center justify-between px-3 pb-2 pt-1">
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={attach.openPicker}
                  className="w-9 h-9 rounded-full flex items-center justify-center transition-colors duration-150"
                  style={{ color: 'var(--color-obs-text-muted)' }}
                  onMouseOver={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--color-obs-surface-highest)'
                    ;(e.currentTarget as HTMLButtonElement).style.color = 'var(--color-obs-text)'
                  }}
                  onMouseOut={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent'
                    ;(e.currentTarget as HTMLButtonElement).style.color = 'var(--color-obs-text-muted)'
                  }}
                  title="ファイルを添付"
                  aria-label="ファイルを添付"
                >
                  <Paperclip size={16} />
                </button>
                {/* ── モデル + 思考の深さ ── */}
                <ModelSelector />

                {/* ── 参照スコープ(全員 / チームFAQ / 担当者) ── */}
                <AssigneeFilter value={scope} onChange={setScope} />
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="w-9 h-9 rounded-full flex items-center justify-center transition-colors duration-150"
                  style={{ color: 'var(--color-obs-text-muted)' }}
                  onMouseOver={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--color-obs-surface-highest)'
                    ;(e.currentTarget as HTMLButtonElement).style.color = 'var(--color-obs-text)'
                  }}
                  onMouseOut={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent'
                    ;(e.currentTarget as HTMLButtonElement).style.color = 'var(--color-obs-text-muted)'
                  }}
                  title="音声入力"
                >
                  <Mic size={15} />
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={!prompt.trim()}
                  className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 disabled:cursor-not-allowed"
                  style={{
                    background: prompt.trim()
                      ? 'linear-gradient(140deg, var(--color-obs-primary) 0%, var(--color-obs-primary-container) 100%)'
                      : 'var(--color-obs-surface-highest)',
                    color: prompt.trim() ? 'var(--color-obs-on-primary)' : 'var(--color-obs-text-muted)',
                    boxShadow: prompt.trim()
                      ? 'inset 0 1px 0 rgba(255,255,255,0.22), 0 0 24px rgba(171,199,255,0.45)'
                      : 'inset 0 0 0 1px var(--color-obs-border)',
                    transitionTimingFunction: 'var(--ease-liquid)',
                  }}
                  title="送信 (Enter)"
                >
                  <ArrowUp size={15} strokeWidth={2.5} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ObsPageShell>
  )
}
