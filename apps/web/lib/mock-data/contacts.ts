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

export const MOCK_CONTACTS: Contact[] = [
  { id: '1', name: '田中 誠',    title: '営業部長',   department: '営業部',     personRole: '決裁者', company: '株式会社テクノリード',    companyId: '1', rank: 'A', status: 'アポ獲得',   contactStatus: '商談中', leadSource: { type: 'inbound',  detail: '公式サイトの資料DLフォーム経由' },             callAttempts: 3, emailsSent: 5, lastCallAt: '2026-03-20', nextActionAt: '2026-03-28', nextAction: '連絡待ち', owner: '田中太郎' },
  { id: '2', name: '山本 佳子',  title: 'マネージャー', department: '購買部',     personRole: '推進者', company: '合同会社フューチャー',    companyId: '2', rank: 'A', status: '接続済み',   contactStatus: '商談中', leadSource: { type: 'event',    detail: '2026年Q1 SaaSWORLD出展時に名刺交換' },         callAttempts: 5, emailsSent: 8, lastCallAt: '2026-03-19', nextActionAt: '2026-03-22', nextAction: 'メールアプローチ', owner: '鈴木花子' },
  { id: '3', name: '佐々木 拓也', title: '代表取締役',  department: '経営企画',   personRole: '決裁者', company: '株式会社イノベーション',  companyId: '3', rank: 'A', status: '接続済み',   contactStatus: 'リード', leadSource: { type: 'referral', detail: '既存顧客（株式会社グロース）からの紹介' },     callAttempts: 2, emailsSent: 3, lastCallAt: '2026-03-18', nextActionAt: '2026-03-25', nextAction: 'コール', owner: '田中太郎' },
  { id: '4', name: '中村 理恵',  title: '購買担当',   department: '調達部',     personRole: '一般',  company: '株式会社グロース',        companyId: '4', rank: 'B', status: '不在',      contactStatus: 'リード', leadSource: { type: 'paid_ads', detail: 'Google広告 (キーワード: SFA 切替)' },           callAttempts: 4, emailsSent: 2, lastCallAt: '2026-03-15', nextActionAt: null, nextAction: 'コール', owner: '佐藤次郎' },
  { id: '5', name: '小林 健太',  title: '部長',      department: '営業部',     personRole: '推進者', company: '有限会社サクセス',        companyId: '5', rank: 'B', status: '不通',      contactStatus: 'リード', leadSource: { type: 'cold_call', detail: '営業リスト経由 (2026/02)' },                  callAttempts: 6, emailsSent: 1, lastCallAt: '2026-03-14', nextActionAt: '2026-03-23', nextAction: 'コール', owner: '鈴木花子' },
  { id: '6', name: '鈴木 美香',  title: '課長',      department: 'マーケ部',   personRole: '一般',  company: '株式会社ネクスト',        companyId: '6', rank: 'C', status: '未着手',    contactStatus: 'リード', leadSource: { type: 'organic_search', detail: 'Google検索 → 比較記事' },                callAttempts: 0, emailsSent: 0, lastCallAt: null,          nextActionAt: null, nextAction: null, owner: '田中太郎' },
  { id: '7', name: '加藤 雄介',  title: '取締役',    department: '経営企画',   personRole: '決裁者', company: '合同会社ビジョン',        companyId: '7', rank: 'C', status: '未着手',    contactStatus: '休眠',  leadSource: { type: 'partner',  detail: 'パートナー(株式会社アライアンス)経由' },         callAttempts: 0, emailsSent: 0, lastCallAt: null,          nextActionAt: null, nextAction: null, owner: '田中太郎' },
  { id: '8', name: '吉田 千春',  title: '部長',      department: '人事部',     personRole: '推進者', company: '株式会社スタート',        companyId: '8', rank: 'C', status: 'コール不可', contactStatus: '失注',  leadSource: { type: 'cold_mail', detail: '一斉メール 2025/11 配信' },                    callAttempts: 8, emailsSent: 4, lastCallAt: '2026-03-01', nextActionAt: null, nextAction: null, owner: '佐藤次郎' },
  { id: '9', name: '高橋 健一',  title: 'CTO',       department: 'エンジニアリング部', personRole: '決裁者', company: '株式会社デジタルフォース', companyId: '9', rank: 'A', status: '未着手',    contactStatus: 'リード', leadSource: { type: 'organic_search', detail: 'Google検索 → CTO向け技術記事' },         callAttempts: 0, emailsSent: 0, lastCallAt: null,          nextActionAt: null, nextAction: null, owner: '鈴木花子' },
]

// id を key にした map (頻繁な lookup 用)
export const MOCK_CONTACTS_BY_ID: Record<string, Contact> = Object.fromEntries(
  MOCK_CONTACTS.map((c) => [c.id, c]),
)
