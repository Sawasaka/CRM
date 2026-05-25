/* eslint-env node */
/* global process */

import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// monorepoルート (bgm/) の .env.local を読み込み（DATABASE_URL 等を取得）
try {
  const rootEnvPath = resolve(__dirname, '../../.env.local')
  const content = readFileSync(rootEnvPath, 'utf-8')
  for (const line of content.split('\n')) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/)
    if (!m) continue
    const key = m[1]
    let value = m[2].trim()
    if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1)
    if (!process.env[key]) process.env[key] = value
  }
} catch {
  // ルート .env.local がない場合はスキップ
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@bgm/db', '@bgm/types'],
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [{ protocol: 'https', hostname: 'lh3.googleusercontent.com' }],
  },
  webpack(config) {
    config.resolve.extensionAlias = {
      ...(config.resolve.extensionAlias ?? {}),
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
    }
    return config
  },
}

export default nextConfig
