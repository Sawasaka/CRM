import { NextResponse } from 'next/server'
import { RESEARCH_PRESETS } from '@/lib/research-presets'

export const dynamic = 'force-dynamic'

export async function GET() {
  return NextResponse.json({ presets: RESEARCH_PRESETS }, {
    headers: { 'Cache-Control': 'public, max-age=300' },
  })
}
