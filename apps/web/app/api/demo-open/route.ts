import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

export async function POST() {
  return NextResponse.json(
    { ok: false, error: '無料デモテナントは廃止されました。' },
    { status: 410 },
  )
}
