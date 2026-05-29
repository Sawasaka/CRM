'use client'

/**
 * 1stパーティ シグナルバッジ
 *
 * 自社1stパーティーデータ（メール開封・資料DL・サイト訪問など）から算出した
 * インテントシグナルを 強/中/弱 で表示する。取引・パイプラインなど CRM 系で共通利用。
 *
 * - 強：3チャネルすべて（メール開封・資料DL・サイト訪問）
 * - 中：2チャネル揃う or 「資料DL」「サイト訪問」のいずれか単独
 * - 弱：メール開封のみ
 */

import { useState } from 'react'
import { Activity, Zap, Radio, Mail, FileText, Globe, Check } from 'lucide-react'

export type Signal = 'Hot' | 'Middle' | 'Low'
type ChipTone = 'hot' | 'middle' | 'low'

export function signalToTone(s: Signal): ChipTone {
  if (s === 'Hot') return 'hot'
  if (s === 'Middle') return 'middle'
  return 'low'
}

export function signalLabel(s: Signal): string {
  if (s === 'Hot') return '強'
  if (s === 'Middle') return '中'
  return '弱'
}

export function signalIcon(s: Signal) {
  if (s === 'Hot') return Zap
  if (s === 'Middle') return Activity
  return Radio
}

type SignalChannel = 'email' | 'doc' | 'site'

const SIGNAL_CHANNELS: { key: SignalChannel; label: string; Icon: typeof Mail }[] = [
  { key: 'email', label: 'メール開封', Icon: Mail },
  { key: 'doc',   label: '資料DL',     Icon: FileText },
  { key: 'site',  label: 'サイト訪問', Icon: Globe },
]

// 各シグナル段階のサンプル充足パターン（実装時はGA4/MA/サイトログ等から取得）
const SIGNAL_HITS: Record<Signal, Record<SignalChannel, boolean>> = {
  Hot:    { email: true, doc: true,  site: true },
  Middle: { email: true, doc: false, site: true },
  Low:    { email: true, doc: false, site: false },
}

const TONE_COLOR: Record<ChipTone, { fg: string; bg: string; bgStrong: string; ring: string; glow: string }> = {
  hot: {
    fg: '#ff6f86',
    bg: 'rgba(255,111,134,0.08)',
    bgStrong: 'linear-gradient(145deg, rgba(255,111,134,0.12) 0%, rgba(39,35,41,0.78) 34%, rgba(24,25,29,0.94) 100%)',
    ring: 'rgba(255,111,134,0.25)',
    glow: 'rgba(255,111,134,0.075)',
  },
  middle: {
    fg: '#8dffc9',
    bg: 'rgba(141,255,201,0.06)',
    bgStrong: 'linear-gradient(145deg, rgba(141,255,201,0.09) 0%, rgba(35,41,40,0.78) 34%, rgba(24,25,29,0.94) 100%)',
    ring: 'rgba(141,255,201,0.20)',
    glow: 'rgba(141,255,201,0.060)',
  },
  low: {
    fg: '#abc7ff',
    bg: 'rgba(171,199,255,0.06)',
    bgStrong: 'linear-gradient(145deg, rgba(171,199,255,0.10) 0%, rgba(36,39,47,0.78) 34%, rgba(24,25,29,0.94) 100%)',
    ring: 'rgba(171,199,255,0.21)',
    glow: 'rgba(171,199,255,0.065)',
  },
}

export function SignalBadge({ signal }: { signal: Signal }) {
  const [hover, setHover] = useState(false)
  const Icon = signalIcon(signal)
  const tone = signalToTone(signal)
  const label = signalLabel(signal)
  const hits = SIGNAL_HITS[signal]
  const hitCount = (Object.values(hits) as boolean[]).filter(Boolean).length
  const c = TONE_COLOR[tone]

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <span
        className="inline-flex items-center gap-1 h-6 px-2 rounded-[var(--radius-obs-md)] text-[11px] font-semibold cursor-help"
        style={{
          background: c.bgStrong,
          color: c.fg,
          boxShadow: `inset 2px 0 0 ${c.fg}, inset 0 0 0 1px ${c.ring}, inset 1px 1px 0 rgba(255,255,255,0.060), 0 0 14px ${c.glow}`,
        }}
      >
        <Icon size={11} strokeWidth={2.4} />
        {label}
      </span>

      {hover && (
        <div
          className="absolute left-0 top-full mt-1.5 z-30 w-[240px] rounded-[var(--radius-obs-md)] overflow-hidden animate-[fadeIn_0.18s_ease-out]"
          style={{
            background:
              'linear-gradient(145deg, rgba(36,36,38,0.96) 0%, rgba(24,25,29,0.98) 100%)',
            backdropFilter: 'blur(22px) saturate(130%)',
            boxShadow: '0 18px 50px rgba(0,0,0,0.5), inset 1px 1px 0 rgba(171,199,255,0.08), inset -1px -1px 0 rgba(0,0,0,0.24)',
          }}
        >
          <div
            className="px-3 py-2 flex items-center justify-between"
            style={{
              background: c.bgStrong,
              boxShadow: `inset 2px 0 0 ${c.fg}`,
            }}
          >
            <span
              className="inline-flex items-center gap-1.5 text-[10.5px] font-bold tracking-[0.1em] uppercase"
              style={{ color: c.fg }}
            >
              <Icon size={11} strokeWidth={2.4} />
              シグナル {label}
            </span>
            <span
              className="text-[10.5px] tabular-nums font-medium"
              style={{ color: 'var(--color-obs-text-subtle)' }}
            >
              {hitCount} / 3
            </span>
          </div>
          <div className="px-3 py-2 space-y-1.5">
            {SIGNAL_CHANNELS.map((ch) => {
              const ok = hits[ch.key]
              const ChIcon = ch.Icon
              return (
                <div key={ch.key} className="flex items-center justify-between text-[11.5px]">
                  <span
                    className="inline-flex items-center gap-1.5"
                    style={{ color: ok ? 'var(--color-obs-text)' : 'var(--color-obs-text-subtle)' }}
                  >
                    <ChIcon size={11} strokeWidth={2.2} />
                    {ch.label}
                  </span>
                  {ok ? (
                    <Check size={12} strokeWidth={3} style={{ color: '#6ee7a1' }} />
                  ) : (
                    <span
                      className="text-[10.5px]"
                      style={{ color: 'var(--color-obs-text-subtle)' }}
                    >
                      —
                    </span>
                  )}
                </div>
              )
            })}
          </div>
          <div
            className="px-3 py-1.5 text-[10px]"
            style={{
              color: 'var(--color-obs-text-subtle)',
              backgroundColor: 'var(--color-obs-surface-low)',
            }}
          >
            <span className="inline-flex items-center gap-1">
              <Activity size={9} />
              過去7日 / 1stパーティーデータ
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
