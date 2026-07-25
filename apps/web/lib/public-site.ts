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
  normalizeUrl(
    !isLocalUrl(process.env.NEXT_PUBLIC_SITE_URL) ? process.env.NEXT_PUBLIC_SITE_URL : undefined
  ) ??
  normalizeUrl(!isLocalUrl(process.env.SITE_URL) ? process.env.SITE_URL : undefined) ??
  PUBLIC_SITE_FALLBACK_URL

export const companyName = '株式会社ルーキースマートジャパン'
export const serviceName = 'Revenue Experiment Infrastructure'
export const serviceSearchName = 'ルキスマLAB'
export const serviceAlternateNames = [
  'ルキスマラボ',
  'Rukisuma LAB',
  serviceName,
  '売上実験インフラ',
  'レベニュー実験基盤',
]
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

export const publicSiteTitle = `【公式】${serviceSearchName}｜売上実験インフラ`

export const publicSiteDescription = `${serviceSearchName}は、広告・Web・CRM・商談・受注を接続し、確率モデル、データ計測、ベイズ統計、バンディット配分で売上改善を繰り返せる${companyName}のRevenue Experiment Infrastructureです。`

export const publicSiteKeywords = [
  companyName,
  operatorName,
  operatorNameWithSpace,
  operatorRomanName,
  operatorNameHiragana,
  'ルーキースマートジャパン',
  serviceSearchName,
  ...serviceAlternateNames,
  '売上実験',
  'レベニューインフラ設計',
  'データ収集インフラ',
  'マーケティング分析',
  'インサイドセールス分析',
  '確率モデル',
  'モンテカルロシミュレーション',
  'ベイズ統計',
  'バンディットアルゴリズム',
  'A/Bテスト',
  'CAC',
  'LTV',
  'CVR',
  'FDE',
  'Forward Deployed Engineer',
  'HubSpot',
  'Salesforce',
  'GA4',
  'Google Ads',
  'Search Console',
]

export const googleSiteVerification =
  process.env.GOOGLE_SITE_VERIFICATION ?? process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION

export const googleAnalyticsMeasurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID

export const publicSiteFaqItems = [
  {
    question: 'ルキスマLABとは何ですか？',
    answer: `${serviceSearchName}は、${companyName}が提供する売上実験インフラ設計サービスです。広告・Web・CRM・商談・受注のデータを接続し、仮説検証と配分改善を繰り返せる仕組みを構築します。`,
  },
  {
    question: 'Revenue Experiment Infrastructureとは何ですか？',
    answer:
      '売上導線の可視化、確率シミュレーション、データ計測、ベイズ統計による並行検証、バンディットによる資源配分を一つのサイクルとして運用する基盤です。',
  },
  {
    question: 'どのような企業に向いていますか？',
    answer:
      '広告、SEO、インサイドセールスを行っているものの、どの施策が商談や受注につながったか見えにくい企業に適しています。',
  },
  {
    question: 'FDEとは何を意味しますか？',
    answer:
      'Forward Deployed Engineerの考え方をもとに、現場を直接ヒアリングした担当者が、要件整理からデータ設計、実装、運用改善まで一気通貫で進める支援形式です。',
  },
  {
    question: '既存のCRMやアクセス解析ツールは使えますか？',
    answer:
      'はい。HubSpot、Salesforce、GA4、Search Console、広告媒体、Google Workspaceなど、現在の環境を活かして接続・計測設計を行います。',
  },
  {
    question: '株式会社ルーキースマートジャパンの代表は誰ですか？',
    answer: `${companyName}の代表は${operatorName}です。営業・マーケティング現場の理解と開発経験をもとに、${serviceSearchName}の設計・実装を担当します。`,
  },
]

const serviceId = `${publicSiteUrl}/#service`

export const publicSiteStructuredData = [
  {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${publicSiteUrl}/#organization`,
    name: companyName,
    legalName: companyName,
    alternateName: [
      'RookieSmart Japan',
      'RookieSmart',
      'ルーキースマートジャパン',
      serviceSearchName,
    ],
    url: companyProfileUrl,
    logo: `${publicSiteUrl}/icon.svg`,
    sameAs: [publicSiteUrl, companyProfileUrl],
    founder: { '@id': operatorPersonId },
    employee: { '@id': operatorPersonId },
    brand: { '@id': serviceId },
  },
  {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': operatorPersonId,
    name: operatorName,
    alternateName: [
      operatorNameWithSpace,
      operatorRomanName,
      operatorNameHiragana,
      'さわさかひろき',
    ],
    jobTitle: `代表 / Revenue Experiment Architect`,
    description: `${operatorName}は、${companyName}の代表として、売上実験インフラの設計・実装を支援しています。`,
    url: operatorProfileUrl,
    identifier: `${companyName}代表:${operatorName}`,
    sameAs: operatorExternalProfiles,
    mainEntityOfPage: operatorProfileUrl,
    disambiguatingDescription: `${companyName}代表。元・香川オリーブガイナーズ内野手。現在は営業・マーケティング領域のデータ収集、統計分析、実験基盤を設計しています。`,
    alumniOf: { '@type': 'CollegeOrUniversity', name: '亜細亜大学' },
    subjectOf: operatorSubjectUrls.map((url) => ({ '@type': 'Article', url })),
    worksFor: { '@id': `${publicSiteUrl}/#organization` },
    knowsAbout: [
      serviceSearchName,
      serviceName,
      'レベニューインフラ設計',
      '確率モデル',
      'データ収集インフラ',
      'ベイズ統計',
      'バンディットアルゴリズム',
      'マーケティング分析',
    ],
  },
  {
    '@context': 'https://schema.org',
    '@type': 'Service',
    '@id': serviceId,
    name: serviceName,
    alternateName: [serviceSearchName, ...serviceAlternateNames],
    serviceType: '売上実験インフラ設計・実装支援',
    url: publicSiteUrl,
    description: publicSiteDescription,
    areaServed: { '@type': 'Country', name: 'Japan' },
    provider: {
      '@type': 'Organization',
      '@id': `${publicSiteUrl}/#organization`,
      name: companyName,
      url: publicSiteUrl,
    },
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Revenue Experiment Infrastructure',
      itemListElement: [
        'レベニューインフラ設計',
        '確率モデル設計',
        'データ収集インフラ設計',
        'ベイズ統計モデル設計',
        'バンディット配分エンジン設計',
      ].map((name) => ({
        '@type': 'Offer',
        itemOffered: { '@type': 'Service', name },
      })),
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
    publisher: { '@id': `${publicSiteUrl}/#organization` },
  },
  {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': `${publicSiteUrl}/#webpage`,
    name: publicSiteTitle,
    url: publicSiteUrl,
    description: publicSiteDescription,
    inLanguage: 'ja-JP',
    isPartOf: { '@id': `${publicSiteUrl}/#website` },
    about: { '@id': serviceId },
    author: { '@id': operatorPersonId },
    primaryImageOfPage: `${publicSiteUrl}/icon.svg`,
  },
  {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: publicSiteFaqItems.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  },
]
