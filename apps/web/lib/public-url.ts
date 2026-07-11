const PUBLIC_APP_URL_FALLBACK = 'https://crm.rookiesmart-jp.com'

export function getPublicBaseUrl(): string {
  const candidates = [process.env.NEXT_PUBLIC_APP_URL]

  for (const candidate of candidates) {
    const normalized = normalizePublicBaseUrl(candidate)
    if (normalized) return normalized
  }

  return PUBLIC_APP_URL_FALLBACK
}

export function getPaidJoinUrl(slug: string): string {
  return `${getPublicBaseUrl()}/join/${encodeURIComponent(slug)}`
}

export function getTenantEnvironmentUrl(slug: string): string {
  // 既定では default テナントはそのまま `?tenant=default` を指す。
  // 別のプレビュー用テナントを使いたい場合のみ env で上書きできる。
  const previewSlug = process.env.NEXT_PUBLIC_DEFAULT_TENANT_PREVIEW_SLUG?.trim() || 'default'
  const tenantSlug = slug === 'default' ? previewSlug : slug
  return `${getPublicBaseUrl()}/?tenant=${encodeURIComponent(tenantSlug)}`
}

function normalizePublicBaseUrl(value: string | undefined): string | null {
  if (!value) return null
  const trimmed = value.trim().replace(/\/+$/, '')
  if (!trimmed || isLocalUrl(trimmed)) return null

  return trimmed
}

function isLocalUrl(value: string): boolean {
  return (
    value.includes('localhost') ||
    value.includes('127.0.0.1') ||
    value.includes('[::1]') ||
    value.includes('://::1')
  )
}
