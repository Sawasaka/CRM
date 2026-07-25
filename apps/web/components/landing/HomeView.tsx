import { Hero } from './Hero'
import { PortfolioDemos } from './sections/PortfolioDemos'
import { ROISection } from './ROISection'
import { Testimonials } from './sections/Testimonials'
import { FounderProfile } from './sections/FounderProfile'
import { FAQ } from './sections/FAQ'
import { Footer } from './sections/Footer'
const SHOW_FAQ_SECTION = false

// ルキスマLAB LP 本体。Nav は /lp 側で固定表示する。
export function HomeView() {
  return (
    <div className="relative">
      <Hero />
      <PortfolioDemos />
      <ROISection />
      <Testimonials />
      <FounderProfile />
      {SHOW_FAQ_SECTION && <FAQ />}
      {/* <CustomerVoice /> — 販売パートナー募集セクション。一旦非表示 */}
      <Footer />
    </div>
  )
}
