'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import type React from 'react'
import {
  Bot,
  Check,
  Loader2,
  Mic,
  MicOff,
  PhoneCall,
  PhoneOff,
  Radio,
  RefreshCw,
  SlidersHorizontal,
  Volume2,
} from 'lucide-react'
import { ObsButton, ObsCard, ObsChip, ObsHero, ObsPageShell } from '@/components/obsidian'

type ConnectionState = 'idle' | 'connecting' | 'connected' | 'failed'
type TestProfileKind = 'openai-realtime' | 'gemini-live' | 'phone-stack'
type TestProfile = {
  id: string
  label: string
  shortLabel: string
  kind: TestProfileKind
  badge: string
  model: string
  voice: string
  scenario: string
  knowledge: string
  note: string
}
type ProviderKey = 'mock' | 'amazon_connect_openai' | 'twilio_openai' | 'external'
type ProviderReadiness = {
  provider: ProviderKey
  ready: boolean
  missing: string[]
}
type ReadinessPayload = {
  current: ProviderReadiness
  matrix: Record<ProviderKey, ProviderReadiness>
  recommendedProvider: ProviderKey
  recommendedVoice: string
  qualityPreset: {
    language: string
    bargeIn: string
    silenceDurationMs: number
    oneQuestionAtATime: boolean
    answerStyle: string
  }
}
type LogItem = {
  id: string
  role: 'user' | 'assistant' | 'system'
  text: string
  at: string
}
type BrowserSpeechRecognition = {
  lang: string
  continuous: boolean
  interimResults: boolean
  maxAlternatives: number
  start: () => void
  stop: () => void
  abort: () => void
  onspeechstart: (() => void) | null
  onresult: ((event: any) => void) | null
  onerror: ((event: any) => void) | null
  onend: (() => void) | null
}

const DEFAULT_SCENARIO = [
  'ホームページから相談申し込みをした相手に、30秒から2分で自然にヒアリングする。',
  '最初に短く名乗り、今少し話せるか確認する。',
  'お問い合わせ背景を聞く。',
  '次に求めていることを1つだけ聞く。',
  '次回商談で話すべき議題を確認する。',
].join('\n')

const DEFAULT_KNOWLEDGE = [
  'FDE CRMは、問い合わせ後の即時AIコール、営業ヒアリング、日程調整、CRM活動履歴化を支援する。',
  '強みは、コールネイティブなCRMとして商談化率と受注率を上げること。',
].join('\n')

const TEST_PROFILES: TestProfile[] = [
  {
    id: 'gemini-flash-live-charon',
    label: 'Gemini 3.1 Flash Live / Charon Japanese',
    shortLabel: 'Gemini 3.1 Live',
    kind: 'gemini-live',
    badge: '採用モデル',
    model: 'gemini-3.1-flash-live-preview',
    voice: 'Charon',
    scenario: DEFAULT_SCENARIO,
    knowledge: DEFAULT_KNOWLEDGE,
    note: '低遅延で自然に返答できるGemini Live APIの採用モデルです。',
  },
]
const INITIAL_TEST_PROFILE: TestProfile = TEST_PROFILES[0]!
const GEMINI_INTERIM_SEND_DELAY_MS = 260
const GEMINI_SPEECH_START_RMS = 0.012
const GEMINI_BARGE_IN_START_RMS = 0.04
const GEMINI_SPEECH_CONTINUE_RMS = 0.007
const GEMINI_SPEECH_END_DELAY_MS = 700

