import Image from 'next/image'
import Link from 'next/link'
import { BusinessCards } from '@/components/corporate/BusinessCards'
import { Container, CorporateShell, FinalCallToAction, SectionHeading } from '@/components/corporate/CorporateShell'
import { HeroCarousel } from '@/components/corporate/HeroCarousel'
import { ReferenceVoicesSection } from '@/components/corporate/ReferenceVoicesSection'
import { TrackRecordSection } from '@/components/corporate/TrackRecordSection'
import {
  publicSiteStructuredData,
} from '@/lib/public-site'

export default function CorporateHomePage() {
  return (
    <CorporateShell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(publicSiteStructuredData) }} />
      <main>
        <HeroCarousel />

        <section id="businesses" className="scroll-mt-24 py-16 sm:py-24 lg:py-28">
          <Container>
            <SectionHeading
              eyebrow="OUR BUSINESS"
              title={<>勝ち筋を、データで再現する。</>}
            />
            <div className="mt-12 lg:mt-16"><BusinessCards /></div>
          </Container>
        </section>

        <section id="representative" className="scroll-mt-24 py-16 sm:py-24 lg:py-28">
          <Container>
            <div className="grid gap-12 lg:grid-cols-[1fr_1fr] lg:items-center lg:gap-20">
              <Link href="/hiroki-sawasaka" className="relative block" aria-label="沢坂弘樹の代表プロフィールを見る">
                <div className="relative aspect-[4/3] overflow-hidden bg-[#dceef7]">
                  <Image src="/founder-corporate.jpeg" alt="株式会社ルーキースマートジャパン代表 沢坂弘樹" fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover object-center" />
                </div>
                <div className="absolute -bottom-6 right-0 bg-[#0d3551] px-6 py-4 text-white sm:right-[-1.5rem] sm:px-8">
                  <p className="text-[9px] font-bold tracking-[0.18em] text-[#8dc8ea]">FOUNDER / CEO</p>
                  <p className="mt-1 text-lg font-bold">沢坂 弘樹</p>
                </div>
              </Link>
              <div className="pt-8 lg:pt-0">
                <SectionHeading
                  eyebrow="FOUNDER STORY"
                  title={
                    <>
                      世界で野球。事故を越え、事業へ。
                    </>
                  }
                />
                <div className="mt-6 space-y-4 text-sm leading-8 text-[#587383] sm:text-base sm:leading-9">
                  <p>通称「刑務所」とも呼ばれる亜細亜大学野球部で4年間。その後はパナマ、オーストラリア、台湾へ渡り、26歳まで世界を渡りました。交通事故による引退後、TOEIC 910点を取得し、フリーランスエンジニアへ転身。</p>
                  <p>現在は、多様な事業と職種の知見を統合し、エビデンスとデータに基づく事業インフラを設計・実装しています。</p>
                </div>
              </div>
            </div>
          </Container>
        </section>

        <ReferenceVoicesSection />

        <TrackRecordSection />

        <FinalCallToAction placement="home_final" />
      </main>
    </CorporateShell>
  )
}
