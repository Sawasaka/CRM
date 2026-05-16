# HubSpot Benchmark Gap Analysis

作成日: 2026-05-09
対象: ClosePilot / BGM CRM current project

## 前提

この比較では、HubSpotを「CRM単体」ではなく、公式に提示されているCustomer Platform全体として見ています。HubSpotはMarketing Hub、Sales Hub、Service Hub、Content Hub、Data Hub、Commerce Hub、Smart CRM、Breezeを束ねた総合プラットフォームで、マーケティング、営業、CS、コンテンツ、データ管理、請求決済、AIエージェントまで広く持っています。

一方で、このプロジェクトは「優秀な営業マネージャーの判断ロジックを、システムに内包する」「設定不要で使えるプリセット型AI CRM」「入力コストゼロ」を中核にしたプロダクトです。したがって、HubSpotの全機能を埋めにいくより、営業実行と顧客の声の活用に絞って差別化するほうが勝ち筋が明確です。

## 現在できること

| 領域 | 現状 | HubSpotとの差分 |
|---|---|---|
| CRM基本データ | Organization / User / Company / Contact / Deal / Activity / Task / Pipeline のDB設計あり。Company / Deal / Ticketの一部APIも実装済み。 | HubSpotのSmart CRMほど柔軟なカスタムオブジェクト、重複検知、UI設定、権限統制、データ同期は未到達。 |
| パイプライン管理 | 取引一覧、パイプライン、取引詳細画面がある。ただし多くはモックデータ駆動。 | HubSpotの実運用レベルのパイプライン、予測、営業分析、ワークフロー統合には未到達。 |
| 企業DB / インテント | 企業マスター、法人番号、業種、拠点、部門、求人/ニュース等のIntentSignal設計と検索APIあり。既存ドキュメントでは上場企業DBや拠点/インテント運用の原価分析もある。 | HubSpotの一般的なCRMデータ管理とは方向性が違い、ここは独自の強み。特に日本企業DB・部門別インテントは差別化余地が大きい。 |
| リードスコアリング | LeadScore / LeadRank / ScoreEvent のDB設計、スコアリング設計ドキュメントあり。 | HubSpotは予測リードスコアリングを含む。こちらは透明なルール設計が強みだが、実データによる自動再計算・運用UIはまだ弱い。 |
| シーケンス/タスク | Sequence / SequenceStep / Task のDB設計、ランク別シーケンス設計あり。UIは自動化ページがあるがモック中心。 | HubSpotのSales sequences & automationの成熟度には未到達。プリセット型に振り切れば勝ち筋あり。 |
| Gmail / Calendar / Meet | Google OAuth、Gmail同期、Calendar同期、Meet議事録取り込み、メール送信/下書きAPIが実装されている。 | HubSpotのメール追跡、会議予約、営業活動ログ、ワークフロー連携ほど一体化していない。だが「Meet後にCRM自動入力」は強い独自体験になり得る。 |
| Slack / Google Chat / RAG | Slack OAuth、Slackイベント、Google Chatイベント、FAQ候補生成、Drive/RAG検索、引用付き回答の実装がある。 | HubSpotのService/Knowledge baseとは別方向。社内ナレッジ・顧客会話の自動FAQ化は差別化可能。ただしUIや権限、承認フローはまだ発展途上。 |
| チケット管理 | Ticket DB、一覧、詳細、作成、ステータス更新、Deal紐付けがある。実データがない場合はモックにフォールバック。 | HubSpot Service HubのHelp Desk、SLA、ルーティング、複数チケットパイプライン、顧客ポータル、オムニチャネル対応には未到達。 |
| メール配信 / 1st Party計測 | メール配信UI、Gmail送信API、Campaign / Link / ClickのDB設計、リンククリックAPIの足場あり。 | HubSpot Marketing Hubのフォーム、広告、セグメント、LP、マルチタッチアトリビューション、キャンペーン管理には大きな差。 |
| AIリサーチ | Research Chat、Research Briefモデル、企業文脈構築、Web検索連携の実装あり。 | HubSpot Breeze Prospecting/Data Agentに近い領域。日本企業DBと組み合わせれば、汎用AIより実用価値を出しやすい。 |
| ダッシュボード | Dashboard / Today / Pipeline report / Priority 等の画面があるが、モック・静的集計が多い。 | HubSpotのカスタムレポート、予測、マーケ/営業/CS横断分析には未到達。 |

