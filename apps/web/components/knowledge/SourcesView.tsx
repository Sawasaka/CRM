'use client'

import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Database,
  Loader2,
  ExternalLink,
  Trash2,
  BookOpen,
  ChevronDown,
  HelpCircle,
  Hand,
  StickyNote,
  XCircle,
  CheckCircle2,
  Filter,
  Pencil,
  Building2,
  Layers,
  Tag as TagIcon,
  Eye,
  Download,
  Video,
  Slack,
  MessagesSquare,
} from 'lucide-react'
import { ObsButton, ObsCard } from '@/components/obsidian'
import { trpc } from '@/lib/trpc/client'
import { DUMMY_FAQS, type DummyFaq } from './_dummy-faqs'

// `Slack` / `MessagesSquare` / `Database` は SOURCE_ICON で参照する（過去FAQの sourceType
// が SLACK / GOOGLE_CHAT / DRIVE のまま残っていてもアイコンが落ちないよう保持）。
// 本機能は議事録抽出のみだが、過去データに対する後方互換のため。

type FaqSourceType =
  | 'MEETING'
  | 'MANUAL'
  | 'SLACK'
  | 'GOOGLE_CHAT'
  | 'DRIVE'
  | 'PERSONAL_NOTE'

const SOURCE_LABEL: Record<FaqSourceType, string> = {
  MEETING: '議事録',
  MANUAL: '手動',
  SLACK: 'Slack',
  GOOGLE_CHAT: 'Google Chat',
  DRIVE: 'Drive',
  PERSONAL_NOTE: '個人ノート',
}

const SOURCE_ICON: Record<FaqSourceType, React.ElementType> = {
  MEETING: Video,
  MANUAL: Hand,
  SLACK: Slack,
  GOOGLE_CHAT: MessagesSquare,
  DRIVE: Database,
  PERSONAL_NOTE: StickyNote,
}

// ダミーFAQの編集 / 削除を localStorage に永続化するためのキー
const LOCAL_EDIT_KEY = 'bgm:knowledge:faq-local-edits:v1'
const LOCAL_DELETE_KEY = 'bgm:knowledge:faq-local-deletes:v1'

export function SourcesView() {
  return (
    <div className="flex flex-col gap-5">
      <FaqSection />
    </div>
  )
}

// ────────────────────────────────────────────────────────────────────
// チームFAQ（自動生成されたドキュメント）
// ────────────────────────────────────────────────────────────────────

