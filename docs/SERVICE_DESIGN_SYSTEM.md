# ルキスマCRM Service Design System

## 目的

このドキュメントは、HPで確立しているデザインコンセプトを、ログイン後のサービス画面へ再現可能な形で展開するための定義です。

サービス側のデザインは、HPを最優先の正として運用します。このドキュメントはHPのデザインを置き換えるものではなく、HPの世界観を業務UIへ翻訳するための実装ガイドです。

各ページは個別に派手さを足すのではなく、同じ世界観の中で情報密度と操作性を最適化します。

## 参照優先順位

サービス側のデザイン更新では、以下の順番で判断します。

1. `docs/DESIGN.md`  
   HP / ブランド全体のCreative North Star。最上位の判断基準。
2. 実際のHP実装  
   `apps/web/components/landing/` と `apps/web/app/lp/`。色、余白、ガラス感、モーションの現物基準。
3. `docs/SERVICE_DESIGN_SYSTEM.md`  
   サービス画面へ翻訳した実装ルール。日々のプロダクト画面更新ではここを主に参照する。
4. 既存の良いサービス画面  
   Homeチャット、290万社DB、整備済みのパイプライン。サービス内の実例として参照する。
5. `apps/web/app/globals.css` / 共通コンポーネント  
   実装上のtoken、utility、再利用部品。

矛盾した場合は、HP側のデザイン思想を優先します。サービス側で必要な調整がある場合は、HPの世界観を崩さない範囲で業務UI向けに強度を下げて適用します。

## 運用ルール

### HP / LP を更新する場合

- `docs/DESIGN.md` をPrimary referenceにする
- `SERVICE_DESIGN_SYSTEM.md` は参照しないか、サービス展開時の影響確認だけに使う
- 余白、演出、Hero、Particle、Nebulaなどの表現はHP側でのみ最大強度を許可する

### サービス画面を更新する場合

- `SERVICE_DESIGN_SYSTEM.md` をPrimary referenceにする
- ただし、色・トーン・世界観で迷ったら `docs/DESIGN.md` とHP実装を優先する
- テキスト、レイアウト、配置は原則維持し、見た目だけをHPトンマナへ寄せる
- 1ページ更新ごとに Home / HP / 290万社DB と並べて違和感を確認する

### 新しいデザインパターンを作る場合

- まずHPまたは既存サービス画面に近いパターンがないか確認する
- 新色、新カード、新ボタンを安易に増やさない
- どうしても必要な場合は、HPの色・面・光のルールから派生させる
- 実装後に、このドキュメントへ「再現可能な型」として追記する

## コンセプト定義

### Photon Drift / Enterprise AI Glass

法人向けAI CRMの信頼感を保ちながら、暗い空間に淡い光が漂うような未来感を表現するデザイン。

サイバーパンクのような強いネオンや雑多な情報量ではなく、静かで高級感のあるAIオペレーション画面を目指す。

HPの `Liquid Obsidian` をサービス側へ翻訳したものが、この `Photon Drift / Enterprise AI Glass` です。サービス画面はHPよりも情報密度が高いため、演出は抑制しますが、色・光・質感・余白の思想はHPに合わせます。

近いジャンル:

- Dark Futurism
- Enterprise Futurism
- Ambient AI UI
- Glassmorphism
- Command Center UI
- Cyberpunk Lite

避けるジャンル:

- ネオン過多のサイバーパンク
- ゲームUIに寄りすぎた派手な発光
- 一般的なSaaS管理画面のフラットグレー
- 単色青だけで構成された退屈なダークUI

## デザイン原則

### 1. Dark First

画面の主役は黒ではなく、深いオブシディアン系の面。

背景、カード、フローティングUIを4段階の暗い面で作り、白線ではなく面の差と光で階層を表現する。

### 2. Blue Intelligence

ブランドの知性・AI感・主要操作は青で統一する。

ページタイトル、ロゴ、主要ボタン、選択状態、フォーカス状態は、白から淡青、ブランド青へ流れるグラデーションを基本にする。

### 3. Ambient Signal

ステータスカラーは、面全体を塗らず、小さな発光・ドット・バッジ・左エッジで表現する。

色は情報の意味を伝えるために使う。装飾のために色面を増やさない。

### 4. Glass, Not Border

カードやツールバーはガラス質にする。

通常の1px solid borderで囲うのではなく、内側のハイライト、薄いrim、背景の透過、blurで輪郭を出す。

### 5. Dense But Calm

サービス画面は業務ツールなので、LPのような大きな余白だけに寄せない。

ただし情報を詰める場合も、行間、面の階層、淡いアクセントで読みやすさを保つ。

## カラートークン

### Surface

| 用途 | Token | Hex |
| --- | --- | --- |
| 最深背景 | `--color-void` | `#0a0a0c` |
| ベース背景 | `--color-obsidian` | `#131315` |
| 大きなブロック | `--color-pitch` | `#1b1b1d` |
| カード / コンテナ | `--color-dusk` | `#242426` |
| フローティングUI | `--color-shimmer` | `#353437` |

### Text

| 用途 | Token | Hex |
| --- | --- | --- |
| メインテキスト | `--color-obs-text` | `#e4e2e4` |
| サブテキスト | `--color-obs-text-muted` | `#8f8c90` |
| 補助テキスト | `--color-obs-text-subtle` | `#5d5a5f` |
| Primary上の文字 | `--color-obs-on-primary` | `#fcfbff` |

