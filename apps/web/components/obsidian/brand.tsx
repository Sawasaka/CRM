/**
 * Liquid Obsidian — Brand & Gamification Primitives
 *
 * - ObsLogo        : 多層グラデーションの"obsidian crystal"ロゴ
 * - ObsLevelBadge  : LVxx バッジ（プレイヤーレベル）
 * - ObsXpRing      : 進捗リング（SVG、 primary gradient）
 * - ObsStreak      : 連続日数の炎（静かな発光）
 * - ObsAchievement : 実績バッジ（rarity ごとに発色）
 * - ObsCountBadge  : 数値バッジ（tone可変、subtle glow）
 */
import * as React from 'react'

function cx(...p: Array<string | false | null | undefined>): string {
  return p.filter(Boolean).join(' ')
}

// ─── ObsLogo ────────────────────────────────────────────────────────────────
// サイズ・ラベルを渡せば、ロゴ単体 / ロゴ＋テキストの両方出せる
export function ObsLogo({
  size = 30,
  withLabel = false,
  labelPrimary = 'BGM',
  labelSecondary = 'Business Growth Management',
  className,
}: {
  size?: number
  withLabel?: boolean
  labelPrimary?: string
  labelSecondary?: string
  className?: string
}) {
  const s = size
  return (
    <div className={cx('flex items-center gap-3', className)}>
      {/* 結晶風マーク（3層構造） */}
      <div
        className="relative shrink-0"
        style={{ width: s, height: s }}
      >
        {/* 背景の外周グロー */}
        <div
          className="absolute inset-0 rounded-[30%]"
          style={{
            background:
              'radial-gradient(circle at 30% 20%, rgba(171,199,255,0.45) 0%, rgba(0,113,227,0.12) 40%, transparent 70%)',
            filter: 'blur(4px)',
          }}
        />
        {/* メインシェイプ */}
        <div
          className="absolute inset-0 rounded-[30%] flex items-center justify-center overflow-hidden"
          style={{
            background:
              'linear-gradient(135deg, var(--color-obs-primary) 0%, var(--color-obs-primary-container) 55%, #003d8f 100%)',
            boxShadow:
              'inset 0 1px 0 rgba(255,255,255,0.35), inset 0 -1px 0 rgba(0,0,0,0.25), 0 0 0 1px rgba(171,199,255,0.18)',
          }}
        >
          {/* 内側ハイライト（ガラス反射） */}
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(160deg, rgba(255,255,255,0.25) 0%, transparent 35%, transparent 65%, rgba(0,0,0,0.15) 100%)',
            }}
          />
          {/* ワードマーク — ルキスマCRM: 抽象的な "F" + accent dot */}
          <svg
            width={s * 0.58}
            height={s * 0.58}
            viewBox="0 0 24 24"
            fill="none"
            style={{ position: 'relative', zIndex: 1 }}
          >
            <defs>
              <linearGradient id="fo-mark" x1="0" y1="0" x2="0" y2="24" gradientUnits="userSpaceOnUse">
                <stop offset="0" stopColor="#ffffff" stopOpacity="1" />
                <stop offset="1" stopColor="#eef3ff" stopOpacity="0.88" />
              </linearGradient>
            </defs>
            <g fill="url(#fo-mark)">
              {/* F glyph（縦軸 + 上アーム + 中アーム） */}
              <path
                d="M5.4 3.6 H17.8 A1 1 0 0 1 18.8 4.6 V5.6 A1 1 0 0 1 17.8 6.6 H8.6 V10.4 H15.8 A1 1 0 0 1 16.8 11.4 V12.4 A1 1 0 0 1 15.8 13.4 H8.6 V19.4 A1 1 0 0 1 7.6 20.4 H6.4 A1 1 0 0 1 5.4 19.4 Z"
                strokeLinejoin="round"
              />
              {/* O accent dot — ルキスマCRM の "O" を示唆 */}
              <circle cx="17.6" cy="18" r="1.7" />
            </g>
          </svg>
        </div>
      </div>

      {withLabel && (
        <div className="flex flex-col leading-none">
          <span
            className="font-[family-name:var(--font-display)] text-[15px] font-semibold tracking-[-0.03em]"
            style={{ color: 'var(--color-obs-text)' }}
          >
            {labelPrimary}
          </span>
          <span
            className="text-[9px] tracking-[0.08em] uppercase font-medium mt-[3px]"
            style={{ color: 'var(--color-obs-text-subtle)' }}
          >
            {labelSecondary}
          </span>
        </div>
      )}
    </div>
  )
}

// ─── ObsLevelBadge ──────────────────────────────────────────────────────────
export function ObsLevelBadge({ level, size = 'sm' }: { level: number; size?: 'sm' | 'md' }) {
  const h = size === 'md' ? 20 : 16
  return (
    <span
      className="inline-flex items-center gap-[3px] px-1.5 rounded-[5px] font-semibold tabular-nums"
      style={{
        height: h,
        fontSize: h === 20 ? 10 : 9,
        background:
          'linear-gradient(135deg, rgba(171,199,255,0.18) 0%, rgba(0,113,227,0.22) 100%)',
        color: 'var(--color-obs-primary)',
        boxShadow: 'inset 0 0 0 1px rgba(171,199,255,0.24)',
        letterSpacing: '0.02em',
      }}
    >
      <span className="opacity-70">LV</span>
      <span>{level}</span>
    </span>
  )
}

