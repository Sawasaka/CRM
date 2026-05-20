# Google 連携 セットアップ手順

CRM が Gmail / Google Drive / Google Calendar / Google Meet と連携するために、ユーザー側で必要な作業をまとめています。

実装済みの機能は以下:

- Gmail のスレッドをコンタクトのメアドと完全一致で自動紐付け（ドメイン一致は企業に紐付け）
- Google Drive の連携フォルダをナレッジとして取り込み
- Calendar の予定を取引・コンタクトに自動紐付け
- Meet の議事録（文字起こし）を自動取得し DB に保存、`Transcript` レコードを作成
- 議事録取得時に `MeetingEvent.status = COMPLETED` に遷移、その取引における `n` 回目商談を確定（`occurrenceIndex`）
- 商談回数に応じて `Deal.stage` を自動遷移（n=1: FIRST_MEETING / n=2: SOLUTION_FIT / n≥3: PROPOSAL）

---

## ① DB スキーマを実 DB に反映

新規モデル（`UserGoogleAccount` / `EmailMessage` / `MeetingEvent`）追加と、`Transcript` への nullable カラム追加です。既存データへの破壊的変更はありません。

```bash
cd bgm/packages/db
pnpm prisma db push
```

migration ファイルとして残したい場合:

```bash
pnpm prisma migrate dev --name add_google_integration
```

実行後、`pnpm prisma studio` で Tables に `user_google_account` `email_message` `meeting_event` が表示されることを確認。

---

## ② Google Cloud Console 側の設定

### 2-1. API を有効化

Google Cloud Console の **APIs & Services → Library** で以下を有効化:

- Gmail API
- Google Drive API
- Google Calendar API
- **Google Meet API**（最重要・新規追加）

### 2-2. OAuth 同意画面のスコープ追加

**APIs & Services → OAuth consent screen → Edit App → Scopes** で以下を追加:

| スコープ                           | 用途                                          |
| ---------------------------------- | --------------------------------------------- |
| `.../auth/gmail.modify`            | Gmail 受信トレイ読み取り（既存）              |
| `.../auth/drive.readonly`          | Drive フォルダ/議事録 Doc の読み取り          |
| `.../auth/calendar`                | カレンダー読み書き（既存）                    |
| `.../auth/calendar.events`         | イベント詳細（**追加**）                      |
| `.../auth/meetings.space.readonly` | Meet 会議メタ情報・議事録読み取り（**追加**） |
| `.../auth/meetings.space.created`  | Meet 会議メタ情報・議事録読み取り（**追加**） |

### 2-3. OAuth リダイレクト URI

Google Cloud Console の OAuth クライアントに以下を追加:

```text
http://localhost:3002/api/google/oauth-callback
```

本番の独自ドメイン公開後は、次も追加します。

```text
https://app.example.com/api/auth/callback/google
https://app.example.com/api/google/oauth-callback
```

> ⚠️ Drive / Meet 系スコープは Google 側で **「制限付きスコープ」** に分類されることがあります。テスト環境（test users 登録のみ）では即時利用できますが、本番公開（external user 利用）にはアプリ審査が必要になります。
> プレスリリース前に「OAuth ベリフィケーション」を申請しておきましょう（通常 4–6 週間かかります）。

### 2-4. Workspace 管理コンソール（Meet 設定）

**admin.google.com → アプリ → Google Workspace → Google Meet → Meet 動画設定**:

- ✅ 「会議の録画を許可する」
- ✅ 「文字起こしを許可する」
- ✅ （任意）「Gemini によるメモ取り」

会議ごとに録画/文字起こしをオンにする運用を徹底（自動オンにする Apps Script ルールも検討の余地あり）。

---

## ③ 既存ユーザーの再ログイン

スコープを追加したので、**既存ログインセッションは追加スコープを持っていません**。一度サインアウト → 「Google で連携する」から再ログイン してください。再同意画面で Meet/Calendar スコープの許可を求められます。

---

## ④ 連携確認

1. CRM の **サイドバー → 連携設定** を開く
2. 「Google で連携する」が消え、「連携済み」バッジが表示されればOK
3. **Gmail / Drive / Calendar / Meet** のそれぞれに「今すぐ同期」ボタン → 結果が JSON で表示
4. 取引/コンタクト詳細ページに「Gmail / Meet 履歴」タイムラインが現れる

---

## ⑤ 自動同期（次のステップ）

現在は手動トリガーのみです。本格運用に入る前に下記いずれかを構築:

- **cron**: `POST /api/google/sync?scope=all` を5分おきに叩く（Vercel Cron / GitHub Actions）
- **Push 通知**: Gmail watch + Pub/Sub、Calendar push notifications
- **Meet 通知**: Workspace Events API（議事録ファイナライズ時のリアルタイム通知）

dogfood 検証で同期頻度の実態を見てから決めましょう。

---

## 🧪 動作確認用チェックリスト

- [ ] DB push 完了
- [ ] GCP で Meet API 有効化
- [ ] GCP で Drive API 有効化
- [ ] OAuth 同意画面に Meet スコープ追加
- [ ] OAuth クライアントに `http://localhost:3002/api/google/oauth-callback` 追加
- [ ] テストユーザーに自分のメアドを追加
- [ ] サインアウト → 再ログイン
- [ ] `/settings/integrations` で「連携済み」表示
- [ ] Gmail 同期 → 取引/コンタクトに紐付くメールがタイムラインに出る
- [ ] Calendar に Meet 付き予定を作成 → 同期 → MeetingEvent が SCHEDULED で出る
- [ ] 録画+文字起こしオンで Meet を実施
- [ ] Meet 同期 → MeetingEvent が COMPLETED、Transcript レコード作成、Deal ステージが進む
