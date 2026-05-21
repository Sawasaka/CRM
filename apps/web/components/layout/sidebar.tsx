'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import {
  PenSquare,
  Search,
  CreditCard,
  Plug,
  ChevronUp,
  Users,
  MoreHorizontal,
  Pin,
  Pencil,
  Trash2,
  PanelLeft,
  Activity,
  ShieldAlert,
  Wrench,
} from 'lucide-react'
import { MOCK_CHAT_HISTORY } from '@/lib/chat-history/mock-data'

// ─── ワークスペースナビ項目 ─────────────────────────────────────────────────
// アイコンは「その機能を担うエージェントの頭文字」を採用:
//   S = Sales Agent     (aurora) — 営業活動全般
//   M = Marketing Agent (amber)  — メール配信などマーケ施策
//   C = Customer (Support/Success) Agent (coral) — チケット対応
//   H = Helpdesk Agent  (lilac)  — ナレッジ・社内 Q&A
//   P = PDM Agent       (mint)   — 開発優先度・要望集計
type NavItemDef = { href: string; label: string; initial: string; color: string }
const NAV_ITEMS: NavItemDef[] = [
  { href: '/companies', label: '290万社DB',       initial: 'S', color: '#abc7ff' },
  { href: '/pipeline',  label: 'パイプライン',     initial: 'S', color: '#abc7ff' },
  { href: '/contacts',  label: 'コンタクト',       initial: 'S', color: '#abc7ff' },
  { href: '/deals',     label: '取引',             initial: 'S', color: '#abc7ff' },
  { href: '/lists',     label: 'ISリスト',         initial: 'S', color: '#abc7ff' },
  { href: '/tasks',     label: 'タスク一覧',       initial: 'S', color: '#abc7ff' },
  { href: '/tickets',   label: 'チケット',         initial: 'C', color: '#ff8dcf' },
  { href: '/dashboard', label: 'アクションボード', initial: 'S', color: '#abc7ff' },
  { href: '/mail',      label: 'メール配信',       initial: 'M', color: '#ffcf4a' },
  { href: '/priority',  label: '開発優先度',       initial: 'P', color: '#8dffc9' },
  { href: '/knowledge', label: 'ナレッジ',         initial: 'H', color: '#c8b9ff' },
]

// ─── Top nav button (新しいチャット / 検索 / ナビ項目) ──────────────────────
function TopNavItem({
  icon: Icon,
  label,
  onClick,
  active,
}: {
  icon: React.ElementType
  label: string
  onClick: () => void
  active?: boolean
}) {
  const [hover, setHover] = useState(false)
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="w-full mx-2 flex items-center gap-2.5 px-3 py-[7px] rounded-[var(--radius-obs-md)] transition-colors duration-150 text-left"
      style={{
        width: 'calc(100% - 16px)',
        backgroundColor: active
          ? 'rgba(171,199,255,0.12)'
          : hover
            ? 'rgba(171,199,255,0.05)'
            : 'transparent',
        boxShadow: active ? 'inset 0 0 0 1px rgba(171,199,255,0.22)' : undefined,
        transitionTimingFunction: 'var(--ease-liquid)',
      }}
    >
      <Icon
        size={15}
        strokeWidth={active ? 2.2 : 1.9}
        style={{
          color: active ? 'var(--color-obs-primary)' : 'var(--color-obs-text-muted)',
          flexShrink: 0,
          filter: active ? 'drop-shadow(0 0 6px rgba(171,199,255,0.45))' : undefined,
        }}
      />
      <span
        className="text-[13.5px] tracking-[-0.01em] leading-none"
        style={{
          color: 'var(--color-obs-text)',
          fontWeight: active ? 600 : 500,
          opacity: active ? 1 : 0.92,
        }}
      >
        {label}
      </span>
    </button>
  )
}

// ─── ワークスペースナビ用 Link アイテム ─────────────────────────────────────
function WorkspaceNavItem({
  href,
  initial,
  color,
  label,
  active,
}: {
  href: string
  initial: string
  color: string
  label: string
  active: boolean
}) {
  const [hover, setHover] = useState(false)
  return (
    <Link href={href}>
      <div
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        className="mx-2 flex items-center gap-2.5 px-3 py-[7px] rounded-[var(--radius-obs-md)] transition-colors duration-150"
        style={{
          backgroundColor: active
            ? `${color}1f`
            : hover
              ? `${color}10`
              : 'transparent',
          boxShadow: active ? `inset 0 0 0 1px ${color}38` : undefined,
          transitionTimingFunction: 'var(--ease-liquid)',
        }}
      >
        <span
          className="inline-flex items-center justify-center w-[20px] h-[20px] rounded-[5px] text-[10px] font-semibold tabular-nums shrink-0"
          style={{
            backgroundColor: active ? `${color}28` : `${color}14`,
            color,
            boxShadow: `inset 0 0 0 1px ${color}38`,
          }}
        >
          {initial}
        </span>
        <span
          className="text-[13px] tracking-[-0.01em] leading-none"
          style={{
            color: 'var(--color-obs-text)',
            fontWeight: active ? 600 : 500,
            opacity: active ? 1 : 0.88,
          }}
        >
          {label}
        </span>
      </div>
    </Link>
  )
}

