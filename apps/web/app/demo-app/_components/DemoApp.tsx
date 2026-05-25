'use client'

/**
 * /demo-app のメインクライアント。チャット型デモ。
 *
 * - 5体のエージェントに対応するサンプル質問を提示
 * - 質問クリックで Mock レスポンスを擬似ストリーミング表示
 * - クレジット消費を画面側でデクリメント (永続化なし、セッション完結)
 */

import { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowUp, Sparkles, User } from 'lucide-react'
import type { DemoClaims } from '@/lib/demo-token'

interface AgentDef {
  id: 'sales' | 'marketing' | 'support' | 'helpdesk' | 'pdm'
  name: string
  color: string
}

const AGENTS: Record<AgentDef['id'], AgentDef> = {
  sales:     { id: 'sales',     name: 'Sales Agent',     color: '#abc7ff' },
  marketing: { id: 'marketing', name: 'Marketing Agent', color: '#ffcf4a' },
  support:   { id: 'support',   name: 'Customer Agent',  color: '#ff8dcf' },
  helpdesk:  { id: 'helpdesk',  name: 'Knowledge Agent', color: '#c8b9ff' },
  pdm:       { id: 'pdm',       name: 'Product Agent',   color: '#8dffc9' },
}

interface PresetQA {
  q: string
  a: string
  agent: AgentDef['id']
}

// クレジット 100 を狙って、各回答 ≈ 10-20 クレジット相当のボリュームに設定
const PRESETS: PresetQA[] = [
  {
    q: '今週アプローチすべき HOT 企業を教えて',
    agent: 'sales',
    a: `## 今週の HOT 企業 TOP3 (デモデータ)

1. **アクトラス株式会社** — SaaS / 営業 + CS、求人インテント HOT (+12部門)、資料DL 3回
2. **株式会社メリディアン** — 製造 / 生産 + 技術、IR訪問 2回、求人 +8
3. **PoltCraft Inc.** — FinTech / プロダクト、ウェビナー参加、求人 +5

いずれも今週中の打診を推奨します。`,
  },
  {
    q: '先週の議事録から要望機能を集計して',
    agent: 'pdm',
    a: `## 先週の議事録から抽出した要望機能 (デモデータ)

1. Salesforce 双方向連携 — 14社言及
2. 議事録の話者分離と発言サマリー — 11社
3. PDM ダッシュボードのスコア閾値カスタム — 9社
4. Marketo / HubSpot 双方向シーケンス — 8社

PdM レビューに上げる候補としてランキング化済みです。`,
  },
  {
    q: '未対応チケットを担当者ごとに集計して',
    agent: 'support',
    a: `## 未対応チケット (担当別 / デモデータ)

- 佐藤: 8 件 (うち高優先度 1)
- 田中: 6 件
- 鈴木: 5 件
- 高橋: 3 件
- 中村: 2 件

最も古いチケット: T-1042 「ログイン2段階認証が突然要求される」(佐藤 / 3時間経過)。`,
  },
  {
    q: '採用インテントが伸びてる企業 TOP10',
    agent: 'marketing',
    a: `## 採用インテント急上昇企業 (デモデータ)

| 順位 | 企業名 | 部門 | 前週比 |
| --- | --- | --- | --- |
| 1 | アクトラス | 営業 / CS | +12 |
| 2 | セレナーデ商事 | 営業 / IT | +9 |
| 3 | メリディアン | 生産 / 技術 | +8 |
| 4 | ベルガモット工業 | R&D / IT | +6 |
| 5 | PoltCraft Inc. | プロダクト | +5 |

ナーチャリングシーケンス起動の対象として推奨。`,
  },
  {
    q: 'ベテランの提案テンプレートを教えて',
    agent: 'helpdesk',
    a: `## トップセールス提案テンプレート (デモデータ)

1. **業界別フック** — 製造: 工数20%削減、SaaS: ARR成長率、商社: 商談リードタイム
2. **アンチパターン回避**: 「全機能を見せる」「価格を最初に出す」「決裁者の課題を確認しない」
3. **クロージング**: 1ヶ月PoC → 効果計測 → 経営層レビューの3ステップ

社内ナレッジから自動収集済みです。`,
  },
]

