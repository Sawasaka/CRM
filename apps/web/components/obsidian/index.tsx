/* eslint-disable react/prop-types */

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

export const OBS_PRODUCT_SURFACE = {
  pageBackground:
    'radial-gradient(circle at 42% 10%, rgba(171,199,255,0.045) 0%, transparent 34%), radial-gradient(circle at 82% 0%, rgba(0,113,227,0.026) 0%, transparent 34%), linear-gradient(180deg, rgba(18,19,22,0.96) 0%, rgba(13,14,17,0.985) 56%, rgba(10,10,12,1) 100%)',
  panel:
    'linear-gradient(145deg, rgba(27,28,32,0.66) 0%, rgba(19,20,24,0.84) 50%, rgba(12,13,16,0.94) 100%)',
  panelStrong:
    'linear-gradient(145deg, rgba(31,32,36,0.70) 0%, rgba(20,21,25,0.88) 54%, rgba(12,13,16,0.96) 100%)',
  panelSoft:
    'linear-gradient(145deg, rgba(22,23,27,0.58) 0%, rgba(14,15,18,0.86) 100%)',
  header:
    'linear-gradient(90deg, rgba(171,199,255,0.050), rgba(255,255,255,0.018), rgba(255,255,255,0.004))',
  row:
    'linear-gradient(90deg, rgba(255,255,255,0.010), rgba(171,199,255,0.012), rgba(255,255,255,0))',
  rowAlt:
    'linear-gradient(90deg, rgba(171,199,255,0.020), rgba(255,255,255,0.010), rgba(255,255,255,0))',
  rowHover:
    'linear-gradient(90deg, rgba(171,199,255,0.052), rgba(255,255,255,0.022), rgba(255,255,255,0.004))',
  inset:
    'linear-gradient(145deg, rgba(13,14,17,0.78), rgba(20,21,25,0.58))',
  rim:
    'inset 0 0 0 1px rgba(171,199,255,0.105), inset 1px 1px 0 rgba(255,255,255,0.035), 0 18px 48px rgba(0,0,0,0.30)',
  rimSoft:
    'inset 0 0 0 1px rgba(171,199,255,0.085), inset 1px 1px 0 rgba(255,255,255,0.025), 0 14px 36px rgba(0,0,0,0.24)',
  divider: 'rgba(171,199,255,0.075)',
} as const

export const OBS_PRIMARY_BUTTON = {
  background:
    'linear-gradient(140deg, var(--color-obs-primary) 0%, var(--color-obs-primary-container) 100%)',
  color: 'var(--color-obs-on-primary)',
  shadow:
    'inset 0 1px 0 rgba(255,255,255,0.22), 0 0 0 1px rgba(171,199,255,0.18), 0 0 24px rgba(171,199,255,0.32)',
  shadowStrong:
    'inset 0 1px 0 rgba(255,255,255,0.30), 0 0 0 1px rgba(171,199,255,0.24), 0 0 26px rgba(171,199,255,0.36), 0 12px 32px rgba(0,113,227,0.22)',
} as const

const SERVICE_PAGE_BACKGROUND = OBS_PRODUCT_SURFACE.pageBackground

export const OBS_HERO_CLASS = {
  shell: 'flex items-end justify-between gap-8 py-10',
  body: 'flex min-w-0 max-w-3xl flex-col gap-3',
  eyebrow:
    'inline-flex items-center gap-2 font-[family-name:var(--font-body)] text-[11px] font-semibold uppercase',
  title:
    'font-[family-name:var(--font-display)] whitespace-nowrap text-[2rem] font-bold leading-[1.08] tracking-normal sm:text-[2.75rem] md:text-[3.55rem]',
  caption: 'max-w-full overflow-hidden text-ellipsis whitespace-nowrap text-[14px] font-normal leading-[1.7]',
} as const

export const OBS_HERO_STYLE = {
  eyebrow: { color: 'var(--color-aurora)' },
  dot: {
    background: 'var(--color-aurora)',
    boxShadow: '0 0 10px var(--color-aurora)',
  },
  titleBase: { color: 'var(--color-obs-text)' },
  caption: { color: 'var(--color-obs-text-muted)' },
} satisfies Record<string, React.CSSProperties>

// ─── Page Shell ────────────────────────────────────────────────────────────────
export function ObsPageShell({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={cx('min-h-[calc(100vh-56px)] font-[family-name:var(--font-body)]', className)}
      style={{
        backgroundColor: '#0f1013',
        backgroundImage: SERVICE_PAGE_BACKGROUND,
        color: 'var(--color-obs-text)',
      }}
    >
      {children}
    </div>
  )
}

