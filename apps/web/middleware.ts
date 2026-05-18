import { NextResponse, type NextRequest } from 'next/server'

const MARKETING_HOSTS = new Set([
  'rookiesmart-jp.com',
  'www.rookiesmart-jp.com',
  'hp.rookiesmart-jp.com',
])

export function middleware(req: NextRequest) {
  const host = req.headers.get('host')?.split(':')[0]?.toLowerCase()
  if (host && MARKETING_HOSTS.has(host) && req.nextUrl.pathname === '/') {
    const url = req.nextUrl.clone()
    url.pathname = '/lp'
    return NextResponse.rewrite(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/',
}