## できていないこと

| HubSpotの領域 | HubSpotが持つもの | 現プロジェクトの不足 | 優先度 |
|---|---|---|---|
| Marketing Hub | フォーム、広告管理、セグメント、メールマーケ、キャンペーン、SEO、AEO、SNS管理、マーケ分析、アトリビューション。 | フォーム/LP/広告/SEO/SNS/本格セグメント/マルチタッチ分析が不足。メール配信とクリック計測の足場はあるが未成熟。 | 低-中。HubSpotと正面衝突しないほうがよい。 |
| Sales Hub | コンタクト/リード管理、メールトラッキング、シーケンス、自動化、予測、プレイブック、Sales Workspace、Power Dialer/Calling、CPQ連携。 | 実データ駆動の営業実行、予測、プレイブック、電話実装、商談作成から完了までの一貫したワークフローが不足。 | 高。ここが主戦場。 |
| Service Hub | Help Desk、オムニチャネル、Call tracking、SLA、顧客成功ワークスペース、フィードバック、ナレッジベース、ルーティング。 | チケットCRUDはあるが、SLA、問い合わせチャネル統合、顧客向けポータル、返信UI、CS分析、CSM運用が不足。 | 中。営業後の顧客の声をPDMに返す範囲に絞るなら重要。 |
| Content Hub | LP、Webサイト、ブログ、Podcast、Brand voice、Content remix、ゲート付きコンテンツ。 | CMS/LP/ブログ/コンテンツ運用はほぼなし。 | 低。作らない判断でよい。 |
| Data Hub / Operations | データ品質自動化、データスタジオ、データ共有、スケジュールワークフロー、重複検知、データ同期。 | 重複検知、データクレンジングUI、外部SaaS同期、監査、管理者向けデータ品質機能が不足。 | 中。HubSpot移行・企業DB品質のために最低限必要。 |
| Commerce Hub | 見積、請求、決済、電子署名、サブスク/請求自動化、QuickBooks連携。 | 見積/請求/決済/契約/電子署名なし。 | 低。初期は捨てるべき。 |
| Smart CRM Enterprise | カスタムデータモデル、カスタムオブジェクト、権限、チームガバナンス、機密データ、UI設定。 | Plan / UserRole はあるが、企業向けの詳細権限、監査ログ、フィールド権限、カスタムオブジェクトはなし。 | 中。BtoB導入時の最低限だけ後追い。 |
| Breeze AI | Assistant、Prospecting Agent、Customer Agent、Data Agent、Closing Agent、Custom assistants。 | 個別AI機能はあるが、横断エージェントとしての一貫性・ジョブ実行・監視・ユーザー許可設計が不足。 | 高。ただしHubSpotの汎用AIではなく、営業実行プリセットAIに絞る。 |
| Marketplace / Ecosystem | 多数の外部アプリ連携、開発者基盤、パートナー網。 | Google/Slack中心。Microsoft、Salesforce、HubSpot、kintone、Zapier等の連携は未整備。 | 中。移行・併用に必要なものだけ。 |
| Mobile / Operational Polish | モバイル、通知、権限、監査、オンボーディング、導入支援、ヘルプ。 | プロダクトとしての運用完成度、オンボーディング、エラー処理、デモ/本番データ境界が不足。 | 高。PoC販売には重要。 |

## 自分たちが勝てること

| 勝てる領域 | 理由 | 打ち出し方 |
|---|---|---|
| 設定不要の営業実行CRM | HubSpotは柔軟だが、運用設計が必要。こちらは営業の型をプロダクトに内包する思想が明確。 | 「CRMを作る」のではなく「次にやることが自動で決まる」。 |
| 日本企業DB + 部門別インテント | 企業マスター、拠点、部門、求人/ニュースのIntentSignalは独自資産化できる。 | 「登録済みリードを管理」ではなく「今アプローチすべき会社を出す」。 |
| Meet/Gmail/Slackからの入力ゼロ | 議事録、メール、チャットを自動でCRMに残す設計がある。 | 「入力しないCRM」。営業担当が更新しなくても案件が進む。 |
| 顧客の声から開発優先度へ | HubSpotはCS/Marketing/Salesを束ねるが、PDM優先度までプリセット化する訴求は弱い。 | 「営業・CSの声を、開発優先度と営業アプローチに変える」。 |
| 透明なスコアリング | HubSpotの予測AIは強いが、ブラックボックスに見えやすい。こちらは根拠開示をプロダクト思想にしている。 | 「なぜSランクか、なぜ次に電話か、理由が見える」。 |

