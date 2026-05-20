// チームFAQ（自動生成ドキュメント）の UI プレビュー用ダミーデータ。
// API が空の間だけ画面に表示され、本物のデータが入ると自動で消える。
// 本番DBに入れる場合は scripts/seed-knowledge.ts を使う。

export type DummyFaqStatus = 'CANDIDATE' | 'PUBLISHED' | 'ARCHIVED' | 'REJECTED'
export type DummyFaqSourceType = 'MANUAL' | 'SLACK' | 'GOOGLE_CHAT' | 'DRIVE'

export interface DummyAttribution {
  // Slack/Google Chat の場合
  questioner?: string // 質問者名
  responder?: string // 回答者名
  // Drive の場合
  owner?: string // ファイル所有者・最終更新者
}

export interface DummyFaq {
  id: string
  title: string
  body: string
  department: string | null // 大分類
  category: string | null   // 中分類
  tags: string[]            // 小分類: サブカテゴリ (複数可)
  status: DummyFaqStatus
  sourceType: DummyFaqSourceType
  sourceUrl: string | null
  attribution?: DummyAttribution
  hits: number
  createdAt: Date
  updatedAt: Date
}

const now = Date.now()
const hours = (h: number) => new Date(now - h * 60 * 60 * 1000)
const days = (d: number) => new Date(now - d * 24 * 60 * 60 * 1000)

