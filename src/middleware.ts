import { ShortenedUrl } from '@/utils/types/shortened-urls.types';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { getCsrfSession } from './utils/functions/middleware.edge.functions';

/**
 * Middleware of the application
 */
export async function middleware(request: NextRequest) {
  const pathName = request.nextUrl.pathname;
  const splitPath = pathName.split('/').slice(2);
  const cookieStore = await cookies();

  if (!cookieStore.get('SESSION-ID') || !cookieStore.get('XSRF-TOKEN')) {
    const { csrfToken, sessionId } = await getCsrfSession();

    cookieStore.set('SESSION-ID', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
    });

    cookieStore.set('XSRF-TOKEN', csrfToken, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
    });
  }

  if (pathName.startsWith('/l')) {
    if (splitPath.length !== 1) return NextResponse.redirect(new URL('/not-found', request.url));

    const shortenedUrlId = splitPath[0];
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/shortened-urls/${shortenedUrlId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );

    if (!response.ok) return NextResponse.next();

    const shortenedUrl: ShortenedUrl = await response.json();

    if (shortenedUrl.expirationDate && new Date(shortenedUrl.expirationDate) < new Date()) {
      return NextResponse.redirect(new URL('/not-found', request.url));
    }

    return NextResponse.redirect(new URL(shortenedUrl.originUrl, request.url));
  }

  return NextResponse.next();
}

/**
 * Configuration for the middleware
 */
export const config = {
  matcher: '/((?!api|_next/static|_next/image|favicon.ico|robots.txt).*)',
};
