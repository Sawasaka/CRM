'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

const INITIAL_WEIGHTS = [
  { label: '顧客接点数', key: 'contact', value: 30, color: '#88BBFF' },
  { label: 'ナレッジ貢献', key: 'knowledge', value: 20, color: '#AA88FF' },
  { label: 'バッジ/認定', key: 'badge', value: 20, color: '#FFDD44' },
  { label: '研修貢献', key: 'training', value: 10, color: '#44FF88' },
  { label: '提案採用率', key: 'proposal', value: 20, color: '#FF8888' },
]

interface Web3Member {
  name: string
  scores: Record<string, number>
}
const MOCK_MEMBERS: Web3Member[] = []

const cardStyle = {
  background: 'linear-gradient(180deg, #101838 0%, #0c1028 100%)',
  border: '1px solid #2244AA',
  boxShadow: '0 2px 12px rgba(0,0,0,0.4), inset 0 1px 0 rgba(136,187,255,0.05)',
}

const buttonStyle = {
  background: 'linear-gradient(180deg, #2244AA 0%, #1a3388 100%)',
  border: '1px solid #3355CC',
}

function calcScore(member: Web3Member, weights: typeof INITIAL_WEIGHTS) {
  return weights.reduce((sum, w) => {
    return sum + ((member.scores[w.key] ?? 0) * w.value) / 100
  }, 0)
}