### Brand / Signal

| 用途 | Token | Hex |
| --- | --- | --- |
| ブランド淡青 | `--color-aurora` | `#abc7ff` |
| ブランド青 | `--color-photon` | `#0071e3` |
| 成功 / AI / 接続 | `--color-mint` | `#8dffc9` |
| 補助パープル | `--color-lilac` | `#c8b9ff` |
| 注意 / 中間 | `--color-amber` | `#ffcf4a` |
| 強調ピンク | `--color-coral` | `#ff8dcf` |
| シアン | `--color-cyan` | `#7ec6ff` |

## 再現可能な型

### Page Shell

ページ全体は `#131315` をベースに、薄い青のradial glowを1〜3箇所だけ重ねる。

推奨:

```css
background-color: #131315;
background-image:
  radial-gradient(circle at 50% 20%, rgba(171,199,255,0.06) 0%, transparent 45%),
  radial-gradient(circle at 20% 80%, rgba(0,113,227,0.04) 0%, transparent 50%);
```

使いどころ:

- 290万社DB
- パイプライン
- コンタクト
- 取引
- タスク一覧
- アクションボード

### Page Title

ページタイトルはHP Heroの大見出しをサービス側へ翻訳したものを基本にする。サービス画面では、タスク一覧の見出しと同じく、本文を白、意味のある語尾だけを淡青からブランド青のグラデーションにする。

短い日本語タイトルでは全面グラデーションだと差が見えにくいため、`titleAccent` でアクセント語尾を指定する。

```css
color: #e7e5ea;
font-family: var(--font-display);
font-weight: 700;
letter-spacing: -0.025em;
line-height: 1.08;
```

Accent:

```css
background: linear-gradient(120deg, #ffffff 0%, #abc7ff 45%, #0071e3 100%);
-webkit-background-clip: text;
background-clip: text;
-webkit-text-fill-color: transparent;
```

ルール:

- 大見出しのみ使用する
- テーブル内やカード内の小見出しには使わない
- サービス画面でもページタイトルはHP Hero / Home / タスク一覧のトーンに揃える
- サイズはサービス共通で統一する: `text-[2rem] sm:text-[2.75rem] md:text-[3.55rem]`
- ただしHPの余白や演出はそのまま持ち込まず、ページ上部の業務導線は維持する
- 共通ページは `ObsPageShell` と `ObsHero` を使い、ページごとに見出し色を変えない
- タイトル下の説明文は1行で要点をまとめる。データ件数、対象、管理軸、得られる価値を短く書く

### Eyebrow

タイトル上の小さな英字ラベル。

```css
color: #abc7ff;
letter-spacing: 0.14em;
text-transform: uppercase;
```

左に小さな発光ドットを置く。

```css
background: #abc7ff;
box-shadow: 0 0 10px #abc7ff;
```

ルール:

- `ObsHero` の eyebrow は全ページで同じ表現にする
- ページごとにグレー、青、白などを使い分けない
- 英字ラベルの大きさ、letter-spacing、発光ドットは固定する

### Primary Button

主要アクションはHPの「無料デモ」ボタンと同系統にする。

```css
background: linear-gradient(135deg, #8fb0e8, #1e6fcc);
color: #0a0a0c;
box-shadow:
  inset 0 1px 0 rgba(255,255,255,0.22),
  0 0 0 1px rgba(171,199,255,0.16),
  0 4px 14px -4px rgba(0,113,227,0.30);
```

ルール:

- 作成、追加、送信、完了などの主要操作に使う
- 1画面に強いPrimaryは1〜2個まで
- 角丸は `8px` から `12px`
- 大きなカード全体を青くしない

### Secondary Button / Filter

検索条件、タブ、フィルター、補助操作は暗いガラス面にする。

```css
background: rgba(171,199,255,0.08);
color: #cfdcff;
box-shadow: inset 0 0 0 1px rgba(171,199,255,0.24);
```

Active状態:

```css
background: linear-gradient(140deg, rgba(171,199,255,0.18), rgba(0,113,227,0.24));
color: #fcfbff;
box-shadow:
  inset 1px 1px 0 rgba(255,255,255,0.14),
  inset 0 0 0 1px rgba(171,199,255,0.30),
  0 0 18px rgba(171,199,255,0.16);
```

### Glass Card

標準カード。

```css
background: linear-gradient(145deg, rgba(38,39,44,0.78) 0%, rgba(27,28,33,0.92) 46%, rgba(18,19,23,0.96) 100%);
backdrop-filter: blur(22px) saturate(135%);
box-shadow:
  inset 0 0 0 1px rgba(171,199,255,0.13),
  inset 1px 1px 0 rgba(255,255,255,0.06),
  inset -1px -1px 0 rgba(0,0,0,0.28),
  0 18px 48px rgba(0,0,0,0.28);
```

アクセントが必要な場合は、面全体を塗らず左エッジだけ色を出す。

```css
box-shadow:
  inset 2px 0 0 var(--accent),
  inset 0 0 0 1px rgba(171,199,255,0.11),
  0 16px 42px rgba(0,0,0,0.27);
```

### Table

業務データの一覧は、暗い面に薄い行区切りを使う。

