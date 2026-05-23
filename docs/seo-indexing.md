# ルーキースマートCRM SEO / インデックス対応

## 目的

- `株式会社ルーキースマートジャパン` で公式サイト `https://www.rookiesmart-jp.com/` を表示させる。
- `ルーキースマートCRM` / `ルキスマCRM` で公式LPを表示させる。
- 既存の `https://portfolio.rookiesmart-jp.com/` は、会社名検索では公式サイトより優先されない状態にする。

## 実装済み

- `robots.txt` を公開し、Googlebot のクロールを許可。
- `sitemap.xml` を公開し、トップページと法務ページを送信可能にした。
- LPの `title` / `description` / `keywords` / canonical を会社名・サービス名に合わせて調整。
- `Organization` / `SoftwareApplication` / `WebSite` の JSON-LD を追加。
- Google Analytics 4 は `NEXT_PUBLIC_GA_MEASUREMENT_ID` で差し込み可能。
- Search Console のHTMLタグ認証は `GOOGLE_SITE_VERIFICATION` で差し込み可能。

## 本番環境変数

```env
NEXT_PUBLIC_SITE_URL="https://www.rookiesmart-jp.com"
NEXT_PUBLIC_GA_MEASUREMENT_ID="G-XXXXXXXXXX"
GOOGLE_SITE_VERIFICATION="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
```

`GOOGLE_SITE_VERIFICATION` は Search Console の「HTML タグ」認証で表示される `content` の値のみを入れる。

## Search Console で行うこと

1. `https://www.rookiesmart-jp.com/` の URL プレフィックス プロパティを追加。
2. HTMLタグ認証の `content` を `GOOGLE_SITE_VERIFICATION` に設定してデプロイ。
3. Search Console で所有権を確認。
4. `https://www.rookiesmart-jp.com/sitemap.xml` を送信。
5. URL検査で `https://www.rookiesmart-jp.com/` を検査し、「インデックス登録をリクエスト」する。

## ポートフォリオサイトを検索結果から外す

対象:

```txt
https://portfolio.rookiesmart-jp.com/
```

現在は `robots: index, follow` で、Googleに残りやすい状態。

推奨順:

1. ポートフォリオサイトを残さないなら、`https://www.rookiesmart-jp.com/` へ 301 リダイレクト。
2. 残すが検索に出したくないなら、ポートフォリオ側に `<meta name="robots" content="noindex, follow">` を設定。
3. Search Console の「削除」から `https://portfolio.rookiesmart-jp.com/` を一時削除。

一時削除だけだと期限後に戻る可能性があるため、必ず 301 または `noindex` とセットで行う。
