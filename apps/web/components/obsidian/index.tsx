/**
 * Liquid Obsidian — 共通コンポーネント
 * 参照: bgm/docs/DESIGN.md
 *
 * 原則:
 * - No borders（1px solidは使わない、surface shift で境界）
 * - 4層 nesting（lowest < surface < low < high < highest）
 * - glassmorphism は backdrop-blur + surface-highest/60
 * - primary は chromatic gradient（abc7ff → 0071e3）
 */
import * as React from 'react'

// ブランド & ゲーミフィケーション（ObsLogo, ObsLevelBadge, ObsXpRing, ObsStreak, ObsAchievement, ObsCountBadge）
export * from './brand'

// ─── utils ────────────────────────────────────────────────────────────────────
function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ')
}

// ─── Page Shell ────────────────────────────────────────────────────────────────
export function ObsPageShell({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={cx('min-h-full font-[family-name:var(--font-body)]', className)}
      style={{ backgroundColor: 'var(--color-obs-surface)', color: 'var(--color-obs-text)' }}
    >
      {children}
    </div>
  )
}

// ─── Hero / Editorial Anchor ──────────────────────────────────────────────────
export function ObsHero({
  eyebrow,
  title,
  caption,
  action,
}: {
  eyebrow?: string
  title: string
  caption?: React.ReactNode
  action?: React.ReactNode
}) {
  return (
    <div className="flex items-end justify-between gap-8 py-10">
      <div className="flex flex-col gap-3 max-w-3xl">
        {eyebrow && (
          <span
            className="font-[family-name:var(--font-body)] text-xs font-medium tracking-[0.14em] uppercase"
            style={{ color: 'var(--color-obs-text-subtle)' }}
          >
            {eyebrow}
          </span>
        )}
        <h1
          className="font-[family-name:var(--font-display)] text-[clamp(2rem,4vw,3.25rem)] font-bold leading-[1.05] tracking-[-0.028em]"
          style={{
            background: 'linear-gradient(180deg, var(--color-obs-text) 0%, var(--color-obs-text-muted) 140%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          {title}
        </h1>
        {caption && (
          <p className="text-base font-normal leading-relaxed max-w-2xl" style={{ color: 'var(--color-obs-text-muted)' }}>
            {caption}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}

// ─── Surface Card (nested depth) ──────────────────────────────────────────────
export function ObsCard({
  depth = 'high',
  padding = 'md',
  radius = 'xl',
  children,
  className,
  onClick,
}: {
  depth?: 'low' | 'high' | 'highest'
  padding?: 'none' | 'sm' | 'md' | 'lg'
  radius?: 'md' | 'lg' | 'xl' | '2xl'
  children: React.ReactNode
  className?: string
  onClick?: () => void
}) {
  const bg =
    depth === 'low' ? 'var(--color-obs-surface-low)' :
    depth === 'highest' ? 'var(--color-obs-surface-highest)' :
    'var(--color-obs-surface-high)'
  const pad =
    padding === 'none' ? '' :
    padding === 'sm' ? 'p-4' :
    padding === 'lg' ? 'p-8' :
    'p-6'
  const rad =
    radius === 'md' ? 'rounded-[var(--radius-obs-md)]' :
    radius === 'lg' ? 'rounded-[var(--radius-obs-lg)]' :
    radius === '2xl' ? 'rounded-[var(--radius-obs-2xl)]' :
    'rounded-[var(--radius-obs-xl)]'

  return (
    <div
      onClick={onClick}
      className={cx(
        rad,
        pad,
        onClick && 'cursor-pointer transition-colors duration-200',
        className,
      )}
      style={{ backgroundColor: bg, transitionTimingFunction: 'var(--ease-liquid)' }}
    >
      {children}
    </div>
  )
}

// ─── Primary Button（chromatic） ──────────────────────────────────────────────
export function ObsButton({
  variant = 'primary',
  size = 'md',
  children,
  onClick,
  type,
  disabled,
  className,
}: {
  variant?: 'primary' | 'ghost' | 'tertiary'
  size?: 'sm' | 'md' | 'lg'
  children: React.ReactNode
  onClick?: () => void
  type?: 'button' | 'submit'
  disabled?: boolean
  className?: string
}) {
  const sz =
    size === 'sm' ? 'h-8 px-3 text-xs' :
    size === 'lg' ? 'h-11 px-6 text-sm' :
    'h-9 px-4 text-sm'

  if (variant === 'primary') {
    return (
      <button
        type={type ?? 'button'}
        onClick={onClick}
        disabled={disabled}
        className={cx(
          sz,
          'rounded-[var(--radius-obs-md)] font-medium tracking-[-0.01em] relative overflow-hidden',
          'transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed',
          className,
        )}
        style={{
          background: 'linear-gradient(140deg, var(--color-obs-primary) 0%, var(--color-obs-primary-container) 100%)',
          color: 'var(--color-obs-on-primary)',
          transitionTimingFunction: 'var(--ease-liquid)',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.18), 0 0 0 1px rgba(171,199,255,0.08)',
        }}
      >
        {children}
      </button>
    )
  }

  if (variant === 'tertiary') {
    return (
      <button
        type={type ?? 'button'}
        onClick={onClick}
        disabled={disabled}
        className={cx(sz, 'rounded-[var(--radius-obs-md)] font-medium', 'transition-colors duration-150', className)}
        style={{ color: 'var(--color-obs-primary)' }}
      >
        {children}
      </button>
    )
  }

  // ghost
  return (
    <button
      type={type ?? 'button'}
      onClick={onClick}
      disabled={disabled}
      className={cx(
        sz,
        'rounded-[var(--radius-obs-md)] font-medium',
        'transition-colors duration-150 hover:bg-[var(--color-obs-surface-high)]',
        className,
      )}
      style={{ color: 'var(--color-obs-text-muted)' }}
    >
      {children}
    </button>
  )
}

// ─── Chip ─────────────────────────────────────────────────────────────────────
export function ObsChip({
  children,
  tone = 'neutral',
  className,
}: {
  children: React.ReactNode
  tone?: 'neutral' | 'hot' | 'middle' | 'low' | 'primary'
  className?: string
}) {
  const toneStyle: Record<string, React.CSSProperties> = {
    neutral: {
      backgroundColor: 'var(--color-obs-secondary-container)',
      color: 'var(--color-obs-on-secondary)',
    },
    hot: {
      backgroundColor: 'rgba(255,107,107,0.14)',
      color: 'var(--color-obs-hot)',
    },
    middle: {
      backgroundColor: 'rgba(255,184,107,0.14)',
      color: 'var(--color-obs-middle)',
    },
    low: {
      backgroundColor: 'rgba(126,198,255,0.14)',
      color: 'var(--color-obs-low)',
    },
    primary: {
      backgroundColor: 'rgba(171,199,255,0.12)',
      color: 'var(--color-obs-primary)',
    },
  }
  return (
    <span
      className={cx('inline-flex items-center gap-1 px-2.5 h-6 rounded-full text-[11px] font-medium tracking-[-0.005em]', className)}
      style={toneStyle[tone]}
    >
      {children}
    </span>
  )
}

// ─── Section Header (for inside cards) ────────────────────────────────────────
export function ObsSectionHeader({
  title,
  caption,
  action,
}: {
  title: string
  caption?: string
  action?: React.ReactNode
}) {
  return (
    <div className="flex items-end justify-between gap-6 mb-5">
      <div className="flex flex-col gap-1">
        <h3
          className="font-[family-name:var(--font-display)] text-lg font-semibold tracking-[-0.02em]"
          style={{ color: 'var(--color-obs-text)' }}
        >
          {title}
        </h3>
        {caption && (
          <p className="text-xs" style={{ color: 'var(--color-obs-text-subtle)' }}>
            {caption}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}

// ─── Definition List (key-value pairs) ────────────────────────────────────────
export function ObsDefList({
  items,
  columns = 2,
}: {
  items: Array<{ label: string; value: React.ReactNode }>
  columns?: 1 | 2 | 3
}) {
  const gridCols =
    columns === 1 ? 'grid-cols-1' :
    columns === 3 ? 'grid-cols-1 md:grid-cols-3' :
    'grid-cols-1 md:grid-cols-2'
  return (
    <dl className={cx('grid gap-x-8 gap-y-5', gridCols)}>
      {items.map((item, i) => (
        <div key={i} className="flex flex-col gap-1">
          <dt
            className="text-[11px] font-medium tracking-[0.08em] uppercase"
            style={{ color: 'var(--color-obs-text-subtle)' }}
          >
            {item.label}
          </dt>
          <dd className="text-sm leading-relaxed" style={{ color: 'var(--color-obs-text)' }}>
            {item.value}
          </dd>
        </div>
      ))}
    </dl>
  )
}

// ─── Glass Overlay (nav / modal 用) ───────────────────────────────────────────
export function ObsGlass({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cx('rounded-[var(--radius-obs-xl)]', className)}
      style={{
        backgroundColor: 'rgba(53,52,55,0.6)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
      }}
    >
      {children}
    </div>
  )
}

// ─── Input（Ghost Border + focus glow） ───────────────────────────────────────
export const ObsInput = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(function ObsInput({ className, ...props }, ref) {
  return (
    <input
      ref={ref}
      {...props}
      className={cx(
        'w-full h-10 px-4 rounded-[var(--radius-obs-md)] text-sm',
        'transition-all duration-150 outline-none',
        'focus:ring-2 focus:ring-[var(--color-obs-primary)]/40',
        className,
      )}
      style={{
        backgroundColor: 'var(--color-obs-surface-lowest)',
        color: 'var(--color-obs-text)',
        boxShadow: 'inset 0 0 0 1px rgba(109,106,111,0.12)',
      }}
    />
  )
})
