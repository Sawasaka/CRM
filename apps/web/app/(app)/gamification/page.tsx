'use client'

import { motion } from 'framer-motion'
import { Flame, Star, Shield, Target, Heart, Crown } from 'lucide-react'

const CARD = '0 2px 12px rgba(0,0,0,0.4), inset 0 1px 0 rgba(136,187,255,0.05)'

const STORY_CHAPTERS = [
  { phase: 'ORIGIN', title: '設立の原点', color: '#FF3B30', icon: Flame, body: '私たちは「営業の属人化」という課題に直面していました。優秀な営業マンが退職すると、ノウハウもナレッジも一緒に消えてしまう。この負のサイクルを断ち切るために、ルキスマCRMは生まれました。', milestone: '2024年 — 創業' },
  { phase: 'VISION', title: '成し遂げたいこと', color: '#0071E3', icon: Star, body: '顧客の声をプロダクト開発に直結させ、営業・マーケ・プロダクト・組織すべてをひとつの基盤でつなぐ「Revenue OS」を実現する。データドリブンに意思決定し、誰もが成果を出せる組織をつくる。', milestone: '現在 — Revenue OS構築中' },
  { phase: 'BARRIER', title: '立ちはだかる壁', color: '#FF9F0A', icon: Shield, body: '営業知識の属人化、部門間のデータ分断、顧客ヒアリングの活用不足、新人の立ち上がり遅延。これらの壁を一つずつ乗り越えていく必要がある。', milestone: '課題 — 組織の壁' },
  { phase: 'ACTION', title: '今やるべきこと', color: '#34C759', icon: Target, body: '全員が日々のアクションをデータとして蓄積し、ナレッジを共有し、顧客の声に耳を傾ける。小さな積み重ねが大きな変化を生む。ひとりの英雄ではなく、チームの力で勝つ。', milestone: 'アクション — 全員参加' },
  { phase: 'CULTURE', title: '私たちの文化', color: '#5E5CE6', icon: Heart, body: '失敗を恐れず挑戦すること。学んだことを惜しみなく共有すること。仲間の成長を自分の喜びとすること。数字だけでなく、プロセスと成長を称え合う文化を育む。', milestone: '文化 — 共有と挑戦' },
  { phase: 'FUTURE', title: '実現する未来', color: '#AF52DE', icon: Crown, body: '営業もプロダクトもCSも、全員がデータに基づいて最適な行動を取れる世界。顧客の成功が私たちの成功になり、その声が次の革新を生む。ルキスマCRMが日本のチャットCRMのスタンダードになる。', milestone: '未来 — 業界標準へ' },
]

export default function StoryPage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-[21px] font-semibold text-[#EEEEFF] tracking-[-0.03em]">ストーリー</h1>
        <p className="text-[13px] text-[#CCDDF0] mt-0.5">私たちが目指す未来と、そこに至るまでの道のり</p>
      </div>

      <div className="relative">
        {STORY_CHAPTERS.map((ch, i) => {
          const Icon = ch.icon
          return (
            <motion.div key={ch.phase} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }} className="flex gap-4 pb-6 last:pb-0">
              <div className="flex flex-col items-center shrink-0">
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: ch.color + '18' }}>
                  <Icon size={18} style={{ color: ch.color }} />
                </div>
                {i < STORY_CHAPTERS.length - 1 && <div className="w-px flex-1 mt-2" style={{ background: 'rgba(34,68,170,0.4)' }} />}
              </div>
              <div className="flex-1 bg-[#0c1028] rounded-[8px] p-5" style={{ boxShadow: CARD }}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-[0.08em] px-2 py-0.5 rounded-full" style={{ background: ch.color + '15', color: ch.color }}>{ch.phase}</span>
                  <span className="text-[11px] text-[#99AACC]">{ch.milestone}</span>
                </div>
                <h3 className="text-[15px] font-semibold text-[#EEEEFF] mb-2">{ch.title}</h3>
                <p className="text-[13px] text-[#CCDDF0] leading-relaxed">{ch.body}</p>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
