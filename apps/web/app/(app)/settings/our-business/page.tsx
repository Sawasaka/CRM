'use client'

/**
 * 自社サービス情報の設定画面
 * リサーチチャットのシステムプロンプトに常時挿入される
 */
import { useEffect, useState } from 'react'
import { Save, Plus, X } from 'lucide-react'
import { ObsCard, ObsHero, ObsPageShell, ObsSectionHeader } from '@/components/obsidian'

type OurBusiness = {
  serviceName: string
  industry: string
  strengths: string[]
  targetCustomer: string
  successCases: string[]
  description?: string
}

export default function OurBusinessSettingsPage() {
  const [data, setData] = useState<OurBusiness>({
    serviceName: '',
    industry: '',
    strengths: [],
    targetCustomer: '',
    successCases: [],
    description: '',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [savedAt, setSavedAt] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/our-business')
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => j && setData(j))
      .finally(() => setLoading(false))
  }, [])

  async function save() {
    setSaving(true)
    setError(null)
    try {
      const res = await fetch('/api/our-business', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        throw new Error(j.error || `HTTP ${res.status}`)
      }
      setSavedAt(new Date().toLocaleTimeString('ja-JP'))
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setSaving(false)
    }
  }

  function updateStrength(i: number, v: string) {
    setData((d) => ({ ...d, strengths: d.strengths.map((s, idx) => (idx === i ? v : s)) }))
  }
  function addStrength() {
    setData((d) => ({ ...d, strengths: [...d.strengths, ''] }))
  }
  function removeStrength(i: number) {
    setData((d) => ({ ...d, strengths: d.strengths.filter((_, idx) => idx !== i) }))
  }
  function updateCase(i: number, v: string) {
    setData((d) => ({ ...d, successCases: d.successCases.map((s, idx) => (idx === i ? v : s)) }))
  }
  function addCase() {
    setData((d) => ({ ...d, successCases: [...d.successCases, ''] }))
  }
  function removeCase(i: number) {
    setData((d) => ({ ...d, successCases: d.successCases.filter((_, idx) => idx !== i) }))
  }

  return (
    <ObsPageShell>
      <div className="w-full max-w-3xl px-8 xl:px-12 2xl:px-16 pb-24 mx-auto">
        <ObsHero
          eyebrow="設定"
          title="自社サービス情報"
          caption="リサーチチャットのシステムプロンプトに常時挿入されます。詳細に書くほどAIの回答精度が上がります。"
        />

        {loading ? (
          <div className="mt-8 text-center text-sm" style={{ color: 'var(--color-obs-text-muted)' }}>
            読み込み中...
          </div>
        ) : (
          <div className="flex flex-col gap-4 mt-6">
            {/* サービス名 + 業界 */}
            <ObsCard depth="high" padding="lg">
              <ObsSectionHeader title="基本情報" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                <Field
                  label="サービス名"
                  value={data.serviceName}
                  onChange={(v) => setData((d) => ({ ...d, serviceName: v }))}
                  placeholder="例：BGM(営業ターゲティングDB)"
                />
                <Field
                  label="業界"
                  value={data.industry}
                  onChange={(v) => setData((d) => ({ ...d, industry: v }))}
                  placeholder="例：B2B SaaS / 営業支援"
                />
              </div>
              <div className="mt-4">
                <FieldArea
                  label="サービス概要"
                  value={data.description ?? ''}
                  onChange={(v) => setData((d) => ({ ...d, description: v }))}
                  placeholder="サービスの説明（200文字以内推奨）"
                />
              </div>
            </ObsCard>

            {/* 強み */}
            <ObsCard depth="high" padding="lg">
              <ObsSectionHeader title="強み・差別化ポイント" caption="箇条書きで、最も自信のあるものから記述" />
              <div className="flex flex-col gap-2 mt-3">
                {data.strengths.map((s, i) => (
                  <ItemRow key={i} value={s} onChange={(v) => updateStrength(i, v)} onRemove={() => removeStrength(i)} placeholder={`強み ${i + 1}`} />
                ))}
                <button
                  type="button"
                  onClick={addStrength}
                  className="self-start inline-flex items-center gap-1.5 text-[12px] py-1 px-2 rounded transition-colors"
                  style={{ color: 'var(--color-obs-primary)' }}
                >
                  <Plus size={12} /> 強みを追加
                </button>
              </div>
            </ObsCard>

            {/* 想定顧客 */}
            <ObsCard depth="high" padding="lg">
              <ObsSectionHeader title="想定顧客" caption="どんな組織・部門・役職に届けたいか" />
              <div className="mt-3">
                <FieldArea
                  label=""
                  value={data.targetCustomer}
                  onChange={(v) => setData((d) => ({ ...d, targetCustomer: v }))}
                  placeholder="例：日本国内のB2Bセールス組織。エンタープライズ営業・ABM運用を行うチーム。"
                />
              </div>
            </ObsCard>

            {/* 成功事例 */}
            <ObsCard depth="high" padding="lg">
              <ObsSectionHeader title="成功事例" caption="過去の代表的な導入企業・成果。AI回答に説得力を持たせる材料" />
              <div className="flex flex-col gap-2 mt-3">
                {data.successCases.map((s, i) => (
                  <ItemRow key={i} value={s} onChange={(v) => updateCase(i, v)} onRemove={() => removeCase(i)} placeholder={`事例 ${i + 1}`} />
                ))}
                <button
                  type="button"
                  onClick={addCase}
                  className="self-start inline-flex items-center gap-1.5 text-[12px] py-1 px-2 rounded transition-colors"
                  style={{ color: 'var(--color-obs-primary)' }}
                >
                  <Plus size={12} /> 事例を追加
                </button>
              </div>
            </ObsCard>

            {/* 保存 */}
            <div className="flex items-center justify-between mt-2">
              <div className="text-[11px]" style={{ color: 'var(--color-obs-text-subtle)' }}>
                {error ? <span style={{ color: '#ff6b6b' }}>{error}</span> : savedAt ? `保存済み（${savedAt}）` : '未保存'}
              </div>
              <button
                type="button"
                onClick={save}
                disabled={saving}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[var(--radius-obs-md)] text-[13px] font-medium transition-colors"
                style={{
                  backgroundColor: 'var(--color-obs-primary)',
                  color: 'white',
                  opacity: saving ? 0.6 : 1,
                }}
              >
                <Save size={13} />
                {saving ? '保存中...' : '保存'}
              </button>
            </div>
          </div>
        )}
      </div>
    </ObsPageShell>
  )
}

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[11px] font-medium tracking-wide" style={{ color: 'var(--color-obs-text-muted)' }}>{label}</span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="px-3 py-2 rounded-[var(--radius-obs-md)] text-[13px] outline-none"
        style={{
          backgroundColor: 'var(--color-obs-surface-highest)',
          color: 'var(--color-obs-text)',
          border: '1px solid var(--color-obs-border)',
        }}
      />
    </label>
  )
}

