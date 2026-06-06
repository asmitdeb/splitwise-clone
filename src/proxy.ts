import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export default function proxy(request: NextRequest) {
  const userId = request.cookies.get('userId')?.value;
  const isLoginPage = request.nextUrl.pathname.startsWith('/login');

  if (!userId && !isLoginPage) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (userId && isLoginPage) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
