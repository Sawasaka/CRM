# Twilio/OpenAI Call AI Runbook

## Goal

Retellを使わず、Twilioの日本発信番号から問い合わせ直後のAIアウトバウンドコールを行う。

## Required Environment

`apps/web/.env.local` に以下を設定する。

```bash
corepack pnpm --filter @bgm/web call:configure
```

```env
AI_CALL_PROVIDER="twilio_openai"
CONTACT_AI_CALL_ENABLED="true"

OPENAI_API_KEY="..."
OPENAI_CALL_MODEL="gpt-4.1-mini"

TWILIO_ACCOUNT_SID="..."
TWILIO_AUTH_TOKEN="..."
TWILIO_FROM_NUMBER="+81..."
TWILIO_TEST_TO_NUMBER="+81..."
TWILIO_ADDRESS_SID="AD..."
TWILIO_REPRESENTATIVE_ADDRESS_SID="AD..."
TWILIO_REGULATORY_END_USER_SID="IT..."
TWILIO_REGULATORY_BUNDLE_SID="BU..."

AI_CALL_RELAY_WS_URL="wss://<relay-domain>/twilio/conversation-relay"
AI_CALL_RESULT_WEBHOOK_URL="https://<crm-domain>/api/ai-calls/webhook"
AI_CALL_WEBHOOK_SECRET="..."

TWILIO_CONVERSATION_LANGUAGE="ja-JP"
TWILIO_CONVERSATION_TTS_PROVIDER="Google"
TWILIO_CONVERSATION_TRANSCRIPTION_PROVIDER="Google"
TWILIO_CONVERSATION_VOICE="ja-JP-Neural2-B"
TWILIO_CONVERSATION_SPEECH_TIMEOUT_MS="900"
TWILIO_RECORD_CALLS="false"
```

## Japan Number Purchase

Twilioの日本Local番号は、購入前にRegulatory Bundleの承認が必要。
`090/080/070` の携帯番号はTwilio AvailablePhoneNumbers APIでは取得できなかったため、MVPは `03` を第一候補にする。

現在の優先順位:

1. 東京 `03`
2. 大阪 `06`
3. `050`
4. `0800` toll-free

Bundle評価:

```bash
corepack pnpm --filter @bgm/web call:jp-bundle:evaluate
```

書類アップロードとBundle紐づけ:

```env
TWILIO_JP_REP_BIRTH_DATE="YYYY-MM-DD"
TWILIO_DOC_CORPORATE_REGISTRY_PATH="/absolute/path/to/corporate_registry.pdf"
TWILIO_DOC_JP_APPLICATION_PATH="/absolute/path/to/japan_regulatory_bundle_application.pdf"
TWILIO_DOC_REP_ID_PATH="/absolute/path/to/representative_id.pdf"
TWILIO_DOC_REP_ADDRESS_PATH="/absolute/path/to/representative_address_proof.pdf"
TWILIO_DOC_AUTHORIZATION_PATH="/absolute/path/to/authorization.pdf"
```

```bash
corepack pnpm --filter @bgm/web call:jp-bundle:upload -- --submit
```

必要書類の目安:

- 6か月以内の履歴事項全部証明書
- 記入済みのJapan Regulatory Bundle Application
- 代表者の本人確認書類
- 代表者住所の証明書類
- 代表権限の証明書類

Bundleが `twilio-approved` になった後、番号購入:

```bash
corepack pnpm --filter @bgm/web call:buy-number
```

## Start Relay

```bash
corepack pnpm --filter @bgm/web call:doctor
```

## Japanese Voice Quality Profiles

The Call AI separates the Japanese phone number from the voice model stack.

- Caller ID / phone number: Twilio Japan number. This must wait for the Japan Regulatory Bundle to become `twilio-approved`.
- Listening: ConversationRelay transcription provider, currently Google for Japanese stability.
- Speaking: ConversationRelay TTS provider/voice, selected by `AI_CALL_VOICE_PROFILE`.
- Conversation reasoning: OpenAI chat model in `OPENAI_CALL_MODEL`.

Recommended first profile:

```env
AI_CALL_VOICE_PROFILE="jp-google-neural2-b"
```

Available profiles:

```bash
corepack pnpm --filter @bgm/web call:voices
```

Candidate order for Japanese phone testing:

1. `jp-google-neural2-b` - native Japanese baseline for phone tests.
2. `jp-google-neural2-c` - Google voice A/B test.
3. `jp-elevenlabs-ja-male-custom` - selected native-sounding Japanese male ElevenLabs voice.
4. `jp-elevenlabs-telephony` - Twilio's default ja-JP ElevenLabs voice; only keep if it sounds native enough.
5. `jp-amazon-takumi-neural` - backup vendor path.

For the ElevenLabs Japanese male profile, choose a voice from ElevenLabs Voice Library
and set the ID explicitly:

```env
AI_CALL_VOICE_PROFILE="jp-elevenlabs-ja-male-custom"
ELEVENLABS_JA_MALE_VOICE_ID="VOICE_ID-turbo_v2_5-0.92_0.65_0.85"
```

Twilio Conversation Relay passes this value to the `voice` attribute with
`ttsProvider="ElevenLabs"`. The suffix after the voice ID controls model, speed,
stability, and similarity.

For interruption quality, keep:

```env
TWILIO_CONVERSATION_INTERRUPT_SENSITIVITY="high"
TWILIO_CONVERSATION_REPORT_INPUT_DURING_AGENT_SPEECH="speech"
TWILIO_CONVERSATION_SPEECH_TIMEOUT_MS="650"
```

Do not try to hide that the caller is AI. The target quality is natural, low-latency, and useful, while still avoiding human impersonation.

```bash
corepack pnpm --filter @bgm/web call-relay
```

Relayは `AI_CALL_RELAY_WS_URL` の公開WebSocketとしてTwilioから到達できる必要がある。

## Test Call

```bash
corepack pnpm --filter @bgm/web call:test -- +819012345678
```

CRMフォーム経由ではなく、Twilio発信とConversation Relay接続だけを最短確認する。

## Production Flow

1. HPの相談モーダルから `POST /api/contact` を呼ぶ。
2. `AI_CALL_PROVIDER=twilio_openai` かつ `CONTACT_AI_CALL_ENABLED=true` の場合、Twilioへアウトバウンド発信する。
3. Twilio Conversation Relayが `AI_CALL_RELAY_WS_URL` に接続する。
4. RelayサーバーがOpenAIで日本語応答を生成する。
5. 通話終了時、Relayサーバーが `AI_CALL_RESULT_WEBHOOK_URL` に会話履歴、要約、次アクションを返す。
6. CRMのActivityにAIコール結果が保存される。

## Conversation Rules

- 日本語で自然に短く話す。
- 質問は一度に1つだけ。
- 相手が話したら説明を止める。
- 1ターンは原則1文。
- 契約、決済、正式な日程確定は人間またはCalendar API側の確定フローに委譲する。
