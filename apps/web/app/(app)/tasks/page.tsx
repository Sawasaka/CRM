'use client'

import { useState, useMemo, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Phone,
  Mail,
  Briefcase,
  ChevronRight,
  ChevronDown,
  Check,
  X,
  RotateCcw,
  User,
  Building2,
  Calendar,
  CalendarClock,
  CheckSquare,
  FileText,
  Pencil,
} from 'lucide-react'
import {
  ObsPageShell,
  ObsHero,
  ObsCard,
  ObsChip,
  ObsButton,
  ObsInput,
} from '@/components/obsidian'
import { SignalBadge, type Signal } from '@/components/crm/SignalBadge'

// ─── Types ─────────────────────────────────────────────────────────────────────

// コンタクトのNext Actionと完全に連動した5種類
type TaskType = 'call' | 'email' | 'meeting' | 'wait' | 'followup' | 'other'
type TaskCategory = 'contact' | 'deal'

interface Task {
  id: string
  type: TaskType
  company: string
  person: string
  rank: string
  owner: string
  ownerName: string
  category: TaskCategory
  linkTo: string
  // タスク作成時に入力されるタイトル (任意・1 行)
  title?: string
  memo: string
  dueAt: string
  completed: boolean
}

// ─── Mock Data ─────────────────────────────────────────────────────────────────

const REPS = [
  { id: 'u1', name: '田中太郎', color: 'var(--color-obs-primary)' },
  { id: 'u2', name: '鈴木花子', color: 'var(--color-obs-middle)' },
  { id: 'u3', name: '佐藤次郎', color: 'var(--color-obs-low)' },
]

const INITIAL_TASKS: Task[] = [
  { id: 't1', type: 'call',  company: '株式会社テクノリード',    person: '田中 誠',    rank: 'A', owner: 'u1', ownerName: '田中太郎', category: 'contact', linkTo: '/contacts/1', title: '初回コールでアポ獲得', memo: '前回送付した会社紹介資料に対する反応を確認。次回商談の日程候補を3つ提示する。意思決定者(CTO)の同席可否も合わせてヒアリングしたい。',             dueAt: '2026-03-23', completed: false },
  { id: 't2', type: 'call',  company: '合同会社ビジョン',        person: '加藤 雄介',  rank: 'C', owner: 'u1', ownerName: '田中太郎', category: 'contact', linkTo: '/contacts/7', title: '受付経由で再アプローチ', memo: '',             dueAt: '2026-03-23', completed: false },
  { id: 't3', type: 'email', company: '株式会社イノベーション',  person: '佐々木 拓也', rank: 'A', owner: 'u1', ownerName: '田中太郎', category: 'contact', linkTo: '/contacts/3', title: '提案書ドラフトの送付', memo: '先日の商談を受けて、既存プロセスに合わせた段階導入案 (フェーズ1: 商談管理 / フェーズ2: AI議事録) を提案書に反映。料金は表記ベース+ボリュームディスカウント想定で。', dueAt: '2026-03-23', completed: false },
  { id: 't4', type: 'call',  company: '合同会社フューチャー',    person: '山本 佳子',  rank: 'A', owner: 'u2', ownerName: '鈴木花子', category: 'contact', linkTo: '/contacts/2', title: '比較表のフォローコール', memo: '',             dueAt: '2026-03-23', completed: false },
  { id: 't5', type: 'other', company: '有限会社サクセス',        person: '小林 健太',  rank: 'B', owner: 'u2', ownerName: '鈴木花子', category: 'contact', linkTo: '/contacts/5', title: '次回商談の事前準備', memo: '小林様向けの商談準備。先方の業務フロー (見積→提案→受注) に沿ったデモシナリオを作成。SR 2 名同席予定なので、現場視点の質問にも備える。',     dueAt: '2026-03-24', completed: false },
  { id: 't6', type: 'call',  company: '株式会社ネクスト',        person: '鈴木 美香',  rank: 'C', owner: 'u1', ownerName: '田中太郎', category: 'contact', linkTo: '/contacts/6', title: '初回コール (リトライ)', memo: '',             dueAt: '2026-03-20', completed: false },
  { id: 't7', type: 'other', company: '株式会社テクノリード',    person: '',           rank: 'A', owner: 'u1', ownerName: '田中太郎', category: 'deal',    linkTo: '/deals/d1', title: '機能差分 + 料金比較表の送付', memo: 'Salesforce との機能比較表を 4/3 までに送付。ROI 試算 (営業 12 名 × 月次工数削減効果) も併せて提示する。CTO 川崎様向けにセキュリティ仕様書も同梱予定。',     dueAt: '2026-03-25', completed: false },
  { id: 't8', type: 'email', company: '株式会社グロース',        person: '中村 理恵',  rank: 'B', owner: 'u3', ownerName: '佐藤次郎', category: 'contact', linkTo: '/contacts/4', title: '商談リマインドメール', memo: '',             dueAt: '2026-03-21', completed: true  },
  { id: 't9', type: 'other', company: '株式会社グロース',        person: '',           rank: 'A', owner: 'u3', ownerName: '佐藤次郎', category: 'deal',    linkTo: '/deals/d4', title: '決裁者向け提案書の作成', memo: '中村様 (推進担当) からの追加要望を反映。決裁者 MTG (4/25) で使用する想定で、ROI シミュレーション + 段階導入計画 (Q3 までの 3 フェーズ) をスライドに落とす。',   dueAt: '2026-03-22', completed: false },
  { id: 't10', type: 'other', company: '株式会社デルタ',         person: '',           rank: 'B', owner: 'u3', ownerName: '佐藤次郎', category: 'deal',    linkTo: '/deals/d2', title: '正式見積書の送付', memo: '見積条件: 5 シート × ¥6,000/月 (年額一括払い、20% 割引適用)。支払サイクルは月末締め翌月末払い。発行依頼書は財務部宛にCCで送付。',   dueAt: '2026-03-23', completed: false },
]

