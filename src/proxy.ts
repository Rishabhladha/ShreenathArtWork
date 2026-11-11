import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { PATHS } from '@/lib/paths';

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect admin paths except /admin/login
  if (pathname.startsWith(PATHS.admin.dashboard) && pathname !== PATHS.admin.login()) {
    const authSecret =
      process.env.NEXTAUTH_SECRET ||
      (process.env.NODE_ENV === 'production' ? undefined : 'dev_secret_key_change_in_production');
    if (!authSecret) {
      console.error('CRITICAL: NEXTAUTH_SECRET must be set in production environment.');
      const loginUrl = new URL(PATHS.admin.login(undefined, 'server_error'), request.url);
      return NextResponse.redirect(loginUrl);
    }

    const token = await getToken({
      req: request,
      secret: authSecret,
    });

    if (!token) {
      const loginUrl = new URL(PATHS.admin.login(pathname), request.url);
      return NextResponse.redirect(loginUrl);
    }

    if (token.role !== 'OWNER' && token.role !== 'STAFF') {
      const loginUrl = new URL(PATHS.admin.login(undefined, 'unauthorized'), request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Protect admin API paths
  if (pathname.startsWith('/api/admin')) {
    const authSecret =
      process.env.NEXTAUTH_SECRET ||
      (process.env.NODE_ENV === 'production' ? undefined : 'dev_secret_key_change_in_production');
    if (!authSecret) {
      return NextResponse.json({ error: 'Server authentication misconfiguration' }, { status: 500 });
    }

    const token = await getToken({
      req: request,
      secret: authSecret,
    });

    if (!token || (token.role !== 'OWNER' && token.role !== 'STAFF')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  // Security headers for all matched responses
  const response = NextResponse.next();
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
};
