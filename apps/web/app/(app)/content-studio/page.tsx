'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Palette, Upload, FileText, Sparkles, CheckCircle2 } from 'lucide-react'
import {
  ObsPageShell,
  ObsHero,
  ObsCard,
  ObsChip,
  ObsButton,
} from '@/components/obsidian'

// ─── 資料作成スタジオ ─────────────────────────────────────────────────────────

interface Template {
  id: string
  name: string
  description: string
  fileType: 'pptx' | 'pdf' | 'doc'
  colors: string[]
  createdAt: string
  usageCount: number
}

const FILE_TYPE_LABELS: Record<string, string> = { pptx: 'PowerPoint', pdf: 'PDF', doc: 'Word' }

const MOCK_TEMPLATES: Template[] = [
  { id: 't1', name: '会社紹介資料', description: 'コーポレートカラーを基調としたフォーマルな会社紹介テンプレート', fileType: 'pptx', colors: ['#0071E3', '#1D1D1F', '#FFFFFF'], createdAt: '2026-03-10', usageCount: 24 },
  { id: 't2', name: '製品提案書', description: '製品の強みとROIを訴求するセールス向け提案テンプレート', fileType: 'pptx', colors: ['#FF9F0A', '#1D1D1F', '#F5F5F7'], createdAt: '2026-03-15', usageCount: 18 },
  { id: 't3', name: '事例紹介レポート', description: '導入事例のBefore/Afterを視覚的に伝えるレポート形式', fileType: 'pdf', colors: ['#34C759', '#1D1D1F', '#FFFFFF'], createdAt: '2026-03-20', usageCount: 12 },
]

export default function ContentStudioPage() {
  const [templates] = useState(MOCK_TEMPLATES)
  const [, setShowUpload] = useState(false)
  const [generating, setGenerating] = useState<string | null>(null)

  function handleGenerate(templateId: string) {
    setGenerating(templateId)
    setTimeout(() => setGenerating(null), 2500)
  }

  return (
    <ObsPageShell>
      <div className="w-full px-8 xl:px-12 2xl:px-16 pb-16">
        {/* ── Hero ── */}
        <ObsHero
          eyebrow="Content Studio"
          title="資料作成スタジオ"
          caption="ベース資料のトンマナを維持して、AIが新しい資料を自動生成します。"
          action={
            <ObsButton variant="primary" size="md" onClick={() => setShowUpload(true)}>
              <span className="inline-flex items-center gap-1.5">
                <Upload size={13} />
                ベース資料を登録
              </span>
            </ObsButton>
          }
        />

        {/* ── How it works ── */}
        <ObsCard depth="high" padding="lg" radius="xl" className="mb-6">
          <div className="flex items-center gap-2 mb-5">
            <Palette size={16} style={{ color: 'var(--color-obs-primary)' }} />
            <h3
              className="text-[13px] font-semibold uppercase tracking-[0.08em]"
              style={{ color: 'var(--color-obs-text-subtle)' }}
            >
              How it works
            </h3>
          </div>
          <div className="grid grid-cols-3 gap-6">
            {[
              { step: '01', icon: Upload, label: 'ベース資料登録', desc: 'デザイン・トンマナの元となる資料をアップロード' },
              { step: '02', icon: Sparkles, label: 'AI解析', desc: 'カラー・フォント・レイアウトを自動学習' },
              { step: '03', icon: FileText, label: '資料生成', desc: '同じトンマナで新しい資料を自動作成' },
            ].map(s => (
              <div key={s.step} className="flex items-start gap-3">
                <div
                  className="w-10 h-10 rounded-[var(--radius-obs-md)] flex items-center justify-center shrink-0"
                  style={{ backgroundColor: 'var(--color-obs-surface-highest)' }}
                >
                  <s.icon size={18} style={{ color: 'var(--color-obs-primary)' }} />
                </div>
                <div className="min-w-0">
                  <p
                    className="text-[10px] font-medium uppercase tracking-[0.12em]"
                    style={{ color: 'var(--color-obs-text-subtle)' }}
                  >
                    STEP {s.step}
                  </p>
                  <p className="text-[14px] font-semibold mt-0.5" style={{ color: 'var(--color-obs-text)' }}>
                    {s.label}
                  </p>
                  <p
                    className="text-[12px] mt-1 leading-relaxed"
                    style={{ color: 'var(--color-obs-text-muted)' }}
                  >
                    {s.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </ObsCard>

        {/* ── Templates ── */}
        <div className="flex items-baseline justify-between mb-4">
          <h2
            className="font-[family-name:var(--font-display)] text-[18px] font-semibold tracking-[-0.02em]"
            style={{ color: 'var(--color-obs-text)' }}
          >
            登録済みテンプレート
          </h2>
          <span className="text-[12px] tabular-nums" style={{ color: 'var(--color-obs-text-subtle)' }}>
            {templates.length} 件
          </span>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {templates.map((tpl, i) => (
            <motion.div
              key={tpl.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.06, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            >
              <ObsCard depth="high" padding="md" radius="xl">
                {/* Color bar */}
                <div className="flex items-center gap-1.5 mb-4">
                  {tpl.colors.map((c, j) => (
                    <div
                      key={j}
                      className="w-5 h-5 rounded-full"
                      style={{ backgroundColor: c }}
                    />
                  ))}
                  <span className="ml-auto">
                    <ObsChip tone="neutral">{FILE_TYPE_LABELS[tpl.fileType]}</ObsChip>
                  </span>
                </div>

                <h3
                  className="text-[15px] font-semibold tracking-[-0.01em] mb-1"
                  style={{ color: 'var(--color-obs-text)' }}
                >
                  {tpl.name}
                </h3>
                <p
                  className="text-[12px] leading-relaxed mb-5 line-clamp-2"
                  style={{ color: 'var(--color-obs-text-muted)' }}
                >
                  {tpl.description}
                </p>

                <div className="flex items-center justify-between">
                  <span className="text-[11px] tabular-nums" style={{ color: 'var(--color-obs-text-subtle)' }}>
                    {tpl.usageCount} 回利用
                  </span>
                  <ObsButton
                    variant={generating === tpl.id ? 'ghost' : 'primary'}
                    size="sm"
                    onClick={() => handleGenerate(tpl.id)}
                    disabled={generating === tpl.id}
                  >
                    {generating === tpl.id ? (
                      <span className="inline-flex items-center gap-1.5">
                        <CheckCircle2 size={12} />
                        生成完了
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5">
                        <Sparkles size={12} />
                        資料を生成
                      </span>
                    )}
                  </ObsButton>
                </div>
              </ObsCard>
            </motion.div>
          ))}
        </div>
      </div>
    </ObsPageShell>
  )
}
