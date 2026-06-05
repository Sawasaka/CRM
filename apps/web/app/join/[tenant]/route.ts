import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@bgm/db'

const SIGNUP_TENANT_COOKIE = 'bgm_signup_tenant'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest, props: { params: Promise<{ tenant: string }> }) {
  const { tenant } = await props.params
  const slug = tenant.trim().toLowerCase()
  const origin = req.nextUrl.origin

  if (!/^[a-z0-9-]+$/.test(slug)) {
    return NextResponse.redirect(new URL('/login', origin))
  }

  const org = await prisma.organization.findUnique({
    where: { slug },
    select: { slug: true, lifecycleStatus: true },
  })
  if (!org || org.lifecycleStatus !== 'ACTIVE') {
    return NextResponse.redirect(new URL('/login', origin))
  }

  const loginUrl = new URL('/login', origin)
  loginUrl.searchParams.set('google', '1')
  loginUrl.searchParams.set('callbackUrl', `/?tenant=${org.slug}`)

  const response = NextResponse.redirect(loginUrl)
  response.cookies.set(SIGNUP_TENANT_COOKIE, org.slug, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60,
    path: '/',
  })
  return response
}
