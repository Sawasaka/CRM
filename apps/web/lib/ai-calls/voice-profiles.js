export const CONVERSATION_RELAY_VOICE_PROFILES = {
  'jp-elevenlabs-telephony': {
    label: 'Japanese ElevenLabs telephony',
    language: 'ja-JP',
    ttsProvider: 'ElevenLabs',
    transcriptionProvider: 'Google',
    voice: '3JDquces8E8bkmvbh6Bc-flash_v2_5-0.92_0.55_0.85',
    speechTimeoutMs: '650',
    interruptSensitivity: 'high',
    reportInputDuringAgentSpeech: 'speech',
    welcome: 'ルーキースマートジャパンのAI受付です。今、少しだけお電話よろしいでしょうか。',
    notes: 'Most natural first test for Japanese phone calls. Slightly higher latency risk than Google.',
  },
  'jp-elevenlabs-ja-male-custom': {
    label: 'Japanese ElevenLabs male custom',
    language: 'ja-JP',
    ttsProvider: 'ElevenLabs',
    transcriptionProvider: 'Google',
    voiceEnvKey: 'ELEVENLABS_JA_MALE_VOICE_ID',
    voice: '3JDquces8E8bkmvbh6Bc-turbo_v2_5-0.92_0.65_0.85',
    speechTimeoutMs: '650',
    interruptSensitivity: 'high',
    reportInputDuringAgentSpeech: 'speech',
    welcome: 'ルーキースマートジャパンのAI受付です。今、少しだけお電話よろしいでしょうか。',
    notes: 'Use this for the selected native-sounding Japanese male ElevenLabs voice. Set ELEVENLABS_JA_MALE_VOICE_ID to the chosen voice ID plus optional model/settings suffix.',
  },
  'jp-google-neural2-b': {
    label: 'Japanese Google Neural2 B - native baseline',
    language: 'ja-JP',
    ttsProvider: 'Google',
    transcriptionProvider: 'Google',
    voice: 'ja-JP-Neural2-B',
    speechTimeoutMs: '650',
    interruptSensitivity: 'high',
    reportInputDuringAgentSpeech: 'speech',
    welcome: 'ルーキースマートジャパンのAI受付です。今、少しだけお電話よろしいでしょうか。',
    notes: 'Native Japanese baseline for phone tests. Prefer this when ElevenLabs sounds non-native.',
  },
  'jp-google-chirp3-hd-charon': {
    label: 'Japanese Google Chirp3 HD Charon - recommended male',
    language: 'ja-JP',
    ttsProvider: 'Google',
    transcriptionProvider: 'Google',
    voice: 'ja-JP-Chirp3-HD-Charon',
    speechTimeoutMs: '520',
    interruptSensitivity: 'high',
    reportInputDuringAgentSpeech: 'speech',
    welcome: 'ルーキースマートジャパンのAI受付です。今、少しだけお電話よろしいでしょうか。',
    notes: 'Recommended native-sounding Japanese male candidate for the Amazon Connect 050 stack. Verify provider support before using through Twilio.',
  },
  'jp-google-chirp3-hd-fenrir': {
    label: 'Japanese Google Chirp3 HD Fenrir',
    language: 'ja-JP',
    ttsProvider: 'Google',
    transcriptionProvider: 'Google',
    voice: 'ja-JP-Chirp3-HD-Fenrir',
    speechTimeoutMs: '520',
    interruptSensitivity: 'high',
    reportInputDuringAgentSpeech: 'speech',
    welcome: 'ルーキースマートジャパンのAI受付です。今、少しだけお電話よろしいでしょうか。',
    notes: 'Alternative Japanese male candidate for A/B tests against Charon.',
  },
  'jp-google-neural2-c': {
    label: 'Japanese Google Neural2 C',
    language: 'ja-JP',
    ttsProvider: 'Google',
    transcriptionProvider: 'Google',
    voice: 'ja-JP-Neural2-C',
    speechTimeoutMs: '650',
    interruptSensitivity: 'high',
    reportInputDuringAgentSpeech: 'speech',
    welcome: 'ルーキースマートジャパンのAI受付です。今、少しだけお電話よろしいでしょうか。',
    notes: 'Stable alternative Japanese voice for A/B testing against Neural2 B.',
  },
  'jp-amazon-takumi-neural': {
    label: 'Japanese Amazon Polly Takumi Neural',
    language: 'ja-JP',
    ttsProvider: 'Amazon',
    transcriptionProvider: 'Google',
    voice: 'Takumi-Neural',
    speechTimeoutMs: '650',
    interruptSensitivity: 'high',
    reportInputDuringAgentSpeech: 'speech',
    welcome: 'ルーキースマートジャパンのAI受付です。今、少しだけお電話よろしいでしょうか。',
    notes: 'Backup vendor path. Useful if ElevenLabs latency is too high or Google sounds unnatural.',
  },
}

export const DEFAULT_CONVERSATION_RELAY_VOICE_PROFILE = 'jp-google-neural2-b'

export function getConversationRelayVoiceProfile(env = process.env) {
  const profileId = env.AI_CALL_VOICE_PROFILE || DEFAULT_CONVERSATION_RELAY_VOICE_PROFILE
  const profile =
    CONVERSATION_RELAY_VOICE_PROFILES[profileId] ||
    CONVERSATION_RELAY_VOICE_PROFILES[DEFAULT_CONVERSATION_RELAY_VOICE_PROFILE]

  return {
    id: CONVERSATION_RELAY_VOICE_PROFILES[profileId] ? profileId : DEFAULT_CONVERSATION_RELAY_VOICE_PROFILE,
    label: profile.label,
    language: env.TWILIO_CONVERSATION_LANGUAGE || profile.language,
    ttsProvider: env.TWILIO_CONVERSATION_TTS_PROVIDER || profile.ttsProvider,
    transcriptionProvider:
      env.TWILIO_CONVERSATION_TRANSCRIPTION_PROVIDER || profile.transcriptionProvider,
    voice: env.TWILIO_CONVERSATION_VOICE || env[profile.voiceEnvKey] || profile.voice,
    speechTimeoutMs: env.TWILIO_CONVERSATION_SPEECH_TIMEOUT_MS || profile.speechTimeoutMs,
    interruptSensitivity:
      env.TWILIO_CONVERSATION_INTERRUPT_SENSITIVITY || profile.interruptSensitivity,
    reportInputDuringAgentSpeech:
      env.TWILIO_CONVERSATION_REPORT_INPUT_DURING_AGENT_SPEECH ||
      profile.reportInputDuringAgentSpeech,
    welcome: env.TWILIO_CONVERSATION_WELCOME || profile.welcome,
    notes: profile.notes,
  }
}
