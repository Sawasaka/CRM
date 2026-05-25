'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const PROPOSALS = [
  { id: 'p1', title: 'ダッシュボードのリアルタイム更新機能', category: '新機能', author: '田中太郎', date: '2026-03-25', status: 'OPEN', upVotes: 8.5, downVotes: 1.2, commentCount: 5, description: 'ダッシュボードのKPIをリアルタイムで更新し、手動リロード不要にする。' },
  { id: 'p2', title: 'Slack連携の改善', category: '改善', author: '鈴木花子', date: '2026-03-24', status: 'OPEN', upVotes: 12.3, downVotes: 0.5, commentCount: 8, description: 'Slack通知のカスタマイズ性を高め、チャネル単位でフィルタリングできるようにする。' },
  { id: 'p3', title: '営業フロー標準化の提案', category: '業務改善', author: '佐藤次郎', date: '2026-03-23', status: 'レビュー中', upVotes: 6.8, downVotes: 2.1, commentCount: 12, description: '商談プロセスを5ステップに標準化し、新人の立ち上がりを加速させる。' },
  { id: 'p4', title: 'モバイルアプリ対応', category: '新機能', author: '田中太郎', date: '2026-03-22', status: 'OPEN', upVotes: 15.0, downVotes: 0.8, commentCount: 3, description: '外出先からでもCRMを操作できるモバイルアプリを開発する。' },
  { id: 'p5', title: '週次振り返りミーティングの導入', category: '組織', author: '鈴木花子', date: '2026-03-21', status: '採用', upVotes: 18.5, downVotes: 0.2, commentCount: 15, description: '毎週金曜に15分の振り返りを実施し、ナレッジ共有を促進する。' },
]

const CATEGORY_COLORS: Record<string, string> = {
  '新機能': '#88BBFF',
  '改善': '#44FF88',
  '顧客要望': '#FFDD44',
  '業務改善': '#AA88FF',
  '組織': '#FF8888',
  '文化': '#FF88CC',
}

const STATUS_COLORS: Record<string, string> = {
  'OPEN': '#88BBFF',
  'レビュー中': '#FFDD44',
  '採用': '#44FF88',
  '不採用': '#4466AA',
}

const CATEGORY_TABS = ['全て', '新機能', '改善', '顧客要望', '業務改善', '組織', '文化']
const STATUS_TABS = ['全て', 'OPEN', 'レビュー中', '採用', '不採用']

const cardStyle = {
  background: 'linear-gradient(180deg, #101838 0%, #0c1028 100%)',
  border: '1px solid #2244AA',
  boxShadow: '0 2px 12px rgba(0,0,0,0.4), inset 0 1px 0 rgba(136,187,255,0.05)',
}

const buttonStyle = {
  background: 'linear-gradient(180deg, #2244AA 0%, #1a3388 100%)',
  border: '1px solid #3355CC',
}

type ProposalVote = { up: number; down: number; voted: 'up' | 'down' | null }
const DEFAULT_VOTE: ProposalVote = { up: 0, down: 0, voted: null }

