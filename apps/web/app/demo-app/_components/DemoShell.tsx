'use client'

/**
 * /demo-app 用のシェル: 上部に「あなた専用デモ環境」バナーを置き、
 * 子ページを下に表示する。本番のサイドバー/ヘッダーは使わない。
 */

import { useEffect, useState } from 'react'
import { Clock, Sparkles, Mail } from 'lucide-react'
import type { DemoClaims } from '@/lib/demo-token'

interface Props {
  claims: DemoClaims
  children: React.ReactNode
}

export const DemoShell = ({ claims, children }: Props) => {
  return (
    <div className="min-h-screen bg-[#0a0a0c] text-[#e7e5ea] flex flex-col">
      <DemoBanner claims={claims} />
      <div className="flex-1 w-full">{children}</div>
    </div>
  )
}

function DemoBanner({ claims }: { claims: DemoClaims }) {
  const [remaining, setRemaining] = useState(claims.expiresAt - Date.now())

  useEffect(() => {
    const id = setInterval(() => {
      setRemaining(claims.expiresAt - Date.now())
    }, 1000)
    return () => clearInterval(id)
  }, [claims.expiresAt])

  const minutes = Math.max(0, Math.floor(remaining / 60000))
  const seconds = Math.max(0, Math.floor((remaining % 60000) / 1000))
  const expired = remaining <= 0

  return (
    <header
      className="sticky top-0 z-50 px-5 py-3 backdrop-blur-md"
      style={{
        background: 'rgba(15,15,17,0.85)',
        borderBottom: '1px solid rgba(171,199,255,0.12)',
      }}
    >
      <div className="mx-auto max-w-7xl flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3 min-w-0">
          <span className="font-display font-bold text-[1.05rem] fo-gradient-text shrink-0">
            ルキスマCRM
          </span>
          <span
            className="hidden sm:inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold tracking-[0.06em] uppercase shrink-0"
            style={{
              background: 'linear-gradient(135deg, rgba(171,199,255,0.20), rgba(0,113,227,0.10))',
              color: '#abc7ff',
              boxShadow: 'inset 0 0 0 1px rgba(171,199,255,0.32)',
            }}
          >
            <Sparkles size={10} strokeWidth={2.4} />
            DEMO MODE
          </span>
          <span className="hidden md:inline text-[12px] text-[#9b99a0] truncate">
            {claims.company} / {claims.name} 様 専用環境
          </span>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* クレジット */}
          <span
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px]"
            style={{
              background: 'rgba(141,255,201,0.10)',
              color: '#8dffc9',
              boxShadow: 'inset 0 0 0 1px rgba(141,255,201,0.28)',
            }}
            title={`このセッションでは ${claims.credits} クレジットまで利用できます`}
          >
            <Sparkles size={11} strokeWidth={2.2} />
            {claims.credits} クレジット
          </span>
          {/* 残り時間 */}
          <span
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] tabular-nums"
            style={{
              background: expired ? 'rgba(255,107,107,0.10)' : 'rgba(171,199,255,0.08)',
              color: expired ? '#ff8d8d' : '#abc7ff',
              boxShadow: expired
                ? 'inset 0 0 0 1px rgba(255,107,107,0.32)'
                : 'inset 0 0 0 1px rgba(171,199,255,0.22)',
            }}
          >
            <Clock size={11} strokeWidth={2.2} />
            {expired
              ? '期限切れ'
              : `残り ${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`}
          </span>
          {/* 相談 */}
          <a
            href="mailto:h.sawasaka@rookiesmart.jp?subject=ルキスマCRM デモのご相談"
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] text-[#c7c5c9] hover:text-white transition-colors"
            style={{
              background: 'rgba(255,255,255,0.04)',
              boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.10)',
            }}
          >
            <Mail size={11} strokeWidth={2.2} />
            代表に相談
          </a>
        </div>
      </div>
    </header>
  )
}
