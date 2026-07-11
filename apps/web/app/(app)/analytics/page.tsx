'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BarChart2, TrendingUp, Users, Award,
  Globe, FileText, Eye, Clock, Copy, ChevronDown, ChevronRight,
} from 'lucide-react'
import type { GA4PageData, GA4DailyTraffic, GA4SourceMedium, TrackedDocument, DocumentViewEvent } from '@/types/crm'
import {
  ObsCard,
  ObsHero,
  ObsPageShell,
} from '@/components/obsidian'

// ─── Types ──────────────────────────────────────────────────────────────────

type AnalyticsTab = 'channel' | 'team' | 'event' | 'ga' | 'tracking'

interface LeadSource {
  id: string
  label: string
  leads: number
  deals: number
  pocs: number
  won: number
  avgDealAmount: number
}

interface RepData {
  name: string
  deals: number
  won: number
  avgAmount: number
  avgCycleDays: number
  color: string
}

// ─── Mock Data ───────────────────────────────────────────────────────────────

const LEAD_SOURCES: LeadSource[] = []

const REPS: RepData[] = []

// ─── GA4 Mock Data ──────────────────────────────────────────────────────────

const GA4_PAGES: GA4PageData[] = []

const GA4_DAILY: GA4DailyTraffic[] = []

const GA4_SOURCES: GA4SourceMedium[] = []

// ─── Tracking Mock Data ─────────────────────────────────────────────────────

const MOCK_DOCS: TrackedDocument[] = []

const MOCK_VIEWS: Record<string, DocumentViewEvent[]> = {}

const DOC_TYPE_LABELS: Record<string, string> = {
  proposal: '提案書', service_intro: 'サービス紹介', case_study: '事例集', pricing: '料金表', other: 'その他',
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatAmount(n: number): string {
  if (n >= 1000000) return `¥${(n / 1000000).toFixed(1)}M`
  return `¥${(n / 10000).toFixed(0)}万`
}

// ─── Channel Funnel Table ────────────────────────────────────────────────────

function ChannelFunnelChart({ costMap, setCostMap }: {
  costMap: Record<string, string>
  setCostMap: React.Dispatch<React.SetStateAction<Record<string, string>>>
}) {
  return (
    <ObsCard depth="low" padding="none" radius="xl" className="overflow-hidden">
      <div className="px-6 py-4">
        <h3
          className="font-[family-name:var(--font-display)] text-base font-semibold tracking-[-0.02em]"
          style={{ color: 'var(--color-obs-text)' }}
        >
          経路別 費用 & ROI
        </h3>
      </div>

      <div
        className="grid grid-cols-[1fr_80px_80px_80px_120px_80px] items-center px-6 py-2.5 text-[11px] font-medium tracking-[0.1em] uppercase"
        style={{ color: 'var(--color-obs-text-subtle)' }}
      >
        {['経路', 'リード', '商談', '受注', '費用', 'ROI'].map(h => (
          <span key={h}>{h}</span>
        ))}
      </div>

      {LEAD_SOURCES.map((src, i) => {
        const cost = parseInt(costMap[src.id] || '0', 10) || 0
        const revenue = src.won * src.avgDealAmount
        const roi = cost > 0 ? (revenue / cost).toFixed(1) + 'x' : '—'
        const roiColor = cost > 0
          ? (revenue / cost >= 3 ? 'var(--color-obs-low)' : revenue / cost >= 1 ? 'var(--color-obs-middle)' : 'var(--color-obs-hot)')
          : 'var(--color-obs-text-subtle)'

        return (
          <motion.div
            key={src.id}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: i * 0.04, ease: [0.16, 1, 0.3, 1] }}
            className="grid grid-cols-[1fr_80px_80px_80px_120px_80px] items-center px-6 py-3"
          >
            <span className="text-[13px] font-medium" style={{ color: 'var(--color-obs-text)' }}>
              {src.label}
            </span>
            <span className="text-[13px] tabular-nums" style={{ color: 'var(--color-obs-text-muted)' }}>
              {src.leads}件
            </span>
            <span className="text-[13px] tabular-nums" style={{ color: 'var(--color-obs-text-muted)' }}>
              {src.deals}件
            </span>
            <span className="text-[13px] tabular-nums font-semibold" style={{ color: 'var(--color-obs-text)' }}>
              {src.won}件
            </span>
            <div className="relative">
              <span
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[11px]"
                style={{ color: 'var(--color-obs-text-subtle)' }}
              >
                ¥
              </span>
              <input
                type="number"
                placeholder="0"
                value={costMap[src.id] ?? ''}
                onChange={e => setCostMap(m => ({ ...m, [src.id]: e.target.value }))}
                className="w-full pl-6 pr-2 h-8 text-[13px] rounded-[var(--radius-obs-md)] focus:outline-none focus:ring-2 transition-all tabular-nums"
                style={{
                  backgroundColor: 'var(--color-obs-surface-high)',
                  color: 'var(--color-obs-text)',
                }}
              />
            </div>
            <span className="text-[14px] font-bold tabular-nums" style={{ color: roiColor }}>
              {roi}
            </span>
          </motion.div>
        )
      })}
    </ObsCard>
  )
}

