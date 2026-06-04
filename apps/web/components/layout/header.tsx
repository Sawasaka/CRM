'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { Bell, Plus } from 'lucide-react'
import { HeaderSearch } from './HeaderSearch'
import { SupportPanel } from './SupportPanel'
import { NotificationPanel } from './NotificationPanel'
import { NOTIFICATIONS, type NotificationItem } from '@/lib/notifications/mock-data'

const PAGE_ACTIONS: Record<string, { label: string }> = {
  '/tasks': { label: '追加' },
}

// ─── Main Header ─────────────────────────────────────────────────────────────
export function Header() {
  const pathname = usePathname()
  const action = Object.entries(PAGE_ACTIONS).find(([key]) => pathname.startsWith(key))?.[1]

  // 問い合わせ・通知パネルの開閉
  const [supportOpen, setSupportOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [notifications, setNotifications] = useState<NotificationItem[]>(NOTIFICATIONS)
  const unreadCount = notifications.filter((n) => !n.read).length

  const toggleNotif = () => {
    setNotifOpen((v) => !v)
    if (!notifOpen) setSupportOpen(false)
  }

  return (
    <>
      <header
        className="fixed top-0 right-0 h-[56px] flex items-center px-6 gap-2 z-20 transition-[left] duration-200"
        style={{
          left: 'var(--bgm-sidebar-w)',
          background:
            'linear-gradient(180deg, rgba(15,16,19,0.58) 0%, rgba(15,16,19,0.24) 64%, rgba(15,16,19,0) 100%)',
          backdropFilter: 'blur(14px) saturate(118%)',
          WebkitBackdropFilter: 'blur(14px) saturate(118%)',
          boxShadow: 'none',
          transitionTimingFunction: 'var(--ease-liquid)',
        }}
      >
        {/* ── Global search (CRM 横断) ── */}
        <HeaderSearch />

        <div className="flex-1" />

        {/* Primary action button */}
        {action && (
          <motion.button
            whileTap={{ scale: 0.97 }}
            transition={{ duration: 0.1 }}
            onClick={() => window.dispatchEvent(new CustomEvent('header-action'))}
            className="hidden md:flex items-center gap-1 h-[32px] px-4 rounded-[var(--radius-obs-md)] text-[13px] font-medium shrink-0 transition-all"
            style={{
              background:
                'linear-gradient(140deg, var(--color-obs-primary) 0%, var(--color-obs-primary-container) 100%)',
              color: 'var(--color-obs-on-primary)',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.18), 0 0 0 1px rgba(171,199,255,0.08)',
            }}
          >
            <Plus size={13} strokeWidth={2.2} />
            {action.label}
          </motion.button>
        )}

        {/* Notification bell */}
        <NotificationButton
          unread={unreadCount}
          active={notifOpen}
          onClick={toggleNotif}
        />
      </header>

      {/* ── Floating panels (ヘッダー外にレンダリング) ── */}
      <SupportPanel open={supportOpen} onClose={() => setSupportOpen(false)} />
      <NotificationPanel
        open={notifOpen}
        onClose={() => setNotifOpen(false)}
        items={notifications}
        onItemsChange={setNotifications}
      />
    </>
  )
}

function NotificationButton({
  unread,
  active,
  onClick,
}: {
  unread: number
  active: boolean
  onClick: () => void
}) {
  const [hover, setHover] = useState(false)
  const showHigh = hover || active
  return (
    <motion.button
      whileTap={{ scale: 0.94 }}
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      aria-label={unread > 0 ? `通知 ${unread}件 (未読あり)` : '通知'}
      aria-pressed={active}
      className="relative w-[32px] h-[32px] flex items-center justify-center rounded-[var(--radius-obs-md)] transition-colors duration-100"
      style={{
        backgroundColor: showHigh ? 'var(--color-obs-surface-high)' : 'transparent',
        color: showHigh ? 'var(--color-obs-text)' : 'var(--color-obs-text-muted)',
      }}
    >
      <Bell size={15} strokeWidth={1.8} />
      {unread > 0 && (
        <span
          className="absolute top-[8px] right-[8px] w-[5px] h-[5px] rounded-full"
          style={{
            backgroundColor: 'var(--color-obs-hot)',
            boxShadow: '0 0 0 2px var(--color-obs-surface)',
          }}
        />
      )}
    </motion.button>
  )
}
