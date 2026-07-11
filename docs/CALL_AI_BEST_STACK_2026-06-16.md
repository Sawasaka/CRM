# Call AI Best Stack - 2026-06-16

## 結論

本命は **Amazon Connectで日本050番号を取得し、会話AIはOpenAI Realtime、音声はGoogle Chirp3-HDとElevenLabsをA/B検証する構成**にする。

Twilioは日本番号の取得・申請で詰まりやすいため、本命から外して保険扱いにする。

## 推奨スタック

| レイヤー | 本命 | 理由 |
| --- | --- | --- |
| 発信番号 | Amazon Connect `+81 50` | 日本050番号の取得ルートが公式に存在する |
| 電話制御 | Amazon Connect Contact Flow | 着信・発信・営業時間・録音・転送を業務フローとして管理できる |
| 会話AI | OpenAI Realtime | 低遅延、割り込み、自然な会話制御を検証しやすい |
| 日本語TTS | Google Chirp3-HD | 日本語ネイティブ感、安定性、低遅延のバランスが良い |
| 声質比較 | ElevenLabs Japanese male | 人間らしさ最優先の比較候補 |
| CRM | Lukisma CRM | シナリオ、RAG、通話結果、商談化を一元管理する |

## 実装方針

1. Amazon Connectで050番号を取得する。
2. Contact Flowを作り、問い合わせ後の即時発信に使う入口を固定する。
3. CRMの `AI_CALL_PROVIDER` は `amazon_connect_openai` を本命にする。
4. `POST /api/ai-calls/start` から Amazon Connect `StartOutboundVoiceContact` を呼ぶ。
5. Contact Flow/Lambda側でOpenAI Realtime、Google Chirp3-HD、ElevenLabsの音声処理を切り替えられるようにする。
6. AIモデル試験画面で、ブラウザRealtimeと実電話用プロファイルを分けて評価する。

## 評価軸

| 軸 | 合格ライン |
| --- | --- |
| 発信元 | 日本050番号で表示される |
| 声 | 日本人男性が話しているように聞こえる |
| 割り込み | ユーザーが話したら即時停止する |
| 待ち時間 | ユーザー発話終了から返答開始まで短い |
| 話し方 | 一度に質問は1つ、短文で返す |
| CRM反映 | 背景、次アクション、商談議題、温度感がActivityに残る |

## 公式確認リンク

- Amazon Connect phone number requirements: https://docs.aws.amazon.com/connect/latest/adminguide/phone-number-requirements.html
- Amazon Connect StartOutboundVoiceContact API: https://docs.aws.amazon.com/connect/latest/APIReference/API_StartOutboundVoiceContact.html
- Google Cloud Text-to-Speech voices: https://cloud.google.com/text-to-speech/docs/list-voices-and-types
- OpenAI Realtime: https://platform.openai.com/docs/guides/realtime
- ElevenLabs Conversational AI: https://elevenlabs.io/docs/conversational-ai/overview
