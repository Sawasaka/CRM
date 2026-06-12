// メール配信キャンペーン (モック)
// 1 キャンペーン = 同じリストに対する N 回の送信ラウンドを束ねる
// 各ラウンドで件名・本文・リンクは変更可能。送信対象も「未クリック」「未返信」等でフィルタ可。

export type CampaignStatus = 'draft' | 'scheduled' | 'sending' | 'sent'

// リンク種別 - ユーザーが入力時に分類済みのため自動判別不要
export type LinkKind = 'homepage' | 'schedule' | 'doc' | 'other'

export interface CampaignLink {
  id: string                  // ルキスマCRM 中継URLに使う識別子
  kind: LinkKind
  label: string               // 本文上の表示テキスト
  originalUrl: string         // 実際の遷移先
  trackingUrl: string         // ルキスマCRM 中継URL: https://track.bgm.app/c/<id>
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

export const MOCK_CAMPAIGNS: MailCampaign[] = [
  {
    id: 'demo-campaign-1',
    name: 'HOT企業向け 部署番号活用提案',
    listId: 'demo-list-hot-enterprise',
    listName: 'HOT企業_今週架電',
    totalRecipients: 84,
    status: 'sent',
    createdAt: '2026-06-01',
    sends: [
      {
        round: 1,
        sentAt: '2026-06-03 09:30',
        subject: '採用インテントが出ている部署へ、直接アプローチしませんか',
        body: '求人インテントと部署直通番号を組み合わせ、今動いている部門へ優先接触する提案です。',
        recipients: 84,
        filter: 'all',
        metrics: { replied: 5 },
        links: [
          {
            id: 'demo-link-1-schedule',
            kind: 'schedule',
            label: '15分相談の日程調整',
            originalUrl: 'https://calendar.example.com/demo',
            trackingUrl: 'https://track.rookiesmart-jp.com/c/demo-link-1-schedule',
            clicks: 12,
          },
          {
            id: 'demo-link-1-doc',
            kind: 'doc',
            label: '部署番号DBの活用資料',
            originalUrl: 'https://crm.rookiesmart-jp.com/demo/doc/department-phone',
            trackingUrl: 'https://track.rookiesmart-jp.com/c/demo-link-1-doc',
            clicks: 21,
          },
          {
            id: 'demo-link-1-home',
            kind: 'homepage',
            label: 'サービスサイト',
            originalUrl: 'https://crm.rookiesmart-jp.com',
            trackingUrl: 'https://track.rookiesmart-jp.com/c/demo-link-1-home',
            clicks: 18,
          },
        ],
      },
      {
        round: 2,
        sentAt: '2026-06-06 10:00',
        subject: '資料をご覧いただいた企業様へ、優先リストのサンプルをお送りします',
        body: '前回資料をクリックいただいた企業様向けに、部門別の優先接触リスト例をご案内しています。',
        recipients: 43,
        filter: 'no_reply',
        metrics: { replied: 4 },
        links: [
          {
            id: 'demo-link-2-schedule',
            kind: 'schedule',
            label: 'デモ相談を予約',
            originalUrl: 'https://calendar.example.com/demo',
            trackingUrl: 'https://track.rookiesmart-jp.com/c/demo-link-2-schedule',
            clicks: 9,
          },
          {
            id: 'demo-link-2-doc',
            kind: 'doc',
            label: 'HOT企業リストサンプル',
            originalUrl: 'https://crm.rookiesmart-jp.com/demo/doc/hot-list',
            trackingUrl: 'https://track.rookiesmart-jp.com/c/demo-link-2-doc',
            clicks: 16,
          },
        ],
      },
    ],
  },
  {
    id: 'demo-campaign-2',
    name: '採用予算あり企業 フォロー配信',
    listId: 'demo-list-hr-budget',
    listName: '採用予算あり_人事部門',
    totalRecipients: 128,
    status: 'scheduled',
    createdAt: '2026-06-05',
    sends: [
      {
        round: 1,
        sentAt: '2026-06-07 08:45',
        subject: '採用予算が動くタイミングで、優先企業を絞り込みませんか',
        body: '採用予算・求人インテント・部署情報をもとに、IS対象企業を自動で絞り込みます。',
        recipients: 128,
        filter: 'all',
        metrics: { replied: 7 },
        links: [
          {
            id: 'demo-link-3-doc',
            kind: 'doc',
            label: '採用予算ダッシュボード例',
            originalUrl: 'https://crm.rookiesmart-jp.com/demo/doc/budget',
            trackingUrl: 'https://track.rookiesmart-jp.com/c/demo-link-3-doc',
            clicks: 29,
          },
          {
            id: 'demo-link-3-schedule',
            kind: 'schedule',
            label: '相談する',
            originalUrl: 'https://calendar.example.com/demo',
            trackingUrl: 'https://track.rookiesmart-jp.com/c/demo-link-3-schedule',
            clicks: 14,
          },
        ],
      },
    ],
  },
]

export const MOCK_CAMPAIGNS_BY_ID: Record<string, MailCampaign> = Object.fromEntries(
  MOCK_CAMPAIGNS.map((campaign) => [campaign.id, campaign]),
)

export const AVAILABLE_LISTS: { id: string; name: string; recipientCount: number }[] = [
  { id: 'list-1', name: '今週のコール対象',     recipientCount: 240 },
  { id: 'list-2', name: '再フォローリスト',      recipientCount: 1820 },
  { id: 'list-3', name: 'セミナー参加者リスト',  recipientCount: 156 },
  { id: 'list-4', name: 'Aランク未着手',         recipientCount: 420 },
]