export default function ProposalsPage() {
  const [categoryFilter, setCategoryFilter] = useState('全て')
  const [statusFilter, setStatusFilter] = useState('全て')
  const [showModal, setShowModal] = useState(false)
  const [votes, setVotes] = useState<Record<string, ProposalVote>>(
    Object.fromEntries(PROPOSALS.map(p => [p.id, { up: p.upVotes, down: p.downVotes, voted: null }]))
  )
  const [newProposal, setNewProposal] = useState({ title: '', category: '新機能', description: '' })

  const filtered = PROPOSALS.filter(p => {
    const catOk = categoryFilter === '全て' || p.category === categoryFilter
    const stOk = statusFilter === '全て' || p.status === statusFilter
    return catOk && stOk
  })

  const handleVote = (id: string, type: 'up' | 'down') => {
    setVotes(prev => {
      const cur = prev[id] ?? DEFAULT_VOTE
      if (cur.voted === type) return prev
      const next: ProposalVote = { ...cur, voted: type }
      if (type === 'up') {
        next.up = cur.up + 1
        if (cur.voted === 'down') next.down = Math.max(0, cur.down - 1)
      } else {
        next.down = cur.down + 1
        if (cur.voted === 'up') next.up = Math.max(0, cur.up - 1)
      }
      return { ...prev, [id]: next }
    })
  }

  const openCount = PROPOSALS.filter(p => p.status === 'OPEN').length

  return (
    <div style={{ minHeight: '100vh', background: '#07091a', color: '#EEEEFF', padding: '24px' }}>
      {/* ヘッダー */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ marginBottom: '24px' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#EEEEFF', margin: 0 }}>提案一覧</h1>
            <p style={{ color: '#CCDDF0', fontSize: '14px', marginTop: '4px' }}>
              全 {PROPOSALS.length} 件 &nbsp;|&nbsp; OPEN {openCount} 件
            </p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-end' }}>
            <p style={{ color: '#88BBFF', fontSize: '12px', margin: 0 }}>自動採用ライン</p>
            <p style={{ color: '#CCDDF0', fontSize: '12px', margin: 0 }}>上位 10 名中 7 名以上の賛成で自動採用</p>
          </div>
        </div>

        {/* 新規提案ボタン */}
        <div style={{ marginTop: '16px' }}>
          <button
            onClick={() => setShowModal(true)}
            style={{ ...buttonStyle, color: '#EEEEFF', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: 600 }}
          >
            + 新規提案
          </button>
        </div>
      </motion.div>

      {/* カテゴリフィルター */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}
      >
        {CATEGORY_TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setCategoryFilter(tab)}
            style={{
              padding: '6px 14px',
              borderRadius: '20px',
              fontSize: '13px',
              cursor: 'pointer',
              border: '1px solid',
              transition: 'all 0.2s',
              background: categoryFilter === tab ? '#2244AA' : 'rgba(136,187,255,0.06)',
              borderColor: categoryFilter === tab ? '#3355CC' : 'rgba(136,187,255,0.2)',
              color: categoryFilter === tab ? '#FFFFFF' : '#88BBFF',
            }}
          >
            {tab}
          </button>
        ))}
      </motion.div>

      {/* ステータスフィルター */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
        style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '24px' }}
      >
        {STATUS_TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setStatusFilter(tab)}
            style={{
              padding: '4px 12px',
              borderRadius: '12px',
              fontSize: '12px',
              cursor: 'pointer',
              border: '1px solid',
              transition: 'all 0.2s',
              background: statusFilter === tab ? '#2244AA' : 'rgba(136,187,255,0.04)',
              borderColor: statusFilter === tab ? '#3355CC' : 'rgba(136,187,255,0.15)',
              color: statusFilter === tab ? '#FFFFFF' : '#7788AA',
            }}
          >
            {tab}
          </button>
        ))}
      </motion.div>

      {/* 提案カード一覧 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <AnimatePresence>
          {filtered.map((p, i) => {
            const v = votes[p.id] ?? { up: p.upVotes, down: p.downVotes, voted: null }
            const total = v.up + v.down
            const upPct = total > 0 ? (v.up / total) * 100 : 50
            return (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ scale: 1.005 }}
                style={{ ...cardStyle, borderRadius: '12px', padding: '16px 20px' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, minWidth: '200px' }}>
                    {/* タイトル行 */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '6px' }}>
                      <span style={{
                        background: `${CATEGORY_COLORS[p.category]}22`,
                        color: CATEGORY_COLORS[p.category],
                        border: `1px solid ${CATEGORY_COLORS[p.category]}55`,
                        padding: '2px 8px', borderRadius: '10px', fontSize: '11px', fontWeight: 600
                      }}>
                        {p.category}
                      </span>
                      <span style={{
                        background: `${STATUS_COLORS[p.status]}22`,
                        color: STATUS_COLORS[p.status],
                        border: `1px solid ${STATUS_COLORS[p.status]}55`,
                        padding: '2px 8px', borderRadius: '10px', fontSize: '11px'
                      }}>
                        {p.status}
                      </span>
                    </div>
                    <h3 style={{ margin: '0 0 6px', fontSize: '15px', fontWeight: 600, color: '#EEEEFF' }}>{p.title}</h3>
                    <p style={{ margin: '0 0 8px', fontSize: '13px', color: '#CCDDF0' }}>{p.description}</p>
                    <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: '#99AACC' }}>
                      <span>投稿者: {p.author}</span>
                      <span>{p.date}</span>
                      <span>💬 {p.commentCount}</span>
                    </div>
                  </div>

                  {/* 投票エリア */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px', minWidth: '140px' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleVote(p.id, 'up')}
                        style={{
                          padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 600,
                          background: v.voted === 'up' ? 'rgba(68,255,136,0.2)' : 'rgba(136,187,255,0.08)',
                          border: v.voted === 'up' ? '1px solid #44FF88' : '1px solid rgba(136,187,255,0.2)',
                          color: v.voted === 'up' ? '#44FF88' : '#88BBFF',
                        }}
                      >
                        ▲ {v.up.toFixed(1)}
                      </motion.button>
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleVote(p.id, 'down')}
                        style={{
                          padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 600,
                          background: v.voted === 'down' ? 'rgba(255,68,68,0.2)' : 'rgba(136,187,255,0.08)',
                          border: v.voted === 'down' ? '1px solid #FF4444' : '1px solid rgba(136,187,255,0.2)',
                          color: v.voted === 'down' ? '#FF8888' : '#7788AA',
                        }}
                      >
                        ▼ {v.down.toFixed(1)}
                      </motion.button>
                    </div>
                    {/* 賛成率バー */}
                    <div style={{ width: '100%' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#99AACC', marginBottom: '3px' }}>
                        <span>賛成 {upPct.toFixed(0)}%</span>
                      </div>
                      <div style={{ height: '4px', borderRadius: '2px', background: 'rgba(255,68,68,0.3)', overflow: 'hidden' }}>
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${upPct}%` }}
                          transition={{ duration: 0.6, delay: i * 0.05 }}
                          style={{ height: '100%', background: '#44FF88', borderRadius: '2px' }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      {/* 新規提案モーダル */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '24px'
            }}
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={e => e.stopPropagation()}
              style={{ ...cardStyle, borderRadius: '16px', padding: '28px', width: '100%', maxWidth: '520px' }}
            >
              <h2 style={{ margin: '0 0 20px', fontSize: '18px', fontWeight: 700, color: '#EEEEFF' }}>新規提案</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#CCDDF0', marginBottom: '6px' }}>タイトル</label>
                  <input
                    value={newProposal.title}
                    onChange={e => setNewProposal(p => ({ ...p, title: e.target.value }))}
                    placeholder="提案のタイトルを入力"
                    style={{
                      width: '100%', padding: '10px 12px', borderRadius: '8px', fontSize: '14px',
                      background: 'rgba(16,16,40,0.6)', border: '1px solid #2244AA', color: '#EEEEFF',
                      outline: 'none', boxSizing: 'border-box',
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#CCDDF0', marginBottom: '6px' }}>カテゴリ</label>
                  <select
                    value={newProposal.category}
                    onChange={e => setNewProposal(p => ({ ...p, category: e.target.value }))}
                    style={{
                      width: '100%', padding: '10px 12px', borderRadius: '8px', fontSize: '14px',
                      background: 'rgba(16,16,40,0.6)', border: '1px solid #2244AA', color: '#EEEEFF',
                      outline: 'none', boxSizing: 'border-box',
                    }}
                  >
                    {['新機能', '改善', '顧客要望', '業務改善', '組織', '文化'].map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#CCDDF0', marginBottom: '6px' }}>詳細</label>
                  <textarea
                    value={newProposal.description}
                    onChange={e => setNewProposal(p => ({ ...p, description: e.target.value }))}
                    placeholder="提案の詳細を入力してください..."
                    rows={4}
                    style={{
                      width: '100%', padding: '10px 12px', borderRadius: '8px', fontSize: '14px',
                      background: 'rgba(16,16,40,0.6)', border: '1px solid #2244AA', color: '#EEEEFF',
                      outline: 'none', resize: 'vertical', boxSizing: 'border-box',
                    }}
                  />
                </div>
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '4px' }}>
                  <button
                    onClick={() => setShowModal(false)}
                    style={{
                      padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px',
                      background: 'rgba(136,187,255,0.06)', border: '1px solid rgba(136,187,255,0.2)', color: '#88BBFF'
                    }}
                  >
                    キャンセル
                  </button>
                  <button
                    onClick={() => setShowModal(false)}
                    style={{ ...buttonStyle, color: '#EEEEFF', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: 600 }}
                  >
                    提案を投稿
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
