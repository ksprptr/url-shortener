import { INestApplication } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { Test } from '@nestjs/testing';

import { AppModule } from '@/app.module';
import { configureApp } from '@/app.setup';
import { PrismaService } from '@/prisma/prisma.service';

import { PrismaMock } from './prisma.mock';

/**
 * Boots the full AppModule for the e2e smoke tests with PrismaService mocked.
 **/
// Uses the same `configureApp` main.ts does, so the suite exercises the real guard/pipe pipeline.
export async function createTestApp(prisma: PrismaMock): Promise<INestApplication> {
  const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
    .overrideProvider(PrismaService)
    .useValue(prisma)
    .compile();

  const app = moduleRef.createNestApplication<NestExpressApplication>({ logger: false });

  configureApp(app);

  await app.init();

  return app;
}