function FaqSection() {
  // 複数同時に開けるよう Set で管理
  const [openIds, setOpenIds] = useState<Set<string>>(new Set())
  const isOpen = (id: string) => openIds.has(id)
  const toggleOpen = (id: string) => {
    setOpenIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }
  const closeOne = (id: string) => {
    setOpenIds((prev) => {
      if (!prev.has(id)) return prev
      const next = new Set(prev)
      next.delete(id)
      return next
    })
  }
  // 展開した項目で「答えを見る」を押したものだけ A. を表示
  const [revealedAnswers, setRevealedAnswers] = useState<Record<string, boolean>>({})
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editBody, setEditBody] = useState('')
  // ダミー時の編集内容は localStorage に永続化（リロードしても残る）
  const [localEdits, setLocalEdits] = useState<
    Record<string, { title: string; body: string }>
  >({})
  // 初回マウント時に localStorage から復元
  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const raw = window.localStorage.getItem(LOCAL_EDIT_KEY)
      if (raw) setLocalEdits(JSON.parse(raw))
    } catch {
      // 壊れた値は無視
    }
  }, [])
  // 変更があれば localStorage に書き戻す
  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      window.localStorage.setItem(LOCAL_EDIT_KEY, JSON.stringify(localEdits))
    } catch {
      // 容量オーバー等は黙殺
    }
  }, [localEdits])
  const [activeTag, setActiveTag] = useState<string>('ALL')

  // 再フェッチを抑制して体感速度を上げる。
  // 初期値を空配列で持たせて isLoading 状態をスキップ → ダミーが即時表示される。
  const listQuery = trpc.faq.list.useQuery(
    { limit: 200 },
    {
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
      placeholderData: { items: [], nextCursor: null },
    },
  )
  const deleteMutation = trpc.faq.delete.useMutation({
    onSuccess: async () => {
      await listQuery.refetch()
    },
  })
  const updateMutation = trpc.faq.update.useMutation({
    onSuccess: async () => {
      setEditingId(null)
      await listQuery.refetch()
    },
    onError: (err) => {
      alert(`保存に失敗しました: ${err.message}`)
    },
  })

  const realItems = listQuery.data?.items ?? []

  // 実データが1件もない/読み込み中/エラー時は、即時ダミーを表示してブロックさせない。
  // 1件でも実データが返れば自動でダミーは消える。
  const useDummy = realItems.length === 0

  const baseItems: Array<DummyFaq | (typeof realItems)[number]> = useDummy
    ? DUMMY_FAQS
    : realItems

  // ダミー時に削除した ID は localStorage に保持（リロード後も非表示）
  const [localDeletes, setLocalDeletes] = useState<string[]>([])
  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const raw = window.localStorage.getItem(LOCAL_DELETE_KEY)
      if (raw) setLocalDeletes(JSON.parse(raw))
    } catch {
      // 壊れた値は無視
    }
  }, [])
  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      window.localStorage.setItem(LOCAL_DELETE_KEY, JSON.stringify(localDeletes))
    } catch {
      // ignore
    }
  }, [localDeletes])

  // ダミー時のローカル編集 / 削除を反映
  const allItems = useMemo(
    () =>
      baseItems
        .filter((it) => !localDeletes.includes(it.id))
        .map((it) => {
          const ov = localEdits[it.id]
          if (!ov) return it
          return { ...it, title: ov.title, body: ov.body }
        }),
    [baseItems, localEdits, localDeletes],
  )

  // フィルタ用の選択肢を集計（タグのみ）
  const tags = useMemo(() => {
    const set = new Set<string>()
    for (const it of allItems) {
      const ts = (it as DummyFaq).tags ?? []
      for (const t of ts) set.add(t)
    }
    return Array.from(set).sort()
  }, [allItems])

  // フィルタ適用（タグのみ）
  const items = useMemo(() => {
    return allItems.filter((it) => {
      if (activeTag !== 'ALL') {
        const ts = (it as DummyFaq).tags ?? []
        if (!ts.includes(activeTag)) return false
      }
      return true
    })
  }, [allItems, activeTag])

  const hasFilter = activeTag !== 'ALL'


  return (
    <div>
      {/* ヘッダ */}
      <div className="flex items-end justify-between gap-4 mb-3 flex-wrap">
        <div>
          <h3
            className="text-[16px] font-semibold tracking-[-0.01em] inline-flex items-center gap-2"
            style={{ color: 'var(--color-obs-text)' }}
          >
            <BookOpen size={15} style={{ color: 'var(--color-obs-primary)' }} />
            チームFAQ（自動生成ドキュメント）
          </h3>
          <p
            className="text-[11.5px] mt-1 leading-relaxed max-w-2xl"
            style={{ color: 'var(--color-obs-text-muted)' }}
          >
            部門ごとに自動抽出された質問&回答を整理。連携ソースから自動的に蓄積されていきます。
          </p>
        </div>
        <ObsButton
          variant="ghost"
          size="sm"
          onClick={() => downloadFaqCsv(items)}
          disabled={items.length === 0}
        >
          <span className="inline-flex items-center gap-1.5">
            <Download size={12} />
            CSVダウンロード
          </span>
        </ObsButton>
      </div>

      {/* フィルタ: タグのみ */}
      <div className="flex items-center gap-2 flex-wrap mb-3">
        <SelectFilter
          icon={Filter}
          label="タグ"
          value={activeTag}
          onChange={setActiveTag}
          options={[
            { value: 'ALL', label: '全タグ' },
            ...tags.map((t) => ({ value: t, label: t })),
          ]}
        />
        {hasFilter && (
          <button
            onClick={() => setActiveTag('ALL')}
            className="inline-flex items-center gap-1 h-7 px-2.5 rounded-full text-[11px] font-medium transition-colors hover:bg-[var(--color-obs-surface-high)]"
            style={{ color: 'var(--color-obs-text-muted)' }}
          >
            <XCircle size={11} />
            クリア
          </button>
        )}
        <span
          className="ml-auto text-[11.5px] tabular-nums"
          style={{ color: 'var(--color-obs-text-subtle)' }}
        >
          {items.length}件
        </span>
      </div>

      {/* リスト */}
      <div>
        <ObsCard depth="low" padding="none" radius="xl">
          {items.length === 0 ? (
            <div className="text-center py-12">
              <HelpCircle
                size={22}
                className="inline-block mb-3"
                style={{ color: 'var(--color-obs-text-subtle)' }}
              />
              <p className="text-[14px]" style={{ color: 'var(--color-obs-text-muted)' }}>
                {hasFilter ? '条件に合う FAQ がありません' : '該当する FAQ がまだありません'}
              </p>
              <p
                className="text-[12px] mt-2 max-w-md mx-auto"
                style={{ color: 'var(--color-obs-text-subtle)' }}
              >
                {hasFilter
                  ? 'フィルタを変更するか、クリアしてください。'
                  : '商談の議事録（Google Meet / Zoom）が同期されると、自動的にここへ蓄積されていきます。'}
              </p>
            </div>
          ) : (
            items.map((f) => {
                const open = isOpen(f.id)
                const SrcIcon = SOURCE_ICON[f.sourceType as FaqSourceType] ?? Hand
                return (
                  <div key={f.id}>
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => toggleOpen(f.id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault()
                          toggleOpen(f.id)
                        }
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors duration-150 cursor-pointer"
                      style={{
                        backgroundColor: open
                          ? 'var(--color-obs-surface-high)'
                          : 'transparent',
                        boxShadow: 'inset 0 -1px 0 rgba(109,106,111,0.08)',
                      }}
                    >
                      <HelpCircle
                        size={13}
                        strokeWidth={2.2}
                        style={{ color: 'var(--color-obs-primary)', flexShrink: 0 }}
                      />
                      <p
                        className="text-[13px] font-medium tracking-[-0.01em] truncate flex-1 min-w-0"
                        style={{ color: 'var(--color-obs-text)' }}
                        title={f.title}
                      >
                        {f.title}
                      </p>
                      {/* タグのみ表示（先頭1個） */}
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {(f.tags ?? [])[0] && (
                          <Tag tone="sub">{(f.tags ?? [])[0]}</Tag>
                        )}
                      </div>
                      <ChevronDown
                        size={13}
                        className="transition-transform shrink-0"
                        style={{
                          color: open
                            ? 'var(--color-obs-primary)'
                            : 'var(--color-obs-text-subtle)',
                          transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
                        }}
                      />
                    </div>
                    <AnimatePresence initial={false}>
                      {open && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.12, ease: [0.16, 1, 0.3, 1] }}
                          className="overflow-hidden"
                          style={{ backgroundColor: 'var(--color-obs-surface-low)' }}
                        >
                          <div className="px-6 py-3 pl-[44px]">
                            {editingId === f.id ? (
                              /* ─── 編集モード ─────────────────────────── */
                              <div className="flex flex-col gap-2">
                                <label
                                  className="text-[10.5px] font-semibold uppercase tracking-[0.06em]"
                                  style={{ color: 'var(--color-obs-text-subtle)' }}
                                >
                                  質問
                                </label>
                                <input
                                  value={editTitle}
                                  onChange={(e) => setEditTitle(e.target.value)}
                                  className="w-full px-3 h-9 text-[13px] rounded-[var(--radius-obs-sm)] outline-none"
                                  style={{
                                    backgroundColor: 'var(--color-obs-surface-lowest)',
                                    color: 'var(--color-obs-text)',
                                    boxShadow: 'inset 0 0 0 1px rgba(109,106,111,0.18)',
                                  }}
                                />
                                <label
                                  className="text-[10.5px] font-semibold uppercase tracking-[0.06em] mt-1"
                                  style={{ color: 'var(--color-obs-text-subtle)' }}
                                >
                                  回答
                                </label>
                                <textarea
                                  value={editBody}
                                  onChange={(e) => setEditBody(e.target.value)}
                                  rows={6}
                                  className="w-full px-3 py-2 text-[13px] leading-[1.7] rounded-[var(--radius-obs-sm)] outline-none resize-y"
                                  style={{
                                    backgroundColor: 'var(--color-obs-surface-lowest)',
                                    color: 'var(--color-obs-text)',
                                    boxShadow: 'inset 0 0 0 1px rgba(109,106,111,0.18)',
                                  }}
                                />
                                {(() => {
                                  // 元の値（ローカル編集が反映済みなら f.title/f.body はその値）と比較
                                  const trimmedTitle = editTitle.trim()
                                  const titleChanged =
                                    trimmedTitle.length > 0 && trimmedTitle !== f.title
                                  const bodyChanged = editBody !== f.body
                                  const hasChanges = titleChanged || bodyChanged
                                  const titleEmpty = trimmedTitle.length === 0
                                  return (
                                    <div className="flex items-center justify-end gap-2 mt-1">
                                      {/* ステータス表示：変更の有無をテキストでも示す */}
                                      <span
                                        className="text-[11px] mr-1 inline-flex items-center gap-1"
                                        style={{
                                          color: titleEmpty
                                            ? 'var(--color-obs-hot)'
                                            : hasChanges
                                              ? 'var(--color-obs-low)'
                                              : 'var(--color-obs-text-subtle)',
                                        }}
                                      >
                                        {titleEmpty
                                          ? '質問は必須です'
                                          : hasChanges
                                            ? '未保存の変更があります'
                                            : '変更なし'}
                                      </span>
                                      <ObsButton
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setEditingId(null)}
                                        disabled={updateMutation.isPending}
                                      >
                                        キャンセル
                                      </ObsButton>
                                      <ObsButton
                                        variant="primary"
                                        size="sm"
                                        onClick={() => {
                                          const newTitle = trimmedTitle || f.title
                                          if (useDummy) {
                                            setLocalEdits((prev) => ({
                                              ...prev,
                                              [f.id]: { title: newTitle, body: editBody },
                                            }))
                                            setEditingId(null)
                                            return
                                          }
                                          updateMutation.mutate({
                                            id: f.id,
                                            title: newTitle,
                                            body: editBody,
                                          })
                                        }}
                                        disabled={
                                          titleEmpty ||
                                          !hasChanges ||
                                          updateMutation.isPending
                                        }
                                      >
                                        <span className="inline-flex items-center gap-1.5">
                                          {updateMutation.isPending ? (
                                            <Loader2 size={12} className="animate-spin" />
                                          ) : (
                                            <CheckCircle2 size={12} />
                                          )}
                                          {hasChanges ? '保存' : '変更なし'}
                                        </span>
                                      </ObsButton>
                                    </div>
                                  )
                                })()}
                              </div>
                            ) : (
                              /* ─── Q&A 表示（テスト形式：質問は行タイトル、答えはクリックで展開） ─── */
                              <>
                                {/* A. 行: 答えボタン + 出典 を1行に並べる */}
                                <div className="flex items-start gap-2 mt-3 flex-wrap">
                                  <span
                                    className="text-[12px] font-bold tracking-[0.05em] mt-2"
                                    style={{ color: '#6ee7a1' }}
                                  >
                                    A.
                                  </span>
                                  {revealedAnswers[f.id] ? (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        setRevealedAnswers((prev) => ({
                                          ...prev,
                                          [f.id]: false,
                                        }))
                                      }}
                                      className="flex-1 min-w-0 text-left flex items-start justify-between gap-2 px-3 py-2 rounded-[var(--radius-obs-md)] text-[13px] leading-relaxed transition-colors hover:bg-[var(--color-obs-surface-high)]"
                                      style={{
                                        color: 'var(--color-obs-text)',
                                        boxShadow: 'inset 0 0 0 1px var(--color-obs-surface-high)',
                                      }}
                                      title="クリックで答えを隠す"
                                    >
                                      <span className="flex-1 whitespace-pre-wrap">{f.body}</span>
                                      <ChevronDown
                                        size={14}
                                        strokeWidth={2}
                                        className="shrink-0 mt-0.5"
                                        style={{
                                          color: 'var(--color-obs-text-subtle)',
                                          transform: 'rotate(180deg)',
                                        }}
                                      />
                                    </button>
                                  ) : (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        setRevealedAnswers((prev) => ({
                                          ...prev,
                                          [f.id]: true,
                                        }))
                                      }}
                                      className="inline-flex items-center gap-1.5 h-8 px-3 rounded-[var(--radius-obs-md)] text-[12.5px] font-semibold transition-colors"
                                      style={{
                                        backgroundColor: 'rgba(110,231,161,0.10)',
                                        color: '#6ee7a1',
                                        boxShadow: 'inset 0 0 0 1px rgba(110,231,161,0.32)',
                                      }}
                                      onMouseOver={(e) => {
                                        ;(e.currentTarget as HTMLButtonElement).style.backgroundColor =
                                          'rgba(110,231,161,0.18)'
                                        ;(e.currentTarget as HTMLButtonElement).style.boxShadow =
                                          'inset 0 0 0 1px rgba(110,231,161,0.55)'
                                      }}
                                      onMouseOut={(e) => {
                                        ;(e.currentTarget as HTMLButtonElement).style.backgroundColor =
                                          'rgba(110,231,161,0.10)'
                                        ;(e.currentTarget as HTMLButtonElement).style.boxShadow =
                                          'inset 0 0 0 1px rgba(110,231,161,0.32)'
                                      }}
                                      title="クリックで答えを表示"
                                    >
                                      <Eye size={12} />
                                      クリックで答えを表示
                                      <ChevronDown size={12} strokeWidth={2.2} />
                                    </button>
                                  )}

                                  {/* 出典: A. の右に並列配置（答え非表示時のみ。表示時は本文の下にまわす） */}
                                  {!revealedAnswers[f.id] && f.sourceUrl && (
                                    <div className="inline-flex items-center gap-2 h-8">
                                      <a
                                        href={f.sourceUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1 text-[12px] font-medium"
                                        style={{ color: 'var(--color-obs-primary)' }}
                                        onClick={(e) => e.stopPropagation()}
                                      >
                                        <ExternalLink size={11} />
                                        出典を開く
                                      </a>
                                      <span
                                        className="inline-flex items-center gap-1 text-[10.5px] px-1.5 h-5 rounded-full"
                                        style={{
                                          backgroundColor: 'var(--color-obs-surface-highest)',
                                          color: 'var(--color-obs-text-muted)',
                                        }}
                                      >
                                        <SrcIcon size={9} />
                                        {SOURCE_LABEL[f.sourceType as FaqSourceType] ?? f.sourceType}
                                      </span>
                                    </div>
                                  )}

                                  {/* 編集・削除ボタン（答え非表示時はA.行に統合して高さを揃える） */}
                                  {!revealedAnswers[f.id] && (
                                    <div className="ml-auto inline-flex items-center gap-1 h-8">
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          setEditTitle(f.title)
                                          setEditBody(f.body)
                                          setEditingId(f.id)
                                        }}
                                        title="質問・回答を編集"
                                        className="inline-flex items-center gap-1 h-7 px-2.5 rounded-[var(--radius-obs-sm)] text-[11px] font-medium transition-colors hover:bg-[var(--color-obs-surface-high)]"
                                        style={{ color: 'var(--color-obs-text-muted)' }}
                                      >
                                        <Pencil size={11} />
                                        編集
                                      </button>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          if (
                                            !confirm(
                                              `「${f.title}」を削除しますか？\nこの操作は取り消せません。`,
                                            )
                                          ) {
                                            return
                                          }
                                          if (useDummy) {
                                            setLocalDeletes((prev) =>
                                              prev.includes(f.id) ? prev : [...prev, f.id],
                                            )
                                            closeOne(f.id)
                                            return
                                          }
                                          deleteMutation.mutate({ id: f.id })
                                        }}
                                        disabled={!useDummy && deleteMutation.isPending}
                                        title="この項目を削除"
                                        className="inline-flex items-center gap-1 h-7 px-2.5 rounded-[var(--radius-obs-sm)] text-[11px] font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                        style={{
                                          color: 'var(--color-obs-hot)',
                                          backgroundColor: 'transparent',
                                        }}
                                        onMouseOver={(e) => {
                                          ;(e.currentTarget as HTMLButtonElement).style.backgroundColor =
                                            'rgba(255,107,107,0.10)'
                                        }}
                                        onMouseOut={(e) => {
                                          ;(e.currentTarget as HTMLButtonElement).style.backgroundColor =
                                            'transparent'
                                        }}
                                      >
                                        <Trash2 size={11} />
                                        削除
                                      </button>
                                    </div>
                                  )}
                                </div>

                                {/* アクション行: 答え展開時のみ表示（出典 + 編集/削除） */}
                                {revealedAnswers[f.id] && (
                                  <div className="mt-3 flex items-center gap-2 flex-wrap">
                                    {f.sourceUrl && (
                                      <>
                                        <a
                                          href={f.sourceUrl}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="inline-flex items-center gap-1 text-[12px] font-medium"
                                          style={{ color: 'var(--color-obs-primary)' }}
                                        >
                                          <ExternalLink size={11} />
                                          出典を開く
                                        </a>
                                        <span
                                          className="inline-flex items-center gap-1 text-[10.5px] px-1.5 h-5 rounded-full"
                                          style={{
                                            backgroundColor: 'var(--color-obs-surface-highest)',
                                            color: 'var(--color-obs-text-muted)',
                                          }}
                                        >
                                          <SrcIcon size={9} />
                                          {SOURCE_LABEL[f.sourceType as FaqSourceType] ?? f.sourceType}
                                        </span>
                                      </>
                                    )}

                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        setEditTitle(f.title)
                                        setEditBody(f.body)
                                        setEditingId(f.id)
                                      }}
                                      title="質問・回答を編集"
                                      className="ml-auto inline-flex items-center gap-1 h-6 px-2 rounded-[var(--radius-obs-sm)] text-[11px] font-medium transition-colors hover:bg-[var(--color-obs-surface-high)]"
                                      style={{ color: 'var(--color-obs-text-muted)' }}
                                    >
                                      <Pencil size={11} />
                                      編集
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        if (
                                          !confirm(
                                            `「${f.title}」を削除しますか？\nこの操作は取り消せません。`,
                                          )
                                        ) {
                                          return
                                        }
                                        if (useDummy) {
                                          setLocalDeletes((prev) =>
                                            prev.includes(f.id) ? prev : [...prev, f.id],
                                          )
                                          closeOne(f.id)
                                          return
                                        }
                                        deleteMutation.mutate({ id: f.id })
                                      }}
                                      disabled={!useDummy && deleteMutation.isPending}
                                      title="この項目を削除"
                                      className="inline-flex items-center gap-1 h-6 px-2 rounded-[var(--radius-obs-sm)] text-[11px] font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                      style={{
                                        color: 'var(--color-obs-hot)',
                                        backgroundColor: 'transparent',
                                      }}
                                      onMouseOver={(e) => {
                                        ;(e.currentTarget as HTMLButtonElement).style.backgroundColor =
                                          'rgba(255,107,107,0.10)'
                                      }}
                                      onMouseOut={(e) => {
                                        ;(e.currentTarget as HTMLButtonElement).style.backgroundColor =
                                          'transparent'
                                      }}
                                    >
                                      <Trash2 size={11} />
                                      削除
                                    </button>
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )
              })
          )}
        </ObsCard>
      </div>
    </div>
  )
}

