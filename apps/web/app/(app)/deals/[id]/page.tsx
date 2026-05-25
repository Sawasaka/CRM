'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ResearchChatPanel } from '@/components/research/ResearchChatPanel'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronLeft,
  Phone,
  Building2,
  Target,
  Calendar,
  TrendingUp,
  Zap,
  BookOpen,
  CheckCircle2,
  Mail,
  Clock,
  Star,
  Plus,
  Pencil,
  X,
  Briefcase,
  Trash2,
  FileText,
  Layers,
  Users,
  Flame,
  Activity,
  History,
  StickyNote,
  Cpu,
  Headphones,
  Globe,
  MapPin,
  ExternalLink,
  LifeBuoy,
  Radio,
  Sparkles,
  Upload,
  AlertTriangle,
  Ticket,
} from 'lucide-react'
import { ObsPageShell } from '@/components/obsidian'
// コンタクト詳細と同じアクティビティ仕様を再利用 (タブ: すべて / コール / メール / 会議)
import { ContactHistoryTimeline } from '@/app/(app)/contacts/_components/ContactHistoryTimeline'
// 開発優先度ページから抽出データを取り込み (議事録 + 問い合わせチケット起点)
import {
  MOCK_PRIORITY_ITEMS,
  type PriorityCategory,
  type PriorityItem,
} from '@/lib/mock-data/priority'
import { CreateTicketModal } from '@/app/(app)/tickets/_components/CreateTicketModal'
import { StatusBadge as TicketStatusBadge } from '@/app/(app)/tickets/_components/StatusBadge'
import type { TicketListItem } from '@/app/(app)/tickets/_types'
import { getCompanyFirstPartySignal } from '@/lib/mock-data/firstPartySignals'

// ═══════════════════════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════════════════════

// パイプライン側 (app/(app)/pipeline/page.tsx) の StageKey と一致させる
type DealStage =
  | 'IS' | 'MEETING_PLANNED' | 'MEETING_DONE'
  | 'PROJECT_PLANNED' | 'MULTI_MEETING' | 'POC'
  | 'CLOSED_WON' | 'LOST_DEAL' | 'CHURN' | 'LOST'

type DealStatus = 'アクティブ' | '優先対応' | '保留'

type ISContactStatus = '未着手' | '不通' | '不在' | '接続済み' | 'コール不可' | 'アポ獲得' | 'その他'

interface ISContact {
  id: string
  name: string
  title: string
  status: ISContactStatus
  callAttempts: number
  isDecisionMaker: boolean
}

type ConfidenceLevel = 'High' | 'Medium' | 'Low'

type ActivityType = 'call' | 'email' | 'note' | 'deal_advance'

type ISFieldKey = string

// IS段階の選択値（チップで表示する系）
type ISConsiderationPhase = '情報収集' | '検討中' | '比較検討' | '導入決定間近' | '未確認'
type ISServiceAwareness = '未認知' | '名前は知っている' | '内容を理解' | '導入経験あり' | '未確認'
type ISContactPreference = '電話' | 'メール' | 'Slack' | 'Web会議' | '対面' | '未確認'
type ISRequestedItem = '資料' | 'お見積もり' | 'デモ' | 'トライアル' | '事例紹介' | '個別相談'
type ISTaskItem = '資料請求' | 'デモ依頼' | '見積依頼' | '事例提供' | '社内共有' | '稟議用情報'

interface ISField {
  key: ISFieldKey
  label: string
  value: string | null
  isDefault: boolean   // true = 既定項目(電話・メールから自動抽出) / false = ユーザー追加カスタム
  // チップ表示用の構造化データ（任意）
  chipValue?: ISConsiderationPhase | ISServiceAwareness | ISContactPreference
  chipList?: (ISRequestedItem | ISTaskItem)[]
}

type SalesFieldKey = string

// 出席者：取引に参加した人。コンタクトIDで紐付けて詳細ページへワンクリック遷移
interface Participant {
  name: string
  contactId?: string   // コンタクトIDがあればワンクリックで /contacts/[id] へ
  department: string   // 部署
  title: string        // 役職 (CTO / 部長 / マネージャー 等)
  role: string         // この取引における役割 (決裁者 / 技術評価 / 推進担当 等)
}

interface SalesField {
  key: SalesFieldKey
  label: string
  value: string | null
  isDefault: boolean              // true = 既定項目(議事録から自動抽出) / false = ユーザー追加カスタム
  confidence?: ConfidenceLevel   // ※UI表示は廃止、データは互換のため残置
  participants?: Participant[]   // '出席者' のときに使用
}

interface DealDetail {
  id: string
  name: string
  company: string
  companyId: string
  contact: string
  contactId: string
  contactPhone: string
  owner: string
  stage: DealStage
  status: DealStatus
  amount: number
  probability: number
  expectedCloseAt: string | null
  updatedAt: string
  // 進捗管理（フリーテキスト）— パイプラインカードと連動想定
  progressStatus: string
  nextAction: string
  nextActionDate: string | null
  memo: string
}

interface StageHistoryItem {
  stage: DealStage
  date: string
  daysAgo: number
  isCurrent: boolean
}

interface ActivityItem {
  id: string
  type: ActivityType
  timestamp: string
  title: string
  result?: string
  durationSec?: number
  description?: string
}

interface DbDealResponse {
  deal: {
    id: string
    name: string
    stage: string
    amount: number | null
    probability: number | null
    expectedCloseAt: string | null
    updatedAt: string
    nextActionUs: string | null
    timeline: string | null
    desiredService: string | null
    company: { id: string; name: string }
    contact: { id: string; name: string; email: string | null; phone: string | null } | null
    owner: { name: string }
  }
  activities: Array<{
    id: string
    type: string
    title: string
    content: string | null
    occurredAt: string
  }>
}

// 議事録（個別）
interface MeetingRecord {
  id: string
  date: string
  sequence: number
  title: string
  participants: string[]
  durationMin: number
  summary: string
  keyPoints: string[]
}

// 取引タスク
type DealTaskType = 'call' | 'email' | 'meeting' | 'proposal' | 'followup' | 'other'

interface DealTask {
  id: string
  type: DealTaskType
  title: string
  dueAt: string | null
  memo: string
  done: boolean
}

// ═══════════════════════════════════════════════════════════════════════════════
// Mock Data
// ═══════════════════════════════════════════════════════════════════════════════

const MOCK_DEALS: Record<string, DealDetail> = {
  'd1': {
    id: 'd1', name: '株式会社テクノリード - 2026/01/15',
    company: '株式会社テクノリード', companyId: '1',
    contact: '田中 誠', contactId: '1', contactPhone: '090-1234-5678',
    owner: '田中太郎', stage: 'POC', status: 'アクティブ',
    amount: 4800000, probability: 80, expectedCloseAt: '2026-03-31', updatedAt: '2026-03-22',
    progressStatus: '提案フェーズ / 最終見積回答待ち',
    nextAction: '決裁者(CTO鈴木氏)同席の最終デモ',
    nextActionDate: '2026-04-25',
    memo: 'CTO鈴木氏はSlack連携を最重視。初期サポートの厚みを強調すると刺さる傾向。社内稟議のタイミングに合わせて4/1までに最終見積回答予定。',
  },
  'd2': {
    id: 'd2', name: '株式会社イノベーション - 大型案件',
    company: '株式会社イノベーション', companyId: '3',
    contact: '佐々木 拓也', contactId: '3', contactPhone: '090-3456-7890',
    owner: '田中太郎', stage: 'POC', status: '優先対応',
    amount: 6000000, probability: 90, expectedCloseAt: '2026-03-28', updatedAt: '2026-03-21',
    progressStatus: '口頭合意済 / 契約書ドラフト確認中',
    nextAction: '契約書の最終レビューと押印手配',
    nextActionDate: '2026-04-26',
    memo: '代表者直々の商談で即決型。契約書レビューは法務経由で通常3営業日。押印はクラウドサイン利用予定。',
  },
  'd3': {
    id: 'd3', name: '合同会社フューチャー - 2026/02/01',
    company: '合同会社フューチャー', companyId: '2',
    contact: '山本 佳子', contactId: '2', contactPhone: '090-2345-6789',
    owner: '鈴木花子', stage: 'MEETING_PLANNED', status: 'アクティブ',
    amount: 2400000, probability: 40, expectedCloseAt: '2026-04-15', updatedAt: '2026-03-19',
    progressStatus: 'ヒアリング継続 / 予算確認中',
    nextAction: '2回目商談で要件整理',
    nextActionDate: '2026-04-30',
    memo: '山本氏は現場マネージャーで決裁権限なし。決裁者は別途特定が必要。Zoho CRM との比較軸をこちらから提示すると有利。',
  },
  'd4': {
    id: 'd4', name: '株式会社グロース - HR導入',
    company: '株式会社グロース', companyId: '4',
    contact: '中村 理恵', contactId: '4', contactPhone: '090-4567-8901',
    owner: '佐藤次郎', stage: 'MEETING_PLANNED', status: 'アクティブ',
    amount: 900000, probability: 30, expectedCloseAt: '2026-04-30', updatedAt: '2026-03-10',
    progressStatus: '初期ヒアリング完了 / 費用感共有待ち',
    nextAction: '比較資料を送付後フォローコール',
    nextActionDate: '2026-05-05',
    memo: '予算と優先度の両面で社内調整が必要な状況。人事部長を巻き込むタイミングを見極めたい。',
  },
}

// ─── 紐付け企業情報（取引に紐付く企業の基本プロファイル） ─────────────
interface LinkedCompanyInfo {
  industry: string
  employees: string
  address: string
  phone: string
  websiteUrl: string
  representative?: string
}

const DEAL_LINKED_COMPANIES: Record<string, LinkedCompanyInfo> = {
  'd1': {
    industry: 'SaaS / 業務システム',
    employees: '120名',
    address: '東京都港区赤坂1-2-3',
    phone: '03-1234-5600',
    websiteUrl: 'https://techno-lead.co.jp',
    representative: '高橋 正人',
  },
  'd2': {
    industry: 'IT / コンサルティング',
    employees: '350名',
    address: '東京都千代田区丸の内2-3-4',
    phone: '03-5678-9000',
    websiteUrl: 'https://innovation.co.jp',
    representative: '佐々木 拓也',
  },
  'd3': {
    industry: '物流テック / 3PL',
    employees: '60名',
    address: '東京都新宿区西新宿3-4-5',
    phone: '03-2345-6700',
    websiteUrl: 'https://future-llc.jp',
    representative: '山田 健一',
  },
  'd4': {
    industry: 'HR Tech / 採用支援',
    employees: '85名',
    address: '東京都渋谷区恵比寿4-5-6',
    phone: '03-3456-7800',
    websiteUrl: 'https://growth-inc.jp',
    representative: '小林 翔',
  },
}

// ─── インテント（部門別の採用動向集約）──────────────────────────────
interface DealIntentRow {
  intentLevel: 'HOT' | 'MIDDLE' | 'LOW' | 'NONE'
  departmentType: string
  signalCount: number
  latestSignalAt: string | null
}

const DEAL_INTENTS: Record<string, DealIntentRow[]> = {
  'd1': [
    { intentLevel: 'HOT',    departmentType: 'it_engineer', signalCount: 8, latestSignalAt: '2026-04-23' },
    { intentLevel: 'HOT',    departmentType: 'sales_is',    signalCount: 5, latestSignalAt: '2026-04-22' },
    { intentLevel: 'MIDDLE', departmentType: 'cs_success',  signalCount: 3, latestSignalAt: '2026-04-12' },
  ],
  'd2': [
    { intentLevel: 'HOT',    departmentType: 'it_dx',     signalCount: 6, latestSignalAt: '2026-04-25' },
    { intentLevel: 'MIDDLE', departmentType: 'pdm',       signalCount: 2, latestSignalAt: '2026-04-10' },
  ],
  'd3': [
    { intentLevel: 'MIDDLE', departmentType: 'operations',   signalCount: 4, latestSignalAt: '2026-04-20' },
    { intentLevel: 'LOW',    departmentType: 'engineering',  signalCount: 1, latestSignalAt: '2026-03-30' },
  ],
  'd4': [
    { intentLevel: 'HOT',    departmentType: 'hr_recruit',  signalCount: 7, latestSignalAt: '2026-04-24' },
    { intentLevel: 'MIDDLE', departmentType: 'sales_fs',    signalCount: 3, latestSignalAt: '2026-04-15' },
  ],
}

// ─── 採用シグナル履歴（求人ボックス等のクロール結果） ────────────────
interface DealIntentSignal {
  id: string
  title: string
  signalType: string
  source: string
  sourceUrl: string
  publishedAt: string | null
  departmentType: string | null
}

const DEAL_INTENT_SIGNALS: Record<string, DealIntentSignal[]> = {
  'd1': [
    { id: 's1-1', title: '【東京/赤坂】SaaSエンジニア / Go・TypeScript / 基盤強化フェーズ',           signalType: 'job_posting', source: '求人ボックス', sourceUrl: 'https://xn--pckua2a7gp15o89zb.com/?q=' + encodeURIComponent('株式会社テクノリード SaaSエンジニア'),  publishedAt: '2026-04-23', departmentType: 'it_engineer' },
    { id: 's1-2', title: 'インサイドセールス（SDR/BDR） / アウトバウンド比率高め / リーダー候補',      signalType: 'job_posting', source: '求人ボックス', sourceUrl: 'https://xn--pckua2a7gp15o89zb.com/?q=' + encodeURIComponent('株式会社テクノリード インサイドセールス'),  publishedAt: '2026-04-22', departmentType: 'sales_is' },
    { id: 's1-3', title: 'カスタマーサクセス（オンボーディング担当） / SaaS提案経験者歓迎',           signalType: 'job_posting', source: '求人ボックス', sourceUrl: 'https://xn--pckua2a7gp15o89zb.com/?q=' + encodeURIComponent('株式会社テクノリード カスタマーサクセス'),  publishedAt: '2026-04-12', departmentType: 'cs_success' },
    { id: 's1-4', title: 'バックエンドエンジニア / マイクロサービス基盤刷新',                          signalType: 'job_posting', source: '求人ボックス', sourceUrl: 'https://xn--pckua2a7gp15o89zb.com/?q=' + encodeURIComponent('株式会社テクノリード バックエンドエンジニア'), publishedAt: '2026-04-09', departmentType: 'it_engineer' },
    { id: 's1-5', title: 'SRE/プラットフォームエンジニア / Kubernetes・Terraform',                    signalType: 'job_posting', source: '求人ボックス', sourceUrl: 'https://xn--pckua2a7gp15o89zb.com/?q=' + encodeURIComponent('株式会社テクノリード SRE'),                publishedAt: '2026-04-05', departmentType: 'it_engineer' },
  ],
  'd2': [
    { id: 's2-1', title: 'DXコンサルタント / 製造業向け / 大手案件リーダー候補',  signalType: 'job_posting', source: '求人ボックス', sourceUrl: 'https://xn--pckua2a7gp15o89zb.com/?q=' + encodeURIComponent('株式会社イノベーション DXコンサルタント'),  publishedAt: '2026-04-25', departmentType: 'it_dx' },
    { id: 's2-2', title: 'プロダクトマネージャー / 自社SaaSプロダクト / 拡大フェーズ', signalType: 'job_posting', source: '求人ボックス', sourceUrl: 'https://xn--pckua2a7gp15o89zb.com/?q=' + encodeURIComponent('株式会社イノベーション プロダクトマネージャー'),  publishedAt: '2026-04-10', departmentType: 'pdm' },
  ],
  'd3': [
    { id: 's3-1', title: '物流オペレーションマネージャー / 倉庫DX推進',  signalType: 'job_posting', source: '求人ボックス', sourceUrl: 'https://xn--pckua2a7gp15o89zb.com/?q=' + encodeURIComponent('合同会社フューチャー 物流オペレーション'), publishedAt: '2026-04-20', departmentType: 'operations' },
    { id: 's3-2', title: 'システムエンジニア / 在庫管理SaaS連携',          signalType: 'job_posting', source: '求人ボックス', sourceUrl: 'https://xn--pckua2a7gp15o89zb.com/?q=' + encodeURIComponent('合同会社フューチャー システムエンジニア'), publishedAt: '2026-03-30', departmentType: 'engineering' },
  ],
  'd4': [
    { id: 's4-1', title: '採用コンサルタント（SMB領域） / RPO経験者歓迎',  signalType: 'job_posting', source: '求人ボックス', sourceUrl: 'https://xn--pckua2a7gp15o89zb.com/?q=' + encodeURIComponent('株式会社グロース 採用コンサルタント'), publishedAt: '2026-04-24', departmentType: 'hr_recruit' },
    { id: 's4-2', title: 'フィールドセールス / HR Tech / 中堅企業担当',     signalType: 'job_posting', source: '求人ボックス', sourceUrl: 'https://xn--pckua2a7gp15o89zb.com/?q=' + encodeURIComponent('株式会社グロース フィールドセールス'), publishedAt: '2026-04-15', departmentType: 'sales_fs' },
  ],
}

// 25部門細分化ラベル（CompanyDetailClient と同じ）
const DEAL_DEPT_LABELS: Record<string, string> = {
  sales_is: '営業 IS', sales_fs: '営業 FS', sales_ae: '営業 AE', sales_bdr: '営業 BDR',
  sales_legal: '営業 法人/エンプラ', sales: '営業',
  it_corp: 'IT コーポレート', it_engineer: 'IT エンジニア', it_security: 'IT セキュリティ',
  it_dx: 'IT DX', it_data: 'IT データ', it_dev: 'IT 開発', it: 'IT',
  hr_recruit: '人事 採用', hr_lnd: '人事 教育研修', hr_labor: '人事 労務',
  hr_planning: '人事 企画', hr: '人事',
  fin_acct: '経理', fin_treasury: '財務', fin_audit: '監査', fin_tax: '税務', finance: '財務全般',
  mkt_digital: 'マーケ デジタル', mkt_pr: '広報', mkt_brand: 'ブランド', marketing: 'マーケ',
  cs_success: 'CS Success', cs_support: 'CS Support', pdm: 'PdM', cs: 'CS',
  legal: '法務', management: '経営', rd: 'R&D', operations: '運用', engineering: '技術', other: 'その他',
}
function dealDeptLabel(t: string | null | undefined): string {
  if (!t) return '—'
  return DEAL_DEPT_LABELS[t] ?? t
}

// ─── 提案内容（取引で提案中のサービス・契約条件） ─────────────────────
type ProposalPaymentCycle = '月額' | '年額一括' | '半年一括' | '一括買い切り'
type AttachmentType = '契約書' | 'NDA' | '見積書' | '提案書' | 'その他'

interface CustomField {
  id: string
  label: string
  value: string
}

interface ProposalAttachment {
  id: string
  name: string                // ファイル名
  type: AttachmentType        // 種別
  sizeKb: number              // 容量（KB）
  uploadedAt: string          // ISO日付
}

interface Proposal {
  id: string
  name: string                // 提案名（例: A案 / Enterprise版）
  service: string             // 提案サービス・プラン名
  amount: number              // 提案金額（税抜）
  paymentCycle: ProposalPaymentCycle
  contractMonths: number      // 契約期間（月）
  licenseCount: number | null // ライセンス数（null=該当なし）
  startAt: string | null      // 開始予定日 (ISO)
  initialFee: number | null   // 初期費用 (null=なし)
  notes: string               // 提案メモ
  customFields: CustomField[]
  attachments: ProposalAttachment[]
}

const DEAL_PROPOSALS: Record<string, Proposal[]> = {
  'd1': [
    {
      id: 'p-d1-1',
      name: '本命プラン',
      service: 'ルキスマCRM Pro / Slack連携アドオン',
      amount: 4800000,
      paymentCycle: '年額一括',
      contractMonths: 12,
      licenseCount: 30,
      startAt: '2026-04-01',
      initialFee: 300000,
      notes: 'Slack連携+AI議事録要約をフルで含む構成。CTO同席デモ後に最終調整予定。',
      customFields: [],
      attachments: [
        { id: 'a-d1-1-1', name: '提案書_ルキスマCRM_Pro_v3.pdf', type: '提案書', sizeKb: 1240, uploadedAt: '2026-03-15' },
        { id: 'a-d1-1-2', name: 'NDA_締結済.pdf', type: 'NDA', sizeKb: 320, uploadedAt: '2026-02-20' },
      ],
    },
  ],
  'd2': [
    {
      id: 'p-d2-1',
      name: 'Enterprise案',
      service: 'ルキスマCRM Enterprise',
      amount: 6000000,
      paymentCycle: '年額一括',
      contractMonths: 24,
      licenseCount: 80,
      startAt: '2026-04-15',
      initialFee: 500000,
      notes: '24ヶ月契約で20%値引き適用済み。契約書ドラフトを法務レビュー中。',
      customFields: [],
      attachments: [],
    },
  ],
  'd3': [
    {
      id: 'p-d3-1',
      name: 'Standard',
      service: 'ルキスマCRM Standard',
      amount: 2400000,
      paymentCycle: '月額',
      contractMonths: 12,
      licenseCount: 15,
      startAt: '2026-05-01',
      initialFee: null,
      notes: '初期費用なし・月額固定で提案。決裁者特定後に再見積り想定。',
      customFields: [],
      attachments: [],
    },
  ],
  'd4': [
    {
      id: 'p-d4-1',
      name: 'HR導入特化版',
      service: 'ルキスマCRM Lite (HR導入特化)',
      amount: 900000,
      paymentCycle: '月額',
      contractMonths: 6,
      licenseCount: 10,
      startAt: '2026-06-01',
      initialFee: 100000,
      notes: '小規模スタートで6ヶ月運用→拡張提案を想定。',
      customFields: [],
      attachments: [],
    },
  ],
}

