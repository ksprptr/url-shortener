import { dependencies } from './data/dependencies.data';
import { HealthCheckResult, HealthCheckStatus, HealthIndicatorResults } from './types/health.types';
import { NextResponse } from 'next/server';

/**
 * Function representing an api route to check the health of the application and its dependencies
 */
export async function GET() {
  const results: HealthIndicatorResults = {};

  await Promise.all(
    dependencies.map(async (dep) => {
      try {
        const res = await fetch(dep.url, {
          method: 'GET',
          cache: 'no-store',
          signal: AbortSignal.timeout(2000),
        });

        results[dep.name] = {
          status: res.ok ? 'up' : 'down',
          statusCode: res.status,
          message: res.statusText,
        };
      } catch {
        results[dep.name] = { status: 'down' };
      }
    }),
  );

  const overallStatus: HealthCheckStatus = Object.values(results).every((r) => r.status === 'up')
    ? 'ok'
    : 'error';

  const info: HealthIndicatorResults = {};
  const error: HealthIndicatorResults = {};
  const details: HealthIndicatorResults = {};

  Object.entries(results).forEach(([name, indicator]) => {
    details[name] = { ...indicator };

    if (indicator.status === 'up') {
      info[name] = { status: 'up' };
    } else {
      error[name] = { status: 'down' };
    }
  });

  const response: HealthCheckResult = { status: overallStatus, info, error, details };

  return NextResponse.json(response, { status: overallStatus === 'ok' ? 200 : 503 });
}
