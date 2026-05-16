'use client'

import { useEffect, useState } from 'react'
import {
  Calendar as CalendarLucide,
  Check,
  Cloud,
  FolderOpen,
  Hash,
  Link2,
  Loader2,
  Mail as MailLucide,
  MessageSquare as MessageSquareLucide,
  Plug,
  RefreshCw,
  Trash2,
  Users as UsersLucide,
  Video as VideoLucide,
  ShieldCheck,
  AlertCircle,
  Search,
  Settings as SettingsIcon,
  ClipboardList,
} from 'lucide-react'
import { ObsButton, ObsCard, ObsHero, ObsPageShell } from '@/components/obsidian'

type ServiceKey = 'gmail' | 'calendar' | 'meet' | 'chat'

interface ServiceState {
  available: boolean // OAuth スコープが取得済みか
  enabled: boolean // ユーザーが有効化しているか
  lastSyncAt: string | null
}

interface GoogleStatus {
  connected: boolean
  email?: string
  services?: Record<ServiceKey, ServiceState>
}

const SERVICE_DEFS: Array<{
  key: ServiceKey
  label: string
  icon: () => React.ReactNode
  description: string
}> = [
  {
    key: 'gmail',
    label: 'Gmail',
    icon: () => (
      <OfficialIcon
        src="/icons/gmail.png"
        alt="Gmail"
        fallback={<BrandedIcon Icon={MailLucide} color="#EA4335" bg="rgba(234,67,53,0.14)" />}
      />
    ),
    description: '送受信メールをコンタクトのメアドと一致させて取り込み',
  },
  {
    key: 'calendar',
    label: 'Google カレンダー',
    icon: () => (
      <OfficialIcon
        src="/icons/google-calendar.png"
        alt="Google Calendar"
        fallback={<BrandedIcon Icon={CalendarLucide} color="#4285F4" bg="rgba(66,133,244,0.14)" />}
      />
    ),
    description: '商談予定を取引・コンタクトに自動連携',
  },
  {
    key: 'meet',
    label: 'Google Meet（議事録）',
    icon: () => (
      <OfficialIcon
        src="/icons/google-meet.png"
        alt="Google Meet"
        fallback={<BrandedIcon Icon={VideoLucide} color="#00897B" bg="rgba(0,137,123,0.14)" />}
      />
    ),
    description: '文字起こし取得 → 商談ステージ自動遷移・n回目商談を自動カウント',
  },
  {
    key: 'chat',
    label: 'Google チャット',
    icon: () => (
      <OfficialIcon
        src="/icons/google-chat.png"
        alt="Google Chat"
        fallback={<BrandedIcon Icon={MessageSquareLucide} color="#34A853" bg="rgba(52,168,83,0.14)" />}
      />
    ),
    description: 'スペース・DM のメッセージをコンタクトに紐付け',
  },
]

