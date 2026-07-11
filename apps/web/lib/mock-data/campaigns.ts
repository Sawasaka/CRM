// メール配信キャンペーン (モック)
// 1 キャンペーン = 同じリストに対する N 回の送信ラウンドを束ねる
// 各ラウンドで件名・本文・リンクは変更可能。送信対象も「未クリック」「未返信」等でフィルタ可。

export type CampaignStatus = 'draft' | 'scheduled' | 'sending' | 'sent'

// リンク種別 - ユーザーが入力時に分類済みのため自動判別不要
export type LinkKind = 'homepage' | 'schedule' | 'doc' | 'other'

export interface CampaignLink {
  id: string                  // FDE CRM 中継URLに使う識別子
  kind: LinkKind
  label: string               // 本文上の表示テキスト
  originalUrl: string         // 実際の遷移先
  trackingUrl: string         // FDE CRM 中継URL: https://track.bgm.app/c/<id>
  clicks: number              // この回のクリック数
}

export interface SendRoundMetrics {
  replied: number             // この回の返信数
}

export type ResendFilterKind = 'all' | 'no_click' | 'no_reply'

export interface SendRound {
  round: number               // 1, 2, 3, ...
  sentAt: string              // YYYY-MM-DD HH:mm
  subject: string             // この回の件名
  body: string                // この回の本文
  recipients: number          // この回に送った件数
  filter: ResendFilterKind    // 送信対象 (1回目は all)
  links: CampaignLink[]       // この回に挿入したリンク群
  metrics: SendRoundMetrics
}

export interface MailCampaign {
  id: string
  name: string                // 配信名 (社内管理用 / シリーズ名)
  listId: string              // 紐づくISリストID
  listName: string            // 表示用キャッシュ
  totalRecipients: number     // シリーズ全体の母数 (= 1回目の宛先数)
  status: CampaignStatus
  createdAt: string
  sends: SendRound[]          // 送信履歴
}

// ─── ヘルパー ───────────────────────────────────────────────────────────

export function totalClicks(links: CampaignLink[]): number {
  return links.reduce((s, l) => s + l.clicks, 0)
}

export function clicksByKind(links: CampaignLink[]): Record<LinkKind, number> {
  const out: Record<LinkKind, number> = { homepage: 0, schedule: 0, doc: 0, other: 0 }
  for (const l of links) out[l.kind] += l.clicks
  return out
}

/** シリーズ全体のリンククリック累計 (全ラウンド合算) */
export function campaignTotalClicks(c: MailCampaign): number {
  return c.sends.reduce((s, r) => s + totalClicks(r.links), 0)
}

/** シリーズ全体の返信累計 */
export function campaignTotalReplies(c: MailCampaign): number {
  return c.sends.reduce((s, r) => s + r.metrics.replied, 0)
}

/** シリーズ全体のリンク種別ごとクリック累計 */
export function campaignClicksByKind(c: MailCampaign): Record<LinkKind, number> {
  const out: Record<LinkKind, number> = { homepage: 0, schedule: 0, doc: 0, other: 0 }
  for (const r of c.sends) {
    const k = clicksByKind(r.links)
    out.homepage += k.homepage
    out.schedule += k.schedule
    out.doc += k.doc
    out.other += k.other
  }
  return out
}

/** 最新ラウンドを取得 */
export function latestRound(c: MailCampaign): SendRound | undefined {
  return c.sends[c.sends.length - 1]
}

// ─── モックデータ ─────────────────────────────────────────────────────

const FILTER_LABEL: Record<ResendFilterKind, string> = {
  all: '全員',
  no_click: '前回未クリック',
  no_reply: '前回未返信',
}
export { FILTER_LABEL }

export const MOCK_CAMPAIGNS: MailCampaign[] = []

export const MOCK_CAMPAIGNS_BY_ID: Record<string, MailCampaign> = Object.fromEntries(
  MOCK_CAMPAIGNS.map((campaign) => [campaign.id, campaign]),
)

export const AVAILABLE_LISTS: { id: string; name: string; recipientCount: number }[] = []