function FieldArea({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <label className="flex flex-col gap-1">
      {label && <span className="text-[11px] font-medium tracking-wide" style={{ color: 'var(--color-obs-text-muted)' }}>{label}</span>}
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={3}
        className="px-3 py-2 rounded-[var(--radius-obs-md)] text-[13px] outline-none resize-y min-h-[80px]"
        style={{
          backgroundColor: 'var(--color-obs-surface-highest)',
          color: 'var(--color-obs-text)',
          border: '1px solid var(--color-obs-border)',
        }}
      />
    </label>
  )
}

function ItemRow({ value, onChange, onRemove, placeholder }: { value: string; onChange: (v: string) => void; onRemove: () => void; placeholder?: string }) {
  return (
    <div className="flex items-center gap-2">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="flex-1 px-3 py-2 rounded-[var(--radius-obs-md)] text-[13px] outline-none"
        style={{
          backgroundColor: 'var(--color-obs-surface-highest)',
          color: 'var(--color-obs-text)',
          border: '1px solid var(--color-obs-border)',
        }}
      />
      <button
        type="button"
        onClick={onRemove}
        className="w-8 h-8 inline-flex items-center justify-center rounded transition-colors"
        style={{ color: 'var(--color-obs-text-subtle)' }}
        title="削除"
      >
        <X size={13} />
      </button>
    </div>
  )
}
