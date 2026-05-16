// ─── 共通CRM型定義 ────────────────────────────────────────────────────────────

// A = Hot（🔥）/ B = Middle（⭐）/ C = Low（💧）
export type Rank = 'A' | 'B' | 'C'

export type ApproachStatus =
  | '未着手'
  | '不通'
  | '不在'
  | '接続済み'
  | 'コール不可'
  | 'アポ獲得'
  | 'その他'

export type CallResultCode = ApproachStatus | 'Next Action'

// Legacy Tailwind class style (for light-theme components)
export const STATUS_STYLES: Record<CallResultCode, { bg: string; text: string; dot: string }> = {
  '未着手':      { bg: 'bg-[rgba(174,174,178,0.18)]', text: 'text-[#D8DCE6]', dot: 'bg-[#AEAEB2]' },
  '不通':        { bg: 'bg-[rgba(255,59,48,0.22)]',   text: 'text-[#FF8A82]', dot: 'bg-[#FF3B30]' },
  '不在':        { bg: 'bg-[rgba(255,159,10,0.22)]',  text: 'text-[#FFC266]', dot: 'bg-[#FF9F0A]' },
  '接続済み':    { bg: 'bg-[rgba(0,113,227,0.22)]',   text: 'text-[#7AB4FF]', dot: 'bg-[#0071E3]' },
  'コール不可':  { bg: 'bg-[rgba(255,59,48,0.22)]',   text: 'text-[#FF8A82]', dot: 'bg-[#FF3B30]' },
  'アポ獲得':    { bg: 'bg-[rgba(52,199,89,0.22)]',   text: 'text-[#7EE6A1]', dot: 'bg-[#34C759]' },
  'その他':      { bg: 'bg-[rgba(143,140,144,0.18)]', text: 'text-[#D8DCE6]', dot: 'bg-[#8F8C90]' },
  'Next Action': { bg: 'bg-[rgba(94,92,230,0.22)]',   text: 'text-[#A6A4FF]', dot: 'bg-[#5E5CE6]' },
}

// Game-style FF風 vibrant gradient + glow for dark theme badges
export interface StatusGameStyle {
  gradient: string
  glow: string
  color: string
  dotColor: string
  borderColor: string
  textShadow: string
}

export const STATUS_GAME_STYLES: Record<ApproachStatus, StatusGameStyle> = {
  '未着手': {
    gradient: 'linear-gradient(135deg, #E5E5EA 0%, #C7C7CC 35%, #AEAEB2 70%, #8E8E93 100%)',
    glow: '0 0 12px rgba(174,174,178,0.55), inset 0 1px 0 rgba(255,255,255,0.4)',
    color: '#2C2C2E',
    dotColor: '#48484A',
    borderColor: 'rgba(255,255,255,0.35)',
    textShadow: 'none',
  },
  '不通': {
    gradient: 'linear-gradient(135deg, #FFB347 0%, #FF6B35 35%, #FF3B30 70%, #CC1A00 100%)',
    glow: '0 0 14px rgba(255,59,48,0.85), 0 0 5px rgba(255,107,53,0.95), inset 0 1px 0 rgba(255,255,255,0.4)',
    color: '#FFFFFF',
    dotColor: '#FFE4D9',
    borderColor: 'rgba(255,255,255,0.3)',
    textShadow: '0 1px 2px rgba(120,0,0,0.6)',
  },
  '不在': {
    gradient: 'linear-gradient(135deg, #FFE5A8 0%, #FFCC66 30%, #FF9F0A 70%, #E07700 100%)',
    glow: '0 0 14px rgba(255,159,10,0.85), 0 0 5px rgba(255,204,102,0.95), inset 0 1px 0 rgba(255,255,255,0.5)',
    color: '#5B2E00',
    dotColor: '#FFFFFF',
    borderColor: 'rgba(255,255,255,0.4)',
    textShadow: 'none',
  },
  '接続済み': {
    gradient: 'linear-gradient(135deg, #7DD3FC 0%, #5AC8FA 35%, #32ADE6 70%, #0071E3 100%)',
    glow: '0 0 14px rgba(50,173,230,0.85), 0 0 5px rgba(125,211,252,0.95), inset 0 1px 0 rgba(255,255,255,0.4)',
    color: '#FFFFFF',
    dotColor: '#E0F4FF',
    borderColor: 'rgba(255,255,255,0.3)',
    textShadow: '0 1px 2px rgba(0,40,90,0.6)',
  },
  'コール不可': {
    gradient: 'linear-gradient(135deg, #6B6B70 0%, #48484A 35%, #2C2C2E 70%, #1C1C1E 100%)',
    glow: '0 0 12px rgba(255,59,48,0.45), inset 0 1px 0 rgba(255,255,255,0.2)',
    color: '#FF8A82',
    dotColor: '#FF3B30',
    borderColor: 'rgba(255,59,48,0.5)',
    textShadow: '0 0 6px rgba(255,59,48,0.7)',
  },
  'アポ獲得': {
    gradient: 'linear-gradient(135deg, #A7F3D0 0%, #6EE7B7 30%, #34C759 65%, #00874D 100%)',
    glow: '0 0 16px rgba(52,199,89,0.9), 0 0 5px rgba(167,243,208,0.95), inset 0 1px 0 rgba(255,255,255,0.4)',
    color: '#053D24',
    dotColor: '#FFFFFF',
    borderColor: 'rgba(255,255,255,0.4)',
    textShadow: 'none',
  },
  'その他': {
    gradient: 'linear-gradient(135deg, #E5E5EA 0%, #C7C7CC 35%, #AEAEB2 70%, #8E8E93 100%)',
    glow: '0 0 12px rgba(143,140,144,0.45), inset 0 1px 0 rgba(255,255,255,0.3)',
    color: '#2C2C2E',
    dotColor: '#48484A',
    borderColor: 'rgba(255,255,255,0.30)',
    textShadow: 'none',
  },
}

