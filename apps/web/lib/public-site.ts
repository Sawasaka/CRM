const PUBLIC_SITE_FALLBACK_URL = 'https://www.rookiesmart-jp.com'

function normalizeUrl(value: string | undefined) {
  if (!value) return undefined
  const withProtocol = value.startsWith('http') ? value : `https://${value}`
  return withProtocol.replace(/\/+$/, '')
}

function isLocalUrl(value: string | undefined) {
  return !value || /localhost|127\.0\.0\.1|0\.0\.0\.0/.test(value)
}

export const publicSiteUrl =
  normalizeUrl(!isLocalUrl(process.env.NEXT_PUBLIC_SITE_URL) ? process.env.NEXT_PUBLIC_SITE_URL : undefined) ??
  normalizeUrl(!isLocalUrl(process.env.SITE_URL) ? process.env.SITE_URL : undefined) ??
  PUBLIC_SITE_FALLBACK_URL

export const companyName = '株式会社ルーキースマートジャパン'
export const serviceName = 'FDE AI/DX'
export const serviceSearchName = 'ルキスマLAB'
export const serviceAlternateNames = ['ルキスマラボ', 'Rukisuma LAB', serviceName, 'Revenue AI/DX Infrastructure']
export const operatorName = '沢坂弘樹'
export const operatorNameWithSpace = '沢坂 弘樹'
export const operatorRomanName = 'Hiroki Sawasaka'
export const operatorNameHiragana = 'さわさか ひろき'
export const operatorExternalProfiles = ['https://crowdworks.jp/public/employees/6733727']
export const operatorSubjectUrls = [
  'https://www.daily.co.jp/baseball/shikoku/2016/08/22/0009412721.shtml',
  'https://www.iblj.co.jp/news/5501/',
]
export const companyProfilePath = '/company'
export const companyProfileUrl = `${publicSiteUrl}${companyProfilePath}`
export const operatorProfilePath = '/hiroki-sawasaka'
export const operatorProfileUrl = `${publicSiteUrl}${operatorProfilePath}`
export const operatorPersonId = `${operatorProfileUrl}#person`

export const publicSiteTitle = `【公式】${serviceSearchName}｜${companyName}`

export const publicSiteDescription =
  `${serviceSearchName}は、営業・マーケティング領域のAI/DXインフラを設計・実装する${companyName}のサービスです。既存ツールとAIを組み合わせ、代表の${operatorName}が支援します。`

export const publicSiteKeywords = [
  companyName,
  operatorName,
  operatorNameWithSpace,
  operatorRomanName,
  operatorNameHiragana,
  'ルーキースマートジャパン',
  serviceSearchName,
  ...serviceAlternateNames,
  'AI/DXインフラ設計',
  'レベニュー基盤',
  '営業インフラ設計',
  'マーケティングDX',
  'FDE',
  'Revenue AI/DX Infrastructure',
  'Forward Deployed DX',
  'Forward Deployed Engineer',
  'FDE AI/DX',
  'RookieSmart Japan',
  'RookieSmart',
  'CRM',
  'AIインフラ',
  'Obsidian',
  'チャットボット',
  'オウンドメディア',
  'HubSpot',
  'Salesforce',
  'Notion',
  'Google Workspace',
  'Microsoft 365',
  'Zoom',
  'チャットCRM',
  '営業DX',
  '営業支援',
  '営業実行',
  'CRM構築',
  '営業データ',
  '商談管理',
  '議事録AI',
  'RAG',
  '社内ナレッジ',
]

export const googleSiteVerification =
  process.env.GOOGLE_SITE_VERIFICATION ?? process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION

export const googleAnalyticsMeasurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID

export const publicSiteFaqItems = [
  {
    question: 'ルキスマLABとは何ですか？',
    answer:
      `${serviceSearchName}は、${companyName}が提供するAI/DXインフラ設計・実装サービスです。営業・マーケティング領域を中心に、既存SaaSとAIを組み合わせ、会社独自の業務基盤を構築します。`,
  },
  {
    question: 'FDE AI/DXとは何ですか？',
    answer:
      `${companyName}が提供する、営業・マーケティングのレベニュー領域に特化したAI/DXインフラ設計サービスです。Obsidian・Notion・Google Workspace・Microsoft・Zoomなどの既存ツールにAIを組み合わせ、会社独自のAIインフラを設計します。`,
  },
  {
    question: 'FDEとは何を意味しますか？',
    answer:
      'Forward Deployedの考え方をもとに、営業現場に入り込み、AI・CRM・データ活用を成果に接続する実装思想を指します。',
  },
  {
    question: '株式会社ルーキースマートジャパンはどのサービスを提供していますか？',
    answer:
      `${companyName}は、営業・マーケティングの売上基盤を再設計する${serviceName}を提供しています。FDE形式でヒアリングし、既存SaaSとAIを組み合わせた会社独自のAI/DXインフラを設計します。`,
  },
  {
    question: '株式会社ルーキースマートジャパンの代表は誰ですか？',
    answer:
      `${companyName}の代表は${operatorName}です。${operatorName}が${serviceName}のAI/DXインフラ設計、CRM構築、営業・マーケティングDXを支援しています。`,
  },
  {
    question: '沢坂弘樹とFDE AI/DXの関係は何ですか？',
    answer:
      `${operatorName}は、${companyName}の代表として、${serviceName}のAI/DXインフラ設計、CRM構築、営業・マーケティングDXを支援しています。`,
  },
  {
    question: '沢坂弘樹の公式プロフィールはどこで確認できますか？',
    answer:
      `${operatorName}の公式プロフィールは、${operatorProfileUrl}で確認できます。${companyName}代表として${serviceName}のAI/DXインフラ設計、CRM構築、営業・マーケティングDXを支援しています。`,
  },
  {
    question: 'FDE AI/DXはどのような検索キーワードに関係するサービスですか？',
    answer:
      'AI/DXインフラ設計、営業DX、マーケティングDX、FDE、Obsidian、Notion、Google Workspace、Microsoft 365、Zoom、チャットボット、オウンドメディアに関係するサービスです。',
  },
]

