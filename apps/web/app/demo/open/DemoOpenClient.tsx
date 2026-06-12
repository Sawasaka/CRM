'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { signIn } from 'next-auth/react'
import { Loader2, ShieldAlert, Sparkles } from 'lucide-react'

export function DemoOpenClient({ tenantSlug }: { tenantSlug: string }) {
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    async function openDemo() {
      try {
        const res = await fetch('/api/demo-open', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tenant: tenantSlug }),
        })
        const json = await res.json().catch(() => ({}))
        if (!res.ok || !json.url) {
          throw new Error(json.error || 'デモ環境を開けませんでした。')
        }
        const auth = json.auth as
          | { email?: string; password?: string; tenant?: string }
          | undefined
        if (!auth?.email || !auth.password || !auth.tenant) {
          throw new Error('デモログイン情報を発行できませんでした。')
        }
        const result = await signIn('credentials', {
          email: auth.email,
          password: auth.password,
          tenant: auth.tenant,
          redirect: false,
          callbackUrl: json.url,
        })
        if (!result?.ok) throw new Error('デモログインに失敗しました。')
        if (!cancelled) window.location.href = typeof json.url === 'string' ? json.url : '/'
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'デモ環境を開けませんでした。')
        }
      }
    }
    openDemo()
    return () => {
      cancelled = true
    }
  }, [tenantSlug])

  return (
    <main className="min-h-screen flex items-center justify-center px-6 bg-[#0a0a0c] text-[#e7e5ea]">
      <div className="w-full max-w-[460px] text-center">
        {error ? (
          <>
            <div
              className="mx-auto mb-7 flex h-16 w-16 items-center justify-center rounded-full"
              style={{
                background: 'rgba(255,107,107,0.10)',
                boxShadow: '0 0 0 1px rgba(255,107,107,0.24)',
              }}
            >
              <ShieldAlert size={28} color="#ff8d8d" strokeWidth={2.2} />
            </div>
            <h1 className="font-display text-[1.5rem] font-bold tracking-[-0.015em]">
              デモ環境を開けません
            </h1>
            <p className="mt-4 text-[13px] leading-7 text-[#9b99a0]">{error}</p>
            <Link
              href="/lp"
              className="mt-8 inline-flex h-11 items-center justify-center rounded-[10px] px-5 text-[13px] font-semibold"
              style={{
                background:
                  'linear-gradient(140deg, var(--color-obs-primary) 0%, var(--color-obs-primary-container) 100%)',
                color: 'var(--color-obs-on-primary)',
              }}
            >
              ルキスマCRMへ戻る
            </Link>
          </>
        ) : (
          <>
            <div
              className="mx-auto mb-7 flex h-16 w-16 items-center justify-center rounded-full"
              style={{
                background: 'rgba(171,199,255,0.10)',
                boxShadow: '0 0 0 1px rgba(171,199,255,0.24)',
              }}
            >
              <Loader2 size={28} color="#abc7ff" strokeWidth={2.2} className="animate-spin" />
            </div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#7e7c83]">
              ルキスマCRM 無料デモ
            </p>
            <h1 className="mt-3 font-display text-[1.55rem] font-bold tracking-[-0.015em]">
              ルキスマCRMのデモ環境を開いています
            </h1>
            <p className="mt-4 inline-flex items-center justify-center gap-2 text-[13px] text-[#9b99a0]">
              <Sparkles size={14} />
              Google登録なしで、そのままサービス画面へ移動します。
            </p>
            <p className="mt-3 text-[12px] leading-6 text-[#9b99a0]">
              デモ内の企業・商談・コンタクト等のデータはすべてダミーデータです。
            </p>
          </>
        )}
      </div>
    </main>
  )
}
