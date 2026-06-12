import { NextResponse, type NextRequest } from 'next/server'

const MARKETING_HOSTS = new Set([
  'rookiesmart-jp.com',
  'www.rookiesmart-jp.com',
  'hp.rookiesmart-jp.com',
])
const DEMO_HOSTS = new Set(['demo.rookiesmart-jp.com'])

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

    const tenant = req.nextUrl.searchParams.get('tenant')?.trim().toLowerCase() ?? ''
    const isDemoEntry =
      pathname === '/' &&
      req.nextUrl.searchParams.get('demo') === '1' &&
      !req.nextUrl.searchParams.has('demoSession') &&
      /^demo-[a-z0-9-]+$/.test(tenant)
    if (isDemoEntry) {
      const url = req.nextUrl.clone()
      url.pathname = '/demo/open'
      url.search = ''
      url.searchParams.set('tenant', tenant)
      const response = NextResponse.redirect(url)
      response.headers.set('x-robots-tag', 'noindex, nofollow, noarchive')
      return response
    }

    const response = NextResponse.next()
    response.headers.set('x-robots-tag', 'noindex, nofollow, noarchive')
    return response
  }

  if (host && DEMO_HOSTS.has(host)) {
    if (pathname === '/robots.txt') {
      return new NextResponse('User-agent: *\nDisallow: /\n', {
        headers: {
          'content-type': 'text/plain; charset=utf-8',
          'x-robots-tag': 'noindex, nofollow, noarchive',
        },
      })
    }

    if (pathname === '/' || pathname === '/access' || pathname === '/open') {
      const url = req.nextUrl.clone()
      url.pathname =
        pathname === '/access' ? '/demo/access' : pathname === '/open' ? '/demo/open' : '/'
      const response = pathname === '/' ? NextResponse.next() : NextResponse.rewrite(url)
      response.headers.set('x-robots-tag', 'noindex, nofollow, noarchive')
      return response
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