const ATTACHMENT_TYPE_TONE: Record<AttachmentType, { bg: string; color: string }> = {
  '契約書':   { bg: 'rgba(110,231,161,0.14)', color: '#6ee7a1' },
  'NDA':     { bg: 'rgba(255,184,107,0.16)', color: 'var(--color-obs-middle)' },
  '見積書':   { bg: 'rgba(171,199,255,0.14)', color: 'var(--color-obs-primary)' },
  '提案書':   { bg: 'rgba(126,198,255,0.14)', color: 'var(--color-obs-low)' },
  'その他':   { bg: 'rgba(109,106,111,0.18)', color: 'var(--color-obs-text-muted)' },
}

const PAYMENT_CYCLE_TONE: Record<ProposalPaymentCycle, { bg: string; color: string }> = {
  '月額':       { bg: 'rgba(126,198,255,0.14)', color: 'var(--color-obs-low)' },
  '年額一括':   { bg: 'rgba(171,199,255,0.14)', color: 'var(--color-obs-primary)' },
  '半年一括':   { bg: 'rgba(255,184,107,0.14)', color: 'var(--color-obs-middle)' },
  '一括買い切り': { bg: 'rgba(255,107,107,0.14)', color: 'var(--color-obs-hot)' },
}

const ATTACHMENT_TYPE_OPTIONS: AttachmentType[] = ['契約書', 'NDA', '見積書', '提案書', 'その他']
const PAYMENT_CYCLE_OPTIONS: ProposalPaymentCycle[] = ['月額', '年額一括', '半年一括', '一括買い切り']

function createEmptyProposal(): Proposal {
  return {
    id: `p-new-${Date.now()}`,
    name: '新規提案',
    service: '',
    amount: 0,
    paymentCycle: '年額一括',
    contractMonths: 12,
    licenseCount: null,
    startAt: null,
    initialFee: null,
    notes: '',
    customFields: [],
    attachments: [],
  }
}

const DEAL_CONTACTS: Record<string, ISContact[]> = {
  'd1': [
    { id: '1', name: '田中 誠',   title: '営業部長', status: 'アポ獲得', callAttempts: 3, isDecisionMaker: false },
    { id: '9', name: '鈴木 一郎', title: 'CTO',      status: '未着手',   callAttempts: 0, isDecisionMaker: true  },
  ],
  'd2': [
    { id: '3', name: '佐々木 拓也', title: '代表取締役', status: '接続済み', callAttempts: 2, isDecisionMaker: true },
  ],
  'd3': [
    { id: '2', name: '山本 佳子', title: 'マネージャー', status: '接続済み', callAttempts: 5, isDecisionMaker: false },
  ],
  'd4': [
    { id: '4', name: '中村 理恵', title: '購買担当', status: '不在', callAttempts: 4, isDecisionMaker: false },
  ],
}

// ─── ISフィールド（電話とメール文から事実に基づき抽出される項目） ─────────
// IS段階のヒアリング情報。電話の文字起こし＋メール本文・件名から AI が事実ベースで抽出
const MOCK_IS_FIELDS: Record<string, ISField[]> = {
  'd1': [
    { isDefault: true, key: '担当部署', label: '担当部署', value: '営業部' },
    { isDefault: true, key: '役割', label: '役割', value: '部長（実務推進担当） / 決裁関与あり（最終決裁は社長）' },
    { isDefault: true, key: '検討フェーズ', label: '検討フェーズ', value: '検討中', chipValue: '検討中' },
    { isDefault: true, key: 'どこでサービスを知ったか', label: 'どこでサービスを知ったか', value: '展示会で初回接触 → 自社サイト経由で問い合わせ' },
    { isDefault: true, key: '会社やサービスを知っているか', label: '会社やサービスを知っているか', value: '内容を理解', chipValue: '内容を理解' },
    { isDefault: true, key: '興味やニーズ', label: '興味やニーズ', value: 'AI議事録要約 / Slackリアルタイム連携 / 営業マネージャ向けKPIダッシュボード' },
    { isDefault: true, key: '背景', label: '背景', value: '社内でCRM未導入。週次の数字集約をマネージャが手作業で行っており、深夜労働が常態化。' },
    { isDefault: true, key: '課題や問題', label: '課題や問題', value: '商談管理の属人化 / 議事録作成負荷が高い / 数字確定までのリードタイムが長い' },
    {
      isDefault: true,
      key: '求めているもの', label: '求めているもの', value: 'デモ / お見積もり / 事例紹介',
      chipList: ['デモ', 'お見積もり', '事例紹介'],
    },
    { isDefault: true, key: '解決したいことや達成したいこと', label: '解決したいことや達成したいこと', value: '商談プロセスを標準化し、週次数字を即時可視化することでマネージャ負担をゼロにしたい' },
    { isDefault: true, key: '次の進めかた', label: '次の進めかた', value: '4/25にCTO同席で最終デモ → 4/末までに見積回答 → 5月導入判定' },
    {
      isDefault: true,
      key: 'タスク', label: 'タスク', value: '資料請求 / デモ依頼 / 稟議用情報',
      chipList: ['資料請求', 'デモ依頼', '稟議用情報'],
    },
    { isDefault: true, key: '希望連絡手段', label: '希望連絡手段', value: 'メール優先（緊急時は電話可・平日10-12時）', chipValue: 'メール' },
  ],
  'd2': [
    { isDefault: true, key: '担当部署', label: '担当部署', value: '代表取締役室' },
    { isDefault: true, key: '役割', label: '役割', value: '代表取締役 / 決裁権限あり（即決可）' },
    { isDefault: true, key: '検討フェーズ', label: '検討フェーズ', value: '導入決定間近', chipValue: '導入決定間近' },
    { isDefault: true, key: 'どこでサービスを知ったか', label: 'どこでサービスを知ったか', value: '既存顧客(株式会社グロース)からの紹介' },
    { isDefault: true, key: '会社やサービスを知っているか', label: '会社やサービスを知っているか', value: '内容を理解', chipValue: '内容を理解' },
    { isDefault: true, key: '興味やニーズ', label: '興味やニーズ', value: '契約管理機能 / 役員向けダッシュボード' },
    { isDefault: true, key: '背景', label: '背景', value: '大型案件を立て続けに受注しており、契約管理と経営KPIの一元化が急務。' },
    { isDefault: true, key: '課題や問題', label: '課題や問題', value: '契約書管理がスプレッドシート / 経営会議用のKPI集計が月次の手作業' },
    { isDefault: true, key: '求めているもの', label: '求めているもの', value: 'お見積もり / 事例紹介', chipList: ['お見積もり', '事例紹介'] },
    { isDefault: true, key: '解決したいことや達成したいこと', label: '解決したいことや達成したいこと', value: '契約と経営指標を一元管理し、役員会議の意思決定スピードを倍にしたい' },
    { isDefault: true, key: '次の進めかた', label: '次の進めかた', value: '契約書ドラフトを4/26に確認 → 即押印 → 5月導入' },
    { isDefault: true, key: 'タスク', label: 'タスク', value: '見積依頼 / 事例提供', chipList: ['見積依頼', '事例提供'] },
    { isDefault: true, key: '希望連絡手段', label: '希望連絡手段', value: '電話（即決スタイル）', chipValue: '電話' },
  ],
  'd3': [
    { isDefault: true, key: '担当部署', label: '担当部署', value: '購買部' },
    { isDefault: true, key: '役割', label: '役割', value: '現場マネージャー / 決裁権限なし（決裁者は別途特定が必要）' },
    { isDefault: true, key: '検討フェーズ', label: '検討フェーズ', value: '比較検討', chipValue: '比較検討' },
    { isDefault: true, key: 'どこでサービスを知ったか', label: 'どこでサービスを知ったか', value: '展示会・イベントで名刺交換 → メールフォロー' },
    { isDefault: true, key: '会社やサービスを知っているか', label: '会社やサービスを知っているか', value: '名前は知っている', chipValue: '名前は知っている' },
    { isDefault: true, key: '興味やニーズ', label: '興味やニーズ', value: '問い合わせキュー機能 / SLAアラート' },
    { isDefault: true, key: '背景', label: '背景', value: 'Zoho CRM を導入済みだが現場利用が定着せず、再選定中。' },
    { isDefault: true, key: '課題や問題', label: '課題や問題', value: 'SLA遵守率の計測ができない / 既存ツールが現場で使われていない' },
    { isDefault: true, key: '求めているもの', label: '求めているもの', value: '資料 / お見積もり', chipList: ['資料', 'お見積もり'] },
    { isDefault: true, key: '解決したいことや達成したいこと', label: '解決したいことや達成したいこと', value: '現場が自然に使えるUIで、SLA遵守率を可視化したい' },
    { isDefault: true, key: '次の進めかた', label: '次の進めかた', value: 'Zoho比較表を4/末に提示 → 上長同席で再ヒアリング' },
    { isDefault: true, key: 'タスク', label: 'タスク', value: '資料請求 / 見積依頼', chipList: ['資料請求', '見積依頼'] },
    { isDefault: true, key: '希望連絡手段', label: '希望連絡手段', value: 'Slack(社外ゲスト)もしくはメール（火・木のみ電話可）', chipValue: 'Slack' },
  ],
  'd4': [
    { isDefault: true, key: '担当部署', label: '担当部署', value: '購買部' },
    { isDefault: true, key: '役割', label: '役割', value: '購買担当 / 最終決裁は人事部長' },
    { isDefault: true, key: '検討フェーズ', label: '検討フェーズ', value: '情報収集', chipValue: '情報収集' },
    { isDefault: true, key: 'どこでサービスを知ったか', label: 'どこでサービスを知ったか', value: '検索広告（HRTech系キーワード）経由でWebフォーム流入' },
    { isDefault: true, key: '会社やサービスを知っているか', label: '会社やサービスを知っているか', value: '名前は知っている', chipValue: '名前は知っている' },
    { isDefault: true, key: '興味やニーズ', label: '興味やニーズ', value: '採用ファネル管理 / 部長向けKPIレポート' },
    { isDefault: true, key: '背景', label: '背景', value: '採用人数が前年比2倍に増え、応募者管理がスプレッドシートで限界。' },
    { isDefault: true, key: '課題や問題', label: '課題や問題', value: '応募者ステージ管理が不透明 / 部長報告用のレポート作成に毎週2hかかる' },
    { isDefault: true, key: '求めているもの', label: '求めているもの', value: '資料 / 個別相談', chipList: ['資料', '個別相談'] },
    { isDefault: true, key: '解決したいことや達成したいこと', label: '解決したいことや達成したいこと', value: '採用ファネルを自動可視化し、部長報告レポートをワンクリックで作りたい' },
    { isDefault: true, key: '次の進めかた', label: '次の進めかた', value: '比較資料送付 → フォローコール → 人事部長を巻き込めるか打診' },
    { isDefault: true, key: 'タスク', label: 'タスク', value: '資料請求', chipList: ['資料請求'] },
    { isDefault: true, key: '希望連絡手段', label: '希望連絡手段', value: 'メール', chipValue: 'メール' },
  ],
}

// ─── 営業フィールド（議事録から自動抽出される既定項目 + ユーザーカスタム追加可） ─
// 既定項目は議事録の文章からAI抽出。出席者はコンタクトと連動。
const MOCK_SALES_FIELDS: Record<string, SalesField[]> = {
  'd1': [
    {
      key: '出席者', label: '出席者', value: null, isDefault: true,
      participants: [
        { name: '鈴木 一郎', contactId: '9', department: '技術本部',    title: 'CTO',         role: '技術評価・基盤選定の最終承認者' },
        { name: '田中 誠',   contactId: '1', department: '営業部',       title: '部長',        role: '商談プロセス改善の推進担当' },
        { name: '佐藤 由香',                  department: '情シス',       title: 'マネージャー', role: 'セキュリティ・既存システム統合担当' },
      ],
    },
    { key: '商談に至った背景',  label: '商談に至った背景',  value: '営業組織の急拡大でスプレッドシート運用が限界。展示会で当社サービスを認知 → 自社サイトから問い合わせに至る。', isDefault: true },
    { key: '社内状況',          label: '社内状況',          value: 'CRM未導入。Slack + Google Sheets + Notion の組み合わせで運用。情シス部門がSlack中心の運用標準化を推進中。', isDefault: true },
    { key: '課題',              label: '課題',              value: '商談管理の属人化。週次の数字集約に毎週4-5時間を要し、営業マネージャが深夜労働を強いられている。',                isDefault: true },
    { key: 'ニーズ',            label: 'ニーズ',            value: '商談進捗を即時可視化し、マネージャ負担ゼロで週次数字を確定したい。AIで議事録作成も自動化したい。',          isDefault: true },
    { key: '達成したい事',      label: '達成したい事',      value: '半期内に営業組織のデータ基盤を統合し、受注予測精度を経営に対して説明可能なレベルまで引き上げる。',          isDefault: true },
    { key: '必要なこと',        label: '必要なこと',        value: 'Slack双方向連携 / AI議事録要約 / KPIダッシュボード / 既存スプレッドシートからの移行支援',                  isDefault: true },
    { key: '現状',              label: '現状',              value: 'Google Sheets(商談管理) + Slack(連絡) + Notion(ナレッジ)で属人ツール乱立。',                              isDefault: true },
    { key: '理想',              label: '理想',              value: 'CRM(商談管理) + Slack双方向連携 + AI議事録要約 + KPIダッシュボード(属人ツールを統合)',                    isDefault: true },
    { key: 'タイムライン',      label: 'タイムライン',      value: '2026年4月導入 → 5月全社展開',                                                                            isDefault: true },
    { key: '検討フェーズ',      label: '検討フェーズ',      value: 'POC実施中 / 4月末までに最終評価 → 5月契約締結を希望',                                                    isDefault: true },
    { key: '予算',              label: '予算',              value: '初年度500万円以内 / 追加機能は段階的に検討',                                                              isDefault: true },
    { key: '稟議プロセス',      label: '稟議プロセス',      value: '部門責任者 → CTO技術承認 → 経営会議 → 社長最終決裁。社内ワークフローはGaroon。3/27 起票 → 4/1 完了予定。', isDefault: true },
    { key: '競合',              label: '競合',              value: 'Salesforce / HubSpot の2社を比較中。Salesforceは機能過多・コスト高で見送り傾向。',                       isDefault: true },
    { key: '導入の選定基準',    label: '導入の選定基準',    value: '①Slack連携の深さ ②議事録AIの精度 ③初期サポートの厚み ④契約後の運用支援体制',                              isDefault: true },
    { key: '期待すること',      label: '期待すること',      value: '導入3ヶ月で属人化を解消し、マネージャの数字集約工数を50%削減。AI議事録の活用で商談振り返り時間を半減。',  isDefault: true },
    { key: '障壁',              label: '障壁',              value: '既存スプレッドシート運用からの移行コスト / 現場メンバーの新ツール習熟負担',                              isDefault: true },
    { key: '今後の流れ',        label: '今後の流れ',        value: '4/25にCTO同席で最終デモ → 4/末までに見積回答 → 5月導入判定 → 5月中旬全社展開',                            isDefault: true },
  ],
  'd2': [
    {
      key: '出席者', label: '出席者', value: null, isDefault: true,
      participants: [
        { name: '佐々木 拓也', contactId: '3', department: '経営',     title: '代表取締役',  role: '最終決裁者' },
      ],
    },
    { key: '商談に至った背景',  label: '商談に至った背景',  value: '既存顧客(株式会社グロース)からの紹介で問い合わせ。代表自らヒアリング担当。', isDefault: true },
    { key: '社内状況',          label: '社内状況',          value: '大型案件を立て続けに受注しており、契約管理と経営KPIの一元化が急務。', isDefault: true },
    { key: '課題',              label: '課題',              value: '契約管理がスプレッドシート / 経営会議用のKPI集計が月次の手作業', isDefault: true },
    { key: 'ニーズ',            label: 'ニーズ',            value: '契約状況を役員がリアルタイムに把握でき、レポート作業をゼロにしたい', isDefault: true },
    { key: '達成したい事',      label: '達成したい事',      value: '契約と経営指標を一元管理し、役員会議の意思決定スピードを倍にしたい', isDefault: true },
    { key: '必要なこと',        label: '必要なこと',        value: '契約書バージョン管理 / 役員向けダッシュボード / 電子契約連携(クラウドサイン)', isDefault: true },
    { key: '現状',              label: '現状',              value: '紙 + Excel での契約管理。役員レポート作成に毎月2日。', isDefault: true },
    { key: '理想',              label: '理想',              value: 'CRM + 契約管理 + 電子契約の一元化。役員ダッシュボードはリアルタイム反映。', isDefault: true },
    { key: 'タイムライン',      label: 'タイムライン',      value: '4月末までに契約締結 → 5月運用開始', isDefault: true },
    { key: '検討フェーズ',      label: '検討フェーズ',      value: '導入決定間近 / 契約書ドラフト確認中', isDefault: true },
    { key: '予算',              label: '予算',              value: '600万円程度を想定 / 即決可', isDefault: true },
    { key: '稟議プロセス',      label: '稟議プロセス',      value: '代表取締役の即決 / 役員報告のみ', isDefault: true },
    { key: '競合',              label: '競合',              value: '検討済 / 当社で決定方向', isDefault: true },
    { key: '導入の選定基準',    label: '導入の選定基準',    value: '①事例の質 ②ROI試算 ③スピード導入の実績', isDefault: true },
    { key: '期待すること',      label: '期待すること',      value: '導入後即効果。役員会議のレポート作業を完全に廃止。', isDefault: true },
    { key: '障壁',              label: '障壁',              value: '特になし', isDefault: true },
    { key: '今後の流れ',        label: '今後の流れ',        value: '4/26 契約書ドラフト確認 → 即押印 → 5月導入', isDefault: true },
  ],
  'd3': [
    {
      key: '出席者', label: '出席者', value: null, isDefault: true,
      participants: [
        { name: '山本 佳子', contactId: '2', department: '購買部', title: 'マネージャー', role: '現場推進・要件取りまとめ' },
      ],
    },
    { key: '商談に至った背景',  label: '商談に至った背景',  value: '展示会で名刺交換 → メールフォロー経由で初回商談に至る。Zoho CRM導入済みだが定着せず再選定中。', isDefault: true },
    { key: '社内状況',          label: '社内状況',          value: '購買部のSLA管理が課題。決裁者は不在で現場マネージャー起点の検討。', isDefault: true },
    { key: '課題',              label: '課題',              value: '問い合わせ管理の抜け漏れ / 既存ツールが現場で使われていない / SLA遵守率の計測ができない', isDefault: true },
    { key: 'ニーズ',            label: 'ニーズ',            value: '問い合わせごとの対応状況をチーム内で一元化し取りこぼしを防ぎたい', isDefault: true },
    { key: '達成したい事',      label: '達成したい事',      value: '現場が自然に使えるUIで、SLA遵守率を可視化したい', isDefault: true },
    { key: '必要なこと',        label: '必要なこと',        value: '問い合わせキュー / 担当アサイン自動化 / SLAアラート', isDefault: true },
    { key: '現状',              label: '現状',              value: 'Zoho CRM + スプレッドシート併用 / 現場利用率が低い', isDefault: true },
    { key: '理想',              label: '理想',              value: 'シンプルなUIで現場が自然に使えるCRM。SLAアラートが自動で飛ぶ。', isDefault: true },
    { key: 'タイムライン',      label: 'タイムライン',      value: '4月中旬〜の比較検討、6月までに方向性決定', isDefault: true },
    { key: '検討フェーズ',      label: '検討フェーズ',      value: '比較検討 / Zoho・当社の2択', isDefault: true },
    { key: '予算',              label: '予算',              value: '200〜300万円', isDefault: true },
    { key: '稟議プロセス',      label: '稟議プロセス',      value: '上長(購買部長)同席ヒアリング → 経営判断。決裁者特定が課題。', isDefault: true },
    { key: '競合',              label: '競合',              value: 'Zoho CRM(既存) / 機能の現場フィット感で比較', isDefault: true },
    { key: '導入の選定基準',    label: '導入の選定基準',    value: '①現場メンバーの定着率 ②SLA計測精度 ③コスト', isDefault: true },
    { key: '期待すること',      label: '期待すること',      value: '現場が自然に使い始め、SLA遵守率を継続計測できること', isDefault: true },
    { key: '障壁',              label: '障壁',              value: '決裁者の特定が未完了 / 上長の関与が必要', isDefault: true },
    { key: '今後の流れ',        label: '今後の流れ',        value: 'Zoho比較表を4月末に提示 → 上長同席で再ヒアリング → 5月以降に決裁プロセス', isDefault: true },
  ],
  'd4': [
    {
      key: '出席者', label: '出席者', value: null, isDefault: true,
      participants: [
        { name: '中村 理恵', contactId: '4', department: '人事部', title: '購買担当', role: '比較検討の実務担当' },
      ],
    },
    { key: '商談に至った背景',  label: '商談に至った背景',  value: '検索広告(HRTech系キーワード)経由でWebフォームから問い合わせ。', isDefault: true },
    { key: '社内状況',          label: '社内状況',          value: '採用人数が前年比2倍に増え、応募者管理がスプレッドシートで限界。人事部長が最終決裁者。', isDefault: true },
    { key: '課題',              label: '課題',              value: '採用ファネル管理がスプレッドシートで分散 / 部長報告レポート作成に毎週2h', isDefault: true },
    { key: 'ニーズ',            label: 'ニーズ',            value: '採用ファネル全体を一元管理し、人事部長向けのKPI報告を自動化したい', isDefault: true },
    { key: '達成したい事',      label: '達成したい事',      value: '採用ファネルを自動可視化し、部長報告レポートをワンクリックで作りたい', isDefault: true },
    { key: '必要なこと',        label: '必要なこと',        value: '候補者ステージ管理 / 面接予約リマインド / 部長向けKPIレポート', isDefault: true },
    { key: '現状',              label: '現状',              value: 'Excel + メールで採用管理。複数チームで分散運用。', isDefault: true },
    { key: '理想',              label: '理想',              value: '採用ファネルの一元管理 + 部長レポート自動生成', isDefault: true },
    { key: 'タイムライン',      label: 'タイムライン',      value: '検討継続 / 6月以降の判断', isDefault: true },
    { key: '検討フェーズ',      label: '検討フェーズ',      value: '情報収集 / 比較資料を求めている', isDefault: true },
    { key: '予算',              label: '予算',              value: '100万円以下を希望', isDefault: true },
    { key: '稟議プロセス',      label: '稟議プロセス',      value: '購買担当ヒアリング → 人事部長確認 → 最終決裁', isDefault: true },
    { key: '競合',              label: '競合',              value: '未検討 / 比較資料を要求', isDefault: true },
    { key: '導入の選定基準',    label: '導入の選定基準',    value: '①予算内 ②シンプルさ ③人事部長への報告のしやすさ', isDefault: true },
    { key: '期待すること',      label: '期待すること',      value: '小さく始めて効果検証 → 拡張提案を受けられること', isDefault: true },
    { key: '障壁',              label: '障壁',              value: '予算と優先度の両面で社内調整が必要', isDefault: true },
    { key: '今後の流れ',        label: '今後の流れ',        value: '比較資料送付 → フォローコール → 人事部長を巻き込めるか打診', isDefault: true },
  ],
}

