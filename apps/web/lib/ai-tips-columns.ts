export type AITipsColumn = {
  slug: string
  category: string
  label: string
  genre: string
  title: string
  shortTitle: string
  description: string
  newsPublishedAt: string
  sourceName: string
  publishedAt: string
  updatedAt: string
  readingTime: string
  accent: string
  image: string
  keywords: string[]
  lead: string
  tips: string[]
  sections: {
    heading: string
    body: string[]
  }[]
  sourceUrls: {
    label: string
    url: string
  }[]
}

export const aiTipsColumns: AITipsColumn[] = [
  {
    slug: 'codex-cloud-agent-ai-tips',
    category: 'Codex',
    label: '実務事例 / 実践Tips',
    genre: '仕事効率化',
    title: '問い合わせは「FAQ化」より先に「業務タスク」に落とす。Codex実運用の進め方',
    shortTitle: 'Codexで営業運用を回す',
    description:
      '毎日来る重複問い合わせを、FAQの増減だけで終わらせずに営業・CSの実務タスクへ変換する。再現しやすい運用で、返信品質と初動速度を同時に上げる事例。',
    newsPublishedAt: '2026-07-05',
    sourceName: 'FDE AI/DX',
    publishedAt: '2026-07-05',
    updatedAt: '2026-07-05',
    readingTime: '4 min read',
    accent: '#abc7ff',
    image: '/media/fde-ai-dx/ai-owned-media-cursor-news.png',
    keywords: ['Codex', 'OpenAI', 'AIエージェント', '開発自動化', 'AI Tips', 'DX改善'],
    lead:
      'Codexの価値は生成結果の派手さではなく「業務の次アクションを早く作ること」。営業・CSの現場に合わせて、(1) 同種問い合わせ、(2) 停滞商談、(3) 提案文面の再現性、の3テーマを固定で回します。',
    tips: [
      '依頼書の最小フォーマットを決める：対象課題 / 顧客条件 / 想定アウトプット（返信文・確認項目・次アクション）',
      '1回の依頼は「調査 → 案A/B作成 → 重要観点レビュー → 最終反映」の4工程に固定する',
      '誤出力を減らすため、要件に「金額・期限・導入条件」の3観点を必須チェックにする',
      '日次レビューは、未処理/進行中/完了を表で可視化し、Codex実行ログを根拠付きで残す',
    ],
    sections: [
      {
        heading: '事例1：SaaS営業会社で同種問い合わせを“返答前提”に変えた例',
        body: [
          '入力条件：価格確認・試用手順・更新条件の3種が毎日同じ順で来る。対応がバラつき、担当交代後の品質差が顕在化。',
          '処理：同じ3種を「顧客ステータス」「過去の約束」「提案済み範囲」でタグ化してCodexに依頼。出力は「返信文案」「不足確認」「次の接触日」をセットで返却。',
          '運用：毎朝10分、30件のうち未定義分をCodex経由で分類・要約し、営業は承認→送信だけに集中。FAQは月1回見直し、更新条件だけを再発行する運用に寄せた。',
        ],
      },
      {
        heading: '事例2：商談の引き継ぎで提案着手が迷子になったケース',
        body: [
          '入力条件：営業ごとに商談ノートの順序が違い、次担当が「何を最初に言えばいいか」分からない。',
          '処理：最初の15分でCodexに「業界・提案フェーズ・意思決定者」をセットし、商談画面に貼る「次アクションカード」を作成。',
          '成果：担当引き継ぎ時の説明時間が短縮し、見込み案件の初動リードタイム（問い合わせ→提案提示）が一定化した。',
        ],
      },
      {
        heading: '事例3：失注しやすい商談を早く拾った現場',
        body: [
          '入力条件：14日以上動きがない商談、返信待ちが3日以上、意思決定者不明の状態が混在。',
          '処理：商談メモ、議事録、CRM接点を結合して「危険度スコア」を出すようCodexに依頼。営業は危険度が高い順に30分だけレビュー。',
          '成果：担当の優先順位が一元化され、引き継ぎ時の判断遅延が明確に減少。未返信の案件は即時フォローに移せるようになった。',
        ],
      },
      {
        heading: '現場導入で止まらないための4つの条件',
        body: [
          '「入力テンプレ」「実行基準」「ロールバック手順」を最初に固定すること。',
          '1回の依頼を小分けにすること。調査→提案→検証→反映を分離し、営業の本線作業を止めない。',
          '最終承認者は1人に絞る。代わりに観測ログは全員で見られるよう保存する。',
          '「週1回レビュー」を絶対設計にし、効果値（初動時間、再確認率、未返信件数）を次回に繋げる。',
        ],
      },
    ],
    sourceUrls: [
      {
        label: '現場で再現できる「同種問合せ対応」運用のフロー',
        url: '/columns/codex-cloud-agent-ai-tips#section-1',
      },
      {
        label: '商談引き継ぎのための提案テンプレ運用',
        url: '/columns/codex-cloud-agent-ai-tips#section-3',
      },
      {
        label: '失注リスク商談を拾うチェック体制',
        url: '/columns/codex-cloud-agent-ai-tips#section-4',
      },
      {
        label: 'FDE AI/DXサービス全体の導線と接続ポイント',
        url: '/lp',
      },
    ],
  },
  {
    slug: 'claude-code-long-context-ai-tips',
    category: 'Claude Code',
    label: '現場事例 / 改善運用',
    genre: '仕事効率化',
    title: '現場で回るClaude Code導線。1画面ずつ改善して摩擦を減らす実務例',
    shortTitle: 'Claude Codeで日次改善する',
    description:
      '一気に全体を変えるより、1画面ずつ改善したほうが実務定着が早い。商談運用・FAQ運用・提案文言を小さく回して、業務品質を落とさずに改善した実務例を解説する。',
    newsPublishedAt: '2026-07-05',
    sourceName: 'FDE AI/DX',
    publishedAt: '2026-07-05',
    updatedAt: '2026-07-05',
    readingTime: '3 min read',
    accent: '#8dffc9',
    image: '/media/fde-ai-dx/ai-owned-media-claude-code-news.png',
    keywords: ['Claude Code', 'Anthropic', 'Ramp', 'AI開発', 'CLI', '業務改善', 'AI Tips'],
    lead:
      'Claude Codeは広い改善を一度に抱えるより、画面や業務フローを1テーマずつ固定して検証する方が再現します。ここでは、営業が実際に扱う3つの接点（商談画面・FAQ・価格説明）を分けて回した事例です。',
    tips: [
      '依頼先は「画面1枚 + 変更理由 + 期待効果」をセットして小さくする。',
      '1PR分の差分で進め、テスト観点（保存率・表示率・入力漏れ）を必ず添える。',
      '失敗ケースを1つ以上定義し、戻せる条件を明文化して実行する。',
      '営業資料は生成後に1回の言い回しレビューを通し、担当の営業基準に合わせる。',
    ],
    sections: [
      {
        heading: '事例1：営業入力画面を減らしてミスを削ったケース',
        body: [
          '業務課題：商談ノートに項目が多すぎ、保存漏れと再入力漏れが頻発。',
          '対応：よく使う項目だけを残して表示順を再設計し、保存・再表示・要約の3つの操作を1画面で完結する状態に変更。',
          '成果：1画面の最適化だけで入力漏れの再発率が下がり、1週間あたりの再入力率が安定して低下。',
        ],
      },
      {
        heading: '事例2：FAQ更新を週次化して担当依存を減らしたケース',
        body: [
          '業務課題：FAQ更新が担当者任せで、公開まで時間がバラつく。',
          '対応：毎週「問い合わせTOP10」を抽出し、更新差分のテンプレを固定してClaude Codeに提案。公開/保留の基準をルール化。',
          '成果：担当交代があっても更新遅延が減り、公開判断の質が揃った。',
        ],
      },
      {
        heading: '事例3：価格説明の言い回しを固定して提案品質を揃えたケース',
        body: [
          '業務課題：担当者ごとに価格説明が変わり、顧客からの認識齟齬が起きやすい。',
          '対応：価格帯・導入条件・検証ステップを変数化し、案件属性差し替えだけで文面を出すテンプレート化。',
          '成果：引き継ぎ直後でも説明文の粒度が揃い、営業責任者の品質監査負荷を下げられた。',
        ],
      },
      {
        heading: '現場で再現しやすい運用条件',
        body: [
          '小さい画面から着手し、2〜3画面へ順次拡張。',
          '生成後は必ず検証観点を更新し、次回の作業に反映する。',
          '運用ルール（承認者・公開条件・ロールバック）を明文化し、毎週同じ会議で確認する。',
        ],
      },
    ],
    sourceUrls: [
      {
        label: '商談画面改善の実務プロセス（1画面ずつ）',
        url: '/columns/claude-code-long-context-ai-tips#section-2',
      },
      {
        label: 'FAQ更新の定例運用が回る実務ルール',
        url: '/columns/claude-code-long-context-ai-tips#section-4',
      },
      {
        label: '同一テーマでCodex運用を合わせる実務イメージ',
        url: '/columns/codex-cloud-agent-ai-tips',
      },
      {
        label: '営業導線（CRM / ナレッジ / Call AI）の接続ポイント',
        url: '/lp',
      },
    ],
  },
  {
    slug: 'ai-voice-assistant-multiple-tasks-trend-news',
    category: 'AI Trend',
    label: '3分要約 / 身近なAIニュース',
    genre: '生活AI',
    title: 'スマートスピーカーが進化。ひと声で買い物や予定登録まで',
    shortTitle: 'スマートスピーカーが用事を実行',
    description:
      'Alexa+などの音声AIが、買い物、メッセージ、配車、予定登録をまとめて進める方向へ進化しています。Google Homeなどのスマートスピーカーに慣れた人にも身近な変化を整理します。',
    newsPublishedAt: '2026-07-08',
    sourceName: 'Business Insider',
    publishedAt: '2026-07-09',
    updatedAt: '2026-07-09',
    readingTime: '3 min read',
    accent: '#abc7ff',
    image: '/media/fde-ai-dx/ai-trend-voice-assistant-tasks.png',
    keywords: ['スマートスピーカー', 'Alexa+', 'Google Home', 'AIアシスタント', '音声AI', '生活AI'],
    lead:
      '3行で言うと、スマートスピーカーは「天気を答える機械」から「複数の用事をまとめて進めるAI」へ変わりつつあります。家庭では買い物、家電操作、予定登録がつながり、仕事ではメールや日程調整を任せる使い方へ広がります。',
    tips: [
      '音声AIは単発回答ではなく、複数アプリをまたいだ実行役へ進化している。',
      '生活者にとっては、買い物、配車、予定登録、家電操作をひと声でまとめられる体験になる。',
      '企業利用では、CRM、カレンダー、メール、ナレッジをつなぐ権限設計と実行ログが重要になる。',
      'FDE AI/DXでは、社内AIアシスタントを作る前に、どの業務をAIに任せるかをルール化する必要がある。',
    ],
    sections: [
      {
        heading: 'まず、何が起きているのか',
        body: [
          'Business Insiderは、AmazonがAlexa+向けに複数ステップの作業をこなすエージェント型機能を準備していると報じています。ポイントは、音声AIが単に返答するだけでなく、外部サービスをまたいで作業を進める方向にあることです。',
          'たとえば、配車を手配する、メッセージを送る、買い物をする、カレンダーに予定を入れるといった複数のタスクが、1つの指示から連続して進む体験が想定されています。',
        ],
      },
      {
        heading: '生活ではどう変わるのか',
        body: [
          'これまでの音声アシスタントは、天気を聞く、音楽を流す、タイマーを設定するような単発操作が中心でした。次の段階では、「明日の準備をして」のような曖昧な依頼から、予定確認、買い物、通知、移動手配までつながる可能性があります。',
          '生活者にとっては、スマホ画面を何度も開いてアプリを切り替える手間が減ります。一方で、AIにどこまで操作権限を渡すか、誤操作時にどう止めるかが重要になります。',
        ],
      },
      {
        heading: '仕事ではどう使えるのか',
        body: [
          '仕事に置き換えると、AIアシスタントはメール作成、議事録整理、CRM更新、日程調整、社内ナレッジ検索を横断して進める存在になります。つまり、音声AIの進化は家庭だけでなく、業務フローの自動化にも直結します。',
          '営業現場なら「今日の商談準備をして」と言うだけで、顧客情報、過去議事録、提案資料、次アクションをまとめる導線が考えられます。',
        ],
      },
      {
        heading: '導入前に決めるべきルール',
        body: [
          'AIに複数タスクを任せるほど、権限、承認、ログ、失敗時の戻し方が重要になります。特に顧客連絡、金額提示、契約、外部送信は、人の確認をどこに挟むかを先に決めるべきです。',
          'FDE AI/DXでは、AIツールを入れるだけでなく、既存SaaSとAIをつなぐ前提として、どの情報を読み、どの操作を許可し、どこで人が承認するかを設計します。',
        ],
      },
    ],
    sourceUrls: [
      {
        label: 'Business Insider: Amazon Moonraker project for Alexa+ agentic tasks',
        url: 'https://www.businessinsider.com/amazon-moonraker-project-alexa-agentic-cost-2026-7',
      },
    ],
  },
  {
    slug: 'ai-shopping-agentic-commerce-trend-news',
    category: 'AI Trend',
    label: '3分要約 / 身近なAIニュース',
    genre: '生活AI',
    title: '検索しない買い物へ。AIが商品探しから注文まで手伝う時代',
    shortTitle: 'AIショッピング時代',
    description:
      'AIが商品検索、比較、注文、配送確認まで手伝う「エージェント型ショッピング」が広がっています。普段の買い物と、企業の営業・EC導線がどう変わるのかを整理します。',
    newsPublishedAt: '2026-07-03',
    sourceName: 'Economic Times',
    publishedAt: '2026-07-07',
    updatedAt: '2026-07-07',
    readingTime: '3 min read',
    accent: '#8dffc9',
    image: '/media/fde-ai-dx/ai-trend-shopping-assistant.png',
    keywords: ['AIショッピング', 'エージェントAI', 'EC', '購買体験', '生活AI', '業務効率化'],
    lead:
      '3行で言うと、買い物は「検索して選ぶ」から「条件を伝えてAIに探してもらう」方向へ進んでいます。AIは商品比較、在庫確認、配送、注文後の問い合わせまでつなげられるため、生活では時短、企業ではEC・営業・CS導線の再設計につながります。',
    tips: [
      '買い物AIは、商品検索だけでなく、比較、候補提案、カート投入、配送確認まで一連の流れを支援する。',
      '生活者にとっては「検索ワードを考える手間」が減り、希望条件を自然文で伝える買い方に近づく。',
      '企業側では、FAQ、商品マスタ、レビュー、在庫、問い合わせ履歴をAIが参照できる構造にする必要がある。',
      'FDE AI/DXでは、ECだけでなく営業資料請求、相談予約、CRM登録まで同じ考え方で導線化できる。',
    ],
    sections: [
      {
        heading: 'まず、何が起きているのか',
        body: [
          'AIショッピングは、ユーザーが商品名を検索して一覧から選ぶ体験を、AIに条件を伝えて候補を出してもらう体験へ変えます。欲しい条件、予算、用途、配送希望を伝えると、AIが候補を比較し、次の行動まで提案するイメージです。',
          '記事では、Amazon、Swiggy、Zeptoのような小売・配送サービスが、AIを使って検索、比較、注文、問い合わせまでの流れを短くする方向へ進んでいることが紹介されています。',
        ],
      },
      {
        heading: '生活ではどう変わるのか',
        body: [
          'たとえば「在宅ワーク用で、静かで、2万円以内のヘッドホンを探して」と伝えるだけで、AIが候補、比較ポイント、レビューの要点、配送タイミングまでまとめるようになります。',
          '買い物の主役が検索キーワードから会話に移るため、比較が苦手な人や、商品数が多すぎて選べない人にとって使いやすい体験になります。',
        ],
      },
      {
        heading: '企業側の実務にどうつながるのか',
        body: [
          '企業にとって重要なのは、AIに読ませる商品情報やFAQが整理されているかです。商品マスタ、料金表、在庫、配送条件、返品ルールがバラバラだと、AIは正しく案内できません。',
          'FDE AI/DXの文脈では、Obsidian、Notion、Google Workspace、CRMに散らばる情報を整え、AIが参照できる社内ナレッジや問い合わせ導線にすることが価値になります。',
        ],
      },
      {
        heading: '営業・マーケに置き換えると',
        body: [
          'AIショッピングの考え方は、営業やマーケにもそのまま応用できます。「資料請求した人に、次に何を案内すべきか」「どのプランが合いそうか」「日程調整までどう進めるか」をAIが補助する流れです。',
          'つまり、ECの買い物AIは、営業現場でいうAIアシスタント、FAQ、CRM、Call AI、商談アシストの設計にもつながります。',
        ],
      },
    ],
    sourceUrls: [
      {
        label: 'Economic Times: Shopping without searching - the agentic AI future',
        url: 'https://m.economictimes.com/magazines/panache/shopping-without-searching-the-agentic-ai-future-amazon-swiggy-and-zepto-are-building-in-india/articleshow/132137378.cms',
      },
    ],
  },
  {
    slug: 'ai-browser-assistant-trend-news',
    category: 'AI Trend',
    label: '3分要約 / 身近なAIニュース',
    genre: '生活AI',
    title: 'AIブラウザで、検索・予約・買い物がまとめて変わる',
    shortTitle: 'AIブラウザ時代',
    description:
      'ChatGPT AtlasなどのAIブラウザが、検索、ページ要約、買い物、予約、メール作成をどう変えるのかを、身近な使い方に絞って要約します。',
    newsPublishedAt: '2025-10-23',
    sourceName: 'The Verge',
    publishedAt: '2026-07-05',
    updatedAt: '2026-07-05',
    readingTime: '3 min read',
    accent: '#abc7ff',
    image: '/media/fde-ai-dx/ai-trend-browser-assistant.png',
    keywords: ['AIブラウザ', 'ChatGPT Atlas', 'AI検索', 'AIエージェント', '業務効率化'],
    lead:
      '3行で言うと、ブラウザの横にAIアシスタントが常駐し、検索、ページ要約、比較、予約まで手伝う流れが本格化しています。生活では買い物や旅行予約、仕事では調査やメール作成が変わります。ただし、便利になるほど閲覧履歴や個人情報の扱いも重要になります。',
    tips: [
      '検索だけでなく、比較、予約、要約までを1つの画面で済ませられるようになる。',
      '営業では、顧客サイト調査、競合比較、メール下書き、商談準備にそのまま使える。',
      '社内導入では、どのページ情報をAIに読ませてよいかを先に決める。',
      '個人情報や顧客情報を扱う場合は、履歴・メモリ・拡張機能の設定確認が必須。',
    ],
    sections: [
      {
        heading: 'まず、何が起きているのか',
        body: [
          'AIブラウザは、従来の「検索窓にキーワードを入れる」使い方から、ページを読みながらAIに質問したり、内容を要約したり、次の操作まで任せる使い方へ進んでいます。',
          'たとえば、商品比較、レストラン予約、メール要約、資料の読み込み、Webページの要点抽出など、毎日やっている作業がブラウザ内でつながっていきます。',
        ],
      },
      {
        heading: '仕事ではどう使えるのか',
        body: [
          '営業であれば、顧客サイトを見ながら「この会社に刺さりそうな提案軸を出して」と聞けます。マーケなら競合記事を要約し、CSならヘルプページを読みながら回答候補を作れます。',
          'FDE AI/DXの文脈では、AIブラウザは単なる検索ツールではなく、CRM、Notion、Obsidian、Google Workspaceをまたいで情報を整理する入り口になります。',
        ],
      },
      {
        heading: '導入時に気をつけること',
        body: [
          '便利さの裏側で、ブラウザは閲覧履歴、入力内容、ログイン中のページなどに近い位置にあります。AIに読ませてよい情報と、読ませてはいけない情報を先に分けることが重要です。',
          'まずは社内の公開情報、競合調査、記事要約のような低リスク領域から始め、顧客情報や契約情報はルール化してから扱うのが安全です。',
        ],
      },
    ],
    sourceUrls: [
      {
        label: 'The Verge: OpenAI launches ChatGPT Atlas AI browser',
        url: 'https://www.theverge.com/ai-artificial-intelligence/804931/openai-chatgpt-atlas-hands-on-google-search',
      },
    ],
  },
  {
    slug: 'fake-ai-extension-security-trend-news',
    category: 'AI Trend',
    label: '3分要約 / 身近なAIリスク',
    genre: 'セキュリティ',
    title: '偽AI拡張機能に注意。検索履歴や個人情報が狙われる',
    shortTitle: '偽AI拡張に注意',
    description:
      '便利そうなAI拡張機能を入れるだけで、検索履歴や入力内容が追跡されるリスクがあります。会社でAIを使う前に確認したいポイントをまとめます。',
    newsPublishedAt: '2026-07-02',
    sourceName: 'Tom’s Guide',
    publishedAt: '2026-07-05',
    updatedAt: '2026-07-05',
    readingTime: '3 min read',
    accent: '#ff8d7a',
    image: '/media/fde-ai-dx/ai-trend-fake-extension-security.png',
    keywords: ['AI拡張機能', 'Chrome拡張', 'セキュリティ', '検索履歴', '個人情報'],
    lead:
      '3行で言うと、人気AIツールに見せかけたブラウザ拡張が、検索履歴や入力内容を追跡するケースが出ています。個人利用なら検索履歴、会社利用なら顧客情報や社内資料がリスクになります。AI導入では、使うツールだけでなく拡張機能の管理も重要です。',
    tips: [
      'AI拡張機能は、名前が似ていても公式とは限らない。',
      'インストール前に、開発元、権限、レビュー、公式サイトからの導線を確認する。',
      '会社PCでは、許可されたAIツールと拡張機能だけを使うルールにする。',
      '顧客情報、メール、CRM画面にアクセスできる拡張は特に慎重に扱う。',
    ],
    sections: [
      {
        heading: 'まず、何が起きているのか',
        body: [
          '人気AIサービスに似せた偽のブラウザ拡張機能が、ユーザーの検索内容を追跡していたと報じられています。見た目は便利なAIツールでも、裏側でデータを外部へ送るケースがあります。',
          'AIツールが増えたことで、ユーザーは「便利そうだから入れる」という判断をしがちです。ここを狙って、AIっぽい名前の拡張機能が出てきています。',
        ],
      },
      {
        heading: 'なぜ身近な問題なのか',
        body: [
          '検索履歴には、悩み、業務内容、顧客名、競合調査、採用情報など、意外と多くの情報が含まれます。会社PCで使っている場合、個人の問題だけでは済みません。',
          '営業やCSでは、CRM、メール、Notion、Google Driveを開きながら作業するため、ブラウザ拡張の権限管理がそのまま情報管理につながります。',
        ],
      },
      {
        heading: '会社で決めておきたいルール',
        body: [
          'まず、公式提供のAIツールと、非公式拡張機能を分けること。次に、拡張機能のインストール権限を管理し、顧客情報に触れるブラウザでは不要な拡張を入れないことです。',
          'FDE AI/DXでは、AI活用の便利さだけでなく、現場で安全に使うためのツール選定、権限、運用ルールまでセットで設計します。',
        ],
      },
    ],
    sourceUrls: [
      {
        label: 'Tom’s Guide: Fake Perplexity AI Chrome extension tracked browser searches',
        url: 'https://www.tomsguide.com/ai/a-fake-perplexity-ai-chrome-extension-was-secretly-tracking-browser-searches-heres-how-to-check-if-you-installed-it',
      },
    ],
  },
]

export function getAITipsColumn(slug: string) {
  return aiTipsColumns.find((column) => column.slug === slug)
}
