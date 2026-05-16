'use client'

import { useEffect, useRef, useState } from 'react'
import {
  Check,
  Layers,
  Globe,
  // 機能アイコン
  BookOpen,
  Activity,
  Flame,
  ClipboardList,
  Inbox,
  CheckSquare,
  Briefcase,
  Users as UsersIcon,
  Building2,
  Columns3,
  // 人アイコン
  UserRound,
} from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────

export type FeatureScopeId =
  | 'team_faq'
  | 'first_party'
  | 'dev_priority'
  | 'action_board'
  | 'tickets'
  | 'tasks'
  | 'deals'
  | 'contacts'
  | 'companies'
  | 'pipeline'

export type PersonScopeId =
  | 'dev-taro'
  | 'sales-hanako'
  | 'mkt-jiro'
  | 'is-saburo'
  | 'cs-shiro'

/**
 * 検索スコープ（多選択）。
 * - features: 参照する機能(データソース)の集合
 * - persons : 参照する担当者の集合
 * - includeExternal: Web 等の外部情報を併用するかどうか
 */
export interface AssigneeScopeValue {
  features: Set<FeatureScopeId>
  persons: Set<PersonScopeId>
  includeExternal: boolean
}

interface FeatureMeta {
  id: FeatureScopeId
  name: string
  icon: React.ElementType
  tint: string
}

interface PersonMeta {
  id: PersonScopeId
  name: string
}

const FEATURES: FeatureMeta[] = [
  { id: 'team_faq',     name: 'チームFAQ',       icon: BookOpen,      tint: 'var(--color-obs-middle)' },
  { id: 'first_party',  name: 'ファーストパーティ', icon: Activity,      tint: 'var(--color-obs-low)' },
  { id: 'dev_priority', name: '開発優先度',       icon: Flame,         tint: 'var(--color-obs-hot)' },
  { id: 'action_board', name: 'アクションボード',  icon: ClipboardList, tint: 'var(--color-obs-primary)' },
  { id: 'tickets',      name: 'チケット',         icon: Inbox,         tint: 'var(--color-obs-low)' },
  { id: 'tasks',        name: 'タスク一覧',       icon: CheckSquare,   tint: 'var(--color-obs-primary)' },
  { id: 'deals',        name: '取引',            icon: Briefcase,     tint: 'var(--color-obs-middle)' },
  { id: 'contacts',     name: 'コンタクト',       icon: UsersIcon,     tint: 'var(--color-obs-primary)' },
  { id: 'companies',    name: '企業',            icon: Building2,     tint: 'var(--color-obs-low)' },
  { id: 'pipeline',     name: 'パイプライン',     icon: Columns3,      tint: 'var(--color-obs-primary)' },
]

const PERSONS: PersonMeta[] = [
  { id: 'dev-taro',     name: '開発 太郎' },
  { id: 'sales-hanako', name: '営業 花子' },
  { id: 'mkt-jiro',     name: 'マーケ 次郎' },
  { id: 'is-saburo',    name: 'IS 三郎' },
  { id: 'cs-shiro',     name: 'CS 四郎' },
]

const ALL_FEATURE_IDS = FEATURES.map((f) => f.id)
const ALL_PERSON_IDS = PERSONS.map((p) => p.id)

export const DEFAULT_SCOPE: AssigneeScopeValue = {
  features: new Set<FeatureScopeId>(ALL_FEATURE_IDS),
  persons:  new Set<PersonScopeId>(ALL_PERSON_IDS),
  includeExternal: false,
}

interface AssigneeFilterProps {
  /** 選択中のスコープ。未指定時は内部 state(両セクション全て選択 / 外部情報なし)で管理 */
  value?: AssigneeScopeValue
  /** 選択変更時のコールバック */
  onChange?: (next: AssigneeScopeValue) => void
}

// ─── Component ────────────────────────────────────────────────────────────

export function AssigneeFilter({ value, onChange }: AssigneeFilterProps = {}) {
  const [internal, setInternal] = useState<AssigneeScopeValue>(() => ({
    features: new Set(DEFAULT_SCOPE.features),
    persons:  new Set(DEFAULT_SCOPE.persons),
    includeExternal: DEFAULT_SCOPE.includeExternal,
  }))
  const current = value ?? internal

  const update = (next: AssigneeScopeValue) => {
    if (value === undefined) setInternal(next)
    onChange?.(next)
  }

  return (
    <div className="inline-flex items-center gap-1">
      {/* 機能スコープ */}
      <FeatureMultiSelect
        selected={current.features}
        onChange={(features) => update({ ...current, features })}
      />
      {/* 人スコープ */}
      <PersonMultiSelect
        selected={current.persons}
        onChange={(persons) => update({ ...current, persons })}
      />
      {/* 外部情報トグル */}
      <ExternalToggle
        on={current.includeExternal}
        onChange={(includeExternal) => update({ ...current, includeExternal })}
      />
    </div>
  )
}