// ─── Chat history item ───────────────────────────────────────────────────────
function ChatItemMenuRow({
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

function ChatItem({
  id,
  title,
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
  id: string
  title: string
  pinned: boolean
  editing: boolean
  menuOpen: boolean
  active: boolean
  onClick: () => void
  onMenuToggle: () => void
  onMenuClose: () => void
  onPinToggle: () => void
  onRenameStart: () => void
  onRenameCommit: (newTitle: string) => void
  onDelete: () => void
}) {
  const [hover, setHover] = useState(false)
  const [draft, setDraft] = useState(title)
  const inputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    if (!editing) return
    setDraft(title)
    const t = window.setTimeout(() => inputRef.current?.select(), 0)
    return () => window.clearTimeout(t)
  }, [editing, title])

  const showMore = hover || menuOpen

  return (
    <div
      data-chat-id={id}
      className="relative mx-2"
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
        className="flex items-center gap-2 px-3 py-[5px] rounded-[var(--radius-obs-md)] transition-colors duration-150 text-left cursor-pointer"
        style={{
          backgroundColor: active
            ? 'var(--color-obs-surface-high)'
            : hover || menuOpen
              ? 'var(--color-obs-surface-low)'
              : 'transparent',
          transitionTimingFunction: 'var(--ease-liquid)',
        }}
      >
        {pinned && (
          <Pin
            size={11}
            strokeWidth={2}
            style={{
              color: 'var(--color-obs-text-muted)',
              flexShrink: 0,
              transform: 'rotate(45deg)',
            }}
          />
        )}

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
                onRenameCommit(draft.trim() || title)
              } else if (e.key === 'Escape') {
                e.preventDefault()
                onRenameCommit(title)
              }
            }}
            onBlur={() => onRenameCommit(draft.trim() || title)}
            className="flex-1 bg-transparent outline-none text-[13px] leading-snug tracking-[-0.005em] min-w-0"
            style={{
              color: 'var(--color-obs-text)',
              boxShadow: 'inset 0 0 0 1px var(--color-obs-surface-highest)',
              borderRadius: '4px',
              padding: '1px 4px',
            }}
          />
        ) : (
          <span
            className="flex-1 text-[13px] leading-snug tracking-[-0.005em] truncate"
            style={{
              color: 'var(--color-obs-text)',
              fontWeight: active ? 600 : 450,
              opacity: active ? 1 : 0.88,
            }}
          >
            {title}
          </span>
        )}

        {!editing && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onMenuToggle()
            }}
            aria-label="メニュー"
            tabIndex={showMore ? 0 : -1}
            className="shrink-0 w-6 h-6 rounded flex items-center justify-center transition-[opacity,background-color] duration-150"
            style={{
              color: 'var(--color-obs-text)',
              backgroundColor: menuOpen ? 'var(--color-obs-surface-highest)' : 'transparent',
              opacity: showMore ? 1 : 0,
              pointerEvents: showMore ? 'auto' : 'none',
              transitionTimingFunction: 'var(--ease-liquid)',
            }}
            onMouseOver={(e) => {
              ;(e.currentTarget as HTMLButtonElement).style.backgroundColor =
                'var(--color-obs-surface-highest)'
            }}
            onMouseOut={(e) => {
              if (!menuOpen) {
                ;(e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent'
              }
            }}
            title="メニュー"
          >
            <MoreHorizontal size={15} strokeWidth={2.2} />
          </button>
        )}
      </div>

      {menuOpen && (
        <div
          className="absolute right-2 top-full mt-1 rounded-[var(--radius-obs-md)] py-1 z-50 min-w-[160px]"
          style={{
            backgroundColor: 'var(--color-obs-surface-highest)',
            boxShadow: '0 10px 30px rgba(0,0,0,0.45), inset 0 0 0 1px rgba(109,106,111,0.14)',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <ChatItemMenuRow
            icon={Pin}
            label={pinned ? 'ピン留めを外す' : 'ピン留めする'}
            onClick={() => {
              onPinToggle()
              onMenuClose()
            }}
          />
          <ChatItemMenuRow
            icon={Pencil}
            label="名前を変更"
            onClick={() => {
              onRenameStart()
              onMenuClose()
            }}
          />
          <ChatItemMenuRow
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

// ─── User menu (drop-up) ────────────────────────────────────────────────────
type MenuItem = { href: string; icon: React.ElementType; label: string }
type MenuSection = { title?: string; items: MenuItem[] }

const USER_MENU_SECTIONS: MenuSection[] = [
  {
    items: [
      { href: '/subscription', icon: CreditCard, label: 'プラン・クレジット' },
      { href: '/subscription?tab=members', icon: Users, label: 'メンバー管理' },
      { href: '/subscription#feature-requests', icon: Wrench, label: '機能リクエスト' },
      { href: '/settings/integrations', icon: Plug, label: '連携設定' },
    ],
  },
  {
    title: 'コンプライアンス',
    items: [
      { href: '/settings/billing', icon: CreditCard, label: '支払い履歴' },
      { href: '/settings/audit-log', icon: Activity, label: '監査ログ' },
    ],
  },
]

// ルキスマCRM テナント (開発者) のみに表示する管理者メニュー
// 本番では NEXT_PUBLIC_BGM_TENANT_ID とログイン中テナントの一致でガード
const ADMIN_MENU_SECTION: MenuSection = {
  title: '開発者専用',
  items: [
    { href: '/admin/customer-ops', icon: ShieldAlert, label: 'Customer Operations' },
    { href: '/admin/feature-requests', icon: Wrench, label: '機能リクエスト管理' },
  ],
}

// MVP: モック (本番ではauth context + env でテナントID判定)
function useIsBGMTenant(): boolean {
  return true
}

function UserMenu({ userName, userInitial }: { userName: string; userInitial: string }) {
  const [open, setOpen] = useState(false)
  const [hover, setHover] = useState(false)
  const wrapRef = useRef<HTMLDivElement | null>(null)
  const isBGMTenant = useIsBGMTenant()

  // 外側クリックで閉じる
  useEffect(() => {
    if (!open) return
    const onDocClick = (e: MouseEvent) => {
      if (!wrapRef.current) return
      if (!wrapRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [open])

  // BGMテナントの場合は管理者メニューを末尾に追加
  const sections: MenuSection[] = isBGMTenant
    ? [...USER_MENU_SECTIONS, ADMIN_MENU_SECTION]
    : USER_MENU_SECTIONS

  return (
    <div ref={wrapRef} className="mx-2 mb-3 relative">
      {/* Drop-up menu */}
      {open && (
        <div
          className="absolute left-0 right-0 bottom-full mb-2 rounded-[var(--radius-obs-md)] py-1.5 z-50 max-h-[420px] overflow-y-auto"
          style={{
            backgroundColor: 'var(--color-obs-surface-highest)',
            boxShadow: '0 10px 30px rgba(0,0,0,0.45), inset 0 0 0 1px rgba(109,106,111,0.14)',
          }}
        >
          {sections.map((section, i) => (
            <div key={i}>
              {/* セクション区切り線 */}
              {i > 0 && (
                <div
                  className="mx-3 my-1.5 h-px"
                  style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
                />
              )}
              {/* セクションタイトル */}
              {section.title && (
                <div
                  className="px-3 pt-1 pb-0.5 text-[10px] font-medium uppercase tracking-[0.1em]"
                  style={{ color: 'var(--color-obs-text-subtle)' }}
                >
                  {section.title}
                </div>
              )}
              {/* セクション内のアイテム */}
              {section.items.map((m) => (
                <Link
                  key={m.href}
                  href={m.href}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-[7px] mx-1 rounded-[6px] transition-colors duration-100"
                  style={{ color: 'var(--color-obs-text)' }}
                  onMouseOver={(e) => {
                    ;(e.currentTarget as HTMLAnchorElement).style.backgroundColor =
                      'var(--color-obs-surface-low)'
                  }}
                  onMouseOut={(e) => {
                    ;(e.currentTarget as HTMLAnchorElement).style.backgroundColor = 'transparent'
                  }}
                >
                  <m.icon
                    size={14}
                    strokeWidth={1.9}
                    style={{ color: 'var(--color-obs-text-muted)', flexShrink: 0 }}
                  />
                  <span className="text-[13px] tracking-[-0.01em]">{m.label}</span>
                </Link>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* User card button */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-[var(--radius-obs-md)] cursor-pointer transition-colors duration-150"
        style={{
          backgroundColor:
            open || hover ? 'var(--color-obs-surface-low)' : 'var(--color-obs-surface)',
          transitionTimingFunction: 'var(--ease-liquid)',
        }}
      >
        {/* Avatar */}
        <div
          className="w-[28px] h-[28px] rounded-full flex items-center justify-center shrink-0"
          style={{
            background:
              'linear-gradient(140deg, var(--color-obs-primary) 0%, var(--color-obs-primary-container) 100%)',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.2)',
          }}
        >
          <span
            className="text-[11px] font-bold leading-none"
            style={{ color: 'var(--color-obs-on-primary)' }}
          >
            {userInitial}
          </span>
        </div>

        <span
          className="flex-1 text-left text-[13px] font-medium truncate tracking-[-0.01em]"
          style={{ color: 'var(--color-obs-text)' }}
        >
          {userName}
        </span>

        <ChevronUp
          size={13}
          strokeWidth={2}
          style={{
            color: 'var(--color-obs-text-muted)',
            transform: open ? 'rotate(0deg)' : 'rotate(180deg)',
            transition: 'transform 0.15s ease',
          }}
          className="shrink-0"
        />
      </button>
    </div>
  )
}

// ─── Sidebar ─────────────────────────────────────────────────────────────────
export function Sidebar() {
  const router = useRouter()
  const pathname = usePathname()
  const { data: session } = useSession()
  const [activeChatId, setActiveChatId] = useState<string | null>(null)
  const [pinnedIds, setPinnedIds] = useState<Set<string>>(new Set())
  const [deletedIds, setDeletedIds] = useState<Set<string>>(new Set())
  const [renamedTitles, setRenamedTitles] = useState<Record<string, string>>({})
  const [editingId, setEditingId] = useState<string | null>(null)
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null)
  const [collapsed, setCollapsed] = useState(false)

  // 折りたたみ状態を <html> の data 属性に反映 → ヘッダー/メイン領域のレイアウトが追随
  useEffect(() => {
    document.documentElement.dataset.sidebarCollapsed = collapsed ? 'true' : 'false'
    return () => {
      // unmount 時はリセット（折りたたみ前提のレイアウトが残らないように）
      delete document.documentElement.dataset.sidebarCollapsed
    }
  }, [collapsed])

  // メニューを外側クリックで閉じる
  useEffect(() => {
    if (!menuOpenId) return
    const onDocClick = (e: MouseEvent) => {
      const tgt = e.target as HTMLElement | null
      if (!tgt) return setMenuOpenId(null)
      const inItem = tgt.closest(`[data-chat-id="${menuOpenId}"]`)
      if (!inItem) setMenuOpenId(null)
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [menuOpenId])

  const visibleChats = useMemo(() => {
    return MOCK_CHAT_HISTORY.filter((c) => !deletedIds.has(c.id))
      .map((c) => ({ ...c, title: renamedTitles[c.id] ?? c.title }))
      .sort((a, b) => {
        const ap = pinnedIds.has(a.id) ? 1 : 0
        const bp = pinnedIds.has(b.id) ? 1 : 0
        if (ap !== bp) return bp - ap
        return a.updatedAt < b.updatedAt ? 1 : -1
      })
  }, [deletedIds, renamedTitles, pinnedIds])

  const isHomePathname = pathname === '/'
  const isNavActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href)
  const userName = session?.user?.name || session?.user?.email || 'ユーザー'
  const userInitial = userName.slice(0, 1).toUpperCase()

  const handleNewChat = () => {
    setActiveChatId(null)
    router.push('/')
  }
  const handleSearch = () => {
    // Phase 1: 検索モーダル未実装。ホームのチャット入力にフォーカス。
    router.push('/?focus=search')
  }
  const handleChatClick = (id: string) => {
    setActiveChatId(id)
    router.push(`/?chat=${id}`)
  }
  const togglePin = (id: string) => {
    setPinnedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }
  const deleteChat = (id: string) => {
    setDeletedIds((prev) => {
      const next = new Set(prev)
      next.add(id)
      return next
    })
    if (activeChatId === id) setActiveChatId(null)
  }
  const commitRename = (id: string, newTitle: string) => {
    setRenamedTitles((prev) => ({ ...prev, [id]: newTitle }))
    setEditingId(null)
  }

  return (
    <>
      {/* ── サイドバー折りたたみ／展開トグル（画面左上に常時固定。z-50 でサイドバー(z-30)より手前に置き、
            折りたたみアニメーション時にロゴがこのボタンの背面を通り抜ける形にする） ── */}
      <button
        type="button"
        onClick={() => setCollapsed((v) => !v)}
        aria-label={collapsed ? 'サイドバーを開く' : 'サイドバーを折りたたむ'}
        className="fixed top-3 left-3 z-50 w-9 h-9 rounded-[var(--radius-obs-md)] flex items-center justify-center transition-colors duration-150"
        style={{
          color: 'var(--color-obs-text-muted)',
          backgroundColor: collapsed ? 'var(--color-obs-surface-high)' : 'transparent',
          transitionTimingFunction: 'var(--ease-liquid)',
        }}
        onMouseOver={(e) => {
          ;(e.currentTarget as HTMLButtonElement).style.backgroundColor =
            'var(--color-obs-surface-high)'
          ;(e.currentTarget as HTMLButtonElement).style.color = 'var(--color-obs-text)'
        }}
        onMouseOut={(e) => {
          ;(e.currentTarget as HTMLButtonElement).style.backgroundColor = collapsed
            ? 'var(--color-obs-surface-high)'
            : 'transparent'
          ;(e.currentTarget as HTMLButtonElement).style.color = 'var(--color-obs-text-muted)'
        }}
      >
        <PanelLeft size={16} strokeWidth={1.8} />
      </button>

      <aside
        className="fixed left-0 top-0 bottom-0 w-[244px] flex flex-col z-30 select-none transition-transform duration-200"
        style={{
          backgroundColor: 'rgba(11,11,12,0.78)',
          backdropFilter: 'blur(24px) saturate(140%)',
          WebkitBackdropFilter: 'blur(24px) saturate(140%)',
          boxShadow: 'inset -1px 0 0 rgba(171,199,255,0.08)',
          transform: collapsed ? 'translateX(-100%)' : 'translateX(0)',
          transitionTimingFunction: 'var(--ease-liquid)',
        }}
      >
        {/* ── ロゴ ── (折りたたみ時はトグルボタンの背面を通り抜けて画面外へ消える) */}
        <div className="h-[56px] shrink-0 flex items-center pl-14 pr-3">
          <Link
            href="/"
            className="transition-opacity duration-150 hover:opacity-80"
            aria-label="ルキスマCRM ホーム"
          >
            <span className="fo-gradient-text font-[family-name:var(--font-display)] text-[16px] font-semibold tracking-[-0.015em]">
              ルキスマCRM
            </span>
          </Link>
        </div>

        {/* ── Workspace nav ── */}
        <div className="flex flex-col gap-[2px] pt-2 pb-2">
          {NAV_ITEMS.map((it) => (
            <WorkspaceNavItem
              key={it.href}
              href={it.href}
              initial={it.initial}
              color={it.color}
              label={it.label}
              active={isNavActive(it.href)}
            />
          ))}
        </div>

        {/* ── Divider (workspace ↔ chat) ── */}
        <div
          className="mx-4 my-1 h-px"
          style={{ backgroundColor: 'var(--color-obs-surface-low)' }}
        />

        {/* ── Chat zone (新しいチャット / 検索 + 履歴) ── */}
        <nav className="bgm-chat-scroll flex-1 overflow-y-auto overflow-x-hidden pt-3 pb-2">
          {/* チャット用アクション */}
          <div className="flex flex-col gap-[2px] mb-2">
            <TopNavItem
              icon={PenSquare}
              label="新しいチャット"
              onClick={handleNewChat}
              active={isHomePathname && !activeChatId}
            />
            <TopNavItem icon={Search} label="検索" onClick={handleSearch} active={false} />
          </div>

          {/* 履歴 */}
          <div className="flex flex-col gap-[1px]">
            {visibleChats.map((it) => (
              <ChatItem
                key={it.id}
                id={it.id}
                title={it.title}
                pinned={pinnedIds.has(it.id)}
                editing={editingId === it.id}
                menuOpen={menuOpenId === it.id}
                active={activeChatId === it.id}
                onClick={() => handleChatClick(it.id)}
                onMenuToggle={() => setMenuOpenId((prev) => (prev === it.id ? null : it.id))}
                onMenuClose={() => setMenuOpenId(null)}
                onPinToggle={() => togglePin(it.id)}
                onRenameStart={() => setEditingId(it.id)}
                onRenameCommit={(newTitle) => commitRename(it.id, newTitle)}
                onDelete={() => deleteChat(it.id)}
              />
            ))}
          </div>
        </nav>

        {/* ── User menu (drop-up: 設定 / 連携 / プラン) ── */}
        <UserMenu userName={userName} userInitial={userInitial} />
      </aside>
    </>
  )
}
