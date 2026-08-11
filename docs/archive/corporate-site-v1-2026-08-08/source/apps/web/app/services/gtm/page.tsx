import type { Metadata } from 'next'
import { Check, Lightbulb, RefreshCw, Users } from 'lucide-react'
import {
  Container,
  CorporateShell,
  FinalCallToAction,
  SectionHeading,
} from '@/components/corporate/CorporateShell'
import {
  DeliverablesGrid,
  GtmLifecycleVisual,
  PhaseGrid,
  ServicePageHero,
} from '@/components/corporate/ServiceBlocks'
import { gtmDeliverables, gtmPhases } from '@/lib/corporate-site'
import { companyName, publicSiteUrl } from '@/lib/public-site'

export const metadata: Metadata = {
  title: 'Go-to-Market（GTM）設計',
  description:
    'プロダクトからカスタマーサクセスまで、市場、ICP、ポジショニング、マーケティング、営業をつなぐGTM設計サービスです。',
  alternates: { canonical: '/services/gtm' },
  openGraph: {
    title: `Go-to-Market（GTM）設計｜${companyName}`,
    description: 'プロダクトからCSまで、売れる仕組みを一つにつなぎます。',
    url: '/services/gtm',
  },
}

const targetCustomers = [
  ['新規事業', '商品はあるが、誰にどう売るかが固まっていない'],
  ['スタートアップ', '個人の力で売れているが、組織で再現できない'],
  ['日本市場への展開', '海外のプロダクトを、日本の商習慣と購買プロセスに合わせたい'],
  ['部門が分断した企業', 'プロダクト、マーケ、営業、CSの判断基準がつながっていない'],
] as const

const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  '@id': `${publicSiteUrl}/services/gtm#service`,
  name: 'Go-to-Market（GTM）設計',
  serviceType: 'Go-to-Market戦略・実行基盤設計',
  url: `${publicSiteUrl}/services/gtm`,
  description: metadata.description,
  areaServed: { '@type': 'Country', name: 'Japan' },
  provider: { '@id': `${publicSiteUrl}/#organization`, name: companyName },
}

export default function GtmServicePage() {
  return (
    <CorporateShell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <main>
        <ServicePageHero
          eyebrow="GO-TO-MARKET DESIGN"
          title={<> プロダクトからCSまで、<span className="block text-[#147dcc]">売れる仕組みを一つにつなぐ。</span></>}
          description="市場・商品・集客・営業・カスタマーサクセスを同じ顧客理解とデータで接続し、個人の経験だけに依存しない成長構造を設計します。"
          tags={['新規事業', 'スタートアップ', '海外サービスの日本展開', '営業・マーケ・CSの統合']}
          placement="gtm_hero"
        >
          <GtmLifecycleVisual />
        </ServicePageHero>

        <section className="py-16 sm:py-20 lg:py-24">
          <Container>
            <SectionHeading
              eyebrow="WHO WE HELP"
              title={<> 事業のどこかに、「つながっていない」がある企業へ。</>}
              description={<p>GTMは営業戦略だけではありません。誰に何を届け、どのように導入・定着させるかまでを一つの仕組みとして整えます。</p>}
            />
            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              {targetCustomers.map(([title, description], index) => (
                <article key={title} className="rounded-2xl border border-[#d9eaf5] bg-white p-6 shadow-[0_12px_35px_rgba(11,49,85,0.05)]">
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#e5f4fc] text-[11px] font-black text-[#147dcc]">0{index + 1}</span>
                    <h3 className="text-lg font-black text-[#0b3155]">{title}</h3>
                  </div>
                  <p className="mt-4 text-sm leading-7 text-[#5b7588]">{description}</p>
                </article>
              ))}
            </div>
          </Container>
        </section>

        <section className="bg-[#f3f8fc] py-16 sm:py-20 lg:py-24">
          <Container>
            <SectionHeading
              eyebrow="7-PHASE GTM MODEL"
              title={<> 売れる構造を7つの工程で設計する。</>}
              description={<p>流行のフレームワークを当てはめるのではなく、現在の事業フェーズと顧客の購買プロセスに合わせて設計します。</p>}
            />
            <div className="mt-10">
              <PhaseGrid phases={gtmPhases} columns={4} />
            </div>
          </Container>
        </section>

        <section className="py-16 sm:py-20 lg:py-24">
          <Container>
            <div className="grid gap-10 lg:grid-cols-[0.82fr_1.18fr] lg:items-start">
              <SectionHeading
                eyebrow="DELIVERABLES"
                title={<> 設計だけで終わらず、実行で使える形で残す。</>}
                description={<p>実際の業務・CRM・会議で継続利用できる定義書とロードマップに落とし込みます。掲載する料金・期間は固定せず、面談後に対象範囲を定義します。</p>}
              />
              <DeliverablesGrid items={gtmDeliverables} />
            </div>
          </Container>
        </section>

        <section className="bg-[#f3f8fc] py-16 sm:py-20">
          <Container>
            <div className="grid gap-5 lg:grid-cols-3">
              {[
                { icon: Users, title: '現場をまたいで理解', text: '開発・営業・マーケ・CSのそれぞれの現場を一つの顧客体験として捉えます。' },
                { icon: Lightbulb, title: '0→1を実行可能に', text: '正解がない状態から、最小の検証単位と判断基準を設計します。' },
                { icon: RefreshCw, title: '学習を次へ戻す', text: '成功・失注・継続のデータを、プロダクトと次の打ち手へ戻します。' },
              ].map(({ icon: Icon, title, text }) => (
                <article key={title} className="rounded-2xl border border-[#d9eaf5] bg-white p-6">
                  <Icon className="text-[#147dcc]" size={22} />
                  <h3 className="mt-5 text-lg font-black text-[#0b3155]">{title}</h3>
                  <p className="mt-3 text-sm leading-7 text-[#5b7588]">{text}</p>
                  <div className="mt-5 flex items-center gap-2 text-xs font-bold text-[#147dcc]"><Check size={14} /> 沢坂弘樹の実務経験を反映</div>
                </article>
              ))}
            </div>
          </Container>
        </section>

        <FinalCallToAction
          placement="gtm_final"
          eyebrow="GTM CONSULTATION"
          title="今の事業の「つながっていない」を整理します。"
          description="商品、顧客、集客、営業、CSの現状をうかがい、最初に定義すべきGTM課題を明確にします。"
        />
      </main>
    </CorporateShell>
  )
}
