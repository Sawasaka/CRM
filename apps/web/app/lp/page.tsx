/**
 * KikuCRM Landing Page (/lp)
 * Front Office カテゴリのフラッグシップ製品 — 公開LP（認証不要）
 * Photon Drift デザインシステムで構築。ログイン後のサービス本体は /dashboard にある。
 */

import { Nav } from '@/components/landing/Nav'
import { Hero } from '@/components/landing/Hero'
import { CategoryDefinition } from '@/components/landing/sections/CategoryDefinition'
import { AntiCosmetic } from '@/components/landing/sections/AntiCosmetic'
import { SixPillars } from '@/components/landing/sections/SixPillars'
import { AgentFabricRich } from '@/components/landing/AgentFabricRich'
import { DatabaseIntent } from '@/components/landing/sections/DatabaseIntent'
import { Security } from '@/components/landing/sections/Security'
import { Transparency } from '@/components/landing/sections/Transparency'
import { MetricsBand } from '@/components/landing/sections/MetricsBand'
import { UseCases } from '@/components/landing/sections/UseCases'
import { ROISection } from '@/components/landing/ROISection'
import { BuildVsBuy } from '@/components/landing/BuildVsBuy'
import { CustomerVoice } from '@/components/landing/sections/CustomerVoice'
import { ComplianceBand } from '@/components/landing/sections/ComplianceBand'
import { HowToStart } from '@/components/landing/sections/HowToStart'
import { Pricing } from '@/components/landing/sections/Pricing'
import { FAQ } from '@/components/landing/sections/FAQ'
import { DocsStrip } from '@/components/landing/sections/DocsStrip'
import { FinalCTA } from '@/components/landing/sections/FinalCTA'
import { Footer } from '@/components/landing/sections/Footer'

export default function KikuCRMLandingPage() {
  return (
    <div className="relative">
      <Nav />
      <Hero />
      <MetricsBand />
      <Pricing />
      <ROISection />
      <BuildVsBuy />
      <AgentFabricRich />
      <CategoryDefinition />
      <AntiCosmetic />
      <SixPillars />
      <DatabaseIntent />
      <Security />
      <Transparency />
      <UseCases />
      <CustomerVoice />
      <ComplianceBand />
      <HowToStart />
      <FAQ />
      <DocsStrip />
      <FinalCTA />
      <Footer />
    </div>
  )
}
