export type DummyFaqStatus = 'CANDIDATE' | 'PUBLISHED' | 'ARCHIVED' | 'REJECTED'
export type DummyFaqSourceType = 'MEETING' | 'MANUAL' | 'SLACK' | 'GOOGLE_CHAT' | 'DRIVE'

export interface DummyAttribution {
  questioner?: string
  responder?: string
  owner?: string
  meetingTitle?: string
  meetingDate?: string
}

export interface DummyFaq {
  id: string
  title: string
  body: string
  department: string | null
  category: string | null
  tags: string[]
  status: DummyFaqStatus
  sourceType: DummyFaqSourceType
  sourceUrl: string | null
  attribution?: DummyAttribution
  hits: number
  createdAt: Date
  updatedAt: Date
}

export const EMPTY_FAQS: DummyFaq[] = [
  {
    id: 'demo-faq-1',
    title: '求人インテントのHOT/MID/LOWは何を基準に見ればよいですか？',
    body:
      'HOTは直近で複数部署の求人・採用シグナルが強く出ている企業です。MIDは一部部署で動きがあり、LOWは弱いシグナルまたは過去シグナルが中心です。まずHOT企業から部署番号付きで接触し、MIDはナーチャリング対象にすると運用しやすくなります。',
    department: '営業',
    category: '企業DB',
    tags: ['求人インテント', '優先順位', 'IS'],
    status: 'PUBLISHED',
    sourceType: 'MEETING',
    sourceUrl: '#',
    attribution: {
      questioner: '営業メンバー',
      responder: 'デモ担当',
      owner: 'デモ担当',
      meetingTitle: 'デモ商談 / 採用インテント活用',
      meetingDate: '2026-06-04',
    },
    hits: 28,
    createdAt: new Date('2026-06-04T09:00:00+09:00'),
    updatedAt: new Date('2026-06-04T18:00:00+09:00'),
  },
  {
    id: 'demo-faq-2',
    title: '部署直通番号はどのように営業リストへ活用しますか？',
    body:
      '企業代表ではなく、採用・営業・情シスなど対象部署の番号へ直接アプローチできます。企業DBで部署番号ありに絞り込み、HOT企業をISリスト化して、コール結果と次アクションをコンタクト画面で更新する流れが基本です。',
    department: 'IS',
    category: '部署番号',
    tags: ['部署番号', 'コール', 'ISリスト'],
    status: 'PUBLISHED',
    sourceType: 'MEETING',
    sourceUrl: '#',
    attribution: {
      questioner: 'IS担当',
      responder: 'デモ担当',
      owner: 'デモ担当',
      meetingTitle: 'デモ商談 / 部署番号DB',
      meetingDate: '2026-06-03',
    },
    hits: 21,
    createdAt: new Date('2026-06-03T09:00:00+09:00'),
    updatedAt: new Date('2026-06-05T14:00:00+09:00'),
  },
  {
    id: 'demo-faq-3',
    title: 'デモ環境のデータは実データですか？',
    body:
      '企業名・業種・インテントなど一部の企業DB情報は取得済みデータを表示しています。一方で、商談、コンタクト、タスク、チケット、メール配信実績などの営業活動データは、操作イメージを持っていただくためのダミーデータです。',
    department: 'CS',
    category: 'デモ環境',
    tags: ['デモ', 'ダミーデータ', '注意事項'],
    status: 'PUBLISHED',
    sourceType: 'MANUAL',
    sourceUrl: '#',
    attribution: {
      questioner: 'お客様',
      responder: 'デモ担当',
      owner: 'デモ担当',
      meetingTitle: '無料デモ案内',
      meetingDate: '2026-06-07',
    },
    hits: 34,
    createdAt: new Date('2026-06-07T09:00:00+09:00'),
    updatedAt: new Date('2026-06-07T09:00:00+09:00'),
  },
]

export const DUMMY_FAQ_COUNTS: Record<DummyFaqStatus, number> = {
  CANDIDATE: 0,
  PUBLISHED: EMPTY_FAQS.length,
  ARCHIVED: 0,
  REJECTED: 0,
}