export default function Web3SettingsPage() {
  const [weights, setWeights] = useState(INITIAL_WEIGHTS)
  const [topN, setTopN] = useState(10)
  const [approveN, setApproveN] = useState(7)
  const [saved, setSaved] = useState(false)

  const total = weights.reduce((s, w) => s + w.value, 0)

  const handleWeightChange = (key: string, val: number) => {
    setWeights(prev => prev.map(w => w.key === key ? { ...w, value: val } : w))
  }

  const simulationRanking = MOCK_MEMBERS
    .map(m => ({ name: m.name, score: calcScore(m, weights) }))
    .sort((a, b) => b.score - a.score)
    .map((m, i) => ({ ...m, rank: i + 1 }))

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#07091a', color: '#EEEEFF', padding: '24px' }}>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: '24px' }}
      >
        <h1 style={{ fontSize: '24px', fontWeight: 700, margin: '0 0 4px', color: '#EEEEFF' }}>スコア設定</h1>
        <p style={{ color: '#CCDDF0', fontSize: '14px', margin: 0 }}>影響度スコアのウェイトと自動採用ラインを管理者が設定します</p>
      </motion.div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>

        {/* ウェイトスライダー */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          style={{ ...cardStyle, borderRadius: '16px', padding: '24px' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#EEEEFF' }}>スコア項目ウェイト</h2>
            <span style={{
              padding: '4px 10px', borderRadius: '10px', fontSize: '12px', fontWeight: 700,
              background: total === 100 ? 'rgba(68,255,136,0.15)' : 'rgba(255,136,136,0.15)',
              border: `1px solid ${total === 100 ? '#44FF88' : '#FF8888'}55`,
              color: total === 100 ? '#44FF88' : '#FF8888',
            }}>
              合計 {total}%
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {weights.map((w, i) => (
              <motion.div
                key={w.key}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.05 }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <label style={{ fontSize: '13px', color: '#EEEEFF', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', background: w.color }} />
                    {w.label}
                  </label>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: w.color }}>{w.value}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={60}
                  step={5}
                  value={w.value}
                  onChange={e => handleWeightChange(w.key, Number(e.target.value))}
                  style={{ width: '100%', accentColor: w.color, cursor: 'pointer' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#99AACC', marginTop: '2px' }}>
                  <span>0%</span>
                  <span>30%</span>
                  <span>60%</span>
                </div>
              </motion.div>
            ))}
          </div>

          {total !== 100 && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{ color: '#FF8888', fontSize: '12px', marginTop: '16px', textAlign: 'center' }}
            >
              ウェイトの合計を 100% にしてください（現在 {total}%）
            </motion.p>
          )}
        </motion.div>

        {/* 自動採用ライン設定 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 }}
            style={{ ...cardStyle, borderRadius: '16px', padding: '24px' }}
          >
            <h2 style={{ margin: '0 0 20px', fontSize: '16px', fontWeight: 700, color: '#EEEEFF' }}>自動採用ライン設定</h2>
            <p style={{ color: '#CCDDF0', fontSize: '13px', margin: '0 0 20px' }}>
              指定した上位N名のうち、M名以上が賛成した提案を自動採用します。
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#CCDDF0', marginBottom: '8px' }}>
                  対象者数（上位 N 名）
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <input
                    type="range"
                    min={3}
                    max={20}
                    step={1}
                    value={topN}
                    onChange={e => setTopN(Number(e.target.value))}
                    style={{ flex: 1, accentColor: '#88BBFF', cursor: 'pointer' }}
                  />
                  <span style={{
                    minWidth: '40px', textAlign: 'center', fontWeight: 700, fontSize: '18px', color: '#88BBFF'
                  }}>
                    {topN}
                  </span>
                  <span style={{ color: '#CCDDF0', fontSize: '13px' }}>名</span>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#CCDDF0', marginBottom: '8px' }}>
                  採用に必要な賛成数（M 名以上）
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <input
                    type="range"
                    min={1}
                    max={topN}
                    step={1}
                    value={Math.min(approveN, topN)}
                    onChange={e => setApproveN(Number(e.target.value))}
                    style={{ flex: 1, accentColor: '#44FF88', cursor: 'pointer' }}
                  />
                  <span style={{
                    minWidth: '40px', textAlign: 'center', fontWeight: 700, fontSize: '18px', color: '#44FF88'
                  }}>
                    {Math.min(approveN, topN)}
                  </span>
                  <span style={{ color: '#CCDDF0', fontSize: '13px' }}>名</span>
                </div>
              </div>
            </div>

            <div style={{
              marginTop: '20px', padding: '14px 16px', borderRadius: '10px',
              background: 'rgba(136,187,255,0.06)', border: '1px solid rgba(136,187,255,0.2)'
            }}>
              <p style={{ margin: 0, fontSize: '14px', color: '#EEEEFF' }}>
                上位 <span style={{ color: '#88BBFF', fontWeight: 700 }}>{topN}</span> 名中{' '}
                <span style={{ color: '#44FF88', fontWeight: 700 }}>{Math.min(approveN, topN)}</span> 名以上の賛成で自動採用
              </p>
              <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#CCDDF0' }}>
                採用率: {((Math.min(approveN, topN) / topN) * 100).toFixed(0)}%
              </p>
            </div>
          </motion.div>

          {/* 保存ボタン */}
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleSave}
            style={{
              ...buttonStyle, color: '#EEEEFF', padding: '14px', borderRadius: '10px',
              cursor: 'pointer', fontSize: '15px', fontWeight: 700,
              transition: 'all 0.2s',
            }}
          >
            {saved ? '保存しました ✓' : '設定を保存'}
          </motion.button>
        </div>

        {/* シミュレーション */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          style={{ ...cardStyle, borderRadius: '16px', padding: '24px', gridColumn: '1 / -1' }}
        >
          <h2 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: 700, color: '#EEEEFF' }}>
            現在のウェイトでのスコアシミュレーション
          </h2>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #2244AA' }}>
                <th style={{ padding: '8px', textAlign: 'left', color: '#CCDDF0', fontWeight: 600 }}>順位</th>
                <th style={{ padding: '8px', textAlign: 'left', color: '#CCDDF0', fontWeight: 600 }}>名前</th>
                {weights.map(w => (
                  <th key={w.key} style={{ padding: '8px', textAlign: 'right', color: '#CCDDF0', fontWeight: 600 }}>
                    <span style={{ color: w.color }}>{w.label.slice(0, 4)}</span>
                    <span style={{ color: '#99AACC', fontSize: '10px' }}>×{w.value}%</span>
                  </th>
                ))}
                <th style={{ padding: '8px', textAlign: 'right', color: '#CCDDF0', fontWeight: 600 }}>合計</th>
              </tr>
            </thead>
            <tbody>
              {simulationRanking.map((person, i) => {
                const member = MOCK_MEMBERS.find(m => m.name === person.name)!
                return (
                  <motion.tr
                    key={person.name}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 + i * 0.05 }}
                    style={{ borderBottom: '1px solid rgba(34,68,170,0.2)' }}
                  >
                    <td style={{ padding: '10px 8px', color: '#EEEEFF', fontWeight: 700 }}>{person.rank}</td>
                    <td style={{ padding: '10px 8px', color: '#EEEEFF' }}>{person.name}</td>
                    {weights.map(w => (
                      <td key={w.key} style={{ padding: '10px 8px', textAlign: 'right', color: '#CCDDF0' }}>
                        {member.scores[w.key as keyof typeof member.scores]}
                      </td>
                    ))}
                    <td style={{ padding: '10px 8px', textAlign: 'right', color: '#88BBFF', fontWeight: 700 }}>
                      {person.score.toFixed(1)}
                    </td>
                  </motion.tr>
                )
              })}
            </tbody>
          </table>
        </motion.div>

      </div>
    </div>
  )
}