export default function IntegrationsPage() {
  // 未連携メンバーがいる場合はメンバー連携状況タブを既定で開く
  const initialIncompleteCount = getIncompleteMemberCount()
  const [tab, setTab] = useState<'setup' | 'review'>(initialIncompleteCount > 0 ? 'review' : 'setup')
  const [status, setStatus] = useState<GoogleStatus | null>(null)
  const [busy, setBusy] = useState<ServiceKey | 'all' | null>(null)
  const [lastResult, setLastResult] = useState<unknown>(null)

  const refresh = async () => {
    const r = await fetch('/api/google/status')
    if (r.ok) setStatus(await r.json())
  }

  useEffect(() => {
    refresh()
  }, [])

  const sync = async (scope: ServiceKey | 'all') => {
    setBusy(scope)
    setLastResult(null)
    try {
      const r = await fetch(`/api/google/sync?scope=${scope}`, { method: 'POST' })
      setLastResult(await r.json())
      await refresh()
    } finally {
      setBusy(null)
    }
  }

  const toggle = async (service: ServiceKey, enabled: boolean) => {
    await fetch('/api/google/toggle', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ service, enabled }),
    })
    await refresh()
  }

  const connected = status?.connected ?? false

  return (
    <ObsPageShell>
      <div className="w-full px-8 xl:px-12 2xl:px-16 pb-16">
        <ObsHero
          eyebrow="Settings"
          title="連携設定"
          caption="Gmail / Google カレンダー / Google Meet / Google チャット を機能ごとに個別連携できます。"
        />

        {/* ── タブナビ ── */}
        <div
          className="inline-flex items-center p-1 rounded-[var(--radius-obs-md)] mb-6 gap-1"
          style={{ backgroundColor: 'var(--color-obs-surface-high)' }}
        >
          {(
            [
              { key: 'setup',  label: '連携設定',         icon: SettingsIcon,   badgeCount: 0 },
              { key: 'review', label: 'メンバー連携状況', icon: ClipboardList,  badgeCount: initialIncompleteCount },
            ] as const
          ).map((t) => {
            const active = tab === t.key
            const Icon = t.icon
            const showWarn = t.badgeCount > 0
            return (
              <button
                key={t.key}
                type="button"
                onClick={() => setTab(t.key)}
                className="relative inline-flex items-center gap-1.5 h-9 px-4 rounded-[calc(var(--radius-obs-md)-2px)] text-[13px] font-medium transition-colors"
                style={{
                  backgroundColor: active ? 'var(--color-obs-primary-container)' : 'transparent',
                  color: active ? 'var(--color-obs-on-primary)' : 'var(--color-obs-text-muted)',
                }}
              >
                {showWarn && !active && (
                  <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                    <span className="absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping" style={{ backgroundColor: 'var(--color-obs-hot)' }} />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5" style={{ backgroundColor: 'var(--color-obs-hot)' }} />
                  </span>
                )}
                <Icon size={14} />
                {t.label}
                {showWarn && (
                  <span
                    className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[10.5px] font-extrabold tabular-nums"
                    style={{
                      backgroundColor: active ? '#fff' : 'var(--color-obs-hot)',
                      color: active ? 'var(--color-obs-hot)' : '#fff',
                    }}
                  >
                    {t.badgeCount}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {tab === 'setup' && (
          <>
        {/* ── トップ: Google Workspace 一括連携 ── */}
        <ObsCard depth="high" padding="lg" radius="xl">
          <div className="flex items-start gap-4">
            <div
              className="shrink-0 w-12 h-12 rounded-[var(--radius-obs-lg)] flex items-center justify-center overflow-hidden"
              style={{ backgroundColor: 'var(--color-obs-surface-high)' }}
            >
              <OfficialIcon
                src="/icons/google-workspace.png"
                alt="Google Workspace"
                fallback={<GoogleLogo />}
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg font-semibold" style={{ color: 'var(--color-obs-text)' }}>
                  Google Workspace
                </h2>
                {connected && (
                  <span
                    className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full"
                    style={{
                      color: '#4ad98a',
                      backgroundColor: 'rgba(74,217,138,0.14)',
                    }}
                  >
                    <Check size={11} />
                    連携済み
                  </span>
                )}
              </div>
              <p className="text-[13px] mt-1" style={{ color: 'var(--color-obs-text-muted)' }}>
                {connected && status?.email
                  ? `${status.email} としてログイン中。下記カードから機能を個別連携・解除できます。`
                  : '機能ごとに個別連携できます。下のカードから必要な機能だけを連携してください。一括連携も下記ボタンから可能です。'}
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                <a
                  href="/api/google/install?service=all"
                  className="inline-flex items-center gap-1.5 h-10 px-5 rounded-[var(--radius-obs-md)] text-[13.5px] font-medium transition-all duration-150"
                  style={{
                    background:
                      'linear-gradient(180deg, var(--color-obs-primary-container) 0%, color-mix(in srgb, var(--color-obs-primary-container) 88%, #000 12%) 100%)',
                    color: 'var(--color-obs-on-primary)',
                    boxShadow:
                      'inset 0 1px 0 rgba(255,255,255,0.10), 0 1px 2px rgba(0,0,0,0.18)',
                  }}
                >
                  <Plug size={14} />
                  すべての機能を一括連携
                </a>
                {connected && (
                  <ObsButton
                    variant="ghost"
                    size="sm"
                    onClick={() => sync('all')}
                    disabled={busy !== null}
                  >
                    {busy === 'all' ? (
                      <span className="inline-flex items-center gap-1.5">
                        <Loader2 size={13} className="animate-spin" /> 一括同期中…
                      </span>
                    ) : (
                      'すべての機能を一括同期'
                    )}
                  </ObsButton>
                )}
                {connected && (
                  <button
                    onClick={async () => {
                      if (!confirm('Google 連携をすべて解除します。よろしいですか?')) return
                      setBusy('all')
                      try {
                        await fetch('/api/google/disconnect?service=all', { method: 'POST' })
                        await refresh()
                      } finally {
                        setBusy(null)
                      }
                    }}
                    disabled={busy !== null}
                    className="inline-flex items-center gap-1.5 h-9 px-3 rounded-[var(--radius-obs-md)] text-[12px] font-medium transition-colors disabled:opacity-50"
                    style={{ color: 'var(--color-obs-hot)' }}
                  >
                    <Trash2 size={12} />
                    すべて解除
                  </button>
                )}
              </div>
            </div>
          </div>
        </ObsCard>

        {/* ── 機能別カード ── */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          {SERVICE_DEFS.map((def) => {
            const s = status?.services?.[def.key]
            return (
              <ServiceCard
                key={def.key}
                serviceKey={def.key}
                icon={def.icon()}
                label={def.label}
                description={def.description}
                available={s?.available ?? false}
                enabled={s?.enabled ?? false}
                lastSyncAt={s?.lastSyncAt ?? null}
                busy={busy === def.key}
                onSync={() => sync(def.key)}
                onToggle={(v) => toggle(def.key, v)}
                onDisconnect={async () => {
                  if (!confirm(`${def.label} の連携を解除しますか?`)) return
                  setBusy(def.key)
                  try {
                    await fetch(`/api/google/disconnect?service=${def.key}`, { method: 'POST' })
                    await refresh()
                  } finally {
                    setBusy(null)
                  }
                }}
              />
            )
          })}
        </div>

        {lastResult !== null && (
          <ObsCard depth="low" padding="md" radius="xl" className="mt-4">
            <div
              className="text-[12px] font-medium uppercase tracking-[0.1em] mb-2"
              style={{ color: 'var(--color-obs-text-subtle)' }}
            >
              直前の同期結果
            </div>
            <pre
              className="text-[12px] font-mono whitespace-pre-wrap"
              style={{ color: 'var(--color-obs-text-muted)' }}
            >
              {JSON.stringify(lastResult, null, 2)}
            </pre>
          </ObsCard>
        )}

        {/* ── Slack 連携 ── */}
        <SlackSection />

        {/* ── Microsoft 365 連携 (近日対応予定) ── */}
        <MicrosoftSection />

        <ObsCard depth="low" padding="md" radius="xl" className="mt-4">
          <div
            className="text-[12px] font-medium uppercase tracking-[0.1em] mb-2"
            style={{ color: 'var(--color-obs-text-subtle)' }}
          >
            動作の前提
          </div>
          <ul className="text-[13px] space-y-1.5" style={{ color: 'var(--color-obs-text-muted)' }}>
            <li>・Workspace 管理コンソールで Meet の録画 / 文字起こし を有効化してください。</li>
            <li>
              ・会議ごとに 録画 と 文字起こし をオンにして開始してください（Meet API は録画/文字起こしが行われた会議のみ取得可能）。
            </li>
            <li>・コンタクトのメールアドレスがカレンダー参加者に含まれていれば、自動で取引・コンタクトに紐付きます。</li>
            <li>・Google Chat はスペース/DM の最近のメッセージを定期取り込みします。</li>
          </ul>
        </ObsCard>
          </>
        )}

        {tab === 'review' && (
          <MemberIntegrationStatusSection />
        )}
      </div>
    </ObsPageShell>
  )
}

function ServiceCard({
  serviceKey,
  icon,
  label,
  description,
  available,
  enabled,
  lastSyncAt,
  busy,
  onSync,
  onToggle,
  onDisconnect,
}: {
  serviceKey: ServiceKey
  icon: React.ReactNode
  label: string
  description: string
  available: boolean
  enabled: boolean
  lastSyncAt: string | null
  busy: boolean
  onSync: () => void
  onToggle: (v: boolean) => void
  onDisconnect: () => void
}) {
  return (
    <div
      className="rounded-[var(--radius-obs-xl)] p-5"
      style={{
        backgroundColor: 'var(--color-obs-surface)',
        boxShadow: 'inset 0 0 0 1px var(--color-obs-surface-high)',
      }}
    >
      <div className="flex items-start gap-4">
        <div
          className="shrink-0 w-12 h-12 rounded-[var(--radius-obs-lg)] flex items-center justify-center overflow-hidden"
          style={{ backgroundColor: 'var(--color-obs-surface-high)' }}
        >
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3
              className="font-semibold text-[14.5px] tracking-[-0.01em]"
              style={{ color: 'var(--color-obs-text)' }}
            >
              {label}
            </h3>
            <StatusPill available={available} enabled={enabled} />
          </div>
          <p className="text-[12.5px] mt-1" style={{ color: 'var(--color-obs-text-muted)' }}>
            {description}
          </p>

          {!available ? (
            <div className="mt-3">
              <a
                href={`/api/google/install?service=${serviceKey}`}
                className="inline-flex items-center gap-1.5 h-8 px-3 rounded-[var(--radius-obs-md)] text-[12px] font-medium transition-colors"
                style={{
                  backgroundColor: 'var(--color-obs-primary-container)',
                  color: 'var(--color-obs-on-primary)',
                }}
              >
                <Link2 size={12} />
                {label} を連携する
              </a>
            </div>
          ) : (
            <div className="mt-3 flex items-center justify-between gap-3 flex-wrap">
              <span className="text-[11.5px]" style={{ color: 'var(--color-obs-text-subtle)' }}>
                最終同期: {lastSyncAt ? new Date(lastSyncAt).toLocaleString('ja-JP') : '未同期'}
              </span>
              <div className="flex items-center gap-2">
                <ToggleSwitch checked={enabled} onChange={onToggle} />
                <button
                  onClick={onSync}
                  disabled={!enabled || busy}
                  className="h-8 px-3 rounded-[var(--radius-obs-md)] text-[12px] font-medium transition-colors disabled:opacity-40"
                  style={{
                    backgroundColor: 'var(--color-obs-surface-highest)',
                    color: 'var(--color-obs-text)',
                  }}
                >
                  {busy ? (
                    <span className="inline-flex items-center gap-1.5">
                      <Loader2 size={12} className="animate-spin" /> 同期中
                    </span>
                  ) : (
                    '今すぐ同期'
                  )}
                </button>
                <button
                  onClick={onDisconnect}
                  disabled={busy}
                  className="h-8 px-2 rounded-[var(--radius-obs-md)] text-[12px] inline-flex items-center gap-1 transition-colors disabled:opacity-40"
                  style={{ color: 'var(--color-obs-hot)' }}
                  title="この機能の連携を解除"
                >
                  <Trash2 size={11} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// タイル内で使う、背景なしのカラー付きフォールバックアイコン。
// 親側の w-12 h-12 タイル（surface-high 背景）の中央に配置される。
function BrandedIcon({
  Icon,
  color,
}: {
  Icon: React.ComponentType<{ size?: number; strokeWidth?: number; style?: React.CSSProperties }>
  color: string
  bg?: string // 互換のため残す（未使用）
}) {
  return <Icon size={26} strokeWidth={2.2} style={{ color }} />
}

/**
 * 公式ブランドアイコンを表示。public/icons/ に PNG が置いてあれば表示し、
 * 無ければ fallback を表示する。サイズは親タイル（48px）に対して 32px。
 */
function OfficialIcon({
  src,
  alt,
  fallback,
  size = 32,
}: {
  src: string
  alt: string
  fallback: React.ReactNode
  size?: number
}) {
  const [errored, setErrored] = useState(false)
  if (errored) return <>{fallback}</>
  return (
    <img
      src={src}
      alt={alt}
      width={size}
      height={size}
      className="object-contain"
      style={{ width: size, height: size }}
      onError={() => setErrored(true)}
    />
  )
}

function StatusPill({ available, enabled }: { available: boolean; enabled: boolean }) {
  if (!available) {
    return (
      <span
        className="text-[10px] font-semibold uppercase tracking-[0.08em] px-1.5 py-0.5 rounded-full"
        style={{
          color: 'var(--color-obs-text-subtle)',
          backgroundColor: 'var(--color-obs-surface-high)',
        }}
      >
        未取得
      </span>
    )
  }
  if (enabled) {
    return (
      <span
        className="text-[10px] font-semibold uppercase tracking-[0.08em] px-1.5 py-0.5 rounded-full"
        style={{
          color: '#4ad98a',
          backgroundColor: 'rgba(74,217,138,0.14)',
        }}
      >
        有効
      </span>
    )
  }
  return (
    <span
      className="text-[10px] font-semibold uppercase tracking-[0.08em] px-1.5 py-0.5 rounded-full"
      style={{
        color: 'var(--color-obs-text-muted)',
        backgroundColor: 'var(--color-obs-surface-high)',
      }}
    >
      無効
    </span>
  )
}

function ToggleSwitch({
  checked,
  disabled,
  onChange,
}: {
  checked: boolean
  disabled?: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <button
      onClick={() => !disabled && onChange(!checked)}
      disabled={disabled}
      className="relative w-9 h-5 rounded-full transition-colors disabled:opacity-50"
      style={{
        backgroundColor: checked ? 'var(--color-obs-primary)' : 'var(--color-obs-surface-highest)',
      }}
      aria-label="toggle"
    >
      <span
        className="absolute top-0.5 w-4 h-4 rounded-full transition-transform"
        style={{
          backgroundColor: 'var(--color-obs-text)',
          transform: checked ? 'translateX(18px)' : 'translateX(2px)',
        }}
      />
    </button>
  )
}

// ─── Slack セクション ────────────────────────────────────────────────────────

interface SlackWorkspaceState {
  id: string
  teamId: string
  teamName: string
  enabled: boolean
  lastSyncAt: string | null
}

function SlackSection() {
  const [status, setStatus] = useState<{ connected: boolean; workspaces: SlackWorkspaceState[] } | null>(
    null,
  )
  const [busy, setBusy] = useState<string | null>(null)
  const [lastResult, setLastResult] = useState<unknown>(null)

  const refresh = async () => {
    const r = await fetch('/api/slack/status')
    if (r.ok) setStatus(await r.json())
  }

  useEffect(() => {
    refresh()
  }, [])

  const sync = async (workspaceId?: string) => {
    setBusy(workspaceId ?? 'all')
    setLastResult(null)
    try {
      const url = workspaceId ? `/api/slack/sync?workspaceId=${workspaceId}` : '/api/slack/sync'
      const r = await fetch(url, { method: 'POST' })
      setLastResult(await r.json())
      await refresh()
    } finally {
      setBusy(null)
    }
  }

  const disconnect = async (workspaceId: string) => {
    if (!confirm('このワークスペースとの連携を解除しますか?')) return
    setBusy(workspaceId)
    try {
      await fetch(`/api/slack/disconnect?workspaceId=${workspaceId}`, { method: 'POST' })
      await refresh()
    } finally {
      setBusy(null)
    }
  }

  return (
    <ObsCard depth="high" padding="lg" radius="xl" className="mt-4">
      <div className="flex items-start gap-4">
        <div
          className="shrink-0 w-12 h-12 rounded-[var(--radius-obs-lg)] flex items-center justify-center overflow-hidden"
          style={{ backgroundColor: 'var(--color-obs-surface-high)' }}
        >
          <OfficialIcon src="/icons/slack.png" alt="Slack" fallback={<SlackLogo />} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold" style={{ color: 'var(--color-obs-text)' }}>
              Slack
            </h2>
            {status?.connected && (
              <span
                className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full"
                style={{ color: '#4ad98a', backgroundColor: 'rgba(74,217,138,0.14)' }}
              >
                <Check size={11} />
                {status.workspaces.length} 個のワークスペース連携中
              </span>
            )}
          </div>
          <p className="text-[13px] mt-1" style={{ color: 'var(--color-obs-text-muted)' }}>
            {status?.connected
              ? 'Bot を追加したチャンネル/DM のメッセージを取り込み、コンタクトに紐付けます。'
              : 'Slack ワークスペースに BGM CRM Bot を追加すると、メッセージをコンタクトに紐付けて取り込めます。'}
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            <a
              href="/api/slack/install"
              className="inline-flex items-center gap-1.5 h-9 px-4 rounded-[var(--radius-obs-md)] text-[13px] font-medium transition-colors"
              style={{
                backgroundColor: '#4A154B',
                color: '#ffffff',
              }}
            >
              <SlackLogoMini />
              {status?.connected ? '別のワークスペースを追加' : 'Slack で連携する'}
            </a>
            {status?.connected && (
              <ObsButton variant="ghost" size="sm" onClick={() => sync()} disabled={busy !== null}>
                {busy === 'all' ? (
                  <span className="inline-flex items-center gap-1.5">
                    <Loader2 size={13} className="animate-spin" /> 同期中…
                  </span>
                ) : (
                  '全ワークスペース同期'
                )}
              </ObsButton>
            )}
          </div>

          {status?.connected && (
            <div className="mt-4 flex flex-col gap-2">
              {status.workspaces.map((w) => (
                <div
                  key={w.id}
                  className="rounded-[var(--radius-obs-md)] p-3 flex items-center gap-3"
                  style={{ backgroundColor: 'var(--color-obs-surface-high)' }}
                >
                  <Hash size={14} style={{ color: 'var(--color-obs-text-subtle)' }} />
                  <div className="flex-1 min-w-0">
                    <div
                      className="text-[13px] font-medium truncate"
                      style={{ color: 'var(--color-obs-text)' }}
                    >
                      {w.teamName || w.teamId}
                    </div>
                    <div
                      className="text-[11.5px]"
                      style={{ color: 'var(--color-obs-text-subtle)' }}
                    >
                      最終同期: {w.lastSyncAt ? new Date(w.lastSyncAt).toLocaleString('ja-JP') : '未同期'}
                    </div>
                  </div>
                  <button
                    onClick={() => sync(w.id)}
                    disabled={busy !== null}
                    className="h-7 px-2 rounded-[var(--radius-obs-md)] text-[11.5px] inline-flex items-center gap-1 transition-colors disabled:opacity-50"
                    style={{
                      backgroundColor: 'var(--color-obs-surface-highest)',
                      color: 'var(--color-obs-text)',
                    }}
                  >
                    {busy === w.id ? <Loader2 size={11} className="animate-spin" /> : <RefreshCw size={11} />}
                    同期
                  </button>
                  <button
                    onClick={() => disconnect(w.id)}
                    disabled={busy !== null}
                    className="h-7 px-2 rounded-[var(--radius-obs-md)] text-[11.5px] inline-flex items-center gap-1 transition-colors disabled:opacity-50"
                    style={{ color: 'var(--color-obs-hot)' }}
                  >
                    <Trash2 size={11} />
                    解除
                  </button>
                </div>
              ))}
            </div>
          )}

          {lastResult !== null && (
            <pre
              className="mt-3 text-[11.5px] font-mono whitespace-pre-wrap p-2 rounded"
              style={{
                backgroundColor: 'var(--color-obs-surface-low)',
                color: 'var(--color-obs-text-muted)',
              }}
            >
              {JSON.stringify(lastResult, null, 2)}
            </pre>
          )}
        </div>
      </div>
    </ObsCard>
  )
}

function SlackLogo() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52z" fill="#E01E5A"/>
      <path d="M6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313z" fill="#E01E5A"/>
      <path d="M8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834z" fill="#36C5F0"/>
      <path d="M8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312z" fill="#36C5F0"/>
      <path d="M18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834z" fill="#2EB67D"/>
      <path d="M17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312z" fill="#2EB67D"/>
      <path d="M15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52z" fill="#ECB22E"/>
      <path d="M15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z" fill="#ECB22E"/>
    </svg>
  )
}

function SlackLogoMini() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52z" fill="#E01E5A"/>
      <path d="M6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313z" fill="#E01E5A"/>
      <path d="M8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834z" fill="#36C5F0"/>
      <path d="M8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312z" fill="#36C5F0"/>
      <path d="M18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834z" fill="#2EB67D"/>
      <path d="M17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312z" fill="#2EB67D"/>
      <path d="M15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52z" fill="#ECB22E"/>
      <path d="M15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z" fill="#ECB22E"/>
    </svg>
  )
}

function GoogleLogo() {
  return (
    <svg width="32" height="32" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
      <path
        fill="#FFC107"
        d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"
      />
      <path
        fill="#FF3D00"
        d="m6.306 14.691 6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"
      />
    </svg>
  )
}

// ─── Microsoft 365 セクション (近日対応予定) ───────────────────────────────

const MICROSOFT_SERVICES: Array<{
  key: string
  label: string
  icon: () => React.ReactNode
  description: string
}> = [
  {
    key: 'outlook',
    label: 'Outlook',
    icon: () => (
      <OfficialIcon
        src="/icons/outlook.png"
        alt="Outlook"
        fallback={<BrandedIcon Icon={MailLucide} color="#0078D4" bg="rgba(0,120,212,0.14)" />}
      />
    ),
    description: '送受信メールをコンタクトのメアドと一致させて取り込み',
  },
  {
    key: 'ms-calendar',
    label: 'Microsoft カレンダー',
    icon: () => (
      <OfficialIcon
        src="/icons/microsoft-calendar.png"
        alt="Microsoft Calendar"
        fallback={<BrandedIcon Icon={CalendarLucide} color="#0078D4" bg="rgba(0,120,212,0.14)" />}
      />
    ),
    description: '商談予定を取引・コンタクトに自動連携',
  },
  {
    key: 'teams',
    label: 'Microsoft Teams',
    icon: () => (
      <OfficialIcon
        src="/icons/teams.png"
        alt="Microsoft Teams"
        fallback={<BrandedIcon Icon={UsersLucide} color="#5059C9" bg="rgba(80,89,201,0.14)" />}
      />
    ),
    description: '会議録画・チャットを取込 → 議事録BANT自動入力',
  },
  {
    key: 'onedrive',
    label: 'OneDrive',
    icon: () => (
      <OfficialIcon
        src="/icons/onedrive.png"
        alt="OneDrive"
        fallback={<BrandedIcon Icon={Cloud} color="#0364B8" bg="rgba(3,100,184,0.14)" />}
      />
    ),
    description: 'ファイル参照・取引/コンタクトに添付資料を紐付け',
  },
  {
    key: 'sharepoint',
    label: 'SharePoint',
    icon: () => (
      <OfficialIcon
        src="/icons/sharepoint.png"
        alt="SharePoint"
        fallback={<BrandedIcon Icon={FolderOpen} color="#038387" bg="rgba(3,131,135,0.14)" />}
      />
    ),
    description: 'ドキュメントライブラリと連携・社内ナレッジ取込',
  },
]

function MicrosoftSection() {
  return (
    <ObsCard depth="high" padding="lg" radius="xl" className="mt-4">
      <div className="flex items-start gap-4">
        <div
          className="shrink-0 w-12 h-12 rounded-[var(--radius-obs-lg)] flex items-center justify-center overflow-hidden"
          style={{ backgroundColor: 'var(--color-obs-surface-high)' }}
        >
          <OfficialIcon
            src="/icons/microsoft-365.png"
            alt="Microsoft 365"
            fallback={<MicrosoftLogo />}
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-lg font-semibold" style={{ color: 'var(--color-obs-text)' }}>
              Microsoft 365
            </h2>
            <span
              className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full uppercase tracking-[0.05em]"
              style={{
                color: '#FFC107',
                backgroundColor: 'rgba(255,193,7,0.14)',
              }}
            >
              近日対応予定
            </span>
          </div>
          <p className="text-[13px] mt-1" style={{ color: 'var(--color-obs-text-muted)' }}>
            Outlook / Microsoft カレンダー / Teams / OneDrive / SharePoint との連携を準備中です。
            現在は Google Workspace を優先実装しています。リリースをお待ちください。
          </p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        {MICROSOFT_SERVICES.map((s) => (
          <div
            key={s.key}
            className="rounded-[var(--radius-obs-xl)] p-5 opacity-60"
            style={{
              backgroundColor: 'var(--color-obs-surface)',
              boxShadow: 'inset 0 0 0 1px var(--color-obs-surface-high)',
            }}
          >
            <div className="flex items-start gap-4">
              <div
                className="shrink-0 w-12 h-12 rounded-[var(--radius-obs-lg)] flex items-center justify-center overflow-hidden"
                style={{ backgroundColor: 'var(--color-obs-surface-high)' }}
              >
                {s.icon()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3
                    className="text-[15px] font-semibold"
                    style={{ color: 'var(--color-obs-text)' }}
                  >
                    {s.label}
                  </h3>
                  <span
                    className="inline-flex items-center text-[10px] font-medium px-1.5 py-0.5 rounded-full"
                    style={{
                      color: 'var(--color-obs-text-subtle)',
                      backgroundColor: 'var(--color-obs-surface-high)',
                    }}
                  >
                    予定
                  </span>
                </div>
                <p
                  className="text-[12.5px] mt-1 leading-relaxed"
                  style={{ color: 'var(--color-obs-text-muted)' }}
                >
                  {s.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </ObsCard>
  )
}

function MicrosoftLogo() {
  return (
    <svg width="32" height="32" viewBox="0 0 23 23" xmlns="http://www.w3.org/2000/svg">
      <path fill="#F25022" d="M1 1h10v10H1z" />
      <path fill="#7FBA00" d="M12 1h10v10H12z" />
      <path fill="#00A4EF" d="M1 12h10v10H1z" />
      <path fill="#FFB900" d="M12 12h10v10H12z" />
    </svg>
  )
}

// ─── メンバー別 連携状況 (管理者用) ─────────────────────────────────────────────
// 各メンバーが Gmail/Calendar/Meet/Chat/Slack を個別連携できているかを管理者が一覧で把握できるセクション。
// バックエンド連携前のモック実装。

type MemberIntegrationKey = 'gmail' | 'calendar' | 'meet' | 'chat' | 'slack'

interface MemberIntegrationRow {
  id: string
  name: string
  email: string
  role: '管理者' | 'メンバー'
  integrations: Partial<Record<MemberIntegrationKey, { connected: boolean; lastSyncAt: string | null }>>
  invitedAt: string
}

const MEMBER_ROWS: MemberIntegrationRow[] = [
  {
    id: 'm-1', name: '田中 太郎', email: 'tanaka@zooba.io', role: '管理者',
    integrations: {
      gmail:    { connected: true, lastSyncAt: '2 分前' },
      calendar: { connected: true, lastSyncAt: '5 分前' },
      meet:     { connected: true, lastSyncAt: '1 時間前' },
      chat:     { connected: true, lastSyncAt: '30 分前' },
      slack:    { connected: true, lastSyncAt: '12 分前' },
    },
    invitedAt: '2026-01-15',
  },
  {
    id: 'm-2', name: '鈴木 花子', email: 'suzuki@zooba.io', role: 'メンバー',
    integrations: {
      gmail:    { connected: true, lastSyncAt: '8 分前' },
      calendar: { connected: true, lastSyncAt: '15 分前' },
      meet:     { connected: false, lastSyncAt: null },
      chat:     { connected: true, lastSyncAt: '45 分前' },
      slack:    { connected: true, lastSyncAt: '20 分前' },
    },
    invitedAt: '2026-02-01',
  },
  {
    id: 'm-3', name: '佐藤 次郎', email: 'sato@zooba.io', role: 'メンバー',
    integrations: {
      gmail:    { connected: true, lastSyncAt: '32 分前' },
      calendar: { connected: false, lastSyncAt: null },
      meet:     { connected: false, lastSyncAt: null },
      chat:     { connected: false, lastSyncAt: null },
      slack:    { connected: true, lastSyncAt: '1 時間前' },
    },
    invitedAt: '2026-02-12',
  },
  {
    id: 'm-4', name: '開発 太郎', email: 'dev-taro@zooba.io', role: 'メンバー',
    integrations: {
      gmail:    { connected: false, lastSyncAt: null },
      calendar: { connected: false, lastSyncAt: null },
      meet:     { connected: false, lastSyncAt: null },
      chat:     { connected: false, lastSyncAt: null },
      slack:    { connected: false, lastSyncAt: null },
    },
    invitedAt: '2026-04-08',
  },
  {
    id: 'm-5', name: '高田 美咲', email: 'takada@zooba.io', role: 'メンバー',
    integrations: {
      gmail:    { connected: true, lastSyncAt: '18 分前' },
      calendar: { connected: true, lastSyncAt: '22 分前' },
      meet:     { connected: true, lastSyncAt: '昨日' },
      chat:     { connected: false, lastSyncAt: null },
      slack:    { connected: true, lastSyncAt: '3 時間前' },
    },
    invitedAt: '2026-03-02',
  },
]

const INTEGRATION_COLS: { key: MemberIntegrationKey; label: string }[] = [
  { key: 'gmail',    label: 'Gmail' },
  { key: 'calendar', label: 'カレンダー' },
  { key: 'meet',     label: 'Meet' },
  { key: 'chat',     label: 'Chat' },
  { key: 'slack',    label: 'Slack' },
]

// スーパー管理者(role==='管理者')と同じ項目を必須とみなす共通ヘルパー
function getRequiredKeys(): MemberIntegrationKey[] {
  const superAdmin = MEMBER_ROWS.find((m) => m.role === '管理者')
  return superAdmin
    ? INTEGRATION_COLS.map((c) => c.key).filter((k) => !!superAdmin.integrations[k]?.connected)
    : INTEGRATION_COLS.map((c) => c.key)
}

function getIncompleteMemberCount(): number {
  const superAdmin = MEMBER_ROWS.find((m) => m.role === '管理者')
  const required = getRequiredKeys()
  return MEMBER_ROWS.filter(
    (m) => m.id !== superAdmin?.id && required.some((k) => !m.integrations[k]?.connected),
  ).length
}

function MemberIntegrationStatusSection() {
  const [search, setSearch] = useState('')
  // 未連携メンバーがいる場合は最初から未連携だけ表示する(余計なクリックを発生させない)
  const [filter, setFilter] = useState<'all' | 'incomplete'>(getIncompleteMemberCount() > 0 ? 'incomplete' : 'all')

  // スーパー管理者(role==='管理者')が連携している項目を「会社として必須の連携」とみなす。
  // 各メンバーは、スーパー管理者と同じ項目を全て連携できていれば「OK」、欠けていれば「未連携あり」とする。
  const superAdmin = MEMBER_ROWS.find((m) => m.role === '管理者')
  const requiredKeys = getRequiredKeys()

  const isMemberIncomplete = (m: MemberIntegrationRow) =>
    m.id !== superAdmin?.id && requiredKeys.some((k) => !m.integrations[k]?.connected)

  const incompleteCount = MEMBER_ROWS.filter(isMemberIncomplete).length
  const hasIncomplete = incompleteCount > 0

  const filtered = MEMBER_ROWS
    .filter((m) => {
      if (search.trim()) {
        const q = search.toLowerCase()
        if (!m.name.toLowerCase().includes(q) && !m.email.toLowerCase().includes(q)) return false
      }
      // スーパー管理者は基準として常に表示する(フィルタ対象外)
      if (filter === 'incomplete' && !isMemberIncomplete(m) && m.id !== superAdmin?.id) return false
      return true
    })
    // スーパー管理者を常に先頭に
    .sort((a, b) => {
      if (a.id === superAdmin?.id) return -1
      if (b.id === superAdmin?.id) return 1
      return 0
    })

  return (
    <ObsCard depth="high" padding="lg" radius="xl" className="mt-4">
      {/* ヘッダ */}
      <div className="flex items-start gap-4 mb-5">
        <div
          className="shrink-0 w-12 h-12 rounded-[var(--radius-obs-lg)] flex items-center justify-center"
          style={{ backgroundColor: 'rgba(171,199,255,0.14)' }}
        >
          <UsersLucide size={20} style={{ color: 'var(--color-obs-primary)' }} />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-semibold" style={{ color: 'var(--color-obs-text)' }}>
            メンバー別 連携状況
          </h2>
          <p className="text-[13px] mt-1" style={{ color: 'var(--color-obs-text-muted)' }}>
            メンバー全員の連携状況を一覧で確認できます。
          </p>
        </div>
      </div>

      {/* ツールバー */}
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--color-obs-text-subtle)' }} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="メンバー名・メールで検索"
            className="w-full pl-9 pr-3 h-9 rounded-[var(--radius-obs-md)] text-[13px] outline-none"
            style={{
              backgroundColor: 'var(--color-obs-surface-lowest)',
              color: 'var(--color-obs-text)',
              boxShadow: 'inset 0 0 0 1px rgba(109,106,111,0.18)',
            }}
          />
        </div>
        <div
          className="inline-flex items-center rounded-[var(--radius-obs-md)] p-0.5"
          style={{ background: 'var(--color-obs-surface-high)', boxShadow: 'inset 0 0 0 1px rgba(109,106,111,0.18)' }}
        >
          <button
            type="button"
            onClick={() => setFilter('all')}
            className="h-8 px-3 rounded-[var(--radius-obs-sm)] text-[12px] font-semibold transition-colors"
            style={{
              backgroundColor: filter === 'all' ? 'var(--color-obs-primary-container)' : 'transparent',
              color: filter === 'all' ? 'var(--color-obs-on-primary)' : 'var(--color-obs-text-muted)',
            }}
          >
            すべて ({MEMBER_ROWS.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('incomplete')}
            className="h-8 px-3 rounded-[var(--radius-obs-sm)] text-[12px] font-bold transition-all inline-flex items-center gap-1.5"
            style={
              hasIncomplete
                ? {
                    backgroundColor: filter === 'incomplete' ? 'var(--color-obs-hot)' : 'rgba(255,107,107,0.18)',
                    color: filter === 'incomplete' ? '#fff' : 'var(--color-obs-hot)',
                    boxShadow: filter === 'incomplete'
                      ? '0 0 0 1.5px rgba(255,107,107,0.6), 0 0 16px rgba(255,107,107,0.4)'
                      : 'inset 0 0 0 1.5px rgba(255,107,107,0.55)',
                  }
                : {
                    backgroundColor: filter === 'incomplete' ? 'var(--color-obs-primary-container)' : 'transparent',
                    color: filter === 'incomplete' ? 'var(--color-obs-on-primary)' : 'var(--color-obs-text-muted)',
                  }
            }
          >
            {hasIncomplete && (
              <span className="relative inline-flex h-2 w-2 shrink-0">
                <span className="absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping" style={{ backgroundColor: filter === 'incomplete' ? '#fff' : 'var(--color-obs-hot)' }} />
                <span className="relative inline-flex rounded-full h-2 w-2" style={{ backgroundColor: filter === 'incomplete' ? '#fff' : 'var(--color-obs-hot)' }} />
              </span>
            )}
            <AlertCircle size={12} strokeWidth={2.6} />
            未連携あり
            <span
              className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[11px] font-extrabold tabular-nums"
              style={
                hasIncomplete
                  ? {
                      backgroundColor: filter === 'incomplete' ? '#fff' : 'var(--color-obs-hot)',
                      color: filter === 'incomplete' ? 'var(--color-obs-hot)' : '#fff',
                    }
                  : {
                      backgroundColor: 'rgba(143,140,144,0.20)',
                      color: 'var(--color-obs-text-subtle)',
                    }
              }
            >
              {incompleteCount}
            </span>
          </button>
        </div>
      </div>

      {/* テーブル */}
      <div className="rounded-[var(--radius-obs-md)] overflow-hidden" style={{ boxShadow: 'inset 0 0 0 1px rgba(109,106,111,0.18)' }}>
        {/* ヘッダ */}
        <div
          className="grid items-center gap-2 px-4 py-2.5 text-[10.5px] font-semibold tracking-[0.06em] uppercase"
          style={{
            gridTemplateColumns: '1fr 80px 80px 80px 80px 80px',
            backgroundColor: 'var(--color-obs-surface-low)',
            color: 'var(--color-obs-text-subtle)',
          }}
        >
          <div>メンバー</div>
          {INTEGRATION_COLS.map((c) => (
            <div key={c.key} className="text-center">{c.label}</div>
          ))}
        </div>

        {/* スーパー管理者(計測基準)セクション */}
        {filtered.some((m) => m.id === superAdmin?.id) && superAdmin && (
          <>
            <div
              className="grid items-center gap-2 px-4 py-3 text-[12.5px]"
              style={{
                gridTemplateColumns: '1fr 80px 80px 80px 80px 80px',
                backgroundColor: 'rgba(255,184,107,0.04)',
                boxShadow: 'inset 3px 0 0 0 var(--color-obs-middle)',
              }}
            >
              {/* メンバー(スーパー管理者) */}
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-semibold"
                  style={{
                    backgroundColor: 'rgba(255,184,107,0.18)',
                    color: 'var(--color-obs-middle)',
                    boxShadow: 'inset 0 0 0 1px rgba(255,184,107,0.42)',
                  }}
                >
                  {superAdmin.name[0]}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-semibold truncate" style={{ color: 'var(--color-obs-text)' }}>{superAdmin.name}</span>
                    <span
                      className="inline-flex items-center gap-1 h-[18px] px-1.5 rounded-full text-[9.5px] font-bold whitespace-nowrap"
                      style={{
                        color: '#fff',
                        backgroundColor: 'var(--color-obs-middle)',
                        boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.15)',
                      }}
                      title="スーパー管理者の連携状況を計測基準として使用"
                    >
                      <ShieldCheck size={10} strokeWidth={2.8} />
                      スーパー管理者
                    </span>
                  </div>
                  <div className="text-[10.5px] truncate" style={{ color: 'var(--color-obs-text-subtle)' }}>{superAdmin.email}</div>
                </div>
              </div>

              {/* 各連携の状態(基準) */}
              {INTEGRATION_COLS.map((c) => {
                const ok = !!superAdmin.integrations[c.key]?.connected
                return (
                  <div key={c.key} className="flex items-center justify-center">
                    {ok ? (
                      <Check size={15} strokeWidth={3} style={{ color: 'var(--color-obs-middle)' }} />
                    ) : (
                      <span className="text-[12px]" style={{ color: 'var(--color-obs-text-subtle)', opacity: 0.4 }}>—</span>
                    )}
                  </div>
                )
              })}
            </div>

            {/* スーパー管理者行の直下キャプション(基準であることを明示) */}
            <div
              className="px-4 py-2 flex items-center gap-1.5 text-[10.5px] font-semibold tracking-[0.04em]"
              style={{
                backgroundColor: 'rgba(255,184,107,0.04)',
                color: 'var(--color-obs-middle)',
                boxShadow: 'inset 3px 0 0 0 var(--color-obs-middle)',
              }}
            >
              <ShieldCheck size={11} strokeWidth={2.6} />
              ↑ 計測基準 — この連携状況をベースに、メンバーの未連携を判定します
            </div>

            {/* 基準セクションとメンバーセクションの間スペーサー */}
            <div style={{ height: 12, backgroundColor: 'var(--color-obs-surface-low)' }} />
          </>
        )}

        {/* メンバー(スーパー管理者以外) */}
        {filtered.filter((m) => m.id !== superAdmin?.id).length === 0 ? (
          <div className="px-4 py-10 text-center text-[12.5px]" style={{ color: 'var(--color-obs-text-subtle)' }}>
            該当するメンバーがいません
          </div>
        ) : (
          filtered
            .filter((m) => m.id !== superAdmin?.id)
            .map((m, i) => (
              <div
                key={m.id}
                className="grid items-center gap-2 px-4 py-3 text-[12.5px]"
                style={{
                  gridTemplateColumns: '1fr 80px 80px 80px 80px 80px',
                  borderTop: i === 0 ? undefined : '1px solid rgba(109,106,111,0.12)',
                }}
              >
                {/* メンバー */}
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-semibold"
                    style={{ backgroundColor: 'var(--color-obs-surface-highest)', color: 'var(--color-obs-text)' }}
                  >
                    {m.name[0]}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="font-medium truncate" style={{ color: 'var(--color-obs-text)' }}>{m.name}</span>
                    </div>
                    <div className="text-[10.5px] truncate" style={{ color: 'var(--color-obs-text-subtle)' }}>{m.email}</div>
                  </div>
                </div>

                {/* 各連携の状態 */}
                {INTEGRATION_COLS.map((c) => {
                  const s = m.integrations[c.key]
                  const ok = !!s?.connected
                  // スーパー管理者と比較: 必須項目で未連携 = 赤強調
                  const isRequired = requiredKeys.includes(c.key)
                  const missingRequired = !ok && isRequired
                  return (
                    <div key={c.key} className="flex items-center justify-center">
                      {ok ? (
                        <Check size={14} strokeWidth={3} style={{ color: '#6ee7a1' }} />
                      ) : missingRequired ? (
                        <AlertCircle size={13} style={{ color: 'var(--color-obs-hot)' }} />
                      ) : (
                        <span className="text-[12px]" style={{ color: 'var(--color-obs-text-subtle)', opacity: 0.4 }}>—</span>
                      )}
                    </div>
                  )
                })}
              </div>
            ))
        )}
      </div>

      <p className="text-[10.5px] mt-3" style={{ color: 'var(--color-obs-text-subtle)' }}>
        ※ 連携は本人による OAuth 認可が必要なため、管理者が代理連携することはできません。リマインド送信で本人に手続きを促す形になります。
      </p>
    </ObsCard>
  )
}
