import type { Metadata } from 'next'
import { publicSiteUrl } from '@/lib/public-site'
import AppHub from '@/components/AppHub'
import { HomeView } from '@/components/landing/HomeView'
import DragonGuide from './DragonGuide'
import SalesDragonAcademyGuide from './SalesDragonAcademyGuide'
import SalesPsychologyGuide from './SalesPsychologyGuide'

export const metadata: Metadata = {
  title: '営業ドラゴン図鑑・営業武器庫・営業竜学園｜営業組織エンタメメディア',
  description:
    '営業ドラゴン図鑑、営業武器庫、営業竜学園を通じて、営業組織の実務知をエンタメ化して届けるオウンドメディアです。',
  alternates: {
    canonical: '/media',
  },
  openGraph: {
    title: '営業ドラゴン図鑑・営業武器庫・営業竜学園',
    description: '営業組織の実務知を図鑑・武器庫・竜学園として届ける営業エンタメメディア。',
    url: `${publicSiteUrl}/media`,
    type: 'website',
    locale: 'ja_JP',
  },
}

export default async function MediaHubPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>
}) {
  const { view } = await searchParams
  const initialView = view === 'psychology' ? 'psychology' : view === 'school' ? 'school' : 'dragon'
  return (
    <AppHub
      initialView={initialView}
      home={<HomeView />}
      dragon={<DragonGuide />}
      psychology={<SalesPsychologyGuide />}
      school={<SalesDragonAcademyGuide />}
    />
  )
}
