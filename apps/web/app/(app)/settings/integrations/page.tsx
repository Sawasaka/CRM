'use client'

import { type FormEvent, useEffect, useState } from 'react'
import Image from 'next/image'
import {
  Calendar as CalendarLucide,
  Check,
  FolderOpen,
  Hash,
  Link2,
  Loader2,
  Mail as MailLucide,
  MessageSquare as MessageSquareLucide,
  Plug,
  Trash2,
  Users as UsersLucide,
  Video as VideoLucide,
  ShieldCheck,
  AlertCircle,
  Search,
  Settings as SettingsIcon,
  ClipboardList,
  Copy,
  KeyRound,
} from 'lucide-react'
import { ObsButton, ObsCard, ObsHero, ObsPageShell } from '@/components/obsidian'

type ServiceKey = 'gmail' | 'drive' | 'calendar' | 'meet' | 'chat'

interface ServiceState {
  available: boolean // OAuth スコープが取得済みか
  enabled: boolean // ユーザーが有効化しているか
  lastSyncAt: string | null
}

interface GoogleStatus {
  connected: boolean
  configured?: boolean
  callbackUrl?: string
  nextAuthCallbackUrl?: string
  email?: string
  services?: Record<ServiceKey, ServiceState>
}

interface NotionStatus {
  connected: boolean
  configured: boolean
  workspaceName: string | null
  workspaceId: string | null
  enabled: boolean
  lastSyncAt: string | null
  tokenSource: 'env' | 'oauth'
  callbackUrl?: string
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
    key: 'drive',
    label: 'Google Drive',
    icon: () => (
      <OfficialIcon
        src="/icons/google-workspace.png"
        alt="Google Drive"
        fallback={<BrandedIcon Icon={FolderOpen} color="#FABB05" bg="rgba(250,187,5,0.14)" />}
      />
    ),
    description: '連携フォルダのドキュメントをナレッジとして取り込み',
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
  const [notionStatus, setNotionStatus] = useState<NotionStatus | null>(null)
  const [busy, setBusy] = useState<ServiceKey | 'all' | null>(null)
  const [notionBusy, setNotionBusy] = useState(false)
  const [showGoogleSetup, setShowGoogleSetup] = useState(false)
  const [showNotionTokenForm, setShowNotionTokenForm] = useState(false)
  const [notionToken, setNotionToken] = useState('')
  const [notionSetupMessage, setNotionSetupMessage] = useState<string | null>(null)
  const [lastResult, setLastResult] = useState<unknown>(null)

  const refresh = async () => {
    const [google, notion] = await Promise.all([
      fetch('/api/google/status'),
      fetch('/api/notion/status'),
    ])
    if (google.ok) setStatus(await google.json())
    if (notion.ok) setNotionStatus(await notion.json())
  }

