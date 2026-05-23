'use client'

import Link from 'next/link'
import {
  Suspense,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from 'react'
import { signIn } from 'next-auth/react'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { KeyRound, Mail, UserRound } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const DEFAULT_SERVICE_PATH = '/dashboard'

export default function LoginPage() {
  return (
    <Suspense fallback={<AuthShell />}>
      <LoginContent />
    </Suspense>
  )
}

function LoginContent() {
  const searchParams = useSearchParams()
  const callbackUrl = useMemo(() => {
    const value = searchParams.get('callbackUrl')
    return value && value.startsWith('/') ? value : DEFAULT_SERVICE_PATH
  }, [searchParams])
  const initialMode = searchParams.get('mode') === 'register' ? 'register' : 'login'
  const authError = searchParams.get('error')
  const autoGoogle = searchParams.get('google') === '1'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [mode, setMode] = useState<'login' | 'register'>(initialMode)
  const [error, setError] = useState(authError ? authErrorMessage(authError) : '')
  const [loading, setLoading] = useState<'credentials' | 'google' | null>(null)
  const [legalAccepted, setLegalAccepted] = useState(false)
  const [googleAvailable, setGoogleAvailable] = useState(false)
  const [providersLoaded, setProvidersLoaded] = useState(false)
  const autoGoogleStarted = useRef(false)

  useEffect(() => {
    fetch('/api/auth/providers')
      .then((res) => (res.ok ? res.json() : null))
      .then((providers) => {
        setGoogleAvailable(!!providers?.google)
        setProvidersLoaded(true)
      })
      .catch(() => {
        setGoogleAvailable(false)
        setProvidersLoaded(true)
      })
  }, [])

  useEffect(() => {
    if (!autoGoogle || autoGoogleStarted.current || !providersLoaded) return
    autoGoogleStarted.current = true
    if (!googleAvailable) {
      setError('')
      return
    }
    setLoading('google')
    signIn('google', { callbackUrl })
  }, [autoGoogle, callbackUrl, googleAvailable, providersLoaded])

  async function submitPasswordLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setLoading('credentials')

    if (mode === 'register') {
      if (!legalAccepted) {
        setError('初回登録には利用規約・プライバシーポリシーへの同意が必要です。')
        setLoading(null)
        return
      }

      if (password.length < 8) {
        setError('パスワードは8文字以上で入力してください。')
        setLoading(null)
        return
      }

      const res = await fetch('/api/auth/password/register', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email, password, name }),
      })

      if (!res.ok) {
        setLoading(null)
        setError(
          res.status === 409
            ? 'このメールアドレスは登録済みです。ログインを選んでください。'
            : '初回登録に失敗しました。入力内容を確認してください。'
        )
        return
      }
    }

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
      callbackUrl,
    })

    setLoading(null)

    if (!result?.ok) {
      setError('メールアドレスまたはパスワードが正しくありません。')
      return
    }

    window.location.href = result.url ?? callbackUrl
  }

  return (
    <AuthShell>
      <div className="rounded-2xl border border-white/10 bg-[#242426]/88 p-7 shadow-[0_22px_80px_rgba(0,0,0,0.34)] backdrop-blur-xl">
        <h1 className="text-[22px] font-semibold tracking-[-0.02em] text-[#e7e5ea] mb-1">
          {mode === 'login' ? 'ログイン' : '初回登録'}
        </h1>
        <p className="text-sm leading-6 text-[#9b99a0] mb-6">
          {googleAvailable
            ? 'Google、またはメールアドレスとパスワードで利用できます'
            : 'メールアドレスとパスワードでログインできます'}
        </p>

        {googleAvailable ? (
          <>
            <div className="grid gap-3">
              <Button
                className="w-full h-10 gap-3"
                variant="secondary"
                style={{
                  backgroundColor: '#fcfbff',
                  color: '#0a0a0c',
                  borderColor: 'rgba(255,255,255,0.12)',
                }}
                loading={loading === 'google'}
                disabled={mode === 'register' && !legalAccepted}
                onClick={() => {
                  setLoading('google')
                  signIn('google', { callbackUrl })
                }}
              >
                <GoogleIcon />
                Googleでログイン
              </Button>
            </div>

            <div className="my-6 flex items-center gap-3">
              <div className="h-px flex-1 bg-white/10" />
              <span className="text-xs text-[#7e7c83]">または</span>
              <div className="h-px flex-1 bg-white/10" />
            </div>
          </>
        ) : (
          <div className="mb-6" />
        )}

        <form className="space-y-4" onSubmit={submitPasswordLogin}>
          {mode === 'register' ? (
            <div className="space-y-2">
              <Label htmlFor="name" className="text-[#c7c5c9]">名前</Label>
              <div className="relative">
                <UserRound
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7e7c83]"
                  size={15}
                />
                <Input
                  id="name"
                  type="text"
                  autoComplete="name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="pl-9 border-white/10 bg-[#131315] text-[#e7e5ea] placeholder:text-[#5d5a5f] hover:border-white/20 focus-visible:border-[#abc7ff] focus-visible:ring-[#abc7ff]/20"
                  placeholder="山田 太郎"
                />
              </div>
            </div>
          ) : null}

          {mode === 'register' ? (
            <label className="flex items-start gap-2.5 rounded-xl border border-white/10 bg-[#1b1b1d] p-3 text-xs leading-5 text-[#9b99a0]">
              <input
                type="checkbox"
                checked={legalAccepted}
                onChange={(event) => setLegalAccepted(event.target.checked)}
                className="mt-0.5 h-4 w-4 shrink-0 accent-[#0071e3]"
              />
              <span>
                <Link href="/legal/terms" className="font-medium text-[#abc7ff] hover:underline">
                  利用規約
                </Link>
                、
                <Link href="/legal/privacy" className="font-medium text-[#abc7ff] hover:underline">
                  プライバシーポリシー
                </Link>
                、
                <Link
                  href="/legal/ai-policy"
                  className="font-medium text-[#abc7ff] hover:underline"
                >
                  AI利用ポリシー
                </Link>
                に同意して初回登録します。
              </span>
            </label>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="email" className="text-[#c7c5c9]">メールアドレス</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7e7c83]" size={15} />
              <Input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="pl-9 border-white/10 bg-[#131315] text-[#e7e5ea] placeholder:text-[#5d5a5f] hover:border-white/20 focus-visible:border-[#abc7ff] focus-visible:ring-[#abc7ff]/20"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <Label htmlFor="password" className="text-[#c7c5c9]">パスワード</Label>
              <Link
                href="/forgot-password"
                className="text-xs font-medium text-[#abc7ff] hover:underline"
              >
                パスワードを忘れた
              </Link>
            </div>
            <div className="relative">
              <KeyRound
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7e7c83]"
                size={15}
              />
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="pl-9 border-white/10 bg-[#131315] text-[#e7e5ea] placeholder:text-[#5d5a5f] hover:border-white/20 focus-visible:border-[#abc7ff] focus-visible:ring-[#abc7ff]/20"
                required
              />
            </div>
          </div>

          {error ? <p className="text-sm text-[#ff8dcf]">{error}</p> : null}

          <Button
            className="w-full h-10"
            type="submit"
            style={{
              background: 'linear-gradient(135deg, #abc7ff, #0071e3)',
              color: '#0a0a0c',
              boxShadow: '0 0 24px rgba(171,199,255,0.28)',
            }}
            loading={loading === 'credentials'}
            disabled={mode === 'register' && !legalAccepted}
          >
            {mode === 'login' ? 'メールアドレスでログイン' : 'メールアドレスで始める'}
          </Button>
        </form>

        <button
          type="button"
          className="mt-5 block w-full text-center text-sm font-medium text-[#abc7ff] hover:underline"
          onClick={() => {
            setError('')
            setLegalAccepted(false)
            setMode((current) => (current === 'login' ? 'register' : 'login'))
          }}
        >
          {mode === 'login' ? '初回登録はこちら' : '登録済みの方はこちら'}
        </button>
      </div>
    </AuthShell>
  )
}

function authErrorMessage(error: string): string {
  if (error === 'Configuration') {
    return ''
  }
  if (error === 'OAuthCallback' || error === 'OAuthSignin') {
    return 'Googleログインに失敗しました。メールアドレスでのログインを試してください。'
  }
  return 'ログインに失敗しました。'
}

function AuthShell({ children }: { children?: ReactNode }) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0a0a0c] text-[#e7e5ea] flex items-center justify-center p-4">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(171,199,255,0.08),transparent_36%,rgba(0,113,227,0.05))]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-white/10" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-[linear-gradient(0deg,rgba(0,0,0,0.34),transparent)]" />
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-[410px]"
      >
        {children}
        <p className="mt-5 text-center text-xs text-[#5d5a5f]">
          © 2026 RookieSmart. All rights reserved.
        </p>
      </motion.div>
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4" aria-hidden="true">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  )
}
