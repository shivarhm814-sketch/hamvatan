import { NextRequest, NextResponse } from 'next/server';

const TOKEN_COOKIE = 'esmaeili_token';

interface JwtPayload {
  role?: string;
}

// Not signature-verified — this is only a UX-level redirect. The backend independently
// verifies the JWT signature and enforces role-based access on every API request.
function decodeRole(token: string): string | null {
  try {
    const segment = token.split('.')[1];
    const base64 = segment.replace(/-/g, '+').replace(/_/g, '/');
    const json = atob(base64);
    return (JSON.parse(json) as JwtPayload).role ?? null;
  } catch {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const token = request.cookies.get(TOKEN_COOKIE)?.value;
  const role = token ? decodeRole(token) : null;

  if (!token || !role || role === 'CUSTOMER') {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('next', request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
