'use client'

import { useState, useRef, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'

const MOCK_ROOMS: Record<string, { name: string; category: string; host: string; participants: number; maxParticipants: number }> = {
  'room-1': { name: '営業研修 — 商談の基礎', category: '営業研修', host: '鈴木花子', participants: 5, maxParticipants: 10 },
  'room-2': { name: 'CS基礎 — オンボーディング', category: 'CS研修', host: '田中太郎', participants: 3, maxParticipants: 8 },
  'room-3': { name: '業界知識 — SaaS市場トレンド', category: '業界知識', host: '佐藤次郎', participants: 8, maxParticipants: 8 },
  'room-4': { name: '新人オンボーディング Week2', category: 'オンボーディング', host: '鈴木花子', participants: 2, maxParticipants: 5 },
}

const PARTICIPANTS = [
  { name: '鈴木花子', color: '#44FF88', role: 'ホスト' },
  { name: '田中太郎', color: '#88BBFF', role: '参加者' },
  { name: '佐藤次郎', color: '#FFDD44', role: '参加者' },
  { name: '山本佳子', color: '#AA88FF', role: '参加者' },
  { name: '小林健太', color: '#FF8888', role: '参加者' },
]

const INITIAL_CHATS = [
  { user: '鈴木花子', message: 'では始めましょう！', time: '14:00' },
  { user: '田中太郎', message: 'よろしくお願いします', time: '14:01' },
  { user: '佐藤次郎', message: '資料の3ページ目から見てください', time: '14:02' },
  { user: '田中太郎', message: '確認しました', time: '14:03' },
  { user: '鈴木花子', message: '質問ある人いますか？', time: '14:05' },
]

const CATEGORY_COLORS: Record<string, string> = {
  '営業研修': '#88BBFF', 'CS研修': '#44FF88', '業界知識': '#FFDD44', 'オンボーディング': '#FF8888',
}

export default function ImmersiveRoomPage() {
  const params = useParams()
  const router = useRouter()
  const id = params?.id as string
  const room = MOCK_ROOMS[id] ?? { name: '研修ルーム', category: '研修', host: '—', participants: 0, maxParticipants: 0 }
  const catColor = CATEGORY_COLORS[room.category] || '#88BBFF'

  const [chats, setChats] = useState(INITIAL_CHATS)
  const [input, setInput] = useState('')
  const [micOn, setMicOn] = useState(false)
  const [showChat, setShowChat] = useState(true)
  const [currentSlide, setCurrentSlide] = useState(0)
  // 吹き出し: キャラ名 → メッセージ（nullなら非表示）
  const [bubbles, setBubbles] = useState<Record<string, string | null>>({})
  const chatEndRef = useRef<HTMLDivElement>(null)

  const SLIDES = [
    { title: '商談の基礎 — 本日のアジェンダ', bullets: ['ヒアリングの型を学ぶ', '課題の深掘り方法', 'ネクストアクションの設計', 'ロールプレイ振り返り'], accent: catColor },
    { title: 'ステップ1: ヒアリングの型', bullets: ['現状の把握 — 「今どのような体制で？」', '課題の特定 — 「一番困っていることは？」', '理想の状態 — 「どうなったら成功ですか？」', '時間軸 — 「いつまでに解決したいですか？」'], accent: '#88BBFF' },
    { title: 'ステップ2: 課題の深掘り', bullets: ['「なぜそれが課題なのか？」を3回掘る', '定量的な影響を確認する', '関連する部門・ステークホルダーを把握', 'これまでに試したことを聞く'], accent: '#AA88FF' },
    { title: 'ステップ3: ネクストアクション', bullets: ['次回の会議日程をその場で確定', '誰が何をいつまでにやるかを明確に', 'フォローアップメールを24h以内に送信', '社内共有のタイミングも合意する'], accent: '#44FF88' },
    { title: 'まとめ & Q&A', bullets: ['ヒアリング → 深掘り → ネクストアクション', '「聞く7割、話す3割」を意識する', '次回研修: クロージング編（来週）', '質問・感想をチャットに書いてください'], accent: '#FFDD44' },
  ]
  const currentSlideData = SLIDES[currentSlide] ?? SLIDES[0]!

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [chats])

  function handleSend() {
    if (!input.trim()) return
    const msg = input.trim()
    const now = new Date()
    const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
    setChats(prev => [...prev, { user: '田中太郎', message: msg, time }])
    // 自分のアバター上に吹き出し表示
    setBubbles(prev => ({ ...prev, '田中太郎': msg }))
    setInput('')
  }

  // モックチャットの吹き出しも初期表示（最後のメッセージ各人）
  useEffect(() => {
    const initial: Record<string, string | null> = {}
    INITIAL_CHATS.forEach(c => { initial[c.user] = c.message })
    setBubbles(initial)
  }, [])

  function dismissBubble(name: string) {
    setBubbles(prev => ({ ...prev, [name]: null }))
  }

  // 着席アバターの配置（3列の弧状）
  const seatPositions = [
    // 前列（3人）
    { row: 0, seats: [{ x: 30, y: 0 }, { x: 50, y: 0 }, { x: 70, y: 0 }] },
    // 後列（2人）
    { row: 1, seats: [{ x: 38, y: 0 }, { x: 62, y: 0 }] },
  ]

  let seatIndex = 0
  const seatedParticipants = PARTICIPANTS.map(p => {
    const row = seatPositions[seatIndex < 3 ? 0 : 1] ?? seatPositions[0]!
    const seatInRow = seatIndex < 3 ? seatIndex : seatIndex - 3
    const seat = row.seats[seatInRow]
    seatIndex++
    return { ...p, seatX: seat?.x ?? 50, row: seatIndex <= 3 ? 0 : 1 }
  })

  return (
    <div style={{
      position: 'relative', width: '100%', height: 'calc(100vh - 56px - 56px)',
      background: '#030510', overflow: 'hidden', borderRadius: '12px', border: '1px solid #2244AA',
      display: 'flex', flexDirection: 'column',
    }}>

      {/* ── 背景 ── */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 100% 80% at 50% 20%, #0a1540 0%, #030510 70%)' }} />
        {/* 薄いグリッド */}
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.4,
          backgroundImage: 'linear-gradient(rgba(34,68,170,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(34,68,170,0.06) 1px, transparent 1px)',
          backgroundSize: '50px 50px',
        }} />
      </div>

      {/* ── 上部 HUD ── */}
      <div style={{
        position: 'relative', zIndex: 10, padding: '10px 20px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        borderBottom: '1px solid #2244AA',
        background: 'rgba(6,8,32,0.8)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <motion.div animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 1.5, repeat: Infinity }}
            style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#44FF88' }} />
          <span style={{ fontSize: '10px', fontWeight: 700, color: catColor, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{room.category}</span>
          <span style={{ fontSize: '14px', fontWeight: 700, color: '#EEEEFF' }}>{room.name}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '11px', color: '#CCDDF0' }}>
            <span style={{ color: '#EEEEFF', fontWeight: 700 }}>{room.participants}</span>/{room.maxParticipants}名
          </span>
          <button onClick={() => router.push('/metaverse/rooms')} style={{
            padding: '5px 14px', borderRadius: '6px', cursor: 'pointer', fontSize: '11px', fontWeight: 600,
            background: 'rgba(255,136,136,0.1)', border: '1px solid rgba(255,136,136,0.3)', color: '#FF8888',
          }}>退出</button>
        </div>
      </div>

      {/* ── メインエリア（スライド＋着席アバター） ── */}
      <div style={{ flex: 1, position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column' }}>

        {/* スライド + ホストキャラ */}
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '16px 20px 0', gap: '0' }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            style={{
              width: '100%', maxWidth: '800px', height: '100%',
              background: 'linear-gradient(180deg, #0c1235 0%, #080e28 100%)',
              border: `2px solid ${catColor}30`,
              borderRadius: '12px',
              boxShadow: `0 0 40px ${catColor}08, 0 8px 32px rgba(0,0,0,0.5)`,
              display: 'flex', flexDirection: 'column',
              overflow: 'hidden', position: 'relative',
            }}
          >
            {/* 上部ライン */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: `linear-gradient(90deg, transparent 5%, ${catColor}40 30%, ${catColor}70 50%, ${catColor}40 70%, transparent 95%)` }} />

            {/* スライド内容 */}
            <div style={{ flex: 1, padding: '28px 36px', display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative' }}>
              <AnimatePresence mode="wait">
                <motion.div key={currentSlide} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.25 }}>
                  <div style={{ fontSize: '9px', fontWeight: 700, color: '#99AACC', letterSpacing: '0.12em', marginBottom: '16px' }}>
                    SLIDE {currentSlide + 1} / {SLIDES.length}
                  </div>
                  <h2 style={{ margin: '0 0 20px', fontSize: '22px', fontWeight: 800, color: currentSlideData.accent, lineHeight: 1.3 }}>
                    {currentSlideData.title}
                  </h2>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {currentSlideData.bullets.map((bullet, bi) => (
                      <motion.div key={bi} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.08 + bi * 0.07 }}
                        style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', marginTop: '7px', flexShrink: 0, background: currentSlideData.accent, boxShadow: `0 0 6px ${currentSlideData.accent}50` }} />
                        <span style={{ fontSize: '15px', color: '#CCDDEE', lineHeight: 1.6 }}>{bullet}</span>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* ページネーション */}
            <div style={{
              padding: '8px 20px', borderTop: `1px solid ${catColor}15`, background: 'rgba(6,8,32,0.5)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <div style={{ display: 'flex', gap: '5px' }}>
                {SLIDES.map((_, si) => (
                  <button key={si} onClick={() => setCurrentSlide(si)} style={{
                    width: si === currentSlide ? '18px' : '7px', height: '7px', borderRadius: '4px', cursor: 'pointer', border: 'none',
                    background: si === currentSlide ? catColor : `${catColor}25`,
                    boxShadow: si === currentSlide ? `0 0 6px ${catColor}50` : 'none', transition: 'all 0.2s',
                  }} />
                ))}
              </div>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button onClick={() => setCurrentSlide(s => Math.max(0, s - 1))} disabled={currentSlide === 0}
                  style={{ width: '28px', height: '28px', borderRadius: '6px', cursor: currentSlide === 0 ? 'default' : 'pointer', background: 'rgba(34,68,170,0.15)', border: '1px solid #2244AA', color: currentSlide === 0 ? '#2244AA' : '#88BBFF', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>◀</button>
                <button onClick={() => setCurrentSlide(s => Math.min(SLIDES.length - 1, s + 1))} disabled={currentSlide === SLIDES.length - 1}
                  style={{ width: '28px', height: '28px', borderRadius: '6px', cursor: currentSlide === SLIDES.length - 1 ? 'default' : 'pointer', background: 'rgba(34,68,170,0.15)', border: '1px solid #2244AA', color: currentSlide === SLIDES.length - 1 ? '#2244AA' : '#88BBFF', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>▶</button>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '3px 8px', borderRadius: '5px', background: 'rgba(68,255,136,0.06)', border: '1px solid rgba(68,255,136,0.15)' }}>
                <motion.div animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.5, repeat: Infinity }} style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#44FF88' }} />
                <span style={{ fontSize: '9px', color: '#44FF88', fontWeight: 600 }}>{room.host}</span>
              </div>
            </div>
          </motion.div>

          {/* ── ホストキャラクター（スライド横に立つ） ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, type: 'spring', stiffness: 150 }}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              marginLeft: '-12px', alignSelf: 'flex-end', marginBottom: '20px', flexShrink: 0,
            }}
          >
            {/* 吹き出し（チャット連動） */}
            <AnimatePresence>
              {bubbles[room.host] && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                  style={{
                    padding: '6px 12px', paddingRight: '22px', borderRadius: '8px', marginBottom: '8px',
                    background: 'rgba(6,8,32,0.9)', border: '1px solid rgba(68,255,136,0.25)',
                    boxShadow: '0 2px 12px rgba(0,0,0,0.4), 0 0 8px rgba(68,255,136,0.1)',
                    maxWidth: '180px', position: 'relative',
                  }}
                >
                  <p style={{ margin: 0, fontSize: '10px', color: '#CCDDEE', lineHeight: 1.4 }}>{bubbles[room.host]}</p>
                  <button onClick={() => dismissBubble(room.host)} style={{
                    position: 'absolute', top: '2px', right: '4px', width: '14px', height: '14px', borderRadius: '50%', cursor: 'pointer',
                    background: 'rgba(255,255,255,0.06)', border: 'none', color: '#88AACC', fontSize: '8px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>✕</button>
                  <div style={{
                    position: 'absolute', bottom: '-5px', left: '50%', transform: 'translateX(-50%)',
                    width: 0, height: 0,
                    borderLeft: '5px solid transparent', borderRight: '5px solid transparent',
                    borderTop: '5px solid rgba(68,255,136,0.25)',
                  }} />
                </motion.div>
              )}
            </AnimatePresence>

            {/* ホスト名 */}
            <span style={{ fontSize: '9px', fontWeight: 700, color: '#44FF88', marginBottom: '4px', letterSpacing: '0.05em' }}>
              👑 {room.host}
            </span>

            {/* 体 */}
            <div style={{ position: 'relative' }}>
              {/* 頭 */}
              <motion.div
                animate={{ y: [0, -3, 0] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                style={{
                  width: '52px', height: '52px', borderRadius: '50%',
                  background: 'radial-gradient(circle at 40% 35%, #44FF8855, #44FF8820)',
                  border: '2px solid #44FF8877',
                  boxShadow: '0 0 20px rgba(68,255,136,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '20px', fontWeight: 800, color: '#44FF88',
                  position: 'relative', zIndex: 2,
                }}
              >
                {room.host.charAt(0)}
              </motion.div>

              {/* 胴体 */}
              <div style={{
                width: '36px', height: '48px', margin: '-6px auto 0',
                borderRadius: '8px 8px 4px 4px',
                background: 'linear-gradient(180deg, #44FF8818, #44FF8808)',
                border: '1px solid #44FF8825',
                position: 'relative', zIndex: 1,
              }} />

              {/* 左手（スライドを指す） */}
              <motion.div
                animate={{ rotate: [-5, 5, -5] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                style={{
                  position: 'absolute', top: '50px', left: '-18px',
                  width: '24px', height: '6px', borderRadius: '3px',
                  background: '#44FF8830', border: '1px solid #44FF8825',
                  transformOrigin: 'right center',
                }}
              />

              {/* 足元のグロー */}
              <div style={{
                width: '50px', height: '10px', margin: '0 auto',
                borderRadius: '50%',
                background: 'radial-gradient(ellipse, rgba(68,255,136,0.15) 0%, transparent 70%)',
              }} />
            </div>
          </motion.div>
        </div>

        {/* ── 着席エリア（講義室風） ── */}
        <div style={{ position: 'relative', height: '120px', padding: '0 20px', flexShrink: 0 }}>

          {/* 机（弧状） */}
          <div style={{
            position: 'absolute', bottom: '35px', left: '15%', right: '15%', height: '16px',
            borderRadius: '50%', border: '1px solid rgba(34,68,170,0.25)',
            background: 'linear-gradient(180deg, rgba(16,24,56,0.6) 0%, rgba(8,14,40,0.3) 100%)',
          }} />
          <div style={{
            position: 'absolute', bottom: '20px', left: '10%', right: '10%', height: '16px',
            borderRadius: '50%', border: '1px solid rgba(34,68,170,0.15)',
            background: 'linear-gradient(180deg, rgba(16,24,56,0.4) 0%, rgba(8,14,40,0.2) 100%)',
          }} />

          {/* アバター配置 */}
          {seatedParticipants.map((p, i) => {
            const bubble = bubbles[p.name]
            return (
              <motion.div
                key={p.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.08, type: 'spring', stiffness: 200 }}
                style={{
                  position: 'absolute',
                  left: `${p.seatX}%`, bottom: p.row === 0 ? '38px' : '14px',
                  transform: 'translateX(-50%)',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px',
                }}
              >
                {/* 吹き出し */}
                <AnimatePresence>
                  {bubble && (
                    <motion.div
                      initial={{ opacity: 0, y: 6, scale: 0.85 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -4, scale: 0.9 }}
                      transition={{ duration: 0.2 }}
                      style={{
                        position: 'relative', marginBottom: '4px',
                        padding: '5px 10px', paddingRight: '22px', borderRadius: '8px',
                        background: 'rgba(6,8,32,0.9)', border: `1px solid ${p.color}35`,
                        boxShadow: `0 2px 12px rgba(0,0,0,0.4), 0 0 8px ${p.color}10`,
                        maxWidth: '160px', whiteSpace: 'normal',
                      }}
                    >
                      <p style={{ margin: 0, fontSize: '10px', color: '#CCDDEE', lineHeight: 1.4 }}>{bubble}</p>
                      {/* ×ボタン */}
                      <button
                        onClick={() => dismissBubble(p.name)}
                        style={{
                          position: 'absolute', top: '2px', right: '4px',
                          width: '14px', height: '14px', borderRadius: '50%', cursor: 'pointer',
                          background: 'rgba(255,255,255,0.06)', border: 'none',
                          color: '#88AACC', fontSize: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          lineHeight: 1,
                        }}
                      >✕</button>
                      {/* 三角 */}
                      <div style={{
                        position: 'absolute', bottom: '-5px', left: '50%', transform: 'translateX(-50%)',
                        width: 0, height: 0,
                        borderLeft: '5px solid transparent', borderRight: '5px solid transparent',
                        borderTop: `5px solid ${p.color}35`,
                      }} />
                    </motion.div>
                  )}
                </AnimatePresence>
                {/* 名前 */}
                <span style={{ fontSize: '9px', fontWeight: 600, color: p.color, opacity: 0.8, whiteSpace: 'nowrap' }}>
                  {p.role === 'ホスト' ? '👑 ' : ''}{p.name}
                </span>
                {/* アバター */}
                <motion.div
                  animate={{ y: [0, -2, 0] }}
                  transition={{ duration: 3 + i * 0.5, repeat: Infinity, ease: 'easeInOut' }}
                  style={{
                    width: p.row === 0 ? '38px' : '32px', height: p.row === 0 ? '38px' : '32px',
                    borderRadius: '50%',
                    background: `radial-gradient(circle at 40% 35%, ${p.color}44, ${p.color}18)`,
                    border: `2px solid ${p.color}66`,
                    boxShadow: `0 0 12px ${p.color}20`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: p.row === 0 ? '14px' : '12px', fontWeight: 800, color: p.color,
                  }}
                >
                  {p.name.charAt(0)}
                </motion.div>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* ── 下部コントロール ── */}
      <div style={{
        position: 'relative', zIndex: 10, padding: '8px 20px 12px',
        borderTop: '1px solid #2244AA', background: 'rgba(6,8,32,0.8)',
        display: 'flex', justifyContent: 'center', gap: '10px',
      }}>
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => setMicOn(v => !v)} style={{
          width: '40px', height: '40px', borderRadius: '50%', cursor: 'pointer', fontSize: '16px',
          border: '2px solid', display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: micOn ? 'rgba(68,255,136,0.12)' : 'rgba(255,136,136,0.08)',
          borderColor: micOn ? '#44FF88' : '#FF8888',
          boxShadow: micOn ? '0 0 12px rgba(68,255,136,0.25)' : 'none',
        }}>{micOn ? '🎤' : '🔇'}</motion.button>
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => setShowChat(v => !v)} style={{
          width: '40px', height: '40px', borderRadius: '50%', cursor: 'pointer', fontSize: '16px',
          border: `2px solid ${showChat ? '#88BBFF' : '#2244AA'}`,
          background: showChat ? 'rgba(136,187,255,0.12)' : 'rgba(136,187,255,0.04)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>💬</motion.button>
        <motion.button whileTap={{ scale: 0.9 }} style={{
          width: '40px', height: '40px', borderRadius: '50%', cursor: 'pointer', fontSize: '16px',
          border: '2px solid #2244AA', background: 'rgba(136,187,255,0.04)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>👋</motion.button>
      </div>

      {/* ── チャットパネル（右サイド） ── */}
      <AnimatePresence>
        {showChat && (
          <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 30 }} transition={{ duration: 0.2 }}
            style={{
              position: 'absolute', right: '12px', top: '50px', bottom: '60px', width: '280px', zIndex: 20,
              background: 'rgba(6,8,32,0.92)', border: '1px solid #2244AA', borderRadius: '10px',
              backdropFilter: 'blur(16px)', display: 'flex', flexDirection: 'column',
              boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
            }}
          >
            <div style={{ padding: '10px 14px', borderBottom: '1px solid #2244AA', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#88BBFF', letterSpacing: '0.06em' }}>CHAT</span>
              <span style={{ fontSize: '9px', color: '#99AACC' }}>{chats.length}</span>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '10px 14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {chats.map((chat, i) => {
                const p = PARTICIPANTS.find(pp => pp.name === chat.user)
                const color = p?.color || '#88BBFF'
                return (
                  <motion.div key={i} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', gap: '7px', alignItems: 'flex-start' }}>
                    <div style={{ width: '22px', height: '22px', borderRadius: '50%', flexShrink: 0, background: `${color}18`, border: `1.5px solid ${color}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', fontWeight: 700, color }}>{chat.user.charAt(0)}</div>
                    <div>
                      <div style={{ display: 'flex', gap: '5px', alignItems: 'baseline', marginBottom: '1px' }}>
                        <span style={{ fontSize: '10px', fontWeight: 700, color }}>{chat.user}</span>
                        <span style={{ fontSize: '8px', color: '#99AACC' }}>{chat.time}</span>
                      </div>
                      <p style={{ margin: 0, fontSize: '11px', color: '#CCDDEE', lineHeight: 1.5 }}>{chat.message}</p>
                    </div>
                  </motion.div>
                )
              })}
              <div ref={chatEndRef} />
            </div>
            <div style={{ padding: '10px 14px', borderTop: '1px solid #2244AA', display: 'flex', gap: '6px' }}>
              <input value={input} onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }}
                placeholder="メッセージ..."
                style={{ flex: 1, padding: '7px 10px', borderRadius: '6px', fontSize: '12px', outline: 'none', background: 'rgba(16,16,40,0.8)', border: '1px solid #2244AA', color: '#EEEEFF' }} />
              <button onClick={handleSend} style={{
                padding: '7px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '11px', fontWeight: 700,
                background: input.trim() ? 'linear-gradient(180deg, #2244AA, #1a3388)' : 'rgba(34,68,170,0.2)',
                border: input.trim() ? '1px solid #3355CC' : '1px solid transparent', color: input.trim() ? '#EEEEFF' : '#4466AA',
              }}>送信</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
