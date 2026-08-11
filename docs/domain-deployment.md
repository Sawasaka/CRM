# 独自ドメイン公開手順

このリポジトリは Next.js の `@bgm/web` と Fastify/tRPC の `@bgm/api` を分けて公開する前提です。通常の独自ドメインで出す場合は、まず次の形にそろえるのが最短です。

- Web: `https://app.example.com`
- API: `https://api.example.com`
- LP を同じ Next.js で出す場合: `https://example.com/lp` または `https://www.example.com`

## 推奨構成

### Web

Vercel に `bgm/` をルートとして接続します。

- Install Command: `corepack pnpm install --no-frozen-lockfile`
- Build Command: `corepack pnpm run build:web`
- Output Directory: `apps/web/.next`
- Framework Preset: Next.js

この設定は `vercel.json` にも保存済みです。Vercel ではリポジトリ直下ではなく `bgm/` を Project Root にしてください。

Web 側の環境変数:

```env
AUTH_SECRET="openssl rand -base64 32 で生成した値"
AUTH_URL="https://app.example.com"
NEXTAUTH_SECRET="AUTH_SECRET と同じ値"
NEXTAUTH_URL="https://app.example.com"
NEXT_PUBLIC_APP_URL="https://app.example.com"
NEXT_PUBLIC_API_URL="https://api.example.com"
DATABASE_URL="postgresql://..."
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
SLACK_CLIENT_ID="..."
SLACK_CLIENT_SECRET="..."
SLACK_SIGNING_SECRET="..."
OPENAI_API_KEY="..."
```

### API

Render / Railway / Fly.io などに `bgm/` をルートとして接続します。

- Build Command: `corepack pnpm install --frozen-lockfile && corepack pnpm run build:api`
- Start Command: `corepack pnpm run start:api`
- Health Check: `/health`

API 側の環境変数:

```env
NODE_ENV="production"
PORT="3001"
DATABASE_URL="postgresql://..."
NEXT_PUBLIC_APP_URL="https://app.example.com"
AUTH_URL="https://app.example.com"
NEXTAUTH_URL="https://app.example.com"
API_CORS_ORIGINS="https://app.example.com,https://www.example.com"
```

## DNS

ドメイン管理画面で、利用するホスティング先の案内に従って次を設定します。

- `app.example.com`: Vercel の CNAME (`cname.vercel-dns.com`)
- `api.example.com`: API ホスティング先の CNAME
- `www.example.com`: LP を置く場合の CNAME

`example.com` の apex を使う場合は、Vercel/Cloudflare/ホスティング先が指定する A レコードまたは ALIAS/ANAME を設定します。

## OAuth の公開 URL

独自ドメインに切り替えたら、各外部サービスの callback URL も本番 URL に変更します。

Google Cloud Console:

```text
https://app.example.com/api/auth/callback/google
https://app.example.com/api/google/oauth-callback
```

Slack App:

```text
https://app.example.com/api/slack/oauth-callback
```

## 公開前チェック

- `NEXT_PUBLIC_DEV_MODE` を本番で `true` にしない
- `AUTH_URL` / `NEXTAUTH_URL` / `NEXT_PUBLIC_APP_URL` を同じ Web URL にそろえる
- `NEXT_PUBLIC_API_URL` は API の HTTPS URL にする
- `API_CORS_ORIGINS` に Web の独自ドメインを入れる
- Google / Slack の OAuth callback URL を独自ドメインで登録する
- Supabase / DB の接続元制限がある場合は API ホスティング先から接続できるようにする

## 初回公開時の注意

現状の `apps/web` には既存の TypeScript / App Router export エラーが残っています。初回公開を優先するため、`apps/web/next.config.mjs` では `ignoreBuildErrors` と `ignoreDuringBuilds` を有効にしています。公開後、型エラーを潰したらこの設定は外します。

## コーポレートサイト v2 本番公開記録（2026-08-11）

- 公開URL: `https://www.rookiesmart-jp.com/`
- apex: `https://rookiesmart-jp.com/` から `www` へ301リダイレクト
- 本番デプロイ: `https://rookiesmart-ihqgyzu32-sawasakas-projects.vercel.app`
- Vercel deployment ID: `dpl_DyJUtemFUhp74YKKUzDcb4HdGvbb`
- 旧本番ロールバック先: `https://rookiesmart-lrc5l8bnq-sawasakas-projects.vercel.app`
- CRM: `https://crm.rookiesmart-jp.com/` の機能と `noindex, nofollow, noarchive` を維持

公開後に、会社名・代表名を含むmetadataとJSON-LD、canonical、robots.txt、sitemap.xml、資料PDF、フォームの入力検証を実ドメインで確認した。レスポンシブ表示は1440px、1280px、768px、390px、320pxで確認し、横スクロールと画像破損がないことを確認した。

緊急時はVercelのDeploymentsから旧本番ロールバック先をPromote to Productionし、公開後にコーポレートドメインとCRMの両方を再確認する。
