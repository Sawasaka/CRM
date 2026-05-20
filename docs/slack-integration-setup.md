# Slack 連携 セットアップ手順

CRM が Slack のメッセージをコンタクトに紐付けるために、Slack App を 1 つ作成して接続します。

## ① Slack App を作る

1. https://api.slack.com/apps を開く → **「Create New App」** → **「From scratch」**
2. App Name: `BGM CRM`、Workspace: 自分の Workspace を選択
3. 作成後、左メニューから設定:

### OAuth & Permissions

- **Redirect URLs** に以下を追加:

  ```
  http://localhost:3002/api/slack/oauth-callback
  ```

  本番の独自ドメイン公開後:

  ```text
  https://app.example.com/api/slack/oauth-callback
  ```

  （本番ドメインができたらそちらも追加）

- **Scopes → Bot Token Scopes** に以下を追加:
  ```
  channels:history
  channels:read
  groups:history
  groups:read
  im:history
  im:read
  mpim:history
  mpim:read
  users:read
  users:read.email
  chat:write
  ```

### Basic Information

- **Client ID** と **Client Secret** をコピー（`.env.local` に貼る）

### Display Information

- App Name: `BGM CRM`
- アイコン任意

## ② `.env.local` に追加

```env
# ===== Slack =====
SLACK_CLIENT_ID="<コピーしたClient ID>"
SLACK_CLIENT_SECRET="<コピーしたClient Secret>"
```

すでに `bgm/.env.local` には `SLACK_BOT_TOKEN` 等の枠があるが、それらは使わずに `SLACK_CLIENT_ID` / `SLACK_CLIENT_SECRET` を使う（Bot Token はインストール時に DB へ保存）。

## ③ DB 反映

```bash
cd bgm/packages/db
cat sql/2026-04-25-slack-integration.sql | pbcopy
# → Supabase SQL Editor に貼り付けて Run
```

## ④ 動作確認

1. 連携設定画面 (`/settings/integrations`) を開く
2. Slack セクションの **「Slack で連携する」** ボタンを押す
3. Slack の認可画面でインストール
4. リダイレクトで戻ってきたら、ワークスペース一覧に表示される
5. **「同期」** ボタンで取り込みテスト

## ⑤ Bot をチャンネルに招待

Slack のチャンネルで `/invite @BGM CRM` で Bot を招待しないと、そのチャンネルのメッセージは取れません（DM/個人ペアは自動）。

## 仕様メモ

- 紐付けは **Slack ユーザーのメアド ⇔ Contact.email** の完全一致
- Slack の `users:read.email` スコープが必須
- 各チャンネルから直近 30 件を取得（負荷軽減）
- 重複は `(workspaceId, channelId, ts)` でユニーク
