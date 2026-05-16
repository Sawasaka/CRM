'use client'

import { useEffect, useState } from 'react'
import { X, Briefcase } from 'lucide-react'
import { ObsButton, ObsCard, ObsInput } from '@/components/obsidian'

type DealOption = {
  id: string
  name: string
  company: { id: string; name: string } | null
}

type Props = {
  onClose: () => void
  onCreated: (ticketId: string) => void
  presetDealId?: string
  presetDealLabel?: string
}

export function CreateTicketModal({
  onClose,
  onCreated,
  presetDealId,
  presetDealLabel,
}: Props) {
  const [subject, setSubject] = useState('')
  const [description, setDescription] = useState('')
  const [dealId, setDealId] = useState<string | undefined>(presetDealId)
  const [dealLabel, setDealLabel] = useState(presetDealLabel ?? '')
  const [dealQuery, setDealQuery] = useState('')
  const [dealOptions, setDealOptions] = useState<DealOption[]>([])
  const [searching, setSearching] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 取引検索 (presetがない場合のみ)
  useEffect(() => {
    if (presetDealId) return
    if (!dealQuery.trim() && !dealId) {
      // 初回オープン時は最近の取引を表示
    }
    const ctrl = new AbortController()
    setSearching(true)
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/deals?q=${encodeURIComponent(dealQuery)}&take=15`,
          { signal: ctrl.signal },
        )
        if (res.ok) {
          const json = (await res.json()) as { deals: DealOption[] }
          setDealOptions(json.deals)
        }
      } catch {
        // ignore
      } finally {
        setSearching(false)
      }
    }, 200)
    return () => {
      clearTimeout(timer)
      ctrl.abort()
    }
  }, [dealQuery, presetDealId, dealId])

  async function submit() {
    setError(null)
    if (!subject.trim()) {
      setError('件名を入力してください')
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: subject.trim(),
          description: description.trim() || undefined,
          dealId,
        }),
      })
      if (!res.ok) {
        const j = (await res.json().catch(() => null)) as { error?: string } | null
        throw new Error(j?.error ?? '作成に失敗しました')
      }
      const json = (await res.json()) as { ticket: { id: string } }
      onCreated(json.ticket.id)
    } catch (e) {
      setError(e instanceof Error ? e.message : '作成に失敗しました')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
      onClick={onClose}
    >
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-lg">
        <ObsCard depth="high" padding="lg" radius="xl">
          <div className="flex items-start justify-between mb-5">
            <div>
              <h2
                className="text-[16px] font-semibold tracking-[-0.01em]"
                style={{ color: 'var(--color-obs-text)' }}
              >
                新規チケット
              </h2>
              <p
                className="text-[12px] mt-1"
                style={{ color: 'var(--color-obs-text-muted)' }}
              >
                取引(Deal)に紐づける形でチケットを登録します。
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded flex items-center justify-center transition-colors"
              style={{ color: 'var(--color-obs-text-muted)' }}
              onMouseOver={(e) =>
                ((e.currentTarget as HTMLButtonElement).style.backgroundColor =
                  'var(--color-obs-surface-high)')
              }
              onMouseOut={(e) =>
                ((e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent')
              }
            >
              <X size={15} />
            </button>
          </div>

          <div className="space-y-4">
            <Field label="件名" required>
              <ObsInput
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="例: ログインできない / 請求書再発行依頼"
                autoFocus
              />
            </Field>

            <Field label="紐付ける取引" required>
              {presetDealId ? (
                <div
                  className="px-3 py-2 rounded-[var(--radius-obs-md)] text-[13px] inline-flex items-center gap-2"
                  style={{
                    backgroundColor: 'var(--color-obs-surface-high)',
                    color: 'var(--color-obs-text)',
                  }}
                >
                  <Briefcase size={12} style={{ color: 'var(--color-obs-primary)' }} />
                  {presetDealLabel}
                </div>
              ) : dealId ? (
                <div className="flex items-center gap-2">
                  <div
                    className="flex-1 px-3 py-2 rounded-[var(--radius-obs-md)] text-[13px] inline-flex items-center gap-2"
                    style={{
                      backgroundColor: 'var(--color-obs-surface-high)',
                      color: 'var(--color-obs-text)',
                    }}
                  >
                    <Briefcase size={12} style={{ color: 'var(--color-obs-primary)' }} />
                    {dealLabel}
                  </div>
                  <button
                    onClick={() => {
                      setDealId(undefined)
                      setDealLabel('')
                      setDealQuery('')
                    }}
                    className="text-[11.5px] px-2 py-1 rounded transition-colors"
                    style={{ color: 'var(--color-obs-text-muted)' }}
                  >
                    変更
                  </button>
                </div>
              ) : (
                <div className="relative">
                  <ObsInput
                    value={dealQuery}
                    onChange={(e) => setDealQuery(e.target.value)}
                    placeholder="取引名で検索..."
                  />
                  {dealOptions.length > 0 && (
                    <div
                      className="absolute left-0 right-0 top-full mt-1 rounded-[var(--radius-obs-md)] py-1 z-10 max-h-60 overflow-y-auto"
                      style={{
                        backgroundColor: 'var(--color-obs-surface-highest)',
                        boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                      }}
                    >
                      {dealOptions.map((d) => (
                        <button
                          key={d.id}
                          onClick={() => {
                            setDealId(d.id)
                            setDealLabel(`${d.name}${d.company ? ` — ${d.company.name}` : ''}`)
                            setDealOptions([])
                            setDealQuery('')
                          }}
                          className="w-full text-left px-3 py-2 text-[12.5px] transition-colors"
                          style={{ color: 'var(--color-obs-text)' }}
                          onMouseOver={(e) =>
                            ((e.currentTarget as HTMLButtonElement).style.backgroundColor =
                              'var(--color-obs-surface-high)')
                          }
                          onMouseOut={(e) =>
                            ((e.currentTarget as HTMLButtonElement).style.backgroundColor =
                              'transparent')
                          }
                        >
                          <div className="font-medium">{d.name}</div>
                          {d.company && (
                            <div
                              className="text-[11px] mt-0.5"
                              style={{ color: 'var(--color-obs-text-subtle)' }}
                            >
                              {d.company.name}
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                  {searching && (
                    <p
                      className="text-[11px] mt-1"
                      style={{ color: 'var(--color-obs-text-subtle)' }}
                    >
                      検索中...
                    </p>
                  )}
                </div>
              )}
            </Field>

            <Field label="チケット内容">
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="どんなチケットか、状況を簡単に記載..."
                rows={4}
                className="w-full px-3 py-2 rounded-[var(--radius-obs-md)] text-[13px] resize-none outline-none"
                style={{
                  backgroundColor: 'var(--color-obs-surface-high)',
                  color: 'var(--color-obs-text)',
                  boxShadow: 'inset 0 0 0 1px var(--color-obs-surface-highest)',
                }}
              />
            </Field>

            {error && (
              <p className="text-[12px]" style={{ color: 'var(--color-obs-hot, #ef5a5a)' }}>
                {error}
              </p>
            )}
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <ObsButton variant="ghost" onClick={onClose} disabled={submitting}>
              キャンセル
            </ObsButton>
            <ObsButton onClick={submit} disabled={submitting}>
              {submitting ? '作成中...' : '作成'}
            </ObsButton>
          </div>
        </ObsCard>
      </div>
    </div>
  )
}

function Field({
  label,
  required,
  children,
}: {
  label: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <div>
      <label
        className="block text-[11.5px] font-medium mb-1.5 tracking-wide"
        style={{ color: 'var(--color-obs-text-muted)' }}
      >
        {label}
        {required && <span style={{ color: 'var(--color-obs-hot, #ef5a5a)' }}> *</span>}
      </label>
      {children}
    </div>
  )
}
