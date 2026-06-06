import type { Metadata } from 'next'
import { publicSiteUrl } from '@/lib/public-site'
import AppHub from '@/components/AppHub'
import { HomeView } from '@/components/landing/HomeView'
import DragonGuide from './DragonGuide'
import SalesPsychologyGuide from './SalesPsychologyGuide'

export const metadata: Metadata = {
  title: '営業ドラゴン図鑑｜はぐれ博士の営業組織エンタメメディア',
  description:
    '営業組織に潜むドラゴンを、はぐれ博士が診断・図鑑・あるある・失注大学で観測するオウンドメディアです。',
  alternates: {
    canonical: '/media',
  },
  openGraph: {
    title: '営業ドラゴン図鑑',
    description: '失注・上司・CRM墓場を図鑑化する営業エンタメメディア。',
    url: `${publicSiteUrl}/media`,
    type: 'website',
    locale: 'ja_JP',
  },
}

export default function MediaHubPage() {
  return (
    <AppHub
      initialView="dragon"
      home={<HomeView />}
      dragon={<DragonGuide />}
      psychology={<SalesPsychologyGuide />}
    />
  )
}