// ────────────────────────────────────────────────────────────────────
// 共通パーツ
// ────────────────────────────────────────────────────────────────────

// 部門・カテゴリ・サブカテゴリ用のタグチップ
// tone ごとにアイコン・色・ラベル接頭辞を変えて、3階層が一目で区別できる
function Tag({
  children,
  tone = 'neutral',
}: {
  children: React.ReactNode
  tone?: 'dept' | 'cat' | 'sub' | 'neutral'
}) {
  const config = {
    dept: {
      bg: 'rgba(171,199,255,0.20)',
      color: 'var(--color-obs-primary)',
      shadow: 'inset 0 0 0 1px rgba(171,199,255,0.32)',
      Icon: Building2,
      label: '部門',
    },
    cat: {
      bg: 'rgba(110,231,161,0.14)',
      color: '#6ee7a1',
      shadow: 'inset 0 0 0 1px rgba(110,231,161,0.30)',
      Icon: Layers,
      label: 'カテゴリ',
    },
    sub: {
      bg: 'rgba(255,184,107,0.12)',
      color: 'var(--color-obs-middle)',
      shadow: 'inset 0 0 0 1px rgba(255,184,107,0.28)',
      Icon: TagIcon,
      label: '',
    },
    neutral: {
      bg: 'var(--color-obs-surface-highest)',
      color: 'var(--color-obs-text-muted)',
      shadow: 'none',
      Icon: null as React.ElementType | null,
      label: '',
    },
  }[tone]
  const Icon = config.Icon
  return (
    <span
      className="inline-flex items-center gap-1 pl-1.5 pr-2 h-5 rounded-full text-[10px] font-medium whitespace-nowrap"
      style={{
        backgroundColor: config.bg,
        color: config.color,
        boxShadow: config.shadow,
      }}
      title={config.label ? `${config.label}: ${children}` : undefined}
    >
      {Icon && <Icon size={9} strokeWidth={2.4} />}
      {config.label && (
        <span
          className="text-[9px] font-semibold opacity-70 tracking-tight"
          aria-hidden
        >
          {config.label}
        </span>
      )}
      <span>{children}</span>
    </span>
  )
}