  useEffect(() => {
    refresh()
    const params = new URLSearchParams(window.location.search)
    if (params.get('google_error') === 'not_configured') {
      setTab('setup')
      setShowGoogleSetup(true)
    }
    if (params.get('notion_error') === 'not_configured') {
      setTab('setup')
    }
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

  const syncNotion = async () => {
    setNotionBusy(true)
    setLastResult(null)
    try {
      const r = await fetch('/api/notion/sync', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ query: '議事録', maxPages: 20 }),
      })
      setLastResult(await r.json())
      await refresh()
    } finally {
      setNotionBusy(false)
    }
  }

  const connectNotionToken = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setNotionBusy(true)
    setNotionSetupMessage(null)
    try {
      const r = await fetch('/api/notion/connect-token', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ token: notionToken }),
      })
      const json = await r.json().catch(() => ({}))
      if (!r.ok) {
        setNotionSetupMessage(json.message ?? 'Notion APIトークンの保存に失敗しました。')
        return
      }
      setNotionToken('')
      setShowNotionTokenForm(false)
      setNotionSetupMessage('Notion連携を保存しました。議事録同期を実行できます。')
      await refresh()
    } finally {
      setNotionBusy(false)
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
          caption="Gmail / Google Drive / Google カレンダー / Google Meet を機能ごとに個別連携できます。"
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
                {status?.configured === false ? (
                  <PrimaryLikeButton onClick={() => setShowGoogleSetup(true)}>
                    <KeyRound size={14} />
                    Google連携の設定を入力
                  </PrimaryLikeButton>
                ) : (
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
                )}
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

        {showGoogleSetup && (
          <GoogleSetupPanel
            callbackUrl={status?.callbackUrl}
            nextAuthCallbackUrl={status?.nextAuthCallbackUrl}
            configured={status?.configured ?? false}
            onClose={() => setShowGoogleSetup(false)}
          />
        )}

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
                googleConfigured={status?.configured !== false}
                onConfigureGoogle={() => setShowGoogleSetup(true)}
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

        <ObsCard depth="high" padding="lg" radius="xl" className="mt-4">
          <div className="flex items-start gap-4">
            <div
              className="shrink-0 w-12 h-12 rounded-[var(--radius-obs-lg)] flex items-center justify-center"
              style={{ backgroundColor: '#fff', color: '#111' }}
            >
              <Hash size={21} strokeWidth={2.6} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg font-semibold" style={{ color: 'var(--color-obs-text)' }}>
                  Notion（議事録）
                </h2>
                <StatusPill
                  available={!!notionStatus?.connected}
                  enabled={!!notionStatus?.enabled}
                />
              </div>
              <p className="text-[13px] mt-1" style={{ color: 'var(--color-obs-text-muted)' }}>
                Notionで共有された議事録ページを読み取り、取引・企業・コンタクトに自動紐付けします。
              </p>
              {notionStatus?.connected && (
                <p className="text-[12px] mt-2" style={{ color: 'var(--color-obs-text-subtle)' }}>
                  {notionStatus.workspaceName
                    ? `${notionStatus.workspaceName} と連携中`
                    : 'Notion と連携中'}
                  {' / '}
                  最終同期: {notionStatus.lastSyncAt ? new Date(notionStatus.lastSyncAt).toLocaleString('ja-JP') : '未同期'}
                </p>
              )}
              {notionSetupMessage && (
                <p
                  className="text-[12px] mt-2"
                  style={{
                    color: notionSetupMessage.includes('失敗')
                      ? 'var(--color-obs-hot)'
                      : 'var(--color-obs-text-subtle)',
                  }}
                >
                  {notionSetupMessage}
                </p>
              )}
              <div className="mt-4 flex flex-wrap gap-2">
                {!notionStatus?.connected ? (
                  <>
                    {notionStatus?.configured ? (
                      <a
                        href="/api/notion/install"
                        className="inline-flex items-center gap-1.5 h-9 px-4 rounded-[var(--radius-obs-md)] text-[13px] font-medium transition-colors"
                        style={{
                          backgroundColor: 'var(--color-obs-primary-container)',
                          color: 'var(--color-obs-on-primary)',
                        }}
                      >
                        <Link2 size={13} />
                        Notion OAuthで連携
                      </a>
                    ) : null}
                    <ObsButton
                      variant={notionStatus?.configured ? 'ghost' : 'primary'}
                      size="sm"
                      onClick={() => setShowNotionTokenForm((v) => !v)}
                    >
                      <span className="inline-flex items-center gap-1.5">
                        <KeyRound size={13} />
                        APIトークンで連携
                      </span>
                    </ObsButton>
                  </>
                ) : (
                  <>
                    <ObsButton
                      variant="primary"
                      size="sm"
                      onClick={syncNotion}
                      disabled={notionBusy}
                    >
                      {notionBusy ? (
                        <span className="inline-flex items-center gap-1.5">
                          <Loader2 size={13} className="animate-spin" /> 議事録同期中…
                        </span>
                      ) : (
                        'Notion議事録を同期'
                      )}
                    </ObsButton>
                    {notionStatus.tokenSource !== 'env' && (
                      <button
                        onClick={async () => {
                          if (!confirm('Notion 連携を解除しますか?')) return
                          setNotionBusy(true)
                          try {
                            await fetch('/api/notion/disconnect', { method: 'POST' })
                            await refresh()
                          } finally {
                            setNotionBusy(false)
                          }
                        }}
                        disabled={notionBusy}
                        className="inline-flex items-center gap-1.5 h-9 px-3 rounded-[var(--radius-obs-md)] text-[12px] font-medium transition-colors disabled:opacity-50"
                        style={{ color: 'var(--color-obs-hot)' }}
                      >
                        <Trash2 size={12} />
                        解除
                      </button>
                    )}
                  </>
                )}
              </div>
              {showNotionTokenForm && !notionStatus?.connected && (
                <NotionTokenForm
                  token={notionToken}
                  busy={notionBusy}
                  onTokenChange={setNotionToken}
                  onSubmit={connectNotionToken}
                  onCancel={() => setShowNotionTokenForm(false)}
                />
              )}
            </div>
          </div>
        </ObsCard>

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
            <li>・Google Drive はナレッジ画面で選択したフォルダのみ同期します。</li>
            <li>・Notion 議事録は、連携時に共有したページ・データベースのみ取得できます。</li>
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
  googleConfigured,
  onConfigureGoogle,
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
  googleConfigured: boolean
  onConfigureGoogle: () => void
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
              {googleConfigured ? (
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
              ) : (
                <button
                  type="button"
                  onClick={onConfigureGoogle}
                  className="inline-flex items-center gap-1.5 h-8 px-3 rounded-[var(--radius-obs-md)] text-[12px] font-medium transition-colors"
                  style={{
                    backgroundColor: 'var(--color-obs-primary-container)',
                    color: 'var(--color-obs-on-primary)',
                  }}
                >
                  <KeyRound size={12} />
                  Google設定を入力
                </button>
              )}
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

function PrimaryLikeButton({
  children,
  onClick,
}: {
  children: React.ReactNode
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 h-10 px-5 rounded-[var(--radius-obs-md)] text-[13.5px] font-medium transition-all duration-150"
      style={{
        background:
          'linear-gradient(180deg, var(--color-obs-primary-container) 0%, color-mix(in srgb, var(--color-obs-primary-container) 88%, #000 12%) 100%)',
        color: 'var(--color-obs-on-primary)',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.10), 0 1px 2px rgba(0,0,0,0.18)',
      }}
    >
      {children}
    </button>
  )
}

