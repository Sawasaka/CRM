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

const flow = [
  { label: '01', title: '確認', note: '問い合わせ内容', color: '#86b9ff' },
  { label: '02', title: '整理', note: '課題と温度感', color: '#8dffc9' },
  { label: '03', title: '確定', note: '商談日程', color: '#ffd66b' },
]

export const CallAiDemo = () => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const intro = spring({ frame, fps, config: { damping: 18, stiffness: 82 } })
  const active = Math.min(flow.length - 1, Math.floor(frame / 300))
  const pulse = interpolate(Math.sin(frame / 9), [-1, 1], [0.45, 1])
  const sweep = interpolate(frame % 240, [0, 240], [-18, 118], {
    easing: Easing.inOut(Easing.ease),
  })

  return (
    <AbsoluteFill
      style={{
        background:
          'radial-gradient(circle at 14% 18%, rgba(86,170,255,0.3), transparent 28%), radial-gradient(circle at 82% 72%, rgba(141,255,201,0.16), transparent 30%), #05070d',
        color: '#f5f8ff',
        fontFamily:
          'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}
    >
      <Audio src={staticFile('media/fde-ai-dx/call-ai-appointment-demo.mp4')} />

      <div
        style={{
          position: 'absolute',
          inset: 42,
          borderRadius: 38,
          overflow: 'hidden',
          border: '1px solid rgba(171,199,255,0.2)',
          background:
            'linear-gradient(135deg, rgba(13,28,50,0.96), rgba(7,9,16,0.98) 58%, rgba(6,18,22,0.96))',
          boxShadow: '0 34px 90px rgba(0,0,0,0.58), inset 0 0 80px rgba(86,170,255,0.08)',
          opacity: intro,
          transform: `scale(${interpolate(intro, [0, 1], [0.985, 1])})`,
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: `linear-gradient(105deg, transparent ${sweep}%, rgba(141,255,201,0.08) ${sweep + 8}%, transparent ${sweep + 18}%)`,
          }}
        />

        <div
          style={{
            position: 'relative',
            display: 'grid',
            gridTemplateColumns: '1fr 360px',
            gap: 36,
            height: '100%',
            padding: '54px 58px 92px',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
            <div
              style={{
                display: 'inline-flex',
                alignSelf: 'flex-start',
                alignItems: 'center',
                gap: 10,
                borderRadius: 999,
                padding: '8px 15px',
                background: 'rgba(86,170,255,0.12)',
                border: '1px solid rgba(86,170,255,0.28)',
                color: '#bcd8ff',
                fontSize: 14,
                fontWeight: 900,
                letterSpacing: '0.12em',
              }}
            >
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 999,
                  background: '#8dffc9',
                  boxShadow: `0 0 ${14 + pulse * 16}px rgba(141,255,201,0.9)`,
                }}
              />
              CALL AI
            </div>

            <h1
              style={{
                margin: '30px 0 0',
                maxWidth: 680,
                fontSize: 58,
                lineHeight: 1.04,
                letterSpacing: 0,
                fontWeight: 950,
              }}
            >
              電話から、
              <br />
              商談日程まで。
            </h1>
            <p
              style={{
                margin: '18px 0 0',
                maxWidth: 620,
                color: '#aeb7c8',
                fontSize: 20,
                lineHeight: 1.55,
                fontWeight: 700,
              }}
            >
              問い合わせ後の初回確認と日程調整を、AIが自然な会話で進めます。
            </p>

            <div
              style={{
                marginTop: 42,
                display: 'grid',
                gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
                gap: 16,
              }}
            >
              {flow.map((item, index) => {
                const isActive = index <= active
                return (
                  <div
                    key={item.title}
                    style={{
                      minHeight: 156,
                      borderRadius: 28,
                      padding: 24,
                      background: isActive
                        ? `linear-gradient(135deg, ${item.color}24, rgba(8,12,20,0.88))`
                        : 'rgba(255,255,255,0.045)',
                      border: `1px solid ${isActive ? item.color : 'rgba(255,255,255,0.16)'}`,
                      boxShadow: isActive ? `0 0 28px ${item.color}18` : 'none',
                    }}
                  >
                    <div
                      style={{
                        color: item.color,
                        fontSize: 18,
                        fontWeight: 950,
                        letterSpacing: '0.1em',
                      }}
                    >
                      {item.label}
                    </div>
                    <div
                      style={{
                        marginTop: 12,
                        fontSize: 36,
                        lineHeight: 1,
                        fontWeight: 950,
                      }}
                    >
                      {item.title}
                    </div>
                    <div
                      style={{
                        marginTop: 14,
                        color: '#aeb7c8',
                        fontSize: 17,
                        fontWeight: 800,
                      }}
                    >
                      {item.note}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div
            style={{
              position: 'relative',
              display: 'grid',
              alignContent: 'center',
              gap: 18,
              minWidth: 0,
            }}
          >
            <div
              style={{
                borderRadius: 34,
                padding: 28,
                background: 'rgba(5,8,14,0.78)',
                border: '1px solid rgba(171,199,255,0.18)',
                boxShadow: 'inset 0 0 60px rgba(86,170,255,0.08)',
              }}
            >
              <div
                style={{
                  width: 94,
                  height: 94,
                  borderRadius: 30,
                  display: 'grid',
                  placeItems: 'center',
                  background: 'linear-gradient(135deg, #86b9ff, #2488ff)',
                  color: 'white',
                  fontSize: 34,
                  fontWeight: 950,
                  boxShadow: `0 0 ${28 + pulse * 22}px rgba(86,170,255,0.45)`,
                }}
              >
                AI
              </div>

              <div style={{ marginTop: 30, color: '#8dffc9', fontSize: 14, fontWeight: 950 }}>
                APPOINTMENT CONFIRMED
              </div>
              <div
                style={{
                  marginTop: 10,
                  fontSize: 40,
                  lineHeight: 1,
                  fontWeight: 950,
                }}
              >
                明日 10:00
              </div>

              <div
                style={{
                  marginTop: 28,
                  display: 'grid',
                  gap: 12,
                }}
              >
                {[
                  ['顧客確認', '完了'],
                  ['課題整理', '完了'],
                  ['予定登録', 'CRM保存'],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: 18,
                      borderRadius: 16,
                      padding: '14px 16px',
                      background: 'rgba(255,255,255,0.055)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      fontSize: 17,
                      fontWeight: 850,
                    }}
                  >
                    <span style={{ color: '#aeb7c8' }}>{label}</span>
                    <span style={{ color: '#f5f8ff' }}>{value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div
              style={{
                borderRadius: 24,
                padding: '18px 22px',
                background: 'rgba(141,255,201,0.1)',
                border: '1px solid rgba(141,255,201,0.24)',
                color: '#8dffc9',
                fontSize: 16,
                fontWeight: 900,
                textAlign: 'center',
              }}
            >
              音声デモ再生中
            </div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  )
}
