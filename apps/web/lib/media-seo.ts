import { publicSiteUrl } from '@/lib/public-site'

export type MediaSeoSlug =
  | 'sales-dragon-academy'
  | 'sales-weapon'
  | 'sales-type-diagnosis'
  | 'sales-organization-dragons'

export type MediaSeoPage = {
  slug: MediaSeoSlug
  title: string
  description: string
  h1: string
  eyebrow: string
  lead: string
  body: string
  keywords: string[]
  priority: number
  contentKind: 'school' | 'weapon' | 'diagnosis' | 'organization'
  faq: Array<{
    question: string
    answer: string
  }>
}

export const mediaSeoPages: MediaSeoPage[] = [
  {
    slug: 'sales-dragon-academy',
    title: '営業竜学園｜営業研修・営業育成・営業組織改善の実践メディア',
    description:
      '営業研修・営業育成・営業組織改善を、現場で起きる課題から整理する営業竜学園。FDE CRMで実行と育成をつなぎます。',
    h1: '営業竜学園｜営業研修・営業育成・営業組織改善',
    eyebrow: 'SALES DRAGON ACADEMY',
    lead: '営業組織で起きる停滞や属人化を、育成テーマとして扱う実践メディアです。',
    body:
      '営業竜学園では、営業研修や営業育成を一度きりの講義で終わらせず、商談、議事録、案件、架電、次アクションの中で再現できる状態に整理します。営業組織改善に必要なルール設計、マネジメント、振り返り、CRMへの記録を、現場で使える形に落とし込みます。',
    keywords: ['営業研修', '営業育成', '営業組織改善', '営業マネジメント'],
    priority: 0.85,
    contentKind: 'school',
    faq: [
      {
        question: '営業竜学園では何が学べますか？',
        answer:
          '営業研修、営業育成、営業組織改善に必要な考え方を、現場の会議・商談・案件管理で使える形に整理できます。',
      },
      {
        question: '営業竜学園は誰向けのコンテンツですか？',
        answer:
          '営業責任者、営業マネージャー、インサイドセールス責任者、営業組織を改善したい経営者向けです。',
      },
      {
        question: '営業竜学園とFDE CRMはどう関係しますか？',
        answer:
          '営業竜学園で整理した育成テーマを、FDE CRMの商談・議事録・案件データに接続し、実行状況を追えるようにします。',
      },
      {
        question: 'CRM・Call AI・企業データベースでどう実務化できますか？',
        answer:
          'CRMで育成テーマを記録し、Call AIで商談や架電を振り返り、企業データベースで次に接触すべき営業先を整理できます。',
      },
    ],
  },
  {
    slug: 'sales-weapon',
    title: '営業武器庫｜営業質問力・ヒアリング・営業スキルの実務ノウハウ',
    description:
      '営業質問力・ヒアリング・営業スキルを、商談の場面別に整理する営業武器庫。Call AIとCRMで実務改善につなげます。',
    h1: '営業武器庫｜質問力・ヒアリング・営業スキル',
    eyebrow: 'SALES WEAPON ARSENAL',
    lead: '商談で詰まりやすい場面を、質問力・ヒアリング・合意形成の武器に変える実務ノウハウです。',
    body:
      '営業武器庫では、初回商談、価格抵抗、稟議停滞、決裁者不在、クロージングなどの場面を分解し、営業質問力やヒアリングの使いどころを整理します。属人的な営業スキルを、商談ログやCRMデータに残せる実践知へ変えていきます。',
    keywords: ['営業 質問力', '営業 ヒアリング', '営業スキル', '商談改善'],
    priority: 0.8,
    contentKind: 'weapon',
    faq: [
      {
        question: '営業武器庫では何が学べますか？',
        answer:
          '質問力、ヒアリング、価格抵抗への対応、稟議停滞の整理など、商談で使う営業スキルを場面別に学べます。',
      },
      {
        question: '営業武器庫は誰向けのコンテンツですか？',
        answer:
          '商談品質を上げたい営業担当者、営業マネージャー、インサイドセールス、フィールドセールス向けです。',
      },
      {
        question: '営業武器庫とFDE CRMはどう関係しますか？',
        answer:
          '営業武器庫で整理したスキルや会話の型を、FDE CRMの商談記録・議事録・次アクションに反映できます。',
      },
      {
        question: 'CRM・Call AI・企業データベースでどう実務化できますか？',
        answer:
          'Call AIで商談や架電内容を振り返り、CRMに改善点を残し、企業データベースで次に提案すべき企業を探せます。',
      },
    ],
  },
  {
    slug: 'sales-type-diagnosis',
    title: '営業タイプ診断｜営業ドラゴン図鑑でわかる営業スタイル',
    description:
      '営業タイプ診断で営業スタイルを整理する営業ドラゴン図鑑。営業武器庫・営業竜学園への入口として、強みをCRMで育成に活かします。',
    h1: '営業タイプ診断｜営業ドラゴン図鑑',
    eyebrow: 'SALES TYPE DIAGNOSIS',
    lead: '営業スタイルをドラゴンタイプとして可視化し、強み・弱み・育成テーマを見つける診断入口です。',
    body:
      '営業ドラゴン図鑑では、営業タイプ診断、上司タイプ診断、部下スタイル診断を通じて、営業個人とチームの傾向を整理します。診断結果を会話で終わらせず、CRM上の育成テーマや商談改善につなげることで、営業組織の共通言語を作ります。',
    keywords: ['営業タイプ診断', '営業スタイル診断', '上司タイプ診断', '部下タイプ診断'],
    priority: 0.75,
    contentKind: 'diagnosis',
    faq: [
      {
        question: '営業タイプ診断では何がわかりますか？',
        answer:
          '営業担当者の強み、商談で出やすい癖、上司や部下との関わり方、育成テーマを整理できます。',
      },
      {
        question: '営業タイプ診断は誰向けのコンテンツですか？',
        answer:
          '自分の営業スタイルを知りたい営業担当者、チーム育成を行う営業マネージャー、営業組織を作る責任者向けです。',
      },
      {
        question: '営業ドラゴン図鑑とFDE CRMはどう関係しますか？',
        answer:
          '診断で見えた営業タイプや育成テーマを、FDE CRMの商談・議事録・案件情報と紐づけて活用できます。',
      },
      {
        question: 'CRM・Call AI・企業データベースでどう実務化できますか？',
        answer:
          'CRMに育成テーマを残し、Call AIで商談傾向を振り返り、企業データベースでタイプに合う営業先を整理できます。',
      },
    ],
  },
  {
    slug: 'sales-organization-dragons',
    title: '営業組織の課題図鑑｜営業あるある・マネジメント課題の整理',
    description:
      '営業組織の課題や営業あるあるを、組織診断とマネジメント改善のテーマとして整理。CRM・Call AI・企業DBで実行に移します。',
    h1: '営業組織の課題図鑑',
    eyebrow: 'SALES ORGANIZATION DRAGONS',
    lead: '営業あるあるを笑って終わらせず、営業組織改善の論点に変える記事シリーズ入口です。',
    body:
      '営業組織の課題図鑑では、会議増殖、稟議停滞、責任の曖昧化、過剰品質、蒸し返しなどの営業あるあるを、マネジメント課題として整理します。課題を言語化し、CRM、Call AI、企業データベースを使って次の営業行動へ落とし込むための入口です。',
    keywords: ['営業組織 課題', '組織診断', '組織健全性診断', '営業あるある', '営業マネジメント 課題', '営業組織改善'],
    priority: 0.75,
    contentKind: 'organization',
    faq: [
      {
        question: '営業組織の課題図鑑では何が学べますか？',
        answer:
          '営業会議、稟議、案件停滞、責任分担、マネジメントで起きやすい課題を、改善テーマとして整理できます。',
      },
      {
        question: '営業組織の課題図鑑は誰向けのコンテンツですか？',
        answer:
          '営業責任者、マネージャー、経営者、営業組織の仕組み化や改善を進めたい方に向けたコンテンツです。',
      },
      {
        question: '営業組織の課題図鑑とFDE CRMはどう関係しますか？',
        answer:
          '図鑑で整理した営業組織の課題を、FDE CRMの案件・活動・議事録データに接続して改善を進めます。',
      },
      {
        question: 'CRM・Call AI・企業データベースでどう実務化できますか？',
        answer:
          'CRMで課題を管理し、Call AIで営業活動を振り返り、企業データベースで営業先と優先順位を具体化できます。',
      },
    ],
  },
]

export const mediaSeoSlugs = mediaSeoPages.map((page) => page.slug)

export const mediaSeoPageBySlug = new Map(mediaSeoPages.map((page) => [page.slug, page]))

export const mediaSeoNavigationOrder: MediaSeoSlug[] = [
  'sales-type-diagnosis',
  'sales-weapon',
  'sales-dragon-academy',
  'sales-organization-dragons',
]

export const mediaSeoNavigationPages = mediaSeoNavigationOrder
  .map((slug) => mediaSeoPageBySlug.get(slug))
  .filter((page): page is MediaSeoPage => Boolean(page))

export function getMediaSeoPath(slug: MediaSeoSlug) {
  return `/media/${slug}`
}

export function getMediaSeoUrl(slug: MediaSeoSlug) {
  return `${publicSiteUrl}${getMediaSeoPath(slug)}`
}