function GoogleSetupPanel({
  callbackUrl,
  nextAuthCallbackUrl,
  configured,
  onClose,
}: {
  callbackUrl?: string
  nextAuthCallbackUrl?: string
  configured: boolean
  onClose: () => void
}) {
  return (
    <ObsCard depth="low" padding="md" radius="xl" className="mt-4">
      <div className="flex items-start gap-3">
        <AlertCircle size={18} style={{ color: configured ? '#4ad98a' : 'var(--color-obs-hot)' }} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-[14px] font-semibold" style={{ color: 'var(--color-obs-text)' }}>
              Google Workspace 連携の初期設定
            </h3>
            <ObsButton variant="ghost" size="sm" onClick={onClose}>
              閉じる
            </ObsButton>
          </div>
          <p className="text-[12.5px] mt-1" style={{ color: 'var(--color-obs-text-muted)' }}>
            Google Cloud のOAuth同意画面と認証情報に、下記URLを登録してください。
          </p>
          <div className="mt-3 grid grid-cols-1 lg:grid-cols-2 gap-2">
            <CopyableValue label="ログイン用リダイレクトURL" value={nextAuthCallbackUrl ?? ''} />
            <CopyableValue label="追加権限用リダイレクトURL" value={callbackUrl ?? ''} />
          </div>
          <div
            className="mt-3 rounded-[var(--radius-obs-md)] px-3 py-2 text-[12px]"
            style={{
              backgroundColor: 'var(--color-obs-surface-high)',
              color: 'var(--color-obs-text-muted)',
            }}
          >
            必要な環境変数: <code>GOOGLE_CLIENT_ID</code> / <code>GOOGLE_CLIENT_SECRET</code>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {configured ? (
              <a
                href="/api/google/install?service=all"
                className="inline-flex items-center gap-1.5 h-8 px-3 rounded-[var(--radius-obs-md)] text-[12px] font-medium transition-colors"
                style={{
                  backgroundColor: 'var(--color-obs-primary-container)',
                  color: 'var(--color-obs-on-primary)',
                }}
              >
                <Plug size={12} />
                Google連携へ進む
              </a>
            ) : (
              <span className="text-[12px]" style={{ color: 'var(--color-obs-hot)' }}>
                設定後にサーバーを再起動すると連携ボタンが有効になります。
              </span>
            )}
          </div>
        </div>
      </div>
    </ObsCard>
  )
}

