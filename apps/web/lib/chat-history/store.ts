'use client'

/**
 * チャット履歴ローカルストア (localStorage v1)
 *
 * サーバ永続化前のMVP。ユーザ毎に1ブラウザで保持する。
 * 変更時には CustomEvent('bgm:chat-history-changed') を発火し、
 * sidebar / page など複数コンポーネントが同期できるようにする。
 */

import type { CompanyBrief } from '@/components/ai/CompanyBriefCard'
import type { AgentKey } from '@/components/landing/atoms'

export type StoredChatMessage = {
  role: 'user' | 'assistant'
  content: string
  model?: string
  elapsedMs?: number
  companyBrief?: CompanyBrief
  agent?: AgentKey
}

export type ChatRecord = {
  id: string
  title: string
  updatedAt: string
  messages: StoredChatMessage[]
}

const STORAGE_KEY = 'bgm:chat-history:v1'
const EVENT_NAME = 'bgm:chat-history-changed'

function notify() {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent(EVENT_NAME))
}

// 古い/壊れた title を持つレコードを開いた時に、最初の user message から
// タイトルを再生成する。ユーザーが手動でリネームしたタイトルは保持する。
const GENERIC_TITLES = new Set(['', '新しいチャット', '無題のチャット'])

function repairTitle(c: ChatRecord): ChatRecord {
  const current = (c.title ?? '').trim()
  if (!GENERIC_TITLES.has(current)) return c
  const firstUser = c.messages?.find(
    (m) => m.role === 'user' && typeof m.content === 'string' && m.content.trim().length > 0,
  )
  if (!firstUser) return c
  const next = deriveTitle(firstUser.content)
  if (next === current) return c
  return { ...c, title: next }
}

function hasUserMessage(c: ChatRecord): boolean {
  return !!c.messages?.some(
    (m) => m.role === 'user' && typeof m.content === 'string' && m.content.trim().length > 0,
  )
}

export function loadAllChats(): ChatRecord[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed
      .filter((c): c is ChatRecord =>
        !!c && typeof c === 'object' && typeof (c as ChatRecord).id === 'string',
      )
      // user message が無い空のチャット (過去バージョンや fallback で
      // 生まれた "新しいチャット" 表示の幽霊レコード) は履歴から外す。
      .filter(hasUserMessage)
      .map(repairTitle)
  } catch {
    return []
  }
}

function saveAll(chats: ChatRecord[]) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(chats))
    notify()
  } catch {
    // localStorage が利用不可な環境では黙ってスキップ
  }
}

export function getChat(id: string): ChatRecord | undefined {
  return loadAllChats().find((c) => c.id === id)
}

export function upsertChat(chat: ChatRecord) {
  const all = loadAllChats()
  const idx = all.findIndex((c) => c.id === chat.id)
  if (idx >= 0) all[idx] = chat
  else all.unshift(chat)
  saveAll(all)
}

export function deleteChatRecord(id: string) {
  saveAll(loadAllChats().filter((c) => c.id !== id))
}

export function renameChatRecord(id: string, newTitle: string) {
  const all = loadAllChats()
  const idx = all.findIndex((c) => c.id === id)
  if (idx < 0) return
  const cur = all[idx]
  if (!cur) return
  all[idx] = { ...cur, title: newTitle.trim() || cur.title }
  saveAll(all)
}

export function generateChatId(): string {
  return `chat_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

export function deriveTitle(firstUserMessage: string): string {
  const t = firstUserMessage.replace(/\s+/g, ' ').trim()
  if (!t) return '無題のチャット'
  return t.length > 28 ? `${t.slice(0, 28)}…` : t
}

export const CHAT_HISTORY_EVENT = EVENT_NAME