// ─── Hero / Editorial Anchor ──────────────────────────────────────────────────
export function ObsHero({
  eyebrow,
  title,
  titleAccent,
  caption,
  action,
}: {
  eyebrow?: string
  title: string
  titleAccent?: string
  caption?: React.ReactNode
  action?: React.ReactNode
}) {
  const hasTitleAccent = Boolean(titleAccent && title.endsWith(titleAccent))
  const titleBase = hasTitleAccent ? title.slice(0, title.length - titleAccent!.length) : title

  return (
    <div className={OBS_HERO_CLASS.shell}>
      <div className={OBS_HERO_CLASS.body}>
        {eyebrow && (
          <span
            className={OBS_HERO_CLASS.eyebrow}
            style={OBS_HERO_STYLE.eyebrow}
          >
            <span
              className="block w-1.5 h-1.5 rounded-full"
              style={OBS_HERO_STYLE.dot}
              aria-hidden
            />
            {eyebrow}
          </span>
        )}
        <h1
          className={OBS_HERO_CLASS.title}
        >
          <span style={OBS_HERO_STYLE.titleBase}>{titleBase}</span>
          {hasTitleAccent && (
            <span className="fo-gradient-text" style={{ WebkitTextFillColor: 'transparent' }}>
              {titleAccent}
            </span>
          )}
        </h1>
        {caption && (
          <p className={OBS_HERO_CLASS.caption} style={OBS_HERO_STYLE.caption}>
            {caption}
          </p>
        )}
      </div>
      {action && <div className="shrink-0 self-end">{action}</div>}
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
  style,
}: {
  depth?: 'low' | 'high' | 'highest'
  padding?: 'none' | 'sm' | 'md' | 'lg'
  radius?: 'md' | 'lg' | 'xl' | '2xl'
  children: React.ReactNode
  className?: string
  onClick?: () => void
  style?: React.CSSProperties
}) {
  // Photon Drift: translucent surface + Aurora rim. ガラス感は backdrop-blur で表現。
  const bg =
    depth === 'low' ? 'rgba(18,19,23,0.68)' :
    depth === 'highest' ? 'rgba(14,15,18,0.84)' :
    'rgba(24,25,29,0.62)'
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
        'fo-glass-rim',
        onClick && 'cursor-pointer transition-colors duration-200',
        className,
      )}
      style={{
        backgroundColor: bg,
        backdropFilter: 'blur(28px) saturate(140%)',
        WebkitBackdropFilter: 'blur(28px) saturate(140%)',
        transitionTimingFunction: 'var(--ease-liquid)',
        ...style,
      }}
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
          background: OBS_PRIMARY_BUTTON.background,
          color: OBS_PRIMARY_BUTTON.color,
          transitionTimingFunction: 'var(--ease-liquid)',
          boxShadow: OBS_PRIMARY_BUTTON.shadow,
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
      backgroundColor: 'rgba(24,25,29,0.58)',
      color: 'var(--color-obs-on-secondary)',
      boxShadow: 'inset 0 0 0 1px rgba(171,199,255,0.10)',
    },
    hot: {
      backgroundColor: 'rgba(255,107,107,0.14)',
      color: 'var(--color-obs-hot)',
      boxShadow: 'inset 0 0 0 1px rgba(255,107,107,0.28)',
    },
    middle: {
      backgroundColor: 'rgba(255,184,107,0.14)',
      color: 'var(--color-obs-middle)',
      boxShadow: 'inset 0 0 0 1px rgba(255,184,107,0.28)',
    },
    low: {
      backgroundColor: 'rgba(126,198,255,0.14)',
      color: 'var(--color-obs-low)',
      boxShadow: 'inset 0 0 0 1px rgba(126,198,255,0.28)',
    },
    primary: {
      backgroundColor: 'rgba(171,199,255,0.12)',
      color: 'var(--color-obs-primary)',
      boxShadow: 'inset 0 0 0 1px rgba(171,199,255,0.32)',
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
          className="fo-gradient-text-soft font-[family-name:var(--font-display)] text-lg font-semibold tracking-[-0.02em]"
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
      className={cx('rounded-[var(--radius-obs-xl)] fo-glass-rim', className)}
      style={{
        backgroundColor: 'rgba(20,21,25,0.68)',
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
        'fo-glass-rim',
        className,
      )}
      style={{
        backgroundColor: 'rgba(20,21,25,0.68)',
        backdropFilter: 'blur(8px)',
        color: 'var(--color-obs-text)',
      }}
    />
  )
})
