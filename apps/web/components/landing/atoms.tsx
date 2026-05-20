'use client'

/**
 * Landing page primitives — ルキスマCRM (Photon Drift)
 * 公開LP（/）専用の基本コンポーネント群。AGENTSメタデータ、Eyebrow、Pill、
 * Orb、ParticleField、NebulaBG、Section、MiniBar、GlassCard を提供する。
 */

import { useMemo, type CSSProperties, type ElementType, type ReactNode } from 'react'

// ---------- Agent metadata ----------
export type AgentKey = 'sales' | 'marketing' | 'support' | 'helpdesk' | 'pdm'

export interface AgentMeta {
  name: string
  color: string
  token: string
  desc: string
}

export const AGENTS: Record<AgentKey, AgentMeta> = {
  sales:     { name: 'Sales Agent',     color: '#abc7ff', token: 'aurora', desc: '商談前ブリーフィング・議事録抽出・Next Action提案' },
  marketing: { name: 'Marketing Agent', color: '#ffcf4a', token: 'amber',  desc: 'インテント検知・ナーチャリング起動・キャンペーン実行' },
  support:   { name: 'Support Agent',   color: '#ff8dcf', token: 'coral',  desc: 'チケット1次回答・有人エスカレーション・SLA管理' },
  helpdesk:  { name: 'Helpdesk Agent',  color: '#c8b9ff', token: 'lilac',  desc: '社内Q&A即答・ナレッジ自動蓄積・継続チューニング' },
  pdm:       { name: 'PDM Agent',       color: '#8dffc9', token: 'mint',   desc: '議事録から課題抽出・優先度スコア・ロードマップ提案' },
}

// ---------- Eyebrow chip ----------
export const Eyebrow = ({
  color = '#abc7ff',
  children,
  className = '',
}: { color?: string; children: ReactNode; className?: string }) => (
  <div
    className={`inline-flex items-center gap-2 font-semibold uppercase tracking-[0.14em] text-[0.72rem] ${className}`}
    style={{ color }}
  >
    <span
      className="block w-1.5 h-1.5 rounded-full"
      style={{ background: color, boxShadow: `0 0 10px ${color}` }}
    />
    {children}
  </div>
)

// ---------- Pill chip ----------
interface PillProps {
  children: ReactNode
  color?: string
  onClick?: () => void
  className?: string
  as?: ElementType
}
export const Pill = ({ children, color, onClick, className = '', as: As = 'div' }: PillProps) => (
  <As
    onClick={onClick}
    className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-[0.72rem] uppercase tracking-[0.14em] bg-dusk text-[#c7c5c9] ${onClick ? 'cursor-pointer hover:bg-shimmer fo-chip-shimmer' : ''} ${className}`}
    style={color ? { color } : undefined}
  >
    {children}
  </As>
)

// ---------- Agent orb (luminous sphere) ----------
interface OrbProps {
  color: string
  size?: number
  active?: boolean
  glow?: number
  className?: string
}
export const Orb = ({ color, size = 12, active = false, glow = 1, className = '' }: OrbProps) => (
  <span
    className={`inline-block rounded-full ${active ? 'fo-orb-active' : ''} ${className}`}
    style={
      {
        width: size,
        height: size,
        background: `radial-gradient(circle at 30% 30%, #ffffff 0%, ${color} 35%, ${color}80 80%)`,
        boxShadow: `0 0 ${12 * glow}px ${color}aa, 0 0 ${30 * glow}px ${color}55`,
        ['--orb-color' as string]: `${color}80`,
      } as CSSProperties
    }
  />
)

// ---------- Particle field (deterministic, hydration-safe) ----------
function makeParticles(n: number, seed = 1) {
  const arr: Array<{
    x: number
    y: number
    size: number
    opacity: number
    blur: number
    delay: number
    dur: number
    tone: string
  }> = []
  let s = seed
  const rnd = () => {
    s = (s * 9301 + 49297) % 233280
    return s / 233280
  }
  for (let i = 0; i < n; i++) {
    const r = rnd()
    arr.push({
      x: rnd() * 100,
      y: rnd() * 100,
      size: 1 + Math.floor(rnd() * 3),
      opacity: 0.03 + rnd() * 0.1,
      blur: rnd() < 0.5 ? 1 : rnd() < 0.5 ? 2 : 3,
      delay: rnd() * 6,
      dur: 6 + rnd() * 10,
      tone: r < 0.7 ? '#abc7ff' : r < 0.9 ? '#c8b9ff' : '#ffffff',
    })
  }
  return arr
}

export const ParticleField = ({ count = 40, seed = 1 }: { count?: number; seed?: number }) => {
  const parts = useMemo(() => makeParticles(count, seed), [count, seed])
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {parts.map((p, i) => (
        <span
          key={i}
          className="absolute rounded-full fo-drift"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            background: p.tone,
            opacity: p.opacity,
            filter: `blur(${p.blur}px)`,
            animationDelay: `-${p.delay}s`,
            animationDuration: `${p.dur}s`,
          }}
        />
      ))}
    </div>
  )
}