// ─── Team Performance Tab ────────────────────────────────────────────────────

function TeamPerformanceTab() {
  const totalDeals = REPS.reduce((s, r) => s + r.deals, 0)
  const totalWon = REPS.reduce((s, r) => s + r.won, 0)
  const avgWin = totalDeals > 0 ? Math.round((totalWon / totalDeals) * 100) : 0
  const totalRevenue = REPS.reduce((s, r) => s + r.won * r.avgAmount, 0)

  return (
    <motion.div
      key="team"
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Team KPI */}
      <div className="grid grid-cols-4 gap-3 mb-5">
        {[
          { label: '総商談数', value: `${totalDeals}件`, color: 'var(--color-obs-primary)' },
          { label: '総受注数', value: `${totalWon}件`, color: 'var(--color-obs-low)' },
          { label: '平均受注率', value: `${avgWin}%`, color: 'var(--color-obs-primary-container)' },
          { label: '総受注額', value: formatAmount(totalRevenue), color: 'var(--color-obs-middle)' },
        ].map(kpi => (
          <ObsCard key={kpi.label} depth="high" padding="md" radius="lg">
            <p
              className="text-[10px] uppercase tracking-[0.1em] font-medium mb-1"
              style={{ color: 'var(--color-obs-text-subtle)' }}
            >
              {kpi.label}
            </p>
            <p
              className="font-[family-name:var(--font-display)] text-[22px] font-bold tracking-[-0.03em]"
              style={{ color: kpi.color }}
            >
              {kpi.value}
            </p>
          </ObsCard>
        ))}
      </div>

      {/* 担当者比較テーブル */}
      <ObsCard depth="low" padding="none" radius="xl" className="overflow-hidden mb-5">
        <div className="px-5 py-3.5">
          <h4
            className="font-[family-name:var(--font-display)] text-[15px] font-semibold tracking-[-0.02em]"
            style={{ color: 'var(--color-obs-text)' }}
          >
            担当者別パフォーマンス
          </h4>
        </div>
        <div
          className="grid grid-cols-[1fr_80px_80px_80px_100px_80px] items-center px-5 py-2 text-[11px] font-medium uppercase tracking-[0.1em]"
          style={{ color: 'var(--color-obs-text-subtle)' }}
        >
          {['担当者', '商談', '受注', '受注率', '平均金額', 'サイクル'].map(h => (
            <span key={h}>{h}</span>
          ))}
        </div>
        {REPS.map((rep, i) => {
          const winRate = Math.round((rep.won / rep.deals) * 100)
          return (
            <motion.div
              key={rep.name}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
              className="grid grid-cols-[1fr_80px_80px_80px_100px_80px] items-center px-5 py-3"
            >
              <div className="flex items-center gap-2.5">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-semibold shrink-0"
                  style={{ backgroundColor: rep.color, color: 'var(--color-obs-on-primary)' }}
                >
                  {rep.name[0]}
                </div>
                <span className="text-[13px] font-medium" style={{ color: 'var(--color-obs-text)' }}>
                  {rep.name}
                </span>
              </div>
              <span className="text-[13px] tabular-nums" style={{ color: 'var(--color-obs-text-muted)' }}>
                {rep.deals}件
              </span>
              <span className="text-[13px] tabular-nums font-semibold" style={{ color: 'var(--color-obs-text)' }}>
                {rep.won}件
              </span>
              <span
                className="text-[13px] tabular-nums font-semibold"
                style={{
                  color:
                    winRate >= 50
                      ? 'var(--color-obs-low)'
                      : winRate >= 30
                        ? 'var(--color-obs-middle)'
                        : 'var(--color-obs-hot)',
                }}
              >
                {winRate}%
              </span>
              <span className="text-[13px] tabular-nums" style={{ color: 'var(--color-obs-text-muted)' }}>
                {formatAmount(rep.avgAmount)}
              </span>
              <span className="text-[13px] tabular-nums" style={{ color: 'var(--color-obs-text-muted)' }}>
                {rep.avgCycleDays}日
              </span>
            </motion.div>
          )
        })}
      </ObsCard>

      {/* Next Action 推奨 */}
      {REPS.length > 0 && <div className="space-y-2">
        <h4
          className="text-[13px] font-semibold mb-2"
          style={{ color: 'var(--color-obs-text)' }}
        >
          Next Action 推奨
        </h4>
        <div
          className="flex items-center gap-3 px-4 py-3 rounded-[var(--radius-obs-lg)]"
          style={{ backgroundColor: 'rgba(255,107,107,0.10)' }}
        >
          <div
            className="w-1.5 h-1.5 rounded-full shrink-0"
            style={{ backgroundColor: 'var(--color-obs-hot)' }}
          />
          <p className="text-[13px]" style={{ color: 'var(--color-obs-hot)' }}>
            <span className="font-semibold">佐藤:</span> 受注率33% — 商談の質向上が必要。Aランク案件に集中推奨
          </p>
        </div>
        <div
          className="flex items-center gap-3 px-4 py-3 rounded-[var(--radius-obs-lg)]"
          style={{ backgroundColor: 'rgba(255,184,107,0.10)' }}
        >
          <div
            className="w-1.5 h-1.5 rounded-full shrink-0"
            style={{ backgroundColor: 'var(--color-obs-middle)' }}
          />
          <p className="text-[13px]" style={{ color: 'var(--color-obs-middle)' }}>
            <span className="font-semibold">佐藤:</span> 平均サイクル56日 — 他メンバー（38-42日）対比で長い。ボトルネック確認推奨
          </p>
        </div>
      </div>}
    </motion.div>
  )
}

