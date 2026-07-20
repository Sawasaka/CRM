'use client'

import { useEffect, useState, type FormEvent, type ReactNode } from 'react'
import { CalendarCheck, Check, Loader2, PhoneCall, X } from 'lucide-react'
import { CONSULTATION_BOOKING_URL } from '@/lib/consultation-calendar'

export { CONSULTATION_BOOKING_URL }

type ConsultationPayload = {
  company: string
  name: string
  email: string
  phone: string
  message: string
  consentToAiCall: boolean
  source: string
}

const INITIAL: ConsultationPayload = {
  company: '',
  name: '',
  email: '',
  phone: '',
  message: '',
  consentToAiCall: false,
  source: 'landing_cta',
}

type TriggerProps = {
  onClick: () => void
  disabled?: boolean
}

export function ConsultationCallButton({
  children,
  className,
  style,
  ariaLabel,
}: {
  children: ReactNode
  className?: string
  style?: React.CSSProperties
  source?: string
  message?: string
  ariaLabel?: string
}) {
  return (
    <a
      href={CONSULTATION_BOOKING_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={ariaLabel}
      className={className}
      style={style}
    >
      {children}
    </a>
  )
}

export function ConsultationCallTrigger({
  children,
  source = 'landing_cta',
  defaultMessage = '',
}: {
  children: (props: TriggerProps) => ReactNode
  source?: string
  defaultMessage?: string
}) {
  const [open, setOpen] = useState(false)

  return (
    <>
      {children({ onClick: () => setOpen(true), disabled: open })}
      {open && (
        <ConsultationCallModal
          source={source}
          defaultMessage={defaultMessage}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  )
}

export function ConsultationCallModal({
  onClose,
  source,
  defaultMessage = '',
}: {
  onClose: () => void
  source: string
  defaultMessage?: string
}) {
  const [values, setValues] = useState<ConsultationPayload>({
    ...INITIAL,
    source,
    message: defaultMessage,
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [onClose])

  const update =
    (key: keyof ConsultationPayload) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const value =
        e.currentTarget.type === 'checkbox'
          ? (e.currentTarget as HTMLInputElement).checked
          : e.currentTarget.value
      setValues((v) => ({ ...v, [key]: value }))
    }

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (submitting) return
    setError(null)

    if (!values.name.trim() || !values.email.trim() || !values.phone.trim()) {
      setError('氏名・メールアドレス・電話番号を入力してください。')
      return
    }
    if (!values.consentToAiCall) {
      setError('送信後すぐにAIから電話がかかることへの同意が必要です。')
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company: values.company.trim() || '個人・会社名未入力',
          name: values.name,
          email: values.email,
          phone: values.phone,
          message: values.message,
          consentToAiCall: values.consentToAiCall,
          source: values.source,
          redirectTo: CONSULTATION_BOOKING_URL,
        }),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json.error || `送信に失敗しました (HTTP ${res.status})`)
      window.location.href =
        typeof json.redirectTo === 'string' && json.redirectTo
          ? json.redirectTo
          : CONSULTATION_BOOKING_URL
    } catch (err) {
      setError(err instanceof Error ? err.message : '送信に失敗しました。')
      setSubmitting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center px-4 py-8"
      role="dialog"
      aria-modal="true"
      aria-labelledby="consultation-call-title"
    >
      <button
        type="button"
        aria-label="閉じる"
        onClick={onClose}
        className="absolute inset-0 cursor-default"
        style={{
          background: 'rgba(10,10,12,0.76)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
        }}
      />

      <form
        onSubmit={onSubmit}
        className="relative w-full max-w-[520px] rounded-2xl p-6 sm:p-7"
        style={{
          background: 'linear-gradient(180deg, rgba(28,28,32,0.98) 0%, rgba(18,19,23,0.98) 100%)',
          boxShadow: 'inset 0 0 0 1px rgba(171,199,255,0.18), 0 30px 70px -18px rgba(0,0,0,0.68)',
        }}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="閉じる"
          className="absolute right-4 top-4 inline-flex h-8 w-8 items-center justify-center rounded-full text-[#9b99a0] transition-colors hover:text-[#e7e5ea]"
          style={{ background: 'rgba(255,255,255,0.04)' }}
        >
          <X size={15} strokeWidth={2.2} />
        </button>

        <div className="flex items-start gap-3 pr-10">
          <div
            className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
            style={{
              background: 'linear-gradient(135deg, rgba(171,199,255,0.20), rgba(0,113,227,0.10))',
              boxShadow: 'inset 0 0 0 1px rgba(171,199,255,0.22)',
            }}
          >
            <PhoneCall size={20} strokeWidth={2.2} color="#abc7ff" />
          </div>
          <div>
            <h2
              id="consultation-call-title"
              className="font-display text-[1.35rem] font-bold leading-tight text-[#e7e5ea]"
            >
              相談内容を送信して、すぐに電話で調整
            </h2>
            <p className="mt-2 text-[12.5px] leading-relaxed text-[#9b99a0]">
              送信後すぐにAIからお電話します。同時に日程調整画面へ移動するため、電話がつながらない場合もそのまま予約できます。
            </p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field
            label="氏名"
            required
            value={values.name}
            onChange={update('name')}
            placeholder="田中 太郎"
          />
          <Field
            label="メールアドレス"
            required
            type="email"
            value={values.email}
            onChange={update('email')}
            placeholder="taro@example.co.jp"
          />
          <Field
            label="電話番号"
            required
            type="tel"
            value={values.phone}
            onChange={update('phone')}
            placeholder="09012345678"
          />
          <Field
            label="会社名"
            value={values.company}
            onChange={update('company')}
            placeholder="株式会社サンプル"
          />
        </div>

        <label className="mt-3 block">
          <span className={FIELD_LABEL_CLASS}>相談したい内容</span>
          <textarea
            value={values.message}
            onChange={update('message')}
            rows={3}
            placeholder="営業戦略、CRM構築、問い合わせ対応など、相談したいテーマを簡単に入力してください。"
            className="mt-1.5 w-full resize-y rounded-[10px] px-3 py-2.5 text-[13px] leading-relaxed outline-none"
            style={FIELD_INPUT_STYLE}
          />
        </label>

        <label
          className="mt-4 flex items-start gap-2.5 rounded-[10px] p-3 text-[11.5px] leading-relaxed text-[#c7c5c9]"
          style={{
            background: 'rgba(171,199,255,0.055)',
            boxShadow: 'inset 0 0 0 1px rgba(171,199,255,0.14)',
          }}
        >
          <input
            type="checkbox"
            checked={values.consentToAiCall}
            onChange={update('consentToAiCall')}
            className="mt-0.5 h-4 w-4 shrink-0 accent-[#abc7ff]"
          />
          <span>
            送信後すぐにAIから電話がかかること、および日程調整と事前ヒアリングのために入力情報を利用することに同意します。
          </span>
        </label>

        {error && (
          <div
            className="mt-3 rounded-[8px] px-3 py-2 text-[12px]"
            style={{
              color: '#ff8d8d',
              background: 'rgba(255,107,107,0.08)',
              boxShadow: 'inset 0 0 0 1px rgba(255,107,107,0.24)',
            }}
          >
            {error}
          </div>
        )}

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="inline-flex items-center gap-2 text-[11.5px] text-[#9b99a0]">
            <CalendarCheck size={14} strokeWidth={2.1} color="#abc7ff" />
            電話がつながればAIが空き枠確認まで進めます
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-[12px] px-5 text-[13px] font-semibold transition-all disabled:opacity-60"
            style={{
              background:
                'linear-gradient(140deg, var(--color-obs-primary) 0%, var(--color-obs-primary-container) 100%)',
              color: 'var(--color-obs-on-primary)',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.18), 0 0 0 1px rgba(171,199,255,0.20)',
            }}
          >
            {submitting ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                発信準備中...
              </>
            ) : (
              <>
                <Check size={14} />
                送信して電話を受ける
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

const FIELD_LABEL_CLASS = 'text-[10.5px] font-semibold uppercase tracking-[0.08em] text-[#9b99a0]'
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
  type?: 'text' | 'email' | 'tel'
}) {
  return (
    <label className="block">
      <span className={FIELD_LABEL_CLASS}>
        {label}
        {required && <span className="ml-1 text-[#ff8d8d]">*</span>}
      </span>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="mt-1.5 h-10 w-full rounded-[10px] px-3 text-[13px] outline-none transition-colors"
        style={FIELD_INPUT_STYLE}
      />
    </label>
  )
}
