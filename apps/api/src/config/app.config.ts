import { registerAs } from '@nestjs/config';

export const appConfig = registerAs('app', () => ({
  port: parseInt(process.env['APP_PORT']!, 10),
  nodeEnv: process.env['NODE_ENV']!,
  isProduction: process.env['NODE_ENV'] === 'production',
  isDevelopment: process.env['NODE_ENV'] === 'development',
  apiPrefix: '/api/v1' as const,
  corsAllowedOrigins: process.env['CORS_ALLOWED_ORIGINS']!.split(',').map((s) => s.trim()),
  // Public origin of the web app — every `shortUrl` the API returns is built from it.
  webAppUrl: process.env['WEB_APP_URL']!.replace(/\/$/, ''),
  // Trusted proxy hops (Express `trust proxy`) so `req.ip` resolves to the client; defaults to 1.
  trustProxyHops: parseInt(process.env['TRUST_PROXY_HOPS'] ?? '1', 10),
}));

export type AppConfig = ReturnType<typeof appConfig>;