// ─── ObsXpRing ──────────────────────────────────────────────────────────────
export function ObsXpRing({
  progress,
  size = 40,
  thickness = 3,
  children,
}: {
  progress: number // 0-1
  size?: number
  thickness?: number
  children?: React.ReactNode
}) {
  const radius = (size - thickness) / 2
  const circumference = 2 * Math.PI * radius
  const dash = circumference * Math.min(Math.max(progress, 0), 1)

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="absolute inset-0 -rotate-90">
        <defs>
          <linearGradient id="obs-xp-gradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--color-obs-primary)" />
            <stop offset="100%" stopColor="var(--color-obs-primary-container)" />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--color-obs-surface-highest)"
          strokeWidth={thickness}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#obs-xp-gradient)"
          strokeWidth={thickness}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circumference - dash}`}
          style={{
            transition: 'stroke-dasharray 500ms var(--ease-liquid)',
            filter: 'drop-shadow(0 0 4px rgba(171,199,255,0.4))',
          }}
        />
      </svg>
      <div className="relative z-[1]">{children}</div>
    </div>
  )
}

// ─── ObsStreak ──────────────────────────────────────────────────────────────
export function ObsStreak({ days }: { days: number }) {
  return (
    <span
      className="inline-flex items-center gap-1 px-2 h-6 rounded-full text-[11px] font-semibold tabular-nums"
      style={{
        backgroundColor: 'rgba(255,184,107,0.12)',
        color: 'var(--color-obs-middle)',
        boxShadow: 'inset 0 0 0 1px rgba(255,184,107,0.22)',
      }}
      title={`${days}日連続`}
    >
      <svg width="10" height="12" viewBox="0 0 10 12" fill="none">
        <path
          d="M5 0.5C5 0.5 2 3 2 5.5C2 6.88 2.5 7.5 2.5 7.5C2.5 7.5 3 7 3.5 7C3.5 8.5 1 9 1 11C1 12.5 2.5 13 5 13C7.5 13 9 12.5 9 11C9 9 6.5 8.5 6.5 7C7 7 7.5 7.5 7.5 7.5C7.5 7.5 8 6.88 8 5.5C8 3 5 0.5 5 0.5Z"
          fill="currentColor"
          fillOpacity="0.85"
        />
      </svg>
      <span>{days}</span>
    </span>
  )
}

// ─── ObsAchievement ─────────────────────────────────────────────────────────
type Rarity = 'common' | 'rare' | 'epic' | 'legendary'
const RARITY_STYLE: Record<Rarity, { bg: string; ring: string; text: string }> = {
  common:    { bg: 'rgba(143,140,144,0.14)',  ring: 'rgba(143,140,144,0.28)', text: 'var(--color-obs-text-muted)' },
  rare:      { bg: 'rgba(126,198,255,0.14)',  ring: 'rgba(126,198,255,0.35)', text: 'var(--color-obs-low)' },
  epic:      { bg: 'rgba(171,199,255,0.18)',  ring: 'rgba(171,199,255,0.4)',  text: 'var(--color-obs-primary)' },
  legendary: { bg: 'rgba(255,184,107,0.16)',  ring: 'rgba(255,184,107,0.4)',  text: 'var(--color-obs-middle)' },
}

export function ObsAchievement({
  icon,
  label,
  rarity = 'common',
}: {
  icon: React.ReactNode
  label: string
  rarity?: Rarity
}) {
  const st = RARITY_STYLE[rarity]
  return (
    <div className="inline-flex items-center gap-2 pr-3 pl-1.5 h-8 rounded-full" style={{ backgroundColor: st.bg, boxShadow: `inset 0 0 0 1px ${st.ring}` }}>
      <span
        className="w-6 h-6 rounded-full flex items-center justify-center"
        style={{ backgroundColor: 'var(--color-obs-surface-highest)', color: st.text }}
      >
        {icon}
      </span>
      <span className="text-[11.5px] font-medium tracking-[-0.005em]" style={{ color: st.text }}>
        {label}
      </span>
    </div>
  )
}

// ─── ObsCountBadge（数値バッジ、subtle glow） ───────────────────────────────
export function ObsCountBadge({
  value,
  tone = 'primary',
}: {
  value: number | string
  tone?: 'primary' | 'hot' | 'neutral'
}) {
  const style: React.CSSProperties =
    tone === 'hot'
      ? {
          backgroundColor: 'rgba(255,107,107,0.16)',
          color: 'var(--color-obs-hot)',
          boxShadow: 'inset 0 0 0 1px rgba(255,107,107,0.24)',
        }
      : tone === 'neutral'
        ? {
            backgroundColor: 'var(--color-obs-surface-highest)',
            color: 'var(--color-obs-text-muted)',
          }
        : {
            backgroundColor: 'rgba(171,199,255,0.14)',
            color: 'var(--color-obs-primary)',
            boxShadow: 'inset 0 0 0 1px rgba(171,199,255,0.22)',
          }
  return (
    <span
      className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1.5 rounded-full text-[10px] font-semibold tabular-nums leading-none"
      style={style}
    >
      {value}
    </span>
  )
}
