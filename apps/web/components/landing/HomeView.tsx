import { Hero } from './Hero'
import { AgentFabricRich } from './AgentFabricRich'
import { MetricsBand } from './sections/MetricsBand'
import { ROISection } from './ROISection'
import { CustomerVoice } from './sections/CustomerVoice'
import { Pricing } from './sections/Pricing'
import { Footer } from './sections/Footer'

// ルキスマCRM LP 本体。AppHub の 'home' ビューとして差し替えられる。
// スイッチバーは AppHub 側にあるので、ここの Nav はバーを持たない。
export function HomeView() {
  return (
    <div className="relative">
      <Hero />
      <MetricsBand />
      <AgentFabricRich />
      <Pricing />
      <ROISection />
      <CustomerVoice />
      <Footer />
    </div>
  )
}
