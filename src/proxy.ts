import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

/** Routes accessibles sans être connecté. */
const PUBLIC_ROUTES = ['/', '/mobile-restricted'];

/** Routes qui doivent rester joignables quel que soit l'appareil ou la session. */
const BYPASS_ROUTES = ['/auth/callback'];

const MOBILE_UA =
  /Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i;

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (BYPASS_ROUTES.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // ── Blocage mobile ──
  const isMobile = MOBILE_UA.test(request.headers.get('user-agent') || '');
  const isRestrictedPage = pathname === '/mobile-restricted';

  if (isMobile && !isRestrictedPage) {
    return NextResponse.redirect(new URL('/mobile-restricted', request.url));
  }
  if (!isMobile && isRestrictedPage) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // ── Session ──
  const { response, user } = await updateSession(request);

  const isPublic = PUBLIC_ROUTES.includes(pathname);

  // Non connecté sur une route protégée → retour à l'accueil.
  if (!user && !isPublic) {
    const url = request.nextUrl.clone();
    url.pathname = '/';
    url.searchParams.set('redirectedFrom', pathname);
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Toutes les routes sauf :
     * - les routes d'API
     * - les fichiers statiques Next.js
     * - les fichiers d'assets (images, polices, favicon)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2?)$).*)',
  ],
};