```css
background: linear-gradient(145deg, rgba(33,34,39,0.78) 0%, rgba(22,23,27,0.94) 100%);
box-shadow:
  inset 0 0 0 1px rgba(171,199,255,0.11),
  inset 1px 1px 0 rgba(255,255,255,0.045),
  0 18px 46px rgba(0,0,0,0.26);
```

行区切り:

```css
border-top: 1px solid rgba(171,199,255,0.08);
```

ヘッダー:

```css
background: linear-gradient(90deg, rgba(171,199,255,0.060) 0%, rgba(171,199,255,0.020) 100%);
color: rgba(217,226,255,0.44);
font-size: 11px;
font-weight: 500;
letter-spacing: 0.10em;
text-transform: uppercase;
```

テーブルヘッダーは全列でこの指定をデフォルトにする。特定列だけ色・サイズ・太さを変えない。ソート可能列はアイコンとhover時の明度だけで状態を表現する。

### Badge

ステータスは小さく、意味ごとに色を固定する。

| 意味 | 色 |
| --- | --- |
| Hot / 危険 / 緊急 | `#ff6b6b` |
| Middle / 注意 / 進行中 | `#ffcf4a` or `#ffb86b` |
| Low / 通常 / 情報 | `#7ec6ff` or `#abc7ff` |
| Success / 接続済み / 完了 | `#8dffc9` |
| Knowledge / 補助 | `#c8b9ff` |
| Support / 強調 | `#ff8dcf` |

推奨:

```css
background: rgba(171,199,255,0.10);
color: #abc7ff;
box-shadow: inset 0 0 0 1px rgba(171,199,255,0.20);
```

中に小さな発光ドットを入れる。

### Inputs

検索・textarea・入力欄は、カードより一段深い面にする。

```css
background: linear-gradient(180deg, rgba(20,21,25,0.78) 0%, rgba(15,16,20,0.88) 100%);
color: #e7e5ea;
box-shadow:
  inset 0 0 0 1px rgba(171,199,255,0.16),
  inset 1px 1px 0 rgba(255,255,255,0.035);
```

Focus:

```css
box-shadow:
  inset 0 0 0 1px rgba(171,199,255,0.45),
  0 0 0 4px rgba(171,199,255,0.10);
```

### App Sidebar / Global Navigation

左サイドバーはサービス全体の背骨なので、ページや機能ごとにデザインを変えない。

テキスト内容や項目順は情報設計として扱い、見た目は以下の共通ルールに固定する。

```css
background:
  radial-gradient(circle at 18% 8%, rgba(171,199,255,0.070) 0%, transparent 30%),
  radial-gradient(circle at 70% 0%, rgba(0,113,227,0.045) 0%, transparent 32%),
  linear-gradient(180deg, rgba(10,10,12,0.92) 0%, rgba(10,10,12,0.86) 45%, rgba(8,8,10,0.94) 100%);
box-shadow:
  inset -1px 0 0 rgba(171,199,255,0.12),
  16px 0 48px rgba(0,0,0,0.18);
```

ナビ項目の文字は全項目で統一する。

```css
font-size: 13px;
font-weight: 500;
color: rgba(231,229,234,0.92);
opacity: 1;
```

Active状態は、文字を大きくしたり太くしたりせず、背景・左エッジ・ドットの発光で表現する。

```css
background: linear-gradient(135deg, rgba(171,199,255,0.135) 0%, rgba(0,113,227,0.145) 100%);
box-shadow:
  inset 2px 0 0 rgba(171,199,255,0.78),
  inset 1px 1px 0 rgba(255,255,255,0.075),
  inset 0 0 0 1px rgba(171,199,255,0.22),
  0 0 18px rgba(171,199,255,0.10);
```

機能ごとの色は、大きな背景色ではなく小さな発光ドットに限定する。

ルール:

- サイドバーの各項目で、文字サイズ・太さ・色を変えない
- Active状態は青いglass pill + 左エッジで統一する
- 個別色はドットだけに使い、背景やテキストには広げない
- サイドバー背景はHome / 290万社DB / パイプラインと同じ `Obsidian + blue ambient glow` 系にする
- 新しいページを追加しても、サイドバー項目のデザインは増やさない

## ページ別の適用方針

### 290万社DB

基準ページ。タイトル、フィルター、テーブル、求人インテントバッジのトーンを他ページへ展開する。

主役:

- 白ベース + 青アクセントのページタイトル
- Blue primary button
- Dark glass table
- Hot/Mid/Low signal badge

### パイプライン

290万社DBより少しだけ色のバリエーションを許可する。

ただし、カンバンカード全体を派手に塗らず、ステージヘッダー、左エッジ、バッジ、ゲージで色を出す。

推奨フェーズ色:

- 受注前: `#7ec6ff` / `#abc7ff`
- 受注: `#8dffc9`
- 受注後の失注・チャーン・ロスト: `#ff6b6b`

### コンタクト

290万社DBと同じテーブルデザインを基本にする。

コンタクトは人の情報なので、丸いアバター、ステータスバッジ、Next Actionのチップで柔らかさを出す。

### タスク一覧

タイトルは白ベース + 青アクセントの基準例。完了ボタンはPrimary Buttonを小さく適用する。

タスクの優先度や担当者はBadgeルールに従う。

## Do / Don't

### Do

- HP由来の青アクセントをページタイトルの語尾へ使う
- 青を主要操作・選択状態・知性の表現に使う
- 色は小さなシグナルとして使う
- カードはglass + rim + subtle glowにする
- テーブルは暗い面と薄い行区切りで構成する
- 発光は淡く、余白は静かに保つ

