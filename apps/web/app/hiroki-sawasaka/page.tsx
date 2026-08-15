import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import {
  BookingLink,
  Container,
  CorporateShell,
  FinalCallToAction,
  SectionHeading,
} from '@/components/corporate/CorporateShell'
import {
  companyName,
  operatorExternalProfiles,
  operatorName,
  operatorNameHiragana,
  operatorNameWithSpace,
  operatorProfileUrl,
  operatorRomanName,
  publicSiteUrl,
} from '@/lib/public-site'

const profileTitle = `${operatorName}｜${companyName}代表`
const profileDescription = `${operatorName}の公式プロフィール。${companyName}代表として、Go-to-Market（GTM）設計、マーケティング基盤設計、データに基づく事業インフラの構築を行っています。`

export const metadata: Metadata = {
  title: profileTitle,
  description: profileDescription,
  keywords: [
    operatorName,
    operatorNameWithSpace,
    operatorRomanName,
    operatorNameHiragana,
    companyName,
    'Go-to-Market設計',
    'GTM設計',
    'マーケティング基盤設計',
  ],
  alternates: { canonical: '/hiroki-sawasaka' },
  openGraph: {
    title: profileTitle,
    description: profileDescription,
    url: '/hiroki-sawasaka',
    siteName: companyName,
    type: 'profile',
    locale: 'ja_JP',
    images: [
      {
        url: '/founder-corporate.jpeg',
        width: 1600,
        height: 1067,
        alt: `${companyName}代表 ${operatorName}`,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: profileTitle,
    description: profileDescription,
    images: ['/founder-corporate.jpeg'],
  },
  robots: { index: true, follow: true },
}

const profileStructuredData = [
  {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    '@id': `${operatorProfileUrl}#profilepage`,
    url: operatorProfileUrl,
    name: profileTitle,
    description: profileDescription,
    inLanguage: 'ja-JP',
    isPartOf: { '@id': `${publicSiteUrl}/#website` },
    about: { '@id': `${operatorProfileUrl}#person` },
    mainEntity: { '@id': `${operatorProfileUrl}#person` },
    primaryImageOfPage: `${publicSiteUrl}/founder-corporate.jpeg`,
  },
  {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': `${operatorProfileUrl}#person`,
    name: operatorName,
    alternateName: [operatorNameWithSpace, operatorRomanName, operatorNameHiragana],
    url: operatorProfileUrl,
    image: `${publicSiteUrl}/founder-corporate.jpeg`,
    jobTitle: `${companyName} 代表`,
    description: profileDescription,
    sameAs: operatorExternalProfiles,
    alumniOf: { '@type': 'CollegeOrUniversity', name: '亜細亜大学' },
    worksFor: { '@id': `${publicSiteUrl}/#organization` },
    knowsAbout: [
      'Go-to-Market設計',
      'プロダクト開発',
      'サービス開発',
      '組織設計',
      '営業戦略',
      'マーケティング戦略',
      'カスタマーサクセス',
      'オウンドメディア設計',
    ],
  },
]

const timeline = [
  {
    number: '01',
    label: '野球に打ち込んだ原点',
    title: '亜細亜大学野球部で4年間',
    description:
      '高い要求水準の中で、継続する力と、チームの中で自分の役割を果たす姿勢を身につけました。',
  },
  {
    number: '02',
    label: '海外への挑戦',
    title: 'パナマ・オーストラリア・台湾へ',
    description:
      '26歳まで海外で野球を続け、異なる文化や環境でも、相手を理解して前へ進む現場感覚を磨きました。',
  },
  {
    number: '03',
    label: 'キャリアの転換',
    title: '引退後にTOEIC 910点、エンジニアへ',
    description:
      '交通事故をきっかけに野球を引退。学び直しを経て、フリーランスエンジニアとして開発経験を積みました。',
  },
  {
    number: '04',
    label: '事業づくりの実務',
    title: 'プロダクトからCSまで',
    description:
      'プロダクト・サービス開発、組織設計、営業、マーケティング、カスタマーサクセスを横断し、事業全体をつなぐ経験を重ねています。',
  },
]

const capabilities = [
  '市場・競合・顧客理解',
  'Go-to-Market（GTM）設計',
  'プロダクト・サービス開発',
  '営業プロセス・組織設計',
  'オウンドメディア・SEO設計',
  '計測・CRM・改善基盤',
]

export default function HirokiSawasakaPage() {
  return (
    <CorporateShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(profileStructuredData) }}
      />
      <main>
        <section className="border-b border-[#dceaf2] bg-[#f5fafc] py-14 sm:py-20 lg:py-24">
          <Container>
            <nav aria-label="パンくず" className="mb-9 text-xs font-semibold text-[#6b8493]">
              <Link href="/" className="hover:text-[#0b6fb7]">ホーム</Link>
              <span className="mx-2" aria-hidden="true">/</span>
              <span aria-current="page">{operatorName}</span>
            </nav>
            <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-20">
              <div className="relative aspect-[4/3] overflow-hidden bg-[#dceef7]">
                <Image
                  src="/founder-corporate.jpeg"
                  alt={`${companyName}代表 ${operatorName}`}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 45vw"
                  className="object-cover object-center"
                />
              </div>
              <div>
                <p className="text-[10px] font-bold tracking-[0.22em] text-[#0b6fb7]">FOUNDER / CEO</p>
                <h1 className="mt-5 [font-family:'Yu_Mincho','Hiragino_Mincho_ProN','Noto_Serif_JP',serif] text-[2.6rem] font-semibold leading-tight tracking-[-0.04em] text-[#123b59] sm:text-[3.5rem]">
                  {operatorNameWithSpace}
                </h1>
                <p className="mt-3 text-sm font-bold tracking-[0.08em] text-[#527187]">HIROKI SAWASAKA</p>
                <p className="mt-7 max-w-2xl text-base leading-9 text-[#526f80] sm:text-lg sm:leading-10">
                  野球で培った現場感覚と、開発・営業・マーケティングの実務経験を統合し、エビデンスとデータに基づく事業インフラを設計・実装しています。
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <BookingLink placement="profile_hero" />
                  <Link
                    href="/#businesses"
                    className="inline-flex min-h-12 items-center justify-center gap-3 border border-[#9fc7df] bg-white px-6 py-3 text-sm font-bold text-[#123b59] transition hover:border-[#0b6fb7] hover:text-[#0b6fb7]"
                  >
                    事業を見る <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
            </div>
          </Container>
        </section>

        <section className="py-16 sm:py-24 lg:py-28">
          <Container>
            <SectionHeading eyebrow="STORY" title={<>26歳まで野球。<br />その先で、事業づくりを始めた。</>} />
            <div className="mt-12 grid border-l border-t border-[#cfe1eb] md:grid-cols-2 lg:mt-16">
              {timeline.map((item) => (
                <article key={item.number} className="border-b border-r border-[#cfe1eb] p-6 sm:p-8 lg:p-10">
                  <div className="flex items-start gap-5">
                    <span className="grid h-10 w-10 shrink-0 place-items-center bg-[#0b6fb7] text-xs font-bold text-white">
                      {item.number}
                    </span>
                    <div>
                      <p className="text-[10px] font-bold tracking-[0.18em] text-[#0b6fb7]">{item.label}</p>
                      <h2 className="mt-3 [font-family:'Yu_Mincho','Hiragino_Mincho_ProN','Noto_Serif_JP',serif] text-xl font-semibold leading-8 text-[#123b59] sm:text-2xl">
                        {item.title}
                      </h2>
                      <p className="mt-4 text-sm leading-8 text-[#5a7484]">{item.description}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </Container>
        </section>

        <section className="bg-[#0d3551] py-16 text-white sm:py-24 lg:py-28">
          <Container>
            <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
              <div>
                <p className="text-[10px] font-bold tracking-[0.22em] text-[#8dc8ea]">BUSINESS EXPERIENCE</p>
                <h2 className="mt-5 [font-family:'Yu_Mincho','Hiragino_Mincho_ProN','Noto_Serif_JP',serif] text-[2rem] font-semibold leading-[1.5] tracking-[-0.03em] sm:text-[2.55rem]">
                  現場と仕組みの両方から、<br />事業を前へ進める。
                </h2>
                <p className="mt-6 text-sm leading-8 text-[#c8dce8] sm:text-base sm:leading-9">
                  部門単位の施策ではなく、顧客理解から営業、マーケティング、カスタマーサクセスまでを、一つの成長構造として捉えます。
                </p>
              </div>
              <ul className="grid border-l border-t border-white/20 sm:grid-cols-2">
                {capabilities.map((capability, index) => (
                  <li key={capability} className="flex min-h-24 items-center gap-4 border-b border-r border-white/20 p-5 sm:p-6">
                    <span className="text-[10px] font-bold tracking-[0.18em] text-[#8dc8ea]">{String(index + 1).padStart(2, '0')}</span>
                    <span className="text-sm font-bold leading-7 text-white">{capability}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Container>
        </section>

        <FinalCallToAction placement="profile_final" />
      </main>
    </CorporateShell>
  )
}