// ─── 機能ドロップダウン ────────────────────────────────────────────────────

function FeatureMultiSelect({
  selected, onChange,
}: { selected: Set<FeatureScopeId>; onChange: (next: Set<FeatureScopeId>) => void }) {
  const [open, setOpen] = useState(false)
  const wrapRef = useRef<HTMLDivElement | null>(null)
  useOutsideClick(wrapRef, () => setOpen(false), open)

  const isAll = selected.size === ALL_FEATURE_IDS.length
  const label = isAll
    ? '機能 全て'
    : selected.size === 0
      ? '機能 なし'
      : `機能 ${selected.size}/${ALL_FEATURE_IDS.length}`

  const toggle = (id: FeatureScopeId) => {
    const next = new Set(selected)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    onChange(next)
  }

  return (
    <div ref={wrapRef} className="relative">
      <ChipButton
        active={!isAll}
        onClick={() => setOpen((v) => !v)}
        icon={<Layers size={12} style={{ color: isAll ? 'var(--color-obs-primary)' : 'var(--color-obs-middle)' }} />}
        title="参照する機能を選択"
      >
        {label}
      </ChipButton>
      {open && (
        <DropdownPanel width={280}>
          <SectionHeader
            label="機能"
            allOn={isAll}
            count={selected.size}
            total={ALL_FEATURE_IDS.length}
            onToggleAll={() =>
              onChange(isAll ? new Set<FeatureScopeId>() : new Set<FeatureScopeId>(ALL_FEATURE_IDS))
            }
          />
          {FEATURES.map((f) => {
            const Icon = f.icon
            return (
              <ScopeRow
                key={f.id}
                checked={selected.has(f.id)}
                onClick={() => toggle(f.id)}
                icon={<Icon size={12} style={{ color: f.tint }} className="shrink-0" />}
                name={f.name}
              />
            )
          })}
        </DropdownPanel>
      )}
    </div>
  )
}

// ─── 人ドロップダウン ─────────────────────────────────────────────────────

function PersonMultiSelect({
  selected, onChange,
}: { selected: Set<PersonScopeId>; onChange: (next: Set<PersonScopeId>) => void }) {
  const [open, setOpen] = useState(false)
  const wrapRef = useRef<HTMLDivElement | null>(null)
  useOutsideClick(wrapRef, () => setOpen(false), open)

  const isAll = selected.size === ALL_PERSON_IDS.length
  const label = isAll
    ? '人 全て'
    : selected.size === 0
      ? '人 なし'
      : `人 ${selected.size}/${ALL_PERSON_IDS.length}`

  const toggle = (id: PersonScopeId) => {
    const next = new Set(selected)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    onChange(next)
  }

  return (
    <div ref={wrapRef} className="relative">
      <ChipButton
        active={!isAll}
        onClick={() => setOpen((v) => !v)}
        icon={<UserRound size={12} style={{ color: isAll ? 'var(--color-obs-primary)' : 'var(--color-obs-middle)' }} />}
        title="参照する担当者を選択"
      >
        {label}
      </ChipButton>
      {open && (
        <DropdownPanel width={220}>
          <SectionHeader
            label="人"
            allOn={isAll}
            count={selected.size}
            total={ALL_PERSON_IDS.length}
            onToggleAll={() =>
              onChange(isAll ? new Set<PersonScopeId>() : new Set<PersonScopeId>(ALL_PERSON_IDS))
            }
          />
          {PERSONS.map((p) => (
            <ScopeRow
              key={p.id}
              checked={selected.has(p.id)}
              onClick={() => toggle(p.id)}
              icon={<UserRound size={12} style={{ color: 'var(--color-obs-text-subtle)' }} className="shrink-0" />}
              name={p.name}
            />
          ))}
        </DropdownPanel>
      )}
    </div>
  )
}

// ─── 外部情報トグル ───────────────────────────────────────────────────────

function ExternalToggle({
  on, onChange,
}: { on: boolean; onChange: (next: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!on)}
      className="inline-flex items-center gap-1.5 h-8 px-3 rounded-full text-[12px] font-medium transition-colors duration-150"
      style={{
        backgroundColor: on ? 'rgba(126,198,255,0.14)' : 'var(--color-obs-surface-highest)',
        color: on ? 'var(--color-obs-low)' : 'var(--color-obs-text-muted)',
        boxShadow: on ? 'inset 0 0 0 1px rgba(126,198,255,0.42)' : undefined,
      }}
      title={on ? 'Web等の外部情報を併用中(クリックでOFF)' : '外部情報をONにする'}
    >
      <Globe size={12} />
      外部 {on ? 'ON' : 'OFF'}
    </button>
  )
}

