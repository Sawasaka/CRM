import {
  AbsoluteFill,
  Audio,
  Easing,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion'

const qaFlow = [
  {
    question: '月額費用は、どのくらいから見ればいいですか？',
    answer:
      '月額は構築範囲によって変わります。まず既存ツールと運用範囲を確認し、必要な構成だけを見積もります。',
    sales:
      '月額は構築範囲で変わります。まず既存ツールを確認して、必要な構成だけでお見積もりします。',
    source: '料金プラン.md',
    note: '個別見積もり / 小さく開始',
    start: 30,
  },
  {
    question: 'NotionやObsidianの既存資料も検索できますか？',
    answer:
      'はい。議事録、FAQ、提案資料、顧客メモを整理し、商談中にAIが参照できるナレッジ基盤として接続できます。',
    sales:
      'はい。既存資料を整理して接続できます。商談中でも関連するFAQや提案資料をすぐ参照できます。',
    source: 'Obsidian連携.md',
    note: '既存資料 / FAQ / 提案資料',
    start: 118,
  },
  {
    question: '導入は何から始めるのがよいですか？',
    answer:
      '最初は議事録とFAQの連携から始めると、営業現場で効果を確認しやすいです。その後CRMやCall AIへ広げます。',
    sales:
      'まずは議事録とFAQ連携から始めるのがおすすめです。効果を確認してからCRMやCall AIへ広げます。',
    source: '導入ロードマップ.md',
    note: '議事録 → FAQ → CRM / Call AI',
    start: 206,
  },
]

const firstQa = qaFlow[0]!
const secondQa = qaFlow[1]!
const thirdQa = qaFlow[2]!

const appear = (frame: number, start: number, end: number) =>
  interpolate(frame, [start, end], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  })

const activeIndexForFrame = (frame: number) => {
  if (frame >= thirdQa.start) return 2
  if (frame >= secondQa.start) return 1
  return 0
}