export default function CallModelTestPage() {
  const [state, setState] = useState<ConnectionState>('idle')
  const [message, setMessage] = useState<string | null>(null)
  const [logs, setLogs] = useState<LogItem[]>([])
  const [activeProfileId, setActiveProfileId] = useState(INITIAL_TEST_PROFILE.id)
  const [model, setModel] = useState(INITIAL_TEST_PROFILE.model)
  const [voice, setVoice] = useState(INITIAL_TEST_PROFILE.voice)
  const [scenario, setScenario] = useState(INITIAL_TEST_PROFILE.scenario)
  const [knowledge, setKnowledge] = useState(INITIAL_TEST_PROFILE.knowledge)
  const [muted, setMuted] = useState(false)
  const [readiness, setReadiness] = useState<ReadinessPayload | null>(null)
  const [readinessLoading, setReadinessLoading] = useState(false)
  const [testPhone, setTestPhone] = useState('')
  const [testCallLoading, setTestCallLoading] = useState(false)

  const pcRef = useRef<RTCPeerConnection | null>(null)
  const dcRef = useRef<RTCDataChannel | null>(null)
  const localStreamRef = useRef<MediaStream | null>(null)
  const remoteAudioRef = useRef<HTMLAudioElement | null>(null)
  const geminiRelayRef = useRef<WebSocket | null>(null)
  const geminiAudioContextRef = useRef<AudioContext | null>(null)
  const geminiProcessorRef = useRef<ScriptProcessorNode | null>(null)
  const geminiSourceRef = useRef<MediaStreamAudioSourceNode | null>(null)
  const geminiSilentGainRef = useRef<GainNode | null>(null)
  const geminiPlaybackTimeRef = useRef(0)
  const geminiPlaybackSourcesRef = useRef<AudioBufferSourceNode[]>([])
  const geminiUserSpeakingRef = useRef(false)
  const geminiSuppressPlaybackRef = useRef(false)
  const geminiSpeechEndTimerRef = useRef<number | null>(null)
  const geminiIntroSentRef = useRef(false)
  const geminiSpeechRecognitionRef = useRef<BrowserSpeechRecognition | null>(null)
  const geminiSpeechRecognitionActiveRef = useRef(false)
  const geminiSpeechRecognitionPausedRef = useRef(false)
  const geminiInterimSendTimerRef = useRef<number | null>(null)
  const geminiLastSentTranscriptRef = useRef('')
  const mutedRef = useRef(false)

  const connected = state === 'connected'
  const connecting = state === 'connecting'
  const activeProfile = useMemo(
    () => TEST_PROFILES.find((profile) => profile.id === activeProfileId) ?? INITIAL_TEST_PROFILE,
    [activeProfileId],
  )
  const browserConnectable = activeProfile.kind === 'openai-realtime' || activeProfile.kind === 'gemini-live'
  const phoneProfile = activeProfile.kind === 'phone-stack'
  const providerForActiveProfile = getProfileProvider(activeProfile)
  const selectedReadiness = providerForActiveProfile ? readiness?.matrix?.[providerForActiveProfile] ?? null : null
  const currentProviderMatches = providerForActiveProfile ? readiness?.current?.provider === providerForActiveProfile : true
  const phoneReady = Boolean(phoneProfile && selectedReadiness?.ready && currentProviderMatches)

  const statusTone = useMemo(() => {
    if (state === 'connected') return 'middle'
    if (state === 'failed') return 'hot'
    if (state === 'connecting') return 'primary'
    return 'neutral'
  }, [state])

  useEffect(() => {
    void refreshReadiness()
    return () => {
      stopSession()
    }
  }, [])

  useEffect(() => {
    if (connected || connecting) return
    setModel(activeProfile.model)
    setVoice(activeProfile.voice)
    setScenario(activeProfile.scenario)
    setKnowledge(activeProfile.knowledge)
  }, [activeProfile, connected, connecting])

  useEffect(() => {
    mutedRef.current = muted
  }, [muted])

  const addLog = (role: LogItem['role'], text: string) => {
    const trimmed = text.trim()
    if (!trimmed) return
    setLogs((current) => [
      ...current.slice(-80),
      {
        id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        role,
        text: trimmed,
        at: new Date().toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      },
    ])
  }

  const selectProfile = (profile: TestProfile) => {
    if (connected || connecting) return
    setActiveProfileId(profile.id)
    setModel(profile.model)
    setVoice(profile.voice)
    setScenario(profile.scenario)
    setKnowledge(profile.knowledge)
    setMessage(null)
    setLogs([])
  }

  const refreshReadiness = async () => {
    setReadinessLoading(true)
    try {
      const res = await fetch('/api/ai-calls/readiness', { cache: 'no-store' })
      const payload = await res.json().catch(() => null)
      if (!res.ok || !payload) throw new Error(formatReadinessError(payload))
      setReadiness(payload)
      return payload as ReadinessPayload
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'コール設定の診断に失敗しました。')
      return null
    } finally {
      setReadinessLoading(false)
    }
  }

  const startSession = async () => {
    if (connecting || connected) return
    if (activeProfile.kind === 'gemini-live') {
      await startGeminiSession()
      return
    }
    if (!browserConnectable) {
      const payload = await refreshReadiness()
      const provider = getProfileProvider(activeProfile)
      const providerReadiness = provider ? payload?.matrix?.[provider] : null
      const providerMatches = provider ? payload?.current?.provider === provider : true
      setState(providerReadiness?.ready && providerMatches ? 'idle' : 'failed')
      setMessage(formatPhoneReadinessMessage(provider, providerReadiness, providerMatches))
      return
    }
    setState('connecting')
    setMessage(null)
    setLogs([])

    try {
      const sessionRes = await fetch('/api/ai-calls/realtime/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model, voice, scenario, knowledge }),
      })
      const session = await sessionRes.json().catch(() => ({}))
      if (!sessionRes.ok || !session.clientSecret) {
        throw new Error(formatSessionError(session))
      }

      const pc = new RTCPeerConnection()
      pcRef.current = pc

      pc.ontrack = (event) => {
        if (!remoteAudioRef.current) return
        remoteAudioRef.current.srcObject = event.streams[0] ?? null
      }

      pc.onconnectionstatechange = () => {
        if (pc.connectionState === 'connected') {
          setState('connected')
          setMessage('接続しました。')
        }
        if (pc.connectionState === 'failed' || pc.connectionState === 'disconnected') {
          setState('failed')
          setMessage('接続が切れました。')
        }
      }

      const localStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      })
      localStreamRef.current = localStream
      for (const track of localStream.getTracks()) pc.addTrack(track, localStream)

      const dataChannel = pc.createDataChannel('oai-events')
      dcRef.current = dataChannel
      dataChannel.onopen = () => {
        addLog('system', 'Realtime session started.')
        dataChannel.send(
          JSON.stringify({
            type: 'response.create',
            response: {
              instructions: '最初に短く名乗り、今少し話せるか確認してください。',
            },
          }),
        )
      }
      dataChannel.onmessage = (event) => handleRealtimeEvent(event.data)

      const offer = await pc.createOffer()
      await pc.setLocalDescription(offer)

      const sdpRes = await fetch('https://api.openai.com/v1/realtime/calls', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.clientSecret}`,
          'Content-Type': 'application/sdp',
        },
        body: offer.sdp,
      })

      const answer = await sdpRes.text()
      if (!sdpRes.ok) throw new Error(answer || 'Realtime接続に失敗しました。')
      await pc.setRemoteDescription({ type: 'answer', sdp: answer })
      setMessage('AIモデルに接続中です。')
    } catch (err) {
      stopSession()
      setState('failed')
      setMessage(err instanceof Error ? err.message : '接続に失敗しました。')
    }
  }

  const startGeminiSession = async () => {
    setState('connecting')
    setMessage(null)
    setLogs([])

    try {
      const audioContext = new AudioContext()
      await audioContext.resume()
      geminiAudioContextRef.current = audioContext
      geminiPlaybackTimeRef.current = audioContext.currentTime
      const localStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      })
      localStreamRef.current = localStream

      const relay = await connectGeminiRelay()
      geminiRelayRef.current = relay
      geminiIntroSentRef.current = false
      startGeminiSpeechRecognition(relay)
      relay.send(
        JSON.stringify({
          type: 'start',
          model,
          voice,
          systemInstruction: buildGeminiSystemInstruction(scenario, knowledge),
        }),
      )
      setState('connected')
      setMessage('Gemini Live APIに接続しました。')
    } catch (err) {
      stopSession()
      setState('failed')
      setMessage(err instanceof Error ? err.message : 'Gemini Live APIの接続に失敗しました。')
    }
  }

  const handleLiveCardAction = () => {
    if (connected) {
      stopSession()
      return
    }
    void startSession()
  }

  const startTestCall = async () => {
    if (!phoneProfile || testCallLoading) return
    setTestCallLoading(true)
    setMessage(null)
    addLog('system', `Test call request: ${activeProfile.label}`)
    try {
      if (!phoneReady) {
        const payload = await refreshReadiness()
        const provider = getProfileProvider(activeProfile)
        const providerReadiness = provider ? payload?.matrix?.[provider] : null
        const providerMatches = provider ? payload?.current?.provider === provider : true
        throw new Error(formatPhoneReadinessMessage(provider, providerReadiness, providerMatches))
      }
      const normalizedPhone = normalizePhone(testPhone)
      if (!normalizedPhone) throw new Error('テスト発信先の電話番号を入力してください。')
      const res = await fetch('/api/ai-calls/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contactName: 'AIモデル試験',
          companyName: '株式会社ルーキースマートジャパン',
          phone: normalizedPhone,
          purpose: 'AIモデル試験発信',
          script: [
            `プロファイル: ${activeProfile.label}`,
            `モデル: ${model}`,
            `音声: ${voice}`,
            '',
            'シナリオ:',
            scenario,
            '',
            '参照情報:',
            knowledge,
          ].join('\n'),
        }),
      })
      const payload = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(payload?.message || payload?.error || 'テスト発信の開始に失敗しました。')
      addLog('system', `Call queued: ${payload.call?.callId ?? payload.call?.id ?? 'unknown'}`)
      setMessage(payload.call?.summary || 'テスト発信を開始しました。')
    } catch (err) {
      setState('failed')
      const nextMessage = err instanceof Error ? err.message : 'テスト発信に失敗しました。'
      setMessage(nextMessage)
      addLog('system', nextMessage)
    } finally {
      setTestCallLoading(false)
    }
  }

  const stopSession = () => {
    stopGeminiSession()
    dcRef.current?.close()
    dcRef.current = null
    pcRef.current?.close()
    pcRef.current = null
    localStreamRef.current?.getTracks().forEach((track) => track.stop())
    localStreamRef.current = null
    setMuted(false)
    setState((current) => (current === 'idle' ? current : 'idle'))
  }

  const stopGeminiSession = () => {
    try {
      geminiRelayRef.current?.send(JSON.stringify({ type: 'audio_stream_end' }))
    } catch {}
    try {
      geminiRelayRef.current?.close?.()
    } catch {}
    geminiRelayRef.current = null
    geminiProcessorRef.current?.disconnect()
    geminiProcessorRef.current = null
    geminiSourceRef.current?.disconnect()
    geminiSourceRef.current = null
    geminiSilentGainRef.current?.disconnect()
    geminiSilentGainRef.current = null
    for (const source of geminiPlaybackSourcesRef.current) {
      try {
        source.stop()
      } catch {}
      source.disconnect()
    }
    geminiPlaybackSourcesRef.current = []
    geminiPlaybackTimeRef.current = 0
    geminiUserSpeakingRef.current = false
    geminiSuppressPlaybackRef.current = false
    geminiIntroSentRef.current = false
    geminiSpeechRecognitionActiveRef.current = false
    geminiSpeechRecognitionPausedRef.current = false
    geminiLastSentTranscriptRef.current = ''
    if (geminiInterimSendTimerRef.current) {
      window.clearTimeout(geminiInterimSendTimerRef.current)
      geminiInterimSendTimerRef.current = null
    }
    try {
      geminiSpeechRecognitionRef.current?.abort()
    } catch {}
    geminiSpeechRecognitionRef.current = null
    if (geminiSpeechEndTimerRef.current) {
      window.clearTimeout(geminiSpeechEndTimerRef.current)
      geminiSpeechEndTimerRef.current = null
    }
    void geminiAudioContextRef.current?.close().catch(() => {})
    geminiAudioContextRef.current = null
  }

  const toggleMute = () => {
    const next = !muted
    localStreamRef.current?.getAudioTracks().forEach((track) => {
      track.enabled = !next
    })
    setMuted(next)
  }

  const handleRealtimeEvent = (raw: string) => {
    const event = parseRealtimeEvent(raw)
    if (!event) return

    if (event.type === 'input_audio_buffer.speech_started') {
      addLog('system', 'User speech started.')
      return
    }
    if (event.type === 'conversation.item.input_audio_transcription.completed') {
      addLog('user', stringFrom(event.transcript))
      return
    }
    if (event.type === 'response.audio_transcript.done') {
      addLog('assistant', stringFrom(event.transcript))
      return
    }
    if (event.type === 'response.done') {
      const output = event.response?.output?.flatMap((item: any) => item.content ?? []) ?? []
      for (const content of output) {
        if (typeof content?.transcript === 'string') addLog('assistant', content.transcript)
        if (typeof content?.text === 'string') addLog('assistant', content.text)
      }
      return
    }
    if (event.type === 'error') {
      addLog('system', stringFrom(event.error?.message) || 'Realtime error.')
    }
  }

  const connectGeminiRelay = () =>
    new Promise<WebSocket>((resolve, reject) => {
      const relay = new WebSocket(buildGeminiRelayUrl())
      const timeout = window.setTimeout(() => {
        relay.close()
        reject(new Error('Gemini Live Relayに接続できませんでした。Relayサーバーが起動しているか確認してください。'))
      }, 6000)

      relay.onopen = () => {
        window.clearTimeout(timeout)
        addLog('system', 'Gemini Live relay connected.')
        resolve(relay)
      }
      relay.onerror = () => {
        window.clearTimeout(timeout)
        reject(new Error('Gemini Live Relay接続でエラーが発生しました。'))
      }
      relay.onmessage = (event) => {
        const message = parseJson(event.data)
        if (!message) return
        if (message.type === 'google_event') {
          handleGeminiLiveEvent(message.event)
          return
        }
        if (message.type === 'error') {
          const errorMessage = stringFrom(message.message) || 'Gemini Live Relay error.'
          addLog('system', errorMessage)
          setState('failed')
          setMessage(errorMessage)
          return
        }
        if (message.type === 'closed') {
          const detail = [message.code ? `code ${message.code}` : '', stringFrom(message.reason)].filter(Boolean).join(' / ')
          const closeMessage = detail ? `Gemini Live session closed: ${detail}` : 'Gemini Live session closed.'
          addLog('system', closeMessage)
          setState((current) => (current === 'connected' ? 'idle' : current))
        }
      }
      relay.onclose = (event) => {
        window.clearTimeout(timeout)
        if (geminiRelayRef.current !== relay) return
        const detail = [event.code ? `code ${event.code}` : '', event.reason].filter(Boolean).join(' / ')
        addLog('system', detail ? `Gemini Live relay closed: ${detail}` : 'Gemini Live relay closed.')
        setState((current) => (current === 'connected' ? 'idle' : current))
      }
    })

  const handleGeminiLiveEvent = (event: any) => {
    const content = event?.serverContent
    if (event?.setupComplete) {
      addLog('system', 'Gemini Live setup complete.')
      if (!geminiIntroSentRef.current && geminiRelayRef.current?.readyState === WebSocket.OPEN) {
        geminiIntroSentRef.current = true
        geminiRelayRef.current.send(
          JSON.stringify({
            type: 'client_content',
            text: '最初に短く名乗り、今少し話せるかだけ確認してください。',
          }),
        )
      }
      return
    }
    if (!content) return
    if (content.interrupted) {
      stopGeminiPlayback()
      addLog('system', 'Gemini response interrupted.')
    }
    if (typeof content.inputTranscription?.text === 'string') {
      addLog('user', content.inputTranscription.text)
    }
    if (typeof content.outputTranscription?.text === 'string') {
      addLog('assistant', content.outputTranscription.text)
    }
    const parts = Array.isArray(content.modelTurn?.parts) ? content.modelTurn.parts : []
    for (const part of parts) {
      if (typeof part.text === 'string') addLog('assistant', part.text)
      const inlineData = part.inlineData
      if (inlineData?.data && typeof inlineData.data === 'string') {
        playGeminiPcmAudio(inlineData.data, sampleRateFromMimeType(inlineData.mimeType) ?? 24000)
      }
    }
  }

  const startGeminiSpeechRecognition = (relay: WebSocket) => {
    const SpeechRecognitionConstructor =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognitionConstructor) {
      addLog('system', 'このブラウザでは音声認識が使えません。Chromeで開いてください。')
      return
    }

    const recognition = new SpeechRecognitionConstructor() as BrowserSpeechRecognition
    recognition.lang = 'ja-JP'
    recognition.continuous = true
    recognition.interimResults = true
    recognition.maxAlternatives = 1
    geminiSpeechRecognitionActiveRef.current = true
    geminiSpeechRecognitionRef.current = recognition

    recognition.onspeechstart = () => {
      stopGeminiPlayback()
      addLog('system', 'User speech detected.')
    }
    recognition.onresult = (event: any) => {
      let finalText = ''
      let interimText = ''
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const result = event.results[i]
        const transcript = result?.[0]?.transcript ?? ''
        if (result?.isFinal) {
          finalText += transcript
        } else {
          interimText += transcript
        }
      }
      const finalTranscript = finalText.trim()
      if (finalTranscript) {
        sendGeminiUserTranscript(relay, finalTranscript, 'final')
        return
      }

      const interimTranscript = interimText.trim()
      if (interimTranscript.length >= 4) {
        if (geminiInterimSendTimerRef.current) window.clearTimeout(geminiInterimSendTimerRef.current)
        geminiInterimSendTimerRef.current = window.setTimeout(() => {
          geminiInterimSendTimerRef.current = null
          sendGeminiUserTranscript(relay, interimTranscript, 'interim')
        }, GEMINI_INTERIM_SEND_DELAY_MS)
      }
    }
    recognition.onerror = (event: any) => {
      const error = stringFrom(event?.error)
      if (error && error !== 'no-speech' && error !== 'aborted') {
        addLog('system', `Speech recognition error: ${error}`)
      }
    }
    recognition.onend = () => {
      if (
        !geminiSpeechRecognitionActiveRef.current ||
        geminiSpeechRecognitionPausedRef.current ||
        geminiRelayRef.current !== relay
      ) {
        return
      }
      window.setTimeout(() => {
        if (
          !geminiSpeechRecognitionActiveRef.current ||
          geminiSpeechRecognitionPausedRef.current ||
          geminiRelayRef.current !== relay
        ) {
          return
        }
        try {
          recognition.start()
        } catch {}
      }, 40)
    }

    try {
      recognition.start()
      addLog('system', 'Browser speech recognition started.')
    } catch {
      addLog('system', 'Browser speech recognition could not start.')
    }
  }

  const sendGeminiUserTranscript = (relay: WebSocket, transcript: string, source: 'final' | 'interim') => {
    const normalized = transcript.replace(/\s+/g, ' ').trim()
    if (!normalized || normalized === geminiLastSentTranscriptRef.current) return
    if (geminiInterimSendTimerRef.current) {
      window.clearTimeout(geminiInterimSendTimerRef.current)
      geminiInterimSendTimerRef.current = null
    }
    geminiLastSentTranscriptRef.current = normalized
    addLog('user', source === 'interim' ? `${normalized} ...` : normalized)
    if (geminiRelayRef.current === relay && relay.readyState === WebSocket.OPEN) {
      relay.send(JSON.stringify({ type: 'client_content', text: normalized }))
    }
  }

  const startGeminiMicrophoneStreaming = (stream: MediaStream, audioContext: AudioContext, relay: WebSocket) => {
    const source = audioContext.createMediaStreamSource(stream)
    const processor = audioContext.createScriptProcessor(2048, 1, 1)
    const silentGain = audioContext.createGain()
    silentGain.gain.value = 0
    processor.onaudioprocess = (event) => {
      if (!geminiRelayRef.current || relay.readyState !== WebSocket.OPEN || mutedRef.current) return
      const input = event.inputBuffer.getChannelData(0)
      const shouldSendAudio = handleGeminiLocalSpeechActivity(input, relay)
      if (!shouldSendAudio) return
      const pcm = floatTo16BitPcm(downsampleFloat32(input, audioContext.sampleRate, 16000))
      relay.send(
        JSON.stringify({
          type: 'audio',
          data: arrayBufferToBase64(pcm.buffer),
          mimeType: 'audio/pcm;rate=16000',
        }),
      )
    }
    source.connect(processor)
    processor.connect(silentGain)
    silentGain.connect(audioContext.destination)
    geminiSourceRef.current = source
    geminiProcessorRef.current = processor
    geminiSilentGainRef.current = silentGain
  }

  const handleGeminiLocalSpeechActivity = (input: Float32Array, relay: WebSocket) => {
    const rms = calculateRms(input)
    const assistantPlaying = hasGeminiPlayback()
    const speechStarted = rms > (assistantPlaying ? GEMINI_BARGE_IN_START_RMS : GEMINI_SPEECH_START_RMS)
    const speechContinues = rms > GEMINI_SPEECH_CONTINUE_RMS

    if (speechStarted && !geminiUserSpeakingRef.current) {
      geminiUserSpeakingRef.current = true
      geminiSuppressPlaybackRef.current = assistantPlaying
      if (geminiSpeechEndTimerRef.current) {
        window.clearTimeout(geminiSpeechEndTimerRef.current)
        geminiSpeechEndTimerRef.current = null
      }
      if (geminiSuppressPlaybackRef.current) stopGeminiPlayback()
      relay.send(JSON.stringify({ type: 'activity_start' }))
      addLog('system', 'User speech activity started.')
      return true
    }

    if (speechContinues && geminiSpeechEndTimerRef.current) {
      window.clearTimeout(geminiSpeechEndTimerRef.current)
      geminiSpeechEndTimerRef.current = null
      return true
    }

    if (!speechContinues && geminiUserSpeakingRef.current && !geminiSpeechEndTimerRef.current) {
      geminiSpeechEndTimerRef.current = window.setTimeout(() => {
        geminiUserSpeakingRef.current = false
        geminiSuppressPlaybackRef.current = false
        geminiSpeechEndTimerRef.current = null
        if (geminiRelayRef.current === relay && relay.readyState === WebSocket.OPEN) {
          relay.send(JSON.stringify({ type: 'activity_end' }))
          addLog('system', 'User speech activity ended.')
        }
      }, GEMINI_SPEECH_END_DELAY_MS)
    }
    return geminiUserSpeakingRef.current
  }

  const playGeminiPcmAudio = (base64: string, sampleRate: number) => {
    const audioContext = geminiAudioContextRef.current
    if (!audioContext) return
    if (geminiSuppressPlaybackRef.current) return
    const pcm = base64ToInt16Array(base64)
    if (pcm.length === 0) return
    pauseGeminiSpeechRecognition()
    const buffer = audioContext.createBuffer(1, pcm.length, sampleRate)
    const channel = buffer.getChannelData(0)
    for (let i = 0; i < pcm.length; i += 1) channel[i] = Math.max(-1, Math.min(1, pcm[i]! / 32768))
    const source = audioContext.createBufferSource()
    source.buffer = buffer
    source.connect(audioContext.destination)
    const startAt = Math.max(audioContext.currentTime + 0.02, geminiPlaybackTimeRef.current)
    source.start(startAt)
    geminiPlaybackTimeRef.current = startAt + buffer.duration
    geminiPlaybackSourcesRef.current.push(source)
    source.onended = () => {
      geminiPlaybackSourcesRef.current = geminiPlaybackSourcesRef.current.filter((item) => item !== source)
      source.disconnect()
      if (!hasGeminiPlayback()) resumeGeminiSpeechRecognition()
    }
  }

  const pauseGeminiSpeechRecognition = () => {
    const recognition = geminiSpeechRecognitionRef.current
    if (!recognition || geminiSpeechRecognitionPausedRef.current) return
    geminiSpeechRecognitionPausedRef.current = true
    try {
      recognition.stop()
    } catch {}
  }

  const resumeGeminiSpeechRecognition = () => {
    const recognition = geminiSpeechRecognitionRef.current
    if (!recognition || !geminiSpeechRecognitionActiveRef.current) return
    geminiSpeechRecognitionPausedRef.current = false
    window.setTimeout(() => {
      if (!geminiSpeechRecognitionActiveRef.current || geminiSpeechRecognitionPausedRef.current) return
      try {
        recognition.start()
      } catch {}
    }, 40)
  }

  const hasGeminiPlayback = () => {
    const audioContext = geminiAudioContextRef.current
    if (!audioContext) return geminiPlaybackSourcesRef.current.length > 0
    return geminiPlaybackSourcesRef.current.length > 0 || geminiPlaybackTimeRef.current > audioContext.currentTime + 0.05
  }

  const stopGeminiPlayback = () => {
    for (const source of geminiPlaybackSourcesRef.current) {
      try {
        source.stop()
      } catch {}
      source.disconnect()
    }
    geminiPlaybackSourcesRef.current = []
    geminiPlaybackTimeRef.current = geminiAudioContextRef.current?.currentTime ?? 0
  }

  return (
    <ObsPageShell>
      <div className="w-full px-8 xl:px-12 2xl:px-16 pb-16">
        <ObsHero
          eyebrow="Call AI Model"
          title="AIモデル試験"
          caption="Gemini 3.1 Liveで、日本語の自然さ、応答速度、割り込みを検証。"
          action={
            <div className="flex items-center gap-2">
              <ObsChip tone={statusTone}>{statusLabel(state)}</ObsChip>
              {connected ? (
                <ObsButton onClick={stopSession}>
                  <span className="inline-flex items-center gap-2">
                    <PhoneOff size={14} />
                    切断
                  </span>
                </ObsButton>
              ) : (
                <ObsButton onClick={startSession} disabled={connecting}>
                  <span className="inline-flex items-center gap-2">
                    {connecting ? <Loader2 size={14} className="animate-spin" /> : <Radio size={14} />}
                    {browserConnectable ? '接続' : '設定診断'}
                  </span>
                </ObsButton>
              )}
            </div>
          }
        />

        <div className="mb-5">
          <div
            role="tablist"
            aria-label="AIモデル試験プロファイル"
            className="grid max-w-[320px] grid-cols-1 gap-2"
          >
            {TEST_PROFILES.map((profile) => {
              const active = profile.id === activeProfileId
              return (
                <button
                  key={profile.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  disabled={connected || connecting}
                  onClick={() => selectProfile(profile)}
                  className="min-h-[74px] rounded-[12px] px-3 py-3 text-left transition disabled:cursor-not-allowed disabled:opacity-60"
                  style={{
                    background: active ? 'rgba(171,199,255,0.14)' : 'rgba(255,255,255,0.035)',
                    color: active ? '#f3f7ff' : '#c7c5c9',
                    boxShadow: active
                      ? 'inset 0 0 0 1px rgba(171,199,255,0.42), 0 12px 30px rgba(0,113,227,0.12)'
                      : 'inset 0 0 0 1px rgba(171,199,255,0.12)',
                  }}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-[13px] font-semibold">{profile.shortLabel}</span>
                    {active && <Check size={14} color="#abc7ff" />}
                  </div>
                  <div className="mt-2 truncate text-[11px] text-[#9b99a0]">{profile.label}</div>
                  <div className="mt-2 inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold text-[#abc7ff] ring-1 ring-[#abc7ff33]">
                    {profile.badge}
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.15fr)_minmax(360px,0.85fr)]">
          <ObsCard depth="high" padding="lg" radius="xl">
            <div className="flex items-center justify-between gap-4">
              <SectionTitle icon={<Volume2 size={17} />} title="ライブ通話" />
              <button
                type="button"
                onClick={toggleMute}
                disabled={!connected}
                className="inline-flex h-9 items-center gap-2 rounded-[9px] px-3 text-[12px] font-medium disabled:cursor-not-allowed disabled:opacity-40"
                style={{
                  color: muted ? '#ffb2b2' : '#cfdcff',
                  background: muted ? 'rgba(255,107,107,0.10)' : 'rgba(171,199,255,0.08)',
                  boxShadow: muted
                    ? 'inset 0 0 0 1px rgba(255,107,107,0.22)'
                    : 'inset 0 0 0 1px rgba(171,199,255,0.18)',
                }}
              >
                {muted ? <MicOff size={14} /> : <Mic size={14} />}
                {muted ? 'ミュート中' : 'マイク'}
              </button>
            </div>

            <div className="mt-6 grid min-h-[360px] grid-cols-1 gap-4 lg:grid-cols-[220px_minmax(0,1fr)]">
              <button
                type="button"
                onClick={handleLiveCardAction}
                disabled={connecting}
                aria-label={liveCardActionLabel(connected, browserConnectable)}
                className="group flex flex-col items-center justify-center rounded-[16px] px-5 py-8 text-center outline-none transition disabled:cursor-wait"
                style={{
                  background:
                    state === 'connected'
                      ? 'radial-gradient(circle at 50% 36%, rgba(171,199,255,0.20), rgba(255,255,255,0.035) 54%, rgba(255,255,255,0.02))'
                      : 'rgba(255,255,255,0.035)',
                  boxShadow:
                    state === 'connected'
                      ? '0 0 24px rgba(91,221,139,0.12), inset 0 0 0 1px rgba(91,221,139,0.24)'
                      : state === 'failed'
                        ? 'inset 0 0 0 1px rgba(255,107,107,0.25)'
                        : 'inset 0 0 0 1px rgba(171,199,255,0.12)',
                }}
              >
                <div
                  className="flex h-24 w-24 items-center justify-center rounded-full transition group-hover:scale-[1.03]"
                  style={{
                    background: 'linear-gradient(145deg, rgba(171,199,255,0.18), rgba(0,113,227,0.16))',
                    boxShadow:
                      state === 'connected'
                        ? '0 0 34px rgba(171,199,255,0.34), inset 0 0 0 1px rgba(255,255,255,0.18)'
                        : 'inset 0 0 0 1px rgba(255,255,255,0.10)',
                  }}
                >
                  {connecting ? (
                    <Loader2 size={34} color="#dbe6ff" className="animate-spin" />
                  ) : connected ? (
                    <PhoneOff size={34} color="#dbe6ff" />
                  ) : (
                    <Bot size={34} color="#dbe6ff" />
                  )}
                </div>
                <p className="mt-4 text-[13px] font-medium text-[#e7e5ea]">{model}</p>
                <p className="mt-1 text-[12px] text-[#9b99a0]">voice: {voice}</p>
                <div
                  className="mt-4 inline-flex h-8 items-center gap-2 rounded-full px-3 text-[11.5px] font-semibold"
                  style={{
                    color: connected ? '#baf2d0' : '#cfdcff',
                    background: connected ? 'rgba(91,221,139,0.10)' : 'rgba(171,199,255,0.09)',
                    boxShadow: connected
                      ? 'inset 0 0 0 1px rgba(91,221,139,0.24)'
                      : 'inset 0 0 0 1px rgba(171,199,255,0.18)',
                  }}
                >
                  {connected ? <PhoneOff size={13} /> : <Radio size={13} />}
                  {connecting ? '接続中' : liveCardActionLabel(connected, browserConnectable)}
                </div>
                <p className="mt-3 text-[11px] text-[#7e7c83]">{activeProfile.badge}</p>
              </button>

              <div className="space-y-3 overflow-hidden">
                <audio ref={remoteAudioRef} autoPlay />
                <div className="h-[360px] overflow-y-auto rounded-[16px] p-4" style={{ background: 'rgba(255,255,255,0.035)' }}>
                  {logs.length === 0 ? (
                    <div className="flex h-full items-center justify-center text-[13px] text-[#7e7c83]">
                      {connecting ? '接続しています。' : '接続するとログが表示されます。'}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {logs.map((log) => (
                        <div key={log.id} className={log.role === 'user' ? 'text-right' : 'text-left'}>
                          <div
                            className="inline-block max-w-[82%] rounded-[12px] px-3 py-2 text-left text-[13px] leading-relaxed"
                            style={{
                              color: log.role === 'system' ? '#9b99a0' : '#e7e5ea',
                              background:
                                log.role === 'user'
                                  ? 'rgba(171,199,255,0.12)'
                                  : log.role === 'assistant'
                                    ? 'rgba(255,255,255,0.065)'
                                    : 'transparent',
                              boxShadow:
                                log.role === 'system'
                                  ? 'none'
                                  : 'inset 0 0 0 1px rgba(171,199,255,0.11)',
                            }}
                          >
                            <div className="mb-1 text-[10px] uppercase tracking-[0.08em] text-[#7e7c83]">
                              {log.role} · {log.at}
                            </div>
                            {log.text}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {message && (
              <div
                className="mt-4 rounded-[10px] px-4 py-3 text-[12.5px]"
                style={{
                  color: state === 'failed' ? '#ff8d8d' : '#9ee8bd',
                  background: state === 'failed' ? 'rgba(255,107,107,0.08)' : 'rgba(91,221,139,0.08)',
                  boxShadow:
                    state === 'failed'
                      ? 'inset 0 0 0 1px rgba(255,107,107,0.20)'
                      : 'inset 0 0 0 1px rgba(91,221,139,0.20)',
                }}
              >
                {message}
              </div>
            )}
          </ObsCard>

          <ObsCard depth="high" padding="lg" radius="xl">
            <SectionTitle icon={<SlidersHorizontal size={17} />} title="モデル設定" />
            <div
              className="mt-4 rounded-[12px] px-4 py-3 text-[12.5px] leading-relaxed"
              style={{
                color: '#c7c5c9',
                background: 'rgba(171,199,255,0.055)',
                boxShadow: 'inset 0 0 0 1px rgba(171,199,255,0.12)',
              }}
            >
              <div className="font-semibold text-[#e7e5ea]">{activeProfile.label}</div>
              <div className="mt-1">{activeProfile.note}</div>
            </div>
            {phoneProfile && (
              <div
                className="mt-4 rounded-[14px] p-4"
                style={{
                  background: 'rgba(255,255,255,0.035)',
                  boxShadow: 'inset 0 0 0 1px rgba(171,199,255,0.13)',
                }}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="text-[12px] font-semibold text-[#e7e5ea]">電話発信診断</div>
                    <div className="mt-1 text-[11.5px] text-[#9b99a0]">
                      {providerForActiveProfile ? providerLabel(providerForActiveProfile) : 'ブラウザ試験'} / 現在:{' '}
                      {readiness?.current?.provider ? providerLabel(readiness.current.provider) : '確認中'}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => void refreshReadiness()}
                    disabled={readinessLoading}
                    className="inline-flex h-8 items-center gap-2 rounded-[8px] px-3 text-[11.5px] font-semibold disabled:opacity-50"
                    style={{
                      color: '#cfdcff',
                      background: 'rgba(171,199,255,0.08)',
                      boxShadow: 'inset 0 0 0 1px rgba(171,199,255,0.18)',
                    }}
                  >
                    {readinessLoading ? <Loader2 size={13} className="animate-spin" /> : <RefreshCw size={13} />}
                    再診断
                  </button>
                </div>
                <div className="mt-3">
                  <ObsChip tone={phoneReady ? 'middle' : 'hot'}>
                    {phoneReady ? '実電話テスト可能' : '設定未完了'}
                  </ObsChip>
                </div>
                {!currentProviderMatches && providerForActiveProfile && (
                  <div className="mt-3 rounded-[10px] px-3 py-2 text-[12px] text-[#ffb2b2] ring-1 ring-[#ff6b6b33]">
                    AI_CALL_PROVIDER を {providerForActiveProfile} にすると、このプロファイルで発信できます。
                  </div>
                )}
                {selectedReadiness && selectedReadiness.missing.length > 0 && (
                  <div className="mt-3 rounded-[10px] px-3 py-2 text-[12px] text-[#c7c5c9] ring-1 ring-[#abc7ff22]">
                    <div className="mb-1 font-semibold text-[#e7e5ea]">不足している設定</div>
                    <div className="break-words text-[#9b99a0]">{selectedReadiness.missing.join(', ')}</div>
                  </div>
                )}
                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
                  <label className="block">
                    <span className={LABEL_CLASS}>テスト発信先</span>
                    <input
                      value={testPhone}
                      onChange={(e) => setTestPhone(e.target.value)}
                      placeholder="09012345678"
                      inputMode="tel"
                      className={INPUT_CLASS}
                      style={INPUT_STYLE}
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => void startTestCall()}
                    disabled={testCallLoading || !testPhone.trim()}
                    className="mt-6 inline-flex h-10 items-center justify-center gap-2 rounded-[10px] px-4 text-[12.5px] font-semibold disabled:cursor-not-allowed disabled:opacity-45"
                    style={{
                      color: '#f3f7ff',
                      background: phoneReady ? 'linear-gradient(135deg, #67a9ff, #2f80ed)' : 'rgba(171,199,255,0.13)',
                      boxShadow: phoneReady
                        ? '0 10px 26px rgba(47,128,237,0.25), inset 0 0 0 1px rgba(255,255,255,0.18)'
                        : 'inset 0 0 0 1px rgba(171,199,255,0.18)',
                    }}
                  >
                    {testCallLoading ? <Loader2 size={14} className="animate-spin" /> : <PhoneCall size={14} />}
                    テスト発信
                  </button>
                </div>
                <p className="mt-3 text-[11.5px] leading-relaxed text-[#7e7c83]">
                  準備完了前に押した場合は発信せず、不足設定を表示します。発信は明示操作時だけ行います。
                </p>
              </div>
            )}
            <div className="mt-5 space-y-4">
              <TextField label="モデル" value={model} onChange={setModel} />
              <TextField label="音声" value={voice} onChange={setVoice} />
              <TextArea label="シナリオ" value={scenario} onChange={setScenario} rows={8} />
              <TextArea label="参照情報" value={knowledge} onChange={setKnowledge} rows={7} />
            </div>
          </ObsCard>
        </div>
      </div>
    </ObsPageShell>
  )
}

function SectionTitle({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-2 text-[#e7e5ea]">
      <span className="text-[#abc7ff]">{icon}</span>
      <h2 className="text-[15px] font-semibold">{title}</h2>
    </div>
  )
}

function TextField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="block">
      <span className={LABEL_CLASS}>{label}</span>
      <input value={value} onChange={(e) => onChange(e.target.value)} className={INPUT_CLASS} style={INPUT_STYLE} />
    </label>
  )
}

function TextArea({
  label,
  value,
  onChange,
  rows,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  rows: number
}) {
  return (
    <label className="block">
      <span className={LABEL_CLASS}>{label}</span>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        className={`${INPUT_CLASS} h-auto resize-y py-2.5 leading-relaxed`}
        style={INPUT_STYLE}
      />
    </label>
  )
}

function statusLabel(state: ConnectionState) {
  if (state === 'connecting') return '接続中'
  if (state === 'connected') return '通話中'
  if (state === 'failed') return 'エラー'
  return '待機'
}

function liveCardActionLabel(connected: boolean, browserConnectable: boolean) {
  if (connected) return '切断'
  return browserConnectable ? 'ここを押して接続' : 'ここを押して設定診断'
}

function parseRealtimeEvent(raw: string) {
  try {
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === 'object' ? parsed : null
  } catch {
    return null
  }
}

function stringFrom(value: unknown) {
  return typeof value === 'string' ? value : ''
}

function formatSessionError(session: any) {
  if (Array.isArray(session?.missing) && session.missing.length > 0) {
    return `未設定: ${session.missing.join(', ')}`
  }
  if (typeof session?.error === 'string') return session.error
  if (session?.detail?.error?.message) return session.detail.error.message
  return 'Realtimeセッションの作成に失敗しました。'
}

function buildGeminiSystemInstruction(scenario: string, knowledge: string) {
  return [
    'あなたは株式会社ルーキースマートジャパンの日本語コールAIです。',
    '日本語の電話として自然に、短く、落ち着いて話します。',
    '相手の発話が終わったら間を空けすぎず、すぐに返答を始めます。',
    'AIであることは隠さず、人間本人だと誤解させてはいけません。',
    '一度に質問は1つだけです。',
    '相手が話し始めたら途中でも止まり、相手の発話を優先します。',
    '返答は原則1文です。必要な場合だけ2文にします。ただし、ユーザーが発話時間や長さを明示した場合は指定を優先します。',
    '確認する項目は、お問い合わせ背景、今後のステップ、次回商談で話すべき議題、温度感です。',
    scenario ? `\n現在のテストシナリオ:\n${scenario}` : '',
    knowledge ? `\n参照情報:\n${knowledge}` : '',
  ].join('\n')
}

function buildGeminiRelayUrl() {
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
  const hostname = ['localhost', '127.0.0.1', ''].includes(window.location.hostname)
    ? '127.0.0.1'
    : window.location.hostname
  return `${protocol}//${hostname}:8787/gemini-live`
}

