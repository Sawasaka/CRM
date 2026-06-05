'use client'

/**
 * Footer 内に表示するお問い合わせフォーム。
 * /api/contact に POST し、成功時はページ遷移せず中央モーダルで日程調整CTAを表示する。
 */

import { useEffect, useState, type FormEvent } from 'react'
import { Send, Loader2, CalendarCheck, Check, X, ArrowRight } from 'lucide-react'

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

const SPIR_BOOKING_URL =
  'https://app.spirinc.com/t/3u_FXTG5abaFIZ-D7as8v/as/u1BDbJ3xnywQYp2rDZYxE/confirm'

export const ContactForm = () => {
  const [values, setValues] = useState<FieldState>(INITIAL)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const update =
    (key: keyof FieldState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setValues((v) => ({ ...v, [key]: e.target.value }))
    }

  // ESC でモーダルを閉じる + body スクロール停止
  useEffect(() => {
    if (!success) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSuccess(false)
    }
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [success])

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
      setValues(INITIAL)
      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : '送信に失敗しました。')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
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
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 pt-4"
        style={{ borderTop: '1px solid rgba(171,199,255,0.08)' }}
      >
        <p className="text-[10.5px] text-[#7e7c83] leading-relaxed">
          1営業日以内に代表 沢坂弘樹 より直接ご返信いたします。
        </p>
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center justify-center gap-2 h-10 px-5 rounded-[10px] text-[13px] font-semibold transition-all disabled:opacity-60 shrink-0 w-full sm:w-auto"
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

    {success && <SuccessModal onClose={() => setSuccess(false)} />}
    </>
  )
}

function SuccessModal({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center px-4 py-8"
      role="dialog"
      aria-modal="true"
      aria-labelledby="contact-success-title"
    >
      {/* バックドロップ */}
      <button
        type="button"
        aria-label="閉じる"
        onClick={onClose}
        className="absolute inset-0 cursor-default"
        style={{
          background: 'rgba(10,10,12,0.72)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
        }}
      />

      {/* カード */}
      <div
        className="relative w-full max-w-[460px] rounded-3xl px-7 py-9 text-center animate-[fadeInUp_0.25s_ease-out]"
        style={{
          background:
            'linear-gradient(180deg, rgba(28,28,32,0.96) 0%, rgba(20,20,23,0.96) 100%)',
          boxShadow:
            'inset 0 0 0 1px rgba(171,199,255,0.18), 0 30px 60px -20px rgba(0,0,0,0.6), 0 0 80px rgba(171,199,255,0.08)',
        }}
      >
        {/* 閉じる */}
        <button
          type="button"
          onClick={onClose}
          aria-label="閉じる"
          className="absolute top-3.5 right-3.5 w-8 h-8 inline-flex items-center justify-center rounded-full text-[#9b99a0] hover:text-[#e7e5ea] transition-colors"
          style={{ background: 'rgba(255,255,255,0.04)' }}
        >
          <X size={15} strokeWidth={2.2} />
        </button>

        {/* チェック */}
        <div
          className="mx-auto w-14 h-14 rounded-full flex items-center justify-center"
          style={{
            background:
              'linear-gradient(135deg, rgba(171,199,255,0.22) 0%, rgba(0,113,227,0.12) 100%)',
            boxShadow: '0 0 0 1px rgba(171,199,255,0.32), 0 0 28px rgba(171,199,255,0.20)',
          }}
        >
          <Check size={24} strokeWidth={2.4} color="#abc7ff" />
        </div>

        <h3
          id="contact-success-title"
          className="mt-5 font-display font-bold text-[1.35rem] leading-tight fo-gradient-text"
        >
          お問い合わせを受け付けました。
        </h3>
        <p className="mt-3 text-[12.5px] text-[#9b99a0] leading-relaxed">
          1 営業日以内に代表 沢坂弘樹よりご返信いたします。
          <br />
          直接お話を伺いたい方は、下記から日程調整も可能です。
        </p>

        {/* 日程調整 CTA */}
        <a
          href={SPIR_BOOKING_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="group mt-7 inline-flex items-center gap-2 px-5 h-11 rounded-[12px] text-[13px] font-semibold transition-transform hover:-translate-y-0.5"
          style={{
            background:
              'linear-gradient(140deg, var(--color-obs-primary) 0%, var(--color-obs-primary-container) 100%)',
            color: 'var(--color-obs-on-primary)',
            boxShadow:
              'inset 0 1px 0 rgba(255,255,255,0.18), 0 0 0 1px rgba(171,199,255,0.20), 0 8px 24px rgba(0,113,227,0.18)',
          }}
        >
          <CalendarCheck size={15} strokeWidth={2.2} />
          そのまま 30 分相談を予約
          <ArrowRight size={13} strokeWidth={2.4} className="transition-transform group-hover:translate-x-0.5" />
        </a>

        <button
          type="button"
          onClick={onClose}
          className="block mx-auto mt-4 text-[11.5px] text-[#7e7c83] hover:text-[#c7c5c9] transition-colors"
        >
          閉じる
        </button>
      </div>

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
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
