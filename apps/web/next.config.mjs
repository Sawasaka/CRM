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
  // Dropbox配下だとビルドキャッシュが同期で壊れるので、環境変数でDropbox外に逃がす
  ...(process.env.NEXT_DIST_DIR ? { distDir: process.env.NEXT_DIST_DIR } : {}),
  transpilePackages: ['@bgm/db', '@bgm/types'],
  // @prisma/clientは monorepo の packages/db 経由で利用するため、サーバー側で external 解決させる
  serverExternalPackages: ['@prisma/client', '.prisma/client'],
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [{ protocol: 'https', hostname: 'lh3.googleusercontent.com' }],
  },
  async redirects() {
    return [
      { source: '/services/gtm', destination: '/#gtm-download', permanent: true },
      { source: '/services/marketing-infrastructure', destination: '/#marketing-download', permanent: true },
      { source: '/company', destination: '/#company', permanent: true },
    ]
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