const MOCK_MEETINGS: Record<string, MeetingRecord[]> = {
  'd1': [
    {
      id: 'm-d1-1', date: '2026-02-03', sequence: 1, title: '初回商談',
      participants: ['田中 誠(顧客)', '田中太郎(当社)'],
      durationMin: 45,
      summary: '課題ヒアリング中心。CRM未導入で属人化、週次数字集約に時間を要するとの共通認識形成。',
      keyPoints: [
        '営業10名規模、月間商談50件程度',
        '現状: スプレッドシート + Slack で管理',
        '競合としてSalesforce/HubSpotを想定',
        'CTO鈴木氏の承認が必須との言及',
      ],
    },
    {
      id: 'm-d1-2', date: '2026-02-20', sequence: 2, title: '提案レビュー',
      participants: ['田中 誠(顧客)', '鈴木 一郎(顧客/CTO)', '田中太郎(当社)'],
      durationMin: 60,
      summary: 'CTO鈴木氏初回参加。技術面の質問多数。既存Slackワークフローとの統合要件が具体化。',
      keyPoints: [
        'Slack連携は必須要件',
        '初年度予算は500万円以内で確定',
        'Salesforceとの機能比較資料を要請',
        '4月導入 → 5月全社展開のスケジュール合意',
      ],
    },
    {
      id: 'm-d1-3', date: '2026-03-15', sequence: 3, title: '最終交渉',
      participants: ['田中 誠(顧客)', '鈴木 一郎(顧客/CTO)', '田中太郎(当社)', '佐藤(当社/CS)'],
      durationMin: 75,
      summary: 'CTO鈴木氏が「技術的懸念は解消」と発言。導入時期・サポート体制を具体化。最終見積の承認待ち状態へ。',
      keyPoints: [
        'CTO鈴木氏の温度感が明確に前向きに変化',
        '導入時期: 2026年4月15日で合意',
        'サポート: 初期3ヶ月は週次定例でフォロー',
        '最終見積は社内稟議を経て4/1に回答予定',
      ],
    },
  ],
  'd2': [
    {
      id: 'm-d2-1', date: '2026-02-10', sequence: 1, title: '初回アプローチ',
      participants: ['佐々木 拓也(顧客/代表)', '田中太郎(当社)'],
      durationMin: 30,
      summary: '代表者との顔合わせ。契約管理のペイン(役員レポート2日)を共有。概算予算600万円の示唆。',
      keyPoints: [
        '契約管理の属人化が最大課題',
        '役員レポート作業に2日かかる',
        '予算感: 600万円前後',
        '4月末までに締結したい意向',
      ],
    },
    {
      id: 'm-d2-2', date: '2026-03-10', sequence: 2, title: '代表者商談',
      participants: ['佐々木 拓也(顧客/代表)', '田中太郎(当社)'],
      durationMin: 60,
      summary: '代表者直々の商談。契約管理の課題共有、当社ソリューションで決定方向との意向表明。',
      keyPoints: [
        '予算600万円即決',
        '4月末までに契約締結希望',
        '導入は段階的でOK',
      ],
    },
    {
      id: 'm-d2-3', date: '2026-04-05', sequence: 3, title: '契約条件最終確認',
      participants: ['佐々木 拓也(顧客/代表)', '田中太郎(当社)', '法務担当(顧客)'],
      durationMin: 45,
      summary: '口頭合意後の最終詰め。契約書ドラフトのレビュー方針・押印スケジュールを確定。',
      keyPoints: [
        '契約書ドラフト: 4/15 までに法務レビュー完了',
        '押印はクラウドサインで4/25実施予定',
        'キックオフミーティングは5月第1週で調整',
      ],
    },
  ],
  'd3': [
    {
      id: 'm-d3-1', date: '2026-02-18', sequence: 1, title: '資料説明コール',
      participants: ['山本 佳子(顧客)', '鈴木花子(当社)'],
      durationMin: 20,
      summary: '短時間の資料説明コール。問い合わせ管理の課題を共有、次回詳細ヒアリングに合意。',
      keyPoints: [
        '問い合わせ管理に課題感あり',
        '「まず一度詳しく話を聞きたい」との発言',
        '現状はスプレッドシートで管理',
      ],
    },
    {
      id: 'm-d3-2', date: '2026-03-05', sequence: 2, title: '初回ヒアリング',
      participants: ['山本 佳子(顧客)', '鈴木花子(当社)'],
      durationMin: 30,
      summary: '問い合わせ管理の課題ヒアリング。ZohoCRMと比較検討中。',
      keyPoints: [
        '予算200〜300万円想定',
        'Zoho CRMを比較',
        '決裁者は別途確認必要',
      ],
    },
    {
      id: 'm-d3-3', date: '2026-04-02', sequence: 3, title: '要件整理ミーティング',
      participants: ['山本 佳子(顧客)', '山本 佳子 上長(顧客)', '鈴木花子(当社)'],
      durationMin: 45,
      summary: '上長同席で要件整理。SLAアラート機能への関心が高まり、Zohoとの機能差分を具体的に質問された。',
      keyPoints: [
        'SLAアラート / 担当自動アサインが最優先要件',
        '上長が登場、決裁者候補として浮上',
        'Zohoとの比較表を5月上旬までに提示要請',
      ],
    },
  ],
  'd4': [
    {
      id: 'm-d4-1', date: '2026-02-10', sequence: 1, title: '資料請求対応コール',
      participants: ['中村 理恵(顧客)', '佐藤次郎(当社)'],
      durationMin: 20,
      summary: '資料請求に対する初回コール。購買担当として情報収集段階であることを確認。',
      keyPoints: [
        '中村氏は購買担当、情報収集フェーズ',
        '人事部長が最終決裁者',
        '複数ツール比較を実施予定',
      ],
    },
    {
      id: 'm-d4-2', date: '2026-02-28', sequence: 2, title: '初回商談',
      participants: ['中村 理恵(顧客)', '佐藤次郎(当社)'],
      durationMin: 40,
      summary: '採用管理の分散課題を共有。予算と優先度が課題。',
      keyPoints: [
        '予算100万円以下希望',
        '最終決裁は人事部長',
        '優先度は現状中程度',
      ],
    },
    {
      id: 'm-d4-3', date: '2026-03-22', sequence: 3, title: '費用感すり合わせ',
      participants: ['中村 理恵(顧客)', '佐藤次郎(当社)'],
      durationMin: 35,
      summary: '比較資料を元に費用感のすり合わせ。現予算では機能絞り込みが必要と判明、人事部長巻き込みのタイミングを協議。',
      keyPoints: [
        '100万円予算だと候補者管理機能のみに絞る必要',
        '人事部長巻き込みは4月後半を目処',
        '他社比較は現時点では未着手',
      ],
    },
  ],
}

const MOCK_STAGE_HISTORY: StageHistoryItem[] = [
  { stage: 'IS',               date: '2026-01-15', daysAgo: 67, isCurrent: false },
  { stage: 'MEETING_PLANNED',  date: '2026-02-03', daysAgo: 48, isCurrent: false },
  { stage: 'MEETING_DONE',     date: '2026-02-20', daysAgo: 31, isCurrent: false },
  { stage: 'PROJECT_PLANNED',  date: '2026-03-05', daysAgo: 18, isCurrent: false },
  { stage: 'POC',              date: '2026-03-15', daysAgo:  8, isCurrent: true  },
]

// ─── タスク初期モックデータ ───────────────────────────────────────────────
const INITIAL_DEAL_TASKS: Record<string, DealTask[]> = {
  'd1': [
    { id: 't-d1-1', type: 'meeting',  title: 'デモ商談実施',         dueAt: '2026-04-15', memo: '製品デモと質疑応答',          done: false },
    { id: 't-d1-2', type: 'proposal', title: '提案書送付',           dueAt: '2026-04-18', memo: '比較表と見積書を含める',      done: false },
    { id: 't-d1-3', type: 'followup', title: '導入後フォロー設計',   dueAt: '2026-04-25', memo: '初期サポート計画を準備',      done: false },
  ],
  'd2': [
    { id: 't-d2-1', type: 'call', title: '最終確認コール', dueAt: '2026-04-14', memo: '契約書ドラフト確認', done: false },
  ],
  'd3': [],
  'd4': [],
}

interface DealTaskTypeStyle {
  Icon: React.ElementType
  label: string
  // フラットな単色 background + アイコン色 (Liquid Obsidian)
  bg: string
  iconColor: string
}

const DEAL_TASK_TYPE_STYLES: Record<DealTaskType, DealTaskTypeStyle> = {
  call:     { Icon: Phone,        label: 'コール',   bg: 'rgba(126,198,255,0.14)', iconColor: 'var(--color-obs-low)' },
  email:    { Icon: Mail,         label: 'メール',   bg: 'rgba(171,199,255,0.14)', iconColor: 'var(--color-obs-primary)' },
  meeting:  { Icon: Briefcase,    label: '商談',     bg: 'rgba(74,217,138,0.14)',  iconColor: '#4ad98a' },
  proposal: { Icon: BookOpen,     label: '提案書',   bg: 'rgba(255,184,107,0.14)', iconColor: 'var(--color-obs-middle)' },
  followup: { Icon: TrendingUp,   label: 'フォロー', bg: 'rgba(171,199,255,0.10)', iconColor: 'var(--color-obs-primary)' },
  other:    { Icon: CheckCircle2, label: 'その他',   bg: 'rgba(143,140,144,0.14)', iconColor: 'var(--color-obs-text-muted)' },
}

// タスク作成フォームで選択できる種別
// (既存データに meeting/proposal/followup が含まれている場合は表示時は STYLES から引いて表示するが、
//  新規作成時は「コール / メール / その他」の3つに集約する)
const ALL_DEAL_TASK_TYPES: DealTaskType[] = ['call', 'email', 'other']

// ═══════════════════════════════════════════════════════════════════════════════
// Style Config (Liquid Obsidian)
// ═══════════════════════════════════════════════════════════════════════════════

// IS フィールドのチップトーン（電話/メール抽出値の色分け）
type ChipTone = 'primary' | 'low' | 'middle' | 'hot' | 'neutral'

const IS_CHIP_TONE: Record<string, ChipTone> = {
  // 検討フェーズ
  '情報収集': 'neutral',
  '検討中': 'low',
  '比較検討': 'middle',
  '導入決定間近': 'primary',
  // 会社やサービスを知っているか
  '未認知': 'neutral',
  '名前は知っている': 'low',
  '内容を理解': 'primary',
  '導入経験あり': 'primary',
  // 希望連絡手段
  '電話': 'primary',
  'メール': 'low',
  'Slack': 'middle',
  'Web会議': 'low',
  '対面': 'primary',
  // 共通
  '未確認': 'neutral',
}

const CHIP_TONE_STYLE: Record<ChipTone, React.CSSProperties> = {
  primary: { background: 'rgba(171,199,255,0.14)', color: 'var(--color-obs-primary)' },
  low:     { background: 'rgba(126,198,255,0.14)', color: 'var(--color-obs-low)'     },
  middle:  { background: 'rgba(255,184,107,0.14)', color: 'var(--color-obs-middle)'  },
  hot:     { background: 'rgba(255,107,107,0.14)', color: 'var(--color-obs-hot)'     },
  neutral: { background: 'rgba(143,140,144,0.14)', color: 'var(--color-obs-text-muted)' },
}

// ステージごとの chip（Obsidian 準拠）— 色は tone で吸収
const STAGE_CONFIG: Record<DealStage, { label: string; tone: 'primary' | 'hot' | 'middle' | 'low' | 'neutral' }> = {
  IS:              { label: 'IS',             tone: 'low'     },
  MEETING_PLANNED: { label: '商談予定',       tone: 'low'     },
  MEETING_DONE:    { label: '商談済み',       tone: 'primary' },
  PROJECT_PLANNED: { label: 'PJ化予定あり',   tone: 'primary' },
  MULTI_MEETING:   { label: '複数商談済み',   tone: 'primary' },
  POC:             { label: 'POC',            tone: 'middle'  },
  CLOSED_WON:      { label: '受注',           tone: 'primary' },
  LOST_DEAL:       { label: '失注',           tone: 'hot'     },
  CHURN:           { label: 'チャーン',       tone: 'hot'     },
  LOST:            { label: 'ロスト',         tone: 'neutral' },
}

// 取引パイプラインの全ステージ順序（前進/後退の判定にも使用）— pipeline と同じ並び
const ALL_STAGES: DealStage[] = [
  'IS', 'MEETING_PLANNED', 'MEETING_DONE',
  'PROJECT_PLANNED', 'MULTI_MEETING', 'POC',
  'CLOSED_WON', 'LOST_DEAL', 'CHURN', 'LOST',
]

function todayISO(): string {
  const d = new Date()
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

// 今日と対象日の差分（日数）。正=未来、負=過去、0=今日。
function daysFromToday(dateStr: string): number {
  const ms = 1000 * 60 * 60 * 24
  const target = new Date(`${dateStr}T00:00:00`).getTime()
  const today = new Date(`${todayISO()}T00:00:00`).getTime()
  return Math.round((target - today) / ms)
}

// DealStatus
const DEAL_STATUS_TONE: Record<DealStatus, { bg: string; color: string; dot: string }> = {
  'アクティブ': { bg: 'rgba(126,198,255,0.14)', color: 'var(--color-obs-low)',     dot: 'var(--color-obs-low)'     },
  '優先対応':   { bg: 'rgba(255,107,107,0.14)', color: 'var(--color-obs-hot)',     dot: 'var(--color-obs-hot)'     },
  '保留':       { bg: 'rgba(143,140,144,0.14)', color: 'var(--color-obs-text-muted)', dot: 'var(--color-obs-text-muted)' },
}

const IS_STATUS_TONE: Record<ISContactStatus, { bg: string; color: string; dot: string }> = {
  '未着手':      { bg: 'rgba(143,140,144,0.14)', color: 'var(--color-obs-text-muted)', dot: 'var(--color-obs-text-muted)' },
  '不通':        { bg: 'rgba(255,107,107,0.14)', color: 'var(--color-obs-hot)',        dot: 'var(--color-obs-hot)'     },
  '不在':        { bg: 'rgba(255,184,107,0.14)', color: 'var(--color-obs-middle)',     dot: 'var(--color-obs-middle)'  },
  '接続済み':    { bg: 'rgba(126,198,255,0.14)', color: 'var(--color-obs-low)',        dot: 'var(--color-obs-low)'     },
  'コール不可':  { bg: 'rgba(255,107,107,0.14)', color: 'var(--color-obs-hot)',        dot: 'var(--color-obs-hot)'     },
  'アポ獲得':    { bg: 'rgba(126,198,255,0.18)', color: '#7ec6ff',                     dot: 'var(--color-obs-low)'     },
  'その他':      { bg: 'rgba(143,140,144,0.14)', color: 'var(--color-obs-text-muted)', dot: 'var(--color-obs-text-muted)' },
}

// 共通カードスタイル（No-Line Rule: surface shift + ゴーストアウトライン）
const OBS_CARD_STYLE: React.CSSProperties = {
  background: 'var(--color-obs-surface-high)',
  boxShadow: 'inset 0 0 0 1px rgba(109,106,111,0.12), 0 2px 12px rgba(0,0,0,0.35)',
}

const OBS_CARD_DIVIDER: React.CSSProperties = {
  boxShadow: 'inset 0 -1px 0 rgba(109,106,111,0.12)',
}

const OBS_ROW_DIVIDER: React.CSSProperties = {
  boxShadow: 'inset 0 -1px 0 rgba(109,106,111,0.10)',
}

// ═══════════════════════════════════════════════════════════════════════════════
// Sub-components
// ═══════════════════════════════════════════════════════════════════════════════

function StatusBadge({ status }: { status: DealStatus }) {
  const s = DEAL_STATUS_TONE[status]
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium"
      style={{ background: s.bg, color: s.color }}
    >
      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: s.dot }} />
      {status}
    </span>
  )
}

function StageBadge({ stage }: { stage: DealStage }) {
  const cfg = STAGE_CONFIG[stage]
  const toneStyle: Record<string, React.CSSProperties> = {
    neutral: { background: 'rgba(143,140,144,0.14)', color: 'var(--color-obs-text-muted)' },
    hot:     { background: 'rgba(255,107,107,0.14)', color: 'var(--color-obs-hot)'     },
    middle:  { background: 'rgba(255,184,107,0.14)', color: 'var(--color-obs-middle)'  },
    low:     { background: 'rgba(126,198,255,0.14)', color: 'var(--color-obs-low)'     },
    primary: { background: 'rgba(171,199,255,0.14)', color: 'var(--color-obs-primary)' },
  }
  return (
    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[12px] font-semibold" style={toneStyle[cfg.tone]}>
      {cfg.label}
    </span>
  )
}