// プルダウン式フィルタ（部門・カテゴリ・ソース共通）
function SelectFilter({
  icon: Icon,
  label,
  value,
  onChange,
  options,
}: {
  icon: React.ElementType
  label: string
  value: string
  onChange: (v: string) => void
  options: Array<{ value: string; label: string }>
}) {
  const isActive = value !== 'ALL'
  const currentLabel = options.find((o) => o.value === value)?.label ?? label
  return (
    <div className="relative inline-flex items-center">
      <Icon
        size={11}
        style={{
          color: isActive ? 'var(--color-obs-primary)' : 'var(--color-obs-text-subtle)',
          position: 'absolute',
          left: 9,
          pointerEvents: 'none',
        }}
      />
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none pl-7 pr-7 h-8 rounded-[var(--radius-obs-md)] text-[12px] font-medium transition-colors cursor-pointer outline-none"
        style={{
          backgroundColor: isActive
            ? 'var(--color-obs-primary-container)'
            : 'var(--color-obs-surface-high)',
          color: isActive ? 'var(--color-obs-on-primary)' : 'var(--color-obs-text-muted)',
        }}
        aria-label={label}
        title={currentLabel}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown
        size={11}
        style={{
          color: isActive ? 'var(--color-obs-on-primary)' : 'var(--color-obs-text-subtle)',
          position: 'absolute',
          right: 8,
          pointerEvents: 'none',
        }}
      />
    </div>
  )
}

