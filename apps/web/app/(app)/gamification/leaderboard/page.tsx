'use client'

import { motion } from 'framer-motion'
import { Crown } from 'lucide-react'

const CARD = '0 2px 12px rgba(0,0,0,0.4), inset 0 1px 0 rgba(136,187,255,0.05)'

const LEADERBOARD = [
  { rank: 1, name: '鈴木花子', points: 12500, level: 15, trend: '+3', color: '#34C759' },
  { rank: 2, name: '田中太郎', points: 8500, level: 12, trend: '+1', color: '#0071E3' },
  { rank: 3, name: '佐藤次郎', points: 5200, level: 8, trend: '+2', color: '#FF9F0A' },
]
const PODIUM = [LEADERBOARD[1]!, LEADERBOARD[0]!, LEADERBOARD[2]!]
const PODIUM_HEIGHTS = [120, 160, 100]

export default function LeaderboardPage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-[21px] font-semibold text-[#EEEEFF] tracking-[-0.03em]">リーダーボード</h1>
        <p className="text-[13px] text-[#CCDDF0] mt-0.5">成績に基づいたランキング</p>
      </div>

      {/* Podium */}
      <div className="flex items-end justify-center gap-4 pt-4 pb-2">
        {PODIUM.map((p, i) => {
          const isFirst = i === 1
          return (
            <motion.div key={p.name} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              className="flex flex-col items-center" style={{ width: isFirst ? 140 : 120 }}>
              <div className="w-12 h-12 rounded-full flex items-center justify-center text-white text-[16px] font-bold mb-2" style={{ background: p.color, boxShadow: isFirst ? `0 4px 16px ${p.color}50` : 'none' }}>
                {p.name[0]}
              </div>
              <p className="text-[13px] font-semibold text-[#EEEEFF] mb-1">{p.name}</p>
              <p className="text-[11px] text-[#99AACC] mb-2">Lv.{p.level}</p>
              <div className="w-full rounded-t-[8px] flex flex-col items-center justify-end pb-3"
                style={{ height: PODIUM_HEIGHTS[i] ?? 100, background: p.color + '15', border: `1px solid ${p.color}25`, borderBottom: 'none' }}>
                {isFirst && <Crown size={20} style={{ color: '#FFD60A' }} className="mb-1" />}
                <span className="text-[18px] font-bold" style={{ color: p.color }}>{p.rank}</span>
                <span className="text-[12px] font-semibold text-[#EEEEFF] tabular-nums mt-1">{p.points.toLocaleString()} pt</span>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Full Ranking */}
      <div className="bg-[#0c1028] rounded-[8px] overflow-hidden" style={{ boxShadow: CARD }}>
        {LEADERBOARD.map((p, i) => (
          <motion.div key={p.name} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 + i * 0.05 }}
            className="flex items-center gap-4 px-5 py-3.5" style={{ borderBottom: i < LEADERBOARD.length - 1 ? '1px solid rgba(34,68,170,0.2)' : 'none' }}>
            <span className="text-[16px] font-bold tabular-nums w-6 text-center" style={{ color: i === 0 ? '#FFD60A' : i === 1 ? '#C0C0C0' : '#CD7F32' }}>{p.rank}</span>
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-[13px] font-bold shrink-0" style={{ background: p.color }}>{p.name[0]}</div>
            <div className="flex-1">
              <p className="text-[14px] font-semibold text-[#EEEEFF]">{p.name}</p>
              <p className="text-[11px] text-[#99AACC]">Lv.{p.level}</p>
            </div>
            <span className="text-[12px] font-semibold text-[#34C759]">{p.trend}</span>
            <span className="text-[15px] font-bold text-[#EEEEFF] tabular-nums">{p.points.toLocaleString()} pt</span>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
