/**
 * /demo は廃止。トークン付きアクセスは /demo-app 配下にリダイレクトする。
 * 旧URLからの互換のため一定期間残す。
 */

import { redirect } from 'next/navigation'

export default async function DemoRedirectPage({
  searchParams,
}: {
  searchParams: Promise<{ t?: string }>
}) {
  const { t } = await searchParams
  if (t) {
    redirect(`/demo-app?t=${encodeURIComponent(t)}`)
  }
  redirect('/lp')
}