// ─── 共通 UI パーツ ───────────────────────────────────────────────────────

function ChipButton({
  active, onClick, icon, title, children,
}: {
  active: boolean
  onClick: () => void
  icon: React.ReactNode
  title?: string
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className="inline-flex items-center gap-1.5 h-8 px-3 rounded-full text-[12px] font-medium transition-colors duration-150"
      style={{
        backgroundColor: active ? 'rgba(255,184,107,0.10)' : 'var(--color-obs-surface-highest)',
        color: 'var(--color-obs-text)',
        boxShadow: active ? 'inset 0 0 0 1px rgba(255,184,107,0.42)' : undefined,
      }}
    >
      {icon}
      {children}
    </button>
  )
}

function DropdownPanel({
  width, children,
}: { width: number; children: React.ReactNode }) {
  return (
    <div
      className="absolute bottom-full left-0 mb-2 rounded-[var(--radius-obs-md)] py-1 z-50 max-h-[420px] overflow-auto"
      style={{
        width,
        backgroundColor: 'var(--color-obs-surface-highest)',
        boxShadow:
          '0 10px 30px rgba(0,0,0,0.45), inset 0 0 0 1px rgba(109,106,111,0.14)',
      }}
    >
      {children}
    </div>
  )
}

function SectionHeader({
  label, allOn, onToggleAll, count, total,
}: {
  label: string; allOn: boolean; onToggleAll: () => void; count: number; total: number
}) {
  return (
    <div
      className="flex items-center justify-between px-3 pt-2 pb-1"
      style={{ color: 'var(--color-obs-text-subtle)' }}
    >
      <span className="text-[10px] font-semibold tracking-[0.06em] uppercase">
        {label}
        <span className="ml-1.5 tabular-nums" style={{ opacity: 0.7 }}>
          {count}/{total}
        </span>
      </span>
      <button
        type="button"
        onClick={onToggleAll}
        className="text-[10.5px] font-semibold px-1.5 py-0.5 rounded-[4px] transition-colors"
        style={{
          color: allOn ? 'var(--color-obs-primary)' : 'var(--color-obs-text-muted)',
          backgroundColor: allOn ? 'rgba(171,199,255,0.12)' : 'transparent',
        }}
        onMouseOver={(e) => {
          if (!allOn) (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--color-obs-surface-low)'
        }}
        onMouseOut={(e) => {
          if (!allOn) (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent'
        }}
      >
        {allOn ? '全てON' : '全て選択'}
      </button>
    </div>
  )
}

function ScopeRow({
  checked, onClick, icon, name,
}: {
  checked: boolean; onClick: () => void; icon: React.ReactNode; name: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-[calc(100%-8px)] mx-1 flex items-center gap-2 px-3 py-[7px] rounded-[6px] text-left transition-colors duration-100"
      style={{
        color: 'var(--color-obs-text)',
        fontWeight: checked ? 600 : 500,
        backgroundColor: 'transparent',
      }}
      onMouseOver={(e) => {
        ;(e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--color-obs-surface-low)'
      }}
      onMouseOut={(e) => {
        ;(e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent'
      }}
    >
      <span
        className="inline-flex items-center justify-center w-4 h-4 rounded-[4px] shrink-0"
        style={{
          backgroundColor: checked ? 'var(--color-obs-primary)' : 'transparent',
          boxShadow: checked
            ? 'inset 0 0 0 1px var(--color-obs-primary)'
            : 'inset 0 0 0 1px rgba(109,106,111,0.32)',
        }}
      >
        {checked && <Check size={11} strokeWidth={3} style={{ color: 'var(--color-obs-on-primary)' }} />}
      </span>
      {icon}
      <span className="text-[13px] tracking-[-0.01em] flex-1">{name}</span>
    </button>
  )
}

// ─── Hooks ────────────────────────────────────────────────────────────────

function useOutsideClick(
  ref: React.RefObject<HTMLElement | null>,
  handler: () => void,
  enabled: boolean,
) {
  useEffect(() => {
    if (!enabled) return
    const onDocClick = (e: MouseEvent) => {
      if (!ref.current) return
      if (!ref.current.contains(e.target as Node)) handler()
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [ref, handler, enabled])
}
