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
export const companyEstablishedAt = '2025年9月11日'
export const companyBaseLocation = '東京都23区'
export const companyCorporateNumber = '8010001258471'
export const companyEmail = 'h.sawasaka@rookiesmart.jp'
export const serviceName = 'Go-to-Market / Marketing Infrastructure'
export const serviceSearchName = 'ルキスマLAB'
export const serviceAlternateNames = [
  'ルキスマラボ',
  'Rukisuma LAB',
  serviceName,
  'GTM設計',
  'マーケティング基盤設計',
]
export const operatorName = '沢坂弘樹'
export const operatorNameWithSpace = '沢坂 弘樹'
export const operatorRomanName = 'Hiroki Sawasaka'
export const operatorNameHiragana = 'さわさか ひろき'
export const operatorExternalProfiles = [
  'https://www.wantedly.com/id/hiroki_sawasaka_b',
  'https://crowdworks.jp/public/employees/6733727',
  'https://www.facebook.com/hiroki.sawasaka',
]
export const operatorSubjectUrls = [
  'https://www.daily.co.jp/baseball/shikoku/2016/08/22/0009412721.shtml',
  'https://www.iblj.co.jp/news/5501/',
]
export const companyProfilePath = '/#company'
export const companyProfileUrl = `${publicSiteUrl}${companyProfilePath}`
export const operatorProfilePath = '/hiroki-sawasaka'
export const operatorProfileUrl = `${publicSiteUrl}${operatorProfilePath}`
export const operatorPersonId = `${operatorProfileUrl}#person`

export const publicSiteTitle = `${companyName}｜${operatorName}`

export const publicSiteDescription = `${companyName}（代表：${operatorName}）は、Go-to-Market（GTM）設計とマーケティング基盤設計を通じて、データ・営業・顧客獲得をつなぎ、事業成長を再現するインフラを構築します。`

export const publicSiteKeywords = [
  companyName,
  'ルーキースマートジャパン',
  'Rookie Smart Japan',
  operatorName,
  operatorNameWithSpace,
  operatorRomanName,
  operatorNameHiragana,
  'コーシキベース',
  '中学硬式野球',
  'Go-to-Market',
  'GTM設計',
  'マーケティング基盤設計',
  'GTM戦略',
  '新規事業',
  '日本市場参入',
  'オウンドメディア設計',
  'SEO設計',
  'Google Tag Manager',
  'GA4',
  'Search Console',
  'CRM設計',
  'ベイズ統計',
  'バンディットアルゴリズム',
]

export const googleSiteVerification =
  process.env.GOOGLE_SITE_VERIFICATION ?? process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION

export const googleAnalyticsMeasurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID

export const publicSiteFaqItems = [
  {
    question: '株式会社ルーキースマートジャパンは何をしている会社ですか？',
    answer: `${companyName}は、中学硬式野球メディア「コーシキベース」を運営し、法人向けにGo-to-Market設計とマーケティング基盤設計を提供しています。`,
  },
  {
    question: '法人向けにはどのようなサービスを提供していますか？',
    answer: `${companyName}は、法人向けにGo-to-Market設計とマーケティング基盤設計を提供しています。`,
  },
  {
    question: 'Go-to-Market設計では何を支援しますか？',
    answer:
      '市場・競合・顧客理解から、ポジショニング、商品設計、マーケティング、営業、カスタマーサクセス、改善までを一つの成長構造として設計します。',
  },
  {
    question: 'マーケティング基盤設計では何を支援しますか？',
    answer:
      'オウンドメディアを主軸に、検索機会、サイト構造、Google Tag Manager・GA4・Search Consoleによる計測、CRM接続、広告実験の判断ルールを設計します。',
  },
  {
    question: '相談や見積もりはどのように進みますか？',
    answer:
      'Googleカレンダーから面談をご予約ください。現状と課題を確認したうえで、対象範囲、成果物、進め方を個別に定義します。',
  },
]

const organizationId = `${publicSiteUrl}/#organization`
const gtmServiceId = `${publicSiteUrl}/#gtm-service`
const marketingServiceId = `${publicSiteUrl}/#marketing-service`

export const publicSiteStructuredData = [
  {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': organizationId,
    name: companyName,
    legalName: companyName,
    alternateName: ['Rookie Smart Japan Inc.', 'Rookie Smart Japan', 'ルーキースマートジャパン'],
    url: publicSiteUrl,
    email: companyEmail,
    foundingDate: '2025-09-11',
    address: {
      '@type': 'PostalAddress',
      addressLocality: companyBaseLocation,
      addressCountry: 'JP',
    },
    logo: `${publicSiteUrl}/brand/rookie-smart-japan/rsj-corporate-cat-reading.png`,
    sameAs: [publicSiteUrl, companyProfileUrl, 'https://koshikibase.jp'],
    founder: { '@id': operatorPersonId },
    employee: { '@id': operatorPersonId },
    brand: [
      { '@type': 'Brand', name: 'コーシキベース', url: 'https://koshikibase.jp' },
      {
        '@type': 'Brand',
        name: 'GTM・マーケティング基盤設計',
        url: `${publicSiteUrl}/services`,
      },
    ],
  },
  {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': operatorPersonId,
    name: operatorName,
    alternateName: [operatorNameWithSpace, operatorRomanName, operatorNameHiragana],
    jobTitle: `${companyName} 代表`,
    description: `${operatorName}は、野球で培った現場感覚と、開発・営業・マーケティングの実務経験をもとに、事業の仕組み化を支援しています。`,
    url: operatorProfileUrl,
    image: `${publicSiteUrl}/founder-corporate.jpeg`,
    sameAs: operatorExternalProfiles,
    mainEntityOfPage: operatorProfileUrl,
    alumniOf: { '@type': 'CollegeOrUniversity', name: '亜細亜大学' },
    subjectOf: operatorSubjectUrls.map((url) => ({ '@type': 'Article', url })),
    worksFor: { '@id': organizationId },
    knowsAbout: [
      'Go-to-Market設計',
      'プロダクト開発',
      'サービス開発',
      '営業戦略',
      'マーケティング戦略',
      'カスタマーサクセス',
      'オウンドメディア設計',
    ],
  },
  {
    '@context': 'https://schema.org',
    '@type': 'Service',
    '@id': gtmServiceId,
    name: 'Go-to-Market（GTM）設計',
    serviceType: 'Go-to-Market戦略・実行基盤設計',
    url: `${publicSiteUrl}/#gtm-download`,
    areaServed: { '@type': 'Country', name: 'Japan' },
    provider: { '@id': organizationId },
  },
  {
    '@context': 'https://schema.org',
    '@type': 'Service',
    '@id': marketingServiceId,
    name: 'マーケティング基盤設計',
    serviceType: 'オウンドメディア・計測・広告実験基盤設計',
    url: `${publicSiteUrl}/#marketing-download`,
    areaServed: { '@type': 'Country', name: 'Japan' },
    provider: { '@id': organizationId },
  },
  {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${publicSiteUrl}/#website`,
    name: publicSiteTitle,
    alternateName: [companyName, 'Rookie Smart Japan'],
    url: publicSiteUrl,
    inLanguage: 'ja-JP',
    publisher: { '@id': organizationId },
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
    about: { '@id': organizationId },
    mainEntity: [{ '@id': organizationId }, { '@id': operatorPersonId }],
    author: { '@id': operatorPersonId },
    primaryImageOfPage: `${publicSiteUrl}/corporate-og.svg`,
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
