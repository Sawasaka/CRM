'use client'

import { useEffect, useState } from 'react'
import {
  CreditCard,
  ExternalLink,
  Plus,
  ShieldAlert,
} from 'lucide-react'
import {
  ObsButton,
  ObsCard,
  ObsHero,
  ObsPageShell,
} from '@/components/obsidian'

type PaymentStatus = 'succeeded' | 'refunded' | 'partial_refund' | 'pending' | 'failed'

interface Payment {
  id: string
  title: string
  amount: number
  refundedAmount?: number
  status: PaymentStatus
  paidAt: string
  stripeReceiptUrl: string
}

const SAMPLE_PAYMENTS: Payment[] = [
  {
    id: 'pay_001',
    title: 'PROプラン',
    amount: 108000,
    status: 'succeeded',
    paidAt: '2026-05-01T00:00:05',
    stripeReceiptUrl: 'https://pay.stripe.com/receipts/example/r_001',
  },
  {
    id: 'pay_002',
    title: '追加クレジット',
    amount: 50000,
    status: 'succeeded',
    paidAt: '2026-04-12T16:20:00',
    stripeReceiptUrl: 'https://pay.stripe.com/receipts/example/r_002',
  },
  {
    id: 'pay_003',
    title: '機能リクエスト',
    amount: 80000,
    refundedAmount: 80000,
    status: 'refunded',
    paidAt: '2026-03-15T14:00:00',
    stripeReceiptUrl: 'https://pay.stripe.com/receipts/example/r_003',
  },
]

