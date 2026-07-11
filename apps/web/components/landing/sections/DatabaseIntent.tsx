'use client'

import { useMemo } from 'react'
import { Eyebrow, Section } from '../atoms'

interface NodeT { x: number; y: number; r: number; hot: boolean; lilac: boolean }

export const DatabaseIntent = () => {
  const nodes = useMemo<NodeT[]>(() => {
    let s = 7
    const rnd = () => { s = (s * 9301 + 49297) % 233280; return s / 233280 }
    const arr: NodeT[] = []
    for (let i = 0; i < 82; i++) {
      arr.push({
        x: 60 + rnd() * 880,
        y: 40 + rnd() * 340,
        r: 1 + rnd() * 2.4,
        hot: rnd() < 0.10,
        lilac: rnd() < 0.08,
      })
    }
    return arr
  }, [])

  const edges = useMemo<Array<[number, number]>>(() => {
    const e: Array<[number, number]> = []
    for (let i = 0; i < nodes.length; i++) {
      const a = nodes[i]!
      for (let j = i + 1; j < nodes.length; j++) {
        const b = nodes[j]!
        const d = Math.hypot(a.x - b.x, a.y - b.y)
        if (d < 110) e.push([i, j])
      }
    }
    return e
  }, [nodes])

  return (
    <Section tone="obsidian" screenLabel="08 Infrastructure Map">
      <div className="relative mx-auto max-w-6xl px-6 py-32 md:py-44">
        <div className="max-w-3xl">
          <Eyebrow color="#7ec6ff">FDE × AI INFRASTRUCTURE</Eyebrow>
          <h2 className="font-display font-bold tracking-[-0.025em] text-[2.4rem] md:text-[3.4rem] leading-[1.06] mt-5">
            <span className="fo-gradient-text">現場の業務</span>と、
            <br />
            既存SaaSをAIでつなぐ。
          </h2>
        </div>

        <div className="mt-14 grid md:grid-cols-12 gap-8 items-center">
          <div className="md:col-span-7 rounded-3xl bg-pitch fo-glass-rim p-4 relative overflow-hidden">
            <svg viewBox="0 0 1000 420" className="w-full h-[280px] md:h-[420px]">
              {edges.map(([i, j], k) => {
                const a = nodes[i]!
                const b = nodes[j]!
                return (
                  <line
                    key={k}
                    x1={a.x}
                    y1={a.y}
                    x2={b.x}
                    y2={b.y}
                    stroke="#abc7ff"
                    strokeOpacity="0.18"
                    strokeWidth="0.6"
                    className="fo-line-pulse"
                    style={{ animationDelay: `-${k % 6}s` }}
                  />
                )
              })}
              {nodes.map((n, i) => (
                <g key={i}>
                  <circle
                    cx={n.x} cy={n.y} r={n.r + (n.hot ? 1.6 : 0)}
                    fill={n.hot ? '#abc7ff' : n.lilac ? '#c8b9ff' : '#e7e5ea'}
                    opacity={n.hot ? 1 : 0.6}
                    style={{ filter: n.hot ? 'drop-shadow(0 0 6px #abc7ff)' : 'none' }}
                  />
                  {n.hot && (
                    <circle cx={n.x} cy={n.y} r="6" fill="none" stroke="#abc7ff" strokeOpacity="0.4" className="fo-line-pulse" />
                  )}
                </g>
              ))}
            </svg>
            <div className="absolute bottom-3 left-4 text-[10px] uppercase tracking-[0.16em] text-[#7e7c83]">
              live · fde.infrastructure.map
            </div>
          </div>
          <div className="md:col-span-5 grid grid-cols-2 gap-4">
            {[
              { k: 'FDE',       l: 'ヒアリングから設計',          c: '#abc7ff' },
              { k: 'AI',        l: 'ナレッジ検索・要約',  c: '#8dffc9' },
              { k: 'SaaS',      l: 'Obsidian / Notion / Workspace', c: '#ffcf4a' },
              { k: 'Ops',       l: '現場運用まで実装', c: '#c8b9ff' },
            ].map((s, i) => (
              <div key={i} className="rounded-2xl bg-dusk p-5 fo-glass-rim">
                <div className="font-display font-bold text-[1.7rem]" style={{ color: s.c }}>{s.k}</div>
                <div className="text-xs text-[#9b99a0] mt-1">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Section>
  )
}
