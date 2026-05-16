// メール配信キャンペーン (モック)
// 1 キャンペーン = 同じリストに対する N 回の送信ラウンドを束ねる
// 各ラウンドで件名・本文・リンクは変更可能。送信対象も「未クリック」「未返信」等でフィルタ可。

export type CampaignStatus = 'draft' | 'scheduled' | 'sending' | 'sent'

// リンク種別 - ユーザーが入力時に分類済みのため自動判別不要
export type LinkKind = 'homepage' | 'schedule' | 'doc' | 'other'

export interface CampaignLink {
  id: string                  // BGM 中継URLに使う識別子
  kind: LinkKind
  label: string               // 本文上の表示テキスト
  originalUrl: string         // 実際の遷移先
  trackingUrl: string         // BGM 中継URL: https://track.bgm.app/c/<id>
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
    id: 'cmp-1',
    name: '4月度 サービス紹介シリーズ',
    listId: 'list-1',
    listName: '今週のコール対象',
    totalRecipients: 240,
    status: 'sent',
    createdAt: '2026-04-14',
    sends: [
      {
        round: 1,
        sentAt: '2026-04-15 10:00',
        subject: '【BGM】営業組織のパフォーマンスを一望できる新機能のご案内',
        body: 'いつもお世話になっております。\nBGMでは4月度より、メール配信から受注までを1画面で追える新機能をリリースしました。\nご興味あれば30分のお時間をいただけますと幸いです。',
        recipients: 240,
        filter: 'all',
        links: [
          { id: 'lnk-1-1-hp',  kind: 'homepage', label: 'BGM サービスサイト',     originalUrl: 'https://bgm.app/',                       trackingUrl: 'https://track.bgm.app/c/lnk-1-1-hp',  clicks: 14 },
          { id: 'lnk-1-1-sc',  kind: 'schedule', label: '30分の打合せをご予約',   originalUrl: 'https://timerex.net/s/sawasaka/30min',  trackingUrl: 'https://track.bgm.app/c/lnk-1-1-sc',  clicks: 12 },
          { id: 'lnk-1-1-d1',  kind: 'doc',      label: 'サービス紹介資料 v2.1',  originalUrl: 'https://track.bgm.app/d/abc123',         trackingUrl: 'https://track.bgm.app/c/lnk-1-1-d1',  clicks: 18 },
          { id: 'lnk-1-1-d2',  kind: 'doc',      label: '導入事例集 2026年版',    originalUrl: 'https://track.bgm.app/d/ghi789',         trackingUrl: 'https://track.bgm.app/c/lnk-1-1-d2',  clicks: 6  },
          { id: 'lnk-1-1-ot',  kind: 'other',    label: 'リリースノート',          originalUrl: 'https://bgm.app/blog/release-2026-04',  trackingUrl: 'https://track.bgm.app/c/lnk-1-1-ot',  clicks: 5  },
        ],
        metrics: { replied: 8 },
      },
      {
        round: 2,
        sentAt: '2026-04-22 10:00',
        subject: '【再送】営業組織のパフォーマンス可視化、改めてご案内します',
        body: '先週お送りしたご案内、お忙しい中届いていなければと思いまして再送いたします。\n3分で読める要点だけまとめましたので、ぜひご一読ください。',
        recipients: 185, // 1回目に未クリックの人へ
        filter: 'no_click',
        links: [
          { id: 'lnk-1-2-hp', kind: 'homepage', label: '3分でわかる BGM',         originalUrl: 'https://bgm.app/quick',                  trackingUrl: 'https://track.bgm.app/c/lnk-1-2-hp', clicks: 18 },
          { id: 'lnk-1-2-sc', kind: 'schedule', label: '15分のショートMTG',       originalUrl: 'https://timerex.net/s/sawasaka/15min',  trackingUrl: 'https://track.bgm.app/c/lnk-1-2-sc', clicks: 9  },
          { id: 'lnk-1-2-d1', kind: 'doc',      label: 'サービス紹介資料 v2.1',  originalUrl: 'https://track.bgm.app/d/abc123',         trackingUrl: 'https://track.bgm.app/c/lnk-1-2-d1', clicks: 11 },
        ],
        metrics: { replied: 4 },
      },
      {
        round: 3,
        sentAt: '2026-04-29 10:00',
        subject: '【最終ご案内】GW前にお話できる枠を確保しています',
        body: 'お忙しいところ恐れ入ります。\nGW前最後のご案内として、空き枠を確保してお待ちしております。',
        recipients: 158,
        filter: 'no_reply',
        links: [
          { id: 'lnk-1-3-sc', kind: 'schedule', label: 'GW前の空き枠を確認',     originalUrl: 'https://timerex.net/s/sawasaka/30min',   trackingUrl: 'https://track.bgm.app/c/lnk-1-3-sc', clicks: 14 },
          { id: 'lnk-1-3-d1', kind: 'doc',      label: '料金プラン比較表',        originalUrl: 'https://track.bgm.app/d/jkl012',         trackingUrl: 'https://track.bgm.app/c/lnk-1-3-d1', clicks: 7  },
        ],
        metrics: { replied: 3 },
      },
    ],
  },
  {
    id: 'cmp-2',
    name: 'コールド再活性化シリーズ',
    listId: 'list-2',
    listName: '再フォローリスト',
    totalRecipients: 1820,
    status: 'sent',
    createdAt: '2026-04-20',
    sends: [
      {
        round: 1,
        sentAt: '2026-04-22 09:00',
        subject: '半年ぶりのご連絡 — お役立ち事例集をお送りします',
        body: 'ご無沙汰しております。\n直近半年間、新規取引のなかったお客様にアップデート情報をお届けしています。',
        recipients: 1820,
        filter: 'all',
        links: [
          { id: 'lnk-2-1-hp', kind: 'homepage', label: '最新機能まとめ',           originalUrl: 'https://bgm.app/whats-new',                  trackingUrl: 'https://track.bgm.app/c/lnk-2-1-hp', clicks: 64 },
          { id: 'lnk-2-1-sc', kind: 'schedule', label: '近況キャッチアップMTG',     originalUrl: 'https://timerex.net/s/sawasaka/catchup',     trackingUrl: 'https://track.bgm.app/c/lnk-2-1-sc', clicks: 31 },
          { id: 'lnk-2-1-d1', kind: 'doc',      label: '事例集 2026年版',           originalUrl: 'https://track.bgm.app/d/ghi789',             trackingUrl: 'https://track.bgm.app/c/lnk-2-1-d1', clicks: 87 },
          { id: 'lnk-2-1-ot', kind: 'other',    label: 'お客様の声',                originalUrl: 'https://bgm.app/customer-voice',             trackingUrl: 'https://track.bgm.app/c/lnk-2-1-ot', clicks: 29 },
        ],
        metrics: { replied: 22 },
      },
    ],
  },
  {
    id: 'cmp-3',
    name: '失注リエンゲージメント',
    listId: 'list-3',
    listName: 'セミナー参加者リスト',
    totalRecipients: 156,
    status: 'sent',
    createdAt: '2026-04-26',
    sends: [
      {
        round: 1,
        sentAt: '2026-04-28 11:00',
        subject: '前回お見送りいただいた件 — アップデートのご連絡',
        body: '以前ご検討いただいた際は誠にありがとうございました。\nお見送り理由となった機能・価格について、4月のアップデートで大きく改善されています。',
        recipients: 156,
        filter: 'all',
        links: [
          { id: 'lnk-3-1-hp', kind: 'homepage', label: '料金プラン更新のお知らせ', originalUrl: 'https://bgm.app/pricing',                trackingUrl: 'https://track.bgm.app/c/lnk-3-1-hp', clicks: 5 },
          { id: 'lnk-3-1-sc', kind: 'schedule', label: '15分でアップデート説明',   originalUrl: 'https://timerex.net/s/sawasaka/15min',   trackingUrl: 'https://track.bgm.app/c/lnk-3-1-sc', clicks: 2 },
          { id: 'lnk-3-1-d1', kind: 'doc',      label: '提案書アップデート版',      originalUrl: 'https://track.bgm.app/d/def456',         trackingUrl: 'https://track.bgm.app/c/lnk-3-1-d1', clicks: 4 },
          { id: 'lnk-3-1-d2', kind: 'doc',      label: '料金プラン比較表',          originalUrl: 'https://track.bgm.app/d/jkl012',         trackingUrl: 'https://track.bgm.app/c/lnk-3-1-d2', clicks: 3 },
          { id: 'lnk-3-1-ot', kind: 'other',    label: 'リリースノート',            originalUrl: 'https://bgm.app/blog/release-2026-04',    trackingUrl: 'https://track.bgm.app/c/lnk-3-1-ot', clicks: 2 },
        ],
        metrics: { replied: 3 },
      },
    ],
  },
  {
    id: 'cmp-4',
    name: '比較検討フォロー',
    listId: 'list-4',
    listName: 'Aランク未着手',
    totalRecipients: 420,
    status: 'sent',
    createdAt: '2026-04-30',
    sends: [
      {
        round: 1,
        sentAt: '2026-05-01 14:00',
        subject: '他社比較資料 — BGMが選ばれている3つの理由',
        body: '貴社のご検討を後押しできればと思い、競合比較資料を作成しました。',
        recipients: 420,
        filter: 'all',
        links: [
          { id: 'lnk-4-1-hp', kind: 'homepage', label: '比較検討特設ページ',     originalUrl: 'https://bgm.app/compare',                trackingUrl: 'https://track.bgm.app/c/lnk-4-1-hp', clicks: 22 },
          { id: 'lnk-4-1-sc', kind: 'schedule', label: '具体検討の打合せ',       originalUrl: 'https://timerex.net/s/sawasaka/30min',   trackingUrl: 'https://track.bgm.app/c/lnk-4-1-sc', clicks: 24 },
          { id: 'lnk-4-1-d1', kind: 'doc',      label: '料金プラン比較表',        originalUrl: 'https://track.bgm.app/d/jkl012',         trackingUrl: 'https://track.bgm.app/c/lnk-4-1-d1', clicks: 38 },
          { id: 'lnk-4-1-ot', kind: 'other',    label: 'お客様の声',              originalUrl: 'https://bgm.app/customer-voice',         trackingUrl: 'https://track.bgm.app/c/lnk-4-1-ot', clicks: 6  },
        ],
        metrics: { replied: 17 },
      },
      {
        round: 2,
        sentAt: '2026-05-05 14:00',
        subject: '【再送】比較検討の参考資料、改めてご共有します',
        body: '先日お送りした比較資料、重要箇所を抜粋してお送りいたします。',
        recipients: 332, // 未返信者
        filter: 'no_reply',
        links: [
          { id: 'lnk-4-2-d1', kind: 'doc', label: '比較ハイライト版', originalUrl: 'https://track.bgm.app/d/jkl012-hl', trackingUrl: 'https://track.bgm.app/c/lnk-4-2-d1', clicks: 41 },
          { id: 'lnk-4-2-sc', kind: 'schedule', label: '具体検討の打合せ',       originalUrl: 'https://timerex.net/s/sawasaka/30min',   trackingUrl: 'https://track.bgm.app/c/lnk-4-2-sc', clicks: 19 },
        ],
        metrics: { replied: 11 },
      },
    ],
  },
]

export const MOCK_CAMPAIGNS_BY_ID: Record<string, MailCampaign> = Object.fromEntries(
  MOCK_CAMPAIGNS.map((c) => [c.id, c]),
)

export const AVAILABLE_LISTS: { id: string; name: string; recipientCount: number }[] = [
  { id: 'list-1', name: '今週のコール対象',     recipientCount: 240 },
  { id: 'list-2', name: '再フォローリスト',      recipientCount: 1820 },
  { id: 'list-3', name: 'セミナー参加者リスト',  recipientCount: 156 },
  { id: 'list-4', name: 'Aランク未着手',         recipientCount: 420 },
]
