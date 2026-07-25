import { Hero } from './Hero'
import { PortfolioDemos } from './sections/PortfolioDemos'
import { ROISection } from './ROISection'
import { Testimonials } from './sections/Testimonials'
import { FounderProfile } from './sections/FounderProfile'
import { FAQ } from './sections/FAQ'
import { Footer } from './sections/Footer'

export function HomeView() {
  return (
    <div className="relative">
      <Hero />
      <PortfolioDemos />
      <ROISection />
      <Testimonials />
      <FounderProfile />
      <FAQ />
      <Footer />
    </div>
  )
}
