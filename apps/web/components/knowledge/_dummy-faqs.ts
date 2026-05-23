// チームFAQ（自動生成ドキュメント）の UI プレビュー用ダミーデータ。
// 営業特化・議事録(Meet/Zoom)からの自動抽出を想定。
// API が空の間だけ画面に表示され、本物のデータが入ると自動で消える。

export type DummyFaqStatus = 'CANDIDATE' | 'PUBLISHED' | 'ARCHIVED' | 'REJECTED'
export type DummyFaqSourceType = 'MEETING' | 'MANUAL' | 'SLACK' | 'GOOGLE_CHAT' | 'DRIVE'

export interface DummyAttribution {
  questioner?: string
  responder?: string
  owner?: string
  // 議事録の場合
  meetingTitle?: string
  meetingDate?: string
}

export interface DummyFaq {
  id: string
  title: string
  body: string
  department: string | null // 大分類: 全件「営業」
  category: string | null   // 中分類: 営業フェーズ
  tags: string[]            // 小分類: トピック
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
  // ─── ヒアリング ───
  {
    id: 'dummy-faq-1',
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
      '- 初回は ①Who と ⑥When を必須でヒアリング',
      '- ②③④ は次回 MTG で深掘り',
    ].join('\n'),
    department: '営業',
    category: 'ヒアリング',
    tags: ['5W2H', '初回商談', '導入時期'],
    status: 'PUBLISHED',
    sourceType: 'MEETING',
    sourceUrl: 'https://meet.google.com/abc-defg-hij',
    attribution: {
      meetingTitle: '◯◯社 初回商談',
      meetingDate: '2026-04-25',
    },
    hits: 28,
    createdAt: days(10),
    updatedAt: hours(8),
  },
  {
    id: 'dummy-faq-2',
    title: 'BANT 情報を1回の商談で聞き切るには？',
    body: [
      '【順番】',
      '1. Budget: 予算（年間 / 案件）',
      '2. Authority: 決裁者と稟議ライン',
      '3. Need: 課題と優先度',
      '4. Timeline: 導入希望時期',
      '',
      '【コツ】',
      '- B/A は重いので、N/T を先に温めてから聞く',
      '- 「他社さんは平均●万円で〜」と比較話で出させる',
    ].join('\n'),
    department: '営業',
    category: 'ヒアリング',
    tags: ['BANT', '商談', '質問設計'],
    status: 'PUBLISHED',
    sourceType: 'MEETING',
    sourceUrl: 'https://meet.google.com/xyz-uvwx-rst',
    attribution: {
      meetingTitle: '△△社 商談（第2回）',
      meetingDate: '2026-04-28',
    },
    hits: 17,
    createdAt: days(7),
    updatedAt: hours(20),
  },

  // ─── 失注分析 ───
  {
    id: 'dummy-faq-3',
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
    sourceType: 'MEETING',
    sourceUrl: 'https://meet.google.com/dummy-loss-review',
    attribution: {
      meetingTitle: '失注レビューMTG (2026-Q1)',
      meetingDate: '2026-04-15',
    },
    hits: 22,
    createdAt: days(15),
    updatedAt: hours(20),
  },
  {
    id: 'dummy-faq-4',
    title: '競合製品と比較されたときの差別化ポイントは？',
    body: [
      '【主要競合】',
      '- ★★社: マーケ機能が強い → 営業特化の深さで勝負',
      '- ●●社: 安価 → ROI（自動化による工数削減）で逆転',
      '',
      '【共通アプローチ】',
      '- 「機能比較」ではなく「業務フロー比較」に話を持って行く',
      '- 当社の独自機能（Meet議事録の自動抽出）を必ずデモ',
    ].join('\n'),
    department: '営業',
    category: '失注分析',
    tags: ['競合', '差別化', 'デモ'],
    status: 'PUBLISHED',
    sourceType: 'MEETING',
    sourceUrl: 'https://meet.google.com/dummy-compete',
    attribution: {
      meetingTitle: '△△社 比較検討フェーズ',
      meetingDate: '2026-04-22',
    },
    hits: 14,
    createdAt: days(8),
    updatedAt: hours(36),
  },

  // ─── 商談オペレーション ───
  {
    id: 'dummy-faq-5',
    title: '商談で導入時期の合意を取るには？',
    body: [
      '【ステップ】',
      '1. 課題ヒアリング後すぐに「●月までに動かしたいですよね？」と仮置きする',
      '2. 顧客が「いや、●月は厳しい」と言ったら本音が出る',
      '3. その本音の時期から逆算してマイルストーンを置く',
      '',
      '【NG】「いつ頃ご検討ですか？」とオープンクエスチョンにすると引き伸ばされる',
    ].join('\n'),
    department: '営業',
    category: '商談クロージング',
    tags: ['導入時期', 'クロージング', '仮置き'],
    status: 'PUBLISHED',
    sourceType: 'MEETING',
    sourceUrl: 'https://meet.google.com/dummy-timeline',
    attribution: {
      meetingTitle: '××社 タイムライン合意MTG',
      meetingDate: '2026-04-30',
    },
    hits: 9,
    createdAt: days(5),
    updatedAt: hours(40),
  },
  {
    id: 'dummy-faq-6',
    title: '決裁者を初回商談から同席させるには？',
    body: [
      '【依頼の型】',
      '- 「45分の中で5分だけ、社長/CIO のご意見を伺いたい時間をいただけますか？」',
      '- 「●●様お一人だと判断が長くなりがちなので…」と短時間を強調',
      '',
      '【効果】',
      '- 決裁者同席ありの初回 → 受注率 22% → 41%（2026-Q1 実績）',
    ].join('\n'),
    department: '営業',
    category: '商談オペレーション',
    tags: ['決裁者同席', '初回商談', '受注率'],
    status: 'PUBLISHED',
    sourceType: 'MEETING',
    sourceUrl: 'https://meet.google.com/dummy-dm-attend',
    attribution: {
      meetingTitle: '営業会議 2026-04-26',
      meetingDate: '2026-04-26',
    },
    hits: 11,
    createdAt: days(11),
    updatedAt: days(2),
  },
  {
    id: 'dummy-faq-7',
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
    tags: ['コネクト率', '架電', '時間帯'],
    status: 'CANDIDATE',
    sourceType: 'MEETING',
    sourceUrl: 'https://meet.google.com/dummy-call-tactics',
    attribution: {
      meetingTitle: 'IS 振り返り会',
      meetingDate: '2026-05-02',
    },
    hits: 0,
    createdAt: hours(3),
    updatedAt: hours(3),
  },

  // ─── 価格交渉 ───
  {
    id: 'dummy-faq-8',
    title: '価格交渉で値引きを最小化するには？',
    body: [
      '【鉄則】',
      '- 値引きは「条件交換」のみ（複数年契約・他社紹介・事例公開など）',
      '- 提示価格は最初から「最終値」ではなく、譲歩余地を10〜15%残す',
      '',
      '【トーク例】',
      '「もし3年契約でご検討いただけるなら、年額の8%を還元できます」',
      '',
      '【NG】',
      '- 「いくらなら買いますか？」は即値下げに繋がる',
    ].join('\n'),
    department: '営業',
    category: '価格交渉',
    tags: ['値引き', '条件交換', '複数年契約'],
    status: 'PUBLISHED',
    sourceType: 'MEETING',
    sourceUrl: 'https://meet.google.com/dummy-pricing',
    attribution: {
      meetingTitle: '××社 見積もり交渉',
      meetingDate: '2026-04-29',
    },
    hits: 19,
    createdAt: days(6),
    updatedAt: hours(12),
  },

  // ─── トライアル/PoC ───
  {
    id: 'dummy-faq-9',
    title: '無料トライアル後の本契約率を上げるには？',
    body: [
      '【トライアル開始時】',
      '- 「成功の定義」を顧客と合意（KPI/期間/誰が使う）',
      '- 利用ガイド + 週次チェックインを必ずセット',
      '',
      '【トライアル中】',
      '- 2週目で「現時点の所感」を聞き、未活用機能をフォロー',
      '- データ蓄積を可視化し「離脱コスト」を作る',
      '',
      '【効果】本契約率 38% → 64%',
    ].join('\n'),
    department: '営業',
    category: 'トライアル',
    tags: ['PoC', 'トライアル', '本契約率'],
    status: 'PUBLISHED',
    sourceType: 'MEETING',
    sourceUrl: 'https://meet.google.com/dummy-poc-conversion',
    attribution: {
      meetingTitle: 'PoC 振り返り MTG',
      meetingDate: '2026-04-20',
    },
    hits: 13,
    createdAt: days(13),
    updatedAt: days(3),
  },

  // ─── 提案・稟議 ───
  {
    id: 'dummy-faq-10',
    title: '稟議を通しやすい提案書の構成は？',
    body: [
      '【4ブロック構成】',
      '1. 経営課題（決裁者の言葉で）',
      '2. 解決アプローチ（業務フロー図 + 当社の役割）',
      '3. 投資対効果（年間削減工数・粗利貢献）',
      '4. リスクと対策（導入失敗パターンの先回り）',
      '',
      '【Tips】',
      '- 1ページ目に結論サマリ（決裁者が最初に読む）',
      '- 数値は必ず「会話で出てきた金額」を使う（推測値はNG）',
    ].join('\n'),
    department: '営業',
    category: '提案・稟議',
    tags: ['提案書', '稟議', '決裁'],
    status: 'CANDIDATE',
    sourceType: 'MEETING',
    sourceUrl: 'https://meet.google.com/dummy-proposal',
    attribution: {
      meetingTitle: '提案書レビュー',
      meetingDate: '2026-05-01',
    },
    hits: 0,
    createdAt: hours(8),
    updatedAt: hours(8),
  },

  // ─── ヒアリング深掘り ───
  {
    id: 'dummy-faq-11',
    title: '「検討します」と言われた時の追撃の打ち方は？',
    body: [
      '【その場で】',
      '- 「具体的にはどの部分をご検討ですか？」と一段掘る',
      '- 「次回は●月●日でご一緒できますか？」と日付を仮置き',
      '',
      '【後追い（24時間以内）】',
      '- ヒアリングメモを Doc にまとめて共有',
      '- 「先ほどのお話を元に追加資料を作りました」と能動的に出す',
      '',
      '【NG】「ご検討よろしくお願いします」で終わる',
    ].join('\n'),
    department: '営業',
    category: 'ヒアリング',
    tags: ['追撃', '検討します', 'フォロー'],
    status: 'CANDIDATE',
    sourceType: 'MEETING',
    sourceUrl: 'https://meet.google.com/dummy-followup',
    attribution: {
      meetingTitle: '商談振り返り',
      meetingDate: '2026-04-27',
    },
    hits: 0,
    createdAt: hours(20),
    updatedAt: hours(20),
  },

  // ─── 旧運用（アーカイブ例） ───
  {
    id: 'dummy-faq-archived',
    title: '【旧】対面訪問でのアイスブレイクは？',
    body: [
      '対面訪問前提のアイスブレイクは廃止（コロナ以降オンラインが標準）。',
      '現在のオンライン商談ではアイスブレイクよりも、',
      '「事前ヒアリングシートに記入してもらう運用」を推奨。',
    ].join('\n'),
    department: '営業',
    category: 'ヒアリング',
    tags: ['旧運用', '対面'],
    status: 'ARCHIVED',
    sourceType: 'MEETING',
    sourceUrl: null,
    hits: 0,
    createdAt: days(120),
    updatedAt: days(90),
  },
]

export const DUMMY_FAQ_COUNTS = DUMMY_FAQS.reduce(
  (acc, f) => {
    acc[f.status] = (acc[f.status] ?? 0) + 1
    return acc
  },
  { CANDIDATE: 0, PUBLISHED: 0, ARCHIVED: 0, REJECTED: 0 } as Record<DummyFaqStatus, number>,
)
