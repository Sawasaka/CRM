'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, Eye, Users, Plus, Clock, Lock, Calendar, Tag } from 'lucide-react'
import type { ManagedDocument, DocumentShareLink, DocumentViewEvent } from '@/types/crm'

// ─── Mock Data ───────────────────────────────────────────────────────────────

const MOCK_DOCS: Record<string, ManagedDocument> = {}

const MOCK_LINKS: Record<string, DocumentShareLink[]> = {}

const MOCK_VIEWS: Record<string, DocumentViewEvent[]> = {}

const TYPE_LABELS: Record<string, string> = { proposal: '提案書', service_intro: 'サービス紹介', case_study: '事例集', pricing: '料金表', other: 'その他' }
const CARD_SHADOW = '0 0 0 1px rgba(0,0,0,0.05), 0 2px 8px rgba(0,0,0,0.07), 0 8px 28px rgba(0,0,0,0.05)'

type Tab = 'info' | 'links' | 'views'

function formatDuration(sec: number) { return sec >= 60 ? `${Math.floor(sec / 60)}分${sec % 60}秒` : `${sec}秒` }
function formatSize(bytes: number) { return bytes >= 1000000 ? `${(bytes / 1000000).toFixed(1)}MB` : `${Math.round(bytes / 1000)}KB` }

// ─── Page ────────────────────────────────────────────────────────────────────