type Message =
  | { id: string; role: 'user'; text: string }
  | { id: string; role: 'agent'; agent: AgentDef['id']; text: string; partial?: boolean }

const COST_PER_QUESTION = 8 // 1 質問 = 8 クレジット消費 (100 ÷ 8 ≈ 12 回試せる感覚)

export const DemoApp = ({ claims }: { claims: DemoClaims }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init',
      role: 'agent',
      agent: 'sales',
      text: `${claims.name} 様、ようこそ。\nこちらは ${claims.company} 専用に発行されたクリーンなデモ環境です。下の例から試したい質問を選ぶか、自由に入力してください。`,
    },
  ])
  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState(false)
  const [credits, setCredits] = useState(claims.credits)
  const threadRef = useRef<HTMLDivElement | null>(null)

  // セッションごとに残クレジットを localStorage に保存して、リロード時も復元する
  const storageKey = useMemo(() => `demo:${claims.sessionId}:credits`, [claims.sessionId])
  useEffect(() => {
    const stored = typeof window !== 'undefined' ? window.localStorage.getItem(storageKey) : null
    if (stored !== null) {
      const n = Number(stored)
      if (!Number.isNaN(n)) setCredits(Math.max(0, Math.min(claims.credits, n)))
    }
  }, [storageKey, claims.credits])
  useEffect(() => {
    if (typeof window === 'undefined') return
    window.localStorage.setItem(storageKey, String(credits))
  }, [storageKey, credits])

  // 自動スクロール
  useEffect(() => {
    const el = threadRef.current
    if (!el) return
    el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
  }, [messages])

  function streamAgentReply(agent: AgentDef['id'], full: string) {
    setStreaming(true)
    const id = `a-${Date.now()}`
    setMessages((ms) => [...ms, { id, role: 'agent', agent, text: '', partial: true }])
    let i = 0
    const tick = () => {
      i += 4
      setMessages((ms) =>
        ms.map((m) =>
          m.id === id && m.role === 'agent'
            ? { ...m, text: full.slice(0, i), partial: i < full.length }
            : m,
        ),
      )
      if (i < full.length) {
        setTimeout(tick, 28)
      } else {
        setStreaming(false)
      }
    }
    setTimeout(tick, 220)
  }

  function send(input: string, preset?: PresetQA) {
    const trimmed = input.trim()
    if (!trimmed || streaming) return
    if (credits < COST_PER_QUESTION) return
    setCredits((c) => Math.max(0, c - COST_PER_QUESTION))
    setMessages((ms) => [...ms, { id: `u-${Date.now()}`, role: 'user', text: trimmed }])
    setInput('')
    const matched =
      preset ?? PRESETS.find((p) => p.q === trimmed) ?? {
        q: trimmed,
        agent: 'sales' as const,
        a: `「${trimmed}」 — デモ環境のため、サンプル回答のみご利用いただけます。\n本番では、実データから AI エージェントが具体的な回答を返します。下の例から別の質問もお試しください。`,
      }
    streamAgentReply(matched.agent, matched.a)
  }

  const noCredits = credits < COST_PER_QUESTION

  return (
    <div className="mx-auto max-w-3xl px-5 py-10 md:py-14">
      {/* ヒーロー */}
      <div className="text-center mb-8">
        <div className="text-[10px] uppercase tracking-[0.18em] text-[#9b99a0] mb-3">
          ROOKIE SMART · CHAT CRM
        </div>
        <h1 className="font-display font-bold tracking-[-0.025em] text-[1.6rem] md:text-[2rem] leading-[1.2]">
          <span className="fo-gradient-text">何を調べますか？</span>
        </h1>
        <p className="mt-3 text-[12.5px] text-[#9b99a0]">
          サンプル質問を選ぶか、自由に入力してください。1 質問あたり {COST_PER_QUESTION} クレジット消費します。
        </p>
      </div>

      {/* メッセージ */}
      <div
        ref={threadRef}
        className="rounded-2xl p-5 max-h-[480px] overflow-y-auto space-y-5"
        style={{
          background: 'rgba(255,255,255,0.02)',
          boxShadow: 'inset 0 0 0 1px rgba(171,199,255,0.10)',
        }}
      >
        {messages.map((m) => (
          <MessageBubble key={m.id} message={m} />
        ))}
      </div>

      {/* 入力 */}
      <div
        className="mt-4 rounded-[16px] p-1.5 transition-shadow"
        style={{
          background: 'var(--color-obs-surface-high)',
          boxShadow: input ? '0 0 0 2px rgba(171,199,255,0.18)' : '0 8px 24px rgba(0,0,0,0.3)',
        }}
      >
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
              e.preventDefault()
              send(input)
            }
          }}
          rows={2}
          placeholder={noCredits ? 'クレジットを使い切りました' : 'ルキスマCRM に何でも尋ねる — Enterで送信'}
          disabled={noCredits || streaming}
          className="w-full bg-transparent resize-none outline-none px-4 pt-3 pb-2 text-[14px] leading-relaxed"
          style={{ color: 'var(--color-obs-text)' }}
        />
        <div className="flex items-center justify-between px-3 pb-2 pt-1">
          <span className="text-[10.5px] text-[#9b99a0]">
            残り {credits} クレジット
          </span>
          <button
            type="button"
            onClick={() => send(input)}
            disabled={!input.trim() || streaming || noCredits}
            className="w-9 h-9 rounded-full inline-flex items-center justify-center transition-all disabled:opacity-40"
            style={{
              background:
                input.trim() && !noCredits && !streaming
                  ? 'linear-gradient(140deg, var(--color-obs-primary), var(--color-obs-primary-container))'
                  : 'var(--color-obs-surface-highest)',
              color: 'var(--color-obs-on-primary)',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.18)',
            }}
            title="送信 (Enter)"
          >
            <ArrowUp size={15} strokeWidth={2.5} />
          </button>
        </div>
      </div>

      {/* プリセット */}
      <div className="mt-5">
        <div className="text-[10px] uppercase tracking-[0.14em] text-[#7e7c83] mb-2.5">
          サンプル質問
        </div>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((p) => {
            const a = AGENTS[p.agent]
            return (
              <button
                key={p.q}
                type="button"
                onClick={() => send(p.q, p)}
                disabled={streaming || noCredits}
                className="inline-flex items-center gap-2 rounded-full pl-2 pr-3 py-1.5 text-[12px] text-[#e7e5ea] transition-colors disabled:opacity-40"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  boxShadow: 'inset 0 0 0 1px rgba(171,199,255,0.18)',
                }}
              >
                <span
                  className="inline-block w-2 h-2 rounded-full"
                  style={{
                    background: a.color,
                    boxShadow: `0 0 8px ${a.color}aa`,
                  }}
                />
                {p.q}
                <span className="text-[#7e7c83] hidden sm:inline">→ {a.name}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* フッターメモ */}
      <div className="mt-12 text-[11px] text-[#7e7c83] text-center leading-relaxed">
        ※ ここに表示されているのは全てサンプルデータです。{claims.company} 専用の本番環境とは独立しています。
        <br />
        導入のご相談は{' '}
        <a
          href={`mailto:h.sawasaka@rookiesmart.jp?subject=ルキスマCRM 導入相談 (${claims.company})`}
          className="hover:opacity-90 underline decoration-dotted underline-offset-2"
          style={{ color: '#abc7ff' }}
        >
          h.sawasaka@rookiesmart.jp
        </a>{' '}
        まで。
      </div>
    </div>
  )
}

function MessageBubble({ message }: { message: Message }) {
  if (message.role === 'user') {
    return (
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-1.5">
          <User size={11} color="#9b99a0" />
          <span className="text-[10.5px] text-[#9b99a0]">あなた</span>
        </div>
        <p className="text-[13px] text-[#c7c5c9] leading-relaxed whitespace-pre-wrap pl-4">
          {message.text}
        </p>
      </div>
    )
  }
  const a = AGENTS[message.agent]
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-1.5">
        <Sparkles size={11} color={a.color} />
        <span className="text-[10.5px]" style={{ color: a.color }}>
          {a.name}
        </span>
      </div>
      <div className="text-[13px] leading-relaxed whitespace-pre-wrap" style={{ color: '#e7e5ea' }}>
        {message.text}
        {message.partial && <span className="opacity-50 ml-0.5">▍</span>}
      </div>
    </div>
  )
}
