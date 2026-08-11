# ルーキースマートジャパン コーポレートサイト v1 アーカイブ

2026-08-09 に、v2 へ置き換える直前のコーポレートサイト関連ファイルを保存したものです。

## 内容

- `source/`: 元のリポジトリ階層を維持したソースと画像
- `FILE_MANIFEST.txt`: 保存対象一覧
- `SHA256SUMS.txt`: 各ファイルの SHA-256

CRM、API、認証、Google 連携、データベース、AI 記事関連のファイルは対象外です。

## 復元

1. `docs/archive/corporate-site-v1-2026-08-08/source/`へ移動し、`shasum -a 256 -c ../SHA256SUMS.txt`を実行します。
2. `source/` 以下の必要なファイルを、同じ相対パスへ戻します。
3. `pnpm --filter @bgm/web type-check`、`pnpm --filter @bgm/web lint`、`pnpm --filter @bgm/web build` を実行します。

未コミット作業がある場合は、復元前に差分を確認してください。
