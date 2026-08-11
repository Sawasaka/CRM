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
    url.port = ''
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

  if (host && MARKETING_HOSTS.has(host)) {
    if (pathname === '/') {
      const url = req.nextUrl.clone()
      url.pathname = '/corporate'
      return NextResponse.rewrite(url)
    }

    if (pathname === '/corporate') {
      const url = req.nextUrl.clone()
      url.pathname = '/'
      return NextResponse.redirect(url, 308)
    }

    const isLegacyService = pathname === '/lp' || pathname === '/services/rukisuma-lab'
    const isLegacyEditorial =
      pathname === '/media' ||
      pathname.startsWith('/media/') ||
      pathname === '/columns' ||
      pathname.startsWith('/columns/')

    if (isLegacyService || isLegacyEditorial) {
      const url = req.nextUrl.clone()
      url.pathname = '/services'
      url.search = ''
      return NextResponse.redirect(url, 308)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/:path*',
}
