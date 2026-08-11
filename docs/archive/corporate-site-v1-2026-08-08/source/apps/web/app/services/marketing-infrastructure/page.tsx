import type { Metadata } from 'next'
import Image from 'next/image'
import { AlertCircle, ArrowUpRight, BarChart3, Database, Gauge, Search, Tags } from 'lucide-react'
import {
  Container,
  CorporateShell,
  FinalCallToAction,
  SectionHeading,
} from '@/components/corporate/CorporateShell'
import {
  DeliverablesGrid,
  MarketingStackVisual,
  PhaseGrid,
  ProofMetrics,
  ServicePageHero,
} from '@/components/corporate/ServiceBlocks'
import { TrackedLink } from '@/components/corporate/TrackedLink'
import {
  advertisingPhases,
  koshikibaseMetrics,
  marketingDeliverables,
  ownedMediaPhases,
} from '@/lib/corporate-site'
import { companyName, publicSiteUrl } from '@/lib/public-site'

export const metadata: Metadata = {
  title: 'マーケティング基盤設計',
  description:
    'オウンドメディアを主軸に、競合・SEO調査、Google Tag Manager・GA4・Search Consoleの計測、ベイズ統計・バンディット配分による広告実験を設計します。',
  alternates: { canonical: '/services/marketing-infrastructure' },
  openGraph: {
    title: `マーケティング基盤設計｜${companyName}`,
    description: 'オウンドメディアを主軸に、広告を学習システムへ変えます。',
    url: '/services/marketing-infrastructure',
  },
}

const measurementItems = [
  { icon: Tags, title: 'Google Tag Manager', text: 'タグ・イベント・発火条件を一元管理' },
  { icon: BarChart3, title: 'GA4イベント', text: '閲覧ではなく、送客・問い合わせ・商談への行動を計測' },
  { icon: Search, title: 'Search Console', text: '検索クエリ、表示、クリック、順位を検索成果の正本として確認' },
  { icon: Database, title: 'UTM / Lead ID / Deal ID', text: 'キーワード・広告から商談・受注までを同じ識別子で接続' },
] as const

const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  '@id': `${publicSiteUrl}/services/marketing-infrastructure#service`,
  name: 'マーケティング基盤設計',
  serviceType: 'オウンドメディア・計測・広告実験基盤設計',
  url: `${publicSiteUrl}/services/marketing-infrastructure`,
  description: metadata.description,
  areaServed: { '@type': 'Country', name: 'Japan' },
  provider: { '@id': `${publicSiteUrl}/#organization`, name: companyName },
}

