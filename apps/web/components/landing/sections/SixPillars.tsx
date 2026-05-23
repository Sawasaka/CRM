import {
  MessageCircle, Compass, TrendingUp, Boxes, Book, Headphones,
  type LucideIcon,
} from 'lucide-react'
import { Eyebrow, Section } from '../atoms'

interface Pillar {
  Icon: LucideIcon
  tone: string
  title: string
  eyebrow: string
  body: string
  featured?: boolean
}

const PILLARS: Pillar[] = [
  {
    Icon: MessageCircle, tone: '#abc7ff', eyebrow: 'CHAT HOME ★', featured: true,
    title: '全部、聞けばいい。',
    body: '顧客データ・議事録・ナレッジ・チケット・案件・社内文書 — すべてが標準でRAG化。「今週のホット企業」「先週の商談で出た要望」を自然言語で投げれば、適切なエージェントが即動く。事前のダッシュボード設計は不要です。',
  },
  {
    Icon: Compass, tone: '#abc7ff', eyebrow: 'CRM',
    title: '議事録から、勝手に埋まる。',
    body: 'Google Meet・Gmail・コール録音をすべて自動取込。Sales Agent が議事録から予算・課題・キーパーソン・希望サービスを抽出し、CRMフィールドに自動投入。担当者は確認するだけ。',
  },
  {
    Icon: TrendingUp, tone: '#ffcf4a', eyebrow: 'MARKETING AUTOMATION',
    title: '1stパーティ・インテントで、追わない営業へ。',
    body: '自社サイト行動・メール開封・資料DLなど、自社で取得した1stパーティデータからインテント生成。スコアが閾値を超えたリードに、Marketing Agent がナーチャリング・シーケンスを自動起動。',
  },
  {
    Icon: Boxes, tone: '#8dffc9', eyebrow: 'PDM',
    title: '議事録から、次の機能が立ち上がる。',
    body: '商談・サポート議事録から、PDM Agent が「課題」「要望機能」「ニーズ」を自動抽出。企業数 × 重要度でスコアリング。プロダクトマネージャーの「声を集める仕事」をゼロに。',
  },
  {
    Icon: Book, tone: '#c8b9ff', eyebrow: 'KNOWLEDGE',
    title: 'トップセールスのナレッジを、全員が使う。',
    body: 'チャットで質問→Knowledge Agent が回答。1度回答した内容は自動でナレッジ化、2度目以降は即答。事前のFAQ設計は一切不要。組織知が時間とともに濃くなる。',
  },
  {
    Icon: Headphones, tone: '#ff8dcf', eyebrow: 'CUSTOMER',
    title: 'チケットも、エージェントと人で回す。',
    body: '顧客からの問い合わせをチケット化。Customer Agent が過去類似ケース＋ナレッジから1次回答を提案。必要なら有人にエスカレーション。Zendeskでやってきたことが、ここに統合されます。',
  },
]

export const SixPillars = () => (
  <Section tone="obsidian" screenLabel="06 Pillars">
    <div className="relative mx-auto max-w-6xl px-6 py-32 md:py-44">
      <div className="max-w-3xl">
        <Eyebrow color="#abc7ff">SIX PILLARS</Eyebrow>
        <h2 className="font-display font-bold tracking-[-0.025em] text-[2.4rem] md:text-[3.4rem] leading-[1.06] mt-5">
          <span className="fo-gradient-text">1つのチャットで、</span>5領域を統合。
        </h2>
      </div>
      <div className="grid md:grid-cols-3 gap-5 mt-14">
        {PILLARS.map((p, i) => {
          const Icon = p.Icon
          return (
            <div
              key={i}
              className={`${p.featured ? 'md:col-span-2 md:row-span-2' : ''} rounded-3xl bg-dusk p-7 fo-lift fo-glass-rim relative overflow-hidden`}
            >
              {p.featured && (
                <div
                  className="absolute -top-16 -right-16 w-56 h-56 rounded-full"
                  style={{ background: `radial-gradient(circle, ${p.tone}26, transparent 60%)`, filter: 'blur(40px)' }}
                />
              )}
              <div className="flex items-center gap-2">
                <Icon size={16} color={p.tone} strokeWidth={1.5} />
                <span className="font-semibold uppercase tracking-[0.14em] text-[0.72rem]" style={{ color: p.tone }}>
                  {p.eyebrow}
                </span>
              </div>
              <div
                className={`font-display font-bold ${p.featured ? 'text-[2rem] md:text-[2.6rem]' : 'text-[1.35rem]'} leading-[1.15] mt-4 ${p.featured ? 'fo-gradient-text' : 'text-[#e7e5ea]'}`}
              >
                {p.title}
              </div>
              <p className={`mt-4 text-[#9b99a0] ${p.featured ? 'text-[1rem]' : 'text-sm'} leading-relaxed`}>{p.body}</p>
            </div>
          )
        })}
      </div>
    </div>
  </Section>
)
