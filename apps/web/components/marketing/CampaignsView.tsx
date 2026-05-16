'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Send, MousePointerClick, MessageSquare, FileText, X, ExternalLink, AlertTriangle, Loader2, CheckCircle2, CalendarClock, Globe, Link2, BarChart3, Users, Calendar, List } from 'lucide-react'
import { ObsButton, ObsInput as RawObsInput } from '@/components/obsidian'

// パスワードマネージャ (1Password / LastPass / Bitwarden 等) の自動補完を抑制する
// メール作成画面はパスワードフィールドではないため
function ObsInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <RawObsInput
      type="text"
      autoComplete="off"
      data-1p-ignore
      data-lpignore="true"
      data-form-type="other"
      {...props}
    />
  )
}
import {
  MOCK_CAMPAIGNS,
  AVAILABLE_LISTS,
  totalClicks,
  clicksByKind,
  campaignTotalClicks,
  campaignTotalReplies,
  campaignClicksByKind,
  latestRound,
  FILTER_LABEL,
  type MailCampaign,
  type CampaignLink,
  type LinkKind,
  type SendRound,
  type ResendFilterKind,
} from '@/lib/mock-data/campaigns'

function pct(num: number, den: number): string {
  if (!den) return '—'
  return `${((num / den) * 100).toFixed(1)}%`
}

/**
 * 「その他」種別の追跡リンクから代表ラベルを抽出する。
 * - 1件: そのリンクのカスタムテキストを返す
 * - 複数: クリック数が多いリンクを代表に、「○○ 他N件」形式
 * - なし: デフォルト「その他」を返す
 */
function pickOtherLabel(links: CampaignLink[]): string {
  const others = links.filter((l) => l.kind === 'other' && l.label && l.label.trim())
  if (others.length === 0) return 'その他'
  if (others.length === 1) return others[0]!.label
  // ラベル単位で集計（同名の other リンクは合算）
  const byLabel = new Map<string, number>()
  for (const l of others) {
    byLabel.set(l.label, (byLabel.get(l.label) ?? 0) + l.clicks)
  }
  const sorted = Array.from(byLabel.entries()).sort((a, b) => b[1] - a[1])
  if (sorted.length === 1) return sorted[0]![0]
  return `${sorted[0]![0]} 他${sorted.length - 1}件`
}

// ─── 配信ごとファネルカード ────────────────────────────────────────────────

const KIND_META: Record<LinkKind, { label: string; icon: React.ElementType; color: string }> = {
  schedule: { label: '日程調整', icon: CalendarClock, color: '#6ee7a1' },
  homepage: { label: 'HP',       icon: Globe,         color: 'var(--color-obs-low)' },
  doc:      { label: '資料',     icon: FileText,      color: 'var(--color-obs-middle)' },
  other:    { label: 'その他',   icon: Link2,         color: 'var(--color-obs-text-muted)' },
}
const KIND_ORDER: LinkKind[] = ['schedule', 'homepage', 'doc', 'other']

type ViewScope = 'total' | number  // 'total' = 全体合計 / number = 1始まりのラウンド番号