### Don't

- 画面全体を青や紫のグラデーションで塗らない
- 原色ネオンを大面積で使わない
- 全ページで違う色の思想を持たせない
- カードの中にカードを重ねすぎない
- 太い枠線でUIを囲わない
- HPの装飾表現をそのまま業務画面に過剰移植しない

## 実装時の判断基準

ページを更新するときは、以下の順で判断する。

1. HPの `Liquid Obsidian` の世界観から外れていないか
2. タイトルは白ベース + 青アクセントの共通型になっているか
3. PrimaryボタンはHPの青いCTAと同じ方向になっているか
4. 背景は `#131315` ベースで、淡い青の光だけが入っているか
5. カード/テーブルはglass surfaceになっているか
6. ステータス色は意味に紐づいているか
7. 色が大きな面積を取りすぎていないか
8. Home / HP / 290万社DB と並べて違和感がないか

## ページリニューアル手順

サービス画面をリニューアルするときは、毎回この順番で進める。

1. 対象ページのテキスト、レイアウト、配置を固定する
2. `docs/DESIGN.md` とHP実装から、今回使う色・面・光の強度を決める
3. `SERVICE_DESIGN_SYSTEM.md` の Page Shell / Title / Button / Card / Table / Badge / Input の型へ置き換える
4. 新しい装飾を作る前に `fo-*` utility と既存コンポーネントで代替する
5. 画面内のPrimary actionを1〜2個に絞る
6. ステータス色は意味に紐づけ、装飾目的の色を増やさない
7. ブラウザで Home / HP / 290万社DB と見比べる
8. 良い新パターンができたら、このドキュメントへ追記する

## 一言での定義

ルキスマCRMのサービス画面は、HPの Photon Drift を業務UIに翻訳した **Enterprise AI Glass UI** とする。

暗いオブシディアンの面、淡い青い知性、ガラス質のカード、小さな発光シグナルで、法人向けAI CRMの高級感と操作性を両立する。

---

# Part II. 実装リファレンス (HP 由来パターン)

ここから先は、サービス画面実装時に「HPと同じデザイン」を再現するための具体的なリファレンス。
`apps/web/components/landing/` で確立されたパターンを、コピー可能な形でまとめる。

> サービス画面で新規ページを作るときは、独自の装飾を作る前にまずこの章を参照する。

## 11. CSS Utility Class Reference (`fo-*`)

`apps/web/app/globals.css` で定義された Photon Drift ユーティリティ群。
HP / サービス両方から参照可能。新規ユーティリティを追加する前に、既存で代替できないかをここで確認する。

### グラデーション系

| クラス | 内容 | 推奨用途 |
| --- | --- | --- |
| `.fo-gradient-text` | 白 → `#abc7ff` → `#0071e3` の 120deg 線形グラデで text-fill | サービスページタイトルのアクセント語尾 / HP Hero 大見出し |
| `.fo-gradient-text-soft` | 白 → `#c8b9ff` → `#abc7ff` の柔らかいグラデ | 見出し2行目、副題、控えめな強調 |

ルール:

- 同一画面で `.fo-gradient-text` は **1〜2 箇所まで**。多用すると Editorial Anchor の品位が落ちる
- 装飾用の小さなテキスト (Body, Label) には絶対に使わない

### ガラス面

| クラス | 内容 | 推奨用途 |
| --- | --- | --- |
| `.fo-glass` | `rgba(53,52,55,0.55)` + `backdrop-blur(28px) saturate(140%)` | 通常時のフローティング Nav、Tooltip、軽量モーダル |
| `.fo-glass-strong` | `rgba(27,27,29,0.72)` + `backdrop-blur(32px) saturate(140%)` | スクロール後 Nav、強い分離が必要なオーバーレイ |
| `.fo-glass-rim` | `inset 1px 1px 0 rgba(171,199,255,0.10)` + 内側影 | **全カードに必須**。ガラス質の輪郭表現 |

ルール:

- `bg-dusk` + `fo-glass-rim` が標準カードの基底セット
- `fo-glass` 系は半透明前提のため、背後に内容がない単独表示には使わない

### モーション

| クラス | 周期 | 推奨用途 |
| --- | --- | --- |
| `.fo-lift` | hover 400ms | カードのホバー演出 (translateY -2px + 内側 aurora 発光) |
| `.fo-drift` | 9s ループ | ParticleField のパーティクル単体 |
| `.fo-orb-drift` | 7s ループ | Orb の浮遊感 |
| `.fo-orb-active` | 1.4s パルス | 選択中の Orb (orbColor を CSS var で受け取る) |
| `.fo-aurora-ribbon` | 14s ループ | NebulaBG 内の大型 aurora リボン |
| `.fo-word-in` | 600ms 1回 | 文字入場 (stagger と併用) |
| `.fo-halo` | 5s ループ | 入力欄周りのハロー (フォーカス強調) |
| `.fo-line-pulse` | 6s ループ | DB Constellation の線パルス |
| `.fo-chip-shimmer` | hover 1.6s | チップ hover 時の左右シマー |
| `.fo-cursor-blink` | 1.06s 点滅 | チャット入力風カーソル |
| `.fo-skeleton` | 1.8s ループ | ロード placeholder の aurora shimmer |

ルール:

