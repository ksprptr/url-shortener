import { ShortenedUrl } from '@/utils/types/shortened-urls-types';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Middleware of the application
 */
export async function middleware(request: NextRequest) {
  const pathName = request.nextUrl.pathname;
  const splitPath = pathName.split('/').slice(2);

  if (pathName === '/l') return NextResponse.next();
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

/**
 * Configuration for the middleware
 */
export const config = {
  matcher: '/l/:path*',
};