export type RankConfig = { gradient: string; glow: string; color: string }

// Hot(A) = 🔥 Fire red  /  Middle(B) = ⭐ Gold  /  Low(C) = 💧 Ocean blue
export const RANK_CONFIG: Record<Rank, RankConfig> = {
  A: {
    gradient: 'linear-gradient(135deg, #FFB347 0%, #FF6B35 35%, #FF3B30 70%, #CC1A00 100%)',
    glow: '0 0 14px rgba(255,75,40,0.85), 0 0 5px rgba(255,180,80,0.95), inset 0 1px 0 rgba(255,255,255,0.4)',
    color: '#fff',
  },
  B: {
    gradient: 'linear-gradient(135deg, #FFF080 0%, #FFE040 30%, #FFD60A 60%, #FF9F0A 100%)',
    glow: '0 0 14px rgba(255,214,10,0.85), 0 0 5px rgba(255,240,128,0.95), inset 0 1px 0 rgba(255,255,255,0.5)',
    color: '#7B2D00',
  },
  C: {
    gradient: 'linear-gradient(135deg, #7DD3FC 0%, #5AC8FA 35%, #32ADE6 70%, #0071E3 100%)',
    glow: '0 0 14px rgba(50,173,230,0.85), 0 0 5px rgba(125,211,252,0.95), inset 0 1px 0 rgba(255,255,255,0.4)',
    color: '#fff',
  },
}

// ─── コールリスト型定義 ──────────────────────────────────────────────────────

export interface CallList {
  id: string
  name: string
  description: string | null
  ownerName: string
  contactCount: number
  completedCount: number
  appointmentCount: number
  color: string
  createdAt: string
  updatedAt: string
}

export interface CallListItem {
  id: string
  listId: string
  contactId: string
  contactName: string
  contactTitle: string
  companyId: string
  companyName: string
  rank: Rank
  status: ApproachStatus
  callAttempts: number
  emailsSent: number
  lastCallAt: string | null
  nextActionAt: string | null
  priority: number
}

// ─── GA4連携型 ───────────────────────────────────────────────────────────────

export interface GA4PageData {
  path: string
  title: string
  pageViews: number
  uniqueUsers: number
  avgSessionDuration: number
  bounceRate: number
  conversions: number
}

export interface GA4DailyTraffic {
  date: string
  sessions: number
  users: number
  pageViews: number
  cvRate: number
}

export interface GA4SourceMedium {
  source: string
  medium: string
  sessions: number
  users: number
  cvRate: number
}

// ─── 資料トラッキング型 ─────────────────────────────────────────────────────

export type DocumentType = 'proposal' | 'service_intro' | 'case_study' | 'pricing' | 'other'

export interface TrackedDocument {
  id: string
  name: string
  type: DocumentType
  trackingUrl: string
  totalPages: number
  createdAt: string
  createdBy: string
  totalViews: number
  uniqueViewers: number
}

export interface DocumentViewEvent {
  id: string
  documentId: string
  viewedAt: string
  resolvedCompany: string | null
  companyId: string | null
  totalDurationSec: number
  pagesViewed: number
  maxScrollDepth: number
}

// ─── ISアクティビティ型 ─────────────────────────────────────────────────────

export interface ISRepActivity {
  repId: string
  repName: string
  color: string
  today: { calls: number; connected: number; appointments: number; emails: number }
  thisWeek: {
    calls: number; connected: number; appointments: number; emails: number
    emailOpenRate: number; emailReplyRate: number
  }
}

export type DashboardView = 'personal' | 'team'

// ─── 資料管理型（拡張）─────────────────────────────────────────────────────

export interface ManagedDocument extends TrackedDocument {
  fileSize: number
  mimeType: string
  isPublished: boolean
  password: string | null
  expiresAt: string | null
  tags: string[]
}

export interface DocumentShareLink {
  id: string
  documentId: string
  url: string
  contactId: string | null
  contactName: string | null
  companyName: string | null
  createdAt: string
  viewCount: number
  lastViewedAt: string | null
}

// ─── オートメーション型 ─────────────────────────────────────────────────────

export type SequenceStatus = 'active' | 'paused' | 'draft'
export type StepType = 'wait' | 'email' | 'condition' | 'task'

export interface SequenceStep {
  type: StepType
  label: string
  detail: string
}

export interface Sequence {
  id: string
  name: string
  description: string | null
  status: SequenceStatus
  triggerLabel: string
  steps: SequenceStep[]
  enrolledCount: number
  completedCount: number
  emailsSent: number
  openRate: number
  clickRate: number
  replyRate: number
  createdAt: string
  updatedAt: string
  createdBy?: string
}

export interface SequenceEnrollment {
  id: string
  sequenceId: string
  contactName: string
  companyName: string
  currentStepIndex: number
  status: 'active' | 'completed' | 'paused' | 'exited'
  enrolledAt: string
  lastActionAt: string | null
}
