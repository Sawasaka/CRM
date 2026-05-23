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
export const serviceName = 'ルーキースマートCRM'
export const shortServiceName = 'ルキスマCRM'

export const publicSiteTitle = `${shortServiceName}｜${companyName}のAI CRM`

export const publicSiteDescription =
  `${companyName}が提供する${serviceName}（${shortServiceName}）は、` +
  '営業データ・商談・メール・議事録・求人インテント・企業DBを横断し、次の営業アクションをチャットで引き出すAI CRMです。'

export const publicSiteKeywords = [
  companyName,
  'ルーキースマートジャパン',
  serviceName,
  shortServiceName,
  'RookieSmart Japan',
  'RookieSmart',
  'CRM',
  'AI CRM',
  'チャットCRM',
  '営業DX',
  '営業支援',
  '営業データ',
  '商談管理',
  '議事録AI',
  'RAG',
  'インテントデータ',
  '企業データベース',
]

export const googleSiteVerification =
  process.env.GOOGLE_SITE_VERIFICATION ?? process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION

export const googleAnalyticsMeasurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID

export const publicSiteFaqItems = [
  {
    question: 'ルキスマCRMとは何ですか？',
    answer:
      `${companyName}が提供する、営業データ・商談・メール・議事録・企業DBを横断して回答するチャット型AI CRMです。`,
  },
  {
    question: '株式会社ルーキースマートジャパンはどのサービスを提供していますか？',
    answer:
      `${companyName}は、営業データから次の営業アクションを引き出す${serviceName}（${shortServiceName}）を提供しています。`,
  },
  {
    question: 'ルキスマCRMはどのような検索キーワードに関係するサービスですか？',
    answer:
      'AI CRM、チャットCRM、営業DX、営業支援、商談管理、議事録AI、インテントデータ活用に関係するサービスです。',
  },
]

export const publicSiteStructuredData = [
  {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${publicSiteUrl}/#organization`,
    name: companyName,
    alternateName: ['RookieSmart Japan', 'RookieSmart', 'ルーキースマートジャパン'],
    url: publicSiteUrl,
    logo: `${publicSiteUrl}/icon.svg`,
    sameAs: [publicSiteUrl],
  },
  {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    '@id': `${publicSiteUrl}/#software`,
    name: serviceName,
    alternateName: [shortServiceName, 'RookieSmart CRM'],
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
    alternateName: [serviceName, shortServiceName],
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
    primaryImageOfPage: `${publicSiteUrl}/icon.svg`,
  },
  {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: shortServiceName,
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
