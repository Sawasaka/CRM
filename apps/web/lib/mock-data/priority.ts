/**
 * 開発優先度ボードのモックデータ + 型定義
 *
 * Next.js のページファイル (app/(app)/priority/page.tsx) は default export しか
 * 持てないため、再利用するデータ・型はここに切り出している。
 *
 * - priority/page.tsx (画面)
 * - deals/[id]/page.tsx (取引詳細のプロダクトフィールド)
 *
 * からそれぞれ import される。
 */

export type PriorityCategory = '要望機能' | 'ニーズ' | '課題' | '問題'

export interface PriorityEvidence {
  companyId: string
  companyName: string
  /** ISO date (YYYY-MM-DD) */
  meetingDate: string
  /** 議事録 / 問い合わせチケットから AI が拾った引用テキスト */
  quote: string
  /** 議事録ドキュメント (Google Docs) または 問い合わせチケットへのリンク */
  meetingDocUrl: string
  /** 'meeting' = 議事録 / 'ticket' = 問い合わせチケット (リンクラベル切替に使用) */
  sourceType?: 'meeting' | 'ticket'
}

export interface PriorityItem {
  id: string
  category: PriorityCategory
  /** AI がまとめた見出し (例: "カスタムレポートの柔軟性") */
  title: string
  evidence: PriorityEvidence[]
}

