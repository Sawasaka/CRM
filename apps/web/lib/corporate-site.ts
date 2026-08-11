export type InternalLinkTarget = {
  kind: 'internal'
  href: `/${string}` | '/'
}

export type ExternalLinkTarget = {
  kind: 'external'
  href: `https://${string}`
}

export type LinkTarget = InternalLinkTarget | ExternalLinkTarget

export type CorporateNavigationItem = {
  label: string
  target: InternalLinkTarget
}

export type BusinessService = {
  id: 'koshikibase' | 'gtm' | 'marketing-infrastructure'
  number: string
  audience: 'SEO' | '顧客獲得' | 'リード獲得'
  title: string
  englishTitle?: string
  description: string
  target: LinkTarget
  cta: string
  pointsLabel?: string
  points: string[]
  strategy?: {
    label: string
    description: string
  }
  achievementLabel?: string
  achievements?: {
    metric: string
    title: string
    description?: string
    target?: ExternalLinkTarget
    cta?: string
  }[]
  highlight?: {
    eyebrow: string
    value: string
    label: string
    note: string
  }
}

export type HeroSlide = {
  id: 'baseball' | 'gtm' | 'marketing'
  eyebrow: string
  title: string
  description: string
  desktopImage: string
  mobileImage: string
  alt: string
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
  { label: '事業紹介', target: { kind: 'internal', href: '/#businesses' } },
  { label: 'GTM設計', target: { kind: 'internal', href: '/#gtm-download' } },
  {
    label: 'マーケティング基盤',
    target: { kind: 'internal', href: '/#marketing-download' },
  },
  { label: '会社概要', target: { kind: 'internal', href: '/#company' } },
]

export const heroSlides: HeroSlide[] = [
  {
    id: 'baseball',
    eyebrow: 'MEDIA / BASEBALL',
    title: '野球の挑戦に、確かな情報を。',
    description: '公式根拠と独自データを整え、選手・保護者・チームが次の一歩を選べる環境をつくります。',
    desktopImage: '/corporate-v2/hero-baseball-desktop.jpg',
    mobileImage: '/corporate-v2/hero-baseball-mobile.jpg',
    alt: '中学硬式野球の選手たちがグラウンドで守備練習に取り組む様子',
  },
  {
    id: 'gtm',
    eyebrow: 'GO-TO-MARKET',
    title: '売れる仕組みを、部門を越えて。',
    description: 'プロダクト、市場、営業、マーケティング、CSを、同じ顧客理解と判断基準でつなぎます。',
    desktopImage: '/corporate-v2/hero-gtm-desktop.jpg',
    mobileImage: '/corporate-v2/hero-gtm-mobile.jpg',
    alt: '会議室でGo-to-Market戦略を議論するビジネスチーム',
  },
  {
    id: 'marketing',
    eyebrow: 'MARKETING INFRASTRUCTURE',
    title: '集客を、学習し続ける基盤へ。',
    description: 'オウンドメディア、計測、広告実験を一つにつなぎ、結果を次の意思決定へ戻します。',
    desktopImage: '/corporate-v2/hero-marketing-desktop.jpg',
    mobileImage: '/corporate-v2/hero-marketing-mobile.jpg',
    alt: 'マーケティングの計測結果をモニターで確認するチーム',
  },
]

export const businessServices: BusinessService[] = [
  {
    id: 'koshikibase',
    number: '01',
    audience: 'SEO',
    title: 'コーシキベース',
    description:
      '公式情報を構造化した、中学硬式野球のデータベース型メディア。',
    target: { kind: 'external', href: 'https://koshikibase.jp' },
    cta: 'コーシキベースを見る',
    pointsLabel: 'SEO戦略',
    points: [
      '公式情報を構造化するデータベース設計',
      '地域・カテゴリ別の検索意図に沿うページ設計',
      '一次情報と独自のチームPRで、信頼性とオリジナリティを両立',
    ],
    highlight: {
      eyebrow: '公開14日以内 / SEOランキング',
      value: '5語',
      label: 'Google検索 1位を獲得',
      note: '参照元：SE Ranking / 2026.08.09時点',
    },
  },
  {
    id: 'gtm',
    number: '02',
    audience: '顧客獲得',
    title: 'Go-to-Market設計',
    description:
      'プロダクト、市場、営業、マーケティング、カスタマーサクセスを、ひとつの成長構造として設計します。',
    target: { kind: 'internal', href: '/#gtm-download' },
    cta: 'GTM設計を見る',
    achievementLabel: '主な役職・経験',
    achievements: [
      {
        metric: 'Sales Executive',
        title: '外資系企業の日本法人立ち上げ',
        description: '正社員1人目として、日本市場の事業設計とセキュリティ領域の営業を推進。',
      },
      {
        metric: '執行役員 CRO',
        title: 'プレシード期・ITスタートアップ',
        description: '正社員1人目・執行役員として、営業・マーケティング基盤を0→1で構築。',
      },
      {
        metric: 'マーケティング統括責任者',
        title: 'シード期・ITスタートアップ',
        description: 'シード期の成長に向け、マーケティング戦略と実行体制を設計。',
      },
    ],
    points: [],
    strategy: {
      label: '「Sales-led GTM × Wedgeモデル」',
      description: 'グロースシグナル獲得戦略',
    },
  },
  {
    id: 'marketing-infrastructure',
    number: '03',
    audience: 'リード獲得',
    title: 'マーケティング基盤設計',
    description:
      'オウンドメディアを主軸に、データ計測、広告実験、ベイズ統計、バンディット配分までを体系化します。',
    target: { kind: 'internal', href: '/#marketing-download' },
    cta: 'マーケティング基盤を見る',
    achievementLabel: '実績ハイライト',
    achievements: [
      {
        metric: '約6カ月で ARR 500万円',
        title: '外資系日本法人の事業開拓',
        description: 'セキュリティサービスの市場開拓から営業実行までを一貫して推進。',
      },
      {
        metric: '月間登録者 50名超',
        title: 'BtoCマーケティング',
        description: '登録上限に達する成長を、マーケティング施策によって牽引。',
      },
      {
        metric: '検索1位 5キーワード',
        title: 'オウンドメディアSEO',
        description: '競合・検索意図・データベース設計を一貫して実行。',
        target: { kind: 'external', href: 'https://koshikibase.jp/' },
        cta: 'コーシキベースを見る',
      },
    ],
    points: [],
    strategy: {
      label: '「ベイズ × バンディット戦略」',
      description: '施策ウェイト調整モデル',
    },
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