## 勝ちにくいこと

| 領域 | 理由 | 方針 |
|---|---|---|
| 総合マーケティングスイート | HubSpotのMarketing Hubはフォーム、LP、広告、SEO、SNS、分析まで広すぎる。 | 初期はメール配信・リンク計測・リードソース分析までに止める。 |
| CMS / Webサイト制作 | Content Hubと真正面から競合すると開発量が大きすぎる。 | 作らない。LPやフォームは外部連携でよい。 |
| 決済 / 請求 / CPQ | Commerce Hub領域はCRMの主戦場から外れる。 | 作らない。必要ならStripe/CloudSign/会計SaaS連携。 |
| エンタープライズ権限・監査 | 大企業向け要件は重い。 | PoC/SMBでは最低限、導入先が増えたら段階強化。 |
| 汎用アプリマーケットプレイス | エコシステム構築は時間がかかる。 | Google/Slack/HubSpot/Salesforce/kintone移行など、売上に直結する連携だけ。 |

## 優先ロードマップ案

### P0: PoCで刺さる最小差別化

1. 実データ駆動のDeal / Company / Contact / Activityをつなぐ。
2. Gmail / Calendar / Meet同期を、取引詳細のタイムラインに完全接続する。
3. Meet議事録から10フィールド抽出し、AIバッジ・信頼度・更新履歴を表示する。
4. 「今日やること」を実タスク・期限・停滞案件から生成する。
5. 企業DBの部門別インテントから「今アプローチすべき企業」を出す。

### P1: HubSpotとの差別化を強くする

1. 透明なスコアリング根拠UIを実装する。
2. ランク別シーケンスを実データで起動し、Gmail送信/返信で自動消化する。
3. Slack/Google Chatの顧客会話からFAQ候補・チケット・開発優先度候補を作る。
4. Research BriefをDeal作成時に自動生成し、営業アプローチ仮説を表示する。
5. CSV/HubSpot/Salesforce/kintoneからの簡易移行導線を用意する。

### P2: HubSpotに寄せる最低限

1. ダッシュボードを実データ化する。
2. チケットにSLA、担当者、問い合わせ元、Deal/Company横断履歴を追加する。
3. メール配信の開封/クリック/返信をスコアリングへ接続する。
4. 権限、監査ログ、重複検知、データ品質チェックを追加する。
5. 外部連携はGoogle/Slackに加え、HubSpot/Salesforce/kintoneインポートを優先する。

## 結論

HubSpotをベンチマークにすると、総合機能では現時点で大きな差があります。特にMarketing Hub、Content Hub、Commerce Hub、Data Hub、エンタープライズ管理、Marketplaceは追いかけると開発範囲が膨らみます。

ただし、ClosePilot/BGM CRMには「設定不要」「入力コストゼロ」「営業実行の型」「日本企業DB/部門別インテント」「顧客の声を開発優先度に変える」というHubSpotとは違う勝ち筋があります。初期はHubSpot代替ではなく、HubSpotを使いこなせない小〜中規模BtoB企業に対して、営業マネージャーの代わりに実行を回すAI CRMとして出すのがよいです。

## 参照

- HubSpot product overview: https://www.hubspot.com/products/get-started
- HubSpot Sales Hub: https://www.hubspot.com/products/sales
- HubSpot Service Hub: https://www.hubspot.com/products/service
- HubSpot Marketing Hub: https://www.hubspot.com/products/marketing
- HubSpot Product and Services Catalog: https://legal.hubspot.com/hubspot-product-and-services-catalog
- Local scope: `docs/phase1_scope_final.md`
- Local philosophy: `docs/product_philosophy.md`
- Local schema: `packages/db/prisma/schema.prisma`
- Local app navigation: `apps/web/components/layout/sidebar.tsx`
