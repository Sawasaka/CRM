import { NextResponse, type NextRequest } from 'next/server'

const MARKETING_HOSTS = new Set([
  'rookiesmart-jp.com',
  'www.rookiesmart-jp.com',
  'hp.rookiesmart-jp.com',
])

export function middleware(req: NextRequest) {
  const host = req.headers.get('host')?.split(':')[0]?.toLowerCase()
  const pathname = req.nextUrl.pathname

  if (host === 'rookiesmart-jp.com') {
    const url = req.nextUrl.clone()
    url.protocol = 'https'
    url.host = 'www.rookiesmart-jp.com'
    return NextResponse.redirect(url, 301)
  }

  if (host === 'crm.rookiesmart-jp.com') {
    if (pathname === '/robots.txt') {
      return new NextResponse('User-agent: *\nDisallow: /\n', {
        headers: {
          'content-type': 'text/plain; charset=utf-8',
          'x-robots-tag': 'noindex, nofollow, noarchive',
        },
      })
    }

    const response = NextResponse.next()
    response.headers.set('x-robots-tag', 'noindex, nofollow, noarchive')
    return response
  }

  if (host && MARKETING_HOSTS.has(host) && pathname === '/') {
    const url = req.nextUrl.clone()
    url.pathname = '/lp'
    return NextResponse.rewrite(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/:path*',
}