export default function DocumentDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [tab, setTab] = useState<Tab>('info')

  const doc = MOCK_DOCS[id]
  const links = MOCK_LINKS[id] || []
  const views = MOCK_VIEWS[id] || []

  if (!doc) return <div className="text-center py-20"><p className="text-[14px] text-[#AEAEB2]">資料が見つかりません</p></div>

  const TABS: { key: Tab; label: string }[] = [
    { key: 'info', label: '資料情報' },
    { key: 'links', label: `共有リンク (${links.length})` },
    { key: 'views', label: `閲覧分析 (${views.length})` },
  ]

  return (
    <div className="space-y-5">
      {/* Back + Title */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}>
        <button onClick={() => router.push('/documents')} className="flex items-center gap-1 text-[13px] text-[#CCDDF0] hover:text-[#1D1D1F] transition-colors mb-2">
          <ChevronLeft size={14} />資料一覧
        </button>
        <h1 className="text-[21px] font-semibold text-[#1D1D1F] tracking-[-0.03em]">{doc.name}</h1>
        <div className="flex items-center gap-3 mt-1">
          <span className="text-[12px] font-medium px-2 py-0.5 rounded-[4px] bg-[rgba(0,113,227,0.1)] text-[#0071E3]">{TYPE_LABELS[doc.type]}</span>
          <span className="text-[12px] text-[#CCDDF0]">{doc.totalPages}ページ</span>
          <span className="text-[12px] text-[#CCDDF0]">{formatSize(doc.fileSize)}</span>
          <span className="text-[12px] text-[#CCDDF0]">作成: {doc.createdAt}</span>
        </div>
      </motion.div>

      {/* Tab bar */}
      <div className="bg-white rounded-[14px] overflow-hidden" style={{ boxShadow: CARD_SHADOW }}>
        <div className="flex" style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
          {TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`relative px-5 py-3.5 text-[13px] font-medium transition-colors ${tab === t.key ? 'text-[#0071E3]' : 'text-[#CCDDF0] hover:text-[#1D1D1F]'}`}>
              {t.label}
              {tab === t.key && <motion.div layoutId="doc-tab" className="absolute bottom-0 left-0 right-0 h-[2px] rounded-full" style={{ background: '#0071E3' }} />}
            </button>
          ))}
        </div>

        <div className="p-5">
          <AnimatePresence mode="wait">
            {/* Info tab */}
            {tab === 'info' && (
              <motion.div key="info" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.2 }}>
                <div className="grid grid-cols-2 gap-5">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3"><Eye size={14} style={{ color: '#5E5CE6' }} /><span className="text-[13px] text-[#CCDDF0]">閲覧数</span><span className="text-[14px] font-semibold text-[#1D1D1F] ml-auto">{doc.totalViews}</span></div>
                    <div className="flex items-center gap-3"><Users size={14} style={{ color: '#34C759' }} /><span className="text-[13px] text-[#CCDDF0]">ユニーク閲覧者</span><span className="text-[14px] font-semibold text-[#1D1D1F] ml-auto">{doc.uniqueViewers}</span></div>
                    <div className="flex items-center gap-3"><Lock size={14} style={{ color: doc.password ? '#FF9F0A' : '#AEAEB2' }} /><span className="text-[13px] text-[#CCDDF0]">パスワード保護</span><span className="text-[14px] font-medium ml-auto" style={{ color: doc.password ? '#FF9F0A' : '#AEAEB2' }}>{doc.password ? '有効' : 'なし'}</span></div>
                    <div className="flex items-center gap-3"><Calendar size={14} style={{ color: doc.expiresAt ? '#FF3B30' : '#AEAEB2' }} /><span className="text-[13px] text-[#CCDDF0]">有効期限</span><span className="text-[14px] font-medium ml-auto" style={{ color: doc.expiresAt ? '#FF3B30' : '#AEAEB2' }}>{doc.expiresAt || '無期限'}</span></div>
                  </div>
                  <div className="space-y-4">
                    <div><span className="text-[11px] font-medium text-[#AEAEB2] uppercase tracking-[0.04em]">作成者</span><p className="text-[14px] font-medium text-[#1D1D1F] mt-1">{doc.createdBy}</p></div>
                    <div><span className="text-[11px] font-medium text-[#AEAEB2] uppercase tracking-[0.04em]">ステータス</span><p className="mt-1"><span className="text-[12px] font-medium px-2 py-0.5 rounded-[4px]" style={{ background: doc.isPublished ? 'rgba(52,199,89,0.1)' : 'rgba(0,0,0,0.06)', color: doc.isPublished ? '#1A7A35' : '#8E8E93' }}>{doc.isPublished ? '公開中' : '非公開'}</span></p></div>
                    <div><span className="text-[11px] font-medium text-[#AEAEB2] uppercase tracking-[0.04em]">タグ</span><div className="flex flex-wrap gap-1.5 mt-1">{doc.tags.map(t => <span key={t} className="flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-[4px] bg-[rgba(0,0,0,0.04)] text-[#CCDDF0]"><Tag size={10} />{t}</span>)}</div></div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Links tab */}
            {tab === 'links' && (
              <motion.div key="links" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.2 }}>
                <div className="flex justify-end mb-4">
                  <button className="h-[30px] px-3 flex items-center gap-1.5 text-[12px] font-medium text-white rounded-[7px]"
                    style={{ background: '#0071E3', boxShadow: '0 1px 4px rgba(0,113,227,0.3)' }}>
                    <Plus size={12} />新規リンク生成
                  </button>
                </div>
                <div className="rounded-[12px] overflow-hidden" style={{ border: '1px solid rgba(0,0,0,0.06)' }}>
                  <div className="grid grid-cols-[1fr_100px_80px_90px] items-center px-4 py-2" style={{ borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
                    {['送付先', '閲覧数', '最終閲覧', '作成日'].map(h => <span key={h} className="text-[11px] font-medium text-[#AEAEB2] uppercase tracking-[0.04em]">{h}</span>)}
                  </div>
                  {links.map((link, i) => (
                    <div key={link.id} className="grid grid-cols-[1fr_100px_80px_90px] items-center px-4 py-3" style={{ borderBottom: i < links.length - 1 ? '1px solid rgba(0,0,0,0.04)' : 'none' }}>
                      <div>
                        <p className="text-[13px] font-medium text-[#1D1D1F]">{link.contactName || '汎用リンク'}</p>
                        <p className="text-[11px] text-[#AEAEB2]">{link.companyName || '全員'}</p>
                      </div>
                      <span className="text-[13px] tabular-nums font-semibold text-[#1D1D1F]">{link.viewCount}</span>
                      <span className="text-[12px] text-[#CCDDF0]">{link.lastViewedAt ? (link.lastViewedAt.split(' ')[0] ?? link.lastViewedAt).slice(5) : '—'}</span>
                      <span className="text-[12px] text-[#AEAEB2]">{link.createdAt.slice(5)}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Views tab */}
            {tab === 'views' && (
              <motion.div key="views" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.2 }}>
                <div className="rounded-[12px] overflow-hidden" style={{ border: '1px solid rgba(0,0,0,0.06)' }}>
                  <div className="grid grid-cols-[1fr_100px_80px_80px] items-center px-4 py-2" style={{ borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
                    {['企業', '閲覧時間', 'ページ', '深度'].map(h => <span key={h} className="text-[11px] font-medium text-[#AEAEB2] uppercase tracking-[0.04em]">{h}</span>)}
                  </div>
                  {views.map((v, i) => (
                    <div key={v.id} className="grid grid-cols-[1fr_100px_80px_80px] items-center px-4 py-3" style={{ borderBottom: i < views.length - 1 ? '1px solid rgba(0,0,0,0.04)' : 'none' }}>
                      <div>
                        <p className="text-[13px] font-medium" style={{ color: v.resolvedCompany ? '#1D1D1F' : '#AEAEB2' }}>{v.resolvedCompany || '不明な訪問者'}</p>
                        <p className="text-[11px] text-[#AEAEB2]">{v.viewedAt}</p>
                      </div>
                      <div className="flex items-center gap-1"><Clock size={11} style={{ color: '#CCDDF0' }} /><span className="text-[12px] text-[#CCDDF0]">{formatDuration(v.totalDurationSec)}</span></div>
                      <span className="text-[12px] text-[#CCDDF0]">{v.pagesViewed}/{doc.totalPages}</span>
                      <span className="text-[13px] tabular-nums font-semibold px-2 py-0.5 rounded-[4px]" style={{
                        color: v.maxScrollDepth >= 80 ? '#1A7A35' : v.maxScrollDepth >= 50 ? '#C07000' : '#CF3131',
                        background: v.maxScrollDepth >= 80 ? 'rgba(52,199,89,0.1)' : v.maxScrollDepth >= 50 ? 'rgba(255,159,10,0.1)' : 'rgba(255,59,48,0.1)',
                      }}>{v.maxScrollDepth}%</span>
                    </div>
                  ))}
                  {views.length === 0 && <div className="text-center py-10"><p className="text-[13px] text-[#AEAEB2]">まだ閲覧データがありません</p></div>}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
