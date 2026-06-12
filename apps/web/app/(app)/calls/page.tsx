'use client'

import { useEffect, useMemo, useState } from 'react'
import { Bot, CheckCircle2, History, Loader2, PhoneCall, Radio, Sparkles } from 'lucide-react'
import {
  OBS_PRODUCT_SURFACE,
  ObsButton,
  ObsChip,
  ObsHero,
  ObsPageShell,
} from '@/components/obsidian'

type AiCallResponse = {
  call?: {
    id: string
    callId: string
    status: string
    outcome: string
    summary: string | null
    transcript: string | null
    nextAction: string | null
    provider: string
    costHint?: string | null
  }
  error?: string
  message?: string
}

type RecentCall = {
  id: string
  callId: string
  title: string
  summary: string | null
  occurredAt: string
  companyName: string | null
  contactName: string | null
  contact: { id: string; name: string; phone: string | null } | null
  company: { id: string; name: string } | null
  deal: { id: string; name: string } | null
  metadata: {
    status: string
    outcome: string
    provider: string
    transcript?: string | null
    nextAction?: string | null
    recordingUrl?: string | null
  }
}

type Readiness = {
  provider: string
  ready: boolean
  missing: string[]
}

const FIELD_CLASS =
  'h-11 w-full rounded-[var(--radius-obs-md)] px-3 text-[13px] outline-none transition-colors'
const TEXTAREA_CLASS =
  'min-h-[112px] w-full rounded-[var(--radius-obs-md)] px-3 py-3 text-[13px] outline-none transition-colors resize-none'
const FIELD_STYLE = {
  background: 'rgba(8,9,12,0.72)',
  color: 'var(--color-obs-text)',
  boxShadow: 'inset 0 0 0 1px rgba(171,199,255,0.12)',
} as const
const CARD_STYLE = {
  background: OBS_PRODUCT_SURFACE.panel,
  boxShadow: OBS_PRODUCT_SURFACE.rim,
} as const

