/**
 * /demo-app — デモのトップ。チャット型の体験デモを表示する。
 * ロジック・データは _components/DemoApp.tsx に切り出し(クライアント側)。
 */

import { verifyDemoToken } from '@/lib/demo-token'
import { DemoApp } from './_components/DemoApp'

export default async function DemoAppPage({
  searchParams,
}: {
  searchParams: Promise<{ t?: string }>
}) {
  const { t } = await searchParams
  const claims = await verifyDemoToken(t)
  if (!claims) return null // layout 側で ExpiredPage に振られる
  return <DemoApp claims={claims} />
}
