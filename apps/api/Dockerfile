# Multi-stage build, run from the monorepo root:
#   docker build -f apps/api/Dockerfile -t url-shortener-api .
#
# The runner ships production dependencies only (no @nestjs/cli, typescript, jest, eslint, ...)
# plus the compiled dist and the Prisma schema/migrations needed by `prisma migrate deploy`
# (run from this image at deploy time).

# ---- Builder: full deps + Prisma client + compiled dist ----
FROM node:24-alpine AS builder

RUN apk add --no-cache openssl libc6-compat

WORKDIR /app
ENV CI=true
# No .git in the build context, so the root `prepare` (husky) has nothing to install.
ENV HUSKY=0
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/
COPY packages/types/package.json ./packages/types/

# corepack resolves pnpm from the `packageManager` field, so the image matches the lockfile.
RUN corepack enable
RUN pnpm install --frozen-lockfile

COPY apps/api ./apps/api
COPY packages/types ./packages/types
# Root tsconfig the app tsconfigs extend (needed by tsc and by loading prisma.config.ts).
COPY tsconfig.base.json ./

WORKDIR /app/apps/api

# The DB_* placeholders keep prisma.config.ts (whose datasource url is templated from them)
# loadable; real values come from the environment at runtime.
ENV DB_USER=build DB_PASS=build DB_HOST=localhost DB_PORT=5432 DB_NAME=build

RUN pnpm run prisma:generate
RUN pnpm run build

# ---- Runner: production dependencies + built artifacts only ----
FROM node:24-alpine AS runner

RUN apk add --no-cache openssl libc6-compat

WORKDIR /app
ENV CI=true
ENV NODE_ENV=production
ENV HUSKY=0
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/
COPY packages/types/package.json ./packages/types/

RUN corepack enable
# Production dependencies only (the Prisma CLI is a runtime dep — migrations run here).
RUN pnpm install --frozen-lockfile --prod

# Built app + the Prisma schema/migrations/config that `migrate deploy` reads + `.env.example`
# (AppModule validates required env keys against it at boot).
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/src/prisma ./apps/api/src/prisma
COPY --from=builder /app/apps/api/prisma.config.ts ./apps/api/prisma.config.ts
COPY --from=builder /app/apps/api/.env.example ./apps/api/.env.example

WORKDIR /app/apps/api

# Drop privileges: run as the unprivileged `node` user shipped in the base image.
USER node

EXPOSE 4000

# 127.0.0.1, not localhost: that also resolves to ::1, which the IPv4 listener refuses.
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD wget -qO- http://127.0.0.1:4000/health || exit 1

CMD ["node", "dist/main"]
