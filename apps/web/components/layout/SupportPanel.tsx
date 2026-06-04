'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import {
  X,
  ArrowUp,
  CheckCircle2,
  UserRound,
  Loader2,
  PenSquare,
  MoreHorizontal,
  Pin,
  Pencil,
  Trash2,
  Search,
} from 'lucide-react'
import { answerForQuestion, type KnowledgeAnswer } from '@/lib/support/mock-knowledge'

type Role = 'user' | 'support'
type Status = 'open' | 'in_progress' | 'resolved'

type Message = {
  id: string
  role: Role
  text: string
  sources?: KnowledgeAnswer['sources']
  createdAt: number
}

type Conversation = {
  id: string
  title: string
  status: Status
}

// Phase 1: モック履歴。将来的には userId 単位で永続化。
const MOCK_HISTORY: Conversation[] = []

// チャットステータス表記 (open=未対応 / in_progress=連絡待ち / resolved=解決済み)
const STATUS_LABEL: Record<Status, string> = {
  open: '未対応',
  in_progress: '連絡待ち',
  resolved: '解決済み',
}
const STATUS_DOT: Record<Status, string> = {
  open: 'var(--color-obs-text-subtle)',
  in_progress: 'var(--color-obs-middle)',
  resolved: 'var(--color-obs-low)',
}

