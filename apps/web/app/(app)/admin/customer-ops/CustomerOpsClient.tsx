'use client'

import { useState } from 'react'
import { Building2, ExternalLink, Pencil } from 'lucide-react'
import { ObsCard, ObsHero, ObsPageShell } from '@/components/obsidian'
import type { CustomerOpsMetrics, TenantRow } from '@/lib/admin/customer-ops-types'

// 開発者用テナント一覧 (最小機能版 / 精緻UI)
// - 行クリックで該当テナントの本環境を新規タブで開く
//   (詳細ページへの遷移は廃止。確認はこのタブで完結)

export function CustomerOpsClient({
  tenants,
}: {
  tenants: TenantRow[]
  metrics: CustomerOpsMetrics
}) {
  return (
    <ObsPageShell>
      <div className="w-full px-8 xl:px-12 2xl:px-16 pb-16">
        <ObsHero
          eyebrow="Admin"
          title="開発者ページ"
          caption="本番テナントの一覧と環境アクセスができます。"
          action={
            <span
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold uppercase tracking-[0.08em]"
              style={{
                background: 'rgba(255,193,7,0.10)',
                color: '#FFC107',
                boxShadow: 'inset 0 0 0 1px rgba(255,193,7,0.30)',
              }}
            >
              開発者専用
            </span>
          }
        />

        {/* ── テナント一覧 ── */}
        {tenants.length === 0 ? (
          <ObsCard depth="high" padding="lg" radius="xl">
            <div
              className="px-4 py-12 text-center text-[13px]"
              style={{ color: 'var(--color-obs-text-muted)' }}
            >
              テナントが見つかりません。
            </div>
          </ObsCard>
        ) : (
          <div className="space-y-3">
            {tenants.map((t) => (
              <TenantRowItem key={t.id} tenant={t} />
            ))}
          </div>
        )}
      </div>
    </ObsPageShell>
  )
}

// ─── Tenant row (グラデ枠 + ambient glow + 精緻チップ) ───────────────────────