function formatDateTime(value: string) {
  const d = new Date(value)
  return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

function outcomeLabel(outcome: string) {
  const map: Record<string, string> = {
    connected: '接続',
    no_answer: '不通',
    callback_requested: '折り返し/次回対応',
    meeting_booked: 'アポ獲得',
    not_interested: '興味なし',
    do_not_call: 'コール不可',
    needs_human: '人へ引き継ぎ',
  }
  return map[outcome] ?? outcome
}

export default function CallsPage() {
  const [form, setForm] = useState({
    companyName: '',
    contactName: '',
    phone: '',
    purpose: '初回接点の確認',
    script:
      'ルキスマCRMの概要を30秒で伝え、現在の営業管理・議事録連携・問い合わせ対応の課題を確認する。',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastCall, setLastCall] = useState<AiCallResponse['call'] | null>(null)
  const [recentCalls, setRecentCalls] = useState<RecentCall[]>([])
  const [readiness, setReadiness] = useState<Readiness | null>(null)

  const canSubmit = useMemo(() => form.phone.trim().length > 0 && !loading, [form.phone, loading])

  async function loadRecent() {
    const res = await fetch('/api/ai-calls/recent', { cache: 'no-store' })
    if (!res.ok) return
    const json = (await res.json()) as { calls?: RecentCall[]; readiness?: Readiness }
    setRecentCalls(json.calls ?? [])
    setReadiness(json.readiness ?? null)
  }

  useEffect(() => {
    loadRecent().catch(() => {})
  }, [])

  async function startCall() {
    if (!canSubmit) return
    setLoading(true)
    setError(null)
    setLastCall(null)
    try {
      const res = await fetch('/api/ai-calls/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const json = (await res.json().catch(() => ({}))) as AiCallResponse
      if (!res.ok || !json.call) {
        throw new Error(json.message || json.error || 'AIコールを開始できませんでした')
      }
      setLastCall(json.call)
      await loadRecent()
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setLoading(false)
    }
  }

  return (
    <ObsPageShell>
      <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-8 px-8 py-10">
        <ObsHero
          eyebrow="AI CALL"
          title="AIコール"
          caption="ワンクリックで架電し、通話後の文字起こし・要約・ステータスをCRMに保存するMVPです。"
          action={
            <div className="flex items-center gap-2">
              <ObsChip tone={readiness?.ready ? 'low' : 'middle'}>
                {readiness?.provider ?? 'mock'}
              </ObsChip>
              <ObsChip tone={readiness?.ready ? 'low' : 'hot'}>
                {readiness?.ready ? '実行可能' : '設定確認'}
              </ObsChip>
            </div>
          }
        />

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_420px]">
          <section className="rounded-[var(--radius-obs-xl)] p-6" style={CARD_STYLE}>
            <div className="mb-6 flex items-start gap-3">
              <div
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[var(--radius-obs-lg)]"
                style={{
                  background: 'rgba(171,199,255,0.12)',
                  color: 'var(--color-obs-primary)',
                  boxShadow: 'inset 0 0 0 1px rgba(171,199,255,0.20)',
                }}
              >
                <PhoneCall size={20} />
              </div>
              <div>
                <h2 className="text-[18px] font-bold tracking-[-0.02em]">AIコールを開始</h2>
                <p className="mt-1 text-[13px]" style={{ color: 'var(--color-obs-text-muted)' }}>
                  実番号連携前でもMVP検証できるよう、未設定時はモックで通話結果を作成します。
                </p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-1.5">
                <span className="text-[12px] font-semibold" style={{ color: 'var(--color-obs-text-muted)' }}>
                  会社名
                </span>
                <input
                  className={FIELD_CLASS}
                  style={FIELD_STYLE}
                  value={form.companyName}
                  onChange={(e) => setForm((v) => ({ ...v, companyName: e.target.value }))}
                  placeholder="株式会社サンプル"
                />
              </label>
              <label className="space-y-1.5">
                <span className="text-[12px] font-semibold" style={{ color: 'var(--color-obs-text-muted)' }}>
                  担当者名
                </span>
                <input
                  className={FIELD_CLASS}
                  style={FIELD_STYLE}
                  value={form.contactName}
                  onChange={(e) => setForm((v) => ({ ...v, contactName: e.target.value }))}
                  placeholder="田中 太郎"
                />
              </label>
              <label className="space-y-1.5">
                <span className="text-[12px] font-semibold" style={{ color: 'var(--color-obs-text-muted)' }}>
                  電話番号 *
                </span>
                <input
                  className={FIELD_CLASS}
                  style={FIELD_STYLE}
                  value={form.phone}
                  onChange={(e) => setForm((v) => ({ ...v, phone: e.target.value }))}
                  placeholder="09012345678"
                />
              </label>
              <label className="space-y-1.5">
                <span className="text-[12px] font-semibold" style={{ color: 'var(--color-obs-text-muted)' }}>
                  目的
                </span>
                <input
                  className={FIELD_CLASS}
                  style={FIELD_STYLE}
                  value={form.purpose}
                  onChange={(e) => setForm((v) => ({ ...v, purpose: e.target.value }))}
                />
              </label>
            </div>

            <label className="mt-4 block space-y-1.5">
              <span className="text-[12px] font-semibold" style={{ color: 'var(--color-obs-text-muted)' }}>
                AIコールの方針
              </span>
              <textarea
                className={TEXTAREA_CLASS}
                style={FIELD_STYLE}
                value={form.script}
                onChange={(e) => setForm((v) => ({ ...v, script: e.target.value }))}
              />
            </label>

            {readiness && readiness.missing.length > 0 ? (
              <div
                className="mt-4 rounded-[var(--radius-obs-md)] px-3 py-2 text-[12px]"
                style={{
                  background: 'rgba(255,184,107,0.12)',
                  color: 'var(--color-obs-middle)',
                  boxShadow: 'inset 0 0 0 1px rgba(255,184,107,0.22)',
                }}
              >
                本番発信には {readiness.missing.join(', ')} が必要です。現在はMVP検証モードで動作します。
              </div>
            ) : null}

            {error ? (
              <div
                className="mt-4 rounded-[var(--radius-obs-md)] px-3 py-2 text-[12px]"
                style={{
                  background: 'rgba(255,107,107,0.12)',
                  color: 'var(--color-obs-hot)',
                  boxShadow: 'inset 0 0 0 1px rgba(255,107,107,0.22)',
                }}
              >
                {error}
              </div>
            ) : null}

            <div className="mt-6 flex items-center justify-end">
              <ObsButton size="lg" disabled={!canSubmit} onClick={startCall} className="inline-flex items-center gap-2">
                {loading ? <Loader2 size={15} className="animate-spin" /> : <Radio size={15} />}
                AIコール開始
              </ObsButton>
            </div>
          </section>

          <aside className="rounded-[var(--radius-obs-xl)] p-6" style={CARD_STYLE}>
            <div className="mb-4 flex items-center gap-2">
              <Sparkles size={16} style={{ color: 'var(--color-obs-primary)' }} />
              <h2 className="text-[16px] font-bold">直近の結果</h2>
            </div>

            {lastCall ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <ObsChip tone="low">
                    <CheckCircle2 size={12} />
                    {outcomeLabel(lastCall.outcome)}
                  </ObsChip>
                  <ObsChip tone="primary">{lastCall.provider}</ObsChip>
                </div>
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-[0.12em]" style={{ color: 'var(--color-obs-text-subtle)' }}>
                    Summary
                  </div>
                  <p className="mt-2 text-[13px] leading-relaxed" style={{ color: 'var(--color-obs-text)' }}>
                    {lastCall.summary}
                  </p>
                </div>
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-[0.12em]" style={{ color: 'var(--color-obs-text-subtle)' }}>
                    Next Action
                  </div>
                  <p className="mt-2 text-[13px] leading-relaxed" style={{ color: 'var(--color-obs-text-muted)' }}>
                    {lastCall.nextAction}
                  </p>
                </div>
                <pre
                  className="max-h-[220px] overflow-auto whitespace-pre-wrap rounded-[var(--radius-obs-md)] p-3 text-[12px] leading-relaxed"
                  style={{
                    background: 'rgba(8,9,12,0.72)',
                    color: 'var(--color-obs-text-muted)',
                    boxShadow: 'inset 0 0 0 1px rgba(171,199,255,0.10)',
                  }}
                >
                  {lastCall.transcript}
                </pre>
              </div>
            ) : (
              <div
                className="flex min-h-[320px] flex-col items-center justify-center gap-3 rounded-[var(--radius-obs-lg)] text-center"
                style={{ background: OBS_PRODUCT_SURFACE.inset }}
              >
                <Bot size={28} style={{ color: 'var(--color-obs-primary)' }} />
                <p className="max-w-[260px] text-[13px] leading-relaxed" style={{ color: 'var(--color-obs-text-muted)' }}>
                  左のフォームから開始すると、通話後の要約と文字起こしがここに表示されます。
                </p>
              </div>
            )}
          </aside>
        </div>

        <section className="rounded-[var(--radius-obs-xl)] p-6" style={CARD_STYLE}>
          <div className="mb-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <History size={16} style={{ color: 'var(--color-obs-primary)' }} />
              <h2 className="text-[16px] font-bold">AIコール履歴</h2>
            </div>
            <ObsButton variant="ghost" size="sm" onClick={loadRecent}>
              再読み込み
            </ObsButton>
          </div>

          {recentCalls.length === 0 ? (
            <div
              className="rounded-[var(--radius-obs-lg)] px-4 py-10 text-center text-[13px]"
              style={{ background: OBS_PRODUCT_SURFACE.inset, color: 'var(--color-obs-text-muted)' }}
            >
              AIコール履歴はまだありません。
            </div>
          ) : (
            <div className="space-y-3">
              {recentCalls.map((call) => (
                <article
                  key={call.id}
                  className="rounded-[var(--radius-obs-lg)] p-4"
                  style={{
                    background: 'rgba(14,15,18,0.72)',
                    boxShadow: 'inset 0 0 0 1px rgba(171,199,255,0.09)',
                  }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-[14px] font-semibold">
                          {call.companyName ?? '会社未設定'} / {call.contactName ?? '担当者未設定'}
                        </h3>
                        <ObsChip tone="low">{outcomeLabel(call.metadata.outcome)}</ObsChip>
                        <ObsChip tone="neutral">{call.metadata.provider}</ObsChip>
                      </div>
                      <p className="mt-2 text-[13px] leading-relaxed" style={{ color: 'var(--color-obs-text-muted)' }}>
                        {call.summary}
                      </p>
                      {call.metadata.nextAction ? (
                        <p className="mt-2 text-[12px]" style={{ color: 'var(--color-obs-primary)' }}>
                          次アクション: {call.metadata.nextAction}
                        </p>
                      ) : null}
                    </div>
                    <time className="shrink-0 text-[11px] tabular-nums" style={{ color: 'var(--color-obs-text-subtle)' }}>
                      {formatDateTime(call.occurredAt)}
                    </time>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </ObsPageShell>
  )
}
