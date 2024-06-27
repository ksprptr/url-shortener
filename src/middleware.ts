import { NextRequest } from 'next/server';
import { ResponseData } from '@/utils/types/global-types';

/**
 * Middleware of the application
 */
export async function middleware(request: NextRequest) {
  const requestUrl = new URL(request.nextUrl.href);

  if (requestUrl.pathname === '/') {
    return;
  }

  const splitPath = requestUrl.pathname.split('/').slice(1);

  if (splitPath.length !== 1) {
    return;
  }

  const shortenedUrlId = splitPath[0];
  const response = await fetch('http://localhost:3000/api/link/' + shortenedUrlId);
  const responseBody: ResponseData = await response.json();

  if (responseBody.status === 302 && responseBody.redirectUrl) {
    return Response.redirect(responseBody.redirectUrl, 301);
  }
}

/**
 * Configuration for the middleware
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
