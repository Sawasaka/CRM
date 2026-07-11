export type FDEAIArticle = {
  slug: string
  title: string
  shortTitle: string
  description: string
  source: string
  image: string
  color: string
  summary: string
  fdeView: string
  points: string[]
  keywords: string[]
  publishedAt: string
  updatedAt: string
  sourceUrls: Array<{
    label: string
    url: string
  }>
  sections: Array<{
    heading: string
    body: string[]
  }>
}

export const fdeAIArticles = [
  {
    slug: 'codex-sales-ops-case',
    title: 'Codexで『同種問い合わせ』を、営業実行タスクに変えた事例',
    shortTitle: 'Codexで営業タスク化',
    description:
      '同じような問い合わせを毎日手作業で処理していたチームが、Codexを使って返信文面と次アクションをセットで作る運用に変えた事例です。',
    source: '実務ケース / AI導入の現場',
    image: '/media/fde-ai-lab/tampa-sepsis-hub.svg',
    color: '#c8b9ff',
    summary:
      '価格確認・導入条件・更新情報の聞き取りなど、毎回発生する問合せをカテゴリ化し、営業がそのまま実行できるタスクとして提示するルートへ変更した結果、初動時間と品質のばらつきが安定しました。',
    fdeView:
      'FDE視点では、回答品質より先に「次に誰が何を決めるか」を固定します。AIは文章生成の補助としてではなく、営業の運用設計に接続されて初めて価値が立ちます。',
    points: ['同種問合せを分類する', '承認付き返信テンプレを固定する', '商談タスクへ即接続する'],
    keywords: ['Codex', '営業運用', '問い合わせ対応', 'FDE型導入', 'CRM'],
    publishedAt: '2026-07-05',
    updatedAt: '2026-07-05',
    sourceUrls: [
      {
        label: 'Codex活用ガイド（同種問合せ対応）',
        url: '/columns/codex-cloud-agent-ai-tips',
      },
      {
        label: '営業運用向けに返信設計を固定する実例',
        url: '/columns/codex-cloud-agent-ai-tips#section-1',
      },
      {
        label: '導線としてのCRM運用イメージ',
        url: '/lp#portfolio',
      },
    ],
    sections: [
      {
        heading: '現場で起きていた課題',
        body: [
          '1日の問合せで、価格・導入条件・期限確認が繰り返し発生し、担当者ごとに回答内容と精度が変わっていました。',
          '営業は提案準備に入る前に、確認漏れの有無や次打診日を決めるだけで時間を取られ、既存案件の進捗が詰まる状態でした。',
        ],
      },
      {
        heading: 'FDE型で実施した再設計',
        body: [
          '1) 問い合わせテンプレを「カテゴリ」「顧客ステータス」「必要確認項目」に固定。2) Codexには毎回同じ依頼型式で、返信候補・不足確認・次アクションを返すように設計。3) 結果はCRMのタスクに変換して、承認者へ共有。',
          'ここで重要なのは、AIが出した文面を鵜呑みに送るのではなく、承認ポイントを「価格」「期限」「決裁条件」に絞ってレビューし、誤送信リスクを抑えたことです。',
        ],
      },
      {
        heading: '営業・CSでそのまま使える再現手順',
        body: [
          'まずは最も多い問合せ3種類を選び、返答フォーマットを1週間だけ固定してください。',
          '次にCodexのテンプレートに「確認期限」「次アクション」「関連商談ID」を必須化し、CRM側で自動タスク化します。',
          '最後に週1レビューで誤分類と未回答を振り返る。ここまで回ると、担当者増減があっても運用の安定度が上がります。',
        ],
      },
    ],
  },
  {
    slug: 'claude-code-sales-ux-case',
    title: 'Claude Codeで商談画面を1画面ずつ磨き、引き継ぎと入力漏れを抑えた事例',
    shortTitle: 'Claude Codeで商談画面改善',
    description:
      '商談ノートの入力漏れ、引き継ぎ遅延、提案用語のばらつきを、画面改善の粒度を細かくしながら解消した実践例です。',
    source: '実務ケース / 業務改善',
    image: '/media/fde-ai-lab/nhs-fdp.svg',
    color: '#8dffc9',
    summary:
      '大きなDX計画の代わりに、商談画面の1画面改善を繰り返す設計を採用。まずは観測コストが小さい箇所を選び、改善効果を短いサイクルで検証しました。',
    fdeView:
      'FDEでは「一度に全部変える」より、評価しやすい1画面から進めるのが定着率を高めるコツです。Claude Codeは差分が小さいほど再現が早く、失敗時のロールバックも明確になります。',
    points: ['画面単位で改善する', '引き継ぎに耐える入力定義', '言い回しを営業標準に寄せる'],
    keywords: ['Claude Code', '商談画面', '引き継ぎ標準化', '入力漏れ対策', '運用改善'],
    publishedAt: '2026-07-05',
    updatedAt: '2026-07-05',
    sourceUrls: [
      {
        label: '1画面ずつ改善する運用手順',
        url: '/columns/claude-code-long-context-ai-tips#section-2',
      },
      {
        label: '価格説明テンプレの揺れを減らすポイント',
        url: '/columns/claude-code-long-context-ai-tips#section-3',
      },
      {
        label: 'Codex/Claudeの運用を揃える実務イメージ',
        url: '/columns/codex-cloud-agent-ai-tips',
      },
    ],
    sections: [
      {
        heading: '現場で見えた主な摩擦',
        body: [
          '営業ごとに商談ノートの構成が違い、翌営業が引き継ぎ時に「次の一手」をすぐ把握できない状態でした。',
          '入力項目が増えたまま保存フローが長く、必須項目の抜けがそのまま提案漏れにつながることもありました。',
        ],
      },
      {
        heading: '改善の進め方（FDEの実装プロトコル）',
        body: [
          '最初の1サイクルは入力画面のみを対象にし、必須フィールドと並び順だけを再設計。次に「引き継ぎ用の要約」「次アクション」の出力欄を追加し、2サイクル目で保存率を改善。',
          'Claude Codeには「1PR分」の小さな差分で変更してもらい、変更後はレビュー観点を数値化（保存率・入力漏れ率・再入力率）して比較しました。',
        ],
      },
      {
        heading: '誰でも回せるようにした運用',
        body: [
          '改善効果が出た項目はまず運用ルールを固定。承認条件、公開条件、ロールバック手順を明文化してから次の画面へ進みます。',
          'この手順で「実装速度が速い」より先に「失敗しても戻せる」状態をつくり、担当者不在時でも運用が止まりにくい構造にできます。',
        ],
      },
    ],
  },
  {
    slug: 'obsidian-sales-readiness-case',
    title: 'Obsidian × Notion × CRMをつなぎ、商談準備の抜け漏れを減らした事例',
    shortTitle: 'ナレッジ接続で失注を減らす',
    description:
      '顧客情報、商談メモ、提案履歴を知識基盤に揃えて、商談開始前に必要情報だけを引き出せるようにした営業の実務事例です。',
    source: '実務ケース / ナレッジ設計',
    image: '/media/fde-ai-lab/aip-bootcamp.svg',
    color: '#ffcf4a',
    summary:
      '商談前の確認漏れは「情報はあるが、必要な情報にたどり着けない」ことが起点です。Obsidianを含むナレッジ層に営業の意思決定ログを蓄積し、CRMと接続した運用に変えました。',
    fdeView:
      'FDE実装の価値は導線だけでなく、再利用できる知識構造を置くことです。ノート・議事録・提案文を同じ文脈で検索・引用できるようにすると、初回打合せの精度が上がります。',
    points: ['Obsidian基盤で情報を構造化', '提案前チェックリストを固定化', '商談前に要点を圧縮して提示'],
    keywords: ['Obsidian', 'Notion', 'CRM', '営業準備', 'ナレッジ運用'],
    publishedAt: '2026-07-05',
    updatedAt: '2026-07-05',
    sourceUrls: [
      {
        label: '実務で使えるFAQ×提案運用の整理',
        url: '/columns/codex-cloud-agent-ai-tips#section-2',
      },
      {
        label: '営業現場の画面改善と定例運用',
        url: '/columns/claude-code-long-context-ai-tips#section-1',
      },
      {
        label: '営業ノート基盤（FDE視点での設計例）',
        url: '/lp#portfolio',
      },
    ],
    sections: [
      {
        heading: '課題の起点は「情報が散っている」こと',
        body: [
          '案件ごとに議事録、商談ノート、価格シート、過去提案履歴が別々の場所に残り、打ち合わせ前の再検索コストが高くなっていました。',
          '結果として、同じ顧客に対して同じヒアリングを繰り返すか、確認忘れが起きやすくなり、意思決定までの時間が伸びていました。',
        ],
      },
      {
        heading: '実装したナレッジ導線',
        body: [
          'Obsidianで顧客別に「ユニットノート」を作り、Notionで実施ルール、CRMで進捗、必要ならCall AIのメモを紐づける構成に変更しました。',
          '商談開始前に、AIが過去情報を「商談の経緯」「意思決定者」「既知の制約」で3項目だけ提示するようにして、準備時間を短縮。',
        ],
      },
      {
        heading: '再現のコツ',
        body: [
          'まずは入力ルールを先に決めます。何を「事実」とし、何を「仮説」として扱うかを明文化しないと、後工程でノイズが増えます。',
          '週1で「未準備案件」を可視化し、準備不足が起きる条件を記事化して運用テンプレに戻す。これを3週間回すと、引継ぎ品質と提案安定度が同時に上がります。',
        ],
      },
    ],
  },
] satisfies FDEAIArticle[]

export function getFDEAIArticle(slug: string) {
  return fdeAIArticles.find((article) => article.slug === slug)
}
