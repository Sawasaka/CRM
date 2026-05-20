'use client'

import Link from 'next/link'
import { Suspense, useState, type FormEvent, type ReactNode } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { KeyRound, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<ResetShell />}>
      <ResetContent />
    </Suspense>
  )
}

function ResetContent() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token') ?? ''
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')

    if (!token) {
      setError('再設定リンクが無効です。')
      return
    }

    if (password.length < 8) {
      setError('パスワードは8文字以上で入力してください。')
      return
    }

    if (password !== confirmPassword) {
      setError('確認用パスワードが一致していません。')
      return
    }

    setLoading(true)
    const res = await fetch('/api/auth/password-reset/confirm', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ token, password }),
    })
    setLoading(false)

    if (!res.ok) {
      setError('リンクが期限切れ、または無効です。再度発行してください。')
      return
    }

    setDone(true)
  }

  return (
    <ResetShell>
      <div className="bg-white rounded-[14px] border border-[#E5E7EB] shadow-[0_4px_24px_rgba(0,0,0,0.06)] p-8">
        <h1 className="text-[22px] font-semibold text-[#111827] mb-1">新しいパスワード</h1>
        <p className="text-sm text-[#6B7280] mb-6">
          次回からメールアドレスとこのパスワードでログインできます
        </p>

        {done ? (
          <div className="space-y-4">
            <p className="text-sm text-[#059669]">パスワードを更新しました。</p>
            <Button className="w-full h-10" asChild>
              <Link href="/login">ログインへ進む</Link>
            </Button>
          </div>
        ) : (
          <form className="space-y-4" onSubmit={submit}>
            <PasswordField
              id="password"
              label="新しいパスワード"
              value={password}
              autoComplete="new-password"
              onChange={setPassword}
            />
            <PasswordField
              id="confirm-password"
              label="新しいパスワードを再入力"
              value={confirmPassword}
              autoComplete="new-password"
              onChange={setConfirmPassword}
            />
            {error ? <p className="text-sm text-[#DC2626]">{error}</p> : null}
            <Button className="w-full h-10" type="submit" loading={loading}>
              パスワードを更新
            </Button>
          </form>
        )}

        <Link href="/forgot-password" className="mt-5 block text-center text-sm font-medium text-[#4F46E5] hover:underline">
          リンクを再発行する
        </Link>
      </div>
    </ResetShell>
  )
}

function PasswordField({
  id,
  label,
  value,
  autoComplete,
  onChange,
}: {
  id: string
  label: string
  value: string
  autoComplete: string
  onChange: (value: string) => void
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" size={15} />
        <Input
          id={id}
          type="password"
          autoComplete={autoComplete}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="pl-9"
          required
        />
      </div>
    </div>
  )
}

function ResetShell({ children }: { children?: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="w-full max-w-[400px]"
      >
        <div className="flex items-center gap-2.5 mb-8">
          <div className="w-9 h-9 bg-[#4F46E5] rounded-[10px] flex items-center justify-center shadow-[0_2px_8px_rgba(79,70,229,0.3)]">
            <Zap size={18} className="text-white" strokeWidth={2.5} />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-semibold text-[#111827] leading-tight">ルキスマCRM</span>
            <span className="text-[10px] text-[#9CA3AF] tracking-[0.02em]">for First-Party CRM</span>
          </div>
        </div>
        {children}
      </motion.div>
    </div>
  )
}
