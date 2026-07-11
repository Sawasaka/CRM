'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Mail,
  Check,
  Copy,
  Plus,
  Trash2,
  Link2,
  Code2,
  ArrowRight,
} from 'lucide-react'
import { ObsCard, ObsButton } from '@/components/obsidian'

// ─── Types ──────────────────────────────────────────────────────────────────────

type ChannelKey = 'open' | 'click' | 'doc' | 'site'
type ChannelStatus = 'healthy' | 'warning' | 'inactive'

interface ChannelMetric {
  key: ChannelKey
  label: string
  Icon: typeof Mail
  last7Days: number
  last24h: number
  trend: number[]
  status: ChannelStatus
}

const CHANNELS: ChannelMetric[] = []

const STATUS_COLOR: Record<ChannelStatus, { fg: string; bg: string; ring: string; label: string }> = {
  healthy:  { fg: '#6ee7a1',                       bg: 'rgba(110,231,161,0.12)', ring: 'rgba(110,231,161,0.32)', label: '正常' },
  warning:  { fg: 'var(--color-obs-middle)',       bg: 'rgba(255,184,107,0.14)', ring: 'rgba(255,184,107,0.32)', label: '注意' },
  inactive: { fg: 'var(--color-obs-text-subtle)',  bg: 'rgba(143,140,144,0.10)', ring: 'rgba(143,140,144,0.24)', label: '未設定' },
}

interface TrackedUrl {
  id: string
  label: string
  originalUrl: string
  trackingUrl: string
  clicks30d: number
  uniqueUsers30d: number
  lastClickedRelative: string
}

const INITIAL_TRACKED_URLS: TrackedUrl[] = []

interface TrackedDomain {
  id: string
  domain: string
  pv7d: number
  uu7d: number
}

// タグが検出されたドメインのみを保持(自動発見)
const INITIAL_TRACKED_DOMAINS: TrackedDomain[] = []

// ─── Helpers ────────────────────────────────────────────────────────────────────

function Sparkline({ data, color }: { data: number[]; color: string }) {
  const w = 80
  const h = 24
  const max = Math.max(...data, 1)
  const stepX = w / Math.max(data.length - 1, 1)
  const points = data.map((v, i) => `${(i * stepX).toFixed(1)},${(h - (v / max) * h).toFixed(1)}`).join(' ')
  return (
    <svg width={w} height={h} className="overflow-visible">
      <polyline fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" points={points} />
    </svg>
  )
}

function SectionHeader({ title }: { title: string }) {
  return (
    <h3 className="text-[12px] font-semibold tracking-[0.08em] uppercase mb-3 px-1" style={{ color: 'var(--color-obs-text-muted)' }}>
      {title}
    </h3>
  )
}

// ─── Main ───────────────────────────────────────────────────────────────────────

