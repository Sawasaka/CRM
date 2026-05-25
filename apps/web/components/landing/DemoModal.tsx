'use client'

/**
 * 無料デモアクセスのモーダル。
 * 会社名・氏名・メールアドレスを入力して /api/demo-access を叩き、
 * 返却された /demo?t=... を新しいタブで開く。
 */

import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Loader2, Sparkles, X } from 'lucide-react'

interface DemoModalProps {
  open: boolean
  onClose: () => void
}

interface Fields {
  company: string
  name: string
  email: string
}

const INITIAL: Fields = { company: '', name: '', email: '' }

export const DemoModal = ({ open, onClose }: DemoModalProps) => {
  const [values, setValues] = useState<Fields>(INITIAL)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const dialogRef = useRef<HTMLDivElement | null>(null)

  // ESC キーで閉じる
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  // 開いた瞬間は state をリセット
  useEffect(() => {
    if (open) {
      setValues(INITIAL)
      setError(null)
      setSubmitting(false)
    }
  }, [open])

  if (!open) return null

  const update =
    (key: keyof Fields) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setValues((v) => ({ ...v, [key]: e.target.value }))
    }

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (submitting) return
    setError(null)
    if (!values.company.trim() || !values.name.trim() || !values.email.trim()) {
      setError('全ての項目を入力してください。')
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch('/api/demo-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok || !json.url) {
        throw new Error(json.error || `発行に失敗しました (HTTP ${res.status})`)
      }
      // 別タブで開いてユーザー側はモーダルを閉じる
      window.open(json.url, '_blank', 'noopener,noreferrer')
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : '発行に失敗しました。')
      setSubmitting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      onClick={() => !submitting && onClose()}
    >
      <div
        className="absolute inset-0"
        style={{
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
        }}
      />
      <div
        ref={dialogRef}
        className="relative w-full max-w-[400px] rounded-2xl p-6"
        style={{
          background: '#15151a',
          boxShadow:
            '0 24px 64px rgba(0,0,0,0.6), inset 0 0 0 1px rgba(171,199,255,0.18)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 閉じる */}
        <button
          type="button"
          onClick={onClose}
          aria-label="閉じる"
          className="absolute top-3 right-3 w-7 h-7 inline-flex items-center justify-center rounded-full text-[#9b99a0] hover:text-[#e7e5ea] hover:bg-white/5 transition-colors"
        >
          <X size={14} strokeWidth={2.2} />
        </button>

        {/* ヘッダー */}
        <div className="font-display font-semibold text-[11px] fo-gradient-text" style={{ letterSpacing: '0.04em' }}>
          ルキスマCRM
        </div>
        <h2 className="mt-1 font-display font-bold text-[1.25rem] tracking-[-0.015em] fo-gradient-text">
          無料デモにアクセス
        </h2>
        <p className="mt-1 text-[11.5px] text-[#9b99a0] leading-relaxed">
          <span className="text-aurora">30分有効</span> のデモURLを発行します。
        </p>

        {/* ダミーデータ注釈 */}
        <p className="mt-1.5 text-[10.5px] text-[#7e7c83]">
          ※ デモ内のデータはすべてダミーです。
        </p>

        <form onSubmit={onSubmit} className="mt-4 space-y-2.5">
          <DemoField
            label="会社名"
            required
            value={values.company}
            onChange={update('company')}
            placeholder="株式会社サンプル"
          />
          <DemoField
            label="氏名"
            required
            value={values.name}
            onChange={update('name')}
            placeholder="田中 太郎"
          />
          <DemoField
            label="メールアドレス"
            required
            type="email"
            value={values.email}
            onChange={update('email')}
            placeholder="taro@example.co.jp"
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
            disabled={
              submitting ||
              !values.company.trim() ||
              !values.name.trim() ||
              !values.email.trim()
            }
            className="w-full inline-flex items-center justify-center gap-2 h-10 mt-5 rounded-[10px] text-[13px] font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed"
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
                発行中…
              </>
            ) : (
              <>
                <Sparkles size={14} strokeWidth={2.4} />
                デモを開く
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}

function DemoField({
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
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        autoComplete={type === 'email' ? 'email' : undefined}
        className="mt-1 w-full h-9 px-3 rounded-[8px] text-[13px] outline-none transition-colors"
        style={{
          background: 'rgba(255,255,255,0.04)',
          color: '#e7e5ea',
          boxShadow: 'inset 0 0 0 1px rgba(171,199,255,0.18)',
        }}
      />
    </label>
  )
}
