'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Building2, Users as UsersIcon, Briefcase } from 'lucide-react'
import { searchAll, KIND_LABEL, type SearchItem, type SearchKind } from '@/lib/search/mock-data'

const KIND_ICON: Record<SearchKind, React.ElementType> = {
  company: Building2,
  contact: UsersIcon,
  deal:    Briefcase,
}

export function HeaderSearch() {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [activeIdx, setActiveIdx] = useState(0)
  const wrapRef = useRef<HTMLDivElement | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)

  const buckets = useMemo(() => searchAll(query), [query])
  const flat: SearchItem[] = useMemo(
    () => [...buckets.company, ...buckets.contact, ...buckets.deal],
    [buckets],
  )
  const hasResults = flat.length > 0

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

  // クエリ変化で activeIdx をリセット
  useEffect(() => {
    setActiveIdx(0)
  }, [query])

  const goTo = (item: SearchItem) => {
    setOpen(false)
    setQuery('')
    router.push(item.href)
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open && (e.key === 'ArrowDown' || e.key === 'Enter')) {
      setOpen(true)
      return
    }
    if (e.key === 'Escape') {
      setOpen(false)
      inputRef.current?.blur()
      return
    }
    if (!hasResults) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIdx((i) => Math.min(i + 1, flat.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIdx((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      const target = flat[activeIdx]
      if (target) goTo(target)
    }
  }

  const showDropdown = open && (query.trim().length > 0)

  let runningIdx = 0
  const renderSection = (kind: SearchKind, items: SearchItem[]) => {
    if (items.length === 0) return null
    const Icon = KIND_ICON[kind]
    return (
      <div key={kind}>
        <div
          className="px-3 pt-2 pb-1 text-[10px] font-medium tracking-[0.1em] uppercase"
          style={{ color: 'var(--color-obs-text-subtle)' }}
        >
          {KIND_LABEL[kind]}
        </div>
        {items.map((item) => {
          const idx = runningIdx++
          const isActive = idx === activeIdx
          return (
            <button
              key={item.id}
              type="button"
              onMouseEnter={() => setActiveIdx(idx)}
              onClick={() => goTo(item)}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-left transition-colors duration-100"
              style={{
                backgroundColor: isActive ? 'var(--color-obs-surface-low)' : 'transparent',
                color: 'var(--color-obs-text)',
              }}
            >
              <Icon
                size={14}
                strokeWidth={1.9}
                style={{
                  color: isActive ? 'var(--color-obs-primary)' : 'var(--color-obs-text-muted)',
                  flexShrink: 0,
                }}
              />
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-medium leading-tight truncate">{item.title}</div>
                {item.subtitle && (
                  <div
                    className="text-[11px] leading-tight mt-0.5 truncate"
                    style={{ color: 'var(--color-obs-text-subtle)' }}
                  >
                    {item.subtitle}
                  </div>
                )}
              </div>
            </button>
          )
        })}
      </div>
    )
  }

  return (
    <div ref={wrapRef} className="relative w-[260px] max-w-full">
      <div
        className="flex items-center gap-2 h-9 px-3 rounded-[var(--radius-obs-md)] transition-colors duration-150 fo-glass-rim"
        style={{
          background:
            'linear-gradient(145deg, rgba(24,25,29,0.58) 0%, rgba(14,15,18,0.70) 100%)',
          backdropFilter: 'blur(10px) saturate(118%)',
          WebkitBackdropFilter: 'blur(10px) saturate(118%)',
          boxShadow:
            'inset 0 0 0 1px rgba(171,199,255,0.070), inset 1px 1px 0 rgba(255,255,255,0.030)',
        }}
      >
        <Search size={14} strokeWidth={1.9} style={{ color: 'var(--color-obs-text-subtle)' }} />
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder="企業・コンタクト・取引を検索"
          className="flex-1 bg-transparent outline-none text-[12.5px]"
          style={{ color: 'var(--color-obs-text)' }}
        />
      </div>

      {showDropdown && (
        <div
          className="absolute top-full left-0 right-0 mt-1.5 py-1 rounded-[var(--radius-obs-md)] z-50 max-h-[420px] overflow-y-auto fo-glass-strong fo-glass-rim fo-thin-scroll"
          style={{
            boxShadow: '0 24px 60px rgba(0,0,0,0.5), inset 1px 1px 0 rgba(171,199,255,0.10), inset -1px -1px 0 rgba(0,0,0,0.25)',
          }}
        >
          {hasResults ? (
            <>
              {renderSection('company', buckets.company)}
              {renderSection('contact', buckets.contact)}
              {renderSection('deal',    buckets.deal)}
            </>
          ) : (
            <div
              className="px-3 py-3 text-[12.5px]"
              style={{ color: 'var(--color-obs-text-muted)' }}
            >
              該当する企業・コンタクト・取引が見つかりませんでした
            </div>
          )}
        </div>
      )}
    </div>
  )
}