function parseJson(value: unknown) {
  if (typeof value !== 'string') return null
  try {
    return JSON.parse(value)
  } catch {
    return null
  }
}

function formatReadinessError(payload: any) {
  if (typeof payload?.error === 'string') return payload.error
  return 'コール設定の診断に失敗しました。'
}

function getProfileProvider(profile: TestProfile): ProviderKey | null {
  if (profile.kind === 'phone-stack') return 'amazon_connect_openai'
  return null
}

function downsampleFloat32(input: Float32Array, inputSampleRate: number, outputSampleRate: number) {
  if (outputSampleRate === inputSampleRate) return input
  const ratio = inputSampleRate / outputSampleRate
  const length = Math.floor(input.length / ratio)
  const output = new Float32Array(length)
  for (let i = 0; i < length; i += 1) {
    const start = Math.floor(i * ratio)
    const end = Math.min(Math.floor((i + 1) * ratio), input.length)
    let sum = 0
    for (let j = start; j < end; j += 1) sum += input[j] ?? 0
    output[i] = sum / Math.max(1, end - start)
  }
  return output
}

function calculateRms(input: Float32Array) {
  if (input.length === 0) return 0
  let sum = 0
  for (let i = 0; i < input.length; i += 1) {
    const sample = input[i] ?? 0
    sum += sample * sample
  }
  return Math.sqrt(sum / input.length)
}