- アニメーション系は `@media (prefers-reduced-motion: reduce)` で自動無効化される設計。新規追加時も同じ配慮を入れる
- `fo-aurora-ribbon` / `fo-drift` / `ParticleField` はサービス画面では使わない (HP 専用)

### スクロール / その他

| クラス | 内容 | 推奨用途 |
| --- | --- | --- |
| `.fo-thin-scroll` | 6px 幅、aurora 18% の細スクロールバー | カード内スクロール領域、横スクロールテーブル |
| `.fo-tilt-1400` | `perspective(1400px) rotateX(6) rotateY(-4)` | HP デモ画像の傾き演出 (サービス画面では使わない) |
| `.fo-recharts` | Recharts のテキスト・軸の統一スタイル | グラフを描画する全コンポーネント |

---

## 12. Typography Scale

LP で頻出する組み合わせ。同じ目的なら同じ組み合わせを使い、ad-hoc な `text-[Xpx]` を量産しない。

### Display / Headline (Plus Jakarta Sans)

| 用途 | サイズ (mobile / desktop) | weight | letter-spacing | LP 該当例 |
| --- | --- | --- | --- | --- |
| Hero タイトル (HP基準) | `text-[2.1rem] sm:text-[2.9rem] md:text-[3.8rem]` | `font-bold` | `tracking-[-0.025em]` | HP Hero |
| セクション H2 | `text-[2.2rem] md:text-[3rem]` | `font-bold` | `tracking-[-0.025em]` | Pricing, ROI |
| セクション H2 (中) | `text-[1.8rem] md:text-[2.6rem]` | `font-bold` | `tracking-[-0.025em]` | MetricsBand |
| カード内見出し (Featured) | `text-[2rem] md:text-[2.6rem]` | `font-bold` | `tracking-[-0.01em]` | SixPillars featured |
| カード内見出し (通常) | `text-[1.35rem]` | `font-bold` | `tracking-[-0.01em]` | SixPillars |
| 主要数値 | `text-[2.6rem] md:text-[3.4rem]` | `font-bold` | `tracking-normal` | MetricsBand stats |
| ページタイトル (サービス) | `text-[2rem] sm:text-[2.75rem] md:text-[3.55rem]` | `font-bold` | `tracking-[-0.025em]` | サービス画面共通 |

### Body (Inter)

| 用途 | サイズ | weight | 色 |
| --- | --- | --- | --- |
| 本文 (記事的) | `text-[1rem] md:text-[1.05rem]` | normal | `#c7c5c9` |
| 本文 (補助) | `text-[12px]` | normal | `#9b99a0` |
| 行内ラベル (主役) | `text-[12.5px]` | `font-semibold` | `#e7e5ea` |
| メタ補助 | `text-[10.5px]` | normal | `#7e7c83` |
| 数値 (右寄せ表示) | `text-[14px]` font-display | `font-bold` | `tabular-nums` + `fo-gradient-text-soft` |

### Eyebrow / Tag

| 用途 | サイズ | tracking | uppercase | LP 該当例 |
| --- | --- | --- | --- | --- |
| Section Eyebrow (主) | `text-[0.72rem]` | `tracking-[0.14em]` | ◯ | `<Eyebrow color="#abc7ff">ROI</Eyebrow>` |
| Section 内サブラベル | `text-[10.5px]` | `tracking-[0.16em]` | ◯ | クレジット消費の目安 |
| インライン タグ | `text-[10px]` | `tracking-[0.10em]` | ◯ | 提供 / 設立 / 拠点 等 |
| 微小キャップ | `text-[9.5px]` | `tracking-[0.20em]` | ◯ | プラン別 月間取得目安 |

### 文字色レンジ (`on-surface`)

| 役割 | Hex | 用途 |
| --- | --- | --- |
| Primary text | `#e7e5ea` | 主要ラベル・見出し本文 |
| Body text | `#c7c5c9` | 段落本文 |
| Muted | `#9b99a0` | 補助本文・サブ見出し |
| Subtle | `#7e7c83` | メタ情報・eyebrow |
| Whisper | `#5d5a5f` | プレースホルダー・ほぼ消える情報 |

> グローバル CSS の `--color-obs-text` (`#e4e2e4`) はベーステキスト。上記は LP 内で固有に多用されている派生値。
> 単に「白っぽい」「グレー」と書かず、必ずこのスケールから選ぶ。

---

## 13. Card Recipes

LP で使用している3種類のカード型。サービス画面の「カード/コンテナ」はこのいずれかを基底とする。

### Recipe A: Standard Glass Card (汎用)

最も使用頻度が高い。情報グループの基本コンテナ。

```jsx
<div className="rounded-3xl bg-dusk p-7 fo-glass-rim relative overflow-hidden">
  {/* content */}
</div>
```

選択基準:

- 角丸 `rounded-3xl` (1.5rem)
- 背景 `bg-dusk` (`#242426`)
- 内側 rim は `fo-glass-rim` (aurora 10%)
- ホバー演出を加える場合 `fo-lift` を追加

LP 該当: Pricing tier カード、ROI 比較カード、SixPillars カード、FAQ カード

サービス画面での応用: テーブルラッパー、設定パネル、ダッシュボードウィジェット

### Recipe B: Gradient Rim Card (Featured / 強調)

ブランドエッジを纏った 1.5px のグラデーションフレームを持つ強調カード。

