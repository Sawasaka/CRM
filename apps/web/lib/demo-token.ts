/**
 * 無料デモトークンの発行/検証ユーティリティ。
 * /api/demo-access/route.ts と /demo, /demo-app の両方で参照する。
 */

const SECRET =
  process.env.DEMO_ACCESS_SECRET ??
  'dev-only-fallback-please-set-DEMO_ACCESS_SECRET-in-prod'

export const DEMO_CREDITS_DEFAULT = 100
export const DEMO_TOKEN_TTL_MS = 30 * 60 * 1000 // 30分

export interface DemoClaims {
  sessionId: string
  company: string
  name: string
  email: string
  credits: number
  issuedAt: number
  expiresAt: number
}

function b64urlEncodeBytes(bytes: Uint8Array): string {
  const b64 = btoa(String.fromCharCode(...bytes))
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function b64urlDecode(input: string): Uint8Array {
  const pad = input.length % 4
  const b64 = input.replace(/-/g, '+').replace(/_/g, '/') + (pad ? '='.repeat(4 - pad) : '')
  const bin = atob(b64)
  const bytes = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
  return bytes
}

async function hmacBase64Url(message: string): Promise<string> {
  const enc = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(SECRET),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(message))
  return b64urlEncodeBytes(new Uint8Array(sig))
}

function generateSessionId(): string {
  const bytes = new Uint8Array(16)
  crypto.getRandomValues(bytes)
  return b64urlEncodeBytes(bytes)
}

export async function buildDemoToken(input: {
  company: string
  name: string
  email: string
  credits?: number
}) {
  const expiresAt = Date.now() + DEMO_TOKEN_TTL_MS
  const sessionId = generateSessionId()
  const claims: DemoClaims = {
    sessionId,
    company: input.company,
    name: input.name,
    email: input.email,
    credits: input.credits ?? DEMO_CREDITS_DEFAULT,
    issuedAt: Date.now(),
    expiresAt,
  }
  const payload = b64urlEncodeBytes(new TextEncoder().encode(JSON.stringify(claims)))
  const sig = await hmacBase64Url(payload)
  return { token: `${payload}.${sig}`, claims }
}

export async function verifyDemoToken(token: string | null | undefined): Promise<DemoClaims | null> {
  if (!token) return null
  try {
    const [payload, sig] = token.split('.')
    if (!payload || !sig) return null
    const expectedSig = await hmacBase64Url(payload)
    if (expectedSig !== sig) return null
    const claims = JSON.parse(new TextDecoder().decode(b64urlDecode(payload))) as DemoClaims
    if (!claims || typeof claims.expiresAt !== 'number') return null
    if (typeof claims.sessionId !== 'string' || !claims.sessionId) return null
    if (Date.now() > claims.expiresAt) return null
    return claims
  } catch {
    return null
  }
}
