/**
 * 無料デモトークンの発行/検証ユーティリティ。
 * /api/demo-access/route.ts と /demo, /demo-app の両方で参照する。
 */

import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto'

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
  return Buffer.from(bytes).toString('base64url')
}

function b64urlDecode(input: string): Uint8Array {
  return new Uint8Array(Buffer.from(input, 'base64url'))
}

function hmacBase64Url(message: string): string {
  return createHmac('sha256', SECRET).update(message).digest('base64url')
}

function safeEqual(a: string, b: string): boolean {
  const left = Buffer.from(a)
  const right = Buffer.from(b)
  if (left.length !== right.length) return false
  return timingSafeEqual(left, right)
}

function generateSessionId(): string {
  return b64urlEncodeBytes(randomBytes(16))
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
    const expectedSig = hmacBase64Url(payload)
    if (!safeEqual(expectedSig, sig)) return null
    const claims = JSON.parse(new TextDecoder().decode(b64urlDecode(payload))) as DemoClaims
    if (!claims || typeof claims.expiresAt !== 'number') return null
    if (typeof claims.sessionId !== 'string' || !claims.sessionId) return null
    if (Date.now() > claims.expiresAt) return null
    return claims
  } catch {
    return null
  }
}