// ─── GA4 Tab ─────────────────────────────────────────────────────────────────

function GATab() {
  const totalSessions = GA4_DAILY.reduce((s, d) => s + d.sessions, 0)
  const totalUsers = GA4_DAILY.reduce((s, d) => s + d.users, 0)
  const totalPV = GA4_DAILY.reduce((s, d) => s + d.pageViews, 0)
  const avgCV = GA4_DAILY.length
    ? (GA4_DAILY.reduce((s, d) => s + d.cvRate, 0) / GA4_DAILY.length).toFixed(1)
    : '0.0'

  return (
    <motion.div
      key="ga"
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* KPI Summary */}
      <div className="grid grid-cols-4 gap-3 mb-5">
        {[
          { label: 'セッション', value: totalSessions.toLocaleString(), color: 'var(--color-obs-primary)' },
          { label: 'ユーザー', value: totalUsers.toLocaleString(), color: 'var(--color-obs-low)' },
          { label: 'ページビュー', value: totalPV.toLocaleString(), color: 'var(--color-obs-primary-container)' },
          { label: 'CV率', value: `${avgCV}%`, color: 'var(--color-obs-middle)' },
        ].map(kpi => (
          <ObsCard key={kpi.label} depth="high" padding="md" radius="lg">
            <p
              className="text-[10px] uppercase tracking-[0.1em] font-medium mb-1"
              style={{ color: 'var(--color-obs-text-subtle)' }}
            >
              {kpi.label}
            </p>
            <p
              className="font-[family-name:var(--font-display)] text-[22px] font-bold tracking-[-0.03em]"
              style={{ color: kpi.color }}
            >
              {kpi.value}
            </p>
          </ObsCard>
        ))}
      </div>

      {/* Daily traffic table */}
      <ObsCard depth="low" padding="none" radius="xl" className="overflow-hidden mb-5">
        <div className="px-5 py-3.5">
          <h4
            className="font-[family-name:var(--font-display)] text-[15px] font-semibold tracking-[-0.02em]"
            style={{ color: 'var(--color-obs-text)' }}
          >
            日別トラフィック
          </h4>
        </div>
        <div
          className="grid grid-cols-[1fr_90px_90px_90px_60px] items-center px-5 py-2 text-[11px] font-medium uppercase tracking-[0.1em]"
          style={{ color: 'var(--color-obs-text-subtle)' }}
        >
          {['日付', 'セッション', 'ユーザー', 'PV', 'CV率'].map(h => (
            <span key={h}>{h}</span>
          ))}
        </div>
        {GA4_DAILY.map((d) => (
          <div
            key={d.date}
            className="grid grid-cols-[1fr_90px_90px_90px_60px] items-center px-5 py-2.5"
          >
            <span className="text-[13px] font-medium" style={{ color: 'var(--color-obs-text)' }}>
              {d.date}
            </span>
            <span className="text-[13px] tabular-nums" style={{ color: 'var(--color-obs-text-muted)' }}>
              {d.sessions}
            </span>
            <span className="text-[13px] tabular-nums" style={{ color: 'var(--color-obs-text-muted)' }}>
              {d.users}
            </span>
            <span className="text-[13px] tabular-nums" style={{ color: 'var(--color-obs-text-muted)' }}>
              {d.pageViews.toLocaleString()}
            </span>
            <span
              className="text-[13px] tabular-nums font-semibold"
              style={{
                color:
                  d.cvRate >= 3
                    ? 'var(--color-obs-low)'
                    : d.cvRate >= 2.5
                      ? 'var(--color-obs-middle)'
                      : 'var(--color-obs-text-subtle)',
              }}
            >
              {d.cvRate}%
            </span>
          </div>
        ))}
      </ObsCard>

      <div className="space-y-5">
        {/* Page PV table */}
        <ObsCard depth="low" padding="none" radius="xl" className="overflow-hidden">
          <div className="px-5 py-3.5">
            <h4
              className="font-[family-name:var(--font-display)] text-[15px] font-semibold tracking-[-0.02em]"
              style={{ color: 'var(--color-obs-text)' }}
            >
              ページ別パフォーマンス
            </h4>
          </div>
          <div
            className="grid grid-cols-[1fr_90px_90px_80px_70px] items-center px-5 py-2 text-[11px] font-medium uppercase tracking-[0.1em]"
            style={{ color: 'var(--color-obs-text-subtle)' }}
          >
            {['ページ', 'PV', 'UU', '直帰率', 'CV'].map(h => (
              <span key={h}>{h}</span>
            ))}
          </div>
          {GA4_PAGES.map((p) => (
            <div
              key={p.path}
              className="grid grid-cols-[1fr_90px_90px_80px_70px] items-center px-5 py-2.5"
            >
              <div>
                <p className="text-[13px] font-medium" style={{ color: 'var(--color-obs-text)' }}>
                  {p.title}
                </p>
                <p className="text-[11px]" style={{ color: 'var(--color-obs-text-subtle)' }}>
                  {p.path}
                </p>
              </div>
              <span
                className="text-[13px] tabular-nums font-semibold"
                style={{ color: 'var(--color-obs-text)' }}
              >
                {p.pageViews.toLocaleString()}
              </span>
              <span className="text-[13px] tabular-nums" style={{ color: 'var(--color-obs-text-muted)' }}>
                {p.uniqueUsers.toLocaleString()}
              </span>
              <span
                className="text-[13px] tabular-nums"
                style={{
                  color:
                    p.bounceRate <= 25
                      ? 'var(--color-obs-low)'
                      : p.bounceRate <= 40
                        ? 'var(--color-obs-text-muted)'
                        : 'var(--color-obs-hot)',
                }}
              >
                {p.bounceRate}%
              </span>
              <span
                className="text-[13px] tabular-nums font-semibold"
                style={{ color: 'var(--color-obs-primary)' }}
              >
                {p.conversions}
              </span>
            </div>
          ))}
        </ObsCard>

        {/* Sources table */}
        <ObsCard depth="low" padding="none" radius="xl" className="overflow-hidden">
          <div className="px-5 py-3.5">
            <h4
              className="font-[family-name:var(--font-display)] text-[15px] font-semibold tracking-[-0.02em]"
              style={{ color: 'var(--color-obs-text)' }}
            >
              流入元別セッション
            </h4>
          </div>
          {GA4_SOURCES.map((s) => (
            <div
              key={`${s.source}-${s.medium}`}
              className="grid grid-cols-[1fr_80px_60px] items-center px-5 py-3"
            >
              <div>
                <p className="text-[13px] font-medium" style={{ color: 'var(--color-obs-text)' }}>
                  {s.source}
                </p>
                <p className="text-[11px]" style={{ color: 'var(--color-obs-text-subtle)' }}>
                  {s.medium}
                </p>
              </div>
              <span
                className="text-[13px] tabular-nums font-semibold text-right"
                style={{ color: 'var(--color-obs-text)' }}
              >
                {s.sessions}
              </span>
              <div className="text-right">
                <span
                  className="text-[12px] tabular-nums font-semibold px-2 py-0.5 rounded-[var(--radius-obs-sm)]"
                  style={{
                    color:
                      s.cvRate >= 4
                        ? 'var(--color-obs-low)'
                        : s.cvRate >= 2.5
                          ? 'var(--color-obs-middle)'
                          : 'var(--color-obs-text-subtle)',
                    backgroundColor:
                      s.cvRate >= 4
                        ? 'rgba(126,198,255,0.12)'
                        : s.cvRate >= 2.5
                          ? 'rgba(255,184,107,0.12)'
                          : 'var(--color-obs-surface-high)',
                  }}
                >
                  {s.cvRate}%
                </span>
              </div>
            </div>
          ))}
        </ObsCard>
      </div>
    </motion.div>
  )
}