function NotionTokenForm({
  token,
  busy,
  onTokenChange,
  onSubmit,
  onCancel,
}: {
  token: string
  busy: boolean
  onTokenChange: (value: string) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  onCancel: () => void
}) {
  return (
    <form
      onSubmit={onSubmit}
      className="mt-4 rounded-[var(--radius-obs-lg)] p-4"
      style={{
        backgroundColor: 'var(--color-obs-surface-high)',
        boxShadow: 'inset 0 0 0 1px var(--color-obs-surface-highest)',
      }}
    >
      <div className="grid grid-cols-1 gap-3">
        <Field label="Notion APIトークン">
          <input
            type="password"
            value={token}
            onChange={(e) => onTokenChange(e.target.value)}
            placeholder="secret_... または ntn_..."
            className="h-10 w-full rounded-[var(--radius-obs-md)] px-3 text-[13px] outline-none"
            style={{
              backgroundColor: 'var(--color-obs-surface)',
              color: 'var(--color-obs-text)',
              boxShadow: 'inset 0 0 0 1px var(--color-obs-surface-highest)',
            }}
          />
        </Field>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <ObsButton type="submit" size="sm" variant="primary" disabled={busy || !token.trim()}>
          {busy ? (
            <span className="inline-flex items-center gap-1.5">
              <Loader2 size={13} className="animate-spin" />
              確認中
            </span>
          ) : (
            '保存して連携'
          )}
        </ObsButton>
        <ObsButton type="button" size="sm" variant="ghost" onClick={onCancel} disabled={busy}>
          キャンセル
        </ObsButton>
      </div>
    </form>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-[11.5px] font-medium mb-1.5" style={{ color: 'var(--color-obs-text-subtle)' }}>
        {label}
      </span>
      {children}
    </label>
  )
}

function CopyableValue({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    if (!value) return
    await navigator.clipboard.writeText(value)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1200)
  }

  return (
    <div
      className="rounded-[var(--radius-obs-md)] px-3 py-2"
      style={{
        backgroundColor: 'var(--color-obs-surface)',
        boxShadow: 'inset 0 0 0 1px var(--color-obs-surface-highest)',
      }}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] font-medium" style={{ color: 'var(--color-obs-text-subtle)' }}>
          {label}
        </span>
        <button
          type="button"
          onClick={copy}
          className="inline-flex items-center gap-1 text-[11px]"
          style={{ color: 'var(--color-obs-primary)' }}
        >
          <Copy size={11} />
          {copied ? 'コピー済み' : 'コピー'}
        </button>
      </div>
      <code
        className="mt-1 block truncate text-[12px]"
        style={{ color: value ? 'var(--color-obs-text-muted)' : 'var(--color-obs-hot)' }}
      >
        {value || '未取得'}
      </code>
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
    <Image
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

// ─── メンバー別 連携状況 (管理者用) ─────────────────────────────────────────────
// 各メンバーが Gmail/Drive/Calendar/Meet/Chat/Slack を個別連携できているかを管理者が一覧で把握できるセクション。
// バックエンド連携前のモック実装。

type MemberIntegrationKey = 'gmail' | 'drive' | 'calendar' | 'meet' | 'chat' | 'slack'

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
      drive:    { connected: true, lastSyncAt: '10 分前' },
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
      drive:    { connected: true, lastSyncAt: '18 分前' },
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
      drive:    { connected: false, lastSyncAt: null },
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
      drive:    { connected: false, lastSyncAt: null },
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
      drive:    { connected: true, lastSyncAt: '2 時間前' },
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
  { key: 'drive',    label: 'Drive' },
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
