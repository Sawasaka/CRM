#!/usr/bin/env node

import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const rootDir = fileURLToPath(new URL('..', import.meta.url))
const envFiles = ['.env.local', '.env.production', '.env', 'apps/web/.env.local']

const env = {
  ...loadEnvFiles(),
  ...process.env,
}

const required = [
  ['NEXT_PUBLIC_APP_URL', isPublicUrl, '公開URL。localhost不可'],
  ['DATABASE_URL', hasValue, '本番DB接続URL'],
  ['DEMO_ACCESS_SECRET', isStrongSecret, 'デモURL署名用の長い秘密鍵'],
  ['RESEND_API_KEY', hasValue, 'デモ登録通知メール送信用'],
  ['CONTACT_FROM', hasValue, 'Resend送信元'],
  ['GOOGLE_CLIENT_ID', hasValue, '有料版Googleログイン用'],
  ['GOOGLE_CLIENT_SECRET', hasValue, '有料版Googleログイン用'],
]

const oneOf = [
  [
    '開発者/マスター組織ID',
    [
      ['BGM_TENANT_ID', hasValue],
      ['NEXT_PUBLIC_BGM_TENANT_ID', hasValue],
    ],
  ],
  [
    'NextAuth/Auth secret',
    [
      ['AUTH_SECRET', isStrongSecret],
      ['NEXTAUTH_SECRET', isStrongSecret],
    ],
  ],
]

const warnings = [
  ['AUTH_URL', isPublicUrl, '本番Auth URL。未設定でも動く場合がありますが、設定推奨'],
  ['NEXTAUTH_URL', isPublicUrl, '本番NextAuth URL。未設定でも動く場合がありますが、設定推奨'],
  ['DIRECT_URL', hasValue, 'Prisma direct URL。マイグレーション/運用で使う場合は設定推奨'],
  ['NEXT_PUBLIC_TURNSTILE_SITE_KEY', hasValue, 'Cloudflare Turnstile site key。公開フォームの不正対策として設定推奨'],
  ['TURNSTILE_SECRET_KEY', hasValue, 'Cloudflare Turnstile secret key。公開フォームの不正対策として設定推奨'],
]

const missing = []
const warn = []

for (const [key, validator, note] of required) {
  if (!validator(env[key])) missing.push(`${key} (${note})`)
}

for (const [label, candidates] of oneOf) {
  const ok = candidates.some(([, validator]) => validator())
  if (!ok) missing.push(`${label}: ${candidates.map(([name]) => name).join(' または ')}`)
}

for (const [key, validator, note] of warnings) {
  if (!validator(env[key])) warn.push(`${key} (${note})`)
}

if (!hasSharedRateLimitStore()) {
  warn.push(
    'UPSTASH_REDIS_REST_URL/TOKEN or KV_REST_API_URL/TOKEN (未設定時はインスタンス内メモリ制限のみ。公開運用では共有ストア推奨)'
  )
}

if (!existsSync(resolve(rootDir, '.vercel/project.json'))) {
  warn.push('.vercel/project.json (Vercelプロジェクト未連携。デプロイ前に vercel link が必要)')
}

console.log('Demo production readiness check')
console.log(`Loaded env files: ${envFiles.filter((file) => existsSync(resolve(rootDir, file))).join(', ') || '(none)'}`)

if (missing.length > 0) {
  console.error('\nMissing required settings:')
  for (const item of missing) console.error(`- ${item}`)
}

if (warn.length > 0) {
  console.warn('\nWarnings:')
  for (const item of warn) console.warn(`- ${item}`)
}

if (missing.length > 0) {
  console.error('\nResult: NOT READY')
  process.exit(1)
}

console.log('\nResult: READY')

function loadEnvFiles() {
  const parsed = {}
  for (const file of envFiles) {
    const path = resolve(rootDir, file)
    if (!existsSync(path)) continue
    const raw = readFileSync(path, 'utf8')
    for (const line of raw.split(/\r?\n/)) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue
      const match = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/)
      if (!match) continue
      const [, key, rawValue] = match
      parsed[key] = unquote(rawValue.trim())
    }
  }
  return parsed
}

function unquote(value) {
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1)
  }
  return value
}

function hasValue(value) {
  return typeof value === 'string' && value.trim().length > 0
}

function isStrongSecret(value) {
  return hasValue(value) && value.trim().length >= 32
}

function isPublicUrl(value) {
  if (!hasValue(value)) return false
  try {
    const url = new URL(value)
    if (url.protocol !== 'https:') return false
    const host = url.hostname.toLowerCase()
    return host !== 'localhost' && host !== '127.0.0.1' && host !== '::1'
  } catch {
    return false
  }
}

function hasSharedRateLimitStore() {
  return (
    (hasValue(env.UPSTASH_REDIS_REST_URL) && hasValue(env.UPSTASH_REDIS_REST_TOKEN)) ||
    (hasValue(env.KV_REST_API_URL) && hasValue(env.KV_REST_API_TOKEN))
  )
}
