'use client'

import { Suspense, useEffect, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowUp, Loader2, Paperclip, Mic } from 'lucide-react'
import { ObsPageShell } from '@/components/obsidian'
import {
  AssigneeFilter,
  DEFAULT_SCOPE,
  type AssigneeScopeValue,
} from '@/components/ai/AssigneeFilter'
import { ModelSelector } from '@/components/ai/ModelSelector'
import { CompanyBriefCard, type CompanyBrief } from '@/components/ai/CompanyBriefCard'
import { ChatAnswer } from '@/components/ai/ChatAnswer'
import { useFileAttachments, HiddenFileInput, AttachmentChip } from '@/components/ai/file-attach'
import { DEFAULT_CHAT_POLICY_STATE } from '@/lib/chat-policy-presets'
import type { ModelKind, ThinkingDepth } from '@/components/ai/ModelSelector'
import { AGENTS, type AgentKey, Orb } from '@/components/landing/atoms'
import {
  deriveTitle,
  generateChatId,
  getChat,
  upsertChat,
  type StoredChatMessage,
} from '@/lib/chat-history/store'

type ChatMessage = {
  role: 'user' | 'assistant'
  content: string
  model?: string
  elapsedMs?: number
  companyBrief?: CompanyBrief
  agent?: AgentKey
}

interface Suggestion {
  id: string
  label: string
  agent: AgentKey
}

const SUGGESTIONS: Suggestion[] = [
  { id: 'hot',    label: '今週アプローチすべきHOT企業を教えて',   agent: 'sales' },
  { id: 'intent', label: '採用インテントが伸びてる企業 TOP10',      agent: 'marketing' },
  { id: 'ticket', label: '未対応チケットを担当者ごとに集計して',   agent: 'support' },
  { id: 'pdm',    label: '先週の議事録から要望機能を集計して',     agent: 'pdm' },
  { id: 'tmpl',   label: 'ベテランの提案テンプレートを教えて',     agent: 'helpdesk' },
]

function inferAgent(prompt: string): AgentKey {
  const p = prompt.toLowerCase()
  if (/(チケット|問い合わせ|サポート|不具合|sla|エスカレ)/.test(prompt)) return 'support'
  if (/(ナレッジ|テンプレ|社内|q&a|q＆a|faq|手順|マニュアル)/i.test(prompt)) return 'helpdesk'
  if (/(議事録|要望|機能|ロードマップ|優先度|pdm|プロダクト)/i.test(prompt)) return 'pdm'
  if (/(インテント|採用|キャンペーン|メール配信|ナーチャ|マーケ|流入)/.test(prompt) || /campaign|intent/.test(p)) return 'marketing'
  return 'sales'
}

type BrowserAgentResponse = {
  handled: boolean
  content?: string
  action?: {
    type: 'open_url'
    url: string
    label: string
    autoOpen: boolean
  }
}

type GmailActivityResponse = {
  ok?: boolean
  error?: string
  installUrl?: string
  message?: string
  company?: string
  count?: number
  synced?: {
    fetched: number
    inserted: number
    matched: number
    skipped: number
  } | null
  messages?: Array<{
    subject: string | null
    snippet: string | null
    fromAddress: string
    fromName: string | null
    toAddresses: string[]
    sentAt: string
    direction: 'SENT' | 'RECEIVED'
    matchedBy: string | null
  }>
}

export default function HomePage() {
  return (
    <Suspense fallback={null}>
      <HomePageContent />
    </Suspense>
  )
}

function HomePageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const chatIdParam = searchParams.get('chat')

  const [prompt, setPrompt] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [chatId, setChatId] = useState<string | null>(null)
  const [model, setModel] = useState<ModelKind>('gemini-3-flash-preview')
  const [thinking, setThinking] = useState<ThinkingDepth>('extended')
  const policy = DEFAULT_CHAT_POLICY_STATE
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [scope, setScope] = useState<AssigneeScopeValue>(() => ({
    features: new Set(DEFAULT_SCOPE.features),
    persons: new Set(DEFAULT_SCOPE.persons),
    includeExternal: DEFAULT_SCOPE.includeExternal,
  }))
  const taRef = useRef<HTMLTextAreaElement | null>(null)
  const attach = useFileAttachments()

  // URL の ?chat=<id> に応じて履歴をロード or 新規チャット状態にする
  useEffect(() => {
    if (chatIdParam) {
      const record = getChat(chatIdParam)
      if (record) {
        setChatId(record.id)
        setMessages(record.messages as ChatMessage[])
        return
      }
    }
    setChatId(null)
    setMessages([])
    setError(null)
  }, [chatIdParam])

  const hasConversation = messages.length > 0 || isLoading

  const persistChat = (nextMessages: ChatMessage[], idOverride?: string) => {
    const id = idOverride ?? chatId
    if (!id) return
    const firstUser = nextMessages.find((m) => m.role === 'user' && !!m.content?.trim())
    // user message がまだ無い段階では履歴に残さない（空タイトル防止）
    if (!firstUser) return
    upsertChat({
      id,
      title: deriveTitle(firstUser.content),
      updatedAt: new Date().toISOString(),
      messages: nextMessages as StoredChatMessage[],
    })
  }

  const handleSubmit = async (overridePrompt?: string, overrideAgent?: AgentKey) => {
    if (isLoading) return
    const q = (overridePrompt ?? prompt).trim()
    if (!q) return

    const agent: AgentKey = overrideAgent ?? inferAgent(q)
    const history = messages.slice(-10).map((m) => ({
      role: m.role,
      content: m.content,
    }))

    // 初回送信時に chatId を生成し、URL にも反映する（URL 更新は次の microtask で行い、
    // 同イベント内で他コンポーネントのレンダーと噛み合わないようにする）
    let activeChatId = chatId
    if (!activeChatId) {
      activeChatId = generateChatId()
      setChatId(activeChatId)
      const nextId = activeChatId
      queueMicrotask(() => {
        router.replace(`/?chat=${nextId}`, { scroll: false })
      })
    }

    const userMessage: ChatMessage = { role: 'user', content: q }
    let currentMessages: ChatMessage[] = [...messages, userMessage]
    setMessages(currentMessages)
    persistChat(currentMessages, activeChatId)
    setPrompt('')
    setError(null)
    setIsLoading(true)

    try {
      const gmailActivityCompany = extractGmailActivityCompany(q)
      if (gmailActivityCompany) {
        const gmailRes = await fetch('/api/google/gmail/activity', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            company: gmailActivityCompany,
            sinceDays: 365,
            maxMessages: 30,
          }),
        })
        const gmailJson = (await gmailRes.json().catch(() => ({}))) as GmailActivityResponse
        currentMessages = [
          ...currentMessages,
          {
            role: 'assistant',
            content: formatGmailActivityResponse(gmailJson, gmailActivityCompany),
            agent,
          },
        ]
        setMessages(currentMessages)
        persistChat(currentMessages, activeChatId)
        return
      }

      const actionRes = await fetch('/api/agent/browser-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: q }),
      })
      const actionJson = (await actionRes.json().catch(() => null)) as BrowserAgentResponse | null
      if (actionJson?.handled) {
        const content = actionJson.content ?? '操作を開始しました。'
        currentMessages = [...currentMessages, { role: 'assistant', content, agent }]
        setMessages(currentMessages)
        persistChat(currentMessages, activeChatId)
        if (actionJson.action?.type === 'open_url' && actionJson.action.autoOpen) {
          window.setTimeout(() => {
            window.location.href = actionJson.action!.url
          }, 800)
        }
        return
      }

      const res = await fetch('/api/research/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: q,
          model,
          thinking,
          policy,
          history,
          includeExternal: scope.includeExternal,
        }),
      })
      const json = (await res.json().catch(() => ({}))) as {
        content?: string
        model?: string
        elapsedMs?: number
        error?: string
      }
      if (!res.ok) throw new Error(json.error || `HTTP ${res.status}`)
      const content = json.content || ''
      const shouldShowCompanyBrief =
        shouldRenderCompanyBrief(q) || looksLikeCompanyResearch(content)
      currentMessages = [
        ...currentMessages,
        {
          role: 'assistant',
          content,
          model: json.model,
          elapsedMs: json.elapsedMs,
          agent,
          companyBrief: shouldShowCompanyBrief
            ? {
                companyName: extractCompanyName(q) || extractCompanyNameFromContent(content),
                content,
              }
            : undefined,
        },
      ]
      setMessages(currentMessages)
      persistChat(currentMessages, activeChatId)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <ObsPageShell>
      <div
        className={`min-h-[calc(100vh-56px)] flex flex-col items-center px-8 ${hasConversation ? 'justify-between py-8' : 'justify-center'}`}
        style={{
          backgroundColor: 'var(--color-obs-surface)',
          backgroundImage:
            'radial-gradient(circle at 50% 20%, rgba(171,199,255,0.06) 0%, transparent 45%), radial-gradient(circle at 20% 80%, rgba(0,113,227,0.04) 0%, transparent 50%)',
        }}
      >
        {hasConversation && (
          <div className="w-full max-w-[960px] flex-1 overflow-y-auto pb-6 space-y-4">
            {messages.map((m, i) => {
              const companyBrief =
                m.companyBrief ??
                (m.role === 'assistant' && looksLikeCompanyResearch(m.content)
                  ? {
                      companyName: extractCompanyNameFromContent(m.content),
                      content: m.content,
                    }
                  : undefined)

              const agentMeta = m.role === 'assistant' ? AGENTS[m.agent ?? 'sales'] : null

              return (
                <div
                  key={`${m.role}-${i}`}
                  className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {companyBrief ? (
                    <div className="w-full max-w-[900px]">
                      {agentMeta && (
                        <div className="flex items-center gap-2 mb-2 px-1">
                          <Orb color={agentMeta.color} size={14} />
                          <span
                            className="text-[12px] font-semibold"
                            style={{ color: agentMeta.color }}
                          >
                            {agentMeta.name}
                          </span>
                          <span className="text-[10px] uppercase tracking-[0.16em] text-[#7e7c83]">
                            RAG demo
                          </span>
                        </div>
                      )}
                      <CompanyBriefCard brief={companyBrief} />
                      {m.model && (
                        <div
                          className="mt-2 px-1 text-[11px]"
                          style={{ color: 'var(--color-obs-text-muted)' }}
                        >
                          {m.model}
                          {typeof m.elapsedMs === 'number'
                            ? ` / ${Math.round(m.elapsedMs / 1000)}秒`
                            : ''}
                        </div>
                      )}
                    </div>
                  ) : agentMeta ? (
                    <div className="flex gap-3 max-w-[85%]">
                      <div className="pt-1 shrink-0">
                        <Orb color={agentMeta.color} size={20} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className="text-[12px] font-semibold"
                            style={{ color: agentMeta.color }}
                          >
                            {agentMeta.name}
                          </span>
                          <span className="text-[10px] uppercase tracking-[0.16em] text-[#7e7c83]">
                            RAG demo
                          </span>
                        </div>
                        <div
                          className="rounded-[var(--radius-obs-xl)] rounded-tl-md px-4 py-3"
                          style={{
                            backgroundColor: 'var(--color-obs-surface-high)',
                            color: 'var(--color-obs-text)',
                            border: '1px solid var(--color-obs-border)',
                          }}
                        >
                          <ChatAnswer content={m.content} />
                          {m.model && (
                            <div
                              className="mt-2 text-[11px]"
                              style={{ color: 'var(--color-obs-text-muted)' }}
                            >
                              {m.model}
                              {typeof m.elapsedMs === 'number'
                                ? ` / ${Math.round(m.elapsedMs / 1000)}秒`
                                : ''}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div
                      className="max-w-[85%] rounded-[var(--radius-obs-xl)] px-4 py-3 text-[14px] leading-relaxed whitespace-pre-wrap"
                      style={{
                        backgroundColor: 'rgba(74,144,226,0.22)',
                        color: 'var(--color-obs-text)',
                        border: '1px solid var(--color-obs-border)',
                      }}
                    >
                      {m.content}
                    </div>
                  )}
                </div>
              )
            })}
            {isLoading && (
              <div className="flex justify-start">
                <div
                  className="inline-flex items-center gap-2 rounded-[var(--radius-obs-xl)] px-4 py-3 text-[13px]"
                  style={{
                    backgroundColor: 'var(--color-obs-surface-high)',
                    color: 'var(--color-obs-text-muted)',
                    border: '1px solid var(--color-obs-border)',
                  }}
                >
                  <Loader2 size={14} className="animate-spin" />
                  Geminiで回答中
                </div>
              </div>
            )}
            {error && (
              <div
                className="rounded-[var(--radius-obs-lg)] px-4 py-3 text-[13px]"
                style={{
                  backgroundColor: 'rgba(255,107,107,0.12)',
                  color: '#ffb3b3',
                  border: '1px solid rgba(255,107,107,0.26)',
                }}
              >
                {error}
              </div>
            )}
          </div>
        )}

        {/* ── Chat / RAG Input (centered vertically; hero title sits above via absolute) ── */}
        <div className="w-full max-w-[780px] relative">
          {/* ── Hero prompt (大きな見出し: 何を調べますか？) ── */}
          {!hasConversation && (
            <div className="absolute bottom-full left-0 right-0 mb-10 flex flex-col items-center gap-2">
              <h1
                className="font-[family-name:var(--font-display)] text-center font-semibold tracking-[-0.025em] leading-[1.1]"
                style={{
                  fontSize: 'clamp(1.75rem, 3vw, 2.25rem)',
                  color: 'var(--color-obs-text)',
                }}
              >
                何を調べますか？
              </h1>
            </div>
          )}

          {/* ── Chat input box ── */}
          <div
            className="rounded-[var(--radius-obs-2xl)] p-1.5 transition-shadow duration-300"
            style={{
              backgroundColor: 'var(--color-obs-surface-high)',
              boxShadow: prompt
                ? '0 0 0 2px rgba(171,199,255,0.18), 0 20px 40px rgba(0,0,0,0.35)'
                : '0 10px 30px rgba(0,0,0,0.3)',
              transitionTimingFunction: 'var(--ease-liquid)',
            }}
          >
            <textarea
              ref={taRef}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
                  e.preventDefault()
                  void handleSubmit()
                }
              }}
              placeholder="ルキスマCRMに何でも尋ねる — 企業・商談・議事録を横断検索"
              rows={2}
              className="w-full bg-transparent resize-none outline-none px-5 pt-4 pb-2 text-[15px] leading-relaxed"
              style={{
                color: 'var(--color-obs-text)',
              }}
            />

            <HiddenFileInput inputRef={attach.inputRef} onChange={attach.handleChange} />

            {/* 添付ファイルプレビュー (1個以上ある時のみ表示) */}
            {attach.files.length > 0 && (
              <div className="flex flex-wrap gap-1.5 px-3 pb-1">
                {attach.files.map((f, i) => (
                  <AttachmentChip
                    key={`${f.name}-${i}`}
                    file={f}
                    onRemove={() => attach.remove(i)}
                  />
                ))}
              </div>
            )}

            <div className="flex items-center justify-between px-3 pb-2 pt-1">
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={attach.openPicker}
                  disabled={isLoading}
                  className="w-9 h-9 rounded-full flex items-center justify-center transition-colors duration-150"
                  style={{ color: 'var(--color-obs-text-muted)' }}
                  onMouseOver={(e) => {
                    ;(e.currentTarget as HTMLButtonElement).style.backgroundColor =
                      'var(--color-obs-surface-highest)'
                    ;(e.currentTarget as HTMLButtonElement).style.color = 'var(--color-obs-text)'
                  }}
                  onMouseOut={(e) => {
                    ;(e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent'
                    ;(e.currentTarget as HTMLButtonElement).style.color =
                      'var(--color-obs-text-muted)'
                  }}
                  title="ファイルを添付"
                  aria-label="ファイルを添付"
                >
                  <Paperclip size={16} />
                </button>
                {/* ── モデル + 思考の深さ ── */}
                <ModelSelector
                  model={model}
                  thinking={thinking}
                  onModelChange={setModel}
                  onThinkingChange={setThinking}
                />

                {/* ── 参照スコープ(全員 / チームFAQ / 担当者) ── */}
                <AssigneeFilter value={scope} onChange={setScope} />
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={isLoading}
                  className="w-9 h-9 rounded-full flex items-center justify-center transition-colors duration-150"
                  style={{ color: 'var(--color-obs-text-muted)' }}
                  onMouseOver={(e) => {
                    ;(e.currentTarget as HTMLButtonElement).style.backgroundColor =
                      'var(--color-obs-surface-highest)'
                    ;(e.currentTarget as HTMLButtonElement).style.color = 'var(--color-obs-text)'
                  }}
                  onMouseOut={(e) => {
                    ;(e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent'
                    ;(e.currentTarget as HTMLButtonElement).style.color =
                      'var(--color-obs-text-muted)'
                  }}
                  title="音声入力"
                >
                  <Mic size={15} />
                </button>
                <button
                  type="button"
                  onClick={() => void handleSubmit()}
                  disabled={!prompt.trim() || isLoading}
                  className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 disabled:cursor-not-allowed"
                  style={{
                    background: prompt.trim()
                      ? 'linear-gradient(140deg, var(--color-obs-primary) 0%, var(--color-obs-primary-container) 100%)'
                      : 'var(--color-obs-surface-highest)',
                    color: prompt.trim()
                      ? 'var(--color-obs-on-primary)'
                      : 'var(--color-obs-text-muted)',
                    boxShadow: prompt.trim()
                      ? 'inset 0 1px 0 rgba(255,255,255,0.18)'
                      : 'inset 0 0 0 1px var(--color-obs-border)',
                    transitionTimingFunction: 'var(--ease-liquid)',
                  }}
                  title="送信 (Enter)"
                >
                  {isLoading ? (
                    <Loader2 size={15} className="animate-spin" />
                  ) : (
                    <ArrowUp size={15} strokeWidth={2.5} />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* ── Suggestion chips (チャット入力下のサジェスト) ── */}
          {!hasConversation && (
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {SUGGESTIONS.map((s) => {
                const a = AGENTS[s.agent]
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => void handleSubmit(s.label, s.agent)}
                    disabled={isLoading}
                    className="group inline-flex items-center gap-2 rounded-full pl-2 pr-3 py-1.5 text-xs transition-colors disabled:opacity-40"
                    style={{
                      backgroundColor: 'var(--color-obs-surface-high)',
                      color: 'var(--color-obs-text)',
                      border: '1px solid var(--color-obs-border)',
                    }}
                    onMouseOver={(e) => {
                      ;(e.currentTarget as HTMLButtonElement).style.backgroundColor =
                        'var(--color-obs-surface-highest)'
                    }}
                    onMouseOut={(e) => {
                      ;(e.currentTarget as HTMLButtonElement).style.backgroundColor =
                        'var(--color-obs-surface-high)'
                    }}
                  >
                    <Orb color={a.color} size={10} />
                    <span>{s.label}</span>
                    <span
                      className="hidden sm:inline"
                      style={{ color: 'var(--color-obs-text-muted)' }}
                    >
                      → {a.name}
                    </span>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </ObsPageShell>
  )
}

function shouldRenderCompanyBrief(prompt: string): boolean {
  const normalized = prompt.toLowerCase()
  if (/google|meet|gmail|カレンダー|議事録|連携|ログイン|決済/.test(normalized)) return false
  return (
    /(企業|会社|株式会社|合同会社|について|教えて|リサーチ|調べて)/.test(prompt) ||
    isLikelyShortCompanyPrompt(prompt)
  )
}

function extractCompanyName(prompt: string): string {
  const cleaned = cleanupCompanyName(prompt)
  const patterns = [
    /^(.+?)(?:について|に関して|のこと|を教えて|教えて|リサーチ|調べて)/,
    /(?:企業|会社)\s*[「『]?(.+?)[」』]?(?:について|を|の|$)/,
  ]

  for (const pattern of patterns) {
    const match = cleaned.match(pattern)
    if (match?.[1]) return cleanupCompanyName(match[1]).slice(0, 40)
  }

  return cleaned.slice(0, 40) || '対象企業'
}

function looksLikeCompanyResearch(content: string): boolean {
  return /企業概要|事業動向|課題仮説|営業リサーチ|リサーチレポート|ターゲット顧客|競合サービス/.test(
    content
  )
}

function extractCompanyNameFromContent(content: string): string {
  const heading =
    content.match(
      /^#{1,4}\s*(.+?)(?:様向け)?(?:営業リサーチレポート|について|企業リサーチ|調査レポート)/m
    ) ?? content.match(/\*\*企業名:\*\*\s*([^\n]+)/)
  return cleanupCompanyName(heading?.[1] ?? '').slice(0, 40) || '対象企業'
}

function cleanupCompanyName(value: string): string {
  return value
    .replace(/[「」『』]/g, '')
    .replace(/(について|に関して|のこと|を教えて|教えて|リサーチして|調べて).*$/, '')
    .replace(/^(この|その|あの)\s*/, '')
    .trim()
}

function isLikelyShortCompanyPrompt(prompt: string): boolean {
  const cleaned = cleanupCompanyName(prompt)
  if (cleaned.length < 2 || cleaned.length > 40) return false
  if (/^(こんにちは|ありがとう|テスト|test|hello|hi)$/i.test(cleaned)) return false
  return /^[\wぁ-んァ-ヶ一-龠ー・&＆.\-\s]+$/.test(cleaned)
}

function extractGmailActivityCompany(prompt: string): string | null {
  if (!/(gmail|メール|やりとり|遣り取り|アクティビティ|履歴|連絡)/i.test(prompt)) return null
  if (!/(確認|見たい|見せて|教えて|調べて|チェック|同期)/.test(prompt)) return null
  const patterns = [
    /(.+?)(?:と|との)(?:gmail|メール|やりとり|遣り取り|アクティビティ|履歴|連絡)/i,
    /(?:gmail|メール|やりとり|遣り取り|アクティビティ|履歴|連絡).+?(.+?)(?:を|の|について)/i,
  ]
  for (const pattern of patterns) {
    const match = prompt.match(pattern)
    const company = cleanupGmailCompanyCandidate(match?.[1] ?? '')
    if (company) return company
  }
  return null
}

function cleanupGmailCompanyCandidate(value: string): string {
  const cleaned = cleanupCompanyName(value)
    .split(/[\n。！？]/)
    .map((part) => part.trim())
    .filter(Boolean)
    .at(-1)
  return cleaned ?? ''
}

function formatGmailActivityResponse(json: GmailActivityResponse, fallbackCompany: string): string {
  if (json.error === 'gmail_not_connected') {
    return [
      'Gmail連携がまだ必要です。',
      '',
      '下記からGmailを連携してください。',
      json.installUrl ?? '/api/google/install?service=gmail',
      '',
      '連携後にもう一度「HEROZ株式会社とのやりとり確認して」と送れば、Gmailを同期してアクティビティを確認します。',
    ].join('\n')
  }

  if (json.error) {
    return `Gmailアクティビティの確認に失敗しました。\n${json.message ?? json.error}`
  }

  const company = json.company ?? fallbackCompany
  const messages = json.messages ?? []
  const lines = [
    `## ${company} のGmailアクティビティ`,
    '',
    `同期: 取得 ${json.synced?.fetched ?? 0}件 / 新規保存 ${json.synced?.inserted ?? 0}件 / CRM紐付け ${json.synced?.matched ?? 0}件`,
    `表示: ${json.count ?? messages.length}件`,
  ]

  if (messages.length === 0) {
    lines.push(
      '',
      '該当するメールはまだ見つかりませんでした。会社名だけで拾えない場合は、相手のメールドメインも指定してください。'
    )
    return lines.join('\n')
  }

  lines.push('', '### 直近のやりとり')
  for (const message of messages.slice(0, 8)) {
    const direction = message.direction === 'SENT' ? '送信' : '受信'
    const date = new Date(message.sentAt).toLocaleString('ja-JP')
    const peer =
      message.direction === 'SENT'
        ? message.toAddresses.slice(0, 2).join(', ')
        : message.fromName
          ? `${message.fromName} <${message.fromAddress}>`
          : message.fromAddress
    lines.push(
      [
        `- ${date} / ${direction}`,
        `  件名: ${message.subject || '(件名なし)'}`,
        `  相手: ${peer || '-'}`,
        message.snippet ? `  内容: ${message.snippet}` : '',
      ]
        .filter(Boolean)
        .join('\n')
    )
  }

  return lines.join('\n')
}
