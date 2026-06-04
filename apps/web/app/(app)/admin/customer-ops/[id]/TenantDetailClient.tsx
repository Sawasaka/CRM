'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Activity,
  ArrowLeft,
  Crown,
  Database,
  ExternalLink,
  MessageCircle,
  Plug,
  ShieldAlert,
  Ticket,
  Users,
} from 'lucide-react'
import { ObsCard, ObsHero, ObsPageShell } from '@/components/obsidian'
import type { TenantDetail } from '@/lib/admin/customer-ops-types'

export function TenantDetailClient({ tenant }: { tenant: TenantDetail }) {
  const [tab, setTab] = useState<'overview' | 'users' | 'activity'>('overview')

  return (
    <ObsPageShell>
      <div className="w-full px-8 xl:px-12 2xl:px-16 pb-16">
        <Link
          href="/admin/customer-ops"
          className="inline-flex items-center gap-1.5 text-[12.5px] mb-3 transition-colors"
          style={{ color: 'var(--color-obs-text-muted)' }}
        >
          <ArrowLeft size={14} />
          開発者ページに戻る
        </Link>

        <ObsHero
          eyebrow={`Tenant ${tenant.slug}`}
          title={tenant.name}
          caption={`主担当: ${tenant.primaryContact ? `${tenant.primaryContact.name} (${tenant.primaryContact.email})` : '未登録'} ・ 作成 ${formatDate(tenant.createdAt)}`}
          action={
            <div className="flex items-center gap-2">
              <span
                className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full uppercase tracking-[0.08em]"
                style={{
                  color: '#FFC107',
                  backgroundColor: 'rgba(255,193,7,0.14)',
                }}
              >
                <ShieldAlert size={11} />
                開発者専用
              </span>
              <a
                href={`/?tenant=${tenant.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-[var(--radius-obs-md)] text-[12.5px] font-semibold transition-colors"
                style={{
                  background:
                    'linear-gradient(135deg, var(--color-obs-primary) 0%, var(--color-obs-primary-container) 100%)',
                  color: 'var(--color-obs-on-primary)',
                }}
              >
                環境に入る <ExternalLink size={12} />
              </a>
            </div>
          }
        />

        <div
          className="inline-flex p-1 rounded-[var(--radius-obs-md)] mb-6 gap-0.5"
          style={{ backgroundColor: 'var(--color-obs-surface-high)' }}
        >
          {(
            [
              { key: 'overview', label: '概要' },
              { key: 'users', label: 'ユーザー' },
              { key: 'activity', label: '最近の活動' },
            ] as const
          ).map((opt) => (
            <button
              key={opt.key}
              onClick={() => setTab(opt.key)}
              className="px-4 h-9 rounded-[calc(var(--radius-obs-md)-2px)] text-[12.5px] font-medium transition-colors"
              style={{
                backgroundColor: tab === opt.key ? 'var(--color-obs-surface-highest)' : 'transparent',
                color: tab === opt.key ? 'var(--color-obs-text)' : 'var(--color-obs-text-muted)',
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {tab === 'overview' && <OverviewTab tenant={tenant} />}
        {tab === 'users' && <UsersTab tenant={tenant} />}
        {tab === 'activity' && <ActivityTab tenant={tenant} />}
      </div>
    </ObsPageShell>
  )
}

function OverviewTab({ tenant }: { tenant: TenantDetail }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <InfoStat label="プラン" value={tenant.plan} icon={Crown} />
        <InfoStat
          label="ユーザー"
          value={`${tenant.userCount.toLocaleString()} 名`}
          sub={`30日Active ${tenant.activeUsers30d.toLocaleString()} 名`}
          icon={Users}
          accent="#50C8FF"
        />
        <InfoStat
          label="企業 / 商談"
          value={`${tenant.companyCount.toLocaleString()} / ${tenant.dealCount.toLocaleString()}`}
          sub="Company / Deal"
          icon={Database}
          accent="#4BC88C"
        />
        <InfoStat
          label="問い合わせ"
          value={`${tenant.ticketCount.toLocaleString()} 件`}
          sub={`活動 ${tenant.activityCount30d.toLocaleString()} / 30日`}
          icon={Ticket}
          accent="#FFC107"
        />
      </div>

      <ObsCard depth="high" padding="lg" radius="xl">
        <h3
          className="font-[family-name:var(--font-display)] text-base font-semibold mb-4"
          style={{ color: 'var(--color-obs-text)' }}
        >
          基本情報
        </h3>
        <dl className="grid grid-cols-2 gap-x-8 gap-y-3 text-[12.5px]">
          <DefRow label="テナントID" value={tenant.id} />
          <DefRow label="slug" value={tenant.slug} />
          <DefRow label="作成日" value={formatDateTime(tenant.createdAt)} />
          <DefRow label="最終活動" value={formatDateTime(tenant.lastActivityAt)} />
          <DefRow label="主担当者" value={tenant.primaryContact ? `${tenant.primaryContact.name} (${tenant.primaryContact.email})` : '-'} />
          <DefRow label="ステータス" value={tenant.status === 'active' ? 'アクティブ' : '休眠'} />
          <DefRow label="コンタクト" value={`${tenant.contactCount.toLocaleString()} 件`} />
          <DefRow label="ナレッジ" value={`${tenant.knowledgeCount.toLocaleString()} 件`} />
        </dl>
      </ObsCard>

      <ObsCard depth="high" padding="lg" radius="xl">
        <h3
          className="font-[family-name:var(--font-display)] text-base font-semibold mb-4"
          style={{ color: 'var(--color-obs-text)' }}
        >
          連携状況
        </h3>
        <div className="grid grid-cols-3 gap-3">
          <IntegrationStat label="Google Workspace" connected={tenant.integrations.google} />
          <IntegrationStat label="Slack" connected={tenant.integrations.slack} />
          <IntegrationStat label="Microsoft 365" connected={tenant.integrations.microsoft} />
        </div>
      </ObsCard>
    </div>
  )
}

function UsersTab({ tenant }: { tenant: TenantDetail }) {
  return (
    <ObsCard depth="high" padding="none" radius="xl" className="overflow-hidden">
      <div
        className="grid grid-cols-[1.5fr_1.6fr_0.7fr_0.8fr_0.8fr] gap-3 px-5 py-3 text-[11px] font-medium uppercase tracking-[0.08em]"
        style={{
          color: 'var(--color-obs-text-subtle)',
          backgroundColor: 'var(--color-obs-surface-high)',
        }}
      >
        <span>名前</span>
        <span>メール</span>
        <span>権限</span>
        <span>Google</span>
        <span>作成日</span>
      </div>
      {tenant.users.length === 0 ? (
        <p className="text-[12.5px] text-center py-8 px-5" style={{ color: 'var(--color-obs-text-muted)' }}>
          ユーザーが登録されていません。
        </p>
      ) : (
        tenant.users.map((user, index) => (
          <div
            key={user.id}
            className="grid grid-cols-[1.5fr_1.6fr_0.7fr_0.8fr_0.8fr] gap-3 px-5 py-3.5 items-center text-[12.5px]"
            style={{ borderTop: index > 0 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}
          >
            <span className="font-semibold truncate" style={{ color: 'var(--color-obs-text)' }}>
              {user.name}
            </span>
            <span className="truncate" style={{ color: 'var(--color-obs-text-muted)' }}>
              {user.email}
            </span>
            <span style={{ color: 'var(--color-obs-text)' }}>{user.role}</span>
            <span style={{ color: user.googleConnected ? '#4BC88C' : 'var(--color-obs-text-subtle)' }}>
              {user.googleConnected ? '連携済み' : '未連携'}
            </span>
            <span style={{ color: 'var(--color-obs-text-subtle)' }}>{formatDate(user.createdAt)}</span>
          </div>
        ))
      )}
    </ObsCard>
  )
}

function ActivityTab({ tenant }: { tenant: TenantDetail }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <InfoStat label="総活動" value={tenant.activityCount.toLocaleString()} icon={Activity} accent="#FF8A65" />
        <InfoStat label="30日活動" value={tenant.activityCount30d.toLocaleString()} icon={Activity} accent="#50C8FF" />
        <InfoStat label="30日Active" value={`${tenant.activeUsers30d.toLocaleString()} 名`} icon={Users} />
        <InfoStat label="最終活動" value={formatDate(tenant.lastActivityAt)} icon={MessageCircle} accent="#4BC88C" />
      </div>

      <ObsCard depth="high" padding="none" radius="xl" className="overflow-hidden">
        <div className="px-5 py-3" style={{ backgroundColor: 'var(--color-obs-surface-high)' }}>
          <p className="text-[12px] font-semibold" style={{ color: 'var(--color-obs-text)' }}>
            最近の活動 ({tenant.recentActivities.length}件)
          </p>
        </div>
        {tenant.recentActivities.length === 0 ? (
          <p className="text-[12.5px] text-center py-8 px-5" style={{ color: 'var(--color-obs-text-muted)' }}>
            まだ活動履歴がありません。
          </p>
        ) : (
          tenant.recentActivities.map((activity, index) => (
            <div
              key={activity.id}
              className="px-5 py-3.5 grid grid-cols-[auto_1fr_auto] gap-3 items-start"
              style={{ borderTop: index > 0 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}
            >
              <div
                className="w-9 h-9 rounded-[var(--radius-obs-md)] flex items-center justify-center shrink-0"
                style={{ backgroundColor: 'rgba(171,199,255,0.14)' }}
              >
                <Activity size={14} style={{ color: 'var(--color-obs-primary)' }} />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-0.5">
                  <span
                    className="text-[10px] font-medium uppercase tracking-[0.08em]"
                    style={{ color: 'var(--color-obs-primary)' }}
                  >
                    {activity.type}
                  </span>
                  <span className="text-[10.5px]" style={{ color: 'var(--color-obs-text-subtle)' }}>
                    {activity.userName}
                  </span>
                </div>
                <p className="text-[13px] font-semibold" style={{ color: 'var(--color-obs-text)' }}>
                  {activity.title}
                </p>
              </div>
              <p className="text-[10.5px] whitespace-nowrap pt-1" style={{ color: 'var(--color-obs-text-subtle)' }}>
                {formatDateTime(activity.occurredAt)}
              </p>
            </div>
          ))
        )}
      </ObsCard>
    </div>
  )
}

function InfoStat({
  label,
  value,
  sub,
  icon: Icon,
  accent = 'var(--color-obs-primary)',
}: {
  label: string
  value: string
  sub?: string
  icon: React.ElementType
  accent?: string
}) {
  return (
    <ObsCard depth="high" padding="md" radius="xl">
      <div className="flex items-start justify-between mb-2">
        <p
          className="text-[10.5px] font-medium uppercase tracking-[0.1em]"
          style={{ color: 'var(--color-obs-text-subtle)' }}
        >
          {label}
        </p>
        <div
          className="w-7 h-7 rounded-[var(--radius-obs-sm)] flex items-center justify-center"
          style={{ backgroundColor: `color-mix(in srgb, ${accent} 14%, transparent)` }}
        >
          <Icon size={13} style={{ color: accent }} />
        </div>
      </div>
      <p
        className="font-[family-name:var(--font-display)] text-[20px] font-bold tabular-nums tracking-[-0.02em]"
        style={{ color: 'var(--color-obs-text)' }}
      >
        {value}
      </p>
      {sub && (
        <p className="text-[11px] mt-0.5" style={{ color: 'var(--color-obs-text-subtle)' }}>
          {sub}
        </p>
      )}
    </ObsCard>
  )
}

function DefRow({ label, value }: { label: string; value: string }) {
  return (
    <>
      <dt style={{ color: 'var(--color-obs-text-subtle)' }}>{label}</dt>
      <dd className="break-all" style={{ color: 'var(--color-obs-text)' }}>
        {value}
      </dd>
    </>
  )
}

function IntegrationStat({ label, connected }: { label: string; connected: boolean }) {
  return (
    <div
      className="p-3 rounded-[var(--radius-obs-md)] flex items-center gap-2.5"
      style={{ backgroundColor: 'var(--color-obs-surface-high)' }}
    >
      <div
        className="w-8 h-8 rounded-[var(--radius-obs-sm)] flex items-center justify-center"
        style={{
          backgroundColor: connected
            ? 'rgba(75,200,140,0.14)'
            : 'var(--color-obs-surface-highest)',
        }}
      >
        <Plug size={13} style={{ color: connected ? '#4BC88C' : 'var(--color-obs-text-subtle)' }} />
      </div>
      <div>
        <p className="text-[12.5px] font-semibold" style={{ color: 'var(--color-obs-text)' }}>
          {label}
        </p>
        <p
          className="text-[10.5px]"
          style={{ color: connected ? '#4BC88C' : 'var(--color-obs-text-subtle)' }}
        >
          {connected ? '連携済み' : '未連携'}
        </p>
      </div>
    </div>
  )
}

function formatDate(value: string | null) {
  if (!value) return '-'
  return new Date(value).toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  })
}

function formatDateTime(value: string | null) {
  if (!value) return '-'
  return new Date(value).toLocaleString('ja-JP', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