```jsx
<div
  className="rounded-3xl p-[1.5px]"
  style={{
    background:
      'linear-gradient(135deg, rgba(171,199,255,0.50), rgba(0,113,227,0.32), transparent 70%)',
  }}
>
  <div className="rounded-[22px] bg-dusk p-7 fo-glass-rim relative overflow-hidden">
    {/* ambient glow inside */}
    <div
      className="absolute -top-24 -right-20 w-60 h-60 rounded-full pointer-events-none"
      style={{
        background:
          'radial-gradient(circle, rgba(171,199,255,0.18), transparent 60%)',
        filter: 'blur(40px)',
      }}
    />
    {/* content */}
  </div>
</div>
```

選択基準:

- 並列に置いた中で「主役」を1つ作りたいとき
- featured の場合 outer background は色強度を上げる (例: `rgba(255,193,7,0.80)` → ゴールド rim)
- ambient glow を1〜2箇所重ねるとアクセントが強まる

LP 該当: Pricing 営業責任者 tier、CustomerVoice 中央 CTA カード

サービス画面での応用: 「次にやるべきタスク」推奨アクションカード、課金 CTA モーダル

### Recipe C: Flat Subtle Container (情報密度型)

サービス画面・業務コンテナ向け。背景の塗り分けだけで階層を作る no-line 表現。

```jsx
<div
  className="rounded-2xl px-5 py-6 md:px-6 md:py-7"
  style={{
    background: 'rgba(171,199,255,0.04)',
    boxShadow: 'inset 0 0 0 1px rgba(171,199,255,0.10)',
  }}
>
  {/* content */}
</div>
```

選択基準:

- カード密度を高く保ちたい
- 親カード内でさらに別の情報グループを作りたい
- 「目立たないけど領域は分けたい」

LP 該当: Pricing の「両プラン共通 統合ボックス」、Footer の代表プロフィールカード

サービス画面での応用: フィルター行、検索条件パネル、メタ情報枠、サブセクション

### 選び方フローチャート

```
そのカードは「主役」?
├─ Yes (1セクションに1〜2個) → Recipe B (gradient rim)
└─ No
   ├─ 単独のグループ・並列 → Recipe A (bg-dusk)
   └─ 親の中の補助領域   → Recipe C (subtle)
```

---

## 14. Agent Color Tokens

LP の `components/landing/atoms.tsx` の `AGENTS` 定数で固定されている 5 エージェント色。
サービス画面でも同じ色を、同じエージェント由来の機能の示唆として使う。

| Key | 名前 | initial | Hex | LP token | 主な用途 |
| --- | --- | --- | --- | --- | --- |
| sales | Sales Agent | S | `#abc7ff` | aurora | デフォルト/最頻出。営業・パイプライン・コンタクト系 |
| marketing | Marketing Agent | M | `#ffcf4a` | amber | インテント検知・メール配信・キャンペーン |
| support | Customer Agent | C | `#ff8dcf` | coral | チケット・問い合わせ・サポート |
| helpdesk | Knowledge Agent | K | `#c8b9ff` | lilac | ナレッジ・FAQ・社内Q&A |
| pdm | Product Agent | P | `#8dffc9` | mint | 議事録要望集計・優先度・ロードマップ |

ルール:

- エージェント単位の機能を示すときは必ずこの色を使う (独自色を作らない)
- 表現方法は **`Orb` (放射状グラデの発光ドット)** が標準。次点でアイコン左の small dot
- 大面積で塗らない。アクセント・badge・eyebrow・dot 限定
- サイドバーの色付きドットもこの色を踏襲する

コード例:

```jsx
import { AGENTS, Orb } from '@/components/landing/atoms'

const meta = AGENTS.sales
// → { name: 'Sales Agent', initial: 'S', color: '#abc7ff', token: 'aurora', desc: '…' }

<Orb color={meta.color} size={11} glow={0.7} />
<span style={{ color: meta.color }}>{meta.name}</span>
```

エージェント色とステータス色 (`Hot / Mid / Low`) は意味が異なる別系統。エージェント色をステータス表現に流用しない。

---

## 15. Section Composition Pattern

LP の全 section に共通する解剖図。サービス画面のページ構成にも同じ「Fade Divider → ambient radial → Eyebrow → H2 → Body」の入れ子を踏襲する。

```jsx
<Section tone="obsidian" screenLabel="NN Foo">
  {/* (1) 上の細い fade divider — 隣接 section と視覚的に区切る */}
  <div
    className="h-px w-full"
    style={{
      background:
        'linear-gradient(90deg, transparent 0%, rgba(171,199,255,0.08) 20%, rgba(171,199,255,0.20) 50%, rgba(171,199,255,0.08) 80%, transparent 100%)',
    }}
  />

  {/* (2) ambient radial — 淡い光だけで深度を出す */}
  <div
    className="absolute inset-0 pointer-events-none"
    style={{
      background:
        'radial-gradient(ellipse at 50% 0%, rgba(255,193,7,0.06) 0%, transparent 55%), radial-gradient(ellipse at 80% 100%, rgba(0,113,227,0.04) 0%, transparent 50%)',
    }}
  />

  <div className="relative mx-auto max-w-6xl px-6 py-20 md:py-28">
    {/* (3) Header — Eyebrow + H2 ペア */}
    <div className="max-w-3xl">
      <Eyebrow color="#abc7ff">SECTION LABEL</Eyebrow>
      <h2 className="font-display font-bold tracking-[-0.025em] text-[2.2rem] md:text-[3rem] leading-[1.06] mt-5">
        <span className="fo-gradient-text">主見出しの一文目</span>、
        <br />
        <span className="fo-gradient-text-soft">補足や余韻の二文目</span>。
      </h2>
    </div>

    {/* (4) Body — grid of cards 等 */}
    <div className="grid md:grid-cols-2 gap-6 mt-12 items-stretch">
      {/* Recipe A/B/C のカード */}
    </div>
  </div>
</Section>
```