export const RealtimeSalesAssistDemo = () => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const intro = spring({ frame, fps, config: { damping: 18, stiffness: 90 } })
  const activeIndex = activeIndexForFrame(frame)
  const active = qaFlow[activeIndex] ?? firstQa
  const pulse = interpolate(Math.sin(frame / 8), [-1, 1], [0.45, 1])
  const answerIn = appear(frame, active.start + 12, active.start + 26)
  const searchProgress = interpolate(frame, [active.start + 4, active.start + 24], [0, 100], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  })

  return (
    <AbsoluteFill
      style={{
        background:
          'radial-gradient(circle at 16% 18%, rgba(126,198,255,0.26), transparent 28%), radial-gradient(circle at 82% 76%, rgba(141,255,201,0.16), transparent 30%), #05070d',
        color: '#e7e5ea',
        fontFamily:
          'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}
    >
      <Audio src={staticFile('media/fde-ai-dx/realtime-sales-assist-demo-audio.wav')} />

      <div
        style={{
          position: 'absolute',
          inset: 34,
          borderRadius: 34,
          overflow: 'hidden',
          background: 'rgba(8, 10, 16, 0.84)',
          border: '1px solid rgba(171,199,255,0.16)',
          boxShadow: '0 28px 80px rgba(0,0,0,0.52)',
          opacity: intro,
          transform: `scale(${interpolate(intro, [0, 1], [0.975, 1])})`,
        }}
      >
        <div
          style={{
            height: 70,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 30px',
            background: 'rgba(255,255,255,0.035)',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 18, fontWeight: 700 }}>
            <span style={{ color: '#8dffc9', filter: `drop-shadow(0 0 ${8 + pulse * 12}px #8dffc9)` }}>◉</span>
            Zoom Meeting
            <span
              style={{
                borderRadius: 999,
                padding: '5px 10px',
                background: 'rgba(141,255,201,0.12)',
                color: '#8dffc9',
                fontSize: 12,
                letterSpacing: '0.08em',
              }}
            >
              LIVE
            </span>
          </div>
          <div style={{ color: '#9b99a0', fontSize: 15 }}>質問を検知 → 右側に回答候補を即表示</div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '310px 1fr 420px',
            gap: 18,
            padding: 22,
            height: 650,
          }}
        >
          <div style={{ display: 'grid', gap: 16 }}>
            {[
              ['C', 'Customer', '#abc7ff', '質問中'],
              ['S', '新人営業', '#8dffc9', 'AI回答を確認'],
            ].map(([initial, name, color, status], index) => (
              <div
                key={name}
                style={{
                  borderRadius: 26,
                  padding: 24,
                  minHeight: 154,
                  background:
                    index === 0
                      ? 'linear-gradient(135deg, rgba(171,199,255,0.16), rgba(13,17,24,0.92))'
                      : 'linear-gradient(135deg, rgba(141,255,201,0.14), rgba(13,17,24,0.92))',
                  border: `1px solid ${color}24`,
                }}
              >
                <div
                  style={{
                    width: 58,
                    height: 58,
                    borderRadius: 18,
                    display: 'grid',
                    placeItems: 'center',
                    background: `${color}20`,
                    color,
                    fontSize: 24,
                    fontWeight: 800,
                  }}
                >
                  {initial}
                </div>
                <div style={{ marginTop: 26, fontSize: 24, fontWeight: 800 }}>{name}</div>
                <div style={{ marginTop: 8, color, fontSize: 14, fontWeight: 700 }}>{status}</div>
              </div>
            ))}

            <div
              style={{
                borderRadius: 24,
                padding: 20,
                background: 'rgba(0,0,0,0.32)',
                border: '1px solid rgba(255,255,255,0.07)',
              }}
            >
              <div style={{ color: '#7e7c83', fontSize: 12, fontWeight: 800, letterSpacing: '0.18em' }}>
                TRAINING MODE
              </div>
              <div style={{ marginTop: 14, color: '#dce8ff', fontSize: 18, lineHeight: 1.45 }}>
                新人でも、質問のたびに右側の回答候補を見ながら即回答。
              </div>
            </div>
          </div>

          <div
            style={{
              borderRadius: 28,
              padding: 22,
              background: 'rgba(13,17,24,0.86)',
              border: '1px solid rgba(171,199,255,0.14)',
              boxShadow: 'inset 0 0 80px rgba(126,198,255,0.06)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ color: '#8f8c94', fontSize: 13, fontWeight: 800, letterSpacing: '0.16em' }}>
                LIVE TRANSCRIPT
              </div>
              <div style={{ color: '#8dffc9', fontSize: 13 }}>文字起こし中</div>
            </div>

            <div style={{ marginTop: 18, display: 'grid', gap: 12 }}>
              {qaFlow.flatMap((item, index) => {
                const questionIn = appear(frame, item.start, item.start + 14)
                const salesIn = appear(frame, item.start + 42, item.start + 56)
                return [
                  <div
                    key={`${item.question}-q`}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '86px 1fr',
                      gap: 12,
                      borderRadius: 18,
                      padding: '14px 16px',
                      background: activeIndex === index ? 'rgba(171,199,255,0.08)' : 'rgba(255,255,255,0.032)',
                      border: '1px solid rgba(171,199,255,0.16)',
                      opacity: questionIn,
                      transform: `translateY(${interpolate(questionIn, [0, 1], [10, 0])}px)`,
                    }}
                  >
                    <span style={{ color: '#abc7ff', fontSize: 15, fontWeight: 800 }}>顧客</span>
                    <span style={{ color: '#e7e5ea', fontSize: 17, lineHeight: 1.38 }}>{item.question}</span>
                  </div>,
                  <div
                    key={`${item.question}-a`}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '86px 1fr',
                      gap: 12,
                      borderRadius: 18,
                      padding: '14px 16px',
                      background: activeIndex === index ? 'rgba(141,255,201,0.09)' : 'rgba(255,255,255,0.032)',
                      border: '1px solid rgba(141,255,201,0.15)',
                      opacity: salesIn,
                      transform: `translateY(${interpolate(salesIn, [0, 1], [10, 0])}px)`,
                    }}
                  >
                    <span style={{ color: '#8dffc9', fontSize: 15, fontWeight: 800 }}>新人営業</span>
                    <span style={{ color: '#f2f0f5', fontSize: 17, lineHeight: 1.38 }}>{item.sales}</span>
                  </div>,
                ]
              })}
            </div>
          </div>

          <div
            style={{
              borderRadius: 28,
              padding: 22,
              background: 'rgba(7,9,16,0.92)',
              border: '1px solid rgba(141,255,201,0.16)',
              boxShadow: `0 0 ${50 + pulse * 26}px rgba(141,255,201,0.1)`,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ color: '#8dffc9', fontSize: 13, fontWeight: 900, letterSpacing: '0.18em' }}>
                AI SIDEBAR
              </div>
              <div style={{ color: '#abc7ff', fontSize: 12, fontWeight: 800 }}>即時回答</div>
            </div>
            <div style={{ marginTop: 8, fontSize: 28, fontWeight: 850, lineHeight: 1.2 }}>回答候補</div>

            <div
              key={active.question}
              style={{
                marginTop: 22,
                borderRadius: 22,
                padding: 20,
                background: 'rgba(141,255,201,0.08)',
                border: '1px solid rgba(141,255,201,0.18)',
                opacity: answerIn,
                transform: `translateY(${interpolate(answerIn, [0, 1], [16, 0])}px)`,
              }}
            >
              <div style={{ color: '#8dffc9', fontSize: 12, fontWeight: 900, letterSpacing: '0.16em' }}>
                SUGGESTED ANSWER
              </div>
              <div style={{ marginTop: 12, color: '#f2f0f5', fontSize: 20, lineHeight: 1.48, fontWeight: 700 }}>
                {active.answer}
              </div>
            </div>

            <div
              style={{
                marginTop: 16,
                borderRadius: 18,
                padding: 16,
                background: 'linear-gradient(135deg, rgba(0,113,227,0.14), rgba(0,0,0,0.22))',
                border: '1px solid rgba(126,198,255,0.16)',
              }}
            >
              <div style={{ color: '#7ec6ff', fontSize: 12, fontWeight: 900, letterSpacing: '0.16em' }}>
                OBSIDIAN LOOKUP
              </div>
              <div style={{ marginTop: 10, color: '#dce8ff', fontSize: 16, fontWeight: 800 }}>{active.source}</div>
              <div style={{ marginTop: 5, color: '#9b99a0', fontSize: 13 }}>{active.note}</div>
              <div
                style={{
                  marginTop: 14,
                  height: 7,
                  overflow: 'hidden',
                  borderRadius: 999,
                  background: 'rgba(255,255,255,0.1)',
                }}
              >
                <div
                  style={{
                    width: `${searchProgress}%`,
                    height: '100%',
                    background: 'linear-gradient(90deg, #7ec6ff, #d3a5ff, #8dffc9)',
                  }}
                />
              </div>
            </div>

            <div
              style={{
                marginTop: 18,
                borderRadius: 18,
                padding: 16,
                background: 'rgba(171,199,255,0.09)',
                border: '1px solid rgba(171,199,255,0.18)',
                color: '#dce8ff',
                fontSize: 16,
                lineHeight: 1.45,
              }}
            >
              営業は候補を見て、そのまま自然な言葉で回答。
            </div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  )
}