export const publicSiteStructuredData = [
  {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${publicSiteUrl}/#organization`,
    name: companyName,
    legalName: companyName,
    alternateName: ['RookieSmart Japan', 'RookieSmart', 'ルーキースマートジャパン', serviceSearchName],
    url: companyProfileUrl,
    logo: `${publicSiteUrl}/icon.svg`,
    sameAs: [publicSiteUrl, companyProfileUrl],
    mainEntityOfPage: companyProfileUrl,
    founder: {
      '@id': operatorPersonId,
    },
    employee: {
      '@id': operatorPersonId,
    },
    member: {
      '@id': operatorPersonId,
    },
    brand: {
      '@id': `${publicSiteUrl}/#software`,
    },
  },
  {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': operatorPersonId,
    name: operatorName,
    alternateName: [operatorNameWithSpace, operatorRomanName, operatorNameHiragana, 'さわさかひろき'],
    jobTitle: `代表 / ${serviceSearchName} AI/DXインフラ設計支援`,
    description: `${operatorName}は、${companyName}の代表として、${serviceSearchName}（${serviceName}）のAI/DXインフラ設計、CRM構築、営業・マーケティングDXを支援しています。`,
    url: operatorProfileUrl,
    identifier: `${companyName}代表:${operatorName}`,
    sameAs: operatorExternalProfiles,
    mainEntityOfPage: operatorProfileUrl,
    disambiguatingDescription: `${companyName}代表。元・香川オリーブガイナーズ内野手の沢坂弘樹。現在は${serviceSearchName}のAI/DX設計・実装を支援しています。`,
    alumniOf: {
      '@type': 'CollegeOrUniversity',
      name: '亜細亜大学',
    },
    subjectOf: operatorSubjectUrls.map((url) => ({
      '@type': 'Article',
      url,
    })),
    worksFor: {
      '@id': `${publicSiteUrl}/#organization`,
    },
    affiliation: {
      '@id': `${publicSiteUrl}/#organization`,
    },
    knowsAbout: [serviceSearchName, serviceName, 'AI/DXインフラ設計', '営業DX', 'マーケティングDX', 'FDE', 'Obsidian', 'Notion', 'Google Workspace', 'Microsoft 365', 'Zoom', 'チャットボット', 'オウンドメディア'],
  },
  {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    '@id': `${publicSiteUrl}/#software`,
    name: serviceSearchName,
    alternateName: serviceAlternateNames,
    applicationCategory: 'BusinessApplication',
    applicationSubCategory: 'CRM',
    operatingSystem: 'Web',
    url: publicSiteUrl,
    description: publicSiteDescription,
    inLanguage: 'ja-JP',
    areaServed: 'JP',
    provider: {
      '@type': 'Organization',
      '@id': `${publicSiteUrl}/#organization`,
      name: companyName,
      url: publicSiteUrl,
    },
  },
  {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${publicSiteUrl}/#website`,
    name: publicSiteTitle,
    alternateName: [serviceSearchName, ...serviceAlternateNames],
    url: publicSiteUrl,
    inLanguage: 'ja-JP',
    publisher: {
      '@type': 'Organization',
      '@id': `${publicSiteUrl}/#organization`,
      name: companyName,
    },
  },
  {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': `${publicSiteUrl}/#webpage`,
    name: publicSiteTitle,
    url: publicSiteUrl,
    description: publicSiteDescription,
    inLanguage: 'ja-JP',
    isPartOf: {
      '@id': `${publicSiteUrl}/#website`,
    },
    about: {
      '@id': `${publicSiteUrl}/#software`,
    },
    author: {
      '@id': operatorPersonId,
    },
    primaryImageOfPage: `${publicSiteUrl}/icon.svg`,
  },
  {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: serviceName,
        item: publicSiteUrl,
      },
    ],
  },
  {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: publicSiteFaqItems.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  },
]