export const MOCK_PRIORITY_ITEMS: PriorityItem[] = [
  // ── 要望機能 ────────────────────────────────────────────────────────────────
  {
    id: 'f-1',
    category: '要望機能',
    title: 'カスタムレポートの柔軟性',
    evidence: [
      {
        companyId: 'c-1',
        companyName: '株式会社テクノリード',
        meetingDate: '2026-03-28',
        quote: '現場の SR が自由にレポートを組めないと、結局 Excel に書き出すことになる。レイアウトを保存できる形がほしい。',
        meetingDocUrl: 'https://docs.google.com/document/d/mtg-techno-lead-2026-03-28',
      },
      {
        companyId: 'c-4',
        companyName: '株式会社グロース',
        meetingDate: '2026-04-02',
        quote: '週次の数値報告に毎回 30 分かかっている。経営会議用の独自レイアウトをそのまま吐き出したい。',
        meetingDocUrl: 'https://docs.google.com/document/d/mtg-growth-2026-04-02',
      },
      {
        companyId: 'c-2',
        companyName: '合同会社フューチャー',
        meetingDate: '2026-03-30',
        quote: '事業部ごとに見たい指標が違う。役員報告と現場ダッシュボードは別のテンプレートで管理したい。',
        meetingDocUrl: 'https://docs.google.com/document/d/mtg-future-2026-03-30',
      },
    ],
  },
  {
    id: 'f-2',
    category: '要望機能',
    title: '既存ツールとのデータ連携',
    evidence: [
      {
        companyId: 'c-1',
        companyName: '株式会社テクノリード',
        meetingDate: '2026-03-28',
        quote: 'Salesforce からの移行を考えているが、過去案件のステータス履歴を一括で取り込めるかが懸念。',
        meetingDocUrl: 'https://docs.google.com/document/d/mtg-techno-lead-2026-03-28',
      },
      {
        companyId: 'c-3',
        companyName: '株式会社イノベーション',
        meetingDate: '2026-03-19',
        quote: 'Slack に商談更新が流れてこないと、現場が見に来ない。双方向連携を前提にしたい。',
        meetingDocUrl: 'https://docs.google.com/document/d/mtg-innov-2026-03-19',
      },
      {
        companyId: 'c-4',
        companyName: '株式会社グロース',
        meetingDate: '2026-04-02',
        quote: 'Google Workspace との同期が必須。カレンダー連動で商談を自動取り込みしてほしい。',
        meetingDocUrl: 'https://docs.google.com/document/d/mtg-growth-2026-04-02',
      },
      {
        companyId: 'c-5',
        companyName: '有限会社サクセス',
        meetingDate: '2026-04-08',
        quote: '請求まわりの freee 連携がないと、結局二重入力になる。',
        meetingDocUrl: 'https://docs.google.com/document/d/mtg-success-2026-04-08',
      },
    ],
  },
  {
    id: 'f-3',
    category: '要望機能',
    title: 'モバイルでの入力体験',
    evidence: [
      {
        companyId: 'c-1',
        companyName: '株式会社テクノリード',
        meetingDate: '2026-03-28',
        quote: '営業は外出が多いので、商談直後にスマホからメモをサッと入れられないと続かない。',
        meetingDocUrl: 'https://docs.google.com/document/d/mtg-techno-lead-2026-03-28',
      },
      {
        companyId: 'c-2',
        companyName: '合同会社フューチャー',
        meetingDate: '2026-03-30',
        quote: 'iPad での入力が遅いとのフィードバックを社内から多数受けている。',
        meetingDocUrl: 'https://docs.google.com/document/d/mtg-future-2026-03-30',
      },
    ],
  },
  {
    id: 'f-4',
    category: '要望機能',
    title: '権限管理 (SSO / SAML)',
    evidence: [
      {
        companyId: 'c-4',
        companyName: '株式会社グロース',
        meetingDate: '2026-04-02',
        quote: '情シスの要件で SAML 必須。Okta 連携が前提条件。',
        meetingDocUrl: 'https://docs.google.com/document/d/mtg-growth-2026-04-02',
      },
      {
        companyId: 'c-3',
        companyName: '株式会社イノベーション',
        meetingDate: '2026-03-19',
        quote: 'Azure AD でのシングルサインオンが組織標準。これがないと全社展開できない。',
        meetingDocUrl: 'https://docs.google.com/document/d/mtg-innov-2026-03-19',
      },
    ],
  },

  // ── ニーズ ──────────────────────────────────────────────────────────────────
  {
    id: 'n-1',
    category: 'ニーズ',
    title: '商談直後の振り返りを自動化したい',
    evidence: [
      {
        companyId: 'c-1',
        companyName: '株式会社テクノリード',
        meetingDate: '2026-03-28',
        quote: '商談が終わってから議事録を書く時間がない。録画から自動で要点だけ抜けたら助かる。',
        meetingDocUrl: 'https://docs.google.com/document/d/mtg-techno-lead-2026-03-28',
      },
      {
        companyId: 'c-2',
        companyName: '合同会社フューチャー',
        meetingDate: '2026-03-30',
        quote: '若手の議事録の質がバラつくので、AI で一定品質に揃えたい。',
        meetingDocUrl: 'https://docs.google.com/document/d/mtg-future-2026-03-30',
      },
      {
        companyId: 'c-5',
        companyName: '有限会社サクセス',
        meetingDate: '2026-04-08',
        quote: '次のアクションだけ自動で抽出できれば、CRM に手で書き戻さなくて済む。',
        meetingDocUrl: 'https://docs.google.com/document/d/mtg-success-2026-04-08',
      },
    ],
  },
  {
    id: 'n-2',
    category: 'ニーズ',
    title: 'KPI を経営会議でそのまま使える形にしたい',
    evidence: [
      {
        companyId: 'c-4',
        companyName: '株式会社グロース',
        meetingDate: '2026-04-02',
        quote: '取締役会の前日に毎回スライドに貼り直している。CRM の数字をそのままレポートに出したい。',
        meetingDocUrl: 'https://docs.google.com/document/d/mtg-growth-2026-04-02',
      },
      {
        companyId: 'c-2',
        companyName: '合同会社フューチャー',
        meetingDate: '2026-03-30',
        quote: '事業部別の MRR と継続率を一画面で経営層に見せたい。',
        meetingDocUrl: 'https://docs.google.com/document/d/mtg-future-2026-03-30',
      },
    ],
  },
  {
    id: 'n-3',
    category: 'ニーズ',
    title: 'インテントスコアで優先順位を判断したい',
    evidence: [
      {
        companyId: 'c-3',
        companyName: '株式会社イノベーション',
        meetingDate: '2026-03-19',
        quote: '架電リストを Hot/Cold で振り分けたい。今は鈴木の勘でやっている。',
        meetingDocUrl: 'https://docs.google.com/document/d/mtg-innov-2026-03-19',
      },
      {
        companyId: 'c-1',
        companyName: '株式会社テクノリード',
        meetingDate: '2026-03-28',
        quote: '採用シグナルとサイト来訪を組み合わせて、攻める順番を決められると効率が変わる。',
        meetingDocUrl: 'https://docs.google.com/document/d/mtg-techno-lead-2026-03-28',
      },
    ],
  },

  // ── 課題 ────────────────────────────────────────────────────────────────────
  {
    id: 'p-1',
    category: '課題',
    title: 'データ入力が手動でつらい',
    evidence: [
      {
        companyId: 'c-1',
        companyName: '株式会社テクノリード',
        meetingDate: '2026-03-28',
        quote: '営業が CRM を触らない最大の理由は入力工数。3 分以上かかると確実に書かなくなる。',
        meetingDocUrl: 'https://docs.google.com/document/d/mtg-techno-lead-2026-03-28',
      },
      {
        companyId: 'c-3',
        companyName: '株式会社イノベーション',
        meetingDate: '2026-03-19',
        quote: '商談 1 件あたり 5 〜 10 分の手入力。月末の数字合わせに毎回 1 日かかる。',
        meetingDocUrl: 'https://docs.google.com/document/d/mtg-innov-2026-03-19',
      },
      {
        companyId: 'c-5',
        companyName: '有限会社サクセス',
        meetingDate: '2026-04-08',
        quote: 'Excel ・スプレッドシート・CRM の三重管理になっており、どれが正なのか分からない。',
        meetingDocUrl: 'https://docs.google.com/document/d/mtg-success-2026-04-08',
      },
      {
        companyId: 'c-4',
        companyName: '株式会社グロース',
        meetingDate: '2026-04-02',
        quote: 'メールに記載された次回日程を、また CRM に書き写すのが二度手間。',
        meetingDocUrl: 'https://docs.google.com/document/d/mtg-growth-2026-04-02',
      },
    ],
  },
  {
    id: 'p-2',
    category: '課題',
    title: 'パイプラインの停滞案件に気づけない',
    evidence: [
      {
        companyId: 'c-2',
        companyName: '合同会社フューチャー',
        meetingDate: '2026-03-30',
        quote: '2 週間動いていない案件があとから発覚することが多い。アラートが欲しい。',
        meetingDocUrl: 'https://docs.google.com/document/d/mtg-future-2026-03-30',
      },
      {
        companyId: 'c-4',
        companyName: '株式会社グロース',
        meetingDate: '2026-04-02',
        quote: '定例で確認しないと放置される案件がある。仕組みで拾いたい。',
        meetingDocUrl: 'https://docs.google.com/document/d/mtg-growth-2026-04-02',
      },
      {
        companyId: 'c-1',
        companyName: '株式会社テクノリード',
        meetingDate: '2026-03-28',
        quote: '担当者が休みのとき、その人の案件が進まないまま温度が下がる。',
        meetingDocUrl: 'https://docs.google.com/document/d/mtg-techno-lead-2026-03-28',
      },
    ],
  },
  {
    id: 'p-3',
    category: '課題',
    title: '導入後のオンボーディングで脱落する',
    evidence: [
      {
        companyId: 'c-5',
        companyName: '有限会社サクセス',
        meetingDate: '2026-04-08',
        quote: '前回の SaaS は導入したのに半年で誰も使わなくなった。乗り換え判断がしんどい。',
        meetingDocUrl: 'https://docs.google.com/document/d/mtg-success-2026-04-08',
      },
      {
        companyId: 'c-3',
        companyName: '株式会社イノベーション',
        meetingDate: '2026-03-19',
        quote: '初期設定がベンダー任せになっていて、社内に運用ノウハウが残らない。',
        meetingDocUrl: 'https://docs.google.com/document/d/mtg-innov-2026-03-19',
      },
    ],
  },

  // ── 問題 (問い合わせチケットからの集計) ───────────────────────────────────
  {
    id: 'i-1',
    category: '問題',
    title: 'メール送信時にエラーが発生する',
    evidence: [
      {
        companyId: 'c-1',
        companyName: '株式会社テクノリード',
        meetingDate: '2026-04-22',
        quote: 'ステップメール配信のジョブが 3 回連続で失敗。SMTP のレート制限に引っかかった様子。',
        meetingDocUrl: '/tickets/t-1',
        sourceType: 'ticket',
      },
      {
        companyId: 'c-4',
        companyName: '株式会社グロース',
        meetingDate: '2026-04-18',
        quote: '一括配信を実行したら半分のメールが配信されず、再送ボタンも反応しなくなった。',
        meetingDocUrl: '/tickets/t-2',
        sourceType: 'ticket',
      },
      {
        companyId: 'c-3',
        companyName: '株式会社イノベーション',
        meetingDate: '2026-04-12',
        quote: '差し込み変数 (会社名) が空欄のままお客様に送信されてしまった。',
        meetingDocUrl: '/tickets/t-3',
        sourceType: 'ticket',
      },
    ],
  },
  {
    id: 'i-2',
    category: '問題',
    title: 'ダッシュボードの読み込みが遅い',
    evidence: [
      {
        companyId: 'c-4',
        companyName: '株式会社グロース',
        meetingDate: '2026-04-25',
        quote: '朝イチで開くと 30 秒以上待たされる。データ量が多い顧客で顕著らしい。',
        meetingDocUrl: '/tickets/t-4',
        sourceType: 'ticket',
      },
      {
        companyId: 'c-2',
        companyName: '合同会社フューチャー',
        meetingDate: '2026-04-15',
        quote: 'パイプラインのカンバンを開くと 10 秒ほど真っ白。タイムアウトも時々起きる。',
        meetingDocUrl: '/tickets/t-5',
        sourceType: 'ticket',
      },
    ],
  },
  {
    id: 'i-3',
    category: '問題',
    title: 'Slack 通知が届かない',
    evidence: [
      {
        companyId: 'c-1',
        companyName: '株式会社テクノリード',
        meetingDate: '2026-04-20',
        quote: '商談ステージ更新時の Slack 通知が、特定チャンネルだけ届かない。',
        meetingDocUrl: '/tickets/t-6',
        sourceType: 'ticket',
      },
      {
        companyId: 'c-5',
        companyName: '有限会社サクセス',
        meetingDate: '2026-04-10',
        quote: '担当者アサイン時のメンション通知が翌日にまとめて届く。',
        meetingDocUrl: '/tickets/t-7',
        sourceType: 'ticket',
      },
    ],
  },
  {
    id: 'i-4',
    category: '問題',
    title: 'CSV インポート時に文字化け',
    evidence: [
      {
        companyId: 'c-3',
        companyName: '株式会社イノベーション',
        meetingDate: '2026-04-05',
        quote: 'Shift-JIS で書き出した CSV を取り込むと半角カナだけ文字化けする。',
        meetingDocUrl: '/tickets/t-8',
        sourceType: 'ticket',
      },
    ],
  },
]