ルール:

- `Section` (atoms.tsx) は LP 専用。サービス画面ではより縦パディングを縮めた `<section className="relative bg-obsidian">` で代用
- Eyebrow → H2 の縦余白は `mt-5`(20px) が標準
- Section 全体の縦パディング: LP は `py-20 md:py-28` 〜 `py-32 md:py-44`。サービスは `py-6 md:py-8` 程度に圧縮
- ambient radial は LP の特権。サービス画面では使わない (背景は §Page Shell に従う)
- Fade divider は **隣接セクションがある場合のみ**。単独配置のときは省略

---

## 16. Motion & Easing Guidelines

LP の動きはすべて **Liquid ease** (`cubic-bezier(0.4, 0, 0.2, 1)` = `var(--ease-liquid)`) で統一。
イージングを変えると "Photon Drift" の世界観が壊れる。

| 速度 | 用途 |
| --- | --- |
| `150ms` | ホバーカラー変化、Tooltip 表示 |
| `300-400ms` | カードのトランスフォーム、ボタンの状態変化 |
| `600ms` | 文字入場 (`.fo-word-in`)、初期ロード演出 |
| `1.4s` | Orb のアクティブパルス |
| `5-9s` | ambient のドリフト・呼吸 |
| `14s` | aurora ribbon の大型循環 |

Don't:

- `linear` や `bounce` 系イージングは使わない
- 1要素に複数の高速アニメを重ねない (粘性のある動きを保つ)
- サービス画面の通常操作で `5s` 以上の ambient ループを足さない (集中の阻害)

サービス画面での推奨:

- ボタン/カードの hover は `transition: all 200ms var(--ease-liquid)` で統一
- ロード状態は `.fo-skeleton` でカラーシマー
- モーダル表示は CSS `@keyframes` で `fadeInUp 250ms ease-out` (ContactForm 参照)

---

## 17. Reusable Pattern Snippets

LP で頻出する「小さな型」。コピーで使える。
独自に作る前に、まずこれらでカバーできないか確認する。

### Eyebrow Section Label (Section 内のサブラベル)

```jsx
<div className="text-[10.5px] uppercase tracking-[0.16em] text-[#9b99a0] mb-5">
  両プラン共通 · 5 エージェント全機能
</div>
```

### Inline Key-Value (会社情報・メタ情報)

```jsx
<div className="flex items-baseline gap-2">
  <span className="text-[10px] uppercase tracking-[0.10em] text-[#7e7c83] w-10 shrink-0">
    提供
  </span>
  <span className="text-[#c7c5c9]">株式会社ルーキースマートジャパン</span>
</div>
```

### Pill / Chip (ステータス・タグ・連携)

原則として、補助メタ情報はChipで囲まず、テキストだけで表示する。色を持たせるのは、求人インテント、1stシグナル、進捗フェーズなど、意味の強さや状態判断に直結するものだけに限定する。

対象例:

- リード経由
- 役職
- ステータス
- Next Action
- コール数 / メール数

補助メタ情報の推奨:

```jsx
<span className="text-[12px] font-medium text-[#8f8c90]">
  アポ獲得
</span>
```

```jsx
<span
  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] text-[#c7c5c9]"
  style={{
    background: 'rgba(171,199,255,0.06)',
    boxShadow: 'inset 0 0 0 1px rgba(171,199,255,0.18)',
  }}
>
  <span
    className="inline-block w-1.5 h-1.5 rounded-full"
    style={{ background: '#8dffc9', boxShadow: '0 0 6px #8dffc9aa' }}
  />
  Gmail
</span>
```

### Signal Badge (Hot / Mid / Low)

```jsx
<span
  className="inline-flex items-center gap-1 text-[9px] font-mono px-1.5 py-0.5 rounded uppercase tracking-wider"
  style={{ background: 'rgba(255,107,107,0.15)', color: '#ff6b6b' }}
>
  <span
    className="w-1 h-1 rounded-full animate-pulse"
    style={{ background: '#ff6b6b', boxShadow: '0 0 6px #ff6b6b' }}
  />
  Hot
</span>
```

### Fade Divider (セクション間・装飾的)

```jsx
<div
  className="h-px w-full"
  style={{
    background:
      'linear-gradient(90deg, transparent 0%, rgba(171,199,255,0.10) 20%, rgba(171,199,255,0.22) 50%, rgba(171,199,255,0.10) 80%, transparent 100%)',
  }}
/>
```

### Soft Divider (要素間・控えめ)

```jsx
<div className="my-7 h-px" style={{ background: 'rgba(171,199,255,0.10)' }} />
```

### Dashed Subgroup Separator (グループ内・補助区切り)

```jsx
<div
  className="my-4"
  style={{ borderTop: '1px dashed rgba(171,199,255,0.12)' }}
/>
```

### Aurora Spotlight (カード内・背景の淡光)

