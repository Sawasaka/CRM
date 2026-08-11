export type CorporateNavigationItem = {
  label: string
  href: string
}

export type BusinessService = {
  id: 'koshikibase' | 'gtm' | 'marketing-infrastructure'
  number: string
  audience: 'MEDIA' | 'BtoB'
  title: string
  englishTitle: string
  description: string
  href: string
  external: boolean
  cta: string
  points: string[]
}

export type ServicePhase = {
  number: string
  title: string
  description: string
}

export type ProofMetric = {
  value: string
  label: string
  note?: string
}

export const corporateNavigation: CorporateNavigationItem[] = [
  { label: '事業紹介', href: '/#businesses' },
  { label: 'GTM設計', href: '/services/gtm' },
  { label: 'マーケティング基盤', href: '/services/marketing-infrastructure' },
  { label: '代表プロフィール', href: '/hiroki-sawasaka' },
  { label: '会社概要', href: '/company' },
]

export const businessServices: BusinessService[] = [
  {
    id: 'koshikibase',
    number: '01',
    audience: 'MEDIA',
    title: 'コーシキベース',
    englishTitle: 'KOSHIKI BASE',
    description:
      '中学硬式野球のチーム情報を、公式根拠に基づいて検索・比較できるデータ型メディアです。',
    href: 'https://koshikibase.jp',
    external: true,
    cta: 'コーシキベースを見る',
    points: ['全国1,484チーム', '主要5リーグ・47都道府県', '公式情報を根拠に整備'],
  },
  {
    id: 'gtm',
    number: '02',
    audience: 'BtoB',
    title: 'Go-to-Market設計',
    englishTitle: 'GTM DESIGN',
    description:
      'プロダクト、市場、営業、マーケティング、カスタマーサクセスを、ひとつの成長構造として設計します。',
    href: '/services/gtm',
    external: false,
    cta: 'GTM設計を見る',
    points: ['市場・ICP・ポジショニング', '営業・マーケ・CSの接続', '90日実行ロードマップ'],
  },
  {
    id: 'marketing-infrastructure',
    number: '03',
    audience: 'BtoB',
    title: 'マーケティング基盤設計',
    englishTitle: 'MARKETING INFRASTRUCTURE',
    description:
      'オウンドメディアを主軸に、データ計測、広告実験、ベイズ統計、バンディット配分までを体系化します。',
    href: '/services/marketing-infrastructure',
    external: false,
    cta: 'マーケティング基盤を見る',
    points: ['競合・検索意図から設計', '流入から受注まで計測', 'ベイズ・バンディットで学習'],
  },
]

export const gtmPhases: ServicePhase[] = [
  {
    number: '01',
    title: '市場・競合・顧客理解',
    description: '市場構造、競合、ICP、購買関与者、顧客が解決したい課題を整理します。',
  },
  {
    number: '02',
    title: 'ポジショニング',
    description: '誰に、何を、なぜ自社から買うのか。選ばれる理由を言語化します。',
  },
  {
    number: '03',
    title: 'プロダクト・サービス設計',
    description: '提供範囲、パッケージ、価格仮説、導入条件を顧客課題に接続します。',
  },
  {
    number: '04',
    title: 'マーケティング戦略',
    description: 'オウンドメディア、広告、紹介、アウトバウンドなどの獲得導線を設計します。',
  },
  {
    number: '05',
    title: '営業プロセス',
    description: 'リード判定、商談、提案、受注までのステージと判断基準を統一します。',
  },
  {
    number: '06',
    title: 'カスタマーサクセス',
    description: '導入、定着、成果確認、継続、アップセルまでの成功条件を整えます。',
  },
  {
    number: '07',
    title: '学習・改善',
    description: '顧客の声、失注理由、利用データをプロダクトと次の戦略へ戻します。',
  },
]

export const gtmDeliverables = [
  'GTM Blueprint',
  'ICP・ターゲットアカウント定義',
  'ポジショニング・訴求仮説',
  'ファネル・KPI設計',
  'CRMステージ・営業プロセス',
  '営業プレイブック',
  'CS引き継ぎ・成功条件',
  '90日実行ロードマップ',
] as const

