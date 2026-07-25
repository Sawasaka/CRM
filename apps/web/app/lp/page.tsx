import { HomeView } from '@/components/landing/HomeView'
import { Nav } from '@/components/landing/Nav'
import { publicSiteStructuredData } from '@/lib/public-site'

export default function RevenueExperimentLandingPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(publicSiteStructuredData) }}
      />
      <div className="relative">
        <div className="sticky top-0 z-[60] backdrop-blur-xl" style={{ background: 'transparent' }}>
          <Nav />
        </div>
        <HomeView />
      </div>
    </>
  )
}
