import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import * as fs from 'fs';
import * as path from 'path';

import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { RateLimitModule } from './common/services/rate-limit/rate-limit.module';
import { appConfig } from './config/app.config';
import { authConfig } from './config/auth.config';
import { databaseConfig } from './config/database.config';
import { jwtConfig } from './config/jwt.config';
import { linksConfig } from './config/links.config';
import { rateLimitConfig } from './config/rate-limit.config';
import { redisConfig } from './config/redis.config';
import { AuthModule } from './modules/auth/auth.module';
import { AuthGuard } from './modules/auth/guards/auth.guard';
import { HealthModule } from './modules/health/health.module';
import { LinksModule } from './modules/links/links.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [path.join(__dirname, '..', '.env'), path.join(__dirname, '..', '.env.local')],

      load: [
        appConfig,
        authConfig,
        jwtConfig,
        databaseConfig,
        linksConfig,
        rateLimitConfig,
        redisConfig,
      ],
      validate: (config) => {
        const envExample = fs.readFileSync(path.join(__dirname, '..', '.env.example'), 'utf-8');

        const required = envExample
          .split('\n')
          .filter((line) => line.trim() && !line.startsWith('#'))
          .map((line) => line.split('=')[0].trim());
        const missing = required.filter((key) => !config[key]);
        if (missing.length > 0) {
          throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
        }

        // Reject a weak/placeholder access-JWT secret — a guessable secret means forgeable tokens.
        const weakSecrets = ['JWT_ACCESS_SECRET'].filter((key) => {
          const value = String(config[key] ?? '');
          return (
            value.length < 16 || /generate_me|change_me|your[_-]|example|secret_here/i.test(value)
          );
        });
        if (weakSecrets.length > 0) {
          throw new Error(
            `Weak or placeholder secrets (set strong random values, >= 16 chars): ${weakSecrets.join(', ')}`,
          );
        }

        // AUTH_PASSWORD holds a bcrypt hash, never the plaintext — a pasted password must fail loudly.
        const authPassword = String(config['AUTH_PASSWORD'] ?? '');
        if (!/^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/.test(authPassword)) {
          throw new Error(
            'AUTH_PASSWORD must be a bcrypt hash of the operator password, not the password itself. ' +
              'Generate one with: pnpm --filter api exec node -e ' +
              `"import('bcryptjs').then((b) => b.hash('your-password', 12)).then(console.log)"`,
          );
        }

        return config;
      },
    }),

    PrismaModule,
    RateLimitModule,

    AuthModule,
    HealthModule,
    LinksModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: AuthGuard },
    { provide: APP_FILTER, useClass: GlobalExceptionFilter },
  ],
})
export class AppModule {}