// ─── Style ─────────────────────────────────────────────────────────────────────

// ランク → ObsChip tone (A=hot, B=middle, C=low) — コンタクトの優先度表示用
function rankToTone(rank: string): 'hot' | 'middle' | 'low' | 'neutral' {
  if (rank === 'A') return 'hot'
  if (rank === 'B') return 'middle'
  if (rank === 'C') return 'low'
  return 'neutral'
}

// 取引タスク用: A/B/C → 1stパーティシグナル (強/中/弱) へのマッピング
function rankToSignal(rank: string): Signal {
  if (rank === 'A') return 'Hot'
  if (rank === 'B') return 'Middle'
  return 'Low'
}

// コンタクトページのNext Actionと完全に連動
const TYPE_OPTIONS: { key: TaskType; label: string }[] = [
  { key: 'email',    label: 'メール' },
  { key: 'call',     label: 'コール' },
  { key: 'meeting',  label: '商談' },
  { key: 'wait',     label: '連絡待ち' },
  { key: 'followup', label: 'フォロー' },
]

// タスク種別 → アイコン
const TASK_TYPE_ICON: Record<string, React.ElementType> = {
  call: Phone,
  email: Mail,
  meeting: Briefcase,
  wait: Briefcase,
  followup: Briefcase,
  other: Briefcase,
}

const OWNERS_FILTER = ['全員', '田中太郎', '鈴木花子', '佐藤次郎']

// ─── Task Row ──────────────────────────────────────────────────────────────────

