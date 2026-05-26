'use client'

import { useEffect, useRef, useState } from 'react'
import {
  Layers,
  Globe,
  Check,
  // 人アイコン
  UserRound,
} from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────

// 機能スコープ = 5 体のエージェント (Sales / Marketing / Support / Helpdesk / PDM)
export type FeatureScopeId =
  | 'sales'
  | 'marketing'
  | 'support'
  | 'helpdesk'
  | 'pdm'

export type PersonScopeId = string

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
  /** エージェント名 (例: "Sales Agent") */
  name: string
  /** 1文字イニシャル — サイドバーバッジと同じ規則 */
  initial: string
  /** バッジ色 (atoms.tsx の AGENTS と一致) */
  color: string
  /** 役割の補足説明 (ドロップダウンで2行目に表示) */
  description: string
}

interface PersonMeta {
  id: PersonScopeId
  name: string
  /** 役職・役割の補足 */
  role: string
}

// サイドバー / atoms.tsx の AGENTS と同じ色 + 1文字イニシャル
const FEATURES: FeatureMeta[] = [
  { id: 'sales',     name: 'Sales Agent',     initial: 'S', color: '#abc7ff', description: '商談・取引・コンタクト' },
  { id: 'marketing', name: 'Marketing Agent', initial: 'M', color: '#ffcf4a', description: 'メール配信・インテント' },
  { id: 'support',   name: 'Customer Agent',  initial: 'C', color: '#ff8dcf', description: '問い合わせ・チケット' },
  { id: 'pdm',       name: 'Product Agent',   initial: 'P', color: '#8dffc9', description: '顧客の声・要望集計' },
  { id: 'helpdesk',  name: 'Knowledge Agent', initial: 'K', color: '#c8b9ff', description: 'ナレッジ・社内Q&A' },
]

// Phase 1: モック。将来的にはワークスペースのメンバー一覧から取得する。
const PERSONS: PersonMeta[] = [
  { id: 'dev-taro',     name: '開発 太郎', role: 'プロダクト開発' },
  { id: 'sales-hanako', name: '営業 花子', role: 'エンタープライズ営業' },
  { id: 'mkt-jiro',     name: 'マーケ 次郎', role: 'マーケティング' },
  { id: 'is-saburo',    name: 'IS 三郎',   role: 'インサイドセールス' },
  { id: 'cs-shiro',     name: 'CS 四郎',   role: 'カスタマーサクセス' },
]

const ALL_FEATURE_IDS = FEATURES.map((f) => f.id)
const ALL_PERSON_IDS = PERSONS.map((p) => p.id)

export const DEFAULT_SCOPE: AssigneeScopeValue = {
  features: new Set<FeatureScopeId>(ALL_FEATURE_IDS),
  persons: new Set<PersonScopeId>(ALL_PERSON_IDS),
  // デフォルトで外部情報 (Web 検索など) を ON にし、社内データ + 外部リサーチを
  // 横断した回答を返す体験を初期状態とする
  includeExternal: true,
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
    persons: new Set(DEFAULT_SCOPE.persons),
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
  selected,
  onChange,
}: {
  selected: Set<FeatureScopeId>
  onChange: (next: Set<FeatureScopeId>) => void
}) {
  const [open, setOpen] = useState(false)
  const wrapRef = useRef<HTMLDivElement | null>(null)
  useOutsideClick(wrapRef, () => setOpen(false), open)

  const isAll = selected.size === ALL_FEATURE_IDS.length
  const label = isAll
    ? '5 AGENTS'
    : selected.size === 0
      ? 'Agent なし'
      : `${selected.size}/${ALL_FEATURE_IDS.length} AGENTS`

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
        icon={
          <Layers
            size={12}
            style={{ color: isAll ? 'var(--color-obs-primary)' : 'var(--color-obs-middle)' }}
          />
        }
        title="参照する機能を選択"
      >
        {label}
      </ChipButton>
      {open && (
        <DropdownPanel width={260}>
          <SectionHeader
            label="機能"
            allOn={isAll}
            count={selected.size}
            total={ALL_FEATURE_IDS.length}
            onToggleAll={() =>
              onChange(isAll ? new Set<FeatureScopeId>() : new Set<FeatureScopeId>(ALL_FEATURE_IDS))
            }
          />
          {FEATURES.map((f) => (
            <ScopeRow
              key={f.id}
              checked={selected.has(f.id)}
              onClick={() => toggle(f.id)}
              badge={{ initial: f.initial, color: f.color }}
              name={f.name}
              description={f.description}
            />
          ))}
        </DropdownPanel>
      )}
    </div>
  )
}

