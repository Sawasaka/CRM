'use client'

import { useSyncExternalStore } from 'react'
import { CHAT_HISTORY_EVENT, loadAllChats, type ChatRecord } from './store'

/**
 * localStorage のチャット履歴を購読する hook。
 * useSyncExternalStore を使い、render/購読のタイミングを React に委ねることで
 * 「render 中に別コンポーネントの setState が走る」エラーを避ける。
 */
function subscribe(cb: () => void): () => void {
  if (typeof window === 'undefined') return () => {}
  window.addEventListener(CHAT_HISTORY_EVENT, cb)
  window.addEventListener('storage', cb)
  return () => {
    window.removeEventListener(CHAT_HISTORY_EVENT, cb)
    window.removeEventListener('storage', cb)
  }
}

// snapshot は immutable 参照を返す必要があるためキャッシュする
let cachedRaw: string | null = null
let cachedValue: ChatRecord[] = []
const serverSnapshot: ChatRecord[] = []

function getSnapshot(): ChatRecord[] {
  if (typeof window === 'undefined') return cachedValue
  const raw = window.localStorage.getItem('bgm:chat-history:v1')
  if (raw === cachedRaw) return cachedValue
  cachedRaw = raw
  cachedValue = loadAllChats()
  return cachedValue
}

function getServerSnapshot(): ChatRecord[] {
  return serverSnapshot
}

export function useChatHistory(): ChatRecord[] {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