export function FirstPartyView() {
  const [trackedUrls, setTrackedUrls] = useState<TrackedUrl[]>(INITIAL_TRACKED_URLS)
  const [showAddUrl, setShowAddUrl] = useState(false)
  const [newUrlLabel, setNewUrlLabel] = useState('')
  const [newUrlOriginal, setNewUrlOriginal] = useState('')

  const [trackedDomains] = useState<TrackedDomain[]>(INITIAL_TRACKED_DOMAINS)
  const tagSnippet = `<script src="https://docview.io/track.js" data-tenant="zooba" defer></script>`

  const [copied, setCopied] = useState<string | null>(null)
  const handleCopy = (value: string, key: string) => {
    navigator.clipboard.writeText(value)
    setCopied(key)
    setTimeout(() => setCopied(null), 1800)
  }

  const addTrackedUrl = () => {
    if (!newUrlLabel.trim() || !newUrlOriginal.trim()) return
    const slug = Math.random().toString(36).slice(2, 8)
    setTrackedUrls((prev) => [
      {
        id: `tu-${Date.now()}`,
        label: newUrlLabel.trim(),
        originalUrl: newUrlOriginal.trim(),
        trackingUrl: `https://zooba.docview.io/c/${slug}`,
        clicks30d: 0,
        uniqueUsers30d: 0,
        lastClickedRelative: '—',
      },
      ...prev,
    ])
    setNewUrlLabel('')
    setNewUrlOriginal('')
    setShowAddUrl(false)
  }

  const deleteTrackedUrl = (id: string) => {
    setTrackedUrls((prev) => prev.filter((u) => u.id !== id))
  }

  return (
    <div className="space-y-6">
      {/* ── 取得状況(直近7日)── */}
      <div>
        <SectionHeader title="1stパーティ取得状況 (直近 7 日)" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {CHANNELS.map((ch) => {
            const tone = STATUS_COLOR[ch.status]
            const isInactive = ch.status === 'inactive'
            return (
              <ObsCard key={ch.key} depth="low" padding="lg" radius="xl">
                <div className="flex items-center gap-2 mb-2">
                  <ch.Icon size={13} style={{ color: isInactive ? 'var(--color-obs-text-subtle)' : 'var(--color-obs-text-muted)' }} />
                  <span className="text-[12px] font-medium" style={{ color: 'var(--color-obs-text-muted)' }}>
                    {ch.label}
                  </span>
                  <span
                    className="ml-auto inline-flex items-center h-4 px-1.5 rounded-full text-[9.5px] font-bold"
                    style={{ backgroundColor: tone.bg, color: tone.fg }}
                  >
                    {tone.label}
                  </span>
                </div>
                <div className="flex items-end justify-between gap-2">
                  <div className="text-[22px] font-bold tabular-nums leading-none" style={{ color: isInactive ? 'var(--color-obs-text-subtle)' : 'var(--color-obs-text)' }}>
                    {ch.last7Days.toLocaleString()}
                  </div>
                  <Sparkline data={ch.trend} color={isInactive ? 'rgba(143,140,144,0.4)' : 'var(--color-obs-primary)'} />
                </div>
              </ObsCard>
            )
          })}
        </div>
      </div>

      {/* ── 取得元の設定 ── */}
      <div>
        <SectionHeader title="1stパーティ取得元の設定" />

        <div className="space-y-3">

          {/* ① Gmail / メール計測(統合) */}
          <ObsCard depth="low" padding="lg" radius="xl">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-[var(--radius-obs-sm)] flex items-center justify-center shrink-0" style={{ backgroundColor: 'var(--color-obs-surface-high)' }}>
                <Mail size={14} style={{ color: 'var(--color-obs-text)' }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[14px] font-semibold" style={{ color: 'var(--color-obs-text)' }}>
                    Gmail / メール計測
                  </span>
                  <span className="inline-flex items-center gap-1 h-5 px-1.5 rounded-full text-[10px] font-bold" style={{ backgroundColor: 'rgba(110,231,161,0.12)', color: '#6ee7a1' }}>
                    <Check size={9} strokeWidth={3} />連携中
                  </span>
                </div>
                <p className="text-[12px] mt-1" style={{ color: 'var(--color-obs-text-muted)' }}>
                  送信者と開封者がわかります
                </p>
                <div className="flex items-center gap-3 mt-3 text-[12px] flex-wrap" style={{ color: 'var(--color-obs-text-muted)' }}>
                  <span className="font-mono" style={{ color: 'var(--color-obs-text)' }}>sales@zooba.io</span>
                  <span style={{ color: 'var(--color-obs-text-subtle)' }}>最終同期 2分前</span>
                  <Link
                    href="/subscription?tab=integrations"
                    className="ml-auto inline-flex items-center gap-1 text-[12px] font-medium hover:underline"
                    style={{ color: 'var(--color-obs-primary)' }}
                    title="Gmail連携の設定画面を開く"
                  >
                    管理 <ArrowRight size={11} />
                  </Link>
                </div>
              </div>
            </div>
          </ObsCard>

          {/* ② 計測URLの登録 */}
          <ObsCard depth="low" padding="lg" radius="xl">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-8 h-8 rounded-[var(--radius-obs-sm)] flex items-center justify-center shrink-0" style={{ backgroundColor: 'var(--color-obs-surface-high)' }}>
                <Link2 size={14} style={{ color: 'var(--color-obs-text)' }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[14px] font-semibold" style={{ color: 'var(--color-obs-text)' }}>計測URLの登録</div>
                <p className="text-[12px] mt-0.5" style={{ color: 'var(--color-obs-text-muted)' }}>HPリンクや事例リンクを登録すると、誰が何を閲覧したかがわかります</p>
              </div>
              <ObsButton size="sm" variant="primary" onClick={() => setShowAddUrl(true)}>
                <span className="inline-flex items-center gap-1"><Plus size={11} />追加</span>
              </ObsButton>
            </div>

            <AnimatePresence>
              {showAddUrl && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="ml-11 mb-3 p-3 rounded-[var(--radius-obs-md)] space-y-2"
                  style={{ backgroundColor: 'rgba(171,199,255,0.05)', boxShadow: 'inset 0 0 0 1px rgba(171,199,255,0.16)' }}
                >
                  <input
                    type="text"
                    autoFocus
                    placeholder="用途名"
                    value={newUrlLabel}
                    onChange={(e) => setNewUrlLabel(e.target.value)}
                    className="w-full px-3 h-8 rounded-[6px] text-[12px] outline-none"
                    style={{ backgroundColor: 'var(--color-obs-surface-lowest)', color: 'var(--color-obs-text)', boxShadow: 'inset 0 0 0 1px rgba(109,106,111,0.18)' }}
                  />
                  <input
                    type="text"
                    placeholder="元URL"
                    value={newUrlOriginal}
                    onChange={(e) => setNewUrlOriginal(e.target.value)}
                    className="w-full px-3 h-8 rounded-[6px] text-[12px] font-mono outline-none"
                    style={{ backgroundColor: 'var(--color-obs-surface-lowest)', color: 'var(--color-obs-text)', boxShadow: 'inset 0 0 0 1px rgba(109,106,111,0.18)' }}
                  />
                  <div className="flex justify-end gap-2">
                    <ObsButton size="sm" variant="ghost" onClick={() => { setShowAddUrl(false); setNewUrlLabel(''); setNewUrlOriginal('') }}>キャンセル</ObsButton>
                    <ObsButton size="sm" variant="primary" onClick={addTrackedUrl} disabled={!newUrlLabel.trim() || !newUrlOriginal.trim()}>発行</ObsButton>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {trackedUrls.length === 0 ? (
              <div className="ml-11 px-3 py-6 text-center text-[12px] rounded-[var(--radius-obs-md)]" style={{ backgroundColor: 'var(--color-obs-surface-lowest)', color: 'var(--color-obs-text-subtle)' }}>
                まだ登録されたURLはありません
              </div>
            ) : (
              <div className="ml-11" style={{ borderTop: '1px solid rgba(109,106,111,0.12)' }}>
                {trackedUrls.map((u) => (
                  <div
                    key={u.id}
                    className="grid items-center gap-3 py-2.5 group"
                    style={{
                      gridTemplateColumns: '1fr 80px 60px 80px 32px 32px',
                      borderBottom: '1px solid rgba(109,106,111,0.08)',
                    }}
                  >
                    <div className="min-w-0">
                      <div className="text-[12.5px] font-medium truncate" style={{ color: 'var(--color-obs-text)' }}>{u.label}</div>
                      <div className="text-[10.5px] font-mono truncate" style={{ color: 'var(--color-obs-text-subtle)' }}>{u.trackingUrl}</div>
                    </div>
                    <div className="text-right text-[11.5px] tabular-nums" style={{ color: 'var(--color-obs-text)' }}>
                      <span className="font-semibold">{u.clicks30d.toLocaleString()}</span>
                      <span className="text-[10px] ml-0.5" style={{ color: 'var(--color-obs-text-subtle)' }}>click</span>
                    </div>
                    <div className="text-right text-[11.5px] tabular-nums" style={{ color: 'var(--color-obs-text-muted)' }}>
                      {u.uniqueUsers30d.toLocaleString()}<span className="text-[10px] ml-0.5" style={{ color: 'var(--color-obs-text-subtle)' }}>UU</span>
                    </div>
                    <div className="text-right text-[10.5px]" style={{ color: 'var(--color-obs-text-subtle)' }}>{u.lastClickedRelative}</div>
                    <button
                      type="button"
                      onClick={() => handleCopy(u.trackingUrl, u.id)}
                      className="w-7 h-7 rounded-[6px] flex items-center justify-center transition-colors hover:bg-[rgba(171,199,255,0.10)]"
                      title="計測URLをコピー"
                    >
                      {copied === u.id ? <Check size={11} style={{ color: '#6ee7a1' }} /> : <Copy size={11} style={{ color: 'var(--color-obs-text-muted)' }} />}
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteTrackedUrl(u.id)}
                      className="w-7 h-7 rounded-[6px] flex items-center justify-center transition-colors hover:bg-[rgba(255,107,107,0.12)] opacity-0 group-hover:opacity-100"
                      title="削除"
                    >
                      <Trash2 size={10} style={{ color: 'var(--color-obs-hot)' }} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </ObsCard>

          {/* ③ サイト計測タグの設置 */}
          <ObsCard depth="low" padding="lg" radius="xl">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-8 h-8 rounded-[var(--radius-obs-sm)] flex items-center justify-center shrink-0" style={{ backgroundColor: 'var(--color-obs-surface-high)' }}>
                <Code2 size={14} style={{ color: 'var(--color-obs-text)' }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[14px] font-semibold" style={{ color: 'var(--color-obs-text)' }}>サイト計測タグ</div>
                <p className="text-[12px] mt-0.5" style={{ color: 'var(--color-obs-text-muted)' }}>自社ホームページに貼って、訪問企業を特定します</p>
              </div>
            </div>

            <div className="ml-11 mb-3">
              {/* 設置場所の案内 */}
              <div className="text-[11.5px] mb-2" style={{ color: 'var(--color-obs-text-muted)' }}>
                サイト共通の <code className="font-mono px-1 py-0.5 rounded" style={{ backgroundColor: 'var(--color-obs-surface-lowest)', color: 'var(--color-obs-text)' }}>&lt;/head&gt;</code> 直前にこのタグを貼り付けてください(1回貼ると全ページに反映)
              </div>

              <div className="flex items-stretch gap-2">
                <code
                  className="flex-1 min-w-0 px-3 h-9 leading-9 rounded-[6px] text-[11.5px] font-mono truncate"
                  style={{ backgroundColor: 'var(--color-obs-surface-lowest)', color: 'var(--color-obs-text)', boxShadow: 'inset 0 0 0 1px rgba(109,106,111,0.18)' }}
                >
                  {tagSnippet}
                </code>
                <button
                  type="button"
                  onClick={() => handleCopy(tagSnippet, 'tag-snippet')}
                  className="inline-flex items-center gap-1 h-9 px-3 rounded-[6px] text-[12px] font-medium"
                  style={{ backgroundColor: 'var(--color-obs-surface-high)', color: 'var(--color-obs-text)' }}
                >
                  {copied === 'tag-snippet' ? <><Check size={11} style={{ color: '#6ee7a1' }} /> コピー済</> : <><Copy size={11} /> コピー</>}
                </button>
              </div>

              {/* プラットフォーム別の設置場所ヒント */}
              <div className="mt-2 p-2.5 rounded-[6px]" style={{ backgroundColor: 'rgba(171,199,255,0.05)', boxShadow: 'inset 0 0 0 1px rgba(171,199,255,0.14)' }}>
                <div className="text-[10.5px] font-semibold tracking-[0.04em] uppercase mb-1.5" style={{ color: 'var(--color-obs-primary)' }}>
                  ✦ 主なサイト基盤での貼り付け先
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-1 text-[11px]" style={{ color: 'var(--color-obs-text-muted)' }}>
                  <div>• <strong>WordPress</strong>: テーマの <code className="font-mono">header.php</code> または「ヘッダー追加」プラグイン</div>
                  <div>• <strong>Next.js / Nuxt</strong>: <code className="font-mono">_app.tsx</code> / <code className="font-mono">layout.tsx</code></div>
                  <div>• <strong>Shopify</strong>: テーマ編集の <code className="font-mono">theme.liquid</code></div>
                  <div>• <strong>STUDIO / Wix / Webflow</strong>: 設定 → 「カスタムコード(Head)」</div>
                  <div>• <strong>静的HTML</strong>: 共通インクルードファイル or 全ページ</div>
                  <div>• <strong>Google Tag Manager</strong>: カスタムHTMLタグとして配信</div>
                </div>
                <div className="text-[10.5px] mt-1.5 pt-1.5" style={{ color: 'var(--color-obs-text-subtle)', borderTop: '1px solid rgba(171,199,255,0.14)' }}>
                  サブドメイン(<code className="font-mono">blog.zooba.io</code> 等)は別サイト扱いになるため、それぞれ1回ずつ設置が必要です
                </div>
              </div>
            </div>

            <div className="ml-11" style={{ borderTop: '1px solid rgba(109,106,111,0.12)' }}>
              <div className="flex items-center justify-between pt-2.5 pb-1.5">
                <div className="text-[10.5px] font-semibold tracking-[0.05em] uppercase" style={{ color: 'var(--color-obs-text-subtle)' }}>
                  検出済みドメイン
                </div>
                <span className="text-[10.5px]" style={{ color: 'var(--color-obs-text-subtle)' }}>
                  タグを設置すると自動で表示されます
                </span>
              </div>
              {trackedDomains.length === 0 ? (
                <div className="px-3 py-6 text-center text-[12px] rounded-[var(--radius-obs-md)]" style={{ backgroundColor: 'var(--color-obs-surface-lowest)', color: 'var(--color-obs-text-subtle)' }}>
                  まだタグが検出されていません
                </div>
              ) : (
                trackedDomains.map((d) => (
                  <div
                    key={d.id}
                    className="grid items-center gap-3 py-2"
                    style={{
                      gridTemplateColumns: '14px 1fr 80px 60px',
                      borderTop: '1px solid rgba(109,106,111,0.08)',
                    }}
                  >
                    <Check size={13} strokeWidth={3} style={{ color: '#6ee7a1' }} />
                    <div className="font-mono text-[12.5px] truncate" style={{ color: 'var(--color-obs-text)' }}>
                      {d.domain}
                    </div>
                    <div className="text-right text-[11.5px] tabular-nums" style={{ color: 'var(--color-obs-text)' }}>
                      <span className="font-semibold">{d.pv7d.toLocaleString()}</span>
                      <span className="text-[10px] ml-0.5" style={{ color: 'var(--color-obs-text-subtle)' }}>PV</span>
                    </div>
                    <div className="text-right text-[11.5px] tabular-nums" style={{ color: 'var(--color-obs-text-muted)' }}>
                      {d.uu7d.toLocaleString()}<span className="text-[10px] ml-0.5" style={{ color: 'var(--color-obs-text-subtle)' }}>UU</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ObsCard>

        </div>
      </div>

      {/* ── Toast ── */}
      <AnimatePresence>
        {copied && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full text-[12px] font-medium"
            style={{
              backgroundColor: 'var(--color-obs-surface-highest)',
              color: 'var(--color-obs-text)',
              boxShadow: '0 8px 24px rgba(0,0,0,0.4), inset 0 0 0 1px rgba(109,106,111,0.24)',
            }}
          >
            コピーしました
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