// ─── 人ドロップダウン ─────────────────────────────────────────────────────

function PersonMultiSelect({
  selected,
  onChange,
}: {
  selected: Set<PersonScopeId>
  onChange: (next: Set<PersonScopeId>) => void
}) {
  const [open, setOpen] = useState(false)
  const wrapRef = useRef<HTMLDivElement | null>(null)
  useOutsideClick(wrapRef, () => setOpen(false), open)

  const isAll = selected.size === ALL_PERSON_IDS.length
  const label =
    ALL_PERSON_IDS.length === 0
      ? '人 未設定'
      : isAll
        ? '人'
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
        icon={
          <UserRound
            size={12}
            style={{ color: isAll ? 'var(--color-obs-primary)' : 'var(--color-obs-middle)' }}
          />
        }
        title="参照する担当者を選択"
      >
        {label}
      </ChipButton>
      {open && (
        <DropdownPanel width={260}>
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
            <CheckboxRow
              key={p.id}
              checked={selected.has(p.id)}
              onClick={() => toggle(p.id)}
              name={p.name}
              role={p.role}
            />
          ))}
        </DropdownPanel>
      )}
    </div>
  )
}

// ─── 外部情報トグル ───────────────────────────────────────────────────────

function ExternalToggle({ on, onChange }: { on: boolean; onChange: (next: boolean) => void }) {
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
      title={on ? '企業DB(290万社) + Web 外部情報を併用中(クリックでOFF)' : '外部情報をONにする'}
    >
      <Globe size={12} />
      {on ? '外部 ON' : '外部 OFF'}
    </button>
  )
}

// ─── 共通 UI パーツ ───────────────────────────────────────────────────────

