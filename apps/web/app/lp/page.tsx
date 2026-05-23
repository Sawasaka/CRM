/**
 * ルキスマCRM Landing Page (/lp)
 * 営業データから答えるチャットCRM — 公開LP（認証不要）
 * Photon Drift デザインシステムで構築。ログイン後のサービス本体は /dashboard にある。
 */

import { Nav } from '@/components/landing/Nav'
import { Hero } from '@/components/landing/Hero'
import { AgentFabricRich } from '@/components/landing/AgentFabricRich'
import { MetricsBand } from '@/components/landing/sections/MetricsBand'
import { ROISection } from '@/components/landing/ROISection'
import { CustomerVoice } from '@/components/landing/sections/CustomerVoice'
import { Pricing } from '@/components/landing/sections/Pricing'
import { Footer } from '@/components/landing/sections/Footer'
import { publicSiteStructuredData } from '@/lib/public-site'

export default function RukismaCRMLandingPage() {
  return (
    <div className="relative">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(publicSiteStructuredData) }}
      />
      <Nav />
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
