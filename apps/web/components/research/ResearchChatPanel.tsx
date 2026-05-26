'use client'

/**
 * リサーチチャットパネル — 企業/取引/コンタクト詳細ページに置く
 * - プリセットボタン（クリックで送信）
 * - フリー入力＋送信
 * - メッセージ履歴
 * - ModelSelector（プランで使えるモデルが切り替わる）
 *
 * 仕様:
 *   - 企業DB収集と同じ低コスト Gemini を利用
 *   - Thinking 標準/拡張選択可
 *   - FREE: 公開環境ではAPI側で403
 */
import { useEffect, useRef, useState } from 'react'
import { ArrowUp, ChevronDown, History, Sparkles, User } from 'lucide-react'
import { ObsCard, ObsSectionHeader } from '@/components/obsidian'
import { ModelSelector, type ModelKind, type ThinkingDepth } from '@/components/ai/ModelSelector'

type Preset = {
  id: string
  label: string
  emoji: string
  description: string
  prompt: string
}

type Message = {
  role: 'user' | 'assistant'
  content: string
  model?: string
  thinking?: string
  elapsedMs?: number
}

type HistoryEntry = {
  id: string
  createdAt: string // ISO
  presetEmoji: string | null
  presetLabel: string | null
  question: string
  answer: string
  model: string
  thinking: 'standard' | 'extended'
  elapsedMs: number
}