function ChipButton({
  active,
  onClick,
  icon,
  title,
  children,
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

function DropdownPanel({ width, children }: { width: number; children: React.ReactNode }) {
  return (
    <div
      className="absolute bottom-full left-0 mb-2 rounded-[var(--radius-obs-lg)] py-2 z-50 max-h-[420px] overflow-auto"
      style={{
        width,
        backgroundColor: 'var(--color-obs-surface-high)',
        border: '1px solid var(--color-obs-border)',
        boxShadow: '0 10px 30px rgba(0,0,0,0.4)',
      }}
    >
      {children}
    </div>
  )
}

function SectionHeader({
  label,
  allOn,
  onToggleAll,
  count,
  total,
}: {
  label: string
  allOn: boolean
  onToggleAll: () => void
  count: number
  total: number
}) {
  return (
    <div
      className="flex items-center justify-between px-3 pb-1.5"
      style={{ color: 'var(--color-obs-text-muted)' }}
    >
      <span className="text-[10px] font-medium tracking-[0.1em] uppercase">
        {label}
        <span className="ml-1.5 tabular-nums" style={{ opacity: 0.7 }}>
          {count}/{total}
        </span>
      </span>
      <button
        type="button"
        onClick={onToggleAll}
        className="text-[10.5px] font-medium tracking-[0.04em] transition-colors duration-150"
        style={{
          color: allOn ? 'var(--color-obs-primary)' : 'var(--color-obs-text-subtle)',
        }}
        onMouseOver={(e) => {
          ;(e.currentTarget as HTMLButtonElement).style.color = 'var(--color-obs-text)'
        }}
        onMouseOut={(e) => {
          ;(e.currentTarget as HTMLButtonElement).style.color = allOn
            ? 'var(--color-obs-primary)'
            : 'var(--color-obs-text-subtle)'
        }}
      >
        {allOn ? '全てOFF' : '全てON'}
      </button>
    </div>
  )
}

function ScopeRow({
  checked,
  onClick,
  badge,
  name,
  description,
}: {
  checked: boolean
  onClick: () => void
  /** イニシャル+カラー。先頭のオーブとして使う */
  badge: { initial: string; color: string }
  name: string
  description?: string
}) {
  const { color } = badge
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center gap-2 px-3 py-2 text-left transition-colors duration-150"
      style={{ color: 'var(--color-obs-text)' }}
      onMouseOver={(e) => {
        ;(e.currentTarget as HTMLButtonElement).style.backgroundColor =
          'var(--color-obs-surface-highest)'
      }}
      onMouseOut={(e) => {
        ;(e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent'
      }}
      title={checked ? `${name} を除外する` : `${name} を含める`}
    >
      {/* 先頭オーブ(エージェントカラー) — 選択時は発光、未選択時は無発光で淡く */}
      <span
        className="inline-flex items-center justify-center w-[16px] h-[16px] shrink-0"
        aria-hidden
      >
        <span
          className="inline-block rounded-full transition-all duration-200"
          style={{
            width: 9,
            height: 9,
            background: checked
              ? `radial-gradient(circle at 30% 30%, #ffffff 0%, ${color} 35%, ${color}80 80%)`
              : `${color}24`,
            boxShadow: checked ? `0 0 8px ${color}aa, 0 0 16px ${color}55` : 'none',
            opacity: checked ? 1 : 0.5,
          }}
        />
      </span>
      <div className="flex-1 min-w-0">
        <div className="text-[13px] font-medium leading-tight">{name}</div>
        {description && (
          <div
            className="text-[11.5px] leading-tight mt-0.5"
            style={{ color: 'var(--color-obs-text-muted)' }}
          >
            {description}
          </div>
        )}
      </div>
      {checked && <Check size={14} style={{ color: 'var(--color-obs-primary)' }} />}
    </button>
  )
}

// ─── CheckboxRow: 人 用。ModelSelector と同じく アイコン + 名前/役職 + 右側 Check ────
function CheckboxRow({
  checked,
  onClick,
  name,
  role,
}: {
  checked: boolean
  onClick: () => void
  name: string
  role?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center gap-2 px-3 py-2 text-left transition-colors duration-150"
      style={{ color: 'var(--color-obs-text)' }}
      onMouseOver={(e) => {
        ;(e.currentTarget as HTMLButtonElement).style.backgroundColor =
          'var(--color-obs-surface-highest)'
      }}
      onMouseOut={(e) => {
        ;(e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent'
      }}
      title={checked ? `${name} を除外する` : `${name} を含める`}
    >
      <UserRound
        size={13}
        style={{
          color: checked ? 'var(--color-obs-primary)' : 'var(--color-obs-text-muted)',
        }}
      />
      <div className="flex-1 min-w-0">
        <div className="text-[13px] font-medium leading-tight">{name}</div>
        {role && (
          <div
            className="text-[11.5px] leading-tight mt-0.5"
            style={{ color: 'var(--color-obs-text-muted)' }}
          >
            {role}
          </div>
        )}
      </div>
      {checked && <Check size={14} style={{ color: 'var(--color-obs-primary)' }} />}
    </button>
  )
}

// ─── Hooks ────────────────────────────────────────────────────────────────

function useOutsideClick(
  ref: React.RefObject<HTMLElement | null>,
  handler: () => void,
  enabled: boolean
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