export function SupportPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [messages, setMessages] = useState<Message[]>([])
  const [draft, setDraft] = useState('')
  const [thinking, setThinking] = useState(false)
  const [status, setStatus] = useState<Status>('open')
  const [activeConvId, setActiveConvId] = useState<string | null>(null)

  // 履歴の編集系ローカル状態
  const [pinnedIds, setPinnedIds] = useState<Set<string>>(new Set())
  const [deletedIds, setDeletedIds] = useState<Set<string>>(new Set())
  const [renamedTitles, setRenamedTitles] = useState<Record<string, string>>({})
  const [editingId, setEditingId] = useState<string | null>(null)
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null)
  const [historyQuery, setHistoryQuery] = useState('')
  // チャットごとのステータス上書き(初期値は MOCK_HISTORY、解決/エスカレーション操作で更新)
  const [chatStatuses, setChatStatuses] = useState<Record<string, Status>>({})

  const scrollRef = useRef<HTMLDivElement | null>(null)
  const inputRef = useRef<HTMLTextAreaElement | null>(null)

  // 表示用に整形した履歴(検索クエリでフィルタ + ステータスoverride反映)
  const visibleConversations = useMemo(() => {
    const q = historyQuery.trim().toLowerCase()
    return MOCK_HISTORY
      .filter((c) => !deletedIds.has(c.id))
      .map((c) => ({
        ...c,
        title: renamedTitles[c.id] ?? c.title,
        status: chatStatuses[c.id] ?? c.status,
      }))
      .filter((c) => (q ? c.title.toLowerCase().includes(q) : true))
      .sort((a, b) => {
        const ap = pinnedIds.has(a.id) ? 1 : 0
        const bp = pinnedIds.has(b.id) ? 1 : 0
        return bp - ap
      })
  }, [pinnedIds, deletedIds, renamedTitles, historyQuery, chatStatuses])

  // 履歴メニューを外側クリックで閉じる
  useEffect(() => {
    if (!menuOpenId) return
    const onDocClick = (e: MouseEvent) => {
      const tgt = e.target as HTMLElement | null
      if (!tgt) return setMenuOpenId(null)
      if (!tgt.closest(`[data-conv-id="${menuOpenId}"]`)) setMenuOpenId(null)
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [menuOpenId])

  // 開いたら入力欄にフォーカス
  useEffect(() => {
    if (!open) return
    const t = window.setTimeout(() => inputRef.current?.focus(), 50)
    return () => window.clearTimeout(t)
  }, [open])

  // 新規メッセージで自動スクロール
  useEffect(() => {
    if (!scrollRef.current) return
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [messages, thinking, open])

  // ESC で閉じる
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  const send = (text: string) => {
    const q = text.trim()
    if (!q || thinking) return

    const userMsg: Message = {
      id: `m_${Date.now()}_u`,
      role: 'user',
      text: q,
      createdAt: Date.now(),
    }
    setMessages((prev) => [...prev, userMsg])
    setDraft('')
    setThinking(true)

    // TODO: 実装時は /api/support/ask に置換 (連携ナレッジから RAG 回答)
    window.setTimeout(() => {
      const answer = answerForQuestion(q)
      const replyMsg: Message = {
        id: `m_${Date.now()}_s`,
        role: 'support',
        text: answer.text,
        sources: answer.sources,
        createdAt: Date.now(),
      }
      setMessages((prev) => [...prev, replyMsg])
      setThinking(false)
    }, 700)
  }

  const handleResolve = () => {
    setMessages((prev) => [
      ...prev,
      {
        id: `m_${Date.now()}_sys`,
        role: 'support',
        text: 'ご利用ありがとうございました。解決したものとしてクローズしました。また何かあればお気軽にどうぞ。',
        createdAt: Date.now(),
      },
    ])
    setStatus('resolved')
    if (activeConvId) {
      setChatStatuses((prev) => ({ ...prev, [activeConvId]: 'resolved' }))
    }
  }

  const handleEscalate = () => {
    setMessages((prev) => [
      ...prev,
      {
        id: `m_${Date.now()}_sys`,
        role: 'support',
        text: '担当者にお繋ぎしました。営業時間内であれば 30 分以内に直接ご連絡します。',
        createdAt: Date.now(),
      },
    ])
    setStatus('in_progress')
    if (activeConvId) {
      setChatStatuses((prev) => ({ ...prev, [activeConvId]: 'in_progress' }))
    }
  }

  const handleNewConversation = () => {
    setMessages([])
    setStatus('open')
    setDraft('')
    setActiveConvId(null)
    inputRef.current?.focus()
  }

  // 履歴アイテム操作
  const togglePin = (id: string) => {
    setPinnedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }
  const deleteConv = (id: string) => {
    setDeletedIds((prev) => {
      const next = new Set(prev)
      next.add(id)
      return next
    })
    if (activeConvId === id) setActiveConvId(null)
  }
  const commitRename = (id: string, newTitle: string) => {
    setRenamedTitles((prev) => ({ ...prev, [id]: newTitle }))
    setEditingId(null)
  }

  if (!open) return null

  // ── ChatGPT 風の Composer (ピル形・ボーダーレス) ──
  const Composer = (
    <div
      className="rounded-[28px] px-4 pt-3 pb-2.5 transition-shadow duration-200"
      style={{
        backgroundColor: 'var(--color-obs-surface-high)',
        boxShadow: '0 4px 16px rgba(0,0,0,0.18)',
        transitionTimingFunction: 'var(--ease-liquid)',
      }}
    >
      <textarea
        ref={inputRef}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
            e.preventDefault()
            send(draft)
          }
        }}
        placeholder="ルキスマCRM のサービスについて相談する"
        rows={1}
        className="w-full bg-transparent resize-none outline-none focus:outline-none focus-visible:outline-none text-[14px] leading-relaxed max-h-[160px]"
        style={{ color: 'var(--color-obs-text)' }}
      />
      <div className="flex items-center justify-end pt-1.5">
        <button
          type="button"
          onClick={() => send(draft)}
          disabled={!draft.trim() || thinking}
          className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-150 disabled:opacity-30 disabled:cursor-not-allowed"
          style={{
            background: draft.trim()
              ? 'var(--color-obs-text)'
              : 'var(--color-obs-surface-highest)',
            color: draft.trim()
              ? 'var(--color-obs-surface)'
              : 'var(--color-obs-text-subtle)',
          }}
          aria-label="送信"
        >
          <ArrowUp size={15} strokeWidth={2.4} />
        </button>
      </div>
    </div>
  )

  const isEmpty = messages.length === 0 && !thinking

  return (
    <div
      role="dialog"
      aria-label="何についてお困りですか？"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0"
        style={{ backgroundColor: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)' }}
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="relative w-full max-w-[1000px] flex rounded-[28px] overflow-hidden"
        style={{
          height: 'min(720px, calc(100vh - 32px))',
          backgroundColor: 'var(--color-obs-surface)',
          boxShadow: '0 30px 80px rgba(0,0,0,0.55)',
        }}
      >
        {/* ── Left: 履歴サイドバー ── */}
        <aside
          className="w-[260px] flex flex-col shrink-0 select-none"
          style={{ backgroundColor: 'var(--color-obs-surface-lowest)' }}
        >
          {/* 新しい問い合わせボタン */}
          <div className="px-3 pt-4 pb-2 shrink-0">
            <button
              type="button"
              onClick={handleNewConversation}
              className="w-full flex items-center gap-2.5 h-9 px-3 rounded-[var(--radius-obs-md)] text-[12.5px] font-medium transition-colors duration-150"
              style={{
                color: 'var(--color-obs-text)',
                transitionTimingFunction: 'var(--ease-liquid)',
              }}
              onMouseOver={(e) => {
                ;(e.currentTarget as HTMLButtonElement).style.backgroundColor =
                  'var(--color-obs-surface-low)'
              }}
              onMouseOut={(e) => {
                ;(e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent'
              }}
            >
              <PenSquare
                size={14}
                strokeWidth={1.9}
                style={{ color: 'var(--color-obs-text-muted)' }}
              />
              新しいチャット
            </button>
          </div>

          {/* 履歴検索 */}
          <div className="px-3 pb-2 shrink-0">
            <div
              className="flex items-center gap-2 h-9 px-3 rounded-[var(--radius-obs-md)] transition-colors duration-150"
              style={{
                backgroundColor: 'var(--color-obs-surface-low)',
                border: '1px solid transparent',
              }}
              onMouseOver={(e) => {
                ;(e.currentTarget as HTMLDivElement).style.borderColor =
                  'var(--color-obs-border)'
              }}
              onMouseOut={(e) => {
                ;(e.currentTarget as HTMLDivElement).style.borderColor = 'transparent'
              }}
            >
              <Search
                size={13}
                strokeWidth={1.9}
                style={{ color: 'var(--color-obs-text-muted)' }}
              />
              <input
                type="text"
                value={historyQuery}
                onChange={(e) => setHistoryQuery(e.target.value)}
                placeholder="チャットを検索"
                className="flex-1 bg-transparent outline-none text-[12.5px] leading-none"
                style={{ color: 'var(--color-obs-text)' }}
              />
              {historyQuery && (
                <button
                  type="button"
                  onClick={() => setHistoryQuery('')}
                  aria-label="検索をクリア"
                  className="w-5 h-5 rounded-full flex items-center justify-center transition-colors duration-100"
                  style={{ color: 'var(--color-obs-text-muted)' }}
                  onMouseOver={(e) => {
                    ;(e.currentTarget as HTMLButtonElement).style.backgroundColor =
                      'var(--color-obs-surface-highest)'
                    ;(e.currentTarget as HTMLButtonElement).style.color =
                      'var(--color-obs-text)'
                  }}
                  onMouseOut={(e) => {
                    ;(e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent'
                    ;(e.currentTarget as HTMLButtonElement).style.color =
                      'var(--color-obs-text-muted)'
                  }}
                >
                  <X size={11} />
                </button>
              )}
            </div>
          </div>

          {/* 履歴リスト */}
          <div className="flex-1 overflow-y-auto px-2 pb-3">
            <div
              className="px-3 pt-2 pb-1.5 text-[10.5px] font-medium tracking-[0.08em]"
              style={{ color: 'var(--color-obs-text-subtle)' }}
            >
              最近
            </div>
            <div className="flex flex-col gap-[1px]">
              {visibleConversations.length === 0 ? (
                <div
                  className="px-3 py-6 text-center text-[11.5px]"
                  style={{ color: 'var(--color-obs-text-subtle)' }}
                >
                  {historyQuery
                    ? `「${historyQuery}」に一致するチャットがありません`
                    : 'まだチャットがありません'}
                </div>
              ) : (
                visibleConversations.map((c) => (
                  <ConversationItem
                    key={c.id}
                    conv={c}
                    pinned={pinnedIds.has(c.id)}
                    editing={editingId === c.id}
                    menuOpen={menuOpenId === c.id}
                    active={activeConvId === c.id}
                    onClick={() => setActiveConvId(c.id)}
                    onMenuToggle={() => setMenuOpenId((prev) => (prev === c.id ? null : c.id))}
                    onMenuClose={() => setMenuOpenId(null)}
                    onPinToggle={() => togglePin(c.id)}
                    onRenameStart={() => setEditingId(c.id)}
                    onRenameCommit={(newTitle) => commitRename(c.id, newTitle)}
                    onDelete={() => deleteConv(c.id)}
                  />
                ))
              )}
            </div>
          </div>
        </aside>

        {/* ── Right: メインチャット ── */}
        <main className="flex-1 flex flex-col min-w-0 relative">
          {/* 閉じるボタン (ヘッダーバー無し、フローティング) */}
          <button
            type="button"
            onClick={onClose}
            aria-label="閉じる"
            className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-150"
            style={{ color: 'var(--color-obs-text-muted)' }}
            onMouseOver={(e) => {
              ;(e.currentTarget as HTMLButtonElement).style.backgroundColor =
                'var(--color-obs-surface-high)'
              ;(e.currentTarget as HTMLButtonElement).style.color = 'var(--color-obs-text)'
            }}
            onMouseOut={(e) => {
              ;(e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent'
              ;(e.currentTarget as HTMLButtonElement).style.color = 'var(--color-obs-text-muted)'
            }}
          >
            <X size={15} />
          </button>

          {/* ステータスバナー (進行中 / 解決済み のみ表示) */}
          {status !== 'open' && (
            <div
              className="px-6 py-2 text-[11.5px] flex items-center gap-2 shrink-0"
              style={{
                backgroundColor:
                  status === 'resolved'
                    ? 'rgba(126,198,255,0.10)'
                    : 'rgba(255,184,107,0.10)',
                color:
                  status === 'resolved'
                    ? 'var(--color-obs-low)'
                    : 'var(--color-obs-middle)',
              }}
            >
              {status === 'resolved' ? (
                <>
                  <CheckCircle2 size={12} />
                  この問い合わせは解決済みです
                </>
              ) : (
                <>
                  <UserRound size={12} />
                  担当者にエスカレーション中
                </>
              )}
              <button
                type="button"
                onClick={handleNewConversation}
                className="ml-auto text-[11.5px] underline-offset-2 hover:underline"
                style={{ color: 'inherit' }}
              >
                新しいチャットを始める
              </button>
            </div>
          )}

          {isEmpty ? (
            // ── 空状態: 見出し + composer を縦中央配置（幅は会話表示エリアと同じ720pxで統一） ──
            <div className="flex-1 flex flex-col items-center justify-center px-6 gap-7">
              <h2
                className="font-[family-name:var(--font-display)] text-center font-semibold tracking-[-0.02em] max-w-[720px]"
                style={{
                  fontSize: 'clamp(22px, 2.3vw, 28px)',
                  color: 'var(--color-obs-text)',
                }}
              >
                ルキスマCRM に相談する
              </h2>
              <div className="w-full max-w-[720px] mx-auto">{Composer}</div>
            </div>
          ) : (
            <>
              {/* メッセージ表示エリア */}
              <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 pt-12 pb-4">
                <div className="max-w-[720px] mx-auto space-y-4">
                  {messages.map((m) => (
                    <MessageBubble key={m.id} message={m} />
                  ))}

                  {thinking && (
                    <div className="flex items-center gap-2 px-1 py-1">
                      <Loader2
                        size={13}
                        className="animate-spin"
                        style={{ color: 'var(--color-obs-text-subtle)' }}
                      />
                      <span
                        className="text-[12.5px]"
                        style={{ color: 'var(--color-obs-text-subtle)' }}
                      >
                        ナレッジを参照中…
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* 下部 (アクションチップ + composer) */}
              <div className="px-6 pb-5 pt-2 shrink-0">
                <div className="max-w-[720px] mx-auto flex flex-col gap-2.5">
                  {/* アクションチップ */}
                  {status === 'open' && (
                    <div className="flex items-center gap-1.5 px-1">
                      <ActionChip
                        icon={CheckCircle2}
                        iconColor="var(--color-obs-low)"
                        label="解決した"
                        onClick={handleResolve}
                      />
                      <ActionChip
                        icon={UserRound}
                        iconColor="var(--color-obs-middle)"
                        label="担当者に相談する"
                        onClick={handleEscalate}
                      />
                    </div>
                  )}

                  {Composer}
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  )
}

// ─── アクションチップ (ChatGPT 風 ghost button) ─────────────────────────────
function ActionChip({
  icon: Icon,
  iconColor,
  label,
  onClick,
}: {
  icon: React.ElementType
  iconColor: string
  label: string
  onClick: () => void
}) {
  const [hover, setHover] = useState(false)
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="inline-flex items-center gap-1.5 h-8 px-3 rounded-full text-[11.5px] font-medium transition-colors duration-150"
      style={{
        backgroundColor: hover
          ? 'var(--color-obs-surface-high)'
          : 'var(--color-obs-surface-low)',
        color: hover ? 'var(--color-obs-text)' : 'var(--color-obs-text-muted)',
        transitionTimingFunction: 'var(--ease-liquid)',
      }}
    >
      <Icon size={12} style={{ color: iconColor }} />
      {label}
    </button>
  )
}

// ─── 履歴アイテム ───────────────────────────────────────────────────────────
function ConversationItem({
  conv,
  pinned,
  editing,
  menuOpen,
  active,
  onClick,
  onMenuToggle,
  onMenuClose,
  onPinToggle,
  onRenameStart,
  onRenameCommit,
  onDelete,
}: {
  conv: Conversation
  pinned: boolean
  editing: boolean
  menuOpen: boolean
  active: boolean
  onClick: () => void
  onMenuToggle: () => void
  onMenuClose: () => void
  onPinToggle: () => void
  onRenameStart: () => void
  onRenameCommit: (title: string) => void
  onDelete: () => void
}) {
  const [hover, setHover] = useState(false)
  const [draft, setDraft] = useState(conv.title)
  const inputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    if (!editing) return
    setDraft(conv.title)
    const t = window.setTimeout(() => inputRef.current?.select(), 0)
    return () => window.clearTimeout(t)
  }, [editing, conv.title])

  const showMore = hover || menuOpen

  return (
    <div
      data-conv-id={conv.id}
      className="relative"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div
        role={editing ? undefined : 'button'}
        tabIndex={editing ? -1 : 0}
        onClick={editing ? undefined : onClick}
        onKeyDown={(e) => {
          if (editing) return
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            onClick()
          }
        }}
        className="flex items-center gap-2 px-3 py-[7px] rounded-[var(--radius-obs-md)] cursor-pointer transition-colors duration-150"
        style={{
          backgroundColor: active
            ? 'var(--color-obs-surface-low)'
            : hover || menuOpen
              ? 'var(--color-obs-surface-low)'
              : 'transparent',
          transitionTimingFunction: 'var(--ease-liquid)',
        }}
      >
        <div className="flex-1 min-w-0">
          {editing ? (
            <input
              ref={inputRef}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => {
                e.stopPropagation()
                if (e.key === 'Enter') {
                  e.preventDefault()
                  onRenameCommit(draft.trim() || conv.title)
                } else if (e.key === 'Escape') {
                  e.preventDefault()
                  onRenameCommit(conv.title)
                }
              }}
              onBlur={() => onRenameCommit(draft.trim() || conv.title)}
              className="w-full bg-transparent outline-none text-[12.5px] leading-tight"
              style={{
                color: 'var(--color-obs-text)',
                boxShadow: 'inset 0 0 0 1px var(--color-obs-surface-highest)',
                borderRadius: '4px',
                padding: '1px 4px',
              }}
            />
          ) : (
            <div className="flex items-center gap-1.5">
              {pinned && (
                <Pin
                  size={10}
                  strokeWidth={2}
                  style={{
                    color: 'var(--color-obs-text-muted)',
                    flexShrink: 0,
                    transform: 'rotate(45deg)',
                  }}
                />
              )}
              <span
                className="text-[12.5px] truncate flex-1 min-w-0"
                style={{
                  color: 'var(--color-obs-text)',
                  fontWeight: active ? 600 : 450,
                }}
              >
                {conv.title}
              </span>
            </div>
          )}

          {/* タイトルの下にステータスラベル */}
          {!editing && (
            <div className="mt-0.5 pl-[1px]">
              <span
                className="text-[10px] tracking-[0.02em]"
                style={{ color: STATUS_DOT[conv.status] }}
              >
                {STATUS_LABEL[conv.status]}
              </span>
            </div>
          )}
        </div>

        {/* 三点メニュートリガー(ホバー時にフェードイン) */}
        {!editing && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onMenuToggle()
            }}
            tabIndex={showMore ? 0 : -1}
            className="shrink-0 w-6 h-6 rounded flex items-center justify-center transition-[opacity,background-color] duration-150"
            style={{
              color: 'var(--color-obs-text)',
              backgroundColor: menuOpen ? 'var(--color-obs-surface-high)' : 'transparent',
              opacity: showMore ? 1 : 0,
              pointerEvents: showMore ? 'auto' : 'none',
              transitionTimingFunction: 'var(--ease-liquid)',
            }}
            onMouseOver={(e) => {
              ;(e.currentTarget as HTMLButtonElement).style.backgroundColor =
                'var(--color-obs-surface-high)'
            }}
            onMouseOut={(e) => {
              if (!menuOpen) {
                ;(e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent'
              }
            }}
            aria-label="メニュー"
          >
            <MoreHorizontal size={14} strokeWidth={2.2} />
          </button>
        )}
      </div>

      {/* ドロップダウン */}
      {menuOpen && (
        <div
          className="absolute right-2 top-full mt-1 rounded-[var(--radius-obs-md)] py-1 z-50 min-w-[160px]"
          style={{
            backgroundColor: 'var(--color-obs-surface-high)',
            boxShadow: '0 10px 30px rgba(0,0,0,0.45)',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <MenuRow
            icon={Pin}
            label={pinned ? 'ピン留めを外す' : 'ピン留めする'}
            onClick={() => {
              onPinToggle()
              onMenuClose()
            }}
          />
          <MenuRow
            icon={Pencil}
            label="名前を変更"
            onClick={() => {
              onRenameStart()
              onMenuClose()
            }}
          />
          <MenuRow
            icon={Trash2}
            label="削除"
            danger
            onClick={() => {
              onDelete()
              onMenuClose()
            }}
          />
        </div>
      )}
    </div>
  )
}

function MenuRow({
  icon: Icon,
  label,
  onClick,
  danger,
}: {
  icon: React.ElementType
  label: string
  onClick: () => void
  danger?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-[calc(100%-8px)] mx-1 flex items-center gap-2.5 px-3 py-[7px] rounded-[6px] transition-colors duration-100"
      style={{
        color: danger ? '#ff6b6b' : 'var(--color-obs-text)',
      }}
      onMouseOver={(e) => {
        ;(e.currentTarget as HTMLButtonElement).style.backgroundColor =
          'var(--color-obs-surface-low)'
      }}
      onMouseOut={(e) => {
        ;(e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent'
      }}
    >
      <Icon size={14} strokeWidth={1.9} style={{ flexShrink: 0 }} />
      <span className="text-[13px] tracking-[-0.01em]">{label}</span>
    </button>
  )
}

// ─── Message bubble (ChatGPT 風: ボーダーなし、ユーザー側だけ pill) ──────────
function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === 'user'
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={isUser ? 'rounded-[20px] px-4 py-2.5 max-w-[80%]' : 'max-w-[88%] py-1'}
        style={
          isUser
            ? {
                backgroundColor: 'var(--color-obs-surface-high)',
                color: 'var(--color-obs-text)',
              }
            : {
                color: 'var(--color-obs-text)',
              }
        }
      >
        <p className="text-[13.5px] leading-relaxed whitespace-pre-wrap">{message.text}</p>

        {message.sources && message.sources.length > 0 && (
          <div className="mt-2 space-y-1">
            {message.sources.map((src, i) => (
              <a
                key={i}
                href={src.href ?? '#'}
                className="block text-[11px] tracking-[0.02em] truncate hover:underline"
                style={{ color: 'var(--color-obs-text-subtle)' }}
              >
                参考: {src.title}
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