function useIsSuperAdmin(): boolean {
  return true
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function formatCurrency(value: number) {
  return `¥${value.toLocaleString()}`
}

function statusLabel(status: PaymentStatus) {
  switch (status) {
    case 'succeeded':
      return '支払額'
    case 'refunded':
      return '返金済'
    case 'partial_refund':
      return '一部返金'
    case 'pending':
      return '処理中'
    case 'failed':
      return '失敗'
  }
}

function statusTone(status: PaymentStatus) {
  switch (status) {
    case 'succeeded':
      return {
        backgroundColor: 'rgba(209,250,229,0.96)',
        color: '#15803d',
      }
    case 'refunded':
    case 'partial_refund':
      return {
        backgroundColor: 'rgba(255,193,7,0.16)',
        color: '#f6b73c',
      }
    case 'pending':
      return {
        backgroundColor: 'rgba(171,199,255,0.16)',
        color: 'var(--color-obs-primary)',
      }
    case 'failed':
      return {
        backgroundColor: 'rgba(255,90,90,0.16)',
        color: '#ff7a7a',
      }
  }
}

export default function BillingHistoryPage() {
  const isSuperAdmin = useIsSuperAdmin()
  const [portalLoading, setPortalLoading] = useState(false)
  const [payments, setPayments] = useState<Payment[]>(SAMPLE_PAYMENTS)

  useEffect(() => {
    let cancelled = false
    async function loadBillingHistory() {
      try {
        const res = await fetch('/api/stripe/billing-history')
        if (!res.ok) return
        const data = (await res.json()) as { payments?: Payment[] }
        if (!cancelled && data.payments) setPayments(data.payments)
      } catch {
        // Stripe接続前はサンプル表示のままにする
      }
    }
    void loadBillingHistory()
    return () => {
      cancelled = true
    }
  }, [])

  const openStripePortal = async () => {
    setPortalLoading(true)
    try {
      const res = await fetch('/api/stripe/portal', { method: 'POST' })
      const data = (await res.json()) as { url?: string; error?: string }
      if (!res.ok || !data.url) {
        throw new Error(data.error ?? 'Stripe管理画面の作成に失敗しました。')
      }
      window.location.href = data.url
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Stripe管理画面の作成に失敗しました。'
      alert(message)
      setPortalLoading(false)
    }
  }

  if (!isSuperAdmin) {
    return (
      <ObsPageShell>
        <div className="w-full px-8 py-16 flex flex-col items-center justify-center gap-3">
          <ShieldAlert size={48} style={{ color: '#FFC107' }} />
          <h2
            className="font-[family-name:var(--font-display)] text-xl font-semibold"
            style={{ color: 'var(--color-obs-text)' }}
          >
            アクセス権限がありません
          </h2>
          <p className="text-[13px]" style={{ color: 'var(--color-obs-text-muted)' }}>
            支払い履歴は特権管理者のみ閲覧できます。
          </p>
        </div>
      </ObsPageShell>
    )
  }

  return (
    <ObsPageShell>
      <div className="w-full max-w-[860px] px-8 xl:px-12 pb-16">
        <ObsHero
          eyebrow="Billing"
          title="請求"
          caption="請求履歴、請求先情報、決済方法を確認できます。"
          action={
            <ObsButton
              variant="tertiary"
              size="md"
              onClick={openStripePortal}
              disabled={portalLoading}
            >
              <CreditCard size={14} className="inline mr-1.5" />
              {portalLoading ? '接続中...' : 'Stripeで管理'}
            </ObsButton>
          }
        />

        <ObsCard depth="high" padding="none" radius="xl" className="overflow-hidden">
          <section className="px-6 pt-6 pb-5">
            <div className="flex items-center justify-between gap-3 mb-4">
              <h2
                className="font-[family-name:var(--font-display)] text-[17px] font-semibold"
                style={{ color: 'var(--color-obs-text)' }}
              >
                請求履歴
              </h2>
              <button
                type="button"
                onClick={openStripePortal}
                disabled={portalLoading}
                className="h-8 px-3 rounded-full text-[12px] font-semibold transition-colors disabled:opacity-50"
                style={{
                  backgroundColor: 'rgba(0,0,0,0.34)',
                  color: 'var(--color-obs-text)',
                }}
              >
                すべて表示
              </button>
            </div>

            <div
              className="divide-y"
              style={{ borderTop: '1px solid rgba(255,255,255,0.08)', borderColor: 'rgba(255,255,255,0.08)' }}
            >
              {payments.length === 0 ? (
                <p
                  className="py-5 text-[13px]"
                  style={{ color: 'var(--color-obs-text-muted)' }}
                >
                  請求履歴はまだありません。
                </p>
              ) : (
                payments.slice(0, 4).map((payment) => (
                  <BillingRow key={payment.id} payment={payment} />
                ))
              )}
            </div>
          </section>

          <SimpleSection
            title="請求先情報"
            actionLabel="編集"
            onAction={openStripePortal}
            loading={portalLoading}
          >
            <div className="space-y-3">
              <InfoRow label="名前" value="株式会社ルーキースマート" />
              <InfoRow label="住所" value="Stripe管理画面で確認・編集" />
            </div>
          </SimpleSection>

          <SimpleSection
            title="決済方法"
            actionLabel="新規追加"
            onAction={openStripePortal}
            loading={portalLoading}
          >
            <div className="flex items-center gap-3 py-1">
              <div
                className="w-9 h-7 rounded-[var(--radius-obs-sm)] flex items-center justify-center text-[10px] font-bold"
                style={{
                  backgroundColor: '#2148d8',
                  color: '#fff',
                }}
              >
                VISA
              </div>
              <div className="min-w-0">
                <p className="text-[13px] font-semibold" style={{ color: 'var(--color-obs-text)' }}>
                  Stripeで管理中
                </p>
                <p className="text-[12px]" style={{ color: 'var(--color-obs-text-muted)' }}>
                  カードの追加・変更・削除はStripe管理画面で行います。
                </p>
              </div>
            </div>
          </SimpleSection>

          <section className="px-6 pt-5 pb-6 border-t" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
            <div className="flex items-center justify-between gap-6">
              <div>
                <h2
                  className="font-[family-name:var(--font-display)] text-[15px] font-semibold"
                  style={{ color: 'var(--color-obs-text)' }}
                >
                  プランのキャンセル
                </h2>
                <p className="text-[12.5px] mt-1" style={{ color: 'var(--color-obs-text-muted)' }}>
                  解約や更新停止はStripe管理画面から操作できます。
                </p>
              </div>
              <button
                type="button"
                onClick={openStripePortal}
                disabled={portalLoading}
                className="h-9 px-4 rounded-full text-[12.5px] font-semibold transition-colors disabled:opacity-50"
                style={{
                  backgroundColor: 'transparent',
                  color: '#ff6b6b',
                  boxShadow: 'inset 0 0 0 1px rgba(255,90,90,0.55)',
                }}
              >
                キャンセルする
              </button>
            </div>
          </section>
        </ObsCard>
      </div>
    </ObsPageShell>
  )
}

function BillingRow({ payment }: { payment: Payment }) {
  const tone = statusTone(payment.status)
  const receiptUrl = payment.stripeReceiptUrl || undefined

  return (
    <div className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-4 py-3">
      <div className="min-w-0">
        <p className="text-[13px] font-semibold truncate" style={{ color: 'var(--color-obs-text)' }}>
          {formatDate(payment.paidAt)}
        </p>
        <p className="text-[11.5px] truncate mt-0.5" style={{ color: 'var(--color-obs-text-muted)' }}>
          {payment.title}
        </p>
      </div>
      <div className="text-[13px] tabular-nums" style={{ color: 'var(--color-obs-text-muted)' }}>
        {formatCurrency(payment.amount)}
      </div>
      <span
        className="h-7 px-2.5 rounded-[var(--radius-obs-sm)] inline-flex items-center text-[12px] font-semibold whitespace-nowrap"
        style={tone}
      >
        {statusLabel(payment.status)}
      </span>
      {receiptUrl ? (
        <a
          href={receiptUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 h-8 px-1 text-[12.5px] font-semibold underline underline-offset-2 whitespace-nowrap"
          style={{ color: 'var(--color-obs-text)' }}
        >
          表示する
          <ExternalLink size={11} />
        </a>
      ) : (
        <button
          type="button"
          disabled
          className="inline-flex items-center gap-1 h-8 px-1 text-[12.5px] font-semibold opacity-40 whitespace-nowrap"
          style={{ color: 'var(--color-obs-text)' }}
        >
          表示する
        </button>
      )}
    </div>
  )
}

function SimpleSection({
  title,
  actionLabel,
  onAction,
  loading,
  children,
}: {
  title: string
  actionLabel: string
  onAction: () => void
  loading: boolean
  children: React.ReactNode
}) {
  return (
    <section className="px-6 py-5 border-t" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
      <div className="flex items-center justify-between gap-3 mb-4">
        <h2
          className="font-[family-name:var(--font-display)] text-[17px] font-semibold"
          style={{ color: 'var(--color-obs-text)' }}
        >
          {title}
        </h2>
        <button
          type="button"
          onClick={onAction}
          disabled={loading}
          className="h-8 px-3 rounded-full text-[12px] font-semibold inline-flex items-center gap-1.5 transition-colors disabled:opacity-50"
          style={{
            backgroundColor: 'rgba(0,0,0,0.34)',
            color: 'var(--color-obs-text)',
          }}
        >
          {actionLabel === '新規追加' && <Plus size={12} />}
          {actionLabel}
        </button>
      </div>
      {children}
    </section>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[96px_1fr] gap-4 border-t pt-3 first:border-t-0 first:pt-0" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
      <div className="text-[12px] font-semibold" style={{ color: 'var(--color-obs-text)' }}>
        {label}
      </div>
      <div className="text-[12.5px] leading-relaxed" style={{ color: 'var(--color-obs-text-muted)' }}>
        {value}
      </div>
    </div>
  )
}