function floatTo16BitPcm(input: Float32Array) {
  const output = new Int16Array(input.length)
  for (let i = 0; i < input.length; i += 1) {
    const sample = Math.max(-1, Math.min(1, input[i] ?? 0))
    output[i] = sample < 0 ? sample * 0x8000 : sample * 0x7fff
  }
  return output
}

function arrayBufferToBase64(buffer: ArrayBufferLike) {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  const chunkSize = 0x8000
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize))
  }
  return btoa(binary)
}

function base64ToInt16Array(base64: string) {
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i)
  return new Int16Array(bytes.buffer)
}

function sampleRateFromMimeType(mimeType: unknown) {
  if (typeof mimeType !== 'string') return null
  const match = mimeType.match(/rate=(\d+)/i)
  return match ? Number(match[1]) : null
}

function providerLabel(provider: ProviderKey) {
  switch (provider) {
    case 'amazon_connect_openai':
      return 'Amazon Connect'
    case 'twilio_openai':
      return 'Twilio'
    case 'external':
      return 'External'
    case 'mock':
      return 'Mock'
    default:
      return provider
  }
}

function formatPhoneReadinessMessage(
  provider: ProviderKey | null,
  readiness: ProviderReadiness | null | undefined,
  providerMatches: boolean,
) {
  if (!provider) return 'このプロファイルはブラウザ接続用です。'
  if (!providerMatches) {
    return `現在のAI_CALL_PROVIDERが${providerLabel(provider)}ではありません。AI_CALL_PROVIDER=${provider} に変更してください。`
  }
  if (!readiness) return '電話発信設定を確認できませんでした。'
  if (readiness.ready) return `${providerLabel(provider)}の電話発信設定は準備できています。テスト発信先を入力してください。`
  return `電話発信の設定が未完了です。未設定: ${readiness.missing.join(', ')}`
}

function normalizePhone(value: string) {
  const trimmed = value.trim()
  if (!trimmed) return ''
  if (trimmed.startsWith('+')) return trimmed.replace(/[^\d+]/g, '')
  const digits = trimmed.replace(/\D/g, '')
  if (digits.startsWith('81')) return `+${digits}`
  if (digits.startsWith('0')) return `+81${digits.slice(1)}`
  return digits
}

const LABEL_CLASS = 'text-[10.5px] font-semibold uppercase tracking-[0.08em] text-[#9b99a0]'
const INPUT_CLASS = 'mt-1.5 h-10 w-full rounded-[10px] px-3 text-[13px] outline-none transition-colors'
const INPUT_STYLE: React.CSSProperties = {
  background: 'rgba(255,255,255,0.04)',
  color: '#e7e5ea',
  boxShadow: 'inset 0 0 0 1px rgba(171,199,255,0.18)',
}