export const ownedMediaPhases: ServicePhase[] = [
  {
    number: '01',
    title: '事業目標の定義',
    description: '顧客、商品、コンバージョン、受注までの必要条件を定義します。',
  },
  {
    number: '02',
    title: '競合・検索機会調査',
    description: 'SERP、キーワード、検索意図、競合の独自価値から優先領域を見つけます。',
  },
  {
    number: '03',
    title: '構造・データ設計',
    description: 'URL、情報設計、データ構造、ページ生成条件を一つの仕組みにします。',
  },
  {
    number: '04',
    title: 'ページ・導線設計',
    description: '検索意図別のページ、独自データ、内部リンク、比較・問い合わせ導線を整えます。',
  },
  {
    number: '05',
    title: '計測基盤',
    description: 'Search Console、GA4、Google Tag Manager、UTM、CRM IDを接続します。',
  },
  {
    number: '06',
    title: '改善サイクル',
    description: '順位、流入、公式サイト送客、商談、受注を見ながら次の優先度を更新します。',
  },
]

export const advertisingPhases: ServicePhase[] = [
  {
    number: '01',
    title: '仮説を分ける',
    description: '訴求、クリエイティブ、LP、ターゲットを比較できる単位に分けます。',
  },
  {
    number: '02',
    title: '固定配分で探索する',
    description: '初期は偏りを避け、判断に使える比較データを蓄積します。',
  },
  {
    number: '03',
    title: 'ベイズ統計で更新する',
    description: 'データが増えるたびに、商談・受注に至る成功確率を更新します。',
  },
  {
    number: '04',
    title: 'バンディットで配分する',
    description: '探索枠と損失上限を残し、期待値が高い施策へ段階的に予算を寄せます。',
  },
  {
    number: '05',
    title: '売上へ戻す',
    description: 'クリックやCVで終わらせず、商談、受注、粗利を次の配分判断へ戻します。',
  },
]

export const marketingDeliverables = [
  '競合・検索機会調査',
  'オウンドメディア構造設計',
  'キーワード・ページ対応表',
  '計測・イベント・UTM設計',
  'CRM接続設計',
  '広告実験バックログ',
  'ベイズ判断ルール',
  'バンディット配分ルール',
  '月次学習レポート',
] as const

export const koshikibaseMetrics: ProofMetric[] = [
  { value: '1,484', label: '全国の掲載対象チーム' },
  { value: '5 / 47', label: '主要リーグ / 都道府県' },
  { value: '200', label: '定点観測キーワード' },
  { value: '33', label: 'Top 10キーワード', note: '2026年7月31日 / SE Ranking' },
  { value: '92', label: 'サイト健全性スコア', note: '2026年7月31日 / SE Ranking' },
]

export const referenceSummaries = [
  {
    number: '01',
    title: '対話から信頼関係をつくる',
    description: '相手の状況を整理し、部門や立場を越えて合意形成を進める姿勢が評価されています。',
  },
  {
    number: '02',
    title: '未整備の環境を0→1で立ち上げる',
    description: '正解や仕組みがない段階から、優先順位と実行手順を組み立てる推進力が評価されています。',
  },
  {
    number: '03',
    title: '責任を引き受け、経営視点で進める',
    description: '部分最適で終わらせず、事業全体の成果を考えて意思決定する姿勢が評価されています。',
  },
] as const

export const founderTimeline = [
  {
    period: 'BASEBALL 01',
    title: '厳しい環境で、基準を上げる',
    description:
      '本人が「刑務所と呼ばれるほど」と振り返る亜細亜大学の厳しい環境で、日々の練習とチーム競争に向き合いました。',
  },
  {
    period: 'BASEBALL 02',
    title: 'パナマとオーストラリアへ',
    description:
      '海外のプロ野球環境に飛び込み、言語も文化も異なる現場で26歳まで野球を続けました。',
  },
  {
    period: 'TURNING POINT',
    title: '脊椎の複雑骨折と引退',
    description:
      'オーストラリアで脊椎を複雑骨折。リハビリを経て、26歳で野球人生に区切りをつけました。',
  },
  {
    period: 'RESTART',
    title: '学び直し、エンジニアへ',
    description:
      'TOEIC 910点を取得し、リハビリを続けながらフリーランスエンジニアとして開発経験を積みました。',
  },
  {
    period: 'BUSINESS',
    title: '事業を、端から端まで経験する',
    description:
      'プロダクト開発、サービス開発、組織設計、営業、マーケティング、カスタマーサクセスまで、売上が生まれる工程を実務で経験しました。',
  },
  {
    period: 'NOW',
    title: '現場の粘り強さを、再現できる仕組みへ',
    description:
      '野球で培った継続力と現場感覚に、データと仕組み化を掛け合わせ、事業が学習し続けられる状態をつくっています。',
  },
] as const

export const businessExperience = [
  'プロダクト開発',
  'サービス開発',
  '組織設計',
  '営業戦略',
  'マーケティング戦略',
  '営業',
  'カスタマーサクセス',
] as const
