'use client'

/**
 * Footer 内に表示するお問い合わせフォーム。
 * /api/contact に POST し、成功時は /lp/thanks に遷移する。
 */

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { Send, Loader2 } from 'lucide-react'

interface FieldState {
  company: string
  name: string
  email: string
  message: string
}

const INITIAL: FieldState = {
  company: '',
  name: '',
  email: '',
  message: '',
}

export const ContactForm = () => {
  const router = useRouter()
  const [values, setValues] = useState<FieldState>(INITIAL)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const update =
    (key: keyof FieldState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setValues((v) => ({ ...v, [key]: e.target.value }))
    }

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (submitting) return
    setError(null)
    if (!values.company.trim() || !values.name.trim() || !values.email.trim()) {
      setError('会社名・氏名・メールアドレスは必須です。')
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        throw new Error(j.error || `送信に失敗しました (HTTP ${res.status})`)
      }
      router.push('/lp/thanks')
    } catch (err) {
      setError(err instanceof Error ? err.message : '送信に失敗しました。')
      setSubmitting(false)
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-2xl p-5 md:p-6 space-y-3.5"
      style={{
        background: 'rgba(171,199,255,0.04)',
        boxShadow: 'inset 0 0 0 1px rgba(171,199,255,0.14)',
      }}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3.5">
        <Field
          label="会社名"
          required
          value={values.company}
          onChange={update('company')}
          placeholder="株式会社サンプル"
        />
        <Field
          label="氏名"
          required
          value={values.name}
          onChange={update('name')}
          placeholder="田中 太郎"
        />
        <div className="md:col-span-2">
          <Field
            label="メールアドレス"
            required
            type="email"
            value={values.email}
            onChange={update('email')}
            placeholder="taro@example.co.jp"
          />
        </div>
      </div>

      <FieldArea
        label="お伝え事項"
        value={values.message}
        onChange={update('message')}
        placeholder="導入の背景、現状のツール、相談したいテーマなどご自由にどうぞ。"
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

      <div
        className="flex items-center justify-between gap-4 pt-4"
        style={{ borderTop: '1px solid rgba(171,199,255,0.08)' }}
      >
        <p className="text-[10.5px] text-[#7e7c83] leading-relaxed">
          1営業日以内に代表 沢坂 弘樹 より直接ご返信いたします。
        </p>
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center gap-2 h-10 px-5 rounded-[10px] text-[13px] font-semibold transition-all disabled:opacity-60 shrink-0"
          style={{
            background:
              'linear-gradient(140deg, var(--color-obs-primary) 0%, var(--color-obs-primary-container) 100%)',
            color: 'var(--color-obs-on-primary)',
            boxShadow:
              'inset 0 1px 0 rgba(255,255,255,0.18), 0 0 0 1px rgba(171,199,255,0.20)',
          }}
        >
          {submitting ? (
            <>
              <Loader2 size={14} strokeWidth={2.4} className="animate-spin" />
              送信中…
            </>
          ) : (
            <>
              <Send size={14} strokeWidth={2.4} />
              送信する
            </>
          )}
        </button>
      </div>
    </form>
  )
}

const FIELD_LABEL_CLASS = 'text-[10.5px] font-semibold uppercase tracking-[0.08em] text-[#9b99a0]'
const FIELD_INPUT_CLASS =
  'mt-1.5 w-full h-10 px-3 rounded-[10px] text-[13px] outline-none transition-colors'
const FIELD_INPUT_STYLE: React.CSSProperties = {
  background: 'rgba(255,255,255,0.04)',
  color: '#e7e5ea',
  boxShadow: 'inset 0 0 0 1px rgba(171,199,255,0.18)',
}

function Field({
  label,
  required,
  value,
  onChange,
  placeholder,
  type = 'text',
}: {
  label: string
  required?: boolean
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  placeholder?: string
  type?: 'text' | 'email'
}) {
  return (
    <label className="block">
      <span className={FIELD_LABEL_CLASS}>
        {label}
        {required && <span className="text-coral ml-1" style={{ color: '#ff8d8d' }}>*</span>}
      </span>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className={FIELD_INPUT_CLASS}
        style={FIELD_INPUT_STYLE}
      />
    </label>
  )
}

function FieldArea({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  placeholder?: string
}) {
  return (
    <label className="block">
      <span className={FIELD_LABEL_CLASS}>{label}</span>
      <textarea
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={3}
        className="mt-1.5 w-full px-3 py-2.5 rounded-[10px] text-[13px] outline-none resize-y leading-relaxed transition-colors"
        style={FIELD_INPUT_STYLE}
      />
    </label>
  )
}
