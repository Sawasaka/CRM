// Gmail から個別メールを送信するためのヘルパー。
// 一斉送信時は呼び出し側が recipients をループし、本ヘルパーを 1 通ずつ呼び出す。
// To に 1 アドレスのみを入れることで、受信者間で他の宛先が見えないことを保証する。
import { getGoogleOAuthClient, getGmailClient } from './oauth'

export interface CampaignLinkSummary {
  kind: 'homepage' | 'schedule' | 'doc' | 'other'
  label: string
  trackingUrl: string
}

export interface SendMailInput {
  to: string                       // 単一の宛先メールアドレス
  subject: string
  body: string                     // プレーンテキスト or 軽量HTML
  fromName?: string                // 表示名 (例: '田中太郎 <BGM>')
  links?: CampaignLinkSummary[]    // 中継URLに置換済みのキャンペーンリンク (本文末尾に追記)
}

export interface DraftMailInput extends SendMailInput {
  /** プレビュー用のテスト宛先。下書きの To に入る */
  testRecipient?: string
}

/**
 * 入力本文を HTML エスケープ。
 */
function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

/**
 * プレーンテキストを HTML 化:
 *   - URL を自動リンク化
 *   - 改行を <br> に変換
 *   - <pre> ではなく white-space:pre-wrap で折り返し対応
 */
function bodyToHtml(text: string): string {
  const escaped = escapeHtml(text)
  // URL を <a> に置換 (HTML エスケープ後なのでクオート文字は &quot; だが URL には現れない想定)
  const urlPattern = /(https?:\/\/[^\s<]+)/g
  const linked = escaped.replace(urlPattern, (url) => `<a href="${url}" target="_blank" rel="noreferrer">${url}</a>`)
  // 改行を <br>
  return linked.replace(/\r?\n/g, '<br>\n')
}

/**
 * RFC2822 形式のメッセージを base64url にエンコード。
 * multipart/alternative で text/plain と text/html を併送し、
 * いずれのクライアントでも入力時の改行どおりに表示されることを保証する。
 */
function buildRawMessage({ to, from, subject, body }: { to: string; from: string; subject: string; body: string }): string {
  const utf8Subject = `=?utf-8?B?${Buffer.from(subject, 'utf-8').toString('base64')}?=`
  const boundary = `bgm-boundary-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`

  const plainPart = [
    `--${boundary}`,
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: 8bit',
    '',
    body,
    '',
  ].join('\r\n')

  // white-space: pre-wrap で連続空白・改行をそのまま反映 (HubSpot 等で起きる
  // "改行が消える" 問題を回避)
  const htmlBody =
    '<!DOCTYPE html><html><body style="font-family:-apple-system,BlinkMacSystemFont,\'Segoe UI\',Helvetica,Arial,sans-serif;font-size:14px;line-height:1.7;color:#1f2937;">' +
    `<div style="white-space:pre-wrap;word-break:break-word;">${bodyToHtml(body)}</div>` +
    '</body></html>'

  const htmlPart = [
    `--${boundary}`,
    'Content-Type: text/html; charset=UTF-8',
    'Content-Transfer-Encoding: 8bit',
    '',
    htmlBody,
    '',
  ].join('\r\n')

  const lines = [
    `From: ${from}`,
    `To: ${to}`,
    'MIME-Version: 1.0',
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    `Subject: ${utf8Subject}`,
    '',
    plainPart,
    htmlPart,
    `--${boundary}--`,
  ]
  return Buffer.from(lines.join('\r\n'), 'utf-8')
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

const KIND_LABEL: Record<CampaignLinkSummary['kind'], string> = {
  homepage: 'HP',
  schedule: '日程調整',
  doc: '資料',
  other: 'その他',
}

function appendCampaignLinks(body: string, links: CampaignLinkSummary[] | undefined): string {
  if (!links || links.length === 0) return body
  const lines = links.map((l) => `▶ [${KIND_LABEL[l.kind]}] ${l.label}: ${l.trackingUrl}`)
  const footer = ['', '──────────', ...lines].join('\n')
  return body + '\n' + footer
}

async function resolveSenderAddress(userId: string): Promise<string> {
  const auth = await getGoogleOAuthClient(userId)
  const gmail = getGmailClient(auth)
  const profile = await gmail.users.getProfile({ userId: 'me' })
  return profile.data.emailAddress ?? ''
}

/**
 * 1 通の個別送信。To には 1 アドレスのみが入るため、他受信者に宛先は見えない。
 * 一斉送信は呼び出し側で本関数をループする。
 */
export async function sendIndividualMail(userId: string, input: SendMailInput): Promise<{ id: string; threadId?: string }> {
  const auth = await getGoogleOAuthClient(userId)
  const gmail = getGmailClient(auth)

  const fromAddress = await resolveSenderAddress(userId)
  const fromHeader = input.fromName ? `${input.fromName} <${fromAddress}>` : fromAddress
  const finalBody = appendCampaignLinks(input.body, input.links)
  const raw = buildRawMessage({ to: input.to, from: fromHeader, subject: input.subject, body: finalBody })

  const res = await gmail.users.messages.send({
    userId: 'me',
    requestBody: { raw },
  })
  return { id: res.data.id ?? '', threadId: res.data.threadId ?? undefined }
}

/**
 * 下書きを作成して Gmail Web UI で開ける URL を返す。
 * ユーザーが Gmail UI で本文を最終確認するためのプレビュー用途。
 */
export async function createDraftMail(userId: string, input: DraftMailInput): Promise<{ id: string; webUrl: string }> {
  const auth = await getGoogleOAuthClient(userId)
  const gmail = getGmailClient(auth)

  const fromAddress = await resolveSenderAddress(userId)
  const fromHeader = input.fromName ? `${input.fromName} <${fromAddress}>` : fromAddress
  const finalBody = appendCampaignLinks(input.body, input.links)
  const to = input.testRecipient ?? fromAddress // 自分宛をデフォルト
  const raw = buildRawMessage({ to, from: fromHeader, subject: input.subject, body: finalBody })

  const res = await gmail.users.drafts.create({
    userId: 'me',
    requestBody: { message: { raw } },
  })

  const draftId = res.data.id ?? ''
  // Gmail Web UI のドラフト直リンク
  const webUrl = `https://mail.google.com/mail/u/0/#drafts?compose=${draftId}`
  return { id: draftId, webUrl }
}
