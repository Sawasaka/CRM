'use client'

import { motion } from 'framer-motion'

const MY_SCORE = {
  name: '田中太郎',
  rank: 'ゴールド',
  totalScore: 78.5,
  prevScore: 72.0,
  breakdown: [
    { label: '顧客接点数', value: 85, weight: 30, color: '#88BBFF' },
    { label: 'ナレッジ貢献', value: 60, weight: 20, color: '#AA88FF' },
    { label: 'バッジ/認定', value: 90, weight: 20, color: '#FFDD44' },
    { label: '研修貢献', value: 70, weight: 10, color: '#44FF88' },
    { label: '提案採用率', value: 75, weight: 20, color: '#FF8888' },
  ]
}

const RANKING = [
  { rank: 1, name: '鈴木花子', score: 92.3, rankLabel: 'プラチナ', trend: '+5.2', color: '#34C759' },
  { rank: 2, name: '田中太郎', score: 78.5, rankLabel: 'ゴールド', trend: '+6.5', color: '#0071E3' },
  { rank: 3, name: '佐藤次郎', score: 65.0, rankLabel: 'シルバー', trend: '+3.1', color: '#FF9F0A' },
  { rank: 4, name: '山本佳子', score: 58.2, rankLabel: 'シルバー', trend: '+1.8', color: '#FF9F0A' },
  { rank: 5, name: '小林健太', score: 44.7, rankLabel: 'ブロンズ', trend: '+0.9', color: '#FF3B30' },
]
const PODIUM = [RANKING[1]!, RANKING[0]!, RANKING[2]!]
const PODIUM_HEIGHTS = [80, 110, 60]
const PODIUM_COLORS = ['#FFDD44', '#E5E5FF', '#FF9F0A']
const PODIUM_RANKS = [2, 1, 3]

const MONTHLY_SCORES = [
  { month: '10月', score: 55 },
  { month: '11月', score: 59 },
  { month: '12月', score: 63 },
  { month: '1月', score: 68 },
  { month: '2月', score: 72 },
  { month: '3月', score: 78.5 },
]

const RANK_COLORS: Record<string, string> = {
  'プラチナ': '#E5E5FF',
  'ゴールド': '#FFDD44',
  'シルバー': '#AABBCC',
  'ブロンズ': '#FF9F0A',
}
const DEFAULT_RANK_COLOR = '#AABBCC'

const cardStyle = {
  background: 'linear-gradient(180deg, #101838 0%, #0c1028 100%)',
  border: '1px solid #2244AA',
  boxShadow: '0 2px 12px rgba(0,0,0,0.4), inset 0 1px 0 rgba(136,187,255,0.05)',
}

const maxBarScore = 100

