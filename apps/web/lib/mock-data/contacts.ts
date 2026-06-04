// 共有コンタクトモック (contacts ページ / lists ページなど横断利用)
// Phase 1: モック / 将来は API 経由で取得し ID キャッシュに乗せる想定。
import type { ApproachStatus } from '@/types/crm'

export type Rank = 'A' | 'B' | 'C'
export type ContactStatus = 'リード' | '商談中' | '顧客' | '休眠' | '失注'
export type NextAction = 'メールアプローチ' | 'コール' | '連絡待ち' | null
export type PersonRole = '決裁者' | '推進者' | '一般'

export type LeadSourceType =
  | 'web_form'
  | 'organic_search'
  | 'paid_ads'
  | 'sns'
  | 'event'
  | 'referral'
  | 'cold_call'
  | 'cold_mail'
  | 'partner'
  | 'inbound'
  | 'other'

export interface LeadSource {
  type: LeadSourceType
  detail: string
}

export interface Contact {
  id: string
  name: string
  title: string
  department: string
  personRole: PersonRole
  company: string
  companyId: string
  rank: Rank
  status: ApproachStatus
  contactStatus: ContactStatus
  leadSource: LeadSource
  callAttempts: number
  emailsSent: number
  lastCallAt: string | null
  nextActionAt: string | null
  nextAction: NextAction
  owner: string  // 担当者名(タスク担当者と整合)
}

export const MOCK_CONTACTS: Contact[] = []

// id を key にした map (頻繁な lookup 用)
export const MOCK_CONTACTS_BY_ID: Record<string, Contact> = {}
