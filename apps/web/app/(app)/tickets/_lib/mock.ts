import type { TicketDetail, TicketListItem } from '../_types'

// 一覧UI確認用のダミーデータ
// 実データが0件のときにフォールバック表示する
export const MOCK_TICKETS: TicketListItem[] = [
  {
    id: 'mock-1',
    ticketNumber: 12,
    subject: 'ログインできない、SSO連携が切れた可能性',
    status: 'OPEN',
    createdAt: '2026-05-04T09:12:00.000Z',
    updatedAt: '2026-05-04T09:12:00.000Z',
    resolvedAt: null,
    estimatedCompletionAt: '2026-05-05T15:00:00.000Z',
    deal: { id: 'd1', name: 'BGM導入(初年度)' },
    company: { id: 'c1', name: '株式会社テクノリード' },
    assignee: { id: 'u1', name: '田中 太郎' },
  },
  {
    id: 'mock-2',
    ticketNumber: 11,
    subject: '請求書の宛名変更依頼',
    status: 'OPEN',
    createdAt: '2026-05-04T03:30:00.000Z',
    updatedAt: '2026-05-04T08:01:00.000Z',
    resolvedAt: null,
    estimatedCompletionAt: null,
    deal: { id: 'd4', name: 'グロース社 ABM拡張' },
    company: { id: 'c4', name: '株式会社グロース' },
    assignee: { id: 'u3', name: '佐藤 次郎' },
  },
  {
    id: 'mock-3',
    ticketNumber: 10,
    subject: '機能要望: Slack通知のチャンネル別出し分け',
    status: 'PENDING',
    createdAt: '2026-05-02T14:55:00.000Z',
    updatedAt: '2026-05-03T18:20:00.000Z',
    resolvedAt: null,
    estimatedCompletionAt: '2026-05-12T18:00:00.000Z',
    deal: { id: 'd3', name: 'フューチャー社 全社展開' },
    company: { id: 'c2', name: '合同会社フューチャー' },
    assignee: { id: 'u2', name: '鈴木 花子' },
  },
  {
    id: 'mock-4',
    ticketNumber: 9,
    subject: 'CSV取込でエンコードエラー(SJIS)',
    status: 'PENDING',
    createdAt: '2026-05-01T10:10:00.000Z',
    updatedAt: '2026-05-03T11:40:00.000Z',
    resolvedAt: null,
    estimatedCompletionAt: '2026-05-07T18:00:00.000Z',
    deal: { id: 'd2', name: 'デルタ社 IS立ち上げ支援' },
    company: { id: 'c3', name: '株式会社デルタ' },
    assignee: { id: 'u1', name: '田中 太郎' },
  },
  {
    id: 'mock-5',
    ticketNumber: 8,
    subject: 'ダッシュボードの数値が翌日反映される件',
    status: 'PENDING',
    createdAt: '2026-04-30T16:45:00.000Z',
    updatedAt: '2026-05-02T09:15:00.000Z',
    resolvedAt: null,
    estimatedCompletionAt: '2026-05-11T18:00:00.000Z',
    deal: { id: 'd1', name: 'BGM導入(初年度)' },
    company: { id: 'c1', name: '株式会社テクノリード' },
    assignee: { id: 'u1', name: '田中 太郎' },
  },
  {
    id: 'mock-6',
    ticketNumber: 7,
    subject: 'ユーザー追加方法の問い合わせ',
    status: 'SOLVED',
    createdAt: '2026-04-28T11:00:00.000Z',
    updatedAt: '2026-04-29T13:25:00.000Z',
    resolvedAt: '2026-04-29T13:25:00.000Z',
    estimatedCompletionAt: null,
    deal: { id: 'd5', name: 'イノベーション社 PoC' },
    company: { id: 'c5', name: '株式会社イノベーション' },
    assignee: { id: 'u2', name: '鈴木 花子' },
  },
  {
    id: 'mock-7',
    ticketNumber: 6,
    subject: '議事録AIの精度に関するフィードバック',
    status: 'SOLVED',
    createdAt: '2026-04-25T09:30:00.000Z',
    updatedAt: '2026-04-26T17:55:00.000Z',
    resolvedAt: '2026-04-26T17:55:00.000Z',
    estimatedCompletionAt: null,
    deal: { id: 'd3', name: 'フューチャー社 全社展開' },
    company: { id: 'c2', name: '合同会社フューチャー' },
    assignee: { id: 'u3', name: '佐藤 次郎' },
  },
  {
    id: 'mock-8',
    ticketNumber: 5,
    subject: '解約後のデータエクスポート手順',
    status: 'CLOSED',
    createdAt: '2026-04-20T15:20:00.000Z',
    updatedAt: '2026-04-22T10:10:00.000Z',
    resolvedAt: '2026-04-22T10:10:00.000Z',
    estimatedCompletionAt: null,
    deal: { id: 'd6', name: 'ネクスト社 (失注)' },
    company: { id: 'c6', name: '株式会社ネクスト' },
    assignee: { id: 'u1', name: '田中 太郎' },
  },
]

// 詳細ページ用ダミー: 一覧の各IDに対応する完全な情報
type DetailExtra = Partial<
  Pick<
    TicketDetail,
    'description' | 'cause' | 'resolution' | 'memo' | 'closedAt' | 'contact' | 'estimatedCompletionAt'
  >
>