export default function InfluencePage() {
  const diff = MY_SCORE.totalScore - MY_SCORE.prevScore
  const maxMonthly = Math.max(...MONTHLY_SCORES.map(m => m.score))

  return (
    <div style={{ minHeight: '100vh', background: '#07091a', color: '#EEEEFF', padding: '24px' }}>
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ fontSize: '24px', fontWeight: 700, margin: '0 0 24px', color: '#EEEEFF' }}
      >
        影響度ダッシュボード
      </motion.h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>

        {/* 自分のスコアカード */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{ ...cardStyle, borderRadius: '16px', padding: '24px', gridColumn: 'span 1' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
            <div>
              <p style={{ margin: '0 0 4px', fontSize: '13px', color: '#CCDDF0' }}>マイスコア</p>
              <p style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#EEEEFF' }}>{MY_SCORE.name}</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{
                background: `${RANK_COLORS[MY_SCORE.rank] ?? DEFAULT_RANK_COLOR}22`,
                color: RANK_COLORS[MY_SCORE.rank] ?? DEFAULT_RANK_COLOR,
                border: `1px solid ${RANK_COLORS[MY_SCORE.rank] ?? DEFAULT_RANK_COLOR}66`,
                padding: '4px 12px', borderRadius: '12px', fontSize: '13px', fontWeight: 700
              }}>
                {MY_SCORE.rank}
              </span>
            </div>
          </div>

          {/* 総合スコア */}
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.2 }}
              style={{ fontSize: '64px', fontWeight: 800, color: '#FFDD44', lineHeight: 1 }}
            >
              {MY_SCORE.totalScore}
            </motion.div>
            <div style={{ fontSize: '13px', color: diff >= 0 ? '#44FF88' : '#FF8888', marginTop: '6px' }}>
              前月比 {diff >= 0 ? '+' : ''}{diff.toFixed(1)} pts
            </div>
          </div>

          {/* スコア内訳 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {MY_SCORE.breakdown.map((item, i) => (
              <div key={item.label}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                  <span style={{ color: '#EEEEFF' }}>{item.label}</span>
                  <span style={{ color: item.color }}>{item.value} / ウェイト {item.weight}%</span>
                </div>
                <div style={{ height: '6px', borderRadius: '3px', background: 'rgba(136,187,255,0.1)', overflow: 'hidden' }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(item.value / maxBarScore) * 100}%` }}
                    transition={{ duration: 0.8, delay: 0.3 + i * 0.1 }}
                    style={{ height: '100%', borderRadius: '3px', background: item.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* 全社ランキング */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{ ...cardStyle, borderRadius: '16px', padding: '24px' }}
        >
          <h2 style={{ margin: '0 0 20px', fontSize: '16px', fontWeight: 700, color: '#EEEEFF' }}>全社ランキング</h2>

          {/* 表彰台 */}
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: '12px', marginBottom: '28px', height: '120px' }}>
            {PODIUM.map((person, idx) => {
              const podiumColor = PODIUM_COLORS[idx] ?? DEFAULT_RANK_COLOR
              return (
                <motion.div
                  key={person.name}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + idx * 0.1 }}
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}
                >
                  <div style={{ fontSize: '11px', color: '#CCDDF0', fontWeight: 600 }}>{person.score}</div>
                  <div style={{
                    width: '48px', background: `${podiumColor}22`,
                    border: `1px solid ${podiumColor}55`,
                    borderRadius: '8px 8px 0 0',
                    height: `${PODIUM_HEIGHTS[idx] ?? 60}px`,
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '2px'
                  }}>
                    <div style={{ fontSize: '18px', fontWeight: 800, color: podiumColor }}>{PODIUM_RANKS[idx] ?? person.rank}</div>
                  </div>
                  <div style={{ fontSize: '11px', color: '#EEEEFF', textAlign: 'center', maxWidth: '60px' }}>{person.name}</div>
                </motion.div>
              )
            })}
          </div>

          {/* テーブル */}
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #2244AA' }}>
                <th style={{ padding: '8px 4px', textAlign: 'left', color: '#CCDDF0', fontWeight: 600 }}>順位</th>
                <th style={{ padding: '8px 4px', textAlign: 'left', color: '#CCDDF0', fontWeight: 600 }}>名前</th>
                <th style={{ padding: '8px 4px', textAlign: 'left', color: '#CCDDF0', fontWeight: 600 }}>ランク</th>
                <th style={{ padding: '8px 4px', textAlign: 'right', color: '#CCDDF0', fontWeight: 600 }}>スコア</th>
                <th style={{ padding: '8px 4px', textAlign: 'right', color: '#CCDDF0', fontWeight: 600 }}>前月比</th>
              </tr>
            </thead>
            <tbody>
              {RANKING.map((person, i) => (
                <motion.tr
                  key={person.name}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + i * 0.05 }}
                  style={{
                    borderBottom: '1px solid rgba(34,68,170,0.2)',
                    background: person.name === MY_SCORE.name ? 'rgba(136,187,255,0.06)' : 'transparent',
                  }}
                >
                  <td style={{ padding: '10px 4px', color: '#EEEEFF', fontWeight: 700 }}>{person.rank}</td>
                  <td style={{ padding: '10px 4px', color: person.name === MY_SCORE.name ? '#88BBFF' : '#EEEEFF', fontWeight: person.name === MY_SCORE.name ? 700 : 400 }}>
                    {person.name}
                    {person.name === MY_SCORE.name && <span style={{ fontSize: '10px', color: '#88BBFF', marginLeft: '6px' }}>あなた</span>}
                  </td>
                  <td style={{ padding: '10px 4px' }}>
                    <span style={{ color: RANK_COLORS[person.rankLabel], fontSize: '12px' }}>{person.rankLabel}</span>
                  </td>
                  <td style={{ padding: '10px 4px', textAlign: 'right', color: '#EEEEFF', fontWeight: 600 }}>{person.score}</td>
                  <td style={{ padding: '10px 4px', textAlign: 'right', color: '#44FF88', fontSize: '12px' }}>{person.trend}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </motion.div>

        {/* スコア推移 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          style={{ ...cardStyle, borderRadius: '16px', padding: '24px', gridColumn: '1 / -1' }}
        >
          <h2 style={{ margin: '0 0 20px', fontSize: '16px', fontWeight: 700, color: '#EEEEFF' }}>スコア推移（直近6ヶ月）</h2>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '16px', height: '120px' }}>
            {MONTHLY_SCORES.map((m, i) => (
              <div key={m.month} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', height: '100%', justifyContent: 'flex-end' }}>
                <span style={{ fontSize: '11px', color: '#88BBFF', fontWeight: 600 }}>{m.score}</span>
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${(m.score / maxMonthly) * 100}px` }}
                  transition={{ duration: 0.6, delay: 0.4 + i * 0.1 }}
                  style={{
                    width: '100%',
                    background: i === MONTHLY_SCORES.length - 1
                      ? 'linear-gradient(180deg, #88BBFF 0%, #2244AA 100%)'
                      : 'linear-gradient(180deg, #2244AA 0%, #1a3388 100%)',
                    borderRadius: '4px 4px 0 0',
                    border: '1px solid #3355CC',
                    minHeight: '4px',
                  }}
                />
                <span style={{ fontSize: '11px', color: '#CCDDF0' }}>{m.month}</span>
              </div>
            ))}
          </div>
        </motion.div>

      </div>
    </div>
  )
}