export default function MarketingInfrastructurePage() {
  return (
    <CorporateShell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <main>
        <ServicePageHero
          eyebrow="MARKETING INFRASTRUCTURE"
          title={<> オウンドメディアを主軸に、<span className="block text-[#147dcc]">広告を学習システムへ。</span></>}
          description="競合にない独自情報を検索導線にし、流入から商談・受注までを計測。その学習をベイズ判断とバンディット配分につなげます。"
          tags={['オウンドメディア設計', 'SEO・競合調査', '計測・CRM接続', 'ベイズ・バンディット']}
          placement="marketing_hero"
        >
          <MarketingStackVisual />
        </ServicePageHero>

        <section className="py-16 sm:py-20 lg:py-24">
          <Container>
            <SectionHeading
              eyebrow="CORE / OWNED MEDIA"
              title={<> 記事の量ではなく、独自の情報構造で選ばれる。</>}
              description={
                <p>
                  一般的なキーワード記事の量産ではなく、競合にない一次情報、独自データ、比較機能、検索意図別ページを事業資産として設計します。
                </p>
              }
            />
            <div className="mt-10">
              <PhaseGrid phases={ownedMediaPhases} />
            </div>
          </Container>
        </section>

        <section className="bg-[#f3f8fc] py-16 sm:py-20 lg:py-24">
          <Container>
            <div className="grid gap-10 lg:grid-cols-[0.78fr_1.22fr] lg:items-start">
              <SectionHeading
                eyebrow="MEASUREMENT LAYER"
                title={<> キーワードから受注まで、同じ定義で測る。</>}
                description={
                  <p>
                    Go-to-MarketのGTMと混同しないよう、タグ管理は「Google Tag Manager」と明記します。個人情報は計測せず、施策と成果をつなぐID・イベント・KPIを定義します。
                  </p>
                }
              />
              <div className="grid gap-4 sm:grid-cols-2">
                {measurementItems.map(({ icon: Icon, title, text }) => (
                  <article key={title} className="min-h-48 rounded-2xl border border-[#d9eaf5] bg-white p-6 shadow-[0_12px_35px_rgba(11,49,85,0.05)]">
                    <Icon className="text-[#147dcc]" size={21} />
                    <h3 className="mt-5 text-lg font-black text-[#0b3155]">{title}</h3>
                    <p className="mt-3 text-sm leading-7 text-[#5b7588]">{text}</p>
                  </article>
                ))}
              </div>
            </div>
          </Container>
        </section>

        <section className="py-16 sm:py-20 lg:py-24">
          <Container>
            <SectionHeading
              eyebrow="PLUS / AD EXPERIMENT"
              title={<> ベイズで学び、バンディットで段階的に配分する。</>}
              description={
                <p>
                  バンディットを最初から自動適用するのではありません。計測品質、最低母数、損失上限、探索枠、停止条件を定義したうえで、配分ルールと判断基盤を設計します。
                </p>
              }
            />
            <div className="mt-10">
              <PhaseGrid phases={advertisingPhases} />
            </div>
            <div className="mt-6 flex items-start gap-3 rounded-2xl border border-[#cfe4f3] bg-[#f7fbfe] p-5 text-sm leading-7 text-[#4f6d82]">
              <Gauge className="mt-1 shrink-0 text-[#147dcc]" size={19} />
              <p>
                初期版ではThompson Samplingの自動エンジンを標準提供せず、月次などの判断サイクルで再現できる配分ルールから開始します。
              </p>
            </div>
          </Container>
        </section>

        <section className="bg-[#f3f8fc] py-16 sm:py-20 lg:py-24">
          <Container>
            <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
              <div>
                <p className="text-[11px] font-black tracking-[0.2em] text-[#147dcc]">OWN PRACTICE / KOSHIKI BASE</p>
                <h2 className="mt-4 text-[2rem] font-black leading-[1.2] tracking-[-0.035em] text-[#0b3155] sm:text-[2.7rem]">
                  自社メディアで、
                  <span className="block text-[#147dcc]">設計から計測まで実践する。</span>
                </h2>
                <p className="mt-5 text-sm leading-8 text-[#536f83] sm:text-base">
                  コーシキベースでは、全国の中学硬式野球チームを共通のデータ構造で整備し、都道府県・リーグ・練習環境などの検索意図に合わせて公開しています。
                </p>
                <p className="mt-4 text-sm leading-8 text-[#536f83] sm:text-base">
                  Search Consoleを実検索成果の正本、SE Rankingを定点順位・競合監視に使い、公式サイト送客をGA4の主要イベントとして設計しています。
                </p>
                <TrackedLink
                  href="https://koshikibase.jp"
                  target="_blank"
                  rel="noopener noreferrer"
                  eventName="corporate_service_click"
                  eventParams={{ service: 'koshikibase', placement: 'marketing_case' }}
                  className="mt-7 inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#0b3155] px-6 py-3 text-sm font-black text-white transition hover:-translate-y-0.5 hover:bg-[#124873]"
                >
                  コーシキベースを見る
                  <ArrowUpRight size={16} />
                </TrackedLink>
              </div>

              <TrackedLink
                href="https://koshikibase.jp"
                target="_blank"
                rel="noopener noreferrer"
                eventName="corporate_service_click"
                eventParams={{ service: 'koshikibase', placement: 'marketing_case_image' }}
                className="group overflow-hidden rounded-[1.75rem] border border-[#cfe4f3] bg-white shadow-[0_24px_70px_rgba(11,49,85,0.12)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#147dcc]"
              >
                <div className="flex items-center gap-2 border-b border-[#dcecf7] bg-[#f8fbfd] px-5 py-3">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#ff7b7b]" />
                  <span className="h-2.5 w-2.5 rounded-full bg-[#f7c85c]" />
                  <span className="h-2.5 w-2.5 rounded-full bg-[#62c991]" />
                  <span className="ml-2 truncate rounded-md bg-white px-3 py-1 text-[9px] font-bold text-[#7891a3]">koshikibase.jp</span>
                </div>
                <div className="relative aspect-[16/10]">
                  <Image
                    src="/koshikibase-site-preview.png"
                    alt="コーシキベースの実際のトップページ"
                    fill
                    sizes="(max-width: 1024px) 100vw, 55vw"
                    className="object-cover object-top transition duration-500 group-hover:scale-[1.015]"
                  />
                </div>
              </TrackedLink>
            </div>

            <div className="mt-10">
              <ProofMetrics metrics={koshikibaseMetrics} />
            </div>
            <div className="mt-5 flex items-start gap-3 rounded-2xl border border-[#cfe4f3] bg-white p-5 text-xs leading-6 text-[#627c8e]">
              <AlertCircle className="mt-0.5 shrink-0 text-[#147dcc]" size={17} />
              <p>
                順位数値は2026年7月31日時点のSE Ranking初回取得値で、検索量0のロングテールを含みます。本事例は検索順位・集客・売上を保証するものではありません。
              </p>
            </div>
          </Container>
        </section>

        <section className="py-16 sm:py-20 lg:py-24">
          <Container>
            <div className="grid gap-10 lg:grid-cols-[0.78fr_1.22fr] lg:items-start">
              <SectionHeading
                eyebrow="DELIVERABLES"
                title={<> 調査から計測・配分まで、運用で使える形にする。</>}
                description={<p>レポートだけで終わらせず、ページ対応表、計測定義、実験バックログ、判断・配分ルールとして残します。</p>}
              />
              <DeliverablesGrid items={marketingDeliverables} />
            </div>
          </Container>
        </section>

        <FinalCallToAction
          placement="marketing_final"
          eyebrow="MARKETING CONSULTATION"
          title="今の集客を、次の学習が残る仕組みへ。"
          description="現在のサイト、キーワード、計測環境、広告、CRMの状況をうかがい、優先して接続すべきデータと実験を整理します。"
        />
      </main>
    </CorporateShell>
  )
}