// 出席者：部署/役職/役割をコンパクトに表示。コンタクト紐付けがあればワンクリックで詳細へ。
function ParticipantsList({ participants }: { participants: Participant[] }) {
  const router = useRouter()
  return (
    <div className="flex flex-col gap-2">
      {participants.map((p, i) => {
        const clickable = !!p.contactId
        const handleClick = clickable
          ? () => router.push(`/contacts/${p.contactId}`)
          : undefined
        return (
          <div
            key={i}
            onClick={handleClick}
            className={`group rounded-[var(--radius-obs-md)] p-3 transition-colors ${clickable ? 'cursor-pointer' : ''}`}
            style={{
              background: 'var(--color-obs-surface-low)',
              boxShadow: 'inset 0 0 0 1px rgba(109,106,111,0.10)',
            }}
            onMouseOver={(e) => {
              if (clickable) (e.currentTarget as HTMLDivElement).style.background = 'var(--color-obs-surface-high)'
            }}
            onMouseOut={(e) => {
              if (clickable) (e.currentTarget as HTMLDivElement).style.background = 'var(--color-obs-surface-low)'
            }}
            title={clickable ? `${p.name} のコンタクト詳細を開く` : undefined}
          >
            <div className="flex items-center gap-1.5 mb-2">
              <span
                className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-semibold shrink-0"
                style={{
                  background: 'linear-gradient(135deg, var(--color-obs-primary) 0%, var(--color-obs-primary-container) 100%)',
                  color: 'var(--color-obs-on-primary)',
                }}
              >
                {p.name[0]}
              </span>
              <span
                className={`text-[13px] font-semibold tracking-[-0.01em] ${clickable ? 'group-hover:text-[var(--color-obs-primary)] transition-colors' : ''}`}
                style={{ color: 'var(--color-obs-text)' }}
              >
                {p.name}
              </span>
              {clickable && (
                <ExternalLink
                  size={11}
                  className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                  style={{ color: 'var(--color-obs-primary)' }}
                />
              )}
              {!clickable && (
                <span
                  className="ml-auto text-[10px] px-1.5 py-0.5 rounded-[4px]"
                  style={{
                    background: 'rgba(143,140,144,0.12)',
                    color: 'var(--color-obs-text-subtle)',
                  }}
                >
                  未紐付け
                </span>
              )}
            </div>
            <div className="grid grid-cols-[56px_1fr] gap-x-3 gap-y-1 text-[12px] leading-relaxed">
              <span className="text-[10.5px] font-medium tracking-[0.06em] uppercase pt-0.5" style={{ color: 'var(--color-obs-text-subtle)' }}>
                部署
              </span>
              <span style={{ color: 'var(--color-obs-text)' }}>{p.department || '—'}</span>

              <span className="text-[10.5px] font-medium tracking-[0.06em] uppercase pt-0.5" style={{ color: 'var(--color-obs-text-subtle)' }}>
                役職
              </span>
              <span style={{ color: 'var(--color-obs-text)' }}>{p.title || '—'}</span>

              <span className="text-[10.5px] font-medium tracking-[0.06em] uppercase pt-0.5" style={{ color: 'var(--color-obs-text-subtle)' }}>
                役割
              </span>
              <span style={{ color: 'var(--color-obs-text-muted)' }}>{p.role || '—'}</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ─── 編集可能なフィールド行（IS/営業の値項目で共用） ─────────────────────────
// クリックで編集モードに入り、テキストエリアで値を編集できる。
// 既定項目(isDefault=true)は削除不可、カスタム項目は削除可。
function EditableFieldRow({
  label, value, isDefault, onChange, onDelete, leftWidth = 100, children,
}: {
  label: string
  value: string | null
  isDefault: boolean
  onChange: (next: string | null) => void
  onDelete?: () => void
  leftWidth?: number
  /** 値の代わりに任意要素を描画する場合(出席者など) */
  children?: React.ReactNode
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value ?? '')
  const taRef = React.useRef<HTMLTextAreaElement | null>(null)

  React.useEffect(() => {
    if (editing) {
      setDraft(value ?? '')
      // フォーカス + 末尾にキャレット
      setTimeout(() => {
        const el = taRef.current
        if (el) { el.focus(); el.setSelectionRange(el.value.length, el.value.length) }
      }, 0)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editing])

  const commit = () => {
    const next = draft.trim()
    onChange(next === '' ? null : next)
    setEditing(false)
  }
  const cancel = () => {
    setDraft(value ?? '')
    setEditing(false)
  }

  return (
    <div className="group flex items-start gap-3 px-5 py-3">
      <span
        className="text-[12px] shrink-0 pt-0.5 leading-tight font-medium flex items-center gap-1"
        style={{ color: 'var(--color-obs-text-subtle)', width: leftWidth }}
      >
        {label}
        {!isDefault && (
          <span
            className="inline-flex items-center px-1 py-0.5 rounded-[3px] text-[8.5px] font-semibold"
            style={{ background: 'rgba(255,184,107,0.14)', color: 'var(--color-obs-middle)' }}
            title="ユーザーが追加したカスタム項目"
          >
            CUSTOM
          </span>
        )}
      </span>
      <div className="flex-1 min-w-0">
        {editing ? (
          <div className="flex flex-col gap-1.5">
            <textarea
              ref={taRef}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') cancel()
                if ((e.key === 'Enter' && (e.metaKey || e.ctrlKey))) commit()
              }}
              rows={Math.min(8, Math.max(2, draft.split('\n').length))}
              className="w-full px-2.5 py-1.5 rounded-[6px] text-[13px] leading-relaxed outline-none resize-y"
              style={{
                background: 'var(--color-obs-surface-lowest)',
                color: 'var(--color-obs-text)',
                boxShadow: 'inset 0 0 0 1px rgba(171,199,255,0.42)',
              }}
              placeholder="内容を入力..."
            />
            <div className="flex items-center gap-2 text-[11px]">
              <button
                type="button"
                onClick={commit}
                className="px-2.5 py-1 rounded-[5px] font-semibold transition-colors"
                style={{
                  background: 'var(--color-obs-primary-container)',
                  color: 'var(--color-obs-on-primary)',
                }}
              >
                保存
              </button>
              <button
                type="button"
                onClick={cancel}
                className="px-2.5 py-1 rounded-[5px] font-medium transition-colors"
                style={{ color: 'var(--color-obs-text-muted)' }}
                onMouseOver={(e) => {
                  ;(e.currentTarget as HTMLButtonElement).style.background = 'var(--color-obs-surface-high)'
                }}
                onMouseOut={(e) => {
                  ;(e.currentTarget as HTMLButtonElement).style.background = 'transparent'
                }}
              >
                キャンセル
              </button>
              <span style={{ color: 'var(--color-obs-text-subtle)' }}>
                ⌘/Ctrl + Enter で保存・Esc でキャンセル
              </span>
            </div>
          </div>
        ) : (
          <div
            onClick={() => setEditing(true)}
            className="cursor-text rounded-[5px] -mx-1.5 px-1.5 py-1 transition-colors"
            style={{ background: 'transparent' }}
            onMouseOver={(e) => {
              ;(e.currentTarget as HTMLDivElement).style.background = 'var(--color-obs-surface-low)'
            }}
            onMouseOut={(e) => {
              ;(e.currentTarget as HTMLDivElement).style.background = 'transparent'
            }}
            title="クリックして編集"
          >
            {children ? (
              children
            ) : (
              <span className="text-[13px] leading-relaxed block whitespace-pre-wrap" style={{ color: value ? 'var(--color-obs-text)' : 'var(--color-obs-text-subtle)' }}>
                {value ?? '— 未入力（クリックして入力）'}
              </span>
            )}
          </div>
        )}
      </div>
      {onDelete && !isDefault && !editing && (
        <button
          type="button"
          onClick={onDelete}
          className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0 w-6 h-6 rounded-[4px] flex items-center justify-center"
          style={{ color: 'var(--color-obs-text-subtle)' }}
          onMouseOver={(e) => {
            ;(e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,107,107,0.14)'
            ;(e.currentTarget as HTMLButtonElement).style.color = 'var(--color-obs-hot)'
          }}
          onMouseOut={(e) => {
            ;(e.currentTarget as HTMLButtonElement).style.background = 'transparent'
            ;(e.currentTarget as HTMLButtonElement).style.color = 'var(--color-obs-text-subtle)'
          }}
          title="カスタム項目を削除"
        >
          <Trash2 size={12} />
        </button>
      )}
    </div>
  )
}

// ─── カスタム項目を追加するボタン行 ────────────────────────────────────────
function AddCustomFieldRow({ onAdd }: { onAdd: (label: string) => void }) {
  const [adding, setAdding] = useState(false)
  const [label, setLabel] = useState('')
  const inputRef = React.useRef<HTMLInputElement | null>(null)

  React.useEffect(() => {
    if (adding) setTimeout(() => inputRef.current?.focus(), 0)
  }, [adding])

  const commit = () => {
    const v = label.trim()
    if (v) onAdd(v)
    setLabel('')
    setAdding(false)
  }
  const cancel = () => {
    setLabel('')
    setAdding(false)
  }

  if (!adding) {
    return (
      <button
        type="button"
        onClick={() => setAdding(true)}
        className="flex items-center gap-1.5 px-5 py-3 w-full text-left text-[12px] font-medium transition-colors"
        style={{ color: 'var(--color-obs-primary)' }}
        onMouseOver={(e) => {
          ;(e.currentTarget as HTMLButtonElement).style.background = 'rgba(171,199,255,0.05)'
        }}
        onMouseOut={(e) => {
          ;(e.currentTarget as HTMLButtonElement).style.background = 'transparent'
        }}
      >
        <Plus size={12} strokeWidth={2.5} />
        カスタム項目を追加
      </button>
    )
  }

  return (
    <div className="flex items-center gap-2 px-5 py-3">
      <input
        ref={inputRef}
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') commit()
          if (e.key === 'Escape') cancel()
        }}
        placeholder="項目名を入力 (例: 想定利用シーン)"
        className="flex-1 h-8 px-2.5 rounded-[6px] text-[12.5px] outline-none"
        style={{
          background: 'var(--color-obs-surface-lowest)',
          color: 'var(--color-obs-text)',
          boxShadow: 'inset 0 0 0 1px rgba(171,199,255,0.42)',
        }}
      />
      <button
        type="button"
        onClick={commit}
        className="h-8 px-3 rounded-[5px] text-[11.5px] font-semibold"
        style={{
          background: 'var(--color-obs-primary-container)',
          color: 'var(--color-obs-on-primary)',
        }}
      >
        追加
      </button>
      <button
        type="button"
        onClick={cancel}
        className="h-8 px-3 rounded-[5px] text-[11.5px] font-medium"
        style={{ color: 'var(--color-obs-text-muted)' }}
      >
        キャンセル
      </button>
    </div>
  )
}

// カードヘッダ
function CardHeader({ icon: Icon, title, right, iconTint = 'primary' }: {
  icon: React.ElementType
  title: string
  right?: React.ReactNode
  iconTint?: 'primary' | 'low' | 'middle' | 'hot'
}) {
  const tintMap = {
    primary: 'var(--color-obs-primary)',
    low: 'var(--color-obs-low)',
    middle: 'var(--color-obs-middle)',
    hot: 'var(--color-obs-hot)',
  }
  return (
    <div className="flex items-center gap-2.5 px-5 py-3.5" style={OBS_CARD_DIVIDER}>
      <Icon size={14} style={{ color: tintMap[iconTint] }} className="shrink-0" />
      <h3 className="text-[13px] font-semibold tracking-[-0.01em]" style={{ color: 'var(--color-obs-text)' }}>{title}</h3>
      {right && <div className="ml-auto flex items-center gap-2">{right}</div>}
    </div>
  )
}

function formatDate(s: string | null): string {
  if (!s) return '—'
  const d = new Date(s)
  return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`
}

function formatDateShort(s: string): string {
  const d = new Date(s)
  return `${d.getMonth() + 1}/${d.getDate()}`
}

function formatTimestamp(ts: string): string {
  const d = new Date(ts)
  return `${d.getMonth() + 1}/${d.getDate()} ${d.getHours()}:${d.getMinutes().toString().padStart(2, '0')}`
}

function mapDbDealStage(stage: string): DealStage {
  const map: Record<string, DealStage> = {
    NEW_LEAD: 'IS',
    QUALIFIED: 'MEETING_PLANNED',
    FIRST_MEETING: 'MEETING_PLANNED',
    SOLUTION_FIT: 'MEETING_DONE',
    PROPOSAL: 'PROJECT_PLANNED',
    NEGOTIATION: 'POC',
    VERBAL_COMMIT: 'POC',
    CLOSED_WON: 'CLOSED_WON',
    CLOSED_LOST: 'LOST',
  }
  return map[stage] ?? 'IS'
}

function mapDbActivityType(type: string): ActivityType {
  if (type === 'EMAIL_SENT' || type === 'EMAIL_RECEIVED') return 'email'
  if (type === 'CALL') return 'call'
  return 'note'
}

function toDealDetailFromDb(data: DbDealResponse['deal']): DealDetail {
  return {
    id: data.id,
    name: data.name,
    company: data.company.name,
    companyId: data.company.id,
    contact: data.contact?.name ?? '未設定',
    contactId: data.contact?.id ?? '',
    contactPhone: data.contact?.phone ?? '',
    owner: data.owner.name,
    stage: mapDbDealStage(data.stage),
    status: 'アクティブ',
    amount: data.amount ?? 0,
    probability: data.probability ?? 0,
    expectedCloseAt: data.expectedCloseAt,
    updatedAt: data.updatedAt,
    progressStatus: data.desiredService ?? 'Gmailから作成した取引',
    nextAction: data.nextActionUs ?? '次回アクション未設定',
    nextActionDate: null,
    memo: data.timeline ?? '',
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// Deal Task Modal
// ═══════════════════════════════════════════════════════════════════════════════

function DealTaskModal({ task, onClose, onSave }: {
  task: DealTask | null
  onClose: () => void
  onSave: (t: DealTask) => void
}) {
  const isEdit = !!task
  const [form, setForm] = useState<DealTask>(task ?? {
    id: `t-${Date.now()}`,
    type: 'call',
    title: '',
    dueAt: null,
    memo: '',
    done: false,
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title.trim()) return
    onSave({ ...form, title: form.title.trim(), memo: form.memo.trim() })
    onClose()
  }

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        className="relative w-full max-w-[460px] overflow-hidden"
        style={{
          background: 'var(--color-obs-surface-highest)',
          borderRadius: 'var(--radius-obs-xl)',
          boxShadow: '0 24px 64px rgba(0,0,0,0.6), inset 0 0 0 1px rgba(109,106,111,0.18)',
        }}
        initial={{ opacity: 0, scale: 0.96, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 8 }}
        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4" style={OBS_CARD_DIVIDER}>
          <h2 className="text-[16px] font-bold" style={{ color: 'var(--color-obs-text)' }}>
            {isEdit ? 'タスク編集' : 'タスク作成'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full transition-colors hover:bg-[rgba(171,199,255,0.08)]"
          >
            <X size={16} style={{ color: 'var(--color-obs-text-muted)' }} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="px-5 py-4 space-y-4">
            {/* タスク種別 */}
            <div>
              <label className="text-[11px] font-bold uppercase tracking-[0.06em] mb-1.5 block" style={{ color: 'var(--color-obs-text-subtle)' }}>タスク種別</label>
              <div className="flex flex-wrap gap-1.5">
                {ALL_DEAL_TASK_TYPES.map(t => {
                  const s = DEAL_TASK_TYPE_STYLES[t]
                  const active = form.type === t
                  return (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setForm(f => ({ ...f, type: t }))}
                      className="inline-flex items-center gap-1.5 px-3 h-[32px] rounded-[8px] text-[11px] font-medium transition-all"
                      style={active ? {
                        backgroundColor: s.bg,
                        color: s.iconColor,
                        boxShadow: 'inset 0 0 0 1px rgba(109,106,111,0.12)',
                      } : {
                        background: 'var(--color-obs-surface)',
                        color: 'var(--color-obs-text-muted)',
                        boxShadow: 'inset 0 0 0 1px rgba(109,106,111,0.12)',
                      }}
                    >
                      <s.Icon size={11} strokeWidth={2.2} style={{ color: active ? s.iconColor : 'var(--color-obs-text-muted)' }} />
                      {s.label}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* タイトル */}
            <div>
              <label className="text-[11px] font-bold uppercase tracking-[0.06em] mb-1.5 block" style={{ color: 'var(--color-obs-text-subtle)' }}>
                タイトル <span style={{ color: 'var(--color-obs-hot)' }}>*</span>
              </label>
              <input
                type="text"
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                placeholder="例: デモ商談実施"
                required
                className="w-full h-[36px] px-3 text-[14px] rounded-[8px] outline-none"
                style={{
                  background: 'var(--color-obs-surface-lowest)',
                  color: 'var(--color-obs-text)',
                  boxShadow: 'inset 0 0 0 1px rgba(109,106,111,0.12)',
                }}
              />
            </div>

            {/* 期日 */}
            <div>
              <label className="text-[11px] font-bold uppercase tracking-[0.06em] mb-1.5 flex items-center justify-between" style={{ color: 'var(--color-obs-text-subtle)' }}>
                <span>期日</span>
                {form.dueAt && (
                  <button
                    type="button"
                    onClick={() => setForm(f => ({ ...f, dueAt: null }))}
                    className="inline-flex items-center gap-0.5 text-[10px] font-bold transition-colors normal-case tracking-normal"
                    style={{ color: 'var(--color-obs-text-muted)' }}
                  >
                    <X size={10} />
                    クリア
                  </button>
                )}
              </label>
              <input
                type="date"
                value={form.dueAt ?? ''}
                onChange={e => setForm(f => ({ ...f, dueAt: e.target.value || null }))}
                className="w-full h-[36px] px-3 text-[14px] rounded-[8px] outline-none cursor-pointer"
                style={{
                  background: 'var(--color-obs-surface-lowest)',
                  color: 'var(--color-obs-text)',
                  colorScheme: 'dark',
                  boxShadow: 'inset 0 0 0 1px rgba(109,106,111,0.12)',
                }}
              />
            </div>

            {/* メモ */}
            <div>
              <label className="text-[11px] font-bold uppercase tracking-[0.06em] mb-1.5 block" style={{ color: 'var(--color-obs-text-subtle)' }}>メモ</label>
              <textarea
                value={form.memo}
                onChange={e => setForm(f => ({ ...f, memo: e.target.value }))}
                placeholder="タスクに関するメモを入力..."
                rows={3}
                className="w-full px-3 py-2 text-[13px] outline-none rounded-[8px] resize-none"
                style={{
                  background: 'var(--color-obs-surface-lowest)',
                  color: 'var(--color-obs-text)',
                  boxShadow: 'inset 0 0 0 1px rgba(109,106,111,0.12)',
                }}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 px-5 py-4" style={OBS_CARD_DIVIDER}>
            <button
              type="button"
              onClick={onClose}
              className="h-[36px] px-4 text-[13px] font-medium rounded-[8px] transition-colors hover:bg-[rgba(171,199,255,0.06)]"
              style={{ color: 'var(--color-obs-text-muted)' }}
            >
              キャンセル
            </button>
            <button
              type="submit"
              className="h-[36px] px-5 text-[13px] font-semibold rounded-[8px] transition-all hover:brightness-106"
              style={{
                background: 'var(--color-obs-primary-container)',
                color: 'var(--color-obs-on-primary)',
                boxShadow: '0 8px 24px rgba(0,113,227,0.20)',
              }}
            >
              {isEdit ? '保存' : '作成'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// Main Page
// ═══════════════════════════════════════════════════════════════════════════════

export default function DealDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params)
  const router = useRouter()

  const rawDeal = (MOCK_DEALS[id] ?? MOCK_DEALS['d1'])!
  const [dbDeal, setDbDeal] = useState<DealDetail | null>(null)
  const [dbActivities, setDbActivities] = useState<ActivityItem[]>([])
  const displayBaseDeal = dbDeal ?? rawDeal

  // 進捗管理（state で管理、保存はstateのみ）
  const [progressStatus, setProgressStatus] = useState<string>(rawDeal.progressStatus)
  const [nextAction, setNextAction] = useState<string>(rawDeal.nextAction)
  const [nextActionDate, setNextActionDate] = useState<string | null>(rawDeal.nextActionDate)
  const [memo, setMemo] = useState<string>(rawDeal.memo)

  const deal: DealDetail = {
    ...displayBaseDeal,
    progressStatus,
    nextAction,
    nextActionDate,
    memo,
  }

  useEffect(() => {
    let aborted = false
    fetch(`/api/deals/${encodeURIComponent(id)}`, { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null))
      .then((data: DbDealResponse | null) => {
        if (aborted || !data?.deal) return
        const nextDeal = toDealDetailFromDb(data.deal)
        setDbDeal(nextDeal)
        setProgressStatus(nextDeal.progressStatus)
        setNextAction(nextDeal.nextAction)
        setNextActionDate(nextDeal.nextActionDate)
        setMemo(nextDeal.memo)
        setDbActivities(
          (data.activities ?? []).map((a) => ({
            id: a.id,
            type: mapDbActivityType(a.type),
            timestamp: a.occurredAt,
            title: a.title,
            description: a.content ?? undefined,
          }))
        )
      })
      .catch(() => {})
    return () => {
      aborted = true
    }
  }, [id])

  // タスクの state
  const [tasks, setTasks] = useState<DealTask[]>(INITIAL_DEAL_TASKS[id] ?? [])
  const [taskModal, setTaskModal] = useState<DealTask | null | 'new'>(null)

  // チケットの state
  const [tickets, setTickets] = useState<TicketListItem[]>([])
  const [ticketsLoading, setTicketsLoading] = useState(true)
  const [showCreateTicket, setShowCreateTicket] = useState(false)

  useEffect(() => {
    let aborted = false
    setTicketsLoading(true)
    fetch(`/api/tickets?dealId=${encodeURIComponent(id)}`, { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : { tickets: [] }))
      .then((j: { tickets: TicketListItem[] }) => {
        if (!aborted) setTickets(j.tickets ?? [])
      })
      .catch(() => {
        if (!aborted) setTickets([])
      })
      .finally(() => {
        if (!aborted) setTicketsLoading(false)
      })
    return () => {
      aborted = true
    }
  }, [id])

  function reloadTickets() {
    fetch(`/api/tickets?dealId=${encodeURIComponent(id)}`, { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : { tickets: [] }))
      .then((j: { tickets: TicketListItem[] }) => setTickets(j.tickets ?? []))
      .catch(() => {})
  }

  // ステージ履歴の state（編集可能）
  const [stageHistory, setStageHistory] = useState<StageHistoryItem[]>(MOCK_STAGE_HISTORY)
  const currentStage: DealStage = stageHistory.find(h => h.isCurrent)?.stage ?? rawDeal.stage

  function handleChangeStage(next: DealStage) {
    if (next === currentStage) return
    setStageHistory(prev => {
      const cleared = prev.map(h => ({ ...h, isCurrent: false }))
      return [
        ...cleared,
        { stage: next, date: todayISO(), daysAgo: 0, isCurrent: true },
      ]
    })
  }

  function handleTaskSave(t: DealTask) {
    setTasks(prev => {
      const exists = prev.find(x => x.id === t.id)
      if (exists) return prev.map(x => x.id === t.id ? t : x)
      return [t, ...prev]
    })
  }
  function handleTaskDelete(id: string) {
    setTasks(prev => prev.filter(t => t.id !== id))
  }
  function handleTaskToggle(id: string) {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t))
  }

  // 取引に紐づく IS / 営業 / プロダクト フィールド / 議事録 / 集約
  // (フェーズ1はモック。id に紐づくデータが無い場合は d1 のダミーで埋める)
  // IS / 営業フィールドは編集可能 + カスタム追加に対応するため state で管理
  const [isFields, setIsFields] = useState<ISField[]>(
    () => MOCK_IS_FIELDS[id] ?? MOCK_IS_FIELDS['d1'] ?? [],
  )
  const [salesFields, setSalesFields] = useState<SalesField[]>(
    () => MOCK_SALES_FIELDS[id] ?? MOCK_SALES_FIELDS['d1'] ?? [],
  )
  // 取引切替時にフィールドも初期化
  React.useEffect(() => {
    setIsFields(MOCK_IS_FIELDS[id] ?? MOCK_IS_FIELDS['d1'] ?? [])
    setSalesFields(MOCK_SALES_FIELDS[id] ?? MOCK_SALES_FIELDS['d1'] ?? [])
  }, [id])

  // IS フィールド操作
  const updateISFieldValue = (key: ISFieldKey, next: string | null) => {
    setIsFields((prev) => prev.map((f) => (f.key === key ? { ...f, value: next } : f)))
  }
  const addISCustomField = (label: string) => {
    const key = `custom_is_${Date.now()}_${label}`
    setIsFields((prev) => [...prev, { key, label, value: null, isDefault: false }])
  }
  const deleteISField = (key: ISFieldKey) => {
    setIsFields((prev) => prev.filter((f) => f.key !== key || f.isDefault))
  }

  // 営業フィールド操作
  const updateSalesFieldValue = (key: SalesFieldKey, next: string | null) => {
    setSalesFields((prev) => prev.map((f) => (f.key === key ? { ...f, value: next } : f)))
  }
  const addSalesCustomField = (label: string) => {
    const key = `custom_sales_${Date.now()}_${label}`
    setSalesFields((prev) => [...prev, { key, label, value: null, isDefault: false }])
  }
  const deleteSalesField = (key: SalesFieldKey) => {
    setSalesFields((prev) => prev.filter((f) => f.key !== key || f.isDefault))
  }
  // プロダクトフィールドは開発優先度ページのデータと連動するため、MOCK_PRODUCT_FIELDS は廃止
  const meetings = MOCK_MEETINGS[id] ?? MOCK_MEETINGS['d1'] ?? []

  // 提案内容（複数提案を保持・編集・追加可能）
  const [proposals, setProposals] = useState<Proposal[]>(
    () => DEAL_PROPOSALS[id] ?? DEAL_PROPOSALS['d1'] ?? [],
  )
  const [activeProposalId, setActiveProposalId] = useState<string | null>(
    () => (DEAL_PROPOSALS[id] ?? DEAL_PROPOSALS['d1'] ?? [])[0]?.id ?? null,
  )
  const [editingProposal, setEditingProposal] = useState<Proposal | null>(null)
  React.useEffect(() => {
    const list = DEAL_PROPOSALS[id] ?? DEAL_PROPOSALS['d1'] ?? []
    setProposals(list)
    setActiveProposalId(list[0]?.id ?? null)
  }, [id])

  // 議事録タブ: デフォルト最新
  const [activeMeetingId, setActiveMeetingId] = useState<string | null>(
    meetings.length > 0 ? meetings[meetings.length - 1]!.id : null
  )
  // id が変わった時(取引切替時)には最新を選択し直す
  React.useEffect(() => {
    if (meetings.length === 0) {
      setActiveMeetingId(null)
      return
    }
    const exists = meetings.some(m => m.id === activeMeetingId)
    if (!exists) {
      setActiveMeetingId(meetings[meetings.length - 1]!.id)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const activeMeeting = meetings.find(m => m.id === activeMeetingId) ?? null

  return (
    <ObsPageShell>
      <div className="w-full px-6 xl:px-10 2xl:px-14 pb-16 pt-6">

        {/* ── Page Header ── */}
        <div className="mb-6">
          <Link
            href="/deals"
            className="inline-flex items-center gap-1 text-[12px] transition-colors mb-2 hover:text-[var(--color-obs-text)]"
            style={{ color: 'var(--color-obs-text-muted)' }}
          >
            <ChevronLeft size={13} />
            取引一覧
          </Link>

          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2.5 flex-wrap mb-1.5">
                <h1
                  className="text-[22px] font-semibold tracking-[-0.03em] truncate font-[family-name:var(--font-display)]"
                  style={{ color: 'var(--color-obs-text)' }}
                >
                  {deal.name}
                </h1>
              </div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <StageBadge stage={currentStage} />
                <StatusBadge status={deal.status} />
                <span className="text-[15px] font-bold tabular-nums" style={{ color: 'var(--color-obs-text)' }}>
                  ¥{(deal.amount / 1000000).toFixed(1)}M
                </span>
                <span className="text-[12px]" style={{ color: 'var(--color-obs-text-muted)' }}>
                  確度 {deal.probability}%
                </span>
              </div>
            </div>

          </div>
        </div>

        {/* ── 2-Column Layout ── */}
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-6 items-start">

          {/* ── Main Column ── */}
          <div className="flex flex-col gap-6 min-w-0">

            {/* ─── リサーチ（左メインカラムへ移動） ─────────────────── */}
            <ResearchChatPanel entityType="deal" entityId={id} />

            {/* ─── インテント（部門別の採用動向） ───────────────────── */}
            {(() => {
              const intents = DEAL_INTENTS[id] ?? []
              if (intents.length === 0) return null
              return (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.01, ease: [0.16, 1, 0.3, 1] }}
                  className="rounded-[var(--radius-obs-xl)] overflow-hidden"
                  style={OBS_CARD_STYLE}
                >
                  <CardHeader
                    icon={Activity}
                    title="インテント"
                    iconTint="hot"
                    right={
                      <span className="text-[11px]" style={{ color: 'var(--color-obs-text-subtle)' }}>
                        部門別の採用動向
                      </span>
                    }
                  />
                  <div className="px-5 py-3 flex flex-col gap-2">
                    {intents.map((it, i) => {
                      const tone =
                        it.intentLevel === 'HOT'
                          ? { bg: 'rgba(255,107,107,0.12)', color: 'var(--color-obs-hot)' }
                          : it.intentLevel === 'MIDDLE'
                            ? { bg: 'rgba(255,184,107,0.12)', color: 'var(--color-obs-middle)' }
                            : { bg: 'rgba(126,198,255,0.12)', color: 'var(--color-obs-low)' }
                      return (
                        <div key={i} className="flex items-center gap-3 py-1.5">
                          <span
                            className="inline-flex items-center justify-center px-2 h-5 rounded-full text-[10px] font-bold tracking-wide tabular-nums shrink-0"
                            style={{ backgroundColor: tone.bg, color: tone.color, minWidth: 50 }}
                          >
                            {it.intentLevel}
                          </span>
                          <span className="text-[13px] flex-1" style={{ color: 'var(--color-obs-text)' }}>
                            {dealDeptLabel(it.departmentType)}
                          </span>
                          <span className="text-[11.5px] tabular-nums" style={{ color: 'var(--color-obs-text-muted)' }}>
                            {it.signalCount}シグナル
                          </span>
                          <span className="text-[11.5px] tabular-nums shrink-0" style={{ color: 'var(--color-obs-text-subtle)' }}>
                            {formatDate(it.latestSignalAt)}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </motion.div>
              )
            })()}

            {/* ─── 採用シグナル履歴 ─────────────────────────────────── */}
            {(() => {
              const signals = DEAL_INTENT_SIGNALS[id] ?? []
              if (signals.length === 0) return null
              return (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.015, ease: [0.16, 1, 0.3, 1] }}
                  className="rounded-[var(--radius-obs-xl)] overflow-hidden"
                  style={OBS_CARD_STYLE}
                >
                  <CardHeader
                    icon={History}
                    title="採用シグナル履歴"
                    iconTint="middle"
                    right={
                      <span className="text-[11px]" style={{ color: 'var(--color-obs-text-subtle)' }}>
                        最新 {signals.length}件
                      </span>
                    }
                  />
                  <div className="px-5 py-2 flex flex-col">
                    {signals.map((s) => {
                      const hasUrl = !!s.sourceUrl && /^https?:\/\//i.test(s.sourceUrl)
                      const Wrapper = hasUrl ? 'a' : 'div'
                      const wrapperProps = hasUrl
                        ? { href: s.sourceUrl, target: '_blank' as const, rel: 'noopener noreferrer' }
                        : {}
                      return (
                        <Wrapper
                          key={s.id}
                          {...wrapperProps}
                          className={`group flex items-center gap-3 px-2 py-2.5 rounded-[8px] transition-colors duration-150 ${
                            hasUrl ? 'cursor-pointer' : ''
                          }`}
                          onMouseOver={(e) => {
                            if (hasUrl)
                              (e.currentTarget as HTMLElement).style.backgroundColor =
                                'var(--color-obs-surface-highest)'
                          }}
                          onMouseOut={(e) => {
                            ;(e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'
                          }}
                          title={hasUrl ? `${s.sourceUrl} を新しいタブで開く` : 'リンク情報なし'}
                        >
                          <span
                            className="inline-flex items-center px-1.5 h-5 rounded-full text-[10px] font-medium shrink-0"
                            style={{
                              backgroundColor: 'var(--color-obs-surface-highest)',
                              color: 'var(--color-obs-text-muted)',
                            }}
                          >
                            {s.signalType}
                          </span>
                          <span
                            className="flex-1 text-sm truncate"
                            style={{
                              color: hasUrl ? 'var(--color-obs-text)' : 'var(--color-obs-text-muted)',
                            }}
                          >
                            {s.title}
                          </span>
                          {hasUrl && (
                            <ExternalLink
                              size={11}
                              className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                              style={{ color: 'var(--color-obs-primary)' }}
                            />
                          )}
                          <span className="text-xs shrink-0 whitespace-nowrap" style={{ color: 'var(--color-obs-text-subtle)' }}>
                            {dealDeptLabel(s.departmentType)}
                          </span>
                          <span className="text-xs shrink-0 tabular-nums whitespace-nowrap" style={{ color: 'var(--color-obs-text-subtle)' }}>
                            {formatDate(s.publishedAt)}
                          </span>
                        </Wrapper>
                      )
                    })}
                  </div>
                </motion.div>
              )
            })()}

            {/* ─── ISフィールド（電話・メールから自動抽出） ─────────────── */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.04, ease: [0.16, 1, 0.3, 1] }}
              className="rounded-[var(--radius-obs-xl)] overflow-hidden"
              style={OBS_CARD_STYLE}
            >
              <CardHeader
                icon={Headphones}
                title="ISフィールド"
                iconTint="low"
                right={
                  <span
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold"
                    style={{ background: 'rgba(126,198,255,0.12)', color: 'var(--color-obs-low)' }}
                  >
                    <Headphones size={9} />
                    電話とメール文から事実に基づき抽出
                  </span>
                }
              />

              {/* 初回商談までの IS 活動 の境界線（カレンダー連携で取得） */}
              {(() => {
                const firstMeeting = stageHistory.find(h => h.stage === 'MEETING_DONE')
                if (!firstMeeting) {
                  return (
                    <div
                      className="flex items-center gap-2.5 px-5 py-2.5"
                      style={OBS_ROW_DIVIDER}
                    >
                      <Calendar size={11} style={{ color: 'var(--color-obs-text-subtle)' }} />
                      <span className="text-[11px]" style={{ color: 'var(--color-obs-text-subtle)' }}>
                        初回商談 <span style={{ color: 'var(--color-obs-text-muted)' }}>未設定</span>
                        <span className="ml-1.5 text-[10px]">（カレンダー連携で自動取得）</span>
                      </span>
                      <span className="ml-auto text-[10px]" style={{ color: 'var(--color-obs-text-subtle)' }}>
                        初回商談までのIS活動を可視化
                      </span>
                    </div>
                  )
                }
                const diff = daysFromToday(firstMeeting.date)
                const isPast = diff < 0
                const isToday = diff === 0
                const labelTone: ChipTone = isPast ? 'neutral' : isToday ? 'middle' : 'low'
                const labelText = isToday
                  ? '本日 実施'
                  : isPast
                    ? `${Math.abs(diff)}日前 実施済`
                    : `${diff}日後 実施予定`
                return (
                  <div
                    className="flex items-center gap-2.5 px-5 py-2.5"
                    style={OBS_ROW_DIVIDER}
                  >
                    <Calendar size={11} style={{ color: 'var(--color-obs-text-subtle)' }} />
                    <span className="text-[11px]" style={{ color: 'var(--color-obs-text-subtle)' }}>
                      初回商談{' '}
                      <span className="tabular-nums font-medium" style={{ color: 'var(--color-obs-text)' }}>
                        {firstMeeting.date.replace(/-/g, '/')}
                      </span>
                    </span>
                    <span
                      className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-semibold"
                      style={CHIP_TONE_STYLE[labelTone]}
                    >
                      {labelText}
                    </span>
                    <span className="ml-auto text-[10px]" style={{ color: 'var(--color-obs-text-subtle)' }}>
                      初回商談までのIS活動を可視化
                    </span>
                  </div>
                )
              })()}

              <div>
                {isFields.map((field, i) => {
                  const chipTone: ChipTone | null = field.chipValue ? (IS_CHIP_TONE[field.chipValue] ?? 'neutral') : null
                  const hasChips = (field.chipList && field.chipList.length > 0) || !!chipTone
                  return (
                    <div
                      key={field.key}
                      style={i < isFields.length - 1 ? OBS_ROW_DIVIDER : undefined}
                    >
                      <EditableFieldRow
                        label={field.label}
                        value={field.value}
                        isDefault={field.isDefault}
                        leftWidth={110}
                        onChange={(next) => updateISFieldValue(field.key, next)}
                        onDelete={() => deleteISField(field.key)}
                      >
                        {hasChips ? (
                          <div className="flex flex-wrap items-center gap-1.5">
                            {field.chipList && field.chipList.map((c) => (
                              <span
                                key={c}
                                className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium"
                                style={CHIP_TONE_STYLE.primary}
                              >
                                {c}
                              </span>
                            ))}
                            {chipTone && (
                              <span
                                className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold"
                                style={CHIP_TONE_STYLE[chipTone]}
                              >
                                {field.chipValue}
                              </span>
                            )}
                            {field.value && field.value !== field.chipValue && (
                              <span className="text-[12px]" style={{ color: 'var(--color-obs-text-muted)' }}>
                                {field.value}
                              </span>
                            )}
                          </div>
                        ) : undefined}
                      </EditableFieldRow>
                    </div>
                  )
                })}
                <div style={OBS_ROW_DIVIDER}></div>
                <AddCustomFieldRow onAdd={addISCustomField} />
              </div>
            </motion.div>

            {/* ─── 営業フィールド（議事録から自動抽出） ─────────────── */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
              className="rounded-[var(--radius-obs-xl)] overflow-hidden"
              style={OBS_CARD_STYLE}
            >
              <CardHeader
                icon={Zap}
                title="営業フィールド"
                iconTint="primary"
                right={
                  <span
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold"
                    style={{ background: 'rgba(171,199,255,0.12)', color: 'var(--color-obs-primary)' }}
                  >
                    <Zap size={9} />
                    議事録から自動抽出
                  </span>
                }
              />

              <div>
                {salesFields.map((field, i) => (
                  <div
                    key={field.key}
                    style={i < salesFields.length - 1 ? OBS_ROW_DIVIDER : undefined}
                  >
                    {field.key === '出席者' && field.participants ? (
                      // 出席者は専用UIで表示(編集はコンタクトページから)
                      <div className="flex items-start gap-3 px-5 py-3">
                        <span className="text-[12px] w-[110px] shrink-0 pt-0.5 leading-tight font-medium" style={{ color: 'var(--color-obs-text-subtle)' }}>
                          {field.label}
                        </span>
                        <div className="flex-1 min-w-0">
                          <ParticipantsList participants={field.participants} />
                        </div>
                      </div>
                    ) : (
                      <EditableFieldRow
                        label={field.label}
                        value={field.value}
                        isDefault={field.isDefault}
                        leftWidth={110}
                        onChange={(next) => updateSalesFieldValue(field.key, next)}
                        onDelete={() => deleteSalesField(field.key)}
                      />
                    )}
                  </div>
                ))}
                <div style={OBS_ROW_DIVIDER}></div>
                <AddCustomFieldRow onAdd={addSalesCustomField} />
              </div>
            </motion.div>

            {/* ─── プロダクトフィールド（開発優先度と連動: 課題/要望機能/問題） ─── */}
            {(() => {
              // 開発優先度ページのデータをこの取引の企業名で絞り込み
              const companyName = deal.company
              type CatConfig = {
                key: Extract<PriorityCategory, '課題' | '要望機能' | '問題'>
                Icon: React.ElementType
                tint: string
                bg: string
                source: string
              }
              const CATEGORIES: CatConfig[] = [
                { key: '課題',     Icon: AlertTriangle, tint: 'var(--color-obs-hot)',     bg: 'rgba(255,107,107,0.10)', source: '議事録から自動抽出' },
                { key: '要望機能', Icon: Sparkles,      tint: 'var(--color-obs-primary)', bg: 'rgba(171,199,255,0.10)', source: '議事録から自動抽出' },
                { key: '問題',     Icon: Ticket,        tint: '#c8b9ff',                  bg: 'rgba(200,185,255,0.10)', source: 'チケット連動' },
              ]

              const itemsByCategory: Record<string, Array<{ item: PriorityItem; companyQuotes: { quote: string; meetingDate: string; meetingDocUrl: string; sourceType?: 'meeting' | 'ticket' }[] }>> = {
                '課題': [],
                '要望機能': [],
                '問題': [],
              }
              for (const item of MOCK_PRIORITY_ITEMS) {
                if (!itemsByCategory[item.category]) continue
                const myQuotes = item.evidence.filter((e) => e.companyName === companyName)
                if (myQuotes.length === 0) continue
                itemsByCategory[item.category]!.push({
                  item,
                  companyQuotes: myQuotes.map((e) => ({
                    quote: e.quote,
                    meetingDate: e.meetingDate,
                    meetingDocUrl: e.meetingDocUrl,
                    sourceType: e.sourceType,
                  })),
                })
              }

              return (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.06, ease: [0.16, 1, 0.3, 1] }}
                  className="rounded-[var(--radius-obs-xl)] overflow-hidden"
                  style={OBS_CARD_STYLE}
                >
                  <CardHeader
                    icon={Cpu}
                    title="プロダクトフィールド"
                    iconTint="low"
                    right={
                      <Link
                        href="/priority"
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold transition-colors hover:bg-[rgba(171,199,255,0.18)]"
                        style={{ background: 'rgba(171,199,255,0.12)', color: 'var(--color-obs-primary)' }}
                      >
                        <Zap size={9} />
                        開発優先度と連動
                        <ExternalLink size={9} />
                      </Link>
                    }
                  />

                  {CATEGORIES.map((cat, ci) => {
                    const items = itemsByCategory[cat.key] ?? []
                    const Icon = cat.Icon
                    return (
                      <div
                        key={cat.key}
                        style={ci < CATEGORIES.length - 1 ? OBS_ROW_DIVIDER : undefined}
                      >
                        {/* カテゴリヘッダ */}
                        <div className="flex items-center gap-2 px-5 py-2.5">
                          <span
                            className="inline-flex items-center justify-center w-5 h-5 rounded-[var(--radius-obs-sm)] shrink-0"
                            style={{ background: cat.bg }}
                          >
                            <Icon size={11} style={{ color: cat.tint }} />
                          </span>
                          <span className="text-[12.5px] font-semibold tracking-[-0.01em]" style={{ color: 'var(--color-obs-text)' }}>
                            {cat.key}
                          </span>
                          <span className="text-[10.5px]" style={{ color: 'var(--color-obs-text-subtle)' }}>
                            （{cat.source}）
                          </span>
                          <span
                            className="ml-auto inline-flex items-center justify-center min-w-[18px] h-[18px] px-1.5 rounded-full text-[10px] font-bold tabular-nums"
                            style={{ background: cat.bg, color: cat.tint }}
                          >
                            {items.length}
                          </span>
                        </div>

                        {/* アイテム一覧 */}
                        {items.length === 0 ? (
                          <div
                            className="px-5 pb-3 pt-1 text-[11.5px]"
                            style={{ color: 'var(--color-obs-text-subtle)' }}
                          >
                            この企業に紐づく{cat.key}は抽出されていません
                          </div>
                        ) : (
                          <div className="pb-2">
                            {items.map(({ item, companyQuotes }) => (
                              <div key={item.id} className="px-5 py-2">
                                <Link
                                  href="/priority"
                                  className="group inline-flex items-center gap-1.5 mb-1.5"
                                >
                                  <span
                                    className="text-[12.5px] font-medium tracking-[-0.01em] group-hover:text-[var(--color-obs-primary)] transition-colors"
                                    style={{ color: 'var(--color-obs-text)' }}
                                  >
                                    {item.title}
                                  </span>
                                  <ExternalLink size={10} className="opacity-50 group-hover:opacity-100 transition-opacity" style={{ color: 'var(--color-obs-primary)' }} />
                                </Link>
                                <div className="flex flex-col gap-1.5">
                                  {companyQuotes.map((q, qi) => (
                                    <div
                                      key={qi}
                                      className="pl-3 text-[11.5px] leading-relaxed"
                                      style={{
                                        color: 'var(--color-obs-text-muted)',
                                        boxShadow: `inset 2px 0 0 ${cat.tint}`,
                                      }}
                                    >
                                      <span className="block">「{q.quote}」</span>
                                      <a
                                        href={q.meetingDocUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1 mt-0.5 text-[10.5px] hover:text-[var(--color-obs-primary)] transition-colors"
                                        style={{ color: 'var(--color-obs-text-subtle)' }}
                                      >
                                        <Calendar size={9} />
                                        {q.meetingDate.replace(/-/g, '/')}
                                        <span className="opacity-60">·</span>
                                        {q.sourceType === 'ticket' ? 'チケットを開く' : '議事録を開く'}
                                        <ExternalLink size={9} />
                                      </a>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </motion.div>
              )
            })()}

            {/* ─── 議事録 (タブ切替型) ─────────────────────────── */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
              className="rounded-[var(--radius-obs-xl)] overflow-hidden"
              style={OBS_CARD_STYLE}
            >
              <CardHeader
                icon={FileText}
                title="議事録"
                iconTint="low"
                right={
                  <span
                    className="inline-flex items-center justify-center min-w-[22px] h-[22px] px-1.5 rounded-full text-[10px] font-bold"
                    style={{ background: 'rgba(126,198,255,0.14)', color: 'var(--color-obs-low)' }}
                  >
                    {meetings.length}件
                  </span>
                }
              />

              {/* 議事録: タブ切替 */}
              {meetings.length === 0 ? (
                <div className="px-5 py-8 text-center">
                  <p className="text-[12px]" style={{ color: 'var(--color-obs-text-muted)' }}>
                    議事録がまだありません
                  </p>
                </div>
              ) : (
                <div>
                  {/* タブボタン */}
                  <div
                    className="flex items-center gap-1.5 px-5 py-3 flex-wrap"
                    style={OBS_ROW_DIVIDER}
                  >
                    {meetings.map(m => {
                      const active = m.id === activeMeetingId
                      return (
                        <button
                          key={m.id}
                          onClick={() => setActiveMeetingId(m.id)}
                          className="inline-flex items-center gap-1.5 px-3 h-[30px] rounded-[8px] text-[11.5px] font-medium transition-all"
                          style={active ? {
                            backgroundColor: 'rgba(171,199,255,0.14)',
                            color: 'var(--color-obs-primary)',
                          } : {
                            background: 'var(--color-obs-surface-lowest)',
                            color: 'var(--color-obs-text-muted)',
                            boxShadow: 'inset 0 0 0 1px rgba(109,106,111,0.12)',
                          }}
                        >
                          <span className="tabular-nums font-semibold">{m.sequence}</span>
                          <span
                            className="text-[11px] tabular-nums"
                            style={{ opacity: active ? 0.85 : 0.7 }}
                          >
                            {formatDateShort(m.date)}
                          </span>
                        </button>
                      )
                    })}
                  </div>

                  {/* 選択中の1件を表示 */}
                  {activeMeeting && (
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={activeMeeting.id}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                        className="p-5"
                      >
                        {/* Header row */}
                        <div className="flex items-start gap-3 mb-2">
                          {/* Sequence badge — flat primary tone */}
                          <div
                            className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-[12px] font-semibold"
                            style={{
                              backgroundColor: 'rgba(171,199,255,0.14)',
                              color: 'var(--color-obs-primary)',
                            }}
                          >
                            {activeMeeting.sequence}
                          </div>

                          {/* Title area */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <Link
                                href={`/meetings?id=${activeMeeting.id}`}
                                className="group inline-flex items-center gap-1.5 hover:text-[var(--color-obs-primary)] transition-colors"
                                style={{ color: 'var(--color-obs-text)' }}
                                title="元の議事録ページを開く"
                              >
                                <h4 className="text-[13.5px] font-semibold tracking-[-0.01em] group-hover:underline" style={{ color: 'inherit' }}>
                                  {activeMeeting.sequence}回目 — {activeMeeting.title}
                                </h4>
                                <ExternalLink
                                  size={11}
                                  className="opacity-40 group-hover:opacity-100 transition-opacity shrink-0"
                                />
                              </Link>
                              <span className="text-[11px] tabular-nums" style={{ color: 'var(--color-obs-text-muted)' }}>
                                {formatDate(activeMeeting.date)}
                              </span>
                              <span
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold"
                                style={{ background: 'rgba(143,140,144,0.14)', color: 'var(--color-obs-text-muted)' }}
                              >
                                <Clock size={9} />
                                {activeMeeting.durationMin}分
                              </span>
                            </div>

                            {/* Participants */}
                            <div className="flex items-center gap-1 mt-1 flex-wrap">
                              <Users size={10} style={{ color: 'var(--color-obs-text-subtle)' }} />
                              <span className="text-[11px]" style={{ color: 'var(--color-obs-text-muted)' }}>
                                {activeMeeting.participants.join('、')}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* エグゼクティブサマリ (文章体プロセに統合) */}
                        <div className="pl-12">
                          <p className="text-[10px] font-bold uppercase tracking-[0.08em] mb-1.5" style={{ color: 'var(--color-obs-text-subtle)' }}>
                            エグゼクティブサマリ
                          </p>
                          <p className="text-[12.5px] leading-relaxed" style={{ color: 'var(--color-obs-text)' }}>
                            {[activeMeeting.summary, ...activeMeeting.keyPoints]
                              .map((s) => s.trim().replace(/。$/, ''))
                              .filter((s) => s.length > 0)
                              .join('。')}
                            。
                          </p>
                        </div>
                      </motion.div>
                    </AnimatePresence>
                  )}
                </div>
              )}
            </motion.div>

            {/* ─── IS Contact List ─────────────────────────────── */}
            {(DEAL_CONTACTS[id] ?? []).length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
                className="rounded-[var(--radius-obs-xl)] overflow-hidden"
                style={OBS_CARD_STYLE}
              >
                <CardHeader
                  icon={Phone}
                  title="コンタクト(IS)"
                  iconTint="primary"
                  right={
                    <span
                      className="inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold"
                      style={{ background: 'rgba(171,199,255,0.12)', color: 'var(--color-obs-primary)' }}
                    >
                      {(DEAL_CONTACTS[id] ?? []).length}
                    </span>
                  }
                />

                <motion.div
                  initial="hidden"
                  animate="visible"
                  variants={{ visible: { transition: { staggerChildren: 0.04 } } }}
                >
                  {(DEAL_CONTACTS[id] ?? []).map((contact, i) => {
                    const ss = IS_STATUS_TONE[contact.status]
                    return (
                      <motion.div
                        key={contact.id}
                        variants={{
                          hidden: { opacity: 0, y: 5 },
                          visible: { opacity: 1, y: 0, transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] } },
                        }}
                        className="flex items-center gap-3 px-5 py-3 cursor-pointer transition-colors hover:bg-[rgba(171,199,255,0.04)]"
                        style={i < (DEAL_CONTACTS[id] ?? []).length - 1 ? OBS_ROW_DIVIDER : undefined}
                        onClick={() => router.push(`/contacts/${contact.id}`)}
                      >
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-semibold shrink-0"
                          style={{
                            background: 'linear-gradient(135deg, var(--color-obs-primary) 0%, var(--color-obs-primary-container) 100%)',
                            color: 'var(--color-obs-on-primary)',
                          }}
                        >
                          {contact.name[0]}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[13px] font-medium tracking-[-0.01em]" style={{ color: 'var(--color-obs-text)' }}>
                              {contact.name}
                            </span>
                            {contact.isDecisionMaker && (
                              <span
                                className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-[4px] text-[10px] font-semibold"
                                style={{ background: 'rgba(255,184,107,0.16)', color: 'var(--color-obs-middle)' }}
                              >
                                <Star size={8} strokeWidth={2.5} />
                                決裁者
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] mt-0.5" style={{ color: 'var(--color-obs-text-muted)' }}>
                            {contact.title}
                          </p>
                        </div>

                        <span
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium shrink-0"
                          style={{ background: ss.bg, color: ss.color }}
                        >
                          <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: ss.dot }} />
                          {contact.status}
                        </span>

                        <span className="flex items-center gap-1 text-[11px] shrink-0" style={{ color: 'var(--color-obs-text-muted)' }}>
                          <Phone size={10} />
                          {contact.callAttempts}回
                        </span>
                      </motion.div>
                    )
                  })}
                </motion.div>

                <div className="px-5 py-3" style={OBS_ROW_DIVIDER}>
                  <button
                    className="flex items-center gap-1.5 text-[12px] transition-colors font-medium hover:text-[var(--color-obs-text)]"
                    style={{ color: 'var(--color-obs-primary)' }}
                  >
                    <Plus size={12} strokeWidth={2.5} />
                    コンタクトを追加
                  </button>
                </div>
              </motion.div>
            )}

            {/* ─── Activity Timeline (コンタクト詳細と同じ仕様: コール/メール/会議/議事録 を内包) ─── */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.18, ease: [0.16, 1, 0.3, 1] }}
              className="rounded-[var(--radius-obs-xl)] overflow-hidden"
              style={OBS_CARD_STYLE}
            >
              <div className="flex items-center gap-2 px-5 py-4" style={OBS_CARD_DIVIDER}>
                <Activity size={14} style={{ color: 'var(--color-obs-primary)' }} />
                <h3 className="text-[13px] font-semibold tracking-[-0.01em]" style={{ color: 'var(--color-obs-text)' }}>
                  アクティビティ
                </h3>
                <p className="text-[11px] ml-1" style={{ color: 'var(--color-obs-text-subtle)' }}>
                  コール・メール・会議の履歴を時系列で表示
                </p>
              </div>
              <div className="p-5">
                {dbActivities.length > 0 ? (
                  <div className="space-y-3">
                    {dbActivities.map((entry) => (
                      <div
                        key={entry.id}
                        className="rounded-[10px] px-4 py-3"
                        style={{
                          background: 'var(--color-obs-surface-low)',
                          boxShadow: 'inset 0 0 0 1px rgba(109,106,111,0.12)',
                        }}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <Mail size={13} style={{ color: 'var(--color-obs-primary)' }} />
                              <p
                                className="truncate text-[13px] font-semibold"
                                style={{ color: 'var(--color-obs-text)' }}
                              >
                                {entry.title}
                              </p>
                            </div>
                            {entry.description && (
                              <p
                                className="mt-2 line-clamp-3 text-[12px] leading-relaxed"
                                style={{ color: 'var(--color-obs-text-muted)' }}
                              >
                                {entry.description}
                              </p>
                            )}
                          </div>
                          <span
                            className="shrink-0 text-[11px]"
                            style={{ color: 'var(--color-obs-text-subtle)' }}
                          >
                            {formatTimestamp(entry.timestamp)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <ContactHistoryTimeline />
                )}
              </div>
            </motion.div>
          </div>

          {/* ── Right Sidebar ── */}
          <aside className="flex flex-col gap-6 min-w-0">

            {/* ─── 進捗管理 (右カラムへ移動) ─────────────────── */}
            <motion.div
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
              className="rounded-[var(--radius-obs-xl)] overflow-hidden"
              style={OBS_CARD_STYLE}
            >
              <CardHeader
                icon={Flame}
                title="進捗管理"
                iconTint="middle"
              />

              <div className="p-4 space-y-3.5">
                {/* Status */}
                <div>
                  <label
                    className="text-[11px] font-bold tracking-[0.06em] mb-1.5 block"
                    style={{ color: 'var(--color-obs-text-subtle)' }}
                  >
                    進捗
                  </label>
                  <textarea
                    value={progressStatus}
                    onChange={e => setProgressStatus(e.target.value)}
                    placeholder="現在の進行状態を入力..."
                    rows={2}
                    className="w-full px-3 py-2 text-[12.5px] rounded-[var(--radius-obs-md)] outline-none resize-none leading-relaxed"
                    style={{
                      background: 'var(--color-obs-surface-lowest)',
                      color: 'var(--color-obs-text)',
                      boxShadow: 'inset 0 0 0 1px rgba(109,106,111,0.12)',
                    }}
                  />
                </div>

                {/* Next Action */}
                <div>
                  <label
                    className="text-[11px] font-bold tracking-[0.06em] mb-1.5 flex items-center justify-between"
                    style={{ color: 'var(--color-obs-text-subtle)' }}
                  >
                    <span className="flex items-center gap-1.5">
                      ネクストアクション
                      <span
                        className="text-[10px] font-semibold px-2 py-0.5 rounded-full tracking-normal"
                        style={{
                          background: 'rgba(171,199,255,0.10)',
                          color: 'var(--color-obs-primary)',
                        }}
                      >
                        タスク連動
                      </span>
                    </span>
                    <input
                      type="date"
                      value={nextActionDate ?? ''}
                      onChange={e => setNextActionDate(e.target.value || null)}
                      className="h-[22px] px-1.5 text-[10.5px] rounded-[6px] outline-none cursor-pointer normal-case tracking-normal"
                      style={{
                        background: 'var(--color-obs-surface-lowest)',
                        color: 'var(--color-obs-text)',
                        colorScheme: 'dark',
                        boxShadow: 'inset 0 0 0 1px rgba(109,106,111,0.12)',
                      }}
                    />
                  </label>
                  <textarea
                    value={nextAction}
                    onChange={e => setNextAction(e.target.value)}
                    placeholder="次の一手を入力..."
                    rows={2}
                    className="w-full px-3 py-2 text-[12.5px] rounded-[var(--radius-obs-md)] outline-none resize-none leading-relaxed"
                    style={{
                      background: 'var(--color-obs-surface-lowest)',
                      color: 'var(--color-obs-text)',
                      boxShadow: 'inset 0 0 0 1px rgba(109,106,111,0.12)',
                    }}
                  />
                </div>

                {/* Memo (新規) */}
                <div>
                  <label
                    className="text-[11px] font-bold uppercase tracking-[0.06em] mb-1.5 flex items-center gap-1.5"
                    style={{ color: 'var(--color-obs-text-subtle)' }}
                  >
                    <StickyNote size={10} style={{ color: 'var(--color-obs-middle)' }} />
                    メモ
                  </label>
                  <textarea
                    value={memo}
                    onChange={e => setMemo(e.target.value)}
                    placeholder="自由記述のメモ..."
                    rows={4}
                    className="w-full px-3 py-2 text-[12.5px] rounded-[var(--radius-obs-md)] outline-none resize-none leading-relaxed"
                    style={{
                      background: 'var(--color-obs-surface-lowest)',
                      color: 'var(--color-obs-text)',
                      boxShadow: 'inset 0 0 0 1px rgba(109,106,111,0.12)',
                    }}
                  />
                </div>
              </div>

            </motion.div>

            {/* ─── タスク管理 (右カラムへ移動) ──────────────────── */}
            <motion.div
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
              className="rounded-[var(--radius-obs-xl)] overflow-hidden"
              style={OBS_CARD_STYLE}
            >
              <CardHeader
                icon={CheckCircle2}
                title="タスク"
                iconTint="primary"
                right={
                  <>
                    <span
                      className="inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold"
                      style={{ background: 'rgba(171,199,255,0.12)', color: 'var(--color-obs-primary)' }}
                    >
                      {tasks.length}
                    </span>
                    <button
                      onClick={() => setTaskModal('new')}
                      className="inline-flex items-center gap-1 px-2.5 h-[26px] rounded-[7px] text-[10.5px] font-semibold transition-all hover:brightness-106"
                      style={{
                        background: 'var(--color-obs-primary-container)',
                        color: 'var(--color-obs-on-primary)',
                      }}
                    >
                      <Plus size={10} strokeWidth={2.4} />
                      作成
                    </button>
                  </>
                }
              />

              {tasks.length === 0 ? (
                <div className="px-4 py-6 text-center">
                  <p className="text-[11.5px]" style={{ color: 'var(--color-obs-text-muted)' }}>
                    タスクが登録されていません
                  </p>
                  <button
                    onClick={() => setTaskModal('new')}
                    className="mt-2 inline-flex items-center gap-1 text-[10.5px] font-bold transition-colors hover:text-[var(--color-obs-text)]"
                    style={{ color: 'var(--color-obs-primary)' }}
                  >
                    <Plus size={10} strokeWidth={2.5} />
                    最初のタスクを作成
                  </button>
                </div>
              ) : (
                <div>
                  {tasks.map((task, i) => {
                    const cfg = DEAL_TASK_TYPE_STYLES[task.type]
                    const Icon = cfg.Icon
                    const dueDate = task.dueAt ? new Date(task.dueAt) : null
                    const isOverdue = dueDate && !task.done && dueDate < new Date('2026-04-21')
                    return (
                      <div
                        key={task.id}
                        className="flex items-center gap-2 px-3.5 py-2.5 transition-colors hover:bg-[rgba(171,199,255,0.04)] group"
                        style={i < tasks.length - 1 ? OBS_ROW_DIVIDER : undefined}
                      >
                        <button
                          onClick={() => handleTaskToggle(task.id)}
                          className="w-4 h-4 rounded-[4px] flex items-center justify-center shrink-0 transition-all"
                          style={{
                            backgroundColor: task.done ? 'var(--color-obs-primary-container)' : 'var(--color-obs-surface-lowest)',
                            boxShadow: task.done
                              ? 'none'
                              : 'inset 0 0 0 1px rgba(109,106,111,0.25)',
                          }}
                        >
                          {task.done && <CheckCircle2 size={10} style={{ color: 'var(--color-obs-on-primary)' }} strokeWidth={2.5} />}
                        </button>

                        <div
                          className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
                          style={{
                            backgroundColor: cfg.bg,
                            opacity: task.done ? 0.5 : 1,
                          }}
                        >
                          <Icon size={12} style={{ color: cfg.iconColor }} strokeWidth={2} />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <p
                              className="text-[12px] font-medium truncate"
                              style={{
                                color: task.done ? 'var(--color-obs-text-subtle)' : 'var(--color-obs-text)',
                                textDecoration: task.done ? 'line-through' : 'none',
                              }}
                            >
                              {task.title}
                            </p>
                          </div>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            {task.dueAt && (
                              <span
                                className="inline-flex items-center gap-1 px-1.5 py-[1px] rounded-[4px] text-[9.5px] font-bold tabular-nums whitespace-nowrap shrink-0"
                                style={{
                                  background: isOverdue ? 'rgba(255,107,107,0.14)' : 'rgba(171,199,255,0.10)',
                                  color: isOverdue ? 'var(--color-obs-hot)' : 'var(--color-obs-primary)',
                                }}
                              >
                                <Calendar size={8} strokeWidth={2.5} />
                                {formatDateShort(task.dueAt)}
                              </span>
                            )}
                            {task.memo && (
                              <p className="text-[10.5px] truncate" style={{ color: 'var(--color-obs-text-muted)' }}>
                                {task.memo}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => setTaskModal(task)}
                            className="w-6 h-6 flex items-center justify-center rounded-[5px] transition-colors hover:bg-[rgba(171,199,255,0.10)]"
                            title="編集"
                          >
                            <Pencil size={10} style={{ color: 'var(--color-obs-primary)' }} />
                          </button>
                          <button
                            onClick={() => handleTaskDelete(task.id)}
                            className="w-6 h-6 flex items-center justify-center rounded-[5px] transition-colors hover:bg-[rgba(255,107,107,0.12)]"
                            title="削除"
                          >
                            <Trash2 size={10} style={{ color: 'var(--color-obs-hot)' }} />
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </motion.div>

            {/* ─── チケット ──────────────────── */}
            <motion.div
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.14, ease: [0.16, 1, 0.3, 1] }}
              className="rounded-[var(--radius-obs-xl)] overflow-hidden"
              style={OBS_CARD_STYLE}
            >
              <CardHeader
                icon={LifeBuoy}
                title="チケット"
                iconTint="low"
                right={
                  <>
                    <span
                      className="inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold"
                      style={{ background: 'rgba(126,198,255,0.14)', color: 'var(--color-obs-low)' }}
                    >
                      {tickets.length}
                    </span>
                    <button
                      onClick={() => setShowCreateTicket(true)}
                      className="inline-flex items-center gap-1 px-2.5 h-[26px] rounded-[7px] text-[10.5px] font-semibold transition-all hover:brightness-106"
                      style={{
                        background: 'var(--color-obs-primary-container)',
                        color: 'var(--color-obs-on-primary)',
                      }}
                    >
                      <Plus size={10} strokeWidth={2.4} />
                      作成
                    </button>
                  </>
                }
              />

              {ticketsLoading ? (
                <div className="px-4 py-6 text-center">
                  <p className="text-[11.5px]" style={{ color: 'var(--color-obs-text-muted)' }}>
                    読み込み中...
                  </p>
                </div>
              ) : tickets.length === 0 ? (
                <div className="px-4 py-6 text-center">
                  <p className="text-[11.5px]" style={{ color: 'var(--color-obs-text-muted)' }}>
                    チケットはまだありません
                  </p>
                  <button
                    onClick={() => setShowCreateTicket(true)}
                    className="mt-2 inline-flex items-center gap-1 text-[10.5px] font-bold transition-colors hover:text-[var(--color-obs-text)]"
                    style={{ color: 'var(--color-obs-primary)' }}
                  >
                    <Plus size={10} strokeWidth={2.5} />
                    最初のチケットを作成
                  </button>
                </div>
              ) : (
                <div>
                  {tickets.map((t, i) => (
                    <button
                      key={t.id}
                      onClick={() => router.push(`/tickets/${t.id}`)}
                      className="w-full flex items-start gap-2 px-3.5 py-2.5 transition-colors hover:bg-[rgba(171,199,255,0.04)] text-left"
                      style={i < tickets.length - 1 ? OBS_ROW_DIVIDER : undefined}
                    >
                      <span
                        className="font-mono text-[10px] tabular-nums shrink-0 mt-[2px]"
                        style={{ color: 'var(--color-obs-text-subtle)' }}
                      >
                        T-{String(t.ticketNumber).padStart(4, '0')}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p
                          className="text-[12px] font-medium truncate"
                          style={{ color: 'var(--color-obs-text)' }}
                        >
                          {t.subject}
                        </p>
                        <div className="flex items-center gap-1.5 mt-1">
                          <TicketStatusBadge status={t.status} />
                          {t.assignee && (
                            <span
                              className="text-[10px] truncate"
                              style={{ color: 'var(--color-obs-text-muted)' }}
                            >
                              · {t.assignee.name}
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Stage History */}
            <motion.div
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.18, ease: [0.16, 1, 0.3, 1] }}
              className="rounded-[var(--radius-obs-xl)] overflow-hidden"
              style={OBS_CARD_STYLE}
            >
              <CardHeader
                icon={Target}
                title="ステージ履歴"
                iconTint="primary"
              />

              <motion.div
                className="p-3 space-y-0.5"
                initial="hidden"
                animate="visible"
                variants={{ visible: { transition: { staggerChildren: 0.04 } } }}
              >
                {ALL_STAGES.map((stage) => {
                  const cfg = STAGE_CONFIG[stage]
                  const item = stageHistory.find((h) => h.stage === stage)
                  const isCurrent = stage === currentStage
                  const isPassed = !!item && !item.isCurrent
                  return (
                    <motion.button
                      key={stage}
                      type="button"
                      onClick={() => { if (!isCurrent) handleChangeStage(stage) }}
                      variants={{
                        hidden: { opacity: 0, x: -8 },
                        visible: { opacity: 1, x: 0, transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] } },
                      }}
                      className="w-full flex items-center gap-2.5 px-2 py-2 rounded-[7px] text-left transition-colors"
                      style={{
                        background: isCurrent ? 'rgba(171,199,255,0.06)' : 'transparent',
                        cursor: isCurrent ? 'default' : 'pointer',
                      }}
                      onMouseEnter={(e) => {
                        if (!isCurrent) (e.currentTarget as HTMLButtonElement).style.background = 'rgba(171,199,255,0.04)'
                      }}
                      onMouseLeave={(e) => {
                        if (!isCurrent) (e.currentTarget as HTMLButtonElement).style.background = 'transparent'
                      }}
                      title={isCurrent ? '現在のステージ' : `${cfg.label} に変更`}
                    >
                      {isCurrent ? (
                        <CheckCircle2 size={13} style={{ color: 'var(--color-obs-primary)' }} className="shrink-0" />
                      ) : (
                        <div className="w-[13px] h-[13px] rounded-full shrink-0" style={{ boxShadow: 'inset 0 0 0 1px rgba(109,106,111,0.20)' }} />
                      )}
                      <span
                        className="text-[12px] flex-1"
                        style={{
                          fontWeight: isCurrent ? 600 : 400,
                          color: isCurrent
                            ? 'var(--color-obs-primary)'
                            : 'var(--color-obs-text-subtle)',
                        }}
                      >
                        {cfg.label}
                      </span>
                      <span
                        className="text-[11px]"
                        style={{ color: 'var(--color-obs-text-subtle)' }}
                      >
                        {isCurrent
                          ? '現在'
                          : isPassed
                            ? item.daysAgo === 0 ? '今日' : `${item.daysAgo}日前`
                            : '未到達'}
                      </span>
                    </motion.button>
                  )
                })}
              </motion.div>
            </motion.div>

            {/* 提案内容（複数提案・編集・カスタム項目・添付対応） */}
            {(() => {
              const proposal = proposals.find((p) => p.id === activeProposalId) ?? proposals[0]
              if (!proposal) {
                return (
                  <motion.div
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                    className="rounded-[var(--radius-obs-xl)] overflow-hidden"
                    style={OBS_CARD_STYLE}
                  >
                    <CardHeader icon={Briefcase} title="提案内容" iconTint="primary" />
                    <div className="px-4 py-6 text-center">
                      <p className="text-[11.5px] mb-3" style={{ color: 'var(--color-obs-text-muted)' }}>
                        提案がまだありません
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          const np = createEmptyProposal()
                          setProposals([np])
                          setActiveProposalId(np.id)
                          setEditingProposal(np)
                        }}
                        className="inline-flex items-center gap-1 px-3 h-7 rounded-[var(--radius-obs-md)] text-[11.5px] font-semibold transition-colors"
                        style={{
                          background: 'rgba(171,199,255,0.14)',
                          color: 'var(--color-obs-primary)',
                          boxShadow: 'inset 0 0 0 1px rgba(171,199,255,0.42)',
                        }}
                      >
                        <Plus size={11} strokeWidth={2.4} />
                        提案を作成
                      </button>
                    </div>
                  </motion.div>
                )
              }
              const cycleTone = PAYMENT_CYCLE_TONE[proposal.paymentCycle]
              const totalContractValue =
                proposal.paymentCycle === '月額'
                  ? proposal.amount * proposal.contractMonths
                  : proposal.amount
              return (
                <motion.div
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                  className="rounded-[var(--radius-obs-xl)] overflow-hidden"
                  style={OBS_CARD_STYLE}
                >
                  <CardHeader
                    icon={Briefcase}
                    title="提案内容"
                    iconTint="primary"
                    right={
                      <div className="flex items-center gap-1.5">
                        <span
                          className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9.5px] font-semibold"
                          style={{ background: cycleTone.bg, color: cycleTone.color }}
                        >
                          {proposal.paymentCycle}
                        </span>
                        <button
                          type="button"
                          onClick={() => setEditingProposal(proposal)}
                          title="この提案を編集"
                          className="inline-flex items-center justify-center w-6 h-6 rounded-[6px] transition-colors hover:bg-[var(--color-obs-surface-high)]"
                          style={{ color: 'var(--color-obs-text-muted)' }}
                        >
                          <Pencil size={11} />
                        </button>
                      </div>
                    }
                  />

                  {/* 提案タブ＋新規追加 */}
                  <div
                    className="flex items-center gap-1 px-3 py-2 flex-wrap"
                    style={{ boxShadow: 'inset 0 -1px 0 rgba(109,106,111,0.10)' }}
                  >
                    {proposals.map((p) => {
                      const active = p.id === proposal.id
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => setActiveProposalId(p.id)}
                          className="inline-flex items-center gap-1 px-2.5 h-7 rounded-[8px] text-[11px] font-semibold transition-colors max-w-[140px]"
                          style={
                            active
                              ? {
                                  background: 'rgba(171,199,255,0.18)',
                                  color: 'var(--color-obs-primary)',
                                  boxShadow: 'inset 0 0 0 1px rgba(171,199,255,0.45)',
                                }
                              : {
                                  background: 'var(--color-obs-surface-lowest)',
                                  color: 'var(--color-obs-text-muted)',
                                  boxShadow: 'inset 0 0 0 1px rgba(109,106,111,0.16)',
                                }
                          }
                        >
                          <span className="truncate">{p.name || '無題の提案'}</span>
                        </button>
                      )
                    })}
                    <button
                      type="button"
                      onClick={() => {
                        const np = createEmptyProposal()
                        setProposals((prev) => [...prev, np])
                        setActiveProposalId(np.id)
                        setEditingProposal(np)
                      }}
                      title="新しい提案を追加"
                      className="inline-flex items-center justify-center w-7 h-7 rounded-[8px] transition-colors hover:bg-[var(--color-obs-surface-high)]"
                      style={{
                        color: 'var(--color-obs-text-muted)',
                        boxShadow: 'inset 0 0 0 1px rgba(109,106,111,0.16)',
                      }}
                    >
                      <Plus size={12} strokeWidth={2.4} />
                    </button>
                  </div>

                  {/* サービス */}
                  <div
                    className="px-4 py-3"
                    style={{ boxShadow: 'inset 0 -1px 0 rgba(109,106,111,0.10)' }}
                  >
                    <div
                      className="text-[10px] font-semibold tracking-[0.06em] uppercase mb-1"
                      style={{ color: 'var(--color-obs-text-subtle)' }}
                    >
                      提案サービス
                    </div>
                    <div
                      className="text-[12.5px] font-semibold leading-snug"
                      style={{ color: 'var(--color-obs-text)' }}
                    >
                      {proposal.service || '—'}
                    </div>
                  </div>

                  {/* 金額サマリ */}
                  <div
                    className="px-4 py-3"
                    style={{ boxShadow: 'inset 0 -1px 0 rgba(109,106,111,0.10)' }}
                  >
                    <div className="flex items-baseline justify-between mb-2">
                      <span
                        className="text-[10px] font-semibold tracking-[0.06em] uppercase"
                        style={{ color: 'var(--color-obs-text-subtle)' }}
                      >
                        {proposal.paymentCycle === '月額' ? '月額' : '提案金額'}
                      </span>
                      <span
                        className="text-[16px] font-bold tabular-nums"
                        style={{ color: 'var(--color-obs-text)' }}
                      >
                        ¥{(proposal.amount / 1000000).toFixed(proposal.amount >= 10000000 ? 1 : 2)}M
                      </span>
                    </div>
                    <div className="flex items-baseline justify-between text-[11px]">
                      <span style={{ color: 'var(--color-obs-text-subtle)' }}>
                        契約期間総額
                      </span>
                      <span className="tabular-nums font-medium" style={{ color: 'var(--color-obs-text)' }}>
                        ¥{totalContractValue.toLocaleString()}
                      </span>
                    </div>
                    {proposal.initialFee != null && proposal.initialFee > 0 && (
                      <div className="flex items-baseline justify-between text-[11px] mt-1">
                        <span style={{ color: 'var(--color-obs-text-subtle)' }}>
                          初期費用
                        </span>
                        <span className="tabular-nums" style={{ color: 'var(--color-obs-text-muted)' }}>
                          ¥{proposal.initialFee.toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* 契約条件 + カスタム項目 */}
                  <div
                    className="px-4 py-3"
                    style={{ boxShadow: 'inset 0 -1px 0 rgba(109,106,111,0.10)' }}
                  >
                    <div className="flex flex-col gap-1.5 text-[11.5px]">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={9} style={{ color: 'var(--color-obs-text-subtle)' }} className="shrink-0" />
                        <span className="w-20 shrink-0" style={{ color: 'var(--color-obs-text-subtle)' }}>契約期間</span>
                        <span className="tabular-nums" style={{ color: 'var(--color-obs-text)' }}>
                          {proposal.contractMonths}ヶ月
                        </span>
                      </div>
                      {proposal.licenseCount !== null && (
                        <div className="flex items-center gap-1.5">
                          <Users size={9} style={{ color: 'var(--color-obs-text-subtle)' }} className="shrink-0" />
                          <span className="w-20 shrink-0" style={{ color: 'var(--color-obs-text-subtle)' }}>ライセンス</span>
                          <span className="tabular-nums" style={{ color: 'var(--color-obs-text)' }}>
                            {proposal.licenseCount}名分
                          </span>
                        </div>
                      )}
                      {proposal.startAt && (
                        <div className="flex items-center gap-1.5">
                          <Zap size={9} style={{ color: 'var(--color-obs-text-subtle)' }} className="shrink-0" />
                          <span className="w-20 shrink-0" style={{ color: 'var(--color-obs-text-subtle)' }}>開始予定</span>
                          <span className="tabular-nums" style={{ color: 'var(--color-obs-text)' }}>
                            {formatDate(proposal.startAt)}
                          </span>
                        </div>
                      )}
                      {/* カスタム項目 */}
                      {proposal.customFields.map((cf) => (
                        <div key={cf.id} className="flex items-start gap-1.5">
                          <Sparkles size={9} style={{ color: 'var(--color-obs-primary)' }} className="shrink-0 mt-[3px]" />
                          <span className="w-20 shrink-0 truncate" style={{ color: 'var(--color-obs-text-subtle)' }} title={cf.label}>{cf.label}</span>
                          <span className="flex-1 break-words" style={{ color: 'var(--color-obs-text)' }}>
                            {cf.value || '—'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 添付ファイル */}
                  <div
                    className="px-4 py-3"
                    style={{ boxShadow: proposal.notes ? 'inset 0 -1px 0 rgba(109,106,111,0.10)' : undefined }}
                  >
                    <div className="flex items-center gap-1.5 mb-2">
                      <FileText size={10} style={{ color: 'var(--color-obs-text-subtle)' }} />
                      <span
                        className="text-[10px] font-semibold tracking-[0.06em] uppercase"
                        style={{ color: 'var(--color-obs-text-subtle)' }}
                      >
                        添付ファイル
                      </span>
                      <span
                        className="text-[10px] tabular-nums"
                        style={{ color: 'var(--color-obs-text-muted)' }}
                      >
                        {proposal.attachments.length}件
                      </span>
                      <button
                        type="button"
                        onClick={() => setEditingProposal(proposal)}
                        title="添付ファイルを追加・編集"
                        className="ml-auto inline-flex items-center gap-0.5 text-[10.5px] font-medium transition-colors hover:text-[var(--color-obs-primary)]"
                        style={{ color: 'var(--color-obs-text-muted)' }}
                      >
                        <Plus size={10} strokeWidth={2.4} />
                        追加
                      </button>
                    </div>
                    {proposal.attachments.length === 0 ? (
                      <p className="text-[11px]" style={{ color: 'var(--color-obs-text-subtle)' }}>
                        契約書・NDA・見積書などをここに格納できます
                      </p>
                    ) : (
                      <div className="flex flex-col gap-1">
                        {proposal.attachments.map((a) => {
                          const tone = ATTACHMENT_TYPE_TONE[a.type]
                          return (
                            <div
                              key={a.id}
                              className="flex items-center gap-2 px-2 py-1.5 rounded-[var(--radius-obs-sm)]"
                              style={{ background: 'var(--color-obs-surface-lowest)' }}
                            >
                              <FileText size={11} style={{ color: 'var(--color-obs-text-muted)' }} className="shrink-0" />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="text-[11.5px] font-medium truncate" style={{ color: 'var(--color-obs-text)' }} title={a.name}>
                                    {a.name}
                                  </span>
                                  <span
                                    className="inline-flex items-center px-1.5 py-0.5 rounded-[4px] text-[9px] font-semibold shrink-0"
                                    style={{ background: tone.bg, color: tone.color }}
                                  >
                                    {a.type}
                                  </span>
                                </div>
                                <div className="text-[9.5px] tabular-nums" style={{ color: 'var(--color-obs-text-subtle)' }}>
                                  {a.sizeKb >= 1024 ? `${(a.sizeKb / 1024).toFixed(1)}MB` : `${a.sizeKb}KB`} · {formatDate(a.uploadedAt)}
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>

                  {/* 提案メモ */}
                  {proposal.notes && (
                    <div className="px-4 py-3">
                      <div className="flex items-start gap-1.5">
                        <StickyNote size={10} style={{ color: 'var(--color-obs-text-subtle)' }} className="shrink-0 mt-0.5" />
                        <p
                          className="text-[11px] leading-relaxed"
                          style={{ color: 'var(--color-obs-text-muted)' }}
                        >
                          {proposal.notes}
                        </p>
                      </div>
                    </div>
                  )}
                </motion.div>
              )
            })()}

            {/* 紐付け情報（紐付け企業 + 担当コンタクト） */}
            {(() => {
              // deal は MOCK_DEALS[id] ?? MOCK_DEALS['d1'] でフォールバックしているため
              // 紐付け企業・コンタクトも同様にフォールバックして整合させる
              const linkedCompany = DEAL_LINKED_COMPANIES[id] ?? DEAL_LINKED_COMPANIES['d1']
              const linkedContacts = DEAL_CONTACTS[id] ?? DEAL_CONTACTS['d1'] ?? []
              const primaryContact =
                linkedContacts.find((c) => c.id === deal.contactId) ?? linkedContacts[0]
              const otherContacts = linkedContacts.filter((c) => c.id !== primaryContact?.id)
              const websiteHost = linkedCompany?.websiteUrl
                ?.replace(/^https?:\/\//, '')
                .replace(/\/$/, '')
              return (
                <motion.div
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.22, ease: [0.16, 1, 0.3, 1] }}
                  className="rounded-[var(--radius-obs-xl)] overflow-hidden"
                  style={OBS_CARD_STYLE}
                >
                  <CardHeader icon={Layers} title="紐付け情報" iconTint="primary" />

                  {/* 紐付け企業 */}
                  <div
                    className="px-4 py-3.5"
                    style={{ boxShadow: 'inset 0 -1px 0 rgba(109,106,111,0.10)' }}
                  >
                    <div className="flex items-center gap-1.5 mb-2.5">
                      <Building2 size={10} style={{ color: 'var(--color-obs-text-subtle)' }} />
                      <span
                        className="text-[10px] font-semibold tracking-[0.06em] uppercase"
                        style={{ color: 'var(--color-obs-text-subtle)' }}
                      >
                        紐付け企業
                      </span>
                    </div>

                    <button
                      onClick={() => router.push(`/companies/${deal.companyId}`)}
                      className="group flex items-center gap-2 mb-2.5 transition-colors w-full text-left"
                    >
                      <div
                        className="w-7 h-7 rounded-[var(--radius-obs-md)] flex items-center justify-center shrink-0"
                        style={{
                          background:
                            'linear-gradient(135deg, var(--color-obs-primary) 0%, var(--color-obs-primary-container) 100%)',
                          color: 'var(--color-obs-on-primary)',
                        }}
                      >
                        <Building2 size={12} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div
                          className="text-[12px] font-semibold tracking-[-0.01em] truncate group-hover:text-[var(--color-obs-primary)] transition-colors"
                          style={{ color: 'var(--color-obs-text)' }}
                        >
                          {deal.company}
                        </div>
                        {linkedCompany && (
                          <div
                            className="text-[10.5px] mt-0.5 truncate"
                            style={{ color: 'var(--color-obs-text-muted)' }}
                          >
                            {linkedCompany.industry}
                          </div>
                        )}
                      </div>
                      <ExternalLink
                        size={10}
                        className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                        style={{ color: 'var(--color-obs-primary)' }}
                      />
                    </button>

                    {linkedCompany ? (
                      (() => {
                        // 求人インテント: 部門別の最上位レベルを採用
                        const intentRows = DEAL_INTENTS[id] ?? []
                        const intentRank: Record<DealIntentRow['intentLevel'], number> = {
                          HOT: 3, MIDDLE: 2, LOW: 1, NONE: 0,
                        }
                        const topIntent = intentRows.reduce<DealIntentRow['intentLevel']>(
                          (acc, r) => (intentRank[r.intentLevel] > intentRank[acc] ? r.intentLevel : acc),
                          'NONE' as DealIntentRow['intentLevel'],
                        )
                        const totalSignals = intentRows.reduce((sum, r) => sum + r.signalCount, 0)
                        const intentStyle = topIntent === 'HOT'
                          ? { fg: 'var(--color-obs-hot)', bg: 'rgba(255,107,107,0.14)', label: 'HOT' }
                          : topIntent === 'MIDDLE'
                            ? { fg: 'var(--color-obs-middle)', bg: 'rgba(255,184,107,0.14)', label: 'MID' }
                            : topIntent === 'LOW'
                              ? { fg: 'var(--color-obs-low)', bg: 'rgba(126,198,255,0.14)', label: 'LOW' }
                              : { fg: 'var(--color-obs-text-subtle)', bg: 'rgba(109,106,111,0.14)', label: 'NONE' }

                        // ファーストパーティ情報
                        const fp = getCompanyFirstPartySignal(deal.company)
                        const fpStyle = fp === 'Hot'
                          ? { fg: 'var(--color-obs-hot)', bg: 'rgba(255,107,107,0.14)', label: '強' }
                          : fp === 'Middle'
                            ? { fg: 'var(--color-obs-middle)', bg: 'rgba(255,184,107,0.14)', label: '中' }
                            : fp === 'Low'
                              ? { fg: 'var(--color-obs-low)', bg: 'rgba(126,198,255,0.14)', label: '弱' }
                              : { fg: 'var(--color-obs-text-subtle)', bg: 'rgba(109,106,111,0.14)', label: '—' }

                        return (
                          <div className="flex flex-col gap-1.5 text-[11.5px]">
                            <div className="flex items-center gap-1.5">
                              <Users size={9} style={{ color: 'var(--color-obs-text-subtle)' }} className="shrink-0" />
                              <span className="w-12 shrink-0" style={{ color: 'var(--color-obs-text-subtle)' }}>従業員</span>
                              <span style={{ color: 'var(--color-obs-text)' }}>{linkedCompany.employees}</span>
                            </div>
                            <div className="flex items-start gap-1.5">
                              <MapPin size={9} style={{ color: 'var(--color-obs-text-subtle)' }} className="shrink-0 mt-0.5" />
                              <span className="w-12 shrink-0 mt-0.5" style={{ color: 'var(--color-obs-text-subtle)' }}>所在地</span>
                              <span className="leading-snug min-w-0 flex-1" style={{ color: 'var(--color-obs-text)' }}>{linkedCompany.address}</span>
                            </div>
                            <div className="flex items-center gap-1.5 min-w-0">
                              <Globe size={9} style={{ color: 'var(--color-obs-text-subtle)' }} className="shrink-0" />
                              <span className="w-12 shrink-0" style={{ color: 'var(--color-obs-text-subtle)' }}>Web</span>
                              <a
                                href={linkedCompany.websiteUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group inline-flex items-center gap-1 min-w-0 transition-colors hover:opacity-80"
                                style={{ color: 'var(--color-obs-primary)' }}
                              >
                                <span className="truncate min-w-0">{websiteHost}</span>
                                <ExternalLink size={9} className="shrink-0 opacity-70 group-hover:opacity-100 transition-opacity" />
                              </a>
                            </div>
                            {/* 求人インテント — クリックで企業詳細の求人インテントへ */}
                            <button
                              type="button"
                              onClick={() => router.push(`/companies/${deal.companyId}#intent`)}
                              className="group flex items-center gap-1.5 -mx-1 px-1 py-0.5 rounded-[6px] transition-colors text-left cursor-pointer hover:bg-[rgba(171,199,255,0.06)]"
                              title="企業の求人インテント詳細を開く"
                            >
                              <Zap size={9} style={{ color: 'var(--color-obs-text-subtle)' }} className="shrink-0" />
                              <span className="w-12 shrink-0" style={{ color: 'var(--color-obs-text-subtle)' }}>求人</span>
                              <span
                                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-[5px] text-[10px] font-bold"
                                style={{ background: intentStyle.bg, color: intentStyle.fg }}
                              >
                                {intentStyle.label}
                              </span>
                              {intentRows.length > 0 && (
                                <span
                                  className="underline decoration-dotted underline-offset-[3px] group-hover:decoration-solid transition-colors"
                                  style={{ color: 'var(--color-obs-primary)' }}
                                >
                                  {intentRows.length}部門·{totalSignals}件
                                </span>
                              )}
                              <ExternalLink
                                size={9}
                                className="ml-auto opacity-0 group-hover:opacity-80 transition-opacity shrink-0"
                                style={{ color: 'var(--color-obs-primary)' }}
                              />
                            </button>
                            {/* ファーストパーティ */}
                            <div className="flex items-center gap-1.5">
                              <Radio size={9} style={{ color: 'var(--color-obs-text-subtle)' }} className="shrink-0" />
                              <span className="w-12 shrink-0" style={{ color: 'var(--color-obs-text-subtle)' }}>1st</span>
                              <span
                                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-[5px] text-[10px] font-bold"
                                style={{ background: fpStyle.bg, color: fpStyle.fg }}
                              >
                                {fpStyle.label}
                              </span>
                              <span className="text-[10.5px]" style={{ color: 'var(--color-obs-text-muted)' }}>
                                {fp ? '接点あり' : '接点なし'}
                              </span>
                            </div>
                          </div>
                        )
                      })()
                    ) : (
                      <div
                        className="text-[11.5px]"
                        style={{ color: 'var(--color-obs-text-muted)' }}
                      >
                        企業詳細プロファイル未登録
                      </div>
                    )}
                  </div>

                  {/* 担当コンタクト */}
                  <div className="px-4 py-3.5">
                    <div className="flex items-center gap-1.5 mb-2.5">
                      <Users size={10} style={{ color: 'var(--color-obs-text-subtle)' }} />
                      <span
                        className="text-[10px] font-semibold tracking-[0.06em] uppercase"
                        style={{ color: 'var(--color-obs-text-subtle)' }}
                      >
                        担当コンタクト
                      </span>
                      {linkedContacts.length > 0 && (
                        <span
                          className="ml-auto inline-flex items-center justify-center min-w-[16px] h-[16px] px-1.5 rounded-full text-[9.5px] font-bold"
                          style={{
                            background: 'rgba(171,199,255,0.12)',
                            color: 'var(--color-obs-primary)',
                          }}
                        >
                          {linkedContacts.length}
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => router.push(`/contacts/${deal.contactId}`)}
                      className="group flex items-center gap-2 w-full text-left mb-2"
                    >
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-semibold shrink-0"
                        style={{
                          background:
                            'linear-gradient(135deg, var(--color-obs-primary) 0%, var(--color-obs-primary-container) 100%)',
                          color: 'var(--color-obs-on-primary)',
                        }}
                      >
                        {deal.contact[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1 flex-wrap">
                          <span
                            className="text-[12px] font-semibold tracking-[-0.01em] group-hover:text-[var(--color-obs-primary)] transition-colors truncate"
                            style={{ color: 'var(--color-obs-text)' }}
                          >
                            {deal.contact}
                          </span>
                          {primaryContact?.isDecisionMaker && (
                            <span
                              className="inline-flex items-center gap-0.5 px-1 py-0.5 rounded-[4px] text-[9px] font-semibold shrink-0"
                              style={{
                                background: 'rgba(255,184,107,0.16)',
                                color: 'var(--color-obs-middle)',
                              }}
                            >
                              <Star size={7} strokeWidth={2.5} />
                              決裁者
                            </span>
                          )}
                        </div>
                        {primaryContact?.title && (
                          <p
                            className="text-[10.5px] mt-0.5 truncate"
                            style={{ color: 'var(--color-obs-text-muted)' }}
                          >
                            {primaryContact.title}
                          </p>
                        )}
                      </div>
                      <ExternalLink
                        size={10}
                        className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                        style={{ color: 'var(--color-obs-primary)' }}
                      />
                    </button>

                    {deal.contactPhone && (
                      <div className="flex items-center gap-1.5 text-[11.5px] pl-9">
                        <Phone size={9} style={{ color: 'var(--color-obs-text-subtle)' }} className="shrink-0" />
                        <a
                          href={`tel:${deal.contactPhone}`}
                          className="tabular-nums hover:text-[var(--color-obs-primary)] transition-colors truncate"
                          style={{ color: 'var(--color-obs-text)' }}
                        >
                          {deal.contactPhone}
                        </a>
                      </div>
                    )}

                    {otherContacts.length > 0 && (
                      <div
                        className="mt-2.5 pt-2.5"
                        style={{ borderTop: '1px dashed rgba(109,106,111,0.18)' }}
                      >
                        <div
                          className="text-[9.5px] font-semibold tracking-[0.06em] uppercase mb-1.5"
                          style={{ color: 'var(--color-obs-text-subtle)' }}
                        >
                          その他のコンタクト
                        </div>
                        <div className="flex flex-col gap-0.5">
                          {otherContacts.map((contact) => (
                            <button
                              key={contact.id}
                              onClick={() => router.push(`/contacts/${contact.id}`)}
                              className="group flex items-center gap-2 px-1.5 py-1.5 rounded-[var(--radius-obs-md)] transition-colors hover:bg-[rgba(171,199,255,0.06)] text-left"
                            >
                              <div
                                className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-semibold shrink-0"
                                style={{
                                  background:
                                    'linear-gradient(135deg, var(--color-obs-primary) 0%, var(--color-obs-primary-container) 100%)',
                                  color: 'var(--color-obs-on-primary)',
                                }}
                              >
                                {contact.name[0]}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1 flex-wrap">
                                  <span
                                    className="text-[11.5px] font-medium tracking-[-0.01em] group-hover:text-[var(--color-obs-primary)] transition-colors truncate"
                                    style={{ color: 'var(--color-obs-text)' }}
                                  >
                                    {contact.name}
                                  </span>
                                  {contact.isDecisionMaker && (
                                    <span
                                      className="inline-flex items-center gap-0.5 px-1 py-0.5 rounded-[3px] text-[8.5px] font-semibold shrink-0"
                                      style={{
                                        background: 'rgba(255,184,107,0.16)',
                                        color: 'var(--color-obs-middle)',
                                      }}
                                    >
                                      <Star size={6} strokeWidth={2.5} />
                                      決裁者
                                    </span>
                                  )}
                                </div>
                                <p
                                  className="text-[10px] mt-0.5 truncate"
                                  style={{ color: 'var(--color-obs-text-muted)' }}
                                >
                                  {contact.title}
                                </p>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )
            })()}

          </aside>
        </div>

        {/* Task Modal */}
        <AnimatePresence>
          {taskModal !== null && (
            <DealTaskModal
              task={taskModal === 'new' ? null : taskModal}
              onClose={() => setTaskModal(null)}
              onSave={handleTaskSave}
            />
          )}
        </AnimatePresence>

        {/* Create Ticket Modal */}
        {showCreateTicket && (
          <CreateTicketModal
            presetDealId={id}
            presetDealLabel={`${deal.name}${deal.company ? ` — ${deal.company}` : ''}`}
            onClose={() => setShowCreateTicket(false)}
            onCreated={() => {
              setShowCreateTicket(false)
              reloadTickets()
            }}
          />
        )}

        {/* 提案編集モーダル */}
        {editingProposal && (
          <ProposalEditModal
            proposal={editingProposal}
            onClose={() => setEditingProposal(null)}
            onSave={(updated) => {
              setProposals((prev) => {
                const idx = prev.findIndex((p) => p.id === updated.id)
                if (idx >= 0) {
                  const next = [...prev]
                  next[idx] = updated
                  return next
                }
                return [...prev, updated]
              })
              setActiveProposalId(updated.id)
              setEditingProposal(null)
            }}
            onDelete={(proposalId) => {
              setProposals((prev) => {
                const next = prev.filter((p) => p.id !== proposalId)
                if (activeProposalId === proposalId) {
                  setActiveProposalId(next[0]?.id ?? null)
                }
                return next
              })
              setEditingProposal(null)
            }}
          />
        )}
      </div>
    </ObsPageShell>
  )
}

// ─── 提案編集モーダル ─────────────────────────────────────────────
function ProposalEditModal({
  proposal,
  onClose,
  onSave,
  onDelete,
}: {
  proposal: Proposal
  onClose: () => void
  onSave: (updated: Proposal) => void
  onDelete: (proposalId: string) => void
}) {
  const [draft, setDraft] = useState<Proposal>(() => ({
    ...proposal,
    customFields: [...proposal.customFields],
    attachments: [...proposal.attachments],
  }))

  function patch<K extends keyof Proposal>(key: K, value: Proposal[K]) {
    setDraft((prev) => ({ ...prev, [key]: value }))
  }

  function addCustomField() {
    setDraft((prev) => ({
      ...prev,
      customFields: [
        ...prev.customFields,
        { id: `cf-${Date.now()}`, label: '', value: '' },
      ],
    }))
  }
  function updateCustomField(id: string, patch: Partial<CustomField>) {
    setDraft((prev) => ({
      ...prev,
      customFields: prev.customFields.map((cf) =>
        cf.id === id ? { ...cf, ...patch } : cf,
      ),
    }))
  }
  function removeCustomField(id: string) {
    setDraft((prev) => ({
      ...prev,
      customFields: prev.customFields.filter((cf) => cf.id !== id),
    }))
  }

  function onFilesPicked(files: FileList | null) {
    if (!files || files.length === 0) return
    const newOnes: ProposalAttachment[] = Array.from(files).map((f) => ({
      id: `a-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name: f.name,
      type: guessAttachmentType(f.name),
      sizeKb: Math.max(1, Math.round(f.size / 1024)),
      uploadedAt: new Date().toISOString().slice(0, 10),
    }))
    setDraft((prev) => ({ ...prev, attachments: [...prev.attachments, ...newOnes] }))
  }
  function updateAttachment(id: string, patch: Partial<ProposalAttachment>) {
    setDraft((prev) => ({
      ...prev,
      attachments: prev.attachments.map((a) => (a.id === id ? { ...a, ...patch } : a)),
    }))
  }
  function removeAttachment(id: string) {
    setDraft((prev) => ({
      ...prev,
      attachments: prev.attachments.filter((a) => a.id !== id),
    }))
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 8 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-[560px] max-h-[88vh] rounded-[var(--radius-obs-xl)] overflow-hidden flex flex-col"
          style={{
            backgroundColor: 'var(--color-obs-surface-highest)',
            boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-5 py-3.5 shrink-0"
            style={{ boxShadow: 'inset 0 -1px 0 0 var(--color-obs-surface-low)' }}
          >
            <h2 className="text-[14px] font-bold inline-flex items-center gap-1.5" style={{ color: 'var(--color-obs-text)' }}>
              <Briefcase size={14} style={{ color: 'var(--color-obs-primary)' }} />
              提案内容を編集
            </h2>
            <button
              onClick={onClose}
              type="button"
              className="w-7 h-7 rounded-full flex items-center justify-center transition-colors hover:bg-[var(--color-obs-surface-high)]"
              style={{ color: 'var(--color-obs-text-muted)' }}
            >
              <X size={14} />
            </button>
          </div>

          {/* Body (scrollable) */}
          <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-4">
            {/* 提案名 */}
            <Field label="提案名">
              <input
                type="text"
                value={draft.name}
                onChange={(e) => patch('name', e.target.value)}
                placeholder="例: 本命プラン / A案"
                className="modal-input"
              />
            </Field>

            <Field label="提案サービス・プラン名">
              <input
                type="text"
                value={draft.service}
                onChange={(e) => patch('service', e.target.value)}
                placeholder="例: ルキスマCRM Pro / Slack連携アドオン"
                className="modal-input"
              />
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="提案金額（税抜）">
                <input
                  type="number"
                  min={0}
                  step={10000}
                  value={draft.amount}
                  onChange={(e) => patch('amount', Number(e.target.value) || 0)}
                  className="modal-input tabular-nums"
                />
              </Field>
              <Field label="課金サイクル">
                <select
                  value={draft.paymentCycle}
                  onChange={(e) => patch('paymentCycle', e.target.value as ProposalPaymentCycle)}
                  className="modal-input"
                >
                  {PAYMENT_CYCLE_OPTIONS.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field label="契約期間（ヶ月）">
                <input
                  type="number"
                  min={1}
                  value={draft.contractMonths}
                  onChange={(e) => patch('contractMonths', Math.max(1, Number(e.target.value) || 1))}
                  className="modal-input tabular-nums"
                />
              </Field>
              <Field label="ライセンス数">
                <input
                  type="number"
                  min={0}
                  value={draft.licenseCount ?? ''}
                  onChange={(e) => {
                    const v = e.target.value
                    patch('licenseCount', v === '' ? null : Number(v))
                  }}
                  placeholder="該当なし"
                  className="modal-input tabular-nums"
                />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field label="開始予定日">
                <input
                  type="date"
                  value={draft.startAt ?? ''}
                  onChange={(e) => patch('startAt', e.target.value || null)}
                  className="modal-input"
                />
              </Field>
              <Field label="初期費用">
                <input
                  type="number"
                  min={0}
                  step={10000}
                  value={draft.initialFee ?? ''}
                  onChange={(e) => {
                    const v = e.target.value
                    patch('initialFee', v === '' ? null : Number(v))
                  }}
                  placeholder="なし"
                  className="modal-input tabular-nums"
                />
              </Field>
            </div>

            <Field label="提案メモ">
              <textarea
                value={draft.notes}
                onChange={(e) => patch('notes', e.target.value)}
                rows={3}
                placeholder="補足・社内メモ"
                className="modal-input resize-y"
              />
            </Field>

            {/* カスタム項目 */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-semibold inline-flex items-center gap-1.5" style={{ color: 'var(--color-obs-text-muted)' }}>
                  <Sparkles size={11} style={{ color: 'var(--color-obs-primary)' }} />
                  カスタム項目
                  <span className="text-[10px]" style={{ color: 'var(--color-obs-text-subtle)' }}>
                    {draft.customFields.length}件
                  </span>
                </span>
                <button
                  type="button"
                  onClick={addCustomField}
                  className="inline-flex items-center gap-1 px-2 h-6 rounded-[6px] text-[10.5px] font-semibold transition-colors"
                  style={{
                    background: 'rgba(171,199,255,0.14)',
                    color: 'var(--color-obs-primary)',
                  }}
                >
                  <Plus size={10} strokeWidth={2.4} />
                  項目を追加
                </button>
              </div>
              {draft.customFields.length === 0 ? (
                <p className="text-[11px]" style={{ color: 'var(--color-obs-text-subtle)' }}>
                  サポート範囲・支払い条件など、自由に項目を追加できます
                </p>
              ) : (
                <div className="flex flex-col gap-2">
                  {draft.customFields.map((cf) => (
                    <div key={cf.id} className="flex items-start gap-2">
                      <input
                        type="text"
                        value={cf.label}
                        onChange={(e) => updateCustomField(cf.id, { label: e.target.value })}
                        placeholder="ラベル"
                        className="modal-input flex-[0_0_30%]"
                      />
                      <input
                        type="text"
                        value={cf.value}
                        onChange={(e) => updateCustomField(cf.id, { value: e.target.value })}
                        placeholder="値"
                        className="modal-input flex-1"
                      />
                      <button
                        type="button"
                        onClick={() => removeCustomField(cf.id)}
                        title="この項目を削除"
                        className="shrink-0 w-7 h-7 rounded-[6px] flex items-center justify-center transition-colors hover:bg-[rgba(255,107,107,0.10)]"
                        style={{ color: 'var(--color-obs-hot)' }}
                      >
                        <Trash2 size={11} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 添付ファイル */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-semibold inline-flex items-center gap-1.5" style={{ color: 'var(--color-obs-text-muted)' }}>
                  <FileText size={11} />
                  添付ファイル
                  <span className="text-[10px]" style={{ color: 'var(--color-obs-text-subtle)' }}>
                    {draft.attachments.length}件
                  </span>
                </span>
                <label
                  className="inline-flex items-center gap-1 px-2 h-6 rounded-[6px] text-[10.5px] font-semibold transition-colors cursor-pointer"
                  style={{
                    background: 'rgba(171,199,255,0.14)',
                    color: 'var(--color-obs-primary)',
                  }}
                  title="ファイルを選択してアップロード"
                >
                  <Upload size={10} strokeWidth={2.4} />
                  ファイルを追加
                  <input
                    type="file"
                    multiple
                    className="hidden"
                    onChange={(e) => {
                      onFilesPicked(e.target.files)
                      e.currentTarget.value = ''
                    }}
                  />
                </label>
              </div>
              {draft.attachments.length === 0 ? (
                <p className="text-[11px]" style={{ color: 'var(--color-obs-text-subtle)' }}>
                  契約書・NDA・見積書などをアップロードできます
                </p>
              ) : (
                <div className="flex flex-col gap-1.5">
                  {draft.attachments.map((a) => (
                    <div
                      key={a.id}
                      className="flex items-center gap-2 px-2 py-1.5 rounded-[var(--radius-obs-sm)]"
                      style={{ background: 'var(--color-obs-surface-low)' }}
                    >
                      <FileText size={11} style={{ color: 'var(--color-obs-text-muted)' }} className="shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-[11.5px] font-medium truncate" style={{ color: 'var(--color-obs-text)' }} title={a.name}>
                          {a.name}
                        </div>
                        <div className="text-[9.5px] tabular-nums" style={{ color: 'var(--color-obs-text-subtle)' }}>
                          {a.sizeKb >= 1024 ? `${(a.sizeKb / 1024).toFixed(1)}MB` : `${a.sizeKb}KB`} · {a.uploadedAt}
                        </div>
                      </div>
                      <select
                        value={a.type}
                        onChange={(e) => updateAttachment(a.id, { type: e.target.value as AttachmentType })}
                        className="modal-input !h-6 !py-0 !px-1.5 !text-[10.5px] !w-20 shrink-0"
                      >
                        {ATTACHMENT_TYPE_OPTIONS.map((t) => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => removeAttachment(a.id)}
                        title="この添付を削除"
                        className="shrink-0 w-6 h-6 rounded-[6px] flex items-center justify-center transition-colors hover:bg-[rgba(255,107,107,0.10)]"
                        style={{ color: 'var(--color-obs-hot)' }}
                      >
                        <Trash2 size={11} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div
            className="flex items-center gap-2 px-5 py-3 shrink-0"
            style={{ boxShadow: 'inset 0 1px 0 0 var(--color-obs-surface-low)' }}
          >
            <button
              type="button"
              onClick={() => {
                if (confirm(`「${draft.name || '無題の提案'}」を削除しますか?`)) {
                  onDelete(draft.id)
                }
              }}
              className="inline-flex items-center gap-1 h-8 px-2.5 rounded-[var(--radius-obs-md)] text-[11.5px] font-medium transition-colors hover:bg-[rgba(255,107,107,0.10)]"
              style={{ color: 'var(--color-obs-hot)' }}
            >
              <Trash2 size={11} />
              この提案を削除
            </button>
            <div className="flex-1" />
            <button
              type="button"
              onClick={onClose}
              className="h-8 px-3 rounded-[var(--radius-obs-md)] text-[12px] font-medium transition-colors hover:bg-[var(--color-obs-surface-high)]"
              style={{ color: 'var(--color-obs-text-muted)' }}
            >
              キャンセル
            </button>
            <button
              type="button"
              onClick={() => onSave(draft)}
              className="h-8 px-3 rounded-[var(--radius-obs-md)] text-[12px] font-semibold transition-colors"
              style={{
                background: 'var(--color-obs-primary)',
                color: 'var(--color-obs-on-primary)',
              }}
            >
              保存
            </button>
          </div>

          <style>{`
            .modal-input {
              width: 100%;
              height: 32px;
              padding: 0 10px;
              border-radius: var(--radius-obs-md);
              background: var(--color-obs-surface-low);
              color: var(--color-obs-text);
              font-size: 12.5px;
              border: 1px solid rgba(109, 106, 111, 0.18);
              outline: none;
              transition: border-color 0.15s, background-color 0.15s;
            }
            .modal-input:focus {
              border-color: var(--color-obs-primary);
              background: var(--color-obs-surface);
            }
            textarea.modal-input {
              height: auto;
              padding: 8px 10px;
              line-height: 1.55;
            }
            select.modal-input {
              cursor: pointer;
              appearance: none;
              padding-right: 24px;
              background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='%23999' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
              background-repeat: no-repeat;
              background-position: right 8px center;
            }
          `}</style>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[10.5px] font-semibold tracking-[0.05em] uppercase" style={{ color: 'var(--color-obs-text-subtle)' }}>
        {label}
      </span>
      {children}
    </label>
  )
}

function guessAttachmentType(filename: string): AttachmentType {
  const lower = filename.toLowerCase()
  if (lower.includes('nda')) return 'NDA'
  if (lower.includes('契約') || lower.includes('contract')) return '契約書'
  if (lower.includes('見積') || lower.includes('quote') || lower.includes('estimate')) return '見積書'
  if (lower.includes('提案') || lower.includes('proposal')) return '提案書'
  return 'その他'
}