```jsx
<div
  className="absolute -top-24 -right-20 w-60 h-60 rounded-full pointer-events-none"
  style={{
    background:
      'radial-gradient(circle, rgba(171,199,255,0.18), transparent 60%)',
    filter: 'blur(40px)',
  }}
/>
```

### Primary Number (数値の主役表現)

```jsx
<span className="font-display text-[26px] md:text-[30px] font-bold tabular-nums fo-gradient-text leading-none">
  20
</span>
<span className="text-[12px] font-semibold text-[#9b99a0] leading-none ml-1">
  cr
</span>
```

### Success Modal (フォーム送信後の確認)

```jsx
<div className="fixed inset-0 z-[100] flex items-center justify-center px-4 py-8" role="dialog" aria-modal="true">
  {/* バックドロップ */}
  <button
    type="button"
    onClick={onClose}
    className="absolute inset-0 cursor-default"
    style={{
      background: 'rgba(10,10,12,0.72)',
      backdropFilter: 'blur(8px)',
    }}
  />
  {/* カード */}
  <div
    className="relative w-full max-w-[460px] rounded-3xl px-7 py-9 text-center"
    style={{
      background: 'linear-gradient(180deg, rgba(28,28,32,0.96) 0%, rgba(20,20,23,0.96) 100%)',
      boxShadow:
        'inset 0 0 0 1px rgba(171,199,255,0.18), 0 30px 60px -20px rgba(0,0,0,0.6), 0 0 80px rgba(171,199,255,0.08)',
    }}
  >
    {/* content */}
  </div>
</div>
```

---

## 18. HP → Service 翻訳ガイド

HP の装飾をそのままサービスに持ち込まない。以下のマッピングで「世界観は保ちつつ業務向けに最適化」する。

| HP (派手) | Service (抑制) | 理由 |
| --- | --- | --- |
| `py-20 md:py-28` (大きな縦余白) | `py-6 md:py-8` (圧縮) | 業務密度を確保する |
| HP Hero 見出し | 同じタイポグラフィを使い、サービスでは白本文 + 青アクセント語尾に圧縮 | 見出しのトンマナは統一しつつ、業務密度を保つ |
| ambient radial を多重に重ねる | radial 1〜2 のみ、または無し | 業務ノイズを抑制 |
| `fo-aurora-ribbon` (背景の流れる光) | 使用しない | 業務作業の妨げ |
| `ParticleField` (浮遊する粒子) | 使用しない | 同上 |
| `fo-tilt-1400` (傾けたガラス) | 使用しない | 業務 UI は直立が基本 |
| `fo-gradient-text` 多用 | ページタイトル1箇所のみ | "Editorial Anchor" の品位 |
| Recipe B (gradient rim) を多用 | 主役1〜2 のみ Recipe B、他は A or C | 階層を保つ |
| 大型 `fo-lift` (translateY -2px) | 控えめな background-color hover | クリック対象を明示できれば十分 |
| 巨大数値の `fo-gradient-text` | font-display + `fo-gradient-text-soft` で抑制 | テーブル数値は読みやすさ優先 |

翻訳の判断順:

1. **機能上、その装飾は必要か?** (不要なら削る)
2. **同じ意味を「面の差・小さな発光・余白」で表現できないか?**
3. それでも装飾が必要なら、LP の同種パターンを **強度 -1 段** で適用
4. 結果を Home / HP / 290万社DB と並べて確認 (Don't: 全ページで違う色の思想を持たせない)

---

## 19. 実装チェックリスト (拡張版)

サービス画面の新規ページ実装時、§実装時の判断基準 に加えて以下も確認。

- [ ] HPの現行デザインと見比べて、色・光・余白の思想が一致している
- [ ] `docs/DESIGN.md` と矛盾する独自ルールを作っていない
- [ ] §11 の `fo-*` ユーティリティを使い、独自 CSS を増やしていない
- [ ] §12 のタイポスケールに従い、ad-hoc な `text-[Xpx]` を量産していない
- [ ] §13 の 3 カードレシピいずれかを基底にしている (独自カードを作っていない)
- [ ] §14 のエージェント色をエージェント機能以外に流用していない
- [ ] §15 の Section Composition (Eyebrow → H2 → Body) を踏襲している
- [ ] §16 の Liquid ease 以外のイージングを使っていない
- [ ] §17 の Pattern Snippet で代替可能なものを独自実装していない
- [ ] §18 の翻訳ガイドに従って HP 装飾を抑制している
- [ ] No-line 規約: グレーの 1px solid border を使っていない (aurora 10-20% の inset shadow 化)

---

## 20. 関連リソース

- 最上位デザイン方針: [`docs/DESIGN.md`](./DESIGN.md) (Liquid Obsidian Creative North Star)
- 実装トークン: [`apps/web/app/globals.css`](../apps/web/app/globals.css) (`--color-obs-*` / `--color-aurora` / `fo-*`)
- LP プリミティブ: [`apps/web/components/landing/atoms.tsx`](../apps/web/components/landing/atoms.tsx) (`Eyebrow / Pill / Orb / Section / GlassCard / NebulaBG / ParticleField / MiniBar`)
- LP セクション実装例: [`apps/web/components/landing/sections/`](../apps/web/components/landing/sections/)

新しいパターンが LP で確立されたら、このドキュメントの該当章を更新する。逆に、ここに無いパターンを service に実装する前に、まず LP で先に試して "Photon Drift" のトーンに馴染ませる。