function formatHistoryTime(iso: string): string {
  const d = new Date(iso)
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffH = Math.floor(diffMs / 3_600_000)
  if (diffH < 1) {
    const diffMin = Math.max(1, Math.floor(diffMs / 60_000))
    return `${diffMin}分前`
  }
  if (diffH < 24) return `${diffH}時間前`
  const diffD = Math.floor(diffH / 24)
  if (diffD < 7) return `${diffD}日前`
  return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`
}

export function ResearchChatPanel({
  entityType,
  entityId,
}: {
  entityType: 'company' | 'deal' | 'contact'
  entityId: string
}) {
  const [presets, setPresets] = useState<Preset[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [model, setModel] = useState<ModelKind>('gemini-3-flash-preview')
  const [thinking, setThinking] = useState<ThinkingDepth>('standard')
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [expandedHistoryId, setExpandedHistoryId] = useState<string | null>(null)

  const scrollRef = useRef<HTMLDivElement | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)

  // プリセットを「直接送信」せず、チャット入力欄に prompt をセットする。
  // 編集して送信したいユーザーが多いため、ワンクッション挟む挙動にする。
  function applyPreset(presetId: string) {
    const p = presets.find((pp) => pp.id === presetId)
    if (!p) return
    const text = p.prompt || p.label
    setInput(text)
    // 次フレームで focus & カーソル末尾に
    requestAnimationFrame(() => {
      const ta = textareaRef.current
      if (!ta) return
      ta.focus()
      ta.setSelectionRange(text.length, text.length)
    })
  }

  useEffect(() => {
    fetch('/api/research/presets')
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => j && setPresets(j.presets || []))
      .catch(() => {})
  }, [])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, isLoading])

  // 入力に応じて textarea を自動拡張（プリセット投入時にプロンプト全体が見えるように）
  useEffect(() => {
    const ta = textareaRef.current
    if (!ta) return
    ta.style.height = 'auto'
    const next = Math.min(Math.max(ta.scrollHeight, 80), 400)
    ta.style.height = `${next}px`
  }, [input])

  async function send(presetId?: string, freeText?: string) {
    if (isLoading) return
    const presetLabel = presetId ? presets.find((p) => p.id === presetId)?.label : null
    const userContent = presetLabel ? `📋 ${presetLabel}` : (freeText ?? '').trim()
    if (!userContent) return

    setError(null)
    setMessages((prev) => [...prev, { role: 'user', content: userContent }])
    setInput('')
    setIsLoading(true)

    try {
      const res = await fetch('/api/research/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entityType,
          entityId,
          presetId,
          prompt: presetId ? undefined : freeText,
          model,
          thinking,
          history: messages.slice(-10),
        }),
      })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        throw new Error(j.error || `HTTP ${res.status}`)
      }
      const j = (await res.json()) as {
        content: string
        model: string
        thinking: string
        elapsedMs: number
      }
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: j.content,
          model: j.model,
          thinking: j.thinking,
          elapsedMs: j.elapsedMs,
        },
      ])
      // 履歴にも追記（永続化までの暫定実装）
      const presetEmoji = presetId ? (presets.find((p) => p.id === presetId)?.emoji ?? null) : null
      const questionText = presetId
        ? (presets.find((p) => p.id === presetId)?.prompt ?? userContent)
        : userContent
      setHistory((prev) => [
        {
          id: `h-${Date.now()}`,
          createdAt: new Date().toISOString(),
          presetEmoji,
          presetLabel: presetLabel ?? null,
          question: questionText,
          answer: j.content,
          model: j.model,
          thinking: (j.thinking === 'extended' ? 'extended' : 'standard') as
            | 'standard'
            | 'extended',
          elapsedMs: j.elapsedMs,
        },
        ...prev,
      ])
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <ObsCard depth="high" padding="lg">
      <ObsSectionHeader title="リサーチ" caption="営業前の企業調査AI" />

      {/* プリセットボタン */}
      {messages.length === 0 && presets.length > 0 && (
        <div className="flex flex-col gap-1.5 mt-3">
          <div
            className="text-[11px] font-medium tracking-[0.05em]"
            style={{ color: 'var(--color-obs-text-muted)' }}
          >
            プリセット
          </div>
          <div className="flex flex-wrap gap-1.5">
            {presets
              .filter((p) => p.label !== '商談前の提案におけるリサーチ')
              .map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => applyPreset(p.id)}
                  disabled={isLoading}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-[var(--radius-obs-md)] text-[12px] transition-colors duration-150"
                  style={{
                    backgroundColor: 'var(--color-obs-surface-highest)',
                    color: 'var(--color-obs-text)',
                    border: '1px solid var(--color-obs-border)',
                  }}
                  title={
                    p.description
                      ? `${p.description}（クリックでプロンプトを入力欄にセット）`
                      : 'クリックでプロンプトを入力欄にセット'
                  }
                >
                  <span>{p.emoji}</span>
                  {p.label}
                </button>
              ))}
          </div>
        </div>
      )}

      {/* メッセージ履歴 */}
      {messages.length > 0 && (
        <div
          ref={scrollRef}
          className="mt-4 max-h-[480px] overflow-y-auto flex flex-col gap-3 pr-1"
        >
          {messages.map((m, i) => (
            <div key={i} className="flex flex-col gap-1">
              <div className="flex items-center gap-1.5">
                {m.role === 'user' ? (
                  <User size={11} style={{ color: 'var(--color-obs-text-muted)' }} />
                ) : (
                  <Sparkles size={11} style={{ color: 'var(--color-obs-primary)' }} />
                )}
                <span
                  className="text-[10.5px] font-medium tracking-wide"
                  style={{ color: 'var(--color-obs-text-muted)' }}
                >
                  {m.role === 'user' ? 'あなた' : 'リサーチAI'}
                  {m.role === 'assistant' && m.model && (
                    <span className="ml-1.5" style={{ color: 'var(--color-obs-text-subtle)' }}>
                      · {m.model}
                      {m.thinking === 'extended' && ' ✦'}
                      {m.elapsedMs !== undefined && ` · ${(m.elapsedMs / 1000).toFixed(1)}s`}
                    </span>
                  )}
                </span>
              </div>
              <div
                className={`text-[13px] leading-relaxed ${m.role === 'user' ? 'pl-4 whitespace-pre-wrap' : ''}`}
                style={{
                  color:
                    m.role === 'user' ? 'var(--color-obs-text-muted)' : 'var(--color-obs-text)',
                }}
              >
                {m.role === 'user' ? m.content : <MarkdownLite text={m.content} />}
              </div>
            </div>
          ))}
          {isLoading && (
            <div
              className="flex items-center gap-1.5 text-[12px]"
              style={{ color: 'var(--color-obs-text-subtle)' }}
            >
              <Sparkles size={11} className="animate-pulse" />
              リサーチ中...
            </div>
          )}
        </div>
      )}

      {/* エラー */}
      {error && (
        <div className="mt-3 text-[12px]" style={{ color: '#ff6b6b' }}>
          {error}
        </div>
      )}

      {/* 入力ボックス（ホームのチャットUIと同じ大きめスタイル） */}
      <div
        className="mt-4 rounded-[var(--radius-obs-2xl)] p-1.5 transition-shadow duration-300"
        style={{
          backgroundColor: 'var(--color-obs-surface-high)',
          boxShadow: input
            ? '0 0 0 2px rgba(171,199,255,0.18), 0 20px 40px rgba(0,0,0,0.35)'
            : '0 10px 30px rgba(0,0,0,0.3)',
          transitionTimingFunction: 'var(--ease-liquid)',
        }}
      >
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
              e.preventDefault()
              if (input.trim()) send(undefined, input)
            }
          }}
          placeholder="この企業について自由に質問 — Enterで送信 / Shift+Enterで改行"
          rows={3}
          disabled={isLoading}
          className="w-full bg-transparent resize-none outline-none px-5 pt-4 pb-2 text-[15px] leading-relaxed"
          style={{ color: 'var(--color-obs-text)' }}
        />

        <div className="flex items-center justify-between px-3 pb-2 pt-1">
          <div className="flex items-center gap-1">
            <ModelSelector
              model={model}
              thinking={thinking}
              onModelChange={setModel}
              onThinkingChange={setThinking}
            />
          </div>
          <button
            type="button"
            onClick={() => input.trim() && send(undefined, input)}
            disabled={isLoading || !input.trim()}
            className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 disabled:cursor-not-allowed"
            style={{
              background:
                input.trim() && !isLoading
                  ? 'linear-gradient(140deg, var(--color-obs-primary) 0%, var(--color-obs-primary-container) 100%)'
                  : 'var(--color-obs-surface-highest)',
              color:
                input.trim() && !isLoading
                  ? 'var(--color-obs-on-primary)'
                  : 'var(--color-obs-text-muted)',
              boxShadow:
                input.trim() && !isLoading
                  ? 'inset 0 1px 0 rgba(255,255,255,0.18)'
                  : 'inset 0 0 0 1px var(--color-obs-border)',
              transitionTimingFunction: 'var(--ease-liquid)',
            }}
            title="送信 (Enter)"
          >
            <ArrowUp size={15} strokeWidth={2.5} />
          </button>
        </div>
      </div>

      {/* ── リサーチ履歴 ── */}
      {history.length > 0 && (
        <div className="mt-6">
          <div className="flex items-center gap-1.5 mb-2.5">
            <History size={12} style={{ color: 'var(--color-obs-text-muted)' }} />
            <span
              className="text-[11px] font-bold tracking-[0.06em]"
              style={{ color: 'var(--color-obs-text-subtle)' }}
            >
              リサーチ履歴
            </span>
            <span
              className="text-[10.5px] tabular-nums"
              style={{ color: 'var(--color-obs-text-muted)' }}
            >
              {history.length > 3 ? `最新3件 / 全${history.length}件` : `${history.length}件`}
            </span>
          </div>
          <div className="flex flex-col gap-2">
            {history.slice(0, 3).map((h) => {
              const isOpen = expandedHistoryId === h.id
              return (
                <div
                  key={h.id}
                  className="rounded-[var(--radius-obs-md)] overflow-hidden transition-colors"
                  style={{
                    backgroundColor: 'var(--color-obs-surface-highest)',
                    border: '1px solid var(--color-obs-border)',
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setExpandedHistoryId(isOpen ? null : h.id)}
                    className="w-full flex items-start gap-2 px-3 py-2.5 text-left transition-colors hover:bg-[rgba(171,199,255,0.04)]"
                  >
                    <ChevronDown
                      size={12}
                      className="shrink-0 mt-[3px] transition-transform"
                      style={{
                        color: 'var(--color-obs-text-muted)',
                        transform: isOpen ? 'rotate(0deg)' : 'rotate(-90deg)',
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {h.presetLabel ? (
                          <span
                            className="inline-flex items-center gap-1 text-[11.5px] font-semibold"
                            style={{ color: 'var(--color-obs-text)' }}
                          >
                            {h.presetEmoji && <span>{h.presetEmoji}</span>}
                            {h.presetLabel}
                          </span>
                        ) : (
                          <span
                            className="inline-flex items-center gap-1 text-[11.5px] font-semibold"
                            style={{ color: 'var(--color-obs-text)' }}
                          >
                            <User size={10} style={{ color: 'var(--color-obs-text-muted)' }} />
                            自由質問
                          </span>
                        )}
                        <span
                          className="text-[10px]"
                          style={{ color: 'var(--color-obs-text-subtle)' }}
                        >
                          · {formatHistoryTime(h.createdAt)}
                        </span>
                        <span
                          className="text-[10px]"
                          style={{ color: 'var(--color-obs-text-subtle)' }}
                        >
                          · {h.model}
                          {h.thinking === 'extended' && ' ✦'}
                          {' · '}
                          {(h.elapsedMs / 1000).toFixed(1)}s
                        </span>
                      </div>
                      {!isOpen && (
                        <p
                          className="text-[12px] mt-1 leading-relaxed line-clamp-1"
                          style={{ color: 'var(--color-obs-text-muted)' }}
                        >
                          {h.question}
                        </p>
                      )}
                    </div>
                  </button>

                  {isOpen && (
                    <div
                      className="px-4 pb-3 pt-1 flex flex-col gap-3"
                      style={{ borderTop: '1px solid var(--color-obs-border)' }}
                    >
                      {/* 質問 */}
                      <div className="flex flex-col gap-1 mt-3">
                        <div className="flex items-center gap-1.5">
                          <User size={11} style={{ color: 'var(--color-obs-text-muted)' }} />
                          <span
                            className="text-[10.5px] font-medium tracking-wide"
                            style={{ color: 'var(--color-obs-text-muted)' }}
                          >
                            あなた
                          </span>
                        </div>
                        <p
                          className="text-[12.5px] whitespace-pre-wrap leading-relaxed pl-4"
                          style={{ color: 'var(--color-obs-text-muted)' }}
                        >
                          {h.question}
                        </p>
                      </div>

                      {/* 回答 */}
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1.5">
                          <Sparkles size={11} style={{ color: 'var(--color-obs-primary)' }} />
                          <span
                            className="text-[10.5px] font-medium tracking-wide"
                            style={{ color: 'var(--color-obs-text-muted)' }}
                          >
                            リサーチAI
                          </span>
                        </div>
                        <div
                          className="text-[13px] leading-relaxed"
                          style={{ color: 'var(--color-obs-text)' }}
                        >
                          <MarkdownLite text={h.answer} />
                        </div>
                      </div>

                      <div className="flex items-center gap-3 pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            setInput(h.question)
                            requestAnimationFrame(() => textareaRef.current?.focus())
                          }}
                          className="text-[10.5px] underline"
                          style={{ color: 'var(--color-obs-primary)' }}
                        >
                          再質問する
                        </button>
                        <button
                          type="button"
                          onClick={() => setHistory((prev) => prev.filter((x) => x.id !== h.id))}
                          className="text-[10.5px] underline"
                          style={{ color: 'var(--color-obs-text-subtle)' }}
                        >
                          削除
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* 既に履歴があるときのリセット & プリセット表示 */}
      {messages.length > 0 && (
        <div className="mt-3 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setMessages([])}
            className="text-[11px] underline"
            style={{ color: 'var(--color-obs-text-subtle)' }}
          >
            履歴をクリア
          </button>
          <div className="flex flex-wrap gap-1">
            {presets.slice(0, 4).map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => applyPreset(p.id)}
                disabled={isLoading}
                className="text-[11px] px-2 py-0.5 rounded-full transition-colors"
                style={{
                  backgroundColor: 'transparent',
                  color: 'var(--color-obs-text-muted)',
                  border: '1px solid var(--color-obs-border)',
                }}
                title={
                  p.description
                    ? `${p.description}（クリックでプロンプトを入力欄にセット）`
                    : 'クリックでプロンプトを入力欄にセット'
                }
              >
                {p.emoji}
              </button>
            ))}
          </div>
        </div>
      )}
    </ObsCard>
  )
}

// 軽量Markdownレンダラー（GPTのレスポンス用）
function MarkdownLite({ text }: { text: string }) {
  const lines = text.split('\n')
  type Block =
    | { type: 'h'; level: 1 | 2 | 3; text: string }
    | { type: 'ul'; items: string[] }
    | { type: 'ol'; items: string[] }
    | { type: 'p'; text: string }
    | { type: 'blank' }
  const blocks: Block[] = []
  let curUl: string[] | null = null
  let curOl: string[] | null = null
  for (const raw of lines) {
    const line = raw.replace(/\s+$/, '')
    if (line === '') {
      if (curUl) {
        blocks.push({ type: 'ul', items: curUl })
        curUl = null
      }
      if (curOl) {
        blocks.push({ type: 'ol', items: curOl })
        curOl = null
      }
      blocks.push({ type: 'blank' })
      continue
    }
    const h = line.match(/^(#{1,3})\s+(.*)/)
    if (h && h[1] && h[2] !== undefined) {
      if (curUl) {
        blocks.push({ type: 'ul', items: curUl })
        curUl = null
      }
      if (curOl) {
        blocks.push({ type: 'ol', items: curOl })
        curOl = null
      }
      blocks.push({ type: 'h', level: h[1].length as 1 | 2 | 3, text: h[2] })
      continue
    }
    const ul = line.match(/^\s*[-*]\s+(.*)/)
    if (ul && ul[1] !== undefined) {
      if (curOl) {
        blocks.push({ type: 'ol', items: curOl })
        curOl = null
      }
      curUl = curUl ?? []
      curUl.push(ul[1])
      continue
    }
    const ol = line.match(/^\s*(\d+)\.\s+(.*)/)
    if (ol && ol[2] !== undefined) {
      if (curUl) {
        blocks.push({ type: 'ul', items: curUl })
        curUl = null
      }
      curOl = curOl ?? []
      curOl.push(ol[2])
      continue
    }
    if (curUl) {
      blocks.push({ type: 'ul', items: curUl })
      curUl = null
    }
    if (curOl) {
      blocks.push({ type: 'ol', items: curOl })
      curOl = null
    }
    blocks.push({ type: 'p', text: line })
  }
  if (curUl) blocks.push({ type: 'ul', items: curUl })
  if (curOl) blocks.push({ type: 'ol', items: curOl })

  return (
    <div className="flex flex-col gap-1.5">
      {blocks.map((b, i) => {
        if (b.type === 'blank') return null
        if (b.type === 'h') {
          const sizes = {
            1: 'text-[15px] font-semibold',
            2: 'text-[14px] font-semibold',
            3: 'text-[13px] font-semibold',
          }
          return (
            <div
              key={i}
              className={`${sizes[b.level]} mt-1`}
              style={{ color: 'var(--color-obs-text)' }}
            >
              {renderInline(b.text)}
            </div>
          )
        }
        if (b.type === 'ul') {
          return (
            <ul key={i} className="list-disc pl-5 flex flex-col gap-0.5">
              {b.items.map((it, j) => (
                <li key={j}>{renderInline(it)}</li>
              ))}
            </ul>
          )
        }
        if (b.type === 'ol') {
          return (
            <ol key={i} className="list-decimal pl-5 flex flex-col gap-0.5">
              {b.items.map((it, j) => (
                <li key={j}>{renderInline(it)}</li>
              ))}
            </ol>
          )
        }
        return (
          <p key={i} className="leading-relaxed">
            {renderInline(b.text)}
          </p>
        )
      })}
    </div>
  )
}

function renderInline(text: string): React.ReactNode {
  const tokens: React.ReactNode[] = []
  let rest = text
  let key = 0
  while (rest.length > 0) {
    const linkMd = rest.match(/^\[([^\]]+)\]\((https?:\/\/[^)]+)\)/)
    if (linkMd && linkMd[1] && linkMd[2]) {
      const label = linkMd[1]
      const href = linkMd[2]
      tokens.push(
        <a
          key={key++}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="underline"
          style={{ color: 'var(--color-obs-primary)' }}
        >
          {label}
        </a>
      )
      rest = rest.slice(linkMd[0].length)
      continue
    }
    const bold = rest.match(/^\*\*([^*]+)\*\*/)
    if (bold && bold[1]) {
      tokens.push(
        <strong key={key++} className="font-semibold">
          {bold[1]}
        </strong>
      )
      rest = rest.slice(bold[0].length)
      continue
    }
    const url = rest.match(/^(https?:\/\/[^\s)]+)/)
    if (url && url[1]) {
      const href = url[1]
      tokens.push(
        <a
          key={key++}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="underline break-all"
          style={{ color: 'var(--color-obs-primary)' }}
        >
          {href}
        </a>
      )
      rest = rest.slice(url[0].length)
      continue
    }
    const next = rest.search(/(\*\*|\[|https?:\/\/)/)
    if (next === -1) {
      tokens.push(rest)
      break
    }
    tokens.push(rest.slice(0, next))
    rest = rest.slice(next)
  }
  return <>{tokens}</>
}