function TaskRow({ task, isLast, onComplete, onRestore, onUpdateDue, onEdit }: {
  task: Task; isLast: boolean
  onComplete: (id: string) => void
  onRestore: (id: string) => void
  onUpdateDue: (id: string, dueAt: string) => void
  onEdit: (task: Task) => void
}) {
  const router = useRouter()
  const dateInputRef = useRef<HTMLInputElement>(null)
  const TypeIcon = TASK_TYPE_ICON[task.type] ?? Briefcase

  // 完了アニメーション中フラグ。クリック直後に立てて、緑のwash → 縮小フェードへ。
  const [completing, setCompleting] = useState(false)
  // 詳細(タイトル + メモ)の展開フラグ
  const [expanded, setExpanded] = useState(false)
  const hasDetail = Boolean(task.title || task.memo)

  function openDatePicker(e: React.MouseEvent) {
    e.stopPropagation()
    const el = dateInputRef.current
    if (!el) return
    if (typeof (el as HTMLInputElement & { showPicker?: () => void }).showPicker === 'function') {
      (el as HTMLInputElement & { showPicker: () => void }).showPicker()
    } else {
      el.click()
    }
  }

  function handleComplete() {
    if (completing) return
    setCompleting(true)
    // 演出時間の合計に合わせて親へ通知（このRowはAnimatePresenceでexitアニメも走る）
    window.setTimeout(() => onComplete(task.id), 620)
  }

  const isDoneVisual = task.completed || completing

  return (
    <motion.div
      layout
      // mount時は跳ねず、unmountでスケールダウン+フェード
      initial={false}
      exit={{
        opacity: 0,
        scale: 0.95,
        height: 0,
        paddingTop: 0,
        paddingBottom: 0,
        marginTop: 0,
        marginBottom: 0,
        transition: { duration: 0.32, ease: [0.4, 0, 0.2, 1] },
      }}
      transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
      className="relative overflow-hidden group"
      style={{
        backgroundColor: 'transparent',
        ...(isLast ? {} : { boxShadow: 'inset 0 -1px 0 0 var(--color-obs-surface-low)' }),
      }}
    >
      {/* 1行レイアウト — 担当先名は遷移、タイトル/メモは展開トグルで動線を分離 */}
      <div
        className="relative flex items-center gap-3 px-5 py-3"
        onMouseOver={(e) => {
          if (!task.completed && !completing) {
            (e.currentTarget as HTMLDivElement).style.backgroundColor = 'var(--color-obs-surface-high)'
          }
        }}
        onMouseOut={(e) => {
          if (!completing) {
            (e.currentTarget as HTMLDivElement).style.backgroundColor = 'transparent'
          }
        }}
      >
      {/* 完了時の緑wash オーバーレイ */}
      <AnimatePresence>
        {completing && (
          <motion.div
            className="pointer-events-none absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            style={{
              background:
                'linear-gradient(90deg, rgba(110,231,161,0.0) 0%, rgba(110,231,161,0.18) 35%, rgba(110,231,161,0.32) 65%, rgba(110,231,161,0.0) 100%)',
            }}
          />
        )}
      </AnimatePresence>

      {/* 左アイコン：完了演出時にチェックへスケール切替＋発光リング */}
      <div
        className="relative w-9 h-9 rounded-full flex items-center justify-center shrink-0"
        style={{
          backgroundColor: isDoneVisual ? 'var(--color-obs-surface-high)' : 'var(--color-obs-surface-highest)',
          opacity: task.completed && !completing ? 0.55 : 1,
        }}
      >
        {/* 完了時のグロー＆リップル */}
        <AnimatePresence>
          {completing && (
            <>
              <motion.span
                className="absolute inset-0 rounded-full pointer-events-none"
                initial={{ opacity: 0.7, scale: 1 }}
                animate={{ opacity: 0, scale: 2.4 }}
                transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
                style={{
                  background:
                    'radial-gradient(circle, rgba(110,231,161,0.55) 0%, rgba(110,231,161,0) 70%)',
                }}
              />
              <motion.span
                className="absolute inset-0 rounded-full pointer-events-none"
                initial={{ opacity: 1, scale: 1 }}
                animate={{ opacity: 0, scale: 1.8 }}
                transition={{ duration: 0.45, ease: 'easeOut' }}
                style={{ boxShadow: '0 0 0 2px rgba(110,231,161,0.55)' }}
              />
            </>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait" initial={false}>
          {isDoneVisual ? (
            <motion.div
              key="check"
              initial={{ scale: 0.4, rotate: -45, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              exit={{ scale: 0.4, opacity: 0 }}
              transition={{ duration: 0.32, ease: [0.34, 1.56, 0.64, 1] }}
            >
              <Check
                size={15}
                strokeWidth={3}
                style={{ color: completing ? '#6ee7a1' : 'var(--color-obs-text-muted)' }}
              />
            </motion.div>
          ) : (
            <motion.div
              key="type"
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.6, opacity: 0 }}
              transition={{ duration: 0.18 }}
            >
              <TypeIcon size={15} style={{ color: 'var(--color-obs-primary)' }} strokeWidth={2.2} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 左カラム: 担当先(コンタクト/会社) — 名前テキストをリンク化 */}
      <div className="w-[200px] shrink-0 min-w-0 relative z-10">
        <div className="flex items-center gap-2">
          {task.completed && (
            <ObsChip tone="low" className="shrink-0">
              <Check size={9} strokeWidth={3} />完了
            </ObsChip>
          )}
          <span
            role={!task.completed && !completing ? 'link' : undefined}
            tabIndex={!task.completed && !completing ? 0 : undefined}
            onClick={(e) => {
              if (task.completed || completing) return
              e.stopPropagation()
              router.push(task.linkTo)
            }}
            onMouseEnter={(e) => {
              if (task.completed || completing) return
              ;(e.currentTarget as HTMLSpanElement).style.color = 'var(--color-obs-primary)'
            }}
            onMouseLeave={(e) => {
              ;(e.currentTarget as HTMLSpanElement).style.color = isDoneVisual
                ? completing ? '#6ee7a1' : 'var(--color-obs-text-subtle)'
                : 'var(--color-obs-text)'
            }}
            className={`text-[13px] font-medium truncate transition-colors ${
              task.completed || completing ? '' : 'cursor-pointer'
            }`}
            style={{
              color: isDoneVisual
                ? completing ? '#6ee7a1' : 'var(--color-obs-text-subtle)'
                : 'var(--color-obs-text)',
              textDecoration: task.completed ? 'line-through' : 'none',
            }}
            title={!task.completed && !completing
              ? (task.category === 'deal' ? '取引詳細を開く' : 'コンタクト詳細を開く')
              : undefined}
          >
            {task.person || task.company}
          </span>
          {!task.completed && !completing && (
            task.category === 'deal' ? (
              <SignalBadge signal={rankToSignal(task.rank)} />
            ) : (
              <ObsChip tone={rankToTone(task.rank)} className="shrink-0">
                {task.rank}
              </ObsChip>
            )
          )}
        </div>
        <p
          className="text-[12px] mt-0.5 truncate"
          style={{ color: isDoneVisual ? 'var(--color-obs-text-subtle)' : 'var(--color-obs-text-muted)' }}
        >
          {task.company}
        </p>
      </div>

      {/* 中央カラム: タスクのタイトル + メモプレビュー — クリックで展開 */}
      <div
        className={`flex-1 min-w-0 relative z-10 ${
          hasDetail && !completing ? 'cursor-pointer' : ''
        }`}
        onClick={(e) => {
          if (!hasDetail || completing) return
          e.stopPropagation()
          setExpanded((v) => !v)
        }}
        title={hasDetail ? (expanded ? '詳細を閉じる' : 'タスクの詳細を見る') : undefined}
      >
        {task.title && (
          <p
            className="text-[12.5px] font-medium truncate"
            style={{
              color: isDoneVisual ? 'var(--color-obs-text-subtle)' : 'var(--color-obs-text)',
              textDecoration: task.completed ? 'line-through' : 'none',
            }}
          >
            {task.title}
          </p>
        )}
        {/* メモのプレビュー — 1行 truncate で常時表示。全文は ▼ で展開 */}
        {task.memo && !expanded && (
          <p
            className="text-[11.5px] mt-0.5 truncate"
            style={{
              color: isDoneVisual ? 'var(--color-obs-text-subtle)' : 'var(--color-obs-text-muted)',
            }}
          >
            {task.memo}
          </p>
        )}
        {/* タイトルもメモも無い時のプレースホルダ(縦位置を揃える) */}
        {!task.title && !task.memo && (
          <p
            className="text-[12px] italic"
            style={{ color: 'var(--color-obs-text-subtle)', opacity: 0.6 }}
          >
            (タイトル・メモなし)
          </p>
        )}
      </div>

      {/* 詳細展開トグル (タイトル or メモがある時だけ表示) */}
      {hasDetail && !completing && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            setExpanded((v) => !v)
          }}
          className="shrink-0 z-10 inline-flex items-center justify-center w-7 h-7 rounded-full transition-colors"
          style={{
            backgroundColor: expanded ? 'var(--color-obs-surface-highest)' : 'transparent',
            color: expanded ? 'var(--color-obs-text)' : 'var(--color-obs-text-muted)',
          }}
          onMouseOver={(e) => {
            ;(e.currentTarget as HTMLButtonElement).style.backgroundColor =
              'var(--color-obs-surface-highest)'
            ;(e.currentTarget as HTMLButtonElement).style.color = 'var(--color-obs-text)'
          }}
          onMouseOut={(e) => {
            ;(e.currentTarget as HTMLButtonElement).style.backgroundColor = expanded
              ? 'var(--color-obs-surface-highest)'
              : 'transparent'
            ;(e.currentTarget as HTMLButtonElement).style.color = expanded
              ? 'var(--color-obs-text)'
              : 'var(--color-obs-text-muted)'
          }}
          aria-label={expanded ? '詳細を閉じる' : '詳細を開く'}
          aria-expanded={expanded}
          title={expanded ? '詳細を閉じる' : 'タスクの詳細を見る'}
        >
          <ChevronDown
            size={14}
            strokeWidth={2.2}
            style={{
              transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 150ms var(--ease-liquid)',
            }}
          />
        </button>
      )}

      {/* 編集ボタン（常時表示） */}
      {!task.completed && !completing && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onEdit(task)
          }}
          className="shrink-0 z-10 inline-flex items-center justify-center w-7 h-7 rounded-full transition-colors"
          style={{
            backgroundColor: 'transparent',
            color: 'var(--color-obs-text-muted)',
          }}
          onMouseOver={(e) => {
            ;(e.currentTarget as HTMLButtonElement).style.backgroundColor =
              'var(--color-obs-surface-highest)'
            ;(e.currentTarget as HTMLButtonElement).style.color = 'var(--color-obs-text)'
          }}
          onMouseOut={(e) => {
            ;(e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent'
            ;(e.currentTarget as HTMLButtonElement).style.color = 'var(--color-obs-text-muted)'
          }}
          aria-label="タスクを編集"
          title="タスクを編集"
        >
          <Pencil size={12} strokeWidth={2.2} />
        </button>
      )}

      {/* 期日バッジ（クリックで日付変更） */}
      {!task.completed && !completing && (
        <div className="relative shrink-0 z-10">
          <button
            type="button"
            onClick={openDatePicker}
            className="inline-flex items-center gap-1 h-6 px-2 rounded-full text-[11px] font-semibold tabular-nums transition-colors"
            style={{
              backgroundColor: 'rgba(171,199,255,0.12)',
              color: 'var(--color-obs-primary)',
              boxShadow: 'inset 0 0 0 1px rgba(171,199,255,0.32)',
            }}
            onMouseOver={(e) => {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'rgba(171,199,255,0.20)'
            }}
            onMouseOut={(e) => {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'rgba(171,199,255,0.12)'
            }}
            aria-label="期日を変更"
          >
            <Calendar size={10} strokeWidth={2.5} />
            {task.dueAt
              ? task.dueAt.split('-').slice(1).map((s) => parseInt(s, 10)).join('/')
              : '期日設定'}
          </button>
          <input
            ref={dateInputRef}
            type="date"
            value={task.dueAt}
            onChange={(e) => onUpdateDue(task.id, e.target.value)}
            onClick={(e) => e.stopPropagation()}
            className="absolute top-full left-0 mt-1 opacity-0 pointer-events-none w-0 h-0"
            tabIndex={-1}
            aria-hidden="true"
          />
        </div>
      )}

      {task.completed ? (
        <div className="shrink-0 z-10" onClick={(e) => e.stopPropagation()}>
          <ObsButton
            variant="ghost"
            size="sm"
            onClick={() => onRestore(task.id)}
          >
            <RotateCcw size={11} className="mr-1 inline" />
            戻す
          </ObsButton>
        </div>
      ) : (
        <div className="shrink-0 z-10" onClick={(e) => e.stopPropagation()}>
          <motion.button
            type="button"
            onClick={handleComplete}
            disabled={completing}
            whileTap={{ scale: 0.92 }}
            animate={
              completing
                ? {
                    scale: [1, 1.08, 1],
                    background: 'linear-gradient(140deg, #6ee7a1 0%, #34c759 100%)',
                    boxShadow:
                      '0 0 0 0 rgba(110,231,161,0.6), inset 0 1px 0 rgba(255,255,255,0.35)',
                  }
                : {}
            }
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="inline-flex items-center gap-1 h-7 px-3 rounded-full text-[12px] font-semibold whitespace-nowrap"
            style={{
              background: completing
                ? 'linear-gradient(140deg, #6ee7a1 0%, #34c759 100%)'
                : 'linear-gradient(140deg, var(--color-obs-primary) 0%, var(--color-obs-primary-container) 100%)',
              color: completing ? '#053D24' : 'var(--color-obs-on-primary)',
              boxShadow: completing
                ? '0 4px 16px rgba(52,199,89,0.4), inset 0 1px 0 rgba(255,255,255,0.35)'
                : 'inset 0 1px 0 rgba(255,255,255,0.18), 0 2px 8px rgba(0,113,227,0.22)',
              cursor: completing ? 'default' : 'pointer',
            }}
          >
            <AnimatePresence mode="wait" initial={false}>
              {completing ? (
                <motion.span
                  key="done"
                  initial={{ scale: 0.4, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.4, opacity: 0 }}
                  transition={{ duration: 0.18, ease: [0.34, 1.56, 0.64, 1] }}
                  className="inline-flex items-center gap-1"
                >
                  <Check size={11} strokeWidth={3} />
                  完了
                </motion.span>
              ) : (
                <motion.span
                  key="todo"
                  initial={{ scale: 0.6, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.6, opacity: 0 }}
                  transition={{ duration: 0.14 }}
                >
                  完了
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      )}
      </div>

      {/* 詳細展開エリア — タスクのタイトル + メモを全文表示 */}
      <AnimatePresence initial={false}>
        {expanded && hasDetail && (
          <motion.div
            key="task-detail"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div
              className="mx-5 mb-3 px-4 py-3 rounded-[10px] space-y-3"
              style={{
                backgroundColor: 'var(--color-obs-surface-low)',
                boxShadow: 'inset 0 0 0 1px rgba(109,106,111,0.12)',
              }}
            >
              {task.title && (
                <div>
                  <p
                    className="text-[10px] font-bold uppercase tracking-[0.08em] mb-1 inline-flex items-center gap-1"
                    style={{ color: 'var(--color-obs-text-subtle)' }}
                  >
                    <CheckSquare size={10} />
                    タイトル
                  </p>
                  <p
                    className="text-[13px] font-medium leading-snug"
                    style={{ color: 'var(--color-obs-text)' }}
                  >
                    {task.title}
                  </p>
                </div>
              )}
              {task.memo && (
                <div>
                  <p
                    className="text-[10px] font-bold uppercase tracking-[0.08em] mb-1 inline-flex items-center gap-1"
                    style={{ color: 'var(--color-obs-text-subtle)' }}
                  >
                    <FileText size={10} />
                    メモ
                  </p>
                  <p
                    className="text-[12.5px] leading-relaxed whitespace-pre-wrap"
                    style={{ color: 'var(--color-obs-text-muted)' }}
                  >
                    {task.memo}
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ─── Category Group ────────────────────────────────────────────────────────────

function CategoryGroup({ label, icon: Icon, tasks, onComplete, onRestore, onUpdateDue, onEdit }: {
  label: string; icon: React.ElementType; tasks: Task[]
  onComplete: (id: string) => void
  onRestore: (id: string) => void
  onUpdateDue: (id: string, dueAt: string) => void
  onEdit: (task: Task) => void
}) {
  if (tasks.length === 0) return null
  // ラベルごとのアクセントカラー (取引=primary / コンタクト=low) — 背景は使わずアクセント線とアイコンのみで識別
  const isDeal = label === '取引'
  const accentFg = isDeal ? 'var(--color-obs-primary)' : 'var(--color-obs-low)'
  return (
    <div>
      <div className="flex items-center gap-2 px-5 pt-3 pb-1.5">
        <span
          className="inline-flex items-center justify-center w-[18px] h-[18px] rounded-[5px] shrink-0"
          style={{ backgroundColor: 'var(--color-obs-surface-high)' }}
        >
          <Icon size={11} style={{ color: accentFg }} strokeWidth={2.4} />
        </span>
        <span
          className="text-[12px] font-bold tracking-[0.01em]"
          style={{ color: 'var(--color-obs-text)' }}
        >
          {label}
        </span>
        <motion.span
          key={tasks.length}
          initial={{ scale: 1.4 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.32, ease: [0.34, 1.56, 0.64, 1] }}
          className="text-[11px] tabular-nums font-medium"
          style={{ color: 'var(--color-obs-text-subtle)' }}
        >
          {tasks.length}
        </motion.span>
      </div>
      <AnimatePresence initial={false}>
        {tasks.map((task, i) => (
          <TaskRow
            key={task.id}
            task={task}
            isLast={i === tasks.length - 1}
            onComplete={onComplete}
            onRestore={onRestore}
            onUpdateDue={onUpdateDue}
            onEdit={onEdit}
          />
        ))}
      </AnimatePresence>
    </div>
  )
}

// ─── Create/Edit Modal ─────────────────────────────────────────────────────────

function TaskModal({ task, onClose, onSave }: {
  task: Task | null; onClose: () => void; onSave: (task: Task) => void
}) {
  const isEdit = !!task
  const [form, setForm] = useState({
    type: (task?.type ?? 'call') as TaskType,
    company: task?.company ?? '',
    person: task?.person ?? '',
    owner: task?.owner ?? 'u1',
    rank: task?.rank ?? 'B',
    category: (task?.category ?? 'contact') as TaskCategory,
    dueAt: task?.dueAt ?? '',
    title: task?.title ?? '',
    memo: task?.memo ?? '',
  })

  // コンタクトに紐づくタスクかどうか
  const isContactLinked = form.category === 'contact'

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.company.trim()) return
    const rep = REPS.find(r => r.id === form.owner) ?? REPS[0]!
    onSave({
      id: task?.id ?? `t-${Date.now()}`,
      type: form.type,
      company: form.company.trim(),
      person: form.person.trim(),
      rank: form.rank,
      owner: form.owner,
      ownerName: rep.name,
      category: form.category,
      linkTo: task?.linkTo ?? (form.category === 'contact' ? '/contacts' : '/deals'),
      title: form.title.trim() || undefined,
      memo: form.memo.trim(),
      dueAt: form.dueAt,
      completed: task?.completed ?? false,
    })
  }

  return (
    <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        className="relative w-full max-w-[460px] rounded-[var(--radius-obs-xl)] overflow-hidden"
        style={{
          backgroundColor: 'var(--color-obs-surface-highest)',
          boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
        }}
        initial={{ opacity: 0, scale: 0.96, y: 8 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: 8 }}
        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
        onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{ boxShadow: 'inset 0 -1px 0 0 var(--color-obs-surface-low)' }}
        >
          <div className="flex items-center gap-2">
            <CalendarClock size={14} style={{ color: 'var(--color-obs-primary)' }} />
            <h2 className="text-[16px] font-bold" style={{ color: 'var(--color-obs-text)' }}>
              {isContactLinked ? 'ネクストアクション編集' : (isEdit ? 'タスク編集' : 'タスク作成')}
            </h2>
            {isContactLinked && (
              <ObsChip tone="primary">
                <CheckSquare size={9} />
                コンタクト連動
              </ObsChip>
            )}
          </div>
          <button onClick={onClose} className="p-1 rounded-full transition-colors hover:bg-[var(--color-obs-surface-high)]">
            <X size={16} style={{ color: 'var(--color-obs-text-muted)' }} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="px-5 py-4 space-y-4 max-h-[70vh] overflow-y-auto">
            {/* 紐付け先 */}
            <ObsCard depth="low" padding="sm" radius="md">
              <div className="flex items-center gap-2">
                <User size={12} style={{ color: 'var(--color-obs-primary)' }} className="shrink-0" />
                <div className="flex-1 min-w-0">
                  <p
                    className="text-[10px] font-bold uppercase tracking-[0.08em]"
                    style={{ color: 'var(--color-obs-text-subtle)' }}
                  >
                    紐付け先
                  </p>
                  <p className="text-[12px] font-medium truncate" style={{ color: 'var(--color-obs-text)' }}>
                    {form.person ? `${form.person} · ` : ''}{form.company || '(未設定)'}
                  </p>
                </div>
              </div>
            </ObsCard>

            {/* 種別 */}
            <div>
              <label
                className="text-[11px] font-bold uppercase tracking-[0.08em] mb-2 flex items-center gap-1"
                style={{ color: 'var(--color-obs-text-subtle)' }}
              >
                種別
              </label>
              <div className="flex flex-wrap gap-1.5">
                {TYPE_OPTIONS.map(opt => {
                  const active = form.type === opt.key
                  return (
                    <ObsButton
                      key={opt.key}
                      type="button"
                      variant={active ? 'primary' : 'ghost'}
                      size="sm"
                      onClick={() => setForm(f => ({ ...f, type: opt.key }))}
                    >
                      {opt.label}
                    </ObsButton>
                  )
                })}
              </div>
            </div>

            {/* 実施予定日 */}
            <div>
              <label
                className="text-[11px] font-bold uppercase tracking-[0.08em] mb-2 flex items-center justify-between"
                style={{ color: 'var(--color-obs-text-subtle)' }}
              >
                <span>実施予定日</span>
                {form.dueAt && (
                  <button
                    type="button"
                    onClick={() => setForm(f => ({ ...f, dueAt: '' }))}
                    className="inline-flex items-center gap-0.5 text-[10px] font-bold normal-case tracking-normal transition-colors"
                    style={{ color: 'var(--color-obs-text-muted)' }}
                    title="日付をクリア"
                  >
                    <X size={10} />
                    クリア
                  </button>
                )}
              </label>
              <ObsInput
                type="date"
                value={form.dueAt}
                onChange={e => setForm(f => ({ ...f, dueAt: e.target.value }))}
                style={{ colorScheme: 'dark' }}
              />
            </div>

            {/* タイトル */}
            <div>
              <label
                className="text-[11px] font-bold uppercase tracking-[0.08em] mb-2 flex items-center gap-1"
                style={{ color: 'var(--color-obs-text-subtle)' }}
              >
                タイトル
              </label>
              <ObsInput
                type="text"
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                placeholder="タスクのタイトル(例: 比較表のフォローコール)"
              />
            </div>

            {/* メモ */}
            <div>
              <label
                className="text-[11px] font-bold uppercase tracking-[0.08em] mb-2 flex items-center gap-1"
                style={{ color: 'var(--color-obs-text-subtle)' }}
              >
                メモ
              </label>
              <textarea
                value={form.memo}
                onChange={e => setForm(f => ({ ...f, memo: e.target.value }))}
                placeholder="次回アクションに関するメモを入力..."
                rows={3}
                className="w-full px-4 py-2 text-[13px] outline-none rounded-[var(--radius-obs-md)] resize-none transition-all focus:ring-2 focus:ring-[var(--color-obs-primary)]/40"
                style={{
                  backgroundColor: 'var(--color-obs-surface-lowest)',
                  color: 'var(--color-obs-text)',
                  boxShadow: 'inset 0 0 0 1px rgba(109,106,111,0.12)',
                }}
              />
            </div>
          </div>

          {/* Footer */}
          <div
            className="flex justify-end gap-2 px-5 py-4"
            style={{ boxShadow: 'inset 0 1px 0 0 var(--color-obs-surface-low)' }}
          >
            <ObsButton variant="ghost" type="button" onClick={onClose}>キャンセル</ObsButton>
            <ObsButton variant="primary" type="submit">
              {isEdit ? '保存' : '作成'}
            </ObsButton>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}

// ─── Rep Section ───────────────────────────────────────────────────────────────

function RepSection({ rep, tasks, completedTasks, index, onComplete, onRestore, onUpdateDue, onEdit }: {
  rep: typeof REPS[0]; tasks: Task[]; completedTasks: Task[]; index: number
  onComplete: (id: string) => void
  onRestore: (id: string) => void
  onUpdateDue: (id: string, dueAt: string) => void
  onEdit: (task: Task) => void
}) {
  const [open, setOpen] = useState(true)
  const [completedOpen, setCompletedOpen] = useState(false)
  const contactTasks = tasks.filter(t => t.category === 'contact')
  const dealTasks = tasks.filter(t => t.category === 'deal')

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] }}
    >
      <ObsCard depth="low" padding="none" radius="xl">
        <button
          onClick={() => setOpen(!open)}
          className="w-full flex items-center gap-3 px-5 py-3.5 transition-colors"
          style={{
            transitionTimingFunction: 'var(--ease-liquid)',
            ...(open ? { boxShadow: 'inset 0 -1px 0 0 var(--color-obs-surface)' } : {}),
          }}
          onMouseOver={(e) => {
            (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--color-obs-surface-high)'
          }}
          onMouseOut={(e) => {
            (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent'
          }}
        >
          <div
            className="w-[28px] h-[28px] rounded-full flex items-center justify-center text-[11px] font-bold shrink-0"
            style={{ backgroundColor: rep.color, color: 'var(--color-obs-on-primary)' }}
          >
            {rep.name[0]}
          </div>
          <span className="text-[14px] font-semibold" style={{ color: 'var(--color-obs-text)' }}>{rep.name}</span>
          <span className="text-[12px] tabular-nums font-medium" style={{ color: 'var(--color-obs-text-muted)' }}>
            {tasks.length + completedTasks.length}件
          </span>
          {completedTasks.length > 0 && (
            <motion.div
              key={completedTasks.length}
              initial={{ scale: 1.25, filter: 'brightness(1.6)' }}
              animate={{ scale: 1, filter: 'brightness(1)' }}
              transition={{ duration: 0.45, ease: [0.34, 1.56, 0.64, 1] }}
            >
              <ObsChip tone="low">
                <Check size={9} strokeWidth={3} />
                完了 {completedTasks.length}
              </ObsChip>
            </motion.div>
          )}
          <motion.div className="ml-auto" animate={{ rotate: open ? 90 : 0 }} transition={{ duration: 0.15 }}>
            <ChevronRight size={14} style={{ color: 'var(--color-obs-text-subtle)' }} />
          </motion.div>
        </button>

        <AnimatePresence>
          {open && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }} className="overflow-hidden">
              <CategoryGroup label="取引" icon={Building2} tasks={dealTasks} onComplete={onComplete} onRestore={onRestore} onUpdateDue={onUpdateDue} onEdit={onEdit} />
              {dealTasks.length > 0 && contactTasks.length > 0 && (
                <div className="mx-5 h-px" style={{ backgroundColor: 'var(--color-obs-surface)' }} />
              )}
              <CategoryGroup label="コンタクト" icon={User} tasks={contactTasks} onComplete={onComplete} onRestore={onRestore} onUpdateDue={onUpdateDue} onEdit={onEdit} />

              {completedTasks.length > 0 && (
                <>
                  <div className="mx-5 h-px mt-1" style={{ backgroundColor: 'var(--color-obs-surface)' }} />
                  <button
                    onClick={e => { e.stopPropagation(); setCompletedOpen(!completedOpen) }}
                    className="w-full flex items-center gap-2 px-5 py-3 transition-colors"
                    onMouseOver={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--color-obs-surface-high)'
                    }}
                    onMouseOut={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent'
                    }}
                  >
                    <Check size={12} style={{ color: 'var(--color-obs-low)' }} />
                    <span className="text-[12px] font-medium" style={{ color: 'var(--color-obs-text-muted)' }}>完了一覧</span>
                    <motion.span
                      key={completedTasks.length}
                      initial={{ scale: 1.5, color: '#6ee7a1' }}
                      animate={{ scale: 1, color: 'var(--color-obs-text-subtle)' }}
                      transition={{ duration: 0.45, ease: [0.34, 1.56, 0.64, 1] }}
                      className="text-[11px] tabular-nums"
                    >
                      {completedTasks.length}
                    </motion.span>
                    <motion.div className="ml-auto" animate={{ rotate: completedOpen ? 90 : 0 }} transition={{ duration: 0.12 }}>
                      <ChevronRight size={11} style={{ color: 'var(--color-obs-text-subtle)' }} />
                    </motion.div>
                  </button>
                  <AnimatePresence>
                    {completedOpen && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }} className="overflow-hidden">
                        <AnimatePresence initial={false}>
                          {completedTasks.map((task, i) => (
                            <TaskRow key={task.id} task={task} isLast={i === completedTasks.length - 1}
                              onComplete={onComplete} onRestore={onRestore} onUpdateDue={onUpdateDue} onEdit={onEdit} />
                          ))}
                        </AnimatePresence>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </>
              )}

              {tasks.length === 0 && completedTasks.length === 0 && (
                <div className="px-5 py-6 text-center">
                  <p className="text-[13px]" style={{ color: 'var(--color-obs-text-muted)' }}>タスクがありません</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </ObsCard>
    </motion.div>
  )
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS)
  const [ownerFilter, setOwnerFilter] = useState('全員')
  const [modalTask, setModalTask] = useState<Task | null | 'new'>(null)

  const filtered = useMemo(() => {
    let list = tasks
    if (ownerFilter !== '全員') {
      const rep = REPS.find(r => r.name === ownerFilter)
      if (rep) list = list.filter(t => t.owner === rep.id)
    }
    return list
  }, [tasks, ownerFilter])

  function handleComplete(id: string) {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: true } : t))
  }
  function handleRestore(id: string) {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: false } : t))
  }
  function handleUpdateDue(id: string, dueAt: string) {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, dueAt } : t))
  }
  function handleSave(task: Task) {
    setTasks(prev => {
      const exists = prev.find(t => t.id === task.id)
      if (exists) return prev.map(t => t.id === task.id ? task : t)
      return [task, ...prev]
    })
    setModalTask(null)
  }

  // 表示する担当者リスト
  const visibleReps = ownerFilter === '全員'
    ? REPS
    : REPS.filter(r => r.name === ownerFilter)

  return (
    <ObsPageShell>
      <div className="w-full px-8 xl:px-12 2xl:px-16 pb-16">
        <ObsHero
          eyebrow="Tasks"
          title="タスク一覧"
        />

        {/* ── Owner Filter ── */}
        <div className="flex items-center gap-1 mb-5 flex-wrap">
          {OWNERS_FILTER.map(o => {
            const active = ownerFilter === o
            return (
              <ObsButton
                key={o}
                variant={active ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setOwnerFilter(o)}
              >
                {o}
              </ObsButton>
            )
          })}
        </div>

        {/* ── Rep Sections ── */}
        <div className="space-y-4">
          {visibleReps.map((rep, i) => {
            const repTasks = filtered.filter(t => t.owner === rep.id && !t.completed)
            const completedTasks = filtered.filter(t => t.owner === rep.id && t.completed)
            return (
              <RepSection
                key={rep.id}
                rep={rep}
                tasks={repTasks}
                completedTasks={completedTasks}
                index={i}
                onComplete={handleComplete}
                onRestore={handleRestore}
                onUpdateDue={handleUpdateDue}
                onEdit={(task) => setModalTask(task)}
              />
            )
          })}
        </div>

        {/* ── Modal ── */}
        <AnimatePresence>
          {modalTask !== null && (
            <TaskModal
              task={modalTask === 'new' ? null : modalTask}
              onClose={() => setModalTask(null)}
              onSave={handleSave}
            />
          )}
        </AnimatePresence>
      </div>
    </ObsPageShell>
  )
}
