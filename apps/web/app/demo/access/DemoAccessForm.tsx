'use client'

import { useState, type FormEvent } from 'react'
import { Loader2, Sparkles } from 'lucide-react'

export function DemoAccessForm({
  tenantSlug,
  companyName,
}: {
  tenantSlug: string
  companyName: string
}) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (submitting) return
    setError(null)
    if (!name.trim() || !email.trim()) {
      setError('氏名とメールアドレスを入力してください。')
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch('/api/demo-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenant: tenantSlug,
          company: companyName,
          name,
          email,
        }),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok || !json.url) {
        throw new Error(json.error || 'デモURLの発行に失敗しました。')
      }
      window.location.href = json.url
    } catch (err) {
      setError(err instanceof Error ? err.message : 'デモURLの発行に失敗しました。')
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-7 space-y-4">
      <DemoField label="会社名" value={companyName} readOnly />
      <DemoField label="氏名" value={name} onChange={setName} placeholder="山田 太郎" required />
      <DemoField
        label="メールアドレス"
        type="email"
        value={email}
        onChange={setEmail}
        placeholder="taro@example.co.jp"
        required
      />

      {error && (
        <div
          className="text-[12px] px-3 py-2 rounded-[8px]"
          style={{
            color: '#ff8d8d',
            background: 'rgba(255,107,107,0.08)',
            boxShadow: 'inset 0 0 0 1px rgba(255,107,107,0.24)',
          }}
        >
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={submitting || !name.trim() || !email.trim()}
        className="w-full inline-flex items-center justify-center gap-2 h-11 rounded-[10px] text-[13px] font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        style={{
          background:
            'linear-gradient(140deg, var(--color-obs-primary) 0%, var(--color-obs-primary-container) 100%)',
          color: 'var(--color-obs-on-primary)',
          boxShadow:
            'inset 0 1px 0 rgba(255,255,255,0.18), 0 0 0 1px rgba(171,199,255,0.20), 0 8px 24px rgba(0,113,227,0.18)',
        }}
      >
        {submitting ? (
          <>
            <Loader2 size={14} strokeWidth={2.4} className="animate-spin" />
            発行中...
          </>
        ) : (
          <>
            <Sparkles size={14} strokeWidth={2.4} />
            無料デモを開く
          </>
        )}
      </button>
    </form>
  )
}

function DemoField({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  required,
  readOnly,
}: {
  label: string
  value: string
  onChange?: (value: string) => void
  placeholder?: string
  type?: 'text' | 'email'
  required?: boolean
  readOnly?: boolean
}) {
  return (
    <label className="block">
      <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#9b99a0]">
        {label}
        {required && (
          <span className="ml-1" style={{ color: '#ff8d8d' }}>
            *
          </span>
        )}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        required={required}
        readOnly={readOnly}
        autoComplete={type === 'email' ? 'email' : undefined}
        className="mt-1 w-full h-10 px-3 rounded-[8px] text-[13px] outline-none transition-colors"
        style={{
          background: readOnly ? 'rgba(255,255,255,0.025)' : 'rgba(255,255,255,0.04)',
          color: readOnly ? '#9b99a0' : '#e7e5ea',
          boxShadow: 'inset 0 0 0 1px rgba(171,199,255,0.18)',
        }}
      />
    </label>
  )
}
