'use client'

import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react'
import Image from 'next/image'
import { ArrowRight, Download, Loader2, X } from 'lucide-react'

type FormValues = {
  company: string
  name: string
  email: string
  website: string
}

export type CorporateDocumentType = 'gtm' | 'marketing'

const DOCUMENTS: Record<CorporateDocumentType, {
  title: string
  fallbackUrl: string
  filename: string
}> = {
  gtm: {
    title: 'Sales-led GTM × Wedgeモデル',
    fallbackUrl: '/downloads/sales-led-gtm-wedge-model.pdf',
    filename: 'Sales-led_GTM×Wedgeモデル.pdf',
  },
  marketing: {
    title: 'ベイズ × バンディット戦略',
    fallbackUrl: '/downloads/bayesian-bandit-strategy-framework.pdf',
    filename: 'ベイズ×バンディット戦略.pdf',
  },
}

const INITIAL_VALUES: FormValues = {
  company: '',
  name: '',
  email: '',
  website: '',
}

export function DocumentRequestButton({
  documentType,
  variant = 'light',
}: {
  documentType: CorporateDocumentType
  variant?: 'light' | 'navy'
}) {
  const [open, setOpen] = useState(false)
  const requestHash = `#${documentType}-document-request`
  const downloadHash = `#${documentType}-download`

  useEffect(() => {
    const openFromHash = () => {
      setOpen(window.location.hash === requestHash || window.location.hash === downloadHash)
    }

    openFromHash()
    window.addEventListener('hashchange', openFromHash)
    return () => window.removeEventListener('hashchange', openFromHash)
  }, [downloadHash, requestHash])

  const close = () => {
    setOpen(false)
    if (window.location.hash === requestHash || window.location.hash === downloadHash) {
      window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}`)
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`group/document grid min-h-11 w-full shrink-0 grid-cols-[18px_minmax(0,1fr)_15px] items-center gap-2 whitespace-nowrap border px-3 text-xs font-bold transition focus-visible:outline-2 focus-visible:outline-offset-4 ${
          variant === 'navy'
            ? 'border-white/45 bg-white text-[#123b59] shadow-[0_12px_28px_rgba(3,20,32,0.18)] hover:border-white hover:bg-[#f0f8fc] focus-visible:outline-white'
            : 'border-[#8abbd6] bg-white text-[#0b6fb7] hover:border-[#0b6fb7] hover:bg-[#f0f8fc] focus-visible:outline-[#0b6fb7]'
        }`}
        aria-haspopup="dialog"
      >
        <Image
          src="/brand/rookie-smart-japan/rsj-corporate-cat-favicon-512.png"
          alt=""
          aria-hidden="true"
          width={18}
          height={18}
          className="h-[18px] w-[18px] object-contain"
        />
        <span className="text-center">内容を確認する</span>
        <ArrowRight size={15} className="justify-self-end transition-transform group-hover/document:translate-x-1" />
      </button>
      {open ? <DocumentRequestModal documentType={documentType} onClose={close} /> : null}
    </>
  )
}

function DocumentRequestModal({
  documentType,
  onClose,
}: {
  documentType: CorporateDocumentType
  onClose: () => void
}) {
  const [values, setValues] = useState<FormValues>(INITIAL_VALUES)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const documentConfig = DOCUMENTS[documentType]

  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !submitting) onClose()
    }
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [onClose, submitting])

  const update =
    (key: keyof FormValues) =>
    (event: ChangeEvent<HTMLInputElement>) => {
      setValues((current) => ({ ...current, [key]: event.target.value }))
    }

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (submitting) return
    setError(null)

    if (!values.company.trim() || !values.name.trim() || !values.email.trim()) {
      setError('会社名・氏名・メールアドレスを入力してください。')
      return
    }

    setSubmitting(true)
    try {
      const response = await fetch('/api/corporate/document-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...values, documentType }),
      })
      const result = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(result.error || '資料ダウンロードの受付に失敗しました。')
      }

      const downloadUrl =
        typeof result.downloadUrl === 'string'
          ? result.downloadUrl
          : documentConfig.fallbackUrl
      const fileResponse = await fetch(downloadUrl)
      if (!fileResponse.ok) throw new Error('資料のダウンロードに失敗しました。')
      const fileBlob = await fileResponse.blob()
      const objectUrl = URL.createObjectURL(fileBlob)
      const downloadLink = document.createElement('a')
      downloadLink.href = objectUrl
      downloadLink.download = documentConfig.filename
      document.body.appendChild(downloadLink)
      downloadLink.click()
      downloadLink.remove()
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 2_000)

      const redirectTo =
        typeof result.redirectTo === 'string'
          ? result.redirectTo
          : 'https://calendar.app.google/gPiaQRbjMoBtnnKu8'
      window.setTimeout(() => window.location.assign(redirectTo), 700)
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : '資料ダウンロードの受付に失敗しました。')
      setSubmitting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center px-4 py-7"
      role="dialog"
      aria-modal="true"
      aria-labelledby="document-request-title"
    >
      <button
        type="button"
        aria-label="資料ダウンロードフォームを閉じる"
        onClick={submitting ? undefined : onClose}
        className="absolute inset-0 cursor-default bg-[#071f30]/75 backdrop-blur-sm"
      />

      <form
        onSubmit={onSubmit}
        className="relative max-h-full w-full max-w-[600px] overflow-y-auto border border-[#b9d9e9] bg-white px-6 py-7 shadow-[0_28px_80px_rgba(7,31,48,0.28)] sm:px-8 sm:py-8"
      >
        <button
          type="button"
          onClick={onClose}
          disabled={submitting}
          aria-label="閉じる"
          className="absolute right-4 top-4 grid h-9 w-9 place-items-center border border-[#c9dde8] text-[#587383] transition hover:border-[#0b6fb7] hover:text-[#0b6fb7] disabled:opacity-40"
        >
          <X size={17} />
        </button>

        <p className="text-[9px] font-bold tracking-[0.2em] text-[#0b6fb7]">FREE DOWNLOAD</p>
        <h2
          id="document-request-title"
          className="mt-3 [font-family:'Yu_Mincho','Hiragino_Mincho_ProN',serif] text-xl font-semibold leading-[1.55] text-[#123b59] sm:pr-12 sm:text-[1.65rem] sm:leading-[1.45]"
        >
          {documentConfig.title}
        </h2>
        <p className="mt-3 text-sm leading-7 text-[#587383]">
          ダウンロード後、相談日程の予約画面が開きます。
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Field label="会社名" value={values.company} onChange={update('company')} placeholder="株式会社サンプル" />
          <Field label="氏名" value={values.name} onChange={update('name')} placeholder="田中 太郎" />
          <div className="sm:col-span-2">
            <Field label="メールアドレス" type="email" value={values.email} onChange={update('email')} placeholder="taro@example.co.jp" />
          </div>
        </div>

        <label className="absolute -left-[10000px] top-auto h-px w-px overflow-hidden">
          ウェブサイト
          <input type="text" tabIndex={-1} autoComplete="off" value={values.website} onChange={update('website')} />
        </label>

        {error ? (
          <p className="mt-4 border border-[#e9b4b4] bg-[#fff6f6] px-4 py-3 text-xs leading-5 text-[#a63232]" role="alert">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={submitting}
          className="group/submit mt-6 inline-flex min-h-[52px] w-full items-center justify-center gap-3 bg-[#0b6fb7] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#07588f] disabled:cursor-wait disabled:opacity-65"
        >
          {submitting ? (
            <>
              <Loader2 size={17} className="animate-spin" />
              資料を準備しています
            </>
          ) : (
            <>
              <Download size={17} />
              資料ダウンロード
              <ArrowRight size={15} className="transition-transform group-hover/submit:translate-x-1" />
            </>
          )}
        </button>
      </form>
    </div>
  )
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
}: {
  label: string
  value: string
  onChange: (event: ChangeEvent<HTMLInputElement>) => void
  placeholder: string
  type?: 'text' | 'email'
}) {
  return (
    <label className="block">
      <span className="text-[10px] font-bold tracking-[0.08em] text-[#49697c]">
        {label}<span className="ml-1 text-[#0b6fb7]">必須</span>
      </span>
      <input
        required
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="mt-2 h-12 w-full border border-[#c9dde8] bg-white px-3.5 text-sm text-[#123b59] outline-none transition placeholder:text-[#a0b2bc] focus:border-[#0b6fb7] focus:ring-2 focus:ring-[#0b6fb7]/10"
      />
    </label>
  )
}