// ─── Document Tracking Tab ───────────────────────────────────────────────────

function TrackingTab() {
  const [expandedDoc, setExpandedDoc] = useState<string | null>(null)

  const handleCopy = (url: string) => {
    navigator.clipboard.writeText(url)
  }

  const formatDuration = (sec: number) => {
    if (sec >= 60) return `${Math.floor(sec / 60)}分${sec % 60}秒`
    return `${sec}秒`
  }

  return (
    <motion.div
      key="tracking"
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Summary */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {[
          { label: '総資料数', value: MOCK_DOCS.length, color: 'var(--color-obs-primary)' },
          { label: '総閲覧数', value: MOCK_DOCS.reduce((s, d) => s + d.totalViews, 0), color: 'var(--color-obs-primary-container)' },
          { label: 'ユニーク閲覧者', value: MOCK_DOCS.reduce((s, d) => s + d.uniqueViewers, 0), color: 'var(--color-obs-low)' },
        ].map(kpi => (
          <ObsCard key={kpi.label} depth="high" padding="md" radius="lg">
            <p
              className="text-[10px] uppercase tracking-[0.1em] font-medium mb-1"
              style={{ color: 'var(--color-obs-text-subtle)' }}
            >
              {kpi.label}
            </p>
            <p
              className="font-[family-name:var(--font-display)] text-[22px] font-bold tracking-[-0.03em]"
              style={{ color: kpi.color }}
            >
              {kpi.value}
            </p>
          </ObsCard>
        ))}
      </div>

      {/* Document cards */}
      <div className="space-y-3">
        {MOCK_DOCS.map((doc, di) => {
          const views = MOCK_VIEWS[doc.id] || []
          const isExpanded = expandedDoc === doc.id

          return (
            <motion.div
              key={doc.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.22, delay: di * 0.05, ease: [0.16, 1, 0.3, 1] }}
            >
              <ObsCard depth="high" padding="none" radius="xl" className="overflow-hidden">
                {/* Card header */}
                <div className="px-4 py-4 flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-[var(--radius-obs-md)] flex items-center justify-center shrink-0"
                    style={{ backgroundColor: 'rgba(171,199,255,0.12)' }}
                  >
                    <FileText size={16} style={{ color: 'var(--color-obs-primary)' }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-[13.5px] font-semibold truncate"
                      style={{ color: 'var(--color-obs-text)' }}
                    >
                      {doc.name}
                    </p>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="text-[11px]" style={{ color: 'var(--color-obs-text-subtle)' }}>
                        {DOC_TYPE_LABELS[doc.type]}
                      </span>
                      <span className="text-[11px]" style={{ color: 'var(--color-obs-text-subtle)' }}>
                        {doc.totalPages}ページ
                      </span>
                      <span className="text-[11px]" style={{ color: 'var(--color-obs-text-subtle)' }}>
                        {doc.createdAt}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="flex items-center gap-1">
                      <Eye size={12} style={{ color: 'var(--color-obs-primary-container)' }} />
                      <span
                        className="text-[12px] font-semibold"
                        style={{ color: 'var(--color-obs-primary-container)' }}
                      >
                        {doc.totalViews}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users size={12} style={{ color: 'var(--color-obs-low)' }} />
                      <span
                        className="text-[12px] font-medium"
                        style={{ color: 'var(--color-obs-low)' }}
                      >
                        {doc.uniqueViewers}
                      </span>
                    </div>
                    <button
                      onClick={() => handleCopy(doc.trackingUrl)}
                      className="h-7 px-2.5 flex items-center gap-1 text-[11px] font-medium rounded-[var(--radius-obs-md)] transition-colors duration-150 hover:bg-[var(--color-obs-surface-highest)]"
                      style={{ color: 'var(--color-obs-text-muted)' }}
                    >
                      <Copy size={11} />
                      URL
                    </button>
                    <button
                      onClick={() => setExpandedDoc(isExpanded ? null : doc.id)}
                      className="h-7 px-2.5 flex items-center gap-1 text-[11px] font-medium rounded-[var(--radius-obs-md)] transition-colors duration-150"
                      style={{
                        backgroundColor: isExpanded
                          ? 'rgba(171,199,255,0.14)'
                          : 'var(--color-obs-surface-highest)',
                        color: isExpanded
                          ? 'var(--color-obs-primary)'
                          : 'var(--color-obs-text-muted)',
                      }}
                    >
                      {isExpanded ? <ChevronDown size={11} /> : <ChevronRight size={11} />}
                      詳細
                    </button>
                  </div>
                </div>

                {/* Expanded view history */}
                <AnimatePresence>
                  {isExpanded && views.length > 0 && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                      className="overflow-hidden"
                      style={{ backgroundColor: 'var(--color-obs-surface-low)' }}
                    >
                      <div
                        className="grid grid-cols-[1fr_100px_80px_1fr] items-center px-4 py-2 text-[10px] font-medium uppercase tracking-[0.1em]"
                        style={{ color: 'var(--color-obs-text-subtle)' }}
                      >
                        <span>企業</span>
                        <span>閲覧時間</span>
                        <span>ページ</span>
                        <span>スクロール深度</span>
                      </div>
                      {views.map((v) => (
                        <div
                          key={v.id}
                          className="grid grid-cols-[1fr_100px_80px_1fr] items-center px-4 py-2.5"
                        >
                          <div>
                            <p
                              className="text-[12px] font-medium"
                              style={{
                                color: v.resolvedCompany
                                  ? 'var(--color-obs-text)'
                                  : 'var(--color-obs-text-subtle)',
                              }}
                            >
                              {v.resolvedCompany || '不明な訪問者'}
                            </p>
                            <p className="text-[10px]" style={{ color: 'var(--color-obs-text-subtle)' }}>
                              {v.viewedAt}
                            </p>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock size={10} style={{ color: 'var(--color-obs-text-muted)' }} />
                            <span className="text-[11px]" style={{ color: 'var(--color-obs-text-muted)' }}>
                              {formatDuration(v.totalDurationSec)}
                            </span>
                          </div>
                          <span className="text-[11px]" style={{ color: 'var(--color-obs-text-muted)' }}>
                            {v.pagesViewed}/{doc.totalPages}
                          </span>
                          <span
                            className="text-[12px] tabular-nums font-semibold px-2 py-0.5 rounded-[var(--radius-obs-sm)] w-fit"
                            style={{
                              color:
                                v.maxScrollDepth >= 80
                                  ? 'var(--color-obs-low)'
                                  : v.maxScrollDepth >= 50
                                    ? 'var(--color-obs-middle)'
                                    : 'var(--color-obs-hot)',
                              backgroundColor:
                                v.maxScrollDepth >= 80
                                  ? 'rgba(126,198,255,0.12)'
                                  : v.maxScrollDepth >= 50
                                    ? 'rgba(255,184,107,0.12)'
                                    : 'rgba(255,107,107,0.12)',
                            }}
                          >
                            {v.maxScrollDepth}%
                          </span>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </ObsCard>
            </motion.div>
          )
        })}
      </div>
    </motion.div>
  )
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState<AnalyticsTab>('channel')
  const [costMap, setCostMap] = useState<Record<string, string>>({})

  // Summary KPIs
  const totalLeads = LEAD_SOURCES.reduce((s, x) => s + x.leads, 0)
  const totalWon   = LEAD_SOURCES.reduce((s, x) => s + x.won, 0)
  const totalDeals = LEAD_SOURCES.reduce((s, x) => s + x.deals, 0)
  const avgWinRate = totalDeals > 0 ? Math.round((totalWon / totalDeals) * 100) : 0
  const roiSorted = [...LEAD_SOURCES].sort((a, b) => {
    const ra = parseInt(costMap[a.id] || '0') > 0 ? (a.won * a.avgDealAmount) / parseInt(costMap[a.id] || '0') : 0
    const rb = parseInt(costMap[b.id] || '0') > 0 ? (b.won * b.avgDealAmount) / parseInt(costMap[b.id] || '0') : 0
    return rb - ra
  })
  const bestROI = roiSorted[0] ?? null

  const TABS: { key: AnalyticsTab; label: string; icon: React.ElementType }[] = [
    { key: 'channel',  label: 'IS経路分析',      icon: TrendingUp },
    { key: 'team',     label: 'チーム実績',      icon: Users },
    { key: 'ga',       label: 'HP分析',          icon: Globe },
    { key: 'tracking', label: '資料トラッキング', icon: FileText },
    { key: 'event',    label: 'イベント成果',    icon: BarChart2 },
  ]

  return (
    <ObsPageShell>
      <div className="w-full px-8 xl:px-12 2xl:px-16 pb-16">
        <ObsHero
          eyebrow="Analytics"
          title="アナリティクス"
          caption="経路別・担当者別の商談パフォーマンス分析"
        />

        {/* ── Summary KPI Bar ── */}
        <div className="grid grid-cols-3 gap-4">
          {[
            {
              label: '総リード数',
              value: `${totalLeads}件`,
              sub: '全経路合計',
              icon: Users,
              color: 'var(--color-obs-primary)',
            },
            {
              label: '平均受注率',
              value: `${avgWinRate}%`,
              sub: '商談→受注',
              icon: Award,
              color: 'var(--color-obs-low)',
            },
            {
              label: '最高ROI経路',
              value: bestROI?.label ?? '—',
              sub: bestROI
                ? `受注${bestROI.won}件 / 受注額${formatAmount(bestROI.won * bestROI.avgDealAmount)}`
                : 'データなし',
              icon: TrendingUp,
              color: 'var(--color-obs-primary-container)',
            },
          ].map((kpi, i) => (
            <motion.div
              key={kpi.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.28, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] }}
            >
              <ObsCard depth="high" padding="md" radius="xl" className="flex items-start gap-3">
                <div
                  className="w-10 h-10 rounded-[var(--radius-obs-md)] flex items-center justify-center shrink-0 mt-0.5"
                  style={{ backgroundColor: 'rgba(171,199,255,0.10)' }}
                >
                  <kpi.icon size={16} style={{ color: kpi.color }} />
                </div>
                <div>
                  <p
                    className="text-[11px] uppercase tracking-[0.1em] font-medium mb-0.5"
                    style={{ color: 'var(--color-obs-text-subtle)' }}
                  >
                    {kpi.label}
                  </p>
                  <p
                    className="font-[family-name:var(--font-display)] text-[20px] font-semibold tracking-[-0.02em] leading-none"
                    style={{ color: 'var(--color-obs-text)' }}
                  >
                    {kpi.value}
                  </p>
                  <p className="text-[11px] mt-1" style={{ color: 'var(--color-obs-text-muted)' }}>
                    {kpi.sub}
                  </p>
                </div>
              </ObsCard>
            </motion.div>
          ))}
        </div>

        {/* ── Tab Bar ── */}
        <div className="mt-6">
          <ObsCard depth="low" padding="none" radius="xl" className="overflow-hidden">
            <div className="flex px-2 pt-2 gap-1">
              {TABS.map(tab => {
                const active = activeTab === tab.key
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className="relative flex items-center gap-2 px-4 py-2.5 text-[13px] font-medium rounded-[var(--radius-obs-md)] transition-colors duration-150"
                    style={{
                      color: active ? 'var(--color-obs-primary)' : 'var(--color-obs-text-muted)',
                      backgroundColor: active ? 'var(--color-obs-surface-high)' : 'transparent',
                    }}
                  >
                    <tab.icon size={13} />
                    {tab.label}
                    {active && (
                      <motion.div
                        layoutId="analytics-tab"
                        className="absolute bottom-0 left-2 right-2 h-[2px] rounded-full"
                        style={{ backgroundColor: 'var(--color-obs-primary)' }}
                        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                      />
                    )}
                  </button>
                )
              })}
            </div>

            {/* ── Tab Content ── */}
            <div className="p-5">
              <AnimatePresence mode="wait">
                {activeTab === 'channel' && (
                  <motion.div
                    key="channel"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <ChannelFunnelChart costMap={costMap} setCostMap={setCostMap} />
                  </motion.div>
                )}

                {activeTab === 'team' && <TeamPerformanceTab />}

                {activeTab === 'ga' && <GATab />}

                {activeTab === 'tracking' && <TrackingTab />}

                {activeTab === 'event' && (
                  <motion.div
                    key="event"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                    className="flex flex-col items-center justify-center py-16 gap-4"
                  >
                    <div
                      className="w-14 h-14 rounded-[var(--radius-obs-lg)] flex items-center justify-center"
                      style={{ backgroundColor: 'rgba(171,199,255,0.10)' }}
                    >
                      <BarChart2 size={24} style={{ color: 'var(--color-obs-primary)' }} />
                    </div>
                    <div className="text-center">
                      <p
                        className="font-[family-name:var(--font-display)] text-[16px] font-semibold tracking-[-0.02em]"
                        style={{ color: 'var(--color-obs-text)' }}
                      >
                        イベント成果分析
                      </p>
                      <p className="text-[13px] mt-1" style={{ color: 'var(--color-obs-text-muted)' }}>
                        セミナー・展示会・ウェビナーの成果分析 — 近日公開
                      </p>
                    </div>
                    <div
                      className="px-4 py-1.5 rounded-full text-[12px] font-medium"
                      style={{
                        backgroundColor: 'rgba(171,199,255,0.12)',
                        color: 'var(--color-obs-primary)',
                      }}
                    >
                      Coming Soon
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </ObsCard>
        </div>
      </div>
    </ObsPageShell>
  )
}
