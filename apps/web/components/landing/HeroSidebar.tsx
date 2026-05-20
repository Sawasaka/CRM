'use client'

/**
 * Hero 内のチャットパネル左に表示する CRM 風サイドバーモック。
 * クリックで Hero 右側の表示が各機能モックに切り替わる（インタラクティブ）。
 */

import {
  Building2, Columns3, Users, Briefcase, List, CheckSquare,
  Ticket, LayoutGrid, Mail, Target, BookOpen, Plus, Search,
} from 'lucide-react'
import type { HeroDemoKey } from './hero-demos'

const NAV_ITEMS: { icon: typeof Building2; label: string; key: HeroDemoKey }[] = [
  { icon: Building2,   label: '290万社DB',         key: 'companies' },
  { icon: Columns3,    label: 'パイプライン',       key: 'pipeline' },
  { icon: Users,       label: 'コンタクト',         key: 'contacts' },
  { icon: Briefcase,   label: '取引',              key: 'deals' },
  { icon: List,        label: 'ISリスト',           key: 'lists' },
  { icon: CheckSquare, label: 'タスク一覧',         key: 'tasks' },
  { icon: Ticket,      label: 'チケット',           key: 'tickets' },
  { icon: LayoutGrid,  label: 'アクションボード',   key: 'action-board' },
  { icon: Mail,        label: 'メール配信',         key: 'mail' },
  { icon: Target,      label: '開発優先度',         key: 'priority' },
  { icon: BookOpen,    label: 'ナレッジ',           key: 'knowledge' },
]

const RECENT_CHATS = [
  '今週アプローチすべき HOT…',
  'テクノリードの最新議事録…',
  'パイプラインで停滞中の案件',
  'IT 部門の採用インテント T…',
  'フューチャー社の比較表案…',
  '直近の議事録から共通課題…',
  '物流業界の HOT 企業リスト',
  '今月のチャーン候補とリス…',
]

interface HeroSidebarProps {
  active: HeroDemoKey
  onSelect: (k: HeroDemoKey) => void
}

export const HeroSidebar = ({ active, onSelect }: HeroSidebarProps) => {
  return (
    <aside className="hidden lg:flex flex-col h-full w-[228px] shrink-0 bg-[#0e0e10] border-r border-white/[0.04] select-none">
      {/* Logo */}
      <div className="h-[52px] flex items-center px-4 shrink-0 border-b border-white/[0.04]">
        <button
          type="button"
          onClick={() => onSelect('chat')}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <div
            className="w-5 h-5 rounded-[5px] flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #abc7ff, #0071e3)' }}
          >
            <span className="text-[10px] font-bold text-[#0a0a0c]">K</span>
          </div>
          <span className="text-[13px] font-medium text-[#e7e5ea]">ルキスマCRM</span>
        </button>
      </div>

      {/* Nav items */}
      <div className="flex-1 overflow-hidden flex flex-col px-2 pt-3">
        <nav className="space-y-[2px]">
          {NAV_ITEMS.map(({ icon: Icon, label, key }) => {
            const isActive = active === key
            return (
              <button
                type="button"
                key={key}
                onClick={() => onSelect(key)}
                className="w-full flex items-center gap-2.5 h-8 px-2.5 rounded-md text-[12px] transition-colors"
                style={
                  isActive
                    ? { backgroundColor: 'rgba(171,199,255,0.08)', color: '#abc7ff' }
                    : { color: '#9b99a0' }
                }
                onMouseEnter={(e) => {
                  if (!isActive) (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'rgba(53,52,55,0.4)'
                }}
                onMouseLeave={(e) => {
                  if (!isActive) (e.currentTarget as HTMLButtonElement).style.backgroundColor = ''
                }}
              >
                <Icon size={14} strokeWidth={1.6} color={isActive ? '#abc7ff' : '#7e7c83'} />
                <span>{label}</span>
              </button>
            )
          })}
        </nav>

        <div className="h-[1px] mx-1 my-3 bg-white/[0.05]" />

        {/* New chat / search */}
        <div className="space-y-[2px]">
          <button
            type="button"
            onClick={() => onSelect('chat')}
            className="w-full flex items-center gap-2.5 h-8 px-2.5 rounded-md text-[12px] transition-colors"
            style={
              active === 'chat'
                ? { backgroundColor: 'rgba(171,199,255,0.08)', color: '#e7e5ea' }
                : { color: '#e7e5ea', backgroundColor: 'rgba(53,52,55,0.4)' }
            }
          >
            <Plus size={14} strokeWidth={1.6} color="#abc7ff" />
            新しいチャット
          </button>
          <button
            type="button"
            onClick={() => onSelect('search')}
            className="w-full flex items-center gap-2.5 h-8 px-2.5 rounded-md text-[12px] transition-colors"
            style={
              active === 'search'
                ? { backgroundColor: 'rgba(171,199,255,0.08)', color: '#abc7ff' }
                : { color: '#9b99a0' }
            }
            onMouseEnter={(e) => {
              if (active !== 'search') (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'rgba(53,52,55,0.4)'
            }}
            onMouseLeave={(e) => {
              if (active !== 'search') (e.currentTarget as HTMLButtonElement).style.backgroundColor = ''
            }}
          >
            <Search size={14} strokeWidth={1.6} color={active === 'search' ? '#abc7ff' : '#7e7c83'} />
            検索
          </button>
        </div>

        <div className="h-[1px] mx-1 my-3 bg-white/[0.05]" />

        {/* Recent chats */}
        <div className="overflow-hidden flex flex-col gap-[1px]">
          <div className="px-2.5 pb-1 text-[9px] uppercase tracking-[0.14em] text-[#5d5a5f]">最近のチャット</div>
          <div className="overflow-y-auto fo-thin-scroll pr-1">
            {RECENT_CHATS.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => onSelect('chat')}
                className="w-full text-left h-7 px-2.5 flex items-center text-[11.5px] text-[#9b99a0] rounded-md hover:bg-shimmer/30 truncate"
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* User footer */}
      <div className="h-[52px] flex items-center gap-2.5 px-3 shrink-0 border-t border-white/[0.04]">
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-[#0a0a0c]"
          style={{ background: 'linear-gradient(135deg, #abc7ff, #c8b9ff)' }}
        >
          開
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[11.5px] text-[#e7e5ea] truncate">開発 太郎</div>
          <div className="text-[9px] text-[#5d5a5f] truncate">RookieSmart Inc.</div>
        </div>
      </div>
    </aside>
  )
}