function TenantRowItem({ tenant }: { tenant: TenantRow }) {
  const [hover, setHover] = useState(false)
  const tenantUrl = `/?tenant=${tenant.slug}`
  const editUrl = `/admin/customer-ops/${tenant.id}`
  return (
    <div
      className="block rounded-[20px] p-[1px] transition-all duration-200"
      style={{
        background: hover
          ? 'linear-gradient(135deg, rgba(171,199,255,0.45) 0%, rgba(0,113,227,0.22) 50%, rgba(171,199,255,0.06) 100%)'
          : 'linear-gradient(135deg, rgba(171,199,255,0.18) 0%, rgba(171,199,255,0.05) 60%, transparent 100%)',
        boxShadow: hover
          ? '0 12px 36px -16px rgba(171,199,255,0.30), 0 0 0 1px rgba(171,199,255,0.10)'
          : '0 6px 24px -14px rgba(0,0,0,0.45), 0 0 0 1px rgba(255,255,255,0.02)',
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div
        className="rounded-[19px] px-5 py-4 relative overflow-hidden fo-glass-rim"
        style={{
          background:
            'linear-gradient(180deg, rgba(18,18,22,0.94) 0%, rgba(12,12,16,0.96) 100%)',
        }}
      >
        {/* hover時の ambient glow */}
        {hover && (
          <div
            className="absolute -top-16 -right-12 w-48 h-48 rounded-full pointer-events-none"
            style={{
              background:
                'radial-gradient(circle, rgba(171,199,255,0.16), transparent 60%)',
              filter: 'blur(36px)',
            }}
          />
        )}

        <div className="flex items-center gap-4 relative">
          {/* アイコンチップ (グラデ + 内側ring + 外側ソフト影) */}
          <div
            className="shrink-0 w-12 h-12 rounded-[14px] flex items-center justify-center"
            style={{
              background:
                'linear-gradient(135deg, rgba(171,199,255,0.30) 0%, rgba(0,113,227,0.18) 100%)',
              boxShadow:
                'inset 0 0 0 1px rgba(171,199,255,0.40), inset 1px 1px 0 rgba(255,255,255,0.10), 0 8px 18px -8px rgba(171,199,255,0.30)',
            }}
          >
            <Building2
              size={20}
              strokeWidth={2}
              style={{
                color: 'var(--color-obs-primary)',
                filter: 'drop-shadow(0 0 6px rgba(171,199,255,0.35))',
              }}
            />
          </div>

          {/* 名前 + プラン + 状態 */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className="font-[family-name:var(--font-display)] text-[16px] font-semibold tracking-[-0.015em] truncate"
                style={{ color: 'var(--color-obs-text)' }}
              >
                {tenant.name}
              </span>
              <PlanChip plan={tenant.plan} />
              <StatusChip status={tenant.status} />
            </div>
            <div
              className="text-[12px] mt-1 truncate"
              style={{ color: 'var(--color-obs-text-subtle)' }}
            >
              <span className="font-mono">{tenant.slug}</span>
              <span className="mx-1.5" style={{ color: 'var(--color-obs-text-muted)' }}>
                ・
              </span>
              {tenant.userCount} 名
              <span className="mx-1.5" style={{ color: 'var(--color-obs-text-muted)' }}>
                ・
              </span>
              最終活動 {tenant.lastActivityAt ? formatDate(tenant.lastActivityAt) : '—'}
            </div>
          </div>

          {/* アクション (編集 + 環境に入る) */}
          <div className="flex items-center gap-2 shrink-0">
            {/* 編集 (詳細ページへ) */}
            <a
              href={editUrl}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-[var(--radius-obs-md)] text-[12.5px] font-semibold transition-colors"
              style={{
                color: 'var(--color-obs-text-muted)',
                background: 'rgba(255,255,255,0.04)',
                boxShadow: 'inset 0 0 0 1px var(--color-obs-border)',
              }}
            >
              <Pencil size={13} strokeWidth={2.2} />
              編集
            </a>

            {/* 環境に入る (本環境を新規タブで開く) */}
            <a
              href={tenantUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-[var(--radius-obs-md)] text-[12.5px] font-semibold transition-transform"
              style={{
                background: hover
                  ? 'linear-gradient(135deg, #c7d8ff 0%, #8db4ff 100%)'
                  : 'linear-gradient(135deg, var(--color-obs-primary) 0%, var(--color-obs-primary-container) 100%)',
                color: 'var(--color-obs-on-primary)',
                boxShadow: hover
                  ? '0 10px 22px -8px rgba(171,199,255,0.55), inset 1px 1px 0 rgba(255,255,255,0.25)'
                  : '0 4px 14px -4px rgba(171,199,255,0.40), inset 1px 1px 0 rgba(255,255,255,0.18)',
                transform: hover ? 'translateY(-1px)' : 'translateY(0)',
              }}
            >
              環境に入る <ExternalLink size={13} strokeWidth={2.4} />
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Plan chip ───────────────────────────────────────────────────────────────

function PlanChip({ plan }: { plan: string }) {
  return (
    <span
      className="text-[10px] font-semibold uppercase tracking-[0.08em] px-2 py-[3px] rounded-full shrink-0"
      style={{
        background: 'linear-gradient(135deg, rgba(171,199,255,0.18), rgba(171,199,255,0.06))',
        color: 'var(--color-obs-primary)',
        boxShadow: 'inset 0 0 0 1px rgba(171,199,255,0.28)',
      }}
    >
      {plan}
    </span>
  )
}

// ─── Status chip (ACTIVE = 緑グロー / DORMANT = グレー) ───────────────────────

function StatusChip({ status }: { status: 'active' | 'dormant' }) {
  const isActive = status === 'active'
  return (
    <span
      className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.08em] px-2 py-[3px] rounded-full shrink-0"
      style={{
        background: isActive
          ? 'linear-gradient(135deg, rgba(75,200,140,0.20), rgba(75,200,140,0.06))'
          : 'rgba(255,255,255,0.05)',
        color: isActive ? '#5CDEA6' : 'var(--color-obs-text-subtle)',
        boxShadow: isActive
          ? 'inset 0 0 0 1px rgba(75,200,140,0.32), 0 0 8px rgba(75,200,140,0.20)'
          : 'inset 0 0 0 1px rgba(255,255,255,0.08)',
      }}
    >
      <span
        className="inline-block w-1.5 h-1.5 rounded-full"
        style={{
          backgroundColor: isActive ? '#5CDEA6' : 'rgba(255,255,255,0.30)',
          boxShadow: isActive ? '0 0 6px #5CDEA6' : 'none',
        }}
      />
      {isActive ? 'ACTIVE' : 'DORMANT'}
    </span>
  )
}

function formatDate(iso: string): string {
  try {
    const d = new Date(iso)
    return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`
  } catch {
    return iso
  }
}
