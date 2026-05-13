import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import * as jose from 'jose'
import { ADMIN_COOKIE_NAME } from '@/lib/jwt'

export async function middleware(req: NextRequest) {
  if (req.nextUrl.pathname.startsWith('/dashboard')) {
    const token = req.cookies.get(ADMIN_COOKIE_NAME)?.value
    const secret = process.env.JWT_SECRET
    if (!token || !secret) {
      return NextResponse.redirect(new URL('/login', req.url))
    }
    try {
      await jose.jwtVerify(token, new TextEncoder().encode(secret))
    } catch {
      return NextResponse.redirect(new URL('/login', req.url))
    }
  }
  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*'],
}
