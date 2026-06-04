/**
 * ルキスマCRM Landing Page (/lp)
 * AppHub の 'home' ビューとして表示。上部スイッチで図鑑/武器庫へ
 * ページ遷移なしで切り替わる(URLは履歴APIで /media 等に同期)。
 */

import AppHub from '@/components/AppHub'
import { HomeView } from '@/components/landing/HomeView'
import DragonGuide from '../media/DragonGuide'
import SalesPsychologyGuide from '../media/SalesPsychologyGuide'
import { publicSiteStructuredData } from '@/lib/public-site'

export default function RukismaCRMLandingPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(publicSiteStructuredData) }}
      />
      <AppHub
        initialView="home"
        home={<HomeView />}
        dragon={<DragonGuide />}
        psychology={<SalesPsychologyGuide />}
      />
    </>
  )
}