const DETAIL_EXTRAS: Record<string, DetailExtra> = {
  'mock-1': {
    description:
      '昨日の夕方からSSO経由のログインが失敗するようになった。エラーメッセージは「IdPからの応答が無効」と表示される。社内SSO(Okta)の管理画面では特に変更履歴なし。',
    cause: null,
    resolution: '初動: ログイン経路の特定とIdP/SP双方のメタデータ検証を本日中に実施予定。',
    memo: '社内SSO担当の山田さんに連絡済み。本日17時に折り返しの予定。',
    closedAt: null,
    contact: { id: 'co1', name: '田中 誠' },
    estimatedCompletionAt: '2026-05-05T15:00:00.000Z',
  },
  'mock-2': {
    description:
      '次回(5月)の請求書から、宛名を「株式会社グロース 経理部」に変更してほしいとの依頼。発行済みの請求書はそのままでよい。',
    cause: null,
    resolution: '管理画面の請求設定 → 宛名フィールドを更新。次回サイクルで反映されることを確認後、お客様に完了連絡。',
    closedAt: null,
    contact: { id: 'co4', name: '中村 理恵' },
    estimatedCompletionAt: null,
  },
  'mock-3': {
    description:
      'Slack通知を「営業」「カスタマーサクセス」のチャンネル別に振り分けたい。現状は1チャンネルにすべて流れていて見落としが発生している。',
    cause: '通知設定がワークスペース単位でしか設定できない既存仕様',
    resolution: 'ロードマップに追加検討。短期回避策として、通知タイプ別フィルタの設定方法を案内。',
    closedAt: null,
    contact: { id: 'co2', name: '山本 佳子' },
    estimatedCompletionAt: '2026-05-12T18:00:00.000Z',
  },
  'mock-4': {
    description:
      '取引先リストCSVを取り込もうとすると「文字化け」が発生。ファイルはSJISで保存されているらしい。',
    cause: 'CSVインポート処理がUTF-8のみ対応で、SJISの自動判定が無いため',
    resolution: '当面の回避策: UTF-8で再保存してアップロードしていただく手順を案内。中期: SJIS自動判定を実装予定。',
    closedAt: null,
    contact: null,
    estimatedCompletionAt: '2026-05-07T18:00:00.000Z',
  },
  'mock-5': {
    description:
      'KPIダッシュボードの「商談実施数」が当日の活動を反映せず、翌朝に更新される。リアルタイム反映できないか?',
    cause: '集計バッチが毎晩02:00にまとめて実行される設計',
    resolution: '高速集計版の実装を検討中。短期: ダッシュボード上に「最終更新時刻」を表示する改修で誤解を防止。',
    closedAt: null,
    contact: { id: 'co1', name: '田中 誠' },
    estimatedCompletionAt: '2026-05-11T18:00:00.000Z',
  },
  'mock-6': {
    description: '新メンバー(3名)を追加したいが、招待リンクの発行方法が分からない。',
    cause: '管理画面のヘルプリンクが古いままだった',
    resolution: '正しい手順をメールで案内。ヘルプ記事も更新済み。',
    closedAt: null,
    contact: { id: 'co3', name: '佐々木 拓也' },
    estimatedCompletionAt: null,
  },
  'mock-7': {
    description:
      'Google Meet議事録のAI抽出で、価格に関するキーワードを取りこぼすケースが散見されるとのフィードバック。',
    cause: 'プロンプトに価格表現の網羅例が不足していた',
    resolution: 'プロンプト改善 + テストケース追加でリリース。改善後の精度を確認いただき、解決済み。',
    closedAt: null,
    contact: { id: 'co2', name: '山本 佳子' },
    estimatedCompletionAt: null,
  },
  'mock-8': {
    description: '契約終了後、データを自社にエクスポートしたい。CSVで全データ取得できるか?',
    cause: null,
    resolution: 'CSVエクスポート機能(取引・コンタクト・活動ログ)の手順をお送りし、完了。アカウントクローズ済み。',
    closedAt: '2026-04-22T10:10:00.000Z',
    contact: null,
    estimatedCompletionAt: null,
  },
}

export function getMockTicketDetail(id: string): TicketDetail | null {
  const list = MOCK_TICKETS.find((t) => t.id === id)
  if (!list) return null
  const extra = DETAIL_EXTRAS[id]
  return {
    id: list.id,
    ticketNumber: list.ticketNumber,
    subject: list.subject,
    status: list.status,
    createdAt: list.createdAt,
    updatedAt: list.updatedAt,
    resolvedAt: list.resolvedAt,
    closedAt: extra?.closedAt ?? null,
    estimatedCompletionAt: extra?.estimatedCompletionAt ?? null,
    description: extra?.description ?? null,
    cause: extra?.cause ?? null,
    resolution: extra?.resolution ?? null,
    memo: extra?.memo ?? null,
    deal: list.deal,
    company: list.company,
    contact: extra?.contact ?? null,
    assignee: list.assignee,
  }
}

// 詳細ページの担当者selectで使うダミーUser一覧
export const MOCK_ORG_USERS = [
  { id: 'u1', name: '田中 太郎', email: 'tanaka@example.com', role: 'REP' as const },
  { id: 'u2', name: '鈴木 花子', email: 'suzuki@example.com', role: 'REP' as const },
  { id: 'u3', name: '佐藤 次郎', email: 'sato@example.com', role: 'REP' as const },
  { id: 'u4', name: '開発 太郎', email: 'kaihatsu@example.com', role: 'ADMIN' as const },
  { id: 'eng1', name: '中村 拓海', email: 'nakamura@example.com', role: 'REP' as const },
  { id: 'eng2', name: '渡辺 翔太', email: 'watanabe@example.com', role: 'REP' as const },
]
