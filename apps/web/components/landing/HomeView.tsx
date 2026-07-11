import { Hero } from './Hero'
import { PortfolioDemos, type FeaturedAINews } from './sections/PortfolioDemos'
import { ROISection } from './ROISection'
import { Testimonials } from './sections/Testimonials'
import { FounderProfile } from './sections/FounderProfile'
import { FAQ } from './sections/FAQ'
import { Footer } from './sections/Footer'
import { aiTipsColumns } from '@/lib/ai-tips-columns'

const featuredAINews: FeaturedAINews[] = aiTipsColumns
  .filter((article) => article.category === 'AI Trend')
  .sort((a, b) => {
    const publishedDiff = b.publishedAt.localeCompare(a.publishedAt)
    return publishedDiff !== 0 ? publishedDiff : b.newsPublishedAt.localeCompare(a.newsPublishedAt)
  })
  .slice(0, 2)
  .map(({ slug, genre, title, description, newsPublishedAt, sourceName, accent, image }) => ({
    slug,
    genre,
    title,
    description,
    newsPublishedAt,
    sourceName,
    accent,
    image,
  }))

const SHOW_FAQ_SECTION = false

// FDE AI/DX LP 本体。Nav は /lp 側で固定表示する。
export function HomeView() {
  return (
    <div className="relative">
      <Hero />
      <PortfolioDemos featuredAINews={featuredAINews} />
      <ROISection />
      <Testimonials />
      <FounderProfile />
      {SHOW_FAQ_SECTION && <FAQ />}
      {/* <CustomerVoice /> — 販売パートナー募集セクション。一旦非表示 */}
      <Footer />
    </div>
  )
}
