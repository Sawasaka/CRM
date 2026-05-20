'use client'

import Link from 'next/link'
import { useState, type FormEvent } from 'react'
import { motion } from 'framer-motion'
import { Mail, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [devResetUrl, setDevResetUrl] = useState<string | null>(null)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setDevResetUrl(null)

    const res = await fetch('/api/auth/password-reset/request', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email }),
    })
    const json = await res.json().catch(() => null)

    setLoading(false)
    setDone(true)
    if (json?.resetUrl) setDevResetUrl(json.resetUrl)
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="w-full max-w-[400px]"
      >
        <Brand />
        <div className="bg-white rounded-[14px] border border-[#E5E7EB] shadow-[0_4px_24px_rgba(0,0,0,0.06)] p-8">
          <h1 className="text-[22px] font-semibold text-[#111827] mb-1">パスワード再設定</h1>
          <p className="text-sm text-[#6B7280] mb-6">
            登録済みメールアドレスで再設定用リンクを発行します
          </p>

          <form className="space-y-4" onSubmit={submit}>
            <div className="space-y-2">
              <Label htmlFor="email">メールアドレス</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" size={15} />
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="pl-9"
                  required
                />
              </div>
            </div>

            {done ? (
              <p className="text-sm text-[#059669]">
                入力されたメールアドレスが登録済みの場合、再設定リンクを発行しました。
              </p>
            ) : null}

            {devResetUrl ? (
              <Link
                href={devResetUrl}
                className="block break-all rounded-[8px] border border-[#E5E7EB] bg-[#F9FAFB] p-3 text-xs text-[#4F46E5] hover:underline"
              >
                開発用リセットリンク: {devResetUrl}
              </Link>
            ) : null}

            <Button className="w-full h-10" type="submit" loading={loading}>
              再設定リンクを発行
            </Button>
          </form>

          <Link href="/login" className="mt-5 block text-center text-sm font-medium text-[#4F46E5] hover:underline">
            ログインに戻る
          </Link>
        </div>
      </motion.div>
    </div>
  )
}

function Brand() {
  return (
    <div className="flex items-center gap-2.5 mb-8">
      <div className="w-9 h-9 bg-[#4F46E5] rounded-[10px] flex items-center justify-center shadow-[0_2px_8px_rgba(79,70,229,0.3)]">
        <Zap size={18} className="text-white" strokeWidth={2.5} />
      </div>
      <div className="flex flex-col">
        <span className="text-xl font-semibold text-[#111827] leading-tight">ルキスマCRM</span>
        <span className="text-[10px] text-[#9CA3AF] tracking-[0.02em]">for First-Party CRM</span>
      </div>
    </div>
  )
}
