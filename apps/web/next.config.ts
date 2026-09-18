import type { NextConfig } from 'next';
import path from 'node:path';

const monorepoRoot = path.join(__dirname, '../..');
const isDevelopment = process.env.NODE_ENV === 'development';

// https only: from a local http build this would pin `localhost` to https for two years.
const servesHttps = (process.env.APP_URL ?? '').startsWith('https://');

// CSP keeps 'unsafe-inline' for Next's bootstrap, so it is no XSS net — the app renders no untrusted HTML.
const contentSecurityPolicy = [
  `default-src 'self'`,
  `script-src 'self' 'unsafe-inline'${isDevelopment ? " 'unsafe-eval'" : ''}`,
  `style-src 'self' 'unsafe-inline'`,
  `img-src 'self' data: blob:`,
  `font-src 'self' data:`,
  `connect-src 'self'${isDevelopment ? ' ws: http://localhost:*' : ''}`,
  `frame-ancestors 'none'`,
  `object-src 'none'`,
  `base-uri 'self'`,
  `form-action 'self'`,
]
  .join('; ')
  .concat(';');

const securityHeaders = [
  { key: 'Content-Security-Policy', value: contentSecurityPolicy },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  // Drop ambient access to sensor/geolocation APIs the app never uses.
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), browsing-topics=()',
  },
  ...(servesHttps
    ? [{ key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' }]
    : []),
];

const nextConfig: NextConfig = {
  // Self-contained server bundle (apps/web/server.js + minimal node_modules) for the Docker runner.
  output: 'standalone',
  // Next writes its own AGENTS.md/CLAUDE.md on dev; this repo documents itself.
  agentRules: false,
  outputFileTracingRoot: monorepoRoot,
  transpilePackages: ['@url-shortener/types'],
  poweredByHeader: false,
  turbopack: {
    root: monorepoRoot,
  },
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },
};

export default nextConfig;