// 表示中の FAQ を CSV としてダウンロード
function downloadFaqCsv(
  items: Array<{
    id: string
    title: string
    body: string
    department?: string | null
    category?: string | null
    tags?: string[] | null
    sourceType: string
    sourceUrl?: string | null
    createdAt?: Date | string | null
    updatedAt?: Date | string | null
  }>,
) {
  const headers = [
    'id',
    'department',
    'category',
    'tags',
    'title',
    'body',
    'sourceType',
    'sourceUrl',
    'createdAt',
    'updatedAt',
  ] as const
  const escape = (v: unknown): string => {
    const s = v == null ? '' : String(v)
    if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`
    return s
  }
  const lines = [headers.join(',')]
  for (const it of items) {
    lines.push(
      [
        it.id,
        it.department ?? '',
        it.category ?? '',
        (it.tags ?? []).join(' / '),
        it.title,
        it.body,
        it.sourceType,
        it.sourceUrl ?? '',
        it.createdAt ? new Date(it.createdAt).toISOString() : '',
        it.updatedAt ? new Date(it.updatedAt).toISOString() : '',
      ]
        .map(escape)
        .join(','),
    )
  }
  const csv = '﻿' + lines.join('\n') // BOMをつけてExcelの文字化けを防ぐ
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  const ts = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
  a.href = url
  a.download = `team-faq-${ts}.csv`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
