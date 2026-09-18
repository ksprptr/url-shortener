import { NextResponse } from 'next/server';

/**
 * Liveness endpoint (`GET /api/health`) for the container probe — public, uncached, no upstream call.
 **/
export function GET(): NextResponse {
  return NextResponse.json({ status: 'ok' }, { headers: { 'Cache-Control': 'no-store' } });
}