function CampaignFunnelCard({
  campaign,
  expanded,
  onToggle,
  onResend,
}: {
  campaign: MailCampaign
  expanded: boolean
  onToggle: () => void
  onResend: (c: MailCampaign, fromRound: number) => void
}) {
  // 表示中のスコープ (全体 or 特定ラウンド)。デフォルトは「全体」
  const [scope, setScope] = useState<ViewScope>('total')
  const last = latestRound(campaign)
  const totalSent = campaign.sends.reduce((s, r) => s + r.recipients, 0)

  // スコープに応じて表示する数値を切替
  const view = (() => {
    if (scope === 'total') {
      // 全ラウンドのリンクを集めて、kind='other' のラベルを抽出する
      const allLinks = campaign.sends.flatMap((r) => r.links)
      return {
        recipients: totalSent,                       // 累計送信数
        clickTotal: campaignTotalClicks(campaign),
        replied: campaignTotalReplies(campaign),
        byKind: campaignClicksByKind(campaign),
        links: null as CampaignLink[] | null,        // 個別リンクは合計表示なし
        otherLabel: pickOtherLabel(allLinks),
        subject: null as string | null,
        body: null as string | null,
      }
    }
    const r = campaign.sends.find((s) => s.round === scope)
    if (!r) return null
    return {
      recipients: r.recipients,
      clickTotal: totalClicks(r.links),
      replied: r.metrics.replied,
      byKind: clicksByKind(r.links),
      links: r.links,
      otherLabel: pickOtherLabel(r.links),
      subject: r.subject,
      body: r.body,
    }
  })()

  if (!view) return null

  // ラベルは「○○数」で統一。全体は「合計の○○数」
  const isTotal = scope === 'total'
  const phases: { label: string; value: number; icon: React.ElementType; tint: string; den: number }[] = [
    {
      label: isTotal ? '合計の送信数' : '送信数',
      value: view.recipients,
      icon: Send,
      tint: 'var(--color-obs-text-muted)',
      den: 0,
    },
    {
      label: isTotal ? '合計のリンククリック数' : 'リンククリック数',
      value: view.clickTotal,
      icon: MousePointerClick,
      tint: 'var(--color-obs-low)',
      den: campaign.totalRecipients,
    },
    {
      label: isTotal ? '合計の返信数' : '返信数',
      value: view.replied,
      icon: MessageSquare,
      tint: '#6ee7a1',
      den: campaign.totalRecipients,
    },
  ]
  const maxValue = Math.max(...phases.map((p) => p.value), 1)

  return (
    <div
      className="rounded-[var(--radius-obs-xl)] overflow-hidden transition-colors"
      style={{
        backgroundColor: 'var(--color-obs-surface-high)',
        boxShadow: 'inset 0 0 0 1px rgba(109,106,111,0.18), 0 2px 12px rgba(0,0,0,0.25)',
      }}
    >
      <div
        role="button"
        tabIndex={0}
        onClick={onToggle}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onToggle() } }}
        className="w-full text-left p-5 transition-colors hover:bg-[rgba(171,199,255,0.04)] cursor-pointer"
      >
        {/* ヘッダー */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1.5">
              <h4 className="text-[14px] font-bold truncate" style={{ color: 'var(--color-obs-text)' }}>{campaign.name}</h4>
              <span
                className="inline-flex items-center gap-1.5 px-2 h-5 rounded-full text-[10.5px] font-semibold tabular-nums tracking-[-0.005em]"
                style={{
                  backgroundColor: 'rgba(171,199,255,0.10)',
                  color: 'var(--color-obs-primary)',
                  boxShadow: 'inset 0 0 0 1px rgba(171,199,255,0.22)',
                }}
                title="送信ラウンド数"
              >
                <Send size={9} strokeWidth={2.4} />
                <span>
                  <span className="opacity-80">送信</span> {campaign.sends.length}<span className="opacity-60">回</span>
                </span>
              </span>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className="inline-flex items-center gap-1.5 px-2 h-6 rounded-full text-[11px] font-semibold whitespace-nowrap"
                style={{
                  backgroundColor: 'rgba(171,199,255,0.12)',
                  color: 'var(--color-obs-primary)',
                  boxShadow: 'inset 0 0 0 1px rgba(171,199,255,0.28)',
                }}
                title="配信先のISリスト"
              >
                <Users size={10.5} strokeWidth={2.4} />
                {campaign.listName} ({campaign.totalRecipients.toLocaleString()}件)
              </span>
              <span
                className="inline-flex items-center gap-1 text-[11px]"
                style={{ color: 'var(--color-obs-text-muted)' }}
              >
                <Calendar size={10} />
                直近: {last?.sentAt ?? '未送信'}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[10.5px] font-semibold uppercase tracking-[0.06em]" style={{ color: 'var(--color-obs-text-subtle)' }}>
              {expanded ? '閉じる ▲' : '内訳を見る ▼'}
            </span>
          </div>
        </div>

        {/* スコープ切替タブ (全体 / 1回目 / 2回目 / ...) */}
        <div
          className="flex items-center gap-1 mb-3 p-1 rounded-[var(--radius-obs-md)] w-fit"
          style={{ backgroundColor: 'var(--color-obs-surface-low)' }}
          onClick={(e) => e.stopPropagation()}
        >
          <ScopeTab active={scope === 'total'} onClick={() => setScope('total')}>
            全体
          </ScopeTab>
          {campaign.sends.map((r) => (
            <ScopeTab
              key={r.round}
              active={scope === r.round}
              onClick={() => setScope(r.round)}
            >
              {r.round}回目
            </ScopeTab>
          ))}
        </div>

        {/* フェーズグリッド (3カラム) */}
        <div className="grid grid-cols-3 gap-2">
          {phases.map((p, i) => {
            const Icon = p.icon
            return (
              <div
                key={p.label}
                className="rounded-[10px] p-3 relative overflow-hidden flex flex-col"
                style={{ backgroundColor: 'var(--color-obs-surface-low)', boxShadow: 'inset 0 0 0 1px rgba(109,106,111,0.10)' }}
              >
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Icon size={11} style={{ color: p.tint }} />
                  <span className="text-[10px] font-semibold uppercase tracking-[0.04em]" style={{ color: 'var(--color-obs-text-muted)' }}>{p.label}</span>
                </div>
                <div className="text-[18px] font-bold tabular-nums" style={{ color: p.value ? 'var(--color-obs-text)' : 'var(--color-obs-text-subtle)' }}>
                  {p.value.toLocaleString()}
                </div>
                <div className="text-[10px] tabular-nums mt-0.5 min-h-[14px]" style={{ color: 'var(--color-obs-text-subtle)' }}>
                  {i > 0 && p.den ? pct(p.value, p.den) : ''}
                </div>
                <div className="mt-auto pt-2">
                  <div className="h-1 rounded-full" style={{ backgroundColor: 'rgba(109,106,111,0.18)' }}>
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${Math.min(p.value / maxValue, 1) * 100}%`,
                        backgroundColor: p.tint,
                      }}
                    />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* 展開：クリック内訳 + メタ情報 */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
            style={{ borderTop: '1px solid rgba(109,106,111,0.18)' }}
          >
            <div className="p-5 space-y-5" style={{ backgroundColor: 'var(--color-obs-surface-base)' }}>
              {/* 種別ごとのクリック数 */}
              <div>
                <div className="text-[10.5px] font-semibold uppercase tracking-[0.08em] mb-2 flex items-center gap-1.5" style={{ color: 'var(--color-obs-text-muted)' }}>
                  <MousePointerClick size={11} />
                  種別ごとのクリック数 ({scope === 'total' ? '全体合計' : `${scope}回目のみ`})
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {KIND_ORDER.map((k) => {
                    const meta = KIND_META[k]
                    const v = view.byKind[k]
                    const Icon = meta.icon
                    // 「その他」はカスタムリンクのラベルが入力されていればそれを表示
                    const displayLabel = k === 'other' ? view.otherLabel : meta.label
                    return (
                      <div
                        key={k}
                        className="rounded-[10px] p-3"
                        style={{ backgroundColor: 'var(--color-obs-surface-low)', boxShadow: 'inset 0 0 0 1px rgba(109,106,111,0.10)' }}
                      >
                        <div className="flex items-center gap-1.5 mb-1 min-w-0">
                          <Icon size={11} style={{ color: meta.color, flexShrink: 0 }} />
                          <span
                            className="text-[10.5px] font-semibold truncate"
                            style={{ color: 'var(--color-obs-text)' }}
                            title={displayLabel}
                          >
                            {displayLabel}
                          </span>
                        </div>
                        <div className="flex items-baseline gap-2 mt-1">
                          <span className="text-[18px] font-bold tabular-nums" style={{ color: v ? meta.color : 'var(--color-obs-text-subtle)' }}>
                            {v.toLocaleString()}
                          </span>
                          <span className="text-[10px] tabular-nums" style={{ color: 'var(--color-obs-text-subtle)' }}>
                            {view.clickTotal ? `${((v / view.clickTotal) * 100).toFixed(1)}% / クリック` : ''}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* 各回サマリー: 全体スコープ時のみ */}
              {scope === 'total' && (
                <div>
                  <div className="text-[10.5px] font-semibold uppercase tracking-[0.08em] mb-2 flex items-center gap-1.5" style={{ color: 'var(--color-obs-text-muted)' }}>
                    <Send size={11} />
                    送信ラウンド一覧
                  </div>
                  <div className="rounded-[10px] overflow-hidden" style={{ backgroundColor: 'var(--color-obs-surface-low)', boxShadow: 'inset 0 0 0 1px rgba(109,106,111,0.10)' }}>
                    {campaign.sends.map((r, i) => {
                      const rClicks = totalClicks(r.links)
                      return (
                        <div
                          key={r.round}
                          className="grid items-center gap-3 px-3 py-2.5"
                          style={{
                            gridTemplateColumns: '60px 1.6fr 1fr 0.7fr 0.7fr',
                            borderBottom: i < campaign.sends.length - 1 ? '1px solid rgba(109,106,111,0.10)' : undefined,
                          }}
                        >
                          <span className="text-[11px] font-bold tabular-nums" style={{ color: 'var(--color-obs-primary)' }}>
                            {r.round}回目
                          </span>
                          <div className="min-w-0">
                            <div className="text-[12px] font-medium truncate" style={{ color: 'var(--color-obs-text)' }}>{r.subject}</div>
                            <div className="text-[10.5px]" style={{ color: 'var(--color-obs-text-subtle)' }}>
                              {r.sentAt} · 対象: {FILTER_LABEL[r.filter]}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-[12px] font-bold tabular-nums" style={{ color: 'var(--color-obs-text)' }}>{r.recipients.toLocaleString()}</div>
                            <div className="text-[9.5px]" style={{ color: 'var(--color-obs-text-subtle)' }}>送信数</div>
                          </div>
                          <div className="text-right">
                            <div className="text-[12px] font-bold tabular-nums" style={{ color: rClicks ? 'var(--color-obs-low)' : 'var(--color-obs-text-subtle)' }}>{rClicks.toLocaleString()}</div>
                            <div className="text-[9.5px]" style={{ color: 'var(--color-obs-text-subtle)' }}>クリック数</div>
                          </div>
                          <div className="text-right">
                            <div className="text-[12px] font-bold tabular-nums" style={{ color: r.metrics.replied ? '#6ee7a1' : 'var(--color-obs-text-subtle)' }}>{r.metrics.replied.toLocaleString()}</div>
                            <div className="text-[9.5px]" style={{ color: 'var(--color-obs-text-subtle)' }}>返信数</div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* 個別リンク一覧: 各回スコープ時のみ */}
              {scope !== 'total' && view.links && view.links.length > 0 && (
                <div>
                  <div className="text-[10.5px] font-semibold uppercase tracking-[0.08em] mb-2 flex items-center gap-1.5" style={{ color: 'var(--color-obs-text-muted)' }}>
                    <Link2 size={11} />
                    {scope}回目に挿入したリンクごとのクリック数
                  </div>
                  <div className="rounded-[10px] overflow-hidden" style={{ backgroundColor: 'var(--color-obs-surface-low)', boxShadow: 'inset 0 0 0 1px rgba(109,106,111,0.10)' }}>
                    {view.links.map((l, i) => {
                      const meta = KIND_META[l.kind]
                      const Icon = meta.icon
                      return (
                        <div
                          key={l.id}
                          className="grid items-center gap-3 px-3 py-2.5"
                          style={{
                            gridTemplateColumns: '90px 1fr 70px',
                            borderBottom: i < view.links!.length - 1 ? '1px solid rgba(109,106,111,0.10)' : undefined,
                          }}
                        >
                          <div className="flex items-center gap-1.5">
                            <Icon size={11} style={{ color: meta.color }} />
                            <span className="text-[10.5px] font-semibold" style={{ color: meta.color }}>{meta.label}</span>
                          </div>
                          <div className="min-w-0">
                            <div className="text-[12.5px] font-medium truncate" style={{ color: 'var(--color-obs-text)' }}>{l.label}</div>
                            <div className="text-[10.5px] truncate" style={{ color: 'var(--color-obs-text-subtle)' }}>{l.originalUrl}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-[14px] font-bold tabular-nums" style={{ color: l.clicks ? meta.color : 'var(--color-obs-text-subtle)' }}>
                              {l.clicks.toLocaleString()}
                            </div>
                            <div className="text-[9.5px]" style={{ color: 'var(--color-obs-text-subtle)' }}>クリック</div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* 件名 / 本文: 各回スコープ時のみ */}
              {scope !== 'total' && view.subject && view.body && (
                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <div className="text-[10.5px] font-semibold uppercase tracking-[0.08em] mb-1.5" style={{ color: 'var(--color-obs-text-muted)' }}>件名 ({scope}回目)</div>
                    <div
                      className="rounded-[8px] px-3 py-2.5 text-[12.5px]"
                      style={{ backgroundColor: 'var(--color-obs-surface-low)', color: 'var(--color-obs-text)' }}
                    >{view.subject}</div>
                  </div>
                  <div>
                    <div className="text-[10.5px] font-semibold uppercase tracking-[0.08em] mb-1.5" style={{ color: 'var(--color-obs-text-muted)' }}>本文 ({scope}回目)</div>
                    <div
                      className="rounded-[8px] px-3 py-2.5 text-[12.5px] whitespace-pre-line leading-[1.7]"
                      style={{ backgroundColor: 'var(--color-obs-surface-low)', color: 'var(--color-obs-text)' }}
                    >{view.body}</div>
                  </div>
                </div>
              )}

              {/* GA連動メモ + 再送信ボタン */}
              <div className="flex items-start gap-3 flex-wrap">
                <div
                  className="flex items-start gap-2 rounded-[8px] px-3 py-2.5 text-[11.5px] leading-[1.6] flex-1 min-w-[280px]"
                  style={{ backgroundColor: 'rgba(255,184,107,0.08)', boxShadow: 'inset 0 0 0 1px rgba(255,184,107,0.18)', color: 'var(--color-obs-text)' }}
                >
                  <BarChart3 size={13} style={{ color: 'var(--color-obs-middle)' }} className="shrink-0 mt-0.5" />
                  <span><strong>HP訪問からの CVR 計測は Google Analytics 側で参照</strong></span>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    onResend(campaign, scope === 'total' ? (last?.round ?? 1) : scope)
                  }}
                  className="inline-flex items-center gap-1.5 h-9 px-4 rounded-[var(--radius-obs-md)] text-[12px] font-semibold transition-colors whitespace-nowrap"
                  style={{
                    background: 'linear-gradient(140deg, var(--color-obs-primary) 0%, var(--color-obs-primary-container) 100%)',
                    color: 'var(--color-obs-on-primary)',
                  }}
                >
                  <Send size={12} />
                  {scope === 'total' ? '次のラウンドを送信' : `${scope}回目から再送信`}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function ScopeTab({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="h-7 px-3 rounded-[6px] text-[11.5px] font-semibold transition-colors whitespace-nowrap"
      style={{
        backgroundColor: active ? 'var(--color-obs-surface-highest)' : 'transparent',
        color: active ? 'var(--color-obs-text)' : 'var(--color-obs-text-muted)',
        boxShadow: active ? 'inset 0 0 0 1px rgba(171,199,255,0.18)' : 'none',
      }}
    >
      {children}
    </button>
  )
}

// ─── Gmail 連携状態フック ───────────────────────────────────────────────

interface GmailStatus {
  connected: boolean
  available: boolean
  email?: string
}

function useGmailStatus(): GmailStatus | null {
  const [status, setStatus] = useState<GmailStatus | null>(null)
  if (typeof window !== 'undefined' && status === null) {
    fetch('/api/google/status', { credentials: 'include' })
      .then((r) => r.json())
      .then((data) => {
        if (!data?.connected) {
          setStatus({ connected: false, available: false })
        } else {
          setStatus({
            connected: true,
            available: !!data.services?.gmail?.available,
            email: data.email,
          })
        }
      })
      .catch(() => setStatus({ connected: false, available: false }))
  }
  return status
}

// ─── 新規配信モーダル ───────────────────────────────────────────────────

type SendState =
  | { kind: 'idle' }
  | { kind: 'drafting' }
  | { kind: 'draft_ready'; webUrl: string }
  | { kind: 'confirming' }
  | { kind: 'sending' }
  | { kind: 'sent'; total: number; sent: number; failed: number }
  | { kind: 'error'; message: string }

function NewCampaignModal({
  onClose,
  onCreate,
  onAddRound,
  initialFrom,
  fromRound,
}: {
  onClose: () => void
  /** 新規作成時 */
  onCreate: (c: MailCampaign) => void
  /** 再送信(=既存キャンペーンに新ラウンド追加) */
  onAddRound: (campaignId: string, round: SendRound) => void
  initialFrom?: MailCampaign | null
  /** 引き継ぎ元のラウンド番号 (再送信時のみ) */
  fromRound?: number | null
}) {
  // 引き継ぎ元のラウンド (なければ最新)
  const sourceRound = initialFrom
    ? (initialFrom.sends.find((r) => r.round === fromRound) ?? latestRound(initialFrom))
    : null

  const findFirst = (kind: 'homepage' | 'schedule' | 'doc') =>
    sourceRound?.links.find((l) => l.kind === kind)

  type ExtraLinkDraft = { id: string; label: string; url: string }

  const [name, setName] = useState(initialFrom?.name ?? '')
  const [subject, setSubject] = useState(sourceRound?.subject ?? '')
  const [body, setBody] = useState(sourceRound?.body ?? '')
  const [listId, setListId] = useState<string>(initialFrom?.listId ?? AVAILABLE_LISTS[0]?.id ?? '')
  const [hpLabel, setHpLabel] = useState(findFirst('homepage')?.label ?? '')
  const [hpUrl, setHpUrl] = useState(findFirst('homepage')?.originalUrl ?? '')
  const [scheduleLabel, setScheduleLabel] = useState(findFirst('schedule')?.label ?? '')
  const [scheduleUrl, setScheduleUrl] = useState(findFirst('schedule')?.originalUrl ?? '')
  const [docLabel, setDocLabel] = useState(findFirst('doc')?.label ?? '')
  const [docUrl, setDocUrl] = useState(findFirst('doc')?.originalUrl ?? '')
  const [extraLinks, setExtraLinks] = useState<ExtraLinkDraft[]>(
    () => (sourceRound?.links ?? [])
      .filter((l) => l.kind === 'other')
      .map((l, i) => ({ id: `extra-${Date.now()}-${i}`, label: l.label, url: l.originalUrl }))
  )

  const [resendFilter, setResendFilter] = useState<ResendFilterKind>(
    initialFrom ? 'no_click' : 'all'
  )

  const [sendState, setSendState] = useState<SendState>({ kind: 'idle' })

  const gmail = useGmailStatus()
  const list = AVAILABLE_LISTS.find((l) => l.id === listId)
  const canCompose = !!(subject.trim() && body.trim() && list)
  const canSend = !!(name.trim() && canCompose && gmail?.available)

  // 再送信フィルタ別の推定件数 (引き継ぎ元ラウンドの実績で計算)
  const filterCounts = (() => {
    if (!initialFrom || !list || !sourceRound) return null
    const total = initialFrom.totalRecipients
    const clicked = totalClicks(sourceRound.links)
    const replied = sourceRound.metrics.replied
    return {
      all: total,
      no_click: Math.max(0, total - clicked),
      no_reply: Math.max(0, total - replied),
    }
  })()
  const targetCount = filterCounts ? filterCounts[resendFilter] : list?.recipientCount ?? 0
  const nextRoundNo = initialFrom ? initialFrom.sends.length + 1 : 1

  const addExtraLink = () => {
    setExtraLinks((prev) => [...prev, { id: `extra-${Date.now()}`, label: '', url: '' }])
  }
  const updateExtraLink = (id: string, patch: Partial<ExtraLinkDraft>) => {
    setExtraLinks((prev) => prev.map((l) => (l.id === id ? { ...l, ...patch } : l)))
  }
  const removeExtraLink = (id: string) => {
    setExtraLinks((prev) => prev.filter((l) => l.id !== id))
  }

  // 入力されたリンクを CampaignLink[] に正規化
  const buildCampaignLinks = (campaignId: string): CampaignLink[] => {
    const out: CampaignLink[] = []
    if (hpUrl.trim()) {
      const id = `${campaignId}-hp`
      out.push({ id, kind: 'homepage', label: hpLabel.trim() || 'HPリンク', originalUrl: hpUrl.trim(), trackingUrl: `https://track.bgm.app/c/${id}`, clicks: 0 })
    }
    if (scheduleUrl.trim()) {
      const id = `${campaignId}-sc`
      out.push({ id, kind: 'schedule', label: scheduleLabel.trim() || '日程調整リンク', originalUrl: scheduleUrl.trim(), trackingUrl: `https://track.bgm.app/c/${id}`, clicks: 0 })
    }
    if (docUrl.trim()) {
      const id = `${campaignId}-doc`
      out.push({ id, kind: 'doc', label: docLabel.trim() || '資料リンク', originalUrl: docUrl.trim(), trackingUrl: `https://track.bgm.app/c/${id}`, clicks: 0 })
    }
    // 追加リンクは「その他」種別固定 (種別判別UIなし)
    extraLinks.forEach((l, i) => {
      if (!l.url.trim()) return
      const id = `${campaignId}-ex${i + 1}`
      out.push({ id, kind: 'other', label: l.label.trim() || `追加リンク ${i + 1}`, originalUrl: l.url.trim(), trackingUrl: `https://track.bgm.app/c/${id}`, clicks: 0 })
    })
    return out
  }

  // Gmail 下書き作成 → Web UI を新タブで開く
  const handlePreviewInGmail = async () => {
    if (!canCompose) return
    setSendState({ kind: 'drafting' })
    try {
      // プレビューでも本番送信と同じ中継URL置換を反映するため、links を渡す
      const previewLinks = buildCampaignLinks('preview')
      const res = await fetch('/api/mail/draft', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: subject.trim(),
          body: body.trim(),
          links: previewLinks.map((l) => ({ kind: l.kind, label: l.label, trackingUrl: l.trackingUrl })),
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.message ?? data?.error ?? '下書き作成に失敗しました')
      window.open(data.webUrl, '_blank', 'noopener,noreferrer')
      setSendState({ kind: 'draft_ready', webUrl: data.webUrl })
    } catch (err) {
      setSendState({ kind: 'error', message: err instanceof Error ? err.message : String(err) })
    }
  }

  // 一括送信 (1人ずつ個別送信)
  const handleSendBulk = async () => {
    if (!canSend || !list) return
    setSendState({ kind: 'sending' })
    try {
      const tempId = initialFrom ? `${initialFrom.id}-r${nextRoundNo}` : `cmp-${Date.now()}`
      const links = buildCampaignLinks(tempId)
      const res = await fetch('/api/mail/send-bulk', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: subject.trim(),
          body: body.trim(),
          links: links.map((l) => ({ kind: l.kind, label: l.label, trackingUrl: l.trackingUrl })),
          campaignName: name.trim(),
          listId: list.id,
          recipients: [],
          resendFromCampaignId: initialFrom?.id ?? null,
          resendFromRound: initialFrom ? (sourceRound?.round ?? null) : null,
          resendFilter: initialFrom ? resendFilter : null,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.message ?? data?.error ?? '送信に失敗しました')

      const now = new Date()
      const sentAt = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
      const finalCount = data.total ?? targetCount

      if (initialFrom) {
        // 既存キャンペーンに新ラウンドを追加
        const newRound: SendRound = {
          round: nextRoundNo,
          sentAt,
          subject: subject.trim(),
          body: body.trim(),
          recipients: finalCount,
          filter: resendFilter,
          links,
          metrics: { replied: 0 },
        }
        onAddRound(initialFrom.id, newRound)
      } else {
        // 新規キャンペーン (1回目)
        const campaignId = `cmp-${Date.now()}`
        const newCampaign: MailCampaign = {
          id: campaignId,
          name: name.trim(),
          listId: list.id,
          listName: list.name,
          totalRecipients: finalCount,
          status: 'sent',
          createdAt: sentAt.slice(0, 10),
          sends: [
            {
              round: 1,
              sentAt,
              subject: subject.trim(),
              body: body.trim(),
              recipients: finalCount,
              filter: 'all',
              links,
              metrics: { replied: 0 },
            },
          ],
        }
        onCreate(newCampaign)
      }

      setSendState({
        kind: 'sent',
        total: finalCount,
        sent: data.sent ?? 0,
        failed: data.failed?.length ?? 0,
      })
    } catch (err) {
      setSendState({ kind: 'error', message: err instanceof Error ? err.message : String(err) })
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-6"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.96 }}
        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
        onClick={(e) => e.stopPropagation()}
        className="rounded-[var(--radius-obs-xl)] w-full max-w-[640px] max-h-[88vh] overflow-hidden flex flex-col"
        style={{
          backgroundColor: 'var(--color-obs-surface-high)',
          boxShadow: '0 24px 80px rgba(0,0,0,0.5), inset 0 0 0 1px rgba(109,106,111,0.18)',
        }}
      >
        <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(109,106,111,0.18)' }}>
          <div>
            <div className="text-[10.5px] uppercase tracking-[0.08em]" style={{ color: 'var(--color-obs-text-subtle)' }}>Marketing</div>
            <h3 className="text-[16px] font-bold mt-0.5" style={{ color: 'var(--color-obs-text)' }}>
              {initialFrom
                ? `${initialFrom.name} に ${nextRoundNo} 回目を送信`
                : '新規配信を作成'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-[8px] flex items-center justify-center transition-colors hover:bg-[rgba(171,199,255,0.08)]"
          >
            <X size={16} style={{ color: 'var(--color-obs-text-muted)' }} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          <Field label="配信名（社内管理用）">
            <ObsInput value={name} onChange={(e) => setName(e.target.value)} placeholder="例: 4月度 サービス紹介一斉配信" />
          </Field>

          <Field label="配信先リスト">
            <select
              value={listId}
              onChange={(e) => setListId(e.target.value)}
              disabled={!!initialFrom}
              className="w-full h-10 px-3 rounded-[8px] text-[13px] outline-none disabled:opacity-60 disabled:cursor-not-allowed"
              style={{
                backgroundColor: 'var(--color-obs-surface-low)',
                color: 'var(--color-obs-text)',
                boxShadow: 'inset 0 0 0 1px rgba(109,106,111,0.18)',
              }}
            >
              {AVAILABLE_LISTS.map((l) => (
                <option key={l.id} value={l.id}>{l.name} ({l.recipientCount.toLocaleString()}件)</option>
              ))}
            </select>
            {initialFrom && (
              <p className="text-[10.5px] mt-1" style={{ color: 'var(--color-obs-text-subtle)' }}>
                同じシリーズ内では配信先リストは変更できません
              </p>
            )}
          </Field>

          {/* 再送信時のみ: 送信対象フィルタ */}
          {initialFrom && filterCounts && (
            <Field label="送信対象">
              <div className="space-y-1.5">
                {([
                  { key: 'all',         label: '完全に同じ受信者へ再送', desc: '前回の宛先全員' },
                  { key: 'no_click',    label: 'リンク未クリックの人へ', desc: '前回メール内のリンクをクリックしなかった受信者' },
                  { key: 'no_reply',    label: '未返信の人へ',           desc: '前回返信しなかった受信者' },
                ] as const).map((opt) => {
                  const active = resendFilter === opt.key
                  const count = filterCounts[opt.key]
                  return (
                    <button
                      key={opt.key}
                      type="button"
                      onClick={() => setResendFilter(opt.key)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-[8px] transition-all text-left"
                      style={{
                        backgroundColor: active ? 'rgba(171,199,255,0.10)' : 'var(--color-obs-surface-low)',
                        boxShadow: active
                          ? 'inset 0 0 0 1.5px var(--color-obs-primary)'
                          : 'inset 0 0 0 1px rgba(109,106,111,0.18)',
                      }}
                    >
                      <div
                        className="w-4 h-4 rounded-full flex items-center justify-center shrink-0"
                        style={{
                          boxShadow: active
                            ? 'inset 0 0 0 1.5px var(--color-obs-primary)'
                            : 'inset 0 0 0 1.5px rgba(109,106,111,0.30)',
                        }}
                      >
                        {active && (
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--color-obs-primary)' }} />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div
                          className="text-[12.5px] font-semibold"
                          style={{ color: active ? 'var(--color-obs-primary)' : 'var(--color-obs-text)' }}
                        >
                          {opt.label}
                        </div>
                        <div className="text-[11px] mt-0.5" style={{ color: 'var(--color-obs-text-muted)' }}>
                          {opt.desc}
                        </div>
                      </div>
                      <span
                        className="text-[12px] font-bold tabular-nums shrink-0"
                        style={{ color: active ? 'var(--color-obs-primary)' : 'var(--color-obs-text-muted)' }}
                      >
                        {count.toLocaleString()} 件
                      </span>
                    </button>
                  )
                })}
              </div>
              <p className="text-[10.5px] mt-1.5" style={{ color: 'var(--color-obs-text-subtle)' }}>
                {sourceRound?.round}回目の送信履歴をもとに送信対象を絞り込みます
              </p>
            </Field>
          )}

          <Field label="件名">
            <ObsInput
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="メールの件名"
              name="email-subject"
            />
          </Field>

          <Field label="本文">
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={8}
              placeholder="本文を入力..."
              className="w-full px-3 py-2.5 rounded-[8px] text-[13px] outline-none resize-y leading-[1.7]"
              style={{
                backgroundColor: 'var(--color-obs-surface-low)',
                color: 'var(--color-obs-text)',
                boxShadow: 'inset 0 0 0 1px rgba(109,106,111,0.18)',
                whiteSpace: 'pre-wrap',
              }}
              wrap="soft"
            />
            <p className="text-[10.5px] mt-1.5" style={{ color: 'var(--color-obs-text-subtle)' }}>
              ここで改行した通りにメールに反映されます (空行を含めて維持)
            </p>
          </Field>

          {/* リンク管理 */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[10.5px] font-semibold uppercase tracking-[0.06em]" style={{ color: 'var(--color-obs-text-muted)' }}>追跡リンク</label>
              <span className="text-[10.5px]" style={{ color: 'var(--color-obs-text-subtle)' }}>登録したリンクは送信時に中継URLに置換されてクリック計測されます</span>
            </div>

            <div className="space-y-2.5">
              {/* HPリンク */}
              <div className="rounded-[10px] p-3" style={{ backgroundColor: 'var(--color-obs-surface-low)', boxShadow: 'inset 0 0 0 1px rgba(109,106,111,0.18)' }}>
                <div className="flex items-center gap-1.5 mb-2">
                  <Globe size={12} style={{ color: 'var(--color-obs-low)' }} />
                  <span className="text-[11px] font-semibold" style={{ color: 'var(--color-obs-low)' }}>HPリンク</span>
                </div>
                <div className="grid grid-cols-[1fr_2fr] gap-2">
                  <ObsInput value={hpLabel} onChange={(e) => setHpLabel(e.target.value)} placeholder="表示テキスト (例: サービス詳細)" />
                  <ObsInput value={hpUrl} onChange={(e) => setHpUrl(e.target.value)} placeholder="https://bgm.app/" />
                </div>
              </div>

              {/* 日程調整リンク */}
              <div className="rounded-[10px] p-3" style={{ backgroundColor: 'var(--color-obs-surface-low)', boxShadow: 'inset 0 0 0 1px rgba(109,106,111,0.18)' }}>
                <div className="flex items-center gap-1.5 mb-2">
                  <CalendarClock size={12} style={{ color: '#6ee7a1' }} />
                  <span className="text-[11px] font-semibold" style={{ color: '#6ee7a1' }}>日程調整リンク</span>
                </div>
                <div className="grid grid-cols-[1fr_2fr] gap-2">
                  <ObsInput value={scheduleLabel} onChange={(e) => setScheduleLabel(e.target.value)} placeholder="表示テキスト (例: 30分のお打合せ)" />
                  <ObsInput value={scheduleUrl} onChange={(e) => setScheduleUrl(e.target.value)} placeholder="https://timerex.net/..." />
                </div>
              </div>

              {/* 資料リンク */}
              <div className="rounded-[10px] p-3" style={{ backgroundColor: 'var(--color-obs-surface-low)', boxShadow: 'inset 0 0 0 1px rgba(109,106,111,0.18)' }}>
                <div className="flex items-center gap-1.5 mb-2">
                  <FileText size={12} style={{ color: 'var(--color-obs-middle)' }} />
                  <span className="text-[11px] font-semibold" style={{ color: 'var(--color-obs-middle)' }}>資料リンク</span>
                </div>
                <div className="grid grid-cols-[1fr_2fr] gap-2">
                  <ObsInput value={docLabel} onChange={(e) => setDocLabel(e.target.value)} placeholder="表示テキスト (例: サービス紹介資料)" />
                  <ObsInput value={docUrl} onChange={(e) => setDocUrl(e.target.value)} placeholder="https://track.bgm.app/d/..." />
                </div>
              </div>

              {/* 追加リンク (種別なし・自由テキスト) */}
              {extraLinks.map((l) => (
                <div key={l.id} className="rounded-[10px] p-3" style={{ backgroundColor: 'var(--color-obs-surface-low)', boxShadow: 'inset 0 0 0 1px rgba(109,106,111,0.18)' }}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold" style={{ color: 'var(--color-obs-text-muted)' }}>
                      <Link2 size={12} />
                      追加リンク
                    </span>
                    <button
                      type="button"
                      onClick={() => removeExtraLink(l.id)}
                      className="w-6 h-6 rounded-[6px] flex items-center justify-center transition-colors hover:bg-[rgba(255,107,107,0.12)]"
                      title="削除"
                    >
                      <X size={11} style={{ color: 'var(--color-obs-hot)' }} />
                    </button>
                  </div>
                  <div className="grid grid-cols-[1fr_2fr] gap-2">
                    <ObsInput value={l.label} onChange={(e) => updateExtraLink(l.id, { label: e.target.value })} placeholder="表示テキスト" />
                    <ObsInput value={l.url} onChange={(e) => updateExtraLink(l.id, { url: e.target.value })} placeholder="https://..." />
                  </div>
                </div>
              ))}

              <ObsButton variant="ghost" onClick={addExtraLink}>
                <Plus size={12} />
                リンクを追加
              </ObsButton>
            </div>
          </div>
        </div>

        {/* Gmail 連携ステータス & 注意書き */}
        <div className="px-6 py-3 space-y-2.5" style={{ borderTop: '1px solid rgba(109,106,111,0.18)', backgroundColor: 'var(--color-obs-surface-low)' }}>
          {gmail?.available ? (
            <div className="flex items-center justify-between text-[11.5px]">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#6ee7a1' }} />
                <span style={{ color: 'var(--color-obs-text)' }}>
                  Gmail 連携済み <span style={{ color: 'var(--color-obs-text-muted)' }}>({gmail.email})</span>
                </span>
              </div>
            </div>
          ) : (
            <div
              className="flex items-center justify-between gap-3 rounded-[8px] px-3 py-2.5"
              style={{
                backgroundColor: 'rgba(255,184,107,0.08)',
                boxShadow: 'inset 0 0 0 1px rgba(255,184,107,0.28)',
              }}
            >
              <div className="flex items-center gap-2 text-[12px]" style={{ color: 'var(--color-obs-text)' }}>
                <AlertTriangle size={13} style={{ color: 'var(--color-obs-middle)' }} />
                <span>送信するには <strong>Gmail との連携</strong>が必要です</span>
              </div>
              <a
                href="/settings/integrations"
                className="inline-flex items-center gap-1.5 h-8 px-3 rounded-[var(--radius-obs-md)] text-[12px] font-semibold transition-colors whitespace-nowrap shrink-0"
                style={{
                  backgroundColor: 'var(--color-obs-primary-container)',
                  color: 'var(--color-obs-on-primary)',
                }}
              >
                <Link2 size={12} />
                連携する
              </a>
            </div>
          )}
          {sendState.kind === 'draft_ready' && (
            <div className="flex items-center gap-2 text-[11.5px] rounded-[8px] px-3 py-2" style={{ backgroundColor: 'rgba(171,199,255,0.12)', color: 'var(--color-obs-primary)' }}>
              <ExternalLink size={12} />
              <span>Gmail に下書きを作成しました。新しいタブで確認してください。</span>
              <a href={sendState.webUrl} target="_blank" rel="noreferrer" className="ml-auto underline font-semibold">再度開く</a>
            </div>
          )}
          {sendState.kind === 'sent' && (
            <div className="flex items-center gap-2 text-[11.5px] rounded-[8px] px-3 py-2" style={{ backgroundColor: 'rgba(110,231,161,0.10)', color: '#6ee7a1' }}>
              <CheckCircle2 size={12} />
              <span>送信完了：{sendState.sent} / {sendState.total} 通{sendState.failed > 0 ? `（失敗 ${sendState.failed} 件）` : ''}</span>
            </div>
          )}
          {sendState.kind === 'error' && (
            <div className="flex items-center gap-2 text-[11.5px] rounded-[8px] px-3 py-2" style={{ backgroundColor: 'rgba(255,107,107,0.10)', color: 'var(--color-obs-hot)' }}>
              <AlertTriangle size={12} />
              <span>{sendState.message}</span>
            </div>
          )}
        </div>

        <div className="px-6 py-4 flex items-center justify-between gap-2" style={{ borderTop: '1px solid rgba(109,106,111,0.18)' }}>
          <ObsButton variant="ghost" onClick={onClose}>閉じる</ObsButton>
          <div className="flex items-center gap-2">
            <ObsButton
              variant="ghost"
              onClick={handlePreviewInGmail}
              disabled={!canCompose || sendState.kind === 'drafting' || sendState.kind === 'sending'}
              className="inline-flex items-center justify-center gap-1.5 whitespace-nowrap"
            >
              {sendState.kind === 'drafting'
                ? <Loader2 size={13} className="animate-spin" />
                : <ExternalLink size={13} />}
              Gmailで本文を確認
            </ObsButton>
            <ObsButton
              variant="primary"
              onClick={() => setSendState({ kind: 'confirming' })}
              disabled={!canSend || sendState.kind === 'sending' || sendState.kind === 'sent'}
              className="inline-flex items-center justify-center gap-1.5 whitespace-nowrap"
            >
              {sendState.kind === 'sending'
                ? <Loader2 size={13} className="animate-spin" />
                : <Send size={13} />}
              一括送信
            </ObsButton>
          </div>
        </div>
      </motion.div>

      {/* 確認ダイアログ */}
      <AnimatePresence>
        {sendState.kind === 'confirming' && list && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-6"
            style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}
            onClick={() => setSendState({ kind: 'idle' })}
          >
            <motion.div
              initial={{ scale: 0.94, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.94, opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="rounded-[14px] w-full max-w-[440px] overflow-hidden"
              style={{
                backgroundColor: 'var(--color-obs-surface-high)',
                boxShadow: '0 24px 80px rgba(0,0,0,0.55), inset 0 0 0 1px rgba(109,106,111,0.18)',
              }}
            >
              <div className="px-5 pt-5 pb-3">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(171,199,255,0.14)' }}>
                    <Send size={15} style={{ color: 'var(--color-obs-primary)' }} />
                  </div>
                  <h4 className="text-[15px] font-bold" style={{ color: 'var(--color-obs-text)' }}>一括送信の最終確認</h4>
                </div>
                <p className="text-[12.5px] leading-[1.7]" style={{ color: 'var(--color-obs-text)' }}>
                  リスト「<strong>{list.name}</strong>」の
                  {initialFrom && resendFilter !== 'all' && (
                    <>
                      {' '}うち{' '}
                      <strong>
                        {resendFilter === 'no_click' && 'リンク未クリック'}
                        {resendFilter === 'no_reply' && '未返信'}
                      </strong>
                      の{' '}
                    </>
                  )}
                  <strong>{targetCount.toLocaleString()} 件</strong>に対して、
                  <strong>1 通ずつ個別送信</strong>します。
                </p>
                <p className="text-[11.5px] mt-2 leading-[1.6]" style={{ color: 'var(--color-obs-text-muted)' }}>
                  受信者の To には自分の宛先のみが表示され、他の受信者は見えません。
                  実行すると取り消せません。
                </p>
              </div>
              <div className="px-5 py-3 flex items-center justify-end gap-2" style={{ borderTop: '1px solid rgba(109,106,111,0.18)' }}>
                <ObsButton variant="ghost" onClick={() => setSendState({ kind: 'idle' })}>キャンセル</ObsButton>
                <ObsButton variant="primary" onClick={handleSendBulk}>
                  <Send size={13} />
                  送信を実行
                </ObsButton>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-[10.5px] font-semibold uppercase tracking-[0.06em] mb-1.5 block" style={{ color: 'var(--color-obs-text-muted)' }}>{label}</label>
      {children}
    </div>
  )
}


// ─── メイン ────────────────────────────────────────────────────────────────

export function CampaignsView() {
  const router = useRouter()
  const [campaigns, setCampaigns] = useState<MailCampaign[]>(MOCK_CAMPAIGNS)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [showNew, setShowNew] = useState(false)
  const [resendFrom, setResendFrom] = useState<MailCampaign | null>(null)
  const [resendFromRound, setResendFromRound] = useState<number | null>(null)

  const handleResend = (c: MailCampaign, fromRound: number) => {
    setResendFrom(c)
    setResendFromRound(fromRound)
    setShowNew(true)
  }
  const closeModal = () => {
    setShowNew(false)
    setResendFrom(null)
    setResendFromRound(null)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-[15px] font-semibold" style={{ color: 'var(--color-obs-text)' }}>各配信一覧</h3>
          <p className="text-[11px] mt-0.5" style={{ color: 'var(--color-obs-text-muted)' }}>送信 / リンククリック (内訳: 日程調整 / HP / 資料 / その他) / 返信 をファーストパーティで計測（CVR は GA 側で参照）</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => router.push('/contacts')}
            className="h-9 px-4 text-sm rounded-[var(--radius-obs-md)] font-medium tracking-[-0.01em] inline-flex items-center transition-all duration-200"
            style={{
              backgroundColor: 'rgba(255,184,107,0.12)',
              color: 'var(--color-obs-middle)',
              boxShadow: 'inset 0 0 0 1px rgba(255,184,107,0.42)',
            }}
            onMouseOver={(e) => {
              ;(e.currentTarget as HTMLButtonElement).style.backgroundColor = 'rgba(255,184,107,0.20)'
            }}
            onMouseOut={(e) => {
              ;(e.currentTarget as HTMLButtonElement).style.backgroundColor = 'rgba(255,184,107,0.12)'
            }}
          >
            <List size={14} className="mr-1.5 inline" strokeWidth={2.5} />
            ISリスト作成
          </button>
          <ObsButton variant="primary" onClick={() => { setResendFrom(null); setResendFromRound(null); setShowNew(true) }} className="inline-flex items-center justify-center gap-1.5 whitespace-nowrap">
            <Plus size={13} />
            新規配信
          </ObsButton>
        </div>
      </div>

      <div className="space-y-3">
        {campaigns.map((c) => (
          <CampaignFunnelCard
            key={c.id}
            campaign={c}
            expanded={expandedId === c.id}
            onToggle={() => setExpandedId((cur) => (cur === c.id ? null : c.id))}
            onResend={handleResend}
          />
        ))}
      </div>

      <AnimatePresence>
        {showNew && (
          <NewCampaignModal
            initialFrom={resendFrom}
            fromRound={resendFromRound}
            onClose={closeModal}
            onCreate={(c) => {
              setCampaigns((prev) => [c, ...prev])
              closeModal()
            }}
            onAddRound={(campaignId, round) => {
              setCampaigns((prev) => prev.map((c) =>
                c.id === campaignId ? { ...c, sends: [...c.sends, round] } : c,
              ))
              closeModal()
            }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