export const DUMMY_FAQS: DummyFaq[] = [
  // ─── 営業 ───────────────────────────────────────────
  {
    id: 'dummy-faq-sl-1',
    title: '初回商談で必ず聞くべきヒアリング項目は？（5W2H＋導入時期）',
    body: [
      '【必須項目（5W2H＋導入時期）】',
      '- Who: 意思決定者・利用者',
      '- What: 解決したい課題',
      '- Why now: なぜ今動くのか',
      '- How much: 想定予算',
      '- How: 現状の運用',
      '- When: 導入希望時期',
      '',
      '【運用ルール】',
      '- 初回は ① Who と ⑥ When を必須でヒアリング',
      '- ②③④ は次回 MTG で深掘り',
    ].join('\n'),
    department: '営業',
    category: 'ヒアリング',
    tags: ['5W2H', '初回商談', '導入時期'],
    status: 'PUBLISHED',
    sourceType: 'SLACK',
    sourceUrl: 'https://example.slack.com/archives/C0127/p1234567895',
    attribution: { questioner: '田中 美和', responder: '澤坂 寛之' },
    hits: 28,
    createdAt: days(10),
    updatedAt: hours(8),
  },
  {
    id: 'dummy-faq-sl-2',
    title: '失注理由トップ3とそれぞれの切り返しトークは？',
    body: [
      '【失注理由 → 切り返し】',
      '1. 他システムと連携できない',
      '   → REST API / Zapier テンプレ集を提示',
      '2. 現場が変えたがらない',
      '   → 段階導入 + ベテラン2名先行のパイロット',
      '3. 価格が高い',
      '   → ROI 表（費用対効果）を提示',
    ].join('\n'),
    department: '営業',
    category: '失注分析',
    tags: ['失注理由', '切り返し', 'ROI'],
    status: 'PUBLISHED',
    sourceType: 'SLACK',
    sourceUrl: 'https://example.slack.com/archives/C0128/p1234567896',
    attribution: { questioner: '佐藤 健太', responder: '田中 美和' },
    hits: 19,
    createdAt: days(7),
    updatedAt: hours(20),
  },
  {
    id: 'dummy-faq-sl-3',
    title: '営業日報はいつまでに提出すればいい？',
    body: [
      '- 提出期限: 当日 19:00 まで',
      '- 提出先: Salesforce の活動オブジェクト / または Google Form',
      '- レビュー: 翌朝、マネージャーが実施',
    ].join('\n'),
    department: '営業',
    category: 'オペレーション',
    tags: ['日報', '提出'],
    status: 'PUBLISHED',
    sourceType: 'SLACK',
    sourceUrl: 'https://example.slack.com/archives/C0126/p1234567893',
    attribution: { questioner: '伊藤 拓海', responder: '澤坂 寛之' },
    hits: 5,
    createdAt: days(5),
    updatedAt: days(1),
  },
  {
    id: 'dummy-faq-sl-4',
    title: 'コール一発目でコネクト率を上げるには何を聞けばいい？',
    body: [
      '【繋がりやすい時間帯】',
      '- 朝イチ: 9:00 - 9:30',
      '- 夕方: 17:00 - 18:30',
      '',
      '【一発目に聞くこと】',
      '「●●様、5分でも10分でも構いません」を毎回必ず聞く',
      '',
      '【効果】コネクト率 28% → 41%',
    ].join('\n'),
    department: '営業',
    category: 'コール',
    tags: ['コネクト率', 'BANT'],
    status: 'CANDIDATE',
    sourceType: 'SLACK',
    sourceUrl: 'https://example.slack.com/archives/C0129/p1234567897',
    attribution: { questioner: '中村 美月', responder: '田中 美和' },
    hits: 0,
    createdAt: hours(3),
    updatedAt: hours(3),
  },

  // ─── 人事 ───────────────────────────────────────────
  {
    id: 'dummy-faq-hr-1',
    title: '健康診断はどう予約すればいい？',
    body: [
      '- 予約サイト: e健康診断ナビ (https://e-kenko.example.com)',
      '- ログイン: 社員番号 + Okta SSO',
      '- 実施期間: 5/15 〜 7/31',
      '- 予約後、人事から承認メールが届く',
    ].join('\n'),
    department: '人事',
    category: '健診',
    tags: ['健康診断', '予約', 'Okta'],
    status: 'PUBLISHED',
    sourceType: 'SLACK',
    sourceUrl: 'https://example.slack.com/archives/C0123/p1234567890',
    attribution: { questioner: '小林 直樹', responder: '人事 田村' },
    hits: 6,
    createdAt: days(3),
    updatedAt: hours(10),
  },
  {
    id: 'dummy-faq-hr-2',
    title: '育休復帰後の人事面談はいつ行われる？',
    body: [
      '- 直属マネージャー面談: 復帰後3週間以内',
      '- 人事面談: 復帰後4週間以内',
      '- 招待: HR Bot から自動でカレンダー招待',
      '- 招待が届かない場合: @人事 にメンション',
      '',
      '※ 2026年4月改定',
    ].join('\n'),
    department: '人事',
    category: '面談',
    tags: ['育休', '復帰', '面談スケジュール'],
    status: 'PUBLISHED',
    sourceType: 'GOOGLE_CHAT',
    sourceUrl: 'https://chat.google.com/room/dummy-hr',
    attribution: { questioner: '高橋 美穂', responder: '人事 田村' },
    hits: 3,
    createdAt: days(20),
    updatedAt: days(4),
  },

  // ─── 経理 ───────────────────────────────────────────
  {
    id: 'dummy-faq-ke-1',
    title: '請求書はいつ発行される？',
    body: [
      '- 締め: 月末締め',
      '- 発行: 翌月5営業日以内',
      '- 発行担当: 経理部 高橋（@takahashi）',
      '- 発行希望日指定: 前月20日までに #legal-q で申請',
      '- 保存先: Drive 「経理 / 請求書 / YYYYMM」フォルダに自動保存',
    ].join('\n'),
    department: '経理',
    category: '業務フロー',
    tags: ['請求書', '発行タイミング'],
    status: 'PUBLISHED',
    sourceType: 'DRIVE',
    sourceUrl: 'https://drive.google.com/file/d/dummy-keiri-rules',
    attribution: { owner: '経理部 / 高橋' },
    hits: 14,
    createdAt: days(12),
    updatedAt: hours(6),
  },
  {
    id: 'dummy-faq-ke-2',
    title: '出張時の宿泊費は1泊いくらまで？',
    body: [
      '【国内】',
      '- 通常: 15,000円 / 泊',
      '- 東京・大阪: 18,000円 / 泊',
      '',
      '【海外】',
      '- 通常: 25,000円 / 泊',
      '- NY / LA / London: 35,000円 / 泊',
      '',
      '【特例】',
      '- 深夜便の前後泊は事前申請で50%まで超過可',
      '',
      '※ 経理規程 Article 8.3',
    ].join('\n'),
    department: '経理',
    category: '規程',
    tags: ['経費精算', '出張', '宿泊費'],
    status: 'PUBLISHED',
    sourceType: 'DRIVE',
    sourceUrl: 'https://drive.google.com/file/d/dummy-keihi',
    attribution: { owner: '経理部 / 高橋' },
    hits: 22,
    createdAt: days(8),
    updatedAt: hours(2),
  },

  // ─── 法務 ───────────────────────────────────────────
  {
    id: 'dummy-faq-lg-1',
    title: '契約書の押印フロー（電子と紙）はどうなっている？',
    body: [
      '【電子契約（取引金額 500万円以下）】',
      '- クラウドサインで締結可能',
      '',
      '【紙押印（取引金額 500万円超）】',
      '1. 法務レビュー',
      '2. 代表印申請',
      '3. 押印 → スキャン保管',
      '',
      '【テンプレ】Drive 「法務 / 標準契約 / 2026」配下',
    ].join('\n'),
    department: '法務',
    category: '契約',
    tags: ['押印', '電子契約', 'クラウドサイン'],
    status: 'PUBLISHED',
    sourceType: 'DRIVE',
    sourceUrl: 'https://drive.google.com/file/d/dummy-legal-flow',
    attribution: { owner: '法務部 / 佐藤' },
    hits: 8,
    createdAt: days(15),
    updatedAt: days(2),
  },
  {
    id: 'dummy-faq-lg-2',
    title: '業務委託の発注書テンプレはどこにある？',
    body: [
      '- 保存先: Drive「法務 / 標準契約 / 業務委託」',
      '- 最新版: `発注書_業務委託_v2.docx`',
      '- 記入後: #legal-q でレビュー依頼',
      '- 500万円以下なら電子締結可能',
    ].join('\n'),
    department: '法務',
    category: '契約',
    tags: ['業務委託', '発注書', 'テンプレ'],
    status: 'CANDIDATE',
    sourceType: 'SLACK',
    sourceUrl: 'https://example.slack.com/archives/C0124/p1234567894',
    attribution: { questioner: '中村 美月', responder: '法務部 / 佐藤' },
    hits: 0,
    createdAt: hours(4),
    updatedAt: hours(4),
  },
  {
    id: 'dummy-faq-lg-3',
    title: '【旧】押印申請書の紙運用は今も使える？',
    body: [
      '- 紙の押印申請書フローは 2024年に廃止済み',
      '- すべて クラウドサイン に移行',
      '- 旧フローは使用しないこと',
    ].join('\n'),
    department: '法務',
    category: '契約',
    tags: ['押印', '旧フロー'],
    status: 'ARCHIVED',
    sourceType: 'MANUAL',
    sourceUrl: null,
    hits: 0,
    createdAt: days(60),
    updatedAt: days(45),
  },

  // ─── IT ───────────────────────────────────────────
  {
    id: 'dummy-faq-it-1',
    title: '社外からSalesforceにアクセスするVPN接続手順は？',
    body: [
      '【接続手順】',
      '1. Cisco AnyConnect を起動',
      '2. 接続先: vpn.bgm.example.com',
      '3. Okta SSO で認証',
      '',
      '【初回のみ】IT に MFA 登録を依頼',
      '【参考】Drive 「IT / VPN設定手順」',
    ].join('\n'),
    department: 'IT',
    category: 'ネットワーク',
    tags: ['VPN', 'Okta', 'Salesforce'],
    status: 'PUBLISHED',
    sourceType: 'SLACK',
    sourceUrl: 'https://example.slack.com/archives/C0123/p1234567890',
    attribution: { questioner: '渡辺 翔太', responder: 'IT 桑原' },
    hits: 11,
    createdAt: days(5),
    updatedAt: hours(20),
  },
  {
    id: 'dummy-faq-it-2',
    title: 'Slack連携のトークンはどう更新する？',
    body: [
      '【手順】',
      '1. Slack Workspace 管理画面 → App 管理',
      '2. 該当 Bot を選択',
      '3. 「Reissue Token」で再発行',
      '',
      '【再発行後】',
      '- Drive `/IT/secrets/slack-tokens.txt` を更新',
      '- 対象システムを再起動',
    ].join('\n'),
    department: 'IT',
    category: 'Slack運用',
    tags: ['Slack', 'トークン', '再発行'],
    status: 'CANDIDATE',
    sourceType: 'GOOGLE_CHAT',
    sourceUrl: 'https://chat.google.com/room/dummy-it-helpdesk',
    attribution: { questioner: '田中 翔', responder: 'IT 桑原' },
    hits: 0,
    createdAt: hours(8),
    updatedAt: hours(8),
  },

  // ─── プロダクト ───────────────────────────────────────
  {
    id: 'dummy-faq-pd-1',
    title: 'Salesforceとの同期が失敗したらどう対応する？',
    body: [
      '【まず試す】',
      'ルキスマCRM 設定 → 連携設定 → Salesforce → 「再認証」',
      '',
      '【復旧しない場合】',
      '- @プロダクト 桑原（@kuwabara）にメンション',
      '- 直近1時間の sync ログ: Datadog `bgm-sync-errors` ダッシュボード',
    ].join('\n'),
    department: 'プロダクト',
    category: 'インテグレーション',
    tags: ['Salesforce', '同期エラー', 'Datadog'],
    status: 'CANDIDATE',
    sourceType: 'SLACK',
    sourceUrl: 'https://example.slack.com/archives/C0125/p1234567892',
    attribution: { questioner: '林 大輔', responder: 'プロダクト 桑原' },
    hits: 0,
    createdAt: hours(2),
    updatedAt: hours(2),
  },
]

export const DUMMY_FAQ_COUNTS = DUMMY_FAQS.reduce(
  (acc, f) => {
    acc[f.status] = (acc[f.status] ?? 0) + 1
    return acc
  },
  { CANDIDATE: 0, PUBLISHED: 0, ARCHIVED: 0, REJECTED: 0 } as Record<DummyFaqStatus, number>,
)