// ---------- Obsidian Nebula background ----------
export const NebulaBG = ({ intensity = 1 }: { intensity?: number }) => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden">
    <div
      className="absolute -top-40 -left-40 w-[60vw] h-[60vw] rounded-full"
      style={{
        background: `radial-gradient(circle, rgba(0,113,227,${0.1 * intensity}) 0%, transparent 60%)`,
        filter: 'blur(60px)',
      }}
    />
    <div
      className="absolute top-1/3 -right-40 w-[55vw] h-[55vw] rounded-full"
      style={{
        background: `radial-gradient(circle, rgba(171,199,255,${0.08 * intensity}) 0%, transparent 60%)`,
        filter: 'blur(80px)',
      }}
    />
    <div
      className="absolute -bottom-40 left-1/4 w-[50vw] h-[50vw] rounded-full"
      style={{
        background: `radial-gradient(circle, rgba(200,185,255,${0.06 * intensity}) 0%, transparent 60%)`,
        filter: 'blur(80px)',
      }}
    />
    <div className="fo-aurora-ribbon" />
  </div>
)

// ---------- Section wrapper ----------
interface SectionProps {
  id?: string
  children: ReactNode
  className?: string
  tone?: 'obsidian' | 'pitch'
  screenLabel?: string
}
export const Section = ({ id, children, className = '', tone = 'obsidian', screenLabel }: SectionProps) => (
  <section
    id={id}
    data-screen-label={screenLabel}
    className={`relative ${tone === 'pitch' ? 'bg-pitch' : 'bg-obsidian'} ${className}`}
  >
    {children}
  </section>
)

// ---------- Mini bar (data-as-light) ----------
export const MiniBar = ({
  value,
  max = 100,
  color = '#abc7ff',
  w = 100,
}: { value: number; max?: number; color?: string; w?: number }) => (
  <div className="h-1.5 rounded-full bg-shimmer/60 overflow-hidden" style={{ width: w }}>
    <div
      className="h-full rounded-full"
      style={{
        width: `${(value / max) * 100}%`,
        background: `linear-gradient(90deg, ${color}55, ${color})`,
        boxShadow: `0 0 8px ${color}80`,
      }}
    />
  </div>
)

// ---------- Glass card ----------
export const GlassCard = ({
  children,
  className = '',
  tone = 'dusk',
}: { children: ReactNode; className?: string; tone?: 'dusk' | 'glass' }) => (
  <div
    className={`rounded-3xl p-7 fo-lift fo-glass-rim ${tone === 'glass' ? 'fo-glass' : 'bg-dusk hover:bg-[#2c2b2e]'} ${className}`}
  >
    {children}
  </div>
)
